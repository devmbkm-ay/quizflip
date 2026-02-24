import rateLimit from 'express-rate-limit';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter for AI generation (expensive operations)
export const aiGenerationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 AI generations per minute per IP
  message: {
    success: false,
    error: 'AI generation rate limit exceeded. Please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip limit in development
  skip: () => process.env.NODE_ENV === 'development',
});
