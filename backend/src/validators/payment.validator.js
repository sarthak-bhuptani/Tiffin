const { z } = require('zod');

const createPaymentSchema = z.object({
  body: z.object({
    customerId: z.string().nullable().optional(),
    customerName: z.string().optional(),
    tiffinId: z.string().nullable().optional(),
    amount: z.number().min(0.01, 'Payment amount must be greater than 0'),
    paymentDate: z.string().min(1, 'Payment date is required'),
    paymentMethod: z.enum(['cash', 'upi', 'bank_transfer', 'other']).optional().default('cash'),
    notes: z.string().optional(),
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

module.exports = {
  createPaymentSchema,
};
