#!/usr/bin/env node
// 2026-11-09 (package ENG38; owner 21:36 on ENG37-1: "default b. Never have prioritised targeting, alwayes default to randomign"):
//   1 Reach with both neighbours: a coin flip whatever their Health (was: less Health first); Taunt still draws it
//   2 the engine's own target picks are random: unnamed tie-breaks (left first, first listed, the newest) and unnamed rules (Amore's
//     mate, Dismantle's loose piece) pick at random with the fight's seeded RNG; named rules (most hurt, most Attack, nearest) are kept
//   3 the helpers roll only on a real choice (a fight with no tie draws the same numbers); docs, decision ENG38-1, CHANGELOG
'use strict';
const H = require('./lib/harness.js');
const E = H.Engine;
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8'), J = f=> JSON.parse(rd(f));
let fail = 0, pass = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } else pass++; };
const so = id=> id===1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:0, health:50, wait:0, cost:0, effects: effects || {}}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'e38-reach': U('e38-reach', {reach:true}, {attack:3}), 'e38-wall': U('e38-wall', {}), 'e38-wall5': U('e38-wall5', {}, {health:5}),
  'e38-taunt': U('e38-taunt', {taunt:true}), 'e38-heal': U('e38-heal', {healing:2}, {wait:9}), 'e38-cure': U('e38-cure', {cure:1}, {wait:9}),
  'e38-ramp': U('e38-ramp', {rampart:true}), 'e38-sneak': U('e38-sneak', {stealth:true}, {attack:4}),
  'e38-hit5': U('e38-hit5', {}, {attack:5, health:200, wait:9}), 'e38-hit2': U('e38-hit2', {}, {attack:2, health:200, wait:9}),
  'e38-x': U('e38-x', {}, {attack:2, health:20, wait:9}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(seed, rules, rnd){ const e = E.makeSimEngine(defs, rnd || E.mulberry32(seed || 7), {recordEvents:true, battleMode:'open', rules: rules || {}});
  return {e, P:{1:e.newPlayer(1, {}, {health:200}), 2:e.newPlayer(2, {}, {health:200})}}; }
function put(e, P, pid, id, slot){ const pl = P[pid]; const c = e.makeBoardCard(id); c.slot = slot;
  const cs = all(pl).concat(c); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncSlots(pl); return c; }
const upkeep = (e, P)=>{ const ev = []; e.resolveCombat(P, so, {}, ev, 1); return ev; }; // every unit waits: only the upkeep acts
const swing = (e, P, c, ev)=>{ ev = ev || []; e.debugAttack(P, so, c.uid, {}, ev); return ev; };
const SEEDS = 40;

// ================= 1. Reach: a coin flip always =================
{ let L = 0, R = 0; for(let s = 1; s <= SEEDS; s++){ const {e, P} = mk(1000 + s); const a = put(e, P, 1, 'e38-reach', 0), l = put(e, P, 2, 'e38-wall', -1), r = put(e, P, 2, 'e38-wall5', 1);
    swing(e, P, a); if(l.hp < 50) L++; if(r.hp < 5) R++; }
  ok(L + R === SEEDS && L > 5 && R > 5, `Reach, both neighbours (50 and 5 Health): a coin flip, Health doesn't count (the 50: ${L}, the 5: ${R} of ${SEEDS})`); }
{ const {e, P} = mk(3); const a = put(e, P, 1, 'e38-reach', 0), t = put(e, P, 2, 'e38-taunt', -1), w = put(e, P, 2, 'e38-wall5', 1); swing(e, P, a);
  ok(t.hp === 47 && w.hp === 5, 'Taunt still draws a Reach swing'); }
// one neighbour: no roll at all (the RNG is not touched by the pick)
{ let calls = 0; const base = E.mulberry32(5), cnt = ()=>{ calls++; return base(); };
  const {e, P} = mk(0, {}, cnt); const a = put(e, P, 1, 'e38-reach', 0), t = put(e, P, 2, 'e38-wall', 1); const c0 = calls; swing(e, P, a);
  let calls2 = 0; const base2 = E.mulberry32(5), cnt2 = ()=>{ calls2++; return base2(); };
  const m2 = mk(0, {}, cnt2); const a2 = put(m2.e, m2.P, 1, 'e38-reach', 0), l2 = put(m2.e, m2.P, 2, 'e38-wall', -1), r2 = put(m2.e, m2.P, 2, 'e38-wall', 1); const d0 = calls2; swing(m2.e, m2.P, a2);
  ok(t.hp === 47 && (calls2 - d0) === (calls - c0) + 1, `the coin is flipped only with two neighbours (one: ${calls - c0} draws, two: ${calls2 - d0})`); }

// ================= 2. the helpers =================
{ const {e} = mk(9); const by = (a, b)=> a.v - b.v;
  const seen = new Set(); for(let i = 0; i < 60; i++) seen.add(e.eng38Best([{v:1, k:'a'}, {v:1, k:'b'}, {v:3, k:'c'}], by).k);
  ok(seen.size === 2 && !seen.has('c'), `eng38Best: the top rule holds, its tie at random (${[...seen].join(',')})`);
  let calls = 0; const base = E.mulberry32(1); const m = mk(0, {}, ()=>{ calls++; return base(); });
  const c0 = calls; m.e.eng38Best([{v:1}, {v:2}, {v:3}], by); m.e.eng38TopN([{v:1}, {v:2}, {v:3}], by, 2); m.e.eng38Pick([{v:1}]); m.e.eng38TopN([{v:1}, {v:2}, {v:2}], by, 1, true);
  ok(calls === c0, `no tie, no draw (${calls - c0} draws)`);
  m.e.eng38TopN([{v:1}, {v:2}, {v:2}], by, 2, true); ok(calls > c0, 'a tie at the cut: it draws');
  const ins = new Set(); for(let i = 0; i < 60; i++) ins.add(e.eng38TopN([{v:1, k:'a'}, {v:2, k:'b'}, {v:2, k:'c'}], by, 2, true).map(x=> x.k).sort().join(''));
  ok(ins.size === 2 && [...ins].every(x=> x[0] === 'a'), `eng38TopN: the top one always in, the tie for the last place at random (${[...ins].join(' ')})`); }

// ================= 3. named rules kept, their ties random =================
// Healing N: the most wounded (named) when there is one
{ const {e, P} = mk(11); const h = put(e, P, 1, 'e38-heal', 0), a = put(e, P, 1, 'e38-x', -1), b = put(e, P, 1, 'e38-x', 1); a.hp = 10; b.hp = 15;
  upkeep(e, P); ok(a.hp === 12 && b.hp === 15, `Healing: the most wounded unit (${a.hp}, ${b.hp})`); }
// ... and a tie at random (was: the left one)
{ let A = 0, B = 0; for(let s = 1; s <= SEEDS; s++){ const {e, P} = mk(2000 + s); put(e, P, 1, 'e38-heal', 0); const a = put(e, P, 1, 'e38-x', -1), b = put(e, P, 1, 'e38-x', 1); a.hp = 10; b.hp = 10;
    upkeep(e, P); if(a.hp > 10) A++; if(b.hp > 10) B++; }
  ok(A + B === SEEDS && A > 5 && B > 5, `Healing, two as wounded: one at random (left ${A}, right ${B})`); }
// Cure: the most envenomed, a tie at random
{ let A = 0, B = 0; for(let s = 1; s <= SEEDS; s++){ const {e, P} = mk(2100 + s); put(e, P, 1, 'e38-cure', 0); const a = put(e, P, 1, 'e38-x', -1), b = put(e, P, 1, 'e38-x', 1); a.poison = 3; b.poison = 3;
    upkeep(e, P); if(a.poison < b.poison) A++; if(b.poison < a.poison) B++; }
  ok(A > 5 && B > 5, `Cure, two as envenomed: one at random (left ${A}, right ${B})`); }
// Rampart: two in reach as near, one at random (was: the one listed first)
{ let A = 0, B = 0; for(let s = 1; s <= SEEDS; s++){ const {e, P} = mk(2200 + s); const k = put(e, P, 1, 'e38-sneak', 0); const r1 = put(e, P, 2, 'e38-ramp', -1), r2 = put(e, P, 2, 'e38-ramp', 1);
    swing(e, P, k); if(r1.hp < 50) A++; if(r2.hp < 50) B++; }
  ok(A + B === SEEDS && A > 5 && B > 5, `Rampart, two as near: one takes the share at random (left ${A}, right ${B})`); }
// Undertow (boss): the most Attack (named), a tie at random (was: the newest)
{ const {e, P} = mk(13, {bossGimmick:'undertow'}); const a = put(e, P, 1, 'e38-hit5', -1), b = put(e, P, 1, 'e38-hit2', 1); e.roundStart(P, 2, so, {}, []);
  ok(a.stunned > 0 && !(b.stunned > 0), 'Undertow: the unit with the most Attack'); }
{ let A = 0, B = 0; for(let s = 1; s <= SEEDS; s++){ const {e, P} = mk(2300 + s, {bossGimmick:'undertow'}); const a = put(e, P, 1, 'e38-hit5', -1), b = put(e, P, 1, 'e38-hit5', 1);
    e.roundStart(P, 2, so, {}, []); if(a.stunned > 0) A++; if(b.stunned > 0) B++; }
  ok(A + B === SEEDS && A > 5 && B > 5, `Undertow, two with the same Attack: one at random (older ${A}, newer ${B})`); }

// ================= 4. the source =================
{ const src = rd('bramblewood-engine.js');
  ok(!/h0 < h1 \? cols\[0\]/.test(src), 'Reach no longer compares Health');
  ok(/function eng38Pick\(/.test(src) && /function eng38Best\(/.test(src) && /function eng38TopN\(/.test(src), 'the ENG38 helpers');
  ok(/const mate = eng38Pick\(cands\)/.test(src), 'Amore: its mate at random');
  ok(/eng38Pick\(Object\.keys\(foe\.eqSlots\)/.test(src), 'Dismantle: a loose piece at random');
  const n = (src.match(/ENG38 \(2026-11-09/g) || []).length; ok(n >= 15, `ENG38 comments at each changed pick (${n})`); }

// ================= 5. texts, docs, decision, CHANGELOG =================
{ const TX = require(path.join(ROOT, 'bramblewood-texts.js')).TEXT, codex = TX['ui.sk-reach-codex'];
  ok(codex && /a coin flip when both have one/.test(codex) && !/less Health/.test(codex), 'the Reach codex text: a coin flip, no Health rule');
  ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'].forEach(code=> ok(!!J(`lang/${code}.json`)[codex], `lang/${code}.json: the new Reach codex text`));
  const ps = rd('docs/project-state.md'); ok(/Targeting picks at random, never by priority[^\n]*\*\*Built \(ENG38, 2026-11-09\)\.\*\*/.test(ps), 'project-state: the bullet reads Built (ENG38)');
  const d = J('docs/decisions.json'), it = (d.items || []).find(x=> x.id === 'ENG38-1');
  ok(it && (it.status === 'YET' || it.status === 'DONE') && it.default === 'a' && (it.body || '').split(/\s+/).length < 100 && it.options.length === 2, 'decision ENG38-1: YET or DONE (decided 11-09), default a, under 100 words');
  ok(/^## 2026-11-09 Package ENG38/m.test(rd('docs/CHANGELOG.md')), 'CHANGELOG entry'); // 2026-11-09 (ENG40): was the first 6000 characters, which later entries push it out of
  ok(/eng38-2026-11-09\.js/.test(rd('tests/run-all.sh')), 'run-all.sh runs this test');
  ok(/ENG38/.test(rd('docs/effects-catalogue.md')), 'effects-catalogue mentions ENG38'); }

console.log(`eng38: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
