#!/usr/bin/env python3
"""Package DF3 (2026-10-24, the selfish boons): a challenge skirmish in the built game at 390 and 1366, screenshots in docs/screens/DF3/.
Checks: the fight panel shows the Challenge pill and the boon's red pill with its count; in the fight the boon's Environment card is
red-framed, its ribbon says Theirs and its line the count ("On: 16 of 16 enemy cards share the theme"); its hover text says what it does;
when the boon helps an enemy unit (a blind Cave unit in the Darkness hitting for double), the card shines (is-firing), the unit glows and
the log says "Blind Fury helps the enemy"; a normal skirmish of the same map has no boon card; no page errors.
    python3 tests/e2e/df3_2026_10_24.py [--widths 390 1366]   (build first)"""
import asyncio, os, re, sys, functools, http.server, socketserver, threading
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'docs', 'screens', 'DF3'); os.makedirs(OUT, exist_ok=True)
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
SKIP = ("if(!localStorage.getItem('df3_boot')){ localStorage.setItem('df3_boot','1'); localStorage.setItem('bramblewood_arena_tutorial_done','1');"
        "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying','castle-shield','castle-passive','pl-need','pl-do','pl-after'])); }"
        "sessionStorage.setItem('bramblewood_seen_splash','1');")
MAP, KEY, OTHER = 'm4', '8-5', '8-1'   # Caves & Alcoves: 8-5 Sulfur Vent Path carries Blind Fury; 8-1 is a normal skirmish
fails = []
def ok(c, m):
    print(('  ok  ' if c else '  FAIL ') + m)
    if not c: fails.append(m)
def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    class S(socketserver.ThreadingTCPServer):
        daemon_threads = True
        def handle_error(self, *a): pass
    h = S(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); threading.Thread(target=h.serve_forever, daemon=True).start(); return h
async def page(b, url, w):
    pg = await b.new_page(viewport={'width': w, 'height': 844 if w < 700 else 860}, has_touch=(w < 700)); pg._errs = []
    pg.on('pageerror', lambda e: pg._errs.append(str(e)))
    await pg.add_init_script(SKIP); await pg.goto(url); await pg.wait_for_timeout(1300)
    await pg.evaluate("(()=>{ try{ skipTriggerLesson(); }catch(e){} try{ localStorage.setItem('bramblewood_res3_level_track_v1', JSON.stringify({granted: 999})); }catch(e){} FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); Object.entries(myDeckCounts).forEach(([id,n])=>{for(let i=0;i<n;i++) unlockCardForPlayer(id,'test');});"  # 2026-10-26 (release): RES3's level-reward packs would open over these flows; the test player has had them
                      "saveEnergyState({current:60, lastRegenAt:Date.now()}); try{ refreshEnergyHud(); }catch(e){} })()")
    return pg
async def shot(pg, name, w):
    await pg.add_style_tag(content='.toast, .toast-host, .xp-float{display:none !important;}'); await pg.wait_for_timeout(150)
    await pg.screenshot(path=os.path.join(OUT, f'df3-{name}-{w}.png'), animations='disabled')
