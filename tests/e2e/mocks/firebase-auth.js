import { state, save } from './store.js';

const listeners = [];
const makeUser = (uid) => {
  const u = state.users[uid];
  if (!u) return null;
  return {
    uid, email: u.email, displayName: u.name, photoURL: null, emailVerified: !!u.emailVerified,
    getIdToken: async () => `mock-token-${uid}`,
  };
};

const authObj = {
  app: { options: {} },
  get currentUser() { return state.currentUid ? makeUser(state.currentUid) : null; },
  signOut: async () => { state.currentUid = null; save(); notify(); },
};

const notify = () => listeners.forEach(cb => cb(authObj.currentUser));
const err = (code) => Object.assign(new Error(code), { code });

export const getAuth = () => authObj;
export const onAuthStateChanged = (_auth, cb) => {
  listeners.push(cb);
  setTimeout(() => cb(authObj.currentUser), 0);
  return () => {};
};
export const signInWithEmailAndPassword = async (_a, email, pass) => {
  const entry = Object.entries(state.users).find(([, u]) => u.email.toLowerCase() === String(email).toLowerCase());
  if (!entry) throw err('auth/invalid-credential');
  if (entry[1].password !== pass) throw err('auth/invalid-credential');
  state.currentUid = entry[0]; save(); notify();
  return { user: makeUser(entry[0]) };
};
export const createUserWithEmailAndPassword = async (_a, email, pass) => {
  const uid = 'u' + (++state.seq) + Math.random().toString(36).slice(2, 6);
  state.users[uid] = { email, password: pass, name: email.split('@')[0] };
  state.currentUid = uid; save(); notify();
  return { user: makeUser(uid) };
};
export class GoogleAuthProvider { setCustomParameters() {} }
export const signInWithPopup = async () => { throw err('auth/popup-blocked'); };
export const sendPasswordResetEmail = async () => {};
export const updatePassword = async () => {};
