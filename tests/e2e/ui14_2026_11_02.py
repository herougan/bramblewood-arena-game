#!/usr/bin/env python3
"""Package UI14 (2026-11-02, owner 11-02 00:17: JJ1 JJ2 JJ3 JJ4 JJ6 JJ8 JJ10 JJ11 JJ13 JJ14 JJ15 JJ16 JJ20 JJ23 JJ26): browser checks, shots in tests/e2e/shots/ui14/.
    python3 tests/e2e/ui14_2026_11_02.py [--page index.html] [--width 1366,390] [--only jj8,jj2,...]
JJ8+JJ1  the versus opener: one card per side (battlefield art behind, a round portrait, the code / kind, the fight's name, the map's name, the BR box,
         a facts line with no pills, the quote, a timer bar); it stays 3.4 s (a quick retry 1.2 s); a tap still skips.
JJ2      the end sign holds 1.4 s (was 1.7 s) before it fades.
JJ3      Cull (hunter, Wet) / Executioner: the hit's number is the rest, the bonus pops as a second number with its own flash (display only).
JJ4      admin: in the post-battle view (results closed with 👀) every board card has a ✏️ that opens the card editor.
JJ6      the map's N-SK node keeps clear of every road (no road runs under it), on Map 4 and the other maps.
JJ10     a Boomerang's return that fells the bramble flies home in slow motion (3.4x, a glowing layer) while the match ends.
JJ11     N-SK: no New draw button; the drawn decks are the ones played and a fight clears the draw.
JJ13     a Brood token: a 🐣 hops from the parent onto its slot and the token pops out of it.
JJ14     your turn's glow is on the battlefield frame: the frame's full width, even with the camera leaned.
JJ15     status chips: centred on the card's top edge; a count of 1 is not written, a larger count is (Poison too).
JJ16     a 🗺️ in the topbar on feature pages goes to the conquest map; the nav buttons are one height with one gap.
JJ20     the Devilry box: a black-grey-black gradient; the Ritual shape is centred.
JJ23     Sulphur Fumes: the gas layer is in for your turn and out while the round is fought.
JJ26     the sight eyes fade out about 2.4 s after they show and stay gone through redraws; the darkening is 10%.
Build first. Exits 1 on a failed check."""
import argparse, asyncio, os, sys, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vis5_2026_10_28 as W
from playwright.async_api import async_playwright
V = W.V
ROOT = V.ROOT
SHOTS = os.path.join(ROOT, 'tests', 'e2e', 'shots', 'ui14'); os.makedirs(SHOTS, exist_ok=True)
fails = []
def ok(c, m):
    print(('  ok  ' if c else '  FAIL ') + m, flush=True)
    if not c: fails.append(m)
async def done(pg):
    ok(not pg._errs, f'no page errors {pg._errs[:2]}'); await pg._ctx.close()
def shot(name, w): return os.path.join(SHOTS, f'{name}-{w}.png')
NOTOAST = '.toast, .toast-host, #toastHost{display:none !important;}'
SLEEP = 'const W = ms=> new Promise(r=> setTimeout(r, ms));'

