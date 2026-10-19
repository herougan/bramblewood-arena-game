#!/usr/bin/env python3
"""Package TF (2026-10-19, owner 22:09: "in raids, i saw the tentacle slam in mobile, but not in chrome. The tentacle can slam
vertical or horizontal") — the raid's Tentacle Smack in the real game page, headless Chromium.

    python3 tests/e2e/tentacle_fx_2026_10_19.py                  # about 2 minutes
    TF_SHOTS=docs/screens/tf python3 tests/e2e/tentacle_fx_2026_10_19.py   # also saves the screenshots
    TF_SIZES=1366x768,1920x1080,1440x900,390x844                 # other sizes (a width under 800 is a phone: isMobile, touch)

At 1366x768 (a desktop: no mobile emulation) and 390x844 (a phone), with reduced motion off and on, a column smack and a row smack
go through the game's own per-event path (renderVfxForEvent -> fxBatchVfx -> FX.F). The tentacle announces its impact
('fxf:tentacle' on document); the page freezes GSAP right there and the test checks that:
  - the tentacle element exists and is visible: a non-zero box, mostly inside the viewport, opacity > 0.3, and real pixels drawn
    (a screenshot of its box differs from the same box with the tentacle hidden);
  - it spans the right axis: a column smack comes DOWN the struck column (base above, tip at the column's last card, at most ~20
    degrees off vertical, its box taller than wide and covering the column); a row smack lies ALONG the struck row (box wider than
    tall, across the row's cards, its base on the bramble's side);
  - reduced motion: the tentacle is still drawn (not just a flash), and it doesn't move while it holds;
  - the layer is removed afterwards.
On the desktop size with motion, one more column smack comes through a real round (resolveRound) to check the whole path.
Not in tests/run-all.sh's fast suites (a browser run). Exit code 1 on any failure.
"""
import asyncio, os, sys, io, math
from playwright.async_api import async_playwright
from PIL import Image, ImageChops

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
URL = 'file://' + os.path.join(ROOT, 'index.html')
EXE = os.environ.get('BW_CHROMIUM', '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell')
SHOTS = os.environ.get('TF_SHOTS')
SIZES = [tuple(int(x) for x in s.split('x')) for s in os.environ.get('TF_SIZES', '1366x768,390x844').split(',')]
INIT = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_pitch_open_v1','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); localStorage.setItem('bramblewood_world_open_v1','1'); localStorage.setItem('bramblewood_arena_faction','otters'); localStorage.setItem('bramblewood_map_revealed_v1','[\"*\"]'); localStorage.setItem('bramblewood_dialogue_flags_v1', JSON.stringify({'lesson:lumber':true, 'world_revealed_toast':true}));"
        "sessionStorage.setItem('bramblewood_seen_splash','1'); localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','pl-need','pl-do','pl-after']));"
        # keep the chosen effects level: a slow headless frame rate must not auto-lower it mid-test
        "localStorage.setItem('bramblewood_fx_level','high');")
RAID_OPEN = ["playSubTab='raid'; switchTab('play'); 1", "document.querySelector('.raid-hub [data-raid-open]').click()", "document.querySelector('[data-raid-part=left]').click()"]
failures = []
def check(cond, msg):
    print(('  ok   ' if cond else '  FAIL ') + msg)
    if not cond: failures.append(msg)
    return cond

