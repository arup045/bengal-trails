import { motion } from 'motion/react';
import { Phone, AlertCircle, Hospital, Shield, MapPin } from 'lucide-react';

export function EmergencyInfo() {
  const emergencyContacts = [
    {
      title: 'Tourist Police',
      number: '1363',
      icon: Shield,
      description: '24/7 Tourist helpline',
      color: 'text-blue-600 bg-blue-50'
    },
    {
      title: 'Emergency',
      number: '112',
      icon: AlertCircle,
      description: 'All emergency services',
      color: 'text-red-600 bg-red-50'
    },
    {
      title: 'Ambulance',
      number: '102',
      icon: Hospital,
      description: 'Medical emergencies',
      color: 'text-green-600 bg-green-50'
    },
    {
      title: 'Police',
      number: '100',
      icon: Phone,
      description: 'Police assistance',
      color: 'text-purple-600 bg-purple-50'
    }
  ];

  const safetyTips = [
    'Always carry a copy of your ID and hotel address',
    'Keep emergency contacts saved in your phone',
    'Be cautious of pickpockets in crowded tourist areas',
    'Use registered taxis or ride-sharing apps',
    'Drink only bottled or purified water',
    'Respect local customs and dress modestly at religious sites',
    'Keep valuables in hotel safe',
    'Inform someone about your daily itinerary'
  ];

  return (
    <div className="bg-gradient-to-br from-orange-50 to-purple-50 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full mb-4">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">Important Information</span>
          </div>
          <h2 className="text-4xl mb-4">Emergency Contacts & Safety</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Your safety is our priority. Keep these emergency numbers handy during your West Bengal travels.
          </p>
        </motion.div>

        {/* Emergency Contacts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {emergencyContacts.map((contact, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
            >
              <div className={`w-14 h-14 rounded-full ${contact.color} flex items-center justify-center mb-4`}>
                <contact.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl mb-2">{contact.title}</h3>
              <a 
                href={`tel:${contact.number}`}
                className="text-3xl text-purple-600 hover:text-purple-700 transition-colors block mb-2"
              >
                {contact.number}
              </a>
              <p className="text-gray-600 text-sm">{contact.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Safety Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl p-8 shadow-lg"
        >
          <h3 className="text-2xl mb-6 flex items-center gap-3">
            <Shield className="w-6 h-6 text-purple-600" />
            Safety Tips for Travelers
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {safetyTips.map((tip, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-purple-600 text-sm">✓</span>
                </div>
                <p className="text-gray-700">{tip}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tourist Information Centers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-8 text-white"
        >
          <div className="flex items-start gap-4">
            <MapPin className="w-8 h-8 flex-shrink-0" />
            <div>
              <h3 className="text-2xl mb-3">Tourist Information Centers</h3>
              <div className="grid md:grid-cols-2 gap-4 text-purple-100">
                <div>
                  <p className="text-white mb-1">Kolkata:</p>
                  <p className="text-sm">Shakespeare Sarani, Park Street</p>
                  <p className="text-sm">📞 +91-33-2282-5813</p>
                </div>
                <div>
                  <p className="text-white mb-1">Darjeeling:</p>
                  <p className="text-sm">Chowrasta Mall, Darjeeling</p>
                  <p className="text-sm">📞 +91-354-225-4102</p>
                </div>
                <div>
                  <p className="text-white mb-1">Digha:</p>
                  <p className="text-sm">New Digha, Near Bus Stand</p>
                  <p className="text-sm">📞 +91-3220-266-274</p>
                </div>
                <div>
                  <p className="text-white mb-1">Siliguri:</p>
                  <p className="text-sm">Hill Cart Road, Siliguri</p>
                  <p className="text-sm">📞 +91-353-251-4099</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
