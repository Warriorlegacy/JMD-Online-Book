const net = require('net');
const fs = require('fs');

async function testSupabase() {
  return new Promise((resolve) => {
    // Expected format: postgresql://postgres.user:pass@host:port/postgres
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.error('❌ DATABASE_URL is not set');
      resolve(false);
      return;
    }

    try {
      const url = new URL(dbUrl);
      const host = url.hostname;
      const port = url.port || 5432;

      const socket = new net.Socket();
      socket.setTimeout(5000);

      socket.on('connect', () => {
        console.log('✅ Supabase connected (TCP socket)');
        socket.destroy();
        resolve(true);
      });

      socket.on('timeout', () => {
        console.error('❌ Supabase connection timed out');
        socket.destroy();
        resolve(false);
      });

      socket.on('error', (err) => {
        console.error('❌ Supabase connection failed', err.message);
        resolve(false);
      });

      socket.connect(port, host);
    } catch (err) {
      console.error('❌ Invalid DATABASE_URL', err.message);
      resolve(false);
    }
  });
}

async function testApi() {
  try {
    const res = await fetch('https://web-two-gamma-49.vercel.app/api/matches/active');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        console.log('✅ /api/matches/active returned live data (count: ' + data.length + ')');
        return true;
      } else {
        console.warn('⚠️ /api/matches/active returned empty data:', data);
        return false;
      }
    } else {
      console.error('❌ /api/matches/active failed', res.status);
      return false;
    }
  } catch (err) {
    console.error('❌ API request failed', err.message);
    return false;
  }
}

function checkProxy() {
  try {
    const content = fs.readFileSync('sbe/web/src/proxy.ts', 'utf-8');
    if (content.includes('pathname.startsWith("/_next")') && content.includes('pathname.startsWith(`/${locale}/`)')) {
      console.log('✅ Proxy logic checks basic routing correctly');
      return true;
    } else {
      console.error('❌ Proxy logic might be incorrect');
      return false;
    }
  } catch (err) {
    console.error('❌ Failed to read proxy.ts', err.message);
    return false;
  }
}

function checkTopMatchesGrid() {
  try {
    const content = fs.readFileSync('sbe/web/src/components/top-matches-grid.tsx', 'utf-8');

    // As per instruction, component needs to be checked, it might currently be wrong, but we check if we need to fix it.
    if (content.includes('match.teamA') && content.includes('match.teamB')) {
      console.log('✅ TopMatchesGrid maps teamA/teamB');
      return true;
    } else {
      console.log('❌ TopMatchesGrid uses old teams array mapping');
      return false;
    }
  } catch(err) {
    console.error('❌ Failed to read top-matches-grid.tsx', err.message);
    return false;
  }
}

async function runChecks() {
  let score = 0;

  if (await testSupabase()) score += 25;
  if (await testApi()) score += 25;
  if (checkProxy()) score += 25;
  if (checkTopMatchesGrid()) score += 25;

  console.log('---');
  console.log(`HEALTH SCORE: ${score}%`);

  if (score === 100) {
    console.log('STATUS: CLEAN');
  } else {
    console.log('STATUS: NEEDS FIX');
  }
}

runChecks();
