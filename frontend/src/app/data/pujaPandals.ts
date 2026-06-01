// Real, well-known Kolkata Durga Puja pandals for the pandal-hopping map.
// Coordinates are at neighbourhood level (real localities); these are genuine,
// famous community pujas — no fabricated entries. Used by the Durga Puja page.

export type PandalArea = 'North Kolkata' | 'Central Kolkata' | 'South Kolkata' | 'Salt Lake & North Fringe' | 'Behala & South-West';
export type PandalKind = 'Traditional' | 'Theme' | 'Heritage Bari';

export interface Pandal {
  name: string;
  area: PandalArea;
  lat: number;
  lng: number;
  kind: PandalKind;
  knownFor: string;
  since?: number;
}

export const PUJA_PANDALS: Pandal[] = [
  // ── North Kolkata (the old, traditional heart) ────────────────────────────
  { name: 'Bagbazar Sarbojanin', area: 'North Kolkata', lat: 22.5990, lng: 88.3650, kind: 'Traditional', knownFor: 'One of the oldest community pujas — classic ek-chala idol, nostalgic crowds.', since: 1919 },
  { name: 'Kumartuli Park', area: 'North Kolkata', lat: 22.6012, lng: 88.3585, kind: 'Traditional', knownFor: 'Beside the idol-makers’ quarter — artisanal, photographer’s favourite.' },
  { name: 'Ahiritola Sarbojanin', area: 'North Kolkata', lat: 22.5958, lng: 88.3567, kind: 'Traditional', knownFor: 'Riverside North-Kolkata puja with refined artistic themes.', since: 1919 },
  { name: 'Sovabazar Rajbari', area: 'North Kolkata', lat: 22.5972, lng: 88.3625, kind: 'Heritage Bari', knownFor: 'Aristocratic 18th-century household puja — true bonedi-bari tradition.', since: 1757 },
  { name: 'Hatibagan Sarbojanin', area: 'North Kolkata', lat: 22.5985, lng: 88.3720, kind: 'Theme', knownFor: 'Big, elaborate themed pandals drawing huge North-Kolkata footfall.' },

  // ── Central Kolkata ───────────────────────────────────────────────────────
  { name: 'College Square', area: 'Central Kolkata', lat: 22.5757, lng: 88.3637, kind: 'Theme', knownFor: 'Spectacular lighting reflected in the central water tank.' },
  { name: 'Mohammad Ali Park', area: 'Central Kolkata', lat: 22.5803, lng: 88.3585, kind: 'Theme', knownFor: 'Grand replica-style pandals, among the busiest in the city.' },
  { name: 'Santosh Mitra Square', area: 'Central Kolkata', lat: 22.5640, lng: 88.3650, kind: 'Theme', knownFor: 'Famous for gigantic themes and gold/silver idol décor.', since: 1936 },

  // ── South Kolkata (the theme-pandal belt) ─────────────────────────────────
  { name: 'Ekdalia Evergreen', area: 'South Kolkata', lat: 22.5176, lng: 88.3690, kind: 'Theme', knownFor: 'Grand temple-replica pandals and a celebrated traditional idol.', since: 1943 },
  { name: 'Singhi Park', area: 'South Kolkata', lat: 22.5205, lng: 88.3662, kind: 'Theme', knownFor: 'Long-standing South-Kolkata heavyweight with intricate craft.', since: 1941 },
  { name: 'Maddox Square', area: 'South Kolkata', lat: 22.5300, lng: 88.3560, kind: 'Traditional', knownFor: 'The legendary adda ground — as much social hub as pandal.' },
  { name: 'Deshapriya Park', area: 'South Kolkata', lat: 22.5160, lng: 88.3500, kind: 'Theme', knownFor: 'Once home to the “world’s tallest Durga” — vast open-ground crowds.' },
  { name: 'Ballygunge Cultural Association', area: 'South Kolkata', lat: 22.5262, lng: 88.3650, kind: 'Theme', knownFor: 'Refined, award-winning artistic themes year after year.', since: 1953 },
  { name: 'Mudiali Club', area: 'South Kolkata', lat: 22.5052, lng: 88.3520, kind: 'Theme', knownFor: 'Lake-area pioneer of artistic theme pujas.', since: 1935 },
  { name: 'Tridhara Sammilani', area: 'South Kolkata', lat: 22.5185, lng: 88.3582, kind: 'Theme', knownFor: 'Consistently among the most awarded creative pandals.' },
  { name: 'Chetla Agrani', area: 'South Kolkata', lat: 22.5118, lng: 88.3340, kind: 'Theme', knownFor: 'Bold, concept-driven themes — a modern crowd-puller.' },
  { name: 'Suruchi Sangha', area: 'South Kolkata', lat: 22.4980, lng: 88.3372, kind: 'Theme', knownFor: 'New Alipore club known for state-culture themes and craftsmanship.', since: 1952 },

  // ── Salt Lake & North fringe ──────────────────────────────────────────────
  { name: 'Sreebhumi Sporting Club', area: 'Salt Lake & North Fringe', lat: 22.6042, lng: 88.4030, kind: 'Theme', knownFor: 'Giant replica sets (palaces, film themes) — colossal nightly crowds.', since: 1974 },
  { name: 'FD Block, Salt Lake', area: 'Salt Lake & North Fringe', lat: 22.5790, lng: 88.4110, kind: 'Theme', knownFor: 'Salt Lake’s flagship themed puja with elaborate installations.' },
  { name: 'Lake Town Adibasi Brindo', area: 'Salt Lake & North Fringe', lat: 22.6050, lng: 88.4015, kind: 'Theme', knownFor: 'Popular Lake Town stop, easy to pair with Sreebhumi.' },

  // ── Behala & South-West ───────────────────────────────────────────────────
  { name: 'Barisha Club', area: 'Behala & South-West', lat: 22.4860, lng: 88.3120, kind: 'Theme', knownFor: 'Powerful socially-themed pandals that often go viral.' },
  { name: 'Behala Natun Dal', area: 'Behala & South-West', lat: 22.4905, lng: 88.3145, kind: 'Theme', knownFor: 'Acclaimed for emotive, art-driven concept pujas.' },
  { name: '66 Pally', area: 'Behala & South-West', lat: 22.4880, lng: 88.3160, kind: 'Theme', knownFor: 'Long Behala favourite with inventive annual themes.' },
];

