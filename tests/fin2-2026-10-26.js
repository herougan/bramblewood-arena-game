#!/usr/bin/env node
// 2026-10-26 (package FIN2, the owner's 10-26 23:46 list):
//   FIN2-b "The card edit - doesn't work anymore": ENG9's sk1Patch(PASSIVE_DEFS, 'render', ...) pushed a label-less stub (Render lives in
//          ACTIVE_PRESETS), so the card editor threw on open (its skill picker sorts by label) and Render left the Codex. The browser part
//          opens the editor on every card, reads the form back, saves as a cloud admin with Supabase stubbed (no request leaves the page),
//          and checks the fields a Save used to drop (a trigger's whenReady / once, an action the list lacks, effects with no "+ Add Skill" row).
//   FIN2-a "Bramble Armor: Fortify instead.": the name in the TX texts and the 12 packs (engine key brambleArmor kept), not Fortification's word.
//   FIN2-c "Shield should be valued less than health. E.g. maybe 0.8": a unit's own Shield N is 0.8 x N Health in both caps' stat terms
//          (bramblewood-budget.js shieldHealthOf, skill-costs.json budget.shieldPerHealth, its skill price 0); the cards it moved re-fit.
// Static and VM checks always run; the browser part (Playwright, Chromium at /opt/pw-browsers) runs when index.html and Chromium are there.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const {TEXT} = require(path.join(ROOT, 'bramblewood-texts.js'));
const BB = require(path.join(ROOT, 'bramblewood-budget.js')), SC = require(path.join(ROOT, 'tools', 'skill_costs.js'));
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];

