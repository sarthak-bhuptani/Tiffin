const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const User = require('../src/models/user.model');
const Customer = require('../src/models/customer.model');
const DailyTiffin = require('../src/models/dailyTiffin.model');
const Expense = require('../src/models/expense.model');
const Payment = require('../src/models/payment.model');

let mongoServer;
let authToken;
let createdCustomerId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // Seed admin user for tests
  await User.create({
    name: 'Test Owner',
    email: 'admin@tiffin.com',
    password: 'Admin123!',
    role: 'admin',
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Tiffin Business Manager API Suite', () => {
  // 1. Authentication Test
  it('POST /api/auth/login - should authenticate admin and return JWT token', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@tiffin.com',
      password: 'Admin123!',
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    authToken = res.body.data.token;
  });

  // 2. Create Regular Customer Test
  it('POST /api/customers - should create a new regular customer', async () => {
    const res = await request(app)
      .post('/api/customers')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Ramesh Patel',
        phone: '9876543210',
        area: 'Sector 6',
        defaultQuantity: 1,
        defaultPrice: 60,
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.customer.name).toBe('Ramesh Patel');
    createdCustomerId = res.body.data.customer._id;
  });

  // 3. Single Daily Tiffin Entry Test
  it('POST /api/tiffins - should record single daily tiffin entry', async () => {
    const res = await request(app)
      .post('/api/tiffins')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        date: '2026-08-12',
        customerId: createdCustomerId,
        customerName: 'Ramesh Patel',
        area: 'Sector 6',
        quantity: 1,
        unitPrice: 60,
        status: 'delivered',
        paymentStatus: 'PAID',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tiffin.totalAmount).toBe(60);
    expect(res.body.data.tiffin.paidAmount).toBe(60);
  });

  // 4. Bulk Daily Tiffin Entry Test
  it('POST /api/tiffins/bulk - should record bulk notebook entries', async () => {
    const res = await request(app)
      .post('/api/tiffins/bulk')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        date: '2026-08-12',
        entries: [
          {
            customerName: 'Meena Shah',
            area: 'Sector 6',
            quantity: 2,
            unitPrice: 60,
            status: 'delivered',
            paymentStatus: 'PAID',
          },
          {
            customerName: 'Jayesh Joshi',
            area: 'Market Area',
            quantity: 1,
            unitPrice: 60,
            status: 'delivered',
            paymentStatus: 'PENDING',
          },
        ],
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.count).toBe(2);
    expect(res.body.data.summary.totalIncome).toBe(180);
    expect(res.body.data.summary.paidAmount).toBe(120);
    expect(res.body.data.summary.pendingAmount).toBe(60);
  });

  // 5. Payment Logging Test
  it('POST /api/payments - should record customer payment', async () => {
    const res = await request(app)
      .post('/api/payments')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        customerId: createdCustomerId,
        amount: 300,
        paymentDate: '2026-08-12',
        paymentMethod: 'upi',
        notes: 'Advance payment',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.payment.amount).toBe(300);
  });

  // 6. Expense Logging Test
  it('POST /api/expenses - should record daily expense', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        date: '2026-08-12',
        category: 'vegetables',
        amount: 100,
        note: 'Fresh tomatoes & spinach',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.expense.amount).toBe(100);
  });

  // 7. Today Dashboard Calculation Test
  it("GET /api/dashboard/today - should calculate today's income, expenses, and net profit correctly", async () => {
    const res = await request(app)
      .get('/api/dashboard/today?date=2026-08-12')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);

    const summary = res.body.data.summary;
    // Billed income: Ramesh 60 + Meena 120 + Jayesh 60 = 240
    expect(summary.billedIncome).toBe(240);
    // Expenses: 100
    expect(summary.totalExpenses).toBe(100);
    // Net profit billed: 240 - 100 = 140
    expect(summary.netProfitBilled).toBe(140);
  });

  // 8. Monthly Profit Calculation Test
  it('GET /api/reports/monthly - should calculate monthly financial totals', async () => {
    const res = await request(app)
      .get('/api/reports/monthly?year=2026&month=8')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.summary.totalBilled).toBe(240);
    expect(res.body.data.summary.totalExpenses).toBe(100);
    expect(res.body.data.summary.netProfit).toBe(140);
  });
});
