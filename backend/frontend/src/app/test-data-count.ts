import { placesData } from './data/places-full';

console.log('Total destinations:', placesData.length);

// Check for duplicates
const slugs = placesData.map(p => p.slug);
const uniqueSlugs = new Set(slugs);
console.log('Unique slugs:', uniqueSlugs.size);

if (slugs.length !== uniqueSlugs.size) {
  console.log('WARNING: Duplicate slugs found!');
  const duplicates = slugs.filter((item, index) => slugs.indexOf(item) !== index);
  console.log('Duplicates:', duplicates);
}

// Check for missing required fields
placesData.forEach((place, index) => {
  if (!place.title) console.log(`Missing title at index ${index}`);
  if (!place.slug) console.log(`Missing slug at index ${index}`);
  if (!place.region) console.log(`Missing region at index ${index}`);
  if (!place.heroImage?.url) console.log(`Missing heroImage.url at index ${index}`, place.title);
  if (!place.excerpt) console.log(`Missing excerpt at index ${index}`, place.title);
});

console.log('\nLast 5 destinations:');
placesData.slice(-5).forEach((p, i) => {
  console.log(`${placesData.length - 5 + i + 1}. ${p.title} (${p.region})`);
});
