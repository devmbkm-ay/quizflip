// server/src/controllers/CardController.js
import Card from '../models/Card.js';
import StudySession from '../models/StudySession.js';
import asyncHandler from '../utils/asyncHandler.js';
import { NotFoundError } from '../utils/errors.js';

class CardController {
  // ==========================================
  // STATS & ANALYTICS
  // ==========================================

  getStats = asyncHandler(async (req, res) => {
    const totalCards = await Card.countDocuments({ isActive: true });
    const categories = await Card.distinct('category', { isActive: true });

    const categoryBreakdown = await Card.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { name: '$_id', count: 1, _id: 0 } },
    ]);

    res.json({
      success: true,
      data: {
        totalCards,
        totalCategories: categories.length,
        categoryBreakdown,
      },
    });
  });

  getCategories = asyncHandler(async (req, res) => {
    const categories = await Card.distinct('category', { isActive: true });
    res.json({ success: true, data: categories });
  });

  getProgressStats = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const sessions = await StudySession.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    let streak = 0;
    if (sessions.length > 0) {
      const studyDates = new Set(
        sessions.map((s) => s.createdAt.toISOString().split('T')[0]),
      );

      let currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      while (studyDates.has(currentDate.toISOString().split('T')[0])) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      }
    }

    const totalSessions = sessions.length;
    const correctSessions = sessions.filter((s) => s.wasCorrect).length;
    const accuracy =
      totalSessions > 0
        ? Math.round((correctSessions / totalSessions) * 100)
        : 0;

    res.json({
      success: true,
      data: { streak, totalSessions, accuracy, correctSessions },
    });
  });

  // ==========================================
  // STUDY SESSION
  // ==========================================

  getCardsForStudy = asyncHandler(async (req, res) => {
    const { mode = 'random', limit = 20 } = req.query;

    let cards;
    const limitNum = Math.min(parseInt(limit) || 20, 100);

    switch (mode) {
      case 'random':
        cards = await Card.aggregate([
          { $match: { isActive: true } },
          { $sample: { size: limitNum } },
        ]);
        break;
      case 'difficult':
        cards = await Card.find({
          isActive: true,
          'reviewStats.timesCorrect': { $lt: 3 },
        }).limit(limitNum);
        break;
      case 'spaced':
        cards = await Card.find({
          isActive: true,
          $or: [
            { 'reviewStats.lastReviewed': null },
            {
              'reviewStats.lastReviewed': {
                $lte: new Date(Date.now() - 24 * 60 * 60 * 1000),
              },
            },
          ],
        }).limit(limitNum);
        break;
      default:
        cards = await Card.find({ isActive: true }).limit(limitNum);
    }

    res.json({ success: true, count: cards.length, data: cards });
  });

  // ==========================================
  // MAIN CRUD
  // ==========================================

  getAll = asyncHandler(async (req, res) => {
    const { category, search, limit = 50 } = req.query;

    let filter = { isActive: true };

    if (category) filter.category = category.toLowerCase();

    if (search) {
      filter.$or = [
        { front: { $regex: search, $options: 'i' } },
        { back: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const cards = await Card.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({ success: true, count: cards.length, data: cards });
  });

  create = asyncHandler(async (req, res) => {
    const { front, back, category, difficulty, tags } = req.body;

    // Check for duplicate
    const existing = await Card.findOne({
      front: front.trim(),
      category: category.toLowerCase(),
      isActive: true,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Duplicate field value entered',
      });
    }

    const card = await Card.create({
      front: front.trim(),
      back: back.trim(),
      category: category.toLowerCase(),
      difficulty: difficulty || 2,
      tags: tags || [],
    });

    res.status(201).json({ success: true, data: card });
  });

  getOne = asyncHandler(async (req, res) => {
    // ID already validated by middleware
    const card = await Card.findById(req.params.id);

    if (!card || !card.isActive) {
      throw new NotFoundError('Card not found');
    }

    res.json({ success: true, data: card });
  });

  update = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = { ...req.body };

    // Clean up inputs
    if (updates.front) updates.front = updates.front.trim();
    if (updates.back) updates.back = updates.back.trim();
    if (updates.category) updates.category = updates.category.toLowerCase();

    // Check for duplicate if front/category changing
    if (updates.front && updates.category) {
      const existing = await Card.findOne({
        _id: { $ne: id },
        front: updates.front,
        category: updates.category,
        isActive: true,
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          error: 'Duplicate field value entered',
        });
      }
    }

    const updated = await Card.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      throw new NotFoundError('Card not found');
    }

    res.json({ success: true, data: updated });
  });

  delete = asyncHandler(async (req, res) => {
    const card = await Card.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true },
    );

    if (!card) {
      throw new NotFoundError('Card not found');
    }

    res.json({ success: true, message: 'Card deleted successfully' });
  });

  // ==========================================
  // CARD ACTIONS
  // ==========================================

  review = asyncHandler(async (req, res) => {
    // All validation done in middleware - wasCorrect exists and is boolean
    const { id } = req.params;
    const { wasCorrect } = req.body;

    const card = await Card.findById(id);
    if (!card || !card.isActive) {
      throw new NotFoundError('Card not found');
    }

    const update = {
      $inc: {
        'reviewStats.timesReviewed': 1,
        'reviewStats.timesCorrect': wasCorrect ? 1 : 0,
      },
      $set: {
        'reviewStats.lastReviewed': new Date(),
      },
    };

    const updated = await Card.findByIdAndUpdate(id, update, { new: true });

    res.json({ success: true, data: updated });
  });
}

export default new CardController();
