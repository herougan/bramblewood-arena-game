#!/usr/bin/env node
// 2026-11-03 (package BAL15): what BAL15's price changes (Royal Guard's Grant Shield to every ally, the 15 items re-measured at 1,000 fights) do to
// every in-play card's budget use: the verdict (tools/skill2_refit_2026_10_31.js, the refit's view) under the table before (a file, by default the
// pipeline's skill-costs.before-price.json) and under canonical/skill-costs.json now; lists every card whose verdict or cap-1 use moved, plus
// Royal Guard (a faction-pack card, on no road deck).
// The run on file compared against DEC1's table (commit 93a1b9d9's canonical/skill-costs.json wrapped as {table, constants}; the pipeline's own
// before-price snapshot holds the last price step's input, which was BAL15's first price run).
//   node tools/bal15/budget_use_2026_11_03.js [--before <{table, constants} snapshot>]   -> docs/balance/bal15/budget-use-2026-11-03.json
'use strict';
process.env.SKILL2_MISSMULT = process.env.SKILL2_MISSMULT || '1';
process.env.SKILL2_NO_NAMED = '1';
{ const i = process.argv.indexOf('--before'); process.env.SKILL2_OLD_TABLE = i >= 0 ? process.argv[i + 1] : require('path').join(__dirname, '..', '..', 'docs', 'balance', 'pipeline', 'state', 'skill-costs.before-price.json'); } // a {table, constants} snapshot
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const quiet = f => { const log = console.log; console.log = () => {}; try { return f(); } finally { console.log = log; } };
const R = quiet(() => require('../skill2_refit_2026_10_31.js')), LB = require('../lib_bramble.js'), LP = require('../lib_map_pools.js');
const OLD = R.OLD;
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8')), D = LB.CARD_DEFS_BASELINE, rows = [];
const v = (T, c) => R.verdict(T, c), lab = w => w.over ? 'over' : w.under ? 'under' : 'in band';
for (const c of cards) { const d = D[c.id]; if (!d || c.pool || c.token || c.test || c.health == null) continue;
  const inPlay = !LP.isOutOfPlay(LB.G, d); if (!inPlay && c.id !== 'otter-royal-guard') continue;
  const a = v(OLD, c), b = v(R.NEW, c); if (a.use === b.use && a.S === b.S && c.id !== 'otter-royal-guard') continue;
  rows.push({ id: c.id, name: c.name, inPlay, stats: `${c.attack}/${c.health}`, S: [a.S, b.S], use: [a.use, b.use], cap2: [a.cap2, b.cap2], verdict: [lab(a), lab(b)] }); }
const out = { tool: 'tools/bal15/budget_use_2026_11_03.js', built: '2026-11-03', rows, newOver: rows.filter(r => r.verdict[1] === 'over' && r.verdict[0] !== 'over').map(r => r.id), newUnder: rows.filter(r => r.verdict[1] === 'under' && r.verdict[0] !== 'under').map(r => r.id) };
const fo = path.join(ROOT, 'docs', 'balance', 'bal15', 'budget-use-2026-11-03.json'); fs.writeFileSync(fo, JSON.stringify(out, null, 1) + '\n');
rows.forEach(r => console.log(`${r.name.padEnd(26)} ${r.inPlay ? '' : '(out of play) '}${r.stats}  S ${r.S[0]} -> ${r.S[1]}  use ${r.use[0]} -> ${r.use[1]}  ${r.verdict[0]} -> ${r.verdict[1]}`));
console.log(`new over: ${out.newOver.join(', ') || 'none'}; new under: ${out.newUnder.join(', ') || 'none'} -> ${path.relative(ROOT, fo)}`);
