#!/usr/bin/env node
// 2026-11-12 (package BABY1, owner note 11: "Let me mark cards as babies in the card editor. Wherever their source is, they start at level 0."):
// Baby is the card field kind:'baby'; the editor's Kind select stores it; every grant path gives a Baby card Level 0.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..'), R = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  x', m); } };
const app = R('arena_app.js');
const fn = name=>{ const i = app.indexOf('function ' + name + '('); if(i < 0) return ''; const j = app.indexOf('\n}', i); return app.slice(i, j + 2); };

// the field: Baby cards in the file carry kind 'baby'; the editor stores it
const cards = JSON.parse(R('canonical/cards.json')), babies = cards.filter(c=> c.kind === 'baby');
ok(babies.length >= 20, 'canonical/cards.json has the Baby cards (kind baby): ' + babies.length);
ok(/id="fKind"[^`]*value="baby"/.test(app), 'the editor has the Baby option in the Kind select (fKind)');
ok(/getElementById\('fKind'\)[^\n]*c\.kind = 'baby'; else delete c\.kind/.test(app), 'the editor saves kind baby on the card (the override path saves the whole card)');
ok(/BABY1[^\n]*removes|f\.kind === 'baby' && !\('kind' in s\)/.test(R('tools/fold_server_overrides_2026_11_06.js')), 'the fold tool carries an unticked Baby (kind removed) as well as a ticked one');

// Level 0 from every source: cardBaseLevel (used by grantCardCopy, the single grant place) and the faction / tutorial exceptions
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fn('cardBaseLevel') + '\nthis.L = cardBaseLevel;', ctx);
const srcs = [{kind:'map', id:'md', node:'18-2'}, {kind:'pack', tier:3}, {kind:'pack', tier:11}, {kind:'quest'}, {kind:'errand'}, {kind:'base'}, {kind:'shop'}, {kind:'nest'}, {kind:'firstClear'}, undefined];
srcs.forEach(s=>{ ok(ctx.L({id:'x-baby', kind:'baby', rarity:'rare', source:s}) === 0, 'a Baby from source ' + JSON.stringify(s) + ' starts at Level 0');
  ok(ctx.L({id:'x-plain', rarity:'rare', source:s}) === (s && ['quest','errand','base'].includes(s.kind) ? 0 : 1), 'a non-Baby keeps its own start for ' + JSON.stringify(s)); });
ok(ctx.L({id:'x-baby', kind:'baby', faction:'f', rarity:'rare'}) === 0, 'a faction Baby starts at Level 0');
ok(/function grantCardCopy[\s\S]{0,1800}copy\.level = copyBaseLevelOf\(id\)/.test(app), 'grantCardCopy (the one grant place) gives a new copy the card\'s start level');
ok(/grantCardCopy\(id, copyOpts\);[\s\S]{0,700}babyCopyLevel0\(id\)/.test(app), 'unlockCardForPlayer marks a Baby copy Level 0 for every non-tutorial source');
ok(/function tutorialCopyKeepsLevel\(id\)\{[^\n]*isBabyLevelDef\(bd\)\) return false/.test(app), 'a faction reward that is a Baby no longer keeps Level 1 in the tutorial');
ok(/function tutorialMarkLevel0[\s\S]{0,400}c\.level = 0/.test(app), 'tutorial / starter copies are Level 0');
ok(/function hatchEggCopy[\s\S]{0,900}nc\.level = lv/.test(app), 'an egg\'s hatchling keeps the egg\'s level (unchanged)');
ok(!/ticked Baby copies owned/.test(app), 'copies already owned are not touched (no migration)');
console.log(fail ? 'baby1: ' + fail + ' failed' : 'baby1: all passed'); process.exit(fail ? 1 : 0);
