#!/usr/bin/env python3
"""Package PREF (2026-10-25, owner #32 / 17:53 / 22:36): browser checks and screenshots at 390 and 1366 of the reference-deck switch and the
X-REF fights: the switch in Admin Mode (off by default), a map's X-REF node and Admin row, the X-REF panel (opponent and set), an X-REF fight
(your deck = the reference set, the REF tag, free), a road fight with the switch on (Reference-2, free, REF tag, nothing paid) and off again.

    python3 tests/e2e/pref_2026_10_25.py            # checks + shots in tests/out/shots/pref-*.png
    python3 tests/e2e/pref_2026_10_25.py --widths 390

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
        "window.addEventListener('load', ()=>{ try{ FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); claimTutorialWin('otters'); window.adminAllowed = ()=> true; setAdminMode(true);"
        " saveEnergyState({current:40, lastRegenAt:Date.now()}); try{ skipTriggerLesson(); }catch(e){} try{ localStorage.setItem('bramblewood_res3_level_track_v1', JSON.stringify({granted: 999})); }catch(e){} window.showCoachTip = ()=>{}; window.maybeShowCoachTip = ()=>{}; }catch(e){ window.__setupErr = String(e); } });")  # 2026-10-26 (release): RES3's level-reward packs would open over these flows; the test player has had them
DATA = json.load(open(os.path.join(ROOT, 'canonical', 'pro-skirmishes.json'), encoding='utf-8'))
REF2 = json.load(open(os.path.join(ROOT, 'docs', 'balance', 'ref', 'ref2-owner-main-deck-2026-10-25.json'), encoding='utf-8'))
fails = []; shots = []
def ok(cond, msg):
    print(('  ok  ' if cond else '  FAIL ') + msg)
    if not cond: fails.append(msg)

def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    httpd = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT))
    threading.Thread(target=httpd.serve_forever, daemon=True).start(); return httpd

async def fresh(b, url, w):
    pg = await b.new_page(viewport={'width': w, 'height': 844 if w < 700 else 860}, has_touch=(w < 700))
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg._errs = errs
    await pg.add_init_script(SKIP)
    await pg.goto(url); await pg.wait_for_timeout(3200)
    await pg.evaluate("(()=>{ const h = document.getElementById('toastHost'); if(h) h.innerHTML = ''; try{ skipTriggerLesson(); }catch(e){} try{ localStorage.setItem('bramblewood_res3_level_track_v1', JSON.stringify({granted: 999})); }catch(e){} })()")
    return pg

async def shot(pg, name, w):
    f = os.path.join(OUT, f'pref-{name}-{w}.png'); await pg.screenshot(path=f, animations='allow'); shots.append(f); return f

# the deck in play: every card id (a levelled copy "<id>@p<L>" counts as its card)
DECK_IDS = "(()=>{ const P = matchState.players[1], all = [].concat(P.deck || [], P.hand || [], P.board ? P.board.filter(Boolean) : []); return [...new Set(all.map(c=> String((c && (c.defId || c.id)) || c).split('@')[0]))].sort(); })()"

async def run(b, url, w):
    print(f'-- width {w}')
    pg = await fresh(b, url, w)
    # the switch in Admin Mode, off by default
    r = await pg.evaluate("""(async()=>{ switchTab('admin'); renderAdmin(); await new Promise(r=> setTimeout(r, 500)); const t = document.querySelector('.pref-toggle');
      if(t) t.scrollIntoView({block:'center'}); await new Promise(r=> setTimeout(r, 300));
      return {shown: document.querySelectorAll('.pref-toggle').length, on: !!(document.querySelector('[data-pref-on]') || {}).checked, sets: [...((document.querySelector('[data-pref-set]') || {}).options || [])].map(o=> o.value),
        label: ((t || {}).textContent || '').trim(), docW: document.documentElement.scrollWidth, vw: innerWidth,
        xrows: [...document.querySelectorAll('#adminProFights .pro-row')].map(x=> x.dataset.proKey).filter(k=> /-REF$/.test(k))}; })()""")
    ok(r['shown'] >= 1 and not r['on'] and [x for x in r['sets'] if not x.startswith('prog')] == ['map', 'ref2'], f"the switch is in Admin, off, offering Map reference and Reference-2 {r['sets']}")  # 2026-10-31 REF5: the progression reference's choices come first
    ok("Play with the map's reference deck" in r['label'], 'its label reads as the owner asked')
    ok('3-REF' in r['xrows'] and '2-B-REF' in r['xrows'] and len(r['xrows']) == len(DATA['maps']), f"Admin's PRO list has one X-REF row a map ({len(r['xrows'])}: {r['xrows'][:4]}...)")
    ok(r['docW'] <= r['vw'] + 1, f"the Admin page fits ({r['docW']}/{r['vw']})")
    await shot(pg, 'admin-switch', w)
    # the X-REF node on Map 3 (Maps 0-5 cleared first, as tests/e2e/rw6_2026_10_24.py does, so Map 3 is open)
    await pg.evaluate("""(()=>{ saveTutorial2Done(); saveTutorialDone(); const p = loadConquestProgress();
      mainConquestMaps().slice(0, 6).forEach(m=> m.nodes.forEach(nd=>{ const id = conquestNodeId(m.id, nd.key); if(!p.completed.includes(id)) p.completed.push(id); })); saveConquestProgress(p); })()""")
    await pg.evaluate("(()=>{ conquestWorldView = false; conquestSelectedMap = 'mc'; conquestSelectedNodeKey = null; playSubTab = 'conquest'; switchTab('play'); })()")
    await pg.wait_for_selector('#conquestCanvas .map-node', timeout=15000); await pg.wait_for_timeout(800)
    r = await pg.evaluate("[...document.querySelectorAll('#conquestCanvas .map-pro')].map(n=> n.dataset.proStart)")
    ok(r[-1:] == ['3-REF'], f'the map shows the X-REF node after the PRO nodes {r}')
    await pg.evaluate("(()=>{ const n = document.querySelector('#conquestCanvas [data-pro-start=\"3-REF\"]'); if(n) n.scrollIntoView({block:'center', inline:'center'}); })()")
    await pg.wait_for_timeout(400)
    await pg.click('#conquestCanvas [data-pro-start="3-REF"]'); await pg.wait_for_timeout(900)
    r = await pg.evaluate("""({sel: conquestSelectedNodeKey, chips: [...document.querySelectorAll('#conquestNodePanel [data-xref-vs]')].map(b=> b.dataset.xrefVs), on: (document.querySelector('#conquestNodePanel [data-xref-vs][aria-pressed="true"]') || {dataset:{}}).dataset.xrefVs,
      fight: !!document.querySelector('#conquestNodePanel:not([hidden]) #cnpFightBtn'), cost: (document.getElementById('cnpFightBtn') || {dataset:{}}).dataset.energyCost})""")
    pros = [e['id'] for e in DATA['maps']['mc']['pro'] + DATA['maps']['mc'].get('bpro', [])]
    ok(r['sel'] == '3-REF' and r['chips'] == pros and r['on'] == pros[0] and r['fight'] and r['cost'] == '0', f"the X-REF panel: every PRO / BPRO to face, PRO-1 picked, free {r}")
    await pg.click('#conquestNodePanel [data-xref-vs="3-BPRO-1"]'); await pg.wait_for_timeout(500)
    await pg.select_option('#conquestNodePanel [data-pref-set]', 'ref2'); await pg.wait_for_timeout(500)
    r = await pg.evaluate("({vs: findProFight('3-REF').node.xrefVs, deck: JSON.stringify(findProFight('3-REF').node.deck) === JSON.stringify(findProFight('3-BPRO-1').node.deck), set: refPlayPrefs().set, on: refPlayPrefs().on})")
    ok(r['vs'] == '3-BPRO-1' and r['deck'] and r['set'] == 'ref2' and not r['on'], f'picking 3-BPRO-1 and Reference-2 (the switch stays off) {r}')
    await shot(pg, 'xref-panel', w)
    await pg.click('#cnpFightBtn'); await pg.wait_for_timeout(3600)
    r = await pg.evaluate("({ref: matchState && matchState.refDeck, pro: matchState && matchState.proFight, admin: !!(matchState && matchState.adminTest), energy: currentEnergy(), tag: ((document.querySelector('.hud-ref-tag') || {}).textContent || '').trim(), leader: matchState && matchState.leaderDefId})")
    ids = await pg.evaluate(DECK_IDS)
    ok(r['ref'] and r['ref']['set'] == 'ref2' and r['pro'] == '3-REF' and r['admin'] and r['energy'] == 40, f'Fight starts 3-REF with Reference-2, free and unpaid {r}')
    ok(ids == sorted(REF2['counts']), f'your deck is the Ant Deck {ids}')
    ok(r['tag'] == 'REF' and r['leader'] == REF2['leader'], f"the top bar shows REF; the set's leader rides along {r['tag']} {r['leader']}")
    enemy = await pg.evaluate("(()=>{ const P = matchState.players[2], all = [].concat(P.deck || [], P.hand || []); return [...new Set(all.map(c=> String((c && (c.defId || c.id)) || c).split('@')[0]))].sort(); })()")
    bp = [e for e in DATA['maps']['mc']['bpro'] if e['id'] == '3-BPRO-1'][0]
    ok(set(enemy) <= set(bp['deck']) and len(enemy) >= 2, f'the enemy plays 3-BPRO-1 {enemy}')
    await shot(pg, 'xref-fight', w)
    await pg.evaluate("(()=>{ endMatch(); })()"); await pg.wait_for_timeout(500)
    # a road fight with the switch on (Reference-2)
    await pg.evaluate("(()=>{ saveRefPlayPrefs({on: true, set: 'ref2'}); switchTab('play'); startConquestMatch('mc', '3-1'); })()"); await pg.wait_for_timeout(3600)
    r = await pg.evaluate("({ref: matchState && matchState.refDeck, admin: !!(matchState && matchState.adminTest), energy: currentEnergy(), tag: ((document.querySelector('.hud-ref-tag') || {}).textContent || '').trim(), node: matchState && matchState.conquestNode.nodeId})")
    ids = await pg.evaluate(DECK_IDS)
    ok(r['ref'] and r['ref']['set'] == 'ref2' and r['node'] == '3-1' and r['admin'] and r['energy'] == 40 and r['tag'] == 'REF' and ids == sorted(REF2['counts']), f'switch on: road fight 3-1 deals Reference-2, free, unpaid, REF tag {r}')
    await shot(pg, 'road-ref', w)
    # a won reference fight pays nothing
    before = await pg.evaluate("JSON.stringify({p: loadConquestProgress(), cur: myCurrencies})")
    await pg.evaluate("(()=>{ window.__m = matchState; matchState.players[2].hq.shield = 0; matchState.players[2].hq.hp = 0; resolveRound(); })()")
    for _ in range(60):
        if await pg.evaluate("!!(window.__m.over && document.getElementById('wlPrimaryBtn'))"): break
        await pg.wait_for_timeout(250)
    await pg.wait_for_timeout(1200)
    after = await pg.evaluate("JSON.stringify({p: loadConquestProgress(), cur: myCurrencies})")
    note = await pg.evaluate("((document.querySelector('.wl-pro-note') || {}).textContent || '').trim()")
    ok(before == after and 'no rewards' in note, f'the win pays nothing and says so ({note})')
    await pg.evaluate("(()=>{ endMatch(); saveRefPlayPrefs({on: false, set: 'ref2'}); switchTab('play'); startConquestMatch('mc', '3-1'); })()"); await pg.wait_for_timeout(3600)
    r = await pg.evaluate("({ref: !!(matchState && matchState.refDeck), tag: !!document.querySelector('.hud-ref-tag'), admin: !!(matchState && matchState.adminTest)})")
    ok(not r['ref'] and not r['tag'] and not r['admin'], f'switch off: 3-1 is your own deck again, no tag {r}')
    ok(not pg._errs, f'no page errors {pg._errs[:3]}')
    await pg.close()

async def main(a):
    httpd = serve(); url = f'http://127.0.0.1:{httpd.server_address[1]}/index.html'
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME if os.path.exists(CHROME) else None, args=['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'])
        for w in [int(x) for x in a.widths.split(',')]: await run(b, url, w)
        await b.close()
    httpd.shutdown()
    print('\n'.join(shots))
    print(f'pref e2e: {len(fails)} FAILED' if fails else 'pref e2e: all passed')
    sys.exit(1 if fails else 0)

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--widths', default='390,1366'); asyncio.run(main(ap.parse_args()))
