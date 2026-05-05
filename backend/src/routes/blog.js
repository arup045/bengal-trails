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
    // Table might not exist yet — return empty
    return res.json({ posts: [] });
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
