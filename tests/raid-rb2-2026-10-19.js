#!/usr/bin/env node
// Package RB2 (2026-10-19, raid brambles; owner 16:22 "Raids can have special super-high health brambles. Maybe less than 420.", 16:28
// "let it remain at 350HP. Then now with the mega nerf, make the raid very slightly harder. its playing 3 cards at a time right?"):
// the arms' and the tail's bramble 350 a fight (was 420), the Core's 200 kept; the elders' ceiling 55 (was 50); saved edits at RB's
// numbers brought onto them (scale 3); the editor's new part; the boss's 3 plays a turn; the measured fights and the doc.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const R = require(path.join(ROOT, 'bramblewood-raid.js'));
const B = require(path.join(ROOT, 'tools', 'lib_bramble.js'));
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const goliath = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'raids.json'), 'utf8')).find(r=> r.id === 'goliath');
let pass = 0, fail = 0; const ok = (c, m)=>{ if(c) pass++; else { fail++; console.log('  FAIL ' + m); } };
const part = id=> goliath.parts.find(p=> p.id === id);

// ---- the brambles and the elders
ok(['left', 'right', 'tail'].every(id=> part(id).fight.castleHp === 350), 'the arms and the tail: a 350 bramble a fight (was 420)');
ok(part('core').fight.castleHp === 200, 'the Core keeps its 200 behind its stumps');
ok(goliath.bossHpBonusMax === 55, 'the elders start at up to 55 Health (was 50): the raid a touch harder');
{ const st = R.raidState(goliath, [], 0, {cycle: 0}), f = R.fightFor(goliath, st, 'left', {});
  ok(f.castleHp === 350, `fightFor hands the fight the part's 350 (${f.castleHp})`);
  const A = require(path.join(ROOT, 'tools', 'raid_full_sim.js')).A;
  const b = A.buildRaidFullFight(goliath, 'left', f, st, {rng: A.seededRng(1), rand: A.seededRng(2), allies: [], myDeck: {}, recordEvents: false});
  // 2026-10-21 (BF5): the fight is built at BRAMBLE_SCALE 0.5 (raids.json keeps the full 350 / 55)
  ok(b.players[2].hq.hp === 175 && b.players[2].hq.maxHp === 175, `the boss's bramble in the built fight: ${b.players[2].hq.hp}/${b.players[2].hq.maxHp} (350 halved)`);
  const u = b.overlay[b.bossUnitId]; ok(u && u.health + b.bossHpBonus === 28, `a fresh raid's elder: ${u && u.health} + ${b.bossHpBonus} = 28 (55 halved)`); }

// ---- saved edits: RB's numbers move, an admin's own stay
ok(R.RAID_SCALE_V === 3, 'scale 3');
{ const edit = {id: 'goliath', scaleV: 2, bossHpBonusMax: 50, scoring: {perInFightHp: 1}, parts: [{id: 'left', fight: {castleHp: 420}}, {id: 'tail', fight: {castleHp: 333}}, {id: 'core', fight: {castleHp: 200}}]};
  const m = R.migrateRaidScale(edit, goliath);
  ok(m !== edit && edit.parts[0].fight.castleHp === 420, 'a copy; the saved edit itself untouched');
  ok(m.scaleV === 3 && m.parts[0].fight.castleHp === 350 && m.parts[1].fight.castleHp === 333 && m.parts[2].fight.castleHp === 200 && m.bossHpBonusMax === 55, 'a scale-2 edit: 420 -> 350, 50 -> 55; its own 333 kept');
  const own = R.migrateRaidScale(Object.assign({}, edit, {bossHpBonusMax: 70}), goliath); ok(own.bossHpBonusMax === 70, 'an elders\' ceiling the admin set stays');
  ok(R.migrateRaidScale(m, goliath) === m, 'a scale-3 edit is left alone');
  const pre = R.migrateRaidScale({id: 'goliath', scoring: {perInFightHp: 15}, bossHpBonusMax: 100, parts: [{id: 'left', bars: 3, barHp: 80000, fight: {castleHp: 420}}]}, goliath);
  ok(pre.scaleV === 3 && pre.scoring.perInFightHp === 1 && pre.bossHpBonusMax === 55 && pre.parts[0].fight.castleHp === 350, 'a pre-RB edit takes both steps');
  const mine = R.migrateRaidScale({id: 'x', scaleV: 2, parts: [{id: 'a', fight: {castleHp: 420}}]}, null); ok(mine.scaleV === 3 && mine.parts[0].fight.castleHp === 420, 'a raid with no shipped twin keeps its bramble'); }
ok(/fight:\{castleHp:350, deck:\{\}\}\}\);/.test(src), 'the raid editor\'s new part starts on a 350 bramble');

// ---- the boss plays 3 cards a turn: its front row's as the CPU, then one into its middle row and one into its back row
{ const fn = B.grab('raidBossRowPlays');
  ok(/const RAID_BOSS_PLAY_ROWS = \[1, 2\];/.test(src) && /RAID_BOSS_PLAY_ROWS\.forEach\(row=>/.test(fn) && />= cap\) return;/.test(fn), 'raidBossRowPlays: one card into each back row a turn, unless the row holds rowCap');
  ok(goliath.tuning.rowCap === 2, 'rowCap 2');
  ok(/if\(m\.raidFull\) fightSafe\(\(\)=>\{ const plays = raidBossRowPlays\(m, null\);/.test(src), 'the page calls it right after the boss\'s front-row turn'); }

// ---- the measured fights and the doc
{ const j = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'raid-balance-2026-10-19-fights.json'), 'utf8'));
  ok(Object.keys(j.cells).length === 72 && j.meta.castleHp.left === 350 && j.meta.castleHp.core === 200 && j.meta.bossHpBonusMax === 55, 'the fights JSON is measured on the shipped brambles and elders');
  const doc = fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'raid-balance-2026-10-19.md'), 'utf8');
  ok(/^## RB2/m.test(doc) && /350/.test(doc), 'docs/balance/raid-balance-2026-10-19.md: the RB2 section');
  ok(/^## 2026-10-19 \(package RB2: /m.test(fs.readFileSync(path.join(ROOT, 'docs', 'CHANGELOG.md'), 'utf8')), 'CHANGELOG entry'); }

console.log(`raid-rb2: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
