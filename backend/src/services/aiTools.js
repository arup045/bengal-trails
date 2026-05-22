// backend/src/services/aiTools.js
//
// Defines tools that Gemini can call to query the live Bengal Trails database.
// Each tool has:
//   - A declaration (sent to Gemini in the tools API param)
//   - An executor (the JS function that runs when Gemini asks for it)
//
// Gemini's function-calling format:
//   request:  POST .../generateContent { tools: [{functionDeclarations: [...]}] }
//   response: { candidates: [{ content: { parts: [{ functionCall: {name, args} }] } }] }
//   reply:    POST .../generateContent { contents: [..., {role: 'function', parts: [{ functionResponse: {name, response: {...}} }]}] }

const pool = require('../db/pool');
const { retrieve: semanticRetrieve } = require('./embeddingsService');

// ─── Tool declarations (sent to Gemini) ─────────────────────────────────────────

const toolDeclarations = [
  {
    name: 'search_destinations',
    description:
      'Search West Bengal destinations by region, category, or text query. Returns matching destinations with name, slug, region, category, image, and short description. Use this whenever the user asks for places to visit, recommendations by area, or wants to find destinations matching a vibe.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Free-text search query (matches name, description, region, category). Optional.',
        },
        region: {
          type: 'string',
          description:
            'Filter by region. One of: North Bengal, South Bengal, Central Bengal, East Bengal. Optional.',
        },
        category: {
          type: 'string',
          description:
            "Filter by category. Real values in DB: Heritage, Temple, Beach, Wildlife, Park, TeaTrails, HillStation, Lake, Riverfront, Museum, Fort, Palace, Market, Tribal, Mosque, Church, Monastery, Viewpoint, UNESCO, Cafe, Restaurant, Terracotta. Use lowercase fragments like hill, tea, beach, temple, museum — substring matching is enabled. Optional.",
        },
        limit: {
          type: 'number',
          description: 'Max results to return (default 5, max 10).',
        },
      },
    },
  },
  {
    name: 'get_destination_details',
    description:
      'Fetch full details for a single destination by slug — including description, highlights, best time to visit, price range, rating, and activities. Use this when the user asks "tell me about X" or wants deep info on one specific place.',
    parameters: {
      type: 'object',
      properties: {
        slug: {
          type: 'string',
          description: 'The destination slug (e.g. "darjeeling", "sundarbans-national-park"). Required.',
        },
      },
      required: ['slug'],
    },
  },
  {
    name: 'list_festivals',
    description:
      'Find Bengal festivals — by month, category, or location. Returns festival name, Bengali name, typical dates, locations, and vibe. Use this for "festivals in October", "religious festivals", "festivals in Shantiniketan", etc.',
    parameters: {
      type: 'object',
      properties: {
        month: {
          type: 'number',
          description: 'Month number 1-12 to filter festivals happening in that month. Optional.',
        },
        category: {
          type: 'string',
          description:
            'Filter by category. One of: religious, cultural, fair, tribal, literary, harvest, music, food. Optional.',
        },
        location_slug: {
          type: 'string',
          description: 'Filter by destination slug (e.g. "shantiniketan" for festivals there). Optional.',
        },
        limit: {
          type: 'number',
          description: 'Max festivals to return (default 5, max 10).',
        },
      },
    },
  },
  {
    name: 'list_food',
    description:
      'Get Bengali food items — by category or name. Returns dish name, Bengali name, description, and image. Use for "what to eat in Bengal", "sweets", "rice dishes", etc.',
    parameters: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description:
            'Optional filter by category — e.g. "sweet", "street_food", "main_course", "snack", "drink".',
        },
        query: {
          type: 'string',
          description: 'Free-text query to match dish name or description (e.g. "fish", "mango"). Optional.',
        },
        limit: {
          type: 'number',
          description: 'Max results (default 5, max 10).',
        },
      },
    },
  },
  {
    name: 'suggest_itinerary',
    description:
      'Generate an itinerary suggestion based on number of days, interests, and region. Returns 3-7 destination slugs ordered as a route. Use this for "plan a 3-day trip", "what should I do in 5 days", etc.',
    parameters: {
      type: 'object',
      properties: {
        days: { type: 'number', description: 'Trip length in days (1-10). Required.' },
        interests: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of interests (e.g. ["hills", "tea", "buddhist"]). Optional.',
        },
        region: { type: 'string', description: 'Preferred region. Optional.' },
      },
      required: ['days'],
    },
  },
  {
    name: 'semantic_search',
    description:
      'Semantic search across all 232 destinations, 100 festivals, and 17 foods using vector similarity. Use this for OPEN-ENDED or CONCEPTUAL queries that do not fit other tools — e.g. "places where Tagore wrote poetry", "Buddhist meditation spots", "traditional handloom weaving centers", "spots for solo female travellers", "instagrammable sunset views", "places connected to Bengali literature". Do NOT use for direct lookups (use search_destinations / list_festivals / list_food for those) — semantic_search is for fuzzy thematic matches that span multiple data types.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'The user\'s conceptual query. Required.' },
        limit: { type: 'number', description: 'Max results (default 5, max 10).' },
        types: {
          type: 'array',
          items: { type: 'string' },
          description: 'Optional filter for content types: any subset of ["destination","festival","food"]. Omit for all types.',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_weather',
    description:
      'Get the CURRENT live weather (temperature, wind, conditions) for a destination by slug, plus its best time to visit. Use whenever the user asks about weather, "is it a good time to go", what to pack, or current conditions at a place.',
    parameters: {
      type: 'object',
      properties: {
        slug: { type: 'string', description: 'Destination slug, e.g. "darjeeling". Required.' },
      },
      required: ['slug'],
    },
  },
  {
    name: 'get_transport',
    description:
      'How to REACH a destination — trains, flights, shared jeeps, buses, with durations, costs and tips, plus best/avoid seasons. Use for "how do I get to X", "how to reach X from Kolkata", travel options/routes.',
    parameters: {
      type: 'object',
      properties: {
        slug: { type: 'string', description: 'Destination slug to get to, e.g. "darjeeling". Required.' },
      },
      required: ['slug'],
    },
  },
  {
    name: 'find_stays',
    description:
      'Find places to stay (hotels, homestays, resorts) at a destination, with price range, type, rating and highlights. Use for "where to stay in X", "hotels in X", accommodation by budget.',
    parameters: {
      type: 'object',
      properties: {
        slug: { type: 'string', description: 'Destination slug, e.g. "darjeeling". Required.' },
        price_category: { type: 'string', description: 'Optional filter: "budget", "mid", or "premium".' },
      },
      required: ['slug'],
    },
  },
  {
    name: 'estimate_budget',
    description:
      'Estimate a trip budget in INR given days, travel style and party size (optionally for a specific destination). Returns a total and a stay/food/transport/activities breakdown. Use for "how much will X cost", "budget for N days", cost planning.',
    parameters: {
      type: 'object',
      properties: {
        days: { type: 'number', description: 'Trip length in days (1-30). Required.' },
        style: { type: 'string', description: '"budget", "moderate", or "luxury". Default moderate.' },
        party_size: { type: 'number', description: 'Number of travellers. Default 2.' },
        slug: { type: 'string', description: 'Optional destination slug for context.' },
      },
      required: ['days'],
    },
  },
  {
    name: 'whats_on',
    description:
      'What festivals/events are happening — optionally near a destination and/or in a given month. Use for "anything happening in X", "festivals near X", "events in December".',
    parameters: {
      type: 'object',
      properties: {
        location_slug: { type: 'string', description: 'Optional destination slug to find festivals near.' },
        month: { type: 'number', description: 'Optional month number 1-12. Defaults to the current month if omitted.' },
        limit: { type: 'number', description: 'Max results (default 5, max 10).' },
      },
    },
  },
  {
    name: 'get_my_wishlist',
    description:
      "Get the SIGNED-IN user's saved/wishlisted destinations. Use when the user refers to 'my wishlist', 'places I saved', 'my favourites'. Only works when the user is logged in.",
    parameters: { type: 'object', properties: {} },
  },
  {
    name: 'get_my_trip_plans',
    description:
      "Get the SIGNED-IN user's saved trip plans (name, dates, destinations, status). Use for 'my trips', 'continue my trip', 'what was I planning'. Only works when logged in.",
    parameters: { type: 'object', properties: {} },
  },
  {
    name: 'get_recently_viewed',
    description:
      "Get destinations the SIGNED-IN user recently viewed. Use for 'where was I looking', personalized follow-ups, or to continue the conversation about places they showed interest in. Only works when logged in.",
    parameters: { type: 'object', properties: {} },
  },
];

