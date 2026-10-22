#!/usr/bin/env node
// 2026-10-22 (package FX2, owner 14:12): one rounding, half up, where damage lands; Landslide 1 in 4 for 3; the volcano's hazards 1;
// the Goliath's pre-core attacks (Tentacles' smack 1, Tail Sweep 2; the Core's smack keeps 1–2).
//   "we shall do normal rounding. if x < 0.5, 0; else 1 ... Only round once, when it comes into fruition on the battlefield. Internal
//    calculations should never round. Even when passing numbers between functions."
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:3, health:500, wait:0, cost:0, effects: effects || {}}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'f2-wall': U('f2-wall', {}, {attack:0}), 'f2-hit3': U('f2-hit3'), 'f2-hit5': U('f2-hit5', {}, {attack:5}),
  'f2-fire3': U('f2-fire3', {}, {dmgType:'heat'}), 'f2-fire5': U('f2-fire5', {}, {attack:5, dmgType:'heat'}),
  'f2-res': U('f2-res', {}, {attack:0, resist:['physical']}), 'f2-heatres': U('f2-heatres', {}, {attack:0, resist:['heat']}),
  'f2-arm': U('f2-arm', {armor:1}, {attack:0}), 'f2-tide': U('f2-tide', {tide:true}, {attack:0}), 'f2-tideres': U('f2-tideres', {tide:true}, {attack:0, resist:['water']}),
  'f2-fly': U('f2-fly', {flying:true}, {attack:0}), 'f2-atheist': U('f2-atheist', {atheist:true}, {attack:0}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(rules, seed){ const e = E.makeSimEngine(defs, E.mulberry32(seed||7), {recordEvents:true, battleMode:'open', rules: rules || undefined}); return {e, P:{1:e.newPlayer(1, {}), 2:e.newPlayer(2, {})}}; }
function put(e, P, pid, id, slot){ const pl = P[pid]; e.debugSpawnCard(P, so, pid, id, 'left', {}, []);
  const c = all(pl).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot;
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncSlots(pl); return c; }
const eng = fs.readFileSync(path.join(__dirname, '..', 'bramblewood-engine.js'), 'utf8');
const grab = name=> { const i = eng.indexOf('  function ' + name + '('); const j = eng.indexOf('\n  function ', i + 10); return i < 0 ? '' : eng.slice(i, j); };

// ---- 1. the rounding itself: half up, under a half is nothing
{ const {e} = mk(); const r = e.roundDmg;
  const table = [[0, 0], [0.25, 0], [0.49, 0], [0.5, 1], [1, 1], [1.25, 1], [1.5, 2], [2.4, 2], [2.5, 3], [3.75, 4], [0.1 * 5, 1], [-1, 0], [NaN, 0]];
  ok(typeof r === 'function' && table.every(([x, y])=> r(x) === y), `1. roundDmg: ${table.map(([x])=> x + '→' + (r ? r(x) : '?')).join(' ')}`); }

// ---- 2. one apply step: Health goes down only in applyDamage, and the damage maths between never rounds
{ const cH = grab('computeHitDamage'), dc = grab('damageCard'), df = grab('damageCardFlat');
  ok(cH && !/Math\.(floor|ceil|round)\(/.test(cH.replace(/roundDmg\(/g, '')), '2. computeHitDamage rounds nothing (Resist, halvings, Shock, Rage, Armor are exact)');
  ok(dc && df && !/Math\.(floor|ceil|round)\(/.test(dc + df), '2. damageCard / damageCardFlat round nothing before applyDamage');
  ok(!/card\.hp = Math\.max\(0, card\.hp - /.test(dc + df) && /card\.hp = Math\.max\(0, card\.hp - dmg\)/.test(grab('applyDamage')), '2. only applyDamage lowers the unit\'s Health');
  ok(/const y = roundDmg\(x\)/.test(grab('applyDamage')), '2. applyDamage rounds once, first');
  ok(/amount = roundDmg\(amount\)/.test(grab('damageHQ')), '2. a bramble hit is rounded once, as it reaches damageHQ');
  ok(/function halveTimes\(amt, n\)\{ for\(let i = 0; i < n; i\+\+\) amt = amt \/ 2;/.test(eng) && /function rowShareOf\(n\)\{ return n > 0 \? n \* ROW_SWING_SHARE : n; \}/.test(eng), '2. halvings and the row share stay exact'); }

// ---- 3. what a hit lands for
const hitOn = (att, tgt, setup)=>{ const {e, P} = mk(); const t = put(e, P, 2, tgt, 0), A = put(e, P, 1, att, 0); if(setup) setup(A, t, e, P); const ev = []; e.debugAttack(P, so, A.uid, {}, ev); return {d: 500 - t.hp, ev}; };
{ const r = hitOn('f2-fire3', 'f2-heatres'); ok(r.d === 2, `3. a fire 3 into fire Resist is 1.5 and lands as 2 (was 1) (${r.d})`);
  const h = r.ev.find(x=> x.type === 'hit'); ok(h && h.dmg === 2 && Number.isInteger(h.dmg) && (h.mods || []).includes('resist'), `3. the hit event carries the rounded 2 and DN's resist mark (${h && h.dmg}, ${h && h.mods})`); }
{ const r = hitOn('f2-fire5', 'f2-heatres'); ok(r.d === 3, `3. a fire 5 into fire Resist: 2.5 lands as 3 (was 2) (${r.d})`); }
{ const r = hitOn('f2-hit3', 'f2-arm', (A, t)=>{ t.shocked = 2; }); ok(r.d === 4, `3. Shock then Armor: 3 × 1.5 = 4.5, less 1 Armor = 3.5, lands as 4 (was ceil 5 - 1 = 4; the same here) (${r.d})`); }
{ const r = hitOn('f2-hit5', 'f2-arm', (A, t)=>{ t.shocked = 2; }); ok(r.d === 7, `3. Shock then Armor: 5 × 1.5 = 7.5 - 1 = 6.5, lands as 7 (was ceil 8 - 1 = 7) (${r.d})`); }
{ const r = hitOn('f2-hit5', 'f2-wall', A=>{ A.staggered = 2; }); ok(r.d === 3, `3. a Staggered 5 swings for 2.5 and lands as 3 (was 2) (${r.d})`); }
{ const {e, P} = mk(); const t = put(e, P, 2, 'f2-wall', 0); e.damageCardFlat(t, 0.25, 'physical'); ok(t.hp === 500, `3. a quarter point lands as nothing (${t.hp})`);
  e.damageCardFlat(t, 0.5, 'physical'); ok(t.hp === 499, `3. half a point lands as 1 (${t.hp})`); }
{ const {e, P} = mk(); const t = put(e, P, 2, 'f2-atheist', 0); e.damageCardFlat(t, 1, 'magic'); ok(t.hp === 499, `3. Atheist halves a magic 1 to 0.5: lands as 1 (${500 - t.hp})`);
  e.damageCardFlat(t, 3, 'magic'); ok(t.hp === 497, `3. Atheist halves a magic 3 to 1.5: lands as 2 (was 1) (${499 - t.hp})`); }
{ const {e, P} = mk(); const t = put(e, P, 2, 'f2-wall', 0); t.tempHp = 1; e.damageCardFlat(t, 2.5, 'physical'); ok(t.hp === 498 && t.tempHp === 0, `3. the rounded 3 meets the Shell's 1 temporary Health first: 2 to Health (${t.hp}, temp ${t.tempHp})`); }

// ---- 4. Crushing Depths at the default 1 and at 5: one rounding (FX2 call FX2 answered)
{ const run = n=>{ const {e, P} = mk({crushingDepths: n}); const a = put(e, P, 1, 'f2-wall', 0), t = put(e, P, 1, 'f2-tide', 1), tr = put(e, P, 2, 'f2-tideres', 0);
    e.roundStart(P, 1, so, {}, []); e.roundStart(P, 2, so, {}, []); return [500 - a.hp, 500 - t.hp, 500 - tr.hp].join(); };
  ok(run(true) === '1,1,0', `4. Crushing Depths 1: anyone 1, a Swimmer 0.5 → 1, a water-resistant Swimmer 0.25 → 0 (${run(true)})`);
  ok(run(5) === '5,3,1', `4. Crushing Depths 5: 5, a Swimmer 2.5 → 3, a water-resistant Swimmer 1.25 → 1 (${run(5)})`); }

// ---- 5. Landslide 1 in 4 for 3; the volcano's hazards 1; a map's number capped at 5
{ const {e, P} = mk({landslide:100}); const a = put(e, P, 1, 'f2-wall', 0), f = put(e, P, 1, 'f2-fly', 1); e.roundStart(P, 1, so, {}, []); const ev = []; e.roundStart(P, 2, so, {}, ev);
  ok(a.hp === 497 && f.hp === 500, `5. Landslide: 3 to a grounded unit, none to a flyer (${a.hp}, ${f.hp})`);
  ok(ev.some(x=> x.field === 'landslide' && x.amount === 3), '5. the Landslide header says 3'); }
{ const {e, P} = mk({landslide:100, landslideDmg:9}); const a = put(e, P, 1, 'f2-wall', 0); e.roundStart(P, 1, so, {}, []); e.roundStart(P, 2, so, {}, []); ok(a.hp === 495, `5. a map's landslideDmg is capped at 5 (${500 - a.hp})`); }
{ let n = 0; const R = 4000; for(let s = 1; s <= R; s++){ const {e, P} = mk({landslide:true}, s); put(e, P, 1, 'f2-wall', 0); const ev = []; e.roundStart(P, 2, so, {}, ev); if(ev.some(x=> x.field === 'landslide')) n++; }
  const p = n / R; ok(Math.abs(p - 0.25) < 0.03 && p * 3 <= 1, `5. Landslide fires about 1 round in 4 (${(p * 100).toFixed(1)}%), so 3 a hit averages ${(p * 3).toFixed(2)} a round (at most 1)`); }
{ const one = rules=>{ const {e, P} = mk(Object.assign({volcano:'verylow', lavaTideChance:0, petrifyChance:0, eruptionChance:0}, rules)); const a = put(e, P, 1, 'f2-wall', 0); put(e, P, 2, 'f2-wall', 0); e.roundStart(P, 2, so, {}, []); return 500 - a.hp; };
  ok(one({lavaTideChance:100}) === 1, `5. Lava Tide at 100%: 1 (was 3) (${one({lavaTideChance:100})})`);
  ok(one({eruptionChance:100}) === 1, `5. Eruption at 100%: 1 to one unit a side (was 2) (${one({eruptionChance:100})})`);
  ok(one({eruptionChance:100, eruption:8}) === 5, `5. a map's eruption number is capped at 5 (${one({eruptionChance:100, eruption:8})})`); }
{ const {e, P} = mk({volcano:'verylow', lavaTideChance:0, petrifyChance:0, eruptionChance:100}); const a = put(e, P, 1, 'f2-wall', 0), h = put(e, P, 2, 'f2-heatres', 0);
  e.roundStart(P, 2, so, {}, []); // the eruption; comets from the next round
  const ev = []; e.roundStart(P, 3, so, {}, ev); const cs = ev.filter(x=> x.field === 'comet');
  ok(cs.length >= 2 && cs.every(x=> x.dmg === 1 && x.roll === 1), `5. comets: 1 to every unit (was 2–5; fire-resistant: 0.5 → 1) (${cs.map(x=> x.dmg)})`); }
{ const {e, P} = mk({eruption:1}); const a = put(e, P, 1, 'f2-wall', 0); put(e, P, 2, 'f2-wall', 0); e.roundStart(P, 2, so, {}, []); ok(a.hp === 499, `5. Scorched Ground 1 a round (${500 - a.hp})`); }

// ---- 6. the Goliath's attacks before the Core: the strongest AOE (the Tail Sweep) 2, the weaker (the Tentacles' smack) 1; the Core 1–2
{ const raid = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'canonical', 'raids.json'), 'utf8'))[0], pt = id=> raid.parts.find(p=> p.id === id).trench.attacks;
  ok(['left', 'right'].every(id=> pt(id).length === 1 && pt(id)[0].pattern === 'column' && pt(id)[0].dmg === 1 && pt(id)[0].dmgMin == null), '6. the Tentacles\' smack (row or column, AOE): 1');
  ok(pt('tail').length === 1 && pt('tail')[0].pattern === 'frontRow' && pt('tail')[0].dmg === 2, '6. the Tail Sweep (front row, AOE): 2');
  ok(pt('core')[0].dmgMin === 1 && pt('core')[0].dmg === 2, '6. the Core\'s smack keeps 1–2');
  ok(raid.parts.every(p=> (p.trench.attacks || []).every(a=> !['single', 'unit'].includes(a.pattern))), '6. no single-target boss attack in the pre-core fights (the owner: "there isn\'t")');
  ok(raid.parts.every(p=> (p.trench.attacks || []).every(a=> a.trenchDmg == null)) && raid.parts.find(p=> p.id === 'core').trench.castleHp === 300, '6. the classic trench uses the same numbers; its Core bramble is 300'); }

console.log(fail ? `fx2-2026-10-22: ${fail} of ${checks} failed` : `fx2-2026-10-22: all ${checks} passed`);
process.exit(fail ? 1 : 0);
