#!/usr/bin/env node
// The owner's standard skill test (2026-10-21, package MT; owner 16:33, docs/workflows/balance.md "Measuring a skill's worth: the
// standard test"). Fast, and every result is comparable:
//   test side   a deck of 20 units, 3/10 each, with one skill (--mono) or two (--duo); the vanilla 3/10 deck is the control, and a deck
//               of 3/10s that each carry a random skill (two in --duo) from the set is the "random" row.
//   standard    a deck of 20 vanilla 4/11 units. Each turn (after its play) the enemy bramble gives one random creature of its own
//   enemy       +1/+0 or +0/+1 (a coin flip, its own seeded stream, so the engine's draws are untouched).
//   brambles    both 35 Health, no abilities.
//   games       --games fights per setup (default 10,000); seeds are shared by every setup (common random numbers), sides alternate.
//   worth       per skill (and per pair in --duo): its win rate against the standard enemy, the gain over the vanilla deck, and that gain
//               in budget points the way tools/skill_worth.js converts its deltas: the vanilla 3/10 + ΔHealth and + ΔAttack curves
//               against the same enemy, the win rate inverted on each (its isotonic invert), S = (ΔH + 2·ΔA) / 2 (Health 1, Attack 2,
//               budget v3). A skill that needs company (SKILL_ENABLER: Hunter's Poison ...) runs with it and the enabler alone is
//               taken off. --duo adds each pair's synergy: S(pair) − S(a) − S(b).
// The engine runs headless through tests/lib/harness.js (the live cards, so the tokens skills spawn exist), both seats the Smart CPU
// with aiAim, Open battles, the stall rule and round cap of tools/skill_worth.js's games. The plain field only: a skill bound to a
// field (Nocturnal, Tide, Darksight ...) reads as it does by day on open ground.
//
//   node tools/skill_test.js --mono|--duo [--games 10000] [--skills quick,armor=1/2/3] [--jobs 2] [--curve-games N] [--wait 1]
//        [--cost 1] [--unit 3/10] [--foe 4/11] [--out docs/balance/skill-test-<mode>-<date>.json]
//   --unit / --foe  the test unit's and the standard enemy's stats (the owner's 3/10 and 4/11 unless set). Note (first run, 2026-10-21):
//             at Wait 1 / Lumber 1 the vanilla 3/10 deck almost never beats the 4/11 deck, so a small skill can't move it off 0%.
//   --skills  the set (default: every keyword skill in canonical/skill-costs.json the plain test can play); "armor=1/2/3" runs Armor
//             at 1, 2 and 3 (in --duo a pair takes each skill's first value); otherwise the value most live cards print.
//   --jobs    worker threads (the games are dealt out in chunks; the result is the same for any --jobs).
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const H = require(path.join(ROOT, 'tests', 'lib', 'harness.js')), E = H.Engine;
const SW = require('./skill_worth.js');
let WT = null; try{ WT = require('worker_threads'); }catch(e){ WT = null; }

const UNIT = {attack:3, health:10}, FOE = {attack:4, health:11}, BRAMBLE = 35, DECK = 20;
const r2 = v=> Math.round(v * 100) / 100, r3 = v=> Math.round(v * 1000) / 1000;
const seedOf = g=> H.hashStr('skill-test|' + g);

