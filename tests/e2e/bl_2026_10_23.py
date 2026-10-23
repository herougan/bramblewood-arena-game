#!/usr/bin/env python3
"""Package BL (2026-10-23): browser checks and screenshots at 390 and 1366, saved in docs/screens/BL/.

    python3 tests/e2e/bl_2026_10_23.py            # checks + shots
    python3 tests/e2e/bl_2026_10_23.py --widths 1366

Covers: a Bloom in a live fight (the engine's bloomCopyPass on the match: the copy appears in the free slot beside the unit, with the bloom
look: petals drifting in, the ring of light, the copy's "+1/+1"); Bleed's fade (one grey 🩸 drops from the Bleed pip to the ground under the
card); the card text of a default Diurnal ("Diurnal — By day ...", no "+1/+0" in its name) next to a non-default one, and the Bloom line in the
card details. Build first. Exits 1 on a failed check.
"""
import argparse, asyncio, http.server, socketserver, threading, functools, os, sys
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'docs', 'screens', 'BL'); os.makedirs(OUT, exist_ok=True)
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
SKIP = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1');"
        "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying']));")
OWN = ("FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); Object.entries(myDeckCounts).forEach(([id,n])=>{for(let i=0;i<n;i++) unlockCardForPlayer(id,'test');});"
       "saveEnergyState({current:60, lastRegenAt:Date.now()}); try{ refreshEnergyHud(); }catch(e){} window.showCoachTip = ()=>{}; window.maybeShowCoachTip = ()=>{};")
fails = []; shots = []
def ok(cond, msg):
    print(('  ok  ' if cond else '  FAIL ') + msg)
    if not cond: fails.append(msg)

def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    httpd = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT))
    threading.Thread(target=httpd.serve_forever, daemon=True).start(); return httpd

async def fresh(b, url, w):
    pg = await b.new_page(viewport={'width': w, 'height': 844 if w < 700 else 860}, has_touch=(w < 700))
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg._errs = errs
    await pg.add_init_script(SKIP)
    await pg.goto(url); await pg.wait_for_timeout(1300)
    await pg.evaluate("(()=>{ " + OWN + " })()")
    return pg

async def shot(pg, name, w):
    f = os.path.join(OUT, f'bl-{name}-{w}.png'); await pg.screenshot(path=f, animations='allow'); shots.append(f); return f

# a fight whose board is exactly the given units: [[defId, slot, hp?, extra?], ...] a side; the CPU is kept from acting
BOARD = """(async(mine, theirs)=>{ adminModeEnabled = true; switchTab('play'); startConquestMatch('m11', '20-7'); await new Promise(r=> setTimeout(r, 2600));
  const m = matchState, e = m.engine; m.resolving = true; const uids = {};
  [1, 2].forEach(pid=>{ const pl = m.players[pid]; pl.row.left = []; pl.row.center = []; pl.row.right = []; });
  const put = (pid, list)=> list.forEach(([id, slot, hp, extra])=>{ const c = e.makeBoardCard(id); c.wait = 0; if(hp){ c.hp = c.maxHp = hp; } c.slot = slot; Object.assign(c, extra || {});
    const pl = m.players[pid]; (slot === 0 ? pl.row.center : slot < 0 ? pl.row.left : pl.row.right).push(c); uids[pid + ':' + slot] = c.uid; });
  put(1, mine); put(2, theirs); [1, 2].forEach(pid=>{ const pl = m.players[pid]; pl.row.left.sort((a, b)=> b.slot - a.slot); pl.row.right.sort((a, b)=> a.slot - b.slot); });
  m.replayCards = null; renderMatchUI(); await new Promise(r=> setTimeout(r, 900)); window.__bl = uids; return uids; })"""

