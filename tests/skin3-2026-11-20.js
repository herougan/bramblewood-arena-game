#!/usr/bin/env node
// 2026-11-20 (package SKIN3, owner Skills sheet 11-20, docs/owner-input/skills-2026-11-20.xlsx):
//   1. Scare N: a unit that hits it is Scared N for that round and the next: its hits and swings (the bramble too) are N less; not stacked;
//      Supreme is never Scared; it wears off with a statusEnd;
//   2. Onslaught N (new rule, key onslaught): +N/+0 for the fight each time another creature on its side swings, only while it is Ready;
//      the old Onslaught (bramble damage last round) and its braces are gone; Bison Bulldozer lost its Level 3 Onslaught; on no card;
//   3. prices, delivery, texts (Loyal's "ally leader"), the board branches, the ranking record, the catalogue section, the CHANGELOG.
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine;
const ROOT = path.join(__dirname, '..');
const rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8'), J = f=> JSON.parse(rd(f));
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:0, health:99, wait:0, cost:0, effects: effects || {}}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  's3-scare2':  U('s3-scare2', {scare:2}, {health:500}),
  's3-scare1':  U('s3-scare1', {scare:1}, {health:3}),
  's3-hit4':    U('s3-hit4', {}, {attack:4, health:500}),
  's3-sup4':    U('s3-sup4', {supreme:true}, {attack:4, health:500}),
  's3-wall':    U('s3-wall', {}, {health:500}),
  's3-onsl':    U('s3-onsl', {onslaught:1}, {attack:1, health:500}),
  's3-onslW':   U('s3-onslW', {onslaught:1}, {attack:1, health:500, wait:9}),
  's3-hit1':    U('s3-hit1', {}, {attack:1, health:500}),
  's3-tower':   U('s3-tower', {}, {attack:1, health:500, archetypes:['Structure']}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
const byDef = (pl, id)=> all(pl).find(c=> c.defId===id);
function mk(seed){ const e = E.makeSimEngine(defs, E.mulberry32(seed||7), {recordEvents:true, battleMode:'open'}); return {e, P:{1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})}}; }
function fight(A, B, rounds){ const {e, P} = mk(); const sp = []; A.forEach(([id, s])=> e.debugSpawnCard(P, so, 1, id, s, {}, sp)); B.forEach(([id, s])=> e.debugSpawnCard(P, so, 2, id, s, {}, sp));
  const evs = [], hq = []; for(let r = 1; r <= (rounds || 1); r++){ const ev = [], h0 = P[1].hq.hp; e.resolveCombat(P, so, {}, ev, r); evs.push(ev); hq.push(h0 - P[1].hq.hp); } return {P, evs, hq, ev: evs.flat()}; }
const dmgs = (f, uid)=> f.evs.map(ev=> ev.filter(x=> x.type === 'hit' && x.targetUid === uid).reduce((t, h)=> t + (h.dmg || 0), 0));

// ================= 1. Scare N: the attacker is Scared =================
{ const f = fight([['s3-scare2', 'center']], [['s3-hit4', 'center']], 3), me = byDef(f.P[1], 's3-scare2'), t = byDef(f.P[2], 's3-hit4');
  ok(JSON.stringify(dmgs(f, me.uid)) === '[2,2,2]', `1. Scare 2: a 4-Attack swing at it deals 2 every round (${dmgs(f, me.uid)})`);
  const sc = f.ev.filter(x=> x.type === 'statusFx' && x.kind === 'scared');
  ok(sc.length >= 1 && sc[0].targetUid === t.uid && sc[0].attUid === me.uid && sc[0].amount === 2, '1. statusFx scared on the attacker (amount 2, from the Scare unit)');
  ok(t.scared === 2, `1. refreshed, not stacked (${t.scared})`); }
{ const f = fight([['s3-scare1', 'center']], [['s3-hit4', 'center']], 3), t = byDef(f.P[2], 's3-hit4');
  ok(!byDef(f.P[1], 's3-scare1'), '1. the 3-Health Scare 1 unit falls to the first swing (4 - 1)');
  ok(JSON.stringify(f.hq.slice(1)) === '[3,4]', `1. Scared lasts the next round too: its swing at the bramble is 1 less, then full (${f.hq})`);
  ok(f.ev.some(x=> x.type === 'statusEnd' && x.status === 'scared' && x.uid === t.uid) && !(t.scared > 0), '1. it wears off with a statusEnd scared'); }
{ const f = fight([['s3-scare2', 'center']], [['s3-sup4', 'center']], 1), me = byDef(f.P[1], 's3-scare2'), t = byDef(f.P[2], 's3-sup4');
  ok(dmgs(f, me.uid)[0] === 4 && !(t.scared > 0) && !f.ev.some(x=> x.kind === 'scared'), '1. Supreme is never Scared'); }

