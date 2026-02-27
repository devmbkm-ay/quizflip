import express from 'express';
import { aiGenerationLimiter } from '../middleware/rateLimiter.js';
import {
  generateCards,
  generateCardsBatchController,
  validateGenerateRequest,
  validateBatchRequest,
} from '../controllers/AiController.js';

const router = express.Router();

// POST /api/ai/generate - Generate cards from notes
router.post(
  '/generate',
  aiGenerationLimiter,
  validateGenerateRequest,
  generateCards,
);

// POST /api/ai/generate/batch - Generate cards from multiple topics
router.post(
  '/generate/batch',
  aiGenerationLimiter,
  validateBatchRequest,
  generateCardsBatchController,
);

export default router;
