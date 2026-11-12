#!/usr/bin/env python3
"""2026-11-13 (package UIFX2): frames and cost of the world's season changes and the travel beat, on the real map screen.

    python3 tools/uifx2_frames.py                 # every effect: frames at 1366 and 390, light and dark, one contact sheet each
    python3 tools/uifx2_frames.py --only winter   # one effect (spring summer autumn winter desert ash coast deep road zoom)
    python3 tools/uifx2_frames.py --cost          # main-thread cost of the ambient (8 s, with vs without) and of one travel beat
    python3 tools/uifx2_frames.py --lab           # the Effects Lab group "World (UIFX2)": every variant plays, no errors (build the Lab first)

Each effect is a real move on the map (conquestPanTo / enterSubMap) between two maps of the table in bramblewood-ui-world.js. The beat's
GSAP timeline is paused and sought to each moment, so the frames don't depend on how busy the machine is. Writes
docs/screens/uifx2/<effect>.jpg (the contact sheet) and tests/out/uifx2/ (single frames, gitignored). Build first.
"""
import argparse, asyncio, json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
OUT = os.path.join(ROOT, 'tests', 'out', 'uifx2'); SHEETS = os.path.join(ROOT, 'docs', 'screens', 'uifx2')
# effect: (from map, to map, how) -- how: pan (main maps) or sub (into a side map)
MOVES = {'spring': ('mb', 'mf', 'pan'), 'summer': ('mc', 'm2', 'pan'), 'autumn': ('mw', 'm8', 'pan'), 'winter': ('m7', 'm10', 'pan'),
         'desert': ('m6', 'md', 'pan'), 'ash': ('md', 'm3', 'pan'), 'coast': ('mf', 'mb', 'pan'), 'deep': ('mu', 'm4', 'pan'),
         'road': ('m3', 'm11', 'pan'), 'zoom': ('m10', 'mv', 'sub')}
MOMENTS = [0.12, 0.35, 0.6, 0.85]   # seconds into the beat; then the settled ambient 2.5 s later
INIT = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); sessionStorage.setItem('bramblewood_seen_splash','1');"
        "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying']));")
SETUP = """(()=>{
  try{ skipTriggerLesson(); }catch(e){}
  try{ localStorage.setItem('bramblewood_res3_level_track_v1', JSON.stringify({granted: 999})); }catch(e){}
  try{ FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); }catch(e){}
  const p = loadConquestProgress(); p.completed = p.completed || []; p.ranks = p.ranks || {};
  CONQUEST_MAPS.forEach(m=> (m.nodes||[]).forEach(n=>{ const id = conquestNodeId(m.id, n.key); if(!p.completed.includes(id)) p.completed.push(id); p.ranks[id] = 'S'; }));
  saveConquestProgress(p); try{ localStorage.removeItem(HELD_PACKS_KEY); }catch(e){}
  try{ const f = loadDialogueFlags(); Object.keys(DIALOGUES).forEach(k=> f['seen:' + k] = 1); localStorage.setItem(DIALOGUE_FLAGS_KEY, JSON.stringify(f)); }catch(e){}
  const ids = CONQUEST_MAPS.map(m=> m.id);
  localStorage.setItem('bramblewood_maps_opened', JSON.stringify(ids)); sessionStorage.setItem('bw_fxg_map_titles', JSON.stringify(ids));
  try{ localStorage.setItem(MAP_HEAD_SEEN_KEY, JSON.stringify(ids)); }catch(e){}
  try{ mapVeilShownThisSession = true; }catch(e){}
  return 1; })()"""
CLEAN = "try{ pl1XpPending = null; }catch(_){} document.querySelectorAll('.dialogue-wrap, .dlg, .modal-overlay, .coach-tip, .toast, .pack-open-overlay, .pl1-xp-float').forEach(e=>{ try{ e.remove(); }catch(_){} })"  # the game's own pop-ups (XP from the unlocked save, packs, dialogue) stay out of the frames
SHOW = """(id)=>{ %s; conquestWorldView = false; playSubTab = 'conquest'; conquestSelectedMap = id; conquestSelectedNodeKey = null; try{ conquestSubZoom = null; }catch(e){}
  switchTab('play'); try{ renderPlay(); }catch(e){} }""" % CLEAN
