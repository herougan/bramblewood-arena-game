#!/usr/bin/env node
// Package UI13 (2026-11-01; owner 11-01 00:29, HH1, HH3, HH4, HH7). The browser run is tests/e2e/ui13_2026_11_01.py (shots in tests/e2e/shots/ui13/).
//   1. HH1 data: kind "baby" on exactly the BABY list of tools/theme4/plan_2026_11_01.py; no other kind value is stored (Base and Faction are
//      worked out: cardKindOf); the card detail and the editor read it; the gallery's counts and targets leave Baby cards out.
//   2. HH7: rv2TagsOf gives an "Unlikely" pill whose tooltip is the entry's flagWhy; a Baby card shows Baby instead of Unique / Carried.
//   3. HH4: the Torch: common equipment, grant {illuminate: true} (the existing Illuminate keyword), the next numericId (unique), a secret card of m4,
//      awaitingSource; the engine gives the wearer Illuminate once the piece takes hold; the map code gates it on the lit pit, once per save.
//   4. HH3: the ✏️ opens edOpenCardEditor (the existing editor and its save path) and redraws the tile on close.
//   5. texts: every UI13 TX key exists; the built-name lookups are spelled out (keyify-safe).
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const ROOT = path.join(__dirname, '..');
const rd = rel=> fs.readFileSync(path.join(ROOT, rel), 'utf8');
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  ✗', m); } };
const app = rd('arena_app.js'), css = rd('arena_template.html'), texts = rd('bramblewood-texts.js');
function fnSrc(name){
  const a = app.indexOf('\nfunction ' + name + '('); if(a < 0) return '';
  let i = app.indexOf('{', a), depth = 0;
  for(; i < app.length; i++){ const ch = app[i]; if(ch === '{') depth++; else if(ch === '}'){ depth--; if(!depth) break; } }
  return app.slice(a + 1, i + 1);
}
const cards = JSON.parse(rd('canonical/cards.json')), byId = {}; cards.forEach(c=> byId[c.id] = c);

// ---- 1. HH1 data ---------------------------------------------------------------------------------------------------------------
const plan = rd('tools/theme4/plan_2026_11_01.py'), m = plan.match(/BABY = \[([\s\S]*?)\]/);
const BABY = m ? [...m[1].matchAll(/'([a-z0-9-]+)'/g)].map(x=> x[1]) : [];
ok(BABY.length === 21, `the BABY list is read (${BABY.length})`);
ok(BABY.every(id=> byId[id] && byId[id].kind === 'baby'), 'every BABY card has kind "baby" (' + BABY.filter(id=> !(byId[id] && byId[id].kind === 'baby')).join(', ') + ')');
const kinds = cards.filter(c=> 'kind' in c);
ok(kinds.every(c=> c.kind === 'baby') && kinds.length === BABY.length, `only Baby is stored, and only on the list (${kinds.length} cards with a kind)`);
const K = new Function(fnSrc('cardKindOf') + '\nreturn cardKindOf;')();
ok(K(byId['caiman-hatchling']) === 'baby' && K(byId['duckling']) === 'baby' && K(byId['otter-paddler']) === 'faction' && K(byId['cobalt-talon-skirmisher']) === 'faction' && K(byId['grass-viper']) === 'base',
  'cardKindOf: Baby wins (Duckling is a faction starter but Baby), a faction card is Faction, the rest Base');
ok(/cardKindChipHTML\(d\) \/\* 2026-11-01 \(package UI13, HH1\)/.test(fnSrc('openCardDetail')), 'the card detail shows the kind chip beside the rarity');
ok(/id="fKind"/.test(app) && /if\(k\.value === 'baby'\) c\.kind = 'baby'; else delete c\.kind;/.test(fnSrc('readEditorFormIntoCard')), 'the editor has a Kind field; Save stores only Baby');
{ const up = fnSrc('rv2Update'), op = fnSrc('pk1OpenMapCards');
  ok(/t\.dataset\.rvBaby === '1'\) return;/.test(up), 'rv2Update: a Baby tile counts toward neither number');
  ok(/rv2TargetsOf\(s, top, chosen\.filter\(nb\), all\.filter\(nb\)\)/.test(op), 'the N / M targets leave Baby cards out');
  ok(/ui13BabyPanelHTML\(mapId, defs\)/.test(op) && /eggKindForNode\(n\)/.test(fnSrc('ui13MapEggs')) && /eggChanceFor\(n, mapId, true\)/.test(fnSrc('ui13MapEggs')), 'the gallery adds a Baby cards panel: the eggs the map\'s own fights drop (kind by deck, first-clear chance)'); }

