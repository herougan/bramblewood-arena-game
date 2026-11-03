#!/usr/bin/env node
// 2026-11-03 (package FIX7, release review 11-03a): the fixes for M1, m1, m2, m3 and m4.
//   M1  a middle- or back-row spawn (row Spawner / Duplicate: sk3SpawnAdjacent; Brood / Twin / Sprout: spawnBeside) comes with lane null and its
//       row / slot; the replay puts it into its reserve row (raidReplayReserveSpawn) instead of reading rr[null] and throwing.
//       The browser check is tests/e2e/fix7_2026_11_03.py.
//   m1  the Flyers' wind marks follow the gust's kind: Crosswind +0/2 (heavy +0/5) and no Tail / Head; Heavy Headwind −2⚔; Heavy Tailwind +⏩.
//   m2  an attacker killed by its own Bleed tick still gets its On Attack (ENG19's 'postDead' rule: draws, gives itself nothing).
//   m3  Auto-play's leader lend is undone even when aiTakeTurn throws (try / finally).
//   m4  BASELVL-1's answer names the economy side effects.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const H = require('./lib/harness.js');
const E = H.Engine, ROOT = H.ROOT, R = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id === 1 ? 'A' : 'B';
const app = R('arena_app.js'), eng = R('bramblewood-engine.js');
function fnSrc(name, from){ const s = from || app, i = s.indexOf('\nfunction ' + name + '('); if(i < 0) return null; let d = 0, j = s.indexOf('{', i);
  for(let k = j; k < s.length; k++){ const ch = s[k]; if(ch === '{') d++; else if(ch === '}'){ d--; if(!d) return s.slice(i + 1, k + 1); } } return null; }
const U = (id, effects, o)=> Object.assign({id, name: id, attack: 0, health: 500, wait: 0, cost: 0, effects: effects || {}}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'f7-tok': U('f7-tok', {}, {health: 3}), 'f7-spawner': U('f7-spawner', {spawner: 'f7-tok'}), 'f7-wall': U('f7-wall', {}, {wait: 9}),
  'f7-bleeder': U('f7-bleeder', {triggers: [{on: 'onAttack', do: 'drawCard', count: 1}, {on: 'onAttack', do: 'heal', amount: 5}]}, {attack: 2, health: 2}),
});
const raidEngine = seed=> E.makeSimEngine(defs, E.mulberry32(seed || 7), {recordEvents: true, battleMode: 'open', reserveRows: 2, reserveActs: true});

