import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'bn' | 'hi';

interface Translations {
  [key: string]: {
    en: string;
    bn: string;
    hi: string;
  };
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Translations = {
  // Navigation
  'nav.home': {
    en: 'Home',
    bn: 'হোম',
    hi: 'होम',
  },
  'nav.explore': {
    en: 'Explore',
    bn: 'অন্বেষণ করুন',
    hi: 'खोजें',
  },
  'nav.wishlist': {
    en: 'Wishlist',
    bn: 'ইচ্ছা তালিকা',
    hi: 'इच्छा सूची',
  },
  'nav.planner': {
    en: 'Trip Planner',
    bn: 'ট্রিপ প্ল্যানার',
    hi: 'यात्रा योजनाकार',
  },
  'nav.food': {
    en: 'Food Guide',
    bn: 'খাদ্য গাইড',
    hi: 'भोजन गाइड',
  },
  'nav.signin': {
    en: 'Sign In',
    bn: 'সাইন ইন',
    hi: 'साइन इन',
  },
  'nav.profile': {
    en: 'Profile',
    bn: 'প্রোফাইল',
    hi: 'प्रोफ़ाइल',
  },
  'nav.festivals': {
    en: 'Festivals',
    bn: 'উৎসব',
    hi: 'त्योहार',
  },
  'nav.about': {
    en: 'About Us',
    bn: 'আমাদের সম্পর্কে',
    hi: 'हमारे बारे में',
  },

  // Hero Section
  'hero.title': {
    en: 'Discover the Magic of West Bengal',
    bn: 'পশ্চিমবঙ্গের জাদু আবিষ্কার করুন',
    hi: 'पश्चिम बंगाल के जादू की खोज करें',
  },
  'hero.subtitle': {
    en: 'Explore 221+ authentic destinations, rich culture, and unforgettable experiences',
    bn: '২২১+ প্রামাণিক গন্তব্য, সমৃদ্ধ সংস্কৃতি এবং অবিস্মরণীয় অভিজ্ঞতা অন্বেষণ করুন',
    hi: '221+ प्रामाणिक गंतव्यों, समृद्ध संस्कृति और अविस्मरणीय अनुभवों का अन्वेषण करें',
  },
  'hero.exploreBtn': {
    en: 'Explore Destinations',
    bn: 'গন্তব্য অন্বেষণ করুন',
    hi: 'गंतव्यों का अन्वेषण करें',
  },
  'hero.planBtn': {
    en: 'Plan Your Trip',
    bn: 'আপনার ট্রিপ পরিকল্পনা করুন',
    hi: 'अपनी यात्रा की योजना बनाएं',
  },

  // Features
  'features.destinations': {
    en: '221+ Destinations',
    bn: '২২১+ গন্তব্য',
    hi: '221+ गंतव्य',
  },
  'features.tripPlanner': {
    en: 'Smart Trip Planner',
    bn: 'স্মার্ট ট্রিপ প্ল্যানার',
    hi: 'स्मार्ट यात्रा योजनाकार',
  },
  'features.foodGuide': {
    en: 'Bengali Food Guide',
    bn: 'বাংলা খাদ্য গাইড',
    hi: 'बंगाली भोजन गाइड',
  },
  'features.culture': {
    en: 'Rich Culture & Festivals',
    bn: 'সমৃদ্ধ সংস্কৃতি ও উৎসব',
    hi: 'समृद्ध संस्कृति और त्यौहार',
  },

  // Common
  'common.loading': {
    en: 'Loading...',
    bn: 'লোড হচ্ছে...',
    hi: 'लोड हो रहा है...',
  },
  'common.search': {
    en: 'Search',
    bn: 'অনুসন্ধান',
    hi: 'खोजें',
  },
  'common.filter': {
    en: 'Filter',
    bn: 'ফিল্টার',
    hi: 'फ़िल्टर',
  },
  'common.viewDetails': {
    en: 'View Details',
    bn: 'বিস্তারিত দেখুন',
    hi: 'विवरण देखें',
  },
  'common.bookNow': {
    en: 'Book Now',
    bn: 'এখনই বুক করুন',
    hi: 'अभी बुक करें',
  },
  'common.addToWishlist': {
    en: 'Add to Wishlist',
    bn: 'ইচ্ছা তালিকায় যোগ করুন',
    hi: 'इच्छा सूची में जोड़ें',
  },
  'common.share': {
    en: 'Share',
    bn: 'শেয়ার',
    hi: 'साझा करें',
  },
  'common.reviews': {
    en: 'Reviews',
    bn: 'পর্যালোচনা',
    hi: 'समीक्षा',
  },
  'common.rating': {
    en: 'Rating',
    bn: 'রেটিং',
    hi: 'रेटिंग',
  },

  // Reviews
  'reviews.writeReview': {
    en: 'Write a Review',
    bn: 'একটি পর্যালোচনা লিখুন',
    hi: 'समीक्षा लिखें',
  },
  'reviews.yourRating': {
    en: 'Your Rating',
    bn: 'আপনার রেটিং',
    hi: 'आपकी रेटिंग',
  },
  'reviews.yourReview': {
    en: 'Your Review',
    bn: 'আপনার পর্যালোচনা',
    hi: 'आपकी समीक्षा',
  },
  'reviews.submit': {
    en: 'Submit Review',
    bn: 'পর্যালোচনা জমা দিন',
    hi: 'समीक्षा जमा करें',
  },
  'reviews.helpful': {
    en: 'Helpful',
    bn: 'সহায়ক',
    hi: 'मददगार',
  },

  // Booking
  'booking.title': {
    en: 'Book Your Experience',
    bn: 'আপনার অভিজ্ঞতা বুক করুন',
    hi: 'अपना अनुभव बुक करें',
  },
  'booking.checkIn': {
    en: 'Check-in',
    bn: 'চেক-ইন',
    hi: 'चेक-इन',
  },
  'booking.checkOut': {
    en: 'Check-out',
    bn: 'চেক-আউট',
    hi: 'चेक-आउट',
  },
  'booking.guests': {
    en: 'Guests',
    bn: 'অতিথি',
    hi: 'मेहमान',
  },
  'booking.rooms': {
    en: 'Rooms',
    bn: 'কক্ষ',
    hi: 'कमरे',
  },
  'booking.total': {
    en: 'Total',
    bn: 'মোট',
    hi: 'कुल',
  },
  'booking.confirmBooking': {
    en: 'Confirm Booking',
    bn: 'বুকিং নিশ্চিত করুন',
    hi: 'बुकिंग की पुष्टि करें',
  },

  // Gamification
  'gamification.points': {
    en: 'Points',
    bn: 'পয়েন্ট',
    hi: 'अंक',
  },
  'gamification.level': {
    en: 'Level',
    bn: 'স্তর',
    hi: 'स्तर',
  },
  'gamification.badges': {
    en: 'Badges',
    bn: 'ব্যাজ',
    hi: 'बैज',
  },
  'gamification.achievements': {
    en: 'Achievements',
    bn: 'অর্জন',
    hi: 'उपलब्धियां',
  },
  'gamification.leaderboard': {
    en: 'Leaderboard',
    bn: 'লিডারবোর্ড',
    hi: 'लीडरबोर्ड',
  },

  // AI Assistant
  'ai.title': {
    en: 'AI Travel Assistant',
    bn: 'এআই ভ্রমণ সহায়ক',
    hi: 'एआई यात्रा सहायक',
  },
  'ai.placeholder': {
    en: 'Ask me anything about West Bengal tourism...',
    bn: 'পশ্চিমবঙ্গ পর্যটন সম্পর্কে আমাকে কিছু জিজ্ঞাসা করুন...',
    hi: 'पश्चिम बंगाल पर्यटन के बारे में मुझसे कुछ भी पूछें...',
  },
  'ai.send': {
    en: 'Send',
    bn: 'পাঠান',
    hi: 'भेजें',
  },

  // Hero (static labels)
  'hero.trending': {
    en: 'Trending',
    bn: 'জনপ্রিয়',
    hi: 'ट्रेंडिंग',
  },
  'hero.tab.destinations': {
    en: 'Destinations',
    bn: 'গন্তব্য',
    hi: 'गंतव्य',
  },
  'hero.tab.festivals': {
    en: 'Festivals',
    bn: 'উৎসব',
    hi: 'त्योहार',
  },
  'hero.tab.food': {
    en: 'Food',
    bn: 'খাবার',
    hi: 'भोजन',
  },

  // Footer
  'footer.tagline': {
    en: "Discover the soul of West Bengal. Experience authentic culture, breathtaking landscapes, and unforgettable memories with Bengal's most trusted travel companion.",
    bn: 'পশ্চিমবঙ্গের আত্মা আবিষ্কার করুন। বাংলার সবচেয়ে বিশ্বস্ত ভ্রমণ সঙ্গীর সাথে প্রামাণিক সংস্কৃতি, শ্বাসরুদ্ধকর প্রাকৃতিক দৃশ্য এবং অবিস্মরণীয় স্মৃতির অভিজ্ঞতা নিন।',
    hi: 'पश्चिम बंगाल की आत्मा को जानें। बंगाल के सबसे भरोसेमंद यात्रा साथी के साथ प्रामाणिक संस्कृति, मनमोहक नज़ारों और अविस्मरणीय यादों का अनुभव करें।',
  },
  'footer.location': {
    en: 'Kolkata, West Bengal, India',
    bn: 'কলকাতা, পশ্চিমবঙ্গ, ভারত',
    hi: 'कोलकाता, पश्चिम बंगाल, भारत',
  },
  'footer.contactUs': {
    en: 'Contact us',
    bn: 'যোগাযোগ করুন',
    hi: 'संपर्क करें',
  },
  'footer.topDestinations': {
    en: 'Top Destinations',
    bn: 'শীর্ষ গন্তব্য',
    hi: 'शीर्ष गंतव्य',
  },
  'footer.tools': {
    en: 'Tools',
    bn: 'সরঞ্জাম',
    hi: 'उपकरण',
  },
  'footer.support': {
    en: 'Support',
    bn: 'সহায়তা',
    hi: 'सहायता',
  },
  'footer.helpfulLinks': {
    en: 'Helpful Links',
    bn: 'সহায়ক লিঙ্ক',
    hi: 'उपयोगी लिंक',
  },
  'footer.allDestinations': {
    en: 'All Destinations',
    bn: 'সমস্ত গন্তব্য',
    hi: 'सभी गंतव्य',
  },
  'footer.newsletterTitle': {
    en: 'Stay Updated with Bengal Adventures',
    bn: 'বেঙ্গল অ্যাডভেঞ্চারের সাথে আপডেট থাকুন',
    hi: 'बंगाल एडवेंचर्स के साथ अपडेट रहें',
  },
  'footer.newsletterSubtitle': {
    en: 'Get exclusive travel tips, special offers, and destination guides delivered to your inbox.',
    bn: 'আপনার ইনবক্সে একচেটিয়া ভ্রমণ টিপস, বিশেষ অফার এবং গন্তব্য গাইড পান।',
    hi: 'विशेष यात्रा सुझाव, ऑफ़र और गंतव्य गाइड सीधे अपने इनबॉक्स में पाएं।',
  },
  'footer.emailPlaceholder': {
    en: 'Enter your email',
    bn: 'আপনার ইমেল লিখুন',
    hi: 'अपना ईमेल दर्ज करें',
  },
  'footer.subscribe': {
    en: 'Subscribe',
    bn: 'সাবস্ক্রাইব',
    hi: 'सब्सक्राइब',
  },
  'footer.madeWith': {
    en: 'Made with',
    bn: 'তৈরি',
    hi: 'बनाया गया',
  },
  'footer.inWestBengal': {
    en: 'in West Bengal',
    bn: 'পশ্চিমবঙ্গে ❤️ দিয়ে',
    hi: 'पश्चिम बंगाल में ❤️ से',
  },
  'footer.privacy': {
    en: 'Privacy Policy',
    bn: 'গোপনীয়তা নীতি',
    hi: 'गोपनीयता नीति',
  },
  'footer.terms': {
    en: 'Terms of Service',
    bn: 'পরিষেবার শর্তাবলী',
    hi: 'सेवा की शर्तें',
  },
  'footer.cookies': {
    en: 'Cookie Policy',
    bn: 'কুকি নীতি',
    hi: 'कुकी नीति',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('bengaltrails-language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('bengaltrails-language', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
