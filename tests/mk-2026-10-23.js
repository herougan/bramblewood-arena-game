#!/usr/bin/env node
// 2026-10-23 (package MK, owner 11:28: "why does completing a skirmish put my conquest map marker (the bird/otter/etc) move to Map N-1?";
// 11:29: "i'm stuck in Map 0 in my new account ... check if the last unlocking map is completed, if so, manually unlock the next map"):
//   1. the results' Back to map no longer counts as a click outside the skirmish panel (it ended the match inside its own click, so the
//      bubbling click found the map back and the button gone): the fight stays selected and the pawn stays on it; with nothing selected
//      on a map whose fights are all won the pawn keeps its spot (was: the map's first fight, "N-1");
//   2. healMapProgress: old node-id spellings in the progress are read as the new ones; the furthest main map open in order is returned;
//      nothing is ever marked open (a map whose fights are not won stays locked); idempotent;
//   3. a player whose next map is open but out of reach (world still hidden: no list, no › edge; every load starts on Map 0) is taken
//      there, once for each new furthest map.
// The browser part drives the real return path (a real click on Back to map, Fight again, Auto-sweep) and a page load of a stuck save,
// at 1366 and 390; screenshots in docs/screens/MK/.
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

// --- 1. static: the outside-click guard and the pawn's fallback
{ const blk = src.slice(src.indexOf('(function closeNodePanelOnOutsideClick(){'), src.indexOf('})();', src.indexOf('(function closeNodePanelOnOutsideClick(){')));
  ok(/inMatch: !!\(typeof matchState !== 'undefined' && matchState\)/.test(blk), '1. the pointerdown notes whether a fight was on');
  ok(/if\(\(down && down\.inMatch\) \|\| \(e\.target && e\.target\.isConnected === false\)\) return;/.test(blk), '1. a click begun in a fight, or on a button that left the page, never closes the panel'); }
ok(/if\(next < 0 && spots\[map\.id\] != null && idxOf\(spots\[map\.id\]\) >= 0\) target = spots\[map\.id\];/.test(fnSrc('placeMapPawn')), '1. on a cleared map the pawn keeps its spot');

// --- 2. healMapProgress, evaluated
ok(!!fnSrc('healMapProgress'), '2. healMapProgress exists');
if(fnSrc('healMapProgress')){ const a = src.indexOf('// ---- Node ids follow the map numbers'), b = src.indexOf('migrateLegacyNodeIds();\n', a);
  const mig = new Function('localStorage', src.slice(a, b) + '; return {migrateNodeIdString};')({length:0, key:()=> null, getItem:()=> null, setItem(){}});
  const maps = [{id:'m1', nodes:[{key:'0-1'}, {key:'0-2'}, {key:'0-3'}, {key:'0-4'}]}, {id:'mf', unlockAfter:'m1', nodes:[{key:'1-1'}, {key:'1-5'}]}, {id:'mb', unlockAfter:'mf', nodes:[{key:'2-1'}]}, {id:'mq', sub:true, parent:'m1', nodes:[]}];
  const isMapUnlocked = (m, p)=>{ if(!m.unlockAfter) return true; if(m.nodes.some(nd=> p.completed.includes(m.id + ':' + nd.key))) return true; const prev = maps.find(x=> x.id === m.unlockAfter); return prev.nodes.every(nd=> p.completed.includes(prev.id + ':' + nd.key)); };
  let store = null, saves = 0;
  const heal = new Function('loadConquestProgress', 'saveConquestProgress', 'migrateNodeIdString', 'rankAtLeast', 'mainConquestMaps', 'isMapUnlocked', fnSrc('healMapProgress') + '\nreturn healMapProgress;')(
    ()=> JSON.parse(JSON.stringify(store)), p=>{ saves++; store = JSON.parse(JSON.stringify(p)); }, mig.migrateNodeIdString, (a2, b2)=> 'CBAS'.indexOf(a2) >= 'CBAS'.indexOf(b2), ()=> maps.filter(m=> !m.sub), isMapUnlocked);
  store = {completed:['mtut:tutorial', 'mtut:tutorial2', 'm1:1-1', 'm1:1-2', 'm1:1-3', 'm1:1-4'], ranks:{'m1:1-4':'A', 'm1:0-4':'B'}, clearedAt:{'m1:1-1':5}};
  let far = heal();
  ok(far && far.id === 'mf', '2. an old-style save (Map 0 under m1:1-1 … 1-4) opens Map 1: ' + (far && far.id));
  ok(JSON.stringify(store.completed) === JSON.stringify(['mtut:tutorial', 'mtut:tutorial2', 'm1:0-1', 'm1:0-2', 'm1:0-3', 'm1:0-4']) && store.ranks['m1:0-4'] === 'A' && !store.ranks['m1:1-4'] && store.clearedAt['m1:0-1'] === 5, '2. its ids are repaired (the better rank kept): ' + JSON.stringify(store));
  const s1 = saves, snap = JSON.stringify(store); far = heal();
  ok(saves === s1 && JSON.stringify(store) === snap && far.id === 'mf', '2. idempotent: a second run changes nothing');
  store = {completed:['m1:0-1', 'm1:0-2', 'm1:0-3'], ranks:{}}; far = heal();
  ok(far && far.id === 'm1' && store.completed.length === 3, '2. Map 0 not cleared: Map 1 stays locked, nothing added');
  store = {completed:['m1:0-1', 'm1:0-2', 'm1:0-3', 'm1:0-4', 'mf:1-1'], ranks:{}}; far = heal();
  ok(far && far.id === 'mf', '2. Map 1 half won: Map 2 stays locked');
  ok(!/completed\.push|raidUnlocked|world_open/.test(fnSrc('healMapProgress')), '2. healMapProgress never marks a fight won or the world open'); }

