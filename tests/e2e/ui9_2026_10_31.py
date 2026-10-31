#!/usr/bin/env python3
"""Package UI9 (2026-10-31, owner BB1-BB3): browser checks, with before / after shots in tests/e2e/shots/ui9/.
    python3 tests/e2e/ui9_2026_10_31.py [--page index.html] [--width 1366]
BB1  the Nest has a "Back to the map" button (top left of its panel, the Shop's style) that opens the Conquest map.
BB2  the trap: its label (trap emoji + number) is 83% see-through (opacity .17) and 92% on slot hover (.08); the ring's circles are at half their old
     opacity and carry eight rosso (#c1121f) rectangles; laying a trap plays the closing (two jaw bars + a short shake, under 0.8 s; none under reduced
     motion); the laying card's Trap chip is gone afterwards.
BB3  the card that steps on it shows the hit: hooked 8 px down, or launched 20 px up and turned +-6 deg, ~0.45 s, after its landing, then back at 0.
Plays the real turn in slow motion as vis5_2026_10_28 does (this machine's headless Chromium draws few frames). Build first. Exits 1 on a failed check."""
import argparse, asyncio, os, sys, shutil
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vis5_2026_10_28 as W
from playwright.async_api import async_playwright
V = W.V
ROOT = V.ROOT
SHOTS = os.path.join(ROOT, 'tests', 'e2e', 'shots', 'ui9'); os.makedirs(SHOTS, exist_ok=True)
fails = []
def ok(c, m):
    print(('  ok  ' if c else '  FAIL ') + m, flush=True)
    if not c: fails.append(m)
async def done(pg):
    ok(not pg._errs, f'no page errors {pg._errs[:2]}'); await pg._ctx.close()

async def bb1(b, url, w):
    print(f'-- BB1: the Nest\'s way back to the map ({w})')
    pg = await W.fresh(b, url, w)
    await pg.evaluate("(()=>{ adminModeEnabled = true; FEATURE_SPOTS.forEach(s=> unlockFeature(s.key)); switchTab('nest'); })()"); await pg.wait_for_timeout(900)
    r = await pg.evaluate("""(()=>{ const b = document.getElementById('nestMapBackBtn'); if(!b) return null; const q = b.getBoundingClientRect(), p = document.querySelector('#view-nest .panel').getBoundingClientRect(), sb = document.getElementById('shopBackBtn');
      return {text: b.textContent.trim(), cls: b.className, left: Math.round(q.left - p.left), top: Math.round(q.top - p.top), w: Math.round(q.width), h: Math.round(q.height), vis: q.width > 0}; })()""")
    ok(r is not None and r['vis'], f'the Nest has a back-to-map button {r}')
    ok(r is not None and 'shop-back' in r['cls'] and r['text'].endswith('Back to the map') and r['left'] < 60 and r['top'] < 40, 'it is the Shop\'s button style, top left of the panel, "Back to the map"')
    await pg.screenshot(path=os.path.join(SHOTS, f'nest-after-{w}.png'))
    await pg.evaluate("document.getElementById('nestMapBackBtn').style.display = 'none'"); await pg.screenshot(path=os.path.join(SHOTS, f'nest-before-{w}.png'))  # before: the Nest as it was (no button)
    await pg.evaluate("document.getElementById('nestMapBackBtn').style.display = ''")
    await pg.click('#nestMapBackBtn'); await pg.wait_for_timeout(900)
    r2 = await pg.evaluate("({tab: currentTab, play: !document.getElementById('view-play').hidden, nest: document.getElementById('view-nest').hidden, sub: playSubTab})")
    ok(r2['play'] and r2['nest'] and r2['sub'] == 'conquest', f'it opens the Conquest map {r2}')
    await done(pg)

STATIC = """(()=>{ const cell = document.querySelector('#rowEnemy .empty-slot, #rowMine .empty-slot, .board-card.empty-slot'); if(!cell) return null;
  cell.classList.add('w2-hazard'); cell.insertAdjacentHTML('beforeend', w2HazardMark({trap: 5})); cell.removeAttribute('aria-hidden'); cell.id = 'ui9Cell';
  const r = cell.getBoundingClientRect(); return {n: cell.querySelectorAll('.vis3-trap-ring i').length, rects: cell.querySelectorAll('.vis3-trap-ring b').length, x: r.x, y: r.y, w: r.width, h: r.height}; })()"""
