#!/usr/bin/env node
// 2026-11-17 (package REFIT3): the fight lines of decision REFIT2-2's options, for the whole-road what-ifs (never applied).
//   a) the five Health cuts: REFIT2's lane decks with Shield 0 and hqHp 2x the shown Health (5-6 12, 5-4 6, 5-2 7, 4-3 5, 4-5 4; the lines
//      REFIT2 read on 51100 / 52100: docs/balance/refit2/hp/health-fresh*.jsonl);
//   b) Fen Mink 1/8 (SET in tools/refit3/gh_2026_11_17.sh) with REFIT2's 5-6 / 5-4 lane decks (refit2-fixes.jsonl), plus a)'s 5-2, 4-3, 4-5.
// Writes docs/balance/refit3/whatif/opt-a.jsonl and opt-b.jsonl.
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.resolve(__dirname, '..', '..');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
const hp1 = rd('docs/balance/refit2/hp/health-fresh.jsonl'), hp2 = rd('docs/balance/refit2/hp/health-fresh2.jsonl'), r2 = rd('docs/balance/refit2/refit2-fixes.jsonl');
const pick = (rows, k) => { const x = rows.find(r => r.key === k); return { key: k, deck: x.deck, shieldOverride: x.shieldOverride, hqHp: x.hqHp, apply: false }; };
const a = [pick(hp1, '5-6'), pick(hp1, '5-4'), pick(hp1, '5-2'), pick(hp2, '4-3'), pick(hp1, '4-5')];
const b = [pick(r2, '5-6'), pick(r2, '5-4')].concat(a.slice(2));
const dir = path.join(ROOT, 'docs', 'balance', 'refit3', 'whatif'); fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'opt-a.jsonl'), a.map(x => JSON.stringify(x)).join('\n') + '\n');
fs.writeFileSync(path.join(dir, 'opt-b.jsonl'), b.map(x => JSON.stringify(x)).join('\n') + '\n');
a.concat(b).forEach(x => console.log(JSON.stringify(x)));