// ================= 2. Onslaught N =================
{ const f = fight([['s3-onsl', 'center'], ['s3-hit1', 'left'], ['s3-hit1', 'right']], [['s3-wall', 'center'], ['s3-wall', 'left'], ['s3-wall', 'right']], 2), o = byDef(f.P[1], 's3-onsl');
  const b = f.ev.filter(x=> x.type === 'namedBuff' && x.keyword === 'onslaught' && x.targetUid === o.uid);
  ok(o.atk === 5 && b.length === 4 && b.every(x=> x.amount === 1 && x.amount2 === 0), `2. Onslaught 1: +1/+0 for each of two allies' swings a round, not its own (atk ${o.atk}, ${b.length} buffs)`);
  ok(o.hp === o.maxHp && o.maxHp === 500, '2. no Health'); }
{ const f = fight([['s3-onslW', 'center'], ['s3-hit1', 'left']], [['s3-wall', 'center'], ['s3-wall', 'left']], 2), o = byDef(f.P[1], 's3-onslW');
  ok(o.atk === 1 && !f.ev.some(x=> x.keyword === 'onslaught'), '2. not while it is Waiting'); }
{ const f = fight([['s3-onsl', 'center'], ['s3-tower', 'left']], [['s3-wall', 'center'], ['s3-wall', 'left']], 1), o = byDef(f.P[1], 's3-onsl');
  ok(o.atk === 1, `2. a Structure's swing does not count (atk ${o.atk})`); }
{ const cards = J('canonical/cards.json'), carry = cards.filter(c=> /"onslaught(Grant)?"/.test(JSON.stringify([c.effects, c.levelSkills, c.levelBonus])));
  ok(!carry.length, '2. no card carries Onslaught (' + carry.map(c=> c.id) + ')');
  const bison = cards.find(c=> c.id === 'bison-bulldozer'); ok(bison && bison.attack === 2 && bison.health === 13 && bison.effects.bulldoze === 1 && !bison.levelSkills, '2. Bison Bulldozer: Level 3 Onslaught removed, stats kept');
  const SC = require('../tools/skill_costs.js'), T = SC.make(J('canonical/skill-costs.json')); const u = [1, 3, 10].map(L=> T.budgetAt(bison, L)).map(b=> b.x1 / b.N);
  ok(u.every(x=> x <= 1), `2. Bison Bulldozer within budget at Levels 1, 3, 10 (${u.map(x=> (100 * x).toFixed(1))})`); }

