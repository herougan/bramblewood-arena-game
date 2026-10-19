#!/usr/bin/env node
// The live server's card overrides folded into the file (2026-10-19, package BF4; owner 19:34: "can i check that every card has ran
// through ur budget limitation? even the mythics and divines need to be balanced first pass this way").
//
// The live Supabase table card_overrides holds 72 cards saved from the in-game card editor (10-11 to 10-18). The game lays each one
// OVER canonical/cards.json (a whole-card row replaces the file's card), so on the live site those cards were the server's version,
// not the BF3 retune: the four Dragons among them, Mythic / Divine / Ancient there. A read-only dump of the table (coordinator,
// 19:37) is docs/balance/server-overrides/card-overrides-dump-2026-10-19.json. This tool:
//   1. folds each card's server version into cards.json. The game's own load rules first (cloudCardData: Worthy -> Bounty; an art
//      path that is just the card's own built asset keeps the file's art). Then field by field:
//        - the server's design choices win (rarity, skills, cost, Wait, name, art, the rest), unless the file changed that field
//          AFTER the server save (tools/server_overrides_history_2026_10_19.py: the commit time of the file's last change against
//          the row's updated_at): then the file's newer value stays and the conflict is listed. Skills merge key by key: the
//          server's skills, plus any skill the file added after the save (listed).
//        - an editor default the server row carries (0 / null / "" / [] / "none" / "physical", empty speeches, locked false) never
//          replaces a real value in the file, and is not written where the file has none.
//        - identity (id, uuid, numericId) and the file's own fields (animal, subtype, barks, creatureRank, source when newer ...) stay.
//   2. re-derives the stats from the server's A/H with the BF3 retune rules (tools/card_retune_2026_10_19.js: budget v5, L/10 +
//      0.2 x Map, <= inclusive; within = over 60% of N and inside both rules; well under -> 65% of N; over -> fitted down; the
//      shape kept), at the card's real rarity (Mythic 10, Ancient 11, Divine 12 on the budget's ladder, Legendary 9).
//      creatorNote: "2026-10-19 retune (server override folded): was A/H <rarity>" (the BF3 "v5 L/10" note on these cards goes:
//      its "was" was the file's stats, not the live ones).
//   3. folds the owner's Map 0 and Tutorial node edits (card_overrides __cfg:map-nodes:m1 and :mtut, 10-18) into CONQUEST_MAPS in
//      arena_app.js the way the game applies them (Object.assign of the patch; node.armour is ignored by the game since 10-18).
//
//   node tools/fold_server_overrides_2026_10_19.js plan    -> docs/balance/server-overrides/fold-plan-2026-10-19.json (+ summary)
//   node tools/fold_server_overrides_2026_10_19.js apply   -> canonical/cards.json, arena_app.js (CONQUEST_MAPS m1 / mtut nodes)
//   node tools/fold_server_overrides_2026_10_19.js doc     -> docs/balance/server-overrides-fold-2026-10-19.md and
//                                                            supabase/migrations/20261019_clear_folded_overrides.sql (NOT applied)
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), DIR = path.join(ROOT, 'docs', 'balance', 'server-overrides');
const R = require('./card_retune_2026_10_19.js');
const CARDS_FILE = path.join(ROOT, 'canonical', 'cards.json'), APP = path.join(ROOT, 'arena_app.js');
const DUMP = JSON.parse(fs.readFileSync(path.join(DIR, 'card-overrides-dump-2026-10-19.json'), 'utf8'));
const HIST = JSON.parse(fs.readFileSync(path.join(DIR, 'file-field-history-2026-10-19.json'), 'utf8'));
const PLAN_FILE = path.join(DIR, 'fold-plan-2026-10-19.json');
const NODE_ROWS = {'__cfg:map-nodes:m1': ['0-1', '0-2', '0-3', '0-4'], '__cfg:map-nodes:mtut': ['tutorial', 'tutorial2']};
const cmd = process.argv[2] || 'plan';
const CARD_RENAME = {'bee-knight-classic': 'bee-knight'};
const J = v=> JSON.stringify(v), eq = (a, b)=> J(sortKeys(a)) === J(sortKeys(b));
function sortKeys(v){ if(Array.isArray(v)) return v.map(sortKeys); if(v && typeof v === 'object'){ const o = {}; Object.keys(v).sort().forEach(k=> o[k] = sortKeys(v[k])); return o; } return v; }
const r2 = v=> Math.round(v * 100) / 100;
const SKIP = new Set(['id', 'uuid', 'numericId', 'attack', 'health', 'creatorNote']);
const emptySpeeches = v=> v && typeof v === 'object' && !Array.isArray(v) && Object.values(v).every(a=> Array.isArray(a) && a.every(s=> !s));
const isDefault = (k, v)=> v == null || v === 0 || v === false || v === '' || v === 'none' || (k === 'dmgType' && v === 'physical') || (Array.isArray(v) && !v.length) || (k === 'speeches' && emptySpeeches(v));
// the game's load rules (arena_app.js cloudCardData): Worthy -> Bounty; an art path that is the card's own built asset keeps the file's art
function migrateWorthy(e){ if(!e || typeof e !== 'object' || e.worthy == null) return e; const o = Object.assign({}, e); o.bounty = Math.max(+o.bounty || 0, +o.worthy || 0); delete o.worthy; return o; }
// the game's node-key migration for a saved source (cloudCardData: migrateNodeKey, e.g. Hedgerow's old f-1 is 1-1)
const LB = require('./lib_bramble.js'), migrateNodeKey = new Function(LB.grab('LEGACY_NODE_KEYS') + '\n' + LB.grab('migrateNodeKey') + '\nreturn migrateNodeKey;')();
const migrateSource = s=> s && s.kind === 'map' && typeof s.node === 'string' ? Object.assign({}, s, {node: migrateNodeKey(s.id, s.node)}) : s;
const ownAsset = (id, art)=>{ const m = /^assets\/cards\/([^/?.]+)\.(png|webp|jpe?g)(\?|$)/.exec(art || ''); return !!(m && m[1] === id); };
const fileNewer = (id, f, upd)=>{ const h = HIST[id + '|' + f]; return !!(h && Date.parse(h.at) > Date.parse(upd)); };
const histAt = (id, f)=> (HIST[id + '|' + f] || {}).at || null;
const BF3_NOTE = / ?2026-10-19 retune \(v5 L\/10\): was \d+\/\d+ \([^)]*\)\./;

