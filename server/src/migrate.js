import mongoose from 'mongoose';
import Card from './models/Card.js';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function migrate() {
  try {
    // Utilise la variable MONGODB_URI de ton .env (celle qui pointe vers Atlas)
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

    if (!uri) {
      throw new Error('MONGODB_URI non trouvée dans le fichier .env');
    }

    console.log('Connexion à MongoDB Atlas...');
    await mongoose.connect(uri);
    console.log('Connecté avec succès !');

    // 1. Trouve ton utilisateur (Vérifie bien l'email exact)
    const user = await User.findOne({ email: 'aymard@gmail.com' });

    if (!user) {
      console.error('Utilisateur non trouvé sur Atlas !');
      // Petit debug : on liste les emails présents
      const allUsers = await User.find({}, 'email');
      console.log(
        'Emails trouvés en base :',
        allUsers.map((u) => u.email),
      );
      process.exit(1);
    }

    // 2. Migration des cartes orphelines
    const result = await Card.updateMany(
      { user: { $exists: false } },
      { $set: { user: user._id } },
    );

    console.log(
      `Mission accomplie : ${result.modifiedCount} cartes rattachées à ${user.username}.`,
    );
  } catch (error) {
    console.error('Erreur :', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

migrate();
