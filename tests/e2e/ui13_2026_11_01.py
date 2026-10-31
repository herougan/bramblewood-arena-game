#!/usr/bin/env python3
"""Package UI13 (2026-11-01, owner HH1, HH3, HH4, HH7): browser checks, shots in tests/e2e/shots/ui13/.
    python3 tests/e2e/ui13_2026_11_01.py [--page index.html] [--width 1366,390] [--only hh7,hh1,hh3,hh4]
HH7  Map cards gallery: an "Unlikely" pill on the flagged chosen tiles (its tooltip = flagWhy) and a second count with the Unlikely cards left out.
HH1  Baby cards: a Baby pill instead of Unique / Carried, out of the X/N, Y/M numbers; a "Baby cards" panel with the egg cards the map's fights drop;
     the kind chip in the card detail (Base / Baby / Faction) and the Kind field in the card editor.
HH3  a ✏️ on a gallery tile opens the card editor (the gallery hides), Save goes through the editor, the tile is drawn again (new stats, Baby pill).
HH4  Caves & Alcoves: a torch bracket beside a fire pit, disabled while the pit is cold, clickable once lit; a click gives the Torch card once per save.
Build first. Exits 1 on a failed check."""
import argparse, asyncio, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vis5_2026_10_28 as W
from playwright.async_api import async_playwright
V = W.V
ROOT = V.ROOT
SHOTS = os.path.join(ROOT, 'tests', 'e2e', 'shots', 'ui13'); os.makedirs(SHOTS, exist_ok=True)
fails = []
def ok(c, m):
    print(('  ok  ' if c else '  FAIL ') + m, flush=True)
    if not c: fails.append(m)
async def done(pg):
    ok(not pg._errs, f'no page errors {pg._errs[:2]}'); await pg._ctx.close()
def shot(name, w): return os.path.join(SHOTS, f'{name}-{w}.png')
NOTOAST = '.toast, .toast-host{display:none !important;}'

# ---------------------------------------------------------------- HH7
async def hh7(b, url, w):
    print(f'-- HH7: Unlikely pills and counts ({w})')
    pg = await W.fresh(b, url, w)
    await pg.evaluate("(()=>{ adminModeEnabled = true; pk1OpenMapCards('mu'); })()"); await pg.wait_for_timeout(700)
    r = await pg.evaluate("""(()=>{ const ov = document.getElementById('pk1MapCardsOverlay'), R = MAP_REVIEW.maps.mu, want = (R.chosen || []).filter(e=> e.flag === 'unlikely');
      const pills = [...ov.querySelectorAll('.rv1-tile.is-chosen .rv2-pill.is-unlikely')].map(p=> ({id: p.closest('.rv1-tile').dataset.rvId, tip: p.title, txt: p.textContent}));
      return {want: want.map(e=> ({id: e.id, why: e.flagWhy})), pills, others: ov.querySelectorAll('.rv1-tile:not(.is-chosen) .rv2-pill.is-unlikely').length, count: ov.querySelector('.rv2-cl').textContent}; })()""")
    ok(len(r['want']) >= 1 and sorted(p['id'] for p in r['pills']) == sorted(x['id'] for x in r['want']), f'one Unlikely pill per flagged chosen card {[p["id"] for p in r["pills"]]}')
    ok(all(p['txt'] == 'Unlikely' and p['tip'] == next(x['why'] for x in r['want'] if x['id'] == p['id']) for p in r['pills']), 'the pill reads Unlikely and its tooltip is the flagWhy')
    ok('without Unlikely:' in r['count'], f'the count line adds the numbers without the Unlikely cards {r["count"]!r}')
    # flipping an Unlikely card to Cut takes it out of both counts; the second count disappears when no Unlikely card is left in
    r2 = await pg.evaluate("""(()=>{ const ov = document.getElementById('pk1MapCardsOverlay'); ov.querySelectorAll('.rv1-tile.is-chosen.is-unlikely:not(.is-flipped) .rv1-act').forEach(b=> b.click());
      const t = ov.querySelector('.rv2-cl').textContent; ov.querySelectorAll('.rv1-tile.is-chosen.is-unlikely.is-flipped .rv1-act').forEach(b=> b.click()); return t; })()""")
    ok('without Unlikely' not in r2, f'with every Unlikely card cut there is one count again {r2!r}')
    await pg.evaluate("document.querySelector('#pk1MapCardsOverlay .rv1-tile.is-unlikely').scrollIntoView({block:'center'})"); await pg.wait_for_timeout(300)
    await pg.add_style_tag(content=NOTOAST); await pg.screenshot(path=shot('hh7-unlikely', w))
    await done(pg)

