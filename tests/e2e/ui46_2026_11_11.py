#!/usr/bin/env python3
"""UI46 (2026-11-11, owner 00:06) browser check at 1366 and 390 px on the built index.html.
  1. Pack opening: the admin's pencil never sits on the "xN" copy badge. Every summary state (one card, a grid of several, a shiny / legendary
     with a bonus copy, Open all, the all-packs page) is measured: the pencil and the badge do not overlap, nothing covers either of them
     (elementFromPoint at five points of the pencil and at the badge's centre), the pencil stays on screen, and a real click on it opens the editor.
     The one-at-a-time reveal has no pencil, so its copy badge is free.
  2. Wandering merchant: buy his deal, click him again: his menu opens every time (speech plays too), the sold deal is dimmed with "Bought today",
     the Mystery Boosters (5 a visit) stay buyable until the last, then read "Sold out" and the button says "Bye".
  3. Codex: the admin's Create card is in the row of tabs, right-aligned beside Deck, on the same line; icon only at phone width; the row and the page
     do not scroll sideways; players do not see it; it opens the editor.
    python3 tests/e2e/ui46_2026_11_11.py [--widths 1366,390]      (build first; needs Playwright)     Screenshots: docs/screens/ui46/"""
import argparse, asyncio, os, sys, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vis3_2026_10_26 as V
from playwright.async_api import async_playwright
ROOT = V.ROOT
OUT = os.path.join(ROOT, 'docs', 'screens', 'ui46'); os.makedirs(OUT, exist_ok=True)
fails = []
def ok(c, m):
    print(('  ok  ' if c else '  FAIL ') + m, flush=True)
    if not c: fails.append(m)
NOTOAST = '.toast, .toast-host, #toastHost, .xp-float, #signInBanner{display:none !important;} #atmoTint, #atmoCanvas{display:none !important;}'

# ---- 1. pack opening -------------------------------------------------------------------------------------------------------------------------------
MEASURE = """(()=>{ const ov = document.getElementById('packOpenOverlay'); const R = e=>{ const b = e.getBoundingClientRect(); return {l:b.left, t:b.top, r:b.right, b:b.bottom, w:b.width, h:b.height}; };
  const hit = (a, b)=> a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t, on = (e, el)=> e === el || el.contains(e);
  const cards = [...ov.querySelectorAll('.po2-sum-card')], bad = [], boxes = []; let withX = 0, pens = 0;
  cards.forEach(c=>{ const id = c.dataset.poview, pen = c.querySelector('.po-ed-edit'), x = c.querySelector('.po2-x');
    if(!pen){ bad.push(id + ': no pencil (admin)'); return; } pens++; const pr = R(pen); boxes.push([pen, 'pencil ' + id]);
    if(pr.l < 0 || pr.t < 0 || pr.r > innerWidth || pr.b > innerHeight) bad.push(id + ': pencil off screen ' + JSON.stringify(pr));
    if(![[.5,.5],[.25,.25],[.75,.25],[.25,.75],[.75,.75]]  /* the pencil is a circle: inset points */.every(([fx, fy])=> on(document.elementFromPoint(pr.l + pr.w*fx, pr.t + pr.h*fy), pen))) bad.push(id + ': pencil is covered');
    if(x){ withX++; const xr = R(x); boxes.push([x, 'badge ' + id]); if(hit(pr, xr)) bad.push(id + ': pencil overlaps the copy badge');
      if(!on(document.elementFromPoint(xr.l + xr.w/2, xr.t + xr.h/2), x)) bad.push(id + ': copy badge is covered'); if(xr.l < 0 || xr.r > innerWidth) bad.push(id + ': badge off screen'); } });
  ov.querySelectorAll('.po2-new-tag').forEach(n=> boxes.push([n, 'tag'])); // across cards: a pencil never sits on any card's pencil, copy badge or NEW! tag (a tag touching a badge is older, and the badge paints over it)
  for(let i = 0; i < boxes.length; i++) for(let j = i + 1; j < boxes.length; j++){ const [a, an] = boxes[i], [b, bn] = boxes[j]; if(!an.startsWith('pencil') && !bn.startsWith('pencil')) continue;
    if(hit(R(a), R(b))) bad.push(an + ' overlaps ' + bn); }
  return {cards: cards.length, pens, withX, bad}; })()"""