// ---- 2. HH7 + Baby pills -------------------------------------------------------------------------------------------------------
const TXs = {'ui.rv2-tag-skirmish': 'Skirmish', 'ui.rv2-tag-carried': 'Carried', 'ui.rv2-tag-unique': 'Unique', 'ui.rv2-tag-owner': 'Your note', 'ui.rv2-tag-claude': "Claude's pick", 'ui.rv2-tip-owner': 'o', 'ui.rv2-tip-claude': 'c',
  'ui.ui13-tag-unlikely': 'Unlikely', 'ui.ui13-tip-unlikely': 'over', 'ui.ui13-tag-baby': 'Baby', 'ui.ui13-tip-baby': 'b'};
const TX = (k, v)=> String(TXs[k] || k).replace(/\{(\w+)\}/g, (_, n)=> v && n in v ? v[n] : '{' + n + '}');
const A = new Function('TX', ['rv2IsCarried', 'rv2TagsOf'].map(fnSrc).join('\n') + '\nreturn {rv2IsCarried, rv2TagsOf};')(TX);
{ const t = A.rv2TagsOf({id: 'cane-toad', why: 'Carried from Sable Swampmire (Map 6)', by: 'kept', flag: 'unlikely', flagWhy: 'Map 7 is two unique over'});
  const u = t.find(x=> x[0] === 'unlikely');
  ok(u && u[1] === 'Unlikely' && u[2] === 'Map 7 is two unique over', 'HH7 an Unlikely pill, its tooltip the flagWhy');
  ok(t.some(x=> x[0] === 'carried'), 'HH7 the Carried pill stays');
  ok(!A.rv2TagsOf({why: 'x'}).some(x=> x[0] === 'unlikely'), 'HH7 no flag, no pill');
  const b = A.rv2TagsOf({why: 'Carried from Map 4'}, true).map(x=> x[0]);
  ok(b.includes('baby') && !b.includes('carried') && !b.includes('unique'), 'HH1 a Baby card: Baby, not Carried / Unique'); }
{ const R = JSON.parse(rd('canonical/map-review.json')).maps, flagged = [];
  Object.keys(R).forEach(k=> (R[k].chosen || []).forEach(e=>{ if(e.flag) flagged.push(e); }));
  ok(flagged.length > 0 && flagged.every(e=> e.flag === 'unlikely' && typeof e.flagWhy === 'string' && e.flagWhy), `HH7 map-review.json: ${flagged.length} chosen entries flagged unlikely, each with a flagWhy`);
  ok(/xu\+\+/.test(fnSrc('rv2Update')) && /ui\.ui13-count-wo-unlikely/.test(fnSrc('rv2Update')), 'HH7 a second count with the Unlikely cards left out'); }

