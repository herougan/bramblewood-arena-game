#!/usr/bin/env node
// 2026-10-19 (package UC, owner 08:49: "To move forward, let's separate the units thematically? Then we pick and choose, then do
// post-balancing — meaning we apply skills post-facto. Dangerous versions of a biome monster can come later in the game."): checks that
//   1. canonical/unit-themes.json is what tools/unit_themes.js writes now (--check), and its vocabularies are whole;
//   2. the catalogue covers every creature card, live and pool (not tests, fields, materia, equipment, spells, eggs), once each;
//   3. every unit has a known biome (its main one first), family, faction, size, a base body of numbers and its skills apart;
//   4. the hand-checked overrides are used and counted; the variant rows are well-formed: existing ones point at real cards,
//      proposed ones at a live early base, a later map of a known biome, a stepped-up rarity, an unchanged-or-bigger body inside budget
//      v3, no skills (applied later), an id that is not a card; 1-2 per biome + family;
//   4b. (2026-10-19, package UT) every unit carries its card's animal; proposed variants have thematic name proposals and N-based
//      bodies (player units); the non-player units (the raid's boss units, raid bosses) keep multipliers;
//   5. the hub has the 🗂 Units by theme tab: the data inlined, db collection "unitPicks" with {map, unit, picked, updatedAt},
//      read-only note + Copy JSON when db is null, no localStorage for the picks, the post-balance queue; tools/hub/pull_unit_picks.md
//      and tools/hub/unit_picks_queue.js work on a sample.
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process'), os = require('os');
const ROOT = path.join(__dirname, '..');
const rd = rel=> fs.readFileSync(path.join(ROOT, rel), 'utf8');
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  ✗', m); } };

// 1. fresh and whole
let fresh = true; try{ cp.execFileSync('node', [path.join(ROOT, 'tools/unit_themes.js'), '--check'], {stdio: 'pipe'}); }catch(e){ fresh = false; }
ok(fresh, '1. canonical/unit-themes.json is up to date (node tools/unit_themes.js)');
const T = JSON.parse(rd('canonical/unit-themes.json')), V = T.vocab;
const BIO = new Set(V.biomes.map(b=> b.id)), FAM = new Set(V.families.map(f=> f.id)), FAC = new Set(V.factions.map(f=> f.id)), SIZES = new Set(V.sizes);
['meadow-forest', 'river', 'coast', 'cliffs', 'swamp', 'fungal', 'caves', 'reef-ocean', 'mountain-sky', 'maze-briar', 'redwood', 'savanna', 'long-grass', 'taiga', 'tundra-ice', 'desert-glass', 'pale-desert', 'volcanic-ash']
  .forEach(b=> ok(BIO.has(b), `1. the owner's biome ${b} is in the vocabulary`));
['insect', 'arachnid', 'bird', 'fish', 'mammal', 'reptile', 'amphibian', 'crustacean', 'mollusc', 'fungus', 'spirit-undead', 'construct'].forEach(f=> ok(FAM.has(f), `1. the owner's family ${f} is in the vocabulary`));
['otters', 'hummingbirds', 'ashen-choir', 'greenhood', 'hollow-kin', 'gnawed', 'tidefolk', 'beasts', 'wild'].forEach(f=> ok(FAC.has(f), `1. faction ${f} (lore bible) is in the vocabulary`));
const MAPIDS = new Set(T.maps.map(m=> m.id));
Object.entries(V.mapBiome).forEach(([m, b])=> ok(MAPIDS.has(m) && BIO.has(b), `1. map ${m} has a known biome (${b})`));
T.maps.filter(m=> !['mtut', 'mm', 'mlb'].includes(m.id)).forEach(m=> ok(V.mapBiome[m.id], `1. map ${m.id} ${m.name} has a biome`));

// 2. coverage
const cards = JSON.parse(rd('canonical/cards.json'));
const creature = c=> !(c.test || c.field || c.eggKind || ['materia', 'equipment', 'spell'].includes(c.cardType) || c.hallOfFame);
const want = cards.filter(creature), byId = {}; T.units.forEach(u=>{ ok(!byId[u.id], `2. ${u.id} is listed once`); byId[u.id] = u; });
want.forEach(c=> ok(byId[c.id] && byId[c.id].status === (c.pool ? 'pool' : 'live'), `2. ${c.id} is in the catalogue as ${c.pool ? 'pool' : 'live'}`));
ok(want.some(c=> c.pool) && T.units.some(u=> u.status === 'pool'), '2. pool cards are covered');
const cardIds = new Set(cards.map(c=> c.id));
T.units.filter(u=> u.status !== 'proposed').forEach(u=> ok(cardIds.has(u.id) && creature(cards.find(c=> c.id === u.id)), `2. ${u.id} is a creature card`));
ok(T.counts.live === T.units.filter(u=> u.status === 'live').length && T.counts.pool === T.units.filter(u=> u.status === 'pool').length, '2. counts match the rows');

