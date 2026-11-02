#!/usr/bin/env python3
"""Package UI15 (2026-11-02, owner notes 22:15 #3 #4 #8 #11 #14): browser checks and before / after shots in docs/screens/ui15/.
    python3 tests/e2e/ui15_2026_11_02.py [--page index.html] [--root DIR] [--tag after|before] [--width 1366,390] [--only deck,detail,board]
    --root serves another build (the "before" shots come from a build of the branch before the package: --root <dir> --tag before; its checks are expected to fail).
deck    #3  the xN count pips of Your Loadout sit 4 px closer to their card.
        #4  the card hover lifts 4.5 px (was 3) over 0.2 s; the gem-socket diamond is hidden until Map 45 (Admin mode previews it).
detail  #8  Devilry's Ritual diagram is centred on the box and its corner numbers can be read; the Devilry page is darker, Ecclesia's a whiter fabric.
board   #11 the rarity frame glow sits under the Wait clock (board and hand).
        #14 the Shell armor pips are centred on the card.
Build first. Exits 1 on a failed check."""
import argparse, asyncio, os, sys, functools, http.server, socketserver, threading
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vis5_2026_10_28 as W
from playwright.async_api import async_playwright
V = W.V
ROOT = V.ROOT
SHOTS = os.path.join(ROOT, 'docs', 'screens', 'ui15'); os.makedirs(SHOTS, exist_ok=True)
fails = []; TAG = ['after']
def ok(c, m):
    print(('  ok  ' if c else '  FAIL ') + m, flush=True)
    if not c: fails.append(m)
async def done(pg):
    ok(not pg._errs, f'no page errors {pg._errs[:2]}'); await pg._ctx.close()
def shot(name, w): return os.path.join(SHOTS, f'{name}-{TAG[0]}-{w}.png')
NOTOAST = '.toast, .toast-host, #toastHost{display:none !important;}'

