const router = require('express').Router();
const pool = require('../db/pool');
const { cacheMiddleware } = require('../utils/cache');

// ── GET /destinations ──────────────────────────────────────────────────────────
// Optional filters: ?region=&category=&featured=true&limit=&offset=
router.get('/', cacheMiddleware(300), async (req, res) => {
  try {
    const { region, category, featured, limit = 100, offset = 0 } = req.query;
    let q = "SELECT * FROM destinations WHERE status = 'published'";
    const params = [];

    if (region) { params.push(region); q += ` AND region = $${params.length}`; }
    if (category) { params.push(category); q += ` AND category = $${params.length}`; }
    if (featured === 'true') q += ' AND featured = true';

    params.push(parseInt(limit));
    q += ` ORDER BY featured DESC, rating DESC LIMIT $${params.length}`;
    params.push(parseInt(offset));
    q += ` OFFSET $${params.length}`;

    const { rows } = await pool.query(q, params);
    return res.json({ destinations: rows, count: rows.length });
  } catch (err) {
    console.error('destinations list error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── GET /destinations/:slug ────────────────────────────────────────────────────
router.get('/:slug', cacheMiddleware(600), async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM destinations WHERE slug = $1 AND status = 'published'",
      [req.params.slug]
    );

    if (!rows.length) return res.status(404).json({ error: 'Destination not found' });

    // Increment view count (fire & forget)
    pool.query('UPDATE destinations SET view_count = view_count + 1 WHERE id = $1', [rows[0].id]).catch(() => {});

    return res.json({ destination: rows[0] });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
