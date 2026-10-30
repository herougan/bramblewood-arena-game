#!/usr/bin/env python3
"""Package CS-C (2026-10-30): screenshots of the Detail card and the hover popover at 390 and 1366, before / after.
    python3 tests/e2e/cs_c_shots_2026_10_30.py --tag before|after [--widths 1366,390] [--only inspector,detail,...]
Writes docs/screens/cs-c/<screen>-<tag>-<width>.jpg. Build first. Screens: inspector, detail, pack, raidflip, plinth, hover, zoom."""
import argparse, asyncio, http.server, socketserver, threading, functools, os
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'docs', 'screens', 'cs-c'); os.makedirs(OUT, exist_ok=True)
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
DONE = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1'); localStorage.setItem('bramblewood_arena_faction','otters');"
        "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying']));"
        "window.addEventListener('load', ()=>{ try{ skipTriggerLesson(); saveTutorial2Done(); saveTutorialDone(); window.soonCheckMilestones = ()=>{}; window.showCoachTip = ()=>{}; window.maybeShowCoachTip = ()=>{}; }catch(e){} });")
def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    h = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); threading.Thread(target=h.serve_forever, daemon=True).start(); return h
TEAR = """const ov = document.getElementById('packOpenOverlay');
  for(let k = 0; k < 10 && !ov.querySelector('.po2-card'); k++){ const strip = ov.querySelector('#poStrip');
    if(strip){ const r = strip.getBoundingClientRect(); const fire = (type, x)=> strip.dispatchEvent(new PointerEvent(type, {bubbles:true, clientX:x, clientY:r.top + r.height/2, pointerId:1, pointerType:'mouse', buttons:1}));
      fire('pointerdown', r.left + 4); for(let i = 1; i <= 12; i++){ fire('pointermove', r.left + r.width*i/12); await new Promise(z=> setTimeout(z, 16)); } fire('pointerup', r.right - 2); }
    await new Promise(z=> setTimeout(z, 900)); }"""
JS = {
  'inspector': "switchTab('nest'); await new Promise(r=> setTimeout(r, 500)); openCardInspector('otter-centurion', {}); await new Promise(r=> setTimeout(r, 900));",
  'detail': "switchTab('codex'); await new Promise(r=> setTimeout(r, 600)); openCardDetail('otter-centurion', {codex:true}); await new Promise(r=> setTimeout(r, 900));",
  'pack': "myCurrencies.gold = 99999; saveCurrencies(); const p = getShopPacks().find(x=> x.id === 'bronze'); const o = purchasePackOnce(p, true); openPackAnimation(p, [o]); await new Promise(r=> setTimeout(r, 1200)); " + TEAR + " const c = document.querySelector('#packOpenOverlay .po2-card.is-current'); if(c) c.click(); await new Promise(r=> setTimeout(r, 1300));",
  'raidflip': "playRewardReveal({rewardCardIds:['otter-centurion']}); await new Promise(r=> setTimeout(r, 1900));",
  'plinth': "myHero = myHero || {people: Object.keys(HERO_PEOPLES)[0], name:'Pip', xp:0, xpv:2, lvBase:1, xpB:0, xpM:0, alloc:{atk:0,hp:0,speed:0}, picks:{}, materia:{}, battles:0, wins:0, created: Date.now()}; saveHero(); switchTab('stomp'); await new Promise(r=> setTimeout(r, 1500));",
  'hover': "switchTab('codex'); await new Promise(r=> setTimeout(r, 1500));",
  'zoom': "adminModeEnabled = true; const mains = mainConquestMaps(), M = mains[4], p = loadConquestProgress(); mains.slice(0, 4).forEach(m=> m.nodes.forEach(nd=>{ const id = conquestNodeId(m.id, nd.key); if(!p.completed.includes(id)) p.completed.push(id); })); saveConquestProgress(p); const node = M.nodes.find(n=> n.kind === 'skirmish'); conquestWorldView = false; conquestSelectedMap = M.id; conquestSelectedNodeKey = node.key; playSubTab = 'conquest'; switchTab('play'); await new Promise(r=> setTimeout(r, 2500)); const ids = mapPoolSections(M.id)[0].ids; Object.keys(MAP_REVIEW.maps).forEach(k=> delete MAP_REVIEW.maps[k]); MAP_REVIEW.maps[M.id] = {chosen: ids.slice(0, 6).map(id=> ({id, why: 'Fake reason: fits the map and fills a gap in the curve', by: 'claude'})), cut: [], maybe: []}; document.getElementById('cnpMapCards').click(); await new Promise(r=> setTimeout(r, 900));",
}
async def run(b, url, w, tag, only):
    for name, js in JS.items():
        if only and name not in only: continue
        ctx = await b.new_context(viewport={'width': w, 'height': 844 if w < 700 else 860}, has_touch=(w < 700))
        pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.route('**/gsap.min.js', lambda r: r.fulfill(path=os.path.join(ROOT, 'gsap.min.js')) if os.path.exists(os.path.join(ROOT, 'gsap.min.js')) else r.continue_())
        await pg.add_init_script(DONE); await pg.goto(url)
        await pg.wait_for_function("typeof switchTab === 'function'", timeout=60000); await pg.wait_for_timeout(1500)
        await pg.evaluate("(()=>{ try{ FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); }catch(e){} })()")
        try:
            await pg.evaluate(f"(async()=>{{ {js} }})()")
            if name == 'hover':
                sel = '#codexGrid .card-tile[data-defid], #codexGrid [data-defid]'
                el = await pg.query_selector(sel)
                if el:
                    bb = await el.bounding_box(); await pg.mouse.move(bb['x'] + bb['width']/2, bb['y'] + bb['height']/2); await pg.wait_for_timeout(1400)
            if name == 'zoom':
                el = await pg.query_selector('.rv1-tile [data-zoom]')
                if el:
                    await el.scroll_into_view_if_needed(); bb = await el.bounding_box(); await pg.mouse.move(bb['x'] + bb['width']/2, bb['y'] + bb['height']/2); await pg.wait_for_timeout(600)
        except Exception as e:
            errs.append('script: ' + str(e)[:200])
        f = os.path.join(OUT, f'{name}-{tag}-{w}.jpg')
        await pg.screenshot(path=f, type='jpeg', quality=72, animations='allow')
        print(f, ('ERRORS: ' + ' | '.join(errs[:3])) if errs else '')
        await ctx.close()
async def main(a):
    h = serve(); url = f'http://127.0.0.1:{h.server_address[1]}/index.html'
    async with async_playwright() as p:
        exe = CHROME if os.path.exists(CHROME) else '/opt/pw-browsers/chromium'
        b = await p.chromium.launch(executable_path=exe, args=['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'])
        for w in [int(x) for x in a.widths.split(',')]: await run(b, url, w, a.tag, set(a.only.split(',')) if a.only else None)
        await b.close()
    h.shutdown()
if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--tag', default='after'); ap.add_argument('--widths', default='1366,390'); ap.add_argument('--only', default='')
    asyncio.run(main(ap.parse_args()))
