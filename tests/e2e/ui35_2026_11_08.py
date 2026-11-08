#!/usr/bin/env python3
"""UI35 (2026-11-08) browser check at 1366 and 390:
 #2 the Map cards window's skills section is one list (Main, Counters, recommendations together, told apart by pills; Others its own group), one line per tile, the hover says what the skill does;
 #6 NEW! counts the main progression only (Bloom is NEW! on Sunken Hollow) and the heading says "N new";
 #3 "Thematic Recommendation" heading; the deck editor's Full art / Compact switch (remembered, add / remove still work, no sideways scroll at 390);
 #4 the skirmish panel's admin list has 📦 Packs right under 🃏 Map cards and it opens the pack editor;
 #8 the SK / WK details list the Map reference's win % with its cut.
    python3 tests/e2e/ui35_2026_11_08.py      (build first; writes docs/screens/ui35/*.png; needs Playwright)"""
import asyncio, os, json, functools, threading, http.server, socketserver
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
OUT = os.path.join(ROOT, 'docs', 'screens', 'ui35'); os.makedirs(OUT, exist_ok=True)
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

MC = """(()=>{ const g = sel=> [...document.querySelectorAll('#ui19McSkills ' + sel)];
  const tiles = g('.ui19-sk[data-eng35-key]'), heads = g('.ui32-sk-head').map(h=> h.className.replace('ui32-sk-head ', '')),
    kinds = {main: g('.ui35-pill.is-main').length, counter: g('.ui35-pill.is-counter').length, sug: g('.ui28-sug').length, intro: g('.ui30-sugg').length, neu: g('.ui19-new').length};
  const n = document.querySelector('#ui19McSkills .ui35-newn');
  return {n: tiles.length, heads, kinds, maxH: Math.max(0, ...tiles.map(t=> t.getBoundingClientRect().height)), newTxt: n ? n.textContent : '', newN: n ? +n.dataset.ui35New : -1,
    newKeys: g('.ui19-sk.is-new').map(t=> t.dataset.ui19Skill), mainTilesNoPill: g('.ui19-sk[data-ui19-skill]').filter(t=> !t.querySelector('.ui35-pill.is-main') && !t.closest('.ui32-sk-head ~ *')).length,
    sideNew: g('.ui32-sk-head.is-other ~ .is-new').length, overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth}; })()"""

