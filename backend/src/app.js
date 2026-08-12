const express = require('express');
const cors = require('cors');
const setupSwagger = require('./config/swagger');
const errorHandler = require('./middleware/error.middleware');

const authRoutes = require('./routes/auth.routes');
const customerRoutes = require('./routes/customer.routes');
const tiffinRoutes = require('./routes/tiffin.routes');
const paymentRoutes = require('./routes/payment.routes');
const expenseRoutes = require('./routes/expense.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const reportRoutes = require('./routes/report.routes');

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check & Root Welcome
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Tiffin Business Manager API Server is live',
    documentation: '/api-docs',
    health: '/api/health',
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Tiffin API is healthy and running' });
});

// Swagger API Docs
setupSwagger(app);

// Mount REST Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/tiffins', tiffinRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);

// Catch 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;
