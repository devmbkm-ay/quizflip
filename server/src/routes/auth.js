import express from 'express';
import { register, login, getAllUsers } from '../controllers/AuthController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/register - Register a new user
router.post('/register', register);

// POST /api/auth/login - Login user and return JWT token
router.post('/login', login);

// Example of a protected route that only admin users can access
router.get('/users', protect, authorize('admin'), getAllUsers);

export default router;
