import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowUp, ArrowDown, Eye, EyeOff, Plus, Trash2, Save, RotateCcw, Loader2, LayoutGrid, X } from 'lucide-react';
import { BusinessProfile } from '../../types';
import { getAllBusinesses } from '../../services/dataService';
import { getHomeConfig, saveHomeConfig } from '../../services/homeConfigService';
import {
  CategoryConfig, HomeDiscoveryConfig, MAIN_CATEGORIES, PLACES_MAX, PLACES_MIN,
  buildCategories, countByCategory, matchRule, norm,
} from '../../services/discoverLogic';
import { CategoryIcon, ICON_NAMES } from '../categoryIcons';
import { useNotification } from '../NotificationSystem';

const slug = (s: string) => norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'categoria';
const input = 'w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white';

/** Chips de escolha a partir dos valores que existem de verdade nos cadastros. */
const ValuePicker: React.FC<{ label: string; options: string[]; value: string[]; onChange: (v: string[]) => void; testId: string }> = ({ label, options, value, onChange, testId }) => (
  <div>
    <p className="text-xs font-bold text-slate-500 mb-1.5">{label}</p>
    <div className="flex flex-wrap gap-1.5" data-testid={testId}>
      {options.length === 0 && <span className="text-xs text-slate-400">Nenhum valor cadastrado ainda.</span>}
      {options.map(o => {
        const on = value.some(v => norm(v) === norm(o));
        return <button key={o} type="button" onClick={() => onChange(on ? value.filter(v => norm(v) !== norm(o)) : [...value, o])} aria-pressed={on}
          className={`text-xs font-bold px-3 py-1.5 rounded-full border ${on ? 'bg-ocean-600 text-white border-ocean-600' : 'bg-white text-slate-600 border-slate-200'}`}>{o}</button>;
      })}
    </div>
  </div>
);

