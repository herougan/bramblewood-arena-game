#!/usr/bin/env node
// 2026-11-27 (package VFX1): mid-effect frames and short GIFs of the VFX1 looks (FX.V skills, field layers, bosses, RITUAL1's rite) on a real
// fight board. Each effect is started, every Web Animation is paused, and the frames step its currentTime, so the pictures are exact even on
// a loaded headless box. Writes docs/screens/vfx1/<name>.gif (a few frames, cropped) and <name>-<w>[-dark].png (one mid frame).
//   node tools/vfx1_frames_2026_11_27.js [--only swift,tide,...] [--widths 390,1366] [--dark] [--no-gif]
'use strict';
const fs = require('fs'), path = require('path'), http = require('http'), cp = require('child_process');
const ROOT = path.join(__dirname, '..'), OUT = path.join(ROOT, 'docs/screens/vfx1'), TMP = '/tmp/vfx1-frames';
const args = process.argv.slice(2), opt = (k, d)=>{ const i = args.indexOf(k); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
function pw(){ try{ return require('playwright'); }catch(e){ return require(path.join(cp.execSync('npm root -g').toString().trim(), 'playwright')); } }
const src = fs.readFileSync(path.join(ROOT, 'tests/fx14-2026-11-17.js'), 'utf8');
const lit = n=>{ const j = src.indexOf('const ' + n + ' = ') + n.length + 9, q = src[j]; let k = j + 1; while(src[k] !== q || src[k - 1] === '\\') k++; return src.slice(j, k + 1); };
const SKIP = eval(lit('SKIP')), OWN = eval(lit('OWN'));
const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const TYPES = {'.html':'text/html', '.js':'text/javascript', '.json':'application/json', '.png':'image/png', '.webp':'image/webp', '.svg':'image/svg+xml', '.css':'text/css', '.woff2':'font/woff2'};
// the board: mine Pike Lancer (Tide), Jackrabbit Sprinter (Swift), The Sixfold (Ritual); theirs Pangolin Roller (Sturdy), Acacia Giraffe (Mighty), Dormouse (Foraging)
const BOARD = `(async()=>{ adminModeEnabled = true; switchTab('play'); startConquestMatch('m11', '20-7'); await new Promise(r=> setTimeout(r, 2600));
  const vs = document.querySelector('.vs-screen'); if(vs) vs.click(); await new Promise(r=> setTimeout(r, 500));
  const m = matchState, e = m.engine; m.resolving = true; const uids = {};
  [1, 2].forEach(pid=>{ const pl = m.players[pid]; pl.row.left = []; pl.row.center = []; pl.row.right = []; });
  const put = (pid, list)=> list.forEach(([id, slot])=>{ const c = e.makeBoardCard(id); c.wait = 0; c.hp = c.maxHp = 9; c.slot = slot;
    if(id === 'the-sixfold'){ c.ritualBase = {p: 0, d: 0, c: 0}; c.ritualDone = false; }
    const pl = m.players[pid]; (slot === 0 ? pl.row.center : slot < 0 ? pl.row.left : pl.row.right).push(c); uids[pid + ':' + slot] = c.uid; });
  put(1, [['pike-lancer', -1], ['jackrabbit-sprinter', 0], ['the-sixfold', 1]]); put(2, [['pangolin-roller', -1], ['acacia-giraffe', 0], ['dormouse', 1]]);
  window.showCoachTip = ()=>{}; m.players[1].drawnTotal = 6; m.players[1].castleDealt = 2;
  m.replayCards = null; renderMatchUI(); await new Promise(r=> setTimeout(r, 1200));
  document.querySelectorAll('.coach-tip, .coach-shield, .coach-spotlight, .coach-pointer').forEach(x=> x.remove()); window.__u = uids; return uids; })()`;
const el = k=> `boardCardEl(window.__u['${k}'])`;
// [name, js that starts it, frame times (ms), crop: 'board' | 'card:<k>' | 'castle']
const RUNS = [
  ['swift', `FX.V.swiftDash(${el('1:0')}, {up:true})`, [0, 60, 120, 180, 240, 300], 'card:1:0'],
  ['tide', `FX.V.tideCrest(${el('1:-1')}, {kind:'flow'})`, [0, 80, 140, 200, 260, 340, 400], 'card:1:-1'],
  ['tide-ebb', `FX.V.tideCrest(${el('1:-1')}, {kind:'ebb'})`, [150], 'card:1:-1'],
  ['hatchling', `FX.V.hatchPop(${el('1:0')})`, [0, 60, 120, 180, 260, 340], 'card:1:0'],
  ['reach', `FX.V.reachArc(${el('1:0')}, ${el('2:-1')})`, [0, 80, 160, 220, 300, 380], 'board'],
  ['mighty', `FX.V.mightySlam(${el('2:0')})`, [0, 60, 120, 180, 260, 340], 'card:2:0'],
  ['berry', `FX.V.berryPop(${el('2:1')}, {total:2})`, [0, 80, 140, 220, 300], 'card:2:1'],
  ['berry-eat', `FX.V.berryEat(${el('2:1')}, ${el('2:0')})`, [0, 100, 200, 300, 420, 520], 'board'],
  ['sturdy', `FX.V.sturdyBrace(${el('2:-1')})`, [0, 70, 140, 200, 280, 360], 'card:2:-1'],
  ['twin', `FX.V.twinSlash(${el('1:0')})`, [0, 60, 120, 180, 240, 320], 'card:1:0'],
  ['cage', `FX.V.cageClose(${el('2:0')})`, [0, 100, 200, 280, 380, 500, 640], 'card:2:0'],
  ['skeleton', `FX.V.skeletonRise(hqTileEl('B'))`, [0, 200, 400, 600, 800, 950, 1100, 1300], 'castle'],
  ['mage', `FX.V.mageCast(hqTileEl('B'))`, [0, 200, 400, 600, 800, 950, 1050, 1200], 'castle'],
  ['sea', `FX.V.seaRise()`, [0, 250, 450, 650, 900, 1150, 1400, 1650], 'board'],
  ...['rain', 'storm', 'heat', 'frost', 'sand', 'ash'].map(k=> ['field-' + k, `FX.V.fieldAmbient(document.getElementById('battlefieldEl'), '${k}')`, [0, 300, 600], 'board', true]),
  // RITUAL1: the rite as The Sixfold arrives (veil, then three candles one by one over 1.5 s; drawn 6/6 is lit), then the darkness lifts
  ['ritual', `(()=>{ RT1.seen.clear(); RT1.lit.clear(); lastBoardSig = {1:null, 2:null}; renderBoard(); })()`, [0, 200, 500, 900, 1300, 1700, 1900], 'card:1:1'],
  ['ritual-lift', `rt1Lift(${el('1:1')}, 3)`, [0, 150, 300, 450], 'card:1:1'],
];
(async()=>{
  const only = (opt('--only', '') || '').split(',').filter(Boolean), widths = opt('--widths', '390,1366').split(',').map(Number), dark = args.includes('--dark');
  fs.mkdirSync(OUT, {recursive: true}); fs.mkdirSync(TMP, {recursive: true});
  const srv = http.createServer((q, r)=>{ let p = decodeURIComponent(q.url.split('?')[0]); if(p === '/') p = '/index.html'; const f = path.join(ROOT, p);
    fs.readFile(f, (e, d)=>{ if(e){ r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': TYPES[path.extname(f)] || 'application/octet-stream'}); r.end(d); }); });
  await new Promise(r=> srv.listen(0, r)); const port = srv.address().port, b = await pw().chromium.launch({executablePath: EXE});
  for(const w of widths){
    const pg = await b.newPage({viewport: {width: w, height: w < 600 ? 844 : 768}, deviceScaleFactor: 1, colorScheme: dark ? 'dark' : 'light'}); const errs = [];
    pg.on('pageerror', e=> errs.push(String(e))); await pg.addInitScript(SKIP);
    await pg.goto(`http://127.0.0.1:${port}/`); await pg.waitForFunction(()=> typeof startConquestMatch === 'function' && window.FX && FX.V, null, {timeout: 120000});
    await pg.evaluate(OWN); await pg.evaluate(BOARD);
    for(const [name, js, times, crop, persist] of RUNS){
      if(only.length && !only.includes(name)) continue;
      // start it, pause what it started, step the frames
      await pg.evaluate(`(()=>{ window.__pre = new Set(document.getAnimations()); ${js}; window.__fx = document.getAnimations().filter(a=> !window.__pre.has(a) || ${persist ? 'true' : 'false'}); window.__fx.forEach(a=> a.pause()); })()`);
      await pg.waitForTimeout(60);
      const box = await pg.evaluate(c=>{ const pad = (r, k)=> ({x: Math.max(0, r.left - r.width*k), y: Math.max(0, r.top - r.height*k), w: r.width*(1 + 2*k), h: r.height*(1 + 2*k)});
        if(c.startsWith('card:')){ const e = boardCardEl(window.__u[c.slice(5)]); return pad(e.getBoundingClientRect(), .45); }
        if(c === 'castle'){ const e = hqTileEl('B') || document.getElementById('battlefieldEl'); return pad(e.getBoundingClientRect(), .9); }
        const r = document.getElementById('battlefieldEl').getBoundingClientRect(); return {x: r.left, y: Math.max(0, r.top), w: r.width, h: Math.min(r.height, innerHeight - Math.max(0, r.top))}; }, crop);
      const clip = {x: Math.round(box.x), y: Math.round(box.y), width: Math.round(Math.min(box.w, w - box.x)), height: Math.round(Math.min(box.h, (w < 600 ? 844 : 768) - box.y))};
      const files = [];
      for(const t of times){ await pg.evaluate(t=> window.__fx.forEach(a=>{ try{ a.currentTime = t; }catch(e){} }), t);
        const f = path.join(TMP, `${name}-${w}${dark ? '-dark' : ''}-${t}.png`); await pg.screenshot({path: f, clip}); files.push(f); }
      const mid = files[Math.floor(files.length / 2)]; fs.copyFileSync(mid, path.join(OUT, `${name}-${w}${dark ? '-dark' : ''}.png`));
      if(!args.includes('--no-gif') && w === Math.max(...widths) && !dark && times.length > 2)
        cp.execFileSync('python3', ['-c', `import sys\nfrom PIL import Image\nfs=sys.argv[2:]\nim=[Image.open(f).convert('RGB') for f in fs]\nim=[i.resize((max(1,i.width*320//max(i.width,i.height)), max(1,i.height*320//max(i.width,i.height))), Image.NEAREST) if max(i.width,i.height)>320 else i for i in im]\nim[0].save(sys.argv[1], save_all=True, append_images=im[1:], duration=${persist ? 300 : 110}, loop=0, optimize=True)`, path.join(OUT, name + '.gif'), ...files]);
      await pg.evaluate(()=>{ (window.__fx || []).forEach(a=>{ try{ a.finish(); }catch(e){ try{ a.cancel(); }catch(e2){} } }); document.querySelectorAll('.fxv:not(style), .rt1-lift').forEach(e=> e.remove()); try{ FX.V.fieldAmbient(document.getElementById('battlefieldEl'), null); }catch(e){} });
      console.log(`${name} ${w}${dark ? ' dark' : ''}: ${files.length} frames`);
    }
    if(errs.length) console.log('page errors:', errs.slice(0, 5));
    await pg.close();
  }
  await b.close(); srv.close();
})();
