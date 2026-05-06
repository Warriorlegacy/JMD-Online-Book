const http = require('http');

http.get('http://127.0.0.1:3210/api/matches/active', (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const matches = JSON.parse(data);
      if (Array.isArray(matches) && matches.length > 0) {
        console.log(`Success! Found ${matches.length} active matches.`);
      } else {
        console.error('Error: Health check failed! Found 0 matches or invalid response.');
        process.exit(1);
      }
    } catch (e) {
      console.error('Error parsing response:', e.message);
      process.exit(1);
    }
  });

}).on("error", (err) => {
  console.error("Error: Health check failed to connect:", err.message);
  process.exit(1);
});
