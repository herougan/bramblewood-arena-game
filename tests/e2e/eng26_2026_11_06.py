#!/usr/bin/env python3
"""Package ENG26 (2026-11-06): browser checks at 390 and 1366 for the owner's 09:29 notes #1 and #2.
  #1  a card with more context pips than its slots: EVERY slot flips to the next page together (one shared tick), every 3 s (was 2 s, only
      the last slot cycled); a board re-render lands on the same page.
  #2  a row of 9+ units with tiles under about 120px (100px of content box) hides the name scroll (.nm) instead of squeezing it: 1024 with 9 units (94px tiles), 1366
      with 11 (106px); 1366 with 9 (130px) and 1024 with 8 keep it; a phone row (under 70px) already had none.

    python3 tests/e2e/eng26_2026_11_06.py            # shots in tests/out/shots/eng26/
    python3 tests/e2e/eng26_2026_11_06.py --keep     # also copies them into docs/screens/eng26/
Build first. Exits 1 on a failed check.
"""
import argparse, asyncio, os, sys, shutil, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vis3_2026_10_26 as V  # serve, BOARD, SKIP, OWN, CHROME
from playwright.async_api import async_playwright
ROOT = V.ROOT
OUT = os.path.join(ROOT, 'tests', 'out', 'shots', 'eng26'); os.makedirs(OUT, exist_ok=True)
KEEP = os.path.join(ROOT, 'docs', 'screens', 'eng26')
fails = []; shots = []
def ok(cond, msg):
    print(('  ok  ' if cond else '  FAIL ') + msg, flush=True)
    if not cond: fails.append(msg)

# a plain unit (no Leader) whose board strip overflows its 3 slots (has-cycle), the one with the most pips
PICK = """(()=>{ const defs = getCardDefs(); let best = null, bn = 0;
  Object.values(defs).forEach(d=>{ if(!d || d.test || d.token || !d.effects || d.effects.leader || d.field || d.cardType === 'spell' || !(d.health > 0)) return;
    let h = ''; try{ h = abilityBadges(d, {compact:true, live:{uid:-1}}) || ''; }catch(e){} if(!/has-cycle/.test(h)) return;
    const n = (h.match(/class="bc-item/g) || []).length; if(n > bn){ bn = n; best = d.id; } }); return [best, bn]; })()"""
STATE = """(()=>{ const el = document.querySelector('#rowEnemy .board-card .badges.has-cycle'); if(!el) return null;
  const slots = [...el.querySelectorAll(':scope > .badge-cycle')]; return {slots: slots.length, shown: slots.map(s=> [...s.querySelectorAll(':scope > .bc-item')].findIndex(i=> i.classList.contains('is-shown'))), tick: BADGE_CYCLE_TICK, all: el.querySelectorAll(':scope > .abadge').length}; })()"""
NM = """(()=>{ const out = {}; ['#rowMine', '#rowEnemy'].forEach(sel=>{ const r = document.querySelector(sel); if(!r) return; const cs = [...r.querySelectorAll(':scope > .board-card:not(.empty-slot)')];
  out[sel] = {n: cs.length, w: cs.length ? Math.round((cs[0].querySelector('.card-tile') || cs[0]).getBoundingClientRect().width) : 0, cw: cs.length ? (cs[0].querySelector('.card-tile') || cs[0]).offsetWidth : 0, nmShown: cs.filter(c=>{ const nm = c.querySelector('.card-tile .nm'); return nm && getComputedStyle(nm).display !== 'none' && nm.getBoundingClientRect().width > 0; }).length}; }); return out; })()"""