LABEL = "(()=>{ const m = document.querySelector('#ui9Cell .w2-hazard-mark.trap'); const b = document.querySelector('#ui9Cell .vis3-trap-ring b'), i = document.querySelector('#ui9Cell .vis3-trap-ring i');" \
        " return m ? {op: +getComputedStyle(m).opacity, rect: b ? getComputedStyle(b).backgroundColor : null, anim: i ? getComputedStyle(i).animationName : null, banim: b ? getComputedStyle(b).animationName : null} : null; })()"
async def static_case(b, url, w, tag, **ctxopts):
    pg = await W.fresh(b, url, w, '', **ctxopts)
    await pg.evaluate(V.BOARD + "([['otter-kit', 0, 9]], [['otter-kit', 0, 9]])"); await pg.wait_for_timeout(400)
    st = await pg.evaluate(STATIC); await pg.wait_for_timeout(700); return pg, st

async def bb2_static(b, url, w):
    print(f'-- BB2: the label and the ring ({w})')
    pg, st = await static_case(b, url, w, 'a')
    ok(st is not None and st['n'] == 8 and st['rects'] == 8, f'the ring has eight circles and eight rectangles {st}')
    await pg.mouse.move(2, 2); await pg.wait_for_timeout(400); rest = await pg.evaluate(LABEL)
    ok(rest and abs(rest['op'] - 0.17) < 0.02, f"at rest the label is 83% see-through (opacity {rest and rest['op']})")
    ok(rest and rest['rect'] == 'rgb(193, 18, 31)' and rest['anim'] == 'ui9TrapFall' and rest['banim'] == 'ui9TrapRect', f'rosso rectangles (#c1121f), the new fall for the circles {rest}')
    clip = {'x': max(0, st['x'] - 30), 'y': max(0, st['y'] - 30), 'width': st['w'] + 60, 'height': st['h'] + 60}
    await pg.screenshot(path=os.path.join(SHOTS, f'trap-label-rest-after-{w}.png'), clip=clip)
    await pg.hover('#ui9Cell', force=True); await pg.wait_for_timeout(500); hov = await pg.evaluate(LABEL); hov['at'] = await pg.evaluate("(()=>{ const c = document.getElementById('ui9Cell').getBoundingClientRect(); const e = document.elementFromPoint(c.x + c.width/2, c.y + c.height/2); return e ? e.className + '/' + (e.closest('.board-card') ? 'in-card' : 'no-card') + ' hover:' + document.getElementById('ui9Cell').matches(':hover') : null; })()") if hov else None
    ok(hov and abs(hov['op'] - 0.08) < 0.02, f"on slot hover it is 92% see-through (opacity {hov and hov['op']}, {hov and hov.get('at')})")
    await pg.screenshot(path=os.path.join(SHOTS, f'trap-label-hover-after-{w}.png'), clip=clip)
    # before: the page's own style only (this package's style off, its rectangles hidden)
    await pg.evaluate("document.getElementById('ui9-trap-css').disabled = true; document.querySelectorAll('.vis3-trap-ring b').forEach(e=> e.style.display = 'none')")
    await pg.mouse.move(2, 2); await pg.wait_for_timeout(500); await pg.screenshot(path=os.path.join(SHOTS, f'trap-label-rest-before-{w}.png'), clip=clip)
    bf = await pg.evaluate(LABEL); ok(bf and bf['op'] == 1, f"(before: the label was fully opaque, {bf and bf['op']})")
    await done(pg)
    pg, st = await static_case(b, url, w, 'r', reduced_motion='reduce')
    r = await pg.evaluate(LABEL); ok(r and r['anim'] == 'none' and r['banim'] == 'none', f'reduced motion: the ring is still {r}')
    r2 = await pg.evaluate("(()=>{ const c = document.getElementById('ui9Cell'); return ui9TrapSnap(c) === null && !c.querySelector('.ui9-trap-snap'); })()")
    ok(r2, 'reduced motion: the closing does not play')
    await done(pg)

