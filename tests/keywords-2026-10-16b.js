#!/usr/bin/env node
// 2026-10-16 (09:00 list):
//   A. "All Worthy cards become Bounty. Worthy will seem something else in the future."
//      Every card says Bounty; an old Worthy N on a saved / published card is migrated to Bounty N as it loads
//      (migrateWorthyToBounty in arena_app.js); the engine no longer reads `worthy`; the key is an empty, hidden slot.
//   B. "Evade to non-swimmers for me to test." While the tide is in (Flood, Ebb or High Tide), Tide units are Evasive against
//      attacks from non-Tide units. A test switch: rules.tideEvade, the battle option opts.tideEvade, or the page's
//      globalThis.BramblewoodTestRules.tideEvade (the Admin / Test Lab toggle). Off by default.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:5, health:100000, wait:0, cost:0, effects: effects || {}}, o || {});
const base = H.loadCardDefs();
const defs = Object.assign({}, base, {
  'te-hit': U('te-hit'), 'te-tidehit': U('te-tidehit', {tide:true}), 'te-fence': U('te-fence', {fencing:true}),
  'te-tide': U('te-tide', {tide:true}, {attack:0}), 'te-swim': U('te-swim', {swimmer:true}, {attack:0}), 'te-plain': U('te-plain', {}, {attack:0}),
  'te-evtide': U('te-evtide', {tide:true, evasive:true}, {attack:0}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
const src = fs.readFileSync(path.join(__dirname, '..', 'arena_app.js'), 'utf8');
const eng = fs.readFileSync(path.join(__dirname, '..', 'bramblewood-engine.js'), 'utf8');
const cards = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'canonical', 'cards.json'), 'utf8'));

