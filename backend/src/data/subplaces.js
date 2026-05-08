// Subplaces — nearby attractions/spots for each major destination
// These are the "must-see within X km" attractions
'use strict';

const subplaces = [
  // ── DARJEELING surroundings ───────────────────────────────────────────────
  {
    parentSlug: 'darjeeling',
    name: 'Tiger Hill',
    distance: '11 km',
    type: 'viewpoint',
    description: 'Famous sunrise point — see the first light hit Kanchenjunga.',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800',
    bestTime: '4:30 AM departure',
    tip: 'Carry warm clothes — temperature drops below 5°C even in summer',
  },
  {
    parentSlug: 'darjeeling',
    name: 'Batasia Loop',
    distance: '5 km',
    type: 'monument',
    description: 'Spiral railway loop with War Memorial. The toy train passes through.',
    image: 'https://images.unsplash.com/photo-1605649461784-edc01e8a4ac8?w=800',
  },
  {
    parentSlug: 'darjeeling',
    name: 'Padmaja Naidu Himalayan Zoo',
    distance: '3 km',
    type: 'wildlife',
    description: 'Home to red pandas, snow leopards, and Himalayan wolves.',
    image: 'https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?w=800',
  },
  {
    parentSlug: 'darjeeling',
    name: 'Happy Valley Tea Estate',
    distance: '3 km',
    type: 'plantation',
    description: 'Active tea garden with factory tours. Buy fresh tea direct.',
    image: 'https://images.unsplash.com/photo-1599631438215-75bc2640feb8?w=800',
  },
  {
    parentSlug: 'darjeeling',
    name: 'Mirik Lake',
    distance: '49 km',
    type: 'lake',
    description: 'Day trip — boat rides on Sumendu Lake, orchid garden, Bokar monastery.',
    image: 'https://images.unsplash.com/photo-1586500036706-41963de24d8b?w=800',
  },

  // ── SUNDARBANS ────────────────────────────────────────────────────────────
  {
    parentSlug: 'sundarbans',
    name: 'Sajnekhali Watchtower',
    distance: 'Inside reserve',
    type: 'wildlife_viewing',
    description: 'Main entry watchtower — best chance to spot tigers, deer, crocs.',
    image: 'https://images.unsplash.com/photo-1571406252241-db0bdaef0a30?w=800',
  },
  {
    parentSlug: 'sundarbans',
    name: 'Sudhanyakhali Watchtower',
    distance: '20 min boat',
    type: 'wildlife_viewing',
    description: 'Fresh water pond attracts wildlife. Tiger sightings reported here.',
    image: 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=800',
  },
  {
    parentSlug: 'sundarbans',
    name: 'Dobanki Canopy Walk',
    distance: '40 min boat',
    type: 'walk',
    description: '20m elevated canopy walk through mangroves. Unique experience.',
    image: 'https://images.unsplash.com/photo-1610563166150-b34df4f3bcd6?w=800',
  },
  {
    parentSlug: 'sundarbans',
    name: 'Gosaba village',
    distance: 'En route',
    type: 'village',
    description: 'Traditional village — stop for local Baul music and Bengali sweets.',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
  },

  // ── SHANTINIKETAN ─────────────────────────────────────────────────────────
  {
    parentSlug: 'shantiniketan',
    name: 'Visva-Bharati Campus',
    distance: '0 km',
    type: 'heritage',
    description: 'Tagore’s open-air university — UNESCO heritage site.',
    image: 'https://images.unsplash.com/photo-1592839961294-25e1d59ff36d?w=800',
  },
  {
    parentSlug: 'shantiniketan',
    name: 'Sonajhuri Forest Haat',
    distance: '6 km',
    type: 'market',
    description: 'Saturday market in red soil forest. Tribal crafts, Baul music.',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
    bestTime: 'Saturday 3 PM – 6 PM',
  },
  {
    parentSlug: 'shantiniketan',
    name: 'Kankalitala Temple',
    distance: '9 km',
    type: 'temple',
    description: 'One of the 51 Shakti Peethas — riverside pilgrimage spot.',
    image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',
  },
  {
    parentSlug: 'shantiniketan',
    name: 'Amar Kutir',
    distance: '4 km',
    type: 'craft_village',
    description: 'Cooperative society for crafts — leather, batik, handloom.',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
  },

  // ── DIGHA ─────────────────────────────────────────────────────────────────
  {
    parentSlug: 'digha',
    name: 'Marine Aquarium',
    distance: '2 km',
    type: 'museum',
    description: 'India’s largest marine aquarium — sharks, rays, tropical fish.',
    image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',
  },
  {
    parentSlug: 'digha',
    name: 'Mohona Fish Market',
    distance: '3 km',
    type: 'market',
    description: 'Daily fish auction at dawn — see fresh catch from Bay of Bengal.',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
    bestTime: '5:30 AM',
  },
  {
    parentSlug: 'digha',
    name: 'Talsari Beach',
    distance: '8 km',
    type: 'beach',
    description: 'Quiet beach across Odisha border — palm groves and casuarinas.',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
  },
  {
    parentSlug: 'digha',
    name: 'Shankarpur',
    distance: '14 km',
    type: 'beach',
    description: 'Less crowded fishing harbor with golden sands.',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
  },

  // ── KALIMPONG ─────────────────────────────────────────────────────────────
  {
    parentSlug: 'kalimpong',
    name: 'Deolo Hill',
    distance: '5 km',
    type: 'viewpoint',
    description: 'Highest point — paragliding, panoramic Himalayan views.',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800',
  },
  {
    parentSlug: 'kalimpong',
    name: 'Durpin Monastery',
    distance: '4 km',
    type: 'monastery',
    description: 'Zang Dhok Palri Phodang — sacred Buddhist scriptures.',
    image: 'https://images.unsplash.com/photo-1605649461784-edc01e8a4ac8?w=800',
  },
  {
    parentSlug: 'kalimpong',
    name: 'Pine View Nursery',
    distance: '3 km',
    type: 'garden',
    description: 'Cactus and orchid nursery — over 1,500 species.',
    image: 'https://images.unsplash.com/photo-1599631438215-75bc2640feb8?w=800',
  },
  {
    parentSlug: 'kalimpong',
    name: 'Lava & Lolegaon',
    distance: '32 km',
    type: 'hill_station',
    description: 'Sleepy hill villages — canopy walk, Buddhist monastery.',
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
  },

  // ── MURSHIDABAD ───────────────────────────────────────────────────────────
  {
    parentSlug: 'murshidabad',
    name: 'Hazarduari Palace',
    distance: '0 km',
    type: 'palace',
    description: 'Palace of a thousand doors — museum of Nawabi history.',
    image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',
  },
  {
    parentSlug: 'murshidabad',
    name: 'Katra Mosque',
    distance: '2 km',
    type: 'mosque',
    description: 'Massive 1724 mosque — tomb of Murshid Quli Khan.',
    image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',
  },
  {
    parentSlug: 'murshidabad',
    name: 'Kathgola Gardens',
    distance: '3 km',
    type: 'palace',
    description: '19th century Jain merchant palace with rare Italian sculptures.',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
  },

  // ── BISHNUPUR ─────────────────────────────────────────────────────────────
  {
    parentSlug: 'bishnupur',
    name: 'Rasmancha Temple',
    distance: '0 km',
    type: 'temple',
    description: 'Oldest brick temple in Bengal (1600 CE) — pyramidal terracotta.',
    image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',
  },
  {
    parentSlug: 'bishnupur',
    name: 'Jor Bangla Temple',
    distance: '1 km',
    type: 'temple',
    description: 'Twin-roofed temple with intricate terracotta panels — 1655 CE.',
    image: 'https://images.unsplash.com/photo-1592839961294-25e1d59ff36d?w=800',
  },
  {
    parentSlug: 'bishnupur',
    name: 'Pancha Ratna Temple',
    distance: '2 km',
    type: 'temple',
    description: 'Five-spired terracotta temple — masterpiece of Bengali architecture.',
    image: 'https://images.unsplash.com/photo-1592839961294-25e1d59ff36d?w=800',
  },
];

module.exports = { subplaces };
