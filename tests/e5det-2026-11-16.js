#!/usr/bin/env node
// 2026-11-16 (package E5DET1, alpha checklist E5 "Determinism: same seed, same result, in the browser and the tools. Check: replay test").
// About 30 fights over Maps 0-20 (main and side maps, picked to cover fields, weather, terrain, tides, dark, eruption and a dungeon floor)
// are played from one seed through the tools' path (tools/lib_bramble.js: the game's own referenceFightSetup + playReferenceGame, the
// fights the road measure and the skirmish editor's win-rate panel play) and recorded call by call: after every engine call that can
// change the fight (newPlayer, draw, roundStart, aiTakeTurn, resolveCombat ...) the whole state of both players, the call's new events
// and the number of RNG draws so far are hashed. Checks:
//   1. Node, twice: the same hashes, call for call.
//   2. Recording the events (what the game's effects read) changes nothing: the plain run (recordEvents off) ends the same.
//   3. Another seed gives another log on most fights (the seed is really used).
//   4. Browser (built index.html in headless Chromium, when there): the page's own referenceFightSetup + playReferenceGame give the
//      same hashes as Node, call for call.
//   5. Browser, the game's battle path: real conquest fights (startConquestMatch, Auto-play on, the page's animations and timers) played
//      twice from one forced seed at two playback speeds give the same engine log and winner; another seed gives another log.
//   6. Raids (tools/raid_full_sim.js playOne), twice in Node: the same result.
// Usage: node tests/e5det-2026-11-16.js [--n=30] [--no-browser] [--ui=3]
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const argv = process.argv.slice(2), opt = (k, d)=>{ const a = argv.find(x=> x.startsWith('--' + k + '=')); return a ? a.split('=')[1] : d; };
const N_FIGHTS = +opt('n', 30), N_UI = +opt('ui', 3), NO_BROWSER = argv.includes('--no-browser'), DEBUG = argv.includes('--debug');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  x', m); } };

