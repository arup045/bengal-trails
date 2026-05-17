const fs = require('fs');
const path = require('path');

// Find index.js automatically
const possible = [
  'backend/src/index.js',
  'backend/backend/src/index.js', 
  'src/index.js'
];

let indexPath = null;
for (const p of possible) {
  if (fs.existsSync(p)) { indexPath = p; break; }
}

if (!indexPath) { console.log('index.js NOT FOUND'); process.exit(1); }
console.log('Found:', indexPath);

let c = fs.readFileSync(indexPath, 'utf8');

const debugRoute = `
app.get('/api/debug-env', (req, res) => {
  res.json({
    smtp_host: process.env.SMTP_HOST || 'NOT SET',
    smtp_port: process.env.SMTP_PORT || 'NOT SET',
    smtp_user: process.env.SMTP_USER || 'NOT SET',
    smtp_pass: process.env.SMTP_PASS ? 'SET' : 'NOT SET',
    jwt_secret: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
    database: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
    frontend_url: process.env.FRONTEND_URL || 'NOT SET',
    node_env: process.env.NODE_ENV || 'NOT SET'
  });
});
`;

c = c.replace("app.use('/api'", debugRoute + "\napp.use('/api'");
fs.writeFileSync(indexPath, c);
console.log('Debug route added to:', indexPath);
