const router = require('express').Router();
const pool = require('../db/pool');
const { cacheMiddleware } = require('../utils/cache');

// GET /blog?category=
router.get('/', cacheMiddleware(600), async (req, res) => {
  try {
    const category = req.query.category;
    let q = 'SELECT * FROM blog_posts';
    const params = [];
    if (category && category !== 'all') {
      params.push(category);
      q += ` WHERE category = $${params.length}`;
    }
    q += ' ORDER BY created_at DESC LIMIT 20';

    const { rows } = await pool.query(q, params);
    return res.json({ posts: rows });
  } catch (err) {
    // If the table genuinely doesn't exist yet, an empty list is the correct
    // (and cacheable) answer. ANY other error is transient — return 503 so the
    // cache middleware (which only stores 200s) doesn't blank the blog for all
    // visitors for the full TTL on one hiccup.
    if (err.code === '42P01') return res.json({ posts: [] });
    console.error('blog list error:', err.message);
    return res.status(503).json({ error: 'Blog temporarily unavailable' });
  }
});

// GET /blog/:slug
router.get('/:slug', cacheMiddleware(600), async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM blog_posts WHERE slug = $1', [req.params.slug]);
    if (!rows.length) return res.status(404).json({ error: 'Post not found' });
    // Increment views
    pool.query('UPDATE blog_posts SET views = views + 1 WHERE id = $1', [rows[0].id]).catch(() => {});
    return res.json({ post: rows[0] });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
