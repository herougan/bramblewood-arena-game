#!/usr/bin/env python3
"""UI34 (2026-11-08) browser check at 1366 and 390: the admin Map cards window's skills section has a Counters group (teal tiles, up to 8, each one line with the
number of map cards it answers; the hover names the cards and why), never repeats a skill of the Main / Other groups, follows the map's cards (a card added
to SPECIAL / a skill gained refreshes it), and the blue recommended group holds up to 15 without a repeat.
    python3 tests/e2e/ui34_2026_11_08.py      (build first; writes docs/screens/ui34/*.png; needs Playwright)"""
import asyncio, os, json, functools, threading, http.server, socketserver
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
OUT = os.path.join(ROOT, 'docs', 'screens', 'ui34'); os.makedirs(OUT, exist_ok=True)
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

SUMMARY = """(()=>{ const g = sel=> [...document.querySelectorAll('#ui19McSkills ' + sel)];
  const tiles = g('.ui19-sk[data-eng35-key]'), keys = tiles.map(t=> t.dataset.eng35Key), ctr = g('.is-counter'), pick = g('.is-claude-pick'), rec = g('.is-rec');
  const heads = g('.ui32-sk-head').map(h=> h.className.replace('ui32-sk-head ', '') + ':' + h.textContent.trim());
  const main = g('.ui19-sk[data-ui19-skill]:not(.is-rec):not(.is-intro)').map(t=> t.dataset.ui19Skill);
  return {n: tiles.length, dup: keys.length - new Set(keys).size, heads, counters: ctr.map(t=> t.dataset.ui34Counter), cMaxH: Math.max(0, ...ctr.map(t=> t.getBoundingClientRect().height)),
    cCards: ctr.map(t=> +(t.querySelector('.ui34-cn')||{}).textContent.replace(/\\D/g, '') || 0), blue: (()=>{ const all = [...document.querySelectorAll('#ui19McSkills .ui19-sk-list > li')], i = all.findIndex(x=> x.classList.contains('is-rec')), h = all.findIndex(x=> x.classList.contains('ui32-sk-head') && x.classList.contains('is-rec')); return h < 0 ? 0 : all.slice(h + 1).filter(x=> !x.classList.contains('ui32-sk-head')).length; })(), picks: pick.length,
    ctrInMain: ctr.filter(t=> main.includes(t.dataset.ui34Counter)).length, tip: ctr[0] ? ctr[0].dataset.eng35Ctx : ''}; })()"""

async def run(p, url, w, hgt, maps):
    b = await p.chromium.launch(executable_path=CHROME if os.path.exists(CHROME) else None, args=['--no-sandbox'])
    pg = await b.new_page(viewport={'width': w, 'height': hgt})
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.add_init_script(SKIP); await pg.goto(url); await pg.wait_for_timeout(1500)
    res = {}
    for mid in maps:
        await pg.evaluate(E(f"adminModeEnabled = true; pk1OpenMapCards('{mid}'); await new Promise(r=> setTimeout(r, 1200)); return 1;"))
        r = await pg.evaluate(SUMMARY); res[mid] = r
        print(f'   {w} map {mid}', json.dumps(r)[:600])
        ok(r['dup'] == 0, f'{w} {mid}: no skill tile twice')
        ok(len(r['counters']) <= 8 and r['ctrInMain'] == 0, f'{w} {mid}: at most 8 counters, none in the Main group')
        ok(r['cMaxH'] < 40 or r['cMaxH'] == 0, f'{w} {mid}: counter tiles are one line ({r["cMaxH"]:.0f}px)')
        ok(r['blue'] <= 15, f'{w} {mid}: the blue group has at most 15 ({r["blue"]})')
        if mid == maps[0]:
            sec = await pg.query_selector('#ui19McSkills')
            if sec: await sec.scroll_into_view_if_needed()
            await pg.wait_for_timeout(300)
            if sec: await sec.screenshot(path=os.path.join(OUT, f'counters-{w}-{mid}.png'))
            first = await pg.query_selector('#ui19McSkills .is-counter')
            if first:
                await first.hover(); await pg.wait_for_timeout(400)
                await pg.screenshot(path=os.path.join(OUT, f'counters-hover-{w}-{mid}.png'))
                tip = await pg.evaluate("(()=>{ const t = document.getElementById('eng35SkTip'); return t && !t.hidden ? t.textContent : ''; })()")
                ok('Counters' in tip or 'counters' in tip.lower(), f'{w} {mid}: the hover window names the cards it counters')
                print('   tip:', tip[:300])
    # a dynamic refresh: Cut on a main card that carries Flying lowers what Reach (a Flying counter) answers, Keep brings it back (the redraw reads the map's cards)
    mid = maps[0]
    r = await pg.evaluate(E(f"""adminModeEnabled = true; pk1OpenMapCards('{mid}'); await new Promise(r=> setTimeout(r, 900));
      const ov = document.getElementById('pk1MapCardsOverlay'), top = mpTopOf('{mid}'), defs = getCardDefs(), okf = id=> defs[id] && !defs[id].token && !defs[id].test;
      const n = ()=>{{ const t = ov.querySelector('[data-ui34-counter=reach] .ui34-cn'); return t ? +t.textContent.replace(/\\D/g, '') : 0; }};
      const g = ui32McSkillIds(top, '{mid}', okf), n0 = n(), out = {{n0, changed: false}};
      for(const id of g.main.filter(x=> (defs[x].effects || {{}}).flying)){{
        let sec = null; mapPoolSections(top).forEach(s=>{{ if(s.key === 'cards') sec = s; }}); const k = top + '|cards|' + id; rvFlips[k] = !rvFlips[k]; ui32McRefreshSkills(ov); await new Promise(r=> setTimeout(r, 100));
        const n1 = n(); rvFlips[k] = !rvFlips[k]; ui32McRefreshSkills(ov); await new Promise(r=> setTimeout(r, 100));
        if(n1 !== n0){{ out.changed = true; out.n1 = n1; out.back = n(); break; }} }}
      return out;"""))
    print('   refresh', json.dumps(r)[:300])
    ok(r['changed'] and r['back'] == r['n0'], f'{w}: Cut / Keep on a main card redraws the Counters (Reach answers {r["n0"]} -> {r.get("n1")} -> {r.get("back")})')
    ok(not errs, f'{w}: no page errors ' + '; '.join(errs)[:200])
    await b.close()
    return res

async def main():
    h = serve(); url = f'http://127.0.0.1:{h.server_address[1]}/index.html'
    async with async_playwright() as p:
        maps = None
        b = await p.chromium.launch(executable_path=CHROME if os.path.exists(CHROME) else None, args=['--no-sandbox'])
        pg = await b.new_page(viewport={'width': 1366, 'height': 860}); await pg.add_init_script(SKIP); await pg.goto(url); await pg.wait_for_timeout(1500)
        maps = await pg.evaluate("(()=>{ const ids = mainConquestMaps().map(m=> m.id); return ids.slice(0, 22); })()")
        await b.close()
        # a fixed sample: Map 0, Thistlewood, Pebble Beach, a poison map and a late one
        pick = [m for m in maps][:1] + [maps[i] for i in (3, 7, 11, 17) if i < len(maps)]
        for w, hgt in ((1366, 860), (390, 844)):
            print(f'-- {w}'); await run(p, url, w, hgt, pick)
    print('FAILS' if fails else 'all ok', len(fails)); raise SystemExit(1 if fails else 0)
asyncio.run(main())
