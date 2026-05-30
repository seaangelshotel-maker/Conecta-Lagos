import React, { useState, useEffect } from 'react';
import { BlogPost, User, AppCategory, BlogAd } from '../types';
import { getBlogPosts, getAllUsers, getDicasCategories, getBlogAds } from '../services/dataService';
import { Calendar, ChevronRight, Search, Heart, Clock, Compass, BookOpen, Share2, Award, User as UserIcon, Utensils, Newspaper, Lightbulb, Layers, Flame, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BlogProps {
  onNavigate?: (page: string, params?: any) => void;
}

const DEFAULT_ADS: BlogAd[] = [
  {
    id: 'ad1',
    title: 'Passeio de Barco VIP com Capitão Arraial • 15% OFF',
    subtitle: 'Navegue pelo Caribe de Arraial com atendimento classe A e parada exclusiva na Gruta Azul.',
    imageUrl: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1200&q=80',
    tag: 'Patrocinado',
    actionLabel: 'Ver Passeios',
    badgeColor: 'bg-amber-500/95 text-white',
    targetCategory: 'Passeios',
    active: true,
    order: 0
  },
  {
    id: 'ad2',
    title: 'Festival da Lagosta em Arraial do Cabo',
    subtitle: 'Neste final de semana, venha saborear pratos exclusivos nos melhores restaurantes com preços especiais!',
    imageUrl: 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=1200&q=80',
    tag: 'Destaque Gastronômico',
    actionLabel: 'Ver Gastronomia',
    badgeColor: 'bg-red-500/95 text-white',
    targetCategory: 'Gastronomia',
    active: true,
    order: 1
  }
];

export const Blog: React.FC<BlogProps> = ({ onNavigate }) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<AppCategory[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [showOnlyLiked, setShowOnlyLiked] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [adsSlides, setAdsSlides] = useState<BlogAd[]>(DEFAULT_ADS);

  useEffect(() => {
    if (adsSlides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % adsSlides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [adsSlides.length]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [p, u, c, ads] = await Promise.all([
          getBlogPosts().catch(err => { console.error("Error fetching blog posts:", err); return []; }),
          getAllUsers().catch(err => { console.error("Error fetching users:", err); return []; }),
          getDicasCategories().catch(err => { console.error("Error fetching categories:", err); return []; }),
          getBlogAds().catch(err => { console.error("Error fetching blog ads:", err); return []; })
        ]);
        setPosts(p || []);
        setUsers(u || []);
        setCategories(c || []);
        if (ads && ads.filter(a => a.active).length > 0) {
          setAdsSlides(ads.filter(a => a.active));
        } else {
          setAdsSlides(DEFAULT_ADS);
        }
      } catch (err) {
        console.error("Critical error in fetchData on Blog page:", err);
      }
    };
    fetchData();

    // Listen to real-time events from administrative updates
    window.addEventListener('dataUpdated', fetchData);

    // Load liked posts from localStorage
    try {
      const savedLikes = localStorage.getItem('lagos_go_liked_posts');
      if (savedLikes) {
        setLikedPosts(JSON.parse(savedLikes));
      }
    } catch (e) {
      console.warn("Could not load liked posts", e);
    }

    return () => {
      window.removeEventListener('dataUpdated', fetchData);
    };
  }, []);

  const handlePostClick = (postId: string) => {
    if (onNavigate) {
      onNavigate('blog-detail', { postId });
    }
  };

  const handleAuthorClick = (e: React.MouseEvent, authorId?: string) => {
    e.stopPropagation();
    if (onNavigate && authorId) {
      onNavigate('journalist-profile', { journalistId: authorId });
    }
  };

  const toggleLike = (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    let updated: string[];
    if (likedPosts.includes(postId)) {
      updated = likedPosts.filter(id => id !== postId);
    } else {
      updated = [...likedPosts, postId];
    }
    setLikedPosts(updated);
    try {
      localStorage.setItem('lagos_go_liked_posts', JSON.stringify(updated));
    } catch (e) {
      console.warn("Could not save liked posts", e);
    }
  };

  // Helper to find author
  const getAuthor = (authorId?: string) => {
    let found = users.find(u => u.id === authorId);
    if (!found && authorId === 'yuri_guida') {
      found = {
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
    return found;
  };

  // Filter posts based on search, category tab, and liked filter
  const filteredPosts = posts.filter(post => {
    const matchesSearch = 
      (post.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.excerpt || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.tags || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'Todos' || post.category === selectedCategory;
    const matchesLiked = !showOnlyLiked || likedPosts.includes(post.id);

    return matchesSearch && matchesCategory && matchesLiked;
  });

  // Hot right now / Destaques: First 3 posts matching category or general
  const hotPosts = posts.slice(0, 3);

  // Beautiful vector Lucide Icon mapping for categories (super elegant outline branding)
  const getCategoryIcon = (catName: string, size = 12) => {
    const c = catName.toLowerCase();
    if (c.includes('roteiro')) return <Compass size={size} />;
    if (c.includes('gastro')) return <Utensils size={size} />;
    if (c.includes('evento')) return <Sparkles size={size} />;
    if (c.includes('notícia')) return <Newspaper size={size} />;
    if (c.includes('dica')) return <Lightbulb size={size} />;
    return <Layers size={size} />;
  };

  return (
    <div className="pb-24 pt-4 min-h-screen bg-slate-50/50">
      {/* AUTOMATIC LANDING CAROUSEL (Publicidade / Destaque de Notícias) */}
      <div className="px-4 mb-6 max-w-7xl mx-auto w-full">
        <div className="relative h-48 md:h-64 rounded-[2.2rem] overflow-hidden shadow-lg border border-slate-100 group">
          {/* Slides Render */}
          <div className="w-full h-full relative">
            {adsSlides.map((slide, index) => {
              const isActive = index === currentSlide;
              return (
                <div 
                  key={slide.id}
                  onClick={() => {
                    if (onNavigate && slide.targetCategory) {
                      onNavigate('guide', { category: slide.targetCategory });
                    }
                  }}
                  className={`absolute inset-0 w-full h-full cursor-pointer transition-all duration-1000 ease-in-out ${isActive ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 scale-95 pointer-events-none'}`}
                >
                  <img 
                    src={slide.imageUrl}
                    referrerPolicy="no-referrer"
                    alt={slide.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
                  />
                  {/* Subtle Premium Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10"></div>
                  
                  {/* Slide Content */}
                  <div className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-8 md:right-8 text-white z-20">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${slide.badgeColor} mb-2.5 shadow-sm`}>
                      {slide.tag}
                    </span>
                    <h2 className="text-base sm:text-[19px] md:text-2.5xl font-black tracking-tight leading-snug mb-1 text-white pr-4 drop-shadow">
                      {slide.title}
                    </h2>
                    <p className="text-white/85 text-[11px] sm:text-xs md:text-sm line-clamp-1 max-w-2xl font-light">
                      {slide.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Dot Indicators */}
          <div className="absolute bottom-6 right-6 flex gap-1.5 z-20">
            {adsSlides.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentSlide(index);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-white w-4' : 'bg-white/40 hover:bg-white/60'}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* COMPACT FLOATING SEARCH BAR & SECTION TITLE */}
      <div className="px-4 mb-8 max-w-7xl mx-auto w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-1.5">
            Lagos GO Feed
          </h2>
          <p className="text-xs text-slate-500 font-medium">Informação premium, agenda local e os melhores roteiros.</p>
        </div>

        <div className="relative w-full md:max-w-xs shadow-sm rounded-2xl">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Search size={15} />
          </span>
          <input 
            type="text"
            placeholder="Buscar notícias, dicas ou roteiros..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl bg-white text-slate-800 placeholder-slate-400 font-semibold border border-slate-200 focus:ring-4 focus:ring-red-500/10 text-xs transition-all"
          />
        </div>
      </div>

      {/* QUICK CATEGORY CHIPS */}
      <div className="px-4 mb-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-3.5 px-1">
          <h3 className="text-slate-800 font-bold text-sm tracking-tight flex items-center gap-1.5">
            <Compass size={15} className="text-red-500" /> Categorias de Exploração
          </h3>
          <button 
            onClick={() => {
              setShowOnlyLiked(!showOnlyLiked);
              setSelectedCategory('Todos');
            }}
            className={`text-xs font-semibold flex items-center gap-1 px-3 py-1.5 rounded-full transition-all ${showOnlyLiked ? 'bg-red-50 text-red-500' : 'text-slate-500 hover:text-red-500'}`}
          >
            <Heart size={12} className={showOnlyLiked ? "fill-red-500 text-red-500" : "text-slate-400"} /> {showOnlyLiked ? "Ver Todos" : "Favoritos"}
          </button>
        </div>

        {/* Categories Horizontal Carousel */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 md:pb-0">
          <button 
            onClick={() => { setSelectedCategory('Todos'); setShowOnlyLiked(false); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-250 active:scale-95 ${selectedCategory === 'Todos' && !showOnlyLiked ? 'bg-red-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-800'}`}
          >
            <Layers size={13} /> Todos
          </button>
          {categories.map(cat => {
            const isSelected = selectedCategory === cat.name && !showOnlyLiked;
            return (
              <button 
                key={cat.id}
                onClick={() => { setSelectedCategory(cat.name); setShowOnlyLiked(false); }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-250 active:scale-95 ${isSelected ? 'bg-red-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-800'}`}
              >
                <span className={isSelected ? "text-white" : "text-slate-400"}>{getCategoryIcon(cat.name, 13)}</span> {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* "HOT RIGHT NOW" SECTION - Screen mockup exact match */}
      {selectedCategory === 'Todos' && !showOnlyLiked && searchQuery === '' && hotPosts.length > 0 && (
        <div className="px-4 mb-10 max-w-7xl mx-auto w-full">
          <div className="flex justify-between items-center mb-4 px-1">
            <h2 className="text-md font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Flame size={16} className="text-red-500 animate-pulse" /> Mais Lidas Agora <span className="text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-600 px-2 py-0.5 rounded-md">Hot now</span>
            </h2>
          </div>
          
          {/* Elegant horizontal scroll on mobile, responsive grid on desktop */}
          <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-6 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory hide-scrollbar pb-3 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
            {hotPosts.map(post => {
              const isLiked = likedPosts.includes(post.id);
              return (
                <div 
                  key={`hot_${post.id}`}
                  onClick={() => handlePostClick(post.id)}
                  className="relative h-72 md:h-80 w-[270px] sm:w-[320px] md:w-full shrink-0 snap-start rounded-[2rem] overflow-hidden shadow-md group cursor-pointer active:scale-98 transition-transform"
                >
                  <img 
                    src={post.imageUrl} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    alt={post.title}
                  />
                  {/* Subtle dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent"></div>
                  
                  {/* Floating favorite button */}
                  <button 
                    onClick={(e) => toggleLike(e, post.id)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center text-white border border-white/20 active:scale-90 hover:bg-white/40 transition-all shadow-md"
                  >
                    <Heart size={15} className={`transition-transform duration-200 ${isLiked ? 'fill-red-500 text-red-500 scale-110' : 'text-white'}`} />
                  </button>

                  <span className="absolute top-3 left-3 bg-white/80 backdrop-blur-sm text-[9px] font-black text-slate-800 px-2 py-0.5 rounded-md uppercase tracking-wide">
                    {post.category}
                  </span>

                  <div className="absolute bottom-0 left-0 w-full p-4">
                    <p className="text-[10px] text-amber-400 font-bold mb-1 flex items-center gap-1 font-mono uppercase">
                      <Clock size={10} /> 5 MIN LEITURA
                    </p>
                    <h3 className="text-white font-extrabold text-sm md:text-base leading-tight group-hover:text-amber-300 transition-colors line-clamp-2 drop-shadow">
                      {post.title}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* EXPLORE FEED */}
      <div className="px-4 max-w-7xl mx-auto w-full">
        <h3 className="text-slate-900 font-extrabold text-[15px] tracking-tight uppercase mb-4 px-1 flex items-center gap-2">
          <BookOpen size={18} className="text-red-500" /> Feed da Cidade e Dicas
        </h3>

        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredPosts.map((post, index) => {
                const author = getAuthor(post.authorId);
                const isLiked = likedPosts.includes(post.id);
                return (
                  <motion.div 
                    key={post.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    onClick={() => handlePostClick(post.id)}
                    className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer h-full group"
                  >
                    {/* Cover image wrap */}
                    <div className="h-52 w-full relative shrink-0 overflow-hidden">
                      <img 
                        src={post.imageUrl} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        alt={post.title}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                      
                      {/* Floating Category tag */}
                      <span className="absolute top-4 left-4 bg-white/95 text-slate-800 text-[9px] font-black px-2.5 py-1.5 rounded-xl backdrop-blur-sm uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                        <span className="text-red-500">{getCategoryIcon(post.category, 10)}</span> {post.category}
                      </span>

                      {/* Floating Like button */}
                      <button 
                        onClick={(e) => toggleLike(e, post.id)}
                        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/80 hover:bg-white backdrop-blur-sm flex items-center justify-center text-slate-700 border border-slate-100 active:scale-90 transition-all shadow-md z-10"
                      >
                        <Heart size={16} className={isLiked ? 'fill-red-500 text-red-500 scale-110' : 'text-slate-600'} />
                      </button>
                    </div>

                    {/* Meta and Description card block */}
                    <div className="p-6 flex flex-col justify-between flex-1">
                      <div>
                        <div className="flex items-center gap-3 text-slate-400 text-xs font-semibold mb-2.5">
                          <span className="flex items-center gap-1 font-mono uppercase"><Clock size={12} /> 5 MIN LEITURA</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                          <span>{post.date}</span>
                        </div>

                        <h3 className="font-extrabold text-slate-900 mb-2 leading-snug text-lg group-hover:text-red-500 transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-slate-500 text-sm line-clamp-2 mb-5 leading-relaxed font-normal">
                          {post.excerpt}
                        </p>
                      </div>

                      {/* Author mini bio metadata row */}
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                        <div 
                          onClick={(e) => handleAuthorClick(e, post.authorId)}
                          className="flex items-center gap-3 cursor-pointer group/author"
                        >
                          {author?.avatarUrl ? (
                            <img src={author.avatarUrl} className="w-9 h-9 rounded-full object-cover border border-slate-100 shadow-sm" alt={post.author}/>
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold border border-slate-50 shadow-sm">
                              {post.author.charAt(0)}
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-800 leading-none mb-0.5 group-hover/author:text-red-500 transition-colors">
                              {post.author}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {author?.profession || 'Membro do Lagos GO'}
                            </span>
                          </div>
                        </div>

                        <div className="text-slate-400 bg-slate-50 w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-all shadow-sm">
                          <ChevronRight size={16} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[2rem] border border-slate-100 px-6">
            <div className="text-4xl mb-3">🔍</div>
            <h4 className="font-extrabold text-slate-800 mb-1">Nenhum resultado encontrado</h4>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Tente redefinir seus termos de busca ou mude a categoria de exploração selecionada no topo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
