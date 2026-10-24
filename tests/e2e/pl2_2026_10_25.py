#!/usr/bin/env python3
"""Package PL2 (2026-10-25, owner playtest 10-24 22:28 and 10-25 00:02): browser checks and screenshots / frame sheets at 390 and 1366.

    python3 tests/e2e/pl2_2026_10_25.py                    # checks + shots in tests/out/shots/pl2-*.png
    python3 tests/e2e/pl2_2026_10_25.py --widths 1366 --keep   # --keep copies the shots to docs/screens/PL2/ (as .jpg)

Covers: the fallen bramble leaves nothing (#1), the end of a match keeps the cards' elements (00:02 #1), a flyer's Health bar rides with it and an
artless card's emoji (00:02 SS#1), the Inspiring burst and its 0.3 s Attack update (#4, a slow-motion sheet), the stat bounce (#5), the bramble
bars easing and the bramble's hit / repair (#7, 21:54), Poison ☠N (00:02 #4), the enemy's pills on Shift (00:02 #8), every fight's XP on the
map and the queued map emblems (#8, PL1-1), card rewards as one stack with the rank ribbon (00:02 #3 #5), the pack card detail's pill and the
popover over the opener (#9), the one-step trigger lesson (00:02 #6), the Energy panel (00:02 #7), Whisper's Game for admins (#6), no Dungeons
tab, the Arena's Co-op tab and the map spot (PL1-3), the PRO / BPRO preview (PRO-UI), the prong sounds and the results' music (00:02 #9 #10).
Every fight calls skipTriggerLesson() (in the page setup). Build first. Exits 1 on a failed check.
"""
import argparse, asyncio, http.server, socketserver, threading, functools, os, sys, shutil, glob
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'tests', 'out', 'shots'); os.makedirs(OUT, exist_ok=True)
KEEP = os.path.join(ROOT, 'docs', 'screens', 'PL2')
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
DONE = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1'); localStorage.setItem('bramblewood_arena_faction','otters');"
        "window.addEventListener('load', ()=>{ try{ skipTriggerLesson(); saveTutorial2Done(); saveTutorialDone(); window.deckSizeOkOrWarn = ()=> true; saveEnergyState({current:200, lastRegenAt:Date.now()});"
        " window.showCoachTip = ()=>{}; window.maybeShowCoachTip = ()=>{}; }catch(e){} });")
DONE_TIPS = DONE.replace(" window.showCoachTip = ()=>{}; window.maybeShowCoachTip = ()=>{};", "")
fails = []; shots = []

def ok(cond, msg):
    print(('  ok  ' if cond else '  FAIL ') + msg)
    if not cond: fails.append(msg)

def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    httpd = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT))
    threading.Thread(target=httpd.serve_forever, daemon=True).start(); return httpd

async def page(b, url, w, pre=DONE):
    ctx = await b.new_context(viewport={'width': w, 'height': 844 if w < 700 else 860}, has_touch=(w < 700))
    pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e) + ' @ ' + (e.stack or '')[:240])); pg._errs = errs; pg._ctx = ctx
    await pg.add_init_script(pre)
    await pg.goto(url); await pg.wait_for_function("typeof switchTab === 'function' && typeof startConquestMatch === 'function'", timeout=60000); await pg.wait_for_timeout(2200)
    return pg

async def close(pg):
    ok(not pg._errs, f'no page errors {pg._errs[:2]}')
    await pg._ctx.close()

async def shot(pg, name, w, clip=None, pad=24):
    f = os.path.join(OUT, f'pl2-{name}-{w}.png')
    h = await pg.query_selector(clip) if clip else None
    bb = await h.bounding_box() if h else None
    if bb: await pg.screenshot(path=f, clip={'x': max(0, bb['x'] - pad), 'y': max(0, bb['y'] - pad), 'width': bb['width'] + 2 * pad, 'height': bb['height'] + 2 * pad}, animations='allow')
    else: await pg.screenshot(path=f, animations='allow')
    shots.append(f); return f

