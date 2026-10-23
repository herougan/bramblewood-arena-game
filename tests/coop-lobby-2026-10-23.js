#!/usr/bin/env node
// The Group Dungeon's room over the mock relay (2026-10-23, package AR3).
//
//   node tests/coop-lobby-2026-10-23.js
//
// Each player is its own VM context running tests/e2e/mock-relay.js (the stand-in Supabase client the two-page tests use), and the room
// talks through bramblewood-coop.js's supabaseTransport: the same code path as a live room, Realtime broadcasts relayed context to
// context by this script. Checks: opening a room; three players join with the code and take C, D, B (the 3rd opens the right half); a
// 5th is turned away; ready-up gates Start; a player who leaves the lobby frees the seat and can come back; the host leaving the lobby
// hands the room to C; the new host starts; the start and the first rounds reach everyone in step; a player who drops mid-fight is
// marked away and played by the CPU, and is let back in.
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

// one browser-like context per player; the relay hands each broadcast to every other context, asynchronously
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
async function elapse(ms){ for(let x = 0; x < ms; x += 250){ advance(Math.min(250, ms - x)); await settle(3); } }
const deps = {makeSimEngine: H.Engine.makeSimEngine, defs, defsHash: C.defsHash(defs, Object.keys(defs))};
function session(id, host, code, extra){ const sb = newPlayer(id); const events = [];
  const s = C.createSession(Object.assign({transport: C.supabaseTransport(sb, code), me: {peerId: id, name: id, deck: deckFrom(id.length * 7 + id.charCodeAt(0)), castleHp: 20}, host, code, deps, clock, seed: 2026, onEvent: (k, d)=> events.push(k)}, extra || {}));
  s._events = events; return s; }

(async ()=>{
  const code = C.newRoomCode(H.seededRng(9));
  ok(/^[A-Z0-9]{6}$/.test(code) && !/[O0I1]/.test(code), `room code: 6 letters / digits, no look-alikes (${code}), as coop_rooms' check`);
  const host = session('hazel', true, code);
  ok(host.room && host.room.seats.A && host.room.hostId === 'hazel' && host.room.status === 'lobby', 'open: the host sits in A');
  const pip = session('pip', false, code); await settle();
  const mia = session('mia', false, code); await settle();
  const tom = session('tom', false, code); await settle();
  const seatOf = s=> s.mySeat();
  ok(seatOf(pip) === 'C' && seatOf(mia) === 'D' && seatOf(tom) === 'B', `join: players take C, D, B in turn (${seatOf(pip)}, ${seatOf(mia)}, ${seatOf(tom)})`);
  ok(host.room.size === 4 && pip.room.size === 4, 'join: the 3rd player opens the 4-seat board');
  ok([pip, mia, tom].every(p=> p.room && p.room.hostId === 'hazel'), 'join: everyone has the host\'s roster');
  const late = session('zed', false, code); await settle();
  ok(late._events.includes('full') && !late.mySeat(), 'join: a 5th player is turned away (room full)');
  late.close(); contexts.delete('zed');
  ok(!host.canStart(), 'ready: no Start until everyone is ready');
  [pip, mia].forEach(p=> p.setReady(true)); await settle();
  ok(!host.canStart(), 'ready: still one player not ready');
  tom.setReady(true); await settle();
  ok(host.canStart(), 'ready: everyone ready -> Start');
  // leave and come back (lobby)
  tom.leave(); contexts.delete('tom'); await settle();
  ok(!host.room.seats.B && !mia.room.seats.B, 'leave: B is free again on every roster');
  const tom2 = session('tom', false, code); tom2.setReady(true); await settle(); // Ready pressed before the roster came back: sent once it does
  ok(seatOf(tom2) === 'B' && host.room.seats.B.ready, 'rejoin: back in B; a Ready pressed before the seat was known still counts');
  // the host leaves the lobby: C takes the room
  host.leave(); contexts.delete('hazel'); await settle();
  ok(pip.isHost && pip.room.hostId === 'pip' && mia.room.hostId === 'pip' && tom2.room.hostId === 'pip', 'host leaves the lobby: C (pip) is the host on every roster');
  ok(!pip.room.seats.A, 'host leaves the lobby: their seat is freed');
  ok(pip.canStart(), 'the new host can start (everyone else ready)');
  // start, then play through the relay with every player planning by the CPU logic for its own seat
  [pip, mia, tom2].forEach(p=>{ p._auto = true; });
  ok(pip.start(), 'start: the new host starts the climb'); await settle();
  ok([mia, tom2].every(p=> p.mode === 'lockstep' && p.view && p.view.floorIdx === 0), 'start: the start reached everyone; each runs the floor in step');
  ok(pip.run.seats.find(s=> s.seat === 'A').cpu, 'start: the empty seat A is a CPU ally');
  const plan = p=>{ const seat = p.mySeat(); if(!p.run || !p.run.fl || p.run.fl.over || p.locked[seat]) return; const c = C.cpuPlan(p.run, seat, 3); p.submitPlan({pitch: c.pitch != null ? c.pitch : null, play: c.play || null}); };
  for(let r = 0; r < 4; r++){ [pip, mia, tom2].forEach(plan); await settle(); }
  const h = pip.history;
  ok(h.length >= 4, `rounds: ${h.length} resolved through the relay`);
  ok([mia, tom2].every(p=> p.history.length === h.length && p.history.every((x, i)=> x.hash === h[i].hash)), 'rounds: every player\'s state matches the host\'s after every round');
  // a player drops mid-fight: marked away after 8 s, the CPU plays their seat; they come back and catch up
  const before = pip.history.length; dropped.add("tom");
  plan(pip); plan(mia); await settle();
  await elapse(C.DROP_MS + 2 * C.PING_MS); await settle();
  ok(pip.room.seats.B.connected === false, 'drop: the silent player is marked away');
  const lastPlans = pip.history.length;
  ok(lastPlans > before, 'drop: the round resolved without them (their seat on the CPU plan)');
  dropped.delete('tom'); tom2.rejoinHello(); await settle(12);
  ok(pip.room.seats.B.connected === true && tom2.mode === 'mirror' && C.hashView(tom2.view) === C.hashView(pip.view), 'reconnect: back, mirroring the host\'s state');
  [pip, mia, tom2].forEach(p=> p.close());
  console.log(`coop-lobby: ${pass} passed, ${fails.length} failed`);
  process.exit(fails.length ? 1 : 0);
})().catch(e=>{ console.error(e); process.exit(1); });
