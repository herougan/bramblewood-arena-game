#!/usr/bin/env node
// 2026-10-24 (package MAP, owner notes 17:01 #1 #3 #5 and 13:16 #16 #19 #20):
//   1. the conquest map and the pawn's fight come back after a reload (LAST_MAP_KEY; resumeLastMap; the pawn's first placement);
//   3. the Ambush floats (no requires, no trail) and the fight it stopped (3-2) is locked until the Ambush is won (ambushLocksNode);
//   5. the raiders run off with Leaves once, ever (the 'raiders_ran_off' dialogue flag);
//   16. an admin sets a bramble's Health from the fight panel: node.brambleHealth wins in skirmishCastle, saved through saveNodeField;
//   19. while an NPC talks, a map tile shakes instead of opening; 20. the Quest Board waits for the Notices (needs:'quests').
// The functions are cut out of arena_app.js and run against small stand-ins; tests/e2e/map_2026_10_24.py drives the real page at 390 and 1366.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
function fnSrc(name){
  const a = src.indexOf('\nfunction ' + name + '('); if(a < 0) return '';
  let i = src.indexOf('{', a), depth = 0;
  for(; i < src.length; i++){ const ch = src[i]; if(ch === '{') depth++; else if(ch === '}'){ depth--; if(!depth) break; } }
  return src.slice(a + 1, i + 1);
}
const mem = ()=>{ const o = {}; return {getItem: k=> (k in o ? o[k] : null), setItem: (k, v)=>{ o[k] = String(v); }, removeItem: k=>{ delete o[k]; }, _o: o}; };

