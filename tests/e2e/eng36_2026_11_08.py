"""ENG36 (2026-11-08) browser check at 1366: the card editor's Resistance / Weakness / Immune boxes have a "+ Statuses" picker (adding one makes a
"Venom (status)" pill that a Save keeps as 'status:venom'); a Thanatosis unit playing dead is greyed and swings pass to its bramble; as it gets
up it floats up (the eng36-floatup class), not under reduced motion; Constrict's log line. Screens in docs/screens/eng36/.
    python3 tests/e2e/eng36_2026_11_08.py      (build first; writes docs/screens/eng36/*.png; needs Playwright)"""
import asyncio, os, json, functools, threading, http.server, socketserver
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
OUT = os.path.join(ROOT, 'docs', 'screens', 'eng36'); os.makedirs(OUT, exist_ok=True)
SKIP = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1');"
        "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying']));")
fails = []
def ok(c, m):
    print(('  ok ' if c else '  x ') + m)
    if not c: fails.append(m)

def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
        def handle(self):
            try: super().handle()
            except (BrokenPipeError, ConnectionResetError): pass
    h = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); threading.Thread(target=h.serve_forever, daemon=True).start(); return h

def E(body): return "(async()=>{ " + body + " })()"

SETUP = E("""FEATURE_SPOTS.forEach(sp=>{ try{ unlockFeature(sp.key); }catch(e){} }); myCurrencies.energy = 60; window.showCoachTip = function(){}; window.deckSizeOkOrWarn = ()=> true;
  switchTab('play'); startConquestMatch('m2', '4-1', {skipEnergyCost:true, noOpener:true}); await new Promise(r=> setTimeout(r, 3500)); return 1;""")

async def page(p, url, reduced=False):
    b = await p.chromium.launch(executable_path=CHROME if os.path.exists(CHROME) else None, args=['--no-sandbox'])
    ctx = await b.new_context(viewport={'width': 1366, 'height': 860}, reduced_motion='reduce' if reduced else 'no-preference')
    pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.add_init_script(SKIP); await pg.goto(url); await pg.wait_for_timeout(1500)
    return b, pg, errs

THAN = E("""const m = matchState, e = m.engine; m.resolving = true;
  [1, 2].forEach(pid=>{ const pl = m.players[pid]; pl.row.left = []; pl.row.center = []; pl.row.right = []; pl.hand = []; });
  e.debugSpawnCard(m.players, m.sideOf, 2, 'grass-snake', 'center', m.stats, []); const t = m.players[2].row.center[0]; t.wait = 9;
  e.debugSpawnCard(m.players, m.sideOf, 1, 'glacier-yak', 'center', m.stats, []); const a = m.players[1].row.center[0]; a.wait = 9;
  const ev = []; e.debugDamage(m.players, m.sideOf, t.uid, 99, m.stats, ev);
  renderMatchUI(); await new Promise(r=> setTimeout(r, 500)); m.resolving = false;
  const el = boardCardEl(t.uid), tile = el && el.querySelector('.card-tile');
  return {uid: t.uid, playingDead: t.playingDead != null, hp: t.hp, cls: el ? el.className : null, filter: tile ? getComputedStyle(tile).filter : null, chip: !!(el && el.querySelector('.abadge.playing-dead'))};""")

WAKE = E("""const m = matchState, t = m.players[2].row.center[0], el = boardCardEl(t.uid); window.__float = false;
  const mo = new MutationObserver(()=>{ if(el.classList.contains('eng36-floatup')) window.__float = true; }); mo.observe(el, {attributes:true, attributeFilter:['class']});
  m.replayCards = m.replayCards || {}; m.replayCards[t.uid] = m.replayCards[t.uid] || Object.assign({}, t); t.playingDead = null;
  renderVfxForEvent({type:'statusFx', kind:'thanatosisWake', side:'B', attUid:t.uid, attDefId:t.defId, targetSide:'B', targetUid:t.uid, targetDefId:t.defId, hp:1});
  await new Promise(r=> setTimeout(r, 300)); const mid = el.classList.contains('eng36-floatup'), anim = getComputedStyle(el.querySelector('.card-tile')).animationName;
  await new Promise(r=> setTimeout(r, 900)); mo.disconnect();
  const log = (logText({type:'statusFx', kind:'thanatosisWake', targetDefId:t.defId, attDefId:t.defId, hp:1}) || {}).text || '';
  return {floated: window.__float, mid, anim, after: el.classList.contains('eng36-floatup'), log};""")

