import React, { useEffect, useState } from 'react';
import { Handshake, Plus, Trash2, Loader2 } from 'lucide-react';
import { getGlobalSettings, savePartnerBanners } from '../../services/dataService';
import { PartnerBanner, sanitizePartnerBanners } from '../../services/partnerBanners';
import { useNotification } from '../NotificationSystem';

const input = 'w-full h-10 px-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-ocean-500';

/** Admin: cadastra parceiros (Magazine Luiza, Mercado Livre...) com o link de afiliado. Aparecem na Home com a etiqueta "Parceiro". */
export const PartnerBannersAdmin: React.FC = () => {
  const { notify } = useNotification();
  const [list, setList] = useState<PartnerBanner[]>([]);
  const [saving, setSaving] = useState(false);
  useEffect(() => { getGlobalSettings(true).then(s => setList(s.partnerBanners || [])); }, []);

  const patch = (id: string, p: Partial<PartnerBanner>) => setList(l => l.map(b => (b.id === id ? { ...b, ...p } : b)));
  const add = (preset?: Partial<PartnerBanner>) => setList(l => [...l, { id: `p_${Date.now()}`, name: '', url: '', active: true, ...preset }]);
  const PRESETS: { label: string; preset: Partial<PartnerBanner> }[] = [
    { label: 'Mercado Livre', preset: { name: 'Mercado Livre', text: 'Leve na mala: protetor solar, snorkel e mais', imageUrl: 'https://lagosgo.com.br/brand/parceiros/leve-na-mala.png' } },
    { label: 'Magazine Luiza', preset: { name: 'Magazine Luiza', text: 'Ofertas para a sua viagem', imageUrl: 'https://lagosgo.com.br/brand/parceiros/ofertas-viagem.png' } },
  ];
  const save = async () => {
    const valid = sanitizePartnerBanners(list);
    if (valid.length !== list.length) { notify('error', 'Cada parceiro precisa de nome e link que comece com https:// (e imagem com https://, se houver).'); return; }
    setSaving(true);
    try { await savePartnerBanners(list); notify('success', 'Parceiros salvos.'); }
    catch (e: any) { notify('error', e?.message || 'Não foi possível salvar.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 p-6 space-y-4" data-testid="partner-banners-admin">
      <div className="flex items-start gap-3">
        <div className="bg-ocean-50 text-ocean-600 p-3 rounded-2xl"><Handshake size={22} /></div>
        <div>
          <h3 className="font-black text-ocean-950 text-lg">Parceiros (links de afiliado)</h3>
          <p className="text-sm text-slate-500">Cole o link de afiliado de cada parceiro. Na Home aparece com a etiqueta "Parceiro" e o aviso de comissão. Só aparece quando houver ao menos um ativo.</p>
        </div>
      </div>
      {list.map(b => (
        <div key={b.id} className="border border-slate-100 rounded-2xl p-3 space-y-2">
          <div className="grid gap-2 md:grid-cols-2">
            <input className={input} placeholder="Nome (ex.: Mercado Livre)" value={b.name} maxLength={40} onChange={e => patch(b.id, { name: e.target.value })} />
            <input className={input} placeholder="Link de afiliado (https://...)" value={b.url} onChange={e => patch(b.id, { url: e.target.value })} />
            <input className={input} placeholder="Imagem/logo do programa (https://..., opcional)" value={b.imageUrl || ''} onChange={e => patch(b.id, { imageUrl: e.target.value })} />
            <input className={input} placeholder="Frase curta (ex.: Leve na mala: protetor, snorkel e mais)" value={b.text || ''} maxLength={80} onChange={e => patch(b.id, { text: e.target.value })} />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-600"><input type="checkbox" checked={b.active} onChange={e => patch(b.id, { active: e.target.checked })} /> Mostrar na Home</label>
            <button onClick={() => setList(l => l.filter(x => x.id !== b.id))} className="text-red-500 text-xs font-black flex items-center gap-1"><Trash2 size={14} /> Remover</button>
          </div>
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => add()} className="h-10 px-4 rounded-xl bg-slate-100 text-slate-700 text-xs font-black flex items-center gap-1.5"><Plus size={14} /> Adicionar parceiro</button>
        {PRESETS.filter(p => !list.some(b => b.name === p.preset.name)).map(p => (
          <button key={p.label} onClick={() => add(p.preset)} className="h-10 px-4 rounded-xl bg-ocean-50 text-ocean-600 text-xs font-black flex items-center gap-1.5"><Plus size={14} /> {p.label}</button>
        ))}
        <button onClick={save} disabled={saving} className="h-10 px-5 rounded-xl bg-ocean-600 text-white text-xs font-black flex items-center gap-2 disabled:opacity-60">{saving && <Loader2 size={14} className="animate-spin" />} Salvar</button>
      </div>
    </div>
  );
};
