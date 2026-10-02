#!/usr/bin/env python3
"""Two real browser pages play a Live Ranked match against each other (2026-10-03).

    python3 tests/e2e/live_two_player.py

Each page runs the real game (index.html) in its own browser context (separate localStorage =
separate player). Supabase is replaced by tests/e2e/mock-relay.js; realtime broadcasts are relayed
page-to-page by this script, so the real host/peer code paths (intents, state snapshots, abandon)
run unmodified. Checks:
  1. both pages enter the match with the right seat/role;
  2. after every resolved round, the peer's mirror equals the host's authoritative state
     (round, both castle HPs, both boards);
  3. the match ends on BOTH pages with the same winner;
  4. a peer leaving mid-match tells the host ("Your opponent left") and clears its match.
Exit code 1 on any failure.
"""
import asyncio, json, os, sys
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
URL = 'file://' + os.path.join(ROOT, 'index.html')
EXE = os.environ.get('BW_CHROMIUM', '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell')
INIT = "localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_arena_faction','otters'); sessionStorage.setItem('bramblewood_seen_splash','1'); localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit']));"
failures = []

def check(cond, msg):
    if not cond: failures.append(msg); print('  FAIL', msg)

STATE_JS = """()=>{ const m=matchState; if(!m) return null;
  const board = pid=> ['left','center','right'].map(s=> m.players[pid].row[s].map(c=> c.defId+':'+c.hp).join(',')).join('|');
  return {round:m.round, over:!!m.over, winner:m.winner||0, hp:[m.players[1].hq.hp, m.players[2].hq.hp], b1:board(1), b2:board(2), active:m.active, role:m.liveRole, seat:m.liveMySeat}; }"""

async def setup_page(browser, me, pages, other_key):
    ctx = await browser.new_context(viewport={'width':1280, 'height':820})
    page = await ctx.new_page()
    errs = []
    page.on('pageerror', lambda e: errs.append(str(e)))
    dialogs = []
    page.on('dialog', lambda d: (dialogs.append(d.message), asyncio.ensure_future(d.accept())))
    async def relay(source, channel, event, payload):
        other = pages[other_key]
        asyncio.ensure_future(other.evaluate("([c,e,p])=> window.__relayDeliver && window.__relayDeliver(c,e,p)", [channel, event, payload]))
    await page.expose_binding('__relaySend', relay)
    await page.add_init_script(INIT)
    await page.add_init_script(path=os.path.join(HERE, 'mock-relay.js'))
    await page.goto(URL); await page.wait_for_timeout(1500)
    await page.evaluate("""([me])=>{ sbClient = __mkRelayClient(me, [{id:'host1',display_name:'Hosty'},{id:'peer1',display_name:'Peery'}]); cloudUserId = me; cloudIsAnonymous = false; }""", [me])
    return page, errs, dialogs

async def play_my_turn(page):
    """Play the first playable card (or discard / skip) for this page's seat, through the real UI functions."""
    return await page.evaluate("""async()=>{ const m=matchState; if(!m || m.over || m.resolving) return 'idle';
      const seat = m.liveMySeat; if(m.active!==seat || m.turnDone[seat]) return 'wait';
      const me = m.players[seat]; const h = me.hand.find(x=> m.engine.canPlay(me, x.defId, x.uid));
      if(h){ await playCardByUid(h.uid, 'left'); return 'play'; }
      if(me.hand.length && !me.discardUsedThisTurn){ await discardCardByUid(me.hand[0].uid); return 'discard'; }
      await skipTurn(); return 'skip'; }""")

