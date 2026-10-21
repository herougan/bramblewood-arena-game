#!/usr/bin/env node
// 2026-10-21 (package TX: types, taxonomy and filters). The owner's notes (Oct 21):
//   1. "Specific animals are their greater animal type too. Eagles are birds. They should count so in the game, and in the filters."
//   2. "Aquatic Phyla should be broken up. Fish is its own Phyla." / "Aquatic is the geo type (not phyla). The octopi and etc need
//      their own types like cephalopod or cnidaria."
//   3. "Changelings count for every type."
//   5. "In the filter, Diurnal is the same as Diurnal {}. Same for swimmer and the rest."
//   6. "In the skill filters, add additional aggregate filter like lumber-related, stone-related, metal-related, damage-related ..."
//   7. "Meadow Frog's Tide should be ? until Map 2+. Diurnal, if seen in Map 0 (not Tutorials), should be ?."
// Covers: the hierarchy (bramblewood-taxonomy.js is what tools/type_taxonomy.py writes; eagle -> Raptor -> Bird; the habitats), the
// re-tagged species, the engine's type checks through it (Kin, Kinship, Swarm, a trigger's type filter, Defiance, egg pools) and the
// Changelings in each; the app side (the filter's families and groups, the reveal map), run on the real arena_app.js code.
// The browser side (the Codex and the three deck editors at 390 and 1366) is tests/e2e/tx_2026_10_21.py.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), cp = require('child_process');
const ROOT = path.join(__dirname, '..');
const H = require('./lib/harness.js');
const E = H.Engine;
const T = require(path.join(ROOT, 'bramblewood-taxonomy.js'));
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';

// ---- 1. the hierarchy
{ let fresh = true; try{ cp.execFileSync('python3', [path.join(ROOT, 'tools/type_taxonomy.py'), '--check'], {stdio: 'pipe'}); }catch(e){ fresh = false; }
  ok(fresh, '1. bramblewood-taxonomy.js is what python3 tools/type_taxonomy.py writes (from canonical/animal-tags.json)'); }
const anc = t=> [...T.ancestors(t)];
ok(JSON.stringify(anc('eagle')) === '["eagle","raptor","bird"]', `1. eagle -> Raptor -> Bird (${anc('eagle')})`);
ok(T.ancestors('golden eagle').size === 1 || T.ancestors('golden eagle').has('bird'), '1. an unknown animal is just itself');
ok(T.ancestors('blue-ringed octopus').has('cephalopod') && T.ancestors('Cephalopod').has('mollusc') && T.ancestors('Cephalopod').has('aquatic'), '1. an octopus is a Cephalopod, a Mollusc, Aquatic');
ok(T.ancestors('Coral Reef').has('ocean') && T.ancestors('Ocean').has('aquatic') && T.ancestors('River').has('aquatic') && !T.ancestors('Swamp').has('aquatic'), '1. habitats: Coral Reef -> Ocean -> Aquatic; River -> Aquatic; Swamp is not');
ok(T.ancestors('otter').has('mustelid') && T.ancestors('Mustelid').has('mammal') && T.ancestors('wolf spider').has('arachnid') && T.ancestors('Ants').has('insect'), '1. otter -> Mustelid -> Mammal; wolf spider -> Arachnid; Ants -> ant -> Insect');
ok(T.isHabitat('Aquatic') && T.phylumOf('Fish') === 'Fish' && T.phylumOf('Cephalopod') === 'Cephalopod' && T.phylumOf('Cnidaria') === 'Cnidaria' && T.phylumOf('Mollusc') === 'Crawler' && !Object.values(T.SPECIES_PHYLUM).includes('Aquatic'), '2. Aquatic is a habitat, not a phylum; Fish, Cephalopod, Cnidaria are phyla; snails stay Crawlers');
ok(T.phylumOf('Cnidarian') === 'Cnidaria' && T.isA({species:['Cnidarian']}, 'Cnidaria'), '2. an old Cnidarian (a saved card) reads as Cnidaria');
// isA and shares
const eagle = {archetypes:['Mountain'], species:['Bird'], animal:'eagle'}, owl = {archetypes:['Forest'], species:['Bird'], animal:'owl'}, birdy = {archetypes:['Bird', 'Savanna'], species:['Bird'], animal:'lovebird'};
ok(T.isA(eagle, 'Bird') && T.isA(eagle, 'Raptor') && T.isA(eagle, 'Eagle') && !T.isA(eagle, 'Owl') && !T.isA(eagle, 'Mammal'), '1. an eagle counts as Eagle, Raptor and Bird (not Owl, not Mammal)');
ok(T.shares(birdy, eagle) && T.shares(eagle, birdy), '1. a Bird-typed card and an eagle share a Type (both ways)');
ok(!T.shares(eagle, owl), '1. two birds that list no Bird (an eagle and an owl) do not: Kin does not swallow a whole class');
ok(T.shares({archetypes:['Otter']}, {archetypes:['River'], animal:'otter'}), '1. an Otter-typed card and an otter by animal share');

