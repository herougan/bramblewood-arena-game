#!/usr/bin/env python3
"""Package EN7 (2026-10-24): browser checks and screenshots at 390 and 1366, saved in docs/screens/EN7/.

    python3 tests/e2e/en7_2026_10_24.py            # checks + shots
    python3 tests/e2e/en7_2026_10_24.py --widths 1366

Covers: Dive turn 1 (a Flyer aloft with its shadow, a Tide unit under the water; the look kept by a re-render, from the live unit and the
replay's copy; "Out of reach"), Dive turn 2 (the strike: the plunge, "Dive +2", the look gone), the Guardian's 10° tilt toward the attacker
and its settling, the Poison pool sinking as it fades, the applied-Poison float "🤢N" (one icon, no plus), a Parasite's bloom copy hooking
onto the enemy beside its host, the – poison box in the trigger editor and the "Arrow 2 – poison" card line. Build first. Exits 1 on a
failed check.
"""
import argparse, asyncio, http.server, socketserver, threading, functools, os, sys
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'docs', 'screens', 'EN7'); os.makedirs(OUT, exist_ok=True)
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
SKIP = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1');"
        "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying']));")
OWN = ("FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); Object.entries(myDeckCounts).forEach(([id,n])=>{for(let i=0;i<n;i++) unlockCardForPlayer(id,'test');});"
       "saveEnergyState({current:60, lastRegenAt:Date.now()}); try{ refreshEnergyHud(); }catch(e){} try{ skipTriggerLesson(); }catch(e){} window.showCoachTip = ()=>{}; window.maybeShowCoachTip = ()=>{};")
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
    f = os.path.join(OUT, f'en7-{name}-{w}.png'); await pg.screenshot(path=f, animations='allow'); shots.append(f); return f

# a fight whose board is exactly the given units (as tests/e2e/en6_2026_10_24.py); the CPU is kept from acting
BOARD = """(async(mine, theirs)=>{ adminModeEnabled = true; try{ skipTriggerLesson(); }catch(e){} switchTab('play'); startConquestMatch('m11', '20-7'); await new Promise(r=> setTimeout(r, 2600));
  const m = matchState, e = m.engine; m.resolving = true; const uids = {};
  [1, 2].forEach(pid=>{ const pl = m.players[pid]; pl.row.left = []; pl.row.center = []; pl.row.right = []; });
  const put = (pid, list)=> list.forEach(([id, slot, hp])=>{ const c = e.makeBoardCard(id); c.wait = 0; c.hp = c.maxHp = hp || 9; c.slot = slot;
    const pl = m.players[pid]; (slot === 0 ? pl.row.center : slot < 0 ? pl.row.left : pl.row.right).push(c); uids[pid + ':' + slot] = c.uid; });
  put(1, mine); put(2, theirs); [1, 2].forEach(pid=>{ const pl = m.players[pid]; pl.row.left.sort((a, b)=> b.slot - a.slot); pl.row.right.sort((a, b)=> a.slot - b.slot); });
  m.replayCards = null; renderMatchUI(); await new Promise(r=> setTimeout(r, 900));
  m.replayCards = {}; [1,2].forEach(pid=> ['left','center','right'].forEach(s=> m.players[pid].row[s].forEach(c=> m.replayCards[c.uid] = {uid:c.uid, defId:c.defId, atk:c.atk, hp:c.hp, maxHp:c.maxHp, slot:c.slot, poison:0, bleed:0, gpoison:0, shield:0, en5On:'', hibernating:false})));
  return uids; })"""
