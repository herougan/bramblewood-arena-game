#!/usr/bin/env node
// 2026-10-19 (package RX, owner 20:45-20:49): the raid's closest-row targeting, both directions (the bramble only when no row in the
// column holds a unit that can be hit), dead middle / back-row units swept out; the play-animation watchdog; the allies' hand-play
// animation hook (raid and tag-team); the play-rows setting; the raid's leader cost cap; the full raid built from the part's fight
// bramble with the raid's tuning knobs; the raid easing down to your hand.
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine;
const B = require('../tools/lib_bramble.js');
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:4, health:500, wait:0, cost:0, effects: effects || {}}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'rx-hit': U('rx-hit', {}, {attack:4}), 'rx-wall': U('rx-wall', {}, {attack:0}), 'rx-frail': U('rx-frail', {}, {attack:0, health:1}),
  'rx-ghost': U('rx-ghost', {invisible:3}, {attack:0}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(opts){ const e = E.makeSimEngine(defs, E.mulberry32(5), Object.assign({recordEvents:true, battleMode:'open', reserveRows:2, reserveActs:true}, opts || {}));
  return {e, P:{1:e.newPlayer(1, {}, {health:200}), 2:e.newPlayer(2, {}, {health:200})}}; }
function put(e, P, pid, id, slot){ e.debugSpawnCard(P, so, pid, id, 'left', {}, []);
  const pl = P[pid], c = all(pl).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot;
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncSlots(pl); return c; }
const src = fs.readFileSync(path.join(__dirname, '..', 'arena_app.js'), 'utf8');
const tpl = fs.readFileSync(path.join(__dirname, '..', 'arena_template.html'), 'utf8');
const raids = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'canonical', 'raids.json'), 'utf8'));
const texts = require('../bramblewood-texts.js');

// ---- Your front row: an empty enemy front column sends the swing to the middle row's unit there, then the back row's, then the bramble
{ const {e, P} = mk(); const me = put(e, P, 1, 'rx-hit', 0); put(e, P, 2, 'rx-wall', 1); // something on the boss's front, not in column 0
  const mid = e.fillReserve(P[2], 1, 0, 'rx-wall'), h = P[2].hq.hp; const ev = []; e.resolveCombat(P, so, {}, ev, 1);
  ok(mid.hp === 496 && P[2].hq.hp === h, `front swing into an empty column hits the boss's middle-row unit there (${500 - mid.hp}, bramble -${h - P[2].hq.hp})`);
  ok(ev.some(x=> x.type === 'hit' && x.attUid === me.uid && x.targetUid === mid.uid), 'the hit event names the middle-row unit'); }
{ const {e, P} = mk(); put(e, P, 1, 'rx-hit', 0); put(e, P, 2, 'rx-wall', 1); const back = e.fillReserve(P[2], 2, 0, 'rx-wall'), h = P[2].hq.hp;
  e.resolveCombat(P, so, {}, [], 1); ok(back.hp === 496 && P[2].hq.hp === h, `no front or middle unit there: the back row's unit takes it (${500 - back.hp})`); }
{ const {e, P} = mk(); put(e, P, 1, 'rx-hit', 0); put(e, P, 2, 'rx-wall', 1); e.fillReserve(P[2], 1, 1, 'rx-wall'); const h = P[2].hq.hp;
  e.resolveCombat(P, so, {}, [], 1); ok(P[2].hq.hp === h - 4, `nothing in any row of its column: the bramble (${h - P[2].hq.hp})`); }
{ const {e, P} = mk(); put(e, P, 1, 'rx-hit', 0); const f = put(e, P, 2, 'rx-wall', 0), mid = e.fillReserve(P[2], 1, 0, 'rx-wall');
  e.resolveCombat(P, so, {}, [], 1); ok(f.hp === 496 && mid.hp === 500, 'a front-row unit in the column is hit first'); }
// ---- The boss attacks your rows the same way
{ const {e, P} = mk(); put(e, P, 1, 'rx-wall', 1); const ally = e.fillReserve(P[1], 1, 0, 'rx-wall'); put(e, P, 2, 'rx-hit', 0); const h = P[1].hq.hp;
  e.resolveCombat(P, so, {}, [], 1); ok(ally.hp === 496 && P[1].hq.hp === h, `a boss front unit facing your empty column hits your ally's middle-row unit (${500 - ally.hp}, bramble -${h - P[1].hq.hp})`); }
