#!/usr/bin/env python3
"""The Group Dungeon in two real pages (2026-10-23, package AR3).

    python3 tests/e2e/coop_dungeon_2026_10_23.py            # checks; screenshots into docs/screens/ar3/
    BW_SHOTS=0 python3 tests/e2e/coop_dungeon_2026_10_23.py # checks only

Each page runs the real game (index.html) in its own browser context (its own save). Supabase is tests/e2e/mock-relay.js: the pages'
Realtime broadcasts are relayed page to page by this script, so the real room code runs (supabaseTransport, the host, the peer).
Checks:
  1. the Dungeons tab shows the Group Dungeon's entrance (no Coming soon) to a player past the tutorial;
  2. the host opens a room through the page, the other player joins with the code, readies; the host starts (Energy is spent);
  3. both play rounds through the page (tap a card, tap a glowing cell, Ready): after every round both pages hold the same state;
  4. the other player leaving mid-fight is marked away on the host and the host plays on (the CPU plays the seat);
  5. one page, 3 players (two more sessions on an in-page hub): the 4-seat board with a CPU ally in B, and a floor clear with its chest.
Screenshots (390 and 1366): the lobby, a 3-player fight, a floor clear. Exit code 1 on any failure.
"""
import asyncio, json, os, sys
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
URL = 'file://' + os.path.join(ROOT, 'index.html')
EXE = os.environ.get('BW_CHROMIUM', '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell')
SHOTS = os.environ.get('BW_SHOTS', '1') != '0'
OUT = os.path.join(ROOT, 'docs', 'screens', 'ar3')
INIT = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_arena_faction','otters'); sessionStorage.setItem('bramblewood_seen_splash','1');"
        "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying']));"
        # 2026-10-24 (package PL1, P24-13): the Dungeons tab opens after Map 3 (GD_OPEN_AFTER_MAP), so the player has won Maps 0-3
        "window.addEventListener('load', ()=>{ try{ const p = loadConquestProgress(); mainConquestMaps().slice(0, 4).forEach(m=> m.nodes.forEach(n=>{ const id = conquestNodeId(m.id, n.key); if(!p.completed.includes(id)) p.completed.push(id); })); saveConquestProgress(p); }catch(e){} });")
failures = []

def check(cond, msg):
    print(('  ok   ' if cond else '  FAIL ') + msg)
    if not cond: failures.append(msg)

async def setup_page(browser, me, name, pages, other_key, width=390):
    ctx = await browser.new_context(viewport={'width': width, 'height': 844 if width < 700 else 860})
    page = await ctx.new_page()
    errs = []
    page.on('pageerror', lambda e: errs.append(str(e)))
    async def relay(source, channel, event, payload):
        other = pages.get(other_key)
        if other: asyncio.ensure_future(other.evaluate("([c,e,p])=> window.__relayDeliver && window.__relayDeliver(c,e,p)", [channel, event, payload]))
    await page.expose_binding('__relaySend', relay)
    await page.add_init_script(INIT)
    await page.add_init_script(path=os.path.join(HERE, 'mock-relay.js'))
    await page.goto(URL); await page.wait_for_timeout(1500)
    await page.evaluate("""([me, name])=>{ sbClient = __mkRelayClient(me, [{id:'host1',display_name:'Hazel'},{id:'peer1',display_name:'Pip'}]); cloudUserId = me; cloudIsAnonymous = false;
      myProfile = Object.assign({}, myProfile || {}, {name}); deckSizeOkOrWarn = ()=> true; try{ FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); }catch(e){}
      switchTab('play'); playSubTab = 'dungeons'; renderPlay(); }""", [me, name])
    await page.wait_for_timeout(400)
    return page, errs

STATE = "()=> GD.s && GD.s.view ? {hash: BramblewoodCoop.hashView(GD.s.view), floor: GD.s.view.floorIdx, round: GD.s.view.round, over: GD.s.view.over, phase: GD.phase, mode: GD.s.mode, host: GD.s.isHost} : {phase: GD.phase}"

async def play_round_ui(page):
    """One plan through the page: tap the first affordable card, the first glowing cell, then Ready (or Pass)."""
    return await page.evaluate("""async()=>{ const S = GD.s; if(!S || GD.phase !== 'fight' || !S.view || S.view.over) return 'idle';
      const seat = S.mySeat(); if(S.locked[seat]) return 'locked';
      const card = document.querySelector('#gdOverlay .gd-hand-card:not(.is-short):not([disabled])');
      if(card){ card.click(); await new Promise(r=> setTimeout(r, 30)); const cell = document.querySelector('#gdOverlay .gd-cell.is-legal'); if(cell) cell.click(); else { const c = document.querySelector('#gdOverlay [data-gd-act="clear"]'); if(c) c.click(); } }
      await new Promise(r=> setTimeout(r, 30)); const lock = document.querySelector('#gdOverlay [data-gd-act="lock"]'); if(lock) lock.click(); return 'played'; }""")

