
import React, { useState } from 'react';
import { UserSettings } from '../types';
import { authService } from '../services/authService';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdate: (settings: UserSettings) => void;
}

export const Settings: React.FC<SettingsProps> = ({ isOpen, onClose, settings, onUpdate }) => {
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [pinStatus, setPinStatus] = useState<'idle' | 'success'>('idle');

  if (!isOpen) return null;

  const handleChange = (key: keyof UserSettings, value: any) => {
    onUpdate({ ...settings, [key]: value });
  };

  const handleSavePin = () => {
    if (newPin.length >= 4) {
      authService.setSecurityPin(newPin);
      setPinStatus('success');
      setTimeout(() => {
        setPinStatus('idle');
        setIsSettingPin(false);
        setNewPin('');
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="bg-indigo-600 p-8 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">System Guard</h2>
            <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mt-1 opacity-70">Security Configurations</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Security PIN Section */}
          <section className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Termination Security</h3>
            <div className="bg-red-50 p-6 rounded-3xl space-y-4 border border-red-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-800">Safety Lock PIN</p>
                  <p className="text-[10px] text-red-600 font-bold uppercase tracking-tight">
                    {authService.hasPinSet() ? 'Lock Status: ACTIVE' : 'Lock Status: NOT SET'}
                  </p>
                </div>
                <button 
                  onClick={() => setIsSettingPin(true)}
                  className="bg-white text-red-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase border border-red-200"
                >
                  {authService.hasPinSet() ? 'Change PIN' : 'Setup PIN'}
                </button>
              </div>

              {isSettingPin && (
                <div className="space-y-3 animate-in slide-in-from-top duration-300">
                  <input 
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter 4-6 Digit PIN"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-white border border-red-200 rounded-xl p-3 text-center text-xl font-black tracking-widest outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={handleSavePin}
                      disabled={newPin.length < 4}
                      className="flex-1 bg-red-600 text-white py-2 rounded-xl text-xs font-bold disabled:opacity-50"
                    >
                      {pinStatus === 'success' ? 'PIN SAVED' : 'CONFIRM PIN'}
                    </button>
                    <button 
                      onClick={() => setIsSettingPin(false)}
                      className="px-4 bg-gray-200 text-gray-600 py-2 rounded-xl text-xs font-bold"
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between pt-2 border-t border-red-100">
                <div>
                  <p className="text-sm font-bold text-gray-800">Biometric Unlock</p>
                  <p className="text-[10px] text-gray-500 font-medium uppercase">Fingerprint / Face ID</p>
                </div>
                <button 
                  onClick={() => handleChange('biometricEnabled', !settings.biometricEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.biometricEnabled ? 'bg-red-500' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.biometricEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </section>

          {/* AI Detection */}
          <section className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Core Intelligence</h3>
            <div className="bg-orange-50 p-6 rounded-3xl space-y-4 border border-orange-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-800">AI Smart Detection</p>
                  <p className="text-[10px] text-orange-600 font-bold uppercase tracking-tight">Autonomous SOS Trigger</p>
                </div>
                <button 
                  onClick={() => handleChange('aiSafetyEnabled', !settings.aiSafetyEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.aiSafetyEnabled ? 'bg-orange-500' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.aiSafetyEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </section>

          {/* Voice Trigger */}
          <section className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Audio Surveillance</h3>
            <div className="bg-indigo-50 p-6 rounded-3xl space-y-4 border border-indigo-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-800">Voice Distress Trigger</p>
                  <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-tight">Listen for "Help Help"</p>
                </div>
                <button 
                  onClick={() => handleChange('voiceTriggerEnabled', !settings.voiceTriggerEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.voiceTriggerEnabled ? 'bg-indigo-600' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.voiceTriggerEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </section>
        </div>

        <div className="p-8 border-t border-gray-100 bg-gray-50">
          <button 
            onClick={onClose}
            className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition active:scale-[0.98] uppercase tracking-widest text-sm"
          >
            Apply Guard Settings
          </button>
        </div>
      </div>
    </div>
  );
};
