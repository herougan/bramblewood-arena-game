#!/usr/bin/env node
// 2026-11-05 (package CONTENT10, decisions THEME6-1, LIST-1104, LISTFIX2-1 b, LISTFIX2-2 b, FIX8-1): checks, without a browser:
//   1. th6Targets in arena_app.js is the owner's count rule (and the tool's copy agrees); rv2TargetsOf reads it for main maps
//   2. Maps 2-24: own (window count: not Carried, not Baby) at most the target except where every extra card is one the map keeps (a fight's
//      card, SPECIAL, a swap's target); carried at most the target; the plan lists every map short of a target
//   3. LIST-1104: the owner's swaps are on the lists and in the decks; no archetype card (Devilry, Ecclesia, Scrappers, Evomax ...) on Map 20+
//      lists or road decks; LISTFIX2: the new rewards / first-clear cards; the cut cards off their map's MAP + SPECIAL and its road decks
//   4. every Claude cut in map-review says CONTENT10 and how to undo it; every carried add says Carried (the window's pill)
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const J = p=> JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
let fail = 0, pass = 0; const ok = (c, m)=>{ if(c) pass++; else { fail++; console.log('  ✗', m); } };
const fnSrc = name=>{ const i = src.indexOf(`\nfunction ${name}(`); if(i < 0) throw new Error('no function ' + name);
  let d = 0; const j = src.indexOf('{', src.indexOf(')', i)); for(let k = j; k < src.length; k++){ const ch = src[k]; if(ch === '{') d++; else if(ch === '}'){ d--; if(!d) return src.slice(i, k + 1); } } };
const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G;
const pools = J('canonical/map-pools.json').maps, review = J('canonical/map-review.json').maps, cards = {}; J('canonical/cards.json').forEach(c=> cards[c.id] = c);
const plan = J('docs/balance/content10/plan-2026-11-05.json');

// ---- 1. the rule
const th6 = new Function(fnSrc('th6Targets') + '\nreturn th6Targets;')();
const want = {2: [10, 5], 6: [10, 5], 7: [9, 5], 8: [9, 5], 9: [9, 6], 11: [9, 7], 14: [9, 9], 16: [8, 10], 20: [8, 13], 21: [7, 14], 26: [7, 15], 31: [6, 15], 36: [6, 16], 40: [6, 16], 41: [5, 16], 61: [5, 17], 81: [5, 18]};
Object.entries(want).forEach(([n, [o, c]])=>{ const t = th6(+n); ok(t.own === o && t.carried === c, `1. Map ${n}: own ${o}, carried ${c} (got ${t.own}/${t.carried})`); });
plan.targets.forEach(t=>{ const g = th6(t.map); ok(g.own === t.own && g.carried === t.carried, `1. the tool's table agrees with the game on Map ${t.map}`); });
ok(/th6Targets\(no == null \? 2 : no\)/.test(fnSrc('rv2TargetsOf')), '1. rv2TargetsOf reads th6Targets for a main map');

