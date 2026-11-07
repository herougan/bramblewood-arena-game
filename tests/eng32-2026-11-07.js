#!/usr/bin/env node
// 2026-11-07 (package ENG32, owner 11-07 09:47 #11, #13, #15): Dive reworked, Brood without Swarm, Preternatural stated.
//   1. Dive: it rises only with a unit opposite it; its strike hits the unit opposite it (past Taunt), or the bramble when nothing is
//      there; plain Dive (true) = its Attack, Dive N = Attack + N (at the bramble too); while it is aloft / under / low the unit opposite
//      swings at your bramble (it blocks nothing); the three modes fly / tide / ground; the two Dive cards keep working;
//   2. Brood: a 1/1 copy of the parent with every skill but Brood (it can't chain), no Swarm added (ENG28 #17 undone);
//   3. Preternatural: stated, not built (docs/project-state.md), on no card, no engine effect;
//   4. prices, texts in the 12 packs, the board's three looks (app source).
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine, ROOT = H.ROOT || path.join(__dirname, '..');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id === 1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:1, health:100, wait:0, cost:0, effects}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'x-dive': U('x-dive', {flying:true, dive:2}, {attack:3, health:50}), 'x-dive0': U('x-dive0', {flying:true, dive:true}, {attack:3, health:50}),
  'x-dive-t': U('x-dive-t', {tide:true, dive:1}, {attack:3, health:50}), 'x-dive-q': U('x-dive-q', {quick:true, dive:1}, {attack:3, health:50}),
  'x-hit': U('x-hit', {}, {attack:2, health:500}), 'x-wall': U('x-wall', {}, {attack:0, health:500, wait:9}), 'x-weak': U('x-weak', {}, {attack:0, health:5, wait:9}),
  'x-taunt': U('x-taunt', {taunt:true}, {attack:0, health:40, wait:9}),
  'x-brood': U('x-brood', {brood:2, armor:1, flying:true}, {attack:4, health:9, species:['Arachnid'], archetypes:['Forest']}),
  'x-brood-sw': U('x-brood-sw', {brood:1, swarm:true}, {attack:2, health:6, species:['Rodent']}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(seed, opts){ const e = E.makeSimEngine(defs, E.mulberry32(seed || 5), Object.assign({recordEvents:true, battleMode:'open', rules:{}}, opts || {}));
  return {e, P:{1: e.newPlayer(1, {}, {id:'st-hq', health:60, effects:{}}), 2: e.newPlayer(2, {}, {id:'st-hq', health:60, effects:{}})}}; }
function put(e, P, pid, id, slot){ const pl = P[pid]; e.debugSpawnCard(P, so, pid, id, 'left', {}, []);
  const c = all(pl).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot;
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncSlots(pl); e.syncPhaseStats(P, so, []); return c; }
const round = (e, P, first)=>{ const ev = []; e.resolveCombat(P, so, {}, ev, first || 1); return ev; };
let huid = 90000; const give = (P, pid, defId)=>{ const uid = huid++; P[pid].hand.push({uid, defId}); P[pid].lumber = 9; P[pid].playedThisTurn = false; return uid; };

// ---- 1. Dive ---------------------------------------------------------------------------------------------------------------
// with a unit opposite: it rises, then strikes that unit (not the weaker one beside it) for 3 + 2
{ const {e, P} = mk(); const D = put(e, P, 1, 'x-dive', 0); const W = put(e, P, 2, 'x-wall', 0); const wk = put(e, P, 2, 'x-weak', 1);
  let ev = round(e, P); const rise = ev.find(x=> x.type === 'diveRise');
  ok(rise && rise.uid === D.uid && rise.mode === 'fly' && rise.n === 2 && D.diveAloft != null, 'a unit opposite it: it rises (fly, n 2)');
  ev = round(e, P); const dv = ev.find(x=> x.type === 'dive' && x.strike), h = ev.find(x=> x.type === 'hit' && x.attUid === D.uid);
  ok(dv && dv.targetUid === W.uid && dv.bonus === 2 && h && h.targetUid === W.uid && h.dmg === 5, `the strike hits the unit opposite it, 3 + 2 (${h && h.targetDefId} ${h && h.dmg}), not the weakest of its row`);
  ok(wk.hp === 5, 'the weaker unit beside it is untouched'); }
// nothing opposite: no rise, it swings at the bramble as usual
{ const {e, P} = mk(); const D = put(e, P, 1, 'x-dive', 0); put(e, P, 2, 'x-weak', 1); const ev = round(e, P);
  ok(!ev.some(x=> x.type === 'diveRise') && D.diveAloft == null && ev.some(x=> x.type === 'hitHQ' && x.attUid === D.uid), 'nothing opposite it (a unit beside only): no rise, it swings at the bramble'); }
// the unit opposite dies before the strike: it dives on the bramble, + N kept
{ const {e, P} = mk(); const D = put(e, P, 1, 'x-dive', 0); const W = put(e, P, 2, 'x-wall', 0); round(e, P); ok(D.diveAloft != null, 'risen');
  W.hp = 0; e.removeDeadCards(P, so, {}, {}, []); const hq0 = P[2].hq.hp; const ev = round(e, P);
  const dv = ev.find(x=> x.type === 'dive' && x.strike), hq = ev.find(x=> x.type === 'hitHQ' && x.attUid === D.uid);
  ok(dv && dv.bramble && !dv.targetUid && hq && hq.dmg === 5 && P[2].hq.hp === hq0 - 5, `no unit opposite at the strike: it dives on the bramble for 3 + 2 (${hq && hq.dmg})`); }
// plain Dive: Attack only
{ const {e, P} = mk(); const D = put(e, P, 1, 'x-dive0', 0); const W = put(e, P, 2, 'x-wall', 0); round(e, P); const ev = round(e, P);
  const dv = ev.find(x=> x.type === 'dive' && x.strike), h = ev.find(x=> x.type === 'hit' && x.attUid === D.uid);
  ok(dv && dv.bonus === 0 && h && h.targetUid === W.uid && h.dmg === 3 && !h.dive, `plain Dive (true): the strike is its Attack, no bonus (${h && h.dmg})`);
  ok(e.eng32DiveBonus(D) === 0, 'eng32DiveBonus(true) = 0'); }
// past Taunt: the strike goes to the unit opposite, not the Taunt unit beside it
{ const {e, P} = mk(); const D = put(e, P, 1, 'x-dive', 0); const W = put(e, P, 2, 'x-wall', 0); const T = put(e, P, 2, 'x-taunt', 1); round(e, P); const ev = round(e, P);
  const h = ev.find(x=> x.type === 'hit' && x.attUid === D.uid); ok(h && h.targetUid === W.uid && T.hp === 40, 'the strike goes past a Taunt beside it onto the unit opposite'); }
// while it is dived, the unit opposite hits your bramble
{ const {e, P} = mk(); const D = put(e, P, 1, 'x-dive', 0); const F = put(e, P, 2, 'x-hit', 0); round(e, P, 1); ok(D.diveAloft != null, 'risen (it acted first)');
  const hq0 = P[1].hq.hp; const ev = round(e, P, 2); const at = ev.findIndex(x=> x.type === 'dive');
  const before = ev.slice(0, at), hq = before.find(x=> x.type === 'hitHQ' && x.attUid === F.uid);
  ok(hq && hq.dmg === 2 && !before.some(x=> x.type === 'evaded' && x.targetUid === D.uid) && P[1].hq.hp <= hq0 - 2, `while it is aloft the unit opposite swings at your bramble (${hq && hq.dmg}), no "out of reach" whiff`); }
// the modes: Tide (no wings) goes under, a Quick unit with neither goes low (ground)
{ const {e, P} = mk(); const D = put(e, P, 1, 'x-dive-t', 0); put(e, P, 2, 'x-wall', 0); const ev = round(e, P); const r = ev.find(x=> x.type === 'diveRise');
  ok(r && r.mode === 'tide' && D.diveMode === 'tide', 'Tide + Dive: under (tide)'); }
{ const {e, P} = mk(); const D = put(e, P, 1, 'x-dive-q', 0); const W = put(e, P, 2, 'x-wall', 0); let ev = round(e, P); const r = ev.find(x=> x.type === 'diveRise');
  ok(r && r.mode === 'ground' && D.diveMode === 'ground' && e.en7DiveMode(D) === 'ground', `plain Dive (a Quick unit, no wings, no Tide): low (${r && r.mode})`);
  ev = round(e, P); const h = ev.find(x=> x.type === 'hit' && x.attUid === D.uid); ok(h && h.targetUid === W.uid && h.dmg === 4, `... and strikes for 3 + 1 (${h && h.dmg})`); }
// the two Dive cards
{ const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8')), by = id=> cards.find(c=> c.id === id);
  const pf = by('puffin-diver'), hs = by('harbor-seal');
  ok(pf.effects.dive === 2 && pf.attack === 2 && pf.health === 5 && hs.effects.dive === 2 && hs.attack === 1 && hs.health === 9, 'the two Dive cards are unchanged (Dive 2 = + 2 bonus)');
  const {e, P} = mk(); const S = put(e, P, 1, 'puffin-diver', 0); put(e, P, 2, 'x-wall', 0); const r = [...round(e, P), ...round(e, P)].find(x=> x.type === 'diveRise'); // Wait 1: it rises in round 2
  ok(r && r.mode === 'fly' && r.n === 2, 'Puffin Diver (Flying + Tide): aloft, + 2'); void S;
  const g = mk(); put(g.e, g.P, 1, 'harbor-seal', 0); put(g.e, g.P, 2, 'x-wall', 0); const r2 = [...round(g.e, g.P), ...round(g.e, g.P)].find(x=> x.type === 'diveRise');
  ok(r2 && r2.mode === 'tide' && r2.n === 2, 'Harbor Seal (Tide): under, + 2'); }

// ---- 2. Brood --------------------------------------------------------------------------------------------------------------
{ const {e, P} = mk(); put(e, P, 2, 'x-wall', 0); const ev = []; e.placeCard(P, so, 1, give(P, 1, 'x-brood'), 0, {}, ev);
  const toks = all(P[1]).filter(c=> c.defId === 'x-brood~brood'), td = defs['x-brood~brood'] || (e.derivedDefs && e.derivedDefs['x-brood~brood']);
  ok(toks.length === 2, `Brood 2: two tokens hatch (${toks.length})`);
  ok(td && td.attack === 1 && td.health === 1 && td.token && td.effects.armor === 1 && td.effects.flying && !td.effects.brood, 'the token is a 1/1 copy: the parent\'s skills (Armor, Flying), no Brood');
  ok(td && !td.effects.swarm && !td.effects.swarmSpecies, 'no Swarm added (plain or Species)');
  ok(toks.every(c=> c.atk === 1 && c.maxHp === 1), `on the board 1/1 (${toks.map(c=> c.atk + '/' + c.maxHp)})`);
  ok(!all(P[1]).some(c=> String(c.defId).includes('~brood~brood')), 'it can\'t chain: no token of a token'); }
{ const {e, P} = mk(); e.placeCard(P, so, 1, give(P, 1, 'x-brood-sw'), 0, {}, []); const td = defs['x-brood-sw~brood'] || (e.derivedDefs && e.derivedDefs['x-brood-sw~brood']);
  ok(td && td.effects.swarm === true && !td.effects.swarmSpecies, 'a parent that has Swarm passes its own Swarm on (Default, not Species)'); }

// ---- 3. Preternatural -------------------------------------------------------------------------------------------------------
{ const ps = fs.readFileSync(path.join(ROOT, 'docs', 'project-state.md'), 'utf8'), eng = fs.readFileSync(path.join(ROOT, 'bramblewood-engine.js'), 'utf8');
  const TXT = require(path.join(ROOT, 'bramblewood-texts.js')).TEXT, cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8'));
  ok(/Preternatural/.test(ps), 'docs/project-state.md lists Preternatural (stated, not built)');
  ok(!/preternatural/i.test(eng) && !Object.values(TXT).some(v=> /preternatural/i.test(v)) && !cards.some(c=> c.effects && c.effects.preternatural), 'no engine effect, no text, on no card'); }

// ---- 4. prices, texts, the board --------------------------------------------------------------------------------------------
{ const costs = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')), sk = id=> costs.skills.find(r=> r.id === id);
  ok(/ENG32/.test(sk('dive').note || '') && sk('dive').prevValueENG32 != null, `Dive re-priced by ENG32 (${sk('dive').value})`);
  ok(/ENG32/.test(sk('brood').note || '') && sk('brood').prevValueENG32 != null, `Brood re-priced by ENG32 (${sk('brood').value})`);
  if(!process.argv.includes('--world=half')) process.argv.push('--world=half');
  const SC = require(path.join(ROOT, 'tools', 'skill_costs.js')), T = SC.make(costs);
  ok(T.skillCost('dive', 2) > T.skillCost('dive', true), `Dive 2 costs more than plain Dive (${T.skillCost('dive', 2)} > ${T.skillCost('dive', true)})`); }
{ const TXT = require(path.join(ROOT, 'bramblewood-texts.js')).TEXT; const strip = s=> String(s).replace(/^[\p{Extended_Pictographic}✀-➿️‍\s]+/u, '');
  ok(/opposite/.test(TXT['ui.sk-dive']) && /bramble/.test(TXT['ui.sk-dive']) && /opposite/.test(TXT['ui.eng9-dive-codex']) && !/least Health/.test(TXT['ui.eng9-dive-codex']), 'the Dive texts say "opposite" and "bramble"');
  const keys = ['ui.sk-dive', 'ui.sk-dive0', 'ui.sk-dive-codex', 'ui.eng9-dive-codex', 'ui.en7-log-strike-none', 'ui.eng32-log-dive0', 'ui.eng32-log-dive0-bramble', 'ui.eng32-tip-ground', 'ui.eng32-log-ground', 'ui.eng32-float-ground'];
  ok(keys.every(k=> TXT[k]), 'every ENG32 key is in bramblewood-texts.js');
  ['de', 'es', 'fr', 'id', 'it', 'ja', 'ko', 'pt', 'ta', 'tl', 'zh-Hans', 'zh-Hant'].forEach(c=>{ const p = Object.assign({}, JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', c + '.json'), 'utf8')), JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', 'ui', c + '.json'), 'utf8')));
    const miss = keys.filter(k=> !p[strip(TXT[k])] && !p[TXT[k]]); ok(!miss.length, `${c}: every ENG32 Dive text translated (${miss.slice(0, 3)})`);
    ok(Object.keys(p).some(k=> /1\/1 copy/.test(k)), `${c}: the new Brood text is translated`); }); }
{ const app = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
  ['eng32-ground', 'eng32Tilt', 'en7-aloft', 'en7-under', '@keyframes eng32Tide'].forEach(s=> ok(app.includes(s), 'arena_app.js: ' + s));
  ok(/fxAtLeast\('low'\)[^\n]*eng32|eng32[^\n]*fxAtLeast\('low'\)|data-fx/.test(app), 'the looks respect the Effects setting');
  const html = fs.existsSync(path.join(ROOT, 'index.html')) ? fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8') : ''; ok(html.includes('eng32DiveBonus') && html.includes('eng32-ground'), 'the build carries the package (index.html)'); }

console.log(`eng32-2026-11-07: ${n - fail}/${n} checks passed`);
process.exit(fail ? 1 : 0);
