#!/usr/bin/env python3
"""REF6 (2026-11-11, owner 00:16: "Make sure the win rates for reference decks are labelled in the skirmish for admins") browser check at 1366 and 390 px.
Checks: on a road fight's panel, Admin sees "Ref 100: x% (p10 a – p90 b) · Map ref y% · Ref-2 z%" with the measure in its tooltip, inside the panel's width (no
overflow at 390); with Admin off the label is gone; a fight with no measure (Map 21) has none. No page errors.
    python3 tests/e2e/ref6_2026_11_11.py        (build first; needs Playwright)  Screenshots: docs/screens/ref6/"""
import asyncio, os, sys, math, functools, threading, http.server, socketserver
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'docs', 'screens', 'ref6'); os.makedirs(OUT, exist_ok=True)
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
SKIP = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1');"
        "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying']));")
fails = []
def ok(c, m):
    print(('  ok ' if c else '  x ') + m)
    if not c: fails.append(m)
def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
        def handle(self):
            try: super().handle()
            except (BrokenPipeError, ConnectionResetError): pass
    h = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); threading.Thread(target=h.serve_forever, daemon=True).start(); return h
# open Map 3's second road fight (every earlier map cleared), Admin on or off
OPEN = """(async()=>{ adminModeEnabled = %s; const mains = mainConquestMaps(), M = mains[%d], p = loadConquestProgress();
  mains.slice(0, %d).forEach(m=> m.nodes.forEach(nd=>{ const id = conquestNodeId(m.id, nd.key); if(!p.completed.includes(id)) p.completed.push(id); })); saveConquestProgress(p);
  const node = M.nodes.filter(n=> n.deck && n.kind !== 'tutorial')[1] || M.nodes.find(n=> n.deck); conquestWorldView = false; conquestSelectedMap = M.id; conquestSelectedNodeKey = node.key; playSubTab = 'conquest'; switchTab('play');
  await new Promise(r=> setTimeout(r, 2500)); const po = document.getElementById('packOpenOverlay'); if(po) po.hidden = true; /* a reward pack the cleared maps opened, over the panel */
  const el = document.querySelector('#conquestNodePanel .ref6-label'), pn = document.getElementById('conquestNodePanel');
  const f = REF6_LABELS.fights[M.id + ':' + node.key] || null, r = el && el.getBoundingClientRect(), pr = pn && pn.getBoundingClientRect();
  return {map: M.id, key: node.key, text: el ? el.textContent : null, tip: el ? el.getAttribute('title') : null, f, players: REF6_LABELS.players, tag: REF6_LABELS.tag,
    inside: !!(r && pr && r.left >= pr.left - 1 && r.right <= pr.right + 1), docW: document.documentElement.scrollWidth, winW: innerWidth}; })()"""

async def run(b, url, w):
    print(f'-- width {w}')
    for admin in (True, False):
        ctx = await b.new_context(viewport={'width': w, 'height': 844 if w < 700 else 860}, has_touch=(w < 700), color_scheme='dark')
        pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.add_init_script(SKIP); await pg.goto(url)
        await pg.wait_for_function("typeof switchTab === 'function' && typeof ref6LabelHTML === 'function'", timeout=120000); await pg.wait_for_timeout(1500)
        r = await pg.evaluate(OPEN % ('true' if admin else 'false', 3, 3))
        if admin:
            f = r['f']; ok(f is not None, f"{r['map']} {r['key']}: the build carries its REF6 numbers")
            if f:
                rd = lambda x: int(math.floor(x + 0.5))  # Math.round, not Python's round half to even
                want = f"Ref {r['players']}: {rd(f[0])}% (p10 {rd(f[1])} – p90 {rd(f[2])})"
                ok(r['text'] is not None and r['text'].startswith(want), f"Admin sees '{r['text']}' (want '{want}...')")
                ok(r['text'] is not None and (f[3] is None or f"Map ref {rd(f[3])}%" in r['text']) and (f[4] is None or f"Ref-2 {rd(f[4])}%" in r['text']), 'with the Map reference and Reference-2')
                ok(r['tip'] is not None and r['tag'] in r['tip'], f"the tooltip names the measure ({r['tip'] and r['tip'][:70]}...)")
            ok(r['inside'] and r['docW'] <= r['winW'] + 1, f"the label stays inside the panel, no page scroll sideways (page {r['docW']} / window {r['winW']})")
            # a reward pack the cleared maps opened can sit over the panel: hide any open overlay for the shot
            await pg.add_style_tag(content='#packOpenOverlay, [class*="toast"]{display:none !important}'); await pg.wait_for_timeout(300)  # and the level-up toasts
            await pg.evaluate("(()=>{ const l = document.querySelector('#conquestNodePanel .ref6-label'); if(l) l.scrollIntoView({block: 'center'}); })()"); await pg.wait_for_timeout(400)
            await pg.screenshot(path=os.path.join(OUT, f'panel-admin-{w}.png'))
            r21 = await pg.evaluate(OPEN % ('true', 21, 21))
            ok(r21['text'] is None, f"{r21['map']}: no label on a map with no measure")
        else:
            ok(r['text'] is None, 'Admin off: no label')
        ok(not errs, f'no page errors {errs[:2]}')
        await ctx.close()

async def main():
    h = serve(); url = f'http://127.0.0.1:{h.server_address[1]}/index.html'
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME if os.path.exists(CHROME) else None, args=['--no-sandbox'])
        for w in (1366, 390): await run(b, url, w)
        await b.close()
    h.shutdown()
    print(f'ref6 e2e: {"FAIL " + str(len(fails)) if fails else "all ok"}')
    sys.exit(1 if fails else 0)
asyncio.run(main())
