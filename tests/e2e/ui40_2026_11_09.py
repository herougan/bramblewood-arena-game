#!/usr/bin/env python3
"""UI40 (2026-11-09, owner 16:35: "Make the thematic section and keyword use the same format as the above version") browser check: in the admin Map cards window,
"Thematic Recommendation" (side maps) and "Keyword of the map" -> "Cards on this map that have it" draw full cards (art, name, stats, skills, power badge, edit)
in a wrapping grid, no chips. Counts, theme-group headings, the Claude New / New card pills (under the card) and the ranged mark (on the card) are kept.
No sideways scroll at 390. Every map's window; screenshots of a main map and a side map at 1366 and 390.
    python3 tests/e2e/ui40_2026_11_09.py      (build first; writes docs/screens/ui40/*.png; needs Playwright)"""
import asyncio, os, json, functools, threading, http.server, socketserver
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
OUT = os.path.join(ROOT, 'docs', 'screens', 'ui40'); os.makedirs(OUT, exist_ok=True)
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
OPEN = "adminModeEnabled = true; pk1OpenMapCards(%s); await new Promise(r=> setTimeout(r, 500));"
STATE = """const sec = id=>{ const s = document.getElementById(id); if(!s) return null; const t = [...s.querySelectorAll('.rv1-tile')];
    return {tiles: t.length, chips: s.querySelectorAll('.vis4-mc-card.is-chip').length, full: t.every(x=> x.querySelector('.vis4-mc-card.is-large .card-tile')),
      power: t.filter(x=> x.querySelector('.ui28-pow, [class*=pow]')).length, edit: t.every(x=> x.querySelector('.vis4-mc-card')),
      pills: s.querySelectorAll('.rv1-tile .rv2-pills .ui22-pill').length, rng: s.querySelectorAll('.rv1-tile > .c17-rng').length, rngWant: s.querySelectorAll('.rv1-tile.is-c17-ranged').length,
      heads: s.querySelectorAll('h4.c17-theme').length, headSum: [...s.querySelectorAll('h4.c17-theme small, h4.ui21-kw-cards small')].reduce((a, x)=> a + Number(x.textContent), 0),
      n: Number((s.querySelector('h3 small') || {}).textContent || -1), grid: [...s.querySelectorAll('.ui40-row')].every(r=> getComputedStyle(r).flexWrap === 'wrap')}; };
  const m = document.querySelector('.pk1-mc-modal');
  return {claude: sec('ui22McClaude'), kw: sec('ui21McKeyword'), wide: m.scrollWidth - m.clientWidth, doc: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    pillSecs: [...m.querySelectorAll('.pk1-mc-sec')].filter(s=> s.querySelector('.vis4-mc-card.is-chip')).map(s=> s.id || (s.querySelector('h3') || {}).textContent)};"""

async def main():
    h = serve(); url = f'http://127.0.0.1:{h.server_address[1]}/index.html'
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME if os.path.exists(CHROME) else None, args=['--no-sandbox'])
        ctx = await b.new_context(viewport={'width': 1366, 'height': 900})
        pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.add_init_script(SKIP); await pg.goto(url); await pg.wait_for_timeout(1800)
        maps = await pg.evaluate("CONQUEST_MAPS.filter(m=> !m.reserved && (m.sub || (mapNumberOf(m.id) != null && mapNumberOf(m.id) <= 20))).map(m=> ({id: m.id, sub: !!m.sub, n: mapNumberOf(m.id)}))")
        nC = nK = 0; best = {'side': None, 'sideN': 0, 'main': None}; pillSecs = {}
        for m in maps:
            await pg.evaluate(E(OPEN % json.dumps(m['id']) + "return 1;"))
            s = await pg.evaluate(E(STATE))
            for x in s['pillSecs']: pillSecs.setdefault(x, []).append(m['id'])
            c, k = s['claude'], s['kw']
            if c:
                nC += 1
                ok(c['tiles'] > 0 and c['chips'] == 0 and c['full'] and c['edit'] and c['grid'], f"{m['id']}: Thematic Recommendation is {c['tiles']} full cards with edit, no chips, wrapping")
                ok(c['pills'] == c['tiles'] and c['rng'] == c['rngWant'] and c['n'] == c['tiles'], f"{m['id']}: a Claude New / New card pill under each card, ranged mark on {c['rng']} card(s), count {c['n']}")
                ok(c['heads'] == 0 or c['headSum'] <= c['tiles'], f"{m['id']}: theme headings kept ({c['heads']})")
                if m['sub'] and min(c['rng'], 3) * 100 + c['heads'] > best['sideN']: best['side'], best['sideN'] = m['id'], min(c['rng'], 3) * 100 + c['heads']
            if k:
                nK += 1
                ok(k['chips'] == 0 and k['full'] and (k['tiles'] == 0 or k['edit']) and k['headSum'] == k['tiles'] and k['grid'], f"{m['id']}: keyword cards are {k['tiles']} full cards, count kept")
                if not m['sub'] and k['tiles'] and not best['main']: best['main'] = m['id']
        ok(nC > 0 and nK > 0, f"sections seen: Thematic {nC} windows, Keyword {nK} windows")
        print('   sections still drawn as chips (left as they are):', json.dumps({k: len(v) for k, v in pillSecs.items()}))
        # screenshots: a main map (keyword) and a side map (thematic + keyword), both widths
        for w, hgt in ((1366, 900), (390, 844)):
            await pg.set_viewport_size({'width': w, 'height': hgt}); await pg.wait_for_timeout(200)
            for tag, mid, anchor in (('main', best['main'], 'ui21McKeyword'), ('side', best['side'], 'ui22McClaude'), ('side-kw', best['side'], 'ui21McKeyword')):
                if not mid: continue
                await pg.evaluate(E(OPEN % json.dumps(mid) + "return 1;"))
                s = await pg.evaluate(E(STATE))
                ok(s['wide'] <= 1 and s['doc'] <= 1, f"{mid} at {w}: no sideways scroll ({s['wide']}, {s['doc']})")
                has = await pg.evaluate(E(f"const a = document.getElementById('{anchor}'); if(!a) return false; document.querySelector('.pk1-mc-modal').scrollTop = a.offsetTop - 10; return true;"))
                if not has: continue
                await pg.wait_for_timeout(200); await pg.screenshot(path=os.path.join(OUT, f'{tag}-{mid}-{w}.png'))
        print('   screenshots: main', best['main'], 'side', best['side'])
        ok(not errs, 'no page errors: ' + '; '.join(errs[:3]))
        await b.close()
    h.shutdown()
    print('UI40 e2e:', 'FAIL ' + str(len(fails)) if fails else 'ok')
    raise SystemExit(1 if fails else 0)

asyncio.run(main())