// ---------------------------------------------------------------------------------------------------------------------------
// One fight. testDeck / foeDeck are {defId: count}; the test deck sits in seat 1 on even games and seat 2 on odd ones.
// ---------------------------------------------------------------------------------------------------------------------------
function playGame(defs, testDeck, foeDeck, g){
  const seed = seedOf(g), engine = E.makeSimEngine(defs, H.seededRng(seed), {battleMode:'open', rules:{}, aiAim:true, aiLevel:1});
  const buff = H.seededRng((seed ^ 0x5bd1e995) >>> 0), T = g % 2 === 0 ? 1 : 2, X = 3 - T, stats = {}, sideOf = H.sideOf;
  const P = {}; P[T] = engine.newPlayer(T, testDeck, {id:'st-hq', health:BRAMBLE, effects:{}}); P[X] = engine.newPlayer(X, foeDeck, {id:'st-hq', health:BRAMBLE, effects:{}});
  engine.draw(P[1], 3, 'A', stats, null); engine.draw(P[2], 3, 'B', stats, null);
  let r = 1, over = false, last = null, st = 0;
  for(; r <= E.DRAW_ROUND_CAP && !over; r++){
    engine.setSuddenDeath(r >= E.SUDDEN_DEATH_ROUND, r >= E.SUDDEN_DEATH_CASTLE_ROUND ? 2 : 1);
    [1, 2].forEach(p=>{ P[p].playedThisTurn = false; P[p].discardUsedThisTurn = false; });
    if(r > 1) engine.roundStart(P, r, sideOf, stats, null);
    engine.aiTakeTurn(P, sideOf, 1, stats, null); engine.aiTakeTurn(P, sideOf, 2, stats, null);
    // the enemy bramble: one random creature of its own +1/+0 or +0/+1
    { const mine = engine.allBoardCards(P[X]).filter(c=> c.hp > 0 && !c.cageOf);
      if(mine.length){ const c = mine[Math.floor(buff() * mine.length)]; if(buff() < 0.5){ c.atk += 1; c.baseAtk += 1; } else { c.hp += 1; c.maxHp += 1; } } }
    over = engine.resolveCombat(P, sideOf, stats, null, r % 2 === 0 ? 1 : 2); if(over) break;
    const s = E.boardSignature(P); st = (s === last && E.noActionsLeft(P)) ? st + 1 : 0; last = s; if(st >= 2 && r >= E.STALL_DRAW_FROM_ROUND) break;
    engine.draw(P[1], 1, 'A', stats, null); engine.draw(P[2], 1, 'B', stats, null);
  }
  const a = P[T].hq.hp <= 0, b = P[X].hq.hp <= 0;
  return over && b && !a ? 1 : over && a && !b ? -1 : 0;
}

// ---------------------------------------------------------------------------------------------------------------------------
// Units and decks. A row is {key, label, kind, effects, rarity, da, dh} (one unit, 20 copies) or {key, kind:'random', pool:[[effects,
// rarity], ...], per:1|2} (each of the 20 draws its own skill(s) from the pool, a stream of its own per game).
// ---------------------------------------------------------------------------------------------------------------------------
function unitDef(defs, o, wait, cost){
  const id = 'st-' + H.hashStr(JSON.stringify([o.effects || {}, o.rarity || 'common', o.da || 0, o.dh || 0, wait, cost])).toString(36);
  if(!defs[id]) defs[id] = {id, name:id, icon:'🧪', cost, wait, attack: Math.max(0, UNIT.attack + (o.da || 0)), health: Math.max(1, UNIT.health + (o.dh || 0)),
    rarity: o.rarity || 'common', effects: JSON.parse(JSON.stringify(o.effects || {})), test:true};
  return id; }
function deckFor(defs, row, g, wait, cost){
  if(row.kind !== 'random') return {[unitDef(defs, row, wait, cost)]: DECK};
  const rng = H.seededRng((seedOf(g) ^ 0x2545f491) >>> 0), deck = {};
  for(let i = 0; i < DECK; i++){ const picks = [], n = Math.min(row.per, row.pool.length);
    while(picks.length < n){ const k = Math.floor(rng() * row.pool.length); if(!picks.includes(k)) picks.push(k); }
    const fx = Object.assign({}, ...picks.map(k=> row.pool[k][0])), rar = picks.some(k=> row.pool[k][1] === 'legendary') ? 'legendary' : undefined;
    const id = unitDef(defs, {effects: fx, rarity: rar}, wait, cost); deck[id] = (deck[id] || 0) + 1; }
  return deck; }
