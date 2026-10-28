#!/usr/bin/env python3
"""Package VIS4 (2026-10-27): browser checks and recorded frames at 390 and 1366 for the owner's 10-27 11:22 notes.
  K1 the boss node's teeth: smaller, red.
  K4 Rampart in a REAL round (resolveRound, the replay as a player sees it): it steps toward its bramble, holds through the blow with an aura,
     steps back; the block lands with the blow (the 'rampart' event takes no beat of its own).
  K7 Shield hits in a real round: the rectangle lights up (no ring / zig-zag cracks); a broken Shield's number counts down to 0, then goes.
  K8 the fight panel lists the map's cards (no locked rarity shown; never-seen cards are the ❓ back; an admin sees all).
  K9 the avalanche's steps wait 30% of their usual beat.
  K16 the copy-cap tips in the deck editor, each once.

    python3 tests/e2e/vis4_2026_10_27.py              # checks + shots in tests/out/shots/vis4-*.png
    python3 tests/e2e/vis4_2026_10_27.py --keep       # also copies the main shots and frame sheets into docs/screens/VIS4/

How the real rounds are recorded: this machine's headless Chromium draws a frame only when asked (a screenshot), so the round runs in slow
motion (every timer x S, GSAP's time scale and the Web Animations' playback rate / S) and the frames around the moment are screenshots, each
stamped with its game time. Build first. Exits 1 on a failed check.
"""
import argparse, asyncio, os, sys, shutil, subprocess, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vis3_2026_10_26 as V  # serve, BOARD, OPEN, SKIP, OWN, CHROME
from playwright.async_api import async_playwright
ROOT = V.ROOT
OUT = os.path.join(ROOT, 'tests', 'out', 'shots', 'vis4'); os.makedirs(OUT, exist_ok=True)
KEEP = os.path.join(ROOT, 'docs', 'screens', 'VIS4')
S = 25  # slow motion
fails = []; shots = []; PARTS = {'k4', 'k7', 'map', 'k16'}
def ok(cond, msg):
    print(('  ok  ' if cond else '  FAIL ') + msg, flush=True)
    if not cond: fails.append(msg)

async def fresh(b, url, w, coach=False):
    ctx = await b.new_context(viewport={'width': w, 'height': 844 if w < 700 else 860}, has_touch=(w < 700))
    pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg._errs = errs; pg._ctx = ctx
    await pg.add_init_script(V.SKIP)
    await pg.goto(url); await pg.wait_for_function("typeof switchTab === 'function' && typeof startConquestMatch === 'function'", timeout=90000); await pg.wait_for_timeout(1500)
    own = V.OWN if not coach else V.OWN.replace(" window.showCoachTip = ()=>{}; window.maybeShowCoachTip = ()=>{};", "")
    await pg.evaluate("(()=>{ " + own + " })()")
    return pg

async def close(pg):
    ok(not pg._errs, f'no page errors {pg._errs[:2]}')
    await pg._ctx.close()

async def shot(pg, name, w, clip=None, pad=24):
    f = os.path.join(OUT, f'vis4-{name}-{w}.png')
    h = await pg.query_selector(clip) if clip else None
    bb = await h.bounding_box() if h else None
    if bb: await pg.screenshot(path=f, clip={'x': max(0, bb['x'] - pad), 'y': max(0, bb['y'] - pad), 'width': bb['width'] + 2 * pad, 'height': bb['height'] + 2 * pad}, animations='allow')
    else: await pg.screenshot(path=f, animations='allow')
    shots.append(f); return f

