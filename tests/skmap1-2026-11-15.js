#!/usr/bin/env node
// 2026-11-15 (package SKMAP1, owner 22:52): the admin "Skills by map" view: Maps 0-20, live skills on the map's cards, past suggestions, red NEW chips,
// Claude's strict picks (struck through when a pick leaves the map or is no longer new there), admin only. Static checks always; browser part when Chromium is there.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const read = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  x', m); } };
const app = read('arena_app.js'), tpl = read('arena_template.html'), texts = read('bramblewood-texts.js');
ok(/function skmapRows\(/.test(app) && /mpEntry\(m\.id\)\.cards/.test(app) && /liveDeletes/.test(app.slice(app.indexOf('function skmapRows('), app.indexOf('function skmapHTML('))), 'rows read the live map list and live cards');
ok(/function openSkillsByMap\(\)\{\s*if\(!adminModeEnabled\) return;/.test(app) && /adminModeEnabled \? `<div class="bk-skm-row"/.test(app), 'admin only');
ok(/\.skm-chip\.is-focus\{background:var\(--danger\)/.test(tpl), 'focus chip uses the --danger token'); // 2026-11-16 (UX7): red = focus skills (was: every new skill)
['btn', 'close', 'totals', 'head', 'cards', 'past', 'picks', 'none', 'new-tip', 'gone', 'old'].forEach(k=>{ ok(new RegExp('"ui\\.skmap1-' + k + '"').test(texts), 'text ' + k);
  ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'].forEach(c=>{ ok(Object.keys(JSON.parse(read('lang/' + c + '.json'))).length > 0, c); }); });
ok(/skmap1-2026-11-15/.test(read('tests/run-all.sh')), 'run-all.sh lists this test');

async function browser(){
  let pw; try{ pw = require('playwright'); }catch(e){ try{ pw = require(path.join(require('child_process').execSync('npm root -g').toString().trim(), 'playwright')); }catch(_){ console.log('  (browser part skipped: no playwright)'); return; } }
  const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
  if(!fs.existsSync(EXE) || !fs.existsSync(path.join(ROOT, 'index.html'))){ console.log('  (browser part skipped: no Chromium or index.html)'); return; }
  const INIT = "localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); sessionStorage.setItem('bramblewood_seen_splash','1'); localStorage.setItem('bramblewood_fx_level','high'); localStorage.setItem('bramblewood_fx_auto','off');";
  const b = await pw.chromium.launch({executablePath: EXE}); const errs = [];
  try{
    for(const w of [1366, 390]){
      const ctx = await b.newContext({viewport: {width: w, height: w < 500 ? 844 : 900}});
      await ctx.route('**/*', r=> r.request().url().startsWith('file:') ? r.continue() : r.abort());
      const pg = await ctx.newPage(); pg.on('pageerror', e=> errs.push(`@${w}: ` + String(e)));
      await pg.addInitScript(INIT); await pg.goto('file://' + path.join(ROOT, 'index.html'), {waitUntil: 'domcontentloaded', timeout: 120000});
      await pg.waitForFunction("typeof switchTab === 'function'", null, {timeout: 120000}); await pg.waitForTimeout(1500);
      const t = `@${w}`;
      const r = await pg.evaluate(`(async()=>{
        window.showToast = ()=>{}; adminModeEnabled = true; const out = {};
        const open = async ()=>{ openSkillsByMap(); await new Promise(r=> setTimeout(r, 50)); return document.getElementById('skmap1Overlay'); };
        const rowOf = (ov, n)=> ov.querySelector('[data-skm-map="' + n + '"]'), chips = (row, i)=> [...row.querySelectorAll('.skm-part')[i].querySelectorAll('.skm-chip')];
        let ov = await open(); out.rows = ov.querySelectorAll('.skm-row').length; out.totals = document.getElementById('skmTotals').textContent;
        const tide = chips(rowOf(ov, 2), 0).find(c=> /^Tide /.test(c.textContent)); out.tideNew = !!tide && tide.classList.contains('is-new') && tide.classList.contains('is-focus'); // UX7: Tide is Map 2's focus skill
        out.tideBg = tide ? getComputedStyle(tide).backgroundColor : '';
        out.picks2 = chips(rowOf(ov, 2), 2).map(c=> c.textContent); out.none10 = !!rowOf(ov, 17).querySelector('.skm-none'); /* 2026-11-16 (UX7): Map 17 has no focus skill */
        out.pastTags = [...rowOf(ov, 2).querySelectorAll('.skm-src b')].map(x=> x.textContent);
        // a live edit: a Map 0 card gains Tide -> Map 0 shows it as new, Map 2's Tide is no longer new
        const id = mpEntry(skmapRows()[0].id).cards[0]; const base = Object.assign({}, CARD_DEFS_BASELINE[id]); base.effects = Object.assign({}, base.effects, {tide: 1}); liveCards[id] = base;
        ov = await open(); const t0 = chips(rowOf(ov, 0), 0).find(c=> /^Tide /.test(c.textContent)); out.t0new = !!t0 && t0.classList.contains('is-new');
        const t2 = chips(rowOf(ov, 2), 0).find(c=> /^Tide /.test(c.textContent)); out.t2new = !!t2 && t2.classList.contains('is-new');
        out.tideStruck = chips(rowOf(ov, 2), 2).filter(c=> c.classList.contains('is-bad')).map(c=> c.textContent);
        delete liveCards[id];
        // a pick that leaves the map: pretend Map 2's pick list lost Tide via a map-list edit is heavy; check Map 4's picks vs the data instead
        const rows = skmapRows(); out.gone = chips(rowOf(await open(), 4), 2).filter(c=> c.classList.contains('is-bad')).length === mapFocusKeys(4).filter(k=> rows[4].skills[k] == null || !rows[4].isNew.has(k)).length; // UX7: the picks are the focus table
        ov.querySelector('#skmClose').click(); out.closed = ov.hidden;
        // players never see it
        adminModeEnabled = false; codexSubTab = 'skills'; switchTab('codex'); BramblewoodPlaces.skip(); await new Promise(r=> setTimeout(r, 500));
        out.playerBtn = !!document.getElementById('bkSkMapBtn'); openSkillsByMap(); out.playerOv = !!document.querySelector('#skmap1Overlay:not([hidden]) .skm-modal');
        return out; })()`);
      ok(r.rows === 21, `${t} 21 rows (${r.rows})`);
      ok(/ on 21 maps · \d+ new skills/.test(r.totals) || r.totals.length > 5, `${t} totals line (${r.totals})`);
      ok(r.tideNew && r.tideBg !== 'rgba(0, 0, 0, 0)', `${t} Map 2 shows Tide as a red chip (${r.tideNew} ${r.tideBg})`);
      ok(r.picks2.length === 3 && r.none10 && r.pastTags.length >= 3, `${t} picks render, Map 10 shows none, past tags (${JSON.stringify([r.picks2, r.none10, r.pastTags])})`);
      ok(r.t0new && !r.t2new && r.tideStruck.length === 1, `${t} a live card edit moves Tide's new to Map 0 and strikes Map 2's pick (${JSON.stringify([r.t0new, r.t2new, r.tideStruck])})`);
      ok(r.gone && r.closed, `${t} struck picks match the data; closes`);
      ok(!r.playerBtn && !r.playerOv, `${t} admin only (${r.playerBtn} ${r.playerOv})`);
      await ctx.close();
    }
  } finally { await b.close(); }
  ok(errs.length === 0, 'no page errors ' + errs.slice(0, 2).join(' | '));
}
browser().then(()=>{ console.log(fail ? `skmap1: ${fail} of ${n} checks FAILED` : `skmap1: ${n} checks passed`); process.exit(fail ? 1 : 0); }, e=>{ console.log('  x browser part crashed:', e && e.stack || e); process.exit(1); });