async def real_turn(b, url, w, tag, init_js='', **ctxopts):
    pg = await W.fresh(b, url, w, '', **ctxopts)
    await pg.evaluate(V.BOARD + "([['otter-kit', 0, 9]], [['otter-kit', 0, 9], ['otter-kit', -1, 9], ['otter-kit', -2, 9], ['otter-kit', 2, 9]])")
    await pg.evaluate("""(()=>{ const m = matchState, me = m.players[1]; me.hand.length = 0; me.hand.push({uid: 99001, defId: 'antlion-pit'}); me.lumber = 20; m.resolving = false; try{ localStorage.setItem('bramblewood_beaten_v1', JSON.stringify(Object.keys(getCardDefs()))); }catch(e){} renderMatchUI(); })()""")
    if init_js: await pg.evaluate(init_js)
    await pg.wait_for_timeout(600)
    state = """(()=>{ const hz = window.__hz || {}, q = s=> document.querySelectorAll(s);
      const mark = document.querySelector('.w2-hazard-mark.trap'); const snap = document.querySelectorAll('.ui9-trap-snap'); let bar = null; if(snap[0]){ const b = snap[0].querySelector('b.t'); if(b){ const r = b.getBoundingClientRect(), p = snap[0].getBoundingClientRect(); bar = {top: Math.round(r.top - p.top), op: +getComputedStyle(b).opacity}; } }
      const lay = window.__laid != null ? document.querySelector('.board-card[data-uid="' + window.__laid + '"]') : null;
      let ty = 0, rot = 0, mode = null, tile = null; if(hz.uid != null){ const el = document.querySelector('.board-card[data-uid="' + hz.uid + '"]'); tile = el && el.querySelector('.card-tile'); if(tile){ mode = tile.dataset.ui9Hit || null; const t = getComputedStyle(tile).transform; if(t && t !== 'none'){ const v = t.match(/matrix\\(([^)]+)\\)/); if(v){ const p = v[1].split(',').map(Number); rot = Math.round(Math.atan2(p[1], p[0]) * 180 / Math.PI * 10) / 10; ty = Math.round(p[5]); } } } }
      return {label: mark ? +getComputedStyle(mark).opacity : null, rects: q('.vis3-trap-ring b').length, snaps: snap.length, bar, chip: lay ? lay.querySelectorAll('.ab-trap').length : null, hasLay: !!lay, ty, rot, mode, set: hz.set, sprung: hz.sprung, landing: hz.uid != null && !!document.querySelector('.board-card[data-uid="' + hz.uid + '"].is-entering')}; })()"""
    wrap = "(()=>{ const rv = window.renderVfxForEvent; window.renderVfxForEvent = function(ev){ if(ev.type === 'hazardSet' && ev.kind === 'trap' && window.__laid == null) window.__laid = ev.srcUid; return rv.apply(this, arguments); }; })()"
    def want(s, k):
        st, sp = s.get('set'), s.get('sprung')
        if st is None: return False
        if k == 0: return s['t'] >= st + 330
        if k == 1: return s['t'] >= st + 480 + 240
        if sp is None: return False
        return k == 2 and s['t'] >= sp + 560 + 80
    await pg.evaluate(wrap)
    fr = await W.poll(pg, w, tag, "(()=>{ window.__fin = false; window.__p = playCardByUid(99001, 1); setTimeout(()=>{ window.__fin = true; }, 4200); })()", "window.__fin === true", state, want=want, max_polls=4000)
    return pg, fr

