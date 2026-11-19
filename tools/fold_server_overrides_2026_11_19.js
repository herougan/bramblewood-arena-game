#!/usr/bin/env node
// FOLD8 (2026-11-19, owner 21:22: "I am editing the cards ... consider my edits into your own edits"): copy of the 11-16 tool; rows already in the 11-16 dump count as folded.
// FOLD5 (2026-11-16, decision CONTENT11-2 a: "keep the owner's live edits and fold them into cards.json; clearing card_overrides is a live
// write and waits for 'apply it'"): the card_overrides rows saved after the 11-06 fold's dump (all 77 live rows are dated 11-06 14:16 .. 11-13).
// Dump: docs/balance/server-overrides/card-overrides-dump-2026-11-19.json (read-only SQL; game fields, flavour as md5); file history since
// 11-05: file-field-history-2026-11-19.json (python3 tools/server_overrides_history_2026_10_19.py card-overrides-dump-2026-11-19.json
// file-field-history-2026-11-19.json 2026-11-05). Rules are tools/fold_server_overrides_2026_11_06.js's: the owner's value wins unless the
// file changed that field after his save; effects three-way merged; source / unattainable / awaitingSource not folded (echoes of the build);
// flavour by md5 only. A row whose (id, updated_at) was in the 11-06 dump is already folded (none is).
//   node tools/fold_server_overrides_2026_11_19.js plan|apply     plan -> docs/balance/server-overrides/fold-plan-2026-11-19.json
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process'), crypto = require('crypto');
const ROOT = path.join(__dirname, '..'), DIR = path.join(ROOT, 'docs', 'balance', 'server-overrides');
const CARDS_FILE = path.join(ROOT, 'canonical', 'cards.json'), PLAN_FILE = path.join(DIR, 'fold-plan-2026-11-19.json');
const DUMP = JSON.parse(fs.readFileSync(path.join(DIR, 'card-overrides-dump-2026-11-19.json'), 'utf8')).rows;
const HIST = JSON.parse(fs.readFileSync(path.join(DIR, 'file-field-history-2026-11-19.json'), 'utf8'));
const DONE = new Set(JSON.parse(fs.readFileSync(path.join(DIR, 'card-overrides-dump-2026-11-16.json'), 'utf8')).rows.map(r=> r.id + '|' + new Date(String(r.updated_at).replace(' ', 'T').replace(/\+00$/, 'Z')).toISOString()));
const cmd = process.argv[2] || 'plan';
const sortKeys = v=> Array.isArray(v) ? v.map(sortKeys) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map(k=> [k, sortKeys(v[k])])) : v;
const J = v=> JSON.stringify(v), eq = (a, b)=> J(sortKeys(a)) === J(sortKeys(b));
const SKIP = new Set(['id', 'uuid', 'numericId', 'creatorNote', 'art', 'flavorMd5', 'resist', 'metalCost', 'stoneCost']);
const ECHO = new Set(['source', 'unattainable', 'awaitingSource']);
const isDefault = (k, v)=> v == null || (v && typeof v === 'object' && !Array.isArray(v) && !Object.keys(v).length && k !== 'effects') || (v === 0 && !['attack', 'health', 'cost', 'wait'].includes(k)) || v === false || v === '' || v === 'none' || (k === 'dmgType' && v === 'physical') || (Array.isArray(v) && !v.length);
const updOf = row=> new Date(String(row.updated_at).replace(' ', 'T').replace(/\+00$/, 'Z')).toISOString();
const fileNewer = (id, f, upd)=>{ const h = HIST[id + '|' + f]; return !!(h && Date.parse(h.at) > Date.parse(upd)); };
function today(e){ if(!e || typeof e !== 'object') return e; const o = Object.assign({}, e); delete o.resist; if(o.revive === true){ delete o.revive; o.undead = true; } return o; }
const BASE_CACHE = {};
function fileBefore(commit, id){ const k = commit + '~1'; if(!BASE_CACHE[k]) BASE_CACHE[k] = JSON.parse(cp.execFileSync('git', ['-C', ROOT, 'show', k + ':canonical/cards.json'], {maxBuffer: 1 << 30, encoding: 'utf8'}));
  return BASE_CACHE[k].find(c=> c && c.id === id) || null; }
function mergeEffects(base, server, file){ const out = Object.assign({}, file), keys = new Set([...Object.keys(base || {}), ...Object.keys(server || {})]), took = [];
  keys.forEach(k=>{ const b = (base || {})[k], s = (server || {})[k]; if(eq(b, s)) return; if(s === undefined) delete out[k]; else out[k] = s; took.push({key: k, base: b === undefined ? null : b, owner: s === undefined ? null : s}); });
  return {out, took}; }
