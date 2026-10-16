#!/usr/bin/env node
// 2026-10-14, fifth pass: Tornado, Avalanche, Tsunami (user: "All evergreen abilities"), the Dragonic Spire's Dragon Lightning and Wither
// (user: "Dragonic Spire - (imagine elden ring) - Skills, Dragon Lightning (monster hunter), and Wither (Minecraft)"), egg cards (user:
// "Eggs are now cards ... When it hatches (5-10 wait), it forms a random beast of that type"), Esprit and spawns (user: "Spawns should
// also power up your espirit! ... Espirit only works for units that share a type") and the screen shake (user: "when summoning >20hp
// monsters ... up to 200HP max" + "damage >15 in 1 hit ... till 100HP damage").
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const base = H.loadCardDefs();
const defs = Object.assign({}, base, {
  'ke-wall':  {id:'ke-wall', name:'Wall', attack:0, health:50, wait:0, cost:0, effects:{}},
  'ke-armor': {id:'ke-armor', name:'Plate', attack:0, health:50, wait:0, cost:0, effects:{armor:5}},
  'ke-fly':   {id:'ke-fly', name:'Kite', attack:0, health:50, wait:0, cost:0, effects:{flying:true}},
  'ke-swim':  {id:'ke-swim', name:'Eel', attack:0, health:50, wait:0, cost:0, effects:{swimmer:true}},
  'ke-tor':   {id:'ke-tor', name:'Twister', attack:0, health:10, wait:0, cost:0, effects:{tornado:2}},
  'ke-tor9':  {id:'ke-tor9', name:'Big Twister', attack:0, health:10, wait:0, cost:0, effects:{tornado:9}},
  'ke-ava':   {id:'ke-ava', name:'Yeti', attack:0, health:10, wait:0, cost:0, effects:{avalanche:3}},
  'ke-tsu':   {id:'ke-tsu', name:'Leviathan', attack:0, health:10, wait:0, cost:0, effects:{tsunami:4}},
  'ke-dl':    {id:'ke-dl', name:'Drake', attack:2, health:50, wait:0, cost:0, effects:{dragonLightning:3}},
  'ke-wit':   {id:'ke-wit', name:'Wither Wyrm', attack:1, health:50, wait:0, cost:0, effects:{wither:2}},
  'ke-esp':   {id:'ke-esp', name:'Queen', attack:1, health:20, wait:0, cost:0, archetypes:['Insect'], effects:{esprit:1, espritHp:1}},
  'ke-ins':   {id:'ke-ins', name:'Bug', attack:1, health:5, wait:0, cost:0, archetypes:['Insect'], effects:{}},
  'ke-wolf':  {id:'ke-wolf', name:'Wolf', attack:1, health:5, wait:0, cost:0, archetypes:['Wolf'], effects:{}},
  'ke-brood': {id:'ke-brood', name:'Brood Mother', attack:1, health:5, wait:0, cost:0, archetypes:['Insect'], effects:{swarm:true, brood:2}},
  'ke-twinw': {id:'ke-twinw', name:'Twin Wolf', attack:1, health:5, wait:0, cost:0, archetypes:['Wolf'], effects:{twin:true}},
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(seed, mode, d){ const e = E.makeSimEngine(d || defs, E.mulberry32(seed||7), {recordEvents:true, battleMode: mode || 'open', rules:{}}); return {e, P:{1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})}}; }
function put(e, P, pid, id, slot, ev){ const pl = P[pid]; e.debugSpawnCard(P, so, pid, id, 'left', {}, ev || []);
  const c = all(pl).filter(x=> x.defId === id).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null);
  if(slot != null){ c.slot = slot; const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot); }
  return c; }

