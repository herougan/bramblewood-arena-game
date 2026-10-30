#!/usr/bin/env node
// 2026-10-31 (package BUDGET2). Owner on RECOST1-6 (10-30 23:25): "If Attack = 3 Health, we have to edit the first N formula to 3*attack
// instead."; X14 (the canon skill set), X15 (War Elephant's Arrow Count), the sims' biome tables (Anadromous, ANAD-1), the held DECK1-1 /
// DECK1-5 / SKL0-3. No games: the budget, the re-fit on record, the canon entries and the tool's static parts.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const rd = rel=> fs.readFileSync(path.join(ROOT, rel), 'utf8'), js = rel=> JSON.parse(rd(rel));
const BB = require(path.join(ROOT, 'bramblewood-budget.js')), SC = require(path.join(ROOT, 'tools', 'skill_costs.js'));
const table = js('canonical/skill-costs.json'), T = SC.make(table), cards = js('canonical/cards.json'), byId = Object.fromEntries(cards.map(c=> [c.id, c]));
const near = (a, b, e)=> Math.abs(a - b) <= (e == null ? 0.011 : e);

// ---- 1. the formula
ok(BB.DEFAULTS.attackWeight === 3 && table.budget.attackWeight === 3, '1. attackWeight 3 in bramblewood-budget.js and the skill-costs budget line');
ok(BB.DEFAULTS.scale === 1.13 && table.budget.scale === 1.13 && BB.DEFAULTS.cap2Mult === 1.57 && table.budget.cap2Mult === 1.57, '1. N x 1.13, cap2Mult 1.57 (2 / 1.13²) in both');
ok(near(1.57 * 1.13 * 1.13, 2, 0.01), '1. the cap-2 limit is unchanged in absolute terms (1.57 x 1.13² = 2.00)');
ok(BB.capScores(3, 5, 1, {}, null).x1 === 15 && BB.capScores(3, 5, 1, {}, null).x2 === 16, '1. cap 1 is 3A + H + S (3/5 with S 1: 15), cap 2 A·H + S·|S| (16)');
ok(near(BB.nAt(10, 1), 1.13 * (10 + 1 / 15) * (31 / 30)) && near(BB.nAt(10, 0), 1.13 * 9), '1. N(1) = 1.13 x (Base + 1/15)(1 + 1/30); N(0) = 1.13 x (Base - 1)');
ok(BB.formulaParts().cap1 === '(3A + H)×m + S ≤ N', '1. the formula text says 3A + H');
ok(BB.contextS('diurnalGrant', {attack: 1, health: 1}, ()=> 0).inner === 4 && BB.zeitS('nocturnal', {nocturnal: 2}).S === 3.18, '1. braces and the time of day count 3A + H (+1/+1 = 4; Nocturnal 2 = 0.53 x 6)');
ok(BB.thrS('requiem', true, {requiem: true}).inner === 8, '1. a threshold skill\'s plain {+2/+2} is 8 points');
{ const c = byId['otter-centurion'], cv = BB.forgeCurve(c, 1, 11), w = r=> 3 * r.attack + r.health;
  ok(w(cv.rows[11]) - w(cv.rows[1]) <= (cv.rows[11].N - cv.rows[1].N) / cv.m + 1 + 1e-9, `1. the Forge curve spends 3 points a point of Attack (otter-centurion: 3A + H ${w(cv.rows[1])} -> ${w(cv.rows[11])}, N ${cv.rows[1].N} -> ${cv.rows[11].N})`); }
ok(rd('bramblewood-budget.js').includes('BUDGET2 (2026-10-31, owner on RECOST1-6'), '1. the formula block quotes the owner and explains the fit');

