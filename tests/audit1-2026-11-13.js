#!/usr/bin/env node
// 2026-11-13 (package AUDIT1, owner note 3, 11-12 23:47: "Search for implicit state machines and fix potential bugs"). One check per fix:
//   1. group dungeon: a claim lost on the way no longer leaves the seat "waiting" and the round unplayed for good (the heartbeat resends it);
//      a resent claim that already landed is the same claim (no second act, no "refused" for a move that went in)
//   2. results: Quit waits for the rewards' record at most 15 s (a reward step that threw never recorded it, and Quit refused for good)
//   3. Forge: the smithing look ends within 5 s whatever GSAP's clock does; the Blacksmith's craft frees the Forge (finally) and gives the card
//   4. Card Detail: one Escape and one outside-click listener at a time
//   5. the old place entrances (PLACES[].enter, leafSweep) are gone; bramblewood-ui-places.js plays them
//   node tests/audit1-2026-11-13.js        (COOP_FILE=<path> runs check 1 against another copy of bramblewood-coop.js)
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const H = require('./lib/harness.js');
const ROOT = H.ROOT, src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const C = require(process.env.COOP_FILE ? path.resolve(process.env.COOP_FILE) : path.join(ROOT, 'bramblewood-coop.js'));
let n = 0, fail = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗ ' + m); } };
function fnSrc(name, async){ const i = src.indexOf('\n' + (async ? 'async ' : '') + 'function ' + name + '('); if(i < 0) return null; let d = 0;
  for(let k = src.indexOf('{', i); k < src.length; k++){ const ch = src[k]; if(ch === '{') d++; else if(ch === '}'){ d--; if(!d) return src.slice(i + 1, k + 1); } } return null; }

function fakeClock(){
  let t = 1e6, seq = 0; const timers = new Map();
  return {now: ()=> t, setTimeout(fn, ms){ const id = ++seq; timers.set(id, {at: t + ms, fn}); return id; }, clearTimeout(id){ timers.delete(id); },
    setInterval(fn, ms){ const id = ++seq; timers.set(id, {at: t + ms, fn, every: ms}); return id; }, clearInterval(id){ timers.delete(id); },
    advance(ms){ const end = t + ms; for(;;){ let next = null; timers.forEach((v, k)=>{ if(v.at <= end && (!next || v.at < next[1].at)) next = [k, v]; }); if(!next) break; t = next[1].at; if(next[1].every) next[1].at += next[1].every; else timers.delete(next[0]); next[1].fn(); } t = end; }};
}
const io = ()=> new Promise(r=> setImmediate(r));
async function settle(hub, k){ for(let i = 0; i < (k || 6); i++){ await hub.flush(); await io(); } }
async function elapse(hub, clock, ms){ for(let x = 0; x < ms; x += 50){ clock.advance(Math.min(50, ms - x)); await settle(hub, 3); } }