// ---- 1. Tornado
{ const {e, P} = mk(3); const A = put(e, P, 2, 'ke-wall', 0), B = put(e, P, 2, 'ke-fly', 1), C = put(e, P, 2, 'ke-wall', -1);
  const before = {[A.uid]: A.slot, [B.uid]: B.slot, [C.uid]: C.slot}; const ev = []; put(e, P, 1, 'ke-tor', 0, ev);
  const t = ev.find(x=> x.type === 'tornado'); ok(t && t.hits.length === 2, `Tornado 2: a tornado event that flings 2 units (${t && t.hits.length})`);
  const flung = [A, B, C].filter(c=> t.hits.includes(c.uid));
  ok(flung.every(c=> c.hp === (c === B ? 48 : 49)), `the flung take 1, a flyer 2 (${flung.map(c=> c.hp)})`);
  ok([A, B, C].filter(c=> !t.hits.includes(c.uid)).every(c=> c.hp === 50), 'the one left alone is unhurt');
  ok(t.moves.length >= 2 && [A, B, C].some(c=> c.slot !== before[c.uid]), 'units moved to other columns');
  const slots = [A, B, C].map(c=> c.slot); ok(new Set(slots).size === 3, `no two units share a column after the whirl (${slots})`); }
{ const {e, P} = mk(5); const A = put(e, P, 2, 'ke-wall', 0); A.pinned = true; const B = put(e, P, 2, 'ke-wall', 1); const ev = []; put(e, P, 1, 'ke-tor9', 0, ev);
  const t = ev.find(x=> x.type === 'tornado'); ok(t && t.hits.length === 1 && t.hits[0] === B.uid && A.slot === 0, 'Tornado: a pinned unit holds on (neither flung nor swapped)'); }
{ const run = seed=>{ const {e, P} = mk(seed); [0, 1, -1, 2].forEach(s=> put(e, P, 2, 'ke-wall', s)); put(e, P, 1, 'ke-tor', 0); return all(P[2]).map(c=> c.uid + ':' + c.slot).join(','); };
  ok(run(11) === run(11), 'Tornado is deterministic for a seed'); }
{ const {e, P} = mk(4, 'classic'); put(e, P, 2, 'ke-wall'); put(e, P, 2, 'ke-wall', null); put(e, P, 2, 'ke-fly', null); const n0 = all(P[2]).length; const ev = []; put(e, P, 1, 'ke-tor', null, ev);
  const t = ev.find(x=> x.type === 'tornado'); ok(t && all(P[2]).length === n0 && (t.swaps.length + t.moves.length) >= 1, 'Tornado on a slotless row swaps units'); }

// ---- 2. Avalanche
{ const {e, P} = mk(); const A = put(e, P, 2, 'ke-wall', 0), F = put(e, P, 2, 'ke-fly', 1); A.wait = 0; F.wait = 0; const ev = []; put(e, P, 1, 'ke-ava', 0, ev);
  ok(A.hp === 47 && A.wait === 1, `Avalanche 3: a grounded unit takes 3 and +1 Wait (${A.hp}, ${A.wait})`);
  ok(F.hp === 50 && F.wait === 0, 'a flyer is above it all');
  ok(ev.some(x=> x.type === 'avalanche' && x.hits.length === 1), 'an avalanche event lists who it buried'); }

// ---- 3. Tsunami
{ const {e, P} = mk(); e.roundStart(P, 1, so, {}, []); const A = put(e, P, 2, 'ke-wall', 0), S = put(e, P, 2, 'ke-swim', 1);
  // the swimmer itself would start the tide; clear that so the Tsunami's own start is what we see
  const {e:e2, P:P2} = mk(); e2.roundStart(P2, 1, so, {}, []); const W = put(e2, P2, 2, 'ke-wall', 0); ok(e2.getTide() === null, 'no tide before the Tsunami');
  const ev2 = []; put(e2, P2, 1, 'ke-tsu', 0, ev2); ok(W.hp === 46 && W.wait === 1, `Tsunami 4: a non-swimmer takes 4 and +1 Wait (${W.hp}, ${W.wait})`);
  ok(ev2.some(x=> x.type === 'tsunami' && x.tideStarted), 'the Tsunami starts the Tide'); e2.roundStart(P2, 2, so, {}, []); ok(e2.getTide() === 'flow', `next round the tide flows (${e2.getTide()})`);
  const ev = []; put(e, P, 1, 'ke-tsu', 0, ev); ok(S.hp === 50 && S.wait === 1, `a Swimmer rides the wave: no damage, still pushed back (${S.hp}, ${S.wait})`); ok(A.hp === 46, 'the other unit takes 4'); }

