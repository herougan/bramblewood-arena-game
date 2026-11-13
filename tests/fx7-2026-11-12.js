#!/usr/bin/env node
// 2026-11-12 (package FX7, owner 23:22): seven skill-effect proposals (Lab only, not wired into fights), checked without a browser.
//   1. each function (rabidFrothVfx, spiteBristleVfx, rockSolidVfx, ironWillVfx, hasteStreakVfx, trueSightVfx, oreClangVfx) against a fake DOM:
//      one host, few spans, only transform and opacity in the frames, every span done by 1.1 s, the host removes itself, no per-frame work
//   2. Effects Low and reduced motion: one still piece, opacity only; Effects None: nothing
//   3. not wired into the game (no caller outside the Lab), CSS has no filter / blend mode on the spans, the Lab entries, the catalogue and the CHANGELOG
//   4. the Lab-error test exists and is in run-all.sh
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
const src = rd('arena_app.js'), tpl = rd('arena_template.html');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  x', m); } };
const fnSrc = name=>{ const i = src.indexOf(`\nfunction ${name}(`); if(i < 0) throw new Error('no function ' + name);
  let d = 0; for(let k = src.indexOf('{', src.indexOf(')', i)); k < src.length; k++){ const ch = src[k]; if(ch === '{') d++; else if(ch === '}'){ d--; if(!d) return src.slice(i, k + 1); } } throw new Error('unclosed ' + name); };
const NAMES = ['rabidFrothVfx', 'spiteBristleVfx', 'rockSolidVfx', 'ironWillVfx', 'hasteStreakVfx', 'trueSightVfx', 'oreClangVfx'];
const MAXSPANS = {rabidFrothVfx:8, spiteBristleVfx:9, rockSolidVfx:7, ironWillVfx:2, hasteStreakVfx:7, trueSightVfx:3, oreClangVfx:4};

function run(reduced, level, row){
  const made = [], hosts = [], timers = [], anims = [];
  const mk = ()=>({className:'', style:{}, children:[], isConnected:true, dataset:{}, animate(kf, o){ anims.push({kf, o}); return {}; }, appendChild(c){ this.children.push(c); made.push(c); return c; }, remove(){ this.isConnected = false; },
    closest: sel=> row === 'enemy' && /rowEnemy/.test(sel) ? {} : null, getBoundingClientRect: ()=> ({left:100, top:100, width:90, height:120}), setAttribute(){} });
  const doc = {createElement: ()=> mk(), body: {appendChild(h){ hosts.push(h); return h; }}};
  const ctx = {document: doc, setTimeout: (f, ms)=>{ timers.push({f, ms}); return timers.length; }, reducedMotion: ()=> reduced, fxAtLeast: l=> ({none:0, low:1, med:2, high:3}[level] >= ({low:1, med:2, high:3}[l])), ui23Rect: r=> r && r.width > 0 ? r : null, Math, console};
  vm.createContext(ctx);
  vm.runInContext(['fxHostAt', 'fx7Run', 'FX7_C'].map(fnSrc).concat(NAMES.map(fnSrc)).join('\n'), ctx);
  const card = mk(); ctx.__c = card;
  return {ctx, made, hosts, timers, anims};
}
const props = r=>{ const s = new Set(); r.anims.forEach(a=> a.kf.forEach(k=> Object.keys(k).forEach(p=> s.add(p)))); return [...s]; };

