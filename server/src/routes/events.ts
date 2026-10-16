import { Router } from 'express';
import { z } from 'zod';
import { redactSensitiveData } from '../services/redaction.js';
import { analyzeUrlSafely } from '../services/urlHeuristics.js';
import { analyzeWithOfflineEngine, analyzeMessageWithGemini } from '../services/gemini.js';

export const eventsRouter = Router();

export interface SecurityEvent {
  id: string;
  source: 'Android Notification (WhatsApp)' | 'Android Notification (SMS)' | 'Android Notification (Telegram)' | 'Android Notification (Gmail)' | 'Web Protection (Chrome Extension)' | 'Background Monitor';
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
}

// In-memory ring buffer of recent automated security events (capped at 100)
const eventsLog: SecurityEvent[] = [
  {
    id: 'evt-init-1',
    source: 'Android Notification (WhatsApp)',
    sourcePackage: 'com.whatsapp',
    category: 'Fake Bank / KYC Deactivation Phishing',
    riskLevel: 'HIGH',
    confidenceScore: 88,
    detectionReasons: [
      'Impersonates leading financial institution claiming account will be suspended tonight',
      'Directs user to unverified external link: sbi.kyc-verification.top',
      'Artificial urgency detected to coerce immediate document upload'
    ],
    recommendedAction: 'Do not click the link or disclose your PAN/Aadhaar. Open your official YONO app directly.',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    redactedPreview: 'Dear customer, your SBI account is suspended due to unverified KYC. Update PAN at [LINK-REDACTED] or card blocked.',
    isVerifiedThreatSource: false,
    requiresUserAction: true,
  },
  {
    id: 'evt-init-2',
    source: 'Android Notification (SMS)',
    sourcePackage: 'com.google.android.apps.messaging',
    category: 'Electricity Disconnection Scam',
    riskLevel: 'CRITICAL',
    confidenceScore: 92,
    detectionReasons: [
      'Fabricates immediate nocturnal power cut-off threats at 9:30 PM',
      'Directs recipient to call an unverified 10-digit personal mobile number',
      'Electricity distribution companies never disconnect power via informal SMS'
    ],
    recommendedAction: 'DO NOT call the number in the SMS. Check your official electricity board account portal.',
    timestamp: new Date(Date.now() - 1000 * 60 * 42).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    redactedPreview: 'Dear Consumer, Electricity will be disconnected tonight at 09:30 PM from power office. Call 9876543210 immediately.',
    isVerifiedThreatSource: true,
    requiresUserAction: true,
  },
  {
    id: 'evt-init-3',
    source: 'Web Protection (Chrome Extension)',
    sourcePackage: 'org.chromium.extension',
    category: 'Deceptive Brand Phishing Domain',
    riskLevel: 'HIGH',
    confidenceScore: 85,
    detectionReasons: [
      'Domain references brand name "SBI" on an unauthorized .top top-level domain',
      'Pre-navigation intercepted before credentials could be harvested'
    ],
    recommendedAction: 'Navigation halted. Bookmark official portal onlinesbi.sbi instead.',
    timestamp: new Date(Date.now() - 1000 * 60 * 115).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    redactedPreview: 'Target link: https://sbi.bank-login-secure.top/kyc',
    isVerifiedThreatSource: false,
    requiresUserAction: true,
  }
];

// 1. GET /api/events - Retrieve recent automatically intercepted threats
eventsRouter.get('/', (req, res) => {
  return res.json({
    events: eventsLog,
    totalThreats: eventsLog.filter(e => e.riskLevel === 'HIGH' || e.riskLevel === 'CRITICAL').length,
    activeMonitoringStatus: 'AUTOMATIC_ACTIVE',
  });
});

// 2. DELETE /api/events - Clear history
eventsRouter.delete('/', (req, res) => {
  eventsLog.length = 0;
  return res.json({ success: true, message: 'Event history cleared' });
});

// 3. POST /api/events/report - Ingestion endpoint for Android Notification Listener & Browser Extension
const EventReportSchema = z.object({
  source: z.string(),
  sourcePackage: z.string().optional(),
  category: z.string(),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  confidenceScore: z.number().min(0).max(100),
  detectionReasons: z.array(z.string()),
  recommendedAction: z.string(),
  rawContent: z.string().max(4000),
  isVerified: z.boolean().default(false),
});

eventsRouter.post('/report', (req, res, next) => {
  try {
    const parsed = EventReportSchema.parse(req.body);

    // Enforce server-side redaction (never store raw OTPs or cards)
    const redacted = redactSensitiveData(parsed.rawContent).redactedText;

    const newEvent: SecurityEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      source: parsed.source as any,
      sourcePackage: parsed.sourcePackage,
      category: parsed.category,
      riskLevel: parsed.riskLevel,
      confidenceScore: parsed.confidenceScore,
      detectionReasons: parsed.detectionReasons,
      recommendedAction: parsed.recommendedAction,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      redactedPreview: redacted,
      isVerifiedThreatSource: parsed.isVerified,
      requiresUserAction: parsed.riskLevel === 'HIGH' || parsed.riskLevel === 'CRITICAL',
    };

    eventsLog.unshift(newEvent);
    if (eventsLog.length > 100) eventsLog.pop();

    return res.status(201).json({ success: true, event: newEvent });
  } catch (error) {
    next(error);
  }
});

