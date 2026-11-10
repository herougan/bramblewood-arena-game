#!/usr/bin/env python3
"""Package LAB3 (2026-11-11): the Effects Lab's "Ideas 11-11" tab in a real browser.

    python3 tests/e2e/lab3_2026_11_11.py              # builds the Lab, then plays every look at 1366 and the first look of each entry at 390
    python3 tests/e2e/lab3_2026_11_11.py --no-build   # use the existing .fxcat/effects.html
    python3 tests/e2e/lab3_2026_11_11.py --shots      # also save a mid-effect screenshot of each entry's first look (tests/out/shots/lab3-*.png)

Checks: the tab is there ("Ideas 11-11", every entry badged "Lab only (not used yet)", every IdeasFX2 effect listed); each look plays from its
button with no page error and no "[lab2]" console error; fewer than 40 overlay nodes (.fxj) are on the page at any frame of a play; none are left
when the play ends; under prefers-reduced-motion each look shows one still node at most. GSAP runs at 3x so the run takes about three minutes.
Exits 1 on a failed check.
"""
import argparse, asyncio, http.server, socketserver, threading, functools, os, subprocess, sys
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
LAB = os.path.join(ROOT, '.fxcat')
OUT = os.path.join(ROOT, 'tests', 'out', 'shots')
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
SPEED = 3
fails = []
def ok(cond, msg):
    if not cond: print('  FAIL ' + msg); fails.append(msg)
    return cond

def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    httpd = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=LAB))
    threading.Thread(target=httpd.serve_forever, daemon=True).start(); return httpd

# a frame sampler: the most .fxj overlays seen on the page since the last reset
SAMPLER = """(()=>{ window.__fxjMax = 0; const loop = ()=>{ const n = document.querySelectorAll('.fxj').length; if(n > window.__fxjMax) window.__fxjMax = n; requestAnimationFrame(loop); }; requestAnimationFrame(loop); })()"""
PLAY = """async ([id, v, speed])=>{ window.__fxjMax = 0; if(window.gsap) gsap.globalTimeline.timeScale(speed);
  const tab = LAB2.tabs.ideas2; const t0 = performance.now(); await tab.play(id, v); await new Promise(r=> requestAnimationFrame(()=> requestAnimationFrame(r)));
  return {max: window.__fxjMax, left: document.querySelectorAll('.fxj').length, live: window.IdeasFX2 ? IdeasFX2.live() : -1, ms: Math.round(performance.now() - t0)}; }"""

async def page_at(b, url, w, reduced=False):
    ctx = await b.new_context(viewport={'width': w, 'height': 844 if w < 700 else 900}, reduced_motion='reduce' if reduced else 'no-preference')
    pg = await ctx.new_page(); errs = []; cons = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: cons.append(m.text) if m.type == 'error' and 'Failed to load resource' not in m.text else None)
    await pg.goto(url + '#ideas2'); await pg.wait_for_timeout(1200)
    await pg.evaluate(SAMPLER)
    return ctx, pg, errs, cons

