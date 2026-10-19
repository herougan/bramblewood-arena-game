#!/usr/bin/env node
// Package SK2 (2026-10-19, owner 21:36): economy and structure skills. Engine scenarios for each skill, the structure category, the
// parameters (opts.sk2), and the app / text / skill-cost wiring:
//   Harvest (odds over seeds, the no-opposing case), Scavenge N, M (diagonals, the conversion), Repair N (targeting, half on the bramble),
//   Foraging N, Milling N, Pickpocket N (tokens, the bramble), Sabotage N (rank order), Arson N, Fortification (a Palisade structure).
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js'), E = H.Engine;
const ROOT = path.join(__dirname, '..'), R = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:0, health:500, wait:0, cost:0, archetypes:['Sk2'], effects: effects || {}}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'k2-wall':    U('k2-wall'),
  'k2-hit3':    U('k2-hit3', {}, {attack:3}),
  'k2-frail':   U('k2-frail', {}, {health:2}),
  'k2-harvest': U('k2-harvest', {harvest:true}, {attack:3}),
  'k2-harvest2': U('k2-harvest2', {harvest:2}, {attack:3}),
  'k2-scav':    U('k2-scav', {scavenge:1}),
  'k2-scav2':   U('k2-scav2', {scavenge:1, scavengeEvery:2}),
  'k2-salv':    U('k2-salv', {salvage:1}),
  'k2-repair':  U('k2-repair', {repair:2}),
  'k2-repair5': U('k2-repair5', {repair:5}),
  'k2-struct':  U('k2-struct', {}, {health:20, archetypes:['Structure']}),
  'k2-structCT': U('k2-structCT', {}, {health:20, archetypes:[], cardType:'structure'}),
  'k2-structRep': U('k2-structRep', {repair:2}, {health:20, archetypes:['Structure']}),
  'k2-forage':  U('k2-forage', {foraging:true}),
  'k2-mill':    U('k2-mill', {milling:2}, {attack:3, wait:2}),
  'k2-thief':   U('k2-thief', {pickpocket:2}, {attack:1}),
  'k2-sab':     U('k2-sab', {sabotage:3}, {attack:1}),
  'k2-arson':   U('k2-arson', {arson:2}, {attack:1}),
  'k2-fort':    U('k2-fort', {fortification:true}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(seed, sk2){ const e = E.makeSimEngine(defs, E.mulberry32(seed||7), {recordEvents:true, battleMode:'open', sk2: sk2 || undefined}); return {e, P:{1:e.newPlayer(1, {}), 2:e.newPlayer(2, {})}}; }
// Set up on an exact slot, quietly (no on-play effects) and already settled there.
function put(e, P, pid, id, slot){ const pl = P[pid]; const c = e.makeBoardCard(id); c.slot = slot; c._seenAt = slot;
  const cs = all(pl).concat(c); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncSlots(pl); return c; }
const round = (e, P)=>{ const ev = []; e.resolveCombat(P, so, {}, ev, 1); return ev; };
const sk2Ev = (ev, kind)=> ev.filter(x=> x.type === 'sk2' && x.kind === kind);

// ---- 1. Harvest: 1 in 2 a swing harvests instead (seeded); nothing opposite: always harvests, the bramble untouched
{ let harvested = 0, hits = 0, bad = 0; const N = 400;
  for(let s = 1; s <= N; s++){ const {e, P} = mk(s); const h = put(e, P, 1, 'k2-harvest', 0), w = put(e, P, 2, 'k2-wall', 0); const ev = []; e.debugAttack(P, so, h.uid, {}, ev);
    const hv = sk2Ev(ev, 'harvest').length; if(hv){ harvested++; if(P[1].lumber !== 1 || w.hp !== 500) bad++; } else { hits++; if(P[1].lumber !== 0 || w.hp !== 497) bad++; } }
  ok(harvested > N * 0.4 && harvested < N * 0.6, `Harvest: about 1 in 2 swings harvest (${harvested}/${N})`);
  ok(!bad, `a harvest pays 1 Lumber and doesn't swing; a swing hits for 3 and pays nothing (${bad} bad)`); }
{ const res = s=>{ const {e, P} = mk(s); const h = put(e, P, 1, 'k2-harvest', 0); put(e, P, 2, 'k2-wall', 0); const ev = []; e.debugAttack(P, so, h.uid, {}, ev); return sk2Ev(ev, 'harvest').length; };
  ok([3, 5, 8, 13].every(s=> res(s) === res(s)), 'Harvest is seeded: the same seed, the same outcome'); }
{ let always = 0; for(let s = 1; s <= 60; s++){ const {e, P} = mk(s); const h = put(e, P, 1, 'k2-harvest', 0); put(e, P, 2, 'k2-wall', 2); const hq0 = P[2].hq.hp; const ev = []; e.debugAttack(P, so, h.uid, {}, ev);
    const hv = sk2Ev(ev, 'harvest'); if(hv.length === 1 && hv[0].forced && P[1].lumber === 1 && P[2].hq.hp === hq0 && !ev.some(x=> x.type === 'hitHQ')) always++; }
  ok(always === 60, `nothing opposite: it always harvests instead of hitting the bramble (${always}/60)`); }
{ const {e, P} = mk(1, {harvestChance:0}); const h = put(e, P, 1, 'k2-harvest', 0), w = put(e, P, 2, 'k2-wall', 0); e.debugAttack(P, so, h.uid, {}, []);
  ok(w.hp === 497 && P[1].lumber === 0, 'opts.sk2.harvestChance 0: an opposed Harvest unit always swings'); }
{ const {e, P} = mk(1, {harvestLumber:3}); const h = put(e, P, 1, 'k2-harvest', 0); e.debugAttack(P, so, h.uid, {}, []); ok(P[1].lumber === 3, `opts.sk2.harvestLumber 3: a harvest pays 3 (${P[1].lumber})`); }
{ const {e, P} = mk(1); const h = put(e, P, 1, 'k2-harvest2', 0); e.debugAttack(P, so, h.uid, {}, []); ok(P[1].lumber === 2, 'Harvest 2: a harvest pays 2'); }

// ---- 2. Scavenge N, M: deaths within 1 (diagonals, the row across), points, every M -> 1 Lumber
{ const {e, P} = mk(); const S = put(e, P, 1, 'k2-scav', 0);
  const diag = put(e, P, 2, 'k2-wall', 1), side = put(e, P, 1, 'k2-wall', -1), far = put(e, P, 2, 'k2-wall', 2), farAlly = put(e, P, 1, 'k2-wall', 2), front = put(e, P, 2, 'k2-wall', 0);
  const ev = []; e.debugDamage(P, so, far.uid, 9999, {}, ev); e.debugDamage(P, so, farAlly.uid, 9999, {}, ev);
  ok((S.sk2Scavenge||0) === 0, `deaths 2 columns away don't count (${S.sk2Scavenge||0})`);
  e.debugDamage(P, so, diag.uid, 9999, {}, ev); ok(S.sk2Scavenge === 1, `a death across the board, diagonally, gives 1 point (${S.sk2Scavenge})`);
  e.debugDamage(P, so, side.uid, 9999, {}, ev); ok(S.sk2Scavenge === 2 && P[1].lumber === 0, `an ally beside it: 2 points, no Lumber yet (${S.sk2Scavenge}, ${P[1].lumber})`);
  e.debugDamage(P, so, front.uid, 9999, {}, ev); ok(S.sk2Scavenge === 0 && P[1].lumber === 1, `the 3rd point becomes 1 Lumber (${S.sk2Scavenge} points, ${P[1].lumber} Lumber)`);
  const fx = ev.filter(x=> x.type === 'statusFx' && x.kind === 'sk2Scavenge'); ok(fx.length === 3 && fx[2].total === 0 && fx[2].lumber === 1 && fx[0].total === 1, 'a statusFx per point gain, with the total (the chip) and the Lumber'); }
{ const {e, P} = mk(); const S = put(e, P, 1, 'k2-scav2', 0); const a = put(e, P, 2, 'k2-wall', 0), b = put(e, P, 2, 'k2-wall', -1);
  e.debugDamage(P, so, a.uid, 9999, {}, []); e.debugDamage(P, so, b.uid, 9999, {}, []); ok(P[1].lumber === 1 && S.sk2Scavenge === 0, 'Scavenge 1, every 2: two deaths make 1 Lumber'); }
{ const {e, P} = mk(1, {scavengeN:2, scavengeEvery:2}); const S = put(e, P, 1, 'k2-scav', 0); S.sk2Scavenge = 0; const d = defs['k2-scav']; d.effects.scavenge = true;
  const a = put(e, P, 2, 'k2-wall', 0); e.debugDamage(P, so, a.uid, 9999, {}, []); ok(P[1].lumber === 1, 'opts.sk2 scavengeN 2 / scavengeEvery 2: Scavenge (no number) uses the parameters'); d.effects.scavenge = 1; }
{ const {e, P} = mk(); const S = put(e, P, 1, 'k2-scav', 0); e.debugDamage(P, so, S.uid, 9999, {}, []); ok(P[1].lumber === 0, 'its own death is not scavenged'); }

// ---- 3. Repair N: the most damaged allied structure within 1, else the bramble at half
{ const {e, P} = mk(); put(e, P, 1, 'k2-repair', 0); const A = put(e, P, 1, 'k2-struct', 1), B = put(e, P, 1, 'k2-struct', -1), C = put(e, P, 1, 'k2-struct', 3);
  A.hp = 10; B.hp = 15; C.hp = 1; const hq0 = P[1].hq.hp = P[1].hq.maxHp - 10; const ev = round(e, P);
  ok(A.hp === 12 && B.hp === 15 && C.hp === 1, `Repair 2: the most damaged structure in range (+2), not the far one (${A.hp}, ${B.hp}, ${C.hp})`);
  ok(P[1].hq.hp === hq0, 'a structure repaired: the bramble waits');
  ok(ev.some(x=> x.type === 'heal' && x.cause === 'repair' && x.targetUid === A.uid && x.amount === 2), 'a heal event with cause repair'); }
{ const {e, P} = mk(); put(e, P, 1, 'k2-repair', 0); put(e, P, 1, 'k2-struct', 1); const hq0 = P[1].hq.hp = P[1].hq.maxHp - 10; const ev = round(e, P);
  ok(P[1].hq.hp === hq0 + 1 && ev.some(x=> x.type === 'rebuild' && x.repair && x.amount === 1), `no damaged structure: the bramble for half (+1 of 2) (${P[1].hq.hp - hq0})`); }
{ const {e, P} = mk(); put(e, P, 1, 'k2-repair5', 0); const hq0 = P[1].hq.hp = P[1].hq.maxHp - 10; round(e, P); ok(P[1].hq.hp === hq0 + 2, 'Repair 5 on the bramble: 2 (half, rounded down)'); }
{ const {e, P} = mk(); put(e, P, 1, 'k2-repair', 0); P[1].hq.hp = P[1].hq.maxHp; const ev = round(e, P); ok(!ev.some(x=> x.type === 'rebuild'), 'a full bramble: nothing to repair, no event'); }
{ const {e, P} = mk(); const S = put(e, P, 1, 'k2-structRep', 0); S.hp = 5; const hq0 = P[1].hq.hp = P[1].hq.maxHp - 10; round(e, P); ok(S.hp === 5 && P[1].hq.hp === hq0 + 1, 'a Repair structure does not repair itself (the bramble instead)'); }
{ const {e, P} = mk(); put(e, P, 1, 'k2-repair', 0); const T = put(e, P, 1, 'k2-structCT', 1), W = put(e, P, 1, 'k2-wall', -1); T.hp = 10; W.hp = 100; round(e, P);
  ok(T.hp === 12 && W.hp === 100, `structures are a unit category: a cardType 'structure' unit is repaired, a plain unit is not (${T.hp}, ${W.hp})`); }
{ const {e, P} = mk(1, {repairBrambleRate:1}); put(e, P, 1, 'k2-repair', 0); const hq0 = P[1].hq.hp = P[1].hq.maxHp - 10; round(e, P); ok(P[1].hq.hp === hq0 + 2, 'opts.sk2.repairBrambleRate 1: the bramble at full rate'); }

// ---- 4. Foraging N: a Berry a turn, 3 Berries heal the most damaged other ally for 3
{ const {e, P} = mk(); const F = put(e, P, 1, 'k2-forage', 0), A = put(e, P, 1, 'k2-wall', 1), B = put(e, P, 1, 'k2-wall', -1); A.hp = 400; B.hp = 480; F.hp = 100;
  round(e, P); ok(F.sk2Berries === 1, `turn 1: 1 Berry (${F.sk2Berries})`); round(e, P); ok(F.sk2Berries === 2 && A.hp === 400, 'turn 2: 2 Berries, no heal yet');
  const ev = round(e, P); ok(F.sk2Berries === 0 && A.hp === 403 && B.hp === 480 && F.hp === 100, `turn 3: the 3 Berries heal the most damaged other ally for 3 (${A.hp}, ${B.hp}; itself ${F.hp})`);
  ok(ev.some(x=> x.type === 'heal' && x.cause === 'forage' && x.targetUid === A.uid) && ev.some(x=> x.type === 'statusFx' && x.kind === 'sk2BerryEat'), 'a heal event (cause forage) and the eat for the chip'); }
{ const {e, P} = mk(); const F = put(e, P, 1, 'k2-forage', 0); put(e, P, 1, 'k2-wall', 1); for(let i = 0; i < 5; i++) round(e, P); ok(F.sk2Berries === 3, `nobody hurt: it keeps 3 Berries (${F.sk2Berries})`); }
{ const {e, P} = mk(1, {foragingBerries:2, foragingN:7}); const F = put(e, P, 1, 'k2-forage', 0), A = put(e, P, 1, 'k2-wall', 1); A.hp = 400; round(e, P); round(e, P); ok(A.hp === 407 && F.sk2Berries === 0, 'opts.sk2 foragingBerries 2 / foragingN 7'); }

// ---- 5. Milling N: the trigger layer's On Turn Start × Gain N Lumber, each turn while Ready; it still attacks (SK2.millingAttacks)
{ const {e, P} = mk(); const M = put(e, P, 1, 'k2-mill', 0); M.wait = 2; const W = put(e, P, 2, 'k2-wall', 0);
  round(e, P); ok(P[1].lumber === 0 && M.wait === 1, `still Waiting: no Lumber (${P[1].lumber})`);
  round(e, P); ok(P[1].lumber === 0 && M.wait === 0, `its Wait runs out at this upkeep (${P[1].lumber})`);
  const ev = round(e, P); ok(P[1].lumber === 2 && W.hp === 497 && ev.some(x=> x.type === 'lumber' && x.uid === M.uid && x.amount === 2), `Ready: +2 at its turn's start, and it still swings (${P[1].lumber}, wall ${W.hp})`);
  round(e, P); ok(P[1].lumber === 4, `+2 every turn (${P[1].lumber})`); }
{ const {e, P} = mk(1, {millingAttacks:false}); const M = put(e, P, 1, 'k2-mill', 0); M.wait = 0; const W = put(e, P, 2, 'k2-wall', 0); const ev = round(e, P);
  ok(W.hp === 500 && P[1].lumber === 2 && ev.some(x=> x.type === 'skipTurn' && x.reason === 'milling'), 'opts.sk2.millingAttacks false: the mill holds its swing'); }
{ const {e, P} = mk(); const M = put(e, P, 1, 'k2-mill', 0); M.wait = 0; M.stunned = 2; round(e, P); ok(P[1].lumber === 0, 'a Stunned mill makes nothing that turn (its trigger is off)'); }
{ const {e, P} = mk(1, {millingN:3}); defs['k2-mill'].effects.milling = true; const M = put(e, P, 1, 'k2-mill', 0); M.wait = 0; round(e, P); defs['k2-mill'].effects.milling = 2;
  ok(P[1].lumber === 3, `opts.sk2.millingN 3: Milling with no number mills 3 (${P[1].lumber})`); }
ok(/list\.push\(\{on:'perTurn', do:'gain', resource:'lumber', amount:numN\(e\.milling, SK2\.millingN\), keyword:'milling'\}\)/.test(R('bramblewood-engine.js')), 'Milling is expressed in the trigger layer (trigsOf: perTurn × gain)');

// ---- 5b. Salvage N, M (owner 21:56): Scavenge for Structures, paid in Stone; Petrified Tree: perTurn × Gain Stone
{ const {e, P} = mk(); const S = put(e, P, 1, 'k2-salv', 0); const s1 = put(e, P, 2, 'k2-struct', 1), s2 = put(e, P, 1, 'k2-struct', -1), s3 = put(e, P, 2, 'k2-struct', 0), u = put(e, P, 2, 'k2-wall', -1), far = put(e, P, 1, 'k2-struct', 3);
  e.debugDamage(P, so, u.uid, 9999, {}, []); e.debugDamage(P, so, far.uid, 9999, {}, []); ok(!(S.sk2Salvage > 0), `a plain unit's death, or a far structure's, gives nothing (${S.sk2Salvage||0})`);
  e.debugDamage(P, so, s1.uid, 9999, {}, []); e.debugDamage(P, so, s2.uid, 9999, {}, []); ok(S.sk2Salvage === 2 && !(P[1].stone > 0), `two nearby structures: 2 points (${S.sk2Salvage})`);
  const ev = []; e.debugDamage(P, so, s3.uid, 9999, {}, ev); ok(S.sk2Salvage === 0 && P[1].stone === 1 && P[1].lumber === 0, `the 3rd becomes 1 Stone (${P[1].stone} Stone, ${P[1].lumber} Lumber)`);
  ok(ev.some(x=> x.type === 'statusFx' && x.kind === 'sk2Salvage' && x.gain === 1 && x.res === 'stone'), 'a statusFx sk2Salvage with the Stone'); }
{ const {e, P} = mk(1, {salvageEvery:1, salvageStone:2}); put(e, P, 1, 'k2-salv', 0); const s1 = put(e, P, 2, 'k2-struct', 0); e.debugDamage(P, so, s1.uid, 9999, {}, []); ok(P[1].stone === 2, 'opts.sk2 salvageEvery / salvageStone'); }
{ const cards = JSON.parse(R('canonical/cards.json')), pt = cards[cards.length - 1];
  ok(pt && pt.id === 'petrified-tree' && (pt.archetypes||[]).includes('Structure') && !pt.source && pt.attack === 0, 'Petrified Tree: the last card of cards.json, a Structure, no source yet');
  const t = (pt.effects.triggers||[])[0]; ok(t && t.on === 'perTurn' && t.do === 'gain' && t.resource === 'stone' && t.amount === 1, 'its Stone is the trigger layer: On Turn Start × Gain 1 Stone');
  const d2 = Object.assign({}, defs, {'petrified-tree': Object.assign({effects:{}}, pt)}); const e = E.makeSimEngine(d2, E.mulberry32(1), {recordEvents:true, battleMode:'open'}); const P = {1:e.newPlayer(1, {}), 2:e.newPlayer(2, {})};
  const T = put(e, P, 1, 'petrified-tree', 0); T.wait = 0; round(e, P); round(e, P); ok(P[1].stone === 2 && P[1].lumber === 0, `a Ready Petrified Tree: 1 Stone a turn (${P[1].stone})`);
  const SC = require('../tools/skill_costs.js'), Tb = SC.make(JSON.parse(R('canonical/skill-costs.json'))), b = Tb.budget(pt);
  ok(b.ok && pt.cost >= 5 && pt.wait >= 3, `inside its budget at a high cost (Lumber ${pt.cost}, Wait ${pt.wait}; 2A+H+S ${b.x1} / N ${b.N})`); }

// ---- 6. Pickpocket N: counters off the unit it hits (not debuffs); on the bramble, resources lowest rank first
{ const {e, P} = mk(); const T = put(e, P, 1, 'k2-thief', 0), V = put(e, P, 2, 'k2-wall', 0); V.prayerTokens = 1; V.sk2Berries = 2; V.poison = 3; const ev = []; e.debugAttack(P, so, T.uid, {}, ev);
  ok(T.prayerTokens === 1 && T.sk2Berries === 1 && V.prayerTokens === 0 && V.sk2Berries === 1, `Pickpocket 2: a Prayer token then a Berry move onto the thief (${T.prayerTokens}, ${T.sk2Berries}; ${V.prayerTokens}, ${V.sk2Berries})`);
  ok(V.poison >= 3 && !(T.poison > 0), 'debuffs are not taken');
  const pe = sk2Ev(ev, 'pickpocket')[0]; ok(pe && pe.amount === 2 && pe.taken.length === 2 && pe.taken[0].key === 'prayerTokens', 'a pickpocket event lists what it took'); }
{ const {e, P} = mk(); const T = put(e, P, 1, 'k2-thief', 0); put(e, P, 2, 'k2-wall', 0); const ev = []; e.debugAttack(P, so, T.uid, {}, ev); ok(!sk2Ev(ev, 'pickpocket').length, 'nothing to take: no event'); }
{ const {e, P} = mk(); const T = put(e, P, 1, 'k2-thief', 0); P[2].lumber = 1; P[2].stone = 3; const ev = []; e.debugAttack(P, so, T.uid, {}, ev);
  ok(P[2].lumber === 0 && P[2].stone === 2 && P[1].lumber === 1 && P[1].stone === 1, `on the bramble: 2 stolen, Lumber first, then Stone (${P[2].lumber}/${P[2].stone} -> ${P[1].lumber}/${P[1].stone})`);
  const pr = sk2Ev(ev, 'pickpocketRes')[0]; ok(pr && pr.taken.map(t=> t.res).join() === 'lumber,stone', 'the pickpocketRes event, in rank order'); }

// ---- 7. Sabotage N: destroys resources, lowest rank first. Arson N: only Lumber.
{ const {e, P} = mk(); const S = put(e, P, 1, 'k2-sab', 0); put(e, P, 2, 'k2-wall', 0); Object.assign(P[2], {lumber:1, stone:1, metal:5, uranium:2}); const ev = []; e.debugAttack(P, so, S.uid, {}, ev);
  ok(P[2].lumber === 0 && P[2].stone === 0 && P[2].metal === 4 && P[2].uranium === 2 && P[1].lumber === 0, `Sabotage 3 on a unit hit: Lumber, Stone, then Metal (${P[2].lumber}/${P[2].stone}/${P[2].metal}/${P[2].uranium}); nothing gained`);
  const se = sk2Ev(ev, 'sabotage')[0]; ok(se && se.lost.map(t=> t.res + t.n).join() === 'lumber1,stone1,metal1', 'the sabotage event lists the losses in rank order'); }
{ const {e, P} = mk(); const S = put(e, P, 1, 'k2-sab', 0); Object.assign(P[2], {lumber:0, stone:2, metal:2}); e.debugAttack(P, so, S.uid, {}, []); ok(P[2].stone === 0 && P[2].metal === 1, 'no Lumber: Stone first (on the bramble too)'); }
{ const {e, P} = mk(); const A = put(e, P, 1, 'k2-arson', 0); put(e, P, 2, 'k2-wall', 0); Object.assign(P[2], {lumber:3, stone:4}); const ev = []; e.debugAttack(P, so, A.uid, {}, ev);
  ok(P[2].lumber === 1 && P[2].stone === 4 && sk2Ev(ev, 'arson')[0].amount === 2, `Arson 2: 2 Lumber burnt, Stone untouched (${P[2].lumber}, ${P[2].stone})`); }
{ const {e, P} = mk(); const A = put(e, P, 1, 'k2-arson', 0); P[2].stone = 4; const ev = []; e.debugAttack(P, so, A.uid, {}, ev); ok(P[2].stone === 4 && !sk2Ev(ev, 'arson').length, 'no Lumber to burn: nothing'); }
{ const {e, P} = mk(1, {arsonN:5}); const A = put(e, P, 1, 'k2-arson', 0); P[2].lumber = 9; defs['k2-arson'].effects.arson = true; e.debugAttack(P, so, A.uid, {}, []); defs['k2-arson'].effects.arson = 2;
  ok(P[2].lumber === 4, 'opts.sk2.arsonN 5: Arson with no number burns 5'); }
{ let blocked = 0; for(let s = 1; s <= 40; s++){ const {e, P} = mk(s); const A = put(e, P, 1, 'k2-arson', 0); A.blind = 3; put(e, P, 2, 'k2-wall', 0); P[2].lumber = 5; const ev = []; e.debugAttack(P, so, A.uid, {}, ev);
    const missed = ev.some(x=> x.type === 'blindMiss'); if(missed && P[2].lumber === 5) blocked++; else if(!missed && P[2].lumber === 3) blocked++; }
  ok(blocked === 40, `a missed swing (Blind) burns nothing; a landed one does (${blocked}/40)`); }

// ---- 8. Fortification: a 0/6 Palisade (a Structure) in an empty slot beside it on play
{ const sides = new Set(); let good = 0;
  for(let s = 1; s <= 30; s++){ const {e, P} = mk(s); const ev = []; e.debugSpawnCard(P, so, 1, 'k2-fort', 0, {}, ev);
    const F = all(P[1]).find(x=> x.defId === 'k2-fort'), pal = all(P[1]).find(x=> x.defId !== 'k2-fort'); const d = pal && defs[pal.defId] || (pal && e.derivedDefs[pal.defId]);
    if(pal && Math.abs(pal.slot - F.slot) === 1 && pal.hp === 6 && pal.maxHp === 6 && d && d.token && d.attack === 0 && (d.archetypes||[]).includes('Structure') && d.sk2Palisade && sk2Ev(ev, 'fortify').length === 1) good++;
    if(pal) sides.add(pal.slot); }
  ok(good === 30, `Fortification: a 0/6 Palisade token, a Structure, right beside it (${good}/30)`);
  ok(sides.has(-1) && sides.has(1), `both free sides get picked over the seeds (${[...sides]})`); }
{ const {e, P} = mk(); put(e, P, 1, 'k2-wall', -1); put(e, P, 1, 'k2-wall', 1); const ev = []; e.debugSpawnCard(P, so, 1, 'k2-fort', 0, {}, ev);
  ok(all(P[1]).length === 3 && !sk2Ev(ev, 'fortify').length, 'no empty slot beside it: no Palisade'); }
{ const {e, P} = mk(); put(e, P, 1, 'k2-wall', -1); const ev = []; e.debugSpawnCard(P, so, 1, 'k2-fort', 0, {}, ev); const pal = all(P[1]).find(x=> /^sk2-palisade/.test(x.defId));
  ok(pal && pal.slot === 1, 'one side taken: the Palisade goes on the free side');
  const hit = put(e, P, 2, 'k2-hit3', 1); const hq0 = P[1].hq.hp; e.debugAttack(P, so, hit.uid, {}, []); ok(pal.hp === 3 && P[1].hq.hp === hq0, 'the Palisade blocks its column: the swing hits it, not the bramble'); }
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'k2-fort', 0, {}, []); const pal = all(P[1]).find(x=> /^sk2-palisade/.test(x.defId)); pal.hp = 2;
  const rep = put(e, P, 1, 'k2-repair', pal.slot + (pal.slot > 0 ? 1 : -1)); round(e, P); ok(pal.hp === 4, `Repair mends the Palisade (a structure) (${pal.hp})`); }
{ const {e, P} = mk(1, {fortifyHp:3, fortifyAtk:1}); e.debugSpawnCard(P, so, 1, 'k2-fort', 0, {}, []); const pal = all(P[1]).find(x=> /^sk2-palisade/.test(x.defId));
  ok(pal && pal.hp === 3 && e.derivedDefs[pal.defId].attack === 1, 'opts.sk2 fortifyHp / fortifyAtk size the Palisade'); }
{ const {e, P} = mk(1, {fortifyEvery:2}); e.debugSpawnCard(P, so, 1, 'k2-fort', 0, {}, []); const n0 = all(P[1]).length; round(e, P); const n1 = all(P[1]).length; round(e, P); const n2 = all(P[1]).length;
  ok(n0 === 2 && n1 === 2 && n2 === 3, `opts.sk2.fortifyEvery 2: another Palisade every 2 turns while Ready (${n0}, ${n1}, ${n2})`); }
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'k2-fort', 0, {}, []); for(let i = 0; i < 4; i++) round(e, P); ok(all(P[1]).length === 2, 'by default only on play'); }

