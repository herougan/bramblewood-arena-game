#!/usr/bin/env python3
"""Package EN6 (2026-10-24): browser checks and screenshots at 390 and 1366, saved in docs/screens/EN6/.

    python3 tests/e2e/en6_2026_10_24.py            # checks + shots
    python3 tests/e2e/en6_2026_10_24.py --widths 1366

Covers: a hand state turning on (Plenty's lit pip), Arrow – bramble (the card line and the arrow into the enemy bramble), Heat and Frost on
(their pips), a weather state (Storm and Rain), Hibernate asleep (the 🛌 pip, its float, the sleep heal's log line), the trigger editor's
"– bramble" box and its card text, the Seasons field row. Build first. Exits 1 on a failed check.
"""
import argparse, asyncio, http.server, socketserver, threading, functools, os, sys
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'docs', 'screens', 'EN6'); os.makedirs(OUT, exist_ok=True)
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
SKIP = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1');"
        "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying']));")
OWN = ("FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); Object.entries(myDeckCounts).forEach(([id,n])=>{for(let i=0;i<n;i++) unlockCardForPlayer(id,'test');});"
       "saveEnergyState({current:60, lastRegenAt:Date.now()}); try{ refreshEnergyHud(); }catch(e){} try{ skipTriggerLesson(); }catch(e){} try{ localStorage.setItem('bramblewood_res3_level_track_v1', JSON.stringify({granted: 999})); }catch(e){} window.showCoachTip = ()=>{}; window.maybeShowCoachTip = ()=>{};")  # 2026-10-26 (release): RES3's level-reward packs would open over these flows; the test player has had them
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
    f = os.path.join(OUT, f'en6-{name}-{w}.png'); await pg.screenshot(path=f, animations='allow'); shots.append(f); return f

# a fight whose board is exactly the given units (as tests/e2e/en5_2026_10_24.py); the CPU is kept from acting
BOARD = """(async(mine, theirs)=>{ adminModeEnabled = true; try{ skipTriggerLesson(); }catch(e){} try{ localStorage.setItem('bramblewood_res3_level_track_v1', JSON.stringify({granted: 999})); }catch(e){} switchTab('play'); startConquestMatch('m11', '20-7'); await new Promise(r=> setTimeout(r, 2600));
  const m = matchState, e = m.engine; m.resolving = true; const uids = {};
  [1, 2].forEach(pid=>{ const pl = m.players[pid]; pl.row.left = []; pl.row.center = []; pl.row.right = []; });
  const put = (pid, list)=> list.forEach(([id, slot, hp])=>{ const c = e.makeBoardCard(id); c.wait = 0; c.hp = c.maxHp = hp || 9; c.slot = slot;
    const pl = m.players[pid]; (slot === 0 ? pl.row.center : slot < 0 ? pl.row.left : pl.row.right).push(c); uids[pid + ':' + slot] = c.uid; });
  put(1, mine); put(2, theirs); [1, 2].forEach(pid=>{ const pl = m.players[pid]; pl.row.left.sort((a, b)=> b.slot - a.slot); pl.row.right.sort((a, b)=> a.slot - b.slot); });
  m.replayCards = null; renderMatchUI(); await new Promise(r=> setTimeout(r, 900));
  m.replayCards = {}; [1,2].forEach(pid=> ['left','center','right'].forEach(s=> m.players[pid].row[s].forEach(c=> m.replayCards[c.uid] = {uid:c.uid, defId:c.defId, atk:c.atk, hp:c.hp, maxHp:c.maxHp, slot:c.slot, poison:0, bleed:0, gpoison:0, shield:0, en5On:'', hibernating:false})));
  return uids; })"""
BADGES = "(uid=>{ const el = document.querySelector(`.board-card[data-uid=\"${uid}\"]`); return el ? [...el.querySelectorAll('.abadge')].map(b=> (b.className.replace('abadge', '').trim()) + ':' + (b.dataset.en5 || b.textContent.trim())) : null; })"
HQ = "(side=>{ const m = matchState; return m && m.displayHqHp ? m.displayHqHp[side] : (m.players[side === 'A' ? 1 : 2].hq.hp); })"
STATE = "(([uid, id, name, on])=>{ renderVfxForEvent({type:'statusFx', kind:'stateSkill', name, on, side:'A', attUid:uid, attDefId:id, targetUid:uid, targetDefId:id}); })"

