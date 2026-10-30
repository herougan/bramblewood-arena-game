#!/usr/bin/env python3
"""Package CS-D (2026-10-30, card sizes steps 6-7; plan docs/design/card-sizes-2026-10-29.md): in-match cards in the built game.
    python3 tests/e2e/cs_d_2026_10_30.py [--only skirmish|raid|peek] [--sizes 390x844,1366x768] [--page index-before.html] [--shots DIR --tag before]
A skirmish with 5+5 units, a full hand, the leader in hand and an Environment card (Map 0's first fight, laid out by hand), and the first
raid's left part, at each viewport. Measures the board, hand, leader, both Brambles and the Environment cards; checks:
  - every in-match tile carries data-size="compact" (skipped with --page: a before build only measures);
  - a board card's name is hidden when the card is under 70px wide and shown at 70px and wider (CS-5);
  - the raid's top row (Bramble, deck, Environment cards) keeps the card's 4:5 shape (was 0.45 at 1366, owner 10-29);
  - no in-match card is a Detail card (.dc / mountDetailCard);
  - (peek, phones) a 0.25 s hold on a hand card opens the popover on screen and not over the held card; the same for a board card.
--json prints the measured sizes (to compare a before and an after build). Exit 1 on a failed check. Build first."""
import argparse, asyncio, json, os, sys
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
EXE = os.environ.get('BW_CHROMIUM', '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell')
INIT = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_pitch_open_v1','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); localStorage.setItem('bramblewood_world_open_v1','1'); localStorage.setItem('bramblewood_arena_faction','otters'); localStorage.setItem('bramblewood_map_revealed_v1','[\"*\"]'); localStorage.setItem('bramblewood_dialogue_flags_v1', JSON.stringify({'lesson:lumber':true}));"
        "sessionStorage.setItem('bramblewood_seen_splash','1'); localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying','castle-shield','castle-passive','pl-need','pl-do','pl-after']));")
# Map 0's first fight (as battle_ui does), with a gale added to its rules so the top row holds an Environment card
BATTLE = """(()=>{ const keep = matchFieldRulesBase; window.matchFieldRulesBase = m=> Object.assign({}, keep(m) || {}, {wind:'gale', eruption:1}); window.deckSizeOkOrWarn = ()=> true; /* the starter deck has copies the test profile does not own */
  const m = CONQUEST_MAPS[0], n = m.nodes.find(n=> n.kind === 'skirmish'); conquestSelectedMap = m.id; playSubTab = 'conquest'; switchTab('play');
  window.__ret = startConquestMatch(m.id, n.key, {skipEnergyCost:true, noOpener:true}); return m.id + '/' + n.key; })()"""
SETUP = """(()=>{ const m = matchState, E = m.engine; m.paused = true;
  const put = (pid, defId, slot)=>{ const c = E.makeBoardCard(defId); c.slot = slot; c.wait = 0; const pl = m.players[pid]; (slot===0?pl.row.center:slot<0?pl.row.left:pl.row.right).push(c); return c; };
  [1,2].forEach(pid=>{ const pl = m.players[pid]; pl.row.left = []; pl.row.center = []; pl.row.right = []; });
  [-2,-1,0,1,2].forEach(s=>{ put(2, 'chipmunk-skirmisher', s); put(1, 'otter-centurion', s); });
  E.syncSlots(m.players[1]); E.syncSlots(m.players[2]); m._mb2Win = null; m._slotRange = 0; m._mb2Pitch = 0;
  const me = m.players[1]; me.hand = ['otter-centurion','chipmunk-skirmisher','beetle-battering-ram','chipmunk-stockpiler','otter-centurion'] /* a full hand (MAX_HAND 5) */.map((d, i)=> ({uid: 990100 + i, defId: d}));
  if(!m.leaderDefId){ m.leaderDefId = 'otter-centurion'; } m.leaderUid = null; m.caged = null;
  renderMatchUI(); try{ fitBattlefieldZoomNow(true); }catch(e){} return 1; })()"""
