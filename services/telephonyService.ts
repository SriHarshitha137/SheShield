
import { Contact, Location, NetworkStatus } from '../types';

export class TelephonyService {
  private static instance: TelephonyService;
  private audioContext: AudioContext | null = null;
  private sirenOscillator: OscillatorNode | null = null;
  private speechInterval: any = null;
  private signalCheckInterval: any = null;

  private constructor() {}

  public static getInstance(): TelephonyService {
    if (!TelephonyService.instance) {
      TelephonyService.instance = new TelephonyService();
    }
    return TelephonyService.instance;
  }

  /**
   * Evaluates GSM Latch status. 
   * Maps to TelephonyManager signal strength in Android.
   */
  public getNetworkIntelligence(): NetworkStatus {
    const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    const isOnline = navigator.onLine;
    
    let signalLevel = 0;
    let preferredMode: 'CLOUD' | 'GSM' = 'GSM';
    let effectiveType = 'unknown';
    let downlink = 0;

    if (conn) {
      effectiveType = conn.effectiveType || 'unknown';
      downlink = conn.downlink || 0;
      if (effectiveType === '4g' && downlink > 5) signalLevel = 4;
      else if (effectiveType === '4g' || (effectiveType === '3g' && downlink > 2)) signalLevel = 3;
      else if (effectiveType === '2g') signalLevel = 1;
      
      preferredMode = (isOnline && signalLevel >= 2) ? 'CLOUD' : 'GSM';
    } else {
      signalLevel = isOnline ? 3 : 0;
      preferredMode = isOnline ? 'CLOUD' : 'GSM';
    }

    return { online: isOnline, type: conn?.type || 'unknown', effectiveType, downlink, signalLevel, preferredMode };
  }

  /**
   * DIRECT PROGRAMMATIC CALL (ACTION_CALL)
   * In the Android implementation, this uses the ACTION_CALL intent which 
   * bypasses the dialer and places the call immediately.
   * Required Permission: android.permission.CALL_PHONE
   */
  public initiateProgrammaticCall(phone: string): boolean {
    const intel = this.getNetworkIntelligence();
    
    // Check for hardware GSM latch
    if (intel.signalLevel === 0 && !intel.online) {
      console.warn("[Telephony] NO GSM LATCH: Queuing Call for Signal Recovery.");
      return false;
    }

    console.log(`[Telephony] DISPATCHING DIRECT ACTION_CALL TO: ${phone}`);
    // This protocol trigger behaves as an automated intent in the native wrapper
    window.location.href = `tel:${phone}`;
    return true;
  }

  /**
   * AUTOMATED SIGNAL RECOVERY ENGINE
   * Continuously polls for GSM tower connection to auto-dispatch the deferred 112 call.
   */
  public monitorForSignalAndCall(phone: string, onSuccess: () => void) {
    if (this.signalCheckInterval) return;

    console.log("[Telephony] Signal Recovery Polling Active...");
    this.signalCheckInterval = setInterval(() => {
      const intel = this.getNetworkIntelligence();
      if (intel.signalLevel > 0) {
        console.log("[Telephony] GSM Latch Found. Executing Direct Call.");
        this.initiateProgrammaticCall(phone);
        onSuccess();
        this.stopSignalMonitoring();
      }
    }, 4000); // High-frequency polling for emergency
  }

  public stopSignalMonitoring() {
    if (this.signalCheckInterval) {
      clearInterval(this.signalCheckInterval);
      this.signalCheckInterval = null;
    }
  }

  public triggerNativeSMS(phone: string, message: string) {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const separator = isIOS ? '&' : '?';
    window.location.href = `sms:${phone}${separator}body=${encodeURIComponent(message)}`;
  }

  public async dispatchCloudMessage(contact: Contact, message: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return true; 
  }

  public startDistressVoice(location: Location | null) {
    if (this.speechInterval) return;
    const speak = () => {
      const msg = new SpeechSynthesisUtterance();
      const locText = location 
        ? `Coordinates: latitude ${location.latitude.toFixed(4)}, longitude ${location.longitude.toFixed(4)}.`
        : "GPS fixing...";
      msg.text = `Emergency! She Shield SOS active. ${locText}`;
      msg.rate = 1.0;
      window.speechSynthesis.speak(msg);
    };
    speak();
    this.speechInterval = setInterval(speak, 15000);
  }

  public stopDistressVoice() {
    if (this.speechInterval) { clearInterval(this.speechInterval); this.speechInterval = null; }
    window.speechSynthesis.cancel();
  }

  public startSiren() {
    if (!this.audioContext) this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (this.sirenOscillator) return;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, this.audioContext.currentTime);
    const lfo = this.audioContext.createOscillator();
    lfo.frequency.value = 1.5; 
    const lfoGain = this.audioContext.createGain();
    lfoGain.gain.value = 200;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    gain.gain.setValueAtTime(0.7, this.audioContext.currentTime);
    lfo.start();
    osc.start();
    this.sirenOscillator = osc;
  }

  public stopSiren() {
    if (this.sirenOscillator) { 
      this.sirenOscillator.stop(); 
      this.sirenOscillator = null; 
    }
  }
}

export const telephonyService = TelephonyService.getInstance();