// ─── Tool executors ─────────────────────────────────────────────────────────────

async function search_destinations({ query, region, category, limit = 5 }) {
  const lim = Math.min(Math.max(parseInt(limit, 10) || 5, 1), 10);
  const clauses = [`status = 'published'`];
  const values = [];
  let i = 1;

  if (query && typeof query === 'string' && query.trim()) {
    const q = `%${query.trim().toLowerCase()}%`;
    clauses.push(`(LOWER(name) LIKE $${i} OR LOWER(region) LIKE $${i} OR LOWER(category) LIKE $${i} OR LOWER(COALESCE(short_description,'')) LIKE $${i})`);
    values.push(q);
    i++;
  }
  if (region && typeof region === 'string') {
    clauses.push(`LOWER(region) LIKE $${i}`);
    values.push(`%${region.toLowerCase()}%`);
    i++;
  }
  if (category && typeof category === 'string') {
    // Categories in DB are CamelCase ("HillStation", "TeaTrails"). Match by:
    //   - lowercase exact (e.g. "hillstation")
    //   - lowercase substring (e.g. "hill" matches "HillStation")
    clauses.push(`(LOWER(category) = $${i} OR LOWER(category) LIKE $${i + 1})`);
    const norm = category.toLowerCase().replace(/[-_\s]+/g, '');
    values.push(norm);
    values.push(`%${category.toLowerCase().replace(/[-_\s]+/g, '')}%`);
    i += 2;
  }

  values.push(lim);
  const sql = `
    SELECT id, name, slug, category, region, image_url, short_description, rating, price_from
    FROM destinations
    WHERE ${clauses.join(' AND ')}
    ORDER BY rating DESC NULLS LAST, view_count DESC NULLS LAST
    LIMIT $${i}
  `;
  const { rows } = await pool.query(sql, values);

  return {
    results: rows.map((r) => ({
      name: r.name,
      slug: r.slug,
      region: r.region,
      category: r.category,
      image: r.image_url,
      description: r.short_description,
      rating: r.rating ? Number(r.rating) : null,
      price_from: r.price_from,
    })),
    count: rows.length,
  };
}

