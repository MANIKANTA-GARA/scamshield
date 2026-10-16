import { Router } from 'express';
import { OtpScanRequestSchema, OtpScanResponseSchema } from '../schemas/index.js';
import { analyzeOtpMessage } from '../services/otpSafety.js';

export const otpRouter = Router();

otpRouter.post('/', (req, res, next) => {
  try {
    const validated = OtpScanRequestSchema.parse(req.body);
    const result = analyzeOtpMessage(validated.message);
    const parsedResponse = OtpScanResponseSchema.parse(result);
    return res.json(parsedResponse);
  } catch (error) {
    next(error);
  }
});