// 3. tags and bodies
const num = x=> typeof x === 'number' && isFinite(x);
T.units.forEach(u=>{
  ok(Array.isArray(u.biomes) && u.biomes.length && u.biomes.every(b=> BIO.has(b)) && new Set(u.biomes).size === u.biomes.length, `3. ${u.id} has known biomes (${u.biomes})`);
  ok(FAM.has(u.family), `3. ${u.id} has a known family (${u.family})`);
  ok(FAC.has(u.faction), `3. ${u.id} has a known faction (${u.faction})`);
  ok(SIZES.has(u.size), `3. ${u.id} has a size`);
  ok(u.stage == null || [1, 2, 3, 4].includes(u.stage), `3. ${u.id} stage is 1-4 or unplaced`);
  ok(u.body && ['cost', 'wait', 'attack', 'health'].every(k=> num(u.body[k])), `3. ${u.id} base body is numbers`);
  ok(Array.isArray(u.skills) && u.skills.every(s=> Array.isArray(s) && typeof s[0] === 'string'), `3. ${u.id} skills listed apart`);
  if(u.status !== 'proposed'){ const c = cards.find(x=> x.id === u.id);
    ok(u.body.attack === (c.attack || 0) && u.body.health === (c.health || 0) && u.body.cost === (c.cost || 0) && u.body.wait === (c.wait || 0), `3. ${u.id} base body = its printed stats`);
    ok(u.skills.length === Object.entries(c.effects || {}).reduce((n, [k, v])=> n + (k === 'triggers' ? (v || []).filter(Boolean).length : 1), 0), `3. ${u.id} lists every skill`); }
  (u.maps.home || []).forEach(m=> ok(MAPIDS.has(m), `3. ${u.id} home map ${m} is a map`));
});
// a few hand-known tags (the heuristics or the table must get these right)
const tagIs = (id, f, v)=> ok(byId[id] && (Array.isArray(byId[id][f]) ? byId[id][f][0] === v : byId[id][f] === v), `3. ${id} ${f} = ${v} (got ${byId[id] && byId[id][f]})`);
tagIs('otter-centurion', 'faction', 'otters'); tagIs('otter-centurion', 'biomes', 'river'); tagIs('crimson-wing-recruit', 'faction', 'hummingbirds');
tagIs('giant-cave-huntsman', 'biomes', 'caves'); tagIs('giant-cave-huntsman', 'family', 'arachnid'); tagIs('polar-bear', 'biomes', 'tundra-ice');
tagIs('caustic-scorpion', 'biomes', 'desert-glass'); tagIs('fungal-colossus', 'family', 'fungus'); tagIs('moray-ambusher', 'family', 'fish');
tagIs('honey-bee', 'faction', 'hives'); tagIs('red-dragon', 'faction', 'great-beasts'); tagIs('cinder-imp', 'faction', 'ashen-choir'); tagIs('magma-wraith', 'family', 'spirit-undead');

