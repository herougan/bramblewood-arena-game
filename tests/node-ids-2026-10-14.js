#!/usr/bin/env node
// 2026-10-14 (user: "The internal Map IDs have not been edited to the current layout. (1-1 is still called f-1)."): every fight's
// key is now the code the player sees, and old saves / cloud rows are translated on load. This checks that
//   1. every fight's key equals its displayed code (the tutorials keep 'tutorial' / 'tutorial2', shown T-0 / T-1);
//   2. LEGACY_NODE_KEYS covers every fight of every renamed map, is one-to-one, and never maps onto another old key;
//   3. a sample save from before the rename (progress, ranks, first wins, layout, skirmish edits, pawn, resume, idle sweep,
//      card overlay, cloud rows) comes out on the new keys, and migrating twice changes nothing.
'use strict';
const fs = require('fs'), path = require('path');
const src = fs.readFileSync(path.join(__dirname, '..', 'arena_app.js'), 'utf8');
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };

// --- the migration helpers, run against a fake localStorage
const a = src.indexOf('// ---- Node ids follow the map numbers'), b = src.indexOf('migrateLegacyNodeIds();\n', a);
ok(a > 0 && b > a, 'the migration block is in arena_app.js');
const store = new Map();
const localStorage = {get length(){ return store.size; }, key: i=> [...store.keys()][i], getItem: k=> store.has(k) ? store.get(k) : null, setItem: (k, v)=> store.set(k, String(v)), removeItem: k=> store.delete(k)};
const M = new Function('localStorage', src.slice(a, b) + '; return {LEGACY_NODE_KEYS, migrateNodeKey, legacyNodeKey, migrateNodeIdString, migrateLayoutPositions, migrateNodeEditSet, migrateStoredNodeValue, migrateLegacyNodeIds};')(localStorage);
ok(/^migrateLegacyNodeIds\(\);$/m.test(src) && src.indexOf('migrateLegacyNodeIds();\n') < src.indexOf("const MAP_LAYOUT_KEY = 'bramblewood_map_layout_v1'"), 'the migration runs before the stores are read');

// --- the maps, and the display code functions
const ms = src.indexOf('const CONQUEST_MAPS = ['), me = src.indexOf('\n];', ms) + 3;
const dg = src.indexOf('function endlessDungeon(cfg){'), de = src.indexOf('const CONQUEST_MAPS_BASELINE', dg);
const fn = name=>{ const i = src.indexOf(`function ${name}(`); let d = 0, j = src.indexOf('{', i); for(; j < src.length; j++){ if(src[j] === '{') d++; else if(src[j] === '}' && --d === 0) break; } return src.slice(i, j + 1); };
const CONQUEST_MAPS = new Function(src.slice(ms, me) + '\n' + src.slice(dg, de) + '\nreturn CONQUEST_MAPS;')();
const codeOf = new Function('CONQUEST_MAPS', [fn('mainConquestMaps'), fn('mapNumberOf'), fn('skirmishCode')].join('\n') + '; return skirmishCode;')(CONQUEST_MAPS);
let fights = 0;
CONQUEST_MAPS.forEach(m=> m.nodes.forEach(n=>{
  if(n.kind === 'tutorial') return; fights++;
  ok(n.key === codeOf(m.id, n.key), `${m.id}: key ${n.key} is shown as ${codeOf(m.id, n.key)}`);
  (n.requires||[]).forEach(r=> ok(m.nodes.some(x=> x.key === r), `${m.id}:${n.key} requires ${r}, which is on the map`));
}));
CONQUEST_MAPS.filter(m=> m.entry && m.entry.after).forEach(m=>{ const p = CONQUEST_MAPS.find(x=> x.id === m.parent); ok(p && p.nodes.some(n=> n.key === m.entry.after), `${m.id}: entrance opens after ${m.entry.after} on ${m.parent}`); });
ok(fights > 250, `all fights checked (${fights})`);

