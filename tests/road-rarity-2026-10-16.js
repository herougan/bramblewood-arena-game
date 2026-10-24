#!/usr/bin/env node
// 2026-10-16 (placement and rarity). The user's rarity economy, checked against the real data:
//   "packs after Map 20 progressively contain fewer and fewer commons. Pack 1-3 contain 40-50% common. Pack 4-6 will contain
//    35-45%. Pack 7 onwards, 30-35%, 30% is the floor"
//   "Maybe in Map 16 onwards, very rare can appear. Map 21 onwards, 1 super rare here and there. For bosses ... for Map 1-19,
//    Heroics shouldn't appear in bosses. However, the dragon lair 'extra-boss' will be Legendary. (the first, and only for Map
//    0-20 // first world). For Map 21-40, rares are much more common place. the first Epic in a normal skirmish happens around
//    Map 36. The first Heroic, Map 41. The first Unique (in skirmishes), in Map 51"
// and the field curriculum (0-T Mist, Tide-spout once, River Rapids on one map, no Moonpull before Map 11, 2-B Darkness,
// Pitch Black in the Sunken Depths, no day/night or First Blood there).
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/cards.json'), 'utf8'));
const defs = {}; cards.forEach(c=> defs[c.id] = c);
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const slice = (a, b)=>{ const i = src.indexOf(a), j = src.indexOf(b, i); if(i < 0 || j < 0) throw new Error('missing ' + a); return src.slice(i, j); };
// eslint-disable-next-line no-eval
const RR = eval(slice('// ROAD_RARITY:BEGIN', '// ROAD_RARITY:END') + ';({roadRarityCap, roadRarityStep, roadRarityOk})');
const i0 = src.indexOf('const CONQUEST_MAPS = ['), j0 = src.indexOf('\n];', i0);
// eslint-disable-next-line no-eval
const MAPS = eval(src.slice(i0 + 'const CONQUEST_MAPS = '.length, j0 + 2));
const mains = MAPS.filter(m=> !m.sub && !m.reserved);
const numOf = m=> mains.indexOf(m.sub ? MAPS.find(x=> x.id === m.parent) : m);

// 1. the caps themselves
// 2026-10-24 (package BAL2, T21-4): today's ladder, not the 10-16 one this file was written for. DV1 / DV2 (owner 10-22 07:41) set the reveals
// (Rare 5, Very Rare 10, Super Rare 20, Epic 22, Heroic 25, Unique 30, Legendary 40, Mythic 60 on the main road) and a skirmish's cap by map;
// BAL2 (owner 10-23 22:23 #2) moved a normal skirmish's Rare to Map 10 and its Very Rare to 15, and kept Map 5's Rare for its boss.
// Was: Very Rare from Map 10 (BF3), Super Rare 21, Epic 36, Heroic 41, Unique 51; "the dragon lair boss is the only Legendary" (DV5 made the
// Caldera Wyrm Heroic, so no Legendary is on the road before Map 40).
ok(RR.roadRarityCap(9, 'skirmish') === 'uncommon' && RR.roadRarityCap(10, 'skirmish') === 'rare' && RR.roadRarityCap(14, 'skirmish') === 'rare' && RR.roadRarityCap(15, 'skirmish') === 'veryrare', '1. a normal skirmish: Rare from Map 10, Very Rare from 15 (BAL2)');
ok(RR.roadRarityCap(19, 'skirmish') === 'veryrare' && RR.roadRarityCap(20, 'skirmish') === 'superrare', '1. Super Rare from Map 20');
ok(RR.roadRarityCap(29, 'skirmish') === 'superrare' && RR.roadRarityCap(30, 'skirmish') === 'epic', '1. the first Epic in a skirmish on Map 30');
ok(RR.roadRarityCap(39, 'skirmish') === 'epic' && RR.roadRarityCap(40, 'skirmish') === 'heroic', '1. the first Heroic in a skirmish on Map 40');
ok(RR.roadRarityCap(49, 'skirmish') === 'heroic' && RR.roadRarityCap(50, 'skirmish') === 'unique', '1. the first Unique in a skirmish on Map 50');
ok(RR.roadRarityCap(5, 'elite') === 'uncommon' && RR.roadRarityCap(5, 'boss') === 'rare' && RR.roadRarityCap(6, 'elite') === 'rare', '1. Map 5: only the boss reaches Rare; Maps 6-9 elites do (BAL2)');
for(let n = 1; n <= 19; n++) ok(!RR.roadRarityOk('heroic', n, 'boss'), '1. no Heroic in a Map ' + n + ' boss');
ok(!RR.roadRarityOk('legendary', 20, 'worldboss') && RR.roadRarityOk('heroic', 20, 'worldboss', 'mx'), '1. no Legendary on Map 20; the Volcano Lair reveals Heroic');

