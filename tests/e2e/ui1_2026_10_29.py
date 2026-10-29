#!/usr/bin/env python3
"""Package UI1 (2026-10-29, owner notes O1-O4, O8): touch-emulated browser checks for O2 ("In mobile, dragging cards sometimes drags the screen
instead"), and the raid's enemy Deck card for O1.

    python3 tests/e2e/ui1_2026_10_29.py                  # checks (no shots)
    python3 tests/e2e/ui1_2026_10_29.py --page index.html   # which built page to open (default index.html)

O2: a phone (390 wide, has_touch, mobile) with a tall spacer added so the page CAN scroll (otherwise a drag that scrolled the screen would show nothing).
Real touch input goes in through the DevTools protocol (Input.dispatchTouchEvent), so the browser's own scroll and touch-action rules apply.
  - a finger that starts on a hand card and moves up: the drag starts (dragstart, the ghost follows, body.bw-touch-dragging), the page stays at scrollY 0,
    and the class is gone after the finger lifts;
  - the hand redrawn mid-drag (the touched card leaves the page): the ghost still follows the finger and the drag still ends on release;
  - a finger that starts outside any card still scrolls the page (the control: the spacer does scroll);
  - the CSS: touch-action none on the hand's cards, the leader and the drop zones.
O1: in the raid fight at 1366 and 390 the enemy Deck card has the same height / width ratio as the Environment cards beside it (0.8 +- 0.05).
Build first. Exits 1 on a failed check."""
import argparse, asyncio, http.server, socketserver, threading, functools, os, sys
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
DONE = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1'); localStorage.setItem('bramblewood_arena_faction','otters');"
        "window.addEventListener('load', ()=>{ try{ skipTriggerLesson(); saveTutorial2Done(); saveTutorialDone(); window.deckSizeOkOrWarn = ()=> true; saveEnergyState({current:200, lastRegenAt:Date.now()});"
        " window.showCoachTip = ()=>{}; window.maybeShowCoachTip = ()=>{}; }catch(e){} });")
fails = []

def ok(cond, msg):
    print(('  ok  ' if cond else '  FAIL ') + msg)
    if not cond: fails.append(msg)

def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    httpd = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT))
    threading.Thread(target=httpd.serve_forever, daemon=True).start(); return httpd

async def page(b, url, w, touch):
    ctx = await b.new_context(viewport={'width': w, 'height': 844 if w < 700 else 860}, has_touch=touch, is_mobile=touch)
    pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg._errs = errs; pg._ctx = ctx
    await pg.add_init_script(DONE)
    await pg.goto(url); await pg.wait_for_function("typeof switchTab === 'function' && typeof startConquestMatch === 'function'", timeout=60000); await pg.wait_for_timeout(2200)
    return pg

class Finger:
    """one finger through the DevTools protocol"""
    def __init__(self, cdp): self.cdp = cdp
    async def down(self, x, y): await self.cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': x, 'y': y, 'id': 1}]})
    async def move(self, x, y): await self.cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': x, 'y': y, 'id': 1}]})
    async def up(self): await self.cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
    async def path(self, pg, x0, y0, x1, y1, steps=14, wait=22):
        for i in range(1, steps + 1):
            await self.move(x0 + (x1 - x0) * i / steps, y0 + (y1 - y0) * i / steps); await pg.wait_for_timeout(wait)

