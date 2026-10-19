#!/usr/bin/env node
// 2026-10-19 (package LV, the level curve; owner 00:19, the overnight plan's last step: "balance level to balance with the overall linear
// increase in difficulty over time"). Checks, against the real game (tools/lib_bramble.js evaluates arena_app.js's own functions):
//   1. the curves: the reference player's level (Lv 0 to Map 10, the Forge opens on Map 11; Lv 3 from 11; a little more from 16) only
//      rises and never passes the Forge's level gates; the enemy's level rises in a straight line of stat gain (1.25% a map from Map 4)
//      and a boss fights a little higher; a fractional level splits a deck's copies over its two stat steps (and keeps every copy);
//   2. the endless floors climb the road's curve (half a map a floor: the enemy level and the Shield), with no compounding stat bonus;
//   3. overrides: few, and none over 2x the rule (a lower Health never under 60% of the bramble's own);
//   4. the bands: the final measure (docs/balance/skirmish-pass-lv-after.jsonl, 120 games on the measure seeds) has every main-map fight
//      green and measured the decks the game has now; the fresh seeds (lv-fresh) mostly green; two fights replayed live give the same;
//   5. absolute difficulty: the fit after (docs/balance/level-curve-fit-after.json) rises along the road;
//   6. the docs and the CHANGELOG.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G;
const readJsonl = f=>{ try{ return fs.readFileSync(path.join(ROOT, 'docs', 'balance', f), 'utf8').split('\n').filter(Boolean).map(l=> JSON.parse(l)); }catch(e){ return []; } };
const mains = G.CONQUEST_MAPS.filter(m=> !m.sub && !m.reserved);
const near = (a, b, e)=> Math.abs(a - b) <= (e || 1e-9);

// ---- 1. the curves
{ let last = -1, mono = true;
  for(let no = 0; no <= 40; no++){ const L = G.referencePlayerLevel(no); if(L < last - 1e-9) mono = false; last = L; }
  ok(mono, '1. your level only rises along the road');
  ok(G.referencePlayerLevel(0) === 0 && G.referencePlayerLevel(10) === 0, '1. Lv 0 (every card at its own starting level) to Map 10: the Forge opens on Map 11');
  ok(G.referencePlayerLevel(11) === 3 && G.referencePlayerLevel(15) === 3, '1. Lv 3 from Map 11 to 15 (the Dust banked by Map 11 pays for it)');
  ok(G.referencePlayerLevel(16) > 3 && G.referencePlayerLevel(16) < 3.5 && near(G.referencePlayerLevel(24), 4.62, 0.01), '1. from Map 16 (the Lv 5+ gate) a little more of the deck at Lv 6 each map: 4.62 at Map 24');
  let gated = true; for(let no = 0; no <= 60; no++){ const L = G.referencePlayerLevel(no), mx = G.levelMix(L), hi = mx.frac ? mx.hi : mx.lo; if(hi >= 5 && no < 16 || hi >= 9 && no < 26 || hi >= 10 && no < 31) gated = false; }
  ok(gated && near(G.referencePlayerLevel(31), 5.88, .01), '1. never past the Forge\'s level gates (Lv 5+ from Map 16, 9 from 26, 10 from 31); about Lv 6 by Map 31'); }
