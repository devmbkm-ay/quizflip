// import { configDotenv } from "dotenv";

// configDotenv

import dotenv from 'dotenv';
import path from 'path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/database.js';

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

//Error handler
app.use((req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error:
      process.env.NODE_ENV === 'development'
        ? err.message
        : 'Internal server error',
  });
});

//404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

export default app;
