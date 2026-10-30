#!/usr/bin/env node
// 2026-10-25 (package PREF: P1 X-REF fights and the reference-deck switch, REF-2, P3's PRO ease measure). Source and data checks plus the parts
// that run headless through tools/lib_bramble.js (the reference sets, their schedule, the reference fight). The browser half (the switch, an
// X-REF fight, the REF tag, a road fight with the switch on, shots at 390 and 1366) is tests/e2e/pref_2026_10_25.py.
//   1  REF-2: docs/balance/ref/*.json baked into arena_app.js (tools/opt/ref_decks.js --check); the schedule (Map 0 unlevelled, +5 copies a
//      map, seeded, within each copy's cap, the same every time); the map reference unchanged through the new parts path
//   2  P1: X-REF keys and nodes, the switch (off by default, kept locally, Admin Mode only), a reference-set fight free and unpaid, the REF tag,
//      a resumed one still unpaid, texts in 12 packs
//   3  the tools: skirmish_pass.js measure --ref, tools/opt/pro_ease.js and its saved result (every PRO / BPRO, both sets, 40+ games)
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.join(__dirname, '..');
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  ✗', m); } else if(process.env.VERBOSE) console.log('  ✓', m); };
const rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
const app = rd('arena_app.js');
const fnSrc = name=>{ const i = app.indexOf('function ' + name + '('); if(i < 0) return ''; let d = 0, j = app.indexOf('{', i); for(let k = j; k < app.length; k++){ if(app[k] === '{') d++; else if(app[k] === '}'){ d--; if(!d) return app.slice(i, k + 1); } } return ''; };

// ---- 1. REF-2 and the reference sets
{ const r = cp.spawnSync(process.execPath, [path.join(ROOT, 'tools/opt/ref_decks.js'), '--check'], {encoding: 'utf8'});
  ok(r.status === 0 && /up to date/.test(r.stdout), '1. arena_app.js REF_DECK_SETS matches docs/balance/ref/*.json (ref_decks.js --check) ' + (r.stdout || '').trim().split('\n').pop()); }
