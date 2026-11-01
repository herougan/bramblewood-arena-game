#!/usr/bin/env node
// 2026-11-02 (package ENG16): the owner's 11-02 00:17 notes JJ17, JJ18, JJ19, JJ25 and decision WIND-2 (a).
//   WIND-2: a Tailwind Flyer is Quick; a Headwind Flyer swings at -1 Attack; nothing goes off twice; the roll stays 1/3 back, face, calm.
//   JJ17:   Milling turns N of your Lumber into 2N (nothing without Lumber); its price x0.85 (mult 1.54 -> 1.31).
//   JJ19:   Quicksand: at the end of every round from round 2, a unit under N Health (2) sinks and dies; Flyers and Structures don't.
//   JJ18:   every main and side map has a field effect or combination of its own (the Quiet Summit is the one vanilla map); the write-up.
//   JJ25:   Baby cards level 0 -> 1 -> 10; an egg copy asks Hatch or Stay when it arrives and at each level-up; Hatch turns that copy into
//           its creature at the egg's level.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const H = require('./lib/harness.js');
const E = H.Engine, ROOT = H.ROOT, R = f=> fs.readFileSync(path.join(ROOT, f), 'utf8'), J = f=> JSON.parse(R(f));
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id === 1 ? 'A' : 'B';
const defs = Object.assign({}, H.loadCardDefs(), {
  'x-hwfly': {id:'x-hwfly', name:'HwFly', attack:0, health:200, wait:0, cost:0, effects:{flying:true, arrow:1}},
  'x-fly3':  {id:'x-fly3', name:'Fly3', attack:3, health:200, wait:0, cost:0, effects:{flying:true}},
  'x-wall':  {id:'x-wall', name:'Wall', attack:0, health:500, wait:0, cost:0, effects:{}},
  'x-wallw': {id:'x-wallw', name:'WallW', attack:0, health:500, wait:9, cost:0, effects:{}},
  'x-mill':  {id:'x-mill', name:'Mill', attack:0, health:50, wait:0, cost:0, effects:{milling:1}},
  'x-one':   {id:'x-one', name:'One', attack:0, health:1, wait:9, cost:0, effects:{}},
  'x-two':   {id:'x-two', name:'Two', attack:0, health:2, wait:9, cost:0, effects:{}},
  'x-flyone':{id:'x-flyone', name:'FlyOne', attack:0, health:1, wait:9, cost:0, effects:{flying:true}},
  'x-wallone':{id:'x-wallone', name:'Palisade', attack:0, health:1, wait:9, cost:0, archetypes:['Structure'], effects:{}},
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(seed, rules){ const e = E.makeSimEngine(defs, E.mulberry32(seed || 5), {recordEvents:true, battleMode:'open', rules: rules || undefined}); return {e, P:{1: e.newPlayer(1, {}), 2: e.newPlayer(2, {})}}; }
const spawn = (e, P, pid, id, side)=>{ e.debugSpawnCard(P, so, pid, id, side || 'left', {}, []); return all(P[pid]).find(c=> c.defId === id && !c.__t && (c.__t = true)); };
const TXT = require(path.join(ROOT, 'bramblewood-texts.js')).TEXT, app = R('arena_app.js'), eng = R('bramblewood-engine.js');

// ---- WIND-2 ---------------------------------------------------------------------------------------------------------------
function windRound(id, want, wallId){ for(let s = 1; s <= 120; s++){ const {e, P} = mk(s, {wind:'gale'}); const F = spawn(e, P, 1, id); spawn(e, P, 2, wallId || 'x-wall');
    e.roundStart(P, 1, so, {}, []); if(e.windSideOf(1) !== want) continue; const ev = []; e.resolveCombat(P, so, {}, ev, 2); return {e, P, F, ev}; } return null; }
{ const r = windRound('x-hwfly', 'head'); const arrows = r ? r.ev.filter(x=> x.type === 'arrow' && x.uid === r.F.uid).length : -1;
  ok(r && arrows === 1, `WIND-2: a Headwind no longer doubles Arrow (${arrows} arrows)`);
  ok(r && r.ev.some(x=> x.type === 'statusFx' && x.kind === 'headwind' && x.attUid === r.F.uid), 'WIND-2: the Headwind Flyer gets its statusFx headwind (the -1 Attack float)'); }
{ const head = windRound('x-fly3', 'head', 'x-wallw'), tail = windRound('x-fly3', 'tail', 'x-wallw');
  const dmg = r=> { const h = r && r.ev.find(x=> x.type === 'hit' && x.attUid === r.F.uid); return h ? h.dmg : null; };
  ok(dmg(head) === 2, `WIND-2: a 3-Attack Flyer in a Headwind hits for 2 (${dmg(head)})`);
  ok(dmg(tail) === 3, `WIND-2: in a Tailwind it hits for 3 (${dmg(tail)})`);
  ok(tail && tail.ev.some(x=> x.type === 'statusFx' && x.kind === 'tailwind' && x.quick), 'WIND-2: the Tailwind Flyer is Quick (statusFx tailwind, quick)'); }
{ // calm or Ashy: no cut
  let calm = null; for(let s = 1; s <= 120 && !calm; s++){ const {e, P} = mk(s, {wind:'windy'}); const F = spawn(e, P, 1, 'x-fly3'); spawn(e, P, 2, 'x-wallw'); e.roundStart(P, 1, so, {}, []); if(e.isWindy()) continue; const ev = []; e.resolveCombat(P, so, {}, ev, 2); calm = ev.find(x=> x.type === 'hit' && x.attUid === F.uid); }
  ok(calm && calm.dmg === 3, `WIND-2: a calm round, no cut (${calm && calm.dmg})`);
  let ash = null; for(let s = 1; s <= 120 && !ash; s++){ const {e, P} = mk(s, {wind:'gale', ashy:true}); const F = spawn(e, P, 1, 'x-fly3'); spawn(e, P, 2, 'x-wallw'); e.roundStart(P, 1, so, {}, []); if(e.windSideOf(1) !== 'head') continue; const ev = []; e.resolveCombat(P, so, {}, ev, 2); ash = ev.find(x=> x.type === 'hit' && x.attUid === F.uid) || {dmg:'miss'}; }
  ok(ash && (ash.dmg === 3 || ash.dmg === 'miss'), `WIND-2: Ashy grounds the Flyer: no Headwind cut (${ash && ash.dmg})`); }
{ // the odds: Windy is 1/3 back, 1/3 face, 1/3 calm (rollWind); 1500 rounds
  const t = {tail:0, head:0, calm:0}; const {e, P} = mk(77, {wind:'windy'}); spawn(e, P, 1, 'x-wall'); spawn(e, P, 2, 'x-wall');
  for(let r = 1; r <= 1500; r++){ e.roundStart(P, r, so, {}, []); const w = e.windSideOf(1); t[w || 'calm']++; }
  ok(Object.values(t).every(v=> Math.abs(v / 1500 - 1/3) < 0.05), `WIND-2: Windy rolls 1/3 each way or calm (${JSON.stringify(t)})`); }
ok(/function headwindTwice\(card, pid, side, events\)\{ return false; \}/.test(eng) && /- headwindAtkCut\(card\)\)/.test(eng), 'WIND-2: the engine: headwindTwice is off, effAtk takes the Headwind cut');
['ui.fx-windy', 'ui.fxx-windy', 'ui.fx-gale', 'ui.wind-head-wing', 'ui.wind-pill-back', 'ui.wind-pill-face'].forEach(k=>
  ok(TXT[k] && /-1 Attack/.test(TXT[k]) && !/twice/.test(TXT[k]), `WIND-2: ${k} says -1 Attack, not twice`));
ok(!/Headwind/.test(TXT['ui.fxx-quiet-contemplation']), 'WIND-2: Quiet Contemplation no longer lists the Headwind (nothing to stop)');
ok(!/trigger twice/.test(app.slice(app.indexOf('function windPillHTML'), app.indexOf('function windPillHTML') + 1200)) && /wind-atk-cut">−1⚔/.test(app), 'WIND-2: the wind pill and the Headwind wing pip say −1 Attack');

// ---- JJ17: Milling ------------------------------------------------------------------------------------------------------------
function millRound(lum){ const {e, P} = mk(3); spawn(e, P, 1, 'x-mill'); spawn(e, P, 2, 'x-wallw'); P[1].lumber = lum; const ev = []; e.roundStart(P, 1, so, {}, ev); e.resolveCombat(P, so, {}, ev, 1); return {lum: P[1].lumber, ev}; }
{ const a = millRound(0), b = millRound(3), c = millRound(1);
  ok(a.lum === 0, `JJ17: with no Lumber nothing is milled (${a.lum})`);
  ok(b.lum === 4 && c.lum === 2, `JJ17: Milling 1 turns 1 Lumber into 2 (3 -> ${b.lum}, 1 -> ${c.lum})`);
  ok(b.ev.some(x=> x.type === 'lumber' && x.mill === 1 && x.amount === 1), 'JJ17: the lumber event says net +1 (mill 1)'); }
{ const sc = J('canonical/skill-costs.json').shorthands.milling; ok(sc.mult === 1.31 && /0\.85/.test(sc.eng16 || ''), `JJ17: Milling's mult 1.54 x 0.85 = 1.31 (${sc.mult})`); }
ok(/\{n\} of your Lumber becomes \{n2\}/.test(TXT['ui.sk2-milling']) && /n2: 2 \* sk2Num/.test(app), 'JJ17: the skill text: N of your Lumber becomes 2N');

// ---- JJ19: Quicksand ----------------------------------------------------------------------------------------------------------
function qsGame(rules){ const {e, P} = mk(9, Object.assign({quicksand:true}, rules || {})); const U = {one: spawn(e, P, 1, 'x-one', 'left'), two: spawn(e, P, 1, 'x-two', 'right'), fly: spawn(e, P, 2, 'x-flyone', 'left'), pal: spawn(e, P, 2, 'x-wallone', 'right')};
  const ev1 = []; e.roundStart(P, 1, so, {}, ev1); e.resolveCombat(P, so, {}, ev1, 1); const after1 = U.one.hp;
  const ev2 = []; e.roundStart(P, 2, so, {}, ev2); e.resolveCombat(P, so, {}, ev2, 1); return {e, P, U, after1, ev1, ev2}; }
{ const g = qsGame();
  ok(g.after1 === 1 && !g.ev1.some(x=> x.field === 'quicksandSink'), 'JJ19: round 1: nothing sinks (from round 2)');
  ok(!(g.U.one.hp > 0) && g.ev2.some(x=> x.type === 'fieldTick' && x.field === 'quicksandSink' && x.uid === g.U.one.uid) && g.ev2.some(x=> x.type === 'death' && x.uid === g.U.one.uid), 'JJ19: round 2: the 1-Health unit sinks and dies (fieldTick quicksandSink, then its death)');
  ok(g.U.two.hp === 2, 'JJ19: a 2-Health unit stands (under 2 sinks)');
  ok(g.U.fly.hp === 1 && g.U.pal.hp === 1, 'JJ19: a Flyer and a Structure never sink');
  ok(g.ev2.some(x=> x.type === 'fieldTick' && x.field === 'quicksand' && x.n === 2 && x.count === 1), 'JJ19: one quicksand tick names N and the count'); }
{ const g = qsGame({quicksand:3}); ok(!(g.U.two.hp > 0), 'JJ19: Quicksand 3 takes a 2-Health unit too'); }
{ const g = qsGame({quicksand:false}); ok(g.U.one.hp === 1, 'JJ19: off: nothing sinks'); }
ok(/'quicksand' \/\* ENG16 \*\/\]\.filter\(k=> rules\[k\]\)/.test(eng), 'JJ19: a field hazard (Field Breaker pauses it)');
ok(/quicksand:    \{icon:'⏬'/.test(app) && ['ui.fx-name-quicksand', 'ui.fx-quicksand-short', 'ui.fx-quicksand', 'ui.fxx-quicksand', 'ui.qs-log', 'ui.qs-log-sink', 'ui.qs-float', 'ui.qs-pip-tip'].every(k=> TXT[k]), 'JJ19: its Environment card (FIELD2), texts, log, float and pip');
ok(/ev\.field === 'quicksandSink'\)\{ const el = boardCardEl/.test(app) && /\.board-card\.qs-sink \.card-tile\{animation:qsSink/.test(app) && /abadge qs-pip/.test(app), 'JJ19: the sink VFX and the warning pip');
ok(/\['quicksand', \{quicksand:true\}/.test(app), 'JJ19: in the Effects library');

// ---- JJ18 + JJ19's homes: every map a field effect or combination of its own ------------------------------------------------
const G = require(path.join(ROOT, 'tools', 'lib_bramble.js')).G, MAPS = G.CONQUEST_MAPS;
{ const md = MAPS.find(m=> m.id === 'md'), mpd = MAPS.find(m=> m.id === 'mpd');
  ok(md.mapField && md.mapField.quicksand === true, 'JJ19: the Glass Dunes carry Quicksand on every fight');
  const qq = mpd.nodes.find(nd=> nd.key === '18-A-9'); ok(qq && G.fightRules('mpd', qq).quicksand === true, 'JJ19: the Quicksand Queen (18-A-9) fights on Quicksand'); }
const FIELD2 = 'landslide consternation crushingDepths rookRow bishopPath mirage canopy undergrowth tallGrass slippery glassStorm hail lavaSpout leylines1 leylines2 leylines3 haunted sulphurFumes ashRain ashy arrowSlits psychicDampener awash quietContemplation sporeCloud thunderstorm tangledRoots graspingBriars fogOfWar wildfire windfall seasons quicksand'.split(' ');
function keysOf(r){ const k = new Set();
  if(r.volcano || r.lavaTideChance != null || r.petrifyChance != null || r.eruptionChance != null) k.add('volcano'); else if(Number(r.eruption) > 0) k.add('scorched');
  if(r.wind) k.add('wind:' + r.wind); if(r.dark) k.add('dark'); if(r.cloudy) k.add('cloudy'); if(r.misty) k.add('misty'); if(r.phase === 'night') k.add('night');
  if(r.twilight) k.add('twilight'); if(r.permaTide) k.add(r.rapids ? 'rapids' : 'permaTide'); if(r.swampFever) k.add('swampFever'); if(r.freezing) k.add('freezing');
  if(r.tide || r.highTide || r.tideSpout) k.add('tide'); if(r.frostWait || r.frostCount || r.frostbite) k.add('frost'); if(r.field) k.add('field:' + r.field); if(r.firstBlood) k.add('firstBlood');
  FIELD2.forEach(f=>{ if(r[f]) k.add(f); });
  if((r.phase === 'cycle' || r.phase === 'nightFirst') && (Number(r.phaseDay) > 0 || Number(r.phaseNight) > 0) && Number(r.phaseDay) !== Number(r.phaseNight)) k.add('glow');
  return k; }
const fights = m=> m.nodes.filter(nd=> !/tutorial|raidboss/.test(nd.kind || '') && !nd.virtual);
const SKIP = new Set(['mm', 'muc', 'mlb' /* the endless dungeons: owner call CONTENT4-2 */, 'mtut' /* the Tutorial: Map 0's own Mist */]);
const sig = {};
MAPS.forEach(m=>{ const f = fights(m); if(!f.length || SKIP.has(m.id)) return; const sets = f.map(nd=> keysOf(G.fightRules(m.id, nd)));
  const shared = [...sets[0]].filter(k=> sets.every(s=> s.has(k))).sort().join('+'); (sig[shared] = sig[shared] || []).push(m.id); });
const dup = Object.entries(sig).filter(([k, v])=> v.length > 1);
ok(!dup.length, `JJ18: no two maps share a field effect or combination (${dup.map(([k, v])=> k + ': ' + v.join(', ')).join('; ')})`);
ok(JSON.stringify(sig['']) === '["m21"]', `JJ18: the Quiet Summit is the one vanilla map (${JSON.stringify(sig[''])})`);
{ const doc = fs.existsSync(path.join(ROOT, 'docs/balance/field-uniqueness-2026-11-02.md')) ? R('docs/balance/field-uniqueness-2026-11-02.md') : '';
  ['The Old Bramble', 'The Long Grass', 'The Kelp Mangroves', 'Coral Current', 'The Glass Dunes', 'Ashen Spurn', 'The Aerie Vault', 'The Sunken Grove', 'The Canopy', 'Goldfeather Keep', 'Caves & Alcoves', 'The Mycelium Deep'].forEach(nm=>
    ok(doc.includes(nm), `JJ18: the write-up names ${nm}`)); }

// ---- JJ25: Baby cards and the egg's Hatch or Stay ------------------------------------------------------------------------------
ok(/return \(d && d\.kind === 'baby'\) \? 10/.test(app), 'JJ25: playerLevelCap: a Baby card levels to 10 (no Base cap)');
ok(/if\(!isTutorialCopySource\(source\)\)\{ babyCopyLevel0\(id\); eggChoiceForNewCopy\(id\); \}/.test(app), 'JJ25: a new copy: Baby at Level 0, an egg asks');
ok(/if\(c\.level > was\) try\{ queueEggChoice\(id, c\.uid\); \}/.test(app) && /queueEggChoice\(e\.cardId, a\[i\]\.uid\)/.test(app), 'JJ25: a level-up (the Forge, the Nest) asks again');
ok(/\.egg-choice-ov \.egg-choice-bg\{[^}]*animation:eggChoiceShake/.test(app) && /<div class="egg-choice-bg" aria-hidden="true">\$\{tile\}<\/div>/.test(app), 'JJ25: the egg card shakes behind the dialog');
ok(['ui.egg-choice-title', 'ui.egg-choice-body', 'ui.egg-choice-hatch', 'ui.egg-choice-stay', 'ui.egg-choice-random', 'ui.egg-choice-hatched', 'ui.egg-choice-stayed'].every(k=> TXT[k]), 'JJ25: the dialog texts');
{ // run the real functions on a stub collection
  const grab = name=>{ let m = new RegExp(`^(?:async )?function ${name}\\(`, 'm').exec(app); if(m){ let d = 0, i = app.indexOf('{', m.index); for(let j = i; j < app.length; j++){ const ch = app[j]; if(ch === '{') d++; else if(ch === '}'){ d--; if(!d) return app.slice(m.index, j + 1); } } }
    m = new RegExp(`^const ${name} = .*$`, 'm').exec(app); if(m) return m[0]; throw new Error('no ' + name); };
  const cards = Object.fromEntries(J('canonical/cards.json').map(c=> [c.id, c]));
  const store = {}, ctx = {myCardCopies:{}, myUnlockedCardIds:new Set(), myCardLevels:{}, hatch:new Set(), localStorage:{getItem:k=> store[k] || null, setItem:(k, v)=>{ store[k] = String(v); }},
    getCardDefs:()=> cards, copyBaseDef:id=> cards[id], cardSourceOf:d=> d.source || {}, copyModelOn:()=> true, saveCardCopies(){}, saveCardLevels(){}, saveUnlockedCardIds(){}, noteSighted(){}, invalidateCardDefs(){},
    copyLevel:(id, c)=> c.level | 0, syncBestLevel(){}, cardBaseLevel:d=> d && d.kind === 'baby' ? 1 : 1, scheduleEggChoice(){}, Math, JSON, Object, Array, Set};
  ctx.tutorialHatchlingIfAllZero = id=> ctx.hatch.add(id);
  ctx.grantCardCopy = id=>{ (ctx.myCardCopies[id] = ctx.myCardCopies[id] || []).push({uid:'n' + Object.keys(ctx.myCardCopies).length, level:1}); };
  vm.createContext(ctx);
  ['EGG_CHOICE_KEY', 'EGG_CHOICE_RARITY', 'isBabyLevelDef', 'isEggChoiceDef', 'babyCopyLevel0', 'eggChoiceQueue', 'saveEggChoiceQueue', 'queueEggChoice', 'eggHatchPool', 'hatchEggCopy'].forEach(nm=> vm.runInContext(grab(nm).replace(/^const /, 'var '), ctx));
  ctx.myCardCopies['egg-bird'] = [{uid:'e1', level:1}]; ctx.babyCopyLevel0('egg-bird');
  ok(ctx.myCardCopies['egg-bird'][0].level === 0 && ctx.myCardCopies['egg-bird'][0].lv0 === 1, 'JJ25: a new Baby copy comes at Level 0');
  ctx.myCardCopies['redwood-woodpecker'] = [{uid:'w1', level:1}]; ctx.babyCopyLevel0('redwood-woodpecker'); ok(ctx.myCardCopies['redwood-woodpecker'][0].level === 1, 'JJ25: a non-Baby copy keeps its level');
  ok(ctx.queueEggChoice('egg-bird', 'e1') && !ctx.queueEggChoice('redwood-woodpecker', 'w1') && ctx.eggChoiceQueue().length === 1, 'JJ25: an egg copy is queued for Hatch or Stay; a non-egg is not');
  ctx.queueEggChoice('egg-bird', 'e1'); ok(ctx.eggChoiceQueue().length === 1, 'JJ25: asked once per copy and level');
  const birds = ctx.eggHatchPool(cards['egg-bird']);
  ok(birds.length > 3 && birds.every(d=> ((d.species || []).includes('Bird') || (d.archetypes || []).some(a=> ['Bird', 'Hummingbird', 'Owl', 'Eagle', 'Duck', 'Raven'].includes(a))) && ['common', 'uncommon'].includes(d.rarity) && ['map', 'pack'].includes((d.source || {}).kind) && d.kind !== 'baby'), `JJ25: the Speckled Egg hatches Common / Uncommon birds you can own (${birds.length})`);
  ok(ctx.eggHatchPool(cards['egg-red-dragon']).map(d=> d.id).join() === 'red-dragon', 'JJ25: the Red Dragon Egg hatches the Red Dragon');
  ctx.myCardCopies['egg-bird'][0].level = 4; const into = ctx.hatchEggCopy('egg-bird', 'e1', 0);
  const got = into && ctx.myCardCopies[into.id]; ok(into && !ctx.myCardCopies['egg-bird'].length && got && got[got.length - 1].level === 4 && got[got.length - 1].hatchedFrom === 'egg-bird' && ctx.myUnlockedCardIds.has(into.id), `JJ25: Hatch: the egg copy becomes its creature at the egg's level (${into && into.id} Lv ${got && got[got.length - 1].level})`);
  ctx.myCardCopies['egg-bird'] = [{uid:'e2', level:0}]; const into0 = ctx.hatchEggCopy('egg-bird', 'e2', 0.5); const g0 = into0 && ctx.myCardCopies[into0.id];
  ok(into0 && g0[g0.length - 1].level === 0 && g0[g0.length - 1].hatch === 1 && ctx.hatch.has(into0.id), 'JJ25: a Level 0 egg hatches a Level 0 hatchling');
}
{ const dj = J('docs/decisions.json'), by = Object.fromEntries(dj.items.map(x=> [x.id, x]));
  ok(['ENG16-1', 'ENG16-2', 'ENG16-3', 'ENG16-4'].every(id=> by[id] && by[id].status === 'DONE'), 'decisions: ENG16-1 .. 4 recorded');
  ok(/ENG16/.test(R('docs/CHANGELOG.md').slice(0, 4000)), 'the CHANGELOG entry'); }

console.log(`eng16-2026-11-02: ${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);
