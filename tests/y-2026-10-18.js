#!/usr/bin/env node
// 2026-10-18 (package Y, fixes from the day's 4th audit):
//   1. the Codex tile cache key carries the card's revealAfter state (Quarry Mole's "?" tile redraws once Map 0 is cleared)
//   2. heal and Cure texts: heals stanch Bleed only; Cure takes Poison only, from the most poisoned unit
//   3. a revealAfter-gated field row's "?" says what opens it ("Win a fight on Map 41 or further on to learn this.")
//   4. Wave crash kills are the Wave unit's (see also tests/wave-tide-2026-10-17.js)
//   5. the skirmish editor's "Simulate 200 vs my deck" plays the Difficulty picked (aiAim + aiLevel)
//   6. bramblewood-a11y.js ignores the board's class flips; the fading faction screen is data-a11y-skip
//   7. the Tutorial map's opening slide is seeded off for saves past T-2
//   8. Creative skips cages and structures; an old fight resume takes its node's CPU level; the CPU's Sacrifice check reads Bleed right
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const H = require('./lib/harness.js');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const eng = fs.readFileSync(path.join(ROOT, 'bramblewood-engine.js'), 'utf8');
const a11y = fs.readFileSync(path.join(ROOT, 'bramblewood-a11y.js'), 'utf8');
const {TEXT, TX} = require(path.join(ROOT, 'bramblewood-texts.js'));
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const fnSrc = name=>{ const i = src.indexOf(`\nfunction ${name}(`); if(i < 0) return ''; let d = 0, j = src.indexOf('{', i); for(let k = j; k < src.length; k++){ const ch = src[k]; if(ch === '{') d++; else if(ch === '}'){ d--; if(!d) return src.slice(i, k + 1); } } return ''; };

// ---- 1. Codex tile cache key
ok(/sig = tileEnv \+ \(owned \? 'o' : '-'\) \+ \(liveCards\[id\] \? 'e' : '-'\) \+ \(ra \? \(revealAfterMet\(ra\) \? 'R' : 'r'\) : '-'\)/.test(src) && /const ra = cardRevealAfter\(d\); sig = /.test(src), '1. the tile key has the revealAfter state');

