#!/usr/bin/env node
// 2026-10-14, third pass: Bloom (conditions), Wave, Perma-tide (river maps), Supreme Tide (Blue Dragon), Brood N (swarm summoning),
// and the Pack rework (chains, Pack Leader, Irradiation -2, AI adjacency).
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const base = H.loadCardDefs();
const defs = Object.assign({}, base, {
  'kc-wall':  {id:'kc-wall', name:'Wall', attack:0, health:500, wait:0, cost:0, effects:{}},
  'kc-hit':   {id:'kc-hit', name:'Hit', attack:5, health:500, wait:0, cost:0, effects:{}},
  'kc-bloomAnd': {id:'kc-bloomAnd', name:'Lily', attack:1, health:10, wait:0, cost:0, effects:{bloomWhen:{when:['tide','night'], mode:'and', atk:2, hp:2}}},
  'kc-bloomOr':  {id:'kc-bloomOr', name:'Fern', attack:1, health:10, wait:0, cost:0, effects:{bloomWhen:{when:['wind','wet'], mode:'or'}}},
  'kc-tide':  {id:'kc-tide', name:'Tide', attack:1, health:50, wait:0, cost:0, effects:{tide:true}},
  'kc-moon':  {id:'kc-moon', name:'Moon', attack:1, health:50, wait:0, cost:0, effects:{tide:true, moonpull:true}},
  'kc-stide': {id:'kc-stide', name:'Sea Drake', attack:5, health:500, wait:0, cost:0, effects:{supremeTide:true}},
  'kc-waveL': {id:'kc-waveL', name:'WaveL', attack:1, health:500, wait:0, cost:0, effects:{wave:'left'}},
  'kc-waveR': {id:'kc-waveR', name:'WaveR', attack:1, health:500, wait:0, cost:0, effects:{wave:'right'}},
  'kc-waveA': {id:'kc-waveA', name:'WaveA', attack:1, health:500, wait:0, cost:0, effects:{wave:'alternate'}},
  'kc-waveT': {id:'kc-waveT', name:'WaveT', attack:1, health:500, wait:0, cost:0, effects:{wave:true}},
  'kc-brood': {id:'kc-brood', name:'Queen Ant', attack:2, health:10, wait:0, cost:0, archetypes:['Ants'], effects:{swarm:true, brood:2}},
  'kc-bfly':  {id:'kc-bfly', name:'Queen Bee', attack:2, health:10, wait:0, cost:0, archetypes:['Bee'], effects:{swarm:true, flying:true, brood:1, poison:1}},
  'kc-ant':   {id:'kc-ant', name:'Ant', attack:1, health:10, wait:0, cost:0, archetypes:['Ants'], effects:{swarm:true}},
  'kc-wolf':  {id:'kc-wolf', name:'Wolf', attack:2, health:10, wait:0, cost:0, archetypes:['Wolf'], effects:{pack:2}},
  'kc-wolf4': {id:'kc-wolf4', name:'Dire Wolf', attack:2, health:10, wait:0, cost:0, archetypes:['Wolf'], effects:{pack:4}},
  'kc-dog':   {id:'kc-dog', name:'Dog', attack:2, health:10, wait:0, cost:0, archetypes:['Dog'], effects:{pack:2}},
  'kc-lead':  {id:'kc-lead', name:'Alpha', attack:3, health:20, wait:0, cost:0, archetypes:['Wolf'], effects:{packLeader:true}},
  'kc-lead2': {id:'kc-lead2', name:'Wolfdog', attack:3, health:20, wait:0, cost:0, archetypes:['Wolf','Dog'], effects:{packLeader:true}},
  'kc-plain': {id:'kc-plain', name:'Plain', attack:1, health:10, wait:0, cost:0, archetypes:['Wolf'], effects:{}},
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
const live = pl=> all(pl).filter(c=> c.hp > 0 && !c.gap);
const byDef = (pl, id)=> all(pl).find(c=> c.defId===id || (c.defId||'').startsWith(id + '~'));
const atSlot = (pl, sl)=> all(pl).find(c=> c.slot === sl);
function mk(rules, seed, mode){ const e = E.makeSimEngine(defs, E.mulberry32(seed||7), {recordEvents:true, battleMode: mode || 'open', rules: rules || {}}); return {e, P:{1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})}}; }
// put a unit at an exact slot (any slot, even one not next to an ally), then let the board settle
function put(e, P, pid, id, slot){ const pl = P[pid]; e.debugSpawnCard(P, so, pid, id, 'left', {}, []);
  const c = all(pl).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot;
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncPhaseStats(P, so, []); return c; }
const dealt = (e, P, attUid, tgt)=>{ const hp = tgt.hp; e.debugAttack(P, so, attUid, {}, []); return hp - tgt.hp; };

