
import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';

interface SecurityAuthModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  biometricEnabled: boolean;
}

export const SecurityAuthModal: React.FC<SecurityAuthModalProps> = ({ 
  isOpen, 
  onSuccess, 
  onCancel,
  biometricEnabled
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [biometricStatus, setBiometricStatus] = useState<'idle' | 'scanning' | 'failed'>('idle');

  useEffect(() => {
    if (isOpen && biometricEnabled) {
      handleBiometric();
    }
  }, [isOpen]);

  const handleBiometric = async () => {
    setBiometricStatus('scanning');
    // Simulate Android BiometricPrompt logic
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real environment, we'd call navigator.credentials.get() or native bridge
    const success = Math.random() > 0.1; // 90% mock success rate
    if (success) {
      onSuccess();
    } else {
      setBiometricStatus('failed');
      setTimeout(() => setBiometricStatus('idle'), 2000);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (authService.verifySecurityPin(pin)) {
      onSuccess();
    } else {
      setError(true);
      setPin('');
      setTimeout(() => setError(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-red-950/80 backdrop-blur-xl animate-in fade-in duration-300" />
      
      <div className={`relative w-full max-w-sm bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] p-8 shadow-2xl text-white transition-all ${error ? 'animate-shake border-red-500' : ''}`}>
        <div className="text-center space-y-4 mb-8">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-red-600/20">
            <i className="fas fa-lock-keyhole text-2xl"></i>
          </div>
          <h2 className="text-2xl font-black tracking-tight">Security Lock</h2>
          <p className="text-sm opacity-80 font-medium">Authentication required to terminate Emergency SOS Protocol.</p>
        </div>

        {biometricEnabled && (
          <button 
            onClick={handleBiometric}
            className={`w-full mb-6 py-4 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all ${
              biometricStatus === 'scanning' ? 'bg-indigo-600 animate-pulse' : 
              biometricStatus === 'failed' ? 'bg-red-600' : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            <i className={`fas ${biometricStatus === 'scanning' ? 'fa-fingerprint' : 'fa-face-smile'} text-3xl`}></i>
            <span className="text-[10px] font-black uppercase tracking-widest">
              {biometricStatus === 'scanning' ? 'Verifying Hardware...' : 'Touch Biometric Scanner'}
            </span>
          </button>
        )}

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
            <span className="px-2 bg-transparent text-white/40">OR ENTER PIN</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input 
            autoFocus
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            placeholder="••••••"
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-center text-3xl font-black tracking-[0.5em] focus:ring-2 focus:ring-red-500 outline-none transition"
          />

          <div className="flex flex-col gap-3">
            <button 
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl shadow-xl transition active:scale-95 uppercase tracking-widest text-xs"
            >
              Verify Safety
            </button>
            <button 
              type="button"
              onClick={onCancel}
              className="w-full text-white/40 hover:text-white/60 text-[10px] font-black uppercase tracking-widest py-2"
            >
              Return to SOS View
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 text-center text-red-400 text-[10px] font-black uppercase tracking-widest animate-pulse">
            Invalid Safety PIN. Siren Active.
          </div>
        )}
      </div>
    </div>
  );
};