(async ()=>{
  // ---- 1. a lost claim, a resent claim
  { const defs = H.loadCardDefs(), deps = {makeSimEngine: H.Engine.makeSimEngine, defs, defsHash: C.defsHash(defs, Object.keys(defs))};
    const hub = C.createHub({defer: fn=> setImmediate(fn)}), clock = fakeClock(), gev = [];
    let lose = 0; const lossy = t=> Object.assign({}, t, {send(msg){ if(msg.t === 'claim' && lose > 0){ lose--; return; } t.send(msg); }});
    const host = C.createSession({transport: hub.connect('h'), me: {peerId: 'h', name: 'H', deck: {'cave-cricket': 20}, castleHp: 15}, host: true, code: 'AUD01', typeId: 'hollow', deps, clock, seed: 77});
    const guest = C.createSession({transport: lossy(hub.connect('g')), me: {peerId: 'g', name: 'G', deck: {'baby-bat': 20}, castleHp: 15}, host: false, code: 'AUD01', typeId: 'hollow', deps, clock, onEvent: (k, d)=> gev.push([k, d])});
    await settle(hub); guest.setReady(true); await settle(hub); host.start(); await settle(hub);
    ok(host.T && guest.T && host.T.round === 1, 'coop: the run started');
    host.claim({kind: 'pass'}); await elapse(hub, clock, 300);
    lose = 1; const r = guest.claim({kind: 'pass'});
    await elapse(hub, clock, 600);
    ok(r && r.ok && Object.keys(guest.pending).length === 1 && host.T.round === 1, 'coop: the guest\'s claim was lost: it waits, the host waits for it');
    await elapse(hub, clock, C.PING_MS * 2 + 400);
    ok(host.T.round === 2 && guest.T.round === 2 && !Object.keys(guest.pending).length, `coop: the heartbeat resent it; the round was fought (host round ${host.T.round}, guest pending ${Object.keys(guest.pending).length})`);
    ok(C.tableHash(host.T) === C.tableHash(guest.T), 'coop: same table on both after it');
    // a claim that landed, sent again (a roster resend, a heartbeat before the act arrived): one act, no refusal
    const before = host.log.length, landed = host.log.filter(a=> a.seat === 1 && a.cid).pop(), cid = landed ? landed.cid : 'g:1';
    ok(!!landed, 'coop: the guest\'s claim is in the host\'s act log');
    host._onMsg({t: 'claim', from: 'g', epoch: host.epoch, seat: 1, floor: host.floorIdx, c: {kind: 'pass', seat: 1}, cid});
    await elapse(hub, clock, 400);
    ok(host.log.length === before && !host.log.slice(before).some(a=> a.cid === cid), 'coop: a resent claim that already landed lands nothing more');
    ok(!gev.some(([k])=> k === 'reject'), 'coop: and no "refused" reaches the guest for it');
    // a refusal of a claim no longer open says nothing
    gev.length = 0; guest._onMsg({t: 'reject', from: 'h', epoch: guest.epoch, to: 1, cid: 'g:999', why: 'done'});
    ok(!gev.some(([k])=> k === 'reject'), 'coop: a refusal of an unknown claim is ignored');
    host.close(); guest.close(); }

  // ---- 2. Quit waits for the record at most 15 s
  { const ctx = {Date: {now: ()=> ctx.now}, now: 1e9}; vm.createContext(ctx);
    vm.runInContext([fnSrc('matchRewardSettled'), fnSrc('matchResultPending')].join('\n'), ctx);
    const m = {resultDecided: true, resultDecidedAt: 1e9 - 2000, rewardRecorded: false};
    ok(ctx.matchResultPending(m), 'results: 2 s after the decision, unrecorded: Quit still waits');
    m.resultDecidedAt = 1e9 - 16000; ok(!ctx.matchResultPending(m), 'results: 16 s after, still unrecorded (a reward step threw): Quit goes');
    m.resultDecidedAt = 1e9 - 1000; m.rewardRecorded = true; ok(!ctx.matchResultPending(m), 'results: recorded: Quit goes at once');
    m.fightReward = {settled: false}; ok(ctx.matchResultPending(m), 'results: the server\'s share still out: Quit waits');
    ok(/m\.resultDecided = true; m\.resultDecidedAt = Date\.now\(\);/.test(fnSrc('noteMatchResultDecided')), 'results: the decision notes its time'); }

  // ---- 3. the Forge
  { const timers = []; let gsapCalls = 0;
    const cls = new Set(), stage = {classList: {add: c=> cls.add(c), remove: (...c)=> c.forEach(x=> cls.delete(x))}, appendChild(){}, querySelector: q=> q === '.forge-preview-wrap' ? wrap : {}};
    const wrap = {querySelector: ()=> ({})};
    const tl = {set(){ gsapCalls++; return tl; }, to(){ return tl; }, add(){ return tl; }}; // a clock that never moves: no callback ever runs
    const ctx = {window: {matchMedia: ()=> ({matches: false})}, document: {getElementById: id=> id === 'anvilStage' ? stage : null}, hasGsap: ()=> true,
      gsap: {timeline: ()=> tl}, setTimeout: (fn, ms)=> timers.push({fn, ms}), Math, Promise};
    vm.createContext(ctx); vm.runInContext(fnSrc('forgeSmithAnimation'), ctx);
    let done = false; ctx.forgeSmithAnimation('', '', true).then(()=>{ done = true; });
    await io(); ok(!done && gsapCalls > 0, 'forge: the smithing look started, GSAP\'s clock still');
    const cap = timers.find(t=> t.ms <= 5000 && t.ms >= 3000); ok(!!cap, 'forge: a safety timer of at most 5 s');
    if(cap) cap.fn(); await io(); ok(done && !cls.has('is-hot'), 'forge: the look ends (and the forge cools) when it fires: forgeBusy is freed');
    const ws = fnSrc('wireBlacksmith') || '';
    ok(/try\{ unlockCardForPlayer\(r\.out, 'smith'\); \}[^\n]*\n\s*finally\{ forgeBusy = false; \}/.test(ws), 'forge: the craft frees the Forge in a finally and gives the paid card even if the look broke');
    ok(/try\{ if\(card && card\.animate && !reducedMotion\(\)\)/.test(ws), 'forge: the craft\'s hammer look cannot throw past the payment'); }

  // ---- 4. Card Detail listeners
  { const s = fnSrc('openCardDetail') || '';
    ok(/if\(cardDetailUnbind\) cardDetailUnbind\(\);\n\s*cardDetailUnbind = \(\)=>\{ document\.removeEventListener\('keydown', onKey\); overlay\.removeEventListener\('click', outsideClick\);/.test(s), 'detail: a reopen removes the last one\'s Escape and outside-click listeners');
    ok(!/function outsideClick/.test(s) && /if\(cardDetailUnbind\) cardDetailUnbind\(\); if\(cardDetailCtl\)/.test(s), 'detail: closing removes both, however it closes');
    ok(/cardDetailOpenId = null; if\(cardDetailUnbind\) cardDetailUnbind\(\);/.test(fnSrc('switchTab') || ''), 'detail: the Stomping Grounds\' own close removes them too'); }

  // ---- 5. the old place entrances
  { const i = src.indexOf('\nconst PLACES = {'), block = src.slice(i, src.indexOf('\n};', i));
    ok(i > 0 && !/enter:/.test(block) && /deck: \{cls:'tent-scene'/.test(block), 'places: PLACES keeps the scene, sign and ambience, no entrance');
    ok(!/function leafSweep\(/.test(src), 'places: the unused leaf gust is gone');
    ok(/placeOverlay\('forge-flare'/.test(src) && /function placeOverlay\(/.test(src), 'places: placeOverlay stays (the Forge flare uses it)');
    ok(/BramblewoodPlaces\.enter\(tab, document\.getElementById\('view-' \+ tab\)/.test(fnSrc('switchTab') || ''), 'places: switchTab hands entrances to bramblewood-ui-places.js'); }

  console.log(`audit1: ${n - fail}/${n} passed`);
  process.exit(fail ? 1 : 0);
})().catch(e=>{ console.error(e); process.exit(1); });