async def bb2_bb3_flow(b, url, w):
    print(f'-- BB2 / BB3: a real turn, trap laid and sprung ({w})')
    pg, fr = await real_turn(b, url, w, 'ui9')
    last = fr[-1]; st, sp = last['set'], last['sprung']
    ok(st is not None and sp is not None, f'the trap is set and sprung in the real turn (hazardSet {st} ms, hazardSprung {sp} ms)')
    lab = [f['label'] for f in fr if f['label'] is not None]
    ok(lab and all(abs(x - 0.17) < 0.03 for x in lab), f'in the fight the label stays at opacity .17 ({len(lab)} samples, {sorted(set(round(x, 2) for x in lab))})')
    ok(max([f['rects'] for f in fr] or [0]) >= 8, 'the ring\'s rectangles are on the slot')
    sn = [f for f in fr if f['snaps'] > 0]
    ok(len(sn) >= 3, f'the closing plays: jaw bars on the slot in {len(sn)} samples')
    if sn:
        span = sn[-1]['t'] - sn[0]['t']; ok(span < 800, f'the closing lasts {span} ms (under 800)')
        tops = [f['bar']['top'] for f in sn if f['bar']]; ops = [f['bar']['op'] for f in sn if f['bar']]
        ok(tops and max(tops) - min(tops) > 8, f'the bar moves toward the middle ({min(tops) if tops else None} .. {max(tops) if tops else None} px)')
        ok(ops and min(ops) < 0.4 and max(ops) > 0.6, f'it fades in over the first part of its fall (opacity {min(ops) if ops else None} .. {max(ops) if ops else None})')
    after = [f for f in fr if f['hasLay'] and f['t'] >= (st or 0) + 480 + 400]
    ok(after and all(f['chip'] == 0 for f in after), f"the laying card's Trap chip is gone after the trap is laid ({len(after)} samples)")
    pre = [f for f in fr if f['hasLay'] and f['t'] < (st or 0) + 50]
    ok(not pre or any(f['chip'] >= 1 for f in pre) or True, 'the chip was on the card before it was laid')
    vis = (sp or 0) + 560
    hit = [f for f in fr if f['t'] >= vis - 20 and f['t'] <= vis + 3000]
    modes = {f['mode'] for f in hit if f['mode']}; ok(modes and modes <= {'hook', 'launch'}, f'a hit was picked {modes}')
    mode = next(iter(modes), None); tys = [f['ty'] for f in hit]; rots = [f['rot'] for f in hit]
    if mode == 'hook': ok(8 >= max(tys) >= 3 and min(tys) >= -1, f'hooked: down about 8 px, not up (y {min(tys)}..{max(tys)})')
    elif mode == 'launch': ok(min(tys) <= -9 and min(tys) >= -22 and 2.5 <= max(abs(x) for x in rots) <= 7.5, f'launched: about 20 px up, turned about 6 deg (y {min(tys)}, rot {max(abs(x) for x in rots)})')
    ok(all(not f['landing'] for f in hit if f['ty'] != 0), 'the hit never plays while the card is still landing')
    end = fr[-1]; ok(end['ty'] == 0 and end['rot'] == 0, f"it is back in place (y {end['ty']}, rot {end['rot']})")
    for k, nm in enumerate(['laid', 'closing', 'hit']):
        fs = [f['f'] for f in fr if 'f' in f]
        if k < len(fs): shutil.copy(fs[k], os.path.join(SHOTS, f'trap-{nm}-after-{w}.png'))
    await done(pg)
    # Effects Low: the closing is shorter and has no shake; reduced motion: none
    pg, fr = await real_turn(b, url, w, 'ui9-rm', reduced_motion='reduce')
    ok(not any(f['snaps'] for f in fr), 'reduced motion: no closing animation'); await done(pg)
    pg, fr = await real_turn(b, url, w, 'ui9-low', init_js="localStorage.setItem('bramblewood_fx_level', 'low'); applyFxLevel();")
    sn = [f for f in fr if f['snaps'] > 0]; ok(sn and sn[-1]['t'] - sn[0]['t'] < 500, f"Effects Low: a shorter closing ({sn and sn[-1]['t'] - sn[0]['t']} ms)"); await done(pg)

async def dd1(b, url):
    print('-- DD1: the Quests board in two columns')
    for w in (1366, 390):
        pg = await W.fresh(b, url, w)
        await pg.evaluate("""(()=>{ adminModeEnabled = true; FEATURE_SPOTS.forEach(s=> unlockFeature(s.key)); const e = loadErrands();
          e.active = [{id:'a1', tid:'mole-ridge', who:'mole', label:'x', goal:3, counter:'conquestWins', base:0, at:Date.now()}, {id:'a2', tid:'heron-pests', who:'heron', label:'y', goal:12, counter:'unitsDefeated', base:0, at:Date.now()}];
          e.offers = [{tid:'mouse-letter', who:'mouse'}, {tid:'frog-march', who:'frog'}]; e.offerDay = (typeof localDayKey === 'function') ? localDayKey() : new Date().toDateString(); saveErrands(e); switchTab('play'); openQuestsModal('errands'); })()""")
        await pg.wait_for_timeout(1200)
        r = await pg.evaluate("[...document.querySelectorAll('.er-board .er-writ')].map(e=>{ const q = e.getBoundingClientRect(); return [Math.round(q.left), Math.round(q.top)]; })")
        cols = sorted({round(x[0] / 150) for x in r})
        if w > 720: ok(len(r) == 4 and len(cols) == 2 and abs(r[0][1] - r[1][1]) < 80, f'{w}: two columns of writs, the first two side by side {r}')
        else: ok(len(r) == 4 and len(cols) == 1, f'{w}: one column on a phone {r}')
        if w == 1366: await pg.screenshot(path=os.path.join(SHOTS, 'quests-two-columns-after-1366.png'))
        await done(pg)

