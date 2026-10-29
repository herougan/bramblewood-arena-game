#!/usr/bin/env python3
"""Package ENG13 (2026-10-29, owner 21:36 "Admin - clicking the currencies +100 then doubles it"): in the built page, a tap on a wallet currency
(Profile's wallet pills, the Inventory's Wallet) adds 100 under 100, then doubles, once a tap (one listener); with Admin Mode off it does nothing.
And the Map 3 Ambush leaves 3-2 open (no locked node). Build first.
    python3 tests/e2e/eng13_2026_10_29.py      # exits 1 on a failed check"""
import asyncio, http.server, socketserver, threading, functools, os, sys
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
DONE = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1'); localStorage.setItem('bramblewood_arena_faction','otters');"
        "window.addEventListener('load', ()=>{ try{ skipTriggerLesson(); saveTutorial2Done(); saveTutorialDone(); window.soonCheckMilestones = ()=>{}; window.showCoachTip = ()=>{}; }catch(e){} });")
fails = []
def ok(c, m):
    print(('  ok  ' if c else '  FAIL ') + m)
    if not c: fails.append(m)
def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    h = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); threading.Thread(target=h.serve_forever, daemon=True).start(); return h
async def main():
    h = serve(); url = 'http://127.0.0.1:%d/index.html' % h.server_address[1]
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME)
        pg = await b.new_page(viewport={'width': 1366, 'height': 860}); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.add_init_script(DONE); await pg.goto(url)
        await pg.wait_for_function("typeof switchTab === 'function' && typeof adminCurrencyTap === 'function'", timeout=60000); await pg.wait_for_timeout(1500)
        await pg.evaluate("myCurrencies.dust = 40; saveCurrencies(true); setAdminMode(false); switchTab('profile');"); await pg.wait_for_timeout(500)
        r = await pg.evaluate("(()=>{ const el = document.querySelector('.pf-wallet [data-cur-kind=dust]'); if(!el) return null; el.click(); return myCurrencies.dust; })()")
        ok(r == 40, f'Admin Mode off: a tap on Dust changes nothing ({r})')
        await pg.evaluate("setAdminMode(true); switchTab('profile');"); await pg.wait_for_timeout(500)
        seq = await pg.evaluate("(()=>{ const out = []; for(let i = 0; i < 3; i++){ document.querySelector('.pf-wallet [data-cur-kind=dust]').click(); out.push(myCurrencies.dust); } return out; })()")
        ok(seq == [140, 280, 560], f'Admin Mode on: 40 -> +100 -> x2 -> x2, one step a tap {seq}')
        txt = await pg.evaluate("document.querySelector('.pf-wallet [data-cur-kind=dust]').textContent")
        ok('560' in txt, f'the pill shows the new balance ({txt.strip()!r})')
        await pg.evaluate("myCurrencies.gold = 0; saveCurrencies(true); try{ switchTab('inventory'); }catch(e){} renderInventory();"); await pg.wait_for_timeout(500)
        g = await pg.evaluate("(()=>{ const el = document.querySelector('#view-inventory [data-cur-kind=gold]'); if(!el) return null; el.click(); return [myCurrencies.gold, el.querySelector('.inv-n').textContent]; })()")
        ok(g == [100, '100'], f'the Inventory wallet: 0 -> 100 ({g})')
        # the Ambush leaves 3-2 open
        st = await pg.evaluate("""(()=>{ const am = ambushMap(); saveAmbushState({triggered: Date.now(), foe: 'hummingbirds', pos: {x: 62, y: 74}}); applyNodeEdits();
          const n32 = am.nodes.find(n=> !n.ambush && skirmishCode(am.id, n.key) === AMBUSH_AT), a = am.nodes.find(n=> n.ambush);
          return {pending: ambushPending(), locked: ambushLocksNode(am, n32), ai: a && a.ai, lvl: a && a.enemyLevel, deck: a && Object.values(a.deck).reduce((x, y)=> x + y, 0)}; })()""")
        ok(st['pending'] and st['locked'] is False and st['ai'] == 'smart' and st['lvl'] == 10 and st['deck'] == 18, f'the Ambush stands (not won), 3-2 is not locked, Smart, Enemy level 10, 18 cards {st}')
        ok(not errs, f'no page errors {errs[:2]}')
        await b.close()
    h.shutdown()
asyncio.run(main())
print('eng13 e2e: %s' % ('ALL OK' if not fails else '%d FAILED' % len(fails)))
sys.exit(1 if fails else 0)
