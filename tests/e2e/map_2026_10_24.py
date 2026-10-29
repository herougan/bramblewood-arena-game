#!/usr/bin/env python3
"""Package MAP (2026-10-24, owner notes 17:01 #1 #3 #5 and 13:16 #16 #19 #20): browser checks and screenshots at 390 and 1366.

    python3 tests/e2e/map_2026_10_24.py            # checks + shots in tests/out/shots/map-*.png
    python3 tests/e2e/map_2026_10_24.py --widths 1366

Covers: the conquest map and the pawn's fight coming back after a reload (#1), the floating Ambush with no trail and the fight it stopped
staying locked until it is won (#3), the raiders running off only the first time (#5), the bramble editor on the fight panel (#16), map
tiles that shake while an NPC talks (#19) and the Quest Board that waits for the Notices (#20). Build first. Exits 1 on a failed check.
"""
import argparse, asyncio, http.server, socketserver, threading, functools, os, sys
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'tests', 'out', 'shots'); os.makedirs(OUT, exist_ok=True)
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
SKIP = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1');"
        "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying']));")
OWN = ("Object.entries(myDeckCounts).forEach(([id,n])=>{for(let i=0;i<n;i++) unlockCardForPlayer(id,'test');});"
       "saveEnergyState({current:20, lastRegenAt:Date.now()}); try{ refreshEnergyHud(); }catch(e){} window.showCoachTip = ()=>{}; window.maybeShowCoachTip = ()=>{};")
# win every fight on the maps before map n (and, when upto is given, that map's fights that the named one needs)
CLEAR_FN = """window.clearBefore = ((n, upto)=>{ saveTutorial2Done(); saveTutorialDone(); const p = loadConquestProgress(), mains = mainConquestMaps();
  const done = (m, k)=>{ const id = conquestNodeId(m.id, k); if(!p.completed.includes(id)) p.completed.push(id); };
  mains.slice(0, n).forEach(m=> m.nodes.forEach(nd=> done(m, nd.key)));
  if(upto){ const m = mains[n], need = k=>{ const nd = m.nodes.find(x=> x.key === k); (nd && nd.requires || []).forEach(r=>{ need(r); done(m, r); }); }; need(upto); }
  saveConquestProgress(p); })"""
fails = []; shots = []

def ok(cond, msg):
    print(('  ok  ' if cond else '  FAIL ') + msg)
    if not cond: fails.append(msg)

def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    httpd = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT))
    threading.Thread(target=httpd.serve_forever, daemon=True).start(); return httpd

async def page_in(ctx, url, w, pre=''):
    pg = await ctx.new_page()
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg._errs = errs
    await pg.add_init_script(SKIP + pre)
    await pg.goto(url); await pg.wait_for_function("typeof myDeckCounts !== 'undefined' && typeof switchTab === 'function'", timeout=60000); await pg.wait_for_timeout(1300)
    await pg.evaluate("(()=>{ " + OWN + " })()")
    await pg.evaluate(CLEAR_FN)
    return pg

async def ctx_for(b, w):
    return await b.new_context(viewport={'width': w, 'height': 844 if w < 700 else 860}, has_touch=(w < 700))

async def shot(pg, name, w):
    await pg.add_style_tag(content='.toast, .toast-host, .levelup, .level-up, [class*="levelup"], [class*="level-up"], .milestone-pop{display:none !important;}')
    await pg.wait_for_timeout(250)
    f = os.path.join(OUT, f'map-{name}-{w}.png'); await pg.screenshot(path=f, animations='allow'); shots.append(f); return f

async def open_map(pg, mid, node=None):
    await pg.evaluate("(([m, k])=>{ conquestWorldView = false; conquestSelectedMap = m; conquestSelectedNodeKey = k; playSubTab = 'conquest'; switchTab('play'); })", [mid, node])
    await pg.wait_for_timeout(2600)
    if not getattr(pg, '_settled', False):  # the first visit after the progress was written: the level-up banner and its toasts play out
        pg._settled = True; await pg.wait_for_timeout(6500)