async def o2(b, url):
    print('-- O2: touch drag on a 390 phone')
    pg = await page(b, url, 390, True)
    await pg.evaluate("(async()=>{ adminModeEnabled = true; try{ skipTriggerLesson(); }catch(e){} switchTab('play'); startConquestMatch('m1', '0-2', {skipEnergyCost:true, noOpener:true}); await new Promise(r=> setTimeout(r, 2800)); return 1; })()")
    # a tall spacer after the app, so a drag that scrolled the page would show
    await pg.evaluate("(()=>{ const d = document.createElement('div'); d.id = 'ui1Spacer'; d.style.cssText = 'height:3000px; width:100%; background:#223;'; document.body.appendChild(d); document.documentElement.style.overflowY = 'scroll'; document.body.style.overflowY = 'visible'; window.__ui1 = {dragstart:0, drop:0, dragend:0}; ['dragstart','drop','dragend'].forEach(t=> document.addEventListener(t, ()=> window.__ui1[t]++, true)); return 1; })()")
    cdp = await pg._ctx.new_cdp_session(pg); f = Finger(cdp)
    css = await pg.evaluate("""(()=>{ const c = document.querySelector('#handStrip [draggable="true"]'); const z = document.querySelector('.discardzone, .skipzone, .reserve-target');
      return {card: c ? getComputedStyle(c).touchAction : null, leader: document.querySelector('#leaderWidget[draggable="true"]') ? getComputedStyle(document.querySelector('#leaderWidget')).touchAction : 'none', zone: z ? getComputedStyle(z).touchAction : 'none', hand: !!c}; })()""")
    ok(css['hand'], 'the hand has a draggable card to test with')
    ok(css['card'] in ('none', 'pan-x'), f"a hand card takes the touch's scroll itself (touch-action {css['card']})")
    ok(css['leader'] == 'none', f"the leader card too ({css['leader']})")
    ok(css['zone'] == 'none', f"a drop zone too ({css['zone']})")
    # control: a finger on the empty spacer scrolls the page
    await pg.evaluate("window.scrollTo(0, 0); 1")
    sy0 = await pg.evaluate("window.scrollY")
    await f.down(200, 800); await f.path(pg, 200, 800, 200, 560); await f.up(); await pg.wait_for_timeout(500)
    sy1 = await pg.evaluate("window.scrollY")
    ok(sy1 > sy0 + 20, f'a touch that starts outside a card still scrolls the page (scrollY {sy0} -> {sy1})')
    await pg.evaluate("window.scrollTo(0, 0); 1"); await pg.wait_for_timeout(300)
    # a hand card dragged up
    box = await pg.evaluate("(()=>{ const c = document.querySelector('#handStrip [draggable=\"true\"]'); c.scrollIntoView({block:'nearest', inline:'nearest'}); const r = c.getBoundingClientRect(); return {x: r.x + r.width/2, y: r.y + r.height/2}; })()")
    await pg.evaluate("window.scrollTo(0, 0); 1")
    box = await pg.evaluate("(()=>{ const c = document.querySelector('#handStrip [draggable=\"true\"]'); const r = c.getBoundingClientRect(); return {x: r.x + r.width/2, y: r.y + r.height/2}; })()")
    tgt = await pg.evaluate("(()=>{ const r = document.getElementById('rowMine').getBoundingClientRect(); return {x: r.x + r.width/2, y: r.y + r.height/2}; })()")
    await f.down(box['x'], box['y'])
    await f.path(pg, box['x'], box['y'], box['x'] + 6, box['y'] - 60, steps=6)
    mid = await pg.evaluate("({scroll: window.scrollY, cls: document.body.classList.contains('bw-touch-dragging'), started: window.__ui1.dragstart, ghost: !!document.querySelector('.card-tile[style*=\"position: fixed\"], [style*=\"position:fixed\"][style*=\"z-index: 9999\"]')})")
    ok(mid['started'] >= 1 and mid['cls'], f"the drag starts at once (dragstart {mid['started']}, body.bw-touch-dragging {mid['cls']})")
    await f.path(pg, box['x'] + 6, box['y'] - 60, tgt['x'], tgt['y'], steps=10)
    during = await pg.evaluate("window.scrollY")
    ok(during == 0, f'the page did not move under the drag (scrollY {during})')
    await f.up(); await pg.wait_for_timeout(700)
    end = await pg.evaluate("({scroll: window.scrollY, cls: document.body.classList.contains('bw-touch-dragging'), drop: window.__ui1.drop})")
    ok(end['scroll'] == 0 and not end['cls'], f"after the finger lifts: page still at the top, the drag class gone ({end})")
    ok(end['drop'] >= 1, f"the drop reached a target ({end['drop']})")
    await pg.wait_for_timeout(1500)
    # the hand redrawn in the middle of a drag
    box = await pg.evaluate("(()=>{ const c = document.querySelector('#handStrip [draggable=\"true\"]'); if(!c) return null; const r = c.getBoundingClientRect(); return {x: r.x + r.width/2, y: r.y + r.height/2}; })()")
    if box:
        g0 = await pg.evaluate("window.__ui1.dragstart")
        await f.down(box['x'], box['y']); await f.path(pg, box['x'], box['y'], box['x'] + 4, box['y'] - 50, steps=6)
        await pg.evaluate("renderHand(); 1"); await pg.wait_for_timeout(250)
        pos0 = await pg.evaluate("(()=>{ const g = [...document.querySelectorAll('body *')].find(e=> e.style && e.style.position === 'fixed' && e.style.zIndex === '9999'); return g ? parseFloat(g.style.top) : null; })()")
        await f.path(pg, box['x'] + 4, box['y'] - 50, box['x'] + 10, box['y'] - 160, steps=8)
        pos1 = await pg.evaluate("(()=>{ const g = [...document.querySelectorAll('body *')].find(e=> e.style && e.style.position === 'fixed' && e.style.zIndex === '9999'); return g ? parseFloat(g.style.top) : null; })()")
        sc = await pg.evaluate("window.scrollY")
        ok(pos0 is not None and pos1 is not None and pos1 < pos0 - 40, f'the hand redrawn mid-drag: the ghost still follows the finger ({pos0} -> {pos1})')
        ok(sc == 0, f'... and the page did not scroll (scrollY {sc})')
        await f.up(); await pg.wait_for_timeout(900)
        cls = await pg.evaluate("document.body.classList.contains('bw-touch-dragging')")
        ok(not cls, '... and the drag ends on release (no stuck drag class)')
    else:
        ok(False, 'no card left in the hand for the redraw check')
    ok(not pg._errs, f'no page errors {pg._errs[:2]}')
    await pg._ctx.close()

