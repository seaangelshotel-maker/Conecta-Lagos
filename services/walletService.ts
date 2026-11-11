/**
 * Carteira de economia do usuário: lida dos próprios resgates (coleção `redemptions`).
 * O usuário só consegue ler e criar resgates PENDING; quem muda para USED é o estabelecimento.
 */
import { useEffect, useMemo, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';
import { RedemptionView, sortRedemptions, walletSummary } from './walletRules';

export const WALLET_CHANGED = 'walletUpdated';

let _cache: { uid: string; items: RedemptionView[] } | null = null;

export const getMyRedemptions = async (uid: string, force = false): Promise<RedemptionView[]> => {
  if (!uid) return [];
  if (_cache && _cache.uid === uid && !force) return _cache.items;
  const snap = await getDocs(query(collection(db, 'redemptions'), where('userId', '==', uid)));
  const items = sortRedemptions(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) } as RedemptionView)));
  _cache = { uid, items };
  return items;
};

/** Hook: resgates e totais do usuário. Recarrega quando ele pega um cupom ou o estabelecimento confirma. */
export const useWallet = (uid?: string | null) => {
  const [items, setItems] = useState<RedemptionView[]>(_cache && uid && _cache.uid === uid ? _cache.items : []);
  const [loading, setLoading] = useState(!!uid && !(_cache && _cache.uid === uid));
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!uid) { setItems([]); setLoading(false); return; }
    let alive = true;
    const load = (force: boolean) =>
      getMyRedemptions(uid, force)
        .then(l => { if (alive) { setItems(l); setFailed(false); setLoading(false); } })
        .catch(e => { console.warn('Carteira: não foi possível carregar os resgates.', e); if (alive) { setFailed(true); setLoading(false); } });
    load(false);
    const on = () => load(true);
    window.addEventListener(WALLET_CHANGED, on);
    return () => { alive = false; window.removeEventListener(WALLET_CHANGED, on); };
  }, [uid]);

  const summary = useMemo(() => walletSummary(items), [items]);
  return { items, summary, loading, failed };
};
