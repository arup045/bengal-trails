import { useDestinationContext } from '../hooks/useBengalContent';
import { TravelSectionRow } from './TravelSectionRow';
import { PremiumPlaceCard } from './PremiumPlaceCard';

// Clean rebuild of the old turquoise "Where to stay" box. Real hotel/homestay
// data from the destination context, rendered as the unified PremiumPlaceCard
// in a full-width horizontal carousel — no coloured pills, photo-backfilled.
export function PlaceStaysCarousel({ destinationSlug, districtName }: { destinationSlug: string; districtName?: string }) {
  const { hotels, loading } = useDestinationContext(destinationSlug);

  if (loading || !hotels || hotels.length === 0) return null;

  // Maps deep-link is the honest action — individual hotels aren't booked in-app.
  const mapsHref = (name: string) =>
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name}${districtName ? ', ' + districtName : ''}, West Bengal`)}`;

  // Pull the leading "₹X,XXX" out of a range like "₹4,500 - ₹8,000" for the
  // clean base price marker.
  const leadPrice = (range?: string) => {
    if (!range) return undefined;
    const m = range.match(/₹\s?[\d,]+/);
    return m ? m[0].replace(/\s/g, '') : undefined;
  };

  return (
    <TravelSectionRow
      id="stay"
      title="Stay"
      subtitle={`${hotels.length} curated stays — homestays to heritage resorts`}
      count={hotels.length}
    >
      {hotels.map((h, i) => (
        <PremiumPlaceCard
          key={`${h.name}-${i}`}
          title={h.name}
          image={h.image}
          href={mapsHref(h.name)}
          location={h.type || 'Stay'}
          rating={h.rating}
          price={leadPrice(h.priceRange)}
          priceNote="/ night"
          fallbackKind="stay"
        />
      ))}
    </TravelSectionRow>
  );
}

export default PlaceStaysCarousel;
