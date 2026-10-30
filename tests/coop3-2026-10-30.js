#!/usr/bin/env node
// The group dungeon, COOP3 (2026-10-30; owner W4 / W6 / W10, 10-30 21:53):
//   W10: "You can also place cards in your allies' rows and vice versa if you have a card adjacent. However you cannot use your allies'
//        'network' to place cards." W4: "The allies should play their cards first if CPU btw, taking a random amount of time between 0.5 to
//        3.0s. (0.5 to 1.5s in the first turn only)." W6: "Give auto-play to multi-player dungeons. Also, I want to see the rewards window".
//
//   node tests/coop3-2026-10-30.js
//
// Checks:
//   1. the engine's ownedCells: beside a unit of your own (left, right, the same column a row in front or behind), in any row, plus your
//      row's centre; an ally's units open nothing; with nothing of yours and your centre held, the slots beside it; slotCols bound it;
//      legalSlots / legalReserveSlots (solo, PvP, raids) unchanged;
//   2. the vault's table: checkAct / rowLegalSlots(T, row, seat) by that rule; a cross-row play allowed next to your own card and refused
//      next to the ally's only; a token belongs to its row's player; the CPU ally's choice keeps to its own network, its row first;
//   3. the session's CPU timers (opts.cpuDelay): the CPU acts when its timer fires, not before, players may act first, the round waits for
//      it, every client in step; without cpuDelay the old behaviour; auto-play tries again after a refused claim;
//   4. the page (static): the reserve rows of a group dungeon are full size (.coop-rows), the vault's empty one hides, --gd-k fits the
//      match, the board's signature carries the middle row, Auto is allowed in a group dungeon (gdAutoStep), the floor's rewards window
//      (gdRewardsShow: rewardsPanelHTML + wireWinLossRewardAnim, Go deeper), gdCpuDelay's ranges.
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const ROOT = H.ROOT, C = require(path.join(ROOT, 'bramblewood-coop.js'));
const defs = H.loadCardDefs();
let pass = 0; const fails = [];
function ok(cond, msg){ if(cond) pass++; else { fails.push(msg); console.log('  ✗ ' + msg); } }
const deps = {makeSimEngine: H.Engine.makeSimEngine, defs, defsHash: C.defsHash(defs, Object.keys(defs))};
function fakeClock(){
  let t = 1e6, seq = 0; const timers = new Map();
  return {now: ()=> t, setTimeout(fn, ms){ const id = ++seq; timers.set(id, {at: t + ms, fn}); return id; }, clearTimeout(id){ timers.delete(id); },
    setInterval(fn, ms){ const id = ++seq; timers.set(id, {at: t + ms, fn, every: ms}); return id; }, clearInterval(id){ timers.delete(id); },
    advance(ms){ const end = t + ms; for(;;){ let next = null; timers.forEach((v, k)=>{ if(v.at <= end && (!next || v.at < next[1].at)) next = [k, v]; }); if(!next) break; t = next[1].at; if(next[1].every) next[1].at += next[1].every; else timers.delete(next[0]); next[1].fn(); } t = end; }};
}
const io = ()=> new Promise(r=> setImmediate(r));
async function settle(hub, n){ for(let i = 0; i < (n || 6); i++){ await hub.flush(); await io(); } }
async function elapse(hub, clock, ms){ for(let x = 0; x < ms; x += 50){ clock.advance(Math.min(50, ms - x)); await settle(hub, 3); } }
const cells = list=> list.map(x=> x.row + ':' + x.slot).join(' ');

