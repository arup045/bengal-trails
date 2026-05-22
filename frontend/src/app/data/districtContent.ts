// districtContent.ts — rich, sectioned content for each West Bengal district.
//
// Each district has an "about" intro plus six sections. Items are names (photos
// can be layered on later); the district detail page renders them as category-
// coloured cards with wishlist + Google Maps directions actions.
//
// Keyed by the same slug as data/districts.ts.

export interface DistrictContent {
  about: string;
  landmarks: string[];   // Tourist Places & Major Landmarks
  parks: string[];       // Stadiums, Arenas & Public Parks
  activities: string[];  // Popular Local Activities & Experiences
  foods: string[];       // Iconic Local & Street Foods
  foodZones: string[];   // Famous Street Food Zones & Culinary Hubs
  stays: string[];       // Prominent Hotels & Famous Restaurants
}

export const DISTRICT_CONTENT: Record<string, DistrictContent> = {
  kolkata: {
    about:
      "The City of Joy and India's cultural capital. Once the seat of British India, Kolkata blends colonial grandeur, literary cafés, rattling trams, and the world's grandest Durga Puja. From the marble of Victoria Memorial to the book stalls of College Street and the ghats of the Hooghly, every lane has a story — best enjoyed with a kathi roll and a cup of cha.",
    landmarks: ['Victoria Memorial Hall', 'Indian Museum', 'Marble Palace Mansion', 'Jorasanko Thakurbari', 'Science City Complex', 'Birla Planetarium', 'Princep Ghat', 'South Park Street Cemetery', 'Kumartuli Clay Potters Quarter', "St. Paul's Cathedral", 'Kalighat Kali Temple', 'Dakshineswar Kali Temple', 'Belur Math', 'Mother House', 'Sovabazar Rajbari', 'College Street Boi Para', "Writer's Building", 'Shaheed Minar', 'Millennium Park Riverside Promenade', 'Town Hall Kolkata', 'Gariahat Market Hub', 'Babu Ghat', 'Netaji Bhawan'],
    parks: ['Eden Gardens', 'Eco Park', 'Salt Lake Stadium (Vivekananda Yuba Bharati Krirangan)', 'Netaji Indoor Stadium', 'Alipore Zoological Gardens', 'Maidan (Brigade Parade Ground)', 'Rabindra Sarobar Lake & Park', 'Central Park (Salt Lake)', 'Mohun Bagan Ground', 'East Bengal Ground', 'Mohammedan Sporting Ground', 'Elliot Park', 'Millennium Park', 'Deshabandhu Park', 'Subhash Sarobar Park', 'Nalban Boating Park', "Citizen's Park (Nandan Campus)", 'Nicco Park Amusement Center', 'Aquatica Water Park'],
    activities: ['Hooghly River Sunset Cruise', 'Hand-pulled Rickshaw Riding', 'Vintage Tram Journey', 'Early Morning Heritage Walking Tours', 'Pujo Pandal Hopping (Seasonal)', 'Book Hunting at College Street', 'Boat Riding at Princep Ghat', 'Photography at Kumartuli Studios', 'Bird Watching at Santragachi Jheel', 'Bowling & Laser Tag at Science City', 'Cycling around New Town Eco Park'],
    foods: ['Kolkata Mutton Biryani (with potato & egg)', 'Kathi Rolls (chicken, egg, mutton, paneer)', 'Puchka (tamarind water bombs)', 'Churmur', 'Jhalmuri', 'Telebhaja (Beguni, Alur Chop, Mochar Chop)', 'Mishti Doi', 'Rosogolla', 'Sandesh (Nolen Gur & Jalbhara)', 'Kosha Mangsho with Luchi', 'Chelo Kebab', 'Fish Fry & Fish Kabiraji', 'Mughlai Paratha', 'Shingara', 'Chhena Podo', 'Daab Chingri', 'Macher Jhol with Bhat', 'Radhaballavi with Alur Dom'],
    foodZones: ["Decker's Lane (James Hickey Sarani)", 'Vivekanand Park Puchka Zone', 'Fairlie Place Street Food Line', 'Camac Street Food Corner', 'Gariahat Crossing Chaat Line', 'Vardaan Market Street Food Lane', 'New Market Khau Galli', "Lord's Bakery Crossing Eateries", 'College Street Coffee House Zone'],
    stays: ['The Oberoi Grand, Kolkata', 'Taj Bengal', 'ITC Sonar & ITC Royal Bengal', 'The Lalit Great Eastern', 'Peter Cat', 'Flurys Pastry Shop', 'Mocambo Restaurant', 'Aminia Restaurant', 'Arsalan Restaurant', 'Shiraz Golden Restaurant', 'Bhojohori Manna', '6 Ballygunge Place', 'Oh! Calcutta', 'Mitra Cafe', "Nizam's Roll Shop", 'Kusum Rolls', 'Oly Pub', 'Bar-B-Q', 'Tung Fong', "Kewpie's Kitchen", 'Baan Thai'],
  },

  darjeeling: {
    about:
      "The Queen of the Hills — famed for world-class tea, the UNESCO Toy Train, and sunrise views of Kanchenjunga from Tiger Hill. Monasteries, colonial-era charm and misty ridgelines make Darjeeling Bengal's most beloved Himalayan retreat.",
    landmarks: ['Tiger Hill', 'Batasia Loop', 'Darjeeling Himalayan Railway (Toy Train)', 'Ghum Monastery (Yiga Choeling)', 'Observatory Hill', 'Mahakal Temple Rock Cave', 'Japanese Peace Pagoda', 'Happy Valley Tea Estate', 'Padmaja Naidu Himalayan Zoological Park', 'Himalayan Mountaineering Institute (HMI)', 'Lloyd Botanical Garden', 'Rock Garden (Barbotey)', 'Ganga Maya Park', 'Shrubbery Nightingale Park', 'Dali Monastery', 'Samten Choling Monastery', "St. Andrew's Church", 'Singalila National Park Entrance', 'Senchal Lake & Sanctuary', 'Dhirdham Temple', 'Tenzing Rock & Gombu Rock', 'Tibetan Refugee Self Help Center'],
    parks: ['Chowrasta Mall (Public Promenade)', 'Shrubbery Nightingale Park', 'Lebong Race Course Ground', 'Darjeeling Gymkhana Club', 'Sukhiapokhri Pine Forest Park', 'Jamuni Eco Tourism Park'],
    activities: ['Sunrise over Mt. Kanchenjunga', 'Toy Train Joy Ride to Ghum', 'Rock Climbing & Rappelling at Tenzing Rock', 'High-Altitude Trek to Sandakphu & Phalut', 'Tea Tasting at Happy Valley Estate', 'Mountain Biking on Senchal Trails', 'Cable Car Ride on the Darjeeling Ropeway', 'Souvenir Shopping at Chowrasta Mall', 'River Rafting in the Teesta (Triveni)'],
    foods: ['Steamed Tibetan Momos (chicken, pork, veg)', 'Thukpa (noodle soup)', 'Shaphaley (meat-stuffed fried bread)', 'Darjeeling First Flush Tea', 'Churpi (hard cheese)', 'Gundruk (fermented greens soup)', 'Alu Dum (hill style)', 'Sekuwa (charcoal-grilled meat)', 'Wai Wai Chatpat', 'Tingmo (steamed bread)', 'Sel Roti', 'Phagshapa (pork & radish stew)', 'Tibetan Butter Tea'],
    foodZones: ['Chowrasta Mall Food Kiosks', 'HD Lama Road Momo Street', 'Gandhi Road Eatery Line', 'Nehru Road Breakfast Alley', 'Ghum Station Road Tea & Snack Stalls'],
    stays: ['Windamere Hotel (Colonial Heritage)', "Glenary's — Bakery, Restaurant & Pub", 'The Elgin, Darjeeling', 'Mayfair Darjeeling', 'Cedar Inn', 'Kunga Restaurant', "Sonam's Kitchen", "Keventer's Open Air Deck", 'Shangri-La Restaurant & Bar', 'Dekevas Restaurant', 'Frank Ross Cafe', 'Hasty Tasty (Pure Veg)', 'Tom & Jerry Cafe', "Joey's Pub"],
  },

  alipurduar: {
    about:
      "The eastern gateway to the Dooars — a land of tea gardens, river beds and dense forests teeming with rhinos, elephants and tigers. Jaldapara and Buxa anchor some of Bengal's finest wildlife experiences.",
    landmarks: ['Jaldapara National Park', 'Buxa Tiger Reserve', 'Buxa Fort', 'Jayanti Riverbed', 'Lepchakha Village', 'Raimatang', 'Chilapata Forest', 'Toto Para Tribal Settlement', 'Mahakal Cave Temple', 'Sikiajhora Waterway', 'South Khayerbari Leopard Rescue Centre', 'Bhutanghat', "Rover's Point", 'Hatipota Forest Range', 'Nimati Ghat'],
    parks: ['Alipurduar District Stadium', 'Kunjanagar Eco Park', 'Nature Interpretation Centre Park', 'Hasimara Air Force Ground', 'Malangi Nature Trail Grounds'],
    activities: ['Elephant Safari in Jaldapara', 'Open Jeep Jungle Safari', 'Trek from Santalabari to Buxa Fort', 'Bird Watching at Jayanti River Basin', 'Country Boat Riding in Sikiajhora', 'Tribal Lifestyle Exploration at Totopara', 'Wildlife Photography at South Khayerbari'],
    foods: ['Dooars Bamboo Shoot Chicken', 'Boroli Fish Curry', 'Steamed Pork Momos', 'Veg & Chicken Thukpa', 'Nepali Thali Items', 'Sel Roti with Aludum', 'Sukuti (dry meat delicacy)', 'Bengali-style Fish Fry'],
    foodZones: ['Alipurduar Chowpatha Hub', 'Hasimara Market Crossing', 'Jaigaon Indo-Bhutan Border Food Lane', 'Madarihat Station Road Eateries'],
    stays: ['Hollong Tourist Lodge', 'Jaldapara Tourist Lodge', 'Sinclairs Retreat Dooars', 'Malangi Tourist Lodge', 'Chilapata Jungle Camp', 'Maa Tara Restaurant', 'Orchid Restaurant Alipurduar', 'Spice Court Restaurant'],
  },

  bankura: {
    about:
      "Bengal's terracotta heartland, home to the temple town of Bishnupur, the famous Bankura horse, Baluchari silk, and rugged hills like Susunia and Biharinath. Ancient artistry meets forested wilderness.",
    landmarks: ['Rasmancha Heritage Structure', 'Jorebangla Temple', 'Madanmohan Temple', 'Shyamrai Temple', 'Radhashyam Temple', 'Mukutmanipur Dam', 'Susunia Hills', 'Biharinath Hill', 'Jhilimili Forest Range', 'Sutan Forest Lake', 'Panchmura Terracotta Artisan Village', 'Garh Darwaja Gate', 'Talberia Dam', 'Koko Hills Eco Zone'],
    parks: ['Bankura District Stadium', 'Mukutmanipur Deer Park & Eco Complex', 'Bishnupur Stadium', 'Susunia Adventure Park', 'Deer Park at Mukutmanipur'],
    activities: ['Terracotta Craft Shopping at Panchmura', 'Rock Climbing & Trekking at Susunia', 'Speed Boating at Mukutmanipur Reservoir', 'Baluchari Silk Weaving Watching', 'Wilderness Camping in Joypur Forest'],
    foods: ['Postor Bora (poppy seed fritters)', 'Mecha Sandesh', 'Pera of Beliatore', 'Bishnupur Motichoor Ladoo', 'Poramatir Haat Snacks', 'Telebhaja (Alur Chop, Beguni)', 'Ghugni-Muri Combo'],
    foodZones: ['Machantala Crossing Food Zone', 'Bishnupur Rasmancha Periphery', 'Nutanchati Street Food Market', 'Bankura Station Road Line'],
    stays: ['Peerless Resort Mukutmanipur', 'Bishnupur Tourist Lodge', 'Hotel Sagarika Mukutmanipur', 'Kalinga Restaurant Bishnupur', 'Monalisa Restaurant Bankura', 'Saptarishi Hotel & Restaurant'],
  },

  birbhum: {
    about:
      "The soul of rural Bengal — Tagore's Shantiniketan, the Baul minstrels, terracotta temples, and the open-air Sonajhuri haat. A district where art, music and red-soil landscapes intertwine.",
    landmarks: ['Visva-Bharati University', 'Uttarayan Complex (Tagore Ashram)', 'Khoai Sonajhuri Forest', 'Tarapith Temple', 'Bakreshwar Hot Springs & Temple', 'Kankalitala Shaktipeeth', 'Joydeb Kenduli Heritage Complex', 'Mama Bhagne Pahar Rock Formations', 'Amar Kutir Handicraft Center', 'Prakriti Bhavan Nature Art Museum', 'Nalhati Shaktipeeth', 'Fullara Attahas Temple'],
    parks: ['Bolpur Stadium', 'Suri District Stadium', 'Ballavpur Deer Park', 'Eco Park Bakreshwar', 'Deer Park Santiniketan'],
    activities: ['Handicraft Shopping at Sonajhuri Saturday Haat', 'Live Baul Music Performances', 'Holy Baths at Bakreshwar Thermal Springs', 'Traditional Pottery at Amar Kutir', 'Village Cycling Tours around Khoai'],
    foods: ['Bolpurer Morba (preserved sweet fruit)', 'Tarapith Bhog Prasad', 'Surir Morba', 'Postor Bora (poppy fritters)', 'Radhaballavi with Cholar Dal', 'Langcha', 'Khoai Haat Khichuri Thali'],
    foodZones: ['Bolpur Station Road Eateries', 'Sonajhuri Haat Food Stalls', 'Suri Bus Stand Food Plaza', 'Prantik Station Market Line'],
    stays: ['Ram Shyam Village Resort', 'Mark & Meadows Resort Bolpur', 'Shakuntala Village Resort', 'Kasahara Cafe Santiniketan', 'Ghore Baire Restaurant', 'Roudradhaya Heritage Resort'],
  },

  'cooch-behar': {
    about:
      "A planned royal town built by the Koch dynasty, crowned by the Italianate Cooch Behar Palace. Tranquil lakes, bird sanctuaries and ancient temples define this gracious corner of North Bengal.",
    landmarks: ['Cooch Behar Royal Palace', 'Madan Mohan Temple', 'Sagar Dighi Lake', 'Rasikbil Bird Sanctuary', 'Baneswar Siva Temple', 'Kamteshwari Temple', 'Madhupur Dham', 'Victor Palace Ruins', 'Gosanimari Rajpat Excavation Site'],
    parks: ['MJN Stadium (Maharaja Jagaddipendra Narayan)', 'Narendra Narayan Park', 'Cooch Behar Rajbari Park'],
    activities: ['Royal Palace Guided Walk', 'Bird Watching at Rasikbil Wetlands', 'Paddle Boating in Sagar Dighi', 'Rash Mela Fair Experiences (Seasonal)'],
    foods: ['Muga Macher Jhol', 'North Bengal Spicy Jhalmuri', 'Bhapa Pitha', 'Chhena Jalebi', 'Local Duck Meat Curry', 'Shingara-Chutney Combo'],
    foodZones: ['Sagar Dighi Chowpati Food Zone', 'Cooch Behar Station Road Market', 'Rajbari Ground Food Kiosks'],
    stays: ['Hotel Royal Palace Cooch Behar', 'Cooch Behar Tourist Lodge', 'Hotel Heritage Cooch Behar', 'Monalisa Restaurant', 'Mitali Restaurant', 'Celebration Restaurant & Lounge'],
  },

  'dakshin-dinajpur': {
    about:
      "A quiet agrarian district of ancient ruins, sacred lakes and the India–Bangladesh border at Hili. Bangarh's archaeology and serene dighis reward the unhurried traveller.",
    landmarks: ['Bangarh Archaeological Ruins', 'Kal Dighi Lake', 'Dhala Dighi Lake', 'Sarongbari Forest', 'Bolla Kali Temple', 'Mahipal Dighi', 'Hili India-Bangladesh Border Checkpost', 'Patiram Thakur Estate', 'Shiv Temple of Gangarampur'],
    parks: ['Balurghat Stadium', 'Srijoni Park', 'Balurghat Children Park', 'Aranyak Children Park', 'Gangarampur High School Ground'],
    activities: ['Archaeological Touring at Bangarh', 'Migratory Bird Watching at the Lakes', 'Border View Walk at Hili Checkpost', 'Country Boat Riding in Mahipal Dighi'],
    foods: ['Balurghati Kacha Golla', 'Malpua', 'Ghee-Bhat Combo', 'Chingri Macher Tok', 'Desi Murgir Jhol'],
    foodZones: ['Balurghat Chowrangee More Food Stalls', 'Gangarampur Bus Stand Snacks Line', 'College More Street Food Row'],
    stays: ['The Hotel Lila Balurghat', 'Balurghat Lodge', 'Kokoro Farmhouse Balurghat', 'The Royal Inn Hotels & Banquet', 'Asha Banquet & Hotels', 'Atreyee Hotel', 'Mayaban Restaurant', 'Shib Loknath Hotel Restaurant'],
  },

  hooghly: {
    about:
      "A riverside ribbon of colonial history — French Chandannagar, Portuguese Bandel, and the temple towns of Tarakeswar and Kamarpukur. Terracotta shrines and Hooghly cruises define this heritage belt.",
    landmarks: ['Chandannagar Strand Promenade', 'Sacred Heart Church', 'French Museum (Dupleix Palace)', 'Bandel Church (Basilica of the Holy Rosary)', 'Hooghly Imambara', 'Tarakeswar Baba Taraknath Temple', 'Kamarpukur (Sri Ramakrishna Birthplace)', 'Hangseswari Temple, Bansberia', 'Ananta Vasudeva Terracotta Temple', 'Itachuna Rajbari Heritage Mansion', 'Sabuj Dweep Eco Island', 'Mahesh Jagannath Temple', 'Serampore Baptist Church', 'Furfura Sharif Shrine'],
    parks: ['Chinsurah District Stadium', 'Chandannagar Strand Park', 'Serampore Stadium', 'Tarakeswar Math Ground', 'Green Park Baidyabati'],
    activities: ['French Colonial Heritage Walking Tours', 'Country Boat Cruises on the Hooghly', 'Terracotta Architecture Photography at Bansberia', 'Pilgrimage Walks at Tarakeswar & Kamarpukur'],
    foods: ['Jalbhara Sandesh (Suryakumar Modak)', 'Serampore Shingara', 'Chandannagar Fried Chicken (HFC style)', 'Mughlai Paratha', 'Mishti Doi of Arambagh', 'Tandoori Kebabs', 'Fish Kabiraji'],
    foodZones: ['Chandannagar Strand Food Row', 'Chinsurah Station Road Khau Galli', 'Serampore Station Road Food Alley', 'Mankundu JC Khan Road Food Line'],
    stays: ['Itachuna Rajbari Heritage Stay', 'Hotel Plaza Hooghly', 'Avenue Plaza', 'Hotel Mahal', 'Bhooter Raja Dilo Bor Restaurant', 'Hotel De Chandernagore Restaurant', 'Red Chilli Restaurant', 'Hotel Mojlish Biryani Hub', 'Spicy Biryani', 'Turban Box Takeaway'],
  },

  howrah: {
    about:
      "Kolkata's twin across the Hooghly, anchored by the iconic Howrah Bridge, the historic Botanic Garden with its Great Banyan Tree, and the spiritual calm of Belur Math.",
    landmarks: ['Belur Math (Ramakrishna Mission HQ)', 'Acharya J.C. Bose Indian Botanic Garden', 'The Great Banyan Tree', 'Gadiara River Confluence', 'Garchumuk 58-Gates Barrage', 'Deulti (Sarat Chandra Heritage Kuthi)', 'Howrah Bridge (Rabindra Setu)', 'Santragachi Jheel Wetland', 'Howrah Rail Museum', 'Panitras Village Heritage Area'],
    parks: ['Sailen Manna Stadium (Howrah Stadium)', 'Botanic Garden Walking Tracks', 'Santragachi Jheel Conservatory Park', 'Dumurjala Sports Complex', 'Garchumuk Eco Tourism Park'],
    activities: ['Riverside Ferry Journeys across the Hooghly', 'Bird Watching at Santragachi Wetland', 'Botany Walks through Historic Plant Houses', 'Literary Heritage Excursions to Deulti'],
    foods: ['Howrah Station Special Jhalmuri', 'Langcha of Shaktigarh', 'Chingri Malaikari', 'Egg-Chicken Rolls', 'Kachori Sabzi Breakfast', 'Mutton Chop'],
    foodZones: ['Howrah Maidan Snack Market', 'Gadiara Riverfront Food Kiosks', 'Shibpur Tram Depot Eateries', 'Liluah AC Market Crossing Line'],
    stays: ['Fortune Park Panchwati Hotel', 'Country Roads Resort Howrah', 'The Central Park Hotel', 'Hotel Landmark Howrah', 'Express Inn', 'Panchwati Holiday Resorts'],
  },

  jalpaiguri: {
    about:
      "The heart of the Dooars — Gorumara and Chapramari forests, the Teesta and Murti rivers, and Himalayan hamlets like Bindu and Jhalong. Jeep safaris and riverside camps abound.",
    landmarks: ['Gorumara National Park', 'Chapramari Wildlife Sanctuary', 'Murti River Nature Strip', 'Jhalong Mountain Hamlet', 'Bindu Village & Hydel Project', 'Suntalekhola Eco Retreat', 'Rocky Island Campgrounds', 'Lataguri Forest Gate', 'Gajoldoba Teesta Barrage (Bhorer Alo)', 'Jalpesh Temple', 'Bodaganj Forest Area', 'Bhramri Devi Shaktipeeth'],
    parks: ['Jalpesh District Stadium', 'Teesta Udyan Public Park', 'Jubilee Park Jalpaiguri', 'Karala Riverfront Walking Strip', 'Lataguri Nature Interpretation Zone'],
    activities: ['Wilderness Jeep Safaris at Gorumara', 'Himalayan River Camping at Rocky Island', 'Bird Watching at Gajoldoba Wetlands', 'Stream Trekking around Suntalekhola'],
    foods: ['Fried Boroli Fish Platter', 'Dooars Bamboo Shoot Pork', 'Steamed Momo Varieties', 'Duck Meat Asafoetida Curry', 'Traditional Thukpa Bowls'],
    foodZones: ['Lataguri Market Food Kiosks', 'Jalpaiguri Kadamtala Crossing Stalls', 'Malbazar Bus Stand Snack Alley', 'Gajoldoba Waterfront Food Shacks'],
    stays: ['Murti Tourist Resort', 'Sinclairs Retreat Dooars (Chalsa)', 'Gorumara Eco Village Stay', 'Lataguri Resort Green Touch', 'Hotel Sonar Bangla Lataguri', 'Teesta Tourist Lodge'],
  },

  jhargram: {
    about:
      "A green jewel of the Jangalmahal — sal forests, a fairytale royal palace, the sacred Chilkigarh grove, and Santhal tribal culture with its Chhau masks and dhamsa drums.",
    landmarks: ['Jhargram Rajbari Palace Complex', 'Kankrajhor Sal Forest Range', 'Belpahari Hillocks', 'Chilkigarh Kanak Durga Temple (Sacred Grove)', 'Jhilli Lake Bird Sanctuary', 'Kendua Migratory Bird Village', 'Ghagra Waterfalls', 'Gurrasini Hill Hiking Point', 'Khandarani Dam Reservoir', 'Laljal Pre-historic Cave Site'],
    parks: ['Jhargram District Stadium', 'Jhargram Zoological Park (Mini Zoo)', 'Eco Tourism Park Jhargram', 'Chilkigarh Eco Park'],
    activities: ['Palace Heritage Walks & Royal Photography', 'Sacred Grove Botanical Exploring at Chilkigarh', 'Monsoon Waterfall Trekking at Ghagra', 'Chhau Mask Workshops'],
    foods: ['Shal Patar Pitha (leaf-baked rice cakes)', 'Desi Murgir Jhol (country chicken stew)', 'Postor Bora (poppy paste patties)', 'Chhena Poda Sweets', 'Telebhaja Fritters'],
    foodZones: ['Jhargram Main Market Snack Stalls', 'Belpahari Junction Food Line', 'Rajbari Ground Food Stalls'],
    stays: ['Jhargram Rajbari Heritage Tourism Property', 'Eshani Guest House Jhargram', 'Treebo Trend Horizon', 'Somani Lodge', 'Blue Bird Restaurant', 'Mohua Restaurant'],
  },

  kalimpong: {
    about:
      "A serene hill town of monasteries, flower nurseries and colonial bungalows, with paragliding off Deolo Hill and canopy walks at Lolegaon. The gateway to Lava, Rishop and Neora Valley.",
    landmarks: ['Deolo Hill Viewpoint', 'Durpin Dara Hill & Monastery', 'Pine View Cactus Nursery', 'Morgan House Colonial Mansion', 'Lava Jamgyong Kongtrul Monastery', 'Lolegaon Canopy Walk', 'Rishop Mountain Village', 'Neora Valley National Park', 'Changey Waterfall', 'Pedong Cross Hill Site', 'Jhandi Dara Viewpoint', 'Kolakham Eco Village'],
    parks: ['Kalimpong Town Ground (Mela Ground)', 'Deolo Tourist Eco Park', 'Pine View Botanical Garden', 'Durpin Dara Promenade'],
    activities: ['Tandem Paragliding from Deolo Hill', 'High-Canopy Forest Walking at Lolegaon', 'Bird Watching in Neora Valley', 'Mountain Biking through Pine Forests', 'White Water Rafting at Triveni'],
    foods: ['Kalimpong Beef & Chicken Momos', 'Tibetan Thukpa', 'Shaphaley (meat-stuffed pies)', 'Tingmo with Spicy Curry', 'Kalimpong Gouda Cheese & Churpi', 'Hill-style Alu Dum'],
    foodZones: ['Kalimpong Main Market (Rishi Road)', 'Damber Chowk Snack Line', 'Motor Stand Food Kiosks', 'Tenth Mile Food Row'],
    stays: ['Morgan House Tourism Property', 'The Elgin Silver Oaks', 'Mayfair Himalayan Spa Resort', 'King Thai Restaurant', "Gompu's Hotel & Restaurant", 'Cafe Refuel'],
  },

  malda: {
    about:
      "Land of the legendary Fazli mango and the medieval ruins of Gour and Pandua — mosques, minars and mausoleums from Bengal's sultanate past, set among silk-weaving villages.",
    landmarks: ['Bara Sona Mosque Ruins (Gaur)', 'Firoz Minar', 'Dakhil Darwaza Gate', 'Adina Mosque (Pandua)', 'Eklakhi Mausoleum', 'Adina Deer Park', 'Lukochuri Gate', 'Kadam Rasul Mosque', 'Jagjivanpur Buddhist Site', 'Malda Museum', 'Ramkeli Chaitanya Mahaprabhu Temple'],
    parks: ['DSA Stadium', 'Satya Chowdhury Indoor Stadium', 'Netaji Subhash Outdoor Stadium', 'Adina Eco-Tourism Park', 'Brindabani Public Park'],
    activities: ['Muslim Architecture & Ruins Photography', 'Silk Weaving Village Tours at Kaliachak', 'Mango Orchard Agro-Tours (Seasonal)', 'Bird Watching at Adina Sanctuary'],
    foods: ['Malda Fazli Mango Products (Seasonal)', 'Kansat Sweet Delicacy', 'Rasakadamba Sweets', 'Malda-style Jhalmuri', 'Mango Pickle Varieties', 'Maach-Bhat Meals'],
    foodZones: ['English Bazar Foyara More Hub', 'Rathbari Crossing Food Alley', 'Malda Station Road Perimeter', 'Post Office More Food Row'],
    stays: ['Golden Park Malda', 'Hotel Continental Malda', 'Malda Tourist Lodge', 'Purbanchal Hotel & Suites', 'Aqua Aura Multi-Cuisine Restaurant', 'Saffron Restaurant'],
  },

  murshidabad: {
    about:
      "The last capital of independent Bengal — a riverside theatre of Nawabi history, with the grand Hazarduari Palace, Imambara, and the silk looms that still hum along the Bhagirathi.",
    landmarks: ['Hazarduari Palace & Museum', 'Nizamat Imambara', 'Katra Mosque', 'Moti Jheel Park & Lake', 'Kathgola Palace & Gardens', 'Khosh Bagh Cemetery', 'Wasef Manzil Palace', 'Nashipur Rajbari', 'Jahankosha Big Cannon', 'Kiriteswari Shaktipeeth', 'Cossimbazar Palace Estate', 'Baranagar Terracotta Temples', 'Farakka Barrage Vista'],
    parks: ['Berhampore Stadium & Gym Complex', 'Domkal Municipal Stadium', 'Farakka Barrage Project Ground', 'Moti Jheel Eco Leisure Park', 'Hazarduari Palace Lawns'],
    activities: ['Murshidabad Silk Saree Sourcing', 'Heritage Tanga (Horse-Carriage) Rides', 'Sunset Country Boat Cruises on the Bhagirathi', 'Weapon & Painting Gallery Viewing at Hazarduari'],
    foods: ['Chhana-bor (burnt-cheese sweet)', 'Manohara Sweet Balls', 'Murshidabad Mutton Biryani', 'Postor Bora', 'Shahi Tukda', 'Mughlai Paratha'],
    foodZones: ['Berhampore Mohona Bus Stand Corridor', 'Khagra Bazar Snack Alley', 'Raninagar Crossing Stalls', 'Hazarduari Gate Heritage Food Row'],
    stays: ['Cossimbazar Palace Rajbari Heritage Stay', 'Samrat Hotel Berhampore', 'The Central Pocket Hotel', 'Sagnik Hotel Residence', 'Hindusthan Restaurant', 'Golden Heaven Family Restaurant'],
  },

  nadia: {
    about:
      "The spiritual cradle of Bengal — Mayapur's ISKCON temple, Nabadwip's Chaitanya shrines, and the handloom hubs of Shantipur and Fulia, alongside Krishnanagar's famous clay dolls and sweets.",
    landmarks: ['ISKCON Chandrodaya Temple (Mayapur)', 'Nabadwip Sri Chaitanya Shrines', 'Bethuadahari Wildlife Sanctuary', 'Krishnanagar Rajbari Gates', 'Ghurni Clay Doll Colony', 'Shantipur Handloom Cluster', 'Fulia Saree Weaving Center', 'Palashi Battlefield Monument', 'Ballal Dhipi Excavation Mound'],
    parks: ['Kalyani Municipal Stadium', 'Chakdaha Netaji Subhas Stadium', 'Ranaghat Municipal Stadium', 'Nabadwip Vivekananda Stadium', 'Bethuadahari Nature Park'],
    activities: ['Tant Handloom Saree Shopping at Fulia', 'Clay Modeling Photography at Ghurni', 'Spiritual Walks & River Crossings to Mayapur', 'Spotted Deer Trail at Bethuadahari'],
    foods: ['Krishnanagar Sarpuria Cream Sweets', 'Krishnanagar Sarbhaja', 'Nabadwip-er Lal Doi', 'Ranaghat-er Pantua', 'Highway-style Tadka Roti'],
    foodZones: ['Krishnanagar Post Office More Market', 'Kalyani Buddha Park Food Arena', 'Ranaghat Station Road Lane', 'Nabadwip Ghat Road Pilgrim Stalls'],
    stays: ['ISKCON Guest Houses (Gada & Vamsi Bhavan)', 'Hotel Haveli Kalyani', 'Royal Palace Krishnanagar', 'Radha Madhav Veg Restaurant (Mayapur)', 'Sri Krishna Hotel & Restaurant Nabadwip'],
  },

  'north-24-parganas': {
    about:
      "From the riverside calm of Taki on the Ichamati to the Dakshineswar temple and the cantonment town of Barrackpore — a district of pilgrimage, freedom-struggle history and border wetlands.",
    landmarks: ['Dakshineswar Kali Temple', 'Adyapith Temple', 'Taki Ichamati Riverfront', 'Mangal Pandey Park (Barrackpore)', 'Gandhi Ghat Memorial', 'Bibhutibhushan Wildlife Sanctuary (Parmadan)', 'Chaklahat Loknath Baba Temple', 'Chandraketugarh Archaeological Site', 'Machranga Island Eco Zone'],
    parks: ['Barasat Vidyasagar Krirangan', 'Naihati Municipal Stadium', 'Ashoke Nagar Sports Stadium', 'Mangal Pandey Eco Park', 'Jawahar Kunj Garden'],
    activities: ['Boat Riding along the Ichamati', 'Deer Forest Walking at Parmadan Woods', 'Excavation Exploration at Chandraketugarh', 'Sunset Photography at Gandhi Ghat'],
    foods: ['Kachagolla of Madhabpur', "Taki-r Chhana-r Malpua", 'Barrackpore Mutton Biryani', 'Bhetki Macher Paturi', 'Chingri Malaikari'],
    foodZones: ['Barasat Champadali More Food Row', 'Sodpur Traffic More Arcades', 'Barrackpore Station Road Mughlai Line', 'Taki Rajbari Ghat Fish Shacks'],
    stays: ['Sonar Bangla Resort Taki', 'Hotel Royal Palace Barasat', 'Shanti Guest House Barrackpore', 'Dada Boudi Biryani (Barrackpore)', 'Mezban Restaurant', 'The Peerless Inn Border Links'],
  },

  'paschim-bardhaman': {
    about:
      "Bengal's industrial powerhouse around Asansol and Durgapur, ringed by the Maithon and Panchet dam-lakes, the birthplace of poet Kazi Nazrul Islam, and forested heritage zones.",
    landmarks: ['Maithon Dam & Reservoir', 'Kalyaneswari Temple Cave', 'Panchet Dam Basin', 'Churulia (Kazi Nazrul Islam Birthplace)', 'Nehru Park Riverside (Burnpur)', 'Troika Park (Durgapur)', "Bhabani Pathak's Tilla Caves", 'Garh Jungle Archeological Zone', 'Randiha Damodar Barrage Lookout'],
    parks: ['Sidhu Kanhu Indoor Stadium (Durgapur)', 'Shahid Bhagat Singh Kridangan (Durgapur)', 'Nehru Park (Burnpur)', 'Asansol Indoor Sports Stadium', 'Alloy Steel Plant Stadium', 'Kohinoor Stadium Asansol'],
    activities: ['Speed Boating & Island Hops at Maithon', 'Industrial Landscape Photography', 'Forest Excursions to Garh Jungle Shrines', 'Lakeside Camping around Panchet'],
    foods: ['Shaktigarh Langcha', 'Bardhaman Sitabhog & Mihidana', 'Mutton Kasha with Parotta', 'Mughlai Egg Parathas', 'Ghughni Muri Mix'],
    foodZones: ['Asansol Chelidanga Khau Galli', 'Durgapur Benachity Market Food Row', 'City Centre Durgapur Food Plaza', 'Maithon Dam View Snack Stretch'],
    stays: ['The Peerless Inn Durgapur', 'Fortune Park Galaxy Asansol', 'Hotel Citi Residenci Durgapur', 'Gharana Restaurant Asansol', 'Tugboat Theme Restaurant', 'Lalit Multi-Cuisine Eatery'],
  },

  'paschim-medinipur': {
    about:
      "Home to Bengal's own 'grand canyon' — the laterite ravines of Gangani — plus ancient temple clusters at Pathra, the Kurumbera fort, and the forested Arabari model range.",
    landmarks: ['Gangani Laterite Canyons (Garhbeta)', 'Pathra Temple Village', 'Kurumbera Fort (Gaganeshwar)', 'Karnagarh Temple & Rani Shiromani Fort', 'Gopegarh Heritage Eco Park', 'Arabari Model Forest Range', 'Khargeswar Mahadev Temple'],
    parks: ['Midnapore District Sports Stadium', 'Gopegarh Eco Heritage Park', 'IIT Kharagpur Sports Complex', 'A.K. Ganguly SERSA Stadium (Kharagpur)'],
    activities: ['Canyon Treks & Red-Soil Photography at Gangani', 'Laterite Architecture at Kurumbera', 'Wilderness Walks through Arabari Woodlands', 'Heritage Temple Hopping at Pathra'],
    foods: ['Medinipur Babsha Sweets', 'Postor Bora', 'Panta Ilish Combo Meals', "Khirpai-er Khir", 'Spicy Alur Chop & Muri'],
    foodZones: ['Midnapore Keranichoti Food Line', 'Kharagpur Gole Bazar Snack Corridor', 'Garhbeta Station Road Stalls', 'Dharma Crossing Fast Food Row'],
    stays: ['Gopegarh Eco Park Resort', 'Hotel Orbit Midnapore', 'Kaushik Hotel Kharagpur', 'Capsicum Multi-Cuisine Restaurant', 'Sher-e-Punjab (Highway Outlet)', 'Little Bistro Café'],
  },

  'purba-bardhaman': {
    about:
      "Bengal's fertile rice bowl, famed for the sweets Sitabhog and Mihidana, the 108 Shiva temples of Kalna, the Curzon Gate, and the migratory-bird oxbow lake at Purbasthali.",
    landmarks: ['108 Shiv Temple Ring (Nawabhat)', 'Curzon Gate (Bijoy Toran)', '108 Shiva Temples of Kalna', 'Pratapeshwar Terracotta Temple (Kalna)', 'Purbasthali Oxbow Lake (Chupi Char)', 'Golap Bagh Rose Garden', 'Science Centre Burdwan', 'Meghnad Saha Planetarium', 'Sarbamangala Temple', 'Deer Park Burdwan'],
    parks: ['Spandan Sports Complex Stadium', 'Kalna Municipal Stadium', 'Aghornath Park Stadium', 'Krishnasayer Eco Park', 'Burdwan Deer Park Walkway'],
    activities: ['Migratory Bird Spotting by Boat at Purbasthali', 'Terracotta Architecture Photography at Kalna', 'Heritage Walks around Curzon Gate', 'Lakeside Boating at Krishnasayer'],
    foods: ['Bardhaman Sitabhog', 'Bardhaman Mihidana', 'Shaktigarh Langcha', "Burdwan-er Hing-er Kachori", 'Miniket Rice Platters'],
    foodZones: ['Burdwan Station Road Sweet Bazaar', 'Curzon Gate Crossing Food Perimeter', 'Kalna Ghat Road Snack Kiosks', 'Purbasthali Lake Tea & Fritter Shacks'],
    stays: ['Sinclairs Tourist Resort Burdwan', 'Natraj Hotel Complex', 'Hotel Premium Burdwan', 'Kalna Tourist Lodge (WBTDCL)', 'Purnima Heritage Restaurant', 'Preeti Restaurant & Confectionery'],
  },

  'purba-medinipur': {
    about:
      "Bengal's beach coast — Digha, Mandarmani, Tajpur and Shankarpur — with casuarina groves, fishing harbours, a marine aquarium, and the historic Tamluk and Mahishadal estates.",
    landmarks: ['Old Digha Sea Beach', 'New Digha Beach Promenade', 'Mandarmani Beach Resort Strip', 'Tajpur Beach & Casuarina Groves', 'Shankarpur Beach & Harbour', 'Udaipur Border Beach', 'Junput Beach', 'Geonkhali River Confluence', 'Tamluk Bargabhima Temple', 'Mahishadal Rajbari & Museum', 'MARC Marine Aquarium, Digha', 'Nayachar Estuary Island'],
    parks: ['Durgachak Sports Stadium (Haldia)', 'Haldia Municipal Stadium', 'New Digha Amravati Lake Park', 'Digha Science Centre Park', 'Tamluk District Sports Ground'],
    activities: ['Beach ATV Riding & Parasailing at Mandarmani', 'Deep-Sea Trawler Fishing & Red-Crab Walks', 'Fresh Catch Auction Watching at Digha Mohona', 'Palace Walks at Mahishadal'],
    foods: ['Beachside Sea Fish Fry (Pomfret, Prawn, Bhetki, Crab)', 'Tossed Corn Chaat', "Mecheda-r Jilipi", 'Tamluk-er Rajbhog', 'Fresh Daab (Coconut Water)'],
    foodZones: ['New Digha Sea Beach Food Stalls', 'Soikot Soroni Evening Market', 'Digha Mohona Morning Luchi-Ghugni Line', 'Tamluk Ramsagar Pukur Kiosks', 'Haldia City Centre Snack Row'],
    stays: ['Hotel Sonar Bangla Mandarmani', 'Le Kingstowne New Digha', 'Peerless Resort Digha', 'Hotel Sea Hawk (Old Digha)', 'Hotel Peramol Mecheda', 'RN Food Hub Contai', 'Malati Kaju Centre Snack Lane'],
  },

  purulia: {
    about:
      "Bengal's rugged west — the Ayodhya Hills, dam-lakes, ancient fort ruins, and the spectacular Chhau dance with its painted masks crafted at Charida village.",
    landmarks: ['Ayodhya Hills (Pahar Plateau)', 'Bamni Falls', 'Turga Waterfalls', 'Garpanchkot Fort Ruins (Panchet)', 'Baranti Reservoir & Murardi Lake', 'Joychandi Pahar', 'Khairabera Dam & Eco Valley', 'Murguma Dam Reservoir', 'Baghmundi Sal Forest Trails', 'Charida Chhau Mask Village', 'Saheb Bandh Lake', 'Deulghat Temple Ruins', 'Matha Buru Hill Base'],
    parks: ['Manbhum Sports Association Indoor Stadium', 'SERSA Stadium Adra', 'Raghunathpur Sports Ground', 'Saheb Bandh Eco Nature Park', 'Ayodhya Hill Top Eco Park'],
    activities: ['Granite Rock Climbing & Rappelling at Joychandi Pahar', 'Chhau Mask Painting Workshops at Charida', 'Lakeside Camping at Baranti & Murguma', 'Forest Trekking to Bamni Falls'],
    foods: ['Purulia Desi Murgir Jhol', 'Posto Murgi (poppy gravy chicken)', 'Til-er Ladoo', 'Mahua Flower Snacks (Seasonal)', 'Regional Confectionery'],
    foodZones: ['Purulia Town Taxi Stand Chowk', 'Raghunathpur Main Road Snack Stalls', 'Baranti Lakeside Tea & Pokora Shacks', 'Ayodhya Hill Top Food Shacks'],
    stays: ['Kushal Palli Hill Resort (Ayodhya)', 'Garpanchkot Eco Tourism Resort (WBTDCL)', 'Akash Hill Resort (Joychandi)', 'Baranti Wildlife Eco Resort', 'Manbhum Hotel & Restaurant', 'Pearitrees Family Restaurant'],
  },

  'south-24-parganas': {
    about:
      "The mangrove kingdom of the Sundarbans — UNESCO-listed delta of the Royal Bengal Tiger — plus the Gangasagar pilgrimage, the beaches of Bakkhali and Fraserganj, and the luxury riverfront of Raichak.",
    landmarks: ['Sundarbans National Park (Sajnekhali, Sudhanyakhali, Dobanki)', 'Gangasagar & Kapil Muni Ashram (Sagardwip)', 'Bakkhali Sea Beach', 'Fraserganj Coastal Strip & Windmills', "Henry's Island Mangrove Watchtower", 'Jambu Dwip Estuary Island', 'Lothian Island Wildlife Sanctuary', 'Diamond Harbour Riverside Promenade', 'Raichak on Ganges Marina', 'Chintamoni Kar Bird Sanctuary (Narendrapur)', 'Piyali Island'],
    parks: ['Canning Sports Complex', 'Baruipur District Sports Stadium', 'Diamond Harbour Stadium', 'Sajnekhali Mangrove Interpretation Centre', "Henry's Island Nature Boardwalks"],
    activities: ['Mangrove Boat Cruising & Tiger Spotting in the Sundarbans', 'Sea Bathing & Coastal Biking at Bakkhali', 'Sacred Dips & Mela at Gangasagar', 'Riverside Yachting & Stays at Raichak'],
    foods: ['Sundarbans Wild Forest Honey', 'Mangrove Mud Crabs & Tiger Prawn Masala', 'Bakkhali Tawa-Fried Pomfret', "Jaynagarer Moa (winter specialty)", 'Baruipur Muri-Chop Combo'],
    foodZones: ['Diamond Harbour Promenade Kiosks', 'Bakkhali Beach Road Fish Fry Stalls', 'Canning Ferry Ghat Snack Line', 'Baruipur Kachari Bazar Food Arcade'],
    stays: ['United 21 Resort Sundarbans', 'Sunderban Tiger Camp Eco Property', 'The Ffort Raichak Heritage Resort', 'Hotel Deepak Bakkhali', 'Ganga Kutir Luxury Resort', 'Sundorban Tourist Lodge (WBTDCL)'],
  },

  'uttar-dinajpur': {
    about:
      "A tranquil northern district famed for the Kulik bird sanctuary — one of Asia's largest heronries — the fragrant Tulaipanji rice, and the wooden Gomira masks of Kunore village.",
    landmarks: ['Raiganj Wildlife Sanctuary (Kulik)', 'Sap Nikla Forest & Wetlands', 'Karnajora Museum & Eco Park', 'Bahin River Port Ruins', 'Kunore Mask & Pottery Village', "Burhana Fakir's Mosque Shrine"],
    parks: ['Raiganj District Outdoor Stadium', 'Kanchanjungha Playground Stadium', 'Karnajora Eco Park Trails', 'Islampur Town Sports Ground'],
    activities: ['Openbill Stork Colony Watching at Kulik', 'Wooden Gomira Mask Carving at Kunore', 'Country Boat Eco-Rowing across Sap Nikla', 'Stone-Work Ruins at Bahin Zamindar House'],
    foods: ['Tulaipanji Fragrant Pulao', "Raiganj-er Kalojam", 'North Bengal Duck Roast Curry', 'River Macher Jhal', 'Fried Shingara-Chutney'],
    foodZones: ['Raiganj Mohanbati Crossing Stalls', 'Siliguri More Highway Snack Corner', 'Islampur Bus Stand Khau Galli'],
    stays: ['Kulik Tourist Lodge (WBTDCL)', 'Hotel Vinayak Raiganj', 'Hotel Spot In Raiganj', 'Royal Palace Hotel Islampur', 'Shanti Multi-Cuisine Restaurant', 'Dynamic Laziz Biryani Hub'],
  },
};

export function getDistrictContent(slug: string): DistrictContent | undefined {
  return DISTRICT_CONTENT[slug];
}
