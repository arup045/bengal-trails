// Simple in-memory cache with TTL — works without Redis
// For multi-instance deployments, swap with Redis later

class Cache {
  constructor() {
    this.store = new Map();
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key, value, ttlSeconds = 300) {
    this.store.set(key, {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
    });
  }

  delete(key) {
    this.store.delete(key);
  }

  // Delete all keys matching prefix
  invalidate(prefix) {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) this.store.delete(key);
    }
  }

  // Periodic cleanup of expired entries
  startCleanup() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.store.entries()) {
        if (entry.expiresAt && entry.expiresAt < now) this.store.delete(key);
      }
    }, 60_000);
  }
}

const cache = new Cache();
cache.startCleanup();

// Express middleware that caches GET responses
function cacheMiddleware(ttlSeconds = 300) {
  return (req, res, next) => {
    if (req.method !== 'GET') return next();
    const fullPath = req.originalUrl.split('?')[0];
    const key = `${fullPath}?${new URLSearchParams(req.query).toString()}`;
    const cached = cache.get(key);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cached);
    }
    res.setHeader('X-Cache', 'MISS');
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode === 200) cache.set(key, body, ttlSeconds);
      return originalJson(body);
    };
    next();
  };
}

module.exports = { cache, cacheMiddleware };
