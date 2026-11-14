import React from 'react';
import { X, Star, MessageCircle, Ticket, Image as ImageIcon, BarChart3, MapPin, Phone, Check, Sparkles } from 'lucide-react';

const Note: React.FC<{ n: number; children: React.ReactNode }> = ({ n, children }) => (
  <p className="flex gap-1.5 text-[10px] leading-snug text-slate-500"><span className="w-4 h-4 rounded-full bg-gold-500 text-ocean-950 text-[9px] font-black flex items-center justify-center shrink-0 mt-px">{n}</span><span>{children}</span></p>
);

const FEATURES = [
  { icon: <Sparkles size={16} />, text: 'Destaque nas buscas e na Home' },
  { icon: <ImageIcon size={16} />, text: 'Galeria de fotos do seu negócio' },
  { icon: <MessageCircle size={16} />, text: 'Botão de WhatsApp direto' },
  { icon: <Ticket size={16} />, text: 'Cupons com resgate pelo app' },
  { icon: <BarChart3 size={16} />, text: 'Relatório de cliques, ligações e cupons' },
];

/** Tela de exemplo (não usa os dados do comerciante): mostra como um perfil completo aparece e leva aos planos. */
export const PlanPreview: React.FC<{ onClose: () => void; onChoose: () => void }> = ({ onClose, onChoose }) => (
  <div className="fixed inset-0 z-[130] bg-black/60 flex items-end md:items-center justify-center" role="dialog" aria-modal="true" aria-label="Exemplo de perfil completo" onClick={onClose}>
    <div className="bg-slate-50 w-full max-w-md max-h-[92vh] overflow-y-auto rounded-t-3xl md:rounded-3xl" onClick={e => e.stopPropagation()}>
      <div className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur px-5 pt-4 pb-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gold-600">Exemplo ilustrativo</p>
          <h3 className="text-base font-black text-ocean-950 leading-tight">Veja como seu negócio pode ficar</h3>
        </div>
        <button onClick={onClose} className="p-1.5 text-slate-400" aria-label="Fechar"><X size={20} /></button>
      </div>

      <div className="px-5 pb-5">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="h-32 bg-gradient-to-br from-ocean-600 to-ocean-950 relative flex items-center justify-center">
            <img src="/brand/simbolo.svg" alt="" className="w-14 h-14 opacity-90 invert brightness-0" />
            <span className="absolute top-3 left-3 bg-gold-500 text-ocean-950 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1"><Star size={10} /> DESTAQUE</span>
          </div>
          <div className="p-4 space-y-3">
            <Note n={1}>Selo de <b>destaque</b>: seu negócio aparece antes nas buscas e na Home, onde o turista decide.</Note>
            <div>
              <h4 className="text-lg font-black text-ocean-950">Seu Negócio Aqui</h4>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><MapPin size={12} /> Rua Exemplo, 123, Arraial do Cabo</p>
            </div>
            <div className="flex gap-2">
              <span className="flex-1 bg-emerald-500 text-white text-xs font-black py-2.5 rounded-xl flex items-center justify-center gap-1.5"><MessageCircle size={14} /> WhatsApp</span>
              <span className="flex-1 bg-ocean-50 text-ocean-600 text-xs font-black py-2.5 rounded-xl flex items-center justify-center gap-1.5"><Phone size={14} /> Ligar</span>
            </div>
            <Note n={2}>O cliente fala com você em um toque, por <b>WhatsApp</b> ou ligação, sem precisar copiar número.</Note>
            <div className="grid grid-cols-3 gap-1.5">
              {[0, 1, 2].map(i => <div key={i} className="aspect-square rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-300"><ImageIcon size={20} /></div>)}
            </div>
            <Note n={3}><b>Galeria de fotos</b> em carrossel: o cliente passa as imagens do seu espaço, do prato ou do passeio antes de decidir.</Note>
            <Note n={4}><b>Cardápio ou lista de serviços</b> no seu perfil, com botão de pedido que chega direto no seu WhatsApp.</Note>
            <div className="rounded-2xl border-2 border-dashed border-gold-500/60 bg-gold-50 p-3 flex items-center gap-3">
              <Ticket size={22} className="text-gold-600 shrink-0" />
              <div className="min-w-0"><p className="text-sm font-black text-ocean-950">Cupom de exemplo</p><p className="text-[11px] text-slate-500">O cliente resgata no app e você vê quem usou.</p></div>
            </div>
            <Note n={5}><b>Cupons</b> atraem quem ainda não te conhece. O cliente resgata no app e você sabe quantos vieram por ele.</Note>
            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Relatório do mês (exemplo)</p>
              <div className="grid grid-cols-3 gap-2 mt-2 text-center">
                {['Visitas ao perfil', 'Cliques no WhatsApp', 'Cupons usados'].map(l => (
                  <div key={l}><p className="text-xl font-black text-ocean-600">00</p><p className="text-[10px] font-bold text-slate-500 leading-tight">{l}</p></div>
                ))}
              </div>
            </div>
            <Note n={6}><b>Painel de resultados</b>: veja quantas pessoas visitaram seu perfil, clicaram no WhatsApp, ligaram, pediram e usaram cupom, e de onde vieram.</Note>
          </div>
        </div>

        <ul className="mt-5 space-y-2.5">
          {FEATURES.map(f => (
            <li key={f.text} className="flex items-center gap-3 text-sm font-bold text-ocean-950">
              <span className="w-8 h-8 rounded-xl bg-ocean-50 text-ocean-600 flex items-center justify-center shrink-0">{f.icon}</span>{f.text}
              <Check size={16} className="ml-auto text-emerald-500 shrink-0" />
            </li>
          ))}
        </ul>

        <button onClick={onChoose} data-testid="plan-preview-choose" className="mt-6 w-full bg-ocean-600 text-white font-black text-sm py-4 rounded-2xl shadow-lg active:scale-95">Quero essa versão</button>
        <p className="text-[11px] text-slate-400 text-center mt-2">Os dados acima são só um exemplo, não são do seu negócio.</p>
      </div>
    </div>
  </div>
);
