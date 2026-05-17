const https = require('https');

const SENDGRID_KEY = 'SG.xxxxxxxxxx';  // paste REAL key here
const TO_EMAIL = 'arupbhattacharya450@gmail.com';

const data = JSON.stringify({
  personalizations: [{ to: [{ email: TO_EMAIL }] }],
  from: { email: 'arupbhattacharya450@gmail.com', name: 'Bengal Trails' },
  subject: 'Bengal Trails - Email Test',
  content: [{ type: 'text/plain', value: 'SendGrid is working!' }]
});

const options = {
  hostname: 'api.sendgrid.com',
  path: '/v3/mail/send',
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SENDGRID_KEY}`,
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  if (res.statusCode === 202) console.log('SUCCESS - Check your inbox!');
  else { console.log('FAILED - Status:', res.statusCode); res.on('data', d => console.log(d.toString())); }
});
req.on('error', e => console.log('ERROR:', e.message));
req.write(data); req.end();
