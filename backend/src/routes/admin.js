const { sendNewsletterEmail } = require('../utils/email');
const router = require('express').Router();
const pool = require('../db/pool');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { cache } = require('../utils/cache');
const { limiters } = require('../middleware/rateLimit');

// All admin routes require auth + admin role
router.use(authenticate, requireAdmin);

// ── Ensure audit_logs table exists at module load (not lazily in the GET handler).
// writeAuditLog is called throughout this module; creating the table eagerly
// prevents silent failures when the first write happens before a GET.
pool.query(`
  CREATE TABLE IF NOT EXISTS audit_logs (
    id           SERIAL       PRIMARY KEY,
    admin_id     UUID         REFERENCES users(id) ON DELETE SET NULL,
    action       VARCHAR(100) NOT NULL,
    entity_type  VARCHAR(100),
    entity_id    VARCHAR(100),
    detail       JSONB,
    ip_address   VARCHAR(50),
    created_at   TIMESTAMPTZ  DEFAULT NOW()
  );
  CREATE INDEX IF NOT EXISTS idx_audit_logs_admin ON audit_logs(admin_id);
  CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
`).catch((e) => console.warn('[admin] audit_logs table init warning:', e.message));

// ── GET /admin/stats?range=7d|30d|90d ────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const range = req.query.range || '30d';
    const days  = range === '7d' ? 7 : range === '90d' ? 90 : 30;

    // P1-27: parameterized intervals — `make_interval` is the idiomatic
    // Postgres way to pass interval-as-parameter. Old code interpolated
    // ${days} which was safe by virtue of the line above clamping to
    // 7/30/90, but the pattern is fragile (one careless edit = SQLi).
    const [totals, signupTrend, topDests, enquiryCount, searchTotals, searchTerms] = await Promise.all([
      // Totals
      Promise.all([
        pool.query('SELECT COUNT(*) FROM users'),
        pool.query("SELECT COUNT(*) FROM destinations WHERE status='published'"),
        pool.query('SELECT COUNT(*) FROM reviews'),
        pool.query("SELECT COUNT(*) FROM newsletter_subscribers WHERE status='active'"),
        pool.query(
          `SELECT COUNT(*) FROM users WHERE created_at >= NOW() - make_interval(days => $1)`,
          [days]
        ),
      ]),
      // Daily signups for chart
      pool.query(`
        SELECT DATE(created_at) AS date, COUNT(*) AS count
        FROM users
        WHERE created_at >= NOW() - make_interval(days => $1)
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `, [days]),
      // Top destinations by view count
      pool.query(`
        SELECT name, slug, view_count, rating
        FROM destinations
        WHERE status='published'
        ORDER BY view_count DESC NULLS LAST
        LIMIT 8
      `),
      // Enquiries
      pool.query("SELECT COUNT(*) FROM enquiries").catch(() => ({ rows: [{ count: 0 }] })),
      // Search totals (real, from analytics_events) — graceful if table/data absent
      pool.query(`
        SELECT COUNT(*)::int AS total,
               COUNT(DISTINCT LOWER(metadata->>'query'))::int AS unique
          FROM analytics_events
         WHERE event_type = 'search'
           AND created_at >= NOW() - make_interval(days => $1)
      `, [days]).catch(() => ({ rows: [{ total: 0, unique: 0 }] })),
      // Top search terms (real)
      pool.query(`
        SELECT LOWER(metadata->>'query') AS term, COUNT(*)::int AS count
          FROM analytics_events
         WHERE event_type = 'search'
           AND created_at >= NOW() - make_interval(days => $1)
           AND metadata->>'query' IS NOT NULL
         GROUP BY LOWER(metadata->>'query')
         ORDER BY count DESC
         LIMIT 8
      `, [days]).catch(() => ({ rows: [] })),
    ]);

    const [usersRes, destRes, reviewsRes, subsRes, newUsersRes] = totals;
    const searchTotalsRow = searchTotals.rows[0] || { total: 0, unique: 0 };

    return res.json({
      stats: {
        totalUsers:        parseInt(usersRes.rows[0].count),
        totalDestinations: parseInt(destRes.rows[0].count),
        totalReviews:      parseInt(reviewsRes.rows[0].count),
        newsletterSubs:    parseInt(subsRes.rows[0].count),
        newUsersInRange:   parseInt(newUsersRes.rows[0].count),
        totalEnquiries:    parseInt(enquiryCount.rows[0].count),
      },
      signupTrend:  signupTrend.rows.map(r => ({ date: r.date, users: parseInt(r.count) })),
      topDestinations: topDests.rows,
      searchStats: {
        total:    searchTotalsRow.total  || 0,
        unique:   searchTotalsRow.unique || 0,
        topTerms: searchTerms.rows,   // [{ term, count }]
      },
    });
  } catch (err) {
    console.error('admin stats error:', err);
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
// P1-28: refuse self-modification. An admin demoting themselves (especially
// the last admin) locks the site out of all admin functionality. Same for
// suspending themselves. They must ask another admin.
router.put('/users/:userId/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin', 'moderator'].includes(role))
      return res.status(400).json({ error: 'Invalid role' });

    if (req.params.userId === req.user.id) {
      return res.status(400).json({ error: 'You cannot change your own role. Ask another admin.' });
    }

    // If demoting an admin, refuse if this would leave zero admins.
    if (role !== 'admin') {
      const target = await pool.query("SELECT role FROM users WHERE id = $1", [req.params.userId]);
      if (target.rows[0]?.role === 'admin') {
        const adminCount = await pool.query("SELECT COUNT(*)::int AS c FROM users WHERE role = 'admin' AND status = 'active'");
        if ((adminCount.rows[0]?.c || 0) <= 1) {
          return res.status(400).json({ error: 'Cannot demote the last active admin.' });
        }
      }
    }

    const { rows } = await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, name, role, status',
      [role, req.params.userId]
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    writeAuditLog(req.user.id, 'user.role_changed', 'user', req.params.userId, req, { newRole: role });
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

    if (req.params.userId === req.user.id) {
      return res.status(400).json({ error: 'You cannot change your own status. Ask another admin.' });
    }

    const { rows } = await pool.query(
      'UPDATE users SET status = $1 WHERE id = $2 RETURNING id, email, name, role, status',
      [status, req.params.userId]
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    writeAuditLog(req.user.id, 'user.status_changed', 'user', req.params.userId, req, { newStatus: status });
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

    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Handle slug collisions by appending a numeric suffix
    let slug = baseSlug;
    let attempt = 0;
    while (true) {
      const existing = await pool.query('SELECT id FROM destinations WHERE slug = $1', [slug]);
      if (!existing.rows.length) break;
      attempt++;
      slug = `${baseSlug}-${attempt}`;
      if (attempt > 99) return res.status(409).json({ error: 'Cannot generate unique slug for this name.' });
    }

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
    writeAuditLog(req.user.id, 'destination.created', 'destination', rows[0].id, req, { name, slug });
    return res.status(201).json({ success: true, destination: rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Destination with this name already exists.' });
    console.error('create destination error:', err);
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
    writeAuditLog(req.user.id, 'destination.deleted', 'destination', req.params.id, req);
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
router.post('/newsletter/send', limiters.newsletter, async (req, res) => {
  try {
    const { subject, body } = req.body;
    if (!subject || !body) return res.status(400).json({ error: 'subject and body required' });

    const { rows } = await pool.query(
      "SELECT email FROM newsletter_subscribers WHERE status = 'active'"
    );

    const emails = rows.map(r => r.email);
    const result = await sendNewsletterEmail(emails, subject, body);
    writeAuditLog(req.user.id, 'newsletter.sent', 'newsletter', 'campaign', req, {
      subject,
      recipientCount: emails.length,
    });
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

// NOTE: /admin/create-first-admin was removed. It was unreachable because all
// admin routes require existing admin auth (router.use(authenticate, requireAdmin)).
// First admin setup is handled by the migration script via FIRST_ADMIN_EMAIL/PASSWORD
// environment variables. See backend/src/db/migrate.js.

// ── Internal audit log writer ─────────────────────────────────────────────────
// Non-blocking — logs admin actions for compliance and incident response.
// Called at every sensitive operation (role/status changes, deletions, newsletter).
function writeAuditLog(adminId, action, entityType, entityId, req, detail = null) {
  pool.query(
    `INSERT INTO audit_logs (admin_id, action, entity_type, entity_id, detail, ip_address)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [adminId, action, entityType, String(entityId || ''), detail ? JSON.stringify(detail) : null, req.ip]
  ).catch((e) => console.error('[audit] write failed:', e.message));
}

// ── GET /admin/audit-logs ─────────────────────────────────────────────────────
router.get('/audit-logs', async (req, res) => {
  try {
    const limit  = Math.min(parseInt(req.query.limit  || '100', 10), 500);
    const offset = Math.max(parseInt(req.query.offset || '0',   10), 0);
    const { rows } = await pool.query(`
      SELECT a.id, a.action, a.entity_type, a.entity_id, a.detail,
             a.ip_address, a.created_at,
             u.name AS admin_name, u.email AS admin_email
      FROM audit_logs a
      LEFT JOIN users u ON a.admin_id = u.id
      ORDER BY a.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);
    return res.json({ logs: rows });
  } catch (err) {
    console.error('audit-logs error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
