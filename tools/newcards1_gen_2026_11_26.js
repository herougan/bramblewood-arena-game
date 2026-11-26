#!/usr/bin/env node
// 2026-11-26 (package NEWCARDS1): the LVL10 generator skips awaitingSource / unattainable cards (no skill unlocks), so run it on the 14 new cards
// with those two flags lifted, then put the flags back. Only the 14 cards change. Needs: node tools/newcards1_gen_2026_11_26.js [--dry]
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.join(__dirname, '..'), FILE = path.join(ROOT, 'canonical', 'cards.json');
const ids = JSON.parse(fs.readFileSync(path.join(__dirname, 'newcards1_2026_11_26.json'), 'utf8')).map(s=> s.id);
const save = (c)=> fs.writeFileSync(FILE, JSON.stringify(c, null, 2).replace(/[\u007f-￿]/g, ch=> '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) + '\n');
let cards = JSON.parse(fs.readFileSync(FILE, 'utf8')); cards.filter(c=> ids.includes(c.id)).forEach(c=>{ delete c.awaitingSource; delete c.unattainable; }); save(cards);
try { ids.forEach(id=> process.stdout.write(cp.execFileSync('node', [path.join(ROOT, 'tools/lvl10/gen_2026_11_18.js'), '--card', id].concat(process.argv.slice(2)), {env: Object.assign({}, process.env, (JSON.parse(fs.readFileSync(path.join(__dirname, 'newcards1_2026_11_26.json'), 'utf8')).find(s=> s.id === id).core ? {CARDVET_CORE: JSON.parse(fs.readFileSync(path.join(__dirname, 'newcards1_2026_11_26.json'), 'utf8')).find(s=> s.id === id).core} : {}))}).toString().split('\n')[0].slice(0, 300) + '\n')); }
finally { cards = JSON.parse(fs.readFileSync(FILE, 'utf8')); cards.filter(c=> ids.includes(c.id)).forEach(c=>{ c.awaitingSource = true; c.unattainable = true; }); save(cards); }
