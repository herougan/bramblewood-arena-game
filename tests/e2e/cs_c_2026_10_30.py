#!/usr/bin/env python3
"""Package CS-C (2026-10-30, card sizes steps 4-5): browser checks of the Detail card and the hover popover at 1366 and 390.
    python3 tests/e2e/cs_c_2026_10_30.py [--widths 1366,390]
The Card Detail overlay (the inspector now): Detail size, tilt under a mouse, tap flips to the decorative back, a sideways drag turns it, a vertical
touch drag does not (the page scrolls), Esc closes; reduced motion and Effects Low: no rotation, the faces swap; the pack reveal (the Detail card,
a drag turns it and settles face up, a tap after a drag does not move on, a plain tap does); the pack-results viewer; the Nest's viewer opens the
Card Detail; the Hero's plinth; the reward reveal turns face up; the hover popover (Full card + text + a caller's line, on screen) and the
gallery popover over a modal (z 900 > 600). Build first. Exits 1 on a failed check. Shots: tests/e2e/cs_c_shots_2026_10_30.py."""
import argparse, asyncio, http.server, socketserver, threading, functools, os, sys
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
DONE = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1'); localStorage.setItem('bramblewood_arena_faction','otters');"
        "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying']));"
        "window.addEventListener('load', ()=>{ try{ skipTriggerLesson(); saveTutorial2Done(); saveTutorialDone(); window.soonCheckMilestones = ()=>{}; window.showCoachTip = ()=>{}; window.maybeShowCoachTip = ()=>{}; }catch(e){} });")
fails = []
def ok(c, m):
    print(('  ok  ' if c else '  FAIL ') + m)
    if not c: fails.append(m)
def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
        def handle(self):
            try: super().handle()
            except (BrokenPipeError, ConnectionResetError): pass
    h = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); threading.Thread(target=h.serve_forever, daemon=True).start(); return h
# page helpers: synthetic pointer events on an element (touch or mouse), the spin's rotateY
HELP = """(()=>{ window.__P = (el, type, x, y, kind, id)=> el.dispatchEvent(new PointerEvent(type, {bubbles:true, cancelable:true, clientX:x, clientY:y, pointerId:id || 7, pointerType:kind || 'touch', buttons: type === 'pointerup' ? 0 : 1, isPrimary:true}));
window.__ry = el=>{ const m = /rotateY\\((-?[\\d.]+)deg\\)/.exec(el.style.transform || ''); return m ? +m[1] : null; }; return 1; })()"""
async def page(b, url, w, reduce=False, init=''):
    ctx = await b.new_context(viewport={'width': w, 'height': 844 if w < 700 else 860}, has_touch=(w < 700), reduced_motion='reduce' if reduce else 'no-preference')
    pg = await ctx.new_page(); pg._errs = []; pg.on('pageerror', lambda e: pg._errs.append(str(e)))
    await pg.route('**/gsap.min.js', lambda r: r.fulfill(path=os.path.join(ROOT, 'gsap.min.js')) if os.path.exists(os.path.join(ROOT, 'gsap.min.js')) else r.continue_())
    await pg.add_init_script(DONE + init); await pg.goto(url)
    await pg.wait_for_function("typeof switchTab === 'function' && typeof mountDetailCard === 'function'", timeout=60000); await pg.wait_for_timeout(1500)
    await pg.evaluate("(()=>{ try{ FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); }catch(e){} })()"); await pg.evaluate(HELP)
    return ctx, pg
