const { z } = require('zod');

const createExpenseSchema = z.object({
  body: z.object({
    date: z.string().min(1, 'Date is required'),
    category: z.enum([
      'vegetables',
      'grocery',
      'gas',
      'packaging',
      'delivery',
      'electricity',
      'rent',
      'other',
    ]),
    amount: z.number().min(0.01, 'Expense amount must be greater than 0'),
    note: z.string().optional(),
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

module.exports = {
  createExpenseSchema,
};
