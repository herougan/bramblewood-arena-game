#!/usr/bin/env node
// The owner's later live edits folded into the file (2026-10-21, package BF5; owner: the 13 card edits of 10-19 / 10-20 are "relative
// tweaks for Maps 0-4"; fold them, then halve them in proportion like everything else). Same rules as BF4's
// tools/fold_server_overrides_2026_10_19.js:
//   - the server's design choices win (rarity, skills, cost, Wait, name, flavour, the rest), unless the file changed that field after
//     the server save (tools/server_overrides_history_2026_10_19.py card-overrides-dump-2026-10-21.json file-field-history-2026-10-21.json):
//     then the file's newer value stays and the conflict is listed. An editor default never replaces a real value. Identity stays.
//   - the game's own load rules: Worthy -> Bounty; an art path to the card's own built asset keeps the file's art; a spawn of the
//     editor's copy id ("ant-scout~cp4", a card in your collection at Lv 4, not a card id) spawns the card itself.
//   - stats: the owner's A/H are taken as they are (full size, like the rest of the file before BF5); tools/halve_2026_10_19.js then
//     re-derives them under the halved N with every other card (its note: "2026-10-19 halve (BF5): was A/H").
//   - the node edits (__cfg:map-nodes:m1 / mf / mb) are laid over CONQUEST_MAPS the way the game applies them; the tutorial config
//     (__cfg:tutorial) goes into TUTORIAL_CFG_DEFAULT after its starter spread (the game's Object.assign(TUTORIAL_CFG_DEFAULT, cfg));
//     the raid (__cfg:raid:goliath) into canonical/raids.json where it differs (RB2's brambles and elders are the server's too).
//   node tools/fold_server_overrides_2026_10_21.js plan|apply|doc
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), DIR = path.join(ROOT, 'docs', 'balance', 'server-overrides');
const CARDS_FILE = path.join(ROOT, 'canonical', 'cards.json'), APP = path.join(ROOT, 'arena_app.js'), RAIDS_FILE = path.join(ROOT, 'canonical', 'raids.json');
const DUMP = JSON.parse(fs.readFileSync(path.join(DIR, 'card-overrides-dump-2026-10-21.json'), 'utf8')).rows;
const HIST = JSON.parse(fs.readFileSync(path.join(DIR, 'file-field-history-2026-10-21.json'), 'utf8'));
const PLAN_FILE = path.join(DIR, 'fold-plan-2026-10-21.json');
const NODE_ROWS = ['__cfg:map-nodes:m1', '__cfg:map-nodes:mf', '__cfg:map-nodes:mb'];
const cmd = process.argv[2] || 'plan';
const sortKeys = v=> Array.isArray(v) ? v.map(sortKeys) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map(k=> [k, sortKeys(v[k])])) : v;
const J = v=> JSON.stringify(v), eq = (a, b)=> J(sortKeys(a)) === J(sortKeys(b));
const SKIP = new Set(['id', 'uuid', 'numericId', 'attack', 'health', 'creatorNote', 'art']);
const isDefault = (k, v)=> v == null || v === 0 || v === false || v === '' || v === 'none' || (k === 'dmgType' && v === 'physical') || (Array.isArray(v) && !v.length);
const fileNewer = (id, f, upd)=>{ const h = HIST[id + '|' + f]; return !!(h && Date.parse(h.at) > Date.parse(upd)); };
function migrateWorthy(e){ if(!e || typeof e !== 'object' || e.worthy == null) return e; const o = Object.assign({}, e); o.bounty = Math.max(+o.bounty || 0, +o.worthy || 0); delete o.worthy; return o; }
function plainCopyIds(e, notes){ if(!e || !Array.isArray(e.triggers)) return e; return Object.assign({}, e, {triggers: e.triggers.map(t=>{ if(typeof t.defId === 'string' && /~cp\d+$/.test(t.defId)){ const to = t.defId.replace(/~cp\d+$/, ''); notes.push(`${t.defId} -> ${to} (the editor's copy id: a card in a collection at a level, not a card id)`); return Object.assign({}, t, {defId: to}); } return t; })}); }

