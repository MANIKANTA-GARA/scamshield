import { TransactionScanRequest, TransactionScanResponse } from '../schemas/index.js';

/**
 * Transaction Anomaly Rule-Based Demo Engine
 * Evaluates fictional transaction inputs using transparent, explainable heuristic thresholds.
 * Strictly labeled as an educational simulator, NOT a machine learning or banking fraud model.
 */

export function evaluateTransactionAnomaly(input: TransactionScanRequest): TransactionScanResponse {
  const flags: Array<{
    code: string;
    severity: 'high' | 'medium' | 'low' | 'info';
    title: string;
    description: string;
  }> = [];

  let anomalyScore = 0;

  // 1. Amount Spike Rule vs. Baseline
  const ratio = input.amount / (input.baselineAverage || 1);
  if (ratio >= 4.0 && input.amount > 10000) {
    flags.push({
      code: 'AMOUNT_SPIKE_SEVERE',
      severity: 'high',
      title: 'Extreme Deviation from Usual Spending',
      description: `Transaction amount (₹${input.amount.toLocaleString()}) is ${(ratio * 100).toFixed(0)}% of your average transaction baseline (₹${input.baselineAverage.toLocaleString()}). Sudden extreme surges are typical in social engineering drain attacks.`,
    });
    anomalyScore += 45;
  } else if (ratio >= 2.5 && input.amount > 5000) {
    flags.push({
      code: 'AMOUNT_SPIKE_MODERATE',
      severity: 'medium',
      title: 'Elevated Transaction Amount',
      description: `Amount is ${ratio.toFixed(1)}x greater than your typical baseline. Ensure you recognize the vendor before authorizing with your UPI PIN.`,
    });
    anomalyScore += 25;
  }

  // 2. Off-Hours / Nocturnal Time Window Rule (00:00 to 05:00)
  const [hourStr] = input.timeOfDay.split(':');
  const hour = parseInt(hourStr, 10);
  if (hour >= 0 && hour < 5) {
    flags.push({
      code: 'OFF_HOURS_WINDOW',
      severity: 'medium',
      title: 'Nocturnal / Off-Peak Time Window',
      description: `Transaction initiated at ${input.timeOfDay}. Transactions occurring between 12:00 AM and 5:00 AM represent elevated fraud vulnerability when victims may be asleep or disoriented by urgent callers.`,
    });
    anomalyScore += 25;
  }

  // 3. High Velocity / Burst Frequency Rule
  if (input.recentCount24h >= 6) {
    flags.push({
      code: 'HIGH_VELOCITY_BURST',
      severity: 'high',
      title: 'Unusually High 24-Hour Velocity',
      description: `${input.recentCount24h} transactions executed in the last 24 hours. Attackers who gain unauthorized access frequently perform repeated rapid transfers to deplete daily bank limits.`,
    });
    anomalyScore += 30;
  } else if (input.recentCount24h >= 4) {
    flags.push({
      code: 'MODERATE_VELOCITY',
      severity: 'medium',
      title: 'Elevated Daily Activity',
      description: `${input.recentCount24h} transactions in 24 hours exceeds normal single-user frequency.`,
    });
    anomalyScore += 15;
  }

  // 4. Recipient Handle / UPI ID Heuristics
  const handle = input.recipientHandle.toLowerCase();
  const suspiciousKeywords = ['win', 'prize', 'lottery', 'refund', 'cashback', 'crypto', 'double', 'earn', 'gift', 'fastpay', 'admin', 'telegram'];
  const hasSuspiciousWord = suspiciousKeywords.some(keyword => handle.includes(keyword));

  if (hasSuspiciousWord) {
    flags.push({
      code: 'DECEPTIVE_RECIPIENT_HANDLE',
      severity: 'high',
      title: 'High-Risk Recipient Identifier Keyword',
      description: `Recipient identifier ("${input.recipientHandle}") contains high-risk inducement words like prize, refund, or fastpay commonly registered by fraudsters.`,
    });
    anomalyScore += 40;
  } else if (!handle.includes('@') && /^[0-9]{10,}$/.test(handle)) {
    flags.push({
      code: 'UNVERIFIED_PHONE_RECIPIENT',
      severity: 'low',
      title: 'Direct Unverified Mobile Recipient',
      description: 'Transfer is directed to an unlabelled phone number without an established merchant handle.',
    });
    anomalyScore += 10;
  }

  // 5. Category Analysis
  if (input.category === 'Crypto/Gift Card' || input.category === 'Urgent Investment') {
    flags.push({
      code: 'HIGH_RISK_CATEGORY',
      severity: 'high',
      title: 'Irreversible High-Risk Category',
      description: `Transactions categorized under "${input.category}" are virtually irreversible once authorized and are the dominant vehicles for investment scams.`,
    });
    anomalyScore += 35;
  }

  // Calculate final status
  const finalScore = Math.min(Math.max(anomalyScore, 5), 98);
  let riskLevel: 'low' | 'medium' | 'high' | 'inconclusive' = 'low';

  if (finalScore >= 60) {
    riskLevel = 'high';
  } else if (finalScore >= 30) {
    riskLevel = 'medium';
  } else {
    riskLevel = 'low';
    flags.push({
      code: 'NORMAL_PATTERNS',
      severity: 'info',
      title: 'Within Expected Parameters',
      description: 'Amount, velocity, and timing align with standard non-anomalous consumer purchasing patterns.',
    });
  }

  const evaluationSummary = {
    en: riskLevel === 'high'
      ? `High anomaly index (${finalScore}/100) triggered by multiple risk multipliers: ${flags.map(f => f.title).join('; ')}.`
      : riskLevel === 'medium'
      ? `Moderate anomaly index (${finalScore}/100). The transaction has noticeable deviations from baseline spending or timing.`
      : `Low anomaly index (${finalScore}/100). The parameters fall within standard everyday spending thresholds.`,
    te: riskLevel === 'high'
      ? `ఈ లావాదేవీలో తీవ్రమైన అసహజత గుర్తించబడింది (${finalScore}/100): ${flags.map(f => f.title).join('; ')}.`
      : riskLevel === 'medium'
      ? `మధ్యస్థ అసహజత సూచిక (${finalScore}/100). లావాదేవీ సమయం లేదా మొత్తం సాధారణ ఖర్చు కంటే భిన్నంగా ఉంది.`
      : `తక్కువ ప్రమాదం (${finalScore}/100). లావాదేవీ సాధారణ పరిమితులలోనే ఉంది.`,
  };

  const recommendations = {
    en: [
      'Always double-check the recipient name displayed in your UPI app BEFORE typing your MPIN.',
      'Remember: UPI PIN is strictly for DEBITING funds from your account, never for receiving rewards.',
      'If you feel rushed or pressured by someone on the phone to complete this transfer, STOP and hang up.',
      'Set daily UPI transaction limits in your banking app to mitigate accidental large transfers.',
    ],
    te: [
      'UPI పిన్ నమోదు చేయడానికి ముందు గ్రహీత పేరును తప్పకుండా సరిచూసుకోండి.',
      'గుర్తుంచుకోండి: UPI PIN మీ ఖాతా నుండి డబ్బు పంపడానికి మాత్రమే, డబ్బు అందుకోవడానికి కాదు.',
      'ఎవరైనా ఫోన్‌లో త్వరపడమని ఒత్తిడి చేస్తుంటే, వెంటనే కాల్ కట్ చేయండి.',
      'మీ బ్యాంక్ యాప్‌లో రోజువారీ UPI పరిమితులను సెట్ చేసుకోండి.',
    ],
  };

  return {
    riskLevel,
    anomalyScore: finalScore,
    flags,
    evaluationSummary,
    recommendations,
    isRuleBasedDemo: true,
    disclaimer: 'RULE-BASED DEMO SIMULATOR ONLY: This module uses fictional parameters for educational demonstration. It does not monitor real bank accounts, connect to live payment gateways, or possess authority to halt bank transfers.',
  };
}
