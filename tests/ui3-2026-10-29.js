#!/usr/bin/env node
// Package UI3 (2026-10-29; owner 23:01 S2-S6, S8-S10). Static and function-level checks; the browser run is tests/e2e/ui3_2026_10_29.py (shots in docs/screens/ui3/).
//   S2 a night-blind / sun-shy unit shows no pip while it sees, the plain Blind pip while it is blind (one Blind), the trait pip outside a fight
//   S3 the rank emblem lands on its own fight (panel corner, else its node), the page corner only as the fallback
//   S4 the Map cards overlay: a main map = its list + SPECIAL, a submap = its own list(s) + SPECIAL
//   S5 keyword tints on card faces (ui3TintKeys / ui3TintHTML, CSS under the name, flat on Low, off on None)
//   S6 hover = the card's detail (above the overlay, with the reason); no native title, no "?"
//   S8 the map admin bar's Players button   S9 the group dungeon: no generic Victory card, random CPU ally decks, Back to the Arena's Co-op pane
//   S10 Export all (format, toggles remembered, tooltip, downloads)   + texts in 12 packs
'use strict';
const fs = require('fs'), path = require('path');
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

// ---- S5 tints
{ const src = app.slice(app.indexOf('const UI3_TINTS'), app.indexOf('function ui3TintHTML')) + fnSrc('ui3TintHTML');
  const T = new Function(src + '\nreturn {ui3TintKeys, ui3TintHTML, UI3_TINTS};')();
  const k = d=> T.ui3TintKeys(d).map(t=> t[0]).join('+');
  ok(k({effects: {resist: ['poison']}}) === 'poison', 'S5 poison resist -> green');
  ok(k({effects: {resist: ['heat']}}) === 'heat' && k({effects: {resist: ['fire']}}) === 'heat' && k({effects: {dry: true}}) === 'heat' && k({resist: ['heat']}) === 'heat', 'S5 heat / fire resist (Dry, the legacy array too) -> orange-red');
  ok(k({effects: {resist: ['cold']}}) === 'cold' && k({effects: {immune: ['cold']}}) === 'cold', 'S5 cold resist or immunity -> icy blue');
  ok(k({effects: {darksight: true}}) === 'dark' && k({effects: {sonar: true}}) === 'dark' && k({effects: {keenSense: true}}) === 'dark', 'S5 Darksight / Sonar / Keen Sense -> blue-black');
  ok(k({effects: {diurnal: 2}}) === 'diurnal' && k({effects: {nocturnal: true}}) === 'nocturnal' && k({effects: {nocturnalHp: 1}}) === 'nocturnal', 'S5 Diurnal -> warm yellow, Nocturnal -> dark blue');
  ok(k({effects: {armor: 2}}) === '' && T.ui3TintHTML({effects: {}}) === '' && T.ui3TintHTML(null) === '', 'S5 a plain card has no tint element');
  ok(k({effects: {resist: ['poison', 'heat', 'cold'], darksight: true, nocturnal: true}}).split('+').length === 3, 'S5 at most three blend');
  ok(/data-tint="poison heat"/.test(T.ui3TintHTML({effects: {resist: ['poison', 'heat']}})) && /--t1:70,185,80;--t2:238,98,40/.test(T.ui3TintHTML({effects: {resist: ['poison', 'heat']}})), 'S5 the element carries its colours in order');
  ok((app.match(/\$\{ui3TintHTML\(d\)\}<div class="rarity-band"><\/div>\$\{CARD_FRAME_HTML\}/g) || []).length === 2, 'S5 both card-face builders (live and normal) draw the tint');
  ok(/\.card-tile > \.ui3-tint\{[^}]*pointer-events:none[^}]*z-index:1|\.card-tile > \.ui3-tint\{[^}]*z-index:1[^}]*pointer-events:none/.test(css) && /html\[data-fx="low"\] \.card-tile > \.ui3-tint\{box-shadow/.test(css) && /html\[data-fx="none"\] \.card-tile > \.ui3-tint\{display:none/.test(css), 'S5 CSS: under the name (z 1 < 2), no pointer, flat on Low effects, off on No effects');
  const alphas = (css.match(/\.card-tile > \.ui3-tint\{[^}]*\}/) || [''])[0].match(/rgba\(var\(--t\d[^)]*\)+,\.(\d+)\)/g) || [];
  ok(alphas.length >= 3 && alphas.every(a=> +a.match(/\.(\d+)\)$/)[1] <= 40), 'S5 very slight: every alpha in the tint rule is at most .40 (wash .07-.10, glow .30-.34)'); }

