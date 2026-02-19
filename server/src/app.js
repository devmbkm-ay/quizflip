// import { configDotenv } from "dotenv";

// configDotenv

import dotenv from 'dotenv';
import path from 'path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/database.js';

//import routes
import cardRoutes from './routes/card.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

//Initialize Express app
const app = express();

//Connect to MongoDB
connectDB();

//Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

//Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
  });
});

//API Routes
app.use('/api/cards', cardRoutes);

//Error handler
// app.use((req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({
//     success: false,
//     error:
//       process.env.NODE_ENV === 'development'
//         ? err.message
//         : 'Internal server error',
//   });
// });

//404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

//Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  //Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      messages,
    });
  }

  //Mongoogse duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      error: 'Duplicate field value entered',
    });
  }

  //Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'Resource not found',
    });
  }

  // Operational errors (custom AppError)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  //Programming or unknown errors
  res.status(500).json({
    success: false,
    error:
      process.env.NODE_ENV === 'development'
        ? err.message
        : 'Internal server error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(
    `API Documentation available at http://localhost:${PORT}/api-docs`,
  );
  console.log(`GET http://localhost:${PORT}/api/health`);
  console.log(`GET http://localhost:${PORT}/api/cards`);
  console.log(`POST http://localhost:${PORT}/api/cards`);
});

export default app;
