// One-off generator: authors REAL, well-known West Bengal places that were
// missing from thin districts. Fetches a representative hero photo for each via
// the live geo photo-proxy (Unsplash→Wikipedia) and emits ready-to-paste TS
// objects matching the Place schema. No fabricated ratings/reviews.
import { writeFileSync } from 'fs';

const API = 'https://gobro-api.onrender.com/api';

// title, slug, region, district, lat, lng, excerpt, description, tags, best,
// hotels[], restaurants[]  — district strings match districts.ts exactly.
const P = [
  // ── Kalimpong ───────────────────────────────────────────────────────────
  ['Deolo Hill','deolo-hill','North Bengal','Kalimpong',27.0760,88.4810,
   'Kalimpong’s highest point — a breezy hilltop park with sweeping valley and Himalayan views.',
   'Deolo Hill is the highest point in Kalimpong at about 1,704 m, laid out as a landscaped park with paragliding, a tourist lodge and panoramic views over the Teesta and Relli valleys. On clear days the snow line of the eastern Himalayas is visible. It is one of the most popular sunrise and picnic spots in the hill town.',
   ['HillStation','Viewpoint','Park','Photography'],'Mar–Jun, Sep–Nov',
   ['Deolo Tourist Lodge','Hotel De Pearl'],[]],
  ['Durpin Monastery','durpin-monastery','North Bengal','Kalimpong',27.0492,88.4628,
   'Zang Dhok Palri Phodang — a serene hilltop Buddhist monastery consecrated by the Dalai Lama.',
   'Zang Dhok Palri Phodang, popularly called Durpin Monastery, sits atop Durpin Dara hill and was consecrated by the 14th Dalai Lama in 1976. It houses 108 volumes of the Kangyur and vivid murals, and offers commanding views of Kalimpong town and the Teesta below.',
   ['Monastery','Spiritual','Viewpoint','Architecture'],'Mar–Jun, Sep–Nov',
   [],[]],
  ['Dr. Graham’s Homes','dr-grahams-homes','North Bengal','Kalimpong',27.0846,88.4719,
   'A historic 1900s hillside school campus with a landmark stone chapel and pine-clad grounds.',
   'Founded in 1900 by Reverend John Anderson Graham, Dr. Graham’s Homes is a sprawling heritage school spread over the slopes of Deolo Hill. Its English Gothic stone chapel, manicured grounds and colonial-era buildings make it a scenic and historic stop in Kalimpong.',
   ['Heritage','Colonial','Architecture','Photography'],'Mar–Jun, Sep–Nov',
   [],[]],
  ['Lava','lava','North Bengal','Kalimpong',27.0990,88.6720,
   'A misty pine-forest hamlet and the gateway to Neora Valley National Park.',
   'Lava is a small hill village at around 2,350 m, known for its Kagyu Thekchen Ling Monastery, cool pine forests and frequent mist. It is the gateway to Neora Valley National Park and a favourite base for birdwatchers and offbeat travellers in the Kalimpong hills.',
   ['HillStation','Monastery','Nature','Offbeat'],'Mar–Jun, Sep–Dec',
   ['Lava Tourist Lodge'],[]],
  ['Lolegaon','lolegaon','North Bengal','Kalimpong',27.0760,88.6400,
   'A quiet Lepcha hamlet famous for its forest canopy walk and Kanchenjunga sunrises.',
   'Lolegaon is a tranquil hamlet ringed by dense pine and cypress forest, best known for its elevated canopy walk (Heritage Forest) through the treetops. On clear mornings it offers a stunning view of the Kanchenjunga range, making it a peaceful offbeat retreat near Lava.',
   ['Offbeat','Nature','Viewpoint','SlowTravel'],'Mar–Jun, Sep–Dec',
   [],[]],

  // ── Jalpaiguri ──────────────────────────────────────────────────────────
  ['Gorumara National Park','gorumara-national-park','North Bengal','Jalpaiguri',26.7200,88.8000,
   'A compact Dooars park famed for one-horned rhinos, elephants and watchtower safaris.',
   'Gorumara National Park, on the Dooars floodplain of the Murti and Raidak rivers, is renowned for the Indian one-horned rhinoceros, herds of elephants, gaur and rich birdlife. Jeep safaris and elevated watchtowers like Jatraprasad and Chukchuki offer close wildlife viewing in grassland and sal forest.',
   ['Wildlife','Safari','Forest','BirdWatching','EcoTourism'],'Oct–Apr',
   ['Gorumara Tourist Lodge','Murti Tourist Lodge'],[]],
  ['Murti River','murti-river','North Bengal','Jalpaiguri',26.7700,88.8300,
   'A pebbly Dooars river with riverside lodges, perfect for a quiet forest-edge stay.',
   'The Murti flows along the edge of Gorumara, its clear pebbled bed and surrounding forest making it one of the most popular bases in the Dooars. Riverside resorts and the WBFDC lodge here serve as a launch point for Gorumara and Chapramari safaris.',
   ['River','Nature','Relaxation','EcoTourism'],'Oct–Apr',
   ['Murti Tourist Lodge'],[]],
  ['Chapramari Wildlife Sanctuary','chapramari-wildlife-sanctuary','North Bengal','Jalpaiguri',26.9300,88.8600,
   'A dense forest sanctuary along the Murti, known for elephants and a riverside watchtower.',
   'Chapramari Wildlife Sanctuary adjoins Gorumara and is one of the oldest protected forests in the Dooars. Its riverside watchtower over the Murti is a reliable spot for sighting elephants, bison and a wealth of birds amid thick sal and teak woodland.',
   ['Wildlife','Forest','BirdWatching','EcoTourism'],'Oct–Apr',
   [],[]],
  ['Jaldhaka','jaldhaka','North Bengal','Jalpaiguri',27.0500,88.7800,
   'An offbeat river valley on the Bhutan border with a hydel reservoir and pine ridges.',
   'Jaldhaka, near Bindu on the Bhutan frontier, is a serene river valley shaped by the Jaldhaka hydroelectric project. Quiet hamlets like Bindu, Jhalong and Paren, riverside camps and birdwatching make it a growing offbeat destination in the upper Dooars.',
   ['Offbeat','River','Nature','BirdWatching'],'Oct–Apr',
   [],[]],

  // ── Alipurduar ────────────────────────────────────────────────────────────
  ['Jaldapara National Park','jaldapara-national-park','North Bengal','Alipurduar',26.6500,89.2800,
   'The Dooars’ flagship park for one-horned rhino safaris on the banks of the Torsa.',
   'Jaldapara National Park, on the Torsa river floodplain, holds the largest rhinoceros population in West Bengal after Kaziranga. Elephant-back and jeep safaris from Madarihat reveal rhinos, elephants, deer and over 240 bird species across its tall grasslands and riverine forest.',
   ['Wildlife','Safari','Rhino','BirdWatching','EcoTourism'],'Oct–Apr',
   ['Hollong Tourist Lodge','Jaldapara Tourist Lodge'],[]],
  ['Buxa Tiger Reserve','buxa-tiger-reserve','North Bengal','Alipurduar',26.7500,89.5800,
   'A forested tiger reserve on the Bhutan border with a historic hill fort trek.',
   'Buxa Tiger Reserve spreads across the Sinchula hills bordering Bhutan, with rich forest, leopards, elephants and abundant birds. The trek up to ruined Buxa Fort, once a colonial detention camp, and the village of Sadar Bazaar are highlights for trekkers and nature lovers.',
   ['Wildlife','Forest','Trek','BirdWatching','EcoTourism'],'Oct–Apr',
   ['Buxa Jungle Lodge'],[]],
  ['Jayanti','jayanti','North Bengal','Alipurduar',26.7400,89.6200,
   'The “Queen of the Dooars” — a dramatic dry riverbed framed by limestone hills.',
   'Jayanti sits on the edge of Buxa Tiger Reserve along the wide white riverbed of the Jayanti, backed by the Bhutan hills. Known for its scenic boulder-strewn river, Mahakal cave trek and birdwatching, it is one of the most picturesque corners of the Dooars.',
   ['Nature','River','BirdWatching','Offbeat','EcoTourism'],'Oct–Apr',
   [],[]],
  ['Chilapata Forest','chilapata-forest','North Bengal','Alipurduar',26.5800,89.3500,
   'A dense elephant corridor forest with the ruins of the ancient Nalraja Garh.',
   'Chilapata is a thick forest linking Jaldapara with Buxa, serving as a vital elephant corridor. Jeep safaris here pass the moss-covered ruins of Nalraja Garh, a fort dated to the Gupta era, amid rhinos, bison and rich birdlife.',
   ['Wildlife','Forest','Ruins','EcoTourism'],'Oct–Apr',
   [],[]],

  // ── Cooch Behar ─────────────────────────────────────────────────────────
  ['Cooch Behar Palace','cooch-behar-palace','North Bengal','Cooch Behar',26.3197,89.4453,
   'A grand 1887 Italian-Renaissance palace modelled on Buckingham Palace.',
   'The Cooch Behar Rajbari, built in 1887 by Maharaja Nripendra Narayan, is a majestic brick palace inspired by the Italian Renaissance style, crowned by a 38-m Durbar Hall dome. Its symmetrical façade, ornate halls and museum make it the centrepiece of the planned royal town.',
   ['Heritage','Palace','Architecture','Museum'],'Oct–Mar',
   [],[]],
  ['Madan Mohan Temple','madan-mohan-temple-cooch-behar','North Bengal','Cooch Behar',26.3253,89.4470,
   'The royal family’s revered white temple, busiest during the Raas festival.',
   'The Madan Mohan Bari, built by Maharaja Nripendra Narayan in the 1880s, enshrines the Koch royal family’s tutelary deity Madan Mohan. Its white domed shrine draws huge crowds during the annual Raas Mela, one of North Bengal’s biggest fairs.',
   ['Temple','Spiritual','Heritage','Festival'],'Oct–Mar',
   [],[]],
  ['Rasikbil','rasikbil','North Bengal','Cooch Behar',26.1800,89.6500,
   'A large wetland and bird haven with a mini-zoo and migratory flocks.',
   'Rasikbil is an expansive natural lake near Tufanganj that attracts migratory and resident birds in large numbers. A deer park, leopard and python enclosures, a crocodile rehabilitation centre and boating make it a popular family and birdwatching outing.',
   ['BirdWatching','Nature','Lake','Family'],'Nov–Mar',
   [],[]],
  ['Sagar Dighi','sagar-dighi-cooch-behar','North Bengal','Cooch Behar',26.3236,89.4513,
   'The serene central lake of royal Cooch Behar, ringed by colonial-era offices.',
   'Sagar Dighi is a large rectangular tank at the heart of Cooch Behar town, dug in the late 19th century and surrounded by heritage government buildings. A favourite spot for evening walks, it reflects the planned layout of the old princely capital.',
   ['Lake','Heritage','Peaceful','Photography'],'Oct–Mar',
   [],[]],

  // ── Uttar Dinajpur ────────────────────────────────────────────────────────
  ['Kulik Bird Sanctuary','kulik-bird-sanctuary','North Bengal','Uttar Dinajpur',25.6240,88.1280,
   'One of Asia’s largest bird sanctuaries — a monsoon nesting ground for open-bills and egrets.',
   'The Kulik Bird Sanctuary at Raiganj is among the largest bird sanctuaries in Asia, hosting over a lakh migratory birds each monsoon, chiefly Asian open-bill storks, egrets, night herons and cormorants. A forested loop along the Kulik river offers excellent viewing from July to December.',
   ['BirdWatching','Nature','Forest','EcoTourism'],'Jul–Dec',
   [],[]],
  ['Karnajora Park & Museum','karnajora-park-museum','North Bengal','Uttar Dinajpur',25.6140,88.1340,
   'A leafy heritage complex with a regional museum and old zamindari grounds.',
   'Karnajora, just south of Raiganj, combines a wooded park, a small zoo and a museum displaying terracotta, sculptures and antiquities from the region. The shaded grounds of the former estate make it a relaxed local outing paired with a Kulik visit.',
   ['Museum','Park','Heritage','Family'],'Oct–Mar',
   [],[]],

  // ── Dakshin Dinajpur ──────────────────────────────────────────────────────
  ['Bangarh Ruins','bangarh-ruins','North Bengal','Dakshin Dinajpur',25.4000,88.5300,
   'An ancient mound near Gangarampur layered with Mauryan to Pala-era history.',
   'Bangarh, near Gangarampur, is an archaeological site identified with the ancient city of Kotivarsha, with cultural layers spanning the Mauryan, Kushan, Gupta and Pala periods. Excavated mounds, terracotta and the nearby Bana Raja’s palace remains make it a key heritage site of North Bengal.',
   ['History','Ruins','Heritage','Archaeology'],'Oct–Mar',
   [],[]],
  ['Tapan Dighi','tapan-dighi','North Bengal','Dakshin Dinajpur',25.2850,88.5550,
   'A vast medieval tank steeped in local legend, ringed by quiet countryside.',
   'Tapan Dighi is a large historic lake associated with the Pala–Sena era and rich local legend. The expansive water body, surrounded by rural Dakshin Dinajpur, is a tranquil spot tied to the region’s ancient past and seasonal fairs.',
   ['Lake','History','Rural','Peaceful'],'Oct–Mar',
   [],[]],

  // ── North 24 Parganas ─────────────────────────────────────────────────────
  ['Gandhi Ghat, Barrackpore','gandhi-ghat-barrackpore','South Bengal','North 24 Parganas',22.7610,88.3680,
   'A riverside memorial to Mahatma Gandhi on the Hooghly at Barrackpore.',
   'Gandhi Ghat at Barrackpore, where a portion of Mahatma Gandhi’s ashes was immersed, is a serene riverfront memorial with a marble mausoleum, museum and the historic Mangal Pandey park nearby. The breezy Hooghly promenade is a favourite weekend escape from Kolkata.',
   ['Memorial','Riverfront','Heritage','History'],'Oct–Mar',
   [],[]],
  ['Taki','taki','South Bengal','North 24 Parganas',22.5900,88.9170,
   'A riverside border town on the Ichhamati, famous for its Durga immersion.',
   'Taki sits on the banks of the Ichhamati, which marks the India–Bangladesh border, where boats from both countries gather during the riverine Durga idol immersion. Riverfront resorts, the Raja’s rajbari and boat rides make it a popular weekend getaway.',
   ['Riverfront','WeekendGetaway','Heritage','BoatSafari'],'Oct–Mar',
   [],[]],
  ['Chandraketugarh','chandraketugarh','South Bengal','North 24 Parganas',22.6800,88.6700,
   'A 2,000-year-old archaeological site rich in Sunga–Kushan terracotta.',
   'Chandraketugarh, near Berachampa, is one of Bengal’s most important archaeological sites, with finds spanning the pre-Mauryan to Pala eras. The Khana-Mihirer Dhipi mound and exquisite terracotta plaques attest to a flourishing ancient port-town and trade hub.',
   ['History','Ruins','Heritage','Terracotta'],'Oct–Mar',
   [],[]],

  // ── Howrah ──────────────────────────────────────────────────────────────
  ['Belur Math','belur-math','South Bengal','Howrah',22.6300,88.3557,
   'The riverside headquarters of the Ramakrishna Mission, blending temple styles of all faiths.',
   'Belur Math, on the west bank of the Hooghly, is the global headquarters of the Ramakrishna Math and Mission founded by Swami Vivekananda. Its main temple famously fuses Hindu, Islamic, Buddhist and Christian architecture, set in tranquil riverside gardens that draw pilgrims and visitors alike.',
   ['Spiritual','Heritage','Architecture','Riverfront'],'Oct–Mar',
   [],[]],
  ['Indian Botanic Garden','indian-botanic-garden','South Bengal','Howrah',22.5550,88.2900,
   'A 270-acre historic garden home to the world-famous Great Banyan Tree.',
   'The Acharya Jagadish Chandra Bose Indian Botanic Garden at Shibpur, established in 1787, spreads over 270 acres beside the Hooghly. Its centrepiece is the Great Banyan, one of the largest trees in the world by canopy, alongside vast collections of palms, orchids and aquatic plants.',
   ['Nature','Garden','Heritage','Family'],'Oct–Mar',
   [],[]],
  ['Garchumuk','garchumuk','South Bengal','Howrah',22.4500,88.1000,
   'A riverside picnic spot at the meeting of the Damodar and Hooghly with a deer park.',
   'Garchumuk, where the Damodar joins the Hooghly, is a popular riverside getaway with a deer park, mini-zoo and a watchtower overlooking the confluence. Its open riverfront and gardens make it a favourite day-trip and picnic destination from Kolkata.',
   ['Riverfront','Picnic','Family','Nature'],'Oct–Mar',
   [],[]],

  // ── Purba Bardhaman ───────────────────────────────────────────────────────
  ['108 Shiva Temples, Kalna','108-shiva-temples-kalna','Central Bengal','Purba Bardhaman',23.2230,88.3690,
   'A unique double-ring of 108 terracotta-and-stone Shiva temples at Kalna.',
   'The Nava Kailash or 108 Shiva Temples at Kalna, built in 1809 by the Bardhaman royal family, are arranged in two concentric circles of aatchala temples. The alternating white and black Shiva lingams and fine brick craftsmanship make it one of Bengal’s most distinctive temple complexes.',
   ['Temple','Terracotta','Heritage','Architecture'],'Oct–Mar',
   [],[]],
  ['Kalna Rajbari Temple Complex','kalna-rajbari','Central Bengal','Purba Bardhaman',23.2210,88.3660,
   'A cluster of ornate terracotta temples built by the Maharajas of Bardhaman.',
   'The Kalna Rajbari complex holds a remarkable group of terracotta temples including the Lalji, Krishna Chandra and Pratapeswar shrines, celebrated for their intricate panels depicting mythology and daily life. It is among the finest concentrations of terracotta temple art in Bengal.',
   ['Temple','Terracotta','Heritage','Architecture'],'Oct–Mar',
   [],[]],
  ['Curzon Gate','curzon-gate-bardhaman','Central Bengal','Purba Bardhaman',23.2390,87.8620,
   'Bardhaman’s landmark victory arch, the symbolic heart of the city.',
   'The Curzon Gate (Bijoy Toran) in Bardhaman town is an ornate early-1900s archway built by the Maharaja, blending classical columns with Indian motifs. Standing at the city’s busiest crossing, it is Bardhaman’s best-known landmark and gateway to the old palace road.',
   ['Heritage','Architecture','Colonial','Landmark'],'Oct–Mar',
   [],[]],

  // ── Paschim Bardhaman ─────────────────────────────────────────────────────
  ['Maithon Dam','maithon-dam','Central Bengal','Paschim Bardhaman',23.7900,86.8200,
   'A vast reservoir on the Barakar river with boating and an island temple.',
   'Maithon Dam, on the Barakar river at the West Bengal–Jharkhand border, impounds a large scenic reservoir popular for boating and weekend escapes. The Kalyaneswari temple nearby and the wooded hills around the lake make it a favourite outing from the Asansol–Durgapur belt.',
   ['Lake','Dam','Boating','WeekendGetaway'],'Oct–Mar',
   [],[]],
  ['Churulia','churulia','Central Bengal','Paschim Bardhaman',23.7500,87.0500,
   'Birthplace of rebel poet Kazi Nazrul Islam, with his memorial and academy.',
   'Churulia, near Asansol, is the birthplace of Kazi Nazrul Islam, Bengal’s “Rebel Poet” and Bangladesh’s national poet. The Nazrul Academy, his memorial and family home, and an annual fair on his birth anniversary draw literature lovers to this quiet village.',
   ['Heritage','Culture','History','Memorial'],'Oct–Mar',
   [],[]],
  ['Garh Jungle','garh-jungle','Central Bengal','Paschim Bardhaman',23.6200,87.3300,
   'A forested ancient site linked to the Shyama Rupa temple and Ichai Ghosh legend.',
   'Garh Jungle near Durgapur is a sal-forested tract steeped in legend, home to the revered Shyama Rupa (Kali) temple and tied to the tale of the chieftain Ichai Ghosh. Its quiet woodland and old shrines make it a popular spiritual and picnic spot.',
   ['Forest','Temple','History','Picnic'],'Oct–Mar',
   [],[]],

  // ── Jhargram ──────────────────────────────────────────────────────────────
  ['Jhargram Rajbari','jhargram-rajbari','South Bengal','Jhargram',22.4490,86.9980,
   'A regal early-20th-century palace of the Malla-Deb rulers, now a heritage stay.',
   'The Jhargram Rajbari, built by the Malla-Deb royal family, blends Italian and Islamic architectural styles in a striking palace set amid lawns and sal forest. Part of it now functions as a heritage hotel, making it the centrepiece of any visit to Jhargram.',
   ['Palace','Heritage','Architecture','Homestay'],'Oct–Mar',
   ['Jhargram Rajbari (Heritage Stay)'],[]],
  ['Chilkigarh Kanak Durga Temple','chilkigarh-kanak-durga','South Bengal','Jhargram',22.4280,86.8350,
   'A forest-fringed temple beside a sacred grove on the Dulung river.',
   'The Kanak Durga temple at Chilkigarh stands beside one of Bengal’s best-preserved sacred groves along the Dulung river. The old palace ruins, dense biodiversity of the grove and the riverside setting give the site both spiritual and ecological significance.',
   ['Temple','Forest','Spiritual','Nature'],'Oct–Mar',
   [],[]],
  ['Ghagra Falls','ghagra-falls','South Bengal','Jhargram',22.6050,86.7300,
   'A rocky cascade on the Tarafeni near Belpahari in Jhargram’s forested west.',
   'Ghagra Falls, near Belpahari, is a scenic series of rapids and a small waterfall where the Tarafeni river tumbles over rugged rocks. Surrounded by forest and tribal hamlets, it is a favourite offbeat picnic and trekking spot in western Jhargram.',
   ['Waterfall','Nature','Offbeat','Trek'],'Jul–Feb',
   [],[]],
  ['Belpahari','belpahari','South Bengal','Jhargram',22.6000,86.7300,
   'A hilly, forested tribal belt of waterfalls, dolomite hills and red-earth villages.',
   'Belpahari is a rugged, forested region in western Jhargram dotted with attractions like Kakrajhore, Ghagra, Gadrasini hill and Khandarani lake. Its sal forests, Santhal villages and quiet trails make it one of South Bengal’s most rewarding offbeat escapes.',
   ['Offbeat','Nature','Forest','TribalCulture'],'Oct–Feb',
   [],[]],

  // ── Paschim Medinipur ─────────────────────────────────────────────────────
  ['Gangani','gangani','South Bengal','Paschim Medinipur',22.8600,87.3500,
   'The “Grand Canyon of Bengal” — eroded red-laterite ravines above the Shilabati.',
   'Gangani, at Garhbeta, is a dramatic landscape of deep red and ochre laterite gorges carved by erosion above the Shilabati river. The canyon-like cliffs, tied to Mahabharata legend, glow at sunset and make for striking photography and a unique geological outing.',
   ['Nature','Scenic','Photography','Offbeat'],'Oct–Mar',
   [],[]],
  ['Kurumbera Fort','kurumbera-fort','South Bengal','Paschim Medinipur',22.1800,87.6600,
   'A 15th-century stone fort-and-temple complex near Keshiary.',
   'Kurumbera Fort near Keshiary is a laterite-stone enclosure dating to the 15th–16th centuries, combining a fort, a pillared mandap and a temple. Built during the Gajapati and later Mughal periods, its weathered colonnades make it a quiet, atmospheric heritage stop.',
   ['Fort','Heritage','History','Architecture'],'Oct–Mar',
   [],[]],
  ['Hijli Shaheed Bhawan','hijli-shaheed-bhawan','South Bengal','Paschim Medinipur',22.3140,87.3110,
   'A colonial-era detention camp turned freedom-struggle museum on the IIT Kharagpur campus.',
   'The Hijli Detention Camp, where freedom fighters were imprisoned and two were killed in 1931, now stands as Shaheed Bhawan within the IIT Kharagpur campus. It houses a museum on the independence movement and the institute’s history, a poignant heritage landmark.',
   ['History','Heritage','Museum','Colonial'],'Oct–Mar',
   [],[]],
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function photoFor(title, district) {
  const q = `${title} ${district} West Bengal`;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const r = await fetch(`${API}/geo/photo?query=${encodeURIComponent(q)}`, { signal: AbortSignal.timeout(45000) });
      if (r.ok) { const d = await r.json(); if (d?.url) return d.url; return ''; }
    } catch { /* retry */ }
    await sleep(1500);
  }
  return '';
}

const out = [];
for (const row of P) {
  const [title, slug, region, district, lat, lng, excerpt, description, tags, best, hotels, restaurants] = row;
  const url = await photoFor(title, district);
  out.push({
    title, slug, region, district,
    coordinates: { lat, lng },
    heroImage: { url, alt: `${title}, ${district}` },
    excerpt, description, tags, bestTime: best,
    nearbyHotels: hotels, nearbyRestaurants: restaurants,
    rating: 0, reviewsCount: 0,
  });
  console.error(`✓ ${title} — ${url ? 'photo' : 'NO PHOTO'}`);
  await sleep(300);
}

// Emit as pretty JSON-ish TS object literals (2-space indent, trailing comma).
const body = out.map((o) => '  ' + JSON.stringify(o)).join(',\n');
writeFileSync(new URL('./thin-places.generated.txt', import.meta.url), body + ',\n');
console.error(`\nWrote ${out.length} places.`);
