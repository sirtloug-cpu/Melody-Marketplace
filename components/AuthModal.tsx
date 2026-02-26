import React, { useState } from 'react';
import { Button } from './Button';
import { Lock, Music, X } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  fetchProfile: (userId: string) => void;
  initialMode?: 'LOGIN' | 'SIGNUP';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, fetchProfile, initialMode = 'LOGIN' }) => {
  const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP' | 'RESET_PASSWORD'>(initialMode);
  
  // Reset mode when modal opens/closes or initialMode changes
  React.useEffect(() => {
    if (isOpen) {
      setAuthMode(initialMode);
    }
  }, [isOpen, initialMode]);

  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthLoading(true);
    try {
      if (authMode === 'SIGNUP') {
        const { data, error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: { data: { full_name: authName, is_artist: true } }
        });
        if (error) throw error;
        if (data.session) {
          fetchProfile(data.session.user.id);
          onClose();
        } else {
          setAuthError('Check your email to confirm signup.');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword
        });
        if (error) throw error;
        if (data.session) {
          fetchProfile(data.session.user.id);
          onClose();
        }
      }
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setResetSuccessMessage('');
    setIsAuthLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(authEmail, {
        redirectTo: window.location.href,
      });
      if (error) throw error;
      setResetSuccessMessage('Password reset link sent! Please check your email inbox.');
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-4 backdrop-blur-xl">
      <div className="bg-zinc-900 p-8 rounded-[2rem] max-w-md w-full border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-300 relative">
         <button onClick={onClose} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors">
            <X size={24} />
         </button>
         <div className="text-center mb-8">
            <div className="h-20 w-20 bg-[#BEE7FF] rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl shadow-[#BEE7FF]/20">
              {authMode === 'RESET_PASSWORD' ? <Lock size={36} className="text-black" /> : <Music size={40} className="text-black" />}
           </div>
           <h1 className="text-3xl font-black text-white tracking-tight">{authMode === 'RESET_PASSWORD' ? 'Reset Password' : 'Join Melody'}</h1>
           <p className="text-zinc-500 text-sm mt-2">{authMode === 'RESET_PASSWORD' ? 'Enter your email to receive a reset link.' : "South Africa's Home for Artists"}</p>
         </div>
         {authError && <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-xl mb-6 text-xs font-bold text-center">{authError}</div>}
         {authMode === 'RESET_PASSWORD' && resetSuccessMessage && <div className="bg-[#BEE7FF]/10 border border-[#BEE7FF]/50 text-[#BEE7FF] p-4 rounded-xl mb-6 text-xs font-bold text-center">{resetSuccessMessage}</div>}
         {authMode === 'RESET_PASSWORD' ? (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <input type="email" placeholder="Email Address" required value={authEmail} onChange={e => setAuthEmail(e.target.value)} className="w-full bg-zinc-800 border-none rounded-2xl p-4 text-sm text-white focus:ring-2 focus:ring-[#BEE7FF] placeholder:text-zinc-600" />
              <Button type="submit" className="w-full py-4 text-sm rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-[#BEE7FF]/20 bg-[#BEE7FF] text-black hover:bg-[#A0D8FF]" isLoading={isAuthLoading}>Send Reset Link</Button>
              <button type="button" onClick={() => { setAuthMode('LOGIN'); setAuthError(''); setResetSuccessMessage(''); }} className="w-full text-zinc-500 hover:text-white text-xs font-bold tracking-wide mt-4">Back to Login</button>
            </form>
         ) : (
            <form onSubmit={handleAuth} className="space-y-4">
              {authMode === 'SIGNUP' && <input type="text" placeholder="Full Name" required value={authName} onChange={e => setAuthName(e.target.value)} className="w-full bg-zinc-800 border-none rounded-2xl p-4 text-sm text-white focus:ring-2 focus:ring-[#BEE7FF] placeholder:text-zinc-600" />}
              <input type="email" placeholder="Email Address" required value={authEmail} onChange={e => setAuthEmail(e.target.value)} className="w-full bg-zinc-800 border-none rounded-2xl p-4 text-sm text-white focus:ring-2 focus:ring-[#BEE7FF] placeholder:text-zinc-600" />
              <div className="space-y-1">
                 <input type="password" placeholder="Password" required value={authPassword} onChange={e => setAuthPassword(e.target.value)} className="w-full bg-zinc-800 border-none rounded-2xl p-4 text-sm text-white focus:ring-2 focus:ring-[#BEE7FF] placeholder:text-zinc-600" />
                 {authMode === 'LOGIN' && <div className="flex justify-end px-1"><button type="button" onClick={() => { setAuthMode('RESET_PASSWORD'); setAuthError(''); }} className="text-[10px] font-bold text-zinc-500 hover:text-[#BEE7FF] transition-colors">Forgot Password?</button></div>}
              </div>
              <Button type="submit" className="w-full py-4 text-sm rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-[#BEE7FF]/20 bg-[#BEE7FF] text-black hover:bg-[#A0D8FF]" isLoading={isAuthLoading}>{authMode === 'LOGIN' ? 'Sign In' : 'Sign Up'}</Button>
            </form>
         )}
         {authMode !== 'RESET_PASSWORD' && <button onClick={() => setAuthMode(authMode === 'LOGIN' ? 'SIGNUP' : 'LOGIN')} className="mt-8 w-full text-zinc-500 hover:text-white text-xs font-bold tracking-wide">{authMode === 'LOGIN' ? "DON'T HAVE AN ACCOUNT? SIGN UP" : "ALREADY HAVE AN ACCOUNT? SIGN IN"}</button>}
      </div>
    </div>
  );
};
