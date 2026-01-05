
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { SOSButton } from './components/SOSButton';
import { LiveFeed } from './components/LiveFeed';
import { EmergencyContacts } from './components/EmergencyContacts';
import { PoliceNearby } from './components/PoliceNearby';
import { Settings } from './components/Settings';
import { Login } from './components/Login';
import { CalculatorDisguise } from './components/CalculatorDisguise';
import { AdminDashboard } from './components/AdminDashboard';
import { EngineeringBlueprint } from './components/EngineeringBlueprint';
import { SecurityAuthModal } from './components/SecurityAuthModal';
import { SOSHistory } from './components/SOSHistory';
import { AppState, Contact, Location, UserSettings, NetworkStatus, ContactDispatchStatus, SOSLog } from './types';
import { findNearbyPoliceStations, getAddressFromCoords } from './services/geminiService';
import { telephonyService } from './services/telephonyService';
import { authService, UserProfile } from './services/authService';
import { apiService } from './services/apiService';

const DEFAULT_SETTINGS: UserSettings = {
  userName: 'User',
  voiceTriggerEnabled: true,
  aiSafetyEnabled: true,
  autoRecordVideo: true,
  autoRecordAudio: true,
  tapThreshold: 3,
  smsTemplate: "EMERGENCY: I am in danger. Direct 112 Call Initiated. Tracking via She Shield.",
  secretModeEnabled: false,
  adminAccess: false,
  biometricEnabled: true
};

