#!/usr/bin/env node
// Ship Card Ledger commits (2026-10-11). The ledger's Commit button saves pending commits (commits/<time>, status
// "pending", cards: {id: {c|w|a|h|r: [was, now]}}). Read them out of the ledger into a folder of JSON files, then:
//   node tools/card-ledger/ship.js <folder> [--dry]
// applies every pending commit, oldest first, to canonical/cards.json and lists what changed. A field is skipped when
// the card no longer has the "was" value (someone changed it since), so a stale commit never silently overwrites.
// Afterwards: rebuild, update goldens, run the tests, deploy, and mark each shipped commit's status "shipped".
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const dir = process.argv[2], DRY = process.argv.includes('--dry');
if(!dir){ console.error('usage: ship.js <folder of commit JSON files> [--dry]'); process.exit(2); }
const FIELD = {c:'cost', w:'wait', a:'attack', h:'health', r:'rarity'};
const files = [];
(function walk(d){ fs.readdirSync(d).forEach(f=>{ const p = path.join(d, f); if(fs.statSync(p).isDirectory()) walk(p); else if(f.endsWith('.json')) files.push(p); }); })(dir);
const commits = files.map(f=>{ const j = JSON.parse(fs.readFileSync(f, 'utf8')); return Object.assign({_id: path.basename(f, '.json')}, j.data || j); })
  .filter(c=> c && c.status === 'pending' && c.cards).sort((a, b)=> String(a.at).localeCompare(String(b.at)));
const cardsPath = path.join(ROOT, 'canonical/cards.json');
const cards = JSON.parse(fs.readFileSync(cardsPath, 'utf8')), byId = Object.fromEntries(cards.map(c=> [c.id, c]));
const shipped = [], skipped = [];
for(const cm of commits){
  for(const [id, ch] of Object.entries(cm.cards)){
    const card = byId[id]; if(!card){ skipped.push(`${id}: no such card`); continue; }
    for(const [k, pair] of Object.entries(ch)){
      const f = FIELD[k]; if(!f || !Array.isArray(pair)) continue;
      const [was, now] = pair, cur = card[f] == null ? (f === 'rarity' ? 'common' : 0) : card[f];
      if(String(cur) !== String(was)){ skipped.push(`${id}.${f}: is ${cur}, commit expected ${was}`); continue; }
      card[f] = f === 'rarity' ? String(now) : Number(now);
      shipped.push(`${card.name} (${id}): ${f} ${was} → ${now}`);
    }
  }
}
console.log(`${commits.length} pending commit(s): ${commits.map(c=> c._id).join(', ') || 'none'}`);
shipped.forEach(l=> console.log('  ✓', l)); skipped.forEach(l=> console.log('  – skipped', l));
if(!DRY && shipped.length) fs.writeFileSync(cardsPath, JSON.stringify(cards, null, 2).replace(/[\u007f-\uffff]/g, ch=> '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) + '\n'); // ASCII-escaped, like the file itself
console.log(DRY ? '(dry run, nothing written)' : `wrote ${shipped.length} change(s) to canonical/cards.json`);
