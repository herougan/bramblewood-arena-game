#!/usr/bin/env node
// 2026-10-15 (evening list), rules:
//   3. "Guardian: should break on death."
//   6. Illuminate (Lantern's new name): "lights up in darkness. Removes darkness debuff for all allies."; leaders and Light Aura units glow.
//  14. "Quick and Swift is the same right now. Remove Swift from all enemies."
//  18. A full moon in play is exposed (isFullMoon, the fullMoonRise event) for the howl.
//  22. "Pounce always prefers hitting the card directly opposing. Otherwise, next nearest."
//  26. "Bounty and Worthy should be fused. Just Bounty."
//  43. "if something can miss, it can miss when cleaving, forking, pitchforking, etc."
//  47. "Sudden death: (20) - all units kill on hit (at least 1 dmg). Sudden death: (25) - any damage on the castle, destroys the castle."
//  52. "Darksight explanation is TOO complicated."
//  53. "Units not ready can be poisoned. Structures are immune to poison."
//  55. Nursing mastery in the Nest, and the Nursing N skill.
//  23. New field effects: Swamp Fever, Freezing, Sandstorm, River Rapids (+ Scorching II in the editor).
//  56. Hidden skirmishes.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:3, health:500, wait:0, cost:0, effects: effects || {}}, o || {});
const base = H.loadCardDefs();
const defs = Object.assign({}, base, {
  'kr-wall': U('kr-wall', {}, {attack:0}), 'kr-hit': U('kr-hit'), 'kr-evade': U('kr-evade', {evasive:true}, {attack:0}),
  'kr-guard': U('kr-guard', {guardian:true}, {attack:0, health:3}),
  'kr-lamp': U('kr-lamp', {illuminate:true}, {attack:0}), 'kr-oldlamp': U('kr-oldlamp', {lantern:true}, {attack:0}),
  'kr-pounce': U('kr-pounce', {pounce:2}, {attack:0, wait:3}),
  'kr-bounty': U('kr-bounty', {bounty:2}, {attack:0, health:5}), 'kr-worthy': U('kr-worthy', {worthy:3}, {attack:0, health:5}),
  'kr-cleave': U('kr-cleave', {sweep:2}), 'kr-fork': U('kr-fork', {fork:true}), 'kr-octo': U('kr-octo', {octolash:true}),
  'kr-armor': U('kr-armor', {armor:10}, {attack:0}), 'kr-immune': U('kr-immune', {ghost:true}, {attack:0}),
  'kr-psn': U('kr-psn', {poison:2}), 'kr-wait': U('kr-wait', {}, {attack:0, wait:3}), 'kr-struct': U('kr-struct', {}, {attack:0, archetypes:['Structure']}),
  'kr-nurse': U('kr-nurse', {nursing:3}, {attack:0}), 'kr-dry': U('kr-dry', {dry:true}), 'kr-cold': U('kr-cold', {resist:['cold']}, {attack:0}),
  'kr-tide': U('kr-tide', {tide:true}, {attack:0}), 'kr-moon': U('kr-moon', {fullMoon:2}, {attack:0}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(rules, seed, o){ const e = E.makeSimEngine(defs, E.mulberry32(seed||7), Object.assign({recordEvents:true, battleMode:'open', rules: rules || undefined}, o||{})); return {e, P:{1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})}}; }
function put(e, P, pid, id, slot, ev){ const pl = P[pid]; e.debugSpawnCard(P, so, pid, id, 'left', {}, ev || []);
  const c = all(pl).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot;
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncSlots(pl); return c; }
const src = fs.readFileSync(path.join(__dirname, '..', 'arena_app.js'), 'utf8');
const eng = fs.readFileSync(path.join(__dirname, '..', 'bramblewood-engine.js'), 'utf8');
const tpl = fs.readFileSync(path.join(__dirname, '..', 'arena_template.html'), 'utf8');
const cards = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'canonical', 'cards.json'), 'utf8'));

