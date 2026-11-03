#!/usr/bin/env python3
"""ECON2 (2026-11-03, owner 18:37: "Where to place objects on the map etc."): screenshot every Conquest map of a local build and read
where each object sits, so the placement review in docs/econ2-2026-11-03.md is measured, not eyeballed. Also reads the game's live
dialogue tables (DIALOGUES, FEATURE_SPOTS, MAP_CURIOSITIES, ERRAND_TEMPLATES, boss nodes) for the dialogue counts.

    python3 assemble_arena.py              # build first (the probe serves bramblewood-arena.html, or index.html)
    python3 tools/econ2/map_probe_2026_11_03.py [--maps m1,mf] [--width 1366]

Writes docs/screens/econ2/<n>-<mapId>.jpg (one per map, the map canvas only) and docs/balance/econ2-maps-2026-11-03.json:
  maps[]: {id, n, name, sub, parent, objects:[{cls, kind, key, x, y, label}], links:[[x1,y1,x2,y2]]} in canvas % (0-100)
  dialogue: {scripts:{id: lines}, spots, curios, errands, bossNodes}
The player state is "everything seen": every fight won and every feature unlocked, so every object a map can show is drawn.
Read-only: nothing in the game files changes.
"""
import argparse, asyncio, http.server, os, socketserver, threading, functools, json
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
PAGE = 'bramblewood-arena.html' if os.path.exists(os.path.join(ROOT, 'bramblewood-arena.html')) else 'index.html'
SKIP_INTRO = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1');"
              "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying']));")

SETUP = """(()=>{
  try{ skipTriggerLesson(); }catch(e){}
  try{ localStorage.setItem('bramblewood_res3_level_track_v1', JSON.stringify({granted: 999})); }catch(e){}
  try{ FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); }catch(e){}
  const p = loadConquestProgress(); p.completed = p.completed || []; p.ranks = p.ranks || {};
  CONQUEST_MAPS.forEach(m=> (m.nodes||[]).forEach(n=>{ const id = conquestNodeId(m.id, n.key); if(!p.completed.includes(id)) p.completed.push(id); p.ranks[id] = 'S'; }));
  saveConquestProgress(p);
  try{ const f = loadDialogueFlags(); Object.keys(DIALOGUES).forEach(k=> f['seen:' + k] = 1); localStorage.setItem(DIALOGUE_FLAGS_KEY, JSON.stringify(f)); }catch(e){}
  return CONQUEST_MAPS.filter(m=> !m.reserved && !m.endless && !(m.nodes||[]).some(n=> n.tower)).map(m=> ({id: m.id, name: m.name, sub: !!m.sub, parent: m.parent || null, n: (()=>{ try{ return mapNumberOf(m.id); }catch(e){ return null; } })()}));
})()"""

SHOW = """(id)=>{
  document.querySelectorAll('.dialogue-wrap, .dlg, .modal-overlay, .coach-tip').forEach(e=>{ try{ e.remove(); }catch(_){} });
  conquestWorldView = false; playSubTab = 'conquest'; conquestSelectedMap = id; conquestSelectedNodeKey = null; try{ conquestSubZoom = null; }catch(e){}
  switchTab('play'); try{ renderPlay(); }catch(e){}
}"""

