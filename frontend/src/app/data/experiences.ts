import {
  Mountain, Binoculars, Waves, Ship, Landmark, Palette, Trees, Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { placesData, type Place } from './places-full';

// ── West Bengal "ways to explore" ──────────────────────────────────────────
// Travellers think in experiences, not administrative districts. These 8 themes
// are the soul of Bengal — from the Himalayas to the mangrove sea — and are
// derived ENTIRELY from the real tags / districts already in placesData. No new
// data, no fabrication: each place simply surfaces under the experiences it fits.

export interface Experience {
  id: string;
  title: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  match: (p: Place) => boolean;
}

const hasTag = (p: Place, tags: string[]) => (p.tags || []).some((t) => tags.includes(t));
const dist = (p: Place) => (p.district || '').toLowerCase();

export const experiences: Experience[] = [
  {
    id: 'hills-tea',
    title: 'Hills & Tea',
    tagline: 'Darjeeling, Kalimpong & the toy train',
    description: 'Misty ridges, Kanchenjunga sunrises, century-old tea gardens and the UNESCO Darjeeling Himalayan Railway.',
    icon: Mountain,
    match: (p) =>
      hasTag(p, ['Hill', 'HillStation', 'MountainView', 'TeaTrails', 'Tea', 'TeaGarden', 'TeaGardens', 'TeaEstate', 'TeaTasting', 'ToyTrain', 'Sunrise', 'SunriseView', 'Trek', 'Trekking']) ||
      /darjeeling|kalimpong|kurseong|mirik/.test(dist(p)),
  },
  {
    id: 'wildlife-forests',
    title: 'Wildlife & Forests',
    tagline: 'Dooars jungles, rhinos & birdsong',
    description: 'Gorumara, Jaldapara, Buxa and Neora Valley — rhinos, elephants, leopards and the wild green heart of North Bengal.',
    icon: Binoculars,
    match: (p) =>
      hasTag(p, ['Wildlife', 'Safari', 'TigerReserve', 'Rhino', 'BirdWatching', 'Birding', 'Forest', 'EcoTourism', 'Conservation', 'Nature']) ||
      /alipurduar|jalpaiguri/.test(dist(p)),
  },
  {
    id: 'sea-beaches',
    title: 'Sea & Beaches',
    tagline: 'Digha, Mandarmani & Tajpur',
    description: 'Bengal’s coastline — long golden beaches, red-crab sands, fresh seafood and laid-back seaside towns.',
    icon: Waves,
    match: (p) => hasTag(p, ['Beach', 'Beaches', 'WaterSports', 'Seafood']),
  },
  {
    id: 'sundarbans',
    title: 'Sundarbans & Mangroves',
    tagline: 'Royal Bengal Tiger country',
    description: 'The world’s largest mangrove delta — boat safaris, tidal creeks, watchtowers and the elusive Royal Bengal Tiger.',
    icon: Ship,
    match: (p) =>
      hasTag(p, ['BoatSafari', 'Mangrove']) ||
      /sundarban/.test(p.slug) ||
      (/south 24 parganas/.test(dist(p)) && hasTag(p, ['Wildlife', 'TigerReserve', 'EcoTourism', 'BirdWatching'])),
  },
  {
    id: 'kolkata-heritage',
    title: 'Kolkata & Colonial Heritage',
    tagline: 'The City of Joy',
    description: 'Victoria Memorial, Howrah Bridge, trams, College Street and the colonial grandeur of Bengal’s capital.',
    icon: Landmark,
    match: (p) =>
      /kolkata/.test(dist(p)) ||
      hasTag(p, ['Colonial', 'ParkStreet', 'NorthKolkata']),
  },
  {
    id: 'temples-terracotta',
    title: 'Temples & Terracotta',
    tagline: 'Bishnupur, Murshidabad & sacred Bengal',
    description: 'Terracotta temple towns, Nawabi palaces, riverside ghats and centuries of faith carved in clay and stone.',
    icon: Trees,
    match: (p) =>
      hasTag(p, ['Temple', 'Terracotta', 'Spiritual', 'Pilgrimage', 'Sacred', 'Shrine', 'Religious', 'Mosque', 'Tomb', 'Nawabi', 'Sultanate']),
  },
  {
    id: 'art-culture',
    title: 'Art, Culture & Tagore',
    tagline: 'Shantiniketan, Baul & Chhau',
    description: 'Shantiniketan’s open-air learning, Baul folk song, Chhau masks, Patachitra scrolls and Bengal’s living arts.',
    icon: Palette,
    match: (p) =>
      hasTag(p, ['Culture', 'Cultural', 'Art', 'ArtGallery', 'Handicraft', 'Artisan', 'Music', 'Theatre', 'Tagore', 'TribalCulture', 'Tribal', 'Traditional', 'Sculpture']),
  },
  {
    id: 'rivers-offbeat',
    title: 'Rivers & Offbeat',
    tagline: 'Slow Bengal, away from the crowds',
    description: 'Quiet riverside villages, rural homestays, hidden waterfalls and the unhurried, offbeat side of Bengal.',
    icon: Sparkles,
    match: (p) =>
      hasTag(p, ['River', 'Riverfront', 'Riverside', 'RiverCruise', 'Offbeat', 'SlowTravel', 'Village', 'Rural', 'Waterfall', 'Lake', 'Homestay']),
  },
];

export function getExperience(id: string): Experience | undefined {
  return experiences.find((e) => e.id === id);
}

/** Real places that fit an experience theme, most-rated first. */
export function placesForExperience(id: string): Place[] {
  const exp = getExperience(id);
  if (!exp) return [];
  return placesData
    .filter(exp.match)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0) || (b.reviewsCount || 0) - (a.reviewsCount || 0));
}

/** Count of places under each theme (for the cards). */
export function experienceCount(id: string): number {
  const exp = getExperience(id);
  return exp ? placesData.filter(exp.match).length : 0;
}

/** A real cover photo for the theme — borrowed from its first member place. */
export function experienceCover(id: string): string | undefined {
  const first = placesForExperience(id).find((p) => p.heroImage?.url);
  return first?.heroImage?.url;
}
