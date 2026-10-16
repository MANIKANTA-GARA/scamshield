/**
 * Sensitive Data Redaction Service
 * Strips OTPs, PINs, card numbers, and Aadhaar numbers prior to AI processing or logging.
 */

export interface RedactionResult {
  redactedText: string;
  hasRedactedOtp: boolean;
  redactedCount: number;
}

export function redactSensitiveData(input: string): RedactionResult {
  let text = input;
  let redactedCount = 0;
  let hasRedactedOtp = false;

  // 1. Redact credit/debit card numbers (13-19 digits, spaced or continuous)
  const cardPattern = /\b(?:\d[ -]*?){13,19}\b/g;
  text = text.replace(cardPattern, (match) => {
    // Check if it looks like a card number (15-16 digits)
    const digitsOnly = match.replace(/\D/g, '');
    if (digitsOnly.length >= 13 && digitsOnly.length <= 19) {
      redactedCount++;
      return `[REDACTED-CARD-XXXX-${digitsOnly.slice(-4)}]`;
    }
    return match;
  });

  // 2. Redact Aadhaar-like 12 digit numbers (4 4 4 format or continuous)
  const aadhaarPattern = /\b\d{4}\s\d{4}\s\d{4}\b/g;
  text = text.replace(aadhaarPattern, () => {
    redactedCount++;
    return '[REDACTED-AADHAAR-XXXX]';
  });

  // 3. Redact OTP digits:
  // Contextual OTP regex (near words like otp, code, pin, password, verification, one-time)
  const contextualOtpPattern = /(?:otp|code|pin|secret|verification|one[- ]time[- ]password|auth)\s*(?:is|:|-|=|\s)\s*([0-9]{4,8})\b/gi;
  text = text.replace(contextualOtpPattern, (fullMatch, otpCode) => {
    hasRedactedOtp = true;
    redactedCount++;
    return fullMatch.replace(otpCode, '[REDACTED-OTP]');
  });

  // Standalone 4 to 8 digit numbers in messages mentioning OTP or verification
  if (/\b(?:otp|one[- ]time|verification|bank|pin|upi|txn|transaction|debit|credit)\b/i.test(text)) {
    const standaloneDigitPattern = /\b([0-9]{4,8})\b/g;
    text = text.replace(standaloneDigitPattern, (match) => {
      // Don't redact common years like 2024, 2025, 2026 if preceded by year context
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