const DEFAULT_CONTACTS: Contact[] = [
  { id: '1', name: 'ERSS India', phone: '112' }
];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(authService.getCurrentUser());
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [location, setLocation] = useState<Location | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [networkInfo, setNetworkInfo] = useState<NetworkStatus>(telephonyService.getNetworkIntelligence());
  const [isStrobing, setIsStrobing] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isBlueprintOpen, setIsBlueprintOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [history, setHistory] = useState<SOSLog[]>([]);
  
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('sheshield_contacts');
    return saved ? JSON.parse(saved) : DEFAULT_CONTACTS;
  });

  const [policeStations, setPoliceStations] = useState<any[]>([]);
  const [isSearchingPolice, setIsSearchingPolice] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [dispatchProgress, setDispatchProgress] = useState<Record<string, 'pending' | 'sending' | 'sent' | 'error'>>({});
  
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('sheshield_settings');
    const base = saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    return currentUser ? { ...base, userName: currentUser.name } : base;
  });

  const isTriggering = useRef(false);
  const recognitionRef = useRef<any>(null);
  const isRecognitionStarting = useRef(false);
  const lastShakeTime = useRef<number>(0);
  const shakeCount = useRef<number>(0);

  // USER-SPECIFIC DATA SYNC
  useEffect(() => {
    if (currentUser) {
      setHistory(apiService.getHistory(currentUser.id));
      setSettings(prev => ({ ...prev, userName: currentUser.name }));
    } else {
      setHistory([]);
    }
  }, [currentUser, isHistoryOpen, appState]);

  useEffect(() => {
    const updateNetwork = () => {
      const intel = telephonyService.getNetworkIntelligence();
      setIsOnline(navigator.onLine);
      setNetworkInfo(intel);
      if (navigator.onLine && currentUser) apiService.syncPendingLogs(currentUser.id);
    };
    window.addEventListener('online', updateNetwork);
    window.addEventListener('offline', updateNetwork);
    const interval = setInterval(updateNetwork, 5000);
    return () => {
      window.removeEventListener('online', updateNetwork);
      window.removeEventListener('offline', updateNetwork);
      clearInterval(interval);
    };
  }, [currentUser]);

  const triggerSOS = useCallback(async () => {
    if (appState === AppState.EMERGENCY || isTriggering.current) return;
    
    isTriggering.current = true;
    setAppState(AppState.EMERGENCY);
    setIsStrobing(true);
    
    const dialedNumbers: string[] = [];
    const notifiedContacts: ContactDispatchStatus[] = [];
    
    telephonyService.startSiren();
    telephonyService.startDistressVoice(location);
    
    const callStarted = telephonyService.initiateProgrammaticCall('112');
    if (callStarted) {
      setIsCallActive(true);
      dialedNumbers.push('112');
    }

    const pos = await new Promise<Location | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (p) => resolve({ latitude: p.coords.latitude, longitude: p.coords.longitude, accuracy: p.coords.accuracy, timestamp: p.timestamp }),
        () => resolve(location),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    });
    if (pos) setLocation(pos);
    
    const finalLoc = pos || location;
    
    let readableAddress = "Locating...";
    if (finalLoc) {
      readableAddress = await getAddressFromCoords(finalLoc.latitude, finalLoc.longitude);
    }

    const locStr = finalLoc ? `https://maps.google.com/?q=${finalLoc.latitude},${finalLoc.longitude}` : "Locating...";
    const message = `${settings.smsTemplate}\n\nUser: ${currentUser?.name}\nStatus: Call Initiated\nLocation: ${readableAddress}\nLink: ${locStr}`;
    
    const initialProgress: Record<string, 'pending' | 'sending' | 'sent' | 'error'> = {};
    contacts.forEach(c => initialProgress[c.id] = 'pending');
    setDispatchProgress(initialProgress);

    const dispatchPromises = contacts.map(async (contact) => {
      setDispatchProgress(prev => ({ ...prev, [contact.id]: 'sending' }));
      try {
        let success = false;
        if (networkInfo.preferredMode === 'CLOUD') {
          success = await telephonyService.dispatchCloudMessage(contact, message);
        } else {
          telephonyService.triggerNativeSMS(contact.phone, message);
          success = true; 
        }
        
        const status = success ? 'sent' : 'error';
        setDispatchProgress(prev => ({ ...prev, [contact.id]: status }));
        notifiedContacts.push({
          name: contact.name, phone: contact.phone, status, timestamp: new Date().toISOString()
        });
      } catch (err) {
        setDispatchProgress(prev => ({ ...prev, [contact.id]: 'error' }));
        notifiedContacts.push({
          name: contact.name, phone: contact.phone, status: 'error', timestamp: new Date().toISOString()
        });
      }
    });

    await Promise.all(dispatchPromises);

    if (finalLoc && currentUser) {
      await apiService.logSOS(currentUser.id, currentUser.name, finalLoc, isOnline, dialedNumbers, notifiedContacts, readableAddress);
      setHistory(apiService.getHistory(currentUser.id)); 
    }

    if (isOnline && finalLoc) {
      setIsSearchingPolice(true);
      const res = await findNearbyPoliceStations(finalLoc.latitude, finalLoc.longitude);
      setPoliceStations(res);
      setIsSearchingPolice(false);
    }
  }, [contacts, location, settings, currentUser, isOnline, networkInfo, appState]);

  const stopSOS = () => {
    isTriggering.current = false;
    setAppState(settings.secretModeEnabled ? AppState.DISGUISED : AppState.IDLE);
    setPoliceStations([]);
    setDispatchProgress({});
    setIsStrobing(false);
    setIsAuthModalOpen(false);
    setIsCallActive(false);
    telephonyService.stopSiren();
    telephonyService.stopDistressVoice();
    telephonyService.stopSignalMonitoring();
  };

  const handleSafeRequest = () => {
    if (authService.hasPinSet()) setIsAuthModalOpen(true);
    else stopSOS();
  };

  // Kinetic Guard (Shake Trigger)
  useEffect(() => {
    if (appState === AppState.EMERGENCY) return;
    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;
      const mag = Math.sqrt((acc.x || 0) ** 2 + (acc.y || 0) ** 2 + (acc.z || 0) ** 2);
      if (mag > 28) {
        const now = Date.now();
        if (now - lastShakeTime.current < 800) shakeCount.current++;
        else shakeCount.current = 1;
        lastShakeTime.current = now;
        if (shakeCount.current >= 4) { triggerSOS(); shakeCount.current = 0; }
      }
    };
    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [appState, triggerSOS]);

  // RESILIENT ACOUSTIC GUARD (Voice Trigger)
  // Re-engineered to handle browser-level aborts and lifecycle interruptions
  useEffect(() => {
    const isEmergency = appState === AppState.EMERGENCY;
    let shouldListen = true;

    const stopRecognition = () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // Already stopped
        }
        recognitionRef.current = null;
      }
      setIsVoiceActive(false);
      isRecognitionStarting.current = false;
    };

    if (!currentUser || !settings.voiceTriggerEnabled || isEmergency) {
      stopRecognition();
      return;
    }

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) return;

    const startRecognition = () => {
      if (!shouldListen || isRecognitionStarting.current || isEmergency) return;
      
      isRecognitionStarting.current = true;
      const rec = new SpeechRec();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-IN';

      rec.onstart = () => {
        if (shouldListen) {
          setIsVoiceActive(true);
        }
        isRecognitionStarting.current = false;
      };

      rec.onerror = (event: any) => {
        const errCode = event.error;
        console.warn(`[Acoustic Guard] Engine Status: ${errCode}`);
        
        // Handle common mobile/browser silent errors without surfacing to user
        if (errCode === 'aborted' || errCode === 'no-speech' || errCode === 'audio-capture') {
          isRecognitionStarting.current = false;
          return; 
        }
        
        if (errCode === 'not-allowed' || errCode === 'service-not-allowed') {
          shouldListen = false;
          setIsVoiceActive(false);
        }
        isRecognitionStarting.current = false;
      };

      rec.onresult = (e: any) => {
        if (!shouldListen || isEmergency) return;
        let transcript = '';
        for (let i = e.resultIndex; i < e.results.length; ++i) {
          transcript += e.results[i][0].transcript;
        }
        
        const full = transcript.toLowerCase();
        // High-precision trigger matching
        const triggers = [
          /\bhelp\s+help\b/i, 
          /\bdanger\b/i, 
          /\bbachao\b/i, 
          /\bemergency\b/i, 
          /\bhelp\s+me\b/i
        ];

        if (triggers.some(regex => regex.test(full))) {
          triggerSOS();
        }
      };

      rec.onend = () => {
        setIsVoiceActive(false);
        isRecognitionStarting.current = false;
        
        // Watchdog Restart Logic: Recovers from 'aborted' or silent timeouts
        if (shouldListen && settings.voiceTriggerEnabled && !isEmergency) {
          setTimeout(() => {
            if (shouldListen && !isVoiceActive) {
              try {
                startRecognition();
              } catch (err) {
                // Instance already exists or busy
              }
            }
          }, 2000); // 2s Buffer to allow audio hardware to flush
        }
      };

      try {
        rec.start();
        recognitionRef.current = rec;
      } catch (e) {
        isRecognitionStarting.current = false;
      }
    };

    startRecognition();

    return () => {
      shouldListen = false;
      stopRecognition();
    };
  }, [settings.voiceTriggerEnabled, appState, triggerSOS, currentUser]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => setLocation({ 
        latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: pos.coords.accuracy, timestamp: pos.timestamp 
      }));
    }
  }, []);

  useEffect(() => {
    let int: any;
    if (isStrobing) int = setInterval(() => { document.body.classList.toggle('bg-red-900'); document.body.classList.toggle('bg-white'); }, 100);
    else document.body.classList.remove('bg-red-900', 'bg-white');
    return () => clearInterval(int);
  }, [isStrobing]);

  if (!currentUser) return <Login onLoginSuccess={setCurrentUser} />;
  if (appState === AppState.DISGUISED) return <CalculatorDisguise onUnlock={() => setAppState(AppState.IDLE)} />;

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${appState === AppState.EMERGENCY ? 'bg-red-950 text-white' : 'bg-gray-50'}`}>
      <Header 
        appState={appState} 
        onOpenSettings={() => setIsSettingsOpen(true)} 
        userName={currentUser.name}
        onLogout={() => { authService.logout(); setCurrentUser(null); setAppState(AppState.IDLE); }}
        isVoiceActive={isVoiceActive}
      />
      
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 space-y-6 pb-40 overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-center gap-4 py-2 opacity-60">
           <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="India Emblem" className="h-8" />
           <div className="h-6 w-px bg-gray-300"></div>
           <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Ministry of Home Affairs • She Shield SOS</p>
        </div>

        <div className="flex justify-center gap-4">
          {settings.adminAccess && (
            <button onClick={() => setIsAdminOpen(true)} className="bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-700 transition flex items-center gap-2">
              <i className="fas fa-tower-broadcast"></i> Admin Center
            </button>
          )}
          <button onClick={() => setIsBlueprintOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-indigo-700 transition flex items-center gap-2 shadow-lg shadow-indigo-500/20">
            <i className="fas fa-microchip"></i> System Architecture
          </button>
        </div>

        <div className={`p-6 rounded-3xl shadow-xl transition-all border ${appState === AppState.EMERGENCY ? 'bg-red-900/50 border-red-700' : 'bg-white border-transparent'}`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold flex items-center gap-3">
                {appState === AppState.EMERGENCY ? 'SOS PROTOCOL ACTIVE' : `Active Monitor: ${currentUser.name}`}
              </h2>
              <div className="flex flex-wrap items-center gap-3">
                <p className="opacity-80 text-sm">
                  {appState === AppState.EMERGENCY 
                    ? (isCallActive ? 'Direct 112 Connection Established' : 'Waiting for GSM latch...') 
                    : 'System armed for Kinetic and Acoustic triggers.'}
                </p>
              </div>
            </div>
            {appState === AppState.EMERGENCY && (
              <button onClick={handleSafeRequest} className="bg-white text-red-600 px-6 py-2 rounded-full font-bold shadow-lg hover:bg-gray-100 transition">
                I AM SAFE
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="space-y-8 h-full flex flex-col">
            <LiveFeed isActive={appState === AppState.EMERGENCY && settings.autoRecordVideo} />
            <EmergencyContacts 
              contacts={contacts} 
              onAddContact={(c) => setContacts(prev => [...prev, c])}
              onRemoveContact={(id) => setContacts(prev => prev.filter(c => c.id !== id))}
              disabled={appState === AppState.EMERGENCY} 
              dispatchProgress={dispatchProgress}
            />
          </div>
          <div className="space-y-8 h-full flex flex-col">
            <SOSButton onTrigger={triggerSOS} isActive={appState === AppState.EMERGENCY} isOnline={isOnline} />
            <PoliceNearby stations={policeStations} isLoading={isSearchingPolice} isActive={appState === AppState.EMERGENCY} isOnline={isOnline} />
          </div>
        </div>
      </main>

      {appState !== AppState.EMERGENCY && (
        <button 
          onClick={() => setIsHistoryOpen(true)}
          className="fixed bottom-24 right-6 w-16 h-16 bg-white text-indigo-600 rounded-full shadow-2xl flex items-center justify-center text-xl border border-gray-100 z-40 active:scale-90 transition-all active:shadow-indigo-200"
          title="SOS History"
        >
          <i className="fas fa-clock-rotate-left"></i>
          {history.length > 0 && (
             <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white">
               {history.length}
             </span>
          )}
        </button>
      )}

      <Settings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} settings={settings} onUpdate={setSettings} />
      {isAdminOpen && <AdminDashboard onClose={() => setIsAdminOpen(false)} />}
      {isBlueprintOpen && <EngineeringBlueprint onClose={() => setIsBlueprintOpen(false)} />}
      {isHistoryOpen && <SOSHistory logs={history} onClose={() => setIsHistoryOpen(false)} />}
      
      <SecurityAuthModal 
        isOpen={isAuthModalOpen}
        onSuccess={stopSOS}
        onCancel={() => setIsAuthModalOpen(false)}
        biometricEnabled={settings.biometricEnabled}
      />

      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-gray-100 z-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${location ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest">
                {location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : 'Locating...'}
              </span>
            </div>
            <div className="h-3 w-px bg-gray-200"></div>
            <div className="flex items-end gap-[1px] h-3">
              {[1, 2, 3, 4].map(bar => (
                <div key={bar} className={`w-[3px] rounded-t-sm transition-all ${bar <= networkInfo.signalLevel ? 'bg-indigo-600' : 'bg-gray-200'}`} style={{ height: `${bar * 25}%` }} />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-6 text-[9px] font-black uppercase tracking-widest">
            <span className={`${isOnline ? 'text-green-600' : 'text-orange-500'} flex items-center gap-1.5`}>
              <i className={`fas ${isOnline ? 'fa-tower-cell' : 'fa-satellite-dish'}`}></i>
              {isOnline ? networkInfo.effectiveType.toUpperCase() : 'OFFLINE'}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
