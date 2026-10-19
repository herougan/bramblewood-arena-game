#!/usr/bin/env node
// 2026-10-19 (package CX, owner 14:07: "Pale Desert - the sand sfx plays here and there, but not permanently on"): the Pale Desert's
// sand sound is gusts now, not a loop.
//   1. each gust: 2-4 s long, 8-20 s of quiet after it, its gain and pitch varied (sandGustPlan)
//   2. the loop keeps booking gusts for as long as the scene lives (an hour of fake time), the first one within a few seconds
//   3. it stops when the scene is retired (leaving the map): nothing more plays, nothing more is booked, the timers list stays small
//   4. muted (SFX 0) a gust is skipped but the next is still booked; the SFX level scales the gain
//   5. the wiring: the Pale Desert's flavour has its own quiet bed (not the plains' shimmer), gusts and no night crickets; build()
//      starts the loop; a fight on the Pale Desert keeps the map's flavour (not under rain); the old 25-45 s hiss is gone
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const fnSrc = name=>{ const i = src.indexOf(`\nfunction ${name}(`); if(i < 0) return ''; let d = 0, j = src.indexOf('{', i); for(let k = j; k < src.length; k++){ const ch = src[k]; if(ch === '{') d++; else if(ch === '}'){ d--; if(!d) return src.slice(i, k + 1); } } return ''; };
const constSrc = name=> (src.match(new RegExp(`\\nconst ${name} = [^\\n]*`)) || [''])[0];
const ctx = {Math};
vm.createContext(ctx);
vm.runInContext(constSrc('SAND_GUST') + '\n' + fnSrc('sandGustPlan') + '\n' + fnSrc('sandGustLoop') + '\n;this.R = {SAND_GUST, sandGustPlan, sandGustLoop};', ctx);
const {SAND_GUST, sandGustPlan, sandGustLoop} = ctx.R;
ok(SAND_GUST && typeof sandGustPlan === 'function' && typeof sandGustLoop === 'function', 'the gust scheduler is there');

