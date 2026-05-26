
import React from 'react';
import { MousePointer2, TrendingUp, DollarSign, BarChart3, PieChart as PieIcon } from 'lucide-react';

interface AdminStatsProps {
  stats: {
    totalConversions: number;
    totalViews: number;
    totalShares: number;
    totalRevenue?: number;
  };
}

export const AdminStats: React.FC<AdminStatsProps> = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-ocean-950 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
        <MousePointer2 className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5 group-hover:scale-110 transition-transform" />
        <p className="text-[10px] font-black text-ocean-400 uppercase tracking-widest mb-2">Total de Resgates</p>
        <h3 className="text-4xl font-black">{stats.totalConversions}</h3>
        <p className="text-ocean-200 text-[10px] font-bold mt-2">Leads Gerados pelo Guia</p>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
        <TrendingUp className="absolute -right-4 -bottom-4 w-24 h-24 text-slate-50 group-hover:scale-110 transition-transform" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Visualizações</p>
        <h3 className="text-4xl font-black text-ocean-950">{stats.totalViews}</h3>
        <p className="text-slate-400 text-[10px] font-bold mt-2">Alcance Total das Ofertas</p>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
        <DollarSign className="absolute -right-4 -bottom-4 w-24 h-24 text-slate-50 group-hover:scale-110 transition-transform" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Economia Gerada</p>
        <h3 className="text-4xl font-black text-ocean-950">R$ {(stats.totalConversions * 25).toLocaleString()}</h3>
        <p className="text-slate-400 text-[10px] font-bold mt-2">Estimativa para os Clientes</p>
      </div>
    </div>
  );
};
