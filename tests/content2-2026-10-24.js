#!/usr/bin/env node
// 2026-10-24 (package CONTENT2): the content pass (docs/action-items.md 10-23 20:50 row 10; owner 13:12 #8).
//   1. the 18 new cards: on budget (tools/content2_2026_10_24.js check), unique numericIds, at most two skills, placed ones in their
//      map's pool as pack cards, the Gnawed / Tidefolk ones awaiting a source and tagged with their people (canonical/unit-themes.json);
//   2. the Lumber gatherers and the Stone loop: each gatherer pays Lumber, the Stone cards pay Stone, Quarry converts 1 Lumber -> 1 Stone and
//      Milling pays every turn in the real engine;
//   3. N21-1 / N21-2 decks: the Rock Pool Starfish in a Pebble Beach fight, the beach's shore birds and crabs, the gannet on Gannet Cliffs,
//      the Leech Pools' leeches (Bog Leech on Map 5's Special list), and every touched deck inside the deck rules;
//   4. the rename (Gilded Roadwarden) and Mirrorhide Mutant's Mimic line, translated in all 12 packs, the old rows gone;
//   5. the owner calls CONTENT2-1 .. CONTENT2-6, and the uncharted unlocks left where they are (CONTENT2-4's default).
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.join(__dirname, '..'), R = f=> fs.readFileSync(path.join(ROOT, f), 'utf8'), J = f=> JSON.parse(R(f));
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const C2 = require(path.join(ROOT, 'tools', 'content2_2026_10_24.js'));
const cards = J('canonical/cards.json'), by = Object.fromEntries(cards.map(c=> [c.id, c]));
const pools = J('canonical/map-pools.json').maps, ut = J('canonical/unit-themes.json'), utBy = Object.fromEntries(ut.units.map(u=> [u.id, u]));
const CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];

// ---- 1. the new cards
ok(C2.NEW.length === 18, `18 new cards (${C2.NEW.length})`);
const chk = cp.spawnSync(process.execPath, [path.join(ROOT, 'tools', 'content2_2026_10_24.js'), 'check'], {encoding: 'utf8'});
// 2026-10-28 APPLY1: lists follow THEME2 (owner 23:05): the tool's "not in pool <id>" is no problem when THEME2 leaves the card off that map's
// list (the tool pins CONTENT2's placements); every other problem (a card over its budget) still fails
// 2026-10-29 THEME3: lists follow the owner's 23:35/00:10 notes: the expected list is THEME3's (canonical/map-review.json `chosen`, written by tools/theme3_2026_10_29.py with the file), THEME2's where THEME3 has none
const T2 = Object.assign(Object.fromEntries(J('docs/balance/theme2-proposal-2026-10-28.json').maps.filter(m=> !m.skipped).map(m=> [m.key, m.proposed])), Object.fromEntries(Object.entries(JSON.parse(require('fs').readFileSync(require('path').join(ROOT, 'canonical', 'map-review.json'), 'utf8')).maps).map(([k, e])=> [k, e.chosen.map(c=> c.id)])));
// 2026-11-11 (SKIR1): Maps 0-20's lists are the owner's 2026-11-11 picks + admin adds / THEME8's suggestions (tests/skir1-2026-11-11.js checks them)
Object.keys(pools).forEach(k=>{ const L = require(path.join(ROOT, 'docs', 'balance', 'skir1', 'lists-2026-11-11.json')); if((L.main || {})[k]) T2[k] = pools[k].cards; });
const placeOf = Object.fromEntries(C2.NEW.filter(s=> s.place).map(s=> [s.id, s.place[0]]));
const probs = (chk.stdout || '').trim().split('\n').filter(l=> l && !/^(ok:|\d+ problem)/.test(l)).filter(l=>{ const m = /^not in pool (\S+)$/.exec(l); return !(m && placeOf[m[1]] && !(T2[placeOf[m[1]]] || []).includes(m[1])); });
// 2026-10-29 LISTFIX1: cards on no list are out of play (owner 22:47): "over budget <id>" is reported, not failed, for a card that is unplaced
// (on no list) or pending the owner's re-fit (step 3) (tools/lib_map_pools.js budgetHold)
const LMP = require(path.join(ROOT, 'tools', 'lib_map_pools.js'));
probs.splice(0, probs.length, ...probs.filter(l=>{ const m = /^over budget (\S+)/.exec(l), h = m && LMP.budgetHold(m[1]); if(h) console.log(`  · ${m[1]}: budget not checked, ${h}`); return !h; }));
ok(!probs.length, `every new card is on its budget, placed (where THEME2 lists it) or awaiting (${probs.join('; ') || 'ok'})`);
const nids = cards.map(c=> c.numericId).filter(x=> x != null);
ok(new Set(nids).size === nids.length, 'numericIds are unique');
const skillCount = e=> Object.keys(e || {}).filter(k=> k !== 'triggers' && k !== 'packLeaderOf').length + ((e && e.triggers) || []).length;
for(const s of C2.NEW){ const c = by[s.id];
  ok(c, `${s.id} is in cards.json`); if(!c) continue;
  // 2026-11-12 (TESTFIX1): the Driftwood Crab is an owner card now (his live edit folded by CONTENT12: Guardian + Crab Claws + On Attacked Lumber); the two-skill rule binds the cards CONTENT2 made
  ok(skillCount(c.effects) <= 2 || require(path.join(ROOT, 'tools', 'pipeline', 'config.json')).refit.ownerCards.includes(s.id), `${s.id}: two skills at most (${JSON.stringify(c.effects)})`);
  ok(c.attack >= 1 && c.health >= 1 && /Fit: the formula line/.test(c.creatorNote || ''), `${s.id}: fitted by the formula (${c.attack}/${c.health})`);
  ok(!c.art || /^data:image\/png;base64,/.test(c.art), `${s.id}: placeholder art (its emoji ${c.icon}), or its painted art since (2026-11-04 TESTFIX1: ART2 painted them on 10-29)`);
  if(s.place){ const [map, tier] = s.place;
    // 2026-11-05 (CONTENT10, LISTFIX2-1 b): the Driftwood Crab is 2-5's skirmish reward now (for the Grey Seal Bull), a reward of the same map
    const c10 = s.id === 'driftwood-crab' && c.source && c.source.kind === 'map' && c.source.id === map && c.source.node === '2-5';
    ok(c10 || (c.source && c.source.kind === 'pack' && c.source.map === map && c.source.tier === tier && !c.awaitingSource), `${s.id}: a Pack ${tier} card of ${map}${c10 ? ' (CONTENT10: now 2-5\'s reward)' : ''}`);
    ok(pools[map].cards.includes(s.id) === (T2[map] || []).includes(s.id), `${s.id}: its place on ${map}'s list follows THEME2`); } // 2026-10-28 APPLY1: lists follow THEME2
  else ok(c.awaitingSource && !c.source && /proposed:/.test(c.creatorNote), `${s.id}: awaiting a source, with a proposed one`); }