async def run(b, url, w):
    ctx = await b.new_context(viewport={'width': w, 'height': 844 if w < 700 else 900}, has_touch=(w < 700))
    pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.add_init_script(V.SKIP)
    await pg.goto(url); await pg.wait_for_function("typeof switchTab === 'function' && typeof startConquestMatch === 'function'", timeout=90000); await pg.wait_for_timeout(1500)
    await pg.evaluate("(()=>{ " + V.OWN + " })()")
    pick, npips = await pg.evaluate(PICK)
    print(f'[{w}] most pips: {pick} ({npips})')
    # #1: three copies of the many-pip card on the enemy row, 9 otters on yours
    mine = [['otter-kit', s, 9] for s in range(-4, 5)]
    theirs = [[pick, -1, 30], [pick, 0, 30], [pick, 1, 30]]
    await pg.evaluate(V.BOARD + "(%s, %s)" % (json.dumps(mine), json.dumps(theirs)))
    await pg.evaluate("document.querySelectorAll('.coach-tip, .toast').forEach(x=> x.remove())")
    s0 = await pg.evaluate(STATE)
    ok(bool(s0) and s0['all'] == s0['slots'] and s0['slots'] >= 2, f'[{w}] #1 every slot of the overflowing strip is a cycling slot ({s0})')
    ok(bool(s0) and len(set(s0['shown'])) == 1, f'[{w}] #1 all slots show the same page ({s0 and s0["shown"]})')
    p = f'{OUT}/eng26-pips-a-{w}.png'; await pg.screenshot(path=p); shots.append(p)
    await pg.wait_for_timeout(3150)
    s1 = await pg.evaluate(STATE)
    ok(bool(s1) and s1['tick'] == s0['tick'] + 1 and len(set(s1['shown'])) == 1 and s1['shown'][0] != s0['shown'][0], f'[{w}] #1 after 3 s every slot flipped together to the next page ({s0 and s0["shown"]} -> {s1 and s1["shown"]}, tick {s0 and s0["tick"]} -> {s1 and s1["tick"]})')
    p = f'{OUT}/eng26-pips-b-{w}.png'; await pg.screenshot(path=p); shots.append(p)
    await pg.evaluate("renderMatchUI()"); await pg.wait_for_timeout(200)
    s2 = await pg.evaluate(STATE)
    ok(bool(s2) and s2['shown'] == s1['shown'], f'[{w}] #1 a re-render lands on the same page ({s2 and s2["shown"]})')
    # two ticks 2 s apart would have flipped at 2 s: at 2.2 s after a tick nothing has moved yet
    t0 = await pg.evaluate("BADGE_CYCLE_TICK"); await pg.wait_for_timeout(2000); t1 = await pg.evaluate("BADGE_CYCLE_TICK")
    ok(t1 - t0 <= 1, f'[{w}] #1 the interval is 3 s (ticks in 2 s: {t1 - t0})')
    # #2: rows of 8, 9 and 11 units; the names go only when 9+ units AND tiles under about 120px (100px of content box)
    for n in ([8, 9, 11] if w >= 1000 else [9]):
        mine_n = [['otter-kit', s_, 9] for s_ in range(-(n // 2), n - n // 2)]
        await pg.evaluate(V.BOARD + "(%s, %s)" % (json.dumps(mine_n), json.dumps(theirs)))
        r = (await pg.evaluate(NM))['#rowMine']; hide = n >= 9 and r['w'] < 120
        print(f'[{w}] row of {n}: {r}')
        ok(r['n'] == n and (r['nmShown'] == 0 if (hide or r['w'] < 70) else r['nmShown'] == n), f'[{w}] #2 a row of {n} at {r["w"]}px tiles: names {"hidden" if (hide or r["w"] < 70) else "shown"} ({r})')
        p = f'{OUT}/eng26-row{n}-{w}.png'; await pg.screenshot(path=p); shots.append(p)
    ok(not errs, f'[{w}] no page errors ({errs[:2]})')
    await ctx.close()

async def main(a):
    httpd = V.serve(); url = f'http://127.0.0.1:{httpd.server_address[1]}/index.html'
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=V.CHROME)
        for w in a.widths: await run(b, url, w)
        await b.close()
    httpd.shutdown()
    if a.keep:
        os.makedirs(KEEP, exist_ok=True)
        for s in shots: shutil.copy(s, KEEP)
    print('shots:', *shots, sep='\n  ')
    print('FAILED %d' % len(fails) if fails else 'all ok'); sys.exit(1 if fails else 0)

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--widths', default='390,1024,1366'); ap.add_argument('--keep', action='store_true')
    a = ap.parse_args(); a.widths = [int(x) for x in a.widths.split(',')]; asyncio.run(main(a))
