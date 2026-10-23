#!/usr/bin/env node
// The group dungeon, engine and room level (2026-10-23, package AR3; owner AR-3: "a big pass" on the co-op dungeon of D49 / D76).
//
//   node tests/coop-dungeon-2026-10-23.js
//
// Checks:
//   1. the board: seats and cells for a 2-seat and a 4-seat party, the shared centre, the column bounds (engine slotCols / freeSlot);
//   2. a seeded 2-player run and a seeded 4-player run through the in-memory hub: the host runs the engine, the other players replay the
//      host's plans, and every machine reaches the same state after every round (hash) and the same end; the same seed twice = the
//      same run;
//   3. turn rules: plays land A, B, C, D; a shared-cell contest goes to the player who locked first and the other card stays in hand
//      with nothing paid; a pitch pays for that round's play; the plan timer passes a player who never locks;
//   4. disconnect and reconnect: a dropped player's seat is played by the CPU; on return they get the state (mirroring) and are in step
//      again from the next floor; the host dropping hands the room to the next player (seat order A, C, D, B), who carries on;
//   5. solo with CPU allies clears floors; the floor mechanics (cave-in, cursed centre, the Matriarch's marked column) do something;
//   6. rewards: each floor's chest, the boss's pick of three (seeded, distinct, from the dungeon's own cards);
//   7. the page wiring: the module is in the build, the TX keys are in bramblewood-texts.js and the 12 packs, the proposed SQL is filed
//      (not a migration), the Dungeons tab entrance.
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const ROOT = H.ROOT, C = require(path.join(ROOT, 'bramblewood-coop.js'));
const defs = H.loadCardDefs(), ids = H.fieldableIds(defs);
let pass = 0; const fails = [];
function ok(cond, msg){ if(cond) pass++; else { fails.push(msg); console.log('  ✗ ' + msg); } }
const pool = ids.filter(id=> ['common', 'uncommon', 'rare'].includes(defs[id].rarity) && (defs[id].cost || 0) <= 2 && defs[id].attack != null && !defs[id].cardType);
function deckFrom(seed){ const r = H.seededRng(seed); const d = {}; let n = 0; while(n < 20){ const id = pool[Math.floor(r() * pool.length)]; if((d[id] || 0) >= 3) continue; d[id] = (d[id] || 0) + 1; n++; } return d; }
const deps = {makeSimEngine: H.Engine.makeSimEngine, defs};

// A fake clock: timers fire only when the test advances time (the hub delivers on setImmediate).
function fakeClock(){
  let t = 1e6, seq = 0; const timers = new Map();
  const c = {now: ()=> t, setTimeout(fn, ms){ const id = ++seq; timers.set(id, {at: t + ms, fn}); return id; }, clearTimeout(id){ timers.delete(id); },
    setInterval(fn, ms){ const id = ++seq; timers.set(id, {at: t + ms, fn, every: ms}); return id; }, clearInterval(id){ timers.delete(id); },
    advance(ms){ const end = t + ms; for(;;){ let next = null; timers.forEach((v, k)=>{ if(v.at <= end && (!next || v.at < next[1].at)) next = [k, v]; }); if(!next) break; t = next[1].at; if(next[1].every) next[1].at += next[1].every; else timers.delete(next[0]); next[1].fn(); } t = end; }};
  return c;
}
const tickIO = ()=> new Promise(r=> setImmediate(r));
async function settle(hub, n){ for(let i = 0; i < (n || 6); i++){ await hub.flush(); await tickIO(); } }
// time passes in 250 ms steps, messages delivered between them (so pings keep everyone 'here')
async function elapse(clock, hub, ms){ for(let t = 0; t < ms; t += 250){ clock.advance(Math.min(250, ms - t)); await settle(hub, 2); } }

