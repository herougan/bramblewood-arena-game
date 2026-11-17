#!/usr/bin/env node
// 2026-11-17 (package ENG50, owner 11-17 23:14 / 23:36, decisions OWN-1117-2 and REDESIGN3-1): the mechanics the redesign needs.
// 1 Paralysis Powder N (the third powder: Stun N), 2 Rend N (Vulnerable tokens: x2 on the next hit) and the old rend key gone from Pierce,
// 3 Enfeeble N (Feeble tokens: x0.5 on the next hit dealt), 4 the permanent passives (Feeble, Fragile = the Vulnerable passive),
// 5 the actions Weaken / Rend / Enfeeble (and Exploit / Expose verified), 6 Grant {who} {what}, 7 Bulwark's wall grows with level,
// 8 Armourer N, 9 the Awash field shown as Underwater Currents, 10 prices / delivery / counters, texts, editor, effect, docs, 11 determinism.
'use strict';
const H = require('./lib/harness.js');
const E = H.Engine;
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8'), J = f=> JSON.parse(rd(f));
let fail = 0, pass = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  x', m); } else pass++; };
const so = id=> id === 1 ? 'A' : 'B';
const BB = require('../bramblewood-budget.js');
const U = (id, effects, o)=> Object.assign({id, name:id, attack:0, health:500, wait:0, cost:0, effects: effects || {}}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'e50-dummy': U('e50-dummy'), 'e50-swing': U('e50-swing', {}, {attack:1}), 'e50-hit4': U('e50-hit4', {}, {attack:4}),
  'e50-arrow': U('e50-arrow', {arrow:1}), 'e50-arrow2': U('e50-arrow2', {arrow:2}),
  'e50-para': U('e50-para', {paralysisPowder:1}), 'e50-para2': U('e50-para2', {paralysisPowder:2}),
  'e50-noStun': U('e50-noStun', {immune:['status:stun']}, {attack:4}), 'e50-wakeful': U('e50-wakeful', {wakeful:true}, {attack:4}),
  'e50-rend': U('e50-rend', {rend:1}, {attack:2}), 'e50-rend3': U('e50-rend3', {rend:3}, {attack:2}),
  'e50-armor': U('e50-armor', {armor:2}), 'e50-oldrend': U('e50-oldrend', {rend:true}, {attack:5}), 'e50-pierceAll': U('e50-pierceAll', {pierce:true}, {attack:5}),
  'e50-noVuln': U('e50-noVuln', {immune:['status:vulnerable']}),
  'e50-enf': U('e50-enf', {enfeeble:1}, {attack:1}),
  'e50-feeble': U('e50-feeble', {feeble:true}, {attack:4}), 'e50-fragile': U('e50-fragile', {fragile:true}), 'e50-vulnPassive': U('e50-vulnPassive', {vulnerable:true}),
  'e50-cleanser': U('e50-cleanser', {triggers:[{on:'onSpawn', do:'cleanse', who:'ally', sub:'all'}]}),
  'e50-weakenAct': U('e50-weakenAct', {triggers:[{on:'onSpawn', do:'weaken', who:'enemy', sub:'adjacent', amount:2}]}),
  'e50-weakenAlly': U('e50-weakenAlly', {triggers:[{on:'onAllyPlayed', do:'weaken', who:'enemy', sub:'random', amount:1}]}),
  'e50-rendAct': U('e50-rendAct', {triggers:[{on:'onSpawn', do:'rend', who:'enemy', sub:'adjacent', amount:2}]}),
  'e50-enfAct': U('e50-enfAct', {triggers:[{on:'onSpawn', do:'enfeeble', who:'enemy', sub:'adjacent', amount:2}]}),
  'e50-grantSturdy': U('e50-grantSturdy', {triggers:[{on:'onAllyPlayed', do:'grant', who:'ally', sub:'subject', skill:'sturdy', sturdy:true}]}),
  'e50-grantMighty': U('e50-grantMighty', {triggers:[{on:'onSpawn', do:'grant', who:'self', skill:'mighty', mighty:true}]}, {attack:3}),
  'e50-grantArmorAll': U('e50-grantArmorAll', {triggers:[{on:'onSpawn', do:'grant', who:'ally', sub:'all', skill:'armor', armor:2}]}),
  'e50-grantBad': U('e50-grantBad', {triggers:[{on:'onSpawn', do:'grant', who:'self', skill:'triggers', triggers:[]}]}),
  'e50-arm': U('e50-arm', {armourer:2}), 'e50-armWait': U('e50-armWait', {armourer:2}, {wait:2}),
  'e50-bulwark': U('e50-bulwark', {bulwark:1}), 'e50-bulwark4': U('e50-bulwark4', {bulwark:1}, {level:4}), 'e50-bulwark10': U('e50-bulwark10', {bulwark:1}, {level:10}),
  'e50-spawner': U('e50-spawner', {triggers:[{on:'onSpawn', do:'spawnCard', defId:'e50-dummy', count:1}]}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(seed, o){ const e = E.makeSimEngine(defs, E.mulberry32(seed || 11), Object.assign({recordEvents:true, battleMode:'open'}, o || {}));
  return {e, P:{1:e.newPlayer(1, {}, {health:500}), 2:e.newPlayer(2, {}, {health:500})}}; }
function put(e, P, pid, id, slot, ev){ e.debugSpawnCard(P, so, pid, id, 'left', {}, ev || []);
  const pl = P[pid], c = all(pl).filter(x=> (e.derivedDefs[x.defId] ? e.derivedDefs[x.defId].derivedFrom : x.defId) === id || x.defId === id).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot;
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncPhaseStats(P, so, []); return c; }
const fight = (e, P, r)=>{ const ev = []; e.resolveCombat(P, so, {}, ev, r || 1); return ev; };
const swing = (e, P, c)=>{ const ev = []; e.debugAttack(P, so, c.uid, {}, ev); return ev; };
const swingOf = uid=> x=> (x.type === 'hit' || x.type === 'hitHQ') && x.attUid === uid;
const fxOf = (kind, uid)=> x=> x.type === 'statusFx' && x.kind === kind && (uid == null || x.targetUid === uid);
const newest = pl=> all(pl).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null);

// ================= 1. Paralysis Powder N =================
{ const {e, P} = mk(); const p = put(e, P, 1, 'e50-para', 0), t = put(e, P, 2, 'e50-hit4', 0);
  ok(e.shotSpeedOf(p, 'powder') === -1, 'Paralysis Powder is a Speed -1 puff, as the other powders');
  let ev = fight(e, P, 1);
  ok(ev.some(x=> x.type === 'powder' && x.element === 'paralysis' && x.uid === p.uid && x.targetUid === t.uid), 'a powder event, element paralysis, at the unit facing it');
  ok(t.stunned === 1 && ev.some(x=> fxOf('stunOnHit', t.uid)(x) && x.powder && x.amount === 1), 'Paralysis Powder 1: 1 Stun counter, the Stun mark (statusFx stunOnHit, powder)');
  ok(!ev.some(swingOf(p.uid)) && t.hp === 500, 'no damage');
  ev = fight(e, P, 2); ok(!ev.some(swingOf(t.uid)) && ev.some(x=> x.type === 'skipTurn' && x.uid === t.uid && x.reason === 'stunned'), 'next round it is stunned: no swing');
  ok(!ev.some(fxOf('stunOnHit', t.uid)), 'no puff lands on a stunned unit (it cannot be kept stunned every round)');
  ev = fight(e, P, 3); ok(ev.some(swingOf(t.uid)) && ev.some(fxOf('stunOnHit', t.uid)), 'the round after, it swings, then is stunned again'); }
{ const {e, P} = mk(); put(e, P, 1, 'e50-para2', 0); const t = put(e, P, 2, 'e50-hit4', 0); fight(e, P, 1);
  const sw = [2, 3, 4].map(r=> fight(e, P, r).some(swingOf(t.uid))); ok(t.stunned >= 0 && sw.join() === 'false,false,true', `Paralysis Powder 2: stunned 2 rounds, then it swings (${sw.join()})`); }
{ const {e, P} = mk(); put(e, P, 1, 'e50-para', 0); const t = put(e, P, 2, 'e50-noStun', 0); fight(e, P); ok(!t.stunned, 'Immune to Stun: no Stun'); }
{ const {e, P} = mk(); put(e, P, 1, 'e50-para', 0); const t = put(e, P, 2, 'e50-wakeful', 0); fight(e, P); ok(t.stunned === 1, 'Wakeful does not stop it (a stun, not a sleep)'); }
{ const {e, P} = mk(); put(e, P, 1, 'e50-para', 0); const t = put(e, P, 2, 'e50-hit4', 0); fight(e, P, 1);
  const st0 = t.stunned; e.debugDamage(P, so, t.uid, 3, {}, []); ok(st0 === 1 && t.stunned === 1 && t.hp === 497, 'a hit does not end it (a Stun, not a Sleep)'); }
{ const {e, P} = mk(); const p = put(e, P, 1, 'e50-para', 0); const ev = fight(e, P); ok(!ev.some(x=> x.type === 'powder') && P[2].hq.hp === 500, 'no enemy unit: no puff'); void p; }
ok(BB.POWDER_FAMILY.includes('paralysisPowder') && BB.skillCountOf({paralysisPowder:1, sleepPowder:1}) === 1, 'one powder family: Paralysis + Sleeping Powder count 1');

// ================= 2. Rend N: Vulnerable tokens =================
{ const {e, P} = mk(); const a = put(e, P, 1, 'e50-rend', 0), t = put(e, P, 2, 'e50-dummy', 0);
  let ev = swing(e, P, a); ok(t.hp === 498 && t.vulnerable === 1 && ev.some(x=> fxOf('rend', t.uid)(x) && x.amount === 1), `Rend 1: the hit lands (2), then 1 Vulnerable token (${t.hp}, ${t.vulnerable})`);
  ev = swing(e, P, a); ok(t.hp === 494 && t.vulnerable === 1 && ev.some(x=> fxOf('vulnHit', t.uid)(x) && x.amount === 0), `the next hit deals double (4) and uses the token; the hit puts a new one (${t.hp})`);
  const hit = ev.find(x=> x.type === 'hit' && x.targetUid === t.uid); ok(hit && hit.mods && hit.mods.includes('vulnerable'), 'the doubled hit carries the vulnerable mark'); }
{ const {e, P} = mk(); const a = put(e, P, 1, 'e50-rend3', 0), t = put(e, P, 2, 'e50-dummy', 0); swing(e, P, a); ok(t.vulnerable === 3, 'Rend 3: 3 tokens'); swing(e, P, a); ok(t.vulnerable === 5, 'tokens stack (3 - 1 used + 3)'); }
{ const {e, P} = mk(); const t = put(e, P, 2, 'e50-dummy', 0); t.vulnerable = 1; const s = put(e, P, 1, 'e50-arrow', 0); fight(e, P);
  ok(t.hp === 498 && t.vulnerable === 0, `a shot uses a token too: Arrow 1 deals 2 (${t.hp})`); void s; }
{ const {e, P} = mk(); const t = put(e, P, 2, 'e50-dummy', 0); t.vulnerable = 2; t.poison = 3; fight(e, P); ok(t.vulnerable === 2, 'a Venom tick does not use one'); }
{ const {e, P} = mk(); const t = put(e, P, 2, 'e50-fragile', 0); t.vulnerable = 1; const a = put(e, P, 1, 'e50-swing', 0); swing(e, P, a); ok(t.hp === 496, `Fragile and Vulnerable multiply: 1 x2 x2 = 4 (${500 - t.hp})`); }
{ const {e, P} = mk(); const t = put(e, P, 1, 'e50-dummy', 0); t.vulnerable = 2; t.feeble = 2; put(e, P, 1, 'e50-cleanser', 1); ok(t.vulnerable === 0 && t.feeble === 0, 'Cleanse removes Vulnerable and Feeble tokens (physical)'); }
{ const {e, P} = mk(); const a = put(e, P, 1, 'e50-rend', 0), t = put(e, P, 2, 'e50-noVuln', 0); swing(e, P, a); ok(!(t.vulnerable > 0), 'Immune to Vulnerable: no tokens'); }
// the old rend key (ignores Armor) is gone: it was Pierce's alias since 2026-10-11
{ const {e, P} = mk(); const a = put(e, P, 1, 'e50-oldrend', 0), t = put(e, P, 2, 'e50-armor', 0); swing(e, P, a); ok(t.hp === 497, `an old rend: true no longer ignores Armor (5 - 2 = ${500 - t.hp})`); }
{ const {e, P} = mk(); const a = put(e, P, 1, 'e50-pierceAll', 0), t = put(e, P, 2, 'e50-armor', 0); const ev = swing(e, P, a);
  ok(t.hp === 495 && ev.some(x=> x.type === 'hit' && x.pierced === true) && !ev.some(x=> x.type === 'hit' && 'rend' in x), 'Pierce (no number) still ignores all Armor; the hit event says pierced (was rend)'); }
{ const cards = J('canonical/cards.json'), list = Array.isArray(cards) ? cards : Object.values(cards.cards || cards);
  ok(!list.some(c=> c && c.effects && 'rend' in c.effects), 'no card in canonical/cards.json carries the key rend (nothing to migrate: the old meaning is Pierce)');
  ok(!/ae\.rend\b/.test(rd('bramblewood-engine.js')), 'the engine reads no ae.rend alias any more'); }

// ================= 3. Enfeeble N: Feeble tokens =================
{ const {e, P} = mk(); const a = put(e, P, 1, 'e50-enf', 0), t = put(e, P, 2, 'e50-hit4', 0);
  let ev = swing(e, P, a); ok(t.feeble === 1 && ev.some(fxOf('enfeeble', t.uid)), 'Enfeeble 1: 1 Feeble token on the unit it hits');
  ev = swing(e, P, t); ok(a.hp === 498 && t.feeble === 0 && ev.some(x=> x.type === 'statusFx' && x.kind === 'feebleHit' && x.targetUid === t.uid), `its next hit deals half (4 -> ${500 - a.hp}) and uses the token`);
  ev = swing(e, P, t); ok(a.hp === 494, 'then full damage again'); }
{ const {e, P} = mk(); const s = put(e, P, 1, 'e50-arrow2', 0), t = put(e, P, 2, 'e50-dummy', 0); s.feeble = 1; const ev = fight(e, P);
  ok(s.feeble === 0 && ev.some(x=> x.type === 'statusFx' && x.kind === 'feebleHit' && x.targetUid === s.uid) && t.hp === 499, `a shot of a Feeble unit deals half (Arrow 2: 1) and uses a token too (${500 - t.hp})`); }
{ const {e, P} = mk(); const a = put(e, P, 1, 'e50-enf', 0); a.feeble = 1; const ev = []; e.debugAttack(P, so, a.uid, {}, ev); ok(a.feeble === 1, 'no token used on a swing at the bramble (as the Feeble skill: units only)'); }

// ================= 4. the permanent passives =================
{ const {e, P} = mk(); const a = put(e, P, 1, 'e50-feeble', 0), t = put(e, P, 2, 'e50-dummy', 0); swing(e, P, a); ok(t.hp === 498, 'Feeble (passive): always deals half'); }
{ const {e, P} = mk(); const a = put(e, P, 1, 'e50-swing', 0), t = put(e, P, 2, 'e50-fragile', 0); swing(e, P, a); ok(t.hp === 498, 'Fragile (passive, the owner\'s permanent Vulnerable): always takes double'); }
{ const SC = require('../tools/skill_costs.js'), T = SC.make(J('canonical/skill-costs.json')), S = e=> T.budget({id:'x', attack:1, health:3, effects:e, rarity:'common', level:1});
  ok(S({feeble:true}).S < 0, `Feeble frees budget (${S({feeble:true}).S})`);
  const plain = T.budget({id:'x', attack:3, health:6, effects:{}, rarity:'common', level:1}), frag = T.budget({id:'x', attack:3, health:6, effects:{fragile:true}, rarity:'common', level:1});
  ok(frag.x1 < plain.x1, `Fragile frees budget through the caps (${frag.x1} < ${plain.x1})`); }
ok(/"id": "ENG50-1"/.test(rd('docs/decisions.json')), 'decision ENG50-1 asks whether Fragile should read Vulnerable');

// ================= 5. actions: Weaken, Rend, Enfeeble; Exploit and Expose exist =================
{ const {e, P} = mk(); const t = put(e, P, 2, 'e50-hit4', 0); const ev = []; put(e, P, 1, 'e50-weakenAct', 0, ev);
  ok(t.atk === 2 && ev.some(x=> fxOf('weaken', t.uid)(x) && x.amount === 2), `On Spawn: Weaken 2 takes 2 Attack from the enemy facing it (${t.atk})`); }
{ const {e, P} = mk(); const t = put(e, P, 2, 'e50-hit4', 0); put(e, P, 1, 'e50-weakenAlly', -1); put(e, P, 1, 'e50-dummy', 1); ok(t.atk === 3, `Weaken 1 on Ally Played (the owner's example) (${t.atk})`); }
{ const {e, P} = mk(); const t = put(e, P, 2, 'e50-swing', 0); const ev = []; put(e, P, 1, 'e50-weakenAct', 0, ev); ok(t.atk === 0, 'never below 0'); }
{ const {e, P} = mk(); const t = put(e, P, 2, 'e50-dummy', 0); put(e, P, 1, 'e50-rendAct', 0); ok(t.vulnerable === 2, 'the Rend action: 2 Vulnerable tokens'); }
{ const {e, P} = mk(); const t = put(e, P, 2, 'e50-dummy', 0); put(e, P, 1, 'e50-enfAct', 0); ok(t.feeble === 2, 'the Enfeeble action: 2 Feeble tokens'); }
{ const app = rd('arena_app.js'), eng = rd('bramblewood-engine.js');
  ['rend', 'enfeeble', 'weaken', 'grant', 'exploit', 'expose'].forEach(k=> ok(E.makeSimEngine && new RegExp("ACTION_KEYS\\.push\\([^)]*'" + k + "'|'" + k + "'").test(eng.slice(0, eng.indexOf('function makeSimEngine'))) && new RegExp("\\{key:'" + k + "', label:").test(app.slice(app.indexOf('const ACTION_DEFS = ['))) && new RegExp("case '" + k + "':").test(eng), `the ${k} action: engine key, its case, the editor's action list`)); }
{ const A = J('canonical/skill-costs.json').actions, by = id=> A.find(a=> a.id === id);
  ok(['rend', 'enfeeble', 'weaken', 'exploit', 'expose'].every(k=> by(k) && by(k).value > 0 && by(k).per === 'amount'), 'each token / Weaken action is priced per point'); }

// ================= 6. Grant {who} {what} =================
{ const {e, P} = mk(); put(e, P, 1, 'e50-grantSturdy', -1); const ev = []; e.debugSpawnCard(P, so, 1, 'e50-dummy', 'right', {}, ev); const c = newest(P[1]);
  ok(e.effectsOf(c).sturdy === true && c.eng27Granted && c.eng27Granted.sturdy === true && ev.some(x=> fxOf('grant', c.uid)(x) && x.skills.join() === 'sturdy'), 'Grant {played ally} {Sturdy}: the ally has Sturdy for the fight');
  const a = put(e, P, 2, 'e50-hit4', 0); c.slot = 0; e.syncSlots && e.syncSlots(P[1]); const hp0 = c.hp; e.debugAttack(P, so, a.uid, {}, []); ok(hp0 - c.hp === 2 || hp0 - c.hp === 0, 'a granted Sturdy halves the hit'); }
{ const {e, P} = mk(); const g = put(e, P, 1, 'e50-grantMighty', 0), t = put(e, P, 2, 'e50-dummy', 0); swing(e, P, newest(P[1])); ok(t.hp === 494, `Grant {itself} {Mighty}: 3 x2 = ${500 - t.hp}`); void g; }
{ const {e, P} = mk(); const x = put(e, P, 1, 'e50-dummy', -1), y = put(e, P, 1, 'e50-dummy', 1); put(e, P, 1, 'e50-grantArmorAll', 0);
  const xs = all(P[1]).filter(c=> c.uid === x.uid || c.uid === y.uid); ok(xs.length === 2 && xs.every(c=> e.effectsOf(c).armor === 2), 'Grant {every ally} {Armor 2}'); }
{ const {e, P} = mk(); const g = put(e, P, 1, 'e50-grantBad', 0); ok(!g.eng27Granted, 'the trigger list is never granted'); }
{ const SC = require('../tools/skill_costs.js'), T = SC.make(J('canonical/skill-costs.json')), C = t=> T.budget({id:'x', attack:1, health:3, effects:{triggers:[t]}, rarity:'common', level:1});
  const st = C({on:'onSpawn', do:'grant', who:'ally', sub:'adjacent', skill:'sturdy', sturdy:true}), mi = C({on:'onSpawn', do:'grant', who:'ally', sub:'adjacent', skill:'mighty', mighty:true}), ar = C({on:'onSpawn', do:'grant', who:'ally', sub:'adjacent', skill:'armor', armor:2}), al = C({on:'onSpawn', do:'grant', who:'ally', sub:'all', skill:'sturdy', sturdy:true});
  ok(!st.missing.length && st.S > 0 && mi.S > st.S && ar.S > 0 && al.S > st.S, `priced per granted skill (Sturdy ${st.S}, Mighty ${mi.S}, Armor 2 ${ar.S}, Sturdy to all ${al.S})`); }
{ const app = rd('arena_app.js'); ok(/function eng50GrantChoices\(\)/.test(app) && /data-t="grantSkill"/.test(app) && /key==='grantSkill'/.test(app), 'the editor\'s Grant picker offers the priced skills (grant.<key> rows) and stores t.skill + t[skill]'); }

// ================= 7. Bulwark grows with level =================
{ const hpAt = id=>{ const {e, P} = mk(); put(e, P, 1, id, 0); const w = all(P[1]).find(c=> (e.derivedDefs[c.defId] || defs[c.defId] || {}).bulwarkWall || (E && false)); return w ? w.maxHp : null; };
  const h1 = hpAt('e50-bulwark'), h4 = hpAt('e50-bulwark4'), h10 = hpAt('e50-bulwark10');
  ok(h1 === 5 && h4 === 6 && h10 === 8, `Bulwark's Log Wall: 0/5 at Level 1, 0/6 at 4, 0/8 at 10 (${h1}, ${h4}, ${h10})`); }

// ================= 8. Armourer N =================
{ const {e, P} = mk(); put(e, P, 1, 'e50-arm', -1); const ev = []; e.debugSpawnCard(P, so, 1, 'e50-swing', 'right', {}, ev); const c = newest(P[1]);
  ok(c.maxHp === 502 && c.hp === 502 && ev.some(x=> x.type === 'namedBuff' && x.targetUid === c.uid && x.amount2 === 2), `Armourer 2: an ally played while it is Ready comes in +0/+2 (${c.maxHp})`); }
{ const {e, P} = mk(); put(e, P, 1, 'e50-armWait', -1); e.debugSpawnCard(P, so, 1, 'e50-swing', 'right', {}, []); const c = newest(P[1]); ok(c.maxHp === 500, 'not while the Armourer is Waiting'); }
{ const {e, P} = mk(); const a = put(e, P, 1, 'e50-arm', -1); a.stunned = 1; e.debugSpawnCard(P, so, 1, 'e50-swing', 'right', {}, []); ok(newest(P[1]).maxHp === 500, 'nor while it is Stunned'); }
{ const {e, P} = mk(); put(e, P, 1, 'e50-arm', -2); put(e, P, 1, 'e50-spawner', 0); const tok = all(P[1]).find(c=> c.defId === 'e50-dummy'); ok(tok && tok.maxHp === 500, 'a summoned token is not a played card: no Health'); }
{ const SC = require('../tools/skill_costs.js'), T = SC.make(J('canonical/skill-costs.json')), b = T.budget({id:'x', attack:1, health:3, effects:{armourer:2}, rarity:'common', level:1});
  ok(!b.missing.length && b.S === 2.5, `Armourer priced as On Ally Played x Buff +0/+N: 1.25 a point (${b.S})`); }

// ================= 9. the Awash field reads Underwater Currents =================
{ const app = rd('arena_app.js'); ok(/awash:\s+\{icon:'〰️', name:'Underwater Currents'/.test(app), 'the Awash field\'s name on screen is Underwater Currents');
  for(const L of ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']) ok(J('lang/ui/' + L + '.json')['Underwater Currents'], `${L}: Underwater Currents translated`); }

// ================= 10. prices, delivery, counters, texts, editor, effect, docs =================
{ const SC = require('../tools/skill_costs.js'), T = SC.make(J('canonical/skill-costs.json')), S = e=> T.budget({id:'x', attack:1, health:3, effects:e, rarity:'common', level:1});
  const p1 = S({paralysisPowder:1}), p2 = S({paralysisPowder:2}), s1 = S({sleepPowder:1}), r1 = S({rend:1}), f1 = S({enfeeble:1});
  ok(!p1.missing.length && p1.S > s1.S && p2.S > p1.S && p2.S < 2 * p1.S, `Paralysis Powder priced above Sleeping Powder (N 1 ${p1.S}, N 2 ${p2.S}; Sleeping ${s1.S})`);
  ok(!r1.missing.length && r1.S > 0 && !f1.missing.length && f1.S > 0, `Rend ${r1.S}, Enfeeble ${f1.S}`); }
{ const D = J('canonical/skill-delivery.json'), C = J('canonical/skill-counters.json');
  ok(D.delivery.paralysisPowder === 'ranged' && D.delivery.rend === 'none' && D.delivery.enfeeble === 'none' && D.delivery.armourer === 'none' && D.rides.rend === 'melee' && D.rides.enfeeble === 'melee', 'delivery: the powder ranged; Rend and Enfeeble ride every melee hit (as Exploit)');
  ok(C.applies.paralysisPowder === 'stun' && C.applies.rend === 'vulnerable' && C.applies.enfeeble === 'feeble' && C.statuses.vulnerable && C.statuses.feeble && C.noCounter.includes('armourer') && C.counters.paralysisPowder.counters.some(x=> x.skill === 'evasive'), 'counters: Stun / Vulnerable / Feeble statuses, the shot counters for the powder');
  ok(E.ENG36_STATUS.vulnerable && E.ENG36_STATUS.feeble && ['vulnerable', 'feeble'].every(k=> J('canonical/skill-costs.json').statusResist[k].immune > 0 && require('../bramblewood-texts.js').TEXT['ui.eng36-st-' + k]), 'Vulnerable and Feeble are statuses a Resist / Immune entry can name (priced, named)'); }
const app = rd('arena_app.js'), TX = require('../bramblewood-texts.js').TEXT;
const KEYS = ['ui.skn-paralysis-powder', 'ui.sk-paralysis-powder', 'ui.powder-log-paralysis', 'ui.skn-rend', 'ui.sk-rend', 'ui.sk-rend-codex', 'ui.skn-enfeeble', 'ui.sk-enfeeble', 'ui.sk-enfeeble-codex',
  'ui.skn-armourer', 'ui.sk-armourer', 'ui.sk-armourer-codex', 'ui.act-rend', 'ui.act-rend-desc', 'ui.act-rend-text', 'ui.act-enfeeble', 'ui.act-enfeeble-desc', 'ui.act-enfeeble-text',
  'ui.act-weaken', 'ui.act-weaken-desc', 'ui.act-weaken-text', 'ui.act-grant', 'ui.act-grant-desc', 'ui.act-grant-text', 'ui.act-grant-pick', 'ui.stn-vulnerable', 'ui.st-vulnerable', 'ui.ls-vulnerable',
  'ui.vulnerable-tip', 'ui.stn-feeble', 'ui.st-feeble-tokens', 'ui.ls-feeble', 'ui.feeble-tip', 'ui.log-rend', 'ui.log-vuln-hit', 'ui.log-enfeeble', 'ui.log-feeble-hit', 'ui.log-grant', 'ui.float-vulnerable', 'ui.float-feeble'];
KEYS.forEach(k=> ok(TX[k] && app.includes(`'${k}'`), `${k}: a text, used`));
ok(['ui.sk-paralysis-powder', 'ui.sk-rend', 'ui.sk-enfeeble', 'ui.sk-armourer'].every(k=> TX[k].split(/\s+/).length <= 20), 'the card lines are under 20 words');
ok(TX['ui.skn-exploit'] === 'Exploit' && /Exploit tokens/.test(TX['ui.sk-exploit']) && /Exploit, Vulnerable, Feeble/.test(TX['ui.act-cleanse-desc']), 'Exploit is shown as Exploit again (OWN-1117-2: "Exploit tokens"); Cleanse lists the new tokens');
const LEAD = /^[\s \u{1F000}-\u{1FAFF}☀-➿️‍↗]+/u;
for(const L of ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']){ const pk = J('lang/' + L + '.json'); const miss = KEYS.concat(['ui.skn-exploit', 'ui.sk-exploit', 'ui.act-cleanse-desc']).filter(k=> !pk[TX[k].replace(LEAD, '')]); ok(!miss.length, `${L}: the ENG50 texts are translated ${miss.join(', ')}`); }
ok(/\{key:'paralysisPowder', category:'evergreen'/.test(app) && /\{key:'rend', category:'evergreen'/.test(app) && /\{key:'enfeeble', category:'evergreen'/.test(app) && /\{key:'armourer', category:'passive'/.test(app), 'the four skills are in PASSIVE_DEFS (the editor\'s picker, the Codex)');
ok(/paralysisPowder:'⚡', rend:'💔', enfeeble:'🪶', armourer:'⚒️'/.test(app), 'icons');
ok(/if\(ev\.kind === 'rend'\)\{ if\(rc\) rc\.vulnerable/.test(app) && /if\(ev\.kind === 'feebleHit'\)/.test(app) && /if\(ev\.kind === 'grant'\)\{ fl\(/.test(app) && /c\.vulnerable > 0\) badges\.push/.test(app), 'the effect: floats, badges and replay state for the tokens and Grant');
ok(/paralysis:\{cls:'paralysis'/.test(rd('bramblewood-fx-h.js')) && /id:'sk-paralysis-powder'/.test(rd('tools/effects-lab/manifest/h.js')) && /package ENG50/.test(rd('docs/effects-catalogue.md')), 'the paralysis puff (FX.H), its Effects Lab entry and the catalogue');
ok(/ENG50/.test(rd('docs/CHANGELOG.md').slice(0, 4000)) && /eng50-2026-11-17/.test(rd('tests/run-all.sh')), 'CHANGELOG entry and run-all.sh');
{ const ps = rd('docs/project-state.md'); ok(['Vulnerable', 'Feeble', 'Rend', 'Enfeeble', 'Weaken', 'Grant', 'Armourer'].every(w=> new RegExp(w).test(ps)) && /OWN-1117-2/.test(ps), 'project-state names the statuses and skills with OWN-1117-2'); }
{ const cards = J('canonical/cards.json'), list = Array.isArray(cards) ? cards : Object.values(cards.cards || cards);
  ok(!list.some(c=> c && c.effects && ['paralysisPowder', 'rend', 'enfeeble', 'armourer'].some(k=> c.effects[k]) || (c && c.effects && (c.effects.triggers || []).some(t=> ['rend', 'enfeeble', 'weaken', 'grant'].includes(t && t.do)))), 'no card carries a new skill yet (the redesign fold adds them)'); }

// ================= 11. determinism and the CPU =================
{ const run = seed=>{ const {e, P} = mk(seed); put(e, P, 1, 'e50-para', 0); put(e, P, 1, 'e50-rend', -1); put(e, P, 1, 'e50-enf', 1); put(e, P, 2, 'e50-hit4', 0); put(e, P, 2, 'e50-hit4', -1); put(e, P, 2, 'e50-noStun', 1);
    const out = []; for(let r = 1; r <= 5; r++) out.push(fight(e, P, r)); return JSON.stringify(out); };
  ok(run(42) === run(42) && run(7) === run(7), 'the same seed replays the same fight'); }
function aiPick(defId, seed, level){ const {e, P} = mk(seed, {aiAim:true, aiLevel:level}); put(e, P, 2, 'e50-dummy', 0); put(e, P, 1, 'e50-noStun', -1); put(e, P, 1, 'e50-hit4', 1); return e.aiChooseSlot(P, 2, defId); }
{ const seeds = Array.from({length:30}, (_, i)=> 500 + i); defs['e50-aipara'] = U('e50-aipara', {paralysisPowder:1}, {health:20}); defs['e50-aiplain'] = U('e50-aiplain', {}, {health:20});
  const top = seeds.filter(s=> aiPick('e50-aipara', s, 2) === 1).length, plain = seeds.filter(s=> aiPick('e50-aiplain', s, 2) === 1).length;
  ok(top === 30 && plain < 30, `the smartest CPU puts a Paralysis Powder card facing the unit it can stun (${top} of 30; a plain card ${plain})`); }

console.log(`eng50: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
