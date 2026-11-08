import React from 'react';
import { Clock, Heart, BookOpen, Newspaper, CalendarDays, Lightbulb } from 'lucide-react';
import { BlogPost } from '../types';
import { gradientFor } from './GuideCards';

/** Tipo de conteúdo do Feed, derivado do próprio registro (mesma coleção blog_posts). */
export type ContentType = 'materia' | 'noticia' | 'evento' | 'dica';

export const TYPE_META: Record<ContentType, { label: string; cls: string; Icon: any }> = {
  materia: { label: 'Matéria', cls: 'bg-ocean-600 text-white', Icon: BookOpen },
  noticia: { label: 'Notícia', cls: 'bg-red-500 text-white', Icon: Newspaper },
  evento: { label: 'Evento', cls: 'bg-amber-500 text-white', Icon: CalendarDays },
  dica: { label: 'Dica', cls: 'bg-emerald-600 text-white', Icon: Lightbulb },
};

export const contentType = (p: BlogPost): ContentType => {
  if (p.kind === 'guia') return 'materia';
  const c = (p.category || '').toLowerCase();
  if (c.includes('notíc') || c.includes('notic')) return 'noticia';
  if (c.includes('event') || c.includes('agenda')) return 'evento';
  return 'dica';
};

export const openContent = (p: BlogPost, onNavigate: (page: string, params?: any) => void) =>
  (p.kind === 'guia' ? onNavigate('guide-article', { slug: p.slug || p.id }) : onNavigate('blog-detail', { postId: p.id }));

export const formatDate = (d?: string) => {
  const m = (d || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : (d || '');
};

export const TypeBadge: React.FC<{ post: BlogPost; className?: string }> = ({ post, className = '' }) => {
  const t = TYPE_META[contentType(post)];
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${t.cls} ${className}`} data-type={contentType(post)}>
      <t.Icon size={11} /> {t.label}
    </span>
  );
};

/** Capa: foto quando existe; sem foto, cor e formas (nunca imagem inventada). */
const Cover: React.FC<{ post: BlogPost; className?: string }> = ({ post, className = '' }) => (
  <div className={`relative overflow-hidden bg-gradient-to-br ${gradientFor(post.slug || post.id)} ${className}`}>
    {post.imageUrl
      ? <img src={post.imageUrl} alt="" loading="lazy" referrerPolicy="no-referrer" className="absolute inset-0 w-full h-full object-cover" />
      : (<><div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/15" /><div className="absolute right-10 bottom-6 w-12 h-12 rounded-full bg-white/20" /></>)}
  </div>
);

const Meta: React.FC<{ post: BlogPost; light?: boolean }> = ({ post, light }) => (
  <div className={`flex items-center gap-2 text-[11px] font-bold ${light ? 'text-white/75' : 'text-slate-400'}`}>
    {post.kind === 'guia'
      ? <span className="flex items-center gap-1"><Clock size={11} /> {post.readingMinutes || 3} min de leitura</span>
      : <span>{formatDate(post.date)}</span>}
    {post.author && <><span aria-hidden>•</span><span className="truncate">{post.author}</span></>}
  </div>
);

/** Destaque principal: card grande com título sobre a capa. */
export const LeadCard: React.FC<{ post: BlogPost; onOpen: (p: BlogPost) => void }> = ({ post, onOpen }) => (
  <button onClick={() => onOpen(post)} aria-label={`Abrir: ${post.title}`} data-testid="lead-card"
    className="relative w-full text-left rounded-3xl overflow-hidden shadow-sm active:scale-[0.99] transition-transform min-h-[300px] md:min-h-[380px] flex flex-col justify-end">
    <Cover post={post} className="!absolute inset-0" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
    <div className="relative p-5 md:p-7 space-y-2">
      <TypeBadge post={post} />
      <h3 className="text-white font-black text-2xl md:text-3xl leading-tight tracking-tight">{post.title}</h3>
      <p className="text-white/85 text-sm line-clamp-2 max-w-2xl">{post.excerpt}</p>
      <Meta post={post} light />
    </div>
  </button>
);

/** Notícia secundária: miniatura + título (lista compacta). */
export const CompactCard: React.FC<{ post: BlogPost; onOpen: (p: BlogPost) => void }> = ({ post, onOpen }) => (
  <button onClick={() => onOpen(post)} aria-label={`Abrir: ${post.title}`} data-testid="compact-card"
    className="w-full text-left bg-white rounded-2xl border border-slate-100 p-3 flex gap-3 items-center active:scale-[0.99] transition-transform">
    <Cover post={post} className="w-20 h-20 rounded-xl shrink-0" />
    <div className="min-w-0 flex-1 space-y-1">
      <TypeBadge post={post} className="!px-2 !py-0.5" />
      <p className="font-black text-ocean-950 text-sm leading-snug line-clamp-2">{post.title}</p>
      <Meta post={post} />
    </div>
  </button>
);

/** Card padrão do fluxo do Feed (com favorito). */
export const StreamCard: React.FC<{
  post: BlogPost; onOpen: (p: BlogPost) => void; liked?: boolean; onLike?: (p: BlogPost) => void;
  onAuthor?: (p: BlogPost) => void; wide?: boolean;
}> = ({ post, onOpen, liked, onLike, onAuthor, wide }) => (
  <article className={`bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex ${wide ? 'flex-col md:flex-row md:col-span-2' : 'flex-col'}`} data-testid="stream-card" data-type={contentType(post)}>
    <button onClick={() => onOpen(post)} aria-label={`Abrir: ${post.title}`} className={`relative block text-left ${wide ? 'md:w-1/2' : ''}`}>
      <Cover post={post} className={wide ? 'h-56 md:h-full md:min-h-[260px]' : 'h-44'} />
      <TypeBadge post={post} className="absolute top-3 left-3" />
    </button>
    <div className={`p-5 flex flex-col gap-2 flex-1 ${wide ? 'md:w-1/2 md:justify-center' : ''}`}>
      <button onClick={() => onOpen(post)} className="text-left">
        <h3 className={`font-black text-ocean-950 leading-snug ${wide ? 'text-xl md:text-2xl' : 'text-[17px] line-clamp-2'}`}>{post.title}</h3>
        <p className={`text-sm text-slate-500 leading-relaxed mt-1.5 ${wide ? 'line-clamp-3' : 'line-clamp-2'}`}>{post.excerpt}</p>
      </button>
      <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between gap-3">
        {onAuthor && post.authorId && post.kind !== 'guia'
          ? <button onClick={() => onAuthor(post)} className="text-left min-w-0"><Meta post={post} /></button>
          : <Meta post={post} />}
        {onLike && (
          <button onClick={() => onLike(post)} aria-label={liked ? 'Remover dos favoritos' : 'Salvar nos favoritos'} aria-pressed={!!liked}
            className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
            <Heart size={16} className={liked ? 'fill-red-500 text-red-500' : 'text-slate-500'} />
          </button>
        )}
      </div>
    </div>
  </article>
);
