#!/usr/bin/env python3
"""The group dungeon, COOP3 (2026-10-30; owner W4 / W6 / W10, 10-30 21:53), in the page, at 390 and 1366 wide.

    python3 tests/e2e/coop3_2026_10_30.py            # checks; screenshots into docs/screens/coop3/
    BW_SHOTS=0 python3 tests/e2e/coop3_2026_10_30.py # checks only

A solo run of the Tidelock Vault (you and a CPU ally, an in-page hub). Checks, at each width:
  1. start: the board at 1:1 (no zoom-out), the whole match on screen (the hand's bottom inside the window), the vault's empty middle row
     hidden, the CPU ally's card as wide as yours (W10), the CPU ally's play 0.5-1.5 s into the first turn (W4);
  2. every own slot: each turn every "+" shown is a slot the room's host accepts and every slot it accepts is shown; the outermost one is
     tapped and the card lands there (at 1366 one play is a mouse drag from the hand);
  3. cross-row (W10): a slot in the ally's row beside my own card shows a "+" and takes my card; a slot beside only the ally's card shows
     none and a claim on it is refused;
  4. the CPU ally's later turns: 0.5-3.0 s (W4);
  5. Auto (W6): the Auto-play control is there; on, my seat plays without me;
  6. rewards (W6): a won floor opens the fight's rewards window (the rewards block with its counters, the rank emblem, Go deeper); Go deeper
     starts floor 2 and closes it;
  7. no page errors.
A fresh profile's deck check refuses unowned starter copies, so deckSizeOkOrWarn is stubbed (as battle_ui does).
"""
import asyncio, os, sys, json
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
URL = 'file://' + os.path.join(ROOT, 'index.html')
EXE = os.environ.get('BW_CHROMIUM', '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell')
SHOTS = os.environ.get('BW_SHOTS', '1') != '0'
OUT = os.path.join(ROOT, 'docs', 'screens', 'coop3')
INIT = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_arena_faction','otters'); sessionStorage.setItem('bramblewood_seen_splash','1');"
        "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying']));")
failures = []

def check(cond, msg):
    print(('  ok   ' if cond else '  FAIL ') + msg)
    if not cond: failures.append(msg)

async def shot(page, name, w):
    if not SHOTS: return
    os.makedirs(OUT, exist_ok=True)
    f = os.path.join(OUT, f'{name}-{w}.png'); await page.screenshot(path=f, full_page=False); print('  shot', os.path.relpath(f, ROOT))

async def tap(page, sel):
    # a tap where the "+" is drawn (the row itself takes the tap on a phone and plays to the nearest "+", as a player's finger does)
    b = await page.locator(sel).first.bounding_box()
    x, y = b['x'] + b['width'] / 2, b['y'] + b['height'] / 2
    at = await page.evaluate(f"()=>{{ const e = document.elementFromPoint({x}, {y}); return e ? e.tagName + '.' + String(e.className).slice(0, 60) + ' < ' + String(e.parentElement && e.parentElement.className).slice(0, 40) : null; }}")
    if 'slot-target' not in (at or '') and 'board-row' not in (at or ''): print('  (tap lands on', at, ')')
    await page.mouse.click(x, y)

# my turn, after the CPU ally has played and its card has landed (the owner's order: the allies play first)
WAIT_TURN = """async()=>{ const m = matchState; for(let i = 0; i < 120 && m && (m.resolving || gdMyDone(m)) && !m.over; i++) await new Promise(r=> setTimeout(r, 150));
  for(let i = 0; i < 40 && m && !m.over && !BramblewoodCoop.seatDone(m.coop.T, 1); i++) await new Promise(r=> setTimeout(r, 100));
  await new Promise(r=> setTimeout(r, 1300)); return {round: m && m.round, over: m && m.over}; }"""