const gnawed = ['bog-shrew', 'mire-rat', 'hollow-belly-rat', 'gnawed-matriarch'], tide = ['kelpborn-otter', 'conger-eel', 'selkie-wavebinder'];
gnawed.forEach(id=> ok(utBy[id] && utBy[id].faction === 'gnawed', `${id} is one of the Gnawed (unit themes: ${utBy[id] && utBy[id].faction})`));
tide.forEach(id=> ok(utBy[id] && utBy[id].faction === 'tidefolk', `${id} is one of the Tidefolk (unit themes: ${utBy[id] && utBy[id].faction})`));
// 2026-11-12 (TESTFIX1): counts.faction leaves out the evolved variants (4 / 4); the units list holds 5 / 5, the size the rule meant
const nFac = f=> ut.units.filter(u=> u.faction === f).length;
ok(nFac('gnawed') >= 4 && nFac('tidefolk') >= 5, `the thin factions grew (Gnawed ${nFac('gnawed')}, Tidefolk ${nFac('tidefolk')}; counts.faction ${ut.counts.faction.gnawed} / ${ut.counts.faction.tidefolk})`);
ok(utBy['gannet-nestweaver'].biomes[0] === 'cliffs' && utBy['redwood-woodpecker'].biomes[0] === 'redwood' && utBy['driftwood-crab'].biomes[0] === 'coast', 'the gatherers carry their biome');