MEASURE = """(()=>{ const R = el=> { const r = el.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; };
  const vis = el=> { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const grp = sel=> [...document.querySelectorAll(sel)].filter(vis);
  const g = {board: grp('#battlefieldInner .board-card > .card-tile'), hand: grp('.hand-strip > .card-tile'), leader: grp('#leaderWidget .card-tile'),
    hq: grp('.match-castle-tile'), env: grp('.env-card')};
  const out = {}, bad = [];
  for(const k in g){ const els = g[k]; if(!els.length){ out[k] = null; continue; } const sz = els.map(R);
    out[k] = {n: els.length, w: sz.map(s=> s[0]), h: sz.map(s=> s[1]), compact: els.filter(e=> e.dataset.size === 'compact').length};
    if(k === 'board' || k === 'hand'){ out[k].names = els.map(e=> { const nm = e.querySelector('.nm'); return nm ? getComputedStyle(nm).display !== 'none' && nm.getBoundingClientRect().height > 0 : false; });
      // the size container is the tile's content box (its border and padding off): the name hides when that is 70px or less (CS-5)
      out[k].inner = els.map(e=> { const cs = getComputedStyle(e); const r = e.getBoundingClientRect(); return Math.round((r.width - parseFloat(cs.borderLeftWidth) - parseFloat(cs.borderRightWidth) - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)) * 10) / 10; }); } }
  out.detail = document.querySelectorAll('#view-play .dc, #view-play [data-dc]').length;
  out.vw = innerWidth; out.vh = innerHeight; out.raid = !!(matchState && matchState.raidFull);
  { const app = document.getElementById('appWrap'), cs = getComputedStyle(app); out.vars = {res3fit: app.style.getPropertyValue('--res3-fit'), mcfit: cs.getPropertyValue('--mc-fit'),
      h: cs.getPropertyValue('--match-card-h'), desk: document.documentElement.classList.contains('is-desk-centre')}; }
  // the whole match fits the screen (a phone: no page scroll past the hand)
  const hs = document.querySelector('.hand-strip'); out.handBottom = hs ? Math.round(hs.getBoundingClientRect().bottom) : null;
  return out; })()"""
# the enemy's top row: its Bramble, its deck pile and the Environment cards, as [kind, w, h]
TOPROW = """(()=>{ const t = document.querySelector('.top-play-row'); if(!t) return null;
  return [...t.querySelectorAll('.match-castle-tile, .env-card, .hq-tile, .deck-tile, .match-deck-tile, [data-pile]')].filter(e=> !e.parentElement.closest('.match-castle-tile, .env-card, .deck-tile'))
    .map(e=> { const r = e.getBoundingClientRect(); return [e.className.split(' ').find(c=> /castle|env-card|deck|hq|pile/.test(c)) || e.className.split(' ')[0], Math.round(r.width), Math.round(r.height)]; }).filter(s=> s[1] > 0); })()"""
fails = []
def ok(c, m):
    print(('  ok  ' if c else '  FAIL ') + m)
    if not c: fails.append(m)
    return c

async def open_page(b, url, w, h):
    phone = w < 700
    ctx = await b.new_context(viewport={'width': w, 'height': h}, has_touch=phone, is_mobile=phone, device_scale_factor=2 if phone else 1)
    pg = await ctx.new_page(); pg._errs = []
    pg.on('pageerror', lambda e: pg._errs.append(str(e))); pg.on('dialog', lambda d: asyncio.ensure_future(d.accept()))
    await pg.add_init_script(INIT); await pg.goto(url); await pg.wait_for_timeout(1500)
    await pg.evaluate("FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); myCurrencies.energy = 60; window.showCoachTip = function(){}; window.maybeShowCoachTip = function(){}; 1")
    return ctx, pg

