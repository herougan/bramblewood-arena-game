#!/usr/bin/env python3
"""UI38 (2026-11-09, owner 03:55; updated by UI39: one combined view, a concept is a placeholder card) browser check: the admin Map cards window's Prospects view with the bigger pool. Maps 0, 5 and 14 (and every main map's
counts): NEW! 30+ and Carried 20+ (Map 0 has no earlier map, Map 1 only Map 0's few cards), both groups open, no fold, no side-map card; a concept chip with
the "Proposed" pill and its hover text; a Yes on a concept is kept (localStorage), counted, exported with its fields, and makes it Carried on the next map.
Both widths.
    python3 tests/e2e/ui38_2026_11_09.py      (build first; writes docs/screens/ui38/*.png; needs Playwright)"""
import asyncio, os, json, functools, threading, http.server, socketserver
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
OUT = os.path.join(ROOT, 'docs', 'screens', 'ui38'); os.makedirs(OUT, exist_ok=True)
SKIP = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1');"
        "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying']));"
        "localStorage.setItem('bw_ui37_view_v1', 'pros');")
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

def E(body): return "(async()=>{ " + body + " })()"
OPEN = "adminModeEnabled = true; pk1OpenMapCards(%s); await new Promise(r=> setTimeout(r, 700));"
STATE = """const g = k=> [...document.querySelectorAll('#ui37Pros [data-ui37-grp="' + k + '"] .ui37-tile')].map(t=> t.dataset.ui37Id);
  const m = document.querySelector('.pk1-mc-modal'), shown = g('new').concat(g('carried')), side = ui38SideOnly(ui37Live && ui37Live.top);
  return {view: m && m.dataset.ui39 === '1' ? 'pros' : 'lists', /* 2026-11-09 (UI39): one view */ neu: g('new'), car: g('carried'), concepts: shown.filter(id=> id.startsWith('concept-')).length, fold: !!document.querySelector('#ui37Pros details'),
    sideShown: shown.filter(id=> side.has(id) && !ui43TutorialCards().includes(id)) /* 2026-11-10: the tutorial's cards pass (UI43) */, visibleSecs: [...m.children].filter(x=> x.offsetParent !== null).map(x=> x.className).join(' | '), map: (document.querySelector('.ui37-map') || {}).textContent};"""

