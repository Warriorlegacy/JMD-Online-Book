const { spawn } = require('child_process');
const http = require('http');

console.log("Starting Next.js app in background...");
const app = spawn('npm', ['run', 'dev'], { cwd: './sbe/web', stdio: 'pipe' });

let testStarted = false;

app.stdout.on('data', (data) => {
  const str = data.toString();
  console.log(`[Next.js] ${str}`);
  if (!testStarted && (str.includes('Ready') || str.includes('started server on') || str.includes('Listening on port'))) {
    testStarted = true;
    console.log("Server seems to be ready, running test...");
    setTimeout(runTest, 2000);
  }
});

app.stderr.on('data', (data) => {
  console.error(`[Next.js Error] ${data}`);
});

function runTest() {
  const options = {
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/matches/active',
    method: 'GET',
    timeout: 10000
  };

  console.log(`Making request to ${options.hostname}:${options.port}${options.path}`);
  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      try {
        console.log(`Response status: ${res.statusCode}`);
        if (res.statusCode !== 200) {
            console.error("Non-200 status code:", data);
        } else {
            const matches = JSON.parse(data);
            console.log(`Active matches count: ${matches.length}`);
            if (matches.length === 0) {
              console.error("0 matches returned!");
            } else {
              console.log("Success: Non-empty array of live matches returned.");
            }
        }
      } catch (err) {
        console.error('Failed to parse response:', err, 'Raw data:', data);
      }
      cleanup();
    });
  });

  req.on('error', (err) => {
    console.error('Request failed:', err);
    cleanup();
  });

  req.on('timeout', () => {
    req.destroy();
    console.error('Request timed out');
    cleanup();
  });

  req.end();
}

function cleanup() {
  console.log("Killing Next.js app...");
  app.kill();
  process.exit(0);
}
