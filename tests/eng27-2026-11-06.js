#!/usr/bin/env node
// Package ENG27 (2026-11-06, owner items 10, 11, 12, 14, 20-22, 24, 32, 36; PVP2 follow-up; decisions ENG25-6, ENG25-8 c, ENG23-1, ENG23-2 b,
// ENG26-3 a; UI23-1 d). The browser run of the pips and floats is tests/e2e/eng27_2026_11_06.py (shots docs/screens/eng27/).
//   node tests/eng27-2026-11-06.js
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const ROOT = H.ROOT, E = H.Engine;
const rd = rel=> fs.readFileSync(path.join(ROOT, rel), 'utf8');
const app = rd('arena_app.js'), tpl = rd('arena_template.html'), eng = rd('bramblewood-engine.js'), bud = rd('bramblewood-budget.js');
const T = require(path.join(ROOT, 'bramblewood-texts.js')).TEXT;
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id === 1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:1, health:20, wait:0, cost:0, effects}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'x-dummy': U('x-dummy', {}, {attack:0, health:200}),
  'x-swing': U('x-swing', {}, {attack:2, health:200}),
  'x-blitz': U('x-blitz', {blitz:true}, {attack:2, health:200}),
  'x-archer': U('x-archer', {arrow:1}, {attack:2, health:200}),
  'x-bolter': U('x-bolter', {fireBolt:1}, {attack:2, health:200}),
  'x-flyer': U('x-flyer', {flying:true}, {attack:1, health:500}),
  'x-mach': U('x-mach', {mach:true}, {attack:0, health:500}),
  'x-aa': U('x-aa', {antiAirOnly:true}, {attack:3, health:500}),
  'x-fort': U('x-fort', {fortify:{armor:2, thorns:1}}, {attack:0, health:50}),
  'x-unfort': U('x-unfort', {unfortify:true}, {attack:0, health:50}),
  'x-unfort2': U('x-unfort2', {unfortify:'Vulnerable 2, -3 Health'}, {attack:0, health:50}),
  'x-hitter': U('x-hitter', {}, {attack:5, health:200}),
  'x-insp': U('x-insp', {inspiring:2}, {attack:1, health:200}),
  'x-dt': U('x-dt', {doubleTime:true, triggers:[{on:'onAttack', do:'gain', resource:'lumber', amount:1}]}, {attack:1, health:200}),
  'x-twin': U('x-twin', {twinStrike:true, triggers:[{on:'onAttack', do:'gain', resource:'lumber', amount:1}]}, {attack:1, health:200}),
  'x-dt-arrow': U('x-dt-arrow', {doubleTime:true, arrow:1}, {attack:0, health:200}),
  'x-encore': U('x-encore', {encore:{when:['kill'], mode:'and'}}, {attack:5, health:200}),
  'x-weak': U('x-weak', {}, {attack:0, health:3}),
  'x-rage75': U('x-rage75', {rage:true, rageAt:0.75}, {attack:1, health:100}),
  'x-rage': U('x-rage', {rage:true}, {attack:1, health:100}),
  'x-granter': U('x-granter', {grantSkill:{skills:{quick:true}, n:2}}, {attack:0, health:50}),
  'x-hype': U('x-hype', {hype:1}, {attack:0, health:50}),
  'x-helm': U('x-helm', {helmet:true}, {attack:0, health:500}),
  'x-skitter': U('x-skitter', {skitter:true}, {attack:2, health:200}),
  'x-crep': U('x-crep', {crepuscular:true}, {attack:1, health:20}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(seed, ch1, ch2){ const e = E.makeSimEngine(defs, E.mulberry32(seed || 27), {recordEvents:true, battleMode:'open'});
  return {e, P:{1: e.newPlayer(1, {}, ch1 || {id:'st-hq', health:500, effects:{}}), 2: e.newPlayer(2, {}, ch2 || {id:'st-hq', health:500, effects:{}})}}; }
function put(e, P, pid, id, slot, ev){ const pl = P[pid]; e.debugSpawnCard(P, so, pid, id, 'left', {}, ev || []);
  const c = all(pl).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot;
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncPhaseStats(P, so, []); return c; }
const fight = (e, P, ev)=>{ ev = ev || []; e.resolveCombat(P, so, {}, ev, 1); return ev; };

// ---- 10. Fortify (Armor N), Unfortify (Vulnerable N), pips -------------------------------------------------------------------------
{ const fp = E.makeSimEngine(defs, E.mulberry32(1), {}).fortifyParts('Armor 1, Thorns 2'); ok(fp.armor === 1 && fp.thorns === 2, '#10 Fortify reads Armor N'); }
{ const {e, P} = mk(); const ev = []; put(e, P, 1, 'x-fort', 0, ev); const f = ev.find(x=> x.type === 'fortify');
  ok(P[1].hqArmor === 2 && P[1].castleThorns === 1 && f && f.fort.armor === 2 && f.fort.thorns === 1, '#10 Fortify (Armor 2, Thorns 1): the bramble gets them; the event carries the pip state');
  put(e, P, 2, 'x-hitter', 3); const hp0 = P[1].hq.hp; const ev2 = fight(e, P);
  ok(hp0 - P[1].hq.hp === 3 && ev2.some(x=> x.type === 'brambleArmor' && x.fortify && x.blocked === 2), `#10 a 5 swing at the bramble lands as 3 (${hp0 - P[1].hq.hp})`); }
{ const {e, P} = mk(); const ev = []; put(e, P, 1, 'x-unfort', 0, ev);
  ok(P[1].hqVulnerable === 1 && ev.some(x=> x.type === 'fortify' && x.neg && x.fort.vulnerable === 1), '#10 bare Unfortify: Vulnerable 1 on its own bramble');
  put(e, P, 2, 'x-hitter', 3); const hp0 = P[1].hq.hp; const ev2 = fight(e, P);
  ok(hp0 - P[1].hq.hp === 6 && ev2.some(x=> x.type === 'brambleVulnerable' && x.extra === 1), `#10 a 5 swing lands as 6 on a Vulnerable 1 bramble (${hp0 - P[1].hq.hp})`); }
{ const {e, P} = mk(); put(e, P, 1, 'x-unfort2', 0); ok(P[1].hqVulnerable === 2 && P[1].hq.maxHp === 497 && P[1].eng27Fort.minusHealth === 3, '#10 Unfortify {Vulnerable 2, -3 Health}'); }
ok(T['ui.e22-fortify-head'] === 'Fortify ({x})' && T['ui.eng24-barmor-head'] === 'Fortify (Armor {n}), while it lives', '#10 the short form "Fortify (Armor 1)"');
ok(/function eng27FortPipsHTML\(side\)/.test(app) && /eng27FortPipsHTML\(hqSide\)/.test(app) && /\.match-castle-tile \.eng27-fort\{/.test(tpl), '#10 the pips are drawn on the bramble tile');

// ---- 11. Speed: Blitz 10, arrows 0 after the swings, bolts 1 ---------------------------------------------------------------------
{ const {e, P} = mk(); const b = put(e, P, 1, 'x-blitz', 0), a = put(e, P, 1, 'x-archer', 2), bo = put(e, P, 1, 'x-bolter', 4);
  ok(e.swingSpeedOf(b) === 10 && e.shotSpeedOf(b) === 10 && e.shotSpeedOf(a) === 0 && e.shotSpeedOf(bo) === 1, '#11 Blitz 10 on swing and shots; arrow 0; bolt 1'); }
{ const {e, P} = mk(); put(e, P, 1, 'x-archer', -2); put(e, P, 2, 'x-swing', 2); put(e, P, 2, 'x-dummy', 2);
  const ev = fight(e, P); const iSwing = ev.findIndex(x=> (x.type === 'hit' || x.type === 'hitHQ') && x.side === 'B'), iArrow = ev.findIndex(x=> x.type === 'arrow');
  ok(iSwing >= 0 && iArrow > iSwing, `#11 an arrow goes after a Speed 0 swing (swing ${iSwing}, arrow ${iArrow})`); }
{ const {e, P} = mk(); put(e, P, 1, 'x-bolter', -2); put(e, P, 2, 'x-swing', 2);
  const ev = fight(e, P); const iSwing = ev.findIndex(x=> (x.type === 'hit' || x.type === 'hitHQ') && x.side === 'B'), iBolt = ev.findIndex(x=> x.type === 'bolt');
  ok(iBolt >= 0 && iBolt < iSwing, `#11 a bolt goes before a Speed 0 swing (bolt ${iBolt}, swing ${iSwing})`); }

// ---- 11. the flying meter: Mach, Anti-air ------------------------------------------------------------------------------------------
{ const e = E.makeSimEngine(defs, E.mulberry32(1), {}); ok(e.flyLevelOf({}) === 0 && e.flyLevelOf({flying:true}) === 1 && e.flyLevelOf({mach:true}) === 2 && e.flyLevelOf({antiAirOnly:true}) === 2, '#11 the meter: 0 / 1 / 2 / 2'); }
function missRate(att, def, seeds){ let miss = 0, tot = 0; for(let s = 1; s <= seeds; s++){ const {e, P} = mk(s); put(e, P, 1, att, 0); put(e, P, 2, def, 0);
  const ev = fight(e, P); ev.forEach(x=>{ if(x.side === 'A' && (x.type === 'hit' || x.type === 'evaded')){ tot++; if(x.type === 'evaded') miss++; } }); } return tot ? miss / tot : -1; }
{ const r1 = missRate('x-swing', 'x-mach', 40), r2 = missRate('x-flyer', 'x-mach', 80), r3 = missRate('x-aa', 'x-mach', 40), r4 = missRate('x-aa', 'x-dummy', 20), r5 = missRate('x-aa', 'x-flyer', 40);
  ok(r1 === 1, `#11 a ground swing always misses Mach (${r1})`);
  ok(r2 > 0.35 && r2 < 0.65, `#11 a flying swing misses Mach about half the time (${r2.toFixed(2)})`);
  ok(r3 === 0, `#11 Anti-air never misses Mach (${r3})`);
  ok(r4 === 1, `#11 Anti-air never hits a ground unit (${r4})`);
  ok(r5 === 0, `#11 Anti-air never misses a Flyer (${r5})`); }
{ const {e, P} = mk(); put(e, P, 1, 'x-aa', 0); const hp0 = P[2].hq.hp; fight(e, P); ok(hp0 - P[2].hq.hp === 3, '#11 Anti-air hits the bramble through an empty column'); }
{ const a = []; for(let s = 1; s <= 3; s++){ const {e, P} = mk(s); put(e, P, 1, 'x-flyer', 0); put(e, P, 2, 'x-mach', 0); a.push(JSON.stringify(fight(e, P).map(x=> x.type))); }
  const b = []; for(let s = 1; s <= 3; s++){ const {e, P} = mk(s); put(e, P, 1, 'x-flyer', 0); put(e, P, 2, 'x-mach', 0); b.push(JSON.stringify(fight(e, P).map(x=> x.type))); }
  ok(a.join() === b.join(), '#11 seeded: the same seed gives the same rolls'); }

// ---- 14. Inspiration +1 a token -----------------------------------------------------------------------------------------------------
{ const {e, P} = mk(); put(e, P, 1, 'x-insp', 0); const al = put(e, P, 1, 'x-swing', 1); put(e, P, 2, 'x-dummy', 0); put(e, P, 2, 'x-dummy', 1);
  const ev = fight(e, P); const g = ev.find(x=> x.type === 'statusFx' && x.kind === 'inspired');
  ok(g && g.tokens === 2 && g.amount === 2, `#14 Inspiring 2: 2 tokens, +2 Attack (+1 each) (${g && g.tokens + '/' + g.amount})`); }

// ---- 20. multi-attacks run On Attack each time; Double Time; Encore -------------------------------------------------------------------
{ const {e, P} = mk(); put(e, P, 1, 'x-twin', 0); put(e, P, 2, 'x-dummy', 0); const l0 = P[1].lumber; const ev = fight(e, P);
  ok(P[1].lumber - l0 === 2 && ev.filter(x=> x.type === 'hit' && x.side === 'A').length === 2, '#20 Twin Strike: two swings, On Attack twice'); }
{ const {e, P} = mk(); put(e, P, 1, 'x-dt', 0); put(e, P, 2, 'x-dummy', 0); const l0 = P[1].lumber; const ev = fight(e, P);
  ok(P[1].lumber - l0 === 2 && ev.filter(x=> x.type === 'hit' && x.side === 'A').length === 2, '#20 Double Time: two swings, On Attack twice'); }
{ const {e, P} = mk(); put(e, P, 1, 'x-dt-arrow', 0); put(e, P, 2, 'x-dummy', 0); const ev = fight(e, P);
  ok(ev.filter(x=> x.type === 'arrow').length === 2, '#20 Double Time: its shots twice'); }
{ const {e, P} = mk(); put(e, P, 1, 'x-encore', 0); put(e, P, 2, 'x-weak', 0); put(e, P, 2, 'x-dummy', 1); const ev = fight(e, P);
  ok(ev.some(x=> x.type === 'frenzy' && x.encore) && ev.filter(x=> (x.type === 'hit' || x.type === 'hitHQ') && x.side === 'A').length === 2, '#20 Encore {Kill}: a kill, then it swings again'); }
{ const {e, P} = mk(); put(e, P, 1, 'x-encore', 0); put(e, P, 2, 'x-dummy', 0); const ev = fight(e, P); ok(!ev.some(x=> x.type === 'frenzy' && x.encore), '#20 Encore {Kill}: no kill, no encore'); }

// ---- 21. Rage {N%} -----------------------------------------------------------------------------------------------------------------
{ const {e, P} = mk(); const a = put(e, P, 1, 'x-rage75', 0), b = put(e, P, 1, 'x-rage', 1); a.hp = 70; b.hp = 70;
  ok(e.isRaging(a) && !e.isRaging(b), '#21 Rage {75%} rages at 70%; plain Rage keeps half'); b.hp = 40; ok(e.isRaging(b), '#21 plain Rage below half'); }

// ---- 22. Grant {skill} N, Hype N ----------------------------------------------------------------------------------------------------
{ const {e, P} = mk(); const a = put(e, P, 1, 'x-swing', -1), b = put(e, P, 1, 'x-swing', 1), c = put(e, P, 1, 'x-swing', 3); const ev = [];
  put(e, P, 1, 'x-granter', 0, ev); const has = u=> /quick/.test(u._condKey || ''); // the grant rides on its derived card (condStatsOf)
  ok(has(a) && has(b) && !has(c), `#22 Grant {Quick} 2: the two nearest allies gain Quick (${[a, b, c].map(has)})`);
  ok(ev.some(x=> x.type === 'statusFx' && x.kind === 'eng27Grant' && x.amount === 2), '#22 its event'); }
{ const {e, P} = mk(); put(e, P, 1, 'x-hitter', 1); put(e, P, 1, 'x-swing', -1); put(e, P, 2, 'x-dummy', 1); const ev = []; put(e, P, 1, 'x-hype', 0, ev);
  const h = ev.find(x=> x.type === 'statusFx' && x.kind === 'eng27Hype'); ok(h && defs[h.targetDefId] && h.targetDefId === 'x-hitter', '#22 Hype 1 picks the ally with the most Attack');
  ok(ev.some(x=> x.type === 'hit' && x.attDefId === 'x-hitter'), '#22 ... and it acts at once'); }
{ const cards = JSON.parse(rd('canonical/cards.json')).map(c=> require('../bramblewood-skillparams.js').expandDef(c)) /* ENG35 (2026-11-07): fused skills read as their flat keys */, hc = cards.filter(c=> c.effects && c.effects.hype);
  ok(hc.length === 1 && hc[0].id === 'crimson-wing-drumcaller' && hc[0].awaitingSource, '#22 one new card carries Hype, in no pack'); // 2026-11-13 TESTFIX3: the Drumcaller has art now (was: no art yet)
  const SC = require(path.join(ROOT, 'tools', 'skill_costs.js')), Tb = SC.make(JSON.parse(rd('canonical/skill-costs.json'))), b = Tb.budget(hc[0], {});
  ok(b && b.x1 / b.N > 0.9 && b.x1 / b.N <= 1.0 && b.ok !== false, `#22 the Drumcaller is in band (${b && Math.round(100 * b.x1 / b.N)}% of N)`);
  ok(/Crimson Wing Drumcaller/.test(rd('docs/art-style-prompts.md')), '#22 its art prompt is written'); }

// ---- 32. Helmet falls off -----------------------------------------------------------------------------------------------------------
{ let gone = 0, again = 0; for(let s = 1; s <= 12; s++){ const {e, P} = mk(s); put(e, P, 1, 'x-archer', 0); put(e, P, 2, 'x-helm', 0); const ev = [];
    for(let r = 0; r < 6; r++) fight(e, P, ev); const d = ev.filter(x=> x.type === 'deflect'); if(d.length) gone++; if(d.length > 1) again++; }
  ok(gone > 0 && again === 0, `#32 the helmet blocks once, then is gone (${gone} blocked, ${again} twice)`); }

// ---- 36. the two new brambles -------------------------------------------------------------------------------------------------------
{ const ch = JSON.parse(rd('canonical/characters.json')), w = ch.find(c=> c.id === 'whetstone-rise'), m = ch.find(c=> c.id === 'mossbed-hollow');
  ok(w && w.effects.unitAtkBonus === 1 && m && m.effects.unitHpBonus === 3 && !w.unlockMap && !m.unlockMap, '#36 Whetstone Rise (+1 Attack) and Mossbed Hollow (+3 Health)');
  const {e, P} = mk(1, w, m); P[1].hand.push({uid:9001, defId:'x-swing'}); P[2].hand.push({uid:9002, defId:'x-swing'});
  e.placeCard(P, so, 1, 9001, 'left', {}, []); e.placeCard(P, so, 2, 9002, 'left', {}, []);
  const a = all(P[1])[0], b = all(P[2])[0]; ok(a && a.atk === 3 && b && b.maxHp === 203, `#36 a 2/200 played: 3 Attack on Whetstone Rise, 203 Health on Mossbed Hollow (${a && a.atk}, ${b && b.maxHp})`);
  ok(/key:'unitAtkBonus', icon:'⚔️'/.test(app) && /TX\('ui\.eng27-unit-atk-desc'/.test(app), '#36 the bramble list and the editor show it'); }

// ---- decisions ---------------------------------------------------------------------------------------------------------------------
{ const cards = JSON.parse(rd('canonical/cards.json')).map(c=> require('../bramblewood-skillparams.js').expandDef(c)) /* ENG35 (2026-11-07): fused skills read as their flat keys */; const p = cards.filter(c=> c.effects && (c.effects.pearl || c.effects.pearlBed));
  const gc = cards.find(c=> c.id === 'giant-clam');
  ok(!p.length && gc.effects.delivery === 1 && gc.effects.deliveryRes === 'pearl', 'ENG25-6 Pearl cards carry Delivery {Pearl}');
  ok(/fx\.pearl\)\{ fx\.delivery = /.test(app) && /if\(e\.pearl\) out\.push/.test(eng), 'ENG25-6 old keys still play and read as Delivery'); }
{ const sc = JSON.parse(rd('canonical/skill-costs.json')).skills, t = sc.find(s=> s.id === 'tide'); ok(t.value === 0.5, 'ENG25-8 c Tide 1 at 0.5'); }
{ const {e, P} = mk(); const c = put(e, P, 1, 'x-crep', 0); ok(/day = \[1, 0\]; night = \[0, 1\]/.test(eng), 'ENG23-1 bare Crepuscular is +1/+0 by day, +0/+1 at night'); }
{ const {e, P} = mk(); put(e, P, 1, 'x-skitter', 0); const ev = fight(e, P); ok(ev.some(x=> x.type === 'statusFx' && x.kind === 'skitter'), 'ENG23-2 b a Skitter hit on the bramble counts'); }
ok(/bloomCopy: 1\.5 /.test(bud), 'ENG26-3 a Bloom x1.5 in the budget');
// ---- PVP2 follow-up, UI23-1 d ----------------------------------------------------------------------------------------------------------
ok(/asyncGhost\.leaders\.length\) dealPlayerLeader\(players\[2\], asyncGhost\.leaders\[0\], getCardDefs\(\)\)/.test(app), 'PVP2 a ghost leader is dealt');
{ const a = app.indexOf('\nfunction worldRevealed('), b = app.indexOf('\n}', a); const body = app.slice(a, b);
  ok(/conquestMapCleared\('m1'\)\) return true/.test(body) && !/mapRewardNodeKey\(mf\)/.test(body) && /p\.completed\.some\(/.test(body), 'UI23-1 d the world opens once Map 0 is cleared (the past-Map-0 path kept)'); }
// ---- 12, 20-22 names; texts --------------------------------------------------------------------------------------------------------
{ const ps = rd('docs/project-state.md'); ok(['Zenith', 'Enable', 'Flux', 'Overclock', 'Adrenaline', 'Reflex', 'Instinct', 'Flank', 'Wish', 'Second Wind', 'Limit Break'].every(w=> ps.includes(w)), '#12 #20-22 the named, unbuilt skills are recorded'); }
{ const keys = Object.keys(T).filter(k=> /^ui\.eng27-/.test(k) && !/-name$|-head$|^ui\.eng27-fp-|-label$|-float-/.test(k));
  const long = keys.filter(k=> T[k].replace(/\{\w+\}/g, 'x').split(/\s+/).filter(Boolean).length >= 15);
  ok(keys.length > 20 && !long.length, `texts under 15 words (${long})`);
  const packs = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'].map(c=> JSON.parse(rd('lang/' + c + '.json')));
  const core = t=> t.trim().replace(/^[^\w{(+\-]+/, ''); const miss = Object.keys(T).filter(k=> /^ui\.eng27-/.test(k)).filter(k=> /[^\W\d_]/.test(core(T[k]).replace(/\{\w+\}/g, '')) && packs.some(p=> !(core(T[k]) in p)));
  ok(!miss.length, `every ENG27 text in the 12 packs (${miss})`); }
console.log(`eng27: ${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);