SLOW = """(S=>{ window.__log = []; window.__t0 = performance.now(); const L = (s, x)=> window.__log.push([Math.round((performance.now() - window.__t0) / S), s, x]); window.__L = L;
  window.__gt = ()=> Math.round((performance.now() - window.__t0) / S);
  const st = window.setTimeout; window.setTimeout = (f, ms, ...a)=> st(f, (ms||0) * S, ...a); const si = window.setInterval; window.setInterval = (f, ms, ...a)=> si(f, (ms||0) * S, ...a);
  const tl = gsap.globalTimeline, ots = tl.timeScale.bind(tl); tl.timeScale = v=> v === undefined ? ots() * S : ots(v / S); tl.timeScale(1); gsap.ticker.lagSmoothing(0);
  window.syncFightTimeScale = ()=>{ gsap.globalTimeline.timeScale(1); gsap.ticker.lagSmoothing(0); };
  const rv = window.renderVfxForEvent; window.renderVfxForEvent = function(ev){ L('ev', ev.type + (ev.uid != null ? ':' + ev.uid : '') + (ev.targetUid != null ? '>' + ev.targetUid : '')); return rv.apply(this, arguments); };
  matchState.speedMult = 1; matchState.resolving = false; })"""

async def record_round(pg, w, tag, trigger, span, state_js):
    """Run one real round in slow motion; screenshot the battlefield from the first `trigger` event for `span` game ms. Returns (frames, log)."""
    await pg.evaluate(SLOW + f"({S})")
    cdp = await pg._ctx.new_cdp_session(pg)
    await cdp.send('Animation.enable'); await cdp.send('Animation.setPlaybackRate', {'playbackRate': 1 / S})
    clip = await pg.evaluate("(()=>{ const r = document.getElementById('battlefieldEl').getBoundingClientRect(); return {x:r.x, y:Math.max(0, r.y - 10), width:r.width, height:r.height + 60}; })()")
    await pg.evaluate("void (window.__rr = resolveRound({manual:true}).then(()=> window.__done = true))")
    frames = []; t_on = None; d = os.path.join(OUT, f'frames-{tag}-{w}'); shutil.rmtree(d, ignore_errors=True); os.makedirs(d)
    for _ in range(3000):
        st = await pg.evaluate(f"(()=>{{ const e = window.__log.find(x=> x[1] === 'ev' && x[2].indexOf('{trigger}') === 0); return {{t: window.__gt(), on: e ? e[0] : null, done: !!window.__done}}; }})()")
        if st['on'] is not None and t_on is None: t_on = st['on']
        if t_on is not None and st['t'] <= t_on + span:
            s = await pg.evaluate(state_js); s['t'] = await pg.evaluate("window.__gt()")
            f = os.path.join(d, f"{s['t']:06d}.png"); await pg.screenshot(path=f, clip=clip, animations='allow'); s['f'] = f; frames.append(s)
        elif st['done'] or (t_on is not None and st['t'] > t_on + span): break
        else: await pg.wait_for_timeout(120)
    for _ in range(600):
        if await pg.evaluate("!!window.__done"): break
        await pg.wait_for_timeout(200)
    return frames, await pg.evaluate("window.__log")

def sheet(frames, name, w, n=6):
    """A contact sheet of up to n frames, spread over the recorded ones."""
    if not frames: return None
    pick = [frames[round(i * (len(frames) - 1) / max(1, n - 1))] for i in range(min(n, len(frames)))]
    out = os.path.join(OUT, f'vis4-{name}-{w}.png'); cols = 3 if w > 700 else 2
    args = ['ffmpeg', '-y', '-v', 'error']
    for p in pick: args += ['-i', p['f']]
    rows = (len(pick) + cols - 1) // cols
    fl = ''.join(f"[{i}:v]scale={'683' if w > 700 else '390'}:-2,drawtext=text='{p['t']} ms':x=6:y=6:fontsize=16:fontcolor=white:box=1:boxcolor=black@0.6[v{i}];" for i, p in enumerate(pick))
    # xstack needs explicit positions: every tile has the first frame's size
    h0 =subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', pick[0]['f']], capture_output=True, text=True).stdout.strip().split(',')
    sw = 683 if w > 700 else 390; sh_ = round(int(h0[1]) * sw / int(h0[0]) / 2) * 2
    lay = '|'.join(f"{(i % cols) * sw}_{(i // cols) * sh_}" for i in range(len(pick)))
    fl += ''.join(f'[v{i}]' for i in range(len(pick))) + f"xstack=inputs={len(pick)}:layout={lay}:fill=black" if len(pick) > 1 else '[v0]null'
    subprocess.run(args + ['-filter_complex', fl, '-frames:v', '1', out], check=False)
    shots.append(out); return out

