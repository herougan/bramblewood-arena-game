#!/usr/bin/env node
// 2026-11-14 (package WHATIF1, decisions SIDE2-1 b / SIDE2-2 a): "what if" K14 let a side fight hold Carried cards (not unique to the map) at up
// to N copies each (still 6 Carried copies in all). Patches SKIR1's deck rules in memory only (tools/skir1/lib_fight_2026_11_11.js k14 and
// tools/skir1/build_2026_11_11.js fill's room) for side-map fights, or only the fights named; every tool run under this wrapper (SIDE2's fit,
// the builder's fill, WHATIF1's own) then reads the relaxed rule. Nothing on disk changes; run it in a scratch copy of the repo.
//   node tools/whatif1/rules_2026_11_14.js --carried 2 [--codes 20-A-4,19-A-10] -- <script.js> <its args...>
//   require('./rules_2026_11_14.js').patch({ carried: 2, codes: null })
'use strict';
const fs = require('fs'), path = require('path'), Module = require('module');
const SK1 = path.join(__dirname, '..', 'skir1');
function load(file, swaps, argv2) {
  const full = path.join(SK1, file); let src = fs.readFileSync(full, 'utf8');
  for (const [a, b] of swaps) { if (!src.includes(a)) throw new Error('WHATIF1: ' + file + ' changed: ' + a); src = src.split(a).join(b); }
  const m = new Module(full, module); m.filename = full; m.paths = Module._nodeModulePaths(SK1);
  const save = process.argv[2]; if (argv2) process.argv[2] = argv2; // the builder runs its own command on load: give it none of its commands
  m._compile(src, full); m.loaded = true; require.cache[full] = m; process.argv[2] = save; return m.exports;
}
function patch(o) {
  if (global.__whatif1) return; global.__whatif1 = { carried: +o.carried || 1, codes: o.codes ? new Set(o.codes) : null };
  global.__whatif1.ok = (m, n) => !!(m && m.sub) && (!global.__whatif1.codes || global.__whatif1.codes.has(n.key));
  load('lib_fight_2026_11_11.js', [["if (k > 1) out.push(id + ' x' + k);", "if (k > (global.__whatif1.ok(m, n) ? global.__whatif1.carried : 1)) out.push(id + ' x' + k);"],
    ["return { m, n, map: m.id,", "return { carriedMax: global.__whatif1.ok(m, n) ? global.__whatif1.carried : 1, m, n, map: m.id,"]]);
  load('build_2026_11_11.js', [["if (nonU(id)) return d[id] ? 0 : (nonUTot() < 6 ? 1 : 0); return c; };",
    "if (nonU(id)) return Math.max(0, Math.min(c, f.carriedMax - (d[id] || 0), 6 - nonUTot())); return c; };"]], 'whatif1-none');
}
module.exports = { patch };
if (require.main === module) {
  const a = process.argv.slice(2), k = a.indexOf('--'); if (k < 0) { console.log('usage: --carried N [--codes a,b] -- script args'); process.exit(2); }
  const own = a.slice(0, k), arg = (n, d) => { const i = own.indexOf(n); return i >= 0 ? own[i + 1] : d; };
  patch({ carried: arg('--carried', 2), codes: arg('--codes', null) ? arg('--codes').split(',') : null });
  const script = path.resolve(a[k + 1]); process.argv = [process.argv[0], script].concat(a.slice(k + 2));
  require(script);
}
