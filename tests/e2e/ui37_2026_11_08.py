#!/usr/bin/env python3
"""UI37 (2026-11-08, owner 17:22 #1-#4; updated by UI39 2026-11-09: one combined view of full cards, no switch) browser check: the admin Map cards window's Prospects view. NEW! first then Carried, compact chips with the hover card,
Yes / No pill toggles, the NEW! / Carried counters against the THEME6-1 targets (editable), flags kept across a reload, a flag on an EARLIER map moving a card
between NEW! and Carried on a LATER map, Export picks (JSON / CSV), no switch on a submap's window. Both widths.
    python3 tests/e2e/ui37_2026_11_08.py      (build first; writes docs/screens/ui37/*.png; needs Playwright)"""
import asyncio, os, json, functools, threading, http.server, socketserver
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
OUT = os.path.join(ROOT, 'docs', 'screens', 'ui37'); os.makedirs(OUT, exist_ok=True)
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
OPEN = "adminModeEnabled = true; pk1OpenMapCards(%s); await new Promise(r=> setTimeout(r, 900));"
STATE = """const g = k=> [...document.querySelectorAll('#ui37Pros [data-ui37-grp="' + k + '"] .ui37-tile')].map(t=> ({id: t.dataset.ui37Id, f: t.className.includes('is-yes') ? 'yes' : t.className.includes('is-no') ? 'no' : ''}));
  const m = document.querySelector('.pk1-mc-modal');
  return {view: m && m.dataset.ui39 === '1' ? 'pros' : 'lists', /* 2026-11-09 (UI39): one view, no switch */ neu: g('new'), car: g('carried'), earlier: g('earlier'), ctN: (document.querySelector('[data-ui37-ct=n] .ui37-x') || {}).textContent, ctC: (document.querySelector('[data-ui37-ct=c] .ui37-x') || {}).textContent,
    tN: (document.querySelector('[data-ui37-target=n]') || {}).value, tC: (document.querySelector('[data-ui37-target=c]') || {}).value, sw: !!document.querySelector('.ui37-switch'), map: (document.querySelector('.ui37-map') || {}).textContent};"""