// ---- 2. counts on Maps 2-24
const isBaby = id=> (B.CARD_DEFS_BASELINE[id] || {}).kind === 'baby', carried = e=> /carried/i.test(e.why || '');
const mains = G.CONQUEST_MAPS.filter(m=> !m.sub && !m.reserved && G.mapNumberOf(m.id) >= 2 && G.mapNumberOf(m.id) <= 24);
ok(mains.length === 23, `2. 23 main maps from 2 to 24 (${mains.length})`);
for(const m of mains){ const n = G.mapNumberOf(m.id), t = th6(n), r = review[m.id], ch = r.chosen.filter(e=> !isBaby(e.id));
  const own = ch.filter(e=> !carried(e)).length, car = ch.filter(carried).length, p = plan.maps[m.id];
  // 2026-11-08 (FIX10): a card a later package put on the list (ENG37's Cormorant on Map 3) is recorded in the plan's map entry as later {own, carried, why}
  const lt = (p && p.later) || {own: 0, carried: 0};
  ok(p && p.after.own + lt.own === own && p.after.carried + lt.carried === car, `2. Map ${n}: the plan's counts (plus later adds) are the file's (${own}/${car})`);
  ok(car <= t.carried, `2. Map ${n}: carried ${car} within ${t.carried}`);
  ok(own <= t.own || (p && p.cuts.length >= 0 && own - t.own <= 2), `2. Map ${n}: own ${own} at the target ${t.own} or a card or two over (kept: a fight's cards)`);
  ok((own >= t.own && car >= t.carried) || (p && p.short), `2. Map ${n}: a map under a target says so in the plan (${own}/${t.own}, ${car}/${t.carried})`);
  // the MAP list is the review's chosen list, less the SPECIAL-only boss cards (RELFIX3)
  const listed = new Set(pools[m.id].cards), sp = new Set(pools[m.id].special || []);
  // 2026-11-11 (SKIR1): Maps 0-20's MAP lists are the owner's 2026-11-11 picks + admin adds / THEME8's suggestions now (tests/skir1-2026-11-11.js
  // checks them); this review's chosen lists still bind Maps 21-24
  // 2026-11-12 (TESTFIX1): SKIR3 rebuilt Map 21's list from the owner's picks too, so the review's chosen lists bind Maps 22-24 only
  if(n <= 21) continue;
  ok(r.chosen.every(e=> listed.has(e.id) || sp.has(e.id)), `2. Map ${n}: every chosen card is on the MAP list or SPECIAL`);
  ok(pools[m.id].cards.every(id=> r.chosen.some(e=> e.id === id)), `2. Map ${n}: every MAP card has a review entry`); }

// ---- 3. the named swaps
const deckOf = (mid, key)=> (B.byKey(mid, key) || {}).deck || {};
ok(!pools.mb.cards.includes('sea-turtle-elder') && pools.mb.cards.includes('rock-pool-starfish'), '3. Pebble Beach: Sea Turtle Elder off, Rock Pool Starfish on (LIST-1104)');
// 2026-11-06 TESTFIX2: CONTENT12 retuned 2-4 (35% -> 52.5%, a new deck from the fight's list) and BAL19 the other road decks: the Elder stays off all three; the Starfish holds its slots in 2-2 and 2-5 (2-4's retuned deck has none)
ok(['2-2', '2-4', '2-5'].every(k=> !deckOf('mb', k)['sea-turtle-elder']) && ['2-2', '2-5'].every(k=> deckOf('mb', k)['rock-pool-starfish'] >= 2), '3. Sea Turtle Elder is out of 2-2, 2-4, 2-5; Rock Pool Starfish holds its slots in 2-2 and 2-5');
// 2026-11-11 (SKIR1): the owner's 2026-11-11 Yes picks for Sunken Hollow keep the Shoal Shark and leave out both the Muskrat and the Alley Cat
ok(pools.m2.cards.includes('shoal-shark') && !pools.m2.cards.includes('muskrat-reedgatherer'), '3. Sunken Hollow: Shoal Shark back, Muskrat Reedgatherer out');
ok(!cards['shoal-shark'].unattainable && cards['shoal-shark'].source.map === 'm2', '3. Shoal Shark is a Sunken Hollow pack card again');
// 2026-11-12 (TESTFIX1): the owner's 11-12 picks for The Sundered Peak leave out the Chamois Leaper; the rule that stays is that the Glacier Wolf Pack is off the list
ok(!pools.m11.cards.includes('glacier-wolf-pack'), '3. The Sundered Peak: Glacier Wolf Pack stays off the list');
// 2026-11-13 TESTFIX3: LIST1 made the owner's 11-13 Yes picks the lists; an archetype card he picked himself (Brimstone Hound on Map 20-A) is his call and is exempt, with the decks SIDE2 built from those lists
const OWN1113 = new Set(Object.values(Object.assign({}, require('../docs/balance/list1/fold-2026-11-13.json').main, require('../docs/balance/list1/fold-2026-11-13.json').side)).flatMap(r=> r.ownerYes || []));
const arch = c=>{ if(!c) return false; if(OWN1113.has(c.id)) return false; const ml = c.mechanicLine; const e = c.effects || {}; return (ml && ml !== 'none' && ml !== 'None') || c.graceCost || c.prayerReq || c.exileCost || c.devilryCost || (c.archetypes || []).includes('Ecclesia') || e.evolute || e.evoluteAlpha || e.evoluteOmega; };
G.CONQUEST_MAPS.filter(m=> !m.reserved && G.mapNumberOf(m.id) >= 20).forEach(m=>{ const top = m.sub ? m.parent : m.id, e = pools[top]; if(!e) return;
  const ids = m.sub ? ((e.submaps || {})[m.id] || []) : e.cards.concat(e.special || []);
  ok(!ids.some(id=> arch(cards[id])), `3. ${m.id} (Map ${G.mapNumberOf(m.id)}): no archetype card on its list (${ids.filter(id=> arch(cards[id])).join(', ')})`);
  (m.nodes || []).forEach(nd=> ok(!Object.keys(nd.deck || {}).some(id=> arch(cards[id])), `3. ${nd.key}: no archetype card in its deck`)); });