// ---- Reserve units: their half-Attack strike finds the closest row too, both sides
{ const {e, P} = mk(); put(e, P, 1, 'rx-wall', 1); e.fillReserve(P[1], 1, 1, 'rx-hit'); put(e, P, 2, 'rx-wall', 0); const back = e.fillReserve(P[2], 2, 1, 'rx-wall'), h = P[2].hq.hp;
  const ev = []; e.resolveCombat(P, so, {}, ev, 1);
  ok(back.hp === 498 && P[2].hq.hp === h, `your middle-row unit strikes the boss's back-row unit in its column (${500 - back.hp})`);
  ok(ev.some(x=> x.field === 'volleyHit' && x.targetRow === 2), 'its volleyHit names the row it struck (targetRow 2)'); }
{ const {e, P} = mk(); put(e, P, 1, 'rx-wall', 0); const mine = e.fillReserve(P[1], 2, 2, 'rx-wall'); put(e, P, 2, 'rx-wall', 2); e.fillReserve(P[2], 1, 2, 'rx-hit');
  put(e, P, 1, 'rx-wall', 1); const myFront2 = put(e, P, 1, 'rx-wall', 2);
  e.resolveCombat(P, so, {}, [], 1); ok(myFront2.hp === 498 && mine.hp === 500, 'a boss middle-row unit strikes your front unit in its column before your back row'); }
{ const {e, P} = mk(); put(e, P, 1, 'rx-wall', 0); e.fillReserve(P[1], 1, 0, 'rx-hit'); const h = P[2].hq.hp; put(e, P, 2, 'rx-wall', 1);
  e.resolveCombat(P, so, {}, [], 1); ok(P[2].hq.hp === h - 2, `a reserve strike with no enemy in any row of its column hits the bramble (${h - P[2].hq.hp})`); }
// ---- A unit it can't hit is passed over: an Invisible front unit lets the strike through to the middle row
{ const {e, P} = mk(); put(e, P, 1, 'rx-wall', 0); e.fillReserve(P[1], 1, 0, 'rx-hit'); const gh = put(e, P, 2, 'rx-ghost', 0), mid = e.fillReserve(P[2], 1, 0, 'rx-wall');
  e.resolveCombat(P, so, {}, [], 1); ok(gh.hp === 500 && mid.hp === 498, `an Invisible front unit is passed over: the middle row is struck (${500 - gh.hp}, ${500 - mid.hp})`); }
// ---- A middle-row unit that falls is swept out of its row with a death event
{ const {e, P} = mk(); put(e, P, 1, 'rx-hit', 0); put(e, P, 2, 'rx-wall', 1); const fr = e.fillReserve(P[2], 1, 0, 'rx-frail');
  const ev = []; e.resolveCombat(P, so, {}, ev, 1);
  ok(!P[2].reserve[0][0] && fr.hp <= 0, 'the dead middle-row unit is gone from its row');
  ok(ev.some(x=> x.type === 'death' && x.uid === fr.uid && x.reserve), 'a death event for it (reserve:true)'); }
// ---- Not a raid (no reserveActs): an empty facing column still goes to the bramble, rows behind untouched
{ const {e, P} = mk({reserveActs:false}); put(e, P, 1, 'rx-hit', 0); put(e, P, 2, 'rx-wall', 1); const mid = e.fillReserve(P[2], 1, 0, 'rx-wall'), h = P[2].hq.hp;
  e.resolveCombat(P, so, {}, [], 1); ok(mid.hp === 500 && P[2].hq.hp === h - 4, 'without reserveActs the old rule stands (bramble hit, middle row untouched)'); }
{ const {e, P} = mk({reserveRows:0, reserveActs:false}); put(e, P, 1, 'rx-hit', 0); const h = P[2].hq.hp; e.resolveCombat(P, so, {}, [], 1);
  ok(P[2].hq.hp === h - 4, 'a plain Open battle: unchanged'); }