// 2. every fight and card reward on the road
// BAL2 (T21-4): a side map counts at the main map that unlocks it (as the gates and cardObtainMap do), with its own reveal (the map id goes to
// roadRarityOk); the Tutorial map's lesson fights and the endless / tower maps are not road fights; a fight's leaders are its own (they sit
// outside the ladder: the Heroic map leaders, DV2)
const G = require(path.join(ROOT, 'tools', 'lib_bramble.js')).G;
const RG = {roadRarityOk: G.roadRarityOk, roadRarityCap: G.roadRarityCap}; // the game's own (they know the maps: a side map's older steps)
const numAt = m=> m.sub ? G.mapUnlockNumberOf(m.id) : numOf(m), roadMap = m=> !m.reserved && m.id !== 'mtut' && !m.endless && !m.tower;
const isLeader = d=> (d.archetypes || []).includes('Leader') || !!(d.effects && d.effects.leader);
let legendaryW1 = [];
const bad = [];
for(const m of MAPS){ if(!roadMap(m)) continue; const n = numAt(m);
  for(const node of (m.nodes || [])){
    const ids = new Set(Object.keys(node.deck || {}));
    ((node.dungeon && node.dungeon.waveDecks) || []).forEach(w=> w && Object.keys(w).forEach(id=> ids.add(id)));
    ids.forEach(id=>{ const d = defs[id]; if(!d){ bad.push(`${node.key}: unknown card ${id}`); return; }
      if(!(node.leaders || []).includes(id) && !RG.roadRarityOk(d.rarity, n, node.kind, m.id)) bad.push(`${node.key} (${node.kind}, Map ${n}) fields ${id} (${d.rarity}), cap ${RG.roadRarityCap(n, node.kind, m.id)}`);
      if(n <= 20 && RR.roadRarityStep(d.rarity) >= RR.roadRarityStep('legendary')) legendaryW1.push(node.key + ':' + id); });
  } }
for(const c of cards){ const s = c.source; if(!s || s.kind !== 'map' || !s.node || c.test || c.token || isLeader(c)) continue;
  const m = MAPS.find(x=> x.id === s.id), node = m && (m.nodes || []).find(x=> x.key === s.node);
  if(!node){ bad.push(`${c.id}: reward node ${s.id}/${s.node} not found`); continue; }
  if(!roadMap(m)) continue;
  if(!RG.roadRarityOk(c.rarity, numAt(m), node.kind, m.id)) bad.push(`${c.id} (${c.rarity}) is the reward of ${s.node} (${node.kind}, Map ${numAt(m)})`);
  if(numAt(m) <= 20 && RR.roadRarityStep(c.rarity) >= RR.roadRarityStep('legendary')) legendaryW1.push('reward ' + c.id); }
bad.forEach(b=> ok(false, '2. ' + b));
ok(!legendaryW1.length, '2. no Legendary on Maps 0-20 (DV5): ' + legendaryW1.join(', '));
// Maps 21-40: rares are commonplace (a quarter or more of every skirmish deck is Rare or better)
for(const m of MAPS){ const n = numOf(m); if(m.reserved || n < 21 || n > 40) continue;
  (m.nodes || []).filter(x=> x.kind === 'skirmish').forEach(x=>{ const tot = Object.values(x.deck).reduce((a, b)=> a + b, 0), r = Object.entries(x.deck).reduce((a, [id, k])=> a + (RR.roadRarityStep((defs[id]||{}).rarity) >= 2 ? k : 0), 0);
    ok(r / tot >= 0.25, `2. ${x.key}: ${r}/${tot} Rare or better (Maps 21-40 want a quarter)`); }); }
// a Very Rare does turn up in a Map 16-20 skirmish, and a Super Rare on Map 21+
const seen = (lo, hi, kind, rar)=> MAPS.some(m=> !m.reserved && numOf(m) >= lo && numOf(m) <= hi && (m.nodes || []).some(x=> x.kind === kind && Object.keys(x.deck || {}).some(id=> (defs[id]||{}).rarity === rar)));
ok(seen(15, 20, 'skirmish', 'veryrare'), '2. a Very Rare in a Map 15-20 skirmish');
ok(seen(21, 99, 'skirmish', 'superrare'), '2. a Super Rare in a Map 21+ skirmish');
ok(!MAPS.some(m=> !m.reserved && !m.sub && numOf(m) < 15 && (m.nodes || []).some(x=> x.kind === 'skirmish' && Object.keys(x.deck || {}).some(id=> (defs[id]||{}).rarity === 'veryrare'))), '2. no Very Rare in a main-road skirmish before Map 15 (BAL2; side maps keep their older steps)');