# ---------------------------------------------------------------- HH1
async def hh1(b, url, w):
    print(f'-- HH1: Baby cards ({w})')
    pg = await W.fresh(b, url, w)
    await pg.evaluate("(()=>{ adminModeEnabled = true; pk1OpenMapCards('mw'); })()"); await pg.wait_for_timeout(700)
    r = await pg.evaluate("""(()=>{ const ov = document.getElementById('pk1MapCardsOverlay'), d = getCardDefs();
      const babies = [...ov.querySelectorAll('.rv1-tile[data-rv-baby="1"]:not(.is-egg)')].map(t=> ({id: t.dataset.rvId, pills: [...t.querySelectorAll('.rv2-pill')].map(p=> p.textContent)}));
      const eggs = [...ov.querySelectorAll('.ui13-baby-sec .rv1-tile.is-egg')].map(t=> ({id: t.dataset.rvId, why: t.querySelector('.vis4-mc-card').dataset.zoomWhy}));
      return {babies, eggs, kinds: babies.map(x=> d[x.id].kind), count: ov.querySelector('.rv2-cl').textContent, expectEggs: ui13MapEggs('mw').map(x=> x.id)}; })()""")
    ok(len(r['babies']) >= 2 and all(set(r['kinds']) == {'baby'} for _ in [0]), f'the hatchlings on Map 5\'s lists are Baby cards {[x["id"] for x in r["babies"]]}')
    ok(all('Baby' in x['pills'] and 'Unique' not in x['pills'] and 'Carried' not in x['pills'] for x in r['babies']), f'a Baby card shows Baby, not Unique / Carried {r["babies"][:2]}')
    ok(len(r['eggs']) >= 1 and sorted(x['id'] for x in r['eggs']) == sorted(r['expectEggs']), f'the Baby cards panel shows the eggs Map 5\'s fights drop {r["eggs"]}')
    ok(all(x['id'].startswith('egg-') and 'Drops from' in (x['why'] or '') for x in r['eggs']), 'each egg says which fights drop it')
    # the counts leave Baby cards out: X counts the chosen non-baby, non-carried tiles (Map 7: Compost Grub is a chosen Baby card there)
    await pg.evaluate("document.querySelector('#pk1MapCardsOverlay .ui13-baby-sec').scrollIntoView({block:'start'})"); await pg.wait_for_timeout(300)
    await pg.add_style_tag(content=NOTOAST); await pg.screenshot(path=shot('hh1-baby-panel', w))
    await pg.evaluate("(()=>{ document.getElementById('pk1McClose').click(); pk1OpenMapCards('mu'); })()"); await pg.wait_for_timeout(600)
    r2 = await pg.evaluate("""(()=>{ const sec = document.querySelector('#pk1MapCardsOverlay .pk1-mc-sec.has-rv1'), tiles = [...sec.querySelectorAll('.rv1-tile.is-chosen:not(.is-flipped)')];
      const nb = tiles.filter(t=> t.dataset.rvBaby !== '1'), x = nb.filter(t=> t.dataset.rvCarried !== '1').length, y = nb.length - x;
      return {x, y, all: tiles.length, count: document.querySelector('#pk1MapCardsOverlay .rv2-cl').textContent}; })()""")
    ok(r2['count'].split()[1].startswith(f"{r2['x']}/") and f", {r2['y']}/" in r2['count'] and r2['x'] + r2['y'] < r2['all'], f'X counts no Baby card: Compost Grub is chosen on Map 7, not counted ({r2})')
    await pg.evaluate("document.getElementById('pk1McClose').click()")
    # the card detail's kind chip, and the editor's Kind field
    r = await pg.evaluate("""(async()=>{ const W = ms=> new Promise(r=> setTimeout(r, ms)), out = {};
      for(const id of ['caiman-hatchling', 'otter-paddler', 'grass-viper']){ openCardDetail(id); await W(250); const c = document.querySelector('#cardDetailOverlay .cd-kind'); out[id] = c ? c.textContent.trim() : null; document.getElementById('cdCloseBtn').click(); await W(100); }
      openCardEditor('caiman-hatchling'); await W(300); const k = document.getElementById('fKind'); out.editor = k ? {v: k.value, opts: [...k.options].map(o=> o.textContent.trim())} : null; closeCardEditor();
      openCardEditor('otter-paddler'); await W(300); const k2 = document.getElementById('fKind'); out.editor2 = k2 ? [...k2.options].map(o=> o.textContent.trim()) : null; closeCardEditor();
      return out; })()""")
    ok((r['caiman-hatchling'] or '').endswith('Baby') and (r['otter-paddler'] or '').endswith('Faction') and (r['grass-viper'] or '').endswith('Base'), f'(the emoji may be an image) the card detail shows the kind beside the rarity {r}')
    ok(r['editor'] and r['editor']['v'] == 'baby' and r['editor2'] and r['editor2'][0].endswith('Faction'), f'the editor\'s Kind field: Baby set, Base / Faction from the faction {r.get("editor")}, {r.get("editor2")}')
    await pg.evaluate("openCardDetail('caiman-hatchling')"); await pg.wait_for_timeout(500)
    await pg.add_style_tag(content=NOTOAST); await pg.screenshot(path=shot('hh1-detail-kind', w))
    await done(pg)

