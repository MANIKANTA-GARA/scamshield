/**
 * Client-Side Sensitive Data Redaction
 * Ensures sensitive OTP digits and card numbers are masked directly in browser memory.
 */

export interface ClientRedactionResult {
  redactedText: string;
  hasRedactedOtp: boolean;
  redactedCount: number;
}

export function redactClientSensitiveData(input: string): ClientRedactionResult {
  if (!input) return { redactedText: '', hasRedactedOtp: false, redactedCount: 0 };
  let text = input;
  let redactedCount = 0;
  let hasRedactedOtp = false;

  // 1. Redact credit/debit card numbers (13-19 continuous or spaced digits)
  const cardPattern = /\b(?:\d[ -]*?){13,19}\b/g;
  text = text.replace(cardPattern, (match) => {
    const digitsOnly = match.replace(/\D/g, '');
    if (digitsOnly.length >= 13 && digitsOnly.length <= 19) {
      redactedCount++;
      return `[CARD-XXXX-${digitsOnly.slice(-4)}]`;
    }
    return match;
  });

  // 2. Redact Aadhaar 12 digits
  const aadhaarPattern = /\b\d{4}\s\d{4}\s\d{4}\b/g;
  text = text.replace(aadhaarPattern, () => {
    redactedCount++;
    return '[AADHAAR-XXXX]';
  });

  // 3. Redact Contextual OTPs
  const contextualOtpPattern = /(?:otp|code|pin|secret|verification|one[- ]time[- ]password|auth)\s*(?:is|:|-|=|\s)\s*([0-9]{4,8})\b/gi;
  text = text.replace(contextualOtpPattern, (fullMatch, otpCode) => {
    hasRedactedOtp = true;
    redactedCount++;
    return fullMatch.replace(otpCode, '[REDACTED-OTP]');
  });

  // 4. Redact standalone digit sequences in authentication contexts
  if (/\b(?:otp|one[- ]time|verification|bank|pin|upi|txn|transaction|debit|credit)\b/i.test(text)) {
    const standaloneDigitPattern = /\b([0-9]{4,8})\b/g;
    text = text.replace(standaloneDigitPattern, (match) => {
      if (['2023', '2024', '2025', '2026', '2027'].includes(match)) {
        return match;
      }
      hasRedactedOtp = true;
      redactedCount++;
      return '[REDACTED-CODE]';
    });
  }

  return {
    redactedText: text,
    hasRedactedOtp,
    redactedCount,
  };
}
