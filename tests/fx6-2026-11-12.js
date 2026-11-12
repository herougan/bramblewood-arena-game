#!/usr/bin/env node
// 2026-11-12 (package FX6, owner 08:39): the four cheap effects, checked without a browser.
//   1. High Tide's second layer: the scene markup carries .tw-wave, the CSS shows it only for data-k="high", Low / None / reduced motion stop or hide it
//   2. Guardian: the engine only lets a Guardian step in while Ready (blockerReady), the plates are drawn from placement (no wait gate): rules untouched
//   3. Bulwark: the spawn event is kind 'bulwark'; its origin is kind 'rise' in the three places that set one; renderBoard has a riseUp branch (no flight);
//      no spawn portal; the construction cue exists and is in the cue sheet
//   4. bugCrawlVfx / sporePuffVfx / riseUpFx against a fake DOM: few nodes, only transform and opacity, the host is removed, nothing left,
//      reduced motion: no bugs, one opacity-only puff, no dust; Swarm and Spawn on death call the bugs; Spore Cloud and the Puffball call the puff
//   5. the Lab entries, the catalogue and the CHANGELOG entry
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
const src = rd('arena_app.js'), tpl = rd('arena_template.html'), eng = rd('bramblewood-engine.js');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  x', m); } };
const fnSrc = name=>{ const i = src.indexOf(`\nfunction ${name}(`); if(i < 0) throw new Error('no function ' + name);
  let d = 0; for(let k = src.indexOf('{', src.indexOf(')', i)); k < src.length; k++){ const ch = src[k]; if(ch === '{') d++; else if(ch === '}'){ d--; if(!d) return src.slice(i, k + 1); } } throw new Error('unclosed ' + name); };