# ---------------------------------------------------------------- HH3
async def hh3(b, url, w):
    print(f'-- HH3: edit a card from the gallery ({w})')
    pg = await W.fresh(b, url, w)
    await pg.evaluate("(()=>{ adminModeEnabled = true; pk1OpenMapCards('mu'); })()"); await pg.wait_for_timeout(700)
    ok(await pg.evaluate("[...document.querySelectorAll('#pk1MapCardsOverlay .rv1-tile:not(.is-egg)')].every(t=> t.querySelector('[data-ui13-edit]'))"), 'every list tile has a ✏️')
    await pg.evaluate("document.querySelector('#pk1MapCardsOverlay .rv1-tile[data-rv-id=\"garden-snail\"]').scrollIntoView({block:'center'})"); await pg.wait_for_timeout(200)
    await pg.add_style_tag(content=NOTOAST); await pg.screenshot(path=shot('hh3-tile-edit', w))
    await pg.click('#pk1MapCardsOverlay .rv1-tile[data-rv-id="garden-snail"] [data-ui13-edit]'); await pg.wait_for_timeout(500)
    r = await pg.evaluate("({hidden: document.getElementById('pk1MapCardsOverlay').hidden, editor: !document.getElementById('editorOverlay').hidden, name: (document.getElementById('fName')||{}).value})")
    ok(r['hidden'] and r['editor'] and r['name'] == 'Garden Snail', f'the card editor opens on that card, the gallery steps aside {r}')
    await pg.screenshot(path=shot('hh3-editor', w))
    count0 = await pg.evaluate("document.querySelector('#pk1MapCardsOverlay .rv2-cl').textContent")
    await pg.evaluate("(()=>{ document.getElementById('fAtk').value = '4'; document.getElementById('fKind').value = 'baby'; })()")
    await pg.click('#btnSave'); await pg.wait_for_timeout(1500)
    r = await pg.evaluate("""(()=>{ const ov = document.getElementById('pk1MapCardsOverlay'), t = ov.querySelector('.rv1-tile[data-rv-id="garden-snail"]'), d = getCardDefs()['garden-snail'];
      return {shown: !ov.hidden, editor: !document.getElementById('editorOverlay').hidden, atk: d.attack, kind: d.kind, live: !!liveCards['garden-snail'], baby: t && t.dataset.rvBaby, pills: t && [...t.querySelectorAll('.rv2-pill')].map(p=> p.textContent),
        face: t && t.querySelector('.card-tile') && t.querySelector('.card-tile').outerHTML.includes('garden-snail'), count: ov.querySelector('.rv2-cl').textContent}; })()""")
    ok(r['shown'] and not r['editor'], f'after Save the gallery is back {r}')
    ok(r['atk'] == 4 and r['kind'] == 'baby' and r['live'], f'the save went through the editor\'s path (liveCards) {r["atk"], r["kind"], r["live"]}')
    ok(r['baby'] == '1' and 'Baby' in (r['pills'] or []), f'the tile is drawn again (Baby pill) {r["pills"]}')
    ok(r['count'] != count0, f'and the counts follow ({count0!r} -> {r["count"]!r})')
    await pg.add_style_tag(content=NOTOAST); await pg.screenshot(path=shot('hh3-after-save', w))
    await done(pg)

# ---------------------------------------------------------------- HH4
REACH = """(()=>{ saveTutorial2Done(); saveTutorialDone(); const p = loadConquestProgress(); for(const m of mainConquestMaps()){ if(m.id === 'm4') break;
  m.nodes.forEach(n=>{ const id = conquestNodeId(m.id, n.key); if(!p.completed.includes(id)) p.completed.push(id); }); } saveConquestProgress(p); })()"""
OPEN = "(()=>{ conquestWorldView = false; conquestSelectedMap = 'm4'; conquestSelectedNodeKey = null; playSubTab = 'conquest'; switchTab('play'); })()"
TSTATE = """(()=>{ const cv = document.getElementById('conquestCanvas'), t = cv && cv.querySelector('.ui13-torch'); if(!t) return null; const r = t.getBoundingClientRect(), el = document.elementFromPoint(r.left + r.width/2, r.top + r.height/2);
  return {dis: t.disabled, lit: t.classList.contains('is-lit'), taken: t.classList.contains('is-taken'), tip: t.title, node: t.dataset.pitNode, x: r.left + r.width/2, y: r.top + r.height/2, onTop: !!el && t.contains(el), copies: (myCardCopies.torch || []).length}; })()"""
