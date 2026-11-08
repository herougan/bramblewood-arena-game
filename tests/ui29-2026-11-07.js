#!/usr/bin/env node
// 2026-11-07 (package UI29, owner 09:04 / 09:10: "I need a pack editor page - similar UI to the map editor. It also shows Starter, Base, and Factions cards!"):
// the admin 📦 Pack editor (ui29OpenPackEditor). Static: the texts and 12 translations, the PACK_PLAN placeholder, the typeof-guarded hooks (Shop bar,
// each pack tile's 📦 Edit, the map admin bar's 📦 Packs), CSS, CHANGELOG, run-all, action items. Browser (Playwright, Chromium, 1366 and 390):
// every list opens, today's counts match canonical/pack-plan.json for the shop packs and the faction pools, the Pouch shows CONTENT16's 38 suggestions
// (20 adds, 15 zone moves, 3 moves in) and the Chest its proposed-out marks, ✓ / ✂ / Cut are picks in localStorage that Copy my picks and Export all
// report, live packs are unchanged, the Shop's Edit opens the editor without picking the shelf item. Build first. Nothing leaves the page.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const read = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const app = read('arena_app.js'), tpl = read('arena_template.html'), asm = read('assemble_arena.py');
const CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];
const PLAN = JSON.parse(read('canonical/pack-plan.json'));

