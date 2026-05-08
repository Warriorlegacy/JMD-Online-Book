const fs = require('fs');

try {
  const data = JSON.parse(fs.readFileSync('artifacts/kinetic-ledger-debug/latest.json', 'utf8'));
  const probes = data.checks?.routes?.probes || data.routes?.probes || [];
  const activeMatchesProbe = probes.find(p => p.name === 'matches-active');

  let activeMatches = [];
  if (activeMatchesProbe && activeMatchesProbe.body) {
    let bodyText = activeMatchesProbe.body;
    if (!bodyText.endsWith(']') && bodyText.startsWith('[')) {
      const lastBrace = bodyText.lastIndexOf('}');
      if (lastBrace !== -1) {
        bodyText = bodyText.substring(0, lastBrace + 1) + ']';
      } else {
        bodyText = '[]';
      }
    }

    try {
      activeMatches = JSON.parse(bodyText);
    } catch (e) {
      console.error("Could not parse matches-active body:", e);
      const matchRegex = /"id":"[^"]+"/g;
      const matches = bodyText.match(matchRegex);
      if (matches) {
        activeMatches = matches.map((_, i) => ({ id: i, odds: {} }));
      }
    }
  }

  console.log(`Active matches count: ${activeMatches.length}`);

  if (activeMatches.length > 0) {
    console.log("Matches found. Checking for missing odds...");
    const missingOdds = activeMatches.filter(m => !m.odds || Object.keys(m.odds).length === 0);
    console.log(`Matches missing odds: ${missingOdds.length}`);
  } else {
    console.log("0 active matches found in probe!");
  }
} catch (err) {
  console.error("Error reading or processing latest.json:", err);
}
