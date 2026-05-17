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
