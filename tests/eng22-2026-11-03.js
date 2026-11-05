#!/usr/bin/env node
// 2026-11-03 (package ENG22): the owner's 11-03 21:10 / 21:13 answers (docs/decisions.json).
//   1  SKILL-BUILD-1  Fortification reads Build { A/H Palisade } (the size from its braces); Fortify {X} gives X to your bramble (on no card).
//   2  DESIGN1-4      Guardian also takes arrows and shots aimed at an adjacent ally; Taunt pulls the arrows and shots of the enemies around it.
//   3  DESIGN1-6      Delivery {X} replaces Stockpile, onReadyGold and the On Ready gain trigger: same amounts, same timings as each card had.
//   4  DESIGN1-11     Hatchling reads "Hatchling - ?" until Evomax (Map 20).
//   5  DESIGN1-2      base Level 0 cards get their abilities at Level 1; Map 0's untaught abilities read "?"; Cricket Drummer Inspiring 1.
//   6  21:13          Carnage counts only the deaths it saw; Tally (the old rule), Almanac, Onslaught, Riled (on no card, priced).
//   7  UI17-3         Admin -> "Reset my progress" is gone.
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine, ROOT = H.ROOT, R = f=> fs.readFileSync(path.join(ROOT, f), 'utf8'), J = f=> JSON.parse(R(f));
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id === 1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:0, health:50, wait:0, cost:0, effects}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'x-build':   U('x-build', {fortification:'2/9 Palisade'}),
  'x-build0':  U('x-build0', {fortification:true}),
  'x-fort':    U('x-fort', {fortify:{thorns:1, health:1}}),
  'x-fortS':   U('x-fortS', {fortify:'Thorns 1, +1 Health, Bolt 2'}),
  'x-shoot':   U('x-shoot', {arrow:3}),
  'x-volley':  U('x-volley', {volley:2}, {}),
  'x-sneak':   U('x-sneak', {arrow:3, stealth:true}),
  'x-dummy':   U('x-dummy', {}, {health:200, wait:9}),
  'x-taunt':   U('x-taunt', {taunt:true}, {health:200, wait:9}),
  'x-guard':   U('x-guard', {guardian:true}, {health:200}),
  'x-thorny':  U('x-thorny', {thorns:1}, {health:200, wait:9}),
  // Delivery against the old forms it replaces (same amount, same timing)
  'x-oldStock':  U('x-oldStock', {stockpile:2}, {wait:2}),   'x-newStock':  U('x-newStock', {delivery:2}, {wait:2}),
  'x-oldGold':   U('x-oldGold', {onReadyGold:1}, {wait:2}),  'x-newGold':   U('x-newGold', {deliveryEvery:1}, {wait:2}),
  'x-oldTrig':   U('x-oldTrig', {triggers:[{on:'onReady', do:'gain', resource:'lumber', amount:1}]}, {wait:0}), 'x-newTrig': U('x-newTrig', {delivery:1}, {wait:0}),
  'x-oldStone':  U('x-oldStone', {triggers:[{on:'onReady', do:'gain', resource:'stone', amount:1}]}, {wait:1}), 'x-newStone': U('x-newStone', {delivery:1, deliveryRes:'stone'}, {wait:1}),
  'x-pearlEv':   U('x-pearlEv', {deliveryEvery:1, deliveryRes:'pearl'}, {wait:1}),
  // the counters
  'x-carnage': U('x-carnage', {carnage:2}, {health:500, wait:9}),
  'x-tally':   U('x-tally', {tally:2}, {health:500, wait:9}),
  'x-almanac': U('x-almanac', {almanac:3}, {health:500, wait:9}),
  'x-onsl':    U('x-onsl', {onslaught:3}, {health:500, wait:9}),
  'x-riled':   U('x-riled', {riled:3}, {health:500, wait:9}),
  'x-hit5':    U('x-hit5', {}, {attack:5, health:500}),
  'x-weak':    U('x-weak', {}, {health:1, wait:9}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(seed){ const e = E.makeSimEngine(defs, E.mulberry32(seed || 5), {recordEvents:true, battleMode:'open'}); return {e, P:{1: e.newPlayer(1, {}), 2: e.newPlayer(2, {})}}; }
function put(e, P, pid, id, slot){ const pl = P[pid]; const c = e.makeBoardCard(id); c.slot = slot; c._seenAt = slot;
  const cs = all(pl).concat(c); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncSlots(pl); return c; }
const round = (e, P, r)=>{ const ev = []; e.roundStart(P, r, so, {}, ev); e.resolveCombat(P, so, {}, ev, 1); return ev; };
const TXT = require(path.join(ROOT, 'bramblewood-texts.js')).TEXT, app = R('arena_app.js'), eng = R('bramblewood-engine.js');
const cards = J('canonical/cards.json'), byId = Object.fromEntries(cards.map(c=> [c.id, c]));
const SCt = J('canonical/skill-costs.json'), SK = Object.fromEntries(SCt.skills.map(s=> [s.id, s]));

// ---- 1. Build { A/H Palisade } and Fortify {X} ---------------------------------------------------------------------------------
{ let good = 0; for(let s = 1; s <= 12; s++){ const {e, P} = mk(s); const ev = []; e.debugSpawnCard(P, so, 1, 'x-build', 0, {}, ev);
    const pal = all(P[1]).find(x=> x.defId !== 'x-build'), d = pal && (defs[pal.defId] || e.derivedDefs[pal.defId]);
    if(pal && pal.hp === 9 && d && d.attack === 2 && d.sk2Palisade) good++; }
  ok(good === 12, `1: Build {2/9 Palisade} builds a 2/9 Palisade beside it (${good}/12)`); }
{ const {e, P} = mk(2); e.debugSpawnCard(P, so, 1, 'x-build0', 0, {}, []); const pal = all(P[1]).find(x=> x.defId !== 'x-build0');
  ok(pal && pal.hp === 6, 'Build true is still the 0/6 Palisade'); }
ok(E.makeSimEngine(defs, E.mulberry32(1), {}).buildSizeOf('3/12 Palisade').hp === 12, 'buildSizeOf reads "A/H Palisade"');
{ const {e, P} = mk(3); const hp0 = P[1].hq.hp, mx0 = P[1].hq.maxHp, ev = []; e.debugSpawnCard(P, so, 1, 'x-fort', 0, {}, ev);
  ok(P[1].castleThorns === 1 && P[1].hq.hp === hp0 + 1 && P[1].hq.maxHp === mx0 + 1, `1: Fortify {Thorns 1, +1 Health}: the bramble has Thorns 1 and +1 Health (thorns ${P[1].castleThorns}, ${hp0} -> ${P[1].hq.hp})`);
  ok(ev.some(x=> x.type === 'fortify' && x.parts && x.parts.thorns === 1), '1: a fortify event names the parts');
  const f = all(P[1]).find(x=> x.defId === 'x-fort'); e.debugDamage(P, so, f.uid, 999, {}, []);
  ok(P[1].castleThorns === 1, '1: Fortify stays when its unit dies'); }
{ const {e, P} = mk(4); e.debugSpawnCard(P, so, 1, 'x-fortS', 0, {}, []); ok(P[1].castleThorns === 1 && P[1].castleBolt === 2, '1: Fortify reads the card text "Thorns 1, +1 Health, Bolt 2"'); }
ok(TXT['ui.sk2n-fortification'] === 'Build' && TXT['ui.e22-build-head'] === 'Build { {a}/{h} Palisade }' && TXT['ui.e22-fortify-name'] === 'Fortify' && TXT['ui.skn-bramble-armor'] === 'Fortify { Armor 1 }, while it lives' /* 2026-11-04 (ENG24, ENG22-2 b): a Fortify form now */, '1: the names: Build, Fortify; Bramble Armor (brambleArmor) reads as Fortify { Armor 1 }, while it lives');
ok(/key:'fortification', category:'passive', label:TX\('ui\.sk2n-fortification'\), kind:'text', placeholder:'0\/6 Palisade'/.test(app) && /key:'fortify', category:'passive', label:TX\('ui\.e22-fortify-name'\), kind:'text'/.test(app), '1: the editor fields: Build and Fortify take their braces as text');
ok(!cards.some(c=> c.effects && (c.effects.fortify || c.effects.fortification)), '1: Fortify (and Build) on no card');
ok(SK.fortify && SK.fortify.value === 3.04 && SK.fortify.theoretical, '1: Fortify priced theoretically (3.04 at the owner\'s example)');

// ---- 2. Taunt / Guardian take arrows and shots -----------------------------------------------------------------------------
function shotAt(setup, shooter){ const {e, P} = mk(6); const s = put(e, P, 1, shooter || 'x-shoot', 0); const ids = setup(e, P); const ev = [];
  e.resolveCombat(P, so, {}, ev, 1); const a = ev.filter(x=> x.type === 'arrow' && x.uid === s.uid); return {a, ids}; }
{ const r = shotAt((e, P)=> ({d: put(e, P, 2, 'x-dummy', 0).uid, t: put(e, P, 2, 'x-taunt', 1).uid}));
  ok(r.a.length && r.a.every(x=> x.targetUid === r.ids.t && x.taunted), `2: an arrow at the unit facing it goes to the Taunt unit beside it (${r.a.map(x=> x.targetUid)} vs taunt ${r.ids.t})`); }
{ const r = shotAt((e, P)=> ({d: put(e, P, 2, 'x-dummy', 0).uid, t: put(e, P, 2, 'x-taunt', 2).uid}));
  ok(r.a.length && r.a.every(x=> x.targetUid === r.ids.d), '2: a Taunt unit two columns away does not pull it (not around the shooter)'); }
{ const r = shotAt((e, P)=> ({d: put(e, P, 2, 'x-dummy', 0).uid, t: put(e, P, 2, 'x-taunt', 1).uid}), 'x-sneak');
  ok(r.a.length && r.a.every(x=> x.targetUid === r.ids.d), '2: a Stealth shooter slips past Taunt'); }
{ const r = shotAt((e, P)=> ({d: put(e, P, 2, 'x-dummy', 0).uid, g: put(e, P, 2, 'x-guard', 1).uid}));
  ok(r.a.length && r.a.every(x=> x.targetUid === r.ids.g && x.guardianRedirect), `2: a Ready Guardian beside the unit aimed at takes the arrow (${r.a.map(x=> x.targetUid)} vs guardian ${r.ids.g})`); }
{ const r = shotAt((e, P)=> ({d: put(e, P, 2, 'x-thorny', 0).uid, g: put(e, P, 2, 'x-guard', 1).uid}));
  ok(r.a.length && r.a.every(x=> x.targetUid === r.ids.d), '2: never for an ally with Thorns (EN8, P24-15)'); }
{ const {e, P} = mk(7); put(e, P, 1, 'x-volley', 0); const d = put(e, P, 2, 'x-dummy', 0), t = put(e, P, 2, 'x-taunt', 1); const ev = []; e.resolveCombat(P, so, {}, ev, 1);
  const v = ev.filter(x=> x.type === 'arrow' && x.volley); ok(v.some(x=> x.targetUid === d.uid) && v.some(x=> x.targetUid === t.uid), '2: a Volley (an arrow at every enemy) is not pulled'); }
ok(TXT['ui.e22-taunt'] && /arrows and shots/.test(TXT['ui.e22-taunt']) && /arrows and shots/.test(TXT['ui.e22-guardian']), '2: the Taunt and Guardian lines say arrows and shots');

// ---- 3. Delivery: the same Lumber, round by round, as the old form each card had ---------------------------------------------
function series(id, res){ const {e, P} = mk(8); put(e, P, 1, id, 0); put(e, P, 2, 'x-dummy', 0); const out = [];
  for(let r = 1; r <= 6; r++){ round(e, P, r); e.endOfRoundUpkeep(P, so, {}, [], {}); out.push(res === 'stone' ? (P[1].stone || 0) : res === 'pearl' ? (P[1].pearls || 0) : (P[1].lumber || 0)); } return out.join(','); }
[['x-oldStock', 'x-newStock', 'lumber', 'Stockpile 2 -> Delivery {Lumber x2}, once'], ['x-oldGold', 'x-newGold', 'lumber', 'onReadyGold 1 -> Delivery {Lumber x1}, every turn'],
 ['x-oldTrig', 'x-newTrig', 'lumber', 'an On Ready gain 1 Lumber (Wait 0) -> Delivery {Lumber x1}'], ['x-oldStone', 'x-newStone', 'stone', 'an On Ready gain 1 Stone -> Delivery {Stone x1}']].forEach(([a, b, res, m])=>{
  const s1 = series(a, res), s2 = series(b, res); ok(s1 === s2 && /[1-9]/.test(s2), `3: ${m}: the same ${res} each round (${s1} | ${s2})`); });
ok(/[1-9].*,[2-9]/.test(series('x-pearlEv', 'pearl')), `3: Delivery {Pearl x1}, every turn pays Pearls (${series('x-pearlEv', 'pearl')})`);
{ const old = cards.filter(c=> { const e = c.effects || {}; return e.stockpile || e.onReadyGold || (e.triggers || []).some(t=> t && t.on === 'onReady' && t.do === 'gain'); });
  ok(!old.length, `3: no card in canonical/cards.json carries Stockpile, onReadyGold or an On Ready gain trigger (${old.map(c=> c.id).join(', ')})`);
  const every = cards.filter(c=> c.effects && c.effects.deliveryEvery).map(c=> c.id), once = cards.filter(c=> c.effects && c.effects.delivery).map(c=> c.id);
  ok(every.length === 11 && once.length === 13, `3: 11 cards deliver every turn (onReadyGold), 13 once (Stockpile, the triggers) (${every.length} / ${once.length})`);
  ok(byId['nutria-reedcutter'].effects.delivery === 2 && byId['dune-packrat'].effects.delivery === 3 && byId['muskrat-reedgatherer'].effects.delivery === 2 && byId['gravel-mole'].effects.deliveryRes === 'stone' && byId['ore-smelter-mole'].effects.deliveryRes === 'metal' && byId['irradiated-axolotl'].effects.deliveryRes === 'uranium', '3: amounts and resources kept'); }
ok(SK.delivery && SK.delivery.value === 2.59 && SK.delivery.pow === 0.71 && SK.deliveryEvery && SK.deliveryEvery.value === 6.65 && SK.deliveryRes, '3: Delivery priced as the forms it replaces (2.59 x N^0.71 once; 6.65 every turn)');
ok(/sk1Patch\(PASSIVE_DEFS, 'stockpile', \{hidden:true\}\)/.test(app) && TXT['ui.e22-delivery-head'] === 'Delivery { {res} x{n} }', '3: Stockpile leaves "+ Add Skill"; the line reads Delivery { Lumber x1 }');

// ---- 4. Hatchling - ? until Evomax ------------------------------------------------------------------------------------------
ok(/hatchling:\s+\{from:20, nameFrom:-1\}/.test(app), '4: Hatchling reads "Hatchling - ?" from the start until Map 20 (Evomax)');

// ---- 5. base Level 0 cards: abilities from Level 1; Map 0 "?"; Cricket Drummer ------------------------------------------------
ok(byId['cricket-drummer'].effects.inspiring === 1, '5: Cricket Drummer has Inspiring 1');
{ const want = {sheep:['taunt'], 'garden-snail':['armor'], 'meerkat-wayfarer':['inspiring', 'reach'], 'sparrow-chick':['flying'], 'otter-centurion':['boomerang']};
  const bad = Object.entries(want).filter(([id, ks])=> !ks.every(k=> byId[id].levelSkills && byId[id].levelSkills['1'] && byId[id].levelSkills['1'][k] != null));
  ok(!bad.length, `5: base Level 0 cards bring their abilities at Level 1 (levelSkills "1") (${bad.map(b=> b[0])})`);
  ok(byId['garden-snail'].levelSkills['1'].slow === undefined && byId['otter-kit'].levelSkills['1'].hatchling, '5: the Slow drawback stays at Level 0; Hatchling arrives at Level 1 (2026-11-05 ENG25, owner #3)'); }
ok(/taunt:\s+\{from:1\}, reach:\{from:1\}, inspiring:\{from:1\}/.test(app), '5: Map 0 and the tutorial show the untaught abilities as "?" (the reveal map)');

// ---- 6. Carnage sees; Tally / Almanac / Onslaught / Riled --------------------------------------------------------------------
const on = c=> String(c._en5On || '').split(',');
{ const {e, P} = mk(9); const w = [0, 1, 2].map(s=> put(e, P, 2, 'x-weak', s)); w.forEach(x=> e.debugDamage(P, so, x.uid, 9, {}, []));
  const c = put(e, P, 1, 'x-carnage', 0), t = put(e, P, 1, 'x-tally', 1); e.syncPhaseStats(P, so, []);
  ok(!on(c).includes('carnage') && on(t).includes('tally'), `6: three enemies died before it came: Carnage 2 is off, Tally 2 is on (${c._en5On} | ${t._en5On})`);
  const w2 = [3, 4].map(s=> put(e, P, 2, 'x-weak', s)); w2.forEach(x=> e.debugDamage(P, so, x.uid, 9, {}, [])); e.syncPhaseStats(P, so, []);
  ok(on(c).includes('carnage') && c.carnageSeen === 2, `6: two die while it is on the board (Waiting): Carnage 2 is on (seen ${c.carnageSeen})`); }
{ const {e, P} = mk(10); P[1].deck = Array(12).fill('x-dummy'); e.draw(P[1], 3, 'A', {}, []); const a = put(e, P, 1, 'x-almanac', 0);
  e.syncPhaseStats(P, so, []); const off = !on(a).includes('almanac'); for(let k = 0; k < 3; k++) e.draw(P[1], 1, 'A', {}, []); e.syncPhaseStats(P, so, []);
  ok(off && on(a).includes('almanac') && P[1].drawnAfterOpening === 3, `6: Almanac 3: off after the opening hand, on after 3 more draws (${P[1].drawnAfterOpening})`); }
{ const {e, P} = mk(11); put(e, P, 1, 'x-hit5', 0); const o = put(e, P, 1, 'x-onsl', 1); put(e, P, 2, 'x-dummy', 3);
  round(e, P, 1); const hq = P[2].hq.hp; e.roundStart(P, 2, so, {}, []);
  ok(on(o).includes('onslaught') && P[1]._siegeLast >= 3, `6: Onslaught 3: on the round after your side dealt 5 to the enemy bramble (last ${P[1]._siegeLast}, bramble ${hq})`); }
{ const {e, P} = mk(12); const r = put(e, P, 1, 'x-riled', 0); e.roundStart(P, 1, so, {}, []); e.debugDamage(P, so, r.uid, 4, {}, []); const before = on(r).includes('riled');
  e.roundStart(P, 2, so, {}, []); const mid = on(r).includes('riled'); e.roundStart(P, 3, so, {}, []);
  ok(!before && mid && !on(r).includes('riled'), `6: Riled 3: on the round after it took 4, off the round after that (${before}/${mid}/${on(r).includes('riled')})`); }
ok(['tally', 'almanac', 'onslaught', 'riled'].every(k=> SK[k] && SK[k].theoretical && SK[k + 'Grant'] && SK[k + 'Grant'].value === 0) && !cards.some(c=> c.effects && ['tally', 'almanac', 'onslaught', 'riled'].some(k=> c.effects[k])), '6: the four counters priced (theoretical), on no card');
ok(/the card must 'see'/.test(JSON.stringify(SK.carnage)), '6: Carnage\'s price note says its uptime needs a re-measure');

// ---- 7. UI17-3 ----------------------------------------------------------------------------------------------------------
ok(!/id="adminResetBtn"/.test(app) && !/async function adminResetProgress\(\)/.test(app) && /ui17FullResetBtn/.test(app), '7: Admin -> "Reset my progress" is gone; Full reset stays');

// ---- 9. owner 22:02: "Wetness is lost 1 per turn." ------------------------------------------------------------------------
{ const {e, P} = mk(13); const c = put(e, P, 1, 'x-dummy', 0); c.water = 3; const got = []; for(let r = 1; r <= 4; r++){ e.roundStart(P, r, so, {}, []); got.push(c.water); }
  ok(got.join(',') === '2,1,0,0', `9: a unit loses 1 water counter each round start (${got})`); }
ok(eng.indexOf('en20WaterDrain(players, sideOf, events);') > 0 && eng.indexOf('en20WaterDrain(players, sideOf, events);') < eng.indexOf('en20TideWater(players, sideOf, events); // ENG20-2'), '9: the loss comes before the tide adds');
ok(/Wetness is lost 1 per turn/.test(JSON.stringify(J('docs/decisions.json').items.find(x=> x.id === 'ENG20-1'))), '9: ENG20-1 carries the owner\'s quote');
// ---- decisions, docs, packs ---------------------------------------------------------------------------------------------
{ const D = J('docs/decisions.json'), ids = D.items.map(x=> x.id); ok(['ENG22-1', 'ENG22-2'].every(i=> ids.includes(i)), '8: decisions ENG22-1 / ENG22-2 filed'); }
ok(/ENG22/.test(R('docs/project-state.md')) && /Delivery/.test(R('docs/effects-catalogue.md')) && /ENG22/.test(R('docs/CHANGELOG.md').slice(0, 6000)), '8: project-state, effects-catalogue and the CHANGELOG carry ENG22');
{ const miss = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'].filter(c=>{ const p = J('lang/' + c + '.json'); return !['Build', 'Fortify { Armor 1 }, while it lives' /* ENG24 (ENG22-2 b) */, 'Delivery { {res} x{n} }', 'Riled', TXT['ui.e22-guardian']].every(k=> p[k]); });
  ok(!miss.length, `8: the new texts in the 12 packs (${miss})`); }
console.log(`eng22: ${fail ? fail + ' failure(s)' : 'all passed'} (${n} checks)`);
process.exit(fail ? 1 : 0);
