const router = require('express').Router();
const pool = require('../db/pool');
const { limiters } = require('../middleware/rateLimit');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

// ── GET /reviews/:slug ─────────────────────────────────────────────────────────
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const { slug } = req.params;
    const sort = req.query.sort || 'recent';
    const rating = req.query.rating ? parseInt(req.query.rating) : null;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = parseInt(req.query.offset) || 0;

    let query = `
      SELECT r.*, u.name AS user_name, u.avatar_url AS user_avatar
      FROM reviews r
      JOIN users u ON u.id = r.user_id
      WHERE r.destination_slug = $1 AND r.status = 'published'
    `;
    const params = [slug];

    if (rating) { query += ` AND r.rating = $${params.length + 1}`; params.push(rating); }

    if (sort === 'helpful') query += ' ORDER BY r.helpful_count DESC';
    else if (sort === 'rating') query += ' ORDER BY r.rating DESC';
    else query += ' ORDER BY r.created_at DESC';

    params.push(limit); query += ` LIMIT $${params.length}`;
    params.push(offset); query += ` OFFSET $${params.length}`;

    const { rows } = await pool.query(query, params);
    return res.json({ reviews: rows });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /reviews ─────────────────────────────────────────────────────────────
router.post('/', authenticate, validate(schemas.review), async (req, res) => {
  try {
    const { destinationSlug, rating, title, content, visitDate } = req.body;
    if (!destinationSlug || !rating || !content)
      return res.status(400).json({ error: 'destinationSlug, rating and content required' });

    const { rows } = await pool.query(
      `INSERT INTO reviews (user_id, destination_slug, rating, title, content, visit_date)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user.id, destinationSlug, rating, title, content, visitDate || null]
    );

    // Update destination stats
    await pool.query(`
      UPDATE destinations
      SET review_count = review_count + 1,
          rating = (SELECT AVG(rating)::numeric(3,2) FROM reviews WHERE destination_slug = $1 AND status = 'published')
      WHERE slug = $1
    `, [destinationSlug]);

    return res.status(201).json({ success: true, review: rows[0] });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /reviews/:id/helpful ─────────────────────────────────────────────────
router.post('/:id/helpful', optionalAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE reviews SET helpful_count = helpful_count + 1
       WHERE id = $1 RETURNING id, helpful_count`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Review not found' });
    return res.json({ success: true, helpful_count: rows[0].helpful_count });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