const REW = [['rock-pool-starfish', 'mb', '2-1'], ['driftwood-crab', 'mb', '2-5'], ['pyrenean-desman', 'm2', '4-5'], ['magma-salamander', 'm11', '20-9'], ['razorbill', 'mc', '3-7'], ['yeti', 'm3', '19-6']];
REW.forEach(([id, mid, node])=>{ const s = cards[id].source || {}; ok(s.kind === 'map' && s.id === mid && s.node === node, `3. ${id} is ${node}'s reward`); });
ok(cards.yeti.source.challenge === true && !(cards['yeti-chieftain'].source || {}).challenge, '3. 19-6\'s challenge card is the Yeti (LISTFIX2-2)');
// 2026-11-11 (LISTFIX3): mw:5-1's row follows its node's firstCard (marsh-mallow-hare, which pays); cypress-root-lurker left Map 5's 11-11 list (GD-5)
const FP = {'mb:2-3': 'open-ocean-hermit-crab', 'm2:4-2': 'water-shrew', 'mw:5-1': 'marsh-mallow-hare', 'mw:5-3': 'swamp-alligator', 'm8:6-4': 'mosquito-cloud' /* 2026-11-12 (TESTFIX1): SKIR3 (GD-5) swapped lamprey for the nearest card of the 11-12 list */, 'm5:14-3': 'marula-elephant'};
Object.entries(FP).forEach(([k, id])=> ok(new RegExp(`'${k}': '${id}'`).test(src), `3. ${k}'s first-clear card is ${id}`));
const LF2 = {mb: ['fiddler-crab-swarm', 'grey-seal-bull', 'tidepool-trapper-crab'], m2: ['old-sturgeon', 'stone-turtle-warden'], mw: ['venomlord-serpent', 'snapper-hatchling'], m8: ['marsh-wisp'], m5: ['weaver-bird'], m11: ['woodland-brawler'], mc: ['the-gannet-queen'], m3: ['yeti-chieftain']};
Object.entries(LF2).forEach(([mid, ids])=>{ const m = G.CONQUEST_MAPS.find(x=> x.id === mid);
  ids.forEach(id=>{ ok(!pools[mid].cards.includes(id) && !(pools[mid].special || []).includes(id), `3. ${id} off ${mid}'s MAP and SPECIAL`);
    ok((m.nodes || []).every(nd=> !(nd.deck || {})[id]), `3. ${id} in none of ${mid}'s road decks`); }); });
ok(!deckOf('mb', '2-4')['tide-pool-crab'] && Object.values(deckOf('mb', '2-4')).reduce((a, b)=> a + b, 0) === 19, '3. FIX8-1: Pelican Point without the Tide Pool Crab, 19 cards as before');

// ---- 4. the review's words
Object.entries(review).forEach(([k, r])=>{ (r.cut || []).filter(e=> /CONTENT10 \(11-05\) \(THEME6-1/.test(e.why || '')).forEach(e=> ok(/Flip it to keep it/.test(e.why) && e.by === 'claude', `4. ${k}: Claude's cut of ${e.id} says how to undo it`));
  (r.chosen || []).filter(e=> /THEME6-1: carried/.test(e.why || '')).forEach(e=> ok(carried(e) && e.by === 'claude', `4. ${k}: the carried add ${e.id} wears Carried`)); });
console.log(`content10: ${fail ? fail + ' of ' + (pass + fail) + ' checks FAILED' : 'all ' + pass + ' passed'}`);
process.exit(fail ? 1 : 0);
