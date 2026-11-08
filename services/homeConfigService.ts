/**
 * Configuração da Home (quantos lugares por categoria e quais categorias aparecem).
 * Fica em app_settings/home_discovery: leitura pública, gravação só do admin (regras já existentes).
 */
import { useEffect, useMemo, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { getCurrentUser } from './dataService';
import { UserRole } from '../types';
import { DEFAULT_HOME_CONFIG, HomeDiscoveryConfig, MainCategory, buildCategories, normalizeConfig } from './discoverLogic';

const REF = () => doc(db, 'app_settings', 'home_discovery');
const EVENT = 'homeConfigUpdated';
let _cache: HomeDiscoveryConfig | null = null;
let _pending: Promise<HomeDiscoveryConfig> | null = null;

export const getHomeConfig = async (force = false): Promise<HomeDiscoveryConfig> => {
  if (_cache && !force) return _cache;
  if (_pending && !force) return _pending;
  _pending = getDoc(REF())
    .then(s => normalizeConfig(s.exists() ? (s.data() as any) : null))
    .catch(() => normalizeConfig(null))
    .then(c => { _cache = c; _pending = null; return c; });
  return _pending;
};

export const saveHomeConfig = async (cfg: HomeDiscoveryConfig) => {
  const u = getCurrentUser();
  if (!u || u.role !== UserRole.SUPER_ADMIN) throw new Error('Apenas o administrador pode alterar a Home.');
  const next = normalizeConfig({ ...cfg, updatedAt: new Date().toISOString() });
  await setDoc(REF(), JSON.parse(JSON.stringify(next)));
  _cache = next;
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(EVENT));
  return next;
};

/** Hook: configuração atual + categorias prontas (as ativas, na ordem do admin). */
export const useHomeConfig = () => {
  const [cfg, setCfg] = useState<HomeDiscoveryConfig>(_cache || normalizeConfig(DEFAULT_HOME_CONFIG));
  const [ready, setReady] = useState(!!_cache);
  useEffect(() => {
    let alive = true;
    const load = (force = false) => getHomeConfig(force).then(c => { if (alive) { setCfg(c); setReady(true); } });
    load();
    const onChange = () => load();
    window.addEventListener(EVENT, onChange);
    return () => { alive = false; window.removeEventListener(EVENT, onChange); };
  }, []);
  const categories: MainCategory[] = useMemo(() => buildCategories(cfg), [cfg]);
  return { config: cfg, categories, ready };
};
