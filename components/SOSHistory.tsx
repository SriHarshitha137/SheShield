
import React, { useState } from 'react';
import { SOSLog } from '../types';

interface SOSHistoryProps {
  logs: SOSLog[];
  onClose: () => void;
}

export const SOSHistory: React.FC<SOSHistoryProps> = ({ logs, onClose }) => {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-[200] bg-white flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden">
      <div className="p-6 border-b flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div>
          <h2 className="text-2xl font-black text-gray-900">SOS History</h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Forensic Evidence Vault</p>
        </div>
        <button 
          onClick={onClose}
          className="h-12 w-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-600 active:scale-90 transition"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gray-50">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 space-y-4">
            <i className="fas fa-folder-open text-5xl opacity-20"></i>
            <p className="text-sm font-medium">No emergency logs recorded yet.</p>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col transition-all active:scale-[0.98]">
              <div className="p-5 flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                      {log.id}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <i className="fas fa-location-dot text-red-500 text-xs"></i>
                    {log.address}
                  </h3>
                </div>
                <div className={`h-2 w-2 rounded-full ${log.status === 'synced' ? 'bg-green-500' : 'bg-orange-500'}`} title={log.status}></div>
              </div>

              <div className="grid grid-cols-2 gap-px bg-gray-100 border-y border-gray-100">
                <a 
                  href={`https://www.google.com/maps?q=${log.location.latitude},${log.location.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white p-4 flex items-center justify-center gap-2 text-xs font-bold text-gray-600 hover:text-indigo-600 transition"
                >
                  <i className="fas fa-map-marked-alt"></i>
                  View Map
                </a>
                <button 
                  onClick={() => setActiveVideo(log.evidenceUrl || null)}
                  className="bg-white p-4 flex items-center justify-center gap-2 text-xs font-bold text-gray-600 hover:text-red-500 transition"
                >
                  <i className="fas fa-video"></i>
                  View Evidence
                </button>
              </div>

              <div className="p-4 bg-gray-50/50">
                 <div className="flex justify-between items-center text-[9px] font-black uppercase text-gray-400 tracking-widest">
                    <span>PCR Contacts: {log.notifiedContacts.length}</span>
                    <span>112: {log.dialedNumbers.includes('112') ? 'DIALED' : 'N/A'}</span>
                 </div>
              </div>
            </div>
          ))
        )}
      </div>

      {activeVideo && (
        <div className="fixed inset-0 z-[210] bg-black/95 flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="w-full max-w-xl aspect-video bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl relative">
            <video 
              src={activeVideo} 
              autoPlay 
              controls 
              className="w-full h-full object-contain"
            />
            <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
              Forensic Replay
            </div>
          </div>
          <button 
            onClick={() => setActiveVideo(null)}
            className="mt-8 bg-white text-black px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest active:scale-95 transition"
          >
            Close Player
          </button>
        </div>
      )}
    </div>
  );
};
