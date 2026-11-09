#!/usr/bin/env python3
"""UI41 (2026-11-09, owner 21:36) browser check, dark mode, every main map 0-20: NEW! has 30+ cards, no faction card (unless flagged Yes), proposed concepts kept,
no more than 2 cards of one animal family among cards that are neither on the map's list nor flagged Yes, Yes / No carry the Keep / Cut emojis, the old Cut / Keep
button and Carried / Unique pill are hidden, the target boxes are dark. Map 3 at 1900 px: 7 cards per row (screenshot), 390 px: no sideways scroll.
    python3 tests/e2e/ui41_2026_11_09.py      (build first; writes docs/screens/ui41/*.png; needs Playwright)"""
import asyncio, os, json, functools, threading, http.server, socketserver
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
OUT = os.path.join(ROOT, 'docs', 'screens', 'ui41'); os.makedirs(OUT, exist_ok=True)
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

def E(body): return "(async()=>{ " + body + " })()"
STATE = """adminModeEnabled = true; pk1OpenMapCards(%s); await new Promise(r=> setTimeout(r, 500));
  const defs = getCardDefs(), tiles = g=> [...document.querySelectorAll('[data-ui37-grp="' + g + '"] .ui37-tile')];
  const info = t=> { const id = t.dataset.ui37Id; return {id, concept: t.classList.contains('is-concept'), src: [...t.querySelectorAll('.ui37-src')].map(x=> x.className), fam: ui38Family(id, defs)}; };
  const nw = tiles('new').map(info), cr = tiles('carried').map(info), all = nw.concat(cr);
  const yes = new Set(ui37Ent(%s).yes);
  const fac = all.filter(x=> { const d = defs[x.id]; return d && d.faction && d.faction !== 'base' && !yes.has(x.id); }).map(x=> x.id);
  const capBad = grp=> { const c = {}; grp.filter(x=> !x.src.some(s=> /is-list/.test(s)) && !yes.has(x.id) && !x.concept).forEach(x=> { if(x.fam) c[x.fam] = (c[x.fam] || 0) + 1; }); return Object.entries(c).filter(([k, v])=> v > 2).map(([k, v])=> k + ':' + v); };
  const vis = sel=> [...document.querySelectorAll(sel)].filter(x=> x.offsetParent).length;
  const i = document.querySelector('.ui37-ct input'), cs = getComputedStyle(i), m = document.querySelector('.pk1-mc-modal');
  const rows = g=> { const ys = {}; tiles(g).forEach(x=> { const y = Math.round(x.getBoundingClientRect().top); ys[y] = (ys[y] || 0) + 1; }); return Object.values(ys); };
  return {nNew: nw.length, nCar: cr.length, concepts: nw.filter(x=> x.concept).length, fac, capNew: capBad(nw), capCar: capBad(cr), acts: vis('.ui39-list .rv1-act'), pills: vis('.ui39-list .rv2-pill.is-carried, .ui39-list .rv2-pill.is-unique'),
    counts: vis('.pk1-mc-modal [data-rv2-count]'), yn: [...document.querySelectorAll('.ui37-yn-b')].slice(0, 2).map(b=> [...b.childNodes].map(n=> n.nodeType === 3 ? n.textContent : (n.alt || '')).join('')), bg: cs.backgroundColor, rowsNew: rows('new'),
    wide: m.scrollWidth - m.clientWidth, doc: document.documentElement.scrollWidth - document.documentElement.clientWidth};"""

async def main():
    h = serve(); url = f'http://127.0.0.1:{h.server_address[1]}/index.html'
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME if os.path.exists(CHROME) else None, args=['--no-sandbox'])
        ctx = await b.new_context(viewport={'width': 1900, 'height': 1000}, color_scheme='dark')
        pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.add_init_script(SKIP); await pg.goto(url); await pg.wait_for_timeout(1800)
        maps = await pg.evaluate("CONQUEST_MAPS.filter(m=> !m.reserved && !m.sub && mapNumberOf(m.id) != null && mapNumberOf(m.id) <= 20).map(m=> ({id: m.id, n: mapNumberOf(m.id)}))")
        for m in maps:
            mid = json.dumps(m['id']); s = await pg.evaluate(E(STATE % (mid, mid)))
            tag = f"Map {m['n']} ({m['id']})"
            ok(s['nNew'] >= 30, f"{tag}: NEW! has {s['nNew']} cards (30+), {s['concepts']} proposed concepts kept")
            ok(not s['fac'], f"{tag}: no faction cards {s['fac']}")
            ok(not s['capNew'] and not s['capCar'], f"{tag}: family cap 2 for picks / maybe {s['capNew']} {s['capCar']}")
            ok(s['acts'] == 0 and s['pills'] == 0 and s['counts'] == 0, f"{tag}: old Cut / Keep ({s['acts']}), Carried / Unique pill ({s['pills']}), count line ({s['counts']}) hidden")
            ok(s['yn'][0].startswith('↩') and s['yn'][1].startswith('✂'), f"{tag}: Yes / No emojis {s['yn']}")
            ok(s['bg'] != 'rgb(255, 255, 255)', f"{tag}: target box is dark ({s['bg']})")
        # Map 3 at 1900: 7 per row
        m3 = next(m for m in maps if m['n'] == 3); mid = json.dumps(m3['id']); s = await pg.evaluate(E(STATE % (mid, mid)))
        ok(max(s['rowsNew']) == 7, f"Map 3 at 1900: {max(s['rowsNew'])} NEW! cards per row (rows {s['rowsNew']})")
        await pg.screenshot(path=os.path.join(OUT, 'map3-gannet-cliffs-dark-1900.png'))
        for w in (1366, 1100, 390):
            await pg.set_viewport_size({'width': w, 'height': 900}); await pg.wait_for_timeout(300)
            s = await pg.evaluate(E(STATE % (mid, mid)))
            ok(s['wide'] <= 1 and s['doc'] <= 1, f"Map 3 at {w}: no sideways scroll; cards per row {max(s['rowsNew'])}")
        ok(not errs, 'no page errors: ' + '; '.join(errs[:3]))
        await b.close()
    h.shutdown()
    print('UI41 e2e:', 'FAIL ' + str(len(fails)) if fails else 'ok')
    raise SystemExit(1 if fails else 0)

asyncio.run(main())
