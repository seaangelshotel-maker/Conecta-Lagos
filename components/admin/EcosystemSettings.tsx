import { waLink } from '../../services/claimRules';
import React, { useEffect, useState } from 'react';
import { Save, Users } from 'lucide-react';
import { AppGlobalSettings, SpecialistReferralSettings } from '../../types';
import { backfillPublicProfiles, getGlobalSettings, saveGlobalSettings } from '../../services/dataService';
import { useNotification } from '../NotificationSystem';
import { Field, LoadingState, inputClass, primaryButton, secondaryButton } from '../ui/States';

const DEFAULT_SPECIALIST: SpecialistReferralSettings = {
    enabled: false,
    partnerName: 'Guida Trips',
    description: 'Atendimento especializado para montar roteiros e experiências na Região dos Lagos.',
    whatsapp: '',
    url: '',
};

/**
 * Configurações do ecossistema:
 * - Contato comercial (WhatsApp usado em "Anuncie conosco").
 * - Atendimento especializado (ex.: Guida Trips): botão de encaminhamento para
 *   turistas, identificado como operação do ecossistema, sem prioridade oculta.
 *   A relação comercial/financeira entre as operações fica documentada em
 *   docs/GUIDA_TRIPS.md e NÃO é calculada pelo sistema nesta etapa.
 */
export const EcosystemSettings: React.FC = () => {
    const { notify } = useNotification();
    const [settings, setSettings] = useState<AppGlobalSettings | null>(null);
    const [saving, setSaving] = useState(false);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        getGlobalSettings(true).then(s => setSettings({ ...s, specialistReferral: { ...DEFAULT_SPECIALIST, ...(s.specialistReferral || {}) } }));
    }, []);

    if (!settings) return <LoadingState />;
    const sp = settings.specialistReferral || DEFAULT_SPECIALIST;
    const setSp = (patch: Partial<SpecialistReferralSettings>) => setSettings({ ...settings, specialistReferral: { ...sp, ...patch } });

    const save = async () => {
        if (sp.enabled && !sp.whatsapp && !sp.url) {
            notify('warning', 'Informe o WhatsApp ou o link do atendimento especializado antes de ativar.');
            return;
        }
        setSaving(true);
        try {
            await saveGlobalSettings({
                ...settings,
                salesWhatsapp: (settings.salesWhatsapp || '').replace(/\D/g, ''),
                specialistReferral: { ...sp, whatsapp: (sp.whatsapp || '').replace(/\D/g, '') },
            });
            notify('success', 'Configurações salvas.');
        } catch (e: any) {
            notify('error', e?.message || 'Erro ao salvar.');
        } finally {
            setSaving(false);
        }
    };

    const syncProfiles = async () => {
        setSyncing(true);
        try {
            const n = await backfillPublicProfiles();
            notify('success', `${n} perfis públicos de autores atualizados.`);
        } catch (e: any) {
            notify('error', e?.message || 'Erro ao sincronizar perfis.');
        } finally {
            setSyncing(false);
        }
    };

    return (
        <div className="space-y-6">
            <section className="bg-white rounded-[2rem] border border-slate-100 p-6 md:p-8 space-y-4">
                <h3 className="text-lg font-black text-ocean-950">Contato comercial</h3>
                <Field label="WhatsApp comercial (com DDD)" htmlFor="eco-sales" hint="Usado no botão “Anuncie conosco” e na página de planos.">
                    <input id="eco-sales" className={inputClass()} inputMode="tel" value={settings.salesWhatsapp || ''} onChange={e => setSettings({ ...settings, salesWhatsapp: e.target.value })} placeholder="22999999999" />
                </Field>
                {waLink(settings.salesWhatsapp || '') ? (
                    <a data-testid="eco-sales-test" href={waLink(settings.salesWhatsapp || '', 'Teste: botão Assinar da Lagos GO')} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700">
                        Testar meu WhatsApp (abre a conversa)
                    </a>
                ) : (
                    <p className="text-xs font-bold text-amber-600">Sem número: o botão “Assinar via WhatsApp” fica desativado para os clientes.</p>
                )}
            </section>

            <section className="bg-white rounded-[2rem] border border-slate-100 p-6 md:p-8 space-y-4">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-black text-ocean-950">Atendimento especializado</h3>
                        <p className="text-xs text-slate-500 font-medium mt-1">Encaminha turistas que querem ajuda para montar roteiros. Cada encaminhamento é registrado com a origem.</p>
                    </div>
                    <button
                        onClick={() => setSp({ enabled: !sp.enabled })}
                        className={`w-14 h-8 rounded-full transition-all relative shrink-0 ${sp.enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                        aria-pressed={sp.enabled}
                        aria-label="Ativar atendimento especializado"
                    >
                        <span className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${sp.enabled ? 'left-7' : 'left-1'}`} />
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Nome da operação" htmlFor="eco-sp-name">
                        <input id="eco-sp-name" className={inputClass()} value={sp.partnerName} onChange={e => setSp({ partnerName: e.target.value })} />
                    </Field>
                    <Field label="WhatsApp (com DDD)" htmlFor="eco-sp-wa">
                        <input id="eco-sp-wa" className={inputClass()} inputMode="tel" value={sp.whatsapp || ''} onChange={e => setSp({ whatsapp: e.target.value })} />
                    </Field>
                    <Field label="Link (opcional)" htmlFor="eco-sp-url" hint="Se houver WhatsApp, ele tem prioridade.">
                        <input id="eco-sp-url" className={inputClass()} type="url" value={sp.url || ''} onChange={e => setSp({ url: e.target.value })} placeholder="https://" />
                    </Field>
                    <Field label="Descrição exibida" htmlFor="eco-sp-desc">
                        <input id="eco-sp-desc" className={inputClass()} value={sp.description || ''} onChange={e => setSp({ description: e.target.value })} maxLength={160} />
                    </Field>
                </div>
                <p className="text-[11px] text-slate-400">
                    O botão aparece identificado como “operação do ecossistema Lagos GO”. Ele não altera a ordem do guia nem os destaques.
                </p>
            </section>

            <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={save} disabled={saving} className={primaryButton}><Save size={18} /> {saving ? 'Salvando...' : 'Salvar configurações'}</button>
                <button onClick={syncProfiles} disabled={syncing} className={secondaryButton}><Users size={18} /> {syncing ? 'Sincronizando...' : 'Gerar perfis públicos dos autores'}</button>
            </div>
            <p className="text-[11px] text-slate-400">
                “Gerar perfis públicos” cria a versão pública (sem e-mail/telefone) dos perfis de jornalistas e autores do blog. Use uma vez após publicar esta versão.
            </p>
        </div>
    );
};
