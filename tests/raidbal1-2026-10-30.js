#!/usr/bin/env node
// Package RAIDBAL1 (2026-10-30, owner W8: "Start balancing the raid against 3 decks at roughly the level they unlock the raid, but with
// +2 higher level."): the Goliath's brambles and the raiders' bonus as re-fit, the three reference decks at Map 13 + 2, the measured
// before / after / confirm runs in docs/balance/raidbal1-2026-10-30.json inside the proposed bands (RAIDBAL1-1), and the sim tool
// playing a fight with a named deck (raid_full_sim's myDeckFor through refPartsDeck; it threw before).
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
let pass = 0, fail = 0; const ok = (c, m)=>{ if(c) pass++; else { fail++; console.log('  FAIL ' + m); } };
const g = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/raids.json'), 'utf8')).find(r=> r.id === 'goliath');
const part = id=> g.parts.find(p=> p.id === id);

// 1. the data
ok(part('left').fight.castleHp === 780 && part('right').fight.castleHp === 930 && part('tail').fight.castleHp === 560, '1. warm-up brambles 780 / 930 / 560');
ok(part('core').fight.castleHp === 100, '1. the Core bramble 100');
ok(g.tuning.raiderCastleBonus === 120, '1. raiderCastleBonus 120');
ok(g.tuning.bossAtkPct === 0.2 && g.tuning.bossHpPct === 0.15 && g.bossHpBonusMax === 55 && g.shield === 50, '1. the raid-wide boss strength, elders and Shield unchanged');
ok(part('left').trench.castleHp === 1250 && part('core').trench.castleHp === 300 && part('core').trench.entities.every(e=> e.health === 20), '1. the classic trench numbers untouched');
ok(JSON.stringify(part('core').fight.deck) === JSON.stringify({'goliath-broodmother': 1, 'abyss-lantern-squid': 3, 'vampire-squid': 3, 'kraken-spawnling': 4, 'humpback-elder': 2, 'glass-octopus': 2}), '1. the Core deck unchanged');

// 2. the measured runs
const res = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/balance/raidbal1-2026-10-30.json'), 'utf8'));
const decks = res.decks && res.decks.plus2;
ok(decks && ['map', 'ref2', 'opt'].every(k=> decks[k] && decks[k].copies === 20 && decks[k].plus === 2), '2. three 20-card decks at +2');
ok(decks && decks.map.level === 5 && decks.opt.level === 5 && decks.ref2.level > 5, '2. Map reference and optimizer deck at Lv 5 (Map 13: 3, +2); Reference-2 at its own copies +2');
const mean = (tag, p, st)=>{ const cs = Object.values((res.runs[tag] || {}).cells || {}).filter(c=> c.part === p && c.stage === st); return cs.length === 3 ? cs.reduce((t, c)=> t + c.win, 0) / 3 : NaN; };
['before', 'after', 'confirm'].forEach(t=> ok(res.runs[t] && Object.values(res.runs[t].cells).every(c=> c.n === 40), '2. run ' + t + ' at 40 fights a cell'));
['left', 'right', 'tail'].forEach(p=>{ ok(mean('before', p, 's1') > 0.7, `2. before: ${p} too easy (${mean('before', p, 's1')})`);
  ['after', 'confirm'].forEach(t=>{ const m = mean(t, p, 's1'); ok(m >= 0.52 && m <= 0.68, `2. ${t}: ${p} inside 52-68% (${m})`); }); });
ok(mean('before', 'core', 's1') < 0.2, '2. before: the Core too hard');
['after', 'confirm'].forEach(t=>{ const m = mean(t, 'core', 's1'); ok(m >= 0.32 && m <= 0.48, `2. ${t}: Core inside 32-48% (${m})`); });
ok(res.runs.after.raidSha === res.runs.confirm.raidSha && res.runs.confirm.g0 === 1000, '2. confirm: the same raid on fresh seeds');
{ const S = require(path.join(ROOT, 'tools/raid_full_sim.js')); const crypto = require('crypto');
  ok(res.runs.after.raidSha === crypto.createHash('sha1').update(JSON.stringify(g)).digest('hex').slice(0, 12), '2. the after run measured the shipped raids.json');
  // 3. the tool plays a named deck (one fight)
  S.setDecks(decks); const r = S.playOne(g, 'left', 's1', 'map', 0);
  ok(r && r.level === 5 && r.dealt >= 0 && typeof r.overwhelmed === 'boolean', '3. raid_full_sim plays the Map reference at Lv 5');
  const r2 = S.playOne(g, 'left', 's1', '13', 0); ok(r2 && r2.level === 3, '3. a road deck key still works (Map 13, Lv 3)'); }

// 4. the doc, the decision
ok(fs.existsSync(path.join(ROOT, 'docs/balance/raidbal1-2026-10-30.md')), '4. the report');
const dec = fs.readFileSync(path.join(ROOT, 'docs/decisions.json'), 'utf8'); ok(/"id": "RAIDBAL1-1"/.test(dec), '4. RAIDBAL1-1 asked');
console.log(`raidbal1-2026-10-30: ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