READ = """()=>{
  const c = document.getElementById('conquestCanvas'); if(!c) return null;
  const R = c.getBoundingClientRect(), out = [], links = [];
  const kindOf = el=>{ const k = el.className && el.className.baseVal == null ? String(el.className) : '';
    if(/\\bmap-node\\b/.test(k)) return /kind-tutorial/.test(k) ? 'tutorial' : (/boss/.test(k) ? 'boss' : /elite|champion|miniboss|subboss/.test(k) ? 'elite' : 'fight');
    if(/map-subcave|map-subemblem/.test(k)) return 'submap'; if(/map-subexit/.test(k)) return 'exit'; if(/map-cave/.test(k)) return 'cave';
    if(/map-spot/.test(k)) return 'feature'; if(/map-curio/.test(k)) return 'curiosity'; if(/map-well/.test(k)) return 'well';
    if(/map-courier/.test(k)) return 'courier'; if(/map-wanderer/.test(k)) return 'npc'; if(/map-tree/.test(k)) return 'tree'; if(/map-small/.test(k)) return 'prop';
    if(/map-mover/.test(k)) return null; if(/map-pawn/.test(k)) return 'pawn'; return 'other'; };
  c.querySelectorAll('[style*="left"]').forEach(el=>{
    const kind = kindOf(el); if(!kind) return; const r = el.getBoundingClientRect(); if(!r.width && !r.height) return;
    const cs = getComputedStyle(el); if(cs.display === 'none' || cs.visibility === 'hidden') return;
    out.push({kind, cls: String(el.className).slice(0, 80), key: el.dataset.lkey || el.dataset.nodekey || el.dataset.spot || el.dataset.curio || '',
      x: +(((r.left + r.width / 2) - R.left) / R.width * 100).toFixed(1), y: +(((r.top + r.height / 2) - R.top) / R.height * 100).toFixed(1),
      w: +(r.width / R.width * 100).toFixed(1), h: +(r.height / R.height * 100).toFixed(1), label: (el.getAttribute('aria-label') || el.title || el.textContent || '').trim().slice(0, 60)}); });
  c.querySelectorAll('svg line').forEach(l=>{ const a = ['x1','y1','x2','y2'].map(k=> parseFloat(l.getAttribute(k))); if(a.every(isFinite)) links.push(a); });
  return {w: Math.round(R.width), h: Math.round(R.height), objects: out, links};
}"""

DIALOGUE = """()=>{
  const lines = id=>{ try{ const s = (typeof dialogueScript === 'function' ? dialogueScript(id) : DIALOGUES[id]) || {}; return (s.lines||[]).length; }catch(e){ return 0; } };
  const words = id=>{ try{ const s = (typeof dialogueScript === 'function' ? dialogueScript(id) : DIALOGUES[id]) || {}; return (s.lines||[]).reduce((t, l)=> t + String(l.text||'').split(/\\s+/).filter(Boolean).length, 0); }catch(e){ return 0; } };
  const scripts = {}; Object.keys(DIALOGUES).forEach(k=> scripts[k] = {lines: lines(k), words: words(k)});
  const spots = FEATURE_SPOTS.map(s=> ({key: s.key, name: s.name, mapNumber: s.mapNumber, dialogue: s.dialogue || null, lines: s.dialogue ? lines(s.dialogue) : 0, words: s.dialogue ? words(s.dialogue) : 0}));
  const curios = MAP_CURIOSITIES.map(c=> ({key: c.key, map: c.map, n: (()=>{ try{ return mapNumberOf(c.map); }catch(e){ return null; } })(), dialogue: c.dialogue, lines: lines(c.dialogue), words: words(c.dialogue)}));
  const errands = (typeof ERRAND_TEMPLATES !== 'undefined' ? ERRAND_TEMPLATES : []).map(t=> ({id: t.id, who: t.who, counter: t.counter, goal: t.goal, reward: t.reward, minMap: t.minMap, words: String(t.ask||'').split(/\\s+/).length}));
  const bossNodes = []; CONQUEST_MAPS.forEach(m=> (m.nodes||[]).forEach(n=>{ if(/boss/.test(baseKind(n.kind||''))) bossNodes.push({map: m.id, key: n.key, kind: n.kind}); }));
  const flavor = {}; CONQUEST_MAPS.forEach(m=> flavor[m.id] = (m.nodes||[]).reduce((t, n)=> t + String(n.flavor||'').split(/\\s+/).filter(Boolean).length, 0));
  let coach = 0; try{ coach = Object.keys(COACH_TIPS || {}).length; }catch(e){}
  return {scripts, spots, curios, errands, bossNodes, flavorWords: flavor, coachTips: coach,
    lineMs: DIALOGUE_LINE_MS, banter: lines('boss_banter'), banterBirds: lines('boss_banter@birds')};
}"""

def serve():
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    httpd = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=ROOT))
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd

