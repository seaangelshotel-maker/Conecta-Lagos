/**
 * Dados do responsável pela plataforma (exibidos na Política de Privacidade e nos Termos).
 * Ficam em app_settings/legal: leitura pública, gravação só do admin (regras já existentes).
 */
import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { getCurrentUser } from './dataService';
import { UserRole } from '../types';

export interface LegalSettings {
  companyName: string;   // razão social
  tradeName: string;     // nome fantasia
  cnpj: string;
  address: string;
  privacyEmail: string;  // canal do titular / encarregado
  dpoName: string;       // encarregado (DPO)
  updatedAt?: string;
}

export const EMPTY_LEGAL: LegalSettings = { companyName: '', tradeName: 'Lagos GO', cnpj: '', address: '', privacyEmail: '', dpoName: '' };
export const LEGAL_VERSION = '2026-11-11';

let _cache: LegalSettings | null = null;

export const getLegalSettings = async (force = false): Promise<LegalSettings> => {
  if (_cache && !force) return _cache;
  try {
    const s = await getDoc(doc(db, 'app_settings', 'legal'));
    _cache = { ...EMPTY_LEGAL, ...(s.exists() ? (s.data() as Partial<LegalSettings>) : {}) };
  } catch { _cache = { ...EMPTY_LEGAL }; }
  return _cache;
};

export const saveLegalSettings = async (v: LegalSettings) => {
  const u = getCurrentUser();
  if (!u || u.role !== UserRole.SUPER_ADMIN) throw new Error('Apenas o administrador pode alterar estes dados.');
  const clean = Object.fromEntries(Object.entries(v).map(([k, x]) => [k, typeof x === 'string' ? x.trim() : x])) as LegalSettings;
  const next = { ...clean, updatedAt: new Date().toISOString() };
  await setDoc(doc(db, 'app_settings', 'legal'), next);
  _cache = next;
  return next;
};

export const useLegalSettings = () => {
  const [legal, setLegal] = useState<LegalSettings>(_cache || EMPTY_LEGAL);
  useEffect(() => { let alive = true; getLegalSettings().then(l => alive && setLegal(l)); return () => { alive = false; }; }, []);
  return legal;
};
