import React, { useState } from 'react';
import { BlogAd } from '../../types';
import { saveBlogAd, deleteBlogAd } from '../../services/dataService';
import { ImageUpload } from '../ImageUpload';
import { 
  Plus, Trash2, Edit2, ChevronLeft, Save, 
  Check, X, Eye, EyeOff, Sparkles, Navigation, Image as ImageIcon
} from 'lucide-react';

interface BlogAdsManagerProps {
  blogAds: BlogAd[];
  onBack: () => void;
  onRefresh: () => void;
  notify: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
  confirm: (message: string) => Promise<boolean>;
}

export const BlogAdsManager: React.FC<BlogAdsManagerProps> = ({
  blogAds, onBack, onRefresh, notify, confirm
}) => {
  const [editingAd, setEditingAd] = useState<Partial<BlogAd> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Default color presets for slide badge bg
  const BADGE_COLOR_PRESETS = [
    { label: 'Ouro (Patrocinado)', value: 'bg-amber-500/95 text-white' },
    { label: 'Vermelho (Destaque)', value: 'bg-red-500/95 text-white' },
    { label: 'Verde (Parceiro)', value: 'bg-emerald-500/95 text-white' },
    { label: 'Roxo (Premium)', value: 'bg-purple-600/95 text-white' },
    { label: 'Azul (Oficial)', value: 'bg-blue-600/95 text-white' },
    { label: 'Preto (Exclusivo)', value: 'bg-slate-900/95 text-white' }
  ];

  const categoryPresets = ['Gastronomia', 'Hospedagem', 'Passeios', 'Comércio', 'Serviços', 'Entretenimento'];

  const handleCreate = () => {
    setEditingAd({
      title: '',
      subtitle: '',
      imageUrl: '',
      tag: 'Patrocinado',
      actionLabel: 'Ver Mais',
      badgeColor: 'bg-amber-500/95 text-white',
      targetCategory: 'Passeios',
      active: true,
      order: blogAds.length
    });
  };

  const handleEdit = (ad: BlogAd) => {
    setEditingAd({ ...ad });
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm('Deseja realmente excluir este anúncio patrocinado? Ele deixará de ser exibido no carrosel do Feed do aplicativo.');
    if (!ok) return;

    try {
      await deleteBlogAd(id);
      notify('success', 'Anúncio removido com sucesso!');
      onRefresh();
    } catch (error) {
      console.error(error);
      notify('error', 'Ocorreu um erro ao excluir o anúncio.');
    }
  };

  const handleSave = async () => {
    if (!editingAd?.title) {
      notify('warning', 'O título é obrigatório.');
      return;
    }
    if (!editingAd?.imageUrl) {
      notify('warning', 'Uma foto ou imagem de capa é obrigatória.');
      return;
    }

    setIsSaving(true);
    try {
      await saveBlogAd(editingAd);
      notify('success', 'Anúncio patrocinado salvo com sucesso!');
      setEditingAd(null);
      onRefresh();
    } catch (error) {
      console.error(error);
      notify('error', 'Erro ao salvar anúncio.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <button 
            onClick={onBack} 
            className="flex items-center gap-2 text-ocean-600 hover:text-ocean-700 transition-colors font-black text-xs uppercase tracking-widest mb-1"
          >
            <ChevronLeft size={16} /> Voltar ao Painel
          </button>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="text-amber-500" /> Banners Patrocinados (Carrossel do Feed)
          </h1>
          <p className="text-xs text-slate-500 font-medium">Assegure a venda de publicidade exibida rotativamente no topo da página de Dicas & Notícias.</p>
        </div>
        {!editingAd && (
          <button 
            onClick={handleCreate} 
            className="bg-ocean-600 text-white px-5 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-ocean-600/25 hover:bg-ocean-700 transition-all active:scale-95 shrink-0"
          >
            <Plus size={16} /> Novo Slide Patrocinado
          </button>
        )}
      </div>

      {editingAd ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Area */}
          <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">
              {editingAd.id ? 'Alterar Anúncio' : 'Criar Novo Anúncio'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5Col">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Título do Carrossel</label>
                <input 
                  type="text" 
                  value={editingAd.title || ''}
                  onChange={e => setEditingAd({ ...editingAd, title: e.target.value })}
                  placeholder="Ex: Passeio VIP de Escuna com 20% OFF"
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-ocean-500/20 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Aviso / Tag Curta</label>
                <input 
                  type="text" 
                  value={editingAd.tag || ''}
                  onChange={e => setEditingAd({ ...editingAd, tag: e.target.value })}
                  placeholder="Ex: Patrocinado, Roteiro VIP, Oferta"
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-ocean-500/20 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Descrição Secundária (Chamada de Atração)</label>
              <textarea 
                value={editingAd.subtitle || ''}
                onChange={e => setEditingAd({ ...editingAd, subtitle: e.target.value })}
                placeholder="Descreva detalhes ou benefícios da peça de publicidade com frases curtas e instigantes..."
                rows={3}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-semibold text-sm outline-none focus:ring-2 focus:ring-ocean-500/20 transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Ordem de Exibição</label>
                <input 
                  type="number" 
                  value={editingAd.order ?? 0}
                  onChange={e => setEditingAd({ ...editingAd, order: parseInt(e.target.value) || 0 })}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoria de Redirecionamento</label>
                <select 
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none cursor-pointer"
                  value={editingAd.targetCategory || ''}
                  onChange={e => setEditingAd({ ...editingAd, targetCategory: e.target.value })}
                >
                  <option value="">Nenhum redirecionamento</option>
                  {categoryPresets.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Texto do Botão de Ação</label>
                <input 
                  type="text" 
                  value={editingAd.actionLabel || ''}
                  onChange={e => setEditingAd({ ...editingAd, actionLabel: e.target.value })}
                  placeholder="Ex: Ver Passeios, Resgatar"
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-ocean-500/20 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Cor Temática do Selo (Badge Color Preset)</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {BADGE_COLOR_PRESETS.map(preset => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setEditingAd({ ...editingAd, badgeColor: preset.value })}
                    className={`p-3.5 rounded-xl text-left border text-xs font-bold transition-all relative ${editingAd.badgeColor === preset.value ? 'border-ocean-500 bg-ocean-50/50 text-ocean-950' : 'border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className={`w-3.5 h-3.5 rounded-full inline-block shrink-0 ${preset.value.split(' ')[0]}`}></span>
                      {preset.label.split(' ')[0]}
                    </span>
                    {editingAd.badgeColor === preset.value && (
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-ocean-600 text-white p-0.5 rounded-full"><Check size={10} /></span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-dotted border-slate-200">
              <input 
                type="checkbox" 
                id="ad-active"
                checked={editingAd.active ?? true}
                onChange={e => setEditingAd({ ...editingAd, active: e.target.checked })}
                className="w-4 h-4 text-ocean-600 border-gray-300 rounded focus:ring-ocean-500"
              />
              <label htmlFor="ad-active" className="text-xs font-black text-slate-700 uppercase tracking-tight select-none cursor-pointer">
                Exibir este anúncio no carrossel de publicidade ativo
              </label>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <button 
                type="button"
                onClick={() => setEditingAd(null)}
                className="flex-1 px-6 py-4 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl font-black text-xs uppercase tracking-widest transition-all"
              >
                Cancelar
              </button>
              <button 
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 px-6 py-4 bg-ocean-600 hover:bg-ocean-700 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-ocean-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {isSaving ? 'Salvando...' : <><Save size={16} /> Salvar Anúncio</>}
              </button>
            </div>
          </div>

          {/* Desktop Live Preview Box */}
          <div className="bg-slate-900 self-start p-6 rounded-[2.2rem] shadow-xl text-white space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span> ESTILO SMARTPHONE PREVIEW
            </h4>

            {/* Smart Frame mimicking the actual blog carousels */}
            <div className="relative h-44 rounded-2xl overflow-hidden border border-white/10 group shadow-lg bg-slate-950">
              {editingAd.imageUrl ? (
                <img 
                  src={editingAd.imageUrl} 
                  alt="Slide preview" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover opacity-85" 
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white/30 text-xs">
                  <ImageIcon size={32} className="mb-2" />
                  Nenhuma imagem carregada
                </div>
              )}
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10"></div>
              
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className={`inline-block px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${editingAd.badgeColor || 'bg-amber-500/90 text-white'} mb-1.5`}>
                  {editingAd.tag || 'PATROCINADO'}
                </span>
                <h3 className="text-sm font-black tracking-tight leading-snug text-white line-clamp-1 mb-0.5">
                  {editingAd.title || 'Título Exemplo do Banner Patrocinado'}
                </h3>
                <p className="text-white/70 text-[10px] line-clamp-1">
                  {editingAd.subtitle || 'Diga o sub-item principal legal e instigante de seu anúncio.'}
                </p>
                {editingAd.targetCategory && (
                  <span className="text-[8px] text-ocean-400 font-black tracking-widest uppercase mt-1 flex items-center gap-1">
                    <Navigation size={8} /> Redireciona para {editingAd.targetCategory}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Selecione ou Cole a Imagem de Capa</label>
              <ImageUpload 
                currentImage={editingAd.imageUrl}
                onImageSelect={base64 => setEditingAd({ ...editingAd, imageUrl: base64 })}
                label="Carregar Imagem de Banner"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          {blogAds.length === 0 ? (
            <div className="p-12 md:p-20 text-center">
              <Sparkles className="w-14 h-14 text-slate-200 mx-auto mb-4" />
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Nenhum anúncio patrocinado ativo</h3>
              <p className="text-sm text-slate-400 mb-6">Comece vendendo slots publicitários no carrosel principal para gerar receita com seu guia da cidade.</p>
              <button 
                onClick={handleCreate}
                className="px-6 py-3 bg-ocean-50 text-ocean-600 rounded-xl font-bold uppercase text-xs hover:bg-ocean-100 tracking-wider transition-all"
              >
                Criar Primeiro Patrocinado
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {/* Header row desktop-only */}
              <div className="hidden md:flex items-center gap-6 p-6 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <div className="w-14">Banner</div>
                <div className="flex-1">Conteúdo do Anúncio</div>
                <div className="w-40">Ações Cliques (Botoes)</div>
                <div className="w-20 text-center">Visualização</div>
                <div className="w-20 text-center">Ordem</div>
                <div className="w-28 text-right">Ação</div>
              </div>

              {/* Rows */}
              {blogAds.map(ad => (
                <div key={ad.id} className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 p-6 hover:bg-slate-50/50 transition-all">
                  
                  {/* Thumbnail / Aspect Ratio Frame */}
                  <div className="w-full md:w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                    <img 
                      src={ad.imageUrl} 
                      referrerPolicy="no-referrer"
                      alt={ad.title} 
                      className="w-full h-full object-cover" 
                    />
                  </div>

                  {/* Descriptions */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${ad.badgeColor || 'bg-amber-100 text-amber-600'}`}>
                        {ad.tag}
                      </span>
                      {!ad.active && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-black text-[7px] uppercase tracking-widest flex items-center gap-1 border border-slate-200">
                          <EyeOff size={10} /> Inativo
                        </span>
                      )}
                    </div>
                    <h4 className="font-semibold text-slate-900 text-sm leading-tight line-clamp-1">{ad.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-1 font-medium">{ad.subtitle}</p>
                  </div>

                  {/* Redirections */}
                  <div className="w-full md:w-40 text-xs font-bold text-slate-600 space-y-1.5 shrink-0">
                    {ad.targetCategory ? (
                      <span className="inline-flex items-center gap-1 py-1 px-2.5 bg-blue-50 text-blue-600 rounded-lg">
                        <Navigation size={12} /> Redireciona: <strong className="text-blue-800">{ad.targetCategory}</strong>
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Nenhum Link</span>
                    )}
                    {ad.actionLabel && (
                      <div className="text-[10px] text-slate-400 uppercase tracking-widest">Rótulo: <span className="font-extrabold text-slate-700">{ad.actionLabel}</span></div>
                    )}
                  </div>

                  {/* Status toggle summary */}
                  <div className="md:w-20 text-center shrink-0">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-black uppercase tracking-widest rounded-full ${ad.active ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400'}`}>
                      {ad.active ? 'ATIVO' : 'OCULTO'}
                    </span>
                  </div>

                  {/* Order */}
                  <div className="md:w-20 text-center font-black text-slate-800 text-sm shrink-0">
                    #{ad.order}
                  </div>

                  {/* Actions buttons */}
                  <div className="flex justify-end gap-2 md:w-28 shrink-0">
                    <button 
                      onClick={() => handleEdit(ad)}
                      className="p-2 text-slate-400 hover:text-ocean-600 hover:bg-ocean-50 rounded-xl transition-all"
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(ad.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
