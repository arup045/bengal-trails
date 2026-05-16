import { useState } from 'react';
import { motion } from 'motion/react';
import { Cloud, CloudRain, Sun, Wind, Droplets, ThermometerSun, MapPin, Calendar } from 'lucide-react';
import { placesData } from '../data/places-full';

export function WeatherRecommendations() {
  const [selectedSeason, setSelectedSeason] = useState('current');

  // Mock weather data for different regions
  const weatherData = [
    {
      region: 'Darjeeling & Hills',
      current: { temp: 12, condition: 'Pleasant', humidity: 65, wind: 15, icon: Cloud, rain: 10 },
      forecast: 'Perfect trekking weather',
    },
    {
      region: 'Kolkata & Plains',
      current: { temp: 28, condition: 'Warm', humidity: 75, wind: 10, icon: Sun, rain: 5 },
      forecast: 'Great for city exploration',
    },
    {
      region: 'Sundarbans',
      current: { temp: 26, condition: 'Humid', humidity: 85, wind: 12, icon: CloudRain, rain: 30 },
      forecast: 'Ideal for wildlife spotting',
    },
    {
      region: 'Digha & Coastal',
      current: { temp: 25, condition: 'Breezy', humidity: 80, wind: 20, icon: Wind, rain: 15 },
      forecast: 'Perfect beach weather',
    },
  ];

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
            Find the best destinations based on current weather and seasons
          </p>
        </motion.div>

        {/* Current Weather Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {weatherData.map((data, index) => (
            <motion.div
              key={data.region}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-3xl p-6 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">{data.region}</h3>
                <data.current.icon className="w-8 h-8 text-blue-500" />
              </div>

              <div className="mb-4">
                <div className="text-5xl font-bold text-gray-900 mb-1">{data.current.temp}°C</div>
                <div className="text-gray-600">{data.current.condition}</div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-600">
                    <Droplets className="w-4 h-4" />
                    Humidity
                  </span>
                  <span className="font-semibold">{data.current.humidity}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-600">
                    <Wind className="w-4 h-4" />
                    Wind
                  </span>
                  <span className="font-semibold">{data.current.wind} km/h</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-600">
                    <CloudRain className="w-4 h-4" />
                    Rain Chance
                  </span>
                  <span className="font-semibold">{data.current.rain}%</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm text-blue-600 font-semibold">{data.forecast}</p>
              </div>
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
                href={`#/place/${place.slug}`}
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