async def frames(pg, name, w, times, clip=None, pad=24, cols=4, scale=.6):
    """screenshots at the given ms after now, joined into one sheet (each frame numbered)"""
    from PIL import Image, ImageDraw
    t, files = 0, []
    for i, at in enumerate(times):
        if at > t: await pg.wait_for_timeout(at - t); t = at
        f = os.path.join(OUT, f'pl2-_f-{name}-{w}-{i:02d}.png'); files.append(f)
        h = await pg.query_selector(clip) if clip else None; bb = await h.bounding_box() if h else None
        if bb: await pg.screenshot(path=f, clip={'x': max(0, bb['x'] - pad), 'y': max(0, bb['y'] - pad), 'width': bb['width'] + 2 * pad, 'height': bb['height'] + 2 * pad}, animations='allow')
        else: await pg.screenshot(path=f, animations='allow')
    ims = []
    for i, f in enumerate(files):
        im = Image.open(f).convert('RGB'); im = im.resize((max(1, int(im.width * scale)), max(1, int(im.height * scale))))
        d = ImageDraw.Draw(im); d.rectangle((0, 0, 22, 13), fill=(0, 0, 0)); d.text((2, 1), f'{i:02d}', fill=(255, 255, 0)); ims.append(im); os.remove(f)
    W, H = max(i.width for i in ims), max(i.height for i in ims); rows = (len(ims) + cols - 1) // cols
    S = Image.new('RGB', (W * min(cols, len(ims)), H * rows), (24, 24, 24))
    for i, im in enumerate(ims): S.paste(im, ((i % cols) * W, (i // cols) * H))
    out = os.path.join(OUT, f'pl2-sheet-{name}-{w}.png'); S.save(out); shots.append(out); return out

E = lambda body: "(async()=>{ " + body + " })()"
# a fight whose board is exactly the given units; the CPU waits until a step calls it (as tests/e2e/en8_2026_10_24.py)
BOARD = """(async(map, node, mine, theirs)=>{ adminModeEnabled = true; try{ skipTriggerLesson(); }catch(e){} switchTab('play'); startConquestMatch(map, node, {skipEnergyCost:true, noOpener:true}); await new Promise(r=> setTimeout(r, 2600));
  const m = matchState, e = m.engine; const uids = {};
  [1, 2].forEach(pid=>{ const pl = m.players[pid]; pl.row.left = []; pl.row.center = []; pl.row.right = []; pl.hand = []; });
  const put = (pid, list)=> list.forEach(([id, slot, hp, wait])=>{ const c = e.makeBoardCard(id); c.wait = wait || 0; if(hp){ c.hp = c.maxHp = hp; } c.slot = slot;
    const pl = m.players[pid]; (slot === 0 ? pl.row.center : slot < 0 ? pl.row.left : pl.row.right).push(c); uids[pid + ':' + slot] = c.uid; });
  put(1, mine); put(2, theirs); [1, 2].forEach(pid=>{ const pl = m.players[pid]; pl.row.left.sort((a, b)=> b.slot - a.slot); pl.row.right.sort((a, b)=> a.slot - b.slot); e.syncSlots(pl); });
  m.replayCards = null; renderMatchUI(); await new Promise(r=> setTimeout(r, 900));
  return uids; })"""
WIN = "(async()=>{ const M = matchState; M.players[2].hq.shield = 0; M.players[2].hq.hp = 0; M.forcedWinner = 1; await resolveRound({manual:true, run:()=> true}); await new Promise(r=> setTimeout(r, 3800)); })()"

async def run(b, url, w):
    print(f'-- width {w}')
    # ---------------- A1 / 00:02 #1: a win that ends the round a card was played in; nodes kept; no mound
    pg = await page(b, url, w)
    await pg.evaluate(BOARD + "('m1', '0-2', [['otter-kit', 1, 30]], [])")
    r = await pg.evaluate(E("""const m = matchState, e = m.engine; m.players[1].row.right[0].atk = 50; m.players[2].hq.hp = 1; m.players[2].hq.shield = 0;
      m.players[1].lumber = 9; m.players[1].hand = [{uid: 880001, defId: 'voidfeather-scout'}]; m.resolving = false; renderMatchUI(); await new Promise(r=> setTimeout(r, 600));
      await playCardByUid(880001, 'left'); await new Promise(r=> setTimeout(r, 1800));
      const tag = {}; document.querySelectorAll('#rowMine .board-card[data-uid]').forEach(el=>{ el.__pl2 = 1; tag[el.dataset.uid] = true; });
      const hidden = []; const t0 = performance.now(); await new Promise(res=>{ const f = ()=>{ document.querySelectorAll('#rowMine .board-card[data-uid]').forEach(el=>{ const t = el.querySelector('.card-tile');
          if(getComputedStyle(el).visibility === 'hidden' || +getComputedStyle(el).opacity < .5 || (t && +getComputedStyle(t).opacity < .5)) hidden.push(el.dataset.uid); });
        if(performance.now() - t0 < 5500 && !matchState.over) requestAnimationFrame(f); else res(); }; f(); });
      await new Promise(r=> setTimeout(r, 1200));
      const kept = [...document.querySelectorAll('#rowMine .board-card[data-uid]')].filter(el=> el.__pl2).length, all = document.querySelectorAll('#rowMine .board-card[data-uid]').length;
      const t = hqTileEl('B'), before = t ? getComputedStyle(t, '::before').content : null;
      return {over: !!(matchState && matchState.over), kept, all, hidden: [...new Set(hidden)], fallen: !!(t && t.classList.contains('castle-fallen')), before};"""))
    ok(r['over'] and r['all'] >= 2 and r['kept'] == r['all'], f'00:02 #1 the deciding round keeps every card\'s element at the end (no redraw) {r}')
    ok(not r['hidden'], f'00:02 #1 no card on your row goes hidden while the match ends {r["hidden"]}')
    ok(r['fallen'] and r['before'] in ('none', 'normal', None), f'22:28 #1 the fallen bramble draws no mound (::before content {r["before"]})')
    await pg.evaluate("(()=>{ const c = document.getElementById('wlBackBtn'); if(c) c.click(); })()"); await pg.wait_for_timeout(700)
    await shot(pg, 'end-board-no-mound', w)
    await close(pg)

    # ---------------- 00:02 SS#1: the flyer's Health bar and the artless card
    pg = await page(b, url, w)
    await pg.evaluate(BOARD + "('m11', '20-7', [['fire-ant-raft', -1], ['ant-scout', 0], ['fire-ant-raft', 1]], [['voidfeather-scout', -1], ['ember-tetra', 0]])")
    r = await pg.evaluate(E("""const live = matchState.players[2].row.left[0]; live.maxHp = 7; live.hp = 6; live.baseHp = 5; renderMatchUI(); await new Promise(r=> setTimeout(r, 700));
      const el = [...document.querySelectorAll('#rowEnemy .board-card')].find(x=> x.querySelector('[data-defid="voidfeather-scout"]')); const bar = el && el.querySelector('.eq2-hpbar');
      const ys = []; for(let i = 0; i < 8; i++){ const a = el.querySelector('.card-tile').getBoundingClientRect(), c = bar.getBoundingClientRect(); ys.push(Math.round(c.top - a.top)); await new Promise(r=> setTimeout(r, 240)); }
      const ico = document.querySelector('#rowMine .card-tile.no-art .ico');
      return {inBody: !!(bar && bar.parentElement.classList.contains('fly-body')), spread: Math.max(...ys) - Math.min(...ys), ys, op: ico ? +getComputedStyle(ico).opacity : null};"""))
    ok(r['inBody'] and r['spread'] <= 2, f'00:02 SS#1 the flyer\'s Health bar rides in its .fly-body (bar-to-card offset steady while it sways) {r}')
    ok(r['op'] == 1, f'00:02 SS#1 an artless card\'s emoji is drawn whole {r["op"]}')
    await shot(pg, 'flyer-bar-noart', w, '.battlefield', 0)
    # ---------------- 00:02 #8: the enemy's pills
    r = await pg.evaluate(E("""const m = matchState; m.players[2].lumber = 3; m.players[2].stone = 2; renderMatchUI(); await new Promise(r=> setTimeout(r, 400));
      const p = document.getElementById('fieldResEnemy'), vis = ()=> p ? getComputedStyle(p).visibility : 'none';
      const a = vis(); window.dispatchEvent(new KeyboardEvent('keydown', {key:'Shift'})); await new Promise(r=> setTimeout(r, 250)); const b2 = vis();
      window.dispatchEvent(new KeyboardEvent('keyup', {key:'Shift'})); const c = vis(); return {a, b: b2, c, pills: p ? p.querySelectorAll('.hud-pill').length : 0};"""))
    ok(r['a'] == 'hidden' and r['b'] == 'visible' and r['c'] == 'hidden' and r['pills'] >= 2, f'00:02 #8 the enemy\'s pills show only while Shift is held {r}')
    await pg.evaluate("window.dispatchEvent(new KeyboardEvent('keydown', {key:'Shift'}))")
    await shot(pg, 'enemy-pills-shift', w, '.battlefield', 0)
    await pg.evaluate("window.dispatchEvent(new KeyboardEvent('keyup', {key:'Shift'}))")
    # ---------------- 00:02 #4: Poison ☠N
    r = await pg.evaluate(E("""const u = matchState.players[1].row.center[0].uid; renderVfxForEvent({type:'statusFx', kind:'poison', side:'B', targetUid:u, targetDefId:'ant-scout', amount:2}); await new Promise(r=> setTimeout(r, 150));
      return [...document.querySelectorAll('.dmg-float, .float-text, [class*="float"]')].map(x=> x.textContent.trim()).filter(t=> /2/.test(t)).slice(0, 4);"""))
    ok(any('☠' in t or t.endswith('2') for t in r) and not any('🤢' in t for t in r), f'00:02 #4 the Poison float reads ☠2 {r}')
    await close(pg)

    # ---------------- 22:28 #4 Inspiring (slow motion) and #5 the bounce
    pg = await page(b, url, w)
    u = await pg.evaluate(BOARD + "('m1', '0-2', [['otter-kit', -1, 30], ['otter-flag-bearer', 0, 30], ['otter-kit', 1, 30, 3]], [['otter-kit', 0, 40]])")
    await pg.evaluate(E(f"""const m = matchState; m.replayCards = {{}}; [1].forEach(pid=> ['left','center','right'].forEach(s=> m.players[pid].row[s].forEach(c=>{{ m.replayCards[c.uid] = Object.assign({{}}, c); }})));
      gsap.globalTimeline.timeScale(.12); const ev = t=> ({{type:'statusFx', kind:'inspired', side:'A', attUid:{u['1:0']}, attDefId:'otter-flag-bearer', targetUid:t, targetDefId:'otter-kit', amount:1}});
      renderVfxForEvent(ev({u['1:-1']})); renderVfxForEvent(ev({u['1:1']})); return 1;"""))
    await frames(pg, 'inspire', w, [60, 500, 1000, 1500, 2000, 2500, 3000, 3600, 4300, 5200, 6400, 8000], '#rowMine', 70)
    r = await pg.evaluate(f"(()=>{{ gsap.globalTimeline.timeScale(1); const at = u=> (boardCardEl(u).querySelector('.stats .atk')||{{}}).textContent; return {{left: at({u['1:-1']}), waiting: at({u['1:1']}), self: at({u['1:0']})}}; }})()")
    ok(r['left'].strip().endswith('3') and r['waiting'].strip().endswith('3') and r['self'].strip().endswith('2'), f'22:28 #4 both neighbours (the Waiting one too) show +1 Attack, the inspirer not {r}')
    # #5: a heal bounces, damage does not
    r = await pg.evaluate(E(f"""const m = matchState, rc = m.replayCards[{u['1:-1']}]; const sp = ()=> boardCardEl({u['1:-1']}).querySelector('.stats .hp');
      gsap.globalTimeline.timeScale(.15); rc.hp = 30; rc.maxHp = 34; updateCardHpDisplay({u['1:-1']}); await new Promise(r=> setTimeout(r, 20)); rc.hp = 34; updateCardHpDisplay({u['1:-1']});
      let up = 1; const t0 = performance.now(); while(performance.now() - t0 < 2500){ const n = sp().querySelector('.pl2-num'); if(n){ const s = +gsap.getProperty(n, 'scale') || 1; if(Math.abs(s - 1) > Math.abs(up - 1)) up = s; } await new Promise(r=> requestAnimationFrame(r)); }
      gsap.globalTimeline.timeScale(1); await new Promise(r=> setTimeout(r, 2500)); rc.hp = 30; updateCardHpDisplay({u['1:-1']}); await new Promise(r=> setTimeout(r, 120));
      return {{upScale: up, downWrapped: !!sp().querySelector('.pl2-num'), text: sp().textContent}};"""))
    ok(abs(r['upScale'] - 1) > .03 and not r['downWrapped'] and r['text'].strip().endswith('30'), f'22:28 #5 a Health rise bounces (mid-bounce scale {r["upScale"]:.2f}); damage writes the number plainly {r}')
    r = await pg.evaluate(E(f"""gsap.globalTimeline.timeScale(.12); const rc = matchState.replayCards[{u['1:0']}]; rc.atk = (rc.atk||2) + 2; updateCardAtkDisplay({u['1:0']}); return 1;"""))
    await frames(pg, 'stat-bounce', w, [40, 400, 800, 1300, 1900, 2600, 3400, 4500], f'.board-card[data-uid="{u["1:0"]}"]', 30, cols=8, scale=1.2)
    await pg.evaluate("gsap.globalTimeline.timeScale(1)")
    # ---------------- #7 the bars and 21:54 the bramble's hit / repair (WAAPI slowed)
    await pg.evaluate(E("""const m = matchState; m.players[2].hq.hp = 20; m.players[2].hq.maxHp = 20; m.players[1].hq.hp = 10; m.players[1].hq.maxHp = 20; m.replayCards = null; m.resolving = false; renderMatchUI(); await new Promise(r=> setTimeout(r, 600));
      window.__slow = rate=>{ const t0 = performance.now(); const f = ()=>{ document.getAnimations().forEach(a=>{ if(a.playbackRate !== rate) a.playbackRate = rate; }); if(performance.now() - t0 < 9000) requestAnimationFrame(f); }; f(); };
      gsap.globalTimeline.timeScale(.15); m.players[2].hq.hp = 11; hqHitBigVfx(hqTileEl('B'), 9); updateHqHpDisplay('B'); m.players[1].hq.hp = 16; rebuildVfx({type:'rebuild', side:'A', defId:null, uid:null, amount:6}); __slow(.15); return 1;"""))
    await frames(pg, 'bramble-hit-repair-bars', w, [80, 500, 1000, 1600, 2300, 3200, 4300, 5600], None, 0, cols=4, scale=.45)
    r = await pg.evaluate("(()=>{ gsap.globalTimeline.timeScale(1); const f = document.querySelector('[data-hpribbon=\"B\"] .bf-hp-fill'); return {pct: f && f.dataset.pl2pct, chip: !!document.querySelector('[data-hpribbon=\"B\"] .pl2-hp-chip'), num: (document.querySelector('[data-hpribbon=\"B\"] .bf-hp-num')||{}).textContent}; })()")
    ok(r['pct'] == '55.00' and r['chip'] and r['num'].startswith('11'), f'22:28 #7 their bar eased to 11/20 with the lost-Health chip behind it {r}')
    await close(pg)

    # ---------------- 22:28 #8 + PL1-1: an Arena win's XP waits for the map; the map's queued emblems
    pg = await page(b, url, w)
    r = await pg.evaluate(E("""try{ FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); }catch(e){}
      const x0 = loadXp().xp; startMatch('ai'); await new Promise(r=> setTimeout(r, 2600)); try{ skipTriggerLesson(); }catch(e){}
      const M = matchState; M.players[2].hq.shield = 0; M.players[2].hq.hp = 0; M.forcedWinner = 1; await resolveRound({manual:true, run:()=> true}); await new Promise(r=> setTimeout(r, 3600));
      const bar = !!document.querySelector('.winloss-card .wl-xp'); endMatch(); await new Promise(r=> setTimeout(r, 300));
      const stored = JSON.parse(localStorage.getItem('bramblewood_pl2_xp_pending_v1') || 'null');
      const p = loadConquestProgress(); ['0-1', '0-2'].forEach(k=> completeConquestNode({mapId:'m1', nodeId:k, kind:'skirmish'}, 'A'));
      const q = JSON.parse(localStorage.getItem('bramblewood_pl2_map_moments_v1') || '[]').map(x=> x.map + ':' + x.key);
      return {gained: loadXp().xp - x0, bar, stored: !!stored, q};"""))
    ok(r['gained'] > 0 and not r['bar'] and r['stored'], f'#8 / PL1-1 an Arena win: no XP bar on its results, the XP waits (stored) for the map {r}')
    ok('m1:0-1' in r['q'] and 'm1:0-2' in r['q'], f'#8 two fights won without seeing the map are queued {r["q"]}')
    await pg.evaluate("(()=>{ conquestWorldView = false; conquestSelectedMap = 'm1'; conquestSelectedNodeKey = null; playSubTab = 'conquest'; switchTab('play'); })()")
    seen = {'emblem': 0, 'xp': 0}
    for i in range(40):
        s = await pg.evaluate("({e: document.querySelectorAll('.fxe-pl1-rank').length, x: document.querySelectorAll('.pl1-xp-float').length})")
        seen['emblem'] = max(seen['emblem'], s['e']); seen['xp'] = max(seen['xp'], s['x'])
        if i == 6 and s['e']: await shot(pg, 'map-emblem-replayed', w)
        if s['x'] and not seen.get('xpshot'): seen['xpshot'] = 1; await pg.wait_for_timeout(600); await shot(pg, 'map-xp-after-arena', w)
        if seen['emblem'] and seen.get('xpshot'): break
        await pg.wait_for_timeout(250)
    r = await pg.evaluate("({q: localStorage.getItem('bramblewood_pl2_map_moments_v1'), x: localStorage.getItem('bramblewood_pl2_xp_pending_v1')})")
    ok(seen['emblem'] >= 1 and seen['xp'] >= 1 and not r['q'] and not r['x'], f'#8 back on the map the emblems play, then the XP fills; both queues are spent {seen} {r}')
    await close(pg)

    # ---------------- 00:02 #3 #5: card rewards as one stack; the rank ribbon; no Rare find pill
    pg = await page(b, url, w)
    r = await pg.evaluate(E("""try{ FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); }catch(e){} adminModeEnabled = false;
      switchTab('play'); startConquestMatch('m1', '0-2', {skipEnergyCost:true, noOpener:true}); await new Promise(r=> setTimeout(r, 2600));
      const M = matchState; M.players[2].hq.shield = 0; M.players[2].hq.hp = 0; M.forcedWinner = 1; await resolveRound({manual:true, run:()=> true}); await new Promise(r=> setTimeout(r, 3800));
      const m = matchState; m.conquestCardsEarned = ['otter-kit', 'voidfeather-scout', 'egg-bug']; m.conquestRareFind = 'voidfeather-scout'; m.conquestRankEarned = 'S';
      const mats = Object.keys(getCardDefs()).filter(id=> /materia/.test(id)).slice(0, 1); m.conquestMateriaEarned = mats.length ? {[mats[0]]: 2} : null;
      renderMatchUI(); await new Promise(r=> setTimeout(r, 1600));
      const st = document.querySelector('.rw-cards.pl2-stack'), first = st && st.querySelector('.pl2-sk .rw-card');
      return {stack: !!st, n: st ? st.querySelectorAll('.pl2-sk').length : 0, top: first ? first.className : '', pill: [...document.querySelectorAll('.winloss-card .hud-pill')].some(p=> /Rare find/i.test(p.textContent)), count: (document.querySelector('.pl2-stack-n')||{}).textContent};"""))
    ok(r['stack'] and r['n'] == 4 and 'pl2-rank-reward' in r['top'] and r['count'] == '×4', f'00:02 #3 #5 four card rewards as one stack, the rank-won card in front with its ribbon {r}')
    ok(not r['pill'], '00:02 #5 no "Rare find" pill on the results')
    await shot(pg, 'reward-stack', w, '.rw-panel', 10)
    await pg.focus('.rw-cards.pl2-stack'); await pg.wait_for_timeout(800)
    await shot(pg, 'reward-stack-fanned', w, '.rw-unlocks', 40)
    await close(pg)

    # ---------------- 22:28 #9: the pack card detail and the popover over the opener
    pg = await page(b, url, w)
    r = await pg.evaluate(E("""const defs = getCardDefs();
      const id = Object.keys(defs).find(k=>{ try{ const s = cardSourceOf(defs[k]); return s && s.kind === 'pack' && Number(s.tier) === 1 && defs[k].faction !== 'base'; }catch(e){ return false; } });
      openCardInspector(id, {pull: {foil:false, finish:null, shiny:false}}); await new Promise(r=> setTimeout(r, 1500));
      const det = document.querySelector('.ci-detail'), pill = det && det.querySelector('.pl2-where-pill'), h3 = det && det.querySelector('.cd-abilities h3');
      return {pill: pill ? pill.textContent.trim() : null, tip: pill ? pill.title : null, label: !!(det && det.querySelector('.cd-where-k')), h3: h3 ? getComputedStyle(h3).color : null};"""))
    ok(r['pill'] and r['pill'].endswith('Pack 1') and r['tip'] and not r['label'], f'#9 the pack card detail says "📦 Pack 1" (its pack\'s name in the tooltip), no "Where to get it" {r}')
    await shot(pg, 'pack-detail', w, '.ci-detail', 8)
    await pg.evaluate("(()=>{ document.querySelectorAll('.card-inspect').forEach(x=> x.remove()); })()")
    r = await pg.evaluate(E("""try{ FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); }catch(e){}
      const pack = shopPacksAll().find(p=> p.id === 'bronze') || shopPacksAll()[0]; openPackAnimation(pack, [purchasePackOnce(pack, false)], {}); await new Promise(r=> setTimeout(r, 1200));
      document.getElementById('poStrip').click(); await new Promise(r=> setTimeout(r, 2800)); const ov = document.getElementById('packOpenOverlay');
      ov.querySelector('.po2-card').click(); await new Promise(r=> setTimeout(r, 1200));
      const t = ov.querySelector('[data-defid]'); t.dispatchEvent(new MouseEvent('mouseover', {bubbles:true, relatedTarget: document.body})); await new Promise(r=> setTimeout(r, 1300));
      const pop = document.getElementById('cardPop'); return {shown: !pop.hidden, z: +getComputedStyle(pop).zIndex, ovz: +getComputedStyle(ov).zIndex};"""))
    ok(r['shown'] and r['z'] > r['ovz'], f'#9 a 1 s hover on a pulled card opens its details over the pack opener {r}')
    await shot(pg, 'pack-hover-detail', w)
    await close(pg)

    # ---------------- 00:02 #6: the one-step trigger lesson
    pg = await page(b, url, w, DONE_TIPS)
    await pg.evaluate("(()=>{ ['tl-what','tl-when','trig-off','trig-on'].forEach(k=> coachSeen.delete(k)); coachSeen.add('castle-shield'); })()")  # (the bramble's Shield tip would come first)
    await pg.evaluate(BOARD + "('m11', '20-7', [['otter-kit', 0, 9]], [['forager-ant', 0, 9]])")
    # (another first-time tip may come first in maybeShowCoachTip's order: the lesson's own tip is shown directly)
    await pg.evaluate("(async()=>{ matchState.resolving = false; try{ hideCoachTip(); }catch(e){} const t = triggerLessonTip(matchState); if(t) showCoachTip(t); await new Promise(r=> setTimeout(r, 2200)); })()")
    r = await pg.evaluate("(()=>{ const t = document.querySelector('.coach-tip'); return t ? {id: coachOpen && coachOpen.tip.id, text: t.querySelector('.coach-text').textContent, btns: [...t.querySelectorAll('button')].map(b=> b.textContent.trim())} : null; })()")
    ok(r and r['id'] == 'tl-what' and 'read the card' in r['text'] and r['btns'] == ['Got it'], f'00:02 #6 one step: "This chip is a trigger — read the card." with Got it {r}')
    await shot(pg, 'trigger-lesson', w)
    await close(pg)

    # ---------------- 00:02 #7 Energy; 22:28 #6 Whisper; PL1-3 Dungeons / Co-op; PRO-UI
    pg = await page(b, url, w)
    r = await pg.evaluate(E("""addEnergyCapsules(3); openEnergyPanel(document.getElementById('energyPill') || document.body); await new Promise(r=> setTimeout(r, 300));
      const p = document.getElementById('energyPanel'), cap = document.getElementById('epCapsule');
      return {count: (p.querySelector('.ep-count')||{}).textContent, cap: cap ? cap.textContent.trim() : null, tip: cap ? cap.title : null, words: /Energy capsules/.test(p.innerText), grow: !!p.querySelector('.ep-grow')};"""))
    ok(r['cap'] and '×3' in r['cap'] and r['cap'].endswith('Use') and 'Energy capsules' in (r['tip'] or '') and not r['words'] and not r['grow'], f'00:02 #7 the Energy panel: the count, the refill line, free Energy and 🔋×3 Use (capsules named in the tooltip) {r}')
    await shot(pg, 'energy-panel', w, '#energyPanel', 12)
    await pg.evaluate("closeEnergyPanel()")
    r = await pg.evaluate(E("""try{ FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); }catch(e){} const p = loadConquestProgress(); mainConquestMaps().slice(0, 4).forEach(mp=> mp.nodes.forEach(n=>{ const id = conquestNodeId(mp.id, n.key); if(!p.completed.includes(id)) p.completed.push(id); })); saveConquestProgress(p);
      adminModeEnabled = false; devModeEnabled = false; const pl = {whisper: tabOpen('autobattle'), dungeons: dungeonsTabOpen(), gd: gdPlayerOpen()};
      adminModeEnabled = true; const ad = {whisper: tabOpen('autobattle'), dungeons: dungeonsTabOpen()}; adminModeEnabled = false;
      playSubTab = 'arena'; pl2ArenaPane = 'coop'; switchTab('play'); await new Promise(r=> setTimeout(r, 900));
      const tabs = [...document.querySelectorAll('.play-subtabs [data-playtab]')].map(b=> b.dataset.playtab);
      return {pl, ad, tabs, coop: !!document.querySelector('.pl2-coop-panel .dg-group'), ctabs: [...document.querySelectorAll('.pl2-arena-tabs .tab-btn')].map(b=> b.textContent.trim())};"""))
    ok(not r['pl']['whisper'] and r['ad']['whisper'], f'22:28 #6 Whisper\'s Game: Admin Mode only {r["pl"]} {r["ad"]}')
    ok(not r['pl']['dungeons'] and r['pl']['gd'] and 'dungeons' not in r['tabs'] and r['coop'] and len(r['ctabs']) == 2, f'PL1-3 no Dungeons tab; the Arena\'s Co-op tab holds the Group Dungeon {r}')
    await shot(pg, 'arena-coop', w)
    r = await pg.evaluate(E("""pl2OpenCoopPop(); await new Promise(r=> setTimeout(r, 400)); return {pop: !!document.querySelector('.pl2-coop-pop .dg-group'), spot: !!FEATURE_SPOTS.find(s=> s.key === 'coop')};"""))
    ok(r['pop'] and r['spot'], f'PL1-3 the map\'s 👥 spot opens the Group Dungeon {r}')
    await shot(pg, 'map-coop-pop', w)
    await pg.evaluate("document.querySelectorAll('.pl2-coop-pop').forEach(x=> x.remove())")
    r = await pg.evaluate(E("""adminModeEnabled = true; pl2ProPreview('2-BPRO-1'); await new Promise(r=> setTimeout(r, 1500));
      const p = document.getElementById('conquestNodePanel'); return {sel: conquestSelectedNodeKey, panel: !!(p && !p.hidden), fight: !!document.getElementById('cnpFightBtn'), rewards: !!(p && p.querySelector('.cnp-rw') && p.querySelector('.cnp-rw').offsetParent), match: !!matchState};"""))
    ok(r['sel'] == '2-BPRO-1' and r['panel'] and r['fight'] and not r['rewards'] and not r['match'], f'PRO-UI a BPRO click opens its fight panel (no rewards shown), nothing starts yet {r}')
    await shot(pg, 'pro-preview', w)
    await pg.click('#cnpFightBtn'); await pg.wait_for_timeout(1500)
    r = await pg.evaluate("({pro: matchState && matchState.proFight, admin: !!(matchState && matchState.adminTest)})")
    ok(r['pro'] == '2-BPRO-1' and r['admin'], f'PRO-UI its Fight button starts the BPRO fight, free {r}')
    # ---------------- 00:02 #9 #10: the prong tings; the results' music
    r = await pg.evaluate(E("""const calls = []; const k = SoundKit; const orig = k.swipeTone; k.swipeTone = ()=> calls.push('swipe'); const o2 = k.prongTone; let kinds = []; k.prongTone = kind=>{ kinds.push(kind); };
      forkSwingVfx({type:'forkSwing', side:'A', attUid: (matchState.players[1].row.center[0]||matchState.players[1].row.left[0]||matchState.players[1].row.right[0]||{}).uid, kind:'trident', lines:[]}); await new Promise(r=> setTimeout(r, 900));
      k.swipeTone = orig; k.prongTone = o2;
      const M = matchState; M.players[2].hq.shield = 0; M.players[2].hq.hp = 0; M.forcedWinner = 1; await resolveRound({manual:true, run:()=> true}); await new Promise(r=> setTimeout(r, 3600));
      const during = {res: pl2ResultsPhase(), place: songbookPlace()}; endMatch(); await new Promise(r=> setTimeout(r, 300)); const after = {res: pl2ResultsPhase(), place: songbookPlace()};
      return {kinds, swipe: calls.length, during, after};"""))
    ok(r['kinds'] == ['trident'] and r['swipe'] == 0, f'00:02 #9 a Trident swing plays its own tings (prongTone) {r["kinds"]}')
    ok(r['during']['res'] and r['during']['place'] in ('battle', 'boss', 'elite') and not r['after']['res'] and r['after']['place'] not in ('battle', 'boss', 'elite'), f'00:02 #10 the results keep the fight\'s theme (ducked); the map\'s starts after leaving {r["during"]} -> {r["after"]}')
    await close(pg)

async def main(a):
    httpd = serve(); url = f'http://127.0.0.1:{httpd.server_address[1]}/index.html'
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME if os.path.exists(CHROME) else None, args=['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'])
        for w in [int(x) for x in a.widths.split(',')]: await run(b, url, w)
        await b.close()
    httpd.shutdown()
    if a.keep:
        from PIL import Image
        os.makedirs(KEEP, exist_ok=True)
        for f in shots:
            im = Image.open(f).convert('RGB'); im.save(os.path.join(KEEP, os.path.basename(f)[:-4] + '.jpg'), quality=78)
        print('kept', len(shots), 'in', KEEP)
    print('shots:', len(shots), 'in', OUT)
    print('FAILED' if fails else 'all checks passed', len(fails))
    sys.exit(1 if fails else 0)

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--widths', default='390,1366'); ap.add_argument('--keep', action='store_true')
    asyncio.run(main(ap.parse_args()))
