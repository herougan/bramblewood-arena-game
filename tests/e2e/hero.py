#!/usr/bin/env python3
"""Hero card (2026-10-05): create a Hero, level it, spend points, pick a skill, craft Materia,
put it in the deck, win a Conquest skirmish and check XP arrives; the Hero never leaves the device.
    python3 tests/e2e/hero.py [--shots DIR]
"""
import asyncio, os, sys
from playwright.async_api import async_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
EXE = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
SHOTS = sys.argv[sys.argv.index('--shots')+1] if '--shots' in sys.argv else None
async def main():
    bad = []
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=EXE)
        for vw in ([(1280, 860, 'desk'), (390, 844, 'phone')] if SHOTS else [(1280, 860, 'desk')]):
            pg = await b.new_page(viewport={'width':vw[0], 'height':vw[1]}); errs = []
            pg.on('pageerror', lambda e: errs.append(str(e)))
            await pg.add_init_script("localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1');")
            await pg.goto('file://' + os.path.join(ROOT, 'index.html')); await pg.wait_for_timeout(1300)
            await pg.evaluate("FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); switchTab('deck'); 1"); await pg.wait_for_timeout(500)
            if not await pg.query_selector('#deckHeroBtn'): bad.append('no 🦸 Hero button on the deck screen'); await pg.close(); continue
            await pg.click('#deckHeroBtn'); await pg.wait_for_timeout(500)
            if SHOTS: await pg.screenshot(path=f'{SHOTS}/hero_create_{vw[2]}.png', full_page=False)
            await pg.click('[data-people="tribes"]'); await pg.wait_for_timeout(200)
            await pg.fill('#heroNameInput', 'Quill'); await pg.click('#heroCreateBtn'); await pg.wait_for_timeout(500)
            if not await pg.evaluate("!!myHero && myHero.name==='Quill' && myHero.people==='tribes'"): bad.append('hero not created')
            # level up to 12: 5 skill slot opens, points to spend
            await pg.evaluate("heroGainXp(600, 'test'); renderDeckSection(); 1"); await pg.wait_for_timeout(400)
            L = await pg.evaluate("heroLevelFromXp(myHero.xp).level")
            if L < 5: bad.append(f'level after XP grant only {L}')
            free0 = await pg.evaluate("heroPointsFree(myHero)")
            await pg.click('[data-hstat="atk"][data-dir="1"]'); await pg.wait_for_timeout(250)
            free1 = await pg.evaluate("heroPointsFree(myHero)")
            if free0 - free1 != 5: bad.append(f'attack point cost {free0-free1}, expected 5')
            atk = await pg.evaluate("getCardDefs().hero.attack")
            if atk != 4: bad.append(f'hero attack {atk}, expected 3+1')
            pick = await pg.query_selector('[data-hpick="5"]')
            if not pick: bad.append('no Lv5 skill offer')
            else:
                await pick.click(); await pg.wait_for_timeout(300)
                if not await pg.evaluate("Object.keys(getCardDefs().hero.effects||{}).length>0"): bad.append('picked skill not on the card')
            await pg.evaluate("myCurrencies.dust=60; renderDeckSection(); 1"); await pg.wait_for_timeout(200)
            xp0 = await pg.evaluate("myHero.xp"); await pg.click('#heroCraftBtn'); await pg.wait_for_timeout(300)
            if await pg.evaluate("myHero.xp") - xp0 != 30: bad.append('materia craft did not give 30 XP')
            if await pg.evaluate("Object.values(myHero.materia).reduce((a,b)=>a+b,0)") != 1: bad.append('no materia crystal')
            await pg.click('#heroDeckBtn'); await pg.wait_for_timeout(300)
            if not await pg.evaluate("myDeckCounts.hero===1"): bad.append('hero not added to deck')
            # the Hero takes a slot: drop one other card so the deck is legal again
            await pg.evaluate("(()=>{ if(deckTotal(myDeckCounts)>DECK_SIZE){ const k=Object.keys(myDeckCounts).find(k=> k!=='hero' && myDeckCounts[k]>0); myDeckCounts[k]--; if(!myDeckCounts[k]) delete myDeckCounts[k]; saveMyDeck(); } deckHeroView=true; renderDeckSection(); return 1; })()"); await pg.wait_for_timeout(300)
            if SHOTS:
                await pg.screenshot(path=f'{SHOTS}/hero_hall_{vw[2]}.png', full_page=True)
            if await pg.evaluate("'hero' in publicDeck(myDeckCounts)"): bad.append('publicDeck leaks the hero')
            if vw[2] == 'desk':
                xp1 = await pg.evaluate("myHero.xp")
                await pg.evaluate("(()=>{const m=CONQUEST_MAPS[0]; const n=m.nodes.find(n=>n.kind==='skirmish'); conquestSelectedMap=m.id; playSubTab='conquest'; switchTab('play'); startConquestMatch(m.id,n.key); return 1;})()")
                await pg.wait_for_timeout(900)
                if not await pg.evaluate("[...matchState.players[1].deck, ...matchState.players[1].hand, ...(matchState.players[1].discard||[])].some(c=> (c&&c.defId||c)==='hero')"): bad.append('hero not in the match deck')
                await pg.evaluate("matchState.players[2].hq.hp=1; 1")
                for _ in range(80):
                    if await pg.evaluate("!!document.getElementById('wlQuitBtn')"): break
                    await pg.evaluate("(async()=>{ const m=matchState; if(!m||m.over||m.resolving) return; const me=m.players[1]; const h=me.hand.find(x=> m.engine.canPlay(me,x.defId,x.uid)); if(h) await playCardByUid(h.uid,'left'); else await skipTurn(); })()")
                    await pg.wait_for_timeout(350)
                await pg.wait_for_timeout(800)
                gained = await pg.evaluate("myHero.xp") - xp1
                if gained < 10: bad.append(f'no battle XP (gained {gained})')
                print(f'  battle XP gained: {gained}, winner {await pg.evaluate("matchState && matchState.winner")}')
            if errs: bad.append(f'{vw[2]} page errors: ' + '; '.join(errs[:3]))
            await pg.close()
        await b.close()
    for x in bad: print('  FAIL', x)
    print(f'hero: {len(bad)} failure(s)'); sys.exit(1 if bad else 0)
asyncio.run(main())
