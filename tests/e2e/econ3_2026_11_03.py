#!/usr/bin/env python3
"""ECON3 (2026-11-03, owner 20:34: "ECON2-10 OK" and "When clicking swap (quest) - the paper falls away, revealing the 'previous quest'
underneath. (It's just a new roll)"). On the built index.html, at 1366 x 900 (and 390 x 844 for the chip):

1. Maps (ECON2-10). Every Conquest map (main and side; not the endless dungeons or the Spire) is drawn with every fight won and every
   feature open, and with the layout players get: the live `__cfg:map-layout:<mapId>` rows (a read-only copy in
   tests/fixtures/econ3-live-map-layout-2026-11-03.json; a published layout wins over a node's fixedPos) plus ECON3's moves
   (supabase/migrations/20261103_econ3_map_layout.json, the rows' new positions; APPLIED 2026-11-04, owner 22:34). Checks, from the DOM:
     - no tap target (fight, side-map entrance, exit, feature spot, curiosity, well, cave) overlaps the map's title chip or the top-right
       buttons (bounding boxes);
     - no two tap targets overlap each other, and none of the pairs the ECON2 review listed is closer than 7% of the canvas
       (docs/balance/econ2-maps-report-2026-11-03.json);
     - the first look at a map shows the whole panel, the next visit the chip; a tap opens the blurb, a second tap folds it.
2. The quest swap: the board shows the NEW roll in the slot while a copy of the old paper falls; a screenshot mid-fall.

  python3 tests/e2e/econ3_2026_11_03.py              the checks, after screenshots of the review's maps (docs/screens/econ3/after-*)
  python3 tests/e2e/econ3_2026_11_03.py --before     before screenshots only: full title panels, live rows without ECON3's moves
  python3 tests/e2e/econ3_2026_11_03.py --no-shots   checks only
  python3 tests/e2e/econ3_2026_11_03.py --swap-only  the quest swap only
  python3 tests/e2e/econ3_2026_11_03.py --live-only  the maps as live today (no proposed moves): reports, does not fail on them
"""
import asyncio, base64, functools, http.server, json, os, socketserver, sys, threading
from playwright.async_api import async_playwright
ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
EXE = os.environ.get('BW_CHROMIUM', '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell')
SHOTS = os.path.join(ROOT, 'docs', 'screens', 'econ3')
LIVE = json.load(open(os.path.join(ROOT, 'tests', 'fixtures', 'econ3-live-map-layout-2026-11-03.json')))['positions']
MOVES = json.load(open(os.path.join(ROOT, 'supabase', 'migrations', '20261103_econ3_map_layout.json')))['moves']
REPORT = json.load(open(os.path.join(ROOT, 'docs', 'balance', 'econ2-maps-report-2026-11-03.json')))['maps']
SWAP_ONLY = '--swap-only' in sys.argv; BEFORE = '--before' in sys.argv; NO_SHOTS = '--no-shots' in sys.argv; LIVE_ONLY = '--live-only' in sys.argv or BEFORE
SHOT_MAPS = ['mc', 'mw', 'm8', 'mu', 'm4', 'mk', 'mh', 'mr', 'm5', 'ml', 'mt', 'm6', 'm3', 'm11', 'm21', 'mf', 'm10', 'md', 'mq', 'mp', 'mz', 'mj', 'my']
CROWD = 7.0
INIT = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); sessionStorage.setItem('bramblewood_seen_splash','1');"
        "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying']));")
SETUP = """(()=>{
  try{ skipTriggerLesson(); }catch(e){}
  try{ localStorage.setItem('bramblewood_res3_level_track_v1', JSON.stringify({granted: 999})); }catch(e){}
  try{ FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); }catch(e){}
  const p = loadConquestProgress(); p.completed = p.completed || []; p.ranks = p.ranks || {};
  CONQUEST_MAPS.forEach(m=> (m.nodes||[]).forEach(n=>{ const id = conquestNodeId(m.id, n.key); if(!p.completed.includes(id)) p.completed.push(id); p.ranks[id] = 'S'; }));
  saveConquestProgress(p);
  try{ const f = loadDialogueFlags(); Object.keys(DIALOGUES).forEach(k=> f['seen:' + k] = 1); localStorage.setItem(DIALOGUE_FLAGS_KEY, JSON.stringify(f)); }catch(e){}
  return 1; })()"""
