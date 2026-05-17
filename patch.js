const fs = require('fs');
let c = fs.readFileSync('backend/backend/src/index.js', 'utf8');

const debugRoute = `
// Temporary debug route - remove after fixing
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

c = c.replace('app.use(\'/api\'', debugRoute + '\napp.use(\'/api\'');
fs.writeFileSync('backend/backend/src/index.js', c);
console.log('Debug route added');
