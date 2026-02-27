import Card from '../models/Card.js';
import BaseRepository from './BaseRepository.js';

class CardRepository extends BaseRepository {
  constructor() {
    super(Card);
  }

  // Agrégation pour les catégories (très performant)
  async getCategoryBreakdown(userId) {
    return this.model.aggregate([
      { $match: { user: userId, isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { name: '$_id', count: 1, _id: 0 } },
    ]);
  }

  // Centralisation de la logique de sélection des cartes
  async findForStudy(userId, mode, limit) {
    const query = { user: userId, isActive: true };

    if (mode === 'difficult') {
      query['reviewStats.timesCorrect'] = { $lt: 3 };
    } else if (mode === 'spaced') {
      query.$or = [
        { 'reviewStats.lastReviewed': null },
        {
          'reviewStats.lastReviewed': {
            $lte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      ];
    }

    // Si mode random, on utilise l'agrégation $sample de MongoDB
    if (mode === 'random') {
      return this.model.aggregate([
        { $match: query },
        { $sample: { size: limit } },
      ]);
    }

    return this.model.find(query).limit(limit).exec();
  }
}

export default new CardRepository();