// 4. manual table, variants
const manual = T.units.filter(u=> u.manual && u.manual.length);
ok(manual.length === T.counts.manual && manual.length > 0, `4. hand-tagged units counted (${manual.length})`);
manual.forEach(u=> ok(u.why && u.why.manual, `4. ${u.id} says why it was hand-tagged`));
const tierIds = new Set(V.variantTiers.map(t=> t.id)), STEPS = ['common', 'uncommon', 'rare', 'veryrare', 'superrare', 'epic', 'heroic', 'unique', 'legendary'];
const stepOf = r=> Math.max(0, STEPS.indexOf(r === 'starter' ? 'common' : r));
const existing = T.units.filter(u=> u.variant && u.variant.kind === 'existing');
ok(existing.length === T.counts.existingVariants && existing.length >= 20, `4. existing variants listed (${existing.length})`);
existing.forEach(u=>{ ok(tierIds.has(u.variant.tier), `4. ${u.id} existing variant tier known`); ok(u.variant.of == null || (byId[u.variant.of] && u.variant.of !== u.id), `4. ${u.id} variant base is a unit`); });
const SC = require(path.join(ROOT, 'tools/skill_costs.js')), calc = SC.make(JSON.parse(rd('canonical/skill-costs.json')));
const prop = T.units.filter(u=> u.status === 'proposed');
ok(prop.length === T.counts.proposed && prop.length >= 40, `4. proposed variants (${prop.length})`);
const perGroup = {};
prop.forEach(u=>{ const v = u.variant || {}, base = byId[v.of], tier = V.variantTiers.find(t=> t.id === v.tier);
  ok(v.kind === 'proposed' && tier && tier.proposable !== false, `4. ${u.id} has a proposable tier`);
  ok(!cardIds.has(u.id) && u.id === v.tier + '-' + v.of, `4. ${u.id} is not a card id and names its base`);
  // 2026-10-19 (package UT, owner 09:52: "Dire and Elder are internal naming"): the internal name keeps the prefix; the name is a thematic proposal
  ok(u.internalName === tier.prefix + ' ' + (base && base.name) && u.nameProposal === true && u.name && !/^(Dire|Elder|Ancient) /.test(u.name), `4. ${u.id} has a thematic name proposal ("${u.name}"), internal "${tier && tier.prefix} <base>"`);
  // "They should balance based on N, based on their rarity and resource requirement. Unless this are non-player units."
  ok(u.variant.audience === 'player' && u.variant.statsFrom === 'N' && u.variant.multDraft && u.variant.multDraft.mult, `4. ${u.id} is a player variant with its stats from N (the old multiplier draft kept apart)`);
  ok(u.animal && base && u.animal === base.animal, `4. ${u.id} keeps its base's animal`);
  ok(base && base.status === 'live' && base.stage <= 2, `4. ${u.id} comes from a live early creature`);
  ok(MAPIDS.has(v.map) && T.maps.find(m=> m.id === v.map).no > base.firstMap, `4. ${u.id} lives on a later map (${v.map})`);
  ok(u.biomes[0] === base.biomes[0] && u.family === base.family, `4. ${u.id} keeps its base's biome and family`);
  ok(stepOf(u.rarity) >= stepOf(base.rarity) && stepOf(u.rarity) <= stepOf(base.rarity) + tier.rarity, `4. ${u.id} rarity is stepped up at most ${tier.rarity} (${base.rarity} -> ${u.rarity})`);
  ok(u.body.attack >= base.body.attack && u.body.health >= base.body.health && u.body.cost >= base.body.cost, `4. ${u.id} is not smaller than its base`);
  ok(!u.skills.length, `4. ${u.id} has no skills (applied later)`);
  const b = calc.budget({cost: u.body.cost, wait: u.body.wait, attack: u.body.attack, health: u.body.health, rarity: u.rarity, effects: {}, source: {kind: 'map'}});
  ok(b.ok, `4. ${u.id} base body is inside budget v3 (2A+H ${b.x1} < N ${b.N})`);
  ok(b.x1 <= b.N * V.variantFit + 1e-9 && b.x1 >= b.N * V.variantFit - 4, `4. ${u.id} body fills about ${V.variantFit} of N (2A+H ${b.x1}, N ${b.N})`);
  const k = base.biomes[0] + '|' + base.family; perGroup[k] = (perGroup[k] || 0) + 1; });
Object.entries(perGroup).forEach(([k, n])=> ok(n >= 1 && n <= 2, `4. ${k} has 1-2 proposals (${n})`));

// 4b. animals and non-player units (2026-10-19, package UT)
T.units.filter(u=> u.status !== 'proposed').forEach(u=>{ const c = cards.find(x=> x.id === u.id);
  ok(u.animal && u.animal === c.animal && u.animalGroup && (u.subtype || null) === (c.subtype || null), `4b. ${u.id} carries its card's animal (${u.animal}) and group`); });