// ---- The page's raid functions, evaluated as tools/raid_full_sim.js does
const sim = require('../tools/raid_full_sim.js'), A = sim.A;
const goliath = raids[0];
ok(goliath.leaderCostCap === 5, `the Goliath caps its leader at 5 points (${goliath.leaderCostCap})`);
ok(goliath.tuning && goliath.tuning.alliesPerTurn === 2 && goliath.tuning.bossAtkPct > 0 && goliath.tuning.bossHpPct > 0, 'the Goliath carries its tuning knobs');
{ const RaidM = require('../bramblewood-raid.js'); const st = RaidM.raidState(goliath, [], 0, {cycle:0}), f = RaidM.fightFor(goliath, st, 'left', {});
  const allies = [0, 1].map(i=> A.raidAllyOf({name:'A' + i, deck: goliath.allyDecks[i].deck, level:0}, i));
  const b = A.buildRaidFullFight(goliath, 'left', f, st, {rng: E.mulberry32(3), allies, myCastle:{id:'castle', health:30}, myDeck:{'otter-guard':10}, recordEvents:false, rand: E.mulberry32(4)});
  ok(b.players[2].hq.hp === f.castleHp && b.cfg.castleHp === f.castleHp, `the boss's bramble is the part's fight castleHp, not the trench's (${b.players[2].hq.hp} / ${f.castleHp}; trench ${(f.part.trench || {}).castleHp})`);
  const src0 = H.loadCardDefs()['kraken-spawnling'], cp = b.overlay['kraken-spawnling~raid'];
  ok(cp && cp.attack === Math.max(1, Math.round(src0.attack * goliath.tuning.bossAtkPct)) && cp.health === Math.max(1, Math.round(src0.health * goliath.tuning.bossHpPct)), `boss cards at the tuned share of their stats (${cp && cp.attack}/${cp && cp.health})`);
  // both allies play a card each turn (tuning.alliesPerTurn 2), and each play runs the hand-play animation hook
  const m = {raidDef: goliath, raidFull:true, round:1, players: b.players, engine: b.engine, raidAllies: allies};
  const n0 = allies.reduce((t, a)=> t + a.played, 0); A.raidAlliesTurn(m, []); const n1 = allies.reduce((t, a)=> t + a.played, 0);
  ok(n1 - n0 === 2, `both allies played this turn (${n1 - n0})`); }
ok(/function raidAllyPlays\(m, a, events\)[\s\S]{0,1600}allyPlayFx\(placed\.uid, \{row: a\.row, mode: 'raid'\}\)/.test(src), 'each ally play in a raid calls the hand-play animation (allyPlayFx, mode raid)');
ok(/function allyPlayFx\(uid, opts\)[\s\S]{0,700}mode: opts\.mode \|\| 'raid'/.test(src) && /'tagteam'/.test(src), 'allyPlayFx takes a tag-team partner too (mode tagteam) and counts its plays');
ok(/allyPlayFx[\s\S]{0,1500}reducedMotion\(\) \|\| lvl === 'low'/.test(src) && /lvl === 'none'\) return/.test(src), 'reduced motion / Low effects: a fade in place; None: nothing');
ok(/fadeIn: 0\.45/.test(src) && /opacity: origin\.fadeIn \?/.test(src), 'the ally card fades in partway along its flight');