// --- 3. static: the landing
{ const r = fnSrc('renderConquestSubTab');
  ok(/const far = healMapProgress\(\);\s*\n\s*if\(far && far\.id !== mkRoadLandedFor\)\{ mkRoadLandedFor = far\.id;/.test(r) && /!here\.sub && !worldRevealed\(\) && mains\.indexOf\(here\) < mains\.indexOf\(far\)\) conquestAutoAdvanceTo = far\.id;/.test(r), '3. the road opens on the furthest map while the world is hidden, once for each new furthest map');
  ok(r.indexOf('const far = healMapProgress()') < r.indexOf('if(conquestAutoAdvanceTo && !matchState'), '3. before the PG step that reads conquestAutoAdvanceTo'); }
ok(/^## 2026-10-23 \(package MK/m.test(fs.readFileSync(path.join(ROOT, 'docs', 'CHANGELOG.md'), 'utf8')), 'CHANGELOG entry');

// ---- browser
async function browser(){
  let pw; try{ pw = require('playwright'); }catch(e){ console.log('  (browser part skipped: no playwright)'); return; }
  const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
  if(!fs.existsSync(EXE) || !fs.existsSync(path.join(ROOT, 'index.html'))){ console.log('  (browser part skipped: no Chromium or index.html)'); return; }
  const SHOTS = path.join(ROOT, 'docs', 'screens', 'MK'); fs.mkdirSync(SHOTS, {recursive: true});
  const URL = 'file://' + path.join(ROOT, 'index.html');
  const INIT = "localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); sessionStorage.setItem('bramblewood_seen_splash','1');";
  const b = await pw.chromium.launch({executablePath: EXE});
  const errs = [];
  const open = async (w, world, prog)=>{ const ctx = await b.newContext({viewport:{width:w, height: w < 500 ? 844 : 900}, hasTouch: w < 500});
    await ctx.route('**/*', r=> r.request().url().startsWith('file:') ? r.continue() : r.abort()); // nothing leaves the page
    const pg = await ctx.newPage(); pg.on('pageerror', e=> errs.push(`@${w}: ` + String(e)));
    await pg.addInitScript(INIT + (world ? "localStorage.setItem('bramblewood_world_open_v1','1');" : '') + (prog ? `localStorage.setItem('bramblewood_conquest_progress_v1', ${JSON.stringify(prog)});` : ''));
    await pg.goto(URL, {waitUntil:'domcontentloaded', timeout:90000}); await pg.waitForTimeout(2500);
    // the deck gate is not under test here (this headless save skips the starter-deck window, so its deck names cards it doesn't own)
    await pg.evaluate("FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); claimTutorialWin('otters'); window.deckSizeOkOrWarn = ()=> true; 1"); return [ctx, pg]; };
  // a save: Maps 0 … N-1 won, on Map N the first fight (or every fight) won
  const save = (pg, N, full)=> pg.evaluate(`(()=>{ const mains = mainConquestMaps(), p = loadConquestProgress(); p.completed = ['mtut:tutorial','mtut:tutorial2'];
    const story = m=> m.nodes.filter(n=> !(n.chance > 0) && !n.secret);
    for(let i = 0; i < ${N}; i++) story(mains[i]).forEach(n=> p.completed.push(conquestNodeId(mains[i].id, n.key)));
    const here = mains[${N}]; (${full ? 1 : 0} ? story(here) : [here.nodes[0]]).forEach(n=> p.completed.push(conquestNodeId(here.id, n.key))); saveConquestProgress(p);
    conquestSelectedMap = here.id; conquestSelectedNodeKey = here.nodes[1].key; playSubTab = 'conquest'; switchTab('play'); return {map: here.id, key: here.nodes[1].key}; })()`);
  const state = pg=> pg.evaluate(`({sel: conquestSelectedMap, node: conquestSelectedNodeKey, pawn: JSON.parse(localStorage.getItem(MAP_PAWN_KEY) || '{}')[conquestSelectedMap] || null, shown: (document.querySelector('#view-play .conquest-main') || {dataset:{}}).dataset.mapId || null})`);
  const winToResults = async pg=>{
    for(let i = 0; i < 30; i++){ const st = await pg.evaluate("(()=>{ const v = document.querySelector('.vs-screen'); if(v) v.click(); return !!(matchState && matchState.mode === 'conquest' && document.getElementById('rowMine')); })()"); if(st) break; await pg.waitForTimeout(300); }
    await pg.waitForTimeout(1000);
    await pg.evaluate("window.__mk = matchState; matchState.players[2].hq.shield = 0; matchState.players[2].hq.hp = 0; resolveRound(); 1"); // a real last blow
    for(let i = 0; i < 80; i++){ if(await pg.evaluate("!!(window.__mk.rewardRecorded)")) break; await pg.waitForTimeout(250); }
    for(let i = 0; i < 60; i++){ const st = await pg.evaluate("(()=>{ const rr = document.querySelector('.rr-stage'); if(rr){ rr.dispatchEvent(new PointerEvent('pointerdown', {bubbles:true})); return ''; } const q = document.getElementById('wlQuitBtn'); return q && !q.disabled ? 'ok' : ''; })()"); if(st) return true; await pg.waitForTimeout(250); }
    return false; };
  try{
    // ===== the owner's report: win a skirmish on Map N, Back to map (a real mouse click)
    for(const [w, N, full] of [[1366, 1, false], [1366, 2, true], [1366, 5, false], [390, 2, true]]){
      const [ctx, pg] = await open(w, true);
      const s = await save(pg, N, full); await pg.waitForTimeout(800);
      const before = await state(pg);
      ok(await pg.evaluate(`startConquestMatch('${s.map}', '${s.key}', {skipEnergyCost:true, noAmbush:true})`), `B@${w} Map ${N} ${s.key}: the fight starts`);
      ok(await winToResults(pg), `B@${w} Map ${N}: won, the results are up`);
      await pg.click('#wlQuitBtn'); await pg.waitForTimeout(1800);
      const after = await state(pg);
      // 2026-10-24 (package PL1, owner 21:20 #4: "Upon completing - and pressing X - the character token should move the next skirmish"): a
      // first clear lets go of the fight and the pawn walks on to the next fight not yet won on the same map; a replayed (cleared) fight keeps
      // MK's behaviour (still picked, the pawn on it). Never another map, never the map's first fight.
      if(full) ok(after.sel === s.map && after.shown === s.map && after.node === s.key && after.pawn === s.key,
        `B@${w} Map ${N} (cleared): back on the map, the same map, the fight still picked, the pawn on it (before ${JSON.stringify(before)}, after ${JSON.stringify(after)})`);
      else { const nextUnwon = await pg.evaluate(`(()=>{ const m = CONQUEST_MAPS.find(x=> x.id === '${s.map}'), p = loadConquestProgress(); const n = m.nodes.find(nd=> nd.kind !== 'tutorial' && !p.completed.includes(conquestNodeId(m.id, nd.key))); return n ? n.key : null; })()`);
        ok(after.sel === s.map && after.shown === s.map && after.node === null && after.pawn === nextUnwon && after.pawn !== s.key,
          `B@${w} Map ${N}: back on the map after a first clear, the same map, the pawn walks on to the next fight not yet won (${nextUnwon}) (before ${JSON.stringify(before)}, after ${JSON.stringify(after)})`); }
      if(N === 2) await pg.screenshot({path: path.join(SHOTS, `after-win-${w}.png`)});
      if(full && w === 1366){ // nothing picked on a cleared map: the pawn stays where it stood
        await pg.evaluate("conquestSelectedNodeKey = null; renderConquestSubTab(document.getElementById('playSubBody')); 1"); await pg.waitForTimeout(400);
        const st = await state(pg); ok(st.pawn === s.key, `B Map ${N} cleared, nothing picked: the pawn keeps its spot (${st.pawn}, was the first fight)`); }
      await ctx.close(); }
    // ===== Fight again and Auto-sweep
    { const [ctx, pg] = await open(1366, true);
      const s = await save(pg, 2, false); await pg.waitForTimeout(800);
      await pg.evaluate(`startConquestMatch('${s.map}', '${s.key}', {skipEnergyCost:true, noAmbush:true})`); ok(await winToResults(pg), 'B Fight again: the first win');
      await pg.evaluate("myCurrencies.energy = Math.max(myCurrencies.energy || 0, 50); 1");
      await pg.click('#wlPrimaryBtn'); await pg.waitForTimeout(1500);
      const again = await pg.evaluate("matchState && matchState.conquestNode ? matchState.conquestNode.mapId + ':' + matchState.conquestNode.nodeId : null");
      ok(again === s.map + ':' + s.key, `B Fight again replays the same fight (${again})`);
      ok(await winToResults(pg), 'B Fight again: the second win'); await pg.click('#wlQuitBtn'); await pg.waitForTimeout(1500);
      let st = await state(pg); ok(st.sel === s.map && st.node === s.key && st.pawn === s.key, `B Fight again, then Back to map: in place (${JSON.stringify(st)})`);
      await pg.evaluate(`(()=>{ myCurrencies.energy = 99; const r = runSweep('${s.map}', '${s.key}', 1); renderConquestSubTab(document.getElementById('playSubBody')); if(r) showSweepResults(r, '${s.map}', '${s.key}'); })()`); await pg.waitForTimeout(1200);
      st = await state(pg); ok(st.sel === s.map && st.node === s.key && st.pawn === s.key, `B Auto-sweep: in place (${JSON.stringify(st)})`);
      await ctx.close(); }
    // ===== the stuck Map 0: cleared, world hidden, the page loaded again (or an older version's save)
    for(const [label, ids, want, open1] of [['cleared', ['0-1','0-2','0-3','0-4'], 'mf', true], ['old ids', ['1-1','1-2','1-3','1-4'], 'mf', true], ['not cleared', ['0-1','0-2','0-3'], 'm1', false]]){
      // the save is on the device when the page loads (a page reload in this harness can lose a file:// page's storage)
      const prog = JSON.stringify({completed: ['mtut:tutorial','mtut:tutorial2'].concat(ids.map(k=> 'm1:' + k)), raidUnlocked: [], ranks: {}});
      const [ctx, pg] = await open(1366, false, prog);
      await pg.evaluate("FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); playSubTab = 'conquest'; switchTab('play'); 1"); await pg.waitForTimeout(1500);
      const r = await pg.evaluate("({sel: conquestSelectedMap, world: worldRevealed(), mf: isMapUnlocked(CONQUEST_MAPS.find(m=> m.id === 'mf'), loadConquestProgress()), done: loadConquestProgress().completed.filter(id=> /^m1:/.test(id))})");
      ok(r.sel === want && r.mf === open1 && !r.world, `B stuck save (${label}): the road opens on ${want}, Map 1 ${open1 ? 'open' : 'locked'} (${JSON.stringify(r)})`);
      if(label === 'old ids') ok(JSON.stringify(r.done) === JSON.stringify(['m1:0-1','m1:0-2','m1:0-3','m1:0-4']), 'B old ids read as the new ones');
      if(open1){ // once: Map 0 picked again (a signpost, a quest) stays picked
        await pg.evaluate("conquestSelectedMap = 'm1'; conquestSelectedNodeKey = null; renderConquestSubTab(document.getElementById('playSubBody')); 1"); await pg.waitForTimeout(600);
        ok(await pg.evaluate("conquestSelectedMap") === 'm1', `B stuck save (${label}): taken there once, Map 0 can still be visited`);
        if(label === 'cleared'){ await pg.evaluate("conquestSelectedMap = 'mf'; renderConquestSubTab(document.getElementById('playSubBody')); 1"); await pg.waitForTimeout(800); await pg.screenshot({path: path.join(SHOTS, 'unstuck-map1-1366.png')}); } }
      await ctx.close(); }
  }finally{ await b.close(); }
  ok(!errs.length, 'B. no page errors: ' + errs.slice(0, 3).join(' | '));
}
browser().then(()=>{ console.log(`mk-2026-10-23: ${n - fail}/${n} passed`); process.exit(fail ? 1 : 0); }, e=>{ console.log('  ✗ browser part crashed:', e && e.message); process.exit(1); });
