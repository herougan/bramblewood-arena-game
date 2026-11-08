"""CONTENT18 (2026-11-08) browser check at 1366: a star path's card mark (Wildpaths, The Root's r8) shows its card in the detail, learning
it grants The Thistle Baron (source starpath) with the claim reveal, and the card's Codex detail pill reads "Star path"; in a real Canopy
fight (14-A-1) the enemy defends the Canopy Bower and a Rainforest unit it plays arrives +1/+2 while a non-habitat one does not. Screens in
docs/screens/content18/.
    python3 tests/e2e/content18_2026_11_08.py      (build first; writes docs/screens/content18/*.png; needs Playwright)"""
import asyncio, os, json, functools, threading, http.server, socketserver
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
OUT = os.path.join(ROOT, 'docs', 'screens', 'content18'); os.makedirs(OUT, exist_ok=True)
SKIP = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1');"
        "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying']));"
        "localStorage.setItem('bramblewood_pitch_open_v1','1');")
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

PATHS = E("""FEATURE_SPOTS.forEach(sp=>{ try{ unlockFeature(sp.key); }catch(e){} });
  window.wildpathAvailable = ()=> 99; localStorage.setItem(WILDPATH_KEY, JSON.stringify({r1: 1, r3: 1}));
  switchTab('paths'); await new Promise(r=> setTimeout(r, 2800));
  const g = document.querySelector('[data-wp="r8"]'); if(!g) return {mark: false};
  g.dispatchEvent(new MouseEvent('click', {bubbles: true})); await new Promise(r=> setTimeout(r, 500));
  const det = document.querySelector('.wp-detail'); if(det) det.scrollIntoView({block:'center'}); await new Promise(r=> setTimeout(r, 300)); const tile = det && det.querySelector('.c18-sp-card .card-tile'), btn = document.querySelector('#wpLearn');
  return {mark: true, icon: (g.querySelector('.wp-ico') || {}).textContent, ring: !!document.querySelector('[data-wp="r8"].c18-sp-card-mark'), detail: det ? det.innerText.slice(0, 200) : '', tile: !!tile, learn: !!btn && !btn.disabled,
    owned0: myUnlockedCardIds.has('thistle-baron')};""")

LEARN = E("""document.querySelector('#wpLearn').click(); await new Promise(r=> setTimeout(r, 1800));
  const ov = document.querySelector('.ui27-cards-ov, .rr-overlay, [class*="reward"]');
  return {owned: myUnlockedCardIds.has('thistle-baron'), rank: (JSON.parse(localStorage.getItem(WILDPATH_KEY) || '{}')).r8 || 0, reveal: !!ov,
    from: cardObtainableFrom(getCardDefs()['thistle-baron']), where: cardWhereToGetText(getCardDefs()['thistle-baron'])};""")

PILL = E("""document.querySelectorAll('.ui27-cards-ov, .pass-overlay').forEach(x=> x.remove()); document.querySelectorAll('[data-ui27-ok]').forEach(b=> b.click());
  await new Promise(r=> setTimeout(r, 400)); switchTab('codex'); await new Promise(r=> setTimeout(r, 800));
  openCardInspector('thistle-baron'); await new Promise(r=> setTimeout(r, 1200));
  const p = [...document.querySelectorAll('.pl2-where-pill, .cd-where')].map(x=> x.innerText.trim());
  const html = neInspectDetailHTML(getCardDefs()['thistle-baron']);
  return {pills: p, inHtml: /c18-sp-pill/.test(html) && /Star path/.test(html)};""")

