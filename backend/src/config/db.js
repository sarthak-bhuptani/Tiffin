const mongoose = require('mongoose');
const dns = require('dns');

// Apply DNS fallback for local Windows dev only
if (process.platform === 'win32') {
  try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
    if (dns.setDefaultResultOrder) {
      dns.setDefaultResultOrder('ipv4first');
    }
  } catch (e) {}
}

const logger = require('../utils/logger');

let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState === 1) {
    return;
  }

  // Cloud MongoDB Atlas fallback URI
  const mongoUri =
    process.env.MONGO_URI ||
    'mongodb+srv://mrsarthak825_db_user:zerWK9e37LxgSKaK@cluster0.t8snekz.mongodb.net/tiffin_db?retryWrites=true&w=majority';

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    isConnected = true;
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