# ---------------------------------------------------------------- deck editor: pips, hover, sockets
async def deck(b, url, w):
    print(f'-- deck editor: xN pips, hover lift, sockets ({w})')
    pg = await W.fresh(b, url, w)
    await pg.add_style_tag(content=NOTOAST)
    await pg.evaluate("""(async()=>{ ['blue-dragon','black-dragon'].forEach(id=>{ try{ unlockCardForPlayer(id, 'test'); }catch(e){} try{ myDeckCounts[id] = (myDeckCounts[id] || 0) + 1; }catch(e){} }); try{ saveMyDeck(); }catch(e){}
      deckOpenBuilderOnce = true; deckShowList = false; deckEditingId = null; switchTab('deck'); await new Promise(r=> setTimeout(r, 1500)); try{ renderMyDeckPanels(); }catch(e){} await new Promise(r=> setTimeout(r, 500)); document.getElementById('myDeckList').scrollIntoView({block: 'center'}); })()""")
    await pg.wait_for_timeout(600)
    g = await pg.evaluate("""(()=>{ const st = [...document.querySelectorAll('#myDeckList .deck-stack')]; const o = [];
      st.slice(0, 8).forEach(s=>{ const t = s.querySelector('.card-tile'), c = s.querySelector('.ps-count'); if(!t || !c) return; const tr = t.getBoundingClientRect(), cr = c.getBoundingClientRect();
        o.push({id: s.dataset.defid, right: +(cr.right - tr.right).toFixed(1), bottom: +(cr.bottom - tr.bottom).toFixed(1)}); }); return o; })()""")
    ok(len(g) > 0, f'the loadout shows stacks {len(g)}')
    ok(all(0 <= x['right'] <= 8 and 0 <= x['bottom'] <= 7 for x in g), f'the xN pip overhangs its card by at most 8 / 7 px (was 11 / 10 at phone widths) {g[:2]}')
    # hover: the first stack lifts 4.5 px over 0.2 s
    el = await pg.query_selector('#myDeckList .deck-stack'); await el.scroll_into_view_if_needed(); bb = await el.bounding_box()
    await pg.screenshot(path=shot('deck-editor', w), clip={'x': max(0, bb['x'] - 20), 'y': max(0, bb['y'] - 20), 'width': min(w - max(0, bb['x'] - 20), 560), 'height': bb['height'] + 50})
    if w > 700:
        tr0 = await pg.evaluate("(()=>{ const t = document.querySelector('#myDeckList .deck-stack .card-tile'); return {tr: getComputedStyle(t).transitionDuration, y: t.getBoundingClientRect().top}; })()")
        await pg.mouse.move(bb['x'] + bb['width'] / 2, bb['y'] + bb['height'] / 2); await pg.wait_for_timeout(120)
        mid = await pg.evaluate("document.querySelector('#myDeckList .deck-stack .card-tile').getBoundingClientRect().top")
        for _ in range(30):  # a loaded headless browser can be slow to start the transition
            await pg.wait_for_timeout(150)
            if await pg.evaluate("document.querySelector('#myDeckList .deck-stack .card-tile').getBoundingClientRect().top") < tr0['y'] - 4.4: break
        r = await pg.evaluate("(()=>{ const t = document.querySelector('#myDeckList .deck-stack .card-tile'); return {tf: getComputedStyle(t).transform, y: t.getBoundingClientRect().top}; })()")
        lift = tr0['y'] - r['y']
        ok(tr0['tr'] == '0.2s', f'the lift eases over 0.2 s ({tr0["tr"]})')
        ok(abs(lift - 4.5) < 0.6, f'the hover lift is 4.5 px ({lift:.2f})')
        print(f'      (a sample 120 ms after the pointer arrived: {tr0["y"]:.2f} -> {mid:.2f} -> {r["y"]:.2f})')
        await pg.mouse.move(2, 2)
    # sockets: hidden before Map 45, shown from Map 45, and in Admin mode
    s = await pg.evaluate("""(()=>{ const d = getCardDefs()['blue-dragon']; const n = ()=> (cardTileHTML(d, {inPlay: true}).match(/class="h1-slot/g) || []).length; const o = {slots: (typeof socketSlotsOf === 'function' ? socketSlotsOf(d) : -1)};
      adminModeEnabled = false; o.at0 = n(); o.far0 = furthestMapReached();
      const st = skillRevealState(); st.maxMap = 44; skillRevealSave(st); o.at44 = n();
      st.maxMap = 45; skillRevealSave(st); o.at45 = n();
      st.maxMap = 0; skillRevealSave(st); adminModeEnabled = true; o.admin = n(); adminModeEnabled = false; return o; })()""")
    ok(s['slots'] > 0, f'the dragon has a socket to hide {s["slots"]}')
    ok(s['at0'] == 0 and s['at44'] == 0, f'no diamond before Map 45 {s}')
    ok(s['at45'] > 0, f'the diamond shows from Map 45 {s["at45"]}')
    ok(s['admin'] > 0 or s['far0'] is None, f'Admin mode previews it ({s["admin"]})')
    await done(pg)