CANOPY = E("""myCurrencies.energy = 60; window.showCoachTip = function(){}; window.deckSizeOkOrWarn = ()=> true;
  document.querySelectorAll('.modal-overlay, .ci-overlay, .pass-overlay').forEach(x=> { try{ x.remove(); }catch(e){} });
  switchTab('play'); startConquestMatch('my', '14-A-1', {skipEnergyCost:true, noOpener:true}); await new Promise(r=> setTimeout(r, 3500));
  const m = matchState; if(!m) return {match: false};
  const e = m.engine, P2 = m.players[2]; m.resolving = true;
  [1, 2].forEach(pid=>{ const pl = m.players[pid]; pl.row.left = []; pl.row.center = []; pl.row.right = []; });
  P2.lumber = 20; P2.hand = [{uid: 97101, defId: 'jaguar-stalker'}, {uid: 97102, defId: 'apollo-butterfly'}]; P2.playedThisTurn = false;
  e.placeCard(m.players, m.sideOf, 2, 97101, 'center', m.stats, []); P2.playedThisTurn = false; e.placeCard(m.players, m.sideOf, 2, 97102, 'left', m.stats, []);
  const all = [...P2.row.left, ...P2.row.center, ...P2.row.right], d = getCardDefs();
  const j = all.find(c=> c.defId === 'jaguar-stalker'), a = all.find(c=> c.defId === 'apollo-butterfly');
  renderMatchUI(); await new Promise(r=> setTimeout(r, 500)); m.resolving = false;
  return {match: true, castle: (P2.character && P2.character.id) || null, hb: P2.habitatBonus, desc: characterDescHTML(CHARACTER_DEFS['canopy-bower']),
    jag: j ? [j.atk, j.maxHp, d['jaguar-stalker'].attack, d['jaguar-stalker'].health] : null, apo: a ? [a.atk, a.maxHp, d['apollo-butterfly'].attack, d['apollo-butterfly'].health] : null};""")

async def page(p, url):
    b = await p.chromium.launch(executable_path=CHROME if os.path.exists(CHROME) else None, args=['--no-sandbox'])
    ctx = await b.new_context(viewport={'width': 1366, 'height': 860})
    pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.add_init_script(SKIP); await pg.goto(url); await pg.wait_for_timeout(1500)
    return b, pg, errs

async def main():
    h = serve(); url = f'http://127.0.0.1:{h.server_address[1]}/index.html'
    async with async_playwright() as p:
        b, pg, errs = await page(p, url)
        r = await pg.evaluate(PATHS); print('   star path:', json.dumps(r, ensure_ascii=False))
        ok(r.get('mark') and r.get('ring') and r.get('icon') == '⭐', 'The Root has a gold-ringed ⭐ card mark (r8)')
        ok(r.get('tile') and 'Thistle Baron' in r.get('detail', ''), 'its detail names The Thistle Baron and shows the card')
        ok(r.get('learn') and not r.get('owned0'), 'the mark can be learned (after r3) and the card is not owned yet')
        await pg.screenshot(path=os.path.join(OUT, 'starpath-card-mark-1366.png'))
        r = await pg.evaluate(LEARN); print('   learned:', json.dumps(r, ensure_ascii=False))
        ok(r['owned'] and r['rank'] == 1, 'learning it grants The Thistle Baron and spends the mark')
        ok(r['from'] == 'starpath' and 'Star path' in r['where'], f'its source is the star path ({r["where"]})')
        await pg.screenshot(path=os.path.join(OUT, 'starpath-card-granted-1366.png'))
        r = await pg.evaluate(PILL); print('   pill:', json.dumps(r, ensure_ascii=False))
        ok(r['inHtml'] and any('Star path' in x for x in r['pills']), f'the Codex card detail says where to get it: Star path ({r["pills"]}); the inspector pill too')
        await pg.screenshot(path=os.path.join(OUT, 'starpath-codex-pill-1366.png'))
        await pg.goto(url); await pg.wait_for_timeout(1500)
        r = await pg.evaluate(CANOPY); print('   canopy:', json.dumps(r, ensure_ascii=False))
        ok(r.get('match') and r.get('castle') == 'canopy-bower', 'a Canopy fight (14-A-1): the enemy defends the Canopy Bower')
        j, a = r.get('jag'), r.get('apo')
        ok(j and j[0] == j[2] + 1 and j[1] == j[3] + 2, f'a Rainforest unit (Jaguar Stalker) arrives +1/+2 ({j})')
        ok(a and a[0] == a[2] and a[1] == a[3], f'a non-habitat unit (Apollo Butterfly) arrives as printed ({a})')
        ok('Rainforest' in (r.get('desc') or '') and '+1' in (r.get('desc') or ''), f'the bramble line: {r.get("desc")}')
        await pg.screenshot(path=os.path.join(OUT, 'canopy-bower-fight-1366.png'))
        ok(not errs, f'no page errors ({errs[:3]})')
        await b.close()
    h.shutdown()
    print('content18 browser: %s' % ('all ok' if not fails else '%d failed' % len(fails)))
    raise SystemExit(1 if fails else 0)

asyncio.run(main())
