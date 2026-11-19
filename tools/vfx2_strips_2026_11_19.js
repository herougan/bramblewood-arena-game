#!/usr/bin/env node
// Package VFX2 (2026-11-19): frame strips of the battle effects, fired as the engine sends them through the game's renderVfxForEvent in the seeded
// fight of tests/fx10-perf-2026-11-13.js (map 5-3, seed 777, a card played). One PNG per effect in docs/release/vfx2/ (or --out), frames every --step ms.
//   node tools/vfx2_strips_2026_11_19.js [--page index.html] [--out docs/release/vfx2] [--only shieldBreak,stun] [--step 100] [--frames 12] [--slow 10] [--width 1366] [--speed 1]
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const args = process.argv.slice(2), opt = (k, d)=>{ const i = args.indexOf(k); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
function pw(){ try{ return require('playwright'); }catch(e){ return require(path.join(require('child_process').execSync('npm root -g').toString().trim(), 'playwright')); } }
const src = fs.readFileSync(path.join(ROOT, 'tests/perf2-2026-11-11.js'), 'utf8');
const lit = n=>{ const j = src.indexOf('const ' + n + ' = ') + n.length + 9, q = src[j]; let k = j + 1; while(src[k] !== q || src[k - 1] === '\\') k++; return src.slice(j, k + 1); };
const SKIP = eval(lit('SKIP')), OWN = eval(lit('OWN'));
const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const TYPES = {'.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.css': 'text/css', '.woff2': 'font/woff2'};
function serve(page){ const http = require('http'); return new Promise(res=>{ const s = http.createServer((q, r)=>{ let p = decodeURIComponent(q.url.split('?')[0]); if(p === '/') p = '/index.html';
  const f = p === '/index.html' ? page : path.join(ROOT, p); fs.readFile(f, (e, d)=>{ if(e){ r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': TYPES[path.extname(f)] || 'application/octet-stream'}); r.end(d); }); }); s.listen(0, '127.0.0.1', ()=> res(s)); }); }
// in scope: eu / mu (an enemy / my board card's uid), ed / md (their defIds); each a list of [delay ms, event] fired in order
const EFFECTS = {
  shieldSoak: `[[0, {type:'shieldSoak', side:'B', uid:eu, defId:ed, soaked:2, left:1}]]`,
  shieldBreak: `[[0, {type:'shieldSoak', side:'B', uid:eu, defId:ed, soaked:2, left:0}]]`,
  poison: `[[0, {type:'statusFx', kind:'poison', side:'A', attUid:mu, attDefId:md, targetSide:'B', targetUid:eu, targetDefId:ed, amount:2, total:2}]]`,
  bleed: `[[0, {type:'statusFx', kind:'bleed', side:'A', attUid:mu, attDefId:md, targetSide:'B', targetUid:eu, targetDefId:ed, amount:2, total:2}]]`,
  stun: `[[0, {type:'stunPlayer', side:'A', attUid:mu, attDefId:md, turns:1}]]`,
  stunSkip: `[[0, 'js:fxHook("turnSkipped", "A")']]`,
  stunSkipEnemy: `[[0, 'js:fxHook("turnSkipped", "B")']]`,
  // the engine has moved the unit to the caster's row (live rows, as when Puppeteer Imp is played) before the event plays
  mindControl: `[[0, 'js:(()=>{ const P = matchState.players, c = ["left","center","right"].map(l=> P[2].row[l].find(x=> String(x.uid) === String(__vfx2Ids.eu))).find(Boolean); ["left","center","right"].forEach(l=>{ P[2].row[l] = P[2].row[l].filter(x=> x !== c); }); c.slot = 1; P[1].row.right.push(c); })()'],
    [0, {type:'mindControl', side:'A', attUid:mu, attDefId:md, targetUid:eu, targetDefId:ed, slot:1}]]`,
  exile: `[[0, {type:'death', side:'B', uid:eu, defId:ed, exiled:true}]]`,
  explode: `[[0, {type:'explode', side:'B', uid:eu, defId:ed, dmg:3, targetUid:mu, targetDefId:md}]]`,
  ranged: `[[0, {type:'hit', ranged:true, side:'A', attUid:mu, attDefId:md, targetSide:'B', targetUid:eu, targetDefId:ed, dmg:2, dmgType:'physical'}]]`,
  magic: `[[0, {type:'hit', ranged:true, side:'A', attUid:mu, attDefId:md, targetSide:'B', targetUid:eu, targetDefId:ed, dmg:2, dmgType:'magic'}]]`,
};
async function main(){
  const page = path.resolve(ROOT, opt('--page', 'index.html')), out = path.resolve(ROOT, opt('--out', 'docs/release/vfx2'));
  const only = opt('--only', '') ? opt('--only', '').split(',') : Object.keys(EFFECTS), step = +opt('--step', 100), frames = +opt('--frames', 12), W = +opt('--width', 1366);
  fs.mkdirSync(out, {recursive: true});
  const srv = await serve(page), url = 'http://127.0.0.1:' + srv.address().port + '/';
  const b = await pw().chromium.launch({executablePath: EXE, args: ['--autoplay-policy=no-user-gesture-required']});
  const errs = [];
  for(const name of only){
    const ctx = await b.newContext({viewport: {width: W, height: W < 600 ? 844 : 768}}), pg = await ctx.newPage(); pg.on('pageerror', e=> errs.push(name + ': ' + e));
    await pg.addInitScript(SKIP); await pg.goto(url); await pg.waitForFunction("typeof startConquestMatch === 'function'", null, {timeout: 180000}); await pg.waitForTimeout(1200); await pg.evaluate(OWN);
    await pg.evaluate(`(async()=>{ adminModeEnabled = true; forcedNextSeed = 777; switchTab('play'); startConquestMatch('mw', '5-3', {skipEnergyCost:true, noOpener:true}); await new Promise(r=> setTimeout(r, 2600)); try{ skipTriggerLesson(); }catch(e){} const h = document.getElementById('toastHost'); if(h) h.remove(); window.showToast = ()=>{};
      const m = matchState, pl = m.players[1], c = pl.hand.find(h=> m.engine.canPlay(pl, h.defId, h.uid)); if(c) await playCardByUid(c.uid, 'left'); await new Promise(r=> setTimeout(r, 2500)); matchState.speedMult = ${+opt('--speed', 1)}; })()`);
    // the frame: the two cards and the space around them (Player Stun: the whole window, for the castle and the hand)
    const full = /^stun/.test(name);
    const bf = await pg.evaluate(`(()=>{ const E = document.querySelector('#rowEnemy .board-card[data-uid]'), M = document.querySelector('#rowMine .board-card[data-uid]');
      if(${full} || !E || !M) return {x:0, y:0, width:innerWidth, height:innerHeight}; const a = E.getBoundingClientRect(), b = M.getBoundingClientRect();
      const x0 = Math.max(0, Math.min(a.left, b.left) - 230), y0 = Math.max(0, Math.min(a.top, b.top) - 110), x1 = Math.min(innerWidth, Math.max(a.right, b.right) + 230), y1 = Math.min(innerHeight, Math.max(a.bottom, b.bottom) + 110);
      return {x:x0, y:y0, width:x1 - x0, height:y1 - y0}; })()`);
    await pg.evaluate(`(()=>{ const E = [...document.querySelectorAll('#rowEnemy .board-card[data-uid]')], M = document.querySelector('#rowMine .board-card[data-uid]'), rc = matchState.replayCards || {};
      const def = u=>{ const c = rc[u] || (typeof currentCardByUid === 'function' ? currentCardByUid(u) : null); return c && c.defId; };
      const eu = E[0] && E[0].dataset.uid, mu = M && M.dataset.uid, ed = def(eu), md = def(mu); window.__vfx2 = ${EFFECTS[name]}; window.__vfx2Ids = {eu, mu, ed, md}; })()`);
    // slow motion (x SLOW): GSAP's global timeline, CSS / WAAPI animations (CDP) and the page's setTimeout, so a ~1 s screenshot is ~1/SLOW s of effect time
    const SLOW = +opt('--slow', 10), cdp = await ctx.newCDPSession(pg); await cdp.send('Animation.enable'); await cdp.send('Animation.setPlaybackRate', {playbackRate: 1/SLOW});
    const t0 = await pg.evaluate(`(()=>{ gsap.globalTimeline.timeScale(${1/SLOW}); const st = window.setTimeout; window.setTimeout = (f, ms, ...a)=> st(f, (ms || 0)*${SLOW}, ...a);
      const t = Date.now(); (async()=>{ for(const [ms, ev] of window.__vfx2){ if(ms) await new Promise(r=> setTimeout(r, ms)); if(ev === 'renderBoard') renderBoard({collapseLandingUids:[]}); else if(typeof ev === 'string' && ev.startsWith('js:')) (0, eval)(ev.slice(3)); else renderVfxForEvent(ev); } })().catch(e=> console.error(e)); return t; })()`);
    const shots = [];
    for(let k = 0; k < frames; k++){ const due = t0 + k*step*SLOW, w = due - Date.now(); if(w > 0) await pg.waitForTimeout(w);
      const t = Date.now(); const png = await pg.screenshot({clip: bf}); shots.push({t: Math.round((t - t0)/SLOW), png}); }
    await ctx.close();
    fs.writeFileSync(path.join(out, '.frames-' + name + '.json'), JSON.stringify(shots.map((s, i)=>{ const f = path.join(out, `.${name}-${i}.png`); fs.writeFileSync(f, s.png); return {t: s.t, f}; })));
  }
  await b.close(); srv.close();
  // a strip per effect: frames side by side, each labelled with its time
  require('child_process').execFileSync('python3', ['-c', `
import json, sys, os, glob
from PIL import Image, ImageDraw
out = sys.argv[1]
for j in glob.glob(os.path.join(out, '.frames-*.json')):
    name = os.path.basename(j)[8:-5]; fr = json.load(open(j)); ims = [Image.open(f['f']).convert('RGB') for f in fr]
    w = min(420, ims[0].width); ims = [im.resize((w, int(im.height*w/im.width))) for im in ims]; cols = 4; rows = (len(ims) + cols - 1)//cols; h = ims[0].height
    sheet = Image.new('RGB', (w*cols, (h + 18)*rows), (20, 20, 24)); d = ImageDraw.Draw(sheet)
    for i, (im, f) in enumerate(zip(ims, fr)):
        x, y = (i % cols)*w, (i//cols)*(h + 18); sheet.paste(im, (x, y + 18)); d.text((x + 4, y + 3), name + '  ' + str(f['t']) + ' ms', fill=(255, 230, 160))
    sheet.save(os.path.join(out, name + '.png'))
    for f in fr: os.remove(f['f'])
    os.remove(j)
`, out]);
  if(errs.length){ console.log('errors:\n' + errs.join('\n')); process.exitCode = 1; }
  console.log('strips in ' + path.relative(ROOT, out) + ': ' + only.join(', '));
}
main().catch(e=>{ console.error(e); process.exit(1); });
