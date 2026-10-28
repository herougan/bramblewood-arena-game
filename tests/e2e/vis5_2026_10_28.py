#!/usr/bin/env python3
"""Package VIS5 (2026-10-28): browser checks and recorded frames at 390 and 1366 for the owner's 10-28 09:48 notes.
  L3  the leader's "joins the fight!" is a slam (band, portrait, ring, name banner; 1.4 s) and the Danger warning a red-edged sweep with a pulse
      and a hazard-striped plate (1.5 s); both fade without motion under reduced motion and FX Low, and keep only the text at FX None.
  L4  a trap's pip stays on its slot from the drop until the CPU's card steps on it (it used to vanish at once); when it springs, that card
      jumps, reels (wobble, dizzy tilt) with stars over its head, and a damage number flies from it.
  L6  the fight's top-right controls never squeeze: words, then icons, then essentials + a ⋯ menu; checked on Wolfsbane Tundra's 17-5 and the most crowded fights (22-8 has seven Environment cards).
  L12 the Codex album keeps its full height with a few cards.

    python3 tests/e2e/vis5_2026_10_28.py                       # 390 and 1366; shots in tests/out/shots/vis5-*.png
    python3 tests/e2e/vis5_2026_10_28.py --widths 768,1920 --parts top     # the controls at the other two widths
    python3 tests/e2e/vis5_2026_10_28.py --keep                # also copies the main shots into docs/screens/VIS5/

Recorded frames: this machine's headless Chromium draws a frame only when asked (a screenshot), so a moment plays in slow motion (every timer x S,
GSAP's time scale and the Web Animations' playback rate / S) and frames are screenshots stamped with their game time. Build first. Exits 1 on a failed check.
"""
import argparse, asyncio, os, sys, shutil, subprocess, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vis3_2026_10_26 as V  # serve, BOARD, OPEN, SKIP, OWN, CHROME
from playwright.async_api import async_playwright
ROOT = V.ROOT
OUT = os.path.join(ROOT, 'tests', 'out', 'shots', 'vis5'); os.makedirs(OUT, exist_ok=True)
KEEP = os.path.join(ROOT, 'docs', 'screens', 'VIS5')
S = 20  # slow motion
fails = []; shots = []; PARTS = {'lead', 'danger', 'hz', 'top', 'codex'}
def ok(cond, msg):
    print(('  ok  ' if cond else '  FAIL ') + msg, flush=True)
    if not cond: fails.append(msg)

async def fresh(b, url, w, extra_init='', **ctxopts):
    ctx = await b.new_context(viewport={'width': w, 'height': 844 if w < 700 else 900}, has_touch=(w < 700), **ctxopts)
    pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg._errs = errs; pg._ctx = ctx
    await pg.add_init_script(V.SKIP + extra_init)
    await pg.goto(url); await pg.wait_for_function("typeof switchTab === 'function' && typeof startConquestMatch === 'function'", timeout=90000); await pg.wait_for_timeout(1500)
    await pg.evaluate("(()=>{ " + V.OWN + " })()")
    return pg

async def close(pg):
    ok(not pg._errs, f'no page errors {pg._errs[:2]}')
    await pg._ctx.close()

SLOW = """(S=>{ window.__log = []; window.__t0 = performance.now(); window.__gt = ()=> Math.round((performance.now() - window.__t0) / S);
  const st = window.setTimeout; window.setTimeout = (f, ms, ...a)=> st(f, (ms||0) * S, ...a); const si = window.setInterval; window.setInterval = (f, ms, ...a)=> si(f, (ms||0) * S, ...a);
  const tl = gsap.globalTimeline, ots = tl.timeScale.bind(tl); tl.timeScale = v=> v === undefined ? ots() * S : ots(v / S); tl.timeScale(1); gsap.ticker.lagSmoothing(0);
  window.syncFightTimeScale = ()=>{ gsap.globalTimeline.timeScale(1); gsap.ticker.lagSmoothing(0); };
  window.__hz = {set: null, sprung: null, uid: null};
  const rv = window.renderVfxForEvent; window.renderVfxForEvent = function(ev){ window.__log.push([window.__gt(), ev.type]); if(ev.type === 'hazardSet' && window.__hz.set == null) window.__hz.set = window.__gt();
    if(ev.type === 'hazardSprung' && window.__hz.sprung == null){ window.__hz.sprung = window.__gt(); window.__hz.uid = ev.uid; } return rv.apply(this, arguments); };
  matchState.speedMult = 1; })"""

