#!/usr/bin/env node
// 2026-11-05 (package EDIT1, owner 23:35, the in-game card editor):
//   1 "+" on a skill row adds the level parameter inside the same row (no new row); the x takes it off again; Save writes levelSkills
//   2 Hatchling and Regeneration are editable and offered at Level 1 and up only (a Baby's Level 0 Hatchling is shown as it is and kept on Save);
//     the skills that were registered after SKILL_DEFS was built (Weapon Master, Pry, Bola, Anadromous, Lasso) are in the editor now
//   3 Species is a dropdown (a second one makes a hybrid; an existing value stays); the skills dropdown shows each skill's emoji
//   4 Storm's two numbers (Attack / Health, default 2 / 0) are fields, saved as stormGrant, and the engine reads the card's numbers (default if none)
// Static checks always run; the browser part (Playwright, Chromium) runs when index.html and Chromium are there, at 1366 and 390,
// shots in tests/out/edit1/ (a few kept in docs/screens/EDIT1/). Nothing leaves the page. Build first (python3 assemble_arena.py).
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const read = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const app = read('arena_app.js'), engine = read('bramblewood-engine.js'), texts = read('bramblewood-texts.js');
const CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];

// ---- static
['ui.edit1-add-lv', 'ui.edit1-rm-lv', 'ui.edit1-species2', 'ui.edit1-none', 'ui.edit1-attack', 'ui.edit1-health'].forEach(k=> ok(texts.includes('"' + k + '"'), 'TX key ' + k));
{ const {TEXT} = require(path.join(ROOT, 'bramblewood-texts.js'));
  ['ui.edit1-add-lv', 'ui.edit1-rm-lv', 'ui.edit1-species2', 'ui.edit1-none'].forEach(k=>{ const en = TEXT[k];
    CODES.forEach(c=>{ const pack = JSON.parse(read('lang/' + c + '.json')); ok(en && pack[en] && pack[en] !== en, `${c} translates "${en}"`); }); }); }
