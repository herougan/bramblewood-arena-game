#!/usr/bin/env node
// 2026-11-14 (package UI54, owner 11:11): the Codex is a place of its own (scene and sign, entrance and strip entry kept, every way in still opens it), and its Maps page is
// rolls of maps: a roll per world (World 1 = Maps 0-40), a scroll per reached map with its side maps inside, built only when opened.
// Static checks always run; the browser part runs at 1366 and 390 when index.html and Chromium are there. Build first.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const read = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  x', m); } };
const app = read('arena_app.js'), tpl = read('arena_template.html'), places = read('bramblewood-ui-places.js'), texts = read('bramblewood-texts.js');
const fn = (src, name)=>{ const i = src.indexOf('function ' + name + '('); if(i < 0) return ''; let d = 0; const j = src.indexOf('{', i); for(let k = j; k < src.length; k++){ if(src[k] === '{') d++; else if(src[k] === '}' && --d === 0) return src.slice(i, k + 1); } return ''; };

// the place
ok(/codex: \{cls:'codex-scene', icon:'📖', sign:'Codex'/.test(app), 'PLACES lists the Codex (scene, sign)');
ok(/is-forge', codexSubTab === 'forge'/.test(fn(app, 'renderCodex')), 'renderCodex marks the Forge view, which keeps its own scene');
ok(/#view-codex\.codex-scene:not\(\.is-forge\)\{/.test(tpl) && /#view-codex\.codex-scene:not\(\.is-forge\)::after\{content:attr\(data-sign\)/.test(tpl), 'CSS: the Codex scene and its sign, not on the Forge view');
ok(/codex: \{ms: 900/.test(places) && /return null;/.test(places.slice(places.indexOf('function placeOf('), places.indexOf('function placeOf(') + 400)), 'the book entrance is kept (and the Forge view still has none)');
ok(/key:'codex', icon:'📖'/.test(app) && /key:'forge', icon:'🔨'/.test(app), 'the places strip keeps Codex and Forge');
// every way in is still switchTab('codex') (no new tab): the callers that set a sub-tab first
['codexSubTab = \'brambles\'', 'codexSubTab = \'forge\'; switchTab(\'codex\')', 'codexSubTab = \'browse\'; switchTab(\'codex\')'].forEach(s=> ok(app.includes(s), 'still in the code: ' + s));
ok(!/if\(place\) Ambience\.play/.test(app) && /place && place\.ambience/.test(app), 'a place with no ambience (the Codex) stays quiet instead of playing ""');
// the maps page
const mc = fn(app, 'mapCodexHTML') + fn(app, 'mcxMapBody') + fn(app, 'mcxScrollHTML') + fn(app, 'mcxMaps') + fn(app, 'wireMapCodex');
ok(/MCX_LAST_W1 = 40/.test(app) && /mcxWorldOf/.test(mc), 'World 1 is Maps 0-40');
ok(!/fightRules/.test(fn(app, 'mapCodexHTML')) && /fightRules/.test(fn(app, 'mcxMapBody')), 'fight rules run when a scroll opens, not when the page does');
ok(/\.firstChild/.test(fn(app, 'wireMapCodex')) && /aria-expanded/.test(fn(app, 'wireMapCodex')), 'a scroll fills on its first unroll and says whether it is open');
ok(/isMapUnlocked/.test(fn(app, 'mcxMaps')) && /adminModeEnabled/.test(fn(app, 'mcxMaps')), 'maps show by the old rule (reached; all for an admin)');
ok(/fieldRowState\(row\.key\) !== 'unknown'/.test(fn(app, 'mcxMapBody')) && /beaten \|\| adminModeEnabled/.test(fn(app, 'mcxMapBody')), 'effects read ? until learned, the boss until beaten');
ok(/codexRevealedForPlayer/.test(fn(app, 'mcxMapBody')) && /ui54-new/.test(fn(app, 'mcxMapBody')), 'cards use the Codex reveal rule; New! marks the map that brings one');
ok(/\.mx-roll\{/.test(tpl) && /\.mx-anim \.mx-fold\{transition/.test(tpl) && /prefers-reduced-motion: reduce\)\{ \.mx-anim/.test(tpl) && /fxAtLeast\('med'\) && !reducedMotion\(\)/.test(fn(app, 'mapCodexHTML')), 'the unroll is animated only on Effects Medium+ and without reduced motion');
const css = tpl.slice(tpl.indexOf('UI54:BEGIN'), tpl.indexOf('UI54:END'));
ok(css && !/:has\(|filter:|#[0-9a-f]{3,6}\b(?![^{]*\{)/.test(css.replace(/#view-codex/g, '')) , 'UI54 CSS: no :has(), no filter');
const texts54 = ['intro', 'world', 'range', 'range-open', 'reached', 'cleared', 'side', 'sides', 'fx', 'nofx', 'cards', 'new', 'earlier', 'boss', 'opens'];
texts54.forEach(k=>{ const m = new RegExp('"ui\\.ui54-' + k + '": "((?:[^"\\\\]|\\\\.)*)"').exec(texts); ok(!!m, 'text ui54-' + k);
  if(m){ const en = JSON.parse('"' + m[1] + '"').replace(/^[^A-Za-z{+]+/, ''); ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'].forEach(c=>{ const p = JSON.parse(read('lang/' + c + '.json')); ok(!!p[en], `lang/${c}.json has "${en}"`); }); } });
ok(/ui54-2026-11-14/.test(read('tests/run-all.sh')), 'run-all.sh lists this test');
ok(/Package UI54/.test(read('docs/CHANGELOG.md').slice(0, 600)), 'CHANGELOG has the entry at the top');

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
      const r = await pg.evaluate(`(async()=>{ const wait = ms=> new Promise(r=> setTimeout(r, ms)); const out = {};
        codexSubTab = 'browse'; switchTab('codex'); BramblewoodPlaces.skip(); await wait(300); const v = document.getElementById('view-codex');
        out.scene = v.classList.contains('codex-scene') && !v.classList.contains('is-forge'); out.sign = v.dataset.sign; out.signShown = getComputedStyle(v, '::after').content;
        out.strip = !!document.querySelector('#pageBackBar [data-pbsc="codex"].is-here');
        codexSubTab = 'forge'; switchTab('codex'); BramblewoodPlaces.skip(); await wait(300);
        out.forge = v.classList.contains('is-forge') && !!v.querySelector('#view-forge') && getComputedStyle(v, '::after').content === 'none';
        out.forgeStrip = !!document.querySelector('#pageBackBar [data-pbsc="forge"].is-here');
        switchTab('home'); await wait(200); document.querySelector('[data-pbsc]') || 0;
        adminModeEnabled = true; codexSubTab = 'maps'; switchTab('codex'); BramblewoodPlaces.skip(); await wait(400);
        const heads = document.querySelectorAll('.mx-scroll > .mx-roll').length, w1 = document.querySelector('.mx-world[data-mxs="w1"]');
        out.heads = heads; out.world = w1 && w1.querySelector('.mx-wroll b').textContent; out.range = w1 && /0.40/.test(w1.querySelector('.mx-wroll small').textContent);
        out.filledBefore = document.querySelectorAll('.mx-scroll.is-open .mx-in > *').length;
        const first = document.querySelector('.mx-scroll > .mx-roll'); first.click(); for(let i = 0; i < 30 && first.parentElement.querySelector('.mx-in').getBoundingClientRect().height < 40; i++) await wait(100);
        const sc = first.parentElement; out.open = sc.classList.contains('is-open') && first.getAttribute('aria-expanded') === 'true';
        out.body = sc.querySelector('.mx-in').textContent.length; out.fx = !!sc.querySelector('.mx-fx, .panel-sub');
        out.height = sc.querySelector('.mx-in').getBoundingClientRect().height;
        const sub = sc.querySelector('.mx-subs .mx-scroll'); out.sideInside = !!sub;
        first.click(); for(let i = 0; i < 30 && sc.querySelector('.mx-in').getBoundingClientRect().height >= 2; i++) await wait(100); out.closed = !sc.classList.contains('is-open') && sc.querySelector('.mx-in').getBoundingClientRect().height < 2;
        out.noOverflow = document.documentElement.scrollWidth <= window.innerWidth + 1;
        adminModeEnabled = false; return out; })()`);
      ok(r.scene && r.sign && /Codex/.test(r.sign), `${t} the Codex page has the scene and its sign (${JSON.stringify([r.scene, r.sign])})`);
      ok(r.strip && r.forge && r.forgeStrip, `${t} the strip marks Codex on Browse and Forge on the Forge; the Forge keeps its own scene (${JSON.stringify([r.strip, r.forge, r.forgeStrip])})`);
      ok(r.heads >= 20 && /World 1/.test(r.world) && r.range, `${t} World 1 (Maps 0-40) lists a scroll per map (${r.heads}, ${r.world})`);
      ok(r.open && r.body > 40 && r.fx && r.height > 40 && r.sideInside, `${t} a tap unrolls a scroll with its info and its side maps inside (${JSON.stringify([r.open, r.body, r.height, r.sideInside])})`);
      ok(r.closed, `${t} a second tap rolls it up`);
      ok(r.noOverflow, `${t} no sideways scroll`);
      await ctx.close();
    }
  } finally { await b.close(); }
  ok(errs.length === 0, 'no page errors ' + errs.slice(0, 2).join(' | '));
}
browser().then(()=>{ console.log(fail ? `ui54: ${fail} of ${n} checks FAILED` : `ui54: ${n} checks passed`); process.exit(fail ? 1 : 0); }, e=>{ console.log('  x browser part crashed:', e && e.stack || e); process.exit(1); });
