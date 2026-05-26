// ── Seasonal / festival accent ──────────────────────────────────────────────
// A subtle, truthful seasonal touch: West Bengal's signature festival for the
// current month drives a gentle accent + greeting. These are real festival
// *windows* (the festivals genuinely fall in these months) — no fabricated
// exact dates or numbers. Exact day-level dates live in the Festival Calendar.

export interface Season {
  id: string;
  label: string;     // short season name, e.g. "Durga Pujo season"
  emoji: string;
  note: string;      // one warm line
  gradient: string;  // tailwind gradient classes for the accent ribbon
}

// Keyed by month number (1 = Jan … 12 = Dec). Picks the most iconic festival.
const SEASONS: Record<number, Season> = {
  1:  { id: 'poush',      label: 'Poush Parbon & Gangasagar',  emoji: '🪔', note: 'Harvest sweets and the great Gangasagar Mela.',         gradient: 'from-amber-500/15 to-orange-500/15' },
  2:  { id: 'saraswati',  label: 'Saraswati Pujo',             emoji: '📖', note: 'Spring of learning — yellow saris and pushpanjali.',     gradient: 'from-yellow-400/15 to-amber-500/15' },
  3:  { id: 'dol',        label: 'Dol & Basanta Utsav',        emoji: '🎨', note: 'Colours of spring, loudest at Shantiniketan.',           gradient: 'from-fuchsia-500/15 to-pink-500/15' },
  4:  { id: 'poila',      label: 'Poila Boishakh',             emoji: '🎉', note: 'Shubho Nabo Barsho — the Bengali New Year.',             gradient: 'from-rose-500/15 to-amber-500/15' },
  5:  { id: 'rabindra',   label: 'Rabindra Jayanti',           emoji: '🕊️', note: "Celebrating Tagore — songs, poetry and Boishakh heat.", gradient: 'from-indigo-500/15 to-purple-500/15' },
  6:  { id: 'rath',       label: 'Rath Yatra',                 emoji: '🛕', note: 'The chariot festival rolls through Bengal.',             gradient: 'from-emerald-500/15 to-teal-500/15' },
  7:  { id: 'monsoon',    label: 'Monsoon & Rath Yatra',       emoji: '🌧️', note: 'Lush green hills and the chariot festival.',            gradient: 'from-sky-500/15 to-emerald-500/15' },
  8:  { id: 'jhulan',     label: 'Jhulan & Independence',      emoji: '🇮🇳', note: 'Swing festival and the spirit of August.',               gradient: 'from-emerald-500/15 to-sky-500/15' },
  9:  { id: 'durga-pre',  label: 'Durga Pujo is near',         emoji: '🥁', note: 'The city stirs — pandals rise across Bengal.',           gradient: 'from-rose-500/20 to-orange-500/20' },
  10: { id: 'durga',      label: 'Durga Pujo season',          emoji: '🪷', note: 'Bengal’s biggest festival — pandals, dhak and lights.',  gradient: 'from-rose-500/20 to-amber-500/20' },
  11: { id: 'kali',       label: 'Kali Pujo & Diwali',         emoji: '🪔', note: 'A festival of lights across West Bengal.',                gradient: 'from-amber-500/20 to-fuchsia-500/15' },
  12: { id: 'poush-mela', label: 'Poush Mela & winter',        emoji: '🎪', note: 'Crisp winter, Poush Mela and hill getaways.',            gradient: 'from-sky-500/15 to-indigo-500/15' },
};

export function getActiveSeason(now: Date = new Date()): Season | null {
  return SEASONS[now.getMonth() + 1] || null;
}
