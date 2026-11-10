#!/usr/bin/env node
// 2026-11-10 (package BAL46): BAL45's tool, adapted for the three main-map fights a 400-game road measure (bal45w400) read out of band (5-2, 7-6, 10-7); every 200-game read is played at 400 (./rules_2026_11_10.js), output docs/balance/bal46/. BAL45's header: BAL44's tool. BAL44's header: BAL43's tool. BAL43's header: BAL42's tool. BAL42's header: BAL41's apply (BAL37's) for BAL42's kept picks (The Glass Dunes 18-*, The Morel Hollow 7-*; main maps only), from docs/balance/bal42/<dir>, comment dated BAL42.
// BAL37's header: applies the kept picks with BAL35's
// tuner unchanged (tools/bal35/road_tune_2026_11_10.js apply --dir ../bal37/<dir>: deck from the fight's own list, leader, Shield; kept only
// when 2+ points nearer the target at 400 games on the road seeds), then re-dates the comment it writes on those lines to BAL37 (the one right after deck:{...}: a line BAL35 already
// retuned keeps its older BAL35 comment further on, so BAL36's lastIndexOf would re-date that one).
//   node tools/bal46/apply_2026_11_10.js [--dir exhaust] [--codes 3-4,...]
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..');
const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const DIR = arg('--dir', 'exhaust'), CODES = (arg('--codes', '') || '').split(',').filter(Boolean);
const src = path.join(ROOT, 'docs', 'balance', 'bal46', DIR);
const kept = fs.readdirSync(src).filter(f => f.endsWith('.json')).map(f => JSON.parse(fs.readFileSync(path.join(src, f), 'utf8')))
  .filter(x => x.keep && (!CODES.length || CODES.includes(x.code))).map(x => x.code);
if (!kept.length) { console.log('nothing kept in', DIR); process.exit(0); }
cp.execFileSync('node', [path.join(ROOT, 'tools', 'bal35', 'road_tune_2026_11_10.js'), 'apply', '--dir', path.join('..', 'bal46', DIR), '--codes', kept.join(',')], { cwd: ROOT, stdio: 'inherit' });
const APP = path.join(ROOT, 'arena_app.js'); let s = fs.readFileSync(APP, 'utf8');
for (const code of kept) {
  const re = new RegExp(`^(\\s*\\{ ?key:\\s*"${code.replace(/-/g, '\\-')}",.*)$`, 'm'), mm = s.match(re); if (!mm) throw new Error('node not found ' + code);
  const from = '/* 2026-11-10 (BAL35): retuned toward the road curve after ENG38-40 / BAL34 (target';
  const dm = mm[1].match(/deck:\{[^}]*\} /), i = dm ? dm.index + dm[0].length : -1; if (i < 0 || mm[1].slice(i, i + from.length) !== from) throw new Error(code + ': no fresh BAL35 comment to re-date');
  const line = mm[1].slice(0, i) + '/* 2026-11-10 (BAL46): retuned toward the road curve after BAL45 (400-game measure; target' + mm[1].slice(i + from.length);
  const line2 = line.replace(/(\(BAL46\): retuned[^*]*?)at 200 games/, '$1at 400 games'); // BAL46: the reads are 400 games (./rules_2026_11_10.js)
  s = s.replace(mm[1], line2); console.log('re-dated', code);
}
fs.writeFileSync(APP, s);
