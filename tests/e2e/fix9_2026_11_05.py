#!/usr/bin/env python3
"""FIX9 (2026-11-05) browser check, at 390 and 1366: the 💧N water pips hide until Shift is held; a unit an arrival (a Pounce) wounds
or kills shows its Health from before the blow, then the blow takes it down; the Dungeons tab says Dailies with several slots.
    python3 tests/e2e/fix9_2026_11_05.py      (build first; writes docs/screens/fix9/*.png; needs Playwright)"""
import asyncio, os, sys, json, functools, threading, http.server, socketserver
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
OUT = os.path.join(ROOT, 'docs', 'screens', 'fix9'); os.makedirs(OUT, exist_ok=True)
SKIP = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1');"
        "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying']));")
fails = []
def ok(c, m):
    print(('  ok ' if c else '  ✗ ') + m)
    if not c: fails.append(m)

def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    h = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); threading.Thread(target=h.serve_forever, daemon=True).start(); return h

SETUP = """(()=>{ FEATURE_SPOTS.forEach(sp=>{ try{ unlockFeature(sp.key); }catch(e){} }); myCurrencies.energy = 60; window.showCoachTip = function(){}; window.deckSizeOkOrWarn = ()=> true; const m = CONQUEST_MAPS[0]; const n = m.nodes.find(n=> n.kind === 'skirmish');
  conquestSelectedMap = m.id; playSubTab = 'conquest'; switchTab('play'); startConquestMatch(m.id, n.key, {skipEnergyCost:true, noOpener:true}); return 1; })()"""
# a unit of yours on the board: the first one, or a spawned one
UNIT = """(()=>{ const m = matchState; const E = m.engine; let c = E.allBoardCards(m.players[1]).find(x=> x.hp > 0);
  if(!c){ E.debugSpawnCard(m.players, m.sideOf, 1, Object.keys(getCardDefs()).find(id=> { const d = getCardDefs()[id]; return d && (d.health||0) >= 6 && !d.token && !d.test && d.cardType !== 'spell'; }), 0, m.stats, []); c = E.allBoardCards(m.players[1]).find(x=> x.hp > 0); }
  renderBoard(); return c && c.uid; })()"""

async def snap(pg, el, path):  # the card and a margin around it, from a page shot (the tile itself is never "stable": it breathes)
    if not el: return
    bb = await el.bounding_box()
    if not bb: return
    m = 40; x = max(0, bb['x'] - m); y = max(0, bb['y'] - m)
    await pg.screenshot(path=path, clip={'x': x, 'y': y, 'width': bb['width'] + 2 * m, 'height': bb['height'] + 2 * m}, animations='disabled')

async def run(b, url, w):
    pg = await b.new_page(viewport={'width': w, 'height': 844 if w < 700 else 860})
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.add_init_script(SKIP); await pg.goto(url); await pg.wait_for_timeout(1300)
    await pg.evaluate(SETUP); await pg.wait_for_timeout(3500)
    uid = await pg.evaluate(UNIT); await pg.wait_for_timeout(600)
    ok(uid is not None, f'{w}: a unit of yours on the board ({uid})')
    # 4. water pips
    await pg.evaluate(f"(()=>{{ const c = currentCardByUid({uid}); c.water = 2; renderBoard(); }})()"); await pg.wait_for_timeout(400)
    vis = "(()=>{ const b = document.querySelector('.abadge.en20-water'); return b ? getComputedStyle(b).display : 'missing'; })()"
    d0 = await pg.evaluate(vis)
    el = await pg.query_selector(f'.board-card[data-uid="{uid}"]')
    await snap(pg, el, os.path.join(OUT, f'wet-hidden-{w}.png'))
    await pg.keyboard.down('Shift'); await pg.wait_for_timeout(150); d1 = await pg.evaluate(vis)
    await snap(pg, el, os.path.join(OUT, f'wet-shift-{w}.png'))
    await pg.keyboard.up('Shift'); await pg.wait_for_timeout(150); d2 = await pg.evaluate(vis)
    ok(d0 == 'none' and d1 not in ('none', 'missing') and d2 == 'none', f'{w}: the 💧2 pip hidden ({d0}), shown with Shift ({d1}), hidden again ({d2})')
    await pg.evaluate(f"(()=>{{ const c = currentCardByUid({uid}); c.water = 0; renderBoard(); }})()")
    # 3. a Pounce wounds the unit: Health before the blow until it lands
    hpTxt = f"(()=>{{ const e = document.querySelector('.board-card[data-uid=\"{uid}\"] .stats .hp'); return e ? e.textContent.replace(/[^0-9]/g, '') : null; }})()"
    before = await pg.evaluate(hpTxt)
    await pg.evaluate(f"""(()=>{{ const m = matchState, c = currentCardByUid({uid}); const pre = boardPosSnapshot(m); const dmg = Math.max(1, Math.min(c.hp - 1, 3));
      c.hp -= dmg; const foe = m.engine.allBoardCards(m.players[2])[0];
      const evs = [{{type:'hit', side:'B', attUid: foe ? foe.uid : null, attDefId: foe ? foe.defId : null, targetUid: c.uid, targetDefId: c.defId, dmg, pounce:true}}];
      holdArrivalDead(m, pre, evs, evs); m.aiArrivalEvents = evs; renderBoard(); window.__fix9dmg = dmg; }})()""")
    await pg.wait_for_timeout(200)
    held = await pg.evaluate(hpTxt)
    if el: pass
    card = await pg.query_selector(f'.board-card[data-uid="{uid}"]')
    await snap(pg, card, os.path.join(OUT, f'pounce-before-{w}.png'))
    await pg.evaluate("replayAiArrivalEvents(matchState)"); await pg.wait_for_timeout(2500)
    after = await pg.evaluate(hpTxt); dmg = await pg.evaluate("window.__fix9dmg")
    card = await pg.query_selector(f'.board-card[data-uid="{uid}"]')
    await snap(pg, card, os.path.join(OUT, f'pounce-after-{w}.png'))
    ok(held == before and after is not None and before is not None and int(after) == int(before) - int(dmg), f'{w}: Health {before} before the Pounce lands (shown {held}), {after} after ({dmg} damage)')
    # 1. the Dungeons tab with several slots: Dailies
    lab = await pg.evaluate("(()=>{ try{ return dungeonTabLabel(); }catch(e){ return 'ERR ' + e.message; } })()")
    ok(lab != 'Murgle Mayhem', f'{w}: the Dungeons tab label is the group\'s ({lab})')
    ok(not errs, f'{w}: no page errors ({" | ".join(errs[:2])})')
    await pg.close()

async def main():
    h = serve(); url = f'http://127.0.0.1:{h.server_address[1]}/index.html'
    async with async_playwright() as p:
        exe = CHROME if os.path.exists(CHROME) else None
        b = await p.chromium.launch(executable_path=exe, args=['--enable-unsafe-swiftshader', '--use-angle=swiftshader'])
        for w in (390, 1366): await run(b, url, w)
        await b.close()
    h.shutdown()
    print(f'fix9 e2e: {len(fails)} failed'); sys.exit(1 if fails else 0)
asyncio.run(main())
