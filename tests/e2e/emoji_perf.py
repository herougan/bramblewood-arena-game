#!/usr/bin/env python3
"""Emoji speed (2026-10-18, Codex profiling: every emoji was its own little SVG document, about 8 per card, laid out, painted
and re-rasterised each frame; now each set is one sprite sheet, see EMOJI_ATLAS / EmojiStyle in arena_app.js).

    python3 tests/e2e/emoji_perf.py            # BW_EMOJI_REPS=3 by default (about 5 minutes on the shared box)

The real game page in headless Chromium, every card seen and owned. Checks first that the sheet is what draws:
  - the default set (Fluent) draws from its sheet: every emoji picture in the Codex, on the board and in the hand is an
    <img class="tw-emoji emo e-<key>"> with the emoji as its alt, a shared 1x1 src, and a background from #bwEmojiAtlas;
  - EmojiStyle.textOf() and html()/htmlBlock() still give the emoji back; System turns every picture back into text;
    Twemoji and Noto have sheets too; with a set's sheet gone (EMOJI_ATLAS entry removed) the old SVG pictures come back.
Then the emoji alone on a blank page (800 of them, old SVG <img> against the sheet; renderer CPU time from a trace): the sheet
must cost clearly less (it measured about 2.5x less). Last, in the game page and alternating so the shared box's noise hits
both alike, the sheet against the old SVG path at normal speed and with the CPU slowed 4x: opening the Codex, its next page,
starting a battle, a hand and a board re-render (time to the first frame and until settled, as tests/e2e/codex_perf.py);
a table for the record, failing only on a clear step back (the sheet over 1.4x the SVG path in the sum of the medians).
Exit code 1 on any failure.
"""
import asyncio, os, sys, json
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
URL = 'file://' + os.path.join(ROOT, 'index.html')
EXE = os.environ.get('BW_CHROMIUM', '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell')
REPS = int(os.environ.get('BW_EMOJI_REPS', '3'))
INIT = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_pitch_open_v1','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); localStorage.setItem('bramblewood_world_open_v1','1'); localStorage.setItem('bramblewood_arena_faction','otters'); localStorage.setItem('bramblewood_map_revealed_v1','[\"*\"]'); localStorage.setItem('bramblewood_dialogue_flags_v1', JSON.stringify({'lesson:lumber':true,'lesson:rarity':true}));"
        "sessionStorage.setItem('bramblewood_seen_splash','1'); localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying']));"
        "localStorage.removeItem('bramblewood_emoji_style');")
HELP = """
window.__lt = []; try{ new PerformanceObserver(l=> l.getEntries().forEach(e=> window.__lt.push(e.duration))).observe({entryTypes:['longtask']}); }catch(e){}
window.__settle = ()=> new Promise(r=> requestAnimationFrame(()=> requestAnimationFrame(()=> setTimeout(r, 0))));
window.__time = async (fn, wait)=>{ window.__lt.length = 0; const t0 = performance.now(); await fn(); await window.__settle(); const t1 = performance.now();
  if(wait) await new Promise(r=> setTimeout(r, wait)); await window.__settle(); const t2 = performance.now();
  return {frame: Math.round(t1 - t0), settled: Math.round(t2 - t0 - (wait || 0)), longtask: Math.round(window.__lt.reduce((a, b)=> a + b, 0))}; };
// 'sheet' = the shipped path; 'svg' = the same set with its sheet taken away (the pre-2026-10-18 path), for the A/B timing.
window.__atlasAll = Object.assign({}, EMOJI_ATLAS);
window.__emoMode = async mode=>{
  await EmojiStyle.set('system');
  Object.keys(EMOJI_ATLAS).forEach(k=> delete EMOJI_ATLAS[k]);
  if(mode === 'sheet') Object.assign(EMOJI_ATLAS, window.__atlasAll);
  await EmojiStyle.set('fluent');
  try{ codexTileCache.clear(); }catch(e){}
  if(window.matchState){ try{ renderBoard(); renderHand(); }catch(e){} }
  await window.__settle(); return EmojiStyle.usesSheet();
};
1
"""
ACTIONS = [
    ('codex open', "(async()=>{ switchTab('home'); await __settle(); await new Promise(r=> setTimeout(r, 100)); return __time(()=> switchTab('codex'), 300); })()"),
    ('codex page', "(async()=>{ await new Promise(r=> setTimeout(r, 100)); return __time(()=>{ document.querySelector(`.cx-pager-top [data-cxpage=\"${codexPage ? 0 : 1}\"]`).click(); }, 300); })()"),
    ('battle start', "(async()=>{ if(window.matchState){ try{ matchState.over = true; }catch(e){} } switchTab('home'); await __settle(); await new Promise(r=> setTimeout(r, 150)); return __time(()=>{ switchTab('play'); startConquestMatch('m2','4-3'); }, 600); })()"),
    ('hand render', "(async()=>{ await new Promise(r=> setTimeout(r, 100)); return __time(()=> renderHand(), 50); })()"),
    ('board render', "(async()=>{ await new Promise(r=> setTimeout(r, 100)); return __time(()=> renderBoard(), 50); })()"),
]
failures = []