// ---- 1. Bloom (conditions)
{ const {e, P} = mk({phase:'night'}); e.roundStart(P, 1, so, {}, []); const L = put(e, P, 1, 'kc-bloomAnd', 0);
  ok(!L.inBloom && L.atk === 1 && L.maxHp === 10, 'Bloom (Tide & Night): night but no tide, not in bloom');
  e.startTide(); e.roundStart(P, 2, so, {}, []); ok(e.getTide() === 'flow' && L.inBloom, 'Flow and Night: in bloom');
  ok(L.phaseAtk === 2 && L.maxHp === 12 && L.hp === 12, `+2/+2 while in bloom (${L.phaseAtk}, ${L.maxHp})`);
  e.roundStart(P, 3, so, {}, []); ok(e.getTide() === 'ebb' && !L.inBloom && L.phaseAtk === 0 && L.maxHp === 10, 'Ebb: the bloom fades, Health and Attack go back'); }
{ const {e, P} = mk({phase:'day', permaTide:true}); e.roundStart(P, 1, so, {}, []); const L = put(e, P, 1, 'kc-bloomAnd', 0);
  ok(!L.inBloom, 'Bloom (Tide & Night): Tide in by day is not enough with &'); }
{ const {e, P} = mk({wind:'gale'}); e.roundStart(P, 1, so, {}, []); const F = put(e, P, 1, 'kc-bloomOr', 0);
  ok(F.inBloom && F.maxHp === 12, 'Bloom (Wind or Wet): a gale is enough (defaults +2/+2)'); }
{ const {e, P} = mk({}); e.roundStart(P, 1, so, {}, []); const F = put(e, P, 1, 'kc-bloomOr', 0); ok(!F.inBloom, 'Bloom (Wind or Wet): still air and dry ground, no bloom');
  e.setField('rain', 3); e.syncPhaseStats(P, so, []); ok(F.inBloom, 'Spring Rain makes it wet: in bloom'); }
{ const {e, P} = mk({wet:true}); e.roundStart(P, 1, so, {}, []); const F = put(e, P, 1, 'kc-bloomOr', 0); ok(F.inBloom, 'a wet map (rules.wet) is wet'); }
{ const b = (when, mode, rules)=>{ const {e} = mk(rules); return e.bloomStateOf({when, mode}).on; };
  ok(b(['heat'], 'and', {field:'heatwave'}) && !b(['heat'], 'and', {}), 'heat: the Scorching field'); ok(b(['frost'], 'and', {field:'frozen'}), 'frost: the Frigid field');
  ok(b(['dark'], 'and', {dark:'pitch'}), 'dark: a dark map'); ok(!b([], 'or', {}), 'no conditions: never'); }
{ const src = fs.readFileSync(path.join(__dirname, '..', 'arena_app.js'), 'utf8');
  ok(/bloomWhen:/.test(src) && /function bloomLabel/.test(src), 'the app knows Bloom (conditions)');
  const m = src.match(/function bloomLabel\(bw\)\{[\s\S]*?\n\}/); const bloomLabel = m ? eval('(' + m[0] + ')') : null;
  ok(bloomLabel && bloomLabel({when:['tide','night'], mode:'and', atk:2, hp:2}) === 'Bloom (Tide & Night): +2/+2', 'card text: Bloom (Tide & Night): +2/+2');
  ok(bloomLabel && bloomLabel({when:['wind','wet'], mode:'or'}) === 'Bloom (Wind or Wet): +2/+2', 'card text: Bloom (Wind or Wet): +2/+2'); }

