const app = require('../src/app');
const connectDB = require('../src/config/db');

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('Serverless DB connection error:', err);
    return res.status(500).json({
      success: false,
      message: `Database Connection Failed: ${err.message}. Please check Network Access (0.0.0.0/0) in MongoDB Atlas.`,
    });
  }
  return app(req, res);
};
