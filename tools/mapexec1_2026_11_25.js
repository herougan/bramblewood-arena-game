#!/usr/bin/env node
// 2026-11-25 (package MAPEXEC1, owner 00:22: "Create recommendations based on the skill recommendation in design in the master hub and execute those recommendations"):
// applies Claude's swaps (canonical/map-swap-suggestions.json, from tools/mapswap1_suggest.js) to canonical/map-pools.json, with the overrides below, and writes the same
// changes as supabase/proposed/mapexec1-2026-11-25.sql (the owner's `__cfg:map-picks:<mapId>` rows; NOT run). Passes: node tools/mapexec1_2026_11_25.js; python3 assemble_arena.py && mv bramblewood-arena.html index.html;
// node tools/hub/map_skill_table.js; node tools/mapswap1_suggest.js; repeat until the swaps file shows nothing to apply (a moved card can surface a To remove on its other lists).
// The ops it applied are kept in docs/design/mapexec1-ops-2026-11-25.json (the SQL and the file notes are written from that list, so a rerun changes nothing).
'use strict';
const fs = require('fs'), path = require('path');
const {normalizeEntry} = require('./lib_map_pools.js'), {serialize} = require('./fold_map_pools.js');
const ROOT = path.join(__dirname, '..'), POOLS = path.join(ROOT, 'canonical', 'map-pools.json'), SW = path.join(ROOT, 'canonical', 'map-swap-suggestions.json'), OPS = path.join(ROOT, 'docs', 'design', 'mapexec1-ops-2026-11-25.json');
const MAPS = ['m1', 'mf', 'mb', 'mc', 'm2', 'mw', 'm8', 'mu', 'm4', 'mk', 'm7', 'm10', 'mh', 'mr', 'm5', 'ml', 'mt', 'm6', 'md', 'm3', 'm11', 'm21', 'm22', 'm23', 'm24']; // map number -> id
// the To remove carriers that stay (KEEPS in tools/mapswap1_suggest.js) come back from the generator as kind 'keep' and are never applied
const MANUAL = [ // [kind, mapId, card, to, why]
  ['move', 'mc', 'pika-hoarder', 'm2', 'Delivery is in Map 4\'s table row (not Map 3\'s): the carrier moves to the map whose row has the skill, so Delivery is New! on Map 4 with two carriers'],
  ['drop', 'mf', 'puddle-skimmer', null, 'no row has Rainrunner; the owner\'s Yes picks already leave it off Map 1 and Map 2'],
  ['drop', 'mb', 'puddle-skimmer', null, 'no row has Rainrunner; the card is also on Map 2 and the owner\'s Yes picks already leave it off both lists'],
  ['drop', 'm8', 'water-shrew', null, 'Evasive is in Map 8\'s row; the shrew leaves Maps 4 and 6 so Evasive is New! on Map 8 first'] ];
const doc = JSON.parse(fs.readFileSync(POOLS, 'utf8')), sw = JSON.parse(fs.readFileSync(SW, 'utf8')), ops = fs.existsSync(OPS) ? JSON.parse(fs.readFileSync(OPS, 'utf8')) : [];
{ const keeps = new Set(sw.maps.flatMap(m => m.remove.filter(r => r.kind === 'keep').map(r => m.id + ':' + r.card))); for (let i = ops.length - 1; i >= 0; i--) if (ops[i].kind !== 'add' && keeps.has(ops[i].map + ':' + ops[i].card)) ops.splice(i, 1); } // a carrier the generator keeps on purpose is never moved or dropped (run mapswap1_suggest.js first)
const have = (k, m, c, t) => ops.some(o => o.kind === k && o.map === m && o.card === c && (o.to || null) === (t || null));
const push = (kind, map, card, to, why, pass) => { if (kind === 'drop' && ops.some(o => o.kind === 'move' && o.map === map && o.card === card)) return; if (!have(kind, map, card, to)) ops.push({kind, map, card, to: to || null, why, date: '2026-11-25', pass}); };
const pass = (ops.reduce((a, o) => Math.max(a, o.pass || 0), 0)) + 1;
if (!ops.length) MANUAL.forEach(([k, m, c, t, w]) => push(k, m, c, t, w, 0));
sw.maps.forEach(m => {
  m.add.forEach(a => a.cards.filter(c => !/awaiting placement/.test(c.why)).slice(0, a.have ? 1 : 2).forEach(c => { if (!(doc.maps[m.id].cards || []).includes(c.id)) push('add', m.id, c.id, null, a.skill + ' is in Map ' + m.n + '\'s table row (' + (a.have ? 'one' : 'no') + ' carrier on the list): ' + c.why, pass); }));
  m.remove.forEach(r => { if (r.kind === 'keep' || r.kind === 'stuck') return;
    push(r.kind, m.id, r.card, r.kind === 'move' ? MAPS[r.to] : null, r.skill + ': ' + r.why, pass); });
});
// apply
const log = [];
ops.forEach(o => { const e = normalizeEntry(doc.maps[o.map]), had = e.cards.includes(o.card);
  if (o.kind === 'add') { if (!had) e.cards.push(o.card); }
  else { e.cards = e.cards.filter(x => x !== o.card);
    if (o.kind === 'move') { const t = normalizeEntry(doc.maps[o.to]); if (!t.cards.includes(o.card)) t.cards.push(o.card); doc.maps[o.to] = t; } }
  doc.maps[o.map] = e; });