# Listens for the tentacle's impact; at that instant freezes GSAP and measures the tentacle and the struck cells.
ARM = """(want)=>{ window.__tfAt = null; window.__tfWant = want == null ? null : !!want; if(window.__tfArmed) return 1; window.__tfArmed = true;
  document.addEventListener('fxf:tentacle', e=>{ if(window.__tfAt || (window.__tfWant != null && !!e.detail.horizontal !== window.__tfWant)) return; try{ gsap.globalTimeline.pause(); }catch(_){}
    const b = document.querySelector('.fxf-tentacle .tb-body'), sv = b && b.ownerSVGElement, lay = sv && sv.parentElement;
    let op = 0, box = null;
    if(b){ const r = b.getBoundingClientRect(); box = {l:r.left, t:r.top, r:r.right, b:r.bottom, w:r.width, h:r.height};
      op = [b, sv, lay].reduce((o, x)=> o * (x ? +getComputedStyle(x).opacity : 1), 1); }
    const cells = (window.__tfCells || []).map(x=> x.getBoundingClientRect()).map(r=> ({l:r.left, t:r.top, r:r.right, b:r.bottom, w:r.width, h:r.height}));
    window.__tfAt = {d: e.detail, box, op, cells, cls: sv ? sv.getAttribute('class') : null}; }); return 1; }"""
# The struck cells, found as FX.F's raidSmackFx finds them (a column: your front row's slot + the reserve rows' same slot; a row: its units)
CELLS = """(ev)=>{ const all = [...document.querySelectorAll('#rowMine > .board-card')], res = [...document.querySelectorAll('#battlefieldInner .reserve-row.mine')];
  let cells;
  if(ev.kind === 'row'){ const c = all.filter(e=> e.querySelector('.card-tile')); cells = c.length ? c : all; }
  else { const i = Math.max(0, Math.min(all.length - 1, (ev.col|0) + Math.floor(all.length/2))); cells = [all[i]].concat(res.map(r=> r.querySelectorAll(':scope > .board-card')[i])).filter(Boolean); }
  window.__tfCells = cells; return cells.length; }"""

async def open_raid(b, w, h, phone, reduced):
    ctx = await b.new_context(viewport={'width': w, 'height': h}, has_touch=phone, is_mobile=phone, device_scale_factor=2 if phone else 1,
                              reduced_motion='reduce' if reduced else 'no-preference')
    pg = await ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('dialog', lambda d: asyncio.ensure_future(d.accept()))
    await pg.add_init_script(INIT)
    await pg.goto(URL); await pg.wait_for_timeout(1500)
    await pg.evaluate("FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); myCurrencies.energy = 60; window.showCoachTip = function(){}; 1")
    for js in RAID_OPEN: await pg.evaluate(js); await pg.wait_for_timeout(700)
    await pg.evaluate("(()=>{ const v = document.querySelector('.vs-screen'); if(v) v.click(); return 1; })()"); await pg.wait_for_timeout(5000)
    await pg.evaluate("document.querySelectorAll('.coach-bubble, .coach-tip, .npc-bubble, .coach-callout').forEach(e=> e.remove()); 1")
    return ctx, pg, errs

FRAMES = "new Promise(r=> requestAnimationFrame(()=> requestAnimationFrame(()=> r(1))))"

