#!/usr/bin/env node
// Package SK2b (2026-10-19, owner 23:43: "do we have 3 simple skills -> to generate lumber every turn, stone every turn, and metal every
// turn? Maybe for metal, it's 2 lumber + 2 stone = 1 metal. For stone, it's possible to harvest it, but it usually takes lumber."):
// the three-tier economy. Milling N (Lumber, free), Quarry N (pay 1 Lumber: N Stone), Smelter N (pay 2 Lumber + 2 Stone: 1 Metal, up to
// N times), all On Turn Start × Gain in the trigger layer, the price being the new trigger condition t.pay. Checks: each tier, can't pay,
// a price is paid whole or not at all, conversion order (upkeep order), the gates before the price (Waiting, Stunned, Confused), the
// parameters, the app / text / cost wiring, the economy note and the recorded decision.
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js'), E = H.Engine;
const ROOT = path.join(__dirname, '..'), R = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:0, health:500, wait:0, cost:0, archetypes:['Sk2'], effects: effects || {}}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'k2b-mill': U('k2b-mill', {milling:true}), 'k2b-quarry': U('k2b-quarry', {quarry:true}), 'k2b-quarry2': U('k2b-quarry2', {quarry:2}),
  'k2b-smelt': U('k2b-smelt', {smelter:true}), 'k2b-smelt2': U('k2b-smelt2', {smelter:2}), 'k2b-wall': U('k2b-wall'),
  'k2b-payheal': U('k2b-payheal', {triggers:[{on:'perTurn', do:'heal', who:'self', amount:5, pay:{metal:1}}]}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(seed, sk2){ const e = E.makeSimEngine(defs, E.mulberry32(seed||7), {recordEvents:true, battleMode:'open', sk2: sk2 || undefined}); return {e, P:{1:e.newPlayer(1, {}), 2:e.newPlayer(2, {})}}; }
function put(e, P, pid, id, slot){ const pl = P[pid]; const c = e.makeBoardCard(id); c.slot = slot; c._seenAt = slot;
  const cs = all(pl).concat(c); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncSlots(pl); return c; }
const round = (e, P)=>{ const ev = []; e.resolveCombat(P, so, {}, ev, 1); return ev; };
const res = pl=> `${pl.lumber||0}L ${pl.stone||0}S ${pl.metal||0}M`;
const kind = (ev, k)=> ev.filter(x=> x.type === 'sk2' && x.kind === k);

// ---- 1. Quarry N: pay 1 Lumber, gain N Stone; can't pay: nothing
{ const {e, P} = mk(); put(e, P, 1, 'k2b-quarry', 0); P[1].lumber = 3; const ev = round(e, P);
  ok(res(P[1]) === '2L 1S 0M', `Quarry: 1 Lumber -> 1 Stone (${res(P[1])})`);
  ok(kind(ev, 'pay').length === 1 && kind(ev, 'pay')[0].price.map(x=> x.res + x.n).join() === 'lumber1' && ev.some(x=> x.type === 'stone' && x.amount === 1), 'a pay event, then the Stone'); }
{ const {e, P} = mk(); put(e, P, 1, 'k2b-quarry', 0); P[1].lumber = 0; const ev = round(e, P);
  ok(res(P[1]) === '0L 0S 0M' && kind(ev, 'cantPay').length === 1 && !ev.some(x=> x.type === 'triggerFired') && !ev.some(x=> x.type === 'stone'), "can't pay: nothing happens (no trigger, no Stone), and the log says why"); }
{ const {e, P} = mk(); put(e, P, 1, 'k2b-quarry2', 0); P[1].lumber = 1; round(e, P); ok(res(P[1]) === '0L 2S 0M', `Quarry 2: 1 Lumber -> 2 Stone (${res(P[1])})`); }
{ const {e, P} = mk(); const Q = put(e, P, 1, 'k2b-quarry', 0); Q.wait = 2; P[1].lumber = 3; round(e, P); ok(res(P[1]) === '3L 0S 0M', 'a Waiting Quarry neither pays nor digs'); }
{ const {e, P} = mk(); const Q = put(e, P, 1, 'k2b-quarry', 0); Q.stunned = 2; P[1].lumber = 3; round(e, P); ok(res(P[1]) === '3L 0S 0M', 'a Stunned Quarry neither pays nor digs'); }
{ let bad = 0, paid = 0; for(let s = 1; s <= 40; s++){ const {e, P} = mk(s); const Q = put(e, P, 1, 'k2b-quarry', 0); Q.confused = 5; P[1].lumber = 3; round(e, P);
    const r = res(P[1]); if(r === '2L 1S 0M') paid++; else if(r !== '3L 0S 0M') bad++; }
  ok(!bad && paid > 5 && paid < 35, `a Confused fumble costs nothing; a trigger that goes off pays (${paid}/40 paid, ${bad} bad)`); }

// ---- 2. Smelter N: 2 Lumber + 2 Stone -> 1 Metal, each conversion whole or not at all
{ const {e, P} = mk(); put(e, P, 1, 'k2b-smelt', 0); Object.assign(P[1], {lumber:2, stone:2}); round(e, P); ok(res(P[1]) === '0L 0S 1M', `Smelter: 2L + 2S -> 1M (${res(P[1])})`); }
{ const {e, P} = mk(); put(e, P, 1, 'k2b-smelt', 0); Object.assign(P[1], {lumber:5, stone:1}); const ev = round(e, P);
  ok(res(P[1]) === '5L 1S 0M' && kind(ev, 'cantPay').length === 1, `short of Stone: nothing is spent (${res(P[1])})`); }
{ const {e, P} = mk(); put(e, P, 1, 'k2b-smelt', 0); Object.assign(P[1], {lumber:1, stone:9}); round(e, P); ok(res(P[1]) === '1L 9S 0M', 'short of Lumber: nothing is spent'); }
{ const {e, P} = mk(); put(e, P, 1, 'k2b-smelt2', 0); Object.assign(P[1], {lumber:4, stone:4}); round(e, P); ok(res(P[1]) === '0L 0S 2M', `Smelter 2: two conversions (${res(P[1])})`); }
{ const {e, P} = mk(); put(e, P, 1, 'k2b-smelt2', 0); Object.assign(P[1], {lumber:3, stone:3}); const ev = round(e, P);
  ok(res(P[1]) === '1L 1S 1M' && kind(ev, 'pay').length === 1 && kind(ev, 'cantPay').length === 1, `Smelter 2 with 3L 3S: one conversion, the second can't pay (${res(P[1])})`); }

// ---- 3. Conversion order: units act in the upkeep's order (a side's left flank from the centre out, the centre, the right flank)
{ const {e, P} = mk(); put(e, P, 1, 'k2b-quarry', -1); put(e, P, 1, 'k2b-smelt', 1); Object.assign(P[1], {lumber:3, stone:1}); round(e, P);
  ok(res(P[1]) === '0L 0S 1M', `Quarry (left) acts before Smelter (right): it feeds it the same turn (${res(P[1])})`); }
{ const {e, P} = mk(); put(e, P, 1, 'k2b-smelt', -1); put(e, P, 1, 'k2b-quarry', 1); Object.assign(P[1], {lumber:3, stone:1}); round(e, P);
  ok(res(P[1]) === '2L 2S 0M', `Smelter first: it can't pay yet; the Quarry digs after it (${res(P[1])})`);
  round(e, P); ok(res(P[1]) === '0L 0S 1M', `next turn the Smelter pays first, and the Quarry has no Lumber left (${res(P[1])})`); }
{ const {e, P} = mk(); put(e, P, 1, 'k2b-mill', -1); put(e, P, 1, 'k2b-quarry', 0); put(e, P, 1, 'k2b-smelt', 1); Object.assign(P[1], {lumber:2, stone:1}); round(e, P);
  ok(res(P[1]) === '0L 0S 1M', `the whole chain in one turn: Mill +1L, Quarry 1L -> 1S, Smelter 2L + 2S -> 1M (${res(P[1])})`); }
{ const {e, P} = mk(); put(e, P, 1, 'k2b-quarry', 0); put(e, P, 2, 'k2b-smelt', 0); Object.assign(P[1], {lumber:3}); Object.assign(P[2], {lumber:2, stone:2}); round(e, P);
  ok(res(P[1]) === '2L 1S 0M' && res(P[2]) === '0L 0S 1M', 'each side pays from its own resources'); }

// ---- 4. The price is a general trigger condition (t.pay), and the numbers are parameters
{ const {e, P} = mk(); const C = put(e, P, 1, 'k2b-payheal', 0); C.hp = 100; P[1].metal = 1; round(e, P); ok(C.hp === 105 && P[1].metal === 0, 'any trigger can carry a price: On Turn Start, pay 1 Metal, heal 5');
  round(e, P); ok(C.hp === 105, '... and with no Metal left it does nothing'); }
{ const {e, P} = mk(1, {quarryLumber:2, quarryN:3}); put(e, P, 1, 'k2b-quarry', 0); P[1].lumber = 2; round(e, P); ok(res(P[1]) === '0L 3S 0M', 'opts.sk2 quarryLumber / quarryN'); }
{ const {e, P} = mk(1, {smelterLumber:1, smelterStone:3, smelterMetal:2}); put(e, P, 1, 'k2b-smelt', 0); Object.assign(P[1], {lumber:1, stone:3}); round(e, P); ok(res(P[1]) === '0L 0S 2M', 'opts.sk2 smelterLumber / smelterStone / smelterMetal (the ratio)'); }
const D = E.SK2_DEFAULTS; ok(D.quarryN === 1 && D.quarryLumber === 1 && D.smelterN === 1 && D.smelterLumber === 2 && D.smelterStone === 2 && D.smelterMetal === 1, 'SK2_DEFAULTS: Quarry 1 Lumber -> 1 Stone; Smelter 2 + 2 -> 1');
const eng = R('bramblewood-engine.js');
ok(/if\(t\.pay && !sk2PayFor\(pl, boardCard, t, mySide, events\)\)/.test(eng) && eng.indexOf('if(t.pay && !sk2PayFor(') > eng.indexOf('if(sk3TrigGate(boardCard, hook, t, i, mySide, events)) return;'), 'the price is paid after every gate (SK3 included), right before the trigger goes off');
ok(/list\.push\(\{on:'perTurn', do:'gain', resource:'stone', amount:numN\(e\.quarry, SK2\.quarryN\), pay:\{lumber:SK2\.quarryLumber\}, keyword:'quarry'\}\)/.test(eng), 'Quarry is On Turn Start × Gain Stone with a price, in trigsOf');

// ---- 4b. The weapons (owner, Oct 21): the smith (Forge Weapon with a Stone price) and the weapon thief (Disarm)
Object.assign(defs, {
  'k2b-unit': U('k2b-unit', {}, {attack:2, health:20}), 'k2b-restless': U('k2b-restless', {restless:true}, {attack:2, health:20}),
  'k2b-thief': U('k2b-thief', {disarm:true}, {attack:1, health:20}),
  'k2b-sword': {id:'k2b-sword', name:'K2b Sword', cardType:'equipment', attack:3, health:2, wait:0, cost:1, effects:{}, equip:{grant:{reach:true}}},
});
let HU = 70000; const give = (pl, defId)=>{ const uid = ++HU; pl.hand.push({uid, defId}); return uid; };
const freshT = pl=>{ pl.playedThisTurn = false; pl.playsTurn = -99; pl.lumber = 9; pl.discardUsedThisTurn = false; };
const at = (pl, sl)=> all(pl).find(c=> c.hp > 0 && c.slot === sl);
const smithDef = defs['anvilwhisker-otter'], thiefCard = defs['glintsnatch-magpie'];
ok(smithDef && thiefCard, 'the two new cards are in the defs (Anvilwhisker Otter, Glintsnatch Magpie)');
{ const {e, P} = mk(); put(e, P, 1, 'anvilwhisker-otter', 0).wait = 0; P[1].stone = 1; const ev = round(e, P); const lone = P[1].eqSlots && P[1].eqSlots[-1];
  ok(P[1].stone === 0 && lone && /^sk2-forged~1x0$/.test(lone.defId) && ev.some(x=> x.type === 'equipLaid' && x.forged && x.slot === -1), `the smith pays 1 Stone and lays a +1/+0 Forged Blade in its nearest free slot (${JSON.stringify(P[1].eqSlots)})`);
  const d = e.derivedDefs[lone.defId]; ok(d && d.cardType === 'equipment' && d.attack === 1 && d.health === 0 && d.token, 'the Forged Blade is an equipment token, +1/+0');
  round(e, P); ok(!(P[1].stone > 0) && Object.keys(P[1].eqSlots).length === 1, 'no Stone: no second blade'); }
{ const {e, P} = mk(); put(e, P, 1, 'anvilwhisker-otter', 0).wait = 0; put(e, P, 1, 'k2b-wall', -1); put(e, P, 1, 'k2b-wall', 1); P[1].eqSlots = {'-2': {defId:'k2b-sword'}, 2: {defId:'k2b-sword'}}; P[1].stone = 3;
  const ev = round(e, P); ok(P[1].stone === 3 && kind(ev, 'noRoom').length === 1, 'no free slot (every legal slot taken or holding a piece): nothing is laid, and the Stone is not paid'); }
{ const {e, P} = mk(); put(e, P, 1, 'anvilwhisker-otter', 0).wait = 0; P[1].stone = 1; round(e, P); freshT(P[1]);
  const u = e.debugSpawnCard(P, so, 1, 'k2b-unit', -1, {}, []); const c = at(P[1], -1); e.floorScan(P, so, {}, []);
  ok(u && c && /^sk2-forged/.test(c.equipment) && c.equipping === 1 && c.atk === 2, 'a unit played onto the blade picks it up and is equipping (no bonus yet)');
  e.roundStart(P, 2, so, {}, []); ok(c.atk === 3 && c.equipOn, `a round later it is +1/+0 (${c.atk})`); }
// Disarm: on hit, the hit unit's piece (equipped: its stats and skills come off); on play, the foe's nearest lone piece; not if it carries one
const equipUnder = (e, P, pid, c)=>{ freshT(P[pid]); const h = give(P[pid], 'k2b-sword'); ok(e.placeEquipment(P, so, pid, h, c.slot, {}, []), 'equipped for the test'); e.roundStart(P, 2, so, {}, []); };
{ const {e, P} = mk(); const T = put(e, P, 1, 'k2b-thief', 0), V = put(e, P, 2, 'k2b-unit', 0); equipUnder(e, P, 2, V);
  ok(V.equipOn && V.atk === 5 && V.maxHp === 22 && (defs[V.defId] || e.derivedDefs[V.defId]).effects.reach, `the target is equipped (+3/+2, Reach): ${V.atk}/${V.maxHp}`);
  const ev = []; e.debugAttack(P, so, T.uid, {}, ev); const dv = (defs[V.defId] || e.derivedDefs[V.defId]);
  ok(!V.equipment && V.atk === 2 && V.maxHp === 20 && !(dv.effects || {}).reach, `Disarm on hit: the piece comes off with its stats and skill (${V.atk}/${V.maxHp})`);
  ok(T.equipment === 'k2b-sword' && T.equipping === 1 && T.atk === 1 && kind(ev, 'disarm').length === 1, 'the thief starts equipping the stolen piece (EQ\'s round)');
  e.roundStart(P, 3, so, {}, []); ok(T.atk === 4 && T.equipOn, `... and has its bonus a round later (${T.atk})`); }
{ const {e, P} = mk(); const T = put(e, P, 1, 'k2b-thief', 0), V = put(e, P, 2, 'k2b-unit', 0), W = put(e, P, 2, 'k2b-unit', 1); equipUnder(e, P, 2, V); freshT(P[2]); const h = give(P[2], 'k2b-sword'); e.placeEquipment(P, so, 2, h, 1, {}, []);
  T.equipment = 'k2b-sword'; T.equipping = 1; const ev = []; e.debugAttack(P, so, T.uid, {}, ev);
  ok(V.equipment === 'k2b-sword' && kind(ev, 'disarmFull').length === 1, 'a thief that already carries a piece takes nothing'); }
{ const {e, P} = mk(); P[2].eqSlots = {2: {defId:'k2b-sword'}, '-1': {defId:'k2b-sword'}}; put(e, P, 2, 'k2b-unit', 0); const ev = []; e.debugSpawnCard(P, so, 1, 'k2b-thief', 0, {}, ev); const T = at(P[1], 0);
  ok(T && T.equipment === 'k2b-sword' && !P[2].eqSlots[-1] && P[2].eqSlots[2] && kind(ev, 'disarm').some(x=> x.lone && x.slot === -1), 'Disarm on play: the foe\'s nearest lone piece (slot -1, not 2) comes to it'); }
{ const {e, P} = mk(); put(e, P, 2, 'k2b-unit', 0); const ev = []; e.debugSpawnCard(P, so, 1, 'glintsnatch-magpie', 0, {}, ev); const T = at(P[1], 0);
  ok(T && !T.equipment && !kind(ev, 'disarm').length, 'no piece to take: nothing happens (the real card, Glintsnatch Magpie)'); }

// ---- 4c. The equipment rules (owner item 17): what EQ's tests left open
{ const {e, P} = mk(); const R0 = put(e, P, 1, 'k2b-restless', 0); put(e, P, 2, 'k2b-wall', 2); equipUnder(e, P, 1, R0); const a0 = R0.atk;
  e.roundStart(P, 3, so, {}, []); e.resolveCombat(P, so, {}, [], 1);
  ok(R0.slot !== 0 && R0.equipment === 'k2b-sword' && R0.equipOn && R0.atk >= a0 && !(P[1].eqSlots || {})[0], `a piece moves with its unit (Restless walked ${0} -> ${R0.slot}, still equipped, nothing left behind)`); }
{ const {e, P} = mk(); const R0 = put(e, P, 1, 'k2b-restless', 0); put(e, P, 2, 'k2b-wall', 2); P[1].eqSlots = {1: {defId:'k2b-sword'}}; e.floorScan(P, so, {}, []);
  e.roundStart(P, 2, so, {}, []); e.resolveCombat(P, so, {}, [], 1);
  ok(R0.slot === 1 && R0.equipment === 'k2b-sword' && !(P[1].eqSlots || {})[1], `a unit that moves onto a lone piece picks it up (slot ${R0.slot})`); }
{ const {e, P} = mk(); const R0 = put(e, P, 1, 'k2b-restless', 0); put(e, P, 2, 'k2b-wall', 2); R0.equipment = 'k2b-sword'; R0.equipOn = true; P[1].eqSlots = {1: {defId:'k2b-sword'}}; e.floorScan(P, so, {}, []);
  e.roundStart(P, 2, so, {}, []); e.resolveCombat(P, so, {}, [], 1);
  ok(R0.slot === 1 && (P[1].eqSlots || {})[1], 'a unit already carrying a piece walks over a lone one and leaves it lying'); }
{ const {e, P} = mk(); const tok = e.makeBoardCard('k2b-unit'); P[1].eqSlots = {0: {defId:'k2b-sword'}}; const ok1 = e.debugSpawnCard(P, so, 1, 'k2b-unit', 0, {}, []); const c = at(P[1], 0);
  ok(ok1 && c && c.equipment === 'k2b-sword' && c.equipping === 1 && c.atk === 2, 'a unit spawned onto a lone piece picks it up, and waits its round for the bonus'); void tok; }
{ const {e, P} = mk(); const V = put(e, P, 1, 'k2b-unit', 0); equipUnder(e, P, 1, V); e.debugDamage(P, so, V.uid, 999, {}, []);
  ok(P[1].eqSlots && P[1].eqSlots[0] && P[1].eqSlots[0].defId === 'k2b-sword' && !P[1].graveyard.some(g=> g.defId === 'k2b-sword'), 'an equipped unit dies: its piece stays in the slot (not the graveyard)'); }
{ const e = E.makeSimEngine(defs, E.mulberry32(3), {recordEvents:true, battleMode:'gravity'}); const P = {1:e.newPlayer(1, {}), 2:e.newPlayer(2, {})}; e.debugSpawnCard(P, so, 1, 'k2b-unit', 'left', {}, []);
  const V = all(P[1])[0]; freshT(P[1]); const h = give(P[1], 'k2b-sword'); ok(e.equip(P, so, 1, V.uid, h, {}, []), 'gravity board: equip onto a unit'); e.debugDamage(P, so, V.uid, 999, {}, []);
  ok(P[1].graveyard.some(g=> g.defId === 'k2b-sword') && !Object.keys(P[1].eqSlots || {}).length, 'a packed (gravity) row has no slots: the piece goes to the graveyard with its unit'); }

// ---- 5. App, texts, costs, the note and the decision
const src = R('arena_app.js'), TXT = (()=>{ const t = R('bramblewood-texts.js'); return JSON.parse(t.slice(t.indexOf('/*TEXT-TABLE-START*/') + 20, t.indexOf('/*TEXT-TABLE-END*/'))); })();
['quarry', 'smelter'].forEach(k=> ok(new RegExp(`\\{key:'${k}', category:'passive', label:TX\\('ui\\.sk2n-${k}'\\)`).test(src), `${k}: in PASSIVE_DEFS (the Codex skill book)`));
const keys = ['ui.sk2n-quarry', 'ui.sk2n-smelter', 'ui.sk2-quarry', 'ui.sk2-smelter-1', 'ui.sk2-smelter', 'ui.sk2-quarry-codex', 'ui.sk2-smelter-codex', 'ui.sk2-log-pay', 'ui.sk2-log-cant-pay'];
keys.forEach(k=> ok(TXT[k] && src.includes(`TX('${k}'`), `${k}: a used TX key`));
['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'].forEach(code=>{ const pack = JSON.parse(R('lang/' + code + '.json'));
  ok(keys.every(k=> pack[TXT[k]] && JSON.stringify((TXT[k].match(/\{\w+\}/g) || []).sort()) === JSON.stringify((pack[TXT[k]].match(/\{\w+\}/g) || []).sort())), `${code}: the SK2b texts, placeholders kept`); });
const SC = JSON.parse(R('canonical/skill-costs.json'));
['quarry', 'smelter'].forEach(id=>{ const e = SC.skills.find(x=> x.id === id); ok(e && e.scale === 'n' && e.measuredConf === 'low' && /^estimate SK2b/.test(e.measuredHow || ''), `skill-costs: ${id} has an estimate`); });
const note = R('docs/economy-resources-2026-10-19.md');
ok(/Strong creatures can be low costed - and their power is that they are low costed/.test(note) && /Quarry/.test(note) && /Smelter/.test(note) && /Lumber term/i.test(note), 'docs/economy-resources-2026-10-19.md: the tiers, the principle, the budget recommendation');
ok(/Thistlewood/.test(note) && /Village Miller/.test(note) && /Anvilwhisker Otter/.test(note) && /Glintsnatch Magpie/.test(note), 'the note: Lumber in Map 1 (Thistlewood), the smith and the weapon thief');
['disarm'].forEach(k=> ok(new RegExp(`\\{key:'${k}', category:'passive', label:TX\\('ui\\.sk2n-${k}'\\)`).test(src), `${k}: in PASSIVE_DEFS`));
ok(/\{key:'forgeWeapon', get label\(\)\{ return TX\('ui\.sk2-act-forge'\); \}/.test(src) && /\{key:'disarm', get label\(\)\{ return TX\('ui\.sk2n-disarm'\); \}/.test(src), 'the trigger builder offers Forge Weapon and Disarm');
ok(src.includes('try{ doText = sk2TriggerText(t, doText); }catch(e){}'), "a trigger's price shows in the card text");
['forgeWeapon', 'disarm'].forEach(id=> ok(SC.actions.find(x=> x.id === id && /^estimate SK2b/.test(x.measuredHow || '')), `skill-costs: the ${id} action has an estimate`));
ok(SC.skills.find(x=> x.id === 'disarm' && /^estimate SK2b/.test(x.measuredHow || '')), 'skill-costs: Disarm has an estimate');
{ const cards = JSON.parse(R('canonical/cards.json')), Tb = require('../tools/skill_costs.js').make(SC);
  ['anvilwhisker-otter', 'glintsnatch-magpie'].forEach(id=>{ const c = cards.find(x=> x.id === id), b = c && Tb.budget(c); ok(c && c.awaitingSource && !c.source && b.ok && !b.missing.length && cards.indexOf(c) >= cards.length - 12 /* 2026-10-23: later packages append cards (EN's Coffer Mimic) */, `${id}: near the end of cards.json, awaitingSource, inside its budget`); }); }
const dec = JSON.parse(R('docs/decisions.json')), rule = (dec.rules || []).find(r=> /SK2b/.test(r.intro || ''));
ok(rule && rule.items.some(x=> /low costed/.test(x)), 'docs/decisions.json records the principle');
ok(R('docs/decisions.md').includes('Strong creatures can be low costed'), 'decisions.md regenerated with it');

console.log(fail ? `skills-sk2b-2026-10-19: ${fail} of ${n} checks FAILED` : `skills-sk2b-2026-10-19: all ${n} checks passed`); process.exit(fail ? 1 : 0);
