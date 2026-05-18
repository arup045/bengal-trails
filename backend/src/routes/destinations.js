const router = require('express').Router();
const pool   = require('../db/pool');
const { cacheMiddleware } = require('../utils/cache');

// ── GET /destinations ──────────────────────────────────────────────────────────
// ?region= &category= &featured=true &search= &limit=24 &page=1
router.get('/', cacheMiddleware(60), async (req, res) => {
  try {
    const { region, category, featured, search } = req.query;
    const pageNum  = Math.max(1,   parseInt(req.query.page)  || 1);
    const limitNum = Math.min(100, parseInt(req.query.limit) || 24);
    const offset   = (pageNum - 1) * limitNum;

    const clauses = ["status = 'published'"];
    const params  = [];

    if (region)           { params.push(region);   clauses.push(`region = $${params.length}`); }
    if (category)         { params.push(category); clauses.push(`category = $${params.length}`); }
    if (featured === 'true') clauses.push('featured = true');
    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      const i = params.length;
      clauses.push(`(LOWER(name) LIKE $${i} OR LOWER(region) LIKE $${i} OR LOWER(description) LIKE $${i})`);
    }

    const where = clauses.join(' AND ');

    const [countRes, dataRes] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM destinations WHERE ${where}`, params),
      pool.query(
        `SELECT * FROM destinations WHERE ${where}
         ORDER BY featured DESC, rating DESC NULLS LAST
         LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, limitNum, offset]
      ),
    ]);

    const total = parseInt(countRes.rows[0].count);
    return res.json({
      destinations: dataRes.rows,
      total,
      page:       pageNum,
      limit:      limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    console.error('destinations list error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── GET /destinations/all-slugs ────────────────────────────────────────────────
// Used for sitemap / slug verification — lightweight list
router.get('/all-slugs', cacheMiddleware(3600), async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT slug, name FROM destinations WHERE status = 'published' ORDER BY name");
    return res.json({ slugs: rows });
  } catch (err) {
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
    pool.query('UPDATE destinations SET view_count = view_count + 1 WHERE id = $1', [rows[0].id]).catch(() => {});
    return res.json({ destination: rows[0] });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