function foldCard(row, f){
  const notes = [], s = Object.assign({}, row.data); s.effects = plainCopyIds(migrateWorthy(s.effects), notes);
  const out = JSON.parse(JSON.stringify(f)), changes = [], conflicts = [], kept = [];
  Object.keys(s).forEach(k=>{ if(SKIP.has(k)) return; const sv = s[k], fv = f[k]; if(eq(sv, fv)) return;
    if(isDefault(k, sv)){ if(fv != null && !isDefault(k, fv)) kept.push({field: k, server: sv, file: fv}); return; }
    if(fileNewer(row.id, k, row.upd)){ conflicts.push({field: k, server: sv, file: fv, kept: 'file (changed after the server save)', fileAt: HIST[row.id + '|' + k].at}); return; }
    out[k] = sv; changes.push({field: k, from: fv === undefined ? null : fv, to: sv}); });
  if(fileNewer(row.id, 'art', row.upd)) conflicts.push({field: 'art', server: '(its own built asset)', file: '(a newer portrait)', kept: 'file', fileAt: HIST[row.id + '|art'].at});
  return {out, changes, conflicts, kept, notes, server: s};
}
const BF5_NOTE = / ?2026-10-19 halve \(BF5\): was [^.]*\./;
const preBF5 = c=>{ const m = /2026-10-19 halve \(BF5\): was (\d+|-)\/(\d+|-)/.exec(c.creatorNote || ''); return m ? [m[1] === '-' ? null : +m[1], m[2] === '-' ? null : +m[2]] : [c.attack, c.health]; };
function plan(){
  const cards = JSON.parse(fs.readFileSync(CARDS_FILE, 'utf8')), by = {}; cards.forEach(c=> by[c.id] = c);
  const rows = DUMP.filter(r=> !r.id.startsWith('__cfg:') && !r.deleted).map(row=>{ const f = by[row.id]; if(!f) throw new Error('not in cards.json: ' + row.id);
    const r = foldCard(row, f); return {id: row.id, name: r.out.name, upd: row.upd, server: [row.data.attack, row.data.health], filePre: preBF5(f), fileNow: [f.attack, f.health], rarity: r.out.rarity, wait: r.out.wait || 0, cost: r.out.cost || 0, effects: r.out.effects, changes: r.changes, conflicts: r.conflicts, kept: r.kept, notes: r.notes}; });
  const nodes = []; NODE_ROWS.forEach(rid=>{ const r = DUMP.find(x=> x.id === rid); if(!r) throw new Error('no row ' + rid); const p = r.data.edits.patches || {};
    if((r.data.edits.added || []).length) throw new Error(rid + ' adds nodes'); Object.keys(p).forEach(k=> nodes.push({row: rid, map: r.data.mapId, key: k, upd: r.upd, patch: p[k]})); });
  const out = {_about: 'BF5 (2026-10-21): the owner\'s later live edits (card_overrides after BF4\'s clear) folded into the file; the cards\' stats are re-derived by tools/halve_2026_10_19.js', generated: '2026-10-21', cards: rows.length, rows, nodes};
  fs.writeFileSync(PLAN_FILE, JSON.stringify(out, null, 1) + '\n'); return out;
}
const ident = k=> /^[A-Za-z_$][\w$]*$/.test(k) ? k : J(k), lit = o=> '{ ' + Object.keys(o).map(k=> `${ident(k)}:${J(o[k])}`).join(', ') + ' }';
function foldNodes(src, nodes){ const done = [];
  nodes.forEach(nd=>{ const re = new RegExp(`^(\\s*)(\\{ ?key:"${nd.key.replace(/[-]/g, '\\-')}",[^\\n]*\\})(,?)\\s*$`, 'm'), mm = re.exec(src); if(!mm) throw new Error('node line not found: ' + nd.key);
    const cur = new Function('return (' + mm[2] + ');')(), next = Object.assign({}, cur), patch = Object.assign({}, nd.patch), ignored = [];
    if('armour' in patch){ ignored.push('armour ' + J(patch.armour)); delete patch.armour; }
    Object.keys(patch).forEach(k=>{ if(patch[k] === null) delete next[k]; else next[k] = patch[k]; });
    const diff = Object.keys(Object.assign({}, cur, next)).filter(k=> !eq(cur[k], next[k])).map(k=> ({field: k, from: cur[k] === undefined ? null : cur[k], to: next[k] === undefined ? null : next[k]}));
    src = src.slice(0, mm.index) + mm[1] + lit(next) + mm[3] + src.slice(mm.index + mm[0].length); done.push({map: nd.map, key: nd.key, upd: nd.upd, diff, ignored}); });
  return {src, done}; }
