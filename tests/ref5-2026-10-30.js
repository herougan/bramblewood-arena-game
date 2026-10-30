#!/usr/bin/env node
// 2026-10-30 (package REF5: the progression reference, "Reference (Random)"). Source and data checks plus the parts that run headless through
// tools/lib_bramble.js:
//   1  the set file docs/balance/ref/ref5-prog.json: 5 decks a main map 0-20, 20 cards each, every deck inside its seed's collection
//      (docs/balance/ref/ref5-prog-pools.json: the cards owned, the copies owned), parts = counts, levels within the Forge's reach
//   2  baked into arena_app.js (ref_decks.js --check) and index.html; refSetIds puts prog, prog-1 .. prog-5 first, then the map's and Reference-2;
//      refSetFor('prog') deals one of the map's five at random (both ends reached), 'prog-k' that one, a side map the decks of the map it opens on;
//      the default pick is prog (a pre-REF5 saved choice moves to it once); the fight says which deck ("Reference k of 5"); texts in 12 packs
//   3  the economy is reproducible (the same seed walks the same road) and the tools take --ref prog (pro_ease expands it to the five)
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.join(__dirname, '..');
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  ✗', m); } else if(process.env.VERBOSE) console.log('  ✓', m); };
const rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
const app = rd('arena_app.js');

// ---- 1. the set file
const set = JSON.parse(rd('docs/balance/ref/ref5-prog.json')), pools = JSON.parse(rd('docs/balance/ref/ref5-prog-pools.json')).maps;
ok(set.id === 'prog' && set.bake === true && set.label === 'Reference (Random)', '1. the set: id prog, baked, labelled Reference (Random)');
const maps = Object.keys(set.decks).map(Number).sort((a, b)=> a - b);
ok(maps.length === 21 && maps[0] === 0 && maps[20] === 20, '1. Maps 0-20 each have decks: ' + maps.join(','));
const B0 = require(path.join(ROOT, 'tools/lib_bramble.js')), G0 = B0.G, G0D = B0.CARD_DEFS_BASELINE; // levels: never under the card's own, never past 10 (a pack's free level-up is not the Forge's)
let bad = [];
maps.forEach(m=>{ const L = set.decks[m]; if(L.length !== 5) bad.push(m + ': ' + L.length + ' decks');
  L.forEach(d=>{ const n = Object.values(d.counts).reduce((t, k)=> t + k, 0), pn = d.parts.reduce((t, p)=> t + p[1], 0), P = (pools[m] || {seeds: {}}).seeds[d.seed];
    if(n !== 20 || pn !== 20) bad.push(m + '/' + d.seed + ': ' + n + ' cards, parts ' + pn);
    if(!P){ bad.push(m + '/' + d.seed + ': no pool'); return; }
    Object.keys(d.counts).forEach(id=>{ if(!P.pool.includes(id)) bad.push(m + '/' + d.seed + ': ' + id + ' not owned'); else if(P.copies[id] != null && d.counts[id] > P.copies[id]) bad.push(m + '/' + d.seed + ': ' + id + ' x' + d.counts[id] + ' > ' + P.copies[id] + ' owned'); });
    d.parts.forEach(p=>{ if(p[2] < 0 || p[2] > 10 || p[2] < (G0.cardBaseLevel(G0D[p[0]] || {}) || 0)) bad.push(m + '/' + d.seed + ': ' + p[0] + ' at Lv ' + p[2]); }); }); });
ok(!bad.length, '1. every deck: 20 cards, inside its seed\'s collection (cards and copies), levels from the card\'s own to 10 ' + bad.slice(0, 6).join('; '));

// ---- 2. the game
{ const r = cp.spawnSync(process.execPath, [path.join(ROOT, 'tools/opt/ref_decks.js'), '--check'], {encoding: 'utf8'});
  ok(r.status === 0 && /up to date/.test(r.stdout), '2. arena_app.js REF_DECK_SETS matches docs/balance/ref (ref_decks.js --check) ' + (r.stdout || '').trim().split('\n').pop()); }
