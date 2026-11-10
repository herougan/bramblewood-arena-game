#!/usr/bin/env node
// 2026-11-10 (package UI45, owner 21:11): Map cards Prospects: Carried = only cards flagged Yes on an earlier main map (+ the tutorial's cards), never topped up;
// every other fitting card is NEW! (target 45, max 60). Browser measure: tests/e2e/ui45_2026_11_10.py.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
let fail = 0, pass = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  x', m); } else pass++; };
const app = rd('arena_app.js'), html = rd('index.html'), gen = rd('tools/ui38/map_prospects_2026_11_09.py');
const fn = name=>{ const i = app.indexOf('function ' + name + '('); if(i < 0) return ''; const j = app.indexOf('\n}\n', i); return app.slice(i, j + 2); };
const D = JSON.parse(rd('docs/design/map-prospects-2026-11-09.json')), R = D.rules;
ok(R.newTarget === 45 && R.newMax === 60 && R.carriedFill === 0, 'data rules: newTarget 45, newMax 60, carriedFill 0');
ok(/NEW_TARGET, CAR_TARGET, FAMILY_CAP, NEW_MIN_SCORE, CAR_MIN_SCORE = 45, 0, 2, 4, 1/.test(gen) && /NEW_MAX = 60/.test(gen), 'the generator constants match the data');
ok(!app.includes('ui37CarriedPool') || /is gone/.test(app), 'the wide Carried pool function is gone');
ok(!/function ui37CarriedPool/.test(app) && !/function ui37CarriedPool/.test(html), 'no ui37CarriedPool in source or build');
const sp = fn('ui37Split'), fill = fn('ui38Fill');
ok(/ui38Fill\(top, defs, ok, idx, neu, car\)/.test(sp) && /return \{n, neu, car, extra: \[\], idx\}/.test(sp), 'ui37Split passes the Yes-only index and returns it for the Map N pills');
ok(!/carFill|carriedFill/.test(fill), 'ui38Fill has no Carried fill');
ok(/newMax = R\.newMax \|\| 60/.test(fill) && /R\.newTarget \|\| 45/.test(fill), 'JS fallbacks 60 / 45');
ok(/\.sort\(\(a, b\)=> idx\.get\(b\) - idx\.get\(a\)\)/.test(fill), "Carried: previous map's Yes cards first");
ok(!/carriedTarget/.test(app), 'no Carried minimum in the window');
ok(html.includes("R.newMax || 60") || html.includes('newMax = R.newMax || 60'), 'index.html rebuilt');
// fill on a small case: a Yes-flagged card leaves NEW!, shows in Carried; an unflagged earlier-map card stays NEW!
{ const blk = app.slice(app.indexOf('// UI38_PROS:START'), app.indexOf('// UI38_PROS:END'));
  const P = {rules: {familyCap: 2, newMinScore: 4, newMax: 9, newTarget: 3}, family: {}, maps: {mx: {fit: [['a', 9, 'b'], ['b', 8, 'b'], ['c', 7, 'b']], concepts: []}}};
  const env = `const mapNumberOf = id=> ({m0: 0, mx: 1})[id]; const mainConquestMaps = ()=> [{id: 'm0'}, {id: 'mx'}]; const mpEntry = id=> ({cards: [], submaps: {}});
    const ui37MapsData = ()=> [{id: 'm0', n: 0, yes: ['b'], no: []}]; const TX = k=> k, escapeAttr = s=> s, cardChipHTML = ()=> '';`;
  const f = new Function(env + blk.replace('__MAP_PROSPECTS__', JSON.stringify(P)) + '; return {ui38Fill};')();
  const defs = {a: {name: 'a'}, b: {name: 'b'}, c: {name: 'c'}}, neu = [], car = [];
  f.ui38Fill('mx', defs, ()=> true, new Map([['b', 0]]), neu, car);
  ok(neu.map(p=> p.id).join() === 'a,c' && car.map(p=> p.id).join() === 'b', 'Yes card b: Carried, not NEW!; the others stay NEW!: ' + neu.map(p=> p.id) + ' | ' + car.map(p=> p.id)); }
console.log(fail ? 'FAIL ' + fail : 'ok', pass + ' checks'); process.exit(fail ? 1 : 0);
