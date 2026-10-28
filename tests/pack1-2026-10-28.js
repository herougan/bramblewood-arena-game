#!/usr/bin/env node
// Package PACK1 (2026-10-28; owner 22:47: "For now, remove all cards from the packs. We'll be more deliberate of our choices. In the end, I do
// plan to add some cards into packs that do not appear in any skirmish."; the coordinator's reading: a basic pack's pool is its maps' lists +
// an owner-curated extras list, empty for now). Checks:
//   1. the derived pools: Pack N = the basic-pack cards whose FIRST map list (canonical/map-pools.json, a side map from the map that unlocks
//      it, no Tutorial / endless / tower lists) is on Maps 7(N-1)..7N-1, worked out here from the files and compared with the game's
//      basicPackTierOf / packPoolOf; source.tier is not read for basic packs; the Factions pool (11) and the Mystery Booster (99) still are;
//   2. a basic-pack card in no list is in no pack: not obtainable (cardObtainableFrom null, isUnattainable), Map 0 (cardObtainMap), its card
//      data kept; canonical/card-obtain-maps.json is current;
//   3. the extras: canonical/pack-extras.json has a list per pack, the build inlines it, a card listed there joins that pack (evaluated with a
//      stand-in list), a pack table's live `extras` wins, the Pack editor edits them; mpChanged and the pack-table setters clear the cache;
//   4. the packs still open: every sold pack's pool (1-3) holds at least 5 cards (a Collector pack without a repeat); sizes, rarity weights
//      and foil chances unchanged;
//   5. the 🃏 Map cards button with the skirmish panel's admin buttons opens the map's lists as an overlay (VIS4's tiles, zoom), VIS4's
//      section stays at the foot of the panel; the texts are TX keys with a row in all 12 language packs.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = rel=> fs.readFileSync(path.join(ROOT, rel), 'utf8');
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  ✗', m); } };
const app = rd('arena_app.js');
const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G, D = B.CARD_DEFS_BASELINE;
const {normalizeEntry} = require(path.join(ROOT, 'tools', 'lib_map_pools.js'));
const pools = JSON.parse(rd('canonical/map-pools.json')).maps;

// ---- 1. the derived pools, worked out from the files
const mapById = {}; G.CONQUEST_MAPS.forEach(m=> mapById[m.id] = m);
const skip = m=> !m || m.id === 'mtut' || m.endless || m.tower || m.reserved;
const first = {};
Object.entries(pools).forEach(([top, raw])=>{ if(skip(mapById[top])) return; const e = normalizeEntry(raw);
  const note = (id, loc)=>{ if(skip(mapById[loc])) return; const n = G.mapUnlockNumberOf(loc); if(n == null) return; if(first[id] == null || n < first[id]) first[id] = n; };
  e.cards.concat(e.special).forEach(id=> note(id, top)); Object.entries(e.submaps).forEach(([s, ids])=> ids.forEach(id=> note(id, s))); });
const basicSrc = d=> d.source && d.source.kind === 'pack' && (parseInt(d.source.tier, 10) || 1) <= 10;
const want = id=>{ const d = D[id]; if(d.token || d.test || d.easterEgg || !basicSrc(d) || first[id] == null) return 0; return Math.floor(first[id] / 7) + 1; };
const ids = Object.keys(D).filter(id=> !D[id].token && !D[id].test && !D[id].easterEgg);
const wrong = ids.filter(id=> (want(id) || 0) !== (G.basicPackTierOf(D[id]) || 0) && !(basicSrc(D[id]) === false && G.basicPackTierOf(D[id]))); // (an extras card has its own check, 3.)
ok(!wrong.length, `1. every basic-pack card is in the pack of its first map list (Pack N = Maps 7(N-1)-7N-1): ${wrong.slice(0, 6).join(', ')}`);
ok([[0, 1], [6, 1], [7, 2], [13, 2], [14, 3], [20, 3], [21, 4], [27, 4]].every(([n, t])=> G.packTierOfMapNumber(n) === t) && G.packMapRange(3).join() === '14,20', '1. the ranges: Pack 1 Maps 0-6, Pack 2 7-13, Pack 3 14-20, Pack 4 21-27');
{ const moved = ids.filter(id=> basicSrc(D[id]) && want(id) && want(id) !== (parseInt(D[id].source.tier, 10) || 1));
  ok(moved.length > 0 && moved.every(id=> G.basicPackTierOf(D[id]) === want(id)), `1. source.tier is not read: ${moved.length} cards whose first list is in another pack follow the list (e.g. ${moved.slice(0, 3).join(', ')})`); }
{ const fac = ids.find(id=> D[id].source && D[id].source.kind === 'pack' && +D[id].source.tier === 11), mys = ids.find(id=> D[id].source && D[id].source.kind === 'pack' && +D[id].source.tier === 99);
  ok(fac && G.basicPackTierOf(D[fac]) === 0 && G.cardObtainableFrom(D[fac]) === 'pack', '1. a Factions-pool card keeps its own pool (source tier 11), in no basic pack');
  ok(!mys || (G.basicPackTierOf(D[mys]) === 0 && G.cardObtainableFrom(D[mys]) === 'pack'), '1. a Mystery Booster card keeps its own pool (source tier 99)'); }