// 3. packs by number
// eslint-disable-next-line no-eval
const PK = eval(slice('const PACK_NUMBER_OF', 'const PACK_UPPER_SHARE') + ';({packCommonShare, packNumberOf})');
const sh = n=> PK.packCommonShare(n);
[1, 2, 3].forEach(n=> ok(sh(n) >= 40 && sh(n) <= 50, `3. Pack ${n}: ${sh(n)}% commons (40-50)`));
[4, 5, 6].forEach(n=> ok(sh(n) >= 35 && sh(n) <= 45, `3. Pack ${n}: ${sh(n)}% commons (35-45)`));
[7, 8, 12, 20, 60].forEach(n=> ok(sh(n) >= 30 && sh(n) <= 35, `3. Pack ${n}: ${sh(n)}% commons (30-35)`));
for(let n = 2; n < 40; n++) ok(sh(n) <= sh(n - 1), `3. Pack ${n} has no more commons than Pack ${n - 1}`);
ok(PK.packNumberOf({id:'bronze'}) === 1 && PK.packNumberOf({id:'silver'}) === 2 && PK.packNumberOf({id:'gold'}) === 3 && PK.packNumberOf({id:'mystery'}) === null, '3. Hedgerow Pouch, Tidemire Chest, Highcrest Case are Packs 1-3; the Mystery Booster has no number');
ok(PK.packNumberOf({id:'gold-adv', baseId:'gold'}) === 3, '3. an Advanced pack keeps its pack number');
ok(/function legendaryHeldBack\(d\)/.test(src) && /!legendaryHeldBack\(defs\[id\]\)\); if\(!live\.length\)/.test(src), '3. faction rewards hold back Legendaries before Map 21');

// 4. the field curriculum
ok(/const MISTY_MAPS = new Set\(\['m1', 'mo', 'mtut'\]\);/.test(src), '4. 0-T (the Tutorial) is misty');
ok(/const TIDESPOUT_NODES = \{mb:'2-4'\};/.test(src), '4. no map spouts by default: only 2-4');
ok(MAPS.find(m=> m.id === 'mb').nodes.every(x=> x.rules && x.rules.tide), '4. Pebble Beach has the plain Tide (rules.tide) in every fight');
ok(MAPS.find(m=> m.id === 'mj').nodes.every(x=> x.rules && x.rules.crushingDepths), '4. Crushing Depths in every Sunken Depths fight');
const spouts = MAPS.flatMap(m=> (m.nodes || []).filter(x=> x.rules && x.rules.tideSpout).map(x=> x.key));
ok(spouts.length === 1 && spouts[0] === '2-4', '4. the Tide-spout is a one-off (2-4): ' + spouts.join(','));
ok(/const RAPIDS_MAPS = new Set\(\['m2'\]\);/.test(src) && /const PERMATIDE_MAPS = new Set\(\[\]\);/.test(src), '4. River Rapids on Sunken Hollow only; Lilypad Reach has the plain Tide');
ok(/const DARK_MAPS = new Map\(\[\['mg','dark'\], \['m4','dark'\], \['mz','dark'\], \['mj','pitch'\]\]\);/.test(src), '4. Smugglers\' Grotto is Darkness; Pitch Black is the Sunken Depths');
const mj = MAPS.find(m=> m.id === 'mj');
ok(mj.nodes.every(x=> !x.rules || (x.rules.phase == null && x.rules.firstBlood == null)), '4. the Sunken Depths have no night or First Blood (the moon can\'t be seen)');
const moonEarly = [];
MAPS.forEach(m=>{ if(m.reserved || numOf(m) > 10) return; (m.nodes || []).forEach(x=> Object.keys(x.deck || {}).forEach(id=> { const e = (defs[id]||{}).effects || {}; if(e.moonpull) moonEarly.push(x.key + ':' + id); })); });
ok(!moonEarly.length, '4. no Moonpull on Maps 0-10: ' + moonEarly.join(', '));

console.log(fail ? `road-rarity-2026-10-16: ${fail} failed` : 'road-rarity-2026-10-16: all passed');
process.exit(fail ? 1 : 0);
