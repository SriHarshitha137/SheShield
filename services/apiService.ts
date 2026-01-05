
import { Location, SOSLog, ContactDispatchStatus } from '../types';

const QUEUE_KEY = 'sheshield_offline_queue';
const getHistoryKey = (userId: string) => `sheshield_sos_history_${userId}`;

export const apiService = {
  getQueue: (): SOSLog[] => {
    const saved = localStorage.getItem(QUEUE_KEY);
    return saved ? JSON.parse(saved) : [];
  },

  addToQueue: (log: SOSLog) => {
    const queue = apiService.getQueue();
    queue.push(log);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  },

  clearQueue: () => {
    localStorage.removeItem(QUEUE_KEY);
  },

  /**
   * Generates a forensic log for an SOS event.
   * Scoped to the current userId to ensure privacy.
   */
  logSOS: async (
    userId: string, 
    userName: string, 
    location: Location, 
    isOnline: boolean,
    dialedNumbers: string[],
    notifiedContacts: ContactDispatchStatus[],
    address?: string
  ): Promise<SOSLog> => {
    const log: SOSLog = {
      id: `SOS-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      userId,
      userName,
      timestamp: new Date().toISOString(),
      location,
      address: address || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`,
      status: isOnline ? 'synced' : 'pending',
      evidenceUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4', // Mock Evidence Link
      dialedNumbers,
      notifiedContacts
    };

    const historyKey = getHistoryKey(userId);
    const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
    history.unshift(log);
    localStorage.setItem(historyKey, JSON.stringify(history.slice(0, 100)));

    if (!isOnline) {
      apiService.addToQueue(log);
      return log;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { ...log, status: 'synced' };
    } catch (err) {
      apiService.addToQueue(log);
      return log;
    }
  },

  getHistory: (userId: string): SOSLog[] => {
    if (!userId) return [];
    const saved = localStorage.getItem(getHistoryKey(userId));
    return saved ? JSON.parse(saved) : [];
  },

  syncPendingLogs: async (userId: string) => {
    const queue = apiService.getQueue();
    if (queue.length === 0 || !userId) return;
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const historyKey = getHistoryKey(userId);
    const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
    const updatedHistory = history.map((h: SOSLog) => {
      if (queue.some(q => q.id === h.id)) {
        return { ...h, status: 'synced' as const };
      }
      return h;
    });
    
    localStorage.setItem(historyKey, JSON.stringify(updatedHistory));
    apiService.clearQueue();
  }
};
