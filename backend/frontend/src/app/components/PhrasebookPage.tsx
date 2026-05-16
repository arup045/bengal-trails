import { useState } from 'react';
import { motion } from 'motion/react';
import { Book, Volume2, Search, Heart, Coffee, MapPin, ShoppingBag, Info, Utensils, X } from 'lucide-react';

interface Phrase {
  bengali: string;
  pronunciation: string;
  english: string;
  category: string;
}

export function PhrasebookPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  const categories = [
    { id: 'all', name: 'All Phrases', icon: Book },
    { id: 'greetings', name: 'Greetings', icon: Heart },
    { id: 'food', name: 'Food & Dining', icon: Utensils },
    { id: 'directions', name: 'Directions', icon: MapPin },
    { id: 'shopping', name: 'Shopping', icon: ShoppingBag },
    { id: 'help', name: 'Help & Emergency', icon: Info },
    { id: 'cultural', name: 'Cultural', icon: Coffee },
  ];

  const phrases: Phrase[] = [
    // Greetings
    { bengali: 'নমস্কার', pronunciation: 'Nomoshkar', english: 'Hello / Greetings', category: 'greetings' },
    { bengali: 'কেমন আছেন?', pronunciation: 'Kemon achhen?', english: 'How are you?', category: 'greetings' },
    { bengali: 'ভালো আছি', pronunciation: 'Bhalo achhi', english: 'I am fine', category: 'greetings' },
    { bengali: 'ধন্যবাদ', pronunciation: 'Dhonnobad', english: 'Thank you', category: 'greetings' },
    { bengali: 'স্বাগতম', pronunciation: 'Shagotom', english: 'Welcome', category: 'greetings' },
    { bengali: 'শুভ সকাল', pronunciation: 'Shubho shokal', english: 'Good morning', category: 'greetings' },
    { bengali: 'শুভ রাত্রি', pronunciation: 'Shubho ratri', english: 'Good night', category: 'greetings' },
    { bengali: 'দয়া করে', pronunciation: 'Doya kore', english: 'Please', category: 'greetings' },
    { bengali: 'দুঃখিত', pronunciation: 'Dukhkito', english: 'Sorry', category: 'greetings' },
    { bengali: 'বিদায়', pronunciation: 'Biday', english: 'Goodbye', category: 'greetings' },

    // Food & Dining
    { bengali: 'আমি ক্ষুধার্ত', pronunciation: 'Ami khudharto', english: 'I am hungry', category: 'food' },
    { bengali: 'এটা কি?', pronunciation: 'Eta ki?', english: 'What is this?', category: 'food' },
    { bengali: 'খুব সুস্বাদু', pronunciation: 'Khub shushadu', english: 'Very delicious', category: 'food' },
    { bengali: 'পানি দিন', pronunciation: 'Pani din', english: 'Please give water', category: 'food' },
    { bengali: 'রসগোল্লা', pronunciation: 'Roshogolla', english: 'Rasgulla (sweet)', category: 'food' },
    { bengali: 'চা', pronunciation: 'Cha', english: 'Tea', category: 'food' },
    { bengali: 'মাছ', pronunciation: 'Machh', english: 'Fish', category: 'food' },
    { bengali: 'ভাত', pronunciation: 'Bhat', english: 'Rice', category: 'food' },
    { bengali: 'মিষ্টি', pronunciation: 'Mishti', english: 'Sweet', category: 'food' },
    { bengali: 'বিল কত?', pronunciation: 'Bill koto?', english: 'How much is the bill?', category: 'food' },

    // Directions
    { bengali: 'এটা কোথায়?', pronunciation: 'Eta kothay?', english: 'Where is this?', category: 'directions' },
    { bengali: 'আমি হারিয়ে গেছি', pronunciation: 'Ami hariye gechi', english: 'I am lost', category: 'directions' },
    { bengali: 'বাম', pronunciation: 'Bam', english: 'Left', category: 'directions' },
    { bengali: 'ডান', pronunciation: 'Daan', english: 'Right', category: 'directions' },
    { bengali: 'সোজা যান', pronunciation: 'Shoja jan', english: 'Go straight', category: 'directions' },
    { bengali: 'দূরে কত?', pronunciation: 'Dure koto?', english: 'How far?', category: 'directions' },
    { bengali: 'ট্যাক্সি', pronunciation: 'Taxi', english: 'Taxi', category: 'directions' },
    { bengali: 'বাস স্ট্যান্ড', pronunciation: 'Bus stand', english: 'Bus stop', category: 'directions' },
    { bengali: 'স্টেশন', pronunciation: 'Station', english: 'Station', category: 'directions' },
    { bengali: 'হোটেল', pronunciation: 'Hotel', english: 'Hotel', category: 'directions' },

    // Shopping
    { bengali: 'দাম কত?', pronunciation: 'Dam koto?', english: 'How much does it cost?', category: 'shopping' },
    { bengali: 'খুব দামী', pronunciation: 'Khub dami', english: 'Too expensive', category: 'shopping' },
    { bengali: 'কম করুন', pronunciation: 'Kom korun', english: 'Please reduce the price', category: 'shopping' },
    { bengali: 'আমি এটা কিনব', pronunciation: 'Ami eta kinbo', english: 'I will buy this', category: 'shopping' },
    { bengali: 'বাজার', pronunciation: 'Bazar', english: 'Market', category: 'shopping' },
    { bengali: 'দোকান', pronunciation: 'Dokan', english: 'Shop', category: 'shopping' },
    { bengali: 'শাড়ি', pronunciation: 'Shari', english: 'Saree', category: 'shopping' },
    { bengali: 'হস্তশিল্প', pronunciation: 'Hostoshilpo', english: 'Handicrafts', category: 'shopping' },
    { bengali: 'ছাড় আছে?', pronunciation: 'Chhar achhe?', english: 'Any discount?', category: 'shopping' },
    { bengali: 'এটা দেখান', pronunciation: 'Eta dekhao', english: 'Please show this', category: 'shopping' },

    // Help & Emergency
    { bengali: 'সাহায্য করুন', pronunciation: 'Shahajjo korun', english: 'Please help', category: 'help' },
    { bengali: 'ডাক্তার দরকার', pronunciation: 'Daktar dorkar', english: 'Need a doctor', category: 'help' },
    { bengali: 'পুলিশ ডাকুন', pronunciation: 'Police dakun', english: 'Call the police', category: 'help' },
    { bengali: 'হাসপাতাল', pronunciation: 'Hashpatal', english: 'Hospital', category: 'help' },
    { bengali: 'বিপদ', pronunciation: 'Bipod', english: 'Danger', category: 'help' },
    { bengali: 'আমি ইংরেজি বলি', pronunciation: 'Ami Ingreji boli', english: 'I speak English', category: 'help' },
    { bengali: 'বুঝতে পারছি না', pronunciation: 'Bujhte parchi na', english: 'I do not understand', category: 'help' },
    { bengali: 'ফোন', pronunciation: 'Phone', english: 'Phone', category: 'help' },

    // Cultural
    { bengali: 'দুর্গা পূজা', pronunciation: 'Durga Puja', english: 'Durga Puja (festival)', category: 'cultural' },
    { bengali: 'রবীন্দ্রনাথ', pronunciation: 'Robindronath', english: 'Rabindranath Tagore', category: 'cultural' },
    { bengali: 'বাউল গান', pronunciation: 'Baul gan', english: 'Baul songs', category: 'cultural' },
    { bengali: 'মন্দির', pronunciation: 'Mondir', english: 'Temple', category: 'cultural' },
    { bengali: 'উৎসব', pronunciation: 'Utsob', english: 'Festival', category: 'cultural' },
    { bengali: 'শিল্পকলা', pronunciation: 'Shilpokola', english: 'Art', category: 'cultural' },
    { bengali: 'সংগীত', pronunciation: 'Shonggit', english: 'Music', category: 'cultural' },
    { bengali: 'নাচ', pronunciation: 'Nach', english: 'Dance', category: 'cultural' },
  ];

  const filteredPhrases = phrases.filter(phrase => {
    const matchesCategory = selectedCategory === 'all' || phrase.category === selectedCategory;
    const matchesSearch = 
      searchQuery === '' ||
      phrase.english.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phrase.bengali.includes(searchQuery) ||
      phrase.pronunciation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const playPronunciation = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'bn-IN';
      utterance.rate = 0.8;
      setPlayingAudio(text);
      utterance.onend = () => setPlayingAudio(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 pt-32 pb-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-purple-100 rounded-full px-6 py-3 mb-4">
            <Book className="w-5 h-5 text-orange-600" />
            <span className="text-orange-600 font-semibold">Learn Bengali</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Bengali Phrasebook
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Master essential Bengali phrases for your West Bengal adventure. Click the speaker icon to hear pronunciations!
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto mb-8"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search phrases in English or Bengali..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-4 bg-white rounded-full border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-lg"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Category Pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-purple-600 to-orange-600 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.name}
              </button>
            );
          })}
        </motion.div>

        {/* Phrases Grid */}
        <div className="max-w-5xl mx-auto">
          <div className="mb-6 text-center text-gray-600">
            Showing <span className="font-semibold text-purple-600">{filteredPhrases.length}</span> phrases
          </div>

          {filteredPhrases.length === 0 ? (
            <div className="text-center py-20">
              <Book className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-2xl font-bold text-gray-700 mb-2">No phrases found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search or category filter</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="bg-purple-600 text-white px-6 py-3 rounded-full hover:bg-purple-700 transition-colors"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPhrases.map((phrase, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-purple-300"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-3xl text-gray-900">{phrase.bengali}</h3>
                        <button
                          onClick={() => playPronunciation(phrase.bengali)}
                          className={`p-2 rounded-full transition-all ${
                            playingAudio === phrase.bengali
                              ? 'bg-purple-600 text-white scale-110'
                              : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                          }`}
                          title="Hear pronunciation"
                        >
                          <Volume2 className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <p className="text-lg text-purple-600 font-medium mb-2">
                        {phrase.pronunciation}
                      </p>
                      
                      <p className="text-gray-700 text-lg">
                        {phrase.english}
                      </p>
                    </div>

                    <div className="flex-shrink-0">
                      <span className="inline-block px-4 py-2 bg-gradient-to-r from-orange-100 to-purple-100 text-orange-700 rounded-full text-sm font-medium">
                        {categories.find(c => c.id === phrase.category)?.name}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 max-w-4xl mx-auto bg-gradient-to-r from-purple-600 to-orange-600 rounded-3xl p-8 text-white"
        >
          <h2 className="text-3xl font-bold mb-6 text-center">Tips for Speaking Bengali</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <h3 className="text-xl font-semibold mb-3">🗣️ Pronunciation</h3>
              <p className="text-white/90">
                Bengali has unique sounds. Listen carefully and practice slowly. Don't worry about perfect pronunciation - locals appreciate the effort!
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <h3 className="text-xl font-semibold mb-3">🙏 Respect</h3>
              <p className="text-white/90">
                Use "Nomoshkar" (নমস্কার) as a respectful greeting. Bengalis are warm and friendly, and speaking their language builds instant connections.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <h3 className="text-xl font-semibold mb-3">💬 Practice</h3>
              <p className="text-white/90">
                Try using these phrases with locals. They'll be delighted and often help you improve. Market interactions are great for practice!
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <h3 className="text-xl font-semibold mb-3">📖 Context</h3>
              <p className="text-white/90">
                Bengali has formal and informal forms. These phrases use a respectful middle ground suitable for travelers meeting new people.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Cultural Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 max-w-4xl mx-auto bg-white rounded-2xl p-8 shadow-lg border-2 border-orange-200"
        >
          <div className="flex items-start gap-4">
            <Coffee className="w-8 h-8 text-orange-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Cultural Note</h3>
              <p className="text-gray-700 leading-relaxed">
                Bengali (বাংলা) is one of the world's most spoken languages with over 230 million speakers. It's the language of Nobel laureate Rabindranath Tagore and has a rich literary tradition. West Bengal's culture is deeply intertwined with the Bengali language, from its poetry and music to everyday conversations. Learning even a few phrases will enrich your travel experience and open doors to authentic cultural exchanges.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