async def slow_on(pg):
    await pg.evaluate(SLOW + f"({S})")
    cdp = await pg._ctx.new_cdp_session(pg); await cdp.send('Animation.enable'); await cdp.send('Animation.setPlaybackRate', {'playbackRate': 1 / S})

def sheet(frames, name, w, n=6):
    """A contact sheet of up to n frames, spread over the recorded ones (each stamped with its game time)."""
    if not frames: return None
    pick = [frames[round(i * (len(frames) - 1) / max(1, n - 1))] for i in range(min(n, len(frames)))]
    out = os.path.join(OUT, f'vis5-{name}-{w}.png'); cols = 3 if w > 700 else 2
    args = ['ffmpeg', '-y', '-v', 'error']
    for p in pick: args += ['-i', p['f']]
    sw = 683 if w > 700 else 390
    fl = ''.join(f"[{i}:v]scale={sw}:-2,drawtext=text='{p['t']} ms':x=6:y=6:fontsize=16:fontcolor=white:box=1:boxcolor=black@0.6[v{i}];" for i, p in enumerate(pick))
    h0 = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', pick[0]['f']], capture_output=True, text=True).stdout.strip().split(',')
    sh_ = round(int(h0[1]) * sw / int(h0[0]) / 2) * 2
    lay = '|'.join(f"{(i % cols) * sw}_{(i // cols) * sh_}" for i in range(len(pick)))
    fl += ''.join(f'[v{i}]' for i in range(len(pick))) + (f"xstack=inputs={len(pick)}:layout={lay}:fill=black" if len(pick) > 1 else 'null')
    subprocess.run(args + ['-filter_complex', fl, '-frames:v', '1', out], check=False)
    shots.append(out); return out

async def shot(pg, name, w, clip=None, pad=12):
    f = os.path.join(OUT, f'vis5-{name}-{w}.png')
    h = await pg.query_selector(clip) if clip else None
    bb = await h.bounding_box() if h else None
    if bb: await pg.screenshot(path=f, clip={'x': max(0, bb['x'] - pad), 'y': max(0, bb['y'] - pad), 'width': bb['width'] + 2 * pad, 'height': bb['height'] + 2 * pad}, animations='allow')
    else: await pg.screenshot(path=f, animations='allow')
    shots.append(f); return f

async def poll(pg, w, tag, start_js, until_js, state_js, want=None, max_polls=2500, clip=None):
    """Start a moment in slow motion (start_js), then poll state_js (about every 60 ms real) until until_js. A screenshot (they are slow here) is taken
    when want(state, n_taken) says so; its state carries 'f' (the file)."""
    d = os.path.join(OUT, f'frames-{tag}-{w}'); shutil.rmtree(d, ignore_errors=True); os.makedirs(d)
    await slow_on(pg)
    if clip is None: clip = {'x': 0, 'y': 0, 'width': w, 'height': 844 if w < 700 else 900}
    await pg.evaluate("window.__t0 = performance.now()"); await pg.evaluate(start_js)
    out = []; taken = 0
    for i in range(max_polls):
        s = await pg.evaluate(state_js); s['t'] = await pg.evaluate("window.__gt()")
        if want and want(s, taken):
            f = os.path.join(d, f"{s['t']:06d}.png"); await pg.screenshot(path=f, clip=clip, animations='allow'); s['f'] = f; taken += 1
        out.append(s)
        if await pg.evaluate(until_js): break
        await pg.wait_for_timeout(40)
    return out

def at_times(times):
    return lambda s, k: k < len(times) and s['t'] >= times[k]