OFF = "(el=> el ? Math.round(Math.hypot(parseFloat(el.style.left) || 0, parseFloat(el.style.top) || 0)) : -1)"

async def run(b, url, w):
    print(f'-- width {w}', flush=True)
    if 'k4' in PARTS:
        # ---- K4: a real round. Yours: a Dam-Keeper Beaver (Rampart) at slot 1, an Otter Kit at -1; theirs: an Otter Kit at 0, whose hit on your
        # empty column 0 reaches the bramble and the Beaver (next column) takes its share.
        pg = await fresh(b, url, w)
        u = await pg.evaluate(V.BOARD + "([['dam-keeper-beaver', 1, 9], ['otter-kit', -1, 9]], [['otter-kit', 0, 9]])")
        frames, log = await record_round(pg, w, 'rampart', 'rampart', 1300, f"""(()=>{{ const el = document.querySelector('.board-card[data-uid="{u['1:1']}"]');
          return {{off: {OFF}(el), aura: document.querySelectorAll('.vis3-block-aura').length, blocking: !!(el && el.classList.contains('vis3-blocking'))}}; }})()""")
        ev = [x for x in log if x[1] == 'ev']; ri = next((i for i, x in enumerate(ev) if x[2].startswith('rampart')), None)
        ok(ri is not None, f"K4. the real round plays a 'rampart' event {[x[2] for x in ev]}")
        if ri is not None and ri + 1 < len(ev):
            gap = ev[ri + 1][0] - ev[ri][0]
            ok(ev[ri + 1][2].startswith('hitHQ') and gap <= 60, f"K4. the hit it shares starts with it ({gap} ms later; was 150)")
        peak = max([f['off'] for f in frames] or [0]); with_aura = [f for f in frames if f['aura'] > 0]
        sc = await pg.evaluate("(typeof battlefieldScale === 'number' && battlefieldScale > 0) ? battlefieldScale : 1")
        ok(peak * sc >= 24, f"K4. it steps toward its bramble: {peak} px on the board (x{sc:.2f} on screen; VIS3's step was at most 38 px on screen) {[(f['t'], f['off'], f['aura']) for f in frames]}")
        ok(with_aura and min(f['off'] for f in with_aura) >= 10, f"K4. the aura shows while it stands stepped out {[(f['t'], f['off']) for f in with_aura]}")
        end = await pg.evaluate(f"""(()=>{{ const el = document.querySelector('.board-card[data-uid="{u['1:1']}"]'); return {{off: {OFF}(el), blocking: !!(el && el.classList.contains('vis3-blocking'))}}; }})()""")
        ok(end['off'] == 0 and not end['blocking'], f"K4. it is back in its slot after the round {end}")
        sheet(frames, 'rampart-real-frames', w)
        await close(pg)

    if 'k7' in PARTS:
        # ---- K7: a real round. Yours: Shield 1 at slot 0 (theirs at 0 hits it for 2: the Shield breaks), Shield 3 at slot 1 (hit for 2: 3 -> 1).
        pg = await fresh(b, url, w)
        u = await pg.evaluate(V.BOARD + "([['otter-kit', 0, 9, {shield: 1}], ['otter-kit', 1, 9, {shield: 3}]], [['otter-kit', 0, 9], ['otter-kit', 1, 9]])")
        frames, log = await record_round(pg, w, 'shield', 'shieldSoak', 4200, f"""(()=>{{ const num = uid=> {{ const e = document.querySelector('.board-card[data-uid="' + uid + '"] .card-tile > .vis3-shield-num'); return e ? e.textContent + (e.classList.contains('vis4-shield-out') ? 'o' : '') : ''; }};
          return {{a: num({u['1:0']}), b: num({u['1:1']}), rect: document.querySelectorAll('.vis4-shield-rect').length, pane: document.querySelectorAll('.vis4-shield-pane').length, dome: document.querySelectorAll('.fxa-dome').length, crack: document.querySelectorAll('body > svg path[stroke="#fff"]').length}}; }})()""")
        ev = [x for x in log if x[1] == 'ev']; si = [i for i, x in enumerate(ev) if x[2].startswith('shieldSoak')]
        ok(len(si) == 2, f"K7. two Shields soak in the real round {[x[2] for x in ev]}")
        if si and si[0] + 1 < len(ev): ok(ev[si[0] + 1][0] - ev[si[0]][0] <= 60, f"K7. the hit it soaks starts with it ({ev[si[0] + 1][0] - ev[si[0]][0]} ms)")
        ok(any(f['rect'] for f in frames) and any(f['pane'] for f in frames), f"K7. the rectangle lights up and the broken one falls into panes {[(f['t'], f['rect'], f['pane']) for f in frames]}")
        ok(not any(f['dome'] or f['crack'] for f in frames), "K7. no FX.A dome, ring or zig-zag cracks")
        ok(any(f['a'] in ('0', '0o') for f in frames), f"K7. the broken Shield's number shows 0 before it goes {[(f['t'], f['a']) for f in frames]}")
        seq_b = [f['b'] for f in frames]
        ok('1' in seq_b and seq_b.index('1') > 0, f"K7. the other counts down to 1 {[(f['t'], f['b']) for f in frames]}")
        end = await pg.evaluate(f"""(()=>{{ const q = uid=> {{ const e = document.querySelector('.board-card[data-uid="' + uid + '"] .card-tile > .vis3-shield-num'); return e ? e.textContent : ''; }}; return [q({u['1:0']}), q({u['1:1']})]; }})()""")
        ok(end == ['', '1'], f"K7. after the round: no number on the broken one, 1 on the other {end}")
        sheet(frames, 'shield-real-frames', w)
        await close(pg)

    if 'map' in PARTS:
        # ---- K9, K1, K8 on one page
        pg = await fresh(b, url, w)
        r = await pg.evaluate("""(()=>{ const D = ev=> delayForEvent(ev, null); const plain = D({type:'hit', ranged:true, attUid:5, targetUid:7});
          const seq = [D({type:'avalanche', attUid:5, hits:[7, 8]}), D({type:'statusFx', kind:'avalancheWait', attUid:5, targetUid:7}), D({type:'hit', ranged:true, attUid:5, targetUid:7}),
            D({type:'death', uid:7}), D({type:'statusFx', kind:'avalancheWait', attUid:5, targetUid:8}), D({type:'hit', ranged:true, attUid:5, targetUid:8}), D({type:'hit', attUid:6, targetUid:5}), D({type:'hit', ranged:true, attUid:5, targetUid:8})];
          return {plain, seq, wait0: D({type:'statusFx', kind:'avalancheWait', attUid:5, targetUid:7})}; })()""")
        s = r['seq']
        ok(s[2] == round(r['plain'] * .3) and s[5] == s[2] and s[1] == round(r['wait0'] * .3) and s[3] == 900 and s[7] == r['plain'],
           f"K9. the avalanche's hits wait 30% of a ranged hit's beat ({s[2]} vs {r['plain']}), its +1 Wait notes 30% too, a death keeps its beat, and the run ends after its last hit {r}")
        # K1: the boss node 5-7 on Map 5
        await pg.evaluate(V.OPEN, ['mw', '5-7']); await pg.wait_for_timeout(1500)
        r = await pg.evaluate("""(()=>{ const f = document.querySelector('.map-node[data-lkey="5-7"] .vis3-skull-frame'); if(!f) return null; const cs = getComputedStyle(f), b = getComputedStyle(f, '::before');
          return {inset: cs.top, bg: b.backgroundImage.slice(0, 120), mask: (b.maskImage || b.webkitMaskImage || '').slice(0, 90)}; })()""")
        ok(r and r['inset'] == '-6px' and 'rgb(224, 80, 58)' in r['bg'] and '6px' in r['mask'], f"K1. the boss node's teeth: closer (-6 px, was -10), red, shorter (6 px, was 9) {r}")
        await shot(pg, 'boss-node-5-7', w, '.map-node[data-lkey="5-7"]', 46)
        # K8: the fight panel of 5-5 for a player who has reached Map 5 (only Maps 1-5 cleared: rarities above that stay locked)
        r = await pg.evaluate("""(async()=>{ const p = loadConquestProgress(), mains = mainConquestMaps(), i5 = mains.findIndex(m=> m.id === 'mw');
          p.completed = p.completed.filter(id=> { const mid = id.split(':')[0]; const k = mains.findIndex(m=> m.id === mid); return k >= 0 && k <= i5 && id !== conquestNodeId('mw', '5-5'); });
          saveConquestProgress(p); adminModeEnabled = false; conquestSelectedMap = 'mw'; conquestSelectedNodeKey = '5-5'; renderPlay(); await new Promise(r=> setTimeout(r, 700));
          const box = document.querySelector('#conquestNodePanel .vis4-map-cards'); if(!box) return {box: false};
          const defs = getCardDefs(), pool = mapPoolIds('mw').filter(id=> defs[id] && !defs[id].token && !defs[id].test && !isEasterEgg(defs[id])), reach = trackMapReached();
          const shownIds = [...box.querySelectorAll('.vis4-mc-card[data-zoom]')].map(e=> e.dataset.zoom), myst = box.querySelectorAll('.vis4-mc-card.is-mystery').length;
          const lockEl = box.querySelector('.vis4-mc-locked'), locked = pool.filter(id=> !rarityRevealedForPlayer(defs[id].rarity, reach)).length;
          return {box: true, reach, pool: pool.length, shown: shownIds.length, myst, locked, lockTxt: lockEl ? lockEl.textContent : '', badShown: shownIds.filter(id=> !rarityRevealedForPlayer(defs[id].rarity, reach) || isCardHiddenForPlayer(defs[id])),
            title: box.querySelector('.vis4-mc-h').textContent}; })()""")
        ok(r['box'] and r['shown'] + r['myst'] + r['locked'] == r['pool'] and not r['badShown'] and (not r['locked'] or r['lockTxt'].endswith('+' + str(r['locked']))),
           f"K8. the fight panel lists the map's cards: seen ones as cards, never-seen as ❓, locked rarities only counted {r}")
        await shot(pg, 'fight-panel-map-cards', w, '#conquestNodePanel', 8)
        await pg.evaluate("document.querySelector('#conquestNodePanel .vis4-map-cards').scrollIntoView({block:'center'})"); await pg.wait_for_timeout(300)
        await shot(pg, 'map-cards-section', w, '#conquestNodePanel .vis4-map-cards', 8)  # on a phone the panel scrolls: the section itself
        r = await pg.evaluate("""(async()=>{ adminModeEnabled = true; renderPlay(); await new Promise(r=> setTimeout(r, 700)); const box = document.querySelector('#conquestNodePanel .vis4-map-cards');
          const defs = getCardDefs(); return {shown: box ? box.querySelectorAll('.vis4-mc-card[data-zoom]').length : 0, pool: mapPoolIds('mw').filter(id=> defs[id] && !defs[id].token && !defs[id].test && !isEasterEgg(defs[id])).length}; })()""")
        ok(r['shown'] == r['pool'], f"K8. an admin sees the whole pool {r}")
        await shot(pg, 'fight-panel-map-cards-admin', w, '#conquestNodePanel', 8)
        await close(pg)

    if 'k16' in PARTS:
        # ---- K16: the copy-cap tips (a page without the test's coach-tip stub)
        pg = await fresh(b, url, w, coach=True)
        r = await pg.evaluate("""(async()=>{ coachSeen.delete('vis4-cap'); coachSeen.delete('vis4-cap-rare'); hideCoachTip(); const defs = getCardDefs();
          const pick = r => Object.keys(defs).find(id=> { const d = defs[id]; return d && d.rarity === r && !d.token && !d.test && !d.isCastle && d.cardType !== 'spell' && !d.locked && id !== myLeaderId && editionRootId(d) === id; });
          const c = pick('common'), q = pick('rare'); for(let i = 0; i < 6; i++){ unlockCardForPlayer(c, 'test'); unlockCardForPlayer(q, 'test'); }
          myDeckCounts[c] = 4; myDeckCounts[q] = 2; saveMyDeck(); deckOpenBuilderOnce = true; deckShowList = false; deckEditingId = activeDeckId; switchTab('deck'); await new Promise(r=> setTimeout(r, 900)); renderMyDeckPanels();
          const add = id=> deckCardClick({}, id, myDeckCounts, '#myDeckPool', '#myDeckList', ()=>{ saveMyDeck(); renderMyDeckPanels(); }, true);
          add(c); await new Promise(r=> setTimeout(r, 500)); const t1 = (document.querySelector('.coach-tip .coach-text')||{}).textContent || '';
          return {c, q, n: myDeckCounts[c], t1, want: TX('ui.vis4-cap-tip', {n: 5}), seen: coachSeen.has('vis4-cap')}; })()""")
        ok(r['n'] == 5 and r['t1'] == r['want'] and r['seen'], f"K16. 5/5 on a Common: the tip shows once {r}")
        await pg.screenshot(); await pg.wait_for_timeout(400)  # a frame first: the tip's fade-in runs on drawn frames
        await shot(pg, 'cap-tip-common', w)
        r = await pg.evaluate("""(async()=>{ const b = document.querySelector('.coach-tip .coach-ok'); if(b) b.click(); await new Promise(r=> setTimeout(r, 300)); const c = '""" + r['c'] + """', q = '""" + r['q'] + """';
          const add = id=> deckCardClick({}, id, myDeckCounts, '#myDeckPool', '#myDeckList', ()=>{ saveMyDeck(); renderMyDeckPanels(); }, true);
          myDeckCounts[c] = 4; add(c); await new Promise(r=> setTimeout(r, 500)); const again = !!document.querySelector('.coach-tip');
          add(q); await new Promise(r=> setTimeout(r, 500)); const t2 = (document.querySelector('.coach-tip .coach-text')||{}).textContent || '';
          return {again, nq: myDeckCounts[q], t2, want: TX('ui.vis4-cap-tip-rare', {n: 3})}; })()""")
        ok(not r['again'] and r['nq'] == 3 and r['t2'] == r['want'], f"K16. the Common tip does not come back; 3/3 on a Rare shows the rarer-card tip {r}")
        await pg.screenshot(); await pg.wait_for_timeout(400)  # a frame first: the tip's fade-in runs on drawn frames
        await shot(pg, 'cap-tip-rare', w)
        await close(pg)