/** Admin: quantos lugares aparecem por categoria na Home e quais categorias (nome, ícone, ordem, visibilidade, regra). */
export const HomeDiscoveryAdmin: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { notify } = useNotification();
  const [cfg, setCfg] = useState<HomeDiscoveryConfig | null>(null);
  const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [iconFor, setIconFor] = useState<string | null>(null);
  const [kw, setKw] = useState('');

  useEffect(() => {
    getHomeConfig(true).then(setCfg);
    getAllBusinesses().then(setBusinesses).catch(() => setBusinesses([]));
  }, []);

  const options = useMemo(() => {
    const live = businesses.filter(b => !b.isBlocked && (!b.status || b.status === 'approved'));
    const uniq = (xs: (string | undefined)[]) => Array.from(new Set(xs.filter(Boolean).map(x => x!.trim()))).sort((a, b) => a.localeCompare(b));
    return { cats: uniq(live.map(b => b.category)), subs: uniq(live.map(b => b.subcategory)) };
  }, [businesses]);

  const counts = useMemo(() => (cfg ? countByCategory(businesses, buildCategories(cfg, true)) : {}), [cfg, businesses]);

  if (!cfg) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-ocean-600" /></div>;

  const update = (next: HomeDiscoveryConfig) => { setCfg(next); setDirty(true); };
  const setCat = (id: string, patch: Partial<CategoryConfig>) => update({ ...cfg, categories: cfg.categories.map(c => (c.id === id ? { ...c, ...patch } : c)) });
  const move = (i: number, d: -1 | 1) => {
    const list = [...cfg.categories]; const j = i + d;
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    update({ ...cfg, categories: list.map((c, k) => ({ ...c, order: k })) });
  };
  const addCategory = () => {
    let id = 'nova-categoria'; let n = 2;
    while (cfg.categories.some(c => c.id === id)) id = `nova-categoria-${n++}`;
    const c: CategoryConfig = { id, label: 'Nova categoria', icon: 'Star', order: cfg.categories.length, active: false, custom: true, rule: { categories: [], subcategories: [], keywords: [] } };
    update({ ...cfg, categories: [...cfg.categories, c] });
    setEditing(id);
  };
  const remove = (c: CategoryConfig) => {
    if (!window.confirm(`Excluir a categoria "${c.label}"? Os lugares não são apagados.`)) return;
    update({ ...cfg, categories: cfg.categories.filter(x => x.id !== c.id) });
  };
  const resetBuiltin = (c: CategoryConfig) => {
    const m = MAIN_CATEGORIES.find(x => x.id === c.id);
    if (m) setCat(c.id, { label: m.label, icon: m.icon });
  };
  const save = async () => {
    const bad = cfg.categories.find(c => c.custom && c.active && !(c.rule?.categories?.length || c.rule?.subcategories?.length || c.rule?.keywords?.length));
    if (bad) { notify('warning', `A categoria "${bad.label}" está visível mas não tem regra: escolha categorias, subcategorias ou palavras-chave.`); setEditing(bad.id); return; }
    if (!cfg.categories.some(c => c.active)) { notify('warning', 'Deixe pelo menos uma categoria visível.'); return; }
    setSaving(true);
    try {
      // categorias novas ganham um id estável a partir do nome
      const used = new Set<string>();
      const categories = cfg.categories.map(c => {
        let id = c.id;
        if (c.custom && id.startsWith('nova-categoria')) { id = `c-${slug(c.label)}`; let n = 2; while (used.has(id) || cfg.categories.some(x => x.id === id && x !== c)) id = `c-${slug(c.label)}-${n++}`; }
        used.add(id);
        return { ...c, id };
      });
      setCfg(await saveHomeConfig({ ...cfg, categories }));
      setDirty(false); setEditing(null);
      notify('success', 'Home atualizada. A mudança já vale para todos.');
    } catch (e: any) { notify('error', e?.message || 'Não foi possível salvar.'); }
    finally { setSaving(false); }
  };

  const visible = cfg.categories.filter(c => c.active).length;

  return (
    <div className="space-y-6 pb-24" data-testid="home-discovery-admin">
      <div className="flex items-center justify-between gap-3">
        <button onClick={onBack} className="flex items-center gap-2 text-ocean-600 font-black text-xs uppercase"><ArrowLeft size={16} /> Voltar</button>
        <button onClick={save} disabled={saving || !dirty} data-testid="hd-save"
          className="bg-ocean-600 text-white font-black px-5 py-3 rounded-xl text-sm flex items-center gap-2 disabled:opacity-50">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {dirty ? 'Salvar alterações' : 'Salvo'}
        </button>
      </div>

      <div className="flex items-start gap-3">
        <div className="bg-ocean-50 text-ocean-600 p-3 rounded-2xl"><LayoutGrid size={22} /></div>
        <div>
          <h2 className="font-black text-ocean-950 text-2xl">Home: categorias e lugares</h2>
          <p className="text-sm text-slate-500">Defina quantos lugares aparecem por categoria na Home e quais categorias aparecem, em que ordem, com que nome e ícone. Vale também para a página de lugares.</p>
        </div>
      </div>

      {/* Quantidade de lugares */}
      <section className="bg-white rounded-3xl border border-slate-100 p-5 space-y-3">
        <h3 className="font-black text-ocean-950">Lugares por categoria na Home</h3>
        <div className="flex items-center gap-3">
          <button onClick={() => update({ ...cfg, placesPerCategory: Math.max(PLACES_MIN, cfg.placesPerCategory - 1) })} aria-label="Diminuir" className="w-11 h-11 rounded-xl border border-slate-200 text-xl font-black">−</button>
          <input type="number" min={PLACES_MIN} max={PLACES_MAX} value={cfg.placesPerCategory} data-testid="hd-places"
            onChange={e => update({ ...cfg, placesPerCategory: Math.min(PLACES_MAX, Math.max(PLACES_MIN, Number(e.target.value) || PLACES_MIN)) })}
            className="w-20 h-11 text-center border border-slate-200 rounded-xl font-black text-lg" aria-label="Lugares por categoria" />
          <button onClick={() => update({ ...cfg, placesPerCategory: Math.min(PLACES_MAX, cfg.placesPerCategory + 1) })} aria-label="Aumentar" className="w-11 h-11 rounded-xl border border-slate-200 text-xl font-black">+</button>
          <p className="text-xs text-slate-500">De {PLACES_MIN} a {PLACES_MAX}. Depois deles aparece o botão "Ver todos".</p>
        </div>
      </section>

      {/* Categorias */}
      <section className="bg-white rounded-3xl border border-slate-100 p-5 space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="font-black text-ocean-950">Categorias</h3>
            <p className="text-xs text-slate-500">{visible} visíveis de {cfg.categories.length}. Use as setas para mudar a ordem.</p>
          </div>
          <button onClick={addCategory} data-testid="hd-add" className="bg-ocean-950 text-white font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5"><Plus size={14} /> Nova categoria</button>
        </div>

        <div className="space-y-2">
          {cfg.categories.map((c, i) => {
            const builtin = !c.custom;
            const open = editing === c.id;
            const n = counts[c.id] ?? 0;
            return (
              <div key={c.id} className={`border rounded-2xl ${c.active ? 'border-slate-200' : 'border-dashed border-slate-300 bg-slate-50'}`} data-testid={`hd-row-${c.id}`}>
                <div className="p-3 flex items-center gap-2 flex-wrap">
                  <button onClick={() => setIconFor(iconFor === c.id ? null : c.id)} aria-label={`Trocar ícone de ${c.label}`} data-testid={`hd-icon-${c.id}`}
                    className="w-12 h-12 rounded-xl bg-ocean-50 text-ocean-700 flex items-center justify-center shrink-0"><CategoryIcon name={c.icon} size={22} /></button>
                  <input value={c.label} onChange={e => setCat(c.id, { label: e.target.value })} aria-label="Nome da categoria" data-testid={`hd-label-${c.id}`}
                    className="flex-1 min-w-[140px] border border-slate-200 rounded-xl px-3 h-11 text-sm font-bold" />
                  <span className="text-[11px] font-bold text-slate-500 w-20 text-center" data-testid={`hd-count-${c.id}`}>{n} {n === 1 ? 'lugar' : 'lugares'}</span>
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${builtin ? 'bg-slate-100 text-slate-500' : 'bg-amber-100 text-amber-700'}`}>{builtin ? 'Padrão' : 'Criada'}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => move(i, -1)} disabled={i === 0} aria-label="Subir" className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center disabled:opacity-30"><ArrowUp size={15} /></button>
                    <button onClick={() => move(i, 1)} disabled={i === cfg.categories.length - 1} aria-label="Descer" className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center disabled:opacity-30"><ArrowDown size={15} /></button>
                    <button onClick={() => setCat(c.id, { active: !c.active })} aria-label={c.active ? 'Esconder' : 'Mostrar'} data-testid={`hd-toggle-${c.id}`}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center ${c.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>{c.active ? <Eye size={15} /> : <EyeOff size={15} />}</button>
                    {builtin
                      ? <button onClick={() => resetBuiltin(c)} aria-label="Restaurar nome e ícone" className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center"><RotateCcw size={15} /></button>
                      : <>
                          <button onClick={() => setEditing(open ? null : c.id)} data-testid={`hd-rule-${c.id}`} className="px-3 h-9 rounded-lg bg-slate-50 text-xs font-black text-ocean-600">{open ? 'Fechar' : 'Regra'}</button>
                          <button onClick={() => remove(c)} aria-label="Excluir categoria" data-testid={`hd-del-${c.id}`} className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center"><Trash2 size={15} /></button>
                        </>}
                  </div>
                </div>

                {iconFor === c.id && (
                  <div className="border-t border-slate-100 p-3" data-testid="hd-icon-grid">
                    <div className="flex items-center justify-between mb-2"><p className="text-xs font-bold text-slate-500">Escolha o ícone</p><button onClick={() => setIconFor(null)} aria-label="Fechar"><X size={14} /></button></div>
                    <div className="grid grid-cols-8 sm:grid-cols-12 gap-1.5">
                      {ICON_NAMES.map(name => (
                        <button key={name} onClick={() => { setCat(c.id, { icon: name }); setIconFor(null); }} aria-label={`Ícone ${name}`} data-testid={`hd-pick-${name}`}
                          className={`aspect-square rounded-lg flex items-center justify-center ${c.icon === name ? 'bg-ocean-600 text-white' : 'bg-slate-50 text-slate-700 hover:bg-ocean-50'}`}><CategoryIcon name={name} size={18} /></button>
                      ))}
                    </div>
                  </div>
                )}

                {open && c.custom && (
                  <div className="border-t border-slate-100 p-4 space-y-4 bg-slate-50/60" data-testid={`hd-rule-box-${c.id}`}>
                    <p className="text-xs text-slate-500">Entra nesta categoria todo lugar aprovado que tiver <b>qualquer</b> um dos itens marcados. Hoje: <b>{businesses.filter(matchRule(c.rule)).filter(b => !b.isBlocked && (!b.status || b.status === 'approved')).length}</b> lugares.</p>
                    <ValuePicker label="Categoria do cadastro" options={options.cats} value={c.rule?.categories || []} testId={`hd-cats-${c.id}`} onChange={v => setCat(c.id, { rule: { ...c.rule, categories: v } })} />
                    <ValuePicker label="Subcategoria do cadastro" options={options.subs} value={c.rule?.subcategories || []} testId={`hd-subs-${c.id}`} onChange={v => setCat(c.id, { rule: { ...c.rule, subcategories: v } })} />
                    <div>
                      <p className="text-xs font-bold text-slate-500 mb-1.5">Palavras no nome ou na descrição</p>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {(c.rule?.keywords || []).map(k => <button key={k} onClick={() => setCat(c.id, { rule: { ...c.rule, keywords: (c.rule?.keywords || []).filter(x => x !== k) } })} className="text-xs font-bold px-3 py-1.5 rounded-full bg-ocean-600 text-white">{k} ✕</button>)}
                      </div>
                      <form className="flex gap-2" onSubmit={e => { e.preventDefault(); const k = kw.trim(); if (k) { setCat(c.id, { rule: { ...c.rule, keywords: Array.from(new Set([...(c.rule?.keywords || []), k])) } }); setKw(''); } }}>
                        <input value={kw} onChange={e => setKw(e.target.value)} placeholder="ex.: açaí, sorvete, kitesurf" className={input} data-testid={`hd-kw-${c.id}`} />
                        <button type="submit" className="px-4 rounded-xl bg-ocean-950 text-white text-xs font-black">Adicionar</button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-[11px] text-slate-400">As categorias padrão usam as regras do sistema (por exemplo, "Restaurantes" = Gastronomia sem bares). Nelas você muda nome, ícone, ordem e visibilidade. As categorias criadas por você usam a regra que você definir.</p>
      </section>

      {dirty && <p className="text-xs font-bold text-amber-700" role="status">Há alterações não salvas.</p>}
    </div>
  );
};

