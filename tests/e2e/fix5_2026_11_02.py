#!/usr/bin/env python3
"""FIX5 (2026-11-02, owner 21:12: "Dynamic values shouldn't reset on victory. for example swarm bonus is removed on victory."):
browser check on the built index.html.

  A board of Swarm ants (+ Pack runners / a Kinship pair) fights the round that decides the match, a win and a defeat. The Attack and
  Health each unit shows are read on every frame: the last frame of the replay, the deciding render (m.ending) and the board under
  the end sign 3 s later must agree, and must equal what a full render of that unit (boardCardHTML) shows. Before FIX5 the deciding
  render patched each kept unit from the replay's round-start snapshot (no uid), so a Swarm ant fell from 3 to 2 at the moment of winning.
  Writes tests/e2e/shots/fix5_win.png and fix5_defeat.png.

  python3 tests/e2e/fix5_2026_11_02.py
"""
import asyncio, sys, os, re
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
URL = 'file://' + os.path.join(HERE, '..', '..', 'index.html')
SHOTS = os.path.join(HERE, 'shots'); os.makedirs(SHOTS, exist_ok=True)
EXE = os.environ.get('BW_CHROMIUM', '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell')
INIT = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_pitch_open_v1','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); localStorage.setItem('bramblewood_world_open_v1','1'); localStorage.setItem('bramblewood_arena_faction','otters'); localStorage.setItem('bramblewood_map_revealed_v1','[\"*\"]'); localStorage.setItem('bramblewood_dialogue_flags_v1', JSON.stringify({'lesson:lumber':true}));"
        "sessionStorage.setItem('bramblewood_seen_splash','1'); localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek']));")
SETUP = ("Object.keys(CARD_DEFS_BASELINE).forEach(id=>{ delete CARD_DEFS_BASELINE[id].unattainable; if(liveCards[id]) delete liveCards[id].unattainable; }); try{ invalidateCardDefs(); }catch(e){}"
         "FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); try{ skipTriggerLesson(); }catch(e){} 1")
fails = []
def check(c, m):
    print(('  OK   ' if c else '  FAIL ') + m)
    if not c: fails.append(m)

READ = r"""(()=>{ const o = {}; document.querySelectorAll('#rowMine .board-card[data-uid]').forEach(el=>{ const a = el.querySelector('.stats .atk'), h = el.querySelector('.stats .hp');
  o[el.dataset.uid] = [a ? a.textContent.replace(/\D/g, '') : null, h ? h.textContent.replace(/\D/g, '') : null]; }); return o; })()"""
# what a full render of each live unit shows (the truth the patched numbers must equal)
FULL = r"""(()=>{ const m = matchState, E = m.engine, o = {}; E.allBoardCards(m.players[1]).forEach(c=>{ const t = document.createElement('div'); t.innerHTML = boardCardHTML(c, getCardDefs(), {});
  const a = t.querySelector('.stats .atk'), h = t.querySelector('.stats .hp'); o[String(c.uid)] = [a ? a.textContent.replace(/\D/g, '') : null, h ? h.textContent.replace(/\D/g, '') : null]; }); return o; })()"""
REC = r"""(()=>{ window.__fx5 = []; const tick = ()=>{ const m = matchState; if(!m) return; const o = {}; document.querySelectorAll('#rowMine .board-card[data-uid]').forEach(el=>{ const a = el.querySelector('.stats .atk'); o[el.dataset.uid] = a ? a.textContent.replace(/\D/g, '') : null; });
  __fx5.push({over: !!m.over, ending: !!m.ending, replay: !!m.replayRows, atk: o}); if(__fx5.length < 4000) requestAnimationFrame(tick); }; tick(); return 1; })()"""