GO = """([to, how])=>{ %s; const body = document.getElementById('playSubBody');
  if(how === 'sub') enterSubMap(to, null, body); else conquestPanTo(to, body, loadConquestProgress()); }""" % CLEAN  # a side map without its camera push (it held at 1366 in the harness): straight in, the beat is the same
# only the beat is held: the map's own short moves (the pan's fade-in, the pawn's drop) finish, the looping ambient keeps running
FREEZE = """()=>{ const b = BramblewoodWorld._state.beat; if(!b) return 0; clearTimeout(b.timer); b.tl.pause();
  document.getAnimations().forEach(a=>{ try{ if(isFinite(a.effect.getComputedTiming().endTime)) a.finish(); }catch(e){} }); return b.tl.duration(); }"""
SEEK = "(t)=>{ const b = BramblewoodWorld._state.beat; if(b) b.tl.seek(t, false); %s; return !!b; }" % CLEAN
THAW = """()=>{ const b = BramblewoodWorld._state.beat; if(b) b.tl.progress(1); return 1; }"""

def log(*a): print(*a, flush=True)

async def page_at(b, url, w, dark):
    ctx = await b.new_context(viewport={'width': w, 'height': 844 if w < 700 else 860}, **({'color_scheme': 'dark'} if dark else {}))
    await ctx.route('**/*', lambda r: r.continue_() if r.request.url.startswith('file:') else r.abort())  # nothing from the network (the live database is refused here)
    pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.add_init_script(INIT)
    log(f'open {w} {"dark" if dark else "light"}'); await pg.goto(url, timeout=900000, wait_until='domcontentloaded'); await pg.wait_for_timeout(2500)
    await pg.evaluate(SETUP); log('  ready')
    pg.set_default_timeout(180000)
    return pg, errs

async def frames(pg, eff, w, dark, moments):
    a, z, how = MOVES[eff]
    log(f'  {eff} {w}{" dark" if dark else ""}: {a} -> {z}'); await pg.evaluate(SHOW, a); await pg.wait_for_timeout(2600)
    await pg.evaluate(GO, [z, how])
    for _ in range(240):   # a side map zooms first (0.5 s, longer on a busy machine)
        if await pg.evaluate('!!BramblewoodWorld._state.beat'): break
        await pg.wait_for_timeout(25)
    dur = await pg.evaluate(FREEZE)
    tag = f'{eff}-{w}{"-dark" if dark else ""}'; shots = []
    for t in (moments if dur else []):
        await pg.evaluate(SEEK, t)
        f = os.path.join(OUT, f'{tag}-{int(t * 1000):04d}.jpg'); await pg.screenshot(path=f, timeout=180000, type='jpeg', quality=85); shots.append((f'{t:.2f} s', f))
    await pg.evaluate(THAW); await pg.wait_for_timeout(2500); await pg.evaluate('(()=>{ ' + CLEAN + ' })()')
    f = os.path.join(OUT, f'{tag}-settled.jpg'); await pg.screenshot(path=f, timeout=180000, type='jpeg', quality=85); shots.append(('settled', f))
    kind = await pg.evaluate('BramblewoodWorld._state.kind')
    return shots, dur, kind

