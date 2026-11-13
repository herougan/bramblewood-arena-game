#!/usr/bin/env node
// 2026-11-13 (package UI52, owner 11:50 #1-4 and 11:55 #5-9): card editor first map, the admin skill-map toggle, the slower page turn (one page turns about
// its middle and slides), the Triggers lesson button gone (Profile resets; the page count in the filter row), the Forge lookup, the new entrances (Codex book,
// Stomping Grounds doors, Nest egg, Inventory satchel), Shop and Premium on the places strip.
// Static checks always run; the browser part runs at 1366 and 390 when index.html and Chromium are there. Build first.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const read = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  x', m); } };
const app = read('arena_app.js'), tpl = read('arena_template.html'), places = read('bramblewood-ui-places.js'), texts = read('bramblewood-texts.js');
const fn = (src, name)=>{ const i = src.indexOf('function ' + name + '('); if(i < 0) return ''; let d = 0; const j = src.indexOf('{', i); for(let k = j; k < src.length; k++){ if(src[k] === '{') d++; else if(src[k] === '}' && --d === 0) return src.slice(i, k + 1); } return ''; };

// #5 the Forge: forgeBaseDef copied every card per call (Object.assign of the whole baseline), ~5 calls a card in the Ready count
ok((app.match(/\nfunction forgeBaseDef\(/g) || []).length === 1 && !/Object\.assign/.test(fn(app, 'forgeBaseDef')) && /id in liveCards/.test(fn(app, 'forgeBaseDef')), '#5 forgeBaseDef is one lookup, no copy');
ok(/!loadDialogueFlags\(\)\['seen:forge_cobble_intro'\] && r\.offsetParent !== null/.test(fn(app, 'renderForge')), '#5 the seen flag is read before offsetParent (no forced layout)');
// #1 #2
ok(/cardObtainMap\(c\)/.test(fn(app, 'cardFirstMapHTML')) && /cardFirstMapList\(c\)/.test(fn(app, 'cardFirstMapHTML')) && /cardFirstMapHTML\(c\)/.test(fn(app, 'renderEditorInner')) && /pk1OpenMapCards\(fm\.dataset\.ui52Map\)/.test(app), '#1 the editor shows the first map and opens its Map cards');
ok(/adminModeEnabled/.test(fn(app, 'bookFirstMapHTML')) && /cardObtainMap\(d\)/.test(fn(app, 'skillFirstMaps')) && /\.bk-maps-toggle\{position:absolute;/.test(tpl), '#2 admin skill-map toggle, overlaid (absolute)');
// #3
ok(/const CODEX_TURN_MS = 760/.test(app) && /pg-leaf-mid/.test(fn(app, 'codexLeafTurn')) && /--pg-turn-ms:760ms/.test(tpl) && !/pgOneFwd|pg-leaf-open/.test(tpl + fn(app, 'codexLeafTurn')), '#3 the turn is 760 ms; one page turns the two-face leaf about its middle');
// #4
ok(!/tlReplayBtn/.test(app) && !/function replayTriggerLesson/.test(app) && !/"ui\.tl-replay/.test(texts), '#4 the Triggers lesson button, its function and texts are gone');
ok(/id="bkPager"/.test(fn(app, 'renderSkillBook')) && /bar\.innerHTML = codexPagerNavHTML\('book'/.test(fn(app, 'bookDraw')) && !/book\.innerHTML = codexPagerNavHTML/.test(fn(app, 'bookDraw')), '#4 the page count sits in the filter row, not above the book');
ok(/GUIDED_STEPS\.concat\(PITCH_LESSON, TRIGGER_LESSON/.test(fn(app, 'basicTutorialTipIds')) && /coachSeen\.clear\(\)/.test(fn(app, 'resetTutorials')) && /tutorialResetHTML\(\)/.test(fn(app, 'renderProfile')), '#4 the Profile resets the basic or all tutorials');
['ui.ui52-first-map-tip', 'ui.ui52-first-map-none', 'ui.ui52-skill-maps-tip', 'ui.ui52-tutorials', 'ui.ui52-reset-basic', 'ui.ui52-reset-basic-tip', 'ui.ui52-reset-all', 'ui.ui52-reset-all-tip', 'ui.ui52-reset-done'].forEach(k=>{
  const m = new RegExp('"' + k.replace(/\./g, '\\.') + '": "((?:[^"\\\\]|\\\\.)*)"').exec(texts); ok(!!m, 'text ' + k);
  if(m){ const en = JSON.parse('"' + m[1] + '"').replace(/^[^A-Za-z{]+/, ''); ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'].forEach(c=>{ const p = JSON.parse(read('lang/' + c + '.json')); ok(p[en] || p[JSON.parse('"' + m[1] + '"')], k + ' in ' + c); }); } });
// #6-8 entrances
ok(!/bwp-cover|bwp-rim|bwp-sflap/.test(places) && /bwp-bk/.test(places) && /bwp-egg/.test(places) && /bwp-bagw/.test(places), '#6 #8 the full-screen cover, rim and flap are gone; book, egg and satchel instead');
const stomp = places.slice(places.indexOf('  stomp: {'), places.indexOf('  inventory: {'));
ok(!/translate\(/.test(stomp.slice(0, stomp.indexOf('motes('))) && /rotateY\(\$\{s \* 100\}deg\)/.test(stomp) && /swing\(l, -1/.test(stomp) && /backface-visibility:hidden/.test(places.slice(places.indexOf('.bwp-gate{'), places.indexOf('.bwp-gate.is-l'))), '#7 the gates swing toward you (left -100, right +100 deg), no shake, their backs hidden');
// #9
ok(!/data-shopmode|shop-modes/.test(app + tpl) && /key:'shop', icon:'🛒'/.test(app) && /key:'premium', icon:'🍂'/.test(app), '#9 Shop and Premium are on the places strip; the switch is gone');
ok(/ui52-2026-11-13/.test(read('tests/run-all.sh')), 'run-all.sh lists this test');

async function browser(){
  let pw; try{ pw = require('playwright'); }catch(e){ try{ pw = require(path.join(require('child_process').execSync('npm root -g').toString().trim(), 'playwright')); }catch(_){ console.log('  (browser part skipped: no playwright)'); return; } }
  const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
  if(!fs.existsSync(EXE) || !fs.existsSync(path.join(ROOT, 'index.html'))){ console.log('  (browser part skipped: no Chromium or index.html)'); return; }
  const URL = 'file://' + path.join(ROOT, 'index.html');
  const INIT = "localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); sessionStorage.setItem('bramblewood_seen_splash','1'); localStorage.setItem('bramblewood_fx_level','high'); localStorage.setItem('bramblewood_fx_auto','off');"
    + "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying','tl-what','pl-need']));";
  const b = await pw.chromium.launch({executablePath: EXE}); const errs = [];
  try{
    for(const w of [1366, 390]){
      const ctx = await b.newContext({viewport: {width: w, height: w < 500 ? 844 : 900}});
      await ctx.route('**/*', r=> r.request().url().startsWith('file:') ? r.continue() : r.abort());
      const pg = await ctx.newPage(); pg.on('pageerror', e=> errs.push(`@${w}: ` + String(e)));
      await pg.addInitScript(INIT); await pg.goto(URL, {waitUntil: 'domcontentloaded', timeout: 120000}); await pg.waitForFunction("typeof switchTab === 'function'", null, {timeout: 120000}); await pg.waitForTimeout(1500);
      await pg.evaluate("(()=>{ window.showToast = ()=>{}; window.playDialogue = async ()=>({}); window.maybeRarityLesson = ()=>{}; FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); return 1; })()");
      const t = `@${w}`;
      // #1 the editor's first map
      const ed = await pg.evaluate(`(async()=>{ adminModeEnabled = true; openCardEditor('bramblewood-lynx'); await new Promise(r=> setTimeout(r, 300)); const btn = document.querySelector('#editorOverlay .ui52-first-map');
        const n = cardObtainMap(rawCardDef('bramblewood-lynx') || getCardDefs()['bramblewood-lynx']); const txt = btn ? btn.textContent : ''; if(btn) btn.click(); await new Promise(r=> setTimeout(r, 400));
        const ov = document.getElementById('pk1MapCardsOverlay'), open = !!ov && !ov.hidden; if(ov){ ov.hidden = true; ov.innerHTML = ''; } closeCardEditor(); return {txt, n, open}; })()`);
      ok(new RegExp('Map ' + ed.n + '\\b').test(ed.txt) && ed.open, `${t} #1 the editor shows "Map ${ed.n}" and opens that map's cards (${JSON.stringify(ed)})`);
      // #2 #4 the skills book
      const bk = await pg.evaluate(`(async()=>{ adminModeEnabled = true; codexSubTab = 'skills'; switchTab('codex'); BramblewoodPlaces.skip(); await new Promise(r=> setTimeout(r, 600));
        const btn = document.getElementById('bkMapsBtn'), book = document.getElementById('bkBook'), top0 = book.getBoundingClientRect().top;
        const r = {btn: !!btn, pos: btn && getComputedStyle(btn).position, replay: !!document.getElementById('tlReplayBtn'), pill: !!document.querySelector('#bkPager .pg-of'), infoInBook: !!book.querySelector('.pg-info'),
          barTabs: document.querySelectorAll('#bkPager .pg-tab').length, bookTabs: book.querySelectorAll('.pg-tab').length};
        btn.click(); await new Promise(r=> setTimeout(r, 300)); bookGo(2); await new Promise(r=> setTimeout(r, 1000));
        r.maps = document.querySelectorAll('#bkBook .bk-firstmap').length; r.moved = Math.round(document.getElementById('bkBook').getBoundingClientRect().top - top0); r.pressed = btn.getAttribute('aria-pressed');
        btn.click(); await new Promise(r=> setTimeout(r, 300)); r.after = document.querySelectorAll('#bkBook .bk-firstmap').length; return r; })()`);
      ok(bk.btn && bk.pos === 'absolute' && bk.maps > 0 && bk.moved === 0 && bk.pressed === 'true' && bk.after === 0, `${t} #2 the admin toggle shows each skill's first map, overlaid (the book does not move) (${JSON.stringify(bk)})`);
      ok(!bk.replay && bk.pill && !bk.infoInBook && (w < 560 ? bk.barTabs === 4 && bk.bookTabs === 0 : bk.barTabs === 0 && bk.bookTabs === 4), `${t} #4 no Triggers lesson button; the page count is in the filter row (phone: with its turn buttons) (${JSON.stringify(bk)})`);
      const nb = await pg.evaluate(`(async()=>{ adminModeEnabled = false; switchTab('home'); codexSubTab = 'skills'; switchTab('codex'); BramblewoodPlaces.skip(); await new Promise(r=> setTimeout(r, 400)); return !!document.getElementById('bkMapsBtn'); })()`);
      ok(!nb, `${t} #2 players never see the toggle`);
      // #3 the turn
      const tn = await pg.evaluate(`(async()=>{ const book = document.getElementById('bkBook'); bookGo(0); await new Promise(r=> setTimeout(r, 1000)); bookTurn(1); const l = book.querySelector('.pg-leaf');
        const r = {leaf: !!l, mid: !!l && l.classList.contains('pg-leaf-mid'), dur: l && getComputedStyle(l).animationDuration, faces: l ? l.querySelectorAll('.pg-face').length : 0};
        await new Promise(r=> setTimeout(r, 1000)); r.left = book.querySelectorAll('.pg-leaf').length; r.hidden = [...book.querySelectorAll('.bk-page')].filter(p=> p.style.visibility === 'hidden').length; return r; })()`);
      ok(tn.leaf && tn.dur === '0.76s' && tn.faces === 2 && tn.mid === (w < 900) && tn.left === 0 && tn.hidden === 0, `${t} #3 a 760 ms two-face turn${w < 900 ? ' about the page middle' : ' about the spine'}, nothing left after (${JSON.stringify(tn)})`);
      // #4 the Profile resets
      const pf = await pg.evaluate(`(async()=>{ markCoachSeen('tl-what'); markCoachSeen('g-hand'); markCoachSeen('st-poison'); switchTab('profile'); BramblewoodPlaces.skip(); await new Promise(r=> setTimeout(r, 400));
        const bb = document.querySelector('[data-tutreset="basic"]'), ab = document.querySelector('[data-tutreset="all"]'); if(!bb || !ab) return {btn: false};
        bb.click(); const once = coachSeen.has('tl-what'); bb.click(); const basic = !coachSeen.has('tl-what') && !coachSeen.has('g-hand') && coachSeen.has('st-poison');
        ab.click(); ab.click(); return {btn: true, once, basic, all: coachSeen.size === 0}; })()`);
      ok(pf.btn && pf.once && pf.basic && pf.all, `${t} #4 Reset basic (tap twice) clears the early lessons only; Reset all clears every tip (${JSON.stringify(pf)})`);
      // #9 the strip
      const sh = await pg.evaluate(`(async()=>{ shopMode = 'normal'; switchTab('shop'); BramblewoodPlaces.skip(); await new Promise(r=> setTimeout(r, 400)); const nav = document.querySelector('#pageBackBar .pb-shortcuts');
        const r = {shop: !!nav.querySelector('[data-pbsc="shop"].is-here'), prem: !!nav.querySelector('[data-pbsc="premium"]'), sw: !!document.querySelector('#view-shop .shop-modes'), fits: nav.scrollWidth <= nav.clientWidth + 1 && nav.getBoundingClientRect().right <= document.getElementById('pageBackBar').getBoundingClientRect().right + 1 && nav.getBoundingClientRect().left >= -1};
        nav.querySelector('[data-pbsc="premium"]').click(); await new Promise(r=> setTimeout(r, 300)); BramblewoodPlaces.skip();
        r.premium = document.getElementById('view-shop').classList.contains('is-premium-shop') && !!document.querySelector('#pageBackBar [data-pbsc="premium"].is-here'); shopMode = 'normal'; return r; })()`);
      ok(sh.shop && sh.prem && !sh.sw && sh.fits && sh.premium, `${t} #9 Shop and Premium on the places strip, inside the bar; Premium opens the Premium shop (${JSON.stringify(sh)})`);
      // #6-8 the entrances: within 1 s; the gates end turned past edge-on; nothing left after
      const en = await pg.evaluate(`(async()=>{ const out = {};
        for(const k of ['codex', 'nest', 'stomp', 'inventory']){ switchTab(k); BramblewoodPlaces.skip(); await new Promise(r=> setTimeout(r, 200));
          const p = BramblewoodPlaces.enter(k, document.getElementById('view-' + k), {force: true, from: 'home'}); const lay = document.querySelector('.bwp-layer');
          const end = Math.max(...lay.getAnimations({subtree: true}).map(a=> a.effect.getComputedTiming().endTime));
          const o = {ms: BramblewoodPlaces.lengthOf(k), end: Math.round(end)};
          if(k === 'stomp'){ const g = [...lay.querySelectorAll('.bwp-gate')]; o.shake = g.some(x=> x.getAnimations().some(a=> a.effect.getKeyframes().some(f=> /translate/.test(f.transform || '')))); g.forEach(x=> x.getAnimations().forEach(a=>{ a.pause(); a.currentTime = a.effect.getComputedTiming().endTime; }));
            o.angles = g.map(x=>{ const m = new DOMMatrix(getComputedStyle(x).transform); return Math.round(Math.atan2(-m.m31, m.m11) * 180 / Math.PI); });
            o.onScreen = g.some(x=>{ const r = x.getBoundingClientRect(); return r.width > 2 && r.right > 2 && r.left < innerWidth - 2; }); }
          if(k === 'codex') o.book = !!lay.querySelector('.bwp-bk .bwp-leaf') && !lay.querySelector('.bwp-cover');
          await p; await new Promise(r=> setTimeout(r, 600)); o.left = document.querySelectorAll('.bwp-layer').length; out[k] = o; }
        return out; })()`);
      for(const k of Object.keys(en)){ const o = en[k]; ok(o.ms <= 1000 && o.end <= o.ms && o.left === 0, `${t} ${k}: the entrance is at most 1 s (${o.ms} ms, last motion ${o.end} ms) and leaves nothing (${o.left})`); }
      ok(en.stomp && !en.stomp.shake && en.stomp.angles.every(a=> Math.abs(a) >= 90) && !en.stomp.onScreen, `${t} #7 the gates swing open toward you past edge-on, no shake, none left on screen (${JSON.stringify(en.stomp)})`);
      ok(en.codex && en.codex.book, `${t} #6 the Codex entrance is a book on the screen, not a full-screen cover`);
      await ctx.close();
    }
  } finally { await b.close(); }
  ok(errs.length === 0, 'no page errors ' + errs.slice(0, 2).join(' | '));
}
browser().then(()=>{ console.log(fail ? `ui52: ${fail} of ${n} checks FAILED` : `ui52: ${n} checks passed`); process.exit(fail ? 1 : 0); }, e=>{ console.log('  x browser part crashed:', e && e.stack || e); process.exit(1); });
