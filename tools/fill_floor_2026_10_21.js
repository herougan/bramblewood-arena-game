#!/usr/bin/env node
// Fill pass (2026-10-21, owner 18:35: "Regarding N balancing - is it complete? I noticed for example, Ford Kingfisher is not N balanced yet").
// BF6 left its bucket cards at the floor of their A:H shape, even where a bigger line still fits both rules (Ford Kingfisher 1/1, but 1/2 fits).
// This raises each such card one step at a time, Health or Attack, whichever keeps it closest to its shape, while BOTH caps hold at
// Level 1 and at its start level (2A+H+S ≤ N, A·H+S·|S| ≤ (N/3)²) and its use stays ≤ 100% of N. Pure formula, no simulations.
// Attack 0 stays 0. Only the cards BF6 flagged or squeezed (docs/balance/bf6-plan-2026-10-21.json verdict flag / bucket / under).
//   node tools/fill_floor_2026_10_21.js          dry run (prints the moves)
//   node tools/fill_floor_2026_10_21.js apply    writes canonical/cards.json (attack, health, a creatorNote line)
'use strict';
if(!process.argv.includes('--world=half')) process.argv.push('--world=half');
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), SC = require('./card_retune_2026_10_19.js').SC;
const CARDS = path.join(ROOT, 'canonical', 'cards.json'), COSTS = path.join(ROOT, 'canonical', 'skill-costs.json');
const plan = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'bf6-plan-2026-10-21.json'), 'utf8'));
const rows = Array.isArray(plan) ? plan : (plan.rows || []);
const want = new Set(rows.filter(r=> ['flag', 'bucket', 'under'].includes(r.verdict) || r.bucket || r.squeezed).map(r=> r.id));
const shapeOf = new Map(rows.map(r=> [r.id, r.shape]));
const T = SC.make(JSON.parse(fs.readFileSync(COSTS, 'utf8')));
const raw = fs.readFileSync(CARDS, 'utf8'), cards = JSON.parse(raw);
function chk(c, A, H){ const d = Object.assign({}, c, {attack: A, health: H}), lv = SC.levelOf(c), b1 = T.budget(d, {level: 1}), bs = lv === 1 ? b1 : T.budget(d, {level: lv});
  return {ok: b1.ok && bs.ok && b1.x1 / b1.N <= 1, use: b1.x1 / b1.N}; }
const moves = [];
for(const c of cards){
  if(!want.has(c.id) || c.health == null || c.easterEgg || (c.source && c.source.kind === 'easteregg')) continue; // Easter eggs are priced with their grant, which this check doesn't see
  let A = c.attack || 0, H = c.health; const A0 = A, H0 = H; const sh = shapeOf.get(c.id) || [A || 1, H || 1];
  const ratio = sh[1] ? (sh[0] || 0) / sh[1] : 0;
  for(let guard = 0; guard < 60; guard++){
    const opts = [];
    if(chk(c, A, H + 1).ok) opts.push([A, H + 1]);
    if(A > 0 && chk(c, A + 1, H).ok) opts.push([A + 1, H]);
    if(!opts.length) break;
    opts.sort((p, q)=> Math.abs(p[0] / p[1] - ratio) - Math.abs(q[0] / q[1] - ratio));
    [A, H] = opts[0];
  }
  if(A !== A0 || H !== H0) moves.push({c, from: `${A0}/${H0}`, to: `${A}/${H}`, A, H, use: chk(c, A, H).use});
}
for(const m of moves) console.log(`${m.c.id.padEnd(28)} ${m.from.padStart(5)} -> ${m.to.padEnd(6)} use ${(m.use * 100).toFixed(0)}%`);
console.log(`${moves.length} of ${want.size} floored cards can grow`);
if(process.argv[2] === 'apply'){
  for(const m of moves){ m.c.attack = m.c.attack == null && m.A === 0 ? m.c.attack : m.A; m.c.health = m.H;
    m.c.creatorNote = (m.c.creatorNote ? m.c.creatorNote + ' ' : '') + `2026-10-21 fill pass (owner 18:35): ${m.from} -> ${m.to}, the largest line both caps allow.`; }
  fs.writeFileSync(CARDS, JSON.stringify(cards, null, 2).replace(/[\u007f-￿]/g, ch=> '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) + '\n');
  console.log('applied');
}