LEAD_STATE = """(()=>{ const w = document.querySelector('.vis5-lead'); if(!w) return {on: false}; const a = w.querySelector('.vis5-lead-art'), b = w.querySelector('.leader-callout'), band = w.querySelector('.vis5-lead-band');
  const r = b.getBoundingClientRect(), cs = getComputedStyle(a); return {on: true, calm: w.classList.contains('is-calm'), bare: w.classList.contains('is-bare'), mine: w.classList.contains('is-mine'), artAnim: cs.animationName, artShown: cs.display !== 'none', artOp: +cs.opacity,
    banAnim: getComputedStyle(b).animationName, bandAnim: band ? getComputedStyle(band).animationName : '', bandShown: band ? getComputedStyle(band).display !== 'none' : false, text: b.textContent, tile: !!w.querySelector('.card-tile'),
    bx: [Math.round(r.left), Math.round(r.right)], vw: innerWidth}; })()"""

async def lead_case(b, url, w, enemy, tag, init='', ctxopts=None, kind=None):
    pg = await fresh(b, url, w, init, **(ctxopts or {}))
    u = await pg.evaluate(V.BOARD + "([['otter-kit', 0, 9]], [['otter-kit', 0, 9]])")
    uid = u['2:0'] if enemy else u['1:0']
    if kind == 'none': await pg.evaluate("setFxLevel('none')")
    elif kind == 'low': await pg.evaluate("setFxLevel('low')")
    elif kind == 'high': await pg.evaluate("setFxLevel('high')")
    fr = await poll(pg, w, tag, f"(()=>{{ matchState.resolving = false; window.__fin = false; leaderThroneVfx({uid}, {{enemy: {'true' if enemy else 'false'}, defId: 'ent'}}); setTimeout(()=>{{ window.__fin = true; }}, 1800); }})()",
        "window.__fin === true", LEAD_STATE, want=at_times([40, 130, 240, 420, 800, 1250] if kind in (None, 'high') else [500]), max_polls=2500)
    return pg, fr

async def run_lead(b, url, w):
    print(f'-- L3 leader {w}')
    for enemy in (False, True):
        tag = 'lead-' + ('enemy' if enemy else 'mine')
        pg, fr = await lead_case(b, url, w, enemy, tag, kind='high')
        on = [f for f in fr if f['on']]
        ok(on and on[0]['tile'] and 'joins the fight!' in on[0]['text'], f"L3. {tag}: the portrait (the leader's card art) and the one-sentence banner show {on[0]['text'] if on else None}")
        ok(on and on[0]['artAnim'] == 'vis5LeadArt' and on[0]['bandAnim'] == 'vis5LeadBand' and on[0]['banAnim'] == 'vis5LeadBanner' and on[0]['bandShown'], f"L3. {tag}: the slam, band and banner animations run {on[0] if on else None}")
        gone = next((f['t'] for f in fr if not f['on'] and f['t'] > 300), None)
        last_on = max(f['t'] for f in on) if on else None
        ok(gone is not None and 1100 <= gone <= 1700 and last_on <= 1500, f"L3. {tag}: the whole moment is under 1.5 s (gone at {gone} ms, last frame with it {last_on} ms)")
        ok(all(f['bx'][0] >= -2 and f['bx'][1] <= f['vw'] + 2 for f in on if f['t'] > 500 and f['t'] < 1100), f"L3. {tag}: the banner sits inside the screen while it holds")
        sheet([f for f in fr if 'f' in f and f['t'] <= 1500], tag, w, 6)
        await close(pg)
    # the calm forms
    pg, fr = await lead_case(b, url, w, False, 'lead-low', kind='low'); on = [f for f in fr if f['on']]
    ok(on and on[0]['calm'] and on[0]['artAnim'] == 'vis5LeadFade' and not on[0]['bandShown'], f"L3. FX Low: the card fades in and out, no band, no slam {on[0] if on else None}"); await close(pg)
    pg, fr = await lead_case(b, url, w, False, 'lead-none', kind='none'); on = [f for f in fr if f['on']]
    ok(on and on[0]['bare'] and not on[0]['artShown'] and 'joins the fight!' in on[0]['text'], f"L3. FX None: the name banner alone {on[0] if on else None}"); await close(pg)
    pg, fr = await lead_case(b, url, w, False, 'lead-rm', kind='high', ctxopts={'reduced_motion': 'reduce'}); on = [f for f in fr if f['on']]
    ok(on and on[0]['artAnim'] == 'vis5LeadFade' and not on[0]['bandShown'] and on[0]['banAnim'] == 'vis5LeadFade', f"L3. reduced motion: fades only, even at FX High {on[0] if on else None}"); await close(pg)

