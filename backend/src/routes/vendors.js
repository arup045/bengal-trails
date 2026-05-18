'use strict';
const router   = require('express').Router();
const pool     = require('../db/pool');
const { authenticate, requireAdmin } = require('../middleware/auth');

// ── Schema setup — runs once on server startup ────────────────────────────────
async function ensureTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS vendor_applications (
      id              SERIAL PRIMARY KEY,
      user_id         UUID    REFERENCES users(id) ON DELETE CASCADE,
      business_name   VARCHAR(255) NOT NULL,
      business_type   VARCHAR(100) NOT NULL,   -- 'tour_guide'|'hotel'|'restaurant'|'transport'
      description     TEXT,
      experience_yrs  INTEGER DEFAULT 0,
      languages       TEXT[],
      service_areas   TEXT[],
      phone           VARCHAR(50),
      website         VARCHAR(500),
      portfolio_urls  TEXT[],
      id_proof_url    VARCHAR(500),
      status          VARCHAR(50) DEFAULT 'pending',  -- pending|approved|rejected
      admin_notes     TEXT,
      reviewed_by     UUID    REFERENCES users(id),
      reviewed_at     TIMESTAMPTZ,
      created_at      TIMESTAMPTZ DEFAULT NOW(),
      updated_at      TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

// ── POST /vendors/apply ────────────────────────────────────────────────────────
router.post('/apply', authenticate, async (req, res) => {
  try {
    const { businessName, businessType, description, experienceYrs,
            languages, serviceAreas, phone, website, portfolioUrls, idProofUrl } = req.body;

    if (!businessName || !businessType)
      return res.status(400).json({ error: 'businessName and businessType are required' });

    // Check for existing pending application
    const existing = await pool.query(
      "SELECT id, status FROM vendor_applications WHERE user_id=$1 AND status='pending'",
      [req.user.id]
    );
    if (existing.rows.length)
      return res.status(409).json({ error: 'You already have a pending application.' });

    const { rows } = await pool.query(
      `INSERT INTO vendor_applications
         (user_id, business_name, business_type, description, experience_yrs,
          languages, service_areas, phone, website, portfolio_urls, id_proof_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [req.user.id, businessName, businessType, description || null,
       experienceYrs || 0, languages || [], serviceAreas || [],
       phone || null, website || null, portfolioUrls || [], idProofUrl || null]
    );

    return res.status(201).json({ success: true, application: rows[0] });
  } catch (err) {
    console.error('vendor apply error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── GET /vendors/my-application ───────────────────────────────────────────────
router.get('/my-application', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM vendor_applications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 1',
      [req.user.id]
    );
    return res.json({ application: rows[0] || null });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── GET /vendors/all  (admin only) ────────────────────────────────────────────
router.get('/all', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    let q = `SELECT v.*, u.name AS applicant_name, u.email AS applicant_email
             FROM vendor_applications v JOIN users u ON v.user_id=u.id`;
    const params = [];
    if (status) { params.push(status); q += ` WHERE v.status=$1`; }
    q += ' ORDER BY v.created_at DESC';
    const { rows } = await pool.query(q, params);
    return res.json({ applications: rows });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── PUT /vendors/:id/review  (admin only) ─────────────────────────────────────
router.put('/:id/review', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    if (!['approved', 'rejected'].includes(status))
      return res.status(400).json({ error: 'status must be approved or rejected' });

    const { rows } = await pool.query(
      `UPDATE vendor_applications
         SET status=$1, admin_notes=$2, reviewed_by=$3, reviewed_at=NOW(), updated_at=NOW()
       WHERE id=$4 RETURNING *`,
      [status, adminNotes || null, req.user.id, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Application not found' });

    // If approved, update the user's role to 'guide'
    if (status === 'approved') {
      await pool.query("UPDATE users SET role='guide' WHERE id=$1", [rows[0].user_id]);
    }

    return res.json({ success: true, application: rows[0] });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── GET /vendors/approved  (public) ──────────────────────────────────────────
router.get('/approved', async (req, res) => {
  try {
    const { type, area } = req.query;
    let q = `SELECT v.business_name, v.business_type, v.description, v.experience_yrs,
                    v.languages, v.service_areas, v.website, v.portfolio_urls,
                    u.name AS guide_name, u.avatar_url
             FROM vendor_applications v JOIN users u ON v.user_id=u.id
             WHERE v.status='approved'`;
    const params = [];
    if (type)  { params.push(type);  q += ` AND v.business_type=$${params.length}`; }
    if (area)  { params.push(`%${area}%`); q += ` AND v.service_areas::text ILIKE $${params.length}`; }
    q += ' ORDER BY v.experience_yrs DESC';
    const { rows } = await pool.query(q, params);
    return res.json({ vendors: rows });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// Run schema migration once on startup
ensureTables().catch(err => console.error('[vendors] table init failed:', err.message));

module.exports = router;