async def o1(b, url, w):
    print(f'-- O1: the raid fight at {w}')
    pg = await page(b, url, w, w < 700)
    await pg.evaluate("FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); myCurrencies.energy = 60; 1")
    await pg.evaluate("playSubTab='raid'; switchTab('play'); 1"); await pg.wait_for_timeout(500)
    await pg.evaluate("document.querySelector('.raid-hub [data-raid-open]').click()"); await pg.wait_for_timeout(500)
    await pg.evaluate("document.querySelector('[data-raid-part=left]').click()"); await pg.wait_for_timeout(1500)
    await pg.evaluate("(()=>{ const v = document.querySelector('.vs-screen'); if(v) v.click(); return 1; })()"); await pg.wait_for_timeout(5000)
    ok(await pg.evaluate("!!(matchState && matchState.raidFull)"), 'the raid fight opened')
    r = await pg.evaluate("""(()=>{ const d = document.getElementById('deckWidgetTop').getBoundingClientRect(), e = document.querySelector('#fieldCondCard .env-card, .env-card'); const eb = e && e.getBoundingClientRect(); const c = document.querySelector('.top-play-row .match-castle-tile, .top-play-row .card-tile').getBoundingClientRect();
      return {deck: [d.width, d.height], env: eb ? [eb.width, eb.height] : null, castle: [c.width, c.height]}; })()""")
    ratio = lambda wh: wh[0] / wh[1]
    ok(abs(ratio(r['deck']) - 0.8) < 0.05, f"the enemy Deck card is card-shaped ({r['deck'][0]:.0f} x {r['deck'][1]:.0f}, ratio {ratio(r['deck']):.2f})")
    if r['env']: ok(abs(r['deck'][1] - r['env'][1]) <= 3, f"... and as tall as the Environment cards beside it ({r['deck'][1]:.0f} vs {r['env'][1]:.0f})")
    ok(abs(r['deck'][1] - r['castle'][1]) <= 3, f"... and as tall as the enemy castle ({r['deck'][1]:.0f} vs {r['castle'][1]:.0f})")
    ok(not pg._errs, f'no page errors {pg._errs[:2]}')
    await pg._ctx.close()

async def main(a):
    httpd = serve(); url = f'http://127.0.0.1:{httpd.server_address[1]}/{a.page}'
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME, args=['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'])
        if 'o2' in a.only: await o2(b, url)
        if 'o1' in a.only:
            for w in (1366, 390): await o1(b, url, w)
        await b.close()
    httpd.shutdown()
    print('FAILED: %d' % len(fails) if fails else 'all passed'); sys.exit(1 if fails else 0)

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--page', default='index.html'); ap.add_argument('--only', default='o1,o2')
    asyncio.run(main(ap.parse_args()))
