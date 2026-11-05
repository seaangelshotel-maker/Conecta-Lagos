import React, { useState } from 'react';
import { Flag, X } from 'lucide-react';
import { ReportTargetType } from '../types';
import { REPORT_REASONS, reportContent } from '../services/opportunityService';
import { useNotification } from './NotificationSystem';
import { inputClass, primaryButton, secondaryButton } from './ui/States';

export const ReportDialog: React.FC<{
    targetType: ReportTargetType;
    targetId: string;
    targetTitle: string;
    onClose: () => void;
}> = ({ targetType, targetId, targetTitle, onClose }) => {
    const { notify } = useNotification();
    const [reason, setReason] = useState('');
    const [details, setDetails] = useState('');
    const [sending, setSending] = useState(false);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        try {
            await reportContent(targetType, targetId, targetTitle, reason, details);
            notify('success', 'Denúncia enviada. A moderação vai analisar.');
            onClose();
        } catch (err: any) {
            notify('error', err?.message || 'Erro ao enviar denúncia.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-ocean-950/50 backdrop-blur-sm flex items-end md:items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="report-title">
            <form onSubmit={submit} className="bg-white w-full md:max-w-md rounded-t-[2rem] md:rounded-[2rem] p-6 space-y-4 sheet-safe-bottom animate-in slide-in-from-bottom-6">
                <div className="flex items-center justify-between">
                    <h2 id="report-title" className="text-lg font-black text-ocean-950 flex items-center gap-2"><Flag size={18} className="text-red-500" /> Denunciar</h2>
                    <button type="button" onClick={onClose} className="p-2 -mr-2 text-slate-400" aria-label="Fechar"><X size={22} /></button>
                </div>
                <p className="text-sm text-slate-500">Conte o que há de errado com <strong className="text-ocean-950">{targetTitle}</strong>. Sua identidade não é mostrada ao anunciante.</p>
                <div className="space-y-2">
                    {REPORT_REASONS.map(r => (
                        <label key={r} className={`flex items-center gap-3 px-4 py-3 rounded-2xl border cursor-pointer ${reason === r ? 'border-ocean-500 bg-ocean-50' : 'border-slate-200'}`}>
                            <input type="radio" name="reason" value={r} checked={reason === r} onChange={() => setReason(r)} className="text-ocean-600" />
                            <span className="text-sm font-bold text-slate-700">{r}</span>
                        </label>
                    ))}
                </div>
                <textarea
                    className={inputClass()}
                    rows={3}
                    maxLength={1000}
                    placeholder="Detalhes (opcional)"
                    value={details}
                    onChange={e => setDetails(e.target.value)}
                />
                <div className="flex gap-3">
                    <button type="button" onClick={onClose} className={`${secondaryButton} flex-1`}>Cancelar</button>
                    <button type="submit" disabled={!reason || sending} className={`${primaryButton} flex-1 !bg-red-600 !shadow-red-600/20`}>{sending ? 'Enviando...' : 'Enviar denúncia'}</button>
                </div>
            </form>
        </div>
    );
};
