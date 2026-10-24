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
ok(chk.status === 0, `every new card is on its budget, placed or awaiting (${(chk.stdout || '').trim().split('\n').pop()})`);
const nids = cards.map(c=> c.numericId).filter(x=> x != null);
ok(new Set(nids).size === nids.length, 'numericIds are unique');
const skillCount = e=> Object.keys(e || {}).filter(k=> k !== 'triggers' && k !== 'packLeaderOf').length + ((e && e.triggers) || []).length;
for(const s of C2.NEW){ const c = by[s.id];
  ok(c, `${s.id} is in cards.json`); if(!c) continue;
  ok(skillCount(c.effects) <= 2, `${s.id}: two skills at most (${JSON.stringify(c.effects)})`);
  ok(c.attack >= 1 && c.health >= 1 && /Fit: the formula line/.test(c.creatorNote || ''), `${s.id}: fitted by the formula (${c.attack}/${c.health})`);
  ok(!c.art, `${s.id}: placeholder art (its emoji ${c.icon})`);
  if(s.place){ const [map, tier] = s.place;
    ok(c.source && c.source.kind === 'pack' && c.source.map === map && c.source.tier === tier && !c.awaitingSource, `${s.id}: a Pack ${tier} card of ${map}`);
    ok(pools[map].cards.includes(s.id), `${s.id}: in ${map}'s pool`); }
  else ok(c.awaitingSource && !c.source && /proposed:/.test(c.creatorNote), `${s.id}: awaiting a source, with a proposed one`); }
const gnawed = ['bog-shrew', 'mire-rat', 'hollow-belly-rat', 'gnawed-matriarch'], tide = ['kelpborn-otter', 'conger-eel', 'selkie-wavebinder'];
gnawed.forEach(id=> ok(utBy[id] && utBy[id].faction === 'gnawed', `${id} is one of the Gnawed (unit themes: ${utBy[id] && utBy[id].faction})`));
tide.forEach(id=> ok(utBy[id] && utBy[id].faction === 'tidefolk', `${id} is one of the Tidefolk (unit themes: ${utBy[id] && utBy[id].faction})`));
ok(ut.counts.faction.gnawed >= 4 && ut.counts.faction.tidefolk >= 5, `the thin factions grew (Gnawed ${ut.counts.faction.gnawed}, Tidefolk ${ut.counts.faction.tidefolk})`);
ok(utBy['gannet-nestweaver'].biomes[0] === 'cliffs' && utBy['redwood-woodpecker'].biomes[0] === 'redwood' && utBy['driftwood-crab'].biomes[0] === 'coast', 'the gatherers carry their biome');

// ---- 2. Lumber and Stone
const pays = (c, res)=>{ const e = c.effects || {}; return (res === 'lumber' && (e.milling || e.onReadyGold)) || (e.triggers || []).some(t=> t.do === 'gain' && t.resource === res && (t.on === 'onReady' || t.on === 'onSpawn')); };
['driftwood-crab', 'gannet-nestweaver', 'nutria-reedcutter', 'redwood-woodpecker', 'termite-forager', 'cone-cutter-squirrel', 'talus-pika', 'dune-packrat', 'land-tiller', 'coral-polyp-colony', 'rodent-king']
  .forEach(id=> ok(pays(by[id], 'lumber'), `${id} gathers Lumber`));
ok(new Set(['driftwood-crab', 'nutria-reedcutter', 'cone-cutter-squirrel', 'dune-packrat'].map(id=> by[id].effects.triggers[0].amount)).size === 3, 'the gatherers come at different strengths (+1, +2, +3)');
Object.entries(C2.EXISTING).forEach(([id, [map, tier]])=> ok(pools[map].cards.includes(id) && by[id].source.map === map && by[id].source.tier === tier, `${id}: placed in ${map}'s pool`));
ok(pays(by['gravel-mole'], 'stone') && pays(by['pumice-beetle'], 'stone'), 'two Stone gatherers');
ok(by['badger-stonemason'].effects.quarry === 1 && pools.m4.cards.includes('badger-stonemason') && pools.m4.cards.includes('gravel-mole'), 'the converter (Quarry 1) and a Stone gatherer on the Stone map (Caves & Alcoves)');
{ const H = require('./lib/harness.js'), E = H.Engine, defs = H.loadCardDefs();
  const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
  const mk = ()=>{ const e = E.makeSimEngine(defs, E.mulberry32(7), {recordEvents: true, battleMode: 'open'}); return {e, P: {1: e.newPlayer(1, {}), 2: e.newPlayer(2, {})}}; };
  const put = (e, P, id)=>{ const pl = P[1], c = e.makeBoardCard(id); c.slot = 0; c._seenAt = 0; c.wait = 0; pl.row.center = all(pl).concat(c).filter(x=> x.slot === 0); e.syncSlots(pl); return c; };
  { const {e, P} = mk(); put(e, P, 'badger-stonemason'); P[1].lumber = 3; P[1].stone = 0; e.resolveCombat(P, id=> id === 1 ? 'A' : 'B', {}, [], 1);
    ok(P[1].lumber === 2 && P[1].stone === 1, `Badger Stonemason: 1 Lumber -> 1 Stone a turn (${P[1].lumber}L ${P[1].stone}S)`); }
  { const {e, P} = mk(); put(e, P, 'redwood-woodpecker'); P[1].lumber = 0; e.resolveCombat(P, id=> id === 1 ? 'A' : 'B', {}, [], 1);
    ok(P[1].lumber === 1, `Redwood Woodpecker: +1 Lumber a turn while Ready (${P[1].lumber})`); } }