// ---- 4. Dragon Lightning
{ const {e, P} = mk(9); const T = put(e, P, 2, 'ke-armor', 0), N = put(e, P, 2, 'ke-armor', 1); const D = put(e, P, 1, 'ke-dl', 0);
  const ev = []; e.debugAttack(P, so, D.uid, {}, ev); const dl = ev.find(x=> x.type === 'dragonLightning');
  ok(dl && dl.uids.length === 2 && dl.uids.includes(N.uid), 'Dragon Lightning strikes the target and the unit beside it');
  ok(N.hp === 47, `the unit beside takes 3 through 5 Armor (${N.hp})`);
  ok(T.hp === 47, `the target: the 2-Attack swing is stopped by Armor, the bolt's 3 is not (${T.hp})`);
  ok(ev.filter(x=> x.type === 'hit' && x.dragonLightning).length === 2, 'each strike is a hit event (so the board numbers follow)'); }
{ const {e, P} = mk(9); const T = put(e, P, 2, 'ke-wall', 0); const D = put(e, P, 1, 'ke-dl', 0); const ev = []; e.debugAttack(P, so, D.uid, {}, ev);
  ok(T.hp === 45 && ev.find(x=> x.type === 'dragonLightning').uids.length === 1, `a lone target: 2 + 3 (${T.hp})`); }

// ---- 5. Wither
{ const {e, P} = mk(); const T = put(e, P, 2, 'ke-wall', 0); const W = put(e, P, 1, 'ke-wit', 0); const ev = []; e.debugAttack(P, so, W.uid, {}, ev);
  ok(T.wither === 2 && T.witherLeft === 3 && ev.some(x=> x.type === 'statusFx' && x.kind === 'wither'), 'Wither 2: the hit withers the target for 3 rounds');
  ok(e.debugHeal(P, so, T.uid, 5, {}, []) === 0 && T.hp === 49, 'nothing heals a withering unit');
  W.atk = 0; W.baseAtk = 0; const hp0 = T.hp, mx0 = T.maxHp; const ticks = [];
  for(let r = 1; r <= 4; r++){ const evr = []; e.resolveCombat(P, so, {}, evr, 1); ticks.push(evr.filter(x=> x.type === 'witherTick' && x.uid === T.uid).length); }
  ok(ticks.join(',') === '1,1,1,0', `it withers for 3 upkeeps, then stops (${ticks})`);
  ok(T.maxHp === mx0 - 6 && T.hp === hp0 - 6 && !T.wither, `−2 max Health (and Health) each time (${T.maxHp}/${T.hp})`);
  e.debugDamage(P, so, T.uid, 5, {}, []); ok(e.debugHeal(P, so, T.uid, 5, {}, []) === 5, 'once the Wither fades it can heal again'); }