FIT = None
async def settle(pg):
    # a desktop window grows the cards by --res3-fit in a loop of frames (centreFieldInFs); measure once it has stopped moving, or the
    # size depends on when the loop was caught (the audit's 114 vs 131 px at 1366). The loop can see-saw and stop wherever its 12 passes
    # end, so --fit pins it (to compare two builds: the formula's output at the same fit)
    if FIT is not None:
        for _ in range(2):  # twice: a frame the loop had already asked for may still write once
            await pg.evaluate(f"(()=>{{ window.centreFieldInFs = ()=>{{}}; const w = document.getElementById('appWrap'); if(document.documentElement.classList.contains('is-desk-centre')) w.style.setProperty('--res3-fit', '{FIT}'); return 1; }})()")
            await pg.wait_for_timeout(300)
        return
    last = None
    for _ in range(12):
        v = await pg.evaluate("(()=>{ try{ centreFieldInFs(); }catch(e){} return document.getElementById('appWrap').style.getPropertyValue('--res3-fit') + '|' + Math.round(document.querySelector('.hand-strip > .card-tile') ? document.querySelector('.hand-strip > .card-tile').getBoundingClientRect().width : 0); })()")
        await pg.wait_for_timeout(400)
        if v == last: break
        last = v

def check_sizes(tag, r, strict):
    print(f'  {tag}: {r.get("vars")}')
    for k in ('board', 'hand', 'leader', 'hq', 'env'):
        v = r.get(k)
        if not v: print(f'  {tag}: no {k} tiles'); continue
        print(f'  {tag}: {k} {v["n"]}x  w {sorted(set(v["w"]))}  h {sorted(set(v["h"]))}  compact {v["compact"]}/{v["n"]}')
        if strict: ok(v['compact'] == v['n'], f'{tag}: every {k} tile is data-size="compact" ({v["compact"]}/{v["n"]})')
        for w_, h_ in zip(v['w'], v['h']):
            if w_ > 0 and strict and k in ('board', 'hand', 'leader') and not r['raid']:
                ok(0.7 <= w_ / h_ <= 0.9, f'{tag}: a {k} card keeps the 4:5 shape ({w_}x{h_})'); break
    for k in ('board', 'hand'):
        b = r.get(k)
        if not (b and strict): continue
        for w_, inner, shown in zip(b['w'], b['inner'], b['names']):
            # the container query reads the content box (inside the border and the 7px side padding): a 75px card is 55px inside
            ok(shown == (inner > 70), f'{tag}: a {k} card {w_}px wide ({inner}px inside) {"shows" if inner > 70 else "hides"} its name (CS-5)'); break
    if strict: ok(r['detail'] == 0, f'{tag}: no Detail card in the match ({r["detail"]})')

async def skirmish(b, url, w, h, a):
    tag = f'skirmish {w}x{h}'; print('--', tag)
    ctx, pg = await open_page(b, url, w, h)
    where = await pg.evaluate(BATTLE); await pg.wait_for_timeout(3500)
    await pg.evaluate("(()=>{ const v = document.querySelector('.vs-screen'); if(v) v.click(); return 1; })()"); await pg.wait_for_timeout(1500)
    if not await pg.evaluate("!!(matchState && matchState.engine)"):
        dbg = await pg.evaluate("[typeof matchState, String(matchState), [...document.querySelectorAll('.toast, #toast, .toast-item')].map(t=> t.textContent.slice(0,80)).join(' | '), window.__ret, deckTotal(myDeckCounts), JSON.stringify(deckCopyProblem(myDeckCounts)), document.querySelector('.modal-overlay:not([hidden])') ? document.querySelector('.modal-overlay:not([hidden])').className : '']")
        ok(False, f'{tag}: the fight did not open ({where}; {dbg}; {pg._errs[:2]})'); await ctx.close(); return None
    await pg.evaluate(SETUP); await pg.wait_for_timeout(1200)
    await settle(pg)
    r = await pg.evaluate(MEASURE); r['where'] = where
    check_sizes(tag, r, a.page is None)
    if a.shots: await pg.screenshot(path=os.path.join(ROOT, a.shots, f'skirmish-{a.tag}-{w}x{h}.jpg'), quality=82, type='jpeg')
    if w < 700 and a.only in (None, 'peek'): await peek(pg, tag, a)
    ok(not pg._errs, f'{tag}: no page errors {pg._errs[:2]}')
    await ctx.close(); return r

