/**
 * ScamShield AI — Client-Side Local Persistence Engine
 * Manages browser localStorage with in-memory fallback for quotas and incognito mode.
 * Stores only privacy-safe anonymous metadata, never raw passwords, OTPs, or cards.
 */

export interface StoredScanRecord {
  id: string;
  timestamp: string;
  inputType: 'Message' | 'URL' | 'OTP' | 'Transaction' | 'Simulation';
  category: string;
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  verdict: string;
  reasons: string[];
  privacySafeSummary: string;
  recommendedAction: string;
  isSyntheticDemo?: boolean;
}

export interface AppSettings {
  language: 'en' | 'te';
  autoRedactEnabled: boolean;
  soundAlerts: boolean;
  highSensitivity: boolean;
  offlineEngineMode: boolean;
}

const HISTORY_KEY = 'scamshield_local_history_v2';
const SETTINGS_KEY = 'scamshield_settings_v2';
const MAX_HISTORY_ITEMS = 50;

// In-memory fallback if browser storage is disabled or quota is exceeded
const memoryStore: Record<string, string> = {};

function safeGet(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch (err) {
    console.warn('[LocalPersistence] localStorage read unavailable, falling back to memoryStore', err);
  }
  return memoryStore[key] || null;
}

function safeSet(key: string, value: string): boolean {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
      memoryStore[key] = value;
      return true;
    }
  } catch (err) {
    console.warn('[LocalPersistence] localStorage write unavailable or quota full, using memoryStore', err);
    memoryStore[key] = value;
    return false;
  }
  memoryStore[key] = value;
  return true;
}

function safeRemove(key: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch (err) {
    console.warn('[LocalPersistence] localStorage remove failed', err);
  }
  delete memoryStore[key];
}

/**
 * Get all stored local scan records
 */
export function getStoredScanHistory(): StoredScanRecord[] {
  try {
    const raw = safeGet(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Add a new scan result to local history (with privacy-safe summary only)
 */
export function saveScanToHistory(record: Omit<StoredScanRecord, 'id' | 'timestamp'>): StoredScanRecord {
  const history = getStoredScanHistory();
  const newEntry: StoredScanRecord = {
    ...record,
    id: Math.random().toString(36).substring(2, 9) + '-' + Date.now().toString(36),
    timestamp: new Date().toLocaleTimeString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
  };

  const updated = [newEntry, ...history].slice(0, MAX_HISTORY_ITEMS);
  safeSet(HISTORY_KEY, JSON.stringify(updated));
  return newEntry;
}

/**
 * Clear only the scan history
 */
export function clearScanHistory(): void {
  safeRemove(HISTORY_KEY);
}

/**
 * Default App Settings
 */
export const DEFAULT_SETTINGS: AppSettings = {
  language: 'en',
  autoRedactEnabled: true,
  soundAlerts: false,
  highSensitivity: false,
  offlineEngineMode: true,
};

/**
 * Get stored application settings
 */
export function getStoredSettings(): AppSettings {
  try {
    const raw = safeGet(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

/**
 * Save application settings
 */
export function saveStoredSettings(settings: Partial<AppSettings>): AppSettings {
  const current = getStoredSettings();
  const updated: AppSettings = { ...current, ...settings };
  safeSet(SETTINGS_KEY, JSON.stringify(updated));
  return updated;
}

/**
 * Clear all local app data (history, settings, caches)
 */
export function clearAllAppData(): void {
  safeRemove(HISTORY_KEY);
  safeRemove(SETTINGS_KEY);
  safeRemove('scamshield_lang');
  safeRemove('scamshield_anon_history_v1');
  safeRemove('scamshield_local_events_v1');
  // Clear memory cache as well
  Object.keys(memoryStore).forEach(k => delete memoryStore[k]);
}

/**
 * Browser storage status helper
 */
export function getStorageDiagnostics(): {
  isLocalStorageAvailable: boolean;
  historyCount: number;
  storageSizeBytes: number;
  privacyNotice: string;
} {
  let isAvailable = false;
  let size = 0;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('__test_ping__', '1');
      window.localStorage.removeItem('__test_ping__');
      isAvailable = true;
      const hRaw = safeGet(HISTORY_KEY) || '';
      const sRaw = safeGet(SETTINGS_KEY) || '';
      size = (hRaw.length + sRaw.length) * 2; // approx UTF-16 bytes
    }
  } catch {
    isAvailable = false;
  }

  return {
    isLocalStorageAvailable: isAvailable,
    historyCount: getStoredScanHistory().length,
    storageSizeBytes: size,
    privacyNotice: 'All data is stored exclusively in this browser profile and is not synchronized across devices or uploaded to any server.',
  };
}
