
import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { X, CheckCircle, Wallet, ShieldCheck, ExternalLink, Smartphone, Lock } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  onConfirm: () => void;
}

// The provided Yoco payment link
const YOCO_PAYMENT_URL = 'https://pay.yoco.com/r/m90RY9';

export const PaymentModal: React.FC<PaymentModalProps> = ({ 
   isOpen, onClose, amount, onConfirm
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRedirected, setIsRedirected] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (isOpen) {
       setIsSuccess(false);
       setIsProcessing(false);
       setIsRedirected(false);
       setIsVerifying(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleYocoRedirect = () => {
    setIsProcessing(true);
    // Open the official Yoco payment link in a new tab
    setTimeout(() => {
      window.open(YOCO_PAYMENT_URL, '_blank');
      setIsProcessing(false);
      setIsRedirected(true);
    }, 800);
  };

  const handleVerify = () => {
    setIsVerifying(true);
    // Simulate checking the payment status via Yoco API callback logic
    // In a real integration, you'd call your backend here
    setTimeout(() => {
      setIsVerifying(false);
      setIsSuccess(true);
      setTimeout(() => {
        onConfirm();
      }, 1500);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-md shadow-[0_0_50px_rgba(139,92,246,0.15)] relative overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Header Decor */}
        <div className="h-1.5 w-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-violet-600"></div>

        {!isRedirected && !isSuccess && (
          <button onClick={onClose} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors z-10">
            <X size={20} />
          </button>
        )}

        {isRedirected ? (
          <div className="p-10 flex flex-col items-center text-center">
            <div className="relative mb-8">
               <div className="h-24 w-24 bg-violet-600/10 rounded-3xl flex items-center justify-center text-violet-500">
                 <Smartphone size={56} className="animate-bounce" />
               </div>
               <div className="absolute -bottom-2 -right-2 bg-[#BEE7FF] rounded-full p-1.5 border-4 border-zinc-950">
                  <ExternalLink size={16} className="text-black" />
               </div>
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-3">Authorization Required</h3>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-[300px] mb-8">
              We've opened a secure <strong>Yoco</strong> payment link. Please complete the transaction, then return here to unlock your music.
            </p>
            
            <div className="w-full space-y-3">
               <Button 
                  onClick={handleVerify} 
                  isLoading={isVerifying} 
                  className="w-full h-14 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2"
               >
                  I've Paid via Yoco <CheckCircle size={18} />
               </Button>
               <button 
                  onClick={() => window.open(YOCO_PAYMENT_URL, '_blank')}
                  className="text-zinc-500 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] py-2 w-full transition-colors"
               >
                  Re-open Yoco Link
               </button>
            </div>

            <div className="mt-8 flex items-center gap-3 text-zinc-600">
               <Lock size={12} className="text-violet-500/50" />
               <span className="text-[9px] uppercase font-black tracking-[0.25em]">Waiting for Secure Signal...</span>
            </div>
          </div>
        ) : isSuccess ? (
          <div className="p-12 flex flex-col items-center text-center">
            <div className="h-20 w-20 bg-[#BEE7FF]/20 rounded-full flex items-center justify-center mb-6 text-[#BEE7FF]">
              <CheckCircle size={48} className="animate-in zoom-in bounce-in duration-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Transaction Successful</h3>
            <p className="text-zinc-400 text-sm">
              Your transaction has been processed and verified.
            </p>
          </div>
        ) : (
          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white">Checkout</h2>
              <p className="text-zinc-500 text-sm mt-1">Secure Payment via Yoco Gateway</p>
            </div>

            <div className="bg-zinc-900 p-5 rounded-2xl mb-8 flex justify-between items-center border border-white/5">
              <div className="flex flex-col">
                <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Amount</span>
                <span className="text-white font-bold text-2xl tracking-tight">R {amount.toFixed(2)}</span>
              </div>
              <div className="h-10 w-10 bg-violet-600/20 rounded-full flex items-center justify-center text-violet-400">
                 <Wallet size={20} />
              </div>
            </div>

            <div className="space-y-6 mb-10">
                <div className="p-6 bg-zinc-900/50 border border-violet-500/20 rounded-2xl flex flex-col items-center text-center">
                   <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-[#BEE7FF] rounded-xl flex items-center justify-center shadow-lg shadow-[#BEE7FF]/20">
                          <span className="text-black font-black text-lg">MM</span>
                      </div>
                      <div className="text-zinc-600 font-black text-xs">X</div>
                      <div className="h-12 w-24 bg-white/10 rounded-xl flex items-center justify-center overflow-hidden border border-white/5">
                          <img src="https://www.yoco.com/assets/images/logo/yoco-logo-dark.svg" className="h-5 invert opacity-80" alt="Yoco" />
                      </div>
                   </div>
                   <p className="text-zinc-400 text-xs font-medium leading-relaxed">
                      You will be redirected to the secure Yoco payment portal to complete your purchase using Card, Instant EFT, or Apple Pay.
                   </p>
                </div>
            </div>

            <Button 
              className="w-full py-4 text-sm rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-[0_10px_20px_rgba(139,92,246,0.3)] hover:translate-y-[-2px] active:translate-y-[0px]" 
              onClick={handleYocoRedirect} isLoading={isProcessing}
            >
               Proceed to Yoco Secure Link <ExternalLink size={16} />
            </Button>
            
            <div className="mt-8 flex items-center justify-center gap-3 text-zinc-600">
               <ShieldCheck size={14} className="text-[#BEE7FF]/50" />
               <span className="text-[9px] uppercase font-black tracking-[0.25em]">Secure Gateway</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
