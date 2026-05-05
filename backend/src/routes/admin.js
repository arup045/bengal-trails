const { sendNewsletterEmail } = require('../utils/email');
const router = require('express').Router();
const pool = require('../db/pool');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { cache } = require('../utils/cache');

// All admin routes require auth + admin role
router.use(authenticate, requireAdmin);

// ── GET /admin/stats ──────────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const [usersRes, destRes, reviewsRes, bookingsRes, subsRes] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query("SELECT COUNT(*) FROM destinations WHERE status = 'published'"),
      pool.query('SELECT COUNT(*) FROM reviews'),
      pool.query('SELECT COUNT(*) FROM bookings'),
      pool.query("SELECT COUNT(*) FROM newsletter_subscribers WHERE status = 'active'"),
    ]);

    return res.json({
      stats: {
        totalUsers:        parseInt(usersRes.rows[0].count),
        totalDestinations: parseInt(destRes.rows[0].count),
        totalReviews:      parseInt(reviewsRes.rows[0].count),
        totalBookings:     parseInt(bookingsRes.rows[0].count),
        newsletterSubs:    parseInt(subsRes.rows[0].count),
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── GET /admin/users ──────────────────────────────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, email, name, role, status, avatar_url, created_at, last_login FROM users ORDER BY created_at DESC'
    );
    return res.json({ users: rows });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── PUT /admin/users/:userId/role ─────────────────────────────────────────────
router.put('/users/:userId/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin', 'moderator'].includes(role))
      return res.status(400).json({ error: 'Invalid role' });

    const { rows } = await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, name, role, status',
      [role, req.params.userId]
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    return res.json({ success: true, user: rows[0] });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── PUT /admin/users/:userId/status ──────────────────────────────────────────
router.put('/users/:userId/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'inactive', 'suspended'].includes(status))
      return res.status(400).json({ error: 'Invalid status' });

    const { rows } = await pool.query(
      'UPDATE users SET status = $1 WHERE id = $2 RETURNING id, email, name, role, status',
      [status, req.params.userId]
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    return res.json({ success: true, user: rows[0] });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── GET /admin/destinations ───────────────────────────────────────────────────
router.get('/destinations', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM destinations ORDER BY created_at DESC'
    );
    return res.json({ destinations: rows });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /admin/destinations ──────────────────────────────────────────────────
router.post('/destinations', async (req, res) => {
  try {
    const { name, category, region, description, short_description,
            image_url, price_from, best_time_to_visit, duration,
            latitude, longitude, featured, status } = req.body;

    if (!name || !category || !region || !description)
      return res.status(400).json({ error: 'name, category, region, description required' });

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const { rows } = await pool.query(
      `INSERT INTO destinations
         (name, slug, category, region, description, short_description, image_url,
          price_from, best_time_to_visit, duration, latitude, longitude, featured, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
      [name, slug, category, region, description, short_description, image_url,
       price_from, best_time_to_visit, duration,
       latitude || null, longitude || null,
       featured || false, status || 'published']
    );

    cache.invalidate('/api/destinations');
    return res.status(201).json({ success: true, destination: rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Destination with this name already exists' });
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── PUT /admin/destinations/:id ───────────────────────────────────────────────
router.put('/destinations/:id', async (req, res) => {
  try {
    const allowed = ['name','category','region','description','short_description','image_url',
                     'price_from','best_time_to_visit','duration','latitude','longitude','featured','status'];
    const updates = [];
    const values  = [];
    let i = 1;

    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates.push(`${key} = $${i++}`);
        values.push(req.body[key]);
      }
    }

    if (!updates.length) return res.status(400).json({ error: 'No valid fields to update' });

    values.push(req.params.id);
    const { rows } = await pool.query(
      `UPDATE destinations SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    );
    if (!rows.length) return res.status(404).json({ error: 'Destination not found' });

    cache.invalidate('/api/destinations');
    return res.json({ success: true, destination: rows[0] });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── DELETE /admin/destinations/:id ────────────────────────────────────────────
router.delete('/destinations/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM destinations WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Destination not found' });
    cache.invalidate('/api/destinations');
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── GET /admin/reviews ────────────────────────────────────────────────────────
router.get('/reviews', async (req, res) => {
  try {
    const filter = req.query.status || 'all';
    let query = `
      SELECT r.*, u.name AS user_name, u.email AS user_email
      FROM reviews r JOIN users u ON u.id = r.user_id
    `;
    const params = [];
    if (filter !== 'all') { query += ' WHERE r.status = $1'; params.push(filter); }
    query += ' ORDER BY r.created_at DESC';

    const { rows } = await pool.query(query, params);
    return res.json({ reviews: rows });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── DELETE /admin/reviews/:id ─────────────────────────────────────────────────
router.delete('/reviews/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM reviews WHERE id = $1', [req.params.id]);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /admin/reviews/:id/approve ──────────────────────────────────────────
router.post('/reviews/:id/approve', async (req, res) => {
  try {
    await pool.query("UPDATE reviews SET status = 'published' WHERE id = $1", [req.params.id]);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /admin/reviews/:id/reject ───────────────────────────────────────────
router.post('/reviews/:id/reject', async (req, res) => {
  try {
    await pool.query("UPDATE reviews SET status = 'rejected' WHERE id = $1", [req.params.id]);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── GET /admin/newsletter/subscribers ────────────────────────────────────────
router.get('/newsletter/subscribers', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM newsletter_subscribers ORDER BY subscribed_at DESC'
    );
    return res.json({ subscribers: rows });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /admin/newsletter/send ───────────────────────────────────────────────
router.post('/newsletter/send', async (req, res) => {
  try {
    const { subject, body } = req.body;
    if (!subject || !body) return res.status(400).json({ error: 'subject and body required' });

    const { rows } = await pool.query(
      "SELECT email FROM newsletter_subscribers WHERE status = 'active'"
    );

    const emails = rows.map(r => r.email);
    const result = await sendNewsletterEmail(emails, subject, body);
    return res.json({ success: true, message: `Newsletter sent to ${result.sent} subscribers.` });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── GET /admin/settings ───────────────────────────────────────────────────────
router.get('/settings', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT key, value FROM site_settings');
    const settings = {};
    rows.forEach((r) => { settings[r.key] = r.value; });
    return res.json({ settings });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── PUT /admin/settings ───────────────────────────────────────────────────────
router.put('/settings', async (req, res) => {
  try {
    const settings = req.body;
    for (const [key, value] of Object.entries(settings)) {
      await pool.query(
        `INSERT INTO site_settings (key, value) VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
        [key, JSON.stringify(value)]
      );
    }
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── GET /admin/check-exists ────────────────────────────────────────────────────
router.get('/check-exists', async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'admin'");
    return res.json({ exists: parseInt(rows[0].count) > 0 });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /admin/create-first-admin ────────────────────────────────────────────
// One-time endpoint — only works if no admin exists yet
router.post('/create-first-admin', async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'admin'");
    if (parseInt(rows[0].count) > 0) {
      return res.status(403).json({ error: 'Admin already exists' });
    }
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });

    await pool.query("UPDATE users SET role = 'admin' WHERE id = $1", [userId]);
    return res.json({ success: true, message: 'Admin created!' });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
