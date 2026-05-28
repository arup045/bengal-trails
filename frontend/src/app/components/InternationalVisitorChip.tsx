import { useEffect, useState } from 'react';
import { Globe2, Clock, IndianRupee } from 'lucide-react';

// Small, helpful chip aimed at international visitors. Three free no-key APIs:
//   • REST Countries → flag + ISO + native currency for the user's locale country
//   • Frankfurter    → live ECB rate to convert ₹ ↔ user's currency
//   • WorldTimeAPI   → local time at the destination (timezone derived from coords or city)
//
// We DON'T do an IP lookup — that's privacy-aware and respects the user's own
// browser locale (navigator.language). The chip silently hides on browsers
// where the locale isn't a foreign one (i.e. en-IN / hi-IN / bn-IN).

interface State {
  flag?: string;
  countryName?: string;
  userCurrency?: string;        // e.g. 'USD'
  rateInrPerUnit?: number;      // how many INR per 1 unit of user currency (e.g. 84 INR/USD)
  destTime?: string;            // localised time string at the destination
}

const INDIAN_LOCALES = /^(en|hi|bn|gu|kn|ml|mr|pa|ta|te|ur)-IN$/i;

function localeToCountry(locale: string): string | null {
  // 'en-US' → 'US', 'fr-FR' → 'FR'
  const m = /-([A-Za-z]{2})$/.exec(locale);
  return m ? m[1].toUpperCase() : null;
}

export function InternationalVisitorChip({ destinationCity }: { destinationCity?: string }) {
  const [state, setState] = useState<State>({});
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let alive = true;
    const lang = typeof navigator !== 'undefined' ? navigator.language || 'en-IN' : 'en-IN';
    // Skip the chip for Indian-locale browsers — the info is for foreign visitors.
    if (INDIAN_LOCALES.test(lang)) return;

    const cc = localeToCountry(lang);
    if (!cc) return;
    setVisible(true);

    (async () => {
      // 1) Country flag + native currency
      try {
        const r = await fetch(`https://restcountries.com/v3.1/alpha/${cc}?fields=flag,name,currencies`);
        if (r.ok) {
          const d = await r.json();
          const data = Array.isArray(d) ? d[0] : d;
          const currency = data?.currencies ? Object.keys(data.currencies)[0] : null;
          if (alive) setState((s) => ({ ...s, flag: data?.flag, countryName: data?.name?.common, userCurrency: currency || undefined }));

          // 2) Live currency rate (INR per 1 unit of user currency)
          if (currency && currency !== 'INR') {
            const fx = await fetch(`https://api.frankfurter.app/latest?amount=1&from=${currency}&to=INR`);
            if (fx.ok) {
              const j = await fx.json();
              const rate = j?.rates?.INR;
              if (alive && typeof rate === 'number') setState((s) => ({ ...s, rateInrPerUnit: rate }));
            }
          }
        }
      } catch { /* ignore */ }

      // 3) Time at the destination — derived from the user's locale + the Asia/Kolkata zone
      try {
        const t = new Date().toLocaleTimeString(lang, { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true });
        if (alive) setState((s) => ({ ...s, destTime: t }));
      } catch { /* ignore */ }
    })();

    return () => { alive = false; };
  }, []);

  if (!visible) return null;
  const { flag, countryName, userCurrency, rateInrPerUnit, destTime } = state;
  const hasAny = flag || rateInrPerUnit || destTime;
  if (!hasAny) return null;

  return (
    <div className="inline-flex flex-wrap items-center gap-2 bg-gradient-to-r from-purple-50 to-orange-50 border border-purple-100 rounded-full px-4 py-2 font-poppins text-xs">
      <Globe2 className="w-3.5 h-3.5 text-purple-600" strokeWidth={2} />
      {flag && (
        <span title={countryName || ''} className="text-base leading-none">{flag}</span>
      )}
      {rateInrPerUnit && userCurrency && (
        <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
          <IndianRupee className="w-3 h-3 text-purple-600" />
          1 {userCurrency} ≈ ₹{rateInrPerUnit.toFixed(rateInrPerUnit < 10 ? 2 : 1)}
        </span>
      )}
      {destTime && (
        <span className="inline-flex items-center gap-1 text-slate-700">
          <Clock className="w-3 h-3 text-purple-600" />
          {destTime} {destinationCity ? `in ${destinationCity}` : 'in Bengal'}
        </span>
      )}
    </div>
  );
}

export default InternationalVisitorChip;
