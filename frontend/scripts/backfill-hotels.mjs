// Backfills `nearbyHotels` for places that have an empty list, using REAL nearby
// accommodation from OpenStreetMap (via our geo proxy). Honest data — real
// OSM-listed hotels/lodges/guest houses near each place, nearest first.
//
// Note: the geo proxy now requires an allowlisted Origin (anti-abuse guard), so
// this owner-run build tool sends the production Origin header.
import { readFileSync, writeFileSync } from 'fs';

const API = 'https://gobro-api.onrender.com/api';
const ORIGIN = 'https://bengal-trails.vercel.app';
const FILE = 'src/app/data/places-full.ts';

const GENERIC = new Set(['place','hotel','hostel','motel','apartment','guest_house','guesthouse','house','my house','lodge','resort','untitled','home','homestay']);
// Reject OSM "accommodation" that isn't tourist lodging — student hostels,
// university halls, messes, campus guest houses, PGs, hospitals etc.
const BAD = /hostel|\bmess\b|\bhall\b|universit|\bcollege\b|\binstitute\b|\bschool\b|students?|\bboys?\b|\bgirls?\b|missionar|\bsociety\b|campus|\bdept|\bpg\b|hospital|paying guest|\bblock\b|\bquarters?\b|staff\s+apartment|\bbari\b|(?:muslim|hindu)\s+hotel|\bofficers?\b|inspection bungalow|\bbhawan\b|\bbhavan\b/i;
const isLodging = (name) => !BAD.test(name);
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g,'');
const km = (aLat,aLng,bLat,bLng) => { const R=6371,r=d=>d*Math.PI/180; const dLat=r(bLat-aLat),dLng=r(bLng-aLng); const x=Math.sin(dLat/2)**2+Math.cos(r(aLat))*Math.cos(r(bLat))*Math.sin(dLng/2)**2; return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x)); };
const sleep = (ms) => new Promise((r)=>setTimeout(r,ms));

// ── parse current places ─────────────────────────────────────────────────────
let src = readFileSync(FILE,'utf8');
const m = src.match(/export const placesData[^=]*=\s*/);
const arrStr = src.slice(m.index+m[0].length, src.indexOf('\n];', m.index)+2).replace(/,(\s*[}\]])/g,'$1');
const places = JSON.parse(arrStr);
const targets = places.filter((p)=>p.coordinates && p.coordinates.lat && (!Array.isArray(p.nearbyHotels)||p.nearbyHotels.length===0));
console.error(`backfilling ${targets.length} places…`);

async function fetchHotels(lat, lng, radius) {
  for (let a=0; a<3; a++) {
    try {
      const r = await fetch(`${API}/geo/amenities?lat=${lat}&lng=${lng}&type=hotel&radius=${radius}`, {
        headers: { Origin: ORIGIN }, signal: AbortSignal.timeout(60000),
      });
      if (r.ok) { const d = await r.json(); if (d && d.ok !== false) return d.items || []; }
    } catch {}
    await sleep(2000);
  }
  return [];
}
async function hotelsFor(p) {
  const { lat, lng } = p.coordinates;
  const seen = new Set();
  const pick = (items) => items
    .filter((it)=>it.name && !GENERIC.has(it.name.trim().toLowerCase()) && it.name.trim().length>2 && isLodging(it.name))
    .filter((it)=>{ const n=norm(it.name); if(seen.has(n))return false; seen.add(n); return true; })
    .map((it)=>({ name: it.name.trim(), km: km(lat,lng,it.lat,it.lon) }))
    .sort((x,y)=>x.km-y.km).slice(0,4).map((x)=>x.name);
  // Small radius first (fast, avoids Overpass timeouts in dense areas); widen
  // only when nothing is found (remote spots — reach the nearest town).
  let out = pick(await fetchHotels(lat, lng, 7000));
  if (out.length === 0) { seen.clear(); out = pick(await fetchHotels(lat, lng, 25000)); }
  return out;
}

const updates = {};
for (const p of targets) {
  const hotels = await hotelsFor(p);
  if (hotels.length) updates[p.slug] = hotels;
  console.error(`  ${p.slug}: ${hotels.length ? hotels.join(' · ') : '(none nearby)'}`);
  await sleep(250);
}

// ── rewrite: the empty-hotel entries are single-line JSON objects (added by the
// generators), so we can JSON-parse each line and patch nearbyHotels in place.
const lines = src.split('\n');
let patched = 0;
for (let i=0;i<lines.length;i++) {
  const t = lines[i].trim();
  if (!t.startsWith('{') ) continue;
  let obj; try { obj = JSON.parse(t.replace(/,$/,'')); } catch { continue; }
  if (obj && obj.slug && updates[obj.slug]) {
    obj.nearbyHotels = updates[obj.slug];
    lines[i] = '  ' + JSON.stringify(obj) + (lines[i].trim().endsWith(',') ? ',' : '');
    patched++;
  }
}
writeFileSync(FILE, lines.join('\n'));
console.error(`\npatched ${patched} entries (${Object.keys(updates).length} got hotels).`);