def sheet(eff, rows, note):
    from PIL import Image, ImageDraw
    th = {1366: 300, 390: 300}; pad = 8; lab = 18
    cells = [(label, [(t, Image.open(f).convert('RGB')) for t, f in shots], w) for label, shots, w in rows]
    widths = [sum(int(im.width * th[w] / im.height) + pad for _, im in ims) + pad + 150 for _, ims, w in cells]
    W = max(widths); H = sum(th[w] + lab + pad for _, _, w in cells) + 34
    out = Image.new('RGB', (W, H), (246, 241, 230)); d = ImageDraw.Draw(out)
    d.text((pad, 8), f'UIFX2 {eff}: {note}', fill=(40, 30, 20))
    y = 30
    for label, ims, w in cells:
        d.text((pad, y + lab + th[w] // 2 - 6), label, fill=(60, 50, 40)); x = pad + 150
        for t, im in ims:
            tw = int(im.width * th[w] / im.height); out.paste(im.resize((tw, th[w])), (x, y + lab)); d.text((x, y + 3), t, fill=(60, 50, 40)); x += tw + pad
        y += th[w] + lab + pad
    os.makedirs(SHEETS, exist_ok=True); p = os.path.join(SHEETS, f'{eff}.jpg'); out.save(p, quality=84, optimize=True); return p

COST = """async (ms)=>{ const t0 = performance.now(); let n = 0, worst = 0, last = t0;
  await new Promise(res=>{ const f = (t)=>{ n++; worst = Math.max(worst, t - last); last = t; if(t - t0 < ms) requestAnimationFrame(f); else res(); }; requestAnimationFrame(f); });
  return {frames: n, worstMs: Math.round(worst)}; }"""

async def cost(b, url):
    pg, errs = await page_at(b, url, 1366, False)
    cdp = await pg.context.new_cdp_session(pg); await cdp.send('Performance.enable')
    async def metrics():
        m = (await cdp.send('Performance.getMetrics'))['metrics']; return {x['name']: x['value'] for x in m}
    async def window(label, ms=8000):
        a = await metrics(); fr = await pg.evaluate(COST, ms); z = await metrics(); s = ms / 1000
        row = {k: round((z[k] - a[k]) / s * 1000, 1) for k in ('TaskDuration', 'ScriptDuration', 'RecalcStyleDuration', 'LayoutDuration')}
        row.update(fr); row['label'] = label; print(json.dumps(row)); return row
    # the map's WebGL layer off (software GL on a shared machine swamps every frame), High effects, 10 s to settle; then the ambient is
    # switched off and on in place (display none: its animations stop, nothing else changes) for alternating 6 s windows
    await pg.evaluate("localStorage.setItem('bramblewood_shaders_v1', 'off'); localStorage.setItem('bramblewood_fx_level', 'high'); applyFxLevel(); document.querySelectorAll('canvas.bw-shader-map').forEach(c=> c.remove())")
    await pg.evaluate(SHOW, 'm10'); await pg.wait_for_timeout(10000)
    spans = await pg.evaluate("document.querySelectorAll('#conquestLayout > .bww-amb > i').length")
    print(json.dumps({'map': 'm10 winter', 'ambientSpans': spans, 'note': 'ms of main thread per second of the window'}))
    rows = {'with ambient': [], 'without': []}
    for i in range(3):
        rows['with ambient'].append(await window('with ambient', 6000))
        await pg.evaluate("document.querySelector('#conquestLayout > .bww-amb').style.display = 'none'"); await pg.wait_for_timeout(1000)
        rows['without'].append(await window('without', 6000))
        await pg.evaluate("document.querySelector('#conquestLayout > .bww-amb').style.display = ''"); await pg.wait_for_timeout(1000)
    med = lambda v: sorted(v)[len(v) // 2]
    for k, v in rows.items(): print(json.dumps({'median': k, **{m: med([r[m] for r in v]) for m in ('TaskDuration', 'ScriptDuration', 'RecalcStyleDuration', 'LayoutDuration', 'frames')}}))
    # one move m7 -> m10 (the map's own render included): main thread over the 1.5 s after it, with the beat and with UIFX2 switched off
    tr = {True: [], False: []}
    for on in (True, False) * 3:
        await pg.evaluate(SHOW, 'm7'); await pg.wait_for_timeout(3000)
        await pg.evaluate("(on)=>{ window.__bwwKeep = window.__bwwKeep || window.BramblewoodWorld; window.BramblewoodWorld = on ? window.__bwwKeep : null; }", on)
        a = await metrics(); await pg.evaluate(GO, ['m10', 'pan']); await pg.wait_for_timeout(1500); z = await metrics()
        tr[on].append(round((z['TaskDuration'] - a['TaskDuration']) * 1000))
    print(json.dumps({'move m7 -> m10, main-thread ms in the 1.5 s after': {'with UIFX2': tr[True], 'without': tr[False], 'median with': med(tr[True]), 'median without': med(tr[False])}}))
    await pg.evaluate("window.BramblewoodWorld = window.__bwwKeep")
    print('page errors:', errs[:3])

async def lab(b):
    """The Effects Lab (.fxcat/effects.html, python3 tools/effects-lab/build.py): every World (UIFX2) variant plays, with no console error or
    registration problem; one mid-play frame each of the winter change and the travel beat at 1366 and 390."""
    ctx = await b.new_context(viewport={'width': 1366, 'height': 860})
    await ctx.route('**/*', lambda r: r.continue_() if r.request.url.startswith('file:') else r.abort())
    pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' and 'uifx2' in m.text.lower() else None)
    pg.set_default_timeout(300000)
    await pg.goto('file://' + os.path.join(ROOT, '.fxcat', 'effects.html'), timeout=900000, wait_until='domcontentloaded'); await pg.wait_for_timeout(3000)
    info = await pg.evaluate("""()=>{ const ids = [...FXLAB.registry.keys()].filter(k=> /^map-grand-uifx2-/.test(k));
      return {ids, area: ids.map(i=> FXLAB.byId.get(i).area), problems: FXLAB.problems.filter(p=> /uifx2/.test(p))}; }""")
    log(json.dumps(info))
    for w in (1366, 390):
        await pg.set_viewport_size({'width': w, 'height': 860 if w > 700 else 844})
        for eid, key in (('map-grand-uifx2-winter', 'A'), ('map-grand-uifx2-travel', 'A')):
            await pg.evaluate("(id)=>{ const d = document.querySelector('.fxl-row[data-id=\"' + id + '\"]'); const a = d && d.closest('details'); if(a) a.open = true; d && d.scrollIntoView({block: 'center'}); }", eid)
            await pg.evaluate("BramblewoodWorld._state.beat = null")
            await pg.click(f'.fxl-pb[data-id="{eid}"][data-k="{key}"]')
            for _ in range(400):   # the stage is built and the play waits first: catch the beat, hold it half-way
                if await pg.evaluate('!!BramblewoodWorld._state.beat'): break
                await pg.wait_for_timeout(25)
            await pg.evaluate("()=>{ const b = BramblewoodWorld._state.beat; if(b){ clearTimeout(b.timer); b.tl.pause(); b.tl.seek(.55, false); } }")
            f = os.path.join(OUT, f'lab-{eid[16:]}-{w}.png'); await pg.screenshot(path=f); log(f)
            await pg.evaluate("()=>{ const b = BramblewoodWorld._state.beat; if(b) b.tl.progress(1); }"); await pg.wait_for_timeout(4000)
    played = []
    for eid in info['ids']:
        for key in await pg.evaluate("(id)=> FXLAB.registry.get(id).variants.map(v=> v.key)", eid):
            ok = await pg.evaluate("async ([id, k])=>{ try{ return await FXLAB.play(id, k); }catch(e){ return 'threw ' + e; } }", [eid, key]); played.append(f'{eid[16:]}:{key}={ok}')
    log('played', ' '.join(played)); log('errors', errs[:5])

async def main(a):
    from playwright.async_api import async_playwright
    url = 'file://' + os.path.join(ROOT, 'index.html'); os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        exe = CHROME if os.path.exists(CHROME) else '/opt/pw-browsers/chromium'
        b = await p.chromium.launch(executable_path=exe, args=['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'])
        if a.cost: await cost(b, url)
        elif a.lab: await lab(b)
        else:
            effs = a.only.split(',') if a.only else list(MOVES)
            pg, errs = await page_at(b, url, 1366, False)   # one page load (17 MB), resized and re-themed for each look
            for eff in effs:   # one sheet per effect, written as soon as its four looks are taken
                rows = []; note = ''
                for w, dark in ((1366, False), (390, False), (1366, True), (390, True)):
                    if a.light and dark: continue
                    await pg.set_viewport_size({'width': w, 'height': 844 if w < 700 else 860}); await pg.emulate_media(color_scheme='dark' if dark else 'light')
                    await pg.evaluate("(t)=>{ window.timeOfDay = ()=> t; document.body.dataset.tod = t; }", 'night' if dark else 'day')  # light rows by day, dark rows at night (the tint blend)
                    shots, dur, kind = await frames(pg, eff, w, dark, MOMENTS if not dark else MOMENTS[1:3])
                    rows.append((f'{w} {"dark, night" if dark else "light, day"}', shots, w))
                    note = f'{MOVES[eff][0]} -> {MOVES[eff][1]} ({MOVES[eff][2]}), beat {dur:.2f} s, ends in {kind}'
                print(sheet(eff, rows, note), note, flush=True)
            if errs: print('page errors:', errs[:3])
        await b.close()

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--only'); ap.add_argument('--cost', action='store_true'); ap.add_argument('--lab', action='store_true'); ap.add_argument('--light', action='store_true', help='light theme only (faster while iterating)')
    asyncio.run(main(ap.parse_args()))