function budgetOf(c, A, H){ const k = R.check(c, A, H); return {N: k.b1.N, S: k.b1.S, x1: r2(k.b1.x1), x2: r2(k.b1.x2), N2: r2(k.b1.N2), ratio: r2(k.b1.x1 / k.b1.N), ratio2: r2(k.b1.x2 / k.b1.N2), ok: k.ok}; }

function foldCard(row, f){
  const s = Object.assign({}, row.data); s.effects = migrateWorthy(s.effects); if(s.source) s.source = migrateSource(s.source);
  // the editor keeps a copy of the card's resistances in effects.resist (the engine reads both lists, arena_app's heat-proof check only
  // the card's own): one list, the card's resist, so nothing is lost and the budget doesn't cost a "resist" skill twice
  if(s.effects && Array.isArray(s.effects.resist)){ const e = Object.assign({}, s.effects), rs = e.resist; delete e.resist; s.effects = e;
    s.resist = [...new Set([...(Array.isArray(f.resist) ? f.resist : []), ...(Array.isArray(s.resist) ? s.resist : []), ...rs])]; }
  const out = JSON.parse(JSON.stringify(f)), changes = [], conflicts = [], kept = [];
  Object.keys(s).forEach(k=>{
    if(SKIP.has(k)) return; const sv = s[k], fv = f[k];
    if(k === 'art'){ if(!sv || ownAsset(row.id, sv) || sv === fv) return; // the game keeps the file's art for its own asset path; '' is the editor's empty
      if(fileNewer(row.id, 'art', row.upd)){ conflicts.push({field: k, server: '(uploaded image)', file: '(newer file art)', kept: 'file', fileAt: histAt(row.id, k)}); return; }
      out.art = sv; changes.push({field: 'art', from: '(file art)', to: '(the owner\'s uploaded image, ' + sv.length + ' chars)'}); return; }
    if(k === 'effects'){
      const se = sv || {}, fe = fv || {};
      if(eq(se, fe)) return;
      const merged = Object.assign({}, se), added = [];
      if(fileNewer(row.id, 'effects', row.upd)) Object.keys(fe).forEach(x=>{ if(!(x in se)){ merged[x] = fe[x]; added.push(x); } });
      const dropped = Object.keys(fe).filter(x=> !(x in merged)), gained = Object.keys(se).filter(x=> !(x in fe)), moved = Object.keys(se).filter(x=> x in fe && !eq(se[x], fe[x]));
      out.effects = merged;
      changes.push({field: 'effects', from: fe, to: merged, gained, dropped, moved});
      if(added.length) conflicts.push({field: 'effects', server: se, file: fe, kept: 'both: the server\'s skills, plus ' + added.join(', ') + ' (the file added after the save)', fileAt: histAt(row.id, k)});
      else if(fileNewer(row.id, 'effects', row.upd)) conflicts.push({field: 'effects', server: se, file: fe, kept: 'server (the file\'s newer change is compatible: ' + (dropped.length ? 'dropped ' + dropped.join(', ') : 'no skill of its own') + ')', fileAt: histAt(row.id, k)});
      return; }
    if(eq(sv, fv)) return;
    if(isDefault(k, sv)){ if(fv != null && !isDefault(k, fv)) kept.push({field: k, server: sv, file: fv, why: 'an editor default on the server row; the file\'s value stays'}); return; }
    if(fileNewer(row.id, k, row.upd)){ conflicts.push({field: k, server: sv, file: fv, kept: 'file (changed after the server save)', fileAt: histAt(row.id, k)}); return; }
    out[k] = sv; changes.push({field: k, from: fv === undefined ? null : fv, to: sv});
  });
  return {out, changes, conflicts, kept, server: s};
}

