import React, { useState } from 'react';
import { MapPin, Loader2, CheckCircle2, ExternalLink } from 'lucide-react';
import { previewPublicPlacesImport, runPublicPlacesImport, ImportPreview } from '../../services/placesImportService';
import { useNotification } from '../NotificationSystem';

const CITY_LABEL: Record<string, string> = {
    city_arraial_do_cabo: 'Arraial do Cabo',
    city_cabo_frio: 'Cabo Frio',
    city_buzios: 'Búzios',
};

/** Painel do admin: prévia e importação dos lugares públicos pesquisados (com fontes). */
export const PublicPlacesImport: React.FC = () => {
    const { notify } = useNotification();
    const [preview, setPreview] = useState<ImportPreview | null>(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
    const [finished, setFinished] = useState<number | null>(null);

    const loadPreview = async () => {
        setLoading(true);
        try {
            setPreview(await previewPublicPlacesImport());
            setFinished(null);
        } catch (e: any) {
            notify('error', e?.message || 'Não foi possível ler o banco.');
        } finally {
            setLoading(false);
        }
    };

    const runImport = async () => {
        if (!preview || preview.toCreate.length === 0) return;
        setLoading(true);
        setProgress({ done: 0, total: preview.toCreate.length });
        try {
            const n = await runPublicPlacesImport((done, total) => setProgress({ done, total }));
            setFinished(n);
            notify('success', `${n} lugares adicionados ao Guia.`);
            setPreview(await previewPublicPlacesImport());
        } catch (e: any) {
            notify('error', e?.message || 'Erro ao importar.');
        } finally {
            setLoading(false);
            setProgress(null);
        }
    };

    const byCity = (list: ImportPreview['toCreate']) =>
        Object.entries(list.reduce((acc, p) => { (acc[p.cityId] = acc[p.cityId] || []).push(p); return acc; }, {} as Record<string, typeof list>));

    return (
        <div className="bg-white rounded-[2rem] border border-slate-100 p-6 space-y-4">
            <div className="flex items-start gap-3">
                <div className="bg-ocean-50 text-ocean-600 p-3 rounded-2xl"><MapPin size={22} /></div>
                <div>
                    <h3 className="font-black text-ocean-950 text-lg">Lugares públicos para o Guia</h3>
                    <p className="text-sm text-slate-500">
                        Praias, mirantes, trilhas e pontos históricos de Arraial do Cabo, Cabo Frio e Búzios, pesquisados com fonte.
                        Sem nota, horário ou telefone inventados. Lugares que já existem são pulados.
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
                        <span className="bg-emerald-50 text-emerald-700 font-bold px-3 py-1.5 rounded-lg">{preview.toCreate.length} novos</span>
                        <span className="bg-slate-100 text-slate-600 font-bold px-3 py-1.5 rounded-lg">{preview.alreadyExists.length} já existem (serão pulados)</span>
                        {preview.newCities.length > 0 && (
                            <span className="bg-amber-50 text-amber-700 font-bold px-3 py-1.5 rounded-lg">Cidade nova: {preview.newCities.join(', ')}</span>
                        )}
                    </div>

                    {byCity(preview.toCreate).map(([city, places]) => (
                        <details key={city} className="border border-slate-100 rounded-xl p-3" open>
                            <summary className="font-black text-ocean-950 text-sm cursor-pointer">{CITY_LABEL[city] || city} ({places.length})</summary>
                            <ul className="mt-2 space-y-2">
                                {places.map(p => (
                                    <li key={p.name} className="text-sm">
                                        <span className="font-bold text-slate-800">{p.name}</span>
                                        <span className="text-slate-400"> · {p.subcategory}</span>
                                        <div className="flex flex-wrap gap-2 mt-0.5">
                                            {p.sources.map(s => (
                                                <a key={s} href={s} target="_blank" rel="noreferrer" className="text-[11px] text-ocean-600 inline-flex items-center gap-1 hover:underline">
                                                    <ExternalLink size={10} /> {new URL(s).hostname.replace('www.', '')}
                                                </a>
                                            ))}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </details>
                    ))}

                    {progress && <p className="text-sm text-slate-500">Gravando {progress.done} de {progress.total}…</p>}
                    {finished !== null && (
                        <p className="text-sm text-emerald-700 font-bold flex items-center gap-2"><CheckCircle2 size={16} /> {finished} lugares adicionados.</p>
                    )}

                    <button onClick={runImport} disabled={loading || preview.toCreate.length === 0}
                        className="bg-ocean-600 text-white font-black px-5 py-3 rounded-xl text-sm flex items-center gap-2 disabled:opacity-50">
                        {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                        {preview.toCreate.length === 0 ? 'Nada novo para importar' : `Importar ${preview.toCreate.length} lugares`}
                    </button>
                </div>
            )}
        </div>
    );
};
