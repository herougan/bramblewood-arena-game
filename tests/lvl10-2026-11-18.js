#!/usr/bin/env node
// 2026-11-18 (package LVL10; owner 21:11 "define the lvl 10 form ... save it as stat differences"; 21:22 "make the other skills unlock at later
// levels"). Covers: 1. every card the generator fills has levelBonus (non-negative whole deltas, skill numbers that only rise); 2. each level 1-10
// fits both caps at N(L) (a card over at Level 1 never gets worse); 3. the style split (A holds the cards with nothing to grow; B, C, D even;
// stats-first cards over half); 4. the game reads it: statsAtLevel = base + deltas, effectsAtLevel lays a skill's new number on at its level,
// a moved skill is off at Level 1 and on from its level; the limit break and the fallback curve; 5. unlocks: levels from 2, a third skill rare
// before 7, owner-edited cards untouched; 6. the generator is idempotent; 7. the card editor's growth table (TX keys, levelBonus save).
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.join(__dirname, '..');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8')), byId = Object.fromEntries(cards.map(c=> [c.id, c]));
const BB = require(path.join(ROOT, 'bramblewood-budget.js')), T = require(path.join(ROOT, 'tools', 'skill_costs.js')).make(JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')));
const GEN = require(path.join(ROOT, 'tools', 'lvl10', 'gen_2026_11_18.js'));
const LB = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = LB.G;
const effectsAtLevel = new Function('BramblewoodBudget', 'cardBaseLevel', LB.grab('effectsAtLevel') + '\nreturn effectsAtLevel;')(BB, GEN.baseLevel);
const app = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8'), texts = fs.readFileSync(path.join(ROOT, 'bramblewood-texts.js'), 'utf8');
const report = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'lvl10-2026-11-18.json'), 'utf8'));
const numV = v=> v && typeof v === 'object' ? v.v : (v === true ? 1 : v);

// ---- 1. the data
const filled = cards.filter(GEN.eligible), live = filled.filter(c=> !c.unattainable && !c.awaitingSource);
ok(filled.length > 800 && filled.filter(c=> c.levelBonus).length >= filled.length - 5, `1. ${filled.filter(c=> c.levelBonus).length} of ${filled.length} eligible cards carry levelBonus`);
ok(cards.filter(c=> c.levelBonus && !GEN.eligible(c) && !c.token).length === 0, '1. no castle, egg, spell or equipment carries levelBonus'); // 2026-11-19 (LVL11): tokens carry their own (tools/lvl10/tokens_2026_11_19.js)
const shape = [];
filled.forEach(c=>{ const lb = c.levelBonus || {}, b = GEN.baseLevel(c), last = {};
  Object.keys(lb).forEach(L=>{ const o = lb[L]; if(!(+L > b && +L <= 10)) shape.push(c.id + ' L' + L);
    ['attack', 'health'].forEach(k=>{ if(o[k] != null && !(Number.isInteger(o[k]) && o[k] > 0)) shape.push(c.id + ' L' + L + ' ' + k); });
    Object.keys(o).forEach(k=>{ if(!['attack', 'health', 'skills'].includes(k)) shape.push(c.id + ' L' + L + ' ' + k); });
    Object.keys(o.skills || {}).forEach(k=>{ const v = numV(o.skills[k]), was = last[k] != null ? last[k] : numV(Object.assign({}, c.effects, ...Object.values(c.levelSkills || {}))[k]); if(!(v > (was || 0))) shape.push(c.id + ' L' + L + ' ' + k); last[k] = v; }); }); });
ok(!shape.length, '1. levelBonus: Levels above the base to 10, whole positive deltas, a skill\'s number only rises: ' + shape.slice(0, 6).join('; '));

// ---- 2. both caps at every level
const over = [];
live.forEach(c=>{ const b = GEN.baseLevel(c), r1 = T.budgetAt(c, Math.max(1, b), b), f1 = r1.x1 / r1.N, g1 = r1.x2 / r1.N2;
  for(let L = Math.max(2, b + 1); L <= 10; L++){ const r = T.budgetAt(c, L, b), r0 = T.budgetAt(Object.assign({}, c, {levelBonus: {}}), L, b); if(r0.x1 > r0.N + 0.01) continue; /* an older levelSkills arrival alone past N (Rootworm Colony's Bloom at 2) */ if(r.x1 > Math.max(r.N, r.N * f1) + 0.01 || r.x2 > Math.max(r.N2, r.N2 * g1) + 0.01) over.push(`${c.id} L${L} ${r.x1}/${r.N}`); } });
ok(!over.length, '2. every level 2-10 inside both caps at N(L) (a card over at Level 1 no worse): ' + over.slice(0, 6).join('; '));
ok(report.fillByLevel['10'].mean >= 0.85 && report.fillByLevel['10'].mean <= 1, `2. the Level 10 forms fill N(10) inside the band on average (${report.fillByLevel['10'].mean})`);

// ---- 3. styles
const s = report.styles.inPlay, tot = s.A + s.B + s.C + s.D;
ok(Math.max(s.B, s.C, s.D) - Math.min(s.B, s.C, s.D) <= 0.05 * tot, `3. B, C and D even within 5% (${JSON.stringify(s)})`);
ok(s.A >= Math.round(tot / 4) - 1, '3. A holds at least a quarter (every card with nothing to grow)');
ok((s.A + s.B + s.C) / tot > 0.5, '3. cards that grow mostly in stats are over half');
ok(Math.abs(report.realizedSkillShare.D - 0.5) <= 0.06 && Math.abs(report.realizedSkillShare.C - 0.25) <= 0.06, `3. realized skill shares near their style (${JSON.stringify(report.realizedSkillShare)})`);

