// categoryImage — picks a real, representative photo for a place/spot that has
// no individual photo of its own (parks, activities, food, stays, etc.).
//
// These are TYPE-representative stock photos (a lake photo for a lake, a temple
// photo for a temple) — NOT a claim to be the exact spot. They replace the flat
// gradient placeholders so cards look real and inviting, while staying honest:
// the card always shows the real name, type and district alongside.
//
// Every URL below was load-verified against Unsplash. They're keyed by a stable
// "category" and matched to an item via keywords in its name + type.

const CDN = (id: string) => `https://images.unsplash.com/${id}?w=800&q=70&auto=format&fit=crop`;

const IMG: Record<string, string> = {
  tea:        CDN('photo-1626621341517-bbf3d9990a23'),
  hills:      CDN('photo-1544016768-982d1554f0b9'),
  lake:       CDN('photo-1506905925346-21bda4d32df4'),
  waterfall:  CDN('photo-1432405972618-c60b0225b8f9'),
  forest:     CDN('photo-1441974231531-c6227db76b6e'),
  beach:      CDN('photo-1507525428034-b723cf961d3e'),
  temple:     CDN('photo-1466442929976-97f336a657be'),
  monastery:  CDN('photo-1605640840605-14ac1855827b'),
  palace:     CDN('photo-1599661046289-e31897846e41'),
  garden:     CDN('photo-1500382017468-9049fed747ef'),
  stadium:    CDN('photo-1577223625816-7546f13df25d'),
  market:     CDN('photo-1555939594-58d7cb561ad1'),
  food:       CDN('photo-1567188040759-fb8a883dc6d8'),
  hotel:      CDN('photo-1566073771259-6a8506099945'),
  restaurant: CDN('photo-1517248135467-4c7edcad34c4'),
  river:      CDN('photo-1558431382-27e303142255'),
  bridge:     CDN('photo-1558642084-fd07fae5282e'),
  dam:        CDN('photo-1466692476868-aef1dfb1e735'),
  village:    CDN('photo-1518457607834-6e8d80c183c5'),
  trek:       CDN('photo-1551632811-561732d1e306'),
};

// Ordered most-specific → least-specific. First keyword hit wins.
const RULES: Array<[RegExp, keyof typeof IMG]> = [
  [/\btea\b|estate/, 'tea'],
  [/monaster|gompa|buddhist|stupa|vihar/, 'monastery'],
  [/temple|mandir|kali|shiva|durga|math\b|ashram|dham|devi|thakur|kalibari|temple ruins/, 'temple'],
  [/palace|rajbari|fort|qila|garh|gah\b|zamindar|heritage|ruins|historic|hazarduari/, 'palace'],
  [/waterfall|falls|jharna|jhora/, 'waterfall'],
  [/dam\b|reservoir|barrage|canal/, 'dam'],
  [/lake|jheel|jhil|sagar|pukur|bandh|pond/, 'lake'],
  [/river|ghat|riverside|confluence|bhagirathi|hooghly|teesta|ganga|damodar/, 'river'],
  [/beach|sea\b|coast|samudra|marine|island/, 'beach'],
  [/forest|\bsal\b|jungle|sanctuary|wildlife|national park|reserve|grove|woods|bird/, 'forest'],
  [/garden|botanical|eco park|nature park|udyan|orchid|cactus/, 'garden'],
  [/stadium|sports|kridangan|krirangan|arena|ground|gymnasium|indoor|kohinoor|stadia/, 'stadium'],
  [/bridge|setu/, 'bridge'],
  [/trek|trail|hiking|\bhike\b|adventure|camping|rafting|paragliding/, 'trek'],
  [/resort|hotel|homestay|inn\b|lodge|guest|bungalow|cottage|retreat|tourism/, 'hotel'],
  [/restaurant|eatery|dhaba|cafe|kitchen|bhojanalay|food court|multi-cuisine/, 'restaurant'],
  [/market|bazaar|bazar|haat|\bhat\b|galli|khau|food row|food plaza|chowk|stand|stall|snack|street/, 'market'],
  [/sweet|mishti|confection|roll|chop|jhalmuri|telebhaja|cuisine|thali|dish|\bfood\b/, 'food'],
  [/hill|pahar|mountain|peak|viewpoint|view point|hillock|plateau|sunrise|tilla/, 'hills'],
  [/village|tribal|rural|gram\b|para\b/, 'village'],
];

const SECTION_FALLBACK: Record<string, keyof typeof IMG> = {
  parks: 'garden', activities: 'trek', foods: 'food',
  foodZones: 'market', stays: 'hotel', landmarks: 'palace', places: 'hills',
};

/** Returns a representative real photo URL for an item lacking its own image. */
export function categoryImage(name: string, section?: string, type?: string): string {
  const hay = `${name || ''} ${type || ''}`.toLowerCase();
  for (const [re, key] of RULES) {
    if (re.test(hay)) return IMG[key];
  }
  return IMG[SECTION_FALLBACK[section || ''] || 'hills'];
}