// ---- 3. the decks (N21-1, N21-2)
const src = R('arena_app.js');
const deckOf = key=>{ const m = src.match(new RegExp(`key:"${key}"[^\\n]*?deck:(\\{[^}]*\\})`)); return m ? JSON.parse(m[1]) : null; };
const d21 = deckOf('2-1'), d22 = deckOf('2-2'), d23 = deckOf('2-3'), d31 = deckOf('3-1'), d33 = deckOf('3-3'), d51 = deckOf('5-1');
ok(d21 && d21['rock-pool-starfish'] >= 1 && pools.mb.cards.includes('rock-pool-starfish'), 'N21-1: the Rock Pool Starfish fights in Rock Pool Raiders (2-1) and sits in the beach pool');
ok(d22 && d22.oystercatcher >= 1 && d22['gull-thief'] >= 1, 'Gull Gang (2-2) has its two shore birds');
ok(d23 && d23['driftwood-crab'] >= 1, 'Hermit Row (2-3) fields the Driftwood Crab');
ok(d31 && d31['gannet-nestweaver'] && !d31['hawk-arrowkeeper'] && d33 && d33['gannet-nestweaver'] && !d33['hawk-arrowkeeper'], 'N21-2: Gannet Nestweavers for the Hawk Arrowkeepers in 3-1 and 3-3');
ok(d51 && d51['bog-leech'] >= 1 && !d51['venomlord-serpent'] && pools.mw.special.includes('bog-leech'), 'the Leech Pools (5-1) have leeches; Bog Leech is on Map 5\'s Special list');
const MAXC = {common: 5, uncommon: 4, rare: 3, veryrare: 2};
for(const [k, d] of Object.entries({'2-1': d21, '2-2': d22, '2-3': d23, '3-1': d31, '3-3': d33, '5-1': d51})){ if(!d) continue;
  const ids = Object.keys(d), mapId = {'2': 'mb', '3': 'mc', '5': 'mw'}[k[0]], pool = new Set([...pools[mapId].cards, ...pools[mapId].special]);
  ok(ids.length >= 5 && ids.length <= 7, `${k}: 5-7 different cards (${ids.length})`);
  ok(ids.every(id=> d[id] <= (MAXC[by[id].rarity] || 1)), `${k}: inside the copy ladder`);
  ok(ids.every(id=> ['common', 'uncommon', 'starter'].includes(by[id].rarity)), `${k}: Common / Uncommon only (Maps 2-5 skirmishes)`);
  ok(ids.every(id=> pool.has(id)), `${k}: every card from its map's pool (${ids.filter(id=> !pool.has(id)).join(', ')})`); }
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
['CONTENT2-1', 'CONTENT2-2', 'CONTENT2-3', 'CONTENT2-4', 'CONTENT2-5', 'CONTENT2-6'].forEach(id=> ok(dec.some(x=> x.id === id && x.status === 'YET'), `owner call ${id}`));
ok(/^const STRANGE_MATERIA_DROPS = \{12:1, 15:1, 25:2, 30:3\};$/m.test(src) && /\{map:25, cost:\{gold:2800, dust:600\}\},\n\s*\{map:30, cost:\{gold:4000, dust:900\}\},/.test(src), 'the uncharted unlocks stay where they are (CONTENT2-4 default)');
ok(R('docs/art/content2-2026-10-24-briefs.md').split('full background').length - 1 >= 18 && !/\b(no clothes|spiked|studded|monitor|sperm|corpse|sword|spear|blade|dagger|axe)\b/i.test(R('docs/art/content2-2026-10-24-briefs.md')), 'art prompts: one per card, a background each, no banned words');

console.log(fail ? `content2-2026-10-24: ${fail} of ${n} checks FAILED` : `content2-2026-10-24: all ${n} checks passed`); process.exit(fail ? 1 : 0);
