#!/usr/bin/env node
// 2026-10-24 (package BAL3: the owner's 12:02 answers to BAL2-1..5 and DF3-3 / DF3-4, "use our agreed philosophy and schedule, not my
// balancing"). Checks:
//   1. BAL2-1: no fight keeps LEAD's hand-set Enemy level; every elite and boss of the road plays at the level schedule
//      (roadEnemyScheduleLevel); only the DF3 challenge skirmishes keep an Enemy level (DF3-2);
//   2. BAL2-2: side maps follow the main road's rarity steps (no Rare in a normal skirmish before Map 10, no Very Rare before 15; Map 5's
//      elites Uncommon), and no side-map fight breaks them;
//   3. BAL2-5: the ten held cards are on their formula line (inside the budget) and off the held list;
//   4. DF3-3: Rising Tide gives Quick and +1 Attack while the tide is in, nothing while it is out;
//   5. BAL2-3: the retuned road keeps the deck rules (copy ladder, 5-7 different cards on skirmishes, a fight's leaders in its deck, a
//      challenge deck's boon on, the road's rarity cap) and the measured table (docs/balance/bal3-road-2026-10-24.json) has more fights green
//      than before.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const E = require(path.join(ROOT, 'bramblewood-engine.js'));
const H = require(path.join(ROOT, 'tests', 'lib', 'harness.js'));
const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G, src = B.src;
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  ✗', m); } else if(process.env.VERBOSE) console.log('  ✓', m); };
const D = G.getCardDefs(), MAPS = G.CONQUEST_MAPS;
const roadMap = m=> !m.reserved && m.id !== 'mtut' && !m.endless && !m.tower;

// ---- 1. LEAD's levels gone
ok(!/enemyLevel:[\d.]+ \/\* 2026-10-23 \(LEAD\)/.test(src), '1. no LEAD Enemy level left in arena_app.js');
{ const left = [];
  MAPS.forEach(m=>{ if(!roadMap(m)) return; (m.nodes || []).forEach(n=>{ if(n.enemyLevel != null && n.enemyLevel !== '' && !n.challenge) left.push(n.key); }); });
  ok(!left.length, '1. only challenge skirmishes carry an Enemy level: ' + left.join(', '));
  let bad = [];
  MAPS.forEach(m=>{ if(!roadMap(m)) return; (m.nodes || []).forEach(n=>{ if(!n.deck || n.challenge || !/elite|boss/.test(n.kind || '')) return; G.NODE_MAP_HINT.set(n, m.id);
    const no = G.mapNumberOf(m.id); if(no == null || no < 2 || (!m.sub && no <= 1)) return;
    const L = G.roadEnemyLevelExact(n), S = G.roadEnemyScheduleLevel(G.roadMapOfFight(n), G.roadFightHardness(n));
    const mega = /^(finalboss|worldboss)$/.test(n.kind || '') && G.roadMapOfFight(n) >= 100;
    if(!mega && Math.abs(L - Math.min(n.floor > 1 ? 99 : 10, S)) > 1e-9) bad.push(`${n.key} ${L} vs ${S}`); }); });
  ok(!bad.length, '1. every road elite and boss is at the schedule: ' + bad.slice(0, 8).join('; ')); }

// ---- 2. side maps: the main road's rarity steps
ok(G.roadRarityCap(7, 'skirmish', 'mg') === 'uncommon' && G.roadRarityCap(10, 'skirmish', 'mj') === 'rare' && G.roadRarityCap(14, 'skirmish', 'mj') === 'rare' && G.roadRarityCap(15, 'skirmish', 'mv') === 'veryrare',
  '2. a side-map skirmish: Uncommon to Map 9, Rare from 10, Very Rare from 15');
ok(G.roadRarityCap(5, 'elite', 'ms') === 'uncommon' && G.roadRarityCap(6, 'elite', 'mp') === 'rare', '2. a side-map elite: Uncommon on Map 5, Rare from 6');
{ const bad = [];
  MAPS.forEach(m=>{ if(!roadMap(m) || !m.sub) return; const n = G.mapUnlockNumberOf(m.id);
    (m.nodes || []).forEach(x=> Object.keys(x.deck || {}).forEach(id=>{ const d = D[id]; if(d && !(x.leaders || []).includes(id) && !G.roadRarityOk(d.rarity, n, x.kind, m.id) && !(x.dungeon)) bad.push(`${x.key} ${id} (${d.rarity})`); })); });
  ok(!bad.length, '2. no side-map fight over its cap: ' + bad.join('; ')); }
[['2-B-1', 'grey-seal-bull', 'mallard-marauder'], ['7-A-1', 'bombardier-beetle', 'swarm-matriarch'], ['7-A-2', 'hawthorn-shieldbug', 'wolf-spider-mother']].forEach(([key, inn, out])=>{
  const n = MAPS.flatMap(m=> m.nodes || []).find(x=> x.key === key); ok(n && n.deck[inn] && !n.deck[out], `2. ${key}: ${out} -> ${inn}`); });

// ---- 3. the ten held cards
const TEN = {'alley-cat': [1, 1], 'honey-badger-fury': [1, 6], 'chipmunk-hoarder': [2, 6], 'chipmunk-cavalry': [2, 2], 'pyroclast-wyrm': [3, 12], 'plague-gnat-cloud': [2, 2],
  'sunfeather-scout': [1, 4], 'lone-grey-wolf': [2, 9], 'rock-pool-starfish': [1, 1], 'muskrat-lodgekeeper': [1, 5]};
