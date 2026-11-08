#!/usr/bin/env node
// Package CONTENT18 (2026-11-08, owner 10:52 rows 8, 12, 14; 09:27 row 7). The browser run is tests/e2e/content18_2026_11_08.py
// (screens docs/screens/content18/).
//   1. shooters: one ranged card per element the engine has rules for (canonical/skill-delivery.json ranged), on no map list, existing unused
//      cards first, the new ones simple common names, every one inside the budget at its suggested map;
//   2. star path cards: one card mark per Wildpaths trail (r8 / t8 / b8), Epic or rarer, source {kind:'starpath'}, obtainable only there
//      (no pack, no list, no fuse), in budget at Map 21; learning the mark grants the card; the Codex pill / section say Star path;
//   3. the Canopy Bower: habitatBonus {Rainforest, Savanna, +1/+2} in the engine (on play, on a Leader summon, a non-habitat unit unchanged),
//      The Canopy's five fights defend it (Savanna Reaches keeps the Acacia Kraal), the fights' fields are canopy ones;
//   4. texts in 12 packs, art prompts, docs, the build.
//   node tests/content18-2026-11-08.js
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const ROOT = H.ROOT, E = H.Engine;
const rd = rel=> fs.readFileSync(path.join(ROOT, rel), 'utf8');
const app = rd('arena_app.js'), eng = rd('bramblewood-engine.js'), tpl = rd('arena_template.html');
const T = require(path.join(ROOT, 'bramblewood-texts.js')).TEXT;
const C = require(path.join(ROOT, 'tools', 'content18_2026_11_08.js'));
const SC = require(path.join(ROOT, 'tools', 'skill_costs.js')), TB = SC.make(JSON.parse(rd('canonical/skill-costs.json')));
const L = require(path.join(ROOT, 'tools', 'lib_map_pools.js'));
const G = require(path.join(ROOT, 'tools', 'lib_bramble.js')).G;
const cards = JSON.parse(rd('canonical/cards.json')), by = Object.fromEntries(cards.map(c=> [c.id, c]));
const chars = JSON.parse(rd('canonical/characters.json'));
const DELIV = JSON.parse(rd('canonical/skill-delivery.json'));
const pools = JSON.parse(rd('canonical/map-pools.json')), listed = L.listedIds(pools);
const extras = JSON.parse(rd('canonical/pack-extras.json'));
const roadListed = (()=>{ const p2 = JSON.parse(JSON.stringify(pools)); Object.values(p2.maps).forEach(e=> ['mm', 'muc', 'mlb'].forEach(k=> { if(e.submaps) delete e.submaps[k]; })); return L.listedIds(p2); })(); // lib_map_pools PARENT_POOL_SUBS: they draw from many maps, and name no card's map
const inExtras = id=> Object.values(extras).some(v=> Array.isArray(v) && v.includes(id));
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const ranged = fx=> Object.keys(fx || {}).some(k=> DELIV.delivery[k] === 'ranged') || ((fx || {}).triggers || []).some(t=> DELIV.delivery['action:' + (t.do || t.action)] === 'ranged');