ok(fs.existsSync(path.join(ROOT, 'index.html')) && rd('index.html').includes('"prog":{"id":"prog"'), '2. index.html is built with the prog set');
const B = require(path.join(ROOT, 'tools/lib_bramble.js')), G = B.G;
ok(JSON.stringify(G.refSetIds()) === JSON.stringify(['prog', 'prog-1', 'prog-2', 'prog-3', 'prog-4', 'prog-5', 'map', 'ref2']), '2. the picker: Reference (Random), Reference 1-5 of 5, the map\'s, Reference-2 ' + JSON.stringify(G.refSetIds()));
{ const m7 = G.CONQUEST_MAPS.find(m=> !m.sub && G.mapNumberOf(m.id) === 7), n = m7.nodes.find(x=> x.deck && Object.keys(x.deck).length);
  const seen = new Set(); for(let i = 0; i < 80; i++){ const r = G.refSetFor('prog', m7.id, n); seen.add(r.pick); if(r.of !== 5 || r.multi !== 'prog') seen.add('bad'); }
  ok(seen.size === 5 && !seen.has('bad'), '2. Reference (Random) deals each of Map 7\'s five decks (80 starts): ' + [...seen].sort().join(','));
  const r3 = G.refSetFor('prog-3', m7.id, n), d3 = set.decks[7][2];
  ok(r3.pick === 3 && JSON.stringify(r3.deck) === JSON.stringify(d3.counts) && JSON.stringify(r3.parts) === JSON.stringify(d3.parts) && /3 of 5/.test(r3.label), '2. prog-3 is the third deck, its parts and label ' + r3.label);
  const r0 = G.refSetFor('prog-1', m7.id, n, {}), rnd = G.refSetFor('prog', m7.id, n, {rnd: ()=> 0.99});
  ok(r0.pick === 1 && rnd.pick === 5, '2. the pick follows the generator (0.99 -> deck 5)');
  const side = G.CONQUEST_MAPS.find(m=> m.id === 'mq'), sn = side && side.nodes.find(x=> x.deck && Object.keys(x.deck).length);
  if(sn){ const rs = G.refSetFor('prog-2', side.id, sn); ok(JSON.stringify(rs.deck) === JSON.stringify(set.decks[G.mapUnlockNumberOf('mq')][1].counts), '2. a side map (Clovermead, opens on Map ' + G.mapUnlockNumberOf('mq') + ') plays the decks of the map it opens on'); }
  const ctx = G.referenceFightSetup(m7.id, n, {refSet: 'prog-2'}); ok(ctx.ref.stage === 'ref:prog-2' && Object.values(ctx.mine).reduce((t, k)=> t + k, 0) === 20, '2. a reference fight with prog-2 deals its 20 cards'); }
ok(/function refDefaultSet\(\)/.test(app) && /o\.v === 2 \? o\.set : null/.test(app) && /v: 2\}/.test(app), '2. the default pick is Reference (Random); a saved pre-REF5 choice moves to it once');
ok(/TX\('ui\.ref5-dealt'/.test(app) && /refPlay\.multi \? refPlay\.label/.test(app), '2. the fight says which deck was dealt (toast, REF tag and result line)');
{ const tx = rd('bramblewood-texts.js'), en = ['Reference (Random)', 'Reference {i} of {n}', "You play {name}, dealt at random from this map's reference decks."];
  ok(['ui.ref5-random', 'ui.ref5-deck', 'ui.ref5-dealt'].every(k=> tx.includes('"' + k + '"')), '2. TX keys ui.ref5-*');
  const miss = []; fs.readdirSync(path.join(ROOT, 'lang')).filter(f=> f.endsWith('.json')).forEach(f=>{ const p = JSON.parse(rd('lang/' + f)); en.forEach(e=>{ if(!p[e]) miss.push(f + ': ' + e); }); });
  ok(!miss.length && fs.readdirSync(path.join(ROOT, 'lang')).filter(f=> f.endsWith('.json')).length === 12, '2. the 3 texts in all 12 packs ' + miss.slice(0, 3).join('; ')); }

// ---- 3. the economy and the tools
{ const R5 = require(path.join(ROOT, 'tools/opt/ref5_prog.js'));
  const a = R5.walk(2, 6, ()=> null), b = R5.walk(2, 6, ()=> null), sa = R5.stateSummary(R5.game(), a, 6), sb = R5.stateSummary(R5.game(), b, 6);
  ok(JSON.stringify(sa) === JSON.stringify(sb), '3. the same seed walks the same road (Map 6, seed 2)');
  const p6 = pools[6] && pools[6].seeds[2]; ok(p6 && JSON.stringify(p6.pool) === JSON.stringify(sa.pool), '3. the saved Map 6 collection is what the walk gives today');
  const E = require(path.join(ROOT, 'tools/opt/pro_ease.js')), O = require(path.join(ROOT, 'tools/opt/deckopt.js')), gm = O.loadGame(ROOT);
  ok(JSON.stringify(E.expandRefs(gm, ['map', 'prog'])) === JSON.stringify(['map', 'prog-1', 'prog-2', 'prog-3', 'prog-4', 'prog-5']), '3. pro_ease / ref_vs_optimum --ref prog = the five decks');
  ok(O.MODES.includes('prog'), '3. deckopt --mode prog'); }
{ const rep = path.join(ROOT, 'docs/balance/ref5-2026-10-30.json');
  ok(fs.existsSync(rep) && (()=>{ const j = JSON.parse(fs.readFileSync(rep, 'utf8')); return j.economy.length >= 21 && j.decks.length === 21 && j.road.length >= 21 && j.pro.length >= 1; })(), '3. the report data (economy, decks, road, PRO)'); }

console.log(`ref5-2026-10-30: ${checks - fail}/${checks} checks passed`);
process.exit(fail ? 1 : 0);