// ---- 9. Wiring: the engine block is self-contained, every number is a parameter
const eng = R('bramblewood-engine.js');
const blk = eng.slice(eng.indexOf('[SK2 BEGIN]'), eng.indexOf('[SK2 END]'));
ok(blk.length > 2000 && /^const SK2_DEFAULTS = Object\.freeze\(\{/m.test(eng) && /Object\.assign\(\{\}, SK2_DEFAULTS, \(opts && opts\.sk2\) \|\| \{\}\)/.test(blk), 'the SK2 block reads the top-level SK2_DEFAULTS, overridable with opts.sk2');
const D = E.SK2_DEFAULTS; ok(D && D.harvestChance === 0.5 && D.harvestLumber === 1 && D.scavengeN === 1 && D.scavengeEvery === 3 && D.repairN === 2 && D.repairBrambleRate === 0.5 && D.foragingN === 3 && D.foragingBerries === 3 && D.millingN === 1 && D.millingAttacks === true && D.pickpocketN === 1 && D.sabotageN === 1 && D.arsonN === 1 && D.fortifyAtk === 0 && D.fortifyHp === 6 && D.fortifyEvery === 0 && Object.isFrozen(D), 'SK2_DEFAULTS: the defaults, exported and frozen');
ok(/function isStructureCard\(c\)\{[^\n]*d\.cardType === 'structure'/.test(eng), 'isStructureCard: the one structure test includes cardType structure');

console.log(fail ? `skills-sk2-2026-10-19: ${fail} of ${n} checks FAILED` : `skills-sk2-2026-10-19: all ${n} checks passed`); process.exit(fail ? 1 : 0);
