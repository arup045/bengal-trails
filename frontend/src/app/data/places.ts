export interface Place {
  title: string;
  slug: string;
  region: string;
  district: string;
  coordinates: { lat: number; lng: number };
  heroImage: { url: string; alt: string };
  excerpt: string;
  description?: string;
  tags: string[];
  bestTime: string;
  rating?: number;
  reviewsCount?: number;
  priceFrom?: string;
  nearbyHotels: string[];
  nearbyRestaurants: string[];
  currentFestivals?: string[];
  nearbyPlaces?: string[];
  highlights?: string[];
  activities?: string[];
}

export const places: Place[] = [
  {
    title: "Darjeeling",
    slug: "darjeeling",
    region: "North Bengal",
    district: "Darjeeling",
    coordinates: { lat: 27.036, lng: 88.2627 },
    heroImage: {
      url: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200",
      alt: "Darjeeling tea gardens and Himalayan view",
    },
    excerpt: "Tea gardens, the Toy Train, sunrise at Tiger Hill and colonial charm.",
    description:
      "Nestled in the Himalayas, Darjeeling is the Queen of Hill Stations. Famous for its world-renowned tea, breathtaking mountain views, and the UNESCO Heritage Toy Train, Darjeeling offers a perfect blend of colonial charm and natural beauty. Wake up to stunning sunrises at Tiger Hill, explore lush tea estates, and immerse yourself in the serene mountain culture.",
    tags: ["TeaTrails", "HillStation", "SunriseView", "ToyTrain", "Trekking"],
    bestTime: "Oct–Feb",
    rating: 0,
    reviewsCount: 0,
    priceFrom: "₹3,500",
    nearbyHotels: ["Mayfair Darjeeling", "Windamere Hotel", "Glenburn Tea Estate"],
    nearbyRestaurants: ["Glenary's", "Kunga Restaurant", "Sonam's Kitchen"],
    nearbyPlaces: ["Kalimpong", "Mirik", "Kurseong"],
    highlights: [
      "Tiger Hill Sunrise (3:30 AM)",
      "Toy Train Ride (2-3 hours)",
      "Happy Valley Tea Estate Tour",
      "Batasia Loop Garden",
      "Peace Pagoda",
      "Observatory Hill Trek",
    ],
    activities: ["Tea Tasting", "Mountain Trekking", "Photography", "Cable Car Ride", "Monastery Visits"],
  },
  {
    title: "Kalimpong",
    slug: "kalimpong",
    region: "North Bengal",
    district: "Kalimpong",
    coordinates: { lat: 27.0669, lng: 88.4701 },
    heroImage: {
      url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200",
      alt: "Kalimpong monastery and pine views",
    },
    excerpt: "Quiet hilltown with monasteries, nurseries and panoramic viewpoints.",
    description:
      "A peaceful alternative to Darjeeling, Kalimpong is known for its Buddhist monasteries, exotic flower nurseries, and stunning valley views. This tranquil hill station offers a glimpse into Tibetan culture, colonial architecture, and the region's rich horticultural heritage.",
    tags: ["HillStation", "Monastery", "ScenicViews", "Tea"],
    bestTime: "Mar–Jun, Sep–Nov",
    rating: 0,
    reviewsCount: 0,
    priceFrom: "₹2,800",
    nearbyHotels: ["Hotel De' Pearl", "Green Hill Hotel", "Kalimpong Hill Resort"],
    nearbyRestaurants: ["The Cuisinet Restaurant", "Tibetan Kitchen", "Cafe Kalimpong"],
    nearbyPlaces: ["Darjeeling", "Lava", "Loleygaon"],
    highlights: [
      "Zang Dhok Palri Phodang Monastery",
      "Deolo Hill Viewpoint",
      "Durpin Monastery",
      "Pine Viewpoint",
      "Flower Nurseries",
      "Kalimpong Arts & Crafts",
    ],
    activities: ["Monastery Tours", "Flower Shopping", "Paragliding", "Bird Watching", "Village Walks"],
  },
  {
    title: "Kurseong",
    slug: "kurseong",
    region: "North Bengal",
    district: "Kurseong",
    coordinates: { lat: 26.846, lng: 88.3165 },
    heroImage: {
      url: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200",
      alt: "Kurseong tea gardens and forest",
    },
    excerpt: "Small hill station known for Dow Hill, tea estates and serene walks.",
    description:
      "Kurseong, meaning 'The Land of White Orchids', is a charming hill station known for its tea gardens, forests, and colonial heritage. Often overlooked by tourists, it offers peace, scenic walks, and authentic hill station experiences.",
    tags: ["TeaTrails", "HillStation", "BirdWatching"],
    bestTime: "Oct–Mar",
    rating: 0,
    reviewsCount: 0,
    priceFrom: "₹2,200",
    nearbyHotels: ["Sinclairs Retreat Kurseong", "Hotel Mount Resort", "Tea Bungalow Homestay"],
    nearbyRestaurants: ["Sweets & Savories", "Glenary's Kurseong", "Local Tea Stall"],
    nearbyPlaces: ["Darjeeling", "Siliguri", "Mirik"],
    highlights: [
      "Dow Hill Forest",
      "Makaibari Tea Estate",
      "Eagle's Crag Viewpoint",
      "Netaji Subhash Chandra Bose Museum",
      "Forest Museum",
    ],
    activities: ["Tea Garden Walks", "Forest Trails", "Photography", "Heritage Tours"],
  },
  {
    title: "Mirik",
    slug: "mirik",
    region: "North Bengal",
    district: "Darjeeling",
    coordinates: { lat: 26.7036, lng: 88.1432 },
    heroImage: {
      url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200",
      alt: "Sumendu Lake Mirik with boats",
    },
    excerpt: "Lakeside retreat with boating, cardamom gardens and quiet viewpoints.",
    description:
      "Mirik is a picturesque town built around the beautiful Sumendu Lake. Known for its serene environment, tea gardens, and cardamom plantations, Mirik is perfect for those seeking tranquility away from crowded tourist spots.",
    tags: ["LakeSide", "HillStation", "TeaTrails"],
    bestTime: "Oct–Mar",
    rating: 0,
    reviewsCount: 0,
    priceFrom: "₹2,000",
    nearbyHotels: ["The Elgin Mirik", "Mirik Valley Resort", "Lakeside Homestay"],
    nearbyRestaurants: ["Lakeshore Cafe", "Mirik Restaurants", "Local Fish Grill"],
    nearbyPlaces: ["Darjeeling", "Pashupati Market", "Kurseong"],
    highlights: ["Sumendu Lake Boating", "Bokar Monastery", "Thurbo Tea Garden", "Pashupati Market (Nepal Border)"],
    activities: ["Boating", "Lakeside Walks", "Horse Riding", "Shopping", "Photography"],
  },
  {
    title: "Sundarbans National Park",
    slug: "sundarbans-national-park",
    region: "South Bengal",
    district: "South 24 Parganas",
    coordinates: { lat: 21.9495, lng: 88.8606 },
    heroImage: {
      url: "https://images.unsplash.com/photo-1614107151491-6876eecbff89?w=1200",
      alt: "Sundarbans mangrove river boat safari",
    },
    excerpt: "World's largest mangrove forest — boat safaris for tigers, crocodiles and birds.",
    description:
      "The Sundarbans is a UNESCO World Heritage Site and one of the largest mangrove forests in the world. Home to the majestic Royal Bengal Tiger, this unique ecosystem offers thrilling boat safaris through narrow creeks, diverse wildlife, and an unforgettable adventure into the wild.",
    tags: ["Wildlife", "Mangroves", "BoatSafari", "EcoTourism"],
    bestTime: "Oct–Mar",
    rating: 0,
    reviewsCount: 0,
    priceFrom: "₹4,500",
    nearbyHotels: ["Sundarban Tiger Camp", "Sundarban Resort", "Eco Lodge Sundarbans"],
    nearbyRestaurants: ["Local Fish Canteen", "Resort Dining Hall"],
    nearbyPlaces: ["Sajnekhali", "Dobanki", "Gosaba"],
    highlights: [
      "Tiger Safari (Boat)",
      "Sajnekhali Wildlife Sanctuary",
      "Dobanki Canopy Walk",
      "Netidhopani Watchtower",
      "Crocodile Spotting",
      "Bird Watching",
    ],
    activities: ["Boat Safari", "Wildlife Photography", "Bird Watching", "Village Walks", "Mangrove Exploration"],
  },
  {
    title: "Shantiniketan",
    slug: "shantiniketan",
    region: "Central Bengal",
    district: "Birbhum",
    coordinates: { lat: 23.6846, lng: 87.677 },
    heroImage: {
      url: "https://images.unsplash.com/photo-1544413660-299165566b1d?w=1200",
      alt: "Shantiniketan Tagore campus and open courtyards",
    },
    excerpt: "Tagore's university town — art, music, Poush Mela and crafts.",
    description:
      "Founded by Nobel laureate Rabindranath Tagore, Shantiniketan is a cultural hub celebrating art, music, dance, and literature. Visit Visva-Bharati University, experience the vibrant Poush Mela fair, and immerse yourself in Bengal's rich artistic heritage.",
    tags: ["ArtCulture", "Tagore", "Mela", "Crafts"],
    bestTime: "Nov–Feb (Poush Mela in December)",
    rating: 0,
    reviewsCount: 0,
    priceFrom: "₹1,800",
    currentFestivals: ["Poush Mela (Dec)", "Basanta Utsav (Mar)"],
    nearbyHotels: ["Tagore Inn Shantiniketan", "Visva Bharati Guest House", "Heritage Homestay"],
    nearbyRestaurants: ["Amar Kutir Cafe", "Local Eatery Shantiniketan", "Poush Mela Stalls"],
    nearbyPlaces: ["Bakreshwar", "Tarapith", "Kendubilwa"],
    highlights: [
      "Visva-Bharati University",
      "Poush Mela (December)",
      "Basanta Utsav (Holi)",
      "Amar Kutir Crafts",
      "Upasana Griha",
      "Tagore's Ashram",
    ],
    activities: ["University Tour", "Craft Shopping", "Baul Music", "Art Galleries", "Cultural Programs"],
  },
  {
    title: "Bishnupur",
    slug: "bishnupur",
    region: "West Bengal Plains",
    district: "Bankura",
    coordinates: { lat: 23.0143, lng: 87.2999 },
    heroImage: {
      url: "https://images.unsplash.com/photo-1588408080771-4ac5e5c4ea08?w=1200",
      alt: "Bishnupur terracotta temple architecture",
    },
    excerpt: "Famous for terracotta temples, Baluchari sarees and traditional handicrafts.",
    description:
      "Bishnupur is a historic town renowned for its exquisite terracotta temples dating back to the 17th-18th centuries. The town is also famous for Baluchari silk sarees, traditional handicrafts, and classical music heritage.",
    tags: ["Terracotta", "Heritage", "Handicraft", "Weaving"],
    bestTime: "Oct–Mar",
    rating: 0,
    reviewsCount: 0,
    priceFrom: "₹1,500",
    nearbyHotels: ["Bishnupur Heritage Hotel", "Terracotta Retreat", "Local Guest House"],
    nearbyRestaurants: ["Traditional Bengali Kitchen", "Terracotta Cafe", "Local Sweets Shop"],
    nearbyPlaces: ["Mukutmanipur", "Jhilimili", "Susunia Hill"],
    highlights: [
      "Rasmancha Temple",
      "Jor Bangla Temple",
      "Madanmohan Temple",
      "Baluchari Saree Weaving",
      "Archaeological Museum",
    ],
    activities: ["Temple Tour", "Craft Shopping", "Photography", "Heritage Walks"],
  },
  {
    title: "Digha",
    slug: "digha",
    region: "Coastal Bengal",
    district: "Purba Medinipur",
    coordinates: { lat: 21.6417, lng: 87.47 },
    heroImage: {
      url: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200",
      alt: "Digha beach and coastline",
    },
    excerpt: "Popular family beach destination with long sandy shores and seafood shacks.",
    description:
      "Digha is West Bengal's most popular beach destination, offering wide sandy beaches, gentle waves, and a relaxed coastal atmosphere. Perfect for family vacations with beach activities, seafood, and sunset views.",
    tags: ["Beaches", "Family", "WeekendGetaway", "Seafood"],
    bestTime: "Oct–Mar",
    rating: 0,
    reviewsCount: 0,
    priceFrom: "₹1,800",
    nearbyHotels: ["Hotel Sonar Bangla Digha", "Digha Sea Beach Resort", "Budget Beach Hotel"],
    nearbyRestaurants: ["Seafood Shack Digha", "Local Fish Market Stalls"],
    nearbyPlaces: ["Mandarmani", "Tajpur", "Shankarpur"],
    highlights: [
      "New Digha Beach",
      "Old Digha Beach",
      "Marine Aquarium",
      "Amarabati Park",
      "Science Centre",
    ],
    activities: ["Beach Sports", "Swimming", "Sunset Viewing", "Seafood Dining", "Shopping"],
  },
  {
    title: "Mandarmani",
    slug: "mandarmani",
    region: "Coastal Bengal",
    district: "Purba Medinipur",
    coordinates: { lat: 21.6377, lng: 87.4074 },
    heroImage: {
      url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200",
      alt: "Mandarmani long beach and riders",
    },
    excerpt: "Long drivable beach with resorts, water sports and quiet stretches.",
    description:
      "Mandarmani boasts one of the longest drivable beaches in India. With pristine sands, modern beach resorts, and a variety of water sports, it's a perfect weekend getaway for adventure seekers and beach lovers.",
    tags: ["Beaches", "WaterSports", "Relaxation"],
    bestTime: "Oct–Feb",
    rating: 0,
    reviewsCount: 0,
    priceFrom: "₹2,500",
    nearbyHotels: ["Mandarmani Beach Resort", "Windflower Resort Mandarmani", "Budget Resort"],
    nearbyRestaurants: ["Beachfront Cafe", "Seafood Plaza Mandarmani"],
    nearbyPlaces: ["Digha", "Tajpur", "Shankarpur"],
    highlights: ["13km Drivable Beach", "Red Crab Watching", "Water Sports Hub", "Beach Camping"],
    activities: ["Beach Drive", "ATV Rides", "Parasailing", "Jet Skiing", "Beach Volleyball"],
  },
  {
    title: "Victoria Memorial",
    slug: "victoria-memorial-kolkata",
    region: "Kolkata Metro",
    district: "Kolkata",
    coordinates: { lat: 22.5448, lng: 88.3426 },
    heroImage: {
      url: "https://images.unsplash.com/photo-1562979314-bee7453e911c?w=1200",
      alt: "Victoria Memorial at sunset",
    },
    excerpt: "Iconic marble memorial and museum set in landscaped gardens — Kolkata's landmark.",
    description:
      "The Victoria Memorial is an architectural masterpiece built in memory of Queen Victoria. This stunning white marble building houses a museum with rare artifacts, paintings, and manuscripts from the British era, set in beautifully landscaped gardens.",
    tags: ["Museum", "Heritage", "Garden", "Photography"],
    bestTime: "Oct–Mar",
    rating: 0,
    reviewsCount: 0,
    priceFrom: "Free (Museum ₹30)",
    nearbyHotels: ["The Oberoi Grand", "Taj Bengal", "ITC Sonar"],
    nearbyRestaurants: ["Peter Cat", "6 Ballygunge Place", "Bhojohori Manna"],
    nearbyPlaces: ["Maidan", "St. Paul's Cathedral", "Indian Museum"],
    highlights: [
      "Museum Galleries",
      "Light & Sound Show",
      "Garden Walks",
      "Royal Artifacts",
      "Portrait Gallery",
    ],
    activities: ["Museum Tour", "Photography", "Garden Picnics", "Evening Light Show"],
  },
  {
    title: "Gorumara National Park",
    slug: "gorumara-national-park",
    region: "Dooars",
    district: "Jalpaiguri / Dooars",
    coordinates: { lat: 26.7568, lng: 89.8898 },
    heroImage: {
      url: "https://images.unsplash.com/photo-1535338454770-eb7c2e8019b6?w=1200",
      alt: "Gorumara national park elephant sightings and grasslands",
    },
    excerpt: "Known for large herds of elephants and easy jungle safaris in the Dooars.",
    description:
      "Gorumara National Park is famous for its large population of Indian one-horned rhinoceros and Asian elephants. The park offers jeep and elephant safaris through dense forests and grasslands, providing excellent wildlife viewing opportunities.",
    tags: ["Wildlife", "JungleSafari", "ElephantSightings", "EcoLodge"],
    bestTime: "Nov–Apr",
    rating: 0,
    reviewsCount: 0,
    priceFrom: "₹3,200",
    nearbyHotels: ["Gorumara Forest Lodge", "Jungle Retreat Dooars", "Eco Resort Gorumara"],
    nearbyRestaurants: ["Lodge Dining Hall", "Local Eateries"],
    nearbyPlaces: ["Jaldapara", "Lataguri", "Chapramari"],
    highlights: [
      "Elephant Safari",
      "Jeep Safari",
      "Rhino Sightings",
      "Watchtowers",
      "Bird Watching",
    ],
    activities: ["Wildlife Safari", "Nature Walks", "Photography", "Bird Watching"],
  },
  {
    title: "Jaldapara National Park",
    slug: "jaldapara-national-park",
    region: "Dooars",
    district: "Alipurduar",
    coordinates: { lat: 26.5168, lng: 89.0423 },
    heroImage: {
      url: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200",
      alt: "Jaldapara rhino sighting and grasslands",
    },
    excerpt: "Home to the one-horned Indian rhino and rich Dooars biodiversity.",
    description:
      "Jaldapara National Park is renowned for its population of Indian one-horned rhinoceros. The park's vast grasslands and riverine forests support diverse wildlife including elephants, leopards, and numerous bird species.",
    tags: ["Wildlife", "Rhino", "Safari", "EcoTourism"],
    bestTime: "Nov–Apr",
    rating: 0,
    reviewsCount: 0,
    priceFrom: "₹3,000",
    nearbyHotels: ["Jaldapara Safari Lodge", "Forest Guest House", "Eco Campsites"],
    nearbyRestaurants: ["Camp Dining", "Local Snacks"],
    nearbyPlaces: ["Gorumara", "Chilapata Forest", "Buxa Tiger Reserve"],
    highlights: [
      "Rhino Safari",
      "Torsa River Views",
      "Mahakal Watchtower",
      "Hollong Forest",
    ],
    activities: ["Jungle Safari", "Wildlife Photography", "River Crossing", "Bird Watching"],
  },
  {
    title: "Murshidabad",
    slug: "murshidabad",
    region: "Murshidabad Division",
    district: "Murshidabad",
    coordinates: { lat: 24.175, lng: 88.271 },
    heroImage: {
      url: "https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=1200",
      alt: "Hazarduari Palace in Murshidabad",
    },
    excerpt: "Former Nawabi capital with Hazarduari Palace, museums and riverfront heritage.",
    description:
      "Murshidabad was the last independent capital of Bengal before the British takeover. The town is rich in Nawabi heritage with magnificent palaces, mosques, and gardens along the Bhagirathi River.",
    tags: ["Heritage", "Nawabi", "Palace", "Museum"],
    bestTime: "Oct–Mar",
    rating: 0,
    reviewsCount: 0,
    priceFrom: "₹1,200",
    nearbyHotels: ["Heritage Rest House Murshidabad", "Nawabi Guest House"],
    nearbyRestaurants: ["Local Mughlai Eateries", "Riverfront Cafes"],
    nearbyPlaces: ["Plassey", "Khagra", "Jiaganj"],
    highlights: [
      "Hazarduari Palace (1000 doors)",
      "Katra Mosque",
      "Nizamat Imambara",
      "Motijheel Gardens",
      "Jafraganj Cemetery",
    ],
    activities: ["Palace Tours", "Heritage Walks", "Museum Visits", "Photography"],
  },
  {
    title: "Howrah Bridge & Riverfront",
    slug: "howrah-hooghly-riverfront",
    region: "Kolkata Metro",
    district: "Howrah/Hooghly",
    coordinates: { lat: 22.5878, lng: 88.329 },
    heroImage: {
      url: "https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=1200",
      alt: "Howrah Bridge and Hooghly riverfront at dusk",
    },
    excerpt: "Iconic Howrah Bridge, river cruises, ghats and colonial heritage along the Hooghly.",
    description:
      "The Howrah Bridge is Kolkata's most iconic landmark, a massive cantilever bridge spanning the Hooghly River. The riverfront offers stunning views, ferry rides, and a glimpse into the city's vibrant river culture.",
    tags: ["Heritage", "RiverCruise", "Colonial", "Photography"],
    bestTime: "Oct–Feb",
    rating: 0,
    reviewsCount: 0,
    priceFrom: "Free",
    nearbyHotels: ["Ramada by Wyndham Howrah", "Hotel Hindusthan International", "Peerless Inn"],
    nearbyRestaurants: ["Riverfront Cafe", "Park Street eateries", "Local Bengali Cuisine"],
    nearbyPlaces: ["Dakshineswar", "Belur Math", "Mullick Ghat Flower Market"],
    highlights: [
      "Howrah Bridge Walk",
      "River Cruise",
      "Mullick Ghat Flower Market",
      "Evening Light Show",
    ],
    activities: ["River Cruise", "Photography", "Bridge Walk", "Market Visit"],
  },
  {
    title: "Dakshineswar Kali Temple",
    slug: "dakshineswar-kali-temple",
    region: "Greater Kolkata",
    district: "North 24 Parganas",
    coordinates: { lat: 22.6304, lng: 88.3718 },
    heroImage: {
      url: "https://images.unsplash.com/photo-1582632909999-850952e1f4fe?w=1200",
      alt: "Dakshineswar Kali Temple and Hooghly river view",
    },
    excerpt: "Famous riverside Kali temple with grand rituals and pilgrimage activity.",
    description:
      "Dakshineswar Kali Temple is one of the most revered Hindu temples in West Bengal. Built in the 19th century, this stunning riverside temple complex is associated with the mystic Ramakrishna Paramahamsa and attracts thousands of devotees daily.",
    tags: ["Temple", "Pilgrimage", "Heritage"],
    bestTime: "Oct–Feb",
    rating: 0,
    reviewsCount: 0,
    priceFrom: "Free",
    nearbyHotels: ["Local Guesthouses Howrah", "Riverfront Lodges"],
    nearbyRestaurants: ["Temple Prasad Stalls", "Nearby Bengali Eateries"],
    nearbyPlaces: ["Belur Math", "Howrah Bridge", "Adyapeath"],
    highlights: [
      "Main Kali Temple",
      "12 Shiva Temples",
      "Ramakrishna Room",
      "River Ghat",
      "Evening Aarti",
    ],
    activities: ["Temple Darshan", "River Views", "Photography", "Spiritual Tours"],
  },
  {
    title: "Park Street & Nightlife",
    slug: "park-street-nightlife",
    region: "Kolkata Metro",
    district: "Kolkata",
    coordinates: { lat: 22.5416, lng: 88.352 },
    heroImage: {
      url: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1200",
      alt: "Park Street lit at night with restaurants",
    },
    excerpt: "Historic nightlife hub — restaurants, bars, and festive lights at Christmas.",
    description:
      "Park Street is the heart of Kolkata's dining and nightlife scene. Known for its iconic restaurants, pubs, and vibrant Christmas celebrations, this colonial-era street is a must-visit for food lovers and night owls.",
    tags: ["Nightlife", "Food", "Historic", "Events"],
    bestTime: "All year (special events in December)",
    rating: 0,
    reviewsCount: 0,
    priceFrom: "₹500-2000",
    nearbyHotels: ["The Park Kolkata", "Taj Bengal", "Peerless Inn"],
    nearbyRestaurants: ["Peter Cat", "Flurys", "Barbecue Nation"],
    nearbyPlaces: ["Victoria Memorial", "Maidan", "New Market"],
    highlights: [
      "Peter Cat (Chelo Kebab)",
      "Flurys Tearoom",
      "Christmas Celebrations",
      "Historic Pubs",
      "Live Music Venues",
    ],
    activities: ["Dining", "Pub Hopping", "Shopping", "Christmas Lights", "Live Music"],
  },
  {
    title: "Kumartuli",
    slug: "kumartuli",
    region: "Kolkata Metro",
    district: "Kolkata",
    coordinates: { lat: 22.585, lng: 88.3526 },
    heroImage: {
      url: "https://images.unsplash.com/photo-1598213505160-77fc91ee2b42?w=1200",
      alt: "Kumartuli workshops and sculptors",
    },
    excerpt: "Traditional potter quarter where artisans craft the idols for Durga Puja.",
    description:
      "Kumartuli is the traditional potters' quarter of North Kolkata, where skilled artisans create beautiful clay idols for Durga Puja and other festivals. A visit here offers a fascinating glimpse into the art and craft behind Bengal's most celebrated festival.",
    tags: ["Artisan", "Culture", "Puja", "Handicraft"],
    bestTime: "Aug–Oct (Puja prep and Durga Puja season)",
    rating: 0,
    reviewsCount: 0,
    priceFrom: "Free",
    nearbyHotels: ["Local Heritage Guesthouses", "Boutique Kolkata Stays"],
    nearbyRestaurants: ["Street Food Stalls", "Local Bengali Cafes"],
    nearbyPlaces: ["College Street", "Sovabazar", "Bagbazar"],
    highlights: [
      "Idol Making Workshops",
      "Artisan Interactions",
      "Photography Tours",
      "Cultural Heritage",
    ],
    activities: ["Artisan Visits", "Photography", "Cultural Tours", "Festival Preparations"],
  },
  {
    title: "Cooch Behar Palace",
    slug: "cooch-behar",
    region: "North Bengal Plains",
    district: "Cooch Behar",
    coordinates: { lat: 26.3167, lng: 89.4605 },
    heroImage: {
      url: "https://images.unsplash.com/photo-1593116792451-b44366e8ff78?w=1200",
      alt: "Cooch Behar palace facade and gardens",
    },
    excerpt: "Royal palace town with sprawling forts, palaces and Mughal-influenced architecture.",
    description:
      "The Cooch Behar Palace is a stunning example of classical European architecture blended with Mughal influences. Built in 1887, this magnificent palace showcases the grandeur of the erstwhile royal family of Cooch Behar.",
    tags: ["Palace", "Heritage", "Architecture"],
    bestTime: "Oct–Mar",
    rating: 0,
    reviewsCount: 0,
    priceFrom: "₹50",
    nearbyHotels: ["Cooch Behar Heritage Hotel", "Palace Guest House"],
    nearbyRestaurants: ["Local Bengali Cafes", "Heritage Dining"],
    nearbyPlaces: ["Madan Mohan Temple", "Baneswar Shiva Temple", "Rasikbil Bird Sanctuary"],
    highlights: [
      "Palace Architecture",
      "Royal Museum",
      "Landscaped Gardens",
      "Durbar Hall",
    ],
    activities: ["Palace Tour", "Photography", "Museum Visit", "Garden Walks"],
  },
  {
    title: "Purulia - Chhau Dance Region",
    slug: "purulia",
    region: "West Bengal Interior",
    district: "Purulia",
    coordinates: { lat: 23.3319, lng: 85.55 },
    heroImage: {
      url: "https://images.unsplash.com/photo-1618032934249-947486f48669?w=1200",
      alt: "Purulia Chhau dancers with masks",
    },
    excerpt: "Cultural hub for Chhau dance, tribal arts and rugged landscapes.",
    description:
      "Purulia is famous for the traditional Chhau dance, a UNESCO-recognized masked dance form. The district also offers rugged landscapes, ancient temples, and vibrant tribal culture, making it a unique offbeat destination.",
    tags: ["ChhauDance", "TribalArts", "Offbeat", "Festivals"],
    bestTime: "Oct–Apr",
    rating: 0,
    reviewsCount: 0,
    priceFrom: "₹1,000",
    currentFestivals: ["Chhau Dance Festival (Apr)"],
    nearbyHotels: ["Local Homestays Purulia", "Heritage Guest Houses"],
    nearbyRestaurants: ["Village Eateries", "Tribal Food Stalls"],
    nearbyPlaces: ["Ayodhya Hills", "Joychandi Pahar", "Baranti"],
    highlights: [
      "Chhau Dance Performances",
      "Tribal Villages",
      "Ayodhya Hills",
      "Panchet Dam",
      "Baranti Lake",
    ],
    activities: ["Dance Performances", "Tribal Village Tours", "Hill Trekking", "Photography"],
  },
  {
    title: "Raiganj Bird Sanctuary",
    slug: "raiganj-bird-sanctuary",
    region: "North Bengal Plains",
    district: "Uttar Dinajpur",
    coordinates: { lat: 25.6186, lng: 88.129 },
    heroImage: {
      url: "https://images.unsplash.com/photo-1552083375-1447ce886485?w=1200",
      alt: "Migratory birds at Raiganj sanctuary",
    },
    excerpt: "Important wetland for migratory waterbirds — a paradise for birdwatchers.",
    description:
      "Raiganj Bird Sanctuary is one of the largest heronries in Asia. During the breeding season (June-September), thousands of water birds including openbill storks, egrets, and cormorants flock to this sanctuary.",
    tags: ["BirdWatching", "Nature", "Wetlands"],
    bestTime: "Nov–Feb (migratory season)",
    rating: 0,
    reviewsCount: 0,
    priceFrom: "₹50",
    nearbyHotels: ["Raiganj Guest House", "Birdwatcher Lodge"],
    nearbyRestaurants: ["Local Cafes", "Simple Eateries"],
    nearbyPlaces: ["Kulik Bird Sanctuary", "Karnajora"],
    highlights: [
      "Openbill Stork Colonies",
      "Watchtowers",
      "Breeding Grounds",
      "Bird Photography",
    ],
    activities: ["Bird Watching", "Photography", "Nature Walks", "Boat Rides"],
  },
  {
    title: "Siliguri - Gateway to Northeast",
    slug: "siliguri",
    region: "North Bengal Plains",
    district: "Darjeeling / Jalpaiguri",
    coordinates: { lat: 26.7271, lng: 88.3953 },
    heroImage: {
      url: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200",
      alt: "Siliguri cityscape and transport hub",
    },
    excerpt: "Major transport hub & gateway to Dooars, Darjeeling and northeast India.",
    description:
      "Siliguri is the commercial and transport hub of North Bengal. While not a tourist destination itself, it serves as the perfect base for exploring Darjeeling, Dooars, Sikkim, and Northeast India. The city offers good shopping, dining, and accommodation options.",
    tags: ["Gateway", "Transport", "Shopping", "City"],
    bestTime: "All year (useful base for travel)",
    rating: 0,
    reviewsCount: 0,
    priceFrom: "₹800",
    nearbyHotels: ["Hotel Tathagata Siliguri", "Central Hotels Siliguri"],
    nearbyRestaurants: ["Local Eateries", "Chinese Cuisine Hubs"],
    nearbyPlaces: ["Mahananda Wildlife Sanctuary", "Salugara Monastery", "ISKCON Temple"],
    highlights: [
      "Hong Kong Market",
      "Mahananda Wildlife Sanctuary",
      "Salugara Monastery",
      "City Centre Mall",
    ],
    activities: ["Shopping", "Temple Visits", "Local Food Tours", "Transit Hub"],
  },
  {
    title: "Chandannagar - French Heritage",
    slug: "chandannagar",
    region: "Hooghly",
    district: "Hooghly",
    coordinates: { lat: 22.872, lng: 88.375 },
    heroImage: {
      url: "https://images.unsplash.com/photo-1549144511-f099e773c147?w=1200",
      alt: "Chandannagar colonial buildings and riverfront",
    },
    excerpt: "Former French colony with colonial architecture, promenades and river views.",
    description:
      "Chandannagar (Chandernagore) was a French colony for 260 years and still retains its European charm. The riverside promenade, colonial buildings, and the grand Jagaddhatri Puja make it a unique heritage destination.",
    tags: ["Colonial", "Heritage", "Riverfront", "Festival"],
    bestTime: "Oct–Feb",
    rating: 0,
    reviewsCount: 0,
    priceFrom: "₹500",
    currentFestivals: ["Jagaddhatri Puja (Nov)"],
    nearbyHotels: ["Chandannagar Heritage Guest House", "River View Lodges"],
    nearbyRestaurants: ["French Cafe", "Local Bengali Restaurants"],
    nearbyPlaces: ["Serampore", "Hooghly Imambara", "Bandel Church"],
    highlights: [
      "Strand Promenade",
      "French Church",
      "Institute de Chandernagor",
      "Jagaddhatri Puja",
      "Colonial Buildings",
    ],
    activities: ["Heritage Walks", "River Promenade", "Museum Visits", "Photography"],
  },
  {
    title: "Taki - Ichamati River",
    slug: "taki",
    region: "Sundarbans Fringe",
    district: "North 24 Parganas",
    coordinates: { lat: 22.589, lng: 88.838 },
    heroImage: {
      url: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1200",
      alt: "Taki riverside and boat scenes on Ichamati",
    },
    excerpt: "Riverside town on Ichamati with boat rides, riverine villages and markets.",
    description:
      "Taki is a tranquil riverside town on the banks of the Ichamati River, which forms the India-Bangladesh border. Known for boat cruises, river views, and peaceful rural settings, it's an emerging weekend destination.",
    tags: ["RiverCruise", "Offbeat", "LocalLife"],
    bestTime: "Oct–Mar",
    rating: 0,
    reviewsCount: 0,
    priceFrom: "₹800",
    nearbyHotels: ["Riverside Guesthouses Taki", "Local Lodges"],
    nearbyRestaurants: ["Riverfront Fish Stalls", "Local Bengali Eateries"],
    nearbyPlaces: ["Bonbibi Bagan", "Hasnabad", "Boyra"],
    highlights: [
      "Ichamati River Cruise",
      "River Ghat",
      "Local Fish Markets",
      "Rural Villages",
    ],
    activities: ["River Cruise", "Fishing", "Village Walks", "Photography"],
  },
  {
    title: "Bakkhali & Fraserganj",
    slug: "bakkhali-fraserganj",
    region: "Coastal Bengal",
    district: "South 24 Parganas",
    coordinates: { lat: 21.7895, lng: 88.182 },
    heroImage: {
      url: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200",
      alt: "Bakkhali beach and tidal flats",
    },
    excerpt: "Quiet beach stretch with islands, sunrise views and simple coastal life.",
    description:
      "Bakkhali is a serene beach destination with wide sandy shores, tranquil waters, and spectacular sunrises. Nearby Fraserganj offers a lighthouse and quieter stretches. Perfect for those seeking solitude by the sea.",
    tags: ["Beaches", "Offbeat", "IslandCruise"],
    bestTime: "Oct–Feb",
    rating: 0,
    reviewsCount: 0,
    priceFrom: "₹1,200",
    nearbyHotels: ["Bakkhali Beach Resort", "Fraser Lodge"],
    nearbyRestaurants: ["Beach Shacks", "Lodge Dining"],
    nearbyPlaces: ["Henry's Island", "Jambu Dwip", "Gangasagar"],
    highlights: [
      "Sunrise Beach",
      "Fraserganj Lighthouse",
      "Henry's Island",
      "Calm Waters",
    ],
    activities: ["Beach Walks", "Sunrise Viewing", "Island Hopping", "Fishing"],
  },
  {
    title: "Tajpur Beach",
    slug: "tajpur",
    region: "Coastal Bengal",
    district: "Purba Medinipur",
    coordinates: { lat: 21.6635, lng: 87.7052 },
    heroImage: {
      url: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200",
      alt: "Tajpur black sand beaches and surf",
    },
    excerpt: "Emerging surf and beach destination with quieter shores and dunes.",
    description:
      "Tajpur is an emerging coastal destination known for its unique red crabs, casuarina groves, and quieter beaches. Less commercialized than Digha, it's perfect for nature lovers and those seeking a peaceful beach experience.",
    tags: ["Beaches", "Surf", "Offbeat", "WeekendGetaway"],
    bestTime: "Oct–Feb",
    rating: 0,
    reviewsCount: 0,
    priceFrom: "₹1,500",
    nearbyHotels: ["Tajpur Sands Resort", "Local Beach Lodges"],
    nearbyRestaurants: ["Seafood Shacks", "Cafe Tajpur"],
    nearbyPlaces: ["Mandarmani", "Digha", "Shankarpur"],
    highlights: [
      "Red Crab Beaches",
      "Casuarina Forests",
      "Quiet Stretches",
      "Sand Dunes",
    ],
    activities: ["Beach Camping", "Crab Watching", "Photography", "Nature Walks"],
  },
  {
    title: "Bankura - Art & Craft Hub",
    slug: "bankura",
    region: "West Bengal Interior",
    district: "Bankura",
    coordinates: { lat: 23.2327, lng: 87.0765 },
    heroImage: {
      url: "https://images.unsplash.com/photo-1582632909999-850952e1f4fe?w=1200",
      alt: "Bankura rural landscape and artisans",
    },
    excerpt: "Region famous for terracotta craft, folk art and rural festivals.",
    description:
      "Bankura district is renowned for its handicrafts, especially the famous Bankura horse (terracotta). The region offers rural landscapes, terracotta temples, and a rich tradition of folk arts and crafts.",
    tags: ["Handicraft", "Terracotta", "FolkArt"],
    bestTime: "Oct–Mar",
    rating: 0,
    reviewsCount: 0,
    priceFrom: "₹600",
    nearbyHotels: ["Local Heritage Lodges", "Artisan Homestays"],
    nearbyRestaurants: ["Village Eateries", "Local Sweet Shops"],
    nearbyPlaces: ["Bishnupur", "Mukutmanipur", "Susunia"],
    highlights: [
      "Bankura Horse Craft",
      "Terracotta Art",
      "Folk Art Villages",
      "Rural Landscapes",
    ],
    activities: ["Craft Shopping", "Village Tours", "Artisan Visits", "Photography"],
  },
  {
    title: "Hazarduari Palace",
    slug: "hazarduari-palace",
    region: "Murshidabad Division",
    district: "Murshidabad",
    coordinates: { lat: 24.177, lng: 88.278 },
    heroImage: {
      url: "https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=1200",
      alt: "Hazarduari Palace grand facade",
    },
    excerpt: "Massive palace with thousands of doors — explore the Nawabi legacy and museums.",
    description:
      "Hazarduari Palace, meaning 'Palace of a Thousand Doors', is a magnificent structure with 1000 doors (only 100 are real). Built in 1837, it now houses a museum with rare artifacts from the Nawabi era.",
    tags: ["Palace", "Museum", "Heritage"],
    bestTime: "Oct–Mar",
    rating: 0,
    reviewsCount: 0,
    priceFrom: "₹50",
    nearbyHotels: ["Nawabi Heritage Hotel", "Riverfront Guesthouse"],
    nearbyRestaurants: ["Local Mughlai Restaurants", "Heritage Cafe"],
    nearbyPlaces: ["Katra Mosque", "Nizamat Imambara", "Motijheel"],
    highlights: [
      "1000 Doors Mystery",
      "Nawabi Museum",
      "Royal Artifacts",
      "Grand Durbar Hall",
      "Mirror Room",
    ],
    activities: ["Palace Tour", "Museum Visit", "Photography", "Heritage Walks"],
  },
  {
    title: "Shantiniketan Poush Mela",
    slug: "poush-mela-shantiniketan",
    region: "Central Bengal",
    district: "Birbhum",
    coordinates: { lat: 23.676, lng: 87.681 },
    heroImage: {
      url: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200",
      alt: "Poush Mela crafts and folk performers",
    },
    excerpt: "Seasonal craft fair and cultural gathering — Baul songs, stalls and local art.",
    description:
      "Poush Mela is an annual fair held in Shantiniketan during December-January. Started by Maharshi Debendranath Tagore, this vibrant fair showcases Bengal's folk culture, Baul music, handicrafts, and local cuisine.",
    tags: ["Mela", "FolkMusic", "Crafts", "Seasonal"],
    bestTime: "December (Poush Mela)",
    rating: 0,
    reviewsCount: 0,
    priceFrom: "Free entry",
    currentFestivals: ["Poush Mela (Dec 23-25)", "Basanta Utsav (Mar)"],
    nearbyHotels: ["Poush Mela Guest Lodges", "Tagore Guest House"],
    nearbyRestaurants: ["Festival Stalls", "Local Cafes"],
    nearbyPlaces: ["Visva-Bharati", "Amar Kutir", "Kankalitala"],
    highlights: [
      "Baul Singer Performances",
      "Craft Stalls (500+)",
      "Folk Dance",
      "Local Cuisine",
      "Art Exhibitions",
    ],
    activities: ["Fair Shopping", "Folk Music", "Cultural Programs", "Food Tasting"],
  },
  {
    title: "Torsa Falls - Dooars Offbeat",
    slug: "torsa-falls",
    region: "Dooars",
    district: "Alipurduar",
    coordinates: { lat: 26.709, lng: 89.268 },
    heroImage: {
      url: "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=1200",
      alt: "Torsa waterfall and forested gorge",
    },
    excerpt: "Scenic waterfall and offbeat nature spot in the Dooars region.",
    description:
      "Torsa Falls is a hidden gem in the Dooars region, offering pristine natural beauty and tranquility. The waterfall is surrounded by dense forests and requires a short trek, making it perfect for adventure seekers and nature lovers.",
    tags: ["Waterfall", "Offbeat", "Nature", "Trekking"],
    bestTime: "Oct–May",
    rating: 0,
    reviewsCount: 0,
    priceFrom: "₹200",
    nearbyHotels: ["Dooars Eco Camp", "Forest Homestay"],
    nearbyRestaurants: ["Camp Kitchen", "Local Eateries"],
    nearbyPlaces: ["Jaldapara", "Buxa Tiger Reserve", "Jayanti"],
    highlights: [
      "Waterfall Trek",
      "Forest Trails",
      "River Bathing",
      "Bird Watching",
    ],
    activities: ["Trekking", "Photography", "Nature Walks", "Picnicking"],
  },
];