RESULTS = {
    'single': [{'id': 'sand-widow', 'bonusCopy': True}],
    'grid': [{'id': 'sand-widow', 'bonusCopy': True}, {'id': 'bee-knight'}, {'id': 'yeti', 'isNew': True, 'seenNew': True}, {'id': 'otter-centurion', 'bonusCopy': True}],
    'legendary': [{'id': 'blue-dragon', 'foil': True, 'finish': 'foil', 'shiny': True, 'bonusCopy': True}, {'id': 'old-willow-of-the-ford', 'isNew': True, 'seenNew': True, 'bonusCopy': True}, {'id': 'sand-widow', 'bonusCopy': True}],
}
OPEN_PACKS = """(async([res, mode])=>{ const p = getShopPacks().find(x=> x.id === 'bronze');
  const mk = ()=> ({results: res.map(r=> Object.assign({isNew:false, seenNew:false, foil:false, shiny:false}, r)), leveledId: null, glow: null});
  const prior = mode === 'session' ? [{pack: p, opened: [mk()]}] : undefined;
  openPackAnimation(p, [mk(), mk()], {bundle: 2, priorOpened: prior}); await new Promise(z=> setTimeout(z, 900));
  const btn = document.getElementById(mode === 'single' ? 'poSkip' : mode === 'grid' ? 'poSkip' : 'poOpenAll'); if(btn) btn.click(); await new Promise(z=> setTimeout(z, 900));
  if(mode === 'session'){ const s = document.getElementById('poSession'); if(s) s.click(); }
  await new Promise(z=> setTimeout(z, 1800)); return !!document.querySelector('#packOpenOverlay .po2-sum-card'); })"""
CLOSE_PO = "(()=>{ try{ if(packOpenStop) packOpenStop(); }catch(e){} const ov = document.getElementById('packOpenOverlay'); if(ov){ ov.hidden = true; ov.innerHTML = ''; } document.documentElement.classList.remove('po2-open'); })()"

async def settle(pg):  # the summary's cards pop in and ripple (GSAP), the NEW! / GET! tags drop in (CSS): wait until every card has stopped moving and the finite CSS animations are done
    await pg.mouse.move(2, 2)  # a pointer left over a card would lean it (wireTilt)
    await pg.evaluate("(async()=>{ const ov = document.getElementById('packOpenOverlay'); await Promise.race([Promise.all(document.getAnimations().filter(a=> a.effect && a.effect.target && ov.contains(a.effect.target) && a.effect.getComputedTiming().iterations !== Infinity).map(a=> a.finished.catch(()=> 0))), new Promise(r=> setTimeout(r, 5000))]); })()")
    # every card back to its own place and size (a busy machine starts the pop-in late: two equal samples of a card still at scale 0.3 do not count)
    flat = "[...document.querySelectorAll('#packOpenOverlay .po2-sum-card')].every(c=>{ const m = new DOMMatrix(getComputedStyle(c).transform); return Math.abs(m.a - 1) < .005 && Math.abs(m.d - 1) < .005 && Math.abs(m.b) < .005 && Math.abs(m.c) < .005 && Math.abs(m.e) < .5 && Math.abs(m.f) < .5; })"
    still = 0
    for _ in range(80):
        still = still + 1 if await pg.evaluate(flat) else 0
        if still >= 3: return
        await pg.wait_for_timeout(300)