// ---- 2. the re-fit on record and applied
const plan = js('docs/balance/budget2-refit-2026-10-31.json'), lmp = require(path.join(ROOT, 'tools', 'lib_map_pools.js'));
ok(plan.changes.length >= 140 && plan.changes.filter(r=> r.inPlay).length >= 70, `2. the re-fit is on record (${plan.changes.length} changes, ${plan.changes.filter(r=> r.inPlay).length} in play)`);
const TUT12 = new Set((js('canonical/map-pools.json').maps.m1.submaps || {}).mtut12 || []), LB = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = LB.G;
const bad = plan.changes.filter(r=>{ const c = byId[r.id]; if(!c || `${c.attack == null ? '-' : c.attack}/${c.health}` !== r.to) return true;
  const b = T.budget(c), b1 = T.budget(c, {level: 1}); if(!(b.ok && b1.ok && b.x1 > 0.6 * b.N)) return true;
  if(TUT12.has(r.id)){ const st = G.statsAtLevel(c, 0); if(!T.budget(Object.assign({}, c, {attack: st.attack, health: st.health, effects: {}}), {level: 0}).ok) return true; }
  return !/BUDGET2 re-fit/.test(c.creatorNote || ''); }).map(r=> r.id);
ok(!bad.length, `2. every re-fit card carries its new stats and its note, inside its band at its start level and Level 1 (T-1 / T-2 cards at Level 0 too): ${bad.slice(0, 6).join(', ') || 'all'}`);
ok(!plan.changes.some(r=> ['red-dragon', 'white-dragon', 'blue-dragon', 'green-dragon', 'black-dragon', 'caldera-wyrm'].includes(r.id)), '2. the Dragons and the Caldera Wyrm stay owner calls (not trimmed)');
ok(byId['war-elephant'].effects.arrowCount == null && byId['war-elephant'].effects.arrow === 2 && T.budget(byId['war-elephant']).ok, '2. War Elephant: Arrow Count 2 -> 1 (X15), inside its budget');
ok(byId['owl-nightwatch'].effects.nocturnal === 3 && T.budget(byId['owl-nightwatch']).ok, '2. Owl Nightwatch: Nocturnal 4 -> 3, inside its budget');
ok(['bee-drone', 'worker-ant'].every(id=> !plan.changes.some(r=> r.id === id)), '2. bee-drone and worker-ant stay held (RECOST1-5)');
// no in-play card left outside its band that was inside under 2A + H
{ const before = new Set((plan.counts.outsideBeforeIds || []).map(s=> s.replace(/ \(out of play\)$/, ''))), held = new Set(plan.held.map(h=> h.id));
  const out = cards.filter(c=> LB.CARD_DEFS_BASELINE[c.id] && !c.pool && !c.token && !c.test && !c.easterEgg && SC.measured(c) && c.health != null && !lmp.isOutOfPlay(G, LB.CARD_DEFS_BASELINE[c.id]))
    .filter(c=>{ const b = T.budget(c), b1 = T.budget(c, {level: 1}); return !(b.ok && b1.ok && b.x1 > 0.6 * b.N); }).filter(c=> !before.has(c.id) && !held.has(c.id)).map(c=> c.id);
  ok(!out.length, `2. no in-play card outside its band but those outside before BUDGET2 or held: ${out.slice(0, 6).join(', ') || 'none'}`); }
ok(js('docs/balance/listfix1-pending-budget-2026-10-29.json').count === 0, '2. LISTFIX1\'s pending list is empty (War Elephant fits)');

// ---- 3. the sims' biome tables (tools/lib_bramble.js)
{ let salt = 0, hot = 0, cold = 0, all = 0; LB.MAPS.forEach(m=> (m.nodes || []).forEach(nd=>{ const r = G.fightRules(m.id, nd); all++; if(r.saltMap) salt++; if(r.hotMap) hot++; if(r.coldMap) cold++; }));
  ok(salt > 0 && hot > 0 && cold > 0, `3. sim fights get saltMap / hotMap / coldMap from the map's biome (${salt} / ${hot} / ${cold} of ${all})`);
  ok(near(table.skills.find(s=> s.id === 'anadromous').value, 2.1, 1e-9) && near(3 * salt / all + 2 * (1 - salt / all), 2.06, 0.05), `3. Anadromous 2.1 = 3 x ${(salt / all).toFixed(3)} + 2 x the rest, up to the next tenth`); }

