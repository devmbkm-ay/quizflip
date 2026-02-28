import connectDB from './config/database.js';
import app from './app.js';
import seedDevUser from './utils/scripts/seedDevUser.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await seedDevUser();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