async def pack_checks(pg, w):
    print(f'-- pack opening, width {w}', flush=True)
    await pg.evaluate("adminModeEnabled = true; window.__ed = []; window.edOpenCardEditor = (id)=> { window.__ed.push(id); }; 0")  # (ends in 0: a string that evaluates to a function is called by Playwright)
    states = [('single', 'single', 'single'), ('grid', 'grid', 'grid'), ('legendary', 'grid', 'shiny / legendary'), ('all', 'all', 'Open all'), ('session', 'session', 'all packs')]
    for name, mode, label in states:
        key = 'grid' if name in ('all', 'session') else name
        res = RESULTS['legendary' if name in ('all', 'session') else key]
        if name in ('all', 'session'): res = RESULTS['legendary'] + RESULTS['grid']
        shown = await pg.evaluate(OPEN_PACKS + "(%s)" % json.dumps([res, mode]))
        ok(shown, f'{label}: the summary is drawn')
        await settle(pg)
        r = await pg.evaluate(MEASURE)
        ok(r['cards'] > 0 and r['pens'] == r['cards'] and r['withX'] > 0, f"{label}: {r['cards']} cards, each with a pencil; {r['withX']} with a copy badge")
        ok(not r['bad'], f"{label}: pencil and copy badge never overlap, neither is covered or off screen {r['bad'][:4]}")
        if name in ('single', 'legendary', 'all'):
            where = "(()=>{ const x = document.querySelector('#packOpenOverlay .po2-x'); const card = x.closest('.po2-sum-card'); const pen = card.querySelector('.po-ed-edit'); const b = pen.getBoundingClientRect(); return {id: card.dataset.poview, x: b.left + b.width/2, y: b.top + b.height/2}; })()"
            c = await pg.evaluate(where); await pg.mouse.move(c['x'], c['y']); await pg.wait_for_timeout(300)  # hovering leans the card (wireTilt): aim again from the leaned card
            c = await pg.evaluate(where)
            under = await pg.evaluate("([x, y])=>{ const e = document.elementFromPoint(x, y); return e && (e.className || e.tagName); }", [c['x'], c['y']])
            await pg.mouse.click(c['x'], c['y']); await pg.wait_for_timeout(250)
            got = await pg.evaluate("window.__ed.splice(0)")
            ok(got == [c['id']], f"{label}: a real click on the pencil opens the editor for {c['id']} {got} (under the pointer: {under})")
        if name in ('single', 'legendary', 'all'):
            g = await (await pg.query_selector('#packOpenOverlay .po2-sum-grid')).bounding_box()  # the haul, a little air round it
            x0, y0 = max(0, g['x'] - 40), max(0, g['y'] - 40)
            await pg.screenshot(path=os.path.join(OUT, f'pack-{name}-{w}.png'), animations='disabled', clip={'x': x0, 'y': y0, 'width': min(w - x0, g['width'] + 80), 'height': g['height'] + 80})
        await pg.evaluate(CLOSE_PO); await pg.wait_for_timeout(200)
    # the one-at-a-time reveal: a stack badge ("x3") is shown and no pencil competes for the card's corner
    await pg.evaluate("""(async()=>{ const p = getShopPacks().find(x=> x.id === 'bronze'); const o = {results: [{id:'sand-widow', count:3, isNew:false, seenNew:false, foil:false, shiny:false}, {id:'bee-knight', isNew:false, seenNew:false, foil:false, shiny:false}], leveledId:null, glow:null};
      openPackAnimation(p, [o], {}); await new Promise(z=> setTimeout(z, 900)); const s = document.getElementById('poStrip'); if(s) s.click(); await new Promise(z=> setTimeout(z, 2600));
      const c = document.querySelector('#packOpenOverlay .po2-card.is-current'); if(c) c.click(); await new Promise(z=> setTimeout(z, 1800)); })()""")
    r = await pg.evaluate("""(()=>{ const ov = document.getElementById('packOpenOverlay'); const n = ov.querySelector('.po2-stackn'); const b = n && n.getBoundingClientRect();
      return {badge: !!n, text: n && n.textContent, shown: !!(b && b.width > 4 && b.right <= innerWidth && b.left >= 0), pencils: ov.querySelectorAll('.po2-deck [data-po-edit], .po2-card [data-po-edit]').length}; })()""")
    ok(r['badge'] and r['shown'] and r['pencils'] == 0, f'reveal: the "{r["text"]}" stack badge is on screen and the reveal has no pencil {r}')
    await pg.evaluate(CLOSE_PO)

