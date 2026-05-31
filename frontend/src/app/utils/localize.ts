// Content localisation helpers — overlay Bengali content on the English dataset
// when the user has switched the language to বাংলা. Everything degrades to
// English when a Bengali entry (or field) is missing, so partial coverage is fine.
import { placesBn } from '../data/i18n/placesBn';
import { districtsBn } from '../data/i18n/districtsBn';

type Lang = 'en' | 'bn' | 'hi';

/** Returns a localised copy of a place (title/excerpt/description) for the given
 *  language. Falls back field-by-field to the original English values. */
export function localizePlace<T extends { slug?: string; title?: string; excerpt?: string; description?: string }>(
  place: T | null | undefined,
  language: Lang,
): T | null | undefined {
  if (!place || language !== 'bn' || !place.slug) return place;
  const bn = placesBn[place.slug];
  if (!bn) return place;
  return {
    ...place,
    title: bn.title || place.title,
    excerpt: bn.excerpt || place.excerpt,
    description: bn.description || place.description,
  };
}

/** Localised district "about" text (or the English fallback). */
export function localizeDistrictAbout(slug: string, fallback: string | undefined, language: Lang): string | undefined {
  if (language === 'bn') return districtsBn[slug]?.about || fallback;
  return fallback;
}

/** Localised district display name (or the English fallback). */
export function localizeDistrictName(slug: string, fallback: string, language: Lang): string {
  if (language === 'bn') return districtsBn[slug]?.name || fallback;
  return fallback;
}
