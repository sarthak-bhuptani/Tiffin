const { z } = require('zod');

const singleTiffinSchema = z.object({
  body: z.object({
    date: z.string().min(1, 'Date is required'), // Format: YYYY-MM-DD
    customerId: z.string().nullable().optional(),
    customerName: z.string().min(1, 'Customer name is required'),
    area: z.string().optional().default('General'),
    quantity: z.number().min(0, 'Quantity must be non-negative').optional().default(1),
    unitPrice: z.number().min(0, 'Unit price must be non-negative'),
    totalAmount: z.number().min(0, 'Total amount must be non-negative').optional(),
    status: z.enum(['delivered', 'skipped', 'cancelled']).optional().default('delivered'),
    skipReason: z.string().optional(),
    paymentStatus: z.enum(['PAID', 'PENDING', 'PARTIAL']).optional().default('PENDING'),
    paidAmount: z.number().min(0).optional().default(0),
    saveAsRegular: z.boolean().optional().default(false),
    notes: z.string().optional(),
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

const bulkTiffinSchema = z.object({
  body: z.object({
    date: z.string().min(1, 'Date is required'),
    entries: z.array(
      z.object({
        customerId: z.string().nullable().optional(),
        customerName: z.string().min(1, 'Customer name is required'),
        area: z.string().optional().default('General'),
        quantity: z.number().min(0).optional().default(1),
        unitPrice: z.number().min(0),
        totalAmount: z.number().min(0).optional(),
        status: z.enum(['delivered', 'skipped', 'cancelled']).optional().default('delivered'),
        skipReason: z.string().optional(),
        paymentStatus: z.enum(['PAID', 'PENDING', 'PARTIAL']).optional().default('PENDING'),
        paidAmount: z.number().min(0).optional().default(0),
        notes: z.string().optional(),
      })
    ).min(1, 'At least one tiffin entry is required'),
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

module.exports = {
  singleTiffinSchema,
  bulkTiffinSchema,
};
