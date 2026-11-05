// Banco em memória para o teste de navegador (persistido em sessionStorage).
const KEY = '__mock_fs__';
const load = () => {
  try { return JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch { return null; }
};
export const state = load() || { docs: {}, users: {}, currentUid: null, seq: 0 };
export const save = () => { try { sessionStorage.setItem(KEY, JSON.stringify(state)); } catch {} };
export const log = [];
window.__mockState = state;
window.__mockLog = log;

export const seed = (fn) => {
  if (state.seeded) return;
  fn(state);
  state.seeded = true;
  save();
};
