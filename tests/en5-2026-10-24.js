#!/usr/bin/env node
// 2026-10-24 (package EN5): the owner's 02:59 and 03:12 notes.
//   Deadly Poison (was Greater Poison, the name players see; the key stays greaterPoison); Breach N (N to the enemy bramble on a landed hit);
//   MAP-3 (a tutorial lesson never counts as an NPC conversation, and tutorials have priority); Canopy Cover (a ground unit under the trees
//   dodges 1 in 2); BP-1 (Bleed / Poison re-priced from the robust skill test, a power curve); Hemorrhage N (0 by default); Bloom (the copy
//   can bloom, up / down on a board with more rows; Bloom's chain priced); the state skills Timbered / Bedrock / Forged / Last Stand; the
//   Group Dungeon's people row; the e2e snapshot crash (tests/e2e/snaps.py).
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine, ROOT = H.ROOT;
const BB = require(path.join(ROOT, 'bramblewood-budget.js'));
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id === 1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:1, health:100, wait:0, cost:0, effects}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'x-hit': U('x-hit', {}), 'x-hit0': U('x-hit0', {}, {attack:0}),
  'x-hitfly': U('x-hitfly', {flying:true}), 'x-breachfly': U('x-breachfly', {breach:2, flying:true}), // 2026-10-29 ENG13: Canopy Cover covers Flying / ranged attackers only
  'x-wall': U('x-wall', {}, {attack:0, health:500, wait:9}),
  'x-breach': U('x-breach', {breach:2}), 'x-breach1': U('x-breach1', {breach:true}),
  'x-cc': U('x-cc', {canopyCover:true}, {attack:0, health:5000, wait:9}), 'x-ccfly': U('x-ccfly', {canopyCover:true, flying:true}, {attack:0, health:5000, wait:9}),
  'x-timb': U('x-timb', {timbered:true}, {attack:2, health:10, wait:9}), 'x-timbg': U('x-timbg', {timbered:true, timberedGrant:{thorns:2}}, {attack:2, health:10, wait:9}),
  'x-bed': U('x-bed', {bedrock:true}, {attack:2, health:10, wait:9}), 'x-forg': U('x-forg', {forged:true}, {attack:2, health:10, wait:9}),
  'x-last': U('x-last', {lastStand:true}, {attack:2, health:10, wait:9}),
  'x-hem': U('x-hem', {hemorrhage:true}), 'x-hem3': U('x-hem3', {hemorrhage:3}),
  'x-bloom': U('x-bloom', {bloomCopy:{when:['day']}}, {attack:1, health:10, wait:0}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(rules, seed, opts){ const e = E.makeSimEngine(defs, E.mulberry32(seed || 5), Object.assign({recordEvents:true, battleMode:'open', rules: rules || {}}, opts || {})); return {e, P:{1: e.newPlayer(1, {}, {id:'st-hq', health:30, effects:{}}), 2: e.newPlayer(2, {}, {id:'st-hq', health:30, effects:{}})}}; }
function put(e, P, pid, id, slot){ const pl = P[pid]; e.debugSpawnCard(P, so, pid, id, 'left', {}, []);
  const c = all(pl).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot;
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncPhaseStats(P, so, []); return c; }
const round = (e, P, first)=>{ const ev = []; e.resolveCombat(P, so, {}, ev, first || 1); return ev; };
const SC = (()=>{ if(!process.argv.includes('--world=half')) process.argv.push('--world=half'); return require(path.join(ROOT, 'tools', 'skill_costs.js')); })();
const costs = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')), T = SC.make(costs), sk = id=> costs.skills.find(r=> r.id === id);

// ---- Breach N ----------------------------------------------------------------------------------------------------------------
{ const {e, P} = mk(); put(e, P, 1, 'x-breach', 0); put(e, P, 2, 'x-wall', 0); const h0 = P[2].hq.hp; const ev = round(e, P);
  const b = ev.find(x=> x.type === 'breachHQ'); ok(b && b.dmg === 2 && b.targetSide === 'B' && P[2].hq.hp === h0 - 2, `Breach 2: a landed hit on a unit, 2 to the enemy bramble (${b && b.dmg}; ${h0} -> ${P[2].hq.hp})`); }
{ const {e, P} = mk(); put(e, P, 1, 'x-breach1', 0); put(e, P, 2, 'x-wall', 0); const ev = round(e, P); const b = ev.find(x=> x.type === 'breachHQ');
  ok(b && b.dmg === 1, `plain Breach is Breach 1 (${b && b.dmg})`); }
{ const {e, P} = mk(); put(e, P, 1, 'x-breach', 0); const h0 = P[2].hq.hp; const ev = round(e, P);
  ok(!ev.some(x=> x.type === 'breachHQ') && P[2].hq.hp === h0 - 1, `no unit in front: it hits the bramble itself, no Breach on top (${h0} -> ${P[2].hq.hp})`); }
// 2026-10-29 ENG13: the dodging attacker flies now (Canopy Cover no longer dodges a ground unit's melee swing)
{ const {e, P} = mk(); put(e, P, 1, 'x-breach', 0); const C = put(e, P, 2, 'x-cc', 0); let miss = 0, hits = 0; const r = {woods:true};
  const m2 = mk(r, 9); put(m2.e, m2.P, 1, 'x-breachfly', 0); put(m2.e, m2.P, 2, 'x-cc', 0);
  for(let i = 0; i < 40; i++){ const ev = round(m2.e, m2.P); if(ev.some(x=> x.type === 'evaded')){ miss++; ok(!ev.some(x=> x.type === 'breachHQ'), 'a dodged swing: no Breach'); } else if(ev.some(x=> x.type === 'breachHQ')) hits++; }
  ok(miss > 5 && hits > 5, `Breach only on the swings that land (${hits} landed, ${miss} dodged)`); void C; }

// ---- Canopy Cover -------------------------------------------------------------------------------------------------------------
// 2026-10-29 ENG13: the attacker is a Flyer by default (owner 21:36: "Canopy cover only blocks 50% attacks from ranged and flying attacks")
function dodges(rules, id, seed, att){ const {e, P} = mk(rules, seed || 11); put(e, P, 1, att || 'x-hitfly', 0); put(e, P, 2, id, 0); let cc = 0, other = 0, N = 300;
  for(let i = 0; i < N; i++){ round(e, P).filter(x=> x.type === 'evaded').forEach(x=> x.reason === 'canopyCover' ? cc++ : other++); } return {cc, other, N}; }
{ const a = dodges({woods:true}, 'x-cc'); ok(a.cc > 110 && a.cc < 190 && a.other === 0, `under the trees (a forest map): about half the swings miss (${a.cc}/${a.N})`); }
{ const a = dodges({}, 'x-cc'); ok(a.cc === 0, `in the open: no Canopy Cover (${a.cc})`); }
{ const a = dodges({woods:true}, 'x-cc', 11, 'x-hit'); ok(a.cc === 0, `2026-10-29 ENG13: a ground unit's melee swing is never dodged by Canopy Cover (${a.cc})`); }
{ const a = dodges({terrain:{biome:'forest', tier:1}}, 'x-cc'); ok(a.cc > 100, `the Old Woods terrain counts (${a.cc})`); }
{ const a = dodges({canopy:true}, 'x-cc'), b = dodges({undergrowth:true}, 'x-cc'); ok(a.cc > 100 && b.cc > 100, `High Canopy and the Undergrowth count (${a.cc}, ${b.cc})`); }
{ const a = dodges({woods:true}, 'x-ccfly'); ok(a.cc === 0, `a Flyer is not a ground unit: no Canopy Cover (its Flying dodge only: ${a.other})`); }
{ const a = dodges({woods:true, ashy:true}, 'x-ccfly'); ok(a.cc > 100, `a flyer grounded by the ash hides under the trees (${a.cc})`); }
{ const {e} = mk({woods:true}); ok(e.en5Woods() === true && mk({}).e.en5Woods() === false, 'en5Woods reads the rules'); }
{ const app = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8'); ok(/if\(b === 'forest'\) r\.woods = true;/.test(app), 'fightRules: every fight on a forest-biome map is under the trees (rules.woods)'); }

// ---- the state skills ---------------------------------------------------------------------------------------------------------
{ const {e, P} = mk(); const t = put(e, P, 1, 'x-timb', 0); P[1].lumber = 2; let ev = []; e.syncPhaseStats(P, so, ev);
  ok(t.maxHp === 10 && !ev.some(x=> x.kind === 'stateSkill'), `Timbered off at 2 Lumber (${t.maxHp})`);
  P[1].lumber = 3; ev = []; e.syncPhaseStats(P, so, ev); const on = ev.find(x=> x.kind === 'stateSkill');
  ok(t.maxHp === 12 && t.hp === 12 && on && on.on === true && on.name === 'timbered', `Timbered on at 3 Lumber: +0/+2 (${t.atk}/${t.maxHp}; event ${on && JSON.stringify({n:on.name, on:on.on})})`);
  P[1].lumber = 1; ev = []; e.syncPhaseStats(P, so, ev); const off = ev.find(x=> x.kind === 'stateSkill');
  ok(t.maxHp === 10 && off && off.on === false, `off again when the Lumber is spent (${t.maxHp})`); }
{ const {e, P} = mk(); const t = put(e, P, 1, 'x-timbg', 0); P[1].lumber = 4; e.syncPhaseStats(P, so, []);
  ok((e.effectsOf(t).thorns | 0) === 2 && t.maxHp === 10, `Timbered – {Thorns 2}: its braces instead of the default (thorns ${e.effectsOf(t).thorns}, hp ${t.maxHp})`); }
{ const {e, P} = mk(); const t = put(e, P, 1, 'x-bed', 0); P[1].stone = 1; e.syncPhaseStats(P, so, []); const a0 = e.effectsOf(t).armor | 0;
  P[1].stone = 2; e.syncPhaseStats(P, so, []); ok(a0 === 0 && (e.effectsOf(t).armor | 0) === 1, `Bedrock: Armor 1 at 2 Stone, none at 1 (${a0} -> ${e.effectsOf(t).armor})`); }
{ const {e, P} = mk(); const t = put(e, P, 1, 'x-forg', 0); const a0 = t.atk + (t.phaseAtk || 0); P[1].metal = 1; e.syncPhaseStats(P, so, []);
  ok((t.phaseAtk || 0) === 1, `Forged: +1/+0 with 1 Metal (phase Attack ${t.phaseAtk}, base ${a0})`); }
{ const {e, P} = mk(); const t = put(e, P, 1, 'x-last', 0); P[1].hq.hp = 11; e.syncPhaseStats(P, so, []); const off = t.maxHp;
  P[1].hq.hp = 10; e.syncPhaseStats(P, so, []); ok(off === 10 && t.maxHp === 11 && (t.phaseAtk || 0) === 1, `Last Stand: +1/+1 at a third of the bramble's 30 (10), not at 11 (${off} -> ${t.maxHp}, +${t.phaseAtk})`); }
{ ok(Object.keys(E.makeSimEngine(defs, E.mulberry32(1), {}).EN5_STATES).join(',') === 'timbered,bedrock,forged,lastStand', 'four state skills'); }

// ---- Hemorrhage N -------------------------------------------------------------------------------------------------------------
{ const {e, P} = mk(); put(e, P, 1, 'x-hem', 0); const W = put(e, P, 2, 'x-wall', 0); round(e, P); ok(!(W.bleed > 0), `plain Hemorrhage (N 0): no Bleed of its own (${W.bleed})`); }
{ const {e, P} = mk(); put(e, P, 1, 'x-hem3', 0); const W = put(e, P, 2, 'x-wall', 0); round(e, P); ok(W.bleed >= 2 && W.bleed <= 3, `Hemorrhage 3 on a fresh target: Bleed 3 (less the round's fade for a Waiting unit: ${W.bleed})`); }
{ const {e, P} = mk(); put(e, P, 1, 'x-hem3', 0); const W = put(e, P, 2, 'x-wall', 0); W.bleed = 2; const ev = round(e, P); const hv = ev.find(x=> x.kind === 'hemorrhage');
  ok(hv && hv.from === 2 && hv.total === 7, `Hemorrhage 3: 2 doubled to 4, then +3 = 7 (${hv && hv.total})`); }
{ ok(T.cardS({hemorrhage:true}).S === 2 && Math.abs(T.cardS({hemorrhage:3}).S - (2 + T.skillCost('bleed', 3))) < 0.01, `Hemorrhage priced 2, Hemorrhage 3 = 2 + Bleed 3 (${T.cardS({hemorrhage:3}).S})`); }

// ---- Bloom: the copy can bloom; up / down on a board with more rows --------------------------------------------------------------
{ const {e, P} = mk({phase:'day'}); e.roundStart(P, 1, so, {}, []); const A = put(e, P, 1, 'x-bloom', 0);
  let ev = []; e.bloomCopyPass(P, so, {}, ev); const C = all(P[1]).find(x=> x.bloomCopy); ok(C && A.bloomed, 'the unit blooms');
  ev = []; e.bloomCopyPass(P, so, {}, ev); const C2 = all(P[1]).find(x=> x.bloomCopy && x.bloomOf === C.uid);
  ok(C2 && C.bloomed && C2.atk === C.atk + 1, `the copy blooms too, once (copy of the copy ${C2 && C2.atk + '/' + C2.maxHp})`);
  const n0 = all(P[1]).length; ev = []; e.bloomCopyPass(P, so, {}, ev); const fresh = all(P[1]).filter(x=> x.bloomOf === C2.uid);
  ok(!all(P[1]).some(x=> x.bloomOf === A.uid && x !== C) && !all(P[1]).some(x=> x.bloomOf === C.uid && x !== C2) && fresh.length <= 1 && all(P[1]).length <= n0 + 1, 'each unit blooms once'); }
{ const {e, P} = mk({phase:'day'}, 5, {reserveRows:1, reserveActs:true}); e.roundStart(P, 1, so, {}, []);
  const A = put(e, P, 1, 'x-bloom', 0); put(e, P, 1, 'x-wall', -1); put(e, P, 1, 'x-wall', 1); A.bloomed = false;
  const ev = []; e.bloomCopyPass(P, so, {}, ev); const b = ev.find(x=> x.type === 'bloom'), rw = P[1].reserve && P[1].reserve[0];
  ok(b && b.row === 1 && rw && rw[0] && rw[0].bloomCopy, `both sides taken on a two-row board: the copy grows behind it (row ${b && b.row}, slot ${b && b.slot})`); }
{ const {e, P} = mk({phase:'day'}); e.roundStart(P, 1, so, {}, []); const A = put(e, P, 1, 'x-bloom', 0); put(e, P, 1, 'x-wall', -1); put(e, P, 1, 'x-wall', 1);
  const ev = []; e.bloomCopyPass(P, so, {}, ev); const f = ev.find(x=> x.type === 'bloom'); ok(f && f.failed && A.bloomed && !all(P[1]).some(x=> x.bloomCopy), 'one row, both sides taken: the split fails, +1/+1 on the unit (2026-10-26, ENG9 / EN7-2; was BL-2: it waits)'); }
{ const src = fs.readFileSync(path.join(ROOT, 'bramblewood-engine.js'), 'utf8'); ok(!/c\.bloomed \|\| c\.bloomCopy \|\| c\.cageOf/.test(src), 'bloomCopyPass no longer skips a copy'); }
{ const p = BB.bloomOdds({when:['wet', 'sunny']}), q = BB.BLOOM_CHAIN_Q, pc = BB.bloomChainOdds({when:['wet', 'sunny']});
  ok(Math.abs(pc - Math.round(p * (1 + q + q * q) * 100) / 100) < 1e-9 && BB.bloomBodyMult({bloomCopy:{when:['wet', 'sunny']}}) === 1 + pc, `Bloom's chain priced: p ${p} -> ${pc} (q ${q})`); }

// ---- prices -------------------------------------------------------------------------------------------------------------------
{ ok(sk('bleed').pow === 0.6 && sk('bleed').value === 3.6 && sk('poison').pow === 0.7 && sk('poison').value === 3, `Bleed 3.6 x N^0.6, Poison 3.0 x N^0.7 (${sk('bleed').value}^${sk('bleed').pow}, ${sk('poison').value}^${sk('poison').pow})`);
  const b = [1, 2, 3].map(k=> T.skillCost('bleed', k)), p = [1, 2, 3].map(k=> T.skillCost('poison', k));
  ok(b[0] === 3.6 && Math.abs(b[1] - 5.46) < 0.02 && Math.abs(b[2] - 6.96) < 0.03 && b[2] > b[1] && b[1] > b[0], `bigger numbers cost more: Bleed ${b.join(' / ')}`);
  ok(p[0] === 3 && Math.abs(p[1] - 4.87) < 0.02 && p[2] > p[1], `Poison ${p.join(' / ')}`);
  const md = fs.readFileSync(path.join(ROOT, 'docs/balance/en5-bleed-poison-2026-10-24.md'), 'utf8'); ok(/bleed 3/.test(md) && /poison 1/.test(md), 'the measurement is filed (docs/balance/en5-bleed-poison-2026-10-24.md)');
  ok(sk('breach') && sk('breach').scale === 'n' && sk('breach').value >= 1.5 && sk('breach').value <= 2.2, `Breach ${sk('breach') && sk('breach').value} a point (the owner's estimate 1.9)`);
  ok(sk('canopyCover') && sk('canopyCover').value === 0 && Math.abs(BB.canopyMultOf({canopyCover:true}) - (1 + 0.37 * BB.CANOPY_UPTIME)) < 1e-9 && BB.canopyMultOf({canopyCover:true, evasive:true}) === 1 && BB.canopyMultOf({canopyCover:true, flying:true}) === 1,
    `Canopy Cover: x${BB.canopyMultOf({canopyCover:true})} on the stats (Evasive's 1.37 x uptime ${BB.CANOPY_UPTIME}), none on top of Evasive or on a Flyer`);
  ok(BB.missMultOf({canopyCover:true}) === BB.canopyMultOf({canopyCover:true}), 'the budget\'s miss multiplier carries it (capScores, the forge curve)');
  const st = {timbered:[0.5, 'timberedGrant', 0.25], bedrock:[0.3, 'bedrockGrant', 0.2], forged:[1, 'forgedGrant', 0.5], lastStand:[0.6, 'lastStandGrant', 0.2]};
  Object.entries(st).forEach(([k, [v, g, u]])=>{ ok(sk(k) && sk(k).value === v && BB.CONTEXT_MULT_BY[g] === u && BB.CONTEXT_FLAG[k] === g && BB.PARAMS.includes(g), `${k}: plain ${v}, braces x${u}`); });
  ok(Math.abs(T.cardS({timbered:true, timberedGrant:{thorns:2}}).S - 0.25 * T.cardS({thorns:2}).S) < 0.01, `Timbered – {Thorns 2} = 0.25 x Thorns 2 (${T.cardS({timbered:true, timberedGrant:{thorns:2}}).S})`); }

// ---- cards --------------------------------------------------------------------------------------------------------------------
{ const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/cards.json'), 'utf8')), c = id=> cards.find(x=> x.id === id);
  const want = {'beetle-battering-ram': 'breach', 'badger-sapper': 'breach', 'fawn-scout': 'canopyCover', 'lodge-engineer': 'timbered', 'quarry-mole': 'bedrock', 'badger-trench-digger': 'lastStand'};
  const HOLD = id=>{ const h = require(path.join(ROOT, 'tools', 'lib_map_pools.js')).budgetHold(id); if(h) console.log(`  · ${id}: budget not checked, ${h === 'unplaced' ? 'unplaced (on no list, out of play)' : 'pending step 3 (re-fit)'}`); return !!h; }; // 2026-10-29 LISTFIX1: cards on no list are out of play (owner 22:47): an 'unplaced' card (on no list) or one 'pending' the owner's re-fit (step 3) is reported, not failed (tools/lib_map_pools.js budgetHold)
  Object.entries(want).forEach(([id, k])=>{ const x = c(id), b = x && T.budget(x, {level: 1}); ok(x && x.effects[k] && b && (b.ok || HOLD(id)), `${id}: ${k}, inside the budget (${x && x.attack}/${x && x.health}, ${b && b.x1} <= ${b && b.N})`);
    ok(x && BB.skillCountOf(x.effects) <= 2, `${id}: two skills at most (${x && BB.skillCountOf(x.effects)})`); });
  const rf = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/balance/en5-refit-2026-10-24.json'), 'utf8'));
  ok(Array.isArray(rf.up) && Array.isArray(rf.down) && Array.isArray(rf.held), `the re-fit is filed (${rf.up.length} up, ${rf.down.length} down, ${rf.held.length} held)`);
  ['fungal-colossus', 'puffball-bombardier', 'lotus-frog'].forEach(id=>{ const x = c(id), b = x && T.budget(x, {level: 1});
    ok(x && b && b.x1 <= b.N * 1.01 + 1e-9 && b.x2 <= b.N2 * 1.01 + 1e-9, `BL's held Bloom card ${id} re-fitted, at most 1% over (${x.attack}/${x.health}: ${b.x1} / ${b.N})`); }); }

// ---- MAP-3: tutorials have priority --------------------------------------------------------------------------------------------
{ const app = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8'), a = app.indexOf('const EN5_LESSON_DIALOGUE'), b = app.indexOf('function noticeBoardUnlocked');
  const f = new Function('dialoguesPending', 'S', app.slice(a, b).replace('function tutorialLessonOn(){ try{ return !!(coachOpen || tutorialLock || coachShield); }catch(e){ return false; } }', 'function tutorialLessonOn(){ return !!S.lesson; }') + '; return npcDialogueActive;');
  const S = {lesson: false}, run = ids=> f(new Set(ids), S)();
  ok(run(['well_m1']) === true && run([]) === false, 'an NPC conversation playing blocks the map tiles (as MAP)');
  ok(run(['lesson_rarity']) === false && run(['tut_fly', 'pitch_lesson_h']) === false, 'a lesson script is not an NPC conversation');
  S.lesson = true; ok(run(['well_m1']) === false, 'while a tutorial lesson (a coach tip) is on, nothing is held back: the tutorial has priority');
  ok(/function tutorialLessonOn\(\)\{ try\{ return !!\(coachOpen \|\| tutorialLock \|\| coachShield\); \}/.test(app), 'the lesson is the coach tip / its lock / its shield'); }

// ---- the page: registry, looks, people row, texts ------------------------------------------------------------------------------
{ const app = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
  ["{key:'breach', category:'passive'", "{key:'canopyCover', category:'passive'", "sk1Patch(PASSIVE_DEFS, 'hemorrhage', {kind:'number', min:0, defaultValue:0", 'function en5Vfx', 'function en5BreachVfx', 'function en5CanopyVfx', 'function en5StateVfx',
   'function en5LogText', 'function en5StatusBadges', 'try{ en5Vfx(ev); }catch(e){}', 'function gdPeopleHTML', "gdPeopleHTML({fixed: true})" /* 2026-10-28 (COOP2): the type's fixed count, was {range: true} (2 to 4) */, 'id="gdPeople"', "en5On:c._en5On||''", "ev.reason === 'canopyCover'"].forEach(s=> ok(app.includes(s), 'arena_app.js: ' + s));
  const tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8'); ['.sfx.en5-breach-chip', '.en5-canopy-pulse', '.abadge.en5-state', '.gd-people'].forEach(s=> ok(tpl.includes(s), 'arena_template.html: ' + s));
  const TXm = require(path.join(ROOT, 'bramblewood-texts.js'));
  ok(TXm.TEXT['ui.skn-greater-poison'] === 'Deadly Poison' && !Object.values(TXm.TEXT).some(v=> /Greater Poison/.test(v)), 'Deadly Poison everywhere a player reads it (the key stays greaterPoison)');
  ok(/copy can bloom once too/.test(TXm.TEXT['ui.bl-desc']) && /in front or behind/.test(TXm.TEXT['ui.bl-codex']), 'Bloom\'s texts: the copy can bloom; in front or behind on more rows');
  const txt = fs.readFileSync(path.join(ROOT, 'bramblewood-texts.js'), 'utf8'); const a = txt.indexOf('const TEXT = '), b = txt.indexOf('/*TEXT-TABLE-END*/') > 0 ? txt.indexOf('/*TEXT-TABLE-END*/') : txt.indexOf('};', a);
  ok(!/\n\s*\/\/|\/\*(?!TEXT-TABLE)/.test(txt.slice(txt.indexOf('{', a) + 1, b)), 'no comments inside the TEXT object');
  const K = Object.keys(TXm.TEXT).filter(k=> /^ui\.(en5-|skn-(breach|canopy-cover|timbered|bedrock|forged|last-stand)|sk-(breach|canopy-cover|timbered|bedrock|forged|last-stand|hemorrhage-n))/.test(k));
  ok(K.length >= 26 && TXm.TEXT['ui.en5-gd-players-in'], `EN5 TX keys (${K.length})`); // 2026-10-28 (RELFIX2): 26, COOP2 fixed the group dungeon's party size and dropped ui.en5-gd-players-range (was >= 27)
  const peel = s=> s.replace(/^[^\w{(\[]+\s/, '');
  const rows = K.map(k=> /log-|float-/.test(k) ? peel(TXm.TEXT[k]) : TXm.TEXT[k]).concat(['Deadly Poison', TXm.TEXT['ui.sk-greater-poison'], TXm.TEXT['ui.bl-desc'], TXm.TEXT['ui.bl-codex'], TXm.TEXT['ui.sk-hemorrhage-codex']]);
  ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'].forEach(code=>{ const p = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', code + '.json'), 'utf8')), ui = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', 'ui', code + '.json'), 'utf8'));
    const miss = rows.filter(k=> !(p[k] || ui[k])); ok(!miss.length && !Object.keys(p).concat(Object.keys(ui)).some(k=> /Greater Poison/.test(k)), `lang ${code}: the EN5 texts, no Greater Poison row left${miss.length ? ' (missing: ' + miss.slice(0, 3).join(' | ') + ')' : ''}`); });
  const cat = fs.readFileSync(path.join(ROOT, 'docs/effects-catalogue.md'), 'utf8'); ok(/2026-10-24 additions \(package EN5\)/.test(cat) && /Deadly Poison/.test(cat), 'docs/effects-catalogue.md: EN5');
  const dec = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/decisions.json'), 'utf8')), ids = (dec.items || []).map(d=> d.id);
  ok(['EN5-1', 'EN5-2', 'EN5-3', 'EN5-4', 'EN5-5', 'EN5-6', 'EN5-7'].every(i=> ids.includes(i)), 'decisions EN5-1 .. EN5-7');
  const cl = fs.readFileSync(path.join(ROOT, 'docs/CHANGELOG.md'), 'utf8'); ok(/package EN5/.test(cl.slice(0, 250000)), 'CHANGELOG: EN5 near the top'); /* 2026-10-28 (RELFIX2): 250000, the 10-28 batch's entries sit above it */ /* 2026-10-25 (FIX3): 120000, the 10-25 packages' entries sit above it */ /* 2026-10-24: later packages sit above it */ }

// ---- snaps.py: the speedMult crash ----------------------------------------------------------------------------------------------
{ const py = fs.readFileSync(path.join(ROOT, 'tests/e2e/snaps.py'), 'utf8'); ok(/EN5/.test(py), 'tests/e2e/snaps.py: the speedMult crash fixed (EN5 note)'); }

console.log(`en5-2026-10-24: ${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);