# ---------------------------------------------------------------- JJ8 + JJ1
async def jj8(b, url, w):
    print(f'-- JJ8 + JJ1: the versus card ({w})')
    pg = await W.fresh(b, url, w)
    await pg.add_style_tag(content=NOTOAST)
    await pg.evaluate("""(()=>{ window.__vsLife = {}; new MutationObserver(()=>{ const on = !!document.querySelector('.vs-opener'), t = performance.now(); if(on && !__vsLife.a) __vsLife.a = t; if(!on && __vsLife.a && !__vsLife.b) __vsLife.b = t; }).observe(document.body, {childList: true, subtree: true});
      switchTab('play'); showVersusOpener.last = null; startConquestMatch('mw', '5-5', {skipEnergyCost:true}); })()"""); await pg.wait_for_timeout(900)
    r = await pg.evaluate("""(()=>{ const el = document.querySelector('.vs-opener'); if(!el) return null; const them = el.querySelector('.vs-them'), me = el.querySelector('.vs-me');
      // 2026-11-02 (package UI16, note 9): a rival with a leader shows the leader's and the bramble's art (.ui16-vs-art) in place of the round
      // portrait, and no facts line; the round-portrait check runs on the player's own portrait, which keeps it
      const art = !!them.querySelector('.ui16-vs-art .ui16-vs-fig.is-leader'), pic = them.querySelector('.vs-rival-ico') || me.querySelector('.vs-portrait .bw-avatar'), pr = pic.getBoundingClientRect(), cs = getComputedStyle(pic), f = findConquestNode('mw', '5-5');
      return {art, card: them.classList.contains('ui14-vs-card') && me.classList.contains('ui14-vs-card'), bg: getComputedStyle(them).backgroundImage, round: Math.abs(pr.width - pr.height) < 1.5 && cs.borderRadius.startsWith('50%') || cs.borderRadius === '50%',
        name: them.querySelector('.vs-name').textContent.trim(), want: f.node.name, map: (them.querySelector('.ui14-vs-map') || {}).textContent || '', mapName: f.map.name,
        kick: (them.querySelector('.ui14-vs-kicker') || {}).textContent || '', br: !!them.querySelector('.vs-lvl b'), myBr: !!me.querySelector('.vs-lvl b'), pills: el.querySelectorAll('.vs-pill').length,
        facts: [...them.querySelectorAll('.ui14-vs-facts .vs-fact')].length, quote: !!them.querySelector('.vs-taunt'), timer: !!them.querySelector('.ui14-vs-timer > i'), skull: !!them.querySelector('.vis3-elite-frame'),
        sw: document.documentElement.scrollWidth, vw: innerWidth}; })()""")
    ok(r is not None and r['card'], 'each side is one designed card (.ui14-vs-card)')
    ok(r is not None and 'url(' in r['bg'], f'the rival card has the battlefield art behind it ({(r or {}).get("bg", "")[:80]})')
    ok(r is not None and r['round'], 'the portrait is round (width = height, radius 50%)')
    ok(r is not None and r['name'] == r['want'] and r['mapName'] in r['map'] and '5-5' in r['kick'], f'title, map name and code: {r and (r["name"], r["map"], r["kick"])}')
    ok(r is not None and r['br'] and r['myBr'] and r['pills'] == 0 and r['facts'] == 0 and r['quote'] and r['timer'] and (r['skull'] or r['art']), f'BR boxes, no pills, no facts line (UI16), the quote, the timer, the elite frame or the leader art {r}')
    ok(r is not None and r['sw'] <= r['vw'], 'no sideways scroll')
    await pg.add_style_tag(content='.vs-opener{animation:none !important; opacity:1 !important;} .vs-opener *{animation-play-state:paused !important;} .vs-opener .vs-side, .vs-opener .vs-mark, .vs-opener .vs-taunt{animation:none !important; opacity:1 !important; transform:none !important;}')
    await pg.screenshot(path=shot('jj8-vs-card', w))
    await pg.wait_for_timeout(4200)
    life = await pg.evaluate("__vsLife.b && __vsLife.a ? Math.round(__vsLife.b - __vsLife.a) : null")
    ok(life is not None and 3400 <= life <= 4400, f'it stays up {life} ms: its 3.4 s hold and the 0.38 s fade (was 1.7 s)')
    r = await pg.evaluate("(()=>{ const f = findConquestNode('mw', '5-5'); return [ui14OpenerHold(f.map, f.node, false, true, false), ui14OpenerHold(f.map, findConquestNode('mw', '5-7').node, true, false, false)]; })()")
    ok(r[0] == 1200 and r[1] == 4200, f'a quick retry of the same rival 1.2 s; a boss 4.2 s {r}')
    await done(pg)

# ---------------------------------------------------------------- JJ2
async def jj2(b, url, w):
    print(f'-- JJ2: the end sign 0.3 s shorter ({w})')
    pg = await W.fresh(b, url, w)
    await pg.evaluate(V.BOARD + "([], [])");
    r = await pg.evaluate("(async()=>{ const m = matchState; m.winner = 0; m.speedMult = 1; m.players[1].hq.hp = 5; m.players[2].hq.hp = 5; const t0 = performance.now(); await showEndSign(m); return Math.round(performance.now() - t0); })()")
    ok(1500 <= r <= 1800, f'the end sign takes {r} ms (1.4 s + its 0.22 s fade; it was 1.92 s)')
    await done(pg)

