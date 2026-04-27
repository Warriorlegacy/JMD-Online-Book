const fs = require('fs');

function replaceRegex(filePath, regex, replacement) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(regex, replacement);
  fs.writeFileSync(filePath, content);
  console.log(`Updated ${filePath}`);
}

replaceRegex('sbe/web/src/app/[locale]/layout.tsx', /<style>\\n\s*@import url\('https:\/\/fonts\.googleapis\.com\/css2\?family=Inter:wght@400;500;600;700&display=swap'\);\n\s*<\/style>/, '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet" />');