async def run(b, url, w):
    print(f'-- width {w}')
    pg = await fresh(b, url, w)
    # ---- a hand state: Plenty on the Seed-cache Squirrel
    u = await pg.evaluate(BOARD + "([['seed-cache-squirrel', 0, 7]], [['bee-knight', 0, 20]])")
    await pg.evaluate(STATE, [u['1:0'], 'seed-cache-squirrel', 'plenty', True])
    await pg.wait_for_timeout(260)
    sb = await pg.evaluate(BADGES + f"({u['1:0']})")
    await shot(pg, 'hand-plenty-on', w)
    ok(any(x == 'en5-state:plenty' for x in (sb or [])), f'Plenty on: the lit 🃏 pip ({sb})')
    log = await pg.evaluate("(()=> (en5LogText({type:'statusFx', kind:'stateSkill', name:'plenty', on:true, targetDefId:'seed-cache-squirrel'}, id=> (getCardDefs()[id]||{}).name) || {}).text)()")
    ok('Plenty is on' in (log or ''), f'the log line ({log})')
    await pg.wait_for_timeout(700)
    # ---- Arrow – bramble: the card line, the arrow into the enemy bramble (the skill's shot and a – bramble action)
    u = await pg.evaluate(BOARD + "([['balloon-archer', 0, 8]], [['bee-knight', 0, 20]])")
    lines = await pg.evaluate("(()=> describeEffects(getCardDefs()['balloon-archer']).join(' | '))()")
    ok('– bramble' in lines and 'shoots the enemy bramble for 2' in lines, f'the card reads "Arrow 2 – bramble" ({lines[:160]})')
    await pg.evaluate("(()=>{ const m = matchState; m.displayHqHp = {A: m.players[1].hq.hp, B: m.players[2].hq.hp}; })()")
    await pg.evaluate("""(()=>{ window.__ar = 0; window.__iv6 = setInterval(()=>{ if(document.querySelector('.en6-bramble-arrow')) window.__ar++; }, 25); })()""")
    await pg.evaluate(f"""(()=>{{ renderVfxForEvent({{type:'arrow', side:'A', defId:'balloon-archer', uid:{u['1:0']}, targetSide:'B', targetUid:null, targetDefId:null, amount:2}});
      renderVfxForEvent({{type:'brambleShot', side:'A', defId:'balloon-archer', uid:{u['1:0']}, targetSide:'B', amount:2, act:'arrow'}}); }})()""")
    await pg.wait_for_timeout(230)
    await shot(pg, 'arrow-bramble', w)
    await pg.wait_for_timeout(700)
    ar = await pg.evaluate("(()=>{ clearInterval(window.__iv6); return {seen: window.__ar, left: document.querySelectorAll('.en6-bramble-arrow').length}; })()")
    ok(ar['seen'] > 0 and ar['left'] == 0, f'the – bramble arrow flies into the enemy bramble and goes ({ar})')
    log = await pg.evaluate("(()=> (en6LogText({type:'brambleShot', defId:'balloon-archer', targetSide:'B', amount:2}, id=> (getCardDefs()[id]||{}).name) || {}).text)()")
    ok('shoots the enemy bramble for 2' in (log or ''), f'the log line ({log})')
    ed = await pg.evaluate("(()=>({box: actionFieldsHTML({on:'onSpawn', do:'arrow', amount:2}, 0).includes('data-t=\"bramble\"'), dmgAll: actionFieldsHTML({on:'onSpawn', do:'damage', amount:2, who:'enemy', sub:'all'}, 0).includes('data-t=\"bramble\"'), txt: triggerPreviewText({on:'onSpawn', do:'arrow', amount:2, bramble:true}), mis: triggerPreviewText({on:'onSpawn', do:'missile', amount:3, bramble:true})}))()")
    ok(ed['box'] and not ed['dmgAll'] and 'Arrow 2 – bramble' in ed['txt'] and 'Missile 3 – bramble' in ed['mis'], f'the trigger editor: the – bramble box (not on Deal damage to all), the card text ({ed})')
    await pg.wait_for_timeout(300)
    # ---- Heat and Frost: their pips
    u = await pg.evaluate(BOARD + "([['cinder-stoker', -1, 11], ['snow-ermine', 1, 4]], [['bee-knight', 0, 20]])")
    await pg.evaluate(STATE, [u['1:-1'], 'cinder-stoker', 'heat', True]); await pg.evaluate(STATE, [u['1:1'], 'snow-ermine', 'frost', True])
    await pg.wait_for_timeout(300)
    h = await pg.evaluate(BADGES + f"({u['1:-1']})"); f = await pg.evaluate(BADGES + f"({u['1:1']})")
    await shot(pg, 'heat-frost', w)
    ok(any(x == 'en5-state:heat' for x in (h or [])) and any(x == 'en5-state:frost' for x in (f or [])), f'Heat and Frost on: their pips ({h}, {f})')
    await pg.wait_for_timeout(700)
    # ---- a weather state: Storm on the Fulmar Spitter, Rain on the Puddle Hopper
    u = await pg.evaluate(BOARD + "([['fulmar-spitter', -1, 3], ['puddle-hopper', 1, 9]], [['bee-knight', 0, 20]])")
    await pg.evaluate(STATE, [u['1:-1'], 'fulmar-spitter', 'storm', True]); await pg.evaluate(STATE, [u['1:1'], 'puddle-hopper', 'rain', True])
    await pg.wait_for_timeout(300)
    s1 = await pg.evaluate(BADGES + f"({u['1:-1']})"); s2 = await pg.evaluate(BADGES + f"({u['1:1']})")
    await shot(pg, 'weather-storm-rain', w)
    ok(any(x == 'en5-state:storm' for x in (s1 or [])) and any(x == 'en5-state:rain' for x in (s2 or [])), f'Storm and Rain on: their pips ({s1}, {s2})')
    await pg.wait_for_timeout(700)
    # ---- Hibernate asleep: the 🛌 pip and the sleep (the asleep badge), its float; the heal's log line
    u = await pg.evaluate(BOARD + "([['polar-bear', 0, 17]], [['bee-knight', 0, 20]])")
    await pg.evaluate(f"""(()=>{{ const m = matchState, c = m.players[1].row.center[0]; c.hibernating = true; c.asleep = 1;
      renderVfxForEvent({{type:'statusFx', kind:'hibernate', on:true, side:'A', attUid:{u['1:0']}, attDefId:'polar-bear', targetSide:'A', targetUid:{u['1:0']}, targetDefId:'polar-bear'}}); }})()""")
    await pg.wait_for_timeout(320)
    hb = await pg.evaluate(BADGES + f"({u['1:0']})")
    await shot(pg, 'hibernate-asleep', w)
    ok(any(x.startswith('en6-hib') for x in (hb or [])), f'Hibernate: the 🛌 pip while it sleeps ({hb})')
    logs = await pg.evaluate("(()=>{ const nm = id=> (getCardDefs()[id]||{}).name; return [en6LogText({type:'statusFx', kind:'hibernate', on:true, targetDefId:'polar-bear'}, nm), en6LogText({type:'heal', cause:'hibernate', targetDefId:'polar-bear', amount:2}, nm), en6LogText({type:'season', season:'winter'}, nm)].map(x=> x && x.text); })()")
    ok('hibernates' in (logs[0] or '') and 'heals 2 in its sleep' in (logs[1] or '') and 'Winter' in (logs[2] or ''), f'the log lines ({logs})')
    await pg.evaluate(f"""(()=>{{ renderVfxForEvent({{type:'statusFx', kind:'hibernate', on:false, side:'A', attUid:{u['1:0']}, attDefId:'polar-bear', targetSide:'A', targetUid:{u['1:0']}, targetDefId:'polar-bear'}}); }})()""")
    await pg.wait_for_timeout(250)
    hb2 = await pg.evaluate(BADGES + f"({u['1:0']})")
    ok(not any(x.startswith('en6-hib') for x in (hb2 or [])), f'awake: the pip goes ({hb2})')
    # ---- the registry and the Seasons field row
    reg = await pg.evaluate("(()=>({keys: ['plenty', 'scarcity', 'foePlenty', 'foeScarcity', 'heat', 'frost', 'rain', 'storm', 'fog', 'salt', 'drought', 'season', 'seasonGrant', 'heatGrant', 'fullHand', 'lean', 'foeFullHand', 'foeLean', 'hibernate', 'arrowBramble', 'fireArrowBramble', 'fireBoltBramble'].filter(k=> PASSIVE_DEFS.some(d=> d.key === k && d.label && d.codexNote)).length, rows: fieldConditionRows({seasons: true}).map(r=> r.key), season: describeEffects({effects:{season:'winter', seasonGrant:{armor:2}}}).join(' | ')}))()")
    ok(reg['keys'] == 22 and 'seasons' in reg['rows'] and 'Winter' in reg['season'] and 'Armor 2' in reg['season'], f'the editor rows with Codex notes, the Seasons field row, the Season line ({reg})')
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
