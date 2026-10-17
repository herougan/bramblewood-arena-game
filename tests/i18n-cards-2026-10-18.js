#!/usr/bin/env node
// 2026-10-18 (audit I2, card-name translations): about 360 player-visible card names were in no language pack, so the page
// translator left them in English. Card names now live in lang/cards/<code>.json, merged into each pack by assemble_arena.py.
//   1. every lang/cards/<code>.json parses, is a flat {"English": "translation"} object of non-empty strings, and has a main pack;
//   2. it has no key that isn't a real card name (canonical/cards.json);
//   3. main pack + card pack cover every player-visible card (test cards excluded, as the Codex hides them);
//   4. the build merges them: assemble_arena.py reads lang/cards, and each built assets/lang/<code>.js carries every visible name
//      with the main pack winning on a clash.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  ✗', m); } };
const readJSON = rel=> JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));

const cards = readJSON('canonical/cards.json');
const allNames = new Set(cards.map(c=> c.name));
const visible = [...new Set(cards.filter(c=> !c.test).map(c=> c.name))].sort();
ok(visible.length > 600, `player-visible card names found (${visible.length})`);
['Fathom Leviathan', 'Grovebearer Dragon-Turtle', 'Ashmantle Fiend', 'MissingNo.'].forEach(n=> ok(visible.includes(n), `${n} is a visible card`));
ok(!visible.some(n=> /^Test: |^Trigger Test: /.test(n)), 'no test card counts as visible');

const dir = path.join(ROOT, 'lang', 'cards');
const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f=> f.endsWith('.json')).sort() : [];
const CODES = ['de', 'es', 'fr', 'id', 'it', 'ja', 'ko', 'pt', 'ta', 'tl', 'zh-Hans', 'zh-Hant'];
ok(CODES.every(c=> files.includes(c + '.json')), `a card pack for each of the 12 languages (${files.join(', ')})`);

const asm = fs.readFileSync(path.join(ROOT, 'assemble_arena.py'), 'utf8');
ok(/lang\/cards\/%s\.json/.test(asm) && /lang\/cards\/\*\.json/.test(asm), 'assemble_arena.py reads lang/cards/<code>.json');

for(const f of files){
  const code = f.slice(0, -5);
  let pack = null;
  try{ pack = readJSON('lang/cards/' + f); }catch(e){ ok(false, `lang/cards/${f} parses (${e.message})`); continue; }
  ok(pack && typeof pack === 'object' && !Array.isArray(pack), `lang/cards/${f} is an object`);
  const bad = Object.entries(pack).filter(([k, v])=> typeof v !== 'string' || !v.trim());
  ok(!bad.length, `lang/cards/${f}: every translation is a non-empty string (${bad.map(b=> b[0]).slice(0, 5).join(', ')})`);
  const stray = Object.keys(pack).filter(k=> !allNames.has(k));
  ok(!stray.length, `lang/cards/${f}: no keys that aren't card names (${stray.slice(0, 5).join(', ')})`);
  const testKeys = Object.keys(pack).filter(k=> allNames.has(k) && !visible.includes(k));
  ok(!testKeys.length, `lang/cards/${f}: no test-card names (${testKeys.slice(0, 5).join(', ')})`);
  ok(fs.existsSync(path.join(ROOT, 'lang', f)), `lang/${f} (the main pack) exists`);
  const main = fs.existsSync(path.join(ROOT, 'lang', f)) ? readJSON('lang/' + f) : {};
  const merged = Object.assign({}, pack, main);
  const missing = visible.filter(n=> !(n in merged));
  ok(!missing.length, `${code}: covers every visible card (${missing.length} missing: ${missing.slice(0, 5).join(', ')})`);
  // the built pack (assets/lang/<code>.js, tracked) is the merge, main pack winning
  const built = path.join(ROOT, 'assets', 'lang', code + '.js');
  if(fs.existsSync(built)){
    const w = {BW_LANG_PACKS: {}};
    new Function('window', fs.readFileSync(built, 'utf8'))(w);
    const b = w.BW_LANG_PACKS[code] || {};
    const notBuilt = visible.filter(n=> !(n in b));
    ok(!notBuilt.length, `${code}: built pack has every visible card name (${notBuilt.length} missing: ${notBuilt.slice(0, 3).join(', ')}) - rebuild?`);
    const clash = Object.keys(pack).filter(k=> k in main && b[k] !== main[k]);
    ok(!clash.length, `${code}: main pack wins on a clash in the built pack (${clash.slice(0, 3).join(', ')})`);
  } else ok(false, `assets/lang/${code}.js exists (run the build)`);
}
// MissingNo. stays as it is everywhere
for(const f of files){ const p = readJSON('lang/cards/' + f); if('MissingNo.' in p) ok(p['MissingNo.'] === 'MissingNo.', `${f}: MissingNo. untranslated`); }

console.log(`i18n cards: ${checks - fail}/${checks} checks passed`);
process.exit(fail ? 1 : 0);
