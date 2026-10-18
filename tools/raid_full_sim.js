#!/usr/bin/env node
// The full raid (raidFull: three rows a side), played CPU v CPU with the game's own fight build (2026-10-19, package RX, owner 20:48:
// "The raid is too hard. Make it easier. Make normal decks able to do some damage."). It evaluates arena_app.js's buildRaidFullFight,
// raidAlliesTurn, raidSpecials, raidBossUnit and raidBossCommons (via tools/lib_bramble.js's grab), and plays each round the way the
// page does: allies first (round 1), you (the W2 reference deck at its map's level, the CPU's smart level), the boss, combat; then
// the round start, the boss's specials, the next ally card, a boss unit on rounds 3/7/11/15/19, its Commons, and the draws.
//   node tools/raid_full_sim.js [--n 40] [--parts left,right,tail,core] [--stages fresh,Enraged,Thrashing] [--decks starter,6,10,15,20]
//     [--raids canonical/raids.json] [--leader <cardId>]
// Prints, per deck x part x stage: average damage dealt to the part's bramble, the share of attempts reaching the raid's minDamage
// (the first paying tier; below it an attempt pays a pittance), the overwhelm share, and the average turns your bramble survived.
'use strict';
const path = require('path'), fs = require('fs');
const B = require('./lib_bramble.js');
const {E, G, CARD_DEFS_BASELINE, CHARACTER_DEFS} = B;
const RaidM = require('../bramblewood-raid.js'), TrenchM = require('../bramblewood-trench.js');