# ---- 2. wandering merchant -------------------------------------------------------------------------------------------------------------------------
SETUP_SHOP = ("myCurrencies.gold = 99999; myCurrencies.gems = 9999; saveCurrencies(); window.isSignedIn = ()=> true; cloudUserId = 'me-test'; cloudIsAnonymous = false;"
              " try{ unlockFeature('wanderer'); }catch(e){} saveTutorial2Done();")
MENU = """(()=>{ const ov = document.getElementById('npcPromptOverlay'); if(!ov || ov.hidden) return null; const d = ov.querySelector('.wander-deal'); if(!d) return {open: true, plain: ov.textContent.trim()};
  const R = e=>{ const b = e.getBoundingClientRect(); return {l: b.left, t: b.top, r: b.right, b: b.bottom}; }, dr = R(d);
  return {open: true, speech: d.querySelector('p').textContent, fits: dr.l >= 0 && dr.r <= innerWidth && dr.t >= 0 && dr.b <= innerHeight,
    rows: [...d.querySelectorAll('.wd-offer')].map(o=>{ const b = o.querySelector('button'); return {sold: o.classList.contains('is-sold'), name: o.querySelector('.wd-pack').textContent.trim(), btn: b ? b.textContent.trim() : '', disabled: !b || b.disabled || b.getAttribute('aria-disabled') === 'true'}; }),
    close: (d.querySelector('[data-wd-close]') || {textContent: ''}).textContent.trim()}; })()"""
async def click_merchant(pg):
    try: await pg.wait_for_function("!npcDialogueActive()", timeout=15000)  # (an NPC talking holds every map tile, as for the player)
    except Exception: pass
    await pg.click('#mapWanderer', force=True)  # force: it bobs, so Playwright never sees it as stable
    try: await pg.wait_for_function("(()=>{ const o = document.getElementById('npcPromptOverlay'); return !!(o && !o.hidden && o.querySelector('.npc-prompt')); })()", timeout=8000)  # the first visit's speech comes first (1.1 s)
    except Exception: pass
    await pg.wait_for_timeout(500)
    return await pg.evaluate(MENU)
async def buy_row(pg, i):
    await pg.click(f'#npcPromptOverlay [data-wd-buy="{i}"]'); await pg.wait_for_timeout(1200)
    await pg.evaluate(CLOSE_PO); await pg.wait_for_timeout(300)

