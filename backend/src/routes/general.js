const router = require('express').Router();
const crypto = require('crypto');
const pool = require('../db/pool');
const { limiters } = require('../middleware/rateLimit');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

// ════════════════════════════════════════
// BOOKINGS
// ════════════════════════════════════════

// POST /bookings
//
// SECURITY (P0-8 + P0-9):
//   - The booking total is computed server-side from the destination's actual
//     price_from. The client's `total` is treated as advisory only and audited.
//     Old code stored client-supplied total → users could book a ₹10k trip
//     for ₹1.
//   - The booking is inserted with status='pending' and only flips to
//     'confirmed' after /payments/verify validates the Razorpay signature.
//     Old code marked every booking 'confirmed' on creation → free bookings.
router.post('/bookings', authenticate, limiters.write, validate(schemas.booking), async (req, res) => {
  try {
    const { destinationSlug, destinationName, checkIn, checkOut, guests, rooms, accommodationType, addOns, total: clientTotal } = req.body;
    const safeGuests = Math.max(1, Math.min(20, guests || 1));
    const safeRooms  = Math.max(1, Math.min(10, rooms  || 1));

    // Compute nights from check-in/out (default 1 night if dates missing/invalid)
    let nights = 1;
    if (checkIn && checkOut) {
      const inDate  = new Date(checkIn);
      const outDate = new Date(checkOut);
      if (!isNaN(inDate.getTime()) && !isNaN(outDate.getTime()) && outDate > inDate) {
        nights = Math.max(1, Math.round((outDate - inDate) / (1000 * 60 * 60 * 24)));
        if (nights > 60) {
          return res.status(400).json({ error: 'Booking duration cannot exceed 60 nights' });
        }
      }
    }

    // Look up the canonical price from the destinations table
    const destRes = await pool.query(
      `SELECT price_from FROM destinations WHERE slug = $1 AND status = 'published' LIMIT 1`,
      [destinationSlug]
    );
    if (!destRes.rows.length) {
      return res.status(404).json({ error: 'Destination not found or not bookable' });
    }
    const priceFrom = parseInt(destRes.rows[0].price_from, 10) || 0;

    // Server-authoritative minimum total. Real businesses layer in tax,
    // accommodation upgrade, add-ons, etc. — but at minimum the booking must
    // cost (price_from × nights × guests). We reject any client value below
    // 70% of this floor; we use the higher of (client claim, server floor) so
    // legitimate add-ons + tax push the total UP not down.
    const serverFloor = priceFrom * nights * safeGuests;
    const clientNum   = typeof clientTotal === 'number' && clientTotal >= 0 ? clientTotal : 0;
    if (clientNum > 0 && clientNum < serverFloor * 0.7) {
      return res.status(400).json({
        error: 'Booking total is below the destination\'s minimum price.',
        minTotal: serverFloor,
      });
    }
    const authoritativeTotal = Math.max(serverFloor, clientNum);

    // Generate a non-predictable booking ID (Date.now() alone collides under load)
    const bookingId = `BKG${Date.now().toString(36).toUpperCase()}${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    const { rows } = await pool.query(
      `INSERT INTO bookings
         (booking_id, user_id, destination_slug, destination_name, check_in, check_out,
          guests, rooms, accommodation_type, add_ons, total, total_amount, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$11,'pending') RETURNING *`,
      [bookingId, req.user.id, destinationSlug, destinationName, checkIn, checkOut,
       safeGuests, safeRooms, accommodationType, JSON.stringify(addOns || []), authoritativeTotal]
    );

    // Create notification (now reflects pending state, not fake 'confirmed')
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, action_url)
       VALUES ($1, 'booking', 'Booking Created', $2, '/profile')`,
      [req.user.id, `Your booking for ${destinationName} is reserved (ID: ${bookingId}). Complete payment to confirm.`]
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

// PUT /bookings/:bookingId/cancel — user cancels their own booking
router.put('/bookings/:bookingId/cancel', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE bookings SET status = 'cancelled'
        WHERE booking_id = $1 AND user_id = $2 AND status IN ('pending','created','confirmed')
        RETURNING booking_id, status`,
      [req.params.bookingId, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Booking not found or already cancelled' });
    return res.json({ success: true, booking: rows[0] });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// ════════════════════════════════════════
// NEWSLETTER
// ════════════════════════════════════════

// POST /newsletter/subscribe
//
// P1-29: double opt-in.
//   1. Anyone can submit any email — we don't reveal whether it's already
//      subscribed (no enumeration).
//   2. We insert/update with status='pending' and a random confirm_token.
//   3. We email the token to the user. They click the link → /newsletter/confirm
//      flips status to 'active'.
// Required for India DPDP Act 2023 + GDPR (Art. 7 consent records).
router.post('/newsletter/subscribe', validate(schemas.newsletter), async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email) return res.status(400).json({ error: 'email required' });

    const rawToken  = crypto.randomBytes(24).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    await pool.query(
      `INSERT INTO newsletter_subscribers (email, name, status, confirm_token, subscribed_at)
       VALUES ($1, $2, 'pending', $3, NOW())
       ON CONFLICT (email) DO UPDATE
         SET status        = CASE
                               WHEN newsletter_subscribers.status = 'active' THEN 'active'
                               ELSE 'pending'
                             END,
             confirm_token = CASE
                               WHEN newsletter_subscribers.status = 'active' THEN newsletter_subscribers.confirm_token
                               ELSE EXCLUDED.confirm_token
                             END,
             name          = COALESCE(EXCLUDED.name, newsletter_subscribers.name)`,
      [email.toLowerCase(), name || null, tokenHash]
    );

    // Email the raw token (DB only stores its hash, same pattern as password reset).
    try {
      const { sendNewsletterConfirmEmail } = require('../utils/email');
      if (typeof sendNewsletterConfirmEmail === 'function') {
        await sendNewsletterConfirmEmail(email, rawToken, name);
      }
    } catch { /* non-fatal — log only */ }

    // Don't reveal subscription state. Same response regardless.
    return res.json({ success: true, message: 'Check your inbox to confirm your subscription.' });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /newsletter/confirm?token=<raw>
// Flips status to 'active' after the user clicks the email link.
router.get('/newsletter/confirm', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid token' });
    }
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const { rows } = await pool.query(
      `UPDATE newsletter_subscribers
         SET status        = 'active',
             confirmed_at  = NOW(),
             confirm_token = NULL
       WHERE confirm_token = $1 AND status = 'pending'
       RETURNING email`,
      [tokenHash]
    );

    if (!rows.length) {
      return res.status(400).json({ error: 'Invalid or already-used confirmation link' });
    }
    return res.json({ success: true, message: 'Subscription confirmed. Welcome to Bengal Trails!' });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// POST /newsletter/unsubscribe — DPDP/GDPR right to opt out.
router.post('/newsletter/unsubscribe', validate(schemas.newsletter), async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'email required' });
    await pool.query(
      `UPDATE newsletter_subscribers
         SET status = 'unsubscribed', unsubscribed_at = NOW()
       WHERE email = $1`,
      [email.toLowerCase()]
    );
    // Always return success — don't reveal whether the email was subscribed.
    return res.json({ success: true, message: 'You have been unsubscribed.' });
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
      [req.user.id, Math.min(Math.max(parseInt(req.query.limit) || 50, 1), 100), Math.max(parseInt(req.query.offset) || 0, 0)]
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
    // Coerce to a string — a duplicated ?q=a&q=b arrives as an array and would
    // throw on .toLowerCase() (500). Take the first value.
    const q = String(Array.isArray(req.query.q) ? req.query.q[0] : (req.query.q || '')).toLowerCase().trim();
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
      // bengaliFood exports { categories, dishes, foodStreets } — the dishes
      // array is what we search (the old `foods` key never existed, so `.filter`
      // was throwing on the module object and silently returning no food results).
      const foods = Array.isArray(foodModule.dishes) ? foodModule.dishes : [];
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

// POST /search/track
// Records a COMMITTED search (user pressed Enter / opened the results page),
// NOT every keystroke. Stored in analytics_events so the admin dashboard can
// surface real top queries. Best-effort: never blocks or errors the caller.
router.post('/search/track', optionalAuth, async (req, res) => {
  try {
    const q = String(req.body?.query || '').toLowerCase().trim().slice(0, 100);
    if (q.length < 2) return res.json({ ok: true });
    await pool.query(
      `INSERT INTO analytics_events (event_type, user_id, metadata)
       VALUES ('search', $1, $2)`,
      [req.user?.id || null, JSON.stringify({ query: q })]
    ).catch(() => {});
    return res.json({ ok: true });
  } catch {
    return res.json({ ok: true }); // analytics must never break search UX
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

// ── GET /site-settings — Public endpoint (non-sensitive CMS content) ──────────
router.get('/site-settings', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT key, value FROM site_settings
       WHERE key IN ('hero','announcement','featured_destinations','food_section','seo')`
    );
    const settings = {};
    rows.forEach(r => {
      try { settings[r.key] = typeof r.value === 'string' ? JSON.parse(r.value) : r.value; }
      catch { settings[r.key] = r.value; }
    });
    return res.json({ settings });
  } catch (err) {
    return res.json({ settings: {} });
  }
});

