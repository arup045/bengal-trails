// backend/src/routes/aiAssistant.js
//
// AI Travel Assistant with Gemini Function Calling.
//
// Strategy:
//   1. Send user message to Gemini with our tool declarations
//   2. If Gemini wants to call a tool (functionCall in response), execute it
//      against our real database via aiTools.executeTool()
//   3. Send the tool result back to Gemini, get the final text response
//   4. Loop up to 3 times if Gemini chains multiple tool calls
//   5. If Gemini fails entirely → fall back to Groq → fall back to keyword matching
//
// This gives Gemini access to live data from 232 destinations, 100 festivals,
// and 17 Bengali foods — eliminating hallucinations and ensuring all
// destination slugs the AI mentions actually exist.

const router = require('express').Router();
const pool = require('../db/pool');
const { optionalAuth } = require('../middleware/auth');
const { toolDeclarations, executeTool } = require('../services/aiTools');

const MAX_TOOL_HOPS = 4;       // Max chained function calls before forcing a text response
const GEMINI_MODEL  = 'gemini-2.0-flash';  // faster + better tool use than 1.5-flash

// ─── Gemini with function-calling support ──────────────────────────────────────

async function callGeminiWithTools(message, conversationHistory, language, context = {}, ctx = {}) {
  if (!process.env.GEMINI_API_KEY) return null;

  const systemPrompt = buildSystemPrompt(language, context);

  // Build initial contents array
  const contents = [
    { role: 'user',  parts: [{ text: systemPrompt }] },
    { role: 'model', parts: [{ text: "Understood. I'm Bengal Trails, ready to help travellers explore West Bengal using live data from your database." }] },
    ...conversationHistory.slice(-4).map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    })),
    { role: 'user', parts: [{ text: message }] },
  ];

  // Track destinations the AI surfaces via tool results (for the response payload)
  const surfacedDestinations = [];

  // Agentic loop: call Gemini, execute tools, repeat until Gemini gives plain text
  for (let hop = 0; hop < MAX_TOOL_HOPS; hop++) {
    const reqBody = {
      contents,
      tools: [{ functionDeclarations: toolDeclarations }],
      // On the last hop, force a text response so we don't loop forever
      toolConfig: hop === MAX_TOOL_HOPS - 1
        ? { functionCallingConfig: { mode: 'NONE' } }
        : { functionCallingConfig: { mode: 'AUTO' } },
      generationConfig: { temperature: 0.6, maxOutputTokens: 800 },
    };

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqBody),
      }
    );

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.error(`Gemini ${res.status}: ${errText.slice(0, 300)}`);
      return null;
    }

    const data = await res.json();
    const candidate = data?.candidates?.[0];
    if (!candidate) return null;
    const parts = candidate.content?.parts || [];

    // Look for function calls in this response
    const functionCalls = parts.filter((p) => p.functionCall);
    const textParts = parts.filter((p) => p.text).map((p) => p.text);

    if (functionCalls.length === 0) {
      // No more tool calls — Gemini has formulated a text response
      const text = textParts.join('\n').trim();
      return { text, destinations: surfacedDestinations };
    }

    // Append Gemini's tool call as a 'model' turn (required for the conversation context)
    contents.push({ role: 'model', parts });

    // Execute each function call and collect responses
    const functionResponses = [];
    for (const fc of functionCalls) {
      const { name, args } = fc.functionCall;
      const { result, error } = await executeTool(name, args, ctx);
      // If the tool returned destination-like data, harvest it for the API payload
      if (result) {
        harvestDestinations(name, result, surfacedDestinations);
      }
      functionResponses.push({
        functionResponse: {
          name,
          response: error ? { error } : { content: result },
        },
      });
    }

    // Append the function responses as a 'function' role turn
    contents.push({ role: 'function', parts: functionResponses });
    // Loop continues — Gemini will see the tool results and decide what to do next
  }

  // Should not reach here, but safe fallback
  return { text: "Let me think — could you ask that another way?", destinations: surfacedDestinations };
}

