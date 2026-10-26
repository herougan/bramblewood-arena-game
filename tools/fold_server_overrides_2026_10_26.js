#!/usr/bin/env node
// The owner's live card edits still on the server folded into canonical/cards.json (2026-10-26, package CONTENT3, action item OVR:
// "card_overrides holds 144 rows on the live database ... Fold them into canonical/cards.json with the fold tools, then clear").
// The dump is docs/balance/server-overrides/card-overrides-dump-2026-10-26.json (read-only SQL, 10-26); the file's field history since
// 10-20 is file-field-history-2026-10-26.json (python3 tools/server_overrides_history_2026_10_19.py card-overrides-dump-2026-10-26.json
// file-field-history-2026-10-26.json 2026-10-20). Rules: tools/fold_server_overrides_2026_10_22.js's, with these differences:
//   - stats follow the same field rule as everything else: the owner's A/H win unless the file changed attack / health after his save
//     (the later re-fits and road passes stand; the conflict is listed). BF7 printed his stats as given; five of his 10-21 rows are
//     BF7's, and the file has moved on since.
//   - Revive -> Undead (ENG9, 2026-10-26): a row saved before ENG9 that carries the old passive `revive: true` means Undead now; the
//     merge reads base, server and file in today's words, so an owner who removed Revive removes Undead.
//   - junk-suffixed ids from the editor get their clean id (ember-tetra-3caj -> ember-tetra, as RW5; phoenix-mushrooms-u248 ->
//     phoenix-mushrooms, listed in arena_app.js CARD_ID_RENAMED so the live row is skipped). A new card is appended with
//     awaitingSource: true (docs/workflows/card-data.md) and, for the Phoenix Mushrooms, the Fungi type the owner asked for (G9:
//     "There's no Funghi type (Phoenix Mushroom)").
//   - the two config rows (__cfg:map-nodes:m2, __cfg:tutorial) are NOT folded: both undo later file work (PRO3 / BAL3 road decks,
//     TT2's eased tutorial), so they are owner calls (docs/decisions.json OVR-1, OVR-2). Map layouts stay alone (BF4, BF5).
//   node tools/fold_server_overrides_2026_10_26.js plan|apply     plan -> docs/balance/server-overrides/fold-plan-2026-10-26.json
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.join(__dirname, '..'), DIR = path.join(ROOT, 'docs', 'balance', 'server-overrides');
const CARDS_FILE = path.join(ROOT, 'canonical', 'cards.json'), PLAN_FILE = path.join(DIR, 'fold-plan-2026-10-26.json');
const DUMP = JSON.parse(fs.readFileSync(path.join(DIR, 'card-overrides-dump-2026-10-26.json'), 'utf8')).rows;
const HIST = JSON.parse(fs.readFileSync(path.join(DIR, 'file-field-history-2026-10-26.json'), 'utf8'));
// the five 10-21 rows BF7 folded on 10-22 (same row, same updated_at): done; every later file change to them stands (e.g. the Glacial
// Ape-King's Bounty went with BAL2-4, the Ember Tetra was re-fitted to Map 4 by EN4)
const BF7 = new Set(JSON.parse(fs.readFileSync(path.join(DIR, 'card-overrides-dump-2026-10-22.json'), 'utf8')).rows.map(r=> r.id + '|' + r.updated_at));
const RENAME = {'ember-tetra-3caj': 'ember-tetra', 'phoenix-mushrooms-u248': 'phoenix-mushrooms'};
const cmd = process.argv[2] || 'plan';
const sortKeys = v=> Array.isArray(v) ? v.map(sortKeys) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map(k=> [k, sortKeys(v[k])])) : v;
const J = v=> JSON.stringify(v), eq = (a, b)=> J(sortKeys(a)) === J(sortKeys(b));
const SKIP = new Set(['id', 'uuid', 'numericId', 'creatorNote', 'art']);
const isDefault = (k, v)=> v == null || (v && typeof v === 'object' && !Array.isArray(v) && !Object.keys(v).length) || (v === 0 && k !== 'attack' && k !== 'health') || v === false || v === '' || v === 'none' || (k === 'dmgType' && v === 'physical') || (Array.isArray(v) && !v.length);
const updOf = row=> new Date(String(row.updated_at).replace(' ', 'T').replace(/\+00$/, 'Z')).toISOString();
const fileNewer = (id, f, upd)=>{ const h = HIST[id + '|' + f]; return !!(h && Date.parse(h.at) > Date.parse(upd)); };
function migrateWorthy(e){ if(!e || typeof e !== 'object' || e.worthy == null) return e; const o = Object.assign({}, e); o.bounty = Math.max(+o.bounty || 0, +o.worthy || 0); delete o.worthy; return o; }
// today's words: Worthy -> Bounty, the old passive Revive -> Undead (ENG9); effects.resist is the editor's copy of the card's resist list
function today(e){ e = migrateWorthy(e); if(!e || typeof e !== 'object') return e; const o = Object.assign({}, e); delete o.resist;
  if(o.revive === true){ delete o.revive; o.undead = true; } return o; }
