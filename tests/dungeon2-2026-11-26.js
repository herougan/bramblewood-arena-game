// Dungeon stage clear and cameras (2026-11-26, packages DUNGEON2 + RAIDCAM1; owner 11-24 22:29 #16 #17 #19 #21):
//   1. the stage clear (bramblewood-coop.js advancePart): the enemies left die (front and back row, a cage stays, their cards to the enemy's
//      Graveyard), the next wave arrives, then each seat takes 3 of its own cards (newest first) from the shared Graveyard into its deck;
//      deterministic;
//   2. the Ecclesia option: a mostly-Ecclesia deck moves 3 exiled cards back to the Graveyard instead (the normal rule when it has none);
//   3. the page plays it in order: deaths, the travel with the banner, the arrivals' render, then the Graveyard -> deck flight; the travel only
//      for a dungeon with transit 'lanterns' (the Tidelock Vault);
//   4. the camera: a group dungeon's live enemy back row joins the zoomed view and eases it out (RZ_BACK_MS), never in; the zoomed-out end
//      (g.lo) bounds the clamp; the raid opens at RZ_RAID_START, eases in over RZ_RAID_IN_MS to the focus or the saved zoom-out; its
//      zoomed-out end is 1.04;
//   5. reduced motion and Effects off: no travel, no flight, no wide raid start, a fade for the grade emblem;
//   6. the texts in 12 packs.
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const ROOT = H.ROOT, C = require(path.join(ROOT, 'bramblewood-coop.js'));
const read = p=> fs.readFileSync(path.join(ROOT, p), 'utf8');
const src = read('arena_app.js'), tpl = read('arena_template.html'), coopSrc = read('bramblewood-coop.js');
const defs = H.loadCardDefs();
let pass = 0; const fails = [];
function ok(cond, msg){ if(cond) pass++; else { fails.push(msg); console.log('  ✗ ' + msg); } }
const fnSrc = name=>{ const i = src.indexOf('function ' + name + '('); if(i < 0) return null; let d = 0; for(let k = src.indexOf('{', i); k < src.length; k++){ if(src[k] === '{') d++; else if(src[k] === '}' && --d === 0) return src.slice(i, k + 1); } return null; };
const sOf = id=> id === 1 ? 'A' : 'B';
const DECK = {'deep-cave-troll': 6, 'quarry-mole': 7, 'cave-cricket': 7};
const mk = (seed, seats)=> C.createTable({makeSimEngine: H.Engine.makeSimEngine, defs, seed, typeId: 'hollow', floorIdx: 0, seats: seats || [{deck: DECK, castleHp: 40}, {cpu: true}], recordEvents: false});
const liveEnemies = T=> T.E.allBoardCards(T.players[2]).filter(c=> c && !c.gap && c.hp > 0 && !c.cageOf).length + (T.players[2].reserve || []).reduce((a, rw)=> a + Object.values(rw).filter(c=> c && c.hp > 0).length, 0);

