#!/usr/bin/env python3
"""Screenshot any screen of the built game (2026-10-21, workflow audit), so a chat or agent can look at the game
without writing a new Playwright script each time.

    python3 tools/shot.py                                  # home screen, phone (390) and desktop (1366)
    python3 tools/shot.py --screen forge                   # named screen: home map codex deck nest shop profile admin forge fight
    python3 tools/shot.py --tab achievements               # any switchTab name
    python3 tools/shot.py --js "openSkirmishGallery()"     # any page-side call that opens a screen
    python3 tools/shot.py --js "switchTab('play'); startConquestMatch('m1','0-2')" --wait 2500 --name fight
    python3 tools/shot.py --widths 390 --full              # one width, full page

Writes tests/out/shots/<name>-<width>.png (gitignored) and prints the paths and any page errors. Build first.
Fonts: served over local http so the real fonts load (file:// falls back to system fonts).
"""
import argparse, asyncio, http.server, os, socketserver, threading, functools
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
SKIP_INTRO = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1');"
              "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying']));")

SCREENS = {  # --screen shortcuts: page-side calls that open each screen
    'home': "switchTab('home')", 'map': "switchTab('play')", 'codex': "switchTab('codex')", 'deck': "switchTab('deck')",
    'nest': "switchTab('nest')", 'shop': "switchTab('shop')", 'profile': "switchTab('profile')", 'admin': "switchTab('admin')",
    'forge': "codexSubTab='forge'; switchTab('codex')",
    'fight': "switchTab('play'); startConquestMatch('m1','0-2')",
}

def serve():
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    handler = functools.partial(Quiet, directory=ROOT)
    httpd = socketserver.TCPServer(('127.0.0.1', 0), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd

async def main(a):
    httpd = serve()
    url = f'http://127.0.0.1:{httpd.server_address[1]}/index.html'
    out = os.path.join(ROOT, 'tests', 'out', 'shots'); os.makedirs(out, exist_ok=True)
    async with async_playwright() as p:
        exe = CHROME if os.path.exists(CHROME) else '/opt/pw-browsers/chromium'
        b = await p.chromium.launch(executable_path=exe, args=['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'])
        for w in [int(x) for x in a.widths.split(',')]:
            h = 844 if w < 700 else 860
            pg = await b.new_page(viewport={'width': w, 'height': h})
            errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
            await pg.route('**/gsap.min.js', lambda r: r.fulfill(path=os.path.join(ROOT, 'gsap.min.js')) if os.path.exists(os.path.join(ROOT, 'gsap.min.js')) else r.continue_())
            await pg.add_init_script(SKIP_INTRO)
            await pg.goto(url); await pg.wait_for_timeout(1300)
            if not a.locked:
                await pg.evaluate("(()=>{ try{ FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); }catch(e){} })()")
            if a.screen: await pg.evaluate(f"(async()=>{{ {SCREENS[a.screen]} }})()")
            if a.tab: await pg.evaluate(f"switchTab({a.tab!r})")
            if a.js: await pg.evaluate(f"(async()=>{{ {a.js} }})()")
            await pg.wait_for_timeout(a.wait)
            f = os.path.join(out, f'{a.name or a.screen or a.tab or "home"}-{w}.png')
            await pg.screenshot(path=f, full_page=a.full, timeout=120000, animations='disabled')
            print(f, ('ERRORS: ' + ' | '.join(errs[:3])) if errs else '')
            await pg.close()
        await b.close()
    httpd.shutdown()

if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--screen', choices=sorted(SCREENS)); ap.add_argument('--tab'); ap.add_argument('--js'); ap.add_argument('--name')
    ap.add_argument('--widths', default='390,1366'); ap.add_argument('--wait', type=int, default=900)
    ap.add_argument('--full', action='store_true'); ap.add_argument('--locked', action='store_true', help='keep features locked (a new player)')
    asyncio.run(main(ap.parse_args()))