async def run_match(browser, abandon=False):
    pages = {}
    host, herr, hdlg = await setup_page(browser, 'host1', pages, 'peer')
    peer, perr, pdlg = await setup_page(browser, 'peer1', pages, 'host')
    pages['host'], pages['peer'] = host, peer
    deck = await host.evaluate("JSON.stringify(myDeckCounts)")
    row = {'id':'m-test', 'player1_id':'host1', 'player2_id':'peer1', 'host_id':'host1', 'ranked':True,
           'player1_rating':1500, 'player2_rating':1500, 'player1_deck':json.loads(deck), 'player2_deck':json.loads(deck),
           'player1_character':'castle', 'player2_character':'castle', 'settings':{'battleMode':'gravity'}}
    await peer.evaluate("(row)=> enterLiveMatch(row)", row); await peer.wait_for_timeout(300)
    await host.evaluate("(row)=> enterLiveMatch(row)", row); await host.wait_for_timeout(1200)
    hs, ps = await host.evaluate(STATE_JS), await peer.evaluate(STATE_JS)
    check(hs and hs['role']=='host' and hs['seat']==1, f'host entered as host/seat 1: {hs and (hs["role"], hs["seat"])}')
    check(ps and ps['role']=='peer' and ps['seat']==2, f'peer entered as peer/seat 2: {ps and (ps["role"], ps["seat"])}')
    check(ps and hs and ps['b1']==hs['b1'] and ps['round']==hs['round'], 'peer received the opening snapshot')
    # Short castles so the match finishes in a handful of rounds; host is authoritative, so set it there and re-broadcast.
    await host.evaluate("matchState.players[1].hq.hp = matchState.players[1].hq.maxHp = 8; matchState.players[2].hq.hp = matchState.players[2].hq.maxHp = 8; matchState.speedMult = 3; broadcastLiveState()")
    await peer.evaluate("matchState && (matchState.speedMult = 3)")
    if abandon:
        await play_my_turn(host); await host.wait_for_timeout(400)
        await peer.evaluate("endMatch()"); await host.wait_for_timeout(1200)
        check(any('left the match' in d for d in hdlg), f'host was told the opponent left (dialogs: {hdlg})')
        check(await host.evaluate("matchState===null"), 'host match cleared after the peer left')
    else:
        last_round = 0
        loop = asyncio.get_event_loop(); deadline = loop.time() + 240
        while loop.time() < deadline:
            await play_my_turn(host); await play_my_turn(peer)
            await host.wait_for_timeout(250)
            hs = await host.evaluate(STATE_JS)
            if hs is None: break
            if hs['round'] != last_round or hs['over']:
                await peer.wait_for_timeout(700)
                hs, ps = await host.evaluate(STATE_JS), await peer.evaluate(STATE_JS)
                if not hs['over'] and not (await host.evaluate("matchState.resolving")):
                    same = ps and all(ps[k]==hs[k] for k in ('round','hp','b1','b2'))
                    check(same, f'round {hs["round"]}: peer mirror == host state\n     host {hs}\n     peer {ps}')
                last_round = hs['round']
            if hs['over']: break
        if os.environ.get('BW_DEBUG'):
            print('  host', await host.evaluate("JSON.stringify({a:matchState&&matchState.active, td:matchState&&matchState.turnDone, r:matchState&&matchState.resolving})"))
            print('  peer', await peer.evaluate("JSON.stringify({a:matchState&&matchState.active, td:matchState&&matchState.turnDone, r:matchState&&matchState.resolving, hand:matchState&&matchState.players[2].hand.length})"))
        await host.wait_for_timeout(1500); await peer.wait_for_timeout(800)
        hs, ps = await host.evaluate(STATE_JS), await peer.evaluate(STATE_JS)
        check(hs and hs['over'], f'match finished on the host (state {hs})')
        check(ps and ps['over'] and ps['winner']==hs['winner'], f'peer sees the same result: host {hs and hs["winner"]} peer {ps and ps["winner"]}')
        print(f'  match over after {hs and hs["round"]} rounds, winner seat {hs and hs["winner"]}, castles {hs and hs["hp"]}')
    for name, errs in (('host', herr), ('peer', perr)):
        check(not errs, f'{name} page errors: {errs[:2]}')
    await host.context.close(); await peer.context.close()

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=EXE)
        print('live 2-player: full match'); await run_match(browser)
        print('live 2-player: peer abandons'); await run_match(browser, abandon=True)
        await browser.close()
    print(f'live 2-player: {len(failures)} failure(s)')
    sys.exit(1 if failures else 0)

asyncio.run(main())