function foldCard(row, f, id){
  const s = Object.assign({}, row.data), upd = updOf(row); s.effects = today(s.effects || {});
  const out = JSON.parse(JSON.stringify(f)), changes = [], conflicts = [], kept = [], merged = [];
  if(s.flavorMd5 && crypto.createHash('md5').update(f.flavor || '').digest('hex') !== s.flavorMd5) kept.push({field: 'flavor', server: 'md5 ' + s.flavorMd5, file: 'differs (not fetched)'});
  Object.keys(s).forEach(k=>{ if(SKIP.has(k)) return; const sv = s[k], fv = f[k];
    if(eq(sv, fv) || (isDefault(k, sv) && (fv == null || isDefault(k, fv)))) return;
    if(ECHO.has(k)){ kept.push({field: k, server: sv, file: fv === undefined ? null : fv, why: 'echo of the build; the map lists decide'}); return; }
    if(k === 'effects' && fileNewer(id, k, upd)){ const h = HIST[id + '|' + k], base = fileBefore(h.commit, id), m = mergeEffects(today(base && base.effects), sv, today(fv));
      if(!eq(m.out, fv)){ out[k] = m.out; changes.push({field: k, from: fv, to: m.out}); }
      merged.push({field: k, fileAt: h.at, fileCommit: h.commit, server: sv, file: fv, result: m.out, ownerChange: m.took}); return; }
    if(fileNewer(id, k, upd)){ const h = HIST[id + '|' + k]; conflicts.push({field: k, server: sv, file: fv, kept: 'file (changed after the server save)', fileAt: h.at, fileCommit: h.commit}); return; }
    if(isDefault(k, sv) && k !== 'effects'){ delete out[k]; changes.push({field: k, from: fv, to: null}); return; }
    out[k] = sv; changes.push({field: k, from: fv === undefined ? null : fv, to: sv}); });
  // BABY1 (2026-11-12): the editor stores only Baby (kind 'baby'); a row without it is Baby unticked, so the file's kind goes (unless the file changed it later)
  if(f.kind === 'baby' && !('kind' in s) && !fileNewer(id, 'kind', upd)){ delete out.kind; changes.push({field: 'kind', from: 'baby', to: null}); }
  return {out, changes, conflicts, kept, merged, upd};
}
function POST(){}
function plan(){
  const cards = JSON.parse(fs.readFileSync(CARDS_FILE, 'utf8')), by = {}; cards.forEach(c=> c && (by[c.id] = c));
  const done = DUMP.filter(r=> DONE.has(r.id + '|' + updOf(r))).map(r=> ({id: r.id, upd: updOf(r), folded: 'CONTENT12, 2026-11-06'}));
  const rows = DUMP.filter(r=> !DONE.has(r.id + '|' + updOf(r))).map(row=>{ const id = row.id, f = by[id], upd = updOf(row);
    if(!f) throw new Error('not in the file: ' + id);
    const r = foldCard(row, f, id); POST(id, r, f); return {id, name: r.out.name, upd, server: [row.data.attack, row.data.health], fileNow: [f.attack, f.health], now: [r.out.attack, r.out.health], out: r.out, changes: r.changes, conflicts: r.conflicts, kept: r.kept, merged: r.merged}; });
  const P = {_about: 'FOLD5 (2026-11-16, CONTENT11-2 a): the live card_overrides rows of 10-29 .. 11-05 folded into canonical/cards.json (tools/fold_server_overrides_2026_11_19.js). Field rule: the owner\'s value unless the file changed that field after his save; effects three-way merged; source / unattainable not folded.', generated: '2026-11-16', cards: rows.length, alreadyFolded: done,
    rows: rows.map(r=> Object.assign({}, r, {out: undefined, effects: r.out.effects, levelSkills: r.out.levelSkills, rarity: r.out.rarity}))};
  fs.writeFileSync(PLAN_FILE, JSON.stringify(P, null, 1) + '\n'); return {P, rows, cards, by};
}
if(cmd === 'plan'){ const {rows, P} = plan(); rows.forEach(r=> console.log(' ', r.id, 'row', r.server.join('/'), '(file ' + r.fileNow.join('/') + ' -> ' + r.now.join('/') + ')',
  r.changes.map(c=> c.field + ' ' + J(c.from) + '->' + J(c.to)).join('; ') || '-', r.conflicts.map(c=> 'KEPT FILE ' + c.field + ' ' + J(c.file) + ' (owner ' + J(c.server) + ')').join(', '), r.merged.map(m=> 'MERGED ' + J(m.ownerChange)).join(', ')));
  console.log('  already folded:', P.alreadyFolded.map(c=> c.id).join(', ')); }
else if(cmd === 'apply'){
  const {rows, by, cards} = plan(); let changed = 0;
  rows.forEach(r=>{ const out = r.out; if(!r.changes.length) return;
    const note = `2026-11-19 (FOLD8, owner 21:22 "consider my edits"): the owner's live edit of ${r.upd.slice(0, 10)} folded in (${r.changes.map(c=> c.field + ' ' + J(c.to)).join(', ')})${r.conflicts.length ? `; kept the file's newer ${r.conflicts.map(c=> c.field).join(', ')}` : ''}.`;
    out.creatorNote = ((out.creatorNote || '') + ' ' + note).trim();
    Object.keys(by[r.id]).forEach(k=> delete by[r.id][k]); Object.assign(by[r.id], out); changed++; });
  fs.writeFileSync(CARDS_FILE, JSON.stringify(cards, null, 2).replace(/[\u0080-￿]/g, ch=> '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) + '\n');
  console.log('folded', changed, 'of', rows.length, 'card rows');
}
else console.log('usage: node tools/fold_server_overrides_2026_11_19.js plan|apply');
