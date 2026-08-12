const { z } = require('zod');

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

module.exports = {
  loginSchema,
};