ok(/function en6StateGrant\(k, e\)\{ const s = EN6_STATES\[k\], g = e && e\[s\.grant\]; return g && typeof g === 'object' && Object\.keys\(g\)\.length \? g : s\.dflt; \}/.test(engine), 'the engine reads a Storm unit\'s own stormGrant, with +2/+0 as the default (no engine edit needed)');
ok(/dflt:\{attack: 2\}, +on: \(\)=> en6Storm\(\)/.test(engine), 'the engine\'s Storm default is still +2/+0');
ok(/^## 2026-11-05 Package EDIT1/m.test(read('docs/CHANGELOG.md')), 'CHANGELOG entry');
ok(/tests\/edit1-2026-11-05\.js/.test(read('tests/run-all.sh')), 'in run-all.sh');

async function browser(){
  let pw; try{ pw = require('playwright'); }catch(e){ console.log('  (browser part skipped: no playwright)'); return; }
  const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
  if(!fs.existsSync(EXE) || !fs.existsSync(path.join(ROOT, 'index.html'))){ console.log('  (browser part skipped: no Chromium or index.html)'); return; }
  const OUT = path.join(ROOT, 'tests', 'out', 'edit1'); fs.mkdirSync(OUT, {recursive: true});
  const URL = 'file://' + path.join(ROOT, 'index.html');
  const INIT = "localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); localStorage.setItem('bramblewood_world_open_v1','1'); sessionStorage.setItem('bramblewood_seen_splash','1');";
  const b = await pw.chromium.launch({executablePath: EXE});
  const errs = [];
  try{
    for(const w of [1366, 390]){
      const ctx = await b.newContext({viewport:{width:w, height: w < 500 ? 844 : 900}, hasTouch: w < 500});
      await ctx.route('**/*', r=> r.request().url().startsWith('file:') ? r.continue() : r.abort());
      const pg = await ctx.newPage(); pg.on('pageerror', e=> errs.push(`@${w}: ` + String(e)));
      await pg.addInitScript(INIT); await pg.goto(URL, {waitUntil:'domcontentloaded', timeout:90000}); await pg.waitForTimeout(2500);
      await pg.addStyleTag({content: '.toast, .toast-host, #toastHost, .xp-float, #signInBanner{display:none !important;}'});
      await pg.evaluate("adminModeEnabled = true; document.body.classList.toggle('is-admin', true); 1");
      const open = async id=>{ await pg.evaluate(`closeCardEditor(); openCardEditor('${id}')`); await pg.waitForTimeout(500); };
      const rows = ()=> pg.evaluate("document.querySelectorAll('#skillRows .skill-row, #evergreenRows .skill-row').length");
      const shot = async (name, sel)=>{ const el = await pg.$(sel); if(!el) return; await el.evaluate(e=> e.scrollIntoView({block:'center'})); await pg.waitForTimeout(150); await el.screenshot({path: path.join(OUT, `${name}-${w}.png`)}); };

      // ---- 1 "+" is a level box in the same row
      await open('tunnel-ant');
      const r0 = await rows();
      const sw = await pg.evaluate("(()=>{ const row = [...document.querySelectorAll('#skillRows .skill-row')].find(r=> r.querySelector('[data-sk=key]').value === 'swarm'); const i = row.querySelector('[data-sk=key]').getAttribute('data-i'); return {i, hidden: row.querySelector('.sk-lv').hidden, plus: !!row.querySelector('[data-addskillrow]')}; })()");
      ok(sw.hidden && sw.plus, `@${w} before: Swarm has a "+" and no Lv box`);
      await pg.click(`[data-addskillrow="${sw.i}"]`); await pg.waitForTimeout(300);
      ok(await rows() === r0, `@${w} "+" adds no row (${r0} rows)`);
      const aft = await pg.evaluate(`(()=>{ const row = document.querySelector('#skillRows .skill-row:has([data-addskillrow="${sw.i}"]), #skillRows .skill-row:has([data-rmlv="${sw.i}"])'); const lv = row && row.querySelector('[data-sk=lv]'); return {shown: !!lv && !lv.closest('.sk-lv').hidden, val: lv && lv.value, plus: !!(row && row.querySelector('[data-addskillrow]')), rm: !!(row && row.querySelector('[data-rmlv]'))}; })()`);
      ok(aft.shown && aft.val === '2' && !aft.plus && aft.rm, `@${w} after "+": the Lv box (2: Swarm is a Level 1 card's base skill) is in the same row, with an x, and the "+" is gone ${JSON.stringify(aft)}`);
      await shot('skill-row-after-plus', '#skillRows');
      let sv = await pg.evaluate("(()=>{ const d = readEditorFormIntoCard(); return {fx: d.effects.swarm, ls: d.levelSkills}; })()");
      ok(sv.fx === undefined && sv.ls && sv.ls['2'] && sv.ls['2'].swarm, `@${w} Save writes Swarm under levelSkills 2 only ${JSON.stringify(sv)}`);
      await open('tunnel-ant'); // the form was read into the card above: reopen to undo
      await pg.click(`[data-addskillrow="${sw.i}"]`); await pg.waitForTimeout(200);
      await pg.click(`[data-rmlv="${sw.i}"]`); await pg.waitForTimeout(200);
      sv = await pg.evaluate("(()=>{ const d = readEditorFormIntoCard(); return {fx: d.effects.swarm, ls: d.levelSkills}; })()");
      ok(sv.fx && !sv.ls && await rows() === r0, `@${w} the x takes the level off again: Swarm is a base skill, no levelSkills`);

      // ---- 2 Hatchling / Regeneration at Level 1 and up
      await open('compost-grub');
      const hg = await pg.evaluate("[...document.querySelectorAll('#skillRows .skill-row')].map(r=> ({k: r.querySelector('[data-sk=key]').value, lv: r.querySelector('.sk-lv').hidden ? null : r.querySelector('[data-sk=lv]').value, opts: [...r.querySelectorAll('[data-sk=lv] option')].map(o=> o.value).join(',')}))");
      // 2026-11-06 ENG25 moved every Baby's Hatchling to levelSkills 1, so the row shows Lv 1
      ok(hg.length === 1 && hg[0].k === 'hatchling' && hg[0].lv === '1', `@${w} a Baby's Hatchling has a row, at Lv 1 ${JSON.stringify(hg)}`);
      sv = await pg.evaluate("(()=>{ const d = readEditorFormIntoCard(); return {fx: d.effects.hatchling, ls: d.levelSkills}; })()");
      ok(sv.fx === undefined && sv.ls && sv.ls['1'] && sv.ls['1'].hatchling === true && !(sv.ls['0'] && sv.ls['0'].hatchling), `@${w} Save keeps it at Level 1, unchanged ${JSON.stringify(sv)}`);
      await open('compost-grub');
      await pg.click('#addSkill'); await pg.waitForTimeout(250);
      for(const key of ['regen']){ // 2026-11-06 ENG25: the Baby already has Hatchling; Regeneration is a passive now
        const i = (await rows()) - 1; // the new row is the last one
        const info = await pg.evaluate(`(()=>{ const rs = [...document.querySelectorAll('#skillRows .skill-row, #evergreenRows .skill-row')]; const r = rs[rs.length - 1]; const sel = r.querySelector('[data-sk=key]'); return {cat: r.closest('#evergreenRows') ? 'evergreen' : 'passive', opt: !![...sel.options].find(o=> o.value === '${key}')}; })()`);
        // the key dropdown of the new (passive) row; regen is an evergreen skill: use the Evergreen "+" for it
        const sel = '#skillRows .skill-row:last-child [data-sk=key]';
        const has = await pg.evaluate(`!![...document.querySelector('${sel}').options].find(o=> o.value === '${key}')`);
        ok(has, `@${w} ${key} is in the skills dropdown`);
        await pg.selectOption(sel, key); await pg.waitForTimeout(300);
        const row = await pg.evaluate(`(()=>{ const r = document.querySelector('#skillRows .skill-row:last-child'); return {k: r.querySelector('[data-sk=key]').value, lv: r.querySelector('.sk-lv').hidden ? null : r.querySelector('[data-sk=lv]').value, opts: [...r.querySelectorAll('[data-sk=lv] option')].map(o=> o.value).join(','), plus: !!r.querySelector('[data-addskillrow]'), rm: !!r.querySelector('[data-rmlv]')}; })()`);
        ok(row.k === key && row.lv === '1' && !/(^|,)0(,|$)/.test(row.opts) && !row.plus && !row.rm, `@${w} a new ${key} on a Level 0 card arrives at Lv 1; the Lv box has no 0, no "+", no x ${JSON.stringify(row)}`);
      }
      await shot('hatchling-regen-level0', '#skillRows');
      sv = await pg.evaluate("(()=>{ const d = readEditorFormIntoCard(); return {ef: Object.keys(d.effects), ls: d.levelSkills}; })()");
      ok(sv.ls && sv.ls['1'] && sv.ls['1'].hatchling === true && sv.ls['1'].regen > 0, `@${w} Save: Hatchling and the new Regeneration are under Level 1 ${JSON.stringify(sv.ls)}`);
      await open('bog-behemoth');
      const rg = await pg.evaluate("[...document.querySelectorAll('#evergreenRows .skill-row, #skillRows .skill-row')].map(r=> ({k: r.querySelector('[data-sk=key]').value, v: (r.querySelector('[data-sk=val]') || {}).value}))");
      ok(rg.some(x=> x.k === 'regen' && x.v === '3'), `@${w} Regeneration 3 is an editable row on a card that has it ${JSON.stringify(rg)}`);
      await shot('regen-row', '#skillRows');
      const late = await pg.evaluate("['weaponMaster', 'pry', 'bola', 'anadromous', 'lasso', 'hatchling', 'regen', 'storm'].filter(k=> !SKILL_DEFS.some(s=> s.key === k))");
      ok(late.length === 0, `@${w} every registered skill is in the editor's list (missing: ${late.join(', ') || 'none'})`);
      const lost = await pg.evaluate("PASSIVE_DEFS.filter(p=> !SKILL_DEFS.some(s=> s.key === p.key)).map(p=> p.key)");
      ok(lost.length === 0, `@${w} no PASSIVE_DEFS skill is missing from SKILL_DEFS (${lost.join(', ')})`);
      await open('armory');
      ok(await pg.evaluate("[...document.querySelectorAll('#skillRows .skill-row')].some(r=> r.querySelector('[data-sk=key]').value === 'weaponMaster')"), `@${w} Weapon Master (Armory) has a row`);

      // ---- 3 Species dropdown, skills dropdown with emoji
      await open('tunnel-ant');
      const sp = await pg.evaluate("(()=>{ const a = document.getElementById('fSpecies'), b = document.getElementById('fSpecies2'); return {tag: a.tagName, tag2: b.tagName, n: a.options.length, val: a.value, cur: editingCard.species, hasCur: [...a.options].some(o=> o.value === a.value)}; })()");
      ok(sp.tag === 'SELECT' && sp.tag2 === 'SELECT' && sp.n > 20 && sp.hasCur && sp.val === sp.cur[0], `@${w} Species is a dropdown of ${sp.n} species with the card's own selected ${JSON.stringify(sp)}`);
      await pg.selectOption('#fSpecies2', 'Bird'); await pg.waitForTimeout(100);
      ok(await pg.evaluate("document.getElementById('fSpeciesIco').innerHTML.length > 0"), `@${w} the species icon follows the pick`);
      let c1 = await pg.evaluate("readEditorFormIntoCard().species");
      ok(c1.length === 2 && c1[1] === 'Bird', `@${w} two picks save as a hybrid ${JSON.stringify(c1)}`);
      await pg.selectOption('#fSpecies2', ''); c1 = await pg.evaluate("readEditorFormIntoCard().species");
      ok(c1.length === 1, `@${w} "none" in the second dropdown leaves one species ${JSON.stringify(c1)}`);
      await open('tunnel-ant'); await pg.evaluate("document.getElementById('fSpecies').size = 8; document.getElementById('fSpecies2').style.display = 'none'; 1"); await shot('species-dropdown', '.species-field'); await pg.evaluate("document.getElementById('fSpecies').size = 1; document.getElementById('fSpecies2').style.display = ''; 1");
      const em = await pg.evaluate("(()=>{ const sel = document.querySelector('#skillRows [data-sk=key]'); const o = [...sel.options].map(o=> o.textContent.trim()); const bare = o.filter(t=> /^[A-Za-z]/.test(t)); return {n: o.length, bare: bare.slice(0, 5), sample: o.slice(0, 4)}; })()");
      ok(em.n > 50 && em.bare.length === 0, `@${w} every skill in the dropdown opens with an emoji (${em.n} options; bare: ${em.bare.join(', ') || 'none'}) e.g. ${em.sample.join(' | ')}`);
      await pg.evaluate("{ const s = document.querySelector('#skillRows [data-sk=key]'); s.size = 10; s.style.height = 'auto'; } 1"); await shot('skills-dropdown', '#skillRows .skill-row');
      await pg.evaluate("{ const s = document.querySelector('#skillRows [data-sk=key]'); s.size = 1; } 1");

      // ---- 4 Storm N / M
      await open('static-fennec');
      const st = await pg.evaluate("(()=>{ const r = [...document.querySelectorAll('#skillRows .skill-row')].find(r=> r.querySelector('[data-sk=key]').value === 'storm'); if(!r) return null; return {v0: r.querySelector('[data-sk=val0]').value, v1: r.querySelector('[data-sk=val1]').value, ph: [r.querySelector('[data-sk=val0]').placeholder, r.querySelector('[data-sk=val1]').placeholder]}; })()");
      ok(st && st.v0 === '2' && st.v1 === '0', `@${w} Storm shows its two numbers, default 2 / 0 ${JSON.stringify(st)}`);
      await shot('storm-fields', '#skillRows');
      const setStorm = async (a, h)=> pg.evaluate(`(()=>{ const r = [...document.querySelectorAll('#skillRows .skill-row')].find(r=> r.querySelector('[data-sk=key]').value === 'storm'); r.querySelector('[data-sk=val0]').value = '${a}'; r.querySelector('[data-sk=val1]').value = '${h}'; const d = readEditorFormIntoCard(); const o = {storm: d.effects.storm, g: d.effects.stormGrant}; return o; })()`);
      let s1 = await setStorm(3, 1); ok(s1.storm === true && s1.g && s1.g.attack === 3 && s1.g.health === 1, `@${w} 3 / 1 saves as stormGrant {attack 3, health 1} ${JSON.stringify(s1)}`);
      await open('static-fennec'); s1 = await setStorm(0, 2); ok(s1.storm === true && s1.g && s1.g.health === 2 && !s1.g.attack, `@${w} 0 / 2 saves as stormGrant {health 2} ${JSON.stringify(s1)}`);
      await open('static-fennec'); s1 = await setStorm(2, 0); ok(s1.storm === true && s1.g === undefined, `@${w} 2 / 0 is the default: plain Storm, no stormGrant ${JSON.stringify(s1)}`);
      // the card's numbers come back into the fields
      await open('static-fennec'); await setStorm(4, 3);
      const back = await pg.evaluate("(()=>{ const d = JSON.parse(JSON.stringify(editingCard)); closeCardEditor(); openCardEditor('static-fennec', d); const r = [...document.querySelectorAll('#skillRows .skill-row')].find(r=> r.querySelector('[data-sk=key]').value === 'storm'); return [r.querySelector('[data-sk=val0]').value, r.querySelector('[data-sk=val1]').value]; })()");
      ok(back[0] === '4' && back[1] === '3', `@${w} the saved numbers show again ${JSON.stringify(back)}`);

      // ---- the whole editor still saves a card as it was (no card changed by merely reading the form)
      for(const id of ['tunnel-ant', 'teatime-toad', 'snapper-hatchling', 'fulmar-spitter', 'compost-grub', 'armory']){
        await open(id);
        const same = await pg.evaluate(`(()=>{ const empty = v=> v == null || (Array.isArray(v) && !v.length) || (typeof v === 'object' && !Array.isArray(v) && !Object.keys(v).length); const canon = v=> empty(v) ? null : Array.isArray(v) ? v.map(canon) : (typeof v === 'object') ? Object.fromEntries(Object.keys(v).sort().filter(k=> !empty(v[k])).map(k=> [k, canon(v[k])])) : v; const before = JSON.parse(JSON.stringify(rawCardDef('${id}'))); const d = readEditorFormIntoCard(); const a = JSON.stringify(canon([d.effects, d.levelSkills || null, d.species])), z = JSON.stringify(canon([before.effects, before.levelSkills || null, before.species])); return a === z || a + ' vs ' + z; })()`);
        ok(same === true, `@${w} ${id}: reading the form back changes nothing (${same === true ? 'same' : String(same).slice(0, 200)})`);
      }
      if(w === 1366){ await open('compost-grub'); await pg.screenshot({path: path.join(OUT, 'editor-full-1366.png')}); }
      await ctx.close();
    }
  } finally { await b.close(); }
  ok(errs.length === 0, 'no page errors: ' + errs.slice(0, 3).join(' | '));
}
browser().then(()=>{ console.log(fail ? `edit1-2026-11-05: ${fail} FAILED of ${n}` : `edit1-2026-11-05: all ${n} checks passed`); process.exit(fail ? 1 : 0); }, e=>{ console.log('  ✗ browser part crashed:', e && e.message); process.exit(1); });