# ---------------------------------------------------------------- JJ3
async def jj3(b, url, w):
    print(f'-- JJ3: a bonus-damage skill\'s second hit ({w})')
    pg = await W.fresh(b, url, w)
    u = await pg.evaluate(V.BOARD + "([['grave-grin-hyena', 0, 10]], [['otter-kit', 0, 10]])")
    r = await pg.evaluate("""(async([a, t])=>{ """ + SLEEP + """ const m = matchState; m.resolving = false; m.replayCards = {}; m.replayCards[t] = {hp: 2, maxHp: 10, atk: 1, defId: 'otter-kit', poison: 0, bleed: 0};
      const ev = {type: 'hit', side: 'A', attDefId: 'grave-grin-hyena', attUid: a, targetSide: 'B', targetDefId: 'otter-kit', targetUid: t, dmg: 4, dmgType: 'physical'};
      const bon = ui14HitBonus(ev); const floats0 = document.querySelectorAll('.fx-float, .float-text').length;
      renderVfxForEvent(ev); await W(1400); const el = boardCardEl(t);
      const none = ui14HitBonus(Object.assign({}, ev, {dmg: 2})); // no split when the hit got no more than the bonus through
      m.replayCards[t] = {hp: 9, maxHp: 10, atk: 1, defId: 'otter-kit'}; const healthy = ui14HitBonus(ev);
      return {bon, mark: el && el.dataset.ui14Bonus, none, healthy}; })""", [u['1:0'], u['2:0']])
    ok(r['bon'] and r['bon']['n'] == 2 and r['bon']['kind'] == 'executioner', f'Executioner 2 on a unit under 25% Health: a bonus of 2 {r["bon"]}')
    ok(r['mark'] == '2', f'the second hit played on the target (data-ui14-bonus={r["mark"]})')
    ok(r['none'] is None and r['healthy'] is None, 'no second hit when the hit is no bigger than the bonus, or the target is not low')
    # Cull (hunter, Wet): the Tidepool Trapper Crab on a Wet unit; the bonus pops in water
    r = await pg.evaluate("""(()=>{ const m = matchState, E = m.engine; const t = m.players[2].row.center[0]; const orig = E.wetCountOf; E.wetCountOf = ()=> 1;
      m.replayCards = {}; m.replayCards[t.uid] = {hp: 9, maxHp: 10, atk: 3, defId: t.defId};
      const out = ui14HitBonus({type: 'hit', attDefId: 'tidepool-trapper-crab', attUid: 1, targetUid: t.uid, targetDefId: t.defId, dmg: 3, dmgType: 'physical'}); E.wetCountOf = orig; return out; })()""")
    ok(r and r['n'] == 1 and r['type'] == 'water' and r['kind'] == 'hunter', f'Cull 1 on a Wet unit: 1 bonus water damage {r}')
    await done(pg)

# ---------------------------------------------------------------- JJ4
async def jj4(b, url, w):
    print(f'-- JJ4: edit cards from the post-battle view ({w})')
    pg = await W.fresh(b, url, w)
    await pg.evaluate(V.BOARD + "([['otter-centurion', 0, 6], ['grave-grin-hyena', 1, 8]], [['otter-kit', 0, 5]])")
    r = await pg.evaluate("""(async()=>{ """ + SLEEP + """ const m = matchState; m.resolving = false; m.over = true; m.winner = 1; m.winModalDismissed = false; adminModeEnabled = true; renderMatchUI(); await W(300);
      const before = document.querySelectorAll('.ui14-edit').length; m.winModalDismissed = true; renderMatchUI(); await W(400);
      const cards = document.querySelectorAll('#battlefieldEl .board-card[data-uid]').length, btns = [...document.querySelectorAll('#battlefieldEl .board-card > .ui14-edit')].map(x=> x.dataset.ui14Edit);
      return {before, cards, btns}; })()""")
    ok(r['before'] == 0, 'no ✏️ while the results are open')
    ok(r['cards'] >= 3 and len(r['btns']) == r['cards'] and 'otter-centurion' in r['btns'], f'a ✏️ on every board card in the post-battle view {r}')
    await pg.add_style_tag(content=NOTOAST); await pg.screenshot(path=shot('jj4-post-battle-edit', w))
    r = await pg.evaluate("""(async()=>{ """ + SLEEP + """ document.querySelector('.board-card > .ui14-edit[data-ui14-edit="otter-centurion"]').click(); await W(500);
      const ov = document.getElementById('editorOverlay'), open = !!(ov && !ov.hidden && ov.innerHTML.length > 100), id = typeof editingCard !== 'undefined' && editingCard ? editingCard.id : null;
      closeCardEditor(); await W(500); return {open, id, back: document.querySelectorAll('#battlefieldEl .board-card > .ui14-edit').length}; })()""")
    ok(r['open'] and r['id'] == 'otter-centurion', f'the ✏️ opens the card editor on that card {r}')
    ok(r['back'] >= 3, 'closing the editor draws the board again, ✏️s and all')
    await done(pg)

