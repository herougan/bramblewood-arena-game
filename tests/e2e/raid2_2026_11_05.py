#!/usr/bin/env python3
"""Package RAID2 (2026-11-05, owner 22:18) in the real game page, headless Chromium, at 390x844 and 1366x768.

    python3 tests/e2e/raid2_2026_11_05.py                       # a few minutes (the headless renderer is slow)
    RAID2_SHOTS=docs/screens/RAID2 python3 tests/e2e/raid2_2026_11_05.py   # also saves the screenshots

Checks: the part picker shows three parts (no leader line, phase pill, BR line, rhythm line or attempts line), then the Core alone as one
card the width of the row once the other three are down; a raid fight opens fully zoomed out and eases in to about 1.5 rows a side, the
zoom button toggles, ctrl + wheel zooms between the ends, your rank and damage are on the frame, and a round with a tentacle smack plays
the tentacle first and the tide (in waves) after it. Exit code 1 on failure.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
URL = 'file://' + os.path.join(ROOT, 'index.html')
EXE = os.environ.get('BW_CHROMIUM', '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell')
SHOTS = os.environ.get('RAID2_SHOTS')
SIZES = [tuple(int(x) for x in s.split('x')) for s in os.environ.get('RAID2_SIZES', '1366x768,390x844').split(',')]
INIT = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_pitch_open_v1','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); localStorage.setItem('bramblewood_world_open_v1','1'); localStorage.setItem('bramblewood_arena_faction','otters'); localStorage.setItem('bramblewood_map_revealed_v1','[\"*\"]'); localStorage.setItem('bramblewood_dialogue_flags_v1', JSON.stringify({'lesson:lumber':true, 'world_revealed_toast':true}));"
        "sessionStorage.setItem('bramblewood_seen_splash','1'); localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','pl-need','pl-do','pl-after']));")
ARGS = ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist']
failures = []
def check(cond, msg):
    print(('  ok   ' if cond else '  FAIL ') + msg)
    if not cond: failures.append(msg)
    return cond

async def new_page(b, w, h):
    phone = w < 800
    ctx = await b.new_context(viewport={'width': w, 'height': h}, has_touch=phone, is_mobile=phone, device_scale_factor=2 if phone else 1)
    pg = await ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.add_init_script(INIT)
    await pg.goto(URL); await pg.wait_for_timeout(1500)
    await pg.evaluate("FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); myCurrencies.energy = 60; window.showCoachTip = function(){}; window.deckSizeOkOrWarn = ()=> true; 1")
    return ctx, pg, errs

async def shot(pg, name):
    if SHOTS:
        os.makedirs(os.path.join(ROOT, SHOTS), exist_ok=True)
        try: await pg.screenshot(path=os.path.join(ROOT, SHOTS, name), animations='disabled')
        except Exception as e: print('  (screenshot failed:', str(e)[:60], ')')

async def picker(b, w, h):
    tag = f'{w}x{h} picker'; print('--', tag)
    ctx, pg, errs = await new_page(b, w, h)
    for js in ["playSubTab='raid'; switchTab('play'); 1", "document.querySelector('.raid-hub [data-raid-open]').click()"]:
        await pg.evaluate(js); await pg.wait_for_timeout(700)
    q = lambda s: pg.evaluate(f"document.querySelectorAll({s!r}).length")
    check(await q('.raid2-panel .r2-part') == 3, f'{tag}: three part cards ({await q(".raid2-panel .r2-part")})')
    names = await pg.evaluate("[...document.querySelectorAll('.r2-part-head b')].map(e=> e.textContent)")
    check(names == ['Left Tentacle', 'Right Tentacle', 'Tail'], f'{tag}: Left Tentacle, Right Tentacle, Tail ({names})')
    for sel, what in (('.r3-leader-cap', 'leader cost cap line'), ('.rp-phase', 'phase pill'), ('.r2-part .r3-atk', 'attack rhythm line'), ('.r2-part .r2-note', 'attempts line'), ('.r2-part .raid-br', 'BR line')):
        check(await q(sel) == 0, f'{tag}: no {what}')
    check(await q('.r3-hp-row .r3-mine') == 1, f'{tag}: your damage sits beside the boss HP bar')
    await shot(pg, f'picker-{w}.png')
    await pg.evaluate("(async()=>{ await adminRaidDamage(activeRaidDef(), 0.56); renderRaidSubTab(document.getElementById('playSubBody')); })()"); await pg.wait_for_timeout(900)
    check(await q('.raid2-panel .r2-part') == 1, f'{tag}: the Core alone once the three are down')
    wr = await pg.evaluate("(()=>{ const p = document.querySelector('.r2-parts').getBoundingClientRect(), c = document.querySelector('.r2-part').getBoundingClientRect(); return [p.width, c.width]; })()")
    check(abs(wr[0] - wr[1]) < 2, f'{tag}: the Core card is the full row width ({wr[1]:.0f} of {wr[0]:.0f})')
    await shot(pg, f'core-{w}.png')
    check(not errs, f'{tag}: no page errors {errs[:2]}')
    await ctx.close()

ST = "(()=>{ const s = matchState && matchState._rz; return s ? {z: s.z, max: s.max} : null; })()"
async def fight(b, w, h):
    tag = f'{w}x{h} fight'; print('--', tag)
    ctx, pg, errs = await new_page(b, w, h)
    for js in ["playSubTab='raid'; switchTab('play'); 1", "document.querySelector('.raid-hub [data-raid-open]').click()", "document.querySelector('[data-raid-part=left]').click()"]:
        await pg.evaluate(js); await pg.wait_for_timeout(700)
    await pg.evaluate("(()=>{ const v = document.querySelector('.vs-screen'); if(v) v.click(); return 1; })()")
    await pg.wait_for_function("document.querySelector('.rz-btn')", timeout=60000)
    st = await pg.evaluate(ST)
    check(st and st['max'] > 1.2, f'{tag}: the zoom is available ({st})')
    await pg.wait_for_function("matchState._rz && matchState._rz.z > matchState._rz.max - 0.05", timeout=60000)
    st = await pg.evaluate(ST); check(st['z'] > 1.2, f'{tag}: it eased in to the 1.5-rows view (z {st["z"]:.2f})')
    check(await pg.evaluate("!!document.querySelector('.raid-fight-mine .rfm-dmg')"), f'{tag}: your damage is on the frame')
    await shot(pg, f'fight-zoomed-in-{w}.png')
    await pg.click('.rz-btn'); await pg.wait_for_function("matchState._rz.z < 1.02", timeout=60000)
    check(True, f'{tag}: the button zooms out'); await shot(pg, f'fight-zoomed-out-{w}.png')
    if w > 800:
        c = await pg.evaluate("(()=>{ const r = document.getElementById('battlefieldEl').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; })()")
        await pg.mouse.move(c[0], c[1]); await pg.keyboard.down('Control')
        for _ in range(4): await pg.mouse.wheel(0, -120); await pg.wait_for_timeout(80)
        await pg.keyboard.up('Control'); await pg.wait_for_timeout(300)
        st = await pg.evaluate(ST); check(1.02 < st['z'], f'{tag}: ctrl + wheel zooms in (z {st["z"]:.2f})')
    # a round with a tentacle smack: the tentacle, then the tide in waves
    await pg.evaluate("""()=>{ const m = matchState; m.round = 2; m.raidPending = {};
      (m.raidAttacks||[]).forEach((a, i)=>{ if(a.pattern === 'column'){ a.every = 1; m.raidPending[i] = {kind:'column', col:0}; } });
      m.raidAttacks = (m.raidAttacks||[]).filter(a=> a.pattern === 'column'); window.__log = []; const t0 = performance.now(), orig = window.renderVfxForEvent;
      window.renderVfxForEvent = function(ev){ if(ev && (ev.type === 'raidSmack' || (ev.type === 'fieldTick' && /crushingHit/.test(ev.field || '')))) window.__log.push([performance.now() - t0, ev.type, ev._tideWave]); return orig.apply(this, arguments); };
      document.addEventListener('fxf:tentacle', e=>{ if(((e.detail||{}).phase) === 'impact') window.__log.push([performance.now() - t0, 'impact']); }); return 1; }""")
    await pg.evaluate("resolveRound(); 1")
    await pg.wait_for_function("window.__log.some(x=> x[1] === 'fieldTick')", timeout=120000)
    log = await pg.evaluate("window.__log"); impact = [x[0] for x in log if x[1] == 'impact']; tide = [x[0] for x in log if x[1] == 'fieldTick']
    check(not impact or min(tide) >= max(impact) - 20, f'{tag}: the tide waits for the tentacle (impact {impact[:1]}, first tide {tide[:1]})')
    waves = sorted({x[2] for x in log if x[1] == 'fieldTick' and x[2] is not None})
    check(len(waves) >= 1, f'{tag}: the tide hits carry their wave ({waves})')
    check(not errs, f'{tag}: no page errors {errs[:2]}')
    await ctx.close()

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=EXE, args=ARGS)
        for (w, h) in SIZES:
            await picker(b, w, h); await fight(b, w, h)
        await b.close()
    print('\nFAILED: ' + '; '.join(failures) if failures else '\nAll RAID2 browser checks passed')
    sys.exit(1 if failures else 0)
asyncio.run(main())