// ---- S2 blind pips
{ const src = fnSrc('ui3SightBlindNow');
  const mk = (phase, cards)=> new Function('matchState', 'dayNightOn', 'getCardDefs', src + '\nreturn ui3SightBlindNow;')(
    {over: false, engine: {getPhase: ()=> phase}, players: {1: {row: {left: [], center: cards || [], right: []}}, 2: {row: {left: [], center: [], right: []}}}}, ()=> true,
    ()=> ({lamp: {effects: {illuminate: true}}}));
  const nb = {nightblind: true}, ss = {sunshy: true};
  ok(mk('day')(nb, {pid: 1}) === false && mk('night')(nb, {pid: 1}) === true, 'S2 night-blind: no pip by day, blind at night');
  ok(mk('day')(ss, {pid: 1}) === true && mk('night')(ss, {pid: 1}) === false, 'S2 sun-shy: blind by day, quiet at night');
  ok(mk('night', [{defId: 'lamp', hp: 3}])(nb, {pid: 1}) === false, 'S2 an Illuminate unit on its side lights it: no pip');
  ok(mk('night')({nightblind: true, trueStrike: true}, {pid: 1}) === false, 'S2 True Strike never misses: no pip');
  const ab = fnSrc('abilityBadges');
  ok(/\(e\.sunshy \|\| e\.nightblind\) && !\(bopts && bopts\.live\)/.test(ab) && /ui3SightBlindNow\(e, lv\) && !\(lv\.blind > 0\)/.test(ab), 'S2 the trait pip stays outside a fight; in a fight only while blind and without the Blind status chip');
  ok(/blind: c\.blind\|\|0/.test(app) && /blind: live\.blind/.test(app), 'S2 the live card passes its Blind status down to the strip'); }

// ---- S3 emblem
{ const f = fnSrc('res3RankEmblemFlight');
  ok(/const tgt = \(\)=>/.test(f) && /\.conquest-node-panel:not\(\[hidden\]\) > \.cnp-rank-corner/.test(f) && /node\.getBoundingClientRect/.test(f) && /x: W - 46, y: H - 46/.test(f), 'S3 the landing is the open fight panel\'s emblem, else the node, else the page corner');
  ok(/last = tgt\(\)/.test(f) && /sx \+ \(T\.x - sx\) \* k/.test(f), 'S3 the target is read every frame (a panned / zoomed / scrolled map cannot leave it behind)');
  ok(!/const ex = W - 46, ey = H - 46/.test(f), 'S3 the fixed bottom-right corner is not the only landing any more'); }