// ---- 3. Guardian: a dead Guardian protects no one
{ const {e, P} = mk(); const G = put(e, P, 2, 'kr-guard', -1), X = put(e, P, 2, 'kr-wall', 0), A = put(e, P, 1, 'kr-hit', 0); A.atk = 5;
  e.debugAttack(P, so, A.uid, {}, []); ok(G.hp <= 0 && X.hp === 500, `3. the Guardian takes the hit meant for its neighbour and falls (${G.hp}, ${X.hp})`);
  e.debugAttack(P, so, A.uid, {}, []); ok(X.hp === 495, `3. once it has fallen, the next hit lands on the neighbour (${X.hp})`); }
{ const {e, P} = mk(); const G = put(e, P, 2, 'kr-guard', -1), X = put(e, P, 2, 'kr-wall', 0), A = put(e, P, 1, 'kr-hit', 0); G.hp = 0; // dead but not yet cleared away
  e.debugAttack(P, so, A.uid, {}, []); ok(X.hp === 497, `3. a Guardian at 0 Health (not yet removed) doesn't step in (${X.hp})`); }

// ---- 6. Illuminate
{ const miss = (rules, lampId)=>{ const {e, P} = mk(rules); const A = put(e, P, 1, 'kr-hit', 0); if(lampId) put(e, P, 1, lampId, 1); e.roundStart(P, 2, so, {}, []); return e.sightMiss(A, 1); };
  ok(miss({dark:'absolute'}) === 1 && miss({dark:'absolute'}, 'kr-lamp') === 0, '6. Illuminate lights Absolute darkness: no misses');
  ok(miss({dark:'pitch'}, 'kr-lamp') === 0 && miss({dark:'dark'}, 'kr-lamp') === 0, '6. ...and Pitch Black and Darkness');
  ok(miss({dark:'absolute'}, 'kr-oldlamp') === 0, '6. an old Lantern reads as Illuminate'); }
{ const lamps = cards.filter(c=> (c.effects||{}).illuminate).map(c=> c.id).sort().join(',');
  // 2026-10-21 (package TT): + the Nyoogle (package EE's Easter egg, its lantern) and the Sulfur Cinder Moth (the owner's live edit of
  // 2026-10-16, folded into cards.json by BF4: docs/balance/server-overrides-fold-2026-10-19.md)
  ok(lamps === 'lantern-bearer,lantern-spark-fly,nyoogle,otter-lantern-bearer,sulfur-cinder-moth', `6. the three lantern cards, the Nyoogle and the Sulfur Cinder Moth carry Illuminate (${lamps})`);
  ok(!cards.some(c=> (c.effects||{}).lantern), '6. no card still carries Lantern'); }
