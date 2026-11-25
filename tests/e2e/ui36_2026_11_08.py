#!/usr/bin/env python3
"""UI36 (2026-11-08) browser check at 1366 and 390: the Achievements page's card rows; the "Card Rewards" toggle became Claim all (FIXPACK1, 2026-11-26).
 the button shows with a count; on, only the achievements that give a card stay (every FACTION_REWARD_TRACK.achievements entry), each with its card chips; an unclaimed one is highlighted, a claimed one shows the cards it gave;
 the choice is remembered after a reload; no sideways scroll at 390.
    python3 tests/e2e/ui36_2026_11_08.py      (build first; writes docs/screens/ui36/*.png; needs Playwright)"""
import asyncio, os, json, functools, threading, http.server, socketserver
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
OUT = os.path.join(ROOT, 'docs', 'screens', 'ui36'); os.makedirs(OUT, exist_ok=True)
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
UNLOCK = "try{ FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); }catch(e){} try{ saveTutorialDone(true); saveTutorial2Done(true); }catch(e){} adminModeEnabled = true;"
OPEN = E("switchTab('achievements'); await new Promise(r=> setTimeout(r, 700)); return 1;")

async def run(p, url, w, hgt):
    b = await p.chromium.launch(executable_path=CHROME if os.path.exists(CHROME) else None, args=['--no-sandbox'])
    ctx = await b.new_context(viewport={'width': w, 'height': hgt}); pg = await ctx.new_page()
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.add_init_script(SKIP); await pg.goto(url); await pg.wait_for_timeout(1500)
    await pg.evaluate(UNLOCK)
    # one card achievement claimed with its card recorded (conquest_5), First Victory made claimable, the rest untouched
    await pg.evaluate(E("""myClaimedAchievements.delete('first_win'); myClaimedAchievements.add('conquest_5'); saveClaimedAchievements();
      const defs = getCardDefs(), ids = Object.keys(defs).filter(i=> !defs[i].test && !isEquipmentDef(defs[i]) && defs[i].art).slice(0, 1); ui36SaveAchvCards('conquest_5', ids);
      const s = loadMatchStats(); s.wins = Math.max(s.wins, 1); try{ localStorage.setItem('bramblewood_arena_stats', JSON.stringify(s)); }catch(e){} return 1;"""))
    await pg.evaluate(OPEN)
    # 2026-11-26 (FIXPACK1, owner 11-24 #10): the Card Rewards filter became Claim all, locked until Map 15 (as a player: Admin Mode off)
    await pg.evaluate("adminModeEnabled = false; switchTab('achievements'); 1"); await pg.wait_for_timeout(400)
    r = await pg.evaluate(E("""const cardIds = Object.keys(FACTION_REWARD_TRACK.achievements).filter(k=> FACTION_REWARD_TRACK.achievements[k] > 0), btn = document.getElementById('achvClaimAll');
      return {cardIds, btn: !!btn, txt: btn ? btn.textContent.replace(/\\s+/g, ' ').trim() : '', dis: !!(btn && btn.disabled), reach: adminModeEnabled ? 99 : playerMapReach(), tileChips: document.querySelectorAll('.achv-tile .achv-cards').length};"""))
    print('  ', w, json.dumps(r)[:400])
    ok(r['btn'] and 'Claim all' in r['txt'] and (r['dis'] == (r['reach'] < 15)), f'{w}: Claim all shows, locked before Map 15 ({r["txt"]}, reach {r["reach"]})')
    ok(r['tileChips'] == len(r['cardIds']), f'{w}: every card achievement carries its card chips ({r["tileChips"]})')
    await pg.screenshot(path=os.path.join(OUT, f'achievements-all-{w}.png'), full_page=True)
    await pg.evaluate("window.playerMapReach = ()=> 15; switchTab('achievements'); 1"); await pg.wait_for_timeout(500)
    r = await pg.evaluate("(()=>{ const b = document.getElementById('achvClaimAll'); return {dis: b.disabled, n: +b.querySelector('.acb-n').textContent, overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth}; })()")
    ok(not r['dis'] and r['n'] >= 1, f'{w}: on Map 15 it opens with the ready count {r}')
    ok(r['overflowX'] <= 1, f'{w}: no sideways scroll ({r["overflowX"]})')
    await pg.click('#achvClaimAll'); await pg.wait_for_timeout(600)
    ok(await pg.evaluate("myClaimedAchievements.has('first_win') && document.getElementById('achvClaimAll').disabled"), f'{w}: Claim all claims what is ready, then has nothing left')
    await pg.screenshot(path=os.path.join(OUT, f'achievements-cards-{w}.png'), full_page=True)
    ok(not errs, f'{w}: no page errors ' + '; '.join(errs)[:300])
    await b.close()

async def main():
    h = serve(); url = f'http://127.0.0.1:{h.server_address[1]}/index.html'
    async with async_playwright() as p:
        for w, hgt in ((1366, 860), (390, 844)):
            print(f'-- {w}'); await run(p, url, w, hgt)
    print('FAILS' if fails else 'all ok', len(fails)); raise SystemExit(1 if fails else 0)
asyncio.run(main())