DANGER_STATE = """(()=>{ const e = document.querySelector('.danger-warn'); if(!e) return {on: false}; const p = e.querySelector('.dw-plate'), sw = e.querySelector('.dw-sweep'), ed = e.querySelector('.dw-edge');
  const r = p.getBoundingClientRect(), bf = document.getElementById('battlefieldEl').getBoundingClientRect(); return {on: true, calm: e.classList.contains('is-calm'), role: e.getAttribute('role'), head: (e.querySelector('.dw-head')||{}).textContent, name: (e.querySelector('.dw-name')||{}).textContent,
    plateAnim: getComputedStyle(p).animationName, sweepAnim: getComputedStyle(sw).animationName, sweepShown: getComputedStyle(sw).display !== 'none', edgeAnim: getComputedStyle(ed).animationName, inside: r.left >= bf.left - 1 && r.right <= bf.right + 1}; })()"""

async def danger_case(b, url, w, tag, init='', ctxopts=None, kind=None):
    pg = await fresh(b, url, w, init, **(ctxopts or {}))
    await pg.evaluate(V.BOARD + "([['otter-kit', 0, 9]], [['otter-kit', 0, 9]])")
    if kind: await pg.evaluate(f"setFxLevel('{kind}')")
    await pg.evaluate("(()=>{ localStorage.removeItem('bramblewood_danger_state_v2'); localStorage.removeItem('bramblewood_beaten_v1'); window.__dgId = Object.values(getCardDefs()).find(d=> d && d.rarity === 'rare' && !d.token && !d.test && !d.derivedFrom).id; })()")
    fr = await poll(pg, w, tag, "(()=>{ matchState.resolving = false; window.__fin = false; maybeDangerWarn(window.__dgId); setTimeout(()=>{ window.__fin = true; }, 1800); })()", "window.__fin === true", DANGER_STATE,
        want=at_times([60, 180, 360, 560, 900, 1300] if kind in (None, 'high') else [500]), max_polls=2500, clip=None)
    return pg, fr

async def run_danger(b, url, w):
    print(f'-- L3 danger {w}')
    pg, fr = await danger_case(b, url, w, 'danger', kind='high'); on = [f for f in fr if f['on']]
    ok(on and on[0]['role'] == 'alert' and on[0]['head'] == 'Danger!' and ' is here!' in on[0]['name'], f"L3. Danger: an alert with the DANGER headline and the card's name {on[0] if on else None}")
    ok(on and on[0]['plateAnim'] == 'vis5DgPlate' and on[0]['edgeAnim'] == 'vis5DgEdge' and on[0]['sweepAnim'] == 'vis5DgSweep' and on[0]['sweepShown'], f"L3. Danger: plate slam, red edge pulse and sweep run {on[0] if on else None}")
    gone = next((f['t'] for f in fr if not f['on'] and f['t'] > 300), None); last_on = max(f['t'] for f in on) if on else None
    ok(gone is not None and 1200 <= gone <= 1800 and last_on <= 1520, f"L3. Danger: under 1.5 s (gone at {gone} ms, last frame with it {last_on} ms)")
    ok(all(f['inside'] for f in on), "L3. Danger: the plate sits inside the field")
    sheet([f for f in fr if 'f' in f and f['t'] <= 1500], 'danger', w, 6)
    await close(pg)
    pg, fr = await danger_case(b, url, w, 'danger-low', kind='low'); on = [f for f in fr if f['on']]
    ok(on and on[0]['calm'] and on[0]['plateAnim'] == 'vis5DgFade' and not on[0]['sweepShown'], f"L3. Danger at FX Low: fades, no sweep {on[0] if on else None}"); await close(pg)
    pg, fr = await danger_case(b, url, w, 'danger-rm', kind='high', ctxopts={'reduced_motion': 'reduce'}); on = [f for f in fr if f['on']]
    ok(on and on[0]['plateAnim'] == 'vis5DgFade' and not on[0]['sweepShown'] and on[0]['edgeAnim'] == 'vis5DgFade', f"L3. Danger under reduced motion: fades only {on[0] if on else None}"); await close(pg)

