#!/usr/bin/env python3
"""Package FX7 (2026-11-12, owner 23:22: "Built 10-21/23 effects in effects hub can throw errors"): every Effects Lab entry is played, and any page error or
console.error fails the run, so a function renamed or dropped in the game (arena_app.js, copied into the Lab by tools/effects-lab/sync_fx_src.py) cannot rot a
Lab entry unnoticed again. The causes it caught: functions the entries call that were never copied into the Lab (tools/effects-lab/fx-src-extra.txt), and
helpers those functions call in turn.

    python3 tests/lab-errors-2026-11-12.py            # builds the Lab (tools/effects-lab/build.py, about 10 s), then plays every variant on 2 pages
    python3 tests/lab-errors-2026-11-12.py --no-build # use the existing .fxcat/effects.html
    python3 tests/lab-errors-2026-11-12.py --only fx7 # only the entries whose id contains this

Each variant is started and given 25 ms (GSAP and the clock at 10x, a 480 x 520 page so a stage builds in about 100 ms), then the next one starts, so a play that throws at once or within its first frames is caught
and one that throws later is credited to the play that was current. About 4 minutes on two cores (1,800 plays). Needs the game built (index.html: the Lab reuses its stylesheet).
Inputs: arena_app.js, arena_template.html, tools/effects-lab, bramblewood-fx-a.js.
"""
import argparse, asyncio, functools, http.server, json, os, socketserver, subprocess, sys, threading
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LAB = os.path.join(ROOT, '.fxcat')
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
WORKERS, STEP_MS = 2, 25
# harness noise: a play is cut off by the next one (its stage is torn down), and the small page lays an SVG out at zero size; the game never sees these
IGNORE = ('Failed to load resource', 'inactive document', 'non-rendered element', 'A negative value is not valid')

async def worker(b, url, ids, errs, cur):
    pg = await b.new_page(viewport={'width': 480, 'height': 520})
    def add(kind, msg): errs.setdefault(cur[0], []).append(kind + ': ' + msg.strip().split('\n')[0][:220])
    pg.on('pageerror', lambda e: add('pageerror', str(e)) if not any(s in str(e) for s in IGNORE) else None)
    pg.on('console', lambda m: add('console.error', m.text) if m.type == 'error' and not any(s in m.text for s in IGNORE) else None)
    cur[0] = 'load'
    await pg.goto(url); await pg.wait_for_timeout(1500)
    await pg.evaluate('FXLAB.setSpeed(10)')
    for id_, key in ids:
        cur[0] = f'{id_}/{key}'
        await pg.evaluate('([i, k])=>{ FXLAB.play(i, k); }', [id_, key])
        await pg.wait_for_timeout(STEP_MS)
    cur[0] = 'tail'; await pg.wait_for_timeout(1500)
    await pg.close()

async def main(a):
    from playwright.async_api import async_playwright
    if not a.no_build:
        r = subprocess.run([sys.executable, os.path.join(ROOT, 'tools', 'effects-lab', 'build.py')], cwd=ROOT, capture_output=True, text=True)
        if r.returncode: print('  FAIL the Lab does not build:', (r.stderr or r.stdout)[-400:]); return 1
    if not os.path.exists(os.path.join(LAB, 'effects.html')): print('  FAIL .fxcat/effects.html is missing'); return 1
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *x): pass
    httpd = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=LAB)); threading.Thread(target=httpd.serve_forever, daemon=True).start()
    url = f'http://127.0.0.1:{httpd.server_address[1]}/effects.html'
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME if os.path.exists(CHROME) else None)
        pg = await b.new_page(); await pg.goto(url); await pg.wait_for_timeout(1500)
        ids = await pg.evaluate('FXLAB.list().flatMap(r=> r.variants.map(v=> [r.id, v.key]))')
        probs = await pg.evaluate('FXLAB.problems')
        await pg.close()
        if a.only: ids = [x for x in ids if a.only in x[0]]
        errs, fails = {}, 0
        if probs: errs['registration'] = ['problem: ' + s[:200] for s in probs]
        shares = [ids[i::WORKERS] for i in range(WORKERS)]
        await asyncio.gather(*[worker(b, url, s, errs, [None]) for s in shares if s])
        await b.close()
    n = len(ids); bad = {k: v for k, v in errs.items() if k not in ('load', 'tail')} | {k: v for k, v in errs.items() if k in ('load', 'tail')}
    print(f'lab-errors: {n} Lab plays, {len(bad)} with errors')
    for k, v in sorted(bad.items()): print('  x', k, '|', v[0], '' if len(v) == 1 else f'(+{len(v) - 1} more)')
    return 1 if bad else 0

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--no-build', action='store_true'); ap.add_argument('--only', default='')
    sys.exit(asyncio.run(main(ap.parse_args())))
