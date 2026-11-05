import React from 'react';
import { AlertTriangle, ArrowLeft, Inbox, Loader2, RefreshCw } from 'lucide-react';

/** Cabeçalho de tela no estilo app: título, voltar e ação opcional. */
export const PageHeader: React.FC<{
    title: string;
    subtitle?: string;
    onBack?: () => void;
    action?: React.ReactNode;
}> = ({ title, subtitle, onBack, action }) => (
    <header className="sticky top-0 md:top-16 z-30 bg-slate-50/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 md:px-6 h-16 flex items-center gap-3">
            {onBack && (
                <button
                    onClick={onBack}
                    className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-ocean-950 hover:bg-slate-100 active:scale-95 transition-all"
                    aria-label="Voltar"
                >
                    <ArrowLeft size={22} />
                </button>
            )}
            <div className="flex-1 min-w-0">
                <h1 className="text-lg font-black text-ocean-950 truncate leading-tight">{title}</h1>
                {subtitle && <p className="text-[11px] font-bold text-slate-400 truncate">{subtitle}</p>}
            </div>
            {action}
        </div>
    </header>
);

export const LoadingState: React.FC<{ label?: string; className?: string }> = ({ label = 'Carregando...', className = '' }) => (
    <div className={`flex flex-col items-center justify-center gap-3 py-20 text-slate-400 ${className}`} role="status">
        <Loader2 className="animate-spin text-ocean-500" size={32} />
        <span className="text-xs font-bold">{label}</span>
    </div>
);

export const SkeletonCards: React.FC<{ count?: number }> = ({ count = 4 }) => (
    <div className="space-y-3" aria-hidden="true">
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="bg-white rounded-3xl border border-slate-100 p-5 animate-pulse">
                <div className="h-3 w-24 bg-slate-100 rounded-full mb-3" />
                <div className="h-5 w-3/4 bg-slate-100 rounded-full mb-2" />
                <div className="h-3 w-1/2 bg-slate-100 rounded-full" />
            </div>
        ))}
    </div>
);

export const EmptyState: React.FC<{
    title: string;
    message?: string;
    icon?: React.ReactNode;
    action?: React.ReactNode;
}> = ({ title, message, icon, action }) => (
    <div className="text-center py-14 px-6 bg-white rounded-[2rem] border border-dashed border-slate-200">
        <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300">
            {icon || <Inbox size={28} />}
        </div>
        <p className="font-black text-ocean-950">{title}</p>
        {message && <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">{message}</p>}
        {action && <div className="mt-5">{action}</div>}
    </div>
);

export const ErrorState: React.FC<{ message?: string; onRetry?: () => void }> = ({ message, onRetry }) => (
    <div className="text-center py-12 px-6 bg-red-50 rounded-[2rem] border border-red-100" role="alert">
        <AlertTriangle className="mx-auto text-red-400 mb-3" size={28} />
        <p className="font-black text-red-700">Algo deu errado</p>
        <p className="text-sm text-red-600/80 mt-1 max-w-sm mx-auto">{message || 'Não foi possível carregar as informações.'}</p>
        {onRetry && (
            <button onClick={onRetry} className="mt-4 inline-flex items-center gap-2 bg-white text-red-600 border border-red-200 px-5 py-2.5 rounded-xl font-bold text-sm active:scale-95">
                <RefreshCw size={16} /> Tentar novamente
            </button>
        )}
    </div>
);

/** Campo de formulário com rótulo, ajuda e erro (alvos de toque confortáveis no celular). */
export const Field: React.FC<{
    label: string;
    htmlFor: string;
    hint?: string;
    error?: string;
    required?: boolean;
    children: React.ReactNode;
}> = ({ label, htmlFor, hint, error, required, children }) => (
    <div className="space-y-1.5">
        <label htmlFor={htmlFor} className="block text-xs font-black text-slate-600 uppercase tracking-wide">
            {label}{required && <span className="text-red-500"> *</span>}
        </label>
        {children}
        {error ? (
            <p className="text-xs font-bold text-red-600" role="alert">{error}</p>
        ) : hint ? (
            <p className="text-[11px] text-slate-400">{hint}</p>
        ) : null}
    </div>
);

export const inputClass = (hasError?: boolean) =>
    `w-full bg-white px-4 py-3.5 rounded-2xl border text-base md:text-sm font-medium text-ocean-950 outline-none transition-all focus:ring-2 focus:ring-ocean-500 ${hasError ? 'border-red-300' : 'border-slate-200'}`;

export const primaryButton =
    'inline-flex items-center justify-center gap-2 bg-ocean-600 text-white font-black px-6 py-3.5 rounded-2xl shadow-lg shadow-ocean-600/20 hover:bg-ocean-700 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none';

export const secondaryButton =
    'inline-flex items-center justify-center gap-2 bg-white text-ocean-700 font-black px-6 py-3.5 rounded-2xl border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none';

export const Badge: React.FC<{ tone?: 'ocean' | 'gold' | 'green' | 'slate' | 'red' | 'amber'; children: React.ReactNode }> = ({ tone = 'slate', children }) => {
    const tones: Record<string, string> = {
        ocean: 'bg-ocean-50 text-ocean-700 border-ocean-100',
        gold: 'bg-amber-50 text-amber-700 border-amber-100',
        green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        slate: 'bg-slate-100 text-slate-600 border-slate-200',
        red: 'bg-red-50 text-red-600 border-red-100',
        amber: 'bg-amber-50 text-amber-700 border-amber-100',
    };
    return <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${tones[tone]}`}>{children}</span>;
};