async def main():
    h = serve(); url = f'http://127.0.0.1:{h.server_address[1]}/index.html'
    async with async_playwright() as p:
        b, pg, errs = await page(p, url)
        # --- the editor: + Statuses in each box
        await pg.evaluate(E("adminModeEnabled = true; openCardEditor('grass-snake'); await new Promise(r=> setTimeout(r, 900)); return 1;"))
        r = await pg.evaluate("""(()=>{ const o = id=> [...document.querySelectorAll('#' + id + ' option')].map(x=> x.textContent);
          return {resist: o('resistAddSelStatus'), weak: o('weaknessAddSelStatus'), imm: o('immuneAddSelStatus')}; })()""")
        print('   pickers:', len(r['resist']), r['resist'][:6])
        ok(len(r['resist']) >= 31 and len(r['weak']) >= 31 and len(r['imm']) >= 31, f'each box has a + Statuses picker with the 30 statuses ({len(r["resist"])} options)')
        ok(any('Venom (status)' in x for x in r['resist']) and any('Sleep (status)' in x for x in r['imm']), 'Venom and Sleep are offered (labelled "(status)")')
        await pg.select_option('#resistAddSelStatus', 'status:venom'); await pg.wait_for_timeout(400)
        await pg.select_option('#immuneAddSelStatus', 'status:sleep'); await pg.wait_for_timeout(400)
        pills = await pg.evaluate("(()=>({resist: [...document.querySelectorAll('#resistPills .pill')].map(x=> x.textContent), imm: [...document.querySelectorAll('#immunePills .pill')].map(x=> x.textContent)}))()")
        print('   pills:', json.dumps(pills, ensure_ascii=False))
        ok(any('Venom (status)' in x for x in pills['resist']) and any('Sleep (status)' in x for x in pills['imm']), 'picking one adds its pill')
        saved = await pg.evaluate("(()=>{ const c = readEditorFormIntoCard(); return {resist: c.effects.resist, immune: c.effects.immune}; })()")
        ok('status:venom' in (saved['resist'] or []) and 'status:sleep' in (saved['immune'] or []), f'reading the form keeps them as status:<key> ({saved})')
        await pg.evaluate("document.querySelector('#resistPills') && document.querySelector('#resistPills').scrollIntoView({block:'center'})"); await pg.wait_for_timeout(300)
        await pg.screenshot(path=os.path.join(OUT, 'editor-resist-statuses-1366.png'))
        await pg.evaluate("(()=>{ const s = document.getElementById('resistAddSelStatus'); if(s){ s.size = 12; s.style.position = 'relative'; s.style.zIndex = 50; } })()"); await pg.wait_for_timeout(200)
        await pg.screenshot(path=os.path.join(OUT, 'editor-status-list-1366.png'))
        # constrict is in the skill and action pickers
        r = await pg.evaluate("""(()=>({skill: [...document.querySelectorAll('#editorOverlay select[data-sk="key"] option')].some(o=> o.value === 'constrict'),
          act: ACTION_DEFS.some(a=> a.key === 'constrict') && ACTION_DEFS.some(a=> a.key === 'strangle')}))()""")
        ok(r['skill'] and r['act'], 'Constrict is in the skill picker; Strangle and Constrict are actions')
        await pg.evaluate("(()=>{ const x = document.querySelector('#editorOverlay .close, #editorClose, #editorOverlay [data-close]'); if(x) x.click(); else { const o = document.getElementById('editorOverlay'); if(o) o.remove(); } })()")
        await pg.goto(url); await pg.wait_for_timeout(1500)
        # --- Thanatosis in a real match: greyed while it plays dead, a swing passes to its bramble, it floats up
        await pg.evaluate(SETUP)
        r = await pg.evaluate(THAN)
        print('   playing dead:', json.dumps(r))
        ok(r['playingDead'] and r['hp'] == 1 and 'is-playing-dead' in (r['cls'] or ''), 'the unit lies playing dead (is-playing-dead) at 1 Health')
        ok('grayscale(1)' in (r['filter'] or ''), f'it is greyed out ({r["filter"]})')
        await pg.screenshot(path=os.path.join(OUT, 'thanatosis-playing-dead-1366.png'))
        w = await pg.evaluate(WAKE)
        print('   wake:', json.dumps(w, ensure_ascii=False))
        ok(w['floated'] and w['anim'] == 'eng36FloatUp', f'as it gets up it floats up (eng36FloatUp, {w["anim"]})')
        ok(not w['after'], 'the float-up class comes off again')
        ok('floats back up' in w['log'], f'the log line: {w["log"]}')
        r2 = await pg.evaluate("(logText({type:'statusFx', kind:'constrict', attDefId:'grass-snake', targetDefId:'glacier-yak', amount:1, strangle:2}) || {}).text || ''")
        ok('Constricted' in r2, f'Constrict\'s log line: {r2}')
        ok(not errs, f'no page errors ({errs[:3]})')
        await b.close()
        # --- reduced motion: no float-up
        b, pg, errs = await page(p, url, reduced=True)
        await pg.evaluate(SETUP); await pg.evaluate(THAN); w = await pg.evaluate(WAKE)
        print('   wake (reduced motion):', json.dumps(w, ensure_ascii=False))
        ok(not w['floated'], 'under reduced motion there is no float-up')
        await pg.screenshot(path=os.path.join(OUT, 'thanatosis-woken-reduced-1366.png'))
        await b.close()
    h.shutdown()
    print('eng36 browser: %s' % ('all ok' if not fails else '%d failed' % len(fails)))
    raise SystemExit(1 if fails else 0)

asyncio.run(main())
