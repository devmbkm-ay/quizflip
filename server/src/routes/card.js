// server/src/routes/cards.js
import express from 'express';
import { body, param, validationResult } from 'express-validator';
import CardController from '../controllers/CardController.js';

const router = express.Router();

// Middleware to check validation results
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      messages: errors.array().map((e) => e.msg),
    });
  }
  next();
};

// Validation rules
const validateCardBody = [
  body('front')
    .trim()
    .notEmpty()
    .withMessage('Front text is required')
    .isLength({ max: 255 })
    .withMessage('Front text must be at most 255 characters'),
  body('back')
    .trim()
    .notEmpty()
    .withMessage('Back text is required')
    .isLength({ max: 500 })
    .withMessage('Back text must be at most 500 characters'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isLength({ max: 100 })
    .withMessage('Category must be at most 100 characters'),
  body('difficulty')
    .optional()
    .isIn([1, 2, 3])
    .withMessage('Difficulty must be 1 (easy), 2 (medium), or 3 (hard)'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  handleValidation, // Add this to check results
];

const validateObjectId = (field) => [
  param(field).isMongoId().withMessage(`Invalid ${field} format`),
  handleValidation, // Add this to check results
];

const validateReview = [
  param('id').isMongoId().withMessage('Invalid id format'),
  body('wasCorrect')
    .exists()
    .withMessage('wasCorrect is required')
    .isBoolean()
    .withMessage('wasCorrect must be a boolean'),
  handleValidation, // Add this to check results
];

// STATS & ANALYTICS
router.get('/stats/overview', CardController.getStats);
router.get('/stats/categories', CardController.getCategories);
router.get(
  '/stats/progress/:userId',
  ...validateObjectId('userId'),
  CardController.getProgressStats,
);

// STUDY SESSION
router.get('/study/session', CardController.getCardsForStudy);

// MAIN CRUD
router
  .route('/')
  .get(CardController.getAll)
  .post(validateCardBody, CardController.create);

router
  .route('/:id')
  .get(...validateObjectId('id'), CardController.getOne)
  .put(...validateObjectId('id'), validateCardBody, CardController.update)
  .delete(...validateObjectId('id'), CardController.delete);

// CARD ACTIONS
router.post('/:id/review', validateReview, CardController.review);

export default router;