// ---- B. Tide evade
// The share of N single-target hits that land, attacker on side `ap` hitting the defender opposite it.
function landed(o){
  const e = E.makeSimEngine(defs, E.mulberry32(o.seed || 11), Object.assign({recordEvents:true, battleMode:'open', rules: o.rules}, o.opts || {}));
  const P = {1: e.newPlayer(1, {}), 2: e.newPlayer(2, {})};
  if(o.tide !== false){ e.startTide(); for(let r = 2; r <= (o.round || 2); r++) e.roundStart(P, r, so, {}, []); }
  const ap = o.ap || 1, dp = ap === 1 ? 2 : 1;
  e.debugSpawnCard(P, so, ap, o.att, 'left', {}, []); e.debugSpawnCard(P, so, dp, o.def, 'left', {}, []);
  const A = all(P[ap])[0], D = all(P[dp])[0]; const N = o.n || 200; let ev = [], miss = 0;
  for(let i = 0; i < N; i++){ ev = []; e.debugAttack(P, so, A.uid, {}, ev); if(ev.some(x=> x.type === 'evaded' && x.targetUid === D.uid)) miss++; }
  const reasons = new Set(); // what the front end plays: the normal Evasive dodge
  { const e2 = []; for(let i = 0; i < 40; i++) e.debugAttack(P, so, A.uid, {}, e2); e2.filter(x=> x.type === 'evaded').forEach(x=> reasons.add(x.reason)); }
  return {rate: (N - miss) / N, miss, reasons: [...reasons], e};
}
const near = (x, y, tol)=> Math.abs(x - y) <= (tol || 0.12);
{ const r = landed({att:'te-hit', def:'te-tide'}); ok(r.rate === 1, `B. off by default: a Tide unit in the Flood takes every hit (${r.rate})`); ok(r.e.tideEvadeOn() === false, 'B. tideEvadeOn() is false by default'); }
{ const r = landed({att:'te-hit', def:'te-tide', rules:{tideEvade:true}});
  ok(near(r.rate, 0.5), `B. rules.tideEvade: a plain attacker lands about 1 in 2 on a Tide unit in the Flood (${r.rate})`);
  ok(r.reasons.length === 1 && r.reasons[0] === 'evasive', `B. ...and the dodge is the normal Evasive one (${r.reasons})`); ok(r.e.tideEvadeOn() === true, 'B. tideEvadeOn() reports it'); }
{ const r = landed({att:'te-hit', def:'te-tide', opts:{tideEvade:true}}); ok(near(r.rate, 0.5), `B. the battle option opts.tideEvade turns it on too, for sims (${r.rate})`); }
{ globalThis.BramblewoodTestRules = {tideEvade:true};
  const r = landed({att:'te-hit', def:'te-tide'}); ok(near(r.rate, 0.5), `B. the page's test switch (globalThis.BramblewoodTestRules) turns it on (${r.rate})`);
  globalThis.BramblewoodTestRules = {tideEvade:false};
  const r2 = landed({att:'te-hit', def:'te-tide'}); ok(r2.rate === 1, `B. ...and off again (${r2.rate})`); delete globalThis.BramblewoodTestRules; }
{ const r = landed({att:'te-hit', def:'te-tide', rules:{tideEvade:true}, round:3}); ok(r.e.getTide() === 'ebb' && near(r.rate, 0.5), `B. on the Ebb too (${r.e.getTide()}, ${r.rate})`); }
{ const r = landed({att:'te-hit', def:'te-tide', rules:{tideEvade:true, highTide:true}, round:5}); ok(r.e.getTide() === 'high' && near(r.rate, 0.5), `B. and at High Tide (${r.e.getTide()}, ${r.rate})`); }
{ const r = landed({att:'te-hit', def:'te-tide', rules:{tideEvade:true}, tide:false}); ok(r.e.getTide() === null && r.rate === 1, `B. no tide in: no dodge (${r.e.getTide()}, ${r.rate})`); }
{ const r = landed({att:'te-hit', def:'te-tide', rules:{tideEvade:true, permaTide:true}, tide:false}); ok(near(r.rate, 0.5), `B. under Perma-tide the tide is always in (${r.rate})`); }
{ const r = landed({att:'te-tidehit', def:'te-tide', rules:{tideEvade:true}}); ok(r.rate === 1, `B. a Tide attacker (a swimmer) is not dodged (${r.rate})`); }
{ const r = landed({att:'te-hit', def:'te-plain', rules:{tideEvade:true}}); ok(r.rate === 1, `B. a unit without Tide gets nothing (${r.rate})`); }
{ const r = landed({att:'te-hit', def:'te-swim', rules:{tideEvade:true}}); ok(near(r.rate, 0.5), `B. an old Swimmer counts as Tide (${r.rate})`); }
{ const r = landed({att:'te-hit', def:'te-tide', rules:{tideEvade:true}, ap:2}); ok(near(r.rate, 0.5), `B. both sides: the player's Tide unit dodges the enemy too (${r.rate})`); }
{ const r = landed({att:'te-fence', def:'te-tide', rules:{tideEvade:true}}); ok(r.rate === 1, `B. Fencing cuts through it, as it does Evasive (${r.rate})`); }
{ const r = landed({att:'te-hit', def:'te-evtide', rules:{tideEvade:true}}); ok(near(r.rate, 0.5), `B. an Evasive Tide unit still rolls once, not twice (${r.rate})`); }
// the switches in the app
ok(/function tideEvadeOn\(\)\{/.test(eng) && /globalThis\.BramblewoodTestRules/.test(eng) && /return \{ tideEvadeOn, /.test(eng), 'B. the engine reads rules / opts / the page switch, and exposes tideEvadeOn');
ok(/const TEST_RULE_DEFS = \[\n  \{key:'tideEvade',/.test(src) && /testRuleOn\(k\)\{ try\{ return !!\(adminModeEnabled && testRulesStored\(\)\[k\]\)/.test(src), 'B. the Admin rule test only counts while Admin Mode is on');
ok(/\$\{adminModeEnabled \? testRulesPanelHTML\(\) : ''\}/.test(src) && /id="admin\$\{r\.key\[0\]\.toUpperCase\(\) \+ r\.key\.slice\(1\)\}Chk"/.test(src) && /getElementById\('adminTideEvadeChk'\)/.test(src), 'B. the Admin page has the switch');
ok(/data-sbxrule=/.test(src) && /setTestRule\(chk\.getAttribute\('data-sbxrule'\), chk\.checked\)/.test(src), 'B. ...and so does the Test Lab panel (admins)');
ok(/\{id:'tideevade', group:'tideEvade', icon:'🌊', name:'Tide evade \(test\)', [^\n]*rules:\{tideEvade:true\}[^\n]*editorOnly:true\}/.test(src) && /'tideSpout', 'tideEvade', 'misty'/.test(src), 'B. Edit skirmish can add it as a field rule');
ok(/pillTipHTML\(name, te \? \[TIDE_PILL_TIP, TIDE_EVADE_TIP\]/.test(src) && /'Evasive vs non-Tide \(test\)'/.test(src), 'B. the Tide pill and the Tide chip say so while it is on');

// ---- A. Worthy -> Bounty
ok(!cards.some(c=> JSON.stringify(c.effects || {}).includes('worthy') || JSON.stringify(c.equip || {}).includes('worthy')), 'A. no card carries Worthy (effects, grants, triggers, equipment)');
{ const ch = fs.readFileSync(path.join(__dirname, '..', 'canonical', 'characters.json'), 'utf8'); ok(!/worthy/i.test(ch), 'A. nor any character'); }
{ const pick = name=>{ const i = src.indexOf(`function ${name}(`); let d = 0, j = src.indexOf('{', i); for(; j < src.length; j++){ if(src[j] === '{') d++; else if(src[j] === '}' && --d === 0) break; } return src.slice(i, j + 1); };
  const ctx = {}; vm.createContext(ctx); vm.runInContext(pick('wtbHasWorthy') + pick('wtbFix') + pick('migrateWorthyToBounty'), ctx);
  const M = ctx.migrateWorthyToBounty, J = JSON.stringify;
  ok(J(M({id:'x', effects:{worthy:2}}).effects) === J({bounty:2}), 'A. Worthy 2 becomes Bounty 2');
  ok(M({effects:{worthy:2, bounty:1}}).effects.bounty === 2 && M({effects:{bounty:3, worthy:1}}).effects.bounty === 3, 'A. with both, the larger stays');
  ok(J(M({effects:{worthy:true}}).effects) === J({bounty:1}), 'A. Worthy (true) is Bounty 1');
  ok(!('worthy' in M({effects:{worthy:2, nocturnal:true}}).effects) && M({effects:{worthy:2, nocturnal:true}}).effects.nocturnal === true, 'A. worthy is dropped, the rest kept');
  ok(J(M({effects:{devour:{attack:1, grant:{worthy:1}}}}).effects.devour) === J({attack:1, grant:{bounty:1}}), 'A. a skill grant {worthy: 1} becomes {bounty: 1}');
  ok(M({effects:{triggers:[{on:'onSpawn', do:'grant', skill:'worthy'}]}}).effects.triggers[0].skill === 'bounty', "A. a trigger naming 'worthy' names 'bounty'");
  ok(J(M({cardType:'equipment', equip:{grant:{worthy:2}}}).equip) === J({grant:{bounty:2}}), 'A. an equipment grant too');
  ok(J(M({granted:['worthy', 'bounty', 'tide']}).granted) === J(['bounty', 'tide']), 'A. a granted list too (no duplicate)');
  ok(M({__deleted:true, deletedSnapshot:{effects:{worthy:1}}}).deletedSnapshot.effects.bounty === 1, 'A. a deleted card restores as Bounty');
  { const d = {id:'y', effects:{bounty:1}, flavor:'worthy of note'}; ok(M(d) === d, 'A. a card with nothing to move is returned as it is (flavor text untouched)'); }
  ok(M(null) === null, 'A. null passes through'); }
ok(/return migrateWorthyToBounty\(dropStaleArtPath\(r && r\.id, d0\)\);/.test(src) && /return migrateWorthyToBounty\(out\);/.test(src), 'A. published card_overrides rows (full and Ledger patches) are migrated as they load');
ok(/liveCards\[id\] = migrateWorthyToBounty\(dropStaleArtPath\(id, liveCards\[id\]\)\)/.test(src) && /const data = migrateWorthyToBounty\(doc\.data\(\)\);/.test(src), "A. ...and this browser's overlay and the live db");
ok(/const m = migrateWorthyToBounty\(liveCards\[id\]\); if\(m !== liveCards\[id\]\) liveCards\[id\] = m;/.test(src), 'A. ...with a safety net as the card list is built');
ok(/function bountyOf\(def\)\{ const e = \(def && def\.effects\) \|\| \{\}; return Math\.max\(0, Number\(e\.bounty\)\|\|0\); \}/.test(eng), 'A. the engine reads Bounty only');
ok(/function bountyN\(e\)\{ e = e \|\| \{\}; return Math\.max\(0, Number\(e\.bounty\)\|\|0\); \}/.test(src), 'A. ...and so does the card text');
ok(/\{key:'worthy', category:'passive', hidden:true, retired:true, reserved:true, label:'', kind:'number', min:0, desc:\(\)=> ''\}/.test(src), 'A. the worthy slot is kept, empty, hidden and reserved');
ok(!/^\s*worthy: v=>/m.test(src) && !/worthy:'🪵'/.test(src), 'A. no card line or icon for it');
ok(/PASSIVE_DEFS\.forEach\(p=>\{ if\(p\.reserved\) return;/.test(src) && /if\(p\.reserved \|\| l\.length < 4/.test(src), 'A. reserved slots stay off the card text and the keyword list');
ok(!/[`'"][^`'"\n]*\bWorthy\b[^`'"\n]*[`'"]/.test(src.split('\n').filter(l=> !/^\s*\/\//.test(l)).join('\n').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/ .*$/gm, '')), 'A. no player-visible "Worthy" string left in the app');
console.log(`keywords-2026-10-16b: ${fail} failure(s)`); process.exit(fail ? 1 : 0);