# the live layout rows, as applyCloudCfgRow reads them; then ECON3's moves on top (the proposed SQL's result)
APPLY = """([rows, moves, seenAll])=>{
  Object.keys(rows).forEach(id=> applyCloudCfgRow({id: '__cfg:map-layout:' + id, deleted: false, data: {kind: 'map-layout', mapId: id, positions: JSON.parse(JSON.stringify(rows[id]))}}));
  (moves || []).forEach(mv=>{ const o = mapLayoutOverrides[mv.map] || (mapLayoutOverrides[mv.map] = {}); o[mv.key] = Object.assign({}, o[mv.key] || {}, {x: mv.to.x, y: mv.to.y}); });
  if(typeof MAP_HEAD_SEEN_KEY !== 'undefined') localStorage.setItem(MAP_HEAD_SEEN_KEY, JSON.stringify(seenAll ? CONQUEST_MAPS.map(m=> m.id) : [])); // (an older build has no chip)
  return CONQUEST_MAPS.filter(m=> !m.reserved && !m.endless && !(m.nodes||[]).some(n=> n.tower) && !m.preview).map(m=> ({id: m.id, name: m.name, sub: !!m.sub, n: mapNumberOf(m.id)}));
}"""
SHOW = """(id)=>{
  document.querySelectorAll('.dialogue-wrap, .dlg, .modal-overlay, .coach-tip').forEach(e=>{ try{ e.remove(); }catch(_){} });
  conquestWorldView = false; playSubTab = 'conquest'; conquestSelectedMap = id; conquestSelectedNodeKey = null; try{ conquestSubZoom = null; }catch(e){}
  switchTab('play'); try{ renderPlay(); }catch(e){}
}"""
READ = """()=>{
  const c = document.getElementById('conquestCanvas'); if(!c) return null;
  const R = c.getBoundingClientRect(), out = [];
  const kindOf = k=>{ if(/\\bmap-node\\b/.test(k)) return 'fight'; if(/map-subcave|map-subemblem/.test(k)) return 'submap'; if(/map-subexit/.test(k)) return 'exit';
    if(/map-cave\\b/.test(k)) return 'cave'; if(/map-spot\\b/.test(k)) return 'feature'; if(/map-curio\\b/.test(k)) return 'curiosity'; if(/map-well\\b/.test(k)) return 'well'; return null; };
  c.querySelectorAll('[style*="left"]').forEach(el=>{ const k = typeof el.className === 'string' ? el.className : ''; const kind = kindOf(k); if(!kind) return;
    const r = el.getBoundingClientRect(); if(!r.width || !r.height) return; const cs = getComputedStyle(el); if(cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return;
    out.push({kind, key: el.dataset.lkey || el.dataset.nodekey || el.dataset.spot || el.dataset.curio || el.dataset.sub || '', l: r.left, t: r.top, r: r.right, b: r.bottom,
      x: ((r.left + r.width / 2) - R.left) / R.width * 100, y: ((r.top + r.height / 2) - R.top) / R.height * 100}); });
  const box = el=>{ if(!el) return null; const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); if(!r.width || cs.display === 'none' || +cs.opacity === 0) return null; return {l: r.left, t: r.top, r: r.right, b: r.bottom}; };
  const head = document.querySelector('.conquest-main > .conquest-headline');
  const panels = [['title', box(head)]].concat([...document.querySelectorAll('.conquest-world-btn, .conquest-home-btn, .conquest-fs-btn, .conquest-admin-btn')].map(b=> ['button', box(b)])).filter(p=> p[1]);
  return {w: R.width, h: R.height, objects: out, panels, chip: !!(head && head.classList.contains('is-chip')), canvas: {l: R.left, t: R.top, r: R.right, b: R.bottom}};
}"""