// ---- S4 / S6 / S10 the Map cards overlay
{ const f = fnSrc('pk1OpenMapCards');
  ok(/const inScope = s=> s\.key === 'cards' \? !mpIsSub\(mapId\) : s\.key === 'special' \? true : !!\(mpIsSub\(mapId\) && \(s\.sub === mapId \|\| \(MP_EXTRA_LISTS\[s\.sub\] && MP_EXTRA_LISTS\[s\.sub\]\.map === mapId\)\)\)/.test(f) && /mapPoolSections\(top\)\.filter\(inScope\)/.test(f), 'S4 sections are filtered: main = MAP + SPECIAL, a submap = its own lists + SPECIAL');
  { // run the filter on a model of mapPoolSections
    const inScope = new Function('mapId', 'mpIsSub', 'MP_EXTRA_LISTS', 'return ' + f.match(/const inScope = (s=> .*?);\n/)[1])
    const subs = new Set(['mp', 'mg', 'mtut']), extra = {mtut12: {map: 'mtut'}}, secs = [{key: 'cards'}, {key: 'sub:mtut12', sub: 'mtut12'}, {key: 'sub:mp', sub: 'mp'}, {key: 'sub:mg', sub: 'mg'}, {key: 'sub:mtut', sub: 'mtut'}, {key: 'special'}];
    const pick = id=> secs.filter(inScope(id, x=> subs.has(x), extra)).map(s=> s.key).join(',');
    ok(pick('mb') === 'cards,special', 'S4 a main map shows MAP + SPECIAL (' + pick('mb') + ')');
    ok(pick('mp') === 'sub:mp,special' && pick('mg') === 'sub:mg,special', 'S4 a submap shows only its own list + SPECIAL (' + pick('mp') + ')');
    ok(pick('mtut') === 'sub:mtut12,sub:mtut,special', 'S4 the Tutorial\'s two lists both belong to it (' + pick('mtut') + ')'); }
  ok(/m = mpMapById\(mapId\) \|\| mpMapById\(top\)/.test(f), 'S4 the title names the submap itself');
  const t = fnSrc('rv1TilesHTML'), z = fnSrc('wireRewardZoom');
  ok(!/title="\$\{escapeAttr\(e\.why/.test(t) && /why: e\.why \|\| ''/.test(t) && !/'\?'/.test(t.split('\n')[2] || ''), 'S6 no native title on the tile, no "?" mark; the reason goes to the card');
  ok(/data-zoom-why/.test(fnSrc('vis4MapCardTilesHTML')) && /cnp-rw-why/.test(z) && /cnp-rw-above/.test(z), 'S6 the hover detail adds the reason line and sits above the overlay');
  ok(/\.cnp-rw-zoom\.cnp-rw-above\{z-index:900/.test(css) && /\.modal-overlay\{[^}]*z-index:600/.test(css), 'S6 CSS: the popover (900) is above the overlay (600); it used to be 200, under it');
  ok(/cursor:zoom-in/.test(css) && !/\.rv1-tile \.vis4-mc-card\.is-large\{[^}]*cursor:help/.test(css), 'S6 the help cursor ("?") is gone');
  // S10
  const ex = fnSrc('rv3ExportAll');
  const run = (flips)=>{
    const rvFlips = flips, defs = {a: {name: 'Ant'}, b: {name: 'Bee'}, c: {name: 'Cat'}, d: {name: 'Dog'}};
    const main = [{id: 'm1', name: 'Clovermead'}, {id: 'm4', name: 'Sunken Hollow'}];
    const R = {m1: {chosen: [{id: 'a'}, {id: 'b'}], maybe: [{id: 'c'}], cut: []}, m4: {chosen: [{id: 'a'}], maybe: [], cut: [{id: 'd'}]}};
    const F = new Function('rvFlips', 'getCardDefs', 'mainConquestMaps', 'mapNumberOf', 'mapPoolSections', 'rv1ReviewOf', ex + '\nreturn rv3ExportAll();');
    return F(rvFlips, ()=> defs, ()=> main, id=> id === 'm1' ? 1 : 4, top=> [{key: 'cards', label: 'Map'}, {key: 'special', label: 'SPECIAL'}], (sec, top)=> sec.key === 'cards' ? R[top] : null);
  };
  const r = run({'m4|cards|d': true, 'm1|cards|a': true});
  const lines = r.text.split('\n');
  ok(lines.length === 3 && lines[1] === 'Map 1 · Clovermead / Map: cut Ant | chosen: Ant, Bee | maybe: Cat | cut: - ' .trim() && lines[2] === 'Map 4 · Sunken Hollow / Map: keep Dog | chosen: Ant | maybe: - | cut: Dog', 'S10 one line per list in map order: "Map 4 · Sunken Hollow / Map: keep A; cut C | chosen: ... | maybe: ... | cut: ..." (' + JSON.stringify(lines.slice(1)) + ')');
  ok(run({}).text.split('\n')[1].includes('Map: no changes |') && r.json.lists.length === 2 && r.json.lists[1].keep[0] === 'd' && r.json.lists[0].cutNow[0] === 'a', 'S10 no toggles reads "no changes"; the .json carries ids and the toggles');
  ok(/rvFlips\[k\] = true/.test(f) && /rvFlipTop = top/.test(f) && /class="btn small" id="rv3ExportAll" aria-describedby="rv3ExportTip"/.test(f) && /data-rv3-dl="txt"/.test(f) && /data-rv3-dl="json"/.test(f) && /bramblewood-map-cards\.txt/.test(f), 'S10 button with tooltip beside Copy my picks, toggles remembered, .txt and .json downloads'); }

// ---- S8
ok(/id="mlPlayers"[^>]*>👥 \$\{escapeHtml\(TX\('ui\.adminu1-title'\)\)\}/.test(app) && /on\('mlPlayers', \(\)=> openAdminUserList\(\)\)/.test(app) && app.indexOf('id="mlUnclearMap"') < app.indexOf('id="mlPlayers"') && app.indexOf('id="mlPlayers"') < app.indexOf('id="mlEdits"'), 'S8 the map admin bar: ... Unclear map, 👥 Players, Edits; it opens the Players overlay');

// ---- S9
{ ok(/const showWinModal = m\.over && !m\.winModalDismissed && !m\.coop;/.test(app), 'S9 no generic Victory card for a group-dungeon fight (its floor / run panels are the win screens)');
  const src = fnSrc('gdFillerDeck') + fnSrc('gdFillCpuSeats');
  const calls = [];
  const F = new Function('Ghosts', 'gdDefs', 'CoopM', src + '\nreturn {gdFillerDeck, gdFillCpuSeats};')({generateGhostDeck: (defs, stage, seed)=>{ calls.push([Object.keys(defs).join(), stage, seed]); return {x: 20}; }},
    ()=> ({a: {}, tok: {token: true}, eq: {cardType: 'equipment'}, sp: {cardType: 'spell'}, t: {test: true}}), {unsupportedCard: d=> d.cardType === 'equipment', noSlotCard: d=> d.cardType === 'spell'});
  const st = {seed: 42, seats: [{seat: 0, cpu: false, deck: {a: 20}}, {seat: 1, cpu: true, deck: null}, {seat: 2, cpu: true, deck: {y: 20}}]};
  F.gdFillCpuSeats(st);
  ok(st.seats[0].deck.a === 20 && st.seats[1].deck.x === 20 && st.seats[1].filler === true && st.seats[2].deck.y === 20 && !st.seats[2].filler, 'S9 an empty CPU seat gets a ghost deck; a human seat and a seat that has a deck are left alone');
  ok(calls.length === 1 && calls[0][0] === 'a' && calls[0][2] === ((42 + 7919 * 2) >>> 0), 'S9 the deck comes from playable Standard cards (no token / test / equipment / spell) and the run seed + seat (the same on every page)');
  ok(/gdFillCpuSeats\(d\); \/\/ 2026-10-29/.test(app) && /try\{ gdFillCpuSeats\(S\.startMsg\); \}catch/.test(app), 'S9 filled when the start message arrives, and again on a catch-up');
  const g = fnSrc('gdClose');
  ok(/const toArena = !silent && !!S && \(GD\.phase === 'end' \|\| GD\.phase === 'floorEnd' \|\| GD\.phase === 'fight'\)/.test(g) && /pl2ArenaPane = 'coop'; playSubTab = 'arena'/.test(g) && g.indexOf("pl2ArenaPane = 'coop'") > g.indexOf('endMatch({coopKeep: true})'), 'S9 Back / Leave from a run lands on the Arena page, Co-op pane (set after the match is closed)');
  ok(/ui\.ui3-seat-cpu-start/.test(fnSrc('gdLobbyHTML')) && /ui\.ui3-cpu-random/.test(fnSrc('gdLobbyHTML')), 'S9 the lobby says the CPU ally plays a random deck'); }

// ---- texts in 12 packs
{ const keys = {'ui.ui3-export-all': 'Export all', 'ui.ui3-export-all-tip': /* 2026-10-30 (TIP1): shortened */ "Copies every map's card lists, with your Cut/Keep choices, as text for Claude.",
    'ui.ui3-export-copied': 'Copied everything: paste it to Claude, or download it', 'ui.ui3-export-ready': 'Ready: download it', 'ui.ui3-seat-cpu-start': 'A CPU ally with a random deck joins at Start', 'ui.ui3-cpu-random': 'Plays a random deck', 'ui.ui3-back-arena': 'Back to the Arena'};
  Object.keys(keys).forEach(k=> ok(texts.includes(`"${k}": ${JSON.stringify(keys[k])}`), 'texts: TX key ' + k));
  ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'].forEach(c=>{ const p = JSON.parse(rd('lang/' + c + '.json'));
    ok(Object.values(keys).every(en=> p[en] && p[en] !== en), 'texts: all 7 rows translated in lang/' + c + '.json'); }); }

console.log(`ui3: ${checks - fail}/${checks} checks passed`);
process.exit(fail ? 1 : 0);
