#!/usr/bin/env python3
"""Package ANIM1 (2026-11-03): record short frame sequences of the game's battle animations (review only; changes no game file).

    python3 tools/anim1/anim1_frames.py --width 1366 --mode high [--only regex]
    modes: high | low | rm (reduced motion, FX high); output docs/screens/anim1/anim1-<name>-<mode>-<width>.png and tests/out/anim1/metrics-<width>-<mode>.json

Reuses tests/e2e/vis3 + vis5 helpers (slow motion: every timer x S, GSAP and Web Animations slowed, frames stamped with game time). Build first.
"""
import argparse, asyncio, os, sys, json, re, shutil
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, 'tests', 'e2e'))
import vis3_2026_10_26 as V3
import vis5_2026_10_28 as V5
from playwright.async_api import async_playwright
V5.S = int(os.environ.get('ANIM1_S', '8'))
OUTD = os.path.join(ROOT, 'tests', 'out', 'anim1'); os.makedirs(OUTD, exist_ok=True)
KEEP = os.path.join(ROOT, 'docs', 'screens', 'anim1'); os.makedirs(KEEP, exist_ok=True)
V5.OUT = OUTD

BOARD = "([['otter-kit', 0, 30], ['bee-knight', -1, 30], ['soldier-ant', 1, 30]], [['bee-knight', 0, 30], ['otter-kit', -1, 30], ['soldier-ant', 1, 30]])"
HELP = """(()=>{ window.__U = {}; const m = matchState; [1,2].forEach(pid=> m.engine.allBoardCards(m.players[pid]).forEach(c=>{ window.__U[pid + ':' + c.slot] = c.uid; }));
  window.__add = (pid, id, slot, hp)=>{ const m = matchState, e = m.engine, c = e.makeBoardCard(id); c.wait = 0; c.hp = c.maxHp = hp || 9; c.slot = slot; const pl = m.players[pid];
    (slot === 0 ? pl.row.center : slot < 0 ? pl.row.left : pl.row.right).push(c); pl.row.left.sort((a, b)=> b.slot - a.slot); pl.row.right.sort((a, b)=> a.slot - b.slot); e.syncSlots(pl); renderMatchUI(); return c.uid; };
  window.__hit = (dt, extra)=> renderVfxForEvent(Object.assign({type:'hit', side:'A', attUid:__U['1:0'], attDefId:'otter-kit', targetSide:'B', targetUid:__U['2:0'], targetDefId:'bee-knight', dmg:5, dmgType:dt, mods:[]}, extra||{}));
  matchState.resolving = false; })()"""
STATE = """(()=>{ const base = window.__base || new Set(); const nn = [...document.body.children].filter(x=> !base.has(x) && !/^(SCRIPT|STYLE)$/.test(x.tagName));
  let ga = 0; try{ ga = gsap.globalTimeline.getChildren(true, true, false).filter(t=> t.isActive && t.isActive()).length; }catch(e){}
  return {n: nn.length, tags: nn.slice(0, 6).map(x=> x.className || x.tagName).join('|').slice(0, 120), ga, wa: document.getAnimations().length}; })()"""

def M(name, js, dur=1600, clip='bf', tail=300):
    return dict(name=name, js=js, dur=dur, clip=clip, tail=tail)