HZ_STATE = """(()=>{ const hz = window.__hz || {}; const pips = document.querySelectorAll('.w2-hazard-mark.trap').length, rings = document.querySelectorAll('.vis3-trap-ring').length;
  let rot = 0, ty = 0, tile = null; if(hz.uid != null){ const el = document.querySelector('.board-card[data-uid="' + hz.uid + '"]'); tile = el && el.querySelector('.card-tile'); if(tile){ const m = getComputedStyle(tile).transform; if(m && m !== 'none'){ const v = m.match(/matrix\\(([^)]+)\\)/); if(v){ const p = v[1].split(',').map(Number); rot = Math.round(Math.atan2(p[1], p[0]) * 180 / Math.PI * 10) / 10; ty = Math.round(p[5]); } } } }
  return {pips, rings, rot, ty, stars: document.querySelectorAll('.vis5-dizzy').length, nums: document.querySelectorAll('.dmg-float').length, set: hz.set, sprung: hz.sprung, hasTile: !!tile}; })()"""

def hz_want(s, k):  # frames at the drop, the pip waiting, and the spring's jump, tilt and settle
    st, sp = s.get('set'), s.get('sprung')
    if k == 0: return st is not None and s['t'] >= st + 330 and (sp is None or s['t'] < sp + 500)
    if sp is None: return False
    v = sp + 560; ts = [v + 60, v + 150, v + 260, v + 380, v + 520]
    return k - 1 < len(ts) and s['t'] >= ts[k - 1]