// The recorder, as source text: the same code runs in Node and in the page.
const E5SRC = String.raw`(function(){
  function fnv(s, h){ h = (h == null ? 2166136261 : h) >>> 0; for(let i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function canon(v, seen){
    if(v === null) return 'n'; const t = typeof v;
    if(t === 'number') return Number.isNaN(v) ? 'NaN' : Object.is(v, -0) ? '-0' : String(v);
    if(t === 'string') return JSON.stringify(v); if(t === 'boolean') return v ? 'T' : 'F'; if(t === 'undefined') return 'u'; if(t === 'function') return 'f';
    if(t !== 'object') return String(v);
    if(seen.has(v)) return '~'; seen.add(v);
    if(Array.isArray(v)) return '[' + v.map(x=> canon(x, seen)).join(',') + ']';
    if(v instanceof Set) return 'S[' + Array.from(v).map(x=> canon(x, seen)).join(',') + ']';
    if(v instanceof Map) return 'M[' + Array.from(v).map(kv=> canon(kv[0], seen) + ':' + canon(kv[1], seen)).join(',') + ']';
    return '{' + Object.keys(v).filter(k=> !DISPLAY[k]).sort().map(k=> k + ':' + canon(v[k], seen)).join(',') + '}';
  }
  // display-only fields (a castle's art is a data URL in the tools and a file path in the page, its text a translation): not fight state
  const DISPLAY = {art: 1, flavor: 1, lore: 1, icon: 1};
  // the engine calls that can change a fight, and where each takes its events list
  const EV = {newPlayer: -1, draw: 4, roundStart: 4, aiTakeTurn: 4, resolveCombat: 3, placeCard: 6, summonLeader: 6, pitchCard: 5, placeGladiatorLeader: 5, applySecondPlayerBonus: 3,
    setSuddenDeath: -1, setAiLevel: -1};
  const NO_STATE = {setSuddenDeath: 1, setAiLevel: 1};
  const rec = {on: false, events: true, games: []};
  // rec.between: also note what the app changed in the players between two engine calls (the game's own flow, or an effect writing state)
  function snap(v, seen){ if(v === null || typeof v !== 'object') return typeof v === 'function' ? 'f' : v; if(seen.has(v)) return '~'; seen.add(v);
    if(Array.isArray(v)) return v.map(x=> snap(x, seen)); if(v instanceof Set || v instanceof Map) return Array.from(v).map(x=> snap(x, seen));
    const o = {}; Object.keys(v).filter(k=> !DISPLAY[k]).sort().forEach(k=>{ o[k] = snap(v[k], seen); }); return o; }
  function diffPaths(a, b, p, out){ if(out.length >= 12) return out;
    if(a === b) return out; if(a && b && typeof a === 'object' && typeof b === 'object'){ const ks = Array.from(new Set(Object.keys(a).concat(Object.keys(b))));
      ks.forEach(k=> diffPaths(a[k], b[k], p + '.' + k, out)); return out; }
    if(typeof a === 'number' && typeof b === 'number' && Number.isNaN(a) && Number.isNaN(b)) return out;
    out.push(p + ' ' + JSON.stringify(a === undefined ? null : a).slice(0, 40) + '->' + JSON.stringify(b === undefined ? null : b).slice(0, 40)); return out; }
  function wrap(orig){
    return function(defs, rnd, opts){
      if(!rec.on) return orig.apply(this, arguments);
      let draws = 0; const r0 = rnd || Math.random, rr = function(){ draws++; return r0(); };
      const eng = orig.call(this, defs, rr, rec.events ? Object.assign({}, opts, {recordEvents: true}) : opts);
      const g = {calls: [], h: fnv(''), players: [], label: rec.label || ''}; rec.games.push(g);
      const out = Object.assign({}, eng);
      Object.keys(EV).forEach(name=>{ const f = eng[name]; if(typeof f !== 'function') return;
        out[name] = function(){ const args = Array.prototype.slice.call(arguments), ei = EV[name];
          if(rec.events && ei >= 0 && args[ei] == null){ while(args.length <= ei) args.push(undefined); args[ei] = []; }
          const evs = ei >= 0 && Array.isArray(args[ei]) ? args[ei] : null, n0 = evs ? evs.length : 0;
          if(rec.between && !NO_STATE[name] && g.post){ const now = snap(g.players, new Set()), d = diffPaths(g.post, now, 'P', []); if(d.length) (g.between = g.between || []).push({i: g.calls.length, call: name, paths: d}); }
          const ret = f.apply(this, args);
          if(rec.between && !NO_STATE[name]) g.post = snap(g.players, new Set());
          if(name === 'newPlayer') g.players.push(ret);
          const lite = args.map(a=> a == null || typeof a !== 'object' ? (typeof a === 'function' ? 'f' : canon(a, new Set())) : 'o').join(',');
          const line = name + '|' + lite + '|' + (name === 'newPlayer' ? '' : canon(ret, new Set())) + '|' + (evs ? canon(evs.slice(n0), new Set()) : '') + '|' + (NO_STATE[name] ? '' : canon(g.players, new Set())) + '|' + draws;
          const h = fnv(line); g.h = fnv(String(h), g.h); g.calls.push(name + ':' + h.toString(16)); if(rec.keep && g.calls.length <= rec.keep) (g.lines = g.lines || []).push(line);
          return ret; };
      });
      return out;
    };
  }
  function digest(g){ return g ? {h: g.h.toString(16), calls: g.calls.length, seq: g.calls, lines: g.lines, between: g.between || []} : null; }
  // first call where two recorded logs part
  function firstDiff(a, b){ const n = Math.max(a.length, b.length); for(let i = 0; i < n; i++) if(a[i] !== b[i]) return {i, a: a[i] || '-', b: b[i] || '-'}; return null; }
  // one reference game (the tools' and the win-rate panel's path) from seed0, recorded
  function refGame(G, mapId, node, seed0, record){
    const ctx = G.referenceFightSetup(mapId, node, {seed0});
    rec.on = !!record; rec.games = [];
    let r; try{ r = G.playReferenceGame(ctx, 0); } finally { rec.on = false; }
    return {res: {win: r.win, loss: r.loss, rounds: r.rounds, hp: Math.round(r.hpLeft * 1e6) / 1e6}, log: digest(rec.games[0])};
  }
  return {fnv, canon, rec, wrap, digest, firstDiff, refGame};
})()`;

// ---- Node: install the recorder on the engine before lib_bramble reads makeSimEngine
const E5 = (0, eval)(E5SRC);
const Eng = require(path.join(ROOT, 'bramblewood-engine.js'));
Eng.makeSimEngine = E5.wrap(Eng.makeSimEngine);
const B = require(path.join(ROOT, 'tools', 'lib_bramble.js'));
const {G, MAPS} = B;

