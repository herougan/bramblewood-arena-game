// Copies only what the built game needs into electron/game/ (2026-10-17, roadmap §4). Run: node stage.js
// The repo also holds docs/, tools/, tests/, hub/ and supabase/; none of that ships in the desktop build.
'use strict';
const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..');
const OUT = path.join(__dirname, 'game');
const SHIP = ['index.html', 'version.json', 'robots.txt', 'assets', 'art', 'fonts'];
const SKIP = /(^|[\\/])(\.|_staging|art_staging)|\.(psd|kra|xcf|md)$/i; // dotfiles, staging folders, sources and notes

if(!fs.existsSync(path.join(REPO, 'index.html'))){
  console.error('No index.html in the repo root. Build it first: python3 assemble_arena.py && mv bramblewood-arena.html index.html');
  process.exit(1);
}
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
let files = 0, bytes = 0;
for(const item of SHIP){
  const src = path.join(REPO, item);
  if(!fs.existsSync(src)) continue;
  fs.cpSync(src, path.join(OUT, item), {
    recursive: true,
    filter: s => { const rel = path.relative(REPO, s); if(rel && SKIP.test(rel)) return false;
      const st = fs.statSync(s); if(st.isFile()){ files++; bytes += st.size; } return true; },
  });
}
console.log(`staged ${files} files, ${(bytes / 1048576).toFixed(1)} MB → ${OUT}`);
