import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10), // 1 min
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '45', 10), // 45 req/min
  maxInputLength: 4000,
  threatIntelApiKey: process.env.THREAT_INTEL_API_KEY || '',
};