async def merchant_checks(pg, w):
    print(f'-- wandering merchant, width {w}', flush=True)
    await pg.evaluate("(()=>{ " + SETUP_SHOP + " })()")
    info = await pg.evaluate("(()=>{ const m = wanderingMerchantToday(); return m ? {map: m.mapId, name: m.name} : null; })()")
    ok(bool(info), f'a wandering merchant is out today ({info})')
    await pg.evaluate("(async()=>{ playSubTab = 'conquest'; conquestSelectedMap = wanderingMerchantToday().mapId; conquestSelectedNodeKey = null; switchTab('play'); await new Promise(r=> setTimeout(r, 1500)); })()")
    ok(await pg.evaluate("!!document.getElementById('mapWanderer')"), 'the merchant stands on his map')
    await pg.evaluate("(()=>{ const s = JSON.parse(localStorage.getItem(WANDERER_KEY) || '{}'); delete s.found; delete s.bought; delete s.mystery; localStorage.setItem(WANDERER_KEY, JSON.stringify(s)); })()")
    m = await click_merchant(pg)
    ok(m and m.get('rows') and len(m['rows']) == 2 and not any(r['sold'] for r in m['rows']), f'first visit: the menu lists the deal and the Mystery Boosters, none sold {m and m.get("rows")}')
    ok(bool(m and m.get('fits')), 'the menu fits the screen')
    await (await pg.query_selector('#npcPromptOverlay .npc-prompt')).screenshot(path=os.path.join(OUT, f'merchant-first-{w}.png'), animations='disabled')
    await buy_row(pg, 0)
    ok(await pg.evaluate("!!wandererState().bought"), 'bought his deal')
    m = await click_merchant(pg)
    r = (m or {}).get('rows') or []
    ok(bool(m) and len(r) == 2, 'clicking him again opens the menu (the speech plays too)')
    ok(len(r) == 2 and r[0]['sold'] and r[0]['btn'] == 'Bought today' and r[0]['disabled'], f'the deal shows as sold: {r[:1]}')
    ok(len(r) == 2 and not r[1]['sold'] and not r[1]['disabled'] and r[1]['btn'].startswith('Buy it'), f'the Mystery Boosters are still buyable: {r[1:]}')
    ok(bool(m) and 'Already sold you my best today' in m.get('speech', '') and m.get('close') == 'Not today', f'speech + a close button that says Not today {m and m.get("speech")}')
    await (await pg.query_selector('#npcPromptOverlay .npc-prompt')).screenshot(path=os.path.join(OUT, f'merchant-after-deal-{w}.png'), animations='disabled')
    for k in range(5):  # the five Mystery Boosters of the visit, one at a time, the menu reopening each time
        await buy_row(pg, 1)
        m = await click_merchant(pg); r = (m or {}).get('rows') or []
        ok(bool(m) and len(r) == 2, f'after Mystery Booster {k + 1} the menu opens again')
    ok(len(r) == 2 and r[0]['sold'] and r[1]['sold'] and r[1]['btn'] == 'Sold out' and r[1]['disabled'], f'all sold: both rows dimmed, the Mystery row reads Sold out {r}')
    ok(bool(m) and m.get('close') == 'Bye' and bool(m.get('fits')), 'with nothing left the close button says Bye')
    await (await pg.query_selector('#npcPromptOverlay .npc-prompt')).screenshot(path=os.path.join(OUT, f'merchant-sold-out-{w}.png'), animations='disabled')
    await pg.evaluate("(()=>{ const ov = document.getElementById('npcPromptOverlay'); ov.hidden = true; ov.innerHTML = ''; })()")

# ---- 3. Codex row ----------------------------------------------------------------------------------------------------------------------------------
ROW = """(()=>{ const row = document.querySelector('#view-codex .codex-sub-tabs'); if(!row) return null; const R = e=> { const b = e.getBoundingClientRect(); return {l: b.left, t: b.top, r: b.right, b: b.bottom, w: b.width, h: b.height}; };
  const c = document.getElementById('edCodexCreateCard'), d = document.getElementById('codexToDeckBtn'), tabs = [...row.querySelectorAll('[data-codextab]')];
  const last = tabs[tabs.length - 1], rr = R(row), cs = c && getComputedStyle(c.querySelector('.ed-cx-lbl'));
  return {create: !!c, row: rr, c: c && R(c), d: d && R(d), last: last && R(last), tabs: tabs.length, rowScroll: row.scrollWidth - row.clientWidth, pageScroll: document.documentElement.scrollWidth - innerWidth,
    label: c ? cs.display !== 'none' : null, title: c && c.title, aria: c && c.getAttribute('aria-label'), inRow: !!(c && c.parentElement === row), oldBox: !!document.querySelector('#codexBody .ed-cx-admin'), lines: new Set([...row.children].map(e=> Math.round(e.getBoundingClientRect().top))).size}; })()"""
