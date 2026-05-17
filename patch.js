const fs = require('fs');

// Fix Hero.tsx - add showButton prop
let hero = fs.readFileSync('frontend/src/app/components/Hero.tsx', 'utf8');
if (!hero.includes('showButton')) {
  hero = hero.replace(
    'size="lg"',
    'size="lg"\n            showButton={true}'
  );
  fs.writeFileSync('frontend/src/app/components/Hero.tsx', hero);
  console.log('Hero.tsx - showButton added');
} else {
  console.log('Hero.tsx - already has showButton');
}

// Fix SmartSearchBar - change ?location= to ?q=
let bar = fs.readFileSync('frontend/src/app/components/SmartSearchBar.tsx', 'utf8');
bar = bar.split('location=${encodeURIComponent(query').join('q=${encodeURIComponent(query');
bar = bar.split('location=${encodeURIComponent(q)').join('q=${encodeURIComponent(q)');
fs.writeFileSync('frontend/src/app/components/SmartSearchBar.tsx', bar);
console.log('SmartSearchBar.tsx - URL params fixed');
