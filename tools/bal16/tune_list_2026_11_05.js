#!/usr/bin/env node
// 2026-11-05 (package BAL16): which fights the curve retune takes, worst first: the fights of a road measure more than --min (10) points off
// their target, without the ones the weak pass (tools/skirmish_pass.js weak) showed cannot reach their band from their own list (the weakest
// legal deck still more than 20 points too hard, or no legal deck at all), without --skip. Prints a comma list of fight codes for --only=.
//   node tools/bal16/tune_list_2026_11_05.js --from bal16-mid [--weak bal16-weak] [--min 10] [--skip 2-4]
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..'), R = require('./road_totals_2026_11_05.js');
const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const rows = R.rowsOf(arg('--from', 'bal16-mid')), MIN = +arg('--min', 10), skip = new Set(arg('--skip', '').split(',').filter(Boolean));
const wf = path.join(ROOT, 'docs', 'balance', arg('--weak', 'bal16-weak') + '.jsonl'), blocked = new Set();
if (fs.existsSync(wf)) fs.readFileSync(wf, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l)).forEach(w => { const best = w.after ? w.after.win : null;
  if ((w.candidates === 0 || (w.weakest != null && w.weakest < w.target - 20)) && !(best != null && best >= w.target - 20)) blocked.add(w.code); });
const todo = rows.filter(r => Math.abs(r.win - r.target) > MIN && !skip.has(r.code) && !blocked.has(r.code)).sort((x, y) => Math.abs(y.win - y.target) - Math.abs(x.win - x.target));
console.error(`${todo.length} fights to tune (${blocked.size} blocked by their list: ${[...blocked].join(' ')})`);
console.log(todo.map(r => r.code).join(','));