async def main(a):
    httpd = V.serve(); url = f'http://127.0.0.1:{httpd.server_address[1]}/index.html'
    async with async_playwright() as p:
        exe = V.CHROME if os.path.exists(V.CHROME) else '/opt/pw-browsers/chromium'
        b = await p.chromium.launch(executable_path=exe, args=['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'])
        global PARTS; PARTS = set(a.parts.split(','))
        for w in [int(x) for x in a.widths.split(',')]: await run(b, url, w)
        await b.close()
    httpd.shutdown()
    if a.keep:
        os.makedirs(KEEP, exist_ok=True)
        for f in shots:
            if f and os.path.exists(f) and any(k in f for k in ('rampart-real-frames', 'shield-real-frames', 'boss-node', 'fight-panel-map-cards-1366', 'fight-panel-map-cards-admin-1366', 'map-cards-section', 'cap-tip')): shutil.copy(f, KEEP)
    print('\n'.join(x for x in shots if x)); print(('FAILED: ' + str(len(fails))) if fails else 'all ok')
    sys.exit(1 if fails else 0)

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--widths', default='390,1366'); ap.add_argument('--parts', default='k4,k7,map,k16', help='some of k4,k7,map,k16'); ap.add_argument('--keep', action='store_true', help='copy the main shots into docs/screens/VIS4/')
    asyncio.run(main(ap.parse_args()))