// ---- The play-animation watchdog: a timer (not frames) finishes an entrance or a flight that ran past its length
{ const body = ['const PLAY_ANIM_GRACE_MS = 450;', B.grab('playAnimWatchdog'), 'return playAnimWatchdog;'].join('\n');
  const prog = {v: 0.05, calls: 0}, tl = {delay: ()=> 0, totalDuration: ()=> 0.5, progress: v=>{ if(v === undefined) return prog.v; prog.v = v; prog.calls++; }};
  const el = {isConnected:true, classList:{remove(){}}};
  const entranceBorn = new Map([['7', {tl, at: 0, el}]]), enteringTimelines = new Map([['7', tl]]), enteringUids = new Set(['7']);
  const sets = []; const gsap = {set: (t, v)=> sets.push(v)}, win = {}; const doc = {querySelectorAll: ()=> []};
  const perf = {now: ()=> 5000};
  const wd = new Function('document', 'window', 'performance', 'gsap', 'hasGsap', 'entranceBorn', 'enteringTimelines', 'enteringUids', 'handFlightDue', 'handFlightsLive', body)(doc, win, perf, gsap, ()=> true, entranceBorn, enteringTimelines, enteringUids, new Map(), new Set());
  wd();
  ok(prog.v === 1 && !enteringUids.has('7') && !entranceBorn.size && win.__bwPlayAnimWatchdog && win.__bwPlayAnimWatchdog.fixed === 1, `an entrance stuck past its length is finished on the wall clock (progress ${prog.v}, fixed ${win.__bwPlayAnimWatchdog && win.__bwPlayAnimWatchdog.fixed})`);
  const tl2 = {delay: ()=> 0, totalDuration: ()=> 0.5, progress: v=>{ if(v === undefined) return 0.2; throw new Error('should not finish'); }};
  const eb2 = new Map([['8', {tl: tl2, at: 4900, el}]]);
  let threw = false; try{ new Function('document', 'window', 'performance', 'gsap', 'hasGsap', 'entranceBorn', 'enteringTimelines', 'enteringUids', 'handFlightDue', 'handFlightsLive', body)(doc, win, perf, gsap, ()=> true, eb2, new Map([['8', tl2]]), new Set(['8']), new Map(), new Set())(); }catch(e){ threw = true; }
  ok(!threw && eb2.size === 1, 'an entrance still within its time is left alone'); }
