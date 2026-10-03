#!/usr/bin/env python3
"""User-flow audit (2026-10-03): can the player always leave a fight, and reach the cards they bought?
  - Quit from every match mode (and mid-round, and on a phone), always ending somewhere with a way Home
  - Conquest full-screen never outlives the map
  - Raid trench can be left
  - Pack cards show up in the Nest, the deck builder pool (unlocked) and the Forge
  - Escape closes Settings / Quests
"""
import asyncio, sys
from playwright.async_api import async_playwright
import os
HERE = os.path.dirname(os.path.abspath(__file__))
URL = 'file://' + os.path.join(HERE, '..', '..', 'index.html')
EXE = os.environ.get('BW_CHROMIUM', '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell')
INIT=("localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_arena_faction','otters');"
      "sessionStorage.setItem('bramblewood_seen_splash','1'); localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit']));")
issues=[]
def bad(m): issues.append(m); print('  ISSUE', m)
async def fresh(b, w=1366, h=860):
    pg=await b.new_page(viewport={'width':w,'height':h}); errs=[]
    pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('dialog', lambda d: asyncio.ensure_future(d.accept()))
    await pg.add_init_script(INIT); await pg.goto(URL); await pg.wait_for_timeout(1300)
    await pg.evaluate("FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); myCurrencies.energy=60; saveCurrencies&&saveCurrencies(); 1")
    return pg, errs
async def nav_ok(pg, label):
    if await pg.evaluate("currentTab")=='home': 
        if await pg.evaluate("!!matchState"): bad(f'{label}: matchState still set after leaving')
        return
    # some way home is visible (header on most tabs, the sub-tab row's Home on Play)
    vis = await pg.evaluate("(()=>{ const ok = el=> el && el.offsetParent!==null; return ok(document.getElementById('homeNavBtn')) || ok(document.getElementById('homeNavBtnPlay')); })()")
    if not vis: bad(f'{label}: no visible Home button after leaving')
    await pg.evaluate("switchTab('home'); 1"); await pg.wait_for_timeout(200)
    if await pg.evaluate("currentTab")!='home': bad(f'{label}: cannot get back Home')
    if await pg.evaluate("!!matchState"): bad(f'{label}: matchState still set after leaving')
