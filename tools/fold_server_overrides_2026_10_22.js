#!/usr/bin/env node
// The owner's 5 live whole-card edits of 2026-10-21 evening folded into canonical/cards.json (2026-10-22, package BF7). The dump is
// docs/balance/server-overrides/card-overrides-dump-2026-10-22.json (read-only SQL, 08:55); the file's field history since 10-20 is
// file-field-history-2026-10-22.json (python3 tools/server_overrides_history_2026_10_19.py card-overrides-dump-2026-10-22.json
// file-field-history-2026-10-22.json 2026-10-20). Rules: tools/fold_server_overrides_2026_10_21.js's, with two differences:
//   - the server's design choices win (rarity, skills, cost, Wait, name, flavour, the rest); an editor default never replaces a real value;
//     identity stays; the file keeps what the row lacks (barks, speeches, creatorNote, art: the row's art is the card's own built asset).
//   - a field the file changed after the server save keeps the file's value (the conflict is listed), except effects: there the owner's own
//     change (server against the file as it was at his save) is laid over the file's newer effects, key by key (a three-way merge), so
//     neither his edit nor the later package's is lost. effects.resist (the editor's copy of the card's resist list) is not a skill: dropped,
//     the card's own resist list stays.
//   - stats: the owner's A/H as printed (his hand balance; BF7 leaves these five out of the re-fit).
//   - a card the file does not have (Ember Tetra) is added with the row's fields, no source (none is given) and no art.
//   node tools/fold_server_overrides_2026_10_22.js plan|apply     plan -> docs/balance/server-overrides/fold-plan-2026-10-22.json
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.join(__dirname, '..'), DIR = path.join(ROOT, 'docs', 'balance', 'server-overrides');
const CARDS_FILE = path.join(ROOT, 'canonical', 'cards.json'), PLAN_FILE = path.join(DIR, 'fold-plan-2026-10-22.json');
const DUMP = JSON.parse(fs.readFileSync(path.join(DIR, 'card-overrides-dump-2026-10-22.json'), 'utf8')).rows;
const HIST = JSON.parse(fs.readFileSync(path.join(DIR, 'file-field-history-2026-10-22.json'), 'utf8'));
const cmd = process.argv[2] || 'plan';
const sortKeys = v=> Array.isArray(v) ? v.map(sortKeys) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map(k=> [k, sortKeys(v[k])])) : v;
const J = v=> JSON.stringify(v), eq = (a, b)=> J(sortKeys(a)) === J(sortKeys(b));
const SKIP = new Set(['id', 'uuid', 'numericId', 'attack', 'health', 'creatorNote', 'art']);
const isDefault = (k, v)=> v == null || v === 0 || v === false || v === '' || v === 'none' || (k === 'dmgType' && v === 'physical') || (Array.isArray(v) && !v.length);
const updOf = row=> new Date(String(row.updated_at).replace(' ', 'T').replace(/\+00$/, 'Z')).toISOString();
const fileNewer = (id, f, upd)=>{ const h = HIST[id + '|' + f]; return !!(h && Date.parse(h.at) > Date.parse(upd)); };
function migrateWorthy(e){ if(!e || typeof e !== 'object' || e.worthy == null) return e; const o = Object.assign({}, e); o.bounty = Math.max(+o.bounty || 0, +o.worthy || 0); delete o.worthy; return o; }
function serverEffects(e){ e = migrateWorthy(e); if(!e || typeof e !== 'object') return e; const o = Object.assign({}, e); delete o.resist; return o; }
// the file's card as it was just before a later commit changed a field (the owner's base for that field)
const BASE_CACHE = {};
function fileBefore(commit, id){ const k = commit + '~1'; if(!BASE_CACHE[k]) BASE_CACHE[k] = JSON.parse(cp.execFileSync('git', ['-C', ROOT, 'show', k + ':canonical/cards.json'], {maxBuffer: 1 << 30, encoding: 'utf8'}));
  return BASE_CACHE[k].find(c=> c && c.id === id) || null; }
// three-way merge of effects: the owner's change (base -> server) laid over the file's newer effects, key by key
function mergeEffects(base, server, file){ const out = Object.assign({}, file), keys = new Set([...Object.keys(base || {}), ...Object.keys(server || {})]), took = [];
  keys.forEach(k=>{ const b = (base || {})[k], s = (server || {})[k]; if(eq(b, s)) return; if(s === undefined) delete out[k]; else out[k] = s; took.push({key: k, base: b === undefined ? null : b, owner: s === undefined ? null : s}); });
  return {out, took}; }
