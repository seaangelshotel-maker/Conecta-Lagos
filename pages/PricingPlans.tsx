
import React, { useState, useEffect } from 'react';
import { User, PricingPlan, UserRole } from '../types';
import { getPricingPlans, updateUser, getBusinesses, updateBusinessPlan, getAllUsers, getPaymentSettings, getGlobalSettings } from '../services/dataService';
import { Check, ArrowRight, MessageCircle, Star, Shield, Zap, Loader2, CreditCard, Lock, Calendar, Info, X, Gem, Compass } from 'lucide-react';
import { useNotification } from '../components/NotificationSystem';

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
        try {
            const settings = await getGlobalSettings();
            const whatsapp = settings.salesWhatsapp || '5522998765432';
            
            const message = `Olá! Tenho interesse no Plano ${plan.name} (${isTrial ? 'Período de Teste' : 'Assinatura'}) do Lagos GO para minha empresa. Meu e-mail de cadastro é: ${currentUser.email}`;
            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = `https://wa.me/${whatsapp}?text=${encodedMessage}`;
            
            // Simular um pequeno delay para feedback visual
            setTimeout(() => {
                window.open(whatsappUrl, '_blank');
                setLoading(false);
                notify('success', 'Redirecionando para o consultor no WhatsApp...');
            }, 800);
            
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
            const whatsapp = settings.salesWhatsapp || '5522998765432';
            const message = `Olá! Vi o Lagos GO e gostaria de falar com um consultor sobre um plano personalizado para minha empresa.`;
            const whatsappUrl = `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        } catch (e) {
            notify('error', 'Erro ao abrir WhatsApp');
        }
        setLoading(false);
    };

    if (loading && plans.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="animate-spin text-ocean-600" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-24 pt-24 px-6">
            <div className="max-w-7xl mx-auto space-y-20">
                <div className="text-center space-y-6 max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-ocean-100 text-ocean-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                        <Gem size={14} />
                        Planos de Crescimento
                    </div>
                    <h1 className="text-6xl font-black text-ocean-950 tracking-tight leading-[0.9]">Escolha o plano ideal para o seu negócio</h1>
                    <p className="text-slate-500 font-medium text-xl leading-relaxed">Impulsione sua visibilidade no Lagos GO e alcance milhares de novos clientes todos os dias com ferramentas profissionais.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                    {plans.map((plan) => (
                        <div 
                            key={plan.id} 
                            className={`bg-white rounded-[3.5rem] p-12 border-2 transition-all flex flex-col relative ${plan.isFeatured ? 'border-ocean-500 shadow-2xl shadow-ocean-500/10 md:scale-105 z-10' : 'border-slate-100 shadow-xl hover:border-ocean-200'}`}
                        >
                            {plan.isFeatured && (
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
                                    <span className="text-5xl font-black text-ocean-950">R$ {plan.price}</span>
                                    <span className="text-slate-400 font-bold text-sm">/{plan.period === 'monthly' ? 'mês' : 'ano'}</span>
                                </div>
                                <p className="text-slate-400 text-sm font-medium">Ideal para {plan.name === 'Bronze' ? 'pequenos negócios' : plan.name === 'Prata' ? 'negócios em expansão' : 'grandes operações'}.</p>
                            </div>

                            <div className="flex-1 space-y-5 mb-12">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">O que está incluso:</p>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 text-slate-600">
                                        <div className="w-6 h-6 rounded-full bg-ocean-50 flex items-center justify-center shrink-0">
                                            <Check size={14} className="text-ocean-600" />
                                        </div>
                                        <span className="text-sm font-bold">Até {plan.maxCoupons} cupons ativos</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-slate-600">
                                        <div className="w-6 h-6 rounded-full bg-ocean-50 flex items-center justify-center shrink-0">
                                            <Check size={14} className="text-ocean-600" />
                                        </div>
                                        <span className="text-sm font-bold">Destaque nas pesquisas</span>
                                    </div>
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
                                    className={`w-full py-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${plan.isFeatured ? 'bg-ocean-600 text-white shadow-2xl shadow-ocean-600/30 hover:bg-ocean-700' : 'bg-slate-100 text-ocean-950 hover:bg-slate-200'}`}
                                >
                                    <MessageCircle size={18} />
                                    Assinar Via WhatsApp
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

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-slate-200">
                    <div className="text-center space-y-2">
                        <div className="text-2xl font-black text-ocean-950">50k+</div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Usuários Ativos</div>
                    </div>
                    <div className="text-center space-y-2">
                        <div className="text-2xl font-black text-ocean-950">1.2k+</div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Empresas Parceiras</div>
                    </div>
                    <div className="text-center space-y-2">
                        <div className="text-2xl font-black text-ocean-950">15k+</div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cupons Resgatados</div>
                    </div>
                    <div className="text-center space-y-2">
                        <div className="text-2xl font-black text-ocean-950">4.9/5</div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avaliação Média</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
