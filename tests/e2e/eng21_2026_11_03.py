#!/usr/bin/env python3
"""Package ENG21 (2026-11-03, owner 20:28) in the real game page, headless Chromium, at 390 and 1366 wide.

    python3 tests/e2e/eng21_2026_11_03.py [--widths 390,1366] [--keep]   # about a minute; sheets in tests/out/shots, --keep: docs/screens/eng21/

An Otter Flag-Bearer (Inspiring 1) between two Otter Kits. The replay plays an 'inspired' event on the left Kit (1 token, +2) in slow motion:
a sheet of frames of the inspiration beat on its Attack number; the Kit's 📯1 pip shows and its Attack reads +2. Then an 'inspiredSpent':
the second sheet (the flare), the pip gone, the Attack back. With prefers-reduced-motion the plate takes the still tint (no animation);
with Effects None nothing is added. Uses tests/e2e/pl2_2026_10_25.py's page helpers. Not in tests/run-all.sh (a browser run). Exit 1 on failure.
"""
import argparse, asyncio, importlib.util, os, sys, shutil
HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location('pl2e2e', os.path.join(HERE, 'pl2_2026_10_25.py')); P = importlib.util.module_from_spec(spec); spec.loader.exec_module(P)
from playwright.async_api import async_playwright
KEEP = os.path.join(P.ROOT, 'docs', 'screens', 'eng21')
E = P.E
import re
# pl2's BOARD carries a Python-style '# 2026-10-26 ...' note inside its JS (a syntax error in the page): cut it here
BOARD = re.sub(r'  # [^\n]*', '', P.BOARD)
MINE = "[['otter-kit', -1, 30], ['otter-flag-bearer', 0, 30], ['otter-kit', 1, 30]]"
SNAP = "const m = matchState; m.replayCards = {}; [1].forEach(pid=> ['left','center','right'].forEach(s=> m.players[pid].row[s].forEach(c=>{ m.replayCards[c.uid] = Object.assign({}, c); })));"
def ev(kind, u, extra):
    return "{type:'statusFx', kind:'%s', side:'A', attUid:%s, attDefId:'otter-kit', targetUid:%s, targetDefId:'otter-kit', %s}" % (kind, u, u, extra)

async def state(pg, u):
    return await pg.evaluate("(u=>{ const el = boardCardEl(u), a = el && el.querySelector('.stats .atk'); return {atk: a ? a.textContent.trim() : null, cls: a ? a.className : '', pip: [...el.querySelectorAll('.abadge.eng21-insp')].map(x=> x.textContent.trim())}; })(%s)" % u)

