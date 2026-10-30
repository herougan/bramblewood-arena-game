// 2026-10-30 (coordinator; owner 21:35: "When the Sun's active, Diurnal symbol becomes highlighted, like tide. When it's night, nocturnal symbol gets highlighted.")
const fs = require('fs'), path = require('path'), ROOT = path.join(__dirname, '..');
const app = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8'), tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
let pass = 0, fail = 0; const ok = (c, m)=>{ if(c) pass++; else { fail++; console.log('  ✗ ' + m); } };
const i = app.indexOf('function zeitLitNow('), src = app.slice(i, app.indexOf('\n}\n', i) + 2);
const mk = ph=> new Function('matchState', src + '\nreturn zeitLitNow;')({over:false, engine:{zeitPhase: ()=> ph}});
const live = {live:{uid:1}};
ok(mk('day')('diurnal', live) && !mk('day')('nocturnal', live), 'day: Diurnal lit, Nocturnal not');
ok(mk('night')('nocturnal', live) && !mk('night')('diurnal', live), 'night: Nocturnal lit, Diurnal not');
ok(mk('twilight')('diurnal', live) && mk('twilight')('nocturnal', live), 'twilight: both lit');
ok(!mk(null)('diurnal', live) && !mk('day')('diurnal', {}) && !mk('day')('bleed', live), 'no cycle, outside a fight, other skills: not lit');
ok(/zeitLitNow\(k, bopts\) \? ' zeit-live'/.test(app), 'the chip takes .zeit-live');
ok(/\.ab-sk\.zeit-live\[data-sk="diurnal"\]/.test(tpl) && /\.ab-sk\.zeit-live\[data-sk="nocturnal"\]/.test(tpl), 'CSS for both');
console.log(`zeit-lit-2026-10-30: ${pass}/${pass + fail} passed`); process.exit(fail ? 1 : 0);
