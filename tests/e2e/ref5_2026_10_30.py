#!/usr/bin/env python3
"""Package REF5 (2026-10-30/31): browser checks of the progression reference in the X-REF panel ("You play"): Reference (Random) is the
default, the list is Reference (Random), Reference 1-5 of 5, Map reference, Reference-2; pressing Fight deals one of the map's five at random
(the toast and the REF tag name it; the deck in play is that deck), and several Fights deal different decks; Reference 2 of 5 deals deck 2.

    python3 tests/e2e/ref5_2026_10_30.py [--widths 390,1366]

Build first. Exits 1 on a failed check.
"""
import argparse, asyncio, http.server, socketserver, threading, functools, json, os, sys
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'tests', 'out', 'shots'); os.makedirs(OUT, exist_ok=True)
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
SKIP = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); sessionStorage.setItem('bramblewood_seen_splash','1');"
        "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying']));"
        "localStorage.setItem('bramblewood_conquest_progress_v1', JSON.stringify({completed:['mtut:tutorial','mtut:tutorial2'], raidUnlocked:[], ranks:{}}));"
        "localStorage.setItem('bramblewood_admin_mode_v1','1');"
        "localStorage.setItem('bramblewood_ref_play_v1', JSON.stringify({on:false, set:'map'}));"  # a choice saved before REF5: it moves to Reference (Random) once
        "window.addEventListener('load', ()=>{ try{ FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); claimTutorialWin('otters'); window.adminAllowed = ()=> true; setAdminMode(true);"
        " saveEnergyState({current:40, lastRegenAt:Date.now()}); try{ skipTriggerLesson(); }catch(e){} try{ localStorage.setItem('bramblewood_res3_level_track_v1', JSON.stringify({granted: 999})); }catch(e){} window.showCoachTip = ()=>{}; }catch(e){ console.error(e); } });")
SET = json.load(open(os.path.join(ROOT, 'docs', 'balance', 'ref', 'ref5-prog.json'), encoding='utf-8'))
fails = []
def ok(cond, msg):
    print(('  ok  ' if cond else '  FAIL ') + msg)
    if not cond: fails.append(msg)

def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    httpd = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT))
    threading.Thread(target=httpd.serve_forever, daemon=True).start(); return httpd

DECK_IDS = "(()=>{ const P = matchState.players[1], all = [].concat(P.deck || [], P.hand || [], P.board ? P.board.filter(Boolean) : []); return [...new Set(all.map(c=> String((c && (c.defId || c.id)) || c).split('@')[0]))].sort(); })()"

async def run(b, url, w):
    print(f'-- width {w}')
    pg = await b.new_page(viewport={'width': w, 'height': 844 if w < 700 else 860}, has_touch=(w < 700))
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.add_init_script(SKIP); await pg.goto(url); await pg.wait_for_timeout(3200)
    await pg.evaluate("""(()=>{ saveTutorial2Done(); saveTutorialDone(); const p = loadConquestProgress();
      mainConquestMaps().slice(0, 6).forEach(m=> m.nodes.forEach(nd=>{ const id = conquestNodeId(m.id, nd.key); if(!p.completed.includes(id)) p.completed.push(id); })); saveConquestProgress(p);
      conquestWorldView = false; conquestSelectedMap = 'mc'; conquestSelectedNodeKey = null; playSubTab = 'conquest'; switchTab('play'); })()""")
    await pg.wait_for_selector('#conquestCanvas .map-node', timeout=15000); await pg.wait_for_timeout(600)
    await pg.evaluate("pl2ProPreview('3-REF')"); await pg.wait_for_timeout(900)
    r = await pg.evaluate("""(()=>{ const s = document.querySelector('#conquestNodePanel [data-pref-set]'); return s ? {value: s.value, opts: [...s.options].map(o=> [o.value, o.textContent.trim()])} : null; })()""")
    ok(r is not None, 'the X-REF panel has the "You play" picker')
    if r:
        ok(r['value'] == 'prog', f"Reference (Random) is picked by default (a choice saved before REF5 moved to it) {r['value']}")
        ok([o[0] for o in r['opts']] == ['prog', 'prog-1', 'prog-2', 'prog-3', 'prog-4', 'prog-5', 'map', 'ref2'], f"the list: {[o[1] for o in r['opts']]}")
        ok(r['opts'][0][1] == 'Reference (Random)' and r['opts'][3][1] == 'Reference 3 of 5' and r['opts'][6][1] == 'Map reference', 'its labels')
    await pg.screenshot(path=os.path.join(OUT, f'ref5-xref-panel-{w}.png'))
    picks, okDeck = [], True
    for i in range(8):
        await pg.evaluate("(()=>{ if(matchState){ matchState.over = true; endMatch(); } const h = document.getElementById('toastHost'); if(h) h.innerHTML = ''; })()")
        await pg.evaluate("startProFight('3-REF')"); await pg.wait_for_timeout(700)
        r = await pg.evaluate("({ref: matchState && matchState.refDeck, toast: (document.getElementById('toastHost') || {}).textContent || '', tag: !!document.querySelector('.hud-ref-tag'), tagTip: (document.querySelector('.hud-ref-tag') || {title: ''}).title, ids: " + DECK_IDS + "})")
        ref = r['ref'] or {}
        pick = ref.get('pick'); picks.append(pick)
        if i == 0:
            ok(pick in (1, 2, 3, 4, 5) and ref.get('label') == f'Reference {pick} of 5', f"Fight deals one of Map 3's five: {ref.get('label')}")
            ok(f'Reference {pick} of 5' in r['toast'] and r['tag'] and f'Reference {pick} of 5' in r['tagTip'], 'the toast and the REF tag say which')
            if i == 0: await pg.screenshot(path=os.path.join(OUT, f'ref5-fight-{w}.png'))
        want = sorted(SET['decks']['3'][pick - 1]['counts'].keys()) if pick else []
        if r['ids'] != want: okDeck = False; print('    deck', pick, r['ids'], want)
        if len(set(picks)) >= 2 and i >= 1: break
    ok(len(set(picks)) >= 2, f'two Fights can deal different decks: {picks}')
    ok(okDeck, 'the deck in play is the dealt deck every time')
    await pg.evaluate("(()=>{ if(matchState){ matchState.over = true; endMatch(); } const p = refPlayPrefs(); p.set = 'prog-2'; saveRefPlayPrefs(p); })()")
    await pg.evaluate("startProFight('3-REF')"); await pg.wait_for_timeout(700)
    r = await pg.evaluate("({ref: matchState && matchState.refDeck, ids: " + DECK_IDS + "})")
    ok((r['ref'] or {}).get('pick') == 2 and r['ids'] == sorted(SET['decks']['3'][1]['counts'].keys()), f"Reference 2 of 5 deals deck 2 {(r['ref'] or {}).get('label')}")
    ok(not errs, f'no page errors {errs[:2]}')
    await pg.close()

async def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--widths', default='390,1366'); a = ap.parse_args()
    httpd = serve(); url = f'http://127.0.0.1:{httpd.server_address[1]}/index.html'
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME if os.path.exists(CHROME) else None)
        for w in [int(x) for x in a.widths.split(',')]: await run(b, url, w)
        await b.close()
    httpd.shutdown()
    print('FAILED: %d' % len(fails) if fails else 'ALL OK'); sys.exit(1 if fails else 0)
asyncio.run(main())
