#!/usr/bin/env python3
"""2026-10-14: rarity lesson, limit-break duplicate board, crafting needs a held card.

    python3 tests/e2e/rarity_limit_craft.py [screenshot.png]

  1. limit break needs N lifetime duplicates by rarity (user: "Common - needs 10 ... Divine and above - 3");
  2. the lifetime counter seeds from (copies - 1) + duplicates fed on an old save, rises on every duplicate, and spending
     copies never lowers it;
  3. the Forge shows the pill board ("7/10 duplicates");
  4. crafting needs myUnlockedCardIds (held), not just seen; admin keeps its bypass;
  5. the rarity lesson plays once in the Codex with >50 held cards and one Very Rare or above.
Exit code 1 on any failure.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ui_smoke.py')).read()
_g = {'os': os, '__file__': os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ui_smoke.py')}
exec(_src[_src.index('HERE ='):_src.index('TABS =')], _g)  # reuse URL, EXE and INIT from the UI smoke test
URL, EXE, INIT = _g['URL'], _g['EXE'], _g['INIT']

failures = []
def check(cond, msg):
    if not cond: failures.append(msg); print('  FAIL', msg)

OLD_SAVE = ("localStorage.setItem('bramblewood_arena_card_copies', JSON.stringify({'forager-ant':[{foil:false},{foil:false},{foil:false}], 'yeti':[{foil:false}]}));"
            "localStorage.setItem('bramblewood_arena_unlocked', JSON.stringify(['forager-ant','yeti']));"
            "localStorage.setItem('bramblewood_dups_fed_v1', JSON.stringify({'forager-ant':2, 'yeti':1}));")

async def main():
    shot = sys.argv[1] if len(sys.argv) > 1 else None
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=EXE)
        pg = await b.new_page(viewport={'width': 1366, 'height': 900})
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.add_init_script(INIT + "if(!sessionStorage.getItem('rlc_once')){ sessionStorage.setItem('rlc_once','1');" + OLD_SAVE + "}")
        await pg.goto(URL); await pg.wait_for_timeout(1500)

        # 1: thresholds
        need = await pg.evaluate("""Object.fromEntries(RARITY_DEFS.map(r=> [r.key, limitBreakDupsNeeded({rarity:r.key})]))""")
        want = {'starter':10,'common':10,'uncommon':9,'quest':9,'rare':8,'special':8,'eventrare':8,'veryrare':8,'superrare':8,'epic':7,'heroic':7,
                'unique':6,'questunique':5,'legendary':5,'devlegendary':5,'eventlegendary':5,'mythic':5,'ancient':4,'devancient':4,'divine':3,'void':3,'daemonic':3}
        check(need == want, f'limit-break thresholds by rarity: {need}')

        # 2: seeding and counting
        check(await pg.evaluate("lifetimeDuplicates('forager-ant')") == 4, 'seed: 3 copies (2 spare) + 2 fed = 4')
        check(await pg.evaluate("lifetimeDuplicates('yeti')") == 1, 'seed: 1 copy (0 spare) + 1 fed = 1')
        check(await pg.evaluate("unlockCardForPlayer('yeti','test'); lifetimeDuplicates('yeti')") == 2, 'a new duplicate adds one')
        check(await pg.evaluate("spendCopies('forager-ant', 2); lifetimeDuplicates('forager-ant')") == 4, 'spending copies never lowers the lifetime count')
        check(await pg.evaluate("JSON.parse(localStorage.getItem(CARD_DUPS_LIFETIME_KEY))['yeti']") == 2, 'the lifetime count is saved')
        fresh = await pg.evaluate("""(()=>{ const id = Object.keys(getCardDefs()).find(k=> { const d = getCardDefs()[k]; return !d.token && !d.test && !myUnlockedCardIds.has(k) && !(myCardCopies[k]||[]).length && (d.cost||0)===0 && !isUnattainable(d); });
          unlockCardForPlayer(id, 'test'); return lifetimeDuplicates(id); })()""")
        check(fresh == 0, 'the first copy of a card is not a duplicate')

        # limitBreakState: level 10 common, map gate skipped by admin-free reach override
        st = await pg.evaluate("""(()=>{ const id='forager-ant'; myCardLevels[id]=10; window.playerMapReach = ()=> 99; myCurrencies.dust = 1e6; myCurrencies.gold = 1e6;
          const a = limitBreakState(id); myCardDupsLifetime[id] = 10; const b = limitBreakState(id); myCardDupsLifetime[id] = 7; return [a.why, a.dupsNeed, b.ok, b.why]; })()""")
        check(st == ['dups', 10, True, 'cost'], f'limit break waits for the duplicates, then for the old cost: {st}')

        # 3: the board in the Forge
        await pg.evaluate("FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); forgeMode='upgrade'; forgeSelectedId='forager-ant'; codexSubTab='forge'; switchTab('codex'); 1"); await pg.wait_for_timeout(600)
        await pg.evaluate("forgeSelectedId='forager-ant'; renderForge(); 1"); await pg.wait_for_timeout(300)
        board = await pg.evaluate("""(()=>{ const b = document.querySelector('.forge-limit .lb-dups'); return b ? {on: b.querySelectorAll('.lb-dupboard i.on').length, all: b.querySelectorAll('.lb-dupboard i').length, label: b.querySelector('.lb-dups-label').textContent, tip: b.title} : null; })()""")
        check(board and board['on'] == 7 and board['all'] == 10 and board['label'] == '7/10 duplicates' and 'duplicates' in board['tip'], f'the Forge duplicate board: {board}')
        if shot and board:
            el = await pg.query_selector('.forge-limit')
            await el.scroll_into_view_if_needed(); await el.screenshot(path=shot)

        # 4: craft gating
        cg = await pg.evaluate("""(()=>{ const defs = getCardDefs(); const seen = Object.keys(defs).find(k=> !defs[k].token && !defs[k].test && defs[k].cardType!=='materia' && cardSourceOf(defs[k]).kind!=='smith' && !myUnlockedCardIds.has(k));
          seenCardIds().add(seen); const held = [...myUnlockedCardIds][0];
          const r = [craftNeedsHeld(seen), craftNeedsHeld(held), craftNeedsHeld('tempering-stone')];
          adminModeEnabled = true; r.push(craftNeedsHeld(seen)); adminModeEnabled = false;
          SMITH_RECIPES.push({out: seen, needs:{}, cost:{dust:0, gold:0}}); r.push(recipeReady(SMITH_RECIPES[SMITH_RECIPES.length-1]));
          smithSel = SMITH_RECIPES.length - 1; forgeMode = 'smith'; renderForge(); const btn = document.getElementById('smithCraftBtn');
          r.push(btn ? [btn.getAttribute('aria-disabled'), btn.title] : null); SMITH_RECIPES.pop(); smithSel = 0; return r; })()""")
        check(cg[:5] == [True, False, False, False, False], f'craft gate: seen-only blocked, held ok, materia ok, admin bypass: {cg[:5]}')
        check(cg[5] == ['true', 'You need to have held this card once to craft it.'], f'the Craft button for a seen-only card: {cg[5]}')

        # 5: rarity lesson
        await pg.evaluate("forgeMode='upgrade'; codexSubTab='browse'; switchTab('codex'); 1"); await pg.wait_for_timeout(1300)
        check(not await pg.evaluate("!!loadDialogueFlags()['lesson:rarity']"), 'no rarity lesson with a small collection')
        rl = await pg.evaluate("""(()=>{ const defs = getCardDefs(); const ids = Object.keys(defs).filter(k=> !defs[k].token && !defs[k].test && !defs[k].hero && defs[k].cardType!=='materia');
          const vr = ids.find(k=> RARITY_TIER_BANDS.indexOf(defs[k].rarity||'common') >= RARITY_TIER_BANDS.indexOf('veryrare'));
          ids.filter(k=> k!==vr && RARITY_TIER_BANDS.indexOf(defs[k].rarity||'common') < RARITY_TIER_BANDS.indexOf('veryrare')).slice(0, 60).forEach(k=> myUnlockedCardIds.add(k));
          const before = !!rarityLessonPick(); myUnlockedCardIds.add(vr); return [before, (rarityLessonPick()||{}).id === vr]; })()""")
        check(rl == [False, True], f'the lesson needs a Very Rare or above: {rl}')
        await pg.evaluate("switchTab('home'); switchTab('codex'); 1"); await pg.wait_for_timeout(2500)
        check(await pg.evaluate("!!loadDialogueFlags()['lesson:rarity']"), 'the rarity lesson should play in the Codex')
        txt = ''
        for _ in range(30):
            txt = await pg.evaluate("document.getElementById('dialogueDock') ? document.getElementById('dialogueDock').textContent : ''")
            if 'Common, Uncommon' in txt: break
            await pg.wait_for_timeout(500)
        check('rarity' in txt.lower() or 'Common, Uncommon' in txt, f'the lesson should be on screen: {txt[:120]}')
        check(not errs, f'page errors: {errs[:3]}')
        await b.close()
    print(f'rarity_limit_craft: {len(failures)} failure(s)')
    sys.exit(1 if failures else 0)

asyncio.run(main())
