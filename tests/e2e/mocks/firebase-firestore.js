// Firestore simulado (sem regras de segurança): suficiente para exercitar os fluxos da interface.
import { state, save, log } from './store.js';

const SENT = '__sentinel__';
export const serverTimestamp = () => ({ [SENT]: 'ts' });
export const increment = (n) => ({ [SENT]: 'inc', n });
export const arrayUnion = (...v) => ({ [SENT]: 'union', v });
export const arrayRemove = (...v) => ({ [SENT]: 'remove', v });
export const deleteField = () => ({ [SENT]: 'delete' });

const newId = () => (Date.now().toString(36) + Math.random().toString(36).slice(2, 10));
const clone = (x) => JSON.parse(JSON.stringify(x));

export const getFirestore = () => ({ __db: true });

const join = (parts) => parts.filter(Boolean).join('/');

export const collection = (base, ...segs) => {
  const basePath = base && base.path ? base.path : '';
  return { type: 'collection', path: join([basePath, ...segs]), id: segs[segs.length - 1] };
};
export const doc = (base, ...segs) => {
  if (base && base.type === 'collection' && segs.length === 0) {
    const id = newId();
    return { type: 'doc', path: `${base.path}/${id}`, id };
  }
  const basePath = base && base.path ? base.path : '';
  const path = join([basePath, ...segs]);
  return { type: 'doc', path, id: path.split('/').pop() };
};
export const collectionGroup = (_db, id) => ({ type: 'group', id, path: `**/${id}` });

const resolve = (prev, value) => {
  if (value && typeof value === 'object' && value[SENT]) {
    if (value[SENT] === 'ts') return new Date().toISOString();
    if (value[SENT] === 'inc') return (Number(prev) || 0) + value.n;
    if (value[SENT] === 'union') { const base = Array.isArray(prev) ? prev : []; return [...base, ...value.v.filter(x => !base.includes(x))]; }
    if (value[SENT] === 'delete') return DELETE;
    if (value[SENT] === 'remove') return (Array.isArray(prev) ? prev : []).filter(x => !value.v.includes(x));
  }
  return value;
};

const DELETE = Symbol('delete');
const applyPatch = (target, patch) => {
  Object.entries(patch).forEach(([k, v]) => {
    if (v === undefined) throw Object.assign(new Error(`Function setDoc() called with invalid data. Unsupported field value: undefined (found in field ${k})`), { code: 'invalid-argument' });
    if (k.includes('.')) {
      const parts = k.split('.');
      let cur = target;
      parts.slice(0, -1).forEach(p => { cur[p] = cur[p] || {}; cur = cur[p]; });
      const last = parts[parts.length - 1];
      const r = resolve(cur[last], v);
      if (r === DELETE) delete cur[last]; else cur[last] = r;
    } else {
      const r = resolve(target[k], v);
      if (r === DELETE) delete target[k]; else target[k] = r;
    }
  });
  return target;
};

const checkUndefined = (obj, path = '') => {
  if (obj === undefined) throw Object.assign(new Error(`Unsupported field value: undefined (${path})`), { code: 'invalid-argument' });
  if (obj && typeof obj === 'object' && !obj[SENT]) Object.entries(obj).forEach(([k, v]) => checkUndefined(v, path ? `${path}.${k}` : k));
};

const write = (ref, data, opts) => {
  checkUndefined(data);
  const prev = state.docs[ref.path];
  const base = opts && opts.merge && prev ? clone(prev) : {};
  state.docs[ref.path] = applyPatch(base, data);
  log.push({ op: opts && opts.merge ? 'merge' : 'set', path: ref.path });
};

const snap = (path) => {
  const data = state.docs[path];
  return { id: path.split('/').pop(), ref: { path }, exists: () => data !== undefined, data: () => (data === undefined ? undefined : clone(data)) };
};

export const getDoc = async (ref) => snap(ref.path);
export const setDoc = async (ref, data, opts) => { write(ref, data, opts); save(); };
export const updateDoc = async (ref, data) => {
  if (!state.docs[ref.path]) throw Object.assign(new Error('No document to update: ' + ref.path), { code: 'not-found' });
  checkUndefined(data);
  applyPatch(state.docs[ref.path], data);
  log.push({ op: 'update', path: ref.path });
  save();
};
export const deleteDoc = async (ref) => { delete state.docs[ref.path]; log.push({ op: 'delete', path: ref.path }); save(); };
export const addDoc = async (colRef, data) => { const ref = doc(colRef); write(ref, data); save(); return ref; };

export const writeBatch = () => {
  const ops = [];
  return {
    set: (ref, data, opts) => ops.push(() => write(ref, data, opts)),
    update: (ref, data) => ops.push(() => { checkUndefined(data); applyPatch(state.docs[ref.path], data); }),
    delete: (ref) => ops.push(() => { delete state.docs[ref.path]; }),
    commit: async () => { ops.forEach(f => f()); log.push({ op: 'batch', n: ops.length }); save(); },
  };
};

export const where = (field, op, value) => ({ kind: 'where', field, op, value });
export const orderBy = (field, dir = 'asc') => ({ kind: 'orderBy', field, dir });
export const limit = (n) => ({ kind: 'limit', n });
export const startAfter = (snapshot) => ({ kind: 'startAfter', path: snapshot && snapshot.ref ? snapshot.ref.path : snapshot && snapshot.__path });
export const query = (ref, ...constraints) => ({ ...ref, constraints: [...(ref.constraints || []), ...constraints] });

const get = (obj, field) => field.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);

const inCollection = (ref, path) => {
  const parts = path.split('/');
  const parent = parts.slice(0, -1).join('/');
  if (ref.type === 'group') return parts[parts.length - 2] === ref.id;
  return parent === ref.path;
};

export const getDocs = async (ref) => {
  let paths = Object.keys(state.docs).filter(p => inCollection(ref, p));
  let rows = paths.map(p => ({ path: p, data: state.docs[p] }));
  for (const c of ref.constraints || []) {
    if (c.kind === 'where') {
      rows = rows.filter(r => {
        const v = get(r.data, c.field);
        switch (c.op) {
          case '==': return v === c.value;
          case '!=': return v !== c.value;
          case 'in': return c.value.includes(v);
          case '>=': return v >= c.value;
          case '<=': return v <= c.value;
          case '>': return v > c.value;
          case '<': return v < c.value;
          case 'array-contains': return Array.isArray(v) && v.includes(c.value);
          default: throw new Error('op não suportada: ' + c.op);
        }
      });
    }
  }
  for (const c of (ref.constraints || []).filter(c => c.kind === 'orderBy').reverse()) {
    rows = rows.filter(r => get(r.data, c.field) !== undefined);
    rows.sort((a, b) => {
      const x = get(a.data, c.field), y = get(b.data, c.field);
      const cmp = x < y ? -1 : x > y ? 1 : 0;
      return c.dir === 'desc' ? -cmp : cmp;
    });
  }
  const sa = (ref.constraints || []).find(c => c.kind === 'startAfter');
  if (sa && sa.path) { const i = rows.findIndex(r => r.path === sa.path); if (i >= 0) rows = rows.slice(i + 1); }
  const lim = (ref.constraints || []).find(c => c.kind === 'limit');
  if (lim) rows = rows.slice(0, lim.n);
  const docs = rows.map(r => snap(r.path));
  return { docs, empty: docs.length === 0, size: docs.length, forEach: (f) => docs.forEach(f) };
};

export const onSnapshot = (ref, cb) => {
  getDocs(ref).then(cb);
  return () => {};
};