// --- 1. resume
{ const ls = mem();
  const code = `const LAST_MAP_KEY = 'bramblewood_last_map_v1'; var mapResumeTried = false;
    ${fnSrc('loadLastMap')}\n${fnSrc('rememberLastMap')}\n${fnSrc('resumeLastMap')}
    return {loadLastMap, rememberLastMap, resumeLastMap, set sel(v){ conquestSelectedMap = v; }, get sel(){ return conquestSelectedMap; }, set node(v){ conquestSelectedNodeKey = v; }, again(){ mapResumeTried = false; }};`;
  const CONQUEST_MAPS = [{id:'m1'}, {id:'mf'}, {id:'mb'}, {id:'dun', hiddenDungeon:true}];
  let unlocked = {m1:true, mf:true};
  const mk = ()=> new Function('localStorage', 'CONQUEST_MAPS', 'isMapUnlocked', 'loadConquestProgress', 'dungeonHiddenFromPlayer', 'let conquestSelectedMap = CONQUEST_MAPS[0].id, conquestSelectedNodeKey = null;\n' + code)(ls, CONQUEST_MAPS, m=> !!unlocked[m.id], ()=> ({completed:[]}), m=> !!m.hiddenDungeon);
  ok(!!fnSrc('resumeLastMap') && /const LAST_MAP_KEY = 'bramblewood_last_map_v1'/.test(src), '1. resumeLastMap and its key exist');
  let r = mk(); ok(r.resumeLastMap() === false && r.sel === 'm1', '1. nothing remembered: Map 0 as before');
  ls.setItem('bramblewood_last_map_v1', JSON.stringify({map:'mf', node:'1-2'})); r = mk(); ok(r.resumeLastMap() === true && r.sel === 'mf', '1. a remembered open map is restored');
  ok(r.resumeLastMap() === false, '1. only the first draw restores (a player who then picks Map 0 is not pulled back)');
  r = mk(); r.sel = 'mb'; ok(r.resumeLastMap() === false && r.sel === 'mb', '1. a map somebody already chose this session is left alone');
  ls.setItem('bramblewood_last_map_v1', JSON.stringify({map:'mb', node:null})); r = mk(); ok(r.resumeLastMap() === false && r.sel === 'm1', '1. a remembered map that is still locked is not opened');
  ls.setItem('bramblewood_last_map_v1', JSON.stringify({map:'dun', node:null})); unlocked.dun = true; r = mk(); ok(r.resumeLastMap() === false && r.sel === 'm1', '1. a hidden daily dungeon is not restored');
  ls.setItem('bramblewood_last_map_v1', '{oops'); r = mk(); ok(r.resumeLastMap() === false, '1. a corrupt value is ignored');
  r.rememberLastMap('mf', '1-3'); ok(JSON.parse(ls.getItem('bramblewood_last_map_v1')).node === '1-3', '1. rememberLastMap writes the map and the fight'); }
{ const f = fnSrc('placeMapPawn');
  ok(/rememberLastMap\(map\.id, target\)/.test(f), '1. the pawn\'s fight is remembered whenever it is placed');
  ok(/if\(placeMapPawn\._lastMap === undefined\)\{ const lm = loadLastMap\(\)/.test(f), '1. the first placement after a load stands at the remembered fight');
  ok(/\{ if\(!matchState\) resumeLastMap\(\); \}/.test(fnSrc('renderConquestSubTab')) || /resumeLastMap\(\)/.test(fnSrc('renderConquestSubTab')), '1. the Conquest pane tries the resume before the tutorial/heal rules'); }
ok(/try\{ healMapProgress/.test(src) && /function healMapProgress\(/.test(src), '1. MK\'s healMapProgress is still there');

// --- 3. the floating Ambush and the locked path
{ const f = fnSrc('applyAmbushNode');
  ok(/requires: \[\], floating: true, ambush:true/.test(f) && !/ambushLinks\(map\)/.test(f), '3. the Ambush requires nothing: no trail, open as soon as it is seen');
  const lock = fnSrc('ambushLocksNode'); ok(!!lock, '3. ambushLocksNode exists');
  const run = (pending, mapId, key, isAmbush)=> new Function('ambushMap', 'skirmishCode', 'AMBUSH_AT', 'ambushPending', lock + '\nreturn ambushLocksNode;')(
    ()=> ({id:'m4'}), (m, k)=> ({'a':'3-2', 'b':'3-3'}[k] || k), '3-2', ()=> pending)({id: mapId}, {key, ambush: isAmbush});
  ok(run(true, 'm4', 'a') === true, '3. 3-2 is locked while the Ambush is not won');
  ok(run(false, 'm4', 'a') === false, '3. 3-2 opens once it is won');
  ok(run(true, 'm4', 'b') === false, '3. another fight is not touched by the lock itself (those after 3-2 already wait on it)');
  ok(run(true, 'm4', 'a', true) === false, '3. the Ambush itself is never locked');
  ok(run(true, 'other', 'a') === false, '3. only the Ambush map is affected');
  ok(/if\(ambushLocksNode\(map, node\)\) return false;/.test(fnSrc('isNodeVisible')), '3. isNodeVisible draws the stopped fight as locked');
  const pos = fnSrc('mapNodePositionsRaw'); /* 2026-10-29 (REVIEW2): the layout logic moved to ...Raw; mapNodePositions then puts the Ambush on its road */ ok(/n\.secret \|\| n\.jumper \|\| n\.ambush/.test(pos) && /!n\.ambush/.test(pos), '3. the floating Ambush stands at its own spot and does not reshuffle the trail');
  ok(/'is-ambush is-floating foe-'/.test(src), '3. the node carries the floating look');
  ok(/is-ambush-locked/.test(src) && /lockedTileTap\(el, null\); showToast\(TX\('toast\.the-ambush-still-blocks-the-way'\)/.test(src), '3. a tap on the locked fight shakes and says the ambush blocks it'); }

// --- 5. the raiders, once
{ const blk = src.slice(src.indexOf("fn.node.ambush && !loadDialogueFlags()['raiders_ran_off']") - 200, src.indexOf("m.raidersTook = {n, want}") + 40);
  ok(/fn\.node\.ambush && !loadDialogueFlags\(\)\['raiders_ran_off'\]\)\{ setDialogueFlag\('raiders_ran_off', true\);/.test(blk), '5. the theft happens only while the flag is unset, and sets it'); }

// --- 16. the bramble's own Health
{ const sc = fnSrc('skirmishCastle');
  ok(/const bo = Math\.round\(Number\(node\.brambleHealth\)\); if\(bo > 0\) hp = Math\.min\(999, bo\);/.test(sc), '16. node.brambleHealth sets the Health the fight uses');
  const i = sc.indexOf('brambleHealth'), j = sc.indexOf('const layers'); ok(i > 0 && i < j, '16. it is applied before the Shield layers and the total are worked out');
  ok(/n\.brambleHealth != null \? n\.brambleHealth : null/.test(src), '16. the fight-result cache key includes it');
  const ed = fnSrc('openBrambleEditor'); ok(/saveNodeField\(mapId, nodeKey, 'brambleHealth', hp\)/.test(ed) && /saveNodeField\(mapId, nodeKey, 'characterId', pick\.value \|\| null\)/.test(ed), '16. Save goes through saveNodeField (the existing skirmish-edit path)');
  ok(/if\(!adminModeEnabled\) return null;/.test(ed), '16. the editor is for admins only');
  ok(/castleLineHTML\(sumNode, adminModeEnabled && !isTut && !selectedNode\.virtual\)/.test(src), '16. the panel\'s bramble line is the editor\'s button for an admin, not for a player');
  // evaluated: the number wins over the base bramble, the early rule and BRAMBLE_SCALE
  const castle = new Function('nodeCastleId', 'nodeCastleLevel', 'castleLeveled', 'CHARACTER_DEFS', 'baseBrambleHp', 'shieldOverrideOf', 'brambleHp', 'ruleShieldOf', fnSrc('skirmishCastle') + '\nreturn skirmishCastle;')(
    ()=> null, ()=> 0, (c)=> c, {castle:{health:30}}, ()=> 10, ()=> null, v=> Math.round(v * 0.5), ()=> 0);
  const a = castle({name:'x', hqHp: null}), b = castle({name:'x', brambleHealth: a.hp + 1}), c2 = castle({name:'x', brambleHealth: null}), d = castle({name:'x', brambleHealth: 0});
  ok(a.hp === 5 && b.hp === a.hp + 1 && b.character.health === a.hp + 1 && b.total === a.total + 1, `16. +1 HP on a Map 0 base bramble: ${a.hp} -> ${b.hp}`);
  ok(c2.hp === a.hp && d.hp === a.hp, '16. a cleared or zero edit gives the rule\'s Health back'); }

// --- 19 / 20. tiles that will not open
{ const lt = fnSrc('lockedTileTap'), blocked = fnSrc('mapTileBlocked');
  const calls = []; const el = {classList:{remove(){}, add(c){ calls.push('cls:' + c); }}, offsetWidth: 1, querySelectorAll: ()=> [], appendChild(l){ calls.push('label:' + l.textContent); }};
  const fakeDoc = {createElement: ()=> ({set className(v){}, set textContent(v){ this._t = v; }, get textContent(){ return this._t; }, setAttribute(){}, remove(){}})};
  const mk = (dlg, board)=> new Function('dialoguesPending', 'featureUnlocked', 'SoundKit', 'document', 'TX', 'setTimeout',
    // 2026-10-24 (package EN5, MAP-3): npcDialogueActive skips tutorial lessons (EN5_LESSON_DIALOGUE, tutorialLessonOn) and walks the Set
    'const EN5_LESSON_DIALOGUE = /^(lesson_|tut_|pitch_lesson|pitch_spent|training_wheels)/; function tutorialLessonOn(){ return false; }\n' + fnSrc('npcDialogueActive') + '\n' + fnSrc('noticeBoardUnlocked') + '\n' + lt + '\n' + blocked + '\nreturn {mapTileBlocked, lockedTileTap};')(
    new Set(dlg ? ['well_m1'] : []), k=> k === 'quests' ? board : true, {dullTap(){ calls.push('dull'); }}, fakeDoc, k=> k === 'ui.map-locked-for-now' ? 'Locked for now' : k, ()=> 0);
  calls.length = 0; ok(mk(0, true).mapTileBlocked(el) === false && !calls.length, '19. no NPC talking: a tile opens');
  calls.length = 0; ok(mk(1, true).mapTileBlocked(el) === true && calls.includes('dull') && calls.includes('cls:tile-dull-shake') && !calls.some(c=> c.startsWith('label:')), '19. an NPC talking: dull sound, shake, no label');
  calls.length = 0; ok(mk(0, false).mapTileBlocked(el, 'quests') === true && calls.includes('label:Locked for now') && calls.includes('dull'), '20. the Notices not open: dull sound, shake and "Locked for now"');
  calls.length = 0; ok(mk(0, true).mapTileBlocked(el, 'quests') === false, '20. the Notices open: the Quest Board opens'); }
{ const qb = src.match(/\{key:'questboard'[^\n]*\n/)[0]; ok(/needs:'quests'/.test(qb), '20. the Quest Board spot needs the Notices');
  ok(/if\(spot\.needs && !featureUnlocked\(spot\.needs\)\) return;/.test(fnSrc('activateSpot')), '20. activateSpot refuses it too (any other route in)');
  ok(/k === 'quests'\)\{ if\(noticeBoardUnlocked\(\)\) openQuestsModal/.test(fnSrc('performDialogueAct')), '20. an NPC reply that opens the Notices waits for them');
  const wired = ['[data-spot]', '#mapWell', '[data-courier]', '[data-curio]', '#mapCave', '#mapWanderer'].filter(s=> src.includes(s) ); ok(wired.length === 6, '19. every kind of map tile is listed');
  ok((src.match(/mapTileBlocked\(/g) || []).length >= 7, '19. each tile\'s click asks mapTileBlocked first'); }
{ const tx = fs.readFileSync(path.join(ROOT, 'bramblewood-texts.js'), 'utf8');
  ok(/"ui\.map-locked-for-now": "Locked for now"/.test(tx) && /"ui\.map-ambush-blocks": "Blocked by the ambush"/.test(tx), 'texts: both keys are in the table');
  for(const code of ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']){ const p = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', code + '.json'), 'utf8'));
    ok(!!p['Locked for now'] && !!p['Blocked by the ambush'], 'texts: ' + code + ' has both strings'); } }

console.log(fail ? `map-2026-10-24: ${fail} of ${n} checks failed` : `map-2026-10-24: all ${n} checks passed`);
process.exit(fail ? 1 : 0);
