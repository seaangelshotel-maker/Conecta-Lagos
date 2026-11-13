
import { canOrder } from '../services/orderModel';
import React, { useState, useEffect } from 'react';
import { User, PricingPlan, UserRole } from '../types';
import { getPricingPlans, getGlobalSettings, getMyBusinesses } from '../services/dataService';
import { Check, ArrowRight, MessageCircle, Star, Shield, Zap, Loader2, CreditCard, Lock, Calendar, Info, X, Gem, Compass } from 'lucide-react';
import { brl, periodLabel, planTotal } from '../services/planRules';
import { waLink } from '../services/claimRules';
import { useNotification } from '../components/NotificationSystem';
import { auth } from '../services/firebase';

import { SEO } from '../components/SEO';
interface PricingPlansProps {
    currentUser: User | null;
    onNavigate: (page: string) => void;
}

export const PricingPlans: React.FC<PricingPlansProps> = ({ currentUser, onNavigate }) => {
    const { notify } = useNotification();
    const [plans, setPlans] = useState<PricingPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [isTrialSelection, setIsTrialSelection] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [period, setPeriod] = useState<'semiannual' | 'yearly'>('yearly');

    useEffect(() => {
        const loadPlans = async () => {
            const allPlans = await getPricingPlans();
            setPlans(allPlans.filter(p => p.active));
            setLoading(false);
        };
        loadPlans();

        const handleUpdate = () => loadPlans();
        window.addEventListener('dataUpdated', handleUpdate);
        return () => window.removeEventListener('dataUpdated', handleUpdate);
    }, []);

    const handleSelectPlan = async (plan: PricingPlan, isTrial: boolean = false) => {
        if (!currentUser) {
            onNavigate('login');
            return;
        }

        setLoading(true);
        // Pagamento online (Asaas) quando ativo; qualquer falha cai no WhatsApp.
        if (!isTrial) {
            try {
                const health = await fetch('/api/health').then(r => r.json()).catch(() => ({}));
                const fbUser = auth.currentUser;
                if (health?.paymentsEnabled && fbUser) {
                    const mine = await getMyBusinesses(fbUser.uid).catch(() => []);
                    if (!mine.length) {
                        notify('warning', 'Cadastre ou reivindique sua empresa antes de assinar um plano.');
                        setLoading(false);
                        return;
                    }
                    const businessId = mine[0].id;
                    const idToken = await fbUser.getIdToken();
                    const call = async (cpfCnpj?: string) => {
                        const r = await fetch('/api/create-checkout-session', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
                            body: JSON.stringify({ planId: plan.id, businessId, cpfCnpj }),
                        });
                        return { ok: r.ok, data: await r.json().catch(() => ({})) as any };
                    };
                    let res = await call();
                    if (!res.ok && res.data?.needCpfCnpj) {
                        const doc = window.prompt('Informe o CPF ou CNPJ do responsável para emitir a cobrança:');
                        if (doc) res = await call(doc);
                    }
                    if (res.ok && res.data?.url) {
                        notify('success', 'Abrindo a fatura de pagamento...');
                        setLoading(false);
                        window.location.href = res.data.url;
                        return;
                    }
                    if (res.data?.error) notify('warning', res.data.error);
                }
            } catch (e) {
                console.error('Checkout error:', e);
            }
        }
        try {
            const settings = await getGlobalSettings();
            const whatsapp = (settings.salesWhatsapp || '').replace(/\D/g, '');
            if (!whatsapp) {
                notify('warning', 'O contato comercial ainda não foi configurado. Tente novamente mais tarde.');
                setLoading(false);
                return;
            }
            
            const message = `Olá! Tenho interesse no Plano ${plan.name} (${isTrial ? 'Período de Teste' : 'Assinatura'}) do Lagos GO para minha empresa. Meu e-mail de cadastro é: ${currentUser.email}`;
            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = waLink(whatsapp, message);
            
            window.open(whatsappUrl, '_blank', 'noopener');
            setLoading(false);
            notify('success', 'Abrindo conversa com a equipe no WhatsApp...');
            
        } catch (error) {
            console.error("WhatsApp Redirect Error:", error);
            notify('error', "Erro ao iniciar contato. Tente novamente.");
            setLoading(false);
        }
    };

    const handleTalkToConsultant = async () => {
        setLoading(true);
        try {
            const settings = await getGlobalSettings();
            const whatsapp = (settings.salesWhatsapp || '').replace(/\D/g, '');
            if (!whatsapp) {
                notify('warning', 'O contato comercial ainda não foi configurado. Tente novamente mais tarde.');
                setLoading(false);
                return;
            }
            const message = `Olá! Vi o Lagos GO e gostaria de falar com um consultor sobre um plano personalizado para minha empresa.`;
            const whatsappUrl = waLink(whatsapp, message);
            window.open(whatsappUrl, '_blank');
        } catch (e) {
            notify('error', 'Erro ao abrir WhatsApp');
        }
        setLoading(false);
    };

    const hasNew = plans.some(p => p.period === 'semiannual' || p.period === 'yearly');
    const periodsAvailable = (['semiannual', 'yearly'] as const).filter(pe => plans.some(p => p.period === pe));
    const activePeriod = periodsAvailable.includes(period) ? period : (periodsAvailable[0] || period);
    const visiblePlans = (hasNew ? plans.filter(p => p.period === activePeriod) : plans).slice().sort((a, b) => a.price - b.price);

    // O selo "Recomendado" vai em um só card: o plano mais barato entre os que têm destaque.
    const recommendedId = visiblePlans.find(p => p.isFeatured)?.id;

    if (loading && plans.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="animate-spin text-ocean-600" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-24 pt-24 px-6">
          <SEO title="Planos para empresas" description="Coloque sua empresa na frente de quem visita e de quem mora na Região dos Lagos, com ficha completa, cupons e eventos." url="/pricing-plans" />
            <div className="max-w-7xl mx-auto space-y-20">
                <div className="text-center space-y-6 max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-ocean-100 text-ocean-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                        <Gem size={14} />
                        Planos de Crescimento
                    </div>
                    <h1 className="text-6xl font-black text-ocean-950 tracking-tight leading-[0.9]">Escolha o plano ideal para o seu negócio</h1>
                    <p className="text-slate-500 font-medium text-xl leading-relaxed">Coloque sua empresa na frente de quem visita e de quem mora na Região dos Lagos, com ficha completa, cupons e eventos.</p>
                </div>

                {periodsAvailable.length > 1 && (
                    <div className="flex justify-center" data-testid="period-toggle">
                        <div className="inline-flex bg-white border border-slate-200 rounded-2xl p-1 shadow-sm">
                            {periodsAvailable.map(pe => (
                                <button key={pe} data-testid={`period-${pe}`} onClick={() => setPeriod(pe)}
                                    className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activePeriod === pe ? 'bg-ocean-600 text-white shadow' : 'text-slate-500 hover:text-ocean-700'}`}>
                                    {periodLabel(pe)}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                    {visiblePlans.map((plan) => (
                        <div 
                            key={plan.id} 
                            className={`bg-white rounded-[3.5rem] p-12 border-2 transition-all flex flex-col relative ${plan.id === recommendedId ? 'border-ocean-500 shadow-2xl shadow-ocean-500/10 md:scale-105 z-10' : 'border-slate-100 shadow-xl hover:border-ocean-200'}`}
                        >
                            {plan.id === recommendedId && (
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-ocean-600 text-white px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                                    Recomendado
                                </div>
                            )}

                            <div className="space-y-4 mb-10">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-3xl font-black text-ocean-950">{plan.name}</h3>
                                    {plan.hasFreeTrial && (
                                        <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider">
                                            Trial Disponível
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-black text-ocean-950">{brl(plan.price)}</span>
                                    <span className="text-slate-400 font-bold text-sm">/mês</span>
                                </div>
                                <p className="text-ocean-700 text-xs font-black uppercase tracking-wider" data-testid="plan-total">Plano de {periodLabel(plan.period)} · {brl(planTotal(plan))}</p>
                            </div>

                            <div className="flex-1 space-y-5 mb-12">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">O que está incluso:</p>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 text-slate-600">
                                        <div className="w-6 h-6 rounded-full bg-ocean-50 flex items-center justify-center shrink-0">
                                            <Check size={14} className="text-ocean-600" />
                                        </div>
                                        <span className="text-sm font-bold">Ficha da empresa com fotos, telefone e endereço</span>
                                    </div>
                                    {plan.maxCoupons > 0 && (
                                        <div className="flex items-center gap-4 text-slate-600">
                                            <div className="w-6 h-6 rounded-full bg-ocean-50 flex items-center justify-center shrink-0">
                                                <Check size={14} className="text-ocean-600" />
                                            </div>
                                            <span className="text-sm font-bold">Até {plan.maxCoupons} cupons ativos</span>
                                        </div>
                                    )}
                                    {(plan.maxEvents ?? 0) > 0 && (
                                        <div className="flex items-center gap-4 text-slate-600">
                                            <div className="w-6 h-6 rounded-full bg-ocean-50 flex items-center justify-center shrink-0">
                                                <Check size={14} className="text-ocean-600" />
                                            </div>
                                            <span className="text-sm font-bold">Até {plan.maxEvents} {plan.maxEvents === 1 ? 'evento' : 'eventos'} na agenda</span>
                                        </div>
                                    )}
                                    {plan.isFeatured && (
                                        <div className="flex items-center gap-4 text-slate-600">
                                            <div className="w-6 h-6 rounded-full bg-ocean-50 flex items-center justify-center shrink-0">
                                                <Check size={14} className="text-ocean-600" />
                                            </div>
                                            <span className="text-sm font-bold">Destaque nas pesquisas</span>
                                        </div>
                                    )}
                                    {plan.showGallery && (
                                        <div className="flex items-center gap-4 text-slate-600">
                                            <div className="w-6 h-6 rounded-full bg-ocean-50 flex items-center justify-center shrink-0">
                                                <Check size={14} className="text-ocean-600" />
                                            </div>
                                            <span className="text-sm font-bold">Galeria de fotos completa</span>
                                        </div>
                                    )}
                                    {plan.showMenu && (
                                        <div className="flex items-center gap-4 text-slate-600">
                                            <div className="w-6 h-6 rounded-full bg-ocean-50 flex items-center justify-center shrink-0">
                                                <Check size={14} className="text-ocean-600" />
                                            </div>
                                            <span className="text-sm font-bold">Cardápio digital interativo</span>
                                        </div>
                                    )}
                                    {canOrder(plan) && (
                                        <div className="flex items-center gap-4 text-slate-600">
                                            <div className="w-6 h-6 rounded-full bg-ocean-50 flex items-center justify-center shrink-0">
                                                <Check size={14} className="text-ocean-600" />
                                            </div>
                                            <span className="text-sm font-bold">Pedidos direto no seu WhatsApp, sem comissão</span>
                                        </div>
                                    )}
                                    {(plan.extra || '').split('\n').map(x => x.trim()).filter(Boolean).map(x => (
                                        <div key={x} className="flex items-center gap-4 text-slate-600" data-testid="plan-extra">
                                            <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                                                <Check size={14} className="text-emerald-600" />
                                            </div>
                                            <span className="text-sm font-bold">{x}</span>
                                        </div>
                                    ))}
                                    {plan.showSocialMedia && (
                                        <div className="flex items-center gap-4 text-slate-600">
                                            <div className="w-6 h-6 rounded-full bg-ocean-50 flex items-center justify-center shrink-0">
                                                <Check size={14} className="text-ocean-600" />
                                            </div>
                                            <span className="text-sm font-bold">Links de redes sociais</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <button 
                                    onClick={() => handleSelectPlan(plan, false)}
                                    className={`w-full py-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${plan.id === recommendedId ? 'bg-ocean-600 text-white shadow-2xl shadow-ocean-600/30 hover:bg-ocean-700' : 'bg-slate-100 text-ocean-950 hover:bg-slate-200'}`}
                                >
                                    <MessageCircle size={18} />
                                    Assinar
                                </button>
                                {plan.hasFreeTrial && (
                                    <button 
                                        onClick={() => handleSelectPlan(plan, true)}
                                        className="w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all text-emerald-600 hover:bg-emerald-50 border border-emerald-100"
                                    >
                                        Ou venha testar por {plan.trialDays || 30} dias
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-[3.5rem] p-16 shadow-2xl shadow-slate-200/50 flex flex-col md:flex-row items-center justify-between gap-12 border border-slate-100">
                    <div className="space-y-4 max-w-xl">
                        <div className="w-16 h-16 bg-ocean-50 rounded-2xl flex items-center justify-center mb-2">
                            <Compass size={32} className="text-ocean-600" />
                        </div>
                        <h2 className="text-4xl font-black text-ocean-950 tracking-tight leading-none">Precisa de um plano personalizado?</h2>
                        <p className="text-slate-500 font-medium text-lg">Fale com nosso time comercial para soluções sob medida para grandes redes e franquias.</p>
                    </div>
                    <button 
                        onClick={handleTalkToConsultant}
                        className="bg-ocean-950 text-white px-12 py-6 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shrink-0 shadow-xl shadow-ocean-950/20"
                    >
                        Falar com Consultor
                    </button>
                </div>

            </div>
        </div>
    );
};