async def run(p, url, w, hgt):
    b = await p.chromium.launch(executable_path=CHROME if os.path.exists(CHROME) else None, args=['--no-sandbox'])
    ctx = await b.new_context(viewport={'width': w, 'height': hgt}); pg = await ctx.new_page()
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.add_init_script(SKIP); await pg.goto(url); await pg.wait_for_timeout(1500)
    await pg.evaluate(UNLOCK)

    # ---- #2 / #6 the Map cards window: Sunken Hollow (m2)
    for mid in ('m2', 'mb'):
        await pg.evaluate(E(f"pk1OpenMapCards('{mid}'); await new Promise(r=> setTimeout(r, 1200)); return 1;"))
        r = await pg.evaluate(MC); print('  ', w, mid, json.dumps(r)[:500])
        ok(not any(h in ('is-main', 'is-rec', 'is-counters') for h in r['heads']), f'{w} {mid}: no Main / Recommended / Counters headings (one list); headings: {r["heads"]}')
        ok(r['kinds']['main'] > 0 and r['kinds']['neu'] > 0, f'{w} {mid}: Main and NEW! pills show ({r["kinds"]})')
        ok(r['maxH'] < 40, f'{w} {mid}: tiles are one line ({r["maxH"]:.0f}px)')
        ok(r['newTxt'].endswith('new') and r['newN'] == len([k for k in r['newKeys'] if k not in ('flying', 'diurnal', 'tide', 'salt')]), f'{w} {mid}: heading says "{r["newTxt"]}" = the NEW! tiles without the minor skills ({len(r["newKeys"])} tiles)') # UI35 10:52 #9
        ok(r['sideNew'] == 0, f'{w} {mid}: no NEW! under Other skills')
        if mid == 'm2':
            ok('bloomCopy' in r['newKeys'], f'{w} Sunken Hollow: Bloom is NEW! (main-progression rule) {r["newKeys"]}')
            sec = await pg.query_selector('#ui19McSkills'); await sec.scroll_into_view_if_needed(); await pg.wait_for_timeout(300)
            await sec.screenshot(path=os.path.join(OUT, f'mapcards-skills-{w}.png'))
            t = await pg.query_selector('#ui19McSkills .ui19-sk.is-new')
            await t.hover(); await pg.wait_for_timeout(500)
            tip = await pg.evaluate("(()=>{ const t = document.getElementById('eng35SkTip'); return t && !t.hidden ? t.textContent : ''; })()")
            ok(len(tip) > 20, f'{w} hover on a tile shows what the skill does: {tip[:90]!r}')
            await pg.screenshot(path=os.path.join(OUT, f'mapcards-hover-{w}.png'))
        await pg.evaluate("document.getElementById('pk1McClose').click()")
    # a counter tile and a suggested tile exist somewhere on a main map, with their pills
    r = await pg.evaluate(E("""let c = 0, s = 0; for(const m of mainConquestMaps().slice(0, 8)){ pk1OpenMapCards(m.id); await new Promise(r=> setTimeout(r, 500)); c += document.querySelectorAll('#ui19McSkills .is-counter .ui35-pill.is-counter').length; s += document.querySelectorAll('#ui19McSkills .is-rec .ui28-sug, #ui19McSkills .is-intro .ui28-sug').length; document.getElementById('pk1McClose').click(); } return {c, s};"""))
    ok(r['c'] > 0 and r['s'] > 0, f'{w}: Counter and Suggested pills show on tiles of the one list {r}')

    # the rewards / thematic section title
    await pg.evaluate(E("pk1OpenMapCards('m1'); await new Promise(r=> setTimeout(r, 1000)); return 1;"))
    ttl = await pg.evaluate("(()=>{ const h = document.querySelector('#ui22McClaude h3'); return h ? h.textContent : ''; })()")
    ok(ttl.startswith('Thematic Recommendation'), f'{w}: the section is "Thematic Recommendation" ({ttl!r})')
    ok(await pg.evaluate("document.querySelectorAll('#ui22McClaude .card-chip').length > 0 && document.querySelectorAll('#ui22McRewards .card-chip').length > 0"), f'{w}: Skirmish rewards and Thematic Recommendation are chips (circle + label)')
    el = await pg.query_selector('#ui22McClaude'); await el.scroll_into_view_if_needed(); await pg.wait_for_timeout(300); await el.screenshot(path=os.path.join(OUT, f'thematic-{w}.png'))
    await pg.evaluate("document.getElementById('pk1McClose').click()")

    # ---- #4 the skirmish panel (a normal fight: the admin list is hidden on a PRO fight's panel)
    r = await pg.evaluate(E("""conquestWorldView = false; conquestSelectedMap = 'm1'; conquestSelectedNodeKey = '0-2'; playSubTab = 'conquest'; switchTab('play'); renderPlay(); await new Promise(r=> setTimeout(r, 1500)); const a = document.getElementById('cnpMapCards'), b = document.getElementById('cnpPacks');
      return {order: a && b ? !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) : false, same: a && b && a.parentNode === b.parentNode, adjacent: !!a && a.nextElementSibling === b, shown: !!b && b.getClientRects().length > 0, label: b ? b.textContent : ''};"""))
    ok(r['order'] and r['same'] and r['adjacent'] and r['shown'], f'{w}: 📦 Packs is visible right after 🃏 Map cards in the same admin list {r}')
    adm = await pg.query_selector('.cnp-admin-side')
    if adm:
        await adm.scroll_into_view_if_needed(); await pg.wait_for_timeout(200); await adm.screenshot(path=os.path.join(OUT, f'admin-buttons-{w}.png'))
    r = await pg.evaluate(E("document.getElementById('cnpPacks').click(); await new Promise(r=> setTimeout(r, 800)); const ov = document.getElementById('ui29PackEditor'); return {open: !!ov && !ov.hidden, title: (document.getElementById('ui29ListTitle') || {}).textContent || ''};"))
    ok(r['open'], f'{w}: 📦 Packs opens the pack editor ({r["title"]!r})')
    await pg.evaluate("document.getElementById('ui29Close').click()")
    # ---- #8 the SK / WK details
    r = await pg.evaluate(E("""pl2ProPreview('0-SK'); await new Promise(r=> setTimeout(r, 1500)); const ref = document.querySelector('.bal24-refline'); return {ref: ref ? ref.textContent : '', pct: ref ? ref.dataset.refPct : ''};"""))
    ok('Map reference wins' in r['ref'] and 'too weak above 85%' in r['ref'] and r['pct'], f'{w}: 0-SK lists the Map reference win % and its cut: {r["ref"]!r}')
    await pg.screenshot(path=os.path.join(OUT, f'sk-details-{w}.png'))
    r = await pg.evaluate(E("""pl2ProPreview('0-WK'); await new Promise(r=> setTimeout(r, 1200)); const ref = document.querySelector('.bal24-refline'); return {ref: ref ? ref.textContent : ''};"""))
    ok('weak decks' in r['ref'] and 'too strong below 50%' in r['ref'], f'{w}: 0-WK lists it too: {r["ref"]!r}')
    await pg.screenshot(path=os.path.join(OUT, f'wk-details-{w}.png'))

    # ---- #3 the deck editor's two views
    await pg.evaluate(E("""try{ getDraftableIds().slice(0, 24).forEach(id=>{ try{ grantCardCopy(id); }catch(e){} }); }catch(e){} switchTab('deck'); await new Promise(r=> setTimeout(r, 600)); deckShowList = false; deckEditingId = myDecks[0].id; renderDeckSection(); await new Promise(r=> setTimeout(r, 900)); return 1;"""))
    await pg.screenshot(path=os.path.join(OUT, f'deck-full-{w}.png'))
    ok(await pg.evaluate("document.querySelectorAll('[data-ui35-view]').length === 2 && deckCardView === 'full'"), f'{w}: the deck editor starts in Full art with the two-button switch')
    await pg.click('[data-ui35-view="compact"]'); await pg.wait_for_timeout(500)
    r = await pg.evaluate("""(()=>{ const L = [...document.querySelectorAll('#myDeckList .ui35-dchip')], P = [...document.querySelectorAll('#myDeckPool .ui35-pool-tile')];
      return {list: L.length, pool: P.length, circles: document.querySelectorAll('#myDeckList .cc-disc, #myDeckPool .cc-disc').length, n: L.slice(0, 3).map(x=> x.querySelector('.ui35-n').textContent), stored: localStorage.getItem('bramblewood_deck_cardview_v1'),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth, poolW: Math.max(0, ...P.map(x=> x.getBoundingClientRect().right)) , vw: innerWidth, cards: document.querySelectorAll('#myDeckList .card-tile, #myDeckPool .card-tile').length}; })()""")
    print('  ', w, json.dumps(r))
    ok(r['list'] > 0 and r['pool'] > 0 and r['cards'] == 0 and r['circles'] >= r['list'] + r['pool'], f'{w}: Compact shows chips (circle + name) in the deck and the pool, no full cards ({r["list"]} / {r["pool"]})')
    ok(all(x.startswith('×') for x in r['n']) and r['stored'] == 'compact', f'{w}: each carries x N and the choice is stored ({r["n"]}, {r["stored"]})')
    ok(r['overflow'] <= 1 and r['poolW'] <= r['vw'] + 1, f'{w}: no sideways scroll (overflow {r["overflow"]}, pool right edge {r["poolW"]:.0f} of {r["vw"]})')
    await pg.screenshot(path=os.path.join(OUT, f'deck-compact-{w}.png'))
    # add and remove still work (pool click adds, - corner removes, Shift+click on the pool chip removes)
    r = await pg.evaluate(E("""const id = [...document.querySelectorAll('#myDeckPool .ui35-pool-tile:not(.is-spent)')].map(x=> x.dataset.defid).find(i=> (myDeckCounts[i] | 0) === 0) || document.querySelector('#myDeckPool .ui35-pool-tile:not(.is-spent)').dataset.defid;
      const c0 = myDeckCounts[id] | 0, tot0 = deckTotal(myDeckCounts), sel = `#myDeckPool .ui35-pool-tile[data-defid="${id}"]`;
      document.querySelector(sel).click(); await new Promise(r=> setTimeout(r, 400)); const c1 = myDeckCounts[id] | 0, inList = !!document.querySelector(`#myDeckList .ui35-dchip[data-defid="${id}"]`), n1 = (document.querySelector(`#myDeckList .ui35-dchip[data-defid="${id}"] .ui35-n`) || {}).textContent;
      document.querySelector(`#myDeckList .ui35-dchip[data-defid="${id}"] .dchip-minus`).click(); await new Promise(r=> setTimeout(r, 400)); const c2 = myDeckCounts[id] | 0;
      document.querySelector(sel).click(); await new Promise(r=> setTimeout(r, 400)); const c3 = myDeckCounts[id] | 0;
      document.querySelector(sel).dispatchEvent(new MouseEvent('click', {bubbles: true, shiftKey: true})); await new Promise(r=> setTimeout(r, 400)); const c4 = myDeckCounts[id] | 0;
      document.querySelector(`#myDeckList .ui35-dchip[data-defid="${id}"]`); return {id, c0, c1, c2, c3, c4, inList, n1, tot: [tot0, deckTotal(myDeckCounts)], badge: (document.getElementById('myDeckSizeBadge') || {}).textContent};"""))
    print('  ', w, json.dumps(r))
    ok(r['c1'] == r['c0'] + 1 and r['inList'] and r['n1'] == '×' + str(r['c1']), f'{w}: a click on a pool chip adds one and the deck chip says x {r["c1"]}')
    ok(r['c2'] == r['c0'] and r['c3'] == r['c0'] + 1 and r['c4'] == r['c0'], f'{w}: the - corner and Shift+click take one out ({r["c0"]}, {r["c1"]}, {r["c2"]}, {r["c3"]}, {r["c4"]})')
    # remembered per viewer: reload keeps Compact
    await pg.reload(); await pg.wait_for_timeout(1500); await pg.evaluate(UNLOCK)
    r = await pg.evaluate(E("switchTab('deck'); await new Promise(r=> setTimeout(r, 500)); deckShowList = false; deckEditingId = myDecks[0].id; renderDeckSection(); await new Promise(r=> setTimeout(r, 800)); return {v: deckCardView, pressed: (document.querySelector('[data-ui35-view=compact]') || {}).ariaPressed, chips: document.querySelectorAll('#myDeckList .ui35-dchip').length};"))
    ok(r['v'] == 'compact' and r['pressed'] == 'true' and r['chips'] > 0, f'{w}: Compact is remembered after a reload {r}')
    await pg.click('[data-ui35-view="full"]'); await pg.wait_for_timeout(400)
    ok(await pg.evaluate("document.querySelectorAll('#myDeckPool .card-tile').length > 0 && document.querySelectorAll('.ui35-pool-tile').length === 0 && localStorage.getItem('bramblewood_deck_cardview_v1') === 'full'"), f'{w}: back to Full art restores the cards')
    ok(not errs, f'{w}: no page errors ' + '; '.join(errs)[:300])
    await b.close()

async def main():
    h = serve(); url = f'http://127.0.0.1:{h.server_address[1]}/index.html'
    async with async_playwright() as p:
        for w, hgt in ((1366, 860), (390, 844)):
            print(f'-- {w}'); await run(p, url, w, hgt)
    print('FAILS' if fails else 'all ok', len(fails)); raise SystemExit(1 if fails else 0)
asyncio.run(main())
