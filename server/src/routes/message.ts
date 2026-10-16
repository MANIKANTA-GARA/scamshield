import { Router } from 'express';
import { MessageScanRequestSchema, MessageScanResponseSchema } from '../schemas/index.js';
import { analyzeMessageWithGemini } from '../services/gemini.js';

export const messageRouter = Router();

messageRouter.post('/', async (req, res, next) => {
  try {
    const validated = MessageScanRequestSchema.parse(req.body);
    const result = await analyzeMessageWithGemini({
      rawText: validated.text,
      language: validated.language,
    });
    const parsedResponse = MessageScanResponseSchema.parse(result);
    return res.json(parsedResponse);
  } catch (error) {
    next(error);
  }
});