# ---------------------------------------------------------------- JJ6
async def jj6(b, url, w):
    print(f'-- JJ6: the skirmish node off the roads ({w})')
    pg = await W.fresh(b, url, w)
    await pg.evaluate("adminModeEnabled = true"); await pg.evaluate(V.OPEN, ['m2', '~none']); await pg.wait_for_timeout(400)
    worst = []
    for mid in ['m2', 'mb', 'mw', 'mh', 'mx']:
        r = await pg.evaluate("""(async(mid)=>{ """ + SLEEP + """ conquestWorldView = false; conquestSelectedMap = mid; conquestSelectedNodeKey = null; renderPlay(); await W(900);
          const cv = document.getElementById('conquestCanvas'); if(!cv) return null; const pro = [...cv.querySelectorAll('.map-pro')]; if(!pro.length) return {mid, none: true};
          const segs = [...cv.querySelectorAll('svg [data-a][data-b]')].filter(l=> l.tagName === 'line' || l.tagName === 'path').map(l=> l.tagName === 'line' ? [[+l.getAttribute('x1'), +l.getAttribute('y1')], [+l.getAttribute('x2'), +l.getAttribute('y2')]] : null).filter(Boolean);
          const d = (p, a, b)=>{ const dx = b[0]-a[0], dy = b[1]-a[1], L = dx*dx+dy*dy; let t = L ? ((p[0]-a[0])*dx + (p[1]-a[1])*dy)/L : 0; t = Math.max(0, Math.min(1, t)); return Math.hypot(p[0]-a[0]-t*dx, p[1]-a[1]-t*dy); };
          const out = pro.map(e=>{ const p = [parseFloat(e.style.left), parseFloat(e.style.top)]; return {id: e.dataset.proStart, min: segs.length ? Math.min(...segs.map(s=> d(p, s[0], s[1]))) : 99}; });
          return {mid, out, segs: segs.length}; })""", mid)
        if r and not r.get('none'): worst.append(r)
        if mid == 'm2':
            await pg.add_style_tag(content=NOTOAST); await pg.screenshot(path=shot('jj6-map4-sk', w))
    ok(len(worst) >= 3, f'checked {len(worst)} maps with an N-SK node')
    bad = [(r['mid'], o['id'], round(o['min'], 1)) for r in worst for o in r['out'] if o['min'] < 5]
    ok(not bad, f'every N-SK node is at least 5% of the map from every road (straight ones) {[(r["mid"], [(o["id"], round(o["min"], 1)) for o in r["out"]]) for r in worst]}')
    await done(pg)

# ---------------------------------------------------------------- JJ10
async def jj10(b, url, w):
    print(f'-- JJ10: the felling boomerang flies home in slow motion ({w})')
    pg = await W.fresh(b, url, w)
    u = await pg.evaluate(V.BOARD + "([['otter-centurion', 0, 6]], [])")
    r = await pg.evaluate("""(async(a)=>{ """ + SLEEP + """ const m = matchState; m.resolving = false; window.__ui14BoomFinale = null; m.speedMult = 1;
      const pl = m.players[1]; pl.boomerangs = [{uid: a, defId: 'otter-centurion', col: 0, dmg: 3, dmgType: 'physical', hitCastle: true, targetUid: null}];
      const me = m.players[1].row.center[0]; me.boomerangOut = true; m.players[2].hq.hp = 2; m.players[2].hq.shield = 0; m.players[2].hq.maxShield = 0;
      m.players[1].hand = []; m.players[2].hand = []; m.players[1].deck = []; m.players[2].deck = [];
      let seen = 0; const iv = setInterval(()=>{ if(document.querySelector('.ui14-boom-finale')) seen++; }, 50);
      resolveRound(); for(let i = 0; i < 160 && !(matchState.over); i++) await W(100); clearInterval(iv);
      return {fin: window.__ui14BoomFinale, over: matchState.over, winner: matchState.winner, seen}; })""", u['1:0'])
    ok(r['over'] and r['winner'] == 1, f'the return fells the bramble: a win {r}')
    ok(r['fin'] is not None and r['fin']['homeMs'] >= 1500, f'its flight home is the slow one (home leg {r["fin"] and r["fin"]["homeMs"]} ms, 3.4x)')
    ok(r['seen'] >= 10, f'the glowing boomerang stays up through the end ({r["seen"]} samples of 50 ms)')
    r = await pg.evaluate("ui14BoomLethal({boomerang: true, targetSide: 'B', dmg: 1})")
    ok(r is True, 'ui14BoomLethal: the bramble is down')
    await done(pg)

