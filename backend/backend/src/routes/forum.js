const router = require('express').Router();
const pool = require('../db/pool');
const { limiters } = require('../middleware/rateLimit');
const { authenticate, optionalAuth } = require('../middleware/auth');

// ── GET /forum/threads ────────────────────────────────────────────────────────
router.get('/threads', optionalAuth, async (req, res) => {
  try {
    const category = req.query.category || 'all';
    const sort = req.query.sort || 'latest';

    let query = `
      SELECT t.*, u.name AS user_name, u.avatar_url
      FROM forum_threads t
      JOIN users u ON u.id = t.user_id
    `;
    const params = [];

    if (category !== 'all') {
      params.push(category);
      query += ` WHERE t.category = $${params.length}`;
    }

    if (sort === 'popular') query += ' ORDER BY t.likes_count DESC, t.replies_count DESC';
    else if (sort === 'most-replies') query += ' ORDER BY t.replies_count DESC';
    else query += ' ORDER BY t.is_pinned DESC, t.created_at DESC';

    query += ' LIMIT 50';

    const { rows } = await pool.query(query, params);
    return res.json({ threads: rows });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /forum/threads ───────────────────────────────────────────────────────
router.post('/threads', authenticate, limiters.write, async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'title and content required' });

    const { rows } = await pool.query(
      `INSERT INTO forum_threads (user_id, title, content, category, tags)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user.id, title, content, category || 'general', tags || []]
    );

    return res.status(201).json({ success: true, thread: rows[0] });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── GET /forum/threads/:id/replies ────────────────────────────────────────────
router.get('/threads/:id/replies', async (req, res) => {
  try {
    // Increment view count
    await pool.query('UPDATE forum_threads SET views_count = views_count + 1 WHERE id = $1', [req.params.id]);

    const { rows } = await pool.query(
      `SELECT r.*, u.name AS user_name, u.avatar_url
       FROM forum_replies r
       JOIN users u ON u.id = r.user_id
       WHERE r.thread_id = $1
       ORDER BY r.created_at ASC`,
      [req.params.id]
    );
    return res.json({ replies: rows });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /forum/threads/:id/replies ──────────────────────────────────────────
router.post('/threads/:id/replies', authenticate, limiters.write, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'content required' });

    const { rows } = await pool.query(
      'INSERT INTO forum_replies (thread_id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
      [req.params.id, req.user.id, content]
    );
    await pool.query('UPDATE forum_threads SET replies_count = replies_count + 1 WHERE id = $1', [req.params.id]);

    return res.status(201).json({ success: true, reply: rows[0] });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
