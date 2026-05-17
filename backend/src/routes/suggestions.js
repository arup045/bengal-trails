// GET /api/suggestions?query=darjeeling
// Returns auto-complete suggestions from destinations (DB) + festivals + food (JSON files).
// Festivals and food are served from in-memory JSON — NOT stored in the database.

const express = require('express');
const router  = express.Router();
const pool    = require('../db/pool');   // ✅ correct path (was '../db' — broken)

const festivals   = require('../data/festivals');
const foodModule  = require('../data/bengaliFood');
const bengaliFood = foodModule.dishes || foodModule;

router.get('/', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || String(query).trim().length < 2) {
      return res.json({ suggestions: [] });
    }
    const q   = String(query).trim();
    const ql  = q.toLowerCase();

    // ── 1. Destinations from PostgreSQL (full-text + fuzzy) ──────────────────
    let dbRows = [];
    try {
      const result = await pool.query(
        `SELECT id::text, name, slug, 'destination' AS type, image_url AS thumbnail_url,
                region, category,
                similarity(LOWER(name), $1) AS score
         FROM destinations
         WHERE status = 'published'
           AND (LOWER(name) ILIKE $2 OR LOWER(region) ILIKE $2 OR similarity(LOWER(name), $1) > 0.15)
         ORDER BY score DESC, featured DESC
         LIMIT 5`,
        [ql, `%${ql}%`]
      );
      dbRows = result.rows;
    } catch (dbErr) {
      // pg_trgm may not be enabled on this DB instance; fall back to ILIKE only
      try {
        const result = await pool.query(
          `SELECT id::text, name, slug, 'destination' AS type, image_url AS thumbnail_url,
                  region, category, 0 AS score
           FROM destinations
           WHERE status = 'published'
             AND (LOWER(name) ILIKE $1 OR LOWER(region) ILIKE $1)
           ORDER BY featured DESC
           LIMIT 5`,
          [`%${ql}%`]
        );
        dbRows = result.rows;
      } catch { /* ignore completely */ }
    }

    // ── 2. Festivals from JSON ────────────────────────────────────────────────
    const festRows = festivals
      .filter(f =>
        f.name.toLowerCase().includes(ql) ||
        (f.bengaliName && f.bengaliName.toLowerCase().includes(ql))
      )
      .slice(0, 3)
      .map(f => ({
        id: f.id,
        name: f.name,
        slug: f.id,
        type: 'festival',
        thumbnail_url: f.image || null,
        score: f.name.toLowerCase().startsWith(ql) ? 0.9 : 0.5,
      }));

    // ── 3. Food from JSON ─────────────────────────────────────────────────────
    const foodRows = (Array.isArray(bengaliFood) ? bengaliFood : [])
      .filter(d =>
        d.name.toLowerCase().includes(ql) ||
        (d.bengaliName && d.bengaliName.toLowerCase().includes(ql))
      )
      .slice(0, 2)
      .map(d => ({
        id: d.id || d.slug,
        name: d.name,
        slug: d.slug || d.id,
        type: 'food',
        thumbnail_url: d.image || null,
        score: d.name.toLowerCase().startsWith(ql) ? 0.8 : 0.4,
      }));

    // ── Merge, sort by score, cap at 8 ───────────────────────────────────────
    const all = [...dbRows, ...festRows, ...foodRows]
      .sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0))
      .slice(0, 8);

    return res.json({ suggestions: all });
  } catch (err) {
    console.error('Suggestions error:', err);
    return res.json({ suggestions: [] });
  }
});

module.exports = router;
