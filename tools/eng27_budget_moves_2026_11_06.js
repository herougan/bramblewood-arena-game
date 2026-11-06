#!/usr/bin/env node
// 2026-11-06 (package ENG27): the budget moves of this package's prices, no re-fits (owner: "List the budget moves; don't re-fit cards").
// Compares every live card's cap-1 use (x1 / N, tools/skill_costs.js) under a base checkout's canonical/skill-costs.json,
// canonical/cards.json and bramblewood-budget.js against this checkout's: Tide 1 0.5 (ENG25-8 c), Inspiring 3.8 (+1 a token), Delivery {Pearl}
// (ENG25-6), Bloom x1.5 (ENG26-3 a). Prints the cards that move 2 points or more and writes docs/balance/eng27-budget-moves-2026-11-06.json.
//   node tools/eng27_budget_moves_2026_11_06.js <base checkout dir>
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), BASE = process.argv[2];
if(!BASE || !fs.existsSync(path.join(BASE, 'bramblewood-budget.js'))){ console.error('usage: node tools/eng27_budget_moves_2026_11_06.js <base checkout dir>'); process.exit(2); }
const fresh = f=>{ delete require.cache[require.resolve(f)]; return require(f); };
function uses(dir){
  // tools/skill_costs.js reads ../bramblewood-budget.js; load each checkout's own pair
  const SC = fresh(path.join(dir, 'tools', 'skill_costs.js'));
  const T = SC.make(JSON.parse(fs.readFileSync(path.join(dir, 'canonical', 'skill-costs.json'), 'utf8')));
  const out = {}; JSON.parse(fs.readFileSync(path.join(dir, 'canonical', 'cards.json'), 'utf8')).forEach(c=>{ if(c.pool || c.test || c.token) return;
    const b = T.budget(c, {}); if(b && b.N > 0) out[c.id] = Math.round(1000 * b.x1 / b.N) / 10; });
  Object.keys(require.cache).filter(k=> k.startsWith(dir)).forEach(k=> delete require.cache[k]);
  return out;
}
const was = uses(path.resolve(BASE)), now = uses(ROOT);
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8')), by = {}; cards.forEach(c=> by[c.id] = c);
const why = e=> [e.tide && 'Tide', e.inspiring && 'Inspiring', e.deliveryRes === 'pearl' && 'Delivery {Pearl}', e.bloomCopy && 'Bloom'].filter(Boolean).join(', ') || 'other';
const moves = Object.keys(now).filter(id=> id in was && Math.abs(now[id] - was[id]) >= 2).map(id=> ({id, was: was[id], now: now[id], why: why(by[id].effects || {})}))
  .sort((a, b)=> (a.now - a.was) - (b.now - b.was));
const byWhy = {}; moves.forEach(m=> (byWhy[m.why] = byWhy[m.why] || []).push(m));
Object.keys(byWhy).forEach(k=> console.log(`${k}: ${byWhy[k].length} cards, ${byWhy[k].slice(0, 6).map(m=> `${m.id} ${m.was} -> ${m.now}`).join('; ')}`));
console.log(`over 100% now (was not): ${moves.filter(m=> m.now > 100 && m.was <= 100).map(m=> m.id).join(', ') || 'none'}`);
fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'eng27-budget-moves-2026-11-06.json'), JSON.stringify({when: '2026-11-06', rule: 'cap-1 use x1 / N, moves of 2 points or more', moves}, null, 1) + '\n');
