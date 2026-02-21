import cardService from '../services/CardService.js';
import asyncHandler from '../utils/asyncHandler.js';

// console.log('⛓ cardService keys:', Object.keys(cardService));
// sometimes default export may be nested under .default
if (!cardService.getAllCards && cardService.default) {
  console.log('⛓ cardService.default keys:', Object.keys(cardService.default));
}

class CardController {
  // GET /api/cards
  getAll = asyncHandler(async (req, res) => {
    const { category, search, limit } = req.query;
    const cards = await cardService.getAllCards({ category, search, limit });

    res.json({
      success: true,
      count: cards.length,
      data: cards,
    });
  });

  // GET /api/cards/:id
  getOne = asyncHandler(async (req, res) => {
    const card = await cardService.getCardById(req.params.id);

    res.json({
      success: true,
      data: card,
    });
  });

  // POST /api/cards
  create = asyncHandler(async (req, res) => {
    const card = await cardService.createCard(req.body);
    console.log('CREATED CARD:', card);

    res.status(201).json({
      success: true,
      data: card,
    });
  });

  // PUT /api/cards/:id
  update = asyncHandler(async (req, res) => {
    const card = await cardService.updateCard(req.params.id, req.body);

    res.json({
      success: true,
      data: card,
    });
  });

  // DELETE /api/cards/:id
  delete = asyncHandler(async (req, res) => {
    await cardService.deleteCard(req.params.id);

    res.json({
      success: true,
      message: 'Card deleted successfully',
    });
  });

  // POST /api/cards/:id/review
  review = asyncHandler(async (req, res) => {
    const { wasCorrect } = req.body;

    if (typeof wasCorrect !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'wasCorrect (boolean) is required',
      });
    }

    const card = await cardService.recordReview(req.params.id, wasCorrect);

    res.json({
      success: true,
      data: card,
    });
  });

  // GET /api/cards/stats/categories
  getCategories = asyncHandler(async (req, res) => {
    const categories = await cardService.getCategories();

    res.json({
      success: true,
      data: categories,
    });
  });

  // GET /api/cards/stats/overview
  getStats = asyncHandler(async (req, res) => {
    const stats = await cardService.getStats();

    res.json({
      success: true,
      data: stats,
    });
  });
}

export default new CardController();