# ---------------------------------------------------------------- JJ11
async def jj11(b, url, w):
    print(f'-- JJ11: no New draw ({w})')
    pg = await W.fresh(b, url, w)
    await pg.evaluate("adminModeEnabled = true"); await pg.evaluate(V.OPEN, ['mb', '~none']); await pg.wait_for_timeout(300)
    await pg.evaluate("(()=>{ conquestWorldView = false; pl2ProPreview('2-SK'); })()"); await pg.wait_for_timeout(1500)
    r = await pg.evaluate("({panel: !!document.querySelector('.ui12-skirm'), reroll: !!document.querySelector('[data-skirm-reroll]'), draw: !!skirmDraw, rank: !!document.querySelector('.ui12-skirm [data-skirm-side=enemy] .ui12-drank')})")
    ok(r['panel'] and not r['reroll'] and r['draw'] and r['rank'], f'the skirmish panel shows the drawn decks, with no New draw button {r}')
    await pg.add_style_tag(content=NOTOAST); await pg.screenshot(path=shot('jj11-no-new-draw', w))
    r = await pg.evaluate("(async()=>{ const pre = skirmDraw.enemy.id; try{ skipTriggerLesson(); }catch(e){} document.getElementById('cnpFightBtn').click(); await new Promise(r=> setTimeout(r, 2500)); return {pre, played: matchState && matchState.skirm && matchState.skirm.deck, cleared: skirmDraw === null}; })()")
    ok(r['played'] == r['pre'] and r['cleared'], f'the fight plays the drawn deck and the next fight draws anew {r}')
    await done(pg)

# ---------------------------------------------------------------- JJ13
async def jj13(b, url, w):
    print(f'-- JJ13: Brood hatches from a 🐣 ({w})')
    pg = await W.fresh(b, url, w)
    await pg.evaluate(V.BOARD + "([], [])")
    r = await pg.evaluate("""(async()=>{ """ + SLEEP + """ const m = matchState, E = m.engine, me = m.players[1]; m.resolving = false; me.playedThisTurn = false; me.lumber = 20;
      const hc = {uid: 900001, defId: 'swarm-matriarch'}; me.hand = [hc]; renderMatchUI(); await W(300);
      let eggs = 0; const iv = setInterval(()=>{ eggs = Math.max(eggs, document.querySelectorAll('.ui14-brood-egg').length); }, 30);
      playCardByUid(900001, 0); await W(2000); clearInterval(iv);
      const toks = [...document.querySelectorAll('#rowMine .board-card[data-defid$="~brood"]')];
      return {eggs, toks: toks.length, marked: toks.filter(t=> t.dataset.ui14Brood === '1').length, left: document.querySelectorAll('.ui14-brood-egg').length, op: toks.map(t=> getComputedStyle(t).opacity)}; })()""")
    ok(r['toks'] >= 1 and r['marked'] == r['toks'], f'the Brood token came out of a 🐣 {r}')
    ok(r['eggs'] >= 1 and r['left'] == 0, f'the egg hopped and is gone after it lands {r}')
    ok(all(float(o) > .95 for o in r['op']), 'the token is fully shown after hatching')
    await done(pg)

