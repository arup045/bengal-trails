// placeImages.js — per-item images for the district pages.
//
// Admins upload one real photo per item (a landmark, park, food, hotel, etc.)
// from the admin panel; the district pages read them here. Until an image is
// set, the frontend shows a neutral placeholder (never a fake/random photo).
//
// Public:  GET  /api/place-images/:districtSlug  → { images: { "<itemName>": url } }
// Admin endpoints (upsert/delete) live in routes/admin.js behind auth.

const router = require('express').Router();
const pool = require('../db/pool');

pool.query(`
  CREATE TABLE IF NOT EXISTS place_images (
    id            SERIAL PRIMARY KEY,
    district_slug VARCHAR(64)  NOT NULL,
    item_name     VARCHAR(255) NOT NULL,
    section       VARCHAR(40),
    image_url     TEXT,
    item_type     VARCHAR(60),
    rating        NUMERIC(2,1),
    hours         VARCHAR(80),
    updated_at    TIMESTAMPTZ  DEFAULT NOW(),
    UNIQUE (district_slug, item_name)
  );
  CREATE INDEX IF NOT EXISTS idx_place_images_district ON place_images(district_slug);
  -- Backfill columns for existing deployments + relax the old NOT NULL on image.
  ALTER TABLE place_images ALTER COLUMN image_url DROP NOT NULL;
  ALTER TABLE place_images ADD COLUMN IF NOT EXISTS item_type VARCHAR(60);
  ALTER TABLE place_images ADD COLUMN IF NOT EXISTS rating    NUMERIC(2,1);
  ALTER TABLE place_images ADD COLUMN IF NOT EXISTS hours     VARCHAR(80);
`).catch((e) => console.warn('[place_images] table init:', e.message));

// GET /api/place-images/:districtSlug
// Returns `items` keyed by item name with { image, type, rating, hours }.
// `images` (name → url) is kept for backward compatibility.
router.get('/:districtSlug', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT item_name, image_url, item_type, rating, hours FROM place_images WHERE district_slug = $1',
      [String(req.params.districtSlug).toLowerCase()]
    );
    const items = {};
    const images = {};
    rows.forEach((r) => {
      items[r.item_name] = {
        image: r.image_url || undefined,
        type: r.item_type || undefined,
        rating: r.rating != null ? Number(r.rating) : undefined,
        hours: r.hours || undefined,
      };
      if (r.image_url) images[r.item_name] = r.image_url;
    });
    return res.json({ items, images });
  } catch (err) {
    return res.json({ items: {}, images: {} }); // never break the page over images
  }
});

module.exports = router;
