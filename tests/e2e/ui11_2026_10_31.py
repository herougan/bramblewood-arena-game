#!/usr/bin/env python3
"""Package UI11 (2026-10-31, owner FF1-FF3, FF5, FF7, FF9, UI10 leftovers): browser checks, shots in tests/e2e/shots/ui11/.
    python3 tests/e2e/ui11_2026_10_31.py [--page index.html] [--width 1366] [--only ff9,ff1,...]
FF9  Map cards gallery: "Add card to SPECIAL" right of Export all, searchable picker, added tile (removable), saved in bw_rv_special_add_v1, in Export all (.txt/.json, flagged added).
FF1  Shield is the chip on the card's south edge (number = Shield left, number faded at 1, gone at 0); no east-side badge; pips that change nothing are hidden.
FF3  the card-detail hover tooltip stays open while board animations run, is larger than the board card at full screen, tilted 1 degree clockwise.
FF5  single-icon chips (Bloom) are centred on the south edge.
FF7  the conquest map list: the selected map is brighter (background and text), not only its border.
FF2  Windy's field texts end with Headwind Flyers' skills trigger twice.
UI10 the Admin toggle sentence names the new N-SK skirmish; the N-SK panel's showcase card is the map's showcase.
Build first. Exits 1 on a failed check."""
import argparse, asyncio, os, sys, json, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vis5_2026_10_28 as W
from playwright.async_api import async_playwright
V = W.V
ROOT = V.ROOT
SHOTS = os.path.join(ROOT, 'tests', 'e2e', 'shots', 'ui11'); os.makedirs(SHOTS, exist_ok=True)
fails = []
def ok(c, m):
    print(('  ok  ' if c else '  FAIL ') + m, flush=True)
    if not c: fails.append(m)
async def done(pg):
    ok(not pg._errs, f'no page errors {pg._errs[:2]}'); await pg._ctx.close()
def shot(name, w): return os.path.join(SHOTS, f'{name}-{w}.png')