// ─── Streaming variant (Server-Sent Events) ────────────────────────────────────
// Same agentic tool loop as callGeminiWithTools, but the model's text is produced
// with :streamGenerateContent and forwarded token-by-token via the onToken
// callback so the UI can render it ChatGPT-style as it arrives. Tool-calling hops
// emit functionCalls (no user text) and are handled internally. Returns the same
// { text, destinations } shape. Returns null on any failure so the caller can
// fall back to the non-streaming path.
async function streamGeminiWithTools(message, conversationHistory, language, context = {}, ctx = {}, onToken) {
  if (!process.env.GEMINI_API_KEY) return null;

  const systemPrompt = buildSystemPrompt(language, context);
  const contents = [
    { role: 'user',  parts: [{ text: systemPrompt }] },
    { role: 'model', parts: [{ text: "Understood. I'm Bengal Trails, ready to help travellers explore West Bengal using live data from your database." }] },
    ...conversationHistory.slice(-4).map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    })),
    { role: 'user', parts: [{ text: message }] },
  ];

  const surfacedDestinations = [];

  for (let hop = 0; hop < MAX_TOOL_HOPS; hop++) {
    const reqBody = {
      contents,
      tools: [{ functionDeclarations: toolDeclarations }],
      toolConfig: hop === MAX_TOOL_HOPS - 1
        ? { functionCallingConfig: { mode: 'NONE' } }
        : { functionCallingConfig: { mode: 'AUTO' } },
      generationConfig: { temperature: 0.6, maxOutputTokens: 800 },
    };

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse&key=${process.env.GEMINI_API_KEY}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(reqBody) }
    );
    if (!res.ok || !res.body) {
      const errText = await res.text?.().catch(() => '') || '';
      console.error(`Gemini stream ${res.status}: ${String(errText).slice(0, 200)}`);
      return null;
    }

    // Parse the SSE stream: each `data: {json}` line is a partial GenerateContentResponse.
    const collectedParts = [];
    let hopText = '';
    let buffer = '';
    const decoder = new TextDecoder();
    for await (const chunk of res.body) {
      buffer += decoder.decode(chunk, { stream: true });
      let nl;
      while ((nl = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, nl).trim();
        buffer = buffer.slice(nl + 1);
        if (!line.startsWith('data:')) continue;
        const jsonStr = line.slice(5).trim();
        if (!jsonStr || jsonStr === '[DONE]') continue;
        let data; try { data = JSON.parse(jsonStr); } catch { continue; }
        const parts = data?.candidates?.[0]?.content?.parts || [];
        for (const p of parts) {
          if (p.text) { hopText += p.text; try { onToken && onToken(p.text); } catch { /* client gone */ } }
          if (p.functionCall) collectedParts.push(p);
        }
      }
    }

    if (collectedParts.length === 0) {
      // No tool calls — this hop's text is the final answer (already streamed).
      return { text: hopText.trim(), destinations: surfacedDestinations };
    }

    // Tool-calling hop: replay model turn, execute tools, append results, loop.
    contents.push({ role: 'model', parts: collectedParts });
    const functionResponses = [];
    for (const fc of collectedParts) {
      const { name, args } = fc.functionCall;
      const { result, error } = await executeTool(name, args, ctx);
      if (result) harvestDestinations(name, result, surfacedDestinations);
      functionResponses.push({ functionResponse: { name, response: error ? { error } : { content: result } } });
    }
    contents.push({ role: 'function', parts: functionResponses });
  }

  return { text: '', destinations: surfacedDestinations };
}

/**
 * Extract destinations from tool results into the frontend-facing payload.
 * Frontend expects `[{name, slug, image?, price?}]`.
 */