async def main():
    h = serve(); url = f'http://127.0.0.1:{h.server_address[1]}/index.html'
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME if os.path.exists(CHROME) else None, args=['--no-sandbox'])
        ctx = await b.new_context(viewport={'width': 1366, 'height': 900}, accept_downloads=True)
        pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.add_init_script(SKIP); await pg.goto(url); await pg.wait_for_function("typeof ui37Picks !== 'undefined'", timeout=120000); await pg.wait_for_timeout(1800)  # 2026-11-11 (UI47): wait for the page script (was a fixed sleep: "ui37Picks is not defined")
        await pg.evaluate("localStorage.removeItem('bw_ui37_map_picks_v1'); for(const k in ui37Picks) delete ui37Picks[k];")
        mains = await pg.evaluate("ui37MapsData().filter(m=> m.n <= 20).map(m=> ({id: m.id, n: m.n, name: m.name}))")
        # 1 every main map 0-20: counts
        sizes = []
        for m in mains:
            await pg.evaluate(E(OPEN % json.dumps(m['id']) + "return 1;"))
            s = await pg.evaluate(E(STATE)); sizes.append((m['n'], len(s['neu']), len(s['car']), s['concepts']))
            ok(len(s['neu']) >= 45, f"Map {m['n']}: NEW! {len(s['neu'])} >= 45 ({s['concepts']} concepts)")  # 2026-11-10 (UI45): was 30
            ok(len(s['car']) <= 7, f"Map {m['n']}: Carried {len(s['car'])} (no fill: only the tutorial's cards with no flags)")  # 2026-11-10 (UI45): was >= 19 from a top-up
            ok(not s['fold'] and not s['sideShown'], f"Map {m['n']}: no fold, no side-map card")
        print('   sizes (map, NEW!, Carried, concepts):', sizes)
        # 2 Maps 0, 5, 14: screenshots; only the head, switch and Prospects are visible
        for n in (0, 5, 14):
            m = next(x for x in mains if x['n'] == n)
            await pg.evaluate(E(OPEN % json.dumps(m['id']) + "return 1;"))
            s = await pg.evaluate(E(STATE))
            ok(s['view'] == 'pros', f"Map {n}: the combined view shows (UI39)")
            await pg.screenshot(path=os.path.join(OUT, f'map{n}-1366.png'))
            await pg.evaluate("document.querySelector('.pk1-mc-modal').scrollTop = document.querySelector('[data-ui37-grp=carried]').offsetTop - 60"); await pg.wait_for_timeout(150)
            await pg.screenshot(path=os.path.join(OUT, f'map{n}-carried-1366.png'))
        # 3 a concept: chip, pill, hover, flag, export, carried on the next map
        m14 = next(x for x in mains if x['n'] == 14); m15 = next(x for x in mains if x['n'] == 15)
        await pg.evaluate(E(OPEN % json.dumps(m14['id']) + "return 1;"))
        cid = await pg.evaluate("(document.querySelector('#ui37Pros .ui37-tile.is-concept') || {dataset: {}}).dataset.ui37Id || null")
        ok(bool(cid), 'Map 14 shows a concept tile: ' + str(cid))
        if cid:
            sel = f'#ui37Pros .ui37-tile[data-ui37-id="{cid}"]'
            pill = await pg.evaluate(f"(document.querySelector('{sel} .ui37-src.is-concept') || {{}}).textContent")
            ok(pill == 'Proposed', 'the concept has the "Proposed" pill')
            ok(await pg.evaluate(f"!document.querySelector('{sel} img:not(.emoji)')"), 'the concept card has no art')
            await pg.hover(f'{sel} .ui38-concept'); await pg.wait_for_timeout(350)
            tip = await pg.evaluate("(document.querySelector('.cnp-rw-zoom.cnp-rw-tip') || {}).textContent || ''")
            ok('Proposed new card' in tip, 'hovering the concept shows its text: ' + tip[:90])
            await pg.screenshot(path=os.path.join(OUT, 'map14-concept-hover-1366.png'))
            await pg.mouse.move(5, 5)
            await pg.click(f'{sel} [data-ui37-flag=yes]')
            st = await pg.evaluate(f"({{x: document.querySelector('[data-ui37-ct=n] .ui37-x').textContent, store: JSON.parse(localStorage.getItem('bw_ui37_map_picks_v1'))[{json.dumps(m14['id'])}].yes}})")
            ok(st['x'] == '1' and cid in st['store'], 'a Yes on a concept counts and is kept in this browser by its id')
            async with pg.expect_download() as dl: await pg.click('[data-ui37-export=json]')
            await dl.value; j = json.loads(await pg.evaluate("window.__ui37Last.body"))
            row = next((r for r in j['rows'] if r['cardId'] == cid), None); con = next((c for c in j['concepts'] if c['id'] == cid), None)
            ok(bool(row and row['concept'] and row['animal'] and row['role']) and bool(con and con['flag'] == 'yes'), 'Export .json: the concept row carries its fields, and the concepts list has it flagged')
            async with pg.expect_download() as dl: await pg.click('[data-ui37-export=csv]')
            await dl.value; body = await pg.evaluate("window.__ui37Last.body")
            ok('concept,animal,family,element,rarity,role' in body.split('\n')[0]  # 2026-11-10 (UI45): UI44 added columns after the concept ones
                and cid in body, 'Export .csv has the concept columns')
            await pg.evaluate(E(OPEN % json.dumps(m15['id']) + "return 1;"))
            s = await pg.evaluate(E(STATE)); ok(cid in s['car'], f'the concept flagged Yes on Map 14 is Carried on Map 15')
        # 4 phone
        await pg.set_viewport_size({'width': 390, 'height': 844})
        m5 = next(x for x in mains if x['n'] == 5)
        await pg.evaluate(E(OPEN % json.dumps(m5['id']) + "return 1;"))
        w = await pg.evaluate("({sw: document.documentElement.scrollWidth, mw: document.querySelector('.pk1-mc-modal').scrollWidth, cw: document.querySelector('.pk1-mc-modal').clientWidth})")
        ok(w['mw'] <= w['cw'] + 1 and w['sw'] <= 391, f'no sideways scroll at 390 ({w})')
        await pg.screenshot(path=os.path.join(OUT, 'map5-390.png'))
        ok(not errs, 'no page errors: ' + '; '.join(errs[:3]))
        await pg.evaluate("localStorage.removeItem('bw_ui37_map_picks_v1');")
        await b.close()
    h.shutdown()
    print('FAIL ' + str(len(fails)) if fails else 'ok'); raise SystemExit(1 if fails else 0)

asyncio.run(main())
