#!/usr/bin/env python3
"""FIX4 (2026-11-02): browser regression checks for the app bugs the QA1 health check found, on the built index.html.

  1. PvP (Collection, a levelled stranger): the stranger puts units on the board (its id@lvN cards are known to the engine), no page error.
     The Async Arena ghost too.
  2. Live Ranked: no coach tip or lesson opens (the Triggers lesson used to hold the host's replay of the peer's move), and a round
     never waits on one. The full two-browser match is tests/e2e/live_two_player.py.

  python3 tests/e2e/fix4_2026_11_02.py
"""
import asyncio, sys, os
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
URL = 'file://' + os.path.join(HERE, '..', '..', 'index.html')
EXE = os.environ.get('BW_CHROMIUM', '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell')
INIT = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_pitch_open_v1','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); localStorage.setItem('bramblewood_world_open_v1','1'); localStorage.setItem('bramblewood_arena_faction','otters'); localStorage.setItem('bramblewood_map_revealed_v1','[\"*\"]'); localStorage.setItem('bramblewood_dialogue_flags_v1', JSON.stringify({'lesson:lumber':true}));"
        "sessionStorage.setItem('bramblewood_seen_splash','1'); localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek']));")
SETUP = ("Object.keys(CARD_DEFS_BASELINE).forEach(id=>{ delete CARD_DEFS_BASELINE[id].unattainable; if(liveCards[id]) delete liveCards[id].unattainable; }); try{ invalidateCardDefs(); }catch(e){}"
         "FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); Object.entries(myDeckCounts).forEach(([id,n])=>{for(let i=0;i<n;i++) unlockCardForPlayer(id,'test');});"
         "try{ skipTriggerLesson(); }catch(e){} 1")
fails = []
def check(c, m):
    print(('  OK   ' if c else '  FAIL ') + m)
    if not c: fails.append(m)

async def fresh(b, setup=SETUP):
    pg = await b.new_page(viewport={'width': 1366, 'height': 860}); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:300])); pg.on('dialog', lambda d: asyncio.ensure_future(d.accept()))
    await pg.add_init_script(INIT); await pg.goto(URL); await pg.wait_for_timeout(1300)
    await pg.evaluate(setup)
    return pg, errs

async def skip_vs(pg):
    for _ in range(40):
        vs = await pg.query_selector('.vs-screen, .vs-opener')
        if not vs: return
        try: await vs.click(timeout=800)
        except Exception: pass
        await pg.wait_for_timeout(150)

SKIP = """(async()=>{ const m = matchState; if(!m || m.over) return 'none';
  for(let i=0; i<60 && matchState && (matchState.resolving || matchState.active !== 1); i++) await new Promise(r=> setTimeout(r, 100));
  try{ skipTurn(); }catch(e){ return 'skip-err ' + e.message; }
  for(let i=0; i<100 && matchState && matchState.resolving; i++) await new Promise(r=> setTimeout(r, 100));
  return 'ok'; })()"""
ENEMY_UNITS = "(()=>{ const m = matchState; if(!m) return -1; const p = m.players[2]; return [...p.row.left, ...p.row.center, ...p.row.right].length + (p.graveyard||[]).length; })()"

async def stranger(b, label, start, mode):
    pg, errs = await fresh(b)
    r = await pg.evaluate(f"(()=>{{ try{{ playSubTab='arena'; switchTab('play'); {start}; }}catch(e){{ return 'start-err ' + e.message; }} return 'ok'; }})()")
    check(r == 'ok', f'{label}: started ({r})')
    await pg.wait_for_timeout(900); await skip_vs(pg); await pg.wait_for_timeout(600)
    st = await pg.evaluate("matchState ? matchState.mode : null")
    check(st == mode, f'{label}: match mode {st}')
    if mode == 'pvp':
        lv = await pg.evaluate("(()=>{ const g = matchState && matchState.pvpGhost; if(!g) return 'no ghost'; const ids = Object.keys(g.deck||{}).filter(id=> /@lv/.test(id)); const e = matchState.engine, known = id=>{ try{ return e.costOfCard(id) != null; }catch(x){ return false; } }; return {lv: g.pvpLevel, levelled: ids.length, known: ids.every(known)}; })()")
        print('    stranger', lv)
        if isinstance(lv, dict) and lv.get('levelled'): check(lv.get('known'), f'{label}: every id@lvN card of the stranger is known')
    n = 0
    for _ in range(5):
        t = await pg.evaluate(SKIP)
        if 'err' in str(t): check(False, f'{label}: {t}'); break
        await pg.wait_for_timeout(500)
        n = await pg.evaluate(ENEMY_UNITS)
        if n > 0: break
    check(n > 0, f'{label}: the opponent put units on the board ({n})')
    check(not errs, f'{label}: no page errors {errs[:2]}')
    await pg.evaluate("(()=>{ try{ if(matchState) endMatch(); }catch(e){} return 1; })()"); await pg.close()

async def live_no_tips(b):
    # a fresh save that has seen no lessons: the Triggers / Pitch lessons would open in any other mode
    pg, errs = await fresh(b, "1")
    await pg.evaluate("localStorage.removeItem('bramblewood_coach_seen'); try{ coachSeen.clear(); }catch(e){} 1")
    await pg.evaluate("(()=>{ playSubTab='arena'; switchTab('play'); startMatch('ai'); })()")
    await pg.wait_for_timeout(900); await skip_vs(pg); await pg.wait_for_timeout(400)
    r = await pg.evaluate("""(async()=>{ const m = matchState; if(!m) return 'no match'; hideCoachTip(); m.mode = 'liveRanked'; m.liveRole = 'host'; m.liveMySeat = 1;
      maybeShowCoachTip(); const a = !!coachOpen;
      showCoachTip({id:'tl-what', pause:true, gate:true, text:'x', anchor:()=> document.body}, document.body); const b = !!coachOpen;
      hideCoachTip(); m.mode = 'ai'; showCoachTip({id:'fx4-pause', pause:true, text:'x', anchor:()=> document.body}, document.body); m.mode = 'liveRanked'; /* a tip left open from before */
      const t0 = Date.now(); await Promise.race([waitForBlockingCoach(m), new Promise(r=> setTimeout(r, 3000))]); const waited = Date.now() - t0; hideCoachTip();
      m.mode = 'ai'; m.liveReplaying = true; maybeShowCoachTip(); const c = !!coachOpen; m.liveReplaying = false;
      return {a, b, c, waited}; })()""")
    print('    live', r)
    check(isinstance(r, dict) and not r['a'] and not r['b'], f'live ranked: no coach tip opens ({r})')
    check(isinstance(r, dict) and not r['c'], 'no coach tip while the host replays a live move')
    check(isinstance(r, dict) and r['waited'] < 1000, 'live ranked: a round does not wait on a tip')
    check(not errs, f'live ranked: no page errors {errs[:2]}')
    await pg.close()

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=EXE)
        await stranger(b, 'pvp (collection stranger)', "startMatch('pvp', {standard:false})", 'pvp')
        await stranger(b, 'async arena ghost', "startMatch('async')", 'async')
        await live_no_tips(b)
        await b.close()
    print(f'\nfix4 e2e: {len(fails)} failure(s)')
    sys.exit(1 if fails else 0)

asyncio.run(main())
