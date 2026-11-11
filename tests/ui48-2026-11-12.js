#!/usr/bin/env node
// 2026-11-12 (package UI48, owner 00:38): source checks. Browser check: tests/e2e/ui48_2026_11_12.py.
'use strict';
const fs = require('fs'), path = require('path');
const rd = f=> fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
let fail = 0, pass = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  x', m); } else pass++; };
const app = rd('arena_app.js');
const fn = name=>{ const i = app.indexOf('function ' + name + '('); if(i < 0) return ''; const e = app.indexOf('\n}', i); return app.slice(i, e < 0 ? i + 4000 : e + 2); };
// 2 tutorial cards: Map 0 and 1 only; no below-floor top-up
ok(/n >= 0 && n <= 1\) ui43TutorialCards/.test(fn('ui37CarriedIndex')) && /n >= 0 && n <= 1\) ui43TutorialCards/.test(fn('ui37Prospects')), '2. tutorial cards only on Map 0 and 1');
ok(!/newTarget/.test(fn('ui38Fill')), '2. ui38Fill has no newTarget top-up');
// 3 rewards: one grid
const rw = fn('ui22McRewardsHTML');
ok((rw.match(/vis4-mc-row/g) || []).length === 1 && !/ui22-cap/.test(rw), '3. Skirmish rewards: one tile row, no caption per fight');
// 4 side-map suggestions and targets
{ const sg = JSON.parse(app.match(/const UI47_SUGGEST = (\{.*\});/)[1]), cj = require('../canonical/cards.json'), ids = new Set(cj.map(c=> c.id));
  const subs = ['mq', 'mp', 'm9', 'mj', 'mg', 'mz', 'my', 'me', 'mx', 'ms', 'mn', 'mv', 'mi', 'mo', 'mpd'];
  ok(subs.every(k=> sg[k] && sg[k].length >= 1 && sg[k].length <= 3 && sg[k].every(id=> ids.has(id))), '4. each side map has 1-3 real Suggested cards'); }
ok(/ui47SuggestedOf\(subId\)\.forEach\(id=> add\(id, 'suggest'\)\)/.test(fn('ui44Split')) && /ui47SuggestFirst\(subId/.test(fn('ui44Split')), '4. ui44Split adds Suggested cards and sorts them first');
ok(/own: 3, carried: 8/.test(fn('ui37Targets')), '4. side map default target 3 / 8');
// 6 stepping
ok(/ui44Ordered\(\)/.test(fn('ui44HeadHTML')) && /data-ui37-go/.test(fn('ui44HeadHTML')) && /ui44After\(m\.id\)/.test(fn('ui44Ordered')), '6. side-map head has the previous / next buttons in unlock-map order');
// 5 the No click reads the submap's own flag
ok(/cur = ui42Shown\(key, id\)/.test(app), '5. the Yes / No click reads the flag of the map in the window (key)');
console.log(fail ? 'FAIL ' + fail : 'PASS ' + pass); process.exit(fail ? 1 : 0);
