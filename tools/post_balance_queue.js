#!/usr/bin/env node
// The post-balance queue (2026-10-19, package TC). The owner applied the high-confidence measured skill worth to
// canonical/skill-costs.json ("Skill costs: apply the high-confidence measured worth": each applied entry keeps prevValue and
// appliedAt) and decided (08:49) the workflow: separate units thematically, he picks units per map, then a POST-BALANCE step
// applies skills and stats. So the cards the new costs push over budget v3 are not refit now: they are listed here, and the
// tests accept them as known-over-budget until that step.
//   node tools/post_balance_queue.js           write docs/balance/post-balance-queue.json
//   node tools/post_balance_queue.js --check   exit 1 if the file is not what the current table gives (stale queue)
// A card is queued when budget v3 under the current table fails and it is not on the owner-call list (the five Dragons and the
// Caldera Wyrm, over on purpose by the creature-ranks rule). "Before" is the same card under the table with every applied
// entry put back to its prevValue.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const SC = require(path.join(__dirname, 'skill_costs.js'));
const OUT = path.join(ROOT, 'docs', 'balance', 'post-balance-queue.json');
const OVER_OK = ['red-dragon', 'white-dragon', 'blue-dragon', 'green-dragon', 'black-dragon', 'caldera-wyrm'];
const KINDS = ['skills', 'triggers', 'actions', 'modifiers'];
const r2 = v=> Math.round(v * 100) / 100;

function build(){
  const table = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8'));
  const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8'));
  const prev = JSON.parse(JSON.stringify(table)); KINDS.forEach(k=> (prev[k] || []).forEach(e=>{ if(e.appliedAt) e.value = e.prevValue; }));
  const T = SC.make(table), P = SC.make(prev), skip = new Set(OVER_OK);
  const queue = cards.filter(c=> SC.measured(c) && !skip.has(c.id)).map(c=> ({c, b: T.budget(c), p: P.budget(c)})).filter(x=> !x.b.ok).map(({c, b, p})=>{
    const over1 = r2(b.x1 - b.N), over2 = r2(b.x2 - b.N2), rules = [over1 > 0 && '2A+H+S', over2 > 0 && 'A*H+S'].filter(Boolean);
    return {id: c.id, name: c.name, rarity: c.rarity, attack: c.attack || 0, health: c.health || 0, wait: c.wait || 0, cost: c.cost || 0,
      pool: !!c.pool, source: c.source ? [c.source.kind, c.source.id, c.source.node].filter(Boolean).join(':') : null,
      sBefore: p.S, sAfter: b.S, sLegacy: SC.legacyS(c.effects), passedBefore: p.ok,
      N: b.N, x1: b.x1, N2: b.N2, x2: b.x2, missMult: b.m, overBy: {x1: over1, x2: over2}, fails: rules,
      costParts: b.parts.filter(q=> q[2]).sort((a, z)=> z[2] - a[2]).slice(0, 4).map(q=> `${q[1]} ${r2(q[2])}` + (q[3] ? ` [${q[3]}]` : ''))};
  }).sort((a, z)=> Math.max(z.overBy.x1, z.overBy.x2 / z.N2 * z.N) - Math.max(a.overBy.x1, a.overBy.x2 / a.N2 * a.N));
  const applied = KINDS.reduce((n, k)=> n + (table[k] || []).filter(e=> e.appliedAt).length, 0);
  return {
    _about: 'Cards over the stat budget (v5 since 2026-10-19 13:52, package BF2: N = (Base + L/5) x (1 + L/30), Level 0 Base - 1, at the level the card starts at) under the applied measured skill costs (canonical/skill-costs.json, 2026-10-19). Not refit now: the owner\'s workflow (08:49) is thematic units -> he picks units per map -> a post-balance step applies skills and stats. Built by tools/post_balance_queue.js; tests accept these ids as known-over-budget. Rules (inclusive since 2026-10-19 16:22): a card passes when x1 = (2A+H+S) x missMult <= N and x2 = (A*H+S) x missMult <= (N/3)^2 = N2; overBy is x - limit (> 0 fails). sBefore = S with every applied entry at its prevValue.',
    version: '2026-10-19', table: {version: table.version, appliedEntries: applied}, ownerCall: OVER_OK, count: queue.length, cards: queue};
}

if(require.main === module){
  const data = build(), text = JSON.stringify(Object.assign({}, data, {cards: 0}), null, 1).replace('"cards": 0', '"cards": [\n' + data.cards.map(c=> '  ' + JSON.stringify(c)).join(',\n') + '\n ]') + '\n'; // one card a line
  if(process.argv.includes('--check')){
    const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
    if(cur !== text){ console.log('post-balance-queue.json is stale: run node tools/post_balance_queue.js'); process.exit(1); }
    console.log(`post-balance-queue.json is current (${data.count} cards)`);
  } else { fs.writeFileSync(OUT, text); console.log(`wrote ${path.relative(ROOT, OUT)}: ${data.count} cards`); data.cards.forEach(c=> console.log(`  ${c.name}: S ${c.sBefore} -> ${c.sAfter}, x1 ${c.x1} / N ${c.N} (${c.overBy.x1 >= 0 ? '+' : ''}${c.overBy.x1}), x2 ${c.x2} / ${c.N2} (${c.overBy.x2 >= 0 ? '+' : ''}${c.overBy.x2})`)); }
}
module.exports = {build, OVER_OK, OUT};
