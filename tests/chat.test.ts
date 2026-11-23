import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chatStart, chatSend, chatBlock, chatReport, chatRead } from '../server/chat';
import { cleanMessage, resolveChannels, sendBlockReason, bumpWindow, threadIdFor, isParticipant } from '../services/chatRules';

// Banco de mentira com caminhos planos ("col/id" e "col/id/sub/id").
const makeDb = (seed: Record<string, any>) => {
  const store: Record<string, any> = JSON.parse(JSON.stringify(seed));
  let n = 0;
  const setDeep = (o: any, key: string, v: any) => { if (!key.includes('.')) { o[key] = v; return; } const [h, ...r] = key.split('.'); o[h] = o[h] || {}; setDeep(o[h], r.join('.'), v); };
  const docRef = (path: string): any => ({
    id: path.split('/').pop(), path,
    get: async () => ({ exists: path in store, id: path.split('/').pop(), data: () => store[path] }),
    set: async (v: any, o?: any) => { store[path] = o?.merge ? { ...(store[path] || {}), ...v } : JSON.parse(JSON.stringify(v)); },
    update: async (v: any) => { const cur = store[path]; if (!cur) throw new Error('no doc'); for (const [k, val] of Object.entries(v)) setDeep(cur, k, val); },
    collection: (name: string) => colRef(`${path}/${name}`),
  });
  const colRef = (path: string): any => ({
    doc: (id?: string) => docRef(`${path}/${id || 'auto' + (++n)}`),
    get: async () => ({ docs: Object.keys(store).filter(k => k.startsWith(path + '/') && k.split('/').length === path.split('/').length + 1).map(k => ({ id: k.split('/').pop(), data: () => store[k] })) }),
    orderBy: (f: string, dir: string) => ({ limit: (m: number) => ({ get: async () => {
      const ds = Object.keys(store).filter(k => k.startsWith(path + '/') && k.split('/').length === path.split('/').length + 1).map(k => store[k]).sort((a, b) => dir === 'desc' ? (a[f] < b[f] ? 1 : -1) : (a[f] < b[f] ? -1 : 1)).slice(0, m);
      return { docs: ds.map(d => ({ data: () => d })) };
    } }) }),
  });
  const db: any = {
    collection: colRef,
    batch: () => { const ops: Array<() => Promise<void>> = []; return { set: (r: any, v: any) => { ops.push(() => r.set(v)); }, update: (r: any, v: any) => { ops.push(() => r.update(v)); }, commit: async () => { for (const o of ops) await o(); } }; },
    runTransaction: async (fn: any) => fn({ get: (r: any) => r.get(), set: (r: any, v: any) => r.set(v) }),
  };
  return { db, store };
};

const NOW = Date.parse('2026-11-23T15:00:00Z');
const seed = () => makeDb({
  'users/c1': { name: 'Maria Silva' }, 'users/c2': { name: 'João' }, 'users/own': { name: 'Zé', email: 'ze@x.com' },
  'plans/pro': { name: 'Pro', showChat: true }, 'plans/basic': { name: 'Básico' },
  'businesses/b1': { name: 'Quiosque', ownerId: 'own', plan: 'pro', ordersEnabled: true, orderChannels: 'both', status: 'APPROVED' },
  'businesses/b2': { name: 'Padaria', ownerId: 'own2', plan: 'basic', ordersEnabled: true, orderChannels: 'chat', status: 'APPROVED' },
});

test('texto: limpa controle, limita tamanho, recusa vazio', () => {
  assert.equal(cleanMessage('  oi\u0000‮  '), 'oi');
  assert.equal(cleanMessage('   '), null);
  assert.equal(cleanMessage('a'.repeat(1001)), null);
  assert.equal(cleanMessage(42), null);
  assert.equal(cleanMessage('a\n\n\n\nb'), 'a\n\nb');
});

