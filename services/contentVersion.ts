/**
 * Carimbo de versão do conteúdo do Guia (1 documento: meta/content_version).
 * Quem publica/edita negócios "carimba"; o app lê só esse documento (1 leitura por abertura)
 * e reaproveita a cópia guardada no aparelho enquanto o carimbo não mudar.
 * Tudo falha em silêncio: sem carimbo, vale a validade curta da cópia (como antes).
 */
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { cacheClear } from './readCache';

const REF = () => doc(db, 'meta', 'content_version');
let _remote: Promise<string | null> | null = null;

/** Carimbo atual no banco (lido uma vez por abertura do app). null = não foi possível ler. */
export const getRemoteContentVersion = (): Promise<string | null> => {
  if (!_remote) {
    _remote = getDoc(REF())
      .then(s => (s.exists() ? String((s.data() as any).v ?? '0') : '0'))
      .catch(() => null);
  }
  return _remote;
};

/** Marca que o conteúdo mudou. Chame depois de salvar negócios. Nunca lança erro. */
export const bumpContentVersion = async (): Promise<void> => {
  try {
    const now = Date.now();
    await setDoc(REF(), { v: String(now), t: now });
    _remote = Promise.resolve(String(now));
    cacheClear('businesses2');
  } catch { /* sem permissão ou offline: a validade da cópia cobre */ }
};
