#!/usr/bin/env python3
"""The Tidelock Vault as a normal fight, two clients in one page (2026-10-28, package COOP2; owner K12, 10-27 11:22).

    python3 tests/e2e/coop2_2026_10_28.py            # checks; screenshots into docs/screens/COOP2/
    BW_SHOTS=0 python3 tests/e2e/coop2_2026_10_28.py # checks only

The page (index.html) hosts a room on an in-page hub (BramblewoodCoop.createHub); a second client, headless (createSession with no page,
its acts applied by CoopM.applyHeadless), joins it as player 2. The page's fight is the normal battle board (matchState mode 'coop').
Checks:
  1. the lobby has the type's 2 seats, player 2 in seat 1; Start (the page's button) opens the normal battle board, not an overlay;
  2. the race: player 2 claims the middle row's slot first, the page (player 1) taps a hand card and the same slot in the same moment:
     player 1's card lands on both clients, player 2 is refused (by player 1) and its card is back in its hand;
  3. player 2's play into player 1's row lands on the page as an ally's play (allyPlayFx, its name), and the slot is taken;
  4. rounds: the page runs the normal round (aiActNow + resolveRound) and the headless client its engine calls: the same table hash
     after every round, no desync;
  5. a floor won: the floor's panel (rank emblem, the raid's pay), Continue (host) -> floor 2 on both;
  6. solo: Play with CPU allies -> Start -> the CPU plays seat 1;
  7. no page errors. Screenshots at 390 and 1366: the lobby, the fight with both rows, the floor panel.
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

async def shot(page, name, widths=(390, 1366)):
    if not SHOTS: return
    os.makedirs(OUT, exist_ok=True)
    for w in widths:
        await page.set_viewport_size({'width': w, 'height': 844 if w < 700 else 860}); await page.wait_for_timeout(450)
        f = os.path.join(OUT, f'{name}-{w}.png'); await page.screenshot(path=f, full_page=False, animations='disabled'); print('  shot', os.path.relpath(f, ROOT))
    await page.set_viewport_size({'width': 390, 'height': 844}); await page.wait_for_timeout(200)

async def new_page(browser):
    ctx = await browser.new_context(viewport={'width': 390, 'height': 844})
    page = await ctx.new_page(); errs = []
    page.on('pageerror', lambda e: errs.append(str(e)))
    await page.add_init_script(INIT)
    await page.goto(URL); await page.wait_for_timeout(1500)
    await page.evaluate("""()=>{ deckSizeOkOrWarn = ()=> true; try{ const s = settleEnergy(); s.current = 60; saveEnergyState(s); }catch(e){} switchTab('play'); playSubTab = 'dungeons'; renderPlay(); }""")
    await page.wait_for_timeout(300)
    return page, errs

STATE = """()=>{ const m = matchState, b = window.__bot; return {mode: m && m.mode, floor: m && m.coop && m.coop.T.floorIdx, round: m && m.round, over: m && m.over,
  page: m && m.coop ? BramblewoodCoop.tableHash(m.coop.T) : '', bot: b && b.T ? BramblewoodCoop.tableHash(b.T) : '', botRound: b && b.T && b.T.round,
  desyncPage: window.__bwCoopDesyncs || 0, desyncBot: b ? b.desyncs : -1, phase: GD.phase}; }"""

# One turn for both: the bot claims its CPU choice; the page plays its first affordable card into its own row (or passes)
TURN = """async()=>{ const m = matchState, b = window.__bot, C = BramblewoodCoop; if(!m || !m.coop || m.over) return 'idle';
  const r0 = m.round, T = m.coop.T;
  if(!C.seatDone(b.T, 1)){ const x = C.cpuChoice(b.T, 1); if(x) b.claim(x.kind === 'pass' ? {kind:'pass'} : x.kind === 'pitch' ? {kind:'pitch', uid:x.uid} : {kind:'play', uid:x.uid, row:x.row, slot:x.slot}); }
  for(let i = 0; i < 6 && !C.seatDone(T, 0) && !m.resolving; i++){ const me = m.players[1];
    const h = me.hand.find(h=> m.engine.canPlay(me, h.defId, h.uid) && !C.unsupportedCard(getCardDefs()[h.defId]) && !C.noSlotCard(getCardDefs()[h.defId]));
    const sl = C.rowLegalSlots(T, 0, 0)[0]; // 2026-10-30 (COOP3): player 1's own network
    if(h && sl != null) await playCardByUid(h.uid, sl); else await skipTurn();
    await new Promise(r=> setTimeout(r, 400)); }
  for(let i = 0; i < 25 && !C.seatDone(b.T, 1); i++){ const x = C.cpuChoice(b.T, 1); if(x && !Object.keys(b.pending).length) b.claim(x.kind === 'pass' ? {kind:'pass'} : x.kind === 'pitch' ? {kind:'pitch', uid:x.uid} : {kind:'play', uid:x.uid, row:x.row, slot:x.slot}); await new Promise(r=> setTimeout(r, 200)); }
  for(let i = 0; i < 200 && m.round === r0 && !m.over; i++) await new Promise(r=> setTimeout(r, 100));
  for(let i = 0; i < 60 && (m.resolving || (b.T.round !== m.round && !m.over)); i++) await new Promise(r=> setTimeout(r, 100));
  return 'ok'; }"""

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=EXE)
        page, errs = await new_page(browser)
        # 1. the lobby, two clients on an in-page hub
        card = await page.evaluate("()=>{ const d = document.createElement('div'); renderDungeonsSubTab(d); return {card: !!d.querySelector('.dg-group [data-gd-open=\"create\"]'), facts: (d.querySelector('.dg-group .gd-facts')||{}).textContent || ''}; }")
        check(card['card'] and '2' in card['facts'], f"the Dungeons tab shows the vault's entrance with its fixed player count ({card['facts']})")
        await page.evaluate("""()=>{ const C = BramblewoodCoop, hub = C.createHub(); window.__hub = hub;
          gdBegin('local', 'RACE28', true, {transport: hub.connect('pA'), peerId: 'pA'});
          window.__botEv = []; window.__bot = C.createSession({transport: hub.connect('pB'), me: {peerId: 'pB', name: 'Pip', deck: publicDeck(myDeckCounts), castleHp: 15}, host: false, code: 'RACE28',
            typeId: 'hollow', deps: gdDeps(), onEvent: (k, d)=> window.__botEv.push([k, d && d.by != null ? d.by : null, d && d.act ? d.act.uid : null])}); }""")
        await page.wait_for_timeout(300)
        await page.evaluate("()=> window.__bot.setReady(true)"); await page.wait_for_timeout(300)
        lobby = await page.evaluate("()=> ({seats: GD.s.room.seats.length, p2: GD.s.room.seats[1] && GD.s.room.seats[1].name, tiles: document.querySelectorAll('#gdOverlay .gd-seat').length, start: !!document.querySelector('#gdOverlay [data-gd-act=\"start\"]:not([aria-disabled])')})")
        check(lobby['seats'] == 2 and lobby['p2'] == 'Pip' and lobby['tiles'] == 2 and lobby['start'], f'lobby: 2 seats (the type\'s), Pip in seat 1, Start open ({lobby})')
        await shot(page, 'lobby')
        await page.click('#gdOverlay [data-gd-act="start"]'); await page.wait_for_timeout(1500)
        st = await page.evaluate(STATE)
        board = await page.evaluate("()=> ({overlay: !document.getElementById('gdOverlay') || document.getElementById('gdOverlay').hidden, rowMine: !!document.getElementById('rowMine'), res: document.querySelectorAll('#battlefieldInner .reserve-row.mine').length, hand: document.querySelectorAll('#handStrip .card-tile').length, bar: (document.getElementById('coopBar')||{}).textContent || ''})")
        check(st['mode'] == 'coop' and board['overlay'] and board['rowMine'] and board['res'] == 1 and board['hand'] >= 3, f'start: the normal battle board (front row + middle row, my hand), no overlay ({board})')
        check(st['page'] and st['page'] == st['bot'], 'start: both clients built the same table')
        check('Pip' in board['bar'], f"the coop bar names both players ({board['bar']})")
        # 2. the race on the middle row: player 2 claims first, the page taps a card and the same slot in the same moment
        race = await page.evaluate("""async()=>{ const m = matchState, C = BramblewoodCoop, b = window.__bot, T = m.coop.T;
          const slot = C.rowLegalSlots(T, 1)[0], bh = C.seatData(b.T, 1).hand[0];
          const me = m.players[1], h = me.hand.find(h=> m.engine.canPlay(me, h.defId, h.uid) && !C.noSlotCard(getCardDefs()[h.defId]));
          renderBoard(); b.claim({kind: 'play', uid: bh.uid, row: 1, slot});
          const tile = document.querySelector(`#handStrip .card-tile[data-handuid="${h.uid}"]`); if(tile) tile.click();
          await new Promise(r=> setTimeout(r, 30));
          const tgt = document.querySelector(`#battlefieldInner .reserve-target[data-reserve="1"][data-slot="${slot}"]`);
          if(tgt && m.selectedUid === h.uid) tgt.click(); else await playCardByUid(h.uid, slot, null, {reserve: 1});
          const viaTap = !!(tgt && m.selectedUid == null);
          const ghost = !!document.querySelector('#battlefieldInner .coop-pending');
          await new Promise(r=> setTimeout(r, 700));
          const u = C.unitAt(T, 1, slot), ub = C.unitAt(b.T, 1, slot);
          return {slot, viaTap, ghost, pageSeat: u && u.coopSeat, pageDef: u && u.defId, mine: h.defId, same: !!(u && ub && u.uid === ub.uid),
            rejected: window.__botEv.some(e=> e[0] === 'reject' && e[1] === 0 && e[2] === bh.uid), back: C.seatData(b.T, 1).hand.some(x=> x.uid === bh.uid),
            hash: C.tableHash(T) === C.tableHash(b.T)}; }""")
        check(race['pageSeat'] == 0 and race['pageDef'] == race['mine'] and race['same'], f'race: player 1 (lower index) lands the slot on both clients though player 2 claimed first ({race})')
        check(race['rejected'] and race['back'], 'race: player 2 is refused (taken by player 1) and its card is back in its hand')
        check(race['ghost'], 'race: my claim waited in its slot (dimmed, locked) until it landed')
        check(race['hash'], 'race: both tables are the same after it')
        # 3. player 2 plays into player 1's row: on the page, an ally's play from its hand
        # 2026-10-30 (package COOP3, owner W10: "you cannot use your allies' 'network' to place cards"): player 2 has nothing on the board, so
        # player 1's units open nothing in the front row for it; it plays beside its own row's centre (player 1's card holds it) and the page
        # draws that as Pip's play. Was: rowLegalSlots(b.T, 0)[0], a front-row slot beside player 1's units (row 0).
        ally = await page.evaluate("""async()=>{ const m = matchState, C = BramblewoodCoop, b = window.__bot, T = m.coop.T; const n0 = window.__bwAllyPlays || 0;
          const slot = C.rowLegalSlots(b.T, 1, 1)[0], h = C.seatData(b.T, 1).hand.find(x=> b.T.E.canPlay(C.seatData(b.T, 1), x.defId, x.uid) && !C.noSlotCard(getCardDefs()[x.defId]));
          if(!h || slot == null) return {skip: true}; b.claim({kind: 'play', uid: h.uid, row: 1, slot});
          await new Promise(r=> setTimeout(r, 500)); const u = C.unitAt(T, 1, slot);
          return {seat: u && u.coopSeat, plays: (window.__bwAllyPlays || 0) - n0, name: (window.__bwAllyPlayLast || {}).name, locked: !C.rowLegalSlots(T, 1).includes(slot)}; }""")
        if not ally.get('skip'):
            check(ally['seat'] == 1 and ally['plays'] >= 1 and ally['name'] == 'Pip' and ally['locked'], f"ally play: player 2's card lands as Pip's play, the slot taken (COOP3: in its own row) ({ally})")
        await page.wait_for_timeout(1200)
        for _ in range(30):
            st = await page.evaluate(STATE)
            if st['round'] and st['round'] >= 2 and st['botRound'] == st['round']: break
            await page.wait_for_timeout(300)
        await shot(page, 'fight-turn2')
        # 4. rounds in step
        rounds = []
        for k in range(4):
            await page.evaluate(TURN)
            st = await page.evaluate(STATE); rounds.append(st)
            if st['over']: break
        check(all(r['page'] == r['bot'] for r in rounds) and rounds[-1]['round'] >= 4, f"rounds: the page's normal round and the headless client's agree after every round (rounds {[r['round'] for r in rounds]})")
        check(rounds[-1]['desyncPage'] == 0 and rounds[-1]['desyncBot'] == 0, 'rounds: no desync on either client')
        await shot(page, 'fight')
        # 5. the floor won: both tables' vault bramble emptied (the same change on both), then a round
        await page.evaluate("()=>{ [matchState.coop.T, window.__bot.T].forEach(T=>{ T.players[2].hq.hp = 0; T.players[2].hq.shield = 0; T.players[2].hq.shieldLayers = []; }); renderHUD(); }")
        await page.evaluate(TURN)
        for _ in range(40):
            ph = await page.evaluate("()=> ({phase: GD.phase, panel: !!document.querySelector('#gdOverlay .gd-panel.is-won'), rank: !!document.querySelector('#gdOverlay .gd-panel .rank-hex'), chest: (document.querySelector('#gdOverlay .gd-chest')||{}).textContent || '', next: !!document.querySelector('#gdOverlay [data-gd-act=\"next\"]')})")
            if ph['panel']: break
            await page.wait_for_timeout(300)
        check(ph['panel'] and ph['rank'] and ph['next'], f'floor won: the floor panel with the rank emblem and Continue for the host ({ph})')
        check(any(ch.isdigit() for ch in ph['chest']), f"floor won: the raid's pay (Maple Leaves, Magic Dust) ({ph['chest'].strip()})")
        await shot(page, 'floor-won')
        # 2026-10-30 (package COOP3, owner W6): the floor's rewards window opens over this panel; Collect closes it (the panel stays the hub)
        for _ in range(20):
            if await page.evaluate("()=> !!document.querySelector('.gd-rw-overlay [data-gd-rw]')"): break
            await page.wait_for_timeout(200)
        await page.evaluate("()=>{ const b = document.querySelector('.gd-rw-overlay [data-gd-rw=\"collect\"]'); if(b) b.click(); }"); await page.wait_for_timeout(300)
        if ph['next']: await page.click('#gdOverlay [data-gd-act="next"]'); await page.wait_for_timeout(1500)
        st = await page.evaluate(STATE)
        check(st['floor'] == 1 and st['mode'] == 'coop' and st['page'] == st['bot'], f'continue: floor 2 on both clients, in step ({st})')
        await page.evaluate("()=>{ try{ window.__bot.close(); }catch(e){} gdClose(true); }"); await page.wait_for_timeout(300)
        check(not await page.evaluate("()=> !!matchState"), 'leave: closing the room ends the fight')
        # 6. solo
        await page.evaluate("()=> gdCreate(true)"); await page.wait_for_timeout(400)
        await page.click('#gdOverlay [data-gd-act="start"]'); await page.wait_for_timeout(1200)
        solo = await page.evaluate("""async()=>{ const m = matchState, C = BramblewoodCoop; if(!m || !m.coop) return {ok: false}; const r0 = m.round, T = m.coop.T;
          await skipTurn(); for(let i = 0; i < 150 && m.round === r0; i++) await new Promise(r=> setTimeout(r, 100));
          return {ok: true, cpu: GD.s.room.seats[1].cpu, round: m.round, cpuPlayed: GD.s.log.some(a=> a.seat === 1 && (a.kind === 'play' || a.kind === 'pass'))}; }""")
        check(solo.get('ok') and solo.get('cpu') and solo.get('round', 0) >= 2 and solo.get('cpuPlayed'), f'solo: the CPU plays seat 1 and the round goes on ({solo})')
        await page.evaluate("()=> gdClose(true)")
        real = [e for e in errs if 'ERR_' not in e]
        check(not real, f'no page errors ({real[:3]})')
        await browser.close()
    print('FAILED: %d' % len(failures) if failures else 'ALL OK')
    sys.exit(1 if failures else 0)

asyncio.run(main())
