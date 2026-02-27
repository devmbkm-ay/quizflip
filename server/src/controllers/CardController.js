// server/src/controllers/CardController.js
import mongoose from 'mongoose';
import Card from '../models/Card.js';
import StudySession from '../models/StudySession.js';
import asyncHandler from '../utils/asyncHandler.js';
import { NotFoundError } from '../utils/errors.js';

const isAdmin = (req) => req.user?.role === 'admin';

const getReadScope = (req, { allowAdminUserFilter = false } = {}) => {
  const scope = { isActive: true };

  if (!isAdmin(req)) {
    scope.user = req.user._id;
    return scope;
  }

  if (allowAdminUserFilter && req.query.userId) {
    if (mongoose.Types.ObjectId.isValid(req.query.userId)) {
      scope.user = req.query.userId;
    }
  }

  return scope;
};

const getWritableUserId = (req) => {
  if (isAdmin(req) && req.body?.userId) {
    if (mongoose.Types.ObjectId.isValid(req.body.userId)) {
      return req.body.userId;
    }
  }

  return req.user._id;
};

class CardController {
  // ==========================================
  // STATS & ANALYTICS
  // ==========================================

  getStats = asyncHandler(async (req, res) => {
    const readScope = getReadScope(req, { allowAdminUserFilter: true });
    const totalCards = await Card.countDocuments(readScope);
    const categories = await Card.distinct('category', readScope);

    const categoryBreakdown = await Card.aggregate([
      { $match: readScope },
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
    const readScope = getReadScope(req, { allowAdminUserFilter: true });
    const categories = await Card.distinct('category', readScope);
    res.json({ success: true, data: categories });
  });

  getProgressStats = asyncHandler(async (req, res) => {
    let targetUserId = req.user._id;
    if (
      isAdmin(req) &&
      req.query.userId &&
      mongoose.Types.ObjectId.isValid(req.query.userId)
    ) {
      targetUserId = req.query.userId;
    }

    const sessions = await StudySession.find({ userId: targetUserId })
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
    const limitNum = Math.min(parseInt(limit, 10) || 20, 100);
    const readScope = getReadScope(req, { allowAdminUserFilter: true });

    switch (mode) {
      case 'random':
        cards = await Card.aggregate([
          { $match: readScope },
          { $sample: { size: limitNum } },
        ]);
        break;
      case 'difficult':
        cards = await Card.find({
          ...readScope,
          'reviewStats.timesCorrect': { $lt: 3 },
        }).limit(limitNum);
        break;
      case 'spaced':
        cards = await Card.find({
          ...readScope,
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
        cards = await Card.find(readScope).limit(limitNum);
    }

    res.json({ success: true, count: cards.length, data: cards });
  });

  // ==========================================
  // MAIN CRUD
  // ==========================================

  getAll = asyncHandler(async (req, res) => {
    const { category, search, limit = 50 } = req.query;

    const filter = getReadScope(req, { allowAdminUserFilter: true });

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
      .limit(parseInt(limit, 10));

    res.json({ success: true, count: cards.length, data: cards });
  });

  create = asyncHandler(async (req, res) => {
    const { front, back, category, difficulty, tags } = req.body;
    const ownerId = getWritableUserId(req);
    const normalizedFront = front.trim();
    const normalizedBack = back.trim();
    const normalizedCategory = category.toLowerCase().trim();

    // Block only exact duplicates inside the same category for the same owner.
    const existing = await Card.findOne({
      user: ownerId,
      front: normalizedFront,
      back: normalizedBack,
      category: normalizedCategory,
      isActive: true,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error:
          'An identical card already exists in this category (same front and back).',
      });
    }

    const card = await Card.create({
      front: normalizedFront,
      back: normalizedBack,
      category: normalizedCategory,
      difficulty: difficulty || 2,
      tags: tags || [],
      user: ownerId,
    });

    res.status(201).json({ success: true, data: card });
  });

  createBatch = asyncHandler(async (req, res) => {
    const ownerId = getWritableUserId(req);
    const cards = Array.isArray(req.body.cards) ? req.body.cards : [];

    const normalizedCards = cards.map((card) => ({
      front: card.front.trim(),
      back: card.back.trim(),
      category: (card.category || 'general').toLowerCase().trim(),
      difficulty: card.difficulty || 2,
      tags: Array.isArray(card.tags) ? card.tags : [],
      user: ownerId,
    }));

    if (normalizedCards.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No cards provided for batch creation',
      });
    }

    const duplicateChecks = normalizedCards.map((card) => ({
      user: ownerId,
      front: card.front,
      back: card.back,
      category: card.category,
      isActive: true,
    }));

    const existingCards = await Card.find({ $or: duplicateChecks })
      .select('user front back category')
      .lean();

    const existingKeys = new Set(
      existingCards.map(
        (card) => `${card.user}::${card.front}::${card.back}::${card.category}`,
      ),
    );

    const cardsToCreate = normalizedCards.filter(
      (card) =>
        !existingKeys.has(
          `${card.user}::${card.front}::${card.back}::${card.category}`,
        ),
    );

    if (cardsToCreate.length === 0) {
      return res.status(400).json({
        success: false,
        error:
          'All submitted cards already exist in this category (same front and back).',
      });
    }

    const created = await Card.insertMany(cardsToCreate, { ordered: false });

    return res.status(201).json({
      success: true,
      count: created.length,
      skipped: normalizedCards.length - created.length,
      data: created,
    });
  });

  getOne = asyncHandler(async (req, res) => {
    // ID already validated by middleware
    const filter = { _id: req.params.id, ...getReadScope(req) };
    const card = await Card.findOne(filter);

    if (!card) {
      throw new NotFoundError('Card not found');
    }

    res.json({ success: true, data: card });
  });

  update = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = {};
    const allowedFields = ['front', 'back', 'category', 'difficulty', 'tags'];
    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    }

    // Clean up inputs
    if (updates.front) updates.front = updates.front.trim();
    if (updates.back) updates.back = updates.back.trim();
    if (updates.category) updates.category = updates.category.toLowerCase();

    const updateFilter = { _id: id, ...getReadScope(req) };

    // Check for duplicate when front/back/category combination changes.
    if (updates.front || updates.back || updates.category) {
      const current = await Card.findOne(updateFilter).lean();
      if (!current) {
        throw new NotFoundError('Card not found');
      }

      const candidateFront = (updates.front ?? current.front).trim();
      const candidateBack = (updates.back ?? current.back).trim();
      const candidateCategory = (updates.category ?? current.category)
        .toLowerCase()
        .trim();

      const existing = await Card.findOne({
        _id: { $ne: id },
        user: current.user,
        front: candidateFront,
        back: candidateBack,
        category: candidateCategory,
        isActive: true,
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          error:
            'An identical card already exists in this category (same front and back).',
        });
      }
    }

    const updated = await Card.findOneAndUpdate(updateFilter, updates, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      throw new NotFoundError('Card not found');
    }

    res.json({ success: true, data: updated });
  });

  delete = asyncHandler(async (req, res) => {
    const filter = { _id: req.params.id, ...getReadScope(req) };
    const card = await Card.findOneAndUpdate(
      filter,
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

    const filter = { _id: id, ...getReadScope(req) };
    const card = await Card.findOne(filter);
    if (!card) {
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

    const updated = await Card.findOneAndUpdate(filter, update, { new: true });

    res.json({ success: true, data: updated });
  });
}

export default new CardController();
