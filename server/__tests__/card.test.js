import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import app from '../src/app.js';
import Card from '../src/models/Card.js';
import StudySession from '../src/models/StudySession.js';

let mongoServer;

describe('Card API', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  beforeEach(async () => {
    await Card.deleteMany({});
    await StudySession.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  describe('POST /api/cards', () => {
    it('should create a new card', async () => {
      const res = await request(app).post('/api/cards').send({
        front: 'What is the capital of France?',
        back: 'Paris',
        category: 'Geography',
        difficulty: 1,
      });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.category).toBe('geography');
    });

    it('should return 400 for invalid card data (empty front)', async () => {
      const res = await request(app).post('/api/cards').send({
        front: '',
        back: 'Paris',
        category: 'Geography',
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Validation Error');
    });

    it('should return 400 for missing category', async () => {
      const res = await request(app).post('/api/cards').send({
        front: 'Question?',
        back: 'Answer!',
        // category missing
      });

      expect(res.statusCode).toBe(400);
    });

    it('should return 400 for duplicate card', async () => {
      await Card.create({
        front: 'Q1',
        back: 'A1',
        category: 'test',
      });

      const res = await request(app).post('/api/cards').send({
        front: 'Q1',
        back: 'A1',
        category: 'test',
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Duplicate field value entered');
    });
  });

  describe('GET /api/cards', () => {
    it('should get all cards', async () => {
      await Card.create([
        { front: 'Q1', back: 'A1', category: 'cat1' },
        { front: 'Q2', back: 'A2', category: 'cat2' },
      ]);

      const res = await request(app).get('/api/cards');

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(2);
    });

    it('should filter by category', async () => {
      await Card.create([
        { front: 'Q1', back: 'A1', category: 'javascript' },
        { front: 'Q2', back: 'A2', category: 'python' },
      ]);

      const res = await request(app).get('/api/cards?category=javascript');

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].category).toBe('javascript');
    });
  });

  describe('GET /api/cards/:id', () => {
    it('should return 400 for invalid ObjectId format', async () => {
      const res = await request(app).get('/api/cards/invalid-id');

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation Error');
    });

    it('should return 404 for non-existent card', async () => {
      const validId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/cards/${validId}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/cards/:id', () => {
    it('should update a card', async () => {
      const card = await Card.create({
        front: 'Original',
        back: 'Answer',
        category: 'test',
      });

      const res = await request(app).put(`/api/cards/${card._id}`).send({
        front: 'Updated',
        back: 'Answer',
        category: 'test', // category is required for update validation
        difficulty: 3,
      });

      expect(res.status).toBe(200);
      expect(res.body.data.front).toBe('Updated');
      expect(res.body.data.difficulty).toBe(3);
    });

    it('should prevent duplicate on update', async () => {
      await Card.create({
        front: 'Existing',
        back: 'Answer',
        category: 'test',
      });

      const card2 = await Card.create({
        front: 'To Update',
        back: 'Answer',
        category: 'test',
      });

      const res = await request(app).put(`/api/cards/${card2._id}`).send({
        front: 'Existing', // This would create duplicate
      });

      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/cards/:id', () => {
    it('should mark a card as inactive (soft delete)', async () => {
      const card = await Card.create({
        front: 'Delete me',
        back: 'Yes',
        category: 'test',
      });

      const res = await request(app).delete(`/api/cards/${card._id}`);

      expect(res.status).toBe(200);

      const updatedCard = await Card.findById(card._id);
      expect(updatedCard.isActive).toBe(false);
    });

    it('should return 400 for invalid ObjectId on delete', async () => {
      const res = await request(app).delete('/api/cards/invalid-id');

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/cards/:id/review', () => {
    it('should return 400 for invalid ObjectId', async () => {
      const res = await request(app)
        .post('/api/cards/invalid-id/review')
        .send({ wasCorrect: true });

      expect(res.status).toBe(400);
    });

    it('should return 400 if wasCorrect is missing', async () => {
      const card = await Card.create({
        front: 'Q',
        back: 'A',
        category: 'test',
      });

      const res = await request(app)
        .post(`/api/cards/${card._id}/review`)
        .send({});

      expect(res.status).toBe(400);
    });

    it('should return 400 if wasCorrect is not boolean', async () => {
      const card = await Card.create({
        front: 'Q',
        back: 'A',
        category: 'test',
      });

      const res = await request(app)
        .post(`/api/cards/${card._id}/review`)
        .send({ wasCorrect: 'yes' });

      expect(res.status).toBe(400);
    });

    it('should record a correct review and update mastery to 100%', async () => {
      const card = await Card.create({
        front: 'Q1',
        back: 'A1',
        category: 'test',
      });

      const res = await request(app)
        .post(`/api/cards/${card._id}/review`)
        .send({ wasCorrect: true });

      expect(res.status).toBe(200);
      expect(res.body.data.reviewStats.timesReviewed).toBe(1);
      expect(res.body.data.reviewStats.timesCorrect).toBe(1);
      expect(res.body.data.mastery).toBe(100);
    });

    it('should record an incorrect review and update mastery to 0%', async () => {
      const card = await Card.create({
        front: 'Q1',
        back: 'A1',
        category: 'test',
      });

      const res = await request(app)
        .post(`/api/cards/${card._id}/review`)
        .send({ wasCorrect: false });

      expect(res.status).toBe(200);
      expect(res.body.data.reviewStats.timesReviewed).toBe(1);
      expect(res.body.data.reviewStats.timesCorrect).toBe(0);
      expect(res.body.data.mastery).toBe(0);
    });

    it('should return 404 for non-existent card', async () => {
      const validId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post(`/api/cards/${validId}/review`)
        .send({ wasCorrect: true });

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/cards/stats/overview', () => {
    it('should return correct summary stats', async () => {
      await Card.create([
        { front: 'Q1', back: 'A1', category: 'node', isActive: true },
        { front: 'Q2', back: 'A2', category: 'node', isActive: true },
        { front: 'Q3', back: 'A3', category: 'react', isActive: true },
      ]);

      const res = await request(app).get('/api/cards/stats/overview');

      expect(res.status).toBe(200);
      expect(res.body.data.totalCards).toBe(3);
      expect(res.body.data.totalCategories).toBe(2);
      expect(res.body.data.categoryBreakdown).toHaveLength(2);
    });
  });

  describe('GET /api/cards/stats/categories', () => {
    it('should return all unique categories', async () => {
      await Card.create([
        { front: 'Q1', back: 'A1', category: 'javascript' },
        { front: 'Q2', back: 'A2', category: 'python' },
        { front: 'Q3', back: 'A3', category: 'javascript' }, // duplicate category
      ]);

      const res = await request(app).get('/api/cards/stats/categories');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data).toContain('javascript');
      expect(res.body.data).toContain('python');
    });
  });

  describe('GET /api/cards/stats/progress/:userId', () => {
    it('should return 400 for invalid userId', async () => {
      const res = await request(app).get(
        '/api/cards/stats/progress/invalid-id',
      );

      expect(res.status).toBe(400);
    });

    it('should return progress stats with zero streak for new user', async () => {
      const userId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/cards/stats/progress/${userId}`);

      expect(res.status).toBe(200);
      expect(res.body.data.streak).toBe(0);
      expect(res.body.data.totalSessions).toBe(0);
      expect(res.body.data.accuracy).toBe(0);
    });

    it('should calculate a 3-day streak correctly', async () => {
      const userId = new mongoose.Types.ObjectId();
      const cardId = new mongoose.Types.ObjectId();

      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize to start of day
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const dayBefore = new Date(today);
      dayBefore.setDate(dayBefore.getDate() - 2);

      await StudySession.create([
        { userId, cardId, createdAt: today, wasCorrect: true },
        { userId, cardId, createdAt: yesterday, wasCorrect: true },
        { userId, cardId, createdAt: dayBefore, wasCorrect: true },
      ]);

      const res = await request(app).get(`/api/cards/stats/progress/${userId}`);

      expect(res.status).toBe(200);
      expect(res.body.data.streak).toBe(3);
      // expect(res.body.data.totalSessions).toBe(3);
      // expect(res.body.data.accuracy).toBe(100);
    });
  });

  describe('GET /api/cards/study/session', () => {
    it('should get random cards for study', async () => {
      await Card.create([
        { front: 'Q1', back: 'A1', category: 'test1' },
        { front: 'Q2', back: 'A2', category: 'test2' },
        { front: 'Q3', back: 'A3', category: 'test3' },
      ]);

      const res = await request(app).get('/api/cards/study/session');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should respect limit parameter', async () => {
      await Card.create(
        Array(10)
          .fill(null)
          .map((_, i) => ({
            front: `Q${i}`,
            back: `A${i}`,
            category: 'test',
          })),
      );

      const res = await request(app).get('/api/cards/study/session?limit=5');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(5);
    });

    it('should filter by mode=difficult', async () => {
      await Card.create([
        {
          front: 'Easy',
          back: 'A',
          category: 'test',
          reviewStats: { timesCorrect: 5 },
        },
        {
          front: 'Hard',
          back: 'A',
          category: 'test',
          reviewStats: { timesCorrect: 1 },
        },
      ]);

      const res = await request(app).get(
        '/api/cards/study/session?mode=difficult',
      );

      expect(res.status).toBe(200);
      // Should only return cards with timesCorrect < 3
      expect(res.body.data.every((c) => c.reviewStats.timesCorrect < 3)).toBe(
        true,
      );
    });
  });
});