// ---- 2. Lumber and Stone
// 2026-11-04 (TESTFIX1): ENG22 (2026-11-03, owner 21:10, DESIGN1-6) folds "a resource when Ready" into Delivery {X} (Lumber by default; deliveryEvery each round)
const SP = require(path.join(ROOT, 'bramblewood-skillparams.js')); // 2026-11-12 (TESTFIX1): ENG35 fused skills (delivery {v, res}) read as their flat keys, as content12 does
// 2026-11-12 (TESTFIX1): + the owner's On Attacked (Driftwood Crab) and On Kill (Gull Thief) gathers
const pays = (c, res)=>{ c = SP.expandDef(c); const e = c.effects || {}; return (res === 'lumber' && (e.milling || e.onReadyGold || ((e.delivery || e.deliveryEvery) && (!e.deliveryRes || e.deliveryRes === 'lumber')))) || (res !== 'lumber' && (e.delivery || e.deliveryEvery) && e.deliveryRes === res) || (e.triggers || []).some(t=> t.do === 'gain' && t.resource === res && ['onReady', 'onSpawn', 'onAttacked', 'onKill'].includes(t.on)); };
['driftwood-crab', 'gannet-nestweaver', 'nutria-reedcutter', 'redwood-woodpecker', 'termite-forager', 'cone-cutter-squirrel', 'talus-pika', 'dune-packrat', 'land-tiller', 'coral-polyp-colony', 'rodent-king']
  .forEach(id=> ok(pays(by[id], 'lumber'), `${id} gathers Lumber`));
const gainOf = c=> c.effects.delivery || (c.effects.triggers || [])[0] && c.effects.triggers[0].amount; // TESTFIX1: Delivery N since ENG22
ok(new Set(['driftwood-crab', 'nutria-reedcutter', 'cone-cutter-squirrel', 'dune-packrat'].map(id=> gainOf(by[id]))).size === 3, 'the gatherers come at different strengths (+1, +2, +3)');
// 2026-10-28 APPLY1: lists follow THEME2 (owner 23:05): the card's place on its map's list is THEME2's (the Land Tiller is on Maps 23-24's lists now)
Object.entries(C2.EXISTING).forEach(([id, [map, tier]])=> ok(pools[map].cards.includes(id) === (T2[map] || []).includes(id) && by[id].source.map === map && by[id].source.tier === tier, `${id}: its source is ${map}, its place on ${map}'s list follows THEME2`));
ok(pays(by['gravel-mole'], 'stone') && pays(by['pumice-beetle'], 'stone'), 'two Stone gatherers');
// 2026-10-28 APPLY1: lists follow THEME2 (owner 23:05): the Gravel Mole is off the caves' list; the Stone gatherer there is THEME2's mix pick
// 2026-11-12 (TESTFIX1): SKIR1's rule (owner 11-11 "No stone until Map 21+") took every Stone card off the lists of Maps 0-20, so the converter and the Gravel Mole sit on no list there; the rule that stays: Quarry 1, and no list of Maps 0-20 holds either
{ const GN = require(path.join(ROOT, 'tools', 'lib_bramble.js')).G, early = id=> Object.entries(pools).filter(([k, e])=> { const no = GN.mapNumberOf(k); return no != null && no <= 20 && [].concat(e.cards, e.special || [], ...Object.values(e.submaps || {}).map(l=> Array.isArray(l) ? l : l.cards || [])).includes(id); }).map(([k])=> k);
  ok(by['badger-stonemason'].effects.quarry === 1 && !early('badger-stonemason').length && !early('gravel-mole').length, `the converter (Quarry 1) and the Gravel Mole are on no list before Map 21 (${early('badger-stonemason').concat(early('gravel-mole')).join(', ') || 'none'})`); }
{ const H = require('./lib/harness.js'), E = H.Engine, defs = H.loadCardDefs();
  const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
  const mk = ()=>{ const e = E.makeSimEngine(defs, E.mulberry32(7), {recordEvents: true, battleMode: 'open'}); return {e, P: {1: e.newPlayer(1, {}), 2: e.newPlayer(2, {})}}; };
  const put = (e, P, id)=>{ const pl = P[1], c = e.makeBoardCard(id); c.slot = 0; c._seenAt = 0; c.wait = 0; pl.row.center = all(pl).concat(c).filter(x=> x.slot === 0); e.syncSlots(pl); return c; };
  { const {e, P} = mk(); put(e, P, 'badger-stonemason'); P[1].lumber = 3; P[1].stone = 0; e.resolveCombat(P, id=> id === 1 ? 'A' : 'B', {}, [], 1);
    ok(P[1].lumber === 2 && P[1].stone === 1, `Badger Stonemason: 1 Lumber -> 1 Stone a turn (${P[1].lumber}L ${P[1].stone}S)`); }
  // 2026-11-04 (TESTFIX1): ENG16 (2026-11-02, owner JJ17) made Milling turn 1 of your Lumber into 2 (it needs Lumber you hold, net +N): it starts with 1
  { const {e, P} = mk(); put(e, P, 'redwood-woodpecker'); P[1].lumber = 1; e.resolveCombat(P, id=> id === 1 ? 'A' : 'B', {}, [], 1);
    ok(P[1].lumber === 2, `Redwood Woodpecker: +1 Lumber a turn while Ready (net; ${P[1].lumber})`); } }