async def shot(page, name, widths=(390, 1366)):
    if not SHOTS: return
    os.makedirs(OUT, exist_ok=True)
    for w in widths:
        await page.set_viewport_size({'width': w, 'height': 844 if w < 700 else 860}); await page.wait_for_timeout(350)
        f = os.path.join(OUT, f'{name}-{w}.png'); await page.screenshot(path=f, full_page=False, animations='disabled'); print('  shot', os.path.relpath(f, ROOT))
    await page.set_viewport_size({'width': 390, 'height': 844})

async def two_pages(browser):
    pages = {}
    host, herr = await setup_page(browser, 'host1', 'Hazel', pages, 'peer')
    peer, perr = await setup_page(browser, 'peer1', 'Pip', pages, 'host')
    pages['host'], pages['peer'] = host, peer
    tab = await host.evaluate("({card: !!document.querySelector('.dg-group [data-gd-open=\"create\"]'), soon: /Coming soon/.test((document.querySelector('.dg-group')||{}).textContent||''), keys: !!document.querySelector('.dg-tickets')})")
    check(tab['card'] and not tab['soon'], f'the Dungeons tab shows the Group Dungeon entrance, not Coming soon ({tab})')
    check(not tab['keys'], 'no daily-dungeon keys row while the daily dungeons are hidden')
    await host.click('.dg-group [data-gd-open="create"]'); await host.wait_for_timeout(500)
    code = await host.evaluate("GD.code")
    check(bool(code) and len(code) == 6 and await host.evaluate("GD.phase") == 'lobby', f'host opened room {code}')
    await peer.fill('#gdJoinCode', code); await peer.click('.dg-group [data-gd-open="join"]'); await peer.wait_for_timeout(900)
    hs = await host.evaluate("({seats: Object.keys(GD.s.room.seats).filter(k=> GD.s.room.seats[k]), kind: GD.kind})")
    check(await peer.evaluate("GD.phase") == 'lobby' and 'C' in hs['seats'], f'the peer joined with the code and sits in C ({hs})')
    check(hs['kind'] == 'live', 'signed in: an online room (Realtime broadcast via the mock relay)')
    await peer.click('#gdOverlay [data-gd-act="ready"]'); await peer.wait_for_timeout(500)
    check(await host.evaluate("GD.s.canStart()"), 'the peer readied: the host may start')
    await shot(host, 'lobby')
    e0 = await host.evaluate("currentEnergy()")
    await host.click('#gdOverlay [data-gd-act="start"]'); await host.wait_for_timeout(900)
    check(await host.evaluate("GD.phase") == 'fight' and await peer.evaluate("GD.phase") == 'fight', 'both pages in the fight')
    check(await host.evaluate("currentEnergy()") == e0 - 5, 'the climb cost the host 5 Energy')
    same, rounds = 0, 0
    for i in range(4):
        await play_round_ui(host); await play_round_ui(peer); await host.wait_for_timeout(700)
        hs, ps = await host.evaluate(STATE), await peer.evaluate(STATE)
        if hs.get('phase') == 'floorEnd' or hs.get('over'):
            if hs.get('over') == 'won' and hs.get('floor', 9) < 3:
                await host.evaluate("GD.s.nextFloor()"); await host.wait_for_timeout(600)
            else: break
        rounds += 1; same += 1 if hs.get('hash') == ps.get('hash') else 0
    check(rounds >= 3 and same == rounds, f'played {rounds} rounds through the page; the two pages matched after {same} of them')
    check(await peer.evaluate("GD.s.mode") == 'lockstep', 'the peer ran the fight in step (no snapshot needed)')
    # the peer leaves mid-fight: tap Leave twice (on-page confirmation)
    await peer.click('#gdOverlay [data-gd-act="leave"]'); await peer.wait_for_timeout(100); await peer.click('#gdOverlay [data-gd-act="leave"]'); await host.wait_for_timeout(800)
    away = await host.evaluate("GD.s.room.seats.C && GD.s.room.seats.C.connected === false")
    check(away and await peer.evaluate("GD.phase") == 'closed', 'the peer left: marked away on the host; the peer is back on the Dungeons tab')
    before = (await host.evaluate(STATE)).get('round')
    await play_round_ui(host); await host.wait_for_timeout(700)
    after = await host.evaluate(STATE)
    check(after.get('round', 0) > before or after.get('phase') in ('floorEnd', 'end'), f'the host plays on alone (round {before} -> {after.get("round")})')
    for name, errs in (('host', herr), ('peer', perr)): check(not errs, f'{name} page errors: {errs[:2]}')
    await host.context.close(); await peer.context.close()

