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
import pl2_2026_10_25 as P
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

BOARD = re.sub(r"  # 2026-10-26.*", "", P.BOARD)
E = P.E
async def fightpage(b, url, w, h=None):
    pg = await P.page(b, url, w)
    if h: await pg.set_viewport_size({'width': w, 'height': h}); await pg.wait_for_timeout(300)
    return pg

# ---------------------------------------------------------------- FF1 + FF5
async def ff1(b, url, w):
    print(f'-- FF1 / FF5: Shield chip, pips that matter, centred icon chips ({w})')
    pg = await fightpage(b, url, w)
    u = await pg.evaluate(BOARD + "('m1', '0-2', [['tide-pool-crab', 0, 12], ['fungal-colossus', -1, 14], ['lotus-frog', 1, 8], ['grass-snake', -1, 6]], [['otter-kit', 0, 30], ['conch-crawler', 1, 12]])")
    crab, kit = u['1:0'], u['2:0']
    q = lambda uid, sel: f"document.querySelector('.board-card[data-uid=\"{uid}\"] {sel}')"
    await pg.evaluate(f"(()=>{{ currentCardByUid({crab}).shield = 3; renderMatchUI(); }})()"); await pg.wait_for_timeout(900)
    r = await pg.evaluate(f"""(()=>{{ const el = {q(crab, '.card-tile .badges .ab-unit-shield.is-live')}, tile = {q(crab, '.card-tile')}; const c = currentCardByUid({crab});
      if(!el) return null; const a = el.getBoundingClientRect(), t = tile.getBoundingClientRect(); return {{n: el.dataset.shield, text: el.textContent.trim(), shield: vis3ShieldAmount(c), south: (a.top + a.height/2 - t.top) / t.height, east: document.querySelectorAll('.card-tile > .vis3-shield-num').length}}; }})()""")
    ok(r is not None and r['text'] == str(r['shield']) and r['n'] == str(r['shield']), f'FF1 the Shield skill chip shows the icon + the Shield left {r}')
    ok(r and r['south'] > .8, f'FF1 the chip sits on the card\'s south edge ({r and round(r["south"], 2)})')
    ok(r and r['east'] == 0, 'FF1 no east-side Shield badge')
    await pg.screenshot(path=shot('ff1-shield', w))
    async def setShield(uid, n, wait=900):
        await pg.evaluate(f"(()=>{{ const c = currentCardByUid({uid}); c.shield = {n}; c.tempHp = 0; c.tempHpR = 0; updateCardStatusDisplay({uid}); }})()"); await pg.wait_for_timeout(wait)
        return await pg.evaluate(f"""(()=>{{ const el = {q(uid, '.card-tile .badges .ab-unit-shield.is-live')}; if(!el) return null; const nn = el.querySelector('.shield-n'); return {{n: el.dataset.shield, one: el.classList.contains('is-one'), op: +getComputedStyle(nn).opacity, mw: nn.getBoundingClientRect().width, out: el.classList.contains('vis4-shield-out')}}; }})()""")
    r = await setShield(crab, 4); ok(r and r['n'] == '4' and not r['one'] and r['op'] > .9, f'FF1 updates live as Shield changes (4) {r}')
    r = await setShield(crab, 2); ok(r and r['n'] == '2', f'FF1 ... and drops (2) {r}')
    r = await setShield(crab, 1, 1200); ok(r and r['n'] == '1' and r['one'] and r['op'] < .05, f'FF1 at 1 the number fades, the icon alone stays {r}')
    await pg.screenshot(path=shot('ff1-shield-one', w))
    r = await setShield(crab, 0, 1600); ok(r is None, f'FF1 at 0 the chip is removed {r}')
    r = await setShield(kit, 3); ok(r and r['n'] == '3', f'FF1 a unit with no Shield skill gets the chip when it gains Shield {r}')
    r = await setShield(kit, 0, 1600); ok(r is None, 'FF1 ... and loses it at 0')
    # FF1 pip pass
    ids = await pg.evaluate("(()=>{ const m = matchState; return [1,2].flatMap(p=> ['left','center','right'].flatMap(s=> m.players[p].row[s])).map(c=> [c.uid, c.defId, c.slot, c.hp]); })()")
    undead = [x for x in ids if x[1] == 'grass-snake'][0]; colo = [x for x in ids if x[1] == 'fungal-colossus'][0]; lotus = [x for x in ids if x[1] == 'lotus-frog'][0]
    r = await pg.evaluate(f"""(()=>{{ const has = (uid, sel)=> !!document.querySelector('.board-card[data-uid="' + uid + '"] .card-tile .badges ' + sel); return {{tide: matchHasTide(matchState), colossus: has({colo[0]}, '.ab-bloomcopy'), lotus: has({lotus[0]}, '.ab-bloomcopy')}}; }})()""")
    ok(r['colossus'], f'FF1 a Bloom chip whose conditions can hold keeps showing {r}')
    ok(not r['tide'] and not r['lotus'], f'FF1 a Bloom whose Tide condition cannot hold on this map shows no chip {r}')
    r = await pg.evaluate(f"""(async()=>{{ const q = (uid, s)=> !!document.querySelector('.board-card[data-uid="' + uid + '"] .card-tile .badges ' + s); const before = [q({undead[0]}, '.ab-revive'), q({colo[0]}, '.ab-bloomcopy')];
      currentCardByUid({undead[0]}).revivedOnce = true; currentCardByUid({colo[0]}).bloomed = true; renderMatchUI(); await new Promise(r=> setTimeout(r, 900));
      return {{before, after: [q({undead[0]}, '.ab-revive'), q({colo[0]}, '.ab-bloomcopy')]}}; }})()""")
    ok(r['before'] == [True, True] and r['after'] == [False, False], f'FF1 a used Undead chip and a spent Bloom chip are gone {r}')
    await pg.screenshot(path=shot('ff1-pips', w))
    # FF5: every icon-only chip on the board is centred on its pill
    await pg.evaluate("(()=>{ const m = matchState; [1, 2].forEach(p=> ['left','center','right'].forEach(s=> m.players[p].row[s].forEach(c=>{ c.bloomed = false; c.revivedOnce = false; }))); renderMatchUI(); })()"); await pg.wait_for_timeout(900)
    r = await pg.evaluate("""(()=>{ const out = []; document.querySelectorAll('.board-card .card-tile .badges .abadge.is-icon-only').forEach(a=>{ const im = a.querySelector('img.tw-emoji, img.ico'); if(!im) return; const ra = a.getBoundingClientRect(), ri = im.getBoundingClientRect();
        out.push({cls: (a.firstElementChild && a.firstElementChild.className) || im.className, off: +(((ri.left + ri.width / 2) - (ra.left + ra.width / 2))).toFixed(2)}); }); return out; })()""")
    ok(len(r) >= 1, f'FF5 icon-only chips found on the board ({len(r)})')
    bad = [x for x in r if abs(x['off']) > 1.2]
    ok(not bad, f'FF5 every icon-only chip (Bloom, Undead ...) is centred, offsets {[x["off"] for x in r]}')
    h = await pg.query_selector('.board-card[data-uid="%s"] .card-tile' % colo[0])
    if h:
        bb = await h.bounding_box(); await pg.screenshot(path=shot('ff5-bloom', w), clip={'x': max(0, bb['x'] - 10), 'y': max(0, bb['y'] + bb['height'] * .6), 'width': bb['width'] + 20, 'height': bb['height'] * .5})
    await done(pg)

