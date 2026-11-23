/** Registro do caminho de cada pessoa logada na jornada do plano (para ver quem parou no meio). */
import { useEffect, useState } from 'react';
import { collection, doc, getDoc, onSnapshot, orderBy, query, limit, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { FunnelStage, funnelDocId, maxStage } from './planJourney';

export interface FunnelRecord {
  id: string; userId: string; userName: string; userEmail: string; planId: string; planName: string; period: string;
  price: number; total: number; step: number; maxStep: number; totalSteps: number; stage: FunnelStage;
  startedAt: string; updatedAt: string; checkoutAt?: string;
}

export const loadFunnel = async (uid: string, planId: string): Promise<FunnelRecord | null> => {
  try { const s = await getDoc(doc(db, 'plan_funnel', funnelDocId(uid, planId))); return s.exists() ? (s.data() as FunnelRecord) : null; } catch { return null; }
};

/** Melhor esforço: nunca atrapalha a pessoa se falhar. */
export const trackFunnel = async (
  user: { id: string; name: string; email: string },
  plan: { id: string; name: string; period: string; price: number; total: number },
  p: { step: number; totalSteps: number; stage: FunnelStage; prev: FunnelRecord | null },
): Promise<FunnelRecord | null> => {
  try {
    const now = new Date().toISOString();
    const rec: Record<string, unknown> = {
      userId: user.id, userName: String(user.name || '').slice(0, 120), userEmail: String(user.email || '').slice(0, 160),
      planId: plan.id, planName: String(plan.name).slice(0, 80), period: plan.period, price: plan.price, total: plan.total,
      step: p.step, maxStep: Math.max(p.prev?.maxStep ?? 0, p.step), totalSteps: p.totalSteps,
      stage: maxStage(p.prev?.stage, p.stage), startedAt: p.prev?.startedAt || now, updatedAt: now,
    };
    if (p.stage === 'checkout') rec.checkoutAt = now; else if (p.prev?.checkoutAt) rec.checkoutAt = p.prev.checkoutAt;
    await setDoc(doc(db, 'plan_funnel', funnelDocId(user.id, plan.id)), rec);
    return { id: funnelDocId(user.id, plan.id), ...(rec as any) };
  } catch { return null; }
};

/** Só o admin consegue ler (regras). */
export const useFunnel = () => {
  const [items, setItems] = useState<FunnelRecord[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const q = query(collection(db, 'plan_funnel'), orderBy('updatedAt', 'desc'), limit(300));
    return onSnapshot(q, s => { setItems(s.docs.map(d => ({ id: d.id, ...(d.data() as any) }))); setLoading(false); }, () => setLoading(false));
  }, []);
  return { items, loading };
};
