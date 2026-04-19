const fs = require('fs');
const path = 'sbe/backend/package.json';
const pkg = JSON.parse(fs.readFileSync(path, 'utf8'));
pkg.scripts.dev = "tsx watch src/index.ts";
fs.writeFileSync(path, JSON.stringify(pkg, null, 2));
