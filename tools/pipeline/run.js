#!/usr/bin/env node
'use strict';
// SPEED1 (2026-10-31): the balance pipeline's step runner. Use tools/pipeline/run.sh (it takes the lock first); this file runs a step.
//   node tools/pipeline/run.js <measure|price|refit|bake|tournament|test|all> [options]
// Every step writes docs/balance/pipeline/<step>-<YYYY-MM-DD-HHMM>.json (schema bramblewood-pipeline/1) and prints at most 20 lines.
// Exit code: 0 ok / partial, 1 failed, 2 usage.
const P = require('./lib.js');
const STEPS = ['measure', 'price', 'refit', 'bake', 'tournament', 'test'];
const VALUED = ['skills', 'map', 'only', 'minutes', 'fights', 'cache-dir', 'set-const', 'games', 'maps', 'tag', 'from', 'only-ids', 'kind'];

async function runStep(step, args, argv) {
  const t0 = Date.now(), S = P.newSummary(step, argv);
  try { await require('./' + step + '.js').step(args, S); }
  catch (e) { S.status = 'fail'; S.notes.push('error: ' + String(e && e.message || e).slice(0, 300)); if (!args.quiet) console.error(e && e.stack || e); }
  P.finish(S, t0); return S;
}
async function main(argv) {
  const step = argv[0], rest = argv.slice(1), args = P.parseArgs(rest, VALUED);
  if (!step || step === 'help' || (!STEPS.includes(step) && step !== 'all')) {
    console.log('usage: tools/pipeline/run.sh <measure|price|refit|bake|tournament|test|all> [options]   (docs/workflows/balance.md, "Pipeline")'); process.exit(step ? 2 : 0); }
  if (step !== 'all') { const S = await runStep(step, args, rest); P.printSummary(S); process.exit(S.status === 'fail' ? 1 : 0); }
  // all: measure -> price -> refit -> bake -> test, stopping on a failure; --tournament adds the reference decks before the tests
  const t0 = Date.now(), S = P.newSummary('all', rest); S.stages = [];
  const order = ['measure', 'price', 'refit', 'bake'].concat(args.tournament ? ['tournament'] : []).concat(['test']);
  for (const st of order) {
    const r = await runStep(st, args, rest); S.stages.push({ step: st, status: r.status, durationSec: r.durationSec, file: r.file, counts: r.counts, flagged: r.flagged.length });
    r.flagged.forEach(f => S.flagged.push(Object.assign({ step: st }, f, { id: st + ': ' + f.id })));
    r.changed.forEach(c => { if (st === 'price' || st === 'refit') S.changed.push(Object.assign({ step: st }, c)); });
    if (r.tests) S.tests = r.tests;
    console.log(`[all] ${st}: ${r.status} in ${P.fmtDur(r.durationSec)} -> ${r.file}`);
    if (r.status === 'fail' || (r.status === 'partial' && st !== 'measure')) { S.status = 'fail'; S.notes.push(`stopped at ${st} (${r.status}): ${(r.notes[0] || '').slice(0, 160)}`); break; }
    if (r.status === 'partial') { S.status = 'partial'; S.notes.push('measure is partial (--minutes): stopped before price; run again'); break; }
  }
  S.counts = { steps: S.stages.length + '/' + order.length };
  P.finish(S, t0); P.printSummary(S); process.exit(S.status === 'fail' ? 1 : 0);
}
if (require.main === module) main(process.argv.slice(2)).catch(e => { console.error(e && e.stack || e); process.exit(1); });
module.exports = { main, runStep };