// ---- the fights: one per main map 0-20, then side fights picked greedily for the fight rules they add, and one dungeon floor
function pickFights(total){
  const all = [];
  for(const m of MAPS){ if(m.reserved || m.tower) continue; const no = G.mapNumberOf(m.id); if(no == null || no > 20) continue;
    m.nodes.forEach((nd, i)=>{ if(!nd.deck || !Object.keys(nd.deck).length) return; const k = nd.kind || 'skirmish'; if(k === 'tutorial' || k === 'raidboss') return;
      let rules = {}; try{ rules = G.fightRules(m.id, nd) || {}; }catch(e){}
      all.push({map: m.id, key: nd.key, no, side: !!m.sub, endless: !!m.endless, kind: k, i, rules: Object.keys(rules).filter(x=> rules[x] != null && rules[x] !== false)}); }); }
  const out = [], seen = new Set(), add = f=>{ out.push(f); f.rules.forEach(r=> seen.add(r)); };
  for(let no = 0; no <= 20; no++){ const ms = all.filter(f=> f.no === no && !f.side); if(ms.length) add(ms[(no * 7) % ms.length]); }
  const floor = all.find(f=> f.endless); if(floor) add(floor);
  const side = all.filter(f=> f.side && !f.endless);
  while(out.length < total && side.length){
    let best = 0, bi = 0; side.forEach((f, i)=>{ const s = f.rules.filter(r=> !seen.has(r)).length * 10 + (f.kind !== 'skirmish' ? 1 : 0); if(s > best){ best = s; bi = i; } });
    if(best === 0) bi = Math.floor(side.length / 2);
    add(side.splice(bi, 1)[0]);
  }
  return {fights: out, rules: [...seen].sort()};
}
const {fights: FIGHTS, rules: RULES} = pickFights(N_FIGHTS);
const SEED = 5501, SEED2 = 77003;
const BETWEEN_OK = ['playedThisTurn', 'discardUsedThisTurn', 'playsThisTurn', 'leaderPlan', 'reserveLeaders', 'loopCards', 'perks', 'openingExtra', '_hasDevilry', '_hasEcclesia'];
const nodeOf = f=> B.byKey(f.map, f.key), E5rng = s=> Eng.mulberry32(s >>> 0);

const t0 = Date.now();
const nodeRuns = FIGHTS.map(f=>{
  const a = E5.refGame(G, f.map, nodeOf(f), SEED, true), b = E5.refGame(G, f.map, nodeOf(f), SEED, true);
  const plain = E5.refGame(G, f.map, nodeOf(f), SEED, false), other = E5.refGame(G, f.map, nodeOf(f), SEED2, true);
  return {f, a, b, plain, other};
});
console.log(`e5det: ${FIGHTS.length} fights (${FIGHTS.filter(f=> f.side).length} on side maps, maps ${[...new Set(FIGHTS.map(f=> f.no))].length} of 0-20), rules covered: ${RULES.length} (${RULES.join(' ')}) [${((Date.now() - t0) / 1000).toFixed(1)}s]`);
let sameSeedSame = 0, plainSame = 0, otherDiff = 0;
nodeRuns.forEach(({f, a, b, plain, other})=>{
  const tag = `${f.map} ${f.key}`;
  const same = a.log.h === b.log.h && JSON.stringify(a.res) === JSON.stringify(b.res); if(same) sameSeedSame++;
  ok(same, `${tag}: Node twice, same seed, different logs at ${JSON.stringify(E5.firstDiff(a.log.seq, b.log.seq))}`);
  const ps = JSON.stringify(plain.res) === JSON.stringify(a.res); if(ps) plainSame++;
  ok(ps, `${tag}: recording events changed the fight (${JSON.stringify(plain.res)} vs ${JSON.stringify(a.res)})`);
  if(other.log.h !== a.log.h) otherDiff++;
});
console.log(`  Node: same seed twice identical ${sameSeedSame}/${FIGHTS.length}; events on/off same end ${plainSame}/${FIGHTS.length}; another seed differs ${otherDiff}/${FIGHTS.length}`);
ok(otherDiff >= Math.ceil(FIGHTS.length * 0.8), `another seed should change most logs (${otherDiff}/${FIGHTS.length})`);

