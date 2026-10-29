#!/usr/bin/env python3
"""Package REVIEW1 (2026-10-29): browser checks and screenshots of the skirmish panel's admin buttons (the 🃏 Map cards button after "Mark cleared")
and of the Map cards overlay with Chosen / Cut cards / Maybe, at 1366 and 390. Fake review entries are set inside the page only (MAP_REVIEW.maps),
never in canonical/map-review.json.
    python3 tests/e2e/review1_2026_10_29.py [--widths 1366 390] [--keep]    # shots in tests/out/shots/rv1-*.png; --keep copies them to docs/screens/review1/
Build first. Exits 1 on a failed check."""
import argparse, asyncio, http.server, socketserver, threading, functools, os, sys, shutil
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'tests', 'out', 'shots'); os.makedirs(OUT, exist_ok=True)
KEEP = os.path.join(ROOT, 'docs', 'screens', 'review1')
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
DONE = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1'); localStorage.setItem('bramblewood_arena_faction','otters');"
        "localStorage.setItem('bramblewood_arena_adminmode','1');"
        "window.addEventListener('load', ()=>{ try{ skipTriggerLesson(); saveTutorial2Done(); saveTutorialDone(); window.soonCheckMilestones = ()=>{}; window.showCoachTip = ()=>{}; window.maybeShowCoachTip = ()=>{}; }catch(e){} });")
fails = []; shots = []
def ok(c, m):
    print(('  ok  ' if c else '  FAIL ') + m)
    if not c: fails.append(m)
def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    h = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); threading.Thread(target=h.serve_forever, daemon=True).start(); return h
async def shot(pg, name, w):
    f = os.path.join(OUT, f'rv1-{name}-{w}.png'); await pg.screenshot(path=f, animations='allow'); shots.append(f); return f
