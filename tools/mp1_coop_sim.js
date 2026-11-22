#!/usr/bin/env node
// MP1 phase 1 (2026-11-23, owner 2026-11-22 23:08: "After currency calculations -> multiplayer features balancing"): the Tidelock
// Vault (bramblewood-coop.js DUNGEONS.hollow, 5 parts on one board) played headless, solo (your deck + the CPU ally's filler deck, as
// gdFillerDeck deals it) and as a duo (two players' decks). Both seats are piloted by CoopM.cpuChoice (the game's own Auto / CPU ally), so
// a human who plays better than Auto does better than this. The page's own pieces are evaluated out of arena_app.js (lib_bramble grab):
// buildStandardDefs (every card at Level 1, AR3-5), gdPartyCastle / mergeRaidCastles (the merged bramble), gdFillerDeck (the CPU's deck),
// brambleHp (the bramble scale). The run's pay is CoopM.runPay, halved as the page does (ECON_INCOME_MULT.coopDungeon).
// Decks: the REF6 ladder (docs/balance/ref6/ladder-100.json, 100 decks a map with their leaders) at Map 16 (mt, where the vault opens) and
// Map 20 (m11), picked by percentile of the ladder's strength score; and the Map 16 road reference (WINRATE_REF_DECKS.road[16], no leader).
//   node tools/mp1_coop_sim.js [--n 24] [--decks mt:10,mt:50,mt:90,m11:50,ref16] [--modes solo,duo] [--fresh] [--seed0 7100] [--set JSON] [--json out.json]
//   --fresh: each part also played alone from a fresh board (floorIdx k), so a part's own difficulty shows without the carry-over.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const B = require('./lib_bramble.js'), C = require(path.join(ROOT, 'bramblewood-coop.js')), Ghosts = require(path.join(ROOT, 'bramblewood-ghosts.js'));
const {E, G, CARD_DEFS_BASELINE, CHARACTER_DEFS} = B;
const arg = (k, d)=>{ const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const N = Number(arg('n', 24)), DECKS = String(arg('decks', 'mt:10,mt:50,mt:90,m11:50,ref16')).split(','), MODES = String(arg('modes', 'solo,duo')).split(',');
const FRESH = process.argv.includes('--fresh'), SEED0 = Number(arg('seed0', 7100)); // --seed0: fresh seeds for a confirm run
// --set '{"castleMult":1.5,"bossHpMult":2,"scale2":2,"ai":2}': try tuning values on the in-memory vault (DUNGEONS.hollow) without editing
// bramblewood-coop.js: every part's bramble x castleMult, the boss's hpMult, the 2-player healthScale, the vault CPU's aiLevel
const SET = arg('set', null) ? JSON.parse(arg('set')) : {};
{ const h = C.DUNGEONS.hollow; if(SET.castleMult) h.floors.forEach(f=>{ f.castle = Math.round(f.castle * SET.castleMult); });
  if(SET.bossHpMult) h.floors.forEach(f=>{ if(f.boss) f.boss.hpMult = SET.bossHpMult; }); if(SET.scale2) h.healthScale[1] = SET.scale2; }

// the page's functions, evaluated with the shims they need (no copy of their logic)
const P = new Function('G', 'CARD_DEFS_BASELINE', 'CHARACTER_DEFS', 'CoopM', 'Ghosts', [
  'let _stdDefsCache = null; const liveCards = {}, liveDeletes = {}; const statsAtLevel = G.statsAtLevel, cardBaseLevel = G.cardBaseLevel;',
  ...['BRAMBLE_SCALE', 'brambleHp', 'brambleChar', 'mergeRaidCastles', 'buildStandardDefs'].map(B.grab),
  'const GD = {}; function gdDefs(){ return buildStandardDefs(); }',
  ...['gdFillerDeck', 'gdPartyCastle', 'ECON_INCOME_MULT', 'ECON_HALVED_KINDS', 'econMult'].map(B.grab),
  'return {brambleHp, brambleChar, buildStandardDefs, gdFillerDeck, gdPartyCastle, econMult};'].join('\n'))(G, CARD_DEFS_BASELINE, CHARACTER_DEFS, C, Ghosts);
const DEFS = P.buildStandardDefs();
// --set '{"fillerStage":2}': the CPU ally's ghost-deck stage (gdFillerDeck asks generateGhostDeck for stage 2 since MP1 phase 2, 2026-11-23; was 3), by wrapping the module call
if(SET.fillerStage != null){ const orig = Ghosts.generateGhostDeck; Ghosts.generateGhostDeck = (d, st, seed, mx)=> orig(d, SET.fillerStage, seed, mx); }

const LADDER = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/balance/ref6/ladder-100.json'), 'utf8')).maps;
// a deck key: "<mapId>:<percentile>" (the ladder, sorted by its score) or "ref16" (the road reference). Returns [deck, partner] for a duo.
// "starter" (WINRATE_REF_DECKS.starter), "ref<N>" (the Map N road reference, no leader), "pro:<mapId>:<i>" / "bpro:<mapId>:<i>" (a PRO / BPRO
// deck of canonical/pro-skirmishes.json with its leader; the duo partner is the next deck of that list)
const PROS = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/pro-skirmishes.json'), 'utf8')).maps;
function decksFor(key){
  const same = (name, d)=> [{name, deck: Object.assign({}, d), leader: null}, {name, deck: Object.assign({}, d), leader: null}];
  if(key === 'starter') return same(key, G.WINRATE_REF_DECKS.starter);
  if(/^ref\d+$/.test(key)) return same(key, G.WINRATE_REF_DECKS.road[Number(key.slice(3))]);
  if(/^b?pro:/.test(key)){ const [kind, mapId, i] = key.split(':'), list = PROS[mapId][kind], mk = x=> ({name: key, deck: Object.assign({}, x.deck), leader: (x.leaders || [])[0] || null});
    return [mk(list[Number(i)]), mk(list[(Number(i) + 1) % list.length])]; }
  const [mapId, pct] = key.split(':'), list = LADDER[mapId].decks.slice().sort((a, b)=> a.score - b.score);
  const i = Math.max(0, Math.min(list.length - 2, Math.round(Number(pct) / 100 * (list.length - 1))));
  const mk = x=> ({name: key, deck: Object.assign({}, x.counts), leader: x.leader && x.leader !== 'wandering-traveller' && DEFS[x.leader] ? x.leader : null, score: x.score});
  return [mk(list[i]), mk(list[i + 1])];
}
const castleId = 'castle';
function seatsFor(mode, pair, seed){
  const s0 = {seat: 0, name: 'p1', deck: pair[0].deck, leader: pair[0].leader, castle: castleId, castleHp: 20, cpu: false};
  if(mode === 'duo') return [s0, {seat: 1, name: 'p2', deck: pair[1].deck, leader: pair[1].leader, castle: castleId, castleHp: 20, cpu: false}];
  const filler = P.gdFillerDeck(seed, 1); // the page's CPU ally (gdFillCpuSeats): a ghost deck from the run's seed, no leader
  return [s0, {seat: 1, cpu: true, name: '', deck: filler, leader: null, castle: null, castleHp: 20}];
}
function table(seats, seed, floorIdx){
  return C.createTable({makeSimEngine: E.makeSimEngine, defs: DEFS, seed, typeId: 'hollow', floorIdx, seats, partyCastle: P.gdPartyCastle(seats), brambleHp: P.brambleHp, recordEvents: false, aiLevel: SET.ai != null ? SET.ai : undefined});
}
// one run from part 0 (or one part alone, from a fresh board, when only is set)
function playRun(seats, seed, only){
  const T = table(seats, seed, only != null ? only : 0); let r = {over: null}, guard = 0, partStartRound = 1, idx = T.floorIdx;
  const parts = [];
  while(!r.over && guard++ < 200){
    C.cpuActs(T, 0); C.cpuActs(T, 1); r = C.headlessRound(T);
    if(T.floorIdx !== idx){ const prev = T.lastAdvance && T.lastAdvance.prev; parts.push({idx, won: true, rounds: T.round - partStartRound + 0, hpPct: prev ? prev.hp / prev.maxHp : null}); idx = T.floorIdx; partStartRound = T.round; if(only != null) break; }
  }
  if(r.over || guard >= 200){ const rec = (T.partLog || []).find(x=> x.idx === idx) || {}; if(!parts.some(p=> p.idx === idx)) parts.push({idx, won: T.over === 'won', rounds: T.round - partStartRound + 1, hpPct: rec.maxHp ? rec.hp / rec.maxHp : 0, reason: T.reason}); }
  const pay = C.runPay('hollow', T.partLog || []);
  return {parts, cleared: only == null && pay.cleared, pay, rounds: T.round, partyMax: T.players[1].hq.maxHp, ranks: (T.partLog || []).filter(x=> x.won).map(x=> x.rank)};
}
const pct = (a, b)=> b ? Math.round(a / b * 100) : '-';
function main(){
  const nParts = C.partsOf('hollow'), rows = [], t0 = Date.now();
  const half = k=> P.econMult('coopDungeon', k);
  for(const key of DECKS) for(const mode of MODES){
    const pair = decksFor(key), reached = Array(nParts).fill(0), won = Array(nParts).fill(0), rounds = Array(nParts).fill(0), hp = Array(nParts).fill(0), timeouts = Array(nParts).fill(0);
    let clears = 0, gold = 0, dust = 0, partsWon = 0, maxHp = 0; const ranks = {};
    for(let g = 0; g < N; g++){
      const seed = (SEED0 + 7919 * g) >>> 0, seats = seatsFor(mode, pair, seed), res = playRun(seats, seed);
      maxHp = res.partyMax;
      res.parts.forEach(p=>{ reached[p.idx]++; if(p.won){ won[p.idx]++; partsWon++; } rounds[p.idx] += p.rounds; hp[p.idx] += p.hpPct || 0; if(p.reason === 'time') timeouts[p.idx]++; });
      if(res.cleared) clears++; gold += Math.round(res.pay.gold * half('gold')); dust += Math.round(res.pay.dust * half('dust'));
      res.ranks.forEach(k=>{ ranks[k] = (ranks[k] || 0) + 1; });
    }
    const fresh = [];
    if(FRESH) for(let k = 0; k < nParts; k++){ let w = 0, rd = 0; for(let g = 0; g < N; g++){ const seed = (9100 + 7919 * g + k) >>> 0, res = playRun(seatsFor(mode, pair, seed), seed, k); const p = res.parts[0] || {}; if(p.won) w++; rd += p.rounds || 0; } fresh.push({part: k, winPct: pct(w, N), rounds: +(rd / N).toFixed(1)}); }
    const row = {deck: key, mode, n: N, leader: pair[0].leader, score: pair[0].score, partyHp: maxHp, fullClearPct: pct(clears, N), partsWonAvg: +(partsWon / N).toFixed(2),
      parts: reached.map((r, i)=> ({part: i, reached: r, winPctOfReached: pct(won[i], r), rounds: r ? +(rounds[i] / r).toFixed(1) : null, hpLeftPct: r ? Math.round(hp[i] / r * 100) : null, timeouts: timeouts[i]})),
      payAvg: {gold: Math.round(gold / N), dust: Math.round(dust / N)}, payPerEnergy: {gold: +(gold / N / C.ENERGY_COST).toFixed(1), dust: +(dust / N / C.ENERGY_COST).toFixed(1)}, ranks, fresh};
    rows.push(row);
    console.log(`${key.padEnd(7)} ${mode.padEnd(4)} lead ${String(row.leader || '-').padEnd(20)} party ${maxHp} | full clear ${row.fullClearPct}% | parts won ${row.partsWonAvg} | per part (win% of reached / rounds / hp left%): ${row.parts.map(p=> `${p.winPctOfReached}/${p.rounds}/${p.hpLeftPct}${p.timeouts ? 't' + p.timeouts : ''}`).join('  ')} | pay ${row.payAvg.gold} L / ${row.payAvg.dust} D a run${fresh.length ? ' | fresh parts ' + fresh.map(f=> f.winPct + '%').join(' ') : ''}  (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
  }
  const out = arg('json', null); if(out){ fs.writeFileSync(path.resolve(out), JSON.stringify({tool: 'tools/mp1_coop_sim.js', date: '2026-11-23', n: N, rows}, null, 1)); console.log('wrote', out); }
}
main();
