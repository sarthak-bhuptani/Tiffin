const { z } = require('zod');

const createCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Customer name is required'),
    phone: z.string().optional(),
    address: z.string().optional(),
    area: z.string().optional().default('General'),
    defaultQuantity: z.number().min(1, 'Default quantity must be at least 1').optional().default(1),
    defaultPrice: z.number().min(0, 'Default price cannot be negative').optional().default(60),
    planType: z.enum(['daily', 'monthly']).optional().default('daily'),
    active: z.boolean().optional().default(true),
    startDate: z.string().optional(),
    notes: z.string().optional(),
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

const updateCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    area: z.string().optional(),
    defaultQuantity: z.number().min(1).optional(),
    defaultPrice: z.number().min(0).optional(),
    planType: z.enum(['daily', 'monthly']).optional(),
    active: z.boolean().optional(),
    startDate: z.string().optional(),
    notes: z.string().optional(),
  }),
  query: z.object({}).passthrough(),
  params: z.object({
    id: z.string(),
  }),
});

module.exports = {
  createCustomerSchema,
  updateCustomerSchema,
};
