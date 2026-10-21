#!/usr/bin/env node
// Folds the admin's live map card pools back into canonical/map-pools.json (2026-10-22, package MP).
//
// The Map cards editor (admin) saves a map's pools as a card_overrides row `__cfg:map-pools:<mapId>` (data:
// {kind:'map-pools', mapId, pool:{cards, special, submaps:{<submapId>:{cards, special}}}}). A row replaces that map's whole entry at
// load, so the fold is the same: the row's pool becomes maps[<mapId>] in the file. Then supabase/proposed/20261022_clear_map_pools.sql
// clears the rows (the owner applies it; this tool never writes the database).
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
const ROOT = path.join(__dirname, '..'), FILE = path.join(ROOT, 'canonical', 'map-pools.json'), CARDS = path.join(ROOT, 'canonical', 'cards.json');
// One line per id list, so a diff shows which cards moved (the file is read by people, not just the build).
function serialize(doc){
  const ids = a=> '[' + a.map(x=> JSON.stringify(x)).join(', ') + ']';
  const lines = ['{', ' "_about": ' + JSON.stringify(doc._about) + ',', ' "maps": {'];
  const maps = Object.keys(doc.maps);
  maps.forEach((id, i)=>{
    const m = doc.maps[id], subs = Object.keys(m.submaps || {}), comma = i < maps.length - 1 ? ',' : '';
    if(!subs.length){ lines.push(`  ${JSON.stringify(id)}: {"cards": ${ids(m.cards)}, "special": ${ids(m.special)}, "submaps": {}}${comma}`); return; }
    lines.push(`  ${JSON.stringify(id)}: {"cards": ${ids(m.cards)}, "special": ${ids(m.special)}, "submaps": {`);
    subs.forEach((s, j)=> lines.push(`   ${JSON.stringify(s)}: {"cards": ${ids(m.submaps[s].cards)}, "special": ${ids(m.submaps[s].special)}}` + (j < subs.length - 1 ? ',' : '')));
    lines.push('  }}' + comma);
  });
  lines.push(' }', '}', '');
  return lines.join('\n');
}
const uniq = a=> [...new Set((Array.isArray(a) ? a : []).filter(x=> typeof x === 'string' && x))];
function fold(doc, rows, known){
  const notes = [], dropped = [];
  const keep = (ids, where)=> uniq(ids).filter(id=>{ if(known && !known.has(id)){ dropped.push(`${where}: ${id}`); return false; } return true; });
  rows.forEach(r=>{
    const m = /^__cfg:map-pools:(.+)$/.exec(r.id || ''); if(!m) return;
    if(r.deleted || !r.data || !r.data.pool){ notes.push(`${m[1]}: deleted row, file kept`); return; }
    if(!doc.maps[m[1]]) throw new Error(`map "${m[1]}" is not in canonical/map-pools.json`);
    const p = r.data.pool, next = {cards: keep(p.cards, m[1] + ' cards'), special: keep(p.special, m[1] + ' special'), submaps: {}};
    const have = Object.keys(doc.maps[m[1]].submaps || {});
    Object.keys(p.submaps || {}).forEach(s=>{ if(!have.includes(s)) throw new Error(`submap "${s}" is not under "${m[1]}" in the file`); });
    have.forEach(s=>{ const q = (p.submaps || {})[s] || {}; next.submaps[s] = {cards: keep(q.cards, s + ' cards'), special: keep(q.special, s + ' special')}; });
    const was = doc.maps[m[1]], n = x=> x.cards.length + '+' + x.special.length;
    notes.push(`${m[1]}: ${n(was)} -> ${n(next)}` + have.map(s=> `, ${s} ${n(was.submaps[s])} -> ${n(next.submaps[s])}`).join(''));
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
