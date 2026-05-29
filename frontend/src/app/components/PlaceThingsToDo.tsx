import { useMemo } from 'react';
import { getDistrictContent } from '../data/districtContent';
import { getDistrict } from '../data/districts';
import { usePlaceImages } from '../lib/queries';
import { TravelSectionRow } from './TravelSectionRow';
import { PremiumPlaceCard } from './PremiumPlaceCard';

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

interface ItemMeta { image?: string; type?: string; rating?: number; hours?: string }

// Activities + Food carousels for a place, sourced from its PARENT DISTRICT's
// curated lists (a place inherits its district's experiences & cuisine so these
// tracks are always rich). Cards link into the existing spot-detail route.
export function PlaceThingsToDo({ districtSlug }: { districtSlug: string }) {
  const content = useMemo(() => getDistrictContent(districtSlug), [districtSlug]);
  const district = useMemo(() => getDistrict(districtSlug), [districtSlug]);
  const { data: placeImageData } = usePlaceImages(districtSlug);
  const items: Record<string, ItemMeta> = placeImageData?.items || {};

  if (!content || !district) return null;

  const districtLabel = district.name;
  const regionLabel = district.region;

  // Food = signature dishes + street-food hubs, merged into one rich track.
  const foodItems: { name: string; section: 'foods' | 'foodZones' }[] = [
    ...(content.foods || []).map((name) => ({ name, section: 'foods' as const })),
    ...(content.foodZones || []).map((name) => ({ name, section: 'foodZones' as const })),
  ];
  const activities = content.activities || [];

  const card = (name: string, section: string, kind: 'activity' | 'food', sub: string) => {
    const m = items[name] || {};
    return (
      <PremiumPlaceCard
        key={`${section}-${name}`}
        title={name}
        image={m.image}
        href={`/explore/district/${districtSlug}/${section}/${slugify(name)}`}
        location={sub}
        rating={m.rating}
        fallbackKind={kind}
      />
    );
  };

  return (
    <>
      {activities.length > 0 && (
        <TravelSectionRow
          id="activities"
          title="Activities"
          subtitle={`Things to do around ${districtLabel}`}
          count={activities.length}
          seeAllHref={`/explore/district/${districtSlug}#sec-activities`}
        >
          {activities.map((name) => card(name, 'activities', 'activity', `${districtLabel}, ${regionLabel}`))}
        </TravelSectionRow>
      )}

      {foodItems.length > 0 && (
        <TravelSectionRow
          id="food"
          title="Food"
          subtitle={`Signature dishes & street-food hubs in ${districtLabel}`}
          count={foodItems.length}
          seeAllHref={`/explore/district/${districtSlug}#sec-foods`}
        >
          {foodItems.map(({ name, section }) =>
            card(name, section, 'food', section === 'foodZones' ? `${districtLabel} food hub` : `${districtLabel} signature taste`),
          )}
        </TravelSectionRow>
      )}
    </>
  );
}

export default PlaceThingsToDo;
