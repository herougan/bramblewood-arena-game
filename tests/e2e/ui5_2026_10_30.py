#!/usr/bin/env python3
"""Package UI5 (2026-10-30; owner 21:35-21:53 W5, W12), browser run. Shots go to docs/screens/ui5/.
    python3 tests/e2e/ui5_2026_10_30.py [--shots DIR]
W5: a fight on a map that can never have Tide shows no Tide / Swimmer chip (hand or board); on a Tide map a hand card's chip is lit while the
    Tide is in and invisible while it is out; going out plays the red fade, coming in the green fade (class on the chip); a board card keeps
    its lit / unlit chip.
W12: a Blind (Purblind) unit: the tile is darkened ~7% (filter brightness .93), no standing eye or 👁 overlay once the blink is done, the chip
    symbol is the spectacles. Exit 1 on a failed check. Build first."""
import argparse, asyncio, http.server, os, socketserver, threading, functools, sys
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
EXE = os.environ.get('BW_CHROMIUM', '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell')
INIT = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_pitch_open_v1','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1');"
        "sessionStorage.setItem('bramblewood_seen_splash','1'); localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying','castle-shield']));")
BATTLE = """(()=>{ window.deckSizeOkOrWarn = ()=> true;
  const m = CONQUEST_MAPS[0], n = m.nodes.find(n=> n.kind === 'skirmish'); conquestSelectedMap = m.id; playSubTab = 'conquest'; switchTab('play');
  window.__ret = startConquestMatch(m.id, n.key, {skipEnergyCost:true, noOpener:true}); return m.id + '/' + n.key; })()"""
# board: a Tide unit, a Swimmer, a Purblind unit (star-nosed-mole) and a plain unit; hand: Tide + Swimmer + plain. tideMap: pretend the map has Tide
SETUP = """(tideMap)=>{ const m = matchState, E = m.engine; m.paused = true; delete m._hasTide; m._hasTide = !!tideMap; window.__tide = null; m._ui5TideSeen = {}; window.maskHiddenSkills = d=> d; /* the skills are revealed */
  if(!E.__gt){ E.__gt = E.getTide; E.getTide = ()=> window.__tide; }
  const put = (pid, defId, slot)=>{ const c = E.makeBoardCard(defId); c.slot = slot; c.wait = 0; const pl = m.players[pid]; (slot===0?pl.row.center:slot<0?pl.row.left:pl.row.right).push(c); return c; };
  [1,2].forEach(pid=>{ const pl = m.players[pid]; pl.row.left = []; pl.row.center = []; pl.row.right = []; });
  put(1, 'tide-pool-crab', -1); put(1, 'guppy', 0); put(1, 'star-nosed-mole', 1); put(2, 'otter-centurion', 0);
  E.syncSlots(m.players[1]); E.syncSlots(m.players[2]);
  m.players[1].hand = ['reef-shark','guppy','otter-centurion','tide-pool-crab'].map((d, i)=> ({uid: 990100 + i, defId: d}));
  renderMatchUI(); try{ fitBattlefieldZoomNow(true); }catch(e){} return 1; }"""
CHIPS = """(()=>{ const q = sel=> [...document.querySelectorAll(sel)].length;
  const hand = [...document.querySelectorAll('#handStrip [data-handuid]')].map(el=> { const ch = [...el.querySelectorAll('.ab-tide, .tide-hand')]; return [el.getAttribute('data-defid'), ch.length, ch.map(c=> c.className.replace(/\\s+/g,'.')).join('|')]; });
  const board = [...document.querySelectorAll('#battlefieldEl .board-card')].map(el=> { const ch = [...el.querySelectorAll('.ab-tide')]; return [el.getAttribute('data-defid'), ch.length, ch.map(c=> c.className.replace(/\\s+/g,'.')).join('|')]; });
  return {hand, board}; })()"""

def serve():
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    httpd = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=ROOT))
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd

