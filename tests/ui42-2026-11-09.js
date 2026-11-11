#!/usr/bin/env node
// 2026-11-09 (package UI42, owner 22:48: "for the map cards thing: default is NO, then I'll click the Yes"): an unflagged card reads as No; Yes sets Yes, No goes back
// to No; Carried = flagged Yes on an earlier main map only; the pool still tops Carried up; exports report unflagged as no; counters count Yes only.
'use strict';
const fs = require('fs'), path = require('path');
const rd = f=> fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
let fail = 0, pass = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  x', m); } else pass++; };
const app = rd('arena_app.js'), html = rd('index.html');
const fn = name=>{ const i = app.indexOf('function ' + name + '('); if(i < 0) return ''; const j = app.indexOf('\n}\n', i), k = app.indexOf('\n', i); const e = (app[k - 1] === '}' && (j < 0 || j > k)) ? k : j + 2; return app.slice(i, e); };
// pure rules
const F = new Function('const UI47_TUT = -1, UI47_ADMIN_ADD = {}; function ui47AdminOf(t){ return []; } function ui47IsAdminAdded(t, id){ return false; } function ui43TutorialCards(){ return []; }' /* 2026-11-10 (UI43): the tutorial's cards are tested in ui43 */ + fn('ui37CarriedIndex') + '; return {ui37CarriedIndex};')();
const maps = [{n: 0, list: ['a', 'b', 'c'], yes: ['a'], no: ['c']}, {n: 1, list: ['d'], yes: [], no: []}];
ok([...F.ui37CarriedIndex(2, maps).keys()].join() === 'a', 'Carried: only the Yes card of an earlier map');
ok(!app.includes('function ui37CarriedPool'), 'the wide Carried pool is gone (UI45)');
ok(F.ui37CarriedIndex(1, maps).size === 1 && F.ui37CarriedIndex(0, maps).size === 0, 'a map never carries its own');
// shown flag
const sh = new Function('ui37Ent', 'ui47IsAdminAdded', fn('ui37FlagOf') + fn('ui42Shown') + '; return ui42Shown;')(t=> t === 'm' ? {yes: ['y'], no: ['n']} : {yes: [], no: []}, ()=> false);
ok(sh('m', 'y') === 'yes' && sh('m', 'n') === 'no' && sh('m', 'z') === 'no', 'unflagged and explicit no both read as no');
// wiring
ok(/fs = f === 'yes' \? 'yes' : 'no'/.test(fn('ui37TileHTML')) && /\$\{fs === k \? ' on' : ''\}/.test(fn('ui37TileHTML')), 'the No button is selected on an unflagged card');
// 2026-11-11 (owner 23:27): No on an admin add (UI47_ADMIN_ADD) stores an explicit No, which beats the add; any other No still goes back to no flag
ok(/cur = ui42Shown\(key, id\)/.test(app) && /ui37SetFlag\(key, id, want === 'yes' \? 'yes' : ui47IsAdminAdded\(key, id\) \? 'no' : ''\)/.test(app), 'Yes sets Yes; No goes back to no flag (an explicit No on an admin add)');
{ const sh2 = new Function('ui37Ent', 'ui47IsAdminAdded', fn('ui37FlagOf') + '; return ui37FlagOf;')(()=> ({yes: [], no: ['x']}), (t, id)=> id === 'x' || id === 'a');
  ok(sh2('m', 'x') === 'no' && sh2('m', 'a') === 'yes', 'the owner\'s No beats an admin add; an admin add without a No reads Yes'); }
ok(/ui38Fill\(top, defs, ok, idx, neu, car\)/.test(fn('ui37Split')) && /idx = ui37CarriedIndex\(n, maps\)/.test(fn('ui37Split')), 'the split classifies by Yes only; Carried is not topped up (UI45)');
ok(/flag: ui42Shown\(c\.mapId, c\.id\)/.test(fn('ui38ExportConcepts')) && /ui37Split\(m\.id, defs, ok0\)/.test(fn('ui37ExportRows')), 'exports report unflagged cards as no');
ok(/yes = l=> l\.filter\(p=> ui37FlagOf\(top, p\.id\) === 'yes'\)\.length/.test(fn('ui37HeadHTML')), 'both counters count Yes only');
ok(html.includes('function ui42Shown') && !html.includes('function ui37CarriedPool'), 'index.html carries UI42');
console.log(fail ? 'FAIL ' + fail : 'ok', pass + ' checks'); process.exit(fail ? 1 : 0);
