import {
  generateCardsFromNotes,
  generateCardsBatch,
} from '../services/GoogleAPIService.js';
import { body, validationResult } from 'express-validator';

export const validateGenerateRequest = [
  body('notes')
    .trim()
    .isLength({ min: 10, max: 10000 })
    .withMessage('Notes must be between 10 and 10000 characters'),
  body('category')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Category must be between 1 and 50 characters'),
  body('count')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('Count must be between 1 and 20'),
];

export const validateBatchRequest = [
  body('topics')
    .isArray({ min: 1, max: 5 })
    .withMessage('Topics must be an array with 1-5 items'),
  body('topics.*')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Each topic must be between 10 and 5000 characters'),
  body('category').optional().trim().isLength({ min: 1, max: 50 }),
  body('cardsPerTopic').optional().isInt({ min: 1, max: 10 }),
];

export const generateCards = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: errors.array(),
      });
    }

    const { notes, category, count = 5 } = req.body;

    const result = await generateCardsFromNotes(
      notes,
      category,
      parseInt(count),
    );

    res.status(200).json({
      success: true,
      data: result.cards,
      meta: {
        generated: result.generatedCount,
        valid: result.validCount,
        validationErrors: result.errors,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const generateCardsBatchController = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: errors.array(),
      });
    }

    const { topics, category, cardsPerTopic = 3 } = req.body;

    const result = await generateCardsBatch(
      topics,
      category,
      parseInt(cardsPerTopic),
    );

    res.status(200).json({
      success: true,
      data: result.cards,
      meta: {
        totalCards: result.cards.length,
        successfulTopics: result.successful.length,
        failedTopics: result.errors.length,
        errors: result.errors.length > 0 ? result.errors : undefined,
      },
    });
  } catch (error) {
    next(error);
  }
};