// ---- 4. the logic prices at 3A + H
const sk = id=> table.skills.find(s=> s.id === id) || {};
ok(sk('assault').value === 2.7 && sk('assault').prevValue === 1.8 && sk('liege').value === 1.62, '4. Assault 2.7 a point (0.9 x 3), Liege 1.62 (0.3 x Assault 2)');
ok(['requiem', 'dirge', 'carnage', 'muster', 'beset', 'throng'].every(k=> near(sk(k).value, BB.thrS(k, true, {[k]: true}).S, 0.02)), '4. the threshold skills\' table values are thrS\'s default prices');

// ---- 5. the canon skill set (X14)
const canon = table.skills.filter(s=> s.canon);
ok(canon.length >= 10 && canon.length <= 15 && canon.every(s=> Array.isArray(s.canonAt) && s.canonAt.length && (s.canonReason || '').length > 10 && typeof s.value === 'number'), `5. ${canon.length} canon anchors, each with canonAt and a reason`);
ok(!(table.actions || []).some(a=> a.canon), '5. only keyword skills are canon (the actions list has its own poison / bleed)');
{ const K = require(path.join(ROOT, 'tools', 'skill_canon_2026_10_31.js')), A = K.anchorsOf(table, T);
  ok(A.length >= 12 && A.every(a=> a.price > 0) && Math.max(...A.map(a=> a.price)) / Math.min(...A.map(a=> a.price)) > 3, `5. the anchors span prices (${Math.min(...A.map(a=> a.price))} - ${Math.max(...A.map(a=> a.price))})`); }
ok(/## 5\. Measuring a skill against the canon/.test(rd('docs/evaluation-protocol.md')), '5. the procedure is in docs/evaluation-protocol.md section 5');
{ const f = 'docs/balance/skill-canon-check-2026-10-31.json'; const r = fs.existsSync(path.join(ROOT, f)) ? js(f) : null;
  ok(r && r.anchors.length >= 12 && r.kappa && r.canonRate.m > 0, '5. the first canon check is on record'); }

// ---- 6. docs and decisions
const dec = js('docs/decisions.json').items, D = id=> dec.find(x=> x.id === id) || {};
ok(['BUDGET2-1', 'BUDGET2-2', 'BUDGET2-3', 'BUDGET2-4', 'BUDGET2-5', 'BUDGET2-6'].every(id=> D(id).status === 'YET' && D(id).default), '6. owner calls BUDGET2-1..6 (YET, with a default)');
ok(['DECK1-1', 'DECK1-5', 'SKL0-3'].every(id=> D(id).status === 'YET' && /BUDGET2 \(2026-10-31/.test(D(id).body)), '6. DECK1-1, DECK1-5 and SKL0-3 carry BUDGET2\'s recommendation and stay YET');
ok(/BUDGET2/.test(rd('docs/project-state.md')) && /RECOST1-6/.test(rd('docs/project-state.md')), '6. docs/project-state.md\'s budget entry names BUDGET2 and RECOST1-6');
ok(rd('docs/CHANGELOG.md').split('\n## ')[1].includes('package BUDGET2'), '6. a CHANGELOG entry at the top');
ok(fs.existsSync(path.join(ROOT, 'docs/balance/budget2-2026-10-31.md')), '6. the report docs/balance/budget2-2026-10-31.md');
ok(/tests\/budget2-2026-10-31\.js/.test(rd('tests/run-all.sh')), '6. registered in tests/run-all.sh');

console.log(`budget2-2026-10-31: ${n - fail}/${n} checks passed`);
process.exit(fail ? 1 : 0);
