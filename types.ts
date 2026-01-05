
export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
}

export interface UserSettings {
  userName: string;
  voiceTriggerEnabled: boolean;
  aiSafetyEnabled: boolean;
  autoRecordVideo: boolean;
  autoRecordAudio: boolean;
  tapThreshold: number;
  smsTemplate: string;
  secretModeEnabled: boolean;
  adminAccess: boolean;
  securityPin?: string; // Hashed PIN
  biometricEnabled: boolean;
}

export interface NetworkStatus {
  online: boolean;
  type: string;
  effectiveType: string;
  downlink: number;
  signalLevel: number;
  preferredMode: 'CLOUD' | 'GSM';
}

export enum AppState {
  IDLE = 'IDLE',
  EMERGENCY = 'EMERGENCY',
  RECORDING = 'RECORDING',
  DISGUISED = 'DISGUISED',
  AWAITING_AUTH = 'AWAITING_AUTH'
}

export interface ContactDispatchStatus {
  name: string;
  phone: string;
  status: 'sent' | 'error' | 'pending';
  timestamp: string;
}

export interface SOSLog {
  id: string;
  userId: string;
  userName: string;
  timestamp: string;
  location: Location;
  address?: string; // Human readable location
  status: 'pending' | 'synced';
  evidenceUrl?: string; // Pointer to recorded video evidence
  dialedNumbers: string[]; // History of numbers called
  notifiedContacts: ContactDispatchStatus[]; // Detailed history of message recipients
}

export interface SensorTelemetry {
  gForce: number;
  isMoving: boolean;
  speed: number;
  audioTranscript?: string;
  lastRoutineDeviation?: boolean;
  timestamp: number;
}

export interface AISafetyResponse {
  emergency_detected: boolean;
  confidence_score: number;
  reasoning: string;
  action_required: 'SOS_ALERT' | 'USER_CHECK_IN' | 'MONITOR';
}
