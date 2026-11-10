#!/usr/bin/env python3
"""UI39 (2026-11-09, owner 10:17: "combine the prospects UI and the Lists UI ... full view. Not pill view.") browser check: the admin Map cards window of a
main map is one view. No Lists / Prospects switch; NEW! (30+) and Carried (19+ from Map 2) are full cards (art, stats, skills) with UI38's source pills and
Yes / No under each; a list card keeps its review tile (Cut / Keep, edit) and the Cut / Keep count; other cards have edit; a concept is a card-shaped
placeholder; the counters, the skills section, Copy my picks / Export all, SPECIAL, Baby cards and rewards stay; no Thematic Recommendation section and no
side-map section on a main map; a side map's window is unchanged. Flags: a Yes on a concept is counted, kept, exported and Carried on the next map. Both widths.
    python3 tests/e2e/ui39_2026_11_09.py      (build first; writes docs/screens/ui39/*.png; needs Playwright)"""
import asyncio, os, json, functools, threading, http.server, socketserver
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
OUT = os.path.join(ROOT, 'docs', 'screens', 'ui39'); os.makedirs(OUT, exist_ok=True)
SKIP = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1');"
        "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying']));"
        "localStorage.setItem('bw_ui37_view_v1', 'lists');")
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
STATE = """const g = k=> [...document.querySelectorAll('#ui37Pros [data-ui37-grp="' + k + '"] .ui37-tile')];
  const m = document.querySelector('.pk1-mc-modal'), tiles = g('new').concat(g('carried')), ids = tiles.map(t=> t.dataset.ui37Id), side = ui38SideOnly(ui37Live && ui37Live.top);
  const cards = tiles.filter(t=> !t.classList.contains('is-concept')), concepts = tiles.filter(t=> t.classList.contains('is-concept'));
  return {neu: g('new').map(t=> t.dataset.ui37Id), car: g('carried').map(t=> t.dataset.ui37Id), concepts: concepts.length,
    full: cards.every(t=> t.querySelector('.vis4-mc-card.is-large .card-tile')), chips: document.querySelectorAll('#ui37Pros .vis4-mc-card.is-chip').length,
    conceptCards: concepts.every(t=> t.querySelector('.ui39-cc .ui39-cc-name') && t.querySelectorAll('.ui39-cc-line').length === 3 && !t.querySelector('img:not(.emoji)')),
    yn: tiles.every(t=> t.querySelectorAll('[data-ui37-flag]').length === 2), pills: tiles.every(t=> t.querySelector('.ui37-src, .ui37-from')),
    edit: cards.every(t=> t.querySelector('[data-ui13-edit]')), rvTiles: document.querySelectorAll('#ui37Pros .rv1-tile[data-rv-sec=cards]').length,
    sideShown: ids.filter(id=> side.has(id)), switch: !!document.querySelector('.ui37-switch'), claudeSec: !!document.getElementById('ui22McClaude'),
    skills: !!document.getElementById('ui19McSkills'), bar: !!document.getElementById('rv1Copy'), counters: document.querySelectorAll('#ui39Head [data-ui37-ct]').length,
    headFirst: !!(document.getElementById('ui39Head') && document.getElementById('ui19McSkills') && (document.getElementById('ui39Head').compareDocumentPosition(document.getElementById('ui19McSkills')) & 4)),
    special: !!m.querySelector('[data-rv-special]') || mapPoolSections(ui37Live.top).every(s=> s.key !== 'special' || !(s.ids || []).length), sideSecs: [...m.querySelectorAll('.pk1-mc-sec[data-rv-label]')].map(s=> s.dataset.rvLabel)};"""