// ---- 1. the stage clear
{ const T = mk(77), P1 = T.players[1], P2 = T.players[2];
  T.E.debugSpawnCard(T.players, sOf, 2, 'cave-cricket', 0, T.stats, []); T.E.debugSpawnCard(T.players, sOf, 2, 'quarry-mole', 1, T.stats, []);
  T.E.fillReserve(P2, 1, 2, 'baby-bat');
  const cage = T.E.placeCage(T.players, sOf, 2, 1, 3, 'deep-cave-troll', 5, []);
  P1.graveyard.push({defId: 'quarry-mole'}, {defId: 'cave-cricket'}, {defId: 'baby-bat'}, {defId: 'quarry-mole'}, {defId: 'deep-cave-troll'}, {defId: 'cave-cricket'}, {defId: 'quarry-mole'});
  const deck0 = [0, 1].map(s=> C.seatData(T, s).deck.length), egy0 = P2.graveyard.length, hand0 = P2.hand.length;
  P2.hq.hp = 0; const a = C.advancePart(T);
  ok(a && T.floorIdx === 1, 'a part won advances to part 2');
  ok(a.cleared.length === 3 && a.cleared.some(c=> c.row === 1 && c.defId === 'baby-bat') && a.cleared.filter(c=> c.row === 0).length === 2, `the enemies left die, front and back row (${JSON.stringify(a.cleared.map(c=> c.defId + '@' + c.row))})`);
  ok(T.E.allBoardCards(P2).includes(cage), 'a cage keeps its leader (not cleared)');
  ok(P2.graveyard.length === egy0 + 3 + hand0, `their cards and the old hand go to the enemy's Graveyard (+${P2.graveyard.length - egy0})`);
  ok(a.arrivals.length >= 3 && liveEnemies(T) === a.arrivals.length, `only the next wave stands (${a.arrivals.length} arrivals, ${liveEnemies(T)} live)`);
  const r0 = a.recycled[0], d = [0, 1].map(s=> C.seatData(T, s).deck.length - deck0[s]);
  ok(r0.from === 'graveyard' && r0.ids.join() === 'quarry-mole,cave-cricket,deep-cave-troll' && d[0] === 3, `seat 0 takes its 3 newest own cards into its deck (${r0.ids}, +${d[0]})`);
  ok(a.recycled[1].ids.length === 3 && d[1] === 3, `the CPU seat (same list) takes the next 3 (${a.recycled[1].ids}, +${d[1]})`);
  ok(P1.graveyard.length === 1 && P1.graveyard[0].defId === 'baby-bat', 'a card on nobody\'s list stays in the Graveyard');
  ok(C.STAGE_RECYCLE === 3, 'three cards a seat');
  const T2 = mk(77); T2.E.debugSpawnCard(T2.players, sOf, 2, 'cave-cricket', 0, T2.stats, []); T2.E.debugSpawnCard(T2.players, sOf, 2, 'quarry-mole', 1, T2.stats, []);
  T2.E.fillReserve(T2.players[2], 1, 2, 'baby-bat'); T2.E.placeCage(T2.players, sOf, 2, 1, 3, 'deep-cave-troll', 5, []);
  T2.players[1].graveyard.push(...['quarry-mole', 'cave-cricket', 'baby-bat', 'quarry-mole', 'deep-cave-troll', 'cave-cricket', 'quarry-mole'].map(defId=> ({defId})));
  T2.players[2].hq.hp = 0; C.advancePart(T2);
  ok(C.tableHash(T) === C.tableHash(T2) && C.seatData(T, 0).deck.join() === C.seatData(T2, 0).deck.join(), 'same seed, same stage clear (decks in the same order)');
  ok(/so do the enemy's survivors/.test(coopSrc) === false, 'the DUNGEON1 note no longer says the survivors carry over');
}
{ const T = mk(5), r = C.headlessRound; T.players[1].graveyard.push({defId: 'quarry-mole'}); T.players[2].hq.hp = 0;
  const res = r(T); ok(res.over == null && T.floorIdx === 1 && T.lastAdvance.recycled[0].ids.length === 1, 'the headless round runs the same stage clear');
}

// ---- 2. the Ecclesia option
{ const ecc = Object.keys(defs).filter(id=> !defs[id].token && defs[id].attack != null && (defs[id].prayerReq > 0 || defs[id].mechanicLine === 'grace' || (defs[id].archetypes || []).includes('Ecclesia'))).slice(0, 3);
  ok(ecc.length === 3, `three Ecclesia cards to build a deck (${ecc})`);
  const eDeck = {[ecc[0]]: 8, [ecc[1]]: 7, 'quarry-mole': 5};
  const T = mk(9, [{deck: eDeck, castleHp: 40}, {deck: DECK}]), P1 = T.players[1];
  ok(C.ecclesiaDeck(T, 0) && !C.ecclesiaDeck(T, 1), 'a deck at least half Ecclesia counts, a plain one doesn\'t');
  P1.exile.push({defId: ecc[0]}, {defId: 'cave-cricket'}, {defId: ecc[1]}, {defId: 'quarry-mole'}); P1.graveyard.push({defId: ecc[0]}, {defId: 'cave-cricket'});
  const deck0 = C.seatData(T, 0).deck.length; T.players[2].hq.hp = 0; const a = C.advancePart(T), r = a.recycled[0];
  ok(r.from === 'exile' && r.ids.join() === ['quarry-mole', ecc[1], ecc[0]].join() && C.seatData(T, 0).deck.length === deck0, `an Ecclesia deck moves 3 of its exiled cards back to the Graveyard instead (${r.ids})`);
  ok(P1.exile.length === 1 && P1.exile[0].defId === 'cave-cricket' && P1.graveyard.filter(g=> g.defId === ecc[0]).length === 2, 'they leave the Removal Zone and land in the Graveyard; the other seat\'s exiled card stays');
  ok(a.recycled[1].from === 'graveyard' && a.recycled[1].ids.join() === 'cave-cricket', `the plain deck takes its card from the Graveyard (${a.recycled[1].ids})`);
  const T3 = mk(9, [{deck: eDeck, castleHp: 40}, {cpu: true}]); T3.players[1].graveyard.push({defId: ecc[1]}); T3.players[2].hq.hp = 0;
  const b = C.advancePart(T3).recycled[0]; ok(b.from === 'graveyard' && b.ids.join() === ecc[1], 'an Ecclesia deck with nothing exiled takes the normal rule');
}

// ---- 3. the page's order
{ const core = src.slice(src.indexOf('a group dungeon\'s part won short of its last'), src.indexOf('Auto-draw (2026-10-03)'));
  const at = s=> core.indexOf(s);
  ok(at('await dungeon2Clear(m)') > 0 && at('await dungeon2Clear(m)') < at('dungeon2Travel(m)') && at('dungeon2Travel(m)') < at('await dungeon1PartBanner('), 'deaths first, then the travel with the banner');
  ok(at('const finalRender = renderBoard(') < at('await dungeon2Recycle(m)'), 'the next part\'s units come in on the final render, then the Graveyard -> deck flight');
  ok(/deathVfx\(c\.uid\)/.test(fnSrc('dungeon2Clear')), 'each cleared enemy plays its death look');
  ok(C.DUNGEONS.hollow.transit === 'lanterns' && Object.values(C.DUNGEONS).filter(d=> d.transit).length === 1, 'the travel is on the Tidelock Vault only (World 1, Map 16)');
  const tr = fnSrc('dungeon2Travel');
  ok(/transit !== 'lanterns'/.test(tr) && /reducedMotion\(\)/.test(tr) && /fxLevel\(\) === 'none'/.test(tr), 'the travel: that dungeon only; none with reduced motion or Effects off');
  ok(/fxLevel\(\) !== 'low'/.test(tr), 'Effects Low: the lanterns alone');
  ok(/\.dg2-seam, \.dg2-lamp\{[^}]*will-change:transform; animation:dg2Pass/.test(tpl) && /@keyframes dg2Pass\{0%\{transform:translateY\(0\); opacity:0;\}[^}]*\}[^}]*translateY\(480px\); opacity:0;\}\}/.test(tpl), 'the travel animates transform / opacity only');
  ok(!/\.dg2-travel\{[^}]*animation/.test(tpl) && !/\.dg2-travel\{[^}]*border-radius/.test(tpl), 'its container neither animates nor rounds its clip (no offscreen surface)');
  const rc = fnSrc('dungeon2Recycle');
  ok(/reducedMotion\(\)/.test(rc) && /fxLevel\(\) === 'none'/.test(rc) && rc.indexOf('battleToast(') < rc.indexOf('reducedMotion()'), 'the flight: none with reduced motion or Effects off; the lane note always');
}

