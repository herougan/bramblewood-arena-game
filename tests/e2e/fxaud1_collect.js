// FXAUD1 (2026-11-18): run many engine boards and keep one sample of every event (type, kind, field, element) the engine emits.
// usage: node tests/e2e/fxaud1_collect.js docs/perf/fxaud1/event-samples.json
'use strict';
const H = require('../lib/harness.js'); const fs = require('fs');
const defs = H.loadCardDefs(); const ids = H.fieldableIds(defs); const samples = {}, counts = {};
const keyOf = ev=> [ev.type, ev.kind, ev.field, ev.element].filter(x=> x != null).join('|');
function take(events, src){ events.forEach(ev=>{ const k = keyOf(ev); counts[k] = (counts[k]||0) + 1; if(!samples[k]) samples[k] = {ev, src}; }); }
const U = (id, effects, o)=> Object.assign({id, name:id, attack:0, health:500, wait:0, cost:0, effects: effects || {}}, o || {});
const d2 = Object.assign({}, defs, { 'x-dummy': U('x-dummy', {}, {attack:1}),
  'x-para': U('x-para', {paralysisPowder:1}), 'x-rend': U('x-rend', {rend:1}, {attack:2}), 'x-enf': U('x-enf', {enfeeble:1}, {attack:2}),
  'x-weak': U('x-weak', {triggers:[{on:'onSpawn', do:'weaken', who:'enemy', sub:'adjacent', amount:2}]}),
  'x-rendA': U('x-rendA', {triggers:[{on:'onSpawn', do:'rend', who:'enemy', sub:'adjacent', amount:2}]}),
  'x-enfA': U('x-enfA', {triggers:[{on:'onSpawn', do:'enfeeble', who:'enemy', sub:'adjacent', amount:2}]}),
  'x-grant': U('x-grant', {triggers:[{on:'onSpawn', do:'grant', who:'ally', sub:'all', skill:'armor', armor:2}]}),
  'x-arm': U('x-arm', {armourer:2}), 'x-weakSkill': U('x-weakSkill', {weaken:1}, {attack:3}) });
const X = ['x-para','x-rend','x-enf','x-weak','x-rendA','x-enfA','x-grant','x-arm','x-weakSkill'];
for(const seed of [1,2,3]) for(const a of X){
  try{ take(H.runBoard({seed, defs:d2, rounds:4, A:[{id:a},{id:'x-dummy'}], B:[{id:'x-dummy'},{id:'x-dummy'}]}).events, a);
       take(H.runBoard({seed, defs:d2, rounds:4, A:[{id:'x-dummy'}], B:[{id:'x-arm'},{id:a},{id:'x-dummy'}]}).events, a); }catch(e){ console.log('scenario', a, e.message); } }
let n = 0;
for(const id of ids){ const i = ids.indexOf(id);
  for(const opp of ['x-dummy', ids[(i*7+3) % ids.length]]) for(const mode of [undefined, 'open']){
    try{ take(H.runBoard({seed: 5 + n++, defs:d2, rounds:8, battleMode:mode, A:[{id}, {id: ids[(i*13+5) % ids.length]}], B:[{id:opp},{id:'x-dummy'}]}).events, id); }catch(e){} } }
fs.writeFileSync(process.argv[2], JSON.stringify({samples, counts}, null, 1));
console.log(Object.keys(samples).length, 'keys from', ids.length, 'cards');
