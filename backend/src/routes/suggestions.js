const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/suggestions?query=darjeeling
router.get('/', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.trim().length < 2) {
      return res.json({ suggestions: [] });
    }
    const q = query.trim();
    const result = await pool.query(`
      SELECT id::text, name, 'destination' AS type, image_url AS thumbnail_url,
             similarity(name, $1) AS score
      FROM destinations
      WHERE name ILIKE $2 OR similarity(name, $1) > 0.1
      UNION ALL
      SELECT id::text, name, 'festival' AS type, image_url AS thumbnail_url,
             similarity(name, $1) AS score
      FROM festivals
      WHERE name ILIKE $2 OR similarity(name, $1) > 0.1
      UNION ALL
      SELECT id::text, name, 'food' AS type, image_url AS thumbnail_url,
             similarity(name, $1) AS score
      FROM food
      WHERE name ILIKE $2 OR similarity(name, $1) > 0.1
      ORDER BY score DESC
      LIMIT 8
    `, [q, `%${q}%`]);
    res.json({ suggestions: result.rows });
  } catch (err) {
    console.error('Suggestions error:', err);
    res.json({ suggestions: [] });
  }
});

module.exports = router;