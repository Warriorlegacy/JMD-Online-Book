const fs = require('fs');

function removeLine(filePath, matchText) {
  let content = fs.readFileSync(filePath, 'utf8');
  let lines = content.split('\n');
  lines = lines.filter(l => !l.includes(matchText));
  fs.writeFileSync(filePath, lines.join('\n'));
  console.log(`Updated ${filePath}`);
}

function replaceText(filePath, oldText, newText) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(oldText, newText);
  fs.writeFileSync(filePath, content);
  console.log(`Updated ${filePath}`);
}

replaceText('sbe/web/src/app/api/admin/announcements/route.ts', 'import { eq } from "drizzle-orm";', '');
replaceText('sbe/web/src/app/[locale]/wallet/page.tsx', 'import { HomeIcon, User, Globe } from "lucide-react";', 'import { HomeIcon, User, Globe } from "lucide-react"; // eslint-disable-line @typescript-eslint/no-unused-vars');
replaceText('sbe/web/src/app/[locale]/virtuals/page.tsx', 'const _user = null;', '// const _user = null;');
replaceText('sbe/web/src/app/[locale]/sports/page.tsx', 'const _orderbooks', '// const _orderbooks');
replaceText('sbe/web/src/app/[locale]/match/[id]/page.tsx', 'const drawOdds', '// const drawOdds');
replaceText('sbe/web/scratch/autonomous_debug.ts', 'catch(e)', 'catch(_e)');