const file = JSON.parse(rd('docs/balance/ref/ref2-owner-main-deck-2026-10-25.json'));
ok(file.id === 'ref2' && file.label === 'Reference-2' && Object.values(file.counts).reduce((t, n)=> t + n, 0) === 20 && file.schedule.perMap === 5 && file.schedule.fromMap === 1, '1. the Reference-2 file: id, label, 20 cards, +5 copies a map from Map 1');
const B = require(path.join(ROOT, 'tools/lib_bramble.js')), G = B.G;
// 2026-10-31 REF5: the progression reference (prog, its random pick and decks 1-5) comes first; the map reference, then Reference-2 follow
ok(JSON.stringify(G.refSetIds().filter(id=> !/^prog(-\d+)?$/.test(id))) === JSON.stringify(['map', 'ref2']), '1. the sets: the map reference, then Reference-2 ' + JSON.stringify(G.refSetIds()));
{ const base = G.referenceBaseDefs(), set = G.REF_DECK_SETS.ref2;
  let prev = null, okStep = true, okCap = true, totals = [];
  const caps = G.refSetCopyLevels(set, 0, base).map(c=> c.id).map(id=>{ const b = base[id]; const isBase = (b.rarity === 'starter' || !!b.basic || !!b.tutorial || G.cardSourceOf(b).kind === 'base'); return (isBase ? 4 : G.cardMaxLevel(b)) - G.cardBaseLevel(b); });
  for(let n = 0; n <= 25; n++){ const c = G.refSetCopyLevels(set, n, base), t = c.reduce((s, x)=> s + x.bump, 0); totals.push(t);
    c.forEach((x, i)=>{ if(x.bump > caps[i] || x.bump < 0) okCap = false; });
    if(prev){ const open = prev.reduce((s, x, i)=> s + (x.bump < caps[i] ? 1 : 0), 0), room = prev.reduce((s, x, i)=> s + caps[i] - x.bump, 0), step = t - prev.reduce((s, x)=> s + x.bump, 0);
      if(step !== Math.min(5, room) || c.some((x, i)=> x.bump < prev[i].bump || (open >= 5 && x.bump > prev[i].bump + 1))) okStep = false; }
    prev = c; }
  ok(totals[0] === 0 && totals[1] === 5 && totals[10] === 50, '1. Map 0 unlevelled, Map 1 +5, Map 10 +50 ' + totals.slice(0, 11).join(','));
  ok(okStep, '1. each map gives 5 levels, to 5 different copies while 5 are below their cap (coordinator 10-25: 100 at Map 20) ' + totals.join(','));
  ok(okCap, '1. no copy past its cap (a Base card Lv 4, the others their top level)');
  ok(totals[20] === 100, '1. Map 20: ' + totals[20] + ' levels gained (the owner said 105, which needs Map 0 levelled too: docs/decisions.json PREF-1)');
  ok(JSON.stringify(G.refSetCopyLevels(set, 13, base)) === JSON.stringify(G.refSetCopyLevels(set, 13, base)), '1. seeded: Map 13 is the same deck every time'); }
{ const m3 = G.CONQUEST_MAPS.find(m=> !m.sub && G.mapNumberOf(m.id) === 3), n = m3.nodes.find(x=> x.deck && Object.keys(x.deck).length);
  const r = G.refSetFor('map', m3.id, n), ref = G.referenceDeckFor(m3.id, n);
  ok(r.set === 'map' && JSON.stringify(r.deck) === JSON.stringify(ref.deck) && r.level === ref.level && JSON.stringify(r.parts) === JSON.stringify(G.levelMixDeck(ref.deck, ref.level)), '1. the map reference is referenceDeckFor at referencePlayerLevel');
  const a = G.referenceFightSetup(m3.id, n, {}), b = G.referenceFightSetup(m3.id, n, {refSet: 'map'});
  ok(JSON.stringify(a.mine) === JSON.stringify(b.mine) && a.ref.stage === b.ref.stage, '1. refSet "map" plays the same deck as before');
  const m12 = G.CONQUEST_MAPS.find(m=> !m.sub && G.mapNumberOf(m.id) === 12), n12 = m12.nodes.find(x=> x.deck && Object.keys(x.deck).length);
  const c = G.referenceFightSetup(m12.id, n12, {refSet: 'ref2'}), cnt = Object.values(c.mine).reduce((t, k)=> t + k, 0), lv = Object.keys(c.mine).filter(id=> /@p\d/.test(id));
  ok(c.ref.stage === 'ref:ref2' && cnt === 20 && lv.length > 0 && lv.every(id=> c.defs[id] && c.defs[id].derivedFrom), '1. refSet "ref2" on Map 12: 20 copies, the levelled ones as @p defs ' + JSON.stringify(c.mine));
  const g = G.playReferenceGame(c, 0); ok(g && typeof g.win === 'boolean', '1. a Reference-2 game plays to the end'); }
ok(/function referencePlayerDeck\(deck, level, base, overlay\)\{ return refPartsDeck\(levelMixDeck\(deck, level\), base, overlay\); \}/.test(app) && /isBaseLevelCapped\(b\) && level > BASE_CARD_LEVEL_CAP/.test(fnSrc('refPartsDeck')), '1. the map reference goes through refPartsDeck, Base cards still stop at Lv 4');

