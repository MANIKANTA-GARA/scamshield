/**
 * ScamShield Frontend API Client — 100% Local / Offline Adapter
 * Operates purely on-device in browser memory with zero network dependencies.
 * All scans, simulations, and protection source toggles execute locally.
 */

import { runLocalScamDetection, LocalScanResult } from './localDetection.js';
import { redactClientSensitiveData } from './otpRedactor.js';
import { saveScanToHistory } from './localPersistence.js';

// ==========================================
// 1. Security Event Interfaces & Local Store
// ==========================================

export interface SecurityEventItem {
  id: string;
  source: string;
  sourcePackage?: string;
  category: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidenceScore: number;
  detectionReasons: string[];
  recommendedAction: string;
  timestamp: string;
  redactedPreview: string;
  isVerifiedThreatSource: boolean;
  requiresUserAction: boolean;
  isSyntheticDemo?: boolean;
}

const LOCAL_EVENTS_STORAGE_KEY = 'scamshield_local_events_v1';

function getLocalEventsStore(): SecurityEventItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_EVENTS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveLocalEventsStore(events: SecurityEventItem[]): void {
  try {
    localStorage.setItem(LOCAL_EVENTS_STORAGE_KEY, JSON.stringify(events.slice(0, 50)));
  } catch {
    // fallback
  }
}

export async function fetchAutomatedEvents(): Promise<{
  events: SecurityEventItem[];
  totalThreats: number;
  activeMonitoringStatus: string;
}> {
  const events = getLocalEventsStore();
  const totalThreats = events.filter(e => e.riskLevel === 'HIGH' || e.riskLevel === 'CRITICAL').length;
  return {
    events,
    totalThreats,
    activeMonitoringStatus: 'Client-Side Offline Engine (Direct Submissions & Integrations)',
  };
}

export async function clearAutomatedEvents(): Promise<void> {
  try {
    localStorage.removeItem(LOCAL_EVENTS_STORAGE_KEY);
  } catch {
    // ignore
  }
}

const SCENARIO_PAYLOADS: Record<string, { text: string; category: string; source: string }> = {
  electricity_scam: {
    text: 'Dear Consumer, Your Electricity Power will be disconnected tonight at 09:30 PM from the power office because your previous month bill was unpaid. Immediately contact Electricity Officer on 9876543210 to avoid power cut.',
    category: 'Electricity / Utility Bill Disconnection Scam',
    source: 'SMS Notification',
  },
  kyc_phishing: {
    text: 'Dear SBI Customer, Your YONO Account has been blocked due to un-updated KYC. Please click here immediately to update your PAN & Aadhaar: http://sbi.kyc-verification-update.top/login or your account will be permanently suspended.',
    category: 'Fake Bank / KYC Verification Scam',
    source: 'WhatsApp Notification',
  },
  task_job_scam: {
    text: 'Congratulations! You have been selected for Part-Time YouTube Video Liking Job. Work from Home 1-2 hours daily and earn ₹3000 to ₹8000 per day guaranteed. Contact HR Manager on Telegram: @telegram_job_portal now.',
    category: 'Prepaid Task / Job Offer Scam',
    source: 'Telegram Notification',
  },
  qr_upi_scam: {
    text: 'Congratulations! You won ₹2,500 cashback on PhonePe. Scan this QR code and enter your UPI PIN to receive money into your bank account immediately.',
    category: 'UPI MPIN Reversal Fraud',
    source: 'WhatsApp Notification',
  },
  malicious_url: {
    text: 'https://sbi.bank-login-secure.top/kyc/update-pan',
    category: 'Deceptive Brand URL Navigation',
    source: 'Chrome Browser Navigation',
  },
  legitimate_bank: {
    text: 'INR 500.00 debited from A/c XX4821 on 16-OCT-26 at Apollo Pharmacy via UPI Ref 9283719283. Bal: INR 12,450.00. If not done by you, call 1800-11-2211.',
    category: 'Legitimate Bank Transaction Alert',
    source: 'SMS Notification',
  },
};

