#!/usr/bin/env node
// 2026-11-07 (package UI26, owner 08:18): the standing darkening of a unit that can't see is halved (shade .07, art brightness .95);
// the eye-intro values stay; the game's sight look is A only (no blindfold band).
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const read = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  x', m); } };
const tpl = read('arena_template.html'), fx = read('bramblewood-fx-b.js');
ok(/\.board-card > \.fxb-shade\{opacity:\.07 !important;\}/.test(tpl), 'standing shade opacity .07');
ok(/\.board-card\.fxb-cantsee\.fxb-look-A \.card-tile \.ico, \.board-card\.fxb-cantsee\.fxb-why-sun\.fxb-look-A \.card-tile \.ico\{filter:brightness\(\.95\) !important;\}/.test(tpl), 'standing art brightness .95');
ok(!/\.fxb-shade\{opacity:\.14 !important/.test(tpl), 'the old .14 is gone');
ok(/fxb-cantsee:not\(\.ui14-eye-out\):not\(\.ui14-eye-gone\) > \.fxb-shade\{opacity:\.55 !important;/.test(tpl) && /\.ico\{filter:brightness\(\.72\) !important;\}/.test(tpl), 'the eye-intro moment is unchanged (.55 / .72)');
ok(/\.battlefield\.bf-lantern\.bf-dark-dark::after\{background:radial-gradient\(circle 220px[^}]*rgba\(6,6,14,\.34\) 68%, rgba\(4,4,10,\.5\) 100%\)/.test(tpl), 'plain Darkness overlay unchanged (.34 / .5)');
ok(/M\.sightLook = 'A';/.test(fx) && !/M\.sightLook = '[BC]'/.test(fx), "the game's sight look stays A (the look-B blindfold is FX-lab only)");
ok(/^## 2026-11-07 Package UI26/m.test(read('docs/CHANGELOG.md')), 'CHANGELOG entry');
ok(/tests\/ui26-2026-11-07\.js/.test(read('tests/run-all.sh')), 'in run-all.sh');
console.log(`ui26-2026-11-07: ${n - fail}/${n} checks passed`);
process.exit(fail ? 1 : 0);