async def run_hz(b, url, w):
    print(f'-- L4 trap {w}')
    pg = await fresh(b, url, w)
    # your units at 0; theirs everywhere but slot 1, so the one legal slot for the CPU's card is the one the trap faces
    await pg.evaluate(V.BOARD + "([['otter-kit', 0, 9]], [['otter-kit', 0, 9], ['otter-kit', -1, 9], ['otter-kit', -2, 9], ['otter-kit', 2, 9]])")
    await pg.evaluate("""(()=>{ const m = matchState, me = m.players[1]; me.hand.length = 0; me.hand.push({uid: 99001, defId: 'antlion-pit'}); me.lumber = 20; m.resolving = false; try{ localStorage.setItem('bramblewood_beaten_v1', JSON.stringify(Object.keys(getCardDefs()))); }catch(e){} renderMatchUI(); })()""")
    await pg.wait_for_timeout(600)
    fr = await poll(pg, w, 'trap', "(()=>{ window.__fin = false; window.__p = playCardByUid(99001, 1); setTimeout(()=>{ window.__fin = true; }, 4200); })()", "window.__fin === true", HZ_STATE, want=hz_want, max_polls=4000)
    last = fr[-1]; st, sp = last['set'], last['sprung']
    ok(st is not None and sp is not None, f"L4. the trap is set and sprung in the real turn (hazardSet at {st} ms, hazardSprung at {sp} ms)")
    vis = (sp or 0) + 560  # the spring's own beat
    between = [f for f in fr if st is not None and f['t'] >= st + 300 and f['t'] <= vis - 80]
    ok(between and all(f['pips'] >= 1 for f in between), f"L4. the pip stays from the drop to the spring ({len(between)} samples, {sum(1 for f in between if f['pips'] < 1)} without it) {[(f['t'], f['pips']) for f in between][:14]}")
    after = [f for f in fr if f['t'] >= vis + 150]
    ok(after and all(f['pips'] == 0 and f['rings'] == 0 for f in after), f"L4. once it has sprung the pip and its ring are gone {[(f['t'], f['pips'], f['rings']) for f in after][:6]}")
    jolt = [f for f in fr if f['t'] >= vis - 20 and f['t'] <= vis + 1300]
    ok(min([f['ty'] for f in jolt] or [0]) <= -18, f"L4. the card jumps (up to {min([f['ty'] for f in jolt] or [0])} px)")
    ok(max([abs(f['rot']) for f in jolt] or [0]) >= 6, f"L4. it reels: tilt up to {max([abs(f['rot']) for f in jolt] or [0])} deg {[(f['t'], f['rot']) for f in jolt][:12]}")
    ok(any(f['stars'] >= 3 for f in jolt), "L4. three dizzy stars circle its head")
    ok(any(f['nums'] >= 1 for f in jolt), "L4. a damage number flies from it")
    end = fr[-1]
    ok(end['hasTile'] and end['rot'] == 0 and end['ty'] == 0, f"L4. it settles upright at the end (rot {end['rot']}, y {end['ty']})")
    pick = [f for f in fr if 'f' in f]
    sheet(pick, 'trap-sequence', w, 6)
    await close(pg)
    # the calm form: a flash, a number, no movement
    pg = await fresh(b, url, w, '', reduced_motion='reduce')
    await pg.evaluate(V.BOARD + "([['otter-kit', 0, 9]], [['otter-kit', 0, 9], ['otter-kit', -1, 9], ['otter-kit', -2, 9], ['otter-kit', 2, 9]])")
    await pg.evaluate("""(()=>{ const m = matchState, me = m.players[1]; me.hand.length = 0; me.hand.push({uid: 99001, defId: 'antlion-pit'}); me.lumber = 20; m.resolving = false; try{ localStorage.setItem('bramblewood_beaten_v1', JSON.stringify(Object.keys(getCardDefs()))); }catch(e){} renderMatchUI(); })()""")
    fr = await poll(pg, w, 'trap-calm', "(()=>{ window.__fin = false; window.__p = playCardByUid(99001, 1); setTimeout(()=>{ window.__fin = true; }, 3600); })()", "window.__fin === true", HZ_STATE, want=None, max_polls=3000)
    ok(max([abs(f['rot']) for f in fr] or [0]) == 0 and min([f['ty'] for f in fr] or [0]) == 0 and not any(f['stars'] for f in fr) and any(f['nums'] for f in fr), "L4. reduced motion: no jump, tilt or stars, the number still shows")
    await close(pg)

TOP_STATE = """(()=>{ const row = document.querySelector('#view-play .top-row-controls'); if(!row) return null; const tp = document.querySelector('.top-play-row'), stack = row.closest('.top-right-stack') || row;
  const vis = [...row.querySelectorAll('button')].filter(b=> b.offsetWidth > 0 && getComputedStyle(b).visibility !== 'hidden').map(b=>{ const r = b.getBoundingClientRect(); return {id: b.id, l: Math.round(r.left), r: Math.round(r.right), t: Math.round(r.top), h: Math.round(r.height), w: Math.round(r.width)}; });
  const sr = stack.getBoundingClientRect(); let prev = null; for(let el = stack.previousElementSibling; el; el = el.previousElementSibling){ const r = el.getBoundingClientRect(); if(r.width){ prev = r; break; } }
  const sameLine = prev && prev.top < sr.bottom - 2 && prev.bottom > sr.top + 2;
  return {mode: row.classList.contains('is-menu') ? 'menu' : row.classList.contains('is-compact') ? 'icons' : 'words', vis, vw: innerWidth, docW: document.documentElement.scrollWidth, overlap: !!(sameLine && sr.left < prev.right - 1), rowRight: Math.round(sr.right), playRight: Math.round(tp.getBoundingClientRect().right),
    env: (()=>{ const e = document.querySelector('.top-play-row .env-stack'); const m = e && (e.getAttribute('style') || '').match(/--n:\\s*(\\d+)/); return m ? +m[1] : (e ? 1 : 0); })()}; })()"""