// ---- 3. Wave
{ const {e, P} = mk(); put(e, P, 2, 'kc-wall', 0); put(e, P, 2, 'kc-hit', 1); put(e, P, 2, 'kc-hit', -2); const W = put(e, P, 1, 'kc-waveL', 0);
  const T = atSlot(P[2], 0), ev = []; e.debugAttack(P, so, W.uid, {}, ev);
  ok(T.slot === -1, `Wave left: the unit it hits is pushed one column left (${T.slot})`); const w = ev.find(x=> x.type==='wave'); ok(w && !w.blocked && w.dir === 'left', 'a wave event is logged');
  ok(e.allBoardCards(P[2]).every(c=> P[2].row[c.slot === 0 ? 'center' : c.slot < 0 ? 'left' : 'right'].includes(c)), 'the rows follow the new columns'); }
{ const {e, P} = mk(); const T = put(e, P, 2, 'kc-wall', 0); const N = put(e, P, 2, 'kc-hit', 1); const W = put(e, P, 1, 'kc-waveR', 0);
  e.debugAttack(P, so, W.uid, {}, []); ok(T.slot === 0 && N.slot === 1 && N.hp === 499, `Wave right into a taken column: it crashes into the unit there, no swap (${T.slot}, ${N.slot}; 2026-10-18 Wave N)`); }
{ const {e, P} = mk(); const T = put(e, P, 2, 'kc-wall', 0); const W = put(e, P, 1, 'kc-waveL', 0); put(e, P, 1, 'kc-wall', 1);
  const ev = []; e.debugAttack(P, so, W.uid, {}, ev); ok(T.slot === -1, 'with room to the left (the board reaches column 1), a lone unit moves');
  const {e:e2, P:P2} = mk(); const T2 = put(e2, P2, 2, 'kc-wall', -2); put(e2, P2, 2, 'kc-wall', 0); const W2 = put(e2, P2, 1, 'kc-waveL', -2); put(e2, P2, 1, 'kc-wall', 2);
  const ev2 = []; e2.debugAttack(P2, so, W2.uid, {}, ev2); ok(T2.slot === -2 && ev2.find(x=> x.type==='wave').blocked, 'at the board edge the push is blocked'); }
{ const {e, P} = mk(); const T = put(e, P, 2, 'kc-wall', 0); put(e, P, 2, 'kc-wall', -3); put(e, P, 2, 'kc-wall', 3); const W = put(e, P, 1, 'kc-waveA', 0);
  e.debugAttack(P, so, W.uid, {}, []); const s1 = T.slot; W.slot = s1; e.syncSlots(P[1]); P[1].row.center = []; P[1].row.left = s1 < 0 ? [W] : []; P[1].row.right = s1 > 0 ? [W] : [];
  e.debugAttack(P, so, W.uid, {}, []); ok(s1 === -1 && T.slot === 0, `Wave alternate: left, then right (${s1}, ${T.slot})`); }
{ const {e, P} = mk(); const T = put(e, P, 2, 'kc-wall', -1); put(e, P, 2, 'kc-wall', 3); const W = put(e, P, 1, 'kc-waveT', -1);
  e.debugAttack(P, so, W.uid, {}, []); ok(T.slot === 0 || T.slot === -2, `Wave (true): one free column either way (${T.slot})`); } // 2026-10-17: a slight lean inward, not "toward more room" (tests/wave-tide-2026-10-17.js)
{ const {e, P} = mk({}, 3, 'gravity'); ['kc-wall','kc-hit','kc-hit'].forEach((id, i)=> e.debugSpawnCard(P, so, 2, id, i === 2 ? 'right' : 'left', {}, [])); e.debugSpawnCard(P, so, 1, 'kc-waveL', 'left', {}, []);
  const order = ()=> [...P[2].row.left].reverse().concat(P[2].row.center, P[2].row.right).map(c=> c.defId).join();
  const before = order(); const T = P[2].row.center[0]; const ev = []; e.debugAttack(P, so, byDef(P[1], 'kc-waveL').uid, {}, ev);
  const w = ev.find(x=> x.type==='wave'); ok(w && (w.blocked || (order() === before && w.crashUid != null)), `gravity rows: it crashes into its neighbour that way, nobody moves (${before} -> ${order()}; 2026-10-18 Wave N)`); }
{ const cards = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'canonical', 'cards.json'), 'utf8'));
  const w = cards.filter(c=> c.effects && c.effects.wave).map(c=> c.id).sort(); ok(w.join() === 'dolphin-knight,fathom-leviathan,moray-ambusher,reef-manta-glider,tide-pool-crab', `Wave is on five sea cards (+ the Fathom Leviathan, 2026-10-18) (${w})`); }

