const mongoose = require('mongoose');

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/beequip';

/**
 * Connects Mongoose to the local MongoDB Community server.
 * Throws if the database is not reachable (mongod not running, wrong URI...).
 */
async function connectToDatabase() {
  mongoose.set('strictQuery', true);

  await mongoose.connect(MONGODB_URI, {
    // Fail fast instead of hanging for ~30s when mongod is not running.
    serverSelectionTimeoutMS: 5000,
  });

  console.log(`[db] Connected to MongoDB at ${MONGODB_URI}`);
  return mongoose.connection;
}

module.exports = { connectToDatabase, MONGODB_URI };
