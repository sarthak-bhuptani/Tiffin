const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Tiffin Business Manager API',
      version: '1.0.0',
      description: 'RESTful API for Home-based Tiffin Business Management System',
      contact: {
        name: 'Tiffin Owner Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        LoginInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', example: 'admin@tiffin.com' },
            password: { type: 'string', example: 'Admin123!' },
          },
        },
        CustomerInput: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', example: 'Ramesh Patel' },
            phone: { type: 'string', example: '9876543210' },
            address: { type: 'string', example: 'House 12, Sector 6' },
            area: { type: 'string', example: 'Sector 6' },
            defaultQuantity: { type: 'number', example: 1 },
            defaultPrice: { type: 'number', example: 60 },
            planType: { type: 'string', enum: ['daily', 'monthly'], example: 'daily' },
          },
        },
        DailyTiffinInput: {
          type: 'object',
          required: ['date', 'customerName', 'unitPrice'],
          properties: {
            date: { type: 'string', example: '2026-08-12' },
            customerName: { type: 'string', example: 'Ramesh' },
            area: { type: 'string', example: 'Sector 6' },
            quantity: { type: 'number', example: 1 },
            unitPrice: { type: 'number', example: 60 },
            status: { type: 'string', enum: ['delivered', 'skipped', 'cancelled'], example: 'delivered' },
            paymentStatus: { type: 'string', enum: ['PAID', 'PENDING', 'PARTIAL'], example: 'PAID' },
          },
        },
        ExpenseInput: {
          type: 'object',
          required: ['date', 'category', 'amount'],
          properties: {
            date: { type: 'string', example: '2026-08-12' },
            category: {
              type: 'string',
              enum: ['vegetables', 'grocery', 'gas', 'packaging', 'delivery', 'electricity', 'rent', 'other'],
              example: 'vegetables',
            },
            amount: { type: 'number', example: 420 },
            note: { type: 'string', example: 'Tomatoes, potatoes, onions' },
          },
        },
        PaymentInput: {
          type: 'object',
          required: ['amount', 'paymentDate'],
          properties: {
            customerId: { type: 'string', example: '60d5ec49f1b2c8123456789a' },
            amount: { type: 'number', example: 600 },
            paymentDate: { type: 'string', example: '2026-08-12' },
            paymentMethod: { type: 'string', enum: ['cash', 'upi', 'bank_transfer', 'other'], example: 'upi' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

module.exports = setupSwagger;