END_TURN = """async()=>{ const m = matchState; if(!m || m.over) return; if(!gdMyDone(m)) await skipTurn(); const r0 = m.round; for(let i = 0; i < 150 && m.round === r0 && !m.over; i++) await new Promise(r=> setTimeout(r, 120)); }"""
# what the board shows against what the host accepts, for my first playable unit card
PROBE = """()=>{ const m = matchState, C = BramblewoodCoop, T = m.coop.T, me = m.players[1], defs = getCardDefs();
  const h = me.hand.find(h=> m.engine.canPlay(me, h.defId, h.uid) && !C.noSlotCard(defs[h.defId]) && !C.unsupportedCard(defs[h.defId])); if(!h) return {none: true};
  m.selectedUid = h.uid; renderBoard(); renderHand();
  const shown = [...document.querySelectorAll('#battlefieldInner .slot-target')].map(x=> [Number(x.dataset.reserve || 0), Number(x.dataset.slot)]);
  const acc = []; for(let row = 0; row < 2; row++) for(const slot of C.COLS) if(C.checkAct(T, {kind: 'play', seat: m.coop.seat, uid: h.uid, row, slot}).ok) acc.push([row, slot]);
  const key = a=> a[0] + ':' + a[1], sk = new Set(shown.map(key)), ak = new Set(acc.map(key));
  const vis = [...document.querySelectorAll('#battlefieldInner .slot-target')].filter(x=>{ const r = x.getBoundingClientRect(); return r.left >= 0 && r.right <= window.innerWidth && r.top >= 0 && r.bottom <= window.innerHeight; }).map(x=> [Number(x.dataset.reserve || 0), Number(x.dataset.slot)]);
  return {uid: h.uid, shown, vis, refused: shown.filter(a=> !ak.has(key(a))), hidden: acc.filter(a=> !sk.has(key(a)))}; }"""

