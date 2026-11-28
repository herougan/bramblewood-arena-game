#!/usr/bin/env node
// 2026-11-28 (package UIPOLISH1, owner's UI polish list 12:45 to 13:38): glossary (one window), the Environment card hover and its pip, clean floating labels (no plates, no
// strokes), the Lab's top row, the private room window (code rules, eye, Host / Join, taken / not found), the multiplayer dungeon on the Dungeons & Raids page, the exit onto the
// Conquest map, the round-end settle + 1.5 s pause (scaled with speed, before the Next round banner), the skull / jungle zoom, the magnifier's rows.
'use strict';
const fs = require('fs'), path = require('path'), http = require('http');
const ROOT = path.join(__dirname, '..');
const rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  x', m); } };

// ---- 1. files
const app = rd('arena_app.js'), tpl = rd('arena_template.html'), tx = rd('bramblewood-texts.js');
ok(/function kwPopShow\(w\)/.test(app) && /data-kw=/.test(app) && /#kwPop\{/.test(tpl), 'the one glossary window (#kwPop) and the data-kw marks');
ok(/const FIELD_PIP = /.test(app) && /\.env-pip\{/.test(tpl), 'the context pip');
ok(/const ROUND_END_PAUSE_MS = 1500/.test(app), 'the round-end pause is 1.5 s');
{ const a = app.indexOf('await roundEndSettle(m)'), b = app.indexOf('showNextTurnBanner(), waitReplayPromise'); ok(a > 0 && b > a, 'the settle and pause come before the Next round banner'); }
ok(/function gdMapId\(/.test(app) && /conquestSelectedMap = mid;[^\n]*playSubTab = 'conquest'/.test(app), 'leaving a finished dungeon lands on its Conquest map');
ok(!/b\('coop'/.test(app) && /dungeonsAdminView\(\) \|\| gdPlayerOpen\(\)/.test(app), 'no Multiplayer pane in the Arena; the dungeon page opens for players');
ok(/id="sbxClearBtn"[^`]*id="sbxResolveBtn"/.test(app.slice(app.indexOf('function sandboxPanelHTML'), app.indexOf('function wireSandboxPanel'))) && !/class="sandbox-actions"/.test(app.slice(app.indexOf('function sandboxPanelHTML'), app.indexOf('function wireSandboxPanel'))), 'Clear and Resolve board are in the Lab\'s top row');
ok(/const has2 = e=> !!\(e && e\.querySelector/.test(app) && /top = re\.top - \(has2\(g1\)/.test(app), 'the magnifier shows row 1 vs row 1, a half row of row 2 only where one stands');
ok(/top0: \(\(cardEl\.closest/.test(app) && /o\.top0 != null/.test(app), 'resource gains float from higher up the card');
ok(/uip1Riser\(ev\.defId\) \? 'rise' : 'hand'/.test(app) && /uip1RiseSound/.test(app), 'the enemy\'s risers rise from the ground with the library\'s cues');
ok(['ui.up1-play', 'ui.up1-private', 'ui.up1-code-taken', 'ui.up1-code-bad', 'ui.up1-gloss-lumber'].every(k=> tx.indexOf('"' + k + '"') > 0) && fs.readdirSync(path.join(ROOT, 'lang')).filter(f=> /\.json$/.test(f)).every(f=> /Pick another|Choisissez|Wähle|Elige|Scegline|Escolha|Pumili|வேறொன்றை|Pilih yang|请换|請換|別のコード|다른 코드/.test(rd('lang/' + f)) || f === 'cards' ), 'texts in the packs');
ok(/uipolish1-2026-11-28\.js/.test(rd('tests/run-all.sh')) && /UIPOLISH1/.test(rd('docs/CHANGELOG.md').slice(0, 6000)), 'run-all.sh and the CHANGELOG');

// ---- 2. the built page
function pw(){ try{ return require('playwright'); }catch(e){ try{ return require(path.join(require('child_process').execSync('npm root -g').toString().trim(), 'playwright')); }catch(e2){ return require('/opt/npm-tools/node_modules/playwright'); } } }
const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const TYPES = {'.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.css': 'text/css', '.woff2': 'font/woff2'};
const SKIP = "localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1'); localStorage.setItem('bramblewood_fx_level','high');"
  + "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying','castle-shield']));";
const OWN = "FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); Object.entries(myDeckCounts).forEach(([id,n])=>{for(let i=0;i<n;i++) unlockCardForPlayer(id,'test');});"
  + "saveEnergyState({current:60, lastRegenAt:Date.now()}); try{ refreshEnergyHud(); }catch(e){} window.showCoachTip = ()=>{}; window.maybeShowCoachTip = ()=>{}; adminModeEnabled = true;";
(async()=>{
  const srv = http.createServer((q, r)=>{ let p = decodeURIComponent(q.url.split('?')[0]); if(p === '/') p = '/index.html'; const f = path.join(ROOT, p);
    fs.readFile(f, (e, d)=>{ if(e){ r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': TYPES[path.extname(f)] || 'application/octet-stream'}); r.end(d); }); });
  await new Promise(r=> srv.listen(0, r)); const port = srv.address().port;
  const b = await pw().chromium.launch({executablePath: EXE}); const errs = [];
  try{
    const pg = await b.newPage({viewport: {width: 1366, height: 800}}); pg.on('pageerror', e=> errs.push(String(e))); await pg.addInitScript(SKIP); await pg.goto(`http://127.0.0.1:${port}/`);
    await pg.waitForFunction(()=> typeof startConquestMatch === 'function' && window.FX, null, {timeout: 120000}); await pg.evaluate(OWN);
    // glossary: a single instance that follows the hover
    const g = await pg.evaluate(async()=>{ const d = document.createElement('div'); d.style.cssText = 'position:fixed;left:200px;top:200px;z-index:99999'; d.innerHTML = keywordizeHTML('Pitch for lumber and Stone'); document.body.appendChild(d);
      const ws = [...d.querySelectorAll('[data-kw]')]; const over = w=> w.dispatchEvent(new MouseEvent('mouseover', {bubbles: true}));
      over(ws.find(w=> /lumber/i.test(w.textContent))); const one = document.querySelectorAll('#kwPop').length, t1 = kwPopEl.textContent, on1 = kwPopEl.classList.contains('on');
      over(ws.find(w=> /stone/i.test(w.textContent))); const two = document.querySelectorAll('#kwPop').length, t2 = kwPopEl.textContent;
      d.dispatchEvent(new MouseEvent('mouseover', {bubbles: true})); const off = !kwPopEl.classList.contains('on'); const o = kwPopEl.style.transformOrigin; d.remove();
      return {n: ws.length, one, two, t1, t2, on1, off, o}; });
    ok(g.n >= 3 && g.one === 1 && g.two === 1 && g.on1 && /Pay it to play/.test(g.t1) && /resource/i.test(g.t2) && g.off && /px/.test(g.o), 'glossary: one #kwPop for every word, springing from the word, closing off a word (' + JSON.stringify(g) + ')');
    // label styles
    const L = await pg.evaluate(()=>{ const d = document.createElement('div'); d.innerHTML = '<div class="po2-new-tag" id="t1">New!</div><span class="po2-new-tag ui23-get" id="t2">Get!</span><span class="rw-new" id="t3">New!</span><div class="board-card"><span class="seen-new" id="t4">NEW!</span></div><div class="fx9-zzz"><i id="t5">Z</i></div>'; document.body.appendChild(d);
      const out = ['t1', 't2', 't3', 't4'].map(i=>{ const s = getComputedStyle(document.getElementById(i)); return {bg: s.backgroundImage + s.backgroundColor, sh: s.boxShadow, bd: s.borderTopWidth, st: s.webkitTextStrokeWidth}; });
      const z = getComputedStyle(document.getElementById('t5')); out.push({st: z.webkitTextStrokeWidth}); d.remove(); return out; });
    ok(L.slice(0, 4).every(s=> /none/.test(s.bg) && /rgba\(0, 0, 0, 0\)/.test(s.bg) && s.sh === 'none' && s.bd === '0px' && s.st === '0px') && L[4].st === '0px', 'labels: Get! / New! / Zs are plain floating text (no plate, ring, border or text stroke) ' + JSON.stringify(L));
    // the room code rules
    const C = await pg.evaluate(()=>({clean: gdCodeClean('ab-1 2$cd9x'), v3: gdCodeValid('AB1'), v4: gdCodeValid('AB12'), v6: gdCodeValid('AB12CD'), v7: gdCodeValid('AB12CDE'), vl: gdCodeValid('ab12'), key: gdRoomKey('AB12')}));
    ok(C.clean === 'AB12CD' && !C.v3 && C.v4 && C.v6 && !C.v7 && !C.vl && C.key === 'AB1200', 'code: upper-case letters and digits, 4 required, 6 at most, padded to 6 for the server ' + JSON.stringify(C));
    // the Private window: Host / Join wait for 4, the eye shows the code, bad and good paths
    const P = await pg.evaluate(async()=>{
      const calls = [], oc = gdCreate, oj = gdJoin; window.__oc = oc; window.__oj = oj; gdCreate = (...a)=> calls.push(['create', ...a]); gdJoin = (...a)=> calls.push(['join', ...a]);
      gdPrivateOpen('hollow'); const inp = document.getElementById('gdPrivCode'), h = document.getElementById('gdPrivHost'), j = document.getElementById('gdPrivJoin'), eye = document.getElementById('gdPrivEye'), r = {};
      r.ph = inp.placeholder; r.masked0 = inp.classList.contains('is-hidden'); const ty = (v)=>{ inp.value = v; inp.dispatchEvent(new Event('input', {bubbles: true})); };
      ty('ab1'); r.dis3 = h.disabled && j.disabled; ty('ab-12'); r.val = inp.value; r.dis4 = h.disabled || j.disabled; ty('abcdefgh'); r.val6 = inp.value;
      eye.click(); r.masked1 = inp.classList.contains('is-hidden'); r.pressed = eye.getAttribute('aria-pressed'); eye.click(); r.masked2 = inp.classList.contains('is-hidden');
      ty('xy12'); h.click(); j.click(); r.calls = JSON.stringify(calls);
      gdCreate = oc; gdJoin = oj; gdPrivateClose(); GD.priv = null; return r; });
    ok(P.ph === '****-**' && P.masked0 && P.dis3 && P.val === 'AB12' && !P.dis4 && P.val6 === 'ABCDEF' && !P.masked1 && P.pressed === 'true' && P.masked2, 'Private window: ****-** hidden by default, Host / Join from 4, the eye toggles ' + JSON.stringify(P));
    ok(P.calls === JSON.stringify([['create', false, 'hollow', 'XY12'], ['join', 'XY12']]), 'Host creates a room with that code, Join joins it ' + P.calls);
    // bad paths: an invalid code, a taken code (this device), no room with that code
    const B = await pg.evaluate(async()=>{
      const r = {}; gdDeckOk = ()=> true; gdEnergyOk = ()=> true; gdLocalTake(gdRoomKey('TAKE')); gdPrivateOpen('hollow', 'TAKE'); const e = ()=> document.getElementById('gdPrivErr') && document.getElementById('gdPrivErr').textContent;
      await gdCreate(false, 'hollow', 'TAKE'); r.taken = e(); r.phaseAfterTaken = GD.phase;
      await gdJoin('AB'); r.bad = e(); gdNote(''); gdPrivateClose(); GD.priv = null; gdLocalFree(gdRoomKey('TAKE')); return r; });
    ok(/already taken/.test(B.taken) && B.phaseAfterTaken !== 'lobby', 'a taken code: the window says so and no room opens ' + JSON.stringify(B));
    ok(/4 to 6/.test(B.bad), 'a short code in Join: the window says 4 to 6 ' + JSON.stringify(B));
    const NF = await pg.evaluate(async()=>{ gdDeckOk = ()=> true; GD.priv = {typeId: 'hollow', code: 'NOPE1'}; await gdJoin('NOPE1'); await new Promise(r=> setTimeout(r, 6600)); const e = document.getElementById('gdPrivErr'); const t = e && e.textContent, up = !!document.querySelector('.gd-priv'); gdPrivateClose(); GD.priv = null; return {t, up, phase: GD.phase}; });
    ok(/No room with that code/.test(NF.t || '') && NF.up, 'no room with that code: the Private window comes back with the message ' + JSON.stringify(NF));
    // a host room on this device, then a taken code from a second host on the same device
    const H = await pg.evaluate(async()=>{ gdLocalTake(gdRoomKey('GOOD')); gdLocalFree(gdRoomKey('GOOD')); await gdCreate(false, 'hollow', 'GOOD'); const r = {phase: GD.phase, code: GD.code, taken: gdLocalTaken(gdRoomKey('GOOD'))}; gdClose(true); r.freed = !gdLocalTaken(gdRoomKey('GOOD')); return r; });
    ok(H.phase === 'lobby' && H.code === 'GOOD' && H.taken && H.freed, 'a good code: Host opens the lobby with it, and closing frees it ' + JSON.stringify(H));
    // the dungeon: Play and Private on its card, on the Dungeons page, not in the Arena
    const D = await pg.evaluate(async()=>{ playSubTab = 'dungeons'; switchTab('play'); await new Promise(r=> setTimeout(r, 900)); const dungeon = document.querySelector('.dg-group [data-gd-open="solo"]') && document.querySelector('.dg-group [data-gd-open="private"]') && !document.querySelector('.dg-group [data-gd-open="create"]') && !document.querySelector('.dg-group .gd-code-in');
      playSubTab = 'arena'; pl2ArenaPane = 'coop'; renderPlay(); await new Promise(r=> setTimeout(r, 600)); const arena = document.querySelectorAll('.dg-group').length; return {dungeon: !!dungeon, arena, map: gdMapId('hollow'), want: mapIdAt(16)}; });
    ok(D.dungeon && D.arena === 0 && D.map === D.want, 'the dungeon card (Play, Private) is on the Dungeons & Raids page; none in the Arena; its map is Map 16 ' + JSON.stringify(D));
    // the exit: gdClose from a finished run goes to the dungeon's Conquest map
    const X = await pg.evaluate(async()=>{ saveTutorial2Done(); playSubTab = 'arena'; GD.s = {leave(){}}; GD.phase = 'end'; GD.typeId = 'hollow'; GD.kind = 'solo'; gdClose(false); await new Promise(r=> setTimeout(r, 500)); return {sub: playSubTab, map: conquestSelectedMap, want: mapIdAt(16)}; });
    ok(X.sub === 'conquest' && X.map === X.want, 'finishing a dungeon: out onto the Conquest map that holds it ' + JSON.stringify(X));
    // the Lab's top row
    // a fight on the Morel Hollow: the Environment card, its pip, its hover is the card
    await pg.evaluate(async()=>{ switchTab('play'); playSubTab = 'conquest'; startConquestMatch('mu', '7-1'); await new Promise(r=> setTimeout(r, 2600)); const vs = document.querySelector('.vs-screen'); if(vs) vs.click(); await new Promise(r=> setTimeout(r, 700)); });
    const E = await pg.evaluate(async()=>{ const c = document.querySelector('#fieldCondCard .env-card'); const pip = c && c.querySelector('.env-pip'); c.dispatchEvent(new MouseEvent('mouseover', {bubbles: true})); await new Promise(r=> setTimeout(r, 1800));
      const pop = document.querySelector('.field-hover.env-hover'); const card = pop && pop.querySelector('.env-hover-card .card-tile'); const q = c.textContent.includes('?');
      c.classList.add('is-firing'); const lit = pip && getComputedStyle(pip).opacity; c.classList.remove('is-firing'); return {pip: pip && pip.textContent, card: !!card, q, lit}; });
    ok(/⏱/.test(E.pip || '') && E.card && !E.q && E.lit === '1', 'Environment card: a ⏱ pip that lights when it fires, no "?", the hover is the card ' + JSON.stringify(E));
    // round end: the settle clears numbers and lit pips; the pause is 1.5 s at 1x and scales with speed; automation skips it unless asked
    const R = await pg.evaluate(async()=>{ const m = matchState, r = {}; m.speedMult = 1; r.auto = roundEndPauseMs(m); window.__bwRoundPause = true; r.p1 = roundEndPauseMs(m); m.speedMult = 2; r.p2 = roundEndPauseMs(m); m.speedMult = 1;
      const c = document.querySelector('#fieldCondCard .env-card'); c.classList.add('is-firing'); const f = document.createElement('div'); f.className = 'dmg-float'; document.body.appendChild(f);
      const t0 = performance.now(); await roundEndSettle(m); r.ms = Math.round(performance.now() - t0); r.firing = c.classList.contains('is-firing'); r.floats = document.querySelectorAll('.dmg-float').length;
      m.speedMult = 2; const t1 = performance.now(); await roundEndSettle(m); r.ms2 = Math.round(performance.now() - t1); m.speedMult = 1; window.__bwRoundPause = false; return r; });
    ok(R.auto === 0 && R.p1 === 1500 && R.p2 === 750 && R.ms >= 1450 && R.ms < 3300 && !R.firing && R.floats === 0 && R.ms2 >= 700 && R.ms2 < R.ms, 'round end: floats and lit pips cleared, 1.5 s at 1x, 0.75 s at 2x, none under automation ' + JSON.stringify(R));
    // the skull and jungle zoom: one overlay, nothing with reduced motion
    const Z = await pg.evaluate(async()=>{ const a = uip1Zoom('skull'), n1 = document.querySelectorAll('.uip1-zoom').length, has = !!document.querySelector('.uip1-skull'); const b2 = uip1Zoom('jungle'), n2 = document.querySelectorAll('.uip1-zoom').length, blades = document.querySelectorAll('.uip1-k-jungle i').length;
      await new Promise(r=> setTimeout(r, 1800)); return {a, n1, has, b2, n2, blades, gone: document.querySelectorAll('.uip1-zoom').length}; });
    ok(Z.a > 0 && Z.n1 === 1 && Z.has && Z.b2 > 0 && Z.n2 === 1 && Z.blades > 40 && Z.gone === 0, 'zoom: the skull and the jungle each play once, one overlay at a time, and clean up ' + JSON.stringify(Z));
    await pg.close();
    const rm = await b.newPage({viewport: {width: 1366, height: 800}, reducedMotion: 'reduce'}); rm.on('pageerror', e=> errs.push(String(e))); await rm.addInitScript(SKIP); await rm.goto(`http://127.0.0.1:${port}/`);
    await rm.waitForFunction(()=> typeof uip1Zoom === 'function', null, {timeout: 120000});
    ok(await rm.evaluate(()=> uip1Zoom('skull') === 0 && uip1Zoom('jungle') === 0 && !document.querySelector('.uip1-zoom')), 'reduced motion: no zoom overlay');
    await rm.close();
  }catch(e){ ok(false, 'page run: ' + (e && e.stack || e)); }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); srv.close();
  console.log(`uipolish1-2026-11-28: ${n - fail}/${n} ok`); process.exit(fail ? 1 : 0);
})();