# ---------------------------------------------------------------- JJ14
async def jj14(b, url, w):
    print(f'-- JJ14: your turn\'s glow on the frame ({w})')
    pg = await W.fresh(b, url, w)
    await pg.evaluate(V.BOARD + "([['otter-kit', 0, 5]], [['otter-kit', 0, 5]])")
    r = await pg.evaluate("""(async()=>{ """ + SLEEP + """ const inner = document.getElementById('battlefieldInner'); inner.style.transform = 'translateX(70px)'; // the camera leaned to the right
      ui14TurnGlow(); let pk = 0; for(let i = 0; i < 20; i++){ await W(40); const gg = document.querySelector('#battlefieldEl > .ui14-turn-glow'); if(gg) pk = Math.max(pk, +getComputedStyle(gg).opacity); } const g = document.querySelector('#battlefieldEl > .ui14-turn-glow'), bf = document.getElementById('battlefieldEl').getBoundingClientRect(), row = document.getElementById('rowMine').getBoundingClientRect();
      if(!g) return null; const gr = g.getBoundingClientRect(); const o = {g: [gr.left, gr.right, gr.top, gr.bottom], bf: [bf.left, bf.right, bf.bottom], rowTop: row.top, old: document.getElementById('rowMine').classList.contains('turn-glow'), op: pk, anim: getComputedStyle(g).animationName, running: g.getAnimations().length};
      inner.style.transform = ''; await W(1700); o.gone = !document.querySelector('#battlefieldEl > .ui14-turn-glow'); return o; })()""")
    ok(r is not None and abs(r['g'][0] - r['bf'][0]) <= 3 and abs(r['g'][1] - r['bf'][1]) <= 3, f'the glow spans the frame, not the leaned row {r and (r["g"], r["bf"])}')
    ok(r is not None and abs(r['g'][3] - r['bf'][2]) <= 3 and r['g'][2] < r['bf'][2] and not r['old'] and r['anim'] == 'ui14TurnGlow' and r['running'] >= 1, f'(headless draws frames only on demand, so its fade is checked by its animation, not a sampled opacity) from your row down to the frame\'s foot, visible {r}')
    ok(r is not None and r['gone'], 'it is gone after its 1.8 s')
    await done(pg)

# ---------------------------------------------------------------- JJ15
async def jj15(b, url, w):
    print(f'-- JJ15: status chips centred, counts from 2 ({w})')
    pg = await W.fresh(b, url, w)
    u = await pg.evaluate(V.BOARD + "([['otter-kit', 0, 6, {bleed: 1, poison: 3}], ['otter-kit', 1, 6, {bleed: 3, poison: 1, asleep: 1}]], [['otter-kit', 0, 5, {exposed: 2}]])")
    r = await pg.evaluate("""(([a, b])=>{ const chips = uid=> { const el = boardCardEl(uid), s = el.querySelector('.status-chips'), t = el.querySelector('.card-tile'); const sr = s.getBoundingClientRect(), tr = t.getBoundingClientRect(), wb = t.querySelector('.waitbadge');
        const room = wb ? (wb.getBoundingClientRect().left - tr.left) : tr.width; return {txt: Object.fromEntries([...s.querySelectorAll('.abadge')].map(x=> [x.classList[1], x.textContent.trim()])), off: Math.round((sr.left + sr.width/2) - (tr.left + room/2)), wait: !!wb}; };
      return {a: chips(a), b: chips(b)}; })""", [u['1:0'], u['1:1']])
    ta, tb = r['a']['txt'], r['b']['txt']
    ok(ta.get('poison') == '3' and ta.get('bleed') == '', f'(the icons are images) Poison 3 shows 3, Bleed 1 shows the icon alone {ta}')
    ok(tb.get('poison') == '' and tb.get('bleed') == '3' and tb.get('sleep') == '', f'Poison 1 and Sleep 1 alone, Bleed 3 shows 3 {tb}')
    ok(abs(r['a']['off']) <= 3 and abs(r['b']['off']) <= 3, f'the strip is centred on the card (left of the Wait clock when there is one) {r["a"]["off"], r["b"]["off"]}')
    await pg.add_style_tag(content=NOTOAST)
    el = await pg.query_selector(f'[data-uid="{u["1:0"]}"]'); bb = await el.bounding_box()
    await pg.screenshot(path=shot('jj15-status-chips', w), clip={'x': max(0, bb['x'] - 40), 'y': max(0, bb['y'] - 30), 'width': min(w - max(0, bb['x'] - 40), bb['width'] * 2 + 120), 'height': bb['height'] + 50})
    await done(pg)

