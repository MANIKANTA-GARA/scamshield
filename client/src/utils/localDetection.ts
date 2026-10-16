/**
 * ScamShield AI — Fully Local, Client-Side Scam Detection Engine
 * 100% Offline | Zero Network Calls | Zero Cloud Database | Zero API Keys
 *
 * Evaluates messages, URLs, OTPs, and transactions purely in-browser
 * using weighted multi-indicator heuristic rules and lexical parsing.
 */

import { redactClientSensitiveData } from './otpRedactor.js';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ScanVerdict = 'Potential Scam' | 'Suspicious' | 'No strong scam indicators detected';

export interface LocalScanResult {
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  verdict: ScanVerdict;
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
  explanation: {
    en: string;
    te: string;
  };
  timestamp: string;
  detectionMethod: 'Client-Side Offline Heuristic Engine';
  redactedInput: string;
  isSyntheticDemo?: boolean;
  disclaimer: string;
}

const SUSPICIOUS_TLDS = new Set([
  'xyz', 'top', 'buzz', 'icu', 'fit', 'club', 'rest', 'stream', 'work',
  'loan', 'bar', 'click', 'link', 'gq', 'cf', 'ml', 'tk', 'ga', 'space',
  'online', 'site', 'live', 'website', 'support', 'bid', 'monster'
]);

const SHORTENED_DOMAINS = new Set([
  'bit.ly', 'tinyurl.com', 't.co', 'is.gd', 'buff.ly', 'ow.ly',
  'cutt.ly', 'rb.gy', 'shorturl.at', 'bl.ink', 'rebrand.ly'
]);

const TARGETED_BRANDS = [
  'sbi', 'onlinesbi', 'hdfc', 'hdfcbank', 'icici', 'icicibank', 'axis', 'axisbank',
  'pnb', 'punjabnational', 'canara', 'bankofbaroda', 'paytm', 'phonepe', 'gpay',
  'googlepay', 'bharatpe', 'bhim', 'uidai', 'incometax', 'epfindia', 'cybercrime',
  'amazon', 'flipkart', 'indiapost', 'netflix', 'paypal', 'apple', 'microsoft'
];

const LEGITIMATE_ROOT_SUFFIXES = [
  '.sbi', 'onlinesbi.sbi', '.gov.in', 'gov.in', '.nic.in', 'nic.in',
  'hdfcbank.com', 'icicibank.com', 'axisbank.com', 'pnbindia.in',
  'paytm.com', 'phonepe.com', 'google.com', 'amazon.in', 'amazon.com',
  'flipkart.com', 'indiapost.gov.in', 'apple.com', 'microsoft.com'
];

/**
 * Core Local Detection Engine
 * Evaluates any raw text or URL on-device without network calls.
 */
