#!/usr/bin/env node
// 2026-11-27 (package VFX2): short GIFs of the VFX2 looks (FX.V section 5) on a real fight board at 390 px (a phone). As VFX1's tool: each look is
// started, every Web Animation it made is paused, and the frames step currentTime, so the pictures are exact on a loaded box. A run may start
// several stages, each at its own offset (Rend around: the skull wisp, the burst, the mark). Writes docs/screens/vfx2/<name>.gif (a card or
// lane crop) and, with --png, one mid frame <name>-<w>[-dark].png into /tmp/vfx2-frames for a look.
//   node tools/vfx2_frames_2026_11_27.js [--only gash,web,...] [--width 390] [--dark] [--png]
'use strict';
const fs = require('fs'), path = require('path'), http = require('http'), cp = require('child_process');
const ROOT = path.join(__dirname, '..'), OUT = path.join(ROOT, 'docs/screens/vfx2'), TMP = '/tmp/vfx2-frames';
const args = process.argv.slice(2), opt = (k, d)=>{ const i = args.indexOf(k); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
function pw(){ try{ return require('playwright'); }catch(e){ return require(path.join(cp.execSync('npm root -g').toString().trim(), 'playwright')); } }
const T = fs.readFileSync(path.join(ROOT, 'tests/vfx2-2026-11-27.js'), 'utf8');
const lit = n=>{ const j = T.indexOf('const ' + n + ' = ') + n.length + 9, q = T[j]; let k = j + 1; while(T[k] !== q || T[k - 1] === '\\') k++; return T.slice(j, k + 1); };
const U = k=> `window.__u['${k}']`;
const SKIP = eval(lit('SKIP')), OWN = eval(lit('OWNJS')), BOARD = eval(lit('BOARD'));
const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const TYPES = {'.html':'text/html', '.js':'text/javascript', '.json':'application/json', '.png':'image/png', '.webp':'image/webp', '.svg':'image/svg+xml', '.css':'text/css', '.woff2':'font/woff2'};
const el = k=> `boardCardEl(${U(k)})`;
const T40 = n=> Array.from({length: n}, (_, i)=> i*40);
// the auras on the game's own Detail card (openCardDetail: #cardDetailOverlay .dc-tile), opened before the run starts
const OPEN = `openCardDetail('golden-eagle-diver')`, DETAIL = `document.querySelector('#cardDetailOverlay .dc-tile')`;
// [name, stages [[js, offset ms]], frame times (ms), crop: 'board' | 'card:<k>' | 'detail', persist (all animations, not only new ones), js run first]
const RUNS = [
  ['gash', [[`FX.V.gashBleed(${el('2:-1')})`, 0]], T40(10), 'card:2:-1'],
  ['stampede', [[`FX.V.stampedeRun(${el('1:0')}, hqTileEl('B'))`, 0]], T40(11), 'lane:1:0,2:0,hqB'],
  ['pulverise', [[`FX.V.pulveriseShatter(${el('2:0')})`, 0]], T40(11), 'card:2:0'],
  ['cull', [[`FX.V.cullClaw(${el('2:-1')})`, 0]], T40(10), 'card:2:-1'],
  ['constrict', [[`FX.V.constrictCoil(${el('1:0')})`, 0]], T40(11), 'card:1:0'],
  ['web', [[`FX.V.webNet(${el('1:0')})`, 0]], T40(11), 'card:1:0'],
  ['intimidate', [[`FX.V.intimidateGlare(${el('1:0')}, ${el('2:0')})`, 0]], T40(11), 'lane:1:0,2:0'],
  ['decay', [[`FX.V.decayRot(${el('2:-1')})`, 0]], T40(11), 'card:2:-1'],
  ['exploit', [[`FX.V.exploitLock(${el('2:0')})`, 0]], T40(11), 'card:2:0'],
  ['embrittle', [[`FX.V.embrittleCrack(${el('2:0')})`, 0]], T40(11), 'card:2:0'],
  ['harbinger', [[`FX.V.harbingerFeathers(${el('2:0')})`, 0]], T40(12), 'card:2:0'],
  ['carrion', [[`FX.V.carrionPeck(${el('2:0')})`, 0]], T40(11), 'card:2:0'],
  ['carnage', [[`FX.V.carnageMoon(${el('2:0')})`, 0]], T40(16), 'card:2:0'],
  ['momentum', [[`FX.V.momentumFlame(${el('1:0')}, {stacks:3})`, 0]], T40(11), 'card:1:0'],
  ['brood', [[`FX.V.broodBurst(${el('2:1')})`, 0]], T40(10), 'card:2:1'],
  ['fletcher', [[`FX.V.fletcherGlint(${el('2:0')})`, 0]], T40(10), 'card:2:0'],
  ['herbalist', [[`FX.V.herbLeaves(${el('1:0')})`, 0]], T40(11), 'card:1:0'],
  ['pack-leader', [[`FX.V.packHowlRings(${el('2:0')}, [${el('2:1')}, ${el('2:-1')}])`, 0]], T40(14), 'lane:2:-1,2:0,2:1'],
  ['repair', [[`FX.V.repairSparks(${el('1:1')})`, 0]], T40(11), 'card:1:1'],
  ['trig-play', [[`FX.V.trigLook(${el('1:0')}, 'onSpawn')`, 0]], T40(9), 'card:1:0'],
  ['trig-death', [[`FX.V.trigLook(${el('1:0')}, 'onDeath')`, 0]], T40(9), 'card:1:0'],
  ['trig-attack', [[`FX.V.trigLook(${el('1:0')}, 'onAttack')`, 0]], T40(9), 'card:1:0'],
  ['trig-ready', [[`FX.V.trigLook(${el('1:0')}, 'onReady')`, 0]], T40(9), 'card:1:0'],
  ['shock-chain', [[`FX.V.shockHop(${el('2:-1')}, [${el('2:0')}, ${el('2:1')}])`, 0]], T40(10), 'lane:2:-1,2:0,2:1'],
  ['warning-colours', [[`FX.V.warningPulse(${el('1:0')}, [${el('2:-1')}, ${el('2:0')}])`, 0]], T40(11), 'lane:1:0,2:-1,2:0'],
  ['rend-around', [[`FX.V.trigLook(${el('1:0')}, 'onDeath')`, 0], [`FX.V.rendAround(${el('1:0')})`, 240], [`[${el('1:-1')}, ${el('1:1')}, ${el('2:0')}].map(t=> FX.V.rendMark(t))`, 380]], T40(19), 'lane:1:-1,1:0,1:1,2:0'],
  ['token-tick', [[`(()=>{ const c = matchState.players[2].row.center[0]; c.vulnerable = 2; c.emboldened = 3; lastBoardSig = {1:null, 2:null}; renderBoard(); return FX.V.tokenTick(${el('2:0')}.querySelector('.abadge.vulnerable')); })()`, 0]], T40(10), 'card:2:0'],
  ...['ember', 'frost', 'sparkle'].map(k=> ['aura-' + k, [[`FX.V.skinAura(${DETAIL}, '${k}', {moving:true})`, 0]], [0, 150, 300, 450, 600, 750, 900, 1050, 1200, 1350], 'detail', false, OPEN]),
  ['aura-static', [[`FX.V.skinAura(${DETAIL}, 'sparkle', {})`, 0]], [0, 400], 'detail', false, OPEN],
];
(async()=>{
  const only = (opt('--only', '') || '').split(',').filter(Boolean), w = +opt('--width', '390'), dark = args.includes('--dark'), H = w < 600 ? 844 : 768;
  fs.mkdirSync(OUT, {recursive: true}); fs.mkdirSync(TMP, {recursive: true});
  const srv = http.createServer((q, r)=>{ let p = decodeURIComponent(q.url.split('?')[0]); if(p === '/') p = '/index.html'; const f = path.join(ROOT, p);
    fs.readFile(f, (e, d)=>{ if(e){ r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': TYPES[path.extname(f)] || 'application/octet-stream'}); r.end(d); }); });
  await new Promise(r=> srv.listen(0, r)); const port = srv.address().port, b = await pw().chromium.launch({executablePath: EXE});
  const pg = await b.newPage({viewport: {width: w, height: H}, deviceScaleFactor: 1, colorScheme: dark ? 'dark' : 'light'}); const errs = [];
  pg.on('pageerror', e=> errs.push(String(e))); await pg.addInitScript(SKIP + "localStorage.setItem('bw_sfxVolume','0');");
  await pg.goto(`http://127.0.0.1:${port}/`); await pg.waitForFunction(()=> typeof startConquestMatch === 'function' && window.FX && FX.V, null, {timeout: 120000});
  await pg.evaluate(OWN); await pg.evaluate(BOARD);
  await pg.evaluate(()=> document.querySelectorAll('.coach-tip, .coach-shield, .coach-spotlight, .coach-pointer').forEach(x=> x.remove()));
  for(const [name, stages, times, crop, persist, pre] of RUNS){
    if(only.length && !only.includes(name)) continue;
    if(pre){ await pg.evaluate(pre); await pg.waitForTimeout(900); }
    // start each stage, pause what it started, remember its offset
    await pg.evaluate(async([stages, persist])=>{ window.__fx = []; for(const [js, off] of stages){ const pre = new Set(document.getAnimations()); (0, eval)(js);
        await new Promise(r=> setTimeout(r, 30)); document.getAnimations().filter(a=> persist || !pre.has(a)).forEach(a=>{ if(window.__fx.some(x=> x.a === a)) return; a.pause(); window.__fx.push({a, off}); }); } }, [stages, !!persist]);
    await pg.waitForTimeout(60); if(process.env.VFX2_DEBUG) console.log(name, await pg.evaluate(()=> [window.__fx.length, document.querySelectorAll('.fxv-px').length]));
    const box = await pg.evaluate(c=>{ const pad = (r, kx, ky)=> ({x: Math.max(0, r.left - r.width*kx), y: Math.max(0, r.top - r.height*ky), w: r.width*(1 + 2*kx), h: r.height*(1 + 2*ky)});
      if(c.startsWith('card:')){ const e = boardCardEl(window.__u[c.slice(5)]); return pad(e.getBoundingClientRect(), .5, .4); }
      if(c.startsWith('lane:')){ const rs = c.slice(5).split(',').map(k=> (k === 'hqB' ? hqTileEl('B') : boardCardEl(window.__u[k]))).filter(Boolean).map(e=> e.getBoundingClientRect());
        const x0 = Math.min(...rs.map(r=> r.left)), y0 = Math.min(...rs.map(r=> r.top)), x1 = Math.max(...rs.map(r=> r.right)), y1 = Math.max(...rs.map(r=> r.bottom)), p = rs[0].width*.3;
        return {x: Math.max(0, x0 - p), y: Math.max(0, y0 - p), w: x1 - x0 + 2*p, h: y1 - y0 + 2*p}; }
      if(c === 'detail'){ return pad(document.querySelector('#cardDetailOverlay .dc-tile').getBoundingClientRect(), .12, .1); }
      const r = document.getElementById('battlefieldEl').getBoundingClientRect(); return {x: r.left, y: Math.max(0, r.top), w: r.width, h: Math.min(r.height, innerHeight - Math.max(0, r.top))}; }, crop);
    const clip = {x: Math.round(box.x), y: Math.round(box.y), width: Math.round(Math.min(box.w, w - box.x)), height: Math.round(Math.min(box.h, H - box.y))};
    const files = [];
    for(const t of times){ await pg.evaluate(t=> window.__fx.forEach(({a, off})=>{ try{ a.currentTime = Math.max(0, t - off); }catch(e){} }), t);
      const f = path.join(TMP, `${name}-${w}${dark ? '-dark' : ''}-${t}.png`); await pg.screenshot({path: f, clip}); files.push(f); }
    if(args.includes('--png')) fs.copyFileSync(files[Math.floor(files.length / 2)], path.join(TMP, `${name}-${w}${dark ? '-dark' : ''}.png`));
    if(!dark && times.length > 1){ const gif = path.join(OUT, name + '.gif');
      // a short still before and after, ~110 ms a frame (300 for the slow auras), the palette shared by all frames
      cp.execFileSync('python3', ['-c', `import sys\nfrom PIL import Image\nfs=sys.argv[2:]\nim=[Image.open(f).convert('RGB') for f in fs]\nim=[im[0]]+im+[im[-1]]\nW=max(i.width for i in im)\nim=[i.resize((390, max(1, i.height*390//i.width)), Image.LANCZOS) if i.width>390 else i for i in im]\npal=im[len(im)//2].quantize(colors=64, method=Image.MEDIANCUT)\nq=[i.quantize(palette=pal, dither=Image.NONE) for i in im]\nq[0].save(sys.argv[1], save_all=True, append_images=q[1:], duration=${persist ? 160 : 110}, loop=0, optimize=True, disposal=1)`, gif, ...files]);
      console.log(`${name}: ${files.length} frames, ${Math.round(fs.statSync(gif).size / 1024)} KB`); }
    await pg.evaluate(()=>{ (window.__fx || []).forEach(({a})=>{ try{ a.finish(); }catch(e){ try{ a.cancel(); }catch(e2){} } }); document.querySelectorAll('.fxv:not(style)').forEach(e=> e.remove());
      document.querySelectorAll('.fxv-aura').forEach(e=> e.remove()); const ov = document.getElementById('cardDetailOverlay'); if(ov) ov.hidden = true; const c = matchState.players[2].row.center[0]; if(c){ c.vulnerable = 0; c.emboldened = 0; } });
  }
  if(errs.length) console.log('page errors:', errs.slice(0, 5));
  await pg.close(); await b.close(); srv.close();
})();