const BASE_CACHE = {};
function fileBefore(commit, id){ const k = commit + '~1'; if(!BASE_CACHE[k]) BASE_CACHE[k] = JSON.parse(cp.execFileSync('git', ['-C', ROOT, 'show', k + ':canonical/cards.json'], {maxBuffer: 1 << 30, encoding: 'utf8'}));
  return BASE_CACHE[k].find(c=> c && c.id === id) || null; }
function mergeEffects(base, server, file){ const out = Object.assign({}, file), keys = new Set([...Object.keys(base || {}), ...Object.keys(server || {})]), took = [];
  keys.forEach(k=>{ const b = (base || {})[k], s = (server || {})[k]; if(eq(b, s)) return; if(s === undefined) delete out[k]; else out[k] = s; took.push({key: k, base: b === undefined ? null : b, owner: s === undefined ? null : s}); });
  return {out, took}; }
function foldCard(row, f, id){
  const s = Object.assign({}, row.data), upd = updOf(row); s.effects = today(s.effects);
  const out = JSON.parse(JSON.stringify(f)), changes = [], conflicts = [], kept = [], merged = [];
  Object.keys(s).forEach(k=>{ if(SKIP.has(k)) return; const sv = s[k], fv = f[k]; if(eq(sv, fv)) return;
    if(isDefault(k, sv)){ if(fv != null && !isDefault(k, fv)) kept.push({field: k, server: sv, file: fv}); return; }
    if(k === 'effects' && fileNewer(id, k, upd)){ const h = HIST[id + '|' + k], base = fileBefore(h.commit, id), m = mergeEffects(today(base && base.effects), sv, today(fv));
      if(!eq(m.out, fv)){ out[k] = m.out; changes.push({field: k, from: fv, to: m.out}); }
      merged.push({field: k, fileAt: h.at, fileCommit: h.commit, server: sv, file: fv, result: m.out, ownerChange: m.took}); return; }
    if(fileNewer(id, k, upd)){ const h = HIST[id + '|' + k]; conflicts.push({field: k, server: sv, file: fv, kept: 'file (changed after the server save)', fileAt: h.at, fileCommit: h.commit}); return; }
    // a key the file doesn't track in its history (unattainable, basicSet ...) and the row only echoes: leave the file's
    if(f[k] === undefined && !['attack', 'health', 'effects', 'rarity', 'cost', 'wait', 'name', 'flavor', 'species', 'archetypes', 'stoneCost', 'faction', 'locked', 'dmgType'].includes(k)){ kept.push({field: k, server: sv, file: null}); return; }
    out[k] = sv; changes.push({field: k, from: fv === undefined ? null : fv, to: sv}); });
  return {out, changes, conflicts, kept, merged, upd};
}
function newCard(row, id){ const s = Object.assign({}, row.data), out = {}; s.effects = today(s.effects);
  Object.keys(s).forEach(k=>{ const v = s[k]; if(['creatorNote', 'art', 'uuid', 'test', 'token', 'tags', 'exileCost', 'graceCost', 'metalCost', 'devilryCost', 'splashEffect', 'mechanicLine', 'resist', 'dmgType', 'flavor'].includes(k)) return; if(k !== 'locked' && k !== 'attack' && k !== 'health' && isDefault(k, v) && !['cost', 'wait'].includes(k)) return; out[k] = v; });
  out.id = id; out.uuid = s.uuid;
  if(id === 'phoenix-mushrooms'){ out.species = ['Fungi']; out.archetypes = ['Fungi']; out.subtype = 'fungus'; out.animal = 'mushroom'; }
  out.awaitingSource = true;
  return out; }