async def main(a):
    httpd = serve(); url = f'http://127.0.0.1:{httpd.server_address[1]}/index.html'
    os.makedirs(a.shots, exist_ok=True); bad = []
    def ok(c, msg):
        print(('  ok  ' if c else '  FAIL ') + msg)
        if not c: bad.append(msg)
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=EXE, args=['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'])
        for w in (1366, 390):
            pg = await b.new_page(viewport={'width': w, 'height': 860 if w > 700 else 844}); errs = []
            pg.on('pageerror', lambda e: errs.append(str(e)))
            await pg.add_init_script(INIT); await pg.goto(url); await pg.wait_for_timeout(1300)
            await pg.evaluate("(()=>{ try{ FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); }catch(e){} })()")
            await pg.evaluate(f"(async()=>{{ {BATTLE} }})()"); await pg.wait_for_timeout(3200)
            await pg.evaluate("(()=>{ [...document.querySelectorAll('button')].filter(b=> /^(Got it|Okay)$/.test(b.textContent.trim())).forEach(b=> b.click()); })()")
            async def shot(n):
                await pg.evaluate("(()=>{ [...document.querySelectorAll('button')].filter(b=> /^(Got it|Okay)$/.test(b.textContent.trim())).forEach(b=> b.click()); })()")
                await pg.screenshot(path=os.path.join(a.shots, f'{n}-{w}.png'), timeout=120000)
            # --- a map with no Tide
            await pg.evaluate(f"({SETUP})(false)"); await pg.wait_for_timeout(600)
            await pg.evaluate("(()=>{ [...document.querySelectorAll('button')].filter(b=> /^(Got it|Okay)$/.test(b.textContent.trim())).forEach(b=> b.click()); })()"); await pg.wait_for_timeout(300)
            r = await pg.evaluate(CHIPS)
            ok(all(h[1] == 0 for h in r['hand']) and all(x[1] == 0 for x in r['board']), f'{w} no-Tide map: no Tide / Swimmer chip on any hand or board card {r}')
            await shot('notide')
            # --- a Tide map, Tide out
            await pg.evaluate(f"({SETUP})(true)"); await pg.wait_for_timeout(300)
            await pg.evaluate("window.__tide = null; renderHand();"); await pg.wait_for_timeout(100)
            r = await pg.evaluate(CHIPS)
            hs = {h[0]: h for h in r['hand']}
            ok(hs['reef-shark'][1] >= 1 and 'tide-hand-off' in hs['reef-shark'][2], f'{w} Tide map, Tide out: hand Tide chip present and hidden {hs["reef-shark"]}')
            ok('tide-fade-out' in hs['reef-shark'][2], f'{w} drawn with no Tide: it reds out {hs["reef-shark"]}')
            ok(hs['otter-centurion'][1] == 0, f'{w} a plain hand card has no chip')
            await pg.wait_for_timeout(120); await shot('tide-out-mid')
            await pg.wait_for_timeout(1000); await pg.evaluate("renderHand()")
            r = await pg.evaluate(CHIPS); hs = {h[0]: h for h in r['hand']}
            ok('tide-fade-out' not in hs['reef-shark'][2] and 'tide-hand-off' in hs['reef-shark'][2], f'{w} a later render keeps it hidden with no new flash {hs["reef-shark"]}')
            vis = await pg.evaluate("(()=>{ const c = document.querySelector('#handStrip [data-defid=\"reef-shark\"] .tide-hand'); return getComputedStyle(c).opacity; })()")
            ok(float(vis) == 0, f'{w} hidden chip opacity 0 ({vis})')
            pv = await pg.evaluate("(()=>{ const a = document.querySelector('#handStrip [data-defid=\"reef-shark\"] .tide-hand').parentElement; const cs = getComputedStyle(a); const r = a.getBoundingClientRect(); return [cs.opacity, cs.visibility, a.className, Math.round(r.width)]; })()")
            ok(pv[0] == '0' and pv[1] == 'hidden', f'{w} the empty pill around a hidden chip is hidden too ({pv})')
            await shot('tide-out')
            # --- Tide comes in
            await pg.evaluate("window.__tide = 'flow'; renderHand(); renderMatchUI();"); await pg.wait_for_timeout(120)
            r = await pg.evaluate(CHIPS); hs = {h[0]: h for h in r['hand']}
            ok('tide-fade-in' in hs['reef-shark'][2] and 'tide-live' in hs['reef-shark'][2] and 'tide-hand-off' not in hs['reef-shark'][2], f'{w} Tide in: lit chip, green fade-in {hs["reef-shark"]}')
            await shot('tide-in-mid')
            await pg.wait_for_timeout(1200); await shot('tide-in')
            vis = await pg.evaluate("(()=>{ const c = document.querySelector('#handStrip [data-defid=\"reef-shark\"] .tide-hand'); return getComputedStyle(c).opacity; })()")
            ok(float(vis) == 1, f'{w} the chip is fully in after the fade ({vis})')
            bd = {x[0]: x for x in r['board']}
            ok(bd['tide-pool-crab'][1] >= 1 and 'tide-live' in bd['tide-pool-crab'][2] and 'tide-hand' not in bd['tide-pool-crab'][2], f'{w} board card keeps the lit chip {bd["tide-pool-crab"]}')
            # --- Tide goes out again
            await pg.evaluate("window.__tide = null; renderHand(); renderMatchUI();"); await pg.wait_for_timeout(100)
            r = await pg.evaluate(CHIPS); hs = {h[0]: h for h in r['hand']}
            ok('tide-fade-out' in hs['reef-shark'][2], f'{w} Tide out again: red fade-out {hs["reef-shark"]}')
            bd = {x[0]: x for x in (await pg.evaluate(CHIPS))['board']}
            ok(bd['tide-pool-crab'][1] >= 1 and 'tide-live' not in bd['tide-pool-crab'][2], f'{w} board card keeps the unlit chip {bd["tide-pool-crab"]}')
            # --- reduced motion: no animation
            await pg.emulate_media(reduced_motion='reduce'); await pg.evaluate("window.__tide = 'flow'; renderHand();"); await pg.wait_for_timeout(100)
            an = await pg.evaluate("getComputedStyle(document.querySelector('#handStrip [data-defid=\"reef-shark\"] .tide-hand')).animationName")
            ok(an == 'none', f'{w} reduced motion: no flash ({an})'); await pg.emulate_media(reduced_motion='no-preference')
            # --- W12 Blind
            await pg.evaluate("window.__tide = null; renderHand();")
            await pg.evaluate("""(()=>{ const m = matchState; const c = m.players[1].row.center[0]; c.blind = 1; renderMatchUI(); try{ updateCardStatusDisplay(c.uid); }catch(e){} try{ FX.B.sightSync(m, {}); }catch(e){} })()""")
            await pg.wait_for_timeout(250)
            info = await pg.evaluate("""(()=>{ const el = document.querySelector('#battlefieldEl .board-card[data-defid="guppy"]'); if(!el) return null; const t = el.querySelector('.card-tile'); const sh = el.querySelector('.fxb-shut');
              return {cls: el.className, filter: getComputedStyle(t).filter, overlay: !!el.querySelector('.blind-overlay') && getComputedStyle(el.querySelector('.blind-overlay')).display, shut: sh ? [sh.className, getComputedStyle(sh).opacity] : null,
                chip: [...el.querySelectorAll('.abadge.blind')].map(x=> x.innerHTML.replace(/<[^>]+>/g,'')), shade: !!el.querySelector('.fxb-shade') && getComputedStyle(el.querySelector('.fxb-shade')).display}; })()""")
            print('   blind', info, await pg.evaluate("""(()=>{ const sh = document.querySelector('#battlefieldEl .board-card[data-defid="guppy"] .fxb-shut'); return sh ? [getComputedStyle(sh).animationName, sh.getAnimations().map(a=> a.animationName + ':' + Math.round(a.currentTime) + a.playState).join(), getComputedStyle(sh).opacity] : null; })()"""))
            ok(info is not None and 'is-blind' in info['cls'] and 'brightness(0.93)' in info['filter'], f'{w} Blind: tile darkened 7% ({info and info["filter"]})')
            ok(info['overlay'] in (False, 'none'), f'{w} Blind: no standing 👁 overlay ({info["overlay"]})')
            ok(info['shut'] is not None and 'is-blink' in info['shut'][0], f'{w} Blind: the closing eye plays when the unit becomes blind ({info["shut"]})')
            await pg.evaluate("""(()=>{ const sh = document.querySelector('#battlefieldEl .board-card[data-defid=\"guppy\"] .fxb-shut'); if(!sh) return; [sh, ...sh.querySelectorAll('*')].forEach(e=> e.getAnimations().forEach(a=>{ a.pause(); a.currentTime = a.animationName === 'ui5EyeOnce' ? 700 : 450; })); })()""") # freeze the blink mid-way for the shot
            await shot('blind-eye-closing')
            await pg.evaluate("document.getAnimations().forEach(a=>{ try{ if(a.playState === 'paused') a.cancel(); }catch(e){} })")
            print('   eye opacity right after the shot', await pg.evaluate("""(()=>{ const sh = document.querySelector('#battlefieldEl .board-card[data-defid=\"guppy\"] .fxb-shut'); return sh ? getComputedStyle(sh).opacity : null; })()"""))
            await pg.wait_for_timeout(2600)
            info = await pg.evaluate("""(()=>{ const el = document.querySelector('#battlefieldEl .board-card[data-defid="guppy"]'); const sh = el.querySelector('.fxb-shut'); return sh ? [sh.className, getComputedStyle(sh).opacity] : null; })()""")
            ok(info is None or float(info[1]) == 0, f'{w} Blind: the closing eye is gone after its one blink ({info})')
            await shot('blind-after')
            ok(not errs, f'{w} no page errors {errs[:2]}'); await pg.close()
        await b.close()
    httpd.shutdown()
    print('FAILED: ' + '; '.join(bad) if bad else 'all ok'); sys.exit(1 if bad else 0)

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--shots', default=os.path.join(ROOT, 'docs', 'screens', 'ui5'))
    asyncio.run(main(ap.parse_args()))
