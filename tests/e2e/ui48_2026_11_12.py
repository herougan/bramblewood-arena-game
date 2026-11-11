#!/usr/bin/env python3
"""UI48 (2026-11-12, owner 00:38) browser check, with the owner's real picks for Maps 0-12 loaded, dark mode, 390 and 1366 px.
Items: 2 tutorial cards Carried on Map 0 / 1 only, no below-floor NEW! top-up; 3 Skirmish rewards in one tile grid; 4 side maps get 1-3 Suggested cards, own target 3 / carried 8;
5 No works on The Old Bramble (also on an admin-added card); 6 side-map ‹ › step in unlock-map order.
    python3 tests/e2e/ui48_2026_11_12.py        (build first; needs Playwright)  Screenshots: docs/screens/ui48/"""
import asyncio, os, sys, importlib.util
HERE = os.path.dirname(os.path.abspath(__file__))
sp = importlib.util.spec_from_file_location('u47', os.path.join(HERE, 'ui47_2026_11_11.py')); u = importlib.util.module_from_spec(sp); sp.loader.exec_module(u)
from playwright.async_api import async_playwright
OUT = os.path.join(u.ROOT, 'docs', 'screens', 'ui48'); os.makedirs(OUT, exist_ok=True)
ok = u.ok
E = u.E

