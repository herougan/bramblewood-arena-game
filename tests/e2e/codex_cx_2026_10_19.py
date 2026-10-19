#!/usr/bin/env python3
"""Package CX (2026-10-19, owner 14:07): the Codex's Bestiary and Skills book -- real game page in headless Chromium.

    python3 tests/e2e/codex_cx_2026_10_19.py [outdir]

At 390x844 (phone: isMobile, hasTouch) and 1366x768:
  1. the Bestiary: 16 sleeves a page (4 x 4), short section names (no "·" in them, detail in a tooltip), no horizontal scroll;
  2. the page-turn controls sit ON the book (prev / first on the left page's outer corner, next / last on the right one), no bar below;
  3. >> jumps to the last page, << back to the first; the arrow keys turn;
  4. a sideways swipe (touch) turns the page, on the Bestiary and in the Skills book;
  5. no page errors.
Screenshots go to docs/screens/cx/ (or outdir). Exit code 1 on any failure.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
URL = 'file://' + os.path.join(ROOT, 'index.html')
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'docs', 'screens', 'cx')
EXE = os.environ.get('BW_CHROMIUM', '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell')
INIT = ("if(!sessionStorage.getItem('bw_f_init')){ sessionStorage.setItem('bw_f_init','1');"
        "localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_pitch_open_v1','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); localStorage.setItem('bramblewood_world_open_v1','1'); localStorage.setItem('bramblewood_arena_faction','otters'); localStorage.setItem('bramblewood_map_revealed_v1','[\"*\"]'); localStorage.setItem('bramblewood_dialogue_flags_v1', JSON.stringify({'lesson:lumber':true}));"
        "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek'])); localStorage.setItem('bramblewood_codex_separate','1'); }"
        "sessionStorage.setItem('bramblewood_seen_splash','1');")
failures = []


def check(cond, msg):
    print(('  ok   ' if cond else '  FAIL ') + msg)
    if not cond: failures.append(msg)


async def boot(pg):
    await pg.wait_for_timeout(1500)
    # every card seen and owned (so the album has many pages and every section), every feature open, Map 10+ reached (Separated view)
    await pg.evaluate("""FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key));
      Object.keys(getCardDefs()).filter(id=> !getCardDefs()[id].test).forEach(id=>{ try{ unlockCardForPlayer(id, 'test'); }catch(e){} });
      try{ const pr = loadConquestProgress(); mainConquestMaps().slice(0, 12).forEach(m=> m.nodes.forEach(n=>{ const k = conquestNodeId(m.id, n.key); if(!pr.completed.includes(k)) pr.completed.push(k); })); saveConquestProgress(pr); }catch(e){}
      1""")
    # a fresh load (the unlocks' level-up moments and toasts are over), and no dialogue / toast / FX overlay over the screenshots
    await pg.reload(); await pg.wait_for_timeout(1500)
    await pg.add_style_tag(content='#toastHost, #dialogueDock, body > [class*="fx"], body > [class*="fs-"]{display:none !important;}')


async def swipe(pg, cdp, sel, dx):
    box = await pg.evaluate(f"(()=>{{ const r = document.querySelector('{sel}').getBoundingClientRect(); return [r.left + r.width/2, r.top + Math.min(r.height/2, 300)]; }})()")
    x, y = box
    await cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': x, 'y': y}]})
    for k in range(1, 9):
        await cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': x + dx * k / 8, 'y': y + 2}]})
        await pg.wait_for_timeout(16)
    await cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
    await pg.wait_for_timeout(700)


async def run(p, tag, vp, mobile):
    b = await p.chromium.launch(executable_path=EXE)
    ctx = await b.new_context(viewport=vp, is_mobile=mobile, has_touch=mobile, device_scale_factor=2 if mobile else 1)
    pg = await ctx.new_page()
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('dialog', lambda d: asyncio.ensure_future(d.accept()))
    await pg.add_init_script(INIT)
    await pg.goto(URL); await boot(pg)
    cdp = await ctx.new_cdp_session(pg)

    # ---- the Bestiary (Browse, album view)
    await pg.evaluate("codexViewMode = 'album'; codexSubTab = 'browse'; switchTab('codex'); 1"); await pg.wait_for_timeout(1800)
    info = await pg.evaluate("""(()=>{ const g = document.getElementById('codexGrid'); const pages = [...g.querySelectorAll('.al-page:not(.is-blank)')];
      const secs = [...g.querySelectorAll('.al-sec')].map(s=> s.textContent.trim());
      const opts = [...g.querySelectorAll('[data-pgjump] option')].slice(1).map(o=> o.textContent.trim());
      return {pages: pages.length, perPage: pages.map(p=> p.querySelectorAll('.al-sleeve').length), slots: pages.map(p=> p.querySelectorAll('.al-sleeve, .al-slot').length),
        cols: getComputedStyle(g.querySelector('.al-grid')).gridTemplateColumns.split(' ').length, secs, opts, total: codexAlbumState.pages.length,
        bar: !!g.querySelector('.pg-nav-album .pg-btn, .pg-nav .pg-btn'), corners: g.querySelectorAll('.al-album .pg-corner').length,
        hscroll: document.documentElement.scrollWidth > window.innerWidth + 1,
        tileW: Math.round(g.querySelector('.al-sleeve').getBoundingClientRect().width)}; })()""")
    print(f'[{tag}] album:', info)
    check(info['cols'] == 4 and all(n == 16 for n in info['slots']), f'[{tag}] Bestiary: 16 sleeves a page, 4 across ({info["slots"]}, {info["cols"]} columns)')
    check(info['perPage'][0] == 16 or info['total'] == 1, f'[{tag}] Bestiary: the first page is full ({info["perPage"]})')
    names = info['secs'] + info['opts']
    check(all('·' not in s and len(s) <= 24 for s in names), f'[{tag}] Bestiary: short section names ({sorted(set(names))})')
    check(not info['bar'] and info['corners'] >= 4, f'[{tag}] Bestiary: the turn buttons are on the book ({info["corners"]} corner buttons), no bar below')
    check(not info['hscroll'], f'[{tag}] Bestiary: no horizontal scroll')
    await pg.screenshot(path=os.path.join(OUT, f'{tag}-bestiary.png'))
    tip = await pg.evaluate("(document.querySelector('#codexGrid .al-sec[title]') || {}).title || ''")
    check(bool(tip) or tag == 'phone', f'[{tag}] Bestiary: a section keeps its detail in a tooltip ({tip!r})')
    # >> and <<
    await pg.click('#codexGrid [data-turn="last"]'); await pg.wait_for_timeout(700)
    last = await pg.evaluate("codexPage + codexAlbumState.L.pages >= codexAlbumState.pages.length")
    check(last, f'[{tag}] Bestiary: >> opens the last page')
    await pg.screenshot(path=os.path.join(OUT, f'{tag}-bestiary-last.png'))
    await pg.click('#codexGrid [data-turn="first"]'); await pg.wait_for_timeout(700)
    check(await pg.evaluate("codexPage === 0"), f'[{tag}] Bestiary: << opens the first page')
    if mobile:
        await swipe(pg, cdp, '#codexGrid .al-album', -160)
        check(await pg.evaluate("codexPage === 1"), f'[{tag}] Bestiary: a swipe left turns to the next page')
        await pg.screenshot(path=os.path.join(OUT, f'{tag}-bestiary-swiped.png'))
        await swipe(pg, cdp, '#codexGrid .al-album', 160)
        check(await pg.evaluate("codexPage === 0"), f'[{tag}] Bestiary: a swipe right turns back')
    else:
        await pg.keyboard.press('ArrowRight'); await pg.wait_for_timeout(700)
        check(await pg.evaluate("codexPage === 2"), f'[{tag}] Bestiary: → turns the spread')
        await pg.keyboard.press('End'); await pg.wait_for_timeout(700)
        check(await pg.evaluate("codexPage + codexAlbumState.L.pages >= codexAlbumState.pages.length"), f'[{tag}] Bestiary: End opens the last spread')
        await pg.keyboard.press('Home'); await pg.wait_for_timeout(700)
        check(await pg.evaluate("codexPage === 0"), f'[{tag}] Bestiary: Home opens the first spread')

    # ---- the Skills book
    await pg.evaluate("codexSubTab = 'skills'; renderCodex(); 1"); await pg.wait_for_timeout(1500)
    bk = await pg.evaluate("""(()=>{ const b = document.getElementById('bkBook'); return {total: codexBookState.pages.length, per: codexBookState.L.pages,
      bar: !!b.querySelector('.pg-nav .pg-btn'), corners: b.querySelectorAll('.bk-spread .pg-corner').length,
      first: !!b.querySelector('[data-turn="first"]'), last: !!b.querySelector('[data-turn="last"]'), hscroll: document.documentElement.scrollWidth > window.innerWidth + 1}; })()""")
    print(f'[{tag}] book:', bk)
    check(not bk['bar'] and bk['corners'] >= 4 and bk['first'] and bk['last'], f'[{tag}] Skills book: prev / next / first / last on the book, no bar below')
    check(not bk['hscroll'], f'[{tag}] Skills book: no horizontal scroll')
    await pg.screenshot(path=os.path.join(OUT, f'{tag}-skills.png'))
    if bk['total'] > bk['per']:
        await pg.click('#bkBook [data-turn="1"]'); await pg.wait_for_timeout(700)
        check(await pg.evaluate("skillBookPage === codexBookState.L.pages"), f'[{tag}] Skills book: › turns the page')
        await pg.screenshot(path=os.path.join(OUT, f'{tag}-skills-p2.png'))
        await pg.click('#bkBook [data-turn="last"]'); await pg.wait_for_timeout(700)
        check(await pg.evaluate("skillBookPage + codexBookState.L.pages >= codexBookState.pages.length"), f'[{tag}] Skills book: >> opens the last page')
        await pg.screenshot(path=os.path.join(OUT, f'{tag}-skills-last.png'))
        await pg.click('#bkBook [data-turn="first"]'); await pg.wait_for_timeout(700)
        check(await pg.evaluate("skillBookPage === 0"), f'[{tag}] Skills book: << opens the contents')
        if mobile:
            await swipe(pg, cdp, '#bkBook .bk-spread', -160)
            check(await pg.evaluate("skillBookPage === 1"), f'[{tag}] Skills book: a swipe left turns the page')
            await pg.screenshot(path=os.path.join(OUT, f'{tag}-skills-swiped.png'))
        else:
            await pg.keyboard.press('ArrowRight'); await pg.wait_for_timeout(700)
            check(await pg.evaluate("skillBookPage === codexBookState.L.pages"), f'[{tag}] Skills book: → turns the page')
    else:
        check(False, f'[{tag}] Skills book: more than one spread to turn ({bk["total"]} pages)')
    check(not errs, f'[{tag}] no page errors {errs[:3]}')
    await b.close()


async def main():
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        await run(p, 'phone', {'width': 390, 'height': 844}, True)
        await run(p, 'desktop', {'width': 1366, 'height': 768}, False)
    print('codex CX e2e:', 'all passed' if not failures else f'{len(failures)} failure(s)')
    sys.exit(1 if failures else 0)

asyncio.run(main())
