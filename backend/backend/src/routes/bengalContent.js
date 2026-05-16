// ── Bengal-specific content endpoints ────────────────────────────────────────
'use strict';

const router = require('express').Router();
const festivals = require('../data/festivals');
const foodModule = require('../data/bengaliFood');
const bengaliFood = foodModule.dishes;
const foodCategories = foodModule.categories;
const foodStreets = foodModule.foodStreets;
const { transportGuides } = require('../data/transport');
const { hotels } = require('../data/hotels');
const { subplaces } = require('../data/subplaces');

// ── FESTIVALS ────────────────────────────────────────────────────────────────
router.get('/festivals', (req, res) => {
  const { month, location } = req.query;
  let result = festivals;
  if (month) {
    // Accept both number ("10") and name ("october")
    const monthMap = {
      january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
      july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
    };
    const monthNum = parseInt(month, 10) || monthMap[String(month).toLowerCase()];
    if (monthNum) {
      result = result.filter((f) => f.months && f.months.includes(monthNum));
    }
  }
  if (location) {
    const loc = String(location).toLowerCase();
    result = result.filter((f) =>
      f.locations && f.locations.some((l) => String(l).toLowerCase().includes(loc))
    );
  }
  res.json({ festivals: result, count: result.length });
});

router.get('/festivals/:slug', (req, res) => {
  const f = festivals.find((x) => x.slug === req.params.slug);
  if (!f) return res.status(404).json({ error: 'Festival not found' });
  res.json({ festival: f });
});

// ── FOOD ─────────────────────────────────────────────────────────────────────
router.get('/food', (req, res) => {
  const { category, search } = req.query;
  let result = bengaliFood;
  if (category) {
    result = result.filter((d) => d.category === String(category).toLowerCase());
  }
  if (search) {
    const q = String(search).toLowerCase();
    result = result.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        (d.bengaliName && d.bengaliName.toLowerCase().includes(q)) ||
        (d.description && d.description.toLowerCase().includes(q))
    );
  }
  res.json({
    food: result,
    count: result.length,
    categories: foodCategories,
  });
});

router.get('/food/streets', (req, res) => {
  res.json({ streets: foodStreets, count: foodStreets.length });
});

router.get('/food/:slug', (req, res) => {
  const dish = bengaliFood.find((d) => d.slug === req.params.slug);
  if (!dish) return res.status(404).json({ error: 'Dish not found' });
  res.json({ dish });
});

// ── TRANSPORT ────────────────────────────────────────────────────────────────
router.get('/transport', (req, res) => {
  res.json({ transport: transportGuides, count: transportGuides.length });
});

router.get('/transport/:destinationSlug', (req, res) => {
  const guide = transportGuides.find(
    (t) => t.destinationSlug === req.params.destinationSlug
  );
  if (!guide) {
    return res.json({
      transport: null,
      note: 'No specific guide — check general Bengal transport options',
    });
  }
  res.json({ transport: guide });
});

// ── HOTELS ───────────────────────────────────────────────────────────────────
router.get('/hotels', (req, res) => {
  const { destinationSlug, priceCategory } = req.query;
  let result = hotels;
  if (destinationSlug) {
    result = result.filter((h) => h.destinationSlug === destinationSlug);
  }
  if (priceCategory) {
    result = result.filter((h) => h.priceCategory === priceCategory);
  }
  res.json({ hotels: result, count: result.length });
});

// ── SUBPLACES ────────────────────────────────────────────────────────────────
router.get('/subplaces', (req, res) => {
  const { parentSlug, type } = req.query;
  let result = subplaces;
  if (parentSlug) {
    result = result.filter((s) => s.parentSlug === parentSlug);
  }
  if (type) {
    result = result.filter((s) => s.type === type);
  }
  res.json({ subplaces: result, count: result.length });
});

// ── COMBINED — full destination context (one call) ──────────────────────────
router.get('/destination-context/:slug', (req, res) => {
  const slug = req.params.slug;
  const transport = transportGuides.find((t) => t.destinationSlug === slug) || null;
  const destHotels = hotels.filter((h) => h.destinationSlug === slug);
  const nearby = subplaces.filter((s) => s.parentSlug === slug);

  res.json({
    transport,
    hotels: destHotels,
    subplaces: nearby,
    counts: {
      hotels: destHotels.length,
      subplaces: nearby.length,
    },
  });
});

module.exports = router;