async def main():
    h = u.serve(); url = f'http://127.0.0.1:{h.server_address[1]}/index.html'
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=u.CHROME if os.path.exists(u.CHROME) else None, args=['--no-sandbox'])
        ctx, pg, errs = await u.new_page(b, 1366, 900, url)
        # 2 tutorial cards: Map 0 and 1 only
        r = await pg.evaluate(E("""const defs = getCardDefs(), ok2 = id=> !!defs[id] && ui41Allowed(id, defs), tut = ui43TutorialCards(), out = {};
          ui37MapsData().filter(m=> m.n <= 6).forEach(m=>{ const sp = ui37Split(m.id, defs, ok2); out[m.n] = {tutCar: tut.filter(t=> sp.idx.get(t) === -1).length, tutNeu: tut.filter(t=> sp.neu.some(p=> p.id === t)).length}; });
          return {tut: tut.length, out}; """))
        t = r['out']; print('   ', r)
        ok(r['tut'] > 0 and t['0']['tutCar'] == r['tut'] and t['1']['tutCar'] == r['tut'], '2. Map 0 and Map 1 carry every tutorial card')
        ok(all(t[k]['tutCar'] == 0 for k in t if int(k) >= 2), '2. Map 2 and later: no tutorial card is Carried as Tutorial')
        # 2 no top-up below the score floor
        r = await pg.evaluate(E("""const defs = getCardDefs(), ok2 = id=> !!defs[id] && ui41Allowed(id, defs), minS = ((UI38_PROS.rules) || {}).newMinScore || 4, bad = [];
          ui37MapsData().forEach(m=>{ const sp = ui37Split(m.id, defs, ok2), fit = new Map(((UI38_PROS.maps || {})[m.id] || {fit: []}).fit.map(f=> [f[0], f[1]]));
            sp.neu.filter(p=> p.src.has('fit') && p.src.size === 1).forEach(p=>{ if(fit.get(p.id) < minS) bad.push(m.id + ':' + p.id); }); });
          return bad; """))
        ok(not r, '2. no NEW! card comes from a fit below the score floor ' + str(r[:3]))
        # 4 suggestions per side map, targets
        r = await pg.evaluate(E("""const defs = getCardDefs(), ok2 = id=> !!defs[id] && ui41Allowed(id, defs), out = [];
          ui44ProsSubs().forEach(m=>{ const sp = ui44Split(m.id, defs, ok2), s = sp.neu.filter(p=> p.src.has('suggest')).length, tg = ui37Targets(m.id);
            out.push({id: m.id, listed: ui47SuggestedOf(m.id).length, shown: s, first: sp.neu.slice(0, s).every(p=> p.src.has('suggest')), n: tg.n, c: tg.c}); });
          return out; """))
        print('   ', [(x['id'], x['listed'], x['shown']) for x in r])
        ok(len(r) >= 15 and all(1 <= x['listed'] <= 3 for x in r), '4. every side map has 1-3 Suggested cards')
        ok(all(x['shown'] == x['listed'] and x['first'] for x in r), '4. they show first in NEW!')
        ok(all(x['n'] == 3 and x['c'] == 8 for x in r), '4. side map targets: NEW! 3, Carried 8')
        # 6 order and stepping
        order = await pg.evaluate("ui44Ordered().map(m=> m.id)")
        nums = await pg.evaluate("ui44Ordered().map(m=> mapNumberOf(ui44After(m.id)))")
        ok(nums == sorted(nums) and len(order) == len(set(order)) and len(order) >= 15, '6. side maps are ordered by the main map they open after: ' + str(nums))
        mid = order[len(order) // 2]
        await pg.evaluate(E(u.OPEN % ('"%s"' % mid)))
        hd = await pg.evaluate("[...document.querySelectorAll('#ui39Head .ui37-go')].map(b=> [b.textContent, b.disabled, b.dataset.ui37Go || ''])")
        ok(hd == [['‹', False, order[len(order) // 2 - 1]], ['›', False, order[len(order) // 2 + 1]]], '6. ‹ › name the previous / next side map ' + str(hd))
        await pg.click('#ui39Head .ui37-go >> nth=1'); await pg.wait_for_timeout(600)
        now = await pg.evaluate("document.querySelector('#pk1McTitle').textContent")
        nm = await pg.evaluate("mpMapById('%s').name" % order[len(order) // 2 + 1])
        ok(nm in now, '6. › opens the next side map: ' + now)
        await pg.evaluate(E(u.OPEN % ('"%s"' % order[0])))
        d0 = await pg.evaluate("[...document.querySelectorAll('#ui39Head .ui37-go')].map(b=> b.disabled)")
        await pg.evaluate(E(u.OPEN % ('"%s"' % order[-1])))
        d1 = await pg.evaluate("[...document.querySelectorAll('#ui39Head .ui37-go')].map(b=> b.disabled)")
        ok(d0 == [True, False] and d1 == [False, True], '6. the first side map has no ‹, the last no ›')
        # 5 No on The Old Bramble, on a list card and on an admin-added card
        await pg.evaluate("UI47_ADMIN_ADD.mo = ['hazel-coppice', 'porcupine-roller']")
        await pg.evaluate(E(u.OPEN % '"mo"'))
        async def flag(card, want):
            await pg.click(f'#ui37Pros .ui37-tile[data-ui37-id="{card}"] [data-ui37-flag="{want}"]'); await pg.wait_for_timeout(250)
            return await pg.evaluate("ui42Shown('mo', '%s')" % card)
        for card in ('hazel-coppice', 'thorn-shrike', 'porcupine-roller'):
            has = await pg.evaluate("!!document.querySelector('#ui37Pros .ui37-tile[data-ui37-id=\"%s\"]')" % card)
            if not has: print('    (not drawn: %s)' % card); continue
            a = await flag(card, 'yes'); c = await flag(card, 'no')
            ok(a == 'yes' and c == 'no', f'5. {card} on The Old Bramble: Yes then No sticks ({a} -> {c})')
        ok(await pg.evaluate("ui42Shown('m1', 'hazel-coppice') === 'yes'"), '5. the side map flag does not touch the main map')
        # screenshots (dark, both widths)
        for w, hh in ((1366, 900), (390, 844)):
            ctx2, pg2, e2 = await u.new_page(b, w, hh, url); errs += e2
            await pg2.evaluate(E(u.OPEN % '"mf"')); await pg2.evaluate("document.querySelector('#ui22McRewards').scrollIntoView()"); await pg2.wait_for_timeout(300)
            tops = await pg2.evaluate("[...document.querySelectorAll('#ui22McRewards .ui22-rwt')].map(t=> Math.round(t.getBoundingClientRect().top))")
            ok(len(tops) >= 4 and len(set(tops)) < len(tops), f'3. {w}px: Skirmish rewards tiles share rows (one grid) {tops}')
            await pg2.screenshot(path=os.path.join(OUT, f'rewards-{w}.png'))
            await pg2.evaluate(E(u.OPEN % '"mo"')); await pg2.wait_for_timeout(300)
            await pg2.screenshot(path=os.path.join(OUT, f'sidemap-{w}.png'))
        ok(not errs, 'no page errors ' + str(errs[:2]))
        await b.close()
    print('FAIL' if u.fails else 'PASS', len(u.fails))
    sys.exit(1 if u.fails else 0)
asyncio.run(main())