// ================= 3. data, texts, records =================
{ const SK = {}; J('canonical/skill-costs.json').skills.forEach(s=> SK[s.id] = s);
  ok(SK.scare.value === 3.02 && SK.scare.skin3Was && SK.scare.skin3Was.value === 2.52, '3. Scare re-priced 2.52 -> 3.02 (pow kept)');
  ok(SK.onslaught.value === 6.8 && SK.onslaught.scale === 'n' && SK.onslaught.pow == null && SK.onslaught.theoretical && !SK.onslaughtGrant, '3. Onslaught 6.8 a point (theoretical); no onslaughtGrant row');
  ok(!J('canonical/skill-params.json').families.onslaught, '3. no Onslaught family (no braces)');
  { const D = J('canonical/skill-delivery.json').delivery; ok(D.onslaught === 'none' && D.scare === 'none', '3. delivery none'); } }
{ const TX = require('../bramblewood-texts.js').TEXT, app = rd('arena_app.js'), eng = rd('bramblewood-engine.js');
  ['ui.sk-scare', 'ui.sk-scare-codex', 'ui.skn-onslaught', 'ui.sk-onslaught', 'ui.sk-onslaught-codex', 'ui.skin3-log-scared', 'ui.skin3-float-scared', 'ui.skin3-scared-tip'].forEach(k=> ok(typeof TX[k] === 'string' && TX[k].length, `3. text ${k}`));
  ok(!TX['ui.sk-e10-onslaught'] && !TX['ui.skn-e10-onslaught'], '3. the old Onslaught texts are gone');
  ok(/an ally leader/.test(TX['ui.sk-loyal-grant']) && /While an ally leader is on the field: \+\$\{a\}/.test(app) && /While an ally leader is on the battlefield: \+\$\{a\}/.test(app) && !/one of your leaders/.test(app), '3. Loyal reads "an ally leader" (field / battlefield)');
  ok(/\{key:'onslaught', category:'passive', label:TX\('ui\.skn-onslaught'\)/.test(app) && /onslaught:'📈'/.test(app) && !/onslaught:\{n:3/.test(app), '3. Onslaught registry entry and icon; out of the threshold tables');
  ok(/ev\.kind === 'scared'\) return/.test(app) && /ev\.kind === 'scared'\)\{ if\(rc\) rc\.scared/.test(app) && /c\.scared > 0\) badges/.test(app) && /'scared' \/\* SKIN3 \*\/\]\.includes\(ev\.status\)/.test(app), '3. Scared: log line, float, badge, statusEnd');
  ok(!/onslaughtGrant/.test(eng) && !/_siegeLast/.test(eng), '3. the engine has no old Onslaught left');
  const pk = J('lang/fr.json'); ok(['ui.sk-scare', 'ui.sk-onslaught', 'ui.sk-loyal-grant'].every(k=> pk[TX[k]]), '3. translated (fr pack)');
  ok(/## 2026-11-20 SKIN3/.test(rd('docs/CHANGELOG.md')), '3. CHANGELOG entry'); }
{ const R = J('docs/skill-ranking.json').skills, f = (k, nm)=> R.find(s=> s.key === k && (!nm || s.name === nm));
  ok(f('loyal').pass2 === '3' && f('onslaught').pass2 === 'Remove' && f('onslaughtGrant').rank === 'Remove' && f('broodkeeper').pass2 === '4' && f('encore').rank === 'S', '3. ranking: the 11-20 II and Comments values');
  ['Pillage', 'Broodmother', 'Adversity', 'Vengence', 'Ingress'].forEach(nm=> ok(R.some(s=> s.name === nm && s.addedIn === '11-20'), `3. ranking row ${nm} (11-20)`));
  const cat = rd('docs/effects-catalogue.md'), i = cat.indexOf('Designed, not built (owner 11-20)');
  ok(i > 0 && ['Pillage', 'Broodmother', 'Metallurgy', 'Masonry', 'Refining', 'Mining', 'Forestry', 'Powder', 'Sap', 'Mistwalker', 'Resonance', 'Emergence', 'Awakening', 'Ingress', 'Adversity', 'Backlash', 'Vengence'].every(w=> cat.indexOf(w, i) > 0), '3. the catalogue lists the 17 designs'); }

console.log(fail ? `skin3: ${n - fail} passed, ${fail} failed` : `skin3: all passed (${n} checks)`);
process.exit(fail ? 1 : 0);
