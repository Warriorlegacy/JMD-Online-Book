const https = require('https');

https.get('https://web-two-gamma-49.vercel.app/api/matches/active', (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('Status code:', res.statusCode);
      console.log('Returned matches:', parsed.length);
      if (parsed.length > 0) {
        console.log('First match:', parsed[0]);
      } else {
        console.log('Data:', parsed);
      }
    } catch (e) {
      console.log('Status code:', res.statusCode);
      console.log('Raw data:', data);
    }
  });
}).on('error', err => {
  console.error(err);
});
