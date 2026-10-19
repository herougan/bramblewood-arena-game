#!/usr/bin/env python3
"""Package U3 (2026-10-19, the owner's UI notes 13:41-13:45) — the real game page in headless Chromium.

    python3 tests/e2e/u3_2026_10_19.py                    # about 3 minutes
    U3_SHOTS=docs/screens/u3 python3 tests/e2e/u3_2026_10_19.py   # also saves the screenshots
    U3_ONLY=map|raid|float                                 # one part only

At 390x844 and 430x932 (isMobile, hasTouch) and 1366x768:
  1. The 🌰 Home is the first icon of the top-right cluster (Conquest, Arena, Raid, Dungeons), the size of its neighbours, not inside
     a sideways-scrolling box; the bottom tab bar has no Home.
  2. Phones: the map strip is back on the cluster's line (no empty margin above it), each chip its number and emoji (+ a ✓ once
     cleared), the name in its aria-label and a touch-and-hold peek (the hold doesn't change the map). Desktop: the full side list.
  3. The raid's bramble: "Kraken's Reef", its portrait, its Tentacle Smack in the info panel, the VS boss card and the raid rules;
     the tentacle reaches out of the bramble's tile.
  4. The raid rows: closer, the cards bigger than MB2b's, the bottom row's cards on the board's edge; facing lines and floats on the
     cards; the hand on screen.
  5. The turn meter: faded out ("Turn N", no "/ 20", no clicks); at your turn it fades in, rolls from the old turn, holds and fades;
     "3 turns left" ... "Last turn!" in the last 3 turns; reduced motion: no roll.
  6. Castle damage numbers pop at the HP fill's end, every mode, kept on screen at very low / full Health.
Not in tests/run-all.sh (a browser run). Exit code 1 on any failure.
"""
import asyncio, os, sys, json
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
URL = 'file://' + os.path.join(ROOT, 'index.html')
EXE = os.environ.get('BW_CHROMIUM', '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell')
SHOTS = os.environ.get('U3_SHOTS')
ONLY = os.environ.get('U3_ONLY')
INIT = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_pitch_open_v1','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); localStorage.setItem('bramblewood_world_open_v1','1'); localStorage.setItem('bramblewood_arena_faction','otters'); localStorage.setItem('bramblewood_map_revealed_v1','[\"*\"]'); localStorage.setItem('bramblewood_dialogue_flags_v1', JSON.stringify({'lesson:lumber':true, 'world_revealed_toast':true}));"
        "sessionStorage.setItem('bramblewood_seen_splash','1'); localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','pl-need','pl-do','pl-after']));")
SIZES = [(390, 844, True), (430, 932, True), (1366, 768, False)]
failures = []
def check(cond, msg):
    if not cond:
        failures.append(msg); print('  FAIL', msg)
    return cond

async def open_page(b, w, h, phone, reduced=False):
    ctx = await b.new_context(viewport={'width': w, 'height': h}, has_touch=phone, is_mobile=phone, device_scale_factor=2 if phone else 1, reduced_motion='reduce' if reduced else 'no-preference')
    pg = await ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('dialog', lambda d: asyncio.ensure_future(d.accept()))
    await pg.add_init_script(INIT)
    await pg.goto(URL); await pg.wait_for_timeout(1500)
    await pg.evaluate("FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); myCurrencies.energy = 60; window.showCoachTip = function(){}; 1")
    return ctx, pg, errs

async def shot(pg, name):
    if SHOTS:
        os.makedirs(os.path.join(ROOT, SHOTS), exist_ok=True)
        await pg.screenshot(path=os.path.join(ROOT, SHOTS, f'{name}.png'))

BOX = """(sel)=>{ const e = typeof sel === 'string' ? document.querySelector(sel) : sel; if(!e || !e.getClientRects().length) return null; const cs = getComputedStyle(e);
  if(cs.display === 'none' || cs.visibility === 'hidden') return null; const r = e.getBoundingClientRect(); return {l:r.left, t:r.top, r:r.right, b:r.bottom, w:r.width, h:r.height}; }"""