test('canais: chat só com plano liberado e pedidos ligados; só-chat esconde WhatsApp', () => {
  assert.deepEqual(resolveChannels({ ordersEnabled: true }, { showChat: true }), { whatsapp: true, chat: false });
  assert.deepEqual(resolveChannels({ ordersEnabled: true, orderChannels: 'both' }, { showChat: true }), { whatsapp: true, chat: true });
  assert.deepEqual(resolveChannels({ ordersEnabled: true, orderChannels: 'chat' }, { showChat: true }), { whatsapp: false, chat: true });
  assert.deepEqual(resolveChannels({ ordersEnabled: true, orderChannels: 'chat' }, { showChat: false }), { whatsapp: true, chat: false });
  assert.deepEqual(resolveChannels({ ordersEnabled: false, orderChannels: 'both' }, { showChat: true }), { whatsapp: true, chat: false });
  assert.deepEqual(resolveChannels({ ordersEnabled: true, orderChannels: 'both', chatAccess: 'deny' }, { showChat: true }), { whatsapp: true, chat: false });
  assert.deepEqual(resolveChannels({ ordersEnabled: true, orderChannels: 'both', chatAccess: 'allow' }, { showChat: false }), { whatsapp: true, chat: true });
  assert.deepEqual(resolveChannels({ ordersEnabled: true, orderChannels: 'both', chatAccess: 'plan' }, { showChat: true }), { whatsapp: true, chat: true });
});

test('limite por hora e bloqueio', () => {
  assert.equal(bumpWindow({ start: NOW, count: 120 }, NOW + 1000), null);
  assert.deepEqual(bumpWindow({ start: NOW, count: 120 }, NOW + 3_700_000), { start: NOW + 3_700_000, count: 1 });
  assert.match(sendBlockReason({ customerId: 'a', ownerId: 'b', blockedBy: 'b' }, 'a')!, /bloqueada/);
  assert.equal(sendBlockReason({ customerId: 'a', ownerId: 'b' }, 'a'), null);
  assert.ok(sendBlockReason({ customerId: 'a', ownerId: 'b' }, 'x'));
  assert.equal(isParticipant({ customerId: 'a', ownerId: 'b' }, 'x'), false);
});

test('sem aceitar o aviso, a primeira conversa é recusada (412)', async () => {
  const { db, store } = seed();
  const r = await chatStart(db, 'c1', { businessId: 'b1', text: 'Olá' }, NOW);
  assert.deepEqual([r.ok, r.status], [false, 412]);
  assert.equal(store['chat_consents/c1'], undefined);
});

test('aceitando o aviso: cria conversa, guarda o aceite e notifica o dono', async () => {
  const { db, store } = seed();
  const r = await chatStart(db, 'c1', { businessId: 'b1', text: 'Quero 2 pizzas', kind: 'order', acceptTerms: true, _ip: '1.2.3.4' }, NOW);
  assert.equal(r.ok, true);
  assert.equal(r.threadId, threadIdFor('b1', 'c1'));
  const t = store[`chat_threads/${r.threadId}`];
  assert.deepEqual([t.ownerId, t.customerId, t.customerName, t.unread.own], ['own', 'c1', 'Maria', 1]);
  assert.equal(store['chat_consents/c1'].version, 1);
  assert.equal(store['chat_consents/c1'].ip, '1.2.3.4');
  assert.equal(r.notify?.ownerId, 'own');
  // segunda conversa não pede o aceite de novo
  const r2 = await chatStart(db, 'c1', { businessId: 'b1', text: 'Mais uma coisa' }, NOW + 5000);
  assert.equal(r2.ok, true);
});

test('empresa sem plano com chat ou com canal só WhatsApp não abre chat', async () => {
  const { db } = seed();
  assert.equal((await chatStart(db, 'c1', { businessId: 'b2', text: 'oi', acceptTerms: true }, NOW)).status, 403);
  const s2 = makeDb({ 'users/c1': { name: 'M' }, 'plans/pro': { name: 'Pro', showChat: true }, 'businesses/b3': { name: 'X', ownerId: 'o', plan: 'pro', ordersEnabled: true, status: 'APPROVED' } });
  assert.equal((await chatStart(s2.db, 'c1', { businessId: 'b3', text: 'oi', acceptTerms: true }, NOW)).status, 403);
});

