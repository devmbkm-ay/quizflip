import express from 'express';
import { body } from 'express-validator';
import CardController from '../controllers/CardController.js';

const router = express.Router();

const validateCard = [
  body('front')
    .trim()
    .notEmpty()
    .withMessage('Front text is required')
    .isLength({ max: 255 })
    .withMessage('Front text must be at most 255 characters long'),
  body('back')
    .trim()
    .notEmpty()
    .withMessage('Back text is required')
    .isLength({ max: 500 })
    .withMessage('Back text must be at most 500 characters long'),
  body('category')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Category must be at most 100 characters long'),
  body('difficulty')
    .optional()
    .isIn([1, 2, 3])
    .withMessage(
      'Difficulty must be one of: 1 (easy), 2 (medium), or 3 (hard)',
    ),
];

//Routes
router.get('/stats/overview', CardController.getStats);
router.get('/stats/categories', CardController.getCategories);
router.post('/', validateCard, CardController.create);

router
  .route('/')
  .get(CardController.getAll)
  .post(validateCard, CardController.create);

router
  .route('/:id')
  .get(CardController.getOne)
  .put(validateCard, CardController.update)
  .delete(CardController.delete);

router.post('/:id/review', CardController.review);

export default router;