// --- the table covers every fight of every renamed map
const T = M.LEGACY_NODE_KEYS;
Object.keys(T).forEach(mid=>{
  const m = CONQUEST_MAPS.find(x=> x.id === mid); ok(m, `${mid} is a map`); if(!m) return;
  const olds = Object.keys(T[mid]), news = Object.values(T[mid]);
  ok(new Set(news).size === news.length, `${mid}: no two old keys share a new key`);
  news.forEach(k=> ok(m.nodes.some(n=> n.key === k), `${mid}: ${k} is a fight`));
  olds.forEach(k=> ok(!m.nodes.some(n=> n.key === k) && !news.includes(k), `${mid}: old key ${k} is not a key any more (translating twice is harmless)`));
  m.nodes.filter(n=> n.kind !== 'tutorial').forEach(n=> ok(news.includes(n.key), `${mid}: ${n.key} has its old key`));
  news.forEach(k=> ok(M.migrateNodeKey(mid, M.legacyNodeKey(mid, k)) === k, `${mid}: ${k} round-trips`));
});
// 2026-10-18 (package PD): a side map born after the rename (the Pale Desert, mpd) has its code as its key from the start (18-A-1 ...).
CONQUEST_MAPS.filter(m=> !T[m.id] && !m.endless) /* 2026-10-16: every endless map (mm, mlb, tw) has X-CODE-n keys */.forEach(m=> m.nodes.forEach(n=> ok(n.kind === 'tutorial' || (m.sub ? /^\d+-[A-Z]-\d+$/ : /^\d+-\d+$/).test(n.key), `${m.id}: ${n.key} needed no rename`)));
ok(M.migrateNodeKey('mf', 'f-1') === '1-1' && M.migrateNodeKey('m1', '1-1') === '0-1' && M.migrateNodeKey('mq', 'q-2') === '1-A-2', 'f-1 → 1-1, the Outskirts\' 1-1 → 0-1, q-2 → 1-A-2');
ok(M.migrateNodeKey('mm', 'mm-37') === '6-MM-37' && M.legacyNodeKey('mm', '6-MM-37') === 'mm-37', 'the endless dungeon: mm-37 ↔ 6-MM-37');
ok(M.migrateNodeKey('mtut', 'tutorial') === 'tutorial' && M.migrateNodeKey('mtut', 't-3') === 'T-3' && M.migrateNodeKey('mt', 't-3') === '16-3', 'tutorials stay; mtut t-3 and mt t-3 go their own ways');
ok(M.migrateNodeKey('m2', 'm2-c1') === 'm2-c1', 'admin-added fights keep their keys');

// --- a save from before the rename
store.clear();
const put = (k, v)=> localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));
put('bramblewood_conquest_progress_v1', {completed:['mtut:tutorial','mtut:tutorial2','m1:1-1','m1:1-2','m1:1-3','m1:1-4','mf:f-1','mf:f-2','mq:q-1','m10:10-raid','mm:mm-1','m2:m2-c1','m11:11-wb'],
  raidUnlocked:['m10:10-raid'], ranks:{'mf:f-1':'S','m1:1-4':'A','mm:mm-1':'B'}, clearedAt:{'mf:f-1':1790000000000,'m1:1-4':1790000000001}, firstWinAt:{'mf:f-2':1790000000002}, wb1012:1});
put('bramblewood_map_layout_v1', {m1:{'1-1':{x:30,y:50},'~well':{after:'1-3'},'~sub:mo':{x:45,y:80},tutorial:{x:8,y:50}}, mf:{'f-1':{x:15,y:45},'~spot:deck':{x:15,y:75,after:'f-1'}}, m10:{'10-raid':{x:50,y:10}}});
put('bramblewood_node_edits_v1', {mg:{added:[{key:'mg-c1', requires:['g-4']}], patches:{'g-3':{requires:['g-2']}}, _localAt:5}, m1:{patches:{'1-2':{requires:['1-1'], hqHp:28}}}});
put('bramblewood_map_pawn', {mf:'f-3', m1:'1-4', mtut:'tutorial'});
put('bramblewood_resume_match_v1', {mode:'conquest', savedAt:1, conquestNode:{mapId:'mf', nodeId:'f-4', kind:'skirmish', name:'Sapper Hedge'}, players:{}});
put('bramblewood_idle_sweep_v1', {mapId:'mb', nodeKey:'b-5'});
put('bramblewood_auto_s_v1', ['mf:f-1','m11:11-9']);
put('bramblewood_card_rewards_claimed_v1', ['m1:1-1','mf:f-5']);
put('bramblewood_arena_card_overlay', {'beetle-grunt':{id:'beetle-grunt', source:{kind:'map', id:'mf', node:'f-4'}}});
put('bramblewood_arena_faction', 'otters');
put('bramblewood_arena_seen', 'plain text with m1:1-10 and mf:f-1x left alone');
M.migrateLegacyNodeIds();
const get = k=> JSON.parse(localStorage.getItem(k));
const pr = get('bramblewood_conquest_progress_v1');
ok(JSON.stringify(pr.completed) === JSON.stringify(['mtut:tutorial','mtut:tutorial2','m1:0-1','m1:0-2','m1:0-3','m1:0-4','mf:1-1','mf:1-2','mq:1-A-1','m10:11-R','mm:6-MM-1','m2:m2-c1','m11:11-wb']), 'progress.completed: ' + JSON.stringify(pr.completed));
ok(JSON.stringify(pr.raidUnlocked) === '["m10:11-R"]', 'raid unlocks');
ok(pr.ranks['mf:1-1'] === 'S' && pr.ranks['m1:0-4'] === 'A' && pr.ranks['mm:6-MM-1'] === 'B' && !pr.ranks['mf:f-1'], 'ranks');
ok(pr.clearedAt['mf:1-1'] === 1790000000000 && pr.clearedAt['m1:0-4'] && pr.firstWinAt['mf:1-2'], 'first-win times');
const lay = get('bramblewood_map_layout_v1');
ok(lay.m1['0-1'].x === 30 && lay.m1['~well'].after === '0-3' && lay.m1['~sub:mo'] && lay.m1.tutorial && !lay.m1['1-1'], 'layout m1');
ok(lay.mf['1-1'] && lay.mf['~spot:deck'].after === '1-1' && lay.m10['11-R'], 'layout mf / m10');
const ed = get('bramblewood_node_edits_v1');
ok(ed.mg.added[0].key === 'mg-c1' && ed.mg.added[0].requires[0] === '2-B-4' && ed.mg.patches['2-B-3'].requires[0] === '2-B-2' && ed.mg._localAt === 5, 'skirmish edits mg');
ok(ed.m1.patches['0-2'].requires[0] === '0-1' && ed.m1.patches['0-2'].hqHp === 28, 'skirmish edits m1');
const pawn = get('bramblewood_map_pawn'); ok(pawn.mf === '1-3' && pawn.m1 === '0-4' && pawn.mtut === 'tutorial', 'map pawn');
ok(get('bramblewood_resume_match_v1').conquestNode.nodeId === '1-4', 'resume snapshot');
ok(get('bramblewood_idle_sweep_v1').nodeKey === '2-5', 'idle sweep target');
ok(JSON.stringify(get('bramblewood_auto_s_v1')) === '["mf:1-1","m11:20-3"]', 'auto-S list');
ok(JSON.stringify(get('bramblewood_card_rewards_claimed_v1')) === '["m1:0-1","mf:1-5"]', 'claimed card rewards');
ok(get('bramblewood_arena_card_overlay')['beetle-grunt'].source.node === '1-4', 'local card source');
ok(localStorage.getItem('bramblewood_arena_faction') === 'otters' && localStorage.getItem('bramblewood_arena_seen') === 'plain text with m1:1-10 and mf:f-1x left alone', 'other values untouched');
const snap = JSON.stringify([...store.entries()]); M.migrateLegacyNodeIds();
ok(JSON.stringify([...store.entries()]) === snap, 'migrating twice changes nothing');

