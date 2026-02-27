// server/src/services/CardService.js
import cardRepository from '../repositories/CardRepository.js';
import categoryRepository from '../repositories/CategoryRepository.js';
import studySessionRepository from '../repositories/StudySessionRepository.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';

class CardService {
  // basic CRUD used by controllers

  // Get cards with optional filters for category and search term
  async getAllCards(userId, filters = {}) {
    const { category, search, limit = 50 } = filters;

    if (search) {
      return cardRepository.search(userId, search, { limit });
    }

    if (category) {
      return cardRepository.findByUserAndCategory(userId, category, {
        limit,
      });
    }

    return cardRepository.find({ user: userId, isActive: true }, { limit });
  }

  // Get a single card by ID, ensuring it belongs to the user and is active
  async getCardById(id, userId) {
    const card = await cardRepository.findOne({
      _id: id,
      userId,
      isActive: true,
    });
    // If card is not found or inactive, throw a NotFoundError
    if (!card || !card.isActive) {
      throw new NotFoundError('Card not found');
    }
    // Return the found card
    return card;
  }

  // Create a new card with validation to prevent duplicates and ensure required fields
  async createCard(userId, cardData) {
    // Validate required fields and trim input
    if (!cardData.front?.trim() || !cardData.back?.trim()) {
      throw new ValidationError('Front and back content are required');
    }

    // Check for duplicate card with same front text in the same category for the user
    const existing = await cardRepository.findOne({
      user: userId,
      front: cardData.front.trim(),
      category: cardData.category?.toLowerCase(),
      isActive: true,
    });

    // If a duplicate exists, throw a ValidationError to prevent creation
    if (existing) {
      throw new ValidationError(
        'A card with this question already exists in this category',
      );
    }

    return cardRepository.create({
      ...cardData,
      user: userId, // Ensure the user ID is set on the new card
      category: cardData.category?.toLowerCase(),
      front: cardData.front.trim(),
      back: cardData.back.trim(),
    });
  }

  // Update an existing card with validation
  async updateCard(id, updateData) {
    const card = await cardRepository.findById(id);
    if (!card) throw new NotFoundError('Card not found');

    if (updateData.front) updateData.front = updateData.front.trim();
    if (updateData.back) updateData.back = updateData.back.trim();
    if (updateData.category)
      updateData.category = updateData.category.toLowerCase();

    return cardRepository.update(id, updateData);
  }

  // Soft delete a card by marking it as inactive
  async deleteCard(id, userId) {
    const card = await cardRepository.updateByUserAndId(id, userId, {
      isActive: false,
    });
    if (!card) {
      throw new NotFoundError('Card not found or already deleted');
    }
    return card;
  }

  // Record a review session for a card, updating review stats
  async recordReview(id, wasCorrect) {
    const card = await cardRepository.findById(id);
    if (!card) throw new NotFoundError('Card not found');

    return cardRepository.updateReviewStats(id, wasCorrect);
  }

  // Get distinct categories for active cards
  async getCategories() {
    return cardRepository.getCategories();
  }

  // Get overall stats for active cards, including total count and category breakdown

  // Optimized version to reduce database calls by using aggregation for category stats
  async getStats() {
    const [totalCards, categoryStatsRaw] = await Promise.all([
      cardRepository.count({ isActive: true }),
      cardRepository.getCountGroupedByCategory(),
    ]);
    return {
      totalCards,
      totalCategories: categoryStatsRaw.length,
    };
  }

  // async getStats() {
  //   const totalCards = await cardRepository.count({ isActive: true });
  //   const categories = await cardRepository.getCategories();

  //   const categoryStats = await Promise.all(
  //     categories.map(async (cat) => ({
  //       name: cat,
  //       count: await cardRepository.count({ category: cat, isActive: true }),
  //     })),
  //   );

  //   return {
  //     totalCards,
  //     totalCategories: categories.length,
  //     categoryBreakdown: categoryStats,
  //   };
  // }

  // leftover advanced methods
  // Get cards for study sessions based on mode (spaced repetition, random, difficult)
  async getCardsForStudy(userId, options = {}) {
    // ...existing implementation remains the same
    const { categoryId, mode = 'spaced', limit = 20 } = options;

    let cards;
    switch (mode) {
      case 'spaced':
        cards = await cardRepository.findDueForReview(userId, limit);
        break;
      case 'random':
        cards = await cardRepository.findByUserAndCategory(userId, categoryId, {
          limit,
          sort: { random: 1 },
        });
        break;
      case 'difficult':
        cards = await cardRepository.find(
          {
            userId,
            categoryId: categoryId || { $exists: true },
            'reviewStats.timesCorrect': { $lt: 3 },
          },
          { limit, sort: { 'reviewStats.timesCorrect': 1 } },
        );
        break;
      default:
        cards = await cardRepository.findByUserAndCategory(userId, categoryId, {
          limit,
        });
    }

    return cards;
  }

  // Record a study session for a card, updating review stats and session history
  async recordStudySession(userId, sessionData) {
    const { cardId, wasCorrect, timeSpent, studyMode } = sessionData;

    // Verify card ownership
    const card = await cardRepository.findOne({
      _id: cardId,
      userId,
    });

    if (!card) {
      throw new NotFoundError('Card not found');
    }

    // Update card review stats
    await cardRepository.updateReviewStats(cardId, wasCorrect);

    // Record session
    const session = await studySessionRepository.create({
      userId,
      cardId,
      categoryId: card.categoryId,
      wasCorrect,
      timeSpent,
      studyMode,
    });

    return session;
  }

  // Get progress stats for a user over a specified period (day, week, month)
  async getProgressStats(userId, period = 'week') {
    const now = new Date();
    let startDate;

    switch (period) {
      case 'day':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      default:
        startDate = new Date(0);
    }

    const [dailyStats, categoryBreakdown, totalMastery] = await Promise.all([
      cardRepository.getStudyStats(userId, startDate, new Date()),
      studySessionRepository.getCategoryBreakdown(userId, startDate),
      this.calculateOverallMastery(userId),
    ]);

    return {
      period,
      dailyStats,
      categoryBreakdown,
      totalMastery,
      streak: await this.calculateStreak(userId),
    };
  }

  // Calculate overall mastery percentage across all cards for the user
  async calculateOverallMastery(userId) {
    const stats = await cardRepository.model.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalCards: { $sum: 1 },
          averageReviews: { $avg: '$reviewStats.timesReviewed' },
          totalCorrect: { $sum: '$reviewStats.timesCorrect' },
          totalReviews: { $sum: '$reviewStats.timesReviewed' },
        },
      },
    ]);

    if (!stats.length) return 0;

    const { totalCorrect, totalReviews } = stats[0];
    return totalReviews > 0
      ? Math.round((totalCorrect / totalReviews) * 100)
      : 0;
  }

  // Calculate consecutive study days for streaks
  async calculateStreak(userId) {
    const sessions = await studySessionRepository.find(
      { userId },
      { sort: { createdAt: -1 } },
    );

    if (!sessions.length) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const studyDates = new Set(
      sessions.map((s) => s.createdAt.toISOString().split('T')[0]),
    );

    while (studyDates.has(currentDate.toISOString().split('T')[0])) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  }
}

export default new CardService();