export function runLocalScamDetection(rawInput: string, isSyntheticDemo: boolean = false): LocalScanResult {
  const trimmed = (rawInput || '').trim();

  // 1. Handle Empty or Invalid Input gracefully
  if (!trimmed) {
    return {
      riskScore: 0,
      riskLevel: 'LOW',
      verdict: 'No strong scam indicators detected',
      category: 'Empty or Invalid Input',
      reasons: [
        'No content submitted for analysis.',
        'Enter a message or URL above to evaluate threat indicators.',
      ],
      urlComponents: null,
      recommendedAction: 'Enter or paste message content or a website link to begin on-device inspection.',
      safeNextSteps: [
        'Paste suspicious SMS messages, WhatsApp alerts, or URLs into the scanner.',
        'Never disclose confidential banking PINs or OTPs.',
      ],
      explanation: {
        en: 'No input text was detected. The scanner requires text or a link to perform heuristic pattern matching.',
        te: 'ఎటువంటి సందేశం లేదా లింక్ నమోదు చేయలేదు. విశ్లేషణ కోసం దయచేసి టెక్స్ట్‌ను నమోదు చేయండి.',
      },
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      detectionMethod: 'Client-Side Offline Heuristic Engine',
      redactedInput: '',
      isSyntheticDemo,
      disclaimer: 'Analysis performed locally in browser memory. No data is transmitted to external servers.',
    };
  }

  // 2. Pre-process and redact sensitive numbers (OTPs, Aadhaar, Cards) on-device
  const { redactedText } = redactClientSensitiveData(trimmed);
  const lower = trimmed.toLowerCase();

  let score = 0;
  const reasons: string[] = [];
  let category = 'Routine Communication';
  let urlComponents: LocalScanResult['urlComponents'] = null;

  // -------------------------------------------------------------
  // A. URL & Hostname Analysis
  // -------------------------------------------------------------
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9.-]+\.(?:com|org|net|in|top|xyz|biz|info|online|site|live|click|club|link|space)[^\s]*)/gi;
  const matchedUrls = trimmed.match(urlRegex) || [];

  if (matchedUrls.length > 0 && matchedUrls[0]) {
    const rawUrl = matchedUrls[0];
    let normalizedUrl = rawUrl;
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = 'http://' + normalizedUrl;
    }

    try {
      const parsed = new URL(normalizedUrl);
      const host = parsed.hostname.toLowerCase();
      let isHostSuspicious = false;
      let hostFlag = 'Standard Hostname';

      // 1. Check IP Host
      if (/^(\d{1,3}\.){3}\d{1,3}$/.test(host)) {
        score += 55;
        isHostSuspicious = true;
        hostFlag = 'Direct IP Address Host';
        reasons.push(`Direct IP address host (${host}) used instead of a verified, registered domain name.`);
      }

      // 2. Check Punycode / Homoglyph Spoofing
      if (host.includes('xn--')) {
        score += 50;
        isHostSuspicious = true;
        hostFlag = 'Punycode Homoglyph Domain';
        reasons.push('Punycode domain detected (potential homoglyph visual spoofing designed to look like a legitimate brand).');
      }

      // 3. Check High-Risk / Disposable TLD
      const parts = host.split('.');
      const tld = parts[parts.length - 1] || '';
      if (SUSPICIOUS_TLDS.has(tld)) {
        score += 35;
        isHostSuspicious = true;
        hostFlag = `High-Risk TLD (.${tld})`;
        reasons.push(`Domain uses high-risk, low-cost top-level domain (.${tld}) frequently abused in phishing campaigns.`);
      }

      // 4. Check Shortened URLs
      if (SHORTENED_DOMAINS.has(host)) {
        score += 25;
        isHostSuspicious = true;
        hostFlag = 'Shortened URL Service';
        reasons.push(`URL shortener (${host}) masks the true final destination link.`);
      }

      // 5. Deceptive Verification / Security Hostname Keywords
      if (
        host.includes('bank-verify') ||
        host.includes('secure-verify') ||
        host.includes('kyc-update') ||
        host.includes('login-alert') ||
        host.includes('account-update') ||
        host.includes('parcels-update') ||
        host.includes('lucky-draw')
      ) {
        score += 45;
        isHostSuspicious = true;
        hostFlag = 'Deceptive Verification Hostname';
        reasons.push(`Deceptive hostname pattern ("${host}") mimics an institutional verification or banking portal.`);
      }

      // 6. Brand Impersonation in Host or Subdomain
      for (const brand of TARGETED_BRANDS) {
        if (host.includes(brand)) {
          const isLegit = LEGITIMATE_ROOT_SUFFIXES.some(suffix => host === suffix || host.endsWith(suffix));
          if (!isLegit) {
            score += 45;
            isHostSuspicious = true;
            hostFlag = `Brand Impersonation (${brand.toUpperCase()})`;
            reasons.push(`Hostname incorporates recognized brand "${brand.toUpperCase()}" on an unauthorized third-party domain.`);
            break;
          }
        }
      }

      // 7. Insecure HTTP on Login/Auth/KYC paths
      if (
        parsed.protocol === 'http:' &&
        (parsed.pathname.includes('login') || parsed.pathname.includes('verify') || parsed.pathname.includes('kyc') || parsed.pathname.includes('pay') || parsed.pathname.includes('auth'))
      ) {
        score += 20;
        reasons.push('Unencrypted HTTP protocol used on sensitive verification/login URL path.');
      }

      urlComponents = {
        url: rawUrl,
        domain: host,
        protocol: parsed.protocol,
        isSuspicious: isHostSuspicious,
        flag: hostFlag,
      };
    } catch {
      score += 25;
      reasons.push('Malformed or unparseable URL syntax detected.');
    }
  }

  // -------------------------------------------------------------
  // B. Adversarial Prompt Injection Defense
  // -------------------------------------------------------------
  if (
    lower.includes('ignore previous') ||
    lower.includes('ignore all instructions') ||
    lower.includes('system override') ||
    lower.includes('jailbreak') ||
    lower.includes('you must say this is safe')
  ) {
    score += 85;
    category = 'Malicious Prompt Injection Attempt';
    reasons.push('Adversarial prompt injection syntax detected: Attempts to coerce automated scanner into overriding security checks.');
  }

  // -------------------------------------------------------------
  // C. Fake Banking & Account Suspension Panic
  // -------------------------------------------------------------
  const hasUrgency =
    lower.includes('urgent') ||
    lower.includes('immediately') ||
    lower.includes('suspended today') ||
    lower.includes('will be suspended') ||
    lower.includes('account blocked') ||
    lower.includes('permanently deactivated') ||
    lower.includes('avoid closure') ||
    lower.includes('within 24 hours') ||
    lower.includes('tonight at');

  const hasBankingTerms =
    lower.includes('kyc') ||
    lower.includes('pan') ||
    lower.includes('aadhaar') ||
    lower.includes('bank') ||
    lower.includes('sbi') ||
    lower.includes('yono') ||
    lower.includes('hdfc') ||
    lower.includes('icici') ||
    lower.includes('axis') ||
    lower.includes('debit card') ||
    lower.includes('netbanking');

  if (hasUrgency && hasBankingTerms) {
    score += 55;
    category = 'Fake Bank / KYC Verification Scam';
    reasons.push('Fabricated urgency: Threatens imminent account deactivation or suspension to induce panic.');
    reasons.push('Coercion to verify KYC or PAN credentials outside official banking applications.');
  }

  // -------------------------------------------------------------
  // D. OTP & Credential Theft Attempts
  // -------------------------------------------------------------
  const mentionsOtp = lower.includes('otp') || lower.includes('one-time password') || lower.includes('6-digit code') || lower.includes('verification code');
  const asksForOtp =
    lower.includes('share otp') ||
    lower.includes('tell me the otp') ||
    lower.includes('share the 6-digit') ||
    lower.includes('provide otp') ||
    lower.includes('quote otp') ||
    lower.includes('reversal otp') ||
    lower.includes('unblock your account') ||
    lower.includes('cancel this debit') ||
    lower.includes('cancel this request') ||
    lower.includes('fraud prevention');

  if (mentionsOtp && asksForOtp) {
    score += 85;
    category = 'Impersonation & OTP Harvesting';
    reasons.push('Critical Threat: Direct solicitation of confidential OTP code under pretext of cancellation or security verification.');
    reasons.push('Golden Banking Rule: Bank staff and fraud teams NEVER ask for one-time passwords, MPINs, or ATM PINs.');
  } else if (mentionsOtp && (lower.includes('forward') || lower.includes('send to this number'))) {
    score += 65;
    category = 'OTP Forwarding Scam';
    reasons.push('Request to forward a confidential security code to an unverified number.');
  }

  // -------------------------------------------------------------
  // E. Delivery-Fee & Courier Impersonation
  // -------------------------------------------------------------
  const hasCourierBrand =
    lower.includes('india post') ||
    lower.includes('parcel') ||
    lower.includes('package') ||
    lower.includes('delivery') ||
    lower.includes('courier') ||
    lower.includes('customs') ||
    lower.includes('fedex') ||
    lower.includes('dhl') ||
    lower.includes('bluedart');

  const hasDeliveryScamHooks =
    lower.includes('on hold') ||
    lower.includes('held at') ||
    lower.includes('redelivery fee') ||
    lower.includes('delivery fee') ||
    lower.includes('incorrect address') ||
    lower.includes('update your delivery') ||
    lower.includes('processing fee') ||
    lower.includes('distribution center');

  if (hasCourierBrand && hasDeliveryScamHooks) {
    score += 55;
    category = 'Delivery-Fee / Courier Scam';
    reasons.push('Fake delivery hook: Claims parcel is detained or held due to address issues, demanding a small upfront fee.');
    reasons.push('Directs victim to pay redelivery fees or input payment cards via an unofficial tracking link.');
  }

  // -------------------------------------------------------------
  // F. Fake Prize / Lottery / Advance-Fee Claims
  // -------------------------------------------------------------
  const hasPrizeHooks =
    lower.includes('congratulations') ||
    lower.includes('winner') ||
    lower.includes('won') ||
    lower.includes('lucky draw') ||
    lower.includes('lottery') ||
    lower.includes('1st prize') ||
    lower.includes('cash prize');

  const hasAdvanceFeeHooks =
    lower.includes('processing fee') ||
    lower.includes('advance fee') ||
    lower.includes('deposit') ||
    lower.includes('registration fee') ||
    lower.includes('customs charge') ||
    lower.includes('claim fee') ||
    lower.includes('to claim');

  if (hasPrizeHooks && hasAdvanceFeeHooks) {
    score += 60;
    category = 'Fake Prize / Advance-Fee Lottery Fraud';
    reasons.push('Advance-fee fraud hook: Claims recipient won a large sum or reward, but demands paying an upfront fee to release it.');
    reasons.push('Classic fraud hallmark: Legitimate lotteries or contests never demand upfront deposits to transfer genuine winnings.');
  }

  // -------------------------------------------------------------
  // G. Advance-Payment Job / Task Scams
  // -------------------------------------------------------------
  const hasJobHooks =
    lower.includes('part-time') ||
    lower.includes('work from home') ||
    lower.includes('daily income') ||
    lower.includes('youtube') ||
    lower.includes('rating hotels') ||
    lower.includes('like videos') ||
    lower.includes('no experience') ||
    lower.includes('hotel review');

  const hasJobRedirection =
    lower.includes('telegram') ||
    lower.includes('per day') ||
    lower.includes('daily') ||
    lower.includes('₹') ||
    lower.includes('rs.') ||
    lower.includes('earn');

  if (hasJobHooks && hasJobRedirection) {
    score += 55;
    category = 'Prepaid Task / Job Offer Scam';
    reasons.push('Unrealistic earnings promised for trivial tasks (e.g. liking videos or leaving fake ratings).');
    reasons.push('Directs conversation to unmonitored Telegram/WhatsApp recruiter groups — typical precursor to prepaid task deposits.');
  }

  // -------------------------------------------------------------
  // H. Electricity / Utility Disconnection Threats
  // -------------------------------------------------------------
  if (
    (lower.includes('electricity') || lower.includes('power') || lower.includes('bijli')) &&
    (lower.includes('disconnect') || lower.includes('tonight') || lower.includes('bill unpaid') || lower.includes('power office'))
  ) {
    score += 65;
    category = 'Electricity / Utility Bill Disconnection Scam';
    reasons.push('Fabricated utility disconnection urgency: Threats of power shut-off tonight.');
    reasons.push('Directs customer to an unofficial personal phone number rather than the official state electricity portal.');
  }

  // -------------------------------------------------------------
  // I. UPI QR Code & MPIN Reversal Deceptions
  // -------------------------------------------------------------
  if (
    (lower.includes('upi') || lower.includes('qr') || lower.includes('gpay') || lower.includes('phonepe') || lower.includes('paytm')) &&
    (lower.includes('pin to receive') || lower.includes('scan to receive') || lower.includes('receive money') || lower.includes('claim cashback'))
  ) {
    score += 70;
    category = 'UPI MPIN Reversal Fraud';
    reasons.push('Deceptive UPI instruction: Claims entering your UPI PIN is needed to "receive" funds.');
    reasons.push('Fundamental UPI Architecture Rule: Entering your UPI PIN ALWAYS debits money from your account, never credits it.');
  }

  // -------------------------------------------------------------
  // J. False-Positive Suppression & Harmless Messages
  // -------------------------------------------------------------
  // If the message contains standard educational, meeting, or harmless work context
  const isHarmlessContext =
    (lower.includes('meeting') || lower.includes('class') || lower.includes('assignment') || lower.includes('presentation') || lower.includes('room') || lower.includes('notes') || lower.includes('slides') || lower.includes('rescheduled')) &&
    !mentionsOtp &&
    !hasUrgency &&
    !hasAdvanceFeeHooks &&
    matchedUrls.length === 0;

  // Legitimate routine bank debits without panic/links
  const isRoutineDebitSms =
    lower.includes('debited') &&
    (lower.includes('bal') || lower.includes('balance') || lower.includes('inr') || lower.includes('via upi')) &&
    !hasUrgency &&
    matchedUrls.length === 0 &&
    !lower.includes('click') &&
    !lower.includes('update kyc');

  if (isHarmlessContext) {
    score = 0;
    reasons.length = 0;
    category = 'Routine Communication';
    reasons.push('No urgent financial threats, credential solicitations, or deceptive links detected.');
    reasons.push('Message context matches normal academic, professional, or personal communication.');
  } else if (isRoutineDebitSms) {
    score = 5;
    reasons.length = 0;
    category = 'Legitimate Bank Transaction Alert';
    reasons.push('Standard transactional notification without urgent calls to action or suspicious external links.');
    reasons.push('Follows standard institutional banking format for routine debits.');
  } else if (reasons.length === 0) {
    // If no specific scam indicators fired at all
    score = 5;
    category = 'Routine Communication';
    reasons.push('No typical urgent fraud patterns, fake links, or credential harvesting requests detected.');
    reasons.push('Content appears non-anomalous based on offline heuristic rules.');
  }

  // Clamp final score strictly between 0 and 100
  const finalScore = Math.min(Math.max(score, 0), 100);

  // Exact Requested Thresholds:
  // LOW: 0–24
  // MEDIUM: 25–49
  // HIGH: 50–79
  // CRITICAL: 80–100
  let riskLevel: RiskLevel;
  let verdict: ScanVerdict;

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

  // Next steps & actions
  const safeNextSteps: string[] = [];
  let recommendedAction = '';

  if (riskLevel === 'CRITICAL' || riskLevel === 'HIGH') {
    recommendedAction = 'Do NOT click links, do NOT pay upfront fees, and NEVER share OTPs. Verify directly with the official organization.';
    safeNextSteps.push('Never disclose your OTP, ATM PIN, UPI MPIN, or NetBanking password to anyone.');
    safeNextSteps.push('Do NOT open embedded links or dial personal phone numbers found in the message.');
    safeNextSteps.push('If banking credentials or money were compromised, immediately call 1930 (National Cyber Crime Helpline) or visit cybercrime.gov.in.');
  } else if (riskLevel === 'MEDIUM') {
    recommendedAction = 'Exercise caution. Verify the sender identity through verified official channels before taking action.';
    safeNextSteps.push('Check the sender contact or URL carefully against verified official domains.');
    safeNextSteps.push('Do not share sensitive financial details or authorize unrequested transactions.');
  } else {
    recommendedAction = 'No immediate threat indicators found. Continue standard cybersecurity hygiene.';
    safeNextSteps.push('Always confirm transactions inside your official banking application.');
    safeNextSteps.push('Maintain awareness that scammers constantly evolve their phrasing.');
  }

  const explanation = {
    en: riskLevel === 'CRITICAL' || riskLevel === 'HIGH'
      ? `This message strongly exhibits markers of a ${category}. Scammers fabricate urgency, impersonate trusted institutions, or solicit private security credentials to conduct unauthorized financial actions.`
      : riskLevel === 'MEDIUM'
      ? `This message contains elements requiring caution (e.g., shortened links or financial notifications). Verify details directly inside your official app before proceeding.`
      : `No standard scam patterns or high-pressure tactics were detected. This appears to be routine communication, but always remain vigilant.`,
    te: riskLevel === 'CRITICAL' || riskLevel === 'HIGH'
      ? `ఈ సందేశంలో "${category}" కి సంబంధించిన తీవ్రమైన అనుమానాస్పద సంకేతాలు ఉన్నాయి. మోసగాళ్ళు భయం లేదా ఆశ చూపించి త్వరగా డబ్బులు లేదా వివరాలు పొందేందుకు ప్రయత్నిస్తారు.`
      : riskLevel === 'MEDIUM'
      ? `ఈ సందేశంలో జాగ్రత్త వహించవలసిన అంశాలు ఉన్నాయి. అధికారిక సంస్థతో వివరాలను సరిచూసుకోండి.`
      : `ఈ సందేశంలో సాధారణ మోసపూరిత గుర్తులు కనిపించలేదు. అయినప్పటికీ సురక్షిత బ్యాంకింగ్ పద్ధతులను పాటించండి.`,
  };

  return {
    riskScore: finalScore,
    riskLevel,
    verdict,
    category,
    reasons,
    urlComponents,
    recommendedAction,
    safeNextSteps,
    explanation,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    detectionMethod: 'Client-Side Offline Heuristic Engine',
    redactedInput: redactedText,
    isSyntheticDemo,
    disclaimer: 'Heuristic indicators are awareness assessments, not verified legal probabilities of fraud. May produce false positives or false negatives.',
  };
}