async def gone(pg, ms=6000):
    for _ in range(ms // 100):
        if not await pg.evaluate("!!document.querySelector('.fxf-tentacle')"): return True
        await pg.wait_for_timeout(100)
    return False

async def wait_impact(pg, ms=6000):
    for _ in range(ms // 50):
        await pg.wait_for_timeout(50)
        at = await pg.evaluate("window.__tfAt")
        if at: return at
    return None

async def drawn_ratio(pg, box, w, h):
    """The share of the tentacle's on-screen box whose pixels change when the tentacle layer is hidden."""
    l, t = max(0, math.floor(box['l'])), max(0, math.floor(box['t'])); r, bt = min(w, math.ceil(box['r'])), min(h, math.ceil(box['b']))
    if r - l < 4 or bt - t < 4: return 0.0
    clip = {'x': l, 'y': t, 'width': r - l, 'height': bt - t}
    await pg.evaluate(FRAMES)  # (GSAP is frozen; let the compositor catch up so the shot isn't a stale frame)
    a = Image.open(io.BytesIO(await pg.screenshot(clip=clip, animations='allow'))).convert('RGB')
    await pg.evaluate("document.querySelectorAll('.fxf-tenth').forEach(e=> e.style.visibility = 'hidden'); 1")
    await pg.evaluate(FRAMES)
    c = Image.open(io.BytesIO(await pg.screenshot(clip=clip, animations='allow'))).convert('RGB')
    await pg.evaluate("document.querySelectorAll('.fxf-tenth').forEach(e=> e.style.visibility = ''); 1")
    await pg.evaluate(FRAMES)
    d = ImageChops.difference(a, c).convert('L').point(lambda v: 255 if v > 24 else 0)
    hist = d.histogram(); return hist[255] / float(sum(hist))

def assess(tag, kind, at, w, h, reduced):
    if not check(at is not None and at['box'] is not None, f'{tag} {kind}: the tentacle is drawn at impact (got {at and at.get("cls")})'): return False
    bx, cells, d = at['box'], at['cells'], at['d']
    check(bx['w'] > 20 and bx['h'] > 20, f'{tag} {kind}: a non-zero box ({bx["w"]:.0f}x{bx["h"]:.0f})')
    iw = max(0, min(bx['r'], w) - max(bx['l'], 0)); ih = max(0, min(bx['b'], h) - max(bx['t'], 0))
    inside = (iw * ih) / max(1, bx['w'] * bx['h'])
    check(inside >= .7, f'{tag} {kind}: inside the viewport ({inside:.0%} of its box on screen)')
    check(at['op'] > .3, f'{tag} {kind}: opacity at impact {at["op"]:.2f} > 0.3')
    check(('is-still' in (at['cls'] or '')) == reduced, f'{tag} {kind}: {"the still (reduced-motion) tentacle" if reduced else "the moving tentacle"} ({at["cls"]})')
    if not check(len(cells) > 0, f'{tag} {kind}: struck cells found'): return True
    B, T = d['base'], d['tip']; dx, dy = T['x'] - B['x'], T['y'] - B['y']
    if kind == 'column':
        cx = sum(c['l'] + c['w']/2 for c in cells) / len(cells); top = min(c['t'] for c in cells); low = max(c['t'] + c['h']/2 for c in cells)
        ang = math.degrees(math.atan2(abs(dx), max(1e-6, dy)))
        check(not d['horizontal'] and dy > 0 and ang <= 20, f'{tag} column: it comes down, {ang:.1f} deg off vertical (base {B["x"]:.0f},{B["y"]:.0f} -> tip {T["x"]:.0f},{T["y"]:.0f})')
        check(bx['h'] >= 1.4 * bx['w'], f'{tag} column: its box is upright ({bx["w"]:.0f}x{bx["h"]:.0f})')
        check(bx['t'] <= top and bx['b'] >= low and bx['l'] <= cx <= bx['r'], f'{tag} column: it covers the struck column (box {bx["l"]:.0f},{bx["t"]:.0f}-{bx["r"]:.0f},{bx["b"]:.0f}; column x {cx:.0f}, {top:.0f}..{low:.0f})')
    else:
        lo = min(c['l'] for c in cells); hi = max(c['r'] for c in cells); cy = sum(c['t'] + c['h']/2 for c in cells) / len(cells); cw = min(c['w'] for c in cells)
        check(d['horizontal'] and abs(dy) < 2 and abs(dx) > 2 * cw, f'{tag} row: it lies along the row (base {B["x"]:.0f},{B["y"]:.0f} -> tip {T["x"]:.0f},{T["y"]:.0f})')
        check(bx['w'] >= 2 * bx['h'], f'{tag} row: its box is lying down ({bx["w"]:.0f}x{bx["h"]:.0f})')
        check(bx['l'] <= lo + 2 and bx['r'] >= hi - cw * .35 and bx['t'] <= cy <= bx['b'], f'{tag} row: it spans the struck row (box {bx["l"]:.0f}-{bx["r"]:.0f}, {bx["t"]:.0f}..{bx["b"]:.0f}; row {lo:.0f}-{hi:.0f} at y {cy:.0f})')
        check(B['x'] < lo, f'{tag} row: it comes in from the bramble\'s side, the left ({B["x"]:.0f} < {lo:.0f})')
    return True

async def smack(pg, tag, kind, w, h, reduced):
    ev = {'type': 'raidSmack', 'kind': kind, 'name': 'Tentacle Smack', 'col': 0 if kind == 'column' else None, 'row': 0 if kind == 'row' else None, 'dmg': 6, 'hits': 2}
    await pg.evaluate("try{ gsap.globalTimeline.resume(); }catch(e){} document.querySelectorAll('.fxf').forEach(e=> e.remove()); 1")
    await pg.evaluate(ARM, kind == 'row'); await pg.evaluate(CELLS, ev)  # (a slow headless frame can hold GSAP's clock for a second or two)
    await pg.evaluate("(ev)=>{ renderVfxForEvent(ev); return 1; }", ev)
    at = await wait_impact(pg, 12000)
    if assess(tag, kind, at, w, h, reduced):
        ratio = await drawn_ratio(pg, at['box'], w, h)
        check(ratio >= .08, f'{tag} {kind}: the tentacle paints its box ({ratio:.0%} of the box\'s pixels)')
        if SHOTS:
            os.makedirs(os.path.join(ROOT, SHOTS), exist_ok=True)
            await pg.screenshot(path=os.path.join(ROOT, SHOTS, f'{tag}-{kind}.png'), animations='allow')
        if reduced:  # it holds still: the same box a quarter of a second later
            b0 = at['box']
            await pg.evaluate("try{ gsap.globalTimeline.resume(); }catch(e){} 1"); await pg.wait_for_timeout(250)
            b1 = await pg.evaluate("(()=>{ const b = document.querySelector('.fxf-tentacle .tb-body'); if(!b) return null; const r = b.getBoundingClientRect(); return {l:r.left, t:r.top, r:r.right, b:r.bottom, op:+getComputedStyle(b).opacity}; })()")
            check(b1 is not None and all(abs(b1[k] - b0[k]) < 1 for k in 'ltrb') and b1['op'] > .3, f'{tag} {kind}: reduced motion: it holds still and shown ({b1})')
    await pg.evaluate("try{ gsap.globalTimeline.resume(); }catch(e){} 1")
    check(await gone(pg), f'{tag} {kind}: the tentacle layer is removed afterwards')

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=EXE)
        for (w, h) in SIZES:
            phone = w < 800
            for reduced in (False, True):
                tag = f'{w}x{h}-{"reduced" if reduced else "motion"}'
                print(f'-- {tag}{" (phone)" if phone else " (desktop)"}')
                ctx, pg, errs = await open_raid(b, w, h, phone, reduced)
                if not check(await pg.evaluate("!!(matchState && matchState.raidFull)"), f'{tag}: the raid fight opened'):
                    await ctx.close(); continue
                for kind in ('column', 'row'): await smack(pg, tag, kind, w, h, reduced)
                if not phone and not reduced and (w, h) == SIZES[0]:  # the whole path: a real round whose upkeep smacks a column
                    await pg.evaluate("try{ gsap.globalTimeline.resume(); }catch(e){} matchState.round = 2; matchState.raidPending = {}; 1")
                    await pg.evaluate(ARM, False)
                    await pg.evaluate("resolveRound(); 1")
                    at = await wait_impact(pg, 15000)
                    check(at is not None and at['box'] is not None and at['op'] > .3 and not at['d']['horizontal'], f'{tag}: a real round\'s column smack draws the tentacle ({at and at["box"]})')
                    if at and SHOTS: await pg.evaluate(FRAMES); await pg.screenshot(path=os.path.join(ROOT, SHOTS, f'{tag}-round.png'), animations='allow')
                    await pg.evaluate("try{ gsap.globalTimeline.resume(); }catch(e){} 1"); await pg.wait_for_timeout(1500)
                check(not errs, f'{tag}: no page errors {errs[:3]}')
                await ctx.close()
        await b.close()
    print('TF: ' + ('OK' if not failures else f'{len(failures)} failure(s)'))
    sys.exit(1 if failures else 0)

asyncio.run(main())