async def run_top(b, url, w):
    print(f'-- L6 controls {w}')
    for admin in (False, True):
        pg = await fresh(b, url, w)
        for mp, key in (('m22', '22-8'), ('m11', '20-10'), ('m6', '17-5'), ('m6', '17-1')):
            await pg.evaluate("""async([mp, key, adm])=>{ adminModeEnabled = adm; try{ skipTriggerLesson(); }catch(e){} switchTab('play'); startConquestMatch(mp, key, {skipEnergyCost:true, noOpener:true}); await new Promise(r=> setTimeout(r, 2400)); try{ skipTriggerLesson(); }catch(e){} try{ fitTopRowControls(); }catch(e){} }""", [mp, key, admin])
            r = await pg.evaluate(TOP_STATE); tag = f"{mp} {key} {'admin' if admin else 'player'}"
            hs = sorted(set(x['h'] for x in r['vis'])); ids = [x['id'] for x in r['vis']]
            ok(r['docW'] <= r['vw'] and not r['overlap'] and r['rowRight'] <= r['playRight'] + 1 and r['rowRight'] <= r['vw'] + 1, f"L6. {tag} @{w}: the cluster ({r['mode']}, {r['env']} env cards) sits clear of the cards and inside the row {r}"[:260])
            ok(len(hs) <= 2 and min(hs) >= (28 if w < 700 else 30), f"L6. {tag} @{w}: no squeezed button, heights {hs} ({len(ids)} buttons: {ids})")
            if r['mode'] == 'menu':
                ok('trcMoreBtn' in ids and 'ffBtn' in ids and 'settingsBtnHud' in ids and 'quitMatchBtn' not in ids, f"L6. {tag} @{w}: menu mode keeps speed, log, settings and ⋯; quit moves into the menu {ids}")
            if (mp, key, admin) == ('m22', '22-8', False): await shot(pg, 'top-controls-22-8', w, '.top-play-row', 10)
            if (mp, key, admin) == ('m6', '17-5', False): await shot(pg, 'top-controls-17-5', w, '.top-play-row', 10)
            if (mp, key, admin) == ('m22', '22-8', True): await shot(pg, 'top-controls-22-8-admin', w, '.top-play-row', 10)
            if r['mode'] == 'menu' and not admin and key == '22-8':
                await pg.click('#trcMoreBtn'); await pg.wait_for_timeout(250)
                m = await pg.evaluate("""(()=>{ const p = document.querySelector('.trc-pop'); if(!p) return null; const r = p.getBoundingClientRect(); return {items: [...p.querySelectorAll('.trc-item')].map(i=> i.textContent.trim()), inView: r.left >= 0 && r.right <= innerWidth && r.bottom <= innerHeight, exp: document.getElementById('trcMoreBtn').getAttribute('aria-expanded'), minH: Math.min(...[...p.querySelectorAll('.trc-item')].map(i=> i.getBoundingClientRect().height))}; })()""")
                ok(m and len(m['items']) >= 2 and m['inView'] and m['exp'] == 'true' and m['minH'] >= 40, f"L6. {tag} @{w}: the ⋯ menu opens inside the screen with big rows {m}")
                await shot(pg, 'top-controls-menu-open', w, None)
                # a menu item clicks the real button: full screen toggles
                before = await pg.evaluate("document.getElementById('quitMatchBtn') ? 1 : 0")
                esc = await pg.evaluate("(()=>{ document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', bubbles: true})); return !document.querySelector('.trc-pop'); })()")
                ok(esc and before == 1, "L6. Escape closes the menu; the real Quit button is still in the page (hidden), so its wiring is kept")
            if r['mode'] == 'menu' and admin:
                await pg.click('#trcMoreBtn'); await pg.wait_for_timeout(250)
                got = await pg.evaluate("""(async()=>{ const it = [...document.querySelectorAll('.trc-pop .trc-item')].find(i=> /auto-?play/i.test(i.textContent)); if(!it) return {found: false, items: [...document.querySelectorAll('.trc-pop .trc-item')].map(i=> i.textContent.trim())}; it.click(); await new Promise(r=> setTimeout(r, 400));
                  const on = document.getElementById('autoplayBtn') && document.getElementById('autoplayBtn').getAttribute('aria-pressed'); if(on === 'true'){ document.getElementById('autoplayBtn').click(); } return {found: true, on, closed: !document.querySelector('.trc-pop')}; })()""")
                ok(got.get('found') and got.get('on') == 'true' and got.get('closed'), f"L6. {tag} @{w}: a menu item acts on the real button (auto-play turned on) and the menu closes {got}")
        await close(pg)

