// 2026-11-20 (package UIQ2, owner 00:20): the Map cards window's "Skills on these cards": one colour meaning per tile.
// red = NEW! here, green = carried and recommended, blue = suggested but on none of these cards, grey = carried; focus = an outline + a Focus pill; Intro = a pill, not gold.
const fs = require('fs'), path = require('path'); const ROOT = path.join(__dirname, '..');
let fails = 0; const ok = (c, m)=>{ console.log((c ? 'PASS ' : 'FAIL ') + m); if(!c) fails++; };
const app = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8'), tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
ok(/\.ui19-sk\.is-new\{border-color:#c62828; background:#c62828/.test(tpl), 'NEW! tile: solid red');
ok(/\.ui19-sk\.is-have\{border-color:#2e8b57/.test(tpl), 'have + recommended tile: green');
ok(/\.ui19-sk\.is-focus\{outline:/.test(tpl) && !/\.ui19-sk\.is-focus\{border-color:#c62828/.test(tpl), 'focus is an outline, no longer red');
ok(!/is-intro' : ''\}" data-ui19-skill/.test(app) && /introPill/.test(app), 'Intro is a pill, not a tile class');
ok(/class="uiq2-legend"/.test(app), 'a legend sits above the tiles');
const T = fs.readFileSync(path.join(ROOT, 'bramblewood-texts.js'), 'utf8');
ok(['leg-new', 'leg-have', 'leg-sugg', 'leg-carried', 'pill-intro', 'pill-focus'].every(k=> T.includes('"ui.uiq2-' + k + '"')), 'the legend and pill texts exist');

async function browser(){
  let pw; try{ pw = require('playwright'); }catch(e){ try{ pw = require(path.join(require('child_process').execSync('npm root -g').toString().trim(), 'playwright')); }catch(_){ console.log('  (browser part skipped: no playwright)'); return; } }
  const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
  if(!fs.existsSync(EXE) || !fs.existsSync(path.join(ROOT, 'index.html'))){ console.log('  (browser part skipped: no Chromium or index.html)'); return; }
  const INIT = "localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); sessionStorage.setItem('bramblewood_seen_splash','1'); localStorage.setItem('bramblewood_fx_level','high');";
  const b = await pw.chromium.launch({executablePath: EXE}); const errs = [];
  try{
    const ctx = await b.newContext({viewport: {width: 1366, height: 900}});
    await ctx.route('**/*', r=> r.request().url().startsWith('file:') ? r.continue() : r.abort());
    const pg = await ctx.newPage(); pg.on('pageerror', e=> errs.push(String(e)));
    await pg.addInitScript(INIT); await pg.goto('file://' + path.join(ROOT, 'index.html'), {waitUntil: 'domcontentloaded', timeout: 120000});
    await pg.waitForFunction("typeof switchTab === 'function'", null, {timeout: 120000}); await pg.waitForTimeout(1500);
    const r = await pg.evaluate(`(()=>{
      adminModeEnabled = true; const defs = getCardDefs(), mapId = mainConquestMaps()[5].id, g = {main: Object.keys(defs).filter(id=> defs[id] && !defs[id].token && !defs[id].test && defs[id].effects && Object.keys(defs[id].effects).length).slice(0, 60), other: []}; // 2026-11-20: real Map 5 lists are empty in a fresh profile
      const box = document.createElement('div'); box.innerHTML = ui19McSkillsHTML(mapId, g.main, defs, ()=> true, mapId, g.other);
      const tiles = [...box.querySelectorAll('.ui19-sk')], c = t=> t.classList, has = (t, cls)=> c(t).contains(cls);
      const pills = t=> [...t.querySelectorAll('.ui35-pill, .ui28-sug, .ui30-sugg, .ui19-new')].map(p=> p.textContent.trim());
      return {dump: tiles.map(t=> t.className.replace('ui19-sk','').trim() + ' ' + (t.dataset.ui19Skill||t.dataset.ui24Rec||t.dataset.ui34Counter||'') + ' [' + pills(t).join(',') + ']'), n: tiles.length, legend: box.querySelectorAll('.uiq2-legend span').length,
        gold: tiles.filter(t=> has(t, 'is-intro')).length,
        newTiles: tiles.filter(t=> has(t, 'is-new')).map(t=> pills(t).includes('NEW!')),
        newNoRed: tiles.filter(t=> pills(t).includes('NEW!') && !has(t, 'is-new')).length,
        blueCarried: tiles.filter(t=> (has(t, 'is-rec') || has(t, 'is-sugg') || has(t, 'ui30-sugg-tile') || has(t, 'is-counter')) && (has(t, 'is-new') || has(t, 'is-have') || has(t, 'is-grey'))).length,
        greenNoPill: tiles.filter(t=> has(t, 'is-have') && !pills(t).some(x=> /Suggested|Counter|Sugg|Intro/.test(x))).length,
        intro: tiles.filter(t=> pills(t).includes('Intro')).length}; })()`);
    if(process.env.UIQ2_DEBUG) console.log(r.dump.join('\n'));
    ok(r.n > 0 && r.legend === 4, 'the panel has tiles and a four-part legend (' + r.n + ')');
    ok(r.gold === 0, 'no tile is gold (is-intro)');
    ok(r.newTiles.length > 0 && r.newTiles.every(Boolean) && r.newNoRed === 0, 'every NEW! tile is red and every red tile says NEW! (' + r.newTiles.length + ')');
    ok(r.blueCarried === 0, 'a blue tile is never also red, green or grey');
    ok(r.greenNoPill === 0, 'a green tile shows why it is recommended');
    ok(r.intro >= 1, 'the map keyword shows an Intro pill');
    await ctx.close();
  } finally { await b.close(); }
  ok(errs.length === 0, 'no page errors ' + errs.slice(0, 2).join(' | '));
}
browser().then(()=>{ console.log(fails ? fails + ' FAILED' : 'all ok'); process.exit(fails ? 1 : 0); }).catch(e=>{ console.log('FAIL ' + e); process.exit(1); });