E = lambda js: f"(async()=>{{ {js} }})()"
async def run(b, url, w):
    print(f'-- {w}')
    pg = await page(b, url, w)
    # the fight panel
    r = await pg.evaluate(E(f"""adminModeEnabled = true; switchTab('play'); const map = CONQUEST_MAPS.find(m=> m.id === '{MAP}'), n = map.nodes.find(x=> x.key === '{KEY}');
      const html = skirmishFieldHTML('{MAP}', n), d = document.createElement('div'); d.innerHTML = html;
      return {{challenge: !!n.challenge, boon: n.rules && n.rules.boon, pill: !!d.querySelector('.cnp-fpill.is-challenge'), selfish: (d.querySelector('.cnp-fpill.is-selfish') || {{}}).title || ''}};"""))
    ok(r['challenge'] and r['boon'] == 'blindFury', f'{KEY} is a challenge skirmish with Blind Fury ({r["boon"]})')
    ok(r['pill'] and 'Theirs: half their deck Cave' in r['selfish'], f'the panel shows the Challenge pill and the boon pill with its short words ({r["selfish"][:90]})')  # 2026-10-24 (PL1, 21:20 #1): was "On: N of M ... share the theme"
    await pg.evaluate(E(f"""try{{ openConquestMap && openConquestMap('{MAP}'); }}catch(e){{}} try{{ selectConquestNode && selectConquestNode('{MAP}', '{KEY}'); }}catch(e){{}} await new Promise(r=> setTimeout(r, 600));"""))
    # the fight
    await pg.evaluate(E(f"""startConquestMatch('{MAP}', '{KEY}'); await new Promise(r=> setTimeout(r, 2600)); try{{ skipTriggerLesson(); }}catch(e){{}}"""))
    r = await pg.evaluate("""(()=>{ const c = document.querySelector('#fieldCondCard .env-card.is-selfish'); if(!c) return null; const cs = getComputedStyle(c);
      return {ribbon: c.querySelector('.env-ribbon').textContent.trim(), line: c.querySelector('.env-line').textContent.trim(), on: c.classList.contains('is-boon-on'), shadow: cs.boxShadow, label: c.getAttribute('aria-label') || ''}; })()""")
    ok(r is not None, 'the fight shows the boon as an Environment card')
    ok(r and r['ribbon'] == 'Theirs' and r['on'], f'its ribbon says Theirs and it is on ({r and r["ribbon"]})')
    ok(r and bool(re.match(r'^\d+/\d+ Cave$', r['line'])), f'its line gives the count and the theme, e.g. "11/17 Cave" ({r and r["line"]})')  # PL1 (2026-10-24, 21:20 #1)
    ok(r and ('224, 83, 63' in r['shadow'] or '110, 26, 18' in r['shadow']), 'its frame is red')
    ok(r and 'Blind Fury' in r['label'] and 'hit for double' in r['label'], 'its words say what it does (aria-label / hover)')
    await shot(pg, 'boon-card', w)
    # the boon at work: a blind Cave unit of theirs against one of yours, in the Darkness
    r = await pg.evaluate(E("""const m = matchState, e = m.engine; m.resolving = true;
      [1, 2].forEach(pid=>{ const pl = m.players[pid]; pl.row.left = []; pl.row.center = []; pl.row.right = []; pl.hand = []; });
      const cave = Object.keys(m.players[2].deckCounts).find(id=> { const d = getCardDefs()[id]; return d && !(d.effects||{}).darksight && !(d.effects||{}).sonar && !(d.effects||{}).keenSense && (d.attack||0) > 0; });
      e.debugSpawnCard(m.players, m.sideOf, 2, cave, 'center', m.stats, []); const c = m.players[2].row.center[0]; c.wait = 0; c.hp = c.maxHp = 30;
      e.debugSpawnCard(m.players, m.sideOf, 1, 'beaver-builder', 'center', m.stats, []); const me = m.players[1].row.center[0]; me.wait = 9; me.hp = me.maxHp = 40;
      renderMatchUI(); await new Promise(r=> setTimeout(r, 500)); m.resolving = false;
      window.__fire = null; const seen = new MutationObserver(()=>{ const f = document.querySelector('#fieldCondCard .env-card.is-selfish.is-firing'); if(f && !window.__fire) window.__fire = Date.now(); });
      seen.observe(document.body, {subtree:true, attributes:true, attributeFilter:['class']});
      m.players[1].playedThisTurn = true; resolveRound();
      for(let i = 0; i < 400 && !window.__fire; i++) await new Promise(r=> setTimeout(r, 50));
      return {cave, boon: c.boon, fired: !!window.__fire};"""))
    ok(r['boon'] == 'blindFury', f'the enemy unit is marked by the boon ({r["cave"]})')
    ok(r['fired'], 'the boon card shines when it helps (is-firing)')
    await shot(pg, "boon-firing", w)
    await pg.wait_for_timeout(2500)
    r = await pg.evaluate("(()=> (matchState.log || []).filter(x=> x && x.type === 'boonFire').map(x=> (logText(x) || {}).text || '').join(' | '))()")
    ok('Blind Fury helps the enemy' in r, f'the log says Blind Fury helped the enemy ({r[:80]})')
    # a normal skirmish of the same map: no boon card
    await pg.evaluate(E(f"""try{{ endMatchQuietly && endMatchQuietly(); }}catch(e){{}} matchState = null; startConquestMatch('{MAP}', '{OTHER}'); await new Promise(r=> setTimeout(r, 2400));"""))
    r = await pg.evaluate("(()=> ({cards: document.querySelectorAll('#fieldCondCard .env-card').length, selfish: !!document.querySelector('#fieldCondCard .env-card.is-selfish')}))()")
    ok(not r['selfish'], f'{OTHER}, a normal skirmish, has no boon card ({r})')
    ok(not pg._errs, f'no page errors ({pg._errs[:2]})')
    await pg.close()
async def main():
    widths = [int(x) for x in sys.argv[sys.argv.index('--widths') + 1:]] if '--widths' in sys.argv else [390, 1366]
    h = serve(); url = f'http://127.0.0.1:{h.server_address[1]}/index.html'
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME if os.path.exists(CHROME) else None, args=['--no-sandbox'])
        for w in widths: await run(b, url, w)
        await b.close()
    h.shutdown()
    print('DF3 e2e:', 'all passed' if not fails else f'{len(fails)} failed'); sys.exit(1 if fails else 0)
asyncio.run(main())