THREE = """async()=>{
  deckSizeOkOrWarn = ()=> true; switchTab('play'); playSubTab = 'dungeons'; renderPlay();
  await gdCreate(true); GD.s.setCpu('C', false); GD.s.maxHumans = 4; GD.kind = 'local';
  const mk = (id, name)=> BramblewoodCoop.createSession({transport: GD.hub.connect(id), me: {peerId: id, name, deck: publicDeck(myDeckCounts), castleHp: 20}, host: false, code: GD.code,
    deps: {makeSimEngine, defs: gdDefs(), defsHash: GD.defsHash}, autoPlan: 150});
  window.__others = [mk('mia', 'Mia'), mk('tom', 'Tom')];
  await new Promise(r=> setTimeout(r, 200)); window.__others.forEach(o=> o.setReady(true));
  for(let i = 0; i < 40 && !GD.s.canStart(); i++) await new Promise(r=> setTimeout(r, 50));
  return {seats: Object.keys(GD.s.room.seats).filter(k=> GD.s.room.seats[k]), size: GD.s.room.size, can: GD.s.canStart(), ready: Object.values(GD.s.room.seats).map(x=> x && [x.peerId, x.ready, x.connected])};
}"""

async def three_players(browser):
    ctx = await browser.new_context(viewport={'width': 390, 'height': 844}); page = await ctx.new_page(); errs = []
    page.on('pageerror', lambda e: errs.append(str(e)))
    await page.add_init_script(INIT); await page.goto(URL); await page.wait_for_timeout(1500)
    r = await page.evaluate(THREE)
    check(r['size'] == 4 and sorted(r['seats']) == ['A', 'C', 'D'], f'3 players: A, C, D on a 4-seat board ({r})')
    started = await page.evaluate("GD.s.start()"); await page.wait_for_timeout(400)
    check(started, f'the host started the 3-player room ({r})')
    if not started: await ctx.close(); return
    check(await page.evaluate("GD.s.run.seats.find(s=> s.seat === 'B').cpu"), '3 players: seat B is a CPU ally in the fight')
    # play 3 rounds through the page, then pick a card and show the glowing cells for the screenshot
    for i in range(3):
        await play_round_ui(page); await page.wait_for_timeout(600)
    await page.evaluate("""async()=>{ for(let i = 0; i < 40 && GD.s.locked[GD.s.mySeat()]; i++) await new Promise(r=> setTimeout(r, 100)); // the round still resolving
      const n = document.querySelectorAll('#gdOverlay .gd-hand-card').length;
      for(let i = 0; i < n; i++){ const c = document.querySelectorAll('#gdOverlay .gd-hand-card')[i]; if(!c || c.classList.contains('is-short')) continue; c.click(); await new Promise(r=> setTimeout(r, 30));
        if(document.querySelectorAll('#gdOverlay .gd-cell.is-legal').length) return; const again = document.querySelectorAll('#gdOverlay .gd-hand-card')[i]; if(again) again.click(); await new Promise(r=> setTimeout(r, 30)); } }"""); await page.wait_for_timeout(200)
    legal = await page.evaluate("document.querySelectorAll('#gdOverlay .gd-cell.is-legal').length")
    expect = await page.evaluate("(()=>{ const S = GD.s, seat = S.mySeat(); return S.run.fl.ctx[seat].hand.some(h=> BramblewoodCoop.legalCellsFor(S.run, seat, h.uid, null).cells.length > 0); })()")
    check((legal > 0) == bool(expect), f'a picked card lights its legal cells ({legal}; a legal play exists: {expect})')
    units = await page.evaluate("document.querySelectorAll('#gdOverlay .gd-unit').length")
    check(units > 0, f'units on the board ({units})')
    await shot(page, 'fight-3p')
    # finish the floor: everyone keeps playing (my seat on the CPU plan) until it ends
    for i in range(40):
        st = await page.evaluate(STATE)
        if st.get('phase') in ('floorEnd', 'end'): break
        await page.evaluate("()=>{ const S = GD.s, seat = S.mySeat(); if(S.view && !S.view.over && !S.locked[seat]){ const p = BramblewoodCoop.cpuPlan(S.run, seat); S.submitPlan({pitch: p.pitch != null ? p.pitch : null, play: p.play || null}); } }")
        await page.wait_for_timeout(450)
    st = await page.evaluate("({phase: GD.phase, fe: GD.floorEnd && GD.floorEnd.result, gold: myCurrencies.gold, paid: Object.keys(GD.paid).length})")
    check(st['phase'] in ('floorEnd', 'end'), f'the floor ended ({st})')
    if st['fe'] == 'won':
        check(st['paid'] == 1, 'the floor chest was paid once')
        check(await page.evaluate("!!document.querySelector('#gdOverlay [data-gd-act=\"next\"]')"), 'the host can go deeper')
    await shot(page, 'floor-clear' if st['fe'] == 'won' else 'floor-lost')
    check(not errs, f'3-player page errors: {errs[:2]}')
    await ctx.close()

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=EXE)
        print('group dungeon: two pages over the relay'); await two_pages(browser)
        print('group dungeon: three players on one page'); await three_players(browser)
        await browser.close()
    print(f'coop dungeon e2e: {len(failures)} failure(s)')
    sys.exit(1 if failures else 0)

asyncio.run(main())