async function get_destination_details({ slug }) {
  if (!slug || typeof slug !== 'string') {
    return { error: 'slug is required' };
  }
  const { rows } = await pool.query(
    `SELECT name, slug, category, region, description, short_description, image_url,
            highlights, activities, best_time_to_visit, duration, price_range, price_from,
            rating, review_count
     FROM destinations
     WHERE slug = $1 AND status = 'published'
     LIMIT 1`,
    [slug.toLowerCase()]
  );
  if (!rows[0]) {
    return { error: `No destination found with slug "${slug}"` };
  }
  const d = rows[0];
  return {
    name: d.name,
    slug: d.slug,
    region: d.region,
    category: d.category,
    description: d.description || d.short_description,
    image: d.image_url,
    highlights: d.highlights || [],
    activities: d.activities || [],
    best_time_to_visit: d.best_time_to_visit,
    duration: d.duration,
    price_range: d.price_range,
    price_from: d.price_from,
    rating: d.rating ? Number(d.rating) : null,
    review_count: d.review_count,
  };
}

async function list_festivals({ month, category, location_slug, limit = 5 }) {
  const lim = Math.min(Math.max(parseInt(limit, 10) || 5, 1), 10);
  let festivals;
  try {
    festivals = require('../data/festivals');
  } catch {
    return { results: [], count: 0, error: 'festival data unavailable' };
  }

  let filtered = festivals;
  if (month) {
    const m = parseInt(month, 10);
    if (m >= 1 && m <= 12) {
      filtered = filtered.filter((f) => (f.months || []).includes(m));
    }
  }
  if (category && typeof category === 'string') {
    const c = category.toLowerCase();
    filtered = filtered.filter((f) => (f.category || '').toLowerCase() === c);
  }
  if (location_slug && typeof location_slug === 'string') {
    const slug = location_slug.toLowerCase();
    filtered = filtered.filter((f) => (f.locations || []).includes(slug));
  }

  return {
    results: filtered.slice(0, lim).map((f) => ({
      name: f.name,
      bengali_name: f.bengaliName,
      typical_dates: f.typicalDates,
      duration: f.duration,
      category: f.category,
      vibe: f.vibe,
      description: f.description,
      locations: f.locations || [],
      must_try: f.mustTry || [],
      image: f.image,
    })),
    count: filtered.length,
  };
}

