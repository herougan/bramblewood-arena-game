#!/usr/bin/env node
// Package ENG17 (2026-11-02; owner decisions 11-02 14:10):
//   COOP3-3: "only a player can play into the starting card slot of their row. The rest is up for grabs."
//   BABY-2:  "Hatchling doesn't do that. It just does what we wanted Fodder to do." (Fodder = EV-6 / EN-6's Stem from Level 1)
//
//   node tests/eng17-2026-11-02.js
//
// Checks:
//   1. engine ownedCells: another player's row centre is never a cell for you, even beside / behind your own unit; your own centre is;
//      other free cells follow W10; legalSlots (solo / PvP) unchanged;
//   2. the duo dungeon's table (bramblewood-coop.js on the engine): an ally's play into your centre is refused, yours is allowed; the CPU
//      ally never picks another player's centre over many seeded rounds, and every seat's own centre stays open to it while free;
//   3. Hatchling in a fight: an evolute played onto a Baby card with Hatchling gains +1/+2 over the same Baby without it (Level 0);
//      an old `fodder` key does the same; Hatchling copies the Stem rule exactly;
//   4. the cards: every Baby card (kind 'baby') gets Hatchling at Level 0 (levelSkills; 2026-11-02 ENG18, owner BASELVL-1: "Baby cards start at
//      level 0"; was Level 1), not in its plain effects, no Baby keeps Stem at Level 1;
//      skill-costs has a Hatchling entry priced like Stem;
//   5. the page: the Hatchling skill row, its text, icon and gate (as Stem's), and eng17MigrateHatchling maps a Baby's Stem-at-Level-1 or a
//      `fodder` key to Hatchling and adds it to a Baby override without it.
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const ROOT = H.ROOT, C = require(path.join(ROOT, 'bramblewood-coop.js'));
const defs = H.loadCardDefs();
let pass = 0; const fails = [];
function ok(cond, msg){ if(cond) pass++; else { fails.push(msg); console.log('  ✗ ' + msg); } }
const cells = list=> list.map(x=> x.row + ':' + x.slot).join(' ');

// ---- 1. engine ownedCells
{
  const E = H.Engine.makeSimEngine(defs, H.seededRng(3), {battleMode: 'open', reserveRows: 2, slotCols: C.COLS});
  const P = {1: E.newPlayer(1, {'quarry-mole': 20}), 2: E.newPlayer(2, {'quarry-mole': 20})};
  const put = (row, slot, who)=>{ let c; if(!row){ c = E.makeBoardCard('quarry-mole'); c.slot = slot; const pl = P[1]; (slot === 0 ? pl.row.center : slot < 0 ? pl.row.left : pl.row.right).push(c); E.syncSlots(pl); } else c = E.fillReserve(P[1], row, slot, 'quarry-mole'); c.who = who; return c; };
  const mine = who=> c=> c.who === who;
  ok(cells(E.ownedCells(P[1], mine('a'), 0)) === '0:0', 'engine: an empty board: your own row centre');
  ok(cells(E.ownedCells(P[1], mine('b'), 1)) === '1:0' && cells(E.ownedCells(P[1], mine('c'), 2)) === '2:0', 'engine: each player\'s own row centre is open to them');
  put(0, 0, 'a');
  const a1 = cells(E.ownedCells(P[1], mine('a'), 0));
  ok(a1 === '0:-1 0:1', `engine: behind your unit is the next player's row centre: not yours (${a1})`);
  put(1, 1, 'a'); // a unit of A's in B's row (beside B's centre)
  const a2 = cells(E.ownedCells(P[1], mine('a'), 0));
  ok(!/(^| )1:0( |$)/.test(a2) && /1:2/.test(a2) && /2:1/.test(a2), `engine: beside your unit in an ally's row, every cell but their centre is open (${a2})`);
  ok(cells(E.ownedCells(P[1], mine('b'), 1)) === '1:0', 'engine: B still has its own centre, and A\'s units open nothing else for B (W10)');
  put(1, 0, 'b'); put(2, -1, 'b');
  const b1 = cells(E.ownedCells(P[1], mine('b'), 1));
  ok(!/(^| )2:0( |$)/.test(b1) && !/(^| )0:0( |$)/.test(b1), `engine: B never gets C's centre (beside B's 2:-1) nor A's (${b1})`);
  ok(/(^| )2:0( |$)/.test(cells(E.ownedCells(P[1], mine('c'), 2))), 'engine: C keeps its centre though B stands beside it');
  ok(cells(E.ownedCells(P[1], mine('b'), 1, [0])).includes('2:0'), 'engine: otherHomes given explicitly: only those centres are closed');
  ok(E.legalSlots(P[1]).join() === '-1,1', `engine: legalSlots (solo / PvP) unchanged (${E.legalSlots(P[1]).join()})`);
}

