const router = require('express').Router();
const pool = require('../db/pool');
const { limiters } = require('../middleware/rateLimit');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

// P1-24: review moderation toggle.
//   - Default (REVIEW_MODERATION_MODE unset or 'off') = reviews auto-publish
//     (legacy behavior — back-compat for existing deploys).
//   - 'pending' = reviews require admin approval before going live.
// Admins should change this in their Render/Railway dashboard.
const MODERATION_PENDING = process.env.REVIEW_MODERATION_MODE === 'pending';
const NEW_REVIEW_STATUS  = MODERATION_PENDING ? 'pending' : 'published';

// Photo reviews: ensure the `photos` column exists. Memoized so the first write
// awaits the migration (bulletproof) instead of a fire-and-forget that could lose
// the race and make INSERTs reference a missing column.
// NOTE: the `photos` column is TEXT[] (a Postgres array) in the schema — NOT jsonb.
// Inserts must pass a JS string[] cast to ::text[], never a JSON string.
let _photosColReady = null;
function ensurePhotosColumn() {
  if (!_photosColReady) {
    _photosColReady = pool
      .query(`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS photos TEXT[]`)
      .catch((e) => { _photosColReady = null; throw e; }); // allow retry on next call
  }
  return _photosColReady;
}
ensurePhotosColumn().catch(() => {}); // warm it on boot

