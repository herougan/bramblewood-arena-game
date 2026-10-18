#!/usr/bin/env python3
"""Text filters reset (2026-10-18, owner 21:18: "The text filters in all my texts ... don't reset when I refresh the explorer
(I'm using Chrome) or when I move between pages in game") -- real game page in headless Chromium.

    python3 tests/e2e/filters_2026_10_19.py

Checks, for the Codex search, the Skill Codex filter and the Camp's card-pool search:
  1. typing filters the list (the box holds the text, the page's query is set);
  2. after a reload the box is empty, the query is empty, and nothing is saved in the sticky filters;
  3. after leaving the page and coming back (another tab, or another Codex sub-tab) the box is empty and the list unfiltered;
  4. a redraw of the same page keeps what you typed; the sticky non-text choices (Codex sort) survive a reload;
  5. every data-text-filter box on screen has autocomplete="off"; no page errors.
Exit code 1 on any failure.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
URL = 'file://' + os.path.join(ROOT, 'index.html')
EXE = os.environ.get('BW_CHROMIUM', '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell')
INIT = ("if(!sessionStorage.getItem('bw_f_init')){ sessionStorage.setItem('bw_f_init','1');"
        "localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_pitch_open_v1','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); localStorage.setItem('bramblewood_world_open_v1','1'); localStorage.setItem('bramblewood_arena_faction','otters'); localStorage.setItem('bramblewood_map_revealed_v1','[\"*\"]'); localStorage.setItem('bramblewood_dialogue_flags_v1', JSON.stringify({'lesson:lumber':true}));"
        "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek'])); }"
        "sessionStorage.setItem('bramblewood_seen_splash','1');")
failures = []


def check(cond, msg):
    print(('  ok   ' if cond else '  FAIL ') + msg)
    if not cond: failures.append(msg)


async def boot(pg):
    await pg.wait_for_timeout(1500)
    await pg.evaluate("FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); Object.keys(getCardDefs()).filter(id=> getCardDefs()[id].basic).slice(0, 12).forEach(id=> unlockCardForPlayer(id, 'test')); 1")  # a dozen cards for the Codex and the Camp pool


async def type_into(pg, sel, text):
    await pg.click(sel); await pg.fill(sel, ''); await pg.type(sel, text, delay=10); await pg.wait_for_timeout(400)


async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=EXE)
        pg = await b.new_page(viewport={'width': 1366, 'height': 900})
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('dialog', lambda d: asyncio.ensure_future(d.accept()))
        await pg.add_init_script(INIT)
        await pg.goto(URL); await boot(pg)

        # --- Codex search
        await pg.evaluate("codexSubTab = 'browse'; switchTab('codex'); 1"); await pg.wait_for_timeout(1500)
        all_n = await pg.evaluate("document.querySelectorAll('#codexGrid > :not(.cx-view-hint)').length")
        await type_into(pg, '#cxSearch', 'zzqx'); await pg.wait_for_timeout(1000)
        f_n = await pg.evaluate("document.querySelectorAll('#codexGrid > :not(.cx-view-hint)').length")
        check(await pg.evaluate("document.getElementById('cxSearch').value === 'zzqx' && codexFilter.q === 'zzqx'"), 'Codex: typing sets the box and the query')
        check(f_n < all_n, f'Codex: typing filters the grid ({f_n} of {all_n})')
        await pg.evaluate("codexFilter.sort = 'name'; saveCodexFilters(); renderCodex(); 1"); await pg.wait_for_timeout(300)
        check(await pg.evaluate("document.getElementById('cxSearch').value === 'zzqx'"), 'Codex: a redraw of the same page keeps the text')
        check(await pg.evaluate("!('q' in ((JSON.parse(localStorage.getItem('bramblewood_ui_filters_v1')||'{}')).codex||{}))"), 'Codex: the query is not saved in the sticky filters')
        check(await pg.evaluate("[...document.querySelectorAll('input[data-text-filter]')].every(e=> e.getAttribute('autocomplete') === 'off')"), 'Codex: every text filter box has autocomplete=off')
        await pg.reload(); await boot(pg)
        await pg.evaluate("codexSubTab = 'browse'; switchTab('codex'); 1"); await pg.wait_for_timeout(1500)
        check(await pg.evaluate("document.getElementById('cxSearch').value === '' && codexFilter.q === ''"), 'Codex: empty after a reload')
        check(await pg.evaluate("codexFilter.sort === 'name'"), 'Codex: the sort (a non-text choice) is still sticky after a reload')
        n_after = await pg.evaluate("document.querySelectorAll('#codexGrid > :not(.cx-view-hint)').length")
        check(n_after == all_n, f'Codex: the grid is unfiltered after a reload ({n_after} vs {all_n})')
        await type_into(pg, '#cxSearch', 'otter')
        await pg.evaluate("switchTab('shop'); 1"); await pg.wait_for_timeout(300)
        await pg.evaluate("switchTab('codex'); 1"); await pg.wait_for_timeout(500)
        check(await pg.evaluate("document.getElementById('cxSearch').value === '' && codexFilter.q === ''"), 'Codex: empty after Shop -> Codex')

        # --- Skill Codex filter (a Codex sub-tab)
        has_sk = await pg.evaluate("codexSubTab = 'skills'; renderCodex(); !!document.getElementById('skFilterInput')")
        await pg.wait_for_timeout(300)
        if has_sk:
            await type_into(pg, '#skFilterInput', 'fly')
            check(await pg.evaluate("document.getElementById('skFilterInput').value === 'fly' && skillCodexQuery === 'fly'"), 'Skill Codex: typing sets the box and the query')
            await pg.evaluate("codexSubTab = 'browse'; renderCodex(); 1"); await pg.wait_for_timeout(300)
            await pg.evaluate("codexSubTab = 'skills'; renderCodex(); 1"); await pg.wait_for_timeout(300)
            check(await pg.evaluate("document.getElementById('skFilterInput').value === '' && skillCodexQuery === ''"), 'Skill Codex: empty after Browse -> Skills')
            await type_into(pg, '#skFilterInput', 'fly')
            await pg.reload(); await boot(pg)
            await pg.evaluate("codexSubTab = 'skills'; switchTab('codex'); 1"); await pg.wait_for_timeout(500)
            check(await pg.evaluate("document.getElementById('skFilterInput').value === '' && skillCodexQuery === ''"), 'Skill Codex: empty after a reload')
        else:
            check(False, 'Skill Codex: #skFilterInput not found')

        # --- Camp card-pool search
        await pg.evaluate("deckOpenBuilderOnce = true; deckShowList = false; deckEditingId = activeDeckId; switchTab('deck'); 1"); await pg.wait_for_timeout(800)
        if await pg.evaluate("!!document.getElementById('deckSearch')"):
            pool_all = await pg.evaluate("document.querySelectorAll('#myDeckPool > *').length")
            await type_into(pg, '#deckSearch', 'zzqx')
            pool_f = await pg.evaluate("document.querySelectorAll('#myDeckPool > *').length")
            check(pool_f < pool_all or pool_all == 0, f'Camp: typing filters the pool ({pool_f} of {pool_all})')
            check(await pg.evaluate("!('deckSearch' in ((JSON.parse(localStorage.getItem('bramblewood_ui_filters_v1')||'{}')).camp||{}))"), 'Camp: the search is not saved in the sticky filters')
            await pg.evaluate("switchTab('home'); 1"); await pg.wait_for_timeout(300)
            await pg.evaluate("deckOpenBuilderOnce = true; deckShowList = false; deckEditingId = activeDeckId; switchTab('deck'); 1"); await pg.wait_for_timeout(800)
            check(await pg.evaluate("document.getElementById('deckSearch').value === ''"), 'Camp: empty after Home -> Camp')
            check(await pg.evaluate("document.querySelectorAll('#myDeckPool > *').length") == pool_all, 'Camp: the pool is unfiltered after Home -> Camp')
            await type_into(pg, '#deckSearch', 'zzqx')
            await pg.reload(); await boot(pg)
            await pg.evaluate("deckOpenBuilderOnce = true; deckShowList = false; deckEditingId = activeDeckId; switchTab('deck'); 1"); await pg.wait_for_timeout(800)
            check(await pg.evaluate("document.getElementById('deckSearch').value === ''"), 'Camp: empty after a reload')
        else:
            check(False, 'Camp: #deckSearch not found')

        # --- pageshow from the back/forward cache: a box holding text is cleared and its list redrawn
        await pg.evaluate("codexSubTab = 'browse'; switchTab('codex'); 1"); await pg.wait_for_timeout(400)
        await type_into(pg, '#cxSearch', 'otter')
        await pg.evaluate("window.dispatchEvent(new PageTransitionEvent('pageshow', {persisted: true})); 1"); await pg.wait_for_timeout(500)
        check(await pg.evaluate("document.getElementById('cxSearch').value === '' && codexFilter.q === ''"), 'pageshow (persisted): the Codex search is cleared')
        check(not errs, f'no page errors: {errs[:3]}')
        await b.close()
    print('filters e2e:', 'FAILED %d' % len(failures) if failures else 'passed')
    sys.exit(1 if failures else 0)


asyncio.run(main())
