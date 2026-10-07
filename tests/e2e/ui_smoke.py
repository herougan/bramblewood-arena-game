#!/usr/bin/env python3
"""UI smoke test for the 2026-10-03 features — real game page in headless Chromium.

    python3 tests/e2e/ui_smoke.py

Checks:
  1. every tab and Play sub-tab at 1366, 820 (iPad) and 390 (phone): no page errors, no sideways scroll;
  2. Home: Play hero + 2×2 grid, Settings → Workshop/Admin, Community menu;
  3. card levels: hidden in the Codex, shown in the Nest and in the deck pool when the level filter is on;
  4. Shop: a pack opens, every card flips, the cards land in the Nest;
  5. Raid trench: pick a row, play your row turn by turn to the end, the attempt is recorded once;
  6. Conquest world: an edge pans to the next map; the 🧭 atlas shows every map and zooms in;
  7. Arena: Recent opponents opens the opponent's deck;
  8. phone header stays on one row;
  9. shader layers mount on the splash, Home and a map, and Settings can turn them off.
Exit code 1 on any failure.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
URL = 'file://' + os.path.join(ROOT, 'index.html')
EXE = os.environ.get('BW_CHROMIUM', '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell')
INIT = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_arena_faction','otters');"
        "sessionStorage.setItem('bramblewood_seen_splash','1'); localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit']));"
        "localStorage.setItem('bramblewood_recent_opponents_v1', JSON.stringify([{at:1, name:'Moss B.', mode:'pvp', result:'win', deck:{'yeti':2,'bee-drone':3}}]));")
TABS = ['home', 'codex', 'deck', 'shop', 'nest', 'profile', 'ranking', 'friends', 'guild', 'admin']
SUBTABS = ['conquest', 'arena', 'autobattle', 'raid']
failures = []

def check(cond, msg):
    if not cond:
        failures.append(msg); print('  FAIL', msg)

async def new_page(b, w, h):
    pg = await b.new_page(viewport={'width': w, 'height': h})
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('dialog', lambda d: asyncio.ensure_future(d.accept()))
    await pg.add_init_script(INIT)
    await pg.goto(URL); await pg.wait_for_timeout(1500)
    await pg.evaluate("FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); myCurrencies.energy = 60; 1")
    return pg, errs

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=EXE)
        # 1 + 8: every screen at three sizes
        for w, h in [(1366, 860), (820, 1180), (390, 844)]:
            pg, errs = await new_page(b, w, h)
            for t in TABS:
                await pg.evaluate(f"switchTab('{t}'); 1"); await pg.wait_for_timeout(250)
                check(not await pg.evaluate("document.documentElement.scrollWidth > innerWidth+1"), f'{t}@{w}: sideways scroll')
            for st in SUBTABS:
                await pg.evaluate(f"playSubTab='{st}'; switchTab('play'); 1"); await pg.wait_for_timeout(350)
                check(not await pg.evaluate("document.documentElement.scrollWidth > innerWidth+1"), f'play:{st}@{w}: sideways scroll')
            if w == 390:
                await pg.evaluate("switchTab('codex'); 1"); await pg.wait_for_timeout(200)
                check(await pg.evaluate("document.querySelector('.topbar').getBoundingClientRect().height") < 60, 'phone header wraps to two rows')
            check(not errs, f'page errors at {w}: {errs[:3]}')
            await pg.close()

        pg, errs = await new_page(b, 1366, 900)
        # 2: Home
        await pg.evaluate("switchTab('home'); 1"); await pg.wait_for_timeout(300)
        check(await pg.evaluate("!!document.querySelector('.home-grid .home-play') && document.querySelectorAll('.home-grid .home-tile').length===5"), 'Home should have a Play hero + 4 tiles')
        await pg.click('#settingsBtn'); await pg.wait_for_timeout(150)
        links = await pg.evaluate("[...document.querySelectorAll('#settingsLinks button')].map(b=>b.textContent)")
        check(any('Workshop' in l for l in links), 'Settings should link to the Workshop')
        await pg.click('#settingsBtn')
        await pg.click('#homeCommunityBtn'); await pg.wait_for_timeout(150)
        check(await pg.evaluate("!document.getElementById('homeCommunityMenu').hidden"), 'Community menu should open')
        # 3: card levels
        await pg.evaluate("myCardLevels['bee-drone']=3; switchTab('codex'); 1"); await pg.wait_for_timeout(300)
        check(await pg.evaluate("[...document.querySelectorAll('#codexGrid .levelbadge')].every(e=> getComputedStyle(e).display==='none')"), 'card levels should be hidden in the Codex')
        await pg.evaluate("unlockCardForPlayer('bee-drone','test'); switchTab('nest'); 1"); await pg.wait_for_timeout(300)
        check(await pg.evaluate("[...document.querySelectorAll('#nestGrid .levelbadge')].some(e=> getComputedStyle(e).display!=='none')"), 'card levels should show in the Nest')
        await pg.evaluate("switchTab('deck'); 1"); await pg.wait_for_timeout(300)
        if await pg.query_selector('#deckLevelFilter'):
            await pg.select_option('#deckLevelFilter', '3'); await pg.wait_for_timeout(200)
            check(await pg.evaluate("document.getElementById('myDeckPool').classList.contains('show-levels')"), 'deck pool should show levels when the level filter is on')
        # 4: pack opening
        await pg.evaluate("isSignedIn = ()=>true; myCurrencies.gold=1000; myCurrencies.gems=100; switchTab('shop'); 1"); await pg.wait_for_timeout(300)
        before = await pg.evaluate("Object.values(myCardCopies).reduce((t,c)=> t+c.length, 0)")
        check(await pg.query_selector('[data-buypack="silver"]') is None and await pg.query_selector('[data-buypack="gold"]') is None, 'only the Sprout Pouch should be on sale (D14)')
        await pg.click('[data-buypack="bronze"]'); await pg.wait_for_timeout(500)
        await pg.click('#poSkip'); await pg.wait_for_timeout(500)
        check(await pg.evaluate("document.querySelectorAll('.po-card.is-flipped').length") == 3, 'the Sprout Pouch should reveal 3 cards')
        after = await pg.evaluate("Object.values(myCardCopies).reduce((t,c)=> t+c.length, 0)")
        check(after - before == 3, f'pack should add 3 copies (added {after-before})')
        await pg.click('#poDone')
        # 4b: Forge — temper a card: the smithing sequence plays, the level goes up once, currency is spent
        await pg.evaluate("myCurrencies.dust=300; myCurrencies.gold=400; codexSubTab='forge'; switchTab('codex'); 1"); await pg.wait_for_timeout(300)
        fid = await pg.evaluate("document.querySelector('#forgePool .card-tile').dataset.defid")
        await pg.click(f'#forgePool .card-tile[data-defid="{fid}"]'); await pg.wait_for_timeout(200)
        l0 = await pg.evaluate(f"getCardLevel('{fid}')")
        await pg.click('#forgeLevelUpBtn'); await pg.click('#forgeLevelUpBtn', force=True); await pg.wait_for_timeout(3200)
        check(await pg.evaluate(f"getCardLevel('{fid}')") == l0 + 1, 'tempering should raise the level exactly once (double-click guarded)')
        check(await pg.evaluate("myCurrencies.dust < 300"), 'tempering should spend Magic Dust')
        # 5: raid trench, played
        await pg.evaluate("playSubTab='raid'; switchTab('play'); 1"); await pg.wait_for_timeout(500)
        n0 = await pg.evaluate("loadRaidPartAttempts().length")
        await pg.click('[data-raid-part="left"]'); await pg.wait_for_timeout(300)
        await pg.click('[data-row="0"]'); await pg.wait_for_timeout(300)
        played = 0
        for _ in range(16):
            if await pg.evaluate("!!document.querySelector('.tr-result')"): break
            hc = await pg.query_selector('.tm-hand-card.playable')
            if hc:
                await hc.click(); await pg.wait_for_timeout(80)
                slot = await pg.query_selector('.tr-cell.is-legal')
                if slot: await slot.click(); played += 1
            await pg.click('#tmEnd'); await pg.wait_for_timeout(1700)
        check(await pg.evaluate("!!document.querySelector('.tr-result')"), 'the trench fight should reach a result')
        check(played > 0, 'never played a card in the trench')
        check(await pg.evaluate("loadRaidPartAttempts().length") == n0 + 1, 'the trench attempt should be recorded exactly once')
        await pg.click('#trDone')
        # 6: Conquest world panning
        await pg.evaluate("(()=>{ const pr=loadConquestProgress(); CONQUEST_MAPS.slice(0,2).forEach(m=> m.nodes.forEach(n=>{ const id=conquestNodeId(m.id,n.key); if(!pr.completed.includes(id)) pr.completed.push(id); })); saveConquestProgress(pr); conquestSelectedMap='m1'; playSubTab='conquest'; switchTab('play'); return 1; })()")
        await pg.wait_for_timeout(500)
        edge = await pg.query_selector('.world-edge-right[data-world-go]')
        check(edge is not None, 'the next map should peek in at the right edge')
        if edge:
            await edge.click(); await pg.wait_for_timeout(600)
            check(await pg.evaluate("conquestSelectedMap") == 'm2', 'the edge should pan to the next map')
        # 6b: D13 world atlas — compass diamonds, lazy cards, click zooms into a map
        await pg.click('#conquestWorldBtn'); await pg.wait_for_timeout(500)
        check(await pg.evaluate("document.querySelectorAll('.world-diamond').length") == await pg.evaluate("CONQUEST_MAPS.length"), 'the world view should show one diamond per map')
        check(await pg.evaluate("[...document.querySelectorAll('[data-lazy]')].some(e=> !e.dataset.filled)"), 'world cards far down should load lazily')
        await pg.click('[data-world-map="m1"]'); await pg.wait_for_timeout(600)
        check(await pg.evaluate("conquestSelectedMap==='m1' && !conquestWorldView && !!document.getElementById('conquestCanvas')"), 'a world diamond should zoom into its map')
        # 6c: T3 fight sessions — a server seed is fetched on node select, used for the fight, moves are
        # recorded, and the fight is handed in once (mocked server)
        await pg.evaluate("""(()=>{ window.__rpcCalls = []; const real = window.sbClient; window.__realSb = real;
          sbClient = {rpc: async (fn, args)=>{ __rpcCalls.push([fn, args]); if(fn==='start_fight') return {data:[{session_id:'s-1', seed: 424242}], error:null}; if(fn==='submit_fight') return {data:'accepted', error:null}; return {data:null, error:null}; }};
          isSignedIn = ()=> true; return 1; })()""")
        await pg.evaluate("(async()=>{ const m=CONQUEST_MAPS[0]; const n=m.nodes.find(n=>n.kind==='skirmish'); await prefetchFightTicket('conquest', m.id+':'+n.key); startConquestMatch(m.id, n.key, {skipEnergyCost:true}); return 1; })()")
        await pg.wait_for_timeout(500)
        check(await pg.evaluate("currentMatchSeed===424242 && matchState.fightSession==='s-1'"), 'the conquest fight should use the server-issued seed')
        await pg.evaluate("(async()=>{ const me=matchState.players[1]; const h=me.hand.find(x=> matchState.engine.canPlay(me, x.defId, x.uid)); if(h) await playCardByUid(h.uid,'left'); else await skipTurn(); })()")
        await pg.wait_for_timeout(300)
        check(await pg.evaluate("matchState.transcript.length>=1"), 'player moves should be recorded in the transcript')
        await pg.evaluate("(async()=>{ matchState.over=true; matchState.winner=2; await handInFight(matchState); await handInFight(matchState); })()")
        await pg.wait_for_timeout(200)
        check(await pg.evaluate("__rpcCalls.filter(c=>c[0]==='submit_fight').length===1"), 'a fight should be handed in exactly once')
        await pg.evaluate("matchState=null; endMatch && 1")
        await pg.evaluate("playSubTab='arena'; switchTab('play'); 1")
        # 7: recent opponents
        await pg.evaluate("playSubTab='arena'; switchTab('play'); 1"); await pg.wait_for_timeout(400)
        await pg.click('[data-ro-view="0"]'); await pg.wait_for_timeout(300)
        check(await pg.evaluate("document.querySelectorAll('.ro-deck-card').length") == 2, "the recent opponent's deck should open")
        # 7b: the tutorial is winnable for every side pick (2026-10-07 playtest: Otters lost ~9 in 10)
        tut = await pg.evaluate("""(()=>{ const out = {}, defs = getCardDefs();
          for(const pick of ['otters','hummingbirds','both']){ let w = 0, fixedWin = false;
            const myD = tutorialStagePlayerDeck(1, pick), rvD = tutorialStageOpponentDeck(1, pick);
            for(let i=0;i<60;i++){ const seed = i===0 ? TUTORIAL_SEED : 9100+i;
              const engine = makeSimEngine(defs, seededRng(seed), {recordEvents:false, battleMode:'gravity'}); const sideOf = id=> id===1?'A':'B', st = {};
              const P = {1: engine.newPlayer(1, myD, Object.assign({}, CHARACTER_DEFS.castle, {health: TUTORIAL_CFG_DEFAULT.myHp})), 2: engine.newPlayer(2, rvD, Object.assign({}, CHARACTER_DEFS.castle, {health: TUTORIAL_CFG_DEFAULT.rivalHp}))};
              engine.draw(P[1],3,'A',st,null); engine.draw(P[2],3,'B',st,null); let over = false;
              for(let r=1; r<=40 && !over; r++){ engine.setSuddenDeath(r>=20); [1,2].forEach(k=>{ P[k].playedThisTurn=false; P[k].discardUsedThisTurn=false; });
                engine.aiTakeTurn(P,sideOf,1,st,null); engine.aiTakeTurn(P,sideOf,2,st,null); over = engine.resolveCombat(P,sideOf,st,null, r%2===0?1:2); if(over) break; engine.draw(P[1],1,'A',st,null); engine.draw(P[2],1,'B',st,null); }
              const won = over && P[2].hq.hp<=0 && P[1].hq.hp>0; if(won) w++; if(i===0) fixedWin = won; }
            out[pick] = [Math.round(w/60*100), fixedWin]; }
          return out; })()""")
        for pick, (pct, fixed_win) in tut.items():
            check(pct >= 70 and fixed_win, f'tutorial as {pick}: {pct}% simulated wins, fixed seed win={fixed_win} (want 70%+ and a fixed-seed win)')
        # 8: Autobattler fight replay: draft a run, fight once, watch it step by step
        await pg.evaluate("""(()=>{ const d = getCardDefs(); const run = AutoB.newRun(4242, Date.now());
          while(run.phase==='draft'){ const o = AutoB.draftOffers(d, CHARACTER_DEFS, run); AutoB.applyDraftPick(run, o.options[0]); }
          saveAbRun(run); playSubTab='autobattle'; switchTab('play'); return 1; })()"""); await pg.wait_for_timeout(500)
        await pg.evaluate("document.getElementById('abFightBtn').click(); 1"); await pg.wait_for_timeout(500)
        await pg.evaluate("document.getElementById('abWatchBtn').click(); 1"); await pg.wait_for_timeout(300)
        check(await pg.evaluate("document.querySelectorAll('.fight-replay .rp-card').length > 0"), 'the fight replay should show cards')
        await pg.evaluate("document.getElementById('rpPlay').click(); 1"); await pg.evaluate("const s = document.getElementById('rpScrub'); s.value = s.max; s.dispatchEvent(new Event('input')); 1"); await pg.wait_for_timeout(200)
        check(await pg.evaluate("!!document.querySelector('.fight-replay .rp-outcome')"), 'the replay should end on the outcome')
        await pg.evaluate("document.getElementById('fightReplayOverlay').dispatchEvent(new KeyboardEvent('keydown', {key:'Escape', bubbles:true})); 1"); await pg.wait_for_timeout(100)
        check(await pg.evaluate("document.getElementById('fightReplayOverlay').hidden"), 'Escape should close the replay')
        await pg.evaluate("saveAbRun(null); abLastFight=null; 1")
        check(not errs, f'page errors in feature checks: {errs[:3]}')
        await b.close()
        # 9: T7 shader layers (software WebGL): splash, Home and a Conquest map mount and render
        b = await p.chromium.launch(executable_path=EXE, args=['--enable-unsafe-swiftshader', '--use-angle=swiftshader'])
        pg = await b.new_page(viewport={'width': 1024, 'height': 700}); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if '[shaders]' in m.text else None)
        await pg.add_init_script("localStorage.setItem('bramblewood_shaders_v1','on')")
        await pg.goto(URL); await pg.wait_for_timeout(1500)
        if await pg.evaluate("BramblewoodShaders.isSupported()"):
            check(await pg.evaluate("!!document.querySelector('#splashScreen .entrance-bg.has-shader canvas.bw-shader')"), 'the splash should get a shader layer')
            await pg.evaluate("localStorage.setItem('bramblewood_arena_tutorial_done','1'); document.getElementById('splashScreen').hidden=true; switchTab('home'); 1"); await pg.wait_for_timeout(600)
            check(await pg.evaluate("!!document.querySelector('#view-home .hs-back canvas.bw-shader')"), 'Home should get a shader layer')
            await pg.evaluate("playSubTab='conquest'; switchTab('play'); 1"); await pg.wait_for_timeout(600)
            check(await pg.evaluate("!!document.querySelector('#conquestCanvas > canvas.bw-shader-map')"), 'the Conquest map should get a shader overlay')
            await pg.evaluate("setShadersEnabled(false); 1"); await pg.wait_for_timeout(100)
            check(await pg.evaluate("BramblewoodShaders._layers.size === 0 && !document.querySelector('canvas.bw-shader')"), 'turning shaders off should remove every layer')
        else: print('  (no WebGL here; shader check skipped)')
        check(not errs, f'shader errors: {errs[:3]}')
        await b.close()
    print(f'ui-smoke: {len(failures)} failure(s)')
    sys.exit(1 if failures else 0)

asyncio.run(main())
