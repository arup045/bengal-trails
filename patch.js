const fs = require('fs');
let c = fs.readFileSync('backend/src/index.js', 'utf8');
c = c.replace(/\n\/\/ Temporary debug route[\s\S]*?}\);\n/, '\n');
fs.writeFileSync('backend/src/index.js', c);
console.log('Debug route removed');