async def peek(pg, tag, a):
    # a 0.25 s finger hold on a hand card (the middle one), then on a board card: the popover is on screen and leaves the held card visible
    for kind, sel in (('hand', '.hand-strip > .card-tile'), ('board', '#rowMine > .board-card .card-tile')):
        r = await pg.evaluate("""(sel)=>{ const els = [...document.querySelectorAll(sel)]; const el = els[Math.floor(els.length / 2)]; if(!el) return null; const c = el.getBoundingClientRect();
          const x = c.left + c.width / 2, y = c.top + c.height / 2, t = document.elementFromPoint(x, y) || el;
          t.dispatchEvent(new PointerEvent('pointerdown', {bubbles:true, cancelable:true, clientX:x, clientY:y, pointerId:5, pointerType:'touch', isPrimary:true, buttons:1}));
          window.__held = {t, x, y, c:[c.left, c.top, c.right, c.bottom]}; return 1; }""", sel)
        if not r: ok(False, f'{tag}: no {kind} card to hold'); continue
        await pg.wait_for_timeout(450)
        # the popover rises in on GSAP (FX F cardPopIn), which a headless page draws at a few frames a second: jump its tweens to their end
        await pg.evaluate("(()=>{ try{ const pop = document.getElementById('cardPop'); gsap.getTweensOf([pop, ...pop.querySelectorAll('*')]).forEach(t=> t.progress(1)); }catch(e){} return 1; })()")
        await pg.wait_for_timeout(100)
        p = await pg.evaluate("""(()=>{ const pop = document.getElementById('cardPop'); if(!pop || pop.hidden) return null; const c = window.__held.c;
          // the Full card sits on the popover's top edge (CS-C): the popover's box and that card together
          const rs = [pop, pop.querySelector('.card-pop-visual-tile')].filter(Boolean).map(e=> e.getBoundingClientRect());
          const r = {left: Math.min(...rs.map(q=> q.left)), top: Math.min(...rs.map(q=> q.top)), right: Math.max(...rs.map(q=> q.right)), bottom: Math.max(...rs.map(q=> q.bottom))};
          // the held card is covered by the popover's box or by its card
          const cov = q=> Math.max(0, Math.min(q.right, c[2]) - Math.max(q.left, c[0])) * Math.max(0, Math.min(q.bottom, c[3]) - Math.max(q.top, c[1]));
          const ix = Math.sqrt(Math.max(...rs.map(cov))), iy = ix;
          return {p:[r.left, r.top, r.right, r.bottom].map(Math.round), c:c.map(Math.round), cover: ix * iy / ((c[2] - c[0]) * (c[3] - c[1])), vw: innerWidth, vh: innerHeight,
            card: !!pop.querySelector('.card-pop-visual-tile'), op: getComputedStyle(pop).opacity, bg: getComputedStyle(pop).backgroundColor, bgi: getComputedStyle(pop).backgroundImage.slice(0, 80), filt: getComputedStyle(pop).backdropFilter }; })()""")
        if a.shots: await pg.wait_for_timeout(500); await pg.screenshot(path=os.path.join(ROOT, a.shots, f'peek-{kind}-{a.tag}-{pg.viewport_size["width"]}x{pg.viewport_size["height"]}.jpg'), quality=82, type='jpeg')
        await pg.evaluate("(()=>{ const h = window.__held; h.t.dispatchEvent(new PointerEvent('pointerup', {bubbles:true, cancelable:true, clientX:h.x, clientY:h.y, pointerId:5, pointerType:'touch', isPrimary:true})); document.body.click(); try{ hideCardPop(); }catch(e){} return 1; })()")
        await pg.wait_for_timeout(300)
        if not ok(p is not None, f'{tag}: a hold on a {kind} card opens the popover'): continue
        print(f'  {tag}: {kind} hold: popover {p["p"]}, card {p["c"]}, covers {p["cover"]:.0%} of it; opacity {p["op"]} {p["bg"]} {p["bgi"]} {p["filt"]}')
        ok(p['p'][0] >= -1 and p['p'][2] <= p['vw'] + 1 and p['p'][1] >= -1 and p['p'][3] <= p['vh'] + 1, f'{tag}: the {kind} hold popover is on screen {p["p"]}')
        ok(p['cover'] <= 0.25, f'{tag}: the {kind} hold popover leaves the held card visible (covers {p["cover"]:.0%})')