ok(/\{key:'illuminate', category:'passive', label:'Illuminate', kind:'boolean',/.test(src) && /\{key:'lantern', category:'passive', hidden:true, retired:true,/.test(src), '6. Illuminate in the editor; Lantern retired');
ok(/function unitLightKindOf\(c, d\)/.test(src) && /Number\(e\.immolation\) > 0\) return 'fire'/.test(src) && /\.board-card \.unit-light\.ul-leader\{/.test(tpl) && /\.battlefield\.is-dark-scene \.board-card \.unit-light\{opacity:1;\}/.test(tpl), '6. leaders and Light Aura units glow at night and in the dark');
ok(/mask-image:var\(--unit-lights, none\)/.test(tpl) && /function syncUnitLightPools\(\)/.test(src), '6. ...and open the darkness overlay in Pitch Black / Absolute');

// ---- 14. Swift
{ const sw = cards.filter(c=> (c.effects||{}).swift).map(c=> c.id); ok(!sw.length, `14. no card carries Swift (${sw})`);
  ok(cards.find(c=> c.id === 'dune-jackal').effects.quick === true, '14. Dune Jackal keeps Quick'); }

// ---- 18. Full moon
{ const {e, P} = mk({phase:'night', field:'moon'}); const ev = []; put(e, P, 1, 'kr-moon', 0, ev); e.syncPhaseStats(P, so, ev);
  ok(e.isFullMoon() === true, '18. isFullMoon() under the Full Moon field');
  ok(ev.filter(x=> x.type === 'fullMoonRise').length === 1, `18. fullMoonRise is reported once (${ev.filter(x=> x.type === 'fullMoonRise').length})`); }
{ const {e} = mk({phase:'day'}); ok(e.isFullMoon() === false, '18. no full moon by day'); }

// ---- 22. Pounce: the unit opposite, else the nearest
for(let s = 1; s <= 8; s++){ const {e, P} = mk(null, s); const ws = [-1, 0, 1].map(sl=> put(e, P, 2, 'kr-wall', sl)); put(e, P, 1, 'kr-pounce', 0); // it lands in the middle slot
  ok(ws[1].hp === 498 && ws[0].hp === 500 && ws[2].hp === 500, `22. Pounce hits the unit directly opposite (seed ${s}: ${ws.map(c=> c.hp)})`); }
for(let s = 1; s <= 8; s++){ const {e, P} = mk(null, s); const far = put(e, P, 2, 'kr-wall', -2), near = put(e, P, 2, 'kr-wall', 1); put(e, P, 1, 'kr-pounce', 0);
  ok(near.hp === 498 && far.hp === 500, `22. nothing opposite: the nearest (seed ${s}: near ${near.hp}, far ${far.hp})`); }

// ---- 26. Bounty (Worthy folded in)
{ const {e, P} = mk(); const l0 = P[1].lumber; const B = put(e, P, 1, 'kr-bounty', 0); ok(P[1].lumber - l0 === 2, `26. Bounty 2: its owner gains 2 Lumber on play (${P[1].lumber - l0})`);
  const f0 = P[2].lumber; B.hp = 0; e.removeDeadCards(P, so, {}, {}, []); ok(P[2].lumber - f0 === 2 && P[1].lumber - l0 === 2, `26. ...and the opponent gains 2 when it dies (${P[2].lumber - f0})`); }
// 2026-10-16 (user: "All Worthy cards become Bounty. Worthy will seem something else in the future."): the engine no longer reads
// `worthy` as Bounty (the app migrates old saves as they load, tests/keywords-2026-10-16b.js); the key is an empty slot.
{ const {e, P} = mk(); const l0 = P[1].lumber; const W = put(e, P, 1, 'kr-worthy', 0); const A = put(e, P, 2, 'kr-hit', 0); A.atk = 9; const f0 = P[2].lumber;
  ok(P[1].lumber === l0, `26. a raw Worthy 3 pays nothing on play any more (${P[1].lumber - l0})`); e.debugAttack(P, so, A.uid, {}, []); e.removeDeadCards(P, so, {}, {}, []); ok(W.hp <= 0 && P[2].lumber === f0, `26. ...nor on death (${P[2].lumber - f0})`); }
ok(!cards.some(c=> 'worthy' in (c.effects||{})), '26. no card carries Worthy');
// 2026-10-22 (BF8, owner 12:00: "remove bounty from all cards with bounty. Only those thematic"): Bounty stays on 8 loot carriers only;
// Beaver Lumberjack keeps its folded Worthy 2 (Bounty 2), Elder Willow and Field Mouse lost theirs.
{ const KEEP = ['trash-panda-trickster','raccoon-bandit','raccoon-warlord','magnate-duck','chipmunk-stockpiler','pack-mule','riverside-peddler','beaver-lumberjack'];
  const has = cards.filter(x=> !x.test && 'bounty' in (x.effects || {})).map(x=> x.id).sort();
  // 2026-10-24 (package EN6, owner 12:02 #5: "I'll take away bounty from creatures that dont make sense such as Beaver"): the Beaver Lumberjack
  // lost its Bounty (On Ready: gain 1 Lumber instead); the 7 loot carriers keep theirs.
  const bv = cards.find(x=> x.id === 'beaver-lumberjack').effects;
  ok(!bv.bounty && ((bv.triggers || []).some(t=> t.on === 'onReady' && t.do === 'gain') || bv.stockpile === 1 /* 2026-10-26 (ENG9): Stockpile 1 */) && has.every(id=> KEEP.includes(id) && id !== 'beaver-lumberjack'), `26. Bounty only on the 7 loot carriers; the Beaver Lumberjack's is gone (${has.join(', ')})`); }
ok(/\{key:'worthy', category:'passive', hidden:true, retired:true,/.test(src), '26. Worthy is out of the editor and the lists');

// ---- 43. every extra hit rolls its own miss
{ let dodged = 0, landed = 0; for(let s = 1; s <= 40; s++){ const {e, P} = mk(null, s); put(e, P, 2, 'kr-wall', 0); const L = put(e, P, 2, 'kr-evade', -1); const A = put(e, P, 1, 'kr-cleave', 0);
    e.debugAttack(P, so, A.uid, {}, []); if(L.hp === 500) dodged++; else landed++; }
  ok(dodged > 5 && landed > 5, `43. a Cleave side hit on an Evasive unit is dodged about half the time (${dodged}/40)`); }
{ let dodged = 0; for(let s = 1; s <= 40; s++){ const {e, P} = mk(null, s); put(e, P, 2, 'kr-wall', 1); const L = put(e, P, 2, 'kr-evade', -1); const A = put(e, P, 1, 'kr-fork', 0); // 2026-10-17: L and R (a Fork with a unit in front and one side only strikes C)
    e.debugAttack(P, so, A.uid, {}, []); if(L.hp === 500) dodged++; }
  ok(dodged > 5 && dodged < 35, `43. a Fork prong at an Evasive unit can be dodged (${dodged}/40)`); }
{ let miss = 0, hit = 0; for(let s = 1; s <= 40; s++){ const {e, P} = mk({dark:'pitch'}, s); put(e, P, 2, 'kr-wall', 0); const L = put(e, P, 2, 'kr-wall', -1); const A = put(e, P, 1, 'kr-cleave', 0);
    e.debugAttack(P, so, A.uid, {}, []); if(L.hp === 500) miss++; else hit++; }
  ok(miss > 5 && hit > 5, `43. in Pitch Black each Cleave side hit rolls its own miss (${miss}/40 missed)`); }
{ let lashed = 0, mainMissed = 0; for(let s = 1; s <= 40; s++){ const {e, P} = mk({dark:'pitch'}, s); const M = put(e, P, 2, 'kr-wall', 0); const L = put(e, P, 2, 'kr-wall', 1); const A = put(e, P, 1, 'kr-octo', 0);
    e.debugAttack(P, so, A.uid, {}, []); if(M.hp === 500){ mainMissed++; if(L.hp < 500) lashed++; } }
  ok(mainMissed > 3 && lashed > 0, `43. Octolash: a lash still lands when the main swing missed (${lashed} of ${mainMissed})`); }

// ---- 47. Sudden death
ok(E.SUDDEN_DEATH_ROUND === 20 && E.SUDDEN_DEATH_CASTLE_ROUND === 25 && E.STALL_DRAW_FROM_ROUND === 25, '47. stage I at 20, stage II at 25, no stall draw before 25');
{ const {e, P} = mk(); const W = put(e, P, 2, 'kr-armor', 0), A = put(e, P, 1, 'kr-hit', 0); e.setSuddenDeath(true, 1); e.debugAttack(P, so, A.uid, {}, []);
  ok(W.hp === 0, `47. a hit Armor soaks to 0 still kills in sudden death (${W.hp})`); }
{ const {e, P} = mk(); const W = put(e, P, 2, 'kr-immune', 0), A = put(e, P, 1, 'kr-hit', 0); e.setSuddenDeath(true, 1); e.debugAttack(P, so, A.uid, {}, []);
  ok(W.hp === 500, `47. a unit Immune to the hit (a Ghost against physical) is not killed (${W.hp})`); }
{ const {e, P} = mk(); const A = put(e, P, 1, 'kr-hit', 0); e.setSuddenDeath(true, 2); const h0 = P[2].hq.hp; e.debugAttack(P, so, A.uid, {}, []);
  ok(h0 > 3 && P[2].hq.hp === 0, `47. stage II: any damage to the castle destroys it (${P[2].hq.hp})`); }
ok(/function suddenDeathPillHTML\(m\)/.test(src) && /suddenDeathPillHTML\(m\); \}catch/.test(src) && /case 'suddenDeath': return/.test(src), '47. a pill on the board and a log line');
ok(/m\.stallRounds >= STALL_ROUNDS_FOR_DRAW && \(m\.round >= STALL_DRAW_FROM_ROUND/.test(src), '47. the game holds the stall draw until round 25');

// ---- 52. Darksight
ok(/\{key:'darksight', category:'passive', label:'Darksight', kind:'boolean', desc:\(\)=>`It can see in darkness\.`\}/.test(src), '52. Darksight: "It can see in darkness."');

// ---- 53. Poison
{ const {e, P} = mk(); const W = put(e, P, 2, 'kr-wait', 0), A = put(e, P, 1, 'kr-psn', 0); e.debugAttack(P, so, A.uid, {}, []);
  ok(W.wait > 0 && W.poison === 2, `53. a unit still under Wait is poisoned (${W.wait}, ${W.poison})`); }
{ const {e, P} = mk(); const S = put(e, P, 2, 'kr-struct', 0), A = put(e, P, 1, 'kr-psn', 0); e.debugAttack(P, so, A.uid, {}, []);
  ok(!S.poison && S.hp === 497, `53. a Structure takes the hit but no Poison (${S.poison}, ${S.hp})`); }
{ const {e, P} = mk({swampFever:100}); const S = put(e, P, 2, 'kr-struct', 0); e.roundStart(P, 2, so, {}, []); ok(!S.poison, '53. ...and never catches Swamp Fever'); }

// ---- 55. Nursing
{ const {e, P} = mk(); put(e, P, 1, 'kr-nurse', 0); const a = put(e, P, 1, 'kr-wall', -1), b = put(e, P, 1, 'kr-wall', 1); a.hp = 300; b.hp = 100; const ev = [];
  e.roundStart(P, 2, so, {}, []); e.resolveCombat(P, so, {}, ev, 1);
  ok(b.hp === 103 && a.hp === 300, `55. Nursing 3 heals the weakest wounded ally (${a.hp}, ${b.hp})`); ok(ev.some(x=> x.type === 'heal' && x.cause === 'nursing'), '55. ...and says so'); }
ok(/\{key:'nursing', category:'passive', label:'Nursing', kind:'number', min:1, defaultValue:2,/.test(src), '55. Nursing N in the editor (default 2)');
{ // the mastery maths, run on its own
  const pick = name=>{ const i = src.indexOf(`function ${name}(`); let d = 0, j = src.indexOf('{', i); for(; j < src.length; j++){ if(src[j] === '{') d++; else if(src[j] === '}' && --d === 0) break; } return src.slice(i, j + 1); };
  const D = {u:{rarity:'unique', effects:{}}, ul:{rarity:'unique', effects:{leader:true}}, c:{rarity:'common', effects:{nursing:2}}, h:{rarity:'heroic', hero:true, heroLevel:37, effects:{}}};
  const L = {u:1, ul:1, c:3, h:0};
  const ctx = {getCardDefs:()=> D, getCardLevel:id=> L[id], sbRarityRank:k=> ['starter','common','uncommon','rare','veryrare','superrare','epic','heroic','unique','legendary'].indexOf(k), Math};
  vm.createContext(ctx); vm.runInContext(pick('nurseMasteryParts') + pick('nurseMasteryOf'), ctx);
  ok(ctx.nurseMasteryOf('u') === 9, `55. Unique (8) + Level 1 = 9 (${ctx.nurseMasteryOf('u')})`);
  ok(ctx.nurseMasteryOf('ul') === 13, `55. a Natural Leader's hidden +1 makes it 10, so +3 more: 13 (${ctx.nurseMasteryOf('ul')})`);
  ok(ctx.nurseMasteryOf('c') === 9, `55. Common (1) + Level 3 + Nursing 5 = 9, under 10 so no bonus (${ctx.nurseMasteryOf('c')})`);
  ok(ctx.nurseMasteryOf('h') === 13, `55. a hero's level counts /10: Heroic 7 + 3 = 10, +3 = 13 (${ctx.nurseMasteryOf('h')})`); }
ok(/function nurseChipHTML\(id\)/.test(src) && /\$\{nurseChipHTML\(c\.id\)\}/.test(src) && /\.nurse-chip\{/.test(tpl), '55. the 🍼 chip on the Nurse master and its picker');
ok(/hatchHours\*3600e3\*nurseTimeFactor\(\)/.test(src) && /NURTURE_HOURS\*3600e3\*nurseTimeFactor\(\)/.test(src) && /BABY_GROW_HOURS\*3600e3\*nurseTimeFactor\(\)/.test(src), '55. mastery speeds hatching, growing and training');

// ---- 23. New field effects
{ let got = 0, n = 0; for(let s = 1; s <= 20; s++){ const {e, P} = mk({swampFever:50}, s); const ws = [-1, 0, 1].map(sl=> put(e, P, 1, 'kr-wall', sl)); const ev = []; e.roundStart(P, 2, so, {}, ev);
    ws.forEach(c=>{ n++; if(c.poison === 1) got++; }); if(s === 1) ok(ev.some(x=> x.type === 'fieldTick' && x.field === 'swampFever'), '23. Swamp Fever reports a fieldTick'); }
  ok(got > n * 0.3 && got < n * 0.7, `23. Swamp Fever: about half the units catch 1 Poison (${got}/${n})`); }
{ const {e, P} = mk({freezing:true}); const ev = []; const A = put(e, P, 1, 'kr-hit', 0, ev), C = put(e, P, 1, 'kr-cold', 1, ev);
  ok(A.frozen === 1 && !C.frozen && ev.some(x=> x.type === 'fieldTick' && x.field === 'freezing'), `23. Freezing: units arrive frozen, cold-resistant ones don't (${A.frozen}, ${C.frozen})`); }
{ let miss = 0, dryMiss = 0; for(let s = 1; s <= 60; s++){ const {e, P} = mk({sandstorm:true}, s); const W = put(e, P, 2, 'kr-wall', 0), A = put(e, P, 1, 'kr-hit', 0), D = put(e, P, 1, 'kr-dry', 1); const W2 = put(e, P, 2, 'kr-wall', 1);
    e.debugAttack(P, so, A.uid, {}, []); if(W.hp === 500) miss++; e.debugAttack(P, so, D.uid, {}, []); if(W2.hp === 500) dryMiss++; }
  ok(miss > 5 && miss < 30 && dryMiss === 0, `23. Sandstorm: attacks miss about 1 in 4 (${miss}/60); Dry units never (${dryMiss})`); }
{ const {e, P} = mk({rapids:true}); put(e, P, 1, 'kr-tide', 0); let flows = 0; for(let r = 2; r <= 6; r++){ e.roundStart(P, r, so, {}, []); if(e.getTide() === 'flow') flows++; }
  ok(flows === 5, `23. River Rapids: always Flood (${flows}/5)`); }
['scorching2', 'freezing', 'swampfever', 'sandstorm', 'rapids'].forEach(id=> ok(new RegExp(`\\{id:'${id}',\\s*group:`).test(src), `23. ${id} in the skirmish editor's field-effect list`));
['rapids', 'swampFever', 'freezing', 'sandstorm', 'scorching2'].forEach(k=> ok(new RegExp(`\\{key:'${k}', icon:`).test(src), `23. ${k} staged in the Effects library`));
ok(/if\(r\.swampFever\) add\('swampFever'/.test(src) && /if\(r\.freezing\) add\('freezing'/.test(src) && /if\(r\.sandstorm\) add\('sandstorm'/.test(src), '23. their rows on the Environment card');

// ---- 56. Hidden skirmishes
{ const i = src.indexOf('const HIDDEN_SKIRMISHES = ['), j = src.indexOf('\n];', i); const H5 = vm.runInNewContext('(' + src.slice(i + 'const HIDDEN_SKIRMISHES = '.length, j + 2) + ')');
  ok(H5.length >= 1 && H5.length <= 5, `56. at most 5 hidden skirmishes (${H5.length})`);
  const ids = new Set(cards.map(c=> c.id)); const bad = H5.flatMap(h=> Object.keys(h.node.deck).filter(id=> !ids.has(id)));
  ok(!bad.length, `56. their decks use existing cards (${bad})`);
  const MAIN = ['m1','mf','mb','mc','m2','mw','m8','mu','m4','mk','m7','m10','mh','mr','m5','ml','mt','m6','md','m3','m11'];
  ok(H5.every(h=> { const n = MAIN.indexOf(h.map); return n >= 1 && n <= 20 && h.node.code.startsWith(n + '-H'); }), '56. all on Maps 1–20, coded X-H');
  ok(H5.every(h=> h.reveal && Object.keys(h.reveal).length), '56. each has a reveal condition'); }
ok(/function refreshHiddenSkirmishes\(\)/.test(src) && /try\{ refreshHiddenSkirmishes\(\); \}catch\(e\)\{\} \/\/ hidden skirmishes/.test(src), '56. revealed ones are put on their maps (applyNodeEdits and each map render)');
ok(/!\(n\.chance > 0\) && !n\.secret\)\.every/.test(src), '56. a hidden skirmish never blocks the next map');
ok(/\.map-node\.secret-pop\{animation:secretPop/.test(tpl) && /'toast\.hidden-skirmish-found'/.test(src), '56. a reveal pop and a toast');
{ // the reveal rules, run on their own
  const pick = name=>{ const i = src.indexOf(`function ${name}(`); let d = 0, j = src.indexOf('{', i); for(; j < src.length; j++){ if(src[j] === '{') d++; else if(src[j] === '}' && --d === 0) break; } return src.slice(i, j + 1); };
  const ctx = {conquestNodeId:(m, k)=> m + ':' + k, matchState:null, adminModeEnabled:false, flags:{}, loadDialogueFlags(){ return this.flags; }, cleared:false, conquestMapCleared(){ return ctx.cleared; }, Date};
  vm.createContext(ctx); vm.runInContext(pick('nightOnClock') + pick('hiddenSkirmishShown') + ';this.loadDialogueFlags = ()=> this.flags;', ctx);
  const st = {found:{}, popped:{}}, P0 = {completed:[], ranks:{}};
  const cur = {map:'m2', node:{key:'4-H'}, reveal:{curiosity:'cur_m2_lantern'}};
  ok(!ctx.hiddenSkirmishShown(cur, P0, st), '56. curiosity reveal: hidden before you look');
  ctx.flags['seen:cur_m2_lantern'] = true; ok(ctx.hiddenSkirmishShown(cur, P0, st), '56. ...shown once you have');
  const rk = {map:'m6', node:{key:'17-H'}, reveal:{rankS:'17-8'}};
  ok(!ctx.hiddenSkirmishShown(rk, {completed:['m6:17-8'], ranks:{'m6:17-8':'A'}}, st) && ctx.hiddenSkirmishShown(rk, {completed:['m6:17-8'], ranks:{'m6:17-8':'S'}}, st), '56. rank S reveal');
  const mc = {map:'m7', node:{key:'10-H'}, reveal:{mapCleared:true}}; ok(!ctx.hiddenSkirmishShown(mc, P0, st), '56. map-cleared reveal: hidden'); ctx.cleared = true; ok(ctx.hiddenSkirmishShown(mc, P0, st), '56. ...shown when the map is cleared');
  const nt = {map:'m5', node:{key:'14-H'}, reveal:{night:true, after:'14-1'}}, Pn = {completed:['m5:14-1']};
  ok(ctx.hiddenSkirmishShown(nt, Pn, st) === ctx.nightOnClock(), '56. night-only: shown only at night on your clock');
  ok(ctx.hiddenSkirmishShown(nt, {completed:['m5:14-1', 'm5:14-H']}, st), '56. ...always once beaten'); }

console.log(`keywords-2026-10-15r: ${fail ? fail + ' failure(s)' : 'all passed'}`); process.exit(fail ? 1 : 0);
