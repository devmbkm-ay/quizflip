import cardRepository from '../repositories/CardRepository.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

class CardService {
  async getFullStats(userId) {
    const [totalCards, categoryBreakdown] = await Promise.all([
      cardRepository.count({ user: userId, isActive: true }),
      cardRepository.getCategoryBreakdown(userId),
    ]);
    return { totalCards, categoryBreakdown };
  }

  async getCategories(userId) {
    return await cardRepository.distinct('category', {
      user: userId,
      isActive: true,
    });
  }

  async getProgressStats(userId) {
    // Note: Tu devras peut-être adapter ton StudySessionRepository pour findByUser
    const sessions = await cardRepository.getStudySessions(userId);

    // Logique Ninja : On calcule ici
    let streak = 0;
    // ... insère ici ta logique de calcul de streak basée sur 'sessions' ...

    return { streak, totalSessions: sessions.length };
  }

  async getAllCards(userId, query) {
    return await cardRepository.search(userId, query.search, {
      category: query.category,
      limit: query.limit,
    });
  }

  async getCardById(id, userId) {
    const card = await cardRepository.findOne({
      _id: id,
      user: userId,
      isActive: true,
    });
    if (!card) throw new NotFoundError();
    return card;
  }

  async createCard(userId, data) {
    // Normalisation Ninja
    const cleanData = {
      ...data,
      user: userId,
      category: data.category?.toLowerCase().trim(),
      front: data.front?.trim(),
      back: data.back?.trim(),
    };
    return await cardRepository.create(cleanData);
  }

  async updateCard(id, userId, data) {
    const card = await cardRepository.updateSecure(id, userId, data);
    if (!card) throw new NotFoundError();
    return card;
  }

  async deleteCard(id, userId) {
    const card = await cardRepository.updateSecure(id, userId, {
      isActive: false,
    });
    if (!card) throw new NotFoundError();
    return card;
  }
}

export default new CardService();