// --- cloud rows published before the rename (as read from card_overrides on 2026-10-14)
const cloudLay = M.migrateLayoutPositions('mb', {'b-1':{x:15,y:45}, '~sub:mg':{x:85,y:25,after:'b-4'}, '~spot:nest':{x:55,y:85,after:'b-5'}});
ok(cloudLay['2-1'] && cloudLay['~sub:mg'].after === '2-4' && cloudLay['~spot:nest'].after === '2-5', 'cloud map-layout:mb');
const cloudEd = M.migrateNodeEditSet('m11', {patches:{'11-3':{requires:['11-10']}, '11-10':{requires:['11-2','11-9']}}, _localAt:1});
ok(cloudEd.patches['20-5'].requires[0] === '20-4' && cloudEd.patches['20-4'].requires.join() === '20-2,20-3', 'cloud map-nodes:m11');
ok(M.migrateStoredNodeValue('bramblewood_conquest_progress_v1', JSON.stringify({completed:['mf:f-1']})) === JSON.stringify({completed:['mf:1-1']}), 'a pulled progress blob');
ok(/function cloudCardData\(r\)\{ const d = cloudCardData0\(r\); if\(d && d\.source && d\.source\.kind === 'map'/.test(src), 'cloud card rows: source.node translated');
ok(/mapLayoutOverrides\[m\[1\]\] = migrateLayoutPositions\(m\[1\], r\.data\.positions\)/.test(src) && /nodeEdits\[mapId\] = migrateNodeEditSet\(mapId, r\.data\.edits\)/.test(src), 'cloud layout / node-edit rows translated on load');
ok(/v = migrateStoredNodeValue\(k, v\);/.test(src), 'the cloud progress pull translates too');
ok(/hashStr\(`\$\{mapId\}:\$\{legacyNodeKey\(mapId, n\.key\)\}`\)/.test(src), 'map scatter still seeded from the old keys');

// --- canonical card sources point at real fights
const cards = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'canonical', 'cards.json'), 'utf8'));
let srcN = 0; (Array.isArray(cards) ? cards : Object.values(cards)).forEach(c=>{ const s = c.source; if(s && s.kind === 'map' && s.node){ srcN++; const m = CONQUEST_MAPS.find(x=> x.id === s.id); ok(m && m.nodes.some(n=> n.key === s.node), `${c.id}: source ${s.id}/${s.node} is a fight`); } });
ok(srcN > 100, `card sources checked (${srcN})`);

console.log(`node-ids: ${fail} failure(s)`);
process.exit(fail ? 1 : 0);
