
import React, { useState, useEffect } from 'react';
import { UserRole, AppCategory, AppConfig } from '../types';
import { login, registerUser, createCompanyRequest, getCategories, getAppConfig, loginWithGoogle, resetUserPassword } from '../services/dataService';
import { Building2, User, ChevronLeft, CheckCircle2, Loader2, Instagram, Globe, Phone, Mail, Lock, UserPlus, LogIn, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import { useNotification } from '../components/NotificationSystem';

interface LoginProps {
  onLogin: () => void;
  onNavigate?: (page: string, params?: any) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onNavigate }) => {
  const { notify } = useNotification();
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER_USER' | 'REGISTER_COMPANY'>('LOGIN');
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [categories, setCategories] = useState<AppCategory[]>([]);
  const [config, setConfig] = useState<AppConfig>(getAppConfig());
  
  // Register User State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Company Reg Form State
  const [regForm, setRegForm] = useState({
      companyName: '',
      ownerName: '',
      email: '',
      phone: '',
      whatsapp: '',
      instagram: '',
      website: '',
      document: '',
      category: 'Gastronomia',
      description: ''
  });
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
      const loadData = async () => {
          const cats = await getCategories();
          setCategories(cats);
          setConfig(getAppConfig());
      };
      loadData();
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
        const user = await login(email, password);
        if (user) {
            onLogin();
        } else {
            setError("Usuário não encontrado ou senha inválida.");
        }
    } catch (err: any) {
        setError(err.message || 'Erro ao conectar. Verifique sua conexão.');
    } finally {
        setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);
    try {
        const user = await loginWithGoogle();
        if (user) {
            onLogin();
        }
    } catch (err: any) {
        setError(err.message || 'Erro ao logar com Google.');
    } finally {
        setGoogleLoading(false);
    }
  };

  const handleUserRegisterSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      if(regPassword !== regConfirmPassword) {
          setError('As senhas não coincidem.');
          return;
      }
      setLoading(true);
      try {
          await registerUser(regName, regEmail, regPassword);
          onLogin(); 
      } catch (err: any) {
          setError('Erro ao criar conta.');
      } finally {
          setLoading(false);
      }
  };

  const handleCompanyRegisterSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setTimeout(() => {
          createCompanyRequest(regForm, 'NEW_REGISTRATION');
          setRequestSent(true);
          setLoading(false);
      }, 1500);
  };

  if (mode === 'REGISTER_COMPANY' && requestSent) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-2xl text-center animate-in zoom-in-95">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 text-green-600">
                    <CheckCircle2 size={48} />
                </div>
                <h2 className="text-2xl font-bold text-ocean-950 mb-3">Solicitação Enviada!</h2>
                <p className="text-slate-500 mb-10 leading-relaxed text-sm">Recebemos seu cadastro. Nossa equipe analisará os dados da empresa <strong>{regForm.companyName}</strong> e entrará em contato em breve.</p>
                <button 
                    onClick={() => { setMode('LOGIN'); setRequestSent(false); }}
                    className="w-full bg-ocean-600 text-white font-bold py-4 rounded-2xl hover:bg-ocean-700 shadow-lg shadow-ocean-600/20 transition-all"
                >
                    Voltar para Login
                </button>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 md:py-20">
      <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-ocean-50 rounded-3xl mb-4 text-ocean-600 p-4 overflow-hidden shadow-inner">
            {config.loginLogoUrl || config.logoUrl ? (
                <img src={config.loginLogoUrl || config.logoUrl} className="w-full h-full object-contain" />
            ) : (
                <Building2 size={36} />
            )}
          </div>
          <h1 className="text-3xl font-black text-ocean-950 tracking-tight">{config.appName.toUpperCase()} <span className="text-gold-500">{config.appNameHighlight.toUpperCase()}</span></h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Bem-vindo à maior rede da Região</p>
        </div>

        {mode !== 'REGISTER_COMPANY' && (
            <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
                <button 
                    onClick={() => { setMode('LOGIN'); setError(''); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-black transition-all ${mode === 'LOGIN' ? 'bg-white text-ocean-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <LogIn size={18} /> ENTRAR
                </button>
                <button 
                    onClick={() => { setMode('REGISTER_USER'); setError(''); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-black transition-all ${mode === 'REGISTER_USER' ? 'bg-white text-ocean-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <UserPlus size={18} /> CRIAR CONTA
                </button>
            </div>
        )}

        {error && (
            <div className="bg-red-50 text-red-600 text-[10px] p-4 rounded-2xl mb-6 flex items-start gap-3 border border-red-100 animate-in fade-in zoom-in-95">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <p className="font-bold leading-relaxed uppercase tracking-wider">{error}</p>
            </div>
        )}

        {/* --- LOGIN FORM --- */}
        {mode === 'LOGIN' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-left-4">
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 mb-2 ml-1 uppercase tracking-widest">Email cadastrado</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                            <input 
                                type="email" 
                                required
                                placeholder="seu@email.com"
                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-ocean-500/10 focus:border-ocean-500 outline-none transition-all text-sm font-bold"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 mb-2 ml-1 uppercase tracking-widest">Sua senha</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                            <input 
                                type={showPassword ? "text" : "password"}
                                required
                                placeholder="••••••••"
                                className="w-full pl-12 pr-14 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-ocean-500/10 focus:border-ocean-500 outline-none transition-all text-sm font-bold"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-ocean-600">
                                {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                            </button>
                        </div>
                        <div className="flex justify-end mt-2">
                            <button 
                                type="button"
                                onClick={async () => {
                                    if (!email) {
                                        setError("Por favor, digite seu e-mail primeiro para recuperar a senha.");
                                        return;
                                    }
                                    try {
                                        setLoading(true);
                                        await resetUserPassword(email);
                                        notify('success', `E-mail de recuperação enviado para ${email}`);
                                    } catch (err: any) {
                                        setError(err.message || "Erro ao enviar e-mail de recuperação.");
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                                className="text-[10px] font-black text-ocean-600 hover:text-ocean-700 uppercase tracking-widest"
                            >
                                Esqueci minha senha
                            </button>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading || googleLoading}
                        className="w-full bg-ocean-600 hover:bg-ocean-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-ocean-600/20 transition-all active:scale-[0.98] mt-2 flex justify-center items-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : "ACESSAR MINHA CONTA"}
                    </button>
                </form>

                <div className="relative flex items-center gap-4 py-2">
                    <div className="flex-1 h-px bg-slate-100"></div>
                    <span className="text-[10px] font-black text-slate-300 uppercase">Ou</span>
                    <div className="flex-1 h-px bg-slate-100"></div>
                </div>

                <button 
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading || googleLoading}
                    className="w-full bg-white border border-slate-200 text-slate-600 font-bold py-4 rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-sm active:scale-[0.98]"
                >
                    {googleLoading ? (
                        <Loader2 className="animate-spin" size={20} />
                    ) : (
                        <>
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#EA4335" d="M12 5.04c1.94 0 3.51.68 4.75 1.77l3.52-3.52C18.1 1.48 15.28 0 12 0 7.31 0 3.25 2.69 1.25 6.64l4.13 3.2C6.34 7.23 8.94 5.04 12 5.04z" />
                                <path fill="#4285F4" d="M23.49 12.27c0-.86-.08-1.7-.22-2.52H12v4.77h6.44c-.28 1.47-1.11 2.72-2.36 3.56l3.71 2.87c2.17-2.01 3.7-4.98 3.7-8.68z" />
                                <path fill="#34A853" d="M5.38 14.16c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29l-4.13-3.2C.47 8.09 0 9.99 0 12s.47 3.91 1.25 5.64l4.13-3.48z" />
                                <path fill="#FBBC05" d="M12 24c3.24 0 5.97-1.07 7.96-2.91l-3.71-2.87c-1.08.73-2.47 1.16-4.25 1.16-3.06 0-5.66-2.19-6.62-5.12l-4.13 3.48C3.25 21.31 7.31 24 12 24z" />
                            </svg>
                            Continuar com Google
                        </>
                    )}
                </button>

                <div className="pt-6 border-t border-slate-100 mt-6 text-center flex flex-col gap-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Possui um negócio?</p>
                    <button 
                        type="button"
                        onClick={() => setMode('REGISTER_COMPANY')}
                        className="w-full bg-gold-50 text-gold-700 font-bold py-4 rounded-2xl hover:bg-gold-100 transition-all flex items-center justify-center gap-2 border border-gold-100"
                    >
                        <Building2 size={18} /> CADASTRAR MINHA EMPRESA
                    </button>
                    <button 
                        type="button"
                        onClick={() => onNavigate && onNavigate('pricing-plans')}
                        className="text-xs font-bold text-ocean-600 hover:text-ocean-700 transition-colors"
                    >
                        Ver Planos do Lagos GO
                    </button>
                </div>
            </div>
        )}

        {/* --- REGISTER USER FORM --- */}
        {mode === 'REGISTER_USER' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                <form onSubmit={handleUserRegisterSubmit} className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Nome Completo</label>
                        <input required className="w-full px-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-ocean-500/10 outline-none font-bold text-sm" value={regName} onChange={(e) => setRegName(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Email</label>
                        <input type="email" required className="w-full px-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-ocean-500/10 outline-none font-bold text-sm" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Senha</label>
                            <input type="password" required className="w-full px-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-sm" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Confirmação</label>
                            <input type="password" required className="w-full px-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-sm" value={regConfirmPassword} onChange={(e) => setRegConfirmPassword(e.target.value)} />
                        </div>
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-ocean-600 text-white font-black py-5 rounded-2xl shadow-xl mt-4">
                        {loading ? <Loader2 className="animate-spin" size={20} /> : "CRIAR MINHA CONTA GRÁTIS"}
                    </button>
                </form>

                <div className="relative flex items-center gap-4 py-2">
                    <div className="flex-1 h-px bg-slate-100"></div>
                    <span className="text-[10px] font-black text-slate-300 uppercase">Ou use</span>
                    <div className="flex-1 h-px bg-slate-100"></div>
                </div>

                <button 
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading || googleLoading}
                    className="w-full bg-white border border-slate-200 text-slate-600 font-bold py-4 rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#EA4335" d="M12 5.04c1.94 0 3.51.68 4.75 1.77l3.52-3.52C18.1 1.48 15.28 0 12 0 7.31 0 3.25 2.69 1.25 6.64l4.13 3.2C6.34 7.23 8.94 5.04 12 5.04z" />
                        <path fill="#4285F4" d="M23.49 12.27c0-.86-.08-1.7-.22-2.52H12v4.77h6.44c-.28 1.47-1.11 2.72-2.36 3.56l3.71 2.87c2.17-2.01 3.7-4.98 3.7-8.68z" />
                        <path fill="#34A853" d="M5.38 14.16c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29l-4.13-3.2C.47 8.09 0 9.99 0 12s.47 3.91 1.25 5.64l4.13-3.48z" />
                        <path fill="#FBBC05" d="M12 24c3.24 0 5.97-1.07 7.96-2.91l-3.71-2.87c-1.08.73-2.47 1.16-4.25 1.16-3.06 0-5.66-2.19-6.62-5.12l-4.13 3.48C3.25 21.31 7.31 24 12 24z" />
                    </svg>
                    Cadastrar com Google
                </button>
            </div>
        )}

        {/* --- REGISTER COMPANY FORM --- */}
        {mode === 'REGISTER_COMPANY' && (
            <div className="animate-in fade-in slide-in-from-bottom-4">
                <button onClick={() => setMode('LOGIN')} className="flex items-center text-slate-400 hover:text-ocean-600 mb-6 text-xs font-black gap-1 transition-colors uppercase tracking-widest">
                    <ChevronLeft size={20} /> Voltar para Login
                </button>
                <h2 className="text-2xl font-black text-ocean-950 mb-2">Venda mais na Região</h2>
                <p className="text-slate-500 text-xs mb-8 leading-relaxed font-medium">Cadastre seu negócio e comece a oferecer cupons exclusivos para milhares de turistas e moradores.</p>
                <form onSubmit={handleCompanyRegisterSubmit} className="space-y-4">
                    <div className="space-y-3">
                        <input placeholder="Nome da Empresa" required className="w-full px-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold text-sm outline-none" value={regForm.companyName} onChange={e => setRegForm({...regForm, companyName: e.target.value})} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input placeholder="Responsável" required className="w-full px-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold text-sm outline-none" value={regForm.ownerName} onChange={e => setRegForm({...regForm, ownerName: e.target.value})} />
                            <input placeholder="CNPJ / CPF" required className="w-full px-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold text-sm outline-none" value={regForm.document} onChange={e => setRegForm({...regForm, document: e.target.value})} />
                        </div>
                        <input type="email" placeholder="Email Comercial" required className="w-full px-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold text-sm outline-none" value={regForm.email} onChange={e => setRegForm({...regForm, email: e.target.value})} />
                        <input type="tel" placeholder="WhatsApp (DDD + Número)" required className="w-full px-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold text-sm outline-none" value={regForm.phone} onChange={e => setRegForm({...regForm, phone: e.target.value})} />
                        <select className="w-full px-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-500 font-bold text-sm outline-none" value={regForm.category} onChange={e => setRegForm({...regForm, category: e.target.value})}>
                            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-ocean-950 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-black transition-all flex justify-center items-center gap-2">
                        {loading ? <Loader2 className="animate-spin" size={20}/> : <><CheckCircle2 size={20}/> ENVIAR PARA ANÁLISE</>}
                    </button>
                </form>
            </div>
        )}

      </div>
    </div>
  );
};