async def run(b, url, w):
    print(f'-- width {w}')
    pg = await fresh(b, url, w)
    have = await pg.evaluate("(()=>{ const d = getCardDefs(); return {algae: !!d['pond-algae'], puff: JSON.stringify(((d['puffball-bombardier']||{}).effects||{}).bloomCopy||null), bat: !!d['upside-down-bat']}; })()")
    ok(have['algae'] and 'kill' in (have['puff'] or ''), f"the game's cards have Pond Algae and the Puffball's Bloom ({have})")
    # ---- Bloom in a live fight: the engine's pass on the match, then its events through the board
    u = await pg.evaluate(BOARD + "([['puffball-bombardier', 0, 7, {bloomKill:true}]], [['bee-knight', 0]])")
    res = await pg.evaluate("""(async()=>{ const m = matchState, e = m.engine, so = id=> id === 1 ? 'A' : 'B'; e.setField('rain', 3);
      const p0 = m.players[1], src = [...p0.row.left, ...p0.row.center, ...p0.row.right][0]; src.hp = 4; src.poison = 2;
      m.replayCards = {}; [1,2].forEach(pid=> ['left','center','right'].forEach(s=> m.players[pid].row[s].forEach(c=> m.replayCards[c.uid] = {uid:c.uid, defId:c.defId, atk:c.atk, hp:c.hp, maxHp:c.maxHp, slot:c.slot, poison:c.poison})));
      const ev = []; e.bloomCopyPass(m.players, so, {}, ev); const cp = [...p0.row.left, ...p0.row.center, ...p0.row.right].find(c=> c.bloomCopy);
      if(cp) m.replayCards[cp.uid] = {uid:cp.uid, defId:cp.defId, atk:cp.atk, hp:cp.hp, maxHp:cp.maxHp, slot:cp.slot};
      m.replayCards = null; renderMatchUI(); ev.forEach(x=> renderVfxForEvent(x));
      return {types: ev.map(x=> x.type + ':' + (x.kind || '')), src: {atk: src.atk, hp: src.hp, max: src.maxHp, slot: src.slot}, copy: cp ? {uid: cp.uid, atk: cp.atk, hp: cp.hp, max: cp.maxHp, slot: cp.slot, poison: cp.poison} : null}; })()""")
    ok(res['types'] == ['bloom:', 'spawn:bloom'] and res['copy'] and abs(res['copy']['slot'] - res['src']['slot']) == 1, f"Bloom: the engine blooms it in the fight, the copy beside it ({res})")
    ok(res['copy'] and res['copy']['hp'] == res['src']['hp'] + 1 and res['copy']['max'] == res['src']['max'] + 1 and res['copy']['atk'] == res['src']['atk'] + 1 and res['src']['atk'] == 1 and not res['copy']['poison'], 'Bloom: the copy has +1/+1 and its damage, not its Poison; the unit is unchanged (1/4 of 7)')
    await pg.wait_for_timeout(330)
    fx = await pg.evaluate(f"""(()=>{{ const el = boardCardEl({res['copy']['uid'] if res['copy'] else 0}); return {{copy: !!el, blooming: !!(el && el.classList.contains('is-blooming')), petals: document.querySelectorAll('.bloom-petal').length, ring: document.querySelectorAll('.bloom-ring').length, floats: [...document.querySelectorAll('.float-text, .fx-float, [class*=float]')].map(x=> x.textContent).filter(t=> /\\+1\\/\\+1/.test(t)).length}}; }})()""")
    await shot(pg, 'bloom-copy-appears', w)
    ok(fx['copy'] and fx['blooming'] and fx['petals'] >= 8 and fx['ring'] == 1, f'Bloom: the copy is on the board and blooms in (petals, the ring) ({fx})')
    await pg.wait_for_timeout(250); await shot(pg, 'bloom-copy-opening', w)
    await pg.wait_for_timeout(1400)
    after = await pg.evaluate(f"""(()=>{{ const el = boardCardEl({res['copy']['uid'] if res['copy'] else 0}), s = boardCardEl({u['1:0']}); return {{petals: document.querySelectorAll('.bloom-petal').length, chipSpent: !!(el && el.querySelector('.ab-bloomcopy.is-spent')), srcSpent: !!(s && s.querySelector('.ab-bloomcopy.is-spent'))}}; }})()""")
    await shot(pg, 'bloom-copy-settled', w)
    # 2026-10-24 (package EN5, owner BL-1: "the copy can bloom"): only the unit that bloomed greys its chip; the copy's stays lit (was: both grey)
    ok(after['petals'] == 0 and not after['chipSpent'] and after['srcSpent'], f'Bloom: the look is over; the bloomed unit\'s chip is greyed, the copy\'s stays lit (it can bloom too) ({after})')
    # ---- Bleed fades: one grey drop from the pip to the ground
    u = await pg.evaluate(BOARD + "([['bee-knight', 0, 12, {bleed:2}]], [['bee-knight', 0]])")
    pip = await pg.evaluate(f"""(()=>{{ const el = boardCardEl({u['1:0']}), p = el && el.querySelector('.abadge.bleed'); if(!p) return null; const r = p.getBoundingClientRect(), c = el.getBoundingClientRect(); return {{top: r.top, left: r.left, bottom: c.bottom, text: p.textContent}}; }})()""")
    ok(pip and '2' in pip['text'], f'Bleed: the card shows its Bleed pip ({pip})')
    await pg.evaluate(f"""(()=>{{ const m = matchState; m.replayCards = {{}}; [1,2].forEach(pid=> ['left','center','right'].forEach(s=> m.players[pid].row[s].forEach(c=> m.replayCards[c.uid] = {{uid:c.uid, defId:c.defId, atk:c.atk, hp:c.hp, maxHp:c.maxHp, slot:c.slot, bleed:c.bleed}})));
      window.__drop = []; renderVfxForEvent({{type:'bleedFade', side:'A', defId:'bee-knight', uid:{u['1:0']}, left:1}});
      const iv = setInterval(()=>{{ const d = document.querySelector('.bleed-drop'); if(d){{ const r = d.getBoundingClientRect(); window.__drop.push([Math.round(r.top), getComputedStyle(d).filter]); }} }}, 50); setTimeout(()=> clearInterval(iv), 1500); }})()""")
    await pg.wait_for_timeout(120); await shot(pg, 'bleed-drop-start', w)
    await pg.wait_for_timeout(420); await shot(pg, 'bleed-drop-ground', w)
    await pg.wait_for_timeout(1100)
    drop = await pg.evaluate(f"""(()=>{{ const el = boardCardEl({u['1:0']}), p = el && el.querySelector('.abadge.bleed'); return {{pts: window.__drop, left: document.querySelectorAll('.bleed-drop').length, pip: p ? p.textContent : null}}; }})()""")
    pts = drop['pts'] or []
    ok(len(pts) >= 5 and 'grayscale' in (pts[0][1] or '') and pts[0][0] <= pip['top'] + 6 and max(p[0] for p in pts) >= pip['bottom'] - 4, f"Bleed: one grey 🩸 falls from the pip to the ground under the card ({pts[:3]} ... max {max([p[0] for p in pts] or [0])}, card bottom {pip['bottom']:.0f})")
    ok(drop['left'] == 0 and drop['pip'] and '1' in drop['pip'], f'Bleed: the drop is gone and the pip reads 1 ({drop["pip"]})')
    # ---- card text: a default Diurnal has a bare name; a non-default keeps its numbers; Bloom's line
    lines = await pg.evaluate("""(()=>{ const t = h=> String(h).replace(/<[^>]+>/g, '').replace(/&amp;/g, '&'); const d = getCardDefs();
      const one = id=> { const x = describeEffects(d[id]); return (Array.isArray(x) ? x : [x]).map(t); };
      return {bat: one('upside-down-bat').filter(l=> /Diurnal/.test(l)), bell: one('dawn-bellringer').filter(l=> /Diurnal/.test(l)), puff: one('puffball-bombardier').filter(l=> /Bloom/.test(l)), colossus: one('fungal-colossus').filter(l=> /Bloom/.test(l))}; })()""")
    ok(lines['bat'] and lines['bat'][0].startswith('☀') is not None and 'Diurnal — ' in lines['bat'][0] and '+1/+0 —' not in lines['bat'][0] and '+1/+0' in lines['bat'][0], f"card text: a default Diurnal reads 'Diurnal — By day: ... +1/+0' ({lines['bat']})")
    ok(lines['bell'] and 'Diurnal +1/+2 — ' in lines['bell'][0], f"card text: Diurnal +1/+2 keeps its numbers ({lines['bell']})")
    ok(lines['puff'] and 'Bloom (Wet & Killed an enemy) — ' in lines['puff'][0] and lines['colossus'] and 'Bloom (Wet & Sunny + 1 Lumber) — ' in lines['colossus'][0], f"card text: Bloom (Wet & Killed an enemy), Bloom (Wet & Sunny + 1 Lumber) ({lines['puff']}, {lines['colossus']})")
    await pg.evaluate("(()=>{ try{ if(matchState){ matchState.over = true; } }catch(e){} switchTab('collection'); })()"); await pg.wait_for_timeout(600)
    await pg.evaluate("(()=>{ openCardDetail('upside-down-bat'); })()"); await pg.wait_for_timeout(700)
    vis = await pg.evaluate("(()=>{ const o = document.getElementById('cardDetailOverlay'); return o ? o.innerText : ''; })()")
    ok('Diurnal' in vis and 'Diurnal +1/+0' not in vis, f'card details: the Upside-Down Bat reads "Diurnal" without "+1/+0" in its name')
    await shot(pg, 'card-text-default-diurnal', w)
    await pg.evaluate("(()=>{ try{ closeCardDetail && closeCardDetail(); }catch(e){} const o = document.getElementById('cardDetailOverlay'); if(o) o.classList.remove('open'); openCardDetail('dawn-bellringer'); })()"); await pg.wait_for_timeout(700)
    await shot(pg, 'card-text-diurnal-numbers', w)
    await pg.evaluate("(()=>{ try{ closeCardDetail && closeCardDetail(); }catch(e){} openCardDetail('fungal-colossus'); })()"); await pg.wait_for_timeout(700)
    vis2 = await pg.evaluate("(()=>{ const o = document.getElementById('cardDetailOverlay'); return o ? o.innerText : ''; })()")
    ok('Bloom (Wet & Sunny + 1 Lumber)' in vis2, 'card details: Fungal Colossus shows Bloom (Wet & Sunny + 1 Lumber)')
    await shot(pg, 'card-text-bloom', w)
    ok(not pg._errs, f'no page errors {pg._errs[:2]}')
    await pg.close()

async def main(widths):
    httpd = serve(); url = f'http://127.0.0.1:{httpd.server_address[1]}/index.html'
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME)
        for w in widths: await run(b, url, w)
        await b.close()
    httpd.shutdown()
    print('shots:', len(shots), 'in', OUT)
    print('FAILED:' if fails else 'all checks passed', len(fails) or '')
    sys.exit(1 if fails else 0)

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--widths', default='390,1366')
    a = ap.parse_args(); asyncio.run(main([int(x) for x in a.widths.split(',')]))