function foldCard(row, f){
  const s = Object.assign({}, row.data), upd = updOf(row); s.effects = serverEffects(s.effects);
  const out = JSON.parse(JSON.stringify(f)), changes = [], conflicts = [], kept = [], merged = [];
  Object.keys(s).forEach(k=>{ if(SKIP.has(k)) return; const sv = s[k], fv = f[k]; if(eq(sv, fv)) return;
    if(isDefault(k, sv)){ if(fv != null && !isDefault(k, fv)) kept.push({field: k, server: sv, file: fv}); return; }
    if(fileNewer(row.id, k, upd)){ const h = HIST[row.id + '|' + k];
      if(k === 'effects'){ const base = fileBefore(h.commit, row.id), m = mergeEffects(base && base.effects, sv, fv);
        if(!eq(m.out, fv)){ out[k] = m.out; changes.push({field: k, from: fv, to: m.out}); }
        merged.push({field: k, fileAt: h.at, fileCommit: h.commit, base: base && base.effects, server: sv, file: fv, result: m.out, ownerChange: m.took}); return; }
      conflicts.push({field: k, server: sv, file: fv, kept: 'file (changed after the server save)', fileAt: h.at, fileCommit: h.commit}); return; }
    out[k] = sv; changes.push({field: k, from: fv === undefined ? null : fv, to: sv}); });
  return {out, changes, conflicts, kept, merged, upd};
}
// a card the file does not have: the row's fields without the editor's defaults (locked stays: every card carries it)
function newCard(row){ const s = Object.assign({}, row.data), out = {}; s.effects = serverEffects(s.effects);
  Object.keys(s).forEach(k=>{ const v = s[k]; if(k === 'creatorNote' || k === 'art') return; if(k !== 'locked' && k !== 'attack' && k !== 'health' && isDefault(k, v) && !['id', 'cost', 'wait'].includes(k)) return; out[k] = v; });
  return out; }
function plan(){
  const cards = JSON.parse(fs.readFileSync(CARDS_FILE, 'utf8')), by = {}; cards.forEach(c=> by[c.id] = c);
  const rows = DUMP.filter(r=> !r.id.startsWith('__cfg:') && !r.deleted).map(row=>{ const f = by[row.id], upd = updOf(row);
    if(!f){ const out = newCard(row); return {id: row.id, name: out.name, upd, isNew: true, server: [row.data.attack, row.data.health], out, noSource: !out.source, noArt: !out.art}; }
    const r = foldCard(row, f); return {id: row.id, name: r.out.name, upd, server: [row.data.attack, row.data.health], fileNow: [f.attack, f.health], out: r.out, changes: r.changes, conflicts: r.conflicts, kept: r.kept, merged: r.merged}; });
  const P = {_about: 'BF7 (2026-10-22): the owner\'s 5 live whole-card edits of 10-21 evening folded into canonical/cards.json (tools/fold_server_overrides_2026_10_22.js). Stats as he printed them; effects three-way merged where the file changed them later.', generated: '2026-10-22', cards: rows.length,
    rows: rows.map(r=> Object.assign({}, r, {out: undefined, effects: r.out.effects, rarity: r.out.rarity, wait: r.out.wait || 0, cost: r.out.cost || 0}))};
  fs.writeFileSync(PLAN_FILE, JSON.stringify(P, null, 1) + '\n'); return {P, rows, cards, by};
}
if(cmd === 'plan'){ const {rows} = plan(); rows.forEach(r=> console.log(' ', r.id, r.isNew ? 'NEW' : '', 'stats', r.server.join('/'), r.fileNow ? '(file ' + r.fileNow.join('/') + ')' : '', 'effects', J(r.out.effects),
  (r.changes || []).map(c=> c.field).join(',') || '-', (r.conflicts || []).map(c=> 'CONFLICT ' + c.field + ' kept file').join(', '), (r.merged || []).map(m=> 'MERGED ' + m.field + ' ' + J(m.ownerChange)).join(', '))); }
else if(cmd === 'apply'){
  const {rows, cards, by} = plan();
  rows.forEach(r=>{ const out = r.out; out.attack = r.server[0]; out.health = r.server[1];
    const note = r.isNew ? `2026-10-22 (BF7): the owner's live card of ${r.upd.slice(0, 10)} folded in as a new card (${r.server.join('/')}); no source given, so none set; no art yet.`
      : `2026-10-22 (BF7): the owner's live edit of ${r.upd.slice(0, 10)} folded in (${r.server.join('/')}; the file had ${r.fileNow.join('/')})${(r.merged || []).map(m=> m.ownerChange.length ? `; effects merged with the file's later change (${m.fileCommit}): his ${m.ownerChange.map(t=> t.key + ' ' + J(t.owner)).join(', ')} on top of the file's` : `; his row left the effects as they were at his save, so the file's later change (${m.fileCommit}) stands`).join('')}${(r.conflicts || []).length ? `; kept the file's newer ${r.conflicts.map(c=> c.field).join(', ')}` : ''}; his hand balance, left out of the BF7 re-fit.`;
    out.creatorNote = ((out.creatorNote || '') + ' ' + note).trim();
    if(r.isNew){ if(by[r.id]) throw new Error('already in the file: ' + r.id); cards.push(out); }
    else { Object.keys(by[r.id]).forEach(k=> delete by[r.id][k]); Object.assign(by[r.id], out); } });
  fs.writeFileSync(CARDS_FILE, JSON.stringify(cards, null, 2).replace(/[\u0080-￿]/g, ch=> '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) + '\n');
  console.log('folded', rows.length, 'cards');
}
else console.log('usage: node tools/fold_server_overrides_2026_10_22.js plan|apply');
