import React, { useEffect } from 'react';
import { Bell } from 'lucide-react';
import { goToLink, useInboxUnread } from '../services/inboxService';
import { isNative } from '../services/native';

/** Botão do sino com a bolinha de não lidos. Abre a página de avisos. */
export const BellButton: React.FC<{ uid?: string | null; onClick: () => void; className?: string }> = ({ uid, onClick, className = '' }) => {
  const unread = useInboxUnread(uid);
  return (
    <button onClick={onClick} aria-label="Avisos" data-testid="bell" className={`relative flex items-center justify-center ${className}`}>
      <Bell size={18} />
      {unread > 0 && <span data-testid="bell-count" className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black min-w-[17px] h-[17px] px-1 rounded-full flex items-center justify-center border border-white">{unread > 9 ? '9+' : unread}</span>}
    </button>
  );
};

/** No app nativo, tocar na notificação do celular abre a tela do aviso. */
export const PushTapHandler: React.FC = () => {
  useEffect(() => {
    if (!isNative()) return;
    const P = (window as any).Capacitor?.Plugins?.PushNotifications;
    let handle: any;
    Promise.resolve(P?.addListener?.('pushNotificationActionPerformed', (a: any) => {
      const link = a?.notification?.data?.link; if (typeof link === 'string' && link.startsWith('/')) goToLink(link);
    })).then(h => { handle = h; }).catch(() => {});
    return () => { try { handle?.remove?.(); } catch { /* ok */ } };
  }, []);
  return null;
};
