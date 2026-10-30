#!/usr/bin/env node
// Package TIP1 (2026-10-30; owner 23:30: "The hover tooltip for the fast forward button is too long ... simplicity is key. if we only
// imagine users will read <20 words"). Checks: the speed button's tooltip is exactly the owner's line and nothing else; no tooltip-style
// TX value (key ending -tip / -hint / -title, and every key TIP1 shortened) runs over 20 words; every shortened text has a row in all
// 12 language packs with the same {placeholders}; the before -> after list exists.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = rel=> fs.readFileSync(path.join(ROOT, rel), 'utf8');
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  ✗', m); } };
const txtSrc = rd('bramblewood-texts.js'), app = rd('arena_app.js');
const TX = {}; { const re = /^\s*"([^"]+)":\s*("(?:[^"\\]|\\.)*"),?\s*$/gm; let m; while((m = re.exec(txtSrc))) TX[m[1]] = JSON.parse(m[2]); }
const words = s=> String(s).trim().split(/\s+/).length;
const CODES = ['de', 'es', 'fr', 'id', 'it', 'ja', 'ko', 'pt', 'ta', 'tl', 'zh-Hans', 'zh-Hant'];
const phs = s=> (String(s).match(/\{\w+\}/g) || []).filter(x=> x !== '{s}').sort().join(',');

// the speed button
const SPEED = 'Changes the speed of the animation. Shift+Click to go back.';
ok(TX['ui.tip1-speed'] === SPEED, 'ui.tip1-speed is exactly the owner\'s line');
{ const a = app.indexOf('function ffBtnTitle('), b = app.indexOf('\n//', a); const body = app.slice(a, b);
  ok(/return TX\('ui\.tip1-speed'\)/.test(body) && !/Playback speed|Click: faster|carries over/.test(body), 'ffBtnTitle returns only ui.tip1-speed'); }
ok(/ffBtn\.title = steps\.length > 1 \? ffBtnTitle\(m\.speedMult\)/.test(app) && /ffBtn\.title = ffBtnTitle\(m\.speedMult\)/.test(app), 'the speed button still sets its title on build and on each step');

// the shortened tooltips (key list from docs/tooltips-tip1-2026-10-30.md) and every tooltip-style key stay under 20 words
const doc = rd('docs/tooltips-tip1-2026-10-30.md');
const touched = [...doc.matchAll(/^\| `((?:ui|results)\.[\w.-]+)`/gm)].map(m=> m[1]);
ok(touched.length >= 35, `the TIP1 list names the shortened TX keys (${touched.length})`);
const tipKeys = Object.keys(TX).filter(k=> /-(tip|hint|title)$/.test(k) || touched.includes(k));
const long = tipKeys.filter(k=> words(TX[k]) > 20);
ok(!long.length, `no tooltip TX value over 20 words (${long.map(k=> k + ' ' + words(TX[k])).join(', ')})`);
const longTouched = touched.filter(k=> TX[k] && words(TX[k]) > 17);
ok(!longTouched.length, `the keys TIP1 shortened are all 17 words or fewer (${longTouched.join(', ')})`);

// translations: every shortened text has a row in each pack, with the same placeholders
for(const c of CODES){
  let pack = {}; try{ pack = JSON.parse(rd('lang/' + c + '.json')); }catch(e){ ok(false, `lang/${c}.json parses`); continue; }
  const missing = [...touched, 'ui.tip1-speed'].filter(k=> TX[k] && !(typeof pack[TX[k]] === 'string' && pack[TX[k]].trim() && phs(pack[TX[k]]) === phs(TX[k])));
  ok(!missing.length, `lang/${c}.json: a translation for each shortened tooltip with the same placeholders (${missing.slice(0, 4).join(', ')})`);
}
ok(/Changes the speed of the animation/.test(doc), 'the before -> after list exists');

console.log(fail ? `tip1: ${fail} of ${checks} checks FAILED` : `tip1: all ${checks} checks passed`);
process.exit(fail ? 1 : 0);
