#!/usr/bin/env node
// 2026-11-10 (package UI43): Map cards. Owner 09:51: "When its "No", please gray out the card." Owner 09:52: "Thistlewood would have the cards from the
// tutorial map as carried." A tile showing No (flagged No or unflagged) gets ui43-no and a grey card; every card in a tutorial fight's deck is Carried from
// Map 1 on (pill Map 0) and shows on Thistlewood past the side-map filter and the family cap.
'use strict';
const fs = require('fs'), path = require('path');
const rd = f=> fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
let fail = 0, pass = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  x', m); } else pass++; };
const app = rd('arena_app.js'), html = rd('index.html');
const fn = name=>{ const i = app.indexOf('function ' + name + '('); if(i < 0) return ''; const j = app.indexOf('\n}\n', i), k = app.indexOf('\n', i); const e = (app[k - 1] === '}' && (j < 0 || j > k)) ? k : j + 2; return app.slice(i, e); };
// grey
ok(/\$\{fs === 'no' \? ' ui43-no' : ''\}/.test(fn('ui37TileHTML')), 'a tile showing No carries ui43-no');
ok(/\.ui39-tile\.ui43-no > :first-child\{filter:grayscale\(1\)/.test(app), 'the No card is greyed');
// tutorial cards Carried
const CONQUEST_MAPS = [{id: 'mtut', nodes: [{deck: {}}, {deck: {a: 2, b: 1}}, {deck: {b: 2, c: 3}}]}];
const F = new Function('CONQUEST_MAPS', fn('ui43TutorialCards') + fn('ui37CarriedIndex') + '; return {ui43TutorialCards, ui37CarriedIndex};')(CONQUEST_MAPS);
ok(F.ui43TutorialCards().sort().join() === 'a,b,c', 'the tutorial cards are its fight decks');
const maps = [{n: 0, list: ['x'], yes: ['y'], no: []}];
const i1 = F.ui37CarriedIndex(1, maps);
ok(['a', 'b', 'c', 'y'].every(id=> i1.has(id)) && i1.get('a') === 0, 'Thistlewood (Map 1) carries the tutorial cards (pill Map 0) and earlier Yes cards');
ok(F.ui37CarriedIndex(0, maps).size === 0, 'Map 0 carries nothing');
ok(F.ui37CarriedIndex(5, maps).has('c'), 'later maps keep them Carried');
const pros = fn('ui37Prospects');
ok(/if\(n === 1\) ui43TutorialCards\(\)\.forEach\(id=> add\(id, 'tut'\)\)/.test(pros), 'Thistlewood shows them');
ok(/src !== 'tut' && side\.has\(id\)/.test(pros), 'past the side-map filter');
ok(/p\.src\.has\('tut'\)/.test(fn('ui41Cap')), 'past the family cap');
ok(/tut: \(\)=> TX\('tutorial\.tutorial'\)/.test(app), 'pill reads Tutorial (an existing, translated text)');
ok(html.includes('ui43TutorialCards') && html.includes('ui43-no'), 'index.html is rebuilt');
console.log(fail ? `ui43: ${fail} failed, ${pass} passed` : `ok ${pass} checks`); process.exit(fail ? 1 : 0);
