import express from 'express';
import { body, param } from 'express-validator';
import CardController from '../controllers/CardController.js'; // Vérifie bien le nom du fichier
import { validate } from '../middleware/validate.js'; // Utilisons notre middleware de validation centralisé

const router = express.Router();

// STATS & ANALYTICS
router.get('/stats/overview', CardController.getStats);
router.get('/stats/categories', CardController.getCategories);

router.get('/stats/progress/:userId', CardController.getProgressStats);

// STUDY SESSION
router.get('/study/session', CardController.getCardsForStudy);

// MAIN CRUD
// Validation rules (définies plus bas ou importées)
const cardValidation = [
  body('front').trim().notEmpty().withMessage('Front text is required'),
  body('back').trim().notEmpty().withMessage('Back text is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
];

const batchValidation = [
  body('cards')
    .isArray({ min: 1, max: 100 })
    .withMessage('cards must be an array with 1 to 100 items'),
  body('cards.*.front')
    .trim()
    .notEmpty()
    .withMessage('Each card front text is required'),
  body('cards.*.back')
    .trim()
    .notEmpty()
    .withMessage('Each card back text is required'),
  body('cards.*.category')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Each card category must be at most 100 characters'),
  body('cards.*.difficulty')
    .optional()
    .isIn([1, 2, 3])
    .withMessage(
      'Each card difficulty must be 1 (easy), 2 (medium), or 3 (hard)',
    ),
  body('cards.*.tags')
    .optional()
    .isArray()
    .withMessage('Each card tags field must be an array'),
];

router
  .route('/')
  .get(CardController.getAll)
  .post(cardValidation, validate, CardController.create);

router.post('/batch', batchValidation, validate, CardController.createBatch);

router
  .route('/:id')
  .get(param('id').isMongoId(), validate, CardController.getOne)
  .put(param('id').isMongoId(), cardValidation, validate, CardController.update)
  .delete(param('id').isMongoId(), validate, CardController.delete);

// CARD ACTIONS
router.post(
  '/:id/review',
  [
    param('id').isMongoId(),
    body('wasCorrect').isBoolean().withMessage('wasCorrect must be a boolean'),
  ],
  validate,
  CardController.review,
);

export default router;
