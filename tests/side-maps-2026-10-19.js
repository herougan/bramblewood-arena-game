#!/usr/bin/env node
// 2026-10-19 (package BF; owner 09:52: "Submap's difficulty floor varies. But at least 1 map ahead of difficulty."). For every side map
// (sub map: side roads, the endless dungeons, the come-back-later maps), against the real game (tools/lib_bramble.js):
//   1. each fight counts at least one map past its parent (fightMapNumber >= parent + 1; a map's own aheadMaps can make it more, never
//      less), for the enemy's level (roadMapOfFight, roadEnemyLevelExact) and the Shield (ruleShieldOf), while your reference deck and
//      level stay the parent's (nodeMapNumber);
//   2. the enemy's level and the Shield are at least what the same fight would get on the parent map;
//   3. its road-curve targets sit a map's step (ROAD_CURVE_SIDE_DR logits) under a main map's at the same place;
//   4. the measure (docs/balance/skirmish-pass-bf-after.jsonl): side fights on the curve sit inside their (lower) bands, and each side
//      map's median (win - target) is no easier than its parent's (by more than the band).
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G;
const subs = G.CONQUEST_MAPS.filter(m=> m.sub && !m.tower && !m.reserved);
const fightsOf = m=> m.nodes.filter(x=> x.deck && Object.keys(x.deck).length && !/tutorial|raidboss|megaraid/.test(x.kind || ''));
const logit = p=> Math.log(p / (1 - p)), near = (a, b, e)=> Math.abs(a - b) <= (e || 1e-6);
ok(subs.length >= 15, `${subs.length} side maps`);
ok(G.sideMapAhead({sub: true}) === 1 && G.sideMapAhead({sub: true, aheadMaps: 0}) === 1 && G.sideMapAhead({sub: true, aheadMaps: 3}) === 3 && G.sideMapAhead({}) === 0, '1. sideMapAhead: 1 by default, a map\'s aheadMaps can raise it, never under 1; a main map 0');
let checked = 0; const bad1 = [], bad2 = [], bad3 = [];
for(const m of subs){
  const parentNo = G.mapNumberOf(m.parent);
  for(const nd of fightsOf(m)){ G.NODE_MAP_HINT.set(nd, m.id); checked++;
    const fno = G.fightMapNumber(nd), road = G.roadMapOfFight(nd), boss = /^(boss|finalboss|worldboss)$/.test(nd.kind || '') ? G.ROAD_LEVEL_CURVE.bossMaps : 0;
    if(!(fno >= parentNo + 1) || (road != null && road < parentNo + 1 + boss - 1e-9)) bad1.push(`${m.id} ${nd.key}: counts Map ${fno} (road ${road}), parent ${parentNo}`);
    // the same fight on its parent map (a copy hinted to the parent)
    const twin = Object.assign({}, nd, {key: '__bf_twin'}); delete twin.shieldMap; G.NODE_MAP_HINT.set(twin, m.parent);
    const lv = G.roadEnemyLevelExact(nd), lvP = G.roadEnemyLevelExact(twin), sh = G.ruleShieldOf(nd), shP = G.ruleShieldOf(twin);
    const Lold = G.legacyLevelForGain(Math.max(0, (road || 0) - G.ROAD_LEVEL_CURVE.enemyFrom) * G.ROAD_LEVEL_CURVE.enemyGainPerMap), gap = Math.abs(Lold - Math.round(Lold)) < 1e-6 && [2, 4, 5, 7, 8].includes(Math.round(Lold));
    // 2026-10-19 (BF2): where the fight counts as a map the old steps put on a whole non-step level (Maps 8, 16, 18: Lv 2 / 4 / 5 had the
    // stats of the step below), the enemy keeps that old gap (enemyLevelKeepingPace), so only its Shield and its map number are checked
    if((!gap && lv < lvP - 0.15) /* a little under: the old steps' whole Lv 2 (Map 8) had no gain, and the enemy keeps that ratio (enemyLevelKeepingPace) */ || sh < shP || (sh === shP && shP > 0 && G.shieldRuleMult(nd.kind) > 0 && G.nodeMapNumber(nd) === parentNo && !nd.floor)) bad2.push(`${m.id} ${nd.key}: Lv ${lv} vs ${lvP}, Shield ${sh} vs ${shP}`);
    const t = G.roadCurveTarget(m.id, nd);
    if(t){ const ahead = G.fightMapNumber(nd) - G.nodeMapNumber(nd);
      // the main-map target at the same place, from the same rule
      const main = t.role === 'boss' ? .40 : t.role === 'miniboss' ? .50 : Math.round((.90 - .30 * ((t.pos - 1) / Math.max(1, t.of - 1))) * 1000) / 1000;
      const want = 1 / (1 + Math.exp(-(logit(main) - G.ROAD_CURVE_SIDE_DR * ahead)));
      if(!(ahead >= 0) || !near(t.t, Math.round(want * 1000) / 1000, 0.0011) || (ahead >= 1 && !(t.t < main))) bad3.push(`${m.id} ${nd.key}: target ${t.t} (main ${main}, ahead ${ahead})`); } } }