def check(cond, msg):
    if not cond:
        failures.append(msg); print('  FAIL', msg)

CHECK_JS = """(async()=>{
  const out = {};
  out.sets = EmojiStyle.sets(); out.active = EmojiStyle.active(); out.sheet = EmojiStyle.usesSheet();
  out.atlasSets = Object.keys(EMOJI_ATLAS); out.css = !!document.getElementById('bwEmojiAtlas');
  switchTab('codex'); let t = 0; while(document.querySelector('#codexGrid .cx-more') && t < 60){ await new Promise(r=> setTimeout(r, 100)); t++; }
  await __settle();
  const pics = [...document.querySelectorAll('#codexGrid img.tw-emoji')];
  out.codexPics = pics.length; out.codexSvg = pics.filter(i=> !i.classList.contains('emo')).length;
  const one = pics.find(i=> i.classList.contains('emo'));
  if(one){ const cs = getComputedStyle(one); out.bg = /url\\(/.test(cs.backgroundImage) && cs.backgroundPosition !== '0% 0%'; out.alt = one.alt; out.src1x1 = one.src.startsWith('data:image/gif'); out.size = [one.getBoundingClientRect().width, one.getBoundingClientRect().height].map(Math.round); }
  out.altsAreEmoji = pics.every(i=> i.alt && /\\p{Extended_Pictographic}|\\p{Regional_Indicator}|\\u20e3/u.test(i.alt));
  out.sameSrc = new Set(pics.filter(i=> i.classList.contains('emo')).map(i=> i.src)).size;
  const tile = document.querySelector('#codexGrid .card-tile'); out.textOfHasEmoji = /\\p{Extended_Pictographic}/u.test(EmojiStyle.textOf(tile));
  out.html = EmojiStyle.html('🦦'); out.block = EmojiStyle.htmlBlock('<b title="🦦">🦦 Otter</b><svg><text>🦦</text></svg>');
  // the battle
  switchTab('play'); startConquestMatch('m2','4-3'); await new Promise(r=> setTimeout(r, 1500));
  const bp = [...document.querySelectorAll('#rowMine img.tw-emoji, #rowEnemy img.tw-emoji, #handStrip img.tw-emoji')];
  out.battlePics = bp.length; out.battleSvg = bp.filter(i=> !i.classList.contains('emo')).length;
  // the other sets draw from their sheets too
  out.others = {};
  for(const s of ['twemoji', 'noto']){ if(!EMOJI_ATLAS[s]) continue; await EmojiStyle.set(s); await __settle(); out.others[s] = {sheet: EmojiStyle.usesSheet(), svg: document.querySelectorAll('img.tw-emoji:not(.emo)').length, pics: document.querySelectorAll('img.emo.emoji-' + s).length}; }
  // System: every picture back to text
  await EmojiStyle.set('system'); await __settle();
  out.systemLeft = document.querySelectorAll('img.tw-emoji').length; out.systemCss = !!document.getElementById('bwEmojiAtlas');
  // No sheet for the set: the old SVG pictures
  const keep = EMOJI_ATLAS.fluent; delete EMOJI_ATLAS.fluent; await EmojiStyle.set('fluent'); await __settle();
  out.fallbackSheet = EmojiStyle.usesSheet(); out.fallbackSvg = document.querySelectorAll('img.tw-emoji:not(.emo)').length; out.fallbackEmo = document.querySelectorAll('img.emo').length;
  EMOJI_ATLAS.fluent = keep; await EmojiStyle.set('system'); localStorage.removeItem('bramblewood_emoji_style'); await EmojiStyle.apply(); await __settle();
  out.backOnSheet = EmojiStyle.usesSheet();
  return out;
})()"""