async def run(b, url, w):
    pg = await P.page(b, url, w)
    u = await pg.evaluate(BOARD + "('m1', '0-2', " + MINE + ", [['otter-kit', 0, 40]])")
    left, mid = u['1:-1'], u['1:0']
    a0 = (await state(pg, left))['atk']
    gain = "{type:'statusFx', kind:'inspired', side:'A', attUid:%s, attDefId:'otter-flag-bearer', targetUid:%s, targetDefId:'otter-kit', amount:2, tokens:1, total:1}" % (mid, left)
    # every class the Attack plate takes is recorded by a MutationObserver (polling misses a 0.8 s class on a loaded machine)
    OBS = "window.__e21 = []; const pl = boardCardEl(%s).querySelector('.stats .atk'); new MutationObserver(()=> window.__e21.push(pl.className)).observe(pl, {attributes:true, attributeFilter:['class']});" % left
    await pg.evaluate(E(SNAP + OBS + " gsap.globalTimeline.timeScale(.25); renderVfxForEvent(" + gain + "); return 1;"))
    await P.frames(pg, 'eng21-gain', w, [0, 120, 260, 420, 600, 800], '#rowMine', 40, cols=3)
    await pg.evaluate("gsap.globalTimeline.timeScale(1)"); await pg.wait_for_timeout(900)
    cls = await pg.evaluate("window.__e21.join(' | ')")
    P.ok('eng21-insp-gain' in cls, f'{w}: the inspiration beat plays on the Attack number as the token comes ({cls[:160]})')
    # outside a real replay (no replayRows) the board's numbers read the live unit (FIX5); the replay copy is what the fight shows
    r = await pg.evaluate("(u=>{ const rc = matchState.replayCards[u]; return {t: rc.inspTokens, a: rc.inspired, pip: eng21InspPip(rc)}; })(%s)" % left)
    P.ok(r['t'] == 1 and r['a'] == 2 and '📯1' in r['pip'], f'{w}: the Kit holds 1 token (+2) and its pip reads 📯1 {r}')
    await pg.evaluate(E("window.__e21 = []; gsap.globalTimeline.timeScale(.25); renderVfxForEvent(" + ev('inspiredSpent', left, 'amount:2, tokens:1') + "); return 1;"))
    await P.frames(pg, 'eng21-spend', w, [0, 120, 260, 420, 600], '#rowMine', 40, cols=3)
    await pg.evaluate("gsap.globalTimeline.timeScale(1)"); await pg.wait_for_timeout(900)
    s = await state(pg, left)
    cls = await pg.evaluate("window.__e21.join(' | ')")
    P.ok('eng21-insp-spend' in cls, f'{w}: the spend beat plays on the Attack number ({cls[:160]})')
    r = await pg.evaluate("(u=>{ const rc = matchState.replayCards[u]; return {t: rc.inspTokens, a: rc.inspired}; })(%s)" % left)
    P.ok(not r['t'] and not r['a'] and not s['pip'] and s['atk'] == a0, f'{w}: spent: no tokens left, no pip, the Attack is back ({r}, {s["atk"]}, {s["pip"]})')
    await P.close(pg)
    # reduced motion: the still tint, no animation
    ctx = await b.new_context(viewport={'width': w, 'height': 860}, reduced_motion='reduce'); pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg._errs = errs; pg._ctx = ctx
    await pg.add_init_script(P.DONE); await pg.goto(url); await pg.wait_for_function("typeof switchTab === 'function' && typeof startConquestMatch === 'function'", timeout=60000); await pg.wait_for_timeout(2200)
    u = await pg.evaluate(BOARD + "('m1', '0-2', " + MINE + ", [['otter-kit', 0, 40]])"); left = u['1:-1']
    r = await pg.evaluate(E(SNAP + " eng21InspNumFx(%s, 'gain'); const a = boardCardEl(%s).querySelector('.stats .atk'); return {cls: a.className, anim: getComputedStyle(a).animationName, before: getComputedStyle(a, '::before').content};" % (left, left)))
    P.ok('eng21-insp-still' in r['cls'] and r['anim'] in ('none', '') and r['before'] in ('none', 'normal', ''), f'{w}: reduced motion: the still tint, no animation {r}')
    await P.shot(pg, 'eng21-still', w, '#rowMine', 40)
    await P.close(pg)
    # Effects None: nothing
    pg = await P.page(b, url, w, P.DONE + " localStorage.setItem('bramblewood_fx_level', 'none');")
    u = await pg.evaluate(BOARD + "('m1', '0-2', " + MINE + ", [['otter-kit', 0, 40]])"); left = u['1:-1']
    r = await pg.evaluate(E(SNAP + " eng21InspNumFx(%s, 'gain'); eng21InspNumFx(%s, 'spend'); return boardCardEl(%s).querySelector('.stats .atk').className;" % (left, left, left)))
    P.ok('eng21-insp' not in r, f'{w}: Effects None: no inspiration beat ({r})')
    await P.close(pg)

async def main(a):
    httpd = P.serve(); url = f'http://127.0.0.1:{httpd.server_address[1]}/index.html'
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=P.CHROME if os.path.exists(P.CHROME) else None, args=['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'])
        for w in [int(x) for x in a.widths.split(',')]: await run(b, url, w)
        await b.close()
    httpd.shutdown()
    if a.keep:
        from PIL import Image
        os.makedirs(KEEP, exist_ok=True)
        for f in P.shots:
            Image.open(f).convert('RGB').save(os.path.join(KEEP, os.path.basename(f)[:-4] + '.jpg'), quality=78)
        print('kept', len(P.shots), 'in', KEEP)
    print('shots:', len(P.shots), 'in', P.OUT)
    print('FAILED' if P.fails else 'all checks passed', len(P.fails))
    sys.exit(1 if P.fails else 0)

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--widths', default='390,1366'); ap.add_argument('--keep', action='store_true')
    asyncio.run(main(ap.parse_args()))
