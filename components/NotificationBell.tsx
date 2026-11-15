import React, { useCallback, useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { cacheGet, cacheSet } from '../services/readCache';
import { InboxItem, mergeInbox, unreadCount } from '../services/inboxRules';
import { isNative } from '../services/native';

const SEEN_KEY = 'lagosgo_inbox_seen_v1';
const TTL = 10 * 60_000;

const getSeen = () => { try { return localStorage.getItem(SEEN_KEY); } catch { return null; } };
const setSeen = (iso: string) => { try { localStorage.setItem(SEEN_KEY, iso); } catch { /* ok */ } };

/** Abre um caminho interno do app sem recarregar. */
export const goToLink = (link: string) => {
  try { window.history.pushState({}, '', link || '/'); window.dispatchEvent(new PopStateEvent('popstate')); } catch { window.location.assign(link || '/'); }
};

const load = async (uid?: string | null, force = false): Promise<InboxItem[]> => {
  const general = (!force && cacheGet<InboxItem[]>('inbox', TTL)) ||
    await getDoc(doc(db, 'meta', 'inbox')).then(s => (s.exists() ? ((s.data() as any).items as InboxItem[]) : [])).then(l => { cacheSet('inbox', l); return l; }).catch(() => [] as InboxItem[]);
  const personal = uid
    ? ((!force && cacheGet<InboxItem[]>('inbox_user:' + uid, TTL)) ||
      await getDoc(doc(db, 'inbox_user', uid)).then(s => (s.exists() ? ((s.data() as any).items as InboxItem[]) : [])).then(l => { cacheSet('inbox_user:' + uid, l); return l; }).catch(() => [] as InboxItem[]))
    : [];
  return mergeInbox(general, personal);
};

const when = (iso: string) => {
  const d = new Date(iso); const diff = Date.now() - d.getTime();
  if (diff < 3_600_000) return `${Math.max(1, Math.round(diff / 60_000))} min`;
  if (diff < 86_400_000) return `${Math.round(diff / 3_600_000)} h`;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
};

/** Sininho: lista dos últimos avisos dentro do app. Não depende do push; só complementa. */
export const NotificationBell: React.FC<{ uid?: string | null }> = ({ uid }) => {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [open, setOpen] = useState(false);
  const [seen, setSeenState] = useState<string | null>(getSeen());

  const refresh = useCallback((force = false) => { load(uid, force).then(setItems).catch(() => {}); }, [uid]);
  useEffect(() => { const t = setTimeout(() => refresh(), 2500); return () => clearTimeout(t); }, [refresh]);

  // Tocar no push no app nativo abre a tela do aviso.
  useEffect(() => {
    if (!isNative()) return;
    const P = (window as any).Capacitor?.Plugins?.PushNotifications;
    let handle: any;
    Promise.resolve(P?.addListener?.('pushNotificationActionPerformed', (a: any) => {
      const link = a?.notification?.data?.link; if (typeof link === 'string' && link.startsWith('/')) goToLink(link);
    })).then(h => { handle = h; }).catch(() => {});
    return () => { try { handle?.remove?.(); } catch { /* ok */ } };
  }, []);

  const unread = unreadCount(items, seen);
  const toggle = () => {
    if (!open) refresh(true);
    else { const now = new Date().toISOString(); setSeen(now); setSeenState(now); }
    setOpen(!open);
  };
  const close = () => { const now = new Date().toISOString(); setSeen(now); setSeenState(now); setOpen(false); };

  return (
    <>
      <button onClick={toggle} aria-label="Avisos" data-testid="bell" style={{ top: 'calc(env(safe-area-inset-top, 0px) + 10px)' }}
        className="fixed right-3 z-40 w-10 h-10 rounded-full bg-white/95 border border-slate-200 shadow-md flex items-center justify-center text-ocean-700 md:right-6 md:top-3">
        <Bell size={19} />
        {unread > 0 && <span data-testid="bell-count" className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center border border-white">{unread > 9 ? '9+' : unread}</span>}
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-start md:justify-end" onClick={close} data-testid="bell-panel">
          <div onClick={e => e.stopPropagation()} className="bg-white w-full md:w-[380px] md:mt-16 md:mr-6 rounded-t-3xl md:rounded-3xl max-h-[80vh] overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-black text-ocean-950 text-lg">Avisos</h3>
              <button onClick={close} aria-label="Fechar" className="p-2 text-slate-500"><X size={18} /></button>
            </div>
            {items.length === 0 ? (
              <div className="text-center py-10">
                <Bell size={36} className="mx-auto text-slate-300 mb-3" />
                <p className="font-black text-ocean-950">Você não tem avisos</p>
                <p className="text-sm text-slate-500">Aqui aparecem os avisos de eventos, cupons e novidades de Lagos.</p>
              </div>
            ) : items.map(i => (
              <button key={i.id} onClick={() => { close(); goToLink(i.link); }} className={`w-full text-left rounded-2xl p-3 mb-2 border ${!seen || i.at > seen ? 'bg-ocean-50 border-ocean-100' : 'bg-white border-slate-100'}`}>
                <p className="font-black text-sm text-ocean-950">{i.title}</p>
                <p className="text-xs text-slate-600">{i.body}</p>
                <p className="text-[11px] text-slate-400 mt-1">{when(i.at)}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
