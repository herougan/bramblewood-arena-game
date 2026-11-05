#!/usr/bin/env node
// 2026-11-05 (package UI21): FIX8-3 nests unlock on completing a set map and a locked nest is a shadow; IDEA-EARLY-3 the keyword of the map;
// IDEA-EARLY-4 the best rank on a fight's map node; ECON2-11 the resources tool reads the halved numbers and no daily quest tiers.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
let pass = 0, fail = 0; const ok = (c, m)=>{ if(c){ pass++; } else { fail++; console.log('  ✗ ' + m); } };
const app = rd('arena_app.js'), tpl = rd('arena_template.html'), texts = rd('bramblewood-texts.js');
// FIX8-3
{ const m = /const NEST_UNLOCKS = \[([\s\S]*?)\n\];/.exec(app); ok(!!m, 'NEST_UNLOCKS found');
  const maps = [...m[1].matchAll(/map:(\d+)/g)].map(x=> +x[1]), gold = [...m[1].matchAll(/gold:(\d+)/g)].map(x=> +x[1]);
  ok(JSON.stringify(maps) === '[3,4,8,12,16,20,24]', 'the six further nests unlock on completing Map 4, 8, 12, 16, 20, 24: ' + maps);
  ok(JSON.stringify(gold) === '[150,500,1000,1800,2800,4000]', 'prices unchanged: ' + gold);
  ok(/function nestMapReached\(num\)\{ try\{ return conquestMapCleared\(mapIdAt\(num\)\)/.test(app), 'a nest needs the map COMPLETED (conquestMapCleared)');
  ok(/NEST_LEGACY_MAPS = \[3, 5, 10, 15, 20, 25, 30\]/.test(app) && /nestLegacyReached\(NEST_LEGACY_MAPS\[i\]\)/.test(app), 'a save without a built count is carried over by the old schedule');
  ok(/is-locked is-shadow/.test(app) && /\.hay-nest\.is-shadow \.hay\{filter:brightness\(0\)/.test(tpl), 'a locked nest is a shadow');
  const nest = app.slice(app.indexOf('function nestKeeperHTML'), app.indexOf('function openNursePicker'));
  ok(!/Map \$\{u\.map\}|mapName\}/.test(nest.replace(/void u; void mapName;/, '')) && /ui\.ui21-nest-discovery/.test(nest), 'the Nest text does not name the map');
  ok(/"ui.ui21-nest-discovery": "Unlocks from discovery"/.test(texts) && /"ui.ui21-nest-next-discovery"/.test(texts), 'the TX keys'); }
// IDEA-EARLY-3
{ const j = JSON.parse(rd('canonical/map-keywords.json')), k = j.keywords;
  ['m1', 'mtut', 'mo', 'mf', 'mq', 'mb', 'mp', 'mg', 'mc', 'm2', 'mw', 'ms'].forEach(id=> ok(typeof k[id] === 'string' && new RegExp(`\\{key:'${k[id]}', category`).test(app), 'map ' + id + ' has a real keyword: ' + k[id]));
  ok(/const MAP_KEYWORDS = __MAP_KEYWORDS__;/.test(app) && /__MAP_KEYWORDS__/.test(rd('assemble_arena.py')), 'baked by a placeholder');
  ok(/ui21McKeywordHTML\(mapId, defs, mapPoolSections\(top\)\.filter\(inScope\)/.test(app), 'its own section in the Map cards window, from the map\'s own lists');
  ok(/ui\.ui21-mapkw-title/.test(app) && /ui19McSkillText/.test(app.slice(app.indexOf('function ui21McKeywordHTML'), app.indexOf('// UI21_KW:END'))), 'name and rules text'); }
// IDEA-EARLY-4
ok(/map-node-rank rank-\$\{escapeAttr\(br\)\}/.test(app) && /progress\.ranks\[conquestNodeId\(map\.id, node\.key\)\]/.test(app), 'the best rank on the map node');
ok(/cnp-rank-corner/.test(app), 'and in the fight info (already there)');
// texts in all 12 packs
{ const langs = fs.readdirSync(path.join(ROOT, 'lang')).filter(f=> f.endsWith('.json'));
  ok(langs.length === 12, '12 packs'); langs.forEach(f=>{ const d = JSON.parse(rd('lang/' + f)); ['Unlocks from discovery', 'The next one unlocks from discovery.', 'Keyword of the map', 'The keyword this map introduces.', 'Cards on this map that have it'].forEach(e=> ok(d[e] && d[e] !== e, f + ' has ' + e)); }); }
// ECON2-11
{ const t = rd('tools/resources_week_2026_10_23.js'), r = JSON.parse(rd('docs/balance/resources-2026-10-23.json'));
  ok(/econScaleTable/.test(t) && /econ\.econScale/.test(t), 'the tool halves like the game');
  ok(r.assumptions.dailyTiers === 0 && Object.keys(r.numbers.dailyTiers).length === 0, 'no daily quest tiers');
  ok(r.numbers.noticeEV.gold < 40 && r.weeks[0].week.gold < 5000, 'the numbers are the halved ones: notice gold ' + r.numbers.noticeEV.gold.toFixed(1)); }
console.log('ui21-2026-11-05: ' + pass + '/' + (pass + fail) + ' checks passed'); process.exit(fail ? 1 : 0);