test('dono não conversa com a própria empresa; usuário bloqueado não usa o chat', async () => {
  const { db, store } = seed();
  assert.equal((await chatStart(db, 'own', { businessId: 'b1', text: 'oi', acceptTerms: true }, NOW)).status, 400);
  store['users/c2'].isBlocked = true;
  assert.equal((await chatStart(db, 'c2', { businessId: 'b1', text: 'oi', acceptTerms: true }, NOW)).status, 403);
});

test('só participante envia; terceiro não descobre que a conversa existe', async () => {
  const { db, store } = seed();
  const { threadId } = await chatStart(db, 'c1', { businessId: 'b1', text: 'oi', acceptTerms: true }, NOW);
  const bad = await chatSend(db, 'c2', { threadId, text: 'invasor' }, NOW + 1000);
  assert.deepEqual([bad.ok, bad.status], [false, 404]);
  const ok = await chatSend(db, 'own', { threadId, text: 'Já separo!' }, NOW + 2000);
  assert.equal(ok.ok, true);
  assert.equal(store[`chat_threads/${threadId}`].unread.c1, 1);
  assert.equal(store[`chat_threads/${threadId}`].unread.own, 0);
  assert.equal(Object.keys(store).filter(k => k.includes('/messages/')).length, 2);
  assert.equal((await chatSend(db, 'c1', { threadId: '../users/own', text: 'x' }, NOW)).ok, false);
});

test('bloqueio: impede envio e só quem bloqueou desbloqueia', async () => {
  const { db } = seed();
  const { threadId } = await chatStart(db, 'c1', { businessId: 'b1', text: 'oi', acceptTerms: true }, NOW);
  assert.equal((await chatBlock(db, 'own', { threadId, block: true })).ok, true);
  assert.equal((await chatSend(db, 'c1', { threadId, text: 'oi?' }, NOW + 1)).status, 403);
  assert.equal((await chatStart(db, 'c1', { businessId: 'b1', text: 'oi' }, NOW + 2)).status, 403);
  assert.equal((await chatBlock(db, 'c1', { threadId, block: false })).status, 403);
  assert.equal((await chatBlock(db, 'own', { threadId, block: false })).ok, true);
  assert.equal((await chatSend(db, 'c1', { threadId, text: 'voltei' }, NOW + 3)).ok, true);
});

test('denúncia guarda as últimas mensagens para o admin e marca a conversa', async () => {
  const { db, store } = seed();
  const { threadId } = await chatStart(db, 'c1', { businessId: 'b1', text: 'oi', acceptTerms: true }, NOW);
  await chatSend(db, 'own', { threadId, text: 'me passa seu pix' }, NOW + 1000);
  const r = await chatReport(db, 'c1', { threadId, reason: 'golpe' }, NOW + 2000);
  assert.equal(r.ok, true);
  const rep = store[`chat_reports/${r.reportId}`];
  assert.deepEqual([rep.reason, rep.reporterId, rep.reportedId, rep.messages.length], ['golpe', 'c1', 'own', 2]);
  assert.equal(store[`chat_threads/${threadId}`].reported, true);
  assert.equal((await chatRead(db, 'c1', { threadId })).ok, true);
});

test('limite de mensagens por hora na conversa', async () => {
  const { db } = seed();
  const { threadId } = await chatStart(db, 'c1', { businessId: 'b1', text: 'oi', acceptTerms: true }, NOW);
  let last: any;
  for (let i = 0; i < 125; i++) last = await chatSend(db, 'c1', { threadId, text: 'spam ' + i }, NOW + 10 + i);
  assert.equal(last.status, 429);
});
