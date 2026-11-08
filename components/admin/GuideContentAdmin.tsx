import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Loader2, Eye, EyeOff, Star, Flame, Save, Search, Sparkles } from 'lucide-react';
import { BlogPost, BusinessProfile } from '../../types';
import { getBusinesses } from '../../services/dataService';
import { getGuideArticles, previewGuideImport, runGuideImport, setGuideArticleFlags, saveBusinessExperienceTags, GuideImportPreview } from '../../services/guideService';
import { resolveRelated, EXPERIENCE_TAGS, norm } from '../../services/discoverLogic';
import { C } from '../../data/guideArticles';
import { useNotification } from '../NotificationSystem';

const COLLECTIONS = Object.values(C) as string[];
const inputCls = 'w-full border border-slate-200 rounded-xl px-3 py-2 text-sm';

/** Admin: importar as matérias, publicar/despublicar, destacar, montar coleções, ligar a empresas e curar tags de experiência. */
export const GuideContentAdmin: React.FC = () => {
    const { notify } = useNotification();
    const [articles, setArticles] = useState<BlogPost[]>([]);
    const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
    const [preview, setPreview] = useState<GuideImportPreview | null>(null);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [openId, setOpenId] = useState<string | null>(null);
    const [draft, setDraft] = useState<Partial<BlogPost>>({});
    const [tagQuery, setTagQuery] = useState('');
    const [relQuery, setRelQuery] = useState('');

    const reload = async () => {
        setLoading(true);
        try {
            const [a, b] = await Promise.all([getGuideArticles(true, true), getBusinesses()]);
            setArticles(a); setBusinesses(b); setPreview(await previewGuideImport());
        } catch (e: any) { notify('error', e?.message || 'Não foi possível ler o banco.'); }
        finally { setLoading(false); }
    };
    useEffect(() => { reload(); }, []);

    const run = async (fn: () => Promise<any>, ok: string) => {
        setBusy(true);
        try { await fn(); notify('success', ok); await reload(); }
        catch (e: any) { notify('error', e?.message || 'Erro ao salvar.'); }
        finally { setBusy(false); }
    };

    const importAll = () => run(async () => { await runGuideImport(); }, 'Matérias cadastradas.');
    const toggle = (a: BlogPost, k: 'featured' | 'popular') => run(() => setGuideArticleFlags(a.id, { [k]: !a[k] }), 'Atualizado.');
    const setStatus = (a: BlogPost) => run(() => setGuideArticleFlags(a.id, { status: a.status === 'draft' ? 'published' : 'draft' }), a.status === 'draft' ? 'Matéria publicada.' : 'Matéria despublicada.');

    const open = (a: BlogPost) => { setOpenId(openId === a.id ? null : a.id); setDraft({ excerpt: a.excerpt, tags: a.tags || [], collections: a.collections || [], related: a.related ? { ...a.related } : {} }); setRelQuery(''); };
    const saveDraft = (a: BlogPost) => run(() => setGuideArticleFlags(a.id, draft as any), 'Matéria salva.');

    const relFound = useMemo(() => (draft.related ? resolveRelated(draft.related, businesses) : []), [draft.related, businesses]);
    const relMatches = useMemo(() => relQuery.trim() ? businesses.filter(b => norm(b.name).includes(norm(relQuery))).slice(0, 6) : [], [relQuery, businesses]);
    const tagMatches = useMemo(() => tagQuery.trim() ? businesses.filter(b => norm(b.name).includes(norm(tagQuery))).slice(0, 8) : [], [tagQuery, businesses]);

    const toggleTag = (b: BusinessProfile, t: string) => {
        const cur = b.experienceTags || [];
        const next = cur.includes(t) ? cur.filter(x => x !== t) : [...cur, t];
        run(() => saveBusinessExperienceTags(b, next), 'Curadoria salva.');
    };

    return (
        <div className="bg-white rounded-[2rem] border border-slate-100 p-6 space-y-5" data-testid="guide-admin">
            <div className="flex items-start gap-3">
                <div className="bg-ocean-50 text-ocean-600 p-3 rounded-2xl"><BookOpen size={22} /></div>
                <div>
                    <h3 className="font-black text-ocean-950 text-lg">Descubra: matérias e curadoria</h3>
                    <p className="text-sm text-slate-500">Cadastre as 20 matérias, publique ou despublique, destaque, monte coleções, ligue a empresas reais e marque as experiências (gratuito, famílias, casais…) que alimentam os filtros.</p>
                </div>
            </div>

            {loading ? <Loader2 className="animate-spin text-ocean-600" /> : (
                <>
                    {preview && preview.toCreate.length > 0 && (
                        <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 flex flex-wrap items-center gap-3 justify-between">
                            <p className="text-sm text-sky-900"><b>{preview.toCreate.length}</b> matérias ainda não cadastradas ({preview.alreadyExists} já existem; suas edições não são sobrescritas).</p>
                            <button onClick={importAll} disabled={busy} className="bg-ocean-600 text-white font-black px-5 py-2.5 rounded-xl text-sm disabled:opacity-60">Cadastrar matérias</button>
                        </div>
                    )}

                    <div className="space-y-2" data-testid="guide-admin-list">
                        {articles.length === 0 && <p className="text-sm text-slate-500">Nenhuma matéria cadastrada ainda.</p>}
                        {articles.map(a => (
                            <div key={a.id} className="border border-slate-100 rounded-2xl" data-testid={`guide-row-${a.slug}`}>
                                <div className="p-3 flex flex-wrap items-center gap-2">
                                    <button onClick={() => open(a)} className="flex-1 min-w-[200px] text-left font-bold text-sm text-ocean-950">{a.title}</button>
                                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${a.status === 'draft' ? 'bg-slate-100 text-slate-500' : 'bg-emerald-100 text-emerald-700'}`}>{a.status === 'draft' ? 'Rascunho' : 'Publicada'}</span>
                                    <button disabled={busy} onClick={() => toggle(a, 'featured')} aria-label="Destacar" title="Destaque" className={`p-2 rounded-lg ${a.featured ? 'bg-amber-100 text-amber-700' : 'bg-slate-50 text-slate-400'}`}><Star size={15} /></button>
                                    <button disabled={busy} onClick={() => toggle(a, 'popular')} aria-label="Popular" title="Popular" className={`p-2 rounded-lg ${a.popular ? 'bg-rose-100 text-rose-700' : 'bg-slate-50 text-slate-400'}`}><Flame size={15} /></button>
                                    <button disabled={busy} onClick={() => setStatus(a)} aria-label={a.status === 'draft' ? 'Publicar' : 'Despublicar'} className="p-2 rounded-lg bg-slate-50 text-slate-600">{a.status === 'draft' ? <Eye size={15} /> : <EyeOff size={15} />}</button>
                                </div>
                                {openId === a.id && (
                                    <div className="border-t border-slate-100 p-4 space-y-4 bg-slate-50/60">
                                        <label className="block text-xs font-bold text-slate-500">Resumo do card
                                            <textarea className={inputCls + ' mt-1'} rows={3} value={draft.excerpt || ''} onChange={e => setDraft({ ...draft, excerpt: e.target.value })} />
                                        </label>
                                        <label className="block text-xs font-bold text-slate-500">Tags (separadas por vírgula)
                                            <input className={inputCls + ' mt-1'} value={(draft.tags || []).join(', ')} onChange={e => setDraft({ ...draft, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })} />
                                        </label>
                                        <div>
                                            <p className="text-xs font-bold text-slate-500 mb-1">Coleções (seções da tela Descubra)</p>
                                            <div className="flex flex-wrap gap-2">
                                                {COLLECTIONS.map(c => {
                                                    const on = (draft.collections || []).includes(c);
                                                    return <button key={c} onClick={() => setDraft({ ...draft, collections: on ? (draft.collections || []).filter(x => x !== c) : [...(draft.collections || []), c] })} className={`text-xs font-bold px-3 py-1.5 rounded-full border ${on ? 'bg-ocean-600 text-white border-ocean-600' : 'bg-white text-slate-600 border-slate-200'}`}>{c}</button>;
                                                })}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-500 mb-1">Empresas ligadas (somente cadastros reais) — {relFound.length} encontradas</p>
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {(draft.related?.businessIds || []).map(id => {
                                                    const b = businesses.find(x => x.id === id);
                                                    return <button key={id} onClick={() => setDraft({ ...draft, related: { ...draft.related, businessIds: (draft.related?.businessIds || []).filter(x => x !== id) } })} className="text-xs bg-white border border-slate-200 rounded-full px-3 py-1">{b?.name || id} ✕</button>;
                                                })}
                                            </div>
                                            <input className={inputCls} placeholder="Buscar empresa para ligar" value={relQuery} onChange={e => setRelQuery(e.target.value)} />
                                            {relMatches.map(b => (
                                                <button key={b.id} onClick={() => { setDraft({ ...draft, related: { ...draft.related, businessIds: Array.from(new Set([...(draft.related?.businessIds || []), b.id])) } }); setRelQuery(''); }} className="block w-full text-left text-sm px-3 py-2 hover:bg-white rounded-lg">{b.name} <span className="text-slate-400">· {b.subcategory || b.category}</span></button>
                                            ))}
                                        </div>
                                        <button onClick={() => saveDraft(a)} disabled={busy} className="bg-ocean-600 text-white font-black px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 disabled:opacity-60"><Save size={15} /> Salvar matéria</button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-slate-100 pt-5 space-y-3" data-testid="curation">
                        <h4 className="font-black text-ocean-950 flex items-center gap-2"><Sparkles size={16} /> Curadoria de experiências</h4>
                        <p className="text-xs text-slate-500">Os filtros Gratuitos, Famílias, Casais, Crianças, Dias de chuva e Imperdíveis só mostram o que você marcar aqui. Nada é marcado automaticamente.</p>
                        <div className="relative"><Search size={14} className="absolute left-3 top-3 text-slate-400" /><input className={inputCls + ' pl-9'} placeholder="Buscar empresa ou lugar" value={tagQuery} onChange={e => setTagQuery(e.target.value)} /></div>
                        {tagMatches.map(b => (
                            <div key={b.id} className="border border-slate-100 rounded-2xl p-3" data-testid={`curate-${b.id}`}>
                                <p className="text-sm font-bold text-ocean-950">{b.name} <span className="text-xs text-slate-400 font-normal">· {b.subcategory || b.category}</span></p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {EXPERIENCE_TAGS.map(t => {
                                        const on = (b.experienceTags || []).includes(t.id);
                                        return <button key={t.id} disabled={busy} onClick={() => toggleTag(b, t.id)} aria-pressed={on} className={`text-xs font-bold px-3 py-1.5 rounded-full border ${on ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200'}`}>{t.label}</button>;
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
