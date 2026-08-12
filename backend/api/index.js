const app = require('../src/app');
const connectDB = require('../src/config/db');

// Connect to MongoDB Atlas serverless instance
connectDB();

module.exports = app;
