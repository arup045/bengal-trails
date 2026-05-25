import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Cloud, CloudRain, Sun, Wind, Droplets, MapPin, Loader2 } from 'lucide-react';
import { placesData } from '../data/places-full';

// Real regions with coordinates — weather is fetched live from Open-Meteo
// (same free, key-less source as the LiveWeather widget). No hardcoded numbers.
const REGIONS = [
  { region: 'Darjeeling & Hills', lat: 27.0360, lon: 88.2627, note: 'Hills & tea gardens' },
  { region: 'Kolkata & Plains',   lat: 22.5726, lon: 88.3639, note: 'City & heritage' },
  { region: 'Sundarbans',         lat: 21.9497, lon: 88.9100, note: 'Mangroves & wildlife' },
  { region: 'Digha & Coastal',    lat: 21.6276, lon: 87.5089, note: 'Beaches & coast' },
];

interface RegionWeather {
  region: string;
  note: string;
  temp: number | null;
  condition: string;
  humidity: number | null;
  wind: number | null;
  rain: number | null;
  Icon: typeof Cloud;
  loading: boolean;
}

// WMO weather code → condition label + icon (subset of LiveWeather's mapping).
function codeToDisplay(code: number, isDay: 0 | 1): { condition: string; Icon: typeof Cloud } {
  if (code === 0) return { condition: isDay ? 'Clear' : 'Clear Night', Icon: Sun };
  if (code <= 2) return { condition: 'Partly Cloudy', Icon: Cloud };
  if (code === 3) return { condition: 'Overcast', Icon: Cloud };
  if (code >= 45 && code <= 48) return { condition: 'Foggy', Icon: Cloud };
  if (code >= 51 && code <= 67) return { condition: 'Rainy', Icon: CloudRain };
  if (code >= 71 && code <= 77) return { condition: 'Snowing', Icon: CloudRain };
  if (code >= 80 && code <= 82) return { condition: 'Rain Showers', Icon: CloudRain };
  if (code >= 95) return { condition: 'Thunderstorm', Icon: CloudRain };
  return { condition: 'Cloudy', Icon: Cloud };
}