async def main():
    h = serve(); url = f'http://127.0.0.1:{h.server_address[1]}/index.html'
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME if os.path.exists(CHROME) else None, args=['--no-sandbox'])
        ctx = await b.new_context(viewport={'width': 1366, 'height': 900}, accept_downloads=True)
        pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.add_init_script(SKIP); await pg.goto(url); await pg.wait_for_function("typeof ui37Picks !== 'undefined'", timeout=120000); await pg.wait_for_timeout(1800)  # 2026-11-11 (UI47): wait for the page script (was a fixed sleep: "ui37Picks is not defined")
        await pg.evaluate("localStorage.removeItem('bw_ui37_map_picks_v1'); for(const k in ui37Picks) delete ui37Picks[k];")
        mains = await pg.evaluate("ui37MapsData().filter(m=> m.n <= 20).map(m=> ({id: m.id, n: m.n, name: m.name}))")
        # 1 every main map 0-20
        sizes = []
        for m in mains:
            await pg.evaluate(E(OPEN % json.dumps(m['id']) + "return 1;"))
            s = await pg.evaluate(E(STATE)); sizes.append((m['n'], len(s['neu']), len(s['car']), s['concepts'], s['rvTiles']))
            ok(len(s['neu']) >= 30 and (m['n'] < 2 or len(s['car']) >= 19), f"Map {m['n']}: NEW! {len(s['neu'])} >= 30, Carried {len(s['car'])}")
            ok(not s['switch'] and s['full'] and s['chips'] == 0 and s['conceptCards'] and s['yn'] and s['pills'] and s['edit'], f"Map {m['n']}: one view, every card full size with pills, Yes / No and edit; concepts are placeholder cards")
            ok(not s['sideShown'] and not s['claudeSec'] and len(s['sideSecs']) <= 2, f"Map {m['n']}: no side-map card or section, no Thematic Recommendation ({s['sideSecs']})")
            ok(s['skills'] and s['bar'] and s['counters'] == 2 and s['headFirst'] and s['special'], f"Map {m['n']}: counters at the top, skills section, Copy / Export all, SPECIAL kept")
        print('   sizes (map, NEW!, Carried, concepts, review tiles):', sizes)
        # 2 screenshots of Maps 0, 5, 14
        for n in (0, 5, 14):
            m = next(x for x in mains if x['n'] == n)
            await pg.evaluate(E(OPEN % json.dumps(m['id']) + "return 1;"))
            await pg.evaluate("document.querySelector('.pk1-mc-modal').scrollTop = 0"); await pg.wait_for_timeout(150)
            await pg.screenshot(path=os.path.join(OUT, f'map{n}-1366.png'))
            await pg.evaluate("document.querySelector('.pk1-mc-modal').scrollTop = document.getElementById('ui37Pros').offsetTop - 20"); await pg.wait_for_timeout(150)
            await pg.screenshot(path=os.path.join(OUT, f'map{n}-new-1366.png'))
            await pg.evaluate("document.querySelector('.pk1-mc-modal').scrollTop = document.querySelector('[data-ui37-grp=carried]').offsetTop - 20"); await pg.wait_for_timeout(150)
            await pg.screenshot(path=os.path.join(OUT, f'map{n}-carried-1366.png'))
        # 3 Cut / Keep on a list card inside the groups: the count and Copy my picks follow; a Yes flag redraw keeps the cut
        m5 = next(x for x in mains if x['n'] == 5)
        await pg.evaluate(E(OPEN % json.dumps(m5['id']) + "return 1;"))
        r = await pg.evaluate(E("""const t = document.querySelector('#ui37Pros .rv1-tile.is-chosen[data-rv-sec=cards]'); if(!t) return null; const id = t.dataset.rvId, ct0 = (document.querySelector('[data-rv2-count] .rv2-ct') || {}).textContent;
          t.querySelector('.rv1-act').click(); await new Promise(r=> setTimeout(r, 100)); const ct1 = (document.querySelector('[data-rv2-count] .rv2-ct') || {}).textContent, txt = rv1PicksText(document.getElementById('pk1MapCardsOverlay'));
          document.querySelector('#ui37Pros .ui37-tile[data-ui37-id="' + id + '"] [data-ui37-flag=yes]').click(); await new Promise(r=> setTimeout(r, 100));
          const still = document.querySelector('#ui37Pros .ui37-tile[data-ui37-id="' + id + '"] .rv1-tile').classList.contains('is-flipped');
          document.querySelector('#ui37Pros .ui37-tile[data-ui37-id="' + id + '"] .rv1-act').click(); document.querySelector('#ui37Pros .ui37-tile[data-ui37-id="' + id + '"] [data-ui37-flag=yes]').click();
          return {id, ct0, ct1, txt, still};"""))
        ok(bool(r) and r['ct0'] != r['ct1'] and 'cut' in r['txt'] and r['still'], f'Cut on a list card in the groups: count {r and r["ct0"]} -> {r and r["ct1"]}, Copy my picks says it, a flag redraw keeps it')
        # 4 a concept: placeholder card, hover, flag, export, carried on the next map
        m14 = next(x for x in mains if x['n'] == 14); m15 = next(x for x in mains if x['n'] == 15)
        await pg.evaluate(E(OPEN % json.dumps(m14['id']) + "return 1;"))
        cid = await pg.evaluate("(document.querySelector('#ui37Pros .ui37-tile.is-concept') || {dataset: {}}).dataset.ui37Id || null")
        ok(bool(cid), 'Map 14 shows a concept card: ' + str(cid))
        if cid:
            sel = f'#ui37Pros .ui37-tile[data-ui37-id="{cid}"]'
            await pg.evaluate(f"document.querySelector('{sel}').scrollIntoView({{block: 'center'}})")
            await pg.hover(f'{sel} .ui39-cc'); await pg.wait_for_timeout(350)
            tip = await pg.evaluate("(document.querySelector('.cnp-rw-zoom.cnp-rw-tip') || {}).textContent || ''")
            ok('Proposed new card' in tip, 'hovering the concept card shows its text: ' + tip[:90])
            await pg.screenshot(path=os.path.join(OUT, 'map14-concept-1366.png'))
            await pg.mouse.move(5, 5)
            await pg.click(f'{sel} [data-ui37-flag=yes]')
            st = await pg.evaluate(f"({{x: document.querySelector('[data-ui37-ct=n] .ui37-x').textContent, store: JSON.parse(localStorage.getItem('bw_ui37_map_picks_v1'))[{json.dumps(m14['id'])}].yes}})")
            ok(st['x'] == '1' and cid in st['store'], 'a Yes on a concept counts and is kept in this browser')
            async with pg.expect_download() as dl: await pg.click('[data-ui37-export=json]')
            await dl.value; j = json.loads(await pg.evaluate("window.__ui37Last.body"))
            ok(any(r['cardId'] == cid for r in j['rows']), 'Export .json has the flagged concept')
            await pg.evaluate(E(OPEN % json.dumps(m15['id']) + "return 1;"))
            s = await pg.evaluate(E(STATE)); ok(cid in s['car'], 'the concept flagged Yes on Map 14 is Carried on Map 15')
        # 5 a side map's window: its own lists, no prospects
        sub = await pg.evaluate("(()=>{ for(const m of mainConquestMaps()){ const s = mpSubsOf(m.id).find(x=> x && x.id); if(s) return s.id; } return null; })()")
        if sub:
            await pg.evaluate(E(OPEN % json.dumps(sub) + "return 1;"))
            r = await pg.evaluate("({pros: !!document.getElementById('ui37Pros'), head: !!document.getElementById('ui39Head'), secs: document.querySelectorAll('.pk1-mc-body > .pk1-mc-sec').length})")
            ok(not r['pros'] and not r['head'] and r['secs'] > 0, f'side map {sub}: its own lists, no prospects ({r})')
        # 6 phone
        await pg.set_viewport_size({'width': 390, 'height': 844})
        for n in (0, 5, 14):
            m = next(x for x in mains if x['n'] == n)
            await pg.evaluate(E(OPEN % json.dumps(m['id']) + "return 1;"))
            w = await pg.evaluate("({sw: document.documentElement.scrollWidth, mw: document.querySelector('.pk1-mc-modal').scrollWidth, cw: document.querySelector('.pk1-mc-modal').clientWidth, perRow: (()=>{ const t = [...document.querySelectorAll('#ui37Pros [data-ui37-grp=new] .ui37-tile')].slice(0, 6).map(x=> x.getBoundingClientRect().top); return t.filter(y=> Math.abs(y - t[0]) < 4).length; })()})")
            ok(w['mw'] <= w['cw'] + 1 and w['sw'] <= 391 and w['perRow'] >= 2, f'Map {n}: no sideways scroll at 390, the grid wraps ({w})')
            await pg.evaluate("document.querySelector('.pk1-mc-modal').scrollTop = document.getElementById('ui37Pros').offsetTop - 10"); await pg.wait_for_timeout(150)
            await pg.screenshot(path=os.path.join(OUT, f'map{n}-390.png'))
        ok(not errs, 'no page errors: ' + '; '.join(errs[:3]))
        await pg.evaluate("localStorage.removeItem('bw_ui37_map_picks_v1');")
        await b.close()
    h.shutdown()
    print('FAIL ' + str(len(fails)) if fails else 'ok'); raise SystemExit(1 if fails else 0)

asyncio.run(main())