function runChunk(defs, row, g0, g1, wait, cost){
  const foe = {[(()=>{ const id = ['st-foe', FOE.attack, FOE.health, wait, cost].join('-'); if(!defs[id]) defs[id] = {id, name:'Standard enemy', icon:'🧱', cost, wait, attack:FOE.attack, health:FOE.health, rarity:'common', effects:{}, test:true}; return id; })()]: DECK};
  let w = 0, l = 0, d = 0;
  for(let g = g0; g < g1; g++){ const res = playGame(defs, deckFor(defs, row, g, wait, cost), foe, g); if(res > 0) w++; else if(res < 0) l++; else d++; }
  return {key: row.key, w, l, d, n: g1 - g0}; }

// ---------------------------------------------------------------------------------------------------------------------------
// The worker: the live cards once, then chunks.
// ---------------------------------------------------------------------------------------------------------------------------
if(WT && !WT.isMainThread && WT.workerData && WT.workerData.skillTest){
  const defs = Object.assign({}, H.loadCardDefs()), {wait, cost} = WT.workerData; Object.assign(UNIT, WT.workerData.unit); Object.assign(FOE, WT.workerData.foe);
  WT.parentPort.on('message', m=>{ if(m === 'stop'){ process.exit(0); } WT.parentPort.postMessage(runChunk(defs, m.row, m.g0, m.g1, wait, cost)); });
} else if(require.main === module) main();