(async ()=>{
  // ---- 1. the engine's rule
  {
    const E = H.Engine.makeSimEngine(defs, H.seededRng(3), {battleMode: 'open', reserveRows: 1, slotCols: C.COLS});
    const P = {1: E.newPlayer(1, {'quarry-mole': 20}), 2: E.newPlayer(2, {'quarry-mole': 20})};
    const put = (row, slot, who)=>{ let c; if(!row){ c = E.makeBoardCard('quarry-mole'); c.slot = slot; const pl = P[1]; (slot === 0 ? pl.row.center : slot < 0 ? pl.row.left : pl.row.right).push(c); E.syncSlots(pl); } else c = E.fillReserve(P[1], row, slot, 'quarry-mole'); c.who = who; return c; };
    const mine = who=> (c)=> c.who === who;
    ok(cells(E.ownedCells(P[1], mine('a'), 0)) === '0:0', 'engine: nothing on the board -> your row\'s centre only');
    put(0, 0, 'a');
    ok(cells(E.ownedCells(P[1], mine('a'), 0)) === '0:-1 0:1 1:0', `engine: beside your unit, and behind it in the next row (${cells(E.ownedCells(P[1], mine('a'), 0))})`);
    ok(cells(E.ownedCells(P[1], mine('b'), 1)) === '1:0', `engine: the ally's units open nothing for you; your own row's centre stays open (${cells(E.ownedCells(P[1], mine('b'), 1))})`);
    put(1, 0, 'a');
    ok(cells(E.ownedCells(P[1], mine('b'), 1)) === '1:-1 1:1', `engine: your row's centre held by an ally and nothing of yours -> the slots beside it (${cells(E.ownedCells(P[1], mine('b'), 1))})`);
    put(1, 1, 'b');
    const b = cells(E.ownedCells(P[1], mine('b'), 1)), a = cells(E.ownedCells(P[1], mine('a'), 0));
    ok(b === '0:1 1:2', `engine: from your unit in your row: the slot beside it and the one in front of it in the ally's row (${b})`);
    ok(a === '0:-1 0:1 1:-1', `engine: the ally's unit at 1:1 opens nothing for the other player (1:2 is not theirs) (${a})`);
    put(0, 3, 'a');
    ok(!E.ownedCells(P[1], mine('a'), 0).some(x=> Math.abs(x.slot) > 3), 'engine: slotCols bound the cells (no 0:4)');
    ok(E.legalSlots(P[1]).join() === '-1,1,2', `engine: legalSlots (solo / PvP) unchanged: beside any of your units, the centre (${E.legalSlots(P[1]).join()})`);
    ok(E.legalReserveSlots(P[1], 1).join() === '3', `engine: legalReserveSlots (raids) unchanged: behind a front unit (${E.legalReserveSlots(P[1], 1).join()})`);
    const Es = H.Engine.makeSimEngine(defs, H.seededRng(3), {});
    ok(Es.ownedCells({row: {left: [], center: [], right: []}}, ()=> true, 0).length === 0, 'engine: a slotless (classic) board has no cells');
  }

  // ---- 2. the vault's table
  const mk = (seed, seats)=> C.createTable({makeSimEngine: H.Engine.makeSimEngine, defs, seed, typeId: 'hollow', floorIdx: 0, seats});
  {
    const T = mk(5, [{name: 'Hazel', deck: {'cave-cricket': 20}, castleHp: 15, leader: 'quarry-mole'}, {name: 'Pip', deck: {'baby-bat': 20}, castleHp: 12}]);
    ok(C.rowLegalSlots(T, 0, 0).join() === '-1,1' && C.rowLegalSlots(T, 1, 0).join() === '0', 'table: player 1 (leader in the centre): beside it, and behind it in player 2\'s row');
    ok(C.rowLegalSlots(T, 0, 1).join() === '' && C.rowLegalSlots(T, 1, 1).join() === '0', 'table: player 2 (nothing on the board): its own row\'s centre; nothing beside player 1\'s leader');
    ok(C.rowLegalSlots(T, 0).join() === '-1,1', 'table: without a seat, the old any-unit answer (callers that only ask "is it free")');
    const h1 = C.seatData(T, 1).hand[0];
    ok(C.checkAct(T, {kind: 'play', seat: 1, uid: h1.uid, row: 0, slot: 1}).why === 'cell', 'refused: player 2 beside player 1\'s leader (the ally\'s network)');
    ok(C.applyAct(T, {kind: 'play', seat: 1, uid: h1.uid, row: 1, slot: 0}).ok, 'allowed: player 2 in its row\'s centre');
    ok(C.rowLegalSlots(T, 0, 1).join() === '' || !C.rowLegalSlots(T, 0, 1).includes(1), 'player 2\'s unit at 1:0 is behind player 1\'s leader: 0:0 is taken, so still nothing in the front row');
    // next round: player 1 plays at 0:1, player 2 can then go 1:1 (beside its own 1:0), not 0:2 (beside player 1's 0:1)
    const h0 = C.seatData(T, 0).hand.find(h=> (defs[h.defId].cost || 0) === 0) || C.seatData(T, 0).hand[0];
    C.headlessRound(T);
    const h0b = C.seatData(T, 0).hand.find(h=> T.E.canPlay(C.seatData(T, 0), h.defId, h.uid));
    if(h0b){ ok(C.applyAct(T, {kind: 'play', seat: 0, uid: h0b.uid, row: 0, slot: 1}).ok, 'allowed: player 1 beside its leader'); }
    const h1b = C.seatData(T, 1).hand.find(h=> T.E.canPlay(C.seatData(T, 1), h.defId, h.uid));
    ok(!!(h0b && h1b && C.unitAt(T, 0, 1) && C.unitAt(T, 1, 0)), 'setup: player 1 holds 0:1, player 2 holds 1:0, player 2 has a playable card');
    if(h1b && C.unitAt(T, 0, 1) && C.unitAt(T, 1, 0)){
      ok(!C.checkAct(T, {kind: 'play', seat: 1, uid: h1b.uid, row: 0, slot: 2}).ok, 'refused: player 2 at 0:2, beside player 1\'s unit only');
      ok(C.checkAct(T, {kind: 'play', seat: 1, uid: h1b.uid, row: 1, slot: 1}).ok, 'allowed: player 2 at 1:1, beside its own unit (1:0) and behind player 1\'s');
      ok(!C.checkAct(T, {kind: 'play', seat: 1, uid: h1b.uid, row: 0, slot: -1}).ok || !!C.unitAt(T, 1, -1), 'refused: player 2 at 0:-1 (beside player 1\'s leader, nothing of player 2 behind it)');
    }
    void h0;
    // a token: the row's player owns it
    const T2 = mk(6, [{deck: {'cave-cricket': 20}, leader: 'quarry-mole'}, {deck: {'baby-bat': 20}}]);
    const tok = T2.E.fillReserve(T2.players[1], 1, -2, 'baby-bat');
    ok(C.ownerOf(T2, tok, 1) === 1 && C.rowLegalSlots(T2, 1, 1).includes(-3) && !C.rowLegalSlots(T2, 1, 0).includes(-3), 'a unit with no player (a token) belongs to its row\'s player');
    // the CPU's choice keeps to its own network, its row first
    for(let seed = 1; seed <= 12; seed++){
      const T3 = mk(seed, [{deck: {'cave-cricket': 20}, leader: 'quarry-mole'}, {deck: {'baby-bat': 20}, cpu: true}]);
      for(let r = 0; r < 6 && !T3.over; r++){
        [0, 1].forEach(s=>{ const a = C.cpuChoice(T3, s); if(a && a.kind === 'play') ok(C.rowLegalSlots(T3, a.row, s).includes(a.slot), `CPU seat ${s} picks a cell of its own network (seed ${seed})`); C.cpuActs(T3, s); });
        C.headlessRound(T3);
      }
    }
    const T4 = mk(7, [{deck: {'cave-cricket': 20}, leader: 'quarry-mole'}, {deck: {'baby-bat': 20}, cpu: true}]);
    const c4 = C.cpuChoice(T4, 1);
    ok(c4 && (c4.kind !== 'play' || c4.row === 1), `CPU seat 1 plays into its own row first (${JSON.stringify(c4)})`);
  }

  // ---- 3. the session: CPU timers, the round waits, auto retries
  {
    const hub = C.createHub({defer: fn=> setImmediate(fn)}), clock = fakeClock(), events = [];
    const delays = [];
    const host = C.createSession({transport: hub.connect('h'), me: {peerId: 'h', name: 'Hazel', deck: {'cave-cricket': 20}, leader: 'quarry-mole', castleHp: 15}, host: true, code: 'CPU001', typeId: 'hollow', deps, clock, seed: 77,
      cpuDelay: (T, s)=>{ const ms = T.round <= 1 ? 1200 : 2500; delays.push([T.round, s, ms]); return ms; }, onEvent: (k, d)=> events.push(k)});
    await settle(hub);
    ok(host.start(), 'solo: the host starts with a CPU ally'); await settle(hub);
    ok(host.room.seats[1].cpu && delays.length === 1 && delays[0][0] === 1 && delays[0][1] === 1, `the CPU ally's timer is drawn at the floor's start (${JSON.stringify(delays)})`);
    await elapse(hub, clock, 1000);
    ok(!host.log.some(a=> a.seat === 1), 'before its delay: the CPU ally has not acted');
    await elapse(hub, clock, 300);
    ok(host.log.some(a=> a.seat === 1 && (a.kind === 'play' || a.kind === 'pitch' || a.kind === 'pass')), 'after its delay (1.2 s): the CPU ally acted');
    ok(C.seatDone(host.T, 1) && host.T.round === 1, 'the CPU ally is done; the round waits for player 1');
    const r0 = host.T.round; host.claim({kind: 'pass'}); await elapse(hub, clock, 400);
    ok(host.T.round === r0 + 1, 'player 1 passes: the round is fought');
    ok(delays.length === 2 && delays[1][0] === 2, 'round 2: a new timer for the CPU ally');
    // player 1 acts before the CPU this time: the round waits for the CPU's timer
    host.claim({kind: 'pass'}); await elapse(hub, clock, 1000);
    ok(host.T.round === 2 && !C.seatDone(host.T, 1), 'player 1 done first: the round waits while the CPU ally takes its time');
    await elapse(hub, clock, 1800);
    ok(host.T.round === 3, 'the CPU ally acts at its time, then the round is fought');
    host.close();
  }
  {
    // without cpuDelay: as before (the CPU plays when the players are done)
    const hub = C.createHub({defer: fn=> setImmediate(fn)}), clock = fakeClock();
    const host = C.createSession({transport: hub.connect('h'), me: {peerId: 'h', name: 'Hazel', deck: {'cave-cricket': 20}, castleHp: 15}, host: true, code: 'CPU002', typeId: 'hollow', deps, clock, seed: 78});
    await settle(hub); host.start(); await settle(hub);
    await elapse(hub, clock, 5000);
    ok(!host.log.some(a=> a.seat === 1), 'no cpuDelay: the CPU waits for the players (the old order)');
    host.claim({kind: 'pass'}); await elapse(hub, clock, 400);
    ok(host.log.some(a=> a.seat === 1) && host.T.round === 2, 'no cpuDelay: player 1 done -> the CPU acts and the round is fought');
    host.close();
  }
  {
    // two players with a CPU-less room: auto-play retries after a refused claim, both finish the floor's rounds in step
    const hub = C.createHub({defer: fn=> setImmediate(fn)}), clock = fakeClock(), peers = [];
    for(let i = 0; i < 2; i++){ peers.push(C.createSession({transport: hub.connect('p' + i), me: {peerId: 'p' + i, name: 'P' + i, deck: {'cave-cricket': 10, 'baby-bat': 10}, castleHp: 15}, host: i === 0, code: 'AUTO01', typeId: 'hollow', deps, clock, seed: 11, autoPlay: 10})); await settle(hub); }
    peers[1].setReady(true); await settle(hub); peers[0].start(); await settle(hub);
    for(let g = 0; g < 80 && peers[0].T && peers[0].T.round < 8 && !peers[0].T.over; g++) await elapse(hub, clock, 200);
    ok(peers[0].T.round >= 8 || peers[0].T.over, `auto-play: two players keep playing (round ${peers[0].T.round})`);
    ok(C.tableHash(peers[0].T) === C.tableHash(peers[1].T) && !peers[0].desyncs && !peers[1].desyncs, 'auto-play: both clients in step');
    peers.forEach(p=> p.close());
  }

  // ---- 4. the page
  {
    const app = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8'), tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
    ok(/m\.coop \? ' coop-rows'/.test(app) && /\.board-row\.reserve-row\.coop-rows > \.board-card\{transform:none/.test(tpl), 'page: a group dungeon\'s rows are full size (.coop-rows, no scale)');
    ok(/coop-rows\.enemy\.is-empty\{display:none/.test(tpl) && /el\.classList\.toggle\('is-empty', pid === 2/.test(app), 'page: the vault\'s empty middle row hides');
    ok(/--mc-k:var\(--gd-k, 1\)/.test(tpl) && /setProperty\('--gd-k'/.test(app), 'page: --gd-k fits the group dungeon\'s match to the window');
    ok(/const sig1 = rowSignature\(p1Rows, dancingSide===1\) \+ coopResSig/.test(app), 'page: the board\'s signature carries the middle row (a play there redraws it)');
    ok(/CoopM\.rowLegalSlots\(m\.coop\.T, 0, m\.coop\.seat\)/.test(app) && /CoopM\.rowLegalSlots\(m\.coop\.T, r, m\.coop\.seat\)/.test(app), 'page: the "+" targets are the seat\'s own network (front and middle rows)');
    ok(/if\(m && m\.mode === 'coop' && m\.coop\) return true;/.test(app) && /if\(m\.coop\) return gdAutoStep\(m\)/.test(app), 'page: Auto in a group dungeon (gdAutoStep)');
    ok(/function gdRewardsShow\(\)/.test(app) && /rewardsPanelHTML\(\{conquestRewardEarned/.test(app) && /wireWinLossRewardAnim\(\)/.test(app) && /data-gd-rw="next"/.test(app), 'page: the floor\'s rewards window (the fight\'s rewards block, count-up, Go deeper)');
    // gdCpuDelay's ranges
    const m = app.match(/function gdCpuDelay\(T\)\{[^\n]*\}/); ok(!!m, 'page: gdCpuDelay is defined');
    if(m){ const f = new Function(m[0] + '; return gdCpuDelay;')(); let lo1 = 1e9, hi1 = 0, lo = 1e9, hi = 0;
      for(let i = 0; i < 400; i++){ const a = f({round: 1}), b = f({round: 3}); lo1 = Math.min(lo1, a); hi1 = Math.max(hi1, a); lo = Math.min(lo, b); hi = Math.max(hi, b); }
      ok(lo1 >= 500 && hi1 <= 1500 && lo >= 500 && hi <= 3000 && hi > 1500, `gdCpuDelay: 0.5-1.5 s on the first turn, 0.5-3.0 s after (${lo1}-${hi1}, ${lo}-${hi})`); }
  }

  console.log(`coop3: ${pass} passed, ${fails.length} failed`);
  process.exit(fails.length ? 1 : 0);
})().catch(e=>{ console.error(e); process.exit(1); });
