#!/usr/bin/env node
// 2026-10-28 (package TOOLS1, owner 10-28 21:40: the three balancing tools): the workbench's own checks (tools/bench/check.js: legal random
// decks and rests, deterministic fights, a no-op variant plays the card's very games, the cache, the skill plan with vanilla carriers, T3's
// 6-card / 4-copy rule on a small search), the CLI's help, and the hub section's reader. About 40 s on 2 cores.
'use strict';
const path = require('path'), cp = require('child_process');
const ROOT = path.join(__dirname, '..');
let fail = 0, n = 0; const ok = (c, m) => { n++; if (!c) { fail++; console.log('  ✗', m); } };
(async () => {
  const problems = await require(path.join(ROOT, 'tools', 'bench', 'check.js')).run({});
  problems.forEach(p => ok(false, p)); ok(problems.length === 0, 'bench self-checks');
  const help = cp.execFileSync('node', [path.join(ROOT, 'tools', 'bench', 'bench.js'), 'help'], { encoding: 'utf8' });
  ['contrib', 'skill', 'deck', 'check'].forEach(c => ok(help.includes('bench.js ' + c), 'help names ' + c));
  // nothing the workbench does may write the price table or the cards: the modules hold no write to canonical/
  const fs = require('fs'); ['lib.js', 'contrib.js', 'skill.js', 'deck.js', 'bench.js'].forEach(f => ok(!/writeFileSync\([^)]*canonical/.test(fs.readFileSync(path.join(ROOT, 'tools', 'bench', f), 'utf8')), f + ' writes nothing under canonical/'));
  // the hub section renders with or without results
  const py = cp.spawnSync('python3', ['-c', `import sys; sys.path.insert(0, ${JSON.stringify(path.join(ROOT, 'tools', 'hub'))}); import bench_data as B; h = B.html_block(${JSON.stringify(ROOT)}, lambda s: s); print('OK' if 'Workbench' in h and h.count('<section') == h.count('</section>') else 'BAD')`], { encoding: 'utf8' });
  ok(/OK/.test(py.stdout), 'hub: the Workbench section renders' + (py.stderr ? ' (' + py.stderr.slice(0, 200) + ')' : ''));
  console.log(`tools1: ${n - fail}/${n} checks passed`); process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
