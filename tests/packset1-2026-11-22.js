#!/usr/bin/env node
// 2026-11-22 (package PACKSET1, owner 22:41 #1 #2 #4 #5 #6): the Pack Editor's "All cards (0-20)" / "All cards (20-40)" panels.
//   1. static: the rows, the texts in all 12 packs, the build placeholder, run-all.sh, CHANGELOG, project-state record (1-3 New! per submap);
//   2. the suggestions file: 3 bonus cards per map (>= 2 asked), Maps 0-20 >= 42, each on no list, in no fight or reward, no Easter egg / token / faction / Baby;
//      tutorial: >= 24 per faction;
//   3. browser (index.html + Chromium; skipped when missing): the rows open the panels, sections in order (Tutorial, Base, Faction, maps, Bonus), >= 42 bonus tiles with a
//      Map pill and YES / NO, right-click opens the map picker and a pick moves the card, cuts are ascending-only, the pack pools follow the cuts and fall back when
//      none are set, a side map's New! target is the range 1-3.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8'), J = f => JSON.parse(rd(f));
let fail = 0, n = 0; const ok = (c, m) => { n++; if (!c) { fail++; console.log('  x ' + m); } };
const app = rd('arena_app.js');

// ---- 1. static
ok(/tests\/packset1-2026-11-22|packset1-2026-11-22/.test(rd('tests/run-all.sh')), '1. run-all.sh lists this test');
ok(/PACKSET1/.test(rd('docs/CHANGELOG.md').slice(0, 20000)), '1. CHANGELOG entry at the top');
ok(/1-3 New! per submap/.test(rd('docs/project-state.md')) && /2026-11-22/.test(rd('docs/project-state.md')), '1. project-state records 1-3 New! per submap');
ok(/data-ps1-open="\$\{pk\}"/.test(app) && /\$\{packsetRowsHTML\(\)\}/.test(app) && /'ui\.ps1-all-a'/.test(app) && /'ui\.ps1-all-b'/.test(app), '1. the two rows are in the Pack Editor');
ok(/const PACKSET_SUG = __PACK_BONUS__;/.test(app) && /__PACK_BONUS__/.test(rd('assemble_arena.py')), '1. the build inlines the suggestions');
ok(/__cfg:pack-set/.test(app) && /applyCloudPackSet\(r\)/.test(app), '1. the cloud row is written and read');
for (const c of ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']) { const p = J('lang/' + c + '.json'); ['All cards (0-20)', 'All cards (20-40)', 'Bonus (pack-only)', 'Tutorial suggestions'].forEach(k => ok(p[k], `1. lang/${c}.json has "${k}"`)); }
const tx = rd('bramblewood-texts.js'); (app.match(/'ui\.ps1-[a-z-]+'|TX\('ui\.ps1-[a-z-]+'/g) || []).forEach(k => { const key = k.replace(/^TX\(/, '').replace(/'/g, ''); ok(tx.includes('"' + key + '"'), '1. text key ' + key); });

// ---- 2. suggestions
const S = J('canonical/pack-bonus-suggestions.json'), B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), D = B.CARD_DEFS_BASELINE, LP = require(path.join(ROOT, 'tools', 'lib_map_pools.js'));
const listed = LP.listedIds(J('canonical/map-pools.json')), blob = JSON.stringify(B.G.CONQUEST_MAPS.map(m => m.nodes)), per = {};
ok(S.bonus.filter(b => b.mapNo <= 20).length >= 42, '2. at least 42 bonus suggestions for Maps 0-20 (' + S.bonus.filter(b => b.mapNo <= 20).length + ')');
S.bonus.forEach(b => { per[b.mapNo] = (per[b.mapNo] || 0) + 1; const d = D[b.id];
  ok(d && !d.token && !d.test && !d.faction && d.kind !== 'baby' && !(d.source && d.source.kind === 'easteregg'), '2. ' + b.id + ' is a plain card');
  ok(!listed.has(b.id) && !blob.includes('"' + b.id + '"'), '2. ' + b.id + ' is on no list and in no fight or reward');
  ok(b.why && b.map && b.mapNo != null, '2. ' + b.id + ' has a why and a map'); });
for (let i = 0; i <= 20; i++) ok((per[i] || 0) >= 2, '2. Map ' + i + ' has >= 2 suggestions');
ok(new Set(S.bonus.map(b => b.id)).size === S.bonus.length, '2. no card is suggested twice');
['otters', 'hummingbirds'].forEach(f => ok(S.tutorial[f].length >= 24 && S.tutorial[f].every(e => D[e.id] && e.why), `2. >= 24 tutorial suggestions for ${f} (${S.tutorial[f].length})`));

// ---- 3. browser
async function browser() {
  let pw; try { pw = require('playwright'); } catch (e) { try { pw = require(path.join(require('child_process').execSync('npm root -g').toString().trim(), 'playwright')); } catch (_) { console.log('  (browser part skipped: no playwright)'); return; } }
  const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
  if (!fs.existsSync(EXE) || !fs.existsSync(path.join(ROOT, 'index.html'))) { console.log('  (browser part skipped: no Chromium or index.html)'); return; }
  const INIT = "localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1');";
  const b = await pw.chromium.launch({ executablePath: EXE });
  try {
    const ctx = await b.newContext({ viewport: { width: 1366, height: 860 } });
    await ctx.route('**/*', r => /^(file|data|blob):/.test(r.request().url()) ? r.continue() : r.abort());
    const pg = await ctx.newPage(), errs = []; pg.on('pageerror', e => errs.push(String(e && e.message || e).slice(0, 200)));
    await pg.addInitScript(INIT); await pg.goto('file://' + path.join(ROOT, 'index.html'), { waitUntil: 'domcontentloaded', timeout: 180000 });
    await pg.waitForFunction("typeof switchTab === 'function'", null, { timeout: 180000 }); await pg.waitForTimeout(1500);
    const picks = J('docs/design/map-picks-owner-2026-11-13.json').maps;
    await pg.evaluate(p => { adminModeEnabled = true; Object.entries(p).forEach(([k, e]) => { ui37Picks[k] = { yes: e.yes || [], no: e.no || [], t: {}, after: e.after || '', localAt: 0 }; }); packsetState = {}; switchTab('admin'); }, picks);
    await pg.waitForTimeout(800);
    ok(await pg.evaluate("document.querySelectorAll('#packEditor [data-ps1-open]').length") === 2, '3. two rows under the Pack Editor');
    await pg.evaluate("document.querySelector('#packEditor [data-ps1-open=a]').click()"); await pg.waitForTimeout(600);
    const info = await pg.evaluate(() => ({ title: document.getElementById('ps1Title').textContent, secs: [...document.querySelectorAll('#ps1Body .ps1-sec')].map(s => s.className.replace(/.*ps1-sec /, '').split(' ')[0]),
      bonus: [...document.querySelectorAll('.ps1-sec.is-bonus .ps1-tile')].map(t => ({ pill: !!t.querySelector('.ps1-pill.is-map'), yn: t.querySelectorAll('[data-ps1-flag]').length })), counts: document.querySelector('.ps1-counts').textContent }));
    ok(info.title === 'All cards (0-20)', '3. panel A title');
    const order = info.secs.join(' '); ok(/^is-tut is-base is-fac( is-fac)* is-map( is-map)+ is-bonus$/.test(order), '3. sections in order: Tutorial, Base, Faction, maps, Bonus (' + order + ')');
    ok(info.secs.filter(s => s === 'is-map').length === 21, '3. one section per map 0-20');
    ok(info.bonus.length >= 42 && info.bonus.every(t => t.pill && t.yn === 2), '3. >= 42 bonus tiles, each with a Map pill and YES / NO (' + info.bonus.length + ')');
    ok(await pg.evaluate("packsetSugList().every(b=> !packsetSkirmishIds().has(b.id))"), '3. no bonus suggestion is in any skirmish, tower or ambush deck (the game\'s own check)');
    ok(/Pack 1: \d+ · Pack 2: \d+ · Pack 3: \d+/.test(info.counts), '3. per-pack counts shown: ' + info.counts);
    ok(await pg.evaluate("[...document.querySelectorAll('.ps1-fac .ps1-n')].map(x=> x.textContent.trim()).join() === 'Picked 0 / 16,Picked 0 / 16'"), '3. n / 16 counters per faction');
    // right-click: the map picker; a pick moves a card
    const bid = await pg.evaluate("document.querySelector('.ps1-sec.is-bonus .ps1-tile').dataset.ps1Id");
    await pg.evaluate("document.querySelector('.ps1-sec.is-bonus .ps1-tile').dispatchEvent(new MouseEvent('contextmenu', {bubbles: true, cancelable: true, clientX: 200, clientY: 200}))");
    ok(await pg.evaluate("!!document.querySelector('.ps1-menu select[data-ps1-menu=map]')"), '3. right-click opens the map picker');
    await pg.evaluate("(()=>{ const s = document.querySelector('.ps1-menu select'); s.value = 'mc'; s.dispatchEvent(new Event('change', {bubbles: true})); })()");
    ok(await pg.evaluate(id => (packsetState.map || {})[id] === 'mc' && [...document.querySelectorAll('.ps1-sec.is-bonus .ps1-tile')].find(t => t.dataset.ps1Id === id).querySelector('.ps1-pill.is-map').textContent === 'Map 3', bid), '3. the pick sets the map (pill Map 3)');
    // YES: the card joins its map's section, and a pack
    await pg.evaluate(id => { [...document.querySelectorAll('.ps1-sec.is-bonus .ps1-tile')].find(t => t.dataset.ps1Id === id).querySelector('[data-ps1-flag=yes]').click(); }, bid);
    ok(await pg.evaluate(id => { const s = [...document.querySelectorAll('.ps1-sec.is-map')][3]; return !!s.querySelector(`[data-ps1-id="${id}"]`); }, bid), '3. a YES bonus card joins its map section');
    ok(await pg.evaluate(id => basicPackTierOf(getCardDefs()[id]) === 1, bid), '3. ... and is in Pack 1 (Map 3, the default cut)');
    // cuts: ascending only, the pools follow
    const r = await pg.evaluate(() => { const m = packsetModel('a'), seq = m.seq, out = {}; out.len = seq.length; const i2 = Math.floor(seq.length / 4), i3 = Math.floor(seq.length / 2);
      out.set2 = packsetSetCut('a', 2, seq[i2].id); out.set3 = packsetSetCut('a', 3, seq[i3].id); out.back3 = packsetSetCut('a', 3, seq[i2].id); out.back2 = packsetSetCut('a', 2, seq[0].id); out.st = packsetStarts('a', packsetModel('a').seq);
      const defs = getCardDefs(), pk = i => seq[i] && basicPackTier0(defs[seq[i].id]) > 0, before = i => { while (i > 0 && !pk(i)) i--; return i; }, after = i => { while (i < seq.length - 1 && !pk(i)) i++; return i; }; /* the cards a pack can hold: a map list puts them in a basic pack today */ out.ids = [before(i2 - 1), after(i2), before(i3 - 1), after(i3)].map(i => [seq[i].id, basicPackTierOf(defs[seq[i].id]), basicPackTier0(defs[seq[i].id])]); out.i = [i2, i3];
      // pushing: pack 2 starts after pack 3's cut -> pack 3 moves on, never before
      const j = Math.min(seq.length - 2, i3 + 3); out.push = packsetSetCut('a', 2, seq[j].id); out.st2 = packsetStarts('a', packsetModel('a').seq); out.j = j; return out; });
    ok(r.set2 && r.set3 && !r.back3 && !r.back2, '3. cuts: Pack 2 / 3 can be set, not back to or before the pack before');
    ok(r.st[0] === 0 && r.st[1] === r.i[0] && r.st[2] === r.i[1], '3. the cut cards start the packs (' + r.st + ' vs ' + r.i + ')');
    const [a0, a1, b0, b1] = r.ids.map(x => x[1]); ok(a0 === 1 && a1 === 2 && b0 === 2 && b1 === 3, '3. the pack pools follow the cuts: ' + JSON.stringify(r.ids.map(x => x.slice(0, 2))));
    ok(r.push && r.st2[1] === r.j && r.st2[2] > r.j && r.st2[2] >= r.st2[1], '3. a later Pack 2 cut pushes Pack 3 on (' + r.st2 + ')');
    ok(await pg.evaluate("Object.keys(packsetState.tiers).length > 20 && !!packsetRow().tiers && localStorage.getItem(PACKSET_KEY).includes('tiers')"), '3. the tiers are saved with the state (cloud row data)');
    // unset: today's rule
    const fb = await pg.evaluate(() => { packsetResetCuts(); packsetState = {}; const defs = getCardDefs(), ids = Object.keys(defs).filter(id => basicPackTier0(defs[id])); return ids.length > 100 && ids.every(id => basicPackTierOf(defs[id]) === basicPackTier0(defs[id])); });
    ok(fb, '3. with nothing set, packs use today\'s rule (basicPackTierOf = basicPackTier0)');
    // panel B
    await pg.evaluate(() => { packsetOpen('b'); }); await pg.waitForTimeout(400);
    ok(await pg.evaluate("document.getElementById('ps1Title').textContent === 'All cards (20-40)' && /Pack 4: \\d+ · Pack 5: \\d+ · Pack 6: \\d+/.test(document.querySelector('.ps1-counts').textContent) && document.querySelectorAll('.ps1-sec.is-bonus .ps1-tile').length > 0"), '3. panel B (Packs 4-6) opens with its bonus cards');
    // side map target: 1-3
    const tg = await pg.evaluate(() => { const subs = ui44ProsSubs(), id = subs[0].id; const a = ui37Targets(id); const e = ui37Picks[id]; ui37Picks[id] = { yes: [], no: [], t: { n: 5 }, after: '', localAt: 0 }; const b = ui37Targets(id); delete ui37Picks[id]; return { a, b, main: ui37Targets('mf') }; });
    ok(tg.a.lo === 1 && tg.a.n === 3, '3. a side map\'s New! target is the range 1-3 (lo ' + tg.a.lo + ', n ' + tg.a.n + ')');
    ok(tg.b.n === 5 && tg.b.lo === null, '3. an owner override is kept (5, no range)');
    ok(tg.main.lo === null, '3. a main map keeps its single target');
    await pg.evaluate("(()=>{ const m = ui44ProsSubs()[0]; const sp = {neu: [], car: [], afterId: ui44After(m.id)}; window.__h = ui44HeadHTML(m.id, sp); })()");
    ok(await pg.evaluate("/ui37-ct is-new is-over/.test(__h) === false"), '3. 0 New! on a side map is under the range, not over');
    ok(errs.length === 0, '3. no page errors ' + errs.join(' | '));
  } finally { await b.close(); }
}
browser().then(() => { console.log(fail ? `packset1: ${fail} FAILED of ${n}` : `packset1: ${n} checks passed`); process.exit(fail ? 1 : 0); }, e => { console.log('  x browser part crashed: ' + (e && e.stack || e)); process.exit(1); });
