#!/usr/bin/env python3
"""Package ENG27 (2026-11-06): browser checks at 390 and 1366.
  #10  the Fortify / Unfortify pips on a bramble tile (armor, thorns, vulnerable), and the 'fortify' float;
  #11  the Mach / Anti-air miss floats; #22 the Hype and Grant floats; #32 the helmet float and its pip gone;
  #24  what a Plains Terrace bramble says and gives (+3 first unit) where the game shows it.
    python3 tests/e2e/eng27_2026_11_06.py            # shots in tests/out/shots/eng27/
    python3 tests/e2e/eng27_2026_11_06.py --keep     # also copies them into docs/screens/eng27/
Build first. Exits 1 on a failed check.
"""
import argparse, asyncio, os, sys, shutil, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vis3_2026_10_26 as V
from playwright.async_api import async_playwright
ROOT = V.ROOT
OUT = os.path.join(ROOT, 'tests', 'out', 'shots', 'eng27'); os.makedirs(OUT, exist_ok=True)
KEEP = os.path.join(ROOT, 'docs', 'screens', 'eng27')
fails = []; shots = []
def ok(cond, msg):
    print(('  ok  ' if cond else '  FAIL ') + msg, flush=True)
    if not cond: fails.append(msg)

PIPS = """(()=>{ const t = document.querySelector('[data-hq="A"]'); const f = t && t.querySelector('.eng27-fort'); if(!f) return null;
  const r = f.getBoundingClientRect(), tr = t.getBoundingClientRect(); return {txt: f.textContent, n: f.querySelectorAll('.eng27-fp').length, inside: r.left >= tr.left - 1 && r.right <= tr.right + 1 && r.top >= tr.top - 1, w: Math.round(r.width), tw: Math.round(tr.width)}; })()"""
FLOATS = "(()=> [...document.querySelectorAll('.float-text, .floating-text, .ft, [class*=float]')].map(x=> x.textContent.trim()).filter(Boolean).slice(-12))()"
B24 = """(()=>{ const ch = CHARACTER_DEFS['plains-terrace']; const sc = skirmishCastle(findConquestNode('m1', '0-4').node);
  return {desc: brambleEffectText(ch), blurb: castleBlurb(ch), node: sc.character.id + ' ' + JSON.stringify(sc.character.effects), lv: sc.character.level}; })()"""

async def run(b, url, w):
    ctx = await b.new_context(viewport={'width': w, 'height': 844 if w < 700 else 900}, has_touch=(w < 700))
    pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.add_init_script(V.SKIP)
    await pg.goto(url); await pg.wait_for_function("typeof switchTab === 'function' && typeof startConquestMatch === 'function'", timeout=90000); await pg.wait_for_timeout(1500)
    await pg.evaluate("(()=>{ " + V.OWN + " })()")
    b24 = await pg.evaluate(B24); print(f'[{w}] #24 {b24}')
    ok('+3' in b24['desc'] and '"firstUnitAtkBonus":3' in b24['node'], f'[{w}] #24 Plains Terrace reads +3 in the game and on the road (0-4, Lv {b24["lv"]})')
    uids = await pg.evaluate(V.BOARD + "(%s, %s)" % (json.dumps([['otter-kit', -1, 9], ['otter-kit', 0, 9]]), json.dumps([['otter-kit', 0, 9], ['otter-kit', 1, 9, {}]])))
    await pg.evaluate("document.querySelectorAll('.coach-tip, .toast').forEach(x=> x.remove())")
    # #10: the pips, from the engine's state (a resumed fight) and from a replayed 'fortify' event
    await pg.evaluate("(()=>{ matchState.players[1].eng27Fort = {armor:2, thorns:1}; matchState.eng27Fort = null; renderMatchUI(); })()"); await pg.wait_for_timeout(300)
    p0 = await pg.evaluate(PIPS); ok(bool(p0) and p0['n'] == 2 and p0['inside'], f'[{w}] #10 Fortify pips on your bramble from the engine state ({p0})')
    await pg.evaluate("""(()=>{ renderVfxForEvent({type:'fortify', side:'A', uid:%d, defId:'otter-kit', parts:{armor:1}, fort:{armor:3, thorns:1, vulnerable:1}});
      renderVfxForEvent({type:'evaded', side:'B', attUid:%d, attDefId:'otter-kit', targetSide:'A', targetUid:%d, targetDefId:'otter-kit', reason:'mach'});
      renderVfxForEvent({type:'statusFx', kind:'eng27Hype', side:'A', attUid:%d, attDefId:'otter-kit', targetSide:'A', targetUid:%d, targetDefId:'otter-kit', amount:1}); })()""" % (uids['1:0'], uids['2:0'], uids['1:-1'], uids['1:0'], uids['1:-1']))
    await pg.wait_for_timeout(350)
    p1 = await pg.evaluate(PIPS); fl = await pg.evaluate(FLOATS)
    ok(bool(p1) and p1['n'] == 3 and p1['txt'].replace(' ', '') == '311', f'[{w}] #10 a replayed fortify event repaints the pips: armor, thorns, vulnerable ({p1})')
    ok(any('Armor' in f for f in fl) and any('Mach' in f for f in fl) and any('Hype' in f for f in fl), f'[{w}] floats: Fortify, Mach, Hype ({fl})')
    p = f'{OUT}/eng27-pips-floats-{w}.png'; await pg.screenshot(path=p); shots.append(p)
    tile = await pg.query_selector('[data-hq="A"]')
    if tile:
        p = f'{OUT}/eng27-bramble-tile-{w}.png'; await tile.screenshot(path=p); shots.append(p)
    # #32 the helmet: pip there, then gone after the event
    await pg.evaluate(V.BOARD + "(%s, %s)" % (json.dumps([['otter-kit', 0, 9]]), json.dumps([['helmeted-otter', 0, 9]])))
    hu = await pg.evaluate("(()=>{ const c = matchState.players[2].row.center[0]; return c && c.uid; })()")
    h0 = await pg.evaluate("(()=>{ const el = boardCardEl(%d); return !!(el && el.querySelector('.ab-helm')); })()" % hu)
    await pg.evaluate("(()=>{ const c = matchState.players[2].row.center[0]; c.helmetGone = true; renderVfxForEvent({type:'deflect', side:'B', uid:c.uid, defId:c.defId, helmetGone:true}); renderMatchUI(); })()"); await pg.wait_for_timeout(300)
    h1 = await pg.evaluate("(()=>{ const el = boardCardEl(%d); return !!(el && el.querySelector('.ab-helm')); })()" % hu)
    ok(h0 and not h1, f'[{w}] #32 the helmet pip goes once it has blocked ({h0} -> {h1})')
    p = f'{OUT}/eng27-helmet-{w}.png'; await pg.screenshot(path=p); shots.append(p)
    ok(not errs, f'[{w}] no page errors ({errs[:2]})')
    await ctx.close()

async def main(a):
    httpd = V.serve(); url = f'http://127.0.0.1:{httpd.server_address[1]}/index.html'
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=V.CHROME)
        for w in a.widths: await run(b, url, w)
        await b.close()
    httpd.shutdown()
    if a.keep:
        os.makedirs(KEEP, exist_ok=True)
        for s in shots: shutil.copy(s, KEEP)
    print(f'{len(fails)} failed' if fails else 'all ok'); sys.exit(1 if fails else 0)

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--keep', action='store_true'); ap.add_argument('--widths', type=int, nargs='+', default=[390, 1366])
    asyncio.run(main(ap.parse_args()))