// ---- 6. Egg cards
{ const eggs = Object.values(base).filter(d=> d.hatchInto && !d.hatchInto.defId); // fixed-hatch eggs (Red Dragon Egg) are checked below
  ok(eggs.length === 7, `one egg card per Nest egg kind (${eggs.length})`);
  ok(eggs.every(d=> d.attack === 0 && d.health <= 6 && d.wait >= 5 && d.wait <= 10 && d.icon === '🥚' && !d.token && d.eggKind), 'eggs: 0 Attack, low Health, Wait 5-10, 🥚, deckable (not tokens)');
  const src = fs.readFileSync(path.join(__dirname, '..', 'arena_app.js'), 'utf8'); const m = src.match(/const EGG_KINDS = \{([\s\S]*?)\n\};/);
  const kinds = m ? [...m[1].matchAll(/^\s*(\w+):\s*\{/gm)].map(x=> x[1]) : []; ok(kinds.length === 7 && kinds.every(k=> base['egg-' + k]), `an egg card for every EGG_KINDS entry (${kinds})`);
  { const {e} = mk(), rde = base['egg-red-dragon']; const pool = rde ? e.eggPoolFor(rde) : []; ok(rde && pool.length === 1 && pool[0].id === 'red-dragon', 'Red Dragon Egg hatches into the Red Dragon'); }
  const {e} = mk(); eggs.forEach(d=>{ const pool = e.eggPoolFor(d); ok(pool.length > 5 && pool.every(c=> !c.token && !c.test && !c.hidden && !c.hatchInto && ['common','uncommon'].includes(c.rarity)), `${d.name} hatches into Common/Uncommon real cards (${pool.length})`); });
  ok(e.eggPoolFor(base['egg-bird']).every(c=> (c.species||[]).includes('Bird') || (c.archetypes||[]).some(a=> ['Bird','Hummingbird','Owl','Eagle','Duck','Raven'].includes(a))), 'a Speckled Egg only hatches birds');
  const rareEgg = Object.assign({}, base['egg-bird'], {rarity:'rare'}); ok(e.eggPoolFor(rareEgg).some(c=> c.rarity === 'rare'), 'a rarer egg can hatch up to its own rarity'); }
{ const hatch = seed=>{ const {e, P} = mk(seed); const egg = put(e, P, 1, 'egg-bug', 0); put(e, P, 2, 'ke-wall', 0); egg.wait = 1; const ev = []; e.resolveCombat(P, so, {}, ev, 1);
    return {egg, ev}; };
  const {egg, ev} = hatch(21); const h = ev.find(x=> x.type === 'hatch'); const into = h && defs[h.defId];
  ok(h && h.fromDefId === 'egg-bug' && egg.defId === h.defId, `the egg cracks open when Ready (${h && h.defId})`);
  ok(into && ((into.species||[]).some(x=> ['Insect','Arachnid'].includes(x)) || (into.archetypes||[]).some(a=> ['Insect','Arachnid','Bee','Ants'].includes(a))), 'a Cocoon hatches a bug');
  ok(egg.hp === into.health && egg.maxHp === into.health && egg.atk === into.attack && egg.wait === 0, 'it takes the new card\'s Attack and Health, ready to fight');
  ok(ev.findIndex(x=> x.type === 'ready' && x.uid === egg.uid) < ev.findIndex(x=> x.type === 'hatch'), 'Ready, then the hatch');
  ok(hatch(21).ev.find(x=> x.type === 'hatch').defId === h.defId, 'the hatch is seeded (same seed, same beast)');
  const seen = new Set([21, 22, 23, 24, 25, 26, 27, 28].map(s=> hatch(s).ev.find(x=> x.type === 'hatch').defId)); ok(seen.size > 1, `different seeds, different beasts (${seen.size})`); }
{ const {e, P} = mk(); const egg = put(e, P, 1, 'egg-woodland', 0); ok(egg.wait === base['egg-woodland'].wait && egg.atk === 0, 'an egg waits out its Wait first'); }

// ---- 7. Esprit counts spawns, but only units that share a type
{ const {e, P} = mk(); const Q = put(e, P, 1, 'ke-esp', 0); put(e, P, 1, 'ke-ins'); ok(Q.atk === 2 && Q.maxHp === 21, `an Insect played powers an Insect Esprit (${Q.atk}/${Q.maxHp})`);
  put(e, P, 1, 'ke-wolf'); ok(Q.atk === 2, 'a Wolf (no shared type) does not');
  put(e, P, 1, 'ke-brood'); ok(Q.atk === 5 && Q.maxHp === 24, `Brood Mother (Insect) + 2 Insect brood tokens spawned: +3 (${Q.atk}/${Q.maxHp})`);
  put(e, P, 1, 'ke-twinw'); ok(Q.atk === 5, 'a Wolf and its twin token: nothing'); }
{ const {e, P} = mk(); const Q = put(e, P, 1, 'ke-esp', 0); const egg = put(e, P, 1, 'egg-bug', 1); egg.wait = 1; const a0 = Q.atk; const ev = []; e.resolveCombat(P, so, {}, ev, 1);
  const into = defs[egg.defId]; const kin = (into.archetypes||[]).includes('Insect'); ok(Q.atk === a0 + (kin ? 1 : 0), `a hatched egg counts for Esprit when it shares the type (${into.id}, ${kin})`); }
{ const swarm = base['swarm-matriarch']; ok(swarm && swarm.effects.esprit && (swarm.archetypes||[]).includes('Insect'), 'Swarm Matriarch still has Esprit (Insect)'); }

// ---- 8. App: skills, icons, short text, chips, log lines, VFX, FUTURE_MAPS, screen shake
{ const src = fs.readFileSync(path.join(__dirname, '..', 'arena_app.js'), 'utf8');
  ['tornado','avalanche','tsunami','dragonLightning','wither'].forEach(k=>{
    ok(new RegExp(`\\{key:'${k}', category:'(evergreen|passive)'`).test(src), `${k}: a skill def (shows in the editor)`);
    ok(new RegExp(`Object\\.assign\\(SKILL_ICON, \\{[^}]*\\b${k}:`).test(src), `${k}: an icon`);
    ok(new RegExp(`\\n  ${k}: v=> `).test(src), `${k}: short text`);
    ok(src.includes(`if(e.${k}) out.push(`), `${k}: a chip on the card`); });
  const icons = (src.match(/Object\.assign\(SKILL_ICON, \{([^}]*)\}\)/) || [])[1] || ''; const mine = [...icons.matchAll(/'([^']+)'/g)].map(x=> x[1]);
  const mainIcons = [...((src.match(/const SKILL_ICON = \{([\s\S]*?)\};/) || [])[1] || '').matchAll(/:'([^']+)'/g)].map(x=> x[1]);
  ok(mine.length === 5 && mine.every(i=> !mainIcons.includes(i)), `the new icons don't clash (${mine})`);
  ['tornado','avalanche','tsunami','dragonLightning','witherTick','hatch'].forEach(t=> ok(src.includes(`case '${t}':`) && src.includes(`ev.type==='${t}'`), `${t}: a log line and a VFX handler`));
  ok(/const FUTURE_MAPS = \[[\s\S]*?id:'dragonic-spire', name:'Dragonic Spire'[\s\S]*?signature:\['dragonLightning','wither'\][\s\S]*?blurb:/.test(src), 'FUTURE_MAPS lists the Dragonic Spire');
  // 2026-10-16 ("Add 1 card for all our no-card skills"): Thunder Lizard and Corpse-flower Beetle carry them, but on no map yet (no source).
  ok(!Object.values(base).some(d=> !d.hatchInto && d.source && d.effects && (d.effects.dragonLightning || d.effects.wither)), 'no card you can get has the Spire skills yet');
  const fn = name=>{ const mm = src.match(new RegExp(`function ${name}\\([^)]*\\)\\{[^\\n]*\\}`)); return mm ? eval('(' + mm[0] + ')') : null; };
  const sa = fn('shakeStrengthForArrival'), sh = fn('shakeStrengthForHit');
  ok(sa && sa(20) === 0 && sa(21) > 0 && sa(21) < 0.01 && sa(110) > sa(60) && sa(200) === 1 && sa(500) === 1, 'arrival shake: none to 20 HP, tiny at 21, growing, full at 200');
  ok(sh && sh(15) === 0 && sh(16) > 0 && sh(16) < 0.02 && sh(60) > sh(30) && sh(100) === 1 && sh(250) === 1, 'hit shake: none to 15, tiny at 16, growing, full at 100');
  const bs = (src.match(/function battlefieldShake\(t\)\{[\s\S]*?\n\}/) || [''])[0];
  ok(/reducedMotion\(\)/.test(bs) && /'low'/.test(bs) && /< 150/.test(bs) && /9\*Math\.min\(1, t\)/.test(bs), 'the shake respects reduced motion and Low effects, waits 150 ms between shakes, tops out near 10px');
  ok(/grantEggCardFor\(e\.kind\)/.test(src) && /src\.kind==='nest'\) return 'nest'/.test(src), 'the Nest gives the egg card; egg cards are obtainable from the Nest'); }

console.log(`keywords-2026-10-14e: ${fail ? fail + ' failure(s)' : 'all passed'}`);
process.exit(fail ? 1 : 0);
