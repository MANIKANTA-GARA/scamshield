import { z } from 'zod';

export const RiskLevelEnum = z.enum(['low', 'medium', 'high', 'inconclusive']);
export type RiskLevel = z.infer<typeof RiskLevelEnum>;

// Message Scan Schema
export const MessageScanRequestSchema = z.object({
  text: z.string().min(1, 'Message text is required').max(4000, 'Text exceeds 4000 character limit'),
  language: z.enum(['en', 'te']).default('en'),
});
export type MessageScanRequest = z.infer<typeof MessageScanRequestSchema>;

export const MessageScanResponseSchema = z.object({
  category: z.string(),
  riskLevel: RiskLevelEnum,
  heuristicScore: z.number().min(0).max(100),
  evidenceIndicators: z.array(z.string()),
  explanation: z.object({
    en: z.string(),
    te: z.string(),
  }),
  safeNextSteps: z.object({
    en: z.array(z.string()),
    te: z.array(z.string()),
  }),
  uncertaintyNotes: z.string(),
  isAiPowered: z.boolean(),
  redactedPreview: z.string(),
  disclaimer: z.string(),
});
export type MessageScanResponse = z.infer<typeof MessageScanResponseSchema>;

// URL Scan Schema
export const UrlScanRequestSchema = z.object({
  url: z.string().min(1, 'URL is required').max(2048, 'URL exceeds 2048 characters'),
});
export type UrlScanRequest = z.infer<typeof UrlScanRequestSchema>;

export const UrlIndicatorSchema = z.object({
  type: z.enum(['danger', 'warning', 'info', 'safe']),
  title: z.string(),
  description: z.string(),
});

export const UrlScanResponseSchema = z.object({
  submittedUrl: z.string(),
  parsedDomain: z.string(),
  protocol: z.string(),
  riskLevel: RiskLevelEnum,
  heuristicScore: z.number().min(0).max(100),
  indicators: z.array(UrlIndicatorSchema),
  threatIntelResult: z.object({
    checked: z.boolean(),
    source: z.string(),
    flagged: z.boolean(),
    details: z.string(),
  }),
  explanation: z.object({
    en: z.string(),
    te: z.string(),
  }),
  safeNextSteps: z.object({
    en: z.array(z.string()),
    te: z.array(z.string()),
  }),
  uncertaintyNotes: z.string(),
  disclaimer: z.string(),
});
export type UrlScanResponse = z.infer<typeof UrlScanResponseSchema>;

// OTP Safety Schema
export const OtpScanRequestSchema = z.object({
  message: z.string().min(1, 'Message is required').max(2000, 'Message exceeds 2000 characters'),
  language: z.enum(['en', 'te']).default('en'),
});
export type OtpScanRequest = z.infer<typeof OtpScanRequestSchema>;

export const OtpScanResponseSchema = z.object({
  redactedMessage: z.string(),
  detectedOtpPattern: z.boolean(),
  riskLevel: RiskLevelEnum,
  suspectedContext: z.string(),
  explanation: z.object({
    en: z.string(),
    te: z.string(),
  }),
  safeNextSteps: z.object({
    en: z.array(z.string()),
    te: z.array(z.string()),
  }),
  officialCheckGuidance: z.object({
    en: z.string(),
    te: z.string(),
  }),
  criticalWarning: z.object({
    en: z.string(),
    te: z.string(),
  }),
  disclaimer: z.string(),
});
export type OtpScanResponse = z.infer<typeof OtpScanResponseSchema>;

// Transaction Anomaly Schema
export const TransactionScanRequestSchema = z.object({
  amount: z.number().positive('Amount must be positive').max(100000000, 'Amount too high for demo'),
  baselineAverage: z.number().nonnegative('Baseline must be 0 or positive').default(2000),
  timeOfDay: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be HH:MM in 24hr format'),
  recipientHandle: z.string().min(1, 'Recipient UPI ID or name is required').max(100),
  recentCount24h: z.number().int().nonnegative('Recent count must be non-negative').default(1),
  category: z.string().default('P2P Transfer'),
});
export type TransactionScanRequest = z.infer<typeof TransactionScanRequestSchema>;

export const TransactionScanResponseSchema = z.object({
  riskLevel: RiskLevelEnum,
  anomalyScore: z.number().min(0).max(100),
  flags: z.array(z.object({
    code: z.string(),
    severity: z.enum(['high', 'medium', 'low', 'info']),
    title: z.string(),
    description: z.string(),
  })),
  evaluationSummary: z.object({
    en: z.string(),
    te: z.string(),
  }),
  recommendations: z.object({
    en: z.array(z.string()),
    te: z.array(z.string()),
  }),
  isRuleBasedDemo: z.literal(true),
  disclaimer: z.string(),
});
export type TransactionScanResponse = z.infer<typeof TransactionScanResponseSchema>;

// Share Target Form Schema
export const ShareTargetFormSchema = z.object({
  title: z.string().optional(),
  text: z.string().optional(),
  url: z.string().optional(),
});
