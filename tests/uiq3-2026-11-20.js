#!/usr/bin/env node
// 2026-11-20 (package UIQ3, owner 00:22): the card editor's map chips list only the maps whose list holds the card, and follow list edits while the editor is open.
// Static checks always run; the browser part runs when index.html and Chromium are there. Build first.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const read = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  x', m); } };
const app = read('arena_app.js');
ok(/function ceRefreshMapChips\(/.test(app) && /mpListeners\.add\(ceRefreshMapChips\)/.test(app), 'the chips row refreshes on every map list change (mpListeners)');
ok(/ui37Notify\(\); ceRefreshMapChips\(\);/.test(app) && /function cardMapListsOf\(/.test(app), 'a live map-picks row refreshes the chips too');
ok(!/mpMapById\(f \? f\.loc : mapIdAt\(n\)\)/.test(app), 'no chip from an obtain source alone (cardObtainMap)');
ok(/uiq3-2026-11-20/.test(read('tests/run-all.sh')), 'run-all.sh lists this test');

async function browser(){
  let pw; try{ pw = require('playwright'); }catch(e){ try{ pw = require(path.join(require('child_process').execSync('npm root -g').toString().trim(), 'playwright')); }catch(_){ console.log('  (browser part skipped: no playwright)'); return; } }
  const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
  if(!fs.existsSync(EXE) || !fs.existsSync(path.join(ROOT, 'index.html'))){ console.log('  (browser part skipped: no Chromium or index.html)'); return; }
  const INIT = "localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); sessionStorage.setItem('bramblewood_seen_splash','1');";
  const b = await pw.chromium.launch({executablePath: EXE}); const errs = [];
  try{
    const ctx = await b.newContext({viewport: {width: 1366, height: 900}});
    await ctx.route('**/*', r=> r.request().url().startsWith('file:') ? r.continue() : r.abort());
    const pg = await ctx.newPage(); pg.on('pageerror', e=> errs.push(String(e)));
    await pg.addInitScript(INIT); await pg.goto('file://' + path.join(ROOT, 'index.html'), {waitUntil: 'domcontentloaded', timeout: 120000});
    await pg.waitForFunction("typeof switchTab === 'function'", null, {timeout: 120000}); await pg.waitForTimeout(1500);
    const r = await pg.evaluate(`(async()=>{
      window.showToast = ()=>{}; adminModeEnabled = true; const id = 'cypress-root-lurker', out = {};
      const chips = ()=> [...document.querySelectorAll('#ceMapChips .ui52-first-map')].map(x=> x.textContent.replace(/[^\\x00-\\x7f]/g, '').replace(/\\s+/g, ' ').trim());
      const wait = ()=> new Promise(r=> setTimeout(r, 50));
      openCardEditor(id); await wait(); out.before = chips(); out.imgs0 = document.querySelectorAll('#ceMapChips img.emoji').length; const form = document.querySelector('#editorOverlay .modal'); const tag = document.getElementById('fCardId');
      // take the card out of every list (a live edit of each map's list), then put it back into one
      const tops = Object.keys(MAP_POOLS_BASE.maps), saved = JSON.stringify(mapPoolEdits);
      tops.forEach(t=>{ const e = mpEntry(t); const rm = a=> a.filter(x=> x !== id); mapPoolEdits[t] = {pool: {cards: rm(e.cards), special: rm(e.special), submaps: Object.fromEntries(Object.entries(e.submaps).map(([k, v])=> [k, rm(v)]))}, localAt: 0}; });
      mpChanged(); await wait(); out.none = chips();
      mapPoolEdits.m8.pool.cards.push(id); mpChanged(); await wait(); out.one = chips();
      mapPoolEdits.mu.pool.special.push(id); mpChanged(); await wait(); out.two = chips();
      mapPoolEdits.m8.pool.cards = mapPoolEdits.m8.pool.cards.filter(x=> x !== id); mpChanged(); await wait(); out.three = chips();
      out.sameForm = document.querySelector('#editorOverlay .modal') === form && document.getElementById('fCardId') === tag;
      mapPoolEdits = JSON.parse(saved); mpChanged(); await wait(); out.back = chips();
      // map-picks rows (the owner's Yes / No): a map with a row holds the card only when flagged Yes
      const mapIds = ()=> [...document.querySelectorAll('#ceMapChips [data-ui52-map]')].map(x=> x.dataset.ui52Map), had = ui37Picks.mw;
      ui37Picks.mw = {yes: [], no: [], t: {}, localAt: 0}; ceRefreshMapChips(); out.unflagged = mapIds();
      ui37SetFlag('mw', id, 'yes'); out.yes = mapIds();
      ui37SetFlag('mw', id, 'no'); out.no = mapIds();
      if(had) ui37Picks.mw = had; else delete ui37Picks.mw; ui37Save(); ceRefreshMapChips(); out.after = chips(); out.imgs1 = document.querySelectorAll('#ceMapChips img.emoji').length;
      closeCardEditor(); return out; })()`);
    // 2026-11-25 (TESTFIX11): MAPEXEC1 dropped the Black Caiman off Map 5's main list (it stays on Map 6's), so its chips start at Map 6
    ok(r.before.length >= 2 && /Map 6\b/.test(r.before[0]), 'before: the lists of Map 6 and later (' + JSON.stringify(r.before) + ')');
    ok(r.none.length === 1 && /No map|no map/i.test(r.none[0]) || r.none.length === 1 && !/Map \d/.test(r.none[0]), 'removed from every list: only the no-map pill (' + JSON.stringify(r.none) + ')');
    ok(r.one.length === 1 && /Map 6\b/.test(r.one[0]), 'added to Map 6: one chip, Map 6 (' + JSON.stringify(r.one) + ')');
    ok(r.two.length === 2 && /Map 6\b/.test(r.two[0]) && /Map 7\b/.test(r.two[1]) && /Special/i.test(r.two[1]), 'added to Map 7 Special: two chips in road order (' + JSON.stringify(r.two) + ')');
    ok(r.three.length === 1 && /Map 7\b/.test(r.three[0]), 'removed from Map 6: Map 7 is first (' + JSON.stringify(r.three) + ')');
    ok(r.sameForm, 'the rest of the form is not re-rendered');
    ok(!r.unflagged.includes('mw') && r.unflagged.includes('m8'), 'a map with a picks row and the card unflagged: no chip though the base list holds it (' + JSON.stringify(r.unflagged) + ')');
    ok(r.yes[0] === 'mw', 'Yes on Map 5: its chip, first (' + JSON.stringify(r.yes) + ')');
    ok(!r.no.includes('mw'), 'No on Map 5: the chip goes (' + JSON.stringify(r.no) + ')');
    ok(r.imgs1 === r.imgs0, 'the refreshed row has the first render\'s emoji image count, at once (' + r.imgs0 + ' / ' + r.imgs1 + ')');
    ok(JSON.stringify(r.after) === JSON.stringify(r.before), 'no picks row: the base list again (' + JSON.stringify([r.after, r.before]) + ')');
    ok(JSON.stringify(r.back) === JSON.stringify(r.before), 'restoring the lists restores the chips');
  } finally { await b.close(); }
  ok(errs.length === 0, 'no page errors ' + errs.slice(0, 2).join(' | '));
}
browser().then(()=>{ console.log(fail ? `uiq3: ${fail} of ${n} checks FAILED` : `uiq3: ${n} checks passed`); process.exit(fail ? 1 : 0); }, e=>{ console.log('  x browser part crashed:', e && e.stack || e); process.exit(1); });
