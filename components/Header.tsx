
import React from 'react';
import { AppState } from '../types';

interface HeaderProps {
  appState: AppState;
  onOpenSettings: () => void;
  userName: string;
  onLogout: () => void;
  isVoiceActive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ appState, onOpenSettings, userName, onLogout, isVoiceActive }) => {
  return (
    <header className={`sticky top-0 z-50 transition-colors duration-300 ${appState === AppState.EMERGENCY ? 'bg-red-950 border-red-800' : 'bg-white border-gray-100'} border-b px-6 py-4`}>
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl ${appState === AppState.EMERGENCY ? 'bg-red-600' : 'bg-indigo-600 shadow-indigo-100 shadow-lg'}`}>
            <i className="fas fa-shield-heart text-white text-xl"></i>
          </div>
          <h1 className={`text-xl font-bold tracking-tight ${appState === AppState.EMERGENCY ? 'text-white' : 'text-gray-900'}`}>
            SHE SHIELD<span className="text-indigo-500">SOS</span>
          </h1>
        </div>
        
        <nav className="flex items-center gap-4 sm:gap-6">
          {isVoiceActive && appState !== AppState.EMERGENCY && (
             <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 animate-pulse">
               <i className="fas fa-microphone text-xs"></i>
               <span className="text-[10px] font-black uppercase tracking-widest hidden lg:inline">Voice Guard</span>
             </div>
          )}

          <button 
            onClick={onOpenSettings}
            className={`text-sm font-bold hover:opacity-70 transition flex items-center gap-2 ${appState === AppState.EMERGENCY ? 'text-white' : 'text-gray-600'}`}
          >
            <i className="fas fa-cog"></i>
            <span className="hidden sm:inline">Settings</span>
          </button>
          
          <button 
            onClick={onLogout}
            className={`text-sm font-bold hover:text-red-500 transition flex items-center gap-2 ${appState === AppState.EMERGENCY ? 'text-white' : 'text-gray-400'}`}
            title="Log out"
          >
            <i className="fas fa-sign-out-alt"></i>
          </button>

          <div className="flex items-center gap-3 border-l border-gray-100 pl-4 sm:pl-6">
            <div className="hidden md:block text-right">
              <p className={`text-[10px] font-bold uppercase tracking-widest ${appState === AppState.EMERGENCY ? 'text-red-400' : 'text-gray-400'}`}>Protected User</p>
              <p className={`text-sm font-bold ${appState === AppState.EMERGENCY ? 'text-white' : 'text-gray-900'}`}>{userName}</p>
            </div>
            <div className={`h-10 w-10 rounded-full overflow-hidden border-2 flex-shrink-0 ${appState === AppState.EMERGENCY ? 'border-red-500' : 'border-gray-100'}`}>
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`} alt="Profile" />
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};