// 2026-10-28 (RELFIX2): BAL7 moved two of them on (its notes in cards.json): M1's re-balance chipmunk-hoarder 2/6 -> 2/5, the Shield re-fit (FIN2-2) muskrat-lodgekeeper 1/5 -> 1/7
TEN['chipmunk-hoarder'] = [2, 5]; TEN['muskrat-lodgekeeper'] = [1, 7];
// 2026-10-30 RECOST1: Quick and Bleed re-priced to their bench worth, then the under-budget, measurably weak cards lifted (docs/balance/recost1-2026-10-30.json)
TEN['alley-cat'] = [2, 2]; TEN['chipmunk-cavalry'] = [3, 3];
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8')), byId = new Map(cards.map(c=> [c.id, c]));
const held = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'bal2-refit-2026-10-24.json'), 'utf8')).held || [];
const flagged = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'human-pass-1-flagged-2026-10-21.json'), 'utf8'));
Object.entries(TEN).forEach(([id, [a, h]])=>{ const c = byId.get(id);
  ok(c && c.attack === a && c.health === h, `3. ${id} is ${a}/${h} (its formula line; got ${c && c.attack}/${c && c.health})`);
  ok(!held.some(x=> x.id === id) && !flagged.includes(id), `3. ${id} is off the held / flagged lists`); });

// ---- 4. Rising Tide: Quick and +1 Attack at Flood
function scene(rules){ const defs = Object.assign({}, H.loadCardDefs()), engine = E.makeSimEngine(defs, H.seededRng(1), {recordEvents: true, rules});
  const players = {1: engine.newPlayer(1, {}), 2: engine.newPlayer(2, {'guppy': 10})}, sideOf = id=> id === 1 ? 'A' : 'B', ev = [];
  engine.debugSpawnCard(players, sideOf, 2, 'guppy', 'center', {}, ev); engine.debugSpawnCard(players, sideOf, 1, 'beaver-builder', 'center', {}, ev);
  H.boardCards(players[1]).forEach(c=>{ c.atk = c.baseAtk = 0; }); H.boardCards(players[2]).forEach(c=>{ c.wait = 0; });
  engine.resolveCombat(players, sideOf, {}, ev, 2); const g = H.boardCards(players[2])[0]; return {g, defs}; }
{ const on = scene({permaTide: true, boon: 'risingTide'}), off = scene({permaTide: true}), dry = scene({boon: 'risingTide'});
  ok(on.g && on.g.boon === 'risingTide' && !!on.defs[on.g.defId].effects.quick, '4. Rising Tide: Quick at Flood');
  ok(on.g && off.g && (on.g.phaseAtk || 0) === (off.g.phaseAtk || 0) + 1, `4. Rising Tide: +1 Attack at Flood (${off.g && off.g.phaseAtk} -> ${on.g && on.g.phaseAtk})`);
  ok(dry.g && !dry.defs[dry.g.defId].effects.quick && !(dry.g.phaseAtk || 0), '4. Rising Tide: nothing while the tide is out'); }
ok(/Quick and have \+1 Attack while the tide is in/.test(fs.readFileSync(path.join(ROOT, 'bramblewood-texts.js'), 'utf8')), '4. its text names the +1 Attack');

// ---- 5. the retuned road
let road = null; try{ road = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'bal3-road-2026-10-24.json'), 'utf8')); }catch(e){}
ok(road && road.main && road.main.fights === 179, '5. the road table measures Maps 0-24 (179 fights)');
ok(road && road.main.greenAfter > road.main.greenBefore, `5. more fights green after (${road && road.main.greenBefore} -> ${road && road.main.greenAfter})`);
{ const bad = [];
  MAPS.forEach(m=>{ if(!roadMap(m)) return; const no = G.mapNumberOf(m.id); if(no == null || no > 24 || (m.sub && m.id !== 'mpd')) return;
    (m.nodes || []).forEach(n=>{ if(!n.deck || n.kind === 'tutorial' || n.kind === 'raidboss') return; G.NODE_MAP_HINT.set(n, m.id); const ids = Object.keys(n.deck);
      ids.forEach(id=>{ if(!D[id]) bad.push(`${n.key} unknown ${id}`); else if(n.deck[id] > G.maxCopiesForRarity(D[id].rarity)) bad.push(`${n.key} ${id} x${n.deck[id]} over the ladder`); });
      if((n.kind || 'skirmish') === 'skirmish' && (ids.length < 5 || ids.length > 7)) bad.push(`${n.key} ${ids.length} different cards`);
      (G.skirmishLeadersOf(n, m.id) || []).forEach(id=>{ if(!n.deck[id] && !(n.leaders || []).includes(id)) bad.push(`${n.key} leader ${id} not in its deck`); });
      if(n.rules && n.rules.boon && !E.selfishBoonCount(D, n.deck, n.rules.boon).on) bad.push(`${n.key} boon ${n.rules.boon} off`); }); });
  ok(!bad.length, '5. the road decks keep the rules: ' + bad.slice(0, 10).join('; ')); }

console.log(`bal3-2026-10-24: ${checks - fail}/${checks} passed${fail ? `, ${fail} failed` : ''}`);
process.exit(fail ? 1 : 0);