const fightAt = (mapNo, kind)=>{ const m = mains[mapNo]; const n0 = m.nodes.find(x=> x.deck && x.kind !== 'tutorial'); const nn = Object.assign({}, n0, {kind, key: '__t'}); G.NODE_MAP_HINT.set(nn, m.id); return nn; };
{ let last = -1, mono = true, line = true;
  for(let no = 0; no < mains.length; no++){ if(!mains[no].nodes.some(x=> x.deck)) continue; const L = G.roadEnemyLevelExact(fightAt(no, 'skirmish')); if(L < last - 1e-9) mono = false; last = L;
    const g = Math.max(0, no - G.ROAD_LEVEL_CURVE.enemyFrom) * G.ROAD_LEVEL_CURVE.enemyGainPerMap; if(L && !near(G.levelForGain(g), L, 0.01)) line = false; }
  ok(mono, '1. the enemy\'s level only rises along the road');
  ok(line && G.ROAD_LEVEL_CURVE.enemyGainPerMap === 0.0125 && G.ROAD_LEVEL_CURVE.enemyFrom === 4, '1. the enemy\'s stats rise in a straight line: 1.25% a map from Map 4');
  ok(G.roadEnemyLevelExact(fightAt(4, 'skirmish')) === 0 && near(G.roadEnemyLevelExact(fightAt(12, 'skirmish')), 3, .01) && near(G.roadEnemyLevelExact(fightAt(20, 'skirmish')), 6, .01), '1. the enemy: printed to Map 4, Lv 3 (+10%) at Map 12, Lv 6 (+20%) at Map 20');
  ok(G.roadEnemyLevelExact(fightAt(14, 'boss')) > G.roadEnemyLevelExact(fightAt(14, 'skirmish')) && G.roadEnemyLevelExact(fightAt(14, 'elite')) === G.roadEnemyLevelExact(fightAt(14, 'skirmish')), '1. a boss fights two maps further on; an elite on its map\'s line');
  const w = G.CONQUEST_MAPS.find(m=> m.id === 'm11').nodes.find(x=> x.kind === 'worldboss'); G.NODE_MAP_HINT.set(w, 'm11');
  ok(w && G.roadEnemyLevelExact(w) > 6, '1. the Map 20 world boss is levelled like a boss (it fought at its printed level before)');
  ok(near(G.levelForGain(0), 1) && near(G.levelForGain(.1), 3) && near(G.levelForGain(.15), 4.5) && near(G.levelForGain(.2), 6) && near(G.levelForGain(.3), 9), '1. levelForGain: +10% = Lv 3, +15% = Lv 4.5, +20% = Lv 6, +30% = Lv 9');
  const deck = {a: 4, b: 4, c: 3, d: 2, e: 4, f: 3}, mix = G.levelMixDeck(deck, 4.5), tot = mix.reduce((t, p)=> t + p[1], 0), hi = mix.filter(p=> p[2] === 6).reduce((t, p)=> t + p[1], 0);
  ok(tot === 20 && Math.abs(hi - 10) <= 1 && mix.every(p=> p[2] === 3 || p[2] === 6), `1. Lv 4.5 on a 20-card deck: ${hi} copies at Lv 6, the rest at Lv 3, every copy kept`);
  ok(JSON.stringify(G.levelMixDeck(deck, 3)) === JSON.stringify(Object.entries(deck).map(([id, k])=> [id, k, 3])), '1. a whole level is every copy at it'); }

// ---- 2. the endless floors
{ const C = G.ENDLESS_FLOOR_CURVE; ok(C.floorMaps === 0.5 && C.floorPct <= 0.01, '2. a floor is half a map further on; no compounding stat bonus (was +4% a floor)');
  for(const id of ['mm', 'mlb']){ const m = G.CONQUEST_MAPS.find(x=> x.id === id); let lastL = -1, lastS = -1, mono = true;
    m.nodes.filter(x=> x.kind === 'skirmish').forEach(x=>{ G.NODE_MAP_HINT.set(x, id); const L = G.roadEnemyLevelExact(x), S = G.ruleShieldOf(x); if(L < lastL - 1e-9 || S < lastS) mono = false; lastL = L; lastS = S; });
    ok(mono, `2. ${id}: the enemy level and the Shield climb floor by floor`); }
  const k10 = G.CONQUEST_MAPS.find(x=> x.id === 'mm').nodes.find(x=> x.floor === 10); G.NODE_MAP_HINT.set(k10, 'mm');
  ok(G.roadMapOfFight(k10) === 6 + 4.5 && G.ruleShieldOf(k10) === Math.round(10.5 * 2), '2. the Murgle King on floor 10 counts as Map 10.5 (its Shield 21 by rule)');
  ok(/floorPct: \(ctx\.node\.floor - 1\) \* ENDLESS_FLOOR_CURVE\.floorPct/.test(B.src) && /floorPct: \(node\.floor - 1\) \* ENDLESS_FLOOR_CURVE\.floorPct/.test(B.src), '2. the game and the reference fight both use the floor curve'); }