// ---- M1: the engine's row spawns (the shape the replay must place)
{ const e = raidEngine(7), P = {1: e.newPlayer(1, {}, {health: 200}), 2: e.newPlayer(2, {}, {health: 200})};
  const s = e.fillReserve(P[1], 1, 0, 'f7-spawner'); s.wait = 0; const ev = []; e.resolveCombat(P, so, {}, ev, 1);
  const sp = ev.filter(x=> x.type === 'spawn' && x.cause === 'triggerSpawn');
  ok(sp.length >= 1 && sp[0].lane === null && sp[0].row === 1 && Number.isInteger(sp[0].slot) && sp[0].nearUid === s.uid, `M1: a middle-row Spawner's spawn: lane null, row 1, its slot (${JSON.stringify(sp[0] || null)})`);
  ok(sp.length && P[1].reserve[0][sp[0].slot] && P[1].reserve[0][sp[0].slot].uid === sp[0].uids[0], 'M1: the token stands in that middle-row slot');
  // Brood / Twin / Sprout's path (spawnBeside), the same shape since 10-19 (package RR)
  const e2 = raidEngine(9), P2 = {1: e2.newPlayer(1, {}, {health: 200}), 2: e2.newPlayer(2, {}, {health: 200})};
  const b = e2.fillReserve(P2[1], 2, 1, 'f7-wall'), ev2 = []; e2.spawnBeside(P2, so, 1, b, 'f7-tok', {}, ev2, 'brood');
  const bs = ev2.find(x=> x.type === 'spawn' && x.cause === 'triggerSpawn');
  ok(bs && bs.lane === null && bs.row === 2 && Number.isInteger(bs.slot), `M1: a back-row Brood (spawnBeside): lane null, row 2, its slot (${JSON.stringify(bs || null)})`);

  // the replay: raidReplayReserveSpawn (headless: no document) puts the unit into m.replayReserve and replayCards
  const f = fnSrc('raidReplayReserveSpawn'); ok(!!f, 'raidReplayReserveSpawn exists');
  const ctx = {getCardDefs: ()=> defs}; vm.createContext(ctx); vm.runInContext(f, ctx);
  const tokUid = sp[0].uids[0], m = {players: P, replayReserve: {1: [{}, {}], 2: [{}, {}]}, replayCards: {}, _replayResUids: []};
  ctx.raidReplayReserveSpawn(m, 1, {uid: tokUid, lane: null, row: 1, slot: sp[0].slot}, sp[0], null);
  ok(m.replayReserve[1][0][sp[0].slot] === tokUid, 'M1 replay: the token takes its slot in the middle row as the replay stands');
  ok(m.replayCards[tokUid] && m.replayCards[tokUid].defId === 'f7-tok' && m.replayCards[tokUid].reserveCard && m._replayResUids.includes(tokUid), 'M1 replay: it joins replayCards (a reserve copy) and is dropped at the replay\'s end (_replayResUids)');
  ctx.raidReplayReserveSpawn(m, 1, {uid: 99999, lane: null, row: 2, slot: -1}, {defId: 'f7-tok'}, null);
  ok(m.replayCards[99999] && m.replayCards[99999].hp === 3 && m.replayReserve[1][1][-1] === 99999, 'M1 replay: a token spawned and killed the same round is built from its card');
  ok(ctx.raidReplayReserveSpawn({players: P, replayReserve: null}, 1, {uid: 1, row: 1, slot: 0}, {}, null) === null, 'M1 replay: outside a row replay it does nothing');
  // the spawn branch: row placements go to the rows, rr[lane] is read only for a lane it has
  const br = app.slice(app.indexOf("ev.type==='spawn' && (ev.cause==='onAttackedSpawn' || ev.cause==='onDeathSpawn' || ev.cause==='triggerSpawn')"), app.indexOf('noteSpawnOrigins([ev]); // 2026-10-31'));
  ok(/ev\.uids\.map\(u=>\(\{uid:u, lane:ev\.lane, row:ev\.row, slot:ev\.slot\}\)\)/.test(br), 'M1 replay: a uids-shaped spawn keeps its row and slot');
  ok(/const rowPl = placements\.filter\(p=> p && p\.lane == null && p\.row != null\)/.test(br) && /raidReplayReserveSpawn\(m, pid, p, ev, from\)/.test(br), 'M1 replay: row placements go to raidReplayReserveSpawn');
  ok(/placements = placements\.filter\(p=> p && rr && p\.lane != null && rr\[p\.lane\]\);/.test(br) && br.indexOf('placements = placements.filter') < br.indexOf('let at = rr[lane].length'), 'M1 replay: rr[lane] is read only for a lane the replay has');
  // the old expression, as the review ran it, throws; the filtered one leaves it out
  const rr = {left: [], center: [], right: []}, pls = sp[0].uids.map(u=> ({uid: u, lane: sp[0].lane, row: sp[0].row, slot: sp[0].slot}));
  let threw = false; try{ pls.forEach(({lane})=> rr[lane].length); }catch(e){ threw = true; }
  ok(threw && pls.filter(p=> p && rr && p.lane != null && rr[p.lane]).length === 0, 'M1: the old read throws on the row spawn; the filter leaves it to the rows'); }