// ---- 3. HH4 Torch --------------------------------------------------------------------------------------------------------------
{ const t = byId.torch, ids = cards.map(c=> c.numericId).filter(x=> x != null), others = ids.filter((x, i)=> cards[i].id !== 'torch');
  ok(t && t.cardType === 'equipment' && t.rarity === 'common' && JSON.stringify(t.equip) === JSON.stringify({grant: {illuminate: true}}), 'the Torch: common equipment granting Illuminate');
  ok(t && t.numericId === Math.max(...others) + 1 && new Set(ids).size === ids.length, `the next free numericId, unique (${t && t.numericId})`);
  ok(t && t.awaitingSource === true && t.source && t.source.kind === 'secret' && t.source.id === 'm4', 'a secret card of Caves & Alcoves (m4), awaitingSource until it has art');
  ok(cards[cards.length - 1].id === 'torch', 'appended at the end of cards.json');
  ok(/\{key:'illuminate', category:'passive'/.test(app), 'Illuminate is an existing keyword (PASSIVE_DEFS)'); }
{ // the engine: the wearer gets Illuminate when the piece takes hold (equip.grant through deriveDef)
  const E = H.Engine, so = id=> id === 1 ? 'A' : 'B';
  const defs = Object.assign({}, H.loadCardDefs(), {'x-wall': {id: 'x-wall', name: 'x-wall', attack: 0, health: 500, wait: 9, cost: 0, effects: {}}});
  const e = E.makeSimEngine(defs, E.mulberry32(7), {recordEvents: true, battleMode: 'open', rules: {}});
  const P = {1: e.newPlayer(1, {}, {id: 'st-hq', health: 60, effects: {}}), 2: e.newPlayer(2, {}, {id: 'st-hq', health: 60, effects: {}})};
  e.debugSpawnCard(P, so, 2, 'x-wall', 'left', {}, []); const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
  const W = all(P[2])[0]; W.slot = 0; P[2].row.center = [W]; P[2].row.left = []; P[2].row.right = []; e.syncSlots(P[2]);
  const uid = 90001; P[2].hand.push({uid, defId: 'torch'}); P[2].lumber = 9; P[2].playedThisTurn = false;
  const before = !!e.effectsOf(W).illuminate;
  const played = e.equip(P, so, 2, W.uid, uid, {}, []);
  for(let i = 2; i < 5 && !W.equipOn; i++) e.roundStart(P, i, so, {}, []); // equip.turns 1 (the default): it takes hold at the next round's start
  ok(!before && played && W.equipment === 'torch', 'the Torch goes onto a unit');
  ok(W.equipOn && !!e.effectsOf(W).illuminate, `once it takes hold the wearer has Illuminate (equipOn ${W.equipOn})`); }
{ const f = fnSrc('ui13MountTorch');
  ok(/map\.id !== UI13_TORCH\.map/.test(f) && /b\.disabled = !litNow && !taken/.test(f) && /pit\.classList\.contains\('is-lit'\) && !pit\.classList\.contains\('is-out'\)/.test(f), 'HH4 the bracket is disabled until its pit burns (and again when a tap puts the pit out)');
  ok(/setDialogueFlag\(UI13_TORCH\.flag, true\)/.test(f) && /if\(ui13TorchTaken\(\)\)/.test(f) && /unlockCardForPlayer\(UI13_TORCH\.card, 'secret'\)/.test(f), 'HH4 a click gives the Torch once per save (dialogue flag, in the cloud progress blob)');
  ok(/'bramblewood_dialogue_flags_v1'/.test(app.slice(app.indexOf('const PROGRESS_KEYS'), app.indexOf('const PROGRESS_KEYS') + 600)), 'the dialogue flags ride in the progress blob');
  ok(/ui13MountTorch\(canvas, map\)/.test(fnSrc('mountCaveFires')), 'mounted with the cave fires');
  ok(/\.ui13-torch\{position:absolute; z-index:6;/.test(css) && /\.ui13-torch\.is-lit \.ut-stick/.test(css) && /prefers-reduced-motion: reduce\)\{ \.ui13-torch/.test(css), 'HH4 CSS: under the dark like the pits, a lit look, no glow with reduced motion'); }

// ---- 4. HH3 --------------------------------------------------------------------------------------------------------------------
{ const f = fnSrc('ui13EditFromGallery'), r = fnSrc('ui13RefreshTile'), op = fnSrc('pk1OpenMapCards');
  ok(/edOpenCardEditor\(id, ov,/.test(f), 'HH3 the ✏️ opens the existing card editor (edOpenCardEditor), the gallery hidden meanwhile');
  ok(/rv1TileHTML\(e, kind, defs, sec\)/.test(r) && /rv2Update\(ov\)/.test(r), 'HH3 on close the tile is drawn again and the counts follow');
  ok(/\[data-ui13-edit\]/.test(op) && /e\.key === 'Escape' && !ov\.hidden/.test(op), 'HH3 wired in the gallery; Escape in the editor does not close the hidden gallery');
  ok(/adminModeEnabled \? ui13EditBtnHTML\(e\.id\)/.test(fnSrc('rv1TileHTML')), 'HH3 admins only'); }

// ---- 5. texts ------------------------------------------------------------------------------------------------------------------
{ const keys = [...new Set([...app.matchAll(/TX\('((?:ui|map|toast)\.ui13-[a-z0-9-]+)'/g)].map(x=> x[1]))];
  const missing = keys.filter(k=> !texts.includes('"' + k + '":'));
  ok(keys.length >= 20 && !missing.length, `every UI13 key is in the text table (${keys.length}; missing ${missing.join(', ')})`);
  ok(!/TX\('ui\.ui13-kind-' \+/.test(app) && !/TX\('ui\.ui13-kind-tip-' \+/.test(app), 'no built key names (keyify would drop them)'); }

console.log(fail ? `ui13-2026-11-01: ${fail} of ${checks} failed` : `ui13-2026-11-01: all ${checks} passed`);
process.exit(fail ? 1 : 0);
