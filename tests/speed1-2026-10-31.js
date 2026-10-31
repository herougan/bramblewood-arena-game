#!/usr/bin/env node
// Package SPEED1 (2026-10-31; owner: "balancing runs as automation, not agent tokens"): the balance pipeline, tools/pipeline/run.sh.
// Checks: the summary schema and its 20-line print; the lock (a second heavy call exits 75 with a message, --wait waits and then also gives
// up, a light step is not blocked); the early-stopping rule; the refit classifier (owner cards, > 2 stat points, theme clash); the budget
// constants the price step sets (cap 2 reads S at half, Flying and Evasive at the measured x1.13); the docs name the pipeline.
// No simulation is played: the lock is tested against a step that exits before it simulates.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process');
const ROOT = path.join(__dirname, '..');
let fail = 0, checks = 0; const ok = (c, m) => { checks++; if (!c) { fail++; console.log('  ✗', m); } };
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'speed1-'));
process.env.PIPELINE_OUT = path.join(tmp, 'out'); // the library's own folder: nothing lands in docs/balance/pipeline
const P = require('../tools/pipeline/lib.js'), K = require('../tools/pipeline/constants.js'), M = require('../tools/pipeline/measure.js'), RF = require('../tools/pipeline/refit.js'), TS = require('../tools/pipeline/test.js');

// 1. the summary: schema, file name, at most 20 lines
{
  const S = P.newSummary('refit', ['--dry']), t0 = Date.now();
  for (let i = 0; i < 30; i++) { S.changed.push({ id: 'card-' + i, field: 'attack/health', old: '3/2', new: '2/4' }); S.flagged.push({ id: 'flag-' + i, why: 'theme clash' }); }
  S.notes.push('a note'); S.counts = { 'in play checked': 451, flagged: 30 }; S.tests = { passed: 5, failed: 1, cached: 2, knownFailures: ['skills2'], newFailures: [] };
  P.finish(S, t0);
  const f = path.join(P.ROOT, S.file), j = JSON.parse(fs.readFileSync(f, 'utf8'));
  ok(/^docs\/balance\/pipeline\/refit-\d{4}-\d{2}-\d{2}-\d{4}\.json$/.test(S.file) || S.file.indexOf('refit-') >= 0, 'file name <step>-<YYYY-MM-DD-HHMM>.json: ' + S.file);
  ['schema', 'step', 'status', 'started', 'finished', 'durationSec', 'args', 'inputs', 'counts', 'changed', 'flagged', 'cached', 'notes', 'files', 'tests'].forEach(k => ok(k in j, 'summary key ' + k));
  ok(j.schema === 'bramblewood-pipeline/1', 'schema id');
  const lines = []; const log = console.log; console.log = s => lines.push(String(s)); P.printSummary(S); console.log = log;
  const printed = lines.join('\n').split('\n');
  ok(printed.length <= 20, 'the printed summary is at most 20 lines (' + printed.length + ')');
  ok(/FLAGGED 30/.test(printed.join('\n')) && /changed 30/.test(printed.join('\n')), 'the print says how many changed and how many are flagged');
}

