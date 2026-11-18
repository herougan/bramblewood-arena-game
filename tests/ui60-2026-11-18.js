#!/usr/bin/env node
// 2026-11-18 (package UI60): 1. emoji centring offsets (tools/emoji/offsets.json) wired into the atlas stylesheet and the context pills;
// 2. the zoomed card shows "Lv N" in your deck and on the battlefield only; 3. the Codex album packs several sections on a page.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8'), tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  x', m); } };
const fnSrc = name=>{ const i = src.indexOf(`\nfunction ${name}(`); let d = 0, j = src.indexOf('{', i); for(let k = j; k < src.length; k++){ if(src[k] === '{') d++; else if(src[k] === '}' && !--d) return src.slice(i, k + 1); } return ''; };
// 1
const off = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/emoji/offsets.json'), 'utf8'));
for(const set of ['fluent', 'noto', 'twemoji']){ const o = off[set]; ok(o && Object.keys(o).length > 100, set + ' has offsets');
  ok(Object.values(o || {}).every(v=> Array.isArray(v) && v.length === 2 && Math.abs(v[0]) < .5 && Math.abs(v[1]) < .5), set + ' offsets are [dx, dy] fractions'); }
ok(/\.ab-trig img\.emo[^{]*\{translate:calc\(var\(--ox/.test(tpl), 'pills apply --ox/--oy');
ok(/--ox:\$\{a\.off\[k\]\[0\]\}/.test(src), 'the atlas stylesheet writes --ox/--oy');
ok(/import offsets; offsets\.run\(names\)/.test(fs.readFileSync(path.join(ROOT, 'tools/emoji/build_atlas.py'), 'utf8')), 'build_atlas runs offsets');
ok(/\.ab-trig \.ab-arrow\{[^}]*mask/.test(tpl), 'the arrow is a centred mask box');
// 2
ok(/showLevel: !!matchState \|\| !!el\.closest\('#myDeckPool, #myDeckList'\)/.test(src), 'level on hover: fights and your deck only');
ok(/\.card-pop-visual\.has-lv \.cp-lv\{display:block/.test(tpl), 'Lv pill is shown under the zoomed card');
// 3
const ctx = {}; vm.createContext(ctx); vm.runInContext(fnSrc('albumPaginate') + ';this.P = albumPaginate;', ctx);
const sec = k=> ({key: k, label: k}), g = (k, n)=> ({sec: sec(k), ids: Array.from({length: n}, (_, i)=> k + i), all: []});
let pg = ctx.P([g('a', 1), g('b', 1), g('c', 1)], 16, 4);
ok(pg.length === 1 && pg[0].parts.length === 3, 'three one-card sections share a page');
pg = ctx.P([g('a', 5), g('b', 4), g('c', 5)], 16, 4);
ok(pg.length === 2 && pg[0].parts.length === 2 && pg[1].parts.length === 1, 'a section that does not fit starts the next page');
pg = ctx.P([g('a', 20), g('b', 2)], 16, 4);
ok(pg.length === 2 && pg[1].parts.length === 2 && pg[1].parts[0].cont && !pg[1].parts[1].cont, 'a long section runs on, the next one joins its last page');
pg = ctx.P([g('a', 16), g('b', 1)], 16, 4);
ok(pg.length === 2 && pg[1].ids.length === 1 && pg[0].ids.length === 16, 'a full page takes no neighbour; page.ids lists its cards');
console.log(fail ? 'ui60: ' + fail + ' failed' : 'ui60: all passed'); process.exit(fail ? 1 : 0);
