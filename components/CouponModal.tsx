
import React, { useState, useEffect } from 'react';
import { X, MapPin, Clock, FileText, Check, Copy, AlertTriangle, Loader2 } from 'lucide-react';
import { Coupon } from '../types';
import { getCurrentUser } from '../services/dataService';

interface CouponModalProps {
  coupon: Coupon;
  onClose: () => void;
  onRedeem: (coupon: Coupon) => Promise<string | void>;
  isRedeemed: boolean;
}

export const CouponModal: React.FC<CouponModalProps> = ({ coupon, onClose, onRedeem, isRedeemed }) => {
  const [step, setStep] = useState<'details' | 'code' | 'success'>(isRedeemed ? 'code' : 'details');
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [verificationCode, setVerificationCode] = useState<string | null>(null);
  const user = getCurrentUser();

  useEffect(() => {
      if (!user) return;
      
      const userUsage = user.history?.filter(h => h.couponId === coupon.id).length || 0;
      const limit = coupon.limitPerUser || 1;
      
      if (userUsage >= limit && !isRedeemed) {
          setError(`Você já atingiu o limite de ${limit} cupom(ns) por pessoa.`);
      }

      if (coupon.maxRedemptions && (coupon.currentRedemptions || 0) >= coupon.maxRedemptions && !isRedeemed) {
          setError("Este lote de cupons esgotou!");
      }
  }, [user, coupon, isRedeemed]);

  const handleGetCode = () => {
      setStep('code');
  };

  const handleValidateFinal = async () => {
    if (!user) return setError("Faça login para validar.");
    setIsValidating(true);
    try {
        const vCode = await onRedeem(coupon); 
        if (vCode && typeof vCode === 'string') {
            setVerificationCode(vCode);
        }
        setStep('success');
    } catch (e: any) {
        setError(e.message || "Erro ao validar. Tente novamente.");
    } finally {
        setIsValidating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4 animate-in fade-in">
      <div className="bg-white w-full md:max-w-md md:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl h-[90vh] md:h-auto flex flex-col">
        
        {step === 'success' ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-in zoom-in duration-300">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white mb-4 shadow-xl shadow-green-500/40">
                    <Check size={40} strokeWidth={4} />
                </div>
                <h2 className="text-2xl font-bold text-ocean-950 mb-2">Cupom Resgatado! 🎉</h2>
                <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                    Economia de R$ {(coupon.originalPrice - coupon.discountedPrice).toFixed(2)} adicionada à sua carteira!
                </p>

                {verificationCode && (
                    <div className="w-full bg-slate-50 border-2 border-dashed border-ocean-200 p-6 rounded-2xl mb-6 text-center">
                        <p className="text-[10px] font-black text-ocean-400 uppercase tracking-[0.2em] mb-2">Código de Verificação</p>
                        <p className="text-4xl font-mono font-black text-ocean-950 tracking-widest">{verificationCode}</p>
                        <p className="text-[9px] text-slate-400 mt-3 uppercase font-bold">Apresente este código no estabelecimento</p>
                    </div>
                )}

                <div className="bg-ocean-50 border border-ocean-100 p-4 rounded-xl mb-6 w-full text-left">
                    <p className="text-ocean-700 text-[11px] font-medium leading-relaxed">
                        ✅ O comprovante foi salvo no seu <strong>Perfil</strong>.<br/>
                        ✅ O estabelecimento pode solicitar o código acima para validar seu desconto.
                    </p>
                </div>
                
                <button 
                    onClick={onClose}
                    className="w-full bg-ocean-600 text-white font-bold py-4 rounded-xl hover:bg-ocean-700 transition-colors shadow-lg shadow-ocean-600/20"
                >
                    CONCLUÍDO
                </button>
            </div>
        ) : (
            <>
                <div className="relative h-56 shrink-0">
                  <img src={coupon.imageUrl} className="w-full h-full object-cover" alt="Coupon" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <button onClick={onClose} className="absolute top-4 right-4 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 backdrop-blur-sm">
                    <X size={20} />
                  </button>
                  
                  <div className="absolute bottom-4 left-4 text-white">
                     <span className="bg-gold-500 text-ocean-950 text-[10px] font-bold px-2 py-1 rounded mb-2 inline-block uppercase">
                        {coupon.category}
                     </span>
                     <h2 className="text-2xl font-bold leading-tight">{coupon.companyName}</h2>
                  </div>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                   {step === 'details' ? (
                     <>
                       <h3 className="text-xl font-bold text-ocean-900 mb-2">{coupon.title}</h3>
                       <p className="text-slate-600 text-sm mb-6 leading-relaxed">{coupon.description}</p>
                       
                       <div className="space-y-4 mb-8">
                          <div className="flex items-start gap-3">
                              <div className="bg-ocean-50 p-2 rounded-lg text-ocean-500"><MapPin size={20} /></div>
                              <div>
                                  <p className="font-bold text-ocean-900 text-sm">Onde usar</p>
                                  <p className="text-slate-500 text-xs">{coupon.address || 'Endereço disponível no mapa'}</p>
                              </div>
                          </div>
                          <div className="flex items-start gap-3">
                              <div className="bg-ocean-50 p-2 rounded-lg text-ocean-500"><Clock size={20} /></div>
                              <div>
                                  <p className="font-bold text-ocean-900 text-sm">Validade</p>
                                  <p className="text-slate-500 text-xs">Até {new Date(coupon.expiryDate).toLocaleDateString('pt-BR')}</p>
                              </div>
                          </div>
                          <div className="flex items-start gap-3">
                              <div className="bg-ocean-50 p-2 rounded-lg text-ocean-500"><FileText size={20} /></div>
                              <div>
                                  <p className="font-bold text-ocean-900 text-sm">Regras</p>
                                  <ul className="text-slate-500 text-xs list-disc pl-4 space-y-1 mt-1">
                                     {coupon.rules ? coupon.rules.map((r, i) => <li key={i}>{r}</li>) : <li>Consumo no local</li>}
                                     {coupon.limitPerUser && <li>Limite de {coupon.limitPerUser} por pessoa</li>}
                                  </ul>
                              </div>
                          </div>
                       </div>

                       <div className="bg-slate-50 rounded-xl p-4 flex justify-between items-center border border-slate-100">
                           <div>
                               <p className="text-slate-400 text-xs line-through">De R$ {coupon.originalPrice.toFixed(2)}</p>
                               <p className="text-green-600 font-bold text-2xl">R$ {coupon.discountedPrice.toFixed(2)}</p>
                           </div>
                           <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                               -{coupon.discountPercentage}% OFF
                           </div>
                       </div>
                     </>
                   ) : (
                     <div className="flex flex-col items-center justify-center h-full py-8 text-center animate-in slide-in-from-bottom-10">
                         <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
                             <Check size={40} strokeWidth={3} />
                         </div>
                         <h3 className="text-2xl font-bold text-ocean-900 mb-2">Código do Cupom</h3>
                         <p className="text-slate-500 text-sm mb-8">Apresente este código no caixa.</p>
                         
                         <div className="bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl p-6 w-full mb-6 relative group cursor-pointer" onClick={() => navigator.clipboard.writeText(coupon.code)}>
                             <p className="text-3xl font-mono font-bold text-ocean-900 tracking-widest">{coupon.code}</p>
                             <p className="text-left md:text-center text-[10px] text-slate-400 mt-2 uppercase">Toque para copiar</p>
                             <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400">
                                <Copy size={16}/>
                             </div>
                         </div>

                         <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl text-xs w-full text-left">
                             ⚠️ <strong>Atenção:</strong> A economia de <strong>R$ {(coupon.originalPrice - coupon.discountedPrice).toFixed(2)}</strong> só será adicionada à sua Carteira Inteligente após clicar no botão Validar abaixo.
                         </div>
                     </div>
                   )}
                </div>

                <div className="p-4 border-t border-slate-100 bg-white">
                    {step === 'details' ? (
                        error ? (
                            <div className="w-full bg-red-50 border border-red-100 text-red-600 font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm">
                                <AlertTriangle size={18} />
                                {error}
                            </div>
                        ) : (
                            <button 
                                onClick={handleGetCode}
                                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all"
                            >
                                PEGAR CUPOM
                            </button>
                        )
                    ) : (
                        <button 
                            onClick={handleValidateFinal}
                            disabled={isValidating}
                            className="w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            {isValidating ? <Loader2 className="animate-spin" size={24} /> : "VALIDAR & ECONOMIZAR"}
                        </button>
                    )}
                </div>
            </>
        )}
      </div>
    </div>
  );
};
