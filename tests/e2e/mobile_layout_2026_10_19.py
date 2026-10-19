#!/usr/bin/env python3
"""Mobile battle layout (package MB2, 2026-10-19) — real game page in headless Chromium.

    python3 tests/e2e/mobile_layout_2026_10_19.py            # about a minute
    MB2_SHOTS=docs/screens/mb2 python3 tests/e2e/mobile_layout_2026_10_19.py   # also saves screenshots

Owner on an iPhone (2026-10-19 10:55): the raid board was tiny in a big empty field, the normal board sat high, the hand was
smaller than the field's cards and cut off behind Safari's toolbar, and touch-and-hold didn't open a card's details.
At 390x844 (mobile emulation: touch, isMobile) and 1366x768, for a normal fight and a raid:
  1. no sideways scroll; on a phone and in a raid the match is one screen tall (no page scroll);
  2. every hand card is fully on screen; on a phone the hand cards are the board's card size;
  3. the raid's cards are bigger than before (390: 44 px wide, 1366: 48 px on screen) and every one sits inside the frame;
  4. on a phone the normal board is centred in the battlefield;
  5. touch-and-hold (CDP touch events) on a hand card and in the Codex opens the card's details, doesn't arm or open the
     card, and a tap on the held details opens the full card page.
Not in tests/run-all.sh (a browser run); see docs/CHANGELOG.md. Exit code 1 on any failure.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
URL = 'file://' + os.path.join(ROOT, 'index.html')
EXE = os.environ.get('BW_CHROMIUM', '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell')
SHOTS = os.environ.get('MB2_SHOTS')
INIT = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_pitch_open_v1','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); localStorage.setItem('bramblewood_world_open_v1','1'); localStorage.setItem('bramblewood_arena_faction','otters'); localStorage.setItem('bramblewood_map_revealed_v1','[\"*\"]'); localStorage.setItem('bramblewood_dialogue_flags_v1', JSON.stringify({'lesson:lumber':true}));"
        "sessionStorage.setItem('bramblewood_seen_splash','1'); localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek']));")
BATTLE = "(()=>{const m=CONQUEST_MAPS[0]; const n=m.nodes.find(n=>n.kind==='skirmish'); conquestSelectedMap=m.id; playSubTab='conquest'; switchTab('play'); startConquestMatch(m.id,n.key,{skipEnergyCost:true,noOpener:true}); return 1;})()"
PLAY_ONE = "(async()=>{ const m=matchState; if(!m||m.over||m.resolving) return; const me=m.players[1]; const h=me.hand.find(x=> m.engine.canPlay(me,x.defId,x.uid)); if(h) await playCardByUid(h.uid,'left'); else await skipTurn(); })()"
LAYOUT = """(()=>{
  const R = e=> e ? e.getBoundingClientRect() : null;
  const bf = document.getElementById('battlefieldEl'), inner = document.getElementById('battlefieldInner');
  // cards still flying in (.is-entering) are mid-animation: their size isn't the board's yet
  const cards = [...inner.querySelectorAll('.board-card[data-uid]')].filter(e=> !e.classList.contains('empty-slot') && !e.classList.contains('is-entering') && e.offsetWidth > 0);
  const handEls = [...document.querySelectorAll('#handStrip .card-tile')], hand = handEls.map(R);
  const b = R(bf), cs = getComputedStyle(bf), pt = parseFloat(cs.paddingTop)||0, pb = parseFloat(cs.paddingBottom)||0;
  const rows = [...inner.querySelectorAll(':scope > .board-row')].map(R);
  const top = Math.min(...rows.map(r=> r.top)), bot = Math.max(...rows.map(r=> r.bottom));
  return {sw: document.documentElement.scrollWidth, sh: document.documentElement.scrollHeight, iw: innerWidth, ih: innerHeight,
    hand: hand.map((r, i)=> [r.left, r.top, r.right, r.bottom, handEls[i].offsetWidth]), // the laid-out width: a card being dealt is still scaled
    bfCardW: parseFloat(getComputedStyle(bf).getPropertyValue('--match-card-w')),
    cards: cards.map(e=>{ const r = R(e); return [r.left, r.top, r.right, r.bottom, r.width]; }),
    frame: [b.left, b.top + pt, b.right, b.bottom - pb], boardMid: (top + bot)/2, frameMid: (b.top + pt + b.bottom - pb)/2};
})()"""
failures = []
def check(cond, msg):
    if not cond: failures.append(msg); print('  FAIL', msg)
    return cond

async def touch_hold(pg, cdp, x, y, ms=650):
    await cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': x, 'y': y}]})
    await pg.wait_for_timeout(ms)
    await cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
    await pg.wait_for_timeout(250)

async def open_page(b, w, h, phone):
    ctx = await b.new_context(viewport={'width': w, 'height': h}, has_touch=phone, is_mobile=phone, device_scale_factor=2 if phone else 1)
    pg = await ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('dialog', lambda d: asyncio.ensure_future(d.accept()))
    await pg.add_init_script(INIT)
    await pg.goto(URL); await pg.wait_for_timeout(1500)
    # coach tips would cover the board in the screenshots
    await pg.evaluate("FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); myCurrencies.energy = 60; window.showCoachTip = function(){}; 1")
    return ctx, pg, errs

async def layout_checks(pg, tag, phone, raid):
    # headless Chromium's idle mouse sits at (0,0), over the enemy castle: its hover details are not part of the layout
    await pg.evaluate("window.hideCardPop && hideCardPop(); 1")
    L = await pg.evaluate(LAYOUT)
    check(L['sw'] <= L['iw'] + 1, f'{tag}: sideways scroll ({L["sw"]} > {L["iw"]})')
    if phone or raid: check(L['sh'] <= L['ih'] + 2, f'{tag}: the match should be one screen tall (page {L["sh"]} > {L["ih"]})')
    check(len(L['hand']) > 0, f'{tag}: no hand cards')
    for r in L['hand']:
        check(r[1] >= -1 and r[3] <= L['ih'] + 1 and r[0] >= -1 and r[2] <= L['iw'] + 1, f'{tag}: a hand card is off screen {r}');
    if phone and L['hand'] and not raid:
        check(abs(L['hand'][0][4] - L['bfCardW']) <= 1.5, f'{tag}: hand card {L["hand"][0][4]:.1f}px should be the board card size {L["bfCardW"]}px')
    if raid:
        ws = [c[4] for c in L['cards']]
        need = 47 if phone else 55
        check(ws and min(ws) >= need * .966 - 1, f'{tag}: raid cards should be at least {need}px wide (got {min(ws) if ws else None})')
        f = L['frame']
        for c in L['cards']: check(c[0] >= f[0] - 2 and c[2] <= f[2] + 2 and c[1] >= f[1] - 30 and c[3] <= f[3] + 30, f'{tag}: a raid card is outside the frame {c} vs {f}')
        # the hand follows the raid board's size (never under 52 px wide on a phone)
        if phone and L['hand'] and ws: check(max(ws) - 2 <= L['hand'][0][4] <= max(52, max(ws)) + 3, f'{tag}: the hand ({L["hand"][0][4]:.0f}px) should match the raid board cards ({max(ws):.0f}px)')
    if phone and not raid:
        check(abs(L['boardMid'] - L['frameMid']) <= 14, f'{tag}: the board should be centred in the battlefield (board {L["boardMid"]:.0f}, frame {L["frameMid"]:.0f})')
    return L

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=EXE)
        for (w, h, phone) in [(390, 844, True), (1366, 768, False)]:
            # a normal fight
            ctx, pg, errs = await open_page(b, w, h, phone)
            await pg.evaluate(BATTLE); await pg.wait_for_timeout(2500)
            for _ in range(2): await pg.evaluate(PLAY_ONE); await pg.wait_for_timeout(2200)
            await pg.wait_for_timeout(1200)
            await layout_checks(pg, f'battle@{w}', phone, False)
            if SHOTS: await pg.screenshot(path=os.path.join(ROOT, SHOTS, f'after-battle-{w}.png'))
            if phone:
                # touch-and-hold a hand card: its details open, it isn't armed, and the lift doesn't play it
                cdp = await ctx.new_cdp_session(pg)
                await pg.evaluate("window.hideCardPop && hideCardPop(); if(matchState) matchState.selectedUid = null; 1")
                r = await pg.evaluate("(()=>{ const e = document.querySelector('#handStrip .card-tile'); const b = e.getBoundingClientRect(); return [b.left + Math.min(20, b.width/3), b.top + b.height/2, matchState.players[1].hand.length]; })()")
                await touch_hold(pg, cdp, r[0], r[1])
                st = await pg.evaluate("[!document.getElementById('cardPop').hidden, matchState.selectedUid, matchState.players[1].hand.length]")
                check(st[0], 'battle@390: touch-and-hold on a hand card should open its details')
                check(st[1] is None and st[2] == r[2], f'battle@390: the hold should not arm or play the card (selected {st[1]}, hand {r[2]}->{st[2]})')
                if SHOTS: await pg.screenshot(path=os.path.join(ROOT, SHOTS, 'after-hold-hand-390.png'))
            check(not errs, f'battle@{w}: page errors {errs[:3]}')
            await ctx.close()
            # a raid fight (the Raid tab's hub, the first raid, the left part)
            ctx, pg, errs = await open_page(b, w, h, phone)
            await pg.evaluate("playSubTab='raid'; switchTab('play'); 1"); await pg.wait_for_timeout(500)
            await pg.evaluate("document.querySelector('.raid-hub [data-raid-open]').click()"); await pg.wait_for_timeout(500)
            await pg.evaluate("document.querySelector('[data-raid-part=left]').click()"); await pg.wait_for_timeout(5000)
            if check(await pg.evaluate("!!(matchState && matchState.raidFull)"), f'raid@{w}: the raid did not open'):
                await layout_checks(pg, f'raid@{w}', phone, True)
                # the attack lines and floats read card rects: a card's rect sits where the card is drawn (no stale zoom)
                tf = await pg.evaluate("document.getElementById('battlefieldInner').style.transform || ''")
                check('scale(0.' not in tf, f'raid@{w}: the raid board should fit without a zoom-out ({tf})')
                if SHOTS: await pg.screenshot(path=os.path.join(ROOT, SHOTS, f'after-raid-{w}.png'))
            check(not errs, f'raid@{w}: page errors {errs[:3]}')
            await ctx.close()
        # touch-and-hold in the Codex: details open, the card page doesn't (no tap); a tap on the details opens the card page
        ctx, pg, errs = await open_page(b, 390, 844, True)
        cdp = await ctx.new_cdp_session(pg)
        # a fresh profile's Codex shows only the cards it has seen: give it two
        await pg.evaluate("unlockCardForPlayer('bee-drone','test'); unlockCardForPlayer('yeti','test'); switchTab('codex'); 1"); await pg.wait_for_timeout(900)
        # the first Codex page can be the Easter eggs' masked tiles (no details): page on to real cards
        FIND = "(()=>{ const defs = getCardDefs(); return [...document.querySelectorAll('#codexGrid [data-defid]')].find(x=> defs[x.dataset.defid] && !defs[x.dataset.defid].easterEgg && x.offsetWidth > 0) || null; })()"
        for _ in range(6):
            if await pg.evaluate(f"!!{FIND}"): break
            await pg.evaluate("(()=>{ const nx = [...document.querySelectorAll('#view-codex button')].find(b=> b.textContent.trim() === '›' && !b.disabled); if(nx) nx.click(); return 1; })()"); await pg.wait_for_timeout(700)
        r = await pg.evaluate("(()=>{ const e = " + FIND + "; e.scrollIntoView({block:'center'}); const b = e.getBoundingClientRect(); return [b.left + b.width/2, b.top + b.height/2]; })()")
        await pg.wait_for_timeout(200)
        await touch_hold(pg, cdp, r[0], r[1])
        st = await pg.evaluate("[!document.getElementById('cardPop').hidden, document.getElementById('cardDetailOverlay').hidden, document.getElementById('cardPop').classList.contains('is-held')]")
        check(st[0] and st[2], 'codex@390: touch-and-hold should open the card details and keep them up')
        check(st[1], 'codex@390: the lift after a hold should not open the card page')
        if SHOTS: await pg.screenshot(path=os.path.join(ROOT, SHOTS, 'after-hold-codex-390.png'))
        pr = await pg.evaluate("(()=>{ const b = document.getElementById('cardPop').getBoundingClientRect(); return [b.left + b.width/2, b.top + b.height - 30]; })()")
        await pg.touchscreen.tap(pr[0], pr[1]); await pg.wait_for_timeout(400)
        check(not await pg.evaluate("document.getElementById('cardDetailOverlay').hidden"), 'codex@390: a tap on the held details should open the full card page')
        check(not errs, f'codex@390: page errors {errs[:3]}')
        await ctx.close()
        await b.close()
    print('mobile layout: ' + ('OK' if not failures else f'{len(failures)} failure(s)'))
    sys.exit(1 if failures else 0)

asyncio.run(main())
