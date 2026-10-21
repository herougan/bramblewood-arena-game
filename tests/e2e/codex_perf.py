#!/usr/bin/env python3
"""Codex speed (2026-10-18, owner: "Codex is still abit laggy") — the real game page in headless Chromium, every card seen and owned.

    python3 tests/e2e/codex_perf.py

Times, at normal speed and with the CPU slowed 4x (about a phone): opening the Codex, a sort change, a search, the next page and
a card's detail view. For each it records the time to the first frame after the action, the time until the page has settled,
and the long tasks (main-thread work over 50 ms) in between. The limits are generous: the shared test machine is noisy, so this
catches a big step back (a whole page drawn at once again, the stats worked out on every open), not small drifts.
Also checks the Codex still shows what it did: the first chunk of a page is drawn at once, the rest follows by itself (the
.cx-more marker goes), a search narrows the list, a click opens the card's detail, the stats box is closed until asked.
2026-10-18 (package C): the Codex opens on the card album now. The timed actions run on the album ('next page' turns it); the
album draws only its open spread (at most 18 sleeves; 32 since package CX's 4 x 4 pages), builds the next spread's tiles while idle, and its search, turn and
detail still work. The grid checks above run on the Compressed view.
Exit code 1 on any failure.
"""
import asyncio, os, sys, json
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
URL = 'file://' + os.path.join(ROOT, 'index.html')
EXE = os.environ.get('BW_CHROMIUM', '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell')
INIT = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_pitch_open_v1','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); localStorage.setItem('bramblewood_world_open_v1','1'); localStorage.setItem('bramblewood_arena_faction','otters'); localStorage.setItem('bramblewood_map_revealed_v1','[\"*\"]'); localStorage.setItem('bramblewood_dialogue_flags_v1', JSON.stringify({'lesson:lumber':true,'lesson:rarity':true}));"
        "sessionStorage.setItem('bramblewood_seen_splash','1'); localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek']));")
HELP = """
window.__lt = []; try{ new PerformanceObserver(l=> l.getEntries().forEach(e=> window.__lt.push(e.duration))).observe({entryTypes:['longtask']}); }catch(e){}
// 2026-10-21 (package TT2): the Codex search matches the card's name or its animal since package UT (2026-10-19: "spider" finds the
// Webspire Sentinel), so "otter" also finds the Rivergate otters. A hit is a tile whose card has "otter" in its name or animal.
window.__hit = t=>{ const d = getCardDefs()[t.dataset.defid] || {}; return (d.name || '').toLowerCase().includes('otter') || (d.animal || '').includes('otter'); };
window.__settle = ()=> new Promise(r=> requestAnimationFrame(()=> requestAnimationFrame(()=> setTimeout(r, 0))));
window.__time = async (fn, wait)=>{ window.__lt.length = 0; const t0 = performance.now(); await fn(); await window.__settle(); const t1 = performance.now();
  if(wait) await new Promise(r=> setTimeout(r, wait)); await window.__settle(); const t2 = performance.now();
  return {frame: Math.round(t1 - t0), settled: Math.round(t2 - t0 - (wait || 0)), longtask: Math.round(window.__lt.reduce((a, b)=> a + b, 0))}; };
1
"""
ACTIONS = [
    ('open', "(async()=>{ switchTab('home'); await __settle(); return __time(()=> switchTab('codex'), 100); })()", None),
    ('sort', "__time(()=>{ const s = document.getElementById('cxSort'); s.value = s.value === 'attack' ? 'health' : 'attack'; s.dispatchEvent(new Event('change')); }, 100)", None),
    ('search', "__time(()=>{ const el = document.getElementById('cxSearch'); el.value = el.value ? '' : 'o'; el.dispatchEvent(new Event('input')); }, 300)", None),
    ('next page', "__time(()=>{ document.querySelector(`#codexGrid .pg-edge [data-turn=\"${codexPage ? -1 : 1}\"]`).click(); }, 100)", None),
    ('detail', "__time(()=>{ document.querySelector('#codexGrid .card-tile').click(); }, 50)",
     "(async()=>{ document.dispatchEvent(new KeyboardEvent('keydown', {key:'Escape', bubbles:true})); await new Promise(r=> setTimeout(r, 200)); return 1; })()"),
]
# Generous limits (ms) on the median time to the first frame, per CPU rate. Measured 2026-10-18 on the shared 2-core test box
# (busy with other jobs): about 150-700 at 1x and 400-2500 at 4x.
LIMITS = {1: 2500, 4: 8000}
failures = []

