import { MapPin, Star, ArrowUpRight, Mountain, Utensils, Hotel, Trees, Compass, Sparkles } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

// Branded fallback when no real photo exists for an item — six on-brand
// gradients keyed deterministically by the title so each card stays the same
// across reloads, but adjacent cards vary.
const FALLBACK_GRADIENTS = [
  { bg: 'from-purple-500 via-violet-600 to-indigo-700', glow: 'bg-purple-300/30' },
  { bg: 'from-rose-500 via-pink-600 to-fuchsia-700',    glow: 'bg-rose-300/30'   },
  { bg: 'from-amber-500 via-orange-600 to-red-600',      glow: 'bg-amber-300/30'  },
  { bg: 'from-emerald-500 via-teal-600 to-cyan-700',     glow: 'bg-emerald-300/30'},
  { bg: 'from-sky-500 via-blue-600 to-indigo-700',       glow: 'bg-sky-300/30'    },
  { bg: 'from-slate-700 via-slate-800 to-slate-900',     glow: 'bg-slate-300/20'  },
];

function gradientFor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return FALLBACK_GRADIENTS[h % FALLBACK_GRADIENTS.length];
}

// Pick a category-appropriate icon for the empty-photo fallback.
type FallbackIconKind = 'place' | 'park' | 'food' | 'stay' | 'activity' | 'default';
function iconFor(kind: FallbackIconKind | undefined) {
  switch (kind) {
    case 'park':     return Trees;
    case 'food':     return Utensils;
    case 'stay':     return Hotel;
    case 'activity': return Compass;
    case 'place':    return Mountain;
    default:         return Sparkles;
  }
}

interface PremiumPlaceCardProps {
  title: string;
  image?: string;
  href: string;
  /** Sub-line under the title — district / region / "Hotel" / etc. */
  location?: string;
  /** Short flavor line (used for food cards). Overrides `location` when present. */
  tagline?: string;
  /** Optional rating 0–5; only renders when > 0. */
  rating?: number;
  /** Optional price label (e.g. "₹2,500"); only renders when present. */
  price?: string;
  /** Optional callback for the heart save action — when omitted, no heart shows. */
  onSave?: () => void;
  saved?: boolean;
  /** Category hint for the no-photo fallback icon. */
  fallbackKind?: FallbackIconKind;
}

// One uniform card used by every horizontal row on the District page.
// Strict rules from the spec:
//   • photo-led (aspect-[4/3]), w-72, real photography only
//   • NO colored badge pills — let the image do the visual work
//   • Poppins everywhere, slate text, single purple accent on hover/CTA
//   • "View details" CTA at the base, soft border, soft shadow
export function PremiumPlaceCard({
  title, image, href, location, tagline, rating, price, fallbackKind,
}: PremiumPlaceCardProps) {
  const sub = tagline || location;
  const hasImage = !!(image && image.trim());
  const grad = gradientFor(title);
  const FallbackIcon = iconFor(fallbackKind);
  return (
    <a
      href={href}
      className="group relative block w-72 shrink-0 snap-start rounded-2xl overflow-hidden bg-white border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 font-poppins"
    >
      {/* Photo slot — real image when available, premium branded panel otherwise. */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {hasImage ? (
          <>
            <ImageWithFallback
              src={image as string}
              alt={title}
              optimizeWidth={480}
              className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/15 to-transparent pointer-events-none" />
          </>
        ) : (
          // No real photo — render an on-brand gradient panel with a soft glow
          // and a centered category icon. Looks intentional, never broken.
          <div className={`relative w-full h-full bg-gradient-to-br ${grad.bg} flex items-center justify-center overflow-hidden`}>
            <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl ${grad.glow}`} />
            <div className={`absolute -bottom-12 -left-10 w-40 h-40 rounded-full blur-3xl ${grad.glow}`} />
            <div className="relative flex flex-col items-center text-white/95">
              <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/20 mb-2.5">
                <FallbackIcon className="w-6 h-6" strokeWidth={1.85} />
              </div>
              <span className="font-poppins text-[11px] uppercase tracking-[0.2em] font-medium text-white/75">
                {fallbackKind === 'food' ? 'Local taste'
                  : fallbackKind === 'stay' ? 'Place to stay'
                  : fallbackKind === 'activity' ? 'Experience'
                  : fallbackKind === 'park' ? 'Open space'
                  : 'Destination'}
              </span>
            </div>
          </div>
        )}

        {/* Clean star rating chip (only when a real rating exists). */}
        {rating != null && rating > 0 && (
          <div className="absolute top-3 right-3 inline-flex items-center gap-1 bg-white/95 backdrop-blur-sm rounded-full px-2.5 py-1 shadow-sm ring-1 ring-black/[0.04]">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" strokeWidth={0} />
            <span className="text-[11px] font-semibold text-slate-800">{rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="text-base font-semibold text-slate-900 leading-snug line-clamp-1 group-hover:text-purple-600 transition-colors">
          {title}
        </h3>
        {sub && (
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 line-clamp-1">
            {!tagline && location && <MapPin className="w-3 h-3 shrink-0" />}
            <span className="truncate">{sub}</span>
          </p>
        )}

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
          {price ? (
            <span className="text-sm font-semibold text-slate-800">
              {price}
              <span className="text-[10px] font-normal text-slate-400 ml-0.5">onwards</span>
            </span>
          ) : <span aria-hidden />}
          <span className="text-xs font-medium text-slate-500 group-hover:text-purple-600 inline-flex items-center gap-1 transition-colors">
            View details
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </a>
  );
}

export default PremiumPlaceCard;