ok(/function packPoolOf\(d\)\{ const src = cardSourceOf\(d\); if\(src\.kind==='pack' && !isBasicPackSource\(src\)\) return parseInt\(src\.tier, 10\) \|\| 1; return basicPackTierOf\(d\); \}/.test(app), '1. packPoolOf (packCardPool, every giver) reads basicPackTierOf for basic packs');
ok(/const e = mpEntry\(top\);/.test(app) && /function mpChanged\(kind\)\{ if\(kind !== 'status'\) packIndexReset\(\);/.test(app), '1. derived at load from the map lists with the live edits (mpEntry), recomputed when a list changes (mpChanged)');

// ---- 2. not in any list: not obtainable, data kept, Map 0
const gone = ids.filter(id=> basicSrc(D[id]) && first[id] == null);
ok(gone.length > 0 && gone.every(id=> G.cardObtainableFrom(D[id]) === null && G.isUnattainable(D[id]) && G.cardObtainMap(D[id]) === 0), `2. ${gone.length} basic-pack cards in no map list: not obtainable, Map 0 (e.g. ${gone.slice(0, 3).join(', ')})`);
{ const cards = JSON.parse(rd('canonical/cards.json')), byId = {}; cards.forEach(c=> byId[c.id] = c);
  ok(gone.every(id=> byId[id] && byId[id].source && byId[id].source.kind === 'pack' && byId[id].attack != null), '2. their card data (source, stats) is kept'); }
ok(/'Not obtainable yet'/.test(app) && /cdpNotObtainableText/.test(app) && /\{kind:'unsorted', auto:true, packless:true\}/.test(app), '2. they read "Not obtainable yet" where the game shows sources (card detail, placement panel, Codex)');
{ const om = JSON.parse(rd('canonical/card-obtain-maps.json')).maps, stale = ids.filter(id=> (om[id] || 0) !== G.cardObtainMap(D[id]));
  ok(!stale.length, '2. canonical/card-obtain-maps.json is current (node tools/forge_curve_2026_10_19.js maps): ' + stale.slice(0, 5).join(', ')); }
{ const listed = ids.filter(id=> G.basicPackTierOf(D[id]) && first[id] != null);
  ok(listed.every(id=> G.cardFirstMapList(D[id]).n === first[id]), '2. a pack card\'s map is its first map list (cardFirstMapList)'); }

// ---- 3. the extras
const ex = JSON.parse(rd('canonical/pack-extras.json'));
ok(['1', '2', '3', '4'].every(k=> Array.isArray(ex[k])) && Object.keys(ex).filter(k=> !k.startsWith('_')).every(k=> ex[k].every(id=> D[id])), '3. canonical/pack-extras.json: a list per pack ("1".."4"), every id a card');
ok(/__PACK_EXTRAS__/.test(rd('assemble_arena.py')) && /const PACK_EXTRAS_BASE = __PACK_EXTRAS__;/.test(app), '3. the build inlines it');
{ // evaluate the index with a stand-in extras list: a card in no map list joins Pack 2; a map-list card stays in its list's pack
  const names = ['PACK_MAPS_PER_TIER', 'packIdxCache', 'packIndexReset', 'packTierOfMapNumber', 'packMapRange', 'packListSkipped', 'packExtrasList', 'packIndex', 'packIndexBuild', 'cardFirstMapList', 'isBasicPackSource', 'basicPackTierOf', 'mpClean', 'mpEntry'];
  const lone = gone[0], inList = ids.find(id=> G.basicPackTierOf(D[id]) === 1), unsorted = ids.find(id=> !D[id].source && D[id].locked && first[id] == null && D[id].rarity !== 'starter' && G.cardSourceOf(D[id]).kind === 'unsorted');
  const extras = {'2': [lone, inList].concat(unsorted ? [unsorted] : [])};
  const f = new Function('CONQUEST_MAPS', 'mapUnlockNumberOf', 'cardSourceOf', 'isEasterEgg', 'MAP_POOLS_BASE', 'PACK_EXTRAS_BASE', 'getShopPacks',
    'let mapPoolEdits = {};\n' + names.map(n=> B.grab(n)).join('\n') + '\nreturn {basicPackTierOf, packIndexReset};');
  const X = f(G.CONQUEST_MAPS, G.mapUnlockNumberOf, G.cardSourceOf, d=> !!d.easterEgg, {maps: pools}, extras, undefined);
  ok(X.basicPackTierOf(D[lone]) === 2 && X.basicPackTierOf(D[inList]) === 1, `3. an extras card joins its pack (${lone} -> Pack 2); a map-list card stays in its list's pack`);
  ok(!unsorted || X.basicPackTierOf(D[unsorted]) === 2, '3. an extras card joins whatever its source (an unsorted one)');
  const Y = f(G.CONQUEST_MAPS, G.mapUnlockNumberOf, G.cardSourceOf, d=> !!d.easterEgg, {maps: pools}, extras, ()=> [{id: 'silver', pool: 2, extras: []}]);
  ok(Y.basicPackTierOf(D[lone]) === 0, '3. a pack table\'s live `extras` wins over the file'); }
ok(/function packEditorExtrasEdit\(packs, p, id, on\)/.test(app) && /packEditorExtrasEdit\(packs, p, id, true\)/.test(app) && /packEditorExtrasEdit\(packEditorDraft, p, b\.dataset\.peRemove, false\)/.test(app), '3. the Pack editor adds and removes a basic pack\'s extras');
ok(['function applyCloudShopPacks', 'function saveShopPacksOverride', 'function resetShopPacksOverride'].every(h=>{ const i = app.indexOf(h); return i > 0 && app.slice(i, i + 400).includes('packIndexReset()'); }), '3. a new pack table clears the cache');

// ---- 4. the packs still open, unchanged sizes, weights and foils
for(const t of [1, 2, 3]){ const n = ids.filter(id=> G.basicPackTierOf(D[id]) === t && D[id].cardType !== 'spell' && D[id].cardType !== 'equipment').length; ok(n >= 5, `4. Pack ${t}'s pool holds ${n} cards (at least 5: a Collector pack without a repeat)`); }
ok(/\{id:'bronze', packNo:1, name:'Hedgerow Pouch', icon:'🌿', cost:\{gold:50, gems:0\}, collectorCost:\{gold:300, gems:0\}, cards:3, [^\n]*pool:1 [^\n]*foilChance:0\.01, foilGuaranteed:false\}/.test(app)
  && /\{id:'silver', packNo:2, [^\n]*cards:3, [^\n]*pool:2 [^\n]*foilChance:0\.015,/.test(app) && /\{id:'gold', packNo:3, [^\n]*cards:3, [^\n]*pool:3 [^\n]*foilChance:0\.02,/.test(app)
  && /const PACK_RARITY_WEIGHT = \{special:0, devlegendary:0, devancient:0, eventlegendary:0, eventrare:0, starter:6, common:6, uncommon:3, quest:0, rare:1\.5,/.test(app), '4. pack sizes, pools 1 / 2 / 3, rarity weights and foil chances unchanged');

// ---- 5. the Map cards button and overlay; texts
ok(/id="cnpAdminClear"[^\n]*✅ Mark cleared<\/button><button type="button" class="btn small ghost" id="cnpMapCards" aria-haspopup="dialog">\$\{escapeHtml\(TX\('ui\.pk1-map-cards-btn'\)\)/.test(app), '5. 🃏 Map cards sits with Edit skirmish / Edit rewards / Mark cleared (admins only)');
ok(/getElementById\('cnpMapCards'\); if\(mc\) mc\.addEventListener\('click', \(\)=> pk1OpenMapCards\(map\.id\)\)/.test(app), '5. it opens the overlay');
{ const i = app.indexOf('function pk1OpenMapCards('), body = app.slice(i, app.indexOf('\nfunction ', i + 10));
  ok(/mapPoolSections\(top\)/.test(body) && /vis4MapCardTilesHTML\(ids, defs, \{packs: true\}\)/.test(body) && /wireRewardZoom\(ov\)/.test(body) && /Escape/.test(body), '5. the overlay: every list of the map (MAP, side maps, SPECIAL), VIS4\'s tiles with zoom tooltips, Escape closes'); }
ok(/const tiles = vis4MapCardTilesHTML\(shown, defs\);/.test(app) && /\$\{vis4MapCardsHTML\(map, selectedNode\)\}/.test(app), '5. VIS4\'s "This map\'s cards" stays at the foot of the panel, on the same tiles');
ok(/\.pk1-mc-modal\{/.test(rd('arena_template.html')), '5. its CSS');
{ const T = require(path.join(ROOT, 'bramblewood-texts.js')).TEXT, keys = ['ui.pk1-map-cards-btn', 'ui.pk1-map-cards-title', 'ui.pk1-map-cards-sub', 'ui.pk1-in-pack', 'ui.pk1-not-in-pack'];
  ok(keys.every(k=> T[k]), '5. the TX keys exist');
  const codes = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];
  ok(codes.every(c=>{ const p = JSON.parse(rd('lang/' + c + '.json')); return keys.every(k=> p[T[k]]); }), '5. each has a row in all 12 language packs'); }

console.log(`pack1: ${checks - fail}/${checks} checks passed`);
process.exit(fail ? 1 : 0);
