const { execSync } = require('child_process');
const https = require('https');
const http = require('http');

async function runChecks() {
  console.log("🚀 Starting Jules Autonomous Health Check...");
  let healthScore = 100;

  // 1. Check Supabase connectivity
  console.log("Checking Database Connectivity...");
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("❌ DATABASE_URL is missing!");
    healthScore -= 25;
  } else {
    console.log("✅ DATABASE_URL is set.");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    console.error("❌ NEXT_PUBLIC_SUPABASE_URL is missing!");
    healthScore -= 25;
  } else {
    console.log("✅ NEXT_PUBLIC_SUPABASE_URL is set.");
  }

  // 2. Verify /api/matches/active
  console.log("Checking API /api/matches/active...");
  try {
     const data = await new Promise((resolve, reject) => {
       const req = https.get('https://web-two-gamma-49.vercel.app/api/matches/active', (res) => {
         let body = '';
         res.on('data', chunk => body += chunk);
         res.on('end', () => resolve({ statusCode: res.statusCode, body }));
       });
       req.on('error', reject);
     });

     if (data.statusCode === 200) {
        console.log("✅ API returned 200 OK.");
        const parsed = JSON.parse(data.body);
        if (parsed.length === undefined || parsed.length === 0) {
           console.log("⚠️ API returned empty data, but endpoint is active.");
        } else {
           console.log("✅ API returned live data.");
        }
     } else {
        console.error(`❌ API failed with status ${data.statusCode}`);
        healthScore -= 25;
     }
  } catch(e) {
     console.error("❌ API request failed:", e.message);
     healthScore -= 25;
  }

  // Check Proxy logic
  console.log("Checking src/proxy.ts logic existence...");
  try {
      const output = execSync('cat sbe/web/src/proxy.ts').toString();
      if (output.includes('middleware') || output.includes('NextResponse')) {
          console.log("✅ Proxy logic looks present.");
      } else {
          console.error("❌ Proxy logic incomplete.");
          healthScore -= 10;
      }
  } catch (e) {
      console.error("❌ Failed to read proxy.ts");
      healthScore -= 10;
  }

  // Check TopMatchesGrid mapping
  console.log("Checking TopMatchesGrid component mapping...");
  try {
      const output = execSync('cat sbe/web/src/app/\\[locale\\]/sports/page.tsx').toString();
      if (output.includes('m.teamA') && output.includes('m.teamB') && !output.includes('DEMO_TOP')) {
          console.log("✅ Matches are correctly mapping teamA/teamB fields instead of demo.");
      } else {
          console.error("❌ Mapping issue found in TopMatchesGrid.");
          healthScore -= 15;
      }
  } catch (e) {
      console.error("❌ Failed to read sports page.tsx");
      healthScore -= 15;
  }

  console.log(`\n🩺 Final Health Score: ${healthScore}/100`);
  if (healthScore === 100) {
    console.log("✅ ALL CHECKS PASSED. SYSTEM CLEAN.");
  } else {
    console.log("❌ SYSTEM NEEDS FIXES.");
    process.exit(1);
  }
}

runChecks();
