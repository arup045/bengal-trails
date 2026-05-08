// Authentic Bengali Cuisine Guide
// Curated dishes with regional context

module.exports = {
  categories: ['mains', 'sweets', 'streetfood', 'snacks', 'breakfast', 'beverages'],

  dishes: [
    // MAINS - Non-Veg
    { id: 'kosha-mangsho', name: 'Kosha Mangsho', bengaliName: 'কষা মাংস', category: 'mains', type: 'non-veg',
      description: 'Slow-cooked spicy mutton — Bengal\'s answer to dum biryani. Best at Golbari (North Kolkata) or Aaheli.',
      origin: 'Kolkata', spiceLevel: 'medium-hot', priceRange: '₹350-500',
      whereToTry: ['Golbari', 'Aaheli', 'Bhojohori Manna'], image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800' },

    { id: 'shorshe-ilish', name: 'Shorshe Ilish', bengaliName: 'সর্ষে ইলিশ', category: 'mains', type: 'non-veg',
      description: 'Hilsa fish cooked in mustard sauce — the king of Bengali cuisine. Best in monsoon (June-Sept).',
      origin: 'East Bengal heritage', spiceLevel: 'mild', priceRange: '₹600-1200',
      whereToTry: ['6 Ballygunge Place', 'Oh Calcutta', 'Kewpie\'s'], image: 'https://images.unsplash.com/photo-1626500155010-b9fbc9b18b07?w=800' },

    { id: 'chingri-malai-curry', name: 'Chingri Malai Curry', bengaliName: 'চিংড়ি মালাই কারি', category: 'mains', type: 'non-veg',
      description: 'King prawns in coconut milk gravy — rich, creamy, mildly sweet. Festival favorite.',
      origin: 'Coastal Bengal', spiceLevel: 'mild', priceRange: '₹400-700',
      whereToTry: ['Bhojohori Manna', '6 Ballygunge Place'], image: 'https://images.unsplash.com/photo-1633417793395-ad8a8c83ad6c?w=800' },

    // MAINS - Veg
    { id: 'shukto', name: 'Shukto', bengaliName: 'শুক্তো', category: 'mains', type: 'veg',
      description: 'Bitter-sweet medley of vegetables — bitter gourd, drumstick, sweet potato. Always served first in a Bengali meal.',
      origin: 'Bengali Brahmin tradition', spiceLevel: 'mild', priceRange: '₹150-250',
      whereToTry: ['Kewpie\'s', 'Bhojohori Manna'], image: 'https://images.unsplash.com/photo-1631292847820-0c95dec0c1c2?w=800' },

    { id: 'aloo-posto', name: 'Aloo Posto', bengaliName: 'আলু পোস্ত', category: 'mains', type: 'veg',
      description: 'Potatoes cooked in poppy seed paste — comfort food for every Bengali. Best with steaming rice.',
      origin: 'Rarh region', spiceLevel: 'mild', priceRange: '₹120-200',
      whereToTry: ['Any Bengali home or restaurant'], image: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=800' },

    // SWEETS
    { id: 'rasgulla', name: 'Rasgulla', bengaliName: 'রসগোল্লা', category: 'sweets', type: 'veg',
      description: 'Spongy chenna balls in sugar syrup. GI tag claim by Bengal (originally invented in Kolkata 1868 by KC Das).',
      origin: 'Kolkata', priceRange: '₹15-30 per piece',
      whereToTry: ['KC Das', 'Balaram Mullick', 'Nakur'], image: 'https://images.unsplash.com/photo-1606830733744-0ad778449672?w=800' },

    { id: 'mishti-doi', name: 'Mishti Doi', bengaliName: 'মিষ্টি দই', category: 'sweets', type: 'veg',
      description: 'Sweetened caramelized yogurt — Bengal\'s signature dessert. Best in earthen pots.',
      origin: 'Bagbazar, Kolkata', priceRange: '₹30-60',
      whereToTry: ['Balaram Mullick', 'Mithai', 'Putiram'], image: 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=800' },

    { id: 'sandesh', name: 'Sandesh', bengaliName: 'সন্দেশ', category: 'sweets', type: 'veg',
      description: 'Delicate chenna sweet with subtle flavors — pista, jaggery (nolen gur), or saffron varieties.',
      origin: 'Kolkata', priceRange: '₹20-50 per piece',
      whereToTry: ['Bhim Chandra Nag', 'Girish Chandra Dey'], image: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=800' },

    { id: 'ledikeni', name: 'Ledikeni', bengaliName: 'লেডিকেনি', category: 'sweets', type: 'veg',
      description: 'Cylindrical sweet named after Lady Canning (1856). Like a brown rasgulla with extra sweetness.',
      origin: 'Kolkata (named after Lady Canning)', priceRange: '₹20-40',
      whereToTry: ['Bhim Chandra Nag'], image: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=800' },

    // STREET FOOD
    { id: 'puchka', name: 'Puchka', bengaliName: 'পুচকা', category: 'streetfood', type: 'veg',
      description: 'Crispy hollow puris filled with tangy tamarind water, mashed potato, and chickpeas. Sharp, spicy, addictive.',
      origin: 'Kolkata streets', priceRange: '₹20-50 per plate',
      whereToTry: ['Vivekananda Park', 'Decker\'s Lane', 'New Market'], image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800' },

    { id: 'kathi-roll', name: 'Kathi Roll', bengaliName: 'কাঠি রোল', category: 'streetfood', type: 'mixed',
      description: 'Roti rolled with kebab fillings — chicken, mutton, paneer, or egg. Invented at Nizam\'s in 1932.',
      origin: 'Nizam\'s (Kolkata)', priceRange: '₹50-150',
      whereToTry: ['Nizam\'s', 'Hot Kati Roll', 'Kusum'], image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800' },

    { id: 'jhal-muri', name: 'Jhalmuri', bengaliName: 'ঝাল মুড়ি', category: 'streetfood', type: 'veg',
      description: 'Spicy puffed rice mix with chopped vegetables, mustard oil, lemon — perfect tea-time snack.',
      origin: 'Bengal-wide', priceRange: '₹10-30',
      whereToTry: ['Any street vendor', 'Train stations'], image: 'https://images.unsplash.com/photo-1606755456206-b25206cde27e?w=800' },

    { id: 'kabiraji', name: 'Kabiraji Cutlet', bengaliName: 'কবিরাজি', category: 'streetfood', type: 'mixed',
      description: 'Lacy egg-net coated cutlet — Anglo-Indian fusion. Fish or chicken inside.',
      origin: 'Colonial Calcutta', priceRange: '₹100-180',
      whereToTry: ['Mitra Cafe', 'Allen Kitchen'], image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800' },

    // BREAKFAST
    { id: 'luchi-aloor-dom', name: 'Luchi Aloor Dom', bengaliName: 'লুচি আলুর দম', category: 'breakfast', type: 'veg',
      description: 'Fluffy white deep-fried bread with spicy potato curry. Sunday breakfast staple.',
      origin: 'Bengal-wide', priceRange: '₹60-120',
      whereToTry: ['Tewari Bros', 'Mitra Cafe'], image: 'https://images.unsplash.com/photo-1631292847820-0c95dec0c1c2?w=800' },

    { id: 'kachori-tarkari', name: 'Kachori Tarkari', bengaliName: 'কচুরি তরকারি', category: 'breakfast', type: 'veg',
      description: 'Spicy lentil-stuffed pastries with chana dal curry. Quintessential winter morning breakfast.',
      origin: 'Burrabazar', priceRange: '₹40-80',
      whereToTry: ['Tewari Bros', 'Putiram'], image: 'https://images.unsplash.com/photo-1633417793395-ad8a8c83ad6c?w=800' },

    // BEVERAGES
    { id: 'chai', name: 'Bhaar er Chai', bengaliName: 'ভাঁড়ের চা', category: 'beverages', type: 'veg',
      description: 'Sweet milky tea served in disposable clay cups (bhaar). The earthy aroma is irreplaceable.',
      origin: 'Bengal-wide', priceRange: '₹10-25',
      whereToTry: ['Any roadside tea stall'], image: 'https://images.unsplash.com/photo-1545162005-b8c8b27b8a2e?w=800' },

    { id: 'aam-pora-shorbot', name: 'Aam Pora Shorbot', bengaliName: 'আম পোড়া শরবত', category: 'beverages', type: 'veg',
      description: 'Roasted raw mango drink — summer cooler with mint and rock salt.',
      origin: 'Rural Bengal', priceRange: '₹50-100',
      whereToTry: ['Bengali sweet shops in summer'], image: 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=800' },
  ],

  // Famous food streets/markets
  foodStreets: [
    { name: 'Park Street', city: 'Kolkata', specialty: 'International + Bengali fine dining', mustEat: ['Flurys breakfast', 'Trinca\'s steak', 'Olypub\'s chelo kebab'] },
    { name: 'Decker\'s Lane', city: 'Kolkata', specialty: 'Traditional sweets & street food', mustEat: ['Chitto Babur Dokan rolls', 'Puchka stalls'] },
    { name: 'New Market', city: 'Kolkata', specialty: 'Mixed cuisine, kebabs', mustEat: ['Nizam\'s rolls', 'Nahoum\'s cakes'] },
    { name: 'Bagbazar', city: 'Kolkata', specialty: 'Authentic Bengali sweets', mustEat: ['KC Das rasgulla', 'Bhim Nag sandesh'] },
    { name: 'Mocambo Lane', city: 'Kolkata', specialty: 'Anglo-Indian classics', mustEat: ['Devilled crab', 'Chicken sizzler'] },
  ],
};