// 1. the tide
ok(/class="tw-body"><div class="tw-water">[\s\S]{0,200}<i class="tw-wave"><\/i>/.test(src), 'syncTideScene markup has .tw-wave in .tw-body');
ok(/\.tide-scene\[data-k="high"\] \.tw-wave\{display:block/.test(tpl) && /\.tide-scene \.tw-wave\{display:none/.test(tpl), '.tw-wave shows only at High Tide');
ok(/html\[data-fx="low"\] \.tide-scene \.tw-wave[^{]*\{animation:none/.test(tpl), 'Low effects hold the wave still');
ok(/html\[data-fx="none"\] \.tide-scene \.tw-wave\{display:none/.test(tpl), 'Effects None leaves the wave out');
ok(/prefers-reduced-motion: reduce\)\{ \.tide-scene \.tw-wave[^}]*animation:none/.test(tpl), 'reduced motion: no wave animation');
{ const m = tpl.match(/\.tw-wave::before\{[^}]*\}/); ok(m && !/filter|mix-blend/.test(m[0]), 'the crest has no filter / blend mode');
  ok(/@keyframes twWaveDrift\{from\{transform:translateX\(0\);\} to\{transform:translateX\(-240px\);\}\}/.test(tpl), 'the crest drifts by transform only, one tile (240 px) so it loops'); }

// 2. Guardian: the rule and the picture agree on what exists
ok(/function blockerReady\(n\)\{ return !!n && !\(n\.wait > 0\)/.test(eng) && /isLiveGuardian[^\n]*blockerReady\(n\)/.test(eng), 'engine: a Guardian steps in only while Ready (ENG9), unchanged');
ok(/const guards = !!\(\(d\.effects\|\|\{\}\)\.guardian\) && !fog/.test(src), 'the plates are drawn for every Guardian from the moment it is placed (no wait gate)');

// 3. Bulwark
ok(/kind:'bulwark', uids:\[nc\.uid\]/.test(eng), 'engine: Bulwark spawn event kind bulwark');
ok((src.match(/kind: ev\.kind === 'bulwark' \? 'rise'/g) || []).length >= 3, 'three origin writers set kind rise for Bulwark');
ok(/if\(origin && origin\.kind === 'rise'\)\{ riseUp = true;/.test(src) && /if\(riseUp\)\{[\s\S]{0,900}riseUpFx\(el\)[\s\S]{0,600}\} else if\(flightOk\)/.test(src), 'renderBoard: rise branch before the flight branches');
ok(/ev\.kind !== 'bulwark' \/\* FX6: it rises, no portal \*\//.test(src), 'no summon portal on a Log Wall');
ok(/else if\(ev\.kind === 'bulwark'\) SoundKit\.constructTone\(\)/.test(src) && /constructTone\(\)\{[^\n]*tone\([^\n]*fnoise\(/.test(src), 'construction cue plays for the spawn, built from tone / fnoise / sweep');
ok(/\| 40 \| Construction \|/.test(rd('docs/sfx-cue-sheet.md')), 'cue 40 in docs/sfx-cue-sheet.md');

// 4. the three functions against a fake DOM
function run(reduced, level){
  const made = []; let hosts = [], timers = [], anims = [];
  const mk = ()=>{ const e = {className:'', style:{}, children:[], isConnected:true, dataset:{}, animate(kf, o){ anims.push({kf, o}); return {}; }, appendChild(c){ this.children.push(c); made.push(c); return c; }, remove(){ this.isConnected = false; }, closest: ()=> null,
    getBoundingClientRect: ()=> ({left:100, top:100, width:90, height:120}), setAttribute(){} }; return e; };
  const doc = {createElement: ()=> mk(), body: {appendChild(h){ hosts.push(h); return h; }}};
  const ctx = {document: doc, setTimeout: (f, ms)=>{ timers.push({f, ms}); return timers.length; }, reducedMotion: ()=> reduced, fxAtLeast: l=> ({none:0, low:1, med:2, high:3}[level] >= ({low:1, med:2, high:3}[l])), ui23Rect: r=> r && r.width > 0 ? r : null, Math, console};
  vm.createContext(ctx);
  vm.runInContext(['fxHostAt', 'riseUpFx', 'bugCrawlVfx', 'sporePuffVfx'].map(fnSrc).join('\n'), ctx);
  const card = mk();
  vm.runInContext('globalThis.__c = null', ctx); ctx.__c = card;
  return {ctx, card, made, hosts, timers, anims};
}
{ const r = run(false, 'high'); vm.runInContext('bugCrawlVfx(__c, {n:10})', r.ctx);
  ok(r.hosts.length === 1 && r.made.length === 10, 'bugs: one host, 10 bugs (' + r.made.length + ')');
  const props = new Set(); r.anims.forEach(a=> a.kf.forEach(k=> Object.keys(k).forEach(p=> props.add(p)))); ok([...props].every(p=> /^(transform|opacity|offset|easing)$/.test(p)), 'bugs animate transform and opacity only (' + [...props] + ')');
  ok(r.anims.every(a=> a.o.duration + a.o.delay <= 1000), 'every bug is gone by 1 s');
  ok(r.timers.some(t=> t.ms <= 1100), 'the host removes itself within 1.1 s');
  r.timers.forEach(t=> t.f()); ok(r.hosts[0].isConnected === false, 'the host is removed when the timer fires'); }
{ const r = run(true, 'high'); vm.runInContext('bugCrawlVfx(__c); riseUpFx(__c)', r.ctx); ok(r.made.length === 0 && r.hosts.length === 0, 'reduced motion: no bugs, no dust'); }
{ const r = run(false, 'low'); vm.runInContext('bugCrawlVfx(__c)', r.ctx); ok(r.made.length === 0, 'Effects Low: no bugs (Medium and up)'); }
{ const r = run(false, 'high'); vm.runInContext('sporePuffVfx(__c)', r.ctx);
  ok(r.hosts.length === 1 && r.made.length === 5, 'puff: one host, 5 puffs'); ok(r.anims.every(a=> a.o.duration + a.o.delay <= 1000), 'every puff is gone by 1 s');
  const props = new Set(); r.anims.forEach(a=> a.kf.forEach(k=> Object.keys(k).forEach(p=> props.add(p)))); ok([...props].every(p=> /^(transform|opacity|offset)$/.test(p)), 'puffs animate transform and opacity only'); }
{ const r = run(true, 'high'); vm.runInContext('sporePuffVfx(__c)', r.ctx); ok(r.made.length === 1 && r.anims[0].kf.every(k=> Object.keys(k).every(p=> /^(opacity|offset)$/.test(p))), 'reduced motion: one puff, opacity only'); }
{ const r = run(false, 'high'); vm.runInContext('riseUpFx(__c)', r.ctx); ok(r.made.length === 6, 'dust: six specks'); }
{ const r = run(false, 'none'); vm.runInContext('sporePuffVfx(__c); riseUpFx(__c)', r.ctx); ok(r.made.length === 0, 'Effects None: nothing'); }
ok(/\.fx6-puff\{[^}]*rgba\(74,104,6/.test(tpl), 'the puff is dark lime green');
ok(!/\.fx6-(bug|puff|dust)\{[^}]*filter:/.test(tpl), 'no filter on the effect spans');
ok(/bugCrawlVfx\(a, \{n:10\}\); \/\* 2026-11-12 \(FX6\)/.test(src) && !/F\.swarm\(a, t\);/.test(src.slice(src.indexOf("case 'hit': { const fx = fxOf(ev.attDefId)"), src.indexOf("case 'hitHQ'"))), 'Swarm calls the bugs, not the steered cloud');
ok(/ev\.cause === 'onDeathSpawn' && ev\.kind !== 'crystal' && ev\.kind !== 'relic'[\s\S]{0,400}bugCrawlVfx\(boardCardEl\(u0\)\)/.test(src), 'Spawn on death calls the bugs');
ok(/ev\.type === 'statusFx' && ev\.field === 'sporeCloud' && ev\.kind === 'sleep'\)\{ try\{ sporePuffVfx\(boardCardEl\(ev\.targetUid\)\)/.test(src), 'Spore Cloud sleep calls the puff on the sleeper');
ok(/ev\.attDefId === 'puffball-bombardier'[^\n]*sporePuffVfx/.test(src), 'the Puffball Bombardier calls the puff');
ok(!/setInterval|requestAnimationFrame|onUpdate/.test([fnSrc('riseUpFx'), fnSrc('bugCrawlVfx'), fnSrc('sporePuffVfx')].join('')), 'no per-frame work in the three functions');

// 5. docs and the Lab
ok(/id:'wt-tide-high'/.test(rd('tools/effects-lab/manifest/fx6.js')) && /riseUpFx\nbugCrawlVfx\nsporePuffVfx/.test(rd('tools/effects-lab/fx-src-extra.txt')), 'Lab entries and function sources');
ok(/package FX6/.test(rd('docs/effects-catalogue.md')), 'effects catalogue entry');
ok(/Package FX6/.test(rd('docs/CHANGELOG.md').slice(0, 20000)), 'CHANGELOG entry');
console.log(fail ? `fx6: ${fail} of ${n} checks FAILED` : `fx6: all ${n} checks passed`); process.exit(fail ? 1 : 0);