// ---------------------------------------------------------------------------------------------------------------------------
function main(){
  const argv = process.argv.slice(2), has = k=> argv.includes('--' + k);
  const opt = (k, d)=>{ const i = argv.findIndex(a=> a === '--' + k || a.startsWith('--' + k + '=')); if(i < 0) return d; const a = argv[i];
    return a.includes('=') ? a.slice(a.indexOf('=') + 1) : (argv[i + 1] != null && !argv[i + 1].startsWith('--') ? argv[i + 1] : d); };
  const mode = has('duo') ? 'duo' : has('mono') ? 'mono' : null;
  if(!mode){ console.log('usage: node tools/skill_test.js --mono|--duo [--games 10000] [--skills quick,armor=1/2/3] [--jobs 2] [--curve-games N] [--wait 1] [--cost 1] [--unit 3/10] [--foe 4/11] [--out file.json]'); process.exit(1); }
  const G = Math.max(2, Math.round(Number(opt('games', 10000)) || 10000)), CG = Math.max(2, Math.round(Number(opt('curve-games', G)) || G));
  const JOBS = Math.max(1, Math.round(Number(opt('jobs', 1)) || 1)), WAIT = Math.max(0, Math.round(Number(opt('wait', 1)))), COST = Math.max(0, Math.round(Number(opt('cost', 1))));
  const statsArg = (k, o)=>{ const m = /^(\d+)\/(\d+)$/.exec(String(opt(k, ''))); if(m){ o.attack = +m[1]; o.health = Math.max(1, +m[2]); } };
  statsArg('unit', UNIT); statsArg('foe', FOE); // the owner's 3/10 and 4/11 unless set
  const table = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')), defs = Object.assign({}, H.loadCardDefs()), cs = SW.census(defs);
  const entry = id=> (table.skills || []).find(e=> e.id === id) || {id, scale:'half'};
  const typical = e=> SW.TYPICAL[e.id] != null ? SW.TYPICAL[e.id] : (()=>{ const t = SW.typicalOf(cs, e.id); return t != null ? t : e.scale === 'n' ? (e.payDefault || 2) : true; })();
  const parseVal = s=> s === 'true' ? true : /^-?\d+(\.\d+)?$/.test(s) ? Number(s) : s;
  // the set: --skills, else every keyword skill the plain test can play (not the ones tools/skill_worth.js can't measure, not a parameter)
  const want = String(opt('skills', '')).split(',').map(s=> s.trim()).filter(Boolean);
  const set = (want.length ? want.map(s=>{ const [id, vs] = s.split('='); return {id, values: vs ? vs.split('/').map(parseVal) : null}; })
    : (table.skills || []).filter(e=> !SW.WHY[e.id] && !SW.PARAM_OF[e.id]).map(e=> ({id: e.id, values: null})))
    .map(s=>{ const e = entry(s.id); return Object.assign(s, {e, values: s.values || [typical(e)], enabler: SW.SKILL_ENABLER[s.id] || null, rarity: e.legendary ? 'legendary' : undefined}); });
  if(!set.length){ console.log('no skills'); process.exit(1); }
  const rows = [], byKey = {}, add = r=>{ if(!byKey[r.key]){ byKey[r.key] = r; rows.push(r); } return byKey[r.key]; };
  const sigOf = (fx, rar)=> JSON.stringify([fx, rar || '']);
  add({key:'vanilla', label:'vanilla 3/10', kind:'vanilla', effects:{}});
  const gridH = [...new Set([-0.75, -0.5, -0.25, 0, 0.125, 0.25, 0.375, 0.5, 0.75, 1, 1.5, 2, 3, 4, 5].map(f=> Math.max(-(UNIT.health - 1), Math.round(f * UNIT.health))))].sort((x, y)=> x - y);
  const gridA = [...new Set([-1, -0.5, 0, 0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4].map(f=> Math.max(-UNIT.attack, Math.round(f * UNIT.attack))))].sort((x, y)=> x - y);
  gridH.filter(d=> d).forEach(d=> add({key:'h' + d, kind:'curve', dh:d, effects:{}, games:CG}));
  gridA.filter(d=> d).forEach(d=> add({key:'a' + d, kind:'curve', da:d, effects:{}, games:CG}));
  const monoRow = (s, v)=>{ const fx = Object.assign({}, s.enabler || {}, {[s.id]: v});
    if(s.enabler) add({key:'en:' + sigOf(s.enabler), label:'enabler ' + JSON.stringify(s.enabler), kind:'enabler', effects: Object.assign({}, s.enabler)});
    return add({key:'mono:' + sigOf(fx, s.rarity), label: s.id + (v === true ? '' : ' ' + JSON.stringify(v)), kind:'mono', ids:[s.id], value:v, effects:fx, rarity:s.rarity, enKey: s.enabler ? 'en:' + sigOf(s.enabler) : null}); };
  set.forEach(s=> s.values.forEach(v=> monoRow(s, v)));
  add({key:'random1', label:'random skill (1 a unit)', kind:'random', per:1, pool: set.map(s=> [Object.assign({}, s.enabler || {}, {[s.id]: s.values[0]}), s.rarity])});
  if(mode === 'duo'){
    for(let i = 0; i < set.length; i++) for(let j = i + 1; j < set.length; j++){ const a = set[i], b = set[j];
      const en = Object.assign({}, a.enabler || {}, b.enabler || {}), fx = Object.assign({}, en, {[a.id]: a.values[0], [b.id]: b.values[0]}), rar = a.rarity || b.rarity;
      if(Object.keys(en).length) add({key:'en:' + sigOf(en), label:'enabler ' + JSON.stringify(en), kind:'enabler', effects: Object.assign({}, en)});
      add({key:'duo:' + sigOf(fx, rar), label: a.id + ' + ' + b.id, kind:'duo', ids:[a.id, b.id], effects:fx, rarity:rar, enKey: Object.keys(en).length ? 'en:' + sigOf(en) : null,
        parts:[byKey['mono:' + sigOf(Object.assign({}, a.enabler || {}, {[a.id]: a.values[0]}), a.rarity)].key, byKey['mono:' + sigOf(Object.assign({}, b.enabler || {}, {[b.id]: b.values[0]}), b.rarity)].key]}); }
    add({key:'random2', label:'random skills (2 a unit)', kind:'random', per:2, pool: set.map(s=> [Object.assign({}, s.enabler || {}, {[s.id]: s.values[0]}), s.rarity])});
  }
  // chunks of games, dealt out to --jobs workers (or run here)
  const CH = Math.max(25, Math.min(500, Math.ceil(G / (JOBS * 4)))), chunks = [];
  rows.forEach(r=>{ const n = r.games || G; for(let g = 0; g < n; g += CH) chunks.push({row: r, g0: g, g1: Math.min(n, g + CH)}); });
  const totalGames = chunks.reduce((s, c)=> s + c.g1 - c.g0, 0), tally = {}, t0 = Date.now(); let doneGames = 0, lastLog = 0;
  console.log(`skill test (${mode}): ${set.length} skill${set.length === 1 ? '' : 's'}, ${rows.length} setups (${rows.filter(r=> r.kind === 'curve').length} for the vanilla + Δ curves), ${G} games a setup` +
    `${CG !== G ? ` (${CG} a curve point)` : ''}, ${totalGames} games in all, ${JOBS} job${JOBS === 1 ? '' : 's'}; units ${UNIT.attack}/${UNIT.health} vs ${FOE.attack}/${FOE.health}, Wait ${WAIT}, Lumber ${COST}, brambles ${BRAMBLE}`);
  const take = res=>{ const t = tally[res.key] || (tally[res.key] = {w:0, l:0, d:0, n:0}); ['w', 'l', 'd', 'n'].forEach(k=> t[k] += res[k]); doneGames += res.n;
    if(Date.now() - lastLog > 15000){ lastLog = Date.now(); const s = (Date.now() - t0) / 1000; console.log(`  ${doneGames}/${totalGames} games, ${Math.round(s)} s (about ${Math.round(s / doneGames * (totalGames - doneGames))} s left)`); } };
  const finish = ()=> report(mode, rows, byKey, tally, gridH, gridA, {G, CG, JOBS, WAIT, COST, ms: Date.now() - t0, games: totalGames}, opt('out', null));
  if(JOBS === 1 || !WT){ chunks.forEach(c=> take(runChunk(defs, c.row, c.g0, c.g1, WAIT, COST))); finish(); return; }
  let next = 0, live = 0;
  for(let j = 0; j < Math.min(JOBS, chunks.length); j++){
    const w = new WT.Worker(__filename, {workerData: {skillTest: true, wait: WAIT, cost: COST, unit: UNIT, foe: FOE}}); live++;
    const feed = ()=>{ if(next < chunks.length){ const c = chunks[next++]; w.postMessage({row: c.row, g0: c.g0, g1: c.g1}); } else { w.postMessage('stop'); } };
    w.on('message', res=>{ take(res); feed(); });
    w.on('error', e=>{ console.error('worker error:', e && e.stack || e); process.exit(2); });
    w.on('exit', ()=>{ if(--live === 0) finish(); });
    feed();
  }
}