// ---- raids (the tools' replica of the page's raid round), twice in Node
try{
  const R = require(path.join(ROOT, 'tools', 'raid_full_sim.js'));
  const RAIDS = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'raids.json'), 'utf8')), def = RAIDS[0];
  let same = 0, tot = 0; const parts = (def.parts || []).map(p=> p.id).slice(0, 2);
  for(const part of parts) for(const g of [0, 1]){ tot++; const x = JSON.stringify(R.playOne(def, part, 'fresh', '6', g)), y = JSON.stringify(R.playOne(def, part, 'fresh', '6', g)); if(x === y) same++; else console.log('  raid differs', part, g, x, y); }
  ok(same === tot, `raid playOne twice: ${same}/${tot} same`);
  // the game's raid (E5DET1 fix): its own draws come from raidRand, a stream off the match seed, never Math.random when it is there
  const strip = s=> s.replace(/\|\|\s*Math\.random/g, '');
  const raidFns = ['raidAllyOf', 'raidBossCommons', 'raidAllyPlays', 'buildRaidFullFight'].map(nm=> [nm, B.grab(nm)]);
  raidFns.forEach(([nm, s])=> ok(!/Math\.random/.test(strip(s)), `${nm}: Math.random only as the fallback`));
  ok(/raidRand = seededRng\(\(currentMatchSeed \^ 0x5A1DF00D\) >>> 0\)/.test(B.src) && /rand: raidRand/.test(B.src) && /raidAllyOf\(a, i, raidRand\)/.test(B.src) && /raidSeed: currentMatchSeed, raidRand\}/.test(B.src), 'the raid start seeds raidRand from the match seed and hands it on');
  const saveRandom = Math.random; Math.random = ()=>{ throw new Error('Math.random'); };
  try{ const deck = {}; Object.keys(B.CARD_DEFS_BASELINE).slice(0, 8).forEach(id=> deck[id] = 2);
    const o1 = R.A.raidAllyOf({name: 'E5', deck}, 0, E5rng(9)).deck.join(), o2 = R.A.raidAllyOf({name: 'E5', deck}, 0, E5rng(9)).deck.join(), o3 = R.A.raidAllyOf({name: 'E5', deck}, 0, E5rng(10)).deck.join();
    ok(o1 === o2 && o1 !== o3, 'raidAllyOf: one stream, one deck order; another stream, another'); }
  catch(e){ ok(false, 'raidAllyOf drew from Math.random: ' + e.message); } finally { Math.random = saveRandom; }
  console.log(`  Raids (tools): same seed twice identical ${same}/${tot}; the game's raid draws from its match seed`);
}catch(e){ ok(false, 'raid check crashed: ' + (e && e.stack || e)); }

ok(/e5det-2026-11-16/.test(fs.readFileSync(path.join(ROOT, 'tests', 'run-all.sh'), 'utf8')), 'run-all.sh lists this test');

