#!/usr/bin/env node
// Folds the admin's live map card pools back into canonical/map-pools.json (2026-10-22, package MP; 2026-10-22 package DV2: the three tiers).
//
// The Map cards editor (admin) saves a map's pools as a card_overrides row `__cfg:map-pools:<mapId>` (data:
// {kind:'map-pools', mapId, pool:{cards, submaps:{<submapId>:[ids]}, special}}: MAP, one list per SUBMAP, one SPECIAL; rows saved before DV2 have
// the old shape {cards, special, submaps:{<id>:{cards, special}}}, which tools/lib_map_pools.js normalizeEntry reads as the new one, every
// special list merged into the map's one). A row replaces that map's whole entry at load, so the fold is the same: the row's pool becomes
// maps[<mapId>] in the file. Then supabase/proposed/20261022_clear_map_pools.sql clears the rows (the owner applies it; this tool never
// writes the database).
//
//   1. Read the rows (read-only SQL), save them as JSON, e.g. docs/balance/server-overrides/map-pools-dump-<date>.json:
//        select id, data, deleted, updated_at from card_overrides where id like '__cfg:map-pools:%';
//      (either [{id, data, deleted, updated_at}, ...] or {rows: [...]})
//   2. node tools/fold_map_pools.js <dump.json> [--dry]
//   3. rebuild (python3 assemble_arena.py && mv bramblewood-arena.html index.html), commit, then ask the owner to apply the clear SQL.
// A deleted row (the editor's "back to the file") changes nothing. Card ids not in canonical/cards.json are dropped and listed;
// a map id not in the file is an error.
'use strict';
const fs = require('fs'), path = require('path');
const {normalizeEntry, uniq} = require('./lib_map_pools.js');
const ROOT = path.join(__dirname, '..'), FILE = path.join(ROOT, 'canonical', 'map-pools.json'), CARDS = path.join(ROOT, 'canonical', 'cards.json');
// One line per id list, so a diff shows which cards moved (the file is read by people, not just the build).
function serialize(doc){
  const ids = a=> '[' + a.map(x=> JSON.stringify(x)).join(', ') + ']';
  const lines = ['{', ' "_about": ' + JSON.stringify(doc._about) + ',', ' "maps": {'];
  const maps = Object.keys(doc.maps);
  maps.forEach((id, i)=>{
    const m = normalizeEntry(doc.maps[id]), subs = Object.keys(m.submaps), comma = i < maps.length - 1 ? ',' : '';
    lines.push(`  ${JSON.stringify(id)}: {`, `   "cards": ${ids(m.cards)},`);
    if(!subs.length) lines.push('   "submaps": {},');
    else { lines.push('   "submaps": {'); subs.forEach((s, j)=> lines.push(`    ${JSON.stringify(s)}: ${ids(m.submaps[s])}` + (j < subs.length - 1 ? ',' : ''))); lines.push('   },'); }
    lines.push(`   "special": ${ids(m.special)}`, '  }' + comma);
  });
  lines.push(' }', '}', '');
  return lines.join('\n');
}
function fold(doc, rows, known){
  const notes = [], dropped = [];
  const keep = (ids, where)=> uniq(ids).filter(id=>{ if(known && !known.has(id)){ dropped.push(`${where}: ${id}`); return false; } return true; });
  rows.forEach(r=>{
    const m = /^__cfg:map-pools:(.+)$/.exec(r.id || ''); if(!m) return;
    if(r.deleted || !r.data || !r.data.pool){ notes.push(`${m[1]}: deleted row, file kept`); return; }
    if(!doc.maps[m[1]]) throw new Error(`map "${m[1]}" is not in canonical/map-pools.json`);
    const p = normalizeEntry(r.data.pool), was = normalizeEntry(doc.maps[m[1]]), next = {cards: keep(p.cards, m[1] + ' cards'), submaps: {}, special: keep(p.special, m[1] + ' special')};
    const have = Object.keys(was.submaps);
    Object.keys(p.submaps).forEach(s=>{ if(!have.includes(s)) throw new Error(`submap "${s}" is not under "${m[1]}" in the file`); });
    have.forEach(s=>{ next.submaps[s] = keep(p.submaps[s], s + ' cards'); });
    const n = x=> x.length;
    notes.push(`${m[1]}: MAP ${n(was.cards)} -> ${n(next.cards)}` + have.map(s=> `, ${s} ${n(was.submaps[s])} -> ${n(next.submaps[s])}`).join('') + `, SPECIAL ${n(was.special)} -> ${n(next.special)}`);
    doc.maps[m[1]] = next;
  });
  return {doc, notes, dropped};
}
module.exports = {serialize, fold};
if(require.main === module){
  const args = process.argv.slice(2), dry = args.includes('--dry'), dump = args.find(a=> !a.startsWith('--'));
  if(!dump){ console.error('usage: node tools/fold_map_pools.js <dump.json> [--dry]'); process.exit(2); }
  let rows = JSON.parse(fs.readFileSync(dump, 'utf8')); if(rows && !Array.isArray(rows)) rows = rows.rows;
  if(!Array.isArray(rows)) throw new Error('the dump is not a list of rows');
  const doc = JSON.parse(fs.readFileSync(FILE, 'utf8')), known = new Set(JSON.parse(fs.readFileSync(CARDS, 'utf8')).map(c=> c.id));
  const r = fold(doc, rows, known);
  r.notes.forEach(n=> console.log(' ', n)); if(r.dropped.length) console.log('Dropped (not in cards.json):', r.dropped.join(', '));
  if(dry) console.log('(dry run, nothing written)'); else { fs.writeFileSync(FILE, serialize(r.doc)); JSON.parse(fs.readFileSync(FILE, 'utf8')); console.log('Wrote', path.relative(ROOT, FILE)); }
}