# ---------------- 1 + 2: Home and the map strip ----------------
async def map_part(b, w, h, phone):
    tag = f'{w}'
    ctx, pg, errs = await open_page(b, w, h, phone)
    # clear the first three maps so the strip has cleared chips (their ✓)
    await pg.evaluate("""(()=>{ const p = loadConquestProgress(); mainConquestMaps().slice(0, 3).forEach(m=> m.nodes.forEach(n=>{ const id = conquestNodeId(m.id, n.key); if(!p.completed.includes(id)) p.completed.push(id); })); saveConquestProgress(p); return 1; })()""")
    await pg.wait_for_timeout(6000)  # the milestones and level-ups those clears pay out play first
    await pg.evaluate("document.querySelectorAll('.toast, .bw-toast, .npc-bubble, .coach-bubble, .levelup-overlay, .fxf').forEach(e=> e.remove()); 1")
    for tab in ['conquest', 'arena', 'raid', 'dungeons']:
        await pg.evaluate(f"(()=>{{ playSubTab = '{tab}'; switchTab('play'); return 1; }})()"); await pg.wait_for_timeout(600)
        r = await pg.evaluate("""(BOX)=>{ const box = new Function('return ' + BOX)();
          const home = box('#homeNavBtnPlay'), gear = box('#settingsBtnPlaySub'), arena = box('#arenaNavBtnPlay');
          const el = document.getElementById('homeNavBtnPlay'); let scroller = null;
          for(let a = el && el.parentElement; a && a !== document.body; a = a.parentElement){ const o = getComputedStyle(a).overflowX; if((o === 'auto' || o === 'scroll') && a.scrollWidth > a.clientWidth + 1){ scroller = a.className; break; } }
          return {home, gear, arena, emoji: el ? (el.querySelector('.tab-emoji img') ? el.querySelector('.tab-emoji img').getAttribute('alt') : el.querySelector('.tab-emoji').textContent) : null, scroller, tabHome: !!document.getElementById('playHomeTabBtn'), label: el && el.getAttribute('aria-label')}; }""", BOX)
        hm, gr = r['home'], r['gear']
        check(hm and hm['l'] >= 0 and hm['r'] <= w + 1 and hm['t'] >= 0 and hm['t'] < 80, f'{tag} {tab}: the Home is on screen, top right ({hm})')
        check(r['emoji'] == '🌰' and r['label'] == 'Back to Home', f'{tag} {tab}: an acorn Home with its label ({r["emoji"]}, {r["label"]})')
        check(gr and hm and abs((hm['t'] + hm['b'])/2 - (gr['t'] + gr['b'])/2) < 3 and hm['r'] <= gr['l'] + 1, f'{tag} {tab}: the Home sits in the cluster, left of the ⚙️')
        if tab == 'conquest':
            check(hm and gr and abs(hm['h'] - 38) < 2 and abs(hm['w'] - 38) < 2 and r['arena'] and abs(r['arena']['w'] - hm['w']) < 2, f'{tag}: the Home is sized like its neighbours ({hm and hm["w"]}x{hm and hm["h"]}, Arena {r["arena"] and r["arena"]["w"]})')
        check(not r['scroller'], f'{tag} {tab}: no sideways-scrolling box around the cluster ({r["scroller"]})')
        check(not r['tabHome'], f'{tag} {tab}: no Home in the bottom tab bar')
        if tab == 'conquest':
            s = await pg.evaluate("""(BOX)=>{ const box = new Function('return ' + BOX)(); const list = box('#conquestMapList'), cl = box('#view-play .play-subtabs-actions');
              const chips = [...document.querySelectorAll('#conquestMapList .conquest-map-item[data-mapid]')].map(c=> ({b: box(c), num: (box(c.querySelector('.cmi-num')) ? c.querySelector('.cmi-num').textContent : null), name: !!box(c.querySelector('.cmi-name')), tick: !!box(c.querySelector('.cmi-tick')), cleared: c.classList.contains('is-cleared'), aria: c.getAttribute('aria-label')}));
              return {list, cl, chips, world: box('#conquestWorldBtn'), fs: box('#conquestFsBtn')}; }""", BOX)
            if phone:
                c0 = s['chips'][0] if s['chips'] else None
                check(s['list'] and s['chips'] and c0['b'] and c0['b']['t'] <= 16, f'{tag}: the map strip is back, on the top line (first chip top {c0 and c0["b"] and round(c0["b"]["t"])})')
                check(s['list'] and s['cl'] and s['list']['r'] <= s['cl']['l'] + 1, f'{tag}: the strip stops short of the cluster ({s["list"] and round(s["list"]["r"])} vs {s["cl"] and round(s["cl"]["l"])})')
                check(all(c['num'] is not None and not c['name'] for c in s['chips']), f'{tag}: each chip is its number and emoji, no name')
                check(all(c['tick'] == c['cleared'] for c in s['chips']) and any(c['tick'] for c in s['chips']), f'{tag}: cleared chips wear a ✓')
                check(all(c['aria'] and ('Map ' + c['num'] + ':') in c['aria'] for c in s['chips']), f'{tag}: the name is in the aria-label ({s["chips"][0]["aria"] if s["chips"] else None})')
                check(s['world'] and s['world']['t'] >= s['list']['b'] - 1, f'{tag}: 🧭 / ⛶ sit under the strip, not on it')
                await shot(pg, f'map-strip-{tag}')
                # touch-and-hold on the second chip: its name shows; the map doesn't change
                before = await pg.evaluate("conquestSelectedMap")
                await pg.evaluate("""(()=>{ const c = document.querySelectorAll('#conquestMapList .conquest-map-item[data-mapid]')[1]; const r = c.getBoundingClientRect(); window.__u3c = c;
                  c.dispatchEvent(new PointerEvent('pointerdown', {pointerType:'touch', bubbles:true, clientX:r.left + 10, clientY:r.top + 10})); return 1; })()""")
                await pg.wait_for_timeout(650)
                peek = await pg.evaluate("(()=>{ const p = document.querySelector('.u3-chip-peek'); return p ? p.textContent : null; })()")
                await shot(pg, f'map-strip-hold-{tag}')
                await pg.evaluate("(()=>{ const c = window.__u3c; c.dispatchEvent(new PointerEvent('pointerup', {pointerType:'touch', bubbles:true})); c.click(); return 1; })()")
                await pg.wait_for_timeout(400)
                after = await pg.evaluate("conquestSelectedMap")
                check(peek and peek.startswith('Map 1:'), f'{tag}: a hold shows the chip\'s name ({peek})')
                check(before == after, f'{tag}: the hold doesn\'t change the map ({before} -> {after})')
            else:
                check(s['list'] and all(c['name'] and c['num'] is None for c in s['chips']), f'{tag}: desktop keeps the full chips (names, no number badge)')
                await shot(pg, f'map-{tag}')
        if tab == 'arena' and w != 430: await shot(pg, f'arena-home-{tag}')
    # the 🌰 goes Home
    await pg.evaluate("(()=>{ playSubTab = 'conquest'; switchTab('play'); return 1; })()"); await pg.wait_for_timeout(400)
    await pg.click('#homeNavBtnPlay'); await pg.wait_for_timeout(500)
    check(await pg.evaluate("currentTab === 'home'"), f'{tag}: the 🌰 goes Home')
    check(not errs, f'map@{w}: page errors {errs[:3]}')
    await ctx.close()