// ---- 2. P1: X-REF and the switch
{ const re = new RegExp(app.match(/const PRO_KEY_RE = \/(.*?)\/;/)[1]);
  ok(re.test('3-PRO-1') && re.test('12-BPRO-4') && re.test('2-B-PRO-1') && re.test('3-REF') && re.test('2-B-REF') && !re.test('3-REF-1') && !re.test('REF') && !re.test('3-XREF'), '2. keys: N-PRO-k, N-BPRO-k, N-L-PRO-k and the X-REF fights N-REF / N-L-REF'); }
{ const ents = {mc: {map: 3, pro: [{id: '3-PRO-1'}, {id: '3-PRO-2'}], bpro: [{id: '3-BPRO-1'}]}, mg: {map: 2, side: true, pro: [{id: '2-B-PRO-1'}], bpro: []}};
  const store = {}, localStorage = {getItem: k=> k in store ? store[k] : null, setItem: (k, v)=>{ store[k] = String(v); }};
  const Q = new Function('localStorage', 'adminState', `const REF_DECK_SETS = {ref2: {label: 'Reference-2'}}; const REF_PLAY_KEY = 'p', XREF_VS_KEY = 'v'; const ents = ${JSON.stringify(ents)};
    function proMapEntries(){ return ents; } ${fnSrc('proEntriesOf')} ${fnSrc('refSetIds')} ${fnSrc('refDefaultSet') /* 2026-10-31 REF5: the default pick (the map reference while no per-map set is baked, as in this stub) */} ${fnSrc('refPlayPrefs')} ${fnSrc('saveRefPlayPrefs')} ${fnSrc('xrefKeyOf')} ${fnSrc('xrefVsFor')} ${fnSrc('setXrefVs')}
    function refPlayActive(){ const adminModeEnabled = adminState.on; return !!adminModeEnabled && refPlayPrefs().on; }
    return {refPlayPrefs, saveRefPlayPrefs, refPlayActive, xrefKeyOf, xrefVsFor, setXrefVs};`);
  const admin = {on: true}, F = Q(localStorage, admin);
  ok(F.xrefKeyOf('mc') === '3-REF' && F.xrefKeyOf('mg') === '2-B-REF', '2. X-REF keys follow the map\'s PRO fight codes (3-REF, a side map 2-B-REF)');
  ok(F.xrefVsFor('mc') === '3-PRO-1', '2. X-REF faces PRO-1 by default'); F.setXrefVs('mc', '3-BPRO-1'); ok(F.xrefVsFor('mc') === '3-BPRO-1', '2. the picked opponent is kept'); F.setXrefVs('mc', '9-PRO-9'); ok(F.xrefVsFor('mc') === '3-PRO-1', '2. an unknown pick falls back to PRO-1');
  ok(!F.refPlayPrefs().on && F.refPlayPrefs().set === 'map' && !F.refPlayActive(), '2. the switch is off by default, the map reference picked');
  F.saveRefPlayPrefs({on: true, set: 'ref2'}); ok(F.refPlayActive() && F.refPlayPrefs().set === 'ref2' && /"on":true/.test(store.p), '2. on and Reference-2 are kept on this device');
  admin.on = false; ok(!F.refPlayActive(), '2. it does nothing outside Admin Mode');
  F.saveRefPlayPrefs({on: true, set: 'ref9'}); ok(F.refPlayPrefs().set === 'map', '2. a set that is gone falls back to the map reference'); }
{ const f = fnSrc('startConquestMatch');
  ok(/const refPlaySet = \(opts && opts\.refSet\) \|\| \(refPlayActive\(\) \? refPlayPrefs\(\)\.set : null\)/.test(f) && /refPlay = refSetFor\(refPlaySet, mapId, node\)/.test(f), '2. a fight takes the reference set from X-REF or the switch');
  ok(/if\(refPlay && !\(opts && opts\.skipEnergyCost\)\) opts = Object\.assign\(\{\}, opts, \{skipEnergyCost: true\}\)/.test(f) && /if\(!refPlay && !deckSizeOkOrWarn\(\)\) return false/.test(f), '2. free (no Energy), and your own deck\'s size is not checked');
  ok(/refPlay \? refPartsDeck\(refPlay\.parts, referenceBaseDefs\(\), matchDefsOverlay\) : ownedDeckForMatch\(myDeckCounts\)/.test(f), '2. your deck is the set\'s copies at their levels');
  ok(/refPlay \? \(refPlay\.leader && getCardDefs\(\)\[refPlay\.leader\] \? refPlay\.leader : null\)/.test(f), '2. the set\'s leader (none for the map reference)');
  ok(/if\(refPlay\)\{ matchState\.adminTest = true; matchState\.refDeck = \{/.test(f), '2. it pays nothing (adminTest) and is marked refDeck'); }
ok(/startConquestMatch\(f\.map\.id, f\.node\.key, \{skipEnergyCost: true, noAmbush: true, refSet: f\.xref \? refPlayPrefs\(\)\.set : undefined\}\)/.test(fnSrc('startProFight')), '2. X-REF always plays the chosen set');
ok(/if\(XREF_KEY_RE\.test\(key \|\| ''\)\) return findXrefFight\(key\)/.test(fnSrc('findProFight')) && /xref: true, xrefVs: e\.id/.test(fnSrc('findXrefFight')), '2. findProFight finds an X-REF fight (the picked PRO\'s node, keyed X-REF)');
ok(/xrefKeyOf\(map\.id\)/.test(fnSrc('proMapNodesHTML')) && /ico: '🎯'/.test(fnSrc('proMapNodesHTML')), '2. the X-REF node sits beside the PRO nodes on an admin\'s map');
ok(/const xk = xrefKeyOf\(id\)/.test(fnSrc('proFightsAdminHTML')) && /adminModeEnabled \? refPlayToggleHTML\(\) : ''/.test(fnSrc('proFightsAdminHTML')), '2. Admin\'s PRO list: the switch and an X-REF row per map');
ok(/adminModeEnabled \? refPlayToggleHTML\(\) : '' \/\* 2026-10-25 \(package PREF\)/.test(app), '2. the switch in the Admin Mode panel');
ok(/selectedNode\.xref \? xrefPanelHTML\(map, selectedNode\) : ''/.test(app) && /data-xref-vs/.test(fnSrc('xrefPanelHTML')), '2. the X-REF panel picks the opponent and the set');
ok(/m\.refDeck \? `<span class="hud-ref-tag"/.test(app) && /TX\('ui\.pref-ref-tag'\)/.test(app), '2. the fight\'s top bar shows REF');
ok(/'proFight', 'refDeck'/.test(app) && /if\(matchState\.proFight \|\| matchState\.refDeck\) matchState\.adminTest = true/.test(app), '2. a resumed reference-set fight is still unpaid');
{ const T = require(path.join(ROOT, 'bramblewood-texts.js')).TEXT, keys = ['ui.pref-set-map', 'ui.pref-toggle', 'ui.pref-set', 'ui.pref-toggle-sub', 'ui.pref-xref-vs', 'ui.pref-xref-you', 'ui.pref-level', 'ui.pref-xref-node-tip', 'ui.pref-xref-row', 'ui.pref-ref-tag', 'ui.pref-ref-tag-tip', 'ui.pref-result'];
  const packs = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'].map(c=> [c, JSON.parse(rd('lang/' + c + '.json'))]);
  keys.forEach(k=>{ ok(typeof T[k] === 'string' && T[k].length, '2. text ' + k); if(T[k]) packs.forEach(([c, p])=> ok(typeof p[T[k]] === 'string' && p[T[k]].length, `2. ${c}: "${T[k].slice(0, 30)}"`)); });
  ok(T['ui.pref-toggle'] === "Play with the map's reference deck", '2. the switch reads as the owner asked'); }

// ---- 3. the tools
{ const sp = rd('tools/skirmish_pass.js'); ok(/refSet: REF_SET/.test(sp) && /--ref=<set>/.test(sp), '3. skirmish_pass.js measure --ref=<set>'); }
{ const PE = require(path.join(ROOT, 'tools/opt/pro_ease.js')), o = PE.parseArgs(['--ref', 'ref2', '--games', '48']);
  ok(o.ref === 'ref2' && o.games === 48 && PE.parseArgs([]).ref === 'map,ref2' && PE.parseArgs([]).games === 40, '3. pro_ease.js: --ref (default map,ref2), --games (default 40)'); }
{ const f = path.join(ROOT, 'docs/balance/pro-ease-2026-10-25.json');
  ok(fs.existsSync(f), '3. the saved measure docs/balance/pro-ease-2026-10-25.json');
  // 2026-10-29 RELFIX3: the PRO / BPRO decks were rebuilt from the new map pools, so the coverage check reads the newest measure
  // (docs/balance/pro-ease-2026-10-29-relfix3.json, pro_ease.js on the new decks); the 10-25 file stays as PREF's record
  const newest = fs.readdirSync(path.join(ROOT, 'docs/balance')).filter(n=> /^pro-ease-.*\.json$/.test(n)).sort().pop();
  if(fs.existsSync(f)){ const j = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/balance', newest), 'utf8')), data = JSON.parse(rd('canonical/pro-skirmishes.json'));
    const ids = [].concat(...Object.values(data.maps).map(m=> (m.pro || []).concat(m.bpro || []).map(e=> e.id)));
    const missing = []; ids.forEach(id=> ['map', 'ref2'].forEach(r=>{ const row = j.rows.find(x=> x.id === id && x.ref === r); if(!row || row.games < 40) missing.push(id + '/' + r); }));
    ok(!missing.length, '3. every PRO / BPRO fight measured against both sets, 40+ games ' + missing.slice(0, 6).join(', ')); } }
ok(fs.existsSync(path.join(ROOT, 'docs/balance/pro-ease-2026-10-25.md')), '3. the report docs/balance/pro-ease-2026-10-25.md');

console.log(`pref-2026-10-25: ${checks - fail}/${checks} passed`);
process.exit(fail ? 1 : 0);