NAMES.forEach(name=>{
  { const r = run(false, 'high'); vm.runInContext(`${name}(__c)`, r.ctx);
    ok(r.hosts.length === 1, `${name}: one host`); ok(r.made.length >= 2 && r.made.length <= MAXSPANS[name], `${name}: a few spans (${r.made.length})`);
    ok(props(r).every(p=> /^(transform|opacity|offset|easing)$/.test(p)), `${name}: transform and opacity only (${props(r)})`);
    ok(r.anims.every(a=> a.o.duration + a.o.delay <= 1100), `${name}: every span done by 1.1 s`);
    ok(r.timers.some(t=> t.ms <= 1200), `${name}: the host removes itself within 1.2 s`);
    r.timers.forEach(t=> t.f()); ok(r.hosts[0].isConnected === false, `${name}: the host is removed when the timer fires`);
    ok(r.made.every(s=> /^fx7 fx7-/.test(s.className)), `${name}: spans carry fx7 classes`); }
  { const r = run(true, 'high'); vm.runInContext(`${name}(__c)`, r.ctx);
    ok(r.made.length === 1 && props(r).every(p=> /^(opacity|offset)$/.test(p)), `${name}: reduced motion: one still piece, opacity only (${r.made.length})`); }
  { const r = run(false, 'low'); vm.runInContext(`${name}(__c)`, r.ctx);
    ok(r.made.length === 1 && props(r).every(p=> /^(opacity|offset)$/.test(p)), `${name}: Effects Low: one still piece, opacity only (${r.made.length})`); }
  { const r = run(false, 'none'); vm.runInContext(`${name}(__c)`, r.ctx); ok(r.made.length === 0 && r.hosts.length === 0, `${name}: Effects None: nothing`); }
  { const r = run(false, 'high'); vm.runInContext(`${name}(null)`, r.ctx); ok(r.made.length === 0, `${name}: no card, no effect`); }
});
{ const a = run(false, 'high', 'enemy'), b = run(false, 'high', 'mine'); vm.runInContext('hasteStreakVfx(__c)', a.ctx); vm.runInContext('hasteStreakVfx(__c)', b.ctx);
  const last = r=> r.anims.filter(x=> x.kf[2].transform)[0].kf[2].transform; ok(last(a) !== last(b), 'Haste: the streaks run down on the enemy row and up on ours'); }
ok(!/setInterval|requestAnimationFrame|onUpdate/.test(['fx7Run'].concat(NAMES).map(fnSrc).join('')), 'no per-frame work');

// 3. not wired, CSS, Lab, docs
const callers = NAMES.filter(nm=> new RegExp(`[^\\w]${nm}\\(`, 'g').test(src.replace(new RegExp(`function ${nm}\\(`, 'g'), '')));
ok(callers.length === 0, 'proposals only: nothing in arena_app.js calls them (' + callers + ')');
ok(!/\.fx7[-\w]*\{[^}]*(filter:|mix-blend-mode)/.test(tpl), 'no filter / blend mode on the fx7 spans');
ok(/\.fx-float-host > \.fx7\{[^}]*will-change:transform, opacity/.test(tpl), 'the spans hint transform / opacity only');
const lab = rd('tools/effects-lab/manifest/fx7.js'), extra = rd('tools/effects-lab/fx-src-extra.txt');
ok(NAMES.every(nm=> lab.includes("'" + nm + "'") && new RegExp('^' + nm + '$', 'm').test(extra)), 'every function is in a Lab entry and in fx-src-extra.txt');
ok((lab.match(/\bE\('/g) || []).length === 7 && /FX7 proposals/.test(rd('tools/effects-lab/fxlab-catalogue.js')), 'seven entries in the "FX7 proposals" area');
ok(/package FX7/.test(rd('docs/effects-catalogue.md')), 'effects catalogue entry');
ok(/Package FX7/.test(rd('docs/CHANGELOG.md').slice(0, 150000)), 'CHANGELOG entry'); // 2026-11-13 TESTFIX3: window widened, newer entries sit above FX7's
// 4. the Lab-error test
ok(fs.existsSync(path.join(ROOT, 'tests/lab-errors-2026-11-12.py')) && /lab-errors-2026-11-12\.py/.test(rd('tests/run-all.sh')), 'the Lab-error test is in run-all.sh');
console.log(fail ? `fx7: ${fail} of ${n} checks FAILED` : `fx7: all ${n} checks passed`); process.exit(fail ? 1 : 0);
