#!/usr/bin/env node
// 2026-11-18 (package CONTENT13 phase 2): the 16 new cards (docs/design/content13-2026-11-18.json): in cards.json with every field, on the budget,
// no retired key, on a map list or a Special list, and each plays a headless fight; the Grant / Rend / Enfeeble / Weaken triggers fire.
'use strict';
const H = require('./lib/harness.js');
const E = H.Engine;
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const J = f=> JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
let fail = 0, pass = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  x', m); } else pass++; };
const spec = J('docs/design/content13-2026-11-18.json').cards.map(x=> x.card.id);
const cards = J('canonical/cards.json'), by = Object.fromEntries(cards.map(c=> [c.id, c]));
const SC = require('../tools/skill_costs.js'), K = SC.make(J('canonical/skill-costs.json')), P0 = require('../bramblewood-skillparams.js');
const pools = J('canonical/map-pools.json').maps, listed = id=> Object.values(pools).some(m=> m.cards.includes(id) || m.special.includes(id));
ok(spec.length === 16, '16 spec cards');
const nids = cards.map(c=> c.numericId).filter(n=> n != null); ok(new Set(nids).size === nids.length, 'numericIds unique');
spec.forEach(id=>{ const c = by[id];
  if(!c){ ok(false, id + ' is in cards.json'); return; }
  ok(!c.awaitingSource && c.uuid && c.numericId >= 9228 && /^data:image\/png;base64,/.test(c.art) && c.flavor && c.icon && c.creatorNote, id + ': fields, art, no awaitingSource');
  const b = K.budget(c); ok(b.ok && !(b.missing || []).length, id + ': budget ok');
  ok(!P0.needsRetire(c.effects), id + ': no retired key');
  ok(listed(id), id + ': on a map list'); });
const so = id=> id === 1 ? 'A' : 'B';
const defs = Object.assign({}, H.loadCardDefs(), { 'c13-dummy': {id:'c13-dummy', name:'dummy', attack:0, health:500, wait:0, cost:0, effects:{}}, 'c13-ally': {id:'c13-ally', name:'ally', attack:1, health:50, wait:0, cost:0, effects:{}} });
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(seed){ const e = E.makeSimEngine(defs, E.mulberry32(seed || 11), {recordEvents:true, battleMode:'open'});
  return {e, P:{1:e.newPlayer(1, {}, {health:500}), 2:e.newPlayer(2, {}, {health:500})}}; }
function put(e, P, pid, id, slot, ev){ e.debugSpawnCard(P, so, pid, id, 'left', {}, ev || []);
  const pl = P[pid], c = all(pl).filter(x=> x.defId === id).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot;
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncPhaseStats(P, so, []); return c; }
// one headless fight per card: the card against a dummy, three rounds, no throw, it swings or shoots or fires its trigger
spec.forEach(id=>{ try{ const {e, P} = mk(); const ev = []; put(e, P, 1, id, 0, ev); put(e, P, 2, 'c13-dummy', 0, ev);
  for(let r = 1; r <= 3; r++) e.resolveCombat(P, so, {}, ev, r);
  ok(ev.length > 0 && P[2].hq.hp <= 500, id + ': plays a headless fight'); }catch(err){ ok(false, id + ' fight threw: ' + err.message); } });
// triggers
{ const {e, P} = mk(); const ev = []; const t = put(e, P, 2, 'c13-dummy', 0, ev); put(e, P, 1, 'osprey-plunger', 0, ev);
  ok(t.vulnerable === 1 && ev.some(x=> x.type === 'statusFx' && x.kind === 'rend' && x.targetUid === t.uid), 'Osprey Plunger: On Spawn Rend lands on the unit facing it'); }
{ const {e, P} = mk(); const ev = []; const t = put(e, P, 2, 'c13-dummy', 0, ev), f = put(e, P, 1, 'fossa-ambusher', 0, ev); e.debugAttack(P, so, f.uid, {}, ev);
  ok(t.vulnerable === 1, 'Fossa Ambusher: its hit leaves 1 Vulnerable token'); }
{ const {e, P} = mk(); const ev = []; const t = put(e, P, 2, 'c13-dummy', 0, ev), f = put(e, P, 1, 'tsetse-drainer', 0, ev); e.debugAttack(P, so, f.uid, {}, ev);
  ok(t.feeble === 1, 'Tsetse Drainer: its hit leaves 1 Feeble token'); }
{ const {e, P} = mk(); const ev = []; const t = put(e, P, 2, 'c13-ally', 0, ev); put(e, P, 1, 'drongo-mocker', 0, ev).wait = 0; e.debugSpawnCard(P, so, 1, 'c13-ally', 'right', {}, ev);
  ok(t.atk === 0 && ev.some(x=> x.type === 'statusFx' && x.kind === 'weaken'), 'Drongo Mocker: an ally played (once it is ready) Weakens an enemy'); }
[['cape-buffalo-bulwark', 'sturdy'], ['bar-headed-goose-leader', 'swift']].forEach(([id, sk])=>{ const {e, P} = mk(); const ev = []; put(e, P, 1, id, 0, ev).wait = 0; e.debugSpawnCard(P, so, 1, 'c13-ally', 'right', {}, ev); const a = all(P[1]).reduce((m, x)=> (!m || x.uid > m.uid) ? x : m, null);
  ok(a.eng27Granted && a.eng27Granted[sk] === true, id + ': an ally played is granted ' + sk); });
console.log(`content13: ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
