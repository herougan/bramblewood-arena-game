// FXAUD1: the exact events the engine sends for each ENG50 mechanic (Armourer, Grant, Weaken, Rend, Enfeeble, Paralysis Powder) and the Awash field.
'use strict';
const H = require('../lib/harness.js'); const E = H.Engine; const so = id=> id === 1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:0, health:500, wait:0, cost:0, effects: effects || {}}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), { 'x-dummy': U('x-dummy', {}, {attack:1}), 'x-arm': U('x-arm', {armourer:2}), 'x-weakA': U('x-weakA', {triggers:[{on:'onSpawn', do:'weaken', who:'enemy', sub:'adjacent', amount:2}]}),
  'x-grant': U('x-grant', {triggers:[{on:'onSpawn', do:'grant', who:'ally', sub:'all', skill:'armor', armor:2}]}), 'x-para': U('x-para', {paralysisPowder:1}) });
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(){ const e = E.makeSimEngine(defs, E.mulberry32(11), {recordEvents:true, battleMode:'open'}); return {e, P:{1:e.newPlayer(1, {}, {health:500}), 2:e.newPlayer(2, {}, {health:500})}}; }
function put(e, P, pid, id, slot, ev){ e.debugSpawnCard(P, so, pid, id, 'left', {}, ev || []); const pl = P[pid], c = all(pl).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot;
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot); return c; }
const show = (label, ev)=> console.log(label.padEnd(12), JSON.stringify(ev.map(x=> [x.type, x.kind, x.field].filter(Boolean).join(':'))));
{ const {e, P} = mk(); put(e, P, 1, 'x-arm', 0); const ev = []; put(e, P, 1, 'x-dummy', 1, ev); show('Armourer', ev); }
{ const {e, P} = mk(); put(e, P, 2, 'x-dummy', 0); const ev = []; put(e, P, 1, 'x-weakA', 0, ev); show('Weaken', ev); }
{ const {e, P} = mk(); put(e, P, 1, 'x-dummy', 1); const ev = []; put(e, P, 1, 'x-grant', 0, ev); show('Grant', ev); }
{ const {e, P} = mk(); put(e, P, 1, 'x-para', 0); put(e, P, 2, 'x-dummy', 0); const ev = []; e.resolveCombat(P, so, {}, ev, 1); show('Paralysis', ev); }
// the Awash field
{ const e = E.makeSimEngine(defs, E.mulberry32(3), {recordEvents:true, battleMode:'open', fieldRules:{awash:true}}); const P = {1:e.newPlayer(1, {}, {health:500}), 2:e.newPlayer(2, {}, {health:500})};
  const hasSet = typeof e.setField === 'function'; console.log('engine exposes setField:', hasSet, '| keys with "ield":', Object.keys(e).filter(k=> /ield/.test(k)).join(',')); }
