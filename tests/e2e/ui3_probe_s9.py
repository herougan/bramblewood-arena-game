import asyncio, os, sys, json
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
URL = 'file://' + os.path.join(ROOT, 'index.html')
EXE = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
INIT = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_arena_faction','otters'); sessionStorage.setItem('bramblewood_seen_splash','1');"
        "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying']));")
SNAP = """()=>{ const vis = el=> el && !el.hidden && el.getClientRects().length > 0; const q = s=> [...document.querySelectorAll(s)].filter(vis).map(e=> (e.id ? '#' + e.id : '') + '.' + String(e.className).split(' ').slice(0,2).join('.'));
  return {phase: GD.phase, gd: vis(document.getElementById('gdOverlay')), panel: (document.querySelector('#gdOverlay .gd-panel h3')||{}).textContent || '', match: !!matchState, over: matchState && matchState.over,
   wl: q('.winloss-overlay, .winloss-card, .modal-overlay, .rw-overlay, #packOpenOverlay, .toast, .map-veil'), tab: currentTab, sub: playSubTab, seats: GD.s && GD.s.room.seats.map(s=> s && (s.cpu ? 'cpu' : 'human'))}; }"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=EXE)
        ctx = await b.new_context(viewport={'width': 390, 'height': 844}); pg = await ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.add_init_script(INIT); await pg.goto(URL); await pg.wait_for_timeout(2500)
        await pg.evaluate("""()=>{ deckSizeOkOrWarn = ()=> true; try{ FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); }catch(e){} try{ const s = settleEnergy(); s.current = 60; saveEnergyState(s); }catch(e){} switchTab('play'); playSubTab = 'dungeons'; renderPlay(); }""")
        await pg.wait_for_timeout(300)
        await pg.evaluate("()=> gdCreate(true)"); await pg.wait_for_timeout(400)
        await pg.click('#gdOverlay [data-gd-act="start"]'); await pg.wait_for_timeout(1500)
        print('start', await pg.evaluate(SNAP))
        print('cpu seat deck size', await pg.evaluate("()=> GD.s.T && JSON.stringify(Object.values(GD.s.T.seats.map(s=> [s.cpu, Object.keys(s.deck).length, Object.values(s.deck).reduce((a,c)=>a+c,0)])))"))
        # finish the run quickly: win floor by emptying the vault, on each floor, tracking what shows
        for floor in range(4):
            await pg.evaluate("()=>{ const T = matchState.coop.T; T.players[2].hq.hp = 0; T.players[2].hq.shield = 0; T.players[2].hq.shieldLayers = []; renderHUD(); }")
            await pg.evaluate("async()=>{ try{ await skipTurn(); }catch(e){} }")
            for i in range(26):
                await pg.wait_for_timeout(400)
                s = await pg.evaluate(SNAP)
                if floor == 0 and s['phase'] == 'floorEnd' and not s['gd'] and not os.path.exists('/tmp/wl1.png'): await pg.screenshot(path='/tmp/wl1.png')
                if i % 3 == 0 or s['phase'] in ('floorEnd', 'end'): print(floor, i, json.dumps(s))
                if s['phase'] in ('floorEnd', 'end') and s['panel'] and i > 6: break
            if await pg.evaluate("()=> GD.phase") == 'end': break
            nxt = await pg.query_selector('#gdOverlay [data-gd-act="next"]')
            if nxt: await nxt.click(); await pg.wait_for_timeout(2500)
        print('final', json.dumps(await pg.evaluate(SNAP)))
        await pg.screenshot(path=os.path.join(ROOT, 'tests', 'out', 'ui3-probe-end.png'))
        back = await pg.query_selector('#gdOverlay [data-gd-act="close"]')
        if back: await back.click(); await pg.wait_for_timeout(800)
        print('after back', json.dumps(await pg.evaluate(SNAP)), await pg.evaluate('()=>({pane: pl2ArenaPane, sub: playSubTab, hasCoop: !!document.querySelector(".pl2-arena-tabs")})'))
        print('errs', errs[:3])
        await b.close()
asyncio.run(main())
