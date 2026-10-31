#!/usr/bin/env node
// Package ENG15 (2026-10-31, owner 10-31 09:22 / 10:17 / 14:24 / 15:39 / 18:09; coordinator calls in docs/action-items.md):
//   FF4  True Sight (was Keen Eye, key keenEye kept): sees and hits Invisible units, lifts fog; no +2 against a Changeling.
//   FF5  Bloom: the original tries every Ready round (never spent, no +1/+1 on a fail); copies are tokens with no Bloom and the parent's Wait.
//   FF6  Cower N: while cowering, +N Armor (statusFx cower {mode:'armor', armor}); c.cowering lights the pip.
//   Z6   Poison skips the Shield: a Poison tick passes Bolster, Shell's temporary Health and the Shield.
//   Y3   Bola lifts Flying and Evasive dodges; Lasso N (once, its first Ready round): both ends tied until one dies; 'lassoed' is a held status.
//   Y2   Anadromous: sea (Tide + salty) +1/+1 and Tide; fresh (Tide, not salty) a 1/1 Tide Fry on death; dry (no Tide) +0/+1. Priced 1.4.
//   Y7   Mini-bosses open with +2 cards (elite and champion stay +1).
//   Z5   Pounce reaches only the enemies facing it or beside it (left, centre, right), else the bramble.
//   BB4  Swarm <Type>: the editor offers a picked type that is not in ARCHETYPE_ICON, so a Save keeps it.
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine, ROOT = path.join(__dirname, '..');
const app = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const eng = fs.readFileSync(path.join(ROOT, 'bramblewood-engine.js'), 'utf8');
const T = require(path.join(ROOT, 'bramblewood-texts.js')).TEXT;
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } else console.log('  ✓', m); };
const so = id=> id === 1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:1, health:20, wait:0, cost:0, effects}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'x-wall': U('x-wall', {}, {attack:0, health:5000, wait:9}),
  'x-eye': U('x-eye', {keenEye:true}, {attack:3, health:200}), 'x-plain': U('x-plain', {}, {attack:3, health:200}),
  'x-ghost': U('x-ghost', {invisible:5}, {attack:0, health:200, wait:9}),
  'x-bloom': U('x-bloom', {bloomCopy:{when:['kill']}}, {attack:2, health:6, wait:2}),
  'x-cower': U('x-cower', {cower:2}, {attack:0, health:200}), 'x-hitter': U('x-hitter', {}, {attack:3, health:200}),
  'x-fly': U('x-fly', {flying:true, evasive:true}, {attack:0, health:5000, wait:9}),
  'x-lasso': U('x-lasso', {lasso:1}, {attack:2, health:40}),
  'x-salmon': U('x-salmon', {anadromous:true}, {attack:2, health:5}),
  'x-pounce': U('x-pounce', {pounce:3}, {attack:1, health:20}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(rules, seed){ const e = E.makeSimEngine(defs, E.mulberry32(seed || 5), {recordEvents:true, battleMode:'open', rules: rules || {}});
  return {e, P:{1: e.newPlayer(1, {}, {id:'st-hq', health:500, effects:{}}), 2: e.newPlayer(2, {}, {id:'st-hq', health:500, effects:{}})}}; }
function put(e, P, pid, id, slot){ const pl = P[pid]; e.debugSpawnCard(P, so, pid, id, 'left', {}, []);
  const c = all(pl).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot;
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncPhaseStats(P, so, []); return c; }
const round = (e, P, first)=>{ const ev = []; e.resolveCombat(P, so, {}, ev, first || 1); return ev; };
const upkeep = (e, P)=>{ const ev = []; e.endOfRoundUpkeep(P, so, {}, ev); return ev; };

// ---- FF4 True Sight ---------------------------------------------------------------------------------------------------------------------
{ const {e, P} = mk(); const a = put(e, P, 1, 'x-eye', 0), g = put(e, P, 2, 'x-ghost', 0);
  const ev = round(e, P, 1); ok(ev.some(x=> x.type === 'hit' && x.attUid === a.uid && x.targetUid === g.uid) && g.hp < 200, `a True Sight unit finds and hits an Invisible unit (${g.hp})`); }
{ const {e, P} = mk(); const a = put(e, P, 1, 'x-plain', 0), g = put(e, P, 2, 'x-ghost', 0);
  const ev = round(e, P, 1); ok(!ev.some(x=> x.type === 'hit' && x.attUid === a.uid && x.targetUid === g.uid) && g.hp === 200, 'a plain unit still can\'t'); }
{ const {e, P} = mk(); const a = put(e, P, 1, 'x-eye', 0); const ch = put(e, P, 2, 'puddle-changeling', 0), pl = put(e, P, 2, 'x-plain', 1);
  ok(e.damageCard(ch, 3, 'physical', a).dmg === e.damageCard(pl, 3, 'physical', a).dmg, 'no +2 against a Changeling any more'); }
ok(/const FOG_REVEAL_KEYS = \['darksight', 'keenEye'/.test(eng), 'True Sight still lifts the fog (FOG_REVEAL_KEYS keenEye)');
ok(T['ui.skn-eng15-true-sight'] === 'True Sight' && app.includes("{key:'keenEye', category:'passive', label:TX('ui.skn-eng15-true-sight')") && !/Keen Eye/.test(T['ui.fx-fog-of-war'] + T['ui.fxx-fog-of-war'] + T['ui.fog-hidden-tip']), 'the player text reads True Sight (the key stays keenEye)');

// ---- FF5 Bloom ----------------------------------------------------------------------------------------------------------------------------
{ const {e, P} = mk(); const b = put(e, P, 1, 'x-bloom', 0); b.wait = 0; b.bloomKill = true;
  const ev1 = []; e.bloomCopyPass(P, so, {}, ev1); const c1 = all(P[1]).find(x=> x.bloomCopy);
  ok(!!c1 && c1.token === true && c1.bloomOf === b.uid, 'a Ready original with its conditions met grows a copy, a token');
  ok(c1 && c1.wait === 2, `the copy arrives with the parent's Wait (${c1 && c1.wait})`);
  ok(!b.bloomed && b.atk === 2, 'the original is not spent and gains nothing');
  c1.wait = 0; c1.bloomKill = true;
  const ev2 = []; e.bloomCopyPass(P, so, {}, ev2); const copies = all(P[1]).filter(x=> x.bloomCopy);
  ok(copies.length === 2 && copies.every(x=> x.bloomOf === b.uid), `the next Ready round the original blooms again (into its other side); the copy has no Bloom (${copies.length} copies)`);
  const before = [b.atk, b.maxHp], ev3 = []; e.bloomCopyPass(P, so, {}, ev3);
  ok(all(P[1]).filter(x=> x.bloomCopy).length === 2 && b.atk === before[0] && b.maxHp === before[1] && !ev3.some(x=> x.type === 'bloom'), 'no room: nothing happens (no +1/+1, no event); it tries again next round'); }
ok(/rc\.hp = \(rc\.hp\|\|0\) \+ \(ev\.hp\|\|0\); \} \/\/ ENG15 \(2026-10-31, FF5\): the original is not spent/.test(app), 'the board no longer marks the original bloomed');

// ---- FF6 Cower N ------------------------------------------------------------------------------------------------------------------------
{ const {e, P} = mk(); const c = put(e, P, 1, 'x-cower', 0), h = put(e, P, 2, 'x-hitter', 0);
  round(e, P, 1); upkeep(e, P); const hp1 = c.hp; ok(hp1 === 197, `round 1: hit for 3 (${hp1})`);
  const ev = []; e.roundStart && e.roundStart(P, 2, so, {}, ev); const ev2 = round(e, P, 1);
  const cw = ev.concat(ev2).find(x=> x.type === 'statusFx' && x.kind === 'cower' && x.targetUid === c.uid);
  ok(cw && cw.mode === 'armor' && cw.armor === 2, `round 2: it cowers with +2 Armor (${cw && JSON.stringify({mode: cw.mode, armor: cw.armor})})`);
  ok(hp1 - c.hp === 1, `the hitter's 3 lands as 1 through the 2 Armor (${hp1 - c.hp})`);
  const after = upkeep(e, P); ok(!c.cowering, 'the pip flag clears with the round'); }
{ const SC = require(path.join(ROOT, 'tools', 'skill_costs.js')).make(JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')));
  ok(SC.skillCost('cower', 2) > SC.skillCost('cower', 'shell'), `Cower 2 costs more than Cower (shell): ${SC.skillCost('cower', 2)} > ${SC.skillCost('cower', 'shell')}`); }
ok(/function eng15CowerChip\(e, on\)/.test(app) && /cowering: !!c\.cowering \/\* ENG15 \(FF6\) \*\//.test(app), 'the board pip: lit with 🛡N while it cowers (eng15CowerChip, live.cowering)');

// ---- Z6 Poison skips the Shield ----------------------------------------------------------------------------------------------------------
{ const {e, P} = mk(); const c = put(e, P, 1, 'x-hitter', 0); c.shield = 5; c.tempHp = 2;
  e.damageCardFlat(c, 3, 'poison'); ok(c.hp === 197 && c.shield === 5 && c.tempHp === 2, `a Poison tick goes straight to Health (hp ${c.hp}, Shield ${c.shield}, temp ${c.tempHp})`);
  e.damageCardFlat(c, 3, 'physical', 'x-hitter'); ok(c.hp === 197 && c.tempHp === 0 && c.shield === 4, 'a hit still soaks into them first'); }

// ---- Y3 Bola lifts Flying / Evasive; Lasso --------------------------------------------------------------------------------------------
{ let lands = 0, tries = 0;
  for(let s = 1; s <= 16; s++){ const {e, P} = mk({}, s); const a = put(e, P, 1, 'x-hitter', 0), f = put(e, P, 2, 'x-fly', 0); f.pinDown = 1; f._pinDownJustSet = true;
    const ev = round(e, P, 1); tries++; if(ev.some(x=> x.type === 'hit' && x.attUid === a.uid && x.targetUid === f.uid)) lands++; }
  ok(lands === tries, `a Pinned Flying + Evasive unit can't dodge (${lands}/${tries} swings land)`); }
{ let lands = 0; for(let s = 1; s <= 16; s++){ const {e, P} = mk({}, s); const a = put(e, P, 1, 'x-hitter', 0), f = put(e, P, 2, 'x-fly', 0);
    if(round(e, P, 1).some(x=> x.type === 'hit' && x.attUid === a.uid && x.targetUid === f.uid)) lands++; }
  ok(lands < 12, `unpinned, it still dodges (${lands}/16 land)`); }
{ const {e, P} = mk(); const l = put(e, P, 1, 'x-lasso', 0), t = put(e, P, 2, 'x-hitter', 0);
  const ev = round(e, P, 1);
  ok(ev.some(x=> x.type === 'arrow' && x.uid === l.uid && x.lasso) && ev.some(x=> x.type === 'statusFx' && x.kind === 'lasso' && x.targetUid === t.uid), 'Lasso 1 throws once and ties the unit it hits');
  ok(t.lassoed === 1 && t.lassoBy === l.uid && l.lassoing === t.uid && l.lassoUsed, 'both ends are marked');
  ok(ev.some(x=> x.type === 'skipTurn' && x.uid === t.uid && x.reason === 'lassoed') && ev.some(x=> x.type === 'skipTurn' && x.uid === l.uid && x.reason === 'lassoed'), 'neither end swings');
  upkeep(e, P); const ev2 = round(e, P, 1);
  ok(!ev2.some(x=> x.type === 'arrow' && x.uid === l.uid) && t.lassoed === 1 && !ev2.some(x=> x.type === 'hit' && x.attUid === t.uid), 'the next round: no second throw, still tied');
  l.hp = 0; e.removeDeadCards(P, so, {}, {}, []); const ev3 = round(e, P, 1);
  ok(!ev3.some(x=> x.type === 'skipTurn' && x.uid === t.uid) && ev3.some(x=> (x.type === 'hit' || x.type === 'hitHQ') && x.attUid === t.uid), `the thrower dies: the target is free and swings (${t.lassoed}, ${ev3.filter(x=> x.attUid === t.uid || x.uid === t.uid).map(x=> x.type + (x.reason ? ':' + x.reason : '')).join(' ')})`);
  const ue = upkeep(e, P); ok(!(t.lassoed > 0) && ev3.concat(ue).some(x=> x.type === 'statusEnd' && x.status === 'lassoed' && x.uid === t.uid), `the round's upkeep clears its mark (statusEnd lassoed) (${t.lassoed}; ${ue.filter(x=> x.type === 'statusEnd').map(x=> x.status).join(',')})`); }
{ const {e, P} = mk(); const l = put(e, P, 1, 'x-lasso', 0), t = put(e, P, 2, 'x-hitter', 0); round(e, P, 1);
  t.hp = 0; e.removeDeadCards(P, so, {}, {}, []); upkeep(e, P); P[2].row.center = []; const w = put(e, P, 2, 'x-wall', 0);
  const ev = round(e, P, 1); ok(l.lassoing == null && ev.some(x=> x.type === 'hit' && x.attUid === l.uid), 'the target dies: the thrower lets go and swings again'); }
ok(/const HELD_STATUSES = \[[^\]]*'lassoed'/.test(app), "'lassoed' is a held status (the struggle wriggle)");

// ---- Y2 Anadromous ------------------------------------------------------------------------------------------------------------------------
{ const {e, P} = mk({saltMap:true, tide:true}); const s = put(e, P, 1, 'x-salmon', 0);
  ok(s.atk + (s.phaseAtk||0) === 3 && s.maxHp === 6 && e.isTide(s), `sea (Tide, salty): +1/+1 and Tide (${s.atk + (s.phaseAtk||0)}/${s.maxHp}, tide ${e.isTide(s)})`); }
{ const {e, P} = mk({tide:true}); const s = put(e, P, 1, 'x-salmon', 0);
  ok(s.atk + (s.phaseAtk||0) === 2 && s.maxHp === 5 && /anadromousRiver/.test(s._en5On || ''), 'fresh water (Tide, not salty): no stats');
  s.hp = 0; const ev = []; e.removeDeadCards(P, so, {}, {}, ev); const fry = all(P[1]).find(x=> x.defId === 'anadromous-fry');
  ok(!!fry && fry.atk === 1 && fry.hp === 1 && e.isTide(fry), 'on its death a 1/1 Tide Fry takes its place'); }
{ const {e, P} = mk({saltMap:true}); const s = put(e, P, 1, 'x-salmon', 0);
  ok(s.atk + (s.phaseAtk||0) === 2 && s.maxHp === 6 && /anadromousDry/.test(s._en5On || ''), 'no Tide (even on a salty map): +0/+1');
  s.hp = 0; e.removeDeadCards(P, so, {}, {}, []); ok(!all(P[1]).some(x=> x.defId === 'anadromous-fry'), 'and no Fry'); }
{ const costs = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')), SCm = require(path.join(ROOT, 'tools', 'skill_costs.js')), SC = SCm.make(costs);
  ok(SC.skillCost('anadromous', true) === 1.4 && costs.skills.find(r=> r.id === 'lasso'), 'Anadromous is re-priced 1.4 and Lasso has a price');
  const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8'));
  ['wrong-way-salmon', 'net-thrower', 'bolas-spider'].forEach(id=>{ const c = cards.find(x=> x.id === id), b = SC.budget(c); ok(b.ok, `${c.name} stays in budget (3A + H + S ${b.x1} of N ${b.N})`); });
  const fry = cards.find(c=> c.id === 'anadromous-fry'); ok(fry && fry.token && fry.attack === 1 && fry.health === 1 && fry.effects.tide, 'the Fry token is in cards.json');
  const ids = cards.map(c=> c.numericId); ok(new Set(ids).size === ids.length, 'numericIds stay unique'); }

// ---- Y7 mini-bosses +2 ---------------------------------------------------------------------------------------------------------------------
{ const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G;
  const nodes = G.CONQUEST_MAPS.flatMap(m=> (m.nodes || []).map(x=> x)), mini = nodes.find(x=> x.kind === 'miniboss'), elite = nodes.find(x=> x.kind === 'elite');
  const setOf = node=>{ const s = {2: {hq: {}}}; G.applySkirmishSetup(s, node); return s[2]; };
  ok(mini && setOf(mini).openingExtra === 2 && setOf(elite).openingExtra === 1, `a mini-boss (${mini && mini.key}) opens with 2 more cards (5), an elite 1 more`); }

// ---- Z5 Pounce L/C/R -------------------------------------------------------------------------------------------------------------------
{ const {e, P} = mk(); const far = put(e, P, 2, 'x-wall', 2); const ev = []; e.debugSpawnCard(P, so, 1, 'x-pounce', 0, {}, ev);
  const pv = ev.find(x=> x.type === 'pounce'); ok(pv && pv.targetUid == null && ev.some(x=> x.type === 'hitHQ' && x.pounce) && far.hp === 5000, 'an enemy two columns away is out of reach: it pounces on the bramble'); }
{ const {e, P} = mk(); const near = put(e, P, 2, 'x-wall', 1), far = put(e, P, 2, 'x-wall', 2); const ev = []; e.debugSpawnCard(P, so, 1, 'x-pounce', 0, {}, ev);
  ok(near.hp === 4997 && far.hp === 5000, 'one beside it (right) is in reach'); }
{ const {e, P} = mk(); const mid = put(e, P, 2, 'x-wall', 0), side = put(e, P, 2, 'x-wall', -1); const ev = []; e.debugSpawnCard(P, so, 1, 'x-pounce', 0, {}, ev);
  ok(mid.hp === 4997 && side.hp === 5000, 'the one facing it comes first'); }

// ---- BB4 Swarm type in the editor ---------------------------------------------------------------------------------------------------------
ok(/\(sel\[0\] && !Object\.prototype\.hasOwnProperty\.call\(ARCHETYPE_ICON, sel\[0\]\) \? \[sel\[0\]\] : \[\]\)\.concat\(Object\.keys\(ARCHETYPE_ICON\)\.sort\(\)\)/.test(app), 'the Swarm type select offers a picked type missing from ARCHETYPE_ICON (so Save keeps it)');
{ const d = H.loadCardDefs(); const e = E.makeSimEngine(Object.assign({}, d, {'x-ant': U('x-ant', {swarm:['Ant']}, {archetypes:['Ant']}), 'x-ant2': U('x-ant2', {}, {archetypes:['Ant']}), 'x-bee': U('x-bee', {}, {archetypes:['Bee']})}), E.mulberry32(1), {battleMode:'open'});
  const P = {1: e.newPlayer(1, {}, {id:'st-hq', health:500, effects:{}}), 2: e.newPlayer(2, {}, {id:'st-hq', health:500, effects:{}})};
  e.debugSpawnCard(P, so, 1, 'x-ant', 0, {}, []); e.debugSpawnCard(P, so, 1, 'x-ant2', 1, {}, []); e.debugSpawnCard(P, so, 1, 'x-bee', -1, {}, []);
  const ant = all(P[1]).find(x=> x.defId === 'x-ant'); ok(e.swarmBonusOf(P, ant) === 1, `Swarm (Ant) counts only the Ant ally (${e.swarmBonusOf(P, ant)})`); }

// ---- texts --------------------------------------------------------------------------------------------------------------------------------
{ const keys = ['ui.skn-eng15-true-sight', 'ui.eng15-sk-true-sight', 'ui.eng15-sk-true-sight-short', 'ui.eng15-bl-copy-none', 'ui.eng15-cower-tip', 'ui.eng15-cower-live', 'ui.eng15-cower-desc', 'ui.eng15-cower-short',
    'ui.skn-eng15-lasso', 'ui.eng15-sk-lasso', 'ui.eng15-sk-lasso-codex', 'ui.eng15-stn-lassoed', 'ui.eng15-ls-lassoed', 'ui.eng15-log-lassoed', 'ui.eng15-log-lassoed-skip', 'ui.eng15-log-lassoed-end'];
  ok(keys.every(k=> T[k]), 'the ENG15 TX keys exist');
  ok(/beside it/.test(T['ui.sk-pounce']) && /token/.test(T['ui.bl-codex']) && /Fry/.test(T['ui.e14-sk-anadromous']) && /Flying and Evasive/.test(T['ui.e14-sk-bola-codex']), 'the changed rules read right (Pounce, Bloom, Anadromous, Bola)'); }

console.log(`\n${n - fail}/${n} passed`); process.exit(fail ? 1 : 0);
