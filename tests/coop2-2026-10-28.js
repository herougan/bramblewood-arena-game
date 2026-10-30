#!/usr/bin/env node
// The Tidelock Vault as a normal game, like a raid (2026-10-28, package COOP2; owner K12, 10-27 11:22: "It should be a normal game, but like,
// raid, it has 2-4 players (not selectable depends on the multi-dungeon type.) In this version, allies can place in allied spots. (Placing a
// card shows up as you placing your card in your friend's screens. locking that slot. If there's ever a race condition, smaller index player
// takes priority)").
//
//   node tests/coop2-2026-10-28.js
//
// Checks:
//   1. the type: the player count is in the dungeon's definition (2 for the vault), the room has exactly that many seats;
//   2. the table: the normal Open engine with a row a seat (reserveRows = players - 1), one shared bramble (the seats' added up), every
//      leader in its row's centre; a seat's own hand / Lumber / turn flags; the normal one play a turn; a pitch pays its seat only;
//      an ally may play into the other player's empty slots; a unit in a player's row holds it; each seat draws as the round starts;
//   3. the race over the in-memory hub: two claims on one slot in the same moment -> the lower player index lands, the other is refused
//      (by: 0) and its card stays in that player's hand; a claim on a slot taken earlier is refused even for the lower index; every
//      client's table hashes the same after every act and round (no desync);
//   4. a solo room (the CPU in seat 1) and a 2-player room play whole runs in step, the same seed twice = the same run;
//   5. a player who drops is played by the CPU and catches up on return (the act log); the host dropping hands the room to seat 1;
//   6. rewards: the raid's arithmetic (rank on the bramble, damage x perInFightHp, overwhelm, rank multiplier, RAID_ATTEMPT_PAY);
//   7. what was removed is gone (the plan timer, the shared centre, cave-ins / curse / marked column, the pick of three).
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const ROOT = H.ROOT, C = require(path.join(ROOT, 'bramblewood-coop.js'));
const defs = H.loadCardDefs(), ids = H.fieldableIds(defs);
let pass = 0; const fails = [];
function ok(cond, msg){ if(cond) pass++; else { fails.push(msg); console.log('  ✗ ' + msg); } }
const pool = ids.filter(id=> ['common', 'uncommon', 'rare'].includes(defs[id].rarity) && (defs[id].cost || 0) <= 2 && defs[id].attack != null && !defs[id].cardType);
function deckFrom(seed){ const r = H.seededRng(seed); const d = {}; let n = 0; while(n < 20){ const id = pool[Math.floor(r() * pool.length)]; if((d[id] || 0) >= 3) continue; d[id] = (d[id] || 0) + 1; n++; } return d; }
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

