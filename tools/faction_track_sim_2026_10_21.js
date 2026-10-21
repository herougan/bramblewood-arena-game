#!/usr/bin/env node
// 2026-10-21 (package RP): walks a player's road with the faction reward track (arena_app.js FACTION_REWARD_TRACK region) and shows
// when each rarity opens (owner Oct 21: "Pace this out, as the rare should only come in Map 14+. And the very rare much later.").
//   node tools/faction_track_sim_2026_10_21.js [--side otters|hummingbirds] [--k N] [--tune] [--json] [--seed S]
// The road: every main map's fights in order, first clears only; a side map once its gate opens (entry.afterMapCleared, else after its
// parent), the Tutorial's T-2 / T-3 / T-4 at Maps 1 / 8 / 18 (TUT_SIDE_GATE); endless dungeons and the Tower are left out. The hand-outs,
// as the game gives them (conquest win, rollConquestPackDrops, claimAchievement):
//   0-2's faction pack (FACTION_REWARD_TRACK.openingPack own cards); each main map's last fight (milestone); every everyWins-th
//   first clear of any fight but the two opening ones (0-1, 0-2) and the ambush; the 3-2 ambush's Faction Growth; the achievements
//   (first_win, conquest_5, conquest_map, conquest_maps_5, wins_50, collector_100, conquest_road, world_boss) when they are reached
//   (collector_100 is taken as Map 6, where a player who plays every fight first owns ~100 cards).
// Each hand-out picks with the game's factionTrackPick over your side's Factions pool (copies limited as FACTION_POOL_COPIES), so the
// rarity mix is the real one. Received = faction cards handed out (every copy counts).
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8'));
const argv = process.argv.slice(2), arg = (k, d)=>{ const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const slice = (a, b)=>{ const i = src.indexOf(a), j = src.indexOf(b, i); if(i < 0 || j < 0) throw new Error('missing ' + a); return src.slice(i, j); };
const i0 = src.indexOf('const CONQUEST_MAPS = ['), j0 = src.indexOf('\n];', i0);
// eslint-disable-next-line no-eval
const MAPS = eval(src.slice(i0 + 'const CONQUEST_MAPS = '.length, j0 + 2));
const constLine = name=>{ const m = new RegExp(`^const ${name} = .*$`, 'm').exec(src); if(!m) throw new Error('no ' + name); return m[0]; };
function load(over){
  const body = [slice('// ROAD_RARITY:BEGIN', '// ROAD_RARITY:END'), constLine('FACTION_POOL_COPIES'), slice('// FACTION_REWARD_TRACK:BEGIN', '// FACTION_REWARD_TRACK:END'),
    'return {FACTION_RARITY_GATES, FACTION_RARITY_WEIGHT, FACTION_REWARD_TRACK, FACTION_POOL_COPIES, PLAIN_REWARDS_UPTO_MAP, factionRarityKey, factionRarityOpen, factionOpenRarities, factionTrackPick};'].join('\n');
  const defs = {}; cards.filter(c=> !c.pool).forEach(c=> defs[c.id] = c);
  const env = Object.assign({getCardDefs: ()=> defs, isEquipmentDef: d=> !!(d && (d.cardType === 'equipment' || d.equip)), isEasterEgg: d=> !!(d && d.easterEgg), copiesOwned: ()=> 0, trackMapReached: ()=> 0, loadFactionPool: ()=> ({received: 0}), saveFactionPool: ()=>{}, factionReward: ()=> null}, over || {});
  const names = Object.keys(env);
  return Object.assign(new Function(...names, body)(...names.map(k=> env[k])), {defs});
}
const KIND_BASE = {champion: 'elite', miniboss: 'elite', subboss: 'boss', dungeon: 'elite', worldboss: 'raidboss', megaraid: 'raidboss'};
const baseKind = k=> KIND_BASE[k] || k;
const mains = MAPS.filter(m=> !m.sub && !m.reserved);
// the game's applyRoadKinds: each main map's last fight is its ender (Map 0 a skirmish, 1-4 elite, every 5th a boss, else a mini-boss)
function roadEnderKind(i){ return i === 0 ? 'skirmish' : i <= 4 ? 'elite' : i % 5 === 0 ? 'boss' : 'miniboss'; }
mains.forEach((m, i)=>{ const nodes = m.nodes.filter(n=> n.ender || (n.kind !== 'tutorial' && !/raidboss|worldboss|megaraid|dungeon/.test(n.kind || ''))); if(!nodes.length) return;
  const old = nodes.find(n=> n.ender) || nodes.slice().reverse().find(n=> /^(boss|finalboss|subboss)$/.test(n.kind || '')) || nodes[nodes.length - 1]; old.kind = roadEnderKind(i); old.ender = true; });
const TUT_SIDE_GATE = {'T-2': 1, 'T-3': 8, 'T-4': 18};
const numOf = id=> mains.findIndex(m=> m.id === id);
// the order a player first clears fights in: [{map, node, at (main map number)}]
function roadOrder(){
  const out = [];
  mains.forEach((m, i)=>{
    m.nodes.filter(n=> n.kind !== 'tutorial' && !/raidboss|megaraid/.test(n.kind || '')).forEach(n=> out.push({m, n, at: i}));
    if(i === 3) out.push({m, n: {key: 'ambush', kind: 'elite', ambush: true, rewardTokens: ['factionGrowth']}, at: 3});
    // side maps whose gate is this map
    MAPS.filter(s=> s.sub && !s.endless && !s.tower && !s.reserved).forEach(s=>{
      const gate = s.entry && s.entry.afterMapCleared ? numOf(s.entry.afterMapCleared) : s.id === 'mtut' ? -1 : numOf(s.parent);
      const g = s.id === 'mo' ? Math.max(numOf(MAPS.find(x=> x.id === 'mi').entry.afterMapCleared || 'm6'), 17) : gate;
      if(s.id === 'mtut'){ s.nodes.filter(n=> TUT_SIDE_GATE[n.key] === i).forEach(n=> out.push({m: s, n, at: i})); return; }
      if(g === i) s.nodes.filter(n=> n.kind !== 'tutorial' && !/raidboss|megaraid/.test(n.kind || '')).forEach(n=> out.push({m: s, n, at: i}));
    });
  });
  return out;
}
function simulate(opt){
  opt = opt || {}; const side = opt.side || 'otters', K = opt.k || null, rng = seeded(opt.seed || 7);
  const T = load(), defs = T.defs, TRACK = Object.assign({}, T.FACTION_REWARD_TRACK, K ? {everyWins: K} : {});
  const want = side === 'hummingbirds' ? 'tribes' : '';
  const isFac = c=> c.source && c.source.kind === 'pack' && +c.source.tier === 11 && !c.token && !c.test && !c.easterEgg && c.cardType !== 'equipment';
  const mine = cards.filter(c=> isFac(c) && ((c.source.side || '') === want || c.source.side === 'shared')).map(c=> c.id);
  const own = cards.filter(c=> isFac(c) && (c.source.side || '') === want).map(c=> c.id);
  const left = {}; mine.forEach(id=> left[id] = T.FACTION_POOL_COPIES[defs[id].rarity || 'common'] || 1);
  const owned = {}, st = {received: 0, wins: 0, map: 0, log: []};
  const give = (how, pool, useLeft)=>{ const ctx = {received: st.received, map: st.map, owned};
    const id = T.factionTrackPick(pool, rng, ctx, useLeft ? (x=> left[x]) : null); if(!id) { st.log.push({map: st.map, how, id: null}); return null; }
    if(useLeft) left[id]--; owned[id] = (owned[id] || 0) + 1; st.received++; st.log.push({map: st.map, how, id, rarity: T.factionRarityKey(defs[id].rarity)}); return id; };
  const reward = how=> give(how, Object.keys(left).filter(x=> left[x] > 0), true);
  const ach = TRACK.achievements || {}, gotAch = new Set(), achAt = (id, cond)=>{ if(gotAch.has(id) || !cond || !ach[id]) return; gotAch.add(id); for(let i = 0; i < ach[id]; i++) reward('achievement ' + id); };
  const perMap = []; let clears = 0, mapsCleared = 0;
  const order = roadOrder();
  for(let i = 0; i < mains.length; i++){
    st.map = i;
    order.filter(x=> x.at === i).forEach(({m, n})=>{
      clears++;
      achAt('first_win', true);
      if(m.id === 'm1' && n.key === '0-2'){ for(let j = 0; j < (TRACK.openingPack | 0); j++) give('0-2 faction pack', own, false); return; }
      if(m.id === 'm1' && n.key === '0-1') return; // the opening card is 0-1's own reward
      if(n.ambush){ for(let j = 0; j < (TRACK.ambushGrowth | 0); j++) give('3-2 ambush (Faction Growth)', mine, false); return; }
      if(n.ender && m === mains[i]) for(let j = 0; j < (TRACK.milestone | 0); j++) reward('map milestone (its last fight)');
      st.wins++; if(st.wins % Math.max(1, TRACK.everyWins | 0) === 0) reward(`every ${TRACK.everyWins}th first clear`);
      achAt('conquest_5', clears >= 5); achAt('wins_50', clears >= 50);
      if(m.id === 'm11' && n.key === '20-10') achAt('conquest_road', true);
      if(m.id === 'mx' && n.key === '20-B-4') achAt('world_boss', true);
    });
    mapsCleared++; achAt('conquest_map', mapsCleared >= 1); achAt('conquest_maps_5', mapsCleared >= 5); achAt('collector_100', i >= 6);
    const open = T.factionOpenRarities({received: st.received, map: i});
    const mix = {}; st.log.filter(x=> x.map === i && x.id).forEach(x=> mix[x.rarity] = (mix[x.rarity] || 0) + 1);
    perMap.push({map: i, name: mains[i].name, received: st.received, open: open.filter(k=> k !== 'high'), got: mix});
  }
  // past the last map: keep the same pace (the road's average first clears and elites a map) to show the later gates
  const fightsPerMap = clears / mains.length, bigPerMap = TRACK.milestone | 0;
  const proj = []; let rec = st.received, w = st.wins;
  for(let i = mains.length; i <= 60; i++){ const add = bigPerMap + Math.floor((w + fightsPerMap) / TRACK.everyWins) - Math.floor(w / TRACK.everyWins); w += fightsPerMap; rec += add;
    proj.push({map: i, received: Math.round(rec), open: T.factionOpenRarities({received: rec, map: i}).filter(k=> k !== 'high')}); }
  const firstOpen = {}; [...perMap, ...proj].forEach(r=> r.open.forEach(k=>{ if(firstOpen[k] == null) firstOpen[k] = r.map; }));
  const firstCount = {}; Object.entries(T.FACTION_RARITY_GATES).forEach(([k, g])=>{ const r = [...perMap, ...proj].find(x=> x.received >= g.at); firstCount[k] = r ? r.map : null; });
  return {side, everyWins: TRACK.everyWins, gates: T.FACTION_RARITY_GATES, perMap, projected: proj, firstOpen, countReachedAt: firstCount, poolSize: mine.length, left: Object.values(left).reduce((a, b)=> a + b, 0), log: st.log};
}
function seeded(s){ let x = s >>> 0 || 1; return ()=>{ x ^= x << 13; x >>>= 0; x ^= x >> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; }; }
module.exports = {simulate, load, roadOrder};
if(require.main === module){
  if(argv.includes('--tune')){
    for(let k = 2; k <= 9; k++){ const r = simulate({side: arg('--side', 'otters'), k}); console.log(`everyWins ${k}: 40 received at Map ${r.countReachedAt.rare}, Rare opens Map ${r.firstOpen.rare}; 50 at Map ${r.countReachedAt.veryrare}, Very Rare opens ${r.firstOpen.veryrare}; by Map 24: ${r.perMap[r.perMap.length - 1].received}`); }
    process.exit(0); }
  const r = simulate({side: arg('--side', 'otters'), k: +arg('--k', 0) || null, seed: +arg('--seed', 7)});
  if(argv.includes('--json')){ console.log(JSON.stringify(r, null, 1)); process.exit(0); }
  console.log(`Faction reward track, ${r.side}, everyWins ${r.everyWins} (pool: ${r.poolSize} cards)`);
  console.log('| Map | Name | Received (end of map) | Got this map | Open rarities |'); console.log('|---|---|---|---|---|');
  r.perMap.forEach(x=> console.log(`| ${x.map} | ${x.name} | ${x.received} | ${Object.entries(x.got).map(([k, v])=> v + ' ' + k).join(', ') || '-'} | ${x.open.join(', ')} |`));
  console.log('first open:', JSON.stringify(r.firstOpen), ' count reached:', JSON.stringify(r.countReachedAt));
}