export async function simulateBackgroundEvent(
  scenario: 'electricity_scam' | 'kyc_phishing' | 'task_job_scam' | 'qr_upi_scam' | 'malicious_url' | 'legitimate_bank',
  sourceApp: 'WhatsApp' | 'SMS' | 'Telegram' | 'Gmail' | 'Chrome' = 'WhatsApp'
): Promise<{ success: boolean; event: SecurityEventItem; message: string }> {
  const scenarioData = SCENARIO_PAYLOADS[scenario] || SCENARIO_PAYLOADS.electricity_scam;
  const analysis = runLocalScamDetection(scenarioData.text, true);

  const event: SecurityEventItem = {
    id: 'evt_' + Math.random().toString(36).substring(2, 9),
    source: `${sourceApp} Interception`,
    sourcePackage: sourceApp === 'Chrome' ? 'com.android.chrome' : `com.${sourceApp.toLowerCase()}`,
    category: analysis.category,
    riskLevel: analysis.riskLevel,
    confidenceScore: analysis.riskScore,
    detectionReasons: analysis.reasons,
    recommendedAction: analysis.recommendedAction,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    redactedPreview: analysis.redactedInput,
    isVerifiedThreatSource: analysis.riskLevel === 'CRITICAL' || analysis.riskLevel === 'HIGH',
    requiresUserAction: analysis.riskLevel === 'CRITICAL' || analysis.riskLevel === 'HIGH',
    isSyntheticDemo: true,
  };

  const existing = getLocalEventsStore();
  saveLocalEventsStore([event, ...existing]);

  // Also log to scan history
  saveScanToHistory({
    inputType: 'Simulation',
    category: analysis.category,
    riskScore: analysis.riskScore,
    riskLevel: analysis.riskLevel,
    verdict: analysis.verdict,
    reasons: analysis.reasons,
    privacySafeSummary: `[Simulated ${sourceApp}] ${analysis.category} - ${analysis.verdict}`,
    recommendedAction: analysis.recommendedAction,
    isSyntheticDemo: true,
  });

  return {
    success: true,
    event,
    message: analysis.riskLevel === 'LOW'
      ? `Simulated event from ${sourceApp} evaluated as LOW risk. Threat alarm suppressed to avoid alert fatigue.`
      : `High-risk threat detected from ${sourceApp} simulation! Security alert triggered.`,
  };
}

// ==========================================
// 2. Protection Sources Interfaces & Local Store
// ==========================================

export interface ProtectionSourceItem {
  id: string;
  name: string;
  type: 'android_notification' | 'browser_extension' | 'authorized_api' | 'package_safety';
  description: string;
  enabled: boolean;
  permissionRequired: string;
  permissionGranted: boolean;
  supportedPackages?: string[];
  limitations: string;
}

const DEFAULT_SOURCES: ProtectionSourceItem[] = [
  {
    id: 'android_notifications',
    name: 'Android Notification Companion Service',
    type: 'android_notification',
    description: 'Consented on-device listener inspecting incoming notifications from WhatsApp, SMS, and messaging apps.',
    enabled: true,
    permissionRequired: 'android.permission.BIND_NOTIFICATION_LISTENER_SERVICE',
    permissionGranted: true,
    supportedPackages: ['com.whatsapp', 'com.google.android.apps.messaging', 'org.telegram.messenger'],
    limitations: 'Only inspects notification preview banners with explicit user consent. Cannot access encrypted chats or internal app databases.',
  },
  {
    id: 'chrome_extension',
    name: 'Chrome Web Protection Extension',
    type: 'browser_extension',
    description: 'Manifest V3 companion monitoring navigation events for homoglyph attacks and deceptive banking subdomains.',
    enabled: true,
    permissionRequired: 'webNavigation & declarativeNetRequest',
    permissionGranted: true,
    supportedPackages: ['chrome.exe', 'brave.exe', 'edge.exe'],
    limitations: 'Inspects URL strings on navigation. Does not read private webpage content or form inputs.',
  },
  {
    id: 'direct_scanner',
    name: 'Client-Side On-Device Scanner',
    type: 'authorized_api',
    description: 'Standalone in-browser scanning engine operating with 100% offline heuristic rules.',
    enabled: true,
    permissionRequired: 'None (Runs in Local Browser Memory)',
    permissionGranted: true,
    limitations: 'Analyzes user-submitted text and URLs. Zero cloud transmissions.',
  },
  {
    id: 'package_safety',
    name: 'App Installation & APK Verification',
    type: 'package_safety',
    description: 'Verifies downloaded installer packages against spoofed banking package names.',
    enabled: false,
    permissionRequired: 'PACKAGE_USAGE_STATS',
    permissionGranted: false,
    limitations: 'Requires Android Package Manager integration.',
  },
];