// ---- 3. overrides
{ const MAX_SHIELD = 40, MAX_HEALTH = 20; let nS = 0, nH = 0; const over = [], low = [];
  for(const m of G.CONQUEST_MAPS){ if(m.reserved || m.tower) continue; for(const nd of m.nodes){ if(!nd.deck || nd.kind === 'tutorial') continue; G.NODE_MAP_HINT.set(nd, m.id);
    const sc = G.skirmishCastle(nd), bare = Object.assign({}, nd); delete bare.hqHp; delete bare.shieldOverride; G.NODE_MAP_HINT.set(bare, m.id); const own = G.skirmishCastle(bare);
    if(sc.overridden){ nS++; if(sc.shield > 2 * Math.max(1, own.rule)) over.push(`${nd.key} ${sc.shield} (rule ${own.rule})`); }
    if(sc.hp < own.hp){ nH++; if(!(m.id === 'm1') && sc.hp < Math.round(own.hp * 0.6)) low.push(`${nd.key} ${sc.hp} of ${own.hp}`); } } }
  ok(nS <= MAX_SHIELD, `3. ${nS} fights with a Shield override (was 96; at most ${MAX_SHIELD})`);
  ok(!over.length, '3. no Shield override over 2x the rule: ' + over.join(', '));
  ok(nH <= MAX_HEALTH, `3. ${nH} fights with a lower Health (was 53; at most ${MAX_HEALTH})`);
  ok(!low.length, '3. a lower Health is never under 60% of the bramble\'s own: ' + low.join(', ')); }

// ---- 4. the bands
{ const after = readJsonl('skirmish-pass-lv-after.jsonl'), fresh = readJsonl('skirmish-pass-lv-fresh.jsonl');
  const main = after.filter(r=> !r.side && !r.endless);
  ok(main.length === 179, `4. the final measure has all 179 main-map fights (${main.length})`);
  const off = main.filter(r=> r.green !== 'green');
  ok(!off.length && main.every(r=> r.games >= 120), '4. every main-map fight is green on the measure seeds (120 games): ' + off.map(r=> `${r.code} ${r.win}`).join(', '));
  const now = main.filter(r=>{ const nd = B.byKey(r.map, r.key); return nd && JSON.stringify(nd.deck) === JSON.stringify(r.deck); });
  ok(now.length === main.length, `4. it measured the decks the game has now (${now.length}/${main.length})`);
  const fm = fresh.filter(r=> !r.side && !r.endless), fg = fm.filter(r=> r.green === 'green').length;
  ok(fm.length === 179 && fg >= 150, `4. fresh seeds: ${fg}/${fm.length} green (at least 150)`);
  const sideCurve = after.filter(r=> r.side && r.curve), sg = sideCurve.filter(r=> r.green === 'green').length;
  ok(sideCurve.length >= 70 && sg >= sideCurve.length - 6, `4. side maps on the curve: ${sg}/${sideCurve.length} green`);
  // two fights replayed live: the same result as the file
  for(const code of ['5-3', '17-4']){ const r = main.find(x=> x.code === code); if(!r){ ok(false, '4. no row ' + code); continue; } const nd = B.byKey(r.map, r.key); G.NODE_MAP_HINT.set(nd, r.map);
    const live = G.simulateReferenceFight(r.map, nd, 120, {seed0: 9100}); ok(Math.abs(live.win * 100 - r.win) < 0.05, `4. ${code} replayed: ${(live.win * 100).toFixed(1)}% (file ${r.win}%)`); } }

// ---- 5. absolute difficulty
{ let fit = null; try{ fit = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'level-curve-fit-after.json'), 'utf8')); }catch(e){}
  ok(fit && fit.maps && fit.maps.length === 25, '5. the fit after covers Maps 0-24');
  if(fit){ ok(fit.trend.b > 0.08, `5. the road's map level rises along the road: +${fit.trend.b} DR a map`);
    const late = fit.maps.filter(m=> m.mapNo >= 1); let drops = 0; late.forEach((m, i)=>{ if(i && m.ML < late[i - 1].ML - 0.9) drops++; });
    ok(drops <= 2, `5. from Map 1 the map level never falls by a whole step (0.9 DR) more than twice (${drops})`); } }

// ---- 6. the docs
{ const md = fs.existsSync(path.join(ROOT, 'docs', 'level-curve-2026-10-19.md')) ? fs.readFileSync(path.join(ROOT, 'docs', 'level-curve-2026-10-19.md'), 'utf8') : '';
  ok(md.length > 4000 && /## The curves/.test(md) && /## Absolute difficulty/.test(md) && /## Shield overrides/.test(md) && /## Endless dungeons/.test(md), '6. docs/level-curve-2026-10-19.md has its sections');
  ok(fs.existsSync(path.join(ROOT, 'docs', 'level-curve-2026-10-19.xlsx')), '6. docs/level-curve-2026-10-19.xlsx');
  ok(/package LV/i.test(fs.readFileSync(path.join(ROOT, 'docs', 'CHANGELOG.md'), 'utf8').slice(0, 20000)), '6. a CHANGELOG entry near the top'); }

console.log(`level-curve-2026-10-19: ${n - fail}/${n} checks passed`);
process.exit(fail ? 1 : 0);
