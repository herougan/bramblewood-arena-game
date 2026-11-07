#!/usr/bin/env node
// 2026-11-07 (package ENG30): the owner's notes of 11-07 08:54 (docs/action-items.md).
//   1  #1: Consecration N (its side's ground is Exalted: its units heal N each round start) and Desecration N (the enemy side's ground is
//         Cursed: N curse damage each round start, on top of Desecrate's cell curses). Both standing anywhere: neither ground applies,
//         field-wide. On no card; "?" until Map 70 (SKILL_REVEAL_MAP); priced by reasoning (bramblewood-budget.js ENG30_GROUND).
//   2  #2: the Blind / Dark-blind 🕶️ pip glows while its unit attacks (CSS on .is-attacking), off at Effects None.
//   3  #13: the blindfold (look B) and fog (look C) sight looks are gone, only look A; the shut-eye blink plays 1 time in 2.
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine, ROOT = H.ROOT, R = f=> fs.readFileSync(path.join(ROOT, f), 'utf8'), J = f=> JSON.parse(R(f));
const BB = require(path.join(ROOT, 'bramblewood-budget.js'));
const TXm = require(path.join(ROOT, 'bramblewood-texts.js')), TXT = TXm.TEXT;
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id === 1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:0, health:50, wait:9, cost:0, effects}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'x-con':   U('x-con', {consecration:true}),
  'x-con3':  U('x-con3', {consecration:3}),
  'x-des':   U('x-des', {desecration:true}),
  'x-des2':  U('x-des2', {desecration:2}),
  'x-dcurse':U('x-dcurse', {desecrate:2}, {attack:1, wait:0, health:500}),
  'x-plain': U('x-plain', {}),
  'x-rel':   U('x-rel', {relict:true}),
  'x-und':   Object.assign(U('x-und', {}), {species:['Undead']}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(seed){ const e = E.makeSimEngine(defs, E.mulberry32(seed || 5), {recordEvents:true, battleMode:'open', rules:{}});
  return {e, P:{1: e.newPlayer(1, {}, null), 2: e.newPlayer(2, {}, null)}}; }
function put(e, P, pid, id, slot, hurt){ const pl = P[pid]; const c = e.makeBoardCard(id); c.slot = slot; c._seenAt = slot; if(hurt) c.hp -= hurt;
  const cs = all(pl).concat(c); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncSlots(pl); return c; }
function round(e, P){ const ev = []; e.roundStart(P, 1, so, {}, []); e.resolveCombat(P, so, {}, ev, 1); return ev; }
const app = R('arena_app.js'), eng = R('bramblewood-engine.js'), fx = R('bramblewood-fx-b.js'), tpl = R('arena_template.html');
const SK = Object.fromEntries(J('canonical/skill-costs.json').skills.map(s=> [s.id, s]));

// ---- 1. Consecration / Desecration --------------------------------------------------------------------------------------------
{ // Exalted ground: its side heals N at the round start; the other side doesn't
  const {e, P} = mk(1); put(e, P, 1, 'x-con', 0); const a = put(e, P, 1, 'x-plain', 1, 10), b = put(e, P, 2, 'x-plain', 0, 10);
  const ev = round(e, P);
  ok(a.hp === 41, `1: Consecration heals its own side 1 a round (${a.hp}, want 41)`);
  ok(b.hp === 40, `1: the enemy side is not healed (${b.hp})`);
  ok(ev.some(x=> x.type === 'exaltTick' && x.uid === a.uid && x.heal === 1), '1: an exaltTick event for the heal');
  const g = e.eng30Ground(P); ok(g.exalted[1] === 1 && g.exalted[2] === 0 && !g.cancelled, '1: eng30Ground reports side A Exalted 1'); }
{ // N, and several carriers take the largest
  const {e, P} = mk(2); put(e, P, 1, 'x-con3', 0); put(e, P, 1, 'x-con', 2); const a = put(e, P, 1, 'x-plain', 1, 10);
  round(e, P); ok(a.hp === 43, `1: Consecration 3 heals 3; a second carrier with 1 doesn't add (${a.hp}, want 43)`); }
{ // Cursed ground: the enemy side takes N curse damage at the round start; its own side doesn't
  const {e, P} = mk(3); const d = put(e, P, 1, 'x-des2', 0); const a = put(e, P, 1, 'x-plain', 1), b = put(e, P, 2, 'x-plain', 0), b2 = put(e, P, 2, 'x-plain', 2);
  const ev = round(e, P);
  ok(b.hp === 48 && b2.hp === 48, `1: Desecration 2 curses every enemy unit for 2 (${b.hp}, ${b2.hp})`);
  ok(a.hp === 50 && d.hp === 50, '1: its own side is not cursed');
  ok(ev.some(x=> x.type === 'curseTick' && x.uid === b.uid && x.ground === true), '1: curseTick with ground:true');
  const g = e.eng30Ground(P); ok(g.cursed[2] === 2 && g.cursed[1] === 0, '1: eng30Ground reports side B Cursed 2'); }
{ // stacks onto a Desecrate cell curse: one curseTick of cell + ground
  const {e, P} = mk(4); put(e, P, 1, 'x-des', 1); put(e, P, 1, 'x-dcurse', 0); const b = put(e, P, 2, 'x-plain', 0, 0);
  round(e, P); const cs = e.getCurses(), cell = Object.values(cs).reduce((s, v)=> s + v, 0);
  const ev = round(e, P), t = ev.find(x=> x.type === 'curseTick' && x.uid === b.uid);
  ok(cell === 2 && t && t.dmg === 3 && t.ground === true, `1: Desecrate's cell curse (${cell}) and Desecration's ground (1) tick together (${t && t.dmg}, want 3)`);
  { const c2 = Object.values(e.getCurses()).reduce((s, v)=> s + v, 0); ok(c2 === 4, `1: getCurses holds only the cell curses (two hits of Desecrate 2: ${c2})`); } }
{ // the cancel: both on the field (opposite sides), neither applies
  const {e, P} = mk(5); put(e, P, 1, 'x-con', 0); put(e, P, 2, 'x-des', 0); const a = put(e, P, 1, 'x-plain', 1, 10), b = put(e, P, 2, 'x-plain', 1, 10), a2 = put(e, P, 1, 'x-plain', 2);
  const ev = round(e, P);
  ok(a.hp === 40 && a2.hp === 50 && b.hp === 40, `1: Consecration vs Desecration cancel: no heal, no curse (${a.hp}, ${a2.hp}, ${b.hp})`);
  ok(!ev.some(x=> x.type === 'exaltTick' || (x.type === 'curseTick' && x.ground)), '1: no ground events while cancelled');
  ok(e.eng30Ground(P).cancelled === true, '1: eng30Ground reports cancelled'); }
{ // the cancel holds with both on ONE side too, and ends when one carrier leaves
  const {e, P} = mk(6); const c = put(e, P, 1, 'x-con', 0); put(e, P, 1, 'x-des', 2); const a = put(e, P, 1, 'x-plain', 1, 10), b = put(e, P, 2, 'x-plain', 0);
  round(e, P); ok(a.hp === 40 && b.hp === 50, '1: both on one side cancel too');
  c.hp = 0; P[1].row.center = P[1].row.center.filter(x=> x !== c); e.syncSlots(P[1]);
  round(e, P); ok(b.hp === 49 && a.hp === 40, `1: once the Consecration unit is gone, Desecration's ground is back (${b.hp}, ${a.hp})`); }
{ // Relict is passed by, Undead is hurt by Exalted ground, Waiting carriers count, a dead carrier doesn't
  const {e, P} = mk(7); put(e, P, 1, 'x-con', 0); const r = put(e, P, 1, 'x-rel', 1, 10), u = put(e, P, 1, 'x-und', 2, 10);
  round(e, P); ok(r.hp === 40, '1: a Relict unit is not healed by Exalted ground');
  ok(u.hp === 39, `1: an Undead unit is hurt by Exalted ground (applyHeal, ENG26) (${u.hp})`); }
{ const {e, P} = mk(8); put(e, P, 1, 'x-des', 0); const r = put(e, P, 2, 'x-rel', 0); round(e, P); ok(r.hp === 50, '1: a Relict unit is not cursed by Desecration'); }
ok(/eng30ExaltTick\(players, sideOf, stats, events\)/.test(eng) && /ENG30_KEYS/.test(eng), '1: the engine runs the Exalted tick at the round start');
// on no card
{ const cards = J('canonical/cards.json'); const list = Array.isArray(cards) ? cards : (cards.cards || Object.values(cards));
  const on = list.filter(c=> c && c.effects && (c.effects.consecration || c.effects.desecration)); ok(on.length === 0, `1: on no card (${on.map(c=> c.id).join(', ')})`); }
// gated at Map 70
ok(/consecration:\s*\{from:70\}/.test(app) && /desecration:\s*\{from:70\}/.test(app), '1: SKILL_REVEAL_MAP gates both at Map 70');
ok(/key:'consecration'/.test(app) && /key:'desecration'/.test(app), '1: both in PASSIVE_DEFS (editor, Codex)');
// prices
ok(SK.consecration && SK.desecration, '1: both priced in canonical/skill-costs.json');
ok(BB.ENG30_GROUND && SK.consecration && SK.desecration && Math.abs(SK.consecration.value - BB.ENG30_GROUND.consecration.value) < 1e-9 && Math.abs(SK.desecration.value - BB.ENG30_GROUND.desecration.value) < 1e-9, '1: the table prices match bramblewood-budget.js ENG30_GROUND');
ok(SK.consecration && SK.desecration && SK.consecration.scale === 'n' && SK.desecration.scale === 'n', '1: priced per N');
ok(SK.consecration && SK.desecration && SK.desecration.value > SK.consecration.value, '1: Desecration (damage) is priced above Consecration (healing)');
// texts
['ui.eng30-consecration-name', 'ui.eng30-consecration', 'ui.eng30-consecration-codex', 'ui.eng30-desecration-name', 'ui.eng30-desecration', 'ui.eng30-desecration-codex', 'ui.eng30-exalt-log', 'ui.eng30-exalted-mark', 'ui.eng30-cancel-mark']
  .forEach(k=> ok(typeof TXT[k] === 'string' && TXT[k].length, `1: text ${k}`));
{ const langs = fs.readdirSync(path.join(ROOT, 'lang')).filter(f=> /\.json$/.test(f)); ok(langs.length === 12, '1: 12 language packs');
  langs.forEach(f=>{ const L = J('lang/' + f); ['ui.eng30-consecration-name', 'ui.eng30-consecration', 'ui.eng30-consecration-codex', 'ui.eng30-desecration-name', 'ui.eng30-desecration', 'ui.eng30-desecration-codex', 'ui.eng30-exalt-log', 'ui.eng30-exalted-mark', 'ui.eng30-cancel-mark']
    .forEach(k=> ok(typeof L[TXT[k]] === 'string' && L[TXT[k]].length, `1: ${f} translates "${TXT[k]}"`)); }); }

// ---- 2. The Blind pip glows while its unit attacks ---------------------------------------------------------------------------
ok(/\.board-card\.is-attacking [^{]*\.abadge\.blind/.test(tpl), '2: the 🕶️ pip glows on an attacking card (.is-attacking .abadge.blind)');
ok(/html\[data-fx="none"\] \.board-card\.is-attacking [^{]*\.abadge\.blind[^{]*\{[^}]*animation:none/.test(tpl), '2: no glow at Effects None');
ok(/@keyframes eng30BlindGlow/.test(tpl), '2: the glow keyframes');

// ---- 3. Sight looks: only A; the blink 1 in 2 ---------------------------------------------------------------------------------
{ const ms = fx.slice(fx.indexOf('M.markSight = function'), fx.indexOf('M.sightSync = function')); // the dark-entry looks (M.darkLook) are another feature
  ok(ms.length > 100 && !/\.fxb-fold|fxb-fold/.test(fx) && !/fxb-look-B/.test(fx) && !/look === 'B'/.test(ms), '3: the blindfold look B is gone from bramblewood-fx-b.js');
  ok(!/fxb-fogart/.test(fx) && !/look === 'C'/.test(ms) && /const look = 'A'/.test(ms), '3: the fog look C is gone too (only look A remains)'); }
ok(/M\.sightLook = 'A';/.test(fx), "3: the game's sight look is A");
{ const lab = R('tools/effects-lab/manifest/b.js'); ok(!/look:'B'/.test(lab) && !/sightDemo\('B'\)/.test(lab) && !/sightDemo\('C'\)/.test(lab), '3: the FX lab offers no look B / C'); }
ok(/Math\.random\(\) < 0\.5/.test(fx.slice(fx.indexOf('function eyeIntro'), fx.indexOf('function eyeIntro') + 600)), '3: the shut-eye intro blink plays with a 1 in 2 chance');

console.log(fail ? `eng30: ${fail} of ${n} failed` : `eng30: all ${n} checks passed`);
process.exit(fail ? 1 : 0);
