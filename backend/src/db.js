const mongoose = require('mongoose');

let isConnected = false;

async function connectToDatabase() {
  if (isConnected) return mongoose.connection;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Missing MONGODB_URI in environment');
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(uri);
  isConnected = true;

  return mongoose.connection;
}

module.exports = { connectToDatabase };