# ---------------------------------------------------------------- card detail: ritual, group tones
LUM = "const lum = c=>{ const m = c.match(/[\\d.]+/g).map(Number); const f = v=>{ v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(m[0]) + .7152 * f(m[1]) + .0722 * f(m[2]); }; const ratio = (a, b)=>{ const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };"
async def detail(b, url, w):
    print(f'-- card detail: Devilry Ritual, group tones ({w})')
    pg = await W.fresh(b, url, w)
    await pg.add_style_tag(content=NOTOAST)
    r = await pg.evaluate("(async()=>{ " + LUM + """ openCardDetail('the-sixfold'); await new Promise(r=> setTimeout(r, 800)); const box = document.querySelector('#cardDetailOverlay .mech-wrap.mech-devilry'); if(!box) return null;
      box.scrollIntoView({block: 'center'}); await new Promise(r=> setTimeout(r, 250)); const s = box.querySelector('.ritual-shape'), br = box.getBoundingClientRect(), sr = s.getBoundingClientRect(), li = s.closest('li').getBoundingClientRect();
      const pt = s.querySelector('.rs-pt'), b = pt.querySelector('b'); const card = document.querySelector('#cardDetailOverlay .card-detail-card');
      return {offBox: +((sr.left + sr.width / 2) - (br.left + br.width / 2)).toFixed(1), offLi: +((sr.left + sr.width / 2) - (li.left + li.width / 2)).toFixed(1), ratio: ratio(getComputedStyle(b).color, getComputedStyle(pt).backgroundColor), txt: b.textContent,
        cls: card.className, bg: getComputedStyle(card).backgroundImage.slice(0, 160), pad: getComputedStyle(s.closest('li')).paddingLeft}; })()""")
    ok(r is not None, 'the Sixfold has its Devilry box')
    ok(abs(r['offBox']) <= 3, f'the diagram is centred on the box (off by {r["offBox"]} px; on its own line {r["offLi"]})')
    ok(r['ratio'] >= 4.5 and r['txt'].strip() != '', f'the corner numbers read: "{r["txt"]}" contrast {r["ratio"]:.1f}')
    ok('cd-grp-devilry' in r['cls'] and 'rgba(20, 6, 14' in r['bg'], f'the Devilry page is toned darker {r["cls"].split()[-1]} / {r["bg"][:70]}')
    bb = await (await pg.query_selector('#cardDetailOverlay .card-detail-card')).bounding_box()
    await pg.screenshot(path=shot('detail-devilry', w), clip={'x': max(0, bb['x']), 'y': max(0, bb['y']), 'width': min(w, bb['width']), 'height': min(900 if w > 700 else 844, bb['height'])})
    el = await pg.query_selector('#cardDetailOverlay .mech-wrap.mech-devilry'); await el.scroll_into_view_if_needed(); bx = await el.bounding_box()
    await pg.screenshot(path=shot('detail-ritual', w), clip={'x': max(0, bx['x'] - 10), 'y': max(0, bx['y'] - 10), 'width': min(w - max(0, bx['x'] - 10), bx['width'] + 20), 'height': bx['height'] + 20})
    g = await pg.evaluate("(async()=>{ openCardDetail('shrine-acolyte'); await new Promise(r=> setTimeout(r, 800)); const card = document.querySelector('#cardDetailOverlay .card-detail-card'); return {cls: card.className, bg: getComputedStyle(card).backgroundImage.slice(0, 200)}; })()")
    ok('cd-grp-grace' in g['cls'] and 'repeating-linear-gradient' in g['bg'], f'the Ecclesia page is a whiter fabric {g["cls"].split()[-1]} / {g["bg"][:70]}')
    bb = await (await pg.query_selector('#cardDetailOverlay .card-detail-card')).bounding_box()
    await pg.screenshot(path=shot('detail-grace', w), clip={'x': max(0, bb['x']), 'y': max(0, bb['y']), 'width': min(w, bb['width']), 'height': min(900 if w > 700 else 844, bb['height'])})
    p = await pg.evaluate("(async()=>{ openCardDetail('blue-dragon'); await new Promise(r=> setTimeout(r, 800)); const card = document.querySelector('#cardDetailOverlay .card-detail-card'); return card.className; })()")
    ok('cd-grp' not in p, f'a plain card keeps the plain page ({p})')
    await done(pg)

