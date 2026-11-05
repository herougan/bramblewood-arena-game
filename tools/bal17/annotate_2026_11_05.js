#!/usr/bin/env node
// 2026-11-05 (package BAL17): the dated comment on each road deck the BAL17 retune (Maps 21-24) changed (tools/skirmish_pass.js apply writes the deck only):
// after the node's deck literal, "/* 2026-11-05 (BAL17): retuned toward the road curve ... */" with the pass, the tune win rates and the target.
//   node tools/bal16/annotate_2026_11_05.js bal17-weak bal17-curve
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..'), APP = path.join(ROOT, 'arena_app.js');
let s = fs.readFileSync(APP, 'utf8'), n = 0;
for (const name of process.argv.slice(2)) {
  const rows = fs.readFileSync(path.join(ROOT, 'docs', 'balance', name + '.jsonl'), 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l)).filter(x => x.deck && x.apply !== false);
  for (const x of rows) {
    const re = new RegExp(`\\{ ?key:\\s*['"]${x.key.replace(/-/g, '\\-')}['"],[^\\n]*`), m = re.exec(s); if (!m) continue;
    const line = m[0], i = line.indexOf('deck:{'); if (i < 0) continue; const j = line.indexOf('}', i);
    const start = x.trail && x.trail[0] ? x.trail[0].win : x.start, after = x.after && x.after.win;
    const note = ` /* 2026-11-05 (BAL17): retuned toward the road curve from the fight's own list (${/weak/.test(name) ? 'the weak pass' : 'swaps only'}), ${start}% -> ${after}% at ${/weak/.test(name) ? 40 : 50} tune games, target ${Math.round(x.target)} */`;
    if (line.includes('(BAL17): retuned')) continue;
    s = s.replace(line, line.slice(0, j + 1) + note + line.slice(j + 1)); n++;
  }
}
fs.writeFileSync(APP, s); console.log('annotated ' + n + ' decks');