async def main():
    h = serve(); url = f'http://127.0.0.1:{h.server_address[1]}/index.html'
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME if os.path.exists(CHROME) else None, args=['--no-sandbox'])
        ctx = await b.new_context(viewport={'width': 1366, 'height': 900}, accept_downloads=True)
        pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.add_init_script(SKIP); await pg.goto(url); await pg.wait_for_function("typeof ui37Picks !== 'undefined'", timeout=120000); await pg.wait_for_timeout(1800)  # 2026-11-11 (UI47): wait for the page script (was a fixed sleep: "ui37Picks is not defined")
        await pg.evaluate("localStorage.removeItem('bw_ui37_map_picks_v1'); localStorage.removeItem('bw_ui37_view_v1'); for(const k in ui37Picks) delete ui37Picks[k];")
        mains = await pg.evaluate("ui37MapsData().map(m=> ({id: m.id, n: m.n, name: m.name}))")
        L = mains[5]; print('   later map:', L)
        # 1 the window opens on Lists; the switch shows Prospects
        await pg.evaluate(E(OPEN % json.dumps(L['id']) + "return 1;"))
        s = await pg.evaluate(E(STATE)); ok(not s['sw'] and s['view'] == 'pros', 'a main map window is one view (UI39): no Lists / Prospects switch')
        s = await pg.evaluate(E(STATE)); print('   ', json.dumps({k: (len(v) if isinstance(v, list) else v) for k, v in s.items()}, ensure_ascii=False))
        ok(s['view'] == 'pros' and len(s['neu']) > 0 and len(s['car']) > 0, 'Prospects shows a NEW! group and a Carried group, both filled')
        order = await pg.evaluate("[...document.querySelectorAll('#ui37Pros [data-ui37-grp]')].map(x=> x.dataset.ui37Grp).join(',')")
        ok(order.startswith('new,carried'), 'NEW! comes first, then Carried: ' + order)
        r = await pg.evaluate(E("""const top = %s, defs = getCardDefs(), ok = id=> !!defs[id], pros = ui37Prospects(top, defs, ok), ent = mpEntry(top), subOnly = [];
          Object.values(ent.submaps).flat().forEach(id=>{ if(!pros.has(id) && !subOnly.includes(id)) subOnly.push(id); });
          const shown = [...document.querySelectorAll('#ui37Pros [data-ui37-grp=new] .ui37-tile, #ui37Pros [data-ui37-grp=carried] .ui37-tile')].map(t=> t.dataset.ui37Id);
          const c = (CLAUDE_NEW.content17 || {})[top], side = ui38SideOnly(top), picks = ((c && c.groups) || []).flatMap(g=> (g.picks || []).map(p=> p.id)).filter(id=> defs[id] && !side.has(id)); /* 2026-11-09 (UI38): side-map cards are left out */
          return {subShown: subOnly.filter(id=> shown.includes(id)), listMissing: ent.cards.filter(id=> defs[id] && !shown.includes(id)), picksMissing: picks.filter(id=> !shown.includes(id)), shown: shown.length,
            chip: !!document.querySelector('#ui37Pros .ui37-tile .vis4-mc-card.is-large[data-zoom]') && !document.querySelector('#ui37Pros .ui37-tile .vis4-mc-card.is-chip')};""" % json.dumps(L['id'])))
        print('   ', json.dumps({k: v for k, v in r.items()}))
        ok(not r['subShown'], 'no side-map-only card is shown in NEW! or Carried')
        ok(not r['listMissing'] and not r['picksMissing'], "every MAP-list card and every Claude (CONTENT17) pick for the map is a prospect")
        ok(r['chip'], 'tiles are the full card with the hover card (data-zoom; UI39, was the compact chip)')
        await pg.hover('#ui37Pros .ui37-tile .vis4-mc-card'); await pg.wait_for_timeout(400)
        ok(await pg.evaluate("!!document.querySelector('.cnp-rw-zoom .card-tile')"), 'hovering a card shows the full card with its stats and skills')
        await pg.screenshot(path=os.path.join(OUT, 'prospects-hover-1366.png'))
        await pg.mouse.move(5, 5)
        # 2 targets: THEME6-1 defaults
        t = await pg.evaluate("th6Targets(%d)" % L['n'])
        ok(s['tN'] == str(t['own']) and s['tC'] == str(t['carried']), f"targets default to THEME6-1 for Map {L['n']}: {t}")
        # 3 flag two NEW! and one Carried through the pills; counters follow
        n0, n1, c0 = s['neu'][0]['id'], s['neu'][1]['id'], s['car'][0]['id']
        for cid in (n0, n1): await pg.click(f'#ui37Pros .ui37-tile[data-ui37-id="{cid}"] [data-ui37-flag=yes]')
        await pg.click(f'#ui37Pros .ui37-tile[data-ui37-id="{c0}"] [data-ui37-flag=yes]')
        await pg.click(f'#ui37Pros [data-ui37-grp=new] .ui37-tile:nth-child(3) [data-ui37-flag=no]')
        s = await pg.evaluate(E(STATE)); ok(s['ctN'] == '2' and s['ctC'] == '1', f"counters: NEW! flagged {s['ctN']}, Carried flagged {s['ctC']}")
        await pg.click(f'#ui37Pros .ui37-tile[data-ui37-id="{n1}"] [data-ui37-flag=yes]')
        s = await pg.evaluate(E(STATE)); ok(s['ctN'] == '1', 'pressing the lit Yes again clears the flag')
        await pg.click(f'#ui37Pros .ui37-tile[data-ui37-id="{n1}"] [data-ui37-flag=yes]')
        await pg.fill('[data-ui37-target=n]', '2'); await pg.dispatch_event('[data-ui37-target=n]', 'change'); await pg.wait_for_timeout(200)
        s = await pg.evaluate(E(STATE)); met = await pg.evaluate("document.querySelector('[data-ui37-ct=n]').classList.contains('is-met')")
        ok(s['tN'] == '2' and met, 'the NEW! target is editable and the counter turns green when met')
        await pg.screenshot(path=os.path.join(OUT, 'prospects-flagged-1366.png'))
        # 4 an EARLIER map's flags move cards on the later map. Pick a Carried card given by exactly one earlier map's list (no flags), flag it No there.
        r = await pg.evaluate(E("""const L = %s, maps = ui37MapsData(), me = maps.find(m=> m.id === L), car = [...document.querySelectorAll('#ui37Pros [data-ui37-grp=carried] .ui37-tile')].map(t=> t.dataset.ui37Id);
          for(const id of car){ const g = maps.filter(m=> m.n < me.n && m.list.includes(id) && !m.yes.includes(id)); if(g.length === 1) return {id, giver: g[0].id, gn: g[0].n}; } return null;""" % json.dumps(L['id'])))
        print('   carried card with one giver:', r)
        ok(bool(r), 'a Carried card with a single earlier giver exists')
        if r:
            await pg.evaluate(E(OPEN % json.dumps(r['giver']) + "return 1;"))
            s2 = await pg.evaluate(E(STATE)); ok(s2['view'] == 'pros', 'the view is remembered when another map is loaded')
            await pg.click(f'#ui37Pros .ui37-tile[data-ui37-id="{r["id"]}"] [data-ui37-flag=no]')
            # and a Claude pick of that earlier map that no earlier map gives: flag it Yes
            y = await pg.evaluate(E("""const top = %s, maps = ui37MapsData(), me = maps.find(m=> m.id === top), idx = ui37CarriedIndex(me.n, maps), defs = getCardDefs();
              const t = [...document.querySelectorAll('#ui37Pros [data-ui37-grp=new] .ui37-tile')].map(x=> x.dataset.ui37Id).filter(id=> !me.list.includes(id) && !idx.has(id) && !maps.some(m=> m.list.includes(id))); return t[0] || null;""" % json.dumps(r['giver'])))
            print('   claude pick flagged Yes on the earlier map:', y)
            if y: await pg.click(f'#ui37Pros .ui37-tile[data-ui37-id="{y}"] [data-ui37-flag=yes]')
            await pg.screenshot(path=os.path.join(OUT, 'earlier-map-flags-1366.png'))
            # reload the page: everything is still there, and the later map now reads the earlier flags
            await pg.reload(); await pg.wait_for_function("typeof ui37Picks !== 'undefined'", timeout=120000); await pg.wait_for_timeout(1800)
            await pg.evaluate(E(OPEN % json.dumps(L['id']) + "return 1;"))
            s3 = await pg.evaluate(E(STATE)); ids = lambda k: [x['id'] for x in s3[k]]
            ok(s3['view'] == 'pros', 'after a reload the window opens on Prospects')
            ok(r['id'] in ids('neu') and r['id'] not in ids('car'), f"{r['id']}: flagged No on Map {r['gn']} -> NEW! on Map {L['n']} (was Carried)")
            if y: ok(y in ids('car') or y in ids('earlier'), f"{y}: flagged Yes on Map {r['gn']} -> Carried on Map {L['n']}")
            fl = {x['id']: x['f'] for x in s3['neu'] + s3['car'] + s3['earlier']}
            ok(fl.get(n0) == 'yes' and fl.get(n1) == 'yes' and fl.get(c0) == 'yes' and s3['tN'] == '2', 'the later map\'s own flags and its edited target survive the reload')
            if s3['earlier']:
                await pg.click('#ui37Pros details.ui37-extra > summary'); await pg.wait_for_timeout(200)
            await pg.screenshot(path=os.path.join(OUT, 'later-map-after-reload-1366.png'))
        # 5 export
        async with pg.expect_download() as dl: await pg.click('[data-ui37-export=json]')
        d = await dl.value; body = await pg.evaluate("window.__ui37Last.body"); j = json.loads(body)
        ok(d.suggested_filename == 'bramblewood-map-picks.json' and any(x['cardId'] == n0 and x['flag'] == 'yes' and x['group'] == 'new' for x in j['rows']), 'Export picks .json downloads every flag with its group')
        async with pg.expect_download() as dl: await pg.click('[data-ui37-export=csv]')
        d = await dl.value; body = await pg.evaluate("window.__ui37Last.body")
        ok(d.suggested_filename.endswith('.csv') and body.startswith('mapNo,mapId,map,cardId,card,flag,group'), 'Export picks .csv has the header row')
        # 6 the ‹ › buttons walk the main maps
        await pg.click('.ui37-go[data-ui37-go]:not([disabled]) >> nth=0'); await pg.wait_for_timeout(500)
        s4 = await pg.evaluate(E(STATE)); ok(s4['view'] == 'pros' and s4['map'] != s3['map'] if r else True, 'the map buttons load the neighbouring main map in Prospects')
        # 7 a submap's window has no Prospects
        sub = await pg.evaluate("(CONQUEST_MAPS.find(m=> m.sub && !m.reserved && m.parent === %s) || CONQUEST_MAPS.find(m=> m.sub && !m.reserved) || {}).id" % json.dumps(L['id']))
        await pg.evaluate(E(OPEN % json.dumps(sub) + "return 1;"))
        ok(not await pg.evaluate("!!document.querySelector('.ui37-switch') || !!document.getElementById('ui37Pros')"), f'a submap window ({sub}) has no Prospects')
        # 8 phone
        await pg.set_viewport_size({'width': 390, 'height': 844})
        await pg.evaluate(E(OPEN % json.dumps(L['id']) + "return 1;"))
        w = await pg.evaluate("({sw: document.documentElement.scrollWidth, mw: document.querySelector('.pk1-mc-modal').scrollWidth, cw: document.querySelector('.pk1-mc-modal').clientWidth})")
        ok(w['mw'] <= w['cw'] + 1 and w['sw'] <= 391, f'no sideways scroll at 390 ({w})')
        await pg.screenshot(path=os.path.join(OUT, 'prospects-390.png'))
        await pg.evaluate("document.querySelector('.pk1-mc-modal').scrollTop = 99999"); await pg.wait_for_timeout(200)
        await pg.screenshot(path=os.path.join(OUT, 'prospects-carried-390.png'))
        ok(not errs, 'no page errors: ' + '; '.join(errs[:3]))
        await b.close()
    h.shutdown()
    print('FAIL ' + str(len(fails)) if fails else 'ok'); raise SystemExit(1 if fails else 0)

asyncio.run(main())
