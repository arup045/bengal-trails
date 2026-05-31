const router = require('express').Router();
const pool = require('../db/pool');
const { sendWelcomeEmail } = require('../utils/email');

// Build a personalized digest for one user based on wishlist + browsing
async function buildDigest(userId) {
  // Get user's interests from wishlist + recently viewed
  const interests = await pool.query(`
    SELECT DISTINCT d.region, d.category
    FROM destinations d
    WHERE d.slug IN (
      SELECT destination_slug FROM wishlists WHERE user_id = $1
      UNION
      SELECT destination_slug FROM recently_viewed WHERE user_id = $1
    )
  `, [userId]);

  const regions = [...new Set(interests.rows.map(r => r.region))];
  const categories = [...new Set(interests.rows.map(r => r.category))];

  // Find similar destinations not yet wishlisted
  let recommendations;
  if (regions.length || categories.length) {
    recommendations = await pool.query(`
      SELECT name, slug, region, category, image_url, rating, short_description
      FROM destinations
      WHERE status = 'published'
        AND (region = ANY($1) OR category = ANY($2))
        AND slug NOT IN (SELECT destination_slug FROM wishlists WHERE user_id = $3)
      ORDER BY rating DESC NULLS LAST, RANDOM()
      LIMIT 4
    `, [regions, categories, userId]);
  } else {
    recommendations = await pool.query(`
      SELECT name, slug, region, category, image_url, rating, short_description
      FROM destinations
      WHERE status = 'published' AND featured = true
      ORDER BY rating DESC NULLS LAST
      LIMIT 4
    `);
  }

  return recommendations.rows;
}

// Build HTML email body
function buildDigestEmail(name, recommendations, frontendUrl) {
  const cards = recommendations.map(r => `
    <div style="margin:16px 0;border:1px solid #eee;border-radius:12px;overflow:hidden">
      <a href="${frontendUrl}/#/explore/${r.slug}" style="text-decoration:none;color:inherit">
        ${r.image_url ? `<img src="${r.image_url}" style="width:100%;height:180px;object-fit:cover;display:block">` : ''}
        <div style="padding:16px">
          <div style="font-size:12px;color:#7c3aed;text-transform:uppercase;letter-spacing:1px">${r.category} · ${r.region}</div>
          <h3 style="margin:6px 0;color:#1a1a1a">${r.name}</h3>
          <p style="color:#555;font-size:14px;line-height:1.5">${(r.short_description || '').slice(0, 120)}${r.short_description?.length > 120 ? '...' : ''}</p>
          ${r.rating ? `<div style="color:#f59e0b;font-size:13px">★ ${r.rating}</div>` : ''}
        </div>
      </a>
    </div>
  `).join('');

  return `
    <h2 style="color:#1a1a1a">Hi ${name}, here are this week's picks for you 🌿</h2>
    <p style="color:#555">Based on places you've loved, we think you'll enjoy these:</p>
    ${cards}
    <p style="color:#888;font-size:13px;margin-top:24px">
      <a href="${frontendUrl}/#/explore" style="color:#7c3aed">Browse all 221 destinations →</a>
    </p>
  `;
}

// ── POST /digests/send-weekly ───────────────────────────────────────────────
// Triggered by a cron job (or manually by admin)
router.post('/send-weekly', async (req, res) => {
  try {
    // Auth: require a matching CRON_SECRET header. DENY BY DEFAULT — if the
    // secret isn't configured at all, refuse rather than leave this bulk-email
    // endpoint open to the public (an attacker could otherwise spam every user).
    const secret = req.headers['x-cron-secret'];
    if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { rows: users } = await pool.query(`
      SELECT id, email, name FROM users
      WHERE status = 'active' AND email IS NOT NULL
      LIMIT 500
    `);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const { sendNewsletterEmail } = require('../utils/email');

    let sent = 0;
    for (const user of users) {
      const recs = await buildDigest(user.id);
      if (!recs.length) continue;
      const body = buildDigestEmail(user.name || 'traveler', recs, frontendUrl);
      try {
        await sendNewsletterEmail([user.email], '🌿 Your weekly Bengal Trails picks', body);
        sent++;
      } catch (err) {
        console.error(`Digest failed for ${user.email}:`, err.message);
      }
    }

    return res.json({ success: true, sent, total: users.length });
  } catch (err) {
    console.error('digest error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Preview digest for current user (testing)
router.get('/preview', async (req, res) => {
  try {
    const { authenticate } = require('../middleware/auth');
    // Manual auth check (since we want this on a single endpoint)
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: 'Auth required' });
    const jwt = require('jsonwebtoken');
    const payload = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET);

    const recs = await buildDigest(payload.userId);
    const { rows } = await pool.query('SELECT name FROM users WHERE id = $1', [payload.userId]);
    const html = buildDigestEmail(rows[0]?.name || 'traveler', recs, process.env.FRONTEND_URL || 'http://localhost:5173');
    res.json({ recommendations: recs, html });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
