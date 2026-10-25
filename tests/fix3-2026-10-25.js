#!/usr/bin/env node
// 2026-10-25 (package FIX3, owner notes 10-25 17:53 F1-F6 and 22:36 G1-G22). The functions are cut out of arena_app.js and run against
// the real map data (CONQUEST_MAPS) or small stand-ins; tests/e2e/fix3_2026_10_25.py drives the real page at 390 and 1366.
//   F1. a win opens every fight it links to: over every map, each drawn link opens its fight on its own; every fight can be reached;
//       the live edit that linked 6-3 to 6-6 (6-6 needs 6-5 and 6-3) opens 6-6 after 6-3. "all of these" stays as an opt-in.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
function fnSrc(name){
  let a = src.indexOf('\nfunction ' + name + '('); if(a < 0) a = src.indexOf('\nasync function ' + name + '('); if(a < 0) return '';
  let i = src.indexOf('{', src.indexOf(')', a)), depth = 0;
  for(; i < src.length; i++){ const ch = src[i]; if(ch === '{') depth++; else if(ch === '}'){ depth--; if(!depth) break; } }
  return src.slice(a + 1, i + 1);
}
function literal(decl){ const a = src.indexOf('\n' + decl); let i = src.indexOf('[', a), d = 0;
  for(; i < src.length; i++){ const c = src[i]; if(c === '[') d++; else if(c === ']'){ d--; if(!d) break; } }
  return src.slice(src.indexOf('[', a), i + 1); }

// ---------------- F1: links ----------------
{ const MAPS = vm.runInNewContext('(' + literal('const CONQUEST_MAPS = [') + ')', {});
  ok(MAPS.length > 30, 'F1. the map list is read from arena_app.js (' + MAPS.length + ' maps)');
  const vis = new Function('adminModeEnabled', 'loadTutorialDone', 'loadTutorial2Done',
    `function ambushLocksNode(){ return false; } function tutSideNodeGated(){ return false; } function conquestNodeId(m, k){ return m + ':' + k; }
     ${fnSrc('nodeNeedsAllLinks')}\n${fnSrc('isNodeVisible')}\nreturn isNodeVisible;`)(false, ()=> true, ()=> true);
  const id = (m, k)=> m.id + ':' + k;
  let links = 0, shut = [], unreached = [];
  MAPS.forEach(map=>{
    if(!map.sequential || !Array.isArray(map.nodes)) return;
    const real = map.nodes.filter(nd=> nd.kind !== 'tutorial' && !(nd.chance > 0));
    // each drawn link (the trail draws one line per entry of requires) opens its fight on its own (a chance fight once its roll found it)
    map.nodes.forEach((nd, i)=>{ if(!Array.isArray(nd.requires) || nd.requiresAll) return;
      nd.requires.forEach(from=>{ const fn = map.nodes.find(x=> x.key === from); if(!fn || fn.kind === 'tutorial') return; links++;
        if(!vis(map, nd, i, {completed: [id(map, from)], found: nd.chance > 0 ? [id(map, nd.key)] : []})) shut.push(`${map.id} ${from}->${nd.key}`); }); });
    // every fight is reachable by winning what is open
    const done = new Set(); let grew = true;
    while(grew){ grew = false; map.nodes.forEach((nd, i)=>{ if(done.has(nd.key)) return; if(vis(map, nd, i, {completed: [...done].map(k=> id(map, k)), found: map.nodes.filter(x=> x.chance > 0).map(x=> id(map, x.key))})){ done.add(nd.key); grew = true; } }); }
    real.forEach(nd=>{ if(!done.has(nd.key)) unreached.push(`${map.id} ${nd.key}`); });
  });
  ok(links > 150, `F1. links checked over every map (${links})`);
  ok(!shut.length, 'F1. every link opens its fight on its own win ' + shut.slice(0, 8).join(', '));
  ok(!unreached.length, 'F1. every fight on every map can be reached ' + unreached.slice(0, 8).join(', '));
  // the live edit the owner played (card_overrides __cfg:map-nodes:m8, 8-6 = 6-6 needs 8-5 and 8-3)
  const m8 = JSON.parse(JSON.stringify(MAPS.find(m=> m.id === 'm8'))), six = m8.nodes.findIndex(x=> x.key === '6-6');
  m8.nodes[six].requires = ['6-5', '6-3'];
  ok(vis(m8, m8.nodes[six], six, {completed: ['m8:6-1', 'm8:6-2', 'm8:6-3'], found: []}), 'F1. 6-3 won: 6-6 (linked from 6-3 and 6-5) opens');
  ok(vis(m8, m8.nodes[six - 2], six - 2, {completed: ['m8:6-1', 'm8:6-2', 'm8:6-3'], found: []}), 'F1. 6-3 won: 6-4 opens too (both links from 6-3)');
  m8.nodes[six].requiresAll = true;
  ok(!vis(m8, m8.nodes[six], six, {completed: ['m8:6-3'], found: []}) && vis(m8, m8.nodes[six], six, {completed: ['m8:6-3', 'm8:6-5'], found: []}), 'F1. a fight set to "all of these" waits for every link');
  ok(/nodeNeedsAllLinks\(n\) && reqs\.length > 1 \? 'is-all'/.test(src) && /\.map-trail-svg \.is-all\{stroke-dasharray/.test(tpl), 'F1. only an "all of these" fight\'s links are dotted');
  ok(/opt\('all', nodeNeedsAllLinks\(draft\)/.test(src) && /draft\.requiresAll = true/.test(src), 'F1. the skirmish editor offers "all of these" as the opt-in');
  ok(/rq\[nodeNeedsAllLinks\(n\) \? 'every' : 'some'\]/.test(src), 'F1. chance fights roll on the same rule');
}

console.log(`fix3: ${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);