function harvestDestinations(toolName, result, out) {
  if (toolName === 'search_destinations' && Array.isArray(result.results)) {
    for (const r of result.results.slice(0, 5)) {
      if (out.find((x) => x.slug === r.slug)) continue;
      out.push({ name: r.name, slug: r.slug, image: r.image, price: r.price_from });
    }
  } else if (toolName === 'get_destination_details' && result.slug) {
    if (!out.find((x) => x.slug === result.slug)) {
      out.push({ name: result.name, slug: result.slug, image: result.image, price: result.price_from });
    }
  } else if (toolName === 'suggest_itinerary' && Array.isArray(result.plan)) {
    for (const r of result.plan) {
      if (out.find((x) => x.slug === r.slug)) continue;
      out.push({ name: r.name, slug: r.slug, image: r.image });
    }
  } else if (toolName === 'semantic_search' && Array.isArray(result.results)) {
    // Only harvest 'destination' type results for the destinations payload
    for (const r of result.results) {
      if (r.type !== 'destination' || !r.id) continue;
      if (out.find((x) => x.slug === r.id)) continue;
      out.push({ name: r.name, slug: r.id, image: r.image });
    }
  } else if (
    (toolName === 'get_my_wishlist' || toolName === 'get_recently_viewed') &&
    Array.isArray(result.results)
  ) {
    // Surface the user's own places as clickable chips too.
    for (const r of result.results.slice(0, 6)) {
      if (!r.slug || out.find((x) => x.slug === r.slug)) continue;
      out.push({ name: r.name, slug: r.slug, image: r.image });
    }
  }
}

// ─── Groq fallback (no function calling — text only) ───────────────────────────

async function callGroq(message, conversationHistory, language, context = {}) {
  if (!process.env.GROQ_API_KEY) return null;
  try {
    const systemPrompt = buildSystemPrompt(language, context);
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory.slice(-4).map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content })),
          { role: 'user', content: message },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;
    return text || null;
  } catch (err) {
    console.error('Groq error:', err.message);
    return null;
  }
}

// ─── System prompt ─────────────────────────────────────────────────────────────

function buildSystemPrompt(language, context = {}) {
  const langInstruction = {
    en: 'Respond in English.',
    bn: 'Respond in Bengali (বাংলা).',
    hi: 'Respond in Hindi (हिंदी).',
  }[language] || 'Respond in English.';

  // ── Live context block — makes answers situational ──────────────────────────
  const now = new Date();
  const monthName = now.toLocaleString('en-US', { month: 'long' });
  const m = now.getMonth() + 1;
  const season =
    (m >= 3 && m <= 6)  ? 'Summer (hot; head to the hills)' :
    (m >= 7 && m <= 9)  ? 'Monsoon (rain; great for Sundarbans & greenery)' :
    (m >= 10 && m <= 11)? 'Autumn (festival season; ideal weather everywhere)' :
                          'Winter (cool & dry; best for most of Bengal)';
  const ctxLines = [
    `Today is ${monthName} ${now.getDate()}, ${now.getFullYear()} — current season: ${season}.`,
    context.userName ? `The user is signed in as "${context.userName}". You may greet them by name and use the personalization tools (get_my_wishlist, get_my_trip_plans, get_recently_viewed).`
                     : `The user is NOT signed in. If they ask about "my wishlist/trips", invite them to sign in first.`,
    context.page ? `They are currently on the "${context.page}" page of the site — tailor suggestions to that when relevant.` : null,
  ].filter(Boolean).join('\n');

  return `You are Bengal Trails, an expert AI travel assistant for West Bengal, India.

You have access to a LIVE database and live services via TOOLS. Always use the tools to ground your answers in real data — never invent destinations, festivals, food, hotels, transport, prices or weather.

CURRENT CONTEXT:
${ctxLines}

Available tools:
- search_destinations — find destinations by region/category/query
- get_destination_details — full info for one place by slug
- list_festivals / whats_on — festivals by month/category/location (whats_on defaults to the current month and can find festivals near a place)
- list_food — Bengali dishes
- suggest_itinerary — order destinations into a multi-day route
- semantic_search — search by MEANING ("Buddhist meditation spots", "places connected to Tagore", "instagrammable sunsets")
- get_weather — CURRENT live weather + best time to visit for a destination
- get_transport — how to REACH a place (trains/flights/jeeps, durations, costs, tips)
- find_stays — hotels/homestays at a place (price range, type, rating)
- estimate_budget — trip cost estimate (days, style, party size) with a breakdown
- get_my_wishlist / get_my_trip_plans / get_recently_viewed — the SIGNED-IN user's own data

Guidelines:
- Combine tools to fully answer (e.g. for "plan my Darjeeling trip": get_destination_details + get_weather + get_transport + find_stays + estimate_budget).
- For "is it a good time to visit X" → call get_weather and compare with its best season.
- For "how do I get to X" → get_transport. For "where to stay" → find_stays. For "how much" → estimate_budget.
- For the user's own saved data → the get_my_* tools (only if signed in).
- HONESTY: if a tool returns no data or an error, say so plainly and offer the closest thing you DO have — never fabricate a substitute. Stay on West-Bengal travel topics.

About West Bengal: hills & tea gardens (North), Kolkata & heritage (Central), beaches & Sundarbans (South). Best overall: October–March. Languages: Bengali, English, Hindi.

${langInstruction}
Keep replies friendly, concise (2–4 sentences unless asked for a full plan), and authentic. End with a practical follow-up suggestion when natural.`;
}

