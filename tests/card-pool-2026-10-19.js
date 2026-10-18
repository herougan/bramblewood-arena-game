#!/usr/bin/env node
// 2026-10-19 (package AN, owner 23:04: "More thematic animals — don't worry, I'll pick and choose when balancing for a map (5–10 new
// cards per map — from skirmish-only rewards and pack), like pin cushions (uni = sea urchins) and sea snakes ... Do the polar ones in
// advance"; 23:32: "we don't have a really scary spider"). The candidate pool: cards marked "pool": true in canonical/cards.json.
//   1. the pool: 5–8 cards for each of Maps 0–12, a polar set on the tundra / ice / taiga maps, the owner's examples (a sea urchin
//      with Thorns, a sea snake with Poison and Tide, the scary spider), names new to the game, flavour under 20 words;
//   2. every pool card fits budget v3 (tools/skill_costs.js), uses only skills the cost table knows, is within its map's skirmish
//      rarity cap, and its creatorNote shows N, S, both rules and a win rate inside its rarity band;
//   3. kept out of the live game: no source (so no pack, reward or base card), in no map deck, left out of the build's card list and
//      card hash, the card matrix, the ghost / auto-battle pools, the egg pool, the deck tools and card_balance.js's full report;
//   4. shown in Admin: the build carries them in POOL_CARD_DEFS; Manage Cards has the "Pool cards" filter, which lists them by map,
//      tagged Pool, and opens one in the editor as a new card to place;
//   5. translated: names in every lang/cards pack, flavour in every lang/ui pack, the filter's texts in every main pack; emoji in all
//      three shipped sets.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const read = rel=> fs.readFileSync(path.join(ROOT, rel), 'utf8'), readJSON = rel=> JSON.parse(read(rel));
const src = read('arena_app.js');
const cards = readJSON('canonical/cards.json');
const allPool = cards.filter(c=> c.pool), live = cards.filter(c=> !c.pool);
// 2026-10-19 (package GI): the checks of this pool's own make-up (counts per map, polar set, measured win rates) read package AN's cards;
// the pool-wide rules (out of the game, the build, the Admin list) read every pool card, GI's skill examples too.
const pool = allPool.filter(c=> !/package GI/.test(c.creatorNote || ''));
const slice = (a, b)=>{ const i = src.indexOf(a), j = src.indexOf(b, i); if(i < 0 || j < 0) throw new Error('missing ' + a); return src.slice(i, j); };
// eslint-disable-next-line no-eval
const RR = eval(slice('// ROAD_RARITY:BEGIN', '// ROAD_RARITY:END') + ';({roadRarityCap, roadRarityStep, roadRarityOk})');
const i0 = src.indexOf('const CONQUEST_MAPS = ['), j0 = src.indexOf('\n];', i0);
// eslint-disable-next-line no-eval
const MAPS = eval(src.slice(i0 + 'const CONQUEST_MAPS = '.length, j0 + 2));
const mains = MAPS.filter(m=> !m.sub && !m.reserved);
const numOf = id=>{ const m = MAPS.find(x=> x.id === id); return m ? mains.indexOf(m.sub ? MAPS.find(x=> x.id === m.parent) : m) : -1; };