async def run(b, label, ids, defeat, steady=True, shot=None):
    pg = await b.new_page(viewport={'width': 1366, 'height': 860}); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:300])); pg.on('dialog', lambda d: asyncio.ensure_future(d.accept()))
    await pg.add_init_script(INIT); await pg.goto(URL); await pg.wait_for_timeout(1300); await pg.evaluate(SETUP)
    await pg.evaluate("(()=>{ playSubTab='arena'; switchTab('play'); startMatch('ai'); })()")
    await pg.wait_for_timeout(900)
    for _ in range(40):
        vs = await pg.query_selector('.vs-screen, .vs-opener')
        if not vs: break
        try: await vs.click(timeout=800)
        except Exception: pass
        await pg.wait_for_timeout(150)
    await pg.wait_for_timeout(500)
    n = await pg.evaluate("""(([ids, defeat])=>{ const m = matchState, E = m.engine;
      E.allBoardCards(m.players[1]).forEach(c=> c.hp = 0); E.allBoardCards(m.players[2]).forEach(c=> c.hp = 0); E.removeDeadCards && E.removeDeadCards(m.players, m.sideOf, m.stats, []);
      const put = (pid, id)=>{ const ls = E.legalSlots(m.players[pid]).sort((a, b)=> Math.abs(a) - Math.abs(b)); return E.debugSpawnCard(m.players, m.sideOf, pid, id, ls.length ? ls[0] : 0, m.stats, []); };
      ids.forEach(id=> put(1, id));
      E.allBoardCards(m.players[1]).forEach(c=>{ c.wait = 0; });
      if(defeat){ m.players[1].hq.hp = 1; m.players[2].hq.hp = 999; E.debugSpawnCard(m.players, m.sideOf, 2, 'soldier-ant', 0, m.stats, []);
        // the enemy's unit stands at slot 3, opposite nobody, so it strikes the castle and the ants all live
        const pl = m.players[2], cs = E.allBoardCards(pl); cs.forEach(c=>{ c.slot = 3; c.wait = 0; c.atk = 30; c.hp = c.maxHp = 200; }); pl.row.center = []; pl.row.left = []; pl.row.right = cs;
        E.allBoardCards(m.players[1]).forEach(c=>{ c.hp = c.maxHp = Math.max(c.maxHp, 50); }); }
      else m.players[2].hq.hp = 1;
      renderMatchUI(); return E.allBoardCards(m.players[1]).length; })""", [ids, defeat])
    check(n >= 2, f'{label}: units on the board ({n})')
    await pg.wait_for_timeout(500)
    before = await pg.evaluate(READ); full0 = await pg.evaluate(FULL)
    print('    before', before)
    check(before == full0, f'{label}: before the round the board shows the full render ({full0})')
    await pg.evaluate(REC)
    r = await pg.evaluate("(async()=>{ try{ await resolveRound(); return 'ok'; }catch(e){ return 'err ' + e.message; } })()")
    check(r == 'ok', f'{label}: the round resolved ({r})')
    await pg.wait_for_timeout(3000)
    st = await pg.evaluate("[!!matchState.over, matchState.winner]")
    check(st == [True, 2 if defeat else 1], f'{label}: the match is decided {st}')
    fr = await pg.evaluate("__fx5")
    last_replay = next((f['atk'] for f in reversed(fr) if f['replay'] and not f['ending']), None)
    ending = [f['atk'] for f in fr if f['ending'] or f['over']]
    after = await pg.evaluate(READ); full = await pg.evaluate(FULL)
    print('    last replay frame', last_replay, '| end frames', len(ending), '| after', after, '| full render', full)
    check(after == full, f'{label}: under the end sign each unit shows what a full render shows (Attack and Health)')
    if steady and last_replay is not None:
        same = {u: a for u, a in last_replay.items() if u in after}
        check(all(after[u][0] == a for u, a in same.items()), f'{label}: the Attack does not jump between the last replay frame and the end ({same} -> { {u: after[u][0] for u in same} })')
    check(all(all(f.get(u) == full[u][0] for u in full if u in f) for f in ending), f'{label}: every frame from the deciding render on shows the kept values')
    if steady:
        check(after == before, f'{label}: the deciding round with nobody lost keeps every number ({before} -> {after})')
        ants = [u for u, v in after.items() if v[0] is not None]
        check(any(int(re.sub(r'\D', '', after[u][0]) or 0) > 2 for u in ants), f'{label}: a Swarm ant still shows its bonus (above its printed 2)')
    if shot: await pg.screenshot(path=os.path.join(SHOTS, f'fix5_{shot}.png'))
    check(not errs, f'{label}: no page errors {errs[:2]}')
    await pg.close()

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=EXE)
        await run(b, 'win (Swarm ants)', ['soldier-ant', 'soldier-ant', 'soldier-ant'], False, shot='win')
        await run(b, 'win (Pack + Swarm)', ['dhole-runner', 'dhole-runner', 'soldier-ant', 'soldier-ant'], False)
        # Kinship's +1/+1 lands during the round itself (the Attack rises 4 -> 6 on the live board): no "unchanged" check, only that the
        # end shows what a full render of the decided board shows
        await run(b, 'win (Kinship + Swarm)', ['rivergate-tribune', 'rivergate-tribune', 'soldier-ant', 'soldier-ant'], False, steady=False)
        await run(b, 'defeat (Swarm ants)', ['soldier-ant', 'soldier-ant', 'soldier-ant'], True, shot='defeat')
        await b.close()
    print(f'\nfix5 e2e: {len(fails)} failure(s)')
    sys.exit(1 if fails else 0)

asyncio.run(main())