// ---------------------------------------------------------------------------------------------------------------------------
// From win rates to budget points (tools/skill_worth.js's conversion: the isotonic invert on the vanilla + Δ curves, S = (ΔH + 2ΔA)/2).
// ---------------------------------------------------------------------------------------------------------------------------
function report(mode, rows, byKey, tally, gridH, gridA, meta, outFile){
  const lab = SW.makeLab({defs:{}}), wrOf = k=>{ const t = tally[k]; return t && t.n ? (t.w + t.d / 2) / t.n : null; }, v0 = wrOf('vanilla');
  const curve = (pre, grid)=> grid.map(d=> ({d, wr: d === 0 ? v0 : wrOf(pre + d)}));
  const cH = curve('h', gridH), cA = curve('a', gridA);
  // read relative to the vanilla deck's own reading, so an unchanged win rate is S 0 even where the curve is flat; a win rate at or past
  // either end of a curve (a deck that never or always wins) is only a bound: '<' at the bottom, '>' at the top
  const ends = c=> [Math.min(...c.map(p=> p.wr)), Math.max(...c.map(p=> p.wr))];
  const base = {h: lab.invert(cH, v0).d, a: lab.invert(cA, v0).d};
  const worth = wr=>{ const h = lab.invert(cH, wr), a = lab.invert(cA, wr), dh = h.d - base.h, da = a.d - base.a, [hl, hh] = ends(cH), [al, ah] = ends(cA);
    const clamp = h.clamp || a.clamp || (wr <= Math.max(hl, al) ? '<' : wr >= Math.min(hh, ah) ? '>' : null);
    return {dh: r2(dh), da: r2(da), S: r2((dh + 2 * da) / 2), clamp}; };
  const out = [], S = {};
  rows.filter(r=> r.kind !== 'curve').forEach(r=>{ const wr = wrOf(r.key), t = tally[r.key] || {}, x = worth(wr);
    S[r.key] = x.S; const o = {key: r.key, label: r.label, kind: r.kind, ids: r.ids, value: r.value, wr: r3(wr), se: r3(Math.sqrt(wr * (1 - wr) / Math.max(1, t.n))), w: t.w, l: t.l, d: t.d, n: t.n,
      delta: r3(wr - v0), dh: x.dh, da: x.da, S: x.S, clamp: x.clamp}; out.push(o); });
  out.forEach(o=>{ const r = byKey[o.key]; if(r.enKey){ o.Sgross = o.S; o.S = r2(o.S - S[r.enKey]); o.enabler = r.enKey; }
    if(typeof o.value === 'number' && o.value) o.perN = r2(o.S / Math.abs(o.value)); });
  const Sn = k=>{ const o = out.find(x=> x.key === k); return o ? o.S : 0; };
  out.forEach(o=>{ const r = byKey[o.key]; if(r.kind === 'duo') o.synergy = r2(o.S - Sn(r.parts[0]) - Sn(r.parts[1])); });
  const pct = v=> v == null ? '–' : (v * 100).toFixed(1) + '%', sg = v=> (v >= 0 ? '+' : '') + v;
  const lines = [`vanilla 3/10 vs the standard enemy: ${pct(v0)} (${(tally.vanilla || {}).n} games)`, '',
    ['setup'.padEnd(34), 'win rate', '  ±', ' Δ vanilla', '  S (pts)', mode === 'duo' ? ' synergy' : ''].join(' ')];
  const order = {vanilla:0, mono:1, enabler:2, duo:3, random:4};
  out.filter(o=> o.kind !== 'vanilla').sort((a, b)=> (order[a.kind] - order[b.kind]) || (b.S - a.S)).forEach(o=> lines.push([String(o.label).slice(0, 34).padEnd(34), pct(o.wr).padStart(8), pct(o.se).padStart(5),
    (sg(r2(o.delta * 100)) + 'pp').padStart(10), (String(o.S) + (o.clamp ? o.clamp : '')).padStart(9), o.synergy != null ? sg(o.synergy).padStart(8) : ''].join(' ')));
  if(v0 <= 0.02 || v0 >= 0.98) lines.splice(1, 0, `  note: the vanilla deck ${v0 <= 0.02 ? 'almost never wins' : 'almost always wins'}; a skill too small to change that reads as S 0 with "${v0 <= 0.02 ? '<' : '>'}" (try --foe or --unit)`);
  lines.push('', `S: budget points (Health 1, Attack 2) of vanilla + ΔH / + ΔA that win as often, over the vanilla deck; ">" or "<" marks a win rate at or past the curves' range (a bound).` +
    `${out.some(o=> o.enabler) ? ' A skill run with an enabler has the enabler\'s S taken off.' : ''}`,
    `${meta.games} games, ${Math.round(meta.ms / 1000)} s, ${meta.JOBS} job${meta.JOBS === 1 ? '' : 's'}`);
  console.log(lines.join('\n'));
  if(outFile){ const data = {_about: 'tools/skill_test.js: the owner\'s standard skill test (docs/workflows/balance.md, 2026-10-21)', mode, generated: new Date().toISOString().slice(0, 10),
      setup: {unit: UNIT, foe: FOE, bramble: BRAMBLE, deck: DECK, wait: meta.WAIT, cost: meta.COST, games: meta.G, curveGames: meta.CG, foeBuff: 'one random enemy creature +1/+0 or +0/+1 a turn'},
      vanillaWr: r3(v0), curves: {h: cH.map(p=> ({d: p.d, wr: r3(p.wr)})), a: cA.map(p=> ({d: p.d, wr: r3(p.wr)}))}, rows: out, games: meta.games, ms: meta.ms};
    fs.mkdirSync(path.dirname(path.resolve(outFile)), {recursive: true}); fs.writeFileSync(outFile, JSON.stringify(data, null, 1) + '\n'); console.log('wrote', outFile); }
}
module.exports = {playGame, runChunk, UNIT, FOE, BRAMBLE};
