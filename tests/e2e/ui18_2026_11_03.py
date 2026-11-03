#!/usr/bin/env python3
"""Package UI18 (2026-11-03, owner 22:04 + 22:08): browser checks on the built index.html, shots in tests/e2e/shots/ui18/.
    python3 tests/e2e/ui18_2026_11_03.py [--widths 1366,390]
The Codex skill filter lists only seen skills; "? Mystery skills" shows the cards with an unseen skill and is gone when there is none
(and in Admin Mode); Bee Knight is found by Swarm / Flying and its Codex tile reads "Swarm [Lvl 1]". Build first. Exits 1 on a failed check."""
import argparse, asyncio, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vis3_2026_10_26 as V
from playwright.async_api import async_playwright
ROOT = V.ROOT
SHOTS = os.path.join(ROOT, 'tests', 'e2e', 'shots', 'ui18'); os.makedirs(SHOTS, exist_ok=True)
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
    await pg.goto(url); await pg.wait_for_function("typeof switchTab === 'function' && typeof renderCodex === 'function'", timeout=90000); await pg.wait_for_timeout(1500)
    await pg.add_style_tag(content=NOTOAST)
    await pg.evaluate("(()=>{ " + V.OWN + " })()")
    r = await pg.evaluate("""(()=>{ adminModeEnabled = false; skillBookMemo = null; const chips = codexSkillChoices().map(c=> c.key), seen = ui18SeenSkillKeys();
      const all = SKILL_DEFS.concat(PASSIVE_DEFS).filter(p=> p.label && !p.retired).map(p=> p.key);
      const fam = k=> [...seen].some(s=> skillFamilyId(s) === k);
      return {chips: chips.length, allSkills: all.length, unseenOffered: chips.filter(k=> !seen.has(k) && !fam(k)), mystery: ui18MysteryCount(), bk: !!getCardDefs()['bee-knight']}; })()""")
    print('  state', r)
    ok(r['bk'], 'Bee Knight exists')
    ok(not r['unseenOffered'], 'the filter offers only seen skills')
    ok(r['chips'] < r['allSkills'], 'fewer chips than skills that exist')
    await pg.evaluate("(()=>{ FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); codexViewMode = 'compressed'; codexFiltersOpen = true; codexSubTab = 'browse'; switchTab('codex'); })()"); await pg.wait_for_timeout(1800)
    await pg.click('#cxSkillBtn'); await pg.wait_for_timeout(400)
    has = await pg.evaluate("!!document.querySelector('#cxSkillPanel [data-cxskill=\"mystery\"]')")
    ok(has == (r['mystery'] > 0), f'the mystery chip is there exactly when cards carry an unseen skill ({r["mystery"]} cards)')
    if has:
        txt = await pg.evaluate("document.querySelector('#cxSkillPanel [data-cxskill=\"mystery\"]').textContent.trim()")
        ok(txt.startswith('?') and 'Mystery skills' in txt, f'chip reads "? Mystery skills" ({txt})')
        await pg.click('#cxSkillPanel [data-cxskill="mystery"]'); await pg.wait_for_timeout(900)
        r2 = await pg.evaluate("({tiles: document.querySelectorAll('#codexGrid .cx-tile-wrap').length, active: codexSkillsChosen()})")
        print('  mystery tiles', r2)
        ok(r2['active'] == ['mystery'], 'the mystery pick is active')
        ok(r2['tiles'] > 0, f'filtering to mystery shows cards ({r2["tiles"]})')
        await pg.screenshot(path=os.path.join(SHOTS, f'mystery-{w}.png'))
        await pg.evaluate("codexSetSkills([])")
    # Bee Knight: found by its later-level skills, the tile carries the flag
    r = await pg.evaluate("""(()=>{ const d = getCardDefs()['bee-knight'], base = copyBaseDef('bee-knight') || d;
      const sh = codexShownDef('bee-knight', d);
      return {byFlying: ui18CardMatchesPick(d, 'flying'), bySwarm: ui18CardMatchesPick(d, 'swarm'), hasLS: !!base.levelSkills, lvl: sh.level, flags: ui18LateSkillFlags('bee-knight', sh), skills: ui18CardSkillKeys(base)}; })()""")
    print('  bee knight', r)
    # make every skill seen: no mystery cards, and Swarm is found at a later level
    await pg.evaluate("""(()=>{ window.__real = ui18SeenSkillKeys; window.ui18SeenSkillKeys = ()=> new Set(SKILL_DEFS.concat(PASSIVE_DEFS).map(p=> p.key)); })()""")
    r = await pg.evaluate("""(()=>{ const d = getCardDefs()['bee-knight'], sh = codexShownDef('bee-knight', d);
      return {mystery: ui18MysteryCount(), swarm: ui18CardMatchesPick(d, 'swarm'), flags: ui18LateSkillFlags('bee-knight', sh), lv: sh.level}; })()""")
    print('  all seen', r)
    ok(r['mystery'] == 0, 'when every skill is seen, no card is a mystery card')
    ok(r['swarm'], 'filtering by Swarm lists Bee Knight')
    ok('Swarm' in r['flags'] and '[Lvl 1]' in r['flags'], 'Bee Knight tile flag reads Swarm [Lvl 1]')
    ok('Flying' in r['flags'], 'and Flying')
    await pg.evaluate("renderCodexGrid()"); await pg.wait_for_timeout(600)
    n = await pg.evaluate("document.querySelectorAll('#codexGrid .cx-lvlsk').length")
    ok(n > 0, f'the Codex grid draws {n} level flags')
    await pg.evaluate("(()=>{ codexSetSkills(['swarm']); })()"); await pg.wait_for_timeout(900)
    r = await pg.evaluate("({tiles: document.querySelectorAll('#codexGrid .cx-tile-wrap').length, flag: !!document.querySelector('#codexGrid .cx-lvlsk')})")
    ok(r['tiles'] > 0, f'Swarm filter shows cards ({r["tiles"]})')
    el = await pg.query_selector('#codexGrid .cx-tile-wrap')
    await pg.screenshot(path=os.path.join(SHOTS, f'swarm-{w}.png'))
    await pg.evaluate("window.ui18SeenSkillKeys = window.__real; codexSetSkills([])")
    # Admin Mode lists everything and has no mystery entry
    r = await pg.evaluate("""(()=>{ adminModeEnabled = true; skillBookMemo = null; const n = codexSkillChoices().length, m = ui18MysteryCount(); adminModeEnabled = false; skillBookMemo = null; return {n, m}; })()""")
    ok(r['m'] == 0 and r['n'] > 0, f'Admin Mode: all skills listed ({r["n"]}), no mystery entry')
    ok(not errs, f'no page errors {errs[:2]}'); await ctx.close()

async def main(a):
    httpd = V.serve(); url = f'http://127.0.0.1:{httpd.server_address[1]}/index.html'
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=V.CHROME if os.path.exists(V.CHROME) else None)
        for w in [int(x) for x in a.widths.split(',')]: await run(b, url, w)
        await b.close()
    print('FAILED %d' % len(fails) if fails else 'all ok'); return 1 if fails else 0
if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--widths', default='1366,390'); sys.exit(asyncio.run(main(ap.parse_args())))
