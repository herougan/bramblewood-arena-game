#!/usr/bin/env node
// 2026-11-16 (package CARDPOW1): folds the progress lines a sharded card power run printed in its GitHub job logs (tools/card_balance.js --v3
// --scope=all --shard=K/20, each job's lines between BEGIN-ROWS / END-ROWS) into docs/balance/bal25/card-power-progress.jsonl, so
// `node tools/card_balance.js --v3 --scope=all --resume --report-only` writes the report (or a later stage resumes from it).
//   node tools/cardpow1/merge_ci_2026_11_16.js <run-id> [<run-id> ...]   (reads `gh run view <id> --log`; the file's own lines are kept)
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..'), PROG = path.join(ROOT, 'docs', 'balance', 'bal25', 'card-power-progress.jsonl');
const ids = process.argv.slice(2); if (!ids.length) { console.error('usage: merge_ci_2026_11_16.js <run-id> ...'); process.exit(2); }
let header = null; const jobs = new Map(); // key phase|id -> line
const take = l => { let o; try { o = JSON.parse(l); } catch (e) { return; } if (o.settings) { if (!header) header = l; else if (l !== header) throw new Error('shards ran with other settings'); return; } if (o.phase && o.id) jobs.set(o.phase + '|' + o.id, JSON.stringify(o)); };
const keepOwn = process.argv.includes('--fresh') ? false : fs.existsSync(PROG);
if (keepOwn) fs.readFileSync(PROG, 'utf8').split('\n').filter(Boolean).forEach(take);
ids.filter(x => /^\d+$/.test(x)).forEach(id => {
  const log = cp.execSync(`gh run view ${id} --log`, { cwd: ROOT, maxBuffer: 1 << 30 }).toString();
  let on = false, n = 0;
  log.split('\n').forEach(line => { const t = line.replace(/^[^\t]*\t[^\t]*\t\S+ /, ''); if (t === 'BEGIN-ROWS') { on = true; return; } if (t === 'END-ROWS') { on = false; return; } if (on && t.startsWith('{')) { take(t); n++; } });
  console.log(`run ${id}: ${n} lines`);
});
if (!header) throw new Error('no settings line');
const lines = [...jobs.values()];
fs.writeFileSync(PROG, header + '\n' + lines.join('\n') + '\n');
const c = p => lines.filter(l => l.startsWith('{"phase":"' + p + '"')).length;
console.log(`${PROG}: basic ${c('basic')}, adv ${c('adv')}`);
