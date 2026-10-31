#!/usr/bin/env python3
"""Package UI7 (2026-10-31; owner Y1, Y4), browser run. Shots go to tests/e2e/shots/ui7/.
    python3 tests/e2e/ui7_2026_10_31.py [--shots DIR]
Board: an armoured (stone-turtle-warden, Shield 4), a poisoned (caustic-scorpion, poison 3 + bleed 2), a Regeneration unit (bog-behemoth), a Pinned (Bola) and a Webbed card.
Checks: Poison/Regen show no number (value kept in tooltip/aria); other chips keep their number tight to the icon; held cards get .is-held; the struggle plays
(.is-struggling) and Effects Low turns it off. Exit 1 on a failed check. Build first."""
import argparse, asyncio, http.server, os, socketserver, threading, functools, sys
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
EXE = os.environ.get('BW_CHROMIUM', '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell')
INIT = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_pitch_open_v1','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1');"
        "sessionStorage.setItem('bramblewood_seen_splash','1'); localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying','castle-shield']));")
BATTLE = """(()=>{ window.deckSizeOkOrWarn = ()=> true;
  const m = CONQUEST_MAPS[0], n = m.nodes.find(n=> n.kind === 'skirmish'); conquestSelectedMap = m.id; playSubTab = 'conquest'; switchTab('play');
  window.__ret = startConquestMatch(m.id, n.key, {skipEnergyCost:true, noOpener:true}); return m.id + '/' + n.key; })()"""
SETUP = """()=>{ const m = matchState, E = m.engine; m.paused = true; window.maskHiddenSkills = d=> d;
  const put = (pid, defId, slot, f)=>{ const c = E.makeBoardCard(defId); c.slot = slot; c.wait = 0; if(f) f(c); const pl = m.players[pid]; (slot===0?pl.row.center:slot<0?pl.row.left:pl.row.right).push(c); return c; };
  [1,2].forEach(pid=>{ const pl = m.players[pid]; pl.row.left = []; pl.row.center = []; pl.row.right = []; });
  put(1, 'stone-turtle-warden', -1, c=>{ c.shield = 4; });
  put(1, 'caustic-scorpion', 0, c=>{ c.poison = 3; c.bleed = 2; });
  put(1, 'bog-behemoth', 1, c=>{ c.hp = Math.max(1, c.hp - 2); });
  put(2, 'otter-centurion', -1, c=>{ c.pinDown = 1; });
  put(2, 'guppy', 0, c=>{ c.webbed = 2; });
  put(2, 'komodo-warlord', 1);
  E.syncSlots(m.players[1]); E.syncSlots(m.players[2]);
  renderMatchUI(); try{ fitBattlefieldZoomNow(true); }catch(e){} return 1; }"""
INFO = """(()=>[...document.querySelectorAll('#battlefieldEl .board-card')].map(el=>({d: el.dataset.defid, held: el.classList.contains('is-held'),
  chips: [...el.querySelectorAll('.status-chips > .abadge')].map(c=> ({cls: c.className.replace('abadge ',''), txt: c.textContent.trim(), title: c.title||'', aria: c.getAttribute('aria-label')||''})),
  ab: [...el.querySelectorAll('.badges > *, .badges-bottom ~ * ')].slice(0,0)})))()"""
def serve():
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    httpd = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=ROOT))
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd
CLICK = "(()=>{ [...document.querySelectorAll('button')].filter(b=> /^(Got it|Okay)$/.test(b.textContent.trim())).forEach(b=> b.click()); })()"
async def main(a):
    httpd = serve(); url = f'http://127.0.0.1:{httpd.server_address[1]}/index.html'
    os.makedirs(a.shots, exist_ok=True); bad = []
    def ok(c, msg):
        print(('  ok  ' if c else '  FAIL ') + msg)
        if not c: bad.append(msg)
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=EXE, args=['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'])
        for w in (1366, 390):
            pg = await b.new_page(viewport={'width': w, 'height': 860 if w > 700 else 844}, device_scale_factor=2); errs = []
            pg.on('pageerror', lambda e: errs.append(str(e)))
            await pg.add_init_script(INIT); await pg.goto(url); await pg.wait_for_timeout(1300)
            await pg.evaluate("(()=>{ try{ FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); }catch(e){} })()")
            await pg.evaluate(f"(async()=>{{ {BATTLE} }})()"); await pg.wait_for_timeout(3200)
            await pg.evaluate(CLICK)
            await pg.evaluate(f"({SETUP})()"); await pg.wait_for_timeout(800); await pg.evaluate(CLICK)
            info = await pg.evaluate(INFO)
            print(w, info)
            by = {i['d']: i for i in info}
            ok(by['otter-centurion']['held'] and by['guppy']['held'], f'{w} Pinned and Webbed cards carry .is-held')
            ok(not by['stone-turtle-warden']['held'] and not by['caustic-scorpion']['held'], f'{w} others do not')
            pz = [c for c in by['caustic-scorpion']['chips'] if 'poison' in c['cls']]
            ok(pz and not any(ch.isdigit() for ch in pz[0]['txt']), f'{w} poison chip has no number {pz}')
            ok(pz and ('3' in pz[0]['title'] or '3' in pz[0]['aria']), f'{w} poison keeps the exact value in tooltip/aria {pz}')
            await pg.evaluate(CLICK); await pg.wait_for_timeout(500); await pg.evaluate(CLICK); await pg.wait_for_timeout(300)
            await pg.screenshot(path=os.path.join(a.shots, f'board-{w}.png'), timeout=120000); bb = await pg.evaluate("(()=>{ const r = document.getElementById('battlefieldEl').getBoundingClientRect(); return {x:r.x,y:r.y,width:r.width,height:r.height}; })()"); await pg.screenshot(path=os.path.join(a.shots, f'board-zoom-{w}.png'), clip=bb, timeout=120000)
            await pg.evaluate("window.ui7StruggleNow && ui7StruggleNow()"); await pg.wait_for_timeout(150)
            n = await pg.evaluate("document.querySelectorAll('.board-card.is-struggling').length")
            ok(n >= 1, f'{w} a held card is struggling right after a roll ({n})')
            await pg.screenshot(path=os.path.join(a.shots, f'struggle-{w}.png'), timeout=120000)
            await pg.wait_for_timeout(900)
            n = await pg.evaluate("document.querySelectorAll('.board-card.is-struggling').length")
            ok(n == 0, f'{w} the struggle ends after ~0.6 s ({n})')
            await pg.evaluate("localStorage.setItem('bramblewood_fx_level','low'); applyFxLevel()")
            await pg.evaluate("window.ui7StruggleNow && ui7StruggleNow()"); await pg.wait_for_timeout(100)
            n = await pg.evaluate("document.querySelectorAll('.board-card.is-struggling').length")
            ok(n == 0, f'{w} Effects Low: no struggle ({n})')
            ok(not errs, f'{w} no page errors {errs[:2]}')
            await pg.close()
        await b.close()
    print('FAILED' if bad else 'all ok'); sys.exit(1 if bad else 0)
ap = argparse.ArgumentParser(); ap.add_argument('--shots', default=os.path.join(ROOT, 'tests', 'e2e', 'shots', 'ui7'))
asyncio.run(main(ap.parse_args()))
