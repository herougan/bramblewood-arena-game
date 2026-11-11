#!/usr/bin/env node
// 2026-11-12 (package SKIR3): LISTFIX3's road-deck tool (tools/listfix3/decks_2026_11_11.js: swap / fitapply / pro) on the owner's 11-12 lists, with
// SKIR3's record folder (docs/balance/skir3), dated comments and file names; the rules are LISTFIX3's / SKIR1's unchanged. fitapply here also takes a
// fit's Shield move (SKIR3's brief: deck and Shield moves), as SKIR1's own apply did.
//   node tools/skir3/decks_2026_11_12.js swap [--apply] | fitapply --dir fit [--codes a,b] | pro [--apply]
'use strict';
const fs = require('fs'), path = require('path'), Module = require('module');
const file = path.resolve(__dirname, '..', 'listfix3', 'decks_2026_11_11.js');
let src = fs.readFileSync(file, 'utf8');
const rep = (from, to, all) => { if (!src.includes(from)) throw new Error('decks_2026_11_11.js changed: ' + from); src = all ? src.split(from).join(to) : src.replace(from, to); };
rep("path.join(ROOT, 'docs', 'balance', 'listfix3')", "path.join(ROOT, 'docs', 'balance', 'skir3')");
rep("swaps-2026-11-11.json", "swaps-2026-11-12.json");
rep("pro-swaps-2026-11-11.json", "pro-swaps-2026-11-12.json");
rep("/* 2026-11-11 (LISTFIX3): ${bad.map(id => f.pool.includes(id) ? id + ' (now one of a two-card family)' : id + (D[id] && D[id].kind === 'baby' ? ' (a Baby card, no longer an admin add)' : ' (cut, off the list again)')).join(', ')}",
  "/* 2026-11-12 (SKIR3): ${bad.map(id => f.pool.includes(id) ? id + ' (now one of a two-card family)' : id + ' (off the 11-12 list)').join(', ')}");
rep("/* 2026-11-11 (LISTFIX3 fit)", "/* 2026-11-12 (SKIR3 fit)");
// a Shield move is applied (SKIR1's fit picks it with the deck); the comment names it
rep("if (x.pick.shield != null) { console.log('skip', x.code, '(a Shield move: road retunes are deck swaps only; re-fit with tools/listfix3/fit_decks_only_2026_11_11.js)'); continue; }",
  "if (x.pick.shield != null) { line = /shieldOverride:\\s*-?\\d+/.test(line) ? line.replace(/shieldOverride:\\s*-?\\d+/, 'shieldOverride:' + x.pick.shield) : line.replace(/(\\{ ?key:\\s*\"[^\"]+\",)/, '$1 shieldOverride:' + x.pick.shield + ','); what.push('Shield ' + x.pick.shield); }");
rep("const deck = sorted(x.pick.deck), what = [];", "const deck = sorted(x.pick.deck);");
rep("let line = mm[1];", "let line = mm[1]; const what = [];");
rep("x.listfix3 = `2026-11-11 (LISTFIX3): ${moves.map(v => v.cut + ' x' + v.copies).join(', ')} not allowed here once the cut cards left the lists Claude had put them on (out of play, or not held by this map), swapped for the map list's nearest (Lumber, Wait, 2A+H); not re-searched`;",
  "x.skir3 = `2026-11-12 (SKIR3): ${moves.map(v => v.cut + ' x' + v.copies).join(', ')} not allowed here on the owner's 11-12 lists, swapped for the map list's nearest (Lumber, Wait, 2A+H); not re-searched`;");
rep("const B2 = require('../opt/bpro2_2026_10_31.js'), CUT = new Set([].concat(...Object.values(require('./lists_2026_11_11.js').REMOVE).map(o => Object.keys(o))));",
  "const B2 = require('../opt/bpro2_2026_10_31.js'), CUT = new Set(JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'skir3', 'lists-2026-11-12.json'), 'utf8')).leftLists);");
const mod = new Module(file, module); mod.filename = file; mod.paths = Module._nodeModulePaths(path.dirname(file));
mod._compile(src, file);
