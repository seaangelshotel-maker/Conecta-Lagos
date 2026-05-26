
import React, { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, Share2, Clock, Check, X, Instagram, Globe, Award, User, ChevronRight } from 'lucide-react';
import { SEO } from '../components/SEO';
import { BlogPost, User as UserType } from '../types';
import { getBlogPostById, getAllUsers } from '../services/dataService';
import { useNotification } from '../components/NotificationSystem';

interface BlogDetailProps {
  postId: string;
  onNavigate: (page: string) => void;
}

export const BlogDetail: React.FC<BlogDetailProps> = ({ postId, onNavigate }) => {
  const { notify } = useNotification();
  const [post, setPost] = useState<BlogPost | undefined>(undefined);
  const [author, setAuthor] = useState<UserType | undefined>(undefined);
  const [showAuthorModal, setShowAuthorModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getBlogPostById(postId);
      setPost(data);
      if (data?.authorId) {
          const users = await getAllUsers();
          const foundAuthor = users.find(u => u.id === data.authorId);
          setAuthor(foundAuthor);
      }
    };
    fetchData();
  }, [postId]);

  if (!post) {
      return (
          <div className="min-h-screen flex items-center justify-center">
              <p className="text-slate-400">Carregando notícia...</p>
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

  return (
    <div className="bg-white min-h-screen pb-24">
        <SEO 
            title={post.title}
            description={post.excerpt}
            image={post.imageUrl}
            type="article"
            url={`/blog/${postId}`}
        />
        {/* Hero Header */}
        <div className="relative h-72 md:h-[50vh] w-full">
            <img src={post.imageUrl} className="w-full h-full object-cover" alt={post.title} />
            <div className="absolute inset-0 bg-gradient-to-t from-ocean-950 via-ocean-900/40 to-transparent" />
            
            <button 
                onClick={() => onNavigate('blog')}
                className="absolute top-4 left-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-2.5 rounded-full transition-colors z-20 border border-white/20"
            >
                <ArrowLeft size={24} />
            </button>

            <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 max-w-4xl mx-auto">
                <span className="bg-gold-500 text-ocean-950 text-xs font-bold px-3 py-1.5 rounded mb-4 inline-block uppercase tracking-wider shadow-lg">
                    {post.category}
                </span>
                <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4 shadow-black drop-shadow-lg">
                    {post.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-6 text-white/80 text-sm font-medium">
                    <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gold-500" />
                        <span>{post.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock size={16} className="text-gold-500" />
                        <span>5 min de leitura</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Content Body */}
        <div className="max-w-3xl mx-auto px-6 py-12">
            
            {/* AUTHOR MINI PROFILE (Inline) */}
            {author && (
                <div 
                    onClick={() => setShowAuthorModal(true)}
                    className="flex items-center gap-4 mb-10 p-4 bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] cursor-pointer group hover:border-ocean-100 hover:shadow-md transition-all"
                >
                    <div className="relative shrink-0">
                        <img 
                            src={author.avatarUrl || 'https://via.placeholder.com/150'} 
                            className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md group-hover:scale-105 transition-transform"
                        />
                        {author.isPrime && (
                            <div className="absolute -bottom-1 -right-1 bg-gold-500 text-white rounded-full p-1 border-2 border-white shadow-sm">
                                <Award size={10} strokeWidth={4} />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-ocean-900 text-base">{author.name}</h4>
                            {author.profession && (
                                <span className="hidden sm:inline-block text-[10px] bg-ocean-50 text-ocean-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border border-ocean-100">
                                    {author.profession}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-slate-500 line-clamp-1">{author.bio || `Criador de conteúdo no ${post.category}`}</p>
                        <div className="flex items-center gap-1 text-xs text-ocean-600 font-bold mt-1 group-hover:underline">
                            Ver perfil completo <ChevronRight size={12} />
                        </div>
                    </div>
                </div>
            )}

            <p className="text-xl text-slate-700 leading-relaxed font-serif italic mb-8 border-l-4 border-gold-500 pl-6 py-2 bg-slate-50/50 rounded-r-lg">
                {post.excerpt}
            </p>

            <div className="prose prose-lg prose-slate max-w-none text-slate-800 leading-8 prose-headings:font-bold prose-headings:text-ocean-950 prose-a:text-ocean-600 hover:prose-a:text-ocean-700 prose-img:rounded-2xl prose-img:shadow-lg">
                <p>{post.content}</p>
            </div>

            {/* Share Footer */}
            <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between">
                <span className="text-slate-500 font-medium text-sm">Gostou? Compartilhe:</span>
                <button 
                    onClick={handleShare}
                    className="flex items-center gap-2 bg-ocean-50 text-ocean-700 px-5 py-2.5 rounded-full font-bold hover:bg-ocean-100 transition-colors shadow-sm text-sm"
                >
                    <Share2 size={18} /> Compartilhar
                </button>
            </div>
        </div>

        {/* AUTHOR MODAL */}
        {showAuthorModal && author && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
                <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-300 ring-1 ring-white/20">
                    
                    {/* Header Art */}
                    <div className="h-32 bg-gradient-to-br from-ocean-600 via-ocean-500 to-teal-400 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                        <button 
                            onClick={() => setShowAuthorModal(false)}
                            className="absolute top-4 right-4 bg-black/20 text-white p-2 rounded-full hover:bg-black/30 transition-colors backdrop-blur-sm"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Avatar & Content */}
                    <div className="px-8 pb-10 relative text-center">
                        <div className="w-28 h-28 rounded-full border-[6px] border-white shadow-xl -mt-14 mb-4 mx-auto overflow-hidden bg-white">
                            <img src={author.avatarUrl || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" />
                        </div>
                        
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-ocean-950 flex items-center justify-center gap-2 mb-1">
                                {author.name}
                                {author.isPrime && <Award size={22} className="text-gold-500 fill-gold-500" />}
                            </h2>
                            <p className="text-ocean-600 font-bold text-xs uppercase tracking-widest mb-4">{author.profession || 'Criador de Conteúdo'}</p>
                            
                            <div className="relative">
                                <span className="absolute -top-2 -left-2 text-4xl text-slate-200 font-serif leading-none">“</span>
                                <p className="text-slate-600 text-sm leading-relaxed px-4 italic relative z-10">
                                    {author.bio || 'Criando conteúdo incrível para o Lagos GO.'}
                                </p>
                                <span className="absolute -bottom-4 -right-1 text-4xl text-slate-200 font-serif leading-none">”</span>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="flex gap-3 justify-center">
                            {author.instagram && (
                                <a 
                                    href={`https://instagram.com/${author.instagram.replace('@','')}`} 
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 rounded-xl text-sm font-bold shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 hover:-translate-y-0.5 transition-all"
                                >
                                    <Instagram size={18} /> Instagram
                                </a>
                            )}
                            {author.website && (
                                <a 
                                    href={author.website.startsWith('http') ? author.website : `https://${author.website}`} 
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex-1 flex items-center justify-center gap-2 bg-slate-800 text-white px-4 py-3 rounded-xl text-sm font-bold shadow-lg shadow-slate-800/20 hover:bg-slate-900 hover:-translate-y-0.5 transition-all"
                                >
                                    <Globe size={18} /> Website
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
