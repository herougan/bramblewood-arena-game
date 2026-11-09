#!/usr/bin/env node
// 2026-11-10 (package BAL36): applies BAL36's kept picks (The Canopy 14-A-*, Smugglers' Grotto 2-B-*, The Mycelium Deep 7-A-*) with BAL35's
// tuner unchanged (tools/bal35/road_tune_2026_11_10.js apply --dir ../bal36/<dir>: deck from the fight's own list, leader, Shield; kept only
// when 2+ points nearer the target at 200 games on the road seeds), then re-dates the comment it writes on those lines to BAL36.
//   node tools/bal36/apply_2026_11_10.js [--dir exhaust] [--codes 2-B-2,...]
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..');
const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const DIR = arg('--dir', 'exhaust'), CODES = (arg('--codes', '') || '').split(',').filter(Boolean);
const src = path.join(ROOT, 'docs', 'balance', 'bal36', DIR);
const kept = fs.readdirSync(src).filter(f => f.endsWith('.json')).map(f => JSON.parse(fs.readFileSync(path.join(src, f), 'utf8')))
  .filter(x => x.keep && (!CODES.length || CODES.includes(x.code))).map(x => x.code);
if (!kept.length) { console.log('nothing kept in', DIR); process.exit(0); }
cp.execFileSync('node', [path.join(ROOT, 'tools', 'bal35', 'road_tune_2026_11_10.js'), 'apply', '--dir', path.join('..', 'bal36', DIR), '--codes', kept.join(',')], { cwd: ROOT, stdio: 'inherit' });
const APP = path.join(ROOT, 'arena_app.js'); let s = fs.readFileSync(APP, 'utf8');
for (const code of kept) {
  const re = new RegExp(`^(\\s*\\{ ?key:\\s*"${code.replace(/-/g, '\\-')}",.*)$`, 'm'), mm = s.match(re); if (!mm) throw new Error('node not found ' + code);
  const from = '/* 2026-11-10 (BAL35): retuned toward the road curve after ENG38-40 / BAL34 (target';
  const i = mm[1].lastIndexOf(from); if (i < 0) throw new Error(code + ': no fresh BAL35 comment to re-date');
  const line = mm[1].slice(0, i) + '/* 2026-11-10 (BAL36): retuned toward the road curve after BAL35 (target' + mm[1].slice(i + from.length);
  s = s.replace(mm[1], line); console.log('re-dated', code);
}
fs.writeFileSync(APP, s);