// ---- browser
async function browser(){
  if(NO_BROWSER){ console.log('  (browser part skipped: --no-browser)'); return; }
  let pw; try{ pw = require('playwright'); }catch(e){ try{ pw = require(path.join(require('child_process').execSync('npm root -g').toString().trim(), 'playwright')); }catch(_){ console.log('  (browser part skipped: no playwright)'); return; } }
  const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
  if(!fs.existsSync(EXE) || !fs.existsSync(path.join(ROOT, 'index.html'))){ console.log('  (browser part skipped: no Chromium or index.html)'); return; }
  const INIT = "localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); sessionStorage.setItem('bramblewood_seen_splash','1'); localStorage.setItem('bramblewood_fx_level','high');";
  const b = await pw.chromium.launch({executablePath: EXE}); const errs = [];
  try{
    const ctx = await b.newContext({viewport: {width: 1366, height: 900}});
    await ctx.route('**/*', r=> r.request().url().startsWith('file:') ? r.continue() : r.abort());
    const pg = await ctx.newPage(); pg.on('pageerror', e=> errs.push(String(e)));
    await pg.addInitScript(INIT); await pg.goto('file://' + path.join(ROOT, 'index.html'), {waitUntil: 'domcontentloaded', timeout: 180000});
    await pg.waitForFunction("typeof switchTab === 'function' && typeof playReferenceGame === 'function'", null, {timeout: 180000}); await pg.waitForTimeout(1500);
    await pg.evaluate(`window.__E5 = ${E5SRC}; window.__E5orig = makeSimEngine; makeSimEngine = __E5.wrap(__E5orig); window.showToast = ()=>{};`);
    // 4. the page's reference path, the same fights and seed
    const page = await pg.evaluate(`(()=>{ const G = {referenceFightSetup, playReferenceGame};
      const find = (m, k)=>{ const mm = CONQUEST_MAPS.find(x=> x.id === m); return mm && mm.nodes.find(nd=> nd.key === k); };
      return ${JSON.stringify(FIGHTS.map(f=> [f.map, f.key]))}.map(([m, k])=>{ try{ return __E5.refGame(G, m, find(m, k), ${SEED}, true); }catch(e){ return {err: String(e && e.stack || e)}; } }); })()`);
    let same = 0;
    nodeRuns.forEach(({f, a}, i)=>{ const p = page[i] || {}; const s = !p.err && p.log && p.log.h === a.log.h && JSON.stringify(p.res) === JSON.stringify(a.res); if(s) same++;
      ok(s, `${f.map} ${f.key}: browser vs Node, same seed: ${p.err ? p.err.slice(0, 300) : 'first difference ' + JSON.stringify(E5.firstDiff(a.log.seq, (p.log || {}).seq || [])) + ' ' + JSON.stringify(p.res) + ' vs ' + JSON.stringify(a.res)}`); });
    console.log(`  Browser (page's reference path) vs Node: identical ${same}/${FIGHTS.length}`);
    // 5. the game's battle path: a real conquest fight with Auto-play, from a forced seed
    const uiFights = FIGHTS.filter(f=> !f.endless).filter((f, i)=> i % Math.max(1, Math.floor(FIGHTS.length / Math.max(1, N_UI))) === 0).slice(0, N_UI);
    const playUi = async (f, seed, speed)=> pg.evaluate(`(async()=>{
      const sleepMs = ms=> new Promise(r=> setTimeout(r, ms));
      if(matchState && !matchState.over){ try{ matchState.over = true; }catch(e){} }
      __E5.rec.games = []; __E5.rec.on = true; __E5.rec.label = 'ui'; __E5.rec.between = true;
      try{ setDialogueFlag('boss:${f.map}:${f.key}', true); }catch(e){}
      forcedNextSeed = ${seed};
      const started = startConquestMatch('${f.map}', '${f.key}', {skipEnergyCost: true, noAmbush: true, refSet: 'ladder-1'}); // a fresh save owns no deck: the map's first reference-ladder deck
      const m = matchState; __E5.rec.on = false;
      if(!started || !m || m.mode !== 'conquest') return {err: 'did not start (' + started + ', ' + (m && m.mode) + ')'};
      m.speedMult = ${speed}; m.autoplay = true; const t0 = Date.now();
      while(!m.over && Date.now() - t0 < 240000){
        // a draw offer or a surrender prompt: take what the CPU offers (the same answer every run)
        const yes = document.querySelector('#npcPromptOverlay:not([hidden]) button, .dialogue-overlay:not([hidden]) button');
        if(yes) try{ yes.click(); }catch(e){}
        await sleepMs(250); }
      const g = __E5.rec.games[0];
      return {over: !!m.over, winner: m.winner, round: m.round, seed: currentMatchSeed, hp: [m.players[1].hq.hp, m.players[2].hq.hp], log: __E5.digest(g), ms: Date.now() - t0};
    })()`);
    let uiSame = 0, uiDiff = 0, uiN = 0;
    for(const f of uiFights){
      const x = await playUi(f, SEED, 8), y = await playUi(f, SEED, 40), z = await playUi(f, SEED2, 40); uiN++;
      const tag = `${f.map} ${f.key} (game path)`;
      if(x.err || y.err || z.err){ ok(false, `${tag}: ${x.err || y.err || z.err}`); continue; }
      ok(x.over && y.over, `${tag}: the fight did not finish (${x.ms} ms, ${y.ms} ms)`);
      const s = x.log.h === y.log.h && x.winner === y.winner && x.round === y.round && x.hp.join() === y.hp.join(); if(s) uiSame++;
      ok(s, `${tag}: same seed at 8x and 40x gave different fights: ${JSON.stringify(E5.firstDiff(x.log.seq, y.log.seq))} winner ${x.winner}/${y.winner} round ${x.round}/${y.round} hp ${x.hp}/${y.hp}`);
      if(z.log.h !== x.log.h) uiDiff++;
      // what the app wrote into the players between engine calls must be the game's own flow (the turn flags, Auto-play lending your leader,
      // the CPU's loop cards, the bramble's setup before the first turn, the HUD's deck caches), never an effect changing the fight
      const odd = [].concat(...x.log.between.map(bw=> bw.paths.filter(pth=> !/^P\.\d+ null->/.test(pth)).map(pth=> ({bw, pth, key: pth.split(' ')[0].split('.')[2]}))))
        .filter(o=> !(BETWEEN_OK.includes(o.key) || (o.key === 'hq' && o.bw.i <= 4)));
      ok(!odd.length, `${tag}: the page changed fight state between engine calls: ${odd.slice(0, 4).map(o=> '#' + o.bw.i + ' ' + o.pth).join(' | ')}`);
      if(DEBUG) x.log.between.forEach(bw=> console.log(`    between calls, before #${bw.i} ${bw.call}: ${bw.paths.join(' | ')}`));
      console.log(`  ${tag}: winner ${x.winner}, round ${x.round}, ${x.log.calls} engine calls, ${Math.round(x.ms / 1000)}s + ${Math.round(y.ms / 1000)}s; seed ${SEED2}: ${z.log.h !== x.log.h ? 'differs' : 'SAME'}`);
    }
    ok(uiDiff === uiN, `game path: another seed should give another fight (${uiDiff}/${uiN})`);
    console.log(`  Browser (game's battle path, Auto-play): same seed at two speeds identical ${uiSame}/${uiN}; another seed differs ${uiDiff}/${uiN}`);
    // 7. the game's raid (three rows a side, allies, the boss's rows and Commons): the first rounds from one forced seed, twice
    if(N_UI > 0){
      const playRaid = async (seed)=> pg.evaluate(`(async()=>{
        const sleepMs = ms=> new Promise(r=> setTimeout(r, ms));
        if(matchState && !matchState.over){ try{ matchState.over = true; }catch(e){} }
        deckSizeOkOrWarn = ()=> true; payRaidAttempt = ()=> true; // a fresh save: no tickets, no owned deck (the fight builds what it can)
        const def = (typeof raidDefs === 'function' ? raidDefs() : RAID_DEFS_BASE).find(d=> d.trench) || RAID_DEFS_BASE[0];
        const part = (def.parts || []).find(p=> !(p.lockedUntil || []).length);
        __E5.rec.games = []; __E5.rec.on = true; __E5.rec.between = false; forcedNextSeed = ${seed};
        try{ startRaidPartMatch(def, part.id); } finally { __E5.rec.on = false; }
        const m = matchState; if(!m || !m.raidFull) return {err: 'raid did not start (' + (m && m.mode) + ')'};
        m.speedMult = 40; m.autoplay = true; const t0 = Date.now();
        while(!m.over && m.round < 4 && Date.now() - t0 < 180000) await sleepMs(250);
        m.autoplay = false; while(m.resolving && Date.now() - t0 < 200000) await sleepMs(100);
        const g = __E5.rec.games[0]; return {raid: def.id + ':' + part.id, round: m.round, log: __E5.digest(g), ms: Date.now() - t0};
      })()`);
      const r1 = await playRaid(SEED), r2 = await playRaid(SEED), r3 = await playRaid(SEED2);
      if(r1.err || r2.err || r3.err) ok(false, 'raid (game path): ' + (r1.err || r2.err || r3.err));
      else {
        const k = Math.min(r1.log.seq.length, r2.log.seq.length), same = k >= 10 && r1.log.seq.slice(0, k).join() === r2.log.seq.slice(0, k).join();
        const k3 = Math.min(k, r3.log.seq.length), other = r1.log.seq.slice(0, k3).join() !== r3.log.seq.slice(0, k3).join();
        ok(same, `raid ${r1.raid} (game path): same seed, different fights: ${JSON.stringify(E5.firstDiff(r1.log.seq.slice(0, k), r2.log.seq.slice(0, k)))} (${k} calls)`);
        ok(other, `raid ${r1.raid} (game path): another seed gave the same fight`);
        console.log(`  Browser (game's raid, ${r1.raid}): same seed, first ${k} engine calls (to round ${Math.min(r1.round, r2.round)}) ${same ? 'identical' : 'DIFFER'}; another seed ${other ? 'differs' : 'SAME'}`);
      }
    }
    await ctx.close();
  } finally { await b.close(); }
  ok(errs.length === 0, 'no page errors ' + errs.slice(0, 3).join(' | '));
}
browser().then(()=>{ console.log(fail ? `e5det: ${fail} of ${n} checks FAILED` : `e5det: ${n} checks passed`); process.exit(fail ? 1 : 0); },
  e=>{ console.log('  x browser part crashed:', e && e.stack || e); process.exit(1); });
