import Card from '../models/card.js';
import BaseRepository from './BaseRepository.js';

class CardRepository extends BaseRepository {
  constructor() {
    super(Card);
  }
  /**
   * @param {string} userId - The ID of the user who owns the cards
   * @param {string} category - The category of cards to retrieve
   * @param {Object} options - Additional query options (e.g., pagination, sorting)
   * @returns {Promise<Array>} - A promise that resolves to an array of cards
   */
  async findByUserAndCategory(userId, category, options = {}) {
    return this.find({ user: userId, category, isActive: true }, options);
  }
  /**
   * Search for cards by term in front or back text
   * @param {string} userId - The ID of the user who owns the cards
   * @param {string} term - The search term to look for in front or back
   * @param {Object} options - Additional query options (e.g., pagination, sorting)
   * @returns {Promise<Array>} - A promise that resolves to an array of matching cards
   */
  async search(userId, term, options = {}) {
    const regex = new RegExp(term, 'i');
    return this.model
      .find(
        {
          user: userId,
          isActive: true,
          $or: [{ front: regex }, { back: regex }],
        },
        null,
        options,
      )
      .exec();
  }

  // Find cards that are due for review based on reviewStats.lastReviewed being in the past
  /**
   *
   * @param {string} userId - The ID of the user whose due cards are being retrieved
   * @param {number} limit - The maximum number of cards to retrieve
   * @returns {Promise<Array>} - A promise that resolves to an array of due cards
   */
  async findDueForReview(userId, limit = 20) {
    const now = new Date();
    return this.find(
      {
        user: userId,
        isActive: true,
        'reviewStats.lastReviewed': { $lte: now },
      },
      { limit, sort: { 'reviewStats.lastReviewed': 1 } },
    );
  }

  /**
   *
   * @param {string} id - The ID of the card to update
   * @param {string} userId - The ID of the user who owns the card
   * @param {Object} updateData - The data to update the card with
   * @returns {Promise<Object>} - A promise that resolves to the updated card document
   */
  async updateByUserAndId(id, userId, updateData) {
    return this.model
      .findOneAndUpdate({ _id: id, user: userId }, updateData, {
        new: true,
        runValidators: true,
      })
      .exec();
  }

  /**
   *
   * @param {string} id - The ID of the card to update review stats for
   * @param {boolean} wasCorrect - Whether the user answered correctly
   * @returns {Promise<Object>} - A promise that resolves to the updated card document
   */
  async updateReviewStats(id, wasCorrect) {
    const update = {
      $inc: { 'reviewStats.timesReviewed': 1 },
      $set: { 'reviewStats.lastReviewed': new Date() },
    };
    if (wasCorrect) update.$inc['reviewStats.timesCorrect'] = 1;

    return this.model
      .findByIdAndUpdate(id, update, { returnDocument: 'after' })
      .exec();
  }

  /**
   *
   * @returns
   */
  async getCategories() {
    return this.model.distinct('category', { isActive: true });
  }

  /**
   *
   * @param {string} userId - The ID of the user whose study stats are being retrieved
   * @param {Date} start - The start date for the study stats period
   * @param {Date} end - The end date for the study stats period
   * @returns {Promise<Array>} - A promise that resolves to an array of study statistics
   */
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
