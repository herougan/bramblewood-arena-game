#!/usr/bin/env node
// 2026-11-16 (package ARROW1, owner 11-16 23:10: "all the arrows ... count as 1, same for the bolts ... Arrows are slower than normal speed
// (speed 0), while Bolts are faster, at speed 2."): 1 the families count as one skill, 2 arrows (and Archer's turn) go after the swings,
// 3 bolts go at Speed 2 (with Quick swings, before the rest), 4 a unit with both has two shot actions, 5 texts, Codex, Map 20's focus.
'use strict';
const H = require('./lib/harness.js');
const E = H.Engine;
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
let fail = 0, pass = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } else pass++; };
const so = id=> id === 1 ? 'A' : 'B';
const BB = require('../bramblewood-budget.js');
const T = require('../bramblewood-texts.js').TEXT;
const U = (id, effects, o)=> Object.assign({id, name:id, attack:0, health:500, wait:0, cost:0, effects: effects || {}}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'a1-dummy': U('a1-dummy'),
  'a1-swing': U('a1-swing', {}, {attack:1}),
  'a1-quick': U('a1-quick', {quick:true}, {attack:1}),
  'a1-fast': U('a1-fast', {speed:1}, {attack:1}),
  'a1-arrow': U('a1-arrow', {arrow:1}),
  'a1-bolt': U('a1-bolt', {fireBolt:1}),
  'a1-spit': U('a1-spit', {spitfire:1}),
  'a1-both': U('a1-both', {arrow:1, iceBolt:1}),
  'a1-archer': U('a1-archer', {archer:1}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(seed){ const e = E.makeSimEngine(defs, E.mulberry32(seed || 11), {recordEvents:true, battleMode:'open'});
  return {e, P:{1:e.newPlayer(1, {}, {health:500}), 2:e.newPlayer(2, {}, {health:500})}}; }
function put(e, P, pid, id, slot){ e.debugSpawnCard(P, so, pid, id, 'left', {}, []);
  const pl = P[pid], c = all(pl).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot;
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncPhaseStats(P, so, []); return c; }
const fight = (e, P)=>{ const ev = []; e.resolveCombat(P, so, {}, ev, 1); return ev; };
const at = (ev, f)=> ev.findIndex(f);
const swingOf = uid=> x=> (x.type === 'hit' || x.type === 'hitHQ') && x.attUid === uid;

// ---- 1. one skill per family ----
ok(BB.skillCountOf({arrow:2, iceArrow:1, twinShot:1, volley:1, archer:2}) === 1, 'every arrow together counts 1 (Arrow, Ice Arrow, Twin Shot, Volley, Archer)');
ok(BB.skillCountOf({arrow:{v:1, type:'fire'}, iceArrow:1}) === 1, 'Arrow (Flaming) + Ice Arrow (the family form) count 1');
ok(BB.skillCountOf({fireBolt:1, acidBolt:1, poisonBolt:1, iceBolt:1, shockBolt:1, spitfire:1}) === 1, 'every bolt together counts 1 (the five Bolts, Spitfire)');
ok(BB.skillCountOf({arrow:1, fireBolt:1}) === 2, 'an arrow and a bolt are two skills');
ok(BB.skillCountOf({arrow:2, arrowPoison:true, arrowBleed:true, arrowCount:2}) === 1, 'the arrow riders (venom, bleed, count) are parameters');
ok(BB.skillCountOf({fireBolt:1, electricity:1, shockBolt:2}) === 1 && BB.skillCountOf({electricity:1, shockBolt:2, fireBolt:1}) === 1, 'groups sharing a skill join, whatever the key order (Electricity + Shock Bolt + Fire Bolt = 1)');
ok(BB.ARROW_FAMILY.includes('fireArrow') && BB.BOLT_FAMILY.includes('spitfire'), 'the budget exports the two families');
{ const r = defs['rimefire-salamander']; ok(r && BB.skillCountOf(r.effects) === 1, `Rimefire Salamander (Arrow (Flaming) + Ice Arrow) counts 1 (${r && BB.skillCountOf(r.effects)})`); }

// ---- 2. arrows after the swings ----
{ const {e, P} = mk(); const a = put(e, P, 1, 'a1-arrow', -2), s = put(e, P, 2, 'a1-swing', 2); put(e, P, 2, 'a1-dummy', -2);
  ok(e.shotSpeedOf(a) === 0 && e.shotSpeedOf(a, 'arrow') === 0, 'an arrow shot is Speed 0');
  const ev = fight(e, P), iS = at(ev, swingOf(s.uid)), iA = at(ev, x=> x.type === 'arrow' && x.uid === a.uid);
  ok(iS >= 0 && iA > iS, `an arrow in the first column goes after a swing in the last (swing ${iS}, arrow ${iA})`); }
{ const {e, P} = mk(); const ar = put(e, P, 1, 'a1-archer', -2), s = put(e, P, 2, 'a1-swing', 2); put(e, P, 2, 'a1-dummy', -2);
  const ev = fight(e, P), iS = at(ev, swingOf(s.uid)), iA = at(ev, x=> x.type === 'arrow' && x.uid === ar.uid);
  ok(iS >= 0 && iA > iS, `Archer's arrow (its turn) goes after the swings too (swing ${iS}, arrow ${iA})`); }

// ---- 3. bolts at Speed 2 ----
{ const {e, P} = mk(); const b = put(e, P, 1, 'a1-bolt', 2), s = put(e, P, 2, 'a1-swing', -2), f = put(e, P, 2, 'a1-fast', 0); put(e, P, 2, 'a1-dummy', 2);
  ok(e.shotSpeedOf(b) === 2 && e.shotSpeedOf(b, 'bolt') === 2, 'a bolt shot is Speed 2');
  const ev = fight(e, P), iB = at(ev, x=> x.type === 'bolt' && x.uid === b.uid), iS = at(ev, swingOf(s.uid)), iF = at(ev, swingOf(f.uid));
  ok(iB >= 0 && iB < iS && iB < iF, `a bolt in the last column goes before a Speed 0 and a Speed 1 swing (bolt ${iB}, swing ${iS}, Speed 1 swing ${iF})`); }
{ const {e, P} = mk(); const b = put(e, P, 1, 'a1-spit', -2), q = put(e, P, 2, 'a1-quick', 2); put(e, P, 2, 'a1-dummy', -2);
  const ev = fight(e, P), iB = at(ev, x=> x.type === 'bolt' && x.uid === b.uid), iQ = at(ev, swingOf(q.uid));
  ok(iB >= 0 && iQ > iB, `Spitfire ties with a Quick swing at Speed 2: the first column goes first (spit ${iB}, Quick ${iQ})`); }
{ const {e, P} = mk(); const b = put(e, P, 1, 'a1-bolt', 2), q = put(e, P, 2, 'a1-quick', -2); put(e, P, 2, 'a1-dummy', 2);
  const ev = fight(e, P), iB = at(ev, x=> x.type === 'bolt' && x.uid === b.uid), iQ = at(ev, swingOf(q.uid));
  ok(iQ >= 0 && iB > iQ, `a Quick swing in the first column goes before a bolt in the last (Quick ${iQ}, bolt ${iB})`); }

// ---- 4. an arrow and a bolt on one unit: two actions, each at its family's Speed ----
{ const {e, P} = mk(); const u = put(e, P, 1, 'a1-both', 2), s = put(e, P, 2, 'a1-swing', -2); put(e, P, 2, 'a1-dummy', 2);
  const ev = fight(e, P), iB = at(ev, x=> x.type === 'bolt' && x.uid === u.uid), iS = at(ev, swingOf(s.uid)), iA = at(ev, x=> x.type === 'arrow' && x.uid === u.uid);
  ok(iB >= 0 && iS > iB && iA > iS, `its bolt before the swing, its arrow after (bolt ${iB}, swing ${iS}, arrow ${iA})`);
  ok(ev.filter(x=> x.type === 'bolt' && x.uid === u.uid).length === 1 && ev.filter(x=> x.type === 'arrow' && x.uid === u.uid).length === 1, 'each shot once'); }

// ---- 5. texts, Codex, the editor count, Map 20 ----
const app = rd('arena_app.js');
ok(/function ui27SkillCount\(effects\)\{[^]*?B\.skillCountParts/.test(app), "the card editor's two-skill count is the budget's (families included)");
ok(/BB?\.ARROW_FAMILY|ARROW_FAMILY/.test(app.slice(app.indexOf('function skillFamilies('), app.indexOf('function skillFamilyId('))), 'the Codex skill filter groups each family under one chip');
ok(T['ui.skn-bolt'] === 'Bolt' && /arrow/i.test(T['ui.sk-arrow-family-codex']) && /Speed 2/.test(T['ui.sk-bolt-family-codex']), 'the Codex family notes and the Bolt chip name');
ok(/after the swings/.test(T['ui.sk-archer']) /* 2026-11-17: under 20 words (d-2026-10-19) */ && !/Speed 1/.test(T['ui.skx-shock-bolt']), "Archer's text says after the swings; Shock Bolt's note no longer says Speed 1");
ok(!/at Speed 1 \(after Quick units/.test(app) && (app.match(/at Speed 2 \(with Quick units, before the rest swing\)/g) || []).length === 6, 'the six bolt descriptions read Speed 2');
{ const F = new Function(app.match(/const MAP_FOCUS_SKILLS = \{[^\n]*\n/)[0] + 'return MAP_FOCUS_SKILLS;')(); ok(F[20].join() === 'fireArrow', "Map 20's focus skill is Arrow (Flaming)"); }
{ const j = JSON.parse(rd('docs/design/redesign2-2026-11-16.json')); ok(j.MAP_FOCUS['20'].join() === 'Arrow (Flaming)' && /Fire Bolt/.test(rd('docs/design/redesign2-2026-11-16.md')), 'REDESIGN2: Map 20 Arrow (Flaming), Fire Bolt on the Dragon Lair'); }
ok(/ARROW1/.test(rd('docs/project-state.md')) && /ARROW1/.test(rd('docs/CHANGELOG.md')), 'project-state and the CHANGELOG name ARROW1');
ok(/arrow1-2026-11-16/.test(rd('tests/run-all.sh')), 'run-all.sh lists this test');
for(const L of ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']){ const pk = JSON.parse(rd('lang/' + L + '.json'));
  ok(['ui.sk-arrow-family-codex', 'ui.sk-bolt-family-codex', 'ui.skn-bolt', 'ui.sk-archer', 'ui.skx-shock-bolt'].every(k=> pk[T[k]]), `${L}: the ARROW1 texts are translated`); }

console.log(`arrow1: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