// ---- 4. the camera
{ const back = new Function(fnSrc('rzBackRow') + '\nreturn rzBackRow;')();
  const m = rs=> ({coop: {}, players: {2: {reserve: rs}}});
  ok(back(m([{}])) === 0 && back(m([{1: {hp: 3}}])) === 1 && back(m([{1: {hp: 0}}])) === 0 && back(m([{}, {0: {hp: 2}}])) === 2 && back({raidFull: true, players: {2: {reserve: [{0: {hp: 2}}]}}}) === 0,
    'rzBackRow: the enemy\'s last reserve row with a live unit, group dungeons only');
  const geo = src.slice(src.indexOf('function rzGeom('), src.indexOf('function rzClamp('));
  ok(/rzBackRow\(m\), eb = k \? r\('resEnemy' \+ k\) : null; if\(eb\) top = Math\.min\(top, eb\.top\)/.test(geo), 'that row joins the zoomed band whole');
  ok(/lo = m\.raidFull \? RZ_RAID_OUT : rzBackRow\(m\) \? Math\.max\(RZ_MINZ, Math\.min\(1, fit\)\) : 1/.test(geo), 'the zoomed-out end: 1.04 in a raid, the band\'s fit (down to 0.6) with a live back row, else 1:1');
  const code = [/const RZ_MS = 650, RZ_OPEN_DELAY = 1100, RZ_MAXZ = 3\.2, RZ_MINZ_GAIN = 1\.12;/, /const RZ_BACK_MS = 1600, RZ_MINZ = 0\.6;/, /const RZ_RAID_START = 0\.88, RZ_RAID_IN_MS = 2400, RZ_RAID_OUT = 1\.04, RZ_SAVE_KEY = 'bramblewood_rz_zoom_v1';/]
    .map(re=> (src.match(re) || [''])[0]).concat(['rzClamp', 'rzFocus', 'rzOutView', 'rzUsable', 'rzSaved', 'rzRemember', 'rzOpenZ'].map(fnSrc)).join('\n');
  const store = {}; const ls = {getItem: k=> k in store ? store[k] : null, setItem: (k, v)=>{ store[k] = String(v); }, removeItem: k=>{ delete store[k]; }};
  const f = new Function('localStorage', code + '\nreturn {rzClamp, rzOutView, rzUsable, rzSaved, rzRemember, rzOpenZ, RZ_RAID_OUT, RZ_RAID_START};')(ls);
  const g = {F: {l: 0, t: 0, w: 400, h: 600}, O: {x: 200, y: 0}, L: 0, R: 400, T: 0, B: 600, top: 100, bot: 500, xc: 200, zmax: 1.6};
  ok(f.rzClamp(Object.assign({lo: 1.04}, g), 0.5, 0, 0).z === 1.04 && f.rzClamp(Object.assign({lo: 0.8}, g), 0.5, 0, 0).z === 0.8 && f.rzClamp(g, 0.5, 0, 0).z === 1, 'the clamp stops at the zoomed-out end (1 when unset)');
  ok(JSON.stringify(f.rzOutView(Object.assign({lo: 1}, g))) === '{"z":1,"tx":0,"ty":0}' && f.rzOutView(Object.assign({lo: 1.04}, g)).z === 1.04, 'zoomed out: 1:1 as laid out, or the band at g.lo');
  ok(f.rzUsable(Object.assign({lo: 1}, g)) && !f.rzUsable(Object.assign({lo: 1.5}, g)), 'the zoom is offered when the band leaves room past the zoomed-out end');
  const gr = Object.assign({lo: 1.04}, g, {zmax: 2.04});
  ok(f.rzOpenZ(gr) === 2.04, 'no saved zoom: the raid opens onto the focus band');
  f.rzRemember({z: 1.04, lo: 1.04, max: 2.04}); ok(store.bramblewood_rz_zoom_v1 === '0' && f.rzOpenZ(gr) === 1.04, 'zoomed all the way out: kept, and the next fight ends there');
  f.rzRemember({z: 1.54, lo: 1.04, max: 2.04}); ok(Math.abs(f.rzOpenZ(gr) - 1.54) < 1e-9, 'a zoom half way is kept too');
  f.rzRemember({z: 2.04, lo: 1.04, max: 2.04}); ok(!('bramblewood_rz_zoom_v1' in store) && f.rzOpenZ(gr) === 2.04, 'zoomed back in: forgotten');
  ok(f.RZ_RAID_OUT === 1.04 && f.RZ_RAID_START < 1, 'the raid\'s zoomed-out end is 4% tighter; it opens beyond the 3-player view');
  const sy = fnSrc('rzSync');
  ok(/widen = !!back && s\.back === 0 && !s\.gesture; s\.back = back;/.test(sy) && /if\(widen && s\.z > fitZ \+ 0\.001\)\{ rzTo\(m, rzFocus\(g, fitZ\), RZ_BACK_MS\); return; \}/.test(sy), 'a back row going live eases out to fit it over RZ_BACK_MS, only when zoomed in past it');
  ok(/const wide = m\.raidFull && !reducedMotion\(\) && fxLevel\(\) !== 'none';/.test(sy) && /rzTo\(m, rzFocus\(g2, rzOpenZ\(g2\)\), wide \? RZ_RAID_IN_MS : 900\)/.test(sy), 'the raid opens wide (not with reduced motion / Effects off), then eases in to the saved zoom or the focus');
  ok(/s\.opened && !s\.gesture && !easing/.test(sy), 'no clamp before the fight opens or while an ease runs');
  ok(/rzRemember\(\{z: out \? g\.lo : g\.zmax/.test(fnSrc('rzToggle')) && /rzRemember\._t = setTimeout\(\(\)=> rzRemember\(s\), 300\)/.test(src), 'the button, a pinch and ctrl + wheel remember the zoom');
  ok(/Math\.abs\(s\.z - 1\) > 0\.001\)\{ inner\.style\.scale/.test(fnSrc('rzWrite')), 'a zoom below 1:1 is written too');
}

// ---- 5. the grade emblem
{ ok(/gd-rank dg2-award rank-/.test(fnSrc('gdRewardsShow')), 'the rewards window\'s grade emblem is awarded with dg2-award');
  ok(/\.gd-rank\.dg2-award\{animation:dg2Spin/.test(tpl) && /@keyframes dg2Spin\{0%\{rotate:-368deg; scale:\.2; opacity:0;\}/.test(tpl) && /\.gd-rank\.dg2-award i::before\{[^}]*animation:dg2Shine/.test(tpl), 'it spins in and a shine crosses it');
  ok(/@media \(prefers-reduced-motion: reduce\)\{ \.gd-rank\.dg2-award, \.gd-rank\.dg2-award\.rank-SSS\{animation:dg2FadeIn \.3s ease both;\} \.gd-rank\.dg2-award i::before\{display:none;\} \}/.test(tpl), 'reduced motion: a short fade, no shine');
  ok(/html\[data-fx="none"\] \.gd-rank\.dg2-award, html\[data-fx="none"\] \.gd-rank\.dg2-award\.rank-SSS\{animation:none;\}/.test(tpl), 'Effects off: it stands still');
  ok(/\.gd-rank\.dg2-award\.rank-SSS\{animation:dg2Spin[^;]*, sssPulse/.test(tpl), 'an SSS keeps its pulse');
}

// ---- 6. texts
{ const texts = require(path.join(ROOT, 'bramblewood-texts.js')), T = texts.TEXT || texts;
  const keys = ['ui.dungeon2-clear', 'ui.dungeon2-deck-back', 'ui.dungeon2-exile-back'];
  keys.forEach(k=> ok(typeof T[k] === 'string' && T[k].length > 0, `${k} in the text table`));
  ok(/TX\('ui\.dungeon2-clear'\)/.test(fnSrc('gdLobbyHTML')), 'How it works lists the stage clear');
  ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'].forEach(c=>{ const pack = JSON.parse(read('lang/' + c + '.json'));
    const row = k=> pack[T[k]] || pack[T[k].replace(/^[^\p{L}{]+/u, '')]; // the packs key a row by its English without a leading emoji
    ok(keys.every(k=> typeof row(k) === 'string' && (!/\{n\}/.test(T[k]) || row(k).includes('{n}'))), `${c}: the 3 rows, {n} kept`); });
}

console.log(`dungeon2: ${pass} passed, ${fails.length} failed`);
process.exit(fails.length ? 1 : 0);