async def quit_via_button(pg, label):
    btn = await pg.query_selector('#quitMatchBtn')
    if not btn: bad(f'{label}: no Quit button'); return
    bb = await btn.bounding_box(); await pg.mouse.click(bb['x']+bb['width']/2, bb['y']+bb['height']/2); await pg.wait_for_timeout(600)
    # quitting might show an in-page confirm
    c = await pg.query_selector('.confirm-yes, #confirmYes, [data-confirm="yes"]')
    if c: await c.click(); await pg.wait_for_timeout(400)
    if await pg.evaluate("!!matchState"): bad(f'{label}: still in match after Quit')
    await nav_ok(pg, label)
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path=EXE)
    # 1. quit from each mode
    for label, js in [('quick battle', "startMatch('ai')"), ('pass&play', "startMatch('pc')"), ('gauntlet', "startMatch('gauntlet')"),
                      ('dungeon', "startDungeonFight()"), ('conquest', "(()=>{const m=CONQUEST_MAPS[0]; const n=m.nodes.find(n=>n.kind==='skirmish'); conquestSelectedMap=m.id; playSubTab='conquest'; switchTab('play'); startConquestMatch(m.id,n.key);})()"),
                      ('offline raid', "startOfflineRaidMatch()"), ('tutorial', "beginTutorialStage(1)")]:
        pg, errs = await fresh(b)
        try:
            await pg.evaluate(f"(()=>{{ playSubTab='arena'; switchTab('play'); {js}; return 1; }})()"); await pg.wait_for_timeout(900)
            vs = await pg.query_selector('.vs-screen')
            if vs: await vs.click(); await pg.wait_for_timeout(600)
            if not await pg.evaluate("!!matchState"):
                # maybe a picker opened first (tutorial deck picker etc.)
                bad(f'{label}: match did not start (no matchState)')
            else:
                # mid-resolution quit too
                await quit_via_button(pg, label)
        except Exception as e: bad(f'{label}: {e}')
        if errs: bad(f'{label}: page errors {errs[:2]}')
        await pg.close()
    # 1a. phone: Quit reachable in a quick battle
    pg, errs = await fresh(b, 390, 844)
    await pg.evaluate("playSubTab='arena'; switchTab('play'); startMatch('ai'); 1"); await pg.wait_for_timeout(900)
    vs = await pg.query_selector('.vs-screen')
    if vs: await vs.click(); await pg.wait_for_timeout(600)
    q = await pg.query_selector('#quitMatchBtn')
    if not q or not await pg.evaluate("(()=>{ const r=document.getElementById('quitMatchBtn').getBoundingClientRect(); return r.width>0 && r.right<=innerWidth+1 && r.bottom>0; })()"): bad('phone: Quit button not on screen in a match')
    else: await quit_via_button(pg, 'phone quick battle')
    await pg.close()
    # 1b. quit while a round is resolving
    pg, errs = await fresh(b)
    await pg.evaluate("playSubTab='arena'; switchTab('play'); startMatch('ai'); 1"); await pg.wait_for_timeout(900)
    vs = await pg.query_selector('.vs-screen')
    if vs: await vs.click(); await pg.wait_for_timeout(600)
    await pg.evaluate("(async()=>{ const m=matchState; const me=m.players[1]; const h=me.hand.find(x=> m.engine.canPlay(me,x.defId,x.uid)); if(h) playCardByUid(h.uid,'left'); else skipTurn(); })()")
    await pg.wait_for_timeout(300)
    await quit_via_button(pg, 'quit mid-resolve'); await pg.wait_for_timeout(2500)
    if errs: bad(f'quit mid-resolve: page errors {errs[:2]}')
    await pg.close()
    # 1c. conquest immersive -> start a fight -> header?
    pg, errs = await fresh(b)
    await pg.evaluate("playSubTab='conquest'; switchTab('play'); 1"); await pg.wait_for_timeout(500)
    await pg.click('#conquestFsBtn'); await pg.wait_for_timeout(300)
    await pg.evaluate("(()=>{const m=CONQUEST_MAPS[0]; const n=m.nodes.find(n=>n.kind==='skirmish'); startConquestMatch(m.id,n.key);})()"); await pg.wait_for_timeout(1200)
    if await pg.evaluate("document.body.classList.contains('conquest-immersive')"): bad('immersive class still on during a match')
    await quit_via_button(pg, 'conquest after immersive')
    await pg.close()
    # 1d. immersive then switch tab
    pg, errs = await fresh(b)
    await pg.evaluate("playSubTab='conquest'; switchTab('play'); 1"); await pg.wait_for_timeout(500)
    await pg.click('#conquestFsBtn'); await pg.wait_for_timeout(300)
    await pg.evaluate("switchTab('codex'); 1"); await pg.wait_for_timeout(300)
    if await pg.evaluate("document.body.classList.contains('conquest-immersive')"): bad('immersive class stays on after leaving Conquest (header hidden)')
    await pg.close()
    # 1e. raid trench leave
    pg, errs = await fresh(b)
    await pg.evaluate("playSubTab='raid'; switchTab('play'); 1"); await pg.wait_for_timeout(600)
    await pg.click('[data-raid-part="left"]'); await pg.wait_for_timeout(300)
    await pg.click('[data-row="0"]'); await pg.wait_for_timeout(500)
    leave = await pg.query_selector('#trClose')
    if not leave: bad('trench: no Leave button found')
    else:
        await leave.click(); await pg.wait_for_timeout(800)
        done = await pg.query_selector('#trDone')
        if done: await done.click(); await pg.wait_for_timeout(300)
        if await pg.evaluate("!!document.querySelector('.tr-match, .trench-match, #trenchOverlay:not([hidden])')"): bad('trench: still showing after leaving')
        await nav_ok(pg, 'trench')
    await pg.close()
    # 2. bought cards reachable
    pg, errs = await fresh(b)
    await pg.evaluate("isSignedIn = ()=>true; myCurrencies.gold=1000; switchTab('shop'); 1"); await pg.wait_for_timeout(400)
    await pg.click('[data-buypack="bronze"]'); await pg.wait_for_timeout(400); await pg.click('#poSkip'); await pg.wait_for_timeout(400)
    got = await pg.evaluate("[...document.querySelectorAll('.po-card .card-tile')].map(e=>e.dataset.defid)")
    await pg.click('#poNest'); await pg.wait_for_timeout(500)
    if await pg.evaluate("currentTab")!='nest': bad('pack: "See them in the Nest" did not open the Nest')
    nest = await pg.evaluate("[...document.querySelectorAll('#nestGrid [data-nestcard]')].map(e=>e.dataset.nestcard)")
    for d in got:
        if d not in nest: bad(f'pack: {d} not in the Nest')
    await pg.evaluate("switchTab('deck'); 1"); await pg.wait_for_timeout(400)
    # open the deck editor
    ed = await pg.query_selector('[data-editdeck]')
    if ed: await ed.click(); await pg.wait_for_timeout(500)
    pool = await pg.evaluate("[...document.querySelectorAll('#myDeckPool [data-defid]')].map(e=>e.dataset.defid)")
    if not pool: bad('deck builder: pool not found / empty')
    for d in got:
        if pool and d not in pool: bad(f'deck builder: bought card {d} not in pool')
    lockedInPool = await pg.evaluate("(ids)=> ids.filter(id=> { const el=document.querySelector('#myDeckPool [data-defid=\"'+id+'\"]'); return el && (el.classList.contains('locked') || el.closest('.locked')); })", got)
    if lockedInPool: bad(f'deck builder: bought cards still shown locked {lockedInPool}')
    await pg.evaluate("codexSubTab='forge'; switchTab('codex'); 1"); await pg.wait_for_timeout(400)
    forge = await pg.evaluate("[...document.querySelectorAll('#forgePool [data-defid]')].map(e=>e.dataset.defid)")
    for d in got:
        if d not in forge: bad(f'forge: bought card {d} not in Forge pool')
    if errs: bad(f'pack flow page errors {errs[:2]}')
    await pg.close()
    # 2b. win screen buttons: Back to board, Play again, Next battle, Quit
    for btn_id in ['wlBackBtn', 'wlPrimaryBtn', 'wlNextBattleBtn', 'wlQuitBtn']:
        pg, errs = await fresh(b)
        await pg.evaluate("(()=>{const m=CONQUEST_MAPS[0]; const n=m.nodes.find(n=>n.kind==='skirmish'); conquestSelectedMap=m.id; playSubTab='conquest'; switchTab('play'); startConquestMatch(m.id,n.key); matchState.players[2].hq.hp=1; return 1;})()")
        await pg.wait_for_timeout(800)
        for _ in range(60):
            if await pg.evaluate("!!document.getElementById('wlQuitBtn')"): break
            await pg.evaluate("(async()=>{ const m=matchState; if(!m||m.over||m.resolving) return; const me=m.players[1]; const h=me.hand.find(x=> m.engine.canPlay(me,x.defId,x.uid)); if(h) await playCardByUid(h.uid,'left'); else await skipTurn(); })()")
            await pg.wait_for_timeout(400)
        await pg.wait_for_timeout(1500)
        el = await pg.query_selector('#'+btn_id)
        if not el: bad(f'win screen: no #{btn_id}')
        else:
            await el.click(); await pg.wait_for_timeout(900)
            vs = await pg.query_selector('.vs-screen')
            if vs: await vs.click(); await pg.wait_for_timeout(500)
            state = await pg.evaluate("[!!matchState, matchState && matchState.over, !!document.querySelector('.winloss-overlay'), currentTab]")
            if btn_id=='wlBackBtn' and state[2]: bad('win screen: Back to board did not close the modal')
            if btn_id in ('wlPrimaryBtn','wlNextBattleBtn') and not (state[0] and not state[1]): bad(f'win screen: {btn_id} did not start a new fight {state}')
            if btn_id=='wlQuitBtn' and state[0]: bad('win screen: Quit left a match open')
            if btn_id=='wlBackBtn':
                # after looking at the board you still need a way out
                await quit_via_button(pg, 'after Back to board')
        if errs: bad(f'win screen {btn_id}: page errors {errs[:2]}')
        await pg.close()
    # 2c. in-match settings open/close; pack overlay closes with Escape
    pg, errs = await fresh(b)
    await pg.evaluate("playSubTab='arena'; switchTab('play'); startMatch('ai'); 1"); await pg.wait_for_timeout(900)
    vs = await pg.query_selector('.vs-screen')
    if vs: await vs.click(); await pg.wait_for_timeout(500)
    sb = await pg.query_selector('#settingsBtnHud')
    if not sb: bad('match: no settings button')
    else:
        await sb.click(); await pg.wait_for_timeout(200)
        if not await pg.evaluate("(()=>{ const p=document.getElementById('settingsPanelHud'); return !!p && !p.hidden; })()"): bad('match: settings did not open')
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(200)
        if await pg.evaluate("(()=>{ const p=document.getElementById('settingsPanelHud'); return !!p && !p.hidden; })()"): bad('match: settings does not close on Escape')
    await pg.evaluate("endMatch(); isSignedIn=()=>true; myCurrencies.gold=1000; switchTab('shop'); 1"); await pg.wait_for_timeout(300)
    await pg.click('[data-buypack="bronze"]'); await pg.wait_for_timeout(400)
    await pg.keyboard.press('Escape'); await pg.wait_for_timeout(300); await pg.keyboard.press('Escape'); await pg.wait_for_timeout(300)
    if await pg.evaluate("(()=>{ const o=document.getElementById('packOpenOverlay'); return !!o && !o.hidden; })()"): bad('pack opening cannot be closed with Escape')
    if errs: bad(f'settings/pack: page errors {errs[:2]}')
    await pg.close()
    # 3. Escape closes modals
    pg, errs = await fresh(b)
    await pg.click('#settingsBtn'); await pg.wait_for_timeout(200); await pg.keyboard.press('Escape'); await pg.wait_for_timeout(200)
    if await pg.evaluate("(()=>{ const p=document.getElementById('settingsPanel'); return p && !p.hidden; })()"): bad('Settings panel does not close on Escape')
    await pg.evaluate("switchTab('home');1"); await pg.wait_for_timeout(200)
    qb = await pg.query_selector('#homeQuestsBtn')
    if qb:
        await qb.click(); await pg.wait_for_timeout(300); await pg.keyboard.press('Escape'); await pg.wait_for_timeout(200)
        if await pg.evaluate("!!document.querySelector('.modal-overlay:not([hidden]) .quests-modal, #questsModal:not([hidden])')"): bad('Quests modal does not close on Escape')
    await pg.close()
    await b.close()
  print('flows:', len(issues), 'issue(s)')
  sys.exit(1 if issues else 0)
asyncio.run(main())
