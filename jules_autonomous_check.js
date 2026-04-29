const https = require('https');
const http = require('http');

async function testUrl(url, method = 'GET') {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.request(url, { method }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, data }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  console.log("Running autonomous health check...");
  let failed = false;

  // 1. Supabase Check
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    console.error("❌ NEXT_PUBLIC_SUPABASE_URL is not set");
    failed = true;
  } else {
    try {
      const res = await testUrl(`${supabaseUrl}/rest/v1/`);
      console.log(`✅ Supabase connectivity: ${res.statusCode}`);
    } catch (e) {
      console.error("❌ Supabase connection failed:", e.message);
      failed = true;
    }
  }

  // 2. Proxy Logic Check
  const baseUrl = 'https://web-two-gamma-49.vercel.app';
  try {
    const res = await testUrl(`${baseUrl}/sports`, 'HEAD');
    if (res.statusCode === 307 || res.statusCode === 308) {
      console.log("✅ Proxy redirecting /sports to /en/sports (or similar)");
    } else {
      console.log(`⚠️ Proxy redirect status for /sports: ${res.statusCode} (expected 307/308)`);
      failed = true;
    }
  } catch (e) {
     console.error("❌ Proxy check failed:", e.message);
     failed = true;
  }

  // 3. API Check
  try {
    const res = await testUrl(`${baseUrl}/api/matches/active`);
    console.log(`✅ /api/matches/active status: ${res.statusCode}`);
    try {
      const data = JSON.parse(res.data);
      if (Array.isArray(data) && data.length > 0) {
        console.log(`✅ /api/matches/active returns ${data.length} matches`);
      } else {
        console.log(`⚠️ /api/matches/active returned empty array or non-array:`, data);
        failed = true;
      }
    } catch(e) {
      console.log("❌ /api/matches/active didn't return JSON");
      failed = true;
    }
  } catch (e) {
    console.error("❌ API check failed:", e.message);
    failed = true;
  }

  if (failed) {
    console.log("❌ Health Check Failed!");
    process.exit(1);
  } else {
    console.log("✅ HEALTH SCORE 100%");
  }
}

run();
