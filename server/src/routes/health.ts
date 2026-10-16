import { Router } from 'express';
import { config } from '../config.js';

export const healthRouter = Router();

healthRouter.get('/', (req, res) => {
  const isGeminiConfigured = Boolean(
    config.geminiApiKey && 
    config.geminiApiKey.trim() !== '' && 
    config.geminiApiKey !== 'YOUR_GEMINI_API_KEY'
  );

  return res.json({
    status: 'ok',
    service: 'ScamShield AI Core Security Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    geminiConfigured: isGeminiConfigured,
    geminiModel: config.geminiModel,
    mode: isGeminiConfigured ? 'Live AI + Heuristic Backup' : 'Deterministic Heuristic Fallback Engine',
    shareTargetActive: true,
  });
});