# ---------------------------------------------------------------- FF3
async def ff3(b, url, w):
    print(f'-- FF3: card tooltip stays, larger, tilted ({w})')
    ww, h = (1920, 1080) if w >= 1366 else (w, 844)
    pg = await fightpage(b, url, ww, h)
    u = await pg.evaluate(BOARD + "('m1', '0-2', [['otter-kit', 1, 40], ['otter-kit', 0, 40], ['growth-sprout', -1, 20]], [['otter-kit', 1, 300], ['frog-imp', 0, 300], ['insect-swarmling', -1, 300]])")
    uid = u['2:1']
    await pg.evaluate("(()=>{ const m = matchState; m.players[1].hq.hp = 99; m.players[2].hq.hp = 99; renderMatchUI(); })()"); await pg.wait_for_timeout(900)
    hd = await pg.query_selector(f'#rowEnemy .board-card[data-uid="{uid}"]'); bb = await hd.bounding_box()
    cx, cy = bb['x'] + bb['width'] / 2, bb['y'] + bb['height'] * .45
    await pg.mouse.move(cx - 60, cy - 120); await pg.mouse.move(cx, cy, steps=4); await pg.wait_for_timeout(1500)
    r = await pg.evaluate("""(()=>{ const pop = document.getElementById('cardPop'), t = pop.querySelector('.card-pop-visual-tile'); if(pop.hidden || !t) return null; const bc = [...document.querySelectorAll('.board-card')].find(x=> x.matches(':hover'));
      return {tile: t.offsetWidth, board: bc ? bc.getBoundingClientRect().width : 0, rotate: getComputedStyle(t).rotate, pw: pop.offsetWidth, ph: pop.offsetHeight, vh: innerHeight, top: pop.getBoundingClientRect().top, bottom: pop.getBoundingClientRect().bottom}; })()""")
    ok(r is not None, 'FF3 the card tooltip opens after resting on a unit')
    if r:
        if w >= 1366: ok(r['tile'] > r['board'] * 1.15, f'FF3 at full screen the tooltip card is clearly larger than the board card {r["tile"]} vs {r["board"]:.0f}')
        else: ok(r['tile'] >= r['board'], f'FF3 the tooltip card is not smaller than the board card ({r["tile"]} vs {r["board"]:.0f})')
        ok(r['rotate'] == '1deg', f'FF3 tilted 1 degree clockwise ({r["rotate"]})')
        ok(r['top'] >= 0 and r['bottom'] <= r['vh'], f'FF3 the tooltip stays inside the window {round(r["top"])}..{round(r["bottom"])} of {r["vh"]}')
    await pg.screenshot(path=shot('ff3-tooltip', w))
    rr = await pg.evaluate("""(async()=>{ const pop = document.getElementById('cardPop'); let closed = 0, was = pop.hidden; const log = [];
      const mo = new MutationObserver(()=>{ if(pop.hidden !== was){ if(pop.hidden) closed++; log.push(Math.round(performance.now()) + (pop.hidden ? ' close' : ' open')); was = pop.hidden; } }); mo.observe(pop, {attributes: true, attributeFilter: ['hidden']});
      for(let i = 0; i < 3 && !matchState.over; i++){ [1,2].forEach(p=> matchState.players[p].hq.hp = 99); matchState.resolving = false; await resolveRound(); await new Promise(r=> setTimeout(r, 300)); }
      mo.disconnect(); return {closed, log, hiddenNow: pop.hidden, over: !!matchState.over}; })()""")
    ok(rr['closed'] == 0 and not rr['hiddenNow'], f'FF3 the tooltip stays open through three rounds of animations {rr}')
    # the hovered unit's element is away for a moment (an animation hides it): the tooltip waits, then follows it again
    rr = await pg.evaluate(f"""(async()=>{{ const pop = document.getElementById('cardPop'); const el = document.querySelector('#rowEnemy .board-card[data-uid="{uid}"]'); if(!el) return null; let closed = 0, was = pop.hidden;
      const mo = new MutationObserver(()=>{{ if(pop.hidden !== was){{ if(pop.hidden) closed++; was = pop.hidden; }} }}); mo.observe(pop, {{attributes: true, attributeFilter: ['hidden']}});
      el.style.visibility = 'hidden'; await new Promise(r=> setTimeout(r, 900)); const during = pop.hidden; el.style.visibility = ''; await new Promise(r=> setTimeout(r, 500)); mo.disconnect(); return {{closed, during, after: pop.hidden}}; }})()""")
    ok(rr is not None and rr['closed'] == 0 and not rr['during'] and not rr['after'], f'FF3 the tooltip waits while the unit\'s element is hidden for a moment {rr}')
    await pg.mouse.move(5, 5, steps=3); await pg.wait_for_timeout(500)
    ok(await pg.evaluate("document.getElementById('cardPop').hidden"), 'FF3 moving the pointer off the card still closes it')
    await done(pg)

