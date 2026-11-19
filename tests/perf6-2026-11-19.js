#!/usr/bin/env node
// Package PERF6 (2026-11-19, REL1 audit P2 "page weight 18.4 MB"): first-load guardrails. Static plus the built page (no browser; run-all.sh runs this).
// Measuring: python3 tests/e2e/boot_perf.py [--mobile --cpu 4 --net fast4g] [--root A --root B to compare two builds].
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), crypto = require('crypto');
const ROOT = path.join(__dirname, '..');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  x', m); } };
const rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
const app = rd('arena_app.js'), tpl = rd('arena_template.html'), asm = rd('assemble_arena.py');
// 1. the simulator worker's engine text is cut from the engine block, not a second copy of the engine in the page
ok(/<script id="bwEngineBlock">/.test(tpl) && !/__ENGINE_SRC_STRING__/.test(tpl) && !/__ENGINE_SRC_STRING__/.test(asm), '1. no second engine string in the template or the assembler');
ok(/engine_src \+ "\\n\/\*BW_ENGINE_END\*\/\\n" \+ ghosts_src/.test(asm), '1. the assembler puts the end marker after the engine part');
const builtP = path.join(ROOT, 'index.html');
if(fs.existsSync(builtP)){
  const built = fs.readFileSync(builtP, 'utf8');
  ok(!/window\.__BRAMBLEWOOD_ENGINE_SRC__ = "/.test(built), '1. the built page has no engine string literal');
  ok(built.split('/*BW_ENGINE_END*/').length === 3 || built.split('/*BW_ENGINE_END*/').length === 2, '1. the marker is in the built page (once in the block, once in the getter)');
  const a = built.indexOf('<script id="bwEngineBlock">'), b = built.indexOf('</script>', a);
  const block = built.slice(a + '<script id="bwEngineBlock">'.length, b);
  const g0 = built.indexOf("Object.defineProperty(window, '__BRAMBLEWOOD_ENGINE_SRC__'"), g1 = built.indexOf('</script>', g0);
  const win = {}; const doc = {getElementById: id=> id === 'bwEngineBlock' ? {textContent: block} : null};
  vm.runInNewContext(built.slice(g0, g1), {window: win, document: doc});
  const src = win.__BRAMBLEWOOD_ENGINE_SRC__;
  ok(typeof src === 'string' && src.length > 500000 && src.length < block.length && block.startsWith(src), '1. the getter returns the engine part: the head of the block, ' + (src && src.length));
  let compiles = true; try{ new vm.Script(src + '\n;'); }catch(e){ compiles = false; }
  ok(compiles, '1. the engine text compiles on its own');
}
// 2. the art warm-up: held cards first, the rest later and only on a connection that can afford it
{ const i = app.indexOf('function warmCardArt('), f = app.slice(i, app.indexOf('try{ if(typeof window', i));
  ok(/ownedCount\(id\) > 0 \|\| !!\(myDeckCounts && myDeckCounts\[id\]\)/.test(f) && /setTimeout\(\(\)=>\{ if\(artWarmAffordsAll\(\)\) run\(rest, true\); \}, 8000\)/.test(f), '2. warmCardArt: held cards first, the rest 8 s later if affordable');
  const j = app.indexOf('function artWarmAffordsAll('), g = app.slice(j, app.indexOf('function warmCardArt('));
  ok(/saveData/.test(g) && /cellular/.test(g) && /2g\|3g/.test(g) && /pointer: coarse/.test(g), '2. artWarmAffordsAll reads data-saver, cellular, 2g / 3g, and a touch device without the API');
  ok(/document\.hidden/.test(f), '2. no warm-up while the tab is hidden'); }
// 3. the loader reads --map-art from the style rule's property, not the cssText of every rule
ok(/r\.style && r\.type === 1\)\{ const pv = r\.style\.getPropertyValue\('--map-art'\)/.test(app), '3. the loader asks a style rule for its --map-art');
// 4. the card-data hash: same digest as Node's, any length
{ const I = require(path.join(ROOT, 'bramblewood-integrity.js'));
  let same = true; for(const k of [0, 1, 7, 8, 9, 55, 56, 64, 1000]){ const s = 'e\u00e9\ud83e\udda6x'.repeat(k); if(I.sha256(s) !== crypto.createHash('sha256').update(s, 'utf8').digest('hex')) same = false; }
  ok(same, '4. sha256 matches Node at the padding edges and with non-ASCII text'); }
// 5. fonts and art (not hashed in their names) are cached for a week, not revalidated on every visit
{ const v = JSON.parse(rd('vercel.json')); const h = v.headers.find(x=> x.source === '/(fonts|art)/(.*)');
  ok(h && /max-age=604800/.test(h.headers[0].value), '5. vercel.json caches /fonts and /art for 7 days'); }
// 6. the probe ships
ok(fs.existsSync(path.join(ROOT, 'tests/e2e/boot_perf.py')), '6. tests/e2e/boot_perf.py exists');
console.log(`perf6-2026-11-19: ${n - fail}/${n} checks passed`); process.exit(fail ? 1 : 0);