async def checks(b):
    pg = await b.new_page(viewport={'width': 1366, 'height': 900})
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.add_init_script(INIT)
    await pg.goto(URL); await pg.wait_for_timeout(2500)
    await pg.evaluate("FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); const ids = Object.keys(getCardDefs()); ids.forEach(id=>{ try{ unlockCardForPlayer(id, 'admin'); }catch(e){} }); noteSighted(ids); 1")
    await pg.evaluate(HELP)
    st = await pg.evaluate(CHECK_JS)
    print('  checks:', json.dumps({k: v for k, v in st.items() if k not in ('html', 'block')}, ensure_ascii=False))
    check(st['active'] == 'fluent' and st['sheet'] and st['css'], f"Fluent should be the default and draw from its sheet: {st['active']} {st['sheet']} {st['css']}")
    check(set(st['atlasSets']) >= {'fluent', 'twemoji', 'noto'}, f"every set should have a sheet: {st['atlasSets']}")
    check(st['codexPics'] > 100 and st['codexSvg'] == 0, f"every Codex emoji should come from the sheet: {st['codexPics']} pictures, {st['codexSvg']} SVG")
    check(st.get('bg') and st.get('src1x1') and st.get('alt'), f"a sheet emoji: background from the sheet, 1x1 src, emoji alt: {st.get('bg')} {st.get('src1x1')} {st.get('alt')}")
    check(st['altsAreEmoji'] and st['sameSrc'] == 1, f"alts should be the emoji, one shared src: {st['altsAreEmoji']} {st['sameSrc']}")
    check(st['textOfHasEmoji'], 'EmojiStyle.textOf should read the emoji back')
    check('class="emoji tw-emoji emoji-fluent emo e-1f9a6"' in st['html'] and 'alt="🦦"' in st['html'], f"html() should write a sheet picture: {st['html']}")
    check(st['block'].startswith('<b title="🦦"><img') and st['block'].endswith('<svg><text>🦦</text></svg>'), f"htmlBlock() should leave attributes and <svg> alone: {st['block']}")
    check(st['battlePics'] > 5 and st['battleSvg'] == 0, f"board and hand emoji should come from the sheet: {st['battlePics']} / {st['battleSvg']} SVG")
    for s, o in st['others'].items():
        check(o['sheet'] and o['svg'] == 0 and o['pics'] > 0, f"{s} should draw from its sheet: {o}")
    check(st['systemLeft'] == 0 and not st['systemCss'], f"System should leave no pictures and no sheet stylesheet: {st['systemLeft']} {st['systemCss']}")
    check(not st['fallbackSheet'] and st['fallbackSvg'] > 0 and st['fallbackEmo'] == 0, f"with no sheet the SVG pictures should come back: {st['fallbackSheet']} {st['fallbackSvg']} {st['fallbackEmo']}")
    check(st['backOnSheet'], 'back to the default set should use its sheet again')
    check(not errs, f'page errors: {errs[:3]}')
    await pg.close()