# ---------------------------------------------------------------- FF7
async def ff7(b, url, w):
    print(f'-- FF7: the selected map in the conquest list is brighter ({w})')
    pg = await fightpage(b, url, w)
    await pg.evaluate("(()=>{ try{ adminModeEnabled = true; }catch(e){} switchTab('play'); })()"); await pg.wait_for_timeout(1800)
    r = await pg.evaluate("""(()=>{ const items = [...document.querySelectorAll('#conquestMapList .conquest-map-item:not(.locked)')]; const sel = items.filter(x=> x.classList.contains('selected') && !x.classList.contains('world-chip'));
      const cv = document.createElement('canvas').getContext('2d', {willReadFrequently: true}); const lum = c=>{ cv.clearRect(0, 0, 1, 1); cv.fillStyle = '#000'; cv.fillStyle = c; cv.fillRect(0, 0, 1, 1); const d = cv.getImageData(0, 0, 1, 1).data; return 0.299 * d[0] + 0.587 * d[1] + 0.114 * d[2]; };
      const s = sel[0]; if(!s) return null; const bg = getComputedStyle(s).backgroundColor, nameC = getComputedStyle(s.querySelector('.cmi-name')).color;
      s.style.transition = 'none'; s.classList.remove('selected'); const bg0 = getComputedStyle(s).backgroundColor, name0 = getComputedStyle(s.querySelector('.cmi-name')).color; s.classList.add('selected'); s.style.transition = '';
      return {bg, bg0, nameC, name0, lbg: lum(bg), lbg0: lum(bg0), band: /--band/.test(s.getAttribute('style') || '')}; })()""")
    ok(r is not None, 'FF7 the list has a selected map')
    if r:
        ok(r['bg'] != r['bg0'], f'FF7 selected differs in background from unselected {r}')
        ok(r['lbg'] > r['lbg0'] + 5, f'FF7 the selected background is brighter ({r["lbg"]:.0f} vs {r["lbg0"]:.0f})')
    await pg.screenshot(path=shot('ff7-maplist', w))
    await done(pg)