# ---------------- 3 + 4 + 5: the raid ----------------
# plays a smack through the game's own path and pauses GSAP's clock the frame its tentacle has fully reached out (watched in the page,
# frame by frame, so a slow evaluate round trip can't miss the short impact window)
SMACK_AT_IMPACT = """(ev)=> new Promise(res=>{ fxBatchVfx(ev); const t0 = performance.now();
  const step = ()=>{ const b = document.querySelector('.fxf-tentacle .tb-body');
    if(b && gsap.getProperty(b, 'scaleX') > .99 && +getComputedStyle(b).opacity > .9){ gsap.globalTimeline.pause(); res(true); return; }
    if(performance.now() - t0 > 3000){ res(false); return; } requestAnimationFrame(step); }; requestAnimationFrame(step); })"""
RAID_OPEN = ["playSubTab='raid'; switchTab('play'); 1", "document.querySelector('.raid-hub [data-raid-open]').click()", "document.querySelector('[data-raid-part=left]').click()"]
async def raid_part(b, w, h, phone):
    tag = f'{w}'
    ctx, pg, errs = await open_page(b, w, h, phone)
    await pg.evaluate(RAID_OPEN[0]); await pg.wait_for_timeout(500)
    await pg.evaluate(RAID_OPEN[1]); await pg.wait_for_timeout(600)
    rules = await pg.evaluate("(()=>{ const e = document.querySelector('.r3-bramble'); return e ? e.textContent.replace(/\\s+/g, ' ') : null; })()")
    check(rules and "Kraken's Reef" in rules and 'Tentacle Smack: every 3 turns' in rules and 'Tail Sweep' in rules, f'{tag}: the raid rules name the bramble and its attacks ({(rules or "")[:120]})')
    if w == 390:
        await pg.evaluate("document.querySelector('.r3-bramble').scrollIntoView({block:'center'}); 1"); await pg.wait_for_timeout(300); await shot(pg, f'raid-rules-{tag}')
    await pg.evaluate(RAID_OPEN[2]); await pg.wait_for_timeout(1500)
    vs = await pg.evaluate("(()=>{ const e = document.querySelector('.vs-screen .vs-right'); return e ? e.textContent.replace(/\\s+/g, ' ') : null; })()")
    check(vs and "The boss's bramble: Kraken's Reef" in vs and 'Tentacle Smack: every 3 turns' in vs, f'{tag}: the VS boss card names the bramble and its smack ({(vs or "")[:160]})')
    await shot(pg, f'vs-{tag}')
    await pg.evaluate("(()=>{ const v = document.querySelector('.vs-screen'); if(v) v.click(); return 1; })()")
    # the turn's tick at the fight's start (Turn 1): faded in over the pill
    f1 = None
    for _ in range(60):
        await pg.wait_for_timeout(50)
        f = await pg.evaluate("(()=>{ const f = document.querySelector('.u3-turn-flash'); return f ? {op: +getComputedStyle(f).opacity, t: f.textContent} : null; })()")
        if f and f['op'] > .5: f1 = f; break
    check(f1 and f1['t'].strip().startswith('Turn 1') and f1['op'] > .5, f'{tag}: Turn 1 ticks in as the fight opens ({f1})')
    await pg.wait_for_timeout(3800)
    check(await pg.evaluate("!!(matchState && matchState.raidFull)"), f'{tag}: the raid fight opened')
    await pg.evaluate("document.querySelectorAll('.coach-bubble, .coach-tip, .npc-bubble, .coach-callout').forEach(e=> e.remove()); 1")
    # 3. the bramble tile: name, portrait, info panel
    t = await pg.evaluate("""(()=>{ const e = document.querySelector('.top-play-row [data-hq="B"]'); if(!e) return null; const img = e.querySelector('img.card-art-img');
      return {nm: (e.querySelector('.nm') || {}).textContent, img: img ? img.getAttribute('src') : null, pop: castleHoverHTML('B').replace(/<[^>]+>/g, ' ').replace(/\\s+/g, ' ')}; })()""")
    check(t and t['nm'] == "Kraken's Reef" and t['img'] and 'krakens-reef' in t['img'], f'{tag}: the boss\'s bramble is Kraken\'s Reef with its portrait ({t and t["nm"]}, {t and t["img"]})')
    check(t and 'Tentacle Smack: every 3 turns' in t['pop'] and "The boss's bramble" in t['pop'], f'{tag}: its info panel lists the Tentacle Smack ({t and t["pop"][:200]})')
    if not phone:  # the real hover popover on the tile
        await pg.hover('.top-play-row [data-hq="B"]'); await pg.wait_for_timeout(1400)
        pop = await pg.evaluate("(()=>{ const p = document.getElementById('cardPop'); return p && !p.hidden && getComputedStyle(p).display !== 'none' ? p.textContent.replace(/\\s+/g, ' ') : null; })()")
        check(pop and 'Tentacle Smack' in pop, f'{tag}: hovering the bramble shows its Tentacle Smack ({(pop or "")[:80]})')
        await shot(pg, f'bramble-info-{tag}')
        await pg.mouse.move(w/2, h - 5); await pg.wait_for_timeout(300)
    # 4. the rows
    r = await pg.evaluate("""(()=>{ const bf = document.querySelector('.battlefield').getBoundingClientRect(), rib = document.querySelector('.bf-hp-mine').getBoundingClientRect();
      const rows = [...document.querySelectorAll('#battlefieldInner > .board-row')], last = rows[rows.length - 1], slots = [...last.querySelectorAll(':scope > .board-card')].map(e=> e.getBoundingClientRect());
      const card = document.querySelector('#rowMine > .board-card').getBoundingClientRect(), hand = [...document.querySelectorAll('.bottom-play-row .hand-strip > .card-tile')].map(e=> e.getBoundingClientRect());
      const tops = rows.map(e=> e.getBoundingClientRect().top), pitch = tops.slice(1).map((t, i)=> t - tops[i]);
      return {cw: card.width, ch: card.height, slotBottom: Math.max(...slots.map(s=> s.bottom)), ribTop: rib.top, bfBottom: bf.bottom, pitch, hand: hand.map(x=> [x.width, x.bottom]), vh: innerHeight, sy: scrollY, docH: document.documentElement.scrollHeight}; })()""")
    print(f'  {tag}: raid card {r["cw"]:.1f}x{r["ch"]:.1f}, row pitch {[round(p, 1) for p in r["pitch"]]}, bottom slots {r["slotBottom"]:.1f} vs ribbon top {r["ribTop"]:.1f}, hand {r["hand"][:1]}')
    MB2B = {390: 66.8, 430: 75.2, 1366: 61.2}  # MB2b's raid card widths (5 columns; measured before U3)
    check(r['cw'] >= MB2B[w] + 1, f'{tag}: the raid cards are bigger than before ({r["cw"]:.1f} vs {MB2B[w]})')
    check(abs(r['slotBottom'] - r['ribTop']) <= 1.5, f'{tag}: the bottom row\'s cards meet the board\'s edge ({r["slotBottom"]:.1f} vs the ribbon at {r["ribTop"]:.1f})')
    check(all(x[1] <= r['vh'] + 1 for x in r['hand']) and r['docH'] <= r['vh'] + 1, f'{tag}: the hand is on screen, no page scroll ({r["hand"][:1]}, {r["docH"]})')
    # facing lines and floats still on the cards
    al = await pg.evaluate("""(()=>{ const m = matchState, c = m.engine.allBoardCards(m.players[1]).find(x=> x.hp > 0); if(!c) return null; showFacing(c.uid);
      const svg = document.getElementById('facingSvg'), ln = svg && svg.querySelector('line, path'); const src = boardCardEl(c.uid).getBoundingClientRect();
      let p = null; if(ln && ln.tagName === 'line'){ const sr = svg.getBoundingClientRect(); p = {x: sr.left + +ln.getAttribute('x1'), y: sr.top + +ln.getAttribute('y1')}; }
      clearFacing(); floatText(boardCardEl(c.uid), '-3'); const f = document.querySelector('.dmg-float'); const fr = f && f.getBoundingClientRect();
      return {p, src: [src.left, src.top, src.right, src.bottom], f: fr ? fr.left + fr.width/2 : null}; })()""")
    if check(al is not None, f'{tag}: no unit of ours to aim'):
        s = al['src']
        check(al['p'] is None or (s[0] - 2 <= al['p']['x'] <= s[2] + 2 and s[1] - 2 <= al['p']['y'] <= s[3] + 2), f'{tag}: the facing line starts on its card ({al["p"]}, {[round(x) for x in s]})')
        check(al['f'] is not None and s[0] - 20 <= al['f'] <= s[2] + 20, f'{tag}: a number pops over its card ({al["f"]})')
    await shot(pg, f'raid-{tag}')
    # 5. the turn meter at rest: faded out, no clicks, "Turn N"
    p = await pg.evaluate("(()=>{ const e = document.querySelector('.bf-hp .bf-turn-pill.raid-clock'); if(!e) return null; const cs = getComputedStyle(e); return {op: +cs.opacity, pe: cs.pointerEvents, t: e.textContent}; })()")
    check(p and p['op'] < .05 and p['pe'] == 'none' and p['t'].startswith('Turn ') and '/' not in p['t'], f'{tag}: the turn pill rests faded out, no clicks, "Turn N" ({p})')
    # the tick at your turn: from Turn 1 to Turn 2 (u3TurnFlash, as the round opens)
    await pg.evaluate("(()=>{ const m = matchState; m.round = 2; m._u3TurnSeen = 1; renderMatchUI(); document.querySelectorAll('.u3-turn-flash').forEach(e=> e.remove()); u3TurnFlash(m); return 1; })()")
    await pg.wait_for_timeout(120)
    a0 = await pg.evaluate("(()=>{ const f = document.querySelector('.u3-turn-flash'); return f ? {old: !!f.querySelector('.u3tf-old'), t: f.querySelector('.u3tf-new').textContent} : null; })()")
    await pg.wait_for_timeout(700)
    a1 = await pg.evaluate("""(BOX)=>{ const box = new Function('return ' + BOX)(); const f = document.querySelector('.u3-turn-flash'); if(!f) return null; const pill = box('.bf-hp .bf-turn-pill.raid-clock'), fp = box(f.querySelector('.u3tf-pill'));
      return {op: +getComputedStyle(f).opacity, near: pill && fp ? Math.abs((pill.l + pill.r)/2 - (fp.l + fp.r)/2) : null, newY: f.querySelector('.u3tf-new').getBoundingClientRect().top - f.querySelector('.u3tf-roll').getBoundingClientRect().top}; }""", BOX)
    await shot(pg, f'turn-tick-{tag}')
    check(a0 and a0['old'] and a0['t'] == 'Turn 2', f'{tag}: the tick rolls from Turn 1 to Turn 2 ({a0})')
    check(a1 and a1['op'] > .9 and a1['near'] is not None and a1['near'] < 3 and abs(a1['newY']) < 1.5, f'{tag}: it shows over the pill, the new turn rolled in ({a1})')
    await pg.wait_for_timeout(1700)
    gone = await pg.evaluate("!document.querySelector('.u3-turn-flash')")
    check(gone, f'{tag}: it fades out again (about 2.3 s)')
    # the last 3 turns
    warn = await pg.evaluate("""(()=>{ const m = matchState, cap = m.raidRoundCap, out = []; [cap - 3, cap - 2, cap - 1, cap].forEach(n=>{ m.round = n; m._u3TurnSeen = n - 1; document.querySelectorAll('.u3-turn-flash').forEach(e=> e.remove()); u3TurnFlash(m);
      const w = document.querySelector('.u3-turn-flash .u3tf-warn'); out.push(w ? w.textContent : ''); }); return {cap, out}; })()""")
    check(warn['out'] == ['', '3 turns left', '2 turns left', 'Last turn!'], f'{tag}: the last 3 turns say so ({warn})')
    await pg.wait_for_timeout(500)
    if w == 390: await shot(pg, f'turn-last-{tag}')
    await pg.evaluate("matchState.round = 2; document.querySelectorAll('.u3-turn-flash').forEach(e=> e.remove()); renderMatchUI(); 1"); await pg.wait_for_timeout(2600)
    # 3. the tentacle out of the bramble: a column smack through the game's own path, paused at impact
    hit = await pg.evaluate(SMACK_AT_IMPACT, {'type':'raidSmack', 'kind':'column', 'name':'Tentacle Smack', 'col':0, 'row':None, 'dmg':6, 'hits':2})
    tr = await pg.evaluate("""(()=>{ const b = document.querySelector('.fxf-tentacle .tb-body'); if(!b) return null; const t = b.getBoundingClientRect(), o = document.querySelector('.top-play-row [data-hq="B"]').getBoundingClientRect();
      const all = [...document.querySelectorAll('#rowMine > .board-card')], i = Math.floor(all.length/2);
      const cells = [all[i]].concat([...document.querySelectorAll('#battlefieldInner .reserve-row.mine')].map(r=> r.querySelectorAll(':scope > .board-card')[i])).filter(Boolean).map(e=> e.getBoundingClientRect());
      return {t:[t.left, t.top, t.right, t.bottom], o:[o.left, o.top, o.right, o.bottom], low: Math.max(...cells.map(c=> c.top)), flare: document.querySelector('.top-play-row [data-hq="B"]').classList.contains('u3-bramble-smack')}; })()""")
    await shot(pg, f'tentacle-from-bramble-{tag}')
    await pg.evaluate("try{ gsap.globalTimeline.resume(); }catch(e){} 1")
    if check(hit and tr is not None, f'{tag}: the smack drew its tentacle'):
        t, o = tr['t'], tr['o']
        check(t[0] <= o[2] and t[1] <= o[3] and t[2] >= o[0], f'{tag}: the tentacle reaches out of the bramble\'s tile ({[round(x) for x in t]} vs tile {[round(x) for x in o]})')
        check(t[3] >= tr['low'], f'{tag}: ...down to the column\'s last row ({t[3]:.0f} vs {tr["low"]:.0f})')
    await pg.wait_for_timeout(1500)
    check(not await pg.evaluate("!!document.querySelector('.fxf-tentacle')"), f'{tag}: the tentacle layer is removed afterwards')
    # a row smack comes in from the bramble's side (left)
    for attempt in range(3):  # (the page's own timers can be mid-redraw of the row; try again a moment later)
        if await pg.evaluate(SMACK_AT_IMPACT, {'type':'raidSmack', 'kind':'row', 'name':'Tentacle Smack', 'row':0, 'col':None, 'dmg':6, 'hits':2}): break
        await pg.wait_for_timeout(1500)
    rr = await pg.evaluate("(()=>{ const b = document.querySelector('.fxf-tentacle .tb-body'); if(!b) return null; const t = b.getBoundingClientRect(), bf = document.querySelector('.battlefield').getBoundingClientRect(); return {l: t.left, bl: bf.left}; })()")
    if w == 390: await shot(pg, f'tentacle-row-{tag}')
    await pg.evaluate("try{ gsap.globalTimeline.resume(); }catch(e){} 1")
    check(rr and rr['l'] <= rr['bl'] + 4, f'{tag}: a row smack comes in from the bramble\'s side of the board ({rr})')
    await pg.wait_for_timeout(1200)
    check(not errs, f'raid@{w}: page errors {errs[:3]}')
    await ctx.close()
    # reduced motion: a plain fade, no roll
    if w == 390:
        ctx, pg, errs = await open_page(b, w, h, phone, reduced=True)
        for js in RAID_OPEN: await pg.evaluate(js); await pg.wait_for_timeout(600)
        await pg.evaluate("(()=>{ const v = document.querySelector('.vs-screen'); if(v) v.click(); return 1; })()"); await pg.wait_for_timeout(4500)
        rm = await pg.evaluate("(()=>{ const m = matchState; m.round = 2; m._u3TurnSeen = 1; document.querySelectorAll('.u3-turn-flash').forEach(e=> e.remove()); u3TurnFlash(m); const f = document.querySelector('.u3-turn-flash'); return f ? {old: !!f.querySelector('.u3tf-old'), t: f.textContent} : null; })()")
        check(rm and not rm['old'] and rm['t'].startswith('Turn 2'), f'{tag} reduced motion: the tick is a plain fade, no roll ({rm})')
        await ctx.close()

