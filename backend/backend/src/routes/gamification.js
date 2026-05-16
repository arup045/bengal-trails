const router = require('express').Router();
const pool = require('../db/pool');
const { authenticate, optionalAuth } = require('../middleware/auth');

// ── GET /gamification/stats ───────────────────────────────────────────────────
router.get('/stats', authenticate, async (req, res) => {
  try {
    // Get or create gamification stats for user
    let { rows } = await pool.query(
      'SELECT * FROM user_points WHERE user_id = $1',
      [req.user.id]
    );

    if (!rows.length) {
      const ins = await pool.query(
        'INSERT INTO user_points (user_id) VALUES ($1) RETURNING *',
        [req.user.id]
      );
      rows = ins.rows;
    }

    const stats = rows[0];

    // Rank
    const rankRes = await pool.query(
      'SELECT COUNT(*) FROM user_points WHERE points > $1',
      [stats.points]
    );
    const rank = parseInt(rankRes.rows[0].count) + 1;
    const totalUsers = (await pool.query('SELECT COUNT(*) FROM user_points')).rows[0].count;

    const badges = [];
    if (stats.visited_places >= 1)  badges.push({ id: 'explorer',  name: 'Explorer',     icon: '🗺️', rarity: 'common' });
    if (stats.reviews_written >= 5) badges.push({ id: 'reviewer',  name: 'Reviewer',     icon: '⭐', rarity: 'rare' });
    if (stats.photos_shared >= 10)  badges.push({ id: 'photoghrapher', name: 'Photographer', icon: '📸', rarity: 'epic' });

    return res.json({
      stats: {
        points: stats.points,
        level: stats.level,
        badges,
        rank,
        totalUsers: parseInt(totalUsers),
        visitedPlaces: stats.visited_places,
        reviewsWritten: stats.reviews_written,
        photosShared: stats.photos_shared,
        achievements: [
          { id: 'visit10', name: 'Frequent Traveler', description: 'Visit 10 destinations', points: 100, progress: stats.visited_places, target: 10, completed: stats.visited_places >= 10 },
          { id: 'review5', name: 'Review Master',     description: 'Write 5 reviews',       points: 50,  progress: stats.reviews_written, target: 5,  completed: stats.reviews_written >= 5 },
        ],
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── GET /gamification/leaderboard ─────────────────────────────────────────────
router.get('/leaderboard', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT u.id AS user_id, u.name AS user_name, up.points, up.level,
             ROW_NUMBER() OVER (ORDER BY up.points DESC) AS rank
      FROM user_points up
      JOIN users u ON u.id = up.user_id
      WHERE u.status = 'active'
      ORDER BY up.points DESC
      LIMIT 10
    `);

    return res.json({ leaderboard: rows });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── GET /user-content ─────────────────────────────────────────────────────────
router.get('/user-content', optionalAuth, async (req, res) => {
  try {
    const filter = req.query.type || 'all';
    const sort   = req.query.sort || 'featured';
    const userId = req.user?.id;

    let query = `
      SELECT p.*, u.name AS user_name, u.avatar_url,
        ${userId ? `EXISTS(SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = $1)` : 'false'} AS is_liked
      FROM social_posts p
      JOIN users u ON u.id = p.user_id
    `;
    const params = userId ? [userId] : [];

    if (sort === 'popular') query += ' ORDER BY p.likes_count DESC';
    else query += ' ORDER BY p.created_at DESC';

    query += ' LIMIT 20';

    const { rows } = await pool.query(query, params);

    const content = rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      userName: r.user_name,
      type: 'post',
      content: r.content,
      destinationSlug: r.destination_slug,
      tags: [],
      likes: r.likes_count,
      comments: r.comments_count,
      isLiked: r.is_liked,
      featured: false,
      createdAt: r.created_at,
    }));

    return res.json({ content });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /user-content/:id/like ───────────────────────────────────────────────
router.post('/user-content/:id/like', authenticate, async (req, res) => {
  try {
    const existing = await pool.query(
      'SELECT 1 FROM post_likes WHERE post_id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (existing.rows.length) {
      await pool.query('DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2', [req.params.id, req.user.id]);
      await pool.query('UPDATE social_posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = $1', [req.params.id]);
    } else {
      await pool.query('INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2)', [req.params.id, req.user.id]);
      await pool.query('UPDATE social_posts SET likes_count = likes_count + 1 WHERE id = $1', [req.params.id]);
    }
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