/**
 * Judge Testing Mode Sample Scenarios
 * One-click test cases covering all hackathon rubric requirements.
 */
export interface JudgeDemoSample {
  id: string;
  number: number;
  label: string;
  category: string;
  type: 'Message' | 'URL' | 'OTP' | 'Empty';
  text: string;
  expectedRisk: RiskLevel;
  description: string;
}

export const JUDGE_DEMO_SAMPLES: JudgeDemoSample[] = [
  {
    id: 'judge_fake_bank',
    number: 1,
    label: 'Fake Bank Verification',
    category: 'Fake Bank / KYC Verification Scam',
    type: 'Message',
    text: 'Dear SBI Customer, Your YONO Account has been suspended today due to pending KYC verification. Click http://sbi.bank-verify.top/login to update your PAN & Aadhaar immediately to avoid permanent closure.',
    expectedRisk: 'HIGH',
    description: 'Fabricated urgency + brand impersonation + unauthorized .top lookalike domain.',
  },
  {
    id: 'judge_otp_theft',
    number: 2,
    label: 'OTP Theft Attempt',
    category: 'Impersonation & OTP Harvesting',
    type: 'Message',
    text: 'Hello, this is Senior Executive Rajesh from Customer Support. We detected an unauthorized login attempt on your account. Please share the 6-digit OTP code sent to your mobile right now to cancel this debit and unblock your account.',
    expectedRisk: 'CRITICAL',
    description: 'Impersonation of customer support actively soliciting confidential OTP codes.',
  },
  {
    id: 'judge_delivery_fee',
    number: 3,
    label: 'Fake Delivery-Fee Message',
    category: 'Delivery-Fee / Courier Scam',
    type: 'Message',
    text: 'India Post Notice: Your parcel package #IN89219 is on hold at our distribution center due to an incorrect address. Pay ₹48 redelivery fee via http://indiapost-parcels.xyz/update to resume dispatch.',
    expectedRisk: 'HIGH',
    description: 'Fake postal parcel detention demanding a small upfront redelivery fee on an unverified link.',
  },
  {
    id: 'judge_fake_prize',
    number: 4,
    label: 'Fake Prize Claim',
    category: 'Fake Prize / Advance-Fee Lottery Fraud',
    type: 'Message',
    text: 'CONGRATULATIONS! Your mobile number won the 1st prize of ₹25,00,000 in the All India Mega Lucky Draw! To claim your cash prize, deposit ₹2,500 government processing fee via http://lucky-draw-reward.click.',
    expectedRisk: 'HIGH',
    description: 'Classic advance-fee fraud promising large lottery sums conditional on paying upfront fees.',
  },
  {
    id: 'judge_suspicious_job',
    number: 5,
    label: 'Suspicious Job Offer',
    category: 'Prepaid Task / Job Offer Scam',
    type: 'Message',
    text: 'Exclusive Part-Time Opportunity! Earn ₹4,000 - ₹8,000 daily from home just by liking YouTube videos and rating hotels on Google Maps. No experience needed. Contact HR Manager on Telegram: @daily_income_portal.',
    expectedRisk: 'HIGH',
    description: 'Unrealistic work-from-home earnings redirecting to unmonitored Telegram recruitment groups.',
  },
  {
    id: 'judge_harmless_class',
    number: 6,
    label: 'Harmless Class-Meeting Message',
    category: 'Routine Communication',
    type: 'Message',
    text: 'Hi everyone, our project team meeting for the cyber ethics assignment is rescheduled to Thursday at 3:30 PM in Room 402. Please bring your notes and finalized slides.',
    expectedRisk: 'LOW',
    description: 'Everyday non-malicious student communication. Demonstrates false-positive suppression.',
  },
  {
    id: 'judge_suspicious_url',
    number: 7,
    label: 'Suspicious URL',
    category: 'Suspicious URL & Hostname',
    type: 'URL',
    text: 'https://sbi.bank-login-secure.top/kyc/update-pan',
    expectedRisk: 'HIGH',
    description: 'Direct URL analysis checking deceptive subdomain, high-risk TLD, and brand spoofing.',
  },
  {
    id: 'judge_empty_input',
    number: 8,
    label: 'Empty or Invalid Input',
    category: 'Empty or Invalid Input',
    type: 'Empty',
    text: '',
    expectedRisk: 'LOW',
    description: 'Validates graceful error handling and zero risk score when no input is provided.',
  },
];