// the tutorial: the server's cfg keys that differ from TUTORIAL_CFG_DEFAULT go into its literal, after the starter spread
function foldTutorial(src){
  const LB = require('./lib_bramble.js'), DEF = new Function(LB.grab('TUTORIAL_SEED') + '\n' + LB.grab('STARTER_CFG_DEFAULT') + '\n' + LB.grab('TUTORIAL_CFG_DEFAULT') + '\nreturn TUTORIAL_CFG_DEFAULT;')();
  const cfg = DUMP.find(r=> r.id === '__cfg:tutorial').data.cfg, diff = Object.keys(cfg).filter(k=> !eq(DEF[k], cfg[k]));
  const m = /^const TUTORIAL_CFG_DEFAULT = \{\.\.\.STARTER_CFG_DEFAULT, myHp:(\d+), rivalHp:(\d+),([^\n]*)\};$/m.exec(src); if(!m) throw new Error('TUTORIAL_CFG_DEFAULT line');
  let rest = m[3]; const extra = diff.filter(k=> !['myHp', 'rivalHp'].includes(k) && !new RegExp(`\\b${k}:`).test(rest));
  diff.filter(k=> new RegExp(`\\b${k}:`).test(rest)).forEach(k=>{ rest = rest.replace(new RegExp(`\\b${k}:(null|\\{\\}|\\[[^\\]]*\\]|\\{[^{}]*\\}|'[^']*'|\\d+)`), `${k}:${J(cfg[k])}`); });
  const line = `const TUTORIAL_CFG_DEFAULT = {...STARTER_CFG_DEFAULT, myHp:${diff.includes('myHp') ? cfg.myHp : m[1]}, rivalHp:${diff.includes('rivalHp') ? cfg.rivalHp : m[2]},${rest}${extra.map(k=> `, ${k}:${J(cfg[k])}`).join('')}}; // 2026-10-21 (BF5): the owner's live tutorial (10-20) folded in`;
  return {src: src.slice(0, m.index) + line + src.slice(m.index + m[0].length), diff: diff.map(k=> ({field: k, from: DEF[k] === undefined ? null : DEF[k], to: cfg[k]}))}; }
function foldRaid(){
  const raids = JSON.parse(fs.readFileSync(RAIDS_FILE, 'utf8')), R = raids.find(r=> r.id === 'goliath'), S = DUMP.find(r=> r.id === '__cfg:raid:goliath').data.def, out = [];
  // live / scaleV / roundsV are the editor's markers, illusory 0.67 its rounding of 0.667, the art its built path: not design
  if(S.rewards && S.rewards.shards != null && (R.rewards || {}).shards == null){ R.rewards = Object.assign({}, R.rewards, {shards: S.rewards.shards}); out.push({field: 'rewards.shards', from: null, to: S.rewards.shards}); }
  fs.writeFileSync(RAIDS_FILE, JSON.stringify(raids, null, 2) + "\n"); return out; } // the file keeps its 2-space layout
