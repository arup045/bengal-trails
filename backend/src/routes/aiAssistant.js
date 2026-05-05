const router = require('express').Router();
const { optionalAuth } = require('../middleware/auth');
const { limiters } = require('../middleware/rateLimit');

const DESTINATIONS_CONTEXT = `
You are a friendly AI travel assistant for GOBRO, a West Bengal tourism platform.
You ONLY help with West Bengal travel queries.
Always recommend specific West Bengal destinations by name.
Keep responses under 120 words. Be warm, enthusiastic and helpful.

Key destinations: Darjeeling (darjeeling), Sundarbans (sundarbans-national-park), 
Digha (digha), Shantiniketan (shantiniketan), Kalimpong (kalimpong), 
Bishnupur (bishnupur), Murshidabad (murshidabad), Kolkata (kolkata), 
Mandarmani (mandarmani), Dooars (jalpaiguri-dooars-wildlife-circuit)

Respond ONLY as valid JSON:
{"response":"your answer","suggestions":["s1","s2","s3"],"destinations":[{"name":"Place","slug":"slug"}]}
`;

function keywordFallback(message) {
  const m = message.toLowerCase();
  if (m.includes('romantic') || m.includes('couple') || m.includes('honeymoon')) {
    return { response: "For a romantic West Bengal escape, Darjeeling\'s misty hills and Shantiniketan\'s artistic calm are perfect for couples!", suggestions: ['Best hotels Darjeeling', 'Budget for couples', 'Shantiniketan itinerary'], destinations: [{name:'Darjeeling',slug:'darjeeling'},{name:'Shantiniketan',slug:'shantiniketan'}] };
  } else if (m.includes('beach') || m.includes('sea')) {
    return { response: "Head to Digha or Mandarmani for a beautiful beach escape! Easy weekend getaways from Kolkata with gorgeous Bay of Bengal sunrises.", suggestions: ['How to reach Digha', 'Best beach resorts', 'Mandarmani vs Digha'], destinations: [{name:'Digha',slug:'digha'},{name:'Mandarmani',slug:'mandarmani'}] };
  } else if (m.includes('wildlife') || m.includes('tiger') || m.includes('safari')) {
    return { response: "The Sundarbans is a must — world\'s largest mangrove delta and home to Royal Bengal Tigers! Dooars also has incredible jungle safaris.", suggestions: ['Sundarbans packages', 'Best time safari', 'Dooars wildlife guide'], destinations: [{name:'Sundarbans',slug:'sundarbans-national-park'},{name:'Dooars',slug:'jalpaiguri-dooars-wildlife-circuit'}] };
  } else if (m.includes('hill') || m.includes('mountain') || m.includes('tea') || m.includes('cold')) {
    return { response: "Darjeeling\'s Himalayan views, Toy Train and tea gardens are iconic! Kalimpong is quieter with beautiful monasteries and panoramic views.", suggestions: ['Toy train booking', 'Tea estates to visit', 'Darjeeling vs Kalimpong'], destinations: [{name:'Darjeeling',slug:'darjeeling'},{name:'Kalimpong',slug:'kalimpong'}] };
  } else if (m.includes('budget') || m.includes('cheap')) {
    return { response: "For budget travel, Bishnupur\'s ancient temples, Murshidabad\'s Nawabi heritage, and Digha beach are all amazing under ₹3000 per person!", suggestions: ['Budget 3-day itinerary', 'Cheapest stays', 'Free attractions'], destinations: [{name:'Bishnupur',slug:'bishnupur'},{name:'Digha',slug:'digha'}] };
  } else if (m.includes('food') || m.includes('eat') || m.includes('mishti')) {
    return { response: "Bengali cuisine is divine! Kolkata is the food capital — try Kathi rolls, mishti doi, fish curry and jhalmuri. Darjeeling has amazing momos!", suggestions: ['Best restaurants Kolkata', 'Must-try Bengali dishes', 'Street food guide'], destinations: [{name:'Kolkata',slug:'kolkata'},{name:'Darjeeling',slug:'darjeeling'}] };
  } else if (m.includes('heritage') || m.includes('history') || m.includes('temple')) {
    return { response: "West Bengal has incredible heritage! Bishnupur\'s terracotta temples, Murshidabad\'s Nawabi palaces, and Shantiniketan\'s Tagore legacy are unmissable.", suggestions: ['Bishnupur temple guide', 'Murshidabad day trip', 'Shantiniketan Baul music'], destinations: [{name:'Bishnupur',slug:'bishnupur'},{name:'Murshidabad',slug:'murshidabad'}] };
  }
  return { response: "West Bengal has 221 amazing destinations! From misty Darjeeling hills to wild Sundarbans, serene beaches to rich heritage cities. What kind of trip are you planning?", suggestions: ['Romantic getaways', 'Adventure activities', 'Budget options', 'Best time to visit'], destinations: [{name:'Darjeeling',slug:'darjeeling'},{name:'Sundarbans',slug:'sundarbans-national-park'}] };
}

router.post('/chat', limiters.ai, optionalAuth, async (req, res) => {
  try {
    const { message, language, conversationHistory } = req.body;
    if (!message) return res.status(400).json({ error: 'message required' });

    const groqKey = process.env.GROQ_API_KEY;

    if (groqKey) {
      try {
        const historyMessages = (conversationHistory || []).slice(-4).map((m) => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content,
        }));

        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${groqKey}` },
          body: JSON.stringify({
            model: 'llama3-8b-8192',
            max_tokens: 300,
            temperature: 0.7,
            messages: [
              { role: 'system', content: DESTINATIONS_CONTEXT },
              ...historyMessages,
              { role: 'user', content: `Language: ${language || 'en'}. User says: ${message}` },
            ],
          }),
        });

        if (groqResponse.ok) {
          const groqData = await groqResponse.json();
          const rawText = groqData.choices?.[0]?.message?.content || '';
          try {
            const clean = rawText.replace(/```json|```/g, '').trim();
            const parsed = JSON.parse(clean);
            return res.json({ response: parsed.response || rawText, suggestions: parsed.suggestions || [], destinations: parsed.destinations || [] });
          } catch {
            return res.json({ response: rawText, suggestions: ['Tell me more', 'Best time to visit', 'Budget options'], destinations: [] });
          }
        }
      } catch (groqErr) {
        console.warn('Groq API error, using keyword fallback:', groqErr.message);
      }
    }

    return res.json(keywordFallback(message));
  } catch (err) {
    console.error('AI chat error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