const notes = ops.map(o => `${o.date} MAPEXEC1 ${o.kind} ${o.card} ${o.kind === 'add' ? 'on ' + o.map : o.kind === 'move' ? 'from ' + o.map + ' to ' + o.to : 'off ' + o.map}: ${o.why}`);
let txt = serialize(doc); const i = txt.indexOf('\n "maps"'); txt = txt.slice(0, i) + '\n "_changes": [' + notes.map(n => '\n  ' + JSON.stringify(n)).join(',') + '\n ],' + txt.slice(i);
JSON.parse(txt); fs.writeFileSync(POOLS, txt); fs.writeFileSync(OPS, JSON.stringify(ops, null, 1) + '\n');
// SQL for the owner's picks rows (one UPDATE per row; idempotent: the card is removed from yes / no first, then put on the right side)
const PICK = new Set(['m1','m2','m3','m4','m5','m6','m7','m8','m9','m10','m11','m21','m23','mb','mc','md','mf','mh','mk','ml','mr','mt','mu','mw']); // rows read 2026-11-25 (docs/balance/server-overrides/map-picks-dump-2026-11-25.json); m22 / m24 have none
const by = {}; ops.forEach(o => { const flag = (m, c, f) => { if (!PICK.has(m)) return; (by[m] = by[m] || []).push({c, f, why: `${o.kind} ${o.card} ${o.kind === 'add' ? 'on' : o.kind === 'move' ? 'from ' + o.map + ' to ' + o.to + (m === o.map ? ' (source)' : ' (destination)') : 'off'} ${m}: ${o.why}`}); };
  if (o.kind === 'add') flag(o.map, o.card, 'yes'); else { flag(o.map, o.card, 'no'); if (o.kind === 'move') flag(o.to, o.card, 'yes'); } });
const q = s => "'" + s.replace(/'/g, "''") + "'";
const sql = ['-- MAPEXEC1 (2026-11-25, owner 00:22): the same changes as canonical/map-pools.json, on the owner\'s Yes / No picks rows. NOT RUN: wait for "apply it".', '-- Idempotent: each statement takes the card out of yes and no, then puts it on the side named. Order inside a row follows the list below; read back with the SELECT at the end.', 'BEGIN;'];
Object.keys(by).sort().forEach(m => { const seen = {}; by[m].forEach(x => { seen[x.c] = x; }); // last decision per card wins
  const list = Object.values(seen);
  list.forEach(x => sql.push(`-- ${x.why}`));
  // build the update with two array rebuilds: yes = (yes minus all touched) + the Yes cards; no = (no minus all touched) + the No cards
  const touched = list.map(x => q(x.c)).join(', '), yes = list.filter(x => x.f === 'yes').map(x => q(x.c)), no = list.filter(x => x.f === 'no').map(x => q(x.c));
  const arr = (k, add) => `coalesce((select jsonb_agg(v) from jsonb_array_elements(coalesce(data->'${k}', '[]'::jsonb)) v where v #>> '{}' not in (${touched})), '[]'::jsonb)` + (add.length ? ` || jsonb_build_array(${add.join(', ')})` : '');
  sql.push(`update card_overrides set data = jsonb_set(jsonb_set(data, '{yes}', ${arr('yes', yes)}), '{no}', ${arr('no', no)}), updated_at = now() where id = '__cfg:map-picks:${m}' and deleted = false;`);
});
sql.push('COMMIT;', '', '-- read back', "select id, jsonb_array_length(data->'yes') as yes_n, jsonb_array_length(data->'no') as no_n, updated_at from card_overrides where id like '\\_\\_cfg:map-picks:%' and deleted = false order by id;");
fs.mkdirSync(path.join(ROOT, 'supabase', 'proposed'), {recursive: true}); fs.writeFileSync(path.join(ROOT, 'supabase', 'proposed', 'mapexec1-2026-11-25.sql'), sql.join('\n') + '\n');
console.log('pass', pass, 'ops', ops.length, ops.filter(o => o.pass === pass).length, 'new this pass');
