const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Customer = require('../models/customer.model');
const DailyTiffin = require('../models/dailyTiffin.model');
const Payment = require('../models/payment.model');
const Expense = require('../models/expense.model');
const logger = require('../utils/logger');

const clearDatabase = async () => {
  try {
    await connectDB();
    logger.info('Clearing dummy sample data from MongoDB Atlas database...');

    await Customer.deleteMany({});
    await DailyTiffin.deleteMany({});
    await Payment.deleteMany({});
    await Expense.deleteMany({});

    logger.info('✅ Successfully deleted all sample data! Database is now 100% clean and ready for real business entries.');
    process.exit(0);
  } catch (error) {
    logger.error(`Error clearing database: ${error.message}`);
    process.exit(1);
  }
};

clearDatabase();