// ---- 1. the pool
ok(pool.length >= 90, `the pool has its cards (${pool.length})`);
ok(pool.every(c=> c.pool === true && MAPS.some(m=> m.id === c.poolMap) && ['skirmish', 'pack'].includes(c.poolSlot)), '1. each has pool: true, a real poolMap and a poolSlot (skirmish / pack)');
for(let k = 0; k <= 12; k++){ const m = mains[k], cnt = pool.filter(c=> c.poolMap === m.id).length; ok(cnt >= 5 && cnt <= 8, `1. Map ${k} (${m.name}) has 5–8 pool cards (${cnt})`); }
const polar = pool.filter(c=> ['m6', 'mi', 'mt'].includes(c.poolMap));
ok(polar.length >= 8, `1. a polar set on the tundra / ice / taiga maps (${polar.length})`);
['polar-bear', 'harp-seal-pup', 'beluga', 'arctic-tern', 'musk-ox-calf'].forEach(id=> ok(polar.some(c=> c.id === id), `1. polar set has ${id}`));
ok(polar.every(c=> (c.resist || []).includes('cold')), '1. the polar cards resist Cold');
const urchin = pool.find(c=> /urchin/i.test(c.name)); ok(urchin && urchin.effects.thorns >= 1 && (urchin.archetypes || []).includes('Coastal'), '1. owner: a sea urchin with Thorns on a coastal map');
const snakes = pool.filter(c=> /sea (snake|krait)/i.test(c.name));
ok(snakes.length >= 1 && snakes.every(c=> c.effects.tide && (c.effects.poison || c.effects.venomous)), '1. owner: sea snakes, Poison (or Venomous) and Tide (Swimmer = Tide)');
const spider = pool.find(c=> c.id === 'giant-cave-huntsman');
ok(spider && ['rare', 'veryrare', 'epic'].includes(spider.rarity) && spider.effects.poison && spider.effects.pounce && /owner request/i.test(spider.creatorNote), '1. owner 23:32: the scary spider (Rare+, Poison, Pounce), flagged owner request');
['Mink', 'Water Vole', 'Muskrat', 'Water Shrew', 'Desman', 'Grey Seal'].forEach(w=> ok(pool.some(c=> c.name.includes(w)), `1. a temperate water-going mammal: ${w}`));
const liveNames = new Set(live.map(c=> c.name.toLowerCase())), liveIds = new Set(live.map(c=> c.id));
ok(pool.every(c=> !liveNames.has(c.name.toLowerCase()) && !liveIds.has(c.id)), '1. no pool card repeats a live card\'s name or id');
ok(new Set(pool.map(c=> c.name)).size === pool.length, '1. pool names are unique');
const long = pool.filter(c=> c.flavor.trim().split(/\s+/).length >= 20); ok(!long.length, `1. flavour under 20 words (${long.map(c=> c.id)})`);
ok(new Set(cards.map(c=> c.numericId)).size === cards.length && new Set(cards.map(c=> c.uuid)).size === cards.length, '1. numericIds and uuids are unique');

// ---- 2. budget, skills, rarity cap, win rate
const SC = require(path.join(ROOT, 'tools', 'skill_costs.js')), T = SC.make(readJSON('canonical/skill-costs.json'));
const BANDS = {common:[35, 60], uncommon:[45, 68], rare:[52, 75], veryrare:[56, 80], superrare:[60, 84], epic:[62, 87]};
pool.forEach(c=>{
  const b = T.budget(c);
  ok(b.ok, `2. ${c.id}: inside budget v3 (2A+H+S ${b.x1} < N ${b.N}, A·H+S ${b.x2} < ${b.N2})`);
  ok(!b.missing.length, `2. ${c.id}: every skill has a cost entry (${b.missing})`);
  ok(RR.roadRarityOk(c.rarity, numOf(c.poolMap), 'skirmish'), `2. ${c.id}: ${c.rarity} within the Map ${numOf(c.poolMap)} skirmish cap (${RR.roadRarityCap(numOf(c.poolMap), 'skirmish')})`);
  const note = c.creatorNote || '', wr = /Measured ([\d.]+)% over (\d+) games/.exec(note), band = BANDS[c.rarity];
  ok(/N = /.test(note) && /S = /.test(note) && /2A\+H\+S/.test(note) && /A\*H\+S/.test(note), `2. ${c.id}: the creatorNote shows N, S and both rules`);
  ok(note.includes(String(b.N)) && note.includes(String(b.N2)), `2. ${c.id}: the note's N and (N/3)^2 match the card`);
  ok(wr && +wr[1] >= band[0] && +wr[1] <= band[1], `2. ${c.id}: its measured win rate is in the ${c.rarity} band (${wr && wr[1]}%)`);
  ok(c.effects && !('swimmer' in c.effects), `2. ${c.id}: uses Tide, not the retired Swimmer`);
});

// ---- 3. out of the live game
ok(pool.every(c=> !c.source && c.locked === true && !c.basic && !c.hidden), '3. no source (no pack, reward or base card), locked');
const deckIds = new Set(); MAPS.forEach(m=> (m.nodes || []).forEach(nd=>{ Object.keys(nd.deck || {}).forEach(id=> deckIds.add(id)); (nd.leaders || []).forEach(id=> deckIds.add(id));
  ((nd.dungeon && nd.dungeon.waveDecks) || []).forEach(w=> w && Object.keys(w).forEach(id=> deckIds.add(id))); }));
