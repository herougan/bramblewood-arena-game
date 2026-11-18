#!/usr/bin/env node
// 2026-11-18 (package REFIT6): after `node tools/skirmish_pass.js apply --fixes=refit6/refit6-fixes`, a dated comment right after each changed
// fight's deck:{...} in arena_app.js, in the existing style. Once per fight (a second run adds nothing).
//   node docs/balance/refit6/comment_2026_11_18.js docs/balance/refit6/refit6-fixes.jsonl
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.resolve(__dirname, '..', '..', '..'), APP = path.join(ROOT, 'arena_app.js');
const fixes = fs.readFileSync(path.resolve(process.argv[2]), 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse).filter(x => x.apply !== false && x.deck);
let s = fs.readFileSync(APP, 'utf8'), n = 0;
for (const x of fixes) {
  const re = new RegExp(`(\\{ ?key:\\s*['"]${x.key.replace(/[-]/g, '\\-')}['"],[^\\n]*?deck:\\{[^}]*\\})`), mm = s.match(re);
  if (!mm) { console.log('not found', x.key); continue; }
  const why = x.why || 'toward the road curve';
  const c = ` /* 2026-11-18 (REFIT6): legal re-fit after the Map reference rebuild; ${why}; docs/balance/refit6/ */`;
  const after = s.slice(s.indexOf(mm[1]) + mm[1].length, s.indexOf(mm[1]) + mm[1].length + 30);
  if (after.startsWith(" /* 2026-11-18 (REFIT6")) continue;
  s = s.replace(mm[1], mm[1] + c); n++;
}
fs.writeFileSync(APP, s); console.log('commented', n, 'fights');