// 4. POST /api/events/simulate - Zero-input background simulator for live testing
const SimulateEventSchema = z.object({
  scenario: z.enum(['electricity_scam', 'kyc_phishing', 'task_job_scam', 'qr_upi_scam', 'malicious_url', 'legitimate_bank']),
  sourceApp: z.enum(['WhatsApp', 'SMS', 'Telegram', 'Gmail', 'Chrome']).default('WhatsApp'),
});

eventsRouter.post('/simulate', async (req, res, next) => {
  try {
    const { scenario, sourceApp } = SimulateEventSchema.parse(req.body);

    let rawText = '';
    let sourceLabel: SecurityEvent['source'] = 'Android Notification (WhatsApp)';
    let sourcePkg = 'com.whatsapp';

    if (sourceApp === 'SMS') {
      sourceLabel = 'Android Notification (SMS)';
      sourcePkg = 'com.google.android.apps.messaging';
    } else if (sourceApp === 'Telegram') {
      sourceLabel = 'Android Notification (Telegram)';
      sourcePkg = 'org.telegram.messenger';
    } else if (sourceApp === 'Gmail') {
      sourceLabel = 'Android Notification (Gmail)';
      sourcePkg = 'com.google.android.gm';
    } else if (sourceApp === 'Chrome') {
      sourceLabel = 'Web Protection (Chrome Extension)';
      sourcePkg = 'org.chromium.extension';
    }

    if (scenario === 'electricity_scam') {
      rawText = 'URGENT: Your Electricity Power will be disconnected tonight at 9:30 PM due to unpaid bill. Immediately contact Electricity Officer on 9876543210 to avoid power cut.';
    } else if (scenario === 'kyc_phishing') {
      rawText = 'Dear SBI Customer, Your YONO Account has been blocked due to un-updated KYC. Please click here to update your PAN & Aadhaar: http://sbi.kyc-verification-update.top/login immediately.';
    } else if (scenario === 'task_job_scam') {
      rawText = 'Congratulations! You are selected for Part-Time YouTube Video Liking Job. Work from home 1 hour daily and earn ₹4000 per day. Contact HR on Telegram: @job_recruiter_vip now.';
    } else if (scenario === 'qr_upi_scam') {
      rawText = 'You have received ₹3,500 cashback reward! Scan this QR code and enter your UPI PIN to receive money in your bank account.';
    } else if (scenario === 'malicious_url') {
      rawText = 'https://sbi.bank-login-secure.top/kyc/update-pan';
      sourceLabel = 'Web Protection (Chrome Extension)';
      sourcePkg = 'org.chromium.extension';
    } else {
      rawText = 'INR 500.00 debited from A/c XX8921 on 16-OCT-26 at LOCAL PHARMACY. Bal: INR 24,100.00. Ref 109283918231.';
    }

    // Run multi-stage detection engine automatically
    let assessment: any;
    if (scenario === 'malicious_url') {
      const urlRes = analyzeUrlSafely(rawText);
      assessment = {
        category: 'Deceptive Brand Phishing Domain',
        riskLevel: urlRes.riskLevel === 'high' ? 'HIGH' : 'MEDIUM',
        confidenceScore: urlRes.heuristicScore,
        reasons: urlRes.indicators.map(i => `${i.title}: ${i.description}`),
        recommendedAction: 'Do not proceed to this link. Verified banking domains end with .sbi or official bank domains.',
        isVerified: false,
      };
    } else {
      const msgRes = await analyzeMessageWithGemini({ rawText, language: 'en' });
      assessment = {
        category: msgRes.category,
        riskLevel: msgRes.riskLevel === 'high' ? 'HIGH' : msgRes.riskLevel === 'medium' ? 'MEDIUM' : 'LOW',
        confidenceScore: msgRes.heuristicScore,
        reasons: msgRes.evidenceIndicators,
        recommendedAction: msgRes.safeNextSteps.en[0] || 'Do not interact with unverified senders.',
        isVerified: msgRes.riskLevel === 'high',
      };
    }

    const { redactedText } = redactSensitiveData(rawText);

    const newEvent: SecurityEvent = {
      id: `evt-sim-${Date.now()}`,
      source: sourceLabel,
      sourcePackage: sourcePkg,
      category: assessment.category,
      riskLevel: assessment.riskLevel,
      confidenceScore: assessment.confidenceScore,
      detectionReasons: assessment.reasons,
      recommendedAction: assessment.recommendedAction,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      redactedPreview: redactedText,
      isVerifiedThreatSource: assessment.isVerified,
      requiresUserAction: assessment.riskLevel === 'HIGH' || assessment.riskLevel === 'CRITICAL',
    };

    // If medium, high, or critical, add to the real-time events feed
    if (newEvent.riskLevel !== 'LOW') {
      eventsLog.unshift(newEvent);
      if (eventsLog.length > 100) eventsLog.pop();
    }

    return res.status(201).json({
      success: true,
      event: newEvent,
      message: newEvent.riskLevel !== 'LOW'
        ? `⚠️ Immediate Security Alert triggered for ${sourceApp}!`
        : `Safe notification processed; no alert dispatched.`,
    });
  } catch (error) {
    next(error);
  }
});
