#!/usr/bin/env node
// 2026-11-14 (package REF7): the BAL13 ladder build (docs/balance/bal13/ladder/<mapId>.json) before (git HEAD) vs after the rebuild on the REF6
// prog decks: per map, the selection range (weakest .. strongest candidate), the chosen decks' mean selectWin, and the prog candidates (how
// many the map-true pool let in, their win, which ranks they took). No games.
//   node tools/ref7/bal13_diff_2026_11_14.js [--ref HEAD] [--json out.json]
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process'), ROOT = path.resolve(__dirname, '..', '..');
const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; }, REF = arg('--ref', 'HEAD');
const DIR = 'docs/balance/bal13/ladder', L = require('../bal13/ladder_2026_11_02.js'), out = {};
const mean = x => x.length ? Math.round(x.reduce((s, v) => s + v, 0) / x.length * 10) / 10 : null;
for (const e of L.entries().filter(x => x.map <= 20)) {
  const f = `${DIR}/${e.id}.json`; let old = null; try { old = JSON.parse(cp.execSync(`git show ${REF}:${f}`, { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString()); } catch (x) { /* new */ }
  const now = JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')), prog = now.candidates.filter(c => /prog-/.test(c.from));
  const r = { map: e.map, side: !!now.map.side, before: old && { lo: old.candidates.reduce((m, c) => Math.min(m, c.win), 1e9), hi: old.candidates.reduce((m, c) => Math.max(m, c.win), -1), chosenMean: mean(old.chosen.map(c => c.selectWin)), prog: old.candidates.filter(c => /prog-/.test(c.from)).length },
    after: { lo: now.candidates.reduce((m, c) => Math.min(m, c.win), 1e9), hi: now.candidates.reduce((m, c) => Math.max(m, c.win), -1), chosenMean: mean(now.chosen.map(c => c.selectWin)), prog: prog.length,
      progWin: prog.map(c => c.from.replace('Reference (Random) ', '') + ' ' + c.win), progChosen: now.chosen.filter(c => /prog-/.test(c.from)).map(c => c.from.replace('Reference (Random) ', '') + ' rank ' + c.rank) } };
  out[e.id] = r;
  const b = r.before || {};
  console.log(`${e.id.padEnd(4)} Map ${String(e.map).padStart(2)}${r.side ? ' side' : '     '} range ${b.lo}-${b.hi} -> ${r.after.lo}-${r.after.hi}; chosen mean ${b.chosenMean} -> ${r.after.chosenMean}; prog cands ${b.prog} -> ${r.after.prog} [${r.after.progWin.join(', ')}] chosen [${r.after.progChosen.join(', ')}]`);
}
if (arg('--json')) fs.writeFileSync(arg('--json'), JSON.stringify({ about: 'REF7: BAL13 ladder build before (git ' + REF + ') vs after the rebuild on the REF6 prog decks (tools/ref7/bal13_diff_2026_11_14.js); wins in % on the ladder seeds, 6 games a fight', maps: out }, null, 1) + '\n');
