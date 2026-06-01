// Adds famous West Bengal tourist places that were missing from district
// "Top places" lists. All real, verifiable spots with real coordinates +
// factual descriptions. Fetches a hero photo via the geo proxy; emits TS objects.
import { writeFileSync } from 'fs';
const API = 'https://gobro-api.onrender.com/api';

const P = [
  // ── Kolkata (major icons that were absent) ────────────────────────────────
  ['St. Paul’s Cathedral','st-pauls-cathedral-kolkata','South Bengal','Kolkata',22.5448,88.3426,
   'Kolkata’s grand Gothic Anglican cathedral, the first of its kind in the East.',
   'Consecrated in 1847, St. Paul’s Cathedral is a soaring white Indo-Gothic church beside Victoria Memorial. Its stained glass, frescoes and tall spire (rebuilt after earthquakes) make it one of colonial Kolkata’s most elegant landmarks, especially at Christmas.',
   ['Heritage','Colonial','Architecture','Photography'],'Oct–Mar',[],[]],
  ['Alipore Zoological Garden','alipore-zoo','South Bengal','Kolkata',22.5366,88.3318,
   'India’s oldest formal zoo (1876) — a green family favourite in south Kolkata.',
   'Opened in 1876, Alipore Zoo is India’s oldest formal zoological garden, home to Royal Bengal tigers, a reptile house and migratory birds in winter. Its shady avenues make it a beloved winter-picnic outing for Kolkata families.',
   ['Family','Wildlife','Park','Education'],'Nov–Feb',[],[]],
  ['Birla Planetarium','birla-planetarium-kolkata','South Bengal','Kolkata',22.5462,88.3470,
   'One of the world’s largest planetariums — a domed icon on Chowringhee.',
   'The Birla Planetarium, shaped like a Buddhist stupa, is among the largest planetariums in the world. Its sky-theatre shows on astronomy and mythology have drawn generations of Kolkata schoolchildren since 1963.',
   ['Family','Education','Architecture','Science'],'Oct–Mar',[],[]],
  ['Pareshnath Jain Temple','pareshnath-jain-temple','South Bengal','Kolkata',22.5905,88.3872,
   'A dazzling 1867 Jain temple of mirrors, mosaics and a garden of fountains.',
   'The Pareshnath (Sheetalnath) Jain Temple in Maniktala is an ornate 1867 shrine encrusted with Belgian glass, mirrors, Venetian mosaics and marble. Its lamp-lit garden and reflective interiors make it one of Kolkata’s most beautiful religious buildings.',
   ['Temple','Architecture','Heritage','Spiritual'],'Oct–Mar',[],[]],
  ['Nakhoda Masjid','nakhoda-masjid','South Bengal','Kolkata',22.5790,88.3565,
   'Kolkata’s largest mosque, modelled on Akbar’s tomb at Sikandra.',
   'The red-sandstone Nakhoda Masjid (1926) near Burrabazar is Kolkata’s principal mosque, its design inspired by Akbar’s tomb at Sikandra. Its towering gateway and minarets, and the bustling Ramzan food street around it, are a sensory highlight.',
   ['Heritage','Mosque','Architecture','StreetFood'],'Oct–Mar',[],[]],
  ['Mother House','mother-house-kolkata','South Bengal','Kolkata',22.5531,88.3637,
   'The headquarters of the Missionaries of Charity and Mother Teresa’s tomb.',
   'Mother House on AJC Bose Road is the global headquarters of the Missionaries of Charity, founded by Mother (Saint) Teresa. Her simple tomb and a small museum on her life draw pilgrims and visitors from around the world.',
   ['Spiritual','Heritage','Pilgrimage'],'Oct–Mar',[],[]],
  ['St. John’s Church','st-johns-church-kolkata','South Bengal','Kolkata',22.5690,88.3472,
   'A 1787 colonial church with Job Charnock’s mausoleum in its grounds.',
   'One of Kolkata’s earliest public buildings (1787), St. John’s Church holds the mausoleum of Job Charnock and the Black Hole memorial in its quiet grounds. Its Doric architecture and old tombstones are a window into the city’s founding.',
   ['Heritage','Colonial','Architecture','History'],'Oct–Mar',[],[]],

  // ── Hooghly ───────────────────────────────────────────────────────────────
  ['Hangseswari Temple','hangseswari-temple','Central Bengal','Hooghly',22.9690,88.3990,
   'A unique blue-white temple at Bansberia with thirteen lotus-bud spires.',
   'The early-19th-century Hangseswari Temple at Bansberia is unlike any other in Bengal — its thirteen ratnas (spires) shaped like lotus buds rise over a structure said to embody tantric yogic philosophy. The adjacent Ananta Basudeba terracotta temple completes the visit.',
   ['Temple','Architecture','Heritage','Terracotta'],'Oct–Mar',[],[]],
  ['Kamarpukur','kamarpukur','Central Bengal','Hooghly',22.8870,87.6450,
   'The birthplace of Sri Ramakrishna Paramahamsa — a serene pilgrimage village.',
   'Kamarpukur is the birthplace of Sri Ramakrishna Paramahamsa, now a tranquil pilgrimage centre run by the Ramakrishna Mission. His childhood home, the Yogi Shiva temple and the surrounding rural calm draw devotees year-round; it pairs naturally with nearby Joyrambati.',
   ['Spiritual','Pilgrimage','Heritage','Rural'],'Oct–Mar',[],[]],
  ['Furfura Sharif','furfura-sharif','Central Bengal','Hooghly',22.8430,88.2150,
   'A revered Sufi dargah and one of Bengal’s largest Muslim pilgrimage sites.',
   'Furfura Sharif is a major Sufi shrine complex near Jangipara, the resting place of the Pir Abu Bakr Siddique and his sons. Its annual Urs draws lakhs of pilgrims, making it one of the most important Islamic pilgrimage centres in eastern India.',
   ['Spiritual','Pilgrimage','Heritage'],'Oct–Mar',[],[]],

  // ── Bankura ───────────────────────────────────────────────────────────────
  ['Joyrambati','joyrambati','South Bengal','Bankura',22.9020,87.5740,
   'Birthplace of Holy Mother Sri Sarada Devi — a peaceful spiritual village.',
   'Joyrambati is the birthplace of Sri Sarada Devi, the spiritual consort of Sri Ramakrishna. The Matri Mandir temple over her ancestral home and the calm village setting make it a key Ramakrishna-Sarada pilgrimage stop, just a short drive from Kamarpukur.',
   ['Spiritual','Pilgrimage','Heritage','Rural'],'Oct–Mar',[],[]],

  // ── Purulia ───────────────────────────────────────────────────────────────
  ['Garpanchakot','garpanchakot','South Bengal','Purulia',23.6050,86.7770,
   'Ruins of a medieval kingdom at the foot of forested Panchet Hill.',
   'Garpanchakot is the atmospheric ruin of the Panchakot royal kingdom, set against the wooded slopes of Panchet Hill. Crumbling temples and terracotta fragments amid sal forest, plus easy treks and a tourist lodge, make it a favourite offbeat weekend escape.',
   ['Heritage','Nature','Trek','Offbeat'],'Oct–Mar',['Garpanchakot Eco Resort'],[]],
  ['Baranti','baranti','South Bengal','Purulia',23.6450,86.8200,
   'A tranquil village by a red-hill reservoir, glorious in palash season.',
   'Baranti is a quiet village set around an irrigation lake ringed by the Baranti and Muradi hills. Birdsong, sunset over the water and blazing red palash blooms in spring make it one of Purulia’s most loved offbeat, slow-travel retreats.',
   ['Lake','Nature','Offbeat','SlowTravel'],'Oct–Mar',[],[]],

  // ── Nadia ─────────────────────────────────────────────────────────────────
  ['Shantipur','shantipur','South Bengal','Nadia',23.2540,88.4380,
   'A historic weaving town famed for Shantipuri tant sarees and Vaishnav heritage.',
   'Shantipur is a centuries-old centre of handloom weaving, renowned for its fine Shantipuri tant sarees, and an important Vaishnava site linked to Advaita Acharya. The Ras festival, old temples and clattering looms give the town a living-heritage feel.',
   ['Handicraft','Heritage','Shopping','Culture'],'Oct–Mar',[],[]],
  ['Phulia','phulia','South Bengal','Nadia',23.2200,88.4720,
   'A weavers’ town of tant looms and the legendary poet Krittibas.',
   'Phulia, beside Shantipur, is a major handloom hub where thousands of weavers produce Tangail and tant sarees. Traditionally the birthplace of Krittibas Ojha — who rendered the Ramayana into Bengali — it is ideal for buying authentic handwoven textiles direct from artisans.',
   ['Handicraft','Shopping','Heritage','Culture'],'Oct–Mar',[],[]],

  // ── Howrah ────────────────────────────────────────────────────────────────
  ['Santragachi Jheel','santragachi-jheel','South Bengal','Howrah',22.6000,88.2700,
   'A city lake that fills with thousands of migratory birds each winter.',
   'Santragachi Jheel is a large urban wetland that becomes a spectacular roost for thousands of migratory birds — lesser whistling ducks, northern pintails and more — between November and February. A watchpoint makes it a convenient winter birding stop near Howrah station.',
   ['BirdWatching','Nature','Lake'],'Nov–Feb',[],[]],
  ['Gadiara','gadiara','South Bengal','Howrah',22.2400,88.0500,
   'A breezy riverside getaway where three rivers meet, facing Gangasagar’s mouth.',
   'Gadiara sits where the Hooghly, Rupnarayan and Damodar meet, a wide watery vista popular for weekend escapes from Kolkata. The old Fort Mornington ruins, riverside lodge and sunset over the confluence are the draws.',
   ['Riverfront','Picnic','WeekendGetaway','Nature'],'Oct–Mar',[],[]],

  // ── North 24 Parganas ─────────────────────────────────────────────────────
  ['Bibhutibhushan Wildlife Sanctuary','bibhutibhushan-wildlife-sanctuary','South Bengal','North 24 Parganas',23.0480,88.7480,
   'A riverside deer sanctuary at Parmadan named after the famed novelist.',
   'The Bibhutibhushan Wildlife Sanctuary at Parmadan, on the Ichhamati’s banks, is a compact forest of spotted deer, a deer-breeding centre and rich birdlife. Named after novelist Bibhutibhushan Bandyopadhyay, it makes a green day-trip paired with riverside Taki.',
   ['Wildlife','Forest','Nature','BirdWatching'],'Nov–Mar',[],[]],

  // ── Malda ─────────────────────────────────────────────────────────────────
  ['Farakka Barrage','farakka-barrage','North Bengal','Malda',24.8030,87.9300,
   'A vast Ganga barrage and a winter haven for migratory waterbirds.',
   'The Farakka Barrage, over 2 km long, spans the Ganga to feed the Feeder Canal toward Kolkata’s port. Beyond its engineering scale, the reservoir draws migratory birds and gharial in winter, and the riverscape is a popular stop on the Malda–Murshidabad route.',
   ['River','Landmark','BirdWatching','Engineering'],'Nov–Mar',[],[]],

  // ── Murshidabad ───────────────────────────────────────────────────────────
  ['Cossimbazar Rajbari','cossimbazar-rajbari','Central Bengal','Murshidabad',24.1080,88.2680,
   'An aristocratic palace of the Roy family, rich in Durga Puja tradition.',
   'The Cossimbazar (Kasimbazar) Rajbari is a grand zamindar palace near Berhampore, famed for its old-world architecture, family temples and a centuries-old bonedi-bari Durga Puja. Part of it now welcomes heritage visitors and stays.',
   ['Heritage','Palace','Architecture','Homestay'],'Oct–Mar',[],[]],

  // ── Jalpaiguri ────────────────────────────────────────────────────────────
  ['Gajoldoba','gajoldoba','North Bengal','Jalpaiguri',26.7300,88.5800,
   'A Teesta-barrage wetland — “Bhorer Alo” — ringed by Himalayan views and birds.',
   'Gajoldoba, where the Teesta is barraged below the Baikunthapur forest, is a serene wetland with the snow-line of the eastern Himalayas on the horizon. Boat rides, huge flocks of winter migratory birds and the Bhorer Alo eco-tourism hub make it a rising Dooars favourite.',
   ['Nature','BirdWatching','River','EcoTourism'],'Nov–Mar',[],[]],
  ['Jalpesh Temple','jalpesh-temple','North Bengal','Jalpaiguri',26.5400,89.0200,
   'An ancient Shiva temple and major pilgrimage site of North Bengal.',
   'The Jalpesh Temple near Mainaguri is one of North Bengal’s most revered Shiva shrines, its present structure dating to the 19th century over a far older site. The Shravan-month fair draws huge crowds of pilgrims to its sunken sanctum.',
   ['Temple','Pilgrimage','Spiritual','Heritage'],'Oct–Mar',[],[]],

  // ── Cooch Behar ───────────────────────────────────────────────────────────
  ['Baneswar Shiva Temple','baneswar-temple','North Bengal','Cooch Behar',26.4000,89.4400,
   'A revered Shiva temple famed for its sacred tortoise-filled tank.',
   'The Baneswar Shiva Temple, north of Cooch Behar town, is an important pilgrimage site whose temple tank is home to protected black soft-shell tortoises considered sacred. The Madan Chaturdashi and Shivratri fairs are especially lively.',
   ['Temple','Spiritual','Pilgrimage','Heritage'],'Oct–Mar',[],[]],

  // ── Darjeeling ────────────────────────────────────────────────────────────
  ['Sandakphu','sandakphu','North Bengal','Darjeeling',27.1020,88.0010,
   'The highest point in West Bengal — and the “Sleeping Buddha” Kanchenjunga view.',
   'At 3,636 m, Sandakphu is the highest point in West Bengal and the climax of the Singalila trek. From its ridge you can see four of the world’s five highest peaks — Everest, Kanchenjunga, Lhotse and Makalu — with Kanchenjunga’s “Sleeping Buddha” silhouette dominating the dawn.',
   ['Trek','MountainView','Adventure','Viewpoint'],'Oct–Dec, Mar–May',[],[]],
  ['Japanese Peace Pagoda','japanese-peace-pagoda-darjeeling','North Bengal','Darjeeling',27.0400,88.2680,
   'A serene white Buddhist stupa with sweeping Kanchenjunga views.',
   'Built by the Nipponzan-Myohoji order, Darjeeling’s Japanese Peace Pagoda is a gleaming white stupa bearing four avatars of the Buddha. The dawn drumming prayer and the panorama of Kanchenjunga make it one of the town’s most peaceful stops.',
   ['Spiritual','Viewpoint','Peaceful','Architecture'],'Oct–Mar',[],[]],

  // ── Kalimpong ─────────────────────────────────────────────────────────────
  ['Morgan House','morgan-house','North Bengal','Kalimpong',27.0720,88.4640,
   'A colonial-era stone mansion on Durpin Hill, now a heritage tourist lodge.',
   'Morgan House is a 1930s English-style stone bungalow on Durpin Dara, set amid lawns and pines with valley views. Run now as a WBTDC heritage lodge (and wrapped in ghost-story lore), it’s a atmospheric stop or stay in Kalimpong.',
   ['Heritage','Colonial','Homestay','Viewpoint'],'Mar–Jun, Sep–Nov',['Morgan House Tourist Lodge'],[]],

  // ── Birbhum ───────────────────────────────────────────────────────────────
  ['Kenduli (Joydev)','kenduli-joydev','Central Bengal','Birbhum',23.6800,87.4500,
   'Birthplace village of poet Jayadeva and home of the great Baul Joydev Mela.',
   'Kenduli, on the Ajay river, is traditionally the birthplace of the Sanskrit poet Jayadeva, author of the Gita Govinda. Each January its Joydev–Kenduli Mela becomes one of Bengal’s greatest gatherings of Baul and folk musicians, drawing seekers from across the region.',
   ['Culture','Festival','Music','Heritage'],'Dec–Feb',[],[]],

  // ── Paschim Bardhaman ─────────────────────────────────────────────────────
  ['Durgapur Barrage','durgapur-barrage','Central Bengal','Paschim Bardhaman',23.4800,87.2900,
   'A long barrage over the Damodar — Durgapur’s favourite riverside hangout.',
   'The Durgapur Barrage spans the Damodar river with a row of gates feeding the region’s canals and steel city. Its breezy waterfront, boating and sunset views make it the steel-belt’s most popular evening and picnic spot.',
   ['River','Picnic','WeekendGetaway','Landmark'],'Oct–Mar',[],[]],
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function photoFor(title, district) {
  const q = `${title} ${district} West Bengal`;
  for (let a = 0; a < 2; a++) {
    try {
      const r = await fetch(`${API}/geo/photo?query=${encodeURIComponent(q)}`, { signal: AbortSignal.timeout(45000) });
      if (r.ok) { const d = await r.json(); return d?.url || ''; }
    } catch {}
    await sleep(1500);
  }
  return '';
}

const out = [];
for (const row of P) {
  const [title, slug, region, district, lat, lng, excerpt, description, tags, best, hotels, restaurants] = row;
  const url = await photoFor(title, district);
  out.push({ title, slug, region, district, coordinates: { lat, lng },
    heroImage: { url, alt: `${title}, ${district}` }, excerpt, description, tags,
    bestTime: best, nearbyHotels: hotels, nearbyRestaurants: restaurants, rating: 0, reviewsCount: 0 });
  console.error(`✓ ${title} — ${url ? 'photo' : 'no photo'}`);
  await sleep(250);
}
writeFileSync(new URL('./missing-places.generated.txt', import.meta.url), out.map((o) => '  ' + JSON.stringify(o)).join(',\n') + ',\n');
console.error(`\nWrote ${out.length} places.`);
