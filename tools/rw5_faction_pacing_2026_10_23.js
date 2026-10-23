#!/usr/bin/env node
// 2026-10-23 (package RW5): the pacing check for the standard faction rewards (owner 19:36: "If by Map 15 you already reached the very rare
// cards, then there's too little. If you are still hitting uncommons at Map 17, then there's too many"), run on the rules RW5 built:
//   - the faction pool: both sides + shared (source {kind:'pack', tier:11}) at the deck cap (RARITY_MAX_COPIES) + 1 copy of each Base card;
//   - SET rewards by the game's factionPatternRarity (C,C,C,U,C,C,U,C,U,R; R skipped before Map 14, PP-2): the tutorial's 3 + 3
//     (TUTORIAL_FACTION_REWARDS), each main map's milestone, every everyWins-th first clear, the achievements;
//   - RANDOM rewards by the game's factionTrackPick (the rarity gates): 0-2's faction pack (2 of your side), the end-of-map faction pack
//     (MAP_END_PACKS: 2 of your side a main map), out of the same pool; the 3-2 ambush's Faction Growth (1, your side, not out of the pool).
// The road (fights, side maps, achievements) is tools/faction_track_sim_2026_10_21.js's. Cards: a card you don't own first, your side x3,
// shared x2, Base x1.5, the other side x1, plain first on Maps 0-1 (factionPoolPickOf), as the game picks.
//   node tools/rw5_faction_pacing_2026_10_23.js [--side otters|hummingbirds] [--seeds N] [--no-end-packs] [--json] [--out FILE]
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const SIM = require(path.join(ROOT, 'tools', 'faction_track_sim_2026_10_21.js'));
const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G;
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const argv = process.argv.slice(2), arg = (k, d)=>{ const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const slice = (a, b)=>{ const i = src.indexOf(a), j = src.indexOf(b, i); if(i < 0 || j < 0) throw new Error('missing ' + a); return src.slice(i, j); };
const constLine = name=>{ const m = new RegExp(`^const ${name} = .*$`, 'm').exec(src); if(!m) throw new Error('no ' + name); return m[0]; };
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8'));
const defs = {}; cards.filter(c=> !c.pool).forEach(c=> defs[c.id] = c);
const ev = name=> eval('(' + B.grab(name).replace(/^const \w+ = /, '').replace(/;\s*$/, '') + ')'); // eslint-disable-line no-eval
const MAX_COPIES = ev('RARITY_MAX_COPIES'), TUT = ev('TUTORIAL_FACTION_REWARDS'), STARTER = ev('STARTER_CFG_DEFAULT'), TUT_REWARD_IDS = ev('TUTORIAL_REWARD_IDS');
function load(map){
  const body = [slice('// ROAD_RARITY:BEGIN', '// ROAD_RARITY:END'), slice('// FACTION_REWARD_TRACK:BEGIN', '// FACTION_REWARD_TRACK:END'),
    'return {FACTION_RARITY_GATES, FACTION_REWARD_TRACK, PLAIN_REWARDS_UPTO_MAP, FACTION_SIDE_WEIGHT, FACTION_STANDARD_PATTERN, FACTION_PATTERN_RARE_FROM_MAP, factionRarityKey, factionRarityOpen, factionTrackPick, factionPatternRarity, factionClimbWant};'].join('\n');
  const env = {getCardDefs: ()=> defs, isEquipmentDef: d=> !!(d && (d.cardType === 'equipment' || d.equip)), isEasterEgg: d=> !!(d && d.easterEgg), copiesOwned: ()=> 0,
    trackMapReached: ()=> map.v, loadFactionPool: ()=> ({received: 0}), saveFactionPool: ()=>{}, factionReward: ()=> null, conquestMapCleared: ()=> false};
  const names = Object.keys(env); return new Function(...names, body)(...names.map(k=> env[k]));
}
// the pool
// what the game hands out: obtainability comes from the source (arena_app.js isUnattainable; the old `unattainable` flag is not read by the game,
// so the 30 faction cards the hub calls "unplaced" are in the pool too), no Easter egg, no equipment; a card awaiting its source is unsorted.
const live = d=> d && !d.token && !d.test && !d.hero && !d.awaitingSource && !d.easterEgg && d.cardType !== 'equipment' && d.cardType !== 'materia' && !d.derivedFrom;
const tutorialSet = new Set();
['starterShared', 'starterOtters', 'starterHummingbirds', 'starterBoth', 'starterFiller'].forEach(k=> Object.keys(STARTER[k] || {}).forEach(id=> tutorialSet.add(id)));
(STARTER.starterTopUp || []).forEach(id=> tutorialSet.add(id)); (TUT_REWARD_IDS || []).forEach(id=> tutorialSet.add(id));
{ const STARTER_CFG_DEFAULT = STARTER, TUTORIAL_SEED = 0; void STARTER_CFG_DEFAULT; void TUTORIAL_SEED; // the shipped tutorial config (tutorialBaseIdSet reads it too)
  const TC = eval('(' + B.grab('TUTORIAL_CFG_DEFAULT').replace(/^const \w+ = /, '').replace(/;\s*(\/\/.*)?$/, '') + ')'); // eslint-disable-line no-eval
  ['starterShared', 'starterOtters', 'starterHummingbirds', 'starterBoth', 'starterFiller', 'myDeck', 'myDeck2', 'rivalDeck', 'rivalDeck2'].forEach(k=> Object.keys(TC[k] || {}).forEach(id=> tutorialSet.add(id))); }
const isFac = d=> d.source && d.source.kind === 'pack' && +d.source.tier === 11;
function poolFor(side, releasedOnly){ // releasedOnly: leave out the cards still flagged `unattainable` (the hub's "unplaced"; the game does not read the flag)
  const want = side === 'hummingbirds' ? 'tribes' : '';
  const out = {};
  Object.values(defs).forEach(d=>{ if(!live(d) || (releasedOnly && d.unattainable)) return;
    if(isFac(d)){ const s = d.source.side || ''; out[d.id] = {left: MAX_COPIES[d.rarity === 'starter' ? 'common' : (d.rarity || 'common')] || 1, side: s === 'shared' ? 'shared' : s === want ? 'own' : 'other'}; return; }
    const s = G.cardSourceOf(d); if(s.kind !== 'base' || s.tutorialReward || d.rarity === 'starter' || G.cardBaseLevel(d) === 0 || tutorialSet.has(d.id) || d.hero) return;
    out[d.id] = {left: 1, side: 'base'}; });
  return out;
}
function seeded(s){ let x = s >>> 0 || 1; return ()=>{ x ^= x << 13; x >>>= 0; x ^= x >> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; }; }
const plain = d=> !Object.keys(d.effects || {}).length;
function run(opt){
  const side = opt.side || 'otters', rnd = seeded(opt.seed || 7), map = {v: 0}, T = load(map), endPacks = opt.endPacks !== false;
  const pool = poolFor(side, opt.releasedOnly), owned = {}, log = []; let received = 0, step = 0, wins = 0;
  const key = id=> T.factionRarityKey(defs[id].rarity);
  const pickCard = (ids)=>{ let c = ids.filter(id=> pool[id].left > 0); if(!c.length) return null; const fresh = c.filter(id=> !owned[id]); if(fresh.length) c = fresh;
    if(map.v <= T.PLAIN_REWARDS_UPTO_MAP){ const p = c.filter(id=> plain(defs[id])); if(p.length) c = p; }
    const w = id=> (T.FACTION_SIDE_WEIGHT[pool[id].side] || 1) * Math.max(1, pool[id].left); const tot = c.reduce((t, id)=> t + w(id), 0); let r = rnd() * tot; for(const id of c){ r -= w(id); if(r <= 0) return id; } return c[c.length - 1]; };
  const take = (id, how, kind)=>{ pool[id].left--; owned[id] = (owned[id] || 0) + 1; received++; log.push({map: map.v, how, kind, id, rarity: key(id), side: pool[id].side}); return id; };
  const want = id=> T.factionClimbWant(pool[id].side, owned[id] || 0, pool[id].left); // climbing the tree (FACTION_CLIMB_HOLD)
  const setReward = how=>{ const ids = Object.keys(pool).filter(id=> pool[id].left > 0 && !(G.roadRarityStep(defs[id].rarity) >= G.roadRarityStep('legendary') && map.v < 21));
    const left = {}; ids.forEach(id=> left[key(id)] = (left[key(id)] || 0) + want(id));
    const pr = T.factionPatternRarity(step, map.v, left, {sides: []}); if(!pr.rarity) return randomReward(how + ' (pattern empty: random)');
    const id = pickCard(ids.filter(x=> key(x) === pr.rarity && want(x) > 0)); if(!id) return randomReward(how + ' (random)'); step += pr.steps; return take(id, how, 'set'); };
  const randomReward = (how, onlySide)=>{ const ids = Object.keys(pool).filter(id=> pool[id].left > 0 && (!onlySide || pool[id].side === onlySide));
    const id = T.factionTrackPick(ids, rnd, {received, map: map.v, owned, sides: []}, x=> pool[x].left); return id ? take(id, how, 'random') : null; };
  const TRACK = T.FACTION_REWARD_TRACK, ach = TRACK.achievements || {}, gotAch = new Set();
  const achAt = (id, cond)=>{ if(gotAch.has(id) || !cond || !ach[id]) return; gotAch.add(id); for(let i = 0; i < ach[id]; i++) setReward('achievement ' + id); };
  // the tutorial (before Map 0's fights)
  (TUT || []).forEach((n, k)=>{ for(let i = 0; i < n; i++) setReward('tutorial part ' + (k + 1)); });
  const mains = G.CONQUEST_MAPS.filter(m=> !m.sub && !m.reserved), order = SIM.roadOrder(), perMap = []; let clears = 0, mapsCleared = 0;
  for(let i = 0; i < mains.length; i++){
    map.v = i;
    order.filter(x=> x.at === i).forEach(({m, n})=>{
      clears++; achAt('first_win', true);
      if(m.id === 'm1' && n.key === '0-2'){ for(let j = 0; j < (TRACK.openingPack | 0); j++) randomReward('0-2 faction pack', 'own'); return; }
      if(m.id === 'm1' && n.key === '0-1') return;
      if(n.ambush){ received += TRACK.ambushGrowth | 0; log.push({map: i, how: '3-2 ambush (Faction Growth)', kind: 'growth'}); return; }
      if(n.ender && m.id === mains[i].id){ for(let j = 0; j < (TRACK.milestone | 0); j++) setReward('map milestone'); if(endPacks) for(let j = 0; j < 2; j++) randomReward('end-of-map faction pack', 'own'); }
      wins++; if(wins % Math.max(1, TRACK.everyWins | 0) === 0) setReward(`every ${TRACK.everyWins}th first clear`);
      achAt('conquest_5', clears >= 5); achAt('wins_50', clears >= 50);
      if(m.id === 'm11' && n.key === '20-10') achAt('conquest_road', true);
    });
    mapsCleared++; achAt('conquest_map', mapsCleared >= 1); achAt('conquest_maps_5', mapsCleared >= 5); achAt('collector_100', i >= 6);
    const mine = log.filter(x=> x.map === i && x.id), mix = {}; mine.forEach(x=> mix[x.rarity] = (mix[x.rarity] || 0) + 1);
    const setMix = {}; mine.filter(x=> x.kind === 'set').forEach(x=> setMix[x.rarity] = (setMix[x.rarity] || 0) + 1);
    perMap.push({map: i, name: mains[i].name, received, got: mix, set: setMix, poolLeft: Object.values(pool).reduce((t, p)=> t + Math.max(0, p.left), 0), lowLeft: Object.keys(pool).filter(id=> ['common', 'uncommon', 'rare'].includes(key(id))).reduce((t, id)=> t + Math.max(0, pool[id].left), 0)}); // lowLeft: Common to Rare copies (the higher ones wait for their maps)
  }
  const hi = r=> ['veryrare', 'superrare', 'epic', 'heroic', 'high'].includes(r);
  const first = (pred)=>{ const x = log.find(y=> y.id && pred(y)); return x ? x.map : null; };
  const last = (pred)=>{ const a = log.filter(y=> y.id && pred(y)); return a.length ? a[a.length - 1].map : null; };
  const poolStart = poolFor(side, opt.releasedOnly), byR = {}; Object.entries(poolStart).forEach(([id, p])=>{ const k = key(id); byR[k] = (byR[k] || 0) + p.left; });
  return {side, endPacks, releasedOnly: !!opt.releasedOnly, pool: {cards: Object.keys(poolStart).length, copies: Object.values(poolStart).reduce((t, p)=> t + p.left, 0), byRarity: byR,
      bySide: Object.values(poolStart).reduce((o, p)=> (o[p.side] = (o[p.side] || 0) + 1, o), {})},
    firstRare: first(y=> y.rarity === 'rare'), firstVeryRarePlus: first(y=> hi(y.rarity)), lastUncommonSet: last(y=> y.kind === 'set' && y.rarity === 'uncommon'), lastUncommonAny: last(y=> y.rarity === 'uncommon'),
    firstVeryRarePlusSet: first(y=> y.kind === 'set' && hi(y.rarity)), tutorial: log.filter(y=> /^tutorial/.test(y.how)).map(y=> y.id + ' (' + y.rarity + ')'),
    receivedBy: {3: (perMap[3] || {}).received, 7: (perMap[7] || {}).received, 13: (perMap[13] || {}).received, 15: (perMap[15] || {}).received, 17: (perMap[17] || {}).received, 20: (perMap[20] || {}).received},
    dryAt: (perMap.find(p=> p.lowLeft === 0) || {}).map ?? null, perMap, log};
}
function summary(opt){
  const seeds = Math.max(1, +opt.seeds || 20), rows = [];
  for(let s = 1; s <= seeds; s++) rows.push(run(Object.assign({}, opt, {seed: s * 7919})));
  const med = k=>{ const v = rows.map(r=> r[k]).filter(x=> x != null).sort((a, b)=> a - b); return v.length ? v[Math.floor(v.length / 2)] : null; };
  const verdict = r=>{ const v = []; if(r.firstVeryRarePlus != null && r.firstVeryRarePlus <= 15) v.push('too few: Very Rare or higher by Map ' + r.firstVeryRarePlus);
    if(r.lastUncommonSet != null && r.lastUncommonSet >= 17) v.push('too many: standard rewards still give Uncommons at Map ' + r.lastUncommonSet);
    if(r.dryAt != null && r.dryAt <= 20) v.push('the pool runs dry at Map ' + r.dryAt); return v.join('; ') || 'inside the window (below Very Rare by Map 15, past Uncommons by Map 17)'; };
  const one = rows[0], agg = {firstRare: med('firstRare'), firstVeryRarePlus: med('firstVeryRarePlus'), firstVeryRarePlusSet: med('firstVeryRarePlusSet'), lastUncommonSet: med('lastUncommonSet'), lastUncommonAny: med('lastUncommonAny'), dryAt: med('dryAt')};
  return {side: one.side, endPacks: one.endPacks, releasedOnly: one.releasedOnly, seeds, pool: one.pool, median: agg, verdict: verdict(agg), receivedBy: one.receivedBy, tutorialSeed1: one.tutorial,
    perMapSeed1: one.perMap.map(p=> ({map: p.map, received: p.received, got: p.got, set: p.set, poolLeft: p.poolLeft, lowLeft: p.lowLeft}))};
}
module.exports = {run, summary, poolFor};
if(require.main === module){
  const sides = arg('--side') ? [arg('--side')] : ['otters', 'hummingbirds'];
  const out = {generated: '2026-10-23', tool: 'node tools/rw5_faction_pacing_2026_10_23.js', rules: 'RW5: pool both sides + shared at the deck cap + 1 of each Base card (as the game builds it: every card whose source gives it; releasedOnly rows leave out the 30 still flagged unattainable); set rewards by FACTION_STANDARD_PATTERN (R skipped before Map 14, PP-2); random rewards (0-2 and end-of-map faction packs) by the gates', results: []};
  sides.forEach(side=> [[true, false], [false, false], [true, true]].forEach(([endPacks, releasedOnly])=> out.results.push(summary({side, seeds: +arg('--seeds', 20), releasedOnly, endPacks: argv.includes('--no-end-packs') ? false : endPacks}))));
  if(argv.includes('--json')) console.log(JSON.stringify(out, null, 1));
  else out.results.forEach(r=> console.log(`${r.side}${r.endPacks ? '' : ' (no end-of-map packs)'}${r.releasedOnly ? ' (released cards only)' : ''}: pool ${r.pool.cards} cards / ${r.pool.copies} copies ${JSON.stringify(r.pool.byRarity)}; median over ${r.seeds} seeds: first Rare Map ${r.median.firstRare}, first VR+ Map ${r.median.firstVeryRarePlus} (set ${r.median.firstVeryRarePlusSet}), last set Uncommon Map ${r.median.lastUncommonSet}, pool dry ${r.median.dryAt}; received by 3/7/13/15/17/20 ${JSON.stringify(r.receivedBy)} -> ${r.verdict}`));
  const file = arg('--out'); if(file){ fs.writeFileSync(path.join(ROOT, file), JSON.stringify(out, null, 1) + '\n'); console.log('->', file); }
}