function plan(){
  const cards = JSON.parse(fs.readFileSync(CARDS_FILE, 'utf8')), by = {}; cards.forEach(c=> by[c.id] = c);
  const rows = DUMP.filter(r=> !r.id.startsWith('__cfg:') && !r.deleted), res = [];
  rows.forEach(row=>{
    const f = by[row.id]; if(!f) throw new Error('not in cards.json: ' + row.id);
    const {out, changes, conflicts, kept, server} = foldCard(row, f);
    const A0 = +server.attack || 0, H0 = +server.health || 0;
    const raw = Object.assign({}, row.data, {effects: migrateWorthy(row.data.effects)}); // the live card exactly (its effects.resist copy too)
    const bServer = budgetOf(Object.assign({}, f, raw), A0, H0);
    const folded = Object.assign({}, out, {attack: A0, health: H0});
    const p = R.live(folded) ? R.plan(folded) : {verdict: 'not measured'};
    const now = p.now || [A0, H0], bNow = budgetOf(folded, now[0], now[1]);
    res.push({id: row.id, name: out.name, upd: row.upd, rarity: out.rarity, serverRarity: server.rarity, fileRarity: f.rarity,
      file: [f.attack, f.health], server: [A0, H0], now, verdict: p.verdict, why: p.why || null,
      budgetServer: bServer, budgetNow: bNow, changes, conflicts, kept});
  });
  // the node edits
  const nodes = [];
  Object.entries(NODE_ROWS).forEach(([rid, keys])=>{ const r = DUMP.find(x=> x.id === rid); if(!r) throw new Error('no row ' + rid);
    const p = r.data.edits.patches || {}; keys.forEach(k=>{ if(!p[k]) throw new Error(rid + ' has no patch ' + k); nodes.push({row: rid, map: r.data.mapId, key: k, upd: r.upd, patch: p[k]}); });
    const extra = Object.keys(p).filter(k=> !keys.includes(k)), added = (r.data.edits.added || []).length;
    if(extra.length || added) throw new Error(rid + ' holds more than the folded edits: ' + extra.join(',') + (added ? ' + added nodes' : '')); });
  const by2 = v=> res.filter(r=> r.verdict === v).length;
  const out = {_about: 'BF4 (2026-10-19): the live server card overrides folded into canonical/cards.json and run through the BF3 retune rules (budget v5, L/10 + 0.2 x Map, inclusive). server = the live card (its stats); now = the folded, retuned stats.',
    generated: '2026-10-19', cards: res.length, within: by2('within'), raised: by2('under'), fitted: by2('over'), owner: by2('owner'),
    overBefore: res.filter(r=> !r.budgetServer.ok).map(r=> ({id: r.id, ratio: r.budgetServer.ratio, ratio2: r.budgetServer.ratio2})),
    overAfter: res.filter(r=> !r.budgetNow.ok).map(r=> ({id: r.id, ratio: r.budgetNow.ratio, ratio2: r.budgetNow.ratio2})),
    conflicts: res.reduce((t, r)=> t + r.conflicts.length, 0), rows: res, nodes};
  fs.writeFileSync(PLAN_FILE, JSON.stringify(out, null, 1) + '\n');
  console.log(`${res.length} cards: ${out.within} within as the server had them, ${out.raised} raised, ${out.fitted} fitted down, ${out.owner} owner calls; ${out.conflicts} conflicts`);
  console.log('over budget before (live):', out.overBefore.map(r=> `${r.id} ${r.ratio}x`).join(', '));
  console.log('over budget after:', out.overAfter.map(r=> `${r.id} ${r.ratio}x`).join(', ') || 'none');
  res.filter(r=> /dragon/.test(r.id)).forEach(r=> console.log(' ', r.id, r.rarity, r.server.join('/'), '->', r.now.join('/'), 'N', r.budgetNow.N, r.budgetNow.ratio + 'x'));
  return out;
}

