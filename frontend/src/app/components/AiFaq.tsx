import { useEffect, useState } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import { API_BASE } from '../utils/api';

interface FaqItem { q: string; a: string; }

// Reusable AI travel-tips FAQ accordion. Reuses the cached /district-faq endpoint
// (generic over slug + name), so it works for both districts and individual places.
export function AiFaq({ slug, name, heading }: { slug: string; name: string; heading?: string }) {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [poweredByAI, setPoweredByAI] = useState(true);
  const [open, setOpen] = useState<number | null>(0);

  useEffect(() => {
    let alive = true;
    if (!slug || !name) return;
    fetch(`${API_BASE}/ai-assistant/district-faq?slug=${encodeURIComponent(slug)}&name=${encodeURIComponent(name)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (alive && d?.faqs?.length) { setFaqs(d.faqs); setPoweredByAI(d.poweredByAI !== false); } })
      .catch(() => {});
    return () => { alive = false; };
  }, [slug, name]);

  if (faqs.length === 0) return null;

  return (
    <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-poppins text-2xl font-bold text-slate-900">{heading || `${name} travel tips`}</h2>
        {poweredByAI && (
          <span className="inline-flex items-center gap-1.5 text-xs font-poppins text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" /> Powered by AI
          </span>
        )}
      </div>
      <p className="font-poppins text-sm text-gray-500 mb-5">Common questions travellers ask about {name}.</p>
      <div className="divide-y divide-gray-100">
        {faqs.map((f, i) => (
          <div key={i} className="py-1">
            <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between gap-4 py-4 text-left">
              <span className="font-poppins font-semibold text-slate-900">{f.q}</span>
              <ChevronDown className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`} />
            </button>
            {open === i && <p className="font-poppins text-gray-600 leading-relaxed pb-4 pr-8">{f.a}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
