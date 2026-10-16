import { redactSensitiveData } from './redaction.js';

export interface UnifiedScanResult {
  riskScore: number; // 0 - 100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  verdict: 'Potential Scam' | 'Suspicious' | 'No strong scam indicators detected';
  category: string;
  reasons: string[];
  urlComponents: {
    url?: string;
    domain?: string;
    protocol?: string;
    isSuspicious?: boolean;
    flag?: string;
  } | null;
  recommendedAction: string;
  safeNextSteps: string[];
  timestamp: string;
  detectionMethod: 'Local Deterministic Rules Engine' | 'Heuristic URL Parser' | 'Hybrid AI Engine';
  redactedInput: string;
  disclaimer: string;
}

const SUSPICIOUS_TLDS = new Set([
  'xyz', 'top', 'buzz', 'icu', 'fit', 'club', 'rest', 'stream', 'work',
  'loan', 'bar', 'click', 'link', 'gq', 'cf', 'ml', 'tk', 'ga', 'space'
]);

const TARGETED_BRANDS = [
  'sbi', 'onlinesbi', 'hdfc', 'hdfcbank', 'icici', 'icicibank', 'axis', 'axisbank',
  'pnb', 'punjabnational', 'canara', 'bankofbaroda', 'paytm', 'phonepe', 'gpay',
  'googlepay', 'bharatpe', 'bhim', 'uidai', 'incometax', 'epfindia', 'cybercrime'
];

