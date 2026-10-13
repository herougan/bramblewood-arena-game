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
INIT = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_pitch_open_v1','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); localStorage.setItem('bramblewood_world_open_v1','1'); localStorage.setItem('bramblewood_arena_faction','otters'); localStorage.setItem('bramblewood_map_revealed_v1','[\"*\"]'); localStorage.setItem('bramblewood_dialogue_flags_v1', JSON.stringify({'lesson:lumber':true}));"
        "sessionStorage.setItem('bramblewood_seen_splash','1'); localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek']));"
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
        check(await pg.evaluate("currentTab==='ranking' && !document.getElementById('communityTabs').hidden"), 'Community should open the community page with its switcher')
        await pg.evaluate("switchTab('home'); 1"); await pg.wait_for_timeout(150)
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
        # 2026-10-12: every card starts unobtainable (the user is building the list); the test makes them obtainable again.
        await pg.evaluate("Object.keys(CARD_DEFS_BASELINE).forEach(id=>{ delete CARD_DEFS_BASELINE[id].unattainable; if(liveCards[id]) delete liveCards[id].unattainable; }); try{ invalidateCardDefs(); }catch(e){} 1")
        await pg.evaluate("isSignedIn = ()=>true; playerMapReach = ()=>12; myCurrencies.gold=1000; myCurrencies.gems=100; switchTab('shop'); 1"); await pg.wait_for_timeout(300)
        before = await pg.evaluate("Object.values(myCardCopies).reduce((t,c)=> t+c.length, 0)")
        # 2026-10-10: the Acorn Chest comes with the Ember Peddler (map 11); the Golden Bramble Case isn't on sale yet.
        # 2026-10-10: the shop is shelves now; an item on sale has no .is-off, and buy buttons live on the counter.
        silver_ok = await pg.evaluate("featureUnlocked('shop2')") == (await pg.query_selector('[data-shelfitem="silver:1"]:not(.is-off)') is not None)
        # 2026-10-12: the Golden Bramble Case comes with the Gilded Caravan (map 13).
        gold_ok = await pg.evaluate("featureUnlocked('shop3')") == (await pg.query_selector('[data-shelfitem="gold:1"]:not(.is-off)') is not None)
        check(silver_ok and gold_ok, 'the Acorn Chest should be on sale only with the Ember Peddler, the Golden Case only with the Gilded Caravan')
        await pg.click('[data-buypack="bronze"]:not([data-qty])'); await pg.wait_for_timeout(500)
        check(await pg.query_selector('#poSkip') is None, 'a single pack should have no Skip (sets only)')
        bx = await pg.locator('#poStrip').bounding_box(); y = bx['y'] + bx['height']/2
        await pg.mouse.move(bx['x'] + 8, y); await pg.mouse.down()
        for i in range(1, 16): await pg.mouse.move(bx['x'] + 8 + i*bx['width']/14, y); await pg.wait_for_timeout(16)
        await pg.mouse.up(); await pg.wait_for_timeout(1700)
        check(await pg.evaluate("document.querySelectorAll('.po2-card').length") == 3, 'tearing the pack should deal 3 face-down cards')
        for _ in range(6):
            await pg.evaluate("(()=>{ const c = document.querySelector('.po2-card.is-current'); if(c) c.click(); return 1; })()"); await pg.wait_for_timeout(900)
        check(await pg.evaluate("document.querySelectorAll('.po-card.is-flipped').length") == 3, 'the Sprout Pouch should reveal 3 cards')
        after = await pg.evaluate("Object.values(myCardCopies).reduce((t,c)=> t+c.length, 0)")
        check(after - before == 3, f'pack should add 3 copies (added {after-before})')
        await pg.evaluate("document.querySelector('[data-poview]').click(); 1"); await pg.wait_for_timeout(400)
        check(await pg.evaluate("!!document.querySelector('.card-inspect')"), 'tapping a card in the pack summary should open it large')
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(200)
        check(await pg.evaluate("!document.querySelector('.card-inspect') && !document.getElementById('packOpenOverlay').hidden"), 'Escape should close only the card viewer over the pack summary')
        await pg.click('#poDone'); await pg.wait_for_timeout(300)
        # 4a: a set of 10 offers Skip and Open all; Open all shows everything grouped
        # 2026-10-12: sets sit behind map gates now, and with 2+ packs on sale one shelf item asks how many (×1/×10 ...)
        await pg.evaluate("(()=>{ shopBundlesOpen = ()=> true; const o = packQtyOptions; packQtyOptions = p=> [...new Set([1, 10].concat(o(p)))].sort((a,b)=> a-b); renderShop(); return 1; })()"); await pg.wait_for_timeout(300)
        await pg.evaluate("(()=>{ const b = document.querySelector('[data-shelfitem=\"bronze:10\"]') || document.querySelector('[data-shelfitem=\"bronze:1\"]'); b.click(); const q = document.querySelector('[data-pq=\"10\"]'); if(q) q.click(); return 1; })()"); await pg.wait_for_timeout(300)
        await pg.click('[data-buypack="bronze"][data-qty="10"]'); await pg.wait_for_timeout(500)
        # 2026-10-08 Packs v3: 10+ packs lay out on a table to slash at once; Open all is still offered
        check(await pg.query_selector('#poTable') is not None and await pg.query_selector('#poOpenAll') is not None, 'a set of 10 packs should show the table with Open all')
        await pg.click('#poOpenAll'); await pg.wait_for_timeout(500)
        n_all = await pg.evaluate("[...document.querySelectorAll('.po2-all .po2-sum-card')].reduce((t,e)=> t + (parseInt((e.querySelector('.po2-x')||{}).textContent?.slice(1)) || 1), 0)")
        check(n_all == 30, f'Open all on 10 packs should show 30 cards (saw {n_all})')
        after2 = await pg.evaluate("Object.values(myCardCopies).reduce((t,c)=> t+c.length, 0)")
        check(after2 - after == 30, f'10 packs should add 30 copies (added {after2-after})')
        await pg.click('#poDone')
        # 4b: Forge — temper a card: the smithing sequence plays, the level goes up once, currency is spent
        await pg.evaluate("myCurrencies.dust=300; myCurrencies.gold=400; codexSubTab='forge'; switchTab('codex'); 1"); await pg.wait_for_timeout(300)
        # 2026-10-12: Level 0 cards are nurtured in the Nest, not tempered, so pick a card that is already Level 1+
        fid = await pg.evaluate("(()=>{ const t = [...document.querySelectorAll('#forgePool .card-tile')].find(e=> { const L = getCardLevel(e.dataset.defid); return L >= 1 && L < 3 && canAffordLevelUp(L, e.dataset.defid); }); return (t || document.querySelector('#forgePool .card-tile')).dataset.defid; })()")
        await pg.click(f'#forgePool .card-tile[data-defid="{fid}"]'); await pg.wait_for_timeout(200)
        l0 = await pg.evaluate(f"getCardLevel('{fid}')")
        await pg.click('#forgeLevelUpBtn'); await pg.click('#forgeLevelUpBtn', force=True); await pg.wait_for_timeout(3200)
        check(await pg.evaluate(f"getCardLevel('{fid}')") == l0 + 1, 'tempering should raise the level exactly once (double-click guarded)')
        check(await pg.evaluate("myCurrencies.dust < 300"), 'tempering should spend Magic Dust')
        # 5: a trench raid opens the full three-row battle (2026-10-12; the trench minigame is benched)
        await pg.evaluate("playSubTab='raid'; switchTab('play'); 1"); await pg.wait_for_timeout(500)
        await pg.click('[data-raid-part="left"]'); await pg.wait_for_timeout(2500)
        check(await pg.evaluate("!!(matchState && matchState.raidFull && matchState.engine.reserveRows===2)"), 'a trench raid should open the full three-row battle')
        check(await pg.evaluate("!!(matchState && matchState.players[2].reserve && Object.keys(matchState.players[2].reserve[0]).length>0)"), "the boss's middle row should be filled")
        await pg.evaluate("document.querySelectorAll('.vs-screen,#vsScreen,.vs-overlay').forEach(e=> e.remove()); matchState=null; switchTab('home'); 1"); await pg.wait_for_timeout(400)
        # 6: Conquest world panning
        await pg.evaluate("(()=>{ const pr=loadConquestProgress(); CONQUEST_MAPS.slice(0,2).forEach(m=> m.nodes.forEach(n=>{ const id=conquestNodeId(m.id,n.key); if(!pr.completed.includes(id)) pr.completed.push(id); })); saveConquestProgress(pr); conquestSelectedMap='m1'; playSubTab='conquest'; switchTab('play'); return 1; })()")
        await pg.wait_for_timeout(500)
        edge = await pg.query_selector('.world-edge-right[data-world-go]')
        check(edge is not None, 'the next map should peek in at the right edge')
        if edge:
            await edge.click(); await pg.wait_for_timeout(600)
            check(await pg.evaluate("conquestSelectedMap") == 'mf', 'the edge should pan to the next map (Thistlewood, Map 1 since the 16:23 map list)')
        # 6b: D13 world atlas — compass diamonds, lazy cards, click zooms into a map
        await pg.click('#conquestWorldBtn'); await pg.wait_for_timeout(500)
        check(await pg.evaluate("document.querySelectorAll('.world-diamond').length") == await pg.evaluate("mainConquestMaps().length"), 'the world view should show one diamond per main map (sub-maps hide)')
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
              for(let r=1; r<=40 && !over; r++){ engine.setSuddenDeath(r>=20, r>=30 ? 2 : 1); [1,2].forEach(k=>{ P[k].playedThisTurn=false; P[k].discardUsedThisTurn=false; });
                engine.aiTakeTurn(P,sideOf,1,st,null); engine.aiTakeTurn(P,sideOf,2,st,null); over = engine.resolveCombat(P,sideOf,st,null, r%2===0?1:2); if(over) break; engine.draw(P[1],1,'A',st,null); engine.draw(P[2],1,'B',st,null); }
              const won = over && P[2].hq.hp<=0 && P[1].hq.hp>0; if(won) w++; if(i===0) fixedWin = won; }
            out[pick] = [Math.round(w/60*100), fixedWin]; }
          return out; })()""")
        for pick, (pct, fixed_win) in tut.items():
            check(pct >= 70 and fixed_win, f'tutorial as {pick}: {pct}% simulated wins, fixed seed win={fixed_win} (want 70%+ and a fixed-seed win)')
        # 7c: Quit keeps a Conquest fight resumable; Home's Play tile becomes Rejoin (2026-10-08)
        await pg.evaluate("(()=>{ switchTab('play'); startConquestMatch('m1', CONQUEST_MAPS[0].nodes.find(n=> n.kind==='skirmish').key, {skipEnergyCost:true}); return 1; })()"); await pg.wait_for_timeout(1500)
        await pg.evaluate("document.querySelectorAll('.vs-opener,.vs-screen').forEach(e=>e.remove()); renderMatchUI(); document.getElementById('quitMatchBtn').click(); 1"); await pg.wait_for_timeout(600)
        check(await pg.evaluate("!!document.getElementById('homeRejoinBtn')"), 'after Quit, Home should offer Rejoin')
        await pg.evaluate("document.getElementById('homeRejoinBtn').click(); 1"); await pg.wait_for_timeout(800)
        check(await pg.evaluate("!!(matchState && matchState.mode==='conquest')"), 'Rejoin should bring the fight back')
        await pg.evaluate("endMatch(); 1")
        # 7d: Codex card inspector — opens large, turns about a tilted axis, Esc closes only the inspector (2026-10-08)
        await pg.evaluate("(()=>{ openCardDetail(Object.keys(getCardDefs()).find(k=> !getCardDefs()[k].token)); document.getElementById('cdInspectBtn').click(); return 1; })()"); await pg.wait_for_timeout(700)
        ci = await pg.evaluate("(()=>{ const s = document.querySelector('.card-inspect .ci-spin'); const r = s && s.getBoundingClientRect(); return s ? {tf: s.style.transform, w: r.width, back: !!document.querySelector('.ci-back')} : null; })()")
        check(ci and 'rotateY' in ci['tf'] and ci['w'] >= 280 and ci['back'], f'card inspector should show the card large with a back face and a 3D turn: {ci}')
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(200)
        check(await pg.evaluate("!document.querySelector('.card-inspect') && !document.getElementById('cardDetailOverlay').hidden"), 'Esc should close the inspector but leave the card detail open')
        await pg.evaluate("document.getElementById('cdCloseBtn').click(); 1")
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
            check(await pg.evaluate("!!document.querySelector('#conquestLayout > canvas.bw-shader-map')"), 'the Conquest map should get a shader overlay')
            await pg.evaluate("setShadersEnabled(false); 1"); await pg.wait_for_timeout(100)
            check(await pg.evaluate("BramblewoodShaders._layers.size === 0 && !document.querySelector('canvas.bw-shader')"), 'turning shaders off should remove every layer')
        else: print('  (no WebGL here; shader check skipped)')
        check(not errs, f'shader errors: {errs[:3]}')
        # 2026-10-11: a spell from hand resolves and takes the turn; equipment straps onto a unit
        pg, errs = await new_page(b, 1366, 860)
        await pg.evaluate("""(()=>{const m=CONQUEST_MAPS[0]; const n=m.nodes.find(n=>n.kind==='skirmish'); conquestSelectedMap=m.id; playSubTab='conquest'; switchTab('play'); startConquestMatch(m.id,n.key,{skipEnergyCost:true,noOpener:true});
          const M=matchState; M.engine.debugSpawnCard(M.players, M.sideOf, 1, 'ent', 'left', {}, []); M.engine.allBoardCards(M.players[1])[0].wait=3;
          M.players[1].hand.unshift({uid:99901, defId:'tailwind'}); M.players[1].lumber=3; coachSeen.add('g-peek'); renderPlay(); return 1;})()""")
        await pg.wait_for_timeout(1000)
        await pg.evaluate("playCardByUid(99901, 'left'); 1"); await pg.wait_for_timeout(6000)
        st = await pg.evaluate("[matchState.engine.allBoardCards(matchState.players[1])[0].wait, matchState.round, matchState.log.some(e=> e.type==='spell')]")
        check(st[0] == 1 and st[1] == 2 and st[2], f'Tailwind should cut Wait by 1 and end the turn (wait, round, logged: {st})')
        await pg.evaluate("(()=>{ const M=matchState; M.players[1].playedThisTurn=false; M.players[1].lumber=3; M.players[1].hand.unshift({uid:99902, defId:'bramble-gauntlet'}); renderPlay(); return devilryDropOnto(M.engine.allBoardCards(M.players[1])[0].uid, 99902); })()")
        await pg.wait_for_timeout(500)
        check(await pg.evaluate("matchState.engine.allBoardCards(matchState.players[1])[0].equipment==='bramble-gauntlet'"), 'Bramble Gauntlet should equip onto the unit')
        check(not errs, f'spell/equipment errors: {errs[:3]}')
        # 2026-10-11 forge economy v2 + battle rating
        ec = await pg.evaluate("""(()=>{ const defs=getCardDefs(); const pick=r=> Object.keys(defs).find(k=> defs[k].rarity===r && !defs[k].test && !defs[k].token && cardSourceOf(defs[k]).kind==='pack');
          const c=pick('common'), e=pick('epic'); let castle=0; for(let L=0;L<20;L++) castle+=castleLevelUpCost(L,'castle').dust;
          myCardCopies[c]=[{},{},{}]; const before=forgeCreditOf(c).dust, fed=feedDuplicate(c);
          const mains=CONQUEST_MAPS.filter(m=>!m.sub&&!m.reserved);
          return {common:forgeSpentOn(c,10).dust, epicMult:levelCostMult(e), castle, fed:fed&&fed.dust, credit:forgeCreditOf(c).dust-before, copies:myCardCopies[c].length,
            map20:enemyDeckLevel(mains[20].nodes.find(n=>n.kind==='skirmish')), map1:enemyDeckLevel(mains[0].nodes.find(n=>n.kind==='skirmish')), max: Math.round(22*30*ratingLevelFactor(10))}; })()""")
        check(ec['common'] == 675 and ec['epicMult'] == 11 and ec['castle'] == 2760, f'forge prices: {ec}')
        check(ec['fed'] == 36 and ec['credit'] == 36 and ec['copies'] == 2, f'feeding a duplicate: {ec}')
        check(40 <= ec['map20'] <= 600 and ec['map1'] < 40 and 2400 <= ec['max'] <= 2600, f'battle rating scale: {ec}')
        await b.close()
    print(f'ui-smoke: {len(failures)} failure(s)')
    sys.exit(1 if failures else 0)

asyncio.run(main())