ok(/setInterval\(\(\)=>\{ try\{ playAnimWatchdog\(\); \}catch\(e\)\{\} \}, 200\);/.test(src), 'the watchdog runs on a 200 ms timer');
ok(/entranceBorn\.set\(uid, \{tl: entranceTl, at: performance\.now\(\), el\}\)/.test(src) && /handFlightDue\.set\(key, \{due:/.test(src), 'entrances and hand flights are registered with the watchdog');

// ---- Play rows (tag-team dungeons: "Your row only" / "Anywhere") and the leader cost cap
{ const body = [B.grab('PLAY_ROWS'), B.grab('playRowsOf'), B.grab('matchPlayRows'), 'return {playRowsOf, matchPlayRows};'].join('\n');
  const P = new Function(body)();
  ok(P.playRowsOf({}) === 'own' && P.playRowsOf({playRows:'any'}) === 'any' && P.playRowsOf({playRows:'x'}) === 'own', 'playRows: unset or unknown = "Your row only" (own); "any" kept');
  ok(P.matchPlayRows({raidFull:true, playRows:'any'}) === 'own' && P.matchPlayRows({playRows:'own'}) === 'own' && P.matchPlayRows({}) === 'any', 'a raid is always own; a match without the setting plays anywhere as before'); }
ok(/if\(matchPlayRows\(m\) === 'own' && popts && popts\.reserve\) return false;/.test(src) && /!m\.raidFull && m\.engine\.legalReserveSlots && matchPlayRows\(m\) === 'any'/.test(src), 'play rows enforced in playCardByUid and in the reserve rows\' play targets');
{ const body = ['const getCardDefs = ()=> D; const TX = (k, v)=> T.TX(k, v);', B.grab('leaderCostPoints'), B.grab('raidLeaderCapOf'), B.grab('raidLeaderCapCheck'), 'return {leaderCostPoints, raidLeaderCapCheck};'].join('\n');
  const D = {six: {cost:1, stoneCost:1, metalCost:1}, five: {cost:2, metalCost:1}, free: {cost:0}};
  const L = new Function('D', 'T', body)(D, texts);
  ok(L.leaderCostPoints(D.six) === 6 && L.leaderCostPoints(D.five) === 5, 'leader points: Lumber 1, Stone 2, Metal 3 each');
  const c6 = L.raidLeaderCapCheck(goliath, 'six'), c5 = L.raidLeaderCapCheck(goliath, 'five');
  ok(!c6.ok && c6.text === 'Leader cost 6/5 — too costly for this raid' && c5.ok && L.raidLeaderCapCheck(goliath, null).ok, `a 6-point leader is refused with the reason, 5 is fine, no leader is fine ("${c6.text}")`);
  ok(L.raidLeaderCapCheck({}, 'six').ok, 'no cap set: any leader'); }
ok(/const lc = raidLeaderCapCheck\(def, matchLeaderId\(\)\); if\(!lc\.ok\)\{ showToast\(lc\.text, 'error'\); return; \}/.test(src), 'the fight does not start with a leader over the cap');
ok(/!capOf\(id\)\.ok \? `<button type="button" class="lp-item is-used is-too-costly" disabled/.test(src), 'the raid\'s leader picker greys out leaders over the cap with the reason');
ok(/id="reLeaderCap"/.test(src) && /draft\.leaderCostCap = lc/.test(src) && /id="reTAllies"/.test(src), 'the raid editor edits the cap and the tuning');
// ---- A raid that is down says when it returns (owner 23:19), through one helper (raidRespawnAt)
{ const RaidM = require('../bramblewood-raid.js'); const body = [B.grab('raidRespawnAt'), B.grab('raidSpanText'), 'return {raidRespawnAt, raidSpanText};'].join('\n');
  const R = new Function('RaidM', body)(RaidM);
  ok(R.raidRespawnAt(goliath, {cycle: 7}) === 8 * RaidM.CYCLE_MS && R.raidRespawnAt({}, {cycle: 2}, 1000) === 3000, 'raidRespawnAt: the end of the cycle (the one place a later early-respawn rule changes)');
  ok(R.raidSpanText((2*24 + 4) * 3600000 + 5 * 60000) === '2d 4h' && R.raidSpanText(3 * 3600000 + 12 * 60000) === '3h 12m' && R.raidSpanText(20000) === '1m', 'the span reads 2d 4h / 3h 12m / 1m'); }
ok(/\$\{st\.defeated \? raidRespawnHTML\(def, st\)/.test(src) && /st\.defeated \? raidRespawnHTML\(b, st, Ghosts\.RAID\.CYCLE_DAYS/.test(src), 'a defeated raid shows when it returns instead of the days left (raid tab and the offline raid)');
['ui.raid-returns-in', 'ui.raid-respawn-title', 'ui.raid-leader-too-costly', 'ui.raid-leader-cap', 'ui.raid-leader-cost-ok', 'ui.raid-change-leader', 'ui.raid-closest-row-note', 'ui.raid-commons-every', 'ui.play-rows-own', 'ui.play-rows-any', 'ui.play-rows-own-note', 'ui.play-rows-any-note']
  .forEach(k=> ok(texts.TEXT[k] && src.includes(`'${k}'`), `TX key ${k} exists and is used`));
{ const peel = s=> s.replace(/^[\s\W_]*/u, ''); const en = texts.TEXT['ui.raid-closest-row-note'];
  ['fr', 'de', 'ja', 'ko', 'zh-Hans', 'ta'].forEach(c=>{ const pack = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'lang', c + '.json'), 'utf8')); ok(pack[peel(en)] && pack[peel(texts.TEXT['ui.raid-leader-too-costly'])], `the ${c} pack has the new raid texts`); }); }

// ---- Contrast: the raid results' reward pills take the theme's ink on its surface (they were a fixed dark brown: 1.15:1 in dark)
ok(/\.winloss-card\.is-raid \.raid-results \.hud-pill\{color:var\(--ink\); background:var\(--surface\)/.test(tpl) && !/\.raid-results \.hud-pill\{color:#3a2a10;\}/.test(tpl), 'raid result pills use the theme ink on the theme surface');
ok(/\.winloss-card\.is-glory\.is-raid \.winloss-reason\{color:#fbf1dc/.test(tpl), 'the line under the raid result title is cream on the purple card');
// ---- The raid eases down to your hand once, after it loads (reduced motion: a jump)
ok(/function raidScrollToHand\(m\)\{[\s\S]{0,400}m\._handScrolled = true/.test(src) && /renderPlay\(\); raidScrollToHand\(m0\);/.test(src), 'raidScrollToHand runs once a fight, after the raid renders');
ok(/raidScrollToHand[\s\S]{0,2400}if\(reducedMotion\(\)\)\{ el\.scrollTop = to;/.test(src) && /D = 600/.test(src), 'about 600 ms of easing, a jump under reduced motion, and it stops if you scroll');

console.log(fail ? `raid-rx-2026-10-19: ${fail} failed` : 'raid-rx-2026-10-19: all passed');
process.exit(fail ? 1 : 0);