HIT = lambda dt, ex='': M('hit-' + dt, f"__hit('{dt}', {{{ex}}})", 1500)
MOMENTS = [
  M('card-play', "(()=>{ const m = matchState, me = m.players[1]; me.hand.length = 0; me.hand.push({uid: 99001, defId: 'otter-kit'}); me.lumber = 20; m.resolving = false; renderMatchUI(); window.__p = playCardByUid(99001, 1); })()", 2600, 'full', tail=300),
  M('leader-summon', "leaderThroneVfx(__U['1:0'], {enemy:false, defId:'ent'})", 1700, 'full'),
  M('pitch-to-graveyard', "(()=>{ const m = matchState, me = m.players[1]; me.hand.length = 0; me.hand.push({uid: 99002, defId: 'otter-kit'}); me.discardUsedThisTurn = false; m.resolving = false; m.awaitingPass = false; renderMatchUI(); window.__p = discardCardByUid(99002); })()", 2200, 'full', tail=300),
  HIT('physical'), HIT('magic'), HIT('fire'), HIT('shock'), HIT('poison'), HIT('frost'), HIT('true'),
  M('hit-ranged-arrow', "__hit('physical', {ranged:true, arrow:true})", 1500),
  M('hit-bramble-castle', "renderVfxForEvent({type:'hitHQ', side:'A', attUid:__U['1:0'], attDefId:'otter-kit', targetSide:'B', dmg:4})", 1600, 'full'),
  M('death', "(()=>{ const u = __U['2:1']; const m = matchState; const c = m.engine.allBoardCards(m.players[2]).find(x=> x.uid === u); c.hp = 0; deathVfx(u); })()", 1700),
  M('burn-tick', "renderVfxForEvent({type:'burnTick', side:'B', defId:'bee-knight', uid:__U['2:0'], dmg:2, left:2, mods:[]})", 1500),
  M('burn-status', "renderVfxForEvent({type:'statusFx', kind:'chilliBurn', side:'A', attUid:__U['1:0'], attDefId:'otter-kit', targetSide:'B', targetUid:__U['2:0'], targetDefId:'bee-knight', amount:2})", 1500),
  M('water-counters', "renderVfxForEvent({type:'statusFx', kind:'en20Soak', tide:'flood', side:'B', attUid:__U['2:0'], attDefId:'bee-knight', targetSide:'B', targetUid:__U['2:0'], targetDefId:'bee-knight', amount:2, total:2})", 1500),
  M('poison-status', "renderVfxForEvent({type:'statusFx', kind:'poison', side:'A', attUid:__U['1:0'], attDefId:'otter-kit', targetSide:'B', targetUid:__U['2:0'], targetDefId:'bee-knight', amount:2})", 1500),
  M('remember-candlestick', "(()=>{ const u = __add(1, 'otter-kit', 2, 9); renderVfxForEvent({type:'remember', side:'A', defId:'otter-kit', spent:1, uid:u}); })()", 2200),
  M('bloom', """(()=>{ const m = matchState, e = m.engine; const p0 = m.players[1], src = e.allBoardCards(p0).find(c=> c.uid === __U['1:-1']);
      const cp = e.makeBoardCard('otter-kit'); cp.wait = 0; cp.hp = cp.maxHp = 10; cp.atk = 1; cp.slot = 2; cp.bloomCopy = true; p0.row.right.push(cp); e.syncSlots(p0); renderMatchUI();
      renderVfxForEvent({type:'bloom', side:'A', uid:src.uid, defId:src.defId, copyUid:cp.uid, atk:0, hp:0, copyAtk:1, copyHp:1, lumber:2, slot:2, row:0});
      renderVfxForEvent({type:'spawn', side:'A', defId:'otter-kit', count:1, cause:'triggerSpawn', kind:'bloom', uids:[cp.uid], lane:'right', nearUid:src.uid}); })()""", 2200),
  M('brood-spawn', "(()=>{ const u = __add(1, 'soldier-ant', 2, 5); renderVfxForEvent({type:'spawn', side:'A', defId:'soldier-ant', count:1, cause:'triggerSpawn', kind:'brood', uids:[u], lane:'right', nearUid:__U['1:1']}); })()", 2000),
  M('spawner-jump', "(()=>{ const u = __add(1, 'soldier-ant', -2, 5); renderVfxForEvent({type:'spawn', side:'A', defId:'soldier-ant', count:1, cause:'onAttackedSpawn', kind:'spawner', uids:[u], lane:'left', nearUid:__U['1:-1']}); })()", 2000),
  M('evolve', "renderVfxForEvent({type:'evolve', side:'A', uid:__U['1:0'], defId:'bee-knight', cardId:'bee-knight', fromDefId:'otter-kit', stage:2, stack:['otter-kit','bee-knight'], atk:6, hp:20, maxHp:20, wait:0, slot:0, boardSide:'center', stem:null})", 2200),
  M('field-wind', "renderVfxForEvent({type:'wind', windy:true, from:'A', round:2})", 2200, 'full'),
  M('field-tide-flood', "renderVfxForEvent({type:'tide', tide:'flood', round:2})", 2200, 'full'),
  M('field-night', "(()=>{ try{ syncNightVeil(matchState, 'night'); }catch(e){ console.warn(e); } renderVfxForEvent({type:'fullMoonRise', side:'A'}); })()", 2200, 'full'),
  M('guardian-rampart', "renderVfxForEvent({type:'rampart', side:'B', attUid:__U['1:0'], targetUid:__U['2:0'], blockerUid:__U['2:-1']})", 1700),
  M('victory-parade', "(()=>{ try{ victoryParade('bottomPlayRow'); }catch(e){ console.warn(e); } })()", 2600, 'full'),
]

