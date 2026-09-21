const fs = require('fs');

function replaceFile(file, replacer) {
  let content = fs.readFileSync(file, 'utf8');
  content = replacer(content);
  fs.writeFileSync(file, content);
}

replaceFile('.github/workflows/deploy.yml', c => c.replace(/working-directory: sbe\/backend/g, 'working-directory: ./sbe/backend').replace(/working-directory: sbe\/web/g, 'working-directory: ./sbe/web'));
replaceFile('.github/workflows/deploy-jmd-online-book.yml', c => c.replace(/working-directory: sbe\/web/g, 'working-directory: ./sbe/web'));
