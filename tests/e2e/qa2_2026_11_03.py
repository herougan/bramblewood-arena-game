#!/usr/bin/env python3
"""QA2 (2026-11-03, owner 18:37: "Go through fresh account from scratch once again to test"): the first minutes of a brand-new
player, on the built index.html, from an empty browser profile and offline (every non-file request is aborted, so no sign-in and no
live database). Unlike qa1_2026_11_02.py nothing is pre-seeded: the splash, the warband name, the faction pick, Tutorial I (coach
tips closed the way a player closes them, cards dragged onto the field), its result and the "Your first deck" window, Tutorial II
(the Wandering Traveller dragged on as leader), its top-up window, then Map 0's first fight 0-1 and its result. At 1366x860 and 390x844.

Fails on: a page error, a step that never arrives (stuck), the page wider than the screen. Prints WARN for the QA2 findings it can
see from here (docs/qa2-2026-11-03.md), without failing on them, so a fix shows up as the WARN going away:
  - the "Next: <fight>" line in Spanish (i18nHtmlText('Next: Goat Ledge') read 'Siguiente: Go a Ledge'), after switching the
    language in Settings at 1366
  - battle achievements: conquest wins never reach the match ledger ("Win your first match" stays 0/1 after road wins)

  python3 tests/e2e/qa2_2026_11_03.py          both widths
  python3 tests/e2e/qa2_2026_11_03.py 390      one width
"""
import asyncio, sys, os, time
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
URL = 'file://' + os.path.join(HERE, '..', '..', 'index.html')
EXE = os.environ.get('BW_CHROMIUM', '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell')

fails, warns = [], []
def fail(w, msg): fails.append(f'{w}: {msg}'); print(f'  FAIL {w} {msg}')
def warn(w, msg): warns.append(f'{w}: {msg}'); print(f'  WARN {w} {msg}')
def ok(w, msg): print(f'  OK   {w} {msg}')

STATE = """(()=>{ try{ const m = matchState; if(!m) return null; const me = m.players[1];
  return {over: !!m.over, resolving: !!m.resolving, round: m.round, me: me.hq.hp, foe: m.players[2].hq.hp,
    uids: me.hand.map(h=> String(h.uid)), canPlay: me.hand.map(h=> !!m.engine.canPlay(me, h.defId, h.uid))}; }catch(e){ return null; } })()"""
FREE_SPOT = """(()=>{ const row = document.getElementById('rowMine'); if(!row) return null; const r = row.getBoundingClientRect();
  const ts = [...row.querySelectorAll('.card-tile')].map(t=> t.getBoundingClientRect()).filter(b=> b.width > 20);
  const y = r.top + r.height / 2; if(!ts.length) return [r.left + r.width / 2, y];
  const maxR = Math.max(...ts.map(b=> b.right)), minL = Math.min(...ts.map(b=> b.left)), w = ts[0].width;
  if(maxR + w * 0.7 < r.right) return [maxR + w * 0.6, y]; if(minL - w * 0.7 > r.left) return [minL - w * 0.6, y];
  return [r.left + r.width / 2, y]; })()"""

async def drag_to(pg, el, x, y):
    b = await el.bounding_box()
    if not b: return
    sx, sy = b['x'] + b['width'] / 2, b['y'] + b['height'] / 2
    await pg.mouse.move(sx, sy); await pg.mouse.down()
    for i in range(1, 11):
        await pg.mouse.move(sx + (x - sx) * i / 10, sy + (y - sy) * i / 10); await pg.wait_for_timeout(25)
    await pg.mouse.up(); await pg.mouse.move(5, 5)

async def overflow(pg, w, where):
    ov = await pg.evaluate("document.documentElement.scrollWidth - innerWidth")
    if ov > 2: fail(w, f'{where}: page {ov}px wider than the screen')

async def wait_for(pg, sel, secs):
    t = time.time()
    while time.time() - t < secs:
        if await pg.query_selector(sel): return True
        await pg.wait_for_timeout(500)
    return False

