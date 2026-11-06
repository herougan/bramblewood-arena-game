#!/usr/bin/env node
// 2026-11-03 (package ENG21): the owner's 20:28 notes.
//   1  Inspiring N: as it attacks, each adjacent ally gains N Inspiration tokens, +2 Attack each, stacking; the ally spends them all on its
//      next attack that lands a hit (a miss, a dodge or no hit keeps them). A pip with the count; an inspiration beat on the Attack number
//      when tokens come and go (Effects None: nothing; reduced motion: no motion). Priced in canonical/skill-costs.json; ENG21-1.
//   2  After Pounce has fired its pip is gone (and its line reads used), as Remember's.
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine, ROOT = H.ROOT, R = f=> fs.readFileSync(path.join(ROOT, f), 'utf8'), J = f=> JSON.parse(R(f));
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id === 1 ? 'A' : 'B';
const defs = Object.assign({}, H.loadCardDefs(), {
  'x-insp1': {id:'x-insp1', name:'Insp1', attack:1, health:50, wait:0, cost:0, effects:{inspiring:1}},
  'x-insp2': {id:'x-insp2', name:'Insp2', attack:1, health:50, wait:0, cost:0, effects:{inspiring:2}},
  'x-hit':   {id:'x-hit', name:'Hit', attack:5, health:50, wait:0, cost:0, effects:{}},
  'x-wall':  {id:'x-wall', name:'Wall', attack:0, health:500, wait:9, cost:0, effects:{}},
  'x-pounce':{id:'x-pounce', name:'Pouncer', attack:2, health:10, wait:0, cost:0, effects:{pounce:3}},
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(seed){ const e = E.makeSimEngine(defs, E.mulberry32(seed || 5), {recordEvents:true, battleMode:'open'}); return {e, P:{1: e.newPlayer(1, {}), 2: e.newPlayer(2, {})}}; }
const spawn = (e, P, pid, id, side)=>{ e.debugSpawnCard(P, so, pid, id, side || 'left', {}, []); return all(P[pid]).find(c=> c.defId === id && !c.__t && (c.__t = true)); };
const TXT = require(path.join(ROOT, 'bramblewood-texts.js')).TEXT, app = R('arena_app.js'), eng = R('bramblewood-engine.js');

// ---- 1. Inspiring: tokens, +2 each, stacking, events
{ const {e, P} = mk(); const I = spawn(e, P, 1, 'x-insp1', 'left'), A = spawn(e, P, 1, 'x-hit', 'right'); const ev = [];
  e.debugAttack(P, so, I.uid, {}, ev);
  ok(A.inspTokens === 1 && A.inspired === 1 /* 2026-11-06 (ENG27, owner item 14): +1 a token */, `Inspiring 1: the neighbour gains 1 token, +1 Attack (${A.inspTokens} / +${A.inspired})`);
  const g = ev.find(x=> x.type === 'statusFx' && x.kind === 'inspired');
  ok(g && g.targetUid === A.uid && g.tokens === 1 && g.amount === 1 && g.total === 1, 'the inspired event carries tokens 1, amount (Attack) 1, total 1'); // 2026-11-06 (ENG27, owner item 14): +1 a token (this test's +2 numbers halved below)
  e.debugAttack(P, so, I.uid, {}, []); e.debugAttack(P, so, I.uid, {}, []);
  ok(A.inspTokens === 3 && A.inspired === 3, `it stacks: three Inspiring swings, 3 tokens, +3 (${A.inspTokens} / +${A.inspired})`);
  const hq = P[2].hq.hp, ev2 = []; e.debugAttack(P, so, A.uid, {}, ev2);
  ok(hq - P[2].hq.hp === 8, `the hit that lands carries all of it: 5 + 3 = 8 on the bramble (${hq - P[2].hq.hp})`);
  ok(!A.inspTokens && !A.inspired, 'the landing hit spends every token');
  const sp = ev2.find(x=> x.type === 'statusFx' && x.kind === 'inspiredSpent');
  ok(sp && sp.attUid === A.uid && sp.amount === 3 && sp.tokens === 3, "an 'inspiredSpent' event names what was spent (+3, 3 tokens)");
  const hq2 = P[2].hq.hp; e.debugAttack(P, so, A.uid, {}, []); ok(hq2 - P[2].hq.hp === 5, 'the next swing is plain again'); }
{ const {e, P} = mk(); const I = spawn(e, P, 1, 'x-insp2', 'left'), A = spawn(e, P, 1, 'x-hit', 'right');
  e.debugAttack(P, so, I.uid, {}, []); ok(A.inspTokens === 2 && A.inspired === 2, `Inspiring 2 grants 2 tokens, +2 (${A.inspTokens} / +${A.inspired})`); }
// a unit hit (not only the bramble) spends them too
{ const {e, P} = mk(); const I = spawn(e, P, 1, 'x-insp1', 'left'), A = spawn(e, P, 1, 'x-hit', 'right'); spawn(e, P, 2, 'x-wall', 'left'); spawn(e, P, 2, 'x-wall', 'right');
  const tot = ()=> all(P[2]).reduce((a, c)=> a + c.hp, 0);
  e.debugAttack(P, so, I.uid, {}, []); const hp = tot(), hq = P[2].hq.hp; e.debugAttack(P, so, A.uid, {}, []);
  ok(hp - tot() === 6 && hq === P[2].hq.hp && !A.inspTokens /* 2026-11-06 (ENG27): +1 a token */, `a hit on a unit: 5 + 1 = 6, tokens spent (${hp - tot()}, ${A.inspTokens})`); }
// a miss keeps them: a Blind ally swinging at the bramble, over seeds; when it misses its tokens stay, when it lands they go
{ let kept = 0, spent = 0, bad = 0;
  for(let s = 1; s < 40; s++){ const {e, P} = mk(s); const I = spawn(e, P, 1, 'x-insp1', 'left'), A = spawn(e, P, 1, 'x-hit', 'right');
    e.debugAttack(P, so, I.uid, {}, []); A.blind = 9; const hq = P[2].hq.hp; e.debugAttack(P, so, A.uid, {}, []); const d = hq - P[2].hq.hp;
    if(d === 0){ if(A.inspTokens === 1 && A.inspired === 1) kept++; else bad++; } else if(d === 6 && !A.inspTokens) spent++; else bad++; } // 2026-11-06 (ENG27): +1 a token
  ok(kept > 0 && spent > 0 && bad === 0, `a missed swing keeps its Inspiration, a landed one spends it (kept ${kept}, spent ${spent}, wrong ${bad})`); }
// the ally in front of / behind it on a rows board is still adjacent (GD2), unchanged
ok(/frontBehindOf\(players\[a\.attId\], a\.att\)/.test(eng) && /ally\.inspTokens = \(ally\.inspTokens\|\|0\) \+ insp/.test(eng), 'the grant goes to left / right and front / behind (GD2), as tokens');
ok(/const INSPIRE_TOKEN_ATK = 1;/.test(eng), 'one token is +1 Attack (INSPIRE_TOKEN_ATK)'); // 2026-11-06 (ENG27, owner item 14: "Inspiration only gives +1 attack, not 2")

// ---- 1b. the board: pip, VFX, snapshots, texts
ok(/if\(c\.inspTokens>0\) badges\.push\(eng21InspPip\(c\)\)/.test(app) && (app.match(/badges\.push\(eng21InspPip\(c\)\)/g) || []).length === 2, 'both status strips show the Inspiration pip');
ok(/📯\$\{n\}<\/span>/.test(app) && /TX\('ui\.eng21-insp-tip'/.test(app), 'the pip is 📯 and the count, with its tip');
const fx = app.slice(app.indexOf('function eng21InspNumFx'), app.indexOf('function eng21InspNumFx') + 900);
ok(/fxAtLeast\('low'\)\) return/.test(fx) && /reducedMotion\(\) \? 'eng21-insp-still'/.test(fx) && /\.stats \.atk/.test(fx), 'the VFX sits on the Attack number; Effects None: nothing; reduced motion: the still tint');
ok(/@keyframes eng21InspGain/.test(app) && /@keyframes eng21InspSpend/.test(app) && !/eng21-insp-still\{[^}]*animation/.test(app), 'gain and spend have their own beat; the still class has no animation');
ok(/eng21InspNumFx\(ev\.targetUid, 'gain'\)/.test(app) && /eng21InspNumFx\(ev\.attUid, 'spend'\)/.test(app), 'the beat plays when tokens are gained and when they are spent');
ok(/else if\(ev\.kind==='inspiredSpent'\)\{ pl2InspireSpent\(ev\); \}/.test(app) && !/ev\.type === 'evaded' \|\| ev\.type === 'blindMiss'\) && ev\.attUid != null && !ev\.ranged\)\{ \/\/ PL2/.test(app), "the board spends on the engine's inspiredSpent, not on any swing");
ok((app.match(/inspTokens:(rc|c)\.inspTokens\|\|0, pounceSpent:!!(rc|c)\.pounceSpent/g) || []).length === 2 && /\$\{c\.inspTokens\|\|0\}:\$\{c\.pounceSpent\?1:0\}:/.test(app), 'the replay snapshots and the render key carry the tokens and the Pounce mark');
['ui.eng21-sk-inspiring', 'ui.eng21-insp-tip', 'ui.eng21-log-inspired', 'ui.eng21-log-insp-spent', 'ui.eng21-pounce-used'].forEach(k=> ok(TXT[k], 'text key ' + k));
ok(/inspiring: v=> TX\('ui\.eng21-sk-inspiring'/.test(app) && /desc:v=> TX\('ui\.eng21-sk-inspiring'/.test(app), 'the skill line and the editor say the new rule');
{ const codes = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];
  const keys = ['ui.eng21-sk-inspiring', 'ui.eng21-insp-tip', 'ui.eng21-log-inspired', 'ui.eng21-log-insp-spent', 'ui.eng21-pounce-used'];
  codes.forEach(c=>{ const p = J('lang/' + c + '.json'); const miss = keys.filter(k=> !p[TXT[k]]); ok(!miss.length, `${c}: the ENG21 texts are translated (${miss.join(', ')})`); });
  ok(codes.every(c=> !J('lang/ui/' + c + '.json')['inspired {v1} (+{v2}⚔ next swing) 📯']), 'the old "next swing" log line has left the UI packs'); }

// ---- 1c. the price, the docs
{ const sc = J('canonical/skill-costs.json'), rows = Array.isArray(sc) ? sc : (sc.skills || sc.table || Object.values(sc).find(Array.isArray));
  const r = rows.find(x=> x && x.id === 'inspiring'); ok(r && /ENG21/.test(r.appliedAt || ''), 'inspiring is re-priced by ENG21');
  ok(r && r.eng21Was && r.eng21Was.value === 3.3, 'its old price is kept (eng21Was 3.3)'); }
{ const st = R('docs/project-state.md'); ok(/Inspiring N[^\n]*Inspiration[^\n]*ENG21-1/.test(st) && /It stacks!/.test(st), 'project-state records the rule, the owner quote and ENG21-1'); }
{ const d = J('docs/decisions.json'); ok(d.items.some(x=> x.id === 'ENG21-1'), 'decision ENG21-1'); }
{ const cat = R('docs/effects-catalogue.md'); ok(/Inspiration/.test(cat) && /ENG21/.test(cat), 'the effects catalogue describes it'); }

// ---- 2. Pounce: its pip goes once it has fired
{ const {e, P} = mk(); spawn(e, P, 2, 'x-wall', 'left'); const h = {uid: 91001, defId:'x-pounce'}; P[1].hand.push(h);
  const ev = []; e.placeCard(P, so, 1, h.uid, 'left', {}, ev); const pc = all(P[1]).find(c=> c.defId === 'x-pounce');
  ok(ev.some(x=> x.type === 'pounce') && pc && pc.pounceSpent === true, 'a Pounce that fires marks the unit (pounceSpent)'); }
ok(/if\(e\.pounce && !eng21PounceSpent\(bopts\)\)/.test(app) && /function eng21PounceSpent\(bopts\)/.test(app), 'the board drops the Pounce pip once it fired');
ok(/if\(p\.key==='pounce' && liveCard\)\{ const lc = currentCardByUidSafe\(liveCard\.uid\) \|\| liveCard; if\(lc && lc\.pounceSpent\)/.test(app), 'its line reads used, as Remember');

console.log(`eng21-2026-11-03: ${n} checks, ${fail} failure(s)`);
process.exit(fail ? 1 : 0);
