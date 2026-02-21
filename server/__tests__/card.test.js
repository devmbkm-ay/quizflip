import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import app from '../src/app.js';
import Card from '../src/models/card.js';

let mongoServer;

describe('Card API', () => {
  // Start in-memory MongoDB before all tests
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    await mongoose.connect(uri);
  });

  // Clear data between tests
  beforeEach(async () => {
    await Card.deleteMany({});
  });

  // Close DB and stop server
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

    it('should return 400 for invalid card data', async () => {
      const res = await request(app).post('/api/cards').send({
        front: '',
        back: 'Paris',
        category: 'Geography',
        difficulty: 1,
      });

      expect(res.statusCode).toBe(400);
    });
    it('should return 400 for invalid ObjectId', async () => {
      const res = await request(app)
        .post('/api/cards/invalid-id/review')
        .send({ wasCorrect: true });

      expect(res.status).toBe(400);
    });
    it('should return 400 if wasCorrect missing', async () => {
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
    });
  });

  describe('POST /api/cards/:id/review', () => {
    it('should record a review', async () => {
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
      expect(res.body.data.mastery).toBe(100);
    });
  });
});
