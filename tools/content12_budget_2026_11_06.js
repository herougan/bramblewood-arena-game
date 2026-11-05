#!/usr/bin/env node
// CONTENT12 (2026-11-06): budget use of named cards (or of every in-play card with --all), by tools/skill_costs.js: cap 1 (x1 / N) and
// cap 2 (x2 / N2) at the card's budget level, and whether it is in band (inside both caps and above 60% of N). No card is written.
//   node tools/content12_budget_2026_11_06.js id [id ...]      node tools/content12_budget_2026_11_06.js --all [--out]
//   node tools/content12_budget_2026_11_06.js --try '<json card patch>' id    (a what-if line: {"attack":2,"health":9,"effects":{...}})
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), SC = require(path.join(ROOT, 'tools', 'skill_costs.js'));
const LMP = require(path.join(ROOT, 'tools', 'lib_map_pools.js'));
// CONTENT12_TABLE=<file>: price with another skill table (e.g. the one before FIX9's Shell price: git show e596ebc4~1:canonical/skill-costs.json)
const T = SC.make(JSON.parse(fs.readFileSync(process.env.CONTENT12_TABLE || path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')));
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8')), by = Object.fromEntries(cards.map(c=> [c.id, c]));
const args = process.argv.slice(2);
function line(c){ const b = T.budget(c, {}); if(!b || !(b.N > 0)) return null;
  const u1 = 100 * b.x1 / b.N, u2 = 100 * b.x2 / b.N2, band = b.ok && !b.wellUnder;
  return {id: c.id, name: c.name, rarity: c.rarity, cost: c.cost, wait: c.wait, A: c.attack, H: c.health, S: +(+b.S || 0).toFixed(2), N: b.N, use1: Math.round(u1), use2: Math.round(u2), band, verdict: !b.ok ? 'OVER' : b.wellUnder ? 'UNDER' : 'ok', effects: c.effects, levelSkills: c.levelSkills, missing: b.missing && b.missing.length ? b.missing : undefined}; }
const show = r=> console.log(`${r.id.padEnd(26)} ${String(r.rarity).padEnd(9)} L${r.cost} W${r.wait} ${r.A}/${r.H} S ${r.S} N ${r.N} use ${r.use1}% cap2 ${r.use2}% ${r.verdict}${r.missing ? ' MISSING ' + JSON.stringify(r.missing) : ''}  ${JSON.stringify(r.effects || {})}${r.levelSkills ? ' lv ' + JSON.stringify(r.levelSkills) : ''}`);
if(args[0] === '--all'){
  const out = cards.filter(c=> !c.token && !c.test && !c.pool && !c.field && LMP.budgetHold(c.id) !== 'unplaced').map(c=> Object.assign(line(c) || {}, {hold: LMP.budgetHold(c.id)})).filter(r=> r.id);
  const bad = out.filter(r=> !r.band); bad.forEach(r=> { process.stdout.write(r.hold ? '[' + r.hold + '] ' : ''); show(r); }); console.log(out.length + ' in-play cards measured, ' + bad.length + ' out of band');
  if(args.includes('--out')) fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'content12-budget-2026-11-06.json'), JSON.stringify({_about: 'CONTENT12 (2026-11-06): cap-1 / cap-2 use of every in-play card (tools/content12_budget_2026_11_06.js --all --out)', rows: out}, null, 1) + '\n');
} else if(args[0] === '--try'){
  const patch = JSON.parse(args[1]); args.slice(2).forEach(id=>{ const c = Object.assign({}, by[id], patch); show(line(c)); });
} else args.forEach(id=>{ if(!by[id]) return console.log(id, 'NOT FOUND'); const r = line(by[id]); r ? show(r) : console.log(id, 'no budget'); });
