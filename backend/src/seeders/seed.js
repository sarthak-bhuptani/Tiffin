require('dotenv').config();
const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}
const mongoose = require('mongoose');
const User = require('../models/user.model');
const Customer = require('../models/customer.model');
const DailyTiffin = require('../models/dailyTiffin.model');
const Payment = require('../models/payment.model');
const Expense = require('../models/expense.model');
const logger = require('../utils/logger');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tiffin_db';
    await mongoose.connect(mongoUri);
    logger.info('Connected to MongoDB for seeding...');

    // Clear existing collections
    await User.deleteMany({});
    await Customer.deleteMany({});
    await DailyTiffin.deleteMany({});
    await Payment.deleteMany({});
    await Expense.deleteMany({});
    logger.info('Cleared existing database records.');

    // 1. Create Admin User
    const adminUser = await User.create({
      name: 'Business Owner',
      email: process.env.ADMIN_EMAIL || 'admin@tiffin.com',
      password: process.env.ADMIN_PASSWORD || 'Admin123!',
      role: 'admin',
    });
    logger.info(`Admin user created: ${adminUser.email}`);

    // 2. Create Sample Customers
    const customers = await Customer.insertMany([
      {
        name: 'Ramesh Patel',
        phone: '9876543210',
        address: 'House 12, Block A',
        area: 'Sector 6',
        defaultQuantity: 1,
        defaultPrice: 60,
        planType: 'daily',
        active: true,
        notes: 'Likes less spicy food',
      },
      {
        name: 'Meena Shah',
        phone: '9825098250',
        address: 'Flat 402, Sunshine Apts',
        area: 'Sector 6',
        defaultQuantity: 2,
        defaultPrice: 60,
        planType: 'daily',
        active: true,
        notes: '2 tiffins for family',
      },
      {
        name: 'Jayesh Joshi',
        phone: '9712397123',
        address: 'Shop 5, Main Bazaar',
        area: 'Market Area',
        defaultQuantity: 1,
        defaultPrice: 60,
        planType: 'daily',
        active: true,
      },
      {
        name: 'Amit Kumar',
        phone: '9909999099',
        address: 'Office 201, Tech Park',
        area: 'Sector 11',
        defaultQuantity: 1,
        defaultPrice: 60,
        planType: 'monthly',
        active: true,
      },
      {
        name: 'Pooja Vyas',
        phone: '9426094260',
        address: 'House 88, Green Park',
        area: 'Sector 11',
        defaultQuantity: 2,
        defaultPrice: 60,
        planType: 'daily',
        active: true,
      },
    ]);
    logger.info(`Created ${customers.length} regular customers.`);

    const todayStr = '2026-08-12';
    const yesterdayStr = '2026-08-11';
    const dayBeforeStr = '2026-08-10';

    // 3. Create Sample Daily Tiffins
    const tiffins = await DailyTiffin.insertMany([
      // Today (12 Aug 2026)
      {
        date: todayStr,
        customerId: customers[0]._id,
        customerName: 'Ramesh Patel',
        area: 'Sector 6',
        quantity: 1,
        unitPrice: 60,
        totalAmount: 60,
        status: 'delivered',
        paymentStatus: 'PAID',
        paidAmount: 60,
      },
      {
        date: todayStr,
        customerId: customers[1]._id,
        customerName: 'Meena Shah',
        area: 'Sector 6',
        quantity: 2,
        unitPrice: 60,
        totalAmount: 120,
        status: 'delivered',
        paymentStatus: 'PAID',
        paidAmount: 120,
      },
      {
        date: todayStr,
        customerId: customers[2]._id,
        customerName: 'Jayesh Joshi',
        area: 'Market Area',
        quantity: 1,
        unitPrice: 60,
        totalAmount: 60,
        status: 'delivered',
        paymentStatus: 'PENDING',
        paidAmount: 0,
      },
      {
        date: todayStr,
        customerId: customers[3]._id,
        customerName: 'Amit Kumar',
        area: 'Sector 11',
        quantity: 1,
        unitPrice: 60,
        totalAmount: 60,
        status: 'delivered',
        paymentStatus: 'PAID',
        paidAmount: 60,
      },
      {
        date: todayStr,
        customerId: customers[4]._id,
        customerName: 'Pooja Vyas',
        area: 'Sector 11',
        quantity: 2,
        unitPrice: 60,
        totalAmount: 120,
        status: 'delivered',
        paymentStatus: 'PAID',
        paidAmount: 120,
      },
      // Ad-hoc entry for today
      {
        date: todayStr,
        customerId: null,
        customerName: 'Sanjay (Adhoc Guest)',
        area: 'Sector 6',
        quantity: 1,
        unitPrice: 60,
        totalAmount: 60,
        status: 'delivered',
        paymentStatus: 'PAID',
        paidAmount: 60,
      },

      // Yesterday (11 Aug 2026)
      {
        date: yesterdayStr,
        customerId: customers[0]._id,
        customerName: 'Ramesh Patel',
        area: 'Sector 6',
        quantity: 1,
        unitPrice: 60,
        totalAmount: 60,
        status: 'delivered',
        paymentStatus: 'PAID',
        paidAmount: 60,
      },
      {
        date: yesterdayStr,
        customerId: customers[1]._id,
        customerName: 'Meena Shah',
        area: 'Sector 6',
        quantity: 0,
        unitPrice: 60,
        totalAmount: 0,
        status: 'skipped',
        skipReason: 'Out of town',
        paymentStatus: 'PAID',
        paidAmount: 0,
      },
      {
        date: yesterdayStr,
        customerId: customers[2]._id,
        customerName: 'Jayesh Joshi',
        area: 'Market Area',
        quantity: 1,
        unitPrice: 60,
        totalAmount: 60,
        status: 'delivered',
        paymentStatus: 'PENDING',
        paidAmount: 0,
      },

      // Day before (10 Aug 2026)
      {
        date: dayBeforeStr,
        customerId: customers[0]._id,
        customerName: 'Ramesh Patel',
        area: 'Sector 6',
        quantity: 1,
        unitPrice: 60,
        totalAmount: 60,
        status: 'delivered',
        paymentStatus: 'PAID',
        paidAmount: 60,
      },
    ]);
    logger.info(`Created ${tiffins.length} daily tiffin records.`);

    // 4. Create Sample Payments
    const payments = await Payment.insertMany([
      {
        customerId: customers[0]._id,
        customerName: 'Ramesh Patel',
        amount: 180,
        paymentDate: todayStr,
        paymentMethod: 'upi',
        notes: 'Monthly advance',
      },
      {
        customerId: customers[1]._id,
        customerName: 'Meena Shah',
        amount: 240,
        paymentDate: todayStr,
        paymentMethod: 'cash',
        notes: 'Weekly cash payment',
      },
    ]);
    logger.info(`Created ${payments.length} payment logs.`);

    // 5. Create Sample Expenses
    const expenses = await Expense.insertMany([
      {
        date: todayStr,
        category: 'vegetables',
        amount: 250,
        note: 'Tomato, potato, onion, green chili',
      },
      {
        date: todayStr,
        category: 'packaging',
        amount: 120,
        note: 'Containers and aluminum foil',
      },
      {
        date: todayStr,
        category: 'gas',
        amount: 50,
        note: 'Commercial gas daily portion',
      },
      {
        date: yesterdayStr,
        category: 'grocery',
        amount: 600,
        note: 'Rice 5kg, Wheat flour 10kg, Oil 2L',
      },
    ]);
    logger.info(`Created ${expenses.length} expense logs.`);

    logger.info('Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    logger.error(`Error during database seeding: ${error.message}`);
    process.exit(1);
  }
};

seedData();