// ---- 2. the re-tagged species (canonical/cards.json)
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/cards.json'), 'utf8')), tags = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/animal-tags.json'), 'utf8'));
const grp = {}; tags.cards.forEach(r=> grp[r.id] = r.group);
ok(!cards.some(c=> (c.species||[]).some(s=> s === 'Cnidarian' || s === 'Feline')), '2. no card left on Cnidarian or Feline');
ok(cards.filter(c=> ['octopus', 'squid', 'nautilus', 'cuttlefish'].includes(grp[c.id])).every(c=> (c.species||[]).includes('Cephalopod')), '2. octopus, squid, nautilus, cuttlefish -> Cephalopod');
ok(cards.filter(c=> ['jellyfish', 'coral', 'anemone'].includes(grp[c.id])).every(c=> (c.species||[]).includes('Cnidaria')), '2. jellyfish, coral, anemone -> Cnidaria');
ok(cards.filter(c=> ['fish', 'shark', 'ray', 'eel', 'catfish', 'hagfish', 'lamprey'].includes(grp[c.id]) && !c.subtype).every(c=> (c.species||[]).includes('Fish')), '2. every fish (the moray too) is species Fish');
ok(cards.filter(c=> (c.species||[]).some(s=> ['Fish', 'Cephalopod', 'Cnidaria'].includes(s))).every(c=> T.isA(c, 'Aquatic')), '2. they all keep an Aquatic habitat (through the hierarchy)');
ok(cards.every(c=> (c.species||[]).every(s=> T.NAMES[T.key(s)])), '2. every species on a card is a taxonomy node');

// ---- 3. the engine
const U = (id, types, effects, o)=> Object.assign({id, name:id, attack:0, health:20, wait:0, cost:0, archetypes:types, effects: effects || {}}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'tx-bird':   U('tx-bird', ['Bird'], {}, {species:['Bird']}),
  'tx-eagle':  U('tx-eagle', ['Mountain'], {}, {species:['Bird'], animal:'eagle'}),
  'tx-owl':    U('tx-owl', ['Forest'], {}, {species:['Bird'], animal:'owl'}),
  'tx-otter':  U('tx-otter', ['River'], {}, {species:['Mustelid'], animal:'otter'}),
  'tx-mimic':  U('tx-mimic', [], {changeling:true}, {species:[], subtype:'changeling'}),
  'tx-buff':   U('tx-buff', ['Bird'], {triggers:[{on:'onRoundStart', do:'poison', who:'kin', sub:'all', amount:2}]}),
  'tx-ebuff':  U('tx-ebuff', ['Mountain'], {triggers:[{on:'onRoundStart', do:'poison', who:'kin', sub:'all', amount:2}]}, {animal:'eagle'}),
  'tx-kinship':U('tx-kinship', ['Forest'], {kinship:{type:'Bird', atk:2, hp:1}}),
  'tx-swarm':  U('tx-swarm', ['Bird'], {swarm:true}),
  'tx-swarmT': U('tx-swarmT', ['Forest'], {swarm:['Raptor']}),
  'tx-defy':   U('tx-defy', ['Forest'], {defiance:['Bird']}),
  'tx-watch':  U('tx-watch', ['Forest'], {triggers:[{on:'onAllyPlayed', filterArchetype:'Bird', do:'buff', who:'self', amount:1}]}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(seed){ const e = E.makeSimEngine(defs, E.mulberry32(seed||7), {recordEvents:true}); return {e, P:{1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})}}; }