async function list_food({ category, query, limit = 5 }) {
  const lim = Math.min(Math.max(parseInt(limit, 10) || 5, 1), 10);
  let foods;
  try {
    const mod = require('../data/bengaliFood');
    foods = mod.foods || mod || [];
  } catch {
    return { results: [], count: 0, error: 'food data unavailable' };
  }

  let filtered = foods;
  if (category && typeof category === 'string') {
    const c = category.toLowerCase();
    filtered = filtered.filter((f) => (f.category || '').toLowerCase().includes(c));
  }
  if (query && typeof query === 'string') {
    const q = query.toLowerCase();
    filtered = filtered.filter((f) =>
      `${f.name || ''} ${f.bengaliName || ''} ${f.description || ''}`.toLowerCase().includes(q)
    );
  }

  return {
    results: filtered.slice(0, lim).map((f) => ({
      name: f.name,
      bengali_name: f.bengaliName,
      category: f.category,
      description: f.description,
      image: f.image,
    })),
    count: filtered.length,
  };
}

async function suggest_itinerary({ days, interests = [], region }) {
  const d = Math.min(Math.max(parseInt(days, 10) || 3, 1), 10);

  // Map interests to category filters
  // Categories in DB are CamelCase ("HillStation", "TeaTrails") — store lowercase
  // versions because we compare with LOWER(category)
  const interestMap = {
    hills: ['hillstation', 'teatrails', 'viewpoint'],
    tea: ['teatrails', 'teaplantation'],
    beach: ['beach', 'beaches'],
    wildlife: ['wildlife', 'nationalpark'],
    heritage: ['heritage', 'fort', 'palace', 'terracotta', 'unesco'],
    religious: ['temple', 'mosque', 'church', 'pilgrimage', 'monastery'],
    food: ['restaurant', 'cafe', 'food', 'market'],
    tribal: ['tribal', 'village'],
    buddhist: ['monastery', 'temple'],
    art: ['museum', 'culture', 'gallery'],
    nature: ['lake', 'riverfront', 'park', 'viewpoint', 'forest'],
    shopping: ['shopping', 'market', 'mall'],
  };
  const categoryFilters = new Set();
  for (const i of interests || []) {
    const mapped = interestMap[String(i).toLowerCase()];
    if (mapped) mapped.forEach((c) => categoryFilters.add(c));
  }

  // Pull candidates
  const clauses = [`status = 'published'`];
  const values = [];
  let i = 1;
  if (region && typeof region === 'string') {
    clauses.push(`LOWER(region) LIKE $${i}`);
    values.push(`%${region.toLowerCase()}%`);
    i++;
  }
  if (categoryFilters.size > 0) {
    const placeholders = [...categoryFilters].map(() => `$${i++}`).join(',');
    clauses.push(`LOWER(category) IN (${placeholders})`);
    values.push(...categoryFilters);
  }
  const limit = Math.min(d * 3, 15);
  values.push(limit);

  const { rows } = await pool.query(
    `SELECT name, slug, region, category, image_url, short_description, rating
     FROM destinations WHERE ${clauses.join(' AND ')}
     ORDER BY rating DESC NULLS LAST, view_count DESC NULLS LAST
     LIMIT $${i}`,
    values
  );

  // Pick (d) destinations — try to spread across categories
  const seen = new Set();
  const picks = [];
  for (const r of rows) {
    if (picks.length >= d) break;
    const key = r.category;
    if (!seen.has(key) || picks.length < d - 1) {
      picks.push(r);
      seen.add(key);
    }
  }
  // Fallback: top-rated if too few picked
  if (picks.length < d) {
    for (const r of rows) {
      if (picks.length >= d) break;
      if (!picks.find((p) => p.slug === r.slug)) picks.push(r);
    }
  }

  return {
    days: d,
    plan: picks.map((p, idx) => ({
      day: idx + 1,
      name: p.name,
      slug: p.slug,
      region: p.region,
      category: p.category,
      image: p.image_url,
      description: p.short_description,
    })),
  };
}