def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    h = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); threading.Thread(target=h.serve_forever, daemon=True).start(); return h

def inter(a, b, pad=0):
    return a['l'] < b['r'] - pad and b['l'] < a['r'] - pad and a['t'] < b['b'] - pad and b['t'] < a['b'] - pad

fails, notes = [], []
def ok(c, msg):
    print(('  OK   ' if c else '  FAIL ') + msg)
    if not c: fails.append(msg)

async def shot(pg, path, clip=None):
    cdp = await pg.context.new_cdp_session(pg)  # CDP's own capture: Playwright's waits on settled frames this animated page never gives
    p = {'format': 'jpeg', 'quality': 82}
    if clip: p['clip'] = dict(clip, scale=1)
    r = await cdp.send('Page.captureScreenshot', p); open(path, 'wb').write(base64.b64decode(r['data'])); await cdp.detach()

async def maps_pass(b, url, first=False):  # first: every map on its first look (the whole title panel), under-panel check only
    pg = await b.new_page(viewport={'width': 1366, 'height': 900}, reduced_motion='reduce'); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    await pg.route('**/*', lambda r: r.continue_() if r.request.url.startswith('http://127.0.0.1') else r.fulfill(status=200, body='', content_type='text/css'))
    await pg.add_init_script(INIT); await pg.goto(url, wait_until='domcontentloaded', timeout=120000); await pg.wait_for_timeout(4000)
    await pg.evaluate(SETUP); await pg.reload(wait_until='domcontentloaded', timeout=120000); await pg.wait_for_timeout(4000)
    await pg.add_style_tag(content='#dialogueDock{display:none !important}')
    maps = await pg.evaluate(APPLY, [LIVE, [] if LIVE_ONLY else MOVES, not BEFORE and not first])
    rep = {m['id']: m for m in REPORT}
    under, overlaps, crowd = [], [], []
    for m in maps:
        await pg.evaluate(SHOW, m['id']); await pg.wait_for_timeout(700)
        d = await pg.evaluate(READ)
        if not d: notes.append('no canvas ' + m['id']); continue
        objs = d['objects']
        for o in objs:
            for kind, p in d['panels']:
                if inter(o, p): under.append(f"{m['id']} ({m['name']}): {o['kind']} {o['key']} under the {kind}")
        for i in range(len(objs)):
            for j in range(i + 1, len(objs)):
                a, c = objs[i], objs[j]
                if inter(a, c, 2): overlaps.append(f"{m['id']} ({m['name']}): {a['kind']} {a['key']} overlaps {c['kind']} {c['key']}")
        # the review's crowded pairs: by key, at least CROWD % apart now (y scaled to the canvas's aspect)
        for dist, p1, p2 in (rep.get(m['id']) or {}).get('crowded', []):
            k1, k2 = p1.split(':', 1)[1], p2.split(':', 1)[1]
            def find(k):
                k = k.replace('~sub:', '').replace('~cur:', '').replace('~spot:', '')
                return next((o for o in objs if o['key'] == k or o['key'].endswith(k)), None)
            o1, o2 = find(k1), find(k2)
            if not o1 or not o2: notes.append(f"{m['id']}: pair {k1}/{k2} not found on the page"); continue
            dd = ((o1['x'] - o2['x']) ** 2 + ((o1['y'] - o2['y']) * d['h'] / d['w']) ** 2) ** .5
            if dd < CROWD: crowd.append(f"{m['id']} ({m['name']}): {k1} / {k2} {dd:.1f}% apart (review {dist})")
        if not NO_SHOTS and not first and m['id'] in SHOT_MAPS:
            os.makedirs(SHOTS, exist_ok=True); c = d['canvas']
            await shot(pg, os.path.join(SHOTS, f"{'before' if BEFORE else 'after'}-{m['n']:02d}{'s' if m['sub'] else ''}-{m['id']}.jpg"),
                       {'x': max(0, c['l']), 'y': max(0, c['t']), 'width': min(c['r'], 1366) - max(0, c['l']), 'height': min(c['b'], 900) - max(0, c['t'])})
    label = 'before (full panels, live rows)' if BEFORE else ('first looks (full panels)' if first else 'live rows only' if LIVE_ONLY else 'after (chip, live rows + ECON3 moves)')
    print(f"maps: {len(maps)} drawn, {label}")
    for x in under + overlaps + crowd: print('   ', x)
    if first and not LIVE_ONLY:
        ok(not under, f'1. first look: no tap target under the whole title panel or the top-right buttons ({len(under)})')
    elif BEFORE or LIVE_ONLY:
        print(f"  (report only) under a panel {len(under)}, overlapping pairs {len(overlaps)}, review pairs under {CROWD}% {len(crowd)}")
    else:
        ok(not under, f'1. no tap target under the title chip or the top-right buttons ({len(under)})')
        ok(not overlaps, f'1. no two tap targets overlap ({len(overlaps)})')
        ok(not crowd, f'1. the review\'s crowded pairs are {CROWD}% apart or more ({len(crowd)})')
    ok(not errs, '1. no page errors on the maps' + (': ' + errs[0] if errs else ''))
    await pg.close()

