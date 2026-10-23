#!/usr/bin/env node
// Folds the owner's saved Costs-tab edits (the master hub db's "upgradeCosts" documents, read with ArtifactData) into
// canonical/upgrade-costs.json. 2026-10-23 (package HUB2, owner 11:11: "put them in the master hub and let them be editable");
// steps in tools/hub/pull_upgrade_costs.md.
//   node tools/fold_upgrade_costs.js edits.json [--dry-run] [--file other.json]
// edits.json: an array of {path, value} (extra fields ignored), or {docs:[…]} / {items:[…]} / [{data:{…}}] as a listing returns, or the
// whole table pasted from the tab's Copy JSON (an object with forgeStepDust etc.), which is written as it stands after validation.
'use strict';
const fs = require('fs'), path = require('path');
const U = require('./upgrade_costs_lib.js');
const ROOT = path.join(__dirname, '..');
const args = process.argv.slice(2), fi = args.indexOf('--file');
const FILE = fi >= 0 ? path.resolve(args[fi + 1]) : path.join(ROOT, 'canonical', 'upgrade-costs.json');
const src = args.find((a, i)=> !a.startsWith('--') && (fi < 0 || (i !== fi + 1))), DRY = args.includes('--dry-run');
if(!src){ console.log('usage: node tools/fold_upgrade_costs.js edits.json [--dry-run] [--file table.json]'); process.exit(2); }
let raw = JSON.parse(fs.readFileSync(src, 'utf8'));
const table = JSON.parse(fs.readFileSync(FILE, 'utf8'));
let edits;
if(!Array.isArray(raw) && raw && raw.forgeStepDust){ // a whole table
  const mine = U.values(raw); edits = Object.keys(mine).map(p=> ({path: p, value: mine[p]}));
} else {
  if(!Array.isArray(raw)) raw = raw.docs || raw.items || raw.documents || raw.rows || [];
  edits = raw.map(d=> d && (d.data && typeof d.data === 'object' ? d.data : d)).filter(Boolean);
}
const r = U.apply(table, edits);
r.changed.forEach(c=> console.log(`  ${c.path} ${c.from} -> ${c.to}`));
if(r.unknown.length) console.log('Not in the table or not a number >= 0 (not applied):', r.unknown.join(', '));
console.log(`${r.changed.length} change(s) from ${edits.length} edit(s).`);
if(DRY || !r.changed.length) process.exit(0);
fs.writeFileSync(FILE, U.format(r.table));
console.log('Wrote ' + path.relative(ROOT, FILE) + '. Next: python3 assemble_arena.py && mv bramblewood-arena.html index.html; node tests/upgrade-costs-2026-10-23.js');
