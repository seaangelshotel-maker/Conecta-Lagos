import React, { useState } from 'react';
import { Store, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { previewFeaturedImport, runFeaturedImport, FeaturedPreview, missingFields } from '../../services/featuredBusinessesService';
import { FREE_TRIAL_DAYS } from '../../data/featuredBusinesses';
import { useNotification } from '../NotificationSystem';

const CITY_LABEL: Record<string, string> = {
    city_arraial_do_cabo: 'Arraial do Cabo',
    city_cabo_frio: 'Cabo Frio',
    city_buzios: 'Búzios',
};

/** Painel do admin: prévia e importação das empresas em destaque, com 3 meses grátis. */
export const FeaturedBusinessesImport: React.FC = () => {
    const { notify } = useNotification();
    const [preview, setPreview] = useState<FeaturedPreview | null>(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
    const [result, setResult] = useState<{ published: number; drafts: number } | null>(null);

    const loadPreview = async () => {
        setLoading(true);
        try { setPreview(await previewFeaturedImport()); setResult(null); }
        catch (e: any) { notify('error', e?.message || 'Não foi possível ler o banco.'); }
        finally { setLoading(false); }
    };

    const run = async () => {
        if (!preview || preview.toCreate.length === 0) return;
        setLoading(true);
        setProgress({ done: 0, total: preview.toCreate.length });
        try {
            const r = await runFeaturedImport((done, total) => setProgress({ done, total }));
            setResult(r);
            notify('success', `${r.published} empresas no ar e ${r.drafts} rascunhos.`);
            setPreview(await previewFeaturedImport());
        } catch (e: any) { notify('error', e?.message || 'Erro ao importar.'); }
        finally { setLoading(false); setProgress(null); }
    };

    return (
        <div className="bg-white rounded-[2rem] border border-slate-100 p-6 space-y-4">
            <div className="flex items-start gap-3">
                <div className="bg-ocean-50 text-ocean-600 p-3 rounded-2xl"><Store size={22} /></div>
                <div>
                    <h3 className="font-black text-ocean-950 text-lg">Empresas em destaque (comércio e serviços)</h3>
                    <p className="text-sm text-slate-500">
                        Telefone e endereço só do site oficial ou de ficha pública conferida. Empresa completa vai ao ar com {FREE_TRIAL_DAYS} dias
                        grátis a partir da publicação; incompleta fica em rascunho, visível só para você. Depois de importar, edite,
                        estenda o prazo ou bloqueie cada empresa em Empresas.
                    </p>
                </div>
            </div>

            {!preview && (
                <button onClick={loadPreview} disabled={loading} className="bg-ocean-600 text-white font-black px-5 py-3 rounded-xl text-sm flex items-center gap-2 disabled:opacity-60">
                    {loading ? <Loader2 size={16} className="animate-spin" /> : null} Ver prévia
                </button>
            )}

            {preview && (
                <div className="space-y-4">
                    <div className="flex flex-wrap gap-3 text-sm">
                        <span className="bg-emerald-50 text-emerald-700 font-bold px-3 py-1.5 rounded-lg">{preview.publishNow.length} vão ao ar</span>
                        <span className="bg-amber-50 text-amber-700 font-bold px-3 py-1.5 rounded-lg">{preview.asDraft.length} em rascunho (dados faltando)</span>
                        <span className="bg-slate-100 text-slate-600 font-bold px-3 py-1.5 rounded-lg">{preview.alreadyExists} já existem (pulados)</span>
                    </div>

                    <ul className="space-y-1 max-h-72 overflow-auto text-sm">
                        {preview.toCreate.map(b => {
                            const miss = missingFields(b);
                            return (
                                <li key={b.cityId + b.name} className="flex items-start gap-2">
                                    {miss.length === 0
                                        ? <CheckCircle2 size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                                        : <AlertTriangle size={14} className="text-amber-600 mt-0.5 shrink-0" />}
                                    <span>
                                        <b className="text-slate-800">{b.name}</b>
                                        <span className="text-slate-400"> · {b.subcategory} · {CITY_LABEL[b.cityId]}</span>
                                        {miss.length > 0 && <span className="text-amber-700"> · falta: {miss.join(', ')}</span>}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>

                    {progress && <p className="text-sm text-slate-500">Gravando {progress.done} de {progress.total}…</p>}
                    {result && (
                        <p className="text-sm text-emerald-700 font-bold flex items-center gap-2">
                            <CheckCircle2 size={16} /> {result.published} no ar com {FREE_TRIAL_DAYS} dias grátis · {result.drafts} rascunhos.
                        </p>
                    )}

                    <button onClick={run} disabled={loading || preview.toCreate.length === 0}
                        className="bg-ocean-600 text-white font-black px-5 py-3 rounded-xl text-sm flex items-center gap-2 disabled:opacity-50">
                        {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                        {preview.toCreate.length === 0 ? 'Nada novo para importar' : `Importar ${preview.toCreate.length} empresas`}
                    </button>
                </div>
            )}
        </div>
    );
};
