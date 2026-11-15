#!/usr/bin/env node
// 2026-11-16 (package FX11, owner: "new visual effects (e.g. crab claw doesn't look very nice) ... irradiation (whole screen looks abit
// irradiated) as irradiation increases ... implement the effects you have in the game, such as those in the effects lab"). Checks:
//   1. files: bramblewood-fx-h.js is in the build and the Lab, FX_BATCHES has H, SoundKit hands out its primitives, the old crab looks are
//      gone (the arrow float, .crab-pinch, FX.A.crabPinch, the Ironclaw's own claw), no filter / blend mode in FX.H's CSS, the Lab
//      manifest, the inventory, the catalogue, the CHANGELOG, run-all.sh
//   2. in the built page, on a real fight board: each new effect through the game's own paths (renderVfxForEvent / FX.H.onEvent / the
//      deathLook hook) runs with no console error and leaves nothing behind; the five cues are SoundKit methods
//   3. the irradiation tint: its opacity rises with the board's tokens, steps back when they drop, and is gone after the match
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  x', m); } };

// ---- 1. files
const H = rd('bramblewood-fx-h.js'), app = rd('arena_app.js'), tpl = rd('arena_template.html'), A = rd('bramblewood-fx-a.js');
ok(/for _b in "abcdefgh"/.test(rd('assemble_arena.py')) && /for b in 'abcdefgh'/.test(rd('tools/effects-lab/build.py')), 'fx-h is bundled by assemble_arena.py and the Lab build');
ok(/const FX_BATCHES = \['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'\]/.test(app), 'FX_BATCHES calls FX.H');
ok(/prim: \{tone, noise, fnoise, sweep\}/.test(app), 'SoundKit hands its primitives to the effect modules');
ok(!/crabPinch|crab-pinch/.test(app + tpl + A) && !/'🦞 ←'|🦞 Whiff/.test(app), 'the old crab looks are gone (arrow float, .crab-pinch, FX.A.crabPinch)');
ok(/function en2CrabClawHit\(attEl, targetEl, impactMs\)\{[^\n]*\n[^\n]*FX\.H\.crabSnap\(targetEl/.test(app) && !/en2Claw\(c\.x, c\.y, Math\.max\(30/.test(app), 'the Ironclaw Fiddler\'s claw is FX.H.crabSnap');
ok(/\(SoundKit\.geigerSoft \|\| SoundKit\.geiger\)\(ev\.tokens\|\|1\)/.test(app), 'tokens landing play the soft geiger');
const hcss = (H.match(/css\('[^']+', `[\s\S]*?`\);/g) || []).join('\n');
ok(hcss.length > 500 && !/(^|[^-])filter\s*:|mix-blend-mode|backdrop-filter/.test(hcss), 'no filter or blend mode in FX.H\'s CSS');
ok(/prefers-reduced-motion/.test(hcss) && /\.fxh-atmos\.is-calm > i\{animation:none/.test(hcss) && /#appWrap:not\(\.in-match\) \.fxh-atmos/.test(hcss), 'the tint: calm below Medium / reduced motion, hidden off the battle screen');
const man = rd('tools/effects-lab/manifest/h.js'), inv = JSON.parse(rd('docs/effects-inventory-2026-10-15.json')), by = Object.fromEntries(inv.map(e=> [e.id, e]));
const IDS = ['atk-crab-claw', 'fld-irradiation-atmos', 'st-irradiation-apply', 'sk-healing-mend', 'sk-worship-hymn', 'sk-gorge-gulp'];
ok(IDS.every(id=> man.includes(`id:'${id}'`)), 'the Lab manifest registers every FX11 entry');
ok(IDS.every(id=> by[id] && by[id].status === 'live') && by['death-slime-split'].status === 'live' && by['atk-crab-claw'].batch === 'H', 'the inventory: FX11 entries live, the Meiosis split hooked');
ok(!/crabPinch/.test(rd('tools/effects-lab/manifest/a.js')), 'the Lab no longer plays FX.A.crabPinch');
ok(/package FX11/.test(rd('docs/effects-catalogue.md')) && /Package FX11/.test(rd('docs/CHANGELOG.md')) && /tests\/fx11-2026-11-16\.js/.test(rd('tests/run-all.sh')), 'catalogue, CHANGELOG, run-all.sh');

// ---- 2-3. the built page
function pw(){ try{ return require('playwright'); }catch(e){ try{ return require(path.join(require('child_process').execSync('npm root -g').toString().trim(), 'playwright')); }catch(e2){ console.log('  playwright not found'); process.exit(1); } } }
const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const TYPES = {'.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.css': 'text/css', '.woff2': 'font/woff2'};
const SKIP = "localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1'); localStorage.setItem('bramblewood_fx_level','high');"
  + "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying']));";
const OWN = "FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); Object.entries(myDeckCounts).forEach(([id,n])=>{for(let i=0;i<n;i++) unlockCardForPlayer(id,'test');});"
  + "saveEnergyState({current:60, lastRegenAt:Date.now()}); try{ refreshEnergyHud(); }catch(e){} window.showCoachTip = ()=>{}; window.maybeShowCoachTip = ()=>{};";
// a fight whose board is exactly these units, the CPU kept from acting (as tests/e2e/fx10_2026_11_13.py)
const BOARD = `(async()=>{ adminModeEnabled = true; switchTab('play'); startConquestMatch('m11', '20-7'); await new Promise(r=> setTimeout(r, 2600));
  const m = matchState, e = m.engine; m.resolving = true; const uids = {};
  [1, 2].forEach(pid=>{ const pl = m.players[pid]; pl.row.left = []; pl.row.center = []; pl.row.right = []; });
  const put = (pid, list)=> list.forEach(([id, slot])=>{ const c = e.makeBoardCard(id); c.wait = 0; c.hp = c.maxHp = 9; c.slot = slot;
    const pl = m.players[pid]; (slot === 0 ? pl.row.center : slot < 0 ? pl.row.left : pl.row.right).push(c); uids[pid + ':' + slot] = c.uid; });
  put(1, [['abbey-goose', -1], ['fiddler-crab-swarm', 0], ['planarian-splitter', 1]]); put(2, [['hymn-wren', -1], ['beaver-lumberjack', 0], ['glowing-gecko', 1]]);
  [1, 2].forEach(pid=>{ const pl = m.players[pid]; pl.row.left.sort((a, b)=> b.slot - a.slot); pl.row.right.sort((a, b)=> a.slot - b.slot); });
  m.replayCards = null; renderMatchUI(); await new Promise(r=> setTimeout(r, 1200)); window.__u = uids; return uids; })()`;
const U = k=> `window.__u['${k}']`;
const RUNS = [
  ['crab (a unit beside it)', `renderVfxForEvent({type:'crabClaw', side:'A', attUid:${U('1:0')}, attDefId:'fiddler-crab-swarm', dir:'left', targetUid:${U('2:-1')}}); setTimeout(()=> renderVfxForEvent({type:'hit', side:'A', attUid:${U('1:0')}, attDefId:'fiddler-crab-swarm', targetSide:'B', targetUid:${U('2:-1')}, targetDefId:'hymn-wren', dmg:2}), 150)`, '.fxh-claw'],
  ['crab (the bramble)', `renderVfxForEvent({type:'crabClaw', side:'A', attUid:${U('1:0')}, attDefId:'fiddler-crab-swarm', dir:'castle'}); setTimeout(()=> renderVfxForEvent({type:'hitHQ', side:'A', attUid:${U('1:0')}, attDefId:'fiddler-crab-swarm', targetSide:'B', dmg:2}), 150)`, '.fxh-leaf'],
  ['the Ironclaw Fiddler\'s claw', `en2CrabClawHit(boardCardEl(${U('1:0')}), boardCardEl(${U('2:0')}), 300)`, '.fxh-claw'],
  ['Healing N', `renderVfxForEvent({type:'heal', side:'A', attDefId:'abbey-goose', attUid:${U('1:-1')}, targetUid:${U('1:1')}, targetDefId:'planarian-splitter', amount:2, cause:'healing'})`, '.fxh-orb'],
  ['Worship', `renderVfxForEvent({type:'grace', side:'B', defId:'beaver-lumberjack', uid:${U('2:0')}, amount:1})`, '.fxh-halo'],
  ['Gorge', `FX.H.onEvent({type:'parasiteDrain', side:'B', defId:'gangrenous-leech', uid:999, targetUid:${U('1:0')}, targetDefId:'fiddler-crab-swarm', dmg:2, gorge:true, hp:3}, fxEnv())`, '.fxh-drop'],
  ['Meiosis death', `(()=>{ const info = {uid:${U('1:1')}, handled:false}; fxHook('deathLook', boardCardEl(${U('1:1')}), info); window.__mh = info.handled; })()`, '.fxc-slime'],
];
(async()=>{
  if(!fs.existsSync(path.join(ROOT, 'index.html'))){ console.log('  no index.html: build first'); process.exit(1); }
  const http = require('http');
  const srv = await new Promise(res=>{ const s = http.createServer((q, r)=>{ let p = decodeURIComponent(q.url.split('?')[0]); if(p === '/') p = '/index.html'; const f = path.join(ROOT, p); if(!f.startsWith(ROOT)){ r.writeHead(403); r.end(); return; }
    fs.readFile(f, (e, d)=>{ if(e){ r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': TYPES[path.extname(f)] || 'application/octet-stream'}); r.end(d); }); }); s.listen(0, '127.0.0.1', ()=> res(s)); });
  const b = await pw().chromium.launch({executablePath: fs.existsSync(EXE) ? EXE : undefined});
  const pg = await b.newPage({viewport: {width: 390, height: 844}}); const errs = [];
  pg.on('pageerror', e=> errs.push(String(e))); pg.on('console', m=>{ if(m.type() === 'error' && !/Failed to load resource|ERR_|net::/.test(m.text())) errs.push('console: ' + m.text()); });
  await pg.route(/^https?:\/\/(?!127\.0\.0\.1)/, r=> r.abort()); // offline: no Supabase or font calls
  await pg.addInitScript(SKIP);
  await pg.goto('http://127.0.0.1:' + srv.address().port + '/index.html', {waitUntil: 'domcontentloaded', timeout: 180000});
  await pg.waitForFunction("typeof startConquestMatch === 'function'", null, {timeout: 180000}); await pg.waitForTimeout(1300);
  await pg.evaluate('(()=>{ ' + OWN + ' })()'); await pg.evaluate(BOARD);
  ok(await pg.evaluate(()=> !!(window.FX && FX.H && FX.H.crabSnap && FX.H.irrAtmos && FX.H.onEvent)), 'the built page has FX.H');
  ok(await pg.evaluate(()=> ['crabClack', 'geigerSoft', 'mendChime', 'hymnBell', 'gorgeGulp'].every(k=> typeof SoundKit[k] === 'function')), 'the five FX11 cues are SoundKit methods');
  for(const [name, js, sel] of RUNS){
    const e0 = errs.length;
    const seen = await pg.evaluate(async ([js, sel])=>{ let max = 0; const iv = setInterval(()=>{ max = Math.max(max, document.querySelectorAll(sel).length); }, 25);
      (0, eval)(js); await new Promise(r=> setTimeout(r, 1900)); clearInterval(iv); return max; }, [js, sel]);
    const left = await pg.evaluate(()=> document.querySelectorAll('.fxh:not(.fxh-atmos), .fxc-slime').length);
    ok(seen > 0, `${name}: it draws (${sel})`); ok(left === 0, `${name}: nothing left behind (${left})`); ok(errs.length === e0, `${name}: no console error ${errs.slice(e0, e0 + 2).join(' | ')}`);
  }
  ok(await pg.evaluate(()=> window.__mh === true), 'a Meiosis unit\'s death takes the slime split (deathLook handled)');
  // the tint follows the board's tokens
  const setTok = tot=> pg.evaluate(async n=>{ const m = matchState, cs = []; [1, 2].forEach(pid=> ['left', 'center', 'right'].forEach(s=> (m.players[pid].row[s] || []).forEach(c=> cs.push(c))));
    cs.forEach(c=> c.irradiation = 0); let k = 0; while(n > 0 && cs.length){ const c = cs[k % cs.length], d = Math.min(n, 3); c.irradiation += d; n -= d; k++; }
    cs.forEach(c=> updateCardStatusDisplay(c.uid)); await new Promise(r=> setTimeout(r, 1300));
    const e = document.querySelector('.fxh-atmos'); return e ? {op: +getComputedStyle(e).opacity, tok: +e.dataset.tokens, step: +e.dataset.step} : {op: 0, tok: 0, step: 0}; }, tot);
  const steps = []; for(const t of [1, 4, 8, 16]) steps.push(await setTok(t));
  ok(steps.every((s, i)=> s.tok === [1, 4, 8, 16][i]), 'the tint counts the board\'s tokens (a bare ☢️ is 1) ' + JSON.stringify(steps.map(s=> s.tok)));
  ok(steps.every((s, i)=> s.op > 0 && (i === 0 || s.op > steps[i - 1].op)) && steps[3].op <= .62, 'its opacity rises with the tokens, capped at 0.62 ' + JSON.stringify(steps.map(s=> s.op)));
  const down = await setTok(3); ok(down.op > 0 && down.op < steps[3].op, 'it steps back down when tokens wear off (' + down.op + ')');
  const one = await pg.evaluate(()=> document.querySelectorAll('.fxh-atmos').length); ok(one === 1, 'one layer, never one per card (' + one + ')');
  const css = await pg.evaluate(()=>{ const e = document.querySelector('.fxh-atmos'), s = getComputedStyle(e); return {pe: s.pointerEvents, pos: s.position, blend: s.mixBlendMode, filter: s.filter}; });
  ok(css.pe === 'none' && css.pos === 'fixed' && css.blend === 'normal' && css.filter === 'none', 'fixed, click-through, no blend or filter ' + JSON.stringify(css));
  await pg.evaluate(async ()=>{ matchState.over = true; renderMatchUI(); await new Promise(r=> setTimeout(r, 1600)); });
  ok(await pg.evaluate(()=> document.querySelectorAll('.fxh-atmos').length === 0), 'the tint is gone after the match');
  ok(errs.length === 0, 'no page errors ' + errs.slice(0, 3).join(' | '));
  await b.close(); srv.close();
  console.log(fail ? 'FAILED ' + fail + ' of ' + n : 'fx11: ' + n + ' checks passed'); process.exit(fail ? 1 : 0);
})().catch(e=>{ console.log('  x crashed', e && e.message); process.exit(1); });
