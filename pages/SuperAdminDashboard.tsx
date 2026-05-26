
import React, { useState, useEffect } from 'react';
import { User, CompanyRequest, BusinessProfile, UserRole, AppCategory } from '../types';
import { 
  getCompanyRequests, approveCompanyRequest, getAllUsers, 
  getAllBusinesses, getCoupons, saveBusiness, updateUser, getAdminStats,
  resetUserPassword, deleteBusiness, deleteUser, getCategories, approveBusiness,
  getGlobalSettings, saveGlobalSettings
} from '../services/dataService';
import { seedTouristSpots } from '../services/seedService';
import { 
  LayoutDashboard, Store, CheckCircle, Clock, 
  ChevronRight, Loader2, Users, Ticket, 
  Settings, Bell, Shield, Search, Edit, Key, Trash2,
  PieChart as PieIcon, DollarSign, Mail, X, Save, CheckCircle2, PenTool,
  RefreshCw, MessageCircle, Info, MapPin
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip, Legend } from 'recharts';
import { useNotification } from '../components/NotificationSystem';
import { AppGlobalSettings } from '../types';

const COLORS = ['#0ea5e9', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];

export const SuperAdminDashboard: React.FC<{ onNavigate: (page: string) => void; currentUser: User; onLogout: () => void }> = ({ onNavigate, currentUser, onLogout }) => {
  const { notify, confirm } = useNotification();
  const [view, setView] = useState<'HOME' | 'REQUESTS' | 'USERS' | 'COMPANIES' | 'SETTINGS'>('HOME');
  const [requests, setRequests] = useState<CompanyRequest[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [categories, setCategories] = useState<AppCategory[]>([]);
  
  // Settings State
  const [globalSettings, setGlobalSettings] = useState<AppGlobalSettings>({ salesWhatsapp: '' });
  
  // Modal de Edição de Usuário
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState({ name: '', email: '' });
  const [newJournalist, setNewJournalist] = useState({ name: '', email: '', password: '' });
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    setLoadingData(true);
    try {
        const [reqs, users, bizs, cats, settings] = await Promise.all([
          getCompanyRequests(),
          getAllUsers(),
          getAllBusinesses(true),
          getCategories(),
          getGlobalSettings()
        ]);
        const s = await getAdminStats();
        setRequests(reqs || []);
        setAllUsers(users || []);
        setBusinesses(bizs || []);
        setStats(s);
        setCategories(cats || []);
        setGlobalSettings(settings || { salesWhatsapp: '' });
    } catch (e) {
        console.error("Erro ao carregar dados do admin:", e);
    } finally {
        setLoadingData(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('dataUpdated', handleUpdate);
    return () => window.removeEventListener('dataUpdated', handleUpdate);
  }, []);

  const handleOpenEdit = (user: User) => {
      setEditingUser(user);
      setEditFormData({ name: user.name, email: user.email });
  };

  const handleSaveUserEdit = async () => {
      if (!editingUser) return;
      setActionLoading('saving_user');
      try {
          const updated = { ...editingUser, name: editFormData.name, email: editFormData.email };
          await updateUser(updated);
          await loadData();
          setEditingUser(null);
          notify('success', "Dados do usuário atualizados com sucesso!");
      } catch (e) {
          notify('error', "Erro ao atualizar dados do usuário.");
      } finally {
          setActionLoading(null);
      }
  };

  const handleResetPassword = async (user: User) => {
    if (!user?.email) {
        notify('warning', "Este usuário não possui um e-mail cadastrado.");
        return;
    }
    if (!await confirm({ title: 'Redefinir Senha', message: `Deseja enviar um e-mail de redefinição de senha para ${user.name || 'Usuário'} (${user.email})?` })) return;
    
    setActionLoading(user.id);
    try {
        await resetUserPassword(user.email);
        notify('success', `E-mail de redefinição enviado com sucesso para ${user.email}`);
    } catch (e: any) {
        notify('error', e.message || "Erro ao solicitar redefinição de senha.");
    } finally {
        setActionLoading(null);
    }
  };

  const handleDeleteBiz = async (id: string, name: string) => {
      if (!await confirm({ title: 'Excluir Empresa', message: `TEM CERTEZA que deseja EXCLUIR permanentemente a empresa "${name}"? Esta ação não pode ser desfeita.` })) return;
      setActionLoading(id);
      try {
          await deleteBusiness(id);
          notify('success', "Empresa excluída com sucesso!");
          await loadData();
      } catch (e) {
          notify('error', "Erro ao deletar empresa.");
      } finally {
          setActionLoading(null);
      }
  };

  const handleDeleteUser = async (id: string, name: string) => {
      if (id === currentUser.id) return notify('warning', "Você não pode excluir a si mesmo.");
      if (!await confirm({ title: 'Excluir Usuário', message: `TEM CERTEZA que deseja EXCLUIR o usuário "${name}"?` })) return;
      setActionLoading(id);
      try {
          await deleteUser(id);
          notify('success', "Usuário excluído com sucesso!");
          await loadData();
      } catch (e) {
          notify('error', "Erro ao deletar usuário.");
      } finally {
          setActionLoading(null);
      }
  };

  const handleGrantBusinessPermission = async (user: User) => {
      if (!await confirm({ title: 'Conceder Permissão', message: `Deseja dar permissão para ${user.name} criar uma empresa?` })) return;
      
      setActionLoading(user.id);
      try {
          const updatedUser = { 
              ...user, 
              permissions: { 
                  ...(user.permissions || { canCreateCoupons: false, canManageBusiness: false }),
                  canCreateBusiness: true 
              } 
          };
          await updateUser(updatedUser);
          notify('success', `Permissão concedida para ${user.name}! O usuário agora verá um aviso em seu painel para criar a empresa.`);
          await loadData();
      } catch (e) {
          console.error("Erro ao conceder permissão:", e);
          notify('error', "Erro ao conceder permissão.");
      } finally {
          setActionLoading(null);
      }
  };

  const safeSearch = (searchTerm || '').toLowerCase();

  const filteredUsers = (allUsers || []).filter(u => {
    const name = (u?.name || '').toLowerCase();
    const email = (u?.email || '').toLowerCase();
    return name.includes(safeSearch) || email.includes(safeSearch);
  });

  const filteredBusinesses = (businesses || []).filter(b => {
    const name = (b?.name || '').toLowerCase();
    return name.includes(safeSearch);
  });

  if (loadingData && !stats) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-ocean-600" size={48} /></div>;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 pt-8 md:pt-16">
      {/* SIDEBAR */}
      <div className="w-full md:w-72 bg-white border-r border-slate-200 p-6 flex flex-col z-40">
         <div className="mb-8 flex items-center gap-3">
             <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg">
                 <Shield size={20} />
             </div>
             <div>
                 <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Control</h2>
                 <p className="text-ocean-950 font-black text-sm">Painel Central</p>
             </div>
         </div>
         <nav className="flex flex-col gap-1">
             <button onClick={() => setView('HOME')} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${view === 'HOME' ? 'bg-ocean-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
                 <LayoutDashboard size={18} /> Panorâmica
             </button>
             <button onClick={() => setView('COMPANIES')} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${view === 'COMPANIES' ? 'bg-ocean-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
                 <Store size={18} /> Empresas
             </button>
             <button onClick={() => { setView('USERS'); loadData(); }} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${view === 'USERS' ? 'bg-ocean-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
                 <Users size={18} /> Usuários
             </button>
             <button onClick={() => setView('REQUESTS')} className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${view === 'REQUESTS' ? 'bg-ocean-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
                 <div className="flex items-center gap-3"><Bell size={18} /> Solicitações</div>
                 {requests.filter(r => r.status === 'PENDING').length > 0 && <span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black">{requests.filter(r => r.status === 'PENDING').length}</span>}
             </button>
             <button onClick={() => setView('SETTINGS')} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${view === 'SETTINGS' ? 'bg-ocean-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
                 <Settings size={18} /> Configurações
             </button>
             <div className="my-4 border-t border-slate-100"></div>
             <button onClick={onLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors">
                 Sair
             </button>
         </nav>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-4 md:p-10 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
              {/* SEARCH BAR */}
              {(view === 'USERS' || view === 'COMPANIES') && (
                  <div className="mb-8 relative max-w-md">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        className="w-full bg-white border border-slate-200 pl-12 pr-4 py-4 rounded-2xl shadow-sm outline-none font-bold text-sm"
                        placeholder="Pesquisar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                  </div>
              )}

              {view === 'HOME' && (
                  <div className="space-y-8">
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
                                      message: 'Deseja cadastrar agora os 10 pontos turísticos oficiais verificados? Criaremos as cidades e categorias faltantes automaticamente.' 
                                  })) {
                                      setActionLoading('seeding');
                                      try {
                                          await seedTouristSpots(notify);
                                          await loadData();
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

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Cidadãos</p>
                              <h3 className="text-4xl font-black text-ocean-950">{stats?.totalUsers || 0}</h3>
                          </div>
                          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Economia</p>
                              <h3 className="text-4xl font-black text-ocean-950">R$ {stats?.totalEconomy?.toFixed(0) || 0}</h3>
                          </div>
                          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Lojistas</p>
                              <h3 className="text-4xl font-black text-ocean-950">{stats?.totalBusinesses || 0}</h3>
                          </div>
                          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Cupons</p>
                              <h3 className="text-4xl font-black text-ocean-950">{stats?.totalCoupons || 0}</h3>
                          </div>
                      </div>

                      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm h-80">
                          <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                  <Pie data={stats?.chartData || []} innerRadius={80} outerRadius={100} paddingAngle={8} dataKey="value">
                                    {(stats?.chartData || []).map((_: any, index: number) => (
                                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                  </Pie>
                                  <ReTooltip />
                                  <Legend />
                              </PieChart>
                          </ResponsiveContainer>
                      </div>


                  </div>
              )}

              {view === 'USERS' && (
                  <div className="space-y-8">
                      {/* BULK RECOVERY SECTION */}
                      <div className="bg-orange-50 border border-orange-100 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                          <div className="flex items-center gap-5">
                              <div className="bg-orange-100 p-4 rounded-3xl text-orange-600 shadow-inner">
                                  <Key size={32} />
                              </div>
                              <div>
                                  <h3 className="font-black text-orange-900 text-base uppercase tracking-widest mb-1">Recuperação de Acesso em Massa</h3>
                                  <p className="text-sm text-orange-700 font-medium max-w-md leading-relaxed">
                                      Redefina a senha de todos os usuários para <span className="font-black bg-orange-200 px-2 py-0.5 rounded">123456</span>. 
                                      Isso permitirá que usuários antigos recuperem o acesso imediatamente.
                                  </p>
                              </div>
                          </div>
                          <button 
                              onClick={async () => {
                                  if (await confirm({ 
                                      title: 'Confirmar Recuperação em Massa', 
                                      message: 'Esta ação irá alterar a senha de TODOS os usuários (exceto administradores) para "123456". Tem certeza que deseja prosseguir?' 
                                  })) {
                                      setIsSaving(true);
                                      try {
                                          const { setManualPassword } = await import('../services/dataService');
                                          let count = 0;
                                          const usersToUpdate = [...allUsers].filter(u => u.role !== UserRole.SUPER_ADMIN);
                                          
                                          for (const u of usersToUpdate) {
                                              await setManualPassword(u.id, '123456');
                                              count++;
                                          }
                                          
                                          notify('success', `Sucesso! ${count} usuários agora podem acessar com a senha "123456".`);
                                          await loadData();
                                      } catch (error: any) {
                                          notify('error', 'Erro na recuperação: ' + error.message);
                                      } finally {
                                          setIsSaving(false);
                                      }
                                  }
                              }}
                              disabled={isSaving}
                              className="bg-orange-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-200 hover:bg-orange-700 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                          >
                              {isSaving ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
                              {isSaving ? 'Processando...' : 'Resetar Todos para 123456'}
                          </button>
                      </div>

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
                                      loadData();
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
                          <table className="w-full text-left">
                          <thead className="bg-slate-50">
                              <tr>
                                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase">Usuário</th>
                                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase">Cargo</th>
                                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase text-center">Ações</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                              {filteredUsers.map(u => (
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
                                            <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase w-fit ${u.role === UserRole.SUPER_ADMIN ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                                              {u.role}
                                            </span>
                                            {u.permissions?.canCreateBusiness && u.role !== UserRole.COMPANY && (
                                                <span className="text-[9px] font-black text-orange-600 bg-orange-50 px-2 py-1 rounded-md w-fit flex items-center gap-1">
                                                    <Shield size={10} /> PERMISSÃO LIBERADA
                                                </span>
                                            )}
                                          </div>
                                      </td>
                                      <td className="px-6 py-5">
                                          <div className="flex justify-center items-center gap-2">
                                              {u.role !== UserRole.SUPER_ADMIN && u.role !== UserRole.JOURNALIST && (
                                                  <button 
                                                      onClick={async () => {
                                                          if (await confirm({ title: 'Promover a Jornalista', message: `Deseja transformar ${u.name} em Jornalista?` })) {
                                                              const { updateUser } = await import('../services/dataService');
                                                              await updateUser({ ...u, role: UserRole.JOURNALIST });
                                                               notify('success', `${u.name} agora é um Jornalista!`);
                                                              loadData();
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
                                                              loadData();
                                                          }
                                                      }}
                                                      className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm border border-indigo-100"
                                                      title="Remover Acesso de Jornalista"
                                                  >
                                                      <PenTool size={18} />
                                                  </button>
                                              )}
                                              <button 
                                                onClick={() => handleGrantBusinessPermission(u)}
                                                disabled={actionLoading === u.id || u.role === UserRole.COMPANY || u.role === UserRole.SUPER_ADMIN || u.permissions?.canCreateBusiness}
                                                className={`p-3 rounded-xl transition-all shadow-sm border border-slate-100 ${u.role === UserRole.COMPANY || u.permissions?.canCreateBusiness ? 'bg-slate-50 text-slate-300 cursor-not-allowed' : 'bg-white text-ocean-600 hover:bg-ocean-600 hover:text-white'}`}
                                                title={u.permissions?.canCreateBusiness ? "Permissão já concedida" : "Dar permissão para criar empresa"}
                                              >
                                                  {actionLoading === u.id ? <Loader2 className="animate-spin" size={18}/> : <Shield size={18} />}
                                              </button>
                                              <button 
                                                onClick={() => handleOpenEdit(u)}
                                                className="p-3 bg-white text-slate-400 rounded-xl hover:bg-ocean-600 hover:text-white transition-all shadow-sm border border-slate-100"
                                                title="Editar Informações"
                                              >
                                                  <Edit size={18} />
                                              </button>
                                              <button 
                                                onClick={() => handleResetPassword(u)}
                                                disabled={actionLoading === u.id}
                                                className="p-3 bg-white text-orange-500 rounded-xl hover:bg-orange-500 hover:text-white transition-all shadow-sm border border-orange-100 active:scale-95"
                                                title="Resetar Senha"
                                              >
                                                  {actionLoading === u.id ? <Loader2 className="animate-spin" size={18}/> : <Key size={18} />}
                                              </button>
                                              <button 
                                                onClick={() => handleDeleteUser(u.id, u.name)}
                                                disabled={actionLoading === u.id}
                                                className="p-3 bg-white text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm border border-slate-100"
                                                title="Excluir Usuário"
                                              >
                                                  {actionLoading === u.id ? <Loader2 className="animate-spin" size={18}/> : <Trash2 size={18} />}
                                              </button>
                                          </div>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
              )}

              {view === 'COMPANIES' && (
                  <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                      <table className="w-full text-left">
                          <thead className="bg-slate-50">
                              <tr>
                                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase">Empresa</th>
                                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase">Setor</th>
                                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase text-center">Ações</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                              {filteredBusinesses.map(b => {
                                  const companyUser = allUsers.find(u => u.id === b.id);
                                  return (
                                    <tr key={b.id} className="hover:bg-slate-50/50">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <img src={b.coverImage || 'https://via.placeholder.com/150'} className="w-12 h-12 rounded-2xl object-cover" />
                                                <div>
                                                    <p className="font-black text-ocean-950 text-sm">{b.name || 'Sem nome'}</p>
                                                    <p className="text-[10px] text-slate-400">{companyUser?.email || 'Sem e-mail cadastrado'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-sm font-bold text-ocean-600">{b.category}</td>
                                        <td className="px-6 py-5">
                                            <div className="flex justify-center items-center gap-2">
                                                {b.status === 'PENDING' && (
                                                    <button 
                                                        onClick={async () => {
                                                            if (!await confirm({ title: 'Aprovar Empresa', message: `Deseja aprovar a empresa "${b.name}"?` })) return;
                                                            setActionLoading(b.id);
                                                            try {
                                                                await approveBusiness(b.id);
                                                                notify('success', `Empresa "${b.name}" aprovada com sucesso!`);
                                                                await loadData();
                                                            } catch (err) {
                                                                notify('error', "Erro ao aprovar empresa.");
                                                            } finally {
                                                                setActionLoading(null);
                                                            }
                                                        }}
                                                        disabled={actionLoading === b.id}
                                                        className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm border border-emerald-100"
                                                        title="Aprovar Empresa"
                                                    >
                                                        {actionLoading === b.id ? <Loader2 className="animate-spin" size={18}/> : <CheckCircle size={18} />}
                                                    </button>
                                                )}
                                                {companyUser && (
                                                    <>
                                                        <button 
                                                            onClick={() => handleOpenEdit(companyUser)}
                                                            className="p-3 bg-white text-slate-400 rounded-xl hover:bg-ocean-600 hover:text-white transition-all shadow-sm border border-slate-100"
                                                            title="Editar Informações do Responsável"
                                                        >
                                                            <Edit size={18} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleResetPassword(companyUser)}
                                                            disabled={actionLoading === companyUser.id}
                                                            className="p-3 bg-white text-orange-500 rounded-xl hover:bg-orange-500 hover:text-white transition-all shadow-sm border border-orange-100 active:scale-95"
                                                            title="Redefinir Senha do Responsável"
                                                        >
                                                            {actionLoading === companyUser.id ? <Loader2 className="animate-spin" size={18}/> : <Key size={18} />}
                                                        </button>
                                                    </>
                                                )}
                                                <button 
                                                    onClick={() => handleDeleteBiz(b.id, b.name)}
                                                    disabled={actionLoading === b.id}
                                                    className="p-3 bg-white text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm border border-slate-100"
                                                    title="Excluir Empresa"
                                                >
                                                    {actionLoading === b.id ? <Loader2 className="animate-spin" size={18}/> : <Trash2 size={18} />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                  );
                              })}
                          </tbody>
                      </table>
                  </div>
              )}

              {view === 'REQUESTS' && (
                  <div className="grid grid-cols-1 gap-4">
                      {requests.map(req => (
                          <div key={req.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                              <div className="flex items-center gap-6">
                                  <div className="w-16 h-16 bg-ocean-50 text-ocean-600 rounded-3xl flex items-center justify-center font-black text-xl">
                                      {(req.companyName?.[0] || '?')}
                                  </div>
                                  <div>
                                      <h3 className="text-xl font-black text-ocean-950">{req.companyName}</h3>
                                      <p className="text-xs text-slate-400 font-bold uppercase">{req.category}</p>
                                  </div>
                              </div>
                              <div className="flex gap-2 w-full md:w-auto">
                                  {req.status === 'PENDING' && (
                                      <button 
                                        onClick={async () => { 
                                            setActionLoading(req.id); 
                                            await approveCompanyRequest(req.id); 
                                             notify('success', `Solicitação de "${req.companyName}" aprovada! O usuário recebeu permissão para publicar a empresa no seu próprio painel.`);
                                            await loadData(); 
                                            setActionLoading(null); 
                                        }}
                                        className="bg-ocean-600 text-white px-8 py-4 rounded-2xl font-black text-xs shadow-lg flex items-center gap-2"
                                      >
                                          {actionLoading === req.id ? <Loader2 className="animate-spin" size={16}/> : <CheckCircle size={16} />} Aprovar
                                      </button>
                                  )}
                              </div>
                          </div>
                      ))}
                      {requests.length === 0 && <p className="text-center py-20 text-slate-400 uppercase font-black text-xs">Nenhuma solicitação</p>}
                  </div>
              )}
               {view === 'SETTINGS' && (
                  <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4">
                      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                          <div className="flex items-center gap-4 mb-2">
                              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                                  <Settings size={24} />
                              </div>
                              <div>
                                  <h3 className="text-xl font-black text-ocean-950">Configurações Globais</h3>
                                  <p className="text-sm text-slate-400 font-medium">Controle os parâmetros gerais do sistema Lagos GO.</p>
                              </div>
                          </div>

                          <div className="space-y-6">
                              <div className="space-y-4">
                                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                      WhatsApp de Vendas (Consultor)
                                  </label>
                                  <div className="relative">
                                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                          <MessageCircle size={18} />
                                      </div>
                                      <input 
                                          className="w-full bg-slate-50 border border-slate-200 pl-12 pr-4 py-5 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-ocean-500/10 transition-all"
                                          placeholder="Ex: 5522998765432"
                                          value={globalSettings.salesWhatsapp}
                                          onChange={(e) => setGlobalSettings({ ...globalSettings, salesWhatsapp: e.target.value.replace(/\D/g, '') })}
                                      />
                                  </div>
                                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed px-1">
                                      O número deve conter o código do país (Brasil = 55), o DDD e o número completo. 
                                      <br />Apenas números, sem parênteses ou traços.
                                  </p>
                              </div>

                              <button 
                                  onClick={async () => {
                                      setActionLoading('saving_settings');
                                      try {
                                          await saveGlobalSettings(globalSettings);
                                          notify('success', 'Configurações salvas com sucesso!');
                                      } catch (err) {
                                          notify('error', 'Erro ao salvar configurações.');
                                      } finally {
                                          setActionLoading(null);
                                      }
                                  }}
                                  disabled={actionLoading === 'saving_settings'}
                                  className="w-full py-6 bg-ocean-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-ocean-600/20 hover:bg-ocean-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                              >
                                  {actionLoading === 'saving_settings' ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                  Salvar Configurações
                              </button>
                          </div>
                      </div>

                      <div className="bg-ocean-50 border border-ocean-100 p-8 rounded-[2.5rem] flex items-start gap-4">
                          <Info className="text-ocean-600 shrink-0 mt-1" size={20} />
                          <div>
                              <h4 className="font-black text-ocean-950 text-sm uppercase tracking-tight mb-1">Dica de Segurança</h4>
                              <p className="text-xs text-ocean-700 font-medium leading-relaxed">
                                  Certifique-se de que o número informado possui uma conta de WhatsApp Business ativa para passar mais credibilidade aos novos lojistas.
                              </p>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      </div>

      {/* MODAL DE EDIÇÃO DE USUÁRIO */}
      {editingUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
                  <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                      <div>
                        <h3 className="text-xl font-black text-ocean-950">Editar Usuário</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID: {editingUser.id}</p>
                      </div>
                      <button onClick={() => setEditingUser(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                          <X size={24} className="text-slate-400" />
                      </button>
                  </div>
                  
                  <div className="p-8 space-y-6">
                      <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Nome Completo</label>
                          <input 
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-sm focus:ring-4 focus:ring-ocean-500/10 outline-none transition-all"
                            value={editFormData.name}
                            onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                          />
                      </div>
                      <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Endereço de E-mail</label>
                          <input 
                            type="email"
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-sm focus:ring-4 focus:ring-ocean-500/10 outline-none transition-all"
                            value={editFormData.email}
                            onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                          />
                          <p className="text-[10px] text-orange-500 font-bold mt-2 ml-1">
                              * Atenção: Alterar o e-mail aqui apenas atualiza o banco de dados. Para enviar o link de reset, este e-mail deve ser válido.
                          </p>
                      </div>
                  </div>

                  <div className="p-8 bg-slate-50 flex gap-3">
                      <button 
                        onClick={() => setEditingUser(null)}
                        className="flex-1 px-6 py-4 bg-white border border-slate-200 text-slate-500 font-black rounded-2xl text-xs hover:bg-slate-100 transition-all"
                      >
                          CANCELAR
                      </button>
                      <button 
                        onClick={handleSaveUserEdit}
                        disabled={actionLoading === 'saving_user'}
                        className="flex-1 px-6 py-4 bg-ocean-600 text-white font-black rounded-2xl text-xs shadow-lg shadow-ocean-600/20 flex items-center justify-center gap-2 hover:bg-ocean-700 transition-all"
                      >
                          {actionLoading === 'saving_user' ? <Loader2 className="animate-spin" size={16}/> : <Save size={16} />} SALVAR
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
