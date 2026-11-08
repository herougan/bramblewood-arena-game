#!/usr/bin/env python3
"""UI36 (2026-11-08) browser check at 1366 and 390: the Achievements page's "Card Rewards" toggle (owner 10:52 #13).
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
    r = await pg.evaluate(E("""const cardIds = Object.keys(FACTION_REWARD_TRACK.achievements).filter(k=> FACTION_REWARD_TRACK.achievements[k] > 0), btn = document.getElementById('achvCardsBtn');
      return {cardIds, btn: !!btn, txt: btn ? btn.textContent.replace(/\\s+/g, ' ').trim() : '', n: btn ? +btn.querySelector('.acb-n').textContent : -1, all: document.querySelectorAll('.achv-tile').length, pressed: btn && btn.getAttribute('aria-pressed'), tileChips: document.querySelectorAll('.achv-tile .achv-cards').length};"""))
    print('  ', w, json.dumps(r)[:400])
    ok(r['btn'] and r['n'] == len(r['cardIds']) and 'Card Rewards' in r['txt'], f'{w}: the Card Rewards button shows with the count ({r["txt"]})')
    ok(r['pressed'] == 'false' and r['all'] > r['n'], f'{w}: off by default, all {r["all"]} achievements show')
    ok(r['tileChips'] == r['n'], f'{w}: every card achievement carries its card chips ({r["tileChips"]})')
    await pg.screenshot(path=os.path.join(OUT, f'achievements-all-{w}.png'), full_page=True)
    await pg.click('#achvCardsBtn'); await pg.wait_for_timeout(400)
    r = await pg.evaluate(E("""const t = [...document.querySelectorAll('.achievements-panel .achv-tile')];
      return {n: t.length, allCard: t.every(x=> x.classList.contains('has-card')), hot: t.filter(x=> x.classList.contains('is-card-hot')).length, claimed: t.filter(x=> x.classList.contains('is-claimed')).length,
        ready: t.filter(x=> x.classList.contains('is-ready')).length, stamp: t.filter(x=> x.classList.contains('is-claimed') && x.querySelector('.achv-stamp')).length, pressed: document.getElementById('achvCardsBtn').getAttribute('aria-pressed'),
        stored: localStorage.getItem(UI36_ONLY_KEY), realChip: t.filter(x=> x.classList.contains('is-claimed')).some(x=> x.querySelector('.card-chip:not(.is-mystery)')), mystery: document.querySelectorAll('.is-card-hot .card-chip.is-mystery').length,
        overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth};"""))
    print('  ', w, json.dumps(r))
    ok(r['n'] == 8 and r['allCard'], f'{w}: on, only the 8 card achievements remain ({r["n"]})')
    ok(r['pressed'] == 'true' and r['stored'] == '1', f'{w}: the toggle is pressed and stored')
    ok(r['hot'] >= 1 and r['claimed'] >= 1 and r['stamp'] == r['claimed'], f'{w}: unclaimed rows highlighted ({r["hot"]}), claimed rows marked ({r["claimed"]})')
    ok(r['realChip'] and r['mystery'] >= 1, f'{w}: a claimed row shows the card it gave, an unclaimed one face-down chips')
    ok(r['overflowX'] <= 1, f'{w}: no sideways scroll ({r["overflowX"]})')
    await pg.screenshot(path=os.path.join(OUT, f'achievements-cards-{w}.png'), full_page=True)
    await pg.click('[data-achv-filter="ready"]'); await pg.wait_for_timeout(300)
    r = await pg.evaluate("(()=>{ const t = [...document.querySelectorAll('.achievements-panel .achv-tile')]; return t.length > 0 && t.every(x=> x.classList.contains('has-card') && x.classList.contains('is-ready')); })()")
    ok(r, f'{w}: Ready + Card Rewards shows only ready card achievements')
    await pg.click('[data-achv-filter="all"]'); await pg.wait_for_timeout(200)
    await pg.reload(); await pg.wait_for_timeout(1500); await pg.evaluate(UNLOCK); await pg.evaluate(OPEN)
    r = await pg.evaluate("({p: document.getElementById('achvCardsBtn').getAttribute('aria-pressed'), n: document.querySelectorAll('.achievements-panel .achv-tile').length})")
    ok(r['p'] == 'true' and r['n'] == 8, f'{w}: remembered after a reload {r}')
    await pg.click('#achvCardsBtn'); await pg.wait_for_timeout(300)
    ok(await pg.evaluate("document.querySelectorAll('.achievements-panel .achv-tile').length > 8 && localStorage.getItem(UI36_ONLY_KEY) === '0'"), f'{w}: off again shows everything')
    ok(not errs, f'{w}: no page errors ' + '; '.join(errs)[:300])
    await b.close()

async def main():
    h = serve(); url = f'http://127.0.0.1:{h.server_address[1]}/index.html'
    async with async_playwright() as p:
        for w, hgt in ((1366, 860), (390, 844)):
            print(f'-- {w}'); await run(p, url, w, hgt)
    print('FAILS' if fails else 'all ok', len(fails)); raise SystemExit(1 if fails else 0)
asyncio.run(main())
