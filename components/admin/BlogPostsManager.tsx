import React, { useState } from 'react';
import { BlogPost, AppCategory } from '../../types';
import { 
  saveDicasCategory, deleteDicasCategory, 
  saveDicasSubcategory, deleteDicasSubcategory,
  deleteBlogPost, saveBlogPost 
} from '../../services/dataService';
import { 
  ChevronLeft, Plus, Trash2, Layers, BookOpen, 
  Search, Check, Grid, Flame, EyePercent, ShieldAlert, Badge, X
} from 'lucide-react';

interface BlogPostsManagerProps {
  blogPosts: BlogPost[];
  dicasCategories: AppCategory[];
  onBack: () => void;
  onRefresh: () => void;
  notify: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
  confirm: (message: string) => Promise<boolean>;
}

type TabType = 'POSTS' | 'CATEGORIES';

export const BlogPostsManager: React.FC<BlogPostsManagerProps> = ({
  blogPosts, dicasCategories, onBack, onRefresh, notify, confirm
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('POSTS');
  const [searchQuery, setSearchQuery] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [newSubNames, setNewSubNames] = useState<{ [key: string]: string }>({});

  const filteredPosts = blogPosts.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) {
      notify('warning', 'Digite o nome da categoria.');
      return;
    }
    const catId = 'cat_dicas_' + newCatName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '_');
    
    try {
      await saveDicasCategory({
        id: catId,
        name: newCatName,
        subcategories: []
      });
      notify('success', `Categoria "${newCatName}" criada com sucesso!`);
      setNewCatName('');
      onRefresh();
    } catch (e) {
      console.error(e);
      notify('error', 'Erro ao criar categoria.');
    }
  };

  const handleDeleteCategory = async (cat: AppCategory) => {
    const ok = await confirm(`Deseja realmente excluir a categoria "${cat.name}"? Todas as suas subcategorias também serão perdidas.`);
    if (!ok) return;

    try {
      await deleteDicasCategory(cat.id);
      notify('success', 'Categoria excluída com sucesso!');
      onRefresh();
    } catch (e) {
      console.error(e);
      notify('error', 'Erro ao apagar categoria.');
    }
  };

  const handleCreateSubcategory = async (catId: string) => {
    const subName = newSubNames[catId];
    if (!subName || !subName.trim()) {
      notify('warning', 'Digite o nome da subcategoria.');
      return;
    }

    try {
      await saveDicasSubcategory(catId, subName);
      notify('success', `Subcategoria "${subName}" adicionada!`);
      setNewSubNames(prev => ({ ...prev, [catId]: '' }));
      onRefresh();
    } catch (e) {
      console.error(e);
      notify('error', 'Erro ao adicionar subcategoria.');
    }
  };

  const handleDeleteSubcategory = async (catId: string, subId: string, subName: string) => {
    const ok = await confirm(`Excluir subcategoria "${subName}"?`);
    if (!ok) return;

    try {
      await deleteDicasSubcategory(catId, subId);
      notify('success', 'Subcategoria excluída!');
      onRefresh();
    } catch (e) {
      console.error(e);
      notify('error', 'Erro ao apagar subcategoria.');
    }
  };

  const handleDeletePost = async (id: string, title: string) => {
    const ok = await confirm(`Deseja excluir permanentemente a matéria "${title}"? Esta operação é irreversível.`);
    if (!ok) return;

    try {
      await deleteBlogPost(id);
      notify('success', 'Matéria removida com sucesso!');
      onRefresh();
    } catch (e) {
      console.error(e);
      notify('error', 'Erro ao excluir matéria.');
    }
  };

  const handleToggleStatus = async (post: BlogPost) => {
    const newStatus = post.status === 'published' ? 'draft' : 'published';
    try {
      await saveBlogPost({
        ...post,
        status: newStatus
      });
      notify('success', `Status da matéria alterado para ${newStatus === 'published' ? 'Publicado' : 'Rascunho'}`);
      onRefresh();
    } catch (e) {
      console.error(e);
      notify('error', 'Erro ao alterar status.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <button 
            onClick={onBack} 
            className="flex items-center gap-2 text-ocean-600 hover:text-ocean-700 transition-colors font-black text-xs uppercase tracking-widest mb-1"
          >
            <ChevronLeft size={16} /> Voltar ao Painel
          </button>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="text-ocean-600" /> Painel de Controle de Dicas & Feed Geral
          </h1>
          <p className="text-xs text-slate-500 font-medium">Controle total sobre as matérias enviadas por jornalistas, categorização do feed e mídias.</p>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl self-start shrink-0">
          <button
            onClick={() => setActiveTab('POSTS')}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'POSTS' ? 'bg-white text-ocean-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Matérias & Notícias
          </button>
          <button
            onClick={() => setActiveTab('CATEGORIES')}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'CATEGORIES' ? 'bg-white text-ocean-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Gerenciar Categorias
          </button>
        </div>
      </div>

      {activeTab === 'POSTS' ? (
        <div className="space-y-4">
          
          {/* Controls bar */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:max-w-md">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search size={16} />
              </span>
              <input 
                type="text"
                placeholder="Buscar por título, autor, tags ou categoria..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-3 bg-white border border-slate-200 rounded-xl font-medium text-sm outline-none focus:ring-2 focus:ring-ocean-500/20 shadow-sm transition-all"
              />
            </div>

            <div className="text-xs text-slate-400 font-black uppercase tracking-widest self-end md:self-auto shrink-0 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
              Total de postagens: <span className="text-slate-800 font-extrabold">{blogPosts.length}</span>
            </div>
          </div>

          {/* Posts grid / table */}
          {filteredPosts.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-slate-200">
              <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <h3 className="text-sm font-black text-slate-700 uppercase tracking-tight">Nenhuma matéria correspondente</h3>
              <p className="text-xs text-slate-400">A pesquisa atual não retornou artigos. Tente termos diferentes.</p>
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-100">
                {/* Header Row */}
                <div className="hidden md:flex items-center gap-6 p-6 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <div className="w-14">Capa</div>
                  <div className="flex-1">Título da Matéria</div>
                  <div className="w-48">Categoria principal</div>
                  <div className="w-36">Enviado em</div>
                  <div className="w-28 text-center">Status</div>
                  <div className="w-28 text-right">Ação</div>
                </div>

                {/* Body Rows */}
                {filteredPosts.map(post => (
                  <div key={post.id} className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 p-6 hover:bg-slate-50/50 transition-all">
                    
                    {/* Cover image thumbnail */}
                    <div className="w-full md:w-14 h-14 rounded-xl overflow-hidden bg-slate-50 shrink-0 border border-slate-100">
                      {post.imageUrl ? (
                        <img 
                          src={post.imageUrl} 
                          referrerPolicy="no-referrer"
                          alt="Capa" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50"><BookOpen size={18} /></div>
                      )}
                    </div>

                    {/* Title and author */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-900 text-sm leading-tight mb-1 line-clamp-2 md:line-clamp-1">{post.title}</h4>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">
                        Por: <span className="text-slate-600 font-extrabold">{post.authorName || 'Jornalista'}</span>
                      </p>
                    </div>

                    {/* Dica Category */}
                    <div className="w-full md:w-48 shrink-0">
                      <span className="inline-flex items-center gap-1.5 py-1 px-2.5 bg-slate-100 text-slate-700 font-black text-[10px] uppercase tracking-wider rounded-lg border border-slate-200">
                        <Grid size={10} /> {post.category || 'Sem info'}
                      </span>
                      {post.subcategory && (
                        <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 ml-2">
                          › {post.subcategory}
                        </span>
                      )}
                    </div>

                    {/* Date */}
                    <div className="md:w-36 text-xs text-slate-500 font-bold shrink-0">
                      {post.date ? new Date(post.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Sem Data'}
                    </div>

                    {/* Status badge toggler */}
                    <div className="md:w-28 text-center shrink-0">
                      <button 
                        onClick={() => handleToggleStatus(post)}
                        className={`inline-flex items-center gap-1 px-3 py-1 cursor-pointer hover:opacity-85 active:scale-95 text-[10px] font-black uppercase tracking-widest rounded-lg border transition-all ${post.status === 'published' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}
                      >
                        {post.status === 'published' ? 'Publicado' : 'Rascunho'}
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 md:w-28 shrink-0 border-t md:border-t-0 pt-2 md:pt-0">
                      <button 
                        onClick={() => handleDeletePost(post.id, post.title)}
                        className="w-full md:w-auto px-4 py-2.5 md:p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition-all flex items-center justify-center gap-1 text-[10px] md:text-sm font-black uppercase md:normal-case tracking-widest md:tracking-normal"
                        title="Deletar permanentemente"
                      >
                        <Trash2 size={16} />
                        <span className="md:hidden">EXCLUIR</span>
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      ) : (
        /* CATEGORIES MANAGEMENT TREE VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Create new Category card */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm self-start space-y-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="text-ocean-600" /> Nova Categoria Principal
            </h3>
            <p className="text-xs text-slate-400 font-medium">As categorias abrigam as subcategorias e guiam a navegação no topo da página de feed local.</p>
            
            <div className="space-y-1.5">
              <input 
                type="text" 
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                placeholder="Ex: Vida Noturna, Cultura, etc"
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-ocean-500/20"
              />
            </div>
            
            <button 
              onClick={handleCreateCategory}
              className="w-full py-4 bg-ocean-600 hover:bg-ocean-700 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-md transition-all active:scale-98"
            >
              Criar Categoria Principal
            </button>
          </div>

          {/* Categories lists and subcategory trees */}
          <div className="lg:col-span-2 space-y-4">
            {dicasCategories.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-slate-200">
                <Layers className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <h3 className="text-sm font-black text-slate-700 uppercase tracking-tight">Categorição Vazia</h3>
                <p className="text-xs text-slate-400">Nenhuma categoria principal cadastrada no Feed.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {dicasCategories.map(cat => (
                  <div key={cat.id} className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
                    
                    {/* Header line of the category element */}
                    <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">{cat.name}</h4>
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">ID: {cat.id}</span>
                      </div>
                      <button 
                        onClick={() => handleDeleteCategory(cat)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Excluir Categoria do sistema"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Subcategories items tags visualizers */}
                    <div className="space-y-2">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Subcategorias ativas:</p>
                      
                      {cat.subcategories && cat.subcategories.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {cat.subcategories.map(sub => (
                            <span 
                              key={sub.id} 
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black text-slate-600 uppercase tracking-widest hover:bg-red-50 hover:text-red-600 hover:border-red-100 cursor-pointer transition-all group"
                              title="Clique para excluir subcategoria"
                              onClick={() => handleDeleteSubcategory(cat.id, sub.id, sub.name)}
                            >
                              {sub.name}
                              <X size={10} className="text-slate-400 group-hover:text-red-600 transition-colors" />
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">Nenhuma subcategoria adicionada a esta categoria.</p>
                      )}
                    </div>

                    {/* Subcategory form add inline */}
                    <div className="flex gap-2 pt-2">
                      <input 
                        type="text"
                        placeholder="Nome da Nova Subcategoria..."
                        value={newSubNames[cat.id] || ''}
                        onChange={e => setNewSubNames({ ...newSubNames, [cat.id]: e.target.value })}
                        className="flex-1 p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-ocean-500/20"
                      />
                      <button 
                        onClick={() => handleCreateSubcategory(cat.id)}
                        className="px-4 bg-ocean-950 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all"
                      >
                        Inserir Sub
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