async def main(a):
    if not a.no_build:
        r = subprocess.run([sys.executable, os.path.join(ROOT, 'tools', 'effects-lab', 'build.py')], cwd=ROOT, capture_output=True, text=True)
        if not ok(r.returncode == 0, 'the Lab builds (tools/effects-lab/build.py): ' + r.stderr[-400:]): return
    if not ok(os.path.exists(os.path.join(LAB, 'effects.html')), '.fxcat/effects.html exists'): return
    os.makedirs(OUT, exist_ok=True)
    httpd = serve(); url = f'http://127.0.0.1:{httpd.server_address[1]}/effects.html'
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME if os.path.exists(CHROME) else None)
        # ---- the tab itself
        ctx, pg, errs, cons = await page_at(b, url, 1366)
        info = await pg.evaluate("""()=>{ const sec = document.getElementById('ideas2'), btn = document.querySelector('nav.toc [data-tab="ideas2"]');
          const cards = [...sec.querySelectorAll('.war-fx')];
          return {btn: btn ? btn.textContent : '', shown: !sec.hidden, title: (sec.querySelector('h2') || {}).textContent || '',
            cards: cards.map(c=> ({id: c.dataset.id, badge: (c.querySelector('.ig-row') || {}).textContent || '', note: (c.querySelector('p') || {}).textContent || '', sig: (c.querySelector('.war-sig') || {}).textContent || '',
              v: [...c.querySelectorAll('[data-play]')].map(x=> +x.dataset.v)})),
            names: window.IdeasFX2 ? IdeasFX2.names : [], groups: [...sec.querySelectorAll('.war-h')].map(h=> h.dataset.gh)}; }""")
        ok('Ideas 11-11' in info['btn'] and info['shown'] and 'Ideas 11-11' in info['title'], f"the tab button and title say Ideas 11-11 ({info['btn']!r}, shown {info['shown']})")
        ok(len(info['names']) >= 40, f"IdeasFX2 has 40+ effects ({len(info['names'])})")
        ok(len(info['cards']) >= 47, f"the tab lists 47+ entries ({len(info['cards'])})")
        ok(all('Lab only' in c['badge'] and 'not used yet' in c['badge'] for c in info['cards']), 'every entry is badged "Lab only (not used yet)"')
        ok(all(c['note'].startswith('Used ') for c in info['cards']), 'every entry has its one-line "Used for" (Used for / when / at ...)')
        ok(all(len(c['v']) >= 2 for c in info['cards']), 'every entry has 2+ looks')
        sigs = ' '.join(c['sig'] for c in info['cards'])
        missing = [n for n in info['names'] if ('IdeasFX2.' + n + '(') not in sigs]
        ok(not missing, f'every IdeasFX2 effect is in the tab (missing: {missing})')
        ok(len(info['groups']) >= 12, f"grouped by category ({info['groups']})")
        # one real click on a button (the rest go through the same tab.play)
        await pg.click('#ideas2 [data-play="j-heal"][data-v="0"]'); await pg.wait_for_timeout(250)
        ok(await pg.evaluate("document.querySelectorAll('.fxj').length") > 0, 'a click on ▶ plays the effect (overlays appear)')
        await pg.wait_for_timeout(1800)
        # ---- every look at 1366
        plays = [(c['id'], v) for c in info['cards'] for v in c['v']]; worst = (0, None); slow = []
        for (cid, v) in plays:
            r = await pg.evaluate(PLAY, [cid, v, SPEED])
            if r['max'] > worst[0]: worst = (r['max'], f'{cid} v{v}')
            ok(r['max'] < 40, f'{cid} v{v}: under 40 live nodes (max {r["max"]})')
            ok(r['left'] == 0 and r['live'] == 0, f'{cid} v{v}: nothing left when it ends ({r["left"]} on the page, {r["live"]} tracked)')
            if r['ms'] > 8500: slow.append(f'{cid} v{v} {r["ms"]} ms')
        ok(not slow, f'every look resolves before the Lab\'s 9 s cap at {SPEED}x ({slow})')
        ok(not errs, f'no page errors at 1366 ({errs[:3]})'); ok(not [c for c in cons if '[lab2]' in c or 'IdeasFX2' in c], f'no "[lab2]" console errors at 1366 ({cons[:3]})')
        print(f'  1366: {len(plays)} looks played, the most overlays at once {worst[0]} ({worst[1]})')
        # ---- screenshots mid-effect (first look of each entry)
        if a.shots:
            for c in info['cards']:
                await pg.evaluate("([id, v])=>{ gsap.globalTimeline.timeScale(1); LAB2.tabs.ideas2.play(id, v); }", [c['id'], 0]); await pg.wait_for_timeout(450)
                await pg.screenshot(path=os.path.join(OUT, f"lab3-{c['id']}-1366.png"), clip={'x': 0, 'y': 0, 'width': 1366, 'height': 900})
                await pg.wait_for_timeout(2600)
        await ctx.close()
        # ---- 390: the first look of each entry
        ctx, pg, errs, cons = await page_at(b, url, 390); worst = (0, None)
        for c in info['cards']:
            r = await pg.evaluate(PLAY, [c['id'], 0, SPEED])
            if r['max'] > worst[0]: worst = (r['max'], c['id'])
            ok(r['max'] < 40 and r['left'] == 0, f"390 {c['id']}: under 40 live nodes and nothing left (max {r['max']}, left {r['left']})")
        ok(not errs, f'no page errors at 390 ({errs[:3]})'); ok(not [c for c in cons if '[lab2]' in c or 'IdeasFX2' in c], f'no "[lab2]" console errors at 390 ({cons[:3]})')
        print(f'  390: {len(info["cards"])} looks played, the most overlays at once {worst[0]} ({worst[1]})')
        if a.shots:
            for cid in ['j-sequester', 'j-crit-heat', 'j-swoop', 'j-aurora', 'j-bossintro', 'j-lumber']:
                await pg.evaluate("([id, v])=>{ gsap.globalTimeline.timeScale(1); LAB2.tabs.ideas2.play(id, v); }", [cid, 0]); await pg.wait_for_timeout(500)
                await pg.screenshot(path=os.path.join(OUT, f'lab3-{cid}-390.png')); await pg.wait_for_timeout(2600)
        await ctx.close()
        # ---- reduced motion: one still node at most, nothing left
        ctx, pg, errs, cons = await page_at(b, url, 1366, reduced=True)
        for c in info['cards']:
            r = await pg.evaluate(PLAY, [c['id'], c['v'][-1], SPEED])
            ok(r['max'] <= 1 and r['left'] == 0, f"reduced motion {c['id']}: one still node at most ({r['max']}), nothing left ({r['left']})")
        ok(not errs, f'no page errors under reduced motion ({errs[:3]})')
        await ctx.close(); await b.close()
    httpd.shutdown()

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--no-build', action='store_true'); ap.add_argument('--shots', action='store_true')
    a = ap.parse_args(); asyncio.run(main(a))
    print('lab3 e2e:', 'ALL PASSED' if not fails else f'{len(fails)} FAILED'); sys.exit(1 if fails else 0)