async def codex_checks(pg, w):
    print(f'-- Codex, width {w}', flush=True)
    await pg.evaluate("(async()=>{ adminModeEnabled = true; codexSubTab = 'browse'; switchTab('codex'); renderCodex(); await new Promise(r=> setTimeout(r, 1500)); })()")
    r = await pg.evaluate(ROW)
    ok(bool(r and r['create'] and r['inRow']), 'admin: Create card is in the row of Codex tabs')
    ok(not r['oldBox'], 'the old line above the toolbar is gone')
    c, d = r['c'], r['d']
    ok(abs(c['t'] - d['t']) < 6 and c['r'] <= d['l'] + 1 and d['l'] - c['r'] <= 12, f"Create card is on Deck's line, right beside it (gap {round(d['l'] - c['r'])}px)")
    ok(d['r'] >= r['row']['r'] - 1, f"Deck is still at the right end of the row (row right {round(r['row']['r'])}, Deck right {round(d['r'])})")
    if w >= 700: ok(c['l'] > r['last']['r'] and abs(c['t'] - r['last']['t']) < 6, 'wide: it follows the last tab on the same line, right-aligned')
    ok(r['rowScroll'] <= 1 and r['pageScroll'] <= 1 and c['r'] <= w, f"no sideways scroll (row {r['rowScroll']}, page {r['pageScroll']}); the button is on screen")
    ok(bool(r['title']) and r['aria'] == 'Create card', f"tooltip and accessible name: {r['title']!r} / {r['aria']!r}")
    if w < 700: ok(r['label'] is False and c['w'] < 56, f"phone: icon only ({round(c['w'])}px wide)")
    else: ok(r['label'] is True, 'desktop: icon and label')
    row = await pg.query_selector('#view-codex .codex-sub-tabs')
    await row.screenshot(path=os.path.join(OUT, f'codex-row-{w}.png'), animations='disabled')
    await pg.evaluate("window.__cc = 0; const o = window.openCardEditor; window.openCardEditor = (id)=>{ window.__cc++; window.__ccId = id; }; 0")
    await pg.click('#edCodexCreateCard'); await pg.wait_for_timeout(200)
    cc = await pg.evaluate("[window.__cc, window.__ccId]")
    ok(cc == [1, None], f'Create card opens the card editor for a new card {cc}')
    # other sub-tabs: the button belongs to the card browser, Deck stays at the right
    await pg.evaluate("(async()=>{ codexSubTab = 'txns'; renderCodex(); await new Promise(r=> setTimeout(r, 400)); })()")
    r2 = await pg.evaluate(ROW)
    ok(r2 and not r2['create'] and r2['d']['r'] >= r2['row']['r'] - 1 and r2['pageScroll'] <= 1, 'Log tab: no Create card, Deck still right-aligned, no sideways scroll')
    # a player does not see it
    await pg.evaluate("(async()=>{ adminModeEnabled = false; codexSubTab = 'browse'; renderCodex(); await new Promise(r=> setTimeout(r, 600)); })()")
    r3 = await pg.evaluate(ROW)
    ok(r3 and not r3['create'], 'player: no Create card')
    await pg.evaluate("adminModeEnabled = true")

async def run(b, url, w):
    print(f'== width {w}', flush=True)
    ctx = await b.new_context(viewport={'width': w, 'height': 844 if w < 700 else 900}, has_touch=(w < 700))
    pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.add_init_script(V.SKIP)
    await pg.goto(url); await pg.wait_for_function("typeof switchTab === 'function' && typeof openPackAnimation === 'function'", timeout=90000); await pg.wait_for_timeout(1500)
    await pg.add_style_tag(content=NOTOAST)
    await pg.evaluate("(()=>{ " + V.OWN + " })()")
    await pack_checks(pg, w)
    await merchant_checks(pg, w)
    await codex_checks(pg, w)
    ok(not errs, f'no page errors {errs[:2]}')
    await ctx.close()

async def main(a):
    h = V.serve(); url = f'http://127.0.0.1:{h.server_address[1]}/{a.page}'
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=V.CHROME if os.path.exists(V.CHROME) else None, args=['--no-sandbox'])
        for w in [int(x) for x in a.widths.split(',')]: await run(b, url, w)
        await b.close()
    print('FAIL ' + str(len(fails)) if fails else 'ok')
    sys.exit(1 if fails else 0)
if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--widths', default='1366,390'); ap.add_argument('--page', default='index.html', help='a build to measure instead (to see the checks fail on the old one)'); asyncio.run(main(ap.parse_args()))