export const PANDAL_AREAS: PandalArea[] = [
  'North Kolkata', 'Central Kolkata', 'South Kolkata', 'Salt Lake & North Fringe', 'Behala & South-West',
];

// Suggested pandal-hopping trails (real, geographically sensible groupings).
export interface PandalTrail { name: string; blurb: string; stops: string[]; }
export const PANDAL_TRAILS: PandalTrail[] = [
  {
    name: 'North Kolkata Heritage Trail',
    blurb: 'The old soul of the puja — bonedi households and century-old community pujas, walkable by tram/metro.',
    stops: ['Sovabazar Rajbari', 'Kumartuli Park', 'Bagbazar Sarbojanin', 'Ahiritola Sarbojanin', 'Hatibagan Sarbojanin'],
  },
  {
    name: 'South Kolkata Theme Trail',
    blurb: 'The award-winning art-pandal belt — start early evening and work south.',
    stops: ['Ekdalia Evergreen', 'Singhi Park', 'Maddox Square', 'Ballygunge Cultural Association', 'Deshapriya Park', 'Mudiali Club'],
  },
  {
    name: 'Salt Lake & Sreebhumi Night Trail',
    blurb: 'Spectacular replica sets best seen lit up at night — expect big crowds.',
    stops: ['Sreebhumi Sporting Club', 'Lake Town Adibasi Brindo', 'FD Block, Salt Lake'],
  },
];
