
import React, { useState, useEffect } from 'react';
import { BlogPost, User, AppCategory } from '../types';
import { getBlogPosts, getAllUsers, getDicasCategories } from '../services/dataService';
import { Calendar, ChevronRight, User as UserIcon } from 'lucide-react';

interface BlogProps {
  onNavigate?: (page: string, params?: any) => void;
}

export const Blog: React.FC<BlogProps> = ({ onNavigate }) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<AppCategory[]>([]);
  const [filter, setFilter] = useState('Todos');

  useEffect(() => {
    const fetchData = async () => {
      const [p, u, c] = await Promise.all([
        getBlogPosts(),
        getAllUsers(),
        getDicasCategories()
      ]);
      setPosts(p);
      setUsers(u);
      setCategories(c);
    };
    fetchData();
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

  const displayPosts = filter === 'Todos' ? posts : posts.filter(p => p.category === filter);

  // Helper to find author
  const getAuthor = (authorId?: string) => {
      return users.find(u => u.id === authorId);
  }

  return (
    <div className="pb-24 pt-4 min-h-screen bg-slate-50">
        <div className="px-4 mb-6 max-w-7xl mx-auto w-full">
            <h1 className="text-2xl font-bold text-ocean-950 mb-1">Dicas & Roteiros</h1>
            <p className="text-sm text-slate-500">Descubra o melhor de Arraial com nossa curadoria.</p>
        </div>

        {/* Categories */}
        <div className="flex gap-2 px-4 overflow-x-auto hide-scrollbar mb-6 max-w-7xl mx-auto w-full">
            <button 
                onClick={() => setFilter('Todos')}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${filter === 'Todos' ? 'bg-ocean-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
            >
                Todos
            </button>
            {categories.map(cat => (
                <button 
                    key={cat.id}
                    onClick={() => setFilter(cat.name)}
                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${filter === cat.name ? 'bg-ocean-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
                >
                    {cat.name}
                </button>
            ))}
        </div>

        {/* Featured Post (First one) */}
        {filter === 'Todos' && posts.length > 0 && (
            <div className="px-4 mb-8 max-w-7xl mx-auto w-full">
                <div 
                    onClick={() => handlePostClick(posts[0].id)}
                    className="relative h-64 md:h-[400px] rounded-3xl overflow-hidden shadow-xl group cursor-pointer transition-all hover:shadow-2xl"
                >
                    <img src={posts[0].imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    
                    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold uppercase tracking-wider border border-white/30">
                        Destaque
                    </div>

                    <div className="absolute bottom-0 left-0 w-full p-6 md:p-10">
                        <span className="bg-gold-500 text-ocean-950 text-[10px] font-bold px-2 py-1 rounded mb-3 inline-block uppercase tracking-wide shadow-sm">{posts[0].category}</span>
                        <h2 className="text-2xl md:text-4xl font-bold text-white leading-tight mb-3 group-hover:text-gold-400 transition-colors drop-shadow-md">{posts[0].title}</h2>
                        <p className="hidden md:block text-white/90 mb-6 text-sm md:text-base max-w-2xl font-light">{posts[0].excerpt}</p>
                        
                        <div className="flex items-center gap-4">
                            {(() => {
                                const author = getAuthor(posts[0].authorId);
                                return (
                                    <div 
                                        onClick={(e) => handleAuthorClick(e, posts[0].authorId)}
                                        className="flex items-center gap-3 bg-white/10 backdrop-blur-md pr-4 rounded-full border border-white/10 p-1 cursor-pointer hover:bg-white/20 transition-colors"
                                    >
                                        {author?.avatarUrl ? (
                                            <img src={author.avatarUrl} className="w-8 h-8 rounded-full border border-white/50 object-cover" alt={posts[0].author}/>
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-ocean-500 text-white flex items-center justify-center font-bold text-xs">{posts[0].author.charAt(0)}</div>
                                        )}
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-white leading-none">{posts[0].author}</span>
                                            {author?.profession && <span className="text-[9px] text-white/70 uppercase tracking-wider">{author.profession}</span>}
                                        </div>
                                    </div>
                                );
                            })()}
                            <div className="flex items-center gap-2 text-white/70 text-xs">
                                <div className="w-1 h-1 bg-white/50 rounded-full"></div>
                                <Calendar size={14}/> <span>{posts[0].date}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Grid List */}
        <div className="px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {displayPosts.slice(filter === 'Todos' ? 1 : 0).map(post => {
                const author = getAuthor(post.authorId);
                return (
                    <div 
                        key={post.id} 
                        onClick={() => handlePostClick(post.id)}
                        className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer h-full group"
                    >
                        <div className="h-52 w-full relative shrink-0 overflow-hidden">
                            <img src={post.imageUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                            <span className="absolute top-3 left-3 bg-white/90 text-ocean-900 text-[10px] font-bold px-2 py-1 rounded-md backdrop-blur-sm uppercase tracking-wider shadow-sm">{post.category}</span>
                        </div>
                        
                        <div className="p-5 flex flex-col justify-between flex-1">
                            <div>
                                <h3 className="font-bold text-ocean-950 mb-2 leading-snug text-lg group-hover:text-ocean-600 transition-colors">{post.title}</h3>
                                <p className="text-slate-500 text-sm line-clamp-2 mb-4 leading-relaxed">{post.excerpt}</p>
                            </div>
                            
                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                                <div 
                                    onClick={(e) => handleAuthorClick(e, post.authorId)}
                                    className="flex items-center gap-3 cursor-pointer group/author"
                                >
                                    {author?.avatarUrl ? (
                                        <img src={author.avatarUrl} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" alt={post.author}/>
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-ocean-100 text-ocean-600 flex items-center justify-center text-sm font-bold border-2 border-white shadow-sm">
                                            {post.author.charAt(0)}
                                        </div>
                                    )}
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-ocean-900 leading-none mb-0.5 group-hover/author:text-ocean-600 transition-colors">{post.author}</span>
                                        <span className="text-[10px] text-slate-400 font-medium">{author?.profession || 'Colaborador'}</span>
                                    </div>
                                </div>
                                <div className="text-ocean-600 bg-ocean-50 p-2 rounded-full group-hover:bg-ocean-600 group-hover:text-white transition-colors">
                                    <ChevronRight size={16} />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
  );
};
