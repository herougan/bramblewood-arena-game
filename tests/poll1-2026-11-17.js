#!/usr/bin/env node
// Package POLL1 (2026-11-17, owner OWN-1117-3: "If our game polls alot, remove that as well."). Guardrails for the page's recurring checks.
// Measure in a browser: python3 tests/e2e/poll_probe.py 20 [--net10]   (timers firing per minute and requests per screen; report docs/perf/poll1-2026-11-17.md)
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const app = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8'), fxb = fs.readFileSync(path.join(ROOT, 'bramblewood-fx-b.js'), 'utf8');
const code = app.replace(/\/\/.*$/gm, '');

// 1. limits: bare setInterval sites in arena_app.js (a new recurring check goes through bwLoop, which stops when the tab is hidden)
const bare = (code.match(/(^|[^a-zA-Z.])setInterval\(/gm) || []).length;
ok(bare <= 21, `1. at most 21 bare setInterval( sites in arena_app.js (now ${bare}; was 33 before POLL1); use bwLoop`);
const loops = (code.match(/\bbwLoop\(/g) || []).length;
ok(loops >= 15, `1. the always-on checks run through bwLoop (${loops} sites)`);

// 2. the always-on timers are gated: only with a match / only on the cave screen / none while hidden
const has = (re, m)=> ok(re.test(app), m);
has(/setInterval\(\(\)=>\{ try\{ autoplayStep\(\); \}catch\(e\)\{\} \}, 900\);/, '2. autoplay tick stays free-running (e5det: its phase reaches the raid fight)');
has(/setInterval\(\(\)=>\{ try\{ fightWatchdog\(\); \}catch\(e\)\{\} \}, 1000\);/, '2. fight watchdog stays free-running');
has(/setInterval\(\(\)=>\{ try\{ playAnimWatchdog\(\); \}catch\(e\)\{\} \}, 200\);/, '2. play-animation watchdog stays free-running (e5det)');
has(/bwLoop\(syncDungeonChip, 500, \(\)=> !!matchState\)/, '2. dungeon chip only with a match');
has(/bwLoop\(syncCaveScreen, 400, \(\)=> document\.body\.classList\.contains\('cave-screen'\)\)/, '2. cave screen sync only on the cave screen');
has(/bwLoop\(tick, 400,/, '2. calm music tick through bwLoop');
has(/bwLoop\(tick, 300,/, '2. songbook music tick through bwLoop');
ok(/bwLoop\(\(\)=> ui7Tick\(Date\.now\(\)\), 1000, \(\)=> typeof matchState !== 'undefined' && !!matchState\)/.test(fxb), '2. held-card struggle tick only with a match');

// 3. network checks: slower, event-driven first
has(/const VERSION_CHECK_MS = 20 \* 60e3;/, '3. version.json: at most every 20 minutes');
has(/window\.addEventListener\('focus', \(\)=>\{ if\(!document\.hidden\) checkGameVersion\(false\); \}\)/, '3. version check on focus');
has(/window\.addEventListener\('online', \(\)=> checkGameVersion\(false\)\)/, '3. version check when the network returns');
has(/const NET1_WORLD_MS = 15\*60\*1000;/, '3. raid-fall / world-event reads at most every 15 minutes');
has(/bwLoop\(pollCloudOverrides, NET1_OVR_POLL_PLAYER_MS\)/, '3. card_overrides: players every 5 minutes, no 30 s timer');
has(/bwLoop\(pollCloudOverrides, 30000, \(\)=> cloudCardAdmin, 60000\)/, '3. card_overrides: the 30 s cadence only for an admin');
has(/Social\.heartbeat = bwLoop\(beat, 120000\)/, '3. presence heartbeat through bwLoop');
has(/Social\.heartbeat\.stop\(\)/, '3. sign-out stops the heartbeat loop');

// 4. bwLoop behaviour (fake timers and document)
const src = app.match(/const BW_LOOPS = \[\], BW_SLEEP[\s\S]*?function bwLoopWake\(wasHidden\)\{[^\n]*\}/)[0];
const timers = new Map(); let nextId = 1, now = 0;
const doc = {hidden: false};
const ctx = {document: doc, Date: {now: ()=> now}, Array, setInterval: (f, ms)=>{ const id = nextId++; timers.set(id, {f, ms, at: now + ms}); return id; }, clearInterval: id=> timers.delete(id)};
vm.createContext(ctx); vm.runInContext(src + '\nthis.bwLoop = bwLoop; this.bwLoopWake = bwLoopWake;', ctx);
const advance = ms=>{ const end = now + ms; for(;;){ let best = null, bid = 0; timers.forEach((t, id)=>{ if(t.at <= end && (!best || t.at < best.at)){ best = t; bid = id; } }); if(!best) break; now = best.at; best.at += best.ms; best.f(); } now = end; };
let fires = 0, gate = false;
const L = ctx.bwLoop(()=>{ fires++; }, 100, ()=> gate);
const L2 = ctx.bwLoop(()=>{}, 100, ()=> false), L3 = ctx.bwLoop(()=>{}, 100, ()=> false);
advance(10000); ok(fires === 0, `4. gate closed: fn never runs (${fires})`);
ok(timers.size === 1 && [...timers.values()][0].ms === 2000, `4. gate closed: three sleeping loops share ONE 2 s timer (${timers.size} timers)`);
gate = true; advance(2000); ok(fires >= 1, '4. the slow look finds the gate open and starts the loop');
fires = 0; advance(1000); ok(fires === 10, `4. gate open: runs on its rhythm (${fires} in 1 s)`);
doc.hidden = true; ctx.bwLoopWake(true); ok(timers.size === 0, `4. hidden: no timer at all (${timers.size})`);
fires = 0; advance(60000); ok(fires === 0, '4. hidden: nothing fires');
doc.hidden = false; ctx.bwLoopWake(true); ok(fires === 1, '4. visible again: runs once at once');
gate = false; advance(200); ok(![...timers.values()].some(t=> t.ms === 100), '4. the gate closing puts it back to sleep (no 100 ms timer left)');
gate = true; L.wake(false); fires = 0; advance(100); ok(fires === 1, '4. wake() restarts it at once');
L2.stop(); L3.stop(); L.stop(); ok(timers.size === 0, '4. stop() removes the timer'); L.wake(false); ok(timers.size === 0, '4. a stopped loop stays stopped');
let thrown = 0; const T = ctx.bwLoop(()=>{ thrown++; throw new Error('x'); }, 50); advance(200); ok(thrown >= 3, '4. a throwing fn does not stop the loop'); T.stop();

console.log(`poll1-2026-11-17: ${n - fail}/${n} checks passed`); process.exit(fail ? 1 : 0);