// ─── semantic_search ─────────────────────────────────────────────────────────

async function semantic_search({ query, limit = 5, types }) {
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return { error: 'query is required' };
  }
  const lim = Math.min(Math.max(parseInt(limit, 10) || 5, 1), 10);

  const rows = await semanticRetrieve(query, {
    limit: lim,
    minSimilarity: 0.45,
    contentTypes: Array.isArray(types) && types.length > 0 ? types : undefined,
  });

  if (rows.length === 0) {
    return {
      results: [],
      count: 0,
      note: 'Semantic search returned no results — either embeddings have not been generated yet, or no content matched the query. Try one of the structured search tools instead (search_destinations, list_festivals, list_food).',
    };
  }

  return {
    results: rows.map((r) => ({
      type: r.content_type,
      id: r.content_id,
      similarity: r.similarity.toFixed(3),
      summary: r.chunk_text.slice(0, 250),
      name: r.metadata?.name,
      image: r.metadata?.image,
      region: r.metadata?.region,
      category: r.metadata?.category,
    })),
    count: rows.length,
  };
}

// ─── get_weather (live, via Open-Meteo + destination coords) ────────────────────

async function get_weather({ slug }) {
  if (!slug || typeof slug !== 'string') return { error: 'slug is required' };
  const { rows } = await pool.query(
    `SELECT name, latitude, longitude, best_time_to_visit
     FROM destinations WHERE slug = $1 AND status = 'published' LIMIT 1`,
    [slug.toLowerCase()]
  );
  if (!rows[0]) return { error: `No destination found with slug "${slug}"` };
  const d = rows[0];
  if (d.latitude == null || d.longitude == null) {
    return { name: d.name, best_time_to_visit: d.best_time_to_visit, note: 'No coordinates on file for live weather.' };
  }
  try {
    const r = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${d.latitude}&longitude=${d.longitude}` +
      `&current_weather=true&hourly=relativehumidity_2m&timezone=auto`
    );
    const j = await r.json();
    const cw = j.current_weather;
    const codeLabels = { 0: 'Clear', 1: 'Mostly clear', 2: 'Partly cloudy', 3: 'Overcast', 45: 'Foggy', 48: 'Foggy', 51: 'Light drizzle', 61: 'Rain', 63: 'Rain', 65: 'Heavy rain', 80: 'Rain showers', 95: 'Thunderstorm' };
    return {
      name: d.name,
      temperature_c: cw ? Math.round(cw.temperature) : null,
      windspeed_kmh: cw ? Math.round(cw.windspeed) : null,
      condition: cw ? (codeLabels[cw.weathercode] || 'Cloudy') : null,
      best_time_to_visit: d.best_time_to_visit,
    };
  } catch {
    return { name: d.name, best_time_to_visit: d.best_time_to_visit, note: 'Live weather is temporarily unavailable.' };
  }
}

// ─── get_transport (how to reach a place) ────────────────────────────────────

async function get_transport({ slug }) {
  if (!slug || typeof slug !== 'string') return { error: 'slug is required' };
  let guides;
  try { guides = require('../data/transport').transportGuides || []; }
  catch { return { error: 'transport data unavailable' }; }
  const matches = guides.filter((g) => g.destinationSlug === slug.toLowerCase());
  if (matches.length === 0) return { results: [], note: `No transport guide on file for "${slug}" yet.` };
  return {
    results: matches.map((g) => ({
      destination_slug: g.destinationSlug,
      from: g.fromCity,
      distance: g.distance,
      best_season: g.bestSeason,
      avoid_season: g.avoidSeason,
      options: (g.options || []).map((o) => ({ mode: o.mode, title: o.title, duration: o.duration, cost: o.cost, details: o.details, tip: o.tip })),
    })),
  };
}

// ─── find_stays (where to stay) ───────────────────────────────────────────────

async function find_stays({ slug, price_category }) {
  if (!slug || typeof slug !== 'string') return { error: 'slug is required' };
  let hotels;
  try { hotels = require('../data/hotels').hotels || []; }
  catch { return { error: 'accommodation data unavailable' }; }
  let matches = hotels.filter((h) => h.destinationSlug === slug.toLowerCase());
  if (price_category && typeof price_category === 'string') {
    const pc = price_category.toLowerCase();
    matches = matches.filter((h) => (h.priceCategory || '').toLowerCase() === pc);
  }
  if (matches.length === 0) return { results: [], note: `No stays on file for "${slug}"${price_category ? ` in the ${price_category} range` : ''} yet.` };
  return {
    results: matches.slice(0, 8).map((h) => ({
      name: h.name, type: h.type, price_range: h.priceRange, price_category: h.priceCategory,
      rating: h.rating, address: h.address, highlights: h.highlights || [], image: h.image,
    })),
  };
}

// ─── estimate_budget ──────────────────────────────────────────────────────────

async function estimate_budget({ days = 3, style = 'moderate', party_size = 2, slug }) {
  const d = Math.min(Math.max(parseInt(days, 10) || 3, 1), 30);
  const p = Math.min(Math.max(parseInt(party_size, 10) || 2, 1), 20);
  const perDay = { budget: 1500, moderate: 4000, luxury: 9000 }[String(style).toLowerCase()] || 4000;
  let destination = null;
  if (slug && typeof slug === 'string') {
    const { rows } = await pool.query(`SELECT name FROM destinations WHERE slug = $1 LIMIT 1`, [slug.toLowerCase()]).catch(() => ({ rows: [] }));
    if (rows[0]) destination = rows[0].name;
  }
  const total = perDay * d * p;
  return {
    destination, days: d, party_size: p, style: String(style).toLowerCase(),
    per_person_per_day_inr: perDay,
    estimated_total_inr: total,
    breakdown_inr: {
      stay: Math.round(total * 0.40),
      food: Math.round(total * 0.25),
      transport: Math.round(total * 0.20),
      activities: Math.round(total * 0.15),
    },
    note: 'Rough estimate — actual costs vary with season, bookings and choices.',
  };
}

// ─── whats_on (festivals near a place / in a month) ──────────────────────────

async function whats_on({ location_slug, month, limit = 5 }) {
  const lim = Math.min(Math.max(parseInt(limit, 10) || 5, 1), 10);
  let festivals;
  try { festivals = require('../data/festivals'); }
  catch { return { results: [], count: 0, error: 'festival data unavailable' }; }
  const m = month ? parseInt(month, 10) : (new Date().getMonth() + 1);
  let filtered = festivals;
  if (m >= 1 && m <= 12) filtered = filtered.filter((f) => (f.months || []).includes(m));
  if (location_slug && typeof location_slug === 'string') {
    const slug = location_slug.toLowerCase();
    const near = filtered.filter((f) => (f.locations || []).includes(slug));
    if (near.length > 0) filtered = near; // prefer local; else fall back to month-wide
  }
  return {
    month: m,
    results: filtered.slice(0, lim).map((f) => ({
      name: f.name, bengali_name: f.bengaliName, typical_dates: f.typicalDates,
      category: f.category, vibe: f.vibe, locations: f.locations || [],
    })),
    count: filtered.length,
  };
}

// ─── Personalization (auth-gated — need the signed-in user's id via ctx) ────────

async function get_my_wishlist(_args, ctx) {
  if (!ctx || !ctx.userId) return { error: 'not_signed_in', note: 'Ask the user to sign in to access their wishlist.' };
  const { rows } = await pool.query(
    `SELECT w.destination_slug, d.name, d.region, d.image_url
       FROM wishlists w
       LEFT JOIN destinations d ON d.slug = w.destination_slug
      WHERE w.user_id = $1
      ORDER BY w.added_at DESC LIMIT 20`,
    [ctx.userId]
  ).catch(() => ({ rows: [] }));
  return {
    count: rows.length,
    results: rows.map((r) => ({ name: r.name || r.destination_slug, slug: r.destination_slug, region: r.region, image: r.image_url })),
  };
}

async function get_my_trip_plans(_args, ctx) {
  if (!ctx || !ctx.userId) return { error: 'not_signed_in', note: 'Ask the user to sign in to access their trip plans.' };
  const { rows } = await pool.query(
    `SELECT name, description, start_date, end_date, destinations, status
       FROM trip_plans WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 10`,
    [ctx.userId]
  ).catch(() => ({ rows: [] }));
  return {
    count: rows.length,
    results: rows.map((r) => ({
      name: r.name, description: r.description, start_date: r.start_date, end_date: r.end_date,
      status: r.status, destinations: r.destinations,
    })),
  };
}

async function get_recently_viewed(_args, ctx) {
  if (!ctx || !ctx.userId) return { error: 'not_signed_in', note: 'Ask the user to sign in for personalized history.' };
  const { rows } = await pool.query(
    `SELECT rv.destination_slug, d.name, d.region, d.image_url
       FROM recently_viewed rv
       LEFT JOIN destinations d ON d.slug = rv.destination_slug
      WHERE rv.user_id = $1
      ORDER BY rv.viewed_at DESC LIMIT 12`,
    [ctx.userId]
  ).catch(() => ({ rows: [] }));
  return {
    count: rows.length,
    results: rows.map((r) => ({ name: r.name || r.destination_slug, slug: r.destination_slug, region: r.region, image: r.image_url })),
  };
}

// ─── Dispatcher ────────────────────────────────────────────────────────────────

const executors = {
  search_destinations,
  get_destination_details,
  list_festivals,
  list_food,
  suggest_itinerary,
  semantic_search,
  get_weather,
  get_transport,
  find_stays,
  estimate_budget,
  whats_on,
  get_my_wishlist,
  get_my_trip_plans,
  get_recently_viewed,
};

/**
 * Execute a tool call by name. `ctx` carries request-scoped data such as the
 * signed-in user's id (used by the personalization tools). Returns { result } or { error }.
 */
async function executeTool(name, args, ctx = {}) {
  const fn = executors[name];
  if (!fn) return { error: `Unknown tool: ${name}` };
  try {
    const result = await fn(args || {}, ctx);
    return { result };
  } catch (err) {
    console.error(`Tool ${name} execution error:`, err);
    return { error: err.message || 'Tool execution failed' };
  }
}

module.exports = {
  toolDeclarations,
  executeTool,
};
