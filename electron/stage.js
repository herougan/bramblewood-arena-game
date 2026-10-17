// Copies only what the built game needs into electron/game/ (2026-10-17, roadmap §4). Run: node stage.js
// The repo also holds docs/, tools/, tests/, hub/ and supabase/; none of that ships in the desktop build.
'use strict';
const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..');
const OUT = path.join(__dirname, 'game');
const SHIP = ['index.html', 'version.json', 'robots.txt', 'assets', 'art', 'fonts', 'licenses']; // licenses/ since 2026-10-18: the OFL and CC-BY texts must travel with the fonts and emoji
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
// Desktop-only script fonts (2026-10-18, roadmap P6): electron/fonts/*.css|woff2 → game/fonts/script/. The website never
// gets these (it loads CJK/Tamil from Google Fonts), so they live under electron/ rather than the repo's fonts/.
const FONT_SRC = path.join(__dirname, 'fonts'), FONT_OUT = path.join(OUT, 'fonts', 'script');
fs.mkdirSync(FONT_OUT, { recursive: true });
for(const f of fs.readdirSync(FONT_SRC)){
  if(!/\.(css|woff2)$/.test(f)) continue;
  fs.copyFileSync(path.join(FONT_SRC, f), path.join(FONT_OUT, f));
  files++; bytes += fs.statSync(path.join(FONT_SRC, f)).size;
}
// The fonts are subset to the characters in lang/*.json. Warn when a pack has gained characters since the last build
// (manifest.json records each pack's characters at build time).
try{
  const built = JSON.parse(fs.readFileSync(path.join(FONT_SRC, 'manifest.json'), 'utf8')).langs || {};
  for(const code of Object.keys(built)){
    const have = new Set(built[code]);
    const text = fs.readFileSync(path.join(REPO, 'lang', code + '.json'), 'utf8');
    const miss = new Set();
    for(const ch of text){
      const cp = ch.codePointAt(0);
      const script = (cp >= 0x0B80 && cp <= 0x0BFF) || (cp >= 0x2E80 && cp <= 0x9FFF) || (cp >= 0xAC00 && cp <= 0xD7AF) || (cp >= 0xF900 && cp <= 0xFAFF);
      if(script && !have.has(ch)) miss.add(ch);
    }
    if(miss.size) console.warn(`[fonts] ${code}: ${miss.size} character(s) not in the bundled font (${[...miss].slice(0, 20).join('')}…); they use the system font. Re-run electron/fonts/build_fonts.py.`);
  }
}catch(e){ console.warn('[fonts] coverage check skipped:', e.message); }
console.log(`staged ${files} files, ${(bytes / 1048576).toFixed(1)} MB → ${OUT}`);
