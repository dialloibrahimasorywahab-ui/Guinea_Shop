import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

let errors = 0;
let checked = 0;

function scan(dir) {
  for (const f of fs.readdirSync(dir)) {
    if (f === 'node_modules' || f === '.git') continue;
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      scan(full);
    } else if (f.endsWith('.js')) {
      checked++;
      try {
        execSync(`node --check "${full}"`, { stdio: 'pipe' });
      } catch (e) {
        console.error(`Syntax error in: ${full}`);
        console.error(e.stderr?.toString());
        errors++;
      }
    }
  }
}

scan('.');
console.log(`Checked ${checked} files.`);
if (errors === 0) {
  console.log('✅ All JS files passed syntax check!');
  process.exit(0);
} else {
  console.error(`❌ ${errors} files failed syntax check.`);
  process.exit(1);
}