// ---- 4. Perma-tide
{ const {e, P} = mk({permaTide:true}); e.roundStart(P, 1, so, {}, []); ok(e.getTide() === 'flow', 'Perma-tide: Flow from round 1, with no Tide card played');
  for(let r = 2; r < 7; r++){ e.roundStart(P, r, so, {}, []); if(e.getTide() !== 'flow') ok(false, `round ${r} is still Flow (${e.getTide()})`); }
  const ev = []; e.debugSpawnCard(P, so, 1, 'kc-moon', 'left', {}, ev); ok(e.getTide() === 'flow' && !ev.some(x=> x.type==='tide' && x.moonpull), 'Moonpull does nothing under Perma-tide');
  ok(e.forecast().tide === 'flow', 'the forecast says Flow'); }
{ const {e, P} = mk({permaTide:true, highTide:true}); for(let r = 1; r < 9; r++){ e.roundStart(P, r, so, {}, []); if(e.getTide() !== 'flow') ok(false, `High tide's cycle is ignored (${r}: ${e.getTide()})`); } }
{ const {e, P} = mk({permaTide:true, tideSpout:true}); e.debugSpawnCard(P, so, 1, 'kc-wall', 'left', {}, []); e.roundStart(P, 1, so, {}, []); const ev = []; e.roundStart(P, 2, so, {}, ev);
  const sp = ev.find(x=> x.field==='tideSpout'); ok(sp && !sp.tideIn && e.getTide() === 'flow', 'a Tide-spout does not "bring in" a tide that is always in'); }
{ const {e, P} = mk({permaTide:true}); e.roundStart(P, 1, so, {}, []); const T = put(e, P, 1, 'kc-tide', 0); const W = put(e, P, 2, 'kc-wall', 0);
  ok(dealt(e, P, T.uid, W) === 2, 'a Tide unit hits with Flow\'s +1 on round 1'); }
{ const src = fs.readFileSync(path.join(__dirname, '..', 'arena_app.js'), 'utf8');
  // 2026-10-16 (placement and rarity, user: "I like river rapids (thematic name). keep it on one of the maps"): Sunken Hollow only, as River Rapids
  ok(/const PERMATIDE_MAPS = new Set\(\[\]\)/.test(src) && /const RAPIDS_MAPS = new Set\(\['m2'\]\)/.test(src), 'Sunken Hollow keeps the always-in river (River Rapids); Lilypad Reach has the plain Tide');
  ok(/Perma-tide/.test(src) && /Always Flooded\. Tide effects can't change it\./.test(src), 'the Codex and fight conditions say so ("Always Flooded", 2026-10-16)'); }

// ---- 5. Supreme Tide
{ const {e, P} = mk(); e.roundStart(P, 1, so, {}, []); const S = put(e, P, 1, 'kc-stide', 0); const W = put(e, P, 2, 'kc-wall', 0); const Hh = put(e, P, 2, 'kc-hit', 1);
  ok(e.isTide(S), 'Supreme Tide is a Tide unit'); ok(e.getTide() === null, 'no tide yet this round');
  ok(dealt(e, P, S.uid, W) === 7, `Supreme Tide: +2 Attack before the tide even turns (${5 + 2})`);
  S.slot = 1; e.syncSlots(P[1]); P[1].row.center = []; P[1].row.right = [S];
  ok(dealt(e, P, Hh.uid, S) === 3, 'and +2 Armor at the same time (5 -> 3)'); }
{ const {e, P} = mk(); e.startTide(); e.roundStart(P, 1, so, {}, []); e.roundStart(P, 2, so, {}, []); ok(e.getTide() === 'ebb', `Ebb (${e.getTide()})`);
  const S = put(e, P, 1, 'kc-stide', 0); const W = put(e, P, 2, 'kc-wall', 0); ok(dealt(e, P, S.uid, W) === 7, 'on an Ebb it still hits +2'); }
{ const bd = base['blue-dragon']; ok(bd && bd.effects.supremeTide && bd.effects.supreme, 'Blue Dragon has Supreme Tide'); }

// ---- 6. Brood
{ const {e, P} = mk(); const ev = []; e.debugSpawnCard(P, so, 1, 'kc-brood', 'left', {}, ev); const kids = all(P[1]).filter(c=> /~brood$/.test(c.defId));
  ok(kids.length === 2, `Brood 2: two brood tokens hatch (${kids.length})`); const d = e.derivedDefs[kids[0] && kids[0].defId];
  ok(d && d.name === 'Queen Ant Brood' && d.token && kids.every(k=> k.atk === 1 && k.maxHp === 1 && k.wait === 1), 'a 1/1 token, Wait 1, named "<Name> Brood"');
  ok(d && d.effects.swarm && !d.effects.brood && Object.keys(d.effects).length === 1 && (d.archetypes||[]).includes('Ants'), 'only Swarm, and the same type');
  ok(ev.some(x=> x.type==='spawn' && x.kind==='brood'), 'the hatch is logged as a spawn');
  const Q = byDef(P[1], 'kc-brood'); ok(e.swarmBonusOf(P, Q) === 2, `the brood count for the queen's Swarm (${e.swarmBonusOf(P, Q)})`);
  e.debugSpawnCard(P, so, 1, 'kc-ant', 'right', {}, []); ok(e.swarmBonusOf(P, byDef(P[1], 'kc-ant')) === 3, 'and for another Ant\'s'); }
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'kc-bfly', 'left', {}, []); const k = all(P[1]).find(c=> /~brood$/.test(c.defId)); const d = k && e.derivedDefs[k.defId];
  ok(d && d.effects.flying && d.effects.swarm && !d.effects.poison, 'a flying parent: its brood flies too (and has nothing else)'); }
{ const b = Object.keys(base).filter(id=> base[id].effects && base[id].effects.brood).sort(); ok(b.join() === 'carrion-fly-swarm,swarm-matriarch' /* 2026-10-15: your published Bee Drone has no Brood */, `Brood 1 on the rare swarms (${b})`);
  ok(b.every(id=> base[id].rarity === 'rare' && base[id].effects.brood === 1), 'all rare, Brood 1'); }

