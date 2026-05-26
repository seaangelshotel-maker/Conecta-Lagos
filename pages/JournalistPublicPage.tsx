import React, { useState, useEffect } from 'react';
import { User, BlogPost } from '../types';
import { getBlogPosts, getAllUsers } from '../services/dataService';
import { Calendar, ChevronRight } from 'lucide-react';

interface JournalistPublicPageProps {
  journalistId: string;
  onNavigate: (page: string, params?: any) => void;
}

export const JournalistPublicPage: React.FC<JournalistPublicPageProps> = ({ journalistId, onNavigate }) => {
  const [journalist, setJournalist] = useState<User | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [users, allPosts] = await Promise.all([getAllUsers(), getBlogPosts()]);
      const journalist = users.find(u => u.id === journalistId);
      setJournalist(journalist || null);
      setPosts(allPosts.filter(p => p.authorId === journalistId && p.status === 'published'));
    };
    fetchData();
  }, [journalistId]);

  if (!journalist) return <div>Jornalista não encontrado.</div>;

  return (
    <div className="pb-24 pt-12 min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-center md:items-start">
          {journalist.avatarUrl ? (
            <img src={journalist.avatarUrl} alt={journalist.name} className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg" />
          ) : (
            <div className="w-32 h-32 rounded-full bg-ocean-100 text-ocean-600 flex items-center justify-center text-4xl font-bold border-4 border-white shadow-lg">
              {journalist.name.charAt(0)}
            </div>
          )}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-ocean-950 mb-2">{journalist.name}</h1>
            <p className="text-lg text-ocean-600 font-medium mb-4">{journalist.profession || 'Jornalista'}</p>
            <p className="text-slate-600 mb-6">{journalist.bio || 'Sem descrição disponível.'}</p>
            {journalist.achievements && journalist.achievements.length > 0 && (
              <div>
                <h3 className="font-bold text-ocean-950 mb-2">Feitos:</h3>
                <ul className="list-disc list-inside text-slate-600 text-sm">
                  {journalist.achievements.map((a, i) => <li key={i}>{a}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>

        <h2 className="text-2xl font-bold text-ocean-950 mt-12 mb-6">Matérias de {journalist.name}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map(post => (
            <div 
                key={post.id} 
                onClick={() => onNavigate('blog-detail', { postId: post.id })}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex flex-col hover:shadow-xl transition-all cursor-pointer group"
            >
                <div className="h-48 w-full relative overflow-hidden">
                    <img src={post.imageUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
                <div className="p-5">
                    <h3 className="font-bold text-ocean-950 mb-2 leading-snug text-lg">{post.title}</h3>
                    <p className="text-slate-500 text-sm line-clamp-2 mb-4">{post.excerpt}</p>
                    <div className="flex items-center gap-2 text-slate-400 text-xs">
                        <Calendar size={14}/> <span>{new Date(post.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
