/** Regras puras da caixa de avisos (sininho): juntar listas, limitar tamanho e contar não lidos. */
export interface InboxItem { id: string; title: string; body: string; link: string; at: string; kind?: 'geral' | 'evento' | 'cupom' }

export const INBOX_MAX = 20;

/** Coloca o item novo no topo, remove repetido (mesmo id) e mantém só os mais recentes. */
export const addToInbox = (items: InboxItem[] | undefined, item: InboxItem, max = INBOX_MAX): InboxItem[] =>
  [item, ...(items || []).filter(i => i.id !== item.id)]
    .sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0))
    .slice(0, max);

/** Junta avisos gerais e pessoais, do mais novo para o mais antigo. */
export const mergeInbox = (...lists: (InboxItem[] | undefined)[]): InboxItem[] => {
  const seen = new Set<string>();
  return lists.flatMap(l => l || [])
    .filter(i => i && i.id && i.title && !seen.has(i.id) && !!seen.add(i.id))
    .sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0))
    .slice(0, INBOX_MAX);
};

/** Quantos avisos chegaram depois da última vez que a pessoa abriu o sino. */
export const unreadCount = (items: InboxItem[], lastSeenIso: string | null | undefined): number =>
  items.filter(i => !lastSeenIso || i.at > lastSeenIso).length;

export const inboxId = (at: string, title: string) => `${at}|${title}`.slice(0, 120);
