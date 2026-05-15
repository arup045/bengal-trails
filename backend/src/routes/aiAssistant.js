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
const { optionalAuth } = require('../middleware/auth');
const { toolDeclarations, executeTool } = require('../services/aiTools');

const MAX_TOOL_HOPS = 3;       // Max chained function calls before forcing a text response
const GEMINI_MODEL  = 'gemini-1.5-flash';

// ─── Gemini with function-calling support ──────────────────────────────────────

async function callGeminiWithTools(message, conversationHistory, language) {
  if (!process.env.GEMINI_API_KEY) return null;

  const systemPrompt = buildSystemPrompt(language);

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
      const { result, error } = await executeTool(name, args);
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
  }
}

// ─── Groq fallback (no function calling — text only) ───────────────────────────

async function callGroq(message, conversationHistory, language) {
  if (!process.env.GROQ_API_KEY) return null;
  try {
    const systemPrompt = buildSystemPrompt(language);
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

function buildSystemPrompt(language) {
  const langInstruction = {
    en: 'Respond in English.',
    bn: 'Respond in Bengali (বাংলা).',
    hi: 'Respond in Hindi (हिंदी).',
  }[language] || 'Respond in English.';

  return `You are Bengal Trails, an expert AI travel assistant for West Bengal, India.

You have access to a live database via TOOLS. Always use the tools to ground your answers in real data — never invent destinations, festivals, or food items.

Available tools:
- search_destinations: Find destinations by region/category/query (structured filter)
- get_destination_details: Get full info for one place by slug
- list_festivals: Find festivals by month/category/location (structured filter)
- list_food: Get Bengali food items (structured filter)
- suggest_itinerary: Plan a multi-day trip
- semantic_search: Search by MEANING across all 232 destinations + 100 festivals + 17 foods.
  Use for conceptual/thematic queries that structured filters can't express well —
  "Buddhist meditation places", "literary sites", "spots for solo female travellers",
  "places connected to Tagore", "Instagram-worthy sunsets", etc.

Tool usage guidelines:
- For "places in X" or "X destinations" → call search_destinations
- For "tell me about [place]" → call get_destination_details
- For "festivals in [month]" or "festivals at [place]" → call list_festivals
- For "what to eat" or "Bengali food" → call list_food
- For "plan a N-day trip" → call suggest_itinerary
- For conceptual/thematic searches → call semantic_search
- Combine multiple tools when needed (e.g. semantic_search + get_destination_details for deeper info)

About West Bengal:
- 232 destinations across North Bengal (hills, tea gardens), Central Bengal (Kolkata, heritage), and South Bengal (beaches, Sundarbans)
- 100 festivals across all 12 months
- 17 signature Bengali dishes
- Best time: October–March (cool, dry); avoid May–June (very hot)
- Languages: Bengali, English, Hindi

${langInstruction}
Keep responses friendly, concise (2-4 sentences), and authentic. End with a practical follow-up suggestion when natural.`;
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

router.post('/chat', optionalAuth, async (req, res) => {
  try {
    const { message, language = 'en', conversationHistory = [] } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'message is required' });
    }

    let aiResult = null;
    let provider = 'fallback';

    // Try Gemini with function calling (preferred — gives grounded answers)
    aiResult = await callGeminiWithTools(message, conversationHistory, language);
    if (aiResult?.text) provider = 'gemini';

    // Fall back to Groq if Gemini fails entirely
    if (!aiResult?.text) {
      const groqText = await callGroq(message, conversationHistory, language);
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

module.exports = router;