// ---- 2. the duo dungeon's table
{
  const mk = (seed, seats)=> C.createTable({makeSimEngine: H.Engine.makeSimEngine, defs, seed, typeId: 'hollow', floorIdx: 0, seats});
  const T = mk(5, [{name: 'Hazel', deck: {'cave-cricket': 20}, castleHp: 15}, {name: 'Pip', deck: {'cave-cricket': 20}, castleHp: 12}]);
  const h0 = C.seatData(T, 0).hand.find(h=> T.E.canPlay(C.seatData(T, 0), h.defId, h.uid));
  const h1 = C.seatData(T, 1).hand.find(h=> T.E.canPlay(C.seatData(T, 1), h.defId, h.uid));
  ok(!!(h0 && h1), 'setup: both players have a playable card');
  if(h0 && h1){
    ok(!C.checkAct(T, {kind: 'play', seat: 1, uid: h1.uid, row: 0, slot: 0}).ok, 'refused: player 2 into player 1\'s row centre (an empty board)');
    ok(!C.checkAct(T, {kind: 'play', seat: 0, uid: h0.uid, row: 1, slot: 0}).ok, 'refused: player 1 into player 2\'s row centre');
    ok(C.applyAct(T, {kind: 'play', seat: 0, uid: h0.uid, row: 0, slot: 0}).ok, 'allowed: player 1 into its own row centre');
    ok(!C.rowLegalSlots(T, 1, 0).includes(0), 'player 1\'s unit at 0:0 does not open 1:0 (player 2\'s centre) behind it');
    ok(C.applyAct(T, {kind: 'play', seat: 1, uid: h1.uid, row: 1, slot: 0}).ok, 'allowed: player 2 into its own row centre');
  }
  // the CPU ally keeps out of the other player's centre, and always has its own while free
  let picks = 0, bad = 0, ownOpen = 0, ownOpenBad = 0;
  for(let seed = 1; seed <= 16; seed++){
    const T3 = mk(seed, [{deck: {'cave-cricket': 20}}, {deck: {'baby-bat': 20}, cpu: true}]);
    for(let r = 0; r < 6 && !T3.over; r++){
      [1, 0].forEach(s=>{
        const home = s, other = 1 - s;
        if(!C.unitAt(T3, home, 0)){ ownOpen++; if(!C.rowLegalSlots(T3, home, s).includes(0)) ownOpenBad++; }
        if(C.rowLegalSlots(T3, other, s).includes(0)) bad++;
        const a = C.cpuChoice(T3, s); if(a && a.kind === 'play'){ picks++; if(a.slot === 0 && a.row !== home) bad++; }
        C.cpuActs(T3, s); });
      C.headlessRound(T3);
    }
  }
  ok(picks > 20 && bad === 0, `CPU / both seats: never another player's centre (${picks} plays, ${bad} bad)`);
  ok(ownOpen > 0 && ownOpenBad === 0, `a seat's own centre is open to it whenever it is free (${ownOpen} checks, ${ownOpenBad} bad)`);
  const T4 = mk(9, [{deck: {'cave-cricket': 20}}, {deck: {'baby-bat': 20}, cpu: true}]);
  const c4 = C.cpuChoice(T4, 1);
  ok(c4 && c4.kind === 'play' && c4.row === 1 && c4.slot === 0, `CPU ally opens in its own row centre (${JSON.stringify(c4)})`);
}