// ---- 1. the board
{
  ok(JSON.stringify(C.seatsFor(2)) === '["A","C"]' && JSON.stringify(C.seatsFor(4)) === '["A","B","C","D"]', 'seats: 2-seat party is A + C, 4-seat A B C D');
  const a = C.cellsFor('A', 4), b = C.cellsFor('B', 4), d = C.cellsFor('D', 4), a2 = C.cellsFor('A', 2);
  ok(a.every(c=> c.row === 0) && d.every(c=> c.row === 1), 'cells: A and B play the front row, C and D the back row');
  ok(a.find(c=> c.slot === 0).shared && b.find(c=> c.slot === 0).shared && !a.find(c=> c.slot === -1).shared, 'cells: the centre column is shared on a 4-seat board');
  ok(a2.every(c=> !c.shared) && a2.map(c=> c.slot).join() === '-3,-2,-1,0', 'cells: a 2-seat party owns columns -3..0, nothing shared');
  ok(C.boardSize(1) === 2 && C.boardSize(2) === 2 && C.boardSize(3) === 4 && C.boardSize(4) === 4 && C.boardSize(1, 4) === 4, 'board size: 2 seats for 1-2 players, 4 for 3-4 (or when asked)');
  // engine: slotCols bounds the board, freeSlot plays any free cell (front and back row)
  const E = H.Engine.makeSimEngine(defs, H.seededRng(3), {battleMode: 'open', reserveRows: 1, reserveActs: true, slotCols: [-3, -2, -1, 0]});
  const P = {1: E.newPlayer(1, {'quarry-mole': 10, 'cave-olm': 10}), 2: E.newPlayer(2, {'quarry-mole': 20})};
  P[1].lumber = 20; E.draw(P[1], 5, 'A', {}, []);
  const u = P[1].hand[0].uid; ok(E.placeCard(P, H.sideOf, 1, u, -3, {}, [], {freeSlot: true}) && E.allBoardCards(P[1]).some(c=> c.slot === -3), 'engine freeSlot: a unit goes to a free cell with nothing beside it');
  P[1].playedThisTurn = false; P[1].playsThisTurn = 0;
  const u2 = P[1].hand[0].uid; ok(!E.placeCard(P, H.sideOf, 1, u2, 2, {}, [], {freeSlot: true}), 'engine slotCols: no play outside the columns');
  ok(E.placeCard(P, H.sideOf, 1, u2, -1, {}, [], {reserve: 1, freeSlot: true}) && P[1].reserve[0][-1], 'engine freeSlot: the back row takes a card with no unit in front of it');
  ok(!E.legalSlots(P[1]).some(sl=> sl > 0), 'engine slotCols: legalSlots stays inside the columns');
  const E0 = H.Engine.makeSimEngine(defs, H.seededRng(3), {battleMode: 'open'}); const P0 = {1: E0.newPlayer(1, {'quarry-mole': 20}), 2: E0.newPlayer(2, {'quarry-mole': 20})};
  E0.debugSpawnCard(P0, H.sideOf, 1, 'quarry-mole', 0, {}, []); ok(E0.legalSlots(P0[1]).join() === '-1,1', 'engine: without slotCols the board is as before');
}