// ---- CONQUEST_MAPS node lines (one object literal a line in arena_app.js)
const ident = k=> /^[A-Za-z_$][\w$]*$/.test(k) ? k : J(k);
const lit = o=> '{ ' + Object.keys(o).map(k=> `${ident(k)}:${J(o[k])}`).join(', ') + ' }';
function foldNodes(src, nodes){
  const done = [];
  nodes.forEach(nd=>{
    const re = new RegExp(`^(\\s*)(\\{ ?key:"${nd.key.replace(/[-]/g, '\\-')}",[^\\n]*\\})(,?)\\s*$`, 'm'), mm = re.exec(src);
    if(!mm) throw new Error('node line not found: ' + nd.key);
    const cur = new Function('return (' + mm[2] + ');')(), next = Object.assign({}, cur), patch = Object.assign({}, nd.patch);
    const ignored = [];
    // a deck card the file no longer has: the Hall of Fame's Classic cards went on 10-13 ("mechanically identical to today's version"), so
    // the server's bee-knight-classic is today's bee-knight
    if(patch.deck){ const d = {}; Object.entries(patch.deck).forEach(([id, n])=>{ const to = CARD_RENAME[id] || id; if(to !== id) ignored.push(`${id} -> ${to} (no such card since 10-13)`); d[to] = (d[to] || 0) + n; }); patch.deck = d; }
    if('armour' in patch){ ignored.push('armour ' + J(patch.armour)); delete patch.armour; } // the game ignores node.armour since 10-18 (the Shield rule)
    Object.keys(patch).forEach(k=>{ if(patch[k] === null) delete next[k]; else next[k] = patch[k]; });
    const diff = Object.keys(Object.assign({}, cur, next)).filter(k=> !eq(cur[k], next[k])).map(k=> ({field: k, from: cur[k] === undefined ? null : cur[k], to: next[k] === undefined ? null : next[k]}));
    src = src.slice(0, mm.index) + mm[1] + lit(next) + mm[3] + src.slice(mm.index + mm[0].length);
    done.push({map: nd.map, key: nd.key, upd: nd.upd, diff, ignored});
  });
  return {src, done};
}