async def chip_pass(b, url, w, h):
    pg = await b.new_page(viewport={'width': w, 'height': h}, reduced_motion='reduce'); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    await pg.route('**/*', lambda r: r.continue_() if r.request.url.startswith('http://127.0.0.1') else r.fulfill(status=200, body='', content_type='text/css'))
    await pg.add_init_script(INIT); await pg.goto(url, wait_until='domcontentloaded', timeout=120000); await pg.wait_for_timeout(4000)
    await pg.evaluate(SETUP); await pg.reload(wait_until='domcontentloaded', timeout=120000); await pg.wait_for_timeout(3500)
    await pg.add_style_tag(content='#dialogueDock{display:none !important}')
    await pg.evaluate("()=> localStorage.setItem(MAP_HEAD_SEEN_KEY, '[]')")
    st = lambda: pg.evaluate("()=>{ const h = document.querySelector('.conquest-main > .conquest-headline'); if(!h) return null; const s = h.querySelector('.panel-sub'); return {chip: h.classList.contains('is-chip'), open: h.classList.contains('is-open'), blurb: !!(s && s.offsetHeight), w: Math.round(h.getBoundingClientRect().width), hh: Math.round(h.getBoundingClientRect().height)}; }")
    await pg.evaluate(SHOW, 'mc'); await pg.wait_for_timeout(600); a = await st()
    await pg.evaluate("()=>{ try{ renderPlay(); }catch(e){} }"); await pg.wait_for_timeout(400); a2 = await st()
    ok(a and not a['chip'] and a['blurb'] and a2 and not a2['chip'], f'1. {w}: the first look at a map shows the whole panel, re-renders too ({a}, {a2})')
    await pg.evaluate(SHOW, 'mw'); await pg.wait_for_timeout(400); await pg.evaluate(SHOW, 'mc'); await pg.wait_for_timeout(600); c = await st()
    ok(c and c['chip'] and not c['blurb'] and c['w'] < (a['w'] if a else 9999), f'1. {w}: the next visit folds it to a chip ({c})')
    if not NO_SHOTS: os.makedirs(SHOTS, exist_ok=True); await shot(pg, os.path.join(SHOTS, f'chip-{w}.jpg'))
    await pg.click('.conquest-headline .cqh-chip'); await pg.wait_for_timeout(300); o = await st()
    ok(o and o['open'] and o['blurb'], f'1. {w}: a tap on the chip opens the blurb ({o})')
    if not NO_SHOTS: await shot(pg, os.path.join(SHOTS, f'chip-open-{w}.jpg'))
    await pg.click('.conquest-headline .cqh-chip'); await pg.wait_for_timeout(300); f = await st()
    ok(f and f['chip'] and not f['open'] and not f['blurb'], f'1. {w}: a second tap folds it ({f})')
    ok(not errs, f'1. {w}: no page errors' + (': ' + errs[0] if errs else ''))
    await pg.close()

