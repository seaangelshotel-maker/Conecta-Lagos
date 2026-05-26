
import React, { useState, useEffect } from 'react';
import { User, UserRole, BusinessProfile, PricingPlan } from '../types';
import { getCategories, saveBusiness, updateUser, getCities, getNeighborhoods, getPricingPlans } from '../services/dataService';
import { Store, ArrowLeft, Loader2, CheckCircle2, MapPin, Phone, Info, Zap, Check, X } from 'lucide-react';
import { useNotification } from '../components/NotificationSystem';
import { ImageUpload } from '../components/ImageUpload';

interface CreateBusinessProps {
    currentUser: User;
    onNavigate: (page: string) => void;
}

export const CreateBusiness: React.FC<CreateBusinessProps> = ({ currentUser, onNavigate }) => {
    const { notify } = useNotification();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
    const [gallery, setGallery] = useState<string[]>([]);
    const [step, setStep] = useState(1);
    const totalSteps = 4;

    const [categories, setCategories] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);
    const [neighborhoods, setNeighborhoods] = useState<any[]>([]);

    useEffect(() => {
        const loadInitialData = async () => {
            const [plans, cats, cts, nbs] = await Promise.all([
                getPricingPlans(),
                getCategories(),
                getCities(),
                getNeighborhoods()
            ]);
            
            const userPlan = plans.find(p => p.name === currentUser.plan) || plans[0];
            setSelectedPlan(userPlan);
            setCategories(cats);
            setCities(cts);
            setNeighborhoods(nbs);
        };
        loadInitialData();
    }, [currentUser.plan]);

    const [formData, setFormData] = useState({
        name: '',
        category: 'Gastronomia',
        subcategory: '',
        description: '',
        address: '',
        cityId: '',
        neighborhoodId: '',
        phone: currentUser.phone || '',
        coverImage: ''
    });

    const nextStep = () => {
        if (step === 1 && !formData.name.trim()) return notify('warning', "Por favor, insira o nome da empresa.");
        if (step === 2 && (!formData.cityId || !formData.neighborhoodId || !formData.address)) return notify('warning', "Por favor, preencha todos os dados de localização.");
        setStep(s => Math.min(s + 1, totalSteps));
        window.scrollTo(0, 0);
    };

    const prevStep = () => {
        setStep(s => Math.max(s - 1, 1));
        window.scrollTo(0, 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Tentativa de submissão - Passo:", step);
        if (step < totalSteps) return nextStep();
        
        setLoading(true);
        try {
            let subscriptionEndsAt = undefined;
            if (selectedPlan) {
                const now = new Date();
                if (selectedPlan.hasFreeTrial && selectedPlan.trialDays) {
                    now.setDate(now.getDate() + selectedPlan.trialDays);
                } else if (selectedPlan.period === 'yearly') {
                    now.setFullYear(now.getFullYear() + 1);
                } else {
                    now.setMonth(now.getMonth() + 1);
                }
                subscriptionEndsAt = now.toISOString();
            }

            const selectedNeighborhood = neighborhoods.find(n => n.id === formData.neighborhoodId);

            const newBiz: BusinessProfile = {
                id: currentUser.id,
                ownerId: currentUser.id,
                name: formData.name,
                category: formData.category,
                subcategory: formData.subcategory || undefined,
                description: formData.description || '',
                coverImage: formData.coverImage,
                gallery: gallery,
                address: formData.address,
                cityId: formData.cityId,
                neighborhoodId: formData.neighborhoodId,
                lat: selectedNeighborhood?.lat,
                lng: selectedNeighborhood?.lng,
                phone: formData.phone,
                amenities: [],
                openingHours: {},
                rating: 5,
                views: 0,
                shares: 0,
                isClaimed: true,
                status: 'PENDING',
                active: true,
                plan: selectedPlan?.id || '',
                subscriptionEndsAt
            };
            console.log("Salvando empresa:", newBiz);
            await saveBusiness(newBiz);

            console.log("Atualizando perfil do usuário...");
            const updatedUser: User = {
                ...currentUser,
                role: currentUser.role === UserRole.SUPER_ADMIN ? UserRole.SUPER_ADMIN : UserRole.COMPANY,
                permissions: {
                    ...(currentUser.permissions || { canCreateCoupons: false, canManageBusiness: false }),
                    canCreateBusiness: false,
                    canManageBusiness: true,
                    canCreateCoupons: true
                }
            };
            await updateUser(updatedUser);

            notify('success', "Sua empresa foi cadastrada com sucesso! Ela será analisada por nossa equipe antes de ser publicada no guia.");
            setSuccess(true);
            setTimeout(() => {
                onNavigate('admin-dashboard');
            }, 3000);
        } catch (error: any) {
            console.error("Erro ao criar empresa:", error);
            let message = "Erro ao criar empresa. Tente novamente.";
            
            try {
                const errData = JSON.parse(error.message);
                if (errData.error.includes('insufficient permissions')) {
                    message = "Erro de permissão no Firebase. Verifique as regras de segurança do Firestore.";
                }
            } catch (e) {
                // Not a JSON error or other issue
            }
            
            notify('error', message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white p-10 rounded-[3rem] shadow-2xl text-center max-w-md animate-in zoom-in-95 duration-500">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={48} />
                    </div>
                    <h2 className="text-3xl font-black text-ocean-950 mb-4 tracking-tight">Parabéns!</h2>
                    <p className="text-slate-500 font-medium mb-8">Sua empresa foi criada com sucesso. Você está sendo redirecionado para o seu novo painel de controle...</p>
                    <Loader2 className="animate-spin text-ocean-600 mx-auto" size={32} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header Onboarding */}
            <div className="bg-white border-b border-slate-100 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-ocean-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-ocean-600/20">
                        <Store size={24} />
                    </div>
                    <div>
                        <h1 className="text-sm font-black text-ocean-950 uppercase tracking-tight">Onboarding de Parceiro</h1>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Passo {step} de {totalSteps}</p>
                    </div>
                </div>
                <button 
                    onClick={() => onNavigate('user-dashboard')}
                    className="text-slate-400 hover:text-ocean-600 transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1 bg-slate-100">
                <div 
                    className="h-full bg-ocean-600 transition-all duration-500 ease-out"
                    style={{ width: `${(step / totalSteps) * 100}%` }}
                />
            </div>

            <div className="flex-1 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-0 lg:gap-12 p-6 md:p-12">
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="space-y-12">
                        {step === 1 && (
                            <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                                <div>
                                    <h2 className="text-4xl font-black text-ocean-950 tracking-tight mb-2">Vamos começar pelo básico</h2>
                                    <p className="text-slate-500 font-medium">Como os clientes devem conhecer sua empresa?</p>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Nome Fantasia</label>
                                        <input 
                                            required
                                            className="w-full bg-white border border-slate-200 rounded-2xl p-5 font-bold text-ocean-950 outline-none focus:ring-4 focus:ring-ocean-500/10 focus:border-ocean-500 transition-all text-lg"
                                            placeholder="Ex: Restaurante do Yuri"
                                            value={formData.name}
                                            onChange={e => setFormData({...formData, name: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Categoria Principal</label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {categories.map((cat: any) => (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    onClick={() => setFormData({...formData, category: cat.name, subcategory: ''})}
                                                    className={`p-4 rounded-2xl border-2 transition-all text-center font-bold text-sm ${formData.category === cat.name ? 'border-ocean-600 bg-ocean-50 text-ocean-600 shadow-md' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'}`}
                                                >
                                                    {cat.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    {formData.category && categories.find(c => c.name === formData.category)?.subcategories?.length > 0 && (
                                        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Subcategoria (Opcional)</label>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                {categories.find(c => c.name === formData.category)?.subcategories.map((sub: any) => (
                                                    <button
                                                        key={sub.id}
                                                        type="button"
                                                        onClick={() => setFormData({...formData, subcategory: sub.name})}
                                                        className={`p-3 rounded-xl border-2 transition-all text-center font-bold text-xs ${formData.subcategory === sub.name ? 'border-ocean-600 bg-ocean-50 text-ocean-600 shadow-sm' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'}`}
                                                    >
                                                        {sub.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                                <div>
                                    <h2 className="text-4xl font-black text-ocean-950 tracking-tight mb-2">Onde você está localizado?</h2>
                                    <p className="text-slate-500 font-medium">Isso ajuda os clientes a te encontrarem no mapa.</p>
                                </div>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Cidade</label>
                                            <select 
                                                required
                                                className="w-full bg-white border border-slate-200 rounded-2xl p-4 font-bold text-ocean-950 outline-none focus:ring-4 focus:ring-ocean-500/10 transition-all"
                                                value={formData.cityId}
                                                onChange={e => setFormData({...formData, cityId: e.target.value, neighborhoodId: ''})}
                                            >
                                                <option value="">Selecione a Cidade</option>
                                                {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Bairro</label>
                                            <select 
                                                required
                                                className="w-full bg-white border border-slate-200 rounded-2xl p-4 font-bold text-ocean-950 outline-none focus:ring-4 focus:ring-ocean-500/10 transition-all"
                                                value={formData.neighborhoodId}
                                                onChange={e => setFormData({...formData, neighborhoodId: e.target.value})}
                                                disabled={!formData.cityId}
                                            >
                                                <option value="">Selecione o Bairro</option>
                                                {neighborhoods.filter(n => n.cityId === formData.cityId).map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Endereço Completo</label>
                                        <input 
                                            required
                                            className="w-full bg-white border border-slate-200 rounded-2xl p-4 font-bold text-ocean-950 outline-none focus:ring-4 focus:ring-ocean-500/10 transition-all"
                                            placeholder="Rua, Número, Complemento"
                                            value={formData.address}
                                            onChange={e => setFormData({...formData, address: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                                <div>
                                    <h2 className="text-4xl font-black text-ocean-950 tracking-tight mb-2">Identidade Visual</h2>
                                    <p className="text-slate-500 font-medium">Uma imagem vale mais que mil palavras.</p>
                                </div>
                                <div className="space-y-8">
                                    <ImageUpload 
                                        label="Foto de Capa Principal"
                                        maxWidth={1000} // Capa pode ser maior
                                        currentImage={formData.coverImage}
                                        onImageSelect={(base64) => setFormData({...formData, coverImage: base64})}
                                    />

                                    {selectedPlan?.showGallery && (
                                        <div className="space-y-4">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Galeria de Fotos (Limite 6)</label>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                                {gallery.map((img, idx) => (
                                                    <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group shadow-sm border border-slate-100">
                                                        <img src={img} className="w-full h-full object-cover" />
                                                        <button 
                                                            type="button"
                                                            onClick={() => setGallery(prev => prev.filter((_, i) => i !== idx))}
                                                            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    </div>
                                                ))}
                                                <ImageUpload 
                                                    allowMultiple 
                                                    maxWidth={600} // Galeria pode ser menor
                                                    className="aspect-square"
                                                    onBatchSelect={imgs => {
                                                        const newGallery = [...gallery, ...imgs].slice(0, 6);
                                                        setGallery(newGallery);
                                                        if (gallery.length + imgs.length > 6) {
                                                            notify('info', "Limite de 6 fotos na galeria atingido para otimizar o banco de dados.");
                                                        }
                                                    }} 
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                                <div>
                                    <h2 className="text-4xl font-black text-ocean-950 tracking-tight mb-2">Quase lá!</h2>
                                    <p className="text-slate-500 font-medium">Últimos detalhes para publicar sua empresa.</p>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">WhatsApp de Contato</label>
                                        <input 
                                            className="w-full bg-white border border-slate-200 rounded-2xl p-4 font-bold text-ocean-950 outline-none focus:ring-4 focus:ring-ocean-500/10 transition-all"
                                            placeholder="(21) 99999-9999"
                                            value={formData.phone}
                                            onChange={e => setFormData({...formData, phone: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Descrição do Negócio</label>
                                        <textarea 
                                            rows={6}
                                            className="w-full bg-white border border-slate-200 rounded-2xl p-4 font-bold text-ocean-950 outline-none focus:ring-4 focus:ring-ocean-500/10 transition-all resize-none"
                                            placeholder="Conte um pouco sobre o seu negócio, sua história e o que você oferece..."
                                            value={formData.description}
                                            onChange={e => setFormData({...formData, description: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 lg:static lg:p-0 lg:bg-transparent lg:border-none flex items-center gap-4 pt-4 lg:pt-8 z-40">
                            {step > 1 && (
                                <button 
                                    type="button"
                                    onClick={prevStep}
                                    className="px-8 py-5 rounded-2xl font-black text-xs text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all uppercase tracking-widest"
                                >
                                    Voltar
                                </button>
                            )}
                            <button 
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-ocean-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-ocean-600/20 hover:bg-ocean-700 transition-all flex items-center justify-center gap-3 text-sm uppercase tracking-widest disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : (step === totalSteps ? <CheckCircle2 size={20} /> : null)}
                                {step === totalSteps ? 'Finalizar Cadastro' : 'Continuar'}
                            </button>
                        </div>
                        {/* Add padding at the bottom on mobile to prevent content from being hidden behind the fixed button */}
                        <div className="h-24 lg:hidden"></div>
                    </form>
                </div>

                <div className="hidden lg:block">
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 sticky top-32">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-ocean-50 rounded-xl flex items-center justify-center">
                                <Zap size={20} className="text-ocean-600" />
                            </div>
                            <h2 className="text-xl font-black text-ocean-950">Seu Plano</h2>
                        </div>

                        {selectedPlan ? (
                            <div className="space-y-6">
                                <div className="p-4 bg-ocean-50 rounded-2xl border border-ocean-100">
                                    <p className="text-[10px] font-black text-ocean-600 uppercase tracking-widest mb-1">Plano Selecionado</p>
                                    <p className="text-2xl font-black text-ocean-950">{selectedPlan.name}</p>
                                    <p className="text-sm font-bold text-ocean-800">R$ {selectedPlan.price}/{selectedPlan.period === 'monthly' ? 'mês' : 'ano'}</p>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recursos Inclusos:</p>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <Check size={16} className="text-emerald-500 shrink-0" />
                                            <span className="text-sm font-bold">Até {selectedPlan.maxCoupons} cupons ativos</span>
                                        </div>
                                        {selectedPlan.showGallery && (
                                            <div className="flex items-center gap-3 text-slate-600">
                                                <Check size={16} className="text-emerald-500 shrink-0" />
                                                <span className="text-sm font-bold">Galeria de fotos completa</span>
                                            </div>
                                        )}
                                        {selectedPlan.showMenu && (
                                            <div className="flex items-center gap-3 text-slate-600">
                                                <Check size={16} className="text-emerald-500 shrink-0" />
                                                <span className="text-sm font-bold">Cardápio digital interativo</span>
                                            </div>
                                        )}
                                        {selectedPlan.showSocialMedia && (
                                            <div className="flex items-center gap-3 text-slate-600">
                                                <Check size={16} className="text-emerald-500 shrink-0" />
                                                <span className="text-sm font-bold">Links de redes sociais</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="animate-pulse space-y-4">
                                <div className="h-20 bg-slate-100 rounded-2xl"></div>
                                <div className="h-40 bg-slate-100 rounded-2xl"></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
