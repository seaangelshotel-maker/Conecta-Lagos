import React, { useState } from 'react';
import { Siren, Loader2, CheckCircle2 } from 'lucide-react';
import { previewPublicServicesImport, runPublicServicesImport, ServicesPreview } from '../../services/publicServicesImport';
import { useNotification } from '../NotificationSystem';

const CITY_LABEL: Record<string, string> = { city_arraial_do_cabo: 'Arraial do Cabo', city_cabo_frio: 'Cabo Frio', city_buzios: 'Búzios' };

/** Painel do admin: prévia e importação de hospitais, UPAs, delegacias, bombeiros, guarda e defesa civil. */
export const PublicServicesImport: React.FC = () => {
    const { notify } = useNotification();
    const [preview, setPreview] = useState<ServicesPreview | null>(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
    const [finished, setFinished] = useState<number | null>(null);

    const load = async () => {
        setLoading(true);
        try { setPreview(await previewPublicServicesImport()); setFinished(null); }
        catch (e: any) { notify('error', e?.message || 'Não foi possível ler o banco.'); }
        finally { setLoading(false); }
    };
    const run = async () => {
        if (!preview || preview.toCreate.length === 0) return;
        setLoading(true); setProgress({ done: 0, total: preview.toCreate.length });
        try {
            const n = await runPublicServicesImport((done, total) => setProgress({ done, total }));
            setFinished(n); notify('success', `${n} serviços públicos adicionados ao Guia.`);
            setPreview(await previewPublicServicesImport());
        } catch (e: any) { notify('error', e?.message || 'Erro ao importar.'); }
        finally { setLoading(false); setProgress(null); }
    };
    const byCity = Object.entries((preview?.toCreate || []).reduce((acc, p) => { (acc[p.cityId] = acc[p.cityId] || []).push(p); return acc; }, {} as Record<string, ServicesPreview['toCreate']>));

    return (
        <div className="bg-white rounded-[2rem] border border-slate-100 p-6 space-y-4" data-testid="public-services-import">
            <div className="flex items-start gap-3">
                <div className="bg-red-50 text-red-600 p-3 rounded-2xl"><Siren size={22} /></div>
                <div>
                    <h3 className="font-black text-ocean-950 text-lg">Serviços públicos e emergência</h3>
                    <p className="text-sm text-slate-500">Hospitais, UPAs, delegacias, bombeiros, guarda municipal e defesa civil de Arraial do Cabo, Cabo Frio e Búzios. Alimentam o atalho "Precisa agora?". Telefone só entra quando confirmado. Já existentes são pulados.</p>
                </div>
            </div>
            {!preview && (
                <button onClick={load} disabled={loading} className="bg-ocean-600 text-white font-black px-5 py-3 rounded-xl text-sm flex items-center gap-2 disabled:opacity-60">
                    {loading ? <Loader2 size={16} className="animate-spin" /> : null} Ver prévia
                </button>
            )}
            {preview && (
                <div className="space-y-4">
                    <div className="flex flex-wrap gap-3 text-sm">
                        <span className="bg-emerald-50 text-emerald-700 font-bold px-3 py-1.5 rounded-lg">{preview.toCreate.length} novos</span>
                        <span className="bg-slate-100 text-slate-600 font-bold px-3 py-1.5 rounded-lg">{preview.alreadyExists} já existem (serão pulados)</span>
                    </div>
                    {byCity.map(([city, list]) => (
                        <details key={city} className="border border-slate-100 rounded-xl p-3" open>
                            <summary className="font-black text-ocean-950 text-sm cursor-pointer">{CITY_LABEL[city] || city} ({list.length})</summary>
                            <ul className="mt-2 space-y-1.5">
                                {list.map(p => (
                                    <li key={p.name} className="text-sm"><span className="font-bold text-slate-800">{p.name}</span>
                                        <span className="text-slate-400"> · {p.subcategory}{p.phone ? ` · ${p.phone}` : ' · sem telefone'}</span></li>
                                ))}
                            </ul>
                        </details>
                    ))}
                    {progress && <p className="text-sm text-slate-500">Gravando {progress.done} de {progress.total}…</p>}
                    {finished !== null && <p className="text-sm text-emerald-700 font-bold flex items-center gap-2"><CheckCircle2 size={16} /> {finished} serviços adicionados.</p>}
                    <button onClick={run} disabled={loading || preview.toCreate.length === 0} className="bg-ocean-600 text-white font-black px-5 py-3 rounded-xl text-sm flex items-center gap-2 disabled:opacity-50">
                        {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                        {preview.toCreate.length === 0 ? 'Nada novo para importar' : `Importar ${preview.toCreate.length} serviços`}
                    </button>
                </div>
            )}
        </div>
    );
};
