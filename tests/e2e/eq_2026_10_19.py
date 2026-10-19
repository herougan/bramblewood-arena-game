#!/usr/bin/env python3
"""Package EQ (2026-10-19) on the real game page in headless Chromium: equipment on the slots and the slot hazards.

    python3 tests/e2e/eq_2026_10_19.py            # about 30 s; EQ_SHOTS=dir also saves screenshots

  1. an equipment card played into an open slot lies there alone (a small item in the cell, .eq-lone);
  2. dragged onto a unit it goes under it (.eq-under, pulsing while it is equipping); the card detail says so;
  3. a hazard card held (tapped to arm) turns every cell of both rows into a drop target (body.eq-hz-holding, [data-hzcell]); a tap
     on an enemy cell lays the hazard there (.eq-floor-lava, the log line);
  4. no page error. Not in tests/run-all.sh (a browser run). Exit code 1 on any failure.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
URL = 'file://' + os.path.join(ROOT, 'index.html')
EXE = os.environ.get('BW_CHROMIUM', '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell')
SHOTS = os.environ.get('EQ_SHOTS')
INIT = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_pitch_open_v1','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1');"
        "sessionStorage.setItem('bramblewood_seen_splash','1'); localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek']));")
BATTLE = "(()=>{const m=CONQUEST_MAPS[0]; const n=m.nodes.find(n=>n.kind==='skirmish'); conquestSelectedMap=m.id; playSubTab='conquest'; switchTab('play'); startConquestMatch(m.id,n.key,{skipEnergyCost:true,noOpener:true}); return 1;})()"
SETUP = """()=>{ const m = matchState, E = m.engine;
  const put = (pid, defId, slot)=>{ const c = E.makeBoardCard(defId); c.slot = slot; c.wait = 0; const pl = m.players[pid]; (slot===0?pl.row.center:slot<0?pl.row.left:pl.row.right).push(c); return c; };
  [1,2].forEach(pid=>{ const pl = m.players[pid]; pl.row.left = []; pl.row.center = []; pl.row.right = []; });
  put(2, 'chipmunk-skirmisher', 0); put(2, 'chipmunk-skirmisher', -1); const mine = put(1, 'chipmunk-skirmisher', 0);
  E.syncSlots(m.players[1]); E.syncSlots(m.players[2]); E.floorScan(m.players, m.sideOf || (id=> id===1?'A':'B'), {}, []);
  const pl = m.players[1]; pl.playedThisTurn = false; pl.playsTurn = -99; pl.lumber = 9;
  pl.hand.push({uid: 880001, defId:'crowbar'}, {uid: 880002, defId:'crowbar'}, {uid: 880003, defId:'magma-vent'});
  renderBoard(); renderHand(); return mine.uid; }"""
failures = []
def check(cond, msg):
    if not cond: failures.append(msg); print('  FAIL', msg)
    return cond
async def settle(pg):
    for _ in range(60):
        if await pg.evaluate("!(matchState.resolving || matchState._committing || matchState._upkeep || matchState.awaitingPass)"): break
        await pg.wait_for_timeout(250)
    await pg.wait_for_timeout(300)
async def shot(pg, name):
    if SHOTS: os.makedirs(SHOTS, exist_ok=True); await pg.screenshot(path=os.path.join(SHOTS, name + '.png'))

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=EXE if os.path.exists(EXE) else None)
        ctx = await b.new_context(viewport={'width': 1366, 'height': 768}); pg = await ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('dialog', lambda d: asyncio.ensure_future(d.accept()))
        await pg.add_init_script(INIT); await pg.goto(URL); await pg.wait_for_timeout(1500)
        await pg.evaluate("FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); myCurrencies.energy = 60; window.showCoachTip = function(){}; 1")
        await pg.evaluate(BATTLE); await pg.wait_for_timeout(2500)
        mine = await pg.evaluate(SETUP); await pg.wait_for_timeout(500)
        # 1. a lone piece in an open slot
        await pg.evaluate("playCardByUid(880001, 1); 1"); await pg.wait_for_timeout(900)
        r = await pg.evaluate("({lone: !!(matchState.players[1].eqSlots||{})[1], drawn: !!document.querySelector('#rowMine .eq-lone')})")
        check(r['lone'] and r['drawn'], f'1. a lone Crowbar lies in slot 1 and is drawn ({r})')
        await shot(pg, 'eq-lone')
        # 2. under a unit: equipping (once the round the first play started is over)
        await settle(pg)
        await pg.evaluate("(()=>{ const pl = matchState.players[1]; pl.playedThisTurn = false; pl.playsTurn = -99; matchState.resolving = false; matchState._needsCommit = false; matchState._committing = false; return 1; })()")
        await pg.evaluate(f"devilryDropOnto({mine}, 880002); 1"); await pg.wait_for_timeout(600)
        r = await pg.evaluate(f"""(()=>{{ const u = [...matchState.players[1].row.center][0]; renderBoard();
          const el = document.querySelector('#rowMine .eq-under.is-equipping');
          const lines = describeEffects(getCardDefs()[u.defId], u).join(' | ');
          return {{eq: u.equipment, pend: u.equipping, drawn: !!el, detail: lines}}; }})()""")
        check(r['eq'] == 'crowbar' and r['pend'] == 1 and r['drawn'], f'2. the Crowbar goes under the unit, equipping ({r})')
        check('Equipping' in r['detail'], f'2. the card detail says it is equipping ({r["detail"][:200]})')
        await shot(pg, 'eq-under')
        await settle(pg)
        # 3. a hazard: armed, both rows are targets, a tap lays it
        await pg.evaluate("(()=>{ const pl = matchState.players[1]; pl.playedThisTurn = false; pl.playsTurn = -99; matchState.resolving = false; matchState._needsCommit = false; matchState._committing = false; matchState.selectedUid = 880003; renderBoard(); renderHand(); document.body.dispatchEvent(new Event('pointerup', {bubbles:true})); return 1; })()")
        await pg.wait_for_timeout(400)
        r = await pg.evaluate("({hold: document.body.classList.contains('eq-hz-holding'), cells: document.querySelectorAll('#rowEnemy [data-hzcell]').length, mine: document.querySelectorAll('#rowMine [data-hzcell]').length})")
        check(r['hold'] and r['cells'] >= 2 and r['mine'] >= 2, f'3. holding Magma Vent: both rows are drop targets ({r})')
        await shot(pg, 'eq-hz-holding')
        await pg.evaluate("(()=>{ const t = document.querySelector('#rowEnemy [data-hzcell=\"2:0\"]'); t.dispatchEvent(new MouseEvent('click', {bubbles:true, cancelable:true})); return 1; })()")
        await pg.wait_for_timeout(1500)
        r = await pg.evaluate("({f: matchState.engine.floorAt(2, 0), drawn: !!document.querySelector('#rowEnemy .eq-floor-lava'), log: [...document.querySelectorAll('#battleLog *')].some(x=> /Lava Floor/.test(x.textContent))})")
        check(r['f'] and r['f']['kind'] == 'lava' and r['drawn'], f'3. a tap on the enemy cell lays Lava there and it is drawn ({r})')
        await shot(pg, 'eq-lava')
        check(not errs, f'4. no page error ({errs[:3]})')
        await b.close()
    print('eq e2e:', 'OK' if not failures else f'{len(failures)} failure(s)')
    sys.exit(1 if failures else 0)
asyncio.run(main())