// ─── Keyword fallback (used if both Gemini & Groq fail) ────────────────────────

function keywordFallback(message, language) {
  const m = message.toLowerCase();
  const greetings = {
    en: "Hello! I'm Bengal Trails, your West Bengal travel guide. Ask me about destinations, food, festivals, or anything Bengal-related!",
    bn: 'নমস্কার! আমি গোব্রো, আপনার পশ্চিমবঙ্গ ভ্রমণ গাইড। গন্তব্য, খাবার, উৎসব সম্পর্কে জিজ্ঞাসা করুন!',
    hi: 'नमस्ते! मैं गोब्रो हूं, आपका पश्चिम बंगाल यात्रा गाइड। गंतव्य, भोजन, त्योहारों के बारे में पूछें!',
  };
  if (/^(hi|hello|hey|hola|namaste|namaskar)\b/i.test(message.trim())) {
    return { response: greetings[language] || greetings.en, suggestions: ['Best places in Darjeeling', 'Bengali food specialties', 'Festivals this month'] };
  }
  if (m.match(/\b(hill|hills|mountain|mountains|darjeeling|kalimpong|mirik|sandakphu)\b/)) {
    return {
      response: 'The Bengal hills are magical — Darjeeling for tea gardens and toy trains, Kalimpong for monasteries and orchids, Mirik for the lake, Sandakphu for trekkers. Best visited April-June and September-November.',
      suggestions: ['Darjeeling toy train tickets', 'Kalimpong monasteries', 'Sandakphu trek'],
      destinations: [{ name: 'Darjeeling', slug: 'darjeeling' }, { name: 'Kalimpong', slug: 'kalimpong' }, { name: 'Mirik', slug: 'mirik' }],
    };
  }
  if (m.match(/\b(beach|beaches|sea|digha|mandarmani|bakkhali|tajpur)\b/)) {
    return {
      response: "Bengal's beaches are great getaways — Mandarmani for driveable sand, Digha for families, Bakkhali for untouched coastlines. All 4-7 hours from Kolkata.",
      suggestions: ['Mandarmani resorts', 'Digha packages', 'Bakkhali quiet beaches'],
      destinations: [{ name: 'Mandarmani', slug: 'mandarmani' }, { name: 'Digha', slug: 'digha' }, { name: 'Bakkhali', slug: 'bakkhali-beach' }],
    };
  }
  if (m.match(/\b(food|foods|eat|cuisine|dish|dishes|sweet|sweets|mishti)\b/)) {
    return {
      response: 'Bengali cuisine: kosha mangsho (mutton), shorshe ilish (hilsa), kathi rolls, mishti doi, rasgulla, sandesh. Kolkata is the food capital — Park Street, Bagbazar, Decker\'s Lane.',
      suggestions: ['Best Kolkata restaurants', 'Bengali sweet shops', 'Street food spots'],
    };
  }
  if (m.match(/\b(festival|festivals|puja|durga|poila)\b/)) {
    return {
      response: "Bengal's biggest festival is Durga Puja (Sept-Oct). Poila Boishakh (April 14-15) is Bengali New Year. Poush Mela in Shantiniketan (December) is a folk culture showcase.",
      suggestions: ['Durga Puja 2026', 'Poush Mela', 'Festival calendar'],
    };
  }
  return {
    response: 'I can help you explore West Bengal! Ask me about destinations, Bengali food, festivals, budgets, or specific places.',
    suggestions: ['Hill stations to visit', 'Bengali food guide', 'Festival calendar', 'Plan a 3-day trip'],
  };
}