// ---- FIN2-b (static): the stub can't come back
ok(/function sk1Patch\(list, key, patch\)\{[^\n]*else if\(patch && typeof patch\.label === 'string'\) list\.push/.test(src), 'b. sk1Patch adds an entry only with a label');
ok(/sk1Patch\(ACTIVE_PRESETS, 'render', \{codexNote:TX\('ui\.eng9-render-codex'\)\}\)/.test(src) && !/sk1Patch\(PASSIVE_DEFS, 'render'/.test(src), 'b. Render\'s Codex note is patched onto ACTIVE_PRESETS');
ok(/\.\.\.ACTIVE_PRESETS\.map\(p=>\(\{\n\s*key:p\.key, category:p\.category, label:p\.label, kind:[^\n]*codexNote:p\.codexNote/.test(src), 'b. SKILL_DEFS carries an active preset\'s codexNote');

// ---- FIN2-a: Fortify
ok(TEXT['ui.skn-bramble-armor'] === 'Fortify', 'a. the skill is called Fortify');
ok(!Object.keys(TEXT).some(k=> /Bramble Armor/.test(TEXT[k])), 'a. no TX text says Bramble Armor');
ok(/Rampart and Fortify still cut it/.test(TEXT['ui.sk-breach-codex']) && /Rampart and Fortify still cut it/.test(TEXT['ui.sk-shot-bramble-codex']) && /fortifies its bramble/.test(TEXT['ui.en3-log-bramble-armor']), 'a. the other skills\' texts and the log say Fortify');
ok(TEXT['ui.sk2n-fortification'] === 'Fortification', 'a. Fortification (SK2) keeps its name');
ok(/brambleArmor/.test(fs.readFileSync(path.join(ROOT, 'bramblewood-engine.js'), 'utf8')), 'a. the engine key brambleArmor is kept');
{ const peel = s=> s.replace(/^[^\w{(\[]+\s/, ''), keys = [TEXT['ui.skn-bramble-armor'], TEXT['ui.sk-breach-codex'], TEXT['ui.sk-shot-bramble-codex'], peel(TEXT['ui.en3-log-bramble-armor'])];
  CODES.forEach(c=>{ const p = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', c + '.json'), 'utf8'));
    ok(keys.every(k=> p[k]), `a. lang/${c}.json has the Fortify texts`);
    ok(!Object.keys(p).some(k=> /Bramble Armor/.test(k)), `a. lang/${c}.json has no Bramble Armor row left`);
    ok(p['Fortify'] !== p['Fortification'], `a. lang/${c}.json: Fortify (${p['Fortify']}) is not Fortification's word (${p['Fortification']})`);
    ok(/\{name\}/.test(p[keys[3]] || ''), `a. lang/${c}.json keeps {name} in the log line`); }); }

// ---- FIN2-c: Shield as 0.8 Health
const table = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')), T = SC.make(table);
ok(BB.DEFAULTS.shieldPerHealth === 0.8 && table.budget.shieldPerHealth === 0.8, 'c. shieldPerHealth 0.8 in the helper and skill-costs.json');
ok(BB.shieldHealthOf({shield: 3}) === 2.4 && BB.shieldHealthOf({shield: true}) === 0.8 && BB.shieldHealthOf({}) === 0, 'c. Shield N is 0.8 x N Health');
{ const a = BB.capScores(2, 3, 1, {shield: 5}), b = BB.capScores(2, 7, 1, {}); ok(a.x1 === b.x1 && a.x2 === b.x2 && a.sh === 4, `c. Shield 5 on a 2/3 = a 2/7 in both caps (${JSON.stringify([a, b])})`);
  const o = BB.capScores(2, 3, 1, null, null, {sh: 4}); ok(o.x1 === a.x1 && o.x2 === a.x2, 'c. opts.sh for a caller without the effects (the game\'s sbCheck)'); }
ok(T.skillCost('shield', 3) === 0 && T.cardS({shield: 3}).S === 0, 'c. Shield costs nothing in S');
ok(BB.contextS('tideGrant', {flood: {shield: 5}}, ()=> 0).inner === 4, 'c. a Shield in braces counts as 0.8 Health there too');
ok(/sbCheck\(A, D, S, N, M, F, SH\)/.test(src) && /c = sbCheck\(A, D, S, N, M, F, SH\)/.test(src) && /sbCheck\(A, D, S, N, M, F, sbShieldH\(d\)\)/.test(src), 'c. the game\'s budget panel and Stat budget pass the Shield');
{ const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8')), by = id=> cards.find(c=> c.id === id), st = c=> `${c.attack}/${c.health}`;
  const crab = by('tide-pool-crab'), conch = by('conch-crawler'), arm = by('armadillo-guard');
  ok(st(crab) === '1/3' && crab.effects.shield === 3 && crab.effects.armor === 1 && crab.effects.tide, `c. Tide Pool Crab 1/2 -> 1/3, its skills kept (${st(crab)})`);
  ok(st(conch) === '2/2', `c. Conch Crawler 1/1 -> 2/2 (${st(conch)})`);
  ok(st(arm) === '3/8', `c. Armadillo Guard kept at 3/8 (${st(arm)})`);
  // 2026-10-29 RELFIX3: a card out of play (on no map list, LISTFIX1's budgetHold 'unplaced') or waiting for the owner's re-fit ('pending') is
  // skipped and reported: its map term reads Map 0 until it is placed (armadillo-guard is on no list since THEME2 / THEME3)
  const HOLD = require(path.join(ROOT, 'tools', 'lib_map_pools.js')).budgetHold, held = [];
  [crab, conch, arm].forEach(c=>{ const b = T.budget(c); if(!b.ok && HOLD(c.id)){ held.push(c.id + ' ' + HOLD(c.id)); return; } ok(b.ok, `c. ${c.id} within both caps (${b.x1}/${b.N}, ${b.x2}/${b.N2})`); });
  const cb = T.budget(crab), up = T.budget(Object.assign({}, crab, {health: 4})); ok(cb.ok && !up.ok, 'c. the crab sits on its line: one more Health is over');
  const overSh = cards.filter(c=> c.effects && c.effects.shield && T.budget(c).ok === false && !c.token && !c.test), overHeld = overSh.filter(c=> HOLD(c.id));
  overHeld.forEach(c=> held.push(c.id + ' ' + HOLD(c.id)));
  ok(overSh.length === overHeld.length, `c. no shielded card over its budget (${overSh.filter(c=> !HOLD(c.id)).map(c=> c.id).join(', ')})`);
  if(held.length) console.log('  (held, not checked: ' + [...new Set(held)].join(', ') + ')'); }
ok(fs.existsSync(path.join(ROOT, 'docs', 'balance', 'fin2-shield-refit-2026-10-26.json')), 'c. the re-fit\'s moves are saved');
{ const dec = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'decisions.json'), 'utf8')).items.map(d=> d.id); ok(['FIN2-1', 'FIN2-2'].every(i=> dec.includes(i)), 'decisions FIN2-1, FIN2-2'); }
ok(/^## 2026-10-26 \(package FIN2/m.test(fs.readFileSync(path.join(ROOT, 'docs', 'CHANGELOG.md'), 'utf8').slice(0, 100000)), 'CHANGELOG entry near the top'); // 2026-10-29 RELFIX3: 100000 (was 40000; the 10-28 / 10-29 packages' entries sit above it)

// ---- browser
async function browser(){
  let pw; try{ pw = require('playwright'); }catch(e){ console.log('  (browser part skipped: no playwright)'); return; }
  const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
  if(!fs.existsSync(EXE) || !fs.existsSync(path.join(ROOT, 'index.html'))){ console.log('  (browser part skipped: no Chromium or index.html)'); return; }
  const b = await pw.chromium.launch({executablePath: EXE}), errs = [];
  try{
    const ctx = await b.newContext({viewport: {width: 1366, height: 900}});
    await ctx.route('**/*', r=> r.request().url().startsWith('file:') ? r.continue() : r.abort()); // nothing leaves the page
    const pg = await ctx.newPage(); pg.on('pageerror', e=> errs.push(String(e)));
    await pg.addInitScript("localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); localStorage.setItem('bramblewood_world_open_v1','1'); sessionStorage.setItem('bramblewood_seen_splash','1');");
    await pg.goto('file://' + path.join(ROOT, 'index.html'), {waitUntil: 'domcontentloaded', timeout: 90000}); await pg.waitForTimeout(2500);
    errs.length = 0;
    const defs = await pg.evaluate("({noLabel: SKILL_DEFS.concat(PASSIVE_DEFS).filter(x=> typeof x.label !== 'string').map(x=> x.key), render: SKILL_DEFS.filter(x=> x.key === 'render').length, fortify: (PASSIVE_DEFS.find(x=> x.key === 'brambleArmor') || {}).label})");
    ok(!defs.noLabel.length, `B b. every skill has a label (${defs.noLabel.join(', ')})`);
    ok(defs.render === 1, `B b. Render is one skill (${defs.render})`);
    ok(defs.fortify === 'Fortify', `B a. the editor lists Fortify (${defs.fortify})`);
    // every card opens in the editor, and a Save with no change keeps what the form can't show
    const rt = await pg.evaluate(`(()=>{ adminModeEnabled = true; const thrown = []; let opened = 0;
      for(const id of Object.keys(CARD_DEFS_BASELINE)){ try{ openCardEditor(id); opened++; readEditorFormIntoCard(); }catch(e){ thrown.push(id + ': ' + String(e).slice(0, 80)); } try{ closeCardEditor(); }catch(_){} }
      const keep = {}; const read = id=>{ openCardEditor(id); const c = readEditorFormIntoCard(); closeCardEditor(); return c.effects; };
      const t = id=> (read(id).triggers || []);
      keep.whenReady = t('scraper-of-skies').some(x=> x.whenReady === true); keep.once = t('nest').some(x=> x.once === true);
      keep.exileSelf = t('marsh-wisp').some(x=> x.do === 'exileSelf') && !t('marsh-wisp').some(x=> x.do === 'arrow');
      keep.onReadyGold = read('elder-willow').onReadyGold === 1; keep.scar = read('magma-titan').scar === 2; keep.devour = !!read('hollow-belly-rat').devour;
      return {n: Object.keys(CARD_DEFS_BASELINE).length, opened, thrown, keep}; })()`);
    ok(!rt.thrown.length && rt.opened === rt.n, `B b. the editor opens on all ${rt.n} cards (${rt.thrown.slice(0, 3).join(' | ')})`);
    Object.keys(rt.keep).forEach(k=> ok(rt.keep[k], `B b. a plain Save keeps ${k}`));
    // Save as a cloud admin, Supabase stubbed: the row goes to card_overrides and the card changes
    const sv = await pg.evaluate(`(async ()=>{ window.__rows = [];
      sbClient = {from: t=> ({upsert: async row=>{ window.__rows.push({t, row: JSON.parse(JSON.stringify(row))}); return {error: null}; }, select: ()=> ({gt: async ()=> ({data: [], error: null})})}), rpc: async ()=> ({data: true, error: null})};
      for(let i = 0; i < 50 && !cloudReady && typeof supabase !== 'undefined'; i++) await sleep(200); await sleep(300); // the page's own cloud start-up (its requests blocked) settles first
      cloudUserId = '00000000-0000-0000-0000-000000000000'; cloudIsAnonymous = false; cloudCardAdmin = true; adminModeEnabled = true; // a signed-in admin, so a later admin check keeps it (the stub's is_app_admin says true)
      openCardEditor('tide-pool-crab'); await sleep(300); const budget = (document.getElementById('ceBudget') || {}).textContent || '';
      const hp = document.getElementById('fHp'); const h0 = Number(hp.value); hp.value = String(h0 + 1); hp.dispatchEvent(new Event('input', {bubbles: true}));
      document.getElementById('btnSave').click();
      for(let i = 0; i < 50 && !(window.__rows.some(x=> x.row.id === 'tide-pool-crab') && document.getElementById('editorOverlay').hidden); i++) await sleep(200);
      const r = window.__rows.find(x=> x.row.id === 'tide-pool-crab');
      window.__dbg = {rows: window.__rows.map(x=> x.row.id), admin: cloudCardAdmin, sb: !!sbClient};
      return {dbg: window.__dbg, h0, budget, row: r && {t: r.t, health: r.row.data && r.row.data.health, deleted: r.row.deleted, by: r.row.updated_by, shield: r.row.data && r.row.data.effects && r.row.data.effects.shield},
        live: (liveCards['tide-pool-crab'] || {}).health, defs: getCardDefs()['tide-pool-crab'].health, closed: document.getElementById('editorOverlay').hidden}; })()`);
    ok(sv.row && sv.row.t === 'card_overrides' && sv.row.health === sv.h0 + 1 && sv.row.deleted === false && sv.row.shield === 3, `B b. Save writes the card_overrides row (${JSON.stringify(sv.row || sv.dbg)})`);
    ok(sv.live === sv.h0 + 1 && sv.defs === sv.h0 + 1 && sv.closed, `B b. the edit applies to the card and the editor closes (${JSON.stringify(sv)})`);
    ok(/\(2×1 \+ \(\d+ \+ 2\.4/.test(sv.budget),`B c. the editor's budget shows the Shield's Health share (${sv.budget.slice(0, 120)})`);
    const cx = await pg.evaluate("(()=>{ adminModeEnabled = true; skillBookMemo = null; const e = skillBookEntriesNow().find(x=> x.key === 'render'); return e ? e.find : ''; })()");
    ok(/daunt counter falls off/i.test(cx), `B b. Render is back in the Codex with its note (${cx.slice(0, 80)})`);
    ok(!errs.length, `B no page errors (${errs.slice(0, 2).join(' | ')})`);
    await ctx.close();
  } finally { await b.close(); }
}
browser().then(()=>{ console.log(`fin2-2026-10-26: ${n - fail}/${n} passed`); process.exit(fail ? 1 : 0); }, e=>{ console.log('  ✗ browser part threw', e); process.exit(1); });