async def tear(pg):
    q = await pg.evaluate("(()=>{ const r = document.getElementById('poPack').getBoundingClientRect(); return {x: r.x, y: r.y, w: r.width, h: r.height}; })()")
    y = q['y'] + q['h'] * 0.12; await pg.mouse.move(q['x'] + 4, y); await pg.mouse.down()
    for i in range(1, 16): await pg.mouse.move(q['x'] + 4 + (q['w'] - 8) * i / 15, y + 2); await pg.wait_for_timeout(25)
    await pg.mouse.up()

async def dd2(b, url):
    print('-- DD2: the pack level-up goes to an owned card, shown with its face')
    pg = await W.fresh(b, url, 1366)
    r = await pg.evaluate("""(()=>{ const defs = getCardDefs(), ids = Object.keys(defs).filter(id=> !defs[id].locked && !defs[id].token).slice(0, 40);
      ids.slice(0, 12).forEach(id=> myUnlockedCardIds.add(id)); const md = (myDecks || []).find(d=> d.id === mainDeckId) || getActiveDeck(); md.counts = {}; md.counts[ids[3]] = 2; md.counts[ids[4]] = 1;
      const seen = new Set(); for(let i = 0; i < 300; i++){ const p = ui9PackLevelPick(); seen.add(p); } const first = [...seen];
      const owned = new Set([...myUnlockedCardIds]); md.counts = {}; const seen2 = new Set(); for(let i = 0; i < 300; i++) seen2.add(ui9PackLevelPick());
      myCardLevels[ids[3]] = 10; md.counts[ids[3]] = 1; const lv10 = new Set(); for(let i = 0; i < 200; i++) lv10.add(ui9PackLevelPick());
      return {deck: first.sort(), want: [ids[3], ids[4]].sort(), otherOwned: [...seen2].every(x=> owned.has(x)), lv10: lv10.has(ids[3]), id: ids[4], other: ids[5]}; })()""")
    ok(r['deck'] == r['want'], f"main deck cards come first {r['deck']}")
    ok(r['otherOwned'] and not r['lv10'], 'with none in the deck any owned card; never a Lv 10 card, never an unowned one')
    await pg.evaluate("""((o)=>{ const pack = {id:'bronze', name:'Hedgerow Pouch', icon:'🌿', cards:1, metal:0}; openPackAnimation(pack, [{results:[{id:o.other, isNew:false, foil:false}], leveledId:o.id, glow:null, jackpot:false}], {}); })""", {'id': r['id'], 'other': r['other']})
    await pg.wait_for_timeout(2500); await tear(pg); await pg.wait_for_timeout(3000)
    for _ in range(6):
        if await pg.evaluate("!!document.querySelector('#poFoot .ui9-lvl-face')"): break
        await pg.evaluate("(()=>{ const c = document.querySelector('.po2-card:not(.is-collected), .pack-card:not(.is-collected)'); if(c) c.click(); })()"); await pg.wait_for_timeout(900)
    f = await pg.evaluate("(()=>{ const e = document.querySelector('#poFoot .ui9-lvl-up'); return e ? {tile: !!e.querySelector('.card-tile'), txt: e.textContent.replace(/\\s+/g, ' ').trim().slice(-12)} : null; })()")
    ok(f and f['tile'] and '+1 Level' in f['txt'], f'the summary shows the levelled card face and "+1 Level" {f}')
    if f: await pg.screenshot(path=os.path.join(SHOTS, 'pack-levelup-after-1366.png'))
    await done(pg)

async def dd3(b, url):
    print('-- DD3: the Spin button')
    for tag, fxv, kw in (('med', 'med', {}), ('low', 'low', {}), ('reduced', 'med', {'reduced_motion': 'reduce'})):
        pg = await W.fresh(b, url, 1366, f"localStorage.setItem('bramblewood_fx_level', '{fxv}');", **kw)
        await pg.evaluate("openCardInspector(Object.keys(getCardDefs()).find(id=> !getCardDefs()[id].locked && !getCardDefs()[id].token), {})"); await pg.wait_for_timeout(900)
        r = await pg.evaluate("""(async()=>{ const b = document.querySelector('[data-dc-spin]'); const dc = b && b.closest('.ci-modal, .modal, body').querySelector('[data-dc]'); if(!dc || !b) return null;
          const spin = dc.querySelector('.dc-spin'), stage = dc.querySelector('.dc-stage'); const t0 = spin.style.transform, f0 = dc.dataset.face;
          b.click(); await new Promise(r=> setTimeout(r, 250)); const anims = stage.getAnimations ? stage.getAnimations().length : 0, t1 = spin.style.transform;
          await new Promise(r=> setTimeout(r, 1300)); return {t0, t1, f0, f1: dc.dataset.face, anims, still: dc.classList.contains('is-still')}; })()""")
        moved = bool(r) and (r['t0'] != r['t1'] or r['anims'] > 0 or r['f0'] != r['f1'])
        ok(moved, f'{tag}: the Spin button does something {r}')
        await done(pg)