// ---- 2b. raids unchanged (owner 11-02 14:26: "this only applies to coop/multiplayer dungeons. Not raids (Raids are always CPU for now)")
{
  const R = require(path.join(ROOT, 'bramblewood-raid.js'));
  const E = H.Engine.makeSimEngine(defs, H.seededRng(7), {battleMode: 'open', reserveRows: 2, reserveActs: true, slotCols: C.COLS});
  const P = {1: E.newPlayer(1, {'quarry-mole': 20}), 2: E.newPlayer(2, {'quarry-mole': 20})};
  ok(E.legalSlots(P[1]).join() === '0', 'raid: an empty front row: the centre (legalSlots)');
  const c = E.makeBoardCard('quarry-mole'); c.slot = 0; P[1].row.center.push(c); E.syncSlots(P[1]);
  ok(E.legalReserveSlots(P[1], 1).join() === '0', `raid: behind your front unit the middle row's centre stays open (legalReserveSlots, ${E.legalReserveSlots(P[1], 1).join()})`);
  ok(R.allySlot(E, P[1], 1) === 0, 'raid: the CPU ally still plays into its own row\'s centre (allySlot)');
  E.fillReserve(P[1], 1, 0, 'quarry-mole');
  ok(R.allySlot(E, P[1], 2) === 0 && E.legalReserveSlots(P[1], 2).join() === '0', 'raid: the back row likewise (no reserved-slot rule in raids)');
  const src = fs.readFileSync(path.join(ROOT, 'bramblewood-raid.js'), 'utf8');
  ok(!/ownedCells/.test(src), 'raid code never calls ownedCells (the co-op dungeon\'s rule)');
}

// ---- 3. Hatchling in a fight
{
  const evoId = 'raven-harbinger', babyId = 'duckling';
  ok(defs[evoId] && defs[evoId].effects.evolute && defs[babyId] && defs[babyId].kind === 'baby', 'setup: Raven Harbinger (Evolute, Bird) and the Duckling (Baby, Bird)');
  const run = fx=>{
    const d2 = Object.assign({}, defs); d2['duck-t'] = Object.assign({}, defs[babyId], {id: 'duck-t', effects: Object.assign({}, defs[babyId].effects, fx)});
    const E = H.Engine.makeSimEngine(d2, H.seededRng(4), {battleMode: 'open', recordEvents: true});
    const P = {1: E.newPlayer(1, {[evoId]: 10}), 2: E.newPlayer(2, {'quarry-mole': 10})};
    P[1].lumber = 99;
    const base = E.makeBoardCard('duck-t'); base.slot = 0; P[1].row.center.push(base); E.syncSlots(P[1]);
    P[1].hand = [{uid: 9001, defId: evoId}];
    const ev = [], before = {atk: base.atk, hp: base.hp};
    E.placeCard(P, H.sideOf, 1, 9001, 'center', {}, ev, {onto: base.uid});
    const e = ev.find(x=> x.type === 'evolve');
    return {e, gain: e ? {atk: e.atk - before.atk, hp: e.hp - before.hp} : null, isStem: E.isStemDef(d2['duck-t'])};
  };
  const plain = run({}), hatch = run({hatchling: true}), fod = run({fodder: true}), stem = run({stem: true});
  ok(plain.e && hatch.e, `the evolute evolves over the Duckling (${!!plain.e} / ${!!hatch.e})`);
  if(plain.e && hatch.e){
    ok(hatch.gain.atk - plain.gain.atk === 1 && hatch.gain.hp - plain.gain.hp === 2, `Hatchling: the evolute gains +1/+2 more (${JSON.stringify(plain.gain)} -> ${JSON.stringify(hatch.gain)})`);
    ok(hatch.e.stem && hatch.e.stem.attack === 1 && hatch.e.stem.health === 2 && !plain.e.stem, 'the evolve event carries the Stem bonus (the look and log line)');
  }
  ok(!plain.isStem && hatch.isStem && fod.isStem, 'isStemDef: Hatchling and an old fodder key count as a Stem; a plain Baby does not');
  if(fod.e && stem.e && hatch.e) ok(JSON.stringify(fod.gain) === JSON.stringify(hatch.gain) && JSON.stringify(stem.gain) === JSON.stringify(hatch.gain), 'Hatchling = Fodder = a plain Stem');
}

