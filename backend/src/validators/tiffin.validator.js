const { z } = require('zod');

const numberCoerce = (defaultVal = 0) =>
  z
    .union([z.number(), z.string(), z.null(), z.undefined()])
    .transform((val) => {
      if (val === null || val === undefined || val === '') return defaultVal;
      const parsed = Number(val);
      return isNaN(parsed) ? defaultVal : parsed;
    });

const singleTiffinSchema = z.object({
  body: z.object({
    date: z.string().min(1, 'Date is required'), // Format: YYYY-MM-DD
    customerId: z.any().optional(),
    customerName: z.string().min(1, 'Customer name is required'),
    area: z.string().optional().default('General'),
    quantity: numberCoerce(1),
    unitPrice: numberCoerce(0),
    totalAmount: numberCoerce(0),
    status: z.enum(['delivered', 'skipped', 'cancelled']).optional().default('delivered'),
    mealType: z.enum(['lunch', 'dinner', 'both']).optional().default('lunch'),
    skipReason: z.string().optional(),
    paymentStatus: z.enum(['PAID', 'PENDING', 'PARTIAL']).optional().default('PENDING'),
    paidAmount: numberCoerce(0),
    saveAsRegular: z.boolean().optional().default(false),
    notes: z.string().optional(),
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

const bulkTiffinSchema = z.object({
  body: z.object({
    date: z.string().min(1, 'Date is required'),
    entries: z
      .array(
        z.object({
          _id: z.string().nullable().optional(),
          customerId: z.any().optional(),
          customerName: z.string().min(1, 'Customer name is required'),
          area: z.string().optional().default('General'),
          quantity: numberCoerce(1),
          unitPrice: numberCoerce(0),
          totalAmount: numberCoerce(0),
          status: z.enum(['delivered', 'skipped', 'cancelled']).optional().default('delivered'),
          mealType: z.enum(['lunch', 'dinner', 'both']).optional().default('lunch'),
          skipReason: z.string().optional(),
          paymentStatus: z.enum(['PAID', 'PENDING', 'PARTIAL']).optional().default('PENDING'),
          paidAmount: numberCoerce(0),
          notes: z.string().optional(),
        })
      )
      .default([]),
    deletedIds: z.array(z.string()).optional().default([]),
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

module.exports = {
  singleTiffinSchema,
  bulkTiffinSchema,
};
