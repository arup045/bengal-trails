// districts.ts — the 23 districts of West Bengal.
//
// The Explore page is organised district-first: 23 district cards → each district's
// places → individual place detail. Each district's representative photo + place
// list are derived from the existing `placesData` (the canonical content source),
// so districts stay in sync with content automatically. Districts with no places
// yet still render (using a curated fallback image).

import { placesData, Place } from './places-full';

export type BengalRegion = 'North Bengal' | 'Central Bengal' | 'South Bengal';

export interface District {
  name: string;
  slug: string;
  region: BengalRegion;
  blurb: string;
  lat: number;
  lng: number;
  fallbackImage: string;
}

// All 23 districts. lat/lng = district HQ (used for the "Directions" action).
export const DISTRICTS: District[] = [
  // ── North Bengal ──────────────────────────────────────────────────────────
  { name: 'Darjeeling', slug: 'darjeeling', region: 'North Bengal', blurb: 'Himalayan tea gardens, the toy train and Kanchenjunga sunrises.', lat: 27.0410, lng: 88.2663, fallbackImage: 'https://images.unsplash.com/photo-1544016768-982d1554f0b9?w=1200' },
  { name: 'Kalimpong', slug: 'kalimpong', region: 'North Bengal', blurb: 'Quiet hill town of monasteries, orchids and colonial charm.', lat: 27.0600, lng: 88.4700, fallbackImage: 'https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=1200' },
  { name: 'Jalpaiguri', slug: 'jalpaiguri', region: 'North Bengal', blurb: 'Gateway to the Dooars — forests, rivers and wildlife.', lat: 26.5215, lng: 88.7196, fallbackImage: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200' },
  { name: 'Alipurduar', slug: 'alipurduar', region: 'North Bengal', blurb: 'Tea, tigers and Buxa — the eastern Dooars frontier.', lat: 26.4900, lng: 89.5300, fallbackImage: 'https://images.unsplash.com/photo-1474524955719-b9f87c50ce47?w=1200' },
  { name: 'Cooch Behar', slug: 'cooch-behar', region: 'North Bengal', blurb: 'Royal heritage town with the grand Cooch Behar Palace.', lat: 26.3242, lng: 89.4513, fallbackImage: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200' },
  { name: 'Uttar Dinajpur', slug: 'uttar-dinajpur', region: 'North Bengal', blurb: 'Lush paddy plains, raiganj wetlands and birdlife.', lat: 25.6200, lng: 88.1200, fallbackImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200' },
  { name: 'Dakshin Dinajpur', slug: 'dakshin-dinajpur', region: 'North Bengal', blurb: 'Ancient ruins of Bangarh and tranquil rural Bengal.', lat: 25.2200, lng: 88.7600, fallbackImage: 'https://images.unsplash.com/photo-1518457607834-6e8d80c183c5?w=1200' },
  { name: 'Malda', slug: 'malda', region: 'North Bengal', blurb: 'Mango orchards and the medieval ruins of Gour & Pandua.', lat: 25.0000, lng: 88.1400, fallbackImage: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200' },

  // ── Central Bengal ────────────────────────────────────────────────────────
  { name: 'Murshidabad', slug: 'murshidabad', region: 'Central Bengal', blurb: 'Nawabi history along the Bhagirathi — Hazarduari & more.', lat: 24.1000, lng: 88.2500, fallbackImage: 'https://images.unsplash.com/photo-1597040663342-45b6b9f0e6f3?w=1200' },
  { name: 'Birbhum', slug: 'birbhum', region: 'Central Bengal', blurb: "Tagore's Shantiniketan, terracotta temples and Baul music.", lat: 23.9100, lng: 87.5300, fallbackImage: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=1200' },
  { name: 'Nadia', slug: 'nadia', region: 'Central Bengal', blurb: 'Spiritual heart of Bengal — Mayapur, Nabadwip and ghats.', lat: 23.4000, lng: 88.5000, fallbackImage: 'https://images.unsplash.com/photo-1609766418204-94aae0ecf4e5?w=1200' },
  { name: 'Purba Bardhaman', slug: 'purba-bardhaman', region: 'Central Bengal', blurb: 'Fertile rice bowl with the historic city of Bardhaman.', lat: 23.2324, lng: 87.8615, fallbackImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200' },
  { name: 'Paschim Bardhaman', slug: 'paschim-bardhaman', region: 'Central Bengal', blurb: 'Industrial Asansol–Durgapur belt with riverside escapes.', lat: 23.6800, lng: 86.9800, fallbackImage: 'https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?w=1200' },
  { name: 'Hooghly', slug: 'hooghly', region: 'Central Bengal', blurb: 'Riverside colonial towns — Chandannagar, Bandel & Tarakeswar.', lat: 22.9000, lng: 88.3900, fallbackImage: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=1200' },

  // ── South Bengal ──────────────────────────────────────────────────────────
  { name: 'Kolkata', slug: 'kolkata', region: 'South Bengal', blurb: 'The City of Joy — heritage, food, art and Durga Puja.', lat: 22.5726, lng: 88.3639, fallbackImage: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=1200' },
  { name: 'Howrah', slug: 'howrah', region: 'South Bengal', blurb: 'Iconic Howrah Bridge, Botanical Garden and the riverfront.', lat: 22.5958, lng: 88.2636, fallbackImage: 'https://images.unsplash.com/photo-1571679654681-ba01b9e1e117?w=1200' },
  { name: 'North 24 Parganas', slug: 'north-24-parganas', region: 'South Bengal', blurb: 'Wetlands, riverside temples and the edge of the Sundarbans.', lat: 22.7200, lng: 88.4800, fallbackImage: 'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=1200' },
  { name: 'South 24 Parganas', slug: 'south-24-parganas', region: 'South Bengal', blurb: 'The mangrove Sundarbans, Royal Bengal tigers and river deltas.', lat: 22.1600, lng: 88.4300, fallbackImage: 'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=1200' },
  { name: 'Purba Medinipur', slug: 'purba-medinipur', region: 'South Bengal', blurb: 'Bengal’s beaches — Digha, Mandarmani and Tajpur.', lat: 22.3000, lng: 87.9200, fallbackImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200' },
  { name: 'Paschim Medinipur', slug: 'paschim-medinipur', region: 'South Bengal', blurb: 'Forests, temples and the tribal heartland of Gnanganj.', lat: 22.4300, lng: 87.3200, fallbackImage: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200' },
  { name: 'Jhargram', slug: 'jhargram', region: 'South Bengal', blurb: 'Sal forests, royal palace and Santhal tribal culture.', lat: 22.4500, lng: 86.9900, fallbackImage: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200' },
  { name: 'Bankura', slug: 'bankura', region: 'South Bengal', blurb: 'Terracotta temples of Bishnupur and the famous Bankura horse.', lat: 23.2500, lng: 87.0700, fallbackImage: 'https://images.unsplash.com/photo-1609766418204-94aae0ecf4e5?w=1200' },
  { name: 'Purulia', slug: 'purulia', region: 'South Bengal', blurb: 'Ayodhya Hills, Chhau dance and Bengal’s rugged west.', lat: 23.3300, lng: 86.3600, fallbackImage: 'https://images.unsplash.com/photo-1454942901704-3c44c11b2ad1?w=1200' },
];

// Some place records use town names or combined labels — map them to a canonical
// district slug so every place lands in the right district card.
const DISTRICT_ALIASES: Record<string, string> = {
  'kurseong': 'darjeeling',
  'jalpaiguri / dooars': 'jalpaiguri',
  'dooars': 'jalpaiguri',
  'darjeeling / jalpaiguri': 'darjeeling',
  'howrah/hooghly': 'howrah',
};

function toSlug(s: string): string {
  return (s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/** Canonical district slug for a place. */
export function districtSlugForPlace(p: Place): string {
  const raw = (p.district || '').toLowerCase().trim();
  if (DISTRICT_ALIASES[raw]) return DISTRICT_ALIASES[raw];
  return toSlug(raw);
}

/** All published places that belong to a district (by slug). */
export function placesForDistrict(slug: string): Place[] {
  return placesData.filter((p) => districtSlugForPlace(p) === slug);
}

export interface DistrictWithMeta extends District {
  image: string;     // a real popular-place photo from the district (or fallback)
  placeCount: number;
}

function withMeta(d: District): DistrictWithMeta {
  const places = placesForDistrict(d.slug);
  const image = places[0]?.heroImage?.url || d.fallbackImage;
  return { ...d, image, placeCount: places.length };
}

/** All 23 districts with a derived photo + place count, ready to render. */
export function getDistrictsWithMeta(): DistrictWithMeta[] {
  return DISTRICTS.map(withMeta);
}

/** A single district with meta (or undefined if the slug is unknown). */
export function getDistrict(slug: string): DistrictWithMeta | undefined {
  const d = DISTRICTS.find((x) => x.slug === slug);
  return d ? withMeta(d) : undefined;
}