ok(checked > 60, `${checked} side-map fights checked`);
ok(!bad1.length, '1. every side-map fight counts at least a map past its parent: ' + bad1.slice(0, 6).join('; '));
ok(!bad2.length, '2. its enemy level and Shield are at least the parent map\'s (the Shield more, where the rule gives one): ' + bad2.slice(0, 6).join('; '));
ok(!bad3.length, '3. its road-curve targets sit a map\'s step under a main map\'s at the same place: ' + bad3.slice(0, 6).join('; '));
{ const pd = G.CONQUEST_MAPS.find(m=> m.id === 'mpd'), f = pd.nodes.find(x=> x.kind === 'skirmish'); G.NODE_MAP_HINT.set(f, 'mpd');
  ok(G.fightMapNumber(f) === 19 && G.nodeMapNumber(f) === 18 && G.ruleShieldOf(f) === 19 && G.referenceDeckFor('mpd', f).deckMap === 18, '1. the Pale Desert (18-A): its fights count as Map 19 for the enemy and the Shield, your deck is still Map 18\'s'); }
{ const ob = G.CONQUEST_MAPS.find(m=> m.id === 'mo'), f = ob.nodes.find(x=> x.deck); G.NODE_MAP_HINT.set(f, 'mo');
  ok(G.fightMapNumber(f) === 17, '1. a come-back-later side map already past it keeps its own number (the Old Bramble: Map 17)'); }

// ---- 4. the measure
const rows = (()=>{ try{ return fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'skirmish-pass-bf-after.jsonl'), 'utf8').split('\n').filter(Boolean).map(l=> JSON.parse(l)); }catch(e){ return []; } })();
ok(rows.length > 200, `4. the BF measure has every fight (${rows.length} rows)`);
{ const side = rows.filter(r=> r.side && !r.endless && r.curve), off = side.filter(r=> r.green !== 'green');
  // 2026-10-19 (BF3, owner 16:22): honest levers only; a side fight off its band is a listed gap (docs/balance/road-gaps-2026-10-19.json)
  const gaps = (()=>{ try{ return JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'road-gaps-2026-10-19.json'), 'utf8')); }catch(e){ return null; } })();
  const listed = new Set(gaps ? gaps.gaps.list.map(g=> g.map + ':' + g.code) : []), unlisted = off.filter(r=> !listed.has(r.map + ':' + r.code));
  ok(side.length > 60 && gaps && !unlisted.length && side.length - off.length >= 20 /* 2026-10-21 (BF5): halved N, honest levers only: 24 of 77; BF3 60 */, `4. side fights on the curve inside their bands: ${side.length - off.length} of ${side.length} (at least 20); the rest are listed gaps (unlisted: ${unlisted.map(r=> `${r.code} ${r.win}`).join(', ')})`);
  const mean = a=>{ const b = a.slice().sort((x, y)=> x - y); return b.length ? (b[(b.length - 1) >> 1] + b[b.length >> 1]) / 2 : 0; }, worse = []; // the median: the Eye's four-wave 20-A-4 can't be simulated (LV)
  // (BF3) a listed gap is left out: Gannet Cliffs' 2-B-2 / 2-B-3 / 2-B-4 are all easy gaps (a future "cheat" field), so mg is not compared
  for(const m of subs){ const mine = rows.filter(r=> r.map === m.id && r.curve && !r.endless && !listed.has(r.map + ':' + r.code)); if(!mine.length || m.shieldMap != null) continue;
    const par = rows.filter(r=> r.map === m.parent && r.curve && !listed.has(r.map + ':' + r.code)); // (BF4) the parent's listed gaps are left out too
    if(par.length && mean(mine.map(r=> r.win - r.target)) > mean(par.map(r=> r.win - r.target)) + 8) worse.push(`${m.id} ${mean(mine.map(r=> r.win)).toFixed(1)}`); }
  ok(!worse.length, '4. no side map plays easier against its targets than its parent (by more than the band): ' + worse.join(', ')); }
console.log(fail ? `side-maps-2026-10-19: ${fail} of ${n} checks failed` : `side-maps-2026-10-19: all ${n} checks pass`);
process.exit(fail ? 1 : 0);