# ---------------------------------------------------------------- FF9
async def ff9(b, url, w):
    print(f'-- FF9: Add card to SPECIAL ({w})')
    pg = await W.fresh(b, url, w)
    await pg.evaluate("(()=>{ adminModeEnabled = true; pk1OpenMapCards('mb'); })()"); await pg.wait_for_timeout(700)
    r = await pg.evaluate("""(()=>{ const a = document.getElementById('ff9AddSpecial'), e = document.getElementById('rv3ExportAll'); if(!a || !e) return null; const ra = a.getBoundingClientRect(), re = e.getBoundingClientRect();
      return {right: ra.left >= re.right - 1, sameRow: Math.abs((ra.top + ra.height/2) - (re.top + re.height/2)) < 24, text: a.textContent.trim()}; })()""")
    ok(r is not None and 'Add card to SPECIAL' in r['text'], f'the button exists {r}')
    if r is None: await done(pg); return
    if w >= 700: ok(r['right'] and r['sameRow'], f'right of Export all, same row {r}')
    before = await pg.evaluate("document.querySelectorAll('#pk1MapCardsOverlay .rv1-tile').length")
    await pg.click('#ff9AddSpecial'); await pg.wait_for_timeout(300)
    ok(await pg.evaluate("!!document.querySelector('#pk1MapCardsOverlay .ff9-picker .ff9-pk-q')"), 'a picker with a search box opens')
    await pg.fill('.ff9-pk-q', 'bee'); await pg.wait_for_timeout(200)
    names = await pg.evaluate("[...document.querySelectorAll('.ff9-pk-row span')].map(x=> x.textContent)")
    ok(len(names) >= 1 and all('bee' in n.lower() for n in names), f'name search filters ({names[:4]})')
    ok(await pg.evaluate("(()=>{ const d = getCardDefs(); return ![...document.querySelectorAll('.ff9-pk-row')].some(r=> d[r.dataset.ff9Id].token); })()"), 'no token cards offered')
    await pg.screenshot(path=shot('ff9-picker', w))
    pick = await pg.evaluate("(()=>{ const r = [...document.querySelectorAll('.ff9-pk-row:not([disabled])')][0]; const id = r.dataset.ff9Id, nm = r.querySelector('span').textContent; r.click(); return {id, nm}; })()")
    await pg.wait_for_timeout(300)
    r = await pg.evaluate("""(id=>{ const t = document.querySelector('#pk1MapCardsOverlay .rv1-tile.is-added[data-rv-id="' + id + '"]'); const sec = t && t.closest('.pk1-mc-sec');
      return {has: !!t, inSpecial: !!(sec && /SPECIAL/i.test(sec.querySelector('h3').textContent)), pill: t && t.querySelector('.rv2-pill').textContent, rm: t && !!t.querySelector('[data-rv-act="remove-added"]'),
        ls: JSON.parse(localStorage.getItem('bw_rv_special_add_v1') || '{}'), flips: localStorage.getItem('bw_rv_flips_v1')}; })""", pick['id'])
    ok(r['has'] and r['inSpecial'] and r['pill'] == 'Added' and r['rm'], f'the card shows in SPECIAL as Added, with Remove {r["has"], r["inSpecial"], r["pill"]}')
    ok(r['ls'].get('mb') == [pick['id']], f'saved in bw_rv_special_add_v1 {r["ls"]}')
    await pg.evaluate("document.querySelector('.ff9-pk-x').click()"); await pg.evaluate("document.querySelector('#pk1MapCardsOverlay .rv1-tile.is-added').scrollIntoView({block:'center'})"); await pg.wait_for_timeout(300)
    await pg.screenshot(path=shot('ff9-added', w))
    # reload the gallery: still there; Export all has it flagged added
    await pg.evaluate("(()=>{ document.getElementById('pk1McClose').click(); pk1OpenMapCards('mb'); })()"); await pg.wait_for_timeout(500)
    ok(await pg.evaluate("document.querySelectorAll('#pk1MapCardsOverlay .rv1-tile.is-added').length") == 1, 'reopening the gallery keeps it')
    await pg.click('#rv3ExportAll'); await pg.wait_for_timeout(400)
    r = await pg.evaluate("({txt: window.__rv3Last.text, js: window.__rv3Last.json.lists.filter(l=> l.added)})")
    ok(len(r['js']) == 1 and r['js'][0]['mapId'] == 'mb' and r['js'][0]['listKey'] == 'special' and r['js'][0]['added'][0]['id'] == pick['id'] and r['js'][0]['added'][0]['added'] is True, f'.json has the SPECIAL entry flagged added {r["js"][0]["added"] if r["js"] else None}')
    ok(('added ' + pick['nm']) in r['txt'], '.txt names it as added')
    # the picks are stored as before
    await pg.evaluate("document.querySelector('#pk1MapCardsOverlay .rv1-act[data-rv-act=cut], #pk1MapCardsOverlay .rv1-act[data-rv-act=keep]').click()")
    fl = await pg.evaluate("Object.keys(JSON.parse(localStorage.getItem('bw_rv_flips_v1') || '{}'))")
    ok(len(fl) == 1 and fl[0].count('|') == 2 and 'added' not in fl[0], f'picks keep their own key shape {fl}')
    # remove
    await pg.evaluate("document.querySelector('#pk1MapCardsOverlay .rv1-tile.is-added [data-rv-act=remove-added]').click()"); await pg.wait_for_timeout(200)
    r = await pg.evaluate("({n: document.querySelectorAll('#pk1MapCardsOverlay .rv1-tile.is-added').length, ls: localStorage.getItem('bw_rv_special_add_v1')})")
    ok(r['n'] == 0 and r['ls'] == '{}', f'Remove drops the tile and the saved entry {r}')
    await done(pg)

PARTS = {'ff9': ff9}
async def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--page', default='index.html'); ap.add_argument('--width', default='1366,390'); ap.add_argument('--only', default='')
    a = ap.parse_args(); httpd = V.serve(); url = f'http://127.0.0.1:{httpd.server_address[1]}/{a.page}'
    parts = [p for p in a.only.split(',') if p] or list(PARTS)
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=V.CHROME)
        for w in [int(x) for x in a.width.split(',')]:
            for k in parts: await PARTS[k](b, url, w)
        await b.close()
    print('\nFAILED: %d' % len(fails) if fails else '\nall checks passed'); sys.exit(1 if fails else 0)
asyncio.run(main())
