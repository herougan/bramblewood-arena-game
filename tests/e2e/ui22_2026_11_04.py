#!/usr/bin/env python3
"""Package UI22 (2026-11-04): browser checks on the built index.html, shots in docs/screens/UI22/.
    python3 tests/e2e/ui22_2026_11_04.py [--widths 1366,390]
  1 the Map cards window has a "Skirmish rewards" section: a caption per fight (code + name), card tiles with a role under each
  2 a map with a Claude pick not on its lists has a "Recommended by Claude" section, each tile with a "Claude New" pill
  3 those cards are on no list: not in mapPoolSections, not in an .rv1-tile (no count, export or flip)
  4 "Skills on these cards" is still the compact block (UI22a)
Build first. Exits 1 on a failed check."""
import argparse, asyncio, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vis3_2026_10_26 as V
from playwright.async_api import async_playwright
ROOT = V.ROOT
SHOTS = os.path.join(ROOT, 'docs', 'screens', 'UI22'); os.makedirs(SHOTS, exist_ok=True)
fails = []
def ok(c, m):
    print(('  ok  ' if c else '  FAIL ') + m, flush=True)
    if not c: fails.append(m)
NOTOAST = '.toast, .toast-host, #toastHost, .xp-float, .fxg-title-stage, .level-up-burst, #signInBanner{display:none !important;} #atmoTint, #atmoCanvas{display:none !important;}'

async def run(b, url, w):
    print(f'-- width {w}')
    ctx = await b.new_context(viewport={'width': w, 'height': 844 if w < 700 else 900}, has_touch=(w < 700))
    pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.add_init_script(V.SKIP)
    await pg.goto(url); await pg.wait_for_function("typeof switchTab === 'function' && typeof pk1OpenMapCards === 'function'", timeout=90000); await pg.wait_for_timeout(1500)
    await pg.add_style_tag(content=NOTOAST)
    await pg.evaluate("(()=>{ " + V.OWN + " adminModeEnabled = true; })()")
    r = await pg.evaluate("""(()=>{ const out = []; for(const m of mainConquestMaps().slice(0, 12)){ pk1OpenMapCards(m.id); const ov = document.getElementById('pk1MapCardsOverlay');
      const rw = ov.querySelector('#ui22McRewards'), cl = ov.querySelector('#ui22McClaude'), lists = new Set(mapPoolSections(m.id).flatMap(s=> s.ids || []));
      out.push({id: m.id, fights: rw ? rw.querySelectorAll('.ui22-fight').length : -1, caps: rw ? rw.querySelectorAll('.ui22-cap').length : 0, roles: rw ? rw.querySelectorAll('.ui22-rw-role').length : 0,
        claude: cl ? cl.querySelectorAll('[data-ui22-claude-new]').length : 0, pills: cl ? [...cl.querySelectorAll('.ui22-pill')].map(x=> x.textContent) : [],
        onList: cl ? [...cl.querySelectorAll('[data-ui22-claude-new]')].filter(x=> lists.has(x.dataset.ui22ClaudeNew)).length : 0,
        inRv: cl ? cl.querySelectorAll('.rv1-tile').length : 0, skills: !!ov.querySelector('#ui19McSkills'), modalScroll: getComputedStyle(ov.querySelector('.pk1-mc-modal')).overflowY});
      ov.hidden = true; ov.innerHTML = ''; } return out; })()""")
    print('  maps', [(x['id'], x['fights'], x['claude']) for x in r])
    ok(all(x['fights'] > 0 and x['caps'] == x['fights'] and x['roles'] >= x['fights'] for x in r), 'each map has a Skirmish rewards section: a caption per fight, a role under each card')
    ok(any(x['claude'] > 0 for x in r), 'some map has a Recommended by Claude section')
    # 2026-11-07 (CONTENT17): a pick that is a new card (on no list, awaiting a map) wears "New card" instead
    ok(all(p in ('Claude New', 'New card') for x in r for p in x['pills']) and all(len(x['pills']) == x['claude'] for x in r), 'every Claude tile wears the Claude New pill (or New card)')
    ok(all(x['onList'] == 0 and x['inRv'] == 0 for x in r), 'Claude cards are on no list and are no review tile')
    ok(all(x['skills'] and x['modalScroll'] == 'auto' for x in r), 'the skills block and the whole-dialog scroll (UI22a) are still there')
    best = max(r, key=lambda x: x['claude'] * 100 + x['fights'])['id']
    await pg.evaluate("pk1OpenMapCards(%r)" % best); await pg.wait_for_timeout(900)
    await pg.screenshot(path=os.path.join(SHOTS, f'mapcards-top-{w}.png'), animations='allow')
    for sid, name in (('ui22McRewards', 'rewards'), ('ui22McClaude', 'claude')):
        await pg.evaluate("document.getElementById(%r) && document.getElementById(%r).scrollIntoView({block:'start'})" % (sid, sid)); await pg.wait_for_timeout(500)
        await pg.screenshot(path=os.path.join(SHOTS, f'mapcards-{name}-{w}.png'), animations='allow')
    ok(not errs, f'no page errors {errs[:2]}')
    await ctx.close()

async def main(a):
    httpd = V.serve(); url = f'http://127.0.0.1:{httpd.server_address[1]}/index.html'
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=V.CHROME if os.path.exists(V.CHROME) else '/opt/pw-browsers/chromium', args=['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'])
        for w in [int(x) for x in a.widths.split(',')]: await run(b, url, w)
        await b.close()
    httpd.shutdown()
    print('FAILED: ' + '; '.join(fails) if fails else 'all ok'); sys.exit(1 if fails else 0)

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--widths', default='1366,390')
    asyncio.run(main(ap.parse_args()))