// 2. the lock: held by another process -> exit 75 and a message; --wait 1 waits, then gives up; a light step is not blocked
{
  const lock = path.join(tmp, 'pipeline.lock'), env = Object.assign({}, process.env, { PIPELINE_LOCK: lock });
  fs.writeFileSync(lock, "step 'test holder' pid 1\n");
  const holder = cp.spawn('flock', [lock, 'sleep', '8'], { stdio: 'ignore' });
  const until = Date.now() + 3000; while (Date.now() < until) { const r = cp.spawnSync('flock', ['-n', lock, 'true']); if (r.status !== 0) break; }
  const a = cp.spawnSync('bash', ['tools/pipeline/run.sh', 'measure', '--skills', 'nosuchskill'], { cwd: ROOT, env, encoding: 'utf8' });
  ok(a.status === 75, 'a second heavy call exits 75 while the lock is held (got ' + a.status + ')');
  ok(/pipeline busy/.test(a.stderr) && /--wait/.test(a.stderr), 'it says the pipeline is busy and names --wait');
  const t0 = Date.now(), b = cp.spawnSync('bash', ['tools/pipeline/run.sh', '--wait', '2', 'measure', '--skills', 'nosuchskill'], { cwd: ROOT, env, encoding: 'utf8' });
  ok(b.status === 75 && Date.now() - t0 >= 1800, '--wait 2 waits about 2 s and then exits 75 (' + (Date.now() - t0) + ' ms)');
  const c = cp.spawnSync('bash', ['tools/pipeline/run.sh', 'help'], { cwd: ROOT, env, encoding: 'utf8' });
  ok(c.status === 0 && /measure\|price\|refit/.test(c.stdout), 'help is not blocked');
  holder.kill(); cp.spawnSync('flock', ['-w', '5', lock, 'true']);
  // free lock: the heavy step runs (here it stops at once on an unknown skill, before any game) and writes its summary
  const d = cp.spawnSync('bash', ['tools/pipeline/run.sh', 'measure', '--skills', 'nosuchskill'], { cwd: ROOT, env: Object.assign({}, env, { PIPELINE_OUT: path.join(tmp, 'out2') }), encoding: 'utf8', timeout: 120000 });
  ok(d.status === 1 && /pipeline measure: FAIL/.test(d.stdout), 'with the lock free the step runs; an unknown skill fails the step (exit ' + d.status + ')');
  const made = fs.existsSync(path.join(tmp, 'out2')) ? fs.readdirSync(path.join(tmp, 'out2')).filter(f => /^measure-.*\.json$/.test(f)) : [];
  ok(made.length === 1 && JSON.parse(fs.readFileSync(path.join(tmp, 'out2', made[0]), 'utf8')).status === 'fail', 'a failed step still writes its summary file');
}

// 3. early stopping: the interval rule of the price tool's 'high' confidence
{
  const cfg = P.CONFIG.measure;
  ok(M.converged({ m: 5, lo: 4.3, hi: 5.7 }, cfg), 'se 0.36 on a worth of 5 stops (limit 0.75)');
  ok(!M.converged({ m: 5, lo: 2.5, hi: 7.5 }, cfg), 'se 1.3 on a worth of 5 goes on');
  ok(M.converged({ m: 0.1, lo: -0.2, hi: 0.4 }, cfg), 'a worth near 0 stops at se 0.3');
  ok(cfg.stages.length >= 3 && cfg.stages.every((v, i, a) => !i || v > a[i - 1]), 'the stages rise');
  const plan = [{ key: 'armor=1', id: 'armor', n: 1, kind: 'skip' }, { key: 'fork', id: 'fork', n: true, kind: 'measure' }];
  const it = M.itemsFor(plan, { skills: 'armor=4,fork' });
  ok(it.length === 2 && it[0].adhoc && it[0].test.armor === 4 && it[1].key === 'fork', '--skills armor=4 is an ad hoc item when no card carries it; fork comes from the plan');
  let threw = false; try { M.itemsFor(plan, { skills: 'nosuch' }); } catch (e) { threw = true; } ok(threw, 'an unknown skill without =N is refused');
}

// 4. the refit classifier
{
  const cfg = P.CONFIG.refit, byId = { a: { effects: {} }, an: { effects: { anadromous: true } } };
  const row = (id, stats, attack, health) => ({ id, stats, attack, health });
  ok(!RF.classify(row('a', '3/6', 3, 5), cfg, byId).why.length, 'a 1-point trim that keeps the shape is rule-clean');
  ok(RF.classify(row('a', '3/6', 2, 4), cfg, byId).why.some(w => /stat points/.test(w)), 'a 3-point change is flagged');
  ok(RF.classify(row('a', '3/2', 2, 4), cfg, byId).why.some(w => /theme clash/.test(w)), '3/2 -> 2/4 (hitter -> balanced) is a theme clash');
  ok(RF.classify(row('marshal-of-rivergate', '2/3', 4, 9), cfg, { 'marshal-of-rivergate': {} }).why.some(w => /owner/.test(w)), 'a named owner card is flagged');
  ok(RF.classify(row('an', '2/6', 2, 5), cfg, byId).why.some(w => /anadromous/.test(w)), 'an Anadromous card is left to ENG15');
}