# ---------------- 6: castle numbers at the HP fill's end ----------------
BATTLE = "(()=>{const m=CONQUEST_MAPS[0]; const n=m.nodes.find(n=>n.kind==='skirmish'); conquestSelectedMap=m.id; playSubTab='conquest'; switchTab('play'); startConquestMatch(m.id,n.key,{skipEnergyCost:true,noOpener:true}); return 1;})()"
FLOAT = """(pct)=>{ const m = matchState, out = {}; document.querySelectorAll('.dmg-float').forEach(e=> e.remove());
  ['B', 'A'].forEach(s=>{ const hq = m.players[s === 'A' ? 1 : 2].hq; updateHpRibbon(s, Math.round(hq.maxHp * pct)); });
  const a = hqRibbonFloatAnchor('B'); floatText(a, '💥 -1000', 'hq-big'); const b = hqRibbonFloatAnchor('A'); floatText(b, '🗡 -3', 'hq-big');
  return 1; }"""
MEASURE = """()=>{ const out = {}; const fl = [...document.querySelectorAll('.hq-float-anchor .dmg-float')];
  ['B', 'A'].forEach((s, i)=>{ const tr = document.querySelector(`.battlefield .bf-hp[data-hpribbon="${s}"] .bf-hp-track`).getBoundingClientRect(), fill = document.querySelector(`.battlefield .bf-hp[data-hpribbon="${s}"] .bf-hp-fill`);
    const end = tr.left + tr.width * parseFloat(fill.style.width) / 100, f = fl[i], fr = f && f.getBoundingClientRect();
    out[s] = {end, num: fr ? fr.left + fr.width/2 : null, l: fr ? fr.left : null, r: fr ? fr.right : null, vw: document.documentElement.clientWidth}; }); return out; }"""
