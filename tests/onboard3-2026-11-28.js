#!/usr/bin/env node
// 2026-11-28 (package ONBOARD3): status tips for Wet / Burning / Shocked / Exposed / Fragile, g-hand without dim, the Pitch zone label (12 packs).
'use strict';
const fs = require('fs'); const src = fs.readFileSync(__dirname + '/../arena_app.js', 'utf8');
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
['st-wet','st-burning','st-shocked','st-exposed','st-fragile'].forEach(id=> ok(new RegExp(`STATUS_TIPS|\\{id:'${id}', test:`).test(src) && src.includes(`{id:'${id}', test:`), id + ' row'));
ok(/\{id:'g-hand', stage:1, block:true, noDim:true/.test(src), 'g-hand is noDim');
ok(/tip\.id === 'pl-need'.*ui\.onboard3-pitch/.test(src), 'pl-need labels the drop zone');
['fr','de','es','it','pt','tl','ta','id','zh-Hans','zh-Hant','ja','ko'].forEach(c=>{ const d = JSON.parse(fs.readFileSync(`${__dirname}/../lang/${c}.json`, 'utf8')); ok(d['Pitch'], c + ' has Pitch'); });
console.log(fail ? `${fail} failed` : 'onboard3: all ok'); process.exit(fail ? 1 : 0);
