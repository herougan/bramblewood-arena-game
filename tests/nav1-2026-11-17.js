#!/usr/bin/env node
// 2026-11-17 (package NAV1, owner OWN-1117-3 23:41 / 23:43): the pages. Main menu, Conquest, Arena (PvP), Dungeons & Raids, Camp (Forge, Nest,
// Stomping Grounds, Inventory, Wildpaths open from its bar), Shop & Premium (two tabs), Codex. Notices and the Tavern stay panels.
// The main menu: page tiles in one grid, the notes on one board under it (none hang loose beside the tiles).
// Static checks always run; the browser part runs at 1366 and 390 when index.html and Chromium are there. Build first.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const read = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  x', m); } };
const app = read('arena_app.js'), tpl = read('arena_template.html'), texts = read('bramblewood-texts.js');
const fn = name=>{ const i = app.indexOf('\nfunction ' + name + '('); if(i < 0) return ''; let d = 0; const j = app.indexOf('{', i); for(let k = j; k < app.length; k++){ if(app[k] === '{') d++; else if(app[k] === '}' && --d === 0) return app.slice(i, k + 1); } return ''; };

// the Camp bar
const bar = app.slice(app.indexOf('const PAGE_SHORTCUTS = ['), app.indexOf('];', app.indexOf('const PAGE_SHORTCUTS = [')));
['deck', 'forge', 'nest', 'stomp', 'inventory', 'paths'].forEach(k=> ok(bar.includes(`key:'${k}'`), 'the Camp bar has ' + k));
['map', 'codex', 'shop', 'premium'].forEach(k=> ok(!bar.includes(`key:'${k}'`), 'the Camp bar leaves out ' + k));
ok(/nav1InCamp\(tab\) \?/.test(fn('refreshPageBar')), 'the bar shows only on the Camp and its pages');
// Shop & Premium
ok(/nav1ShopTabsHTML\(\)/.test(fn('renderShop')) && /data-nav1shop/.test(fn('renderShop')) && /role="tablist"/.test(fn('nav1ShopTabsHTML')), 'the Shop page has Shop | Premium tabs');
// Play: three pages
ok(/'dr'/.test(fn('nav1PlayPage')) && /'arena'/.test(fn('nav1PlayPage')), 'Play view: Conquest, Arena, Dungeons & Raids');
ok(/nav1PlayTabs\(\)\.length > 1/.test(fn('renderPlay')) && /id="nav1MapBtnPlay"/.test(fn('renderPlay')) && /id="nav1DrBtnPlay"/.test(fn('renderPlay')), 'each Play page shows its own tabs; the corner cluster reaches Conquest and Dungeons & Raids');
// main menu
const home = fn('renderHome');
ok(/class="home-notes"/.test(home) && !/note-nest|note-inv|note-paths|homeCodexBtn/.test(home), 'Home: notes on one board; Nest, Inventory, Wildpaths moved into the Camp bar; the Codex is a tile');
ok(/big\('codex','📖','Codex'\)/.test(home) && /id="homeRaidBtn"/.test(home) && /id="homeArenaBtn"|arenaTile/.test(home), 'Home tiles: Play, Arena, Dungeons & Raids, Camp, Shop, Codex');
ok(/#view-home \.home-notes\{display:flex;/.test(tpl) && /#view-home \.home-notes > \.home-note, #view-home \.home-notes > \.home-note-wrap\{position:relative;/.test(tpl), 'CSS: the board pins every note in the flow');
const css = tpl.slice(tpl.indexOf('(package NAV1, owner 23:43)'), tpl.indexOf('.nav1-shop-tabs .btn'));
ok(css && !/:has\(|filter:|#[0-9a-fA-F]{3,6}\b/.test(css.replace(/#view-home/g, '')), 'NAV1 CSS: tokens only, no :has(), no filter');
// texts
['nav1-dungeons-raids', 'nav1-shop-tabs'].forEach(k=>{ const m = new RegExp('"ui\\.' + k + '": "((?:[^"\\\\]|\\\\.)*)"').exec(texts); ok(!!m, 'text ' + k);
  if(m){ const en = JSON.parse('"' + m[1] + '"'); ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'].forEach(c=> ok(!!JSON.parse(read('lang/' + c + '.json'))[en], `lang/${c}.json has "${en}"`)); } });
ok(/nav1-2026-11-17/.test(read('tests/run-all.sh')), 'run-all.sh lists this test');
ok(/package NAV1/.test(read('docs/CHANGELOG.md')), 'CHANGELOG entry');

async function browser(){
  let pw; try{ pw = require('playwright'); }catch(e){ try{ pw = require(path.join(require('child_process').execSync('npm root -g').toString().trim(), 'playwright')); }catch(_){ console.log('  (browser part skipped: no playwright)'); return; } }
  const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
  if(!fs.existsSync(EXE) || !fs.existsSync(path.join(ROOT, 'index.html'))){ console.log('  (browser part skipped: no Chromium or index.html)'); return; }
  const URL = 'file://' + path.join(ROOT, 'index.html');
  const INIT = "localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); sessionStorage.setItem('bramblewood_seen_splash','1'); localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying','tl-what','pl-need']));";
  const b = await pw.chromium.launch({executablePath: EXE}); const errs = [];
  try{
    for(const w of [1366, 390]){
      const ctx = await b.newContext({viewport: {width: w, height: w > 600 ? 860 : 844}});
      await ctx.route('**/*', r=> r.request().url().startsWith('file:') ? r.continue() : r.abort());
      const pg = await ctx.newPage(); pg.on('pageerror', e=> errs.push(`@${w}: ` + String(e)));
      await pg.addInitScript(INIT); await pg.goto(URL, {waitUntil: 'domcontentloaded', timeout: 120000}); await pg.waitForFunction("typeof switchTab === 'function'", null, {timeout: 120000}); await pg.waitForTimeout(1500);
      await pg.evaluate("(()=>{ window.showToast = ()=>{}; window.playDialogue = async ()=>({}); window.maybeRarityLesson = ()=>{}; FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); return 1; })()");
      const t = `@${w}`;
      const r = await pg.evaluate(`(async()=>{ const wait = ms=> new Promise(r=> setTimeout(r, ms)); const skip = ()=>{ try{ BramblewoodPlaces.skip(); }catch(e){} }; const out = {};
        switchTab('home'); await wait(300);
        const grid = document.querySelector('#view-home .home-grid'), board = document.querySelector('#view-home .home-notes'), gr = grid.getBoundingClientRect(), br = board.getBoundingClientRect();
        const notes = [...board.children].filter(e=> getComputedStyle(e).display !== 'none'), nr = notes.map(e=> e.getBoundingClientRect());
        out.tiles = [...grid.querySelectorAll('.home-tile')].map(e=> e.dataset.hometab || e.id);
        out.tethered = nr.length > 0 && nr.every(r=> r.left >= br.left - 6 && r.right <= br.right + 6 && r.top >= gr.bottom) && Math.abs(br.left - gr.left) < 2 && Math.abs(br.width - gr.width) < 2;
        out.sameW = nr.length > 0 && Math.max(...nr.map(r=> r.width)) - Math.min(...nr.map(r=> r.width)) < 3;
        // Camp -> Forge -> back to Camp
        homeGo('deck'); skip(); await wait(400);
        const camp = [...document.querySelectorAll('#pageBackBar [data-pbsc]')].map(b=> b.dataset.pbsc); out.camp = camp; out.wp = wildpathsOpen();
        document.querySelector('#pageBackBar [data-pbsc="forge"]').click(); skip(); await wait(500);
        out.forge = currentTab === 'codex' && codexSubTab === 'forge' && !!document.querySelector('#view-forge') && !!document.querySelector('#pageBackBar [data-pbsc="forge"].is-here');
        document.getElementById('pageBackBtn').click(); skip(); await wait(400); out.backToCamp = currentTab;
        document.querySelector('#pageBackBar [data-pbsc="nest"]').click(); skip(); await wait(400);
        document.querySelector('#pageBackBar [data-pbsc="deck"]').click(); skip(); await wait(400); out.nestToCamp = currentTab;
        // Codex: its own page, no Camp bar, Browse first
        homeGo('codex'); skip(); await wait(400); out.codex = currentTab === 'codex' && codexSubTab === 'browse' && !document.querySelector('#pageBackBar .pb-shortcuts') && !!document.querySelector('.codex-sub-tabs');
        // Shop & Premium
        homeGo('shop'); skip(); await wait(400); const st = document.querySelector('#view-shop .nav1-shop-tabs');
        out.shop = !!st && !document.querySelector('#pageBackBar .pb-shortcuts') && !!document.querySelector('#shopCounter');
        st.querySelector('[data-nav1shop="premium"]').click(); skip(); await wait(300);
        out.premium = shopMode === 'premium' && document.getElementById('view-shop').classList.contains('is-premium-shop');
        document.querySelector('#view-shop [data-nav1shop="normal"]').click(); skip(); await wait(300); out.backToShop = shopMode === 'normal' && !!document.querySelector('#shopCounter [data-buypack], #shopCounter .btn');
        // Play: three pages
        const tabsOf = ()=> [...document.querySelectorAll('#view-play .play-subtabs:not([hidden]) [data-playtab]')].map(b=> b.dataset.playtab);
        homeGo('play', 'raid'); await wait(700); out.dr = {tabs: tabsOf(), map: !!document.getElementById('nav1MapBtnPlay'), arena: !!document.getElementById('arenaNavBtnPlay')};
        document.getElementById('nav1MapBtnPlay').click(); await wait(700); out.toMap = playSubTab;
        out.conq = {tabs: tabsOf(), dr: !!document.getElementById('nav1DrBtnPlay')};
        homeGo('play', 'arena'); await wait(700); out.arena = {tabs: tabsOf(), map: !!document.getElementById('nav1MapBtnPlay')};
        switchTab('home'); await wait(200); return out; })()`);
      ok(['play', 'homeArenaBtn', 'homeRaidBtn', 'deck', 'shop', 'codex'].every(x=> r.tiles.includes(x)), `${t} Home tiles are the pages (${r.tiles})`);
      ok(r.tethered && r.sameW, `${t} the notes sit on one board under the tiles, the grid's width, one size (${r.tethered}, ${r.sameW})`);
      ok(r.camp.join() === 'deck,forge,nest,stomp,inventory' + (r.wp ? ',paths' : ''), `${t} the Camp bar: Camp, Forge, Nest, Stomping Grounds, Inventory, Wildpaths once open (${r.camp}; Wildpaths open: ${r.wp})`);
      ok(r.forge && r.backToCamp === 'deck' && r.nestToCamp === 'deck', `${t} Camp -> Forge -> back to Camp; Nest -> Camp (${r.forge}, ${r.backToCamp}, ${r.nestToCamp})`);
      ok(r.codex, `${t} the Codex is its own page (Browse, no Camp bar)`);
      ok(r.shop && r.premium && r.backToShop, `${t} the Shop page: Shop | Premium tabs, the buy counter shown, nothing bought (${r.shop}, ${r.premium}, ${r.backToShop})`);
      ok(!r.dr.tabs.includes('conquest') && !r.dr.tabs.includes('arena') && r.dr.map && r.dr.arena && r.toMap === 'conquest', `${t} Dungeons & Raids: its own tabs only; 🗺️ and 🏟️ in the corner (${JSON.stringify(r.dr)}, ${r.toMap})`);
      ok(!r.conq.tabs.includes('raid') && !r.conq.tabs.includes('arena') && r.conq.dr, `${t} Conquest: no Arena / Raid tabs; 🐲 in the corner (${JSON.stringify(r.conq)})`);
      ok(r.arena.tabs.length === 0 && r.arena.map, `${t} Arena: a page of its own (${JSON.stringify(r.arena)})`);
      await ctx.close();
    }
  } finally { await b.close(); }
  ok(errs.length === 0, 'no page errors ' + errs.slice(0, 2).join(' | '));
}
browser().then(()=>{ console.log(fail ? `nav1: ${fail} of ${n} checks FAILED` : `nav1: ${n} checks passed`); process.exit(fail ? 1 : 0); }, e=>{ console.log('  x browser part crashed:', e && e.stack || e); process.exit(1); });
