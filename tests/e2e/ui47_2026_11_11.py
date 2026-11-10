#!/usr/bin/env python3
"""UI47 (2026-11-11, owner 00:06 / 00:16) browser check, with the owner's real picks for Maps 0-12 loaded (docs/design/map-picks-owner-2026-11-11.json) in dark mode at 1900 and 390 px.
Checks: Map 0 carries the tutorial cards (pill "Tutorial"); Carried = only Yes on an earlier main map + tutorial, pills name where; a Yes on a NEW! card stays NEW!; baby cards are
not counted; Skills on these cards = the Yes cards; Add card (search, keyboard, 390 px); Skirmish rewards use the full card; Suggested / Added by Claude / x N chip.
    python3 tests/e2e/ui47_2026_11_11.py        (build first; needs Playwright)  Screenshots: docs/screens/ui47/"""
import asyncio, os, sys, json, functools, threading, http.server, socketserver
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'docs', 'screens', 'ui47'); os.makedirs(OUT, exist_ok=True)
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
SKIP = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1');"
        "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying']));")
PICKS = json.load(open(os.path.join(ROOT, 'docs', 'design', 'map-picks-owner-2026-11-11.json')))['maps']
STORE = {k: {'yes': v['yes'], 'no': [], 't': {}, 'localAt': 0} for k, v in PICKS.items()}
fails = []
def ok(c, m):
    print(('  ok ' if c else '  x ') + m)
    if not c: fails.append(m)
def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
        def handle(self):
            try: super().handle()
            except (BrokenPipeError, ConnectionResetError): pass
    h = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); threading.Thread(target=h.serve_forever, daemon=True).start(); return h
def E(body): return "(async()=>{ " + body + " })()"
OPEN = "adminModeEnabled = true; pk1OpenMapCards(%s); await new Promise(r=> setTimeout(r, 1200));"
SPLIT = """(()=>{ const defs = getCardDefs(), ok2 = id=> !!defs[id] && ui41Allowed(id, defs), out = {};
  ui37MapsData().filter(m=> m.n <= 12).forEach(m=>{ const sp = ui37Split(m.id, defs, ok2); out[m.id] = {n: sp.n, neu: sp.neu.map(p=> p.id), car: sp.car.map(p=> [p.id, sp.idx.get(p.id)]), yes: m.yes}; }); return out; })()"""

async def new_page(b, w, h_, url):
    ctx = await b.new_context(viewport={'width': w, 'height': h_}, color_scheme='dark')
    pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.add_init_script(SKIP + "localStorage.setItem('bw_ui37_map_picks_v1', %s);" % json.dumps(json.dumps(STORE)))
    await pg.goto(url)
    await pg.wait_for_function("typeof ui37Picks !== 'undefined' && typeof ui37Split === 'function'", timeout=120000)  # a test bug fixed here: the old tests slept 1.8 s and could run before the page script
    await pg.wait_for_timeout(1500)
    return ctx, pg, errs