async def raid(b, url, w, h, a):
    tag = f'raid {w}x{h}'; print('--', tag)
    ctx, pg = await open_page(b, url, w, h)
    await pg.evaluate("window.deckSizeOkOrWarn = ()=> true; playSubTab='raid'; switchTab('play'); 1"); await pg.wait_for_timeout(500)
    await pg.evaluate("document.querySelector('.raid-hub [data-raid-open]').click()"); await pg.wait_for_timeout(500)
    await pg.evaluate("document.querySelector('[data-raid-part=left]').click()"); await pg.wait_for_timeout(1500)
    await pg.evaluate("(()=>{ const v = document.querySelector('.vs-screen'); if(v) v.click(); return 1; })()"); await pg.wait_for_timeout(5000)
    if not ok(await pg.evaluate("!!(matchState && matchState.raidFull)"), f'{tag}: the raid opened'): await ctx.close(); return None
    await pg.evaluate("(()=>{ matchState.paused = true; try{ renderMatchUI(); }catch(e){} return 1; })()"); await pg.wait_for_timeout(800)
    r = await pg.evaluate(MEASURE)
    check_sizes(tag, r, a.page is None)
    # the top row: the enemy's Bramble, deck and the Environment cards keep the card's shape
    top = await pg.evaluate(TOPROW)
    print(f'  {tag}: top row {top}')
    if a.page is None and top:
        for c, w_, h_ in top: ok(0.7 <= w_ / h_ <= 0.9, f'{tag}: a top-row card keeps the 4:5 shape ({c} {w_}x{h_})')
    if a.shots: await pg.screenshot(path=os.path.join(ROOT, a.shots, f'raid-{a.tag}-{w}x{h}.jpg'), quality=82, type='jpeg')
    # the owner plays with Admin Mode on: its extra buttons (Auto-win, Edit mode, Auto-play) made the top row taller (the audit's 64x145 tiles)
    await pg.evaluate("(()=>{ adminModeEnabled = true; try{ renderMatchUI(); }catch(e){} return 1; })()"); await pg.wait_for_timeout(900)
    top2 = await pg.evaluate(TOPROW); print(f'  {tag}: top row, Admin Mode {top2}')
    if a.page is None and top2:
        for c, w_, h_ in top2: ok(0.7 <= w_ / h_ <= 0.9, f'{tag}: with Admin Mode a top-row card keeps the 4:5 shape ({c} {w_}x{h_})')
    if a.shots: await pg.screenshot(path=os.path.join(ROOT, a.shots, f'raid-admin-{a.tag}-{w}x{h}.jpg'), quality=82, type='jpeg')
    ok(not pg._errs, f'{tag}: no page errors {pg._errs[:2]}')
    await ctx.close(); r['top'] = top; return r

async def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--only'); ap.add_argument('--sizes', default='390x844,1366x768,1366x860'); ap.add_argument('--page'); ap.add_argument('--shots'); ap.add_argument('--tag', default='after'); ap.add_argument('--json')
    ap.add_argument('--fit', help='pin a desktop window\'s --res3-fit (e.g. 1 or 1.2) to compare builds')
    a = ap.parse_args()
    global FIT; FIT = a.fit
    if a.shots: os.makedirs(os.path.join(ROOT, a.shots), exist_ok=True)
    url = 'file://' + os.path.join(ROOT, a.page or 'index.html'); res = {}
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=EXE, args=['--allow-file-access-from-files'])
        for s in a.sizes.split(','):
            w, h = map(int, s.split('x'))
            if a.only in (None, 'skirmish', 'peek'): res[f'skirmish {s}'] = await skirmish(b, url, w, h, a)
            if a.only in (None, 'raid'): res[f'raid {s}'] = await raid(b, url, w, h, a)
        await b.close()
    if a.json:
        with open(a.json, 'w') as f: json.dump(res, f, indent=1)
    print(f'\n{len(fails)} failed' if fails else '\nall passed'); sys.exit(1 if fails else 0)
asyncio.run(main())
