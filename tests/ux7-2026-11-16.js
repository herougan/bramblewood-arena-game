#!/usr/bin/env node
// 2026-11-16 (package UX7, owner 20:24): the Map cards window's "Skills on these cards" list: red = the map's focus skills only (MAP_FOCUS_SKILLS, the one table the Skills by map view shares),
// order: red focus on main cards, normal, new-but-not-focus (small NEW!, no red), red-outlined focus not yet on a main card, counters, suggestions, special-only (muted). "N new" counts the red chips.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const read = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  x', m); } };
const app = read('arena_app.js'), tpl = read('arena_template.html');
ok(/const MAP_FOCUS_SKILLS = \{/.test(app) && !/SKMAP_PICKS/.test(app.replace(/\/\/.*$/gm, '')), 'one focus table; SKMAP_PICKS is gone');
ok(/__cfg:map-focus/.test(app), 'a live __cfg:map-focus row overrides (read only)');
ok(/mapFocusKeys\(r\.n\)/.test(app.slice(app.indexOf('function skmapHTML('), app.indexOf('function openSkillsByMap('))) && /mapFocusSet\(mapId \|\| top\)/.test(app), 'both views read the table');
ok(/\.ui19-sk\.is-focus\{border-color:#c62828/.test(tpl) && /\.ui19-new\.is-minor/.test(tpl), 'red for focus, a muted NEW! tag');
ok(/ux7-2026-11-16/.test(read('tests/run-all.sh')), 'run-all.sh lists this test');
const F = new Function(app.match(/const MAP_FOCUS_SKILLS = \{[^\n]*\n/)[0] + 'return MAP_FOCUS_SKILLS;')();
// 2026-11-19 (TESTFIX7): UIFIN (11-18) put REDESIGN3 v2's focus in the table: up to 5 a map, mapFocusKeys shows the first 3
ok(Object.keys(F).length === 21 && Object.values(F).every(a=> a.length <= 5) && /function mapFocusKeys\(n\)\{[^\n]*\.slice\(0, 3\)/.test(app), '21 maps, 0-5 focus skills each, 3 shown');
ok(F[0].join() === 'swarm,flying,nursing' && F[3].join() === 'pounce,swift,arrow' && F[19].join() === 'fireArrow' && F[20].join() === 'fireBolt', 'the REDESIGN3 v2 values');

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
    const r = await pg.evaluate(`(async()=>{
      adminModeEnabled = true; const out = {}, defs = getCardDefs(), mapId = mainConquestMaps()[3].id; // Map 3: arrow, swift, pounce
      const has = k=> Object.keys(defs).filter(id=> defs[id] && !defs[id].token && !defs[id].test && defs[id].effects && defs[id].effects[k] && skillValOn(defs[id].effects[k]));
      const only = (k, not)=> has(k).find(id=> !not.some(x=> defs[id].effects[x] && skillValOn(defs[id].effects[x])));
      const arrow = only('arrow', ['swift', 'pounce']), bleed = only('bleed', ['arrow', 'swift', 'pounce']), pounce = only('pounce', ['arrow', 'swift']);
      const html = ui19McSkillsHTML(mapId, [arrow, bleed], defs, ()=> true, mapId, [pounce]), box = document.createElement('div'); box.innerHTML = html;
      const tiles = [...box.querySelectorAll('.ui19-sk')], key = t=> t.dataset.ui19Skill || t.dataset.ui24Rec || t.dataset.ui34Counter || '';
      out.keys = tiles.map(key); out.red = tiles.filter(t=> t.classList.contains('is-focus')).map(key);
      out.cls = tiles.map(t=> t.classList.contains('is-focus-add') ? 'add' : t.classList.contains('is-focus') ? 'red' : t.classList.contains('is-counter') ? 'counter' : t.classList.contains('is-rec') || t.classList.contains('is-sugg') || t.classList.contains('ui30-sugg-tile') ? 'sugg' : t.classList.contains('is-other') ? 'other' : 'normal');
      out.newN = box.querySelector('[data-ui35-new]').dataset.ui35New; out.swift = key(tiles.find(t=> t.classList.contains('is-focus-add') && key(t) === 'swift') || tiles[0]);
      out.pounceOther = tiles.filter(t=> t.classList.contains('is-other') && key(t) === 'pounce').length;
      // minor NEW!: a main skill new on the map but not focus wears the small tag, no red
      const bl = tiles.find(t=> key(t) === 'bleed'); out.bleedMinor = !!bl && !!bl.querySelector('.ui19-new.is-minor') && !bl.classList.contains('is-focus');
      // the table is overridable
      mapFocusCfg = {3: ['bleed']}; const h2 = document.createElement('div'); h2.innerHTML = ui19McSkillsHTML(mapId, [arrow, bleed], defs, ()=> true, mapId, []);
      out.cfgRed = [...h2.querySelectorAll('.ui19-sk.is-focus')].map(key); mapFocusCfg = null;
      // a side map has no focus skills
      const sub = (typeof mpSubsOf === 'function' ? mpSubsOf(mapId) : [])[0]; out.subRed = sub ? mapFocusSet(sub.id).size : 0;
      return out; })()`);
    ok(r.red.includes('arrow') && r.red.includes('swift') && r.red.includes('pounce') && r.red.length === 3, /* 2026-11-19 (TESTFIX7): REDESIGN3 v2's Map 3 focus (UIFIN) */ `only the three focus skills are red (${r.red})`);
    ok(r.cls.indexOf('red') < r.cls.indexOf('normal') && r.cls.indexOf('normal') < r.cls.indexOf('add') && (r.cls.indexOf('counter') < 0 || r.cls.indexOf('add') < r.cls.indexOf('counter')) && (r.cls.indexOf('other') < 0 || r.cls.lastIndexOf('add') < r.cls.indexOf('other')) && r.cls.indexOf('sugg') > r.cls.lastIndexOf('add'), `red, normal, to-add, blue, muted order (${r.cls.join(',')})`);
    ok(r.newN === '3', `N new counts the red chips (${r.newN})`);
    ok(r.bleedMinor && r.pounceOther === 0, `a new non-focus skill keeps a muted tag; a focus skill leaves the muted group (${r.bleedMinor} ${r.pounceOther})`);
    ok(r.cfgRed.join() === 'bleed', `a map-focus row overrides (${r.cfgRed})`);
    ok(r.subRed === 0, 'a side map has no focus skills');
    await ctx.close();
  } finally { await b.close(); }
  ok(errs.length === 0, 'no page errors ' + errs.slice(0, 2).join(' | '));
}
browser().then(()=>{ console.log(fail ? `ux7: ${fail} of ${n} checks FAILED` : `ux7: ${n} checks passed`); process.exit(fail ? 1 : 0); }, e=>{ console.log('  x browser part crashed:', e && e.stack || e); process.exit(1); });