# ---------------------------------------------------------------- JJ16
async def jj16(b, url, w):
    print(f'-- JJ16: the topbar map button and even gaps ({w})')
    pg = await W.fresh(b, url, w)
    r = await pg.evaluate("""(async()=>{ """ + SLEEP + """ switchTab('codex'); await W(900); const tb = document.querySelector('.topbar');
      const items = [...tb.children].filter(e=> e.id !== 'brandHomeBtn' && !e.hidden && getComputedStyle(e).display !== 'none').map(e=>{ const r = e.getBoundingClientRect(); return {id: e.id || e.className.split(' ')[0], l: r.left, r: r.right, t: r.top, h: r.height}; });
      const gaps = items.slice(1).map((x, i)=> Math.round(x.l - items[i].r)), hs = [...new Set(items.map(x=> Math.round(x.h)))], mids = [...new Set(items.map(x=> Math.round(x.t + x.h/2)))];
      return {ids: items.map(x=> x.id), gaps, hs, mids, map: !!document.getElementById('ui14MapNavBtn') && !document.getElementById('ui14MapNavBtn').hidden}; })()""")
    ok(r['map'] and 'ui14MapNavBtn' in r['ids'] and r['ids'].index('ui14MapNavBtn') == r['ids'].index('homeNavBtn') + 1, f'a 🗺️ beside 🏠 on the Codex {r["ids"]}')
    ok(max(r['gaps']) - min(r['gaps']) <= 1 and len(r['hs']) == 1 and max(r['mids']) - min(r['mids']) <= 1, f'one gap, one height, one centre line {r}')
    await pg.add_style_tag(content=NOTOAST)
    await pg.screenshot(path=shot('jj16-topbar', w), clip={'x': max(0, w - 520), 'y': 0, 'width': min(520, w), 'height': 80})
    r = await pg.evaluate("(async()=>{ document.getElementById('ui14MapNavBtn').click(); await new Promise(r=> setTimeout(r, 900)); return {tab: currentTab, sub: playSubTab, map: !!document.getElementById('conquestCanvas'), hiddenNow: document.getElementById('ui14MapNavBtn').hidden}; })()")
    ok(r['tab'] == 'play' and r['sub'] == 'conquest' and r['map'] and r['hiddenNow'], f'it opens the conquest map (and hides there) {r}')
    await done(pg)

# ---------------------------------------------------------------- JJ20
async def jj20(b, url, w):
    print(f'-- JJ20: the Devilry box ({w})')
    pg = await W.fresh(b, url, w)
    r = await pg.evaluate("""(async()=>{ openCardDetail('the-sixfold'); await new Promise(r=> setTimeout(r, 700)); const box = document.querySelector('#cardDetailOverlay .mech-wrap.mech-devilry'); if(!box) return null;
      box.scrollIntoView({block: 'center'}); await new Promise(r=> setTimeout(r, 200)); const s = box.querySelector('.ritual-shape'), br = box.getBoundingClientRect(), sr = s.getBoundingClientRect(), li = s.closest('li').getBoundingClientRect();
      return {bg: getComputedStyle(box).backgroundImage, off: Math.round((sr.left + sr.width/2) - (li.left + li.width/2)), offBox: Math.round((sr.left + sr.width/2) - (br.left + br.width/2)), own: Math.round(sr.top - box.querySelector('.ritual-line').getBoundingClientRect().top)}; })()""")
    ok(r is not None and 'linear-gradient' in r['bg'] and 'rgb(12, 11, 12)' in r['bg'] and 'rgb(59, 58, 60)' in r['bg'], f'a black-grey-black gradient {r and r["bg"][:120]}')
    ok(r is not None and abs(r['off']) <= 2 and abs(r['offBox']) <= 14 and r['own'] > 8, f'the Ritual shape is centred on its own line {r}')
    await pg.add_style_tag(content=NOTOAST)
    el = await pg.query_selector('#cardDetailOverlay .mech-wrap.mech-devilry'); bb = await el.bounding_box()
    await pg.screenshot(path=shot('jj20-devilry', w), clip={'x': max(0, bb['x'] - 10), 'y': max(0, bb['y'] - 10), 'width': min(w, bb['width'] + 20), 'height': bb['height'] + 20})
    await done(pg)