// ─── Suggestion generator (post-response) ──────────────────────────────────────

function generateSuggestions(message, _aiText) {
  const m = message.toLowerCase();
  if (m.includes('darjeeling')) return ['Best hotels in Darjeeling', 'Tea garden tours', 'Toy train booking'];
  if (m.includes('food'))       return ['Best Bengali sweets', 'Street food in Kolkata', 'Veg restaurants'];
  if (m.includes('festival'))   return ['Durga Puja 2026', 'Poush Mela dates', 'Festival calendar'];
  if (m.includes('budget'))     return ['Cheap stays', 'Affordable food', 'Budget itinerary'];
  return ['Tell me more', 'Show similar places', 'Plan a trip'];
}

// ─── POST /api/ai-assistant/chat ───────────────────────────────────────────────

// SECURITY (P1-26): caps to prevent cost-balloon attacks. Each Gemini call
// is metered; unbounded input from the client lets an attacker rack up our bill.
const MAX_MESSAGE_LEN = 2000;          // single message
const MAX_HISTORY_MSGS = 20;           // most recent messages kept
const MAX_HISTORY_TOTAL_CHARS = 20000; // total chars across kept history

router.post('/chat', optionalAuth, async (req, res) => {
  try {
    const { message, language = 'en', conversationHistory: rawHistory = [], page } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'message is required' });
    }

    // Request-scoped context for situational answers + personalization.
    const context = {
      userName: req.user?.name || null,
      page: typeof page === 'string' ? page.slice(0, 40) : null,
    };
    const ctx = { userId: req.user?.id || null };
    if (message.length > MAX_MESSAGE_LEN) {
      return res.status(400).json({ error: `Message exceeds ${MAX_MESSAGE_LEN} characters` });
    }

    // Normalize + cap history. Take the most recent messages, truncate each
    // to keep total under MAX_HISTORY_TOTAL_CHARS. Anything dropped is OK —
    // the LLM only uses recent context anyway.
    let conversationHistory = [];
    if (Array.isArray(rawHistory)) {
      let total = 0;
      const recent = rawHistory.slice(-MAX_HISTORY_MSGS);
      for (const m of recent) {
        if (!m || typeof m.content !== 'string') continue;
        const c = m.content.slice(0, MAX_MESSAGE_LEN);
        if (total + c.length > MAX_HISTORY_TOTAL_CHARS) break;
        total += c.length;
        conversationHistory.push({ role: m.role === 'user' ? 'user' : 'assistant', content: c });
      }
    }

    let aiResult = null;
    let provider = 'fallback';

    // Try Gemini with function calling (preferred — gives grounded answers)
    aiResult = await callGeminiWithTools(message, conversationHistory, language, context, ctx);
    if (aiResult?.text) provider = 'gemini';

    // Fall back to Groq if Gemini fails entirely
    if (!aiResult?.text) {
      const groqText = await callGroq(message, conversationHistory, language, context);
      if (groqText) {
        aiResult = { text: groqText, destinations: [] };
        provider = 'groq';
      }
    }

    // Last resort: keyword fallback
    if (!aiResult?.text) {
      const fallback = keywordFallback(message, language);
      return res.json({
        response: fallback.response,
        suggestions: fallback.suggestions || [],
        destinations: fallback.destinations || [],
        provider: 'fallback',
      });
    }

    return res.json({
      response: aiResult.text,
      suggestions: generateSuggestions(message, aiResult.text),
      destinations: aiResult.destinations || [],
      provider,
    });
  } catch (err) {
    console.error('AI chat error:', err);
    return res.json({
      response: "I'm having trouble right now, but I can still help! Ask me about Bengal destinations, food, or festivals.",
      suggestions: ['Best places to visit', 'Bengali food', 'Festivals'],
      destinations: [],
      provider: 'error-fallback',
    });
  }
});