async def timing(b, rate):
    pg = await b.new_page(viewport={'width': 1366, 'height': 900})
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.add_init_script(INIT)
    await pg.goto(URL); await pg.wait_for_timeout(2500)
    await pg.evaluate("FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); const ids = Object.keys(getCardDefs()); ids.forEach(id=>{ try{ unlockCardForPlayer(id, 'admin'); }catch(e){} }); noteSighted(ids); codexViewMode = 'compressed'; switchTab('codex'); 1")  # 2026-10-18 (package C): the 80-card grid (the album shows 18)
    await pg.wait_for_timeout(1500)
    await pg.evaluate(HELP)
    cdp = await pg.context.new_cdp_session(pg)
    runs = {(m, n): [] for m in ('sheet', 'svg') for n, _ in ACTIONS}
    for i in range(REPS):
        for mode in (('sheet', 'svg') if i % 2 == 0 else ('svg', 'sheet')):
            await cdp.send('Emulation.setCPUThrottlingRate', {'rate': 1})
            ok = await pg.evaluate(f"__emoMode('{mode}')")
            check(ok == (mode == 'sheet'), f'mode switch to {mode}')
            for name, js in ACTIONS:  # one unmeasured round after the switch: the pictures in cache, as in play
                await pg.evaluate(js)
            await cdp.send('Emulation.setCPUThrottlingRate', {'rate': rate})
            for name, js in ACTIONS:
                runs[(mode, name)].append(await pg.evaluate(js))
    await cdp.send('Emulation.setCPUThrottlingRate', {'rate': 1})
    med = lambda xs, k: sorted(x[k] for x in xs)[len(xs) // 2]
    res = {key: {k: med(v, k) for k in ('frame', 'settled', 'longtask')} for key, v in runs.items()}
    check(not errs, f'page errors @{rate}x: {errs[:3]}')
    await pg.close()
    return res

# The emoji alone (no game around them, so the box's noise and the rest of the page don't drown them): 800 emoji at four
# text sizes on a blank page, drawn the old way (blob SVG <img>) and from the sheet, alternating; the renderer's own CPU time
# (thread time in a trace: style, layout, paint, raster, image decode) for inserting them plus six repaints.
ISO_SETUP = """async ({atlas, setUrl, BLANK})=>{
  await new Promise((r, j)=>{ const s = document.createElement('script'); s.src = setUrl; s.onload = r; s.onerror = j; document.head.appendChild(s); });
  const svgs = window.BW_EMOJI_SETS.fluent.emoji;
  const img = new Image(); img.src = atlas.url; await img.decode(); window.__keep = img;
  const W = atlas.w, H = atlas.h, c = atlas.cell, f = v=> +v.toFixed(4);
  let css = `img.emo{background-image:url("${atlas.url}");background-size:${f(W/c*100)}% ${f(H/c*100)}%;background-repeat:no-repeat}`;
  atlas.keys.forEach((k, i)=>{ const x = (i % atlas.cols) * atlas.pitch + atlas.pad, y = Math.floor(i / atlas.cols) * atlas.pitch + atlas.pad; css += `.e-${k}{background-position:${f(x/(W-c)*100)}% ${f(y/(H-c)*100)}%}`; });
  css += 'img.tw{display:inline-block;width:1.2em;height:1.2em;margin:0 .02em;vertical-align:-.22em} body{margin:0;background:#2a2016;color:#eee;font:15px sans-serif} .row{white-space:nowrap}';
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  const svgUrl = {}; const keys = atlas.keys.slice(0, 60);
  window.__settle = ()=> new Promise(r=> requestAnimationFrame(()=> requestAnimationFrame(()=> setTimeout(r, 0))));
  window.__build = mode=>{ let s = '';
    for(let r = 0; r < 40; r++){ s += `<div class="row" style="font-size:${[12, 15, 18, 22][r % 4]}px">`;
      for(let q = 0; q < 20; q++){ const k = keys[(r * 20 + q) % keys.length];
        s += (mode === 'svg' ? `<img class="tw" alt="x" src="${svgUrl[k] || (svgUrl[k] = URL.createObjectURL(new Blob([svgs[k]], {type: 'image/svg+xml'})))}">` : `<img class="tw emo e-${k}" alt="x" src="${BLANK}">`) + ' ab '; }
      s += '</div>'; }
    return s; };
  ['svg', 'sheet'].forEach(m=>{ const d = document.createElement('div'); d.innerHTML = __build(m); document.body.appendChild(d); });
  await new Promise(r=> setTimeout(r, 500)); await __settle(); document.body.innerHTML = ''; return 1;
}"""
ISO_RUN = """async mode=>{
  document.body.innerHTML = ''; await __settle();
  const host = document.createElement('div'); document.body.appendChild(host);
  host.innerHTML = __build(mode); await __settle();
  for(let i = 0; i < 6; i++){ host.style.transform = `translateX(${(i % 2) * 0.5}px)`; host.style.color = i % 2 ? '#eee' : '#eef'; await __settle(); }
  return 1;
}"""
ISO_NAMES = ('UpdateLayoutTree', 'Layout', 'Paint', 'PrePaint', 'Layerize', 'RasterTask', 'ImageDecodeTask', 'Decode Image')

async def isolated(b):
    pg = await b.new_page(viewport={'width': 1366, 'height': 900})
    await pg.add_init_script(INIT)
    await pg.goto(URL); await pg.wait_for_timeout(1500)
    args = await pg.evaluate("({atlas: EMOJI_ATLAS.fluent, setUrl: EMOJI_SET_URLS.fluent, BLANK: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'})")
    await pg.goto('file://' + os.path.join(ROOT, 'robots.txt'))  # a blank page next to index.html (relative asset URLs work)
    await pg.evaluate(ISO_SETUP, args)
    res = {'svg': [], 'sheet': []}
    for i in range(5):
        for mode in (('svg', 'sheet') if i % 2 == 0 else ('sheet', 'svg')):
            await b.start_tracing(page=pg, categories=['devtools.timeline', 'disabled-by-default-devtools.timeline'])
            await pg.evaluate(ISO_RUN, mode)
            ev = json.loads(await b.stop_tracing()); ev = ev['traceEvents'] if isinstance(ev, dict) else ev
            res[mode].append(sum(e.get('tdur', e.get('dur', 0)) for e in ev if e.get('ph') == 'X' and e.get('name') in ISO_NAMES) / 1000)
    await pg.close()
    med = {m: round(sorted(v)[len(v) // 2]) for m, v in res.items()}
    print(f"  800 emoji alone, renderer CPU (median of 5): sheet {med['sheet']} ms, SVG {med['svg']} ms ({med['svg'] / max(1, med['sheet']):.1f}x)")
    # measured 2026-10-18: about 140 vs 350 ms (2.5x). Generous: the sheet must at least cost a quarter less.
    check(med['sheet'] < med['svg'] * 0.75, f"the sheet should cost clearly less to draw than the SVG pictures: {med}")

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=EXE)
        await checks(b)
        await isolated(b)
        table = {}
        for rate in (1, 4):
            table[rate] = await timing(b, rate)
        await b.close()
    print(f"  median of {REPS} (ms)    {'sheet frame':>11} {'settled':>8} {'long':>6}   {'svg frame':>9} {'settled':>8} {'long':>6}")
    for rate in (1, 4):
        tot = {'sheet': 0, 'svg': 0}
        for name, _ in ACTIONS:
            a, c = table[rate][('sheet', name)], table[rate][('svg', name)]
            tot['sheet'] += a['frame']; tot['svg'] += c['frame']
            print(f"  {rate}x {name:<16} {a['frame']:>11} {a['settled']:>8} {a['longtask']:>6}   {c['frame']:>9} {c['settled']:>8} {c['longtask']:>6}")
        print(f"  {rate}x {'sum of frames':<16} {tot['sheet']:>11} {'':>8} {'':>6}   {tot['svg']:>9}")
        # In the whole game the emoji are one cost among many and the box is noisy: only a clear step back fails here.
        check(tot['sheet'] <= tot['svg'] * 1.4, f"@{rate}x the sheet should not be slower than the SVG path: {tot['sheet']} vs {tot['svg']} ms")
    print(f'emoji-perf: {len(failures)} failure(s)')
    sys.exit(1 if failures else 0)

asyncio.run(main())