// ---- 3. the decks (N21-1, N21-2)
const src = R('arena_app.js');
const deckOf = key=>{ const m = src.match(new RegExp(`key:"${key}"[^\\n]*?deck:(\\{[^}]*\\})`)); return m ? JSON.parse(m[1]) : null; };
const d21 = deckOf('2-1'), d22 = deckOf('2-2'), d23 = deckOf('2-3'), d31 = deckOf('3-1'), d33 = deckOf('3-3'), d51 = deckOf('5-1');
// 2026-10-28 APPLY1: lists follow THEME2 (the Starfish is on no list now); the deck-vs-pool check below still flags 2-1 until the decks are rebuilt.
ok(d21 && d21['rock-pool-starfish'] >= 1, 'N21-1: the Rock Pool Starfish fights in Rock Pool Raiders (2-1)');
// 2026-11-12 (TESTFIX1): SKIR1 / SKIR3 rebuilt every road deck from the new lists, so these four rules read the whole road of the map: each CONTENT2 card still fights in some fight of its map
const LBX = require(path.join(ROOT, 'tools', 'lib_bramble.js')).G, roadHas = (mid, id)=> (LBX.CONQUEST_MAPS.find(m=> m.id === mid).nodes || []).some(nd=> (nd.deck || {})[id] > 0);
ok(roadHas('mb', 'oystercatcher') && roadHas('mb', 'gull-thief'), 'Pebble Beach (Gull Gang\'s map) still fights its two shore birds');
ok(roadHas('mb', 'driftwood-crab'), 'Pebble Beach still fields the Driftwood Crab (Hermit Row\'s map)');
ok(d31 && d33 && !d31['hawk-arrowkeeper'] && !d33['hawk-arrowkeeper'] && roadHas('mc', 'gannet-nestweaver'), 'N21-2: Gannet Nestweavers fight on Gannet Cliffs, the Hawk Arrowkeepers are out of 3-1 and 3-3');
ok(d51 && !d51['venomlord-serpent'] && roadHas('mw', 'bog-leech') && pools.mw.special.includes('bog-leech'), 'the Leech Pools\' map (Map 5) fights Bog Leeches (5-1 no longer, SKIR rebuilt it); Bog Leech is on Map 5\'s Special list');
const LF1D = J('docs/balance/listfix1-decks-2026-10-29.json').list; // 2026-10-29 LISTFIX1
const MAXC = {common: 5, uncommon: 4, rare: 3, veryrare: 2};
for(const [k, d] of Object.entries({'2-1': d21, '2-2': d22, '2-3': d23, '3-1': d31, '3-3': d33, '5-1': d51})){ if(!d) continue;
  const ids = Object.keys(d), mapId = {'2': 'mb', '3': 'mc', '5': 'mw'}[k[0]], pool = new Set([...pools[mapId].cards, ...pools[mapId].special]);
  ok(ids.length >= 5 && ids.length <= 7, `${k}: 5-7 different cards (${ids.length})`);
  ok(ids.every(id=> d[id] <= (MAXC[by[id].rarity] || 1)), `${k}: inside the copy ladder`);
  ok(ids.every(id=> ['common', 'uncommon', 'starter'].includes(by[id].rarity)), `${k}: Common / Uncommon only (Maps 2-5 skirmishes)`);
  // 2026-10-29 LISTFIX1: decks are not rebuilt yet (the owner's step 4): a card off the pool is reported, and it must be on the LISTFIX1 list
  // 2026-10-29 THEME3: lists follow the owner's 23:35/00:10 notes; a card THEME3 cut from the map's list (canonical/map-review.json `cut`) counts as recorded too
  // 2026-11-12 (TESTFIX1): the fight's legal pool is SKIR1's (its map's list + SPECIAL, its own first-clear cards, leaders; tools/skir1/lib_fight): a card of it is not "off the pool" (Razorbill, kept for 3-1 / 3-3)
  const SKL = require(path.join(ROOT, 'tools', 'skir1', 'lib_fight_2026_11_11.js')), skm = SKL.maps().find(m=> m.id === mapId), skn = SKL.fightsOf(skm).find(x=> x.key === k), legal = skn ? SKL.fight(skm, skn).pool : [];
  const offp = ids.filter(id=> !pool.has(id) && !legal.includes(id)), rec = (LF1D.find(f=> f.map === mapId && f.key === k) || {off: []}).off.map(o=> o.id).concat(((J('canonical/map-review.json').maps[mapId] || {}).cut || []).map(c=> c.id));
  if(offp.length) console.log(`  · ${k}: off its map's pool, not rebuilt yet (step 4): ${offp.join(', ')}`);
  ok(offp.every(id=> rec.includes(id)), `${k}: every card from its map's pool, or listed in docs/balance/listfix1-decks-2026-10-29.json (${offp.filter(id=> !rec.includes(id)).join(', ')})`); }