# ---------------------------------------------------------------- JJ23
async def jj23(b, url, w):
    print(f'-- JJ23: Sulphur Fumes gas ({w})')
    pg = await W.fresh(b, url, w)
    key = await pg.evaluate("(()=>{ const m = CONQUEST_MAPS.find(x=> x.id === 'mx'); const n = m.nodes.find(n=> n.kind !== 'tutorial' && fightRules('mx', n).sulphurFumes); return n ? n.key : null; })()")
    ok(key is not None, f'a Dragon Lair fight under Sulphur Fumes ({key})')
    await pg.evaluate("(k)=>{ switchTab('play'); startConquestMatch('mx', k, {skipEnergyCost:true, noOpener:true}); }", key); await pg.wait_for_timeout(3200)
    r = await pg.evaluate("""(async()=>{ """ + SLEEP + """ try{ skipTriggerLesson(); }catch(e){} const m = matchState; renderMatchUI(); await W(1600); const g = document.querySelector('#battlefieldEl > .ui14-fumes'); if(!g) return null;
      const inOp = +getComputedStyle(g).opacity, cls1 = g.classList.contains('is-in'); m.resolving = true; ui14SyncFumes(m); await W(1500); const outOp = +getComputedStyle(g).opacity; m.resolving = false; renderMatchUI(); await W(1600);
      const g2 = document.querySelector('#battlefieldEl > .ui14-fumes'); return {inOp, cls1, outOp, back: g2 && +getComputedStyle(g2).opacity}; })()""")
    ok(r is not None and r['cls1'] and r['inOp'] > .9, f'the gas is in on your turn {r}')
    ok(r is not None and r['outOp'] < .1 and r['back'] > .9, f'out during the fight, back in for the next turn {r}')
    await pg.add_style_tag(content=NOTOAST); await pg.screenshot(path=shot('jj23-fumes', w))
    # a fight with no fumes has no gas
    r = await pg.evaluate("(async()=>{ matchState._ui14Fumes = false; ui14SyncFumes(matchState); return !document.querySelector('#battlefieldEl > .ui14-fumes'); })()")
    ok(r, 'no gas layer without Sulphur Fumes')
    await done(pg)

# ---------------------------------------------------------------- JJ26
async def jj26(b, url, w):
    print(f'-- JJ26: the sight eyes fade out ({w})')
    pg = await W.fresh(b, url, w)
    u = await pg.evaluate(V.BOARD + "([['otter-kit', 0, 6, {blind: 2}]], [['otter-kit', 0, 5]])")
    r = await pg.evaluate("""(async(uid)=>{ """ + SLEEP + """ const mark = ()=>{ const el = boardCardEl(uid); FX.B.markSight(el, 'dark', {look: 'A'}); ui14EyeFade(); return el; };
      let el = mark(); const shut = el.querySelector(':scope > .fxb-shut'); const op0 = shut ? +getComputedStyle(shut).opacity : null; await W(1200); const op1 = +getComputedStyle(el.querySelector(':scope > .fxb-shut')).opacity;
      await W(2400); const op2 = +getComputedStyle(el.querySelector(':scope > .fxb-shut')).opacity; renderBoard(); await W(200); el = mark(); const op3 = +getComputedStyle(el.querySelector(':scope > .fxb-shut')).opacity;
      const shade = el.querySelector(':scope > .fxb-shade'), ico = el.querySelector('.card-tile .ico'); const tile = el.querySelector('.card-tile');
      return {op0, op1, op2, op3, shade: shade ? +getComputedStyle(shade).opacity : null, ico: ico ? getComputedStyle(ico).filter : null, blindTile: getComputedStyle(tile).filter}; })""", u['1:0'])
    ok(r['op0'] is not None and r['op1'] > .9, f'the eye shows when it first appears {r}')
    ok(r['op2'] < .05 and r['op3'] < .05, f'it fades out after about 2.4 s and a redraw does not bring it back {r}')
    ok(r['shade'] is not None and r['shade'] <= .15 and (r['ico'] or '').startswith('brightness(0.9'), f'the darkness on the card is about 10% {r}')
    ok('brightness(0.9)' in r['blindTile'], f'the Blind tile is darkened 10% {r["blindTile"]}')
    await done(pg)

PARTS = {'jj8': jj8, 'jj2': jj2, 'jj3': jj3, 'jj4': jj4, 'jj6': jj6, 'jj10': jj10, 'jj11': jj11, 'jj13': jj13, 'jj14': jj14, 'jj15': jj15, 'jj16': jj16, 'jj20': jj20, 'jj23': jj23, 'jj26': jj26}

async def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--page', default='index.html'); ap.add_argument('--width', default='1366,390'); ap.add_argument('--only', default='')
    a = ap.parse_args(); httpd = V.serve(); url = f'http://127.0.0.1:{httpd.server_address[1]}/{a.page}'
    parts = [p for p in a.only.split(',') if p] or list(PARTS)
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=V.CHROME)
        for w in [int(x) for x in a.width.split(',')]:
            for k in parts:
                try: await PARTS[k](b, url, w)
                except Exception as e: ok(False, f'{k} at {w} raised {str(e)[:300]}')
        await b.close()
    print('\nFAILED: %d' % len(fails) if fails else '\nall checks passed'); sys.exit(1 if fails else 0)
asyncio.run(main())
