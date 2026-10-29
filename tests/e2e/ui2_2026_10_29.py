#!/usr/bin/env python3
"""Package UI2 (2026-10-29, owner notes R1-R3, R5, R7, R8): browser checks and screenshots.

    python3 tests/e2e/ui2_2026_10_29.py            # checks; shots in tests/out/shots/ui2-*.png
    python3 tests/e2e/ui2_2026_10_29.py --keep     # also copies the shots to docs/screens/ui2/ (as .jpg)
    python3 tests/e2e/ui2_2026_10_29.py --only pack,zoom

R2  the pack opener: the Morel Hollow boss's first clear (its packs, plus a second Rivergate Pack) opened card by card with no page error;
    then the same run with one card of the 2nd Rivergate Pack that throws when drawn and one result id the card list does not have: the
    opener still reaches the 2nd pack's summary and closes; Skip on a broken pack goes to its summary, Open all to the bundle page, Done
    closes, the reveal queue empties, the cards are owned; the first pack pops in (.ui2-popin), none with reduced motion.
R1  the board's card size against the window: 5, 7, 9 and 12 units a row at 1366x768, 1920x1080, iPad 820x1180 / 1180x820 and a 390x844
    phone: the cards keep the size they have with 5 until the units would not fit the field; no zoom-out (scale 1) on PC and iPad; every
    unit inside the field. Shots of 7, 9 and 12 at each size.
R3  Ambush: the card played into an Ambush's slot is drawn, takes a short jab (the ambusher's face moves, under the normal lunge's
    reach), then dies; its play event comes first in the log (the engine order is unchanged).
R5  using an Energy capsule: ⚡ sparks fly into the Energy pill, it pulses, Energy +8; with reduced motion no sparks, one pulse.
R7  Shift+click on a hand card pitches it (the hand loses it, the Graveyard gains it, the pitch is spent); a plain click arms as before.
R8  a PRO / BPRO fight's panel shows its deck strip with no clear of that fight.
Build first. Exits 1 on a failed check.
"""
import argparse, asyncio, http.server, socketserver, threading, functools, os, sys, shutil, json
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'tests', 'out', 'shots'); os.makedirs(OUT, exist_ok=True)
KEEP = os.path.join(ROOT, 'docs', 'screens', 'ui2')
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
DONE = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1'); localStorage.setItem('bramblewood_arena_faction','otters');"
        "localStorage.setItem('bramblewood_res3_level_track_v1', JSON.stringify({granted: 999}));"
        "window.addEventListener('load', ()=>{ try{ skipTriggerLesson(); saveTutorial2Done(); saveTutorialDone(); window.deckSizeOkOrWarn = ()=> true; saveEnergyState({current:200, lastRegenAt:Date.now()});"
        " window.showCoachTip = ()=>{}; window.maybeShowCoachTip = ()=>{}; }catch(e){} });")
fails = []; shots = []

def ok(cond, msg):
    print(('  ok  ' if cond else '  FAIL ') + msg)
    if not cond: fails.append(msg)

def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    class S(socketserver.ThreadingTCPServer):
        daemon_threads = True
        def handle_error(self, request, client_address): pass  # a page closed mid-download (broken pipe) is not a test failure
    httpd = S(('127.0.0.1', 0), functools.partial(Q, directory=ROOT))
    threading.Thread(target=httpd.serve_forever, daemon=True).start(); return httpd

async def page(b, url, w, h=None, reduce=False, touch=None):
    ctx = await b.new_context(viewport={'width': w, 'height': h or (844 if w < 700 else 860)}, has_touch=(w < 900) if touch is None else touch, reduced_motion='reduce' if reduce else 'no-preference')
    pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:200])); pg._errs = errs; pg._ctx = ctx
    await pg.add_init_script(DONE)
    await pg.goto(url); await pg.wait_for_function("typeof switchTab === 'function' && typeof startConquestMatch === 'function'", timeout=60000); await pg.wait_for_timeout(2200)
    return pg

