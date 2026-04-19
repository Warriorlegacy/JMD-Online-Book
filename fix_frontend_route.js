const fs = require('fs');
const path = 'sbe/web/src/app/api/matches/route.ts';
let code = fs.readFileSync(path, 'utf8');

const target = `      \`\${process.env.BACKEND_URL || "https://jmd-online-book.onrender.com"}/matches\`,`;
const replacement = `      \`\${process.env.BACKEND_URL || "https://sbe-backend.onrender.com"}/matches\`,`;

if (code.includes(target)) {
  fs.writeFileSync(path, code.replace(target, replacement));
  console.log("Replaced successfully");
} else {
  console.log("Target not found");
}