function put(e, P, pid, id, lane){ e.debugSpawnCard(P, so, pid, id, lane || 'left', {}, []); return all(P[pid]).filter(x=> x.defId === id).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); }
const fire = (e, P, c)=> e.debugFireTrigger(P, so, c.uid, 'onRoundStart', {}, []);
// Kin
{ const {e, P} = mk(); const S = put(e, P, 1, 'tx-buff'); const A = put(e, P, 1, 'tx-eagle', 'right'), B = put(e, P, 1, 'tx-otter'), M = put(e, P, 1, 'tx-mimic', 'right'); fire(e, P, S);
  ok(A.poison === 2 && !B.poison && M.poison === 2, `3. Kin: a Bird-typed unit's "all your Kin" reaches the eagle and the Changeling, not the otter (${A.poison}, ${B.poison}, ${M.poison})`); }
{ const {e, P} = mk(); const S = put(e, P, 1, 'tx-ebuff'); const A = put(e, P, 1, 'tx-bird', 'right'), O = put(e, P, 1, 'tx-owl'); fire(e, P, S);
  ok(A.poison === 2 && !O.poison, `3. Kin both ways: the eagle's Kin is the Bird-typed unit, not the owl (${A.poison}, ${O.poison})`); }
// Kinship Bird (+2/+1 to each of your Birds): the eagle and the Changeling get it, the otter not
{ const {e, P} = mk(); put(e, P, 1, 'tx-kinship'); const A = put(e, P, 1, 'tx-eagle', 'right'), B = put(e, P, 1, 'tx-otter'), M = put(e, P, 1, 'tx-mimic', 'right');
  e.resolveCombat(P, so, {}, [], 1);
  ok(A.kinBonus === 2 && !B.kinBonus && M.kinBonus === 2, `3. Kinship Bird lifts the eagle and the Changeling, not the otter (${A.kinBonus}, ${B.kinBonus}, ${M.kinBonus})`); }
// Swarm
{ const {e, P} = mk(); const S = put(e, P, 1, 'tx-swarm'); put(e, P, 1, 'tx-eagle', 'right'); put(e, P, 1, 'tx-otter'); put(e, P, 1, 'tx-mimic', 'right');
  ok(e.swarmBonusOf(P, S) === 2, `3. Swarm (shares a type): the eagle and the Changeling count, the otter not (${e.swarmBonusOf(P, S)})`); }
{ const {e, P} = mk(); const S = put(e, P, 1, 'tx-swarmT'); put(e, P, 1, 'tx-eagle', 'right'); put(e, P, 1, 'tx-owl'); put(e, P, 1, 'tx-bird', 'right');
  ok(e.swarmBonusOf(P, S) === 2, `3. Swarm Raptor: the eagle and the owl count (raptors by animal), the plain Bird not (${e.swarmBonusOf(P, S)})`); }
// a trigger's type filter (On Ally Spawn, Bird only)
{ const {e, P} = mk(); const W = put(e, P, 1, 'tx-watch'); put(e, P, 1, 'tx-eagle', 'right'); const a1 = W.atk; put(e, P, 1, 'tx-otter'); const a2 = W.atk; put(e, P, 1, 'tx-mimic', 'right'); const a3 = W.atk;
  ok(a1 === 1 && a2 === 1 && a3 === 2, `3. a Bird type filter fires for the eagle and the Changeling, not the otter (${a1}, ${a2}, ${a3})`); }
// egg pools: the bird egg hatches any bird; a Cephalopod passes a Mollusc egg
{ const {e} = mk(); const pool = e.eggPoolFor({rarity:'common', hatchInto:{species:['Mollusc']}});
  ok(pool.some(d=> (d.species||[]).includes('Cephalopod')), `3. an egg of Molluscs can hatch a Cephalopod (${pool.length} in the pool)`); }
// the fallback rule without the taxonomy is the old one (a bare copy of the engine)
{ const src = fs.readFileSync(path.join(ROOT, 'bramblewood-engine.js'), 'utf8'), ctx = {console, module: {exports: {}}};
  vm.createContext(ctx); vm.runInContext(src + '\n;this.__tx = {txIsA, txShares, TAXONOMY};', ctx);
  const F = ctx.__tx; ok(F.TAXONOMY === null && F.txIsA({archetypes:['Bird']}, 'Bird') && !F.txIsA(eagle, 'Raptor') && F.txIsA({effects:{changeling:true}}, 'Anything') && F.txShares({archetypes:['Bird']}, {archetypes:['Bird']}), '3. without the taxonomy the engine falls back to the old rule (and a Changeling still matches)'); }