// ---- 4. the game reads it
const bk = byId['bee-knight'], cum = (c, L)=> Object.keys(c.levelBonus || {}).filter(k=> +k > GEN.baseLevel(c) && +k <= L).reduce((t, k)=> ({a: t.a + (c.levelBonus[k].attack || 0), h: t.h + (c.levelBonus[k].health || 0)}), {a: 0, h: 0});
const statsBad = live.slice(0, 400).filter(c=>{ for(let L = GEN.baseLevel(c) + 1; L <= 10; L++){ const st = G.statsAtLevel(c, L), d = cum(c, L); if(st.attack !== c.attack + d.a || st.health !== c.health + d.h) return true; } return false; }).map(c=> c.id);
ok(!statsBad.length, '4. statsAtLevel = base stats + the deltas up to L: ' + statsBad.slice(0, 6).join(', '));
{ const c = live.find(x=> Object.values(x.levelBonus || {}).some(o=> o.skills && typeof Object.values(o.skills)[0] === 'number') && !x.levelSkills);
  const L = +Object.keys(c.levelBonus).find(k=> c.levelBonus[k].skills), k = Object.keys(c.levelBonus[L].skills)[0];
  ok(effectsAtLevel(c, L)[k] === c.levelBonus[L].skills[k] && effectsAtLevel(c, L - 1)[k] === c.effects[k], `4. effectsAtLevel: ${c.id}'s ${k} ${c.effects[k]} -> ${c.levelBonus[L].skills[k]} at Level ${L}`); }
{ const c = live.find(x=> /LVL10 \(owner 21:22\)/.test(x.creatorNote || '')), L = +Object.keys(c.levelSkills)[0], k = Object.keys(c.levelSkills[L])[0];
  ok(!(k in (c.effects || {})) && !(k in effectsAtLevel(c, L - 1)) && (k in effectsAtLevel(c, L)), `4. a moved skill: ${c.id}'s ${k} off at Level 1, on from Level ${L}`); }
{ const r = BB.forgeCurve(Object.assign({}, bk, {obtainMap: 0}), 1, 11).rows, o = BB.forgeCurve(Object.assign({}, bk, {obtainMap: 0, levelBonus: undefined}), 1, 11).rows;
  ok(r[11].health - r[10].health === o[11].health - o[10].health && r[11].attack - r[10].attack === o[11].attack - o[10].attack, '4. Level 11 (limit break) adds the Forge curve\'s own step on top of Level 10');
  ok(BB.forgeCurve(Object.assign({}, bk, {token: true}), 1, 10).rows[10].health === r[10].health, '4. a token reads its levelBonus too (2026-11-19 LVL11; was: never)'); }
ok(/BramblewoodBudget\.levelBonusAt\(b, L/.test(app) && /d\.levelBonus \? JSON\.stringify\(d\.levelBonus\)/.test(app), '4. effectsAtLevel and the curve cache read levelBonus');

// ---- 5. unlocks
const moved = cards.filter(c=> /LVL10 \(owner 21:22\)/.test(c.creatorNote || ''));
ok(moved.length === report.unlockCards.all && moved.length > 50, `5. ${moved.length} cards moved skills off Level 1 (the report's ${report.unlockCards.all})`);
ok(moved.every(c=> Object.keys(c.levelSkills).every(L=> +L >= 2 && +L <= 10)), '5. every moved skill arrives at Level 2-10');
const late3 = moved.filter(c=> Object.keys(c.levelSkills).length >= 2 && Math.max(...Object.keys(c.levelSkills).map(Number)) < 7).length, third = moved.filter(c=> Object.keys(c.levelSkills).length >= 2).length;
ok(third <= late3 + 3, `5. a third skill at Level 7+ is rare (${third - late3} of ${third})`);
ok(moved.every(c=> !GEN.isOwner(Object.assign({}, c, {creatorNote: c.creatorNote.replace(/ 2026-11-18 LVL10.*$/, '')}))), '5. no owner-edited card had a skill moved');
ok(moved.every(c=> T.budgetAt(c, 1, 1).ok || T.budgetAt(c, 1, 1).x1 / T.budgetAt(c, 1, 1).N <= 1.3), '5. the Level 1 re-fits stay in reach of N(1)');

// ---- 6. idempotent
{ const out = cp.execFileSync('node', [path.join(ROOT, 'tools', 'lvl10', 'gen_2026_11_18.js'), '--dry'], {encoding: 'utf8'}); ok(/"cards": 0/.test(out), '6. a re-run fills nothing (owner edits are kept)'); }

// ---- 7. the editor
const keys = ['ui.lvl10-title', 'ui.lvl10-help', 'ui.lvl10-skill', 'ui.lvl10-total', 'ui.lvl10-budget', 'ui.lvl10-clear', 'ui.lvl10-style'];
ok(keys.every(k=> texts.includes(`"${k}":`) && app.includes(`'${k}'`)), '7. the growth table\'s TX keys');
ok(/function applyLevelStatsEditor\(c\)[\s\S]{0,400}c\.levelBonus = r\.levelBonus/.test(app) && (app.match(/applyLevelStatsEditor\((c|editingCard)\)/g) || []).length >= 2, '7. the editor saves levelBonus (and the Level 0 row) on both paths');
ok(/T\.budgetAt\(probe, L, from\)/.test(app), '7. each row shows the budget use at its level');
console.log(`lvl10-2026-11-18: ${n - fail}/${n} checks passed`);
process.exit(fail ? 1 : 0);
