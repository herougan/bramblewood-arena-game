#!/usr/bin/env node
// 2026-10-29 (package HUBDEC1, owner: decisions split into game / architecture / finance): docs/decisions.json items each carry a valid
// `group`, ids stay unique, the hub's Decisions tab has the three sub-tabs (group-aware counts, remembered in localStorage, a missing
// group counts as game), and the decisions writers in tools/ set `group` on the items they add.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  ✗', m); } };
const GROUPS = ['game', 'architecture', 'finance'];
const raw = fs.readFileSync(path.join(ROOT, 'docs', 'decisions.json'), 'utf8');
const d = JSON.parse(raw);
const ids = new Set();
for(const it of d.items){
  ok(GROUPS.includes(it.group), `${it.id}: group "${it.group}" is not one of ${GROUPS.join(' / ')}`);
  ok(!ids.has(it.id), `${it.id}: duplicate id`); ids.add(it.id);
}
for(const g of GROUPS) ok(d.items.some(i=> i.group === g), `no item in group ${g}`);
ok(raw.split('\n').filter(l=> l.trim().startsWith('{"id"')).length === d.items.length, 'decisions.json: one item per line');
const hub = fs.readFileSync(path.join(ROOT, 'tools', 'hub', 'build_hub.py'), 'utf8');
ok(/id="decGrp"/.test(hub) && GROUPS.every(g=> hub.includes(`data-g="${g}"`)), 'hub: three sub-tab buttons');
ok(/localStorage\.getItem\('hubDecGroup'\)/.test(hub) && /localStorage\.setItem\('hubDecGroup'/.test(hub), 'hub: last sub-tab remembered');
ok(/try \{\{ const g = localStorage/.test(hub) && /try \{\{ localStorage\.setItem/.test(hub), 'hub: localStorage in try/catch');
ok(/GROUPS\.includes\(i\.group\) \? i\.group : 'game'/.test(hub), 'hub: no group falls into Game');
ok(/let grp = 'game'/.test(hub), 'hub: default sub-tab is Game');
const writers = fs.readdirSync(path.join(ROOT, 'tools')).filter(f=> /decisions.*\.py$/.test(f));
for(const f of writers){ const s = fs.readFileSync(path.join(ROOT, 'tools', f), 'utf8'); if(/json\.dumps\(/.test(s)) ok(/'group'/.test(s), `tools/${f}: sets group on the items it writes`); }
console.log(`hubdec1: ${checks - fail}/${checks} checks passed`);
process.exit(fail ? 1 : 0);
