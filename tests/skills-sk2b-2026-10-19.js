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
const dec = JSON.parse(R('docs/decisions.json')), rule = (dec.rules || []).find(r=> /SK2b/.test(r.intro || ''));
ok(rule && rule.items.some(x=> /low costed/.test(x)), 'docs/decisions.json records the principle');
ok(R('docs/decisions.md').includes('Strong creatures can be low costed'), 'decisions.md regenerated with it');

console.log(fail ? `skills-sk2b-2026-10-19: ${fail} of ${n} checks FAILED` : `skills-sk2b-2026-10-19: all ${n} checks passed`); process.exit(fail ? 1 : 0);
