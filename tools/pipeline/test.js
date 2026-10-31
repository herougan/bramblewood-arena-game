'use strict';
// SPEED1 (2026-10-31): the `test` step: node tests/run.js --smoke, then the balance --only set (config.json test.balanceOnly).
//   run.sh test [--only 'regex'] [--no-smoke] [--full]
// Counts passed / failed / cached from the runner's own summary line; a failing test that is in config.json test.knownFailures is reported
// as known, any other as NEW (flagged). "cached" means the runner skipped it because it passed before on identical inputs: it is reported as
// cached, never as passed. Exit: the step fails only on a new failure.
const fs = require('fs'), path = require('path');
const P = require('./lib.js');
function parse(out, label) {
  const m = /(?:smoke|tests): (\d+) passed, (\d+) failed, (\d+) skipped/.exec(out) || [];
  const failed = []; out.split('\n').forEach(l => { const q = /^✗ (\S+(?: \S+)*?) \(exit/.exec(l); if (q) failed.push(q[1]); });
  const sec = /· (\d+)s/.exec(out);
  return { label, passed: +m[1] || 0, failed: +m[2] || 0, cached: +m[3] || 0, failedTests: failed, seconds: sec ? +sec[1] : null, parsed: !!m[0] };
}
async function step(args, S) {
  const cfg = P.CONFIG.test, runs = [];
  const flags = args.full ? ['--full'] : [];
  if (!args['no-smoke']) runs.push(Object.assign(parse(P.run('node', ['tests/run.js', '--smoke'].concat(flags), { log: path.join(P.STATE, 'test-smoke.log') }).out, 'smoke')));
  const only = args.only || cfg.balanceOnly;
  runs.push(parse(P.run('node', ['tests/run.js', '--only', only].concat(flags), { log: path.join(P.STATE, 'test-balance.log') }).out, 'only ' + only));
  const total = { passed: 0, failed: 0, cached: 0 }, failedTests = [];
  runs.forEach(r => { total.passed += r.passed; total.failed += r.failed; total.cached += r.cached; r.failedTests.forEach(t => { if (!failedTests.includes(t)) failedTests.push(t); }); if (!r.parsed) S.flagged.push({ id: r.label, why: 'the runner printed no summary line (see ' + 'docs/balance/pipeline/state/test-*.log)' }); });
  const known = failedTests.filter(t => cfg.knownFailures.some(k => t.indexOf(k) === 0)), neu = failedTests.filter(t => !known.includes(t));
  S.tests = Object.assign(total, { runs: runs.map(r => ({ label: r.label, passed: r.passed, failed: r.failed, cached: r.cached, seconds: r.seconds })), knownFailures: known, newFailures: neu, only });
  neu.forEach(t => S.flagged.push({ id: t, why: 'NEW test failure (not in the known list); see docs/balance/pipeline/state/test-*.log' }));
  S.counts = { 'tests run': total.passed + total.failed, passed: total.passed, failed: total.failed, cached: total.cached };
  S.inputs = { smoke: !args['no-smoke'], only, full: !!args.full, knownList: cfg.knownFailures.length };
  if (neu.length || runs.some(r => !r.parsed)) S.status = 'fail';
  S.files.push('docs/balance/pipeline/state/test-balance.log');
}
module.exports = { step, parse };
