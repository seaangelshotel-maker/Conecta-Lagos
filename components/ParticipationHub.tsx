import React, { useEffect, useState } from 'react';
import { Store, ShieldCheck, PenTool, HandHeart, ClipboardList, Plus, ChevronRight, Home as HomeIcon, Plane } from 'lucide-react';
import { BusinessProfile, City, ParticipantType, PARTICIPANT_LABELS, User, UserRole } from '../types';
import { getCities, getMyBusinesses, updateUser } from '../services/dataService';
import { useNotification } from './NotificationSystem';
import { SpecialistReferral } from './SpecialistReferral';

/**
 * Centro da conta: uma única identidade com várias formas de participar.
 * A pessoa pode ser moradora, turista, responsável por empresa e anunciante
 * de oportunidades ao mesmo tempo, sem criar outra conta.
 */
export const ParticipationHub: React.FC<{ currentUser: User; onNavigate: (page: string, params?: any) => void }> = ({ currentUser, onNavigate }) => {
    const { notify } = useNotification();
    const [types, setTypes] = useState<ParticipantType[]>(currentUser.profileTypes || []);
    const [cityId, setCityId] = useState(currentUser.cityId || '');
    const [cities, setCities] = useState<City[]>([]);
    const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        getCities().then(c => setCities(c.filter(x => x.active !== false))).catch(() => undefined);
        getMyBusinesses(currentUser.id).then(setBusinesses).catch(() => undefined);
    }, [currentUser.id]);

    const save = async (nextTypes: ParticipantType[], nextCity: string) => {
        setSaving(true);
        try {
            await updateUser({ ...currentUser, profileTypes: nextTypes, cityId: nextCity || undefined });
        } catch (e: any) {
            notify('error', e?.message || 'Não foi possível salvar.');
        } finally {
            setSaving(false);
        }
    };

    const toggleType = (t: ParticipantType) => {
        const next = types.includes(t) ? types.filter(x => x !== t) : [...types, t];
        setTypes(next);
        save(next, cityId);
    };

    const isAdmin = currentUser.role === UserRole.SUPER_ADMIN;
    const isCompany = currentUser.role === UserRole.COMPANY || businesses.length > 0;
    const isAuthor = currentUser.role === UserRole.JOURNALIST || currentUser.role === UserRole.CONTENT_CREATOR;

    const panels: { icon: React.ReactNode; title: string; text: string; page: string; params?: any; tone: string }[] = [];
    if (isAdmin) panels.push({ icon: <ShieldCheck size={20} />, title: 'Administração', text: 'Empresas, moderação e configurações', page: 'admin-dashboard', tone: 'bg-purple-50 text-purple-600' });
    if (isCompany && !isAdmin) panels.push({ icon: <Store size={20} />, title: businesses.length === 1 ? businesses[0].name : 'Minha empresa', text: 'Perfil, cupons, resgates e resultados', page: 'admin-dashboard', tone: 'bg-ocean-50 text-ocean-600' });
    if (isAuthor) panels.push({ icon: <PenTool size={20} />, title: 'Painel do autor', text: 'Dicas, roteiros e notícias', page: 'journalist-dashboard', tone: 'bg-amber-50 text-amber-600' });
    panels.push({ icon: <ClipboardList size={20} />, title: 'Minhas publicações', text: 'Oportunidades e interessados', page: 'my-opportunities', tone: 'bg-emerald-50 text-emerald-600' });
    panels.push({ icon: <HandHeart size={20} />, title: 'Meus interesses', text: 'Oportunidades em que me candidatei', page: 'my-opportunities', params: { tab: 'interests' }, tone: 'bg-emerald-50 text-emerald-600' });

    return (
        <section className="space-y-4 mb-8">
            <div className="bg-white rounded-[2rem] border border-slate-100 p-5 md:p-6 space-y-4">
                <div>
                    <h2 className="font-black text-ocean-950">Como você participa</h2>
                    <p className="text-xs text-slate-500">Marque o que se aplica. Ajuda a mostrar o que é mais útil para você.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {(Object.keys(PARTICIPANT_LABELS) as ParticipantType[]).map(t => (
                        <button
                            key={t}
                            onClick={() => toggleType(t)}
                            disabled={saving}
                            aria-pressed={types.includes(t)}
                            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-sm font-bold active:scale-95 transition-all ${types.includes(t) ? 'bg-ocean-600 border-ocean-600 text-white' : 'bg-white border-slate-200 text-slate-600'}`}
                        >
                            {t === 'morador' ? <HomeIcon size={16} /> : <Plane size={16} />} {PARTICIPANT_LABELS[t]}
                        </button>
                    ))}
                    {isCompany && <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-50 text-sm font-bold text-slate-500"><Store size={16} /> Tenho empresa</span>}
                </div>
                {cities.length > 0 && (
                    <label className="flex flex-col gap-1">
                        <span className="text-[11px] font-black uppercase text-slate-400">Cidade de referência</span>
                        <select
                            value={cityId}
                            onChange={e => { setCityId(e.target.value); save(types, e.target.value); }}
                            className="w-full bg-white px-4 py-3 rounded-2xl border border-slate-200 text-base md:text-sm font-medium"
                        >
                            <option value="">Não informar</option>
                            {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </label>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {panels.map(p => (
                    <button key={p.title} onClick={() => onNavigate(p.page, p.params)} className="bg-white rounded-3xl border border-slate-100 p-4 flex items-center gap-3 text-left active:scale-[0.99] transition-all hover:border-ocean-100">
                        <span className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${p.tone}`}>{p.icon}</span>
                        <span className="flex-1 min-w-0">
                            <span className="block font-black text-ocean-950 text-sm truncate">{p.title}</span>
                            <span className="block text-[11px] text-slate-500 truncate">{p.text}</span>
                        </span>
                        <ChevronRight size={18} className="text-slate-300" />
                    </button>
                ))}
                {!isCompany && !isAdmin && (
                    <button onClick={() => onNavigate('pricing-plans')} className="bg-white rounded-3xl border border-dashed border-slate-200 p-4 flex items-center gap-3 text-left active:scale-[0.99]">
                        <span className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 bg-slate-50 text-slate-500"><Plus size={20} /></span>
                        <span className="flex-1 min-w-0">
                            <span className="block font-black text-ocean-950 text-sm">Tenho um negócio</span>
                            <span className="block text-[11px] text-slate-500">Coloque sua empresa no guia da região</span>
                        </span>
                    </button>
                )}
            </div>

            {types.includes('turista') && <SpecialistReferral source="profile" compact />}
        </section>
    );
};
