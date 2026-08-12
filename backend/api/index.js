const app = require('../src/app');
const connectDB = require('../src/config/db');

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('Serverless DB connection error:', err);
  }
  return app(req, res);
};
