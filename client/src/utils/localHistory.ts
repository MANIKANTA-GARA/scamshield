/**
 * Privacy-First Local History Tracker
 * Only stores anonymous metadata (timestamp, module type, category, risk level).
 * NEVER stores raw message text, phone numbers, OTPs, or URLs.
 */

import {
  saveScanToHistory,
  getStoredScanHistory,
  clearScanHistory,
  clearAllAppData,
  StoredScanRecord,
} from './localPersistence.js';

export interface AnonymousScanRecord {
  id: string;
  timestamp: string;
  module: 'message' | 'url' | 'otp' | 'transaction' | 'simulation';
  category: string;
  riskLevel: 'low' | 'medium' | 'high' | 'inconclusive';
  score?: number;
}

export function getLocalScanHistory(): AnonymousScanRecord[] {
  const stored = getStoredScanHistory();
  return stored.map((s) => ({
    id: s.id,
    timestamp: s.timestamp,
    module: s.inputType.toLowerCase() as any,
    category: s.category,
    riskLevel: s.riskLevel.toLowerCase() as any,
    score: s.riskScore,
  }));
}

export function addScanToHistory(record: Omit<AnonymousScanRecord, 'id' | 'timestamp'>): void {
  saveScanToHistory({
    inputType: (record.module.charAt(0).toUpperCase() + record.module.slice(1)) as any,
    category: record.category,
    riskScore: record.score || 10,
    riskLevel: record.riskLevel.toUpperCase() as any,
    verdict: record.riskLevel === 'high' ? 'Potential Scam' : record.riskLevel === 'medium' ? 'Suspicious' : 'No strong scam indicators detected',
    reasons: ['Analyzed via on-device heuristics'],
    privacySafeSummary: `[${record.module.toUpperCase()}] ${record.category}`,
    recommendedAction: 'Verify via official channels',
  });
}

export function clearLocalScanHistory(): void {
  clearScanHistory();
}

export { clearAllAppData };
export type { StoredScanRecord };