const after = R('docs/balance/skirmish-pass-content2-after.jsonl').trim().split('\n').map(l=> JSON.parse(l));
ok(after.length === 6 && after.every(r=> r.games === 200), 'the touched fights were re-measured (200 games each, tools/skirmish_pass.js measure)');
const before = Object.fromEntries(R('docs/balance/skirmish-pass-content2-before.jsonl').trim().split('\n').map(l=> JSON.parse(l)).map(r=> [r.code, r]));
after.forEach(r=>{ const b = before[r.code]; ok(r.green === 'green' || Math.abs(r.win - r.target) <= Math.abs(b.win - b.target), `${r.code}: in its band or no worse (${b.win} -> ${r.win}, target ${r.target})`); });

// ---- 4. the rename and the flavour
ok(by['cataphract-destrier'].name === 'Gilded Roadwarden', 'Cataphract Destrier is the Gilded Roadwarden (id kept)');
ok(!/two of it/.test(by['mirrorhide-mutant'].flavor) && by['mirrorhide-mutant'].effects.mimic, 'Mirrorhide Mutant\'s flavour fits Mimic');
for(const code of CODES){
  const cpk = J(`lang/cards/${code}.json`), ui = J(`lang/ui/${code}.json`), main = J(`lang/${code}.json`);
  ok(cpk['Gilded Roadwarden'] && !cpk['Cataphract Destrier'] && !main['Cataphract Destrier'], `${code}: the new name, the old one gone`);
  ok(ui[by['mirrorhide-mutant'].flavor] && !Object.keys(ui).some(k=> /Now there are two of it/.test(k)), `${code}: Mirrorhide's new line, the old one gone`);
  const miss = C2.NEW.filter(s=> !cpk[by[s.id].name] || !ui[by[s.id].flavor]).map(s=> s.id);
  ok(!miss.length, `${code}: every new card's name and flavour (${miss.join(', ')})`); }

// ---- 5. the owner calls, the uncharted unlocks
const dec = J('docs/decisions.json').items;
['CONTENT2-1', 'CONTENT2-2', 'CONTENT2-3', 'CONTENT2-4', 'CONTENT2-5', 'CONTENT2-6'].forEach(id=> ok(dec.some(x=> x.id === id && (x.status === 'YET' || x.status === 'DONE')), `owner call ${id}`)); // 2026-10-26 (release): the owner answered them 10-25 17:53
// 2026-11-12 (TESTFIX1): UI21 (11-05) moved the nest unlocks to Maps 4 / 8 / 12 / 16 / 20 / 24; the last two prices are the old 25 / 30 ones, unchanged
ok(/^const STRANGE_MATERIA_DROPS = \{12:1, 15:1, 25:2, 30:3\};$/m.test(src) && /\{map:20, cost:\{gold:2800, dust:600\}\},\n\s*\{map:24, cost:\{gold:4000, dust:900\}\},/.test(src), 'the uncharted unlocks stay where they are (CONTENT2-4 default)');
ok(R('docs/art/content2-2026-10-24-briefs.md').split('full background').length - 1 >= 18 && !/\b(no clothes|spiked|studded|monitor|sperm|corpse|sword|spear|blade|dagger|axe)\b/i.test(R('docs/art/content2-2026-10-24-briefs.md')), 'art prompts: one per card, a background each, no banned words');

console.log(fail ? `content2-2026-10-24: ${fail} of ${n} checks FAILED` : `content2-2026-10-24: all ${n} checks passed`); process.exit(fail ? 1 : 0);
