import React, { useState, useEffect } from 'react';
import { useNotification } from '../components/NotificationSystem';
import { User, Coupon, BusinessProfile, DEFAULT_AMENITIES, MenuSection, MenuItem, CompanyRequest, UserRole, PricingPlan, HomeHighlight, City, Neighborhood, AppCategory, AppAmenity } from '../types';
import { 
  getCoupons, saveCoupon, deleteCoupon, getBusinesses, getAllBusinesses, 
  saveBusiness, getBusinessStats, getCategories, saveCategory, 
  getCompanyRequests, approveCompanyRequest, rejectCompanyRequest, 
  getAllUsers, toggleBusinessStatus, deleteBusiness, setManualPassword, 
  resetUserPassword, createAdminPlace, updateClaimableStatus, getPricingPlans, 
  savePricingPlan, deletePricingPlan, getAllHomeHighlights, saveHomeHighlight, 
  deleteHomeHighlight, getCities, getNeighborhoods, saveCity, saveNeighborhood, 
  deleteCity, deleteNeighborhood, updateBusinessPlan, getCollections, 
  saveCollection, deleteCollection, getPendingReviews, approveReview, 
  rejectReview, updateUser, getPaymentSettings, savePaymentSettings, 
  getRedemptionsByBusiness, validateRedemption, getAmenities, saveAmenity 
} from '../services/dataService';
import { seedTouristSpots } from '../services/seedService';
import { 
  Plus, Ticket, Store, Loader2, Star, Eye, 
  Settings, ChevronLeft, Save, Trash2, X,
  BarChart3, CheckCircle2, DollarSign, 
  TrendingUp, Share2, MousePointer2, PieChart as PieIcon,
  Navigation, Utensils, Instagram, Share, Globe, ShoppingCart, CalendarDays, Phone, MapPin, Check, Clock, MessageCircle, Layers, Zap,
  Mail, User as UserIcon, ShieldAlert, ShieldCheck, UserX, Key, Lock, Layout, ShoppingBag, PenTool, Users, Image as ImageIcon, CreditCard, LogIn, LogOut, QrCode, RefreshCw, Sparkles, Bot
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import { ImageUpload } from '../components/ImageUpload';
import { AIAgentTeam } from './AIAgentTeam';
import { LocationPicker } from '../components/LocationPicker';
import { BusinessHoursEditor } from '../components/BusinessHoursEditor';
import { AdminStats } from '../components/admin/AdminStats';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { GoogleDriveManager } from '../components/GoogleDriveManager';
import { PaymentSettings } from '../types';
import { auth } from '../services/firebase';

const COLORS = ['#0ea5e9', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export const AdminDashboard: React.FC<{ currentUser: User; onNavigate: (page: string, params?: any) => void; onLogout: () => void }> = ({ currentUser, onNavigate, onLogout }) => {
  const { notify, confirm } = useNotification();
  const [view, setView] = useState<'HOME' | 'COUPONS' | 'PROFILE' | 'CREATE_COUPON' | 'MENU' | 'CATEGORIES' | 'REQUESTS' | 'BUSINESSES' | 'CREATE_PLACE' | 'PLANS' | 'HIGHLIGHTS' | 'LOCATIONS' | 'USERS' | 'COLLECTIONS' | 'REVIEWS' | 'MY_PLAN' | 'PAYMENT_SETTINGS' | 'REDEMPTIONS' | 'AGENT_TEAM' | 'GOOGLE_DRIVE'>('HOME');
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({ isPaymentActive: false, isTestMode: true, isDirectPaymentTest: true });
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [isValidatingRedemption, setIsValidatingRedemption] = useState(false);
  const [myBusiness, setMyBusiness] = useState<BusinessProfile | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [amenitiesList, setAmenitiesList] = useState<AppAmenity[]>([]);
  const [newSubcategory, setNewSubcategory] = useState<{ [key: string]: string }>({});
  const [requests, setRequests] = useState<CompanyRequest[]>([]);
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [highlights, setHighlights] = useState<HomeHighlight[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);
  const [newJournalist, setNewJournalist] = useState({ name: '', email: '', password: '' });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [editBusiness, setEditBusiness] = useState<Partial<BusinessProfile>>({});
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordPrompt, setPasswordPrompt] = useState<{ businessId: string, businessName: string } | null>(null);
  const [manualPass, setManualPass] = useState('');

  const [newCoupon, setNewCoupon] = useState<Partial<Coupon>>({
    title: '',
    description: '',
    originalPrice: 0,
    discountedPrice: 0,
    category: currentUser.category || 'Gastronomia',
    active: true,
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    rules: [
      'Válido apenas para consumo no local',
      'Não cumulativo com outras promoções',
      'Apresente este cupom antes de solicitar a conta',
      'Sujeito a disponibilidade e lotação'
    ],
    maxRedemptions: 100,
    currentRedemptions: 0,
    limitPerUser: 1,
    companyId: currentUser.role === UserRole.COMPANY ? currentUser.id : '',
    companyName: currentUser.role === UserRole.COMPANY ? (myBusiness?.name || currentUser.companyName || currentUser.name) : ''
  });
  
  const [allBusinesses, setAllBusinesses] = useState<BusinessProfile[]>([]);
  
  const [newPlace, setNewPlace] = useState<Partial<BusinessProfile>>({
    name: '',
    description: '',
    category: 'Passeios',
    coverImage: '',
    address: '',
    canBeClaimed: true,
    openingHours: {},
    plan: ''
  });

  const [newPlan, setNewPlan] = useState<Partial<PricingPlan>>({
    name: '',
    price: 0,
    period: 'monthly',
    maxCoupons: 5,
    maxBusinesses: 1,
    isFeatured: false,
    showGallery: true,
    showMenu: true,
    showSocialMedia: true,
    showReviews: true,
    hasFreeTrial: false,
    trialDays: 30,
    active: true
  });

  const refreshData = async () => {
    const allCoupons = await getCoupons(true, true);
    const allUsers = await getAllUsers();
    const myUserIds = Array.from(new Set([currentUser.id, ...allUsers.filter(u => u.email === currentUser.email).map(u => u.id)]));
    
    if (currentUser.role === UserRole.SUPER_ADMIN) {
        setCoupons(allCoupons);
    } else {
        setCoupons(allCoupons.filter(c => myUserIds.includes(c.companyId)));
    }
    const allBiz = await getAllBusinesses(true);
    setAllBusinesses(allBiz);
    const biz = allBiz.find(b => myUserIds.includes(b.id));
    if (biz) {
        setMyBusiness(biz);
        setEditBusiness(prev => Object.keys(prev).length === 0 ? biz : prev);
        setNewCoupon(prev => ({
            ...prev,
            companyName: biz.name,
            companyId: biz.id
        }));
    } else if (currentUser.role === UserRole.COMPANY || currentUser.role === UserRole.JOURNALIST) {
        // Fallback for new businesses: initialize with user data
        const defaultBiz: Partial<BusinessProfile> = {
            id: currentUser.id,
            ownerId: currentUser.id,
            name: currentUser.name || '',
            email: currentUser.email || '',
            plan: currentUser.plan || 'free',
            status: 'PENDING',
            active: true,
            createdAt: new Date().toISOString()
        };
        setEditBusiness(prev => Object.keys(prev).length === 0 ? defaultBiz : prev);
    }
    const s = await getBusinessStats(biz ? biz.id : currentUser.id);
    setStats(s);
    
    const [cats, cts, nbs, ams] = await Promise.all([
        getCategories(),
        getCities(),
        getNeighborhoods(),
        getAmenities()
    ]);
    setCategories(cats);
    setCities(cts);
    setNeighborhoods(nbs);
    setAmenitiesList(ams);
    
    if (currentUser.role === UserRole.SUPER_ADMIN) {
        const [allRequests, allPlans, allHighlights, allCollections, paySettings] = await Promise.all([
            getCompanyRequests(),
            getPricingPlans(),
            getAllHomeHighlights(),
            getCollections(),
            getPaymentSettings()
        ]);
        setRequests(allRequests.filter(r => r.status === 'PENDING'));
        setPlans(allPlans);
        setHighlights(allHighlights);
        setCollections(allCollections);
        setPaymentSettings(paySettings);
        const allU = await getAllUsers();
        setUsers(allU);
        const pReviews = await getPendingReviews();
        setPendingReviews(pReviews);
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
    const handleUpdate = () => refreshData();
    window.addEventListener('dataUpdated', handleUpdate);
    return () => window.removeEventListener('dataUpdated', handleUpdate);
  }, [currentUser]);

  useEffect(() => {
    if (view === 'REDEMPTIONS') {
        const busId = myBusiness?.id || (currentUser.role === UserRole.COMPANY ? currentUser.id : '');
        if (busId) {
            getRedemptionsByBusiness(busId).then(setRedemptions);
        }
    }
  }, [view, myBusiness, currentUser]);

  useEffect(() => {
    // Check for payment status in URL
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const planId = params.get('plan_id');
    if (status === 'success' && planId && myBusiness) {
        const plan = plans.find(p => p.id === planId);
        if (plan) {
            updateBusinessPlan(myBusiness.id, planId).then(() => {
                const updatedUser: User = {
                    ...currentUser,
                    role: UserRole.COMPANY,
                    plan: plan.name,
                    maxCoupons: plan.maxCoupons,
                    permissions: {
                        ...(currentUser.permissions || {}),
                        canCreateBusiness: true,
                        canManageBusiness: true,
                        canCreateCoupons: true
                    }
                };
                return updateUser(updatedUser);
            }).then(() => {
                notify('success', 'Assinatura confirmada com sucesso!');
                refreshData();
            }).catch(err => {
                console.error(err);
                notify('error', 'Erro ao atualizar assinatura.');
            });
        }
        // Remove params from URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [myBusiness, plans]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    console.log("Iniciando salvamento do perfil...");
    
    // Use myBusiness, or editBusiness if it has an ID, or fallback to currentUser.id
    const targetId = myBusiness?.id || editBusiness.id || currentUser.id;
    const baseBusiness = myBusiness || (editBusiness.id ? editBusiness : {
        id: currentUser.id,
        ownerId: currentUser.id,
        name: currentUser.name || '',
        email: currentUser.email || '',
        plan: currentUser.plan || 'free',
        status: 'PENDING',
        active: true
    });

    console.log("ID de destino:", targetId);
    console.log("Dados base:", baseBusiness);
    console.log("Dados editados:", editBusiness);

    setIsSaving(true);
    try {
        const updatedData = { ...baseBusiness, ...editBusiness, id: targetId } as BusinessProfile;
        console.log("Objeto final para salvar:", updatedData);
        
        await saveBusiness(updatedData);
        notify('success', "Alterações salvas com sucesso!");
        
        // If it's a super admin editing another business, go back to BUSINESSES
        if (currentUser.role === UserRole.SUPER_ADMIN && targetId !== currentUser.id) {
            setView('BUSINESSES');
        } else {
            setView('HOME');
        }
        refreshData();
    } catch (error) {
        console.error("Erro ao salvar empresa:", error);
        notify('error', "Erro ao salvar alterações. Tente novamente.");
    } finally {
        setIsSaving(false);
    }
  };

  const handleValidateRedemptionAction = async (redemptionId: string, verificationCode: string) => {
    setIsValidatingRedemption(true);
    try {
        await validateRedemption(redemptionId, verificationCode);
        notify('success', "Cupom validado com sucesso!");
        const busId = myBusiness?.id || (currentUser.role === UserRole.COMPANY ? currentUser.id : '');
        if (busId) {
            const rdms = await getRedemptionsByBusiness(busId);
            setRedemptions(rdms);
        }
    } catch (error: any) {
        notify('error', error.message || "Erro ao validar cupom.");
    } finally {
        setIsValidatingRedemption(false);
    }
  };

  const handleAddMenuSection = () => {
      const currentMenu = [...(editBusiness.menu || [])];
      currentMenu.push({ title: 'Nova Categoria', items: [] });
      setEditBusiness({ ...editBusiness, menu: currentMenu });
  };

  const handleAddMenuItem = (sectionIndex: number) => {
      const currentMenu = [...(editBusiness.menu || [])];
      currentMenu[sectionIndex].items.push({
          id: `item_${Date.now()}`,
          name: 'Novo Item',
          price: 0,
          description: ''
      });
      setEditBusiness({ ...editBusiness, menu: currentMenu });
  };

  const handleDeleteMenuItem = (sectionIndex: number, itemIndex: number) => {
      const currentMenu = [...(editBusiness.menu || [])];
      currentMenu[sectionIndex].items.splice(itemIndex, 1);
      setEditBusiness({ ...editBusiness, menu: currentMenu });
  };

  const handleAddSubcategory = async (categoryId: string) => {
    const subcategoryName = newSubcategory[categoryId]?.trim();
    if (!subcategoryName) return;

    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    const newSubcategoryObj = {
        id: subcategoryName.toLowerCase().replace(/\s+/g, '-'),
        name: subcategoryName
    };

    const updatedCategory = {
        ...category,
        subcategories: [...(category.subcategories || []), newSubcategoryObj]
    };

    await saveCategory(updatedCategory);
    setNewSubcategory({ ...newSubcategory, [categoryId]: '' });
  };

  const handleDeleteSubcategory = async (categoryId: string, subcategoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    const updatedCategory = {
        ...category,
        subcategories: (category.subcategories || []).filter((s: any) => s.id !== subcategoryId)
    };

    await saveCategory(updatedCategory);
  };

  const handleApprove = async (requestId: string) => {
    await approveCompanyRequest(requestId);
    refreshData();
  };

  const handleReject = async (requestId: string) => {
    await rejectCompanyRequest(requestId);
    refreshData();
  };

  const handleCreatePlace = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
        await createAdminPlace(newPlace);
        notify('success', "Lugar cadastrado com sucesso no guia!");
        setView('BUSINESSES');
        setNewPlace({
            name: '',
            description: '',
            category: 'Passeios',
            coverImage: '',
            address: '',
            canBeClaimed: true,
            openingHours: {},
            plan: ''
        });
        refreshData();
    } catch (err) {
        notify('error', "Erro ao cadastrar lugar.");
    } finally {
        setIsSaving(false);
    }
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
        await savePricingPlan(newPlan);
        notify('success', "Plano salvo com sucesso!");
        setNewPlan({
            name: '',
            price: 0,
            period: 'monthly',
            maxCoupons: 5,
            maxBusinesses: 1,
            isFeatured: false,
            showGallery: true,
            showMenu: true,
            showSocialMedia: true,
            showReviews: true,
            hasFreeTrial: false,
            trialDays: 30,
            active: true
        });
        refreshData();
    } catch (err) {
        notify('error', "Erro ao salvar plano.");
    } finally {
        setIsSaving(false);
    }
  };

  const handleSavePaymentSettings = async () => {
    setIsSaving(true);
    try {
        await savePaymentSettings(paymentSettings);
        notify('success', 'Configurações de pagamento salvas com sucesso!');
    } catch (error: any) {
        console.error("Error saving payment settings:", error);
        notify('error', error.message || 'Erro ao salvar configurações de pagamento.');
    } finally {
        setIsSaving(false);
    }
  };

  const handleManageSubscription = async () => {
    notify('info', 'Para gerenciar sua assinatura, acesse sua conta no PagBank ou entre em contato com nosso suporte.');
  };

  const handleDeletePlan = async (id: string) => {
    if (await confirm({ title: 'Excluir Plano', message: "Deseja excluir este plano?" })) {
        await deletePricingPlan(id);
        refreshData();
    }
  };

  if (loading && !stats) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-ocean-600" size={48} /></div>;

  if (view === 'AGENT_TEAM' && currentUser.role === UserRole.SUPER_ADMIN) {
      return <AIAgentTeam onBack={() => setView('HOME')} />;
  }

  const renderName = () => {
      const name = myBusiness?.name || (currentUser.companyName !== 'Minha Empresa' ? currentUser.companyName : null) || currentUser.name;
      return typeof name === 'string' ? name : 'Empresa';
  };

  const isSubscriptionExpired = () => {
      if (currentUser.role === UserRole.SUPER_ADMIN) return false;
      if (!myBusiness?.subscriptionEndsAt) return false;
      return new Date(myBusiness.subscriptionEndsAt) < new Date();
  };

  const activePlan = plans.find(p => p.name === myBusiness?.plan || p.name === currentUser.plan);
  const isExpired = isSubscriptionExpired();

  return (
    <div className="pb-32 pt-10 px-4 max-w-7xl mx-auto space-y-8 animate-in fade-in">
      
      {isExpired && view !== 'MY_PLAN' && (
          <div className="bg-red-50 border border-red-200 p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 animate-in fade-in">
              <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                      <Lock className="text-red-500" size={24} />
                  </div>
                  <div>
                      <h3 className="text-red-900 font-black text-lg">Assinatura Expirada</h3>
                      <p className="text-red-700 text-sm font-medium">Seu período de teste ou assinatura chegou ao fim. Renove agora para continuar usando todos os recursos.</p>
                  </div>
              </div>
              <button 
                  onClick={() => setView('MY_PLAN')}
                  className="bg-red-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-colors whitespace-nowrap"
              >
                  Renovar Assinatura
              </button>
          </div>
      )}

      {/* HEADER DE PERFORMANCE */}
      <div className="bg-white p-4 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-ocean-600 rounded-2xl md:rounded-3xl overflow-hidden shadow-xl shrink-0">
                  {(editBusiness.coverImage || myBusiness?.coverImage) && <img src={editBusiness.coverImage || myBusiness?.coverImage} className="w-full h-full object-cover" referrerPolicy="no-referrer" />}
              </div>
              <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between md:justify-start gap-4">
                      <h1 className="text-xl md:text-3xl font-black text-ocean-950 tracking-tight truncate">
                          {renderName()}
                      </h1>
                      <button 
                          onClick={onLogout}
                          title="Sair da Conta"
                          className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 active:scale-95 text-red-600 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border border-red-100 transition-all shrink-0 cursor-pointer"
                      >
                          <LogOut size={12} className="stroke-[3]" />
                          <span>Sair</span>
                      </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                      <p className="text-[9px] md:text-[10px] text-ocean-600 font-black uppercase tracking-widest">Painel Administrativo</p>
                      {currentUser.role === UserRole.COMPANY && (myBusiness?.plan || currentUser.plan) && (
                          <span onClick={() => setView('MY_PLAN')} className="bg-gold-50 text-gold-600 px-2 py-0.5 rounded-md text-[8px] md:text-[10px] font-black uppercase tracking-widest border border-gold-100 flex items-center gap-1 cursor-pointer hover:bg-gold-100 transition-colors">
                              <Star size={8} className="md:w-[10px] md:h-[10px]" /> {myBusiness?.plan || currentUser.plan}
                          </span>
                      )}
                  </div>
              </div>
          </div>
          <div className="w-full md:w-auto overflow-hidden">
            <AdminSidebar 
              view={view} 
              setView={setView} 
              currentUser={currentUser} 
              onNavigate={onNavigate} 
              onLogout={onLogout} 
            />
          </div>
      </div>

      {view === 'MY_PLAN' && currentUser.role === UserRole.COMPANY && myBusiness && (
          <div className="bg-white p-6 md:p-12 rounded-[3rem] shadow-xl border border-slate-100 animate-in slide-in-from-bottom-6 space-y-8">
              <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-black text-ocean-950">Meu Plano</h2>
                  <button onClick={() => setView('HOME')} className="flex items-center gap-2 text-ocean-600 font-black text-xs uppercase">
                      <ChevronLeft size={16} /> Voltar
                  </button>
              </div>

              <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                      <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Plano Atual</p>
                          <h3 className="text-4xl font-black text-ocean-950 mb-2">{myBusiness.plan || currentUser.plan}</h3>
                          {myBusiness.subscriptionEndsAt ? (
                              <p className="text-sm font-bold text-slate-600">
                                  Válido até: {new Date(myBusiness.subscriptionEndsAt).toLocaleDateString('pt-BR')}
                                  {new Date(myBusiness.subscriptionEndsAt) < new Date() && (
                                      <span className="ml-2 text-red-500 font-black uppercase text-[10px] bg-red-100 px-2 py-1 rounded-full">Expirado</span>
                                  )}
                              </p>
                          ) : (
                              <p className="text-sm font-bold text-slate-600">Assinatura Ativa</p>
                          )}
                      </div>
                      
                      <div className="flex flex-wrap gap-4">
                          <button 
                              onClick={() => window.location.href = '/pricing-plans'}
                              className="bg-ocean-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:bg-ocean-700 transition-all flex items-center gap-2"
                          >
                              <Star size={18} /> FAZER UPGRADE
                          </button>
                          {(currentUser.paymentCustomerId || myBusiness.paymentCustomerId) && (
                              <button 
                                  onClick={handleManageSubscription}
                                  disabled={isSaving}
                                  className="bg-white border-2 border-slate-100 text-ocean-950 px-8 py-4 rounded-2xl font-black hover:bg-slate-50 transition-all flex items-center gap-2 disabled:opacity-50"
                              >
                                  {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Settings size={18} />} GERENCIAR ASSINATURA
                              </button>
                          )}
                      </div>
                  </div>
              </div>
          </div>
      )}

      {view === 'HOME' && stats && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
              {currentUser.role === UserRole.SUPER_ADMIN ? (
                  <div className="lg:col-span-12 space-y-6 md:space-y-8">
                      {/* TOURIST SPOTS SYNC SECTION - HIGH PROMINENCE */}
                      <div className="bg-gradient-to-br from-ocean-600 to-ocean-900 border border-ocean-400 rounded-[2.5rem] p-8 md:p-10 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl shadow-ocean-900/20 overflow-hidden relative group">
                          <div className="absolute right-0 top-0 opacity-10 pointer-events-none translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-700">
                              <MapPin size={300} className="text-white" />
                          </div>
                          
                          <div className="flex items-start gap-6 relative z-10 w-full lg:w-auto">
                              <div className="bg-white/10 backdrop-blur-md p-5 rounded-3xl text-white border border-white/20 shadow-inner">
                                  <MapPin size={36} />
                              </div>
                              <div className="space-y-2">
                                  <div className="flex items-center gap-3">
                                      <span className="bg-ocean-400/30 text-ocean-100 text-[10px] font-black px-3 py-1 rounded-full border border-ocean-400/30 uppercase tracking-widest">Setup Inicial</span>
                                      <h3 className="font-black text-white text-xl uppercase tracking-tighter">Guia Oficial Lagos GO</h3>
                                  </div>
                                  <p className="text-ocean-100 font-medium max-w-xl leading-relaxed text-sm md:text-base">
                                      Sincronize automaticamente os pontos turísticos verificados de <b>Arraial do Cabo</b> e <b>Cabo Frio</b>. 
                                      Este processo criará as cidades, bairros e categorias necessárias se não existirem.
                                  </p>
                              </div>
                          </div>

                          <button 
                              onClick={async () => {
                                  if (await confirm({ 
                                      title: 'VAMOS POPULAR O GUIA?', 
                                      message: 'Deseja cadastrar agora os locais oficiais verificados? Criaremos cidades e categorias automaticamente.' 
                                  })) {
                                      setActionLoading('seeding');
                                      try {
                                          await seedTouristSpots(notify);
                                          await refreshData();
                                      } finally {
                                          setActionLoading(null);
                                      }
                                  }
                              }}
                              disabled={actionLoading === 'seeding'}
                              className="relative z-10 bg-white text-ocean-900 hover:bg-ocean-50 px-10 py-6 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center gap-4 group/btn min-w-[280px] justify-center"
                          >
                              {actionLoading === 'seeding' ? (
                                  <Loader2 className="animate-spin" size={20} />
                              ) : (
                                  <RefreshCw size={20} className="group-hover/btn:rotate-180 transition-transform duration-500" />
                              )}
                              {actionLoading === 'seeding' ? 'SINCRONIZANDO...' : 'SINCRONIZAR GUIA'}
                          </button>
                      </div>

                      {/* AI AGENT TEAM SECTION */}
                      <div className="bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-700 rounded-[2.5rem] p-8 md:p-10 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl overflow-hidden relative group">
                          <div className="absolute right-0 top-0 opacity-10 pointer-events-none translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-700">
                              <Sparkles size={300} className="text-white" />
                          </div>
                          
                          <div className="flex items-start gap-6 relative z-10 w-full lg:w-auto">
                              <div className="bg-ocean-500 p-5 rounded-3xl text-white shadow-lg shadow-ocean-500/20">
                                  <Bot size={36} />
                              </div>
                              <div className="space-y-2">
                                  <div className="flex items-center gap-3">
                                      <span className="bg-ocean-500/20 text-ocean-400 text-[10px] font-black px-3 py-1 rounded-full border border-ocean-500/20 uppercase tracking-widest">Protocolo Alpha</span>
                                      <h3 className="font-black text-white text-xl uppercase tracking-tighter">Célula de Inteligência Lagos GO</h3>
                                  </div>
                                  <p className="text-slate-400 font-medium max-w-xl leading-relaxed text-sm md:text-base">
                                      Acione nossa equipe de 5 agentes especialistas (Pesquisador, Analista, Decisor, Copy e Revisor) para criar novos pontos turísticos com qualidade máxima.
                                  </p>
                              </div>
                          </div>

                          <button 
                              onClick={() => setView('AGENT_TEAM')}
                              className="relative z-10 bg-ocean-600 text-white hover:bg-ocean-500 px-10 py-6 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all active:scale-95 flex items-center gap-4 group/btn min-w-[280px] justify-center"
                          >
                              <Sparkles size={20} className="animate-pulse" />
                              ACESSAR WAR ROOM
                          </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
                          <div className="bg-amber-500 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group cursor-pointer" onClick={() => setView('REQUESTS')}>
                              <Layers className="absolute -right-4 -bottom-4 w-20 h-20 md:w-24 md:h-24 text-white/10 group-hover:scale-110 transition-transform" />
                              <p className="text-[9px] md:text-[10px] font-black text-amber-100 uppercase tracking-widest mb-1 md:mb-2">Reivindicações</p>
                              <h3 className="text-3xl md:text-4xl font-black">{requests.filter(r => r.type === 'CLAIM').length}</h3>
                              <p className="text-amber-100 text-[9px] md:text-[10px] font-bold mt-1 md:mt-2">Empresas Reivindicadas</p>
                          </div>
                          <div className="bg-blue-600 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group cursor-pointer" onClick={() => setView('REQUESTS')}>
                              <Layers className="absolute -right-4 -bottom-4 w-20 h-20 md:w-24 md:h-24 text-white/10 group-hover:scale-110 transition-transform" />
                              <p className="text-[9px] md:text-[10px] font-black text-blue-100 uppercase tracking-widest mb-1 md:mb-2">Leads de Cadastro</p>
                              <h3 className="text-3xl md:text-4xl font-black">{requests.filter(r => r.type === 'NEW_REGISTRATION').length}</h3>
                              <p className="text-blue-100 text-[9px] md:text-[10px] font-bold mt-1 md:mt-2">Novos Parceiros</p>
                          </div>
                          <div className="bg-ocean-600 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group cursor-pointer" onClick={() => setView('CATEGORIES')}>
                              <Layers className="absolute -right-4 -bottom-4 w-20 h-20 md:w-24 md:h-24 text-white/10 group-hover:scale-110 transition-transform" />
                              <p className="text-[9px] md:text-[10px] font-black text-ocean-100 uppercase tracking-widest mb-1 md:mb-2">Total de Categorias</p>
                              <h3 className="text-3xl md:text-4xl font-black">{categories.length}</h3>
                              <p className="text-ocean-100 text-[9px] md:text-[10px] font-bold mt-1 md:mt-2">Gestão de Segmentos</p>
                          </div>
                          <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm cursor-pointer hover:shadow-md transition-all group" onClick={() => setView('BUSINESSES')}>
                              <div className="flex justify-between items-start mb-1 md:mb-2">
                                 <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Empresas Ativas</p>
                                 <Store size={14} className="md:w-4 md:h-4 text-ocean-500 group-hover:scale-110 transition-transform" />
                              </div>
                              <h3 className="text-3xl md:text-4xl font-black text-ocean-950">{allBusinesses.length}</h3>
                              <p className="text-slate-400 text-[9px] md:text-[10px] font-bold mt-1 md:mt-2">Gerenciar Lojistas</p>
                          </div>
                          <div className="bg-purple-600 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group cursor-pointer" onClick={() => setView('PLANS')}>
                              <Zap className="absolute -right-4 -bottom-4 w-20 h-20 md:w-24 md:h-24 text-white/10 group-hover:scale-110 transition-transform" />
                              <p className="text-[9px] md:text-[10px] font-black text-purple-100 uppercase tracking-widest mb-1 md:mb-2">Planos de Assinatura</p>
                              <h3 className="text-3xl md:text-4xl font-black">{plans.length}</h3>
                              <p className="text-purple-100 text-[9px] md:text-[10px] font-bold mt-1 md:mt-2">Configurar Planos</p>
                          </div>
                          <div className="bg-pink-600 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group cursor-pointer" onClick={() => setView('HIGHLIGHTS')}>
                              <Layout className="absolute -right-4 -bottom-4 w-20 h-20 md:w-24 md:h-24 text-white/10 group-hover:scale-110 transition-transform" />
                              <p className="text-[9px] md:text-[10px] font-black text-pink-100 uppercase tracking-widest mb-1 md:mb-2">Destaques Home</p>
                              <h3 className="text-3xl md:text-4xl font-black">{highlights.length}</h3>
                              <p className="text-pink-100 text-[9px] md:text-[10px] font-bold mt-1 md:mt-2">Gerenciar Banners</p>
                          </div>
                      </div>

                      <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-sm">
                          <div className="flex justify-between items-center mb-6">
                              <h3 className="text-lg md:text-xl font-black text-ocean-950">Bem-vindo, Super Admin</h3>
                              {allBusinesses.filter(b => b.status === 'PENDING').length > 0 && (
                                  <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-2 animate-pulse">
                                      <ShieldAlert size={12} /> {allBusinesses.filter(b => b.status === 'PENDING').length} EMPRESAS PENDENTES
                                  </span>
                              )}
                          </div>
                          <p className="text-sm md:text-base text-slate-500 leading-relaxed">
                              Este é o seu painel de controle mestre. Aqui você pode gerenciar as solicitações de novas empresas, 
                              ajustar as categorias do sistema e monitorar o crescimento da plataforma.
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 md:mt-8">
                              <button onClick={() => setView('REQUESTS')} className="bg-slate-50 hover:bg-amber-50 p-4 md:p-6 rounded-2xl border border-slate-100 transition-all text-left">
                                  <h4 className="font-bold text-amber-600 mb-1">Ver Solicitações</h4>
                                  <p className="text-[10px] md:text-xs text-slate-500">Aprove ou rejeite novos parceiros.</p>
                              </button>
                              <button onClick={() => setView('CATEGORIES')} className="bg-slate-50 hover:bg-ocean-50 p-4 md:p-6 rounded-2xl border border-slate-100 transition-all text-left">
                                  <h4 className="font-bold text-ocean-600 mb-1">Gerenciar Categorias</h4>
                                  <p className="text-[10px] md:text-xs text-slate-500">Adicione ou remova subcategorias.</p>
                              </button>
                              <button onClick={() => setView('PLANS')} className="bg-slate-50 hover:bg-purple-50 p-4 md:p-6 rounded-2xl border border-slate-100 transition-all text-left">
                                  <h4 className="font-bold text-purple-600 mb-1">Planos de Assinatura</h4>
                                  <p className="text-[10px] md:text-xs text-slate-500">Crie planos personalizados para parceiros.</p>
                              </button>
                              <button onClick={() => setView('HIGHLIGHTS')} className="bg-slate-50 hover:bg-pink-50 p-4 md:p-6 rounded-2xl border border-slate-100 transition-all text-left">
                                  <h4 className="font-bold text-pink-600 mb-1">Destaques da Home</h4>
                                  <p className="text-[10px] md:text-xs text-slate-500">Gerencie o carrossel de banners da home.</p>
                              </button>
                          </div>
                      </div>
                  </div>
              ) : (
                  <>
                      {/* KPIs DE CONVERSÃO */}
                      <div className="lg:col-span-8 space-y-6 md:space-y-8">
                          {/* WELCOME / GETTING STARTED FOR NEW BUSINESSES */}
                          {myBusiness?.status === 'PENDING' && (
                              <div className="bg-amber-500 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] text-white shadow-2xl relative overflow-hidden mb-6 md:mb-8 animate-in zoom-in-95">
                                  <div className="relative z-10">
                                      <div className="flex items-center gap-3 mb-4 md:mb-6">
                                          <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-md rounded-xl md:rounded-2xl flex items-center justify-center">
                                              <Clock size={24} className="text-white md:w-[28px] md:h-[28px]" />
                                          </div>
                                          <h2 className="text-xl md:text-3xl font-black tracking-tight">Seu perfil está em análise! ⌛</h2>
                                      </div>
                                      <p className="text-amber-50 font-medium text-sm md:text-lg mb-6 md:mb-8 max-w-xl leading-relaxed">
                                          Nossa equipe recebeu suas informações e está revisando os dados. 
                                          Sua empresa aparecerá automaticamente no Guia Lagos GO assim que for aprovada!
                                      </p>
                                      <div className="flex items-center gap-4">
                                          <div className="flex -space-x-2">
                                              {[1, 2, 3].map(i => (
                                                  <div key={i} className="w-8 h-8 rounded-full border-2 border-amber-500 bg-amber-100 flex items-center justify-center text-amber-600 font-black text-[10px]">
                                                      {i}
                                                  </div>
                                              ))}
                                          </div>
                                          <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-amber-100">Processo de verificação ativado</p>
                                      </div>
                                  </div>
                                  <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-white/10 rounded-full -mr-32 -mt-32 md:-mr-48 md:-mt-48 blur-3xl"></div>
                              </div>
                          )}

                          {coupons.length === 0 && (
                              <div className="bg-gradient-to-br from-ocean-600 to-ocean-800 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] text-white shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-700">
                                  <div className="relative z-10">
                                      <div className="flex items-center gap-3 mb-4 md:mb-6">
                                          <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-md rounded-xl md:rounded-2xl flex items-center justify-center">
                                              <Zap size={24} className="text-ocean-200 md:w-[28px] md:h-[28px]" />
                                          </div>
                                          <h2 className="text-xl md:text-3xl font-black tracking-tight">Vamos começar a crescer?</h2>
                                      </div>
                                      <p className="text-ocean-100 font-medium text-sm md:text-lg mb-6 md:mb-8 max-w-xl">
                                          Sua empresa já está no ar! Agora, siga estes passos simples para atrair seus primeiros clientes.
                                      </p>
                                      
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                          <button 
                                              onClick={() => setView('CREATE_COUPON')}
                                              className="bg-white text-ocean-950 p-4 md:p-6 rounded-2xl flex items-center gap-4 hover:bg-ocean-50 transition-all text-left group"
                                          >
                                              <div className="w-10 h-10 bg-ocean-100 rounded-xl flex items-center justify-center text-ocean-600 group-hover:scale-110 transition-transform shrink-0">
                                                  <Ticket size={20} />
                                              </div>
                                              <div>
                                                  <p className="font-black text-xs md:text-sm uppercase tracking-tight">Criar Primeiro Cupom</p>
                                                  <p className="text-[10px] md:text-xs text-slate-500 font-bold">Atraia clientes com ofertas</p>
                                              </div>
                                          </button>
                                          <button 
                                              onClick={() => setView('PROFILE')}
                                              className="bg-white/10 backdrop-blur-md text-white p-4 md:p-6 rounded-2xl flex items-center gap-4 hover:bg-white/20 transition-all text-left group border border-white/10"
                                          >
                                              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform shrink-0">
                                                  <PenTool size={20} />
                                              </div>
                                              <div>
                                                  <p className="font-black text-xs md:text-sm uppercase tracking-tight">Completar Empresa</p>
                                                  <p className="text-[10px] md:text-xs text-ocean-200 font-bold">Adicione fotos e horários</p>
                                              </div>
                                          </button>
                                      </div>
                                  </div>
                                  <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-white/5 rounded-full -mr-32 -mt-32 md:-mr-48 md:-mt-48 blur-3xl"></div>
                              </div>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                              <div className="bg-ocean-950 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                                  <MousePointer2 className="absolute -right-4 -bottom-4 w-20 h-20 md:w-24 md:h-24 text-white/5 group-hover:scale-110 transition-transform" />
                                  <p className="text-[9px] md:text-[10px] font-black text-ocean-400 uppercase tracking-widest mb-1 md:mb-2">Total de Resgates</p>
                                  <h3 className="text-3xl md:text-4xl font-black">{stats.totalConversions}</h3>
                                  <p className="text-ocean-200 text-[9px] md:text-[10px] font-bold mt-1 md:mt-2">Leads Gerados pelo Guia</p>
                              </div>
                              <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm">
                                  <div className="flex justify-between items-start mb-1 md:mb-2">
                                     <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Compartilhamentos</p>
                                     <Share2 size={14} className="md:w-4 md:h-4 text-ocean-500" />
                                  </div>
                                  <h3 className="text-3xl md:text-4xl font-black text-ocean-950">{stats.shares}</h3>
                                  <p className="text-slate-400 text-[9px] md:text-[10px] font-bold mt-1 md:mt-2">Engajamento Social</p>
                              </div>
                              <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm">
                                  <div className="flex justify-between items-start mb-1 md:mb-2">
                                     <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Visitas Totais</p>
                                     <Eye size={14} className="md:w-4 md:h-4 text-ocean-500" />
                                  </div>
                                  <h3 className="text-3xl md:text-4xl font-black text-ocean-950">{stats.views}</h3>
                                  <p className="text-slate-400 text-[9px] md:text-[10px] font-bold mt-1 md:mt-2">Audiência da Página</p>
                              </div>
                          </div>

                          {/* GRÁFICO DE TENDÊNCIA DE CONVERSÃO */}
                          <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-sm">
                              <h3 className="text-base md:text-lg font-black text-ocean-950 mb-6 md:mb-8 flex items-center gap-3">
                                  <TrendingUp className="text-ocean-600 md:w-5 md:h-5" size={18} /> Fluxo de Resgates (Últimos 7 dias)
                              </h3>
                              <div className="h-48 md:h-72 w-full">
                                  <ResponsiveContainer width="100%" height="100%">
                                      <AreaChart data={stats.conversionTrend}>
                                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
                                          <YAxis hide />
                                          <Tooltip 
                                            contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                            labelStyle={{ fontWeight: 'black', color: '#0f172a' }}
                                          />
                                          <Area type="monotone" dataKey="valor" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorRes)" />
                                          <defs>
                                              <linearGradient id="colorRes" x1="0" y1="0" x2="0" y2="1">
                                                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                                                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                              </linearGradient>
                                          </defs>
                                      </AreaChart>
                                  </ResponsiveContainer>
                              </div>
                          </div>
                      </div>

                      {/* GRÁFICOS LATERAIS - ORIGEM E HEATMAP */}
                      <div className="lg:col-span-4 space-y-6 md:space-y-8">
                          {/* HEATMAP DE CLIQUES - AGORA COM DADOS REAIS DE BOTÕES */}
                          <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-sm">
                              <h3 className="text-base md:text-lg font-black text-ocean-950 mb-4 md:mb-6 flex items-center gap-3">
                                  <BarChart3 className="text-ocean-600 md:w-5 md:h-5" size={18} /> Comportamento (Botões)
                              </h3>
                              <div className="h-[300px] md:h-[400px] w-full">
                                  <ResponsiveContainer width="100%" height="100%">
                                      <BarChart data={stats.actionHeatmap} layout="vertical">
                                          <XAxis type="number" hide />
                                          <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 'bold'}} width={80} />
                                          <Tooltip 
                                            cursor={{fill: 'transparent'}}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                          />
                                          <Bar dataKey="cliques" radius={[0, 10, 10, 0]}>
                                              {stats.actionHeatmap.map((_: any, index: number) => (
                                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                              ))}
                                          </Bar>
                                      </BarChart>
                                  </ResponsiveContainer>
                              </div>
                              <p className="text-[9px] md:text-[10px] text-slate-400 mt-2 md:mt-4 text-center font-bold uppercase">Métricas em tempo real</p>
                          </div>

                          {/* ORIGEM DO TRÁFEGO */}
                          <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-sm">
                              <h3 className="text-base md:text-lg font-black text-ocean-950 mb-4 md:mb-6 flex items-center gap-3">
                                  <PieIcon className="text-ocean-600 md:w-5 md:h-5" size={18} /> Origem das Visitas
                              </h3>
                              <div className="h-48 md:h-64 w-full">
                                  <ResponsiveContainer width="100%" height="100%">
                                      <PieChart>
                                          <Pie
                                            data={stats.trafficSource}
                                            innerRadius={50}
                                            outerRadius={70}
                                            paddingAngle={8}
                                            dataKey="value"
                                          >
                                            {stats.trafficSource.map((_: any, index: number) => (
                                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                          </Pie>
                                          <Tooltip />
                                          <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{fontSize: '10px'}} />
                                      </PieChart>
                                  </ResponsiveContainer>
                              </div>
                          </div>
                      </div>
                  </>
              )}
          </div>
      )}
      {view === 'USERS' && (
          <div className="space-y-8">
              <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                  <h3 className="text-lg font-black text-ocean-950 mb-4">Criar Novo Jornalista</h3>
                  <p className="text-sm text-slate-500 mb-6">Crie um novo usuário com acesso direto ao Painel do Jornalista.</p>
                  
                  <form 
                      onSubmit={async (e) => {
                          e.preventDefault();
                          if (!newJournalist.name || !newJournalist.email || !newJournalist.password) {
                              notify('warning', 'Preencha todos os campos.');
                              return;
                          }
                          setIsSaving(true);
                          try {
                              const { createJournalistUser } = await import('../services/dataService');
                              await createJournalistUser(newJournalist.name, newJournalist.email, newJournalist.password);
                              notify('success', 'Jornalista criado com sucesso!');
                              setNewJournalist({ name: '', email: '', password: '' });
                              refreshData();
                          } catch (error: any) {
                              notify('error', 'Erro ao criar jornalista: ' + error.message);
                          } finally {
                              setIsSaving(false);
                          }
                      }}
                      className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
                  >
                      <div>
                          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Nome</label>
                          <input 
                              required 
                              className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-ocean-500" 
                              value={newJournalist.name} 
                              onChange={e => setNewJournalist({...newJournalist, name: e.target.value})} 
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Email</label>
                          <input 
                              required 
                              type="email"
                              className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-ocean-500" 
                              value={newJournalist.email} 
                              onChange={e => setNewJournalist({...newJournalist, email: e.target.value})} 
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Senha</label>
                          <input 
                              required 
                              type="password"
                              className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-ocean-500" 
                              value={newJournalist.password} 
                              onChange={e => setNewJournalist({...newJournalist, password: e.target.value})} 
                          />
                      </div>
                      <button 
                          type="submit" 
                          disabled={isSaving}
                          className="bg-indigo-600 text-white p-3 rounded-xl font-bold text-sm shadow-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
                      >
                          {isSaving ? 'Criando...' : 'Criar Jornalista'}
                      </button>
                  </form>
              </div>

              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-left">
                          <thead className="bg-slate-50">
                              <tr>
                                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase">Usuário</th>
                                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase">Cargo</th>
                                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase text-center">Ações</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                              {users.map(u => (
                                  <tr key={u.id} className="hover:bg-slate-50/50">
                                      <td className="px-6 py-5">
                                          <div className="flex items-center gap-3">
                                              <div className="w-10 h-10 rounded-full bg-ocean-50 text-ocean-600 flex items-center justify-center font-black text-sm">
                                                  {u.avatarUrl ? <img src={u.avatarUrl} className="w-full h-full rounded-full object-cover" /> : (u.name?.[0] || '?')}
                                              </div>
                                              <div>
                                                <p className="font-bold text-ocean-950 text-sm">{u.name || 'Sem nome'}</p>
                                                <p className="text-[10px] text-slate-400">{u.email || 'Sem e-mail'}</p>
                                              </div>
                                          </div>
                                      </td>
                                      <td className="px-6 py-5">
                                          <div className="flex flex-col gap-1">
                                            <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase w-fit ${u.role === UserRole.SUPER_ADMIN ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-slate-100 text-slate-500'}`}>
                                              {u.role === UserRole.SUPER_ADMIN ? '🛡️ SUPER ADMIN' : u.role}
                                            </span>
                                            {(u.email === 'sea.angelshotel@gmail.com' || u.email === 'admin@lagosgo.org' || u.email === 'admin@conectario.com') && (
                                              <span className="text-[8px] font-black text-red-400 uppercase tracking-tighter ml-1">Conta Mestra (Imutável)</span>
                                            )}
                                          </div>
                                      </td>
                                      <td className="px-6 py-5">
                                          <div className="flex justify-center items-center gap-2">
                                              {u.role !== UserRole.SUPER_ADMIN && u.role !== UserRole.JOURNALIST && u.email !== 'sea.angelshotel@gmail.com' && u.email !== 'admin@conectario.com' && (
                                                  <button 
                                                      onClick={async () => {
                                                          if (await confirm({ title: 'Promover a Jornalista', message: `Deseja transformar ${u.name} em Jornalista?` })) {
                                                              const { updateUser } = await import('../services/dataService');
                                                              await updateUser({ ...u, role: UserRole.JOURNALIST });
                                                              notify('success', `${u.name} agora é um Jornalista!`);
                                                              refreshData();
                                                          }
                                                      }}
                                                      className="p-3 bg-white text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-indigo-100"
                                                      title="Tornar Jornalista"
                                                  >
                                                      <PenTool size={18} />
                                                  </button>
                                              )}
                                              {u.role === UserRole.JOURNALIST && (
                                                  <button 
                                                      onClick={async () => {
                                                          if (await confirm({ title: 'Remover Jornalista', message: `Deseja remover o acesso de Jornalista de ${u.name}?` })) {
                                                              const { updateUser } = await import('../services/dataService');
                                                              await updateUser({ ...u, role: UserRole.CUSTOMER });
                                                              notify('success', `${u.name} agora é um Cliente comum.`);
                                                              refreshData();
                                                          }
                                                      }}
                                                      className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm border border-indigo-100"
                                                      title="Remover Acesso de Jornalista"
                                                  >
                                                      <PenTool size={18} />
                                                  </button>
                                              )}
                                          </div>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden divide-y divide-slate-50">
                      {users.map(u => (
                          <div key={u.id} className="p-5 space-y-4">
                              <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-full bg-ocean-50 text-ocean-600 flex items-center justify-center font-black text-lg shrink-0">
                                      {u.avatarUrl ? <img src={u.avatarUrl} className="w-full h-full rounded-full object-cover" /> : (u.name?.[0] || '?')}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                      <p className="font-black text-ocean-950 text-sm truncate">{u.name || 'Sem nome'}</p>
                                      <p className="text-[10px] text-slate-400 font-bold truncate">{u.email || 'Sem e-mail'}</p>
                                      <div className="flex items-center gap-2 mt-1">
                                          <span className={`inline-block text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${u.role === UserRole.SUPER_ADMIN ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-slate-100 text-slate-500'}`}>
                                              {u.role === UserRole.SUPER_ADMIN ? '🛡️ SUPER ADMIN' : u.role}
                                          </span>
                                          {(u.email === 'sea.angelshotel@gmail.com' || u.email === 'admin@lagosgo.org' || u.email === 'admin@conectario.com') && (
                                              <span className="text-[7px] font-black text-red-500 uppercase">Mestre</span>
                                          )}
                                      </div>
                                  </div>
                              </div>
                              <div className="flex gap-2">
                                  {u.role !== UserRole.SUPER_ADMIN && u.role !== UserRole.JOURNALIST && u.email !== 'sea.angelshotel@gmail.com' && u.email !== 'admin@conectario.com' && (
                                      <button 
                                          onClick={async () => {
                                              if (await confirm({ title: 'Promover a Jornalista', message: `Deseja transformar ${u.name} em Jornalista?` })) {
                                                  const { updateUser } = await import('../services/dataService');
                                                  await updateUser({ ...u, role: UserRole.JOURNALIST });
                                                  notify('success', `${u.name} agora é um Jornalista!`);
                                                  refreshData();
                                              }
                                          }}
                                          className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-50 text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest"
                                      >
                                          <PenTool size={14} /> TORNAR JORNALISTA
                                      </button>
                                  )}
                                  {u.role === UserRole.JOURNALIST && (
                                      <button 
                                          onClick={async () => {
                                              if (await confirm({ title: 'Remover Jornalista', message: `Deseja remover o acesso de Jornalista de ${u.name}?` })) {
                                                  const { updateUser } = await import('../services/dataService');
                                                  await updateUser({ ...u, role: UserRole.CUSTOMER });
                                                  notify('success', `${u.name} agora é um Cliente comum.`);
                                                  refreshData();
                                              }
                                          }}
                                          className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-50 text-red-500 rounded-xl font-black text-[10px] uppercase tracking-widest"
                                      >
                                          <PenTool size={14} /> REMOVER ACESSO
                                      </button>
                                  )}
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
      </div>
      )}

      {view === 'PROFILE' && (
          <div className="bg-white p-6 md:p-12 rounded-[3rem] shadow-xl border border-slate-100 animate-in slide-in-from-bottom-6 space-y-12 relative">
              {isExpired && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 rounded-[3rem] flex items-center justify-center">
                      <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-md border border-slate-100">
                          <Lock className="w-16 h-16 text-red-500 mx-auto mb-4" />
                          <h3 className="text-2xl font-black text-ocean-950 mb-2">Recurso Bloqueado</h3>
                          <p className="text-slate-500 mb-6">Sua assinatura está expirada. Renove para editar sua empresa e galeria.</p>
                          <button onClick={() => setView('MY_PLAN')} className="bg-ocean-600 text-white px-8 py-4 rounded-2xl font-black w-full">RENOVAR AGORA</button>
                      </div>
                  </div>
              )}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <button onClick={() => setView(currentUser.role === UserRole.SUPER_ADMIN ? 'BUSINESSES' : 'HOME')} className="flex items-center gap-2 text-ocean-600 font-black text-xs uppercase">
                    <ChevronLeft size={16} /> Voltar
                  </button>
              </div>

              <form id="profile-form" onSubmit={handleUpdateProfile} className="space-y-12">
                  {editBusiness.status === 'PENDING' && (
                      <div className="bg-amber-50 border border-amber-200 p-6 rounded-3xl mb-8 flex items-start gap-4">
                          <ShieldAlert className="text-amber-600 shrink-0" size={24} />
                          <div>
                              <h4 className="text-amber-900 font-black text-sm uppercase tracking-tight">Empresa em Análise</h4>
                              <p className="text-amber-800/70 text-xs font-medium leading-relaxed">
                                  Sua empresa está sendo analisada por nossa equipe. Ela ficará visível no guia assim que for aprovada. 
                                  Você ainda pode editar as informações abaixo.
                              </p>
                          </div>
                      </div>
                  )}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                      {/* COLUNA ESQUERDA: VISUAL */}
                      <div className="lg:col-span-1 space-y-8">
                          <ImageUpload 
                            label="Imagem de Capa (Ideal: 1200x600px)" 
                            currentImage={editBusiness.coverImage} 
                            onImageSelect={img => setEditBusiness({...editBusiness, coverImage: img})} 
                          />

                          <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Galeria de Fotos (Links das Imagens)</label>
                                  <span className="text-[10px] font-bold text-ocean-600 bg-ocean-50 px-2 py-0.5 rounded-full">
                                      {(editBusiness.gallery || []).length} fotos
                                  </span>
                              </div>
                              
                              <textarea 
                                  className="w-full bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs font-mono font-bold text-ocean-900 focus:ring-2 focus:ring-ocean-500 outline-none transition-all resize-none"
                                  rows={4}
                                  placeholder="Cole aqui os links das imagens da galeria (um por linha)..."
                                  value={(editBusiness.gallery || []).join('\n')}
                                  onChange={e => {
                                      const links = e.target.value.split('\n').filter(link => link.trim() !== '');
                                      setEditBusiness({...editBusiness, gallery: links});
                                  }}
                              />

                              <div className="grid grid-cols-3 gap-3">
                                  {(editBusiness.gallery || []).map((img, idx) => (
                                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group shadow-sm border border-slate-100 bg-slate-50">
                                          <img 
                                              src={img} 
                                              alt={`Galeria ${idx+1}`} 
                                              className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                                              onError={(e) => {
                                                  (e.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=Link+Inválido';
                                              }}
                                          />
                                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                              <button 
                                                  type="button"
                                                  onClick={() => {
                                                      const newGallery = [...(editBusiness.gallery || [])];
                                                      newGallery.splice(idx, 1);
                                                      setEditBusiness({...editBusiness, gallery: newGallery});
                                                  }}
                                                  className="bg-red-500 text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
                                              >
                                                  <Trash2 size={14} />
                                              </button>
                                          </div>
                                          <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[8px] px-1.5 py-0.5 rounded-md font-bold">
                                              #{idx + 1}
                                          </div>
                                      </div>
                                  ))}
                                  <div className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 bg-slate-50/50">
                                      <ImageIcon size={20} className="text-slate-300" />
                                      <span className="text-[8px] font-black text-slate-400 uppercase text-center px-2">Preview Automático</span>
                                  </div>
                              </div>
                              
                              <div className="bg-ocean-50 p-4 rounded-2xl border border-ocean-100">
                                  <p className="text-[10px] text-ocean-700 font-bold leading-relaxed flex items-center gap-2">
                                      <Zap size={14} /> DICA: Cada link colado acima vira uma miniatura instantânea. Use fotos reais para aumentar as vendas!
                                  </p>
                              </div>
                          </div>
                      </div>

                      {/* COLUNA CENTRAL: INFO BÁSICA & CONTATO */}
                      <div className="lg:col-span-2 space-y-10">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="col-span-full">
                                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Nome da Empresa</label>
                                  <input required className="w-full bg-slate-50 p-4 rounded-xl border border-slate-100 font-bold text-lg focus:ring-2 focus:ring-ocean-500 outline-none transition-all" value={editBusiness.name} onChange={e => setEditBusiness({...editBusiness, name: e.target.value})} />
                              </div>

                              <div>
                                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Categoria Principal</label>
                                  <select 
                                    className="w-full bg-slate-50 p-4 rounded-xl border border-slate-100 font-bold text-sm outline-none"
                                    value={editBusiness.category}
                                    onChange={e => setEditBusiness({...editBusiness, category: e.target.value})}
                                  >
                                      {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                                  </select>
                              </div>

                              <div className="space-y-2">
                                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Subcategoria (Opcional)</label>
                                  <div className="flex gap-2">
                                      <select 
                                        className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-100 font-bold text-sm outline-none"
                                        value={editBusiness.subcategory}
                                        onChange={e => setEditBusiness({...editBusiness, subcategory: e.target.value})}
                                        disabled={!editBusiness.category || !categories.find(c => c.name === editBusiness.category)?.subcategories?.length}
                                      >
                                          <option value="">Selecione</option>
                                          {categories.find(c => c.name === editBusiness.category)?.subcategories.map((sub: any) => (
                                              <option key={sub.id || sub.name} value={sub.name || sub}>{sub.name || sub}</option>
                                          ))}
                                      </select>
                                      <input 
                                          type="text"
                                          placeholder="Nova..."
                                          className="w-24 bg-slate-50 p-4 rounded-xl border border-slate-100 font-bold text-[10px] outline-none focus:ring-2 focus:ring-ocean-500"
                                          onKeyDown={async (e) => {
                                              if (e.key === 'Enter') {
                                                  const val = (e.target as HTMLInputElement).value;
                                                  if (val && editBusiness.category) {
                                                      await ensureSubcategory(editBusiness.category, val);
                                                      setEditBusiness({...editBusiness, subcategory: val});
                                                      (e.target as HTMLInputElement).value = '';
                                                      const updatedCats = await getCategories();
                                                      setCategories(updatedCats);
                                                  }
                                              }
                                          }}
                                      />
                                  </div>
                              </div>

                              <div className="col-span-full">
                                  <div className="flex justify-between items-center mb-2">
                                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Descrição / História</label>
                                      <span className={`text-[10px] font-black ${(editBusiness.description?.length || 0) < 1200 ? 'text-amber-500' : 'text-green-500'}`}>
                                          {editBusiness.description?.length || 0} / 1200+ (Mínimo p/ SEO)
                                      </span>
                                  </div>
                                  <textarea 
                                      className="w-full bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed text-sm outline-none focus:ring-2 focus:ring-ocean-500" 
                                      rows={6} 
                                      placeholder="Conte a história do local, use palavras-chave, detalhes para o turista..." 
                                      value={editBusiness.description} 
                                      onChange={e => setEditBusiness({...editBusiness, description: e.target.value})} 
                                  />
                                  <p className="text-[10px] text-slate-400 italic mt-1">Dica: Textos longos e com personalidade atraem mais visualizações e melhoram o ranking.</p>
                              </div>
                          </div>

                              <div className="pt-8 border-t border-slate-100">
                                  <div className="flex justify-between items-center mb-6">
                                      <h3 className="font-black text-ocean-950 text-sm flex items-center gap-2">
                                        <Phone size={18} className="text-ocean-600" /> Contato & Redes Sociais
                                      </h3>
                                      <div className="bg-rose-50 text-rose-700 text-[10px] font-bold px-3 py-1 rounded-full border border-rose-100 flex items-center gap-2">
                                          <ShieldAlert size={12} /> PROIBIDO INVENTAR LINKS! Deixe em branco se não encontrar.
                                      </div>
                                  </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Telefone Fixo</label>
                                      <input className="w-full bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm font-bold" placeholder="(21) 0000-0000" value={editBusiness.phone} onChange={e => setEditBusiness({...editBusiness, phone: e.target.value})} />
                                  </div>
                                  <div>
                                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">WhatsApp (Link Direto)</label>
                                      <div className="relative">
                                          <MessageCircle size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500" />
                                          <input className="w-full bg-slate-50 pl-12 pr-4 py-4 rounded-xl border border-slate-100 text-sm font-bold" placeholder="21999999999" value={editBusiness.whatsapp} onChange={e => setEditBusiness({...editBusiness, whatsapp: e.target.value})} />
                                      </div>
                                  </div>
                                  <div>
                                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Instagram (Usuário)</label>
                                      <div className="relative">
                                          <Instagram size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-500" />
                                          <input className="w-full bg-slate-50 pl-12 pr-4 py-4 rounded-xl border border-slate-100 text-sm font-bold" placeholder="@suaempresa" value={editBusiness.instagram} onChange={e => setEditBusiness({...editBusiness, instagram: e.target.value})} />
                                      </div>
                                  </div>
                                  <div>
                                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Site Oficial</label>
                                      <div className="relative">
                                          <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ocean-500" />
                                          <input className="w-full bg-slate-50 pl-12 pr-4 py-4 rounded-xl border border-slate-100 text-sm font-bold" placeholder="https://seusite.com.br" value={editBusiness.website} onChange={e => setEditBusiness({...editBusiness, website: e.target.value})} />
                                      </div>
                                  </div>
                                  <div>
                                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Link de Delivery (iFood, etc)</label>
                                      <div className="relative">
                                          <ShoppingCart size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500" />
                                          <input className="w-full bg-slate-50 pl-12 pr-4 py-4 rounded-xl border border-slate-100 text-sm font-bold" placeholder="Link do cardápio/delivery" value={editBusiness.deliveryUrl} onChange={e => setEditBusiness({...editBusiness, deliveryUrl: e.target.value})} />
                                      </div>
                                  </div>
                                  <div>
                                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Link de Reserva</label>
                                      <div className="relative">
                                          <CalendarDays size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" />
                                          <input className="w-full bg-slate-50 pl-12 pr-4 py-4 rounded-xl border border-slate-100 text-sm font-bold" placeholder="Link para agendamento" value={editBusiness.bookingUrl} onChange={e => setEditBusiness({...editBusiness, bookingUrl: e.target.value})} />
                                      </div>
                                  </div>
                              </div>
                          </div>

                          <div className="pt-8 border-t border-slate-100">
                              <h3 className="font-black text-ocean-950 text-sm flex items-center gap-2 mb-6">
                                <MapPin size={18} className="text-ocean-600" /> Localização & GPS
                              </h3>
                              <div className="space-y-4">
                                  <div className="h-80 rounded-3xl overflow-hidden border border-slate-100 shadow-inner">
                                    <LocationPicker 
                                        initialLat={editBusiness.lat} 
                                        initialLng={editBusiness.lng} 
                                        onLocationSelect={(lat, lng) => setEditBusiness({...editBusiness, lat, lng})} 
                                    />
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <select 
                                          required
                                          className="w-full bg-slate-50 p-4 rounded-xl border border-slate-100 font-bold text-sm outline-none"
                                          value={editBusiness.cityId || ''}
                                          onChange={e => setEditBusiness({...editBusiness, cityId: e.target.value, neighborhoodId: ''})}
                                      >
                                          <option value="">Selecione a Cidade</option>
                                          {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                      </select>
                                      <select 
                                          required
                                          className="w-full bg-slate-50 p-4 rounded-xl border border-slate-100 font-bold text-sm outline-none"
                                          value={editBusiness.neighborhoodId || ''}
                                          onChange={e => setEditBusiness({...editBusiness, neighborhoodId: e.target.value})}
                                          disabled={!editBusiness.cityId}
                                      >
                                          <option value="">Selecione o Bairro</option>
                                          {neighborhoods.filter(n => n.cityId === editBusiness.cityId).map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                                      </select>
                                  </div>
                                  <input 
                                    required 
                                    className="w-full bg-slate-50 p-4 rounded-xl border border-slate-100 font-bold text-sm" 
                                    placeholder="Endereço Completo (Rua, Número, Bairro, Cidade)" 
                                    value={editBusiness.address} 
                                    onChange={e => setEditBusiness({...editBusiness, address: e.target.value})} 
                                  />
                              </div>
                          </div>

                          <div className="pt-8 border-t border-slate-100">
                              <div className="flex justify-between items-center mb-6">
                                  <h3 className="font-black text-ocean-950 text-sm flex items-center gap-2">
                                    <Clock size={18} className="text-ocean-600" /> Horário de Funcionamento
                                  </h3>
                                  <div className="bg-amber-50 text-amber-700 text-[10px] font-bold px-3 py-1 rounded-full border border-amber-100 flex items-center gap-2">
                                      <Zap size={12} /> BOM SENSO: Se for Praia, Mirante ou Local Público, deixe Aberto!
                                  </div>
                              </div>
                              <BusinessHoursEditor 
                                hours={editBusiness.openingHours || {}} 
                                onChange={newHours => setEditBusiness({ ...editBusiness, openingHours: newHours })} 
                              />
                          </div>

                          <div className="pt-8 border-t border-slate-100">
                              <h3 className="font-black text-ocean-950 text-sm flex items-center gap-2 mb-6">
                                <Check size={18} className="text-ocean-600" /> Comodidades & Diferenciais
                              </h3>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                  {amenitiesList.map(am => {
                                      const isSelected = (editBusiness.amenities || []).includes(am.id);
                                      return (
                                          <button 
                                            key={am.id}
                                            type="button"
                                            onClick={() => {
                                                const current = [...(editBusiness.amenities || [])];
                                                const next = isSelected ? current.filter(x => x !== am.id) : [...current, am.id];
                                                setEditBusiness({...editBusiness, amenities: next});
                                            }}
                                            className={`flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${isSelected ? 'bg-ocean-600 border-ocean-600 text-white shadow-md' : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'}`}
                                          >
                                              <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-slate-300'}`} />
                                              <span className="text-xs font-bold">{am.label}</span>
                                          </button>
                                      );
                                  })}
                                  <div className="flex gap-2 items-center p-2 bg-slate-50 border border-slate-100 rounded-2xl col-span-full">
                                      <input 
                                          className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none"
                                          placeholder="Nova comodidade (Enter para adicionar)..."
                                          onKeyDown={async (e) => {
                                              if (e.key === 'Enter') {
                                                  e.preventDefault();
                                                  const val = e.currentTarget.value.trim();
                                                  if (val) {
                                                      const newId = await saveAmenity(val);
                                                      const newList = await getAmenities();
                                                      setAmenitiesList(newList);
                                                      const current = [...(editBusiness.amenities || [])];
                                                      if (!current.includes(newId)) {
                                                          setEditBusiness({...editBusiness, amenities: [...current, newId]});
                                                      }
                                                      e.currentTarget.value = '';
                                                  }
                                              }
                                          }}
                                      />
                                  </div>
                              </div>
                          </div>

                          <div className="pt-8 border-t border-slate-100 flex justify-end">
                              <button 
                                type="button" 
                                onClick={handleUpdateProfile} 
                                disabled={isSaving} 
                                className="w-full md:w-auto bg-green-600 text-white px-12 py-5 rounded-2xl font-black shadow-lg flex items-center justify-center gap-2 hover:bg-green-700 transition-all text-lg"
                              >
                                  {isSaving ? <Loader2 className="animate-spin" size={24}/> : <Save size={24} />} SALVAR CONFIGURAÇÕES
                              </button>
                          </div>
                      </div>
                  </div>
              </form>
          </div>
      )}

      {view === 'MENU' && (
          <div className="bg-white p-6 md:p-12 rounded-[3rem] shadow-xl border border-slate-100 animate-in slide-in-from-bottom-6 space-y-8 relative">
              {isExpired && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 rounded-[3rem] flex items-center justify-center">
                      <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-md border border-slate-100">
                          <Lock className="w-16 h-16 text-red-500 mx-auto mb-4" />
                          <h3 className="text-2xl font-black text-ocean-950 mb-2">Recurso Bloqueado</h3>
                          <p className="text-slate-500 mb-6">Sua assinatura está expirada. Renove para gerenciar seu cardápio.</p>
                          <button onClick={() => setView('MY_PLAN')} className="bg-ocean-600 text-white px-8 py-4 rounded-2xl font-black w-full">RENOVAR AGORA</button>
                      </div>
                  </div>
              )}
              <div className="flex justify-between items-center">
                  <button onClick={() => setView('HOME')} className="flex items-center gap-2 text-ocean-600 font-black text-xs uppercase">
                    <ChevronLeft size={16} /> Voltar
                  </button>
                  <button onClick={handleUpdateProfile} disabled={isSaving} className="bg-ocean-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2">
                      {isSaving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} />} SALVAR CARDÁPIO
                  </button>
              </div>

              <div className="space-y-10">
                  <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-black text-ocean-950">Gestão de Cardápio</h2>
                    <button onClick={handleAddMenuSection} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2">
                        <Plus size={16} /> NOVA SEÇÃO
                    </button>
                  </div>

                  {editBusiness.menu?.map((section, sIdx) => (
                      <div key={sIdx} className="space-y-4 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                          <div className="flex justify-between items-center">
                              <input 
                                className="bg-transparent text-xl font-black text-ocean-950 focus:outline-none border-b-2 border-transparent focus:border-ocean-300 w-full"
                                value={section.title}
                                onChange={e => {
                                    const newMenu = [...(editBusiness.menu || [])];
                                    newMenu[sIdx].title = e.target.value;
                                    setEditBusiness({ ...editBusiness, menu: newMenu });
                                }}
                              />
                              <button onClick={() => handleAddMenuItem(sIdx)} className="bg-ocean-100 text-ocean-600 p-2 rounded-lg ml-4">
                                  <Plus size={20} />
                              </button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {section.items.map((item, iIdx) => (
                                  <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex gap-4">
                                      <div className="flex-1 space-y-2">
                                          <div className="flex justify-between">
                                            <input 
                                                className="font-bold text-sm text-ocean-950 bg-transparent focus:outline-none w-full"
                                                value={item.name}
                                                onChange={e => {
                                                    const newMenu = [...(editBusiness.menu || [])];
                                                    newMenu[sIdx].items[iIdx].name = e.target.value;
                                                    setEditBusiness({ ...editBusiness, menu: newMenu });
                                                }}
                                            />
                                            <input 
                                                type="number"
                                                className="font-black text-green-600 bg-transparent focus:outline-none text-right w-20"
                                                value={item.price}
                                                onChange={e => {
                                                    const newMenu = [...(editBusiness.menu || [])];
                                                    newMenu[sIdx].items[iIdx].price = Number(e.target.value);
                                                    setEditBusiness({ ...editBusiness, menu: newMenu });
                                                }}
                                            />
                                          </div>
                                          <input 
                                            className="text-xs text-slate-400 bg-transparent focus:outline-none w-full"
                                            placeholder="Descrição curta..."
                                            value={item.description}
                                            onChange={e => {
                                                const newMenu = [...(editBusiness.menu || [])];
                                                newMenu[sIdx].items[iIdx].description = e.target.value;
                                                setEditBusiness({ ...editBusiness, menu: newMenu });
                                            }}
                                          />
                                      </div>
                                      <button onClick={() => handleDeleteMenuItem(sIdx, iIdx)} className="text-red-300 hover:text-red-500">
                                          <Trash2 size={16} />
                                      </button>
                                  </div>
                              ))}
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {view === 'CREATE_COUPON' && (
          <div className="bg-white p-6 md:p-12 rounded-[3rem] shadow-xl border border-slate-100 animate-in slide-in-from-bottom-6 space-y-10 relative">
              {isExpired && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 rounded-[3rem] flex items-center justify-center">
                      <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-md border border-slate-100">
                          <Lock className="w-16 h-16 text-red-500 mx-auto mb-4" />
                          <h3 className="text-2xl font-black text-ocean-950 mb-2">Recurso Bloqueado</h3>
                          <p className="text-slate-500 mb-6">Sua assinatura está expirada. Renove para criar novos cupons.</p>
                          <button onClick={() => setView('MY_PLAN')} className="bg-ocean-600 text-white px-8 py-4 rounded-2xl font-black w-full">RENOVAR AGORA</button>
                      </div>
                  </div>
              )}
              <div className="flex justify-between items-center">
                  <button onClick={() => setView('HOME')} className="flex items-center gap-2 text-ocean-600 font-black text-xs uppercase">
                    <ChevronLeft size={16} /> Voltar ao Painel
                  </button>
                  <h2 className="text-3xl font-black text-ocean-950 hidden md:block">Lançar Nova Oferta</h2>
              </div>

              <form onSubmit={async (e) => { 
                  e.preventDefault(); 
                  if (!newCoupon.imageUrl) {
                      notify('warning', "Por favor, adicione uma imagem para a oferta.");
                      return;
                  }
                  setIsSaving(true); 
                  const couponData = {
                      ...newCoupon, 
                      id: `c_${Date.now()}`, 
                      companyId: newCoupon.companyId || currentUser.id, 
                      companyName: newCoupon.companyName || renderName(),
                      companyLogo: myBusiness?.coverImage,
                      discountPercentage: Math.round(((newCoupon.originalPrice! - newCoupon.discountedPrice!) / newCoupon.originalPrice!) * 100),
                      code: `CR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
                      active: true,
                      status: 'pending' // Always start as pending
                  } as Coupon;
                  await saveCoupon(couponData); 
                  setView('HOME'); 
                  refreshData(); 
                  setIsSaving(false); 
                  notify('success', 'Cupom enviado para aprovação do administrador!');
              }} className="space-y-12">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                      <div className="space-y-8">
                          <ImageUpload label="Foto da Oferta (Chamativa)" onImageSelect={img => setNewCoupon({...newCoupon, imageUrl: img})} />
                          
                          <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 space-y-6">
                              <h3 className="text-sm font-black text-ocean-950 uppercase tracking-widest flex items-center gap-2">
                                  <DollarSign size={18} className="text-green-600" /> Valores & Desconto
                              </h3>
                              <div className="grid grid-cols-2 gap-6">
                                  <div>
                                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Preço Original</label>
                                      <div className="relative">
                                          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">R$</span>
                                          <input type="number" required className="w-full bg-white pl-12 pr-4 py-4 rounded-xl border border-slate-200 font-bold" placeholder="0.00" value={newCoupon.originalPrice} onChange={e => setNewCoupon({...newCoupon, originalPrice: Number(e.target.value)})} />
                                      </div>
                                  </div>
                                  <div>
                                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Preço com Desconto</label>
                                      <div className="relative">
                                          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-green-600">R$</span>
                                          <input type="number" required className="w-full bg-white pl-12 pr-4 py-4 rounded-xl border border-green-200 text-green-600 font-black" placeholder="0.00" value={newCoupon.discountedPrice} onChange={e => setNewCoupon({...newCoupon, discountedPrice: Number(e.target.value)})} />
                                      </div>
                                  </div>
                              </div>
                              {newCoupon.originalPrice! > 0 && newCoupon.discountedPrice! > 0 && (
                                  <div className="bg-green-100 text-green-700 p-4 rounded-xl text-center font-black text-xs uppercase tracking-widest">
                                      Economia de {Math.round(((newCoupon.originalPrice! - newCoupon.discountedPrice!) / newCoupon.originalPrice!) * 100)}% para o cliente
                                  </div>
                              )}
                          </div>
                      </div>

                      <div className="space-y-8">
                          <div className="space-y-4">
                              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Informações da Oferta</label>
                              <input required className="w-full bg-slate-50 p-5 rounded-2xl border border-slate-100 font-black text-lg focus:ring-2 focus:ring-ocean-500 outline-none" placeholder="Título da Oferta (Ex: 50% de Desconto no Rodízio)" value={newCoupon.title} onChange={e => setNewCoupon({...newCoupon, title: e.target.value})} />
                              <textarea required className="w-full bg-slate-50 p-5 rounded-2xl border border-slate-100 text-sm leading-relaxed outline-none" rows={3} placeholder="Descreva o que está incluído nesta oferta..." value={newCoupon.description} onChange={e => setNewCoupon({...newCoupon, description: e.target.value})} />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Data de Expiração</label>
                                  <input type="date" required className="w-full bg-slate-50 p-4 rounded-xl border border-slate-100 font-bold text-sm" value={newCoupon.expiryDate} onChange={e => setNewCoupon({...newCoupon, expiryDate: e.target.value})} />
                              </div>
                              <div>
                                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Limite de Resgates</label>
                                  <input type="number" className="w-full bg-slate-50 p-4 rounded-xl border border-slate-100 font-bold text-sm" value={newCoupon.maxRedemptions} onChange={e => setNewCoupon({...newCoupon, maxRedemptions: Number(e.target.value)})} />
                              </div>
                          </div>

                          <div className="space-y-4">
                              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Regras & Condições</label>
                              <textarea 
                                className="w-full bg-slate-50 p-5 rounded-2xl border border-slate-100 text-xs leading-relaxed outline-none" 
                                rows={4} 
                                placeholder="Uma regra por linha. Ex:&#10;Válido apenas de segunda a quinta&#10;Não cumulativo com outras promoções&#10;Necessário reserva prévia" 
                                value={newCoupon.rules?.join('\n')} 
                                onChange={e => setNewCoupon({...newCoupon, rules: e.target.value.split('\n').filter(r => r.trim() !== '')})} 
                              />
                          </div>

                          <div className="bg-ocean-50 p-6 rounded-2xl border border-ocean-100 space-y-3">
                              <h4 className="text-[10px] font-black text-ocean-700 uppercase tracking-widest flex items-center gap-2">
                                  <ShieldCheck size={14} /> Regras da Plataforma
                              </h4>
                              <ul className="text-[10px] text-ocean-600/80 font-bold space-y-2 list-disc pl-4">
                                  <li>O desconto real deve ser de no mínimo 10%.</li>
                                  <li>A imagem deve ser de alta qualidade e representar o produto real.</li>
                                  <li>O estabelecimento deve honrar o cupom durante todo o período de validade.</li>
                                  <li>Cupons abusivos ou enganosos serão removidos e a conta poderá ser suspensa.</li>
                                  <li>Todo cupom requer aprovação manual da nossa equipe antes de ficar ativo.</li>
                              </ul>
                          </div>
                      </div>
                  </div>

                  <button type="submit" disabled={isSaving} className="w-full bg-ocean-600 text-white font-black py-8 rounded-[2rem] shadow-2xl shadow-ocean-600/30 flex items-center justify-center gap-4 text-xl hover:bg-ocean-700 active:scale-[0.98] transition-all">
                      {isSaving ? <Loader2 className="animate-spin" size={28} /> : <CheckCircle2 size={28} />} PUBLICAR OFERTA EM LAGOS
                  </button>
              </form>
          </div>
      )}

      {view === 'CATEGORIES' && (
        <div className="bg-white p-6 md:p-12 rounded-[3rem] shadow-xl border border-slate-100 animate-in slide-in-from-bottom-6 space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black text-ocean-950">Gerenciar Subcategorias</h2>
                <button onClick={() => setView('HOME')} className="flex items-center gap-2 text-ocean-600 font-black text-xs uppercase">
                    <ChevronLeft size={16} /> Voltar
                </button>
            </div>

            <div className="space-y-6">
                {categories.map(category => (
                    <div key={category.id} className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <h3 className="font-bold text-ocean-900 mb-4">{category.name}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                            {(category.subcategories || []).map((sub: any) => (
                                <div key={sub.id || sub} className="flex items-center justify-between bg-white p-2 rounded-lg text-xs font-bold text-slate-600 border">
                                    <span>{sub.name || sub}</span>
                                    <button onClick={() => handleDeleteSubcategory(category.id, sub.id || sub)} className="text-red-400 hover:text-red-600 p-1">
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input 
                                className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none"
                                placeholder="Nova subcategoria..."
                                value={newSubcategory[category.id] || ''}
                                onChange={e => setNewSubcategory({ ...newSubcategory, [category.id]: e.target.value })}
                            />
                            <button onClick={() => handleAddSubcategory(category.id)} className="bg-ocean-500 text-white px-4 py-2 rounded-lg text-xs font-black">
                                Adicionar
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {view === 'BUSINESSES' && (
        <div className="bg-white p-6 md:p-12 rounded-[3rem] shadow-xl border border-slate-100 animate-in slide-in-from-bottom-6 space-y-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
                <h2 className="text-3xl font-black text-ocean-950">Gestão de Empresas</h2>
                <button 
                    onClick={() => setView('CREATE_PLACE')}
                    className="bg-gold-500 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase shadow-lg shadow-gold-500/20 hover:bg-gold-600 transition-all flex items-center gap-2"
                >
                    <Plus size={16} /> CADASTRAR LUGAR
                </button>
            </div>
            <button onClick={() => setView('HOME')} className="flex items-center gap-2 text-ocean-600 font-black text-xs uppercase">
                <ChevronLeft size={16} /> Voltar
            </button>
          </div>

          <div className="space-y-4">
            {allBusinesses.length === 0 ? (
              <p className="text-slate-500 text-center py-10">Nenhuma empresa cadastrada.</p>
            ) : (
              allBusinesses.map(biz => {
                const owner = users.find(u => u.id === biz.id);
                return (
                  <div key={biz.id} className={`p-6 rounded-[2rem] border transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${biz.isBlocked ? 'bg-red-50 border-red-100 opacity-80' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex items-center gap-4 flex-1">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-200 shrink-0">
                            {biz.coverImage && <img src={biz.coverImage} className="w-full h-full object-cover" />}
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <h3 className="font-black text-lg text-ocean-950 flex items-center gap-2">
                                    {biz.name}
                                    {biz.deliveryUrl && (
                                        <span title="Delivery Disponível" className="bg-ocean-100 text-ocean-600 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0">
                                            Tem Entrega
                                        </span>
                                    )}
                                </h3>
                                {biz.isBlocked && <span className="bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Inativa</span>}
                                {biz.status === 'PENDING' && (
                                    <span className="bg-amber-100 text-amber-600 text-[10px] font-black px-3 py-1 rounded-full uppercase flex items-center gap-1 animate-pulse">
                                        <ShieldAlert size={12} /> Pendente
                                    </span>
                                )}
                                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${
                                    biz.plan === 'premium' ? 'bg-purple-100 text-purple-600' :
                                    biz.plan === 'pro' ? 'bg-ocean-100 text-ocean-600' :
                                    'bg-slate-100 text-slate-500'
                                }`}>
                                    Plano {biz.plan?.toUpperCase() || 'FREE'}
                                </span>
                                {biz.isClaimed && (
                                    <span className="bg-emerald-100 text-emerald-600 text-[10px] font-black px-3 py-1 rounded-full uppercase">
                                        Reivindicada
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{biz.category}</p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                <p className="text-[10px] text-slate-400 flex items-center gap-1 font-bold"><Mail size={12} /> {owner?.email || 'Email não vinculado'}</p>
                                <p className="text-[10px] text-slate-400 flex items-center gap-1 font-bold"><Phone size={12} /> {biz.phone}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex gap-2 w-full md:w-auto">
                        <button 
                            onClick={() => {
                                setEditBusiness(biz);
                                setView('PROFILE');
                            }}
                            className="flex-1 md:flex-none bg-ocean-600 text-white px-4 py-3 rounded-xl font-black text-[10px] flex items-center justify-center gap-2 hover:bg-ocean-700 transition-all shadow-lg shadow-ocean-600/20"
                        >
                            <PenTool size={16} /> EDITAR
                        </button>

                        <button 
                            onClick={async () => {
                                if (await confirm({ title: 'Alterar Status', message: `Deseja ${biz.isBlocked ? 'ativar' : 'inativar'} esta empresa e seu usuário?` })) {
                                    await toggleBusinessStatus(biz.id, !biz.isBlocked);
                                    refreshData();
                                }
                            }}
                            className={`flex-1 md:flex-none px-4 py-3 rounded-xl font-black text-[10px] flex items-center justify-center gap-2 transition-all ${biz.isBlocked ? 'bg-green-500 text-white' : 'bg-amber-100 text-amber-600 hover:bg-amber-200'}`}
                        >
                            {biz.isBlocked ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
                            {biz.isBlocked ? 'ATIVAR' : 'INATIVAR'}
                        </button>

                        {biz.status === 'PENDING' && (
                            <button 
                                onClick={async () => {
                                    if (await confirm({ title: 'Aprovar Empresa', message: `Deseja aprovar a empresa "${biz.name}"?` })) {
                                        const { approveBusiness } = await import('../services/dataService');
                                        await approveBusiness(biz.id);
                                        notify('success', `Empresa "${biz.name}" aprovada!`);
                                        refreshData();
                                    }
                                }}
                                className="flex-1 md:flex-none bg-emerald-500 text-white px-4 py-3 rounded-xl font-black text-[10px] flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                            >
                                <CheckCircle2 size={16} /> APROVAR
                            </button>
                        )}

                        <button 
                            onClick={async () => {
                                if (await confirm({ title: 'Alterar Reivindicação', message: `Deseja ${biz.canBeClaimed ? 'desativar' : 'ativar'} a possibilidade de reivindicação para este lugar?` })) {
                                    await updateClaimableStatus(biz.id, !biz.canBeClaimed);
                                    refreshData();
                                }
                            }}
                            className={`flex-1 md:flex-none px-4 py-3 rounded-xl font-black text-[10px] flex items-center justify-center gap-2 transition-all ${biz.canBeClaimed ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' : 'bg-slate-200 text-slate-500 hover:bg-slate-300'}`}
                        >
                            <CheckCircle2 size={16} />
                            {biz.canBeClaimed ? 'REIVINDICÁVEL' : 'NÃO REIVINDICÁVEL'}
                        </button>

                        <div className="flex-1 md:flex-none flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-xl">
                            <span className="text-[9px] font-black text-slate-400 uppercase">Plano:</span>
                            <select 
                                className="bg-transparent text-[10px] font-black text-ocean-600 outline-none cursor-pointer"
                                value={biz.plan || ''}
                                onChange={async (e) => {
                                    const newPlanId = e.target.value;
                                    if (await confirm({ title: 'Alterar Plano', message: `Deseja alterar o plano de "${biz.name}" para "${newPlanId}"?` })) {
                                        await updateBusinessPlan(biz.id, newPlanId);
                                        refreshData();
                                    }
                                }}
                            >
                                <option value="">Sem Plano</option>
                                {plans.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        <button 
                            onClick={() => setPasswordPrompt({ businessId: biz.id, businessName: biz.name })}
                            className="flex-1 md:flex-none bg-white border border-ocean-100 text-ocean-600 px-4 py-3 rounded-xl font-black text-[10px] flex items-center justify-center gap-2 hover:bg-ocean-50 transition-all"
                        >
                            <Key size={16} /> SENHA
                        </button>
                        
                        <button 
                            onClick={async () => {
                                if (await confirm({ title: 'EXCLUSÃO PERMANENTE', message: "ATENÇÃO: Esta ação é permanente e excluirá a empresa, o usuário e todos os seus cupons. Deseja continuar?" })) {
                                    await deleteBusiness(biz.id);
                                    refreshData();
                                }
                            }}
                            className="flex-1 md:flex-none bg-white border border-red-100 text-red-500 px-4 py-3 rounded-xl font-black text-[10px] flex items-center justify-center gap-2 hover:bg-red-50 transition-all"
                        >
                            <UserX size={16} /> EXCLUIR
                        </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {passwordPrompt && (
        <div className="fixed inset-0 bg-ocean-950/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-ocean-950">Nova Senha Manual</h3>
              <button onClick={() => { setPasswordPrompt(null); setManualPass(''); }} className="text-slate-400 hover:text-ocean-600">
                <X size={24} />
              </button>
            </div>
            <p className="text-xs text-slate-500 font-bold">
              Definir nova senha para <span className="text-ocean-600">{passwordPrompt.businessName}</span>
            </p>
            <div className="space-y-4">
              <input 
                type="text"
                autoFocus
                className="w-full bg-slate-50 p-4 rounded-xl border border-slate-100 font-bold text-sm outline-none focus:ring-2 focus:ring-ocean-500" 
                placeholder="Digite a nova senha..." 
                value={manualPass} 
                onChange={e => setManualPass(e.target.value)} 
              />
              <div className="flex gap-4">
                <button 
                  type="button" 
                  onClick={() => { setPasswordPrompt(null); setManualPass(''); }} 
                  className="flex-1 px-6 py-4 rounded-2xl font-black text-xs text-slate-500 bg-slate-100"
                >
                  CANCELAR
                </button>
                <button 
                  type="button"
                  disabled={!manualPass || isSaving}
                  onClick={async () => {
                    setIsSaving(true);
                    try {
                      await setManualPassword(passwordPrompt.businessId, manualPass);
                      notify('success', "Senha manual definida com sucesso!");
                      setPasswordPrompt(null);
                      setManualPass('');
                    } catch (err) {
                      notify('error', "Erro ao definir senha.");
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  className="flex-1 px-6 py-4 rounded-2xl font-black text-xs text-white bg-ocean-600 shadow-lg shadow-ocean-600/20 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="animate-spin mx-auto" size={18} /> : "DEFINIR SENHA"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {view === 'REQUESTS' && (
        <div className="bg-white p-6 md:p-12 rounded-[3rem] shadow-xl border border-slate-100 animate-in slide-in-from-bottom-6 space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-black text-ocean-950">Solicitações & Aprovações</h2>
            <button onClick={() => setView('HOME')} className="flex items-center gap-2 text-ocean-600 font-black text-xs uppercase">
                <ChevronLeft size={16} /> Voltar
            </button>
          </div>
          
          <div className="space-y-4">
            {requests.length === 0 && allBusinesses.filter(b => b.status === 'PENDING').length === 0 ? (
              <div className="text-center py-20 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                <Layers size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500 font-bold">Nenhuma solicitação pendente no momento.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Seção de Empresas Pendentes (Novos Cadastros) */}
                {allBusinesses.filter(b => b.status === 'PENDING').map(biz => {
                  const planInfo = plans.find(p => p.id === biz.plan);
                  return (
                    <div key={biz.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-md transition-all shadow-sm">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="font-black text-xl text-ocean-950">{biz.name}</h3>
                            <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-ocean-100 text-ocean-600 flex items-center gap-1">
                                <Zap size={10} /> Empresa ({planInfo?.name || biz.plan || 'Free'})
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                            <p className="text-sm text-slate-600 flex items-center gap-2"><Mail size={14} className="text-slate-400" /> {biz.email}</p>
                            <p className="text-sm text-slate-600 flex items-center gap-2"><Phone size={14} className="text-slate-400" /> {biz.phone}</p>
                            <p className="text-sm text-slate-600 flex items-center gap-2"><MapPin size={14} className="text-slate-400" /> {biz.address}</p>
                            <p className="text-sm text-slate-600 flex items-center gap-2"><CalendarDays size={14} className="text-slate-400" /> Cadastro Direto</p>
                        </div>
                      </div>
                      <div className="flex gap-3 w-full md:w-auto">
                        <button 
                            onClick={async () => {
                                if (await confirm({ title: 'Aprovar Empresa', message: `Deseja aprovar a empresa "${biz.name}"?` })) {
                                    const { approveBusiness } = await import('../services/dataService');
                                    await approveBusiness(biz.id);
                                    notify('success', `Empresa "${biz.name}" aprovada!`);
                                    refreshData();
                                }
                            }}
                            className="flex-1 md:flex-none bg-green-500 hover:bg-green-600 text-white px-6 py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 transition-all"
                        >
                          <Check size={18} /> APROVAR
                        </button>
                        <button 
                            onClick={async () => {
                                if (await confirm({ title: 'Rejeitar Empresa', message: `Deseja rejeitar e excluir o cadastro de "${biz.name}"?` })) {
                                    const { deleteBusiness } = await import('../services/dataService');
                                    await deleteBusiness(biz.id);
                                    notify('success', "Cadastro rejeitado e removido.");
                                    refreshData();
                                }
                            }}
                            className="flex-1 md:flex-none bg-white border border-red-100 text-red-500 px-6 py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-red-50 transition-all"
                        >
                          <X size={18} /> REJEITAR
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Seção de Leads e Reivindicações */}
                {requests.map(req => (
                  <div key={req.id} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-md transition-all">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-black text-xl text-ocean-950">{req.companyName}</h3>
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${req.type === 'CLAIM' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                              {req.type === 'CLAIM' ? 'Reivindicação' : 'Novo Lead'}
                          </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                          <p className="text-sm text-slate-600 flex items-center gap-2"><UserIcon size={14} className="text-slate-400" /> {req.ownerName}</p>
                          <p className="text-sm text-slate-600 flex items-center gap-2"><Mail size={14} className="text-slate-400" /> {req.email}</p>
                          <p className="text-sm text-slate-600 flex items-center gap-2"><Phone size={14} className="text-slate-400" /> {req.phone}</p>
                          <p className="text-sm text-slate-600 flex items-center gap-2"><CalendarDays size={14} className="text-slate-400" /> {new Date(req.requestDate).toLocaleDateString('pt-BR')}</p>
                      </div>
                      {req.description && (
                          <p className="text-xs text-slate-400 mt-2 bg-white p-3 rounded-xl border border-slate-100 italic">&quot;{req.description}&quot;</p>
                      )}
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                      <button 
                          onClick={() => handleApprove(req.id)} 
                          className="flex-1 md:flex-none bg-green-500 hover:bg-green-600 text-white px-6 py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 transition-all"
                      >
                        <Check size={18} /> APROVAR
                      </button>
                      <button 
                          onClick={() => handleReject(req.id)} 
                          className="flex-1 md:flex-none bg-white border border-red-100 text-red-500 px-6 py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-red-50 transition-all"
                      >
                        <X size={18} /> REJEITAR
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {view === 'CREATE_PLACE' && (
        <div className="bg-white p-6 md:p-12 rounded-[3rem] shadow-xl border border-slate-100 animate-in slide-in-from-bottom-6 space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black text-ocean-950">Cadastrar Novo Lugar</h2>
                <button onClick={() => setView('BUSINESSES')} className="flex items-center gap-2 text-ocean-600 font-black text-xs uppercase">
                    <ChevronLeft size={16} /> Voltar
                </button>
            </div>

            <form onSubmit={handleCreatePlace} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Nome do Lugar / Empresa</label>
                            <input 
                                required 
                                className="w-full bg-slate-50 p-4 rounded-xl border border-slate-100 font-bold text-lg outline-none" 
                                value={newPlace.name} 
                                onChange={e => setNewPlace({...newPlace, name: e.target.value})} 
                                placeholder="Ex: Praia de Sepetiba, Teatro Municipal..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Categoria</label>
                                <select 
                                    className="w-full bg-slate-50 p-4 rounded-xl border border-slate-100 font-bold text-sm outline-none"
                                    value={newPlace.category}
                                    onChange={e => setNewPlace({...newPlace, category: e.target.value})}
                                >
                                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Plano Inicial</label>
                                <select 
                                    className="w-full bg-slate-50 p-4 rounded-xl border border-slate-100 font-bold text-sm outline-none"
                                    value={newPlace.plan || ''}
                                    onChange={e => {
                                        const planId = e.target.value;
                                        const plan = plans.find(p => p.id === planId);
                                        setNewPlace({
                                            ...newPlace, 
                                            plan: planId,
                                            isFeatured: plan ? plan.isFeatured : false
                                        });
                                    }}
                                >
                                    <option value="">Sem Plano</option>
                                    {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Permitir Reivindicação?</label>
                                <select 
                                    className="w-full bg-slate-50 p-4 rounded-xl border border-slate-100 font-bold text-sm outline-none"
                                    value={newPlace.canBeClaimed ? 'true' : 'false'}
                                    onChange={e => setNewPlace({...newPlace, canBeClaimed: e.target.value === 'true'})}
                                >
                                    <option value="true">Sim (Empresas podem pedir acesso)</option>
                                    <option value="false">Não (Lugar público / Admin apenas)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Descrição Curta</label>
                            <textarea 
                                required
                                rows={4}
                                className="w-full bg-slate-50 p-4 rounded-xl border border-slate-100 font-bold text-sm outline-none" 
                                value={newPlace.description} 
                                onChange={e => setNewPlace({...newPlace, description: e.target.value})}
                                placeholder="Descreva brevemente o local..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Endereço / Localização</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <select 
                                    required
                                    className="w-full bg-slate-50 p-4 rounded-xl border border-slate-100 font-bold text-sm outline-none"
                                    value={newPlace.cityId || ''}
                                    onChange={e => setNewPlace({...newPlace, cityId: e.target.value, neighborhoodId: ''})}
                                >
                                    <option value="">Selecione a Cidade</option>
                                    {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <select 
                                    required
                                    className="w-full bg-slate-50 p-4 rounded-xl border border-slate-100 font-bold text-sm outline-none"
                                    value={newPlace.neighborhoodId || ''}
                                    onChange={e => setNewPlace({...newPlace, neighborhoodId: e.target.value})}
                                    disabled={!newPlace.cityId}
                                >
                                    <option value="">Selecione o Bairro</option>
                                    {neighborhoods.filter(n => n.cityId === newPlace.cityId).map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                                </select>
                            </div>
                            <input 
                                required
                                className="w-full bg-slate-50 p-4 rounded-xl border border-slate-100 font-bold text-sm outline-none" 
                                value={newPlace.address} 
                                onChange={e => setNewPlace({...newPlace, address: e.target.value})}
                                placeholder="Rua, Número, Bairro..."
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <ImageUpload 
                            label="Foto de Capa"
                            currentImage={newPlace.coverImage}
                            onImageSelect={img => setNewPlace({...newPlace, coverImage: img})}
                        />

                        <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                            <h4 className="text-amber-700 font-black text-xs uppercase mb-2 flex items-center gap-2">
                                <ShieldAlert size={16} /> Nota para o Admin
                            </h4>
                            <p className="text-amber-600 text-[10px] font-bold leading-relaxed">
                                Você está cadastrando um lugar diretamente no guia. Se você marcar como &quot;Reivindicável&quot;, empresas que se identificarem como donas deste local poderão solicitar acesso através do botão &quot;Reivindicar Empresa&quot; na página de detalhes.
                            </p>
                        </div>
                    </div>
                </div>
                <button type="submit" className="w-full bg-ocean-600 hover:bg-ocean-700 text-white p-4 rounded-2xl font-black text-sm transition-all shadow-lg shadow-ocean-600/20">
                    CADASTRAR LUGAR
                </button>
            </form>
        </div>
      )}


      {view === 'PLANS' && (
        <div className="bg-white p-6 md:p-12 rounded-[3rem] shadow-xl border border-slate-100 animate-in slide-in-from-bottom-6 space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black text-ocean-950">Gerenciar Planos</h2>
                <button onClick={() => setView('HOME')} className="flex items-center gap-2 text-ocean-600 font-black text-xs uppercase">
                    <ChevronLeft size={16} /> Voltar
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 h-fit">
                    <h3 className="text-xl font-black text-ocean-950 mb-6">Criar Novo Plano</h3>
                    <form onSubmit={handleSavePlan} className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nome do Plano</label>
                            <input 
                                required 
                                className="w-full bg-white p-4 rounded-xl border border-slate-100 font-bold text-sm outline-none" 
                                value={newPlan.name} 
                                onChange={e => setNewPlan({...newPlan, name: e.target.value})} 
                                placeholder="Ex: Plano Premium"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Preço (R$)</label>
                                <input 
                                    type="number"
                                    required 
                                    className="w-full bg-white p-4 rounded-xl border border-slate-100 font-bold text-sm outline-none" 
                                    value={newPlan.price} 
                                    onChange={e => setNewPlan({...newPlan, price: Number(e.target.value)})} 
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Período</label>
                                <select 
                                    className="w-full bg-white p-4 rounded-xl border border-slate-100 font-bold text-sm outline-none"
                                    value={newPlan.period}
                                    onChange={e => setNewPlan({...newPlan, period: e.target.value as any})}
                                >
                                    <option value="monthly">Mensal</option>
                                    <option value="yearly">Anual</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4 bg-white p-6 rounded-2xl border border-slate-100">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Recursos e Limites</h4>
                            
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-600">Max. Cupons</span>
                                <input 
                                    type="number"
                                    className="w-16 bg-slate-50 p-2 rounded-lg border border-slate-100 font-bold text-xs text-center"
                                    value={newPlan.maxCoupons}
                                    onChange={e => setNewPlan({...newPlan, maxCoupons: Number(e.target.value)})}
                                />
                            </div>

                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input 
                                    type="checkbox" 
                                    className="w-5 h-5 rounded-lg border-slate-200 text-ocean-600 focus:ring-ocean-500"
                                    checked={newPlan.isFeatured}
                                    onChange={e => setNewPlan({...newPlan, isFeatured: e.target.checked})}
                                />
                                <span className="text-xs font-bold text-slate-600 group-hover:text-ocean-600 transition-colors">Plano Popular (Destaque no Site)</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input 
                                    type="checkbox" 
                                    className="w-5 h-5 rounded-lg border-slate-200 text-ocean-600 focus:ring-ocean-500"
                                    checked={newPlan.showGallery}
                                    onChange={e => setNewPlan({...newPlan, showGallery: e.target.checked})}
                                />
                                <span className="text-xs font-bold text-slate-600 group-hover:text-ocean-600 transition-colors">Exibir Galeria</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input 
                                    type="checkbox" 
                                    className="w-5 h-5 rounded-lg border-slate-200 text-ocean-600 focus:ring-ocean-500"
                                    checked={newPlan.showMenu}
                                    onChange={e => setNewPlan({...newPlan, showMenu: e.target.checked})}
                                />
                                <span className="text-xs font-bold text-slate-600 group-hover:text-ocean-600 transition-colors">Exibir Cardápio</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input 
                                    type="checkbox" 
                                    className="w-5 h-5 rounded-lg border-slate-200 text-ocean-600 focus:ring-ocean-500"
                                    checked={newPlan.showSocialMedia}
                                    onChange={e => setNewPlan({...newPlan, showSocialMedia: e.target.checked})}
                                />
                                <span className="text-xs font-bold text-slate-600 group-hover:text-ocean-600 transition-colors">Exibir Redes Sociais</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input 
                                    type="checkbox" 
                                    className="w-5 h-5 rounded-lg border-slate-200 text-ocean-600 focus:ring-ocean-500"
                                    checked={newPlan.showReviews}
                                    onChange={e => setNewPlan({...newPlan, showReviews: e.target.checked})}
                                />
                                <span className="text-xs font-bold text-slate-600 group-hover:text-ocean-600 transition-colors">Exibir Avaliações</span>
                            </label>

                            <div className="pt-4 border-t border-slate-100">
                                <label className="flex items-center gap-3 cursor-pointer group mb-3">
                                    <input 
                                        type="checkbox" 
                                        className="w-5 h-5 rounded-lg border-slate-200 text-ocean-600 focus:ring-ocean-500"
                                        checked={newPlan.hasFreeTrial}
                                        onChange={e => setNewPlan({...newPlan, hasFreeTrial: e.target.checked})}
                                    />
                                    <span className="text-xs font-bold text-slate-600 group-hover:text-ocean-600 transition-colors">Oferecer Período de Teste Grátis</span>
                                </label>
                                
                                {newPlan.hasFreeTrial && (
                                    <div className="flex items-center justify-between pl-8">
                                        <span className="text-xs font-bold text-slate-600">Dias de Teste</span>
                                        <input 
                                            type="number"
                                            className="w-20 bg-slate-50 p-2 rounded-lg border border-slate-100 font-bold text-xs text-center"
                                            value={newPlan.trialDays}
                                            onChange={e => setNewPlan({...newPlan, trialDays: Number(e.target.value)})}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isSaving}
                            className="w-full bg-ocean-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-ocean-600/20 hover:bg-ocean-700 transition-all flex justify-center items-center gap-2"
                        >
                            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />} SALVAR PLANO
                        </button>
                    </form>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-xl font-black text-ocean-950">Planos Ativos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {plans.length === 0 ? (
                            <p className="text-slate-400 text-sm italic col-span-2">Nenhum plano cadastrado.</p>
                        ) : (
                            plans.map(plan => (
                                <div key={plan.id} className={`p-8 rounded-[2.5rem] border transition-all relative group ${plan.isFeatured ? 'bg-ocean-50 border-ocean-100' : 'bg-white border-slate-100'}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="text-xl font-black text-ocean-950">{plan.name}</h4>
                                            <p className="text-ocean-600 font-bold">R$ {plan.price} <span className="text-[10px] text-slate-400">/{plan.period === 'monthly' ? 'mês' : 'ano'}</span></p>
                                        </div>
                                        <button 
                                            onClick={() => handleDeletePlan(plan.id)}
                                            className="w-10 h-10 bg-white text-red-500 rounded-xl flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    <div className="space-y-2 mb-6">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                                            <Check size={12} className="text-green-500" /> Max. {plan.maxCoupons} cupons
                                        </div>
                                        {plan.isFeatured && <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500"><Check size={12} className="text-green-500" /> Destaque nas buscas</div>}
                                        {plan.showGallery && <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500"><Check size={12} className="text-green-500" /> Galeria de fotos</div>}
                                        {plan.showMenu && <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500"><Check size={12} className="text-green-500" /> Cardápio digital</div>}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${plan.active ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                                            {plan.active ? 'Ativo' : 'Inativo'}
                                        </span>
                                        {plan.isFeatured && (
                                            <span className="bg-amber-100 text-amber-600 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                                                <Star size={8} fill="currentColor" /> Popular
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
      )}
      {view === 'HIGHLIGHTS' && currentUser.role === UserRole.SUPER_ADMIN && (
          <HighlightsManager 
            highlights={highlights} 
            onBack={() => setView('HOME')} 
            onRefresh={refreshData} 
          />
      )}

      {view === 'LOCATIONS' && currentUser.role === UserRole.SUPER_ADMIN && (
          <LocationsManager 
            cities={cities}
            neighborhoods={neighborhoods}
            onBack={() => setView('HOME')} 
            onRefresh={refreshData} 
          />
      )}
      {view === 'COLLECTIONS' && currentUser.role === UserRole.SUPER_ADMIN && (
          <CollectionsManager 
            collections={collections}
            businesses={allBusinesses}
            onBack={() => setView('HOME')} 
            onRefresh={refreshData} 
          />
      )}
      {view === 'REVIEWS' && currentUser.role === UserRole.SUPER_ADMIN && (
          <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                      <button onClick={() => setView('HOME')} className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-400 hover:text-ocean-600 transition-colors">
                          <ChevronLeft size={20} />
                      </button>
                      <div>
                          <h2 className="text-2xl font-black text-ocean-950 tracking-tight">Avaliações Pendentes</h2>
                          <p className="text-sm font-medium text-slate-500">Aprove ou rejeite as avaliações dos usuários</p>
                      </div>
                  </div>
              </div>

              {pendingReviews.length === 0 ? (
                  <div className="bg-white rounded-[2.5rem] p-12 text-center border border-slate-100 shadow-sm">
                      <div className="w-20 h-20 bg-ocean-50 rounded-full flex items-center justify-center mx-auto mb-6">
                          <CheckCircle2 size={32} className="text-ocean-500" />
                      </div>
                      <h3 className="text-xl font-black text-ocean-950 mb-2">Tudo limpo!</h3>
                      <p className="text-slate-500">Não há avaliações pendentes no momento.</p>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {pendingReviews.map(review => (
                          <div key={review.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col gap-4">
                              <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                      {review.userAvatar ? (
                                          <img src={review.userAvatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                                      ) : (
                                          <div className="w-10 h-10 bg-ocean-100 text-ocean-600 rounded-full flex items-center justify-center font-bold">
                                              {review.userName[0]}
                                          </div>
                                      )}
                                      <div>
                                          <p className="font-bold text-ocean-950">{review.userName}</p>
                                          <p className="text-xs text-slate-500">{new Date(review.date).toLocaleDateString()}</p>
                                      </div>
                                  </div>
                                  <div className="flex items-center gap-1 text-gold-500">
                                      <Star size={16} className="fill-current" />
                                      <span className="font-bold text-sm">{review.rating}</span>
                                  </div>
                              </div>
                              
                              <div className="bg-slate-50 p-4 rounded-2xl">
                                  <p className="text-xs font-bold text-ocean-600 uppercase mb-2">Empresa: {review.businessName}</p>
                                  <p className="text-sm text-slate-700 italic">&quot;{review.comment}&quot;</p>
                              </div>

                              <div className="flex gap-3 mt-auto pt-4">
                                  <button 
                                      onClick={async () => {
                                          if(await confirm({title: 'Rejeitar', message: 'Rejeitar esta avaliação?', type: 'danger'})) {
                                              await rejectReview(review.id);
                                              refreshData();
                                              notify('success', 'Avaliação rejeitada.');
                                          }
                                      }}
                                      className="flex-1 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors"
                                  >
                                      REJEITAR
                                  </button>
                                  <button 
                                      onClick={async () => {
                                          await approveReview(review.id);
                                          refreshData();
                                          notify('success', 'Avaliação aprovada!');
                                      }}
                                      className="flex-1 py-3 bg-ocean-600 text-white font-bold rounded-xl hover:bg-ocean-700 transition-colors shadow-lg shadow-ocean-600/20"
                                  >
                                      APROVAR
                                  </button>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      )}

      {view === 'COUPONS' && (currentUser.role === UserRole.SUPER_ADMIN || currentUser.role === UserRole.COMPANY) && (
          <div className="bg-white p-6 md:p-12 rounded-[3rem] shadow-xl border border-slate-100 animate-in slide-in-from-bottom-6 space-y-8">
              <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                      <button onClick={() => setView('HOME')} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-ocean-600 transition-colors">
                          <ChevronLeft size={20} />
                      </button>
                      <h2 className="text-2xl md:text-3xl font-black text-ocean-950">
                          {currentUser.role === UserRole.SUPER_ADMIN ? 'Todos os Cupons' : 'Meus Cupons'}
                      </h2>
                  </div>
                  <div className="flex items-center gap-2 bg-ocean-50 px-4 py-2 rounded-full">
                      <Ticket size={18} className="text-ocean-600" />
                      <span className="text-xs font-black text-ocean-600 uppercase">{coupons.length} Ativos</span>
                  </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                  {coupons.length === 0 ? (
                      <p className="text-slate-500 text-center py-10">Nenhum cupom encontrado.</p>
                  ) : (
                      coupons.map(coupon => (
                          <div key={coupon.id} className="p-6 rounded-[2rem] border bg-slate-50 border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                              <div className="flex items-center gap-4 flex-1">
                                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-200 shrink-0">
                                      {coupon.imageUrl && <img src={coupon.imageUrl} className="w-full h-full object-cover" />}
                                  </div>
                                  <div className="space-y-1">
                                      <h3 className="font-black text-lg text-ocean-950">{coupon.title}</h3>
                                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{coupon.companyName}</p>
                                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                          <p className="text-[10px] text-slate-400 flex items-center gap-1 font-bold"><Clock size={12} /> Expira em: {new Date(coupon.expiryDate).toLocaleDateString()}</p>
                                          <p className="text-[10px] text-slate-400 flex items-center gap-1 font-bold"><Zap size={12} /> {coupon.currentRedemptions || 0} resgates</p>
                                      </div>
                                  </div>
                              </div>
                              
                              <div className="flex gap-2 w-full md:w-auto">
                                  {coupon.status === 'pending' && currentUser.role === UserRole.SUPER_ADMIN && (
                                      <>
                                          <button 
                                              onClick={async () => {
                                                  await saveCoupon({ ...coupon, status: 'approved' });
                                                  refreshData();
                                                  notify('success', 'Cupom aprovado com sucesso!');
                                              }}
                                              className="flex-1 md:flex-none bg-emerald-500 text-white px-6 py-3 rounded-xl font-black text-[10px] flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all"
                                          >
                                              <Check size={16} /> APROVAR
                                          </button>
                                          <button 
                                              onClick={async () => {
                                                  await saveCoupon({ ...coupon, status: 'rejected' });
                                                  refreshData();
                                                  notify('error', 'Cupom reprovado.');
                                              }}
                                              className="flex-1 md:flex-none bg-white border border-slate-200 text-slate-500 px-6 py-3 rounded-xl font-black text-[10px] flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
                                          >
                                              <X size={16} /> REPROVAR
                                          </button>
                                      </>
                                  )}
                                  {coupon.status === 'pending' && currentUser.role !== UserRole.SUPER_ADMIN && (
                                      <div className="bg-amber-50 text-amber-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2">
                                          <Clock size={14} /> Aguardando Aprovação
                                      </div>
                                  )}
                                  {coupon.status === 'approved' && (
                                      <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2">
                                          <Check size={14} /> Aprovado
                                      </div>
                                  )}
                                  {coupon.status === 'rejected' && (
                                      <div className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2">
                                          <X size={14} /> Reprovado
                                      </div>
                                  )}
                                  <button 
                                      onClick={async () => {
                                          if (await confirm({ title: 'Excluir Cupom', message: `Deseja excluir permanentemente o cupom "${coupon.title}"?` })) {
                                              await deleteCoupon(coupon.id);
                                              refreshData();
                                              notify('success', 'Cupom excluído com sucesso.');
                                          }
                                      }}
                                      className="flex-1 md:flex-none bg-white border border-red-100 text-red-500 px-6 py-3 rounded-xl font-black text-[10px] flex items-center justify-center gap-2 hover:bg-red-50 transition-all"
                                  >
                                      <Trash2 size={16} /> EXCLUIR
                                  </button>
                              </div>
                          </div>
                      ))
                  )}
              </div>
          </div>
      )}

      {view === 'PAYMENT_SETTINGS' && currentUser.role === UserRole.SUPER_ADMIN && (
          <PaymentSettingsManager 
              settings={paymentSettings} 
              setSettings={setPaymentSettings} 
              onSave={handleSavePaymentSettings} 
              isSaving={isSaving} 
              onBack={() => setView('HOME')} 
          />
      )}

      {view === 'REDEMPTIONS' && (
          <div className="bg-white p-6 md:p-12 rounded-[3rem] shadow-xl border border-slate-100 animate-in slide-in-from-bottom-6 space-y-8">
              <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                      <button onClick={() => setView('HOME')} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-ocean-600 transition-colors">
                          <ChevronLeft size={20} />
                      </button>
                      <h2 className="text-2xl md:text-3xl font-black text-ocean-950 tracking-tight">Controle de Resgates</h2>
                  </div>
                  <div className="bg-ocean-50 px-4 py-2 rounded-full flex items-center gap-2">
                       <CheckCircle2 size={16} className="text-ocean-600" />
                       <span className="text-[10px] font-black text-ocean-600 uppercase">{redemptions.filter(r => r.status === 'USED').length} Validados</span>
                  </div>
              </div>

              <div className="space-y-6">
                  {redemptions.length === 0 ? (
                      <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                             <QrCode size={40} className="text-slate-300" />
                          </div>
                          <h3 className="text-xl font-black text-ocean-950 mb-2">Sem Resgates no Momento</h3>
                          <p className="text-slate-400 text-sm max-w-xs mx-auto">Assim que seus clientes começarem a resgatar seus cupons, eles aparecerão aqui para validação.</p>
                      </div>
                  ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {[...redemptions].sort((a,b) => (b.redeemedAt || '').localeCompare(a.redeemedAt || '')).map(redemption => (
                              <div key={redemption.id} className={`p-8 rounded-[2.5rem] border transition-all ${redemption.status === 'USED' ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-ocean-100 shadow-xl shadow-ocean-600/5 ring-1 ring-ocean-50'}`}>
                                  <div className="flex justify-between items-start mb-6">
                                      <div className="space-y-1">
                                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{redemption.userName}</p>
                                          <h3 className="font-black text-lg text-ocean-950 leading-tight">{redemption.couponTitle}</h3>
                                      </div>
                                      {redemption.status === 'USED' ? (
                                          <div className="bg-green-100 text-green-600 p-2.5 rounded-2xl">
                                              <Check size={20} />
                                          </div>
                                      ) : (
                                          <div className="bg-amber-100 text-amber-600 p-2.5 rounded-2xl animate-pulse">
                                              <Clock size={20} />
                                          </div>
                                      )}
                                  </div>

                                  <div className="space-y-4">
                                      <div className="flex justify-between items-center text-xs">
                                          <span className="text-slate-400 font-bold uppercase tracking-wider">Data</span>
                                          <span className="font-black text-ocean-900">{new Date(redemption.redeemedAt).toLocaleDateString('pt-BR')}</span>
                                      </div>
                                      <div className="flex justify-between items-center text-xs pb-4 border-b border-slate-50">
                                          <span className="text-slate-400 font-bold uppercase tracking-wider">Status</span>
                                          <span className={`font-black uppercase tracking-widest px-2 py-1 rounded-lg text-[9px] ${redemption.status === 'USED' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                                              {redemption.status === 'USED' ? 'Utilizado' : 'Pendente'}
                                          </span>
                                      </div>
                                      
                                      {redemption.status === 'PENDING' && (
                                          <div className="pt-2">
                                              <p className="text-[10px] font-black text-ocean-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                  <Key size={12} /> Código de Validação
                                              </p>
                                              <div className="flex items-center gap-2">
                                                  <input 
                                                      type="text" 
                                                      maxLength={6}
                                                      placeholder="6 dígitos"
                                                      className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3.5 text-lg font-mono font-black w-32 focus:ring-2 focus:ring-ocean-500 outline-none shadow-inner"
                                                      id={`verify-${redemption.id}`}
                                                  />
                                                  <button 
                                                      onClick={async () => {
                                                          const input = document.getElementById(`verify-${redemption.id}`) as HTMLInputElement;
                                                          if (input.value.length === 6) {
                                                              await handleValidateRedemptionAction(redemption.id, input.value);
                                                          } else {
                                                              notify('error', "Insira o código de 6 dígitos.");
                                                          }
                                                      }}
                                                      disabled={isValidatingRedemption}
                                                      className="flex-1 bg-ocean-600 text-white font-black py-4 rounded-xl shadow-lg shadow-ocean-600/20 active:scale-95 transition-all text-xs uppercase tracking-widest disabled:opacity-50 h-full flex items-center justify-center font-bold"
                                                  >
                                                      {isValidatingRedemption ? <Loader2 className="animate-spin h-5 w-5" /> : "Validar"}
                                                  </button>
                                              </div>
                                          </div>
                                      )}
                                      
                                      {redemption.status === 'USED' && redemption.validatedAt && (
                                          <div className="pt-2 text-[10px] text-slate-400 font-bold flex items-center gap-2">
                                              <CheckCircle2 size={12} className="text-green-500" />
                                              <span>Validado em {new Date(redemption.validatedAt).toLocaleString('pt-BR')}</span>
                                          </div>
                                      )}
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          </div>
      )}

      {view === 'GOOGLE_DRIVE' && (
          <GoogleDriveManager />
      )}
    </div>
  );
};

const HighlightsManager: React.FC<{ highlights: HomeHighlight[]; onBack: () => void; onRefresh: () => void }> = ({ highlights, onBack, onRefresh }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [editingHighlight, setEditingHighlight] = useState<Partial<HomeHighlight> | null>(null);
    const { notify, confirm } = useNotification();

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingHighlight) return;
        setIsSaving(true);
        try {
            await saveHomeHighlight(editingHighlight);
            notify('success', "Destaque salvo com sucesso!");
            setEditingHighlight(null);
            onRefresh();
        } catch (err) {
            notify('error', "Erro ao salvar destaque.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (await confirm({ title: 'Excluir Destaque', message: "Deseja excluir este destaque?" })) {
            await deleteHomeHighlight(id);
            onRefresh();
        }
    };

    return (
        <div className="bg-white p-6 md:p-12 rounded-[3rem] shadow-xl border border-slate-100 animate-in slide-in-from-bottom-6 space-y-8">
            <div className="flex justify-between items-center">
                <button onClick={onBack} className="flex items-center gap-2 text-ocean-600 font-black text-xs uppercase">
                    <ChevronLeft size={16} /> Voltar
                </button>
                <button 
                    onClick={() => setEditingHighlight({ title: '', description: '', imageUrl: '', buttonText: '', buttonLink: '', order: highlights.length, active: true })}
                    className="bg-ocean-600 text-white px-6 py-3 rounded-2xl font-black text-xs shadow-lg flex items-center gap-2"
                >
                    <Plus size={18} /> NOVO DESTAQUE
                </button>
            </div>

            <div className="space-y-6">
                <h2 className="text-3xl font-black text-ocean-950">Destaques da Home</h2>
                <p className="text-slate-500 text-sm">Gerencie até 4 destaques que aparecerão no carrossel da página inicial.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {highlights.map(h => (
                        <div key={h.id} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex gap-4 items-start">
                            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-200 shrink-0">
                                <img src={h.imageUrl} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-black text-ocean-950 truncate">{h.title}</h4>
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded ${h.active ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'}`}>
                                        {h.active ? 'ATIVO' : 'INATIVO'}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 line-clamp-2 mt-1">{h.description}</p>
                                <div className="flex gap-2 mt-4">
                                    <button onClick={() => setEditingHighlight(h)} className="text-ocean-600 font-black text-[10px] uppercase hover:underline">Editar</button>
                                    <button onClick={() => handleDelete(h.id)} className="text-red-500 font-black text-[10px] uppercase hover:underline">Excluir</button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {highlights.length === 0 && (
                        <div className="col-span-full py-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl">
                            Nenhum destaque cadastrado.
                        </div>
                    )}
                </div>
            </div>

            {editingHighlight && (
                <div className="fixed inset-0 bg-ocean-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-xl font-black text-ocean-950 uppercase tracking-tight">Configurar Destaque</h3>
                            <button onClick={() => setEditingHighlight(null)} className="text-slate-400 hover:text-ocean-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-full">
                                    <ImageUpload 
                                        label="Imagem de Fundo" 
                                        currentImage={editingHighlight.imageUrl} 
                                        onImageSelect={img => setEditingHighlight({...editingHighlight, imageUrl: img})} 
                                    />
                                </div>
                                <div className="col-span-full">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Título do Destaque</label>
                                    <input 
                                        required 
                                        className="w-full bg-slate-50 p-4 rounded-xl border border-slate-100 font-bold text-sm outline-none focus:ring-2 focus:ring-ocean-500" 
                                        value={editingHighlight.title} 
                                        onChange={e => setEditingHighlight({...editingHighlight, title: e.target.value})} 
                                    />
                                </div>
                                <div className="col-span-full">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Descrição</label>
                                    <textarea 
                                        required 
                                        className="w-full bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm outline-none focus:ring-2 focus:ring-ocean-500" 
                                        rows={3}
                                        value={editingHighlight.description} 
                                        onChange={e => setEditingHighlight({...editingHighlight, description: e.target.value})} 
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Texto do Botão</label>
                                    <input 
                                        required 
                                        className="w-full bg-slate-50 p-4 rounded-xl border border-slate-100 font-bold text-sm outline-none focus:ring-2 focus:ring-ocean-500" 
                                        value={editingHighlight.buttonText} 
                                        onChange={e => setEditingHighlight({...editingHighlight, buttonText: e.target.value})} 
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Link do Botão</label>
                                    <input 
                                        required 
                                        className="w-full bg-slate-50 p-4 rounded-xl border border-slate-100 font-bold text-sm outline-none focus:ring-2 focus:ring-ocean-500" 
                                        placeholder="Ex: /guia ou https://..."
                                        value={editingHighlight.buttonLink} 
                                        onChange={e => setEditingHighlight({...editingHighlight, buttonLink: e.target.value})} 
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Ordem</label>
                                    <input 
                                        type="number"
                                        className="w-full bg-slate-50 p-4 rounded-xl border border-slate-100 font-bold text-sm outline-none focus:ring-2 focus:ring-ocean-500" 
                                        value={editingHighlight.order} 
                                        onChange={e => setEditingHighlight({...editingHighlight, order: parseInt(e.target.value)})} 
                                    />
                                </div>
                                <div className="flex items-center gap-3 pt-6">
                                    <button 
                                        type="button"
                                        onClick={() => setEditingHighlight({...editingHighlight, active: !editingHighlight.active})}
                                        className={`w-12 h-6 rounded-full transition-all relative ${editingHighlight.active ? 'bg-ocean-600' : 'bg-slate-300'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${editingHighlight.active ? 'left-7' : 'left-1'}`} />
                                    </button>
                                    <span className="text-xs font-black text-ocean-950 uppercase">Destaque Ativo</span>
                                </div>
                            </div>
                            <div className="pt-6 flex gap-4">
                                <button 
                                    type="button" 
                                    onClick={() => setEditingHighlight(null)}
                                    className="flex-1 px-6 py-4 rounded-2xl font-black text-xs text-slate-500 bg-slate-100"
                                >
                                    CANCELAR
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isSaving}
                                    className="flex-[2] px-6 py-4 rounded-2xl font-black text-xs text-white bg-ocean-600 shadow-lg shadow-ocean-600/20 flex items-center justify-center gap-2"
                                >
                                    {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} SALVAR DESTAQUE
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const LocationsManager: React.FC<{ cities: City[]; neighborhoods: Neighborhood[]; onBack: () => void; onRefresh: () => void }> = ({ cities, neighborhoods, onBack, onRefresh }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [editingCity, setEditingCity] = useState<Partial<City> | null>(null);
    const [editingNeighborhood, setEditingNeighborhood] = useState<Partial<Neighborhood> | null>(null);
    const { notify, confirm } = useNotification();

    const handleSaveCity = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCity) return;
        setIsSaving(true);
        try {
            await saveCity(editingCity as City);
            notify('success', "Cidade salva com sucesso!");
            setEditingCity(null);
            onRefresh();
        } catch (err) {
            notify('error', "Erro ao salvar cidade.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveNeighborhood = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingNeighborhood) return;
        setIsSaving(true);
        try {
            await saveNeighborhood(editingNeighborhood as Neighborhood);
            notify('success', "Bairro salvo com sucesso!");
            setEditingNeighborhood(null);
            onRefresh();
        } catch (err) {
            notify('error', "Erro ao salvar bairro.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteCity = async (id: string) => {
        if (await confirm({ 
            title: 'Excluir Cidade', 
            message: "Atenção: Ao excluir esta cidade, TODOS os bairros vinculados a ela também serão excluídos permanentemente. Deseja continuar?",
            type: 'danger'
        })) {
            await deleteCity(id);
            onRefresh();
        }
    };

    const handleDeleteNeighborhood = async (id: string) => {
        if (await confirm({ title: 'Excluir Bairro', message: "Deseja excluir este bairro?" })) {
            await deleteNeighborhood(id);
            onRefresh();
        }
    };

    return (
        <div className="bg-white p-6 md:p-12 rounded-[3rem] shadow-xl border border-slate-100 animate-in slide-in-from-bottom-6 space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <button onClick={onBack} className="flex items-center gap-2 text-ocean-600 font-black text-xs uppercase">
                    <ChevronLeft size={16} /> Voltar
                </button>
                <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                    <button 
                        onClick={() => setEditingCity({ name: '', active: true })}
                        className="flex-1 sm:flex-none bg-emerald-600 text-white px-4 py-3 rounded-2xl font-black text-[10px] shadow-lg flex items-center justify-center gap-2"
                    >
                        <Plus size={16} /> NOVA CIDADE
                    </button>
                    <button 
                        onClick={() => setEditingNeighborhood({ name: '', cityId: '', active: true })}
                        className="flex-1 sm:flex-none bg-emerald-600 text-white px-4 py-3 rounded-2xl font-black text-[10px] shadow-lg flex items-center justify-center gap-2"
                    >
                        <Plus size={16} /> NOVO BAIRRO
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                <h2 className="text-3xl font-black text-ocean-950">Locais</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-xl font-black text-ocean-950 mb-4">Cidades</h3>
                        <div className="space-y-4">
                            {cities.map(c => (
                                <div key={c.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center">
                                    <span className="font-bold">{c.name}</span>
                                    <div className="flex gap-2">
                                        <button onClick={() => setEditingCity(c)} className="text-ocean-600 font-black text-[10px] uppercase hover:underline">Editar</button>
                                        <button onClick={() => handleDeleteCity(c.id)} className="text-red-500 font-black text-[10px] uppercase hover:underline">Excluir</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-ocean-950 mb-4">Bairros</h3>
                        <div className="space-y-4">
                            {neighborhoods.map(n => (
                                <div key={n.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center">
                                    <span className="font-bold">{n.name} <span className="text-slate-400 text-xs">({cities.find(c => c.id === n.cityId)?.name})</span></span>
                                    <div className="flex gap-2">
                                        <button onClick={() => setEditingNeighborhood(n)} className="text-ocean-600 font-black text-[10px] uppercase hover:underline">Editar</button>
                                        <button onClick={() => handleDeleteNeighborhood(n.id)} className="text-red-500 font-black text-[10px] uppercase hover:underline">Excluir</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals for editing city/neighborhood */}
            {editingCity && (
                <div className="fixed inset-0 bg-ocean-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 space-y-6">
                        <h3 className="text-xl font-black text-ocean-950">Configurar Cidade</h3>
                        <form onSubmit={handleSaveCity} className="space-y-4">
                            <input required className="w-full bg-slate-50 p-4 rounded-xl border border-slate-100 font-bold text-sm" placeholder="Nome da Cidade" value={editingCity.name} onChange={e => setEditingCity({...editingCity, name: e.target.value})} />
                            <div className="flex gap-4">
                                <button type="button" onClick={() => setEditingCity(null)} className="flex-1 px-6 py-4 rounded-2xl font-black text-xs text-slate-500 bg-slate-100">CANCELAR</button>
                                <button type="submit" disabled={isSaving} className="flex-1 px-6 py-4 rounded-2xl font-black text-xs text-white bg-emerald-600">SALVAR</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {editingNeighborhood && (
                <div className="fixed inset-0 bg-ocean-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 space-y-6">
                        <h3 className="text-xl font-black text-ocean-950">Configurar Bairro</h3>
                        <form onSubmit={handleSaveNeighborhood} className="space-y-4">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nome do Bairro</label>
                                <input required className="w-full bg-slate-50 p-4 rounded-xl border border-slate-100 font-bold text-sm" placeholder="Nome do Bairro" value={editingNeighborhood.name} onChange={e => setEditingNeighborhood({...editingNeighborhood, name: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Cidade Pertencente</label>
                                <select 
                                    required 
                                    className="w-full bg-slate-50 p-4 rounded-xl border border-slate-100 font-bold text-sm outline-none"
                                    value={editingNeighborhood.cityId}
                                    onChange={e => setEditingNeighborhood({...editingNeighborhood, cityId: e.target.value})}
                                >
                                    <option value="">Selecione a Cidade</option>
                                    {cities.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setEditingNeighborhood(null)} className="flex-1 px-6 py-4 rounded-2xl font-black text-xs text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors">CANCELAR</button>
                                <button type="submit" disabled={isSaving} className="flex-1 px-6 py-4 rounded-2xl font-black text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all">
                                    {isSaving ? <Loader2 size={16} className="animate-spin mx-auto" /> : "SALVAR"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const CollectionsManager: React.FC<{ collections: any[]; businesses: BusinessProfile[]; onBack: () => void; onRefresh: () => void }> = ({ collections, businesses, onBack, onRefresh }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [editingCollection, setEditingCollection] = useState<any | null>(null);
    const { notify, confirm } = useNotification();

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCollection) return;
        setIsSaving(true);
        try {
            await saveCollection(editingCollection);
            notify('success', 'Coleção salva com sucesso!');
            setEditingCollection(null);
            onRefresh();
        } catch (error) {
            notify('error', 'Erro ao salvar coleção.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (await confirm({title: 'Excluir Coleção', message: 'Tem certeza que deseja excluir esta coleção?', type: 'danger'})) {
            try {
                await deleteCollection(id);
                notify('success', 'Coleção excluída.');
                onRefresh();
            } catch (error) {
                notify('error', 'Erro ao excluir.');
            }
        }
    };

    const toggleBusiness = (businessId: string) => {
        if (!editingCollection) return;
        const currentIds = editingCollection.businessIds || [];
        const newIds = currentIds.includes(businessId) 
            ? currentIds.filter((id: string) => id !== businessId)
            : [...currentIds, businessId];
        setEditingCollection({ ...editingCollection, businessIds: newIds });
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-400 hover:text-ocean-600 transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-2xl font-black text-ocean-950 tracking-tight">Coleções</h2>
                        <p className="text-sm font-medium text-slate-500">Gerencie as coleções em destaque</p>
                    </div>
                </div>
                <button onClick={() => setEditingCollection({ title: '', description: '', coverImage: '', businessIds: [], order: 0, active: true })} className="bg-ocean-600 text-white px-6 py-4 rounded-2xl font-black text-xs shadow-lg shadow-ocean-600/20 active:scale-95 transition-all flex items-center gap-2">
                    <Plus size={16} /> NOVA COLEÇÃO
                </button>
            </div>

            {editingCollection ? (
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                    <h3 className="text-xl font-black text-ocean-950 mb-6">{editingCollection.id ? 'Editar Coleção' : 'Nova Coleção'}</h3>
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Título</label>
                                    <input required className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 font-bold text-sm text-ocean-950 focus:ring-2 focus:ring-ocean-500 outline-none transition-all" value={editingCollection.title} onChange={e => setEditingCollection({...editingCollection, title: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Descrição</label>
                                    <textarea className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 font-bold text-sm text-ocean-950 focus:ring-2 focus:ring-ocean-500 outline-none transition-all resize-none h-24" value={editingCollection.description} onChange={e => setEditingCollection({...editingCollection, description: e.target.value})} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Ordem</label>
                                        <input type="number" className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 font-bold text-sm text-ocean-950 focus:ring-2 focus:ring-ocean-500 outline-none transition-all" value={editingCollection.order} onChange={e => setEditingCollection({...editingCollection, order: parseInt(e.target.value) || 0})} />
                                    </div>
                                    <div className="flex items-center gap-3 pt-8">
                                        <input type="checkbox" id="active" className="w-5 h-5 rounded border-slate-300 text-ocean-600 focus:ring-ocean-500" checked={editingCollection.active} onChange={e => setEditingCollection({...editingCollection, active: e.target.checked})} />
                                        <label htmlFor="active" className="text-sm font-bold text-slate-700 cursor-pointer">Ativo</label>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Imagem de Capa</label>
                                <ImageUpload currentImage={editingCollection.coverImage} onImageSelect={(url) => setEditingCollection({...editingCollection, coverImage: url})} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Empresas na Coleção ({(editingCollection.businessIds || []).length})</label>
                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 max-h-64 overflow-y-auto">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                    {businesses.map(b => (
                                        <label key={b.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${editingCollection.businessIds?.includes(b.id) ? 'bg-ocean-50 border-ocean-200' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                                            <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-ocean-600 focus:ring-ocean-500" checked={editingCollection.businessIds?.includes(b.id)} onChange={() => toggleBusiness(b.id)} />
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                {b.coverImage && <img src={b.coverImage} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />}
                                                <span className="text-xs font-bold text-slate-700 truncate">{b.name}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 pt-6 border-t border-slate-100">
                            <button type="button" onClick={() => setEditingCollection(null)} className="px-8 py-4 rounded-2xl font-black text-xs text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors">CANCELAR</button>
                            <button type="submit" disabled={isSaving} className="px-8 py-4 rounded-2xl font-black text-xs text-white bg-ocean-600 hover:bg-ocean-700 shadow-lg shadow-ocean-600/20 flex items-center gap-2 transition-all">
                                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} SALVAR
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {collections.map(col => (
                        <div key={col.id} className={`bg-white rounded-[2rem] overflow-hidden shadow-sm border transition-all ${col.active !== false ? 'border-slate-100 hover:shadow-md' : 'border-slate-200 opacity-60'}`}>
                            <div className="h-40 relative">
                                {col.coverImage ? (
                                    <img src={col.coverImage} alt={col.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                        <ImageIcon size={32} className="text-slate-300" />
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <button onClick={() => setEditingCollection(col)} className="p-2 bg-white/90 backdrop-blur-sm text-ocean-600 rounded-xl hover:bg-white transition-colors shadow-sm">
                                        <PenTool size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(col.id)} className="p-2 bg-white/90 backdrop-blur-sm text-red-500 rounded-xl hover:bg-white transition-colors shadow-sm">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                {col.active === false && (
                                    <div className="absolute top-4 left-4 bg-slate-800 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                                        Inativo
                                    </div>
                                )}
                            </div>
                            <div className="p-6">
                                <h3 className="text-lg font-black text-ocean-950 mb-1">{col.title}</h3>
                                <p className="text-sm text-slate-500 line-clamp-2 mb-4">{col.description}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-lg">
                                        {(col.businessIds || []).length} empresas
                                    </span>
                                    <span className="text-xs font-bold text-slate-400">
                                        Ordem: {col.order}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {collections.length === 0 && (
                        <div className="col-span-full py-12 text-center bg-white rounded-[2.5rem] border border-slate-100 border-dashed">
                            <Layers size={48} className="mx-auto text-slate-300 mb-4" />
                            <h3 className="text-lg font-black text-slate-700 mb-2">Nenhuma coleção</h3>
                            <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">Crie coleções para agrupar empresas e destacar na página inicial do guia.</p>
                            <button onClick={() => setEditingCollection({ title: '', description: '', coverImage: '', businessIds: [], order: 0, active: true })} className="bg-ocean-600 text-white px-6 py-3 rounded-xl font-black text-xs shadow-lg shadow-ocean-600/20 inline-flex items-center gap-2">
                                <Plus size={16} /> CRIAR PRIMEIRA COLEÇÃO
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const PaymentSettingsManager: React.FC<{ settings: PaymentSettings; setSettings: (s: PaymentSettings) => void; onSave: () => void; isSaving: boolean; onBack: () => void }> = ({ settings, setSettings, onSave, isSaving, onBack }) => {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={onBack} className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-400 hover:text-ocean-600 transition-colors">
                    <ChevronLeft size={20} />
                </button>
                <div>
                    <h2 className="text-2xl font-black text-ocean-950 tracking-tight">Configurações de Pagamento</h2>
                    <p className="text-sm font-medium text-slate-500">Gerencie o sistema de pagamentos PagBank</p>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                            <div>
                                <h3 className="font-black text-ocean-950">PagBank</h3>
                                <p className="text-xs text-slate-500 font-bold">Ativar ou desativar cobranças no sistema</p>
                            </div>
                            <button 
                                onClick={() => setSettings({...settings, isPaymentActive: !settings.isPaymentActive})}
                                className={`w-14 h-8 rounded-full transition-all relative ${settings.isPaymentActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
                            >
                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${settings.isPaymentActive ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                            <div>
                                <h3 className="font-black text-emerald-950">Bypass (Pagamento Direto)</h3>
                                <p className="text-xs text-emerald-700 font-bold">Pular PagBank e ativar plano imediatamente</p>
                            </div>
                            <button 
                                onClick={() => setSettings({...settings, isDirectPaymentTest: !settings.isDirectPaymentTest})}
                                className={`w-14 h-8 rounded-full transition-all relative ${settings.isDirectPaymentTest ? 'bg-emerald-600' : 'bg-slate-300'}`}
                            >
                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${settings.isDirectPaymentTest ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100">
                            <h4 className="font-black text-blue-900 text-sm mb-2 flex items-center gap-2">
                                <ShieldCheck size={16} /> Informações de Segurança
                            </h4>
                            <p className="text-xs text-blue-700 leading-relaxed font-medium">
                                O **Modo Bypass** permite que você realize transações sem passar pelo banco. 
                                Certifique-se de desativar este modo antes de ir para produção.
                            </p>
                        </div>
                        
                        <div className="p-6 bg-purple-50 rounded-3xl border border-purple-100">
                            <h4 className="font-black text-purple-900 text-sm mb-2 flex items-center gap-2">
                                <Zap size={16} /> Webhook
                            </h4>
                            <p className="text-xs text-purple-700 leading-relaxed font-medium">
                                O Webhook é essencial para que o sistema saiba quando um pagamento foi aprovado e ative o plano automaticamente.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-slate-100">
                    <button 
                        onClick={onSave}
                        disabled={isSaving}
                        className="bg-ocean-600 text-white px-10 py-4 rounded-2xl font-black shadow-lg shadow-ocean-600/20 hover:bg-ocean-700 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} SALVAR CONFIGURAÇÕES
                    </button>
                </div>
            </div>
        </div>
    );
};
