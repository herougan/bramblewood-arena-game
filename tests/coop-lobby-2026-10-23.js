#!/usr/bin/env node
// The Group Dungeon's room over the mock relay (2026-10-23, package AR3; rewritten 2026-10-28, package COOP2).
//
//   node tests/coop-lobby-2026-10-23.js
//
// Each player is its own VM context running tests/e2e/mock-relay.js (the stand-in Supabase client the two-page tests use), and the room
// talks through bramblewood-coop.js's supabaseTransport: the same code path as a live room, Realtime broadcasts relayed context to
// context by this script (each delivery on its own tick, so messages from two players can cross).
// 2026-10-28 (COOP2): the vault is a 2-player type, so a room has exactly 2 seats (0 = player 1, the host; 1 = player 2); seats C / D / B,
// the 4-seat toggle and the plan rounds are gone. Checks: open a room; a friend joins with the code into seat 1; a 3rd is turned away;
// ready gates Start; leave and come back in the lobby; the host leaving the lobby hands the room to seat 1; start; the race over the
// relay (both claim one slot -> player 1's lands, player 2's comes back); rounds in step; a drop played by the CPU and a return.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const H = require('./lib/harness.js');
const C = require(path.join(H.ROOT, 'bramblewood-coop.js'));
const RELAY = fs.readFileSync(path.join(H.ROOT, 'tests', 'e2e', 'mock-relay.js'), 'utf8');
const defs = H.loadCardDefs(), ids = H.fieldableIds(defs);
const pool = ids.filter(id=> ['common', 'uncommon'].includes(defs[id].rarity) && (defs[id].cost || 0) <= 2 && defs[id].attack != null && !defs[id].cardType);
function deckFrom(seed){ const r = H.seededRng(seed); const d = {}; let n = 0; while(n < 20){ const id = pool[Math.floor(r() * pool.length)]; if((d[id] || 0) >= 3) continue; d[id] = (d[id] || 0) + 1; n++; } return d; }
let pass = 0; const fails = [];
function ok(cond, msg){ if(cond) pass++; else { fails.push(msg); console.log('  ✗ ' + msg); } }

const contexts = new Map(), dropped = new Set();
function newPlayer(id){
  const ctx = {window: {}, console, JSON, Promise, setTimeout}; vm.createContext(ctx); vm.runInContext(RELAY, ctx);
  ctx.window.__relaySend = (channel, event, payload)=>{ if(dropped.has(id)) return; contexts.forEach((c, other)=>{ if(other === id || dropped.has(other)) return; setImmediate(()=> c.window.__relayDeliver && c.window.__relayDeliver(channel, event, JSON.parse(JSON.stringify(payload)))); }); };
  contexts.set(id, ctx);
  return ctx.window.__mkRelayClient(id, []);
}
let t = 5e6; const timers = new Map(); let seq = 0;
const clock = {now: ()=> t, setTimeout(fn, ms){ const k = ++seq; timers.set(k, {at: t + ms, fn}); return k; }, clearTimeout(k){ timers.delete(k); },
  setInterval(fn, ms){ const k = ++seq; timers.set(k, {at: t + ms, fn, every: ms}); return k; }, clearInterval(k){ timers.delete(k); }};
function advance(ms){ const end = t + ms; for(;;){ let nx = null; timers.forEach((v, k)=>{ if(v.at <= end && (!nx || v.at < nx[1].at)) nx = [k, v]; }); if(!nx) break; t = nx[1].at; if(nx[1].every) nx[1].at += nx[1].every; else timers.delete(nx[0]); nx[1].fn(); } t = end; }
const io = ()=> new Promise(r=> setImmediate(r));
async function settle(n){ for(let i = 0; i < (n || 8); i++) await io(); }
async function elapse(ms){ for(let x = 0; x < ms; x += 50){ advance(Math.min(50, ms - x)); await settle(3); } }
const deps = {makeSimEngine: H.Engine.makeSimEngine, defs, defsHash: C.defsHash(defs, Object.keys(defs))};
function session(id, host, code, extra){ const sb = newPlayer(id); const events = [];
  const s = C.createSession(Object.assign({transport: C.supabaseTransport(sb, code), me: {peerId: id, name: id, deck: deckFrom(id.length * 7 + id.charCodeAt(0)), castleHp: 15}, host, code, typeId: 'hollow', deps, clock, seed: 2026, onEvent: (k, d)=> events.push([k, d])}, extra || {}));
  s._events = events; return s; }

