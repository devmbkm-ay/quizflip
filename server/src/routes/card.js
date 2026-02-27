import express from 'express';
import { body, param } from 'express-validator';
import CardController from '../controllers/CardController.js';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// --- LOGIQUE NINJA : Protection Globale ---
// Toutes les routes définies ci-dessous passeront par le middleware protect.
// req.user sera injecté avec l'ID de l'utilisateur connecté.
router.use(protect);

// --- VALIDATIONS ---
const cardValidation = [
  body('front').trim().notEmpty().withMessage('Front text is required'),
  body('back').trim().notEmpty().withMessage('Back text is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
];

const batchValidation = [
  body('cards')
    .isArray({ min: 1, max: 100 })
    .withMessage('Must provide 1-100 cards'),
  body('cards.*.front').trim().notEmpty().withMessage('Front is required'),
  body('cards.*.back').trim().notEmpty().withMessage('Back is required'),
];

// --- ROUTES ---

// STATS
router.get('/stats/overview', CardController.getStats);
router.get('/stats/categories', CardController.getCategories);
// On a supprimé le :userId car on utilise req.user.id dans le contrôleur
router.get('/stats/progress', CardController.getProgressStats);

// STUDY
router.get('/study/session', CardController.getCardsForStudy);

// CRUD de base
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

// ACTIONS
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