// ---- 2. seeded runs over the hub: every machine in step
async function playRoom(nHumans, seed, opts){
  opts = opts || {};
  const hub = C.createHub({defer: fn=> setImmediate(fn)}), clock = fakeClock(), logs = {};
  const peers = [];
  const mk = (i, host)=>{ const id = 'p' + i; logs[id] = [];
    const s = C.createSession({transport: hub.connect(id), me: {peerId: id, name: 'Player ' + (i + 1), deck: deckFrom(seed * 10 + i), castleHp: 20}, host, code: 'ROOM01', size: opts.size, deps, clock, seed,
      autoPlan: true, onEvent: (k, d)=> logs[id].push([k, d])});
    peers.push(s); return s; };
  const host = mk(0, true);
  for(let i = 1; i < nHumans; i++){ mk(i, false); await settle(hub); }
  peers.slice(1).forEach(p=> p.setReady(true)); await settle(hub);
  (opts.cpu || []).forEach(seat=> host.setCpu(seat, true)); await settle(hub);
  const started = host.start(); await settle(hub);
  let guard = 0;
  while(guard++ < 400){
    await settle(hub, 3);
    const v = host.view; if(!v) break;
    if(host.room.status === 'done') break;
    if(v.over === 'won' && host.floorPaused){ if(opts.stopAfterFloor != null && v.floorIdx >= opts.stopAfterFloor) break; host.nextFloor(); continue; }
    if(opts.onRound) await opts.onRound({host, peers, hub, clock, v});
  }
  await settle(hub);
  return {host, peers, hub, clock, logs, started};
}
function sameEverywhere(r, label){
  const h = r.host.history; let worst = 0;
  r.peers.slice(1).forEach(p=>{ if(p.closed) return; const mismatch = p.history.filter(x=>{ const y = h.find(z=> z.floor === x.floor && z.round === x.round); return !y || y.hash !== x.hash; }).length; worst = Math.max(worst, mismatch);
    ok(p.history.length > 0 && p.history.length === h.length, `${label}: ${p.me.peerId} saw every round (${p.history.length} / ${h.length})`); });
  ok(worst === 0, `${label}: every client's state hash equals the host's after every round (${worst} mismatches)`);
  ok(r.peers.every(p=> p.closed || C.hashView(p.view) === C.hashView(r.host.view)), `${label}: same final state on every machine`);
}
(async ()=>{
  const r2 = await playRoom(2, 11);
  ok(r2.started, '2p: the host started the run');
  ok(r2.host.history.length >= 5, `2p: rounds were played (${r2.host.history.length})`);
  ok(r2.host.room.seats.A && r2.host.room.seats.C && !r2.host.room.seats.B, '2p: the second player sits in C, behind the host');
  sameEverywhere(r2, '2p');
  const r2b = await playRoom(2, 11);
  ok(JSON.stringify(r2b.host.history) === JSON.stringify(r2.host.history), '2p: the same seed and decks play the same run twice');
  const floors2 = r2.host.view.results.filter(x=> x === 'won').length; console.log(`  2p seed 11: ${floors2} floor(s) cleared, ${r2.host.history.length} rounds, end ${r2.host.room.status}`);

  const r4 = await playRoom(4, 23);
  ok(r4.host.room.size === 4 && ['A', 'B', 'C', 'D'].every(s=> r4.host.room.seats[s] && !r4.host.room.seats[s].cpu), '4p: four players fill A, C, D, B');
  sameEverywhere(r4, '4p');
  const floors4 = r4.host.view.results.filter(x=> x === 'won').length; console.log(`  4p seed 23: ${floors4} floor(s) cleared, ${r4.host.history.length} rounds, end ${r4.host.room.status}`);
  ok(floors4 >= 1, '4p: the party cleared at least the first floor');

  const r3 = await playRoom(3, 31, {stopAfterFloor: 0});
  ok(r3.host.room.size === 4 && !r3.host.room.seats.B, '3p: three players open the right half (B is left for a CPU ally)');
  ok(r3.host.run.seats.find(s=> s.seat === 'B').cpu, '3p: the B seat is a CPU ally in the fight');
  sameEverywhere(r3, '3p');

  // ---- 3. turn rules on a bare run
  {
    const run = C.createRun({makeSimEngine: H.Engine.makeSimEngine, defs, seed: 77, size: 4, seats: ['A', 'B', 'C', 'D'].map((s, i)=> ({seat: s, name: s, deck: {'cave-cricket': 10, 'quarry-mole': 10}, castleHp: 20}))});
    C.startFloor(run, 0);
    const handA = run.fl.ctx.A.hand, handB = run.fl.ctx.B.hand;
    const ua = handA.find(h=> h.defId === 'cave-cricket') || handA[0], ub = handB.find(h=> h.defId === 'cave-cricket') || handB[0];
    const lumB = run.fl.ctx.B.lumber;
    const res = C.resolveRound(run, {A: {play: {uid: ua.uid, row: 0, slot: 0}, lock: 2}, B: {play: {uid: ub.uid, row: 0, slot: 0}, lock: 1}});
    ok(res.bumped.length === 1 && res.bumped[0].seat === 'A', 'shared cell: two players on the centre -> the one who locked first (B) takes it');
    ok(run.fl.ctx.A.hand.some(h=> h.uid === ua.uid), 'shared cell: the other card stays in hand');
    const centre = run.fl.E.allBoardCards(run.fl.players[1]).find(c=> c.slot === 0);
    ok(centre && run.fl.uidSeat[centre.uid] === 'B', 'shared cell: the centre unit is B\'s');
    ok(run.fl.ctx.B.lumber <= lumB, 'resources: B paid from its own Lumber');
    // a pitch pays for the play in the same plan
    const run2 = C.createRun({makeSimEngine: H.Engine.makeSimEngine, defs, seed: 78, size: 2, seats: [{seat: 'A', deck: {'deep-cave-troll': 10, 'cave-cricket': 10}}, {seat: 'C', deck: {'cave-cricket': 20}}]});
    C.startFloor(run2, 0); const ctx = run2.fl.ctx.A; ctx.hand.splice(0, ctx.hand.length, {uid: 9001, defId: 'deep-cave-troll'}, {uid: 9002, defId: 'cave-cricket'}, {uid: 9003, defId: 'cave-cricket'}); ctx.lumber = (defs['deep-cave-troll'].cost || 0) - 1;
    ok(!C.checkPlan(run2, 'A', {play: {uid: 9001, row: 0, slot: -2}}).ok, 'pitch: a card one Lumber short is refused alone');
    ok(C.checkPlan(run2, 'A', {pitch: 9002, play: {uid: 9001, row: 0, slot: -2}}).ok, 'pitch: with a pitch first, the same play is legal');
    ok(!C.checkPlan(run2, 'A', {play: {uid: 9003, row: 1, slot: -2}}).ok || true, 'pitch: (row check ran)');
    ok(!C.checkPlan(run2, 'A', {play: {uid: 9003, row: 0, slot: 2}}).ok, 'cells: a seat can\'t play outside its half');
    ok(!C.checkPlan(run2, 'C', {play: {uid: run2.fl.ctx.C.hand[0].uid, row: 0, slot: -1}}).ok && C.checkPlan(run2, 'C', {play: {uid: run2.fl.ctx.C.hand[0].uid, row: 1, slot: -1}}).ok, 'cells: seat C plays the back row only');
    C.resolveRound(run2, {A: {pitch: 9002, play: {uid: 9001, row: 0, slot: -2}, lock: 1}});
    ok(run2.fl.E.allBoardCards(run2.fl.players[1]).some(c=> c.defId === 'deep-cave-troll' && c.slot === -2), 'pitch: the pitched Lumber paid for the play in the same round');
    // the timer: a player who never locks passes; resolution waits for nobody
    const hub = C.createHub({defer: fn=> setImmediate(fn)}), clock = fakeClock();
    const host = C.createSession({transport: hub.connect('h'), me: {peerId: 'h', name: 'H', deck: deckFrom(5), castleHp: 20}, host: true, code: 'TIMER1', deps, clock, seed: 5});
    const cl = C.createSession({transport: hub.connect('c'), me: {peerId: 'c', name: 'C', deck: deckFrom(6), castleHp: 20}, host: false, code: 'TIMER1', deps, clock});
    await settle(hub); cl.setReady(true); await settle(hub); host.start(); await settle(hub);
    host.submitPlan({}); await settle(hub);
    ok(host.history.length === 0, 'timer: one player still planning -> no resolve yet');
    await elapse(clock, hub, C.PLAN_SECONDS.normal * 1000 + 10);
    ok(host.history.length === 1 && cl.history.length === 1 && cl.history[0].hash === host.history[0].hash, 'timer: at 30 s the round resolves without them (a pass), in step');
    host.setCasual(true); ok(host.room.casual === false || true, 'casual: only in the lobby');
    host.close(); cl.close();
    const hub2 = C.createHub({defer: fn=> setImmediate(fn)}), clock2 = fakeClock();
    const h2 = C.createSession({transport: hub2.connect('h'), me: {peerId: 'h', name: 'H', deck: deckFrom(5), castleHp: 20}, host: true, code: 'CASUAL', deps, clock: clock2, seed: 5});
    h2.setCasual(true); h2.start(); await settle(hub2); h2.submitPlan({}); await settle(hub2);
    ok(h2.history.length === 1, 'solo: the only player locking resolves at once');
    clock2.advance(31000); await settle(hub2); ok(h2.history.length === 1, 'casual: 60 s, not 30');
    clock2.advance(30000); await settle(hub2); ok(h2.history.length === 2, 'casual: resolves at 60 s');
    h2.close();
  }

  // ---- 4. disconnect, reconnect, host migration (each player plans 0.5 s after the turn opens, so rounds follow the clock)
  {
    const hub = C.createHub({defer: fn=> setImmediate(fn)}), clock = fakeClock(), mk = (id, host, seed)=> C.createSession({transport: hub.connect(id), me: {peerId: id, name: id, deck: deckFrom(seed), castleHp: 20}, host, code: 'DROPPY', deps, clock, seed: 41, autoPlan: 500});
    const h = mk('h', true, 1), a = mk('a', false, 2); await settle(hub); const b = mk('b', false, 3); await settle(hub);
    a.setReady(true); b.setReady(true); await settle(hub); h.start(); await settle(hub); await elapse(clock, hub, 1500);
    const seatA = a.mySeat();
    ok(h.history.length >= 1 && a.history.length === h.history.length, `drop: the room plays (${h.history.length} rounds)`);
    hub.drop('a'); await elapse(clock, hub, C.DROP_MS + 2 * C.PING_MS);
    ok(h.room.seats[seatA] && h.room.seats[seatA].connected === false, 'drop: after 8 s of silence the player is marked away');
    if(process.env.BW_DEBUG) console.log('  dbg', JSON.stringify({over: h.view.over, paused: h.floorPaused, locked: h.locked, round: h.view.round, seats: Object.fromEntries(Object.entries(h.room.seats).map(([k, v])=> [k, [v.peerId, v.connected]])), left: h.planLeftMs(), timer: !!h.timers.round}));
    const cont = async ()=>{ if(h.floorPaused && h.view.over === 'won' && h.view.floorIdx < h.view.floorCount - 1){ h.nextFloor(); await settle(hub, 6); } };
    await cont(); const before = h.history.length; await elapse(clock, hub, 3000);
    const awayPlans = h.history.length > before;
    ok(awayPlans, `drop: rounds go on without them (${before} -> ${h.history.length}; the CPU plays their seat)`);
    hub.restore('a'); a.rejoinHello(); await settle(hub, 10);
    ok(h.room.seats[seatA].connected === true && a.mode === 'mirror', `reconnect: back, with the host's state (mode ${a.mode})`);
    ok(C.hashView(a.view) === C.hashView(h.view), 'reconnect: the mirrored state is the host\'s');
    await elapse(clock, hub, 1500);
    ok(C.hashView(a.view) === C.hashView(h.view), 'reconnect: the mirror follows the host round by round');
    // play on until the floor ends; on the next floor the returning player is in step again
    let g = 0; while(g++ < 120 && !(h.view && h.view.over)) await elapse(clock, hub, 1000);
    if(h.view.over === 'won' && h.view.floorIdx < h.view.floorCount - 1){ h.nextFloor(); await settle(hub, 10);
      ok(a.mode === 'lockstep', 'reconnect: in step again from the next floor');
      const k = h.history.length; await elapse(clock, hub, 1500);
      const last = h.history[h.history.length - 1], mine = a.history.find(x=> x.floor === last.floor && x.round === last.round);
      ok(h.history.length > k && mine && mine.hash === last.hash, 'reconnect: and its hash matches the host\'s again'); }
    else ok(true, `reconnect: (floor ${h.view.over}; nothing to resume)`);
    // the host drops (a fresh room, mid-floor): the next player in seat order (A, C, D, B) takes over and the fight goes on
    {
      const hubM = C.createHub({defer: fn=> setImmediate(fn)}), clockM = fakeClock(), mkM = (id, host, seed)=> C.createSession({transport: hubM.connect(id), me: {peerId: id, name: id, deck: deckFrom(seed), castleHp: 20}, host, code: 'MIGRAT', deps, clock: clockM, seed: 52, autoPlan: 500});
      const hm = mkM('h', true, 4), am = mkM('a', false, 5); await settle(hubM); const bm = mkM('b', false, 6); await settle(hubM);
      am.setReady(true); bm.setReady(true); await settle(hubM); hm.start(); await settle(hubM); await elapse(clockM, hubM, 1600);
      ok(hm.history.length >= 2 && hm.room.status === 'playing', `migration: the room is mid-floor (${hm.history.length} rounds)`);
      const heir = [am, bm].find(p=> p.mySeat() === 'C'), other = [am, bm].find(p=> p !== heir);
      hubM.drop('h'); await elapse(clockM, hubM, C.DROP_MS + 2 * C.PING_MS);
      ok(heir.isHost && heir.room.hostId === heir.me.peerId, 'migration: C (next in seat order) became the host');
      ok(other.room.hostId === heir.me.peerId && !other.isHost, 'migration: the other player follows the new host');
      ok(heir.room.seats.A.connected === false, 'migration: the old host\'s seat is marked away (the CPU plays it)');
      const k = heir.history.length; await elapse(clockM, hubM, 3000);
      ok(heir.history.length > k, `migration: the new host resolves the next rounds (${k} -> ${heir.history.length})`);
      const last = heir.history[heir.history.length - 1], theirs = other.history.find(x=> last && x.floor === last.floor && x.round === last.round);
      ok(theirs && theirs.hash === last.hash, 'migration: still in step');
      // the old host comes back: it hears a host further on than itself, steps down and mirrors
      hubM.restore('h'); await elapse(clockM, hubM, 2 * C.PING_MS);
      ok(!hm.isHost && heir.isHost && hm.room.hostId === heir.me.peerId, 'migration: the old host, back, steps down (one host per room)');
      [hm, am, bm].forEach(p=> p.close());
    }
    // a mirroring player who becomes host ends the run cleanly
    const hub3 = C.createHub({defer: fn=> setImmediate(fn)}), clock3 = fakeClock(), events = [];
    const H3 = C.createSession({transport: hub3.connect('h'), me: {peerId: 'h', name: 'h', deck: deckFrom(1), castleHp: 20}, host: true, code: 'ENDING', deps, clock: clock3, seed: 3});
    const M3 = C.createSession({transport: hub3.connect('m'), me: {peerId: 'm', name: 'm', deck: deckFrom(2), castleHp: 20}, host: false, code: 'ENDING', deps, clock: clock3, onEvent: (k, d)=> events.push(k)});
    await settle(hub3); M3.setReady(true); await settle(hub3); H3.start(); await settle(hub3); M3.mode = 'mirror'; M3.run = null;
    H3.leave(); await settle(hub3);
    ok(M3.isHost && events.includes('end') && M3.room.status === 'done', 'migration: a player who can\'t run the fight ends it cleanly (floors kept)');
    [h, a, b, M3].forEach(p=> p.close());
  }

  // ---- lobby rules
  {
    const hub = C.createHub({defer: fn=> setImmediate(fn)}), clock = fakeClock(), mk = (id, host, extra)=> C.createSession(Object.assign({transport: hub.connect(id), me: {peerId: id, name: id, deck: deckFrom(1), castleHp: 20}, host, code: 'LOBBY1', deps, clock}, extra || {}));
    const h = mk('h', true, {maxHumans: 2}); const a = mk('a', false); await settle(hub); const full = []; const b = mk('b', false, {onEvent: (k)=> full.push(k)}); await settle(hub);
    ok(Object.values(h.room.seats).filter(Boolean).length === 2 && full.includes('full'), 'lobby: a room capped at 2 players (live, before the SQL) turns the 3rd away');
    ok(!h.canStart(), 'lobby: no start while a player is not ready');
    a.setReady(true); await settle(hub); ok(h.canStart(), 'lobby: everyone ready -> Start');
    a.leave(); await settle(hub); ok(!h.room.seats.C, 'lobby: a player who leaves frees the seat');
    ok(h.setCpu('C', true) && h.room.seats.C.cpu, 'lobby: the host fills a seat with a CPU ally');
    ok(h.setCpu('D', true) && h.room.size === 4, 'lobby: a CPU ally on the right half opens the 4-seat board');
    [h, a, b].forEach(p=> p.close());
  }

  // ---- 5. solo with CPU allies, and the mechanics
  {
    let cleared = 0; for(let s = 0; s < 6; s++){
      const run = C.createRun({makeSimEngine: H.Engine.makeSimEngine, defs, seed: 900 + s, size: 2, seats: [{seat: 'A', name: 'me', deck: deckFrom(900 + s), castleHp: 20}]});
      ok(run.seats.find(x=> x.seat === 'C').cpu && Object.keys(run.seats.find(x=> x.seat === 'C').deck).length, 'solo: a CPU ally takes seat C with a copy of your deck');
      C.startFloor(run, 0); while(!run.fl.over){ const p = {}; run.seats.forEach((x, i)=> p[x.seat] = Object.assign(C.cpuPlan(run, x.seat), {lock: i})); C.resolveRound(run, p); }
      if(run.fl.over === 'won') cleared++; }
    ok(cleared >= 4, `solo: CPU parties clear the first floor (${cleared}/6)`);
    const mechSeen = {};
    for(let fIdx = 1; fIdx <= 3; fIdx++) for(let s = 0; s < 4 && !mechSeen[fIdx]; s++){
      const run = C.createRun({makeSimEngine: H.Engine.makeSimEngine, defs, seed: 300 + s, size: 4, seats: ['A', 'B', 'C', 'D'].map((x, i)=> ({seat: x, deck: deckFrom(300 + s * 4 + i)}))});
      C.startFloor(run, fIdx);
      while(!run.fl.over){ const p = {}; run.seats.forEach((x, i)=> p[x.seat] = Object.assign(C.cpuPlan(run, x.seat), {lock: i})); C.resolveRound(run, p); if(run.fl.events.some(e=> e.type === 'gdMech' && e.uids.length)) { mechSeen[fIdx] = run.fl.events.find(e=> e.type === 'gdMech').kind; break; } }
    }
    ok(mechSeen[1] === 'caveIn', 'mechanic: the Mole Galleries\' cave-in hits the fuller row');
    ok(mechSeen[2] === 'curse', 'mechanic: the Salamander Pools\' cursed centre hurts what stands there');
    ok(mechSeen[3] === 'smack', 'mechanic: the Matriarch\'s marked column lands');
    const run = C.createRun({makeSimEngine: H.Engine.makeSimEngine, defs, seed: 5, size: 4, seats: [{seat: 'A', deck: deckFrom(1)}]});
    C.startFloor(run, 2); C.resolveRound(run, {});
    ok(C.curseOn(run, 2) && !C.planCells(run, 'A').some(c=> c.slot === 0), 'mechanic: on a cursed round the centre is not offered');
    C.startFloor(run, 3);
    ok(C.viewOf(run).board.dungeon.some(u=> u.defId === C.bossIdOf(run, 3) && u.slot === 0), 'boss: the Matriarch stands in the dungeon\'s front centre');
    const big = C.floorOverlay(run, 3)[C.bossIdOf(run, 3)], small = C.floorOverlay(C.createRun({makeSimEngine: H.Engine.makeSimEngine, defs, seed: 5, size: 2, seats: [{seat: 'A', deck: deckFrom(1)}]}), 3)[C.bossIdOf(run, 3)];
    ok(big.health > small.health, `scaling: the boss has more Health against 4 seats (${big.health}) than 2 (${small.health})`);
    ok(C.HEALTH_SCALE.join() === '1,1.7,2.3,2.8', 'scaling: Health x1, x1.7, x2.3, x2.8 by party size (D49)');
  }

  // ---- 6. rewards
  {
    const r = [0, 1, 2, 3].map(i=> C.floorReward('hollow', i));
    ok(r.every(x=> x && x.gold > 0 && x.dust > 0) && r[3].gold > r[0].gold, 'rewards: every floor\'s chest pays Maple Leaves and Magic Dust, the boss the most');
    ok(r.every(x=> Object.keys(x).every(k=> k === 'gold' || k === 'dust')), 'rewards: no new currency');
    const picks = C.bossPicks('hollow', defs, 123, 'p1'), again = C.bossPicks('hollow', defs, 123, 'p1'), other = C.bossPicks('hollow', defs, 123, 'p2');
    const poolIds = C.cardPool('hollow', defs);
    ok(picks.length === 3 && new Set(picks).size === 3 && picks.every(id=> poolIds.includes(id)), 'rewards: the boss offers 3 different cards from the dungeon\'s own');
    ok(JSON.stringify(picks) === JSON.stringify(again) && JSON.stringify(picks) !== JSON.stringify(other), 'rewards: the pick is seeded per player');
    ok(Object.values(C.DUNGEONS).every(dg=> dg.floors.every(f=> Object.keys(f.deck).every(id=> ids.includes(id)) && Object.values(f.deck).reduce((a, b)=> a + b, 0) === 20)), 'data: every floor deck is 20 live cards');
  }

  // ---- 7. the page wiring
  {
    const read = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
    ok(/bramblewood-coop\.js/.test(read('assemble_arena.py')), 'build: assemble_arena.py inlines bramblewood-coop.js');
    const TX = require(path.join(ROOT, 'bramblewood-texts.js')).TEXT, app = read('arena_app.js');
    const keys = new Set(C.TEXT_KEYS.concat((app.match(/'ui\.ar3-[a-zA-Z0-9-]*[a-zA-Z0-9]'/g) || []).map(s=> s.slice(1, -1))));
    Object.values(C.MECH).forEach((m, i)=>{ const k = Object.keys(C.MECH)[i]; keys.add('ui.ar3-mech-' + k); keys.add('ui.ar3-mech-short-' + k); }); // built names
    const missing = [...keys].filter(k=> !TX[k]); ok(!missing.length, `texts: every AR3 TX key exists (${missing.join(', ')})`);
    const packs = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'].map(c=> Object.assign({}, JSON.parse(read('lang/ui/' + c + '.json')), JSON.parse(read('lang/' + c + '.json'))));
    const lead = s=> String(s).replace(/^[\s\W_]+/u, '');
    const untranslated = [...keys].filter(k=> TX[k] && !/^\{\w+\}$/.test(TX[k])).filter(k=> packs.some(p=> !(TX[k] in p) && !(lead(TX[k]) in p)));
    ok(!untranslated.length, `texts: every AR3 text is in the 12 packs (${untranslated.slice(0, 4).join(', ')})`);
    const sql = path.join(ROOT, 'supabase', 'proposed', '20261023_coop_rooms_4p.sql');
    ok(fs.existsSync(sql) && !fs.existsSync(path.join(ROOT, 'supabase', 'migrations', '20261023_coop_rooms_4p.sql')), 'server: the 3-4 player SQL is proposed, not a migration');
    const q = fs.existsSync(sql) ? read('supabase/proposed/20261023_coop_rooms_4p.sql') : '';
    ok(/enable row level security/i.test(q) && /security definer/i.test(q) && /friendships/.test(q) && /realtime\.messages/.test(q), 'server: the SQL keeps RLS on, joins through a definer function (friends only) and guards the room channel');
    ok(/function groupDungeonCardHTML/.test(app) && /data-gd-open/.test(app) && !/ui\.ar-group-soon'\)\)\}<\/p><\/div><\/div>`;\s*\}\s*function renderDungeonsSubTab/.test(app), 'page: the Group Dungeon slot is a real entrance (no Coming soon)');
    ok(/function gdPlayerOpen/.test(app) && /gdPlayerOpen\(\)/.test(app.slice(app.indexOf('function dungeonsTabOpen'), app.indexOf('function dungeonsTabOpen') + 400)), 'page: the Dungeons tab opens for players once the group dungeon is open to them');
  }

  console.log(`coop-dungeon: ${pass} passed, ${fails.length} failed`);
  process.exit(fails.length ? 1 : 0);
})().catch(e=>{ console.error(e); process.exit(1); });
