const fs = require('fs');
const content = fs.readFileSync('sbe/web/src/services/settlement.ts', 'utf8');
console.log(content.includes('Array.from(affectedUsers)'));