async def swap_pass(b, url):
    pg = await b.new_page(viewport={'width': 1366, 'height': 900}); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    await pg.route('**/*', lambda r: r.continue_() if r.request.url.startswith('http://127.0.0.1') else r.fulfill(status=200, body='', content_type='text/css'))
    await pg.add_init_script(INIT); await pg.goto(url, wait_until='domcontentloaded', timeout=120000); await pg.wait_for_timeout(4000)
    await pg.evaluate("()=>{ try{ skipTriggerLesson(); }catch(e){} document.querySelectorAll('.dialogue-wrap, .dlg, .coach-tip').forEach(e=> e.remove()); try{ localStorage.setItem(FX_LEVEL_KEY, 'high'); }catch(e){} openQuestsModal(); }")
    await pg.wait_for_timeout(1500)
    before = await pg.evaluate("()=>{ const b = document.querySelector('[data-swap-id]'); if(!b) return null; const n = b.closest('.qn-note'); const md = document.querySelector('.quests-modal'); md.scrollTop += n.getBoundingClientRect().top - md.getBoundingClientRect().top - 200; /* the modal's own scroll, which a redraw keeps */ return {id: b.dataset.swapId, label: n.querySelector('.qn-label').textContent.trim()}; }")
    ok(before is not None, f'2. a notice offers the free swap ({before})')
    if not before: await pg.close(); return
    # click, then hold every running animation at 45%: the old paper mid-fall over the new roll
    mid = await pg.evaluate("""()=>{ document.querySelector('[data-swap-id]').click();
      const g = document.querySelector('body > .qn-note.qn-ghost'); const an = g && g.getAnimations ? g.getAnimations() : [];
      an.forEach(a=>{ a.pause(); a.currentTime = ECON3_NOTE_FALL_MS * .45; });
      const slot = [...document.querySelectorAll('.qn-daily .qn-note')].map(n=> n.querySelector('.qn-label').textContent.trim());
      return {ghost: !!g, ghostLabel: g ? g.querySelector('.qn-label').textContent.trim() : null, anims: an.length, slot, z: g ? getComputedStyle(g).zIndex : null}; }""")
    ok(mid['ghost'] and mid['ghostLabel'] == before['label'] and mid['anims'] >= 1, f"2. the falling paper is the old notice ({mid['ghostLabel']})")
    ok(before['label'] not in mid['slot'] or mid['slot'].count(before['label']) < 1, f"2. underneath, the slot already holds the new roll (board: {mid['slot']})")
    if not NO_SHOTS: os.makedirs(SHOTS, exist_ok=True); await shot(pg, os.path.join(SHOTS, 'quest-swap-mid-fall.jpg'))
    await pg.evaluate("()=> document.querySelectorAll('body > .qn-ghost').forEach(g=> g.getAnimations().forEach(a=> a.finish()))"); await pg.wait_for_timeout(2000)
    gone = await pg.evaluate("()=> document.querySelectorAll('body > .qn-ghost').length")
    ok(gone == 0, '2. the paper is gone when the fall ends')
    used = await pg.evaluate("()=> !document.querySelector('[data-swap-id]') && loadQuestState().swapUsed")
    ok(used, '2. the free swap is used')
    ok(not errs, '2. no page errors' + (': ' + errs[0] if errs else ''))
    await pg.close()

async def main():
    h = serve(); url = f'http://127.0.0.1:{h.server_address[1]}/' + os.environ.get('BW_PAGE', 'index.html')  # BW_PAGE: another build in the root (the before shots)
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=EXE if os.path.exists(EXE) else None, args=['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'])
        if not SWAP_ONLY:
            await maps_pass(b, url)
            if not BEFORE: await maps_pass(b, url, first=True)
        if not BEFORE and not SWAP_ONLY:
            await chip_pass(b, url, 1366, 900); await chip_pass(b, url, 390, 844)
        if not BEFORE:
            await swap_pass(b, url)
        await b.close()
    h.shutdown()
    for n in notes: print('  note:', n)
    print(f"econ3_2026_11_03: {len(fails)} failure(s)")
    sys.exit(1 if fails else 0)

asyncio.run(main())
