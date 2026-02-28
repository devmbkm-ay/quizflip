import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';

// Middleware to protect routes and check for valid JWT token
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in Authorization header (Bearer token) or cookies
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }
  // If no token found, return unauthorized
  if (!token) {
    return res
      .status(401)
      .json({ message: 'Not authorized to access this route' });
  }
  try {
    // Verify token and attach user to request
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from database and exclude password
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({
        message: 'User associated with this token no longer exists',
      });
    }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token is not valid or expired' });
  }
});

// Middleware to check if user has required role(s) for access
/**We use a higher-order function here to allow passing in different roles 
for different routes, making it flexible and reusable across the application.) */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized to access this route' });
    }
    // Check if user's role is in the allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};
