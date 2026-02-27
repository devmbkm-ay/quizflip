import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Card from '../../models/Card.js';

dotenv.config();

async function wakeUpCards() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI non définie');
    }

    await mongoose.connect(process.env.MONGODB_URI);

    const result = await Card.updateMany(
      { isActive: { $ne: true } }, // optimisation
      { $set: { isActive: true } },
    );

    console.log(`✔ ${result.modifiedCount} cartes activées.`);
  } catch (error) {
    console.error('❌ Erreur :', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

wakeUpCards();
