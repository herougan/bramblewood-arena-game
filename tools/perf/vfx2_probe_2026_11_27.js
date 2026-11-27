#!/usr/bin/env node
// 2026-11-27 (package VFX2): what each VFX2 moment costs, before / after. The fight board of tests/vfx2-2026-11-27.js; each mode fires the event through
// the game's own path (renderVfxForEvent, renderBoard for the token tick), then records over --win ms (1000): the synchronous cost of the call
// (performance.now around it), main-thread CPU (CDP TaskDuration), frames over 16.7 ms (rAF gaps over 17.5 ms) and the longest frame. FX.V's looks
// start one tick after the event (their one rect read after the frame's layout), so on the after page each mode also times the look's own start: the
// FX.V function called directly (its rect read, sprites and Web Animations). Pages alternate run by run; medians over --runs. SFX volume 0
// (a new cue's first-play buffer baking is left out).
//   node tools/perf/vfx2_probe_2026_11_27.js --ab /tmp/before.html [--runs 3] [--modes gash,web,...] [--json out.json]
'use strict';
const fs = require('fs'), path = require('path'), http = require('http');
const ROOT = path.join(__dirname, '..', '..');
const args = process.argv.slice(2), opt = (k, d)=>{ const i = args.indexOf(k); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
function pw(){ try{ return require('playwright'); }catch(e){ return require(path.join(require('child_process').execSync('npm root -g').toString().trim(), 'playwright')); } }
const T = fs.readFileSync(path.join(ROOT, 'tests/vfx2-2026-11-27.js'), 'utf8');
const lit = n=>{ const j = T.indexOf('const ' + n + ' = ') + n.length + 9, q = T[j]; let k = j + 1; while(T[k] !== q || T[k - 1] === '\\') k++; return T.slice(j, k + 1); };
const U = k=> `window.__u['${k}']`;
const SKIP = eval(lit('SKIP')), OWN = eval(lit('OWNJS')), BOARD = eval(lit('BOARD'));
const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const TYPES = {'.html':'text/html', '.js':'text/javascript', '.json':'application/json', '.webp':'image/webp', '.png':'image/png', '.svg':'image/svg+xml', '.css':'text/css', '.woff2':'font/woff2'};
const E = k=> `boardCardEl(${U(k)})`, sfx = (kind, a, t, more)=> `renderVfxForEvent({type:'statusFx', kind:'${kind}', side:'A', attUid:${U(a)}, attDefId:'x', targetSide:'B', targetUid:${U(t)}, targetDefId:'x', amount:1${more || ''}})`;
const trig = h=> `renderVfxForEvent({type:'triggerFired', side:'A', defId:'booming-bittern', uid:${U('1:0')}, hook:'${h}', action:'stun'})`;
// [event through the game, the FX.V look called directly]
const MODES = {
  none: ['', ''],
  gash: [`renderVfxForEvent({type:'gash', side:'A', attUid:${U('1:-1')}, attDefId:'goblin-shark', targetSide:'B', targetUid:${U('2:-1')}, targetDefId:'dormouse', amount:3})`, `FX.V.gashBleed(${E('2:-1')})`],
  stampede: [`renderVfxForEvent({type:'overwhelmHQ', side:'A', attUid:${U('1:0')}, attDefId:'warhorse-charger', targetSide:'B', dmg:2})`, `FX.V.stampedeRun(${E('1:0')}, hqTileEl('B'))`],
  pulverise: [sfx('pulverise', '1:0', '2:0', ", broke:['armor']"), `FX.V.pulveriseShatter(${E('2:0')})`],
  constrict: [sfx('constrict', '1:0', '2:0', ', strangle:1'), `FX.V.constrictCoil(${E('2:0')})`],
  web: [sfx('webbed', '1:0', '2:0'), `FX.V.webNet(${E('2:0')})`],
  intimidate: [`renderVfxForEvent({type:'play', side:'A', defId:'booming-bittern', uid:${U('1:0')}, boardSide:'center', slot:0})`, `FX.V.intimidateGlare(${E('1:0')}, ${E('2:0')})`],
  decay: [`renderVfxForEvent({type:'decayTick', side:'B', defId:'dormouse', uid:${U('2:-1')}, dmg:1, atk:1})`, `FX.V.decayRot(${E('2:-1')})`],
  exploit: [sfx('exploit', '1:0', '2:0'), `FX.V.exploitLock(${E('2:0')})`],
  embrittle: [sfx('brittle', '1:0', '2:0'), `FX.V.embrittleCrack(${E('2:0')})`],
  harbinger: [`renderVfxForEvent({type:'triggerFired', side:'B', defId:'tasmanian-devil', uid:${U('2:0')}, hook:'onAnyDeath', action:'buff'})`, `FX.V.harbingerFeathers(${E('2:0')})`],
  carnage: [`renderVfxForEvent({type:'statusFx', kind:'stateSkill', name:'carnage', on:true, side:'B', attUid:${U('2:0')}, attDefId:'dust-hyena', targetUid:${U('2:0')}})`, `FX.V.carnageMoon(${E('2:0')})`],
  momentum: [sfx('momentum', '1:0', '1:0'), `FX.V.momentumFlame(${E('1:0')}, {stacks:2})`],
  progeny: [`renderVfxForEvent({type:'spawn', side:'B', defId:'dhole-runner', count:1, cause:'onDeathSpawn', uids:[${U('2:1')}], fromUid:${U('2:1')}, nearUid:${U('2:1')}})`, `FX.V.broodBurst(${E('2:1')})`],
  herbalist: [`renderVfxForEvent({type:'heal', side:'A', attUid:${U('1:1')}, attDefId:'newt-doctor', targetUid:${U('1:0')}, targetDefId:'booming-bittern', amount:2})`, `FX.V.herbLeaves(${E('1:0')})`],
  packleader: [`renderVfxForEvent({type:'play', side:'B', defId:'dhole-matriarch', uid:${U('2:0')}, boardSide:'center', slot:0})`, `FX.V.packHowlRings(${E('2:0')}, [${E('2:1')}])`],
  trigplay: [trig('onSpawn'), `FX.V.trigLook(${E('1:0')}, 'onSpawn')`],
  trigdeath: [trig('onDeath'), `FX.V.trigLook(${E('1:0')}, 'onDeath')`],
  wetchain: [`renderVfxForEvent({type:'statusFx', kind:'wetChain', side:'A', targetSide:'B', targetUid:${U('2:-1')}, fromUid:${U('2:-1')}, uids:[${U('2:0')}, ${U('2:1')}], dmgs:[1, 1], amount:2})`, `FX.V.shockHop(${E('2:-1')}, [${E('2:0')}, ${E('2:1')}])`],
  warning: [`renderVfxForEvent({type:'statusFx', kind:'warningColours', side:'A', attUid:${U('1:0')}, attDefId:'booming-bittern', targetSide:'B', targetUid:${U('2:-1')}, uids:[${U('2:-1')}, ${U('2:0')}], amount:1})`, `FX.V.warningPulse(${E('1:0')}, [${E('2:-1')}, ${E('2:0')}])`],
  token: [`(()=>{ const c = matchState.players[1].row.center[0]; c.vulnerable = 3; lastBoardSig = {1:null, 2:null}; renderBoard(); c.vulnerable = 2; lastBoardSig = {1:null, 2:null}; renderBoard(); c.vulnerable = 0; })()`, `FX.V.tokenTick(${E('1:0')}.querySelector('.ab-trig, .abadge, .badges') || ${E('1:0')})`],
};
const med = a=>{ const s = a.slice().sort((x, y)=> x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };
(async()=>{
  const runs = +opt('--runs', 3), win = +opt('--win', 1000), modes = (opt('--modes', '') || Object.keys(MODES).join(',')).split(',');
  const pages = [{name: 'before', file: opt('--ab', null)}, {name: 'after', file: path.join(ROOT, opt('--page', 'index.html'))}].filter(p=> p.file);
  const res = {}; pages.forEach(p=> res[p.name] = {});
  for(let r = 0; r < runs; r++) for(const P of (r % 2 ? pages.slice().reverse() : pages)){
    const srv = http.createServer((q, s)=>{ let p = decodeURIComponent(q.url.split('?')[0]); if(p === '/') p = '/index.html'; const f = p === '/index.html' ? P.file : path.join(ROOT, p);
      fs.readFile(f, (e, d)=>{ if(e){ s.writeHead(404); s.end(); return; } s.writeHead(200, {'content-type': TYPES[path.extname(f)] || 'application/octet-stream'}); s.end(d); }); });
    await new Promise(x=> srv.listen(0, x)); const b = await pw().chromium.launch({executablePath: EXE});
    const pg = await b.newPage({viewport: {width: 1366, height: 768}}); await pg.addInitScript(SKIP + "localStorage.setItem('bw_sfxVolume','0');");
    await pg.goto(`http://127.0.0.1:${srv.address().port}/`); await pg.waitForFunction(()=> typeof startConquestMatch === 'function' && window.FX, null, {timeout: 120000});
    await pg.evaluate(OWN); await pg.evaluate(BOARD); await pg.evaluate(()=>{ getCardDefs()['newt-doctor'].effects.herbalist = getCardDefs()['newt-doctor'].effects.herbalist || 1; });
    const cdp = await pg.context().newCDPSession(pg); await cdp.send('Performance.enable');
    for(const m of modes){
      await pg.evaluate(()=>{ document.querySelectorAll('.fxv:not(style)').forEach(e=> e.remove()); matchState.round = (matchState.round || 1) + 1; }); await pg.waitForTimeout(500);
      const cpu0 = (await cdp.send('Performance.getMetrics')).metrics.find(x=> x.name === 'TaskDuration').value;
      const o = await pg.evaluate(async([js, w])=>{ const fr = []; let last = performance.now(), go = true; const tick = t=>{ fr.push(t - last); last = t; if(go) requestAnimationFrame(tick); }; requestAnimationFrame(tick);
        const t0 = performance.now(); try{ (0, eval)(js); }catch(e){} const sync = performance.now() - t0; await new Promise(x=> setTimeout(x, w)); go = false;
        return {sync, over: fr.filter(d=> d > 17.5).length, worst: Math.max(0, ...fr)}; }, [MODES[m][0], win]);
      const cpu1 = (await cdp.send('Performance.getMetrics')).metrics.find(x=> x.name === 'TaskDuration').value; o.cpu = (cpu1 - cpu0) * 1000;
      if(P.name === 'after' && MODES[m][1]){ await pg.waitForTimeout(200); o.look = await pg.evaluate(js=>{ const t0 = performance.now(); try{ (0, eval)(js); }catch(e){} return performance.now() - t0; }, MODES[m][1]); await pg.waitForTimeout(700); }
      (res[P.name][m] = res[P.name][m] || []).push(o);
    }
    await b.close(); srv.close(); process.stderr.write(`run ${r + 1} ${P.name} done\n`);
  }
  console.log('mode        page    event sync ms  cpu ms  frames>16.7  worst ms  look start ms   (medians of ' + runs + ', 1366, ' + win + ' ms)');
  for(const m of modes) for(const P of pages){ const a = res[P.name][m] || []; const f = k=> med(a.map(x=> x[k]).filter(v=> v != null));
    console.log(`${m.padEnd(11)} ${P.name.padEnd(7)} ${f('sync').toFixed(1).padStart(13)} ${f('cpu').toFixed(0).padStart(7)} ${String(f('over')).padStart(12)} ${f('worst').toFixed(0).padStart(9)} ${P.name === 'after' && MODES[m][1] ? f('look').toFixed(2).padStart(14) : ''}`); }
  if(args.includes('--json')) fs.writeFileSync(opt('--json'), JSON.stringify(res, null, 1));
})();
