import { useEffect, useState } from 'react';
import { API_BASE } from '../utils/api';

async function fetchJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    const res = await fetch(`${API_BASE}${path}`, { signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

interface Festival {
  id: string;
  slug: string;
  name: string;
  bengaliName?: string;
  description: string;
  months: number[];
  duration: string;
  significance: string;
  locations: string[];
  typicalDates: string;
  image: string;
  vibe: string;
  musttry?: string[];
}

interface Dish {
  id: string;
  slug?: string;
  name: string;
  bengaliName?: string;
  description: string;
  category: string;
  type?: string;
  origin?: string;
  spiceLevel?: string;
  priceRange?: string;
  whereToTry?: string[];
  image?: string;
}

interface FoodStreet {
  name: string;
  city: string;
  specialty: string;
  mustEat: string[];
}

interface TransportOption {
  mode: string;
  title: string;
  details: string;
  duration: string;
  cost: string;
  tip?: string;
}

interface TransportGuide {
  destinationSlug: string;
  fromCity: string;
  distance: string;
  options: TransportOption[];
  bestSeason?: string;
  avoidSeason?: string;
}

interface Hotel {
  destinationSlug: string;
  name: string;
  type: string;
  priceRange: string;
  priceCategory: 'budget' | 'mid' | 'premium';
  rating: number;
  address: string;
  highlights: string[];
  image?: string;
  bookingNote?: string;
}

interface Subplace {
  parentSlug: string;
  name: string;
  distance: string;
  type: string;
  description: string;
  image?: string;
  bestTime?: string;
  tip?: string;
}

export function useFestivals() {
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchJson<{ festivals: Festival[] }>(`/bengal/festivals`, { festivals: [] })
      .then((d) => setFestivals(d.festivals || []))
      .finally(() => setLoading(false));
  }, []);
  return { festivals, loading };
}

export function useFood() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [streets, setStreets] = useState<FoodStreet[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([
      fetchJson<{ food: Dish[] }>('/bengal/food', { food: [] }),
      fetchJson<{ streets: FoodStreet[] }>('/bengal/food/streets', { streets: [] }),
    ])
      .then(([f, s]) => {
        setDishes(f.food || []);
        setStreets(s.streets || []);
      })
      .finally(() => setLoading(false));
  }, []);
  return { dishes, streets, loading };
}

export function useDestinationContext(slug: string) {
  const [data, setData] = useState<{
    transport: TransportGuide | null;
    hotels: Hotel[];
    subplaces: Subplace[];
  }>({ transport: null, hotels: [], subplaces: [] });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!slug) { setLoading(false); return; }
    fetchJson(`/bengal/destination-context/${slug}`, {
      transport: null, hotels: [], subplaces: [],
    })
      .then((d: any) => setData(d))
      .finally(() => setLoading(false));
  }, [slug]);
  return { ...data, loading };
}

export type { Festival, Dish, FoodStreet, TransportGuide, Hotel, Subplace };