async def run(b, url, w):
    print(f'-- width {w}')
    # 1. the conquest map and the pawn come back after a reload
    ctx = await ctx_for(b, w)
    pg = await page_in(ctx, url, w)
    r = await pg.evaluate("(()=>{ clearBefore(2, null); const m = mainConquestMaps()[2]; return {id: m.id, key: m.nodes[1].key}; })()")
    await open_map(pg, r['id'], r['key']); await pg.wait_for_timeout(1500)
    st = await pg.evaluate("({map: conquestSelectedMap, last: JSON.parse(localStorage.getItem('bramblewood_last_map_v1') || 'null')})")
    ok(st['map'] == r['id'] and st['last'] and st['last']['map'] == r['id'] and st['last']['node'] == r['key'], f'1. the map and the pawn\'s fight are remembered {st}')
    await shot(pg, 'resume-before', w)
    await pg.close()
    pg = await page_in(ctx, url, w)
    st0 = await pg.evaluate("conquestSelectedMap")
    await pg.evaluate("(()=>{ playSubTab = 'conquest'; switchTab('play'); })()"); await pg.wait_for_timeout(2600)
    st = await pg.evaluate("""(()=>{ const pawn = document.querySelector('#conquestCanvas .map-pawn'), nd = document.querySelector(`.map-node[data-lkey="%s"]`);
      const pr = pawn && pawn.getBoundingClientRect(), nr = nd && nd.getBoundingClientRect();
      return {map: conquestSelectedMap, pawn: !!pawn, dist: pr && nr ? Math.hypot((pr.left + pr.width/2) - (nr.left + nr.width/2), (pr.top + pr.height/2) - (nr.top + nr.height/2)) : null, title: (document.querySelector('.cnp-name')||{}).textContent || ''}; })()""" % r['key'])
    ok(st['map'] == r['id'] and st['pawn'], f'1. a reload opens the Conquest pane on the map you left ({st})')
    ok(st['dist'] is not None and st['dist'] < 60, f'1. the pawn stands at its fight, no walk from elsewhere (distance {st["dist"]})')
    await pg.wait_for_timeout(3500)
    await shot(pg, 'resume-after', w)
    # a save that names a map that is not open yet falls back to the old rules
    await pg.evaluate("localStorage.setItem('bramblewood_last_map_v1', JSON.stringify({map: mainConquestMaps()[9].id, node: null}))")
    await pg.close(); pg = await page_in(ctx, url, w)
    await pg.evaluate("(()=>{ playSubTab = 'conquest'; switchTab('play'); })()"); await pg.wait_for_timeout(1500)
    st = await pg.evaluate("conquestSelectedMap")
    nine = await pg.evaluate("mainConquestMaps()[9].id")
    ok(st != nine, f'1. a remembered map that is still locked is not opened ({st} vs {nine})')
    ok(not pg._errs, f'1. no page errors {pg._errs[:2]}')
    await pg.close(); await ctx.close()

    # 3. the floating Ambush, the locked path
    ctx = await ctx_for(b, w)
    pg = await page_in(ctx, url, w)
    r = await pg.evaluate("""(()=>{ clearBefore(3, '3-2'); const am = ambushMap(); const n32 = am.nodes.find(n=> skirmishCode(am.id, n.key) === AMBUSH_AT);
      saveAmbushState({triggered: Date.now(), foe: 'hummingbirds', pos: {x: 62, y: 74}, deck: ambushDeck('hummingbirds')}); applyNodeEdits();
      return {id: am.id, k32: n32.key}; })()""")
    await open_map(pg, r['id'], None)
    st = await pg.evaluate("""(k32=>{ const cv = document.getElementById('conquestCanvas'); const a = cv.querySelector('.map-node.is-ambush'), l = cv.querySelector(`.map-node-hidden[data-lkey="${k32}"]`);
      const am = ambushMap().nodes.find(n=> n.ambush);
      return {ambush: !!a, floating: !!(a && a.classList.contains('is-floating')), trail: cv.querySelectorAll('.map-trail-svg [data-a="ambush"], .map-trail-svg [data-b="ambush"]').length,
        lockedClass: !!(l && l.classList.contains('is-ambush-locked')), lockedLabel: l ? (l.querySelector('.map-node-gate')||{}).textContent : null, req: am.requires, pending: ambushPending(), btn32: !!cv.querySelector(`button.map-node[data-lkey="${k32}"]`)}; })""", r['k32'])
    ok(st['ambush'] and st['floating'] and st['trail'] == 0 and st['req'] == [], f'3. the Ambush floats: on the map, no trail to or from it {st}')
    # 2026-10-29 ENG13: the owner made the Ambush optional (21:36: "no need to be completed to progress"): 3-2 stays open beside it
    ok(not st['lockedClass'] and st['btn32'] and st['pending'], f'3. the fight it stopped (3-2) stays open while the Ambush is not won (ENG13) {st}')
    await shot(pg, 'ambush-open', w)
    # a reload keeps the Ambush, still floating and still open
    await pg.close(); pg = await page_in(ctx, url, w)
    await open_map(pg, r['id'], None)
    n = await pg.evaluate("document.querySelectorAll('#conquestCanvas .map-node.is-ambush').length")
    ok(n == 1, f'3. after a reload the Ambush is still there ({n})')
    # win it: the path opens, the Ambush stays
    await pg.evaluate("(()=>{ const p = loadConquestProgress(); p.completed.push(conquestNodeId(ambushMap().id, 'ambush')); saveConquestProgress(p); })()")
    await open_map(pg, r['id'], None)
    st = await pg.evaluate("""(k32=>{ const cv = document.getElementById('conquestCanvas'); return {open: !!cv.querySelector(`button.map-node[data-lkey="${k32}"]`), ambush: !!cv.querySelector('.map-node.is-ambush.done'), pending: ambushPending()}; })""", r['k32'])
    ok(st['open'] and st['ambush'] and not st['pending'], f'3. winning the Ambush opens the path; the Ambush stays on the map {st}')
    await shot(pg, 'ambush-won', w)
    ok(not pg._errs, f'3. no page errors {pg._errs[:2]}')
    await pg.close(); await ctx.close()

    # 5. the raiders, the first time only
    ctx = await ctx_for(b, w)
    pg = await page_in(ctx, url, w)
    r = await pg.evaluate("""(()=>{ clearBefore(3, '3-2'); const am = ambushMap(); saveAmbushState({triggered: Date.now(), foe: 'hummingbirds', pos: {x: 62, y: 74}, deck: ambushDeck('hummingbirds')}); applyNodeEdits();
      myCurrencies.gold = 500; saveCurrencies(); return {id: am.id}; })()""")
    async def lose():
        await pg.evaluate(f"(()=>{{ playSubTab = 'conquest'; switchTab('play'); startConquestMatch('{r['id']}', 'ambush', {{skipEnergyCost: true}}); }})()"); await pg.wait_for_timeout(1500)
        return await pg.evaluate("""(async()=>{ const m = matchState; if(!m) return null; const g0 = myCurrencies.gold; m.forcedWinner = 2; m.endReason = 'forfeit'; await resolveRound(); await new Promise(r=> setTimeout(r, 1500));
          return {took: m.raidersTook || null, g0, g1: myCurrencies.gold, line: (document.querySelector('.wl-raiders')||{}).textContent || ''}; })()""")
    a = await lose()
    ok(a and a['took'] and a['took']['n'] > 0 and a['g1'] == a['g0'] - a['took']['n'] and 'ran off' in a['line'], f'5. the first lost Ambush: the raiders run off with Leaves and say so {a}')
    if w == 1366 and a: await shot(pg, 'raiders-first', w)
    await pg.close(); pg = await page_in(ctx, url, w)
    b2 = await lose()
    ok(b2 and not b2['took'] and b2['g1'] == b2['g0'] and b2['line'] == '', f'5. the second lost Ambush costs nothing and shows no raiders line {b2}')
    ok(not pg._errs, f'5. no page errors {pg._errs[:2]}')
    await pg.close(); await ctx.close()

    # 20 / 19. tiles that will not open
    ctx = await ctx_for(b, w)
    pg = await page_in(ctx, url, w)
    r = await pg.evaluate("""(()=>{ clearBefore(9, null); FEATURE_SPOTS.forEach(sp=>{ if(sp.key !== 'quests') unlockFeature(sp.key); });
      const qb = FEATURE_SPOTS.find(x=> x.key === 'questboard'); return {id: qb.map, seen: featureUnlocked('quests')}; })()""")
    await open_map(pg, r['id'], None)
    st = await pg.evaluate("""(()=>{ const b = document.querySelector('[data-spot="questboard"]'); return b ? {waits: b.classList.contains('is-waiting'), lock: !!b.querySelector('.map-spot-lock'), disabled: b.getAttribute('aria-disabled')} : null; })()""")
    ok(bool(st) and st['waits'] and st['lock'], f'20. the Quest Board tile shows locked before the Notices are open {st}')
    await shot(pg, 'questboard-locked', w)
    await pg.click('[data-spot="questboard"]', force=True); await pg.wait_for_timeout(150)
    st = await pg.evaluate("""(()=>{ const b = document.querySelector('[data-spot="questboard"]'); return {shake: b.classList.contains('tile-dull-shake'), label: (b.querySelector('.map-lock-label')||{}).textContent || '', modal: !!document.getElementById('qsTitle'), unlocked: featureUnlocked('questboard')}; })()""")
    ok(st['shake'] and st['label'] == 'Locked for now' and not st['modal'] and st['unlocked'] is not None, f'20. a tap shakes it, says "Locked for now" and does not open the board {st}')
    await shot(pg, 'questboard-shake', w)
    # an NPC offer to open the Notices is refused too
    await pg.evaluate("performDialogueAct('quests')"); await pg.wait_for_timeout(200)
    modal = await pg.evaluate("!!document.getElementById('qsTitle')")
    ok(not modal, '20. an NPC reply that would open the Notices does nothing before they are unlocked')
    # once the Notices are open the same tile opens the board
    await pg.evaluate("(()=>{ unlockFeature('quests'); dialoguesPending.clear(); })()"); await open_map(pg, r['id'], None); await pg.evaluate("dialoguesPending.clear()")
    await pg.wait_for_timeout(1300)
    await pg.click('[data-spot="questboard"]'); await pg.wait_for_timeout(500)
    modal = await pg.evaluate("!!document.getElementById('qsTitle')")
    ok(modal, '20. with the Notices unlocked the Quest Board opens as before')
    await pg.evaluate("(()=>{ const c = document.getElementById('qsClose'); if(c) c.click(); })()")
    # 19. while an NPC talks, a tile shakes instead of opening
    await pg.wait_for_timeout(1300)
    tile = await pg.evaluate("""(()=>{ const t = document.querySelector('[data-spot="shop2"], [data-spot="codex"], [data-spot="forge"], #mapWell, [data-curio]'); return t ? (t.dataset.spot || t.id || t.dataset.curio) : null; })()""")
    await pg.evaluate("(()=>{ playDialogue('unlock_quests', {force: true}); })()"); await pg.wait_for_timeout(500)
    act = await pg.evaluate("npcDialogueActive()")
    ok(act, '19. an NPC conversation is under way')
    sel = f'[data-spot="{tile}"]' if tile in ('shop2', 'codex', 'forge') else ('#mapWell' if tile == 'mapWell' else f'[data-curio="{tile}"]')
    tab0 = await pg.evaluate("currentTab")
    await pg.click(sel); await pg.wait_for_timeout(150)
    st = await pg.evaluate(f"""(()=>{{ const b = document.querySelector('{sel}'); return {{shake: b.classList.contains('tile-dull-shake'), tab: currentTab}}; }})()""")
    ok(st['shake'] and st['tab'] == tab0, f'19. a tile ({tile}) shakes and stays shut while the NPC talks {st}')
    await shot(pg, 'dialogue-shake', w)
    ok(not pg._errs, f'19/20. no page errors {pg._errs[:2]}')
    await pg.close(); await ctx.close()

    # 16. the bramble editor
    ctx = await ctx_for(b, w)
    pg = await page_in(ctx, url, w)
    await pg.evaluate("(()=>{ clearBefore(0, null); setAdminMode(true); })()")
    await pg.evaluate("(()=>{ const p = loadConquestProgress(); p.completed = p.completed.filter(id=> !/^m1:0-/.test(id)); saveConquestProgress(p); })()")
    await open_map(pg, 'm1', '0-1')
    before = await pg.evaluate("(()=>{ const f = findConquestNode('m1', '0-1'); return skirmishCastle(f.node).hp; })()")
    btn = await pg.query_selector('[data-bramble-edit]')
    ok(btn is not None, '16. an admin sees the bramble line as a button on the fight panel')
    if btn:
        await shot(pg, 'bramble-line', w)
        await btn.click(); await pg.wait_for_timeout(300)
        ok(await pg.evaluate("!!document.querySelector('.cnp-bramble-ed')"), '16. clicking it opens the inline editor')
        await shot(pg, 'bramble-editor', w)
        await pg.fill('#cbeHp', str(before + 1)); await pg.click('#cbeSave'); await pg.wait_for_timeout(900)
        r = await pg.evaluate("""(()=>{ const f = findConquestNode('m1', '0-1'); const e = (nodeEdits.m1 || {}).patches || {};
          return {hp: skirmishCastle(f.node).hp, fight: skirmishCastle(f.node).character.health, patch: e['0-1'] && e['0-1'].brambleHealth, shown: (document.querySelector('.cnp-kind .castle-line .cl-num')||{}).textContent}; })()""")
        ok(r['hp'] == before + 1 and r['fight'] == before + 1 and r['patch'] == before + 1 and str(r['shown']) == str(before + 1), f'16. +1 HP is saved as a skirmish edit and is what the fight uses ({before} -> {r})')
        await shot(pg, 'bramble-saved', w)
        # a player never sees the button
        await pg.evaluate("setAdminMode(false)"); await open_map(pg, 'm1', '0-1')
        ok(await pg.query_selector('[data-bramble-edit]') is None, '16. a player does not get the editor')
        await pg.evaluate("setAdminMode(true)"); await open_map(pg, 'm1', '0-1')
        btn = await pg.query_selector('[data-bramble-edit]'); await btn.click(); await pg.wait_for_timeout(200)
        await pg.click('#cbeReset'); await pg.wait_for_timeout(600)
        again = await pg.evaluate("skirmishCastle(findConquestNode('m1', '0-1').node).hp")
        ok(again == before, f'16. "Back to the rule" returns it to {before} ({again})')
    ok(not pg._errs, f'16. no page errors {pg._errs[:2]}')
    await pg.close(); await ctx.close()

async def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--widths', default='390,1366'); a = ap.parse_args()
    httpd = serve(); url = f'http://127.0.0.1:{httpd.server_address[1]}/index.html'
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME if os.path.exists(CHROME) else None)
        for w in [int(x) for x in a.widths.split(',')]: await run(b, url, w)
        await b.close()
    print('\nshots:'); [print('  ' + f) for f in shots]
    print('\nFAILED: ' + str(len(fails)) if fails else '\nall checks passed'); sys.exit(1 if fails else 0)

asyncio.run(main())