ok(V.subtypes && V.subtypes.length >= 5 && V.animalGroups && V.animalGroups.length >= 50, '4b. the vocabulary lists the subtypes and animal groups');
ok(T.units.filter(u=> u.base).length === 27 && !T.units.some(u=> u.starterDeck === 'otters'), '4b. the 27 Base cards are marked base, none as the Otters\' starter deck');
const np = T.nonPlayer || [];
// 2026-10-19 (BF3): the elder of each raid part is the game's own pick, its deck's biggest card by Attack + Health (buildRaidFullFight). After
// the card retune the tail's is the Orca Warlord (8/32 over the Leviathan Elder's 6/32), so the list is checked against that rule, not a name.
{ const RAIDS = JSON.parse(rd('canonical/raids.json')), cOf = Object.fromEntries(cards.map(c=> [c.id, c])); let picks = 0, right = 0;
  RAIDS.forEach(r=> (r.parts || []).forEach(p=>{ const ids = Object.keys(((p.fight || {}).deck) || {}).filter(id=> cOf[id]); if(!ids.length) return; picks++;
    const top = ids.sort((a, b)=> ((cOf[b].attack || 0) + (cOf[b].health || 0)) - ((cOf[a].attack || 0) + (cOf[a].health || 0)))[0];
    if(np.some(n=> n.kind === 'raid-boss-unit' && n.of === top && (n.parts || []).includes(p.id))) right++; }));
  ok(picks > 0 && right === picks && np.every(n=> n.audience === 'non-player'), `4b. the non-player units are listed: each raid part's elder is its deck's biggest card (${right}/${picks})`); }
np.filter(n=> n.kind === 'raid-boss-unit').forEach(n=> ok(n.statsFrom === 'multipliers' && n.mult && byId[n.of], `4b. ${n.id} keeps its multipliers and names its base`));

// 5. the hub
const bh = rd('tools/hub/build_hub.py'), tab = rd('tools/hub/units_tab.js');
ok(bh.includes('units_tab.js') && bh.includes("'unit-themes.json'") && bh.includes('id="p-units"') && bh.includes('data-tab="units"') && bh.includes('UT_DATA'), '5. build_hub.py builds the Units by theme tab with the data');
ok(/collection\('unitPicks'\)/.test(tab) && /\{map: m, unit: u, picked: !!picks\[key\], updatedAt: new Date\(\)\.toISOString\(\)\}/.test(tab), '5. picks persist in db collection unitPicks as {map, unit, picked, updatedAt}');
ok(tab.includes("claude.use('db')") && tab.includes("mode = 'off'") && tab.includes("can't be saved here") && tab.includes('Copy JSON'), '5. read-only note + Copy JSON when db is null');
ok(!/localStorage/.test(tab), '5. no localStorage for the picks');
ok(tab.includes('Post-balance queue') && tab.includes('function needs(') && tab.includes('applied later'), '5. the post-balance queue and "skills applied later"');
ok(/PAGE = \d+/.test(tab) && tab.includes('Show more'), '5. tiles are paged (hundreds of units)');
ok(fs.existsSync(path.join(ROOT, 'tools/hub/pull_unit_picks.md')) && rd('tools/hub/pull_unit_picks.md').includes('unitPicks'), '5. tools/hub/pull_unit_picks.md exists');
const built = path.join(ROOT, 'hub', 'index.html');
if(fs.existsSync(built)){ const h = fs.readFileSync(built, 'utf8'); ok(h.includes('id="p-units"') && h.includes('const UT_DATA = ') && h.includes("collection('unitPicks')"), '5. hub/index.html has the tab, the data and the db code'); }
// the worklist tool on a sample
const tmp = path.join(os.tmpdir(), 'ut-picks-' + process.pid + '.json'), some = prop[0], live = T.units.find(u=> u.status === 'live' && u.skills.length && (u.maps.home || []).length);
fs.writeFileSync(tmp, JSON.stringify([{map: some.variant.map, unit: some.id, picked: true}, {map: live.maps.home[0], unit: live.id, picked: true}, {map: 'm1', unit: live.id, picked: false}]));
let out = ''; try{ out = cp.execFileSync('node', [path.join(ROOT, 'tools/hub/unit_picks_queue.js'), tmp, '--json']).toString(); }catch(e){ out = ''; }
try{ fs.unlinkSync(tmp); }catch(e){}
let q = null; try{ q = JSON.parse(out); }catch(e){}
ok(q && q.rows.length === 2, '5. unit_picks_queue.js reads the picked docs only');
ok(q && q.rows.find(r=> r.unit === some.id).needs.some(n=> n.k === 'create') && !q.rows.find(r=> r.unit === live.id).needs.length, '5. a proposed pick needs creating; a live unit on its own map with skills is ready');

console.log(`unit-themes: ${checks - fail}/${checks} passed`);
process.exit(fail ? 1 : 0);