// a seeded random, and a fake clock
let seed = 7; const rand = ()=>{ seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
function clock(){ let now = 0, id = 0; const q = new Map();
  return {now: ()=> now, setTimeout: (f, ms)=>{ const k = ++id; q.set(k, {at: now + ms, f}); return k; }, clear: k=> q.delete(k), pending: ()=> q.size,
    run(until){ for(;;){ let best = null; for(const [k, v] of q) if(v.at <= until && (!best || v.at < best[1].at)) best = [k, v]; if(!best) break; q.delete(best[0]); now = best[1].at; best[1].f(); } now = until; } }; }

// ---- 1. one gust
{ const ps = Array.from({length:2000}, ()=> sandGustPlan(rand));
  ok(ps.every(p=> p.dur >= 2 && p.dur <= 4), '1. every gust lasts 2-4 s');
  ok(ps.every(p=> p.gap >= 8 && p.gap <= 20), '1. 8-20 s of quiet after each');
  const gains = ps.map(p=> p.gain), rates = ps.map(p=> p.rate);
  ok(Math.min(...gains) > 0 && Math.max(...gains) / Math.min(...gains) > 1.4, `1. the loudness varies (${Math.min(...gains).toFixed(3)}-${Math.max(...gains).toFixed(3)})`);
  ok(Math.min(...rates) < 0.9 && Math.max(...rates) > 1.1, `1. so does the pitch (${Math.min(...rates).toFixed(2)}-${Math.max(...rates).toFixed(2)})`);
  ok(ps.some(p=> p.pan < -0.3) && ps.some(p=> p.pan > 0.3), '1. and the side it comes from');
}

// ---- 2-4. the loop
{ const C = clock(), sc = {alive:true, timers:[]}, played = []; let sfx = 1;
  sandGustLoop(sc, {setTimeout: C.setTimeout, rand, play: p=> played.push({t: C.now() / 1000, p}), sfx: ()=> sfx});
  C.run(4000);
  ok(played.length === 1 && played[0].t >= SAND_GUST.firstMin && played[0].t <= SAND_GUST.firstMax, `2. the first gust comes within ${SAND_GUST.firstMin}-${SAND_GUST.firstMax} s (${played[0] && played[0].t.toFixed(1)} s)`);
  C.run(3600 * 1000);
  const quiet = played.slice(1).map((g, i)=> g.t - (played[i].t + played[i].p.dur));
  ok(played.length >= 3600 / 24 && played.length <= 3600 / 10 + 1, `2. gusts keep coming for an hour (${played.length}, every ${(3600 / played.length).toFixed(1)} s on average)`);
  ok(quiet.every(q=> q >= 8 - 1e-6 && q <= 20 + 1e-6), `2. the quiet between two gusts is always 8-20 s (${Math.min(...quiet).toFixed(1)}-${Math.max(...quiet).toFixed(1)})`);
  ok(played.every(g=> g.p.dur >= 2 && g.p.dur <= 4), '2. never a constant sound: each gust ends after 2-4 s');
  ok(C.pending() === 1 && sc.timers.length === 1, `2. one gust booked at a time, the scene's timers list stays small (${sc.timers.length})`);
  // muted
  const before = played.length; sfx = 0; C.run(3600 * 1000 + 120 * 1000);
  ok(played.length === before && C.pending() === 1, '4. muted: no gust plays, but the next is still booked');
  sfx = 0.5; C.run(3600 * 1000 + 240 * 1000);
  ok(played.length > before && played.slice(before).every(g=> g.p.gain <= SAND_GUST.gainMax * 0.5 + 1e-9), '4. un-muted at 50%: they come back, at half the gain');
  // leaving
  const n0 = played.length; sc.alive = false; sc.timers.forEach(C.clear); sc.timers = [];
  C.run(3600 * 1000 * 2);
  ok(played.length === n0 && C.pending() === 0, '3. leaving the map (the scene retired): no more gusts, nothing booked');
  // a scene retired by its flag alone (a timer already in flight) books nothing more either
  const C2 = clock(), sc2 = {alive:true, timers:[]}, p2 = [];
  sandGustLoop(sc2, {setTimeout: C2.setTimeout, rand, play: p=> p2.push(p), sfx: ()=> 1}); C2.run(60 * 1000); const k = p2.length; sc2.alive = false; C2.run(600 * 1000);
  ok(k >= 2 && p2.length === k && C2.pending() === 0, '3. once not alive, the timer in flight ends the loop');
}

// ---- 5. the wiring
{ const fl = (src.match(/\n\s+mpd:\{arrive:[^\n]*/) || [''])[0];
  ok(/gusts:true/.test(fl) && /noNight:true/.test(fl) && /beds:\[\{freq:240, gain:0\.022/.test(fl) && /bedsKind:4/.test(fl), '5. the Pale Desert has gusts, its own quiet bed and no night crickets');
  ok(!/\[hiss, 25, 45\]/.test(fl) && /arrive:\[\]/.test(fl), '5. the old 25-45 s hiss (map view only) is gone');
  ok(/beds: fl\.beds && \(fl\.bedsKind == null \|\| fl\.bedsKind === kind\) \? fl\.beds : r0\.beds/.test(src), '5. build() uses a flavour\'s own beds (not under rain)');
  ok(/if\(fl && fl\.gusts && \(fl\.bedsKind == null \|\| fl\.bedsKind === kind\)\) sandGustLoop\(sc, \{/.test(src), '5. build() starts the gust loop for the scene');
  ok(/SoundKit\.getSfxVolume \? SoundKit\.getSfxVolume\(\) : 1/.test(src) && /if\(document\.hidden \|\| vol <= 0\) return 0;/.test(src), '5. the gusts follow the SFX volume and mute, and go quiet in a hidden tab');
  ok(/if\(tod==='night' && !\(fl && fl\.noNight\)\)\{ bed\(sc, CRICKET\); \}/.test(src), '5. no cricket bed on a still-air map');
  ok(/Ambience\.play\(ambienceKindForMatch\(matchState\), ambienceFlavorForMatch\(matchState\)\)/.test(src), '5. a fight passes its map\'s flavour');
  const F = (()=>{ const c = {BramblewoodShaders: {MAP_KIND: {mpd: 4, m1: 4}}, loadAtmosphere: ()=> c.atm, matchIsRainy: ()=> false, atm: 'clear'}; vm.createContext(c);
    vm.runInContext(constSrc('MATCH_AMBIENCE_FLAVOR') + '\n' + fnSrc('ambienceKindForMatch') + '\n' + fnSrc('ambienceFlavorForMatch') + '\n;this.F = ambienceFlavorForMatch;', c); return c; })();
  ok(F.F({conquestNode:{mapId:'mpd'}}) === 'mpd' && F.F({conquestNode:{mapId:'m1'}}) === null && F.F({}) == null, '5. a fight on the Pale Desert keeps its flavour; other maps\' fights don\'t change');
  F.atm = 'rain'; ok(F.F({conquestNode:{mapId:'mpd'}}) === null, '5. ... not under rain');
  ok(/const sandGust = \(sc, p\)=>/.test(src) && /g\.gain\.setValueAtTime\(0, t\); g\.gain\.linearRampToValueAtTime\(peak, t \+ d \* 0\.4\)/.test(src) && /g\.gain\.linearRampToValueAtTime\(0, t \+ d\)/.test(src) && /src\.stop\(t \+ d \+ 0\.1\)/.test(src), '5. each gust fades in and out and stops (no loop left running)');
}

console.log(`sand-gusts: ${fail ? fail + ' failure(s)' : 'all passed'} (${n} checks)`);
process.exit(fail ? 1 : 0);
