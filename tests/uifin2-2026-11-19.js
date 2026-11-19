#!/usr/bin/env node
// Package UIFIN2 (2026-11-19): pack opener count reads "2 more in this set, 2 after"; the gated-skills set is warmed at idle (same function and memo, so same results). Static.
'use strict';
const fs = require('fs'), path = require('path');
const R = f=> fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  x', m); } };
const app = R('arena_app.js');
ok(/opts\.moreAfter > 0 && opened\.length - packIdx - 1 > 0 \? escapeHtml\(TX\('ui\.uifin2-pile-split'/.test(app), '1. the pile line splits this set / later sets');
ok(R('bramblewood-texts.js').includes('"ui.uifin2-pile-split"'), '1. English row');
for(const l of ['fr','de','es','it','pt','tl','ta','id','zh-Hans','zh-Hant','ja','ko']){
  const p = JSON.parse(R('lang/' + l + '.json'));
  ok(Object.values(p).some(v=> typeof v === 'string' && v.includes('{a}') && v.includes('{b}') && v.length < 60), '1. ' + l + ' has the {a}/{b} row');
}
ok(/function ui27UngatedSkills\(\)\{\n  let sig = ''/.test(app) && /ui27UngateMemo = \{sig, set: out\}; return out; \}/.test(app), '2. ui27UngatedSkills body unchanged (memoised by card-set signature)');
ok(/addEventListener\('load', \(\)=> setTimeout\(\(\)=> \(window\.requestIdleCallback \|\| setTimeout\)\(\(\)=>\{ try\{ ui27UngatedSkills\(\); \}catch\(e\)\{\} \}\), 1500\)\)/.test(app), '2. the set is warmed at idle after load');
console.log(fail ? 'FAIL ' + fail + '/' + n : 'ok ' + n + ' checks'); process.exit(fail ? 1 : 0);
