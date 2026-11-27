#!/usr/bin/env node
// 2026-11-27 (package VFX1): what each VFX1 moment costs, before / after. The fight board of tests/vfx1-2026-11-27.js; each mode fires the
// moment through the game's own path (renderVfxForEvent, fxHook, renderBoard), then records over --win ms (1200): the synchronous start cost
// (performance.now around the call), main-thread CPU (CDP TaskDuration), frames over 16.7 ms (rAF gaps over 17.5 ms), the longest frame and
// long tasks (> 50 ms). Pages alternate run by run so a loaded box's noise falls on both. Medians over --runs.
// --mute: SFX volume 0, so a new cue's first-play buffer baking (SoundKit bakedBuf) is left out of the visual's cost.
//   node tools/perf/vfx1_probe_2026_11_27.js --ab /tmp/before.html [--runs 3] [--modes swift,tide,...] [--mute] [--json out.json]
'use strict';
const fs = require('fs'), path = require('path'), http = require('http');
const ROOT = path.join(__dirname, '..', '..');
const args = process.argv.slice(2), opt = (k, d)=>{ const i = args.indexOf(k); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
function pw(){ try{ return require('playwright'); }catch(e){ return require(path.join(require('child_process').execSync('npm root -g').toString().trim(), 'playwright')); } }
const T = fs.readFileSync(path.join(ROOT, 'tests/vfx1-2026-11-27.js'), 'utf8');
const lit = n=>{ const j = T.indexOf('const ' + n + ' = ') + n.length + 9, q = T[j]; let k = j + 1; while(T[k] !== q || T[k - 1] === '\\') k++; return T.slice(j, k + 1); };
const SKIP = eval(lit('SKIP')), OWN = eval(lit('OWN')), BOARD = eval(lit('BOARD'));
const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const TYPES = {'.html':'text/html', '.js':'text/javascript', '.json':'application/json', '.webp':'image/webp', '.png':'image/png', '.svg':'image/svg+xml', '.css':'text/css', '.woff2':'font/woff2'};
const U = k=> `window.__u['${k}']`;
const MODES = {
  none: ``,
  swift: `renderVfxForEvent({type:'hit', side:'A', attUid:${U('1:0')}, attDefId:'jackrabbit-sprinter', targetSide:'B', targetUid:${U('2:0')}, targetDefId:'acacia-giraffe', mods:[], dmg:2, dmgType:'physical'})`,
  mighty: `renderVfxForEvent({type:'hit', side:'B', attUid:${U('2:0')}, attDefId:'acacia-giraffe', targetSide:'A', targetUid:${U('1:-1')}, targetDefId:'pike-lancer', mods:[], dmg:6, dmgType:'physical'})`,
  sturdy: `renderVfxForEvent({type:'hit', side:'A', attUid:${U('1:-1')}, attDefId:'pike-lancer', targetSide:'B', targetUid:${U('2:-1')}, targetDefId:'pangolin-roller', dmg:2, mods:['sturdy'], dmgType:'physical'})`,
  tide: `renderVfxForEvent({type:'tide', tide:'flow', round:matchState.round})`,
  reach: `renderVfxForEvent({type:'statusFx', kind:'reachAim', side:'A', attUid:${U('1:0')}, attDefId:'jackrabbit-sprinter', targetSide:'B', targetUid:${U('2:-1')}, targetDefId:'pangolin-roller'})`,
  berry: `renderVfxForEvent({type:'statusFx', kind:'sk2Berry', side:'B', attUid:${U('2:1')}, attDefId:'dormouse', targetSide:'B', targetDefId:'dormouse', targetUid:${U('2:1')}, amount:1, total:2})`,
  twin: `renderVfxForEvent({type:'frenzy', side:'A', attUid:${U('1:0')}, attDefId:'jackrabbit-sprinter', twin:true})`,
  hatch: `window.FX.V ? FX.V.hatchPop(boardCardEl(${U('1:0')})) : null`,
  cage: `(window.FX.V && FX.V.cageClose) ? FX.V.cageClose(boardCardEl(${U('2:0')})) : FX.D.cageDrop(boardCardEl(${U('2:0')}))`,
  sea: `window.FX.V ? FX.V.seaRise() : null`,
  mage: `window.FX.V ? FX.V.mageCast(hqTileEl('B')) : null`,
  rite: `(()=>{ try{ RT1.seen.clear(); RT1.lit.clear(); }catch(e){} lastBoardSig = {1:null, 2:null}; renderBoard(); })()`,
  frost: `(()=>{ if(window.FX.V) FX.V.fieldAmbient(document.getElementById('battlefieldEl'), 'frost'); })()`,
  storm: `(()=>{ if(window.FX.V) FX.V.fieldAmbient(document.getElementById('battlefieldEl'), 'storm'); })()`,
};
const LONG = {frost: 3000, storm: 3000, none: 1200};
const med = a=>{ const s = a.slice().sort((x, y)=> x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };
(async()=>{
  const runs = +opt('--runs', 3), win = +opt('--win', 1200), modes = (opt('--modes', '') || Object.keys(MODES).join(',')).split(',');
  const pages = [{name: 'before', file: opt('--ab', null)}, {name: 'after', file: path.join(ROOT, opt('--page', 'index.html'))}].filter(p=> p.file);
  const res = {}; pages.forEach(p=> res[p.name] = {});
  for(let r = 0; r < runs; r++) for(const P of (r % 2 ? pages.slice().reverse() : pages)){
    const srv = http.createServer((q, s)=>{ let p = decodeURIComponent(q.url.split('?')[0]); if(p === '/') p = '/index.html'; const f = p === '/index.html' ? P.file : path.join(ROOT, p);
      fs.readFile(f, (e, d)=>{ if(e){ s.writeHead(404); s.end(); return; } s.writeHead(200, {'content-type': TYPES[path.extname(f)] || 'application/octet-stream'}); s.end(d); }); });
    await new Promise(x=> srv.listen(0, x)); const b = await pw().chromium.launch({executablePath: EXE});
    const pg = await b.newPage({viewport: {width: 1366, height: 768}}); await pg.addInitScript(SKIP + (args.includes('--mute') ? "localStorage.setItem('bw_sfxVolume','0');" : ''));
    await pg.goto(`http://127.0.0.1:${srv.address().port}/`); await pg.waitForFunction(()=> typeof startConquestMatch === 'function' && window.FX, null, {timeout: 120000});
    await pg.evaluate(OWN); await pg.evaluate(BOARD); const cdp = await pg.context().newCDPSession(pg); await cdp.send('Performance.enable');
    await pg.evaluate(()=>{ window.__lt = []; try{ new PerformanceObserver(l=> l.getEntries().forEach(e=> window.__lt.push(e.duration))).observe({entryTypes: ['longtask']}); }catch(e){} });
    for(const m of modes){
      await pg.evaluate(()=>{ document.querySelectorAll('.fxv:not(style), .rt1-lift').forEach(e=> e.remove()); if(window.FX.V) FX.V.fieldAmbient(document.getElementById('battlefieldEl'), null); matchState.round = (matchState.round || 1) + 1; });
      await pg.waitForTimeout(600);
      const cpu0 = (await cdp.send('Performance.getMetrics')).metrics.find(x=> x.name === 'TaskDuration').value;
      const w = LONG[m] || win;
      const o = await pg.evaluate(async([js, w])=>{ window.__lt = []; const fr = []; let last = performance.now(), go = true; const tick = t=>{ fr.push(t - last); last = t; if(go) requestAnimationFrame(tick); }; requestAnimationFrame(tick);
        const t0 = performance.now(); try{ (0, eval)(js); }catch(e){} const sync = performance.now() - t0; await new Promise(x=> setTimeout(x, w)); go = false;
        return {sync, over: fr.filter(d=> d > 17.5).length, worst: Math.max(0, ...fr), frames: fr.length, long: window.__lt.length}; }, [MODES[m], w]);
      const cpu1 = (await cdp.send('Performance.getMetrics')).metrics.find(x=> x.name === 'TaskDuration').value; o.cpu = (cpu1 - cpu0) * 1000;
      (res[P.name][m] = res[P.name][m] || []).push(o);
    }
    await b.close(); srv.close(); process.stderr.write(`run ${r + 1} ${P.name} done\n`);
  }
  console.log('mode      page    sync ms  cpu ms  frames>16.7  worst ms  long tasks   (medians of ' + runs + ')');
  for(const m of modes) for(const P of pages){ const a = res[P.name][m] || []; const f = k=> med(a.map(x=> x[k]));
    console.log(`${m.padEnd(9)} ${P.name.padEnd(7)} ${f('sync').toFixed(1).padStart(7)} ${f('cpu').toFixed(0).padStart(7)} ${String(f('over')).padStart(12)} ${f('worst').toFixed(0).padStart(9)} ${String(f('long')).padStart(11)}`); }
  if(args.includes('--json')) fs.writeFileSync(opt('--json'), JSON.stringify(res, null, 1));
})();
