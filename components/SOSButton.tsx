
import React from 'react';

interface SOSButtonProps {
  onTrigger: () => void;
  isActive: boolean;
  isOnline: boolean;
}

export const SOSButton: React.FC<SOSButtonProps> = ({ onTrigger, isActive, isOnline }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 bg-white p-8 rounded-3xl shadow-xl h-full">
      <h3 className="text-xl font-bold text-gray-800">Emergency Trigger</h3>
      <p className="text-center text-gray-500 text-sm max-w-xs">
        {isOnline 
          ? "Instant Cloud & GSM Alerts. Police will be notified via Satellite." 
          : "Offline Mode: SOS will trigger direct Call to 112 and SMS to contacts."}
      </p>
      
      <button 
        onClick={onTrigger}
        className={`
          w-48 h-48 rounded-full flex flex-col items-center justify-center gap-2
          transition-all duration-300 active:scale-90
          ${isActive 
            ? 'bg-red-600 text-white sos-pulse' 
            : 'bg-red-500 hover:bg-red-600 text-white shadow-2xl shadow-red-200'}
        `}
      >
        <span className="text-4xl font-black tracking-widest">SOS</span>
        <span className="text-xs font-bold uppercase tracking-tighter opacity-80">
          {isActive ? 'ALERT ACTIVE' : 'TAP TO ALERT'}
        </span>
      </button>

      {!isOnline && !isActive && (
        <div className="bg-orange-50 text-orange-600 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse border border-orange-100">
          <i className="fas fa-phone-alt mr-1"></i> Direct 112 Call Ready
        </div>
      )}

      <div className="flex gap-4">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <i className="fas fa-satellite-dish"></i>
          <span>GSM Ready</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <i className="fas fa-map-marker-alt"></i>
          <span>GPS Active</span>
        </div>
      </div>
    </div>
  );
};
