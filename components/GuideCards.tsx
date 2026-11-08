import React from 'react';
import { Clock, MapPin, Star, Lightbulb, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { BlogPost, BusinessProfile } from '../types';
import { realRating } from '../services/discoverLogic';

const GRADIENTS = [
  'from-ocean-600 to-cyan-500', 'from-amber-500 to-orange-500', 'from-emerald-600 to-teal-500',
  'from-rose-500 to-pink-500', 'from-violet-600 to-indigo-500', 'from-sky-600 to-blue-500',
];
export const gradientFor = (key: string) => {
  let h = 0; for (const c of key) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return GRADIENTS[h % GRADIENTS.length];
};

/** Card de matéria: funciona sem imagem (cor, forma e ícone) e usa a foto quando ela existir. */
export const ArticleCard: React.FC<{ article: BlogPost; onOpen: (a: BlogPost) => void; wide?: boolean }> = ({ article, onOpen, wide }) => (
  <button
    onClick={() => onOpen(article)}
    aria-label={`Ler matéria: ${article.title}`}
    className={`text-left bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden active:scale-[0.98] transition-transform shrink-0 ${wide ? 'w-full' : 'w-72'} flex flex-col`}
  >
    <div className={`relative h-28 bg-gradient-to-br ${gradientFor(article.slug || article.id)} p-4 flex items-end`}>
      {article.imageUrl && <img src={article.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-90" referrerPolicy="no-referrer" />}
      <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/15" />
      <div className="absolute right-8 top-10 w-10 h-10 rounded-full bg-white/20" />
      <span className="relative bg-white/90 text-ocean-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">{article.category}</span>
    </div>
    <div className="p-4 flex flex-col gap-2 flex-1">
      <h3 className="font-black text-ocean-950 text-[15px] leading-snug line-clamp-3">{article.title}</h3>
      <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{article.excerpt}</p>
      <div className="mt-auto pt-1 flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
        <Clock size={12} /> {article.readingMinutes || 3} min de leitura
      </div>
    </div>
  </button>
);

export const BusinessMiniCard: React.FC<{ business: BusinessProfile; onOpen: (b: BusinessProfile) => void; distanceKm?: number }> = ({ business: b, onOpen, distanceKm }) => {
  const r = realRating(b);
  return (
    <button onClick={() => onOpen(b)} aria-label={`Abrir ${b.name}`}
      className="text-left bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex gap-3 items-start active:scale-[0.99] transition-transform w-full">
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradientFor(b.id)} flex items-center justify-center shrink-0 overflow-hidden`}>
        {b.coverImage ? <img src={b.coverImage} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <MapPin size={22} className="text-white" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-black text-ocean-950 text-sm leading-snug">{b.name}</p>
        <p className="text-[11px] font-bold text-ocean-600 uppercase tracking-wide">{b.subcategory || b.category}</p>
        {b.address && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{b.address}</p>}
        <div className="flex items-center gap-3 mt-1 text-[11px] font-bold text-slate-400">
          {r > 0 && <span className="flex items-center gap-1 text-amber-600"><Star size={11} /> {r.toFixed(1)}</span>}
          {typeof distanceKm === 'number' && <span>{distanceKm < 1 ? `${Math.round(distanceKm * 1000)} m` : `${distanceKm.toFixed(1)} km`}</span>}
          {b.phone && <span>Telefone cadastrado</span>}
        </div>
      </div>
    </button>
  );
};

const inline = (text: string): React.ReactNode[] =>
  text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((part, i) =>
    part.startsWith('**') ? <strong key={i} className="font-black text-ocean-950">{part.slice(2, -2)}</strong> : <React.Fragment key={i}>{part}</React.Fragment>);

const CALLOUT: Record<string, { label: string; cls: string; Icon: any }> = {
  'dica': { label: 'Dica', cls: 'bg-emerald-50 border-emerald-200 text-emerald-900', Icon: Lightbulb },
  'alerta': { label: 'Alerta', cls: 'bg-amber-50 border-amber-200 text-amber-900', Icon: AlertTriangle },
  'confirme': { label: 'Confirme antes de ir', cls: 'bg-sky-50 border-sky-200 text-sky-900', Icon: Info },
  'pratico': { label: 'Informação prática', cls: 'bg-slate-50 border-slate-200 text-slate-800', Icon: CheckCircle2 },
  'prático': { label: 'Informação prática', cls: 'bg-slate-50 border-slate-200 text-slate-800', Icon: CheckCircle2 },
};

/** Renderiza o texto da matéria (## títulos, listas, > callouts, parágrafos). */
export const GuideContent: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');
  const out: React.ReactNode[] = [];
  let bullets: string[] = [];
  const flush = (k: string) => {
    if (bullets.length) {
      out.push(<ul key={`ul-${k}`} className="space-y-2 my-4">{bullets.map((b, i) => (
        <li key={i} className="flex gap-3 text-[15px] text-slate-700 leading-relaxed"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-ocean-600 shrink-0" /><span>{inline(b)}</span></li>))}</ul>);
      bullets = [];
    }
  };
  lines.forEach((raw, idx) => {
    const l = raw.trim();
    if (l.startsWith('- ')) { bullets.push(l.slice(2)); return; }
    flush(String(idx));
    if (!l) return;
    if (l.startsWith('### ')) { out.push(<h3 key={idx} className="text-lg font-black text-ocean-950 mt-6 mb-2">{l.slice(4)}</h3>); return; }
    if (l.startsWith('## ')) { out.push(<h2 key={idx} className="text-2xl font-black text-ocean-950 mt-9 mb-3 tracking-tight">{l.slice(3)}</h2>); return; }
    if (l.startsWith('> ')) {
      const m = l.slice(2).match(/^([^:]{2,20}):\s*(.*)$/);
      const spec = m ? CALLOUT[m[1].toLowerCase()] : undefined;
      if (spec && m) {
        out.push(
          <aside key={idx} className={`my-5 rounded-2xl border p-4 flex gap-3 ${spec.cls}`}>
            <spec.Icon size={18} className="shrink-0 mt-0.5" />
            <div className="text-sm leading-relaxed"><p className="font-black text-xs uppercase tracking-wider mb-1">{spec.label}</p>{inline(m[2])}</div>
          </aside>);
        return;
      }
    }
    out.push(<p key={idx} className="text-[15px] md:text-base text-slate-700 leading-[1.8] my-3">{inline(l)}</p>);
  });
  flush('end');
  return <div>{out}</div>;
};
