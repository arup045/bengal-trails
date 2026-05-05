import { motion } from 'motion/react';
import { Cloud, Sun, CloudRain, Wind, Droplets, CloudSnow } from 'lucide-react';

interface WeatherWidgetProps {
  destination: string;
  region: string;
  bestTime: string;
}

export function WeatherWidget({ destination, region, bestTime }: WeatherWidgetProps) {
  // Mock weather data based on region and season
  const getWeatherInfo = () => {
    const month = new Date().getMonth(); // 0-11
    
    // North Bengal (cooler)
    if (region === 'North Bengal') {
      if (month >= 10 || month <= 2) { // Nov-Feb (Winter)
        return {
          temp: '8-15°C',
          condition: 'Cool & Pleasant',
          icon: Cloud,
          humidity: '65%',
          wind: '15 km/h',
          description: 'Perfect weather for sightseeing',
          color: 'from-blue-400 to-blue-600'
        };
      } else if (month >= 6 && month <= 9) { // Jul-Oct (Monsoon)
        return {
          temp: '18-22°C',
          condition: 'Rainy',
          icon: CloudRain,
          humidity: '85%',
          wind: '12 km/h',
          description: 'Lush green scenery, carry umbrella',
          color: 'from-gray-400 to-gray-600'
        };
      } else { // Mar-Jun (Spring/Summer)
        return {
          temp: '15-25°C',
          condition: 'Pleasant',
          icon: Sun,
          humidity: '60%',
          wind: '10 km/h',
          description: 'Ideal for outdoor activities',
          color: 'from-yellow-400 to-orange-500'
        };
      }
    }
    
    // South Bengal (warmer)
    else {
      if (month >= 10 || month <= 2) { // Nov-Feb (Winter)
        return {
          temp: '15-25°C',
          condition: 'Pleasant',
          icon: Sun,
          humidity: '55%',
          wind: '12 km/h',
          description: 'Comfortable weather for exploring',
          color: 'from-yellow-400 to-orange-500'
        };
      } else if (month >= 6 && month <= 9) { // Jul-Oct (Monsoon)
        return {
          temp: '25-30°C',
          condition: 'Humid & Rainy',
          icon: CloudRain,
          humidity: '80%',
          wind: '15 km/h',
          description: 'Monsoon season, expect rain',
          color: 'from-gray-400 to-gray-600'
        };
      } else { // Mar-Jun (Summer)
        return {
          temp: '28-38°C',
          condition: 'Hot & Humid',
          icon: Sun,
          humidity: '70%',
          wind: '18 km/h',
          description: 'Carry light clothing and stay hydrated',
          color: 'from-orange-400 to-red-500'
        };
      }
    }
  };

  const weather = getWeatherInfo();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-gradient-to-br ${weather.color} rounded-2xl p-6 text-white shadow-xl`}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-white/90 text-sm mb-1">Current Weather</p>
          <h3 className="text-2xl">{destination}</h3>
        </div>
        <weather.icon className="w-12 h-12 text-white/90" />
      </div>

      <div className="mb-4">
        <div className="text-4xl mb-1">{weather.temp}</div>
        <div className="text-lg text-white/90">{weather.condition}</div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4" />
          <span>Humidity: {weather.humidity}</span>
        </div>
        <div className="flex items-center gap-2">
          <Wind className="w-4 h-4" />
          <span>Wind: {weather.wind}</span>
        </div>
      </div>

      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 mb-4">
        <p className="text-sm text-white/95">{weather.description}</p>
      </div>

      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
        <p className="text-xs text-white/80 mb-1">Best Time to Visit</p>
        <p className="text-sm">{bestTime}</p>
      </div>
    </motion.div>
  );
}
