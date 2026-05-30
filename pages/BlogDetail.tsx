import React, { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, Share2, Clock, Check, X, Instagram, Globe, Award, Heart, MapPin, Sparkles, Navigation, ChevronRight, MessageSquare, Send, Zap } from 'lucide-react';
import { SEO } from '../components/SEO';
import { BlogPost, User as UserType } from '../types';
import { getBlogPostById, getAllUsers, getCurrentUser, getBlogPostComments, addBlogPostComment, saveBlogPost } from '../services/dataService';
import { useNotification } from '../components/NotificationSystem';

interface BlogDetailProps {
  postId: string;
  onNavigate: (page: string, params?: any) => void;
}

export const BlogDetail: React.FC<BlogDetailProps> = ({ postId, onNavigate }) => {
  const { notify } = useNotification();
  const [post, setPost] = useState<BlogPost | undefined>(undefined);
  const [author, setAuthor] = useState<UserType | undefined>(undefined);
  const [showAuthorModal, setShowAuthorModal] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const [comments, setComments] = useState<any[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [guestName, setGuestName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);

  const [showConnectNameModal, setShowConnectNameModal] = useState(false);
  const [connectNameInput, setConnectNameInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  const handleToggleConnect = async (customName?: string) => {
    if (!post) return;
    
    let finalName = '';
    if (currentUser) {
      finalName = `${currentUser.name} ${currentUser.surname || ''}`.trim();
    } else if (customName) {
      finalName = customName.trim();
    } else {
      setShowConnectNameModal(true);
      return;
    }

    const currentList = post.connectedUsers || [];
    let newList: string[] = [];
    let localConnected = false;

    if (currentList.includes(finalName)) {
      newList = currentList.filter(name => name !== finalName);
      localConnected = false;
      notify('success', 'Você se desconectou deste evento/roteiro.');
    } else {
      newList = [...currentList, finalName];
      localConnected = true;
      notify('success', `Sucesso! Você se conectou ao evento/roteiro como ${finalName}.`);
    }

    const updatedPost: BlogPost = {
      ...post,
      connectedUsers: newList
    };

    try {
      await saveBlogPost(updatedPost);
      setPost(updatedPost);
      setIsConnected(localConnected);

      const savedConnections = localStorage.getItem('lagos_go_connected_posts');
      let parsed: string[] = [];
      if (savedConnections) {
        parsed = JSON.parse(savedConnections) as string[];
      }
      if (localConnected) {
        if (!parsed.includes(postId)) parsed.push(postId);
      } else {
        parsed = parsed.filter(id => id !== postId);
      }
      localStorage.setItem('lagos_go_connected_posts', JSON.stringify(parsed));
    } catch (err) {
      console.error(err);
      notify('error', 'Erro ao processar sua conexão.');
    }
  };

  const getSocialProofText = () => {
    const realList = post?.connectedUsers || [];
    const baseSeedCount = Math.abs(postId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 25) + 12;
    
    if (realList.length === 0) {
      const seeds = ['Lucas', 'Gabriela', 'Felipe', 'Mariana', 'Thiago', 'Beatriz', 'Rodrigo', 'Juliana', 'Bruno', 'Camila'];
      const seed1 = seeds[baseSeedCount % seeds.length];
      const seed2 = seeds[(baseSeedCount + 3) % seeds.length];
      const totalCount = baseSeedCount;
      return (
        <span className="text-xs text-slate-600 font-medium leading-relaxed">
          💙 <b>{seed1}</b>, <b>{seed2}</b> e outras <b>{totalCount} pessoas</b> se conectaram a este roteiro/evento
        </span>
      );
    } else if (realList.length === 1) {
      const totalCount = baseSeedCount;
      return (
        <span className="text-xs text-slate-600 font-medium leading-relaxed">
          💙 <b>{realList[0]}</b> e outras <b>{totalCount} pessoas</b> se conectaram a este roteiro/evento
        </span>
      );
    } else {
      const firstUser = realList[realList.length - 1];
      const secondUser = realList[realList.length - 2];
      const remainingCount = baseSeedCount + realList.length - 2;
      return (
        <span className="text-xs text-slate-600 font-medium leading-relaxed">
          💙 <b>{firstUser}</b>, <b>{secondUser}</b> e outras <b>{remainingCount} pessoas</b> se conectaram a este roteiro/evento
        </span>
      );
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    setIsSubmitting(true);
    try {
      let finalName = guestName.trim() || 'Usuário Anônimo';
      let avatar = '';
      let uid = 'guest';

      if (currentUser) {
        finalName = `${currentUser.name} ${currentUser.surname || ''}`.trim();
        avatar = currentUser.avatarUrl || '';
        uid = currentUser.id;
      }

      const newComm = await addBlogPostComment(postId, {
        userId: uid,
        userName: finalName,
        userAvatar: avatar,
        content: newCommentText.trim()
      });

      setComments(prev => [newComm, ...prev]);
      setNewCommentText('');
      setGuestName('');
      notify('success', 'Comentário enviado com sucesso!');
    } catch (error) {
      console.error(error);
      notify('error', 'Erro ao enviar comentário.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await getBlogPostById(postId);
      setPost(data);

      try {
         const comms = await getBlogPostComments(postId);
         setComments(comms || []);
         const user = getCurrentUser();
         setCurrentUser(user);

         const savedConnections = localStorage.getItem('lagos_go_connected_posts');
         let localConnected = false;
         if (savedConnections) {
           const parsed = JSON.parse(savedConnections) as string[];
           localConnected = parsed.includes(postId);
         }
         const finalName = user ? `${user.name} ${user.surname || ''}`.trim() : '';
         const userConnected = finalName && data?.connectedUsers?.includes(finalName);
         setIsConnected(!!(localConnected || userConnected));
      } catch (err) {
         console.warn("Could not load comments/user:", err);
      }

      if (data?.authorId) {
          const users = await getAllUsers();
          let foundAuthor = users.find(u => u.id === data.authorId);
          if (!foundAuthor) {
              const realYuri = users.find(u => (u.email || '').toLowerCase() === 'contato.yuriguida@gmail.com');
              if (realYuri && (data.authorId === 'yuri_guida' || data.authorId === realYuri.id)) {
                  foundAuthor = realYuri;
              }
          }
          if (!foundAuthor && (data.authorId === 'yuri_guida' || data.authorId?.toLowerCase() === 'yuri guida')) {
              foundAuthor = {
                  id: 'yuri_guida',
                  name: 'Yuri Guida',
                  email: 'contato.yuriguida@gmail.com',
                  role: 'JOURNALIST',
                  avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
                  profession: 'Editor-Chefe / Lagos GO Feed',
                  bio: 'Yuri Guida é o idealizador e produtor de conteúdo oficial do Lagos GO, trazendo dicas locais quentes e roteiros testados de ponta a ponta na Região dos Lagos.',
                  instagram: 'yuriguida'
              } as any;
          }
          setAuthor(foundAuthor);
      }
    };
    fetchData();

    // Load favorite states
    try {
      const savedLikes = localStorage.getItem('lagos_go_liked_posts');
      if (savedLikes) {
        const parsed = JSON.parse(savedLikes) as string[];
        setIsLiked(parsed.includes(postId));
      }
    } catch (e) {
      console.warn("Could not load like state", e);
    }
  }, [postId]);

  if (!post) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-50">
              <div className="text-center">
                  <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-slate-500 font-bold text-sm">Carregando conteúdo premium...</p>
              </div>
          </div>
      );
  }

  const handleShare = async () => {
      const shareData = {
          title: post.title,
          text: post.excerpt,
          url: window.location.href
      };
      if (navigator.share) {
          try { await navigator.share(shareData); } catch (err) { /* ignore */ }
      } else {
          navigator.clipboard.writeText(window.location.href);
          notify('success', "Link copiado!");
      }
  };

  const toggleLike = () => {
    let likedList: string[] = [];
    try {
      const savedLikes = localStorage.getItem('lagos_go_liked_posts');
      if (savedLikes) {
        likedList = JSON.parse(savedLikes) as string[];
      }
    } catch (e) {
      console.warn(e);
    }

    let updated: string[];
    if (likedList.includes(postId)) {
      updated = likedList.filter(id => id !== postId);
      setIsLiked(false);
      notify('info', 'Removido dos favoritos');
    } else {
      updated = [...likedList, postId];
      setIsLiked(true);
      notify('success', 'Adicionado aos favoritos!');
    }
    localStorage.setItem('lagos_go_liked_posts', JSON.stringify(updated));
  };

  // Extract highlights out of text or generic content based on category
  const getHighlightsForPost = () => {
    if (post.category === 'Roteiros') {
      return [
        'Acesso prioritário às praias mais concorridas ao amanhecer.',
        'Rotas de barcos credenciados privativos para maior exclusão.',
        'Mirantes estratégicos com nascer e pôr do sol imbatíveis.'
      ];
    }
    if (post.category === 'Gastronomia') {
      return [
        'Opções de peixes frescos pescados diretamente no dia.',
        'Menu degustação harmonizado com vinhos finos ou cervejas locais.',
        'Descontos especiais utilizando o Konecta Lagos em parceiros selecionados.'
      ];
    }
    if (post.category === 'Eventos') {
      return [
        'Acesso gratuito ou ingressos antecipados exclusivos.',
        'Cortesias exclusivas de boas-vindas na entrada de luaus.',
        'Áreas vip/reservadas para membros ativos do Lagos GO.'
      ];
    }
    return [
      'Informações exclusivas apuradas com guias locais credenciados.',
      'Dicas práticas de economia de tempo e fuga de congestionamentos.',
      'Mapeamento completo de estacionamento e acessibilidade.'
    ];
  };

  const highlights = getHighlightsForPost();

  // Helper to safely format body contents (handling list headers and plain paragraph blocks)
  const renderFormattedContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-4" />;
      
      // Secondary header marker ###
      if (trimmed.startsWith('###')) {
        return (
          <h3 key={idx} className="text-xl font-extrabold text-slate-900 mt-8 mb-3 tracking-tight flex items-center gap-2">
            <span className="w-1.5 h-6 bg-red-500 rounded-full inline-block"></span>
            {trimmed.replace('###', '').trim()}
          </h3>
        );
      }
      
      // Header marker ## or #
      if (trimmed.startsWith('##') || trimmed.startsWith('#')) {
        return (
          <h2 key={idx} className="text-2xl font-black text-slate-900 mt-10 mb-4 tracking-tight">
            {trimmed.replace(/^#+/, '').trim()}
          </h2>
        );
      }

      // Strong list marker **Text**
      if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
        return (
          <p key={idx} className="font-bold text-slate-800 text-lg mt-6 mb-2">
            {trimmed.replace(/\*\*/g, '').trim()}
          </p>
        );
      }

      return (
        <p key={idx} className="text-slate-600 text-sm md:text-[15px] leading-relaxed mb-4 font-normal">
          {trimmed}
        </p>
      );
    });
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-24 font-sans">
      <SEO 
        title={post.title}
        description={post.excerpt}
        image={post.imageUrl}
        type="article"
        url={`/blog/${postId}`}
      />

      {/* STUNNING HERO HEADER PHOTO - Exact Screen Mockup #2 Match */}
      <div className="relative h-80 md:h-[55vh] w-full overflow-hidden">
        <img 
          src={post.imageUrl} 
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover" 
          alt={post.title} 
        />
        {/* Shadow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />
        
        {/* Back and Bookmark Action floating bar */}
        <div className="absolute top-4 inset-x-4 flex justify-between items-center z-20">
          <button 
            onClick={() => onNavigate('blog')}
            className="bg-white/95 hover:bg-white text-slate-800 p-2.5 rounded-full shadow-lg transition-transform active:scale-90"
          >
            <ArrowLeft size={20} />
          </button>

          <button 
            onClick={toggleLike}
            className="bg-white/95 hover:bg-white text-slate-800 p-2.5 rounded-full shadow-lg transition-all active:scale-95 flex items-center justify-center"
          >
            <Heart size={20} className={isLiked ? "fill-red-500 text-red-500 scale-110" : "text-slate-500"} />
          </button>
        </div>

        {/* Floating title block matching premium editorial styles */}
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 max-w-4xl mx-auto text-white">
          <div className="flex gap-2 mb-3">
            <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-md">
              {post.category}
            </span>
            <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-white/10">
              {post.tags?.[0] || 'Destaque'}
            </span>
          </div>

          <h1 className="text-2.5xl md:text-5xl font-black leading-tight mb-3 drop-shadow-md tracking-tight">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-slate-300 text-xs font-semibold">
            <MapPin size={13} className="text-red-400 shrink-0" />
            <span>{post.eventLocation || 'Região dos Lagos, RJ'}</span>
            <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
            <Calendar size={13} className="shrink-0" />
            <span>
              {post.eventDate 
                ? new Date(post.eventDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
                : new Date(post.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* CONTENT & HIGHLIGHT PANEL */}
      <div className="max-w-3xl mx-auto px-4 pt-8 pb-12">
        <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-sm border border-slate-100">
          
          {/* AUTHOR MINI PROFILE (Matching mockup style card) */}
          {author && (
            <div 
              onClick={() => setShowAuthorModal(true)}
              className="flex items-center gap-4 mb-8 p-4 bg-slate-50 border border-slate-100 rounded-2xl cursor-pointer group hover:bg-slate-100 transition-colors"
            >
              <div className="relative shrink-0">
                <img 
                  src={author.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'} 
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                  alt={post.author}
                />
                {author.isPrime && (
                  <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full p-0.5 border border-white shadow-sm">
                    <Award size={10} className="fill-current text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-extrabold text-slate-800 text-sm leading-none flex items-center gap-1.5 mb-1">
                  {author.name} {author.surname || ''}
                  {author.isPrime && <span className="text-[9px] bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded">PRIME</span>}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-1">{author.bio || `Colunista e jornalista especialista na cobertura de ${post.category}.`}</p>
                <span className="text-[10px] text-red-500 font-bold flex items-center gap-0.5 mt-0.5">
                  Ver perfil do jornalista <ChevronRight size={10} />
                </span>
              </div>
            </div>
          )}

          {/* EXCERPT BIG BOX */}
          <div className="text-slate-700 text-base md:text-lg leading-relaxed font-semibold italic border-l-4 border-red-500 pl-5 py-2 mb-8 bg-slate-50 rounded-r-2xl">
            {post.excerpt}
          </div>

          {/* DYNAMIC CONTENT CONTAINER */}
          <div className="prose prose-slate max-w-none mb-10 text-slate-700 font-normal">
            {renderFormattedContent(post.content)}
          </div>

          {/* TRIP HIGHLIGHTS / DESTAQUES DA DICA - Mockup #2 Match */}
          {highlights && highlights.length > 0 && (
            <div className="bg-red-50/60 border border-red-100/80 rounded-[1.8rem] p-6 mb-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 text-red-500 select-none pointer-events-none">
                <Sparkles size={80} />
              </div>

              <h3 className="font-extrabold text-slate-900 text-[15px] uppercase tracking-wider mb-4 flex items-center gap-2">
                ⚡ Destaques da dica
              </h3>
              
              <ul className="space-y-3">
                {highlights.map((hText, hIdx) => (
                  <li key={hIdx} className="flex items-start gap-3 text-slate-700 text-sm">
                    <span className="bg-red-500/15 text-red-600 rounded-full p-1 mt-0.5 shrink-0 flex items-center justify-center">
                      <Check size={12} strokeWidth={3} />
                    </span>
                    <span className="font-medium leading-relaxed">{hText}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* IDEAL LENGTH & INFORMATION BLOCK */}
          <div className="grid grid-cols-2 gap-4 py-5 border-t border-b border-slate-100 mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-slate-100 p-2.5 rounded-2xl text-slate-500">
                <Clock size={20} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block leading-none">Tempo Ideal</span>
                <span className="text-slate-800 font-extrabold text-sm">5 Horas</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-slate-100 p-2.5 rounded-2xl text-slate-500">
                <Navigation size={20} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block leading-none">Dificuldade</span>
                <span className="text-slate-800 font-extrabold text-sm">Fácil dependente</span>
              </div>
            </div>
          </div>

          {/* ACTION BUTTON & SHARE - Mockup #2 Orange/Red Button Match */}
          <div className="flex flex-col gap-3">
            <button 
              onClick={handleShare}
              className="w-full bg-[#ff5a1f] hover:bg-[#e0450f] text-white py-4 px-6 rounded-2xl font-black text-sm tracking-widest uppercase shadow-lg shadow-orange-500/20 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <Share2 size={18} /> Compartilhar Roteiro
            </button>
            <button 
              onClick={() => handleToggleConnect()}
              className={`w-full py-4 px-6 rounded-2xl font-black text-sm tracking-widest uppercase active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                isConnected 
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/10' 
                  : 'bg-slate-950 hover:bg-slate-900 text-white shadow-sm'
              }`}
            >
              <Zap size={18} className={isConnected ? "fill-current" : ""} /> {isConnected ? 'Konectado!' : 'Konectar-se!'}
            </button>
            
            {post && (
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-center gap-3 mt-1.5 animate-in fade-in duration-300">
                <div className="flex -space-x-1.5 shrink-0">
                  <img className="w-6 h-6 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=60&q=80" alt="avatar" />
                  <img className="w-6 h-6 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=60&q=80" alt="avatar" />
                  <img className="w-6 h-6 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=60&q=80" alt="avatar" />
                </div>
                {getSocialProofText()}
              </div>
            )}
          </div>
        </div>

        {/* COMMENTS SECTION (Direct and highly elegant) */}
        <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-sm border border-slate-100 mt-6 animate-in fade-in">
          <h3 className="font-extrabold text-slate-900 text-lg mb-6 flex items-center gap-2">
            <MessageSquare size={20} className="text-[#ff5a1f]" /> Comentários e Dicas ({comments.length})
          </h3>

          {/* New Comment Input Box */}
          <form onSubmit={handleCommentSubmit} className="mb-8 space-y-4">
             {!currentUser && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Seu Nome *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: João Silva" 
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-400 focus:bg-white transition-all shadow-2xs"
                    />
                  </div>
                </div>
             )}
             
             <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Sua Mensagem *</label>
                <textarea 
                  required
                  rows={3}
                  placeholder={currentUser ? `Comentar como ${currentUser.name}...` : "Escreva o seu comentário ou dica sobre este post..."}
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-400 focus:bg-white transition-all shadow-2xs resize-none"
                />
             </div>
             
             <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#ff5a1f] hover:bg-[#e0450f] disabled:opacity-50 text-white font-black text-xs uppercase tracking-widest px-6 py-3 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  {isSubmitting ? 'Enviando...' : (
                    <>
                      <Send size={14} /> Enviar Comentário
                    </>
                  )}
                </button>
             </div>
          </form>

          {/* List of individual Comments */}
          <div className="space-y-4 divide-y divide-slate-100">
             {comments.length > 0 ? (
                [...comments].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((comment, index) => (
                  <div key={comment.id || index} className="pt-4 first:pt-0 flex gap-4 items-start pb-4 last:border-none last:pb-0">
                     <img 
                       src={comment.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'} 
                       referrerPolicy="no-referrer"
                       className="w-10 h-10 rounded-full object-cover border border-slate-100 shrink-0" 
                       alt={comment.userName}
                     />
                     <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1 gap-2">
                           <span className="font-extrabold text-slate-800 text-sm truncate">{comment.userName}</span>
                           <span className="text-[10px] text-slate-400 font-mono font-semibold shrink-0">
                             {new Date(comment.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                           </span>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{comment.content}</p>
                     </div>
                  </div>
                ))
             ) : (
                <div className="text-center py-8 text-slate-400 font-medium text-sm">
                   Nenhum comentário por enquanto. Deixe suas dicas e impressões!
                </div>
             )}
          </div>
        </div>
      </div>

      {/* AUTHOR/JOURNALIST FULL MODAL */}
      {showAuthorModal && author && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-300">
            
            {/* Header Art banner */}
            <div className="h-32 bg-gradient-to-br from-red-500 to-amber-400 relative overflow-hidden">
              <button 
                onClick={() => setShowAuthorModal(false)}
                className="absolute top-4 right-4 bg-black/25 text-white p-2 rounded-full hover:bg-black/40 transition-colors backdrop-blur-sm"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Profile Info */}
            <div className="px-6 pb-8 relative text-center">
              <div className="w-24 h-24 rounded-full border-[6px] border-white shadow-xl -mt-12 mb-3 mx-auto overflow-hidden bg-white">
                <img 
                  src={author.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover" 
                />
              </div>
              
              <div className="mb-6">
                <h2 className="text-xl font-black text-slate-800 flex items-center justify-center gap-1.5 mb-1 text-center">
                  {author.name} {author.surname || ''}
                  {author.isPrime && <Award size={18} className="text-amber-500 fill-amber-500" />}
                </h2>
                <p className="text-red-500 font-extrabold text-[10px] uppercase tracking-widest mb-3">
                  {author.profession || 'Colunista de Lagos GO'}
                </p>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed italic px-2 font-light">
                  &ldquo;{author.bio || 'Compartilhando as melhores e mais seguras experiências escondidas na histórica Região dos Lagos.'}&rdquo;
                </p>
              </div>

              {/* Contacts info row */}
              <div className="flex gap-2 justify-center">
                {author.instagram && (
                  <a 
                    href={`https://instagram.com/${author.instagram.replace('@','')}`} 
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md hover:-translate-y-0.5 transition-all"
                  >
                    <Instagram size={14} /> Instagram
                  </a>
                )}
                <a 
                  href={`mailto:${author.email}`}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md hover:bg-slate-900 hover:-translate-y-0.5 transition-all"
                >
                  <Globe size={14} /> Contato
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sleek Custom Connection Name Modal */}
      {showConnectNameModal && (
        <div className="fixed inset-0 bg-black/60 shadow-2xl flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-[2.2rem] border border-slate-100 p-6 max-w-sm w-full space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                <Zap size={18} className="fill-orange-50" />
              </div>
              <button 
                onClick={() => setShowConnectNameModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div>
              <h4 className="text-lg font-black text-slate-800 tracking-tight leading-snug">Konectar-se ao Roteiro / Evento</h4>
              <p className="text-xs text-slate-500 font-medium mt-1">Insira seu nome para aparecer no painel de conexões deste evento.</p>
            </div>
            <input 
              type="text" 
              placeholder="Seu Nome Completo"
              value={connectNameInput}
              onChange={e => setConnectNameInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  if (connectNameInput.trim()) {
                    handleToggleConnect(connectNameInput);
                    setShowConnectNameModal(false);
                    setConnectNameInput('');
                  }
                }
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-400 focus:bg-white transition-all shadow-2xs"
              autoFocus
            />
            <button 
              onClick={() => {
                if (connectNameInput.trim()) {
                  handleToggleConnect(connectNameInput);
                  setShowConnectNameModal(false);
                  setConnectNameInput('');
                }
              }}
              className="w-full bg-[#ff5a1f] hover:bg-[#e0450f] text-white py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer shadow-sm"
            >
              Confirmar Conexão
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