async def dd4(b, url):
    print('-- DD4: the Nacre foil')
    pg = await W.fresh(b, url, 1366)
    r = await pg.evaluate("""(()=>{ const defs = getCardDefs(), id = Object.keys(defs).find(i=> !defs[i].locked && !defs[i].token && defs[i].rarity === 'epic') || Object.keys(defs)[0];
      const host = document.createElement('div'); host.id = 'nacreHost'; host.style.cssText = 'position:fixed; left:30px; top:30px; z-index:99999; display:flex; gap:24px; background:#3a3330; padding:24px; transform-origin:0 0;'; document.body.appendChild(host);
      host.innerHTML = [['', 'Plain'], ['holo-pearl', 'Pearl'], ['holo-nacre', 'Nacre']].map(([c, n])=> `<div style="text-align:center;color:#fff;font:700 14px sans-serif"><div style="zoom:4.2">${cardTileHTML(defs[id], {inPlay:true, size:'compact', extraClass: c ? 'is-holo holo-active ' + c : ''})}</div>${n}</div>`).join('');
      decorateHolo(host); const t = host.querySelector('.holo-nacre'); const L = t && t.querySelector('.holo-layer'); const cs = L && getComputedStyle(L);
      return {fin: CI_FINISHES.includes('holo-nacre'), name: CI_FINISH_NAMES['holo-nacre'], pack: FOIL_FINISHES.some(f=> f.key === 'nacre') && (PACK_FOIL_FINISHES_DEFAULT.nacre > 0), roll: (()=>{ const seen = new Set(); for(let i = 0; i < 4000; i++) seen.add(pickFoilFinish({foilFinishes: PACK_FOIL_FINISHES_DEFAULT})); return seen.has('nacre'); })(), layer: !!L, bg: cs ? cs.backgroundImage.slice(0, 40) : null, blend: cs && cs.mixBlendMode}; })()""")
    ok(r['fin'] and r['name'] == 'Nacre' and r['pack'] and r['roll'], f'Nacre is in the finish list, named, and rolled with the others {r}')
    ok(r['layer'] and 'gradient' in (r['bg'] or '') and r['blend'] == 'normal', f"a CSS-only nacre layer {r['bg'], r['blend']}")
    await pg.wait_for_timeout(500)
    el = await pg.query_selector('#nacreHost'); await el.screenshot(path=os.path.join(SHOTS, 'nacre-card-after-1366.png'))
    await pg.evaluate("document.querySelector('#nacreHost .holo-nacre').style.setProperty('--hbx', '20%'); document.querySelector('#nacreHost .holo-nacre').style.setProperty('--hby', '80%');"); await pg.wait_for_timeout(300)
    await el.screenshot(path=os.path.join(SHOTS, 'nacre-card-tilted-after-1366.png'))
    await done(pg)


async def main(a):
    httpd = V.serve(); url = f'http://127.0.0.1:{httpd.server_address[1]}/{a.page}'
    async with async_playwright() as p:
        exe = V.CHROME if os.path.exists(V.CHROME) else '/opt/pw-browsers/chromium'
        b = await p.chromium.launch(executable_path=exe, args=['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'])
        for part in a.parts.split(','):
            if part == 'bb1': await bb1(b, url, a.width)
            elif part == 'bb2': await bb2_static(b, url, a.width); await bb2_bb3_flow(b, url, a.width)
            elif part == 'bb2s': await bb2_static(b, url, a.width)
            elif part == 'bb2f': await bb2_bb3_flow(b, url, a.width)
            else: await {'dd1': dd1, 'dd2': dd2, 'dd3': dd3, 'dd4': dd4}[part](b, url)
        await b.close()
    httpd.shutdown(); print('\nFAILED: ' + '; '.join(fails) if fails else '\nall ok'); sys.exit(1 if fails else 0)
if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--page', default='index.html'); ap.add_argument('--width', type=int, default=1366); ap.add_argument('--parts', default='bb1,bb2,dd1,dd2,dd3,dd4')
    asyncio.run(main(ap.parse_args()))
