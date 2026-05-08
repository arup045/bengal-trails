const router = require('express').Router();
const { optionalAuth } = require('../middleware/auth');
const { limiters } = require('../middleware/rateLimit');

// ── Multi-provider AI: Tries Gemini → Groq → Fallback ────────────────────────

async function callGemini(message, conversationHistory, language) {
  if (!process.env.GEMINI_API_KEY) return null;
  try {
    const systemPrompt = buildSystemPrompt(language);
    const messages = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: 'I understand. I am ready to help travelers explore West Bengal.' }] },
      ...conversationHistory.slice(-4).map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      })),
      { role: 'user', parts: [{ text: message }] },
    ];

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: messages,
          generationConfig: { temperature: 0.7, maxOutputTokens: 500 },
        }),
      }
    );
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text || null;
  } catch (err) {
    console.error('Gemini error:', err.message);
    return null;
  }
}

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
    return data?.choices?.[0]?.message?.content || null;
  } catch (err) {
    console.error('Groq error:', err.message);
    return null;
  }
}

function buildSystemPrompt(language) {
  const langInstruction = language === 'bn'
    ? 'Respond in Bengali (Bangla).'
    : language === 'hi'
    ? 'Respond in Hindi.'
    : 'Respond in English.';

  return `You are Gobro, a friendly travel expert specializing in West Bengal, India.
You help users discover amazing destinations across West Bengal — from the misty hills of Darjeeling and Kalimpong, to the mangroves of Sundarbans, the cultural heart of Shantiniketan, the colonial charm of Kolkata, and the beaches of Mandarmani and Digha.

Key knowledge areas:
- Destinations: 221+ places including Darjeeling, Sundarbans, Shantiniketan, Kolkata, Bishnupur, Murshidabad, Mandarmani, Digha, Kalimpong, Mirik, Tarapith, Gangasagar, etc.
- Festivals: Durga Puja (Sept-Oct), Poila Boishakh (Apr 14-15), Poush Mela (Dec), Charak Puja, Rath Yatra, Saraswati Puja, Christmas in Park Street
- Food: kosha mangsho, hilsa, kathi rolls, mishti doi, rasgulla, sandesh, jhal muri, puchka, biryani
- Best seasons: Oct-Mar for plains, Apr-Jun for hills, Jul-Sep for monsoon experience
- Languages spoken: Bengali, English, Hindi, Nepali (in hills)

${langInstruction}
Keep responses friendly, concise (2-4 sentences), helpful, and authentic to Bengal culture.
Always end with practical advice or a follow-up suggestion.`;
}

