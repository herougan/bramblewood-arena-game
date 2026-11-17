#!/usr/bin/env node
// Package ECONSK1 (2026-11-16, owner 23:28): the resource skills. Delivery {X} is the one-shot (any resource, Gold too); every turn while
// Ready: Forestry / Quarrying / Mining / Prospecting N (+N Lumber / Stone / Metal / Gold), Masonry N (2 Lumber -> 1 Stone), Refining N
// (Smelter's rule, the old key still plays); Metallurgy a placeholder (ECONSK1-1). Gold: Plunder N steals it on a landed swing; Barter pays
// what is lacking with Gold (Lumber 1, Stone 2, Metal 4) after the real resources and Pearls; Pearls pay Stone first. The CPU pays the same
// way (aiResourceGap, canPlay). Plus the app, text, price and data wiring.
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js'), E = H.Engine;
const ROOT = path.join(__dirname, '..'), R = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:0, health:500, wait:0, cost:0, archetypes:['Econ'], effects: effects || {}}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'ec-forest': U('ec-forest', {forestry:1}), 'ec-forest2': U('ec-forest2', {forestry:2}), 'ec-quarry': U('ec-quarry', {quarrying:1}),
  'ec-mine': U('ec-mine', {mining:1}), 'ec-gold': U('ec-gold', {prospecting:2}), 'ec-mason': U('ec-mason', {masonry:2}),
  'ec-refine': U('ec-refine', {refining:1}), 'ec-smelt': U('ec-smelt', {smelter:1}), 'ec-metal': U('ec-metal', {metallurgy:true}),
  'ec-dgold': U('ec-dgold', {delivery:3, deliveryRes:'gold'}), 'ec-barter': U('ec-barter', {barter:true}),
  'ec-plunder': U('ec-plunder', {plunder:2}, {attack:3}), 'ec-wall': U('ec-wall', {}, {health:5}),
  'ec-cost3': U('ec-cost3', {}, {cost:3}), 'ec-stone2': U('ec-stone2', {}, {stoneCost:2}), 'ec-mix': U('ec-mix', {}, {cost:2, stoneCost:2}),
  'ec-metal1': U('ec-metal1', {}, {metalCost:1}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(seed){ const e = E.makeSimEngine(defs, E.mulberry32(seed||7), {recordEvents:true, battleMode:'open'}); return {e, P:{1:e.newPlayer(1, {}), 2:e.newPlayer(2, {})}}; }
function put(e, P, pid, id, slot){ const pl = P[pid]; const c = e.makeBoardCard(id); c.slot = slot; c._seenAt = slot;
  const cs = all(pl).concat(c); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncSlots(pl); return c; }
const round = (e, P)=>{ const ev = []; e.resolveCombat(P, so, {}, ev, 1); return ev; };
const res = pl=> `${pl.lumber||0}L ${pl.stone||0}S ${pl.metal||0}M ${pl.gold||0}G ${pl.pearls||0}P`;
let huid = 61000; const give = (pl, defId)=>{ const uid = huid++; pl.hand.push({uid, defId}); pl.playedThisTurn = false; return uid; };

// ---- 1. the every-turn gatherers, while Ready
[['ec-forest', '1L 0S 0M 0G 0P', 'Forestry 1: +1 Lumber'], ['ec-forest2', '2L 0S 0M 0G 0P', 'Forestry 2: +2 Lumber'], ['ec-quarry', '0L 1S 0M 0G 0P', 'Quarrying 1: +1 Stone'],
 ['ec-mine', '0L 0S 1M 0G 0P', 'Mining 1: +1 Metal'], ['ec-gold', '0L 0S 0M 2G 0P', 'Prospecting 2: +2 Gold'], ['ec-metal', '0L 0S 0M 0G 0P', 'Metallurgy: no effect yet (ECONSK1-1)']].forEach(([id, want, m])=>{
  const {e, P} = mk(); put(e, P, 1, id, 0); round(e, P); ok(res(P[1]) === want, `${m} (${res(P[1])})`);
  if(id !== 'ec-metal'){ round(e, P); const two = res(P[1]).split(' ').map(x=> parseInt(x, 10)), one = want.split(' ').map(x=> parseInt(x, 10)); ok(two.every((v, i)=> v === 2 * one[i]), `${m}: again the next turn (${res(P[1])})`); } });
{ const {e, P} = mk(); const c = put(e, P, 1, 'ec-forest', 0); c.wait = 2; round(e, P); ok(res(P[1]) === '0L 0S 0M 0G 0P', `a Waiting Forestry unit gathers nothing (${res(P[1])})`); }
{ const {e, P} = mk(); put(e, P, 1, 'ec-gold', 0); const ev = round(e, P); ok(ev.some(x=> x.type === 'gold' && x.amount === 2 && x.defId === 'ec-gold'), 'Prospecting logs a gold event with its card'); }

// ---- 2. the converters: Masonry N (2 Lumber -> 1 Stone, up to N), Refining N = Smelter N
{ const {e, P} = mk(); put(e, P, 1, 'ec-mason', 0); P[1].lumber = 5; round(e, P); ok(res(P[1]) === '1L 2S 0M 0G 0P', `Masonry 2: 4 of 5 Lumber -> 2 Stone (${res(P[1])})`); }
{ const {e, P} = mk(); put(e, P, 1, 'ec-mason', 0); P[1].lumber = 1; round(e, P); ok(res(P[1]) === '1L 0S 0M 0G 0P', `Masonry: 1 Lumber is not enough, nothing paid (${res(P[1])})`); }
['ec-refine', 'ec-smelt'].forEach(id=>{ const {e, P} = mk(); put(e, P, 1, id, 0); Object.assign(P[1], {lumber:3, stone:2}); round(e, P);
  ok(res(P[1]) === '1L 0S 1M 0G 0P', `${id === 'ec-refine' ? 'Refining' : 'Smelter (old key)'} 1: 2 Lumber + 2 Stone -> 1 Metal (${res(P[1])})`); });

// ---- 3. Delivery {Gold}: once, when Ready
{ const {e, P} = mk(); put(e, P, 1, 'ec-dgold', 0); round(e, P); const a = P[1].gold || 0; round(e, P); ok(a === 3 && (P[1].gold || 0) === 3, `Delivery {Gold x3}: +3 Gold once (${a}, then ${P[1].gold || 0})`); }

// ---- 4. Plunder N: a landed swing steals up to N Gold
{ const {e, P} = mk(); put(e, P, 1, 'ec-plunder', 0); P[2].gold = 5; const ev = round(e, P);
  ok(P[1].gold === 2 && P[2].gold === 3 && ev.some(x=> x.type === 'sk2' && x.kind === 'plunder' && x.amount === 2), `Plunder 2: 2 of the foe's 5 Gold (${P[1].gold || 0} / ${P[2].gold})`); }
{ const {e, P} = mk(); put(e, P, 1, 'ec-plunder', 0); P[2].gold = 1; round(e, P); ok(P[1].gold === 1 && P[2].gold === 0, 'Plunder takes only what there is'); }
{ const {e, P} = mk(); put(e, P, 1, 'ec-plunder', 0); round(e, P); ok(!(P[1].gold > 0) && !(P[2].gold < 0), 'no Gold to steal: nothing'); }

// ---- 5. paying: real resources, then Pearls (Stone first), then Gold with Barter
{ const {e, P} = mk(); const pl = P[1]; Object.assign(pl, {lumber:1, gold:9});
  ok(!e.canPlay(pl, 'ec-cost3'), 'without Barter, Gold pays nothing');
  put(e, P, 1, 'ec-barter', 0); ok(e.canPlay(pl, 'ec-cost3'), 'with a Barter unit, Gold covers the missing Lumber');
  const uid = give(pl, 'ec-cost3'); ok(e.placeCard(P, so, 1, uid, 'left', {}, []) !== false, 'placed'); ok(res(pl) === '0L 0S 0M 7G 0P', `3 Lumber: 1 Lumber + 2 Gold (${res(pl)})`); }
{ const {e, P} = mk(); const pl = P[1]; put(e, P, 1, 'ec-barter', 0); Object.assign(pl, {stone:1, gold:2});
  const uid = give(pl, 'ec-stone2'); ok(e.canPlay(pl, 'ec-stone2') && e.placeCard(P, so, 1, uid, 'left', {}, []) !== false && res(pl) === '0L 0S 0M 0G 0P', `a missing Stone costs 2 Gold (${res(pl)})`); }
{ const {e, P} = mk(); const pl = P[1]; put(e, P, 1, 'ec-barter', 0); Object.assign(pl, {gold:3}); ok(!e.canPlay(pl, 'ec-metal1'), 'a Metal is 4 Gold: 3 is not enough');
  pl.gold = 4; const uid = give(pl, 'ec-metal1'); ok(e.canPlay(pl, 'ec-metal1') && e.placeCard(P, so, 1, uid, 'left', {}, []) !== false && res(pl) === '0L 0S 0M 0G 0P', `4 Gold pays a Metal (${res(pl)})`); }
{ const {e, P} = mk(); const pl = P[1]; Object.assign(pl, {lumber:0, stone:0, pearls:2});
  const g = e.payGap(pl, 2, 2, 0); ok(g.pearls === 2 && g.stone === 0 && g.lumber === 2, `payGap: 2 Pearls go to the Stone first (${JSON.stringify(g)})`);
  put(e, P, 1, 'ec-barter', 0); pl.gold = 2; const uid = give(pl, 'ec-mix'); ok(e.canPlay(pl, 'ec-mix') && e.placeCard(P, so, 1, uid, 'left', {}, []) !== false, 'a 2 Lumber + 2 Stone card: Pearls + Gold');
  ok(res(pl) === '0L 0S 0M 0G 0P', `Pearls paid the Stone (dearer), Gold the Lumber: 2 Gold, not 4 (${res(pl)})`); }
{ const {e, P} = mk(); const pl = P[1]; Object.assign(pl, {lumber:3, stone:2, pearls:2}); const uid = give(pl, 'ec-mix');
  ok(e.placeCard(P, so, 1, uid, 'left', {}, []) !== false && res(pl) === '1L 0S 0M 0G 2P', `enough Lumber and Stone: no Pearl is used (${res(pl)})`); }
{ const {e, P} = mk(); const pl = P[1]; Object.assign(pl, {lumber:1, stone:0, pearls:1}); put(e, P, 1, 'ec-barter', 0); pl.gold = 0; ok(!e.canPlay(pl, 'ec-mix'), 'short after Pearls and no Gold: cannot play'); }

// ---- 6. the CPU pays by the same rules
{ const {e, P} = mk(); const pl = P[1]; Object.assign(pl, {lumber:0, gold:5}); ok(e.aiResourceGap(pl, 'ec-cost3') === 3, `aiResourceGap without Barter: 3 short (${e.aiResourceGap(pl, 'ec-cost3')})`);
  put(e, P, 1, 'ec-barter', 0); ok(e.aiResourceGap(pl, 'ec-cost3') === 0, `with Barter and 5 Gold: payable (${e.aiResourceGap(pl, 'ec-cost3')})`);
  pl.gold = 1; ok(e.aiResourceGap(pl, 'ec-cost3') === 2, `with Barter and 1 Gold: 2 short (${e.aiResourceGap(pl, 'ec-cost3')})`); }
{ let played = 0; for(let s = 1; s <= 10; s++){ const {e, P} = mk(s); const pl = P[2]; put(e, P, 2, 'ec-barter', 0); Object.assign(pl, {lumber:0, gold:3}); pl.hand = []; give(pl, 'ec-cost3');
    e.aiTakeTurn(P, so, 2, {}, []); if(all(pl).some(c=> c.defId === 'ec-cost3') && pl.gold === 0) played++; }
  ok(played >= 8, `the CPU plays a 3-Lumber card with Barter + 3 Gold and pays the Gold (${played}/10 seeds)`); }

// ---- 7. data: cards migrated, no Delivery every round left
const cards = JSON.parse(R('canonical/cards.json')), SP = require(path.join(ROOT, 'bramblewood-skillparams.js'));
const every = cards.filter(c=> [c.effects || {}].concat(Object.values(c.levelSkills || {})).some(o=> o && (o.deliveryEvery || (o.delivery && o.delivery.every))));
ok(!every.length, `no card keeps Delivery every round (${every.map(c=> c.id).join(', ')})`);
const forest = cards.filter(c=> c.effects && c.effects.forestry === 1).map(c=> c.id);
ok(forest.length >= 11 && ['land-tiller', 'rodent-king', 'nautilus-drifter', 'chipmunk-hoarder'].every(id=> forest.includes(id)), `the every-round Lumber deliverers are Forestry 1 (${forest.length})`);
ok(!cards.some(c=> c.effects && (c.effects.smelter)), 'no card carries the old Smelter key');
// 2026-11-18 (TESTFIX): SKAUD1 merged Stonecutter into Masonry (docs/design/skaud1-2026-11-17.json); the old key must not come back
ok(!cards.some(c=> c.effects && c.effects.stonecutter), 'Stonecutter merged into Masonry (SKAUD1): no card keeps it');

// ---- 8. app, texts, prices, decision, notes
const app = R('arena_app.js'), blk = app.slice(app.indexOf('// ==== ECONSK1 (2026-11-16'), app.indexOf('// ==== Package ENG24 (2026-11-04'));
const KEYS = ['forestry', 'quarrying', 'mining', 'masonry', 'refining', 'metallurgy', 'prospecting', 'plunder', 'barter'];
KEYS.forEach(k=> ok(new RegExp(`\\{key:'${k}', category:'passive'`).test(blk) && new RegExp(`\\b${k}:'`).test(blk), `${k}: in PASSIVE_DEFS (editor, Codex) with an icon`));
ok(/sk1Patch\(PASSIVE_DEFS, 'smelter', \{hidden:true\}\)/.test(blk) && /sk1Patch\(PASSIVE_DEFS, 'deliveryEvery', \{hidden:true\}\)/.test(blk), 'Smelter and Delivery every turn leave "+ Add Skill"');
ok(/goldSkill/.test(app) && /e\.prospecting \|\| e\.plunder \|\| e\.barter/.test(app), 'the Gold pill shows with a Gold skill on the board');
ok(/ev\.kind === 'plunder'/.test(app.slice(app.indexOf('function sk2Vfx('))), 'Plunder has a log line and an effect');
const TXT = (()=>{ const t = R('bramblewood-texts.js'); return JSON.parse(t.slice(t.indexOf('/*TEXT-TABLE-START*/') + 20, t.indexOf('/*TEXT-TABLE-END*/'))); })();
const TK = ['ui.e22-res-gold', 'ui.skn-forestry', 'ui.sk-forestry', 'ui.skn-quarrying', 'ui.sk-quarrying', 'ui.skn-mining', 'ui.sk-mining', 'ui.skn-masonry', 'ui.sk-masonry', 'ui.skn-metallurgy', 'ui.sk-metallurgy', 'ui.sk-metallurgy-codex',
  'ui.skn-prospecting', 'ui.sk-prospecting', 'ui.sk-prospecting-codex', 'ui.skn-plunder', 'ui.sk-plunder', 'ui.skn-barter', 'ui.sk-barter', 'ui.sk-barter-codex', 'ui.log-econ-gold', 'ui.econ-log-plunder'];
TK.forEach(k=> ok(TXT[k] && (app.includes(`TX('${k}'`) || app.includes(`: '${k}'`)) /* 2026-11-18 (TESTFIX): SKAUD1's plunderRes picks the key in a ternary */, `${k}: a text, used`));
ok(TXT['ui.sk2n-smelter'] === 'Refining', 'Smelter reads as Refining');
const strip = s=> String(s).replace(/^[^\p{L}{]+/u, '');
['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'].forEach(code=>{ const pack = JSON.parse(R('lang/' + code + '.json'));
  const miss = TK.concat(['ui.sk2n-smelter']).filter(k=> !(TXT[k] in pack) && !(strip(TXT[k]) in pack)); ok(!miss.length, `${code}: translated (${miss.join(', ')})`); });
const SC = JSON.parse(R('canonical/skill-costs.json')), DL = JSON.parse(R('canonical/skill-delivery.json'));
KEYS.forEach(k=>{ const s = SC.skills.find(x=> x.id === k); ok(s && typeof s.value === 'number' && /ECONSK1/.test(s.pricedAt || '') && /estimate/.test(s.measuredWhy || ''), `${k}: priced, marked an estimate`); ok(DL.delivery[k] === 'none', `${k}: delivery none`); });
const D = JSON.parse(R('docs/decisions.json')).items.find(x=> x.id === 'ECONSK1-1'); ok(D && D.status === 'YET' && D.body.split(/\s+/).length < 100, 'decision ECONSK1-1 (Metallurgy) filed, short');
const PS = R('docs/project-state.md'); ok(/ECONSK1/.test(PS) && /Dragon Lair \(20-B\)/.test(PS) && /Pumice Beetle/.test(PS), 'project-state: the rules, the Maps 0-20 note and its card list');
ok(/econsk1-2026-11-16\.js/.test(R('tests/run-all.sh')), 'in tests/run-all.sh');

console.log(fail ? `econsk1: ${fail} of ${n} checks FAILED` : `econsk1: all ${n} checks passed`);
process.exit(fail ? 1 : 0);