async def run(b, url, w):
    ctx = await b.new_context(viewport={'width': w, 'height': 844 if w < 700 else 860}, has_touch=(w < 700))
    await ctx.grant_permissions(['clipboard-read', 'clipboard-write'])
    pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.add_init_script(DONE); await pg.goto(url)
    await pg.wait_for_function("typeof switchTab === 'function' && typeof startConquestMatch === 'function'", timeout=60000); await pg.wait_for_timeout(2200)
    print(f'-- width {w}')
    info = await pg.evaluate("""(async()=>{ adminModeEnabled = true;
      const mains = mainConquestMaps(), M = mains[4], p = loadConquestProgress();
      mains.slice(0, 4).forEach(m=> m.nodes.forEach(nd=>{ const id = conquestNodeId(m.id, nd.key); if(!p.completed.includes(id)) p.completed.push(id); })); saveConquestProgress(p);
      const node = M.nodes.find(n=> n.kind === 'skirmish'); conquestWorldView = false; conquestSelectedMap = M.id; conquestSelectedNodeKey = node.key; playSubTab = 'conquest'; switchTab('play'); await new Promise(r=> setTimeout(r, 2500));
      const secs = mapPoolSections(M.id), ids = secs[0].ids, defs = getCardDefs(), other = Object.keys(defs).filter(i=> !ids.includes(i) && !defs[i].token && !defs[i].test && !isEasterEgg(defs[i]) && defs[i].cardType !== 'spell').slice(0, 8);
      const sub = secs.find(s=> s.sub);
      window.__T = {map: M.id, subId: sub && sub.sub, ids, other}; return {map: M.id, node: node.key, nMain: ids.length, sub: sub && sub.sub, nOther: other.length}; })()""")
    print('  ', info)
    btns = await pg.evaluate("[...document.querySelectorAll('.cnp-admin-side button')].map(b=> b.id + '|' + b.getBoundingClientRect().width + 'x' + b.getBoundingClientRect().height + '@' + Math.round(b.getBoundingClientRect().top))")
    ok(any(x.startswith('cnpMapCards') for x in btns) and [x.split('|')[0] for x in btns][-1] == 'cnpMapCards', f'the 🃏 Map cards button sits after Mark cleared in the admin buttons {btns}')
    vis = await pg.evaluate("(()=>{ const b = document.getElementById('cnpMapCards'); if(!b) return false; const r = b.getBoundingClientRect(), cs = getComputedStyle(b); return r.width > 20 && r.height > 10 && cs.visibility !== 'hidden' && cs.display !== 'none' && r.right <= innerWidth + 1 && r.left >= 0; })()")
    ok(vis, 'the button is visible and inside the viewport')
    await pg.evaluate("(()=>{ const b = document.getElementById('cnpMapCards'); if(b) b.scrollIntoView({block:'center'}); })()"); await pg.wait_for_timeout(300)
    await shot(pg, 'admin-buttons', w)
    # 1. no review yet
    # 2026-10-29 (release): THEME3 filled canonical/map-review.json, so empty it in the page for the no-review case
    await pg.evaluate("Object.keys(MAP_REVIEW.maps).forEach(k=> delete MAP_REVIEW.maps[k])")
    await pg.evaluate("document.getElementById('cnpMapCards').click()"); await pg.wait_for_timeout(700)
    r = await pg.evaluate("({none: document.querySelectorAll('.rv1-none').length, secs: document.querySelectorAll('.pk1-mc-sec').length, rv: document.querySelectorAll('.has-rv1').length, bar: !!document.getElementById('rv1Copy')})")
    ok(r['rv'] == 0 and r['none'] >= 1 and not r['bar'], f'no review data: lists as before + "No review yet" {r}')
    await shot(pg, 'no-review', w)
    await pg.keyboard.press('Escape')
    # 2. a fake review (in the page only)
    await pg.evaluate("""(()=>{ const T = window.__T, o = T.other, i = T.ids;
      MAP_REVIEW.maps[T.map] = {chosen: i.slice(0, 6).map((id, k)=> ({id, why: 'Fake reason ' + (k + 1) + ': fits the map and fills a gap in the curve', by: ['owner', 'claude', 'kept'][k % 3]})),
        cut: o.slice(0, 3).map((id, k)=> ({id, why: 'Fake cut ' + (k + 1) + ': too strong for this early', by: k % 2 ? 'owner' : 'claude'})),
        maybe: o.slice(3, 6).map((id, k)=> ({id, why: 'Fake maybe ' + (k + 1) + ': good in other lists'}))};
      if(T.subId) MAP_REVIEW.maps[T.subId] = {chosen: [], cut: [], maybe: o.slice(6, 8).map(id=> ({id, why: 'Fake sub maybe'}))}; })()""")
    await pg.evaluate("document.getElementById('cnpMapCards').click()"); await pg.wait_for_timeout(700)
    r = await pg.evaluate("""({chosen: document.querySelectorAll('.rv1-part.is-chosen .rv1-tile').length, cut: document.querySelectorAll('.rv1-part.is-cut .rv1-tile').length, maybe: document.querySelectorAll('.rv1-part.is-maybe .rv1-tile').length,
      badge: document.querySelectorAll('.rv1-part.is-chosen .rv1-by').length, why: [...document.querySelectorAll('.rv1-tile')].every(t=> t.title && t.querySelector('.rv1-why').textContent), zoom: document.querySelectorAll('.rv1-tile [data-zoom]').length,
      none: document.querySelectorAll('.rv1-none').length, hs: document.documentElement.scrollWidth - innerWidth, mw: document.querySelector('.pk1-mc-modal').getBoundingClientRect().width,
      parts: [...document.querySelectorAll('.rv1-part h4')].map(h=> h.textContent.trim().replace(/\\s+/g, ' ')).slice(0, 3), overflowTile: [...document.querySelectorAll('.rv1-tile')].filter(t=> t.getBoundingClientRect().right > document.querySelector('.pk1-mc-modal').getBoundingClientRect().right + 1).length})""")
    ok(r['chosen'] == 6 and r['cut'] == 3 and r['maybe'] == 3, f'Chosen 6, Cut cards 3, Maybe 3 {r["chosen"]}/{r["cut"]}/{r["maybe"]}')
    ok(r['badge'] == 6 and r['why'] and r['zoom'] >= 12, f'each tile has a by-badge (chosen), a why caption + title, and stays zoomable {r["zoom"]}')
    ok(r['none'] >= 0 and r['hs'] <= 1 and r['overflowTile'] == 0, f'no horizontal overflow at {w} (page {r["hs"]}, tiles outside {r["overflowTile"]})')
    print('   ', r['parts'])
    await shot(pg, 'review-top', w)
    # zoom still works on a review tile
    await pg.hover('.rv1-part.is-cut .vis4-mc-card'); await pg.wait_for_timeout(500)
    z = await pg.evaluate("!!document.querySelector('.reward-zoom, .rw-zoom, #rewardZoomTip, [class*=zoom]:not([data-zoom]):not(.vis4-mc-card)')")
    await shot(pg, 'zoom', w)
    # flip a chosen card (cut) and a cut card (keep), copy
    await pg.mouse.move(0, 0)
    await pg.evaluate("document.querySelector('.rv1-part.is-chosen .rv1-act').click(); document.querySelector('.rv1-part.is-cut .rv1-act').click(); document.querySelector('.rv1-part.is-maybe .rv1-act').click();")
    await pg.evaluate("document.getElementById('rv1Copy').click()"); await pg.wait_for_timeout(500)
    t = await pg.evaluate("window.__rv1Last || ''"); msg = await pg.evaluate("document.getElementById('rv1CopyMsg').textContent")
    ok(t.count('keep ') == 1 and t.count('cut ') == 1 and ': keep ' in t and '; cut ' in t, f'Copy my picks text: {t!r}')
    ok(msg, f'copy message shown: {msg!r}')
    await pg.evaluate("document.querySelector('.pk1-mc-body').scrollTop = 0; document.querySelector('.rv1-part.is-cut').scrollIntoView({block:'center'})"); await pg.wait_for_timeout(300)
    await shot(pg, 'review-flipped', w)
    await pg.evaluate("document.querySelector('.rv1-part.is-maybe').scrollIntoView({block:'center'})"); await pg.wait_for_timeout(300)
    await shot(pg, 'review-maybe', w)
    await pg.evaluate("document.querySelector('.pk1-mc-body').scrollTop = 99999"); await pg.wait_for_timeout(300)
    await shot(pg, 'review-bottom', w)
    ok(not errs, f'no page errors {errs[:2]}')
    await ctx.close()
async def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--widths', nargs='*', type=int, default=[1366, 390]); ap.add_argument('--keep', action='store_true'); a = ap.parse_args()
    h = serve(); url = f'http://127.0.0.1:{h.server_address[1]}/index.html'
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME if os.path.exists(CHROME) else None)
        for w in a.widths: await run(b, url, w)
        await b.close()
    if a.keep:
        os.makedirs(KEEP, exist_ok=True)
        for f in shots: shutil.copy(f, KEEP)
    print('FAILED: %d' % len(fails) if fails else 'all checks passed'); sys.exit(1 if fails else 0)
asyncio.run(main())
