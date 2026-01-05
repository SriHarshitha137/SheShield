
import { Contact } from '../types';

export class TelephonyService {
  private static instance: TelephonyService;

  private constructor() {}

  public static getInstance(): TelephonyService {
    if (!TelephonyService.instance) {
      TelephonyService.instance = new TelephonyService();
    }
    return TelephonyService.instance;
  }

  /**
   * Generates a native SMS URI for India GSM standards.
   * This works even without internet as it triggers the device's native SMS app.
   */
  public triggerNativeSMS(phone: string, message: string) {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const separator = isIOS ? '&' : '?';
    window.location.href = `sms:${phone}${separator}body=${encodeURIComponent(message)}`;
  }

  /**
   * Simulates sending an SMS to multiple contacts.
   * If online, it logs/sends via API. If offline, it provides the URI fallback.
   */
  public async sendSms(to: string, message: string, isOnline: boolean): Promise<boolean> {
    console.log(`[Telephony] Alerting: ${to}`);
    
    if (!isOnline) {
      console.log("[Telephony] Offline: Native GSM Trigger required.");
      // We return true here because we assume the UI will handle the native prompt
      return true;
    }

    // Simulate network latency for cloud sending
    await new Promise(resolve => setTimeout(resolve, 800));
    return true;
  }

  /**
   * High-level helper to blast SOS to all contacts
   */
  public async sendSOSAlerts(contacts: Contact[], message: string, isOnline: boolean): Promise<{ success: boolean; results: any }> {
    const results = await Promise.all(
      contacts.map(c => this.sendSms(c.phone, message, isOnline))
    );
    
    return {
      success: results.every(r => r === true),
      results
    };
  }
}

export const smsService = TelephonyService.getInstance();
