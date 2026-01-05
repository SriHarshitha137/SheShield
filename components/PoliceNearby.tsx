
import React from 'react';

interface PoliceNearbyProps {
  stations: any[];
  isLoading: boolean;
  isActive: boolean;
  isOnline: boolean;
}

export const PoliceNearby: React.FC<PoliceNearbyProps> = ({ stations, isLoading, isActive, isOnline }) => {
  if (!isActive && stations.length === 0) return null;

  return (
    <div className={`p-6 rounded-3xl shadow-xl transition-all h-full flex flex-col min-h-[400px] ${isActive ? 'bg-indigo-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="flex items-center justify-between mb-6 flex-none">
        <div className="space-y-1">
          <h3 className="text-xl font-bold">Nearest Help (India)</h3>
          <p className="text-[9px] font-black uppercase tracking-widest opacity-60">GPS Grounded Response</p>
        </div>
        {isLoading && (
          <div className="flex items-center gap-2 text-xs font-medium animate-pulse">
            <i className="fas fa-satellite fa-spin text-indigo-400"></i>
            Grounding...
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="space-y-4">
          {isOnline ? (
            stations.length > 0 ? (
              stations.map((station, idx) => (
                <a 
                  key={idx} 
                  href={station.uri || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`block p-4 rounded-2xl transition-all border group ${isActive ? 'bg-indigo-800/50 border-indigo-700 hover:bg-indigo-700' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                         <div className={`h-2 w-2 rounded-full ${station.source === 'Google Maps' ? 'bg-green-500' : 'bg-indigo-400'}`}></div>
                         <p className="font-bold text-sm leading-tight group-hover:underline">
                          {station.name}
                        </p>
                      </div>
                      <p className={`text-[10px] opacity-70 line-clamp-1`}>{station.address || 'Navigation link ready'}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[8px] font-black uppercase tracking-widest bg-white/10 px-1.5 py-0.5 rounded">
                          {station.source || 'Verified Source'}
                        </span>
                        {station.type === 'OFFICIAL_STATION' && (
                          <span className="text-[8px] font-black uppercase tracking-widest bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">
                            <i className="fas fa-check-circle mr-1"></i>Official
                          </span>
                        )}
                      </div>
                    </div>
                    <i className="fas fa-arrow-up-right-from-square text-xs opacity-40 group-hover:opacity-100 transition-opacity"></i>
                  </div>
                </a>
              ))
            ) : (
              !isLoading && isActive && (
                <div className="text-center py-12 opacity-50 flex flex-col items-center">
                  <i className="fas fa-location-crosshairs text-4xl mb-3 animate-pulse"></i>
                  <p className="text-sm font-bold uppercase tracking-widest">Triangulating Stations...</p>
                </div>
              )
            )
          ) : (
            <div className="bg-indigo-800/40 p-5 rounded-2xl border border-indigo-700">
              <div className="flex items-center gap-3 mb-3">
                <i className="fas fa-info-circle text-indigo-300"></i>
                <p className="text-sm font-bold">Offline Protocol</p>
              </div>
              <p className="text-xs opacity-80 leading-relaxed mb-4">
                Live Maps grounding requires internet. System has locked onto your last known GPS coordinates for emergency service guidance.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase opacity-60">
                  <span>GPS Grounding Status</span>
                  <span>Active (Cached)</span>
                </div>
                <div className="h-1 bg-indigo-700 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-400 w-full animate-pulse"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {isActive && (
        <div className="space-y-2 mt-6 flex-none">
          <p className="text-[10px] font-bold text-center opacity-50 uppercase tracking-widest">Emergency Call override active</p>
          <button 
            onClick={() => window.location.href = 'tel:112'}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl shadow-lg flex items-center justify-center gap-3 active:scale-95 transition"
          >
            <i className="fas fa-phone-alt"></i>
            CALL EMERGENCY (112)
          </button>
        </div>
      )}
    </div>
  );
};
