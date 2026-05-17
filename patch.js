const fs = require('fs');
let c = fs.readFileSync('backend/src/routes/auth.js', 'utf8');

// Revert - remove the extra values we added
c = c.replace(
  "[email.toLowerCase(), hash, name, 'user', 'active']",
  "[email.toLowerCase(), hash, name]"
);

fs.writeFileSync('backend/src/routes/auth.js', c);
console.log('Reverted:', c.includes("hash, name]") ? 'YES' : 'NO');
