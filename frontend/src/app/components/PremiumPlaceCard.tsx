import { MapPin, Star, ArrowUpRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

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
}

// One uniform card used by every horizontal row on the District page.
// Strict rules from the spec:
//   • photo-led (aspect-[4/3]), w-72, real photography only
//   • NO colored badge pills — let the image do the visual work
//   • Poppins everywhere, slate text, single purple accent on hover/CTA
//   • "View details" CTA at the base, soft border, soft shadow
export function PremiumPlaceCard({
  title, image, href, location, tagline, rating, price,
}: PremiumPlaceCardProps) {
  const sub = tagline || location;
  return (
    <a
      href={href}
      className="group relative block w-72 shrink-0 snap-start rounded-2xl overflow-hidden bg-white border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 font-poppins"
    >
      {/* Photo */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <ImageWithFallback
          src={image || ''}
          alt={title}
          optimizeWidth={480}
          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
        />
        {/* Very low-contrast gradient — never obscures the body */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/15 to-transparent pointer-events-none" />

        {/* Optional clean star rating chip (only when a real rating exists). */}
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