async def play_out(pg, w, label, secs=400):
    """Play the fight as a player: close coach tips and NPC prompts, drag the first playable card to a free spot, else Pass.
    After the 3rd round the leader is dragged on once (Tutorial II asks for it)."""
    t, leader_done, stuck = time.time(), False, 0
    while time.time() - t < secs:
        s = await pg.evaluate(STATE)
        if not s or s['over']: return s
        npc = await pg.query_selector('.npc-prompt-overlay button:visible')
        if npc: await npc.click(force=True); await pg.wait_for_timeout(500); continue
        tip = await pg.query_selector('.coach-ok:visible')
        if tip:
            await pg.mouse.move(5, 5)
            try: await tip.click(force=True, timeout=1500)
            except Exception: pass
            await pg.wait_for_timeout(500); continue
        if s['resolving']: await pg.wait_for_timeout(500); continue
        if not leader_done and s['round'] >= 3:
            lw = await pg.query_selector('.leader-widget')
            if lw:
                p = await pg.evaluate(FREE_SPOT)
                if p: await drag_to(pg, lw, p[0], p[1]); await pg.wait_for_timeout(900)
            leader_done = True; continue
        idx = next((k for k, c in enumerate(s['canPlay']) if c), None)
        if idx is not None and stuck < 3:
            el = await pg.query_selector(f'.hand-strip .card-tile[data-handuid="{s["uids"][idx]}"]')
            p = await pg.evaluate(FREE_SPOT)
            if el and p:
                await drag_to(pg, el, p[0], p[1]); await pg.wait_for_timeout(1000)
                s2 = await pg.evaluate(STATE)
                if s2 and not s2['over'] and s2['uids'] == s['uids'] and s2['round'] == s['round']:
                    stuck += 1; await pg.keyboard.press('Escape')
                else: stuck = 0
                continue
        stuck = 0
        pb = await pg.query_selector('button:has-text("Pass"):visible')
        if pb:
            try: await pb.click(force=True, timeout=1500)
            except Exception: pass
        await pg.wait_for_timeout(900)
    fail(w, f'{label}: the fight did not end in {secs}s'); return await pg.evaluate(STATE)

async def claim(pg):
    # the result card pops in (scaled), so a click can land before the button settles: tap again until the window moves on
    for _ in range(6):
        b = await pg.query_selector('.winloss-overlay button:has-text("Claim Rewards")')
        if not b: return
        await b.scroll_into_view_if_needed(); await pg.wait_for_timeout(1500)
        try: await b.click(timeout=5000)
        except Exception:
            try: await b.click(force=True)
            except Exception: pass
        await pg.wait_for_timeout(3000)

async def deck_window(pg, w, label):
    if not await wait_for(pg, '#ssAdd', 90): fail(w, f'{label}: no "Add to deck" window'); return
    await overflow(pg, w, label)
    await pg.click('#ssAdd', force=True)
    t = time.time()
    while time.time() - t < 90 and await pg.query_selector('.starter-modal'): await pg.wait_for_timeout(500)
    if await pg.query_selector('.starter-modal'): fail(w, f'{label}: the window did not close after "Add to deck"')
    else: ok(w, f'{label}: added in {time.time() - t:.0f}s')