CLS = "(uid=>{ const el = document.querySelector(`.board-card[data-uid=\"${uid}\"]`); if(!el) return null; const t = el.querySelector('.card-tile'); return {aloft: el.classList.contains('en7-aloft'), under: el.classList.contains('en7-under'), shadow: !!el.querySelector('.en7-shadow'), water: !!el.querySelector('.en7-water'), tag: (el.querySelector('.en7-dive-tag') || {title:''}).title || '', top: t ? parseFloat(getComputedStyle(t).top) || 0 : null, op: t ? parseFloat(getComputedStyle(t).opacity) : null}; })"
FLOATS = "(()=> [...document.querySelectorAll('.dmg-float')].map(f=> ({ico: [...f.querySelectorAll('.df-ico')].map(i=> i.textContent || i.innerHTML).join('|'), n: f.querySelectorAll('.df-ico').length, txt: f.textContent.trim(), cls: f.className})))()"

async def run(b, url, w):
    print(f'-- width {w}')
    pg = await fresh(b, url, w)
    # ---- Dive turn 1: the Puffin Diver aloft, the Harbor Seal under
    u = await pg.evaluate(BOARD + "([['puffin-diver', 0, 5], ['harbor-seal', 1, 9]], [['bee-knight', 0, 20], ['otter-kit', 1, 3], ['otter-kit', -1, 6]])")
    P, S = u['1:0'], u['1:1']
    await pg.evaluate(f"""(()=>{{ renderVfxForEvent({{type:'diveRise', side:'A', uid:{P}, defId:'puffin-diver', mode:'fly', n:2}});
      renderVfxForEvent({{type:'diveRise', side:'A', uid:{S}, defId:'harbor-seal', mode:'tide', n:2}}); }})()""")
    await pg.wait_for_timeout(700)
    a = await pg.evaluate(CLS + f"({P})"); s = await pg.evaluate(CLS + f"({S})")
    await shot(pg, 'dive-turn1-aloft-under', w)
    ok(a and a['aloft'] and a['shadow'] and 'Aloft' in a['tag'] and a['top'] <= -12, f'turn 1: the Puffin Diver is aloft (lifted, its shadow, the ☁️ tag) ({a})')
    ok(s and s['under'] and s['water'] and 'Under the water' in s['tag'] and s['top'] >= 8 and s['op'] < 0.8, f'turn 1: the Harbor Seal is under the water (sunk, faded, the water band, the 🌊 tag) ({s})')
    await pg.evaluate(f"(()=> renderVfxForEvent({{type:'evaded', reason:'aloft', side:'B', attUid:{u['2:0']}, attDefId:'bee-knight', targetSide:'A', targetUid:{P}, targetDefId:'puffin-diver'}}))()")
    await pg.wait_for_timeout(200)
    fl = await pg.evaluate(FLOATS)
    await shot(pg, 'dive-out-of-reach', w)
    ok(any('Out of reach' in f['txt'] for f in fl), f'a swing at it: "Out of reach" ({[f["txt"] for f in fl][:4]})')
    lg = await pg.evaluate("(()=>{ const nm = id=> (getCardDefs()[id]||{}).name; return [logText({type:'diveRise', mode:'fly', defId:'puffin-diver'}), logText({type:'diveRise', mode:'tide', defId:'harbor-seal'}), logText({type:'evaded', reason:'aloft', attDefId:'bee-knight', targetDefId:'puffin-diver'})].map(x=> x && x.text); })()")
    ok('rises out of reach' in (lg[0] or '') and 'under the water' in (lg[1] or '') and 'out of reach' in (lg[2] or ''), f'the log lines ({lg})')
    # the look survives a re-render: the replay's copy carries it (eq2Snap), and the live unit draws it
    a2 = await pg.evaluate("(()=>{ const x = eq2Snap({diveAloft: 1, diveMode: 'tide'}); return {aloft: x.diveAloft === 1 && x.diveMode === 'tide'}; })()")
    await pg.evaluate(f"(()=>{{ const m = matchState, c = m.players[1].row.center[0]; c.diveAloft = 1; c.diveMode = 'fly'; m.replayCards = null; renderMatchUI(); }})()"); await pg.wait_for_timeout(250)
    a3 = await pg.evaluate(CLS + f"({P})")
    ok(a2 and a2['aloft'] and a3 and a3['aloft'] and a3['shadow'], f'a re-render keeps it aloft (the replay copy {bool(a2 and a2["aloft"])}, the live unit {bool(a3 and a3["aloft"])})')
    await pg.evaluate("(()=>{ const m = matchState; m.replayCards = {}; [1,2].forEach(pid=> ['left','center','right'].forEach(s=> m.players[pid].row[s].forEach(c=> m.replayCards[c.uid] = {uid:c.uid, defId:c.defId, atk:c.atk, hp:c.hp, maxHp:c.maxHp, slot:c.slot, diveAloft:c.diveAloft != null ? c.diveAloft : null, diveMode:c.diveMode || null}))); })()")
    # ---- Dive turn 2: the strike
    await pg.evaluate("(()=>{ window.__fl = new Set(); window.__fiv = setInterval(()=> document.querySelectorAll('.dmg-float').forEach(f=> window.__fl.add(f.textContent.trim())), 20); })()")
    await pg.evaluate(f"""(()=>{{ const c = matchState.players[1].row.center[0]; c.diveAloft = null;
      renderVfxForEvent({{type:'dive', strike:true, side:'A', attUid:{P}, attDefId:'puffin-diver', targetSide:'B', targetUid:{u['2:1']}, targetDefId:'otter-kit', bonus:2, col:1, mode:'fly'}}); }})()""")
    await pg.wait_for_timeout(140)
    await shot(pg, 'dive-turn2-strike', w)
    await pg.wait_for_timeout(420)
    a4 = await pg.evaluate(CLS + f"({P})"); fl = await pg.evaluate("(()=>{ clearInterval(window.__fiv); return [...window.__fl].map(t=> ({txt: t})); })()")
    await shot(pg, 'dive-turn2-exposed', w)
    ok(a4 and not a4['aloft'] and not a4['shadow'] and abs(a4['top']) < 2, f'turn 2: it comes down onto its target, the look gone ({a4})')
    ok(any('Dive' in f['txt'] and '2' in f['txt'] for f in fl) and any('Exposed' in f['txt'] for f in fl), f'"Dive +2" and "Exposed" float ({[f["txt"] for f in fl][:5]})')
    await pg.evaluate(f"""(()=>{{ renderVfxForEvent({{type:'dive', strike:true, side:'A', attUid:{S}, attDefId:'harbor-seal', targetSide:'B', targetUid:{u['2:1']}, targetDefId:'otter-kit', bonus:2, col:1, mode:'tide'}}); }})()""")
    await pg.wait_for_timeout(600)
    s2 = await pg.evaluate(CLS + f"({S})")
    ok(s2 and not s2['under'] and not s2['water'] and s2['op'] > 0.95, f'the seal bursts out of the water and is up again ({s2})')
    await pg.wait_for_timeout(500)
    # ---- the Guardian's tilt
    u = await pg.evaluate(BOARD + "([['otter-kit', 0, 9], ['grey-seal-bull', 1, 20]], [['bee-knight', 0, 20]])")
    G = u['1:1']
    await pg.evaluate(f"""(()=>{{ window.__tilt = []; const g = document.querySelector('.board-card[data-uid="{G}"]');
      window.__tiv = setInterval(()=>{{ const r = parseFloat(getComputedStyle(g).rotate) || 0; window.__tilt.push(r); }}, 20);
      renderVfxForEvent({{type:'hit', side:'B', attUid:{u['2:0']}, attDefId:'bee-knight', targetSide:'A', targetUid:{G}, targetDefId:'grey-seal-bull', guardianRedirect:true, guardedUid:{u['1:0']}, dmg:2, dmgType:'physical', mods:[]}}); }})()""")
    best = None
    for k in range(40):
        await pg.wait_for_timeout(25)
        r = await pg.evaluate(f"(()=> parseFloat(getComputedStyle(document.querySelector('.board-card[data-uid=\"{G}\"]')).rotate) || 0)()")
        if abs(r) >= 9.5: best = r; break
    await shot(pg, 'guardian-tilt', w)
    await pg.wait_for_timeout(1500)
    tl = await pg.evaluate(f"(()=>{{ clearInterval(window.__tiv); const g = document.querySelector('.board-card[data-uid=\"{G}\"]'); return {{max: Math.max(...window.__tilt.map(Math.abs)), last: parseFloat(getComputedStyle(g).rotate) || 0, lastTilt: en2GuardStepIn.lastTilt}}; }})()")
    await shot(pg, 'guardian-settled', w)
    ok(best is not None and 9.5 <= abs(best) <= 10.5 and abs(tl['lastTilt']) == 10, f'the Guardian tilts 10° toward the attacker as it takes the hit (seen {best}, lastTilt {tl["lastTilt"]})')
    ok(abs(tl['last']) < 0.5, f'... and settles back ({tl})')
    # ---- Poison: the applied float, then the pool sinking as it runs out
    u = await pg.evaluate(BOARD + "([['otter-kit', 0, 9]], [['bee-knight', 0, 20]])")
    K = u['1:0']
    await pg.evaluate(f"(()=> renderVfxForEvent({{type:'statusFx', kind:'poison', side:'B', attUid:{u['2:0']}, attDefId:'bee-knight', targetSide:'A', targetUid:{K}, targetDefId:'otter-kit', amount:2}}))()")
    await pg.wait_for_timeout(160)
    fl = await pg.evaluate(FLOATS)
    await shot(pg, 'poison-float', w)
    pf = [f for f in fl if 'poison' in f['cls']]
    print('     poison float:', pf)
    ok(pf and pf[0]['n'] == 1 and ('🤢' in pf[0]['ico'] or '1f922' in pf[0]['ico'].lower()) and pf[0]['txt'].replace('🤢', '').strip() == '2' and '+' not in pf[0]['txt'], f'the applied-Poison float is "🤢2": one icon, no plus ({pf[:2]})')
    await pg.evaluate(f"(()=>{{ const el = document.querySelector('.board-card[data-uid=\"{K}\"]'); FX.D.statusLook(el, 'poison', true, 2, {{fresh:true}}); }})()")
    await pg.wait_for_timeout(900)
    await shot(pg, 'poison-pool', w)
    top0 = await pg.evaluate(f"(()=>{{ const el = document.querySelector('.board-card[data-uid=\"{K}\"]'), svg = el.querySelector('.fxd-psn-svg'); return svg ? svg.getBoundingClientRect().top - el.querySelector('.card-tile').getBoundingClientRect().top : null; }})()")
    await pg.evaluate(f"(()=>{{ const el = document.querySelector('.board-card[data-uid=\"{K}\"]'); FX.D.statusLook(el, 'poison', false, 0, {{ended:true, uid:{K}}}); }})()")
    await pg.wait_for_timeout(620)
    sk = await pg.evaluate(f"""(()=>{{ const el = document.querySelector('.board-card[data-uid=\"{K}\"]'), b = el && el.querySelector('.fxd-st-poison'), svg = b && b.querySelector('.fxd-psn-svg'), t = el.querySelector('.card-tile').getBoundingClientRect();
      const r = svg ? svg.getBoundingClientRect() : null; return {{look: !!b, sink: FX.D.poisonSink.last || null, svgTop: r ? r.top - t.top : null, tileH: t.height, op: b ? parseFloat(getComputedStyle(b).opacity) : null}}; }})()""")
    await shot(pg, 'poison-sinking', w)
    ok(sk['look'] and sk['sink'] and top0 is not None and sk['svgTop'] is not None and sk['svgTop'] > top0 + sk['tileH'] * 0.05, f'Poison at 0: the pool sinks toward the card\'s foot as it fades (surface {top0} -> {sk})')
    await pg.wait_for_timeout(1000)
    gone = await pg.evaluate(f"(()=> !!document.querySelector('.board-card[data-uid=\"{K}\"] .fxd-st-poison'))()")
    ok(not gone, 'and is gone')
    # ---- Parasite x Bloom: the copy hooks onto the enemy beside the host
    u = await pg.evaluate(BOARD + "([['otter-kit', 0, 9]], [['bee-knight', 0, 20], ['otter-kit', -1, 9], ['otter-kit', 1, 9]])")
    H, N = u['2:0'], u['2:-1']
    await pg.evaluate(f"""(()=>{{ renderVfxForEvent({{type:'parasiteAttach', side:'A', uid:990001, defId:'clinging-leech', atk:2, hp:9, maxHp:9, wait:0, targetSide:'B', targetUid:{H}, targetDefId:'bee-knight', slot:0}}); }})()""")
    await pg.wait_for_timeout(500)
    await pg.evaluate(f"""(()=>{{ renderVfxForEvent({{type:'bloom', parasite:true, side:'A', uid:990001, defId:'clinging-leech', copyUid:990002, atk:0, hp:0, copyAtk:1, copyHp:1, lumber:0, targetUid:{N}, targetDefId:'otter-kit', targetSide:'B'}});
      renderVfxForEvent({{type:'parasiteAttach', bloom:true, side:'A', uid:990002, defId:'clinging-leech', atk:3, hp:10, maxHp:10, wait:0, targetSide:'B', targetUid:{N}, targetDefId:'otter-kit', slot:-1, fromUid:{H}}}); }})()""")
    await pg.wait_for_timeout(170)
    await shot(pg, 'parasite-bloom-flight', w)
    await pg.wait_for_timeout(450)
    pb = await pg.evaluate(f"(()=>({{host: !!document.querySelector('.board-card[data-uid=\"{H}\"] .eq2-para'), next: (document.querySelector('.board-card[data-uid=\"{N}\"] .eq2-para') || {{}}).textContent || '', log: (logText({{type:'bloom', parasite:true, defId:'clinging-leech', targetDefId:'otter-kit'}}) || {{}}).text}}))()")
    await shot(pg, 'parasite-bloom-hooked', w)
    ok(pb['host'] and '3' in pb['next'] and 'hooks onto' in (pb['log'] or ''), f'the bloom copy hooks onto the enemy beside the host (its 🪱 badge, Attack 3), the log line ({pb})')
    # ---- – poison in the editor and on the card
    ed = await pg.evaluate("(()=>({box: actionFieldsHTML({on:'onSpawn', do:'arrow', amount:2}, 0).includes('data-t=\"withPoison\"'), bleed: actionFieldsHTML({on:'onSpawn', do:'missile', amount:2}, 0).includes('data-t=\"withBleed\"'), heal: actionFieldsHTML({on:'onSpawn', do:'heal', amount:2}, 0).includes('withPoison'), txt: triggerPreviewText({on:'onSpawn', do:'arrow', amount:2, withPoison:true}), line: describeEffects({effects:{arrow:2, poison:2, arrowPoison:true}}).join(' | '), reg: ['arrowPoison','arrowBleed','fireArrowPoison','fireArrowBleed','fireBoltPoison','fireBoltBleed'].filter(k=> PASSIVE_DEFS.some(d=> d.key === k && d.codexNote)).length}))()")
    ok(ed['box'] and ed['bleed'] and not ed['heal'] and '– poison' in ed['txt'] and 'Arrow 2 – poison' in ed['line'] and 'Poison 2 where it lands' in ed['line'] and ed['reg'] == 6, f'the editor: – poison / – bleed boxes on Arrow and Missile (not Heal), the trigger text, the card line "Arrow 2 – poison" ({ed})')
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