export function runUnifiedScan(rawInput: string): UnifiedScanResult {
  const trimmed = (rawInput || '').trim();
  if (!trimmed) {
    throw new Error('Please enter text or a URL to scan.');
  }

  // 1. Redact sensitive OTPs or card numbers first
  const { redactedText } = redactSensitiveData(trimmed);
  const lower = trimmed.toLowerCase();

  let score = 5;
  const reasons: string[] = [];
  let category = 'Routine Communication';
  let urlComponents: UnifiedScanResult['urlComponents'] = null;

  // 2. Extract and inspect URLs
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9.-]+\.(?:com|org|net|in|top|xyz|biz|info|online|site|live|example\.com|example)[^\s]*)/gi;
  const matchedUrls = trimmed.match(urlRegex) || [];

  const rawUrl = matchedUrls[0];
  if (rawUrl) {
    let normalizedUrl = rawUrl;
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = 'http://' + normalizedUrl;
    }

    try {
      const parsed = new URL(normalizedUrl);
      const host = parsed.hostname.toLowerCase();
      let isHostSuspicious = false;
      let hostFlag = 'Standard Hostname';

      // Check IP Host
      if (/^(\d{1,3}\.){3}\d{1,3}$/.test(host)) {
        score += 50;
        isHostSuspicious = true;
        hostFlag = 'Direct IP Address Host';
        reasons.push(`Direct IP address host (${host}) used instead of verified domain.`);
      }

      // Check Punycode / Homoglyph
      if (host.includes('xn--')) {
        score += 45;
        isHostSuspicious = true;
        hostFlag = 'Punycode Homoglyph Domain';
        reasons.push('Punycode domain detected (potential homoglyph visual spoofing).');
      }

      // Check Suspicious TLD
      const parts = host.split('.');
      const tld = parts[parts.length - 1];
      if (SUSPICIOUS_TLDS.has(tld)) {
        score += 30;
        isHostSuspicious = true;
        hostFlag = `High-Risk TLD (.${tld})`;
        reasons.push(`Domain uses high-risk, disposable top-level domain (.${tld}).`);
      }

      // Check Synthetic Phishing Test Hostnames (e.g. bank-verify.example.com or lookalikes)
      if (host.includes('bank-verify') || host.includes('secure-verify') || host.includes('kyc-update') || host.includes('login-alert')) {
        score += 40;
        isHostSuspicious = true;
        hostFlag = 'Suspicious Security/Verification Hostname';
        reasons.push(`Deceptive hostname pattern detected: "${host}" mimics a banking verification portal.`);
      }

      // Check Brand Impersonation in Host
      for (const brand of TARGETED_BRANDS) {
        if (host.includes(brand)) {
          // If not official root domain
          if (!host.endsWith(`.${brand}.com`) && !host.endsWith(`.${brand}.co.in`) && !host.endsWith('.sbi') && !host.endsWith('.gov.in')) {
            score += 40;
            isHostSuspicious = true;
            hostFlag = `Brand Impersonation (${brand.toUpperCase()})`;
            reasons.push(`Hostname references brand name "${brand.toUpperCase()}" on an unauthorized root domain.`);
            break;
          }
        }
      }

      // Check Insecure HTTP on Login/Verification paths
      if (parsed.protocol === 'http:' && (parsed.pathname.includes('verify') || parsed.pathname.includes('login') || parsed.pathname.includes('auth'))) {
        score += 20;
        reasons.push('Insecure unencrypted HTTP protocol used on sensitive verification path.');
      }

      urlComponents = {
        url: rawUrl,
        domain: host,
        protocol: parsed.protocol,
        isSuspicious: isHostSuspicious,
        flag: hostFlag,
      };
    } catch (_e) {
      // Malformed URL
      score += 25;
      reasons.push('Malformed URL syntax detected.');
    }
  }

  // 3. Urgent Account Suspension Panic
  if (
    (lower.includes('urgent') || lower.includes('immediately') || lower.includes('suspended today') || lower.includes('will be suspended') || lower.includes('account blocked') || lower.includes('deactivated')) &&
    (lower.includes('verify') || lower.includes('details') || lower.includes('account') || lower.includes('kyc') || lower.includes('pan') || lower.includes('update'))
  ) {
    score += 50;
    category = 'Fake Bank Account Suspension Phishing';
    reasons.push('Fabricated urgency: Threatens immediate account suspension to panic recipient.');
    reasons.push('Demands immediate verification of credentials or personal details via external link.');
  }

  // 4. Fake Delivery Fee / Package on Hold
  if (
    (lower.includes('parcel') || lower.includes('package') || lower.includes('delivery') || lower.includes('customs') || lower.includes('courier')) &&
    (lower.includes('on hold') || lower.includes('redelivery fee') || lower.includes('delivery fee') || lower.includes('processing fee') || lower.includes('detained') || lower.includes('unverified link'))
  ) {
    score += 45;
    category = 'Fake Delivery / Redelivery Fee Scam';
    reasons.push('Fake delivery hook: Claims parcel is on hold and demands payment of an unexpected redelivery fee.');
    reasons.push('Unverified payment link provided outside official courier tracking apps.');
  }

  // 5. Customer Support OTP Theft / Credential Solicitation
  if (
    (lower.includes('customer support') || lower.includes('bank executive') || lower.includes('bank officer') || lower.includes('manager')) &&
    (lower.includes('tell me the otp') || lower.includes('share otp') || lower.includes('provide otp') || lower.includes('unblock your account') || lower.includes('quote otp') || lower.includes('otp you received'))
  ) {
    score += 80;
    category = 'Impersonation & OTP Harvesting Theft';
    reasons.push('Critical Warning: Senders claiming to be "customer support" or "bank staff" actively asking for your OTP.');
    reasons.push('Golden Rule: Bank managers and customer support NEVER ask for OTPs or PINs. This is direct credential theft.');
  } else if (lower.includes('otp') && (lower.includes('share') || lower.includes('forward') || lower.includes('call to cancel'))) {
    score += 55;
    category = 'Credential Social Engineering';
    reasons.push('Solicitation of confidential One-Time Password under pretext of account unblocking.');
  }

  // 6. Fake Prize / Lottery / Advance-Fee Scam
  if (
    (lower.includes('congratulations') || lower.includes('you won') || lower.includes('winner') || lower.includes('lottery') || lower.includes('prize')) &&
    (lower.includes('processing fee') || lower.includes('claim your reward') || lower.includes('claim prize') || lower.includes('pay fee') || lower.includes('advance fee'))
  ) {
    score += 55;
    category = 'Fake Prize / Advance-Fee Lottery Fraud';
    reasons.push('Fake reward inducement: Falsely claims you won a prize but requires paying an upfront fee to claim it.');
    reasons.push('Classic advance-fee fraud indicator: Legitimate lotteries never demand money to release winnings.');
  }

  // 7. Work-from-Home / YouTube Task Scam
  if (
    (lower.includes('part-time') || lower.includes('work from home') || lower.includes('youtube') || lower.includes('hotel review')) &&
    (lower.includes('telegram') || lower.includes('earn') || lower.includes('₹') || lower.includes('rs.') || lower.includes('per day'))
  ) {
    score += 50;
    category = 'Prepaid Task / Job Offer Scam';
    reasons.push('Unrealistic daily income promised for trivial tasks.');
    reasons.push('Directs communication to unmonitored Telegram/WhatsApp recruiter channels.');
  }

  // 8. UPI QR Code / PIN to Receive Scam
  if (
    (lower.includes('upi') || lower.includes('qr') || lower.includes('cashback')) &&
    (lower.includes('pin to receive') || lower.includes('scan to receive') || lower.includes('enter mpin'))
  ) {
    score += 65;
    category = 'UPI MPIN Reversal Fraud';
    reasons.push('Deceptive payment instruction: Entering your UPI PIN ALWAYS debits money, never receives it.');
  }

  // 9. Harmless Message Filter
  // If no suspicious indicators triggered, ensure score remains strictly in LOW: 0-24
  if (reasons.length === 0) {
    score = 5;
    category = 'Harmless / Normal Communication';
    reasons.push('No urgent account suspension threats, credential requests, or deceptive links detected.');
    reasons.push('Message tone and structure align with routine operational, professional, or personal communication.');
  }

  // Clamp score strictly between 0 and 100
  const finalScore = Math.min(Math.max(score, 0), 100);

  // Exact Requested Risk Levels:
  // LOW: 0–24
  // MEDIUM: 25–49
  // HIGH: 50–79
  // CRITICAL: 80–100
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  let verdict: 'Potential Scam' | 'Suspicious' | 'No strong scam indicators detected';

  if (finalScore >= 80) {
    riskLevel = 'CRITICAL';
    verdict = 'Potential Scam';
  } else if (finalScore >= 50) {
    riskLevel = 'HIGH';
    verdict = 'Potential Scam';
  } else if (finalScore >= 25) {
    riskLevel = 'MEDIUM';
    verdict = 'Suspicious';
  } else {
    riskLevel = 'LOW';
    verdict = 'No strong scam indicators detected';
  }

  // Recommended next steps based on verdict
  const safeNextSteps: string[] = [];
  let recommendedAction = '';

  if (riskLevel === 'CRITICAL' || riskLevel === 'HIGH') {
    recommendedAction = 'Do NOT click embedded links, pay unverified fees, or disclose OTPs. Verify directly with the official organization.';
    safeNextSteps.push('Do NOT open the link or dial phone numbers listed inside the message.');
    safeNextSteps.push('Never disclose your OTP, ATM PIN, or NetBanking password to anyone.');
    safeNextSteps.push('If you already submitted banking details, immediately contact your bank helpline and call 1930.');
  } else if (riskLevel === 'MEDIUM') {
    recommendedAction = 'Exercise caution. Verify the sender identity through official channels before sharing information.';
    safeNextSteps.push('Inspect the link destination carefully and check the official app for notifications.');
    safeNextSteps.push('Do not proceed if the portal asks for sensitive payment credentials.');
  } else {
    recommendedAction = 'No immediate threat indicators found. Continue standard cybersecurity hygiene.';
    safeNextSteps.push('Content appears non-anomalous. Always maintain awareness.');
  }

  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return {
    riskScore: finalScore,
    riskLevel,
    verdict,
    category,
    reasons,
    urlComponents,
    recommendedAction,
    safeNextSteps,
    timestamp,
    detectionMethod: 'Local Deterministic Rules Engine',
    redactedInput: redactedText,
    disclaimer: 'Automated heuristic analysis cannot guarantee that content is 100% safe. Always verify independently.',
  };
}