async def float_part(b, w, h, phone):
    tag = f'{w}'
    for mode in ['fight', 'raid']:
        ctx, pg, errs = await open_page(b, w, h, phone)
        if mode == 'fight':
            await pg.evaluate(BATTLE); await pg.wait_for_timeout(2500)
        else:
            for js in RAID_OPEN: await pg.evaluate(js); await pg.wait_for_timeout(600)
            await pg.evaluate("(()=>{ const v = document.querySelector('.vs-screen'); if(v) v.click(); return 1; })()"); await pg.wait_for_timeout(4500)
        for pct in (0.5, 0.02, 1.0):
            await pg.evaluate(FLOAT, pct); await pg.wait_for_timeout(260)
            r = await pg.evaluate(MEASURE)
            for s, v in r.items():
                ok_on = v['l'] is not None and v['l'] >= -0.5 and v['r'] <= v['vw'] + 0.5
                check(ok_on, f'{tag} {mode} {pct:.0%}: the {s} number stays on screen ({v})')
                if pct == 0.5:
                    check(v['num'] is not None and abs(v['num'] - v['end']) <= 6, f'{tag} {mode}: the {s} number pops at the fill\'s end ({v["num"]} vs {v["end"]:.1f})')
            if pct == 0.5 and (w != 430): await shot(pg, f'hpfloat-{mode}-{tag}')
            await pg.wait_for_timeout(1400)
        check(not errs, f'float {mode}@{w}: page errors {errs[:3]}')
        await ctx.close()

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=EXE)
        for (w, h, phone) in SIZES:
            print(f'-- {w}x{h}')
            if ONLY in (None, 'map'): await map_part(b, w, h, phone)
            if ONLY in (None, 'raid'): await raid_part(b, w, h, phone)
            if ONLY in (None, 'float') and w != 430: await float_part(b, w, h, phone)
        await b.close()
    print('U3: ' + ('OK' if not failures else f'{len(failures)} failure(s)'))
    sys.exit(1 if failures else 0)

asyncio.run(main())
