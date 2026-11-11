/**
 * Exclusão da própria conta (exigência da Google Play e direito do titular na LGPD).
 * Apaga: comentários do Feed, perfil público, documento do usuário e o login (Firebase Auth).
 * Empresas cadastradas continuam como ficha pública do Guia até a equipe tratar o pedido (explicado na política).
 */
import { collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { deleteUser, signOut } from 'firebase/auth';
import { auth, db } from './firebase';
import { disablePush } from './pushService';
import { createPrivacyRequest } from './privacyService';

export type DeleteResult = { ok: true } | { ok: false; reason: 'not-logged' | 'recent-login' | 'error'; message: string };

export const deleteMyAccount = async (): Promise<DeleteResult> => {
  const u = auth.currentUser;
  if (!u) return { ok: false, reason: 'not-logged', message: 'Entre na sua conta para excluí-la.' };
  try {
    await disablePush().catch(() => undefined);
    // Pedidos de empresa ainda pendentes/recusados são da própria pessoa: apaga junto.
    const mine = await getDocs(query(collection(db, 'companyRequests'), where('userId', '==', u.uid))).catch(() => null);
    if (mine) await Promise.all(mine.docs.map(d => deleteDoc(d.ref).catch(() => undefined)));
    // O que as regras não deixam a pessoa apagar (resgates) vira um aviso para a equipe tratar em até 15 dias.
    const redemptions = await getDocs(query(collection(db, 'redemptions'), where('userId', '==', u.uid))).catch(() => null);
    const residual: Record<string, number> = {};
    if (redemptions?.size) residual.redemptions = redemptions.size;
    await createPrivacyRequest('account_deleted', 'Conta excluída pelo próprio titular. Tratar os dados que sobraram.',
      { userId: u.uid, userName: u.displayName || 'Usuário', email: u.email || '' }, residual).catch(() => undefined);
    const comments = await getDocs(query(collection(db, 'blog_comments'), where('userId', '==', u.uid)));
    await Promise.all(comments.docs.map(d => deleteDoc(d.ref).catch(() => undefined)));
    await deleteDoc(doc(db, 'public_profiles', u.uid)).catch(() => undefined);
    await deleteDoc(doc(db, 'users', u.uid));
    await deleteUser(u);
    try { ['lagos_go_session_v1', 'lagos_go_liked_posts', 'lagos_go_connected_posts', 'last_seen_coupon_count'].forEach(k => localStorage.removeItem(k)); sessionStorage.removeItem('user_gps'); } catch { /* ok */ }
    await signOut(auth).catch(() => undefined);
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('dataUpdated'));
    return { ok: true };
  } catch (e: any) {
    if (e?.code === 'auth/requires-recent-login') {
      return { ok: false, reason: 'recent-login', message: 'Por segurança, saia e entre de novo na sua conta e repita a exclusão.' };
    }
    return { ok: false, reason: 'error', message: 'Não foi possível concluir a exclusão agora. Tente de novo ou fale com a equipe pelo canal de privacidade.' };
  }
};