// ─── POST /api/ai-assistant/chat/stream  (Server-Sent Events) ──────────────────
// Streams the assistant's reply token-by-token for a live, ChatGPT-style feel.
// Events:  token {t}  → text delta   |   done {suggestions,destinations,provider}
//          error {}   → client should fall back to the non-streaming /chat endpoint
// The non-streaming /chat above is the guaranteed fallback, so any issue here is
// non-fatal to the assistant.
router.post('/chat/stream', optionalAuth, async (req, res) => {
  const { message, language = 'en', conversationHistory: rawHistory = [], page } = req.body || {};
  if (!message || typeof message !== 'string' || message.length > MAX_MESSAGE_LEN) {
    return res.status(400).json({ error: 'invalid message' });
  }

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // disable proxy buffering (nginx/Render)
  if (typeof res.flushHeaders === 'function') res.flushHeaders();
  const send = (event, data) => { try { res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`); } catch { /* closed */ } };

  try {
    const context = { userName: req.user?.name || null, page: typeof page === 'string' ? page.slice(0, 40) : null };
    const ctx = { userId: req.user?.id || null };

    // Normalize + cap history (same rules as /chat)
    let conversationHistory = [];
    if (Array.isArray(rawHistory)) {
      let total = 0;
      for (const m of rawHistory.slice(-MAX_HISTORY_MSGS)) {
        if (!m || typeof m.content !== 'string') continue;
        const c = m.content.slice(0, MAX_MESSAGE_LEN);
        if (total + c.length > MAX_HISTORY_TOTAL_CHARS) break;
        total += c.length;
        conversationHistory.push({ role: m.role === 'user' ? 'user' : 'assistant', content: c });
      }
    }

    const result = await streamGeminiWithTools(
      message, conversationHistory, language, context, ctx,
      (delta) => send('token', { t: delta })
    );

    if (!result || !result.text) { send('error', { reason: 'no_text' }); return res.end(); }

    send('done', {
      suggestions: generateSuggestions(message, result.text),
      destinations: result.destinations || [],
      provider: 'gemini',
      full: result.text,
    });
    res.end();
  } catch (err) {
    console.error('AI stream error:', err.message);
    send('error', { reason: 'exception' });
    res.end();
  }
});

module.exports = router;

// ── POST /ai/itinerary ─────────────────────────────────────────────────────────
// Generates a structured day-by-day itinerary using Gemini + DB destinations.
// Body: { days, budget, style, startCity, interests[] }
router.post('/itinerary', optionalAuth, async (req, res) => {
  try {
    const { days = 5, budget = 'moderate', style = 'mixed', startCity = 'Kolkata', interests = [] } = req.body;
    if (!process.env.GEMINI_API_KEY) return res.status(503).json({ error: 'AI not configured' });

    // Pull real destinations from DB for context
    const { rows: dests } = await pool.query(
      "SELECT name, slug, region, category, description, rating FROM destinations WHERE status='published' ORDER BY rating DESC NULLS LAST LIMIT 60"
    );

    const destList = dests.map(d => `- ${d.name} (${d.region}, ${d.category}, rating: ${d.rating || 'N/A'})`).join('\n');

    const prompt = `You are a West Bengal travel expert. Create a ${days}-day itinerary for a traveller.

Context:
- Starting city: ${startCity}
- Budget: ${budget} (budget=₹1-3k/day, moderate=₹3-7k/day, luxury=₹7k+/day)  
- Travel style: ${style}
- Interests: ${interests.length ? interests.join(', ') : 'general sightseeing'}

Available destinations (use these real places from our database):
${destList}

Respond ONLY with a valid JSON object — no markdown, no code fences. Structure:
{
  "title": "trip title",
  "summary": "2-sentence overview",
  "days": [
    {
      "day": 1,
      "title": "Day title",
      "destinations": [{"name":"...","slug":"...","duration":"2 hours","tip":"insider tip"}],
      "accommodation": "area/type suggestion",
      "estimatedCost": "₹X,XXX",
      "highlights": "1 sentence"
    }
  ],
  "totalEstimatedCost": "₹XX,XXX",
  "bestMonths": ["Oct","Nov","Dec"],
  "packingTips": ["tip1","tip2","tip3"]
}`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048 } }),
      }
    );

    const gData = await geminiRes.json();
    const raw   = gData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let itinerary;
    try { itinerary = JSON.parse(clean); }
    catch { return res.status(500).json({ error: 'AI returned invalid format. Please try again.' }); }

    return res.json({ success: true, itinerary });
  } catch (err) {
    console.error('itinerary error:', err);
    return res.status(500).json({ error: 'Server error generating itinerary' });
  }
});

// ── GET /ai-assistant/district-faq?slug=&name= ──────────────────────────────────
// Returns 4 traveller Q&A for a district. Real AI (Gemini, cached 24h) when
// configured; otherwise an honest fallback that points users to the live Ask-AI
// bar instead of inventing facts.
const _faqCache = new Map(); // slug -> { ts, faqs }
const FAQ_TTL_MS = 24 * 60 * 60 * 1000;

router.get('/district-faq', async (req, res) => {
  const slug = String(req.query.slug || '').toLowerCase().slice(0, 64);
  const name = String(req.query.name || slug).slice(0, 60) || slug;
  if (!slug) return res.status(400).json({ error: 'slug required' });

  const cached = _faqCache.get(slug);
  if (cached && Date.now() - cached.ts < FAQ_TTL_MS) {
    return res.json({ faqs: cached.faqs, poweredByAI: true, cached: true });
  }

  const questions = [
    `What are the must-do activities in ${name}?`,
    `What are good hotel and stay options in ${name}?`,
    `How do travellers reach and get around ${name}?`,
    `What local food should I try in ${name}?`,
  ];

  if (process.env.GEMINI_API_KEY) {
    try {
      const prompt =
        `You are a West Bengal travel expert. For the district "${name}", answer these four traveller ` +
        `questions concisely (2-3 sentences each), accurately, using only real, well-known information. ` +
        `Do not invent specific names you are unsure of. Return ONLY JSON ` +
        `{"faqs":[{"q":"...","a":"..."}]} in this exact question order:\n` +
        questions.map((q, i) => `${i + 1}. ${q}`).join('\n');
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { temperature: 0.5, maxOutputTokens: 800 } }) }
      );
      const data = await r.json();
      const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(clean);
      if (Array.isArray(parsed?.faqs) && parsed.faqs.length) {
        _faqCache.set(slug, { ts: Date.now(), faqs: parsed.faqs });
        return res.json({ faqs: parsed.faqs, poweredByAI: true });
      }
    } catch { /* fall through to honest fallback */ }
  }

  const faqs = questions.map((q) => ({
    q,
    a: `Tap “Ask” in the “Plan ${name} with AI” box above for a live, tailored answer — or browse the sections on this page for places, food, stays and more.`,
  }));
  return res.json({ faqs, poweredByAI: false });
});