async def close(pg, allow=()):
    errs = [e for e in pg._errs if not any(a in e for a in allow)]
    ok(not errs, f'no page errors {errs[:2]}')
    await pg._ctx.close()

async def shot(pg, name, clip=None):
    f = os.path.join(OUT, f'ui2-{name}.png')
    if clip: await pg.screenshot(path=f, clip=clip, animations='allow')
    else: await pg.screenshot(path=f, animations='allow')
    shots.append(f); return f

def sheet(files, name, cols=4, scale=.45):
    from PIL import Image, ImageDraw
    ims = []
    for i, f in enumerate(files):
        im = Image.open(f).convert('RGB'); im = im.resize((max(1, int(im.width * scale)), max(1, int(im.height * scale))))
        d = ImageDraw.Draw(im); d.rectangle((0, 0, 22, 13), fill=(0, 0, 0)); d.text((2, 1), f'{i:02d}', fill=(255, 255, 0)); ims.append(im); os.remove(f)
    W, H = max(i.width for i in ims), max(i.height for i in ims); rows = (len(ims) + cols - 1) // cols
    S = Image.new('RGB', (W * min(cols, len(ims)), H * rows), (24, 24, 24))
    for i, im in enumerate(ims): S.paste(im, ((i % cols) * W, (i // cols) * H))
    out = os.path.join(OUT, f'ui2-{name}.png'); S.save(out); shots.append(out); return out

OV = """(()=>{ const ov = document.getElementById('packOpenOverlay'); if(!ov || ov.hidden) return null; const c = ov.querySelector('.po2-count');
  return {name: ov.getAttribute('aria-label') || '', count: c && c.textContent, ids: [...ov.querySelectorAll('button')].map(b=> b.id).filter(Boolean), cls: (ov.querySelector('.po2-stage') || {}).className || '',
    fallback: ov.querySelectorAll('.ui2-po-fallback').length, popin: !!ov.querySelector('.ui2-popin'), q: packRevealQueue.length}; })()"""
CLICK = "(k)=>{ const b = document.getElementById(k); if(!b) return 'none'; b.click(); return 'ok'; }"
CARD = "()=>{ const c = document.querySelector('#packOpenOverlay .po2-card.is-current'); if(!c) return 'none'; c.click(); return 'ok'; }"

async def drive(pg, order, limit=90, log=None):
    """click through the opener: the first button in `order` that is there, else the current card; stops once it has stayed closed"""
    seen, empty = [], 0
    for step in range(limit):
        await pg.wait_for_timeout(260)
        st = await pg.evaluate(OV)
        if not st:
            empty += 1
            if empty > 10: break
            continue
        empty = 0; seen.append(st)
        if log is not None: log.append(st)
        for k in order:
            if k in st['ids']:
                await pg.evaluate(CLICK, k); break
        else: await pg.evaluate(CARD)
    return seen

GRANT = """(()=>{ window.armouryOpen = ()=> true; const p = loadConquestProgress(); p.completed = p.completed || []; p.ranks = p.ranks || {};
  mainConquestMaps().slice(0, 8).forEach(m=> m.nodes.forEach(n=>{ if(m.id === 'mu' && n.key === '7-6') return; const id = conquestNodeId(m.id, n.key); if(!p.completed.includes(id)) p.completed.push(id); p.ranks[id] = 'A'; })); saveConquestProgress(p);
  const before = Object.keys(myCardCopies || {}).length;
  grantMapFreePack('mu', '7-6', true); grantFactionPack('otter', 1);
  return {q: packRevealQueue.map(b=> b.pack.id + ':' + b.o.results.length), before}; })()"""
BREAK = """(()=>{ const fp = packRevealQueue.filter(b=> b.pack.id === 'fp-otter'); const second = fp[fp.length - 1]; if(!second) return null;
  const bad = second.o.results[0].id; const orig = cardTileHTML; window.__ui2Bad = bad;
  window.cardTileHTML = (d, o)=>{ if(d && d.id === bad && document.getElementById('packOpenOverlay') && !document.getElementById('packOpenOverlay').hidden) throw new TypeError('ui2 test: this card face throws'); return orig(d, o); };
  second.o.results.push({id: 'ui2-no-such-card', isNew: true}); return {bad, n: second.o.results.length}; })()"""

async def test_pack(b, url):
    print('-- R2 pack opener')
    # 1. the real flow: the Morel Hollow boss's first clear + a second Rivergate Pack, card by card
    pg = await page(b, url, 1366, 768)
    g = await pg.evaluate(GRANT); print('   queued', g['q'])
    ok(sum(1 for x in g['q'] if x.startswith('fp-otter')) == 2 and len(g['q']) >= 3, 'the boss clear queues its packs, two Rivergate Packs among them')
    await pg.wait_for_timeout(150)
    pop = await pg.evaluate("(()=>{ const w = document.querySelector('#packOpenOverlay .ui2-popin'); return w ? getComputedStyle(w).animationName : null; })()")
    ok(pop == 'ui2PackPop', f'the first pack pops in (.ui2-popin, {pop})')
    files = []
    for i in range(6):
        f = os.path.join(OUT, f'ui2-_pop-{i}.png'); await pg.screenshot(path=f, clip={'x': 383, 'y': 60, 'width': 600, 'height': 640}); files.append(f); await pg.wait_for_timeout(90)
    sheet(files, 'pack-popin-1366', cols=6, scale=.4)
    seen = await drive(pg, ['poStrip', 'poNext', 'poNextSet', 'poSession', 'poDone'])
    counts = [s['count'] for s in seen]
    ok(any('po2-summary' in s['cls'] and s['count'] == 'Pack 2 of 2' and 'Rivergate' in s['name'] for s in seen), 'the 2nd Rivergate Pack is opened to its summary')
    ok(not await pg.evaluate(OV) and await pg.evaluate("packRevealQueue.length === 0 && !packRevealInFlight"), 'the opener closes and the queue is empty')
    await close(pg)
    # 2. one card of the 2nd Rivergate Pack throws when drawn and one result id is unknown: card by card still finishes
    pg = await page(b, url, 1366, 768)
    await pg.evaluate("(()=>{ window.__hold = true; const o = schedulePackReveals; window.schedulePackReveals = function(){ if(window.__hold) return; return o.apply(this, arguments); }; })()")
    g = await pg.evaluate(GRANT); br = await pg.evaluate(BREAK); ok(br and br['n'] == 4, f'test set-up: a throwing card and an unknown id in the 2nd Rivergate Pack {br}')
    await pg.evaluate("(()=>{ window.__hold = false; schedulePackReveals(); })()")
    log = []; seen = await drive(pg, ['poStrip', 'poNext', 'poNextSet', 'poSession', 'poDone'], log=log)
    p2 = [s for s in seen if s['count'] == 'Pack 2 of 2' and 'Rivergate' in s['name']]
    ok(any('po2-summary' in s['cls'] for s in p2), 'card by card: the broken pack still reaches its summary')
    ok(any(s['fallback'] >= 1 for s in p2), 'the card that cannot be drawn shows as a fallback tile')
    ok(not await pg.evaluate(OV) and await pg.evaluate("packRevealQueue.length === 0 && !packRevealInFlight"), 'card by card: the opener closes, the queue is empty')
    owned = await pg.evaluate("(()=>{ const bad = window.__ui2Bad; return !!(myUnlockedCardIds.has(bad) || (myCardCopies[bad] || []).length); })()")
    ok(owned, 'the card that could not be drawn is owned (it was credited before the opener)')
    errs = [e for e in pg._errs if 'ui2 test' not in e]; ok(not errs, f'no page errors {errs[:2]}'); await pg._ctx.close()
    # 3. Skip on the broken pack, then Open all, then Done
    pg = await page(b, url, 1366, 768)
    await pg.evaluate("(()=>{ window.__hold = true; const o = schedulePackReveals; window.schedulePackReveals = function(){ if(window.__hold) return; return o.apply(this, arguments); }; })()")
    g = await pg.evaluate(GRANT); br = await pg.evaluate(BREAK)
    await pg.evaluate("(()=>{ window.__hold = false; schedulePackReveals(); })()")
    # first set (the Tidemire Chests) with Open all, then the Rivergate set: pack 1 Next, pack 2 tear then Skip
    log = []; stage = {'skip': False, 'all': False}
    for step in range(90):
        await pg.wait_for_timeout(260)
        st = await pg.evaluate(OV)
        if not st:
            if step > 10 and not await pg.evaluate("packRevealQueue.length || packRevealInFlight"): break
            continue
        log.append(st)
        if st['count'] == 'Pack 2 of 2' and 'Rivergate' in st['name'] and 'poSkip' in st['ids'] and not stage['skip'] and 'po2-reveal' not in st['cls']:
            await pg.evaluate(CLICK, 'poSkip')  # Skip before tearing: the summary draws every card, the throwing one too
            stage['skip'] = True; await pg.wait_for_timeout(500)
            st3 = await pg.evaluate(OV); log.append(st3)
            ok(st3 and 'po2-summary' in st3['cls'] and st3['fallback'] >= 1, f'Skip on the broken pack shows its summary, the bad card as a fallback tile ({st3 and (st3["cls"], st3["fallback"])})')
            if st3 and 'poOpenAll' in st3['ids']: await pg.evaluate(CLICK, 'poOpenAll'); stage['all'] = True
            await pg.wait_for_timeout(500); st4 = await pg.evaluate(OV)
            ok(st4 and 'po2-all' in st4['cls'], 'Open all on the broken set shows the bundle page')
            await shot(pg, 'pack-broken-openall-1366')
            continue
        for k in ['poStrip', 'poNext', 'poNextSet', 'poSession', 'poDone']:
            if k in st['ids']: await pg.evaluate(CLICK, k); break
        else: await pg.evaluate(CARD)
    ok(stage['skip'] and stage['all'], 'the Skip / Open all path ran')
    ok(not await pg.evaluate(OV) and await pg.evaluate("packRevealQueue.length === 0 && !packRevealInFlight"), 'Skip / Open all: the opener closes, the queue is empty')
    errs = [e for e in pg._errs if 'ui2 test' not in e]; ok(not errs, f'no page errors {errs[:2]}'); await pg._ctx.close()
    # 4. reduced motion: no pop
    pg = await page(b, url, 1366, 768, reduce=True)
    await pg.evaluate(GRANT); await pg.wait_for_timeout(500)
    ok(not await pg.evaluate("!!document.querySelector('#packOpenOverlay .ui2-popin')"), 'reduced motion: no pop-in')
    await close(pg)

ZPROBE = """(()=>{ const bf = document.querySelector('.battlefield').getBoundingClientRect(), row = document.getElementById('rowMine');
  const cards = [...document.querySelectorAll('#rowMine .board-card[data-uid], #rowEnemy .board-card[data-uid]')].map(e=> e.getBoundingClientRect());
  const cs = getComputedStyle(row);
  return {scale: +battlefieldScale.toFixed(3), cw: +cards[0].width.toFixed(1), n: document.querySelectorAll('#rowMine .board-card[data-uid]').length, gap: parseFloat(cs.columnGap || cs.gap) || 0,
    rowW: row.clientWidth - (parseFloat(cs.paddingLeft)||0) - (parseFloat(cs.paddingRight)||0), inside: cards.every(c=> c.left >= bf.left - 1 && c.right <= bf.right + 1), phone: mb2IsPhone()}; })()"""
STAGE = """(async(n)=>{ const m = matchState, e = m.engine, lo = -Math.floor(n/2);
  for(const pl of [m.players[1], m.players[2]]){ pl.row.left = []; pl.row.center = []; pl.row.right = [];
    for(let i = 0; i < n; i++){ const c = e.makeBoardCard('otter-kit'); c.hp = c.maxHp = 30; c.slot = lo + i; c._seenAt = c.slot; (c.slot === 0 ? pl.row.center : c.slot < 0 ? pl.row.left : pl.row.right).push(c); }
    pl.row.left.sort((a, b)=> b.slot - a.slot); pl.row.right.sort((a, b)=> a.slot - b.slot); e.syncSlots(pl); }
  renderMatchUI(); await new Promise(r=> setTimeout(r, 1100)); })"""
ZSIZES = [(1366, 768), (1920, 1080), (820, 1180), (1180, 820), (390, 844)]
FIGHT = "(async()=>{ adminModeEnabled = true; switchTab('play'); startConquestMatch('m1', '0-2', {skipEnergyCost:true, noOpener:true}); await new Promise(r=> setTimeout(r, 2600)); })()"

async def test_zoom(b, url):
    print('-- R1 board zoom')
    for (w, h) in ZSIZES:
        pg = await page(b, url, w, h); await pg.evaluate(FIGHT)
        full = None
        for n in (5, 7, 9, 12):
            await pg.evaluate(STAGE, n); await pg.evaluate('fitBattlefieldZoomNow(true)'); await pg.wait_for_timeout(800); r = await pg.evaluate(ZPROBE)
            if full is None: full = r['cw']
            need = n * full + (n - 1) * r['gap']
            fits = need <= r['rowW'] + 1
            tag = f'{w}x{h} {n} units (card {r["cw"]}px, full {full}px, row {round(r["rowW"])}px, scale {r["scale"]})'
            nU = n if n % 2 else n + 1  # the units' columns, centred on the middle one
            if r['phone']: ok(r['inside'] and r['cw'] >= min(full, (r['rowW'] - (nU - 1) * r['gap']) / nU) - 1.5, 'phone: ' + tag + ': as big as the units\' columns allow (not the spare edge columns), all inside the field')
            else:
                ok(r['scale'] == 1, 'no zoom-out: ' + tag)
                ok(r['cw'] >= full - 1 if fits else r['cw'] < full, ('kept full size: ' if fits else 'shrinks only past the edge: ') + tag)
                ok(r['inside'], 'every unit inside the field: ' + tag)
            if n in (7, 9, 12): await shot(pg, f'zoom-{w}x{h}-{n}')
        await close(pg)

AMB = """(async()=>{ const m = matchState, e = m.engine; for(const pid of [1,2]){ const pl = m.players[pid]; pl.row.left = []; pl.row.center = []; pl.row.right = []; }
  const a = e.makeBoardCard('tunnel-ant'); a.slot = 0; a._seenAt = 0; a.hp = a.maxHp = 20; m.players[2].row.center.push(a); e.syncSlots(m.players[2]);
  const b = e.makeBoardCard('otter-kit'); b.slot = 1; b._seenAt = 1; b.hp = b.maxHp = 20; m.players[1].row.right.push(b); e.syncSlots(m.players[1]);
  m.players[1].lumber = 9; m.players[1].hand = [{uid: 880001, defId: 'meadow-rabbit'}]; m.resolving = false; m.replayCards = null; m.speedMult = 0.5; renderMatchUI(); await new Promise(r=> setTimeout(r, 1200));
  window.__amb = {ev: [], seen: false, moved: 0, uid: a.uid}; const o = renderVfxForEvent;
  window.renderVfxForEvent = function(ev){ try{ window.__amb.ev.push(ev.type + (ev.ambush ? '+' : '')); }catch(_){} return o.apply(this, arguments); };
  const t0 = performance.now(); const tick = ()=>{ const el = document.querySelector('.board-card[data-uid="9"], .board-card[data-defid="meadow-rabbit"]'); if(el) window.__amb.seen = true;
    const at = document.querySelector('.board-card[data-uid="' + a.uid + '"] .card-tile'); if(at){ const t = getComputedStyle(at).transform; if(t && t !== 'none'){ const mm = new DOMMatrix(t); window.__amb.moved = Math.max(window.__amb.moved, Math.abs(mm.m42)); } }
    if(performance.now() - t0 < 6000) requestAnimationFrame(tick); }; tick();
  playCardByUid(880001, 0); return a.uid; })()"""

async def test_ambush(b, url):
    print('-- R3 Ambush')
    pg = await page(b, url, 1366, 768, touch=False); await pg.evaluate(FIGHT)
    await pg.evaluate(AMB)
    files = []
    for i in range(10):
        await pg.wait_for_timeout(120); f = os.path.join(OUT, f'ui2-_amb-{i}.png'); await pg.screenshot(path=f, clip={'x': 420, 'y': 190, 'width': 520, 'height': 400}); files.append(f)
    await pg.wait_for_timeout(4000)
    r = await pg.evaluate("window.__amb")
    sheet(files, 'ambush-1366', cols=5, scale=.5)
    print('   events', r['ev'][:8], 'jab px', r['moved'])
    ev = r['ev']
    ok('ambush' in ev and 'hit+' in ev and 'death' in ev and ev.index('play') < ev.index('ambush') < ev.index('hit+') < ev.index('death'), 'the play comes first, then the Ambush, its strike, the death')
    ok(r['seen'], 'the card played into the Ambush is drawn before it dies (it used to vanish)')
    ok(2 <= r['moved'] < 12, f'the ambusher jabs: a short move ({round(r["moved"], 1)} px; the normal lunge goes 15)')
    await close(pg)

async def test_energy(b, url):
    print('-- R5 Energy capsule')
    for reduce in (False, True):
        pg = await page(b, url, 1366, 768, reduce=reduce, touch=False)
        await pg.evaluate("(()=>{ addEnergyCapsules(2); saveEnergyState({current: 10, lastRegenAt: Date.now()}); switchTab('play'); refreshEnergyHud(); })()"); await pg.wait_for_timeout(800)
        await pg.evaluate("(()=>{ const p = ui2EnergyPill(); window.__e0 = settleEnergy().current; window.__pulse = 0; window.__zaps = 0; new MutationObserver(()=>{ if(p.classList.contains('ui2-energy-pulse')) window.__pulse++; window.__zaps = Math.max(window.__zaps, document.querySelectorAll('.ui2-zap').length); }).observe(document.body, {subtree:true, childList:true, attributes:true, attributeFilter:['class']}); openEnergyPanel(p); })()")
        await pg.wait_for_timeout(300)
        await pg.evaluate("document.getElementById('epCapsule').click()")
        if not reduce:
            await pg.wait_for_timeout(380); await shot(pg, 'energy-sparks-1366', clip={'x': 0, 'y': 0, 'width': 1366, 'height': 420})
        await pg.wait_for_timeout(1600)
        r = await pg.evaluate("({zaps: window.__zaps, pulse: window.__pulse, gain: settleEnergy().current - window.__e0, left: document.querySelectorAll('.ui2-zap').length})")
        tag = 'reduced motion' if reduce else 'normal'
        ok(r['gain'] == 8, f'{tag}: Energy +8 ({r["gain"]})')
        ok((r['zaps'] >= 3) if not reduce else (r['zaps'] == 0), f'{tag}: sparks {r["zaps"]}')
        ok(r['pulse'] >= 1 and r['left'] == 0, f'{tag}: the pill pulses ({r["pulse"]}), no spark left behind')
        await close(pg)

async def test_pitch(b, url):
    print('-- R7 Shift+click pitch')
    pg = await page(b, url, 1366, 768, touch=False); await pg.evaluate(FIGHT)
    await pg.evaluate("(async()=>{ const m = matchState; m.players[1].hand = [{uid: 880011, defId: 'otter-kit'}, {uid: 880012, defId: 'meadow-rabbit'}]; m.players[1].discardUsedThisTurn = false; m.resolving = false; renderMatchUI(); await new Promise(r=> setTimeout(r, 700)); })()")
    ok(await pg.evaluate("pitchAllowedIn(matchState)"), 'pitching is open in this fight (admin)')
    tip = await pg.evaluate("(document.getElementById('dropDiscard') || {}).title || ''"); ok('Shift+click' in tip, f'the Graveyard tooltip names the shortcut ({tip[-60:]})')
    before = await pg.evaluate("({hand: matchState.players[1].hand.length, grave: (matchState.players[1].graveyard || matchState.players[1].discard || []).length})")
    await pg.click('#handStrip [data-handuid="880012"]', modifiers=['Shift']); await pg.wait_for_timeout(1500)
    after = await pg.evaluate("({hand: matchState.players[1].hand.length, has: matchState.players[1].hand.some(c=> c.uid === 880012), used: !!matchState.players[1].discardUsedThisTurn, sel: matchState.selectedUid})")
    ok(not after['has'] and after['hand'] == before['hand'] - 1 and after['used'], f'Shift+click pitched the card {after}')
    await pg.click('#handStrip [data-handuid="880011"]'); await pg.wait_for_timeout(300)
    ok(await pg.evaluate("matchState.selectedUid === 880011 && matchState.players[1].hand.length === 1"), 'a plain click still arms the card')
    await close(pg)

async def test_pro(b, url):
    print('-- R8 PRO / BPRO deck preview')
    pg = await page(b, url, 1366, 860, touch=False)
    keys = await pg.evaluate("(()=>{ adminModeEnabled = true; const out = []; Object.keys(proMapEntries()).forEach(id=> proEntriesOf(proMapEntries()[id]).forEach(e=>{ const f = findProFight(e.id); if(f) out.push({key: e.id, n: mapNumberOf(f.map.id)}); })); return out; })()")
    pick = [k for k in keys if (k['n'] or 0) >= 6]
    ok(len(pick) > 0, f'PRO / BPRO fights on Map 6+ exist ({len(pick)})')
    done = 0
    for k in [p for p in pick if 'BPRO' not in p['key']][:1] + [p for p in pick if 'BPRO' in p['key']][:1]:
        r = await pg.evaluate("(async(key)=>{ const f = findProFight(key); const p = loadConquestProgress(); const was = p.ranks[conquestNodeId(f.map.id, f.node.key)];"
                              " pl2ProPreview(key); await new Promise(r=> setTimeout(r, 1600)); return {rank: was || null, revealed: conquestDeckRevealed(f.map, f.node, p), strip: document.querySelectorAll('.cnp-sq-card').length}; })", k['key'])
        ok(r['revealed'] and r['strip'] > 0 and not r['rank'], f'{k["key"]} (Map {k["n"]}): deck strip shown with no clear ({r})')
        await shot(pg, 'pro-preview-' + k['key'].replace('/', '-')); done += 1
    ok(done >= 1, 'a PRO panel was checked')
    await close(pg)

async def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--keep', action='store_true'); ap.add_argument('--only', default='')
    ap.add_argument('--sizes', default=''); a = ap.parse_args(); only = set(x for x in a.only.split(',') if x)
    global ZSIZES
    if a.sizes: ZSIZES = [tuple(map(int, x.split('x'))) for x in a.sizes.split(',')]
    httpd = serve(); url = f'http://127.0.0.1:{httpd.server_address[1]}/index.html'
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME)
        for name, fn in [('pack', test_pack), ('zoom', test_zoom), ('ambush', test_ambush), ('energy', test_energy), ('pitch', test_pitch), ('pro', test_pro)]:
            if only and name not in only: continue
            try: await fn(b, url)
            except Exception as e: ok(False, f'{name}: {type(e).__name__}: {str(e)[:300]}')
        await b.close()
    httpd.shutdown()
    if a.keep:
        from PIL import Image
        os.makedirs(KEEP, exist_ok=True)
        for f in shots:
            if os.path.exists(f): Image.open(f).convert('RGB').save(os.path.join(KEEP, os.path.basename(f).replace('.png', '.jpg')), quality=80)
    print('shots:', len(shots))
    print('all passed' if not fails else f'{len(fails)} FAILED')
    sys.exit(1 if fails else 0)

asyncio.run(main())
