#!/usr/bin/env python3
"""UI45 (2026-11-10, owner 21:11) browser check: the Map cards Prospects split. Carried = only cards flagged Yes on an earlier main map (+ the tutorial cards, Map 1+),
never topped up; everything else that fits is NEW! (45 target, 60 max). Prints NEW! / Carried for every main map 0-20 with no flags, then with one simulated Yes
on Map 2 (the card leaves NEW! on later maps and shows under Carried). Prints a counts table; fails only on the rules.
    python3 tests/e2e/ui45_2026_11_10.py [index-file-name]      (build first; needs Playwright; default index.html, pass another file in the repo root to measure an old build)"""
import asyncio, os, sys, json, functools, threading, http.server, socketserver
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
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

COUNT = """(()=>{ const defs = getCardDefs(), ok2 = id=> !!defs[id] && ui41Allowed(id, defs), out = [];
  mainConquestMaps().filter(m=> mapNumberOf(m.id) != null && mapNumberOf(m.id) <= 20).forEach(m=>{ const sp = ui37Split(m.id, defs, ok2); out.push({id: m.id, n: sp.n, name: m.name, neu: sp.neu.map(p=> p.id), car: sp.car.map(p=> p.id), pill: sp.car.map(p=> sp.idx.get(p.id))}); });
  return out.sort((a, b)=> a.n - b.n); })()"""

async def main():
    h = serve(); name = sys.argv[1] if len(sys.argv) > 1 else 'index.html'; url = f'http://127.0.0.1:{h.server_address[1]}/{name}'
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME if os.path.exists(CHROME) else None, args=['--no-sandbox'])
        ctx = await b.new_context(viewport={'width': 1366, 'height': 900})
        pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.add_init_script(SKIP); await pg.goto(url); await pg.wait_for_timeout(1800)
        base = await pg.evaluate(COUNT)
        print('no flags: Map | NEW! | Carried')
        for r in base: print(f"  {r['n']:>2} {r['name'][:24]:<24} NEW! {len(r['neu']):>3}  Carried {len(r['car']):>3}")
        if name != 'index.html':
            await b.close(); return
        ok(len(base) == 21, '21 main maps 0-20')
        tut = await pg.evaluate("ui43TutorialCards()")
        for r in base:
            ok(set(r['car']) == (set(tut) if r['n'] >= 1 else set()) or r['n'] >= 1 and set(r['car']) <= set(tut), f"Map {r['n']}: with no flags Carried is only the tutorial cards ({len(r['car'])})")
            ok(not set(r['neu']) & set(r['car']), f"Map {r['n']}: nothing both NEW! and Carried")
            ok(len(set(r['neu'])) == len(r['neu']), f"Map {r['n']}: no duplicate in NEW!")
            ok(len(r['neu']) <= 60 + 20, f"Map {r['n']}: NEW! {len(r['neu'])} within the max (plus concepts)")
        print('short of 45 (no flags):', [(r['n'], len(r['neu'])) for r in base if len(r['neu']) < 45])
        # one Yes on Map 2: a card that is NEW! on Map 2 and also a fit on later maps
        r = await pg.evaluate("""(()=>{ const defs = getCardDefs(), ok2 = id=> !!defs[id] && ui41Allowed(id, defs), A = mainConquestMaps().find(m=> mapNumberOf(m.id) === 2).id;
          const before = (%s); const m6 = before.find(x=> x.n === 17), m2 = before.find(x=> x.n === 2);
          const tut = new Set(ui43TutorialCards()); const id = m2.neu.find(i=> !i.startsWith('concept-') && m6.neu.includes(i) && !tut.has(i));
          ui37SetFlag(A, id, 'yes'); const after = (%s); return {id, before, after}; })()""" % (COUNT, COUNT))
        id_ = r['id']; print('simulated Yes on Map 2:', id_)
        for b0, a0 in zip(r['before'], r['after']):
            if b0['n'] <= 2: continue
            mv = id_ in b0['neu'] and id_ in a0['car'] and id_ not in a0['neu']
            if id_ in b0['neu']:
                ok(mv, f"Map {b0['n']}: {id_} left NEW! and shows under Carried (pill Map {a0['pill'][a0['car'].index(id_)] if id_ in a0['car'] else '-'})")
            print(f"  {b0['n']:>2} {b0['name'][:24]:<24} NEW! {len(b0['neu']):>3} -> {len(a0['neu']):>3}   Carried {len(b0['car']):>3} -> {len(a0['car']):>3}")
        ok(not errs, 'no page errors ' + '; '.join(errs[:2]))
        await b.close()
    return len(fails)

if __name__ == '__main__':
    rc = asyncio.run(main()); print('FAIL' if rc else 'ok'); sys.exit(1 if rc else 0)
