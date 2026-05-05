import { motion } from 'motion/react';
import { Train, Bus, Plane, Car, Ship, MapPin } from 'lucide-react';

interface TransportationGuideProps {
  destination: string;
  district: string;
  region: string;
}

export function TransportationGuide({ destination, district, region }: TransportationGuideProps) {
  // Transportation modes based on region
  const getTransportOptions = () => {
    const options = [];

    // All regions have trains
    options.push({
      icon: Train,
      title: 'By Train',
      description: `Major trains connect to ${district} from Kolkata and other cities. Nearest railway stations available.`,
      color: 'text-blue-600 bg-blue-50',
      tips: [
        'Book tickets in advance during peak season',
        'Consider Tatkal booking for last-minute plans',
        'Check train schedules on Indian Railways website'
      ]
    });

    // All regions have buses
    options.push({
      icon: Bus,
      title: 'By Bus',
      description: `Regular bus services from major cities. Government and private buses available to ${district}.`,
      color: 'text-green-600 bg-green-50',
      tips: [
        'WBTC (West Bengal Transport Corporation) operates regular services',
        'Private Volvo buses available for comfort',
        'Book online or at bus stands'
      ]
    });

    // Darjeeling, Kalimpong, Dooars have nearest airports
    if (region === 'North Bengal') {
      options.push({
        icon: Plane,
        title: 'By Air',
        description: `Nearest airport: Bagdogra Airport (IXB), ~70km from ${destination}. Regular flights from major cities.`,
        color: 'text-purple-600 bg-purple-50',
        tips: [
          'Book flights to Bagdogra (IXB)',
          'Pre-arrange taxi/car from airport',
          'Flight time: 2hrs from Delhi, 2.5hrs from Mumbai'
        ]
      });
    }

    // Kolkata and nearby regions have airport
    if (region === 'South Bengal' || district === 'Kolkata' || district === 'Howrah') {
      options.push({
        icon: Plane,
        title: 'By Air',
        description: `Netaji Subhas Chandra Bose International Airport (CCU) connects to all major Indian cities and international destinations.`,
        color: 'text-purple-600 bg-purple-50',
        tips: [
          'Well-connected to all major cities',
          'Metro available from airport to city',
          'Pre-paid taxis and app cabs available'
        ]
      });
    }

    // Sundarbans has boat services
    if (destination.toLowerCase().includes('sundarban')) {
      options.push({
        icon: Ship,
        title: 'By Boat',
        description: `Boat services from Godkhali, Sonakhali, and Namkhana. Essential for Sundarbans exploration.`,
        color: 'text-teal-600 bg-teal-50',
        tips: [
          'Book boat tours through authorized operators',
          'Life jackets mandatory',
          'Carry waterproof bags for belongings'
        ]
      });
    }

    // Everyone has car/taxi option
    options.push({
      icon: Car,
      title: 'By Car/Taxi',
      description: `Self-drive or hire taxi from Kolkata or nearby cities. Scenic routes with good road conditions.`,
      color: 'text-orange-600 bg-orange-50',
      tips: [
        'Roads generally well-maintained',
        'GPS recommended for navigation',
        'Local taxi services available at stations'
      ]
    });

    return options;
  };

  const transportOptions = getTransportOptions();

  return (
    <div className="space-y-6">
      <h3 className="text-2xl flex items-center gap-3">
        <MapPin className="w-6 h-6 text-purple-600" />
        How to Reach {destination}
      </h3>

      <div className="grid md:grid-cols-2 gap-6">
        {transportOptions.map((option, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all border border-gray-100"
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-full ${option.color} flex items-center justify-center flex-shrink-0`}>
                <option.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg mb-2">{option.title}</h4>
                <p className="text-gray-600 text-sm mb-4">{option.description}</p>
                <div className="space-y-2">
                  {option.tips.map((tip, tipIndex) => (
                    <div key={tipIndex} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-gray-700">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Local Transportation */}
      <div className="bg-gradient-to-br from-purple-50 to-orange-50 rounded-xl p-6">
        <h4 className="text-lg mb-4 flex items-center gap-2">
          <Car className="w-5 h-5 text-purple-600" />
          Local Transportation
        </h4>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-purple-600 mb-1">🚕 Taxi Services</p>
            <p className="text-gray-700">Local taxis, Uber, Ola available</p>
          </div>
          <div>
            <p className="text-purple-600 mb-1">🚲 Bike Rentals</p>
            <p className="text-gray-700">Two-wheelers available for hire</p>
          </div>
          <div>
            <p className="text-purple-600 mb-1">🚌 Local Buses</p>
            <p className="text-gray-700">Affordable public transport</p>
          </div>
        </div>
      </div>
    </div>
  );
}
