/**
 * Direitos do titular (LGPD, art. 18): pedidos de privacidade e exportação dos próprios dados.
 * - Pedidos ficam em privacyRequests (a pessoa cria e acompanha; só o admin responde).
 * - A exportação junta, no aparelho, tudo o que as regras do banco deixam a pessoa ler sobre si.
 */
import { collection, collectionGroup, doc, getDoc, getDocs, orderBy, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { auth, db } from './firebase';

export * from './privacyModel';
import { PrivacyRequest, PrivacyRequestType, PrivacyRequestStatus, ExportPart, buildExport } from './privacyModel';

const newId = () => `pr_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export const createPrivacyRequest = async (
  type: PrivacyRequestType, message: string, who: { userId: string; userName: string; email: string }, residual?: Record<string, number>,
): Promise<PrivacyRequest> => {
  const req: PrivacyRequest = {
    id: newId(), userId: who.userId, userName: who.userName.slice(0, 160), email: (who.email || '').slice(0, 200),
    type, message: message.trim().slice(0, 2000), status: 'open', createdAt: new Date().toISOString(),
    ...(residual && Object.keys(residual).length ? { residual } : {}),
  };
  await setDoc(doc(db, 'privacyRequests', req.id), req);
  return req;
};

export const getMyPrivacyRequests = async (uid: string): Promise<PrivacyRequest[]> => {
  const snap = await getDocs(query(collection(db, 'privacyRequests'), where('userId', '==', uid)));
  return snap.docs.map(d => d.data() as PrivacyRequest).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
};

/** Admin: fila de pedidos (abertos primeiro, mais antigos antes: são os que vencem primeiro). */
export const listPrivacyRequests = async (): Promise<PrivacyRequest[]> => {
  const snap = await getDocs(query(collection(db, 'privacyRequests'), orderBy('createdAt', 'desc')));
  const all = snap.docs.map(d => d.data() as PrivacyRequest);
  return [...all.filter(r => r.status === 'open').sort((a, b) => a.createdAt.localeCompare(b.createdAt)), ...all.filter(r => r.status !== 'open')];
};

export const resolvePrivacyRequest = async (id: string, status: Exclude<PrivacyRequestStatus, 'open'>, note: string) => {
  await updateDoc(doc(db, 'privacyRequests', id), { status, resolvedAt: new Date().toISOString(), resolutionNote: note.trim().slice(0, 1000) });
};

/* ---------- exportação dos dados do titular ---------- */

const docs = (snap: { docs: { id: string; data: () => any }[] }) => snap.docs.map(d => ({ id: d.id, ...d.data() }));

/** Coleta o que as regras permitem ler sobre a própria pessoa; falha de uma parte não derruba as outras. */
export const collectMyData = async (): Promise<ReturnType<typeof buildExport>> => {
  const u = auth.currentUser;
  if (!u) throw new Error('Entre na sua conta para baixar seus dados.');
  const uid = u.uid;
  const part = async (key: string, label: string, fn: () => Promise<unknown>): Promise<ExportPart> => {
    try { return { key, label, data: await fn() }; } catch (e: any) { return { key, label, data: null, error: e?.code || 'sem acesso' }; }
  };
  const mine = (c: string, field: string) => async () => docs(await getDocs(query(collection(db, c), where(field, '==', uid))));
  const parts = await Promise.all([
    part('cadastro', 'Cadastro', async () => { const s = await getDoc(doc(db, 'users', uid)); return s.exists() ? s.data() : null; }),
    part('perfilPublico', 'Perfil público', async () => { const s = await getDoc(doc(db, 'public_profiles', uid)); return s.exists() ? s.data() : null; }),
    part('cuponsResgatados', 'Cupons resgatados', mine('redemptions', 'userId')),
    part('avaliacoes', 'Avaliações', mine('reviews', 'userId')),
    part('comentarios', 'Comentários', mine('blog_comments', 'userId')),
    part('pedidosDeEmpresa', 'Pedidos de empresa', mine('companyRequests', 'userId')),
    part('anunciosAjudaColaborativa', 'Anúncios da Ajuda Colaborativa', mine('opportunities', 'ownerId')),
    part('candidaturas', 'Candidaturas', async () => docs(await getDocs(query(collectionGroup(db, 'applications'), where('applicantId', '==', uid))))),
    part('eventos', 'Eventos que você cadastrou', mine('events', 'ownerId')),
    part('denuncias', 'Denúncias feitas por você', mine('reports', 'reporterId')),
    part('pedidosDePrivacidade', 'Pedidos de privacidade', mine('privacyRequests', 'userId')),
  ]);
  return buildExport(uid, u.email || '', parts);
};

/** Baixa o JSON no aparelho (nada é enviado a terceiros). */
export const downloadMyData = async (): Promise<void> => {
  const data = await collectMyData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `meus-dados-lagos-go-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
