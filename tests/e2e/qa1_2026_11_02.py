#!/usr/bin/env python3
"""QA1 (2026-11-02, owner: "Make sure all the other games are ok. like raid etc."): every game mode, once, on the built index.html.
Each mode is started the way its button starts it, then played (a real turn) and pushed to an end state (a win via the enemy bramble
at 0, the result screen, then leave), at 1366x860 and at 390x844. Any page error fails the mode.

Modes: conquest skirmish (N-SK), the endless floor (6-MM-1), the old dungeon run, the gauntlet, quick battle, pass & play, PvP (a
ghost stranger), the Async Arena, the offline raid, a raid part, the raid claim screen and its reward card, the tutorial (stage 1),
the quests (Notices), packs (shop buy), the Nest and the shop. Co-op and live two-player have their own scripts with a mock relay
(coop3_2026_10_30.py, live_two_player.py).

  python3 tests/e2e/qa1_2026_11_02.py            both widths
  python3 tests/e2e/qa1_2026_11_02.py 390        one width
  python3 tests/e2e/qa1_2026_11_02.py 390 raid   modes whose name contains 'raid'
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
         "myCurrencies.energy=60; myCurrencies.gold=5000; saveCurrencies&&saveCurrencies(); saveEnergyState({current:(typeof energyMax==='function' ? energyMax() : 20), lastRegenAt:Date.now()}); refreshEnergyHud();"
         "try{ skipTriggerLesson(); }catch(e){} try{ localStorage.setItem('bramblewood_res3_level_track_v1', JSON.stringify({granted: 999})); }catch(e){} 1")
RESULT_SEL = '.winloss-card, .winloss-overlay, .rr-stage, .fxf-rcs, .tut-result, .gauntlet-result'
# play one real turn: a playable card if there is one, else skip (the AI answers)
TURN = """(async()=>{ const m = matchState; if(!m || m.over) return 'none'; const me = m.players[1];
  const h = me.hand.find(x=> m.engine.canPlay(me, x.defId, x.uid)); if(h){ try{ playCardByUid(h.uid, 'left'); }catch(e){ return 'play-err ' + e.message; } }
  else { try{ skipTurn(); }catch(e){ return 'skip-err ' + e.message; } }
  for(let i=0; i<80 && matchState && matchState.resolving; i++) await new Promise(r=> setTimeout(r, 100));
  return h ? 'played' : 'skipped'; })()"""
WIN = """(async()=>{ const M = matchState; if(!M) return 'no match'; if(M.over) return 'already over';
  M.resolving = false; M.players[2].hq.shield = 0; M.players[2].hq.hp = 0; M.forcedWinner = 1;
  try{ await resolveRound({manual:true, run:()=> true}); }catch(e){ return 'resolve-err ' + e.message; }
  await new Promise(r=> setTimeout(r, 4000)); return 'ok'; })()"""

results = []   # (width, mode, ok, note)
ONLY = [a for a in sys.argv[1:] if not a.isdigit()]   # a mode-name substring picks modes (debugging)
def wanted(mode): return not ONLY or any(o in mode for o in ONLY)
def rec(w, mode, ok, note=''):
    results.append((w, mode, ok, note)); print(f"  {'OK  ' if ok else 'FAIL'} {w} {mode}{' — ' + note if note else ''}")

async def fresh(b, w, h):
    pg = await b.new_page(viewport={'width': w, 'height': h}); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:300])); pg.on('dialog', lambda d: asyncio.ensure_future(d.accept()))
    await pg.add_init_script(INIT); await pg.goto(URL); await pg.wait_for_timeout(1300)
    await pg.evaluate(SETUP)
    return pg, errs

async def skip_vs(pg):
    for _ in range(40):
        vs = await pg.query_selector('.vs-screen, .vs-opener')
        if not vs: return
        try: await vs.click(timeout=800)
        except Exception: pass
        await pg.wait_for_timeout(150)

async def fight(b, w, h, mode, start_js, expect_mode=None, win=True):
    if not wanted(mode): return
    pg, errs = await fresh(b, w, h); note = []
    try:
        r = await pg.evaluate(f"(()=>{{ try{{ {start_js}; }}catch(e){{ return 'start-err ' + e.message; }} return 'ok'; }})()")
        if r != 'ok': note.append(r)
        await pg.wait_for_timeout(900); await skip_vs(pg)
        st = await pg.evaluate("matchState ? matchState.mode : null")
        if not st: note.append('no matchState after start')
        else:
            if expect_mode and st != expect_mode: note.append(f'mode {st}, expected {expect_mode}')
            t = await pg.evaluate(TURN); await pg.wait_for_timeout(600)
            if 'err' in str(t): note.append(t)
            if win:
                wr = await pg.evaluate(WIN)
                if wr not in ('ok', 'already over'): note.append('win: ' + str(wr))
                over = await pg.evaluate("!!(matchState && (matchState.over || matchState.resultDecided)) || !matchState")
                shown = await pg.evaluate(f"!!document.querySelector('{RESULT_SEL}')")
                if not over: note.append('match not over after the bramble fell')
                if not shown and await pg.evaluate("!!matchState"): note.append('no result screen')
            # leave
            await pg.evaluate("(()=>{ try{ document.querySelectorAll('.fxf-rcs').forEach(e=> e.click()); }catch(e){} try{ if(matchState){ endMatch(); } }catch(e){} try{ switchTab('home'); }catch(e){} return 1; })()")
            await pg.wait_for_timeout(700)
            if await pg.evaluate("!!matchState && !matchState.over"): note.append('still in a live match after leaving')
    except Exception as e: note.append('exception ' + str(e)[:200])
    if errs: note.append('page errors: ' + ' | '.join(errs[:3]))
    rec(w, mode, not note, '; '.join(note)); await pg.close()

async def screen(b, w, h, mode, js, check_js):
    if not wanted(mode): return
    pg, errs = await fresh(b, w, h); note = []
    try:
        r = await pg.evaluate(f"(async()=>{{ try{{ {js} }}catch(e){{ return 'err ' + e.message; }} return 'ok'; }})()")
        if r != 'ok': note.append(str(r))
        await pg.wait_for_timeout(1500)
        c = await pg.evaluate(check_js)
        if c is not True: note.append('check: ' + str(c))
        # nothing wider than the screen
        ov = await pg.evaluate("document.documentElement.scrollWidth - innerWidth")
        if ov > 2: note.append(f'page {ov}px wider than the screen')
    except Exception as e: note.append('exception ' + str(e)[:200])
    if errs: note.append('page errors: ' + ' | '.join(errs[:3]))
    rec(w, mode, not note, '; '.join(note)); await pg.close()

CONQ = "(()=>{ const m = CONQUEST_MAPS.find(mm=> /^m/.test(mm.id) && !mm.sub && mm.nodes.some(n=> n.kind==='skirmish')); const n = m.nodes.find(n=> n.kind==='skirmish'); conquestSelectedMap = m.id; playSubTab='conquest'; switchTab('play'); window.__qaNode = m.id + ' ' + n.key; startConquestMatch(m.id, n.key); })()"
ENDLESS = "(()=>{ playSubTab='conquest'; switchTab('play'); startConquestMatch('mm', '6-MM-1', {skipEnergyCost:true}); })()"
RAIDPART = "(()=>{ const def = activeRaidDef(); if(!def) throw new Error('no active raid'); const st = currentRaidStateFor(def); const p = (def.parts||[]).find(p=>{ const f = RaidM.fightFor(def, st, p.id, raidStageOpts()); return f && !f.locked && !f.defeated; }); if(!p) throw new Error('no open raid part'); try{ addRaidBonusTickets(5); }catch(e){} try{ localStorage.setItem(RAID_TICKET_ITEM_KEY, '9'); }catch(e){} raidView='raid'; playSubTab='raid'; switchTab('play'); startRaidPartMatch(def, p.id); })()"
CLAIM = """const def = activeRaidDef(); if(!def) return 'no active raid';
  const spec = claimRaidReward(def, {key:'qa1:'+Date.now(), reward:{kind:'kill', tier:'top10', base:{gold:200, dust:40}, cards:2, xp:300}, mine:999999, rank:{rank:'A', won:true}});
  if(!spec) return 'claimRaidReward returned nothing';
  await new Promise(r=> setTimeout(r, 1200));
  const s = document.querySelector('.fxf-rcs'); if(!s) return 'no claim screen';
  s.click(); await new Promise(r=> setTimeout(r, 900));   /* tap skips to the end */
  const card = spec.rewards.find(x=> x.kind==='card'); if(!card) return 'no card on the claim';
  openRaidRewardCard(card.id); await new Promise(r=> setTimeout(r, 600));
  window.__qaRw = {card: card.id, open: raidRewardCardOpen()};"""
TUT = "GUIDED_STEPS.forEach(st=> markCoachSeen(st.id)); beginTutorialStage(1)"

async def run_width(b, w, h):
    print(f'== {w}x{h}')
    await fight(b, w, h, 'conquest skirmish (N-SK)', CONQ)
    await fight(b, w, h, 'endless floor 6-MM-1', ENDLESS)
    await fight(b, w, h, 'dungeon run', "playSubTab='arena'; switchTab('play'); startDungeonFight()")
    await fight(b, w, h, 'gauntlet', "playSubTab='arena'; switchTab('play'); startMatch('gauntlet')", 'gauntlet')
    await fight(b, w, h, 'quick battle', "playSubTab='arena'; switchTab('play'); startMatch('ai')", 'ai')
    await fight(b, w, h, 'pass & play', "playSubTab='arena'; switchTab('play'); startMatch('pc')", 'pc', win=True)
    await fight(b, w, h, 'pvp (ghost)', "playSubTab='arena'; switchTab('play'); startMatch('pvp', {standard:false})", 'pvp')
    await fight(b, w, h, 'async arena', "playSubTab='arena'; switchTab('play'); startMatch('async')", 'async')
    await fight(b, w, h, 'offline raid', "playSubTab='arena'; switchTab('play'); startOfflineRaidMatch()")
    await fight(b, w, h, 'raid part', RAIDPART, 'raidOffline')
    await fight(b, w, h, 'tutorial stage 1', TUT, 'tutorial')
    await screen(b, w, h, 'raid claim + reward card', CLAIM, "(()=>{ const r = window.__qaRw; return r && r.open ? true : JSON.stringify(r); })()")
    await screen(b, w, h, 'quests (Notices)', "openQuestsModal();", "!!document.querySelector('.quests-modal') || 'no quests modal'")
    await screen(b, w, h, 'quests (Errands)', "openQuestsModal('errands');", "!!document.querySelector('.quests-modal') || 'no quests modal'")
    # a pack is credited before its animation (2026-10-14); Escape skips to the cards, as flows.py does
    await screen(b, w, h, 'pack (shop buy)', "isSignedIn = ()=>true; window.__qaCopies = ()=> Object.values(myCardCopies).reduce((t,a)=> t + a.length, 0) + (loadPitchHeld()||[]).length; window.__qa0 = __qaCopies(); switchTab('shop'); await new Promise(r=> setTimeout(r, 400)); const b = document.querySelector('[data-buypack=\"bronze\"]:not([data-qty])'); if(!b) return 'no bronze pack button'; b.click(); await new Promise(r=> setTimeout(r, 500)); document.dispatchEvent(new KeyboardEvent('keydown', {key:'Escape', bubbles:true}));",
                 "(()=>{ const n = document.querySelectorAll('.po-card .card-tile').length, got = __qaCopies() - __qa0; return n > 0 && got > 0 ? true : `pack cards shown ${n}, copies credited ${got}, gold ${myCurrencies.gold}`; })()")
    await screen(b, w, h, 'nest', "switchTab('nest');", "(()=> currentTab==='nest' && !!document.getElementById('nestGrid') ? true : 'tab ' + currentTab)()")
    await screen(b, w, h, 'shop', "switchTab('shop');", "(()=> currentTab==='shop' && document.querySelectorAll('[data-buypack]').length > 0 ? true : 'tab ' + currentTab)()")

async def main():
    widths = [(1366, 860), (390, 844)]
    if any(a.isdigit() for a in sys.argv[1:]): widths = [x for x in widths if str(x[0]) in sys.argv[1:]]
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=EXE)
        for w, h in widths: await run_width(b, w, h)
        await b.close()
    bad = [r for r in results if not r[2]]
    print(f'\nqa1: {len(results) - len(bad)}/{len(results)} OK')
    sys.exit(1 if bad else 0)

asyncio.run(main())