function plan(){
  const cards = JSON.parse(fs.readFileSync(CARDS_FILE, 'utf8')), by = {}; cards.forEach(c=> c && (by[c.id] = c));
  const cfg = DUMP.filter(r=> r.id.startsWith('__cfg:')).map(r=> ({id: r.id, upd: updOf(r), folded: false, why: r.id === '__cfg:tutorial' ? 'owner call OVR-2: the row (rival Health 12, the part-1 Ducklings and Minnows) undoes TT2\'s eased part 1' : 'owner call OVR-1: the row adds Oxbow (whales and a kraken) after 4-5, makes 4-5 an elite and brings back 10-21 decks for 4-2 / 4-5 that BAL3 and PRO3 retuned'}));
  const done = DUMP.filter(r=> BF7.has(r.id + '|' + r.updated_at)).map(r=> ({id: RENAME[r.id] || r.id, rowId: r.id, upd: updOf(r), folded: 'BF7, 2026-10-22'}));
  const rows = DUMP.filter(r=> !r.id.startsWith('__cfg:') && !r.deleted && !BF7.has(r.id + '|' + r.updated_at)).map(row=>{ const id = RENAME[row.id] || row.id, f = by[id], upd = updOf(row);
    if(!f){ const out = newCard(row, id); return {id, rowId: row.id, name: out.name, upd, isNew: true, server: [row.data.attack, row.data.health], out}; }
    const r = foldCard(row, f, id); return {id, rowId: row.id, name: r.out.name, upd, server: [row.data.attack, row.data.health], fileNow: [f.attack, f.health], now: [r.out.attack, r.out.health], out: r.out, changes: r.changes, conflicts: r.conflicts, kept: r.kept, merged: r.merged}; });
  const P = {_about: 'CONTENT3 / OVR (2026-10-26): the live card_overrides rows with data folded into canonical/cards.json (tools/fold_server_overrides_2026_10_26.js). Field rule: the owner\'s value unless the file changed that field after his save; effects three-way merged.', generated: '2026-10-26', cards: rows.length, alreadyFolded: done, cfg,
    rows: rows.map(r=> Object.assign({}, r, {out: undefined, effects: r.out.effects, rarity: r.out.rarity}))};
  fs.writeFileSync(PLAN_FILE, JSON.stringify(P, null, 1) + '\n'); return {P, rows, cards, by};
}
if(cmd === 'plan'){ const {rows, P} = plan(); rows.forEach(r=> console.log(' ', r.id, r.isNew ? 'NEW' : '', 'row', r.server.join('/'), r.fileNow ? '(file ' + r.fileNow.join('/') + ' -> ' + r.now.join('/') + ')' : '',
  (r.changes || []).map(c=> c.field + ' ' + J(c.from) + '->' + J(c.to)).join('; ') || '-', (r.conflicts || []).map(c=> 'KEPT FILE ' + c.field).join(', '), (r.merged || []).map(m=> 'MERGED ' + J(m.ownerChange)).join(', ')));
  P.alreadyFolded.forEach(c=> console.log('  done', c.id, 'folded by', c.folded));
  P.cfg.forEach(c=> console.log('  cfg', c.id, 'not folded:', c.why)); }
else if(cmd === 'apply'){
  const {rows, cards, by} = plan(); let changed = 0;
  rows.forEach(r=>{ const out = r.out;
    if(r.isNew){ if(by[r.id]) throw new Error('already in the file: ' + r.id);
      out.creatorNote = `2026-10-26 (CONTENT3, OVR): the owner's live card of ${r.upd.slice(0, 10)} folded in as a new card (${r.server.join('/')}; id was ${r.rowId}); no source given, so awaitingSource; no art yet; Revive read as Undead (ENG9), the Fungi type (G9).`;
      cards.push(out); changed++; return; }
    if(!(r.changes || []).length) return;
    const note = `2026-10-26 (CONTENT3, OVR): the owner's live edit of ${r.upd.slice(0, 10)} folded in (${r.changes.map(c=> c.field === 'effects' ? 'effects ' + J(c.to) : c.field + ' ' + J(c.to)).join(', ')})${(r.conflicts || []).length ? `; kept the file's newer ${r.conflicts.map(c=> c.field).join(', ')}` : ''}.`;
    out.creatorNote = ((out.creatorNote || '') + ' ' + note).trim();
    Object.keys(by[r.id]).forEach(k=> delete by[r.id][k]); Object.assign(by[r.id], out); changed++; });
  fs.writeFileSync(CARDS_FILE, JSON.stringify(cards, null, 2).replace(/[\u0080-￿]/g, ch=> '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) + '\n');
  console.log('folded', changed, 'of', rows.length, 'card rows');
}
else console.log('usage: node tools/fold_server_overrides_2026_10_26.js plan|apply');
