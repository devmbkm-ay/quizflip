import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';

const sanitizeUser = (userDoc) => ({
  id: userDoc._id,
  username: userDoc.username,
  email: userDoc.email,
  role: userDoc.role,
  avatar: userDoc.avatar,
  isActive: userDoc.isActive,
  createdAt: userDoc.createdAt,
});

export const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  const user = await User.create({ username, email, password });
  const token = user.getSignedJwtToken();

  res.status(201).json({
    success: true,
    token,
    data: sanitizeUser(user),
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required',
    });
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials',
    });
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const token = user.getSignedJwtToken();
  res.json({
    success: true,
    token,
    data: sanitizeUser(user),
  });
});

export const getAllUsers = asyncHandler(async (_req, res) => {
  const users = await User.find().select('-password');
  res.json({
    success: true,
    count: users.length,
    data: users,
  });
});
