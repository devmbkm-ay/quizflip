import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Function to connect to MongoDB using Mongoose
const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!uri) {
    throw new Error('Neither MONGODB_URI nor MONGO_URI is defined');
  }

  // Retry loop avoids startup crashes when Mongo DNS/health is not ready yet.
  let attempts = 0;
  while (attempts < 30) {
    attempts += 1;
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      console.error(`MongoDB ConnectionError (attempt ${attempts}/30): ${error.message}`);
      await sleep(2000);
    }
  }

  throw new Error('MongoDB is unreachable after 30 attempts');
};

export default connectDB;