async def main(a):
    httpd = serve()
    url = f'http://127.0.0.1:{httpd.server_address[1]}/{PAGE}'
    shots = os.path.join(ROOT, 'docs', 'screens', 'econ2'); os.makedirs(shots, exist_ok=True)
    dst = os.path.join(ROOT, 'docs', 'balance', 'econ2-maps-2026-11-03.json')
    out = {'generated': '2026-11-03', 'tool': 'python3 tools/econ2/map_probe_2026_11_03.py', 'page': PAGE, 'width': a.width, 'maps': []}
    if a.append and os.path.exists(dst): out = json.load(open(dst))  # --append: add / replace maps in the file a run before wrote
    def dump():
        with open(dst, 'w') as fh: json.dump(out, fh, indent=1, ensure_ascii=False); fh.write('\n')
    import time; t0 = time.time()
    async with async_playwright() as p:
        exe = CHROME if os.path.exists(CHROME) else None
        b = await p.chromium.launch(**({'executable_path': exe} if exe else {}), args=['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'])
        pg = await b.new_page(viewport={'width': a.width, 'height': 900}, reduced_motion='reduce')  # the page honours it: fewer movers and FX, a far lighter frame
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
        await pg.route('**/*', lambda r: r.continue_() if r.request.url.startswith('http://127.0.0.1') else r.fulfill(status=200, body='', content_type='text/css'))  # no outside fetch (fonts): it hung the load, and an aborted font kept screenshots waiting
        await pg.add_init_script(SKIP_INTRO)
        await pg.goto(url, wait_until='domcontentloaded', timeout=120000); await pg.wait_for_timeout(4000)
        maps = await pg.evaluate(SETUP)
        await pg.reload(wait_until='domcontentloaded', timeout=120000); await pg.wait_for_timeout(4000)
        out['dialogue'] = await pg.evaluate(DIALOGUE)
        await pg.add_style_tag(content='#dialogueDock{display:none !important}')  # a lesson line over the map would hide the objects
        want = set(a.maps.split(',')) if a.maps else None
        if a.main: maps = [m for m in maps if not m['sub']]
        for m in maps:
            if want and m['id'] not in want: continue
            await pg.evaluate(SHOW, m['id']); await pg.wait_for_timeout(a.wait)
            data = await pg.evaluate(READ)
            if not data: print('no canvas', m['id']); continue
            m.update(data); out['maps'] = [x for x in out['maps'] if x['id'] != m['id']] + [m]
            tag = (f"{m['n']:02d}" if isinstance(m['n'], int) else 'xx') + ('s' if m['sub'] else '')
            f = os.path.join(shots, f"{tag}-{m['id']}.jpg")  # JPEG 82: the folder is ~5 MB (PNG was 18 MB)
            box = await pg.evaluate("(()=>{ const c = document.getElementById('conquestCanvas'); c.scrollIntoView({block:'start'}); const r = c.getBoundingClientRect(); return {x: Math.max(0, r.left), y: Math.max(0, r.top), width: Math.min(r.width, innerWidth), height: Math.min(r.height, innerHeight - Math.max(0, r.top))}; })()")
            ok = False
            try:  # CDP's own capture: Playwright's screenshot waits on fonts and settled frames, which this animated page never gives (20-45 s a try)
                cdp = await pg.context.new_cdp_session(pg)
                r = await cdp.send('Page.captureScreenshot', {'format': 'jpeg', 'quality': 82, 'clip': dict(box, scale=1)})
                import base64; open(f, 'wb').write(base64.b64decode(r['data'])); ok = True; await cdp.detach()
            except Exception as e: print('shot failed', m['id'], str(e)[:80])
            if not ok: continue
            dump(); print(f"{tag} {m['id']:6s} {m['name'][:28]:28s} objects {len(data['objects']):3d} links {len(data['links']):3d}  {time.time() - t0:.0f}s")
        await b.close()
    httpd.shutdown()
    out['pageErrors'] = errs[:20]
    dump()
    print('->', os.path.relpath(dst, ROOT), '| page errors:', len(errs))

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--maps'); ap.add_argument('--width', type=int, default=1366); ap.add_argument('--wait', type=int, default=1200); ap.add_argument('--append', action='store_true'); ap.add_argument('--main', action='store_true', help='main road maps only')
    asyncio.run(main(ap.parse_args()))