async def run_codex(b, url, w):
    print(f'-- L12 codex {w}')
    pg = await fresh(b, url, w)
    r = await pg.evaluate("""(async()=>{ adminModeEnabled = true; codexSubTab = 'bestiary'; switchTab('codex'); await new Promise(r=> setTimeout(r, 1800));
      const h = ()=>{ const a = document.querySelector('.al-album'); return a ? Math.round(a.getBoundingClientRect().height) : 0; };
      const full = h(), n0 = document.querySelectorAll('.al-sleeve').length;
      const s = document.getElementById('cxSearch'); s.value = 'zzzz-no-such'; s.dispatchEvent(new Event('input', {bubbles: true})); await new Promise(r=> setTimeout(r, 900)); const none = h();
      s.value = 'ent'; s.dispatchEvent(new Event('input', {bubbles: true})); await new Promise(r=> setTimeout(r, 900)); const few = h(), nf = document.querySelectorAll('.al-sleeve').length;
      const st = document.createElement('style'); st.id = 'oldslot'; st.textContent = '.al-slot{aspect-ratio:auto !important;}'; document.head.appendChild(st); await new Promise(r=> setTimeout(r, 100)); const old = h(); st.remove();
      return {full, n0, none, few, nf, old}; })()""")
    ok(r['nf'] >= 1 and abs(r['few'] - r['full']) <= 3, f"L12. a search with {r['nf']} card(s): the album is as tall as with a page of {r['n0']} ({r['few']} px vs {r['full']} px; with the old 1 px slots it was {r['old']} px)")
    await pg.evaluate("document.getElementById('cxSearch').scrollIntoView({block: 'start'})"); await pg.wait_for_timeout(300)
    await shot(pg, 'codex-few-cards', w, None)
    await close(pg)

async def run(b, url, w):
    print(f'-- width {w}')
    if 'lead' in PARTS: await run_lead(b, url, w)
    if 'danger' in PARTS: await run_danger(b, url, w)
    if 'hz' in PARTS: await run_hz(b, url, w)
    if 'top' in PARTS: await run_top(b, url, w)
    if 'codex' in PARTS: await run_codex(b, url, w)

async def main(a):
    httpd = V.serve(); url = f'http://127.0.0.1:{httpd.server_address[1]}/index.html'
    async with async_playwright() as p:
        exe = V.CHROME if os.path.exists(V.CHROME) else '/opt/pw-browsers/chromium'
        b = await p.chromium.launch(executable_path=exe, args=['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'])
        global PARTS; PARTS = set(a.parts.split(','))
        for w in [int(x) for x in a.widths.split(',')]: await run(b, url, w)
        await b.close()
    httpd.shutdown()
    if a.keep:
        os.makedirs(KEEP, exist_ok=True)
        for f in shots:
            if f and os.path.exists(f) and any(k in f for k in ('lead-mine', 'lead-enemy', 'danger-', 'trap-sequence', 'top-controls', 'codex-few')) and 'frames-' not in f and 'danger-low' not in f and 'danger-rm' not in f: shutil.copy(f, KEEP)
    print('\n'.join(x for x in shots if x)); print(('FAILED: ' + str(len(fails))) if fails else 'all ok')
    sys.exit(1 if fails else 0)

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--widths', default='390,1366'); ap.add_argument('--parts', default='lead,danger,hz,top,codex', help='some of lead,danger,hz,top,codex'); ap.add_argument('--keep', action='store_true', help='copy the main shots into docs/screens/VIS5/')
    asyncio.run(main(ap.parse_args()))