export function WeatherRecommendations() {
  const [selectedSeason, setSelectedSeason] = useState('current');
  const [weather, setWeather] = useState<RegionWeather[]>(
    REGIONS.map(r => ({ region: r.region, note: r.note, temp: null, condition: '', humidity: null, wind: null, rain: null, Icon: Cloud, loading: true })),
  );

  // Fetch real current weather for all four regions in parallel.
  useEffect(() => {
    let cancelled = false;
    Promise.all(REGIONS.map(async (r) => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${r.lat}&longitude=${r.lon}` +
          `&current_weather=true&hourly=relativehumidity_2m,precipitation_probability&timezone=auto`,
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const cw = json.current_weather;
        const { condition, Icon } = codeToDisplay(cw?.weathercode ?? 3, cw?.is_day ?? 1);
        // Read humidity + rain chance for the current hour.
        let humidity: number | null = null, rain: number | null = null;
        const nowHour = (cw?.time || '').slice(0, 13);
        const idx = json.hourly?.time?.findIndex((t: string) => t.startsWith(nowHour)) ?? -1;
        if (idx >= 0) {
          humidity = Math.round(json.hourly.relativehumidity_2m?.[idx] ?? NaN);
          rain     = Math.round(json.hourly.precipitation_probability?.[idx] ?? NaN);
          if (Number.isNaN(humidity)) humidity = null;
          if (Number.isNaN(rain)) rain = null;
        }
        return {
          region: r.region, note: r.note,
          temp: cw ? Math.round(cw.temperature) : null,
          condition, humidity, wind: cw ? Math.round(cw.windspeed) : null, rain, Icon, loading: false,
        } as RegionWeather;
      } catch {
        return { region: r.region, note: r.note, temp: null, condition: 'Unavailable', humidity: null, wind: null, rain: null, Icon: Cloud, loading: false } as RegionWeather;
      }
    })).then((results) => { if (!cancelled) setWeather(results); });
    return () => { cancelled = true; };
  }, []);

  const seasons = [
    { id: 'current', name: 'This Week', icon: '📅' },
    { id: 'summer', name: 'Summer', icon: '☀️', months: 'Mar-Jun' },
    { id: 'monsoon', name: 'Monsoon', icon: '🌧️', months: 'Jul-Sep' },
    { id: 'autumn', name: 'Autumn', icon: '🍂', months: 'Oct-Nov' },
    { id: 'winter', name: 'Winter', icon: '❄️', months: 'Dec-Feb' },
  ];

  const getSeasonalRecommendations = (season: string) => {
    switch (season) {
      case 'summer':
        return placesData.filter(p => p.region === 'North Bengal' || p.category === 'Hill Station').slice(0, 6);
      case 'monsoon':
        return placesData.filter(p => p.category === 'Nature' || p.category === 'Wildlife').slice(0, 6);
      case 'winter':
        return placesData.filter(p => p.region === 'South Bengal' || p.category === 'Beach').slice(0, 6);
      case 'autumn':
        return placesData.filter(p => p.category === 'Heritage' || p.category === 'Cultural').slice(0, 6);
      default:
        return placesData.slice(0, 6);
    }
  };

  const recommendations = getSeasonalRecommendations(selectedSeason);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Weather & Season Guide</h1>
          <p className="text-xl text-gray-600">
            Live weather across West Bengal, plus the best destinations for each season
          </p>
        </motion.div>

        {/* Current Weather Cards — real data from Open-Meteo */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {weather.map((data, index) => (
            <motion.div
              key={data.region}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-3xl p-6 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">{data.region}</h3>
                <data.Icon className="w-8 h-8 text-blue-500" />
              </div>

              {data.loading ? (
                <div className="flex items-center gap-2 text-gray-400 py-6">
                  <Loader2 className="w-5 h-5 animate-spin" /> Loading live weather…
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <div className="text-5xl font-bold text-gray-900 mb-1">
                      {data.temp != null ? `${data.temp}°C` : '—'}
                    </div>
                    <div className="text-gray-600">{data.condition || data.note}</div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {data.humidity != null && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-gray-600"><Droplets className="w-4 h-4" /> Humidity</span>
                        <span className="font-semibold">{data.humidity}%</span>
                      </div>
                    )}
                    {data.wind != null && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-gray-600"><Wind className="w-4 h-4" /> Wind</span>
                        <span className="font-semibold">{data.wind} km/h</span>
                      </div>
                    )}
                    {data.rain != null && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-gray-600"><CloudRain className="w-4 h-4" /> Rain Chance</span>
                        <span className="font-semibold">{data.rain}%</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-sm text-blue-600 font-semibold">{data.note}</p>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </div>

        {/* Season Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-lg mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Best Time to Visit</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {seasons.map((season) => (
              <button
                key={season.id}
                onClick={() => setSelectedSeason(season.id)}
                className={`p-4 rounded-2xl border-2 transition-all ${
                  selectedSeason === season.id
                    ? 'border-blue-600 bg-blue-50 shadow-lg'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="text-4xl mb-2">{season.icon}</div>
                <div className="font-bold text-gray-900">{season.name}</div>
                {season.months && <div className="text-xs text-gray-600 mt-1">{season.months}</div>}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Recommendations */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            {selectedSeason === 'current' ? 'Perfect for This Week' : `Best for ${seasons.find(s => s.id === selectedSeason)?.name}`}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((place, index) => (
              <motion.a
                key={place.slug}
                href={`/explore/${place.slug}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all group"
              >
                <div className="relative h-48">
                  <img
                    src={place.heroImage.url}
                    alt={place.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-semibold">
                    {place.bestTime}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {place.title}
                  </h3>
                  <div className="flex items-center gap-2 text-gray-600 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{place.district}</span>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2">{place.description}</p>
                </div>
              </motion.a>
            ))}
          </div>
        </div>

        {/* Weather Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white"
        >
          <h3 className="text-2xl font-bold mb-4">🌤️ Weather Travel Tips</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">☀️</span>
              <div>
                <div className="font-semibold mb-1">Summer (March-June)</div>
                <p className="text-sm opacity-90">Head to hill stations like Darjeeling. Carry sunscreen and light cotton clothes.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🌧️</span>
              <div>
                <div className="font-semibold mb-1">Monsoon (July-September)</div>
                <p className="text-sm opacity-90">Best for Sundarbans. Carry raincoats and waterproof bags.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🍂</span>
              <div>
                <div className="font-semibold mb-1">Autumn (October-November)</div>
                <p className="text-sm opacity-90">Festival season! Perfect weather everywhere. Book accommodations early.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">❄️</span>
              <div>
                <div className="font-semibold mb-1">Winter (December-February)</div>
                <p className="text-sm opacity-90">Ideal for heritage sites and beaches. Pack warm clothes for mornings.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