// ---- 2. texts
{ const m = src.match(/\{key:'cure', category:'evergreen'[^\n]*desc:v=>`([^`]*)`/); const t = m ? m[1] : '';
  ok(/most poisoned unit/.test(t) && /Poison/.test(t) && !/Bleed/.test(t) && !/afflicted/.test(t), `2. Cure's skill text: Poison only, the most poisoned unit ("${t}")`); }
ok(/case 'heal': doText = `heal [^\n]*\(stanching Bleed first, capped at max HP\)`/.test(src) && !/Poison, then Bleed first/.test(src), '2. a heal trigger says it stanches Bleed (no Poison)');

// ---- 3. a gated field row's "?"
ok(TEXT['ui.reveal-gate-mapnum'] && TEXT['ui.reveal-gate-map'], '3. the gate lines are TX keys');
{ const FIELD2 = {psychicDampener:{revealAfter:{mapNum:41}}, mole:{revealAfter:{map:'m1'}}, mist:{}};
  const ctx = {TX, FIELD2, mapNumberOf: id=> ({m1:0}[id] ?? null), fieldRowGated: k=> !!(FIELD2[k] && FIELD2[k].revealAfter), Number};
  vm.createContext(ctx); vm.runInContext(['revealGateTip', 'fieldRowGateTip', 'fieldRowQTip'].map(fnSrc).join('\n') + '\n;this.R = {revealGateTip, fieldRowQTip};', ctx);
  const R = ctx.R;
  ok(R.fieldRowQTip({key:'psychicDampener'}) === 'Win a fight on Map 41 or further on to learn this.', `3. Psychic Dampener's "?": ${R.fieldRowQTip({key:'psychicDampener'})}`);
  ok(R.fieldRowQTip({key:'mole'}) === 'Clear Map 0 to learn this.', `3. a {map} gate names the map: ${R.fieldRowQTip({key:'mole'})}`);
  ok(R.fieldRowQTip({key:'mist', qTip:'Mist tip'}) === 'Mist tip' && R.fieldRowQTip({key:'mist'}) === 'Shows what it does once it first happens', '3. ungated rows keep their own tip'); }
ok(/\$\{hidden \? \(fieldRowGateTip\(row\) \? `<i>\? \$\{escapeHtml\(fieldRowGateTip\(row\)\)\}<\/i>`/.test(src), '3. the Arena rules card uses the gate line too');

// ---- 4. Wave crash kills (engine wiring; the behaviour is tested in wave-tide-2026-10-17.js)
ok(/function washPush\(players, sideOf, tpid, t, n, dir, ev, events, stats, killCredit\)/.test(eng) && /noteKiller\(c, ev\.attUid, ev\.attDefId\)/.test(eng) && /if\(!killCredit\) removeDeadCards\(players, sideOf, book,/.test(eng), '4. washPush credits the Wave unit and leaves a swing\'s sweep to the swing');
ok(/waveHit\(players, sideOf, otherId\(a\.enemyId\), a\.att, defCard, events, stats, killCredit\)/.test(eng), '4. the swing passes its kill-credit book');

// ---- 5. skirmish sims at the Difficulty picked
ok(/function simulateSkirmishVsDeck\(node, deckCounts, n, playerChar, ai\)/.test(src) && /aimed \? \{aiAim:true, aiLevel:cpuLv\} : \{\}/.test(src), '5. the sims take ai {level} -> aiAim + aiLevel');
ok(/if\(aimed\) engine\.setAiLevel\(1\); engine\.aiTakeTurn\(P, sideOf, 1, stats, null\); if\(aimed\) engine\.setAiLevel\(cpuLv\); engine\.aiTakeTurn\(P, sideOf, 2/.test(src), '5. your deck plays Smart, the CPU at the picked level');
ok(/const simLv = cpuAiLevelForNode\(mapId, draft\), r = simulateSkirmishVsMyDeck\(draft, 200, \{level: simLv\}\)/.test(src), '5. "Simulate 200 vs my deck" passes the node\'s level');
{ // the engine: setAiLevel between turns changes how that side plays (aiAim on); silent engines ignore it
  const E = H.Engine, defs = H.loadCardDefs(); const e = E.makeSimEngine(defs, E.mulberry32(3), {recordEvents:false, aiAim:true, aiLevel:2});
  ok(e.getAiLevel() === 2, '5. aiLevel reaches the sim engine'); e.setAiLevel(0); ok(e.getAiLevel() === 0, '5. setAiLevel per side'); }

// ---- 6. a11y observer
ok(/const BOARD_SEL = '#battlefieldEl, #handStrip';/.test(a11y) && /if\(t && t\.closest\(BOARD_SEL\)\)\{/.test(a11y) && /m\.attributeName === 'class'\)\{ if\(couldOverlay\(t\) && relevant\(t\)\)/.test(a11y), '6. board changes and plain class flips no longer run the dialog search');
ok(/attributeFilter: \['hidden', 'class', 'role', 'inert', 'data-a11y-skip'\]/.test(a11y), '6. data-a11y-skip flips are watched');
ok(/screen\.setAttribute\('data-a11y-skip', ''\); screen\.classList\.add\('fs-zoom'\);/.test(src) && /el\.classList\.remove\('fs-zoom'\); el\.removeAttribute\('data-a11y-skip'\);/.test(src), '6. the fading faction screen is skipped, and managed again once hidden');
{ // run the observer's filter on a fake DOM: a class flip on a board card or a plain div doesn't queue a scan; a dialog does
  let observed = null, timers = 0;
  const mkEl = (o)=> Object.assign({nodeType:1, className:'', id:'', parentElement:null, isConnected:true,
    matches(sel){ return !!(o.dialog && /role=dialog/.test(sel)); }, closest(sel){ return o.board && /battlefieldEl/.test(sel) ? {} : null; },
    querySelector(){ return null; }, querySelectorAll(){ return []; }, contains(){ return false; }, getAttribute(){ return null; }}, o);
  const win = {addEventListener(){}}; const doc = {documentElement:{}, addEventListener(){}, querySelectorAll(){ return []; }, activeElement:null, body:{}};
  const ctx = {window: win, document: doc, MutationObserver: function(cb){ observed = cb; this.observe = ()=>{}; }, setTimeout: ()=>{ timers++; }, getComputedStyle: ()=> ({}), CSS:{escape: s=> s}, console};
  vm.createContext(ctx);
  try{ vm.runInContext(a11y, ctx); }catch(e){ ok(false, '6. a11y runs in the fake DOM: ' + e.message); }
  if(observed){
    timers = 0; observed([{type:'attributes', attributeName:'class', target: mkEl({board:true, className:'board-card is-hit'})}]); ok(timers === 0, '6. a class flip on a board card: no scan');
    observed([{type:'attributes', attributeName:'class', target: mkEl({className:'hand-card glow'})}]); ok(timers === 0, '6. a class flip on a plain element: no scan');
    observed([{type:'attributes', attributeName:'class', target: mkEl({className:'modal-overlay', dialog:true})}]); ok(timers === 1, `6. a dialog's class flip: a scan (${timers})`);
  } else ok(false, '6. the observer was set up'); }

// ---- 7. the Tutorial map's opening slide
{ const store = {}; let completed = [];
  const ctx = {localStorage:{getItem: k=> (k in store ? store[k] : null), setItem: (k, v)=>{ store[k] = String(v); }}, TUT_MAP_OPEN_KEY: 'bramblewood_tut_map_opened_v1',
    tutSideNodeHidden: ()=> false, loadConquestProgress: ()=> ({completed}), conquestNodeId: (m, k)=> `${m}:${k}`, mapNumberOf: id=> ({m1:0, mf:1, m2:2}[id] ?? null),
    document:{getElementById: ()=> null}, reducedMotion: ()=> false, String};
  vm.createContext(ctx); vm.runInContext(fnSrc('tutMapOpenSlide') + '\n;this.f = tutMapOpenSlide;', ctx);
  const map = {nodes:[]};
  completed = ['mtut:T-0', 'mtut:T-1', 'm1:1-1', 'mf:2-1']; ctx.f(map, []); ok(!store.bramblewood_tut_map_opened_v1, '7. a fresh player who just won Tutorial II (and played Map 0/1): the slide still waits');
  completed = ['mtut:T-0', 'mtut:T-1', 'mtut:T-2']; ctx.f(map, []); ok(store.bramblewood_tut_map_opened_v1 === '1', '7. a save that has won T-2: seeded, no slide');
  delete store.bramblewood_tut_map_opened_v1; completed = ['m2:3-1']; ctx.f(map, []); ok(store.bramblewood_tut_map_opened_v1 === '1', '7. a save with a Map 2 win: seeded'); }

// ---- 8a. Creative skips cages and structures
{ const E = H.Engine, base = H.loadCardDefs(), so = id=> id===1 ? 'A' : 'B';
  const U = (id, effects, o)=> Object.assign({id, name:id, attack:0, health:50, wait:0, cost:0, effects: effects || {}}, o || {});
  const defs = Object.assign({}, base, {'y-cr': U('y-cr', {creative:2}), 'y-wall': U('y-wall', {}, {archetypes:['Structure']}), 'y-cage': U('y-cage'), 'y-mate': U('y-mate')});
  const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
  const mk = ()=>{ const e = E.makeSimEngine(defs, E.mulberry32(11), {recordEvents:true, battleMode:'open'}); return {e, P:{1:e.newPlayer(1, {}), 2:e.newPlayer(2, {})}}; };
  const put = (e, P, pid, id)=>{ e.debugSpawnCard(P, so, pid, id, 'left', {}, []); return all(P[pid]).filter(x=> x.defId === id).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); };
  { const {e, P} = mk(); put(e, P, 1, 'y-cr'); const W = put(e, P, 1, 'y-wall'), C = put(e, P, 1, 'y-cage'); C.cageOf = 'y-mate';
    for(let i = 0; i < 6; i++) e.resolveCombat(P, so, {}, [], 1);
    ok(!W.creativity && !C.creativity, `8. Creative never gives to a structure or a cage (${W.creativity||0}, ${C.creativity||0})`); }
  { const {e, P} = mk(); put(e, P, 1, 'y-cr'); put(e, P, 1, 'y-wall'); const M = put(e, P, 1, 'y-mate');
    e.resolveCombat(P, so, {}, [], 1); ok(M.creativity === 2, `8. ...the unit beside them still gets it (${M.creativity})`); } }

// ---- 8b. an old fight resume takes the node's CPU level
{ const nodes = {'m1:1-1': {kind:'skirmish'}, 'm9:9-1': {kind:'skirmish', ai:'smartest'}};
  const ctx = {findConquestNode: (m, k)=> nodes[m + ':' + k] ? {node: nodes[m + ':' + k]} : null, cpuAiLevelForNode: (m, node)=> node.ai === 'smartest' ? 2 : 0};
  vm.createContext(ctx); vm.runInContext(fnSrc('cpuAiLevelOfMatch') + '\n;this.f = cpuAiLevelOfMatch;', ctx);
  ok(ctx.f({conquestNode:{mapId:'m1', nodeId:'1-1'}}) === 0, '8. a Map 0 fight saved without aiLevel resumes on its node\'s level (Basic), not Smart');
  ok(ctx.f({conquestNode:{mapId:'m9', nodeId:'9-1'}}) === 2 && ctx.f({aiLevel:1, conquestNode:{mapId:'m9', nodeId:'9-1'}}) === 1, '8. ...an edited Difficulty counts; a saved aiLevel wins');
  ok(ctx.f({mode:'tutorial'}) === 0 && ctx.f({mode:'arena'}) === 1 && ctx.f({conquestNode:{mapId:'mx', nodeId:'?'}}) === 1, '8. the tutorial is Basic; off the road (or a node gone) Smart'); }

// ---- 8c. the CPU's Sacrifice "about to die": Bleed only counts while the unit is about to act
ok(/const acts = !\(\(f\.wait\|\|0\) > 0\) && !f\.stunned && !\(f\.frozen > 0\) && !\(f\.asleep > 0\);/.test(eng) && /\(\(f\.poison\|\|0\) \+ \(acts \? \(f\.bleed\|\|0\) : 0\)\) >= hp/.test(eng), '8. Sacrifice: Poison always, Bleed only when it will act');

console.log(fail ? `y-2026-10-18: ${fail} of ${n} failed` : `y-2026-10-18: all ${n} passed`);
process.exit(fail ? 1 : 0);