async def run(pw, url, w, mode, only):
    b = await pw.chromium.launch(executable_path=V3.CHROME, args=['--no-sandbox'])
    ctxopts = {'reduced_motion': 'reduce'} if mode == 'rm' else {}
    pg = await V5.fresh(b, url, w, '', **ctxopts)
    await pg.evaluate("window.showToast = ()=>{}")
    await pg.evaluate("setFxLevel('" + ('low' if mode == 'low' else 'high') + "')")
    await pg.evaluate(V3.BOARD + BOARD)
    await pg.evaluate(HELP)
    metrics = []; clips = {}
    bf = await pg.query_selector('#battlefieldEl'); bb = await bf.bounding_box()
    vh = 844 if w < 700 else 900
    clips['bf'] = {'x': max(0, bb['x'] - 10), 'y': max(0, bb['y'] - 10), 'width': min(w, bb['width'] + 20), 'height': min(vh - max(0, bb['y'] - 10), bb['height'] + 20)}
    clips['full'] = {'x': 0, 'y': 0, 'width': w, 'height': vh}
    for mo in MOMENTS:
        if only and not re.search(only, mo['name']): continue
        print('..', mo['name'], w, mode, flush=True)
        await pg.evaluate("(()=>{ window.__base = new Set(document.body.children); })()")
        times = [int(mo['dur'] * f) for f in ((0.02, 0.06, 0.1, 0.15, 0.2, 0.26, 0.33, 0.42) if os.environ.get('ANIM1_DENSE') else (0.04, 0.16, 0.32, 0.5, 0.72, 0.95))]
        try:
            fr = await V5.poll(pg, w, mo['name'] + '-' + mode, mo['js'], f"window.__gt() >= {mo['dur'] + mo['tail']}", STATE, want=V5.at_times(times), max_polls=6000, clip=clips[mo['clip']])
        except Exception as ex:
            print('   ERR', ex); metrics.append({'name': mo['name'], 'error': str(ex)[:200]}); continue
        shotsf = [f for f in fr if 'f' in f]
        out = V5.sheet(shotsf, f"anim1-{mo['name']}-{mode}" + ('-dense' if os.environ.get('ANIM1_DENSE') else ''), w, 8 if w > 700 else 6) if shotsf else None
        if out: shutil.copy(out, os.path.join(KEEP, os.path.basename(out).replace('vis5-', '')))
        busy = [f['t'] for f in fr if f['n'] > 0 or f['ga'] > 0]
        last = fr[-1]
        metrics.append({'name': mo['name'], 'busy_first': busy[0] if busy else None, 'busy_last': max(busy) if busy else None, 'leftover_nodes': last['n'], 'leftover_tags': last['tags'], 'leftover_gsap': last['ga'], 'leftover_waapi': last['wa'], 'frames': len(shotsf)})
    errs = pg._errs[:5]
    json.dump({'width': w, 'mode': mode, 'metrics': metrics, 'pageerrors': errs}, open(os.path.join(OUTD, f'metrics-{w}-{mode}.json'), 'w'), indent=1)
    print('page errors:', errs)
    await b.close()

async def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--width', type=int, default=1366); ap.add_argument('--mode', default='high'); ap.add_argument('--only', default='')
    a = ap.parse_args()
    httpd = V3.serve(); url = f'http://127.0.0.1:{httpd.server_address[1]}/index.html'
    async with async_playwright() as pw: await run(pw, url, a.width, a.mode, a.only)
asyncio.run(main())
