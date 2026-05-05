/**
 * SEARCH ENGINE FOR WEST BENGAL TOURISM
 * Full-text search with ranking
 */

import { placesData } from "../../../data/places-full.ts";

interface SearchResult {
  type: 'place' | 'district' | 'category';
  id: string;
  name: string;
  slug: string;
  description?: string;
  category?: string;
  region?: string;
  score: number;
  matchedFields: string[];
}

/**
 * Calculate string similarity score (0-1)
 */
function calculateSimilarity(str1: string, str2: string): number {
  str1 = str1.toLowerCase();
  str2 = str2.toLowerCase();

  // Exact match
  if (str1 === str2) return 1.0;

  // Contains match
  if (str1.includes(str2) || str2.includes(str1)) return 0.8;

  // Word match
  const words1 = str1.split(/\s+/);
  const words2 = str2.split(/\s+/);
  
  let matchCount = 0;
  for (const word1 of words1) {
    for (const word2 of words2) {
      if (word1 === word2 || word1.includes(word2) || word2.includes(word1)) {
        matchCount++;
        break;
      }
    }
  }

  const maxWords = Math.max(words1.length, words2.length);
  return matchCount / maxWords * 0.6;
}

/**
 * Search places with full-text search
 */
export function searchPlaces(query: string, options: {
  limit?: number;
  category?: string;
  region?: string;
  minRating?: number;
} = {}): SearchResult[] {
  const {
    limit = 20,
    category,
    region,
    minRating
  } = options;

  if (!query || query.trim().length < 2) {
    return [];
  }

  const searchTerm = query.trim().toLowerCase();
  const results: SearchResult[] = [];

  // Search in places
  for (const place of placesData) {
    // Apply filters
    if (category && place.category !== category) continue;
    if (region && place.region !== region) continue;
    if (minRating && place.rating < minRating) continue;

    const matchedFields: string[] = [];
    let score = 0;

    // Search in name (highest weight)
    const nameScore = calculateSimilarity(place.name, searchTerm);
    if (nameScore > 0.3) {
      score += nameScore * 5;
      matchedFields.push('name');
    }

    // Search in description
    const descScore = calculateSimilarity(place.description, searchTerm);
    if (descScore > 0.2) {
      score += descScore * 3;
      matchedFields.push('description');
    }

    // Search in category
    const catScore = calculateSimilarity(place.category, searchTerm);
    if (catScore > 0.5) {
      score += catScore * 2;
      matchedFields.push('category');
    }

    // Search in region
    const regionScore = calculateSimilarity(place.region, searchTerm);
    if (regionScore > 0.5) {
      score += regionScore * 2;
      matchedFields.push('region');
    }

    // Search in best time
    if (place.bestTime && place.bestTime.toLowerCase().includes(searchTerm)) {
      score += 1;
      matchedFields.push('bestTime');
    }

    // Add result if score is above threshold
    if (score > 0.5) {
      results.push({
        type: 'place',
        id: place.slug,
        name: place.name,
        slug: place.slug,
        description: place.description,
        category: place.category,
        region: place.region,
        score,
        matchedFields
      });
    }
  }

  // Sort by score (highest first)
  results.sort((a, b) => b.score - a.score);

  // Limit results
  return results.slice(0, limit);
}

/**
 * Get search suggestions (autocomplete)
 */
export function getSearchSuggestions(query: string, limit: number = 10): string[] {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const searchTerm = query.trim().toLowerCase();
  const suggestions = new Set<string>();

  // Get place names that match
  for (const place of placesData) {
    if (place.name.toLowerCase().includes(searchTerm)) {
      suggestions.add(place.name);
    }
    
    if (suggestions.size >= limit) break;
  }

  // Get unique categories
  const categories = [...new Set(placesData.map(p => p.category))];
  for (const cat of categories) {
    if (cat.toLowerCase().includes(searchTerm)) {
      suggestions.add(cat);
    }
  }

  // Get unique regions
  const regions = [...new Set(placesData.map(p => p.region))];
  for (const region of regions) {
    if (region.toLowerCase().includes(searchTerm)) {
      suggestions.add(region);
    }
  }

  return Array.from(suggestions).slice(0, limit);
}

/**
 * Get popular searches (mock for now, can be tracked in KV store)
 */
export function getPopularSearches(limit: number = 10): string[] {
  return [
    'Darjeeling',
    'Sundarbans',
    'Hill Stations',
    'Beach',
    'Heritage',
    'Wildlife',
    'Tea Gardens',
    'Kolkata',
    'Adventure',
    'Nature'
  ].slice(0, limit);
}

/**
 * Get search statistics
 */
export function getSearchStats() {
  const totalPlaces = placesData.length;
  const categoryCounts: Record<string, number> = {};
  const regionCounts: Record<string, number> = {};

  for (const place of placesData) {
    // Count by category
    categoryCounts[place.category] = (categoryCounts[place.category] || 0) + 1;
    
    // Count by region
    regionCounts[place.region] = (regionCounts[place.region] || 0) + 1;
  }

  return {
    totalPlaces,
    categoryCounts,
    regionCounts,
    averageRating: placesData.reduce((sum, p) => sum + p.rating, 0) / totalPlaces
  };
}
