#!/usr/bin/env python3
"""Multiplayer dungeons in the browser (2026-11-12, package DUNGEON1; owner 23:47 notes 18, 21).

    python3 tests/e2e/dungeon1_2026_11_12.py            # checks; screenshots into docs/screens/dungeon1/
    BW_SHOTS=0 python3 tests/e2e/dungeon1_2026_11_12.py # checks only

Checks (Admin Mode, so the Mire Warren preview shows):
  1. the Arena's Co-op pane lists every open dungeon as its own card (the vault and the Mire Warren);
  2. a solo room for the vault: the banner (name, blurb, Solo), 5 parts on the track with the crown on the last, 2 seats (mine, an empty
     slot), the rules line, "How it works" with the pay table (5 cells: 100 / 40 / 15 / 10 / 5 %), the Dungeons switcher;
  3. the switcher moves the lobby to the Mire Warren (3 parts, its own name and banner), the room's type follows;
  4. Start the climb: the normal board, the coop bar names "Part 1/3", the "Part 1" ribbon shows;
  5. a part won (the enemy's bramble down in a round): the match goes on (not over), the table is on part 2, the ribbon says "Part 2",
     the enemy has new units with Wait, some in its middle row;
  6. dark mode looks the same (the room keeps its own dark background); no page errors.
Shots at 390 and 1366: the room, the room with "How it works" open, the room in dark mode, the part ribbon on the board.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
URL = 'file://' + os.path.join(ROOT, 'index.html')
EXE = os.environ.get('BW_CHROMIUM', '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell')
SHOTS = os.environ.get('BW_SHOTS', '1') != '0'
OUT = os.path.join(ROOT, 'docs', 'screens', 'dungeon1')
INIT = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_arena_faction','otters'); sessionStorage.setItem('bramblewood_seen_splash','1');"
        "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying']));")
failures = []

def check(cond, msg):
    print(('  ok   ' if cond else '  FAIL ') + msg)
    if not cond: failures.append(msg)

async def shot(page, name, widths=(390, 1366), height=None):
    if not SHOTS: return
    os.makedirs(OUT, exist_ok=True)
    for w in widths:
        await page.set_viewport_size({'width': w, 'height': height or (844 if w < 700 else 860)}); await page.wait_for_timeout(450)
        f = os.path.join(OUT, f'{name}-{w}.png'); await page.screenshot(path=f, full_page=False, animations='disabled', timeout=120000); print('  shot', os.path.relpath(f, ROOT))
    await page.set_viewport_size({'width': 390, 'height': 844}); await page.wait_for_timeout(200)

async def new_page(browser, dark=False):
    ctx = await browser.new_context(viewport={'width': 390, 'height': 844}, **({'color_scheme': 'dark'} if dark else {}))
    page = await ctx.new_page(); page.set_default_timeout(180000); errs = []
    page.on('pageerror', lambda e: errs.append(str(e)))
    await page.add_init_script(INIT)
    await page.goto(URL, timeout=180000); await page.wait_for_timeout(1500)
    await page.evaluate("""()=>{ deckSizeOkOrWarn = ()=> true; adminModeEnabled = true; try{ FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); }catch(e){} try{ const s = settleEnergy(); s.current = 60; saveEnergyState(s); }catch(e){} }""")
    return page, errs

async def main():
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(executable_path=EXE if os.path.exists(EXE) else None, args=['--enable-unsafe-swiftshader', '--use-angle=swiftshader'])
        page, errs = await new_page(browser)
        # 1. the cards
        cards = await page.evaluate("()=>{ const d = document.createElement('div'); d.innerHTML = groupDungeonCardsHTML(); return [...d.querySelectorAll('.dg-card.dg-group')].map(c=> c.dataset.gdType); }")
        check(cards == ['hollow', 'mire'], f'the Co-op pane lists every open dungeon: {cards}')
        # 2. the vault's room
        await page.evaluate("()=> gdCreate(true, 'hollow')"); await page.wait_for_timeout(900)
        r = await page.evaluate("""()=>{ const q = s=> document.querySelector('#gdOverlay ' + s), qa = s=> [...document.querySelectorAll('#gdOverlay ' + s)];
          return {name: (q('.dg1-banner h2')||{}).textContent, blurb: !!q('.dg1-banner-text p'), solo: !!q('.dg1-banner .gd-kind-solo'), parts: qa('.dg1-track .dg1-part').length,
            boss: qa('.dg1-track .dg1-part').pop().classList.contains('is-boss'), seats: qa('.gd-seat').length, me: qa('.gd-seat.is-me').length, empty: qa('.gd-seat.is-empty').length,
            rules: !!q('.dg1-rules'), more: !!q('details.dg1-more'), pay: qa('.dg1-pay-cell').map(x=> x.textContent.trim()), sw: qa('.dg1-switch-btn').length, start: !!q('[data-gd-act="start"]')}; }""")
        check(r['name'] == 'The Tidelock Vault' and r['blurb'] and r['solo'], f"the banner: name, blurb, Solo ({r['name']})")
        check(r['parts'] == 5 and r['boss'], f"the track: 5 parts, the crown on the last ({r['parts']})")
        check(r['seats'] == 2 and r['me'] == 1 and r['empty'] == 1, f"the seats: mine and an empty slot ({r['seats']}, {r['me']}, {r['empty']})")
        check(r['rules'] and r['more'] and r['pay'] == ['5/5 100%', '4/5 40%', '3/5 15%', '2/5 10%', '1/5 5%'], f"the rules line, How it works, the pay table {r['pay']}")
        check(r['sw'] == 2 and r['start'], 'the switcher (2 dungeons) and Start')
        await shot(page, 'room', height=1100)
        await page.evaluate("()=>{ document.querySelector('#gdOverlay details.dg1-more').open = true; }")
        await shot(page, 'room-details', height=1300)
        # 3. switch
        await page.click('#gdOverlay [data-gd-act="switch"][data-type="mire"]'); await page.wait_for_timeout(600)
        s = await page.evaluate("()=> ({type: GD.typeId, room: GD.s.room.typeId, name: (document.querySelector('#gdOverlay .dg1-banner h2')||{}).textContent, parts: document.querySelectorAll('#gdOverlay .dg1-track .dg1-part').length})")
        check(s['type'] == 'mire' and s['room'] == 'mire' and s['name'] == 'The Mire Warren' and s['parts'] == 3, f'the switcher moves the lobby: {s}')
        await shot(page, 'room-mire', height=1000)
        # 4. start
        # every ribbon that shows is noted as it is added (it lives 2.6 s; a loaded machine may be slower than any fixed wait)
        await page.evaluate("()=>{ window.__dg1Seen = []; new MutationObserver(ms=> ms.forEach(m=> m.addedNodes.forEach(n=>{ if(n.classList && n.classList.contains('dg1-part-banner')) window.__dg1Seen.push((n.querySelector('b')||{}).textContent || ''); }))).observe(document.body, {childList: true}); }")
        await page.click('#gdOverlay [data-gd-act="start"]')
        for _ in range(40):
            if await page.evaluate("()=> window.__dg1Seen.length > 0 && !!document.querySelector('#coopBar .dg1-part-chip')"): break
            await page.wait_for_timeout(250)
        f = await page.evaluate("()=> ({mode: matchState && matchState.mode, chip: (document.querySelector('#coopBar .dg1-part-chip')||{}).textContent || '', banner: window.__dg1Seen[0] || ''})")
        check(f['mode'] == 'coop' and f['chip'].startswith('Part 1/3') and f['banner'].startswith('Part 1:'), f'the climb starts on the board, Part 1 named: {f}')
        await page.wait_for_timeout(2800)
        # 5. a part won
        await page.evaluate("""async ()=>{ const m = matchState; window.__dg1 = {before: m.players[2].hq.maxHp}; m.players[2].hq.hp = 0;
          const p = resolveRound({run: ()=> true}); await new Promise(r=> setTimeout(r, 700)); window.__dg1.banner = (document.querySelector('.dg1-part-banner b')||{}).textContent || ''; await p; }""")
        await page.wait_for_timeout(600)
        w = await page.evaluate("""()=>{ const m = matchState, T = m.coop.T, P2 = m.players[2], res = (P2.reserve||[])[0] || {};
          const front = [...P2.row.left, ...P2.row.center, ...P2.row.right], arr = (T.lastAdvance||{}).arrivals || [];
          return {over: !!m.over, idx: T.floorIdx, banner: window.__dg1.banner, hp: P2.hq.hp, arr: arr.length, wait: arr.every(a=> a.wait >= 1), mid: Object.keys(res).filter(k=> res[k]).length, cap: m.raidRoundCap - m.coopRoundOffset}; }""")
        check(not w['over'] and w['idx'] == 1 and w['hp'] > 0, f"a part won: the match goes on, on part 2 ({w})")
        check(w['banner'].startswith('Part 2:'), f"the ribbon: {w['banner']}")
        check(w['arr'] >= 3 and w['wait'] and w['mid'] >= 1 and w['cap'] == 20, 'the next part\'s units arrived with Wait, some in the middle row; its own 20 turns')
        if SHOTS:
            await page.evaluate("()=> dungeon1PartBanner(matchState.coop.T)"); await page.wait_for_timeout(1000)
            await shot(page, 'part-banner')
        check(not errs, f'no page errors {errs[:3]}')
        # 6. dark mode
        dpage, derrs = await new_page(browser, dark=True)
        await dpage.evaluate("()=> gdCreate(true, 'hollow')"); await dpage.wait_for_timeout(900)
        bg = await dpage.evaluate("()=> getComputedStyle(document.querySelector('#gdOverlay')).backgroundImage")
        check('gradient' in bg, 'dark mode: the room keeps its own background')
        await shot(dpage, 'room-dark', height=1100)
        check(not derrs, f'no page errors (dark) {derrs[:3]}')
        await browser.close()
    print(f"dungeon1 e2e: {'FAIL ' + str(len(failures)) if failures else 'ok'}")
    sys.exit(1 if failures else 0)

asyncio.run(main())
