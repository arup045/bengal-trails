import {
  Sunrise, Sunset, Camera, Mountain, Footprints, Bike, Ship, Binoculars, Bird,
  PawPrint, Landmark, Building2, ScrollText, ShoppingBag, Utensils, Coffee, Fish,
  Waves, Trees, TrainFront, Palette, Drama, Hammer, PartyPopper, Trophy, Castle,
  Sparkles, Leaf, type LucideIcon,
} from 'lucide-react';

// Turns a place's REAL tags (from the dataset) into place-specific "things to
// do here" — actionable experiences with an icon. Curated map only, so we never
// surface meaningless descriptor tags ("Popular", "Budget"…) as activities.
const TAG_ACTIVITY: Record<string, { label: string; icon: LucideIcon }> = {
  SunriseView: { label: 'Catch the sunrise', icon: Sunrise },
  Sunrise: { label: 'Catch the sunrise', icon: Sunrise },
  Sunset: { label: 'Watch the sunset', icon: Sunset },
  Photography: { label: 'Photography', icon: Camera },
  Viewpoint: { label: 'Take in the views', icon: Mountain },
  View: { label: 'Scenic viewpoint', icon: Mountain },
  Scenic: { label: 'Scenic views', icon: Mountain },
  MountainView: { label: 'Mountain views', icon: Mountain },
  HillStation: { label: 'Hill-station strolls', icon: Mountain },
  Hill: { label: 'Hill views', icon: Mountain },
  Trek: { label: 'Trekking', icon: Footprints },
  Trekking: { label: 'Trekking', icon: Footprints },
  Walking: { label: 'Walking trails', icon: Footprints },
  TownWalk: { label: 'Town walk', icon: Footprints },
  Cycling: { label: 'Cycling', icon: Bike },
  Boating: { label: 'Boating', icon: Ship },
  BoatSafari: { label: 'Boat safari', icon: Ship },
  RiverCruise: { label: 'River cruise', icon: Ship },
  Safari: { label: 'Wildlife safari', icon: Binoculars },
  Wildlife: { label: 'Wildlife spotting', icon: PawPrint },
  TigerReserve: { label: 'Tiger reserve', icon: PawPrint },
  Rhino: { label: 'Rhino spotting', icon: PawPrint },
  BirdWatching: { label: 'Bird watching', icon: Bird },
  Birding: { label: 'Bird watching', icon: Bird },
  Temple: { label: 'Temple visit', icon: Landmark },
  Spiritual: { label: 'Seek blessings', icon: Sparkles },
  Pilgrimage: { label: 'Pilgrimage', icon: Sparkles },
  Sacred: { label: 'Sacred site', icon: Sparkles },
  Religious: { label: 'Religious site', icon: Sparkles },
  Shrine: { label: 'Visit the shrine', icon: Sparkles },
  Heritage: { label: 'Explore heritage', icon: Landmark },
  Architecture: { label: 'Admire architecture', icon: Building2 },
  Colonial: { label: 'Colonial landmarks', icon: Building2 },
  Palace: { label: 'Palace & courts', icon: Castle },
  Fort: { label: 'Forts & ramparts', icon: Castle },
  Museum: { label: 'Visit the museum', icon: Building2 },
  History: { label: 'Step into history', icon: ScrollText },
  Historic: { label: 'Step into history', icon: ScrollText },
  Ruins: { label: 'Ancient ruins', icon: ScrollText },
  Shopping: { label: 'Shopping', icon: ShoppingBag },
  Market: { label: 'Local markets', icon: ShoppingBag },
  StreetFood: { label: 'Street food', icon: Utensils },
  Seafood: { label: 'Fresh seafood', icon: Fish },
  Cafe: { label: 'Cafés', icon: Coffee },
  TeaTrails: { label: 'Tea gardens', icon: Leaf },
  TeaGarden: { label: 'Tea gardens', icon: Leaf },
  TeaGardens: { label: 'Tea gardens', icon: Leaf },
  TeaEstate: { label: 'Tea estates', icon: Leaf },
  TeaTasting: { label: 'Tea tasting', icon: Leaf },
  Tea: { label: 'Tea trails', icon: Leaf },
  Beach: { label: 'Beach time', icon: Waves },
  Beaches: { label: 'Beach time', icon: Waves },
  WaterSports: { label: 'Water sports', icon: Waves },
  Lake: { label: 'Lakeside', icon: Waves },
  River: { label: 'Riverside', icon: Waves },
  Riverfront: { label: 'Riverside', icon: Waves },
  Riverside: { label: 'Riverside', icon: Waves },
  Waterfall: { label: 'Waterfall', icon: Waves },
  Fishing: { label: 'Fishing', icon: Fish },
  ToyTrain: { label: 'Toy train ride', icon: TrainFront },
  Nature: { label: 'Nature & forest', icon: Trees },
  EcoTourism: { label: 'Eco-tourism', icon: Trees },
  Forest: { label: 'Forest trails', icon: Trees },
  Garden: { label: 'Gardens', icon: Trees },
  Park: { label: 'Parks & gardens', icon: Trees },
  Picnic: { label: 'Picnic spot', icon: Trees },
  Art: { label: 'Art & galleries', icon: Palette },
  ArtGallery: { label: 'Art galleries', icon: Palette },
  Sculpture: { label: 'Sculpture', icon: Palette },
  Culture: { label: 'Local culture', icon: Drama },
  Cultural: { label: 'Local culture', icon: Drama },
  Traditional: { label: 'Living traditions', icon: Drama },
  Music: { label: 'Live music', icon: Drama },
  Theatre: { label: 'Theatre', icon: Drama },
  Handicraft: { label: 'Crafts & souvenirs', icon: Hammer },
  Artisan: { label: 'Artisan crafts', icon: Hammer },
  Terracotta: { label: 'Terracotta art', icon: Hammer },
  Festival: { label: 'Festivals', icon: PartyPopper },
  Events: { label: 'Events', icon: PartyPopper },
  Football: { label: 'Football', icon: Trophy },
  Sports: { label: 'Sports', icon: Trophy },
  Stadium: { label: 'Stadium', icon: Trophy },
};

export function PlaceThingsHere({ tags, placeName }: { tags?: string[]; placeName: string }) {
  // De-dupe by label so two tags mapping to the same experience show once.
  const seen = new Set<string>();
  const items: { label: string; icon: LucideIcon }[] = [];
  for (const t of tags || []) {
    const hit = TAG_ACTIVITY[t];
    if (hit && !seen.has(hit.label)) {
      seen.add(hit.label);
      items.push(hit);
    }
  }
  if (items.length < 2) return null; // not enough signal — district Activities still covers it

  return (
    <section id="things-to-do" className="scroll-mt-32 font-poppins">
      <div className="mb-5">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">Things to do at {placeName}</h2>
        <p className="text-sm text-slate-500 mt-1">What this spot is known for</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {items.map(({ label, icon: Icon }) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-2xl bg-white border border-slate-100 px-4 py-3.5 hover:border-purple-200 hover:shadow-sm transition-all"
          >
            <span className="w-10 h-10 shrink-0 rounded-xl bg-purple-50 flex items-center justify-center">
              <Icon className="w-5 h-5 text-purple-600" strokeWidth={1.9} />
            </span>
            <span className="text-sm font-medium text-slate-800 leading-tight">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default PlaceThingsHere;
