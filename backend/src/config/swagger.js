const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Tiffin Business Manager API',
      version: '1.0.0',
      description: 'RESTful API for Home-based Tiffin Business Management System',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development Local Server',
      },
      {
        url: 'https://tiffin-indol.vercel.app',
        description: 'Vercel Cloud Server',
      },
    ],
    paths: {
      '/api/customers': {
        get: {
          summary: 'Get all customers',
          tags: ['Customers'],
          parameters: [
            { name: 'search', in: 'query', schema: { type: 'string' } },
            { name: 'active', in: 'query', schema: { type: 'boolean' } },
          ],
          responses: { 200: { description: 'Success' } },
        },
        post: {
          summary: 'Create a new customer',
          tags: ['Customers'],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/CustomerInput' } } },
          },
          responses: { 201: { description: 'Created' } },
        },
      },
      '/api/customers/{id}': {
        get: {
          summary: 'Get customer by ID',
          tags: ['Customers'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Success' } },
        },
        put: {
          summary: 'Update customer',
          tags: ['Customers'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/CustomerInput' } } },
          },
          responses: { 200: { description: 'Updated' } },
        },
      },
      '/api/tiffins': {
        get: {
          summary: 'Get tiffin entries',
          tags: ['Daily Tiffins'],
          parameters: [
            { name: 'date', in: 'query', schema: { type: 'string', example: '2026-08-12' } },
            { name: 'area', in: 'query', schema: { type: 'string' } },
            { name: 'status', in: 'query', schema: { type: 'string' } },
          ],
          responses: { 200: { description: 'Success' } },
        },
        post: {
          summary: 'Record single daily tiffin',
          tags: ['Daily Tiffins'],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/DailyTiffinInput' } } },
          },
          responses: { 201: { description: 'Created' } },
        },
      },
      '/api/tiffins/quick': {
        post: {
          summary: 'Bulk Notebook Quick Entry',
          tags: ['Daily Tiffins'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    date: { type: 'string', example: '2026-08-12' },
                    entries: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/DailyTiffinInput' },
                    },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Bulk Created' } },
        },
      },
      '/api/dashboard/today': {
        get: {
          summary: "Get today's dashboard metrics",
          tags: ['Dashboard'],
          parameters: [{ name: 'date', in: 'query', schema: { type: 'string', example: '2026-08-12' } }],
          responses: { 200: { description: 'Success' } },
        },
      },
      '/api/payments': {
        get: {
          summary: 'Get payment logs',
          tags: ['Payments'],
          responses: { 200: { description: 'Success' } },
        },
        post: {
          summary: 'Record payment',
          tags: ['Payments'],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/PaymentInput' } } },
          },
          responses: { 201: { description: 'Created' } },
        },
      },
      '/api/expenses': {
        get: {
          summary: 'Get expense logs',
          tags: ['Expenses'],
          responses: { 200: { description: 'Success' } },
        },
        post: {
          summary: 'Record daily expense',
          tags: ['Expenses'],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ExpenseInput' } } },
          },
          responses: { 201: { description: 'Created' } },
        },
      },
      '/api/reports/monthly': {
        get: {
          summary: 'Get monthly financial summary report',
          tags: ['Reports'],
          parameters: [
            { name: 'year', in: 'query', schema: { type: 'number', example: 2026 } },
            { name: 'month', in: 'query', schema: { type: 'number', example: 8 } },
          ],
          responses: { 200: { description: 'Success' } },
        },
      },
    },
    components: {
      schemas: {
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
          required: ['customerName'],
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
          required: ['amount'],
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
          required: ['amount'],
          properties: {
            customerId: { type: 'string', example: '60d5ec49f1b2c8123456789a' },
            amount: { type: 'number', example: 600 },
            paymentDate: { type: 'string', example: '2026-08-12' },
            paymentMethod: { type: 'string', enum: ['cash', 'upi', 'bank_transfer', 'other'], example: 'upi' },
          },
        },
      },
    },
  },
  apis: [path.join(__dirname, '../routes/*.js')],
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

module.exports = setupSwagger;