# ---------------------------------------------------------------- board: Wait clock over the frame glow, shell pips centred
async def board(b, url, w):
    print(f'-- board: frame under the Wait clock, shell pips ({w})')
    pg = await W.fresh(b, url, w)
    u = await pg.evaluate(V.BOARD + "([['blue-dragon', 0, 19, {wait: 3}], ['stalactite-golem', -1, 21, {shellUntil: 99, shellArmor: 4, tempHp: 4}]], [['otter-kit', 0, 5]])")
    await pg.add_style_tag(content=NOTOAST)
    await pg.evaluate("(()=>{ try{ renderMatchUI(); }catch(e){} })()"); await pg.wait_for_timeout(900)
    r = await pg.evaluate("""(([d, s])=>{ const dr = boardCardEl(d), t = dr.querySelector('.card-tile'), wb = t.querySelector('.waitbadge'), fx = t.querySelector('.cframe-fx');
      const zw = +getComputedStyle(wb).zIndex, zf = +getComputedStyle(fx, '::after').zIndex, zb = +getComputedStyle(t, '::before').zIndex;
      const sc = boardCardEl(s), up = sc.querySelector('.shell-up'); let off = null; if(up){ const ur = up.getBoundingClientRect(), cr = sc.querySelector('.card-tile').getBoundingClientRect(); off = +((ur.left + ur.width / 2) - (cr.left + cr.width / 2)).toFixed(1); }
      const wr = wb.getBoundingClientRect(), top = document.elementFromPoint(wr.left + wr.width / 2, wr.top + wr.height / 2);
      return {zw, zf, zb, off, hasUp: !!up, topIsClock: !!(top && top.closest('.waitbadge'))}; })""", [u['1:0'], u['1:-1']])
    ok(r['zw'] > r['zf'] and r['zw'] > r['zb'], f'the Wait clock (z {r["zw"]}) is above the frame glow (z {r["zf"]} / {r["zb"]})')
    ok(r['topIsClock'], 'the clock is what sits on top at its own centre')
    ok(r['hasUp'] and r['off'] is not None and abs(r['off']) <= 2, f'the shell pips are centred on the card (off by {r["off"]} px)')
    el = await pg.query_selector(f'[data-uid="{u["1:0"]}"]'); bb = await el.bounding_box()
    await pg.screenshot(path=shot('board-frame-wait', w), clip={'x': max(0, bb['x'] - 30), 'y': max(0, bb['y'] - 24), 'width': min(w - max(0, bb['x'] - 30), bb['width'] * 2.4 + 60), 'height': bb['height'] + 60})
    # in hand: the same card tile
    h = await pg.evaluate("""(()=>{ const t = document.createElement('div'); t.innerHTML = cardTileHTML(getCardDefs()['blue-dragon'], {inPlay: true}); t.style.cssText = 'position:fixed; left:12px; top:12px; width:110px; z-index:99999'; document.body.appendChild(t);
      const tile = t.querySelector('.card-tile'), wb = tile.querySelector('.waitbadge'); const o = wb ? {zw: +getComputedStyle(wb).zIndex, zf: +getComputedStyle(tile.querySelector('.cframe-fx'), '::after').zIndex} : null; t.remove(); return o; })()""")
    ok(h is not None and h['zw'] > h['zf'], f'a hand / catalogue tile has the clock above the frame too {h}')
    await done(pg)

PARTS = {'deck': deck, 'detail': detail, 'board': board}

def serve_dir(d):
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    httpd = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=d))
    threading.Thread(target=httpd.serve_forever, daemon=True).start(); return httpd

async def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--page', default='index.html'); ap.add_argument('--root', default=''); ap.add_argument('--tag', default='after')
    ap.add_argument('--width', default='1366,390'); ap.add_argument('--only', default='')
    a = ap.parse_args(); TAG[0] = a.tag
    httpd = serve_dir(a.root) if a.root else V.serve(); url = f'http://127.0.0.1:{httpd.server_address[1]}/{a.page}'
    parts = [p for p in a.only.split(',') if p] or list(PARTS)
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=V.CHROME)
        for w in [int(x) for x in a.width.split(',')]:
            for k in parts:
                try: await PARTS[k](b, url, w)
                except Exception as e: ok(False, f'{k} at {w} raised {str(e)[:300]}')
        await b.close()
    print('\nFAILED: %d' % len(fails) if fails else '\nall checks passed'); sys.exit(1 if fails else 0)
asyncio.run(main())
