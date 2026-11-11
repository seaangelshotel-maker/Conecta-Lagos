// Escolha dos destaques editoriais da Home (matéria grande + subdestaques). Funções puras.

export interface EditorialConfig { leadId: string; subIds: string[] }
export const EDITORIAL_SUBS_MAX = 3;
export const EMPTY_EDITORIAL: EditorialConfig = { leadId: '', subIds: [] };

export const normalizeEditorial = (raw?: Partial<EditorialConfig> | null): EditorialConfig => {
  const leadId = typeof raw?.leadId === 'string' ? raw.leadId.trim() : '';
  const seen = new Set<string>(leadId ? [leadId] : []);
  const subIds: string[] = [];
  for (const id of Array.isArray(raw?.subIds) ? raw!.subIds! : []) {
    if (typeof id !== 'string' || !id.trim() || seen.has(id.trim())) continue;
    seen.add(id.trim());
    subIds.push(id.trim());
    if (subIds.length >= EDITORIAL_SUBS_MAX) break;
  }
  return { leadId, subIds };
};

interface Item { id: string; featured?: boolean; popular?: boolean }

/**
 * Destaque principal: o que o admin escolheu; sem escolha (ou se o conteúdo saiu do ar), o automático
 * (primeira matéria em destaque, depois o post mais recente). O automático NÃO depende da cidade da pessoa,
 * para o destaque ser o mesmo para todos.
 * Subdestaques: primeiro os escolhidos pelo admin, na ordem dele; o que faltar até 3 é completado
 * automaticamente (com prioridade geográfica, via `geoGuides`/`geoPosts`).
 */
export const pickEditorial = <T extends Item>(
  guides: T[], posts: T[], geoGuides: T[], geoPosts: T[], cfg?: Partial<EditorialConfig> | null,
): { lead: T | undefined; subs: T[]; autoLead: T | undefined; leadIsManual: boolean } => {
  const c = normalizeEditorial(cfg);
  const all = new Map<string, T>();
  [...guides, ...posts].forEach(p => { if (p?.id && !all.has(p.id)) all.set(p.id, p); });

  const autoLead = guides.find(g => g.featured) || posts[0] || guides[0];
  const manualLead = c.leadId ? all.get(c.leadId) : undefined;
  const lead = manualLead || autoLead;

  const used = new Set<string>(lead ? [lead.id] : []);
  const subs: T[] = [];
  for (const id of c.subIds) {
    const p = all.get(id);
    if (p && !used.has(p.id)) { used.add(p.id); subs.push(p); }
  }
  const autoPool = [...geoPosts.slice(0, 2), ...geoGuides.filter(g => g.featured || g.popular)];
  for (const p of autoPool) {
    if (subs.length >= EDITORIAL_SUBS_MAX) break;
    if (p && !used.has(p.id)) { used.add(p.id); subs.push(p); }
  }
  return { lead, subs: subs.slice(0, EDITORIAL_SUBS_MAX), autoLead, leadIsManual: !!manualLead };
};
