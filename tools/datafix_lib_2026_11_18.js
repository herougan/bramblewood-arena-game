// Package DATAFIX (2026-11-18): shared helpers for the card edits (budget check + write in the file's own format).
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.join(__dirname, '..');
if (!process.argv.includes('--world=half')) process.argv.push('--world=half');
const SC = require('./card_retune_2026_10_19.js').SC;
const T = SC.make(JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')));
const CARDS = path.join(ROOT, 'canonical', 'cards.json');
const load = () => JSON.parse(fs.readFileSync(CARDS, 'utf8'));
const save = cards => fs.writeFileSync(CARDS, JSON.stringify(cards, null, 2).replace(/[\u007f-￿]/g, ch => '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) + '\n');
const use = c => { const lv = SC.levelOf(c), b1 = T.budget(c, { level: 1 }), bs = lv === 1 ? b1 : T.budget(c, { level: lv }); return { ok: b1.ok && bs.ok, use: +(b1.x1 / b1.N).toFixed(3), S: b1.S }; };
module.exports = { load, save, use, T, SC };