// ════════════════════════════════════════
// PUBLIC PROFILE  (shareable, read-only — no private data exposed)
// ════════════════════════════════════════
//
// GET /users/:id/public
//   Returns a traveller's public-facing profile: display name, avatar, bio,
//   member-since, their PUBLISHED reviews, and badges computed from REAL
//   activity (review count, distinct places, helpful votes). No email, phone,
//   bookings, wishlist or other private data is ever returned.
router.get('/users/:id/public', async (req, res) => {
  const { id } = req.params;
  // UUID guard — avoids hammering the DB with malformed ids.
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return res.status(404).json({ error: 'Profile not found' });
  }
  try {
    const userRes = await pool.query(
      `SELECT id, name, avatar_url, location, bio, created_at
         FROM users WHERE id = $1 AND status != 'banned'`,
      [id]
    );
    if (!userRes.rows.length) return res.status(404).json({ error: 'Profile not found' });
    const u = userRes.rows[0];

    const reviewsRes = await pool.query(
      `SELECT r.id, r.destination_slug, r.rating, r.title, r.content, r.photos,
              r.helpful_count, r.created_at,
              d.name AS destination_title, d.image_url AS destination_image
         FROM reviews r
         LEFT JOIN destinations d ON d.slug = r.destination_slug
        WHERE r.user_id = $1 AND r.status = 'published'
        ORDER BY r.created_at DESC
        LIMIT 50`,
      [id]
    );
    const reviews = reviewsRes.rows;

    const reviewCount = reviews.length;
    const distinctPlaces = new Set(reviews.map(r => r.destination_slug)).size;
    const helpfulVotes = reviews.reduce((s, r) => s + (Number(r.helpful_count) || 0), 0);
    const hasPhoto = reviews.some(r => Array.isArray(r.photos) && r.photos.length > 0);
    const avgRating = reviewCount
      ? Math.round((reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0) / reviewCount) * 10) / 10
      : 0;

    const badges = [
      { earned: reviewCount >= 1,    icon: '✍️', label: 'First Review' },
      { earned: reviewCount >= 5,    icon: '🌟', label: 'Top Reviewer' },
      { earned: reviewCount >= 15,   icon: '🏆', label: 'Prolific Reviewer' },
      { earned: distinctPlaces >= 5, icon: '🧭', label: 'Bengal Explorer' },
      { earned: helpfulVotes >= 10,  icon: '👍', label: 'Trusted Voice' },
      { earned: hasPhoto,            icon: '📸', label: 'Photographer' },
    ];

    return res.json({
      profile: {
        id: u.id,
        name: u.name || 'Traveller',
        avatarUrl: u.avatar_url || null,
        location: u.location || null,
        bio: u.bio || null,
        memberSince: u.created_at,
      },
      stats: { reviews: reviewCount, places: distinctPlaces, helpfulVotes, avgRating },
      badges,
      reviews,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
