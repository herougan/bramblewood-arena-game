#!/usr/bin/env python3
"""UI44 (2026-11-10, owner 16:02) browser check: the admin Map cards window of every side map (not the Tutorial, endless dungeons, tower, reserved) has the
Prospects view: "Unlocks after" select (main maps 0-20, current one marked, default = entry.afterMapCleared), the one-line note, NEW! / Carried, targets 12 / 8.
Changing the select redraws Carried / NEW! at once (a card flagged Yes on a main map shows as Carried with that map's pill only from that map on), the pick is saved
in ui37Picks[subId].after and in the Export picks JSON / CSV, a main map is unchanged, Thistlewood carries only the T-1 / T-2 tutorial cards, no page errors, 390 px no
sideways scroll.
    python3 tests/e2e/ui44_2026_11_10.py      (build first; writes docs/screens/ui44/*.png; needs Playwright)"""
import asyncio, os, json, functools, threading, http.server, socketserver
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
OUT = os.path.join(ROOT, 'docs', 'screens', 'ui44'); os.makedirs(OUT, exist_ok=True)
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
STATE = """adminModeEnabled = true; pk1OpenMapCards(%s); await new Promise(r=> setTimeout(r, 400));
  const ids = g=> [...document.querySelectorAll('[data-ui37-grp="' + g + '"] .ui37-tile')].map(t=> t.dataset.ui37Id);
  const sel = document.querySelector('[data-ui44-after]'), m = document.querySelector('.pk1-mc-modal');
  const inp = [...document.querySelectorAll('.ui37-ct input')].map(i=> i.value);
  return {has: !!document.getElementById('ui37Pros'), sel: !!sel, val: sel && sel.value, opts: sel ? [...sel.options].map(o=> o.text) : [], cur: sel ? [...sel.options].filter(o=> /\\(current\\)|\\(current/.test(o.text)).map(o=> o.value) : [],
    note: (document.querySelector('.ui44-note') || {}).textContent || '', neu: ids('new'), car: ids('carried'), inp, wide: m.scrollWidth - m.clientWidth, doc: document.documentElement.scrollWidth - document.documentElement.clientWidth};"""

