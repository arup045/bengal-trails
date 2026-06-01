// Single source of truth for the content counts shown in copy / SEO meta.
//
// These are PLAIN constants on purpose — NOT derived by importing places-full.ts
// — because App.tsx deliberately lazy-loads that ~490 KB dataset, and importing
// it here would pull it into the initial bundle. Bump these when the data grows.
//
// (Previously these numbers were hardcoded inconsistently across ~8 files,
// ranging 97–232; this centralises them so they agree and don't go stale.)

export const PLACE_COUNT = 264;       // places in places-full.ts
export const DISTRICT_COUNT = 23;     // West Bengal districts covered

// Marketing-friendly, rounded-down and conservative so it stays true as the
// dataset grows without needing copy edits.
export const PLACE_COUNT_LABEL = '250+';
