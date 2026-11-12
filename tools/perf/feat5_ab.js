#!/usr/bin/env node
// Package PERF5 (2026-11-13): tonight's new work, feature on vs off in the same page, alternated window by window so a loaded box's noise falls on
// both alike. Each window is a Chrome trace: main-thread CPU (thread time), style / layout (passes), paint, the longest task, tasks over 16.7 ms,
// rAF frames. Medians over --reps.
//   move    UIFX2: a map move m7 -> m10 (the map's own render included), 1.5 s; off = window.BramblewoodWorld null (no travel beat, no season change)
//   typing  UIFX3: a 100-letter line types on the home tab, 1.5 s; off = StoryUI.off (the old dock); also reports the world ambient behind it
//   places  UIFX1: switchTab home -> shop, 1.2 s; off = window.BramblewoodPlaces null
//   zzz     FX9: every board unit asleep (three Zs each) vs none, 3 s, in the seeded fight
//   quake   FX8: the earthquake (6 s) on the fight's board vs the meteor (the first cinematic, as a yardstick)
//   node tools/perf/feat5_ab.js --what move,typing,places,zzz,quake [--reps 3] [--rate 1] [--page index.html]
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const args = process.argv.slice(2), opt = (k, d)=>{ const i = args.indexOf(k); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
function pw(){ try{ return require('playwright'); }catch(e){ return require(path.join(require('child_process').execSync('npm root -g').toString().trim(), 'playwright')); } }
const src = fs.readFileSync(path.join(ROOT, 'tests/perf2-2026-11-11.js'), 'utf8');
const lit = n=>{ const j = src.indexOf('const ' + n + ' = ') + n.length + 9, q = src[j]; let k = j + 1; while(src[k] !== q || src[k - 1] === '\\') k++; return src.slice(j, k + 1); };
const SKIP = eval(lit('SKIP')), OWN = eval(lit('OWN'));
const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const TYPES = {'.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.css': 'text/css', '.woff2': 'font/woff2'};
function serve(page){ const http = require('http'); return new Promise(res=>{ const s = http.createServer((q, r)=>{ let p = decodeURIComponent(q.url.split('?')[0]); if(p === '/') p = '/index.html';
  const f = p === '/index.html' ? page : path.join(ROOT, p); fs.readFile(f, (e, d)=>{ if(e){ r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': TYPES[path.extname(f)] || 'application/octet-stream'}); r.end(d); }); }); s.listen(0, '127.0.0.1', ()=> res(s)); }); }
const med = a=>{ const s = a.slice().sort((x, y)=> x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };
const MAPSET = `(()=>{ try{ skipTriggerLesson(); }catch(e){} const p = loadConquestProgress(); p.completed = p.completed || []; p.ranks = p.ranks || {};
  CONQUEST_MAPS.forEach(m=> (m.nodes||[]).forEach(n=>{ const id = conquestNodeId(m.id, n.key); if(!p.completed.includes(id)) p.completed.push(id); p.ranks[id] = 'S'; })); saveConquestProgress(p);
  try{ const f = loadDialogueFlags(); Object.keys(DIALOGUES).forEach(k=> f['seen:' + k] = 1); localStorage.setItem(DIALOGUE_FLAGS_KEY, JSON.stringify(f)); }catch(e){}
  const ids = CONQUEST_MAPS.map(m=> m.id); localStorage.setItem('bramblewood_maps_opened', JSON.stringify(ids)); sessionStorage.setItem('bw_fxg_map_titles', JSON.stringify(ids));
  try{ localStorage.setItem(MAP_HEAD_SEEN_KEY, JSON.stringify(ids)); }catch(e){} try{ mapVeilShownThisSession = true; }catch(e){}
  localStorage.setItem('bramblewood_shaders_v1', 'off'); applyFxLevel && applyFxLevel(); document.querySelectorAll('canvas.bw-shader-map').forEach(c=> c.remove());
  window.__clean = ()=>{ try{ pl1XpPending = null; }catch(_){} document.querySelectorAll('.dialogue-wrap, .dlg, .modal-overlay, .coach-tip, .toast, .pack-open-overlay, .pl1-xp-float').forEach(e=>{ try{ e.remove(); }catch(_){} }); };
  window.__show = id=>{ __clean(); conquestWorldView = false; playSubTab = 'conquest'; conquestSelectedMap = id; conquestSelectedNodeKey = null; try{ conquestSubZoom = null; }catch(e){} switchTab('play'); try{ renderPlay(); }catch(e){} };
  window.__keep = { W: window.BramblewoodWorld, P: window.BramblewoodPlaces }; return 1; })()`;
const FIGHT = `(async()=>{ adminModeEnabled = true; forcedNextSeed = 777; switchTab('play'); startConquestMatch('mw', '5-3', {skipEnergyCost:true, noOpener:true}); await new Promise(r=> setTimeout(r, 2600)); try{ skipTriggerLesson(); }catch(e){} const h = document.getElementById('toastHost'); if(h) h.remove(); window.showToast = ()=>{};
  const m = matchState, pl = m.players[1], c = pl.hand.find(h=> m.engine.canPlay(pl, h.defId, h.uid)); if(c) await playCardByUid(c.uid, 'left'); await new Promise(r=> setTimeout(r, 2500)); return 1; })()`;
// per scenario: setup (once), then for each window: prep(on) (untraced), fire(on) (traced, the window follows), after(on) (untraced)
const SC = {
  move: {setup: MAPSET, win: 1500, prep: on=> `(async()=>{ window.BramblewoodWorld = __keep.W; __show('m7'); await new Promise(r=> setTimeout(r, 3000)); window.BramblewoodWorld = ${on} ? __keep.W : null; return 1; })()`,
    fire: ()=> `(()=>{ __clean(); conquestPanTo('m10', document.getElementById('playSubBody'), loadConquestProgress()); return 1; })()`, after: ()=> `(()=>{ window.BramblewoodWorld = __keep.W; return 1; })()`},
  typing: {setup: MAPSET + `; switchTab('home'); DIALOGUE_GAP_MS = 60; DIALOGUE_REPEAT_MS = 0; DIALOGUES.__t = {lines:[{who:'golem', text:'Feed a card Dust and Leaves, and I temper it, one level at a time. At level 10 a card hits its limit.'}]};
      window.__finish = async ()=>{ for(let k = 0; k < 6; k++){ StoryUI.complete(); try{ dialogueAdvance && dialogueAdvance(true); }catch(e){} await new Promise(r=> setTimeout(r, 120)); } await window.__p; await new Promise(r=> setTimeout(r, 800)); return 1; }; 1`, win: 1500,
    prep: on=> `(async()=>{ StoryUI.off = ${!on}; await new Promise(r=> setTimeout(r, 500)); return 1; })()`,
    fire: ()=> `(()=>{ window.__p = playDialogue('__t', {force:true, expand:true}); return {amb: document.querySelectorAll('.bww-amb > i').length, tab: currentTab}; })()`, after: ()=> `(async()=>{ await __finish(); StoryUI.off = false; return 1; })()`},
  places: {setup: MAPSET + `; switchTab('home'); 1`, win: 1200, prep: on=> `(async()=>{ switchTab('home'); await new Promise(r=> setTimeout(r, 1500)); window.BramblewoodPlaces = ${on} ? __keep.P : null; return 1; })()`,
    fire: ()=> `(()=>{ switchTab('shop'); return 1; })()`, after: ()=> `(()=>{ window.BramblewoodPlaces = __keep.P; return 1; })()`},
  zzz: {setup: FIGHT, win: 3000, prep: on=> `(async()=>{ document.querySelectorAll('#battlefieldInner .board-card .card-tile').forEach(t=> fx9ZzzSync(t, ${on})); await new Promise(r=> setTimeout(r, 800)); return document.querySelectorAll('.fx9-zzz:not(.is-waking)').length; })()`,
    fire: ()=> `1`, after: ()=> `1`},
  quake: {setup: FIGHT, win: 6500, prep: ()=> `(async()=>{ await new Promise(r=> setTimeout(r, 1000)); return 1; })()`,
    fire: on=> `(()=>{ BramblewoodCinematic.${'${N}'}(document.getElementById('battlefieldEl')); return 1; })()`.replace('${N}', on ? 'earthquake' : 'meteor'), after: ()=> `(async()=>{ await new Promise(r=> setTimeout(r, 1500)); return 1; })()`},
};
const STK = {true: {}, false: {}}; let GSL = -9; // --stacks: style / layout passes by the JS that asked (GSAP's own frames skipped), per on / off
function stacks(ev, on){ ev.filter(e=> e.ph === 'X' && (e.name === 'UpdateLayoutTree' || e.name === 'Layout') && e.args).forEach(e=>{ const st = ((e.args.beginData && e.args.beginData.stackTrace) || (e.args.data && e.args.data.stackTrace) || []).filter(x=> x.url && Math.abs(x.lineNumber - GSL) > 1).slice(0, 2);
  const k = e.name[0] + ' ' + (st.length ? st.map(f=> (f.functionName || '(anon)') + ':' + f.lineNumber).join(' < ') : '(frame)'), r = STK[on][k] || (STK[on][k] = {n: 0, ms: 0}); r.n++; r.ms += (e.tdur || 0) / 1000; }); }
function work(ev){
  const main = new Set(ev.filter(e=> e.name === 'thread_name' && e.args && e.args.name === 'CrRendererMain').map(e=> e.pid + ':' + e.tid));
  const M = ev.filter(e=> e.ph === 'X' && main.has(e.pid + ':' + e.tid)), sum = nm=> M.filter(e=> e.name === nm).reduce((s, e)=> s + (e.tdur || 0), 0) / 1000;
  const tasks = M.filter(e=> e.name === 'RunTask').map(e=> (e.tdur || 0) / 1000);
  return {cpu: sum('RunTask'), style: sum('UpdateLayoutTree'), styleN: M.filter(e=> e.name === 'UpdateLayoutTree').length, layout: sum('Layout'), layoutN: M.filter(e=> e.name === 'Layout').length, paint: sum('Paint'),
    maxTask: Math.max(0, ...tasks), over16: tasks.filter(x=> x > 16.7).length};
}
(async()=>{
  const page = path.resolve(opt('--page', path.join(ROOT, 'index.html'))), reps = +opt('--reps', 3), rate = +opt('--rate', 1), what = opt('--what', 'move,typing,places,zzz,quake').split(',').filter(k=> SC[k]);
  { const L = fs.readFileSync(page, 'utf8').split('\n'); GSL = L.findIndex(l=> l.startsWith('!function(t,e){') && l.includes('gsap')) + 1; }
  const s = await serve(page), url = `http://127.0.0.1:${s.address().port}/index.html`;
  const b = await pw().chromium.launch({executablePath: fs.existsSync(EXE) ? EXE : undefined});
  for(const k of what){ const sc = SC[k], res = {true: [], false: []}, errs = [], notes = [];
    const ctx = await b.newContext({viewport: {width: 1366, height: 768}}), pg = await ctx.newPage(); pg.on('pageerror', e=> errs.push(String(e)));
    await pg.addInitScript(SKIP + `window.__fr = []; (()=>{ let l = 0; const f = t=>{ if(l) window.__fr.push(t - l); l = t; requestAnimationFrame(f); }; requestAnimationFrame(f); })();`);
    await pg.goto(url); await pg.waitForFunction("typeof startConquestMatch === 'function'", null, {timeout: 180000}); await pg.waitForTimeout(1500); await pg.evaluate(OWN);
    await pg.evaluate(sc.setup); await pg.waitForTimeout(2000);
    const cdp = await ctx.newCDPSession(pg); await cdp.send('Emulation.setCPUThrottlingRate', {rate});
    for(let r = 0; r < reps; r++) for(const on of (r % 2 ? [false, true] : [true, false])){
      notes.push(await pg.evaluate(sc.prep(on)));
      const evs = [], h = d=>{ for(const e of d.value) evs.push(e); }; cdp.on('Tracing.dataCollected', h); await pg.evaluate("window.__fr.length = 0");
      await cdp.send('Tracing.start', {transferMode: 'ReportEvents', traceConfig: {includedCategories: ['devtools.timeline', 'disabled-by-default-devtools.timeline'].concat(args.includes('--stacks') ? ['disabled-by-default-devtools.timeline.stack'] : []), recordMode: 'recordContinuously'}});
      notes.push(await pg.evaluate(sc.fire(on))); await pg.waitForTimeout(sc.win);
      await new Promise(async res=>{ cdp.once('Tracing.tracingComplete', res); await cdp.send('Tracing.end'); }); cdp.off('Tracing.dataCollected', h);
      if(args.includes('--stacks')) stacks(evs, on);
      const fr = await pg.evaluate("window.__fr.slice()"); res[on].push(Object.assign(work(evs), {frames: fr.length, f33: fr.filter(x=> x > 33.5).length, p95: (()=>{ const q = fr.slice().sort((a, c)=> a - c); return q.length ? q[Math.min(q.length - 1, Math.floor(q.length * .95))] : 0; })()}));
      await pg.evaluate(sc.after(on));
    }
    await ctx.close();
    console.log(`${k} (${path.basename(page)}, ${rate}x, ${sc.win} ms windows, medians of ${reps}; notes ${JSON.stringify(notes.filter(x=> x !== 1).slice(0, 4))})`);
    for(const on of [true, false]){ const a = res[on], m = f=> med(a.map(x=> x[f]));
      console.log(`  ${on ? 'on ' : 'off'}  cpu ${Math.round(m('cpu'))} ms  style ${Math.round(m('style'))}/${m('styleN')}  layout ${Math.round(m('layout'))}/${m('layoutN')}  paint ${Math.round(m('paint'))}  maxTask ${Math.round(m('maxTask'))}  >16.7 ${m('over16')}  frames ${m('frames')} >33 ${m('f33')} p95gap ${Math.round(m('p95'))}   cpu each: ${a.map(x=> Math.round(x.cpu)).join(',')}`); }
    if(args.includes('--stacks')) for(const on of [true, false]){ console.log(`  -- ${on ? 'on' : 'off'}: passes by caller (ms, count, all windows)`); Object.entries(STK[on]).sort((a, c)=> c[1].ms - a[1].ms).slice(0, 10).forEach(([q, v])=> console.log('   ' + v.ms.toFixed(1).padStart(7), String(v.n).padStart(5), q)); STK[on] = {}; }
    if(errs.length) console.log('  errors', errs.slice(0, 3));
  }
  await b.close(); s.close();
})();
