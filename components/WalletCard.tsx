import React from 'react';
import { Gem, Ticket, ChevronRight } from 'lucide-react';
import { formatBRL, WalletSummary } from '../services/walletRules';

interface Props {
  summary: WalletSummary;
  loading?: boolean;
  /** compact: faixa da Home. full: passaporte do perfil. */
  variant?: 'compact' | 'full';
  onOpen?: () => void;
}

const reservedLine = (s: WalletSummary) =>
  s.reservedCount > 0
    ? `${formatBRL(s.reserved)} em ${s.reservedCount} cupom${s.reservedCount > 1 ? 's' : ''} para usar`
    : null;

export const WalletCard: React.FC<Props> = ({ summary, loading, variant = 'full', onOpen }) => {
  const reserved = reservedLine(summary);

  if (variant === 'compact') {
    const has = summary.saved > 0;
    return (
      <button
        type="button"
        onClick={onOpen}
        data-testid="wallet-compact"
        className="w-full text-left bg-white border border-emerald-100 p-3.5 rounded-2xl flex items-center justify-between gap-3 active:scale-[0.99] transition-transform"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0"><Gem size={18} /></div>
          <div className="min-w-0">
            <span className="text-[10px] text-emerald-700 font-extrabold uppercase tracking-wider block">Minha Carteira de Economia</span>
            <span className="text-xs text-slate-500 block truncate" data-testid="wallet-compact-hint">
              {reserved || (has ? 'Quanto você já economizou com nossos cupons' : 'Pegue um cupom e comece a economizar')}
            </span>
          </div>
        </div>
        <div className="text-right shrink-0 pl-2 border-l border-slate-100">
          <div className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Economizado</div>
          <div className="text-base font-black text-emerald-600" data-testid="wallet-saved">{loading ? '…' : formatBRL(summary.saved)}</div>
        </div>
      </button>
    );
  }

  return (
    <div className="bg-[#1e293b] rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden group" data-testid="wallet-full">
      <div className="relative z-10">
        <p className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest mb-1 md:mb-2">Passaporte de Economia</p>
        <h2 className="text-4xl md:text-6xl font-black mb-2 md:mb-4 tracking-tight" data-testid="wallet-saved">{loading ? '…' : formatBRL(summary.saved)}</h2>
        <p className="text-xs md:text-base text-slate-300 font-medium">
          {summary.usedCount > 0
            ? `Economizado em ${summary.usedCount} cupom${summary.usedCount > 1 ? 's' : ''} confirmado${summary.usedCount > 1 ? 's' : ''} pelos estabelecimentos.`
            : 'Conta o que você economizar usando cupons do Lagos GO.'}
        </p>
        {reserved && (
          <div className="mt-5 inline-flex items-center gap-2 bg-white/10 border border-white/10 px-3.5 py-2 rounded-xl text-xs md:text-sm font-bold" data-testid="wallet-reserved">
            <Ticket size={16} className="text-emerald-300" />
            <span>Você tem {reserved}</span>
          </div>
        )}
        <p className="mt-4 text-[10px] md:text-xs text-slate-400 font-medium max-w-md">
          A economia entra aqui quando o estabelecimento confirma o código do seu cupom.
        </p>
      </div>
      <div className="absolute -right-20 -bottom-20 w-64 h-64 md:w-96 md:h-96 bg-ocean-500/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
      {onOpen && (
        <button onClick={onOpen} className="absolute right-6 top-6 z-10 text-white/70 hover:text-white"><ChevronRight size={20} /></button>
      )}
    </div>
  );
};