// ---- 3b. Changelings: every type, every check
const mimic = {archetypes:[], effects:{changeling:true}, subtype:'changeling'};
ok(T.isA(mimic, 'Bird') && T.isA(mimic, 'Aquatic') && T.isA(mimic, 'Kinfolk') && T.shares(mimic, eagle) && T.shares(owl, mimic), '3. a Changeling is every type and shares with everyone');
ok(T.isA({archetypes:[], subtype:'changeling'}, 'Wolf'), '3. ...by its subtype too');
// the old changeling special cases now come from the one rule
{ const src = fs.readFileSync(path.join(ROOT, 'bramblewood-engine.js'), 'utf8');
  ok(!/subjArchetypes/.test(src) && /if\(!txIsA\(subjDef, t\.filterArchetype\)\) return;/.test(src), '3. the trigger type filter asks the taxonomy');
  ok(/function sharesType\(a, b\)\{[^\n]*return txShares\(da, db\); \}/.test(src), '3. Kin (sharesType) asks the taxonomy');
  ok(/if\(txIsA\(d, t\)\)\{ a \+= kin\[t\]\[0\]/.test(src), '3. Kinship asks the taxonomy');
  ok(/picked \? txIsAny\(d, picked\) : txShares\(def, d\)/.test(src), '3. Swarm asks the taxonomy'); }

// ---- 5-7. the app side, on the real arena_app.js
const app = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
function fnSrc(name){ const a = app.indexOf('\nfunction ' + name + '('); if(a < 0) return ''; let i = app.indexOf('{', a), d = 0; for(; i < app.length; i++){ const ch = app[i]; if(ch === '{') d++; else if(ch === '}'){ d--; if(!d) break; } } return app.slice(a + 1, i + 1); }
const a0 = app.indexOf('/* ---- Package TX (2026-10-21): types, taxonomy and filters [TX_FILTERS_BEGIN]'), a1 = app.indexOf('/* [TX_FILTERS_END] */');
ok(a0 > 0 && a1 > a0, '5. the TX filter block is marked');
const block = app.slice(a0, a1);
// a skill registry like the game's: Diurnal and Diurnal {…}, Tide and Tide {…}, Bloom and Bloom (when), two "Siege" rows, Lumber skills
const PASSIVE_DEFS = [
  {key:'diurnal', label:'Diurnal', kind:'twoNumber', desc:v=> 'By day: gain +1/+0.'}, {key:'diurnalGrant', label:'Diurnal', kind:'grant', desc:v=> 'By day it has evasive.'},
  {key:'tide', label:'Tide', kind:'boolean', desc:()=> 'Flood: +1 Attack.'}, {key:'tideGrant', label:'Tide', kind:'grant2', desc:()=> 'On Flood it has armor.'},
  {key:'swimmer', label:'Swimmer', kind:'select', desc:()=> 'On Tide, +1 Attack.'}, {key:'swimmerGrant', label:'Swimmer Skills', kind:'text', desc:()=> 'On a Flood round it gains armor.'},
  {key:'bloom', label:'Bloom', kind:'number', desc:v=> `Heals ${v} HP to a random damaged ally.`}, {key:'bloomWhen', label:'Bloom When', kind:'text', desc:()=> 'While Tide and Night: +2/+2.'},
  {key:'demolisher', label:'Siege', kind:'number', desc:v=> `Deals ${v} more damage to brambles.`}, {key:'siege', label:'Siege', kind:'number', desc:v=> `Deals ${v} bonus damage to Structures.`},
  {key:'lumberjack', label:'Lumberjack', kind:'number', desc:v=> `Gain ${v} Lumber when it kills.`}, {key:'armor', label:'Armor', kind:'number', desc:v=> `Takes ${v} less damage from every hit.`},
  {key:'poison', label:'Poison', kind:'number', desc:v=> `Every landed attack adds ${v} Poison.`}, {key:'packLeader', label:'Pack Leader', kind:'boolean', desc:()=> 'Leads.'}, {key:'pack', label:'Pack', kind:'number', desc:()=> 'Chains.'},
];
const SKILL_DEFS = PASSIVE_DEFS.map(p=> Object.assign({get: e=> e[p.key]}, p)).concat([{key:'explode', label:'Explode', kind:'twoNumber', desc:()=> 'A lit fuse: deals Damage once.', get: e=> e.explode}]);
const ACTION_DEFS = [{key:'damage', label:'Deal damage', desc:'Deal damage to a target.'}, {key:'heal', label:'Heal', desc:'Heal a target.'}, {key:'spawnCard', label:'Spawn', desc:'Spawn a card.'}, {key:'gain', label:'Gain', desc:'Gain a resource.'}];
const ctx = {console, Object, Array, Set, Map, WeakMap, String, Number, JSON, RegExp, Math, PASSIVE_DEFS, SKILL_DEFS, ACTION_DEFS, TAXO: T, ANIMAL_GROUPS: {}, adminModeEnabled: false,
  TX: k=> k, escapeHtml: s=> String(s), escapeAttr: s=> String(s), skillText: (p, v, e)=> p.desc(v), SKILL_ICON: {}, archetypesOf: d=> d.archetypes || [],
  cardHasSkill: (d, k)=> { const p = SKILL_DEFS.find(x=> x.key === k); const e = (d && d.effects) || {}; return p && p.get ? p.get(e) !== undefined && p.get(e) !== false : e[k] != null; },
  codexSkillName: k=> (PASSIVE_DEFS.find(p=> p.key === k) || {}).label || k, uiSticky: ()=> ({}), uiStickySave: ()=>{}, maskHiddenSkills: d=> d, easterEggMasked: ()=> false,
  RARITY_TIER_BANDS: ['common', 'rare'], getCardDefs: ()=> ({})};
vm.createContext(ctx);
vm.runInContext(block + '\n;this.R = {skillFamilyId, skillFamilyKeys, skillAggregateMembers, cardInSkillAggregate, cardMatchesSkillPick, SKILL_AGGREGATES, taxIsA, cfSortFn, cfMatch, cfDefaults};', ctx);
const R = ctx.R;
// 5. families
ok(R.skillFamilyId('diurnalGrant') === 'diurnal' && R.skillFamilyId('tideGrant') === 'tide' && R.skillFamilyId('swimmerGrant') === 'swimmer' && R.skillFamilyId('bloomWhen') === 'bloom', '5. Diurnal {…}, Tide {…}, Swimmer Skills and Bloom (when) are one choice with their bare form');
ok(R.skillFamilyId('siege') === 'demolisher' && JSON.stringify(R.skillFamilyKeys('siege').sort()) === '["demolisher","siege"]', '5. two skills with one name (Siege) are one choice');
ok(R.skillFamilyId('packLeader') === 'packLeader' && R.skillFamilyId('poison') === 'poison', '5. a different skill that only starts the same (Pack Leader) stays its own');
ok(R.cardMatchesSkillPick({effects:{diurnalGrant:{evasive:true}}}, 'diurnal') && R.cardMatchesSkillPick({effects:{diurnal:1}}, 'diurnal') && !R.cardMatchesSkillPick({effects:{tide:true}}, 'diurnal'), '5. the Diurnal choice finds both forms');
ok(/skillFamilyId\(e\.key\)/.test(fnSrc('codexSkillChoices')) && /seen\.has\(e\.key\)/.test(fnSrc('codexSkillChoices')), '5. the Codex picker lists one chip per family');
// 6. groups
const ids = R.SKILL_AGGREGATES.map(a=> a.id);
ok(['lumber', 'stone', 'metal', 'damage', 'heal', 'status', 'movement', 'summon', 'defense', 'daynight'].every(k=> ids.includes(k)), `6. the groups (${ids.join(', ')})`);
const M = R.skillAggregateMembers();
ok(M.lumber.skills.has('lumberjack') && !M.lumber.skills.has('armor'), '6. Lumber: built from the registry text (Lumberjack in, Armor out)');
ok(M.defense.skills.has('armor') && M.status.skills.has('poison') && M.daynight.skills.has('diurnal') && M.daynight.skills.has('diurnalGrant') && M.heal.skills.has('bloom'), '6. Defense has Armor, Status Poison, Day / Night both Diurnals, Heal Bloom');
ok(M.damage.actions.has('damage') && M.heal.actions.has('heal') && M.summon.actions.has('spawnCard') && !M.heal.actions.has('damage'), '6. the trigger actions sort into the groups too');
ok(R.cardInSkillAggregate({effects:{triggers:[{on:'onKill', do:'gain', resource:'lumber', amount:1}]}}, 'lumber') && !R.cardInSkillAggregate({effects:{triggers:[{on:'onKill', do:'gain', resource:'grace', amount:1}]}}, 'lumber'), '6. a Gain trigger counts for the group of the resource it gains');
ok(R.cardMatchesSkillPick({effects:{armor:2}}, 'agg:defense') && !R.cardMatchesSkillPick({effects:{armor:2}}, 'agg:lumber'), '6. a group pick filters');
// the bar: types through the taxonomy, sorts both ways
ok(R.cfMatch(eagle, Object.assign(R.cfDefaults(), {archetype:'Bird'})) && !R.cfMatch({archetypes:['River'], animal:'otter'}, Object.assign(R.cfDefaults(), {archetype:'Bird'})), '4. the bar\'s type filter: an eagle passes Bird, an otter not');
{ const d = {a:{name:'A', attack:5, cost:1}, b:{name:'B', attack:1, cost:2}, c:{name:'C', attack:3, cost:3}};
  const hi = ['a', 'b', 'c'].sort(R.cfSortFn('attack', 'desc', d)).join(''), lo = ['a', 'b', 'c'].sort(R.cfSortFn('attack', 'asc', d)).join('');
  ok(hi === 'acb' && lo === 'bca', `4. Attack high to low (${hi}) and low to high (${lo})`); }
for(const f of ['cfBarHTML', 'skillPickerChipsHTML']){ const s = fnSrc(f); ok(s && !/>[A-Za-z][a-z]+ [a-z]+</.test(s), `4. ${f}: no inline English (TX keys)`); }
ok(/cfBarHTML\(deckCfState, 'dk', defs\)/.test(app) && /cfBarHTML\(cf, 'dbp'\)/.test(app) && /cfBarHTML\(cf, 'sg', defs\)/.test(app), '4. the bar is in the deck editor (Play / Camp), the skirmish deck popup and the skirmish gallery');

// 7. the reveal map
{ const a = app.indexOf('[SKILL_REVEAL_BEGIN]'), b = app.indexOf('/* [SKILL_REVEAL_END] */'); const blk = app.slice(app.lastIndexOf('/*', a), b);
  const store = {}; let completed = [];
  const MAPNUM = {m1:0, mtut:0, mf:1, mb:2};
  const c2 = {localStorage: {getItem: k=> (k in store ? store[k] : null), setItem: (k, v)=>{ store[k] = String(v); }}, loadConquestProgress: ()=> ({completed}), mapNumberOf: id=> (id in MAPNUM ? MAPNUM[id] : null),
    escapeAttr: s=> String(s), adminModeEnabled: false, matchState: null, Date, JSON, Number, Object, Array, Set, String};
  vm.createContext(c2);
  vm.runInContext(blk + '\n;this.R = {SKILL_REVEAL, SKILL_REVEAL_MAP, SKILL_REVEAL_PARTS, skillHiddenNow, maskHiddenSkills, noteMapEnteredForReveal, reset: ()=>{ skillRevealMemo = null; }};', c2);
  const V = c2.R;
  ok(V.SKILL_REVEAL_MAP.tide.from === 2 && V.SKILL_REVEAL_MAP.diurnal.from === 1 && V.SKILL_REVEAL_MAP.diurnal.tutorials === true && JSON.stringify(V.SKILL_REVEAL_PARTS.tide) === '["tideGrant"]', '7. the reveal map: Tide from Map 2; Diurnal from Map 1, shown in the tutorials');
  const frog = {id:'meadow-frog', effects:{tide:true}}, lark = {id:'lark', effects:{diurnal:1, diurnalHp:1}};
  V.noteMapEnteredForReveal('m1'); V.reset();
  ok(V.skillHiddenNow('diurnal') && V.maskHiddenSkills(lark)._hiddenSkills === 1, '7. Diurnal on Map 0 (a road fight): "?"');
  c2.matchState = {mode:'tutorial'}; V.reset();
  ok(!V.skillHiddenNow('diurnal') && V.maskHiddenSkills(lark) === lark && V.skillHiddenNow('tide'), '7. ...in a tutorial fight it reads as Diurnal (Tide stays "?")');
  c2.matchState = null; V.reset();
  ok(V.skillHiddenNow('diurnal') && !JSON.parse(store.bramblewood_skill_revealed_v1 || '{"keys":[]}').keys.includes('diurnal'), '7. ...and the tutorial sight is not remembered');
  V.noteMapEnteredForReveal('mf'); V.reset();
  ok(!V.skillHiddenNow('diurnal') && V.skillHiddenNow('tide') && V.maskHiddenSkills(frog)._hiddenSkills === 1, '7. Map 1: Diurnal shows; the Meadow Frog\'s Tide is still "?"');
  V.noteMapEnteredForReveal('mb'); V.reset();
  ok(!V.skillHiddenNow('tide') && V.maskHiddenSkills(frog) === frog, '7. Map 2+: Tide shows'); }

console.log(`tx-2026-10-21: ${n - fail}/${n} passed, ${fail} failure(s)`);
process.exit(fail ? 1 : 0);
