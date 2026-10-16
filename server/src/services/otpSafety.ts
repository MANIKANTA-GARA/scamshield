import { OtpScanResponse } from '../schemas/index.js';
import { redactSensitiveData } from './redaction.js';

/**
 * OTP Safety Analyzer Service
 * Enforces strict redaction, decodes context, warns against social engineering,
 * and clarifies that unexpected OTPs do not by themselves prove account compromise.
 */

export function analyzeOtpMessage(rawMessage: string): OtpScanResponse {
  // Always redact any numbers that look like OTPs or cards immediately
  const { redactedText, hasRedactedOtp } = redactSensitiveData(rawMessage);
  const lower = rawMessage.toLowerCase();

  // Detect likely context
  let suspectedContext = 'General Authentication / Verification';
  let riskLevel: 'low' | 'medium' | 'high' | 'inconclusive' = 'low';

  // Check if the message contains explicit social engineering red flags
  const isSocialEngineering = 
    lower.includes('call back') ||
    lower.includes('share this') ||
    lower.includes('forward to') ||
    lower.includes('teller') ||
    lower.includes('executive will call') ||
    lower.includes('to cancel this charge call') ||
    lower.includes('if not you call') ||
    lower.includes('urgent');

  if (lower.includes('debit') || lower.includes('purchase') || lower.includes('txn') || lower.includes('inr') || lower.includes('rs.')) {
    suspectedContext = 'Card Payment or Merchant Debit Authorization';
  } else if (lower.includes('login') || lower.includes('sign in') || lower.includes('device') || lower.includes('access')) {
    suspectedContext = 'Account Login or New Device Registration';
  } else if (lower.includes('password reset') || lower.includes('forgot password') || lower.includes('reset pin')) {
    suspectedContext = 'Password or Security PIN Reset Request';
  } else if (lower.includes('upi') || lower.includes('mandate') || lower.includes('autopay')) {
    suspectedContext = 'UPI AutoPay or Standing Mandate Setup';
  } else if (lower.includes('kyc') || lower.includes('aadhaar') || lower.includes('pan')) {
    suspectedContext = 'Identity or KYC Document Verification';
  }

  if (isSocialEngineering) {
    riskLevel = 'high';
  } else if (hasRedactedOtp) {
    riskLevel = 'medium'; // Unexpected OTP warrants elevated awareness
  }

  const criticalWarning = {
    en: 'CRITICAL WARNING: NEVER SHARE YOUR OTP, PIN, OR PASSWORD WITH ANYONE. Bank staff, customer support, police, or delivery executives will NEVER ask for your OTP. Anyone asking for an OTP is attempting fraud.',
    te: 'ముఖ్యమైన హెచ్చరిక: మీ OTP, PIN లేదా పాస్‌వర్డ్‌ను ఎవరితోనూ పంచుకోవద్దు. బ్యాంక్ అధికారులు లేదా పోలీసు సిబ్బంది ఎప్పుడూ OTP అడగరు. OTP అడిగే వ్యక్తి ఖచ్చితంగా మోసగాడే.',
  };

  const officialCheckGuidance = {
    en: 'If you did NOT request this OTP: Do not panic. An unexpected OTP often happens when another customer mistypes their phone number, or an automated bot probes login portals. However, to ensure your safety: (1) Open your official banking app and review recent transactions. (2) Check if your email or online banking password needs updating. (3) Never call phone numbers listed in unexpected SMS messages.',
    te: 'మీరు ఈ OTP కోసం ప్రయత్నించకపోతే: భయపడవద్దు. ఎవరైనా పొరపాటున మీ ఫోన్ నంబర్ టైప్ చేసినప్పుడు కూడా ఇలా జరుగుతుంది. భద్రత కోసం: (1) మీ అధికారిక బ్యాంక్ యాప్ తెరిచి లావాదేవీలను తనిఖీ చేయండి. (2) అవసరమైతే నెట్‌బ్యాంకింగ్ పాస్‌వర్డ్ మార్చుకోండి. (3) SMS లో ఉన్న ఫోన్ నంబర్లకు కాల్ చేయవద్దు.',
  };

  const explanation = {
    en: isSocialEngineering
      ? `This message demonstrates high-risk social engineering markers. It asks you to call an unofficial number or share credentials under the pretext of canceling an unauthorized transaction.`
      : hasRedactedOtp
      ? `Detected an authentication code context: "${suspectedContext}". If you initiated this login or transaction, the code is your confidential verification key. If unexpected, someone may be attempting to sign in using your mobile number.`
      : `No clear OTP digits were detected in the message, but it pertains to "${suspectedContext}". Always treat account security notifications with care.`,
    te: isSocialEngineering
      ? `ఈ సందేశంలో తీవ్రమైన మోసపూరిత గుర్తులు ఉన్నాయి. లావాదేవీని రద్దు చేయడానికి ఫోన్ చేయమని లేదా OTP చెప్పమని మోసగాళ్ళు కోరుతున్నారు.`
      : hasRedactedOtp
      ? `ధృవీకరణ కోడ్ గుర్తించబడింది: "${suspectedContext}". మీరు ఈ లావాదేవీ చేయకపోతే, గుర్తుతెలియని వ్యక్తులు మీ ఖాతాలోకి ప్రవేశించడానికి ప్రయత్నిస్తుండవచ్చు.`
      : `స్పష్టమైన OTP నంబర్ కనిపించలేదు, అయితే ఇది "${suspectedContext}" కి సంబంధించిన సందేశం. జాగ్రత్తగా ఉండండి.`,
  };

  const safeNextSteps = {
    en: [
      'Keep this OTP strictly private — do not disclose it verbally, via chat, or through remote screen sharing apps (e.g. AnyDesk, TeamViewer).',
      'If an unrequested transaction is mentioned, check your actual bank account balance using your installed bank app.',
      'If you suspect account compromise, immediately use your bank app to temporarily freeze cards and net banking.',
      'Report any suspicious impersonation to India National Cybercrime Helpline 1930.',
    ],
    te: [
      'ఈ OTP ని పూర్తిగా రహస్యంగా ఉంచండి — ఎవరికీ ఫోన్‌లో లేదా చాట్‌లో చెప్పవద్దు.',
      'మీరు చేయని లావాదేవీ గురించి సందేశం వస్తే, మీ బ్యాంక్ యాప్‌లో ఖాతా నిల్వను తనిఖీ చేయండి.',
      'అనుమానం ఉంటే మీ బ్యాంక్ యాప్ ద్వారా కార్డును తాత్కాలికంగా బ్లాక్ చేసుకోండి.',
      'అనుమానాస్పద సైబర్ మోసాలను జాతీయ హెల్ప్‌లైన్ 1930 కి నివేదించండి.',
    ],
  };

  return {
    redactedMessage: redactedText,
    detectedOtpPattern: hasRedactedOtp,
    riskLevel,
    suspectedContext,
    explanation,
    safeNextSteps,
    officialCheckGuidance,
    criticalWarning,
    disclaimer: 'ScamShield does not verify bank authentication events or inspect live banking servers. We never ask for or store actual OTP codes.',
  };
}