// ---- 1. shooters -----------------------------------------------------------------------------------------------------------------------
const ELEMENTS = ['physical', 'heat', 'cold', 'shock', 'poison', 'acid', 'water', 'decay', 'magic'];
ok(ELEMENTS.every(el=> C.SHOOTERS.some(s=> s.element === el)) && C.SHOOTERS.length === ELEMENTS.length, '1 one shooter for each element the engine has rules for');
const DT = (app.match(/const DMG_TYPES = \[([^\]]+)\]/) || [])[1] || '';
ok(['stone', 'metal'].every(x=> DT.includes(`'${x}'`)) && !/dmgType ?=== ?'stone'|dmgType ?=== ?'metal'/.test(eng), '1 stone / metal are editor names only (no engine rule): no shooter for them');
const BOLT_EL = {fireBolt: 'heat', fireArrow: 'heat', iceBolt: 'cold', iceArrow: 'cold', shockBolt: 'shock', poisonBolt: 'poison', acidBolt: 'acid', arrow: 'physical'};
C.SHOOTERS.forEach(s=>{
  const c = by[s.id]; ok(!!c, `1 ${s.id} exists`); if(!c) return;
  ok(ranged(c.effects), `1 ${s.id} is ranged (canonical/skill-delivery.json)`);
  const fx = c.effects || {}, el = Object.keys(fx).map(k=> BOLT_EL[k]).find(Boolean) || ((fx.triggers || []).find(t=> (t.do || t.action) === 'damage') || {}).dmgType;
  ok(el === s.element, `1 ${s.id} shoots ${s.element} (${el})`);
  ok(!roadListed.has(s.id) && !inExtras(s.id), `1 ${s.id} is on no map list (the endless dungeons' / tower's mixed lists aside) and in no pack's extras`);
  ok(L.budgetHold(s.id) === 'unplaced', `1 ${s.id} is out of play (unplaced)`);
  const b = TB.budget(Object.assign({}, c, {obtainMap: s.map[2]}), {level: 1});
  ok(b.ok, `1 ${s.id} fits the budget at its suggested map (Map ${s.map[2]}: 2A+H+S ${b.x1} / N ${b.N})`);
  ok(Object.keys(fx).filter(k=> k !== 'triggers').length + (fx.triggers || []).length <= 2, `1 ${s.id}: two skills at most`);
  if(s.new){ ok(c.awaitingSource && c.unattainable && /CONTENT18/.test(c.creatorNote || ''), `1 ${s.id} is new: awaitingSource, unattainable, a CONTENT18 note`);
    ok(c.name.split(/[\s-]+/).length <= 2 && !/[A-Z][a-z]+ean\b/.test(c.name), `1 ${s.id}: a simple common name (${c.name})`); }
});
ok(C.SHOOTERS.filter(s=> !s.new).length >= 5, '1 existing unused cards first (five reused)');
{ const ids = cards.map(c=> c.numericId).filter(x=> x != null); ok(new Set(ids).size === ids.length, '1 numericIds are unique'); }

