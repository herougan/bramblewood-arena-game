#!/usr/bin/env node
// Mechanic scenarios (2026-10-03).
//
//   node tests/scenarios.js
//
// Two kinds of checks:
//  A. AUTO "every effect does something": for every fieldable card that has effects, fight it
//     against a plain dummy twice — once as-is, once with its effects stripped. If the two fights
//     are identical (same events, HPs and resources) the effect never fired: it's dead data, a
//     typo'd key, or an engine path that's missing. New cards and new skills are covered with no
//     extra work.
//  B. HAND-WRITTEN rule scenarios in tests/scenarios/*.json — exact setups with expectations:
//       {"name", "seed", "rounds", "battleMode", "hqHp":{"A","B"},
//        "A":[{"id","side","hp","attack","wait"}], "B":[...],
//        "expect":[ {"event":"evaded", "min":1, "max":9},          // count of an event type
//                   {"event":"hit", "where":{"defId":"x"}, "min":1}, // with field filters
//                   {"winner":1}, {"castle":"B", "max":29},           // final castle HP bounds
//                   {"alive":"A", "min":1} ]}                         // cards left on a board
'use strict';
const fs = require('fs');
const path = require('path');
const H = require('./lib/harness.js');

const defs = H.loadCardDefs();
const ids = H.fieldableIds(defs);
const failures = [];
let passed = 0;

// ---------- A. auto effect smoke ----------
const DUMMY = {id:'__dummy__', name:'Training Dummy', attack:3, health:60, wait:0, cost:0, effects:{}};
const defsWithDummy = Object.assign({}, defs, {[DUMMY.id]: DUMMY});
const resourcesOf = pl=> ['lumber','grace','devilry','stone','elementalEnergy'].map(k=> pl[k]||0).join('/');
// Effects whose whole job is outside a 1v1 board fight (deck/hand/castle-economy hooks), so a
// no-op here is expected rather than a bug. Kept short and explicit on purpose.
const OUT_OF_BOARD = new Set(['bounty']);
let effectCards = 0, deadEffects = [];
ids.forEach(id=>{
  const d = defs[id];
  const keys = Object.keys(d.effects||{});
  if(!keys.length) return;
  effectCards++;
  // Several small contexts, because many effects only show up with neighbours (Guardian, Sweep,
  // Rally) or when the card survives long enough (Flying on a 3-HP bee): 1v1 as attacker and as
  // blocker, a 3-wide line, and the same three with the card's health ×5.
  const contexts = [];
  [1,5].forEach(hpMul=>{
    const me = {id, hp: Math.max(1, (d.health||1)*hpMul)};
    contexts.push({A:[me], B:[{id:DUMMY.id}]});
    contexts.push({A:[{id:DUMMY.id}], B:[me]});
    contexts.push({A:[Object.assign({side:'left'}, me), {id:DUMMY.id, side:'left'}, {id:DUMMY.id, side:'right'}], B:[{id:DUMMY.id}, {id:DUMMY.id, side:'left'}, {id:DUMMY.id, side:'right'}]});
  });
  const run = (cardDefs, ctx, i)=>{
    const r = H.runBoard(Object.assign({defs: cardDefs, seed: H.hashStr('fx:'+id+':'+i), hqHp:{A:60, B:60}, rounds:12}, ctx));
    return JSON.stringify(H.fightSignature(r)) + '|' + resourcesOf(r.players[1]) + '|' + resourcesOf(r.players[2]) + '|' + H.boardCards(r.players[1]).map(c=>c.atk+'/'+c.hp).join(',') + '|' + H.boardCards(r.players[2]).map(c=>c.atk+'/'+c.hp).join(',');
  };
  const stripped = Object.assign({}, defsWithDummy, {[id]: Object.assign({}, d, {effects:{}})});
  if(contexts.some((ctx,i)=> run(defsWithDummy, ctx, i) !== run(stripped, ctx, i))){ passed++; return; }
  if(keys.every(k=> OUT_OF_BOARD.has(k))){ passed++; return; }
  deadEffects.push(`${id}: {${keys.join(', ')}} changed nothing in any test context`);
});

// ---------- B. hand-written scenarios ----------
const dir = path.join(__dirname, 'scenarios');
const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f=> f.endsWith('.json')).sort() : [];
let scenarioCount = 0;
const coveredByScenario = new Set(); // cards proven by a passing hand-written scenario
files.forEach(f=>{
  const list = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  (Array.isArray(list) ? list : [list]).forEach(sc=>{
    scenarioCount++;
    const label = `${f} › ${sc.name}`;
    let r;
    try{ r = H.runBoard(Object.assign({rounds:20, seed: H.hashStr(sc.name)}, sc)); }
    catch(e){ failures.push(`${label}: exception ${e.message}`); return; }
    if(r.invariantErrors.length){ failures.push(`${label}: invariant ${r.invariantErrors[0]}`); return; }
    const bad = [];
    (sc.expect||[]).forEach(x=>{
      const within = (v)=> (x.min==null || v>=x.min) && (x.max==null || v<=x.max) && (x.eq==null || v===x.eq);
      const range = `${x.eq!=null?'= '+x.eq:''}${x.min!=null?' ≥'+x.min:''}${x.max!=null?' ≤'+x.max:''}`;
      if(x.event){
        const n = r.events.filter(e=> e.type===x.event && Object.entries(x.where||{}).every(([k,v])=> e[k]===v)).length;
        if(!within(n)) bad.push(`event ${x.event}${x.where?JSON.stringify(x.where):''} count ${n}, want${range}`);
      }else if(x.winner!=null){
        if(r.winner!==x.winner) bad.push(`winner ${r.winner}, want ${x.winner}`);
      }else if(x.castle){
        const hp = r.players[x.castle==='A'?1:2].hq.hp;
        if(!within(hp)) bad.push(`castle ${x.castle} HP ${hp}, want${range}`);
      }else if(x.alive){
        const n = H.boardCards(r.players[x.alive==='A'?1:2]).length;
        if(!within(n)) bad.push(`${x.alive} cards alive ${n}, want${range}`);
      }
    });
    if(bad.length) failures.push(`${label}: ${bad.join('; ')}`); else { passed++; [...(sc.A||[]), ...(sc.B||[])].forEach(c=> coveredByScenario.add(c.id)); }
  });
});

deadEffects = deadEffects.filter(x=> !coveredByScenario.has(x.split(':')[0]));
console.log(`scenarios: ${effectCards} effect cards auto-checked, ${scenarioCount} hand-written scenarios`);
console.log(`  passed ${passed}, failed ${failures.length}, effects needing a hand-written scenario ${deadEffects.length}`);
deadEffects.forEach(d=> console.log('  REVIEW (no visible effect) '+d));
failures.forEach(f=> console.log('  FAIL '+f));
// Effects with no visible change are listed for review, not failed: some only fire in situations a
// generic context can't build (a Leader on the board, an ally being played, a specific trigger).
// Give each one a hand-written scenario, then add its key to the strict list below.
const STRICT = new Set(['poison','thorns','bleed','armor','flying','evasive','sweep','swipe','guardian','rage','freeze','paralyze','sleep','stunOnHit','regen','explode','expose','crit']);
const strictDead = deadEffects.filter(x=> x.match(/\{([^}]*)\}/)[1].split(', ').every(k=> STRICT.has(k)));
strictDead.forEach(x=> console.log('  FAIL core effect never fired: '+x));
process.exit(failures.length || strictDead.length ? 1 : 0);