async def hh4(b, url, w):
    print(f'-- HH4: the Torch on Caves & Alcoves ({w})')
    pg = await W.fresh(b, url, w)
    await pg.evaluate(REACH); await pg.evaluate(OPEN); await pg.wait_for_timeout(3500)
    d = await pg.evaluate("(()=>{ const d = getCardDefs().torch; return d && {type: d.cardType, rarity: d.rarity, grant: d.equip && d.equip.grant, src: d.source, aw: d.awaitingSource, obtain: cardObtainableFrom(d), unatt: isUnattainable(d)}; })()")
    ok(d and d['type'] == 'equipment' and d['rarity'] == 'common' and d['grant'] == {'illuminate': True} and d['aw'] is True, f'the Torch card: common equipment granting Illuminate, awaitingSource {d}')
    ok(d and d['obtain'] == 'secret' and not d['unatt'], f'a secret card (obtainable, so the grant is not refused) {d and d["obtain"]}')
    s = await pg.evaluate(TSTATE)
    ok(s is not None and s['dis'] and not s['lit'] and 'too dark' in s['tip'], f'cold pit: the bracket is there, disabled and dark {s}')
    if s is None: await done(pg); return
    await pg.evaluate("(([x, y])=>{ const e = document.elementFromPoint(x, y); if(e) e.click(); })", [s['x'], s['y']]); await pg.wait_for_timeout(400)
    ok((await pg.evaluate(TSTATE))['copies'] == 0, 'a click on the cold bracket gives nothing')
    await pg.evaluate("(n=>{ const p = loadConquestProgress(); p.completed.push(conquestNodeId('m4', n)); saveConquestProgress(p); })", s['node'])
    await pg.evaluate(OPEN); await pg.wait_for_timeout(4500)
    s = await pg.evaluate(TSTATE)
    ok(s['lit'] and not s['dis'] and s['onTop'], f'once its fight is cleared the pit burns and the bracket is lit, clickable, not covered {s}')
    await pg.add_style_tag(content=NOTOAST)
    await pg.screenshot(path=shot('hh4-torch-lit', w), clip={'x': max(0, s['x'] - 160), 'y': max(0, s['y'] - 120), 'width': 320, 'height': 240})
    if w < 700: await pg.touchscreen.tap(s['x'], s['y'])
    else: await pg.mouse.click(s['x'], s['y'])
    await pg.wait_for_timeout(700)
    r = {'s': await pg.evaluate(TSTATE), **(await pg.evaluate("({flag: loadDialogueFlags()['torch:m4'], unlocked: myUnlockedCardIds.has('torch')})"))}
    ok(r['s']['copies'] == 1 and r['flag'] is True and r['unlocked'] and r['s']['taken'], f'the click gives the Torch (one copy, flag set) and empties the bracket {r}')
    await pg.wait_for_timeout(2000)
    await pg.evaluate("(([x, y])=>{ const e = document.elementFromPoint(x, y); if(e) e.click(); })", [s['x'], s['y']]); await pg.wait_for_timeout(600)
    await pg.evaluate(OPEN); await pg.wait_for_timeout(3500)
    s2 = await pg.evaluate(TSTATE)
    ok(s2['copies'] == 1 and s2['taken'], f'once per save: a second click or a revisit gives no second Torch {s2}')
    await pg.screenshot(path=shot('hh4-torch-taken', w), clip={'x': max(0, s['x'] - 160), 'y': max(0, s['y'] - 120), 'width': 320, 'height': 240})
    # putting the pit out (MAPFX1's tap) darkens the bracket again until it is relit
    await pg.evaluate("(()=>{ localStorage.setItem('bramblewood_dialogue_flags_v1', JSON.stringify(Object.assign(loadDialogueFlags(), {'torch:m4': false}))); })()")
    await pg.evaluate(OPEN); await pg.wait_for_timeout(3500)
    r = await pg.evaluate("""(async()=>{ const cv = document.getElementById('conquestCanvas'), t = cv.querySelector('.ui13-torch'), f = [...cv.querySelectorAll('.cave-fire')].find(x=> x.dataset.fireNode === t.dataset.pitNode && x.classList.contains('is-lit'));
      if(!f) return null; mfxFireToggle(f, cv); await new Promise(r=> setTimeout(r, 900)); const out = t.disabled; mfxFireToggle(f, cv); await new Promise(r=> setTimeout(r, 900)); return {outDisabled: out, relit: !t.disabled}; })()""")
    ok(r is not None and r['outDisabled'] and r['relit'], f'a pit put out disables the bracket, relit enables it {r}')
    await done(pg)

PARTS = {'hh7': hh7, 'hh1': hh1, 'hh3': hh3, 'hh4': hh4}

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