async def main():
    h = serve(); url = f'http://127.0.0.1:{h.server_address[1]}/index.html'
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME if os.path.exists(CHROME) else None, args=['--no-sandbox'])
        ctx, pg, errs = await new_page(b, 1900, 1000, url)
        S = await pg.evaluate(SPLIT); tut = await pg.evaluate("ui43TutorialCards()")
        ok(len(S) == 13 and S['m1']['n'] == 0, 'owner picks loaded for Maps 0-12')
        # 1 Map 0 carries the tutorial cards
        c0 = {i: n for i, n in S['m1']['car']}
        ok(all(c0.get(t) == -1 for t in tut) and len(tut) > 0, f'1. Map 0 Carried holds the tutorial cards {tut} with index -1 (Tutorial)')
        # 3 the rule on every map 0-12
        yes_by = {k: set(v['yes']) for k, v in S.items()}; order = sorted(S, key=lambda k: S[k]['n']); bad = []
        for k in order:
            n = S[k]['n']
            for cid, idx in S[k]['car']:
                if idx == -1:
                    if cid not in tut: bad.append((k, cid, 'tutorial pill, not a tutorial card'))
                elif not any(S[o]['n'] == idx and cid in yes_by[o] for o in order) or idx >= n: bad.append((k, cid, idx))
            carried = {cid for cid, _ in S[k]['car']}
            for o in order:
                if S[o]['n'] < n:
                    miss = [c for c in yes_by[o] if c not in carried and c in (set(S[k]['neu']) | carried) is False]
            ok(not set(S[k]['neu']) & carried, f"Map {n}: nothing both NEW! and Carried")
        ok(not bad, '3. every Carried card is Yes on the earlier map its pill names (or a tutorial card): ' + str(bad[:3]))
        c1 = {i for i, _ in S['mf']['car']}
        ok('beaver-lumberjack' not in c1, '3a. Beaver Lumberjack (not Yes on Map 0) is not Carried on Map 1')
        ok(not any('hollow-belly-rat' in [i for i, _ in S[k]['car']] for k in S), '3b. Hollow-belly Rat is Carried on no map (never Yes earlier)')
        # 3c Alley Cat on Map 5: remove its Yes there, it is NEW!; click Yes stays NEW!
        r = await pg.evaluate(E("""ui37SetFlag('mw', 'alley-cat', ''); const defs = getCardDefs(), ok2 = id=> !!defs[id] && ui41Allowed(id, defs); const a = ui37Split('mw', defs, ok2);
          const was = {neu: a.neu.some(p=> p.id === 'alley-cat'), car: a.car.some(p=> p.id === 'alley-cat')};
          ui37SetFlag('mw', 'alley-cat', 'yes'); const b2 = ui37Split('mw', defs, ok2);
          return {was, now: {neu: b2.neu.some(p=> p.id === 'alley-cat'), car: b2.car.some(p=> p.id === 'alley-cat')}};"""))
        ok(r['was']['neu'] and not r['was']['car'] and r['now']['neu'] and not r['now']['car'], f'3c. Alley Cat (never Yes earlier): NEW! before and after a Yes on Map 5 {r}')
        # 4 baby cards are not counted
        r = await pg.evaluate(E("""const defs = getCardDefs(), baby = Object.keys(defs).filter(id=> ui13IsBaby(id, defs) && !defs[id].token && !defs[id].test);
          const ok2 = id=> !!defs[id] && ui41Allowed(id, defs), sp = ui37Split('m2', defs, ok2), b = sp.neu.find(p=> ui47IsBaby(p.id, defs));
          return {nBaby: baby.length, shown: b ? b.id : null, counted: ui47Counted(sp.neu, defs).length, total: sp.neu.length};"""))
        print('   ', r); ok(r['nBaby'] > 0, '4. the game has baby cards (cardKindOf baby)')
        if r['shown']:
            ok(r['counted'] < r['total'], '4. baby cards in NEW! are left out of the counted size')
            await pg.evaluate(E(OPEN % '"m2"'))
            before = await pg.evaluate("document.querySelector('[data-ui37-ct=n] .ui37-x').textContent")
            await pg.click(f'#ui37Pros .ui37-tile[data-ui37-id="{r["shown"]}"] [data-ui37-flag=yes]')
            after = await pg.evaluate("document.querySelector('[data-ui37-ct=n] .ui37-x').textContent")
            ok(before == after, f'4. flagging a baby card Yes leaves the NEW! flagged count at {before} (is {after})')
            await pg.evaluate("ui37SetFlag('m2', '%s', '')" % r['shown'])
        # 2 skills: main = Yes cards
        r = await pg.evaluate(E(OPEN % '"m2"' + "const defs = getCardDefs(), g = ui32McSkillIds('m2', 'm2', id=> !!defs[id]); return {main: g.main.slice().sort(), yes: ui37Ent('m2').yes.slice().sort(), sec: !!document.querySelector('#ui19McSkills')};"))
        ok(r['main'] == r['yes'] and r['sec'], f"2. Skills on these cards counts the Yes cards only ({len(r['yes'])})")
        # 5 add card
        for top, q, cid in (('m2', 'moon jelly', None), ('mw', 'field vole', None), ('m8', 'crocodile ambusher', None)):
            await pg.evaluate(E(OPEN % json.dumps(top)))
            await pg.click('#ui47AddBtn'); await pg.keyboard.type(q); await pg.wait_for_timeout(200)
            first = await pg.evaluate("(document.querySelector('#ui47AddList li[data-ui47-pick]') || {dataset: {}}).dataset.ui47Pick || null")
            ok(first is not None, f'5. "{q}" finds a card ({first})')
            if first:
                await pg.keyboard.press('ArrowDown'); await pg.keyboard.press('ArrowUp'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(300)
                st = await pg.evaluate(E("""const t = document.querySelector('#ui37Pros .ui37-tile[data-ui37-id="%s"]'); const g = t && t.closest('[data-ui37-grp]');
                  const defs = getCardDefs(), ok2 = id=> !!defs[id] && ui41Allowed(id, defs), sp = ui37Split(%s, defs, ok2);
                  return {grp: g && g.dataset.ui37Grp, yes: ui37Ent(%s).yes.includes('%s'), want: sp.idx.has('%s') ? 'carried' : 'new', msg: document.getElementById('ui47Msg').textContent};""" % (first, json.dumps(top), json.dumps(top), first, first)))
                ok(st['yes'] and st['grp'] == st['want'], f"5. Enter flags {first} Yes on {top} and places it in {st['grp']} (rule: {st['want']}); {st['msg']}")
        # 6 rewards use the full card
        await pg.evaluate(E(OPEN % '"m2"'))
        r = await pg.evaluate("""(()=>{ const s = document.getElementById('ui22McRewards'); if(!s) return {none: true}; const t = [...s.querySelectorAll('.rv1-tile.is-ui39')]; return {n: t.length, big: s.querySelectorAll('.vis4-mc-card.is-large').length, role: s.querySelectorAll('[data-ui22-role]').length, old: s.querySelectorAll('.ui22-rw').length}; })()""")
        ok(r.get('none') or (r['n'] > 0 and r['n'] == r['big'] and r['role'] == r['n'] and r['old'] == 0), f'6. Skirmish rewards are full card tiles with a role pill {r}')
        # 7 + admin add + usage chip
        r = await pg.evaluate(E("""const defs = getCardDefs(); const a = ui37Ent('mf').yes.slice(); const pick = 'bee-knight';
          UI47_SUGGEST.m2 = ['field-vole']; UI47_ADMIN_ADD.mf = ['hollow-belly-rat', 'beaver-lumberjack'];
          const ok2 = id=> !!defs[id] && ui41Allowed(id, defs), s2 = ui37Split('m2', defs, ok2), s3 = ui37Split('mb', defs, ok2);
          const out = {sugFirst: s2.neu[0].id, rawYes: ui37Ent('mf').yes.includes('hollow-belly-rat'), flag: ui37FlagOf('mf', 'hollow-belly-rat'), carriedMb: s3.car.some(p=> p.id === 'beaver-lumberjack') && s3.idx.get('beaver-lumberjack') === 1,
            flagM2: ui37FlagOf('m2', 'field-vole'), usage: (ui47Usage().get('beaver-lumberjack') || []).map(m=> m.n)};
          await new Promise(r=> setTimeout(r, 50)); return out;"""))
        ok(r['sugFirst'] == 'field-vole' and r['flagM2'] == '', f"7. Suggested card sorts first in NEW! and its flag is unchanged (first {r['sugFirst']}, flag {r['flagM2'] or 'none'})")
        ok(r['rawYes'] is False and r['flag'] == 'yes' and r['carriedMb'], 'Admin add counts as Yes (Carried on Map 2, pill Map 1) and is not in the owner picks')
        ok(r['usage'] == [1, 2, 3, 4, 11], f"x N chip counts owner Yes + admin adds: Beaver Lumberjack on {r['usage']}")
        await pg.evaluate(E(OPEN % '"m2"'))
        r = await pg.evaluate("""(()=>{ const t = document.querySelector('#ui37Pros .ui37-tile[data-ui37-id="field-vole"]'); return {sug: !!(t && t.querySelector('.ui47-sug')), used: t && t.querySelector('.ui47-used') ? t.querySelector('.ui47-used').textContent : null}; })()""")
        ok(r['sug'] and r['used'] == '×2', f"Suggested badge and x2 chip on the tile {r}")
        await pg.evaluate(E(OPEN % '"mf"'))
        ok(await pg.evaluate("!![...document.querySelectorAll('#ui37Pros .ui37-tile .ui47-adm')].length"), '"Added by Claude" badge on Map 1')
        await pg.evaluate("UI47_SUGGEST.m2 = []; delete UI47_ADMIN_ADD.mf;")
        await pg.evaluate(E(OPEN % '"mb"'))
        await pg.screenshot(path=os.path.join(OUT, 'map-2-dark-1900.png'))
        await pg.evaluate(E(OPEN % '"m1"'))
        r = await pg.evaluate("[...document.querySelectorAll('#ui37Pros [data-ui37-grp=carried] .ui37-from')].map(x=> x.textContent)")
        ok(r.count('Tutorial') >= 5, f'Map 0 shows Tutorial pills under Carried ({len(r)})')
        await pg.screenshot(path=os.path.join(OUT, 'map-0-carried-dark-1900.png'))
        ok(not errs, 'no page errors ' + '; '.join(errs[:2]))
        await ctx.close()
        # 390 px
        ctx, pg, errs = await new_page(b, 390, 800, url)
        await pg.evaluate(E(OPEN % '"mw"'))
        await pg.click('#ui47AddBtn'); await pg.keyboard.type('field vole'); await pg.wait_for_timeout(300)
        await pg.screenshot(path=os.path.join(OUT, 'add-card-dark-390.png'))
        w = await pg.evaluate("(()=>{ const m = document.querySelector('.pk1-mc-modal'); return {sw: m.scrollWidth, cw: m.clientWidth, doc: document.documentElement.scrollWidth}; })()")
        ok(w['sw'] <= w['cw'] + 1 and w['doc'] <= 391, f'390 px: no sideways scroll {w}')
        await pg.click('#ui47AddList li[data-ui47-pick]'); await pg.wait_for_timeout(300)
        ok(await pg.evaluate("ui37Ent('mw').yes.includes('field-vole')"), '390 px: tapping a result flags the card Yes')
        await pg.screenshot(path=os.path.join(OUT, 'map-5-dark-390.png'))
        ok(not errs, 'no page errors (390) ' + '; '.join(errs[:2]))
        await ctx.close(); await b.close()
    return len(fails)

if __name__ == '__main__':
    rc = asyncio.run(main()); print('FAIL' if rc else 'ok'); sys.exit(1 if rc else 0)
