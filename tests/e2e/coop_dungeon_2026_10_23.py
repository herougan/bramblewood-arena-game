#!/usr/bin/env python3
"""The Group Dungeon in two real pages (2026-10-23, package AR3; rewritten 2026-10-28, package COOP2).

    python3 tests/e2e/coop_dungeon_2026_10_23.py            # checks; screenshots into docs/screens/COOP2/
    BW_SHOTS=0 python3 tests/e2e/coop_dungeon_2026_10_23.py # checks only

Each page runs the real game (index.html) in its own browser context (its own save). Supabase is tests/e2e/mock-relay.js: the pages'
Realtime broadcasts are relayed page to page by this script, so the real room code runs (supabaseTransport, the host, the claims).
2026-10-28 (COOP2, owner K12: "It should be a normal game, but like, raid"): AR3's own co-op board, its plan timer and its 3-player room
are gone; both pages now play the normal battle board. Checks:
  1. the Dungeons tab shows the vault's entrance; the host opens an online room, the other player joins with the code into seat 1, readies;
  2. Start spends the Energy and puts both pages on the normal battle board (matchState mode 'coop'), the same table on both;
  3. both play rounds through the page (playCardByUid / Pass turn, as a tap does): after every round both pages hold the same table, and
     the other player's card shows on each page as an ally's play;
  4. the other player leaving mid-fight is marked away on the host, and the host plays on (the CPU plays the seat).
Screenshots (390 and 1366): the peer's view of the fight. Exit code 1 on any failure.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
URL = 'file://' + os.path.join(ROOT, 'index.html')
EXE = os.environ.get('BW_CHROMIUM', '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell')
SHOTS = os.environ.get('BW_SHOTS', '1') != '0'
OUT = os.path.join(ROOT, 'docs', 'screens', 'COOP2')
INIT = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_arena_faction','otters'); sessionStorage.setItem('bramblewood_seen_splash','1');"
        "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying']));")
failures = []

def check(cond, msg):
    print(('  ok   ' if cond else '  FAIL ') + msg)
    if not cond: failures.append(msg)

async def setup_page(browser, me, name, pages, other_key):
    ctx = await browser.new_context(viewport={'width': 390, 'height': 844})
    page = await ctx.new_page(); errs = []
    page.on('pageerror', lambda e: errs.append(str(e)))
    async def relay(source, channel, event, payload):
        other = pages.get(other_key)
        if other: asyncio.ensure_future(other.evaluate("([c,e,p])=> window.__relayDeliver && window.__relayDeliver(c,e,p)", [channel, event, payload]))
    await page.expose_binding('__relaySend', relay)
    await page.add_init_script(INIT)
    await page.add_init_script(path=os.path.join(HERE, 'mock-relay.js'))
    await page.goto(URL); await page.wait_for_timeout(1500)
    await page.evaluate("""([me, name])=>{ sbClient = __mkRelayClient(me, [{id:'host1',display_name:'Hazel'},{id:'peer1',display_name:'Pip'}]); cloudUserId = me; cloudIsAnonymous = false;
      myProfile = Object.assign({}, myProfile || {}, {name}); deckSizeOkOrWarn = ()=> true; try{ const s = settleEnergy(); s.current = 60; saveEnergyState(s); }catch(e){}
      switchTab('play'); playSubTab = 'dungeons'; renderPlay(); const b = document.getElementById('playSubBody'); if(b && !document.querySelector('.dg-group')) renderDungeonsSubTab(b); }""", [me, name])
    await page.wait_for_timeout(400)
    return page, errs

STATE = "()=> matchState && matchState.coop ? {hash: BramblewoodCoop.tableHash(matchState.coop.T), floor: matchState.coop.T.floorIdx, round: matchState.round, over: matchState.over, phase: GD.phase, host: GD.s && GD.s.isHost, resolving: matchState.resolving} : {phase: GD.phase}"
# My turn through the page: the first affordable unit into a free slot of my row (or my ally's), else Pass turn
MY_TURN = """async()=>{ const m = matchState, C = BramblewoodCoop; if(!m || !m.coop || m.over || m.resolving || gdMyDone(m)) return 'idle';
  const T = m.coop.T, me = m.players[1], h = me.hand.find(h=> m.engine.canPlay(me, h.defId, h.uid) && !C.unsupportedCard(getCardDefs()[h.defId]) && !C.noSlotCard(getCardDefs()[h.defId]));
  const row = m.coop.seat, sl = C.rowLegalSlots(T, row)[0];
  if(h && sl != null){ await playCardByUid(h.uid, sl, null, row ? {reserve: row} : undefined); return 'played'; }
  await skipTurn(); return 'passed'; }"""

async def shot(page, name, widths=(390, 1366)):
    if not SHOTS: return
    os.makedirs(OUT, exist_ok=True)
    for w in widths:
        await page.set_viewport_size({'width': w, 'height': 844 if w < 700 else 860}); await page.wait_for_timeout(400)
        f = os.path.join(OUT, f'{name}-{w}.png'); await page.screenshot(path=f, full_page=False, animations='disabled'); print('  shot', os.path.relpath(f, ROOT))
    await page.set_viewport_size({'width': 390, 'height': 844})

async def two_pages(browser):
    pages = {}
    host, herr = await setup_page(browser, 'host1', 'Hazel', pages, 'peer')
    peer, perr = await setup_page(browser, 'peer1', 'Pip', pages, 'host')
    pages['host'], pages['peer'] = host, peer
    tab = await host.evaluate("({card: !!document.querySelector('.dg-group [data-gd-open=\"create\"]'), soon: /Coming soon/.test((document.querySelector('.dg-group')||{}).textContent||'')})")
    check(tab['card'] and not tab['soon'], f'the Dungeons tab shows the vault\'s entrance ({tab})')
    await host.click('.dg-group [data-gd-open="create"]'); await host.wait_for_timeout(500)
    code = await host.evaluate("GD.code")
    check(bool(code) and len(code) == 6 and await host.evaluate("GD.phase") == 'lobby', f'host opened room {code}')
    await peer.fill('#gdJoinCode', code); await peer.click('.dg-group [data-gd-open="join"]'); await peer.wait_for_timeout(900)
    hs = await host.evaluate("({seats: GD.s.room.seats.map(x=> x && x.peerId), kind: GD.kind})")
    check(await peer.evaluate("GD.phase") == 'lobby' and hs['seats'] == ['host1', 'peer1'], f'the peer joined with the code into seat 1 ({hs})')
    check(hs['kind'] == 'live', 'signed in: an online room (Realtime broadcast via the mock relay)')
    await peer.click('#gdOverlay [data-gd-act="ready"]'); await peer.wait_for_timeout(500)
    check(await host.evaluate("GD.s.canStart()"), 'the peer readied: the host may start')
    e0 = await host.evaluate("currentEnergy()")
    await host.click('#gdOverlay [data-gd-act="start"]'); await host.wait_for_timeout(1500)
    hs, ps = await host.evaluate(STATE), await peer.evaluate(STATE)
    check(hs.get('phase') == 'fight' and ps.get('phase') == 'fight' and hs.get('hash') == ps.get('hash'), f'both pages on the normal battle board, the same table ({hs.get("hash")} / {ps.get("hash")})')
    check(await host.evaluate("currentEnergy()") == e0 - 5, 'the climb cost the host 5 Energy')
    same, rounds, ally = 0, 0, 0
    for i in range(5):
        r0 = (await host.evaluate(STATE)).get('round')
        await peer.evaluate(MY_TURN); await host.wait_for_timeout(250); await host.evaluate(MY_TURN)
        for k in range(60):
            hs, ps = await host.evaluate(STATE), await peer.evaluate(STATE)
            if hs.get('phase') != 'fight' or (hs.get('round') != r0 and ps.get('round') == hs.get('round') and not hs.get('resolving') and not ps.get('resolving')): break
            await host.wait_for_timeout(250)
        if hs.get('phase') != 'fight': break
        rounds += 1; same += 1 if hs.get('hash') == ps.get('hash') else 0
        if i == 1: await shot(peer, 'peer-fight')
    ally = await host.evaluate("window.__bwAllyPlays || 0") + await peer.evaluate("window.__bwAllyPlays || 0")
    check(rounds >= 3 and same == rounds, f'played {rounds} rounds through the pages; the two pages matched after {same} of them')
    check(ally >= 1, f"the other player's cards land as an ally's play ({ally} ally plays seen)")
    check(await host.evaluate("window.__bwCoopDesyncs || 0") == 0 and await peer.evaluate("window.__bwCoopDesyncs || 0") == 0, 'no desync on either page')
    # the peer leaves mid-fight (Quit = leave the room)
    await peer.evaluate("()=> gdClose()"); await host.wait_for_timeout(800)
    away = await host.evaluate("GD.s && GD.s.room.seats[1] && GD.s.room.seats[1].connected === false")
    check(away and await peer.evaluate("GD.phase") == 'closed' and not await peer.evaluate("!!matchState"), 'the peer left: marked away on the host; the peer\'s fight is closed')
    before = (await host.evaluate(STATE)).get('round')
    if (await host.evaluate(STATE)).get('phase') == 'fight':
        await host.evaluate(MY_TURN)
        for k in range(60):
            after = await host.evaluate(STATE)
            if after.get('round', 0) > before or after.get('phase') != 'fight': break
            await host.wait_for_timeout(250)
        check(after.get('round', 0) > before or after.get('phase') in ('floorEnd', 'end'), f'the host plays on, the CPU in the seat (round {before} -> {after.get("round")})')
    for name, errs in (('host', herr), ('peer', perr)): check(not errs, f'{name} page errors: {errs[:2]}')
    await host.context.close(); await peer.context.close()

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=EXE)
        print('group dungeon: two pages over the relay'); await two_pages(browser)
        await browser.close()
    print(f'coop dungeon e2e: {len(failures)} failure(s)')
    sys.exit(1 if failures else 0)

asyncio.run(main())
