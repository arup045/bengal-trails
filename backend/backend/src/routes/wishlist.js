const router = require('express').Router();
const pool = require('../db/pool');
const { authenticate } = require('../middleware/auth');

// All wishlist routes require auth
router.use(authenticate);

// ── GET /wishlist ─────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT destination_slug AS slug, added_at FROM wishlists WHERE user_id = $1 ORDER BY added_at DESC',
      [req.user.id]
    );
    return res.json({ wishlist: rows });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /wishlist ─────────────────────────────────────────────────────────────
// Add a destination to wishlist
router.post('/', async (req, res) => {
  try {
    const { slug } = req.body;
    if (!slug) return res.status(400).json({ error: 'slug required' });

    await pool.query(
      'INSERT INTO wishlists (user_id, destination_slug) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.user.id, slug]
    );

    const { rows } = await pool.query(
      'SELECT destination_slug AS slug, added_at FROM wishlists WHERE user_id = $1 ORDER BY added_at DESC',
      [req.user.id]
    );

    return res.json({ success: true, wishlist: rows });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /wishlist/sync ───────────────────────────────────────────────────────
// Sync local wishlist to DB (called on login)
router.post('/sync', async (req, res) => {
  try {
    const { slugs } = req.body; // array of slugs from localStorage
    if (Array.isArray(slugs) && slugs.length > 0) {
      for (const slug of slugs) {
        await pool.query(
          'INSERT INTO wishlists (user_id, destination_slug) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [req.user.id, slug]
        );
      }
    }

    const { rows } = await pool.query(
      'SELECT destination_slug AS slug, added_at FROM wishlists WHERE user_id = $1 ORDER BY added_at DESC',
      [req.user.id]
    );

    return res.json({ success: true, wishlist: rows });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── DELETE /wishlist/:slug ────────────────────────────────────────────────────
router.delete('/:slug', async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM wishlists WHERE user_id = $1 AND destination_slug = $2',
      [req.user.id, req.params.slug]
    );

    const { rows } = await pool.query(
      'SELECT destination_slug AS slug, added_at FROM wishlists WHERE user_id = $1 ORDER BY added_at DESC',
      [req.user.id]
    );

    return res.json({ success: true, wishlist: rows });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
