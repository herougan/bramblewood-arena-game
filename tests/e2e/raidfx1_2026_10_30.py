#!/usr/bin/env python3
"""Package RAIDFX1 (2026-10-30, owner 21:36: "Why is the tentacle slash in raid so laggy? the damage should only come out once the
tentacle lands on the cards" + "Dont need the handshake symbol to denote allies in multiplayer dungeons/raids") in the real game page,
headless Chromium, at 1366x768 (desktop) and 390x844 (a phone).

    python3 tests/e2e/raidfx1_2026_10_30.py                     # about 5 minutes
    RAIDFX1_SHOTS=docs/screens/raidfx1 python3 tests/e2e/raidfx1_2026_10_30.py    # also saves the screenshots

A real round (resolveRound) whose upkeep smacks a column, then one that smacks a row; with reduced motion; with Effects None. Checks:
  - each struck unit's damage number comes no earlier than the moment the limb reaches its cell ('fxf:tentacle' {phase:'reach'});
    its Health on the card doesn't drop before then, and a unit killed by the smack stays on the board until then;
  - the limb's layer is limb-sized (not the window), a layer of its own (will-change) only while it swings, and gone afterwards;
  - reduced motion: the still limb, every number at its showing; Effects None: no limb, the numbers as the smack plays;
  - no 🤝 corner marker on an ally's card; no page errors.
The headless renderer is slow (and the frame-capped limb with it), so this checks the order, not the speed: the speed is measured
with the frame-time / trace bench in the RAIDFX1 report. Not in tests/run-all.sh's fast suites (a browser run). Exit code 1 on failure.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
URL = 'file://' + os.path.join(ROOT, 'index.html')
EXE = os.environ.get('BW_CHROMIUM', '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell')
SHOTS = os.environ.get('RAIDFX1_SHOTS')
SIZES = [tuple(int(x) for x in s.split('x')) for s in os.environ.get('RAIDFX1_SIZES', '1366x768,390x844').split(',')]
INIT = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_pitch_open_v1','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); localStorage.setItem('bramblewood_world_open_v1','1'); localStorage.setItem('bramblewood_arena_faction','otters'); localStorage.setItem('bramblewood_map_revealed_v1','[\"*\"]'); localStorage.setItem('bramblewood_dialogue_flags_v1', JSON.stringify({'lesson:lumber':true, 'world_revealed_toast':true}));"
        "sessionStorage.setItem('bramblewood_seen_splash','1'); localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','pl-need','pl-do','pl-after']));")
RAID_OPEN = ["playSubTab='raid'; switchTab('play'); 1", "document.querySelector('.raid-hub [data-raid-open]').click()", "document.querySelector('[data-raid-part=left]').click()"]
failures = []
def check(cond, msg):
    print(('  ok   ' if cond else '  FAIL ') + msg)
    if not cond: failures.append(msg)
    return cond

# Watches the smack: when the raidSmack event plays (its struck units, their Health then), each reach / the impact, every damage number
# added over a struck card, each struck card's Health text change and its removal; at impact (once) freezes GSAP for a screenshot.
INSTR = r"""(pause)=>{
  const L = window.__rx = {ev: null, at: null, reach: {}, impact: null, nums: {}, hp: {}, gone: {}, base: {}, cells: {}, wrap: null, wrapAfter: null, pause, paused: false};
  const now = ()=> performance.now();
  if(!window.__rxHooked){ window.__rxHooked = true;
    const orig = window.renderVfxForEvent;
    window.renderVfxForEvent = function(ev){ const M = window.__rx;
      if(M && ev && ev.type === 'raidSmack' && !M.ev){ M.ev = JSON.parse(JSON.stringify(ev)); M.at = now();
        (ev.struck || []).forEach(s=>{ const e = boardCardEl(s.uid); if(!e) return; const r = e.getBoundingClientRect(); M.cells[s.uid] = {l:r.left, t:r.top, r:r.right, b:r.bottom};
          const hp = e.querySelector('.stats .hp'); M.base[s.uid] = hp ? hp.textContent.replace(/[^\d]/g, '') : null; }); }
      return orig.apply(this, arguments); };
    document.addEventListener('fxf:tentacle', e=>{ const M = window.__rx; if(!M || !M.ev) return; const d = e.detail || {};
      if(d.phase === 'reach'){ if(d.uid != null && M.reach[d.uid] == null) M.reach[d.uid] = now(); return; }
      if(M.impact == null){ M.impact = now(); const w = document.querySelector('.fxf-tentwrap');
        if(w){ const r = w.getBoundingClientRect(); M.wrap = {w: r.width, h: r.height, moving: w.classList.contains('is-moving'), wc: getComputedStyle(w).willChange, vw: innerWidth, vh: innerHeight}; }
        if(M.pause){ try{ gsap.globalTimeline.pause(); M.paused = true; }catch(_){} } } });
    new MutationObserver(ms=>{ const M = window.__rx; if(!M || !M.ev) return; const t = now();
      Object.keys(M.base).forEach(u=>{ if(M.hp[u] != null) return; const e = boardCardEl(u); if(!e){ if(M.gone[u] == null) M.gone[u] = t; return; }
        const hp = e.querySelector('.stats .hp'), v = hp ? hp.textContent.replace(/[^\d]/g, '') : null; if(v !== M.base[u]) M.hp[u] = t; });
      ms.forEach(m=> m.addedNodes.forEach(n=>{ if(n.nodeType !== 1) return;
        const fl = n.matches('.dmg-float, .fxf-stamp') ? [n] : [...n.querySelectorAll('.dmg-float, .fxf-stamp')];
        fl.forEach(f=>{ if(!/^(dmg-float( heavy)?|fxf-stamp c-smack)$/.test(f.className)) return; const host = f.closest('.fx-float-host') || f.parentElement, r = host.getBoundingClientRect(), cx = r.left + r.width/2, cy = r.top + r.height/2;
          Object.keys(M.cells).forEach(u=>{ const c = M.cells[u]; if(cx >= c.l && cx <= c.r && cy >= c.t && cy <= c.b && M.nums[u] == null) M.nums[u] = t; }); }); })); })
      .observe(document.body, {childList: true, subtree: true, characterData: true});
  }
  return 1; }"""

async def open_raid(b, w, h, reduced, fx):
    phone = w < 800
    ctx = await b.new_context(viewport={'width': w, 'height': h}, has_touch=phone, is_mobile=phone, device_scale_factor=2 if phone else 1,
                              reduced_motion='reduce' if reduced else 'no-preference')
    pg = await ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('dialog', lambda d: asyncio.ensure_future(d.accept()))
    await pg.add_init_script(INIT + f"localStorage.setItem('bramblewood_fx_level','{fx}');")
    await pg.goto(URL); await pg.wait_for_timeout(1500)
    # (a fresh profile owns none of the deck's cards: skip the deck check, 2026-10-23 PG's copy limits)
    await pg.evaluate("FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); myCurrencies.energy = 60; window.showCoachTip = function(){}; window.deckSizeOkOrWarn = ()=> true; 1")
    for js in RAID_OPEN: await pg.evaluate(js); await pg.wait_for_timeout(700)
    await pg.evaluate("(()=>{ const v = document.querySelector('.vs-screen'); if(v) v.click(); return 1; })()"); await pg.wait_for_timeout(5000)
    await pg.evaluate("document.querySelectorAll('.coach-bubble, .coach-tip, .npc-bubble, .coach-callout').forEach(e=> e.remove()); 1")
    return ctx, pg, errs

async def smack_round(pg, kind, pause):
    await pg.evaluate("""(kind)=>{ const m = matchState; m.round = kind === 'row' ? 1 : 2; m.raidPending = {};
      (m.raidAttacks||[]).forEach((a, i)=>{ if(a.pattern === 'column'){ a.every = 1; m.raidPending[i] = kind === 'row' ? {kind:'row', row:0} : {kind:'column', col:0}; } });
      m.raidAttacks = (m.raidAttacks||[]).filter(a=> a.pattern === 'column'); return 1; }""", kind)
    await pg.evaluate(INSTR, pause)
    await pg.evaluate("resolveRound(); 1")
    for _ in range(900):  # until the round's upkeep has let go (the limb gone, the turn open)
        await pg.wait_for_timeout(100)
        st = await pg.evaluate("(()=>{ const M = window.__rx; return {ev: !!M.ev, paused: M.paused, open: !!(matchState && !matchState.resolving && !matchState._upkeep), limb: !!document.querySelector('.fxf-tentacle')}; })()")
        if st['paused']: return 'paused'
        if st['ev'] and st['open'] and not st['limb']: break
    return await pg.evaluate("window.__rx")

def assess(tag, R, limb):
    if not check(R and R.get('ev'), f'{tag}: the round smacked ({R and R.get("ev") and R["ev"].get("kind")})'): return
    struck = list(R['cells'].keys())
    check(len(struck) > 0, f'{tag}: struck units on the board ({len(struck)})')
    for u in struck:
        reach = R['reach'].get(u, R['impact']) if limb else R['at']
        num, hp, gone = R['nums'].get(u), R['hp'].get(u), R['gone'].get(u)
        rel = lambda t: None if t is None or reach is None else round(t - reach)
        check(reach is not None, f'{tag} unit {u}: the limb reached it')
        if reach is None: continue
        check(num is not None and num >= reach - 20, f'{tag} unit {u}: its damage number comes as the limb reaches it ({rel(num)} ms after the reach)')
        check(hp is None or hp >= reach - 20, f'{tag} unit {u}: its Health doesn\'t drop before the limb reaches it ({rel(hp)} ms)')
        check(gone is None or gone >= reach - 20, f'{tag} unit {u}: it doesn\'t leave the board before the limb reaches it ({rel(gone)} ms)')

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=EXE)
        for (w, h) in SIZES:
            for (kind, reduced, fx) in (('column', False, 'high'), ('row', False, 'high'), ('column', True, 'high'), ('column', False, 'none')):
                tag = f'{w}x{h} {kind}{" reduced" if reduced else ""}{" fx-none" if fx == "none" else ""}'
                print('--', tag)
                ctx, pg, errs = await open_raid(b, w, h, reduced, fx)
                if not check(await pg.evaluate("!!(matchState && matchState.raidFull)"), f'{tag}: the raid fight opened'):
                    await ctx.close(); continue
                if kind == 'column' and not reduced and fx == 'high':
                    ally = await pg.evaluate("[...document.querySelectorAll('.board-card.is-ally-card')].map(e=> getComputedStyle(e, '::after').content)")
                    check(all('🤝' not in (c or '') for c in ally), f'{tag}: no 🤝 marker on the {len(ally)} ally cards ({ally[:3]})')
                limb = fx != 'none'
                R = await smack_round(pg, kind, bool(SHOTS) and not reduced and limb)
                if R == 'paused':
                    os.makedirs(os.path.join(ROOT, SHOTS), exist_ok=True)
                    await pg.evaluate("new Promise(r=> requestAnimationFrame(()=> requestAnimationFrame(()=> r(1))))")
                    await pg.screenshot(path=os.path.join(ROOT, SHOTS, f'{w}-{kind}-impact.png'), animations='allow')
                    await pg.evaluate("try{ gsap.globalTimeline.resume(); }catch(e){} window.__rx.pause = false; 1")
                    for _ in range(900):
                        await pg.wait_for_timeout(100)
                        if await pg.evaluate("!!(matchState && !matchState.resolving && !matchState._upkeep && !document.querySelector('.fxf-tentacle'))"): break
                    R = await pg.evaluate("window.__rx")
                assess(tag, R, limb)
                if R and R.get('ev'):
                    if limb:
                        wr = R.get('wrap')
                        if check(wr is not None, f'{tag}: the limb\'s layer at impact ({wr})'):
                            # (on a phone a column's limb runs the board's full height, so the box can be as tall as the window, never as big)
                            check(wr['w'] * wr['h'] < .75 * wr['vw'] * wr['vh'], f'{tag}: the layer is limb-sized, not the window ({wr["w"]:.0f}x{wr["h"]:.0f} of {wr["vw"]}x{wr["vh"]})')
                            check(reduced or (wr['moving'] and 'transform' in (wr['wc'] or '')), f'{tag}: its own layer (will-change) while it swings ({wr["wc"]})')
                    else:
                        check(R.get('impact') is None and not R.get('reach'), f'{tag}: Effects None draws no limb')
                    check(await pg.evaluate("!document.querySelector('.fxf-tenth, .fxf-tentwrap')"), f'{tag}: the limb\'s layer is gone afterwards')
                    if SHOTS and kind == 'row' and not reduced:
                        await pg.screenshot(path=os.path.join(ROOT, SHOTS, f'{w}-after-row.png'))
                check(not errs, f'{tag}: no page errors {errs[:3]}')
                await ctx.close()
        await b.close()
    print('RAIDFX1: ' + ('OK' if not failures else f'{len(failures)} failure(s)'))
    sys.exit(1 if failures else 0)

asyncio.run(main())