(async ()=>{
  // ---- 1. the type
  ok(C.playersOf('hollow') === 2 && C.DUNGEONS.hollow.players === 2, 'type: the Tidelock Vault is a 2-player group dungeon (its definition, not the lobby)');
  ok(C.DUNGEONS.hollow.floors.length === 4 && C.DUNGEONS.hollow.floors[3].boss && C.DUNGEONS.hollow.floors[3].boss.nameKey === 'ui.ar3-boss-name', 'type: four floors, the Tidewarden on the last');
  ok(C.DUNGEONS.hollow.roundCap === 20, 'type: the raid\'s 20-turn clock');

  // ---- 2. the table
  const mk = (seed, seats, extra)=> C.createTable(Object.assign({makeSimEngine: H.Engine.makeSimEngine, defs, seed, typeId: 'hollow', floorIdx: 0, seats}, extra || {}));
  {
    const T = mk(5, [{name: 'Hazel', deck: {'cave-cricket': 10, 'quarry-mole': 10}, castleHp: 15, leader: 'quarry-mole'}, {name: 'Pip', deck: {'baby-bat': 20}, castleHp: 12}]);
    ok(T.n === 2 && T.players[1].reserve && T.players[1].reserve.length === 1, 'table: a row per player (the front and the middle row)');
    ok(T.E.battleMode === 'open' && T.E.reserveRows === 1, 'table: the normal Open engine, reserve rows as the raid board');
    ok(T.players[1].hq.maxHp === 27, `table: one shared bramble, the players' brambles added up (${T.players[1].hq.maxHp})`);
    const lead = T.E.allBoardCards(T.players[1]).find(c=> c.isLeader);
    ok(lead && lead.slot === 0 && lead.coopSeat === 0, 'table: player 1\'s leader opens in the centre of its row');
    ok(C.seatData(T, 0).hand.length === 3 && C.seatData(T, 1).hand.length === 3, 'table: each player draws an opening hand of 3');
    ok(C.seatData(T, 1).hand.every(h=> h.defId === 'baby-bat') && C.seatData(T, 0).hand.every(h=> h.defId !== 'baby-bat'), 'table: each hand comes from its own deck');
    const h0 = C.seatData(T, 0).hand.find(h=> h.defId === 'cave-cricket') || C.seatData(T, 0).hand[0], h1 = C.seatData(T, 1).hand[0];
    // player 1 (seat 0) plays into player 2's empty middle row (K12: "allies can place in allied spots")
    ok(C.rowLegalSlots(T, 1).includes(0), 'slots: the empty middle row opens at its centre');
    let r = C.applyAct(T, {kind: 'play', seat: 0, uid: h0.uid, row: 1, slot: 0});
    const u = C.unitAt(T, 1, 0);
    ok(r.ok && u && u.coopSeat === 0 && u.holdRow, 'ally slot: player 1 played into player 2\'s row; the unit is player 1\'s and holds the row');
    ok(!C.checkAct(T, {kind: 'play', seat: 0, uid: C.seatData(T, 0).hand[0].uid, row: 0, slot: 1}).ok, 'one play a turn: a second play by the same player is refused');
    ok(C.checkAct(T, {kind: 'play', seat: 1, uid: h1.uid, row: 1, slot: 0}).why === 'taken', 'locked: the slot is taken for everyone');
    const lum1 = C.seatData(T, 1).lumber || 0, lum0 = C.seatData(T, 0).lumber || 0;
    r = C.applyAct(T, {kind: 'pitch', seat: 1, uid: h1.uid});
    ok(r.ok && (C.seatData(T, 1).lumber || 0) === lum1 + 1 && (C.seatData(T, 0).lumber || 0) === lum0, 'pitch: the Lumber goes to the player who pitched, nobody else');
    const h1b = C.seatData(T, 1).hand[0];
    // 2026-10-30 (package COOP3, owner W10: "However you cannot use your allies' 'network' to place cards."): player 2 has nothing on the board,
    // so player 1's units open nothing in the front row for it; it plays beside its own row's centre (held by player 1's card) instead.
    // Was: 'ally slot: player 2 may play into player 1's front row too' (row 0, slot -1, beside player 1's leader).
    ok(!C.checkAct(T, {kind: 'play', seat: 1, uid: h1b.uid, row: 0, slot: -1}).ok, 'ally slot: player 2 may not play beside player 1\'s units (COOP3, W10)');
    ok(C.checkAct(T, {kind: 'play', seat: 1, uid: h1b.uid, row: 1, slot: -1}).ok, 'own row: its centre held by an ally, player 2 opens beside it (COOP3)');
    C.applyAct(T, {kind: 'play', seat: 1, uid: h1b.uid, row: 1, slot: -1});
    ok(C.seatDone(T, 0) && C.seatDone(T, 1), 'turn: both players have played');
    const hands = [C.seatData(T, 0).hand.length, C.seatData(T, 1).hand.length];
    const res = C.headlessRound(T);
    ok(!res.over && T.round === 2, 'round: fought, the next round started');
    ok(C.seatData(T, 0).hand.length === hands[0] + 1 && C.seatData(T, 1).hand.length === hands[1] + 1, 'round: each player drew a card');
    ok(!C.seatDone(T, 0) && !C.seatDone(T, 1), 'round: every player\'s turn flags are clear again');
    ok(C.unitAt(T, 1, 0) && C.unitAt(T, 1, 0).uid === u.uid, 'hold: the unit in the middle row is still there (no stepping up into the front)');
    // same seed, same acts -> the same table
    const A = mk(9, [{deck: deckFrom(1)}, {deck: deckFrom(2)}]), B = mk(9, [{deck: deckFrom(1)}, {deck: deckFrom(2)}]);
    for(let i = 0; i < 6; i++){ [A, B].forEach(X=>{ C.cpuActs(X, 0); C.cpuActs(X, 1); C.headlessRound(X); }); }
    ok(C.tableHash(A) === C.tableHash(B) && A.round === B.round, 'determinism: the same seed and acts give the same fight');
    const Bs = mk(9, [{deck: deckFrom(1)}, {deck: deckFrom(2)}], {rest: 1});
    for(let i = 0; i < 6; i++){ C.cpuActs(Bs, 0); C.cpuActs(Bs, 1); C.headlessRound(Bs); }
    ok(C.tableHash(Bs) === C.tableHash(A), 'determinism: whichever seat a page keeps loaded, the fight is the same');
    ok(C.unsupportedCard({cardType: 'equipment'}) && !C.unsupportedCard(defs['baby-bat']), 'cards: equipment / hazards / evolutes wait (COOP2-3); units play');
  }
  // the engine's AR3 hooks the table uses: slotCols bounds the board, freeSlot places into a free cell
  {
    const E0 = H.Engine.makeSimEngine(defs, H.seededRng(3), {battleMode: 'open', reserveRows: 1, slotCols: C.COLS}); const P0 = {1: E0.newPlayer(1, {'quarry-mole': 20}), 2: E0.newPlayer(2, {'quarry-mole': 20})};
    ok(E0.legalSlots(P0[1]).join() === '0', 'engine: an empty front opens at the centre');
  }

  // ---- 3. the race, over the hub
  {
    const hub = C.createHub({defer: fn=> setImmediate(fn)}), clock = fakeClock(), ev = {h: [], g: []};
    // 2026-10-30 (COOP3, W10): Hazel brings a leader, so the middle row's centre (behind it) is a cell player 1 may claim in the race
    const host = C.createSession({transport: hub.connect('h'), me: {peerId: 'h', name: 'Hazel', deck: {'cave-cricket': 20}, leader: 'quarry-mole', castleHp: 15}, host: true, code: 'RACE01', typeId: 'hollow', deps, clock, seed: 4242, onEvent: (k, d)=> ev.h.push([k, d])});
    const guest = C.createSession({transport: hub.connect('g'), me: {peerId: 'g', name: 'Pip', deck: {'baby-bat': 20}, castleHp: 15}, host: false, code: 'RACE01', typeId: 'hollow', deps, clock, onEvent: (k, d)=> ev.g.push([k, d])});
    await settle(hub);
    ok(guest.mySeat() === 1 && host.room.seats.length === 2, 'room: the guest takes seat 1 (player 2); the room has the type\'s 2 seats');
    ok(!host.canStart(), 'room: no start before the guest is ready');
    guest.setReady(true); await settle(hub);
    ok(host.start(), 'room: the host starts'); await settle(hub);
    ok(host.T && guest.T && C.tableHash(host.T) === C.tableHash(guest.T), 'start: both clients built the same table');
    const gh = C.seatData(guest.T, 1).hand[0], hh = C.seatData(host.T, 0).hand.find(h=> (defs[h.defId].cost || 0) === 0);
    // the guest (player 2) claims the middle row's centre first; the host (player 1) claims it in the same moment
    const gr = guest.claim({kind: 'play', uid: gh.uid, row: 1, slot: 0});
    await settle(hub);
    const hr = host.claim({kind: 'play', uid: hh.uid, row: 1, slot: 0});
    ok(gr.ok && hr.ok, 'race: both claims were sent');
    await elapse(hub, clock, 400);
    const cell = C.unitAt(host.T, 1, 0), gcell = C.unitAt(guest.T, 1, 0);
    ok(cell && cell.coopSeat === 0 && cell.defId === hh.defId, 'race: the lower player index (player 1) lands in the slot, though player 2 claimed first');
    ok(gcell && gcell.uid === cell.uid, 'race: player 2\'s screen shows player 1\'s card in that slot');
    const rej = ev.g.find(([k])=> k === 'reject');
    ok(rej && rej[1].by === 0 && rej[1].act && rej[1].act.uid === gh.uid, 'race: player 2\'s claim is refused, taken by player 1');
    ok(C.seatData(guest.T, 1).hand.some(h=> h.uid === gh.uid) && !Object.keys(guest.pending).length, 'race: player 2\'s card is back in its hand, nothing waiting');
    ok(C.tableHash(host.T) === C.tableHash(guest.T), 'race: both tables are the same after it');
    // the slot is locked: a later claim on it is refused at once on the claimant's own page
    const g2 = guest.claim({kind: 'play', uid: gh.uid, row: 1, slot: 0});
    ok(!g2.ok && g2.why === 'taken', 'lock: a later claim on the taken slot is refused');
    // player 2 plays into player 1's front row instead (an allied spot); the round starts once both are done
    // 2026-10-30 (COOP3, W10): with nothing of its own on the board player 2 has no cell in player 1's row; it plays beside its own row's
    // centre (player 1's card holds it). Was: rowLegalSlots(guest.T, 0)[0], a front-row slot beside player 1's units.
    const fs1 = C.rowLegalSlots(guest.T, 1, 1)[0];
    ok(fs1 != null && guest.claim({kind: 'play', uid: gh.uid, row: 1, slot: fs1}).ok, 'own row: player 2 claims a slot beside its row\'s centre (COOP3)');
    await elapse(hub, clock, 400); for(let i = 0; i < 10 && host.T.round === 1; i++) await elapse(hub, clock, 200);
    ok(host.T.round === 2 && guest.T.round === 2, 'turn: both played, the round was fought on both clients');
    ok(C.tableHash(host.T) === C.tableHash(guest.T) && host.desyncs === 0 && guest.desyncs === 0, 'turn: same table on both after the round, no desync');
    // a lower index never steals a slot already landed: player 2 lands first in one moment, player 1 claims it in the next
    const g3 = C.seatData(guest.T, 1).hand[0], sl3 = C.rowLegalSlots(guest.T, 1, 1).find(sl=> sl !== 0); // + COOP3: a slot player 2 itself may use
    guest.claim({kind: 'play', uid: g3.uid, row: 1, slot: sl3}); await elapse(hub, clock, 300);
    ok(C.unitAt(host.T, 1, sl3) && C.unitAt(host.T, 1, sl3).coopSeat === 1, 'first come: player 2\'s claim landed alone');
    const h3 = C.seatData(host.T, 0).hand.find(h=> (defs[h.defId].cost || 0) <= (C.seatData(host.T, 0).lumber || 0));
    if(h3){ const r3 = host.claim({kind: 'play', uid: h3.uid, row: 1, slot: sl3}); ok(!r3.ok && r3.why === 'taken', 'first come: player 1 can\'t take a slot player 2 already holds'); }
    host.close(); guest.close();
  }

  // ---- 4. whole runs in step
  async function run(nHumans, seed){
    const hub = C.createHub({defer: fn=> setImmediate(fn)}), clock = fakeClock(), peers = [];
    for(let i = 0; i < nHumans; i++){ const id = 'p' + i; peers.push(C.createSession({transport: hub.connect(id), me: {peerId: id, name: 'P' + i, deck: deckFrom(seed * 10 + i), castleHp: 15}, host: i === 0, code: 'RUN001', typeId: 'hollow', deps, clock, seed, autoPlay: 10})); await settle(hub); }
    peers.slice(1).forEach(p=> p.setReady(true)); await settle(hub);
    peers[0].start(); await settle(hub);
    for(let g = 0; g < 600 && !peers[0].ended; g++){ await elapse(hub, clock, 200); const T = peers[0].T; if(T && T.over === 'won' && !peers[0].ended && peers[0].log[peers[0].log.length - 1].kind === 'round') peers[0].nextFloor(); }
    await settle(hub);
    return {peers, hub};
  }
  const solo = await run(1, 7);
  ok(solo.peers[0].ended, `solo: the run ended (${solo.peers[0].ended}, floors ${JSON.stringify(solo.peers[0].results)})`);
  ok(solo.peers[0].room.seats[1].cpu, 'solo: the CPU plays seat 1');
  ok(solo.peers[0].log.some(a=> a.seat === 1 && a.kind === 'play'), 'solo: the CPU ally played cards');
  const duo = await run(2, 11), duo2 = await run(2, 11);
  ok(duo.peers[0].ended && duo.peers[1].ended === duo.peers[0].ended, `2p: the run ended the same for both (${duo.peers[0].ended}, ${JSON.stringify(duo.peers[0].results)})`);
  ok(duo.peers.every(p=> p.desyncs === 0), '2p: no desync in the whole run');
  ok(JSON.stringify(duo.peers[1].log.map(a=> [a.seq, a.kind, a.seat, a.hash || ''])) === JSON.stringify(duo.peers[0].log.map(a=> [a.seq, a.kind, a.seat, a.hash || ''])), '2p: both clients applied the same act log');
  ok(JSON.stringify(duo2.peers[0].log.map(a=> [a.kind, a.seat, a.uid, a.slot])) === JSON.stringify(duo.peers[0].log.map(a=> [a.kind, a.seat, a.uid, a.slot])), '2p: the same seed and decks play the same run twice');
  console.log(`  solo seed 7: ${solo.peers[0].ended} ${JSON.stringify(solo.peers[0].results)} · 2p seed 11: ${duo.peers[0].ended} ${JSON.stringify(duo.peers[0].results)}, ${duo.peers[0].log.length} acts`);
  [solo, duo, duo2].forEach(x=> x.peers.forEach(p=> p.close()));

  // ---- 5. a drop, a return, the host leaving
  {
    const hub = C.createHub({defer: fn=> setImmediate(fn)}), clock = fakeClock();
    const host = C.createSession({transport: hub.connect('h'), me: {peerId: 'h', name: 'H', deck: deckFrom(31), castleHp: 15}, host: true, code: 'DROP01', typeId: 'hollow', deps, clock, seed: 99, autoPlay: 10});
    const guest = C.createSession({transport: hub.connect('g'), me: {peerId: 'g', name: 'G', deck: deckFrom(32), castleHp: 15}, host: false, code: 'DROP01', typeId: 'hollow', deps, clock});
    await settle(hub); guest.setReady(true); await settle(hub); host.start(); await settle(hub);
    hub.drop('g'); await elapse(hub, clock, C.DROP_MS + 2500);
    ok(host.room.seats[1].connected === false, 'drop: the host marks the silent player away');
    const r0 = host.T.round; await elapse(hub, clock, 2000);
    ok(host.T.round > r0, `drop: the fight goes on, the CPU playing the away seat (round ${r0} -> ${host.T.round})`);
    ok(host.log.some(a=> a.seat === 1 && (a.kind === 'play' || a.kind === 'pass')), 'drop: the CPU acted for player 2');
    // cut off, player 2 heard nobody and hosted alone; back, the two hosts meet on the pings: the longer act log (the real host's) keeps the room
    hub.restore('g'); guest.rejoinHello(); await elapse(hub, clock, C.PING_MS * 2 + 600);
    ok(!guest.isHost && host.isHost, 'return: one host again (the one with the longer act log)');
    ok(guest.T && C.tableHash(guest.T) === C.tableHash(host.T), 'return: player 2 caught up from the act log (same table)');
    ok(host.room.seats[1].connected === true, 'return: back in the seat');
    // the host drops: seat 1 takes the room and goes on
    hub.drop('h'); await elapse(hub, clock, C.DROP_MS + 3000);
    ok(guest.isHost && guest.room.hostId === 'g', 'host gone: player 2 takes over the room');
    const r1 = guest.T.round; guest.claim({kind: 'pass'}); await elapse(hub, clock, 1500);
    ok(guest.T.round > r1 || guest.T.over, 'host gone: the new host runs the rounds (the CPU plays the old host\'s seat)');
    host.close(); guest.close();
  }

  // ---- 5b. out of step: a client whose table drifted stops at the next round's hash and rebuilds the floor from the host's act log
  {
    const hub = C.createHub({defer: fn=> setImmediate(fn)}), clock = fakeClock(), gev = [];
    const host = C.createSession({transport: hub.connect('h'), me: {peerId: 'h', name: 'H', deck: deckFrom(41), castleHp: 15}, host: true, code: 'SYNC01', typeId: 'hollow', deps, clock, seed: 5, autoPlay: 10});
    const guest = C.createSession({transport: hub.connect('g'), me: {peerId: 'g', name: 'G', deck: deckFrom(42), castleHp: 15}, host: false, code: 'SYNC01', typeId: 'hollow', deps, clock, autoPlay: 10, onEvent: (k)=> gev.push(k)});
    await settle(hub); guest.setReady(true); await settle(hub); host.start(); await settle(hub); await elapse(hub, clock, 1500);
    guest.T.players[2].hq.hp -= 3; // drift
    await elapse(hub, clock, 3000);
    ok(gev.includes('desync') && gev.includes('caughtUp'), 'desync: the drifted client noticed at the round\'s hash and caught up');
    ok(C.tableHash(guest.T) === C.tableHash(host.T) && guest.T.round === host.T.round, 'desync: in step again (same table as the host)');
    host.close(); guest.close();
  }

  // ---- 6. rewards, the raid's arithmetic
  ok(C.rankFor(30, 30, false) === 'SSS' && C.rankFor(30, 30, true) === 'SS' && C.rankFor(28, 30, false) === 'S' && C.rankFor(16, 30) === 'B' && C.rankFor(0, 30) === null, 'rank: the raid\'s fight rank (SSS unhurt no losses, SS unhurt, S 90%+ ... none when the bramble fell)');
  { const a = C.floorPay('hollow', 0, {dealt: 10, won: false, rank: 'B'}), b = C.floorPay('hollow', 0, {dealt: 10, won: true, rank: 'S'});
    ok(a.contribution === Math.round(500 * 1.01) && a.gold === Math.round(a.contribution / 48) && a.dust === 3 * Math.round(a.contribution / 190), `pay: bramble damage x 50, x the rank, paid at the raid's rates (${JSON.stringify(a)})`);
    ok(b.contribution === Math.round(2500 * 1.2), 'pay: a fallen vault bramble scores the overwhelm figure, x the rank');
    ok(C.floorPay('hollow', 3, {dealt: 0, won: true, rank: 'S'}).contribution > b.contribution, 'pay: deeper floors pay more'); }
  ok(C.cardPool('hollow', defs).length >= 5, 'card drop: drawn from the vault\'s own cards');

  // ---- 7. removed, and the page wiring
  const src = fs.readFileSync(path.join(ROOT, 'bramblewood-coop.js'), 'utf8');
  ok(!/PLAN_SECONDS|SHARED_COL|caveIn|MECH\b|bossPicks|resolveRound\(/.test(src), 'removed: the plan timer, the shared centre, the floor mechanics, the pick of three');
  const app = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
  ['function gdStartFloorMatch', "mode: 'coop'", 'if(matchState && matchState.coop) return gdClaimPlay(', "if(m.coop){ gdClaim({kind:'pitch', uid}); return; }", "if(m.coop){ gdClaim({kind:'pass'}); return; }", 'function gdApply', 'async function gdRoundOnPage', 'allyPlayFx(res.uid', 'function gdPayFloor', 'CoopM.rowLegalSlots(m.coop.T, r, m.coop.seat)' /* 2026-10-30 (COOP3): was rowLegalSlots(m.coop.T, r); the seat's own network now */]
    .forEach(s=> ok(app.includes(s), 'page: ' + s));
  ok(!/function gdFightHTML|gd-hand-card|data-gd-cell/.test(app), 'page: the old co-op board (its own overlay board, hand and cells) is gone');
  const texts = require(path.join(ROOT, 'bramblewood-texts.js')); const T0 = texts.TEXT || texts;
  const keys = (app.match(/TX\('ui\.coop2-[a-z0-9-]+'/g) || []).map(s=> s.slice(4, -1)).filter(k=> !k.endsWith('-')).concat(['ui.coop2-seat-0', 'ui.coop2-seat-1', 'ui.coop2-seat-short-0', 'ui.coop2-seat-short-1']);
  ok(keys.length >= 20 && keys.every(k=> T0[k]), 'texts: every COOP2 key is in bramblewood-texts.js (' + keys.filter(k=> !T0[k]).join(', ') + ')');
  ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'].forEach(code=>{ const pack = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', code + '.json'), 'utf8'));
    ok(keys.every(k=> pack[T0[k]]), `texts: the ${code} pack has every COOP2 line`); });
  const html = fs.existsSync(path.join(ROOT, 'index.html')) ? fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8') : '';
  ok(html.includes('root.BramblewoodCoop = api') && html.includes('function gdApply'), 'build: the module and the page code are in index.html');

  console.log(`coop2: ${pass} passed, ${fails.length} failed`);
  process.exit(fails.length ? 1 : 0);
})().catch(e=>{ console.error(e); process.exit(1); });