// ---- 2. star path cards ----------------------------------------------------------------------------------------------------------------
const tree = app.slice(app.indexOf('const WILDPATH_TREES = ['), app.indexOf('let wildpathSel = null;'));
C.STARPATH.forEach(s=>{
  const c = by[s.id]; ok(!!c, `2 ${s.id} exists`); if(!c) return;
  ok(SC.LADDER.indexOf(c.rarity) >= SC.LADDER.indexOf('epic'), `2 ${s.id} is Epic or rarer (${c.rarity})`);
  ok(c.source && c.source.kind === 'starpath' && c.source.path === s.path && c.source.node === s.node, `2 ${s.id} source {kind:'starpath', path:'${s.path}', node:'${s.node}'}`);
  ok(c.locked === true && !c.unattainable && !c.awaitingSource, `2 ${s.id} is locked until claimed, and obtainable`);
  ok(new RegExp(`\\{id:'${s.node}'[^\\n]*card:'${s.id}'`).test(tree), `2 the ${s.path} trail has mark ${s.node} giving ${s.id}`);
  ok(!listed.has(s.id) && !inExtras(s.id), `2 ${s.id}: on no list at all, in no pack's extras`);
  ok(G.cardObtainableFrom(c) === 'starpath' && G.basicPackTierOf(c) === 0 && G.cardObtainMap(c) === C.STARPATH_MAP, `2 ${s.id}: obtainable from the star path only (from ${G.cardObtainableFrom(c)}, pack ${G.basicPackTierOf(c)}, map ${G.cardObtainMap(c)})`);
  const b = TB.budget(Object.assign({}, c, {obtainMap: C.STARPATH_MAP}), {level: 1});
  ok(b.ok, `2 ${s.id} fits the budget for its rarity at Map 21 (2A+H+S ${b.x1} / N ${b.N})`);
});
ok(['root', 'thorn', 'bloom'].every(p=> C.STARPATH.some(s=> s.path === p)), '2 one card on each trail');
ok(JSON.parse(rd('canonical/card-obtain-maps.json')).maps['thistle-baron'] === 21, '2 canonical/card-obtain-maps.json gives the star path cards Map 21');
ok(/starpath: 21 \/\* CONTENT18/.test(app) && /if\(src\.kind==='starpath'\) return 'starpath';/.test(app), '2 the game: OBTAIN_MAP_OF.starpath, cardObtainableFrom');
ok(/\['pack','map'\]\.includes\(cardSourceOf\(defs\[x\]\)\.kind\)/.test(app), '2 the Forge fuse draws from pack / map cards only');
ok(/r\[id\] = \(r\[id\]\|\|0\) \+ 1; try\{ localStorage\.setItem\(WILDPATH_KEY, JSON\.stringify\(r\)\); \}catch\(e\)\{\} if\(n\.card\) c18StarPathGrant\(n\);/.test(app), '2 learning a card mark grants its card');
ok(/function c18StarPathGrant\(n\)\{[^\n]*unlockCardForPlayer\(n\.card, 'starpath'\)/.test(app) && /ui27AchvCardsPending\.push\(n\.card\); ui27RevealAchvCards\(\);/.test(app), '2 the grant uses unlockCardForPlayer and the claim reveal');
ok(/'r8','t8','b8'/.test(app), '2 the card marks are live (no "Preview" line)');
ok(/c18-sp-pill[^\n]*TX\('ui\.c18-pill-starpath'\)/.test(app) && /function c18StarPathSection\(\)/.test(app), '2 the Codex pill says Star path, and the Codex groups the cards');
ok(/\.pl2-where-pill\.c18-sp-pill\{/.test(tpl) && /\.wp-node\.c18-sp-card-mark \.wp-dot\{/.test(tpl), '2 styles: the pill and the gold-ringed mark');
{ // the grant, evaluated: wildpathLearn with stubbed points spends the mark and calls unlockCardForPlayer('thistle-baron', 'starpath')
  const fnSrc = (name)=>{ const i = app.indexOf('function ' + name + '('); const j = app.indexOf('\n', i); const j2 = name === 'c18StarPathGrant' ? app.indexOf('\n', j + 1) : j; return app.slice(i, j2); };
  const got = []; const store = {};
  const ctx = {localStorage: {getItem: k=> store[k] || null, setItem: (k, v)=> { store[k] = v; }}, unlockCardForPlayer: (id, src)=> { got.push([id, src]); return true; },
    ui27AchvCardsPending: [], ui27RevealAchvCards: ()=> 0, wildpathPoints: ()=> ({total: 99}), WILDPATH_KEY: 'wp'};
  const trees = 'const WILDPATH_TREES = [' + tree.slice(tree.indexOf('[') + 1);
  const src = ['wildpathCost', 'wildpathRanks', 'wildpathSpent', 'wildpathAvailable', 'wildpathCanLearn', 'wildpathLearn', 'c18StarPathGrant'].map(fnSrc).join('\n');
  const f = new Function(...Object.keys(ctx), 'TX', 'getCardDefs', 'c18SpMarkName', 'c18SpMarkDesc', trees + '\n' + src + '\n store_r3: 0; const r = {r1: 1, r3: 1}; localStorage.setItem(WILDPATH_KEY, JSON.stringify(r)); const first = wildpathLearn("r8"); const second = wildpathLearn("r8"); return {first, second, cost: wildpathCost(WILDPATH_TREES[0].nodes.find(x=> x.id === "r8"))};');
  let res = null; try{ res = f(...Object.values(ctx), (k)=> k, ()=> ({}), ()=> '', ()=> ''); }catch(e){ console.log('   eval:', e.message); }
  ok(res && res.first === true && res.second === false && got.length === 1 && got[0][0] === 'thistle-baron' && got[0][1] === 'starpath', `2 evaluated: learning r8 once grants The Thistle Baron (${JSON.stringify(res)} ${JSON.stringify(got)})`);
  ok(res && res.cost === 15, '2 a card mark costs 15 (third step)');
}

// ---- 3. the Canopy Bower ---------------------------------------------------------------------------------------------------------------
const CB = chars.find(c=> c.id === 'canopy-bower');
ok(CB && CB.rarity === 'epic' && CB.unlockMap === 'my' && JSON.stringify(CB.effects) === JSON.stringify({habitatBonus: {kin: ['Rainforest', 'Savanna'], atk: 1, hp: 2}}), '3 canonical/characters.json: the Canopy Bower (Epic, Rainforest / Savanna +1/+2, unlocked by The Canopy)');
ok(/my:'canopy-bower'/.test(app) && /const id = \(m\.sub && MAP_CASTLE\[m\.id\]\) \|\| MAP_CASTLE\[m\.sub \? m\.parent : m\.id\];/.test(app), '3 MAP_CASTLE.my and a side map with its own entry defends it');
{ const m = G.CONQUEST_MAPS.find(x=> x.id === 'my'), s = G.CONQUEST_MAPS.find(x=> x.id === 'm5');
  const castleOf = (mid, nd)=>{ G.NODE_MAP_HINT.set(nd, mid); return (G.skirmishCastle(nd).character || {}).id; };
  ok(m.nodes.length === 5 && m.nodes.every(nd=> castleOf('my', nd) === 'canopy-bower'), '3 all five Canopy fights defend the Canopy Bower');
  ok(s.nodes.filter(nd=> nd.deck && !nd.characterId).every(nd=> castleOf('m5', nd) === 'acacia-kraal'), '3 Savanna Reaches keeps the Acacia Kraal');
  const CANOPY_KEYS = new Set(['phase', 'canopy', 'field', 'terrain', 'woods', 'aiGuardLethal', 'weatherMap']);
  m.nodes.forEach(nd=>{ const r = G.fightRules('my', nd); const odd = Object.keys(r).filter(k=> !CANOPY_KEYS.has(k));
    ok(r.canopy === true && r.field === 'rain' && r.woods === true && (!r.terrain || r.terrain.name === 'Old Woods') && !odd.length, `3 ${nd.key}: canopy fields only (High Canopy, rain, Old Woods${odd.length ? '; odd: ' + odd : ''})`); }); }
{ const U = (id, arch, o)=> Object.assign({id, name:id, attack:3, health:6, wait:0, cost:0, effects:{}, archetypes: arch}, o || {});
  const defs = Object.assign({}, H.loadCardDefs(), {'x-jungle': U('x-jungle', ['Rainforest']), 'x-plains': U('x-plains', ['Ape', 'Savanna']), 'x-pond': U('x-pond', ['Pond'])});
  const so = id=> id === 1 ? 'A' : 'B', all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
  const mk = ch=>{ const e = E.makeSimEngine(defs, E.mulberry32(18), {recordEvents:true, battleMode:'open'}); return {e, P:{1: e.newPlayer(1, {}, ch), 2: e.newPlayer(2, {}, {id:'st-hq', health:500, effects:{}})}}; };
  { const {e, P} = mk(CB); P[1].lumber = 20;
    P[1].hand.push({uid: 98101, defId: 'x-jungle'}, {uid: 98102, defId: 'x-plains'}, {uid: 98103, defId: 'x-pond'});
    e.placeCard(P, so, 1, 98101, 'left', {}, []); P[1].playedThisTurn = false; e.placeCard(P, so, 1, 98102, 'center', {}, []); P[1].playedThisTurn = false; e.placeCard(P, so, 1, 98103, 'right', {}, []);
    const u = id=> all(P[1]).find(c=> c.defId === id), s = c=> c ? c.atk + '/' + c.maxHp : '-';
    ok(s(u('x-jungle')) === '4/8' && s(u('x-plains')) === '4/8', `3 engine: a Rainforest and a Savanna unit played: 3/6 -> 4/8 (${s(u('x-jungle'))}, ${s(u('x-plains'))})`);
    ok(s(u('x-pond')) === '3/6', `3 engine: another unit unchanged (${s(u('x-pond'))})`);
    const {e: e2, P: P2} = mk(CB); P2[1].lumber = 20; e2.summonLeader(P2, so, 1, 'x-jungle', 'center', {}, []); const Ld = all(P2[1]).find(c=> c.isLeader);
    ok(Ld && Ld.atk === 4 && Ld.maxHp === 8, `3 engine: a Rainforest Leader summoned: 4/8 (${s(Ld)})`); }
  { const {e, P} = mk({id:'st-hq', health:500, effects:{}}); P[1].hand.push({uid: 98111, defId: 'x-jungle'}); e.placeCard(P, so, 1, 98111, 'left', {}, []);
    const c = all(P[1]).find(x=> x.defId === 'x-jungle'); ok(c && c.atk === 3 && c.maxHp === 6, '3 engine: another bramble: printed stats'); } }
ok(/try\{ if\(E\.c18HabitatBonus\) E\.c18HabitatBonus\(P2, c\); \}catch\(e\)\{\}/.test(app), '3 the CPU wave summons get it too');
ok(/\{key:'habitatBonus', icon:'🌴', label:\(\)=> TX\('ui\.c18-fx-habitat'\)\}/.test(app) && /TX\('ui\.c18-habitat-desc'/.test(app), '3 the brambles list filters by it and its line describes it');
{ const j = JSON.parse(rd('docs/balance/content18-canopy-2026-11-08.json')); ok(j.games >= 40 && j.rows.length === 5 && j.rows.every(r=> r.castle === 'canopy-bower' && typeof r.kraal === 'number' && typeof r.bower === 'number'), '3 the 40-game Canopy measure is recorded for the five fights'); }

// ---- 4. texts, art, docs, build --------------------------------------------------------------------------------------------------------
const KEYS = ['ui.c18-habitat-desc', 'ui.c18-fx-habitat', 'ui.c18-where-starpath', 'ui.c18-pill-starpath', 'ui.c18-sec-starpath-tip', 'ui.c18-sp-mark-name', 'ui.c18-sp-mark-desc', 'ui.c18-sp-only'];
const CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];
ok(KEYS.every(k=> typeof T[k] === 'string' && T[k]), '4 the eight TX keys exist');
const newCards = C.SHOOTERS.filter(s=> s.new).concat(C.STARPATH.filter(s=> s.new)).map(s=> by[s.id]).filter(Boolean);
CODES.forEach(code=>{ const ui = JSON.parse(rd(`lang/${code}.json`)), cn = JSON.parse(rd(`lang/cards/${code}.json`)), fl = JSON.parse(rd(`lang/ui/${code}.json`));
  ok(KEYS.every(k=> ui[T[k]]) && ui['Rainforest'] && ui['Savanna'], `4 ${code}: the texts`);
  ok(newCards.every(c=> cn[c.name] && fl[c.flavor]), `4 ${code}: the new cards' names and flavours`); });
{ const art = rd('docs/art-style-prompts.md'), sec = art.slice(art.indexOf('package CONTENT18'));
  ok(newCards.every(c=> sec.includes('### ' + c.name)) && sec.includes('### Canopy Bower'), '4 art prompts for every new card and the bramble');
  const bad = ['spear', 'sword', 'arrow', 'dagger', 'blade', 'weapon', 'spiked', 'studded', 'monitor', 'sperm', 'corpse', 'no clothes'];
  ok(!bad.some(w=> sec.toLowerCase().includes(w)), '4 the prompts avoid the banned words');
  ok(sec.split('\n').filter(l=> l.startsWith('> ')).every(l=> /background/.test(l)), '4 every prompt has a background'); }
ok(/Package CONTENT18/.test(rd('docs/CHANGELOG.md')) && /"CONTENT18-1"/.test(rd('docs/decisions.json')) && /Package CONTENT18/.test(rd('docs/action-items.md')), '4 CHANGELOG, decisions, action items');
{ const d = JSON.parse(rd('docs/decisions.json')).items.filter(x=> /^CONTENT18-/.test(x.id)); ok(d.length === 3 && d.every(x=> (x.body + ' ' + x.options.join(' ')).split(/\s+/).length < 100), '4 three decisions, each under 100 words'); }
ok(/run node tests\/content18-2026-11-08\.js/.test(rd('tests/run-all.sh')), '4 listed in run-all.sh');
{ const html = rd('index.html'); ok(html.includes('canopy-bower') && html.includes('c18StarPathGrant') && html.includes('c18HabitatBonus'), '4 the build carries the bramble, the grant and the engine hook'); }

console.log(`content18: ${n - fail}/${n} ok`);
process.exit(fail ? 1 : 0);
