#!/usr/bin/env python3
"""Package FIX7 (2026-11-03, release review 11-03a M1) in the real game page, headless Chromium, at 1366x768 and 390x844.

    python3 tests/e2e/fix7_2026_11_03.py               # about a minute; screenshots in docs/screens/fix7/

A raid board: a Spawner stands Ready in your back row (and, a second run, the middle row). Its On Turn Start spawn fires inside a real
round (resolveRound). Before FIX7 the replay's spawn branch read rr[null].length for that row spawn and threw: resolveRound's recovery
logged "[fight] resolveRound failed" and dropped the rest of the round's animations. Checks:
  - the round's events include the row spawn (lane null, its row and slot);
  - no "resolveRound failed" and no page error;
  - the token is drawn in its reserve row mid-replay (raidReplayReserveSpawn, window.__bwRowSpawns), in the slot the engine gave it;
  - events after the spawn still play (renderVfxForEvent sees them), and the round finishes (the turn opens again);
  - after the round the token stands in that row on the board.
Screenshots: the moment the token lands mid-round, and the board after the round. Not in tests/run-all.sh (a browser run). Exit 1 on failure.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
URL = 'file://' + os.path.join(ROOT, 'index.html')
EXE = os.environ.get('BW_CHROMIUM', '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell')
SHOTS = os.environ.get('FIX7_SHOTS', os.path.join(ROOT, 'docs', 'screens', 'fix7'))
SIZES = [tuple(int(x) for x in s.split('x')) for s in os.environ.get('FIX7_SIZES', '1366x768,390x844').split(',')]
INIT = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_pitch_open_v1','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); localStorage.setItem('bramblewood_world_open_v1','1'); localStorage.setItem('bramblewood_arena_faction','otters'); localStorage.setItem('bramblewood_map_revealed_v1','[\"*\"]'); localStorage.setItem('bramblewood_dialogue_flags_v1', JSON.stringify({'lesson:lumber':true, 'world_revealed_toast':true}));"
        "sessionStorage.setItem('bramblewood_seen_splash','1'); localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','pl-need','pl-do','pl-after']));")
RAID_OPEN = ["playSubTab='raid'; switchTab('play'); 1", "document.querySelector('.raid-hub [data-raid-open]').click()", "document.querySelector('[data-raid-part=left]').click()"]
failures = []
def check(cond, msg):
    print(('  ok   ' if cond else '  FAIL ') + msg)
    if not cond: failures.append(msg)
    return cond

# A Spawner made for the test (no canonical card has the keyword): a plain card given effects.spawner naming a small token (this page only), put
# Ready into your row `row` at the free slot nearest the centre whose neighbours are free. The raid's own rules stay as they are.
SETUP = r"""(row)=>{
  const m = matchState, D = getCardDefs(), E = m.engine, pl = m.players[1];
  const base = Object.values(D).find(d=> d && d.id && !d.token && !d.leader && (d.health||0) >= 6 && !(d.effects && Object.keys(d.effects).length) && d.kind !== 'spell');
  const tok = Object.values(D).find(d=> d && d.id && d.token && (d.health||0) >= 1 && (d.health||0) <= 4 && !(d.effects && Object.keys(d.effects).length)) || base;
  if(!base) return {err: 'no base card'};
  // the raid's engine holds its own copy of the cards; a card it derives itself (sk3DupDefOf: the plain card's Illusion, kept in its
  // derivedDefs, which the page reads too) is the one card the test can change: it becomes the Spawner, for this page only
  const sid = E.sk3DupDefOf(base.id), sd = E.derivedDefs[sid]; if(!sd) return {err: 'no derived card'};
  Object.assign(sd, {name: 'FIX7 Spawner', health: 40, attack: 0, wait: 0, effects: Object.assign({}, sd.effects, {spawner: tok.id})});
  if(E.trigsOf({effects: sd.effects}).every(t=> t.keyword !== 'spawner')) return {err: 'the engine does not see the Spawner'};
  const rw = pl.reserve[row - 1];
  // a slot with a unit in front of it (so the Spawner holds its row instead of stepping up), else any free one
  const ahead = s=> row === 2 ? !!(pl.reserve[0][s] && pl.reserve[0][s].hp > 0) : ['left', 'center', 'right'].some(l=> (pl.row[l] || []).some(c=> c.slot === s && c.hp > 0));
  const order = [0, -1, 1, -2, 2, -3, 3], sl = order.find(s=> !rw[s] && ahead(s)) ?? order.find(s=> !rw[s]);
  if(sl == null) return {err: 'no free slot', row: Object.keys(rw)};
  const c = E.fillReserve(pl, row, sl, sid); if(!c) return {err: 'fillReserve refused'};
  c.wait = 0; renderBoard();
  return {uid: c.uid, slot: sl, tok: tok.id, base: base.id};
}"""

# Hooks: every event renderVfxForEvent plays, in order; at the row spawn, whether the token is drawn in its row by the next event.
INSTR = r"""()=>{
  const L = window.__f7 = {evs: [], spawn: null, drawnAt: null, after: 0, errs: []};
  window.__bwRowSpawns = 0;
  if(!window.__f7Hooked){ window.__f7Hooked = true;
    const ce = console.error; console.error = function(){ try{ window.__f7.errs.push([...arguments].map(String).join(' ')); }catch(_){} return ce.apply(this, arguments); };
    const orig = window.renderVfxForEvent;
    window.renderVfxForEvent = function(ev){ const M = window.__f7;
      try{ if(M && ev){
        if(M.spawn){ M.after++; if(M.drawnAt == null){ const u = M.spawn.uids && M.spawn.uids[0], el = u != null && boardCardEl(u), rowEl = el && el.closest('.reserve-row');
          if(rowEl) M.drawnAt = {row: +rowEl.dataset.resrow, pid: +rowEl.dataset.respid, idx: [...rowEl.querySelectorAll(':scope > .board-card')].indexOf(el), range: matchState._slotRange}; } }
        M.evs.push(ev.type + (ev.cause ? ':' + ev.cause : ''));
        if(!M.spawn && ev.type === 'spawn' && ev.cause === 'triggerSpawn' && ev.lane == null && ev.row != null) M.spawn = JSON.parse(JSON.stringify(ev));
      } }catch(_){}
      return orig.apply(this, arguments); };
  }
  return 1; }"""

async def open_raid(b, w, h):
    phone = w < 800
    ctx = await b.new_context(viewport={'width': w, 'height': h}, has_touch=phone, is_mobile=phone, device_scale_factor=2 if phone else 1)
    pg = await ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('dialog', lambda d: asyncio.ensure_future(d.accept()))
    await pg.add_init_script(INIT)
    await pg.goto(URL); await pg.wait_for_timeout(1500)
    await pg.evaluate("FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); myCurrencies.energy = 60; window.showCoachTip = function(){}; window.deckSizeOkOrWarn = ()=> true; 1")
    for js in RAID_OPEN: await pg.evaluate(js); await pg.wait_for_timeout(700)
    await pg.evaluate("(()=>{ const v = document.querySelector('.vs-screen'); if(v) v.click(); return 1; })()"); await pg.wait_for_timeout(5000)
    await pg.evaluate("document.querySelectorAll('.coach-bubble, .coach-tip, .npc-bubble, .coach-callout').forEach(e=> e.remove()); 1")
    return ctx, pg, errs

async def run(b, w, h, row):
    tag = f'{w}x{h} {"back" if row == 2 else "middle"} row'
    print('--', tag)
    ctx, pg, errs = await open_raid(b, w, h)
    try:
        if not check(await pg.evaluate("!!(matchState && matchState.raidFull && matchState.players[1].reserve)"), f'{tag}: the raid fight opened with reserve rows'): return
        s = await pg.evaluate(SETUP, row)
        if not check(s and not s.get('err'), f'{tag}: a Ready Spawner stands in your row {row} ({s})'): return
        await pg.evaluate(INSTR)
        await pg.evaluate("resolveRound(); 1")
        shot_mid = False; fin = False
        for _ in range(900):
            await pg.wait_for_timeout(100)
            st = await pg.evaluate("(()=>({n: window.__bwRowSpawns || 0, open: !!(matchState && !matchState.resolving && !matchState._upkeep), over: !!(matchState && matchState.over)}))()")
            if st['n'] and not shot_mid:
                shot_mid = True
                await pg.wait_for_timeout(450)  # the token's jump lands
                if SHOTS: await pg.screenshot(path=os.path.join(SHOTS, f'fix7_{w}x{h}_row{row}_mid.png'))
            if st['open'] or st['over']: fin = True; break
        R = await pg.evaluate("window.__f7")
        if os.environ.get('FIX7_DEBUG'):
            print('   events:', R.get('evs')[:80])
            print('   rows:', await pg.evaluate("(()=>{ const m = matchState, pl = m.players[1]; return {res: pl.reserve.map(rw=> Object.keys(rw).map(k=> k + ':' + rw[k].defId + '/w' + rw[k].wait)), round: m.round}; })()"))
        sp = R.get('spawn')
        check(sp is not None, f'{tag}: the round\'s events hold the row spawn (lane null, row {sp and sp.get("row")}, slot {sp and sp.get("slot")})')
        check(sp is not None and sp.get('row') == row and sp.get('nearUid') == s['uid'], f'{tag}: it is the Spawner\'s, in its own row')
        bad = [e for e in R.get('errs', []) if 'resolveRound failed' in e or 'TypeError' in e]
        check(not bad, f'{tag}: no "resolveRound failed" ({bad[:1]})')
        check(not errs, f'{tag}: no page errors ({errs[:2]})')
        n = await pg.evaluate("window.__bwRowSpawns || 0")
        check(n >= 1, f'{tag}: the replay drew the token into its row mid-round (raidReplayReserveSpawn x{n})')
        d = R.get('drawnAt')
        check(d is not None and d.get('row') == row and d.get('pid') == 1 and sp is not None and d.get('idx') == sp.get('slot') + d.get('range'),
              f'{tag}: drawn in reserve row {row}, the engine\'s slot ({d}, slot {sp and sp.get("slot")})')
        check(R.get('after', 0) >= 1, f'{tag}: the round\'s animations go on after the spawn ({R.get("after")} events after it)')
        check(fin, f'{tag}: the round finishes and the turn opens again')
        await pg.wait_for_timeout(600)
        if sp is not None:
            # the round's end (advances and deaths included) matches the engine: the token is drawn where the engine has it, or gone with it
            post = await pg.evaluate("""(sp)=>{ const u = sp.uids[0], pl = matchState.players[1], el = boardCardEl(u), r = el && el.closest('.reserve-row');
              let at = null; pl.reserve.forEach((rw, i)=> Object.values(rw).forEach(c=>{ if(c && c.uid === u && c.hp > 0) at = i + 1; }));
              if(at == null && ['left', 'center', 'right'].some(l=> (pl.row[l] || []).some(c=> c.uid === u && c.hp > 0))) at = 0;
              return {engineRow: at, drawnRow: el ? (r ? +r.dataset.resrow : 0) : null}; }""", sp)
            check(post['engineRow'] == post['drawnRow'], f'{tag}: after the round the board shows the token where the engine has it ({post}; null = gone)')
        if SHOTS: await pg.screenshot(path=os.path.join(SHOTS, f'fix7_{w}x{h}_row{row}_after.png'))
    finally:
        await ctx.close()

async def main():
    if SHOTS: os.makedirs(SHOTS, exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=EXE)
        for (w, h) in SIZES:
            for row in (2, 1):
                await run(b, w, h, row)
        await b.close()
    print(f'\nfix7 e2e: {"FAILED " + str(len(failures)) if failures else "all passed"}')
    sys.exit(1 if failures else 0)

asyncio.run(main())