const arg = (k, d)=>{ const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const N = Number(arg('n', 30)), PARTS = String(arg('parts', 'left,right,tail,core')).split(','), STAGES = String(arg('stages', 'fresh,Enraged,Thrashing')).split(',');
const TRACE = process.argv.includes('--trace'), SET = arg('set', null) ? JSON.parse(arg('set')) : null; // --set '{"bossAtkPct":0.5}' tries tuning values
const DECKS = String(arg('decks', 'starter,6,10,15,20')).split(','), LEADER = arg('leader', null);
const RAIDS = JSON.parse(fs.readFileSync(path.resolve(arg('raids', path.join(__dirname, '..', 'canonical', 'raids.json'))), 'utf8'));

const NAMES = ['RARITY_TIER_BANDS', 'canLeadDef', 'RAID_BOSS_ATK', 'raidAllyOf', 'raidAllyLeaderOf', 'RAID_BOSS_UNIT_ROUNDS', 'raidBossUnit', 'RAID_BOSS_UNIT_NAMES',
  'raidBossUnitName', 'raidBossCommons', 'raidFieldRulesOf', 'mergeRaidCastles', 'raidAlliesTurn', 'raidAllyPlays', 'RAID_TUNE_DEFAULTS', 'raidTune', 'raidSmackRoll', 'RAID_SMACK_BACK_CHANCE', 'raidSmackBack', 'raidSmackKind',
  'raidRowUnits', 'raidColUnits', 'raidPickColumn', 'raidSmackRow', 'raidSmackTarget', 'raidSpecials', 'buildRaidFullFight', 'seededRng', 'referencePlayerDeck', 'referencePlayerLevel', 'levelGateMap'];
const body = [
  'let matchDefsOverlay = {}; const makeSimEngine = E.makeSimEngine; function getCardDefs(){ return Object.assign({}, CARD_DEFS_BASELINE, matchDefsOverlay); }',
  'function pushLog(){} function renderBoard(){} function allyPlayFx(){} const statsAtLevel = G.statsAtLevel, cardBaseLevel = G.cardBaseLevel;',
  ...NAMES.map(B.grab),
  'return {' + NAMES.filter(n=> !/^[A-Z_]+$/.test(n)).join(', ') + ', RAID_BOSS_UNIT_ROUNDS};',
].join('\n');
const A = new Function('E', 'G', 'CARD_DEFS_BASELINE', 'CHARACTER_DEFS', 'RaidM', 'TrenchM', body)(E, G, CARD_DEFS_BASELINE, CHARACTER_DEFS, RaidM, TrenchM);

function seeded(seed){ return A.seededRng(seed >>> 0); }
// The raid's state for a stage: fresh (no stage, the whole raid standing) or the named stage at its threshold.
function stateFor(def, stageName){
  const st = RaidM.raidState(def, [], 0, {cycle:0});
  if(stageName && stageName !== 'fresh'){ const sg = (def.stages || []).find(s=> s.name === stageName); if(sg){ st.stage = sg; const f = sg.at - 0.01; st.remaining = Math.round(st.total * f); st.parts.forEach(ps=>{ ps.remaining = Math.round(ps.total * f); }); } }
  return st;
}
function myDeckFor(key, overlay){
  const base = Object.assign({}, CARD_DEFS_BASELINE);
  if(key === 'starter') return {deck: G.WINRATE_REF_DECKS.starter, level: 1};
  const built = Object.keys(G.WINRATE_REF_DECKS.road).map(Number).sort((a, b)=> a - b), no = Number(key), at = built.filter(k=> k <= no).pop() || built[0];
  const level = A.referencePlayerLevel(no);
  return {deck: A.referencePlayerDeck(G.WINRATE_REF_DECKS.road[at], level, base, overlay), level};
}
function playOne(def, partId, stageName, deckKey, g){
  const rng = seeded(0x5A1D + g * 977 + partId.length * 31), saveRandom = Math.random; Math.random = seeded(0xA11E5 + g * 131);
  try{
    const playerOverlay = {}, me = myDeckFor(deckKey, playerOverlay);
    const st = stateFor(def, stageName), f = RaidM.fightFor(def, st, partId, {});
    const decks = (def.allyDecks || []).filter(d=> d.deck && Object.keys(d.deck).every(id=> CARD_DEFS_BASELINE[id]));
    const allies = [0, 1].map(i=>{ const d = decks[(g + i * 7 + i) % decks.length]; return A.raidAllyOf({name: d.name, deck: d.deck, level: 0}, i); });
    // the reference deck's level copies are base defs for this fight (getCardDefs folds the overlay in)
    Object.assign(CARD_DEFS_BASELINE, playerOverlay);
    const b = A.buildRaidFullFight(def, partId, f, st, {rng, allies, myCastle: Object.assign({}, CHARACTER_DEFS.castle || {id:'castle', health:30}), myDeck: me.deck, leaderId: LEADER, recordEvents:false, rand: Math.random});
    const {engine: En, players: P, sideOf} = b;
    const m = {raidDef: def, engine: En, players: P, sideOf, stats: b.stats, round: 1, raidFull: true, over: false, raidAllies: allies, raidAttacks: b.cfg.attacks || [], raidPending: {},
      raidCommonPool: b.commonPool, raidBossUnitId: b.bossUnitId, raidBossHpBonus: b.bossHpBonus, raidExtraVolley: f.extraVolley || 0, raidSeed: (0xBEEF + g * 7919) >>> 0};
    // the page's defs: the run-only overlay goes on top of the base defs
    const saved = {}; Object.keys(b.overlay).forEach(id=>{ saved[id] = CARD_DEFS_BASELINE[id]; CARD_DEFS_BASELINE[id] = b.overlay[id]; });
    (b.cfg.attacks||[]).forEach((a, i)=>{ if(a.pattern === 'column' && 2 % Math.max(1, a.every||1) === 0) m.raidPending[i] = A.raidSmackTarget(m, 2, i, a); });
    const cap = f.rounds || b.cfg.rounds, start = P[2].hq.hp; let survived = cap, over = false;
    A.raidAlliesTurn(m, [], true);
    for(let r = 1; r <= cap; r++){
      m.round = r;
      if(r > 1){ const ev = []; En.roundStart(P, r, sideOf, b.stats, ev); A.raidSpecials(m, ev); A.raidAlliesTurn(m, ev); A.raidBossUnit(m, ev); A.raidBossCommons(m, ev);
        En.draw(P[1], 1, 'A', b.stats, null); En.draw(P[2], 1, 'B', b.stats, null);
        if(P[1].hq.hp <= 0){ survived = r - 1; break; } if(P[2].hq.hp <= 0) break; }
      [1, 2].forEach(p=>{ P[p].playedThisTurn = false; P[p].discardUsedThisTurn = false; });
      En.setAiLevel(1); En.aiTakeTurn(P, sideOf, 1, b.stats, null); En.aiTakeTurn(P, sideOf, 2, b.stats, null);
      over = En.resolveCombat(P, sideOf, b.stats, null, r % 2 === 0 ? 1 : 2);
      if(TRACE && g === 0){ const cnt = pl=> En.allBoardCards(pl).filter(c=> c.hp > 0).length + '/' + (pl.reserve||[]).map(rw=> Object.values(rw).filter(c=> c && c.hp > 0).length).join('/'); console.log(`  r${r} me ${P[1].hq.hp}/${P[1].hq.maxHp} board ${cnt(P[1])} hand ${P[1].hand.length} lumber ${P[1].lumber||0} | boss ${P[2].hq.hp} board ${cnt(P[2])}`); }
      if(P[1].hq.hp <= 0){ survived = r; break; }
      if(over || P[2].hq.hp <= 0) break;
    }
    Object.keys(saved).forEach(id=>{ if(saved[id] === undefined) delete CARD_DEFS_BASELINE[id]; else CARD_DEFS_BASELINE[id] = saved[id]; });
    Object.keys(playerOverlay).forEach(id=>{ delete CARD_DEFS_BASELINE[id]; });
    const dealt = Math.max(0, start - Math.max(0, P[2].hq.hp)), ow = P[2].hq.hp <= 0;
    const part = def.parts.find(p=> p.id === partId);
    return {dealt, overwhelmed: ow, survived, contribution: RaidM.contributionFor(def, dealt, ow, part), level: me.level};
  } finally { Math.random = saveRandom; }
}
function run(){
  const def = RAIDS[0]; if(SET) def.tuning = Object.assign({}, def.tuning || {}, SET); const minDamage = Number(def.minDamage) || 120, rows = [];
  for(const deckKey of DECKS) for(const partId of PARTS) for(const stageName of STAGES){
    let dealt = 0, paid = 0, ow = 0, surv = 0, contrib = 0, lvl = 1;
    for(let g = 0; g < N; g++){ const r = playOne(def, partId, stageName, deckKey, g); dealt += r.dealt; if(r.dealt >= minDamage || r.overwhelmed) paid++; if(r.overwhelmed) ow++; surv += r.survived; contrib += r.contribution; lvl = r.level; }
    rows.push({deck: deckKey, level: lvl, part: partId, stage: stageName, avgDealt: Math.round(dealt / N), paidPct: Math.round(paid / N * 100), overwhelmPct: Math.round(ow / N * 100), avgSurvived: +(surv / N).toFixed(1), avgContribution: Math.round(contrib / N)});
  }
  return {minDamage, rows};
}
if(require.main === module){
  const t0 = Date.now(), out = run();
  console.log(`raid_full_sim: n=${N} per cell, minDamage ${out.minDamage} (the first paying tier)`);
  console.log('deck   lvl  part   stage      dealt  >=min%  overwhelm%  survived  contribution');
  out.rows.forEach(r=> console.log(`${String(r.deck).padEnd(7)}${String(r.level).padEnd(5)}${r.part.padEnd(7)}${r.stage.padEnd(11)}${String(r.avgDealt).padStart(5)}  ${String(r.paidPct).padStart(5)}  ${String(r.overwhelmPct).padStart(9)}  ${String(r.avgSurvived).padStart(8)}  ${String(r.avgContribution).padStart(11)}`));
  console.log(`(${((Date.now() - t0) / 1000).toFixed(1)}s)`);
}
module.exports = {run, playOne, A};