# ---------------------------------------------------------------- FF2 + UI10 leftovers
async def ff2(b, url, w):
    print(f'-- FF2 / UI10 leftovers: texts, N-SK showcase ({w})')
    pg = await fightpage(b, url, w)
    r = await pg.evaluate("({a: TX('ui.fx-windy'), b: TX('ui.fxx-windy'), pref: TX('ui.pref-toggle-sub')})")
    ok(r['a'].endswith("Headwind Flyers' skills trigger twice."), f'FF2 the Windy field text ends with the Headwind line {r["a"]!r}')
    ok(r['b'].endswith("Headwind Flyers' skills trigger twice.") and '1 in 3' in r['b'], f'FF2 and the explanation, odds kept at 1 in 3 {r["b"]!r}')
    ok('(road, PRO, BPRO, X-REF)' not in r['pref'] and '<N>-SK' in r['pref'], f'UI10 the Admin toggle sentence names the one skirmish per map {r["pref"]!r}')
    r = await pg.evaluate("""(()=>{ adminModeEnabled = true; const out = []; Object.keys(proMapEntries()).slice(0, 8).forEach(id=>{ const f = proFightsOf(id)[0]; if(!f) return; const sc = nodeShowcaseId(f), want = skirmMapShowcase(id);
        out.push({id, key: f.key, sc, want, inList: mpEntry(mpTopOf(id)).cards.includes(want), first: Object.keys(f.deck)[0]}); }); return out; })()""")
    ok(len(r) >= 1 and all(x['sc'] == x['want'] and x['inList'] for x in r), f'UI10 the N-SK node\'s showcase is the map\'s showcase (a card of the map\'s list) {r[:3]}')
    ok(any(x['sc'] != x['first'] for x in r), 'UI10 ... not simply the first deck\'s first card')
    await done(pg)

PARTS = {'ff9': ff9, 'ff1': ff1, 'ff3': ff3, 'ff7': ff7, 'ff2': ff2}

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