def check(cond, msg):
    if not cond:
        failures.append(msg); print('  FAIL', msg)

async def run(b, rate):
    pg = await b.new_page(viewport={'width': 1366, 'height': 900})
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.add_init_script(INIT)
    await pg.goto(URL); await pg.wait_for_timeout(2500)
    await pg.evaluate("FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); const ids = Object.keys(getCardDefs()); ids.forEach(id=>{ try{ unlockCardForPlayer(id, 'admin'); }catch(e){} }); noteSighted(ids); switchTab('codex'); 1")
    await pg.wait_for_timeout(1500)
    await pg.evaluate(HELP)
    cdp = await pg.context.new_cdp_session(pg)
    await cdp.send('Emulation.setCPUThrottlingRate', {'rate': rate})
    res = {}
    for name, js, after in ACTIONS:
        runs = []
        for _ in range(3):
            runs.append(await pg.evaluate(js))
            if after: await pg.evaluate(after)
        runs.sort(key=lambda r: r['frame'])
        res[name] = runs[1]
        check(runs[1]['frame'] < LIMITS[rate], f"{name} @{rate}x: first frame {runs[1]['frame']} ms (limit {LIMITS[rate]})")
    await cdp.send('Emulation.setCPUThrottlingRate', {'rate': 1})
    if rate == 1:
        # the album (2026-10-18, package C)
        al = await pg.evaluate("""(async()=>{
          switchTab('home'); await __settle(); codexSubTab = 'browse'; switchTab('codex'); await __settle();
          const sleeves = document.querySelectorAll('#codexGrid .al-sleeve .card-tile').length, pages = document.querySelectorAll('#codexGrid .al-page').length;
          const S = codexAlbumState, total = S.pages.length, firstIds = S.pages[0].ids.slice();
          await new Promise(r=> setTimeout(r, 1500));
          const ahead = S.pages.slice(S.L.pages, 2 * S.L.pages).every(p=> p.ids.every(id=> codexTileCache.has(id)));
          document.querySelector('#codexGrid .pg-edge [data-turn="1"]').click(); await __settle();
          const turned = codexPage === S.L.pages && !document.querySelector('#codexGrid .al-page:not(.pg-leaf) .card-tile[data-defid="' + firstIds[0] + '"]');
          document.dispatchEvent(new KeyboardEvent('keydown', {key:'ArrowLeft', bubbles:true})); await __settle();
          const keyBack = codexPage === 0;
          const el = document.getElementById('cxSearch'); el.value = 'otter'; el.dispatchEvent(new Event('input'));
          await new Promise(r=> setTimeout(r, 600));
          const found = [...document.querySelectorAll('#codexGrid .al-page:not(.pg-leaf) .al-sleeve .card-tile')].map(__hit);
          el.value = ''; el.dispatchEvent(new Event('input')); await new Promise(r=> setTimeout(r, 400));
          document.querySelector('#codexGrid .al-sleeve .card-tile').click(); await new Promise(r=> setTimeout(r, 200));
          const detail = !document.getElementById('cardDetailOverlay').hidden;
          document.dispatchEvent(new KeyboardEvent('keydown', {key:'Escape', bubbles:true})); await new Promise(r=> setTimeout(r, 200));
          return {sleeves, pages, total, ahead, turned, keyBack, found: found.length, allMatch: found.every(Boolean), detail, score: !!document.querySelector('#codexScore .cx-score')};
        })()""")
        print('  album:', json.dumps(al))
        # 2026-10-21 (package TT2): package CX (2026-10-19, owner: "Show 16 cards on each page") made the pages 4 x 4, so a wide spread is 32 sleeves
        check(al['pages'] == 2 and 0 < al['sleeves'] <= 32 and al['total'] > 10, f"the album draws only its open spread: {al}")
        check(al['ahead'], f"the next spread's tiles are built while idle: {al}")
        check(al['turned'] and al['keyBack'], f"the album turns with its button and the arrow keys: {al}")
        check(al['found'] > 0 and al['allMatch'], f"a search narrows the album: {al}")
        check(al['detail'] and al['score'], f"a card opens its detail; the collection score is under the Codex: {al}")
        # what the Codex shows (the grid views: Compressed)
        await pg.evaluate("codexViewMode = 'compressed'; 1")
        st = await pg.evaluate("""(async()=>{
          switchTab('home'); await __settle(); switchTab('codex');
          const first = document.querySelectorAll('#codexGrid .card-tile').length, marker = !!document.querySelector('#codexGrid .cx-more');
          let t = 0; while(document.querySelector('#codexGrid .cx-more') && t < 100){ await new Promise(r=> setTimeout(r, 100)); t++; }
          const all = document.querySelectorAll('#codexGrid .card-tile').length, done = !document.querySelector('#codexGrid .cx-more');
          const last = document.getElementById('codexGrid').lastElementChild, pagerLast = !!(last && last.classList.contains('cx-pager-bottom'));
          const statsClosed = !!document.getElementById('codexStatsBox') && !document.querySelector('#codexStatsBox .pie-one');
          toggleCodexStats(); const statsOpen = !!document.querySelector('#codexStatsBox .pie-one'); toggleCodexStats();
          const el = document.getElementById('cxSearch'); el.value = 'otter'; el.dispatchEvent(new Event('input'));
          await new Promise(r=> setTimeout(r, 600));
          const found = [...document.querySelectorAll('#codexGrid .card-tile')].map(__hit);
          el.value = ''; el.dispatchEvent(new Event('input')); await new Promise(r=> setTimeout(r, 400));
          document.querySelector('#codexGrid .card-tile').click(); await new Promise(r=> setTimeout(r, 200));
          const detail = !document.getElementById('cardDetailOverlay').hidden;
          return {first, marker, all, done, pagerLast, statsClosed, statsOpen, found: found.length, allMatch: found.every(Boolean), detail};
        })()""")
        print('  shows:', json.dumps(st))
        check(0 < st['first'] < st['all'] and st['marker'], f"the first chunk should be part of the page: {st}")
        check(st['done'] and st['all'] == 80 and st['pagerLast'], f"the rest of the page should follow by itself, pager last: {st}")
        check(st['statsClosed'] and st['statsOpen'], f"the stats box opens only when asked: {st}")
        check(st['found'] > 0 and st['allMatch'], f"a search should narrow the list: {st}")
        check(st['detail'], 'a card click should open its detail')
    check(not errs, f'page errors @{rate}x: {errs[:3]}')
    await pg.close()
    return res

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=EXE)
        table = {}
        for rate in (1, 4):
            table[rate] = await run(b, rate)
        await b.close()
    print(f"  {'action':<10} {'1x frame':>9} {'settled':>8} {'long':>6}   {'4x frame':>9} {'settled':>8} {'long':>6}")
    for name, _, _ in ACTIONS:
        a, c = table[1][name], table[4][name]
        print(f"  {name:<10} {a['frame']:>9} {a['settled']:>8} {a['longtask']:>6}   {c['frame']:>9} {c['settled']:>8} {c['longtask']:>6}")
    print(f'codex-perf: {len(failures)} failure(s)')
    sys.exit(1 if failures else 0)

asyncio.run(main())
