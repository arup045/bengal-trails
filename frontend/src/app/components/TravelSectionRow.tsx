import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TravelSectionRowProps {
  /** Anchor id for the sticky sub-nav's scroll-spy. */
  id?: string;
  title: string;
  /** Optional small caption sitting beneath the title (e.g. district name). */
  subtitle?: string;
  /** Item counter shown next to the title. */
  count?: number;
  /** Optional "See all →" link target. */
  seeAllHref?: string;
  /** Optional handler instead of seeAllHref (e.g. open a modal). */
  onSeeAll?: () => void;
  children: ReactNode;
}

// A horizontal-scroll carousel row used everywhere on the District page.
// Behaviour:
//   • Touch-swipes on mobile, hides scrollbar, snaps to each card.
//   • On desktop, soft circular arrows appear at the top-right and step the
//     track left/right by ~1 card width with a smooth animation.
//   • Arrows auto-disable at the edges so users always know there's no more.
export function TravelSectionRow({
  id, title, subtitle, count, seeAllHref, onSeeAll, children,
}: TravelSectionRowProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const update = () => {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const scrollByCards = (dir: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    // Step ~1.1 card-widths so the next card visibly lands aligned.
    el.scrollBy({ left: dir * Math.max(el.clientWidth * 0.85, 320), behavior: 'smooth' });
  };

  return (
    <section id={id} className="scroll-mt-32 font-poppins">
      <div className="flex items-end justify-between gap-4 mb-5 flex-wrap">
        <div className="min-w-0">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
            {title}
            {count != null && (
              <span className="text-base font-medium text-slate-400 ml-2">{count}</span>
            )}
          </h2>
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3">
          {seeAllHref && (
            <a href={seeAllHref}
              className="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors hidden sm:inline">
              See all →
            </a>
          )}
          {!seeAllHref && onSeeAll && (
            <button onClick={onSeeAll}
              className="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors hidden sm:inline">
              See all →
            </button>
          )}
          <div className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => scrollByCards(-1)}
              disabled={!canLeft}
              aria-label="Scroll left"
              className="w-9 h-9 rounded-full bg-white border border-slate-200 hover:border-purple-300 hover:bg-purple-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 hover:text-purple-600 flex items-center justify-center transition shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollByCards(1)}
              disabled={!canRight}
              aria-label="Scroll right"
              className="w-9 h-9 rounded-full bg-white border border-slate-200 hover:border-purple-300 hover:bg-purple-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 hover:text-purple-600 flex items-center justify-center transition shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={trackRef}
        onScroll={update}
        className="flex gap-4 overflow-x-auto pb-2 -mx-5 sm:-mx-8 px-5 sm:px-8 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none' as any }}
      >
        {children}
      </div>
    </section>
  );
}

export default TravelSectionRow;
