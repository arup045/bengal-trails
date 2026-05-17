const fs = require('fs');
let c = fs.readFileSync('frontend/src/app/components/Footer.tsx', 'utf8');

// Fix email
c = c.replace(/hello@gobro\.travel/g, 'hello@bengaltrails.com');

// Fix any gobro.travel domain references
c = c.replace(/gobro\.travel/g, 'bengaltrails.com');

// Fix description text if it mentions gobro
c = c.replace(/gobro's most trusted/gi, "Bengal's most trusted");
c = c.replace(/GoBro/g, 'Bengal Trails');
c = c.replace(/Gobro/g, 'Bengal Trails');
c = c.replace(/gobro/g, 'bengaltrails');

fs.writeFileSync('frontend/src/app/components/Footer.tsx', c);
console.log('Footer updated');
console.log('Email check:', c.includes('hello@bengaltrails.com') ? 'FIXED' : 'NOT FOUND');