(async ()=>{
  const code = C.newRoomCode(H.seededRng(9));
  ok(/^[A-Z0-9]{6}$/.test(code) && !/[O0I1]/.test(code), `room code: 6 letters / digits, no look-alikes (${code}), as coop_rooms' check`);
  const host = session('hazel', true, code);
  ok(host.room && host.room.seats.length === 2 && host.room.seats[0].peerId === 'hazel' && host.room.status === 'lobby', 'open: two seats (the vault\'s count); the host is player 1');
  const pip = session('pip', false, code); await settle();
  ok(pip.mySeat() === 1 && pip.room.hostId === 'hazel', 'join: the friend takes seat 1 (player 2)');
  const late = session('zed', false, code); await settle();
  ok(late._events.some(([k])=> k === 'full') && late.mySeat() == null, 'join: a 3rd player is turned away (the type has 2 seats)');
  late.close(); contexts.delete('zed');
  ok(!host.canStart(), 'ready: no Start until player 2 is ready');
  pip.leave(); contexts.delete('pip'); await settle();
  ok(!host.room.seats[1], 'leave: seat 1 is free again');
  const pip2 = session('pip', false, code); pip2.setReady(true); await settle(); // Ready pressed before the roster came back: sent once it does
  ok(pip2.mySeat() === 1 && host.room.seats[1].ready && host.canStart(), 'rejoin: back in seat 1; a Ready pressed early still counts; Start opens');
  // the host leaves the lobby: player 2 takes the room, and its seat 0 is free (a CPU ally at Start)
  host.leave(); contexts.delete('hazel'); await settle();
  ok(pip2.isHost && pip2.room.hostId === 'pip' && !pip2.room.seats[0], 'host leaves the lobby: player 2 hosts; seat 0 is free');
  ok(pip2.start(), 'start: the new host starts alone'); await settle();
  ok(pip2.room.seats[0].cpu && pip2.T && pip2.T.seats[0].cpu, 'start: the empty seat is a CPU ally');
  pip2.close(); contexts.clear();

  // a fresh room of two: the race over the relay, rounds in step, a drop
  const a = session('ana', true, 'RELAY2'), b = session('ben', false, 'RELAY2'); await settle();
  b.setReady(true); await settle(); a.start(); await settle(); await elapse(100);
  ok(a.T && b.T && C.tableHash(a.T) === C.tableHash(b.T), 'start: both built the same table');
  const slot = C.rowLegalSlots(b.T, 1)[0], hb = C.seatData(b.T, 1).hand[0], ha = C.seatData(a.T, 0).hand.find(h=> (defs[h.defId].cost || 0) === 0);
  b.claim({kind: 'play', uid: hb.uid, row: 1, slot}); a.claim({kind: 'play', uid: ha.uid, row: 1, slot}); // the same moment, player 2's sent first
  await elapse(400);
  const u = C.unitAt(a.T, 1, slot);
  ok(u && u.coopSeat === 0 && C.unitAt(b.T, 1, slot) && C.unitAt(b.T, 1, slot).uid === u.uid, 'race: player 1 (the lower index) lands the slot on both screens');
  ok(b._events.some(([k, d])=> k === 'reject' && d.by === 0) && C.seatData(b.T, 1).hand.some(h=> h.uid === hb.uid), 'race: player 2 is told, its card is back in hand');
  for(let r = 0; r < 4; r++){
    [a, b].forEach(p=>{ const s = p.mySeat(); if(C.seatDone(p.T, s)) return; const x = C.cpuChoice(p.T, s); if(x) p.claim(x.kind === 'pass' ? {kind: 'pass'} : x.kind === 'pitch' ? {kind: 'pitch', uid: x.uid} : {kind: 'play', uid: x.uid, row: x.row, slot: x.slot}); });
    await elapse(500);
  }
  ok(a.T.round >= 3 && a.T.round === b.T.round && C.tableHash(a.T) === C.tableHash(b.T) && !a.desyncs && !b.desyncs, `rounds: in step through the relay (round ${a.T.round}, no desync)`);
  dropped.add('ben'); const r0 = a.T.round;
  for(let k = 0; k < 8; k++){ const s = a.mySeat(); if(!C.seatDone(a.T, s)) a.claim({kind: 'pass'}); await elapse(1500); }
  ok(a.room.seats[1].connected === false && a.T.round > r0, 'drop: player 2 is marked away and the CPU plays its seat; the rounds go on');
  dropped.delete('ben'); b.rejoinHello(); await elapse(C.PING_MS * 2 + 800);
  ok(a.isHost && !b.isHost && a.room.seats[1].connected === true && C.tableHash(b.T) === C.tableHash(a.T), 'return: player 2 is back and caught up from the act log');
  [a, b].forEach(p=> p.close());
  console.log(`coop-lobby: ${pass} passed, ${fails.length} failed`);
  process.exit(fails.length ? 1 : 0);
})().catch(e=>{ console.error(e); process.exit(1); });
