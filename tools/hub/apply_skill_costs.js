#!/usr/bin/env node
// Applies the owner's saved Skill costs edits (the hub db's "skillCosts" documents, read with ArtifactData) to
// canonical/skill-costs.json. 2026-10-18 (owner, 19:54: "Your bramble master hub should let me edit N values of all skills,
// triggers and actions"); see tools/hub/pull_skill_costs.md.
//   node tools/hub/apply_skill_costs.js edits.json [--dry-run]
// edits.json: an array of {kind, id, value} (extra fields ignored), or {docs:[…]} / {items:[…]} / [{data:{…}}] as a listing returns.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..'), FILE = path.join(ROOT, 'canonical', 'skill-costs.json');
const args = process.argv.slice(2), src = args.find(a=> !a.startsWith('--')), DRY = args.includes('--dry-run');
if(!src){ console.log('usage: node tools/hub/apply_skill_costs.js edits.json [--dry-run]'); process.exit(2); }
let raw = JSON.parse(fs.readFileSync(src, 'utf8'));
if(!Array.isArray(raw)) raw = raw.docs || raw.items || raw.documents || raw.rows || [];
const edits = raw.map(d=> d && (d.data && typeof d.data === 'object' ? d.data : d)).filter(Boolean);
const KIND = {skill:'skills', trigger:'triggers', action:'actions', modifier:'modifiers'};
const table = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const changed = [], unknown = [];
edits.forEach(e=>{
  const list = table[KIND[e.kind]], v = Number(e.value);
  if(!list || typeof e.id !== 'string' || !isFinite(v)){ unknown.push(JSON.stringify(e)); return; }
  const entry = list.find(x=> x.id === e.id); if(!entry){ unknown.push(e.kind + ':' + e.id); return; }
  if(entry.value !== v){ changed.push(`${e.kind}:${e.id} ${entry.value} -> ${v}`); entry.value = v; }
});
changed.forEach(c=> console.log('  ' + c));
if(unknown.length) console.log('Not in the table (not applied):', unknown.join(', '));
console.log(`${changed.length} change(s) from ${edits.length} edit(s).`);
if(DRY || !changed.length) process.exit(0);
const fmt = o=> '{\n' + Object.entries(o).map(([k, v])=> ' ' + JSON.stringify(k) + ': ' + (Array.isArray(v) && v.length && typeof v[0] === 'object' ? '[\n' + v.map(x=> '  ' + JSON.stringify(x)).join(',\n') + '\n ]' : JSON.stringify(v))).join(',\n') + '\n}\n';
fs.writeFileSync(FILE, fmt(table));
console.log('Wrote canonical/skill-costs.json. Next: node tools/skill_costs.js --diff');