// Smart keyword fallback (used if all AI providers fail)
function keywordFallback(message, language) {
  const m = message.toLowerCase();
  const greetings = {
    en: "Hello! I'm Gobro, your West Bengal travel guide. Ask me about destinations, food, festivals, or anything Bengal-related!",
    bn: 'নমস্কার! আমি গোব্রো, আপনার পশ্চিমবঙ্গ ভ্রমণ গাইড। গন্তব্য, খাবার, উৎসব সম্পর্কে জিজ্ঞাসা করুন!',
    hi: 'नमस्ते! मैं गोब्रो हूं, आपका पश्चिम बंगाल यात्रा गाइड। गंतव्य, भोजन, त्योहारों के बारे में पूछें!',
  };

  if (/^(hi|hello|hey|hola|namaste|namaskar)/i.test(message.trim())) {
    return { response: greetings[language] || greetings.en, suggestions: ['Best places in Darjeeling', 'Bengali food specialties', 'Festivals this month'] };
  }

  // Romantic
  if (m.match(/\b(romantic|honeymoon|couple|getaway)\b/)) {
    return {
      response: 'For a romantic Bengal escape, Darjeeling has misty mountain views and toy train rides perfect for couples. Shantiniketan offers serene cultural mornings, while Mandarmani gives you private beach sunsets. All three are within 6 hours of Kolkata!',
      suggestions: ['Darjeeling honeymoon hotels', 'Shantiniketan couple stays', 'Mandarmani beach resorts'],
      destinations: [{ name: 'Darjeeling', slug: 'darjeeling' }, { name: 'Shantiniketan', slug: 'shantiniketan' }, { name: 'Mandarmani', slug: 'mandarmani' }],
    };
  }

  // Adventure
  if (m.match(/\b(adventure|trekking|hiking|wildlife|safari|tiger)\b/)) {
    return {
      response: 'For adventure in Bengal: Sundarbans gives you Royal Bengal Tiger boat safaris through mangrove forests. Sandakphu offers the highest trek in Bengal with Everest views. Buxa Tiger Reserve and Neora Valley are perfect for wildlife photography.',
      suggestions: ['Sundarbans tiger safari', 'Sandakphu trek details', 'Neora Valley wildlife'],
      destinations: [{ name: 'Sundarbans', slug: 'sundarbans-national-park' }, { name: 'Sandakphu', slug: 'sandakphu' }, { name: 'Neora Valley', slug: 'neora-valley-national-park' }],
    };
  }

  // Food
  if (m.match(/\b(food|eat|cuisine|dish|restaurant|sweet)\b/)) {
    return {
      response: 'Bengali cuisine is legendary! Try kosha mangsho (slow-cooked mutton), shorshe ilish (hilsa in mustard), kathi rolls, mishti doi, rasgulla, and sandesh. Kolkata is the food capital — head to Park Street, Bagbazar, and Decker\'s Lane for authentic flavors.',
      suggestions: ['Best Kolkata restaurants', 'Bengali sweet shops', 'Street food spots'],
    };
  }

  // Festival
  if (m.match(/\b(festival|puja|durga|poila|celebration)\b/)) {
    return {
      response: 'Bengal\'s biggest festival is Durga Puja (Sept-Oct) — the entire state transforms with elaborate pandals and lights. Poila Boishakh (Apr 14-15) is Bengali New Year. Poush Mela in Shantiniketan (Dec) showcases folk culture. Each region has unique celebrations!',
      suggestions: ['Durga Puja 2026 dates', 'Poush Mela in Shantiniketan', 'Christmas in Park Street'],
    };
  }

  // Budget
  if (m.match(/\b(budget|cheap|cost|price|money)\b/)) {
    return {
      response: 'Bengal is very budget-friendly! A typical 3-day trip costs ₹3,000-8,000 per person including hotels (₹800-2,500/night), food (₹300-700/day), and transport. Hill stations like Darjeeling are slightly pricier than the plains.',
      suggestions: ['Budget hotels in Darjeeling', 'Cheap eats in Kolkata', 'Affordable Sundarbans tour'],
    };
  }

  // Hills
  if (m.match(/\b(hill|mountain|darjeeling|kalimpong|mirik|sandakphu)\b/)) {
    return {
      response: 'The Bengal hills are magical — Darjeeling for tea gardens and toy trains, Kalimpong for Buddhist monasteries and orchids, Mirik for the lake, and Sandakphu for trekkers seeking Everest views. Best visited Apr-Jun and Sept-Nov.',
      suggestions: ['Darjeeling toy train tickets', 'Kalimpong monasteries', 'Sandakphu trek route'],
      destinations: [{ name: 'Darjeeling', slug: 'darjeeling' }, { name: 'Kalimpong', slug: 'kalimpong' }, { name: 'Mirik', slug: 'mirik' }],
    };
  }

  // Beaches
  if (m.match(/\b(beach|sea|ocean|digha|mandarmani)\b/)) {
    return {
      response: 'Bengal\'s beaches are perfect getaways — Mandarmani lets you drive on the beach, Digha is the most popular family destination, Tajpur is quieter and intimate, while Bakkhali offers untouched coastlines. All are 4-7 hours from Kolkata.',
      suggestions: ['Mandarmani beach resorts', 'Digha tour packages', 'Tajpur quiet beaches'],
      destinations: [{ name: 'Mandarmani', slug: 'mandarmani' }, { name: 'Digha', slug: 'digha' }, { name: 'Tajpur', slug: 'tajpur' }],
    };
  }

  // Default
  return {
    response: 'I can help you explore West Bengal! Ask me about destinations (hills, beaches, wildlife), Bengali food, festivals, budgets, or specific places. What interests you most?',
    suggestions: ['Hill stations to visit', 'Bengali food guide', 'Festival calendar', 'Plan a 3-day trip'],
  };
}

