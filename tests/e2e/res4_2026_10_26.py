#!/usr/bin/env python3
"""Package RES4 (2026-10-26): the Trail Mix Trek (the monthly pass, PROP1-2) in the browser, with screenshots at 390 and 1366.

    python3 tests/e2e/res4_2026_10_26.py                       # checks + shots in tests/out/shots/res4-*.png
    python3 tests/e2e/res4_2026_10_26.py --widths 1366 --keep  # --keep copies the shots to docs/screens/RES4/ (as .jpg)

Covers: the Home note and the map cluster's 🚐 (both open the page), the page (the road of 30 tiers, the van at your Stickers, this week's three
challenges, days left, the locked premium lane with no price), claiming a reached tier from the road, Stickers from a notice, the first win of the
day and a finished challenge, the month's reset paying reached tiers, and the Group Dungeon's aqua name. Every page calls skipTriggerLesson() and
sets the level track (the test player has had its level rewards). Build first. Exits 1 on a failed check.
"""
import argparse, asyncio, http.server, socketserver, threading, functools, os, sys
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'tests', 'out', 'shots'); os.makedirs(OUT, exist_ok=True)
KEEP = os.path.join(ROOT, 'docs', 'screens', 'RES4')
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
DONE = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1'); localStorage.setItem('bramblewood_arena_faction','otters');"
        "localStorage.setItem('bramblewood_res3_level_track_v1', JSON.stringify({granted: 999}));"
        "window.addEventListener('load', ()=>{ try{ skipTriggerLesson(); saveTutorial2Done(); saveTutorialDone(); saveEnergyState({current:200, lastRegenAt:Date.now()});"
        " window.showCoachTip = ()=>{}; window.maybeShowCoachTip = ()=>{}; }catch(e){} });")
fails = []; shots = []

def ok(cond, msg):
    print(('  ok  ' if cond else '  FAIL ') + msg)
    if not cond: fails.append(msg)

def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    httpd = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT))
    threading.Thread(target=httpd.serve_forever, daemon=True).start(); return httpd

async def page(b, url, w):
    ctx = await b.new_context(viewport={'width': w, 'height': 844 if w < 700 else 860}, has_touch=w < 700)
    pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e) + ' @ ' + (e.stack or '')[:240])); pg._errs = errs; pg._ctx = ctx
    await pg.add_init_script(DONE)
    await pg.goto(url); await pg.wait_for_function("typeof switchTab === 'function' && typeof renderTrailPage === 'function'", timeout=60000); await pg.wait_for_timeout(2200)
    await pg.evaluate("(()=>{ try{ skipTriggerLesson(); }catch(e){} try{ localStorage.setItem('bramblewood_res3_level_track_v1', JSON.stringify({granted: 999})); }catch(e){} try{ FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); }catch(e){} adminModeEnabled = false; window.playDialogue = async ()=>({}); })()")
    return pg

async def close(pg):
    ok(not pg._errs, f'no page errors {pg._errs[:2]}')
    await pg._ctx.close()

async def shot(pg, name, w, clip=None, pad=12, full=False):
    f = os.path.join(OUT, f'res4-{name}-{w}.png')
    h = await pg.query_selector(clip) if clip else None
    bb = await h.bounding_box() if h else None
    if bb: await pg.screenshot(path=f, clip={'x': max(0, bb['x'] - pad), 'y': max(0, bb['y'] - pad), 'width': bb['width'] + 2 * pad, 'height': bb['height'] + 2 * pad}, animations='allow')
    else: await pg.screenshot(path=f, animations='allow', full_page=full)
    shots.append(f); return f

def E(body): return "(async()=>{ " + body + " })()"
# A trail mid-month: 1,000 Stickers (tier 6), tiers 1-3 claimed, a challenge part done.
SEED = """const st = res4TrailState(); st.pts = 1000; st.seen = 700; st.claimed = [1, 2, 3]; res4TrailSave(st);"""

