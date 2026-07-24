const router = require('express').Router();
const pool = require('../db/pool');
const { limiters } = require('../middleware/rateLimit');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

// ── GET /social/feed/discover ──────────────────────────────────────────────────
router.get('/feed/discover', optionalAuth, async (req, res) => {
  try {
    const userId = req.user?.id;

    const { rows } = await pool.query(`
      SELECT
        p.*,
        u.name AS user_name,
        u.avatar_url AS user_avatar,
        ${userId ? `EXISTS(SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = $1)` : 'false'} AS is_liked
      FROM social_posts p
      JOIN users u ON u.id = p.user_id
      ORDER BY p.created_at DESC
      LIMIT $${userId ? 2 : 1} OFFSET $${userId ? 3 : 2}
    `, userId
      ? [userId, Math.min(parseInt(req.query.limit) || 20, 100), parseInt(req.query.offset) || 0]
      : [Math.min(parseInt(req.query.limit) || 20, 100), parseInt(req.query.offset) || 0]);

    const posts = rows.map((p) => ({
      id: p.id,
      userId: p.user_id,
      userName: p.user_name,
      userAvatar: p.user_avatar,
      content: p.content,
      destination: p.destination_slug ? { slug: p.destination_slug } : null,
      likes: p.likes_count,
      comments: p.comments_count,
      isLiked: p.is_liked,
      images: p.images || [],
      createdAt: p.created_at,
    }));

    return res.json({ posts });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── GET /social/suggested-users ───────────────────────────────────────────────
router.get('/suggested-users', optionalAuth, async (req, res) => {
  try {
    const userId = req.user?.id;

    const { rows } = await pool.query(`
      SELECT
        u.id,
        u.name,
        u.avatar_url,
        (SELECT COUNT(*) FROM user_follows WHERE following_id = u.id) AS followers_count,
        (SELECT COUNT(*) FROM social_posts WHERE user_id = u.id) AS posts_count,
        ${userId ? `EXISTS(SELECT 1 FROM user_follows WHERE follower_id = $1 AND following_id = u.id)` : 'false'} AS is_following
      FROM users u
      WHERE u.status = 'active' ${userId ? 'AND u.id != $1' : ''}
      ORDER BY followers_count DESC
      LIMIT 5
    `, userId ? [userId] : []);

    return res.json({ users: rows });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /social/posts ────────────────────────────────────────────────────────
router.post('/posts', authenticate, limiters.write, validate(schemas.socialPost), async (req, res) => {
  try {
    const { content, destinationSlug, visitDate, images } = req.body;
    if (!content) return res.status(400).json({ error: 'content required' });

    const { rows } = await pool.query(
      `INSERT INTO social_posts (user_id, content, destination_slug, visit_date, images)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user.id, content, destinationSlug || null, visitDate || null, images || []]
    );

    return res.status(201).json({ success: true, post: rows[0] });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /social/posts/:id/like ───────────────────────────────────────────────
router.post('/posts/:id/like', authenticate, limiters.write, async (req, res) => {
  try {
    const { id } = req.params;

    // Toggle like
    const existing = await pool.query(
      'SELECT 1 FROM post_likes WHERE post_id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (existing.rows.length) {
      await pool.query('DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2', [id, req.user.id]);
      await pool.query('UPDATE social_posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = $1', [id]);
      return res.json({ success: true, liked: false });
    } else {
      await pool.query('INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2)', [id, req.user.id]);
      await pool.query('UPDATE social_posts SET likes_count = likes_count + 1 WHERE id = $1', [id]);
      return res.json({ success: true, liked: true });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── GET /social/posts/:id/comments ───────────────────────────────────────────
router.get('/posts/:id/comments', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT c.*, u.name AS user_name, u.avatar_url
       FROM post_comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.post_id = $1
       ORDER BY c.created_at ASC`,
      [req.params.id]
    );
    return res.json({ comments: rows });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /social/posts/:id/comments ──────────────────────────────────────────
router.post('/posts/:id/comments', authenticate, limiters.write, validate(schemas.comment), async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'content required' });

    const { rows } = await pool.query(
      'INSERT INTO post_comments (post_id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
      [req.params.id, req.user.id, content]
    );
    await pool.query('UPDATE social_posts SET comments_count = comments_count + 1 WHERE id = $1', [req.params.id]);

    return res.status(201).json({ success: true, comment: rows[0] });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /social/follow/:userId ───────────────────────────────────────────────
router.post('/follow/:userId', authenticate, limiters.write, async (req, res) => {
  try {
    const targetId = req.params.userId;
    if (targetId === req.user.id) return res.status(400).json({ error: 'Cannot follow yourself' });

    const existing = await pool.query(
      'SELECT 1 FROM user_follows WHERE follower_id = $1 AND following_id = $2',
      [req.user.id, targetId]
    );

    if (existing.rows.length) {
      await pool.query('DELETE FROM user_follows WHERE follower_id = $1 AND following_id = $2', [req.user.id, targetId]);
      return res.json({ success: true, following: false });
    } else {
      await pool.query('INSERT INTO user_follows (follower_id, following_id) VALUES ($1, $2)', [req.user.id, targetId]);
      return res.json({ success: true, following: true });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
