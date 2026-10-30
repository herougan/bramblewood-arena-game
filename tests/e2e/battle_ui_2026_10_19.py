#!/usr/bin/env python3
"""Battle UI fixes (package BU, 2026-10-19) — real game page in headless Chromium.

    python3 tests/e2e/battle_ui_2026_10_19.py                       # about 2 minutes
    BU_SHOTS=docs/screens/bu BU_TAG=after python3 tests/e2e/battle_ui_2026_10_19.py   # also saves screenshots
    BU_PAGE=index-before.html ...                                   # run against another build (the "before" shots)

Owner on an iPhone (2026-10-19 12:23), at 430x932 and 390x844 (touch, isMobile) and 1366x768:
  1. "You should always be able to play a card in the centre column": a normal fight with our row offset (units at 2..4, the
     centre and slot 1 empty) has a slot-0 drop target, inside the frame; on a phone the centre column sits in the frame's middle.
  2. "The damage numbers in mobile appear on the right. They should be in the centre of the opposing HP Bar": a castle hit's
     number is centred on the HP bar it hits (within 6 px). 2026-10-19 (package U3, owner 13:45): at the fill's end again, on
     screen (within 6 px of the fill's end, or pulled in from the screen's edge by up to half its width).
  3. "Cleave doesn't look so nice on mobile. Also, it is not centered": a real Cleave swing's crescent sits over the target's column
     and its neighbours (its box centre within half a card of the target's centre, no wider than about four columns).
  4. "Fast forward - 3x, 4x, 5x should only be unlocked at Map 20, 40, and 60": the speed cycle by progress (and Admin Mode).
  5. (coordinator, same session) the raid Goliath's tentacle strike: a drawn tentacle over the struck column, at impact and as it
     pulls back (390x844 only), inside the screen.
Not in tests/run-all.sh (a browser run). Exit code 1 on any failure.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
URL = 'file://' + os.path.join(ROOT, os.environ.get('BU_PAGE', 'index.html'))
EXE = os.environ.get('BW_CHROMIUM', '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell')
SHOTS = os.environ.get('BU_SHOTS')
TAG = os.environ.get('BU_TAG', 'after')
STRICT = os.environ.get('BU_PAGE') is None  # a "before" run only takes pictures
INIT = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_pitch_open_v1','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); localStorage.setItem('bramblewood_world_open_v1','1'); localStorage.setItem('bramblewood_arena_faction','otters'); localStorage.setItem('bramblewood_map_revealed_v1','[\"*\"]'); localStorage.setItem('bramblewood_dialogue_flags_v1', JSON.stringify({'lesson:lumber':true}));"
        "sessionStorage.setItem('bramblewood_seen_splash','1'); localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek']));")
BATTLE = "(()=>{const m=CONQUEST_MAPS[0]; const n=m.nodes.find(n=>n.kind==='skirmish'); conquestSelectedMap=m.id; playSubTab='conquest'; switchTab('play'); startConquestMatch(m.id,n.key,{skipEnergyCost:true,noOpener:true}); return 1;})()"
# Lays out both rows: mine / theirs are [[defId, slot], ...]; every unit ready (wait 0). Re-frames the board.
SETUP = """(args)=>{ const m = matchState, E = m.engine;
  const put = (pid, defId, slot)=>{ const c = E.makeBoardCard(defId); c.slot = slot; c.wait = 0; const pl = m.players[pid]; (slot===0?pl.row.center:slot<0?pl.row.left:pl.row.right).push(c); return c; };
  [1,2].forEach(pid=>{ const pl = m.players[pid]; pl.row.left = []; pl.row.center = []; pl.row.right = []; });
  args.theirs.forEach(([d, s])=> put(2, d, s)); args.mine.forEach(([d, s])=> put(1, d, s));
  E.syncSlots(m.players[1]); E.syncSlots(m.players[2]); m._mb2Win = null; m._slotRange = 0; m._mb2Pitch = 0;
  m.players[1].playedThisTurn = false;
  renderBoard(); try{ fitBattlefieldZoomNow(true); }catch(e){}
  return E.legalSlots(m.players[1]); }"""
failures = []
def check(cond, msg):
    if not cond:
        failures.append(msg); print('  FAIL', msg)
    return cond

async def open_page(b, w, h, phone):
    ctx = await b.new_context(viewport={'width': w, 'height': h}, has_touch=phone, is_mobile=phone, device_scale_factor=2 if phone else 1)
    pg = await ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('dialog', lambda d: asyncio.ensure_future(d.accept()))
    await pg.add_init_script(INIT)
    await pg.goto(URL); await pg.wait_for_timeout(1500)
    # 2026-10-30 (CS-D): the starter deck holds copies a fresh test profile does not own (deckCopyProblem, package PG), so no fight opened
    await pg.evaluate("FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); myCurrencies.energy = 60; window.showCoachTip = function(){}; window.deckSizeOkOrWarn = ()=> true; 1")
    return ctx, pg, errs

async def shot(pg, name):
    if SHOTS: await pg.screenshot(path=os.path.join(ROOT, SHOTS, f'{TAG}-{name}.png'))

async def centre_column(pg, tag, phone):
    legal = await pg.evaluate(SETUP, {'theirs': [['chipmunk-skirmisher', s] for s in range(-3, 3)], 'mine': [['chipmunk-skirmisher', s] for s in (2, 3, 4)]})
    await pg.wait_for_timeout(700)
    # the '+' targets show while a card is held (armed): arm the first hand card, as a tap does
    await pg.evaluate("(()=>{ const h = matchState.players[1].hand[0]; if(h) matchState.selectedUid = h.uid; renderBoard(); document.body.classList.add('bw-holding'); return 1; })()")
    await pg.wait_for_timeout(1000)  # the targets fade in (.28 s), after any re-frame
    r = await pg.evaluate("""(()=>{ const bf = document.getElementById('battlefieldEl').getBoundingClientRect();
      const t = document.querySelector('#rowMine [data-slot="0"]'), e0 = [...document.querySelectorAll('#rowEnemy .board-card')][0];
      const tr = t && t.getBoundingClientRect();
      return {t: tr ? [tr.left, tr.right, tr.width] : null, bf: [bf.left, bf.right], vis: t ? getComputedStyle(t).opacity : null}; })()""")
    print(f'  {tag}: legal {legal}, centre target {r["t"]}, frame {r["bf"]}')
    check(0 in legal, f'{tag}: slot 0 should be legal with the row at 2..4 (legal {legal})')
    if check(r['t'] is not None, f'{tag}: no slot-0 drop target drawn'):
        t, f = r['t'], r['bf']
        check(t[0] >= f[0] - 2 and t[1] <= f[1] + 2, f'{tag}: the slot-0 target is outside the frame {t} vs {f}')
        check(float(r['vis'] or 0) > 0.5, f'{tag}: the slot-0 target is not visible while holding a card (opacity {r["vis"]})')
        if phone: check(abs((t[0] + t[1])/2 - (f[0] + f[1])/2) <= max(4, t[2]*0.1), f'{tag}: the centre column should sit in the frame middle ({(t[0]+t[1])/2:.0f} vs {(f[0]+f[1])/2:.0f})')
    await shot(pg, f'centre-{tag}')
    await pg.evaluate("matchState.selectedUid = null; document.body.classList.remove('bw-holding'); renderBoard(); 1")

async def hp_float(pg, tag):
    # the real anchor (every castle hit's number goes through hqRibbonFloatAnchor), then where the number is drawn
    await pg.evaluate("document.querySelectorAll('.dmg-float').forEach(e=> e.remove()); floatText(hqRibbonFloatAnchor('B'), '💥 -5', 'hq-big'); floatText(hqRibbonFloatAnchor('A'), '🗡 -3', 'hq-big'); 1")
    await pg.wait_for_timeout(120)
    # 2026-10-19 (package U3, owner 13:45: "It comes out at where the health bar% is currently at. We could do that for all games."):
    # the number pops at the fill's end now (not the bar's centre), and stays fully on screen
    r = await pg.evaluate("""(()=>{ const out = {}; ['B','A'].forEach(s=>{ const tr = document.querySelector(`.battlefield .bf-hp[data-hpribbon="${s}"] .bf-hp-track`).getBoundingClientRect();
        const fill = document.querySelector(`.battlefield .bf-hp[data-hpribbon="${s}"] .bf-hp-fill`);
        const f = [...document.querySelectorAll('.hq-float-anchor .dmg-float')][s==='B' ? 0 : 1]; const fr = f && f.getBoundingClientRect();
        out[s] = {bar: tr.left + tr.width * parseFloat(fill.style.width) / 100, num: fr ? fr.left + fr.width/2 : null, l: fr ? fr.left : null, r: fr ? fr.right : null, vw: document.documentElement.clientWidth}; }); return out; })()""")
    for s, v in r.items():
        print(f'  {tag}: HP bar {s} fill end {v["bar"]:.1f}, number {v["num"]}')
        on = v['l'] is not None and v['l'] >= -0.5 and v['r'] <= v['vw'] + 0.5
        check(on, f'{tag}: the {s} castle number should be fully on screen ({v})')
        # a full (or nearly empty) bar's end is at the screen's edge: the number is pulled in by up to half its width at full size
        clamped = v['num'] is not None and on and abs(v['num'] - v['bar']) <= 90 and (v['bar'] > v['vw'] - 90 or v['bar'] < 90)
        check(v['num'] is not None and (abs(v['num'] - v['bar']) <= 6 or clamped), f'{tag}: the castle number should pop at the {s} HP bar\'s fill end ({v["num"]} vs {v["bar"]:.1f})')
    await shot(pg, f'hpfloat-{tag}')

async def cleave(pg, tag):
    # ours: the Beetle Battering-Ram (Cleave 3) at slot 1 facing three enemies at 0..2
    # (a round can roll a miss on the main strike, e.g. the map's Mist: then there's no grouped swing; up to three rounds are tried)
    box = None
    for attempt in range(3):
      if box and box['t']: break
      await pg.evaluate("(async()=>{ for(let i = 0; i < 80 && matchState.resolving; i++) await new Promise(r=> setTimeout(r, 100)); })()")
      await pg.evaluate(SETUP, {'theirs': [['chipmunk-stockpiler', s] for s in (0, 1, 2)], 'mine': [['beetle-battering-ram', 1], ['chipmunk-skirmisher', 0]]})
      await pg.wait_for_timeout(800)
      await pg.evaluate("matchState.speedMult = 0.5; (async()=>{ try{ await skipTurn(); }catch(e){} })(); 1")
      for _ in range(140):
        box = await pg.evaluate("""(()=>{ const s = document.querySelector('svg.sfx-crescent, svg.sfx-arc'); if(!s) return null;
          const p = [...s.querySelectorAll('path')].filter(e=> getComputedStyle(e).display !== 'none'); if(!p.length) return null;
          let L=1e9,T=1e9,R=-1e9,B=-1e9; p.forEach(e=>{ const r = e.getBoundingClientRect(); L=Math.min(L,r.left); T=Math.min(T,r.top); R=Math.max(R,r.right); B=Math.max(B,r.bottom); });
          const m = matchState, tgt = (m.players[2].row.right.concat(m.players[2].row.center)).find(c=> c.slot===1), te = tgt && boardCardEl(tgt.uid);
          const tr = te && te.getBoundingClientRect(), att = (m.players[1].row.right.find(c=> c.slot===1)||{}).uid, ae = att != null && boardCardEl(att);
          const ar = ae && ae.getBoundingClientRect();
          return {box:[L,T,R,B], t: tr ? [tr.left, tr.top, tr.right, tr.bottom] : null, a: ar ? [ar.left, ar.top, ar.right, ar.bottom] : null, vw: innerWidth}; })()""")
        if box and box['t']: break
        await pg.wait_for_timeout(50)
    if not check(box and box['t'], f'{tag}: no Cleave swing drawn'): return
    # the picture: GSAP's clock slowed (the crescent only) until the blade has cut past the target's column
    await pg.evaluate("try{ gsap.globalTimeline.timeScale(.3); }catch(e){} 1")
    for _ in range(120):
        if await pg.evaluate("""(()=>{ const w = document.querySelector('svg.sfx-crescent .cr-win'); if(!w) return !document.querySelector('svg.sfx-crescent');
            const bx = document.querySelector('svg.sfx-crescent .cr-blade').getBBox(); return +w.getAttribute('width') >= bx.width*.36; })()"""): break
        await pg.wait_for_timeout(25)
    await shot(pg, f'cleave-{tag}')
    await pg.evaluate("try{ gsap.globalTimeline.timeScale(1); }catch(e){} 1")
    b, t = box['box'], box['t']; tw = t[2] - t[0]
    cx, tcx = (b[0] + b[2])/2, (t[0] + t[2])/2
    print(f'  {tag}: cleave box {[round(x) for x in b]}, target {[round(x) for x in t]}, attacker {[round(x) for x in box["a"]] if box["a"] else None}')
    if STRICT:
        check(abs(cx - tcx) <= tw*0.5, f'{tag}: the Cleave crescent should be centred on the target column ({cx:.0f} vs {tcx:.0f})')
        check(b[2] - b[0] <= tw*4.6, f'{tag}: the Cleave crescent is too wide ({b[2]-b[0]:.0f}px for {tw:.0f}px cards)')
        check(b[1] >= t[1] - tw*1.2 and b[3] <= t[3] + tw*1.2, f'{tag}: the Cleave crescent should stay on the target row ({b} vs {t})')
    await pg.wait_for_timeout(2500)

async def speed(pg, tag):
    r = await pg.evaluate("""(()=>{ const keep = conquestMapCleared, adm = adminModeEnabled, out = {};
      const run = (k, upTo)=>{ conquestMapCleared = id=> { const i = mainConquestMaps().findIndex(m=> m.id===id); return i >= 0 && i <= upTo; }; out[k] = speedSteps(); };
      try{ adminModeEnabled = false; run('none', -1); run('m19', 19); run('m20', 20); run('m23', 23);
        // Maps 40 and 60 don't exist yet: the gate reads the map number, so a longer road opens them there
        out.mains = mainConquestMaps().length; out.locks = typeof speedLockedHints === 'function' ? speedLockedHints() : null;
        adminModeEnabled = true; out.admin = speedSteps(); }
      finally{ conquestMapCleared = keep; adminModeEnabled = adm; }
      return out; })()""")
    print(f'  {tag}: speeds {r}')
    check(3 not in r['none'] and 3 not in r['m19'], f'{tag}: 3x should be locked before Map 20 ({r["m19"]})')
    check(3 in r['m20'] and 4 not in r['m23'] and 5 not in r['m23'], f'{tag}: 3x opens at Map 20, not 4x/5x ({r["m20"]}, {r["m23"]})')
    check(r['admin'] == [1, 1.5, 2, 3, 4, 5, 0.5], f'{tag}: Admin Mode has every speed ({r["admin"]})')

async def tentacle(pg, tag):
    # the raid's Goliath (the Raid tab's hub, the first raid, the left part)
    await pg.evaluate("playSubTab='raid'; switchTab('play'); 1"); await pg.wait_for_timeout(500)
    await pg.evaluate("document.querySelector('.raid-hub [data-raid-open]').click()"); await pg.wait_for_timeout(500)
    await pg.evaluate("document.querySelector('[data-raid-part=left]').click()"); await pg.wait_for_timeout(1500)
    await pg.evaluate("(()=>{ const v = document.querySelector('.vs-screen'); if(v) v.click(); return 1; })()"); await pg.wait_for_timeout(5000)
    if not check(await pg.evaluate("!!(matchState && matchState.raidFull)"), f'{tag}: the raid did not open'): return
    # a strike on our column 0 (the FX the boss's column attack plays). GSAP's clock is paused for each picture (at impact, then
    # half way through the pull-back) and resumed; the before build's canvas arm runs on its own clock (no pause there).
    res = await pg.evaluate("""(()=>{ const all = [...document.querySelectorAll('#rowMine > .board-card')], el = all[Math.floor(all.length/2)]; if(!el) return null; window.__tentEl = el; // column 0, as FX.F's raidSmack picks it
      window.__tent = {phase:null}; const F = window.FX && FX.F && FX.F.tentacleSmack; if(!F) return 'none';
      F([el], {host: document.getElementById('battlefieldEl'), onImpact: ()=>{ window.__tent.phase = 'impact'; try{ gsap.globalTimeline.pause(); }catch(e){} }}); return 'ok'; })()""")
    if not check(res == 'ok', f'{tag}: FX.F.tentacleSmack missing ({res})'): return
    for _ in range(200):
        if await pg.evaluate("window.__tent.phase") == 'impact': break
        await pg.wait_for_timeout(10)
    await pg.wait_for_timeout(60)
    r = await pg.evaluate("""(()=>{ const t = document.querySelector('.fxf-tentacle .tb-body') || document.querySelector('.fxf-tent canvas'); if(!t) return null; const b = t.getBoundingClientRect();
      const el = window.__tentEl.getBoundingClientRect();
      return {t:[b.left, b.top, b.right, b.bottom], c:[el.left, el.top, el.right, el.bottom], vw: innerWidth, vh: innerHeight}; })()""")
    await shot(pg, f'tentacle-impact-{tag}')
    if check(r is not None, f'{tag}: no tentacle drawn at impact') and STRICT:
        t, c = r['t'], r['c']
        print(f'  {tag}: tentacle {[round(x) for x in t]}, column card {[round(x) for x in c]}')
        check(abs((t[0] + t[2])/2 - (c[0] + c[2])/2) <= (c[2] - c[0])*0.6, f'{tag}: the tentacle should come down on the struck column')
        check(t[3] >= c[1] and t[3] <= c[3] + (c[3] - c[1]), f'{tag}: the tentacle tip should reach the struck card')
        check(t[2] - t[0] <= (c[2] - c[0])*2.2, f'{tag}: the tentacle should be sized to the card ({t[2]-t[0]:.0f}px vs {c[2]-c[0]:.0f}px)')
        check(t[0] >= -2 and t[2] <= r['vw'] + 2 and t[1] >= -2, f'{tag}: the tentacle should be on screen {t}')
    # mid pull-back: the limb on its way up and out, half faded
    # squash (.11 s) + a beat (.04 s) + about 45% of the 0.35 s pull-back, on GSAP's own clock
    await pg.evaluate("try{ gsap.delayedCall(.31, ()=> gsap.globalTimeline.pause()); gsap.globalTimeline.resume(); }catch(e){} 1")
    await pg.wait_for_timeout(700)
    op = await pg.evaluate("(()=>{ const b = document.querySelector('.fxf-tentwrap'); return b ? +getComputedStyle(b).opacity : -1; })()")
    print(f"  {tag}: retract frame at opacity {op:.2f}")
    await shot(pg, f'tentacle-retract-{tag}')
    await pg.evaluate("try{ gsap.globalTimeline.resume(); }catch(e){} 1")
    await pg.wait_for_timeout(1500)
    check(not await pg.evaluate("!!document.querySelector('.fxf-tentacle')"), f'{tag}: the tentacle layer should be removed afterwards')
    if not STRICT: return
    # the game's own path: a column smack event through fxBatchVfx reaches down the whole column (front, middle and back rows)
    await pg.evaluate("fxBatchVfx({type:'raidSmack', kind:'column', name:'Smack', col:0, row:null, dmg:3, hits:2}); 1")
    for _ in range(200):
        # (2026-10-19, package U3: the game's smack grows out of the bramble's tile, so "reached" is full scale, not y 0 alone) (2026-10-30, RAIDFX1: the wrapper .fxf-tentwrap moves, not .tb-body)
        if await pg.evaluate("(()=>{ const b = document.querySelector('.fxf-tentwrap'); if(!b) return false; if(Math.abs(gsap.getProperty(b, 'y')) < 1 && gsap.getProperty(b, 'scaleX') > .99 && +getComputedStyle(b).opacity > .9){ gsap.globalTimeline.pause(); return true; } return false; })()"): break
        await pg.wait_for_timeout(5)
    r = await pg.evaluate("""(()=>{ const b = document.querySelector('.fxf-tentacle .tb-body'); if(!b) return null; const t = b.getBoundingClientRect();
      const all = [...document.querySelectorAll('#rowMine > .board-card')], i = Math.floor(all.length/2);
      const cells = [all[i]].concat([...document.querySelectorAll('#battlefieldInner .reserve-row.mine')].map(r=> r.querySelectorAll(':scope > .board-card')[i])).filter(Boolean).map(e=> e.getBoundingClientRect());
      return {t:[t.left, t.top, t.right, t.bottom], low: Math.max(...cells.map(c=> c.top)), n: cells.length}; })()""")
    await shot(pg, f'tentacle-column-{tag}')
    await pg.evaluate("try{ gsap.globalTimeline.resume(); }catch(e){} 1")
    if check(r is not None, f'{tag}: a raidSmack event should draw the tentacle'):
        check(r['t'][3] >= r['low'], f'{tag}: the column smack should reach the last row of the column ({r["t"][3]:.0f} vs {r["low"]:.0f}, {r["n"]} rows)')
    await pg.wait_for_timeout(1200)

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=EXE)
        only = os.environ.get('BU_ONLY')  # 'raid' or 'battle': one half only
        for (w, h, phone) in [(430, 932, True), (390, 844, True), (1366, 768, False)]:
            tag = f'{w}'
            if only != 'raid':
                ctx, pg, errs = await open_page(b, w, h, phone)
                await pg.evaluate(BATTLE); await pg.wait_for_timeout(2500)
                await centre_column(pg, tag, phone)
                await hp_float(pg, tag)
                await cleave(pg, tag)
                if w == 430: await speed(pg, tag)
                check(not errs, f'battle@{w}: page errors {errs[:3]}')
                await ctx.close()
            if w == 390 and only != 'battle':
                ctx, pg, errs = await open_page(b, w, h, phone)
                await tentacle(pg, f'raid{w}')
                check(not errs, f'raid@{w}: page errors {errs[:3]}')
                await ctx.close()
        await b.close()
    print('battle UI: ' + ('OK' if not failures else f'{len(failures)} failure(s)'))
    sys.exit(1 if failures and STRICT else 0)

asyncio.run(main())