// ---- static
{ const {TEXT} = require(path.join(ROOT, 'bramblewood-texts.js'));
  const keys = Object.keys(TEXT).filter(k=> k.startsWith('ui.ui29-'));
  ok(keys.length >= 40, `UI29 TX keys (${keys.length})`);
  const used = [...new Set((app.match(/TX\('ui\.ui29-[a-z0-9-]+'/g) || []).map(s=> s.slice(4, -1)))];
  used.forEach(k=> ok(TEXT[k], 'TX key used and defined: ' + k));
  const same = new Set(['➕ Extra', '📦 Packs', '📦 Edit', 'Base', 'pack', 'base', 'Special', 'Starter', 'starter', 'faction', 'special']); // a word some languages spell the same
  CODES.forEach(c=>{ const pack = JSON.parse(read('lang/' + c + '.json'));
    keys.forEach(k=>{ const en = TEXT[k]; ok(pack[en] && (pack[en] !== en || c === 'tl' || same.has(en)), `${c} translates "${en}"`);
      (en.match(/\{\w+\}/g) || []).forEach(ph=> ok(pack[en] && pack[en].includes(ph), `${c} keeps ${ph} in "${en}"`)); }); }); }
ok(/sub_once\(app_src, "__PACK_PLAN__"/.test(asm) && (app.match(/__PACK_PLAN__/g) || []).length === 1 && /canonical\/pack-plan\.json/.test(asm), 'PACK_PLAN is baked in through one build placeholder from canonical/pack-plan.json');
ok(/typeof ui29ShopBarHTML === 'function'/.test(app) && /typeof ui29ShelfEditHTML === 'function'/.test(app) && /typeof ui29WireShop === 'function'/.test(app) && /typeof ui29OpenPackEditor === 'function'/.test(app), 'the hooks are guarded with typeof');
ok(/id="mlPacks"/.test(app) && /on\('mlPacks'/.test(app), 'the map admin bar has 📦 Packs next to 🃏 Map cards');
ok(/\/\/ UI29_PE:START[\s\S]*\/\/ UI29_PE:END/.test(app), 'the editor lives in its own UI29_PE block');
ok(!/saveShopPacksOverride|cloudShopPacks\s*=/.test((app.match(/\/\/ UI29_PE:START[\s\S]*\/\/ UI29_PE:END/) || [''])[0]), 'the editor never writes a pack table');
ok(/\.ui29-cols\{/.test(tpl) && /\.ui29-shelf-edit\{/.test(tpl) && /\.ui29-nav-btn\.is-on\{/.test(tpl), 'CSS: columns, nav, the shelf Edit badge');
ok(/^## 2026-11-07[^\n]*UI29/m.test(read('docs/CHANGELOG.md')), 'CHANGELOG entry');
ok(/tests\/ui29-2026-11-07\.js/.test(read('tests/run-all.sh')), 'in run-all.sh');
ok(/^## 11-07: Package UI29 \(on its branch, not released\)/m.test(read('docs/action-items.md')), 'action-items section');
{ const d = JSON.parse(read('docs/decisions.json')), list = Array.isArray(d) ? d : (d.decisions || d.items || []);
  const mine = list.filter(x=> /^UI29-\d+$/.test(x.id || ''));
  ok(mine.length >= 1, 'a UI29-n decision');
  mine.forEach(x=>{ const words = String((x.body || x.text || '') + ' ' + JSON.stringify(x.options || '')).split(/\s+/).filter(Boolean).length; ok(words < 130, `${x.id}: short (${words} words with options)`); }); }

async function browser(){
  let pw; try{ pw = require('playwright'); }catch(e){ console.log('  (browser part skipped: no playwright)'); return; }
  const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
  if(!fs.existsSync(EXE) || !fs.existsSync(path.join(ROOT, 'index.html'))){ console.log('  (browser part skipped: no Chromium or index.html)'); return; }
  const URL = 'file://' + path.join(ROOT, 'index.html');
  const INIT = "localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); localStorage.setItem('bramblewood_world_open_v1','1'); sessionStorage.setItem('bramblewood_seen_splash','1');";
  const b = await pw.chromium.launch({executablePath: EXE});
  const errs = [];
  try{
    for(const w of [1366, 390]){
      const ctx = await b.newContext({viewport: {width: w, height: w < 500 ? 844 : 900}});
      await ctx.route('**/*', r=> r.request().url().startsWith('file:') ? r.continue() : r.abort());
      const pg = await ctx.newPage(); pg.on('pageerror', e=> errs.push(`@${w}: ` + String(e)));
      await pg.addInitScript(INIT); await pg.goto(URL, {waitUntil: 'domcontentloaded', timeout: 90000}); await pg.waitForTimeout(2500);
      await pg.addStyleTag({content: '.toast, .toast-host, #toastHost, .xp-float, #signInBanner{display:none !important;}'});
      // not an admin: nothing opens, no hooks drawn
      const guest = await pg.evaluate("(()=>{ adminModeEnabled = false; ui29OpenPackEditor('bronze'); const o = document.getElementById('ui29PackEditor'); return {open: !!(o && !o.hidden), bar: ui29ShopBarHTML(), edit: ui29ShelfEditHTML({id: 'bronze', name: 'x'})}; })()");
      ok(!guest.open && guest.bar === '' && guest.edit === '', `@${w} outside Admin Mode: no editor, no Shop button, no Edit`);
      await pg.evaluate("adminModeEnabled = true; document.body.classList.toggle('is-admin', true); 1");
      const before = await pg.evaluate("JSON.stringify(getShopPacks().map(p=> [p.id, packCardPool(null, p.pool || 1, true).length]))");
      const lists = await pg.evaluate(`(()=>{ const out = []; ui29Lists().forEach(l=>{ ui29OpenPackEditor(l.key); const o = document.getElementById('ui29PackEditor');
        out.push({key: l.key, plan: l.plan, kind: l.kind, on: (o.querySelector('.ui29-nav-btn.is-on') || {}).dataset ? o.querySelector('.ui29-nav-btn.is-on').dataset.ui29List : '', live: o.querySelectorAll('[data-ui29-sec=in] .ui29-tile').length,
          sug: o.querySelectorAll('[data-ui29-sec=sug] .ui29-tile').length, kinds: [...o.querySelectorAll('[data-ui29-sec=sug] .ui29-tile')].map(t=> t.dataset.ui29Kind), out: o.querySelectorAll('[data-ui29-sec=in] [data-ui29-out]').length,
          maps: (o.querySelector('[data-ui29-maps]') || {dataset: {}}).dataset.ui29Maps || '', zone: (o.querySelector('[data-ui29-zone]') || {dataset: {}}).dataset.ui29Zone || '', src: o.querySelectorAll('[data-ui29-sec=in] .ui29-src').length,
          from: [...o.querySelectorAll('[data-ui29-sec=in] [data-ui29-from]')].length, pow: o.querySelectorAll('.ui28-pow').length, title: (o.querySelector('#ui29ListTitle') || {}).textContent || ''}); document.getElementById('ui29Close').click(); }); return out; })()`);
      const keys = lists.map(l=> l.key);
      ok(['bronze', 'silver', 'gold', 'mystery', 'starter', 'base', 'otters', 'hummingbirds'].every(k=> keys.includes(k)) && keys.some(k=> /-adv$/.test(k)), `@${w} the left column: shop packs (with Collector packs), Starter, Base, Otters, Hummingbirds (${keys.join(',')})`);
      ok(keys.indexOf('starter') > keys.indexOf('gold') && keys.indexOf('base') > keys.indexOf('starter') && keys.indexOf('otters') > keys.indexOf('base') && keys.indexOf('hummingbirds') > keys.indexOf('otters'), `@${w} order: packs, then Starter, Base, Otters, Hummingbirds`);
      lists.forEach(l=>{ ok(l.on === l.key && l.live > 0, `@${w} ${l.key}: opens on itself with ${l.live} cards`); ok(l.src === l.live, `@${w} ${l.key}: every card has its source tag (${l.src}/${l.live})`); });
      ['bronze', 'silver', 'gold', 'mystery', 'pack4', 'otters', 'hummingbirds', 'shared', 'base'].forEach(k=>{ const l = lists.find(x=> x.key === k), p = PLAN.packs[k]; if(l && p) ok(l.live === p.current.count, `@${w} ${k}: ${l.live} cards today, as the plan counted (${p.current.count})`); });
      const B = lists.find(l=> l.key === 'bronze'), S = lists.find(l=> l.key === 'silver'), G = lists.find(l=> l.key === 'gold');
      ok(B.sug === 38 && B.kinds.filter(k=> k === 'add').length === 20 && B.kinds.filter(k=> k === 'zone').length === 15 && B.kinds.filter(k=> k === 'move').length === 3, `@${w} Pouch: 38 suggestions = 20 adds + 15 zone moves + 3 moves in (${B.sug})`);
      ok(B.maps === '0-6' && B.zone === 'A' && B.from === B.live && B.pow > 0, `@${w} Pouch: draws from Maps 0-6, proposed zone A, every card says map list or extra, power badges`);
      ok(S.out === 19 && S.sug === 21, `@${w} Chest: 19 proposed-out marks (15 zone + 4 removals), 21 suggestions (${S.out}, ${S.sug})`);
      ok(G.out === 1, `@${w} Case: Tide Spirit marked out (${G.out})`);
      ok(lists.find(l=> l.key === 'otters').kinds.join() === 'add' && lists.find(l=> l.key === 'hummingbirds').kinds.join() === 'add', `@${w} the faction sides show their one proposed add`);
      // picks
      const pk = await pg.evaluate(`(()=>{ localStorage.removeItem('bw_ui29_pack_picks_v1'); Object.keys(ui29Picks).forEach(k=> delete ui29Picks[k]);
        ui29OpenPackEditor('bronze'); const o = document.getElementById('ui29PackEditor');
        o.querySelector('[data-ui29-sec=sug] [data-ui29-act=accept]').click(); o.querySelectorAll('[data-ui29-sec=sug] [data-ui29-act=reject]')[1].click(); o.querySelector('[data-ui29-sec=in] [data-ui29-act=cut]').click();
        const counts = o.querySelector('#ui29Counts').textContent, acc = o.querySelectorAll('[data-ui29-sec=sug] .ui29-tile.is-flipped').length, rej = o.querySelectorAll('[data-ui29-sec=sug] .ui29-tile.ui29-rejected').length, cut = o.querySelectorAll('[data-ui29-sec=in] .ui29-tile.is-flipped').length;
        const keepTxt = o.querySelector('[data-ui29-sec=in] .ui29-tile.is-flipped [data-ui29-act=cut]').textContent;
        o.querySelector('#ui29Copy').click(); o.querySelector('#ui29Export').click();
        return {counts, acc, rej, cut, keepTxt, ls: JSON.parse(localStorage.getItem('bw_ui29_pack_picks_v1') || '{}'), copy: window.__ui29Last || '', exp: window.__ui29Export ? window.__ui29Export.json.lists.find(x=> x.list === 'bronze') : null, dl: o.querySelectorAll('[data-ui29-dl]').length}; })()`);
      ok(pk.acc === 1 && pk.rej === 1 && pk.cut === 1 && (pk.counts.match(/\d+/g) || []).join() === [PLAN.packs.bronze.current.count, PLAN.packs.bronze.current.count, PLAN.packs.bronze.proposedCount].join() /* 2026-11-08 (FIX10): read from the pack plan (was '50,50,88'; ENG37's Cormorant joined Pack 1, CONTENT18 regenerated the plan: 51 / 89) */, `@${w} ✓, ✂ and Cut mark tiles; the count line follows (${pk.counts})`);
      ok(pk.keepTxt.includes('Keep'), `@${w} a cut card offers ↩ Keep (${pk.keepTxt})`);
      ok(Object.values(pk.ls).sort().join() === 'accept,cut,reject' && Object.keys(pk.ls).every(k=> k.startsWith('bronze|')), `@${w} the picks are saved in this browser`);
      ok(/Hedgerow Pouch \[bronze\]: cut .+; accept .+; reject .+/.test(pk.copy), `@${w} Copy my picks: ${pk.copy}`);
      ok(pk.exp && pk.exp.cut.length === 1 && pk.exp.accept.length === 1 && pk.exp.reject.length === 1 && pk.exp.suggested.length === 38 && pk.dl === 2, `@${w} Export all: the picks, the suggestions, and .txt / .json downloads`);
      // add a card in Special, then remove it
      const sp = await pg.evaluate(`(()=>{ const o = document.getElementById('ui29PackEditor'); o.querySelector('#ui29Add').click(); const q = o.querySelector('.ff9-pk-q'); q.value = 'Yeti'; q.dispatchEvent(new Event('input'));
        const row = o.querySelector('.ff9-pk-row:not([disabled])'); if(row) row.click(); const added = o.querySelectorAll('[data-ui29-sec=special] .ui29-tile').length; const saved = (JSON.parse(localStorage.getItem('bw_ui29_pack_add_v1') || '{}').bronze || []).length;
        o.querySelector('[data-ui29-sec=special] [data-ui29-act=remove-added]').click(); return {added, saved, after: o.querySelectorAll('[data-ui29-sec=special] .ui29-tile').length}; })()`);
      ok(sp.added === 1 && sp.saved === 1 && sp.after === 0, `@${w} Special: + Add card adds a tile (saved), Remove takes it out`);
      const after = await pg.evaluate("JSON.stringify(getShopPacks().map(p=> [p.id, packCardPool(null, p.pool || 1, true).length]))");
      ok(before === after, `@${w} the live packs are unchanged`);
      await pg.evaluate("document.getElementById('ui29Close').click()");
      // the map admin bar opens the map's own pack
      const mb = await pg.evaluate("(()=>{ const m5 = mainConquestMaps().find(m=> mapNumberOf(m.id) === 5), m9 = mainConquestMaps().find(m=> mapNumberOf(m.id) === 9); return {bar: /id=\"mlPacks\"/.test(mapLayoutToolbarHTML(m5)), k5: ui29KeyForMap(m5.id), k9: ui29KeyForMap(m9.id)}; })()");
      ok(mb.bar && mb.k5 === 'bronze' && mb.k9 === 'silver', `@${w} 📦 Packs in the map admin bar; it opens Map 5 on the Pouch, Map 9 on the Chest (${mb.k5}, ${mb.k9})`);
      // the Shop: bar button + each pack tile's Edit
      await pg.evaluate("(()=>{ try{ FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); }catch(e){} switchTab('shop'); })()"); await pg.waitForTimeout(1500);
      const sh = await pg.evaluate(`(()=>{ const r = {}; r.bar = !!document.querySelector('.ui29-shop-bar [data-ui29-open=starter]'); r.edits = [...document.querySelectorAll('.ui29-shelf-edit')].map(e=> e.dataset.ui29Open);
        const sel = shopSelected; const e = document.querySelector('.ui29-shelf-edit[data-ui29-open=silver]'); if(e) e.click(); const o = document.getElementById('ui29PackEditor');
        r.open = !!(o && !o.hidden) && o.dataset.ui29Cur === 'silver'; r.selKept = shopSelected === sel; document.getElementById('ui29Close').click();
        document.querySelector('.ui29-shop-bar [data-ui29-open=starter]').click(); r.starter = document.getElementById('ui29PackEditor').dataset.ui29Cur === 'starter'; document.getElementById('ui29Close').click(); return r; })()`);
      ok(sh.bar && sh.starter, `@${w} Shop: Starter · Base · Factions opens the editor on Starter`);
      ok(['bronze', 'silver', 'gold'].every(k=> sh.edits.includes(k)) && sh.open && sh.selKept, `@${w} Shop: each pack tile has 📦 Edit; it opens that pack and does not pick the shelf item (${sh.edits.join(',')})`);
      // no sideways scroll in the window at 390
      if(w < 500){ const sx = await pg.evaluate("(()=>{ ui29OpenPackEditor('starter'); const m = document.querySelector('.ui29-pe-modal'); const r = m.scrollWidth - m.clientWidth; document.getElementById('ui29Close').click(); return r; })()"); ok(sx <= 2, `@390 no sideways scroll in the window (${sx}px)`); }
      await ctx.close();
    }
  } finally { await b.close(); }
  errs.forEach(e=> ok(false, 'page error ' + e));
}
browser().then(()=>{ console.log(`ui29: ${n - fail}/${n} ok`); process.exit(fail ? 1 : 0); }).catch(e=>{ console.log('ui29 crashed', e); process.exit(1); });
