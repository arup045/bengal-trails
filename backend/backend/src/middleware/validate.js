const { z } = require('zod');

// Wraps a Zod schema as an Express middleware
function validate(schema) {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req.body);
      req.body = parsed;
      next();
    } catch (err) {
      const errors = err.errors?.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })) || [{ message: 'Validation failed' }];
      return res.status(400).json({ error: 'Validation failed', errors });
    }
  };
}

// ── Schemas ────────────────────────────────────────────────────────────────────
const schemas = {
  signup: z.object({
    email: z.string().email().toLowerCase(),
    password: z.string().min(8).max(100).regex(/[a-zA-Z]/, 'Need a letter').regex(/[0-9]/, 'Need a number'),
    name: z.string().min(2).max(100),
    consent: z.any().optional(),
  }),

  signin: z.object({
    email: z.string().email().toLowerCase(),
    password: z.string().min(1).max(100),
  }),

  profile: z.object({
    name: z.string().min(2).max(100).optional(),
    phone: z.string().max(20).optional(),
    location: z.string().max(255).optional(),
    bio: z.string().max(500).optional(),
    avatar_url: z.string().url().optional(),
  }),

  review: z.object({
    destinationSlug: z.string().min(1).max(255),
    rating: z.number().int().min(1).max(5),
    title: z.string().max(255).optional(),
    content: z.string().min(10).max(2000),
    visitDate: z.string().optional(),
  }),

  booking: z.object({
    destinationSlug: z.string().min(1).max(255),
    destinationName: z.string().min(1).max(255),
    checkIn: z.string().optional(),
    checkOut: z.string().optional(),
    guests: z.number().int().min(1).max(20).optional(),
    rooms: z.number().int().min(1).max(10).optional(),
    accommodationType: z.string().max(100).optional(),
    addOns: z.any().optional(),
    total: z.number().min(0).max(10_000_000).optional(),
  }),

  newsletter: z.object({
    email: z.string().email().toLowerCase(),
    name: z.string().max(100).optional(),
  }),

  forumThread: z.object({
    title: z.string().min(5).max(255),
    content: z.string().min(10).max(5000),
    category: z.string().max(100).optional(),
    tags: z.array(z.string().max(50)).max(10).optional(),
  }),

  forumReply: z.object({
    content: z.string().min(1).max(2000),
  }),

  socialPost: z.object({
    content: z.string().min(1).max(2000),
    destinationSlug: z.string().max(255).optional(),
    visitDate: z.string().optional(),
    images: z.array(z.string()).max(8).optional(),
  }),

  comment: z.object({
    content: z.string().min(1).max(1000),
  }),

  forgotPassword: z.object({
    email: z.string().email().toLowerCase(),
  }),

  resetPassword: z.object({
    token: z.string().min(1),
    password: z.string().min(8).max(100).regex(/[a-zA-Z]/).regex(/[0-9]/),
  }),

  tripPlan: z.object({
    name: z.string().min(1).max(255),
    description: z.string().max(2000).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    destinations: z.any().optional(),
    totalBudget: z.number().min(0).max(10_000_000).optional(),
    status: z.enum(['planning', 'confirmed', 'completed', 'cancelled']).optional(),
  }),
};

module.exports = { validate, schemas, z };
