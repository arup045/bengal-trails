const router = require('express').Router();
const pool = require('../db/pool');
const { limiters } = require('../middleware/rateLimit');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

// ════════════════════════════════════════
// BOOKINGS
// ════════════════════════════════════════

// POST /bookings
router.post('/bookings', authenticate, limiters.write, validate(schemas.booking), async (req, res) => {
  try {
    const { destinationSlug, destinationName, checkIn, checkOut, guests, rooms, accommodationType, addOns, total } = req.body;
    const bookingId = `BKG${Date.now()}`;

    const { rows } = await pool.query(
      `INSERT INTO bookings
         (booking_id, user_id, destination_slug, destination_name, check_in, check_out,
          guests, rooms, accommodation_type, add_ons, total, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'confirmed') RETURNING *`,
      [bookingId, req.user.id, destinationSlug, destinationName, checkIn, checkOut,
       guests || 1, rooms || 1, accommodationType, JSON.stringify(addOns || []), total]
    );

    // Create notification
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, action_url)
       VALUES ($1, 'booking', 'Booking Confirmed!', $2, '/profile')`,
      [req.user.id, `Your booking for ${destinationName} is confirmed. ID: ${bookingId}`]
    );

    return res.status(201).json({ success: true, bookingId, booking: rows[0] });
  } catch (err) {
    console.error('booking error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /bookings (user's own bookings)
router.get('/bookings', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM bookings WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    return res.json({ bookings: rows });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// ════════════════════════════════════════
// NEWSLETTER
// ════════════════════════════════════════

// POST /newsletter/subscribe
router.post('/newsletter/subscribe', validate(schemas.newsletter), async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email) return res.status(400).json({ error: 'email required' });

    await pool.query(
      `INSERT INTO newsletter_subscribers (email, name)
       VALUES ($1, $2)
       ON CONFLICT (email) DO UPDATE SET status = 'active'`,
      [email.toLowerCase(), name || null]
    );

    return res.json({ success: true, message: 'Subscribed successfully!' });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// ════════════════════════════════════════
// NOTIFICATIONS
// ════════════════════════════════════════

// GET /notifications
router.get('/notifications', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [req.user.id, Math.min(parseInt(req.query.limit) || 50, 100), parseInt(req.query.offset) || 0]
    );
    return res.json({ notifications: rows });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// POST /notifications/:id/read
router.post('/notifications/:id/read', authenticate, limiters.write, async (req, res) => {
  try {
    await pool.query(
      'UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// POST /notifications/read-all
router.post('/notifications/read-all', authenticate, limiters.write, async (req, res) => {
  try {
    await pool.query(
      'UPDATE notifications SET read = true WHERE user_id = $1',
      [req.user.id]
    );
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// ════════════════════════════════════════
// SEARCH SUGGESTIONS
// ════════════════════════════════════════

// GET /search/suggestions?q=...
router.get('/search/suggestions', async (req, res) => {
  try {
    const q = (req.query.q || '').toLowerCase().trim();
    if (!q) return res.json({ suggestions: [] });

    // Use full-text search if 3+ chars, fallback to LIKE for short queries
    let rows;
    if (q.length >= 3) {
      const tsQuery = q.split(/\s+/).filter(Boolean).map(w => `${w}:*`).join(' & ');
      const result = await pool.query(
        `SELECT id, name, slug, category, region,
                ts_rank(tsv_search, to_tsquery('english', $1)) AS rank
         FROM destinations
         WHERE status = 'published' AND tsv_search @@ to_tsquery('english', $1)
         ORDER BY rank DESC, rating DESC NULLS LAST
         LIMIT 8`,
        [tsQuery]
      ).catch(() => null);
      rows = result?.rows;
    }
    if (!rows || rows.length === 0) {
      const result = await pool.query(
        `SELECT id, name, slug, category, region
         FROM destinations
         WHERE status = 'published'
           AND (LOWER(name) LIKE $1 OR LOWER(region) LIKE $1 OR LOWER(category) LIKE $1)
         LIMIT 8`,
        [`%${q}%`]
      );
      rows = result.rows;
    }

    const suggestions = rows.map((r) => ({
      id: r.id,
      name: r.name,
      type: 'destination',
      slug: r.slug,
      region: r.region,
    }));

    return res.json({ suggestions });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// ════════════════════════════════════════
// PLACE REPORTS
// ════════════════════════════════════════

// POST /places/report
router.post('/places/report', optionalAuth, async (req, res) => {
  try {
    const { destinationSlug, type, description } = req.body;
    if (!description) return res.status(400).json({ error: 'description required' });

    await pool.query(
      `INSERT INTO issue_reports (user_id, destination_slug, type, description)
       VALUES ($1, $2, $3, $4)`,
      [req.user?.id || null, destinationSlug, type, description]
    );

    return res.json({ success: true, message: 'Report submitted. Thank you!' });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