async def run(b, url, w):
    print(f'-- width {w}')
    ctx, pg = await page(b, url, w)
    # 1. the Card Detail overlay
    r = await pg.evaluate("""(async()=>{ switchTab('codex'); await new Promise(z=> setTimeout(z, 500)); openCardDetail('otter-centurion', {codex:true}); await new Promise(z=> setTimeout(z, 600));
      const ov = document.getElementById('cardDetailOverlay'), dc = ov.querySelector('.cd-dc .dc[data-dc]'); if(!dc) return null; const st = dc.querySelector('.dc-stage'), sp = dc.querySelector('.dc-spin'), r = dc.getBoundingClientRect();
      const tok = parseFloat(getComputedStyle(dc).width), out = {w: Math.round(r.width), vw: innerWidth, inView: r.left >= 0 && r.right <= innerWidth + 1, back: dc.querySelector('.dc-back').className, inspectBtn: !!document.getElementById('cdInspectBtn'),
        btns: [...ov.querySelectorAll('[data-dc-spin], [data-dc-flip]')].length, touch: getComputedStyle(st).touchAction, still: dc.classList.contains('is-still'), face0: dc.dataset.face};
      // the mouse tilts it
      __P(st, 'pointermove', r.right - 4, r.top + r.height / 2, 'mouse'); await new Promise(z=> setTimeout(z, 150)); out.tiltRy = __ry(sp); out.hot = dc.classList.contains('is-hot');
      __P(st, 'pointerleave', r.right + 40, r.top, 'mouse'); await new Promise(z=> setTimeout(z, 100)); out.restRy = __ry(sp);
      // a tap flips it to the back, another back up
      st.click(); await new Promise(z=> setTimeout(z, 100)); out.face1 = dc.dataset.face; out.ry1 = __ry(sp); st.click(); await new Promise(z=> setTimeout(z, 100)); out.face2 = dc.dataset.face;
      // a vertical touch drag: nothing turns
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2, ry0 = __ry(sp);
      __P(st, 'pointerdown', cx, cy); for(let i = 1; i <= 6; i++) __P(st, 'pointermove', cx + i, cy + i * 14); __P(st, 'pointerup', cx + 6, cy + 84); await new Promise(z=> setTimeout(z, 100));
      out.vertRy = __ry(sp) - ry0; out.vertFace = dc.dataset.face; out.vertDrag = dc.classList.contains('is-dragging');
      // a sideways touch drag turns it, live, and it settles on a face
      __P(st, 'pointerdown', cx, cy, 'touch', 8); for(let i = 1; i <= 4; i++) __P(st, 'pointermove', cx + i * 20, cy + i * 2, 'touch', 8); out.midRy = __ry(sp) - ry0; out.dragging = dc.classList.contains('is-dragging');
      __P(st, 'pointerup', cx + 80, cy + 8, 'touch', 8); await new Promise(z=> setTimeout(z, 100)); out.endRy = __ry(sp); out.endFace = dc.dataset.face;
      // the Spin button: a full turn; Esc closes
      ov.querySelector('[data-dc-spin]').click(); await new Promise(z=> setTimeout(z, 50)); out.spinRy = __ry(sp) - out.endRy;
      document.dispatchEvent(new KeyboardEvent('keydown', {key:'Escape', bubbles:true})); await new Promise(z=> setTimeout(z, 100)); out.closed = ov.hidden;
      return out; })()""")
    ok(r is not None, 'the Card Detail overlay holds the Detail card')
    if r:
        want = 400 if w >= 1100 else min(400, round(w * .86))
        ok(abs(r['w'] - want) <= 2 and r['inView'], f"the Detail size: {r['w']}px (want {want}), on screen")
        ok('bw-back' in r['back'] and not r['inspectBtn'] and r['btns'] == 2, f"the decorative back ({r['back']}), Spin and Flip under it, no 🔍 Inspect")
        ok(r['touch'] == 'pan-y' and not r['still'] and r['face0'] == 'front', f"touch-action {r['touch']}, face up")
        ok(r['tiltRy'] and r['tiltRy'] > 5 and r['hot'] and r['restRy'] == 0, f"the mouse tilts it ({r['tiltRy']}°) and it rests flat after ({r['restRy']})")
        ok(r['face1'] == 'back' and r['ry1'] == 180 and r['face2'] == 'front', f"a tap flips it to the back and back ({r['face1']} {r['ry1']}°, {r['face2']})")
        ok(r['vertRy'] == 0 and r['vertFace'] == 'front' and not r['vertDrag'], f"a vertical touch drag turns nothing (the page scrolls): {r['vertRy']}°")
        ok(r['dragging'] and 20 < r['midRy'] < 180 and r['endRy'] % 180 == 0, f"a sideways drag turns it live ({r['midRy']:.0f}°) and it settles on a face ({r['endRy']}°, {r['endFace']})")
        ok(r['spinRy'] == 360 and r['closed'], f"Spin turns it once round ({r['spinRy']}°), Esc closes")
    # 2. the Nest's viewer opens the Card Detail; the pack-results viewer keeps its own overlay with the same card
    r = await pg.evaluate("""(async()=>{ openCardInspector('otter-centurion', {}); await new Promise(z=> setTimeout(z, 400)); const a = {cd: !document.getElementById('cardDetailOverlay').hidden, ci: !!document.querySelector('.card-inspect')};
      document.dispatchEvent(new KeyboardEvent('keydown', {key:'Escape', bubbles:true})); await new Promise(z=> setTimeout(z, 100));
      openCardInspector('otter-centurion', {pull:{foil:false, finish:null, shiny:true}}); await new Promise(z=> setTimeout(z, 700)); const ci = document.querySelector('.card-inspect');
      a.pull = !!(ci && ci.querySelector('.dc[data-dc] .dc-tile.is-shiny') && ci.querySelector('.ci-detail .cd-abilities')); a.pullW = ci ? Math.round(ci.querySelector('.dc').getBoundingClientRect().width) : 0;
      window.dispatchEvent(new KeyboardEvent('keydown', {key:'Escape', bubbles:true})); await new Promise(z=> setTimeout(z, 100)); a.pullClosed = !document.querySelector('.card-inspect'); return a; })()""")
    ok(r['cd'] and not r['ci'], f"the Nest's viewer opens the Card Detail overlay ({r})")
    ok(r['pull'] and r['pullW'] >= 250 and r['pullClosed'], f"the pack-results viewer: the same Detail card (the pulled copy's Shiny) with its text, {r['pullW']}px, Esc closes")
    # 3. the hover popover: the Full card plus text and a caller's line, on screen
    await pg.evaluate("(async()=>{ switchTab('codex'); await new Promise(z=> setTimeout(z, 800)); const t = document.querySelector('#codexGrid [data-defid]'); if(t) t.setAttribute('data-pop-line', 'A caller line: why this card'); })()")
    el = await pg.query_selector('#codexGrid [data-defid]')
    if el:
        bb = await el.bounding_box(); await pg.mouse.move(bb['x'] + bb['width'] / 2, bb['y'] + bb['height'] / 2); await pg.wait_for_timeout(1400)
        r = await pg.evaluate("""(()=>{ const p = document.getElementById('cardPop'), t = p && p.querySelector('.card-pop-visual-tile'), r = p.getBoundingClientRect(), tr = t && t.getBoundingClientRect();
          return {shown: !p.hidden, size: t && t.dataset.size, tw: tr ? Math.round(tr.width) : 0, full: Math.round(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--card-full-w')) || 0), line: (p.querySelector('.cp-line') || {}).textContent || '',
            ab: !!p.querySelector('li, .mech-wrap'), on: r.left >= 0 && r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1 && (tr ? tr.top >= 0 : r.top >= 0), z: +getComputedStyle(p).zIndex}; })()""")
        ok(r['shown'] and r['size'] == 'full' and r['ab'], f"the hover popover: the Full card ({r['tw']}px) and its skills")
        ok(r['line'] == 'A caller line: why this card', f"a caller's line rides in it ({r['line']!r})")
        ok(r['on'] and r['z'] > 600, f"on screen, above a modal (z {r['z']})")
    else:
        ok(False, 'a Codex tile to hover')
    await pg.mouse.move(2, 2)
    # 4. the gallery popover over a modal (the Map cards review): the Full card, its text, the reason; z 900 over the overlay's 600
    r = await pg.evaluate("""(async()=>{ const ov = document.createElement('div'); ov.className = 'modal-overlay'; ov.innerHTML = '<div class="modal"><span class="vis4-mc-card" data-zoom="otter-centurion" data-zoom-why="Fake reason: fills a gap" tabindex="0" style="display:inline-block;width:80px;height:100px">x</span></div>';
      document.body.appendChild(ov); wireRewardZoom(ov); const t = ov.querySelector('[data-zoom]'); t.dispatchEvent(new PointerEvent('pointerenter')); await new Promise(z=> setTimeout(z, 300));
      const z = document.querySelector('.cnp-rw-zoom'), r = z && z.getBoundingClientRect(); const out = z ? {sheet: z.classList.contains('cp-sheet'), above: +getComputedStyle(z).zIndex, under: +getComputedStyle(ov).zIndex, full: !!z.querySelector('.card-tile[data-size="full"]'),
        text: !!z.querySelector('.cp-text li, .cp-text .mech-wrap'), why: (z.querySelector('.cnp-rw-why') || {}).textContent, on: r.left >= 0 && r.top >= 0 && r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1} : null;
      t.dispatchEvent(new PointerEvent('pointerleave')); ov.remove(); return out; })()""")
    ok(r and r['sheet'] and r['full'] and r['text'] and r['why'] == 'Fake reason: fills a gap', f"the gallery popover: the Full card, its text and the reason ({r})")
    ok(r and r['above'] > r['under'] and r['on'], f"the gallery popover sits above the overlay and on screen ({r and r['above']} > {r and r['under']})")
    # 5. the Hero's plinth
    r = await pg.evaluate("""(async()=>{ myHero = myHero || {people: Object.keys(HERO_PEOPLES)[0], name:'Pip', xp:0, xpv:2, lvBase:1, xpB:0, xpM:0, alloc:{atk:0,hp:0,speed:0}, picks:{}, materia:{}, battles:0, wins:0, created: Date.now()}; saveHero(); switchTab('stomp'); await new Promise(z=> setTimeout(z, 1200));
      const dc = document.querySelector('#view-stomp .hero-card-big .dc[data-dc]'); if(!dc) return null; const r = dc.getBoundingClientRect(), st = dc.querySelector('.dc-stage'); st.click(); await new Promise(z=> setTimeout(z, 80));
      return {w: Math.round(r.width), on: r.left >= 0 && r.right <= innerWidth + 1, ctl: !!dc._dc, face: dc.dataset.face}; })()""")
    ok(r and r['ctl'] and r['on'] and r['face'] == 'back' and r['w'] >= (380 if w >= 1100 else 250), f"the Hero's plinth: the Detail card, on screen, a tap flips it ({r})")
    ok(not pg._errs, f'no page errors {pg._errs[:3]}')
    await ctx.close()
    # 6. the pack reveal: the Detail card; a drag turns a revealed card and it settles face up; the tap after a drag does not move on; a plain tap does
    ctx, pg = await page(b, url, w)
    r = await pg.evaluate("""(async()=>{ myCurrencies.gold = 99999; saveCurrencies(); const p = getShopPacks().find(x=> x.id === 'bronze'); const o = purchasePackOnce(p, true); openPackAnimation(p, [o]); await new Promise(z=> setTimeout(z, 1200));
      const ov = document.getElementById('packOpenOverlay');
      for(let k = 0; k < 10 && !ov.querySelector('.po2-card'); k++){ const strip = ov.querySelector('#poStrip');
        if(strip){ const r = strip.getBoundingClientRect(); const fire = (type, x)=> strip.dispatchEvent(new PointerEvent(type, {bubbles:true, clientX:x, clientY:r.top + r.height/2, pointerId:1, pointerType:'mouse', buttons:1}));
          fire('pointerdown', r.left + 4); for(let i = 1; i <= 12; i++){ fire('pointermove', r.left + r.width*i/12); await new Promise(z=> setTimeout(z, 16)); } fire('pointerup', r.right - 2); }
        await new Promise(z=> setTimeout(z, 900)); }
      const c = ov.querySelector('.po2-card.is-current'); if(!c) return null; const dc = c.querySelector('.dc[data-dc]'), st = dc && dc.querySelector('.dc-stage'), sp = dc && dc.querySelector('.dc-spin');
      const out = {dc: !!dc, ctl: !!(dc && dc._dc), face0: dc && dc.dataset.face, w: Math.round(c.getBoundingClientRect().width), tok: Math.round(parseFloat(getComputedStyle(ov.querySelector('.po2-deck')).width))};
      if(!c.classList.contains('is-revealed')) c.click(); await new Promise(z=> setTimeout(z, 200)); out.revealed = c.classList.contains('is-revealed'); out.face1 = dc.dataset.face;
      const r = st.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      __P(st, 'pointerdown', cx, cy, 'mouse', 3); for(let i = 1; i <= 5; i++) __P(st, 'pointermove', cx + i * 24, cy, 'mouse', 3); out.mid = __ry(sp);
      __P(st, 'pointerup', cx + 120, cy, 'mouse', 3); st.dispatchEvent(new MouseEvent('click', {bubbles:true})); await new Promise(z=> setTimeout(z, 120));
      out.afterDrag = {collected: c.classList.contains('is-collected'), face: dc.dataset.face, ry: __ry(sp)};
      c.click(); await new Promise(z=> setTimeout(z, 200)); out.tapCollects = c.classList.contains('is-collected');
      out.slotW = Math.round((ov.querySelector('.po2-slot') || {getBoundingClientRect: ()=> ({width:0})}).getBoundingClientRect().width); out.slotVar = getComputedStyle(ov.querySelector('.po2-got')).getPropertyValue('--po2-slot-w').trim();
      return out; })()""")
    ok(r and r['dc'] and r['ctl'] and r['face0'] == 'back', f"the pack reveal: the Detail card, face down, handled ({r and {k: r[k] for k in ('dc', 'ctl', 'face0', 'w', 'tok')}})")
    ok(r and r['revealed'] and r['face1'] == 'front', 'the reveal turns it face up')
    ok(r and r['mid'] is not None and r['mid'] % 180 != 0 and not r['afterDrag']['collected'] and r['afterDrag']['face'] == 'front' and r['afterDrag']['ry'] % 360 == 0, f"a drag turns the revealed card, it settles face up and the click after it does not move on ({r and r['mid']}, {r and r['afterDrag']})")
    ok(r and r['tapCollects'], 'a plain tap still collects it (moves on)')
    ok(r and r['slotVar'] and r['slotW'] > 40, f"the tray keeps its Full slots (--po2-slot-w {r and r['slotVar'][:40]}..., {r and r['slotW']}px)")
    ok(not pg._errs, f'no page errors {pg._errs[:3]}')
    await ctx.close()
    # 7. the reward reveal: face down, then up
    ctx, pg = await page(b, url, w)
    # (the headless renderer here draws a few frames a second; GSAP's lag smoothing would stretch the timeline far past its 2.5 s, so it is off)
    r = await pg.evaluate("""(async()=>{ if(window.gsap) gsap.ticker.lagSmoothing(0); playRewardReveal({rewardCardIds:['otter-centurion']}); let first = null, up = false;
      for(let k = 0; k < 160; k++){ const dc = document.querySelector('.rr-card .dc[data-dc]'); if(dc && first == null) first = dc.dataset.face; if(dc && dc.dataset.face === 'front'){ up = true; break; } await new Promise(z=> setTimeout(z, 50)); }
      return {first, up}; })()""")
    ok(r['first'] == 'back' and r['up'], f"the reward reveal: the Detail card face down, then turned up ({r})")
    await ctx.close()
    # 8. reduced motion, then Effects Low: no rotation, the faces swap, no tilt
    for label, reduce, init in (('reduced motion', True, ''), ('Effects Low', False, "localStorage.setItem('bramblewood_fx_level','low');")):
        ctx, pg = await page(b, url, w, reduce=reduce, init=init)
        r = await pg.evaluate("""(async()=>{ openCardDetail('otter-centurion'); await new Promise(z=> setTimeout(z, 500)); const dc = document.querySelector('.cd-dc .dc[data-dc]'), st = dc.querySelector('.dc-stage'), sp = dc.querySelector('.dc-spin'), r = st.getBoundingClientRect();
          __P(st, 'pointermove', r.right - 4, r.top + 10, 'mouse'); await new Promise(z=> setTimeout(z, 100)); const t0 = getComputedStyle(sp).transform;
          st.click(); await new Promise(z=> setTimeout(z, 300)); const back = getComputedStyle(dc.querySelector('.dc-back')), front = getComputedStyle(dc.querySelector('.dc-front'));
          return {still: dc.classList.contains('is-still'), t0, t1: getComputedStyle(sp).transform, face: dc.dataset.face, backVis: back.visibility, frontVis: front.visibility, hot: dc.classList.contains('is-hot')}; })()""")
        ok(r['still'] and r['t0'] == 'none' and r['t1'] == 'none' and not r['hot'], f"{label}: no tilt and no rotation ({r['t0']}, {r['t1']})")
        ok(r['face'] == 'back' and r['backVis'] == 'visible' and r['frontVis'] == 'hidden', f"{label}: a tap swaps the faces in place ({r['face']}, back {r['backVis']}, front {r['frontVis']})")
        await ctx.close()
async def main(a):
    h = serve(); url = f'http://127.0.0.1:{h.server_address[1]}/index.html'
    async with async_playwright() as p:
        exe = CHROME if os.path.exists(CHROME) else '/opt/pw-browsers/chromium'
        b = await p.chromium.launch(executable_path=exe, args=['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'])
        for w in [int(x) for x in a.widths.split(',')]: await run(b, url, w)
        await b.close()
    h.shutdown()
    print(f'cs-c e2e: {"all passed" if not fails else str(len(fails)) + " FAILED"}')
    sys.exit(1 if fails else 0)
if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--widths', default='1366,390'); asyncio.run(main(ap.parse_args()))