if(cmd === 'plan'){ const P = plan(); console.log(P.cards, 'cards,', P.nodes.length, 'node patches'); P.rows.forEach(r=> console.log(' ', r.id, 'server', r.server.join('/'), 'file before BF5', r.filePre.join('/'), r.changes.map(c=> c.field).join(',') || '-', r.conflicts.map(c=> 'CONFLICT ' + c.field).join(','), r.notes.join('; '))); }
else if(cmd === 'apply'){
  const P = plan(), cards = JSON.parse(fs.readFileSync(CARDS_FILE, 'utf8')), by = {}; cards.forEach(c=> by[c.id] = c);
  P.rows.forEach(r=>{ const row = DUMP.find(x=> x.id === r.id), {out} = foldCard(row, by[r.id]);
    out.attack = r.server[0]; out.health = r.server[1];
    out.creatorNote = ((out.creatorNote || '').replace(BF5_NOTE, '').trim() + ` 2026-10-21 (BF5): the owner's live edit of ${r.upd.slice(0, 10)} folded in (${r.server.join('/')}; the file had ${r.filePre.join('/')} before the halving).`).trim();
    Object.keys(by[r.id]).forEach(k=> delete by[r.id][k]); Object.assign(by[r.id], out); });
  fs.writeFileSync(CARDS_FILE, JSON.stringify(cards, null, 2).replace(/[\u0080-￿]/g, ch=> '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) + '\n');
  let src = fs.readFileSync(APP, 'utf8'); const n = foldNodes(src, P.nodes); src = n.src; const t = foldTutorial(src); src = t.src; fs.writeFileSync(APP, src);
  P.nodesDone = n.done; P.tutorial = t.diff; P.raid = foldRaid(); fs.writeFileSync(PLAN_FILE, JSON.stringify(P, null, 1) + '\n');
  console.log('folded', P.rows.length, 'cards,', n.done.length, 'node patches, tutorial', t.diff.length, 'keys, raid', P.raid.length);
}
else if(cmd === 'sql'){
  const P = JSON.parse(fs.readFileSync(PLAN_FILE, 'utf8')), ids = P.rows.map(r=> r.id), cfg = NODE_ROWS.concat(['__cfg:tutorial', '__cfg:raid:goliath']), q = s=> "'" + s.replace(/'/g, "''") + "'";
  const sql = ['-- 2026-10-21 (package BF5) PROPOSED, NOT APPLIED. The owner must approve before this runs against the live database.',
    '-- The owner\'s later live edits (after BF4\'s clear), folded into the file (docs/balance/halve-2026-10-19.md, "The owner\'s 13 edits"):',
    '-- 13 card rows, the map-node rows of Map 0, Hedgerow (Map 1) and the Shallows (Map 2), the tutorial config and the Goliath.',
    '-- Same shape as supabase/migrations/20261019_clear_folded_overrides.sql (BF4):',
    '--   card rows: an empty patch ({"__patch": true}: the file\'s card), NOT deleted = true (that is the editor\'s tombstone: it removes the card);',
    '--   __cfg rows: data null, deleted true (the editor\'s "drop every edit"; the game falls back to the file\'s map / tutorial / raid);',
    '--   every old row kept in deleted_snapshot and in a backup table; updated_at moves so open games pick it up on their next poll.',
    '-- NOTE the halved values (BF5) live in the file only: nothing server-side carries a stat or a bramble Health once these rows are cleared.',
    'begin;', '',
    'create table if not exists public.card_overrides_backup_20261021 as select * from public.card_overrides where false;',
    'insert into public.card_overrides_backup_20261021', '  select * from public.card_overrides where id in (', '    ' + ids.concat(cfg).map(q).join(',\n    '), '  );', '',
    'update public.card_overrides', '   set deleted_snapshot = data,', "       data = '{\"__patch\": true}'::jsonb,", '       deleted = false,', '       updated_at = now()',
    ' where id in (', '    ' + ids.map(q).join(',\n    '), '  )', '   and deleted = false;', '',
    'update public.card_overrides', '   set deleted_snapshot = data,', '       data = null,', '       deleted = true,', '       updated_at = now()',
    ` where id in (${cfg.map(q).join(', ')})`, '   and deleted = false;', '',
    `-- expect ${ids.length} and ${cfg.length} rows; roll back if not`,
    "select count(*) filter (where data = '{\"__patch\": true}'::jsonb) as cards_cleared, count(*) filter (where id like '__cfg:%' and deleted) as cfg_cleared",
    '  from public.card_overrides where id in (', '    ' + ids.concat(cfg).map(q).join(',\n    '), '  );', '', 'commit;', ''];
  fs.writeFileSync(path.join(ROOT, 'supabase', 'proposed', '20261021_clear_folded_overrides_2.sql'), sql.join('\n')); console.log('wrote supabase/proposed/20261021_clear_folded_overrides_2.sql');
}