// ---- 7. Pack
{ const {e, P} = mk(); const A = put(e, P, 1, 'kc-wolf', 0), B = put(e, P, 1, 'kc-wolf', 1);
  ok(A.packChain === 2 && A.phaseAtk === 4 && A.maxHp === 14 && B.maxHp === 14, `two Pack 2 wolves side by side: +4/+4 each (${A.phaseAtk}, ${A.maxHp})`);
  const C = put(e, P, 1, 'kc-wolf', 2); ok(A.maxHp === 16 && C.maxHp === 16 && C.phaseAtk === 6 && A.packChain === 3, `three: +6/+6 each (${A.maxHp})`); }
{ const {e, P} = mk(); const A = put(e, P, 1, 'kc-wolf', 0), B = put(e, P, 1, 'kc-wolf4', 1); ok(A.phaseAtk === 6 && B.phaseAtk === 6, 'a chain sums its own Pack values: Pack 2 + Pack 4 = +6/+6'); }
{ const {e, P} = mk(); const A = put(e, P, 1, 'kc-wolf', 0); put(e, P, 1, 'kc-plain', 1); const C = put(e, P, 1, 'kc-wolf', 2);
  ok(!A.packChain && A.maxHp === 10 && C.maxHp === 10, 'a non-Pack unit between them breaks the chain'); }
{ const {e, P} = mk(); const A = put(e, P, 1, 'kc-wolf', 0); const C = put(e, P, 1, 'kc-wolf', 2); ok(!A.packChain, 'so does a gap'); }
{ const {e, P} = mk(); const A = put(e, P, 1, 'kc-wolf', 0), D = put(e, P, 1, 'kc-dog', 1); ok(!A.packChain && !D.packChain, 'Pack units of different types are no chain'); }
{ const {e, P} = mk(); const A = put(e, P, 1, 'kc-wolf', 0), B = put(e, P, 1, 'kc-wolf', 1); ok(A.maxHp === 14, 'before');
  e.damageCardFlat(B, 999, 'physical'); e.removeDeadCards(P, so, {}, {}, []); e.syncPhaseStats(P, so, []); ok(A.maxHp === 10 && A.hp === 10 && A.phaseAtk === 0, 'when the chain breaks, the bonus goes'); }
{ const {e, P} = mk(); const A = put(e, P, 1, 'kc-wolf', -3), B = put(e, P, 1, 'kc-wolf', 3); const L = put(e, P, 1, 'kc-lead', 0);
  ok(A.packChain === 3 && A.phaseAtk === 8 && B.phaseAtk === 8, `Pack Leader links wolves far apart: 2 + 2 + the leader's 2 + 2 for the type = +8/+8 (${A.phaseAtk})`);
  ok(L.phaseAtk === 8 && L.maxHp === 28, `the leader shares it (${L.phaseAtk}, ${L.maxHp})`); }
{ const {e, P} = mk(); const L = put(e, P, 1, 'kc-lead', 0); ok(!L.packChain && !L.phaseAtk, 'a leader with no pack of its type: nothing');
  const D = put(e, P, 1, 'kc-dog', 1), D2 = put(e, P, 1, 'kc-dog', 2); ok(D2.packChain === 2 && D.phaseAtk === 0 + 4 && !L.packChain, 'a Wolf leader does not help Dogs'); }
{ const {e, P} = mk(); const W1 = put(e, P, 1, 'kc-wolf', -3), D1 = put(e, P, 1, 'kc-dog', 3), D2 = put(e, P, 1, 'kc-dog', 5); const L = put(e, P, 1, 'kc-lead2', 0);
  ok(W1.phaseAtk === 6 && D1.phaseAtk === 8 && D2.phaseAtk === 8, `a Wolf-Dog leader leads two packs: the wolf +6, the dogs +8 (${W1.phaseAtk}, ${D1.phaseAtk})`);
  ok(L.phaseAtk === 14, `and is in both (${L.phaseAtk})`); }
{ const {e, P} = mk(); const A = put(e, P, 1, 'kc-wolf4', 0); put(e, P, 1, 'kc-wolf4', 1);
  let r = e.debugIrradiatePoint(A, 'pack'); ok(e.effectsOf(A).pack === 2 && r.what === 'value', `Irradiation: Pack 4 -> Pack 2 (${e.effectsOf(A).pack})`);
  r = e.debugIrradiatePoint(A, 'pack'); ok(!e.effectsOf(A).pack && r.what === 'removed', 'Pack 2 -> gone');
  e.syncPhaseStats(P, so, []); ok(!A.packChain, 'and with it, the chain'); }
{ // the AI puts a Pack card beside a Pack unit of its type
  const {e, P} = mk({}, 9); put(e, P, 2, 'kc-hit', 0); put(e, P, 2, 'kc-hit', 1); put(e, P, 2, 'kc-wolf', 2);
  ok(e.packPlacementFor(P[2], 'kc-wolf') === 3, `a Pack wolf goes beside the wolf (${e.packPlacementFor(P[2], 'kc-wolf')})`);
  ok(e.packPlacementFor(P[2], 'kc-dog') === null && e.packPlacementFor(P[2], 'kc-hit') === null, 'no preference for a Dog or a plain card');
  let beside = 0; for(let s = 1; s <= 20; s++){ const {e:e2, P:P2} = mk({}, s); put(e2, P2, 2, 'kc-hit', 0); put(e2, P2, 2, 'kc-wolf', -1);
    P2[2].hand = [{uid: 9001, defId:'kc-wolf'}]; P2[2].lumber = 10; e2.roundStart(P2, 1, so, {}, []); e2.aiTakeTurn(P2, so, 2, {}, []);
    const ws = all(P2[2]).filter(c=> c.defId==='kc-wolf'); if(ws.length === 2 && Math.abs(ws[0].slot - ws[1].slot) === 1) beside++; }
  ok(beside === 20, `the AI always plays it into the chain (${beside}/20)`); }
{ const src = fs.readFileSync(path.join(__dirname, '..', 'arena_app.js'), 'utf8');
  ok(/key:'packLeader'/.test(src) && /key:'wave'/.test(src) && /key:'brood'/.test(src) && /key:'supremeTide'/.test(src) && /key:'bloomWhen'/.test(src), 'every new skill is in the skill list');
  ok(/radSizzle\(/.test(src) && /geiger\(/.test(src), 'the Irradiation sounds exist'); }

console.log(fail ? `keywords-2026-10-14c: ${fail} failure(s)` : 'keywords-2026-10-14c: all passed');
process.exit(fail ? 1 : 0);