async def main():
    h = serve(); url = f'http://127.0.0.1:{h.server_address[1]}/index.html'
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME if os.path.exists(CHROME) else None, args=['--no-sandbox'])
        ctx = await b.new_context(viewport={'width': 1366, 'height': 900}, color_scheme='dark')
        pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.add_init_script(SKIP); await pg.goto(url); await pg.wait_for_timeout(1800)
        subs = await pg.evaluate("ui44ProsSubs().map(m=> ({id: m.id, name: m.name, cur: ui44CurrentAfter(m.id)}))")
        ok(len(subs) >= 14 and not any(s['id'] in ('mtut', 'mm', 'muc', 'tw') for s in subs), f"{len(subs)} side maps get the view, not the Tutorial / endless / tower")
        for sb in subs:
            sid = json.dumps(sb['id']); s = await pg.evaluate(E(STATE % sid)); tag = f"{sb['name']} ({sb['id']})"
            ok(s['has'] and s['sel'], f"{tag}: Prospects view with the Unlocks-after select")
            ok(s['val'] == sb['cur'] and s['cur'] == [sb['cur']], f"{tag}: default {s['val']} is the current unlock {sb['cur']}, marked (current)")
            ok(len(s['note']) > 20 and 'Claude folds it into the map later' in s['note'], f"{tag}: one-line note")
            ok(len(s['neu']) >= 8, f"{tag}: NEW! has {len(s['neu'])} cards")
            ok(s['inp'] == ['3', '8'], f"{tag}: targets {s['inp']} (2026-11-12 UI48: own default 3)")
            ok(not set(s['neu']) & set(s['car']), f"{tag}: nothing both NEW! and Carried")
        # change the select on Clovermead: a Yes on a main map shows as Carried from that map on
        sid = json.dumps('mq'); s0 = await pg.evaluate(E(STATE % sid))
        r = await pg.evaluate(E("""const mains = ui37MapsData().filter(m=> m.n <= 20), a = mains.find(m=> m.n === 2), z = mains.find(m=> m.n === 7), defs = getCardDefs();
          const id = Object.keys(defs).find(i=> { const d = defs[i]; return d && !d.token && !d.test && (!d.faction || d.faction === 'base') && !ui43TutorialCards().includes(i) && !mains.some(m=> m.yes.includes(i)); });
          ui37SetFlag(a.id, id, 'yes'); const un = ui44MainByNo(1).id; pk1OpenMapCards('mq'); await new Promise(r=> setTimeout(r, 300));
          const q = ()=> ({car: [...document.querySelectorAll('[data-ui37-grp="carried"] .ui37-tile')].map(t=> [t.dataset.ui37Id, (t.querySelector('.ui37-from') || {}).textContent]), neu: [...document.querySelectorAll('[data-ui37-grp="new"] .ui37-tile')].map(t=> t.dataset.ui37Id)});
          const pick = async v=> { const sel = document.querySelector('[data-ui44-after]'); sel.value = v; /* the head is redrawn on every change, so look the select up again */ sel.dispatchEvent(new Event('change', {bubbles: true})); await new Promise(r=> setTimeout(r, 200)); return q(); };
          const early = await pick(un), mid = await pick(a.id), late = await pick(z.id), saved = JSON.parse(localStorage.getItem('bw_ui37_map_picks_v1') || '{}').mq;
          const json = JSON.parse(ui37ExportFile('json')), csv = ui37ExportFile('csv'); const back = await pick(ui44CurrentAfter('mq'));
          return {id, early: early.car.map(x=> x[0]), mid: mid.car, late: late.car.map(x=> x[0]), neuMid: mid.neu, saved, jr: json.submapUnlocks, csvHead: csv.split('\\n')[0], csvHas: csv.includes('unlockAfterId'), back: back.car.map(x=> x[0]), cur: ui44CurrentAfter('mq'), aNo: a.n, zNo: z.n,
            savedAfter: (ui37Picks.mq || {}).after, tut: ui43TutorialCards()};"""))
        ok(r['id'] not in r['early'], f"Clovermead: a card flagged Yes on Map {r['aNo']} is not Carried when the side map opens after Map 1")
        ok(any(c[0] == r['id'] and c[1] == f"Map {r['aNo']}" for c in r['mid']), f"Clovermead: Carried with the pill Map {r['aNo']} when the pick is Map {r['aNo']}")
        ok(r['id'] in r['late'], 'Clovermead: still Carried with a later pick'); ok(r['id'] not in r['neuMid'], 'Clovermead: not also NEW!')
        ok(not any(t in r['early'] for t in r['tut']) and len(r['tut']) == 7, f"2026-11-12 (UI48): after Map 1 the 7 T-1 / T-2 tutorial cards are no longer Carried {r['tut']}")
        ok(r['saved'] and r['saved'].get('after'), f"the pick is saved with the submap's picks {r['saved']}")
        ok(any(x['subId'] == 'mq' for x in r['jr']) and r['csvHas'], 'Export picks JSON has submapUnlocks, the CSV has the unlock columns')
        ok(not r['savedAfter'], 'choosing the current map again clears the pick (the default is not a pick)')
        # a main map: unchanged, no select
        s = await pg.evaluate(E(STATE % json.dumps('m3'))); ok(s['has'] and not s['sel'] and len(s['neu']) >= 30, f"a main map has no select ({len(s['neu'])} NEW!)")
        # Thistlewood carries only T-1 / T-2
        t = await pg.evaluate(E("""adminModeEnabled = true; pk1OpenMapCards(ui44MainByNo(1).id); await new Promise(r=> setTimeout(r, 400));
          const car = [...document.querySelectorAll('[data-ui37-grp="carried"] .ui37-tile')].map(t=> t.dataset.ui37Id); return {car, list: ui43TutorialCards()};"""))
        ok(all(i in t['car'] for i in t['list']) and len(t['list']) == 7 and 'bee-knight' in t['list'], f"Thistlewood: Map 0 Carried holds the T-1 / T-2 list {t['car']}")
        # screens and widths
        sid = json.dumps('mo')
        await pg.evaluate(E(STATE % sid)); await pg.screenshot(path=os.path.join(OUT, 'old-bramble-1366.png'))
        for w in (1100, 390):
            await pg.set_viewport_size({'width': w, 'height': 900}); await pg.wait_for_timeout(300)
            s = await pg.evaluate(E(STATE % sid)); ok(s['wide'] <= 1 and s['doc'] <= 1, f"Old Bramble at {w}: no sideways scroll ({s['wide']}, {s['doc']})")
        await pg.screenshot(path=os.path.join(OUT, 'old-bramble-390.png'))
        ok(not errs, 'no page errors: ' + '; '.join(errs[:3]))
        await b.close()
    h.shutdown()
    print('UI44 e2e:', 'FAIL ' + str(len(fails)) if fails else 'ok')
    raise SystemExit(1 if fails else 0)

asyncio.run(main())
