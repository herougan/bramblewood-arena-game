#!/usr/bin/env python3
"""Package LEAD (2026-10-23, owner 01:03 #12): browser checks and screenshots at 390 and 1366 of an elite's leader and a paired boss's two
leaders: the VS opener (14-7 The Cheetah Matriarch, an elite; 24-8 The Magnate Duck, two leaders) and the map panel of 24-8.

    python3 tests/e2e/lead_2026_10_23.py            # checks + shots in tests/out/shots/lead-*.png
    python3 tests/e2e/lead_2026_10_23.py --widths 1366

Build first. Exits 1 on a failed check.
"""
import argparse, asyncio, http.server, socketserver, threading, functools, os, sys
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'tests', 'out', 'shots'); os.makedirs(OUT, exist_ok=True)
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
SKIP = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1');"
        "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying']));")
OWN = ("FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); saveEnergyState({current:60, lastRegenAt:Date.now()}); try{ refreshEnergyHud(); }catch(e){}"
       " window.showCoachTip = ()=>{}; window.maybeShowCoachTip = ()=>{};")
# every fight before the target cleared, so its map is open and its deck revealed
OPEN = """(async ([mapId, key])=>{ const p = loadConquestProgress(); CONQUEST_MAPS.forEach(m=> (m.nodes||[]).forEach(n=>{ if(m.id === mapId && n.key === key) return; const id = conquestNodeId(m.id, n.key); if(!p.completed.includes(id)){ p.completed.push(id); p.ranks[id] = 'S'; } }));
  saveConquestProgress(p); switchTab('play'); await new Promise(r=> setTimeout(r, 400)); conquestSelectedMap = mapId; conquestSelectedNodeKey = key; renderPlay(); await new Promise(r=> setTimeout(r, 900)); })"""
fails = []; shots = []
def ok(cond, msg):
    print(('  ok  ' if cond else '  FAIL ') + msg)
    if not cond: fails.append(msg)

def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    httpd = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT))
    threading.Thread(target=httpd.serve_forever, daemon=True).start(); return httpd

async def fresh(b, url, w):
    pg = await b.new_page(viewport={'width': w, 'height': 844 if w < 700 else 860}, has_touch=(w < 700))
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg._errs = errs
    await pg.add_init_script(SKIP)
    await pg.goto(url); await pg.wait_for_timeout(1300)
    await pg.evaluate("(()=>{ " + OWN + " })()")
    return pg

async def shot(pg, name, w):
    f = os.path.join(OUT, f'lead-{name}-{w}.png'); await pg.screenshot(path=f, animations='allow'); shots.append(f); return f

async def vs(pg, mapId, key):
    # the VS opener holds 1.7 s (2.6 s for a boss); the shot is taken once its slide-in has settled
    return await pg.evaluate("""(([mapId, key])=>{ const f = findConquestNode(mapId, key); showVersusOpener(f.map, f.node, CHARACTER_DEFS.castle, null);
      const el = document.querySelector('.vs-opener'), L = el && el.querySelector('.vs-leaders');
      return {shown: !!el, leaders: L ? L.textContent.trim() : null, faces: L ? L.querySelectorAll('.vs-leader-face').length : 0}; })""", [mapId, key])

async def run(b, url, w):
    print(f'-- width {w}')
    pg = await fresh(b, url, w)
    await pg.evaluate(OPEN, ['m5', '14-7']); await pg.wait_for_timeout(6000)
    # clearing every earlier fight at once pays a stack of unlock / milestone toasts: off the screen before the shots
    await pg.evaluate("(()=>{ const h = document.getElementById('toastHost'); if(h) h.remove(); window.showToast = ()=>{}; })()")
    r = await vs(pg, 'm5', '14-7'); await pg.wait_for_timeout(1000)
    ok(r['shown'] and r['leaders'] and 'Savanna Cheetah' in r['leaders'] and r['faces'] == 1, f"14-7 (elite): the VS opener names its leader {r}")
    await shot(pg, 'vs-elite-14-7', w)
    await pg.wait_for_timeout(2600)
    r = await vs(pg, 'm24', '24-8'); await pg.wait_for_timeout(1000)
    ok(r['shown'] and r['leaders'] and 'Magnate Duck' in r['leaders'] and 'Iron Warden' in r['leaders'] and r['faces'] == 2, f"24-8 (paired boss): the VS opener names both leaders {r}")
    await shot(pg, 'vs-pair-24-8', w)
    await pg.wait_for_timeout(3200)
    await pg.evaluate(OPEN, ['m24', '24-8']); await pg.wait_for_timeout(500)
    r = await pg.evaluate("""(()=>{ const p = document.querySelector('#conquestNodePanel .cnp-pair'); return {pair: !!p, tiles: p ? p.querySelectorAll('.cnp-showcase').length : 0, title: p ? p.getAttribute('title') : null}; })()""")
    ok(r['pair'] and r['tiles'] == 2, f"24-8: the map panel shows both leaders {r}")
    await shot(pg, 'panel-pair-24-8', w)
    r = await pg.evaluate("""(async()=>{ conquestSelectedNodeKey = '24-5'; renderPlay(); await new Promise(r=> setTimeout(r, 600)); return {pair: !!document.querySelector('#conquestNodePanel .cnp-pair'), one: !!document.querySelector('#conquestNodePanel .cnp-showcase')}; })()""")
    ok(not r['pair'] and r['one'], f"24-5 (skirmish): one showcase, no pair {r}")
    ok(not pg._errs, f'no page errors {pg._errs[:3]}')
    await pg.close()

async def main(a):
    httpd = serve(); url = f'http://127.0.0.1:{httpd.server_address[1]}/index.html'
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME if os.path.exists(CHROME) else None, args=['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'])
        for w in [int(x) for x in a.widths.split(',')]: await run(b, url, w)
        await b.close()
    httpd.shutdown()
    print('\n'.join(shots))
    print(f'lead: {len(fails)} failed' if fails else 'lead: all checks passed')
    sys.exit(1 if fails else 0)

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--widths', default='390,1366'); asyncio.run(main(ap.parse_args()))
