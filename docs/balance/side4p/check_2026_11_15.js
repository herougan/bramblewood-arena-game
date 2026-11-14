#!/usr/bin/env node
// 2026-11-15 (package SIDE4P, scratch only): problems() and the map usage line for side fights, with decks from a fixes jsonl (or as they stand).
//   node tools/side4p_check.js [--holds] [--fixes file.jsonl] CODE...      (run plain = today's rules; under rules_2026_11_14.js --carried 2 = SIDE2-2 a)
'use strict';
const fs = require('fs');
const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
if (a.includes('--holds')) require('./side2/holds_2026_11_13.js').patch();
const L = require('./skir1/lib_fight_2026_11_11.js');
const fx = {}; if (arg('--fixes')) fs.readFileSync(arg('--fixes'), 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse).forEach(x => { if (x.deck) fx[x.key] = x.deck; });
const codes = a.filter((x, i) => !x.startsWith('--') && !(i > 0 && /^--(fixes)$/.test(a[i - 1])));
for (const code of codes) {
  let mm, nn; for (const m of L.maps()) { const n = L.fightsOf(m).find(x => x.key === code); if (n) { mm = m; nn = n; break; } }
  if (!mm) { console.log(code, 'not found'); continue; }
  const f = L.fight(mm, nn), d = fx[code] || nn.deck;
  // usage: each card of this deck counted over the map's fights, with this fight's deck replaced (and any other fixes of the file applied)
  const all = L.fightsOf(mm), cnt = {}; all.forEach(n => { Object.keys(fx[n.key] || n.deck).forEach(id => { cnt[id] = (cnt[id] || 0) + 1; }); });
  const cap = L.ucapOf(mm), over = Object.keys(d).filter(id => cnt[id] > cap).map(id => id + ' ' + cnt[id]);
  console.log(code, JSON.stringify(d), 'problems:', JSON.stringify(f.problems(d)), `usage line ${cap} of ${all.length} fights; over: ${over.join(', ') || 'none'}`);
}