// ---- m1: the wind marks per kind
{ const lw = fnSrc('liveWindState'), fw = fnSrc('flyerWindPips'); ok(!!lw && !!fw, 'liveWindState and flyerWindPips exist');
  const ctx = {TX: k=> k, escapeAttr: s=> s, iconHTML: (k, e)=> e}; vm.createContext(ctx); vm.runInContext(lw + '\n' + fw, ctx);
  const eng0 = o=> Object.assign({isAshy: ()=> false, isWindy: ()=> false, windSideOf: ()=> null, getWindKind: ()=> null}, o || {});
  const set = w=> vm.runInContext('var matchState = ' + JSON.stringify({_windNow: w}) + '; matchState.engine = __eng;', Object.assign(ctx, {__eng: eng0()}));
  set({windy: true, mine: true, kind: 'cross'}); { const a = ctx.liveWindState(1), b = ctx.liveWindState(2);
    ok(a.k === 'cross' && b.k === 'cross' && a.hp === 2 && !a.heavy, 'm1: a Crosswind gives both sides the cross mark (+0/2), no Tail or Head');
    const h = ctx.flyerWindPips({flying: true}, a).join(''); ok(/wind-cross/.test(h) && /\+0\/2/.test(h) && !/👢/.test(h) && !/⚔/.test(h), 'm1: the Crosswind pip: +0/2, no boot, no Attack cut'); }
  set({windy: true, mine: false, kind: 'heavyCross'}); { const a = ctx.liveWindState(1); ok(a.k === 'cross' && a.hp === 5 && a.heavy && /\+0\/5/.test(ctx.flyerWindPips({flying: true}, a).join('')), 'm1: a Heavy Crosswind: +0/5'); }
  set({windy: true, mine: true, kind: 'heavy'}); { const t = ctx.liveWindState(1), h = ctx.liveWindState(2);
    ok(t.k === 'tail' && t.heavy && h.k === 'head' && h.heavy, 'm1: a Heavy wind: Tail at your back, Head on theirs, both heavy');
    ok(/−2⚔/.test(ctx.flyerWindPips({flying: true}, h).join('')) && !/−1⚔/.test(ctx.flyerWindPips({flying: true}, h).join('')), 'm1: Heavy Headwind shows −2⚔ (the engine cuts 2)');
    ok(/👢/.test(ctx.flyerWindPips({flying: true}, t).join('')) && /⏩/.test(ctx.flyerWindPips({flying: true}, t).join('')), 'm1: Heavy Tailwind shows the boot and its extra Fast Forward'); }
  set({windy: true, mine: true}); { const h = ctx.liveWindState(2); ok(h.k === 'head' && !h.heavy && /−1⚔/.test(ctx.flyerWindPips({flying: true}, h).join('')), 'm1: a plain Headwind still shows −1⚔'); }
  // before any wind event: the engine's own kind
  vm.runInContext('var matchState = {engine: __eng};', Object.assign(ctx, {__eng: eng0({isWindy: ()=> true, windSideOf: ()=> 'cross', getWindKind: ()=> 'cross'})}));
  ok(ctx.liveWindState(1).k === 'cross', 'm1: before the wind event, the engine\'s getWindKind decides (cross)');
  vm.runInContext('var matchState = {engine: __eng};', Object.assign(ctx, {__eng: eng0({isWindy: ()=> true, windSideOf: p=> p === 1 ? 'head' : 'tail', getWindKind: ()=> 'heavy'})}));
  ok(ctx.liveWindState(1).k === 'head' && ctx.liveWindState(1).heavy, 'm1: before the wind event, a heavy Headwind from the engine');
  const sf = fnSrc('syncWindField'); ok(/const cross = !!\(w && w\.windy && \(w\.kind === 'cross' \|\| w\.kind === 'heavyCross'\)\);/.test(sf) && /const want = cross \? null :/.test(sf), 'm1: a Crosswind draws no north / south wind layer');
  ok(/ev\.windy && ev\.kind !== 'cross' && ev\.kind !== 'heavyCross'\) matchState\._windLastMine = mine;/.test(app), 'm1: a Crosswind does not set the calm rounds\' breeze direction');
  ok(/getWindKind: \(\)=> windNow \? windKind : null/.test(eng) && /EN20[^\n]*crossHp:2, heavyCrossHp:5, heavyHeadCut:2/.test(eng), 'm1: the marks\' numbers are the engine\'s (crossHp 2, heavyCrossHp 5, heavyHeadCut 2)'); }