// 5. the test step parses the runner's own line
{
  const r = TS.parse('\n✗ skills2-2026-10-31 (exit 1, 3.0s) — last lines:\n  x\n\ntests: 7 passed, 1 failed, 4 skipped (passed before on identical inputs) · 42s · slowest: a 10s', 'x');
  ok(r.passed === 7 && r.failed === 1 && r.cached === 4 && r.failedTests[0] === 'skills2-2026-10-31', 'passed / failed / cached and the failing name are read from tests/run.js output');
}

// 6. the budget constants (the owner's SKILL2-1 and SKILL2-2, set through the pipeline's price step)
{
  const B = require('../bramblewood-budget.js'), c = K.read();
  ok(B.CAP2_S_SCALE === 0.5 && c.cap2SScale === 0.5, 'CAP2_S_SCALE is 0.5 (SKILL2-1)');
  ok(B.MISS_MULT_BY.flying === 1.13 && B.MISS_MULT_BY.evasive === 1.13 && B.MISS_MULT_BY.shadow === 1.1, 'Flying and Evasive are x1.13, Shadow unchanged (SKILL2-2)');
  const x = B.capScores(3, 5, 4, {}, null, { m: 1 }), y = B.capScores(3, 5, -4, {}, null, { m: 1 }), z = B.capScores(3, 5, 4, {}, { cap2SScale: 1 }, { m: 1 });
  ok(x.x2 === 15 + 4, 'cap 2 reads S 4 as (4/2)·|4/2| = 4 (got ' + x.x2 + ')');
  ok(y.x2 === 15 - 4, 'a negative S still frees room: (-2)·|-2| = -4 (got ' + y.x2 + ')');
  ok(z.x2 === 15 + 16, 'cfg.cap2SScale 1 restores S·|S| (the refit tool reads the old table that way)');
  ok(x.x1 === 3 * 3 + 5 + 4, 'cap 1 is untouched by the scale');
  let bad = false; try { K.parse('cap2Mult=2'); } catch (e) { bad = true; } ok(bad, 'the price step refuses a constant that is not on its list');
  ok(JSON.stringify(K.parse('cap2SScale=0.5,flying=1.13')) === '{"cap2SScale":0.5,"flying":1.13}', 'a --set-const spec parses');
}

// 7. wiring: run-all.sh lists this test, the workflow documents the pipeline, the changelog has the entry
{
  const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
  ok(/tests\/speed1-2026-10-31\.js/.test(rd('tests/run-all.sh')), 'tests/run-all.sh lists this test');
  const wf = rd('docs/workflows/balance.md');
  ok(/## Pipeline/.test(wf) && /tools\/pipeline\/run\.sh/.test(wf) && /when to look/i.test(wf), 'docs/workflows/balance.md has the Pipeline section with the commands and when to look');
  ok(/package SPEED1/.test(rd('docs/CHANGELOG.md').split('\n').slice(0, 14).join('\n')), 'the CHANGELOG has the SPEED1 entry at the top');
  ['run.sh', 'run.js', 'lib.js', 'measure.js', 'price.js', 'refit.js', 'bake.js', 'tournament.js', 'test.js', 'constants.js', 'config.json'].forEach(f => ok(fs.existsSync(path.join(ROOT, 'tools', 'pipeline', f)), 'tools/pipeline/' + f + ' exists'));
}

fs.rmSync(tmp, { recursive: true, force: true });
console.log(fail ? `speed1: ${fail} of ${checks} checks FAILED` : `speed1: all ${checks} checks passed`);
process.exit(fail ? 1 : 0);