async def run(b, url, w):
    print(f'-- width {w}')
    pg = await page(b, url, w)
    r = await pg.evaluate(E(SEED + """ switchTab('home'); await new Promise(r=> setTimeout(r, 500));
      const n = document.querySelector('.note-trail'); return {note: !!n, text: n && n.textContent, badge: n && (n.querySelector('.home-badge')||{}).textContent};"""))
    ok(r['note'] and 'Trail Mix Trek' in (r['text'] or '') and 'Tier 6' in r['text'], f"the Home note: {r['text']}")
    ok(r['badge'] == '3', f"...with the 3 tiers to claim on it ({r['badge']})")
    await shot(pg, 'home', w, full=False)
    await pg.click('.note-trail'); await pg.wait_for_timeout(1500); await pg.wait_for_function("document.getElementById('trVan') && !document.querySelector('#trVan.is-driving')", timeout=20000); await pg.wait_for_timeout(1800)
    r = await pg.evaluate(E("""const v = document.getElementById('view-trail'), van = document.getElementById('trVan'), wrap = document.getElementById('trRoadWrap');
      const vb = van.getBoundingClientRect(), s6 = document.querySelector('.tr-stop[data-tr-tier="6"]').getBoundingClientRect(), s7 = document.querySelector('.tr-stop[data-tr-tier="7"]').getBoundingClientRect();
      const mid = vb.left + vb.width / 2;
      return {tab: currentTab, shown: !v.hidden, stops: document.querySelectorAll('.tr-stop').length, prem: document.querySelectorAll('.tr-prem-cell').length,
        ready: document.querySelectorAll('.tr-stop.is-ready').length, got: document.querySelectorAll('.tr-stop.is-got').length, ch: document.querySelectorAll('.tr-ch').length,
        dbg: [mid, s6.left, s6.width, s7.left, vb.left, vb.right, wrap.getBoundingClientRect().left, wrap.getBoundingClientRect().right, getComputedStyle(van).left, van.style.cssText, van.className],
        vanBetween: mid >= s6.left + s6.width / 2 - 4 && mid <= s7.left + s7.width / 2, vanVisible: vb.left >= wrap.getBoundingClientRect().left - 2 && vb.right <= wrap.getBoundingClientRect().right + 2,
        days: document.querySelectorAll('.tr-fact')[2].textContent, price: /\\$|USD|€|price/i.test(document.querySelector('.tr-page').textContent),
        pageW: document.documentElement.scrollWidth, vw: innerWidth, claimAll: !!document.getElementById('trClaimAll')};"""))
    ok(r['tab'] == 'trail' and r['shown'], 'the Home note opens the Trail page')
    ok(r['stops'] == 30 and r['prem'] == 30, f"30 free stops and 30 locked premium cells ({r['stops']}, {r['prem']})")
    ok(r['ready'] == 3 and r['got'] == 3, f"tiers 1-3 claimed, 4-6 ready ({r['got']}, {r['ready']})")
    ok(r['vanBetween'] and r['vanVisible'], f"the van is parked between tiers 6 and 7 (1,000 Stickers) and scrolled into view {r['dbg']}")
    ok(r['ch'] == 3, f"three challenges this week ({r['ch']})")
    ok('left' in r['days'] or 'day' in r['days'], f"days left shown: {r['days']}")
    ok(not r['price'], 'no price anywhere on the page')
    ok(r['pageW'] <= r['vw'] + 1, f"no sideways page scroll ({r['pageW']} > {r['vw']})")
    await shot(pg, 'page', w, full=True)
    # claim tier 4 from the road
    r = await pg.evaluate(E("""const g0 = myCurrencies.gold || 0; document.querySelector('.tr-stop[data-tr-tier="4"]').click(); await new Promise(r=> setTimeout(r, 400));
      return {gold: (myCurrencies.gold || 0) - g0, got: res4TrailState().claimed.includes(4), state: document.querySelector('.tr-stop[data-tr-tier="4"]').className, pick: (document.querySelector('.tr-pick')||{}).textContent};"""))
    ok(r['gold'] == 60 and r['got'] and 'is-got' in r['state'], f"tapping a ready stop claims it (tier 4: +{r['gold']} Maple Leaves)")
    await pg.evaluate(E("document.querySelector('.tr-stop[data-tr-tier=\"9\"]').click(); await new Promise(r=> setTimeout(r, 300));"))
    await shot(pg, 'road', w, clip='.tr-road-wrap')
    await shot(pg, 'pick', w, clip='#trPick')
    # earning: a notice, the first win of the day, a challenge
    r = await pg.evaluate(E("""const st0 = res4TrailState(); st0.winDay = ''; st0.dayTiers = []; st0.chPaid = []; res4TrailSave(st0); const p0 = res4TrailState().pts;
      res4TrailOnNotice('A', 1); const pA = res4TrailState().pts - p0;
      res4TrailOnNotice('C', 3); const pC = res4TrailState().pts - p0 - pA;
      bumpQuestCounter('wins', 1); const pW = res4TrailState().pts - p0 - pA - pC; bumpQuestCounter('wins', 1); const pW2 = res4TrailState().pts - p0 - pA - pC - pW;
      const st = res4TrailState(), c = TRAIL_CHALLENGES.find(x=> x.id === st.ch[0]); const q = loadQuestState(); const need = Math.max(0, c.goal - ((q.weekly||{})[c.counter]||0));
      const before = res4TrailState().pts; if(need) bumpQuestCounter(c.counter, need); else res4TrailPayChallenges(res4TrailState());
      const after = res4TrailState(); return {pA, pC, pW, pW2, ch: after.pts - before, paid: after.chPaid.includes(c.id), log: after.log.length};"""))
    ok(r['pA'] == 20, f"an A notice: +20 ({r['pA']})")
    ok(r['pC'] == 30, f"a C notice that makes 3 today: +10 and the day's first notice tier +20 ({r['pC']})")
    ok(r['pW'] == 10 and r['pW2'] == 0, f"the first win of the day +10, the second nothing ({r['pW']}, {r['pW2']})")
    ok(r['ch'] >= 50 and r['paid'], f"a finished challenge +50 ({r['ch']})")
    # weekly tier, deck wins
    r = await pg.evaluate(E("""const p0 = res4TrailState().pts; res4TrailOnWeeklyTier(0); res4TrailOnWeeklyTier(0); const a = res4TrailState().pts - p0;
      const d0 = (loadQuestState().weekly||{}).decksWon||0; res4TrailNoteDeckWin('deckA'); res4TrailNoteDeckWin('deckA'); res4TrailNoteDeckWin('deckB');
      return {a, decks: ((loadQuestState().weekly||{}).decksWon||0) - d0};"""))
    ok(r['a'] == 100, f"weekly tier 1 +100, once ({r['a']})")
    ok(r['decks'] == 2, f"decksWon counts different decks once each ({r['decks']})")
    # the month's reset pays reached tiers
    r = await pg.evaluate(E("""localStorage.setItem(RES4_TRAIL_KEY, JSON.stringify(Object.assign(res4TrailFresh('2026-09'), {pts: 4600, claimed: [1, 2], chests: 0, titles: []})));
      const g0 = myCurrencies.gold || 0, d0 = myCurrencies.dust || 0, held0 = (JSON.parse(localStorage.getItem(HELD_PACKS_KEY) || '[]')).length;
      const st = res4TrailState(); return {month: st.month, pts: st.pts, gold: (myCurrencies.gold || 0) - g0, dust: (myCurrencies.dust || 0) - d0, title: (st.titles || []).length};"""))
    ok(r['month'] != '2026-09' and r['pts'] == 0, f"a new month starts the road again ({r['month']}, {r['pts']})")
    ok(r['gold'] >= 800 and r['dust'] >= 800 and r['title'] == 1, f"...and pays last month's 28 unclaimed tiers (+{r['gold']} Maple Leaves, +{r['dust']} Dust, the title)")
    await close(pg)
    # the map cluster's 🚐 and the Group Dungeon's name
    pg = await page(b, url, w)
    r = await pg.evaluate(E("""playSubTab = 'conquest'; switchTab('play'); await new Promise(r=> setTimeout(r, 2500));
      const btn = document.getElementById('trailNavBtnPlay'); const bb = btn && btn.getBoundingClientRect(); return {btn: !!btn, vis: !!(bb && bb.width > 0 && bb.top >= 0 && bb.right <= innerWidth + 1), name: gdThemedName()};"""))
    ok(r['btn'] and r['vis'], 'the map\'s corner cluster has the 🚐 button, on screen')
    ok(r['name'] == 'The Tidelock Vault', f"the first group dungeon is The Tidelock Vault ({r['name']})")
    await shot(pg, 'map-cluster', w, clip='.play-subtabs-actions', pad=10)
    await pg.click('#trailNavBtnPlay'); await pg.wait_for_timeout(1500)
    ok(await pg.evaluate("currentTab") == 'trail', 'the 🚐 opens the Trail page')
    await close(pg)

async def main(a):
    httpd = serve(); url = f'http://127.0.0.1:{httpd.server_address[1]}/index.html'
    async with async_playwright() as p:
        exe = CHROME if os.path.exists(CHROME) else None
        b = await p.chromium.launch(executable_path=exe, args=['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'])
        for w in [int(x) for x in a.widths.split(',')]: await run(b, url, w)
        await b.close()
    httpd.shutdown()
    if a.keep:
        from PIL import Image
        os.makedirs(KEEP, exist_ok=True)
        for f in shots: Image.open(f).convert('RGB').save(os.path.join(KEEP, os.path.basename(f)[:-4] + '.jpg'), quality=82)
    print(f'{len(fails)} failed' if fails else 'all passed'); sys.exit(1 if fails else 0)

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--widths', default='390,1366'); ap.add_argument('--keep', action='store_true')
    asyncio.run(main(ap.parse_args()))