// Helper functions for filtering and searching
export function getPlaceBySlug(slug: string): Place | undefined {
  return places.find((place) => place.slug === slug);
}

export function getPlacesByTag(tag: string): Place[] {
  return places.filter((place) => place.tags.includes(tag));
}

export function getPlacesByRegion(region: string): Place[] {
  return places.filter((place) => place.region === region);
}

export function searchPlaces(query: string): Place[] {
  const lowercaseQuery = query.toLowerCase();
  return places.filter(
    (place) =>
      place.title.toLowerCase().includes(lowercaseQuery) ||
      place.excerpt.toLowerCase().includes(lowercaseQuery) ||
      place.district.toLowerCase().includes(lowercaseQuery) ||
      place.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery))
  );
}

export function getNearbyPlaces(slug: string): Place[] {
  const place = getPlaceBySlug(slug);
  if (!place || !place.nearbyPlaces) return [];

  return places.filter((p) => place.nearbyPlaces?.includes(p.title));
}

// Get all unique tags
export function getAllTags(): string[] {
  const tagsSet = new Set<string>();
  places.forEach((place) => {
    place.tags.forEach((tag) => tagsSet.add(tag));
  });
  return Array.from(tagsSet).sort();
}

// Get all unique regions
export function getAllRegions(): string[] {
  const regionsSet = new Set<string>();
  places.forEach((place) => regionsSet.add(place.region));
  return Array.from(regionsSet).sort();
}
