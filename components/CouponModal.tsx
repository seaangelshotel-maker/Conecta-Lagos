
import React, { useState, useEffect } from 'react';
import { X, MapPin, Clock, FileText, Check, Copy, AlertTriangle, Loader2 } from 'lucide-react';
import { Coupon } from '../types';
import { getCurrentUser } from '../services/dataService';
import { useWallet } from '../services/walletService';
import { couponSaving, formatBRL, percentOff } from '../services/walletRules';

const getCleanErrorMessage = (message: string): string => {
  try {
    const parsed = JSON.parse(message);
    if (parsed && parsed.error) {
      if (typeof parsed.error === 'string') {
        if (parsed.error.toLowerCase().includes('permission-denied') || 
            parsed.error.toLowerCase().includes('permission') || 
            parsed.error.toLowerCase().includes('insufficient')) {
          return "Permissão negada ou erro de validação. Verifique suas credenciais de acesso.";
        }
        return parsed.error;
      }
    }
  } catch {
    // Not a JSON message, return original
  }
  return message;
};

interface CouponModalProps {
  coupon: Coupon;
  onClose: () => void;
  onRedeem: (coupon: Coupon) => Promise<string | void>;
  isRedeemed: boolean;
}

export const CouponModal: React.FC<CouponModalProps> = ({ coupon, onClose, onRedeem, isRedeemed }) => {
  const [step, setStep] = useState<'details' | 'success'>('details');
  const [error, setError] = useState<string | null>(null);
  const [isGetting, setIsGetting] = useState(false);
  const [verificationCode, setVerificationCode] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const user = getCurrentUser();
  const { items: myRedemptions } = useWallet(user?.id);
  const gallery = coupon.gallery && coupon.gallery.length > 0 ? coupon.gallery : [coupon.imageUrl];
  const saving = couponSaving(coupon);

  useEffect(() => {
      if (!user || step === 'success') return;

      const userUsage = myRedemptions.filter(r => r.couponId === coupon.id).length;
      const limit = coupon.limitPerUser || 1;

      if (userUsage >= limit && !isRedeemed) {
          setError(`Você já atingiu o limite de ${limit} cupom(ns) por pessoa.`);
      }

      if (coupon.maxRedemptions && (coupon.currentRedemptions || 0) >= coupon.maxRedemptions && !isRedeemed) {
          setError("Este lote de cupons esgotou!");
      }
  }, [user, coupon, isRedeemed, myRedemptions, step]);

  // Um passo só: pegar o cupom reserva o resgate e já mostra o código de 6 dígitos.
  // A economia entra na carteira quando o estabelecimento confirma esse código.
  const handleGetCoupon = async () => {
    if (!user) return setError("Faça login para pegar o cupom.");
    setError(null);
    setIsGetting(true);
    try {
        const vCode = await onRedeem(coupon);
        if (vCode && typeof vCode === 'string') {
            setVerificationCode(vCode);
        }
        setStep('success');
    } catch (e: any) {
        setError(e.message || "Erro ao pegar o cupom. Tente novamente.");
    } finally {
        setIsGetting(false);
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
                <h2 className="text-2xl font-bold text-ocean-950 mb-2">Cupom reservado! 🎉</h2>
                <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                    Mostre o código abaixo no estabelecimento. Quando ele confirmar, <strong className="text-emerald-600">{formatBRL(saving)}</strong> entram na sua Carteira de Economia.
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
                        ✅ O cupom está guardado no seu <strong>Perfil</strong>, em Cupons.<br/>
                        ✅ O estabelecimento digita o código acima para confirmar seu desconto.
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
                <div className="relative h-56 shrink-0 group">
                  <div className="w-full h-full relative overflow-hidden">
                      {gallery.map((img, idx) => (
                          <img 
                              key={idx}
                              src={img} 
                              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${idx === currentSlide ? 'opacity-100' : 'opacity-0'}`} 
                              alt={`Coupon gallery ${idx + 1}`} 
                          />
                      ))}
                  </div>

                  {gallery.length > 1 && (
                      <>
                          <button 
                              onClick={(e) => { e.stopPropagation(); setCurrentSlide(prev => (prev === 0 ? gallery.length - 1 : prev - 1)); }}
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
                          >
                              <span className="text-xs font-bold leading-none">&lt;</span>
                          </button>
                          <button 
                              onClick={(e) => { e.stopPropagation(); setCurrentSlide(prev => (prev === gallery.length - 1 ? 0 : prev + 1)); }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
                          >
                              <span className="text-xs font-bold leading-none">&gt;</span>
                          </button>
                          
                          <div className="absolute bottom-4 right-4 flex gap-1 z-10">
                              {gallery.map((_, idx) => (
                                  <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentSlide ? 'bg-white w-3' : 'bg-white/50'}`} />
                              ))}
                          </div>
                      </>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                  <button onClick={onClose} className="absolute top-4 right-4 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 backdrop-blur-sm z-10 transition-colors">
                    <X size={20} />
                  </button>
                  
                  <div className="absolute bottom-4 left-4 text-white z-10 pr-12">
                     <span className="bg-gold-500 text-ocean-950 text-[10px] font-bold px-2 py-1 rounded mb-2 inline-block uppercase tracking-wider">
                        {coupon.category}
                     </span>
                     <h2 className="text-2xl font-black leading-tight drop-shadow-md">{coupon.companyName}</h2>
                  </div>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                   <>                       <h3 className="text-xl font-bold text-ocean-900 mb-2">{coupon.title}</h3>
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
                                  <p className="text-slate-500 text-xs">Até {new Date(coupon.expiryDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
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
                               -{percentOff(coupon)}% OFF
                           </div>
                       </div>
                       {saving > 0 && (
                           <div className="mt-3 bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center justify-between" data-testid="modal-saving">
                               <span className="text-[11px] font-black text-emerald-700 uppercase tracking-wider">Você economiza</span>
                               <span className="text-xl font-black text-emerald-600">{formatBRL(saving)}</span>
                           </div>
                       )}
                     </>
                </div>

                <div className="p-4 border-t border-slate-100 bg-white space-y-3">
                    {error && (
                        <div className="w-full bg-red-50 border border-red-100 text-red-600 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs md:text-sm animate-in fade-in duration-200">
                            <AlertTriangle size={18} className="shrink-0 text-red-500" />
                            <span className="text-left leading-snug">{getCleanErrorMessage(error)}</span>
                        </div>
                    )}
                    {!error && (
                        <button 
                            onClick={handleGetCoupon}
                            disabled={isGetting}
                            data-testid="get-coupon"
                            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            {isGetting ? <Loader2 className="animate-spin" size={24} /> : "PEGAR CUPOM"}
                        </button>
                    )}
                </div>
            </>
        )}
      </div>
    </div>
  );
};
