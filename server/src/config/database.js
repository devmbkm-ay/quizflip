import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Function to connect to MongoDB using Mongoose
const connectDB = async () => {
  try {
    // Use the new connection string format if provided, otherwise fallback to the old one
    const conn = await mongoose.connect(process.env.MONGODB_URI, {});
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB ConnectionError: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
