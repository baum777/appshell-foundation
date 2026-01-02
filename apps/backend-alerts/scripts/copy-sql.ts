import fs from 'fs';
import path from 'path';

const src = path.join(__dirname, '../src/db/sql');
const dest = path.join(__dirname, '../dist/db/sql');

if (!fs.existsSync(dest)) {
  fs.mkdirSync(dest, { recursive: true });
}

fs.readdirSync(src).forEach(file => {
  if (file.endsWith('.sql')) {
    fs.copyFileSync(path.join(src, file), path.join(dest, file));
  }
});
console.log('SQL files copied to dist');

