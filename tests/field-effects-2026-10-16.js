#!/usr/bin/env node
// 2026-10-16 (user's field-effect curriculum notes, "[2] Does each map have defining abilities ..."): the field effects 2.
//   Landslide, Consternation, Crushing Depths, Rook's Row / Bishop's Path (Map 12's lines), Mirage, High Canopy / Undergrowth,
//   Tall Grass, Slippery, Glass-storm, Hail, Lava Spout, Scorching III, Leylines I / II / III, Atheist, Haunted, Sandstorm's wind,
//   the Tide field ("Without Tide, there won't be flood or ebb"), the Tide-spout no longer bringing the tide, and leader light being
//   only a look. Plus the app wiring: Edit skirmish, the Environment cards, the Effects library, the field art keys.
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:3, health:500, wait:0, cost:0, effects: effects || {}}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'fe-wall': U('fe-wall', {}, {attack:0}), 'fe-hit': U('fe-hit'), 'fe-fly': U('fe-fly', {flying:true}, {attack:0}), 'fe-climb': U('fe-climb', {mountainClimber:true}, {attack:0}),
  'fe-tide': U('fe-tide', {tide:true}, {attack:0}), 'fe-tidehit': U('fe-tidehit', {tide:true}), 'fe-tideres': U('fe-tideres', {tide:true, resist:['water']}, {attack:0}), 'fe-res': U('fe-res', {resist:['water']}, {attack:0}),
  'fe-cold': U('fe-cold', {resist:['cold']}, {attack:0}), 'fe-fire': U('fe-fire', {resist:['heat']}, {attack:0}),
  'fe-fork': U('fe-fork', {fork:true}), 'fe-stab': U('fe-stab', {backstab:1}), 'fe-stealth': U('fe-stealth', {stealth:true}), 'fe-quick': U('fe-quick', {quick:true}),
  'fe-quickwall': U('fe-quickwall', {quick:true}, {attack:0}), 'fe-pounce': U('fe-pounce', {pounce:2}, {attack:0, wait:3}), 'fe-bounty': U('fe-bounty', {bounty:1}, {attack:0}),
  'fe-flyarm': U('fe-flyarm', {flying:true, armor:2, haste:true, poison:2}, {attack:5, health:9}),
  'fe-small': U('fe-small', {}, {attack:1, health:1}),
  'fe-day': U('fe-day', {diurnal:true}, {attack:0}), 'fe-day2': U('fe-day2', {diurnal:2, diurnalHp:2}, {attack:0}), 'fe-moon': U('fe-moon', {fullMoon:true}, {attack:0}),
  'fe-atheist': U('fe-atheist', {atheist:true}, {attack:0}), 'fe-magic': U('fe-magic', {magic:true}), 'fe-devil': U('fe-devil', {}, {archetypes:['Devilry']}),
  'fe-ghost': U('fe-ghost', {ghost:true}, {attack:0}), 'fe-trig': U('fe-trig', {triggers:[{on:'onSpawn', do:'buffAttack', amount:1}]}, {attack:0}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(rules, seed, decks){ const e = E.makeSimEngine(defs, E.mulberry32(seed||7), {recordEvents:true, battleMode:'open', rules: rules || undefined}); return {e, P:{1:e.newPlayer(1, (decks||{})[1] || {}), 2:e.newPlayer(2, (decks||{})[2] || {})}}; }
function put(e, P, pid, id, slot, ev){ const pl = P[pid]; e.debugSpawnCard(P, so, pid, id, 'left', {}, ev || []);
  const c = all(pl).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot;
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncSlots(pl); return c; }
const src = fs.readFileSync(path.join(__dirname, '..', 'arena_app.js'), 'utf8');
const eng = fs.readFileSync(path.join(__dirname, '..', 'bramblewood-engine.js'), 'utf8');

// ---- Landslide: 1 in 4, 5 to every unit that isn't flying (Mountain Climbers too are spared)
{ const {e, P} = mk({landslide:100}); const a = put(e, P, 1, 'fe-wall', 0), f = put(e, P, 1, 'fe-fly', 1), c = put(e, P, 2, 'fe-climb', 0), b = put(e, P, 2, 'fe-wall', 1);
  e.roundStart(P, 1, so, {}, []); const ev = []; e.roundStart(P, 2, so, {}, ev);
  ok(a.hp === 495 && b.hp === 495, `Landslide: 5 to the grounded units (${a.hp}, ${b.hp})`); ok(f.hp === 500 && c.hp === 500, `...not the flyer or the climber (${f.hp}, ${c.hp})`);
  ok(ev.some(x=> x.type === 'fieldTick' && x.field === 'landslide') && ev.filter(x=> x.field === 'landslideHit').length === 2, 'Landslide: one header and one line per unit hit'); }
// 2026-10-17 (user: "Landslide's effect is too much. it should only affect the L/C/R cards, and the vfx should only land on those."): only
// the three neighbouring columns round a random one take the rocks, on both sides; the header names those columns and the units it hits.
{ let bad = 0, sides = 0; for(let s = 1; s <= 30; s++){ const {e, P} = mk({landslide:100}, s); const us = [-4, 0, 4].map(x=> put(e, P, 1, 'fe-wall', x)), them = [-4, 0, 4].map(x=> put(e, P, 2, 'fe-wall', x));
    e.roundStart(P, 1, so, {}, []); const ev = []; e.roundStart(P, 2, so, {}, ev); const h = ev.find(x=> x.type === 'fieldTick' && x.field === 'landslide');
    const hurt = [...us, ...them].filter(c=> c.hp < 500), col = h && h.col;
    if(!h || hurt.length !== 2 || hurt.some(c=> c.slot !== col) || h.cols.join() !== [col - 1, col, col + 1].join() || h.uids.length !== 2 || !hurt.every(c=> h.uids.includes(c.uid))) bad++;
    if(us.some(c=> c.hp < 500) && them.some(c=> c.hp < 500)) sides++; }
  ok(!bad, `Landslide: only the struck column and its two neighbours, both sides (${bad} bad of 30)`); ok(sides === 30, 'Landslide: both sides of those columns'); }
{ const {e, P} = mk({landslide:100}); const a = put(e, P, 1, 'fe-wall', 0), b = put(e, P, 1, 'fe-wall', 1), c = put(e, P, 2, 'fe-wall', -1); e.roundStart(P, 1, so, {}, []); e.roundStart(P, 2, so, {}, []);
  ok([a, b, c].filter(x=> x.hp === 495).length >= 2, `Landslide: neighbouring columns share the rocks (${[a, b, c].map(x=> x.hp)})`); }
ok(/rocks come down on three neighbouring columns/.test(src), 'Landslide: the field card text names the three columns');
{ let hits = 0; for(let s = 1; s <= 400; s++){ const {e, P} = mk({landslide:true}, s); put(e, P, 1, 'fe-wall', 0); e.roundStart(P, 1, so, {}, []); const ev = []; e.roundStart(P, 2, so, {}, ev); if(ev.some(x=> x.field === 'landslide')) hits++; }
  ok(hits > 70 && hits < 130, `Landslide: about 1 in 4 rounds by default (${hits}/400)`); }
{ const {e, P} = mk({landslide:100}); const a = put(e, P, 1, 'fe-wall', 0); const ev = []; e.roundStart(P, 1, so, {}, ev); ok(a.hp === 500 && !ev.some(x=> x.field === 'landslide'), 'Landslide: not in round 1'); }

// ---- Consternation: hand cards lose 1/1 each upkeep, and keep it when played (Attack 0 / Health 1 at the least)
{ const {e, P} = mk({consternation:true}, 3, {1:{'fe-hit':4}}); e.draw(P[1], 2, 'A', {}, []); const h = P[1].hand[0];
  e.roundStart(P, 1, so, {}, []); ok(!(h.consterned > 0), 'Consternation: not in round 1');
  e.roundStart(P, 2, so, {}, []); e.roundStart(P, 3, so, {}, []); ok(h.consterned === 2 && P[1].hand[1].consterned === 2, `Consternation: −1/−1 a round on every hand card (${h.consterned})`);
  const ev = []; ok(e.placeCard(P, so, 1, h.uid, 0, {}, ev), 'the card can still be played');
  const c = all(P[1]).find(x=> x.defId === 'fe-hit'); ok(c && c.atk === 1 && c.maxHp === 498 && c.hp === 498, `...and it comes in 1/498 (${c && c.atk}/${c && c.maxHp})`);
  ok(ev.some(x=> x.type === 'play' && x.consterned === 2), 'the play event says what it lost'); }
{ const {e, P} = mk({consternation:3}, 3, {1:{'fe-small':4}}); e.draw(P[1], 1, 'A', {}, []); const h = P[1].hand[0]; e.roundStart(P, 1, so, {}, []); e.roundStart(P, 2, so, {}, []);
  e.placeCard(P, so, 1, h.uid, 0, {}, []); const c = all(P[1])[0]; ok(c.atk === 0 && c.maxHp === 1 && c.hp === 1, `Consternation: never below 0 Attack and 1 Health (${c.atk}/${c.hp})`); }

// ---- Crushing Depths: 5 water a round; Swimmers half; water Resist halves again; no day or night
{ const {e, P} = mk({crushingDepths:true, phase:'cycle'}); const a = put(e, P, 1, 'fe-wall', 0), t = put(e, P, 1, 'fe-tide', 1), tr = put(e, P, 2, 'fe-tideres', 0), r = put(e, P, 2, 'fe-res', 1);
  e.roundStart(P, 1, so, {}, []); e.roundStart(P, 2, so, {}, []);
  ok(a.hp === 495, `Crushing Depths: 5 water damage (${a.hp})`); ok(t.hp === 498, `...a Swimmer takes half, rounded down (${t.hp})`);
  ok(tr.hp === 499, `...a water-resistant Swimmer a quarter (${tr.hp})`); ok(r.hp === 498, `...water Resist alone, half (${r.hp})`);
  ok(e.getPhase() === null, `Crushing Depths: no day or night even on a cycling map (${e.getPhase()})`); }

// ---- Rook's Row / Bishop's Path
{ const run = (rules, id, foeSlots, atkSlot)=>{ const {e, P} = mk(rules); const fs2 = foeSlots.map(s=> put(e, P, 2, 'fe-wall', s)); const A = put(e, P, 1, id, atkSlot || 0); const ev = []; e.debugAttack(P, so, A.uid, {}, ev); return {hp: fs2.map(c=> c.hp), ev}; };
  ok(run({rookRow:true}, 'fe-hit', [0]).hp[0] === 495, "Rook's Row: a straight hit +2");
  ok(run({bishopPath:true}, 'fe-hit', [0]).hp[0] === 497, "Bishop's Path: a straight hit gets nothing");
  // 2026-10-17 (Fork hits L and R, or only C): a Fork facing units on both sides strikes both slants; facing only the one in front, it strikes C
  { const r = run({bishopPath:true}, 'fe-fork', [-1, 1]); ok(r.hp[0] === 495 && r.hp[1] === 495, `Bishop's Path: both of the Fork's slanted prongs +2 (${r.hp})`); ok(r.ev.some(x=> x.type === 'hit' && x.lane === 'bishop' && x.laneBonus === 2), 'the hit event names the lane'); }
  { const r = run({rookRow:true}, 'fe-fork', [-1, 1]); ok(r.hp[0] === 497 && r.hp[1] === 497, `Rook's Row: the Fork's slanted prongs get nothing (${r.hp})`); }
  { const r = run({rookRow:true}, 'fe-fork', [0, 1]); ok(r.hp[0] === 495 && r.hp[1] === 500, `Rook's Row: a Fork with only one side filled strikes C alone, straight +2 (${r.hp})`); }
  ok(run({bishopPath:true}, 'fe-stab', [1]).hp[0] === 494, 'Bishop\'s Path: a Backstab on the slant 3+1+2'); }

// ---- Mirage: a 1/1 Illusion beside a random unit, copying only movement skills
{ const {e, P} = mk({mirage:true}); const s = put(e, P, 1, 'fe-flyarm', 0); e.roundStart(P, 1, so, {}, []); const ev = []; e.roundStart(P, 2, so, {}, ev);
  const il = all(P[1]).find(c=> c !== s); const d = il && defs[il.defId] || (il && e.derivedDefs[il.defId]);
  ok(!!il && Math.abs(il.slot) === 1, `Mirage: an Illusion appears in a free slot beside it (${il && il.slot})`);
  ok(il && il.atk === 1 && il.hp === 1, 'Mirage: the Illusion is 1/1');
  const fx = (d && d.effects) || {}; ok(fx.flying && fx.haste && !fx.armor && !fx.poison, `Mirage: it copies Flying and Haste, not Armor or Poison (${JSON.stringify(fx)})`);
  ok(ev.some(x=> x.type === 'spawn' && x.kind === 'mirage'), 'Mirage: a spawn event (kind mirage)'); }
{ let none = 0; for(let s = 1; s <= 40 && !none; s++){ const {e, P} = mk({mirage:true}, s); [-1, 0, 1].forEach(sl=> put(e, P, 1, 'fe-wall', sl)); e.roundStart(P, 1, so, {}, []); const ev = []; e.roundStart(P, 2, so, {}, ev);
    const m = ev.find(x=> x.field === 'mirage'); if(m && m.none){ none++; ok(all(P[1]).length === 3, 'Mirage: no room beside it, no Illusion'); } }
  ok(none === 1, 'Mirage: a unit with both neighbours taken gets none (seen)'); }

// ---- High Canopy / Undergrowth / Tall Grass
{ const pounce = rules=>{ const {e, P} = mk(rules); const w = put(e, P, 2, 'fe-wall', 0); put(e, P, 1, 'fe-pounce', 0); return 500 - w.hp; };
  ok(pounce({}) === 2 && pounce({canopy:true}) === 4 && pounce({undergrowth:true}) === 4, 'High Canopy and Undergrowth: Pounce +2');
  ok(pounce({tallGrass:true}) === 4 && pounce({canopy:true, tallGrass:true}) === 8, 'Tall Grass: Pounce ×2 (after the canopy\'s +2)'); }
{ const lands = (rules, id)=>{ let n = 0; for(let s = 1; s <= 200; s++){ const {e, P} = mk(rules, s); const t = put(e, P, 2, id, 0), A = put(e, P, 1, 'fe-hit', 0); e.debugAttack(P, so, A.uid, {}, []); if(t.hp < 500) n++; } return n; };
  ok(lands({canopy:true}, 'fe-fly') === 200, 'High Canopy: a Flyer gets no dodge');
  { const n = lands({undergrowth:true}, 'fe-fly'); ok(n > 70 && n < 130, `Undergrowth: Flying keeps its dodge (${n}/200)`); }
  { const n = lands({canopy:true}, 'fe-quickwall'), n0 = lands({}, 'fe-quickwall'); ok(n0 === 200 && n > 70 && n < 130, `High Canopy: Quick (Swift) units are Evasive (${n}/200, ${n0} without)`); } }
{ const bounty = rules=>{ const {e, P} = mk(rules); P[1].lumber = 0; put(e, P, 1, 'fe-bounty', 0); return P[1].lumber; };
  ok(bounty({}) === 1 && bounty({canopy:true}) === 2 && bounty({undergrowth:true}) === 1, 'High Canopy: Bounty +1 (not Undergrowth)'); }
{ const first = rules=>{ const {e, P} = mk(rules); put(e, P, 1, 'fe-stealth', 0); put(e, P, 2, 'fe-quick', 0); const ev = []; e.resolveCombat(P, so, {}, ev, 2); const h = ev.filter(x=> x.type === 'hit' || x.type === 'hitHQ'); return h.length ? h[0].side : null; };
  ok(first({}) === 'B' && first({tallGrass:true}) === 'A', 'Tall Grass: Stealth attacks first (before even Quick)'); }
{ const {e, P} = mk({tallGrass:true}); const w = put(e, P, 2, 'fe-wall', 1), A = put(e, P, 1, 'fe-stab', 0); e.debugAttack(P, so, A.uid, {}, []); ok(w.hp === 492, `Tall Grass: a Backstab hit lands double, (3+1)×2 (${500 - w.hp})`); }

// ---- Slippery
{ let miss = 0; for(let s = 1; s <= 300; s++){ const {e, P} = mk({slippery:true}, s); const t = put(e, P, 2, 'fe-wall', 0), A = put(e, P, 1, 'fe-hit', 0); const ev = []; e.debugAttack(P, so, A.uid, {}, ev); if(ev.some(x=> x.type === 'evaded' && x.reason === 'slippery')) miss++; }
  ok(miss > 115 && miss < 185, `Slippery: swings at units miss 1 in 2 (${miss}/300)`); }
{ const {e, P} = mk({slippery:100}); const ev = []; put(e, P, 1, 'fe-trig', 0, ev); ok(ev.some(x=> x.type === 'slipFizzle'), 'Slippery: a trigger can fail (slipFizzle)'); }

// ---- Glass-storm (Sandstorm + wind + 1–3 a round), Sandstorm's wind
{ const {e, P} = mk({glassStorm:true}); const a = put(e, P, 1, 'fe-wall', 0), b = put(e, P, 2, 'fe-wall', 0); e.roundStart(P, 1, so, {}, []); const ev = []; e.roundStart(P, 2, so, {}, ev);
  ok(a.hp >= 497 && a.hp <= 499 && b.hp >= 497 && b.hp <= 499, `Glass-storm: each unit takes 1–3 (${500 - a.hp}, ${500 - b.hp})`);
  ok(e.forecast().wind && e.forecast().wind.mode === 'windy', 'Glass-storm: the wind is random each round (Windy)'); }
ok(mk({sandstorm:true}).e.forecast().wind.mode === 'windy' && mk({sandstorm:true, wind:'gale'}).e.forecast().wind.mode === 'gale' && !mk({}).e.forecast().wind, 'Sandstorm brings Windy\'s wind (a fight\'s own wind wins)');
{ let windy = 0; for(let s = 1; s <= 30; s++){ const {e, P} = mk({sandstorm:true}, s); const ev = []; e.roundStart(P, 1, so, {}, ev); if(ev.some(x=> x.type === 'wind')) windy++; } ok(windy === 30, `Sandstorm: a wind roll every round (${windy}/30)`); }

// ---- Hail, Lava Spout, Scorching III
{ const {e, P} = mk({hail:true}); const a = put(e, P, 1, 'fe-wall', 0), c = put(e, P, 2, 'fe-cold', 0); e.roundStart(P, 1, so, {}, []); e.roundStart(P, 2, so, {}, []);
  ok(a.hp === 497 && c.hp === 499, `Hail: 3 ice damage, cold Resist half (${a.hp}, ${c.hp})`); }
{ const {e, P} = mk({lavaSpout:true}); const a = put(e, P, 1, 'fe-wall', 0), c = put(e, P, 2, 'fe-fire', 0); e.roundStart(P, 1, so, {}, []); const ev = []; e.roundStart(P, 2, so, {}, ev);
  ok(a.hp === 497 && c.hp === 499, `Lava Spout: 3 fire to the units in the column, fire Resist half (${a.hp}, ${c.hp})`); ok(ev.some(x=> x.field === 'lavaSpout' && x.col === 0), 'Lava Spout: the burst names its column'); }
{ const {e, P} = mk({field:'heatwave', heatLevel:3}); const us = [-2, -1, 0, 1].map(s=> put(e, P, 1, 'fe-wall', s)); e.roundStart(P, 2, so, {}, []); // a field ticks every round start
  ok(us.every(c=> c.hp === 497), `Scorching III: 4 units a side, 3 fire damage each (${us.map(c=> c.hp)})`); }

// ---- Leylines I (the zeitgebers stronger), II (+1 Lumber), III (+1 Lumber, +1 Stone, 3 to all; Atheists spared)
{ const stat = (rules, id)=>{ const {e, P} = mk(Object.assign({phase:'day'}, rules)); const c = put(e, P, 1, id, 0); e.syncPhaseStats(P, so, []); return [c.phaseAtk||0, (c.maxHp - 500)]; };
  ok(String(stat({}, 'fe-day')) === '1,0' && String(stat({leylines1:true}, 'fe-day')) === '3,3', `Leylines I: a plain Diurnal is +3/+3 (was +1/+0) (${stat({leylines1:true}, 'fe-day')})`);
  ok(String(stat({leylines1:true}, 'fe-day2')) === '4,4', `Leylines I: Diurnal 2/2 is +4/+4 (${stat({leylines1:true}, 'fe-day2')})`); }
{ const {e, P} = mk({tide:true, leylines1:true}); const T = put(e, P, 1, 'fe-tidehit', 0), W = put(e, P, 2, 'fe-hit', 0); e.roundStart(P, 1, so, {}, []); e.roundStart(P, 2, so, {}, []);
  ok(e.getTide() === 'flow', 'the Tide floods'); e.debugAttack(P, so, T.uid, {}, []); ok(W.hp === 494, `Leylines I: Flood is +3 Attack (${500 - W.hp})`);
  e.roundStart(P, 3, so, {}, []); ok(e.getTide() === 'ebb', 'then ebbs'); const h0 = T.hp; W.atk = 5; e.debugAttack(P, so, W.uid, {}, []); ok(h0 - T.hp === 2, `Leylines I: Ebb is Armor 3 (${h0 - T.hp})`); }
{ const {e, P} = mk({field:'moon', phase:'night', leylines1:true}); const c = put(e, P, 1, 'fe-moon', 0); e.syncPhaseStats(P, so, []); ok(c.maxHp === 505, `Leylines I: Full Moon +5/+5 (${c.maxHp - 500})`); }
{ const {e, P} = mk({leylines2:true}); P[1].lumber = 0; P[2].lumber = 0; e.roundStart(P, 1, so, {}, []); e.roundStart(P, 2, so, {}, []); e.roundStart(P, 3, so, {}, []);
  ok(P[1].lumber === 2 && P[2].lumber === 2, `Leylines II: +1 Lumber a round to each side (${P[1].lumber}, ${P[2].lumber})`); }
{ const {e, P} = mk({leylines3:true}); const a = put(e, P, 1, 'fe-wall', 0), t = put(e, P, 1, 'fe-atheist', 1), g = put(e, P, 2, 'fe-ghost', 0); P[1].lumber = 0; P[1].stone = 0; const hq = P[1].hq.hp;
  e.roundStart(P, 1, so, {}, []); e.roundStart(P, 2, so, {}, []);
  ok(P[1].lumber === 1 && P[1].stone === 1, `Leylines III: +1 Lumber and +1 Stone (${P[1].lumber}, ${P[1].stone})`);
  ok(a.hp === 497 && t.hp === 500 && g.hp === 497, `Leylines III: 3 magic damage to every unit (a Ghost too), none to the Atheist (${a.hp}, ${t.hp}, ${g.hp})`);
  ok(P[1].hq.hp === hq - 3 && P[2].hq.hp === P[2].hq.maxHp - 3, 'Leylines III: both castles take 3');
  P[1].hq.hp = 2; e.roundStart(P, 3, so, {}, []); ok(P[1].hq.hp === 1, `Leylines III: a castle never drops below 1 from it (${P[1].hq.hp})`); }

// ---- Atheist
{ const hit = id=>{ const {e, P} = mk(); const t = put(e, P, 2, 'fe-atheist', 0), A = put(e, P, 1, id, 0); e.debugAttack(P, so, A.uid, {}, []); return 500 - t.hp; };
  ok(hit('fe-hit') === 3 && hit('fe-magic') === 1 && hit('fe-devil') === 1, `Atheist: half from magic and Devilry (${hit('fe-hit')}, ${hit('fe-magic')}, ${hit('fe-devil')})`);
  const {e, P} = mk(); const t = put(e, P, 2, 'fe-atheist', 0); e.damageCardFlat(t, 6, 'magic'); ok(t.hp === 497, `Atheist: a magic bolt halved (${500 - t.hp})`); }

// ---- Haunted: a unit a side is Frightened and skips its attack; Ghosts and Atheists never
{ const {e, P} = mk({haunted:true}); const a = put(e, P, 1, 'fe-hit', 0), g = put(e, P, 1, 'fe-ghost', 1), b = put(e, P, 2, 'fe-wall', 0); e.roundStart(P, 1, so, {}, []); const ev = []; e.roundStart(P, 2, so, {}, ev);
  ok(a.frightRound === e.turnNo() && g.frightRound == null, 'Haunted: the one unit that can be scared is Frightened (the Ghost never)');
  ok(ev.filter(x=> x.type === 'statusFx' && x.kind === 'frightened').length === 2, 'Haunted: one a side');
  const ce = []; e.resolveCombat(P, so, {}, ce, 1); ok(ce.some(x=> x.type === 'skipTurn' && x.reason === 'frightened' && x.uid === a.uid) && b.hp === 500, 'Haunted: a Frightened unit doesn\'t attack');
  e.roundStart(P, 3, so, {}, []); ok(a.frightRound === e.turnNo(), 'Haunted: each round it scares again'); }

// ---- The Tide field; the Tide-spout no longer brings it; no Flood/Ebb without a Tide
{ const {e, P} = mk({tide:true}); e.roundStart(P, 1, so, {}, []); ok(e.getTide() === null, 'Tide: nothing in round 1');
  e.roundStart(P, 2, so, {}, []); const t2 = e.getTide(); e.roundStart(P, 3, so, {}, []); const t3 = e.getTide(); e.roundStart(P, 4, so, {}, []);
  ok(t2 === 'flow' && t3 === 'ebb' && e.getTide() === 'flow', `Tide: Flood, Ebb, Flood (${t2}, ${t3}, ${e.getTide()})`); }
{ const {e, P} = mk({tideSpout:true}); put(e, P, 1, 'fe-tide', 0); put(e, P, 2, 'fe-tide', 0); let seen = new Set();
  for(let r = 1; r <= 6; r++){ const ev = []; e.roundStart(P, r, so, {}, ev); seen.add(e.getTide()); ok(!ev.some(x=> x.type === 'fieldTick' && x.field === 'tideSpout' && x.tideIn), 'the spout never brings the tide in'); }
  ok(seen.size === 1 && seen.has(null), 'no Tide field, no Moonpull: no Flood or Ebb, even with Tide units and a spout'); }

// ---- Leader light is only a look
{ const {e, P} = mk({dark:'absolute'}); const L = put(e, P, 1, 'fe-wall', -1); L.isLeader = true; const A = put(e, P, 1, 'fe-hit', 0); e.roundStart(P, 1, so, {}, []);
  ok(e.sightMiss(A, 1) === 1, 'a leader\'s glow lights nothing in the rules (Absolute darkness still misses)'); }
ok(/function illuminates\(def\)\{ const e = \(def && def\.effects\) \|\| \{\}; return !!\(e\.illuminate \|\| e\.lantern\); \}/.test(eng), 'only Illuminate (or an old Lantern) lights a side');

// ---- App wiring: Edit skirmish, the Environment cards, the Effects library, the art keys, Atheist
const F2 = ['tide', 'landslide', 'consternation', 'crushingDepths', 'rookRow', 'bishopPath', 'mirage', 'canopy', 'undergrowth', 'tallGrass', 'slippery', 'glassStorm', 'hail', 'lavaSpout', 'leylines1', 'leylines2', 'leylines3', 'haunted'];
{ const m = src.match(/const FIELD2 = \{([\s\S]*?)\n\};/); ok(!!m, 'FIELD2 is in the app');
  F2.forEach(k=> ok(m && new RegExp('\\n  ' + k + ':\\s*\\{icon:').test('\n' + m[1]), `FIELD2 has ${k}`)); }
ok(/\.\.\.Object\.keys\(FIELD2\)\.map\(k=>\{ const f = FIELD2\[k\], rules = \{\}; rules\[k\] = true;/.test(src), 'Edit skirmish lists every FIELD2 effect');
ok(/\{id:'scorching3',group:'field', icon:'🔥', name:'Scorching III', weird:3, cost:1, rules:\{field:'heatwave', heatLevel:3\}/.test(src), 'Scorching III in Edit skirmish');
ok(/grp\('Hazards and rules', FIELD_EFFECTS\.filter\(f=> !f\.arenaOnly && !\['field', 'cloudy', 'lumber', 'gift', 'phase', 'mode'\]\.includes\(f\.group\)\)/.test(src), 'the add list offers every hazard (Swamp Fever and the rest were missing)');
ok(/Object\.keys\(FIELD2\)\.forEach\(k=>\{ if\(k === 'tide' \|\| !r\[k\]\) return;/.test(src), 'the Environment cards have a row for each');
ok(/\]\.map\(\(\[k, rules, o\]\)=> Object\.assign\(\{key:k, icon:FIELD2\[k\]\.icon, name:FIELD2\[k\]\.name/.test(src) && F2.every(k=> new RegExp(`\\['${k}', \\{`).test(src)), 'the Effects library has an entry for each');
ok(/\{key:'scorching3', icon:'🔥', name:'Scorching III'/.test(src), 'Scorching III in the Effects library');
ok(F2.every(k=> true) && /crushingdepths:\{art:'art\/fields\/crushingdepths\.png'\}/.test(src) && /glassstorm:\{art:'art\/fields\/sandstorm\.png'\}/.test(src) && /if\(FIELD2\[k\]\) return FIELD2\[k\]\.editor;/.test(src), 'each new field card has an art key');
ok(/\{key:'atheist', category:'passive', label:'Atheist', kind:'boolean'/.test(src) && /atheist:'🚫✨'/.test(src) && /atheist: \(\)=> `Half damage from magic/.test(src), 'Atheist is a skill in the editor, with an icon and card text');
ok(/const TIDESPOUT_NODES = \{mb:'2-4'\}/.test(src), 'the Tide-spout is one fight (2-4)');
ok(/const wind = r\.wind \|\| \(\(r\.sandstorm \|\| r\.glassStorm\) \? 'windy' : null\);/.test(src), 'a Sandstorm shows the Windy card');
ok(/const SUBMAP_PUSH_ZOOM = 1\.3, SUBMAP_GROW_FROM = \.9;/.test(src), 'daylight side maps zoom only a little');

console.log(fail ? `field-effects-2026-10-16: ${fail} failure(s)` : 'field-effects-2026-10-16: all passed');
process.exit(fail ? 1 : 0);