// ---- 4. the cards and the price
{
  const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8'));
  const babies = cards.filter(c=> c.kind === 'baby');
  ok(babies.length >= 21, `${babies.length} Baby cards`);
  const miss = babies.filter(c=> !(c.levelSkills && c.levelSkills['0'] && c.levelSkills['0'].hatchling === true)); // ENG18 (BASELVL-1): Level 0 (was 1)
  ok(!miss.length, `every Baby card has Hatchling at Level 0 (missing: ${miss.map(c=> c.id).join(', ')})`);
  ok(babies.every(c=> !(c.effects || {}).hatchling && !(c.effects || {}).fodder), 'no Baby card has Hatchling in its plain effects');
  ok(babies.every(c=> !((c.levelSkills['1'] || {}).stem) && !((c.levelSkills['1'] || {}).fodder) && !((c.levelSkills['1'] || {}).hatchling)), 'no Baby card keeps Stem / Fodder / Hatchling at Level 1 (Hatchling at Level 0)');
  ok(cards.filter(c=> c.kind !== 'baby').every(c=> !(c.effects || {}).hatchling && !Object.values(c.levelSkills || {}).some(s=> s && s.hatchling)), 'Hatchling only on Baby cards');
  const sc = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8'));
  const list = sc.skills || sc.entries || Object.values(sc).find(v=> Array.isArray(v)) || [];
  const hs = list.find(x=> x.id === 'hatchling'), st = list.find(x=> x.id === 'stem');
  ok(hs && st && hs.value === st.value && hs.scale === st.scale, `skill-costs: Hatchling priced as a Stem (${hs && hs.value} vs ${st && st.value})`);
}

// ---- 5. the page
{
  const app = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8'), tx = fs.readFileSync(path.join(ROOT, 'bramblewood-texts.js'), 'utf8');
  ok(/sk1Patch\(PASSIVE_DEFS, 'hatchling', \{category:'passive', label:TX\('ui\.skn-hatchling'\)/.test(app), 'page: the Hatchling skill row');
  ok(/"ui\.skn-hatchling": "Hatchling"/.test(tx) && /"ui\.sk-hatchling": "[^"]*\+1\/\+2/.test(tx), 'texts: Hatchling\'s name and help (TX keys)');
  ok(/hatchling:\s*\{from:20, nameFrom:15\}/.test(app) && /SKILL_ICON, \{hatchling:'🐣'\}/.test(app) && /hatchling: \(\)=> TX\('ui\.sk-hatchling'\)/.test(app), 'page: its gate (Stem\'s), icon and card line');
  const m = app.match(/function eng17MigrateHatchling\(c, baseline\)\{[\s\S]*?\n\}/);
  ok(!!m, 'page: eng17MigrateHatchling is defined');
  if(m){
    const f = new Function(m[0] + '; return eng17MigrateHatchling;')();
    const a = f({id: 'x', kind: 'baby', effects: {}, levelSkills: {1: {stem: true}}});
    ok(a.levelSkills[0].hatchling === true && !a.levelSkills[1], `a Baby's Stem at Level 1 reads as Hatchling at Level 0 (ENG18) (${JSON.stringify(a.levelSkills)})`);
    const b = f({id: 'y', effects: {fodder: true}}, {kind: 'baby'});
    ok(b.effects.hatchling === true && b.effects.fodder === undefined && b.levelSkills[0].hatchling === true, `a fodder key reads as Hatchling (Level 0 on a Baby) (${JSON.stringify(b)})`);
    const c0 = {id: 'z', kind: 'baby', effects: {flying: true}};
    const c = f(c0); ok(c.levelSkills[0].hatchling === true && c.effects.flying && c0.levelSkills === undefined, 'a Baby override without it gains Hatchling at Level 0 (no mutation)');
    const d0 = {id: 'w', effects: {}, levelSkills: {1: {stem: true}}};
    ok(f(d0) === d0, 'a non-Baby card\'s Stem at Level 1 (the Duckling Squadron) stays a Stem');
    const o1 = f({id: 'u', kind: 'baby', effects: {}, levelSkills: {1: {hatchling: true}}});
    ok(o1.levelSkills[0].hatchling === true && !o1.levelSkills[1], `ENG18: an older Baby override with Hatchling at Level 1 reads it at Level 0 (${JSON.stringify(o1.levelSkills)})`);
    const n1 = f({id: 't', effects: {}, levelSkills: {1: {fodder: true}}});
    ok(n1.levelSkills[1].hatchling === true && !n1.levelSkills[0], 'a non-Baby card\'s Level 1 fodder still reads as Hatchling at Level 1');
    const e0 = {id: 'v', kind: 'baby', effects: {}, levelSkills: {0: {hatchling: true}}};
    ok(f(e0) === e0, 'a Baby that already has it is untouched');
  }
  ok(/eng17MigrateHatchling\(liveCards\[id\], CARD_DEFS_BASELINE\[id\]\)/.test(app), 'page: buildCardDefs runs it on the live overrides');
}

console.log(`eng17: ${pass} passed, ${fails.length} failed`);
process.exit(fails.length ? 1 : 0);
