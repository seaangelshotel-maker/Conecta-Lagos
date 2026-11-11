import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowUp, ArrowDown, Loader2, Save, Search, Star, Plus, X, RotateCcw } from 'lucide-react';
import type { BlogPost } from '../../types';
import { getBlogPosts } from '../../services/dataService';
import { getGuideArticles } from '../../services/guideService';
import { getHomeConfig, saveHomeConfig } from '../../services/homeConfigService';
import { EDITORIAL_SUBS_MAX, EditorialConfig, normalizeEditorial, pickEditorial } from '../../services/editorialPick';
import { norm } from '../../services/discoverLogic';
import { TypeBadge, formatDate } from '../FeedCards';
import { useNotification } from '../NotificationSystem';

/** Admin: escolhe a matéria grande da Home (destaque principal) e até 3 subdestaques. */
export const HomeEditorialAdmin: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { notify } = useNotification();
  const [cfg, setCfg] = useState<Awaited<ReturnType<typeof getHomeConfig>> | null>(null);
  const [ed, setEd] = useState<EditorialConfig>({ leadId: '', subIds: [] });
  const [guides, setGuides] = useState<BlogPost[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [q, setQ] = useState('');
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    getHomeConfig(true).then(c => { setCfg(c); setEd(normalizeEditorial(c.editorial)); });
    getGuideArticles(false).then(setGuides).catch(() => setGuides([]));
    getBlogPosts().then(p => setPosts((p || []).filter(x => x.status !== 'draft'))).catch(() => setPosts([]));
  }, []);

  const all = useMemo(() => {
    const seen = new Set<string>();
    return [...guides, ...posts].filter(p => p?.id && p.title && !seen.has(p.id) && !!seen.add(p.id));
  }, [guides, posts]);
  const byId = useMemo(() => new Map(all.map(p => [p.id, p])), [all]);
  // O que a Home mostraria hoje: serve para mostrar "Automático: <título>" quando o admin não escolheu.
  const current = useMemo(() => pickEditorial(guides, posts, guides, posts, ed), [guides, posts, ed]);

  if (!cfg) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-ocean-600" /></div>;

  const update = (next: EditorialConfig) => { setEd(normalizeEditorial(next)); setDirty(true); };
  const setLead = (id: string) => update({ leadId: id, subIds: ed.subIds.filter(x => x !== id) });
  const addSub = (id: string) => {
    if (id === ed.leadId || ed.subIds.includes(id)) return;
    if (ed.subIds.length >= EDITORIAL_SUBS_MAX) { notify('warning', `No máximo ${EDITORIAL_SUBS_MAX} subdestaques. Remova um para adicionar outro.`); return; }
    update({ ...ed, subIds: [...ed.subIds, id] });
  };
  const moveSub = (i: number, d: -1 | 1) => {
    const list = [...ed.subIds]; const j = i + d;
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    update({ ...ed, subIds: list });
  };
  const save = async () => {
    setSaving(true);
    try {
      const saved = await saveHomeConfig({ ...cfg, editorial: ed });
      setCfg(saved); setEd(normalizeEditorial(saved.editorial)); setDirty(false);
      notify('success', 'Destaques da Home salvos.');
    } catch (e: any) { notify('error', e?.message || 'Não foi possível salvar.'); }
    finally { setSaving(false); }
  };

  const term = norm(q);
  const list = all.filter(p => !term || norm([p.title, p.excerpt, p.category].join(' ')).includes(term)).slice(0, 40);
  const lead = current.lead;

  return (
    <div className="space-y-6 pb-24" data-testid="home-editorial-admin">
      <button onClick={onBack} className="flex items-center gap-2 text-ocean-600 font-black text-xs uppercase"><ArrowLeft size={16} /> Voltar</button>
      <div>
        <h2 className="text-xl font-black text-ocean-950">Destaques editoriais da Home</h2>
        <p className="text-sm text-slate-500 mt-1">Escolha a matéria grande da Home e os subdestaques ao lado. Sem escolha, a Home usa o destaque automático.</p>
      </div>

      <section className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3" aria-label="Destaque principal">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-black text-ocean-950 flex items-center gap-1.5"><Star size={16} className="text-amber-500" /> Destaque principal (grande)</h3>
          {ed.leadId && <button onClick={() => update({ ...ed, leadId: '' })} data-testid="he-auto" className="text-xs font-bold text-slate-500 flex items-center gap-1"><RotateCcw size={13} /> Voltar ao automático</button>}
        </div>
        {lead ? (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-ocean-50 border border-ocean-100">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1"><TypeBadge post={lead} /><span className="text-[11px] font-bold text-ocean-700">{current.leadIsManual ? 'Escolhido por você' : 'Automático'}</span></div>
              <p className="font-black text-ocean-950 leading-snug" data-testid="he-lead-title">{lead.title}</p>
            </div>
          </div>
        ) : <p className="text-sm text-slate-400">Ainda não há matérias publicadas.</p>}
      </section>

      <section className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3" aria-label="Subdestaques">
        <h3 className="font-black text-ocean-950">Subdestaques (até {EDITORIAL_SUBS_MAX})</h3>
        {ed.subIds.length === 0 && <p className="text-sm text-slate-500">Nenhum escolhido: a Home completa sozinha com notícias recentes e matérias em destaque.</p>}
        {ed.subIds.map((id, i) => {
          const p = byId.get(id);
          return (
            <div key={id} className="flex items-center gap-2 p-3 rounded-xl border border-slate-100" data-testid={`he-sub-${id}`}>
              <span className="w-6 h-6 rounded-full bg-ocean-600 text-white text-xs font-black flex items-center justify-center shrink-0">{i + 1}</span>
              <p className="flex-1 min-w-0 text-sm font-bold text-ocean-950 truncate">{p ? p.title : 'Conteúdo removido'}</p>
              <button onClick={() => moveSub(i, -1)} disabled={i === 0} aria-label="Subir" className="p-1.5 text-slate-500 disabled:opacity-30"><ArrowUp size={15} /></button>
              <button onClick={() => moveSub(i, 1)} disabled={i === ed.subIds.length - 1} aria-label="Descer" className="p-1.5 text-slate-500 disabled:opacity-30"><ArrowDown size={15} /></button>
              <button onClick={() => update({ ...ed, subIds: ed.subIds.filter(x => x !== id) })} aria-label="Remover" className="p-1.5 text-red-500"><X size={15} /></button>
            </div>
          );
        })}
      </section>

      <section className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3" aria-label="Escolher conteúdo">
        <h3 className="font-black text-ocean-950">Escolher conteúdo</h3>
        <label className="flex items-center gap-2 bg-slate-100 rounded-xl px-3 h-11">
          <Search size={15} className="text-slate-400" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar matéria, notícia ou dica" aria-label="Buscar conteúdo" className="flex-1 bg-transparent border-0 outline-none ring-0 focus:ring-0 p-0 text-sm" />
        </label>
        <div className="space-y-2 max-h-[28rem] overflow-y-auto">
          {list.length === 0 && <p className="text-sm text-slate-400">Nada encontrado.</p>}
          {list.map(p => {
            const isLead = ed.leadId === p.id || (!ed.leadId && current.lead?.id === p.id);
            const isSub = ed.subIds.includes(p.id);
            return (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1"><TypeBadge post={p} /><span className="text-[11px] text-slate-400 font-semibold">{formatDate(p.date)}</span></div>
                  <p className="text-sm font-bold text-ocean-950 leading-snug">{p.title}</p>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  <button onClick={() => setLead(p.id)} disabled={ed.leadId === p.id} data-testid={`he-lead-${p.id}`}
                    className="text-[11px] font-black px-3 py-1.5 rounded-full bg-ocean-600 text-white disabled:opacity-40">{isLead ? 'Principal' : 'Tornar principal'}</button>
                  <button onClick={() => addSub(p.id)} disabled={isSub || isLead} data-testid={`he-add-${p.id}`}
                    className="text-[11px] font-black px-3 py-1.5 rounded-full border border-slate-200 text-ocean-700 disabled:opacity-40 flex items-center justify-center gap-1">{isSub ? 'Subdestaque' : <><Plus size={12} /> Subdestaque</>}</button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-slate-100 p-3 flex items-center justify-between gap-3 above-bottom-nav">
        <p className="text-xs font-bold text-amber-700">{dirty ? 'Há alterações não salvas.' : ''}</p>
        <button onClick={save} disabled={!dirty || saving} data-testid="he-save" className="h-11 px-6 rounded-xl bg-ocean-600 text-white text-sm font-black flex items-center gap-2 disabled:opacity-40">
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Salvar
        </button>
      </div>
    </div>
  );
};
