import Card from '../models/card.js';
import BaseRepository from './BaseRepository.js';

class CardRepository extends BaseRepository {
  constructor() {
    super(Card);
  }

  async findByCategory(category, options = {}) {
    return this.find({ category, isActive: true }, options);
  }

  async search(term, options = {}) {
    const regex = new RegExp(term, 'i');
    return this.model
      .find(
        { isActive: true, $or: [{ front: regex }, { back: regex }] },
        null,
        options,
      )
      .exec();
  }

  async findDueForReview(userId, limit = 20) {
    // userId is ignored until auth is added
    const now = new Date();
    return this.find(
      { isActive: true, 'reviewStats.lastReviewed': { $lte: now } },
      { limit, sort: { 'reviewStats.lastReviewed': 1 } },
    );
  }

  async updateReviewStats(id, wasCorrect) {
    const update = {
      $inc: { 'reviewStats.timesReviewed': 1 },
      $set: { 'reviewStats.lastReviewed': new Date() },
    };
    if (wasCorrect) update.$inc['reviewStats.timesCorrect'] = 1;
    // `new` is deprecated; use `returnDocument: 'after'` for mongoose >=6.0
    return this.model
      .findByIdAndUpdate(id, update, { returnDocument: 'after' })
      .exec();
  }

  async getCategories() {
    return this.model.distinct('category', { isActive: true });
  }

  async getStudyStats(userId, start, end) {
    return this.model
      .aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .exec();
  }
}

export default new CardRepository();
