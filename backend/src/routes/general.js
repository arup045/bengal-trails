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

// GET /search/suggestions?q=...&limit=8
// Returns a unified suggestion list across destinations, festivals, and food.
// Uses PostgreSQL full-text search for destinations (with weighted relevance:
// name > region/category > description), and ILIKE for festivals & food data.
router.get('/search/suggestions', async (req, res) => {
  try {
    const q = (req.query.q || '').toLowerCase().trim();
    const limit = Math.min(parseInt(req.query.limit, 10) || 8, 15);
    if (!q || q.length < 2) return res.json({ suggestions: [] });

    // ─── 1. Destinations (FTS with fallback to ILIKE) ───
    let destRows = [];
    if (q.length >= 3) {
      const tsQuery = q.split(/\s+/).filter(Boolean).map((w) => `${w}:*`).join(' & ');
      try {
        const r = await pool.query(
          `SELECT id, name, slug, category, region, image_url,
                  short_description,
                  ts_rank(tsv_search, to_tsquery('english', $1)) AS rank
           FROM destinations
           WHERE status = 'published' AND tsv_search @@ to_tsquery('english', $1)
           ORDER BY rank DESC, rating DESC NULLS LAST
           LIMIT $2`,
          [tsQuery, Math.ceil(limit / 2) + 2]
        );
        destRows = r.rows;
      } catch { /* fall through to ILIKE */ }
    }
    if (destRows.length === 0) {
      // Tier 2: ILIKE substring match
      const r = await pool.query(
        `SELECT id, name, slug, category, region, image_url, short_description
         FROM destinations
         WHERE status = 'published'
           AND (LOWER(name) LIKE $1 OR LOWER(region) LIKE $1 OR LOWER(category) LIKE $1 OR LOWER(COALESCE(highlights::text, '')) LIKE $1)
         ORDER BY rating DESC NULLS LAST
         LIMIT $2`,
        [`%${q}%`, Math.ceil(limit / 2) + 2]
      );
      destRows = r.rows;
    }
    if (destRows.length === 0) {
      // Tier 3: trigram similarity (catches typos like "darjeling" → "Darjeeling")
      try {
        const r = await pool.query(
          `SELECT id, name, slug, category, region, image_url, short_description,
                  similarity(LOWER(name), $1) AS sim
           FROM destinations
           WHERE status = 'published'
             AND similarity(LOWER(name), $1) > 0.2
           ORDER BY sim DESC, rating DESC NULLS LAST
           LIMIT $2`,
          [q, Math.ceil(limit / 2) + 2]
        );
        destRows = r.rows;
      } catch { /* pg_trgm not installed yet */ }
    }

    const destinations = destRows.map((r) => ({
      type: 'destination',
      id: r.id,
      name: r.name,
      slug: r.slug,
      subtitle: r.region || r.category || '',
      image: r.image_url || null,
      url: `#/explore/${r.slug}`,
    }));

    // ─── 2. Festivals (in-memory match against festivals.js) ───
    let festivals = [];
    try {
      const allFestivals = require('../data/festivals');
      festivals = allFestivals
        .filter((f) => {
          const hay = `${f.name} ${f.bengaliName || ''} ${f.description || ''} ${(f.category || '')} ${(f.vibe || '')}`.toLowerCase();
          return hay.includes(q);
        })
        .slice(0, 4)
        .map((f) => ({
          type: 'festival',
          id: f.id,
          name: f.name,
          slug: f.id,
          subtitle: f.bengaliName ? `${f.bengaliName} • ${f.typicalDates || ''}` : (f.typicalDates || f.category || ''),
          image: f.image || null,
          url: '#/festivals',
        }));
    } catch { /* festivals data not available */ }

    // ─── 3. Food items ───
    let foodItems = [];
    try {
      const foodModule = require('../data/bengaliFood');
      const foods = foodModule.foods || foodModule || [];
      foodItems = foods
        .filter((f) => {
          const hay = `${f.name || ''} ${f.bengaliName || ''} ${f.description || ''} ${(f.category || '')}`.toLowerCase();
          return hay.includes(q);
        })
        .slice(0, 3)
        .map((f) => ({
          type: 'food',
          id: f.id || f.slug,
          name: f.name,
          slug: f.id || f.slug,
          subtitle: f.bengaliName || f.category || 'Bengali cuisine',
          image: f.image || null,
          url: '#/food',
        }));
    } catch { /* food data not available */ }

    // Combine: destinations first, then festivals, then food
    const suggestions = [
      ...destinations.slice(0, Math.max(limit - festivals.length - foodItems.length, 3)),
      ...festivals,
      ...foodItems,
    ].slice(0, limit);

    return res.json({
      suggestions,
      counts: {
        destinations: destinations.length,
        festivals: festivals.length,
        food: foodItems.length,
      },
    });
  } catch (err) {
    console.error('Search suggestions error:', err);
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

// ── Schema setup — runs once on server startup ────────────────────────────────
async function ensureEnquiryTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS enquiries (
      id              SERIAL PRIMARY KEY,
      destination_slug VARCHAR(255) NOT NULL,
      destination_name VARCHAR(255),
      check_in        DATE,
      check_out       DATE,
      guests          INTEGER DEFAULT 1,
      name            VARCHAR(255) NOT NULL,
      email           VARCHAR(255) NOT NULL,
      phone           VARCHAR(50),
      message         TEXT,
      status          VARCHAR(50) DEFAULT 'new',
      created_at      TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}
ensureEnquiryTable().catch(err => console.error('[enquiries] table init failed:', err.message));

module.exports = router;

// ── POST /bookings/enquiry ─────────────────────────────────────────────────────
// Accepts an enquiry form submission, saves to DB and sends email to admin.
router.post('/bookings/enquiry', async (req, res) => {
  try {
    const { destinationSlug, destinationName, checkIn, checkOut, guests,
            name, email, phone, message } = req.body;
    if (!destinationSlug || !name || !email)
      return res.status(400).json({ error: 'destinationSlug, name and email are required' });

    await pool.query(
      `INSERT INTO enquiries (destination_slug, destination_name, check_in, check_out, guests, name, email, phone, message)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [destinationSlug, destinationName, checkIn || null, checkOut || null,
       guests || 1, name, email, phone || null, message || null]
    );

    // Non-blocking email notification
    const { sendEmail } = require('../utils/email');
    sendEmail({
      to: process.env.ADMIN_EMAIL || process.env.FIRST_ADMIN_EMAIL || 'admin@bengaltrails.com',
      subject: `New Enquiry: ${destinationName} — ${name}`,
      html: `<p><strong>${name}</strong> (${email}) has enquired about <strong>${destinationName}</strong>.</p>
             <p>Dates: ${checkIn || '—'} → ${checkOut || '—'}, Guests: ${guests || 1}</p>
             ${message ? `<p>Message: ${message}</p>` : ''}`,
    }).catch(console.error);

    return res.json({ success: true, message: 'Enquiry received. We will contact you within 24 hours.' });
  } catch (err) {
    console.error('enquiry error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});
