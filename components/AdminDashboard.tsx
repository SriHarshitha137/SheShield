
import React, { useState, useEffect } from 'react';
import { SOSLog } from '../types';
import { apiService } from '../services/apiService';
import { authService } from '../services/authService';

interface AdminDashboardProps {
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const [history, setHistory] = useState<SOSLog[]>([]);

  useEffect(() => {
    // Fix: Providing the current user's ID to apiService.getHistory as required by its definition.
    const user = authService.getCurrentUser();
    if (user) {
      setHistory(apiService.getHistory(user.id));
    }
  }, []);

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900 text-white p-6 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-4">
          <div className="bg-orange-600 p-3 rounded-xl">
            <i className="fas fa-tower-broadcast text-xl"></i>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">ERSS CENTRAL <span className="text-orange-600">DASHBOARD</span></h1>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">National Emergency Response Control (IN-MH-7)</p>
          </div>
        </div>
        <button onClick={onClose} className="bg-slate-800 hover:bg-slate-700 p-4 rounded-2xl transition">
          <i className="fas fa-times"></i>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-grow overflow-hidden">
        <div className="lg:col-span-2 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Live Incoming Alerts</h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
              <span className="text-[10px] font-bold text-green-500 uppercase">Live Monitoring</span>
            </div>
          </div>
          
          {history.length === 0 ? (
            <div className="bg-slate-800/50 rounded-3xl p-12 text-center border-2 border-dashed border-slate-700">
              <i className="fas fa-shield-halved text-5xl text-slate-600 mb-4"></i>
              <p className="text-slate-400">No active emergency logs found in this sector.</p>
            </div>
          ) : (
            history.map(log => (
              <div key={log.id} className="bg-slate-800 border border-slate-700 rounded-3xl p-6 flex flex-col gap-6 group hover:border-orange-500/50 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-orange-600/20 text-orange-600 rounded-full flex items-center justify-center font-bold">
                      {log.userName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{log.userName} <span className="text-xs text-slate-500 font-normal">({log.id})</span></h3>
                      <p className="text-slate-400 text-xs font-mono">{new Date(log.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${log.status === 'synced' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                    {log.status}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-900 p-4 rounded-2xl space-y-1 relative overflow-hidden">
                    <p className="text-[9px] text-slate-500 font-black uppercase">Coordinates</p>
                    <p className="text-sm font-mono text-orange-400">{log.location.latitude.toFixed(6)}, {log.location.longitude.toFixed(6)}</p>
                    {log.location.accuracy && (
                      <div className="absolute top-2 right-2 bg-orange-500/10 px-1.5 py-0.5 rounded text-[8px] font-bold text-orange-500">
                        ±{Math.round(log.location.accuracy)}m
                      </div>
                    )}
                  </div>
                  <div className="bg-slate-900 p-4 rounded-2xl space-y-1">
                    <p className="text-[9px] text-slate-500 font-black uppercase">Automated Calls</p>
                    <div className="flex flex-wrap gap-1">
                      {log.dialedNumbers.length > 0 ? log.dialedNumbers.map((num, i) => (
                        <span key={i} className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                          <i className="fas fa-phone-alt mr-1 text-[10px]"></i>{num}
                        </span>
                      )) : <span className="text-xs text-slate-600">No calls initiated</span>}
                    </div>
                  </div>
                  <div className="bg-slate-900 p-4 rounded-2xl space-y-1">
                    <p className="text-[9px] text-slate-500 font-black uppercase">Dispatch Accuracy</p>
                    <p className="text-sm font-mono text-slate-300">UID-{log.userId.slice(0,8)}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Message Dispatch Log</h4>
                  <div className="space-y-2">
                    {log.notifiedContacts.map((contact, i) => (
                      <div key={i} className="flex items-center justify-between bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${contact.status === 'sent' ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
                          <div>
                            <p className="text-xs font-bold text-slate-200">{contact.name}</p>
                            <p className="text-[10px] text-slate-500 font-mono">{contact.phone}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-[9px] font-black uppercase tracking-widest ${contact.status === 'sent' ? 'text-green-500' : 'text-red-500'}`}>
                            {contact.status === 'sent' ? 'DELIVERED' : 'FAILED'}
                          </p>
                          <p className="text-[8px] text-slate-600">{new Date(contact.timestamp).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 rounded-xl text-xs transition uppercase tracking-widest shadow-lg shadow-orange-950/20">Dispatch PCR</button>
                  <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2.5 rounded-xl text-xs transition uppercase tracking-widest">Contact User</button>
                  <a 
                    href={`https://www.google.com/maps?q=${log.location.latitude},${log.location.longitude}`} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 bg-slate-700 hover:bg-slate-600 text-white flex items-center rounded-xl transition"
                  >
                    <i className="fas fa-map-location-dot"></i>
                  </a>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-8">
          <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Sector Health</h3>
            <div className="space-y-6">
              {[
                { label: 'Cloud Gateway', value: 'Operational', color: 'text-green-500' },
                { label: 'ERSS Node IN-MH', value: 'Active', color: 'text-green-500' },
                { label: 'Satellite Uplink', value: 'Connected', color: 'text-green-500' },
                { label: 'Emergency Trunk', value: 'Ready', color: 'text-green-500' },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center">
                  <span className="text-sm text-slate-300">{item.label}</span>
                  <span className={`text-[10px] font-black uppercase ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-orange-600 rounded-3xl p-6 text-white space-y-4 shadow-xl shadow-orange-950/20">
             <div className="flex items-center gap-3">
               <i className="fas fa-triangle-exclamation text-2xl"></i>
               <h3 className="font-black text-sm uppercase tracking-widest">Active Protocol</h3>
             </div>
             <p className="text-xs opacity-80 leading-relaxed font-medium">
               Forensic Logging Protocol is active. All SOS pulses are recorded locally before transmission. 
               Cross-referencing GSM tower data with GPS telemetry for 3m resolution.
             </p>
          </div>

          <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Precision Metrics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-400 font-bold uppercase">Avg. Accuracy</span>
                <span className="text-orange-500 font-black">7.4 Meters</span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div className="bg-orange-500 h-full w-[85%]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