async def run_width(browser, w):
    print(f'-- {w} wide')
    phone = w < 700
    ctx = await browser.new_context(viewport={'width': w, 'height': 844 if phone else 860}, has_touch=phone, is_mobile=phone)
    page = await ctx.new_page(); errs = []
    page.on('pageerror', lambda e: errs.append(str(e)))
    await page.add_init_script(INIT)
    await page.goto(URL); await page.wait_for_timeout(1500)
    await page.evaluate("""()=>{ deckSizeOkOrWarn = ()=> true; window.showCoachTip = function(){}; try{ const s = settleEnergy(); s.current = 60; saveEnergyState(s); }catch(e){} switchTab('play'); playSubTab = 'dungeons'; renderPlay(); }""")
    await page.evaluate("()=> gdCreate(true)"); await page.wait_for_timeout(400)
    await page.click('#gdOverlay [data-gd-act="start"]'); await page.wait_for_timeout(3800)
    # 1. start
    st = await page.evaluate("""()=>{ const m = matchState, vh = window.innerHeight, tiles = [...document.querySelectorAll('#handStrip .card-tile')];
      const mine = document.querySelector('#rowMine > .board-card[data-uid]'), ally = document.querySelector('#resMine1 > .board-card[data-uid]'), foe = document.getElementById('resEnemy1');
      return {mode: m && m.mode, scale: battlefieldScale, zoomedClass: document.getElementById('appWrap').classList.contains('battlefield-zoomed'), handBottom: Math.max(0, ...tiles.map(t=> t.getBoundingClientRect().bottom)), vh,
        mineW: mine ? mine.offsetWidth : 0, allyW: ally ? ally.offsetWidth : 0,
        foeH: foe ? foe.offsetHeight : -1, cpu: GD.cpuLog || [], gdk: document.getElementById('appWrap').style.getPropertyValue('--gd-k')}; }""")
    check(st['mode'] == 'coop' and st['scale'] == 1 and not st['zoomedClass'], f"start: the duo board at 1:1, not zoomed out ({st['scale']})")
    check(st['handBottom'] <= st['vh'] + 2, f"start: the whole match on screen, the hand inside the window ({round(st['handBottom'])} <= {st['vh']}, --gd-k {st['gdk'] or 1})")
    check(st['foeH'] == 0, f"start: the vault's empty middle row is hidden ({st['foeH']} px)")
    first = [c for c in st['cpu'] if c['round'] == 1]
    check(bool(first), f"W4: the CPU ally played on the first turn by itself, {first[0]['ms'] if first else '?'} ms in (its drawn delay is checked below; the page's own lag on top)")
    if st['allyW']:
        check(abs(st['allyW'] - st['mineW']) <= 1, f"W10: the ally's card as wide as mine ({st['allyW']} vs {st['mineW']})")
    else:
        print('  (the CPU ally pitched or passed on turn 1: the width is checked later)')
    await shot(page, 'start', w)
    # the vault's bramble holds out for the test's turns (a quick deck could win the floor before the rewards step; that floor is won on purpose below)
    await page.evaluate("()=>{ const hq = matchState.coop.T.players[2].hq; hq.hp = hq.maxHp = 400; renderHUD(); }")
    # 2. every own slot, a few turns
    dragged = False; played = 0
    for k in range(4):
        await page.evaluate(WAIT_TURN)
        pr = await page.evaluate(PROBE)
        if pr.get('none'):
            await page.evaluate(END_TURN); continue
        check(not pr['refused'] and not pr['hidden'], f"turn {k + 1}: every '+' shown is accepted and every accepted slot is shown (shown {pr['shown']}, refused {pr['refused']}, hidden {pr['hidden']})")
        tgt = sorted(pr['vis'] or pr['shown'], key=lambda a: -abs(a[1]))[0] # the outermost '+' on screen (a phone frames the units' columns; the board pans to the rest)
        sel = f'#battlefieldInner .reserve-target[data-reserve="{tgt[0]}"][data-slot="{tgt[1]}"]' if tgt[0] else f'#rowMine .slot-target[data-slot="{tgt[1]}"]'
        if not phone and not dragged:
            await page.evaluate("()=>{ matchState.selectedUid = null; renderBoard(); renderHand(); }")
            sb = await page.locator(f'#handStrip .card-tile[data-handuid="{pr["uid"]}"]').bounding_box()
            await page.mouse.move(sb['x'] + sb['width'] / 2, sb['y'] + 20); await page.mouse.down()
            await page.mouse.move(sb['x'] + sb['width'] / 2, sb['y'] - 80, steps=5); await page.wait_for_timeout(150)
            db = await page.locator(sel).first.bounding_box()
            if db: await page.mouse.move(db['x'] + db['width'] / 2, db['y'] + db['height'] / 2, steps=8); await page.wait_for_timeout(150)
            await page.mouse.up(); dragged = True; how = 'dragged'
        else:
            await tap(page, sel); how = 'tapped'
        await page.wait_for_timeout(700)
        got = await page.evaluate(f"()=>{{ const u = BramblewoodCoop.unitAt(matchState.coop.T, {tgt[0]}, {tgt[1]}); return u ? {{seat: u.coopSeat, uid: u.uid}} : null; }}")
        if not got: print('  debug', await page.evaluate(f"()=>({{toasts: [...document.querySelectorAll('.toast')].map(t=> t.textContent).slice(-3), pend: GD.s.pending, sel: matchState.selectedUid, inHand: matchState.players[1].hand.some(h=> h.uid === {pr['uid']}), done: gdMyDone(matchState), resolving: matchState.resolving, log: GD.s.log.slice(-4), rej: GD.s.rejected.slice(-2), round: matchState.round}})"))
        check(bool(got) and got['seat'] == 0, f"turn {k + 1}: my card {how} into {tgt[0]}:{tgt[1]} landed there ({got})")
        if got: played += 1
        await page.evaluate(END_TURN)
    check(played >= 2, f'own slots: {played} plays landed')
    # the ally's card size, now that it has played
    aw = await page.evaluate("""()=>{ const mine = document.querySelector('#rowMine > .board-card[data-uid]'), ally = document.querySelector('#resMine1 > .board-card[data-uid]'); // the card's box (a Flying unit's tile hovers narrower inside it)
      return {mine: mine ? mine.offsetWidth : 0, ally: ally ? ally.offsetWidth : 0}; }""")
    if aw['ally'] and aw['mine']: check(abs(aw['ally'] - aw['mine']) <= 1, f"W10: the ally's cards are the size of mine ({aw})")
    if os.environ.get('BW_DEBUG'): print('  rows', await page.evaluate(open(os.environ['BW_DEBUG']).read()))
    # 3. cross-row, on a board laid out for it: my card at 0:-2, the ally's at 1:2 (the rest of the middle row cleared)
    await page.evaluate(WAIT_TURN)
    cr = await page.evaluate("""()=>{ const m = matchState, C = BramblewoodCoop, T = m.coop.T, E = T.E, pl = T.players[1];
      const rw = pl.reserve[0]; Object.keys(rw).forEach(k=> delete rw[k]);
      let mineAt = E.allBoardCards(pl).find(c=> c.hp > 0 && c.coopSeat === 0 && c.slot !== 0) || E.allBoardCards(pl).find(c=> c.hp > 0 && c.coopSeat === 0);
      const t = mineAt.slot > 0 ? -2 : 2; const ally = E.fillReserve(pl, 1, t, 'baby-bat'); ally.coopSeat = 1; ally.holdRow = true;
      [t - 1, t + 1].forEach(x=>{ const u = C.unitAt(T, 0, x); if(u && u.coopSeat === 0) u.coopSeat = 1; }); // nothing of mine beside or in front of the ally's neighbours
      lastBoardSig = {1: null, 2: null};
      const me = m.players[1], defs = getCardDefs(); me.lumber = 9;
      const h = me.hand.find(h=> m.engine.canPlay(me, h.defId, h.uid) && !C.noSlotCard(defs[h.defId]) && !C.unsupportedCard(defs[h.defId])); if(!h) return {none: true};
      m.selectedUid = h.uid; renderBoard(); renderHand();
      const legal = C.rowLegalSlots(T, 1, 0), refusedSlot = [t - 1, t + 1].find(x=> C.COLS.includes(x) && !C.unitAt(T, 1, x) && !legal.includes(x));
      const shown = [...document.querySelectorAll('#battlefieldInner .reserve-target[data-reserve="1"]')].map(x=> Number(x.dataset.slot));
      return {uid: h.uid, allowed: mineAt.slot, allySlot: t, refusedSlot, legal, shown}; }""")
    if cr.get('none'):
        check(False, 'cross-row: no playable card for the check')
    else:
        check(cr['allowed'] in cr['shown'] and cr['allowed'] in cr['legal'], f"W10 allowed: a '+' in the ally's row behind my own card (1:{cr['allowed']}) ({cr})")
        check(cr['refusedSlot'] is not None and cr['refusedSlot'] not in cr['shown'], f"W10 refused: no '+' beside only the ally's card (1:{cr['refusedSlot']})")
        await shot(page, 'cross-row', w)
        ref = await page.evaluate(f"""async()=>{{ const m = matchState, n0 = Object.keys(GD.s.pending).length; gdClaimPlay({cr['uid']}, {cr['refusedSlot']}, null, {{reserve: 1}});
          await new Promise(r=> setTimeout(r, 400)); return {{pending: Object.keys(GD.s.pending).length - n0, unit: !!BramblewoodCoop.unitAt(m.coop.T, 1, {cr['refusedSlot']}), inHand: m.players[1].hand.some(h=> h.uid === {cr['uid']})}}; }}""")
        check(ref['pending'] == 0 and not ref['unit'] and ref['inHand'], f"W10 refused: a claim beside only the ally's card is refused, the card stays in hand ({ref})")
        await page.evaluate("()=>{ matchState.selectedUid = %d; lastBoardSig = {1: null, 2: null}; renderBoard(); renderHand(); }" % cr['uid'])
        await tap(page, f'#battlefieldInner .reserve-target[data-reserve="1"][data-slot="{cr["allowed"]}"]'); await page.wait_for_timeout(700)
        ok_ = await page.evaluate(f"()=>{{ const u = BramblewoodCoop.unitAt(matchState.coop.T, 1, {cr['allowed']}); return u ? u.coopSeat : null; }}")
        if ok_ != 0: print('  debug', await page.evaluate(f"()=>({{toasts: [...document.querySelectorAll('.toast')].map(t=> t.textContent).slice(-3), pend: GD.s.pending, sel: matchState.selectedUid, inHand: matchState.players[1].hand.some(h=> h.uid === {cr['uid']}), done: gdMyDone(matchState), resolving: matchState.resolving, log: GD.s.log.slice(-3), rej: GD.s.rejected.slice(-2)}})"))
        check(ok_ == 0, f"W10 allowed: my card lands in the ally's row (1:{cr['allowed']}, seat {ok_})")
        await page.evaluate(END_TURN)
    # 4. the CPU ally's later turns
    cpu = await page.evaluate("()=> ({acts: GD.cpuLog || [], drawn: GD.cpuDrawn || []})")
    drawn = {d['round']: d['ms'] for d in cpu['drawn']}
    firsts = {}
    for c in cpu['acts']: firsts.setdefault(c['round'], c['ms'])
    later = {r: (drawn.get(r), v) for r, v in firsts.items() if r >= 2}
    check(bool(later) and all(d is not None and 500 <= d <= 3000 for d, v in later.values()), f"W4: each later turn the CPU ally's delay is drawn in 0.5-3.0 s (round: (drawn, acted ms) {later})")
    check(all(v >= d - 60 for d, v in later.values() if d is not None), 'W4: the CPU ally never acts before its delay')
    check(drawn.get(1) is not None and 500 <= drawn[1] <= 1500, f"W4: the first turn's delay is drawn in 0.5-1.5 s ({drawn.get(1)})")
    # 5. Auto
    await page.evaluate(WAIT_TURN)
    has = await page.evaluate("()=> !!document.getElementById('autoplayBtn')")
    if not has: print('  debug auto', await page.evaluate("()=> ({over: matchState && matchState.over, phase: GD.phase, mode: matchState && matchState.mode, vault: matchState && matchState.coop && matchState.coop.T.players[2].hq.hp, round: matchState && matchState.round})"))
    check(has, 'W6: the Auto-play control is there in the group dungeon')
    if has:
        auto = await page.evaluate("""async()=>{ const m = matchState, n0 = GD.s.log.length, r0 = m.round; document.getElementById('autoplayBtn').click();
          for(let i = 0; i < 60 && !GD.s.log.slice(n0).some(a=> a.seat === 0); i++) await new Promise(r=> setTimeout(r, 150));
          const mine = GD.s.log.slice(n0).filter(a=> a.seat === 0).map(a=> a.kind); m.autoplay = false; return {on: true, mine, round: m.round, r0}; }""")
        check(len(auto['mine']) >= 1, f"W6: Auto on, my seat acts without me ({auto['mine']})")
        await page.evaluate(END_TURN)
    # 6. rewards
    await page.evaluate(WAIT_TURN)
    await page.evaluate("()=>{ const T = matchState.coop.T; T.players[2].hq.hp = 0; T.players[2].hq.shield = 0; T.players[2].hq.shieldLayers = []; renderHUD(); }")
    await page.evaluate(END_TURN)
    rw = {}
    for _ in range(40):
        rw = await page.evaluate("""()=>{ const ov = document.querySelector('.gd-rw-overlay'); if(!ov) return {open: false, phase: GD.phase};
          return {open: true, title: (ov.querySelector('.wl-title') || {}).textContent || '', counts: ov.querySelectorAll('.winloss-conquest-rewards .reward-count').length, rank: !!ov.querySelector('.rank-hex'),
            next: !!ov.querySelector('[data-gd-rw="next"]'), z: +getComputedStyle(ov).zIndex, panelUnder: !!document.querySelector('#gdOverlay .gd-panel')}; }""")
        if rw.get('open'): break
        await page.wait_for_timeout(250)
    check(rw.get('open') and rw.get('counts', 0) >= 1 and rw.get('rank') and rw.get('next'), f"W6: a won floor opens the rewards window (counters, rank emblem, Go deeper) ({rw})")
    check(rw.get('panelUnder') and rw.get('z', 0) > 9000, 'W6: the floor panel stays under it as the hub')
    cnt = await page.evaluate("""async()=>{ for(let i = 0; i < 60; i++){ const els = [...document.querySelectorAll(".gd-rw-overlay .reward-count")]; if(els.length && els.every(e=> e.classList.contains("is-counted"))) break; await new Promise(r=> setTimeout(r, 150)); }
      return [...document.querySelectorAll(".gd-rw-overlay .reward-count")].map(e=> [e.textContent, e.dataset.target]); }""")
    check(bool(cnt) and all(t == "+" + n for t, n in cnt), f"W6: the rewards count up to the floor's chest ({cnt})")
    await shot(page, 'rewards', w)
    if rw.get('next'):
        await page.click('.gd-rw-overlay [data-gd-rw="next"]'); await page.wait_for_timeout(1800)
        nx = await page.evaluate("()=> ({floor: matchState && matchState.coop && matchState.coop.T.floorIdx, open: !!document.querySelector('.gd-rw-overlay'), phase: GD.phase})")
        check(nx['floor'] == 1 and not nx['open'] and nx['phase'] == 'fight', f'W6: Go deeper starts floor 2 and closes the window ({nx})')
    await page.evaluate("()=> gdClose(true)")
    real = [e for e in errs if 'ERR_' not in e]
    check(not real, f'no page errors ({real[:3]})')
    await ctx.close()

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=EXE)
        for w in [int(x) for x in os.environ.get('BW_WIDTHS', '390,1366').split(',')]:
            await run_width(browser, w)
        await browser.close()
    print('FAILED: %d' % len(failures) if failures else 'ALL OK')
    sys.exit(1 if failures else 0)

asyncio.run(main())