if(cmd === 'plan') plan();
else if(cmd === 'apply'){
  const P = plan(), cards = JSON.parse(fs.readFileSync(CARDS_FILE, 'utf8')), by = {}; cards.forEach(c=> by[c.id] = c);
  P.rows.forEach(r=>{ const row = DUMP.find(x=> x.id === r.id), {out} = foldCard(row, by[r.id]);
    out.attack = r.now[0]; out.health = r.now[1];
    out.creatorNote = ((out.creatorNote || '').replace(BF3_NOTE, '').trim() + ` 2026-10-19 retune (server override folded): was ${r.server.join('/')} ${r.serverRarity} (live server version of ${r.upd.slice(0, 10)}; ${r.verdict === 'within' ? 'within budget, kept' : r.verdict === 'under' ? 'well under' : r.verdict === 'over' ? 'over budget' : r.verdict}: 2A+H+S ${Math.round(r.budgetServer.ratio * 100)}% -> ${Math.round(r.budgetNow.ratio * 100)}% of N ${r.budgetNow.N}).`).trim();
    Object.keys(by[r.id]).forEach(k=> delete by[r.id][k]); Object.assign(by[r.id], out); });
  fs.writeFileSync(CARDS_FILE, JSON.stringify(cards, null, 2).replace(/[\u0080-￿]/g, ch=> '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) + '\n');
  const {src, done} = foldNodes(fs.readFileSync(APP, 'utf8'), P.nodes);
  fs.writeFileSync(APP, src); P.nodesDone = done; fs.writeFileSync(PLAN_FILE, JSON.stringify(P, null, 1) + '\n');
  console.log('folded', P.rows.length, 'cards into canonical/cards.json and', done.length, 'node edits into arena_app.js');
} else if(cmd === 'doc'){
  const P = JSON.parse(fs.readFileSync(PLAN_FILE, 'utf8')), fmtE = e=> Object.keys(e || {}).join(', ') || '—', CUR = {}; JSON.parse(fs.readFileSync(CARDS_FILE, 'utf8')).forEach(c=> CUR[c.id] = c);
  const st = a=> a.join('/'), ratio = b=> `${b.ratio}× ${b.ok ? '' : '(over)'}`.trim();
  const md = ['# The live server\'s card overrides folded into the file, 2026-10-19 (package BF4)', '',
    'Owner (19:34): "can i check that every card has ran through ur budget limitation? even the mythics and divines need to be balanced first pass this way".', '',
    'The live Supabase table `card_overrides` held 72 cards saved from the in-game card editor between 10-11 and 10-18. The game lays each one over `canonical/cards.json`, so on the live site these cards were the server version, not BF3\'s retune. Among them are the four Dragons, which are Mythic, Divine and Ancient on the server.',
    '',
    'The read-only dump is `docs/balance/server-overrides/card-overrides-dump-2026-10-19.json`, and the tool is `tools/fold_server_overrides_2026_10_19.js`. Its plan, with every field change, conflict and budget, is `docs/balance/server-overrides/fold-plan-2026-10-19.json`.', '',
    '## The rules', '',
    '- **The server\'s design choices win:** rarity, skills, cost, Wait, name, art and the other fields. The exception is a field the file changed after the server save, judged by the commit time of the file\'s last change against the row\'s `updated_at` (`tools/server_overrides_history_2026_10_19.py`). Then the file\'s newer value stays, and the conflict is listed below.',
    '- **Skills merge key by key:** the server\'s skills, plus any skill the file added after the save.',
    '- **The game\'s own load rules come first:** Worthy becomes Bounty, and an art path that is just the card\'s own built asset keeps the file\'s art.',
    '- **Editor defaults are skipped:** a value like `0`, `""`, `[]`, `"none"`, `"physical"`, empty speeches or `locked: false` on the server row never replaces a real value in the file.',
    '- **Stats are re-derived from the server\'s A/H** with BF3\'s retune rules: budget v5 at Level 1 with L/10 and the map term, both rules inclusive. A card is within when it is above 60% of N and inside both rules; a card well under is raised to 65% of N; an over card is fitted down. The shape is kept.',
    '- **Rarity on the budget ladder:** legendary 9, mythic 10, ancient 11, divine 12 (`bramblewood-budget.js` LADDER, the same order as the game\'s `ROAD_RARITY_STEPS`), at 1 point a rank.',
    '- **The creatorNote** reads "2026-10-19 retune (server override folded): was A/H <rarity>". BF3\'s "v5 L/10" note on these cards is removed, because its "was" held the file\'s stats, not the live ones.', '',
    '## Summary', '',
    '| | Cards |', '|---|---|', `| Folded | ${P.cards} |`, `| Within budget as the server had them | ${P.within} |`, `| Raised (well under) | ${P.raised} |`, `| Fitted down (over) | ${P.fitted} |`, `| Owner calls | ${P.owner} |`, `| Field conflicts listed | ${P.conflicts} |`, '',
    `**Over budget before** (the live server versions): ${P.overBefore.map(r=> `${r.id} ${r.ratio}×${r.ratio2 > 1 ? ' (A·H ' + r.ratio2 + '×)' : ''}`).join(', ')}.`, '',
    `**Over budget after:** ${P.overAfter.length ? P.overAfter.map(r=> `${r.id} ${r.ratio}×`).join(', ') : 'none'}.`, '',
    '## The Dragons', '',
    '| Card | Rarity (server / file before) | Server A/H | File before | Now | N (Lv 1) | 2A+H+S | Skills now | Resist |', '|---|---|---|---|---|---|---|---|---|',
    ...P.rows.filter(r=> /dragon/.test(r.id)).map(r=> `| ${r.name} | ${r.serverRarity} / ${r.fileRarity} | ${st(r.server)} | ${st(r.file)} | **${st(r.now)}** | ${r.budgetNow.N} | ${ratio(r.budgetNow)} | ${fmtE(CUR[r.id].effects)} | ${(CUR[r.id].resist || []).join(', ')} |`), '',
    'The server rows also carried each Dragon\'s resistance as a copy inside its skills (`effects.resist`, which the editor writes). It is now one list, the card\'s `resist`. The engine reads both lists, but the heat-proof check only reads the card\'s own, so nothing is lost. Past that, the server\'s skills differ from the file only by the Green Dragon\'s Overwhelm. The White Dragon keeps True Strike, which package D added after the save (a conflict, listed).', '',
    '## Every card', '',
    '| Card | Server saved | Rarity | Server → now | File before | Budget (server → now) | Fields folded | Conflicts |', '|---|---|---|---|---|---|---|---|',
    ...P.rows.slice().sort((a, b)=> a.name.localeCompare(b.name)).map(r=> `| ${r.name} | ${r.upd.slice(0, 10)} | ${r.rarity}${r.serverRarity !== r.rarity ? ' (server ' + r.serverRarity + ')' : ''} | ${st(r.server)} → **${st(r.now)}** | ${st(r.file)} | ${ratio(r.budgetServer)} → ${ratio(r.budgetNow)} | ${r.changes.map(c=> c.field === 'effects' ? 'skills' + (c.gained.length ? ' +' + c.gained.join(' +') : '') + (c.dropped.length ? ' −' + c.dropped.join(' −') : '') + (c.moved.length ? ' ~' + c.moved.join(' ~') : '') : c.field === 'art' ? 'art' : `${c.field} ${J(c.from)} → ${J(c.to)}`).join('; ') || '—'} | ${r.conflicts.map(c=> `${c.field}: kept ${c.kept}`).join('; ') || '—'} |`), '',
    '## Conflicts', '',
    'These are fields where the file changed after the server save. The file\'s newer value stays unless the note says otherwise. To flip one, edit `canonical/cards.json`.', '',
    '| Card | Field | Server | File (changed) | Kept |', '|---|---|---|---|---|',
    ...P.rows.flatMap(r=> r.conflicts.map(c=> `| ${r.name} | ${c.field} | ${c.field === 'effects' ? fmtE(c.server) : J(c.server)} | ${c.field === 'effects' ? fmtE(c.file) : J(c.file)} (${(c.fileAt || '').slice(0, 10)}) | ${c.kept} |`)), '',
    '## Editor defaults left out', '',
    ...(P.rows.some(r=> r.kept.length) ? ['| Card | Field | Server | File (kept) |', '|---|---|---|---|', ...P.rows.flatMap(r=> r.kept.map(k=> `| ${r.name} | ${k.field} | ${J(k.server)} | ${J(k.file)} |`))] : ['None.']), '',
    '## The node edits (Map 0 and the Tutorial, 10-18)', '',
    'These rows were folded into `CONQUEST_MAPS` in `arena_app.js` the way the game applies them (each patch laid over the node). Before, they overrode the road on the live site.', '',
    '| Row | Node | Field | File before | Now (the owner\'s) |', '|---|---|---|---|---|',
    ...(P.nodesDone || []).flatMap(n=> n.diff.map(d=> `| ${n.map} | ${n.key} | ${d.field} | ${J(d.from)} | ${J(d.to)} |`)), '',
    ...(P.nodesDone || []).filter(n=> n.ignored.length).map(n=> `- ${n.key}: ${n.ignored.join('; ')}. (\`node.armour\` is not written: the game ignores it since 10-18, the Shield rule.)`), '',
    ...(()=>{ let RC = null; try{ RC = JSON.parse(fs.readFileSync(path.join(DIR, 'road-recheck-2026-10-19.json'), 'utf8')); }catch(e){} if(!RC) return [];
      const moved = RC.rows.filter(r=> r.greenBefore !== r.greenAfter || Math.abs(r.after - r.before) >= 8);
      return ['## The road, re-checked (not retuned)', '',
        `${RC.fights} fights use a folded card that changed. Some hold it in their enemy deck; the rest play the Maps 0–3 reference decks, whose Bee Drone, Riverwing Envoy and Rabbit Kit changed. All of them were re-measured (120 games, the measure seeds; \`docs/balance/server-overrides/road-recheck-2026-10-19.json\`).`, '',
        `- **Main maps on target:** ${RC.mainGreen.before} → **${RC.mainGreen.after}** of ${RC.mainGreen.of}. Side maps: ${RC.sideGreen.before} → ${RC.sideGreen.after} of ${RC.sideGreen.of}. Fresh seeds, main: ${RC.freshMainGreen.before} → ${RC.freshMainGreen.after}.`,
        `- **${RC.greenLost} fights left their band and ${RC.greenGained} came into it.** The gaps list (\`docs/balance/road-gaps-2026-10-19.json\`) now has ${RC.gaps.after} fights (was ${RC.gaps.before}).`,
        '- **Map 0\'s fights are the owner\'s own decks.** They were measured as they are and not tuned.', '',
        '| Fight | Kind | Before | After | Target (band) | Band before → after |', '|---|---|---|---|---|---|',
        ...moved.map(r=> `| ${r.code} | ${r.kind} | ${r.before}% | ${r.after}% | ${r.target}% (${r.lo}–${r.hi}) | ${r.greenBefore} → ${r.greenAfter} |`), '']; })(),
    '## Clearing the live rows (proposed, NOT applied)', '',
    '`supabase/migrations/20261019_clear_folded_overrides.sql` is waiting for the owner\'s approval. Nothing has touched the live database.',
    '- **The 72 card rows are reset to an empty patch** (`data = {"__patch": true}`). The game reads that as the file\'s card. The old row is kept in `deleted_snapshot` and in a backup table. **The card rows must not be marked `deleted = true`:** for a card, that is the editor\'s tombstone, and the game would remove the card from play (`liveDeletes`). The reset also bumps `updated_at`, so open games pick it up on their next 30-second poll.',
    '- **The 2 node rows** (`__cfg:map-nodes:m1` with 0-1 to 0-4, and `__cfg:map-nodes:mtut` with the two tutorials) are marked deleted with their data kept in `deleted_snapshot`, the way the editor\'s "drop every edit" does. Each row holds only the folded edits.',
    '- **Left alone:** the map-layout rows, the other map-node rows (`requires` links and added nodes on older map ids) and `__cfg:tutorial`.',
    '- **The admin\'s own browser** also keeps a local copy of its edits (`bramblewood_arena_card_overlay`, and node edits newer than the server are republished). Clear it on that device after the SQL runs.', ''];
  fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'server-overrides-fold-2026-10-19.md'), md.join('\n'));
  // the SQL
  const ids = P.rows.map(r=> r.id), q = s=> "'" + s.replace(/'/g, "''") + "'";
  const sql = ['-- 2026-10-19 (package BF4) PROPOSED, NOT APPLIED. The owner must approve before this runs against the live database.',
    '-- The 72 card_overrides card rows folded into canonical/cards.json (docs/balance/server-overrides-fold-2026-10-19.md) and the two',
    '-- map-node rows folded into CONQUEST_MAPS (Map 0 nodes 0-1 to 0-4; the Tutorial\'s tutorial and tutorial2) fall back to the file.',
    '--',
    '-- Card rows are reset to an empty patch, NOT marked deleted: for a card, deleted = true is the editor\'s tombstone and the game',
    '-- would remove the card (arena_app.js loadCloudCardOverrides: liveDeletes). {"__patch": true} lays nothing over the file\'s card',
    '-- (cloudCardData00). The old row is kept in deleted_snapshot and in a backup table; updated_at moves so open games pick it up.',
    '-- The two node rows are cleared the way the editor\'s "drop every edit" does (data null, deleted true), with their data kept in',
    '-- deleted_snapshot. Map layouts, the other map-node rows and __cfg:tutorial are left alone.',
    'begin;', '',
    'create table if not exists public.card_overrides_backup_20261019 as select * from public.card_overrides where false;',
    'insert into public.card_overrides_backup_20261019', '  select * from public.card_overrides where id in (', '    ' + ids.concat(Object.keys(NODE_ROWS)).map(q).join(',\n    '), '  );', '',
    '-- the 72 card rows: back to the file',
    'update public.card_overrides', '   set deleted_snapshot = data,', '       data = \'{"__patch": true}\'::jsonb,', '       deleted = false,', '       updated_at = now()',
    ' where id in (', '    ' + ids.map(q).join(',\n    '), '  )', '   and deleted = false;', '',
    '-- the two node rows: each holds only the folded patches (Map 0: 0-1 0-2 0-3 0-4; the Tutorial: tutorial, tutorial2)',
    'update public.card_overrides', '   set deleted_snapshot = data,', '       data = null,', '       deleted = true,', '       updated_at = now()',
    ` where id in (${Object.keys(NODE_ROWS).map(q).join(', ')})`, '   and deleted = false;', '',
    '-- expect 72 and 2 rows; roll back if not',
    "select count(*) filter (where data = '{\"__patch\": true}'::jsonb) as cards_cleared, count(*) filter (where id like '__cfg:map-nodes:%' and deleted) as nodes_cleared",
    '  from public.card_overrides where id in (', '    ' + ids.concat(Object.keys(NODE_ROWS)).map(q).join(',\n    '), '  );', '',
    'commit;', ''];
  fs.mkdirSync(path.join(ROOT, 'supabase', 'proposed'), {recursive: true});
  fs.writeFileSync(path.join(ROOT, 'supabase', 'proposed', '20261019_clear_folded_overrides.sql'), sql.join('\n'));
  console.log('wrote docs/balance/server-overrides-fold-2026-10-19.md and supabase/migrations/20261019_clear_folded_overrides.sql');
}
