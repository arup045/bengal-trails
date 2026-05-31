import {
  Mountain, Binoculars, Ship, Landmark, Waves, Trees, Palette, Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { placesData, type Place } from './places-full';

// ── Curated West Bengal itineraries ────────────────────────────────────────
// Ready-made trips built from REAL places already in the dataset. Every slug in
// `places` references an existing record. A traveller can open one and load it
// straight into the Trip Planner (which already rebuilds a trip from a list of
// day-by-day slugs via the ?t= share token).

export interface ItineraryDay {
  title: string;
  note?: string;
  places: string[]; // real place slugs
}

export interface Itinerary {
  id: string;
  title: string;
  region: string;
  bestTime: string;
  summary: string;
  icon: LucideIcon;
  highlights: string[];
  days: ItineraryDay[];
}

export const itineraries: Itinerary[] = [
  {
    id: 'darjeeling-hills-5-days',
    title: 'Darjeeling Hills in 5 Days',
    region: 'North Bengal',
    bestTime: 'Oct–Mar',
    icon: Mountain,
    summary: 'The classic Queen of the Hills circuit — Kanchenjunga sunrises, the toy train, tea gardens and a side trip to tranquil Mirik.',
    highlights: ['Tiger Hill sunrise', 'UNESCO toy train', 'Happy Valley tea', 'Mirik Lake'],
    days: [
      { title: 'Arrive & old Darjeeling', note: 'Settle in and stroll the Mall.', places: ['darjeeling', 'observatory-hill', 'darjeeling-mall', 'chowrasta-handicraft-market'] },
      { title: 'Sunrise & the toy train', note: 'Pre-dawn start for Tiger Hill.', places: ['tiger-hill', 'batasia-loop', 'ghum-monastery', 'darjeeling-himalayan-railway'] },
      { title: 'Tea, zoo & mountaineering', places: ['happy-valley-tea-estate', 'padmaja-naidu-zoo', 'hmi-darjeeling', 'rock-garden-ganga-maya'] },
      { title: 'Day trip to Mirik', places: ['mirik', 'mirik-lake', 'pashupati-market-mirik'] },
      { title: 'Eco villages & departure', places: ['lamahatta-eco-park', 'tinchuley'] },
    ],
  },
  {
    id: 'dooars-wildlife-4-days',
    title: 'Dooars Wildlife Safari — 4 Days',
    region: 'North Bengal',
    bestTime: 'Oct–Apr',
    icon: Binoculars,
    summary: 'Rhinos, elephants and birdsong across the Dooars — Gorumara and Jaldapara safaris with riverside forest stays.',
    highlights: ['One-horned rhino', 'Jeep safaris', 'Murti riverside', 'Buxa & Jayanti'],
    days: [
      { title: 'Gorumara & Murti', places: ['gorumara-national-park', 'murti-river'] },
      { title: 'Chapramari & Jaldhaka', places: ['chapramari-wildlife-sanctuary', 'jaldhaka'] },
      { title: 'Jaldapara rhino country', places: ['jaldapara-national-park', 'chilapata-forest'] },
      { title: 'Buxa & Jayanti', places: ['buxa-tiger-reserve', 'jayanti'] },
    ],
  },
  {
    id: 'kalimpong-eastern-hills-3-days',
    title: 'Kalimpong & the Eastern Hills — 3 Days',
    region: 'North Bengal',
    bestTime: 'Mar–Jun, Sep–Nov',
    icon: Mountain,
    summary: 'A quieter hill escape — monasteries and viewpoints in Kalimpong, then the misty pine hamlets of Lava and Lolegaon.',
    highlights: ['Durpin Monastery', 'Deolo Hill', 'Lava & Lolegaon', 'Canopy walk'],
    days: [
      { title: 'Kalimpong town', places: ['kalimpong', 'durpin-monastery', 'deolo-hill'] },
      { title: 'Heritage & gardens', places: ['dr-grahams-homes'] },
      { title: 'Lava & Lolegaon', places: ['lava', 'lolegaon'] },
    ],
  },
  {
    id: 'sundarbans-mangrove-2-days',
    title: 'Sundarbans Mangrove Trail — 2 Days',
    region: 'South Bengal',
    bestTime: 'Nov–Mar',
    icon: Ship,
    summary: 'A boat-safari weekend into the world’s largest mangrove delta — watchtowers, tidal creeks and Royal Bengal Tiger country.',
    highlights: ['Mangrove boat safari', 'Sajnekhali', 'Dobanki canopy walk', 'Tiger reserve'],
    days: [
      { title: 'Into the delta', note: 'Boat from Godkhali; afternoon safari.', places: ['sundarbans-national-park', 'sajnekhali-watchtower'] },
      { title: 'Watchtowers & canopy', places: ['sudhanyakhali-watchtower', 'dobanki-canopy-walk'] },
    ],
  },
  {
    id: 'kolkata-heritage-3-days',
    title: 'Kolkata Heritage & Culture — 3 Days',
    region: 'South Bengal',
    bestTime: 'Oct–Mar',
    icon: Landmark,
    summary: 'The City of Joy in three days — colonial landmarks, the idol-makers of Kumartuli, College Street and Park Street feasts.',
    highlights: ['Victoria Memorial', 'Kumartuli', 'College Street', 'Park Street food'],
    days: [
      { title: 'Colonial core', places: ['victoria-memorial-kolkata', 'indian-museum', 'maidan-kolkata', 'prinsep-ghat'] },
      { title: 'North Kolkata roots', places: ['kumartuli', 'jorasanko-thakur-bari', 'marble-palace', 'college-street'] },
      { title: 'Temples, markets & food', places: ['kalighat-kali-temple', 'new-market-kolkata', 'park-street-nightlife', 'kolkata-street-food'] },
    ],
  },
  {
    id: 'bengal-beaches-3-days',
    title: 'Bengal Beaches — 3 Days',
    region: 'South Bengal',
    bestTime: 'Oct–Mar',
    icon: Waves,
    summary: 'Bengal’s seaside in a long weekend — the buzz of Digha, the red crabs of Tajpur and the quiet sands of Mandarmani.',
    highlights: ['Digha promenade', 'Tajpur red crabs', 'Mandarmani drive-on beach', 'Fresh seafood'],
    days: [
      { title: 'Digha', places: ['digha', 'old-digha-beach', 'digha-marine-aquarium'] },
      { title: 'Tajpur & Shankarpur', places: ['tajpur', 'shankarpur-beach'] },
      { title: 'Mandarmani', places: ['mandarmani'] },
    ],
  },
  {
    id: 'temples-terracotta-4-days',
    title: 'Temples, Terracotta & Nawabs — 4 Days',
    region: 'Multi-region',
    bestTime: 'Oct–Mar',
    icon: Trees,
    summary: 'Bengal’s temple heartland — the terracotta masterpieces of Bishnupur and the Nawabi grandeur of Murshidabad.',
    highlights: ['Bishnupur terracotta', 'Baluchari weaving', 'Hazarduari Palace', 'Riverside ghats'],
    days: [
      { title: 'Bishnupur temples', places: ['bishnupur', 'bishnupur-rasmancha', 'jor-bangla-temple', 'shyam-rai-temple'] },
      { title: 'Crafts of Bishnupur', places: ['madan-mohan-temple', 'bishnupur-art-craft'] },
      { title: 'Nawabi Murshidabad', places: ['murshidabad', 'hazarduari-palace', 'nizamat-imambara', 'katra-mosque'] },
      { title: 'Gardens & tombs', places: ['kathgola-gardens', 'motijheel', 'khoshbagh-tombs'] },
    ],
  },
  {
    id: 'shantiniketan-birbhum-3-days',
    title: 'Shantiniketan & Birbhum — 3 Days',
    region: 'Central Bengal',
    bestTime: 'Oct–Mar',
    icon: Palette,
    summary: 'Tagore’s open-air world of learning and art, the Saturday forest haat, Baul song and the temple town of Tarapith.',
    highlights: ['Visva-Bharati', 'Sonajhuri haat', 'Kopai red earth', 'Tarapith'],
    days: [
      { title: 'Tagore’s Shantiniketan', places: ['shantiniketan', 'visva-bharati-campus', 'uttarayan-tagore-complex', 'kala-bhavana-art'] },
      { title: 'Haat, crafts & red earth', places: ['sonajhuri-haat', 'amar-kutir', 'kopai-river-red-earth'] },
      { title: 'Tarapith & hot springs', places: ['tarapith-temple', 'bakreshwar-hot-springs'] },
    ],
  },
  {
    id: 'purulia-wild-west-3-days',
    title: 'Purulia & the Wild West — 3 Days',
    region: 'South Bengal',
    bestTime: 'Oct–Feb',
    icon: Sparkles,
    summary: 'Bengal’s rugged west — the Ajodhya Hills, hidden waterfalls and the Chhau mask village of Charida.',
    highlights: ['Ajodhya Hills', 'Bamni Falls', 'Chhau masks', 'Joychandi Pahar'],
    days: [
      { title: 'Into the Ajodhya Hills', places: ['purulia', 'ajodhya-hills', 'upper-dam-ajodhya'] },
      { title: 'Falls & lakes', places: ['bamni-falls', 'marble-lake-ajodhya', 'muruguma-dam'] },
      { title: 'Chhau & Joychandi', places: ['charida-chhau-village', 'joychandi-pahar'] },
    ],
  },
];

const bySlug = new Map<string, Place>((placesData as Place[]).map((p) => [p.slug, p]));

export function getItinerary(id: string): Itinerary | undefined {
  return itineraries.find((i) => i.id === id);
}

/** Resolve an itinerary day's slugs to real Place records (skips any missing). */
export function placesForDay(day: ItineraryDay): Place[] {
  return day.places.map((s) => bySlug.get(s)).filter((p): p is Place => !!p);
}

/** Total real stops across all days. */
export function itineraryStops(it: Itinerary): number {
  return it.days.reduce((n, d) => n + placesForDay(d).length, 0);
}

/** A real cover photo, borrowed from the first place that has one. */
export function itineraryCover(it: Itinerary): string | undefined {
  for (const d of it.days) {
    for (const p of placesForDay(d)) {
      if (p.heroImage?.url) return p.heroImage.url;
    }
  }
  return undefined;
}

/** Build the Trip Planner deep-link that pre-loads this itinerary. Matches the
 *  planner's own ?t= token format: base64( JSON({ n: name, d: [[slug,…],…] }) ). */
export function plannerUrlForItinerary(it: Itinerary): string {
  const d = it.days.map((day) => placesForDay(day).map((p) => p.slug));
  const payload = { n: it.title, d };
  const token = encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(payload)))));
  return `/planner?t=${token}`;
}