const SOURCES_STORAGE_KEY = 'scamshield_local_sources_v1';

export async function fetchProtectionSources(): Promise<{
  sources: ProtectionSourceItem[];
  allBackgroundServicesActive: boolean;
  activeMonitoringCount: number;
}> {
  try {
    const raw = localStorage.getItem(SOURCES_STORAGE_KEY);
    const sources: ProtectionSourceItem[] = raw ? JSON.parse(raw) : DEFAULT_SOURCES;
    const activeCount = sources.filter(s => s.enabled).length;
    return {
      sources,
      allBackgroundServicesActive: activeCount >= 2,
      activeMonitoringCount: activeCount,
    };
  } catch {
    return {
      sources: DEFAULT_SOURCES,
      allBackgroundServicesActive: true,
      activeMonitoringCount: 3,
    };
  }
}

export async function toggleProtectionSource(sourceId: string, enabled: boolean): Promise<void> {
  try {
    const raw = localStorage.getItem(SOURCES_STORAGE_KEY);
    const sources: ProtectionSourceItem[] = raw ? JSON.parse(raw) : [...DEFAULT_SOURCES];
    const updated = sources.map(s => s.id === sourceId ? { ...s, enabled } : s);
    localStorage.setItem(SOURCES_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // fallback
  }
}

// ==========================================
// 3. Message Scanner Interface & Local Function
// ==========================================

export interface MessageScanResult {
  category: string;
  riskLevel: 'low' | 'medium' | 'high' | 'inconclusive';
  heuristicScore: number;
  evidenceIndicators: string[];
  explanation: { en: string; te: string };
  safeNextSteps: { en: string[]; te: string[] };
  uncertaintyNotes: string;
  isAiPowered: boolean;
  redactedPreview: string;
  disclaimer: string;
}

export async function scanMessage(text: string, language: 'en' | 'te'): Promise<MessageScanResult> {
  const result = runLocalScamDetection(text);

  return {
    category: result.category,
    riskLevel: result.riskLevel.toLowerCase() as any,
    heuristicScore: result.riskScore,
    evidenceIndicators: result.reasons,
    explanation: result.explanation,
    safeNextSteps: {
      en: result.safeNextSteps,
      te: [
        'ఎటువంటి అనుమానాస్పద లింక్‌లను క్లిక్ చేయవద్దు.',
        'OTP లేదా బ్యాంకింగ్ పాస్‌వర్డ్‌లను ఎవరితోనూ పంచుకోవద్దు.',
        'ఆర్థిక మోసం జరిగితే 1930 హెల్ప్‌లైన్‌కు వెంటనే కాల్ చేయండి.',
      ],
    },
    uncertaintyNotes: 'Heuristic rules evaluate lexical patterns offline. Unseen variations may exist.',
    isAiPowered: false,
    redactedPreview: result.redactedInput,
    disclaimer: 'Analysis performed on-device using ScamShield offline rules. Never share financial credentials.',
  };
}

// ==========================================
// 4. URL Analyzer Interface & Local Function
// ==========================================

export interface UrlScanResult {
  submittedUrl: string;
  parsedDomain: string;
  protocol: string;
  riskLevel: 'low' | 'medium' | 'high' | 'inconclusive';
  heuristicScore: number;
  indicators: Array<{ type: 'danger' | 'warning' | 'info' | 'safe'; title: string; description: string }>;
  threatIntelResult: { checked: boolean; source: string; flagged: boolean; details: string };
  explanation: { en: string; te: string };
  safeNextSteps: { en: string[]; te: string[] };
  uncertaintyNotes: string;
  disclaimer: string;
}

export async function scanUrl(url: string): Promise<UrlScanResult> {
  const result = runLocalScamDetection(url);
  const domain = result.urlComponents?.domain || 'unknown-host';
  const protocol = result.urlComponents?.protocol || 'https:';

  const indicators = result.reasons.map((r) => {
    const isDanger = result.riskLevel === 'CRITICAL' || result.riskLevel === 'HIGH';
    return {
      type: isDanger ? ('danger' as const) : ('info' as const),
      title: result.category,
      description: r,
    };
  });

  return {
    submittedUrl: url,
    parsedDomain: domain,
    protocol,
    riskLevel: result.riskLevel.toLowerCase() as any,
    heuristicScore: result.riskScore,
    indicators,
    threatIntelResult: {
      checked: false,
      source: 'Offline Heuristic Engine',
      flagged: result.riskLevel === 'HIGH' || result.riskLevel === 'CRITICAL',
      details: 'Evaluated locally without external network requests.',
    },
    explanation: result.explanation,
    safeNextSteps: {
      en: result.safeNextSteps,
      te: ['ఈ లింక్‌ను బ్రౌజర్‌లో తెరవవద్దు.', 'బ్యాంక్ పాస్‌వర్డ్‌లను నమోదు చేయవద్దు.'],
    },
    uncertaintyNotes: 'Domain evaluation is based on lexical rules, TLD risk, and brand matching without connecting to the remote host.',
    disclaimer: 'ScamShield does not fetch or execute the target page. Clean heuristics do not guarantee 100% safety.',
  };
}

// ==========================================
// 5. OTP Safety Interface & Local Function
// ==========================================

export interface OtpScanResult {
  redactedMessage: string;
  detectedOtpPattern: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'inconclusive';
  suspectedContext: string;
  explanation: { en: string; te: string };
  safeNextSteps: { en: string[]; te: string[] };
  officialCheckGuidance: { en: string; te: string };
  criticalWarning: { en: string; te: string };
  disclaimer: string;
}

export async function scanOtp(message: string, language: 'en' | 'te'): Promise<OtpScanResult> {
  const { redactedText, hasRedactedOtp } = redactClientSensitiveData(message);
  const result = runLocalScamDetection(message);

  return {
    redactedMessage: redactedText,
    detectedOtpPattern: hasRedactedOtp,
    riskLevel: result.riskLevel.toLowerCase() as any,
    suspectedContext: result.category,
    explanation: result.explanation,
    safeNextSteps: {
      en: result.safeNextSteps,
      te: ['ఈ కోడ్‌ను ఎవరితోనూ పంచుకోవద్దు.', 'మీ బ్యాంక్ యాప్‌లో లావాదేవీని తనిఖీ చేయండి.'],
    },
    officialCheckGuidance: {
      en: 'If you did not initiate this transaction, immediately log into your bank app and freeze your card.',
      te: 'మీరు ఈ లావాదేవీని ప్రారంభించకపోతే, వెంటనే మీ బ్యాంక్ కార్డును బ్లాక్ చేయండి.',
    },
    criticalWarning: {
      en: 'NEVER SHARE THIS OTP OR CODE. Bank managers, police officers, and fraud executives will NEVER ask for your OTP.',
      te: 'ఈ OTP ని ఎవరితోనూ పంచుకోవద్దు. బ్యాంక్ అధికారులు లేదా పోలీసులు ఎప్పుడూ OTP అడగరు.',
    },
    disclaimer: 'OTPs are redacted client-side before parsing. An unrequested OTP indicates someone is attempting to access your account.',
  };
}

// ==========================================
// 6. Transaction Anomaly Interface & Local Function
// ==========================================

export interface TransactionScanResult {
  riskLevel: 'low' | 'medium' | 'high' | 'inconclusive';
  anomalyScore: number;
  flags: Array<{ code: string; severity: 'high' | 'medium' | 'low' | 'info'; title: string; description: string }>;
  evaluationSummary: { en: string; te: string };
  recommendations: { en: string[]; te: string[] };
  isRuleBasedDemo: true;
  disclaimer: string;
}

export async function scanTransaction(payload: {
  amount: number;
  baselineAverage: number;
  timeOfDay: string;
  recipientHandle: string;
  recentCount24h: number;
  category: string;
}): Promise<TransactionScanResult> {
  const flags: TransactionScanResult['flags'] = [];
  let score = 5;

  // 1. Amount Spike Check (> 5x baseline)
  if (payload.amount > payload.baselineAverage * 5 && payload.amount > 5000) {
    score += 40;
    flags.push({
      code: 'SPIKE_AMOUNT',
      severity: 'high',
      title: 'Severe Spending Spike',
      description: `Transaction (₹${payload.amount.toLocaleString()}) exceeds 5x average baseline (₹${payload.baselineAverage.toLocaleString()}).`,
    });
  }

  // 2. Off-Hours Check (Midnight to 5:00 AM)
  const [hours] = (payload.timeOfDay || '12:00').split(':').map(Number);
  if (hours !== undefined && (hours >= 0 && hours < 5)) {
    score += 25;
    flags.push({
      code: 'OFF_HOURS',
      severity: 'medium',
      title: 'Unusual Off-Hours Timing',
      description: `Transaction initiated during dormant hours (${payload.timeOfDay}).`,
    });
  }

  // 3. High Velocity Check
  if (payload.recentCount24h >= 5) {
    score += 25;
    flags.push({
      code: 'HIGH_VELOCITY',
      severity: 'medium',
      title: 'Rapid Transaction Burst',
      description: `${payload.recentCount24h} transactions initiated in the past 24 hours.`,
    });
  }

  // 4. Suspicious Recipient Handle
  const handleLower = (payload.recipientHandle || '').toLowerCase();
  if (
    handleLower.includes('lottery') ||
    handleLower.includes('reward') ||
    handleLower.includes('cashback') ||
    handleLower.includes('refund') ||
    handleLower.includes('crypto')
  ) {
    score += 35;
    flags.push({
      code: 'SUSPICIOUS_RECIPIENT',
      severity: 'high',
      title: 'Deceptive Recipient Identifier',
      description: `Recipient handle "${payload.recipientHandle}" mimics lottery or reward distribution handles.`,
    });
  }

  const finalScore = Math.min(Math.max(score, 5), 98);
  const riskLevel = finalScore >= 50 ? 'high' : finalScore >= 25 ? 'medium' : 'low';

  return {
    riskLevel,
    anomalyScore: finalScore,
    flags,
    evaluationSummary: {
      en: riskLevel === 'high'
        ? 'High behavioral deviation detected across transaction amount, timing, and velocity.'
        : 'Transaction is within standard behavioral risk tolerances.',
      te: riskLevel === 'high'
        ? 'లావాదేవీలో సాధారణం కంటే ఎక్కువ మార్పులు కనిపించాయి.'
        : 'లావాదేవీ సాధారణ పరిధిలోనే ఉంది.',
    },
    recommendations: {
      en: [
        'Confirm the recipient identity before entering your UPI PIN.',
        'Remember that entering your UPI PIN always debits funds.',
      ],
      te: [
        'UPI PIN నమోదు చేయడానికి ముందు గ్రహీత వివరాలను నిర్ధారించుకోండి.',
        'UPI PIN నమోదు చేస్తే డబ్బు మీ ఖాతా నుండి కట్ అవుతుంది.',
      ],
    },
    isRuleBasedDemo: true,
    disclaimer: 'Local behavioral rule-based demo. Evaluated on-device.',
  };
}

// ==========================================
// 7. System Health Status (Always Healthy Local)
// ==========================================

export interface HealthStatus {
  status: string;
  service: string;
  version: string;
  geminiConfigured: boolean;
  geminiModel: string;
  mode: string;
}

export async function checkBackendHealth(): Promise<HealthStatus> {
  return {
    status: 'ok',
    service: 'ScamShield AI Client-Side Offline Engine',
    version: '1.0.0',
    geminiConfigured: false,
    geminiModel: 'offline-local-heuristics',
    mode: 'Local Client-Side Heuristics (Offline, 0 Network Calls)',
  };
}