// ── GET /reviews/:slug ─────────────────────────────────────────────────────────
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const { slug } = req.params;
    const sort = req.query.sort || 'recent';
    const rating = req.query.rating ? parseInt(req.query.rating) : null;
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
    const offset = Math.max(parseInt(req.query.offset) || 0, 0);

    let query = `
      SELECT r.*, u.name AS user_name, u.avatar_url AS user_avatar,
             EXISTS (
               SELECT 1 FROM bookings b
               WHERE b.user_id = r.user_id
                 AND b.destination_slug = r.destination_slug
                 AND b.status = 'confirmed'
             ) AS verified
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
// P1-23: a user can only have ONE review per destination. The DB constraint
// enforces this; we translate the unique_violation (23505) into a friendly
// 409 Conflict so the frontend can prompt the user to EDIT instead of POST
// (an edit endpoint would be the natural follow-up — separate ticket).
router.post('/', authenticate, validate(schemas.review), async (req, res) => {
  try {
    const { destinationSlug, rating, title, content, visitDate, photos } = req.body;
    if (!destinationSlug || !rating || !content)
      return res.status(400).json({ error: 'destinationSlug, rating and content required' });

    await ensurePhotosColumn(); // guarantee the column exists before inserting
    const photoList = Array.isArray(photos) ? photos.slice(0, 6) : [];

    const { rows } = await pool.query(
      `INSERT INTO reviews (user_id, destination_slug, rating, title, content, visit_date, status, photos)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::text[]) RETURNING *`,
      [req.user.id, destinationSlug, rating, title, content, visitDate || null, NEW_REVIEW_STATUS, photoList]
    );

    // Update destination stats — derive both count and average from published
    // reviews only, so pending-moderation reviews don't pollute public ratings.
    await pool.query(`
      UPDATE destinations
      SET review_count = (SELECT COUNT(*)          FROM reviews WHERE destination_slug = $1 AND status = 'published'),
          rating       = COALESCE(
                           (SELECT AVG(rating)::numeric(3,2) FROM reviews WHERE destination_slug = $1 AND status = 'published'),
                           0
                         )
      WHERE slug = $1
    `, [destinationSlug]);

    return res.status(201).json({
      success: true,
      review: rows[0],
      // If moderation is on, tell the frontend so it can show the right toast
      pendingModeration: NEW_REVIEW_STATUS === 'pending',
    });
  } catch (err) {
    // Postgres unique_violation — user already reviewed this destination
    if (err && err.code === '23505') {
      return res.status(409).json({
        error: 'You have already reviewed this destination. Edit your existing review instead.',
        code: 'already_reviewed',
      });
    }
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /reviews/:id/helpful ─────────────────────────────────────────────────
// P1-22: was previously an "increment forever" endpoint accessible to anyone.
// Now requires auth, dedups via review_helpful_votes PK, and derives the count
// from that table. Idempotent — calling twice from the same user is a no-op.
router.post('/:id/helpful', authenticate, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verify the review exists (so we 404 instead of silently no-op'ing)
    const reviewExists = await client.query('SELECT id FROM reviews WHERE id = $1', [req.params.id]);
    if (!reviewExists.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Review not found' });
    }

    // Idempotent insert
    await client.query(
      `INSERT INTO review_helpful_votes (review_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT (review_id, user_id) DO NOTHING`,
      [req.params.id, req.user.id]
    );

    // Recompute the denormalized count
    const countRes = await client.query(
      `UPDATE reviews
         SET helpful_count = (SELECT COUNT(*) FROM review_helpful_votes WHERE review_id = $1)
       WHERE id = $1
       RETURNING helpful_count`,
      [req.params.id]
    );

    await client.query('COMMIT');
    return res.json({ success: true, helpful_count: countRes.rows[0].helpful_count });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    return res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// ── DELETE /reviews/:id/helpful — remove your "helpful" vote ──────────────────
// Companion to POST — lets users toggle their vote off. Idempotent.
router.delete('/:id/helpful', authenticate, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      'DELETE FROM review_helpful_votes WHERE review_id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    const countRes = await client.query(
      `UPDATE reviews
         SET helpful_count = (SELECT COUNT(*) FROM review_helpful_votes WHERE review_id = $1)
       WHERE id = $1
       RETURNING helpful_count`,
      [req.params.id]
    );
    await client.query('COMMIT');
    return res.json({ success: true, helpful_count: countRes.rows[0]?.helpful_count || 0 });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    return res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});
// GET real average rating stats for a destination
router.get('/stats/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await pool.query(
      `SELECT 
        COALESCE(AVG(rating)::numeric(3,2), 0) as average_rating,
        COUNT(*) as total_reviews
       FROM reviews 
       WHERE destination_slug = $1 AND status = 'published'`,
      [slug]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});
// ── PUT /reviews/:id — edit your own review ───────────────────────────────────
// Only the original author can edit. Triggers a recompute of destination stats.
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { rating, title, content, visitDate, photos } = req.body;
    if (!rating || !content) return res.status(400).json({ error: 'rating and content required' });
    if (rating < 1 || rating > 5) return res.status(400).json({ error: 'rating must be 1-5' });

    // Verify ownership before updating
    const existing = await pool.query('SELECT user_id, destination_slug FROM reviews WHERE id = $1', [req.params.id]);
    if (!existing.rows.length) return res.status(404).json({ error: 'Review not found' });
    if (existing.rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You can only edit your own reviews' });
    }

    const slug = existing.rows[0].destination_slug;
    await ensurePhotosColumn();
    // photos optional on edit — only overwrite when an array is provided (COALESCE keeps existing otherwise)
    const photoArg = Array.isArray(photos) ? photos.slice(0, 6) : null;

    const { rows } = await pool.query(
      `UPDATE reviews
       SET rating = $1, title = $2, content = $3, visit_date = $4,
           photos = COALESCE($5::text[], photos), updated_at = NOW()
       WHERE id = $6 RETURNING *`,
      [rating, title, content, visitDate || null, photoArg, req.params.id]
    );

    // Recompute destination stats since rating may have changed
    await pool.query(`
      UPDATE destinations
      SET review_count = (SELECT COUNT(*)            FROM reviews WHERE destination_slug = $1 AND status = 'published'),
          rating       = COALESCE(
                           (SELECT AVG(rating)::numeric(3,2) FROM reviews WHERE destination_slug = $1 AND status = 'published'),
                           0
                         )
      WHERE slug = $1
    `, [slug]);

    return res.json({ success: true, review: rows[0] });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── DELETE /reviews/:id — delete your own review ──────────────────────────────
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const existing = await pool.query('SELECT user_id, destination_slug FROM reviews WHERE id = $1', [req.params.id]);
    if (!existing.rows.length) return res.status(404).json({ error: 'Review not found' });
    if (existing.rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You can only delete your own reviews' });
    }

    const slug = existing.rows[0].destination_slug;
    await pool.query('DELETE FROM reviews WHERE id = $1', [req.params.id]);

    // Recompute destination stats
    await pool.query(`
      UPDATE destinations
      SET review_count = (SELECT COUNT(*)            FROM reviews WHERE destination_slug = $1 AND status = 'published'),
          rating       = COALESCE(
                           (SELECT AVG(rating)::numeric(3,2) FROM reviews WHERE destination_slug = $1 AND status = 'published'),
                           0
                         )
      WHERE slug = $1
    `, [slug]);

    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── GET /reviews/user/me — current user's review history ──────────────────────
// Returns all reviews the logged-in user has written, with the destination's
// title/image so the frontend can render a clickable list in the user profile.
router.get('/user/me', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT r.*, d.name AS destination_title, d.image_url AS destination_image
         FROM reviews r
         LEFT JOIN destinations d ON d.slug = r.destination_slug
        WHERE r.user_id = $1
        ORDER BY r.created_at DESC`,
      [req.user.id]
    );
    return res.json({ reviews: rows });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