async def run_width(b, w, h):
    print(f'== {w}x{h}')
    ctx = await b.new_context(viewport={'width': w, 'height': h})
    async def offline(r):
        u = r.request.url
        if u.startswith(('file:', 'data:', 'blob:')): await r.continue_()
        else: await r.abort()
    await ctx.route('**/*', offline)
    pg = await ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:300])); pg.on('dialog', lambda d: asyncio.ensure_future(d.accept()))
    t0 = time.time()
    try:
        await pg.goto(URL); await pg.wait_for_timeout(2500)
        if not await wait_for(pg, 'input', 30): fail(w, 'splash: no name field'); return
        await overflow(pg, w, 'splash')
        await pg.fill('input', 'QA2 Twig'); await pg.click('text=Enter the Grove', force=True)
        if not await wait_for(pg, '.faction-btn', 30): fail(w, 'no faction pick'); return
        await pg.wait_for_timeout(1500); await overflow(pg, w, 'faction pick')
        await pg.wait_for_selector('.faction-btn >> nth=0', state='visible', timeout=30000)  # the buttons fade in
        await pg.wait_for_timeout(1000); await pg.click('.faction-btn >> nth=0', force=True)  # it keeps a gentle bob, so never 'stable'
        if not await wait_for(pg, '#rowMine', 40): fail(w, 'Tutorial I did not start'); return
        ok(w, f'Tutorial I starts ({time.time() - t0:.0f}s from load)')
        s = await play_out(pg, w, 'Tutorial I')
        if s and s['over'] and s['foe'] <= 0: ok(w, f'Tutorial I won in {s["round"]} rounds')
        elif s: fail(w, f'Tutorial I not won: {s}')
        if not await wait_for(pg, '.winloss-overlay button:has-text("Claim Rewards")', 40): fail(w, 'Tutorial I: no Claim Rewards'); return
        await overflow(pg, w, 'Tutorial I result')
        await claim(pg)
        await deck_window(pg, w, 'Your first deck')
        if not await wait_for(pg, '.map-node:has-text("T-2")', 30): fail(w, 'no T-2 node on the tutorial map'); return
        await pg.wait_for_timeout(1500)
        tip = await pg.query_selector('.coach-ok:visible')
        if tip: await tip.click(force=True)
        await pg.click('.map-node:has-text("T-2")', force=True)
        if not await wait_for(pg, '.cnp-fight', 20): fail(w, 'T-2: no Fight button'); return
        await pg.click('.cnp-fight', force=True)
        if not await wait_for(pg, '#rowMine', 40): fail(w, 'Tutorial II did not start'); return
        s = await play_out(pg, w, 'Tutorial II')
        if s and s['over'] and s['foe'] <= 0: ok(w, f'Tutorial II won in {s["round"]} rounds')
        elif s: fail(w, f'Tutorial II not won: {s}')
        if not await wait_for(pg, '.winloss-overlay button:has-text("Claim Rewards")', 40): fail(w, 'Tutorial II: no Claim Rewards'); return
        await claim(pg)
        await deck_window(pg, w, 'Tutorial II top-up')
        if not await wait_for(pg, '.map-node:has-text("0-1")', 40): fail(w, 'no 0-1 node on Map 0'); return
        await pg.wait_for_timeout(2500); await overflow(pg, w, 'Map 0')
        await pg.click('.map-node:has-text("0-1")', force=True)
        if not await wait_for(pg, '.cnp-fight', 20): fail(w, '0-1: no Fight button'); return
        await pg.click('.cnp-fight', force=True)
        if not await wait_for(pg, '#rowMine', 40): fail(w, '0-1 did not start'); return
        s = await play_out(pg, w, '0-1')
        if not await wait_for(pg, '.winloss-overlay', 40): fail(w, '0-1: no result screen'); return
        await pg.wait_for_timeout(1500); await overflow(pg, w, '0-1 result')
        won = bool(s and s['foe'] <= 0)
        ok(w, f'0-1 {"won" if won else "lost"} in {s and s["round"]} rounds; {time.time() - t0:.0f}s from load')
        # findings the report lists (WARN, not FAIL)
        if won:
            wins = await pg.evaluate("(()=>{ try{ return loadMatchStats().wins; }catch(e){ return -1; } })()")
            if wins == 0: warn(w, 'a road win is not on the match ledger: "First Victory" (Win your first match) stays 0/1')
        if w == 1366:
            # Spanish through the Settings select, then the Home "Next: <fight>" line (QA2: 'Next: Goat Ledge' read 'Siguiente: Go a Ledge')
            await pg.evaluate("(()=>{ try{ document.querySelectorAll('.winloss-overlay').forEach(e=> e.remove()); if(matchState) endMatch(); }catch(e){} try{ switchTab('home'); }catch(e){} })()")
            await pg.wait_for_timeout(1500)
            sb = await pg.query_selector('#view-home .settings-btn:visible, .settings-btn:visible')
            if sb:
                await sb.click(force=True); await pg.wait_for_timeout(1500)
                sel = await pg.query_selector('select:visible:has(option[value="es"])')
                if not sel: print(f'  SKIP {w} Spanish check: the Settings language select did not show')
                else:
                    await sel.select_option('es'); await pg.wait_for_timeout(4000)
                    r = await pg.evaluate("(()=>{ try{ return i18nHtmlText('Next: Goat Ledge'); }catch(e){ return null; } })()")
                    if r and 'Go a Ledge' in r: warn(w, f"Spanish: 'Next: Goat Ledge' reads '{r}'")
                    elif r: ok(w, f"Spanish: 'Next: Goat Ledge' reads '{r}'")
                    await overflow(pg, w, 'Home in Spanish')
    except Exception as e:
        fail(w, 'exception ' + str(e)[:300])
    finally:
        if errs: fail(w, 'page errors: ' + ' | '.join(errs[:3]))
        await ctx.close()

async def main():
    widths = [(1366, 860), (390, 844)]
    if any(a.isdigit() for a in sys.argv[1:]): widths = [x for x in widths if str(x[0]) in sys.argv[1:]]
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=EXE)
        for w, h in widths: await run_width(b, w, h)
        await b.close()
    print(f'\nqa2: {len(fails)} failure(s), {len(warns)} warning(s)')
    sys.exit(1 if fails else 0)

asyncio.run(main())
