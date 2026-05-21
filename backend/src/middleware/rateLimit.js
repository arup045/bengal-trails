// Per-user rate limiting using in-memory store
// Falls back to IP-based limiting for unauthenticated requests

const buckets = new Map();

function getKey(req) {
  if (req.user?.id) return `u:${req.user.id}`;
  return `ip:${req.ip || req.connection?.remoteAddress || 'unknown'}`;
}

function makeLimiter({ windowMs, max, message } = {}) {
  windowMs = windowMs || 60_000;
  max = max || 100;
  message = message || 'Too many requests, please slow down.';

  return (req, res, next) => {
    const key = `${req.path}::${getKey(req)}`;
    const now = Date.now();
    const bucket = buckets.get(key) || { count: 0, resetAt: now + windowMs };

    if (bucket.resetAt < now) {
      bucket.count = 0;
      bucket.resetAt = now + windowMs;
    }

    bucket.count++;
    buckets.set(key, bucket);

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - bucket.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(bucket.resetAt / 1000));

    if (bucket.count > max) {
      return res.status(429).json({ error: message, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) });
    }
    next();
  };
}

// Periodic cleanup
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of buckets.entries()) {
    if (v.resetAt < now) buckets.delete(k);
  }
}, 60_000);

// Pre-configured limiters
const limiters = {
  auth:      makeLimiter({ windowMs: 15 * 60_000, max: 20,  message: 'Too many auth attempts.' }),
  ai:        makeLimiter({ windowMs: 60_000,       max: 20,  message: 'AI rate limit hit. Try again in a minute.' }),
  upload:    makeLimiter({ windowMs: 60_000,       max: 10,  message: 'Upload limit hit.' }),
  write:     makeLimiter({ windowMs: 60_000,       max: 30,  message: 'Slow down — too many writes.' }),
  general:   makeLimiter({ windowMs: 60_000,       max: 100 }),
  // Newsletter campaign send — max 3 per hour per admin to prevent accidental mass-sends.
  newsletter: makeLimiter({ windowMs: 60 * 60_000, max: 3,  message: 'Newsletter send limit reached. Wait 1 hour.' }),
};

module.exports = { makeLimiter, limiters };