// ── POST /ai-assistant/chat ──────────────────────────────────────────────────
router.post('/chat', limiters.ai, optionalAuth, async (req, res) => {
  try {
    const { message, language = 'en', conversationHistory = [] } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'message is required' });
    }

    let aiText = null;
    let provider = 'fallback';

    // Try Gemini first (more reliable, free tier is generous)
    aiText = await callGemini(message, conversationHistory, language);
    if (aiText) provider = 'gemini';

    // Fall back to Groq if Gemini fails
    if (!aiText) {
      aiText = await callGroq(message, conversationHistory, language);
      if (aiText) provider = 'groq';
    }

    // If both AI fail, use smart keyword fallback
    if (!aiText) {
      const fallback = keywordFallback(message, language);
      return res.json({
        response: fallback.response,
        suggestions: fallback.suggestions || [],
        destinations: fallback.destinations || [],
        provider: 'fallback',
      });
    }

    // Generate suggestions based on AI response context
    const suggestions = generateSuggestions(message);
    const destinations = extractDestinations(aiText);

    return res.json({
      response: aiText,
      suggestions,
      destinations,
      provider,
    });
  } catch (err) {
    console.error('AI chat error:', err);
    // Even on error, return a helpful fallback response
    return res.json({
      response: 'I am having trouble right now, but I can still help! Ask me about Bengal destinations, food, or festivals.',
      suggestions: ['Best places to visit', 'Bengali food', 'Festivals'],
      destinations: [],
      provider: 'error-fallback',
    });
  }
});

function generateSuggestions(message) {
  const m = message.toLowerCase();
  if (m.includes('darjeeling')) return ['Best hotels in Darjeeling', 'Tea garden tours', 'Toy train booking'];
  if (m.includes('food')) return ['Best Bengali sweets', 'Street food in Kolkata', 'Veg restaurants'];
  if (m.includes('festival')) return ['Durga Puja 2026', 'Poush Mela dates', 'Festival calendar'];
  if (m.includes('budget')) return ['Cheap stays', 'Affordable food', 'Budget itinerary'];
  return ['Tell me more', 'Show similar places', 'Plan a trip'];
}

function extractDestinations(text) {
  const known = [
    { name: 'Darjeeling', slug: 'darjeeling', keywords: ['darjeeling', 'queen of hills'] },
    { name: 'Kolkata', slug: 'kolkata', keywords: ['kolkata', 'calcutta'] },
    { name: 'Sundarbans', slug: 'sundarbans-national-park', keywords: ['sundarbans', 'mangrove'] },
    { name: 'Shantiniketan', slug: 'shantiniketan', keywords: ['shantiniketan', 'tagore'] },
    { name: 'Kalimpong', slug: 'kalimpong', keywords: ['kalimpong'] },
    { name: 'Mirik', slug: 'mirik', keywords: ['mirik'] },
    { name: 'Mandarmani', slug: 'mandarmani', keywords: ['mandarmani'] },
    { name: 'Digha', slug: 'digha', keywords: ['digha'] },
    { name: 'Bishnupur', slug: 'bishnupur', keywords: ['bishnupur', 'terracotta'] },
    { name: 'Murshidabad', slug: 'murshidabad', keywords: ['murshidabad'] },
  ];
  const lower = text.toLowerCase();
  const matches = [];
  for (const dest of known) {
    if (dest.keywords.some((k) => lower.includes(k))) {
      matches.push({ name: dest.name, slug: dest.slug });
      if (matches.length >= 3) break;
    }
  }
  return matches;
}

module.exports = router;
