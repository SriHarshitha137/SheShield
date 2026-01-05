
import React, { useState } from 'react';

export const EngineeringBlueprint: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'mobile' | 'backend' | 'logic'>('mobile');

  return (
    <div className="fixed inset-0 z-[250] bg-zinc-950 text-zinc-300 overflow-hidden flex flex-col font-mono">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <i className="fas fa-microchip"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">ENGINEERING BLUEPRINT <span className="text-indigo-500">v5.0</span></h1>
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Direct Action Protocol • Technical Defense</p>
          </div>
        </div>
        <button onClick={onClose} className="h-10 w-10 flex items-center justify-center rounded-lg hover:bg-zinc-800 transition border border-zinc-800">
          <i className="fas fa-times"></i>
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Nav */}
        <div className="w-64 border-r border-zinc-800 bg-zinc-900/30 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('mobile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'mobile' ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-zinc-800 text-zinc-500'}`}
          >
            <i className="fas fa-mobile-screen"></i> Mobile Stack
          </button>
          <button 
            onClick={() => setActiveTab('logic')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'logic' ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-zinc-800 text-zinc-500'}`}
          >
            <i className="fas fa-diagram-project"></i> Core Logic
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {activeTab === 'mobile' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <section className="space-y-4">
                <div className="flex items-center gap-3 text-white">
                  <i className="fas fa-phone-volume text-indigo-500"></i>
                  <h2 className="text-sm font-black uppercase tracking-widest">Mandatory Direct Call Execution</h2>
                </div>
                
                <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 space-y-4">
                  <p className="text-xs leading-relaxed">
                    Unlike standard applications that utilize <code className="text-red-400">ACTION_DIAL</code> (requiring a manual user tap to initiate), She Shield SOS utilizes the <code className="text-green-400">ACTION_CALL</code> protocol.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-red-950/20 rounded-xl border border-red-900/50">
                      <p className="text-[9px] font-bold uppercase mb-2">Manual Redirection</p>
                      <pre className="text-[10px] text-red-400 opacity-60">Intent(Intent.ACTION_DIAL)</pre>
                      <p className="text-[9px] mt-2 italic text-zinc-500">Requires secondary interaction. Fatal in high-stress trauma.</p>
                    </div>
                    <div className="p-4 bg-green-950/20 rounded-xl border border-green-900/50">
                      <p className="text-[9px] font-bold uppercase mb-2">Programmatic Dispatch</p>
                      <pre className="text-[10px] text-green-400">Intent(Intent.ACTION_CALL)</pre>
                      <p className="text-[9px] mt-2 italic text-zinc-400 font-bold">Automatic socket connection. ZERO manual interaction.</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-indigo-600/10 border-2 border-dashed border-indigo-500/50 p-8 rounded-[2rem] space-y-4">
                <div className="flex items-center gap-3">
                  <i className="fas fa-graduation-cap text-indigo-500 text-2xl"></i>
                  <h3 className="text-white font-bold">Viva Defense: Forensic Dispatch</h3>
                </div>
                <div className="text-sm leading-relaxed text-zinc-300 space-y-4 italic">
                  "Our system solves the critical 'redirection gap'. By implementing the <b>ACTION_CALL</b> intent with <b>android.permission.CALL_PHONE</b>, we ensure the 112 connection is established programmaticially. In zero-signal environments, our <b>Signal Recovery Latch</b> engine continuously polls for GSM tower connection, auto-dispatching the emergency call the millisecond signal is detected. This ensures that even if the user is compromised, the dispatch happens without further human input."
                </div>
              </section>
            </div>
          )}
          
          {activeTab === 'logic' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <section className="space-y-4">
                <div className="flex items-center gap-3 text-white">
                  <i className="fas fa-list-check text-indigo-500"></i>
                  <h2 className="text-sm font-black uppercase tracking-widest">Audit Trail & Forensic Persistence</h2>
                </div>
                <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 space-y-6">
                  <p className="text-xs text-zinc-400">The system implements a Write-Ahead Logging (WAL) pattern for emergency data.</p>
                  <ul className="text-xs space-y-4 text-zinc-300">
                    <li className="flex gap-4">
                      <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold">1</div>
                      <p><span className="text-white font-bold">EVENT CAPTURE:</span> LocalStorage commits location, timestamp, and dialed number intent (112) BEFORE network dispatch.</p>
                    </li>
                    <li className="flex gap-4">
                      <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold">2</div>
                      <p><span className="text-white font-bold">TELEPHONY HANDOVER:</span> ACTION_CALL is dispatched. Status: "Initiated".</p>
                    </li>
                    <li className="flex gap-4">
                      <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold">3</div>
                      <p><span className="text-white font-bold">BACKGROUND SYNC:</span> Once signal returns, forensic logs are pushed to the Admin Dashboard for PCR coordination.</p>
                    </li>
                  </ul>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
