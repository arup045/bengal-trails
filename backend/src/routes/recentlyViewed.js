const router = require('express').Router();
const pool = require('../db/pool');
const { authenticate } = require('../middleware/auth');

// ── GET /recently-viewed ───────────────────────────────────────────────────────
router.get('/', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT destination_slug AS slug, viewed_at
       FROM recently_viewed
       WHERE user_id = $1
       ORDER BY viewed_at DESC
       LIMIT 20`,
      [req.user.id]
    );
    return res.json({ recentlyViewed: rows });
  } catch (err) {
    // Table may not exist yet — return empty gracefully
    return res.json({ recentlyViewed: [] });
  }
});

// ── POST /recently-viewed ──────────────────────────────────────────────────────
router.post('/', authenticate, async (req, res) => {
  try {
    const { slug } = req.body;
    if (!slug) return res.status(400).json({ error: 'slug required' });

    // Upsert — update timestamp if already exists
    await pool.query(
      `INSERT INTO recently_viewed (user_id, destination_slug, viewed_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (user_id, destination_slug)
       DO UPDATE SET viewed_at = NOW()`,
      [req.user.id, slug]
    );

    // Keep only last 30 per user
    await pool.query(
      `DELETE FROM recently_viewed
       WHERE user_id = $1
         AND destination_slug NOT IN (
           SELECT destination_slug FROM recently_viewed
           WHERE user_id = $1
           ORDER BY viewed_at DESC
           LIMIT 30
         )`,
      [req.user.id]
    );

    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
