import React, { useState, useEffect } from 'react';
import { User, BlogPost, AppCategory } from '../types';
import { getBlogPosts, saveBlogPost, deleteBlogPost, getDicasCategories, saveDicasCategory, saveDicasSubcategory } from '../services/dataService';
import { Pencil, Trash2, Plus, Image as ImageIcon, Tag, Globe, Settings, FileText, CheckCircle, XCircle, LayoutDashboard, FolderPlus, Link as LinkIcon, X, Loader2, LogOut, ChevronRight, Clock, Zap, Trophy, Store, Send } from 'lucide-react';
import { ImageUpload } from '../components/ImageUpload';
import { useNotification } from '../components/NotificationSystem';

interface JournalistDashboardProps {
  currentUser: User;
  onNavigate: (page: string, params?: any) => void;
  onLogout: () => void;
}

export function JournalistDashboard({ currentUser, onNavigate, onLogout }: JournalistDashboardProps) {
  const { notify, confirm } = useNotification();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<AppCategory[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPost, setCurrentPost] = useState<Partial<BlogPost>>({});
  const [activeTab, setActiveTab] = useState<'dashboard' | 'posts' | 'settings'>('dashboard');
  const [linkPrompt, setLinkPrompt] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [profile, setProfile] = useState<Partial<User>>({
      avatarUrl: currentUser.avatarUrl,
      profession: currentUser.profession,
      bio: currentUser.bio,
      achievements: currentUser.achievements,
      location: currentUser.location,
      specialties: currentUser.specialties,
      instagram: currentUser.instagram,
      website: currentUser.website
  });

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    const [allPosts, cats] = await Promise.all([
      getBlogPosts(),
      getDicasCategories()
    ]);
    const myPosts = allPosts.filter(p => p.authorId === currentUser.id);
    setPosts(myPosts);
    setCategories(cats);
  };

  const handleCreatePost = () => {
    setCurrentPost({
      title: '',
      excerpt: '',
      content: '',
      imageUrl: '',
      category: 'Notícia',
      author: currentUser.name,
      authorId: currentUser.id,
      date: new Date().toISOString().split('T')[0],
      tags: [],
      metaDescription: '',
      metaKeywords: '',
      status: 'draft'
    });
    setIsEditing(true);
  };

  const handleEditPost = (post: BlogPost) => {
    setCurrentPost({ ...post });
    setIsEditing(true);
  };

  const handleDeletePost = async (id: string) => {
    if (await confirm({ title: 'Excluir Matéria', message: 'Tem certeza que deseja excluir esta matéria?' })) {
      deleteBlogPost(id);
      loadData();
    }
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPost.title || !currentPost.content) {
      notify('error', 'Título e conteúdo são obrigatórios.');
      return;
    }
    
    const postToSave: BlogPost = {
      id: currentPost.id || `post_${Date.now()}`,
      title: currentPost.title || '',
      excerpt: currentPost.excerpt || '',
      content: currentPost.content || '',
      imageUrl: currentPost.imageUrl || '',
      category: currentPost.category || 'Notícia',
      subcategory: currentPost.subcategory || '',
      date: currentPost.date || new Date().toISOString().split('T')[0],
      author: currentPost.author || currentUser.name,
      authorId: currentUser.id,
      tags: currentPost.tags || [],
      metaTitle: currentPost.metaTitle || currentPost.title || '',
      metaDescription: currentPost.metaDescription || currentPost.excerpt || '',
      metaKeywords: currentPost.metaKeywords || '',
      status: currentPost.status || 'draft'
    };

    try {
      await saveBlogPost(postToSave);
      setIsEditing(false);
      await loadData();
      notify('success', 'Matéria salva com sucesso!');
    } catch (error: any) {
      notify('error', error.message || 'Erro ao salvar matéria.');
    }
  };

  const applyFormat = (tag: string) => {
    const textarea = document.getElementById('post-content') as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = currentPost.content || '';
    const selectedText = text.substring(start, end);
    const newText = text.substring(0, start) + `<${tag}>${selectedText}</${tag}>` + text.substring(end);
    setCurrentPost({ ...currentPost, content: newText });
    
    setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + tag.length + 2, end + tag.length + 2);
    }, 0);
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tagsArray = e.target.value.split(',').map(t => t.trim()).filter(t => t !== '');
    setCurrentPost({ ...currentPost, tags: tagsArray });
  };

  if (isEditing) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {currentPost.id ? 'Editar Matéria' : 'Nova Matéria'}
            </h1>
            <div className="flex gap-4">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSavePost}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Salvar
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <input
                  type="text"
                  placeholder="Título da Matéria"
                  className="w-full text-3xl font-bold border-none focus:ring-0 p-0 mb-4 placeholder-gray-300"
                  value={currentPost.title || ''}
                  onChange={e => setCurrentPost({ ...currentPost, title: e.target.value })}
                />
                
                <div className="flex flex-wrap gap-2 mb-2 bg-gray-50 p-2 rounded-lg">
                    <button onClick={() => applyFormat('h1')} className="px-2 py-1 bg-white border rounded text-sm font-bold">H1</button>
                    <button onClick={() => applyFormat('h2')} className="px-2 py-1 bg-white border rounded text-sm font-bold">H2</button>
                    <button onClick={() => applyFormat('b')} className="px-2 py-1 bg-white border rounded text-sm font-bold">B</button>
                    <button onClick={() => applyFormat('i')} className="px-2 py-1 bg-white border rounded text-sm italic">I</button>
                    <button onClick={() => applyFormat('u')} className="px-2 py-1 bg-white border rounded text-sm underline">U</button>
                    <button onClick={() => setLinkPrompt(true)} className="px-2 py-1 bg-white border rounded text-sm text-blue-600">Link</button>
                </div>
                <textarea
                  id="post-content"
                  placeholder="Escreva sua matéria aqui... (Suporta HTML básico)"
                  className="w-full h-96 border-none focus:ring-0 p-0 resize-none text-gray-700 leading-relaxed"
                  value={currentPost.content || ''}
                  onChange={e => setCurrentPost({ ...currentPost, content: e.target.value })}
                />
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                <h3 className="text-lg font-bold">SEO & Tags</h3>
                <input type="text" placeholder="Meta Title" className="w-full p-3 border rounded-lg" value={currentPost.metaTitle || ''} onChange={e => setCurrentPost({...currentPost, metaTitle: e.target.value})} />
                <input type="text" placeholder="Meta Description" className="w-full p-3 border rounded-lg" value={currentPost.metaDescription || ''} onChange={e => setCurrentPost({...currentPost, metaDescription: e.target.value})} />
                <input type="text" placeholder="Meta Keywords (separadas por vírgula)" className="w-full p-3 border rounded-lg" value={currentPost.metaKeywords || ''} onChange={e => setCurrentPost({...currentPost, metaKeywords: e.target.value})} />
                <input type="text" placeholder="Tags (separadas por vírgula)" className="w-full p-3 border rounded-lg" value={currentPost.tags?.join(', ') || ''} onChange={e => setCurrentPost({...currentPost, tags: e.target.value.split(',').map(t => t.trim())})} />
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold mb-4">Categoria</h3>
                <select className="w-full p-3 border rounded-lg mb-4" value={currentPost.category || ''} onChange={e => setCurrentPost({...currentPost, category: e.target.value})}>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
                <select className="w-full p-3 border rounded-lg" value={currentPost.subcategory || ''} onChange={e => setCurrentPost({...currentPost, subcategory: e.target.value})}>
                    <option value="">Selecione uma subcategoria</option>
                    {categories.find(c => c.name === currentPost.category)?.subcategories.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </div>
              <ImageUpload currentImage={currentPost.imageUrl} onImageSelect={base64 => setCurrentPost({...currentPost, imageUrl: base64})} label="Imagem de Capa" />
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold mb-4 uppercase tracking-widest text-[10px] text-slate-400">Status da Matéria</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setCurrentPost({...currentPost, status: 'draft'})}
                    className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${currentPost.status === 'draft' ? 'bg-amber-100 text-amber-600 border border-amber-200' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                  >
                    Rascunho
                  </button>
                  <button 
                    onClick={() => setCurrentPost({...currentPost, status: 'published'})}
                    className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${currentPost.status === 'published' ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                  >
                    Publicar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center sticky top-0 z-50">
          <h2 className="text-lg font-black text-ocean-950 uppercase tracking-tight">Painel Jornalista</h2>
          <div className="flex gap-2">
              <button onClick={() => setActiveTab('dashboard')} className={`p-2 rounded-lg ${activeTab === 'dashboard' ? 'bg-ocean-100 text-ocean-600' : 'text-slate-400'}`}><LayoutDashboard size={20} /></button>
              <button onClick={() => setActiveTab('posts')} className={`p-2 rounded-lg ${activeTab === 'posts' ? 'bg-ocean-100 text-ocean-600' : 'text-slate-400'}`}><FileText size={20} /></button>
              <button onClick={() => setActiveTab('settings')} className={`p-2 rounded-lg ${activeTab === 'settings' ? 'bg-ocean-100 text-ocean-600' : 'text-slate-400'}`}><Settings size={20} /></button>
              <button onClick={onLogout} className="p-2 rounded-lg text-red-500"><LogOut size={20} /></button>
          </div>
      </div>

      <div className="w-64 bg-white border-r border-gray-200 hidden md:block shrink-0">
        <div className="p-6">
          <h2 className="text-xl font-black text-ocean-950 uppercase tracking-tight">Painel do Jornalista</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">Olá, {currentUser.name}</p>
        </div>
        <nav className="mt-6 space-y-1 px-3">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-xl transition-all font-bold text-sm ${activeTab === 'dashboard' ? 'bg-ocean-50 text-ocean-600' : 'text-slate-600 hover:bg-slate-50'}`}>
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </button>
          <button onClick={() => setActiveTab('posts')} className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-xl transition-all font-bold text-sm ${activeTab === 'posts' ? 'bg-ocean-50 text-ocean-600' : 'text-slate-600 hover:bg-slate-50'}`}>
            <FileText className="w-5 h-5" /> Minhas Matérias
          </button>
          <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-xl transition-all font-bold text-sm ${activeTab === 'settings' ? 'bg-ocean-50 text-ocean-600' : 'text-slate-600 hover:bg-slate-50'}`}>
            <Settings className="w-5 h-5" /> Configurações
          </button>
          <div className="pt-4 mt-4 border-t border-slate-100">
              <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-xl transition-all font-bold text-sm text-red-500 hover:bg-red-50">
                <LogOut className="w-5 h-5" /> Sair da Conta
              </button>
          </div>
        </nav>
      </div>

      <div className="flex-1 p-4 md:p-10 max-w-7xl mx-auto w-full">
          {/* Main Content based on activeTab */}
          {activeTab === 'dashboard' && (
              <div className="animate-in fade-in space-y-6 md:space-y-8">
                  <div className="flex justify-between items-center">
                      <h1 className="text-2xl md:text-4xl font-black text-ocean-950 uppercase tracking-tight">Dashboard</h1>
                      <button onClick={handleCreatePost} className="bg-ocean-600 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-ocean-600/20 hover:bg-ocean-700 transition-all">
                          <Plus size={18} /> NOVA MATÉRIA
                      </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      <div className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-slate-100">
                          <div className="flex items-center gap-4 mb-4">
                              <div className="bg-ocean-50 p-3 rounded-xl text-ocean-600"><FileText size={24} /></div>
                              <h3 className="text-slate-500 text-xs md:text-sm font-black uppercase tracking-widest">Matérias Totais</h3>
                          </div>
                          <p className="text-3xl md:text-5xl font-black text-ocean-950 tracking-tighter">{posts.length}</p>
                      </div>
                      
                      <div className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-slate-100">
                          <div className="flex items-center gap-4 mb-4">
                              <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600"><CheckCircle size={24} /></div>
                              <h3 className="text-slate-500 text-xs md:text-sm font-black uppercase tracking-widest">Publicadas</h3>
                          </div>
                          <p className="text-3xl md:text-5xl font-black text-ocean-950 tracking-tighter">{posts.filter(p => p.status === 'published').length}</p>
                      </div>

                      <div className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-slate-100">
                          <div className="flex items-center gap-4 mb-4">
                              <div className="bg-amber-50 p-3 rounded-xl text-amber-600"><Globe size={24} /></div>
                              <h3 className="text-slate-500 text-xs md:text-sm font-black uppercase tracking-widest">Alcance Estimado</h3>
                          </div>
                          <p className="text-3xl md:text-5xl font-black text-ocean-950 tracking-tighter">
                            {posts.filter(p => p.status === 'published').length * 124}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">Visitas nos últimos 30 dias</p>
                      </div>
                  </div>
              </div>
          )}

          {activeTab === 'posts' && (
            <div className="animate-in fade-in space-y-6 md:space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl md:text-4xl font-black text-ocean-950 uppercase tracking-tight">Minhas Matérias</h1>
                    <button onClick={handleCreatePost} className="bg-ocean-600 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-ocean-600/20 hover:bg-ocean-700 transition-all">
                        <Plus size={18} /> NOVA MATÉRIA
                    </button>
                </div>

                {posts.length === 0 ? (
                    <div className="p-12 md:p-20 text-center bg-white rounded-[2rem] md:rounded-[3rem] border border-dashed border-slate-200">
                        <FileText className="w-16 h-16 text-slate-200 mx-auto mb-4 md:w-[80px] md:h-[80px]" />
                        <h3 className="text-lg md:text-xl font-black text-ocean-950 uppercase tracking-tight">Nenhuma matéria encontrada</h3>
                        <p className="text-slate-400 font-bold text-sm md:text-base mb-6">Comece a escrever sua primeira matéria para o guia.</p>
                        <button
                            onClick={handleCreatePost}
                            className="px-8 py-4 bg-ocean-50 text-ocean-600 rounded-2xl hover:bg-ocean-100 font-black text-xs uppercase tracking-widest flex items-center gap-2 mx-auto transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            CRIAR MINHA PRIMEIRA MATÉRIA
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:gap-6">
                        {/* Mobile List / Desktop Table */}
                        <div className="hidden md:block bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Matéria</th>
                                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</th>
                                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {posts.map(post => (
                                        <tr key={post.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                                            <td className="p-6">
                                                <div className="font-black text-ocean-950 group-hover:text-ocean-600 transition-colors">{post.title}</div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{post.category}</div>
                                            </td>
                                            <td className="p-6 text-slate-500 font-bold text-sm">
                                                {new Date(post.date).toLocaleDateString('pt-BR')}
                                            </td>
                                            <td className="p-6">
                                                <span className={`px-3 py-1 text-[10px] rounded-lg font-black uppercase tracking-widest ${post.status === 'published' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                                                    {post.status === 'published' ? 'Publicado' : 'Rascunho'}
                                                </span>
                                            </td>
                                            <td className="p-6 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => handleEditPost(post)} className="p-2.5 text-slate-400 hover:text-ocean-600 hover:bg-ocean-50 rounded-xl transition-all"><Pencil size={18} /></button>
                                                    <button onClick={() => handleDeletePost(post.id)} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-4">
                            {posts.map(post => (
                                <div key={post.id} className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-black text-ocean-950 text-sm leading-tight mb-1">{post.title}</h4>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{post.category}</span>
                                                <span className="text-slate-300">•</span>
                                                <span className="text-[9px] text-slate-400 font-bold">{new Date(post.date).toLocaleDateString('pt-BR')}</span>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-0.5 text-[8px] rounded-md font-black uppercase tracking-widest shrink-0 ${post.status === 'published' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                                            {post.status === 'published' ? 'PUB' : 'RAS'}
                                        </span>
                                    </div>
                                    <div className="flex gap-2 pt-2 border-t border-slate-50">
                                        <button onClick={() => handleEditPost(post)} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-50 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest"><Pencil size={14} /> EDITAR</button>
                                        <button onClick={() => handleDeletePost(post.id)} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-500 rounded-xl font-black text-[10px] uppercase tracking-widest"><Trash2 size={14} /> EXCLUIR</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="animate-in fade-in space-y-6 md:space-y-8">
                <h1 className="text-2xl md:text-4xl font-black text-ocean-950 uppercase tracking-tight">Configurações</h1>
                
                <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-sm border border-slate-100">
                    <h3 className="text-lg md:text-2xl font-black text-ocean-950 uppercase tracking-tight mb-6 md:mb-8">Perfil do Jornalista</h3>
                    <div className="space-y-6 md:space-y-8 max-w-2xl">
                        <div className="flex flex-col md:flex-row gap-6 md:items-center">
                            <div className="shrink-0">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Foto de Perfil</label>
                                <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] overflow-hidden bg-slate-100 border-4 border-white shadow-xl">
                                    {profile.avatarUrl ? (
                                        <img src={profile.avatarUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={32} /></div>
                                    )}
                                </div>
                            </div>
                            <div className="flex-1">
                                <ImageUpload
                                    currentImage={profile.avatarUrl}
                                    onImageSelect={(base64) => setProfile({...profile, avatarUrl: base64})}
                                    label="Alterar Foto"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Profissão / Título</label>
                                <input type="text" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-ocean-500/20 outline-none font-bold text-sm" value={profile.profession || ''} onChange={e => setProfile({...profile, profession: e.target.value})} placeholder="Ex: Jornalista Gastronômico" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Localização</label>
                                <input type="text" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-ocean-500/20 outline-none font-bold text-sm" value={profile.location || ''} onChange={e => setProfile({...profile, location: e.target.value})} placeholder="Ex: Região dos Lagos, RJ" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Especialidades (separadas por vírgula)</label>
                            <input type="text" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-ocean-500/20 outline-none font-bold text-sm" value={profile.specialties?.join(', ') || ''} onChange={e => setProfile({...profile, specialties: e.target.value.split(',').map(s => s.trim())})} placeholder="Ex: Gastronomia, Turismo, Eventos" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Instagram</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">@</span>
                                    <input type="text" className="w-full p-4 pl-8 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-ocean-500/20 outline-none font-bold text-sm" value={profile.instagram || ''} onChange={e => setProfile({...profile, instagram: e.target.value})} placeholder="seu.perfil" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Website / Portfólio</label>
                                <input type="text" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-ocean-500/20 outline-none font-bold text-sm" value={profile.website || ''} onChange={e => setProfile({...profile, website: e.target.value})} placeholder="https://seusite.com" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Biografia / Quem é</label>
                            <textarea
                                className="w-full h-32 p-4 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-ocean-500/20 outline-none font-medium text-sm resize-none"
                                value={profile.bio || ''}
                                onChange={e => setProfile({...profile, bio: e.target.value})}
                                placeholder="Conte um pouco sobre sua trajetória e foco jornalístico..."
                            />
                        </div>

                        <button
                            className="w-full md:w-auto px-10 py-4 bg-ocean-600 text-white rounded-2xl hover:bg-ocean-700 font-black text-xs uppercase tracking-widest shadow-lg shadow-ocean-600/20 transition-all active:scale-95"
                            onClick={async () => {
                                const { updateUser } = await import('../services/dataService');
                                await updateUser({ ...currentUser, ...profile } as User);
                                notify('success', 'Perfil atualizado com sucesso!');
                            }}
                        >
                            SALVAR ALTERAÇÕES NO PERFIL
                        </button>
                    </div>

                    <div className="mt-12 md:mt-20 pt-12 border-t border-slate-100">
                        <h3 className="text-lg md:text-2xl font-black text-ocean-950 uppercase tracking-tight mb-6 md:mb-8">Gerenciar Categorias</h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {categories.map(cat => (
                                <div key={cat.id} className="p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-black text-ocean-950 uppercase tracking-tight">{cat.name}</h4>
                                        <span className="text-[10px] bg-white px-2 py-1 rounded-md text-slate-400 font-black uppercase tracking-widest border border-slate-100">{cat.subcategories.length} SUBS</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {cat.subcategories.map(sub => <span key={sub.id} className="px-3 py-1.5 bg-white rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest border border-slate-100">{sub.name}</span>)}
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <input type="text" id={`sub-${cat.id}`} placeholder="Nova Subcategoria" className="flex-1 p-3 bg-white border border-slate-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-ocean-500/20" />
                                        <button onClick={async () => {
                                            const input = document.getElementById(`sub-${cat.id}`) as HTMLInputElement;
                                            if (!input.value) return;
                                            await saveDicasSubcategory(cat.id, input.value);
                                            input.value = '';
                                            notify('success', 'Subcategoria adicionada!');
                                            loadData();
                                        }} className="bg-ocean-950 text-white px-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all">ADD</button>
                                    </div>
                                </div>
                            ))}
                            <div className="p-6 bg-ocean-50 rounded-[1.5rem] border border-ocean-100 flex flex-col justify-center gap-4">
                                <p className="text-ocean-600 font-black text-xs uppercase tracking-widest text-center">Criar Nova Categoria Principal</p>
                                <div className="flex gap-2">
                                    <input type="text" id="new-cat" placeholder="Nome da Categoria" className="flex-1 p-3 bg-white border border-ocean-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-ocean-500/20" />
                                    <button onClick={async () => {
                                        const input = document.getElementById('new-cat') as HTMLInputElement;
                                        if (!input.value) return;
                                        await saveDicasCategory({ id: input.value.toLowerCase().replace(/\s+/g, '-'), name: input.value, subcategories: [] });
                                        input.value = '';
                                        notify('success', 'Categoria criada com sucesso!');
                                        loadData();
                                    }} className="bg-ocean-600 text-white px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-ocean-700 transition-all shadow-md">CRIAR</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          )}
      </div>
      {linkPrompt && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">Inserir Link</h3>
              <button onClick={() => { setLinkPrompt(false); setLinkUrl(''); }} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <input 
              type="text"
              autoFocus
              className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="https://exemplo.com" 
              value={linkUrl} 
              onChange={e => setLinkUrl(e.target.value)} 
            />
            <div className="flex gap-3">
              <button 
                onClick={() => { setLinkPrompt(false); setLinkUrl(''); }} 
                className="flex-1 px-4 py-2 rounded-lg font-bold text-gray-500 bg-gray-100"
              >
                CANCELAR
              </button>
              <button 
                onClick={() => {
                  if (linkUrl) {
                      applyFormat(`a href="${linkUrl}"`);
                  }
                  setLinkPrompt(false);
                  setLinkUrl('');
                }}
                className="flex-1 px-4 py-2 rounded-lg font-bold text-white bg-blue-600"
              >
                INSERIR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