ok(pool.every(c=> !deckIds.has(c.id)), '3. in no map deck');
const H = require('./lib/harness.js'), defs = H.loadCardDefs();
ok(pool.every(c=> !defs[c.id]) && !H.fieldableIds().some(id=> pool.some(c=> c.id === id)), '3. the test harness (card matrix) never sees them');
const I = require(path.join(ROOT, 'bramblewood-integrity.js'));
ok(I.cardDataHash(cards) === I.cardDataHash(live), '3. the card hash ignores pool cards (server list = built page)');
const html = read('index.html');
const lit = name=>{ const k = html.indexOf('const ' + name + ' = '); if(k < 0) return null; const s = k + ('const ' + name + ' = ').length;
  let depth = 0, q = false, e = s; for(; e < html.length; e++){ const ch = html[e]; if(q){ if(ch === '\\'){ e++; continue; } if(ch === '"') q = false; continue; }
    if(ch === '"') q = true; else if(ch === '{') depth++; else if(ch === '}'){ depth--; if(!depth) break; } }
  return JSON.parse(html.slice(s, e + 1)); };
const built = lit('CARD_DEFS_BASELINE'), builtPool = lit('POOL_CARD_DEFS');
ok(built && pool.every(c=> !built[c.id]), '3. the built page\'s card list leaves them out (rebuild?)');
ok(builtPool && pool.every(c=> builtPool[c.id] && builtPool[c.id].pool) && Object.keys(builtPool).length === allPool.length, '4. the built page carries them in POOL_CARD_DEFS (rebuild?)');
const vb = JSON.parse(read('version.json')); ok(built && vb.cardHash === I.cardDataHash(built), '3. version.json\'s card hash is the live cards\'');
const G = require(path.join(ROOT, 'bramblewood-ghosts.js'));
const withPool = Object.assign({}, defs); allPool.forEach(c=> withPool[c.id] = Object.assign({effects:{}}, c));
ok(fs.readFileSync(path.join(ROOT, 'bramblewood-ghosts.js'), 'utf8').includes('!defs[id].pool'), '3. ghost decks skip pool cards');
for(let s = 0; s < 3; s++){ const d = G.generateGhostDeck(withPool, s, 4242 + s); ok(!Object.keys(d.cards || d).some(id=> withPool[id] && withPool[id].pool), `3. a ghost deck (stage ${s}) has no pool card`); }
ok(/function pool\(defs\)\{[^\n]*!defs\[id\]\.pool/.test(read('bramblewood-autobattle.js')), '3. the auto-battle pool skips pool cards');
ok(/function eggPoolFor[\s\S]{0,600}!d\.pool/.test(read('bramblewood-engine.js')), '3. no egg hatches a pool card');
ok(/cardsRaw\.filter\(c=> !c\.pool\)/.test(read('tools/lib_bramble.js')), '3. the deck tools (lib_bramble.js, skirmish_pass.js) skip pool cards');
ok(/!defs\[id\]\.pool \|\| ONLY\.includes\(id\)/.test(read('tools/card_balance.js')) && read('tools/card_balance.js').includes("'--pool'"), '3. card_balance.js measures pool cards only with --only / --pool');
ok(/if c\.get\("pool"\): continue/.test(read('assemble_arena.py')), '3. assemble_arena.py leaves pool cards out of __CARD_DEFS__');

// ---- 4. Admin
const TXT = require(path.join(ROOT, 'bramblewood-texts.js'));
['ui.admin-pool-filter', 'ui.admin-pool-hint', 'ui.admin-pool-none', 'ui.admin-pool-tag', 'ui.admin-pool-map', 'ui.admin-pool-slot-skirmish', 'ui.admin-pool-slot-pack']
  .forEach(k=> ok(typeof TXT.TEXT[k] === 'string' && src.includes(`TX('${k}'`), `4. ${k} is a TX text the code uses`));
ok(/id="adminPoolOnlyChk"/.test(src) && /function adminManageCardsGridHTML\(\)\{[\s\S]{0,200}if\(adminPoolOnly\) return adminPoolGridHTML\(\);/.test(src), '4. Manage Cards has the Pool cards filter');
ok(/poolCardForEditor\(defId\)/.test(slice('function openCardEditor(', '\n}')), '4. a pool card opens in the card editor');
{ // run the Admin list with stubs
  const fn = name=>{ const a = src.indexOf('function ' + name + '('); let d = 0, k = src.indexOf('{', a); for(; k < src.length; k++){ if(src[k] === '{') d++; else if(src[k] === '}' && !--d) break; } return src.slice(a, k + 1); };
  const ctx = {POOL_CARD_DEFS: builtPool || {}, CONQUEST_MAPS: MAPS, adminCardSearch: '', adminPoolOnly: true, placed: {},
    getCardDefs: null, mapNumberOf: numOf, TX: (k, v)=> TXT.TX(k, v), escapeHtml: s=> String(s), escapeAttr: s=> String(s),
    cardTileHTML: (d, o)=> `<div class="card-tile ${o.extraClass}" data-defid="${d.id}"></div>`, JSON, Object, String};
  ctx.getCardDefs = ()=> Object.assign({}, ctx.placed); // the live cards: only what a test "places"
  vm.createContext(ctx);
  vm.runInContext(['adminPoolCardIds', 'adminPoolGridHTML', 'poolCardForEditor'].map(fn).join('\n') + '\nthis.f = {adminPoolCardIds, adminPoolGridHTML, poolCardForEditor};', ctx);
  const ids = ctx.f.adminPoolCardIds(), grid = ctx.f.adminPoolGridHTML();
  ok(ids.length === allPool.length, `4. the filter lists every pool card (${ids.length})`);
  { const an = ids.filter(id=> pool.some(c=> c.id === id)); ok(numOf(ctx.POOL_CARD_DEFS[an[0]].poolMap) === 0 && ['m6', 'mi'].includes(ctx.POOL_CARD_DEFS[an[an.length - 1]].poolMap), '4. grouped by map, Map 0 first, the tundra last (of this pool)');
    ok(ids.every((id, i)=> !i || numOf(ctx.POOL_CARD_DEFS[ids[i - 1]].poolMap) <= numOf(ctx.POOL_CARD_DEFS[id].poolMap) || numOf(ctx.POOL_CARD_DEFS[id].poolMap) < 0), '4. every pool card in map order'); }
  ok((grid.match(/class="admin-pool-tag">Pool/g) || []).length === allPool.length && /admin-pool-head/.test(grid) && grid.includes('Map 17'), '4. each tile is tagged Pool, under its map\'s heading');
  ctx.placed['water-vole'] = {id:'water-vole'}; ok(!ctx.f.adminPoolCardIds().includes('water-vole'), '4. a placed (live) card drops off the pool list');
  const ed = ctx.f.poolCardForEditor('pincushion-urchin'); ok(ed && !ed.pool && !ed.poolMap && ed.source && ed.source.kind === 'map' && ed.source.id === 'mb', '4. placing opens it as a live card with its map pre-filled under From');
  ctx.adminCardSearch = 'urchin'; ok(ctx.f.adminPoolCardIds().length === 1, '4. the search narrows the pool list too');
}

// ---- 5. translations and emoji
const CODES = ['de', 'es', 'fr', 'id', 'it', 'ja', 'ko', 'pt', 'ta', 'tl', 'zh-Hans', 'zh-Hant'];
for(const code of CODES){
  const names = readJSON(`lang/cards/${code}.json`), ui = readJSON(`lang/ui/${code}.json`), main = readJSON(`lang/${code}.json`);
  const noName = pool.filter(c=> !names[c.name] && !main[c.name]), noFlav = pool.filter(c=> !ui[c.flavor] && !main[c.flavor]);
  ok(!noName.length, `5. ${code}: every pool card name (${noName.map(c=> c.name).slice(0, 4)})`);
  ok(!noFlav.length, `5. ${code}: every pool flavour line (${noFlav.map(c=> c.id).slice(0, 4)})`);
  ok(['ui.admin-pool-filter', 'ui.admin-pool-tag', 'ui.admin-pool-hint'].every(k=> main[TXT.TEXT[k]]), `5. ${code}: the Pool cards filter's texts`);
}
const SETS = ['fluent', 'noto', 'twemoji'].map(s=> new Set(Object.keys(readJSON(`tools/emoji/sets/${s}.json`).emoji)));
const key = e=> [...e].map(ch=> ch.codePointAt(0).toString(16)).filter(h=> h !== 'fe0f').join('-');
const noEmoji = pool.filter(c=> !SETS.every(s=> s.has(key(c.icon)))); ok(!noEmoji.length, `5. every pool icon is in all three emoji sets (${noEmoji.map(c=> c.id + ' ' + c.icon)})`);

console.log(`card-pool-2026-10-19: ${n - fail}/${n} checks passed`);
process.exit(fail ? 1 : 0);
