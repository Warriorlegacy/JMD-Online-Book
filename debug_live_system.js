const https = require('https');

https.get('https://web-two-gamma-49.vercel.app/api/matches/active', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    try {
      const parsed = JSON.parse(data);
      console.log('Data length:', Array.isArray(parsed) ? parsed.length : 'not an array');
      console.log('Data:', JSON.stringify(parsed, null, 2).slice(0, 500) + '...');
    } catch (e) {
      console.log('Error parsing JSON:', e.message);
      console.log('Raw data:', data.slice(0, 500) + '...');
    }
  });
}).on('error', (e) => {
  console.error('Request error:', e);
});