// ---- m2: bleeding out as it attacks
{ const e = E.makeSimEngine(defs, E.mulberry32(3), {recordEvents: true, battleMode: 'open'}), P = {1: e.newPlayer(1, {}), 2: e.newPlayer(2, {})};
  P[1].deck = ['f7-wall', 'f7-wall']; e.debugSpawnCard(P, so, 1, 'f7-bleeder', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'f7-wall', 'left', {}, []);
  const b = [...P[1].row.left, ...P[1].row.center, ...P[1].row.right].find(c=> c.defId === 'f7-bleeder'); b.bleed = 5;
  const h0 = P[1].hand.length, ev = []; e.resolveCombat(P, so, {}, ev, 1);
  const bled = ev.some(x=> (x.type === 'bleedTick' || x.kind === 'bleed' || x.cause === 'bleed' || /bleed/i.test(x.type || '')) && (x.uid === b.uid || x.targetUid === b.uid || x.attUid === b.uid));
  const drew = ev.some(x=> x.type === 'draw' && x.side === 'A'), hit = ev.some(x=> x.type === 'hit' && x.attUid === b.uid);
  const healed = ev.some(x=> (x.type === 'heal' || (x.type === 'statusFx' && x.kind === 'heal')) && (x.uid === b.uid || x.targetUid === b.uid));
  ok(b.hp <= 0 && !hit, `m2: the attacker bleeds out as it attacks and lands no blow (hp ${b.hp}, bleed event ${bled})`);
  ok(drew && P[1].hand.length === h0 + 1, `m2: its On Attack draw still goes off (hand ${h0} -> ${P[1].hand.length})`);
  ok(!healed, 'm2: it gives itself nothing (its On Attack heal is skipped: postDead)');
  ok(/if\(a\.att\.hp<=0\)\{ runOnAttackPost\(players, sideOf, a, attDef, stats, events\); reflowAfterKills/.test(eng), 'm2: the Bleed bail-out runs runOnAttackPost first'); }

// ---- m3: the Auto-play leader lend
{ const st = app.slice(app.indexOf('\nasync function autoplayStep('), app.indexOf('\nasync function autoplayStep(') + 2000); ok(/try\{ m\.engine\.aiTakeTurn\(m\.players, m\.sideOf, 1, m\.stats, ev\); \} finally \{ autoplayLeaderOff\(m, me, lead, ev\); \}/.test(st || ''), 'm3: aiTakeTurn sits in try / finally, autoplayLeaderOff always runs');
  const off = fnSrc('autoplayLeaderOff'); const ctx = {}; vm.createContext(ctx); vm.runInContext(off, ctx);
  const me = {reserveLeaders: ['x'], leaderPlan: {}}, m = {sideOf: ()=> 'A'};
  try{ try{ throw new Error('boom'); } finally { ctx.autoplayLeaderOff(m, me, 'x', []); } }catch(e){}
  ok(!me.reserveLeaders && !me.leaderPlan && m.leaderUid == null, 'm3: after a throw the seat has no lent leader left (reserveLeaders, leaderPlan cleared)'); }

// ---- m4: BASELVL-1's answer
{ let d = null; try{ d = JSON.parse(R('docs/decisions.json')); }catch(e){} ok(!!d, 'm4: docs/decisions.json is valid JSON');
  const it = d && (d.items || []).find(x=> x.id === 'BASELVL-1');
  ok(it && /forgeSpentOn/.test(it.answer) && /duplicateValue/.test(it.answer) && /limitBreakCost/.test(it.answer) && /forge credit/.test(it.answer), 'm4: BASELVL-1 names the economy side effects (forgeSpentOn: duplicate value, limit break, forge credit)'); }

console.log(fail ? `fix7: ${n - fail}/${n} passed, ${fail} failed` : `fix7: all ${n} passed`);
process.exit(fail ? 1 : 0);
