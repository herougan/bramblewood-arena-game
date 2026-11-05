#!/usr/bin/env python3
"""ENG25 (2026-11-05) browser check, at 390 and 1366: a Timbered unit's 🪵 chip on the card face is dim with 2 Lumber and lit gold with 3+
(the engine's en5On), and the separate gold state badge is gone; a Tide 2 unit's 🌊 chip shows its 2; the Immortal / Hydra chips show.
    python3 tests/e2e/eng25_2026_11_05.py      (build first; writes docs/screens/eng25/*.png; needs Playwright)"""
import asyncio, os, sys, json, functools, threading, http.server, socketserver
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
OUT = os.path.join(ROOT, 'docs', 'screens', 'eng25'); os.makedirs(OUT, exist_ok=True)
SKIP = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1');"
        "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying']));")
fails = []
def ok(c, m):
    print(('  ok ' if c else '  ✗ ') + m)
    if not c: fails.append(m)

def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
        def handle(self):
            try: super().handle()
            except (BrokenPipeError, ConnectionResetError): pass
    h = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); threading.Thread(target=h.serve_forever, daemon=True).start(); return h

SETUP = """(()=>{ FEATURE_SPOTS.forEach(sp=>{ try{ unlockFeature(sp.key); }catch(e){} }); adminModeEnabled = true; myCurrencies.energy = 60; window.showCoachTip = function(){}; window.deckSizeOkOrWarn = ()=> true; const m = CONQUEST_MAPS[0]; const n = m.nodes.find(n=> n.kind === 'skirmish');
  conquestSelectedMap = m.id; playSubTab = 'conquest'; switchTab('play'); startConquestMatch(m.id, n.key, {skipEnergyCost:true, noOpener:true}); return 1; })()"""
# a test unit of yours with the given effects, alone on your side so its strip is not cycling
SPAWN = """((id)=>{ const m = matchState, E = m.engine;
  E.allBoardCards(m.players[1]).forEach(c=>{ c.hp = 0; }); E.removeDeadCards(m.players, m.sideOf, {}, m.stats, []);
  const okp = E.debugSpawnCard(m.players, m.sideOf, 1, id, 'center', m.stats, []); const c = E.allBoardCards(m.players[1]).find(x=> x.defId === id || (x._condBase === id));
  renderBoard(); return {okp, uid: c && c.uid, id}; })"""
# the chips of a skill set as the card face draws them (Tide 2, Immortal, Hydra): abilityBadges in a test frame on the page
FACE = """(()=>{ const host = document.createElement('div'); host.id = 'e25face'; host.style.cssText = 'position:fixed;left:10px;top:10px;z-index:99999;background:#223;padding:14px;border-radius:10px;font-size:22px';
  host.innerHTML = abilityBadges({effects:{tide:2, immortal:true}}, {}) + abilityBadges({effects:{hydra:true, timbered:true}}, {live:{en5On:'timbered'}}); document.body.appendChild(host);
  return {tide: (host.querySelector('.ab-tide') || {}).textContent || null, imm: !!host.querySelector('[data-sk="immortal"]'), hyd: !!host.querySelector('[data-sk="hydra"]'), lit: !!host.querySelector('[data-sk="timbered"].zeit-live')}; })()"""
LUMBER = """((n)=>{ const m = matchState; m.players[1].lumber = n; const ev = []; m.engine.syncPhaseStats(m.players, m.sideOf, ev);
  ev.forEach(x=>{ if(x.type === 'statusFx' && x.kind === 'stateSkill') en5StateVfx(x); }); /* the stateSkill event updates the board's copy, as in a fight */ renderBoard(); const c = m.engine.allBoardCards(m.players[1])[0]; return c ? (c._en5On || '') : null; })"""

async def snap(pg, uid, path):
    el = await pg.query_selector(f'.board-card[data-uid="{uid}"]')
    if not el: return False
    bb = await el.bounding_box()
    if not bb: return False
    m = 30; await pg.screenshot(path=path, clip={'x': max(0, bb['x'] - m), 'y': max(0, bb['y'] - m), 'width': bb['width'] + 2 * m, 'height': bb['height'] + 2 * m}, animations='disabled'); return True

async def run(b, url, w):
    pg = await b.new_page(viewport={'width': w, 'height': 844 if w < 700 else 860})
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.add_init_script(SKIP); await pg.goto(url); await pg.wait_for_timeout(1300)
    await pg.evaluate(SETUP); await pg.wait_for_timeout(3500)
    r = await pg.evaluate(SPAWN + "('lodge-engineer')"); await pg.wait_for_timeout(400)
    uid = r['uid']; ok(uid is not None, f'{w}: a Timbered unit on the board ({r})')
    chip = f"(()=>{{ const e = document.querySelector('.board-card[data-uid=\"{uid}\"] .ab-sk[data-sk=\"timbered\"]'); return e ? {{lit: e.classList.contains('zeit-live'), bg: getComputedStyle(e).backgroundColor}} : null; }})()"
    on0 = await pg.evaluate(LUMBER + "(2)"); await pg.wait_for_timeout(300); c0 = await pg.evaluate(chip)
    await snap(pg, uid, os.path.join(OUT, f'timbered-off-{w}.png'))
    on1 = await pg.evaluate(LUMBER + "(4)"); await pg.wait_for_timeout(300); c1 = await pg.evaluate(chip)
    await snap(pg, uid, os.path.join(OUT, f'timbered-on-{w}.png'))
    badge = await pg.evaluate(f"(()=> !!document.querySelector('.board-card[data-uid=\"{uid}\"] .abadge.en5-state'))()")
    ok(c0 is not None and not c0['lit'], f'{w}: 2 Lumber: the 🪵 chip is there and dim (en5On "{on0}", {c0})')
    ok(c1 is not None and c1['lit'] and 'timbered' in (on1 or ''), f'{w}: 4 Lumber: the 🪵 chip lights gold (en5On "{on1}", {c1})')
    ok(not badge, f'{w}: no second gold state badge')
    f = await pg.evaluate(FACE); await pg.wait_for_timeout(300)
    fe = await pg.query_selector('#e25face')
    if fe: await fe.screenshot(path=os.path.join(OUT, f'chips-{w}.png'))
    ok(f['tide'] is not None and '2' in f['tide'] and f['imm'] and f['hyd'] and f['lit'], f'{w}: the card face: 🌊2, the Immortal and Hydra chips, a lit Timbered chip ({f})')
    ok(not errs, f'{w}: no page errors ({" | ".join(errs[:2])})')
    await pg.close()

async def main():
    h = serve(); url = f'http://127.0.0.1:{h.server_address[1]}/index.html'
    async with async_playwright() as p:
        exe = CHROME if os.path.exists(CHROME) else None
        b = await p.chromium.launch(executable_path=exe)
        for w in (390, 1366): await run(b, url, w)
        await b.close()
    h.shutdown()
    print('eng25 e2e: %s' % ('ok' if not fails else '%d failed' % len(fails)))
    sys.exit(1 if fails else 0)
asyncio.run(main())
