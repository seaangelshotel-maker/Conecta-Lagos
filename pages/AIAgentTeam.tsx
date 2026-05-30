
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, Search, BarChart3, Target, PenTool, CheckCircle2, 
  Loader2, Send, ChevronRight, AlertCircle, Sparkles, 
  Database, User as UserIcon, ShieldCheck, MapPin, ArrowRight,
  RefreshCw, MessageSquare, Edit3, Trash2, Save, Camera, Plus, Minus
} from 'lucide-react';
import { AgentStep, INITIAL_STEPS, runAgentStep, finalizeLocation } from '../services/aiAgentService';
import { 
  createAdminPlace, getCities, getNeighborhoods, getCategories, 
  getBusinesses, getAmenities, ensureSubcategory, saveAmenity 
} from '../services/dataService';
import { useNotification } from '../components/NotificationSystem';
import { BusinessProfile, AppCategory, AppAmenity } from '../types';

export const AIAgentTeam: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { notify } = useNotification();
  const [targetPlace, setTargetPlace] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [steps, setSteps] = useState<AgentStep[]>(INITIAL_STEPS);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cities, setCities] = useState<{id: string, name: string}[]>([]);
  const [selectedCityId, setSelectedCityId] = useState('');
  const [categories, setCategories] = useState<AppCategory[]>([]);
  const [amenitiesList, setAmenitiesList] = useState<AppAmenity[]>([]);
  const [finalBatch, setFinalBatch] = useState<Partial<BusinessProfile & { imageKeywords?: string; coverImage?: string }>[]>([]);
  const [currentBatchIndex, setCurrentBatchIndex] = useState(0);
  const [isEditingFinal, setIsEditingFinal] = useState(false);
  const [existingGuideContext, setExistingGuideContext] = useState('');
  const [manualKey, setManualKey] = useState(localStorage.getItem('lagos_go_api_key') || '');
  const [quotaError, setQuotaError] = useState<{title: string, msg: string} | null>(null);
  const finalData = finalBatch[currentBatchIndex];
  const [logs, setLogs] = useState<{role: string, msg: string, time: string}[]>([]);
  const [activeFeedback, setActiveFeedback] = useState<{index: number, text: string} | null>(null);
  const [newAmenityInput, setNewAmenityInput] = useState('');
  const [newSubcategoryInput, setNewSubcategoryInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, steps]);

  const addLog = (role: string, msg: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [...prev, { role, msg, time }]);
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [citiesData, catsData, amsData] = await Promise.all([
          getCities(),
          getCategories(),
          getAmenities()
        ]);
        setCities(citiesData);
        setCategories(catsData);
        setAmenitiesList(amsData);
        if (citiesData.length > 0) setSelectedCityId(citiesData[0].id);
      } catch (e) {
        console.error("Erro ao carregar dados iniciais:", e);
      }
    };
    loadInitialData();
  }, []);

  const handleStart = async () => {
    if (!targetPlace.trim()) return;
    
    const selectedCity = cities.find(c => c.id === selectedCityId);
    const cityConstraint = selectedCity ? `FOQUE EXCLUSIVAMENTE NA CIDADE DE ${selectedCity.name}, RJ. NÃO SUGIRA LUGARES DE OUTRAS CIDADES.` : '';
    
    setIsProcessing(true);
    setFinalBatch([]);
    setCurrentBatchIndex(0);
    
    try {
      addLog('system', `Sincronizando inteligência local em ${selectedCity?.name || 'Região'}...`);
      const existing = await getBusinesses();
      const names = existing.map(b => b.name).join(', ');
      setExistingGuideContext(`${cityConstraint} LOCAIS JÁ EXISTENTES: [${names}]`);
    } catch (e) {
      console.error("Erro ao buscar locais existentes:", e);
    }

    setSteps(INITIAL_STEPS.map(s => ({ ...s, content: '', status: 'pending', feedback: undefined })));
    setLogs([{ role: 'system', msg: `Protocolo ALPHA iniciado em ${selectedCity?.name || 'Lagos'}. (Lote: ${quantity})`, time: new Date().toLocaleTimeString() }]);
    setCurrentStepIndex(0);
  };

  useEffect(() => {
    if (currentStepIndex >= 0 && currentStepIndex < steps.length && isProcessing) {
      if (steps[currentStepIndex].status !== 'completed') {
        processStep(currentStepIndex);
      } else {
        // Skip already completed steps (useful for re-runs)
        setCurrentStepIndex(prev => prev + 1);
      }
    } else if (currentStepIndex === steps.length) {
      finishProcess();
    }
  }, [currentStepIndex, isProcessing]);

  const processStep = async (index: number, manualFeedback?: string) => {
    const step = steps[index];
    setSteps(prev => {
      const newSteps = [...prev];
      newSteps[index].status = 'working';
      return newSteps;
    });

    addLog(step.name, manualFeedback ? `REPROCESSANDO para massa: "${manualFeedback}"` : `Extraindo camadas de inteligência para o lote em "${targetPlace}"...`);

    try {
      const previousContext = steps
        .slice(0, index)
        .map(s => `${s.name}: ${s.content}`)
        .join('\n\n');

      const result = await runAgentStep(
        step.role, 
        targetPlace + ` (Gerar ${quantity} locais) ` + existingGuideContext, 
        previousContext, 
        manualFeedback,
        manualKey
      );
      
      setSteps(prev => {
        const newSteps = [...prev];
        newSteps[index].content = result;
        newSteps[index].status = 'completed';
        newSteps[index].feedback = manualFeedback;
        return newSteps;
      });

      addLog(step.name, `Relatório liberado para revisão.`);
      
      if (!manualFeedback) {
        setTimeout(() => {
          setCurrentStepIndex(index + 1);
        }, 1200);
      } else {
        setIsProcessing(false);
        setActiveFeedback(null);
      }

    } catch (error: any) {
      const errorStr = JSON.stringify(error);
      const isQuota = errorStr.includes('429') || error.message?.includes('429') || error.message?.includes('quota');
      const isNotFound = errorStr.includes('404') || error.message?.includes('404');

      if (isQuota) {
        setQuotaError({
          title: "OPERAÇÃO INTERROMPIDA: LIMITE DE QUOTA",
          msg: "O Agente de Elite esgotou as consultas gratuitas. O Google limita a inteligência para evitar sobrecarga. SOLUÇÃO: Insira uma nova chave GEMINI_API_KEY_PESQU para continuar o trabalho."
        });
      } else if (isNotFound) {
        setQuotaError({
          title: "SISTEMA FORA DE ALCANCE (404)",
          msg: "O modelo de inteligência solicitado não foi encontrado ou está temporariamente indisponível. Isso pode ser instabilidade no Google ou uma configuração de modelo antiga."
        });
      } else {
        setQuotaError({
          title: "FALHA TÉCNICA NA OPERAÇÃO",
          msg: "Houve um erro inesperado na comunicação com o cérebro da IA. Verifique sua conexão e se a chave de API inserida é válida."
        });
      }

      setSteps(prev => {
        const newSteps = [...prev];
        newSteps[index].status = 'error';
        return newSteps;
      });
      setIsProcessing(false);
      addLog('system', `FALHA CRÍTICA: O Agente ${step.name} foi interrompido por limite de quota.`);
    }
  };

  const handleManualKeySave = (val: string) => {
    setManualKey(val);
    localStorage.setItem('lagos_go_api_key', val);
  };

  const handleFeedback = async () => {
    if (!activeFeedback || !activeFeedback.text.trim()) return;
    setIsProcessing(true);
    await processStep(activeFeedback.index, activeFeedback.text);
  };

  const handleRetryWithNewKey = () => {
    setQuotaError(null);
    if (currentStepIndex >= 0) {
      processStep(currentStepIndex);
    }
  };

  const finishProcess = async () => {
    addLog('system', `Sincronizando ${quantity} locais e estruturando saída de massa...`);
    try {
      const allContent = steps.map(s => s.content).join('\n\n');
      const batchData = await finalizeLocation(allContent, quantity, manualKey);

      // Processa os dados da IA, mas mantém a imagem vazia para busca manual
      const enrichedBatch = batchData.map(place => {
        return { ...place, coverImage: '' };
      });

      setFinalBatch(enrichedBatch);
      addLog('finalizer', `Lote de ${enrichedBatch.length} locais consolidado. Aguardando revisão de massa do Comandante.`);
    } catch (error: any) {
      const errorStr = JSON.stringify(error);
      if (errorStr.includes('429') || error.message?.includes('429') || error.message?.includes('quota')) {
        setQuotaError({
          title: "LIMITE DE INTELIGÊNCIA ALCANÇADO (QUOTA 429)",
          msg: "O sistema de pesquisa atingiu o limite de requisições gratuitas. Isso acontece para proteger os servidores. Para resolver, insira uma nova chave de API (GEMINI_API_KEY_PESQU) abaixo."
        });
      } else {
        setQuotaError({
          title: "ERRO NA CONSOLIDAÇÃO DE DADOS",
          msg: "O Agente Engenheiro de Dados não conseguiu estruturar o lote final. Isso pode ser causado por um erro na chave de API ou por dados inconsistentes fornecidos pelos agentes anteriores."
        });
      }
      notify('error', 'Falha na consolidação do Lote JSON.');
    } finally {
      setIsProcessing(false);
    }
  };

  const saveToSystem = async () => {
    if (finalBatch.length === 0) return;
    try {
      const neighborhoods = await getNeighborhoods();
      const defaultNH = neighborhoods.find(n => n.cityId === selectedCityId) || neighborhoods[0];

      addLog('system', `Persistindo lote de ${finalBatch.length} locais...`);

      for (const place of finalBatch) {
        // Enforce subcategory existence
        if (place.category && place.subcategory) {
          await ensureSubcategory(place.category, place.subcategory);
        }

        // Enforce amenities existence in the global list if new ones were added manually
        // (already handled by saveAmenity in the UI if used, but reinforcing here if needed)

        await createAdminPlace({
          ...place,
          cityId: selectedCityId,
          neighborhoodId: defaultNH?.id,
          isClaimed: false,
          canBeClaimed: false,
          coverImage: place.coverImage || '',
          status: 'approved',
          active: true,
          updatedAt: new Date().toISOString()
        } as Partial<BusinessProfile>);
      }

      notify('success', `${finalBatch.length} locais publicados com sucesso.`);
      onBack();
    } catch (error) {
      console.error("Erro ao salvar lote:", error);
      notify('error', 'Erro durante a persistência do lote.');
    }
  };

  const updateCurrentPlace = (updates: Partial<BusinessProfile>) => {
    setFinalBatch(prev => prev.map((item, idx) => idx === currentBatchIndex ? { ...item, ...updates } : item));
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-10 font-sans selection:bg-ocean-500 selection:text-white">
      {/* HUD HEADER */}
      <div className="max-w-[1600px] mx-auto flex flex-col xl:flex-row items-center justify-between gap-8 mb-12 border-b border-slate-800/50 pb-8">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="group p-4 bg-slate-900/80 border border-slate-800 rounded-2xl hover:bg-ocean-600/20 hover:border-ocean-500/50 transition-all">
            <ChevronRight className="rotate-180 text-slate-400 group-hover:text-ocean-400" size={24} />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="bg-ocean-500/20 text-ocean-400 p-1 rounded-md">
                <ShieldCheck size={14} />
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Ambiente de Comando Administrativo</span>
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tighter flex items-center gap-3">
              Célula <span className="text-ocean-500">Inteligente</span> Lagos GO
            </h1>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto">
          {/* QUANTITY PICKER */}
          <div className="flex items-center gap-3 bg-slate-900/50 border border-slate-800 p-2 rounded-2xl">
            <span className="text-[10px] font-bold text-slate-500 uppercase ml-3">Cidade:</span>
            <select 
              value={selectedCityId}
              onChange={(e) => setSelectedCityId(e.target.value)}
              disabled={isProcessing}
              className="bg-transparent border-none focus:ring-0 text-[10px] font-black text-ocean-400 uppercase cursor-pointer pr-8"
            >
              {cities.map(c => <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>)}
            </select>
            <div className="w-[1px] h-4 bg-slate-800 mx-2" />
            <span className="text-[10px] font-bold text-slate-500 uppercase">Quantidade:</span>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="p-2 hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-30"
                disabled={isProcessing}
              >
                <Minus size={14} />
              </button>
              <span className="w-8 text-center font-black text-ocean-400">{quantity}</span>
              <button 
                onClick={() => setQuantity(q => Math.min(5, q + 1))}
                className="p-2 hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-30"
                disabled={isProcessing}
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          <div className="flex bg-slate-900 border border-slate-700/50 p-2 rounded-2xl w-full md:w-[450px] shadow-2xl shadow-black/50 overflow-hidden group focus-within:border-ocean-500/50 transition-all">
            <input 
              type="text" 
              placeholder="Digite o nome do local (Ex: Praia do Forno, Restaurante X...)" 
              value={targetPlace}
              onChange={(e) => setTargetPlace(e.target.value)}
              disabled={isProcessing}
              className="bg-transparent border-none focus:ring-0 px-6 py-3 w-full font-medium placeholder:text-slate-600 italic"
            />
            <button 
              onClick={handleStart}
              disabled={isProcessing || !targetPlace}
              className="bg-ocean-600 hover:bg-ocean-500 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center gap-3 shadow-lg shadow-ocean-600/20 whitespace-nowrap"
            >
              {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              Estratégia
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* AGENTS SIDEBAR */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <Bot size={14} className="text-ocean-400" /> Time de Operações
            </h2>
            <div className="flex gap-1">
              <div className="w-1 h-1 rounded-full bg-ocean-500 animate-pulse" />
              <div className="w-1 h-1 rounded-full bg-ocean-500 animate-pulse [animation-delay:0.2s]" />
            </div>
          </div>
          
          <div className="space-y-3">
            {steps.map((step, idx) => (
              <motion.div 
                key={step.role}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`group relative p-5 rounded-3xl border transition-all duration-500 overflow-hidden ${
                  step.status === 'working' ? 'bg-ocean-500/10 border-ocean-500 shadow-lg shadow-ocean-500/10' :
                  step.status === 'completed' ? 'bg-slate-900 border-slate-800' :
                  'bg-slate-900/30 border-slate-800/50 opacity-40'
                }`}
              >
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl transition-colors ${
                      step.status === 'working' ? 'bg-ocean-500 text-white' :
                      step.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      'bg-slate-800 text-slate-500'
                    }`}>
                      {step.role === 'researcher' && <Search size={18} />}
                      {step.role === 'yuri' && <ShieldCheck size={18} />}
                      {step.role === 'analyzer' && <BarChart3 size={18} />}
                      {step.role === 'visualizer' && <Camera size={18} />}
                      {step.role === 'strategist' && <Target size={18} />}
                      {step.role === 'copywriter' && <PenTool size={18} />}
                      {step.role === 'finalizer' && <Database size={18} />}
                    </div>
                    <div>
                      <h3 className="font-bold text-xs uppercase tracking-tight text-slate-200">{step.name}</h3>
                      <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                        {step.status === 'pending' && 'Offline'}
                        {step.status === 'working' && 'Analisando...'}
                        {step.status === 'completed' && 'Relatório Pronto'}
                      </p>
                    </div>
                  </div>
                  
                  {step.status === 'completed' && (
                    <button 
                      onClick={() => setActiveFeedback({ index: idx, text: '' })}
                      className="p-2 hover:bg-ocean-500/20 rounded-lg text-ocean-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Dar Ordem Direta"
                    >
                      <RefreshCw size={14} />
                    </button>
                  )}
                </div>
                {step.status === 'working' && (
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-ocean-500 to-transparent"
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* MONITOR PRINCIPAL */}
        <div className="lg:col-span-9 space-y-8">
          <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-slate-800/80 rounded-[3rem] h-[700px] flex flex-col shadow-2xl relative overflow-hidden group/monitor">
            {/* TERMINAL HEADER */}
            <div className="bg-slate-900/80 p-8 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="flex gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse [animation-delay:0.2s]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse [animation-delay:0.4s]" />
                </div>
                <div className="h-4 w-[1px] bg-slate-800 mx-2" />
                <span className="text-[10px] font-mono text-ocean-400 font-bold uppercase tracking-[0.4em]">LOG DE PROCESSAMENTO ESTRATÉGICO</span>
              </div>
              <div className="flex items-center gap-4 font-mono text-[10px] text-slate-500">
                <span className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-emerald-500" /> LIVE_SYNC</span>
                <span className="bg-black/40 px-3 py-1 rounded-md border border-white/5">0.0.0.0:3000</span>
              </div>
            </div>

            {/* LOG FLOW */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 font-mono text-xs space-y-8 scrollbar-thin scrollbar-thumb-slate-800 selection:bg-ocean-600/30">
              <AnimatePresence>
                {quotaError && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute inset-0 z-[60] flex items-center justify-center p-8 bg-slate-950/40 backdrop-blur-md"
                  >
                    <div className="bg-red-950/90 border-2 border-red-500/50 p-12 rounded-[3.5rem] max-w-xl text-center space-y-6 shadow-[0_0_100px_rgba(239,68,68,0.2)]">
                      <div className="mx-auto w-20 h-20 bg-red-500 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-red-500/40">
                        <AlertCircle size={48} />
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-2xl font-black uppercase tracking-tighter text-red-100">{quotaError.title}</h3>
                        <p className="text-red-200/70 text-sm leading-relaxed italic">
                          {quotaError.msg}
                        </p>
                      </div>
                      <div className="pt-4 flex flex-col gap-4">
                        <div className="bg-black/40 p-5 rounded-3xl border border-red-500/20 text-[10px] text-red-300 font-mono text-left space-y-4">
                          <span className="text-slate-500 uppercase block font-black">Slot de Rotação de Chave:</span>
                          <div className="space-y-2">
                            <label className="text-[9px] text-white/50">Cole aqui uma nova chave Gemini (API_KEY):</label>
                            <input 
                              type="password"
                              value={manualKey}
                              onChange={(e) => handleManualKeySave(e.target.value)}
                              placeholder="AIzaSy..."
                              className="w-full bg-black/60 border border-red-500/30 rounded-xl px-4 py-3 text-white text-xs font-mono focus:border-red-500 focus:ring-0"
                            />
                          </div>
                          <p className="text-[8px] text-slate-500">Essa chave será salva apenas neste navegador para suas pesquisas de massa.</p>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <button 
                            onClick={() => setQuotaError(null)}
                            className="bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border border-white/10"
                          >
                            Fechar
                          </button>
                          <button 
                            onClick={handleRetryWithNewKey}
                            disabled={!manualKey}
                            className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
                          >
                            <RefreshCw size={14} className={isProcessing ? 'animate-spin' : ''} /> Injetar Chave e Retentar
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {logs.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-slate-800/50 space-y-6">
                    <div className="relative">
                      <Sparkles size={80} className="animate-pulse" />
                      <div className="absolute inset-0 blur-2xl bg-ocean-500/20" />
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] uppercase tracking-[0.5em] font-black mb-2">Comando Central Arraial/Cabo Frio</p>
                      <p className="text-xs uppercase tracking-widest font-mono italic">Aguardando coordenadas de entrada...</p>
                    </div>
                  </div>
                )}
                {logs.map((log, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-6 group"
                  >
                    <div className="flex flex-col items-center shrink-0 w-16">
                      <span className="text-[9px] text-slate-600 mb-2">{log.time}</span>
                      <div className={`h-full w-[1px] ${log.role === 'system' ? 'bg-ocean-500/30' : 'bg-slate-800'}`} />
                    </div>
                    <div className="space-y-2 pb-4">
                      <span className={`inline-block font-black uppercase text-[10px] px-2 py-0.5 rounded ${
                        log.role === 'system' ? 'bg-ocean-500/10 text-ocean-400' : 'bg-slate-800 text-ocean-500'
                      }`}>
                        {log.role}
                      </span>
                      <p className={`leading-relaxed whitespace-pre-wrap max-w-4xl ${
                        log.role === 'system' ? 'text-ocean-100 font-bold' : 'text-slate-400'
                      }`}>
                        {log.msg}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* INTERACTIVE FEEDBACK OVERLAY */}
            <AnimatePresence>
              {activeFeedback && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-40 flex items-center justify-center p-10"
                >
                  <motion.div 
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="bg-slate-900 border border-slate-700 p-10 rounded-[3rem] w-full max-w-2xl shadow-3xl"
                  >
                    <div className="flex items-center gap-5 mb-8">
                      <div className="bg-ocean-600 p-4 rounded-3xl text-white">
                        <MessageSquare size={32} />
                      </div>
                      <div>
                        <h4 className="text-2xl font-black uppercase tracking-tight">Dar Ordem ao {steps[activeFeedback.index].name}</h4>
                        <p className="text-slate-400 text-sm font-medium">O que deve ser mudado ou aprofundado no relatório?</p>
                      </div>
                    </div>
                    <textarea 
                      value={activeFeedback.text}
                      onChange={(e) => setActiveFeedback({...activeFeedback, text: e.target.value})}
                      placeholder="Ex: 'Seja mais específico sobre a coordenada' ou 'O texto está muito longo'..."
                      className="w-full h-40 bg-black/40 border border-slate-800 rounded-3xl p-6 text-white font-medium focus:border-ocean-500 focus:ring-0 placeholder:text-slate-700"
                    />
                    <div className="flex gap-4 mt-8">
                      <button 
                        onClick={() => setActiveFeedback(null)}
                        className="flex-1 px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                      >
                        Cancelar
                      </button>
                      <button 
                        onClick={handleFeedback}
                        className="flex-[2] bg-ocean-600 text-white px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-ocean-600/20 hover:bg-ocean-500 transition-all flex items-center justify-center gap-3"
                      >
                        Enviar Ordem Direta <Send size={18} />
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* FINAL APPROVAL / JSON REVIEW */}
            <AnimatePresence>
              {finalBatch.length > 0 && (
                <motion.div 
                  initial={{ y: 200 }}
                  animate={{ y: 0 }}
                  className="absolute bottom-0 inset-x-0 bg-ocean-600/95 backdrop-blur-xl p-8 flex flex-col xl:flex-row items-center justify-between gap-8 border-t border-white/20 shadow-[0_-50px_100px_rgba(0,0,0,0.5)] z-50"
                >
                  <div className="flex items-center gap-6">
                    <div className="bg-white p-4 rounded-[1.5rem] text-ocean-950 shadow-2xl">
                      <ShieldCheck size={32} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="bg-white/20 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                          Lote de Inteligência ({currentBatchIndex + 1} de {finalBatch.length})
                        </span>
                        <h4 className="font-black uppercase text-xl tracking-tighter text-white">{finalData?.name || 'Local Sem Nome'}</h4>
                      </div>
                      <div className="flex gap-2 items-center">
                        {finalBatch.map((_, i) => (
                          <button 
                            key={i} 
                            onClick={() => setCurrentBatchIndex(i)}
                            className={`h-2 rounded-full transition-all ${i === currentBatchIndex ? 'w-8 bg-white' : 'w-2 bg-white/30 hover:bg-white/50'}`}
                            title={`Revisar Local ${i + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
                    <button 
                      onClick={() => {
                        const newBatch = finalBatch.filter((_, idx) => idx !== currentBatchIndex);
                        setFinalBatch(newBatch);
                        if (newBatch.length === 0) {
                          setIsEditingFinal(false);
                        } else {
                          setCurrentBatchIndex(prev => Math.max(0, prev - 1));
                        }
                      }}
                      className="group flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 px-6 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest border border-red-500/20 transition-all"
                    >
                      <Trash2 size={16} /> Descartar Este
                    </button>
                    <button 
                      onClick={() => setFinalBatch([])}
                      className="group flex items-center justify-center gap-2 bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 px-6 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest border border-white/10 transition-all"
                    >
                      <Trash2 size={16} /> Abortar Missão
                    </button>
                    <button 
                      onClick={() => setIsEditingFinal(true)}
                      className="group flex items-center justify-center gap-2 bg-ocean-500 text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-ocean-500/20 hover:scale-105 transition-all"
                    >
                      <Edit3 size={16} /> Revisar Dados & Fotos
                    </button>
                    <button 
                      onClick={saveToSystem}
                      className="flex-1 xl:flex-none bg-white text-ocean-950 px-10 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                      Publicar Tudo <ArrowRight size={18} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* INTEL CARDS (SNEAK PEEK) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.filter(s => s.status === 'completed' && s.role !== 'finalizer').slice(-3).map((step, idx) => (
              <motion.div 
                key={step.role}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] space-y-4 hover:border-ocean-500/30 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-ocean-500/10 rounded-xl text-ocean-400">
                      {step.role === 'researcher' && <Search size={16} />}
                      {step.role === 'yuri' && <ShieldCheck size={16} />}
                      {step.role === 'visualizer' && <Camera size={16} />}
                      {step.role === 'copywriter' && <PenTool size={16} />}
                      {step.role === 'strategist' && <Target size={16} />}
                      {step.role === 'analyzer' && <BarChart3 size={16} />}
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Visão: {step.name}</span>
                  </div>
                  {step.feedback && <MessageSquare size={14} className="text-amber-500 animate-pulse" />}
                </div>
                <div className="text-xs text-slate-400 line-clamp-5 leading-relaxed font-medium italic">
                  &quot;{step.content.substring(0, 400)}...&quot;
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* FINAL EDIT MODAL */}
      <AnimatePresence>
        {isEditingFinal && finalData && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setIsEditingFinal(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="relative bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-[3rem] shadow-3xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-10 border-b border-slate-800 flex items-center justify-between bg-slate-800/20">
                <div className="flex items-center gap-5">
                  <div className="bg-ocean-600 p-4 rounded-2xl">
                    <Edit3 size={32} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight text-white">Revisão Final do Comandante</h3>
                    <p className="text-slate-400 text-sm font-medium">Toque final nos metadados gerados pela IA.</p>
                  </div>
                </div>
                <button onClick={() => setIsEditingFinal(false)} className="p-3 hover:bg-slate-800 rounded-full text-slate-500 transition-colors">
                  <X className="rotate-0 hover:rotate-90 transition-transform" size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-8">
                {/* Visual Management Section */}
                <div className="bg-slate-950/50 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-xl shadow-black/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Camera className="text-ocean-400" size={24} />
                      <h4 className="text-sm font-black uppercase tracking-widest text-white">Gestão de Imagem Real</h4>
                    </div>
                    <button 
                      onClick={() => {
                        const cityName = cities.find(c => c.id === selectedCityId)?.name || '';
                        const q = encodeURIComponent(`${finalData?.name} ${cityName} RJ foto real fachada`);
                        window.open(`https://www.google.com/search?q=${q}&tbm=isch`, '_blank');
                      }}
                      className="bg-ocean-600/20 text-ocean-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-ocean-500/30 hover:bg-ocean-500 hover:text-white transition-all flex items-center gap-2"
                    >
                      <Search size={14} /> Pesquisar no Google
                    </button>
                  </div>

                  <div className="flex flex-col xl:flex-row gap-8">
                    <div className="xl:w-1/2 space-y-4">
                       <div className="space-y-2 relative group">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4 italic">Link da Foto (Capa)</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            value={finalData?.coverImage || ''}
                            onChange={(e) => updateCurrentPlace({ coverImage: e.target.value })}
                            placeholder="Cole aqui o link da imagem real..."
                            className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-white text-xs focus:border-ocean-500 focus:ring-0 pr-16"
                          />
                          {finalData?.coverImage && (
                            <div className="absolute right-2 top-2 bottom-2 aspect-square rounded-lg overflow-hidden border border-white/10 shadow-lg">
                              <img src={finalData.coverImage} className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>
                       </div>
                       <div className="space-y-4">
                        <div className="flex justify-between items-center px-4">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Galeria de Fotos (Opcional - Até 5 Links)</label>
                          <span className="text-[8px] text-slate-600 font-bold uppercase">{finalData?.gallery?.filter(Boolean).length || 0} de 5 Fotos</span>
                        </div>
                        
                        <div className="space-y-3">
                          {[0, 1, 2, 3, 4].map(index => {
                            const currentUrl = finalData?.gallery?.[index] || '';
                            return (
                              <div key={index} className="relative group">
                                <input 
                                  type="text" 
                                  value={currentUrl}
                                  onChange={(e) => {
                                    const nextGallery = [...(finalData?.gallery || [])];
                                    while (nextGallery.length < 5) nextGallery.push('');
                                    nextGallery[index] = e.target.value;
                                    updateCurrentPlace({ gallery: nextGallery });
                                  }}
                                  placeholder={`Link da foto ${index + 1}...`}
                                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-[10px] focus:border-ocean-500 focus:ring-0 pr-14 font-mono"
                                />
                                {currentUrl && (
                                  <div className="absolute right-1.5 top-1.5 bottom-1.5 aspect-square rounded-lg overflow-hidden border border-white/10 shadow-lg">
                                    <img src={currentUrl} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = 'https://placehold.co/100x100?text=Error')} />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                       </div>
                    </div>
                    <div className="xl:w-1/2">
                      <div className="aspect-video w-full bg-black rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center relative">
                        {finalData?.coverImage ? (
                          <img 
                            src={finalData.coverImage} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                          />
                        ) : (
                          <div className="text-center p-6">
                            <Camera size={32} className="text-slate-800 mx-auto mb-2" />
                            <p className="text-[9px] text-slate-700 font-bold uppercase">Sem Capa</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4 italic">Nome Oficial</label>
                    <input 
                      type="text" 
                      value={finalData?.name || ''}
                      onChange={(e) => updateCurrentPlace({ name: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold focus:border-ocean-500 focus:ring-0 transition-all font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4 italic text-glow-ocean">Categoria</label>
                    <select 
                      value={finalData?.category || ''}
                      onChange={(e) => updateCurrentPlace({ category: e.target.value, subcategory: '' })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold focus:border-ocean-500 focus:ring-0 transition-all cursor-pointer"
                    >
                      <option value="">Selecione...</option>
                      {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Subcategories */}
                <div className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Target className="text-ocean-400" size={20} />
                      <h4 className="text-xs font-black uppercase tracking-widest text-white">Subcategoria (Tags de Busca)</h4>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(categories.find(c => c.name.toLowerCase() === finalData?.category?.toLowerCase())?.subcategories || []).map(sub => (
                      <button 
                        key={sub.id}
                        onClick={() => updateCurrentPlace({ subcategory: sub.name })}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          finalData?.subcategory === sub.name ? 'bg-ocean-500 text-white shadow-lg shadow-ocean-500/20' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {sub.name}
                      </button>
                    ))}
                    <div className="ml-auto flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Nova subcategoria..."
                        value={newSubcategoryInput}
                        onChange={(e) => setNewSubcategoryInput(e.target.value)}
                        className="bg-black/40 border border-slate-800 rounded-xl px-4 py-2 text-[10px] text-white focus:border-ocean-500 focus:ring-0 w-40"
                      />
                      <button 
                        onClick={async () => {
                          if (!newSubcategoryInput) return;
                          updateCurrentPlace({ subcategory: newSubcategoryInput });
                          setNewSubcategoryInput('');
                        }}
                        className="bg-ocean-600/20 text-ocean-400 px-3 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-ocean-600 hover:text-white transition-all"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  {finalData?.subcategory && !(categories.find(c => c.name.toLowerCase() === finalData?.category?.toLowerCase())?.subcategories || []).some(s => s.name.toLowerCase() === finalData?.subcategory?.toLowerCase()) && (
                    <p className="text-[9px] text-amber-500 font-bold uppercase italic">* Esta subcategoria será criada e salva no sistema.</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4 italic">Localização / Endereço</label>
                  <input 
                    type="text" 
                    value={finalData?.address || ''}
                    onChange={(e) => updateCurrentPlace({ address: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white font-medium focus:border-ocean-500 focus:ring-0 transition-all"
                  />
                </div>

                {/* Opening Hours */}
                <div className="bg-slate-950/30 p-8 rounded-[2.5rem] border border-slate-800 space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4 italic">Horário de Funcionamento</h4>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map(day => (
                      <div key={day} className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-600 uppercase ml-2">{day}</label>
                        <input 
                          type="text" 
                          value={finalData?.openingHours?.[day] || ''}
                          onChange={(e) => {
                            const hours = { ...(finalData?.openingHours || {}) };
                            hours[day] = e.target.value;
                            updateCurrentPlace({ openingHours: hours });
                          }}
                          placeholder="Ex: 08:00 - 18:00 ou 24 horas"
                          className="w-full bg-black/40 border border-slate-800 rounded-xl px-4 py-2 text-[10px] text-white focus:border-ocean-500 focus:ring-0 font-mono"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center px-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Descrição SEO Exclusiva (Mínimo 1200 caracteres)</label>
                    <div className="flex gap-4 items-center">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                        (finalData?.description?.length || 0) > 1200 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {(finalData?.description?.length || 0)} caracteres
                      </span>
                      { (finalData?.description?.length || 0) > 1200 && <CheckCircle2 className="text-emerald-500" size={14} /> }
                    </div>
                  </div>
                  <textarea 
                    value={finalData?.description || ''}
                    onChange={(e) => updateCurrentPlace({ description: e.target.value })}
                    placeholder="A IA escreverá um texto longo e otimizado aqui..."
                    className="w-full h-96 bg-slate-950 border border-slate-800 rounded-[2.5rem] px-8 py-8 text-slate-300 font-serif leading-relaxed focus:border-ocean-500 focus:ring-0 scrollbar-thin transition-all text-lg shadow-inner"
                  />
                  <p className="text-[9px] text-slate-600 font-bold uppercase italic px-4">Dica: Use parágrafos claros e foque nas palavras-chave principais do local.</p>
                </div>

                {/* Amenities */}
                <div className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800 space-y-6">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4 italic">Amenidades & Facilidades</label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {amenitiesList.map(am => {
                      const isSelected = finalData?.amenities?.includes(am.id);
                       return (
                         <button 
                           key={am.id}
                           onClick={() => {
                             const current = finalData?.amenities || [];
                             const next = isSelected ? current.filter(a => a !== am.id) : [...current, am.id];
                             updateCurrentPlace({ amenities: next });
                           }}
                           className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                             isSelected ? 'bg-ocean-500 text-white' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                           }`}
                         >
                           {am.label}
                         </button>
                       );
                    })}
                    <div className="ml-auto flex gap-2">
                       <input 
                         type="text" 
                         placeholder="Criar comodidade..."
                         value={newAmenityInput}
                         onChange={(e) => setNewAmenityInput(e.target.value)}
                         className="bg-black/40 border border-slate-800 rounded-xl px-4 py-2 text-[10px] text-white focus:border-ocean-500 focus:ring-0 w-40"
                       />
                       <button 
                         onClick={async () => {
                           if (!newAmenityInput) return;
                           const current = finalData?.amenities || [];
                           const newId = await saveAmenity(newAmenityInput);
                           if (!current.includes(newId)) {
                             updateCurrentPlace({ amenities: [...current, newId] });
                             // Persist new amenity globally
                             const newList = await getAmenities();
                             setAmenitiesList(newList);
                           }
                           setNewAmenityInput('');
                         }}
                         className="bg-ocean-600/20 text-ocean-400 px-3 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-ocean-600 hover:text-white transition-all"
                       >
                         <Plus size={14} />
                       </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2 italic">Latitude</label>
                    <input 
                      type="number" 
                      value={finalData?.lat || 0}
                      onChange={(e) => updateCurrentPlace({ lat: parseFloat(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-mono text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2 italic">Longitude</label>
                    <input 
                      type="number" 
                      value={finalData?.lng || 0}
                      onChange={(e) => updateCurrentPlace({ lng: parseFloat(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-mono text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2 italic">WhatsApp</label>
                    <input 
                      type="text" 
                      value={finalData?.whatsapp || ''}
                      onChange={(e) => updateCurrentPlace({ whatsapp: e.target.value })}
                      placeholder="WhatsApp"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2 italic">Nota IA</label>
                    <input 
                      type="number" 
                      value={finalData?.rating || 0}
                      step="0.1"
                      onChange={(e) => updateCurrentPlace({ rating: parseFloat(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center ml-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Instagram (Sem @)</label>
                      {!finalData?.instagram && <span className="text-[8px] text-amber-500 font-bold uppercase animate-pulse">Pendente</span>}
                    </div>
                    <input 
                      type="text" 
                      value={finalData?.instagram || ''}
                      onChange={(e) => updateCurrentPlace({ instagram: e.target.value })}
                      placeholder="Ex: lagosgo"
                      className={`w-full bg-slate-950 border rounded-xl px-4 py-3 text-white text-xs transition-all ${!finalData?.instagram ? 'border-amber-500/30 bg-amber-500/5' : 'border-slate-800'}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center ml-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Site Oficial</label>
                      {!finalData?.website && <span className="text-[8px] text-amber-500 font-bold uppercase animate-pulse">Pendente</span>}
                    </div>
                    <input 
                      type="text" 
                      value={finalData?.website || ''}
                      onChange={(e) => updateCurrentPlace({ website: e.target.value })}
                      placeholder="https://..."
                      className={`w-full bg-slate-950 border rounded-xl px-4 py-3 text-white text-xs transition-all ${!finalData?.website ? 'border-amber-500/30 bg-amber-500/5' : 'border-slate-800'}`}
                    />
                  </div>
                </div>
              </div>

              <div className="p-10 border-t border-slate-800 bg-slate-800/20 flex gap-6">
                <button 
                  onClick={() => setIsEditingFinal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                >
                  Continuar Revisão
                </button>
                <button 
                  onClick={() => setIsEditingFinal(false)}
                  className="flex-[2] bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-600/20 transition-all flex items-center justify-center gap-3"
                >
                  Salvar Alterações <Save size={18} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const X: React.FC<{ size?: number, className?: string }> = ({ size = 24, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
);
