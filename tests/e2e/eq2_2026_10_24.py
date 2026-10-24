#!/usr/bin/env python3
"""Package EQ2 (2026-10-24): browser checks and screenshots at 390 and 1366, saved in docs/screens/EQ2/.

    python3 tests/e2e/eq2_2026_10_24.py            # checks + shots
    python3 tests/e2e/eq2_2026_10_24.py --widths 1366

Covers: a carried piece's durability pips (and a pip lost to a hit, the worn red pips), its break (the shatter, the stats coming off), a Dive
(the swoop on the weakest unit, played by the real engine), the Health bar's bonus (gold) and temporary (pale blue) Health from Bolster, a
Parasite (held: the enemy units in reach light up; hooked on by a tap through the real play path; its badge; a feed), and the Goliath's Beak
Strike in a raid, intercepted by a Barnacle Bulwark behind the target. Build first. Exits 1 on a failed check.
"""
import argparse, asyncio, http.server, socketserver, threading, functools, os, sys
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'docs', 'screens', 'EQ2'); os.makedirs(OUT, exist_ok=True)
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
SKIP = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1');"
        "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying']));")
OWN = ("try{ skipTriggerLesson(); }catch(e){} FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); Object.entries(myDeckCounts).forEach(([id,n])=>{for(let i=0;i<n;i++) unlockCardForPlayer(id,'test');});"
       "saveEnergyState({current:60, lastRegenAt:Date.now()}); try{ refreshEnergyHud(); }catch(e){} myCurrencies.energy = 60; window.showCoachTip = ()=>{}; window.maybeShowCoachTip = ()=>{};")
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
    f = os.path.join(OUT, f'eq2-{name}-{w}.png'); await pg.screenshot(path=f, animations='allow'); shots.append(f); return f

# a fight whose board is exactly the given units [id, slot, hp, extra fields]; the CPU is kept from acting (m.resolving) until a step needs play
BOARD = """(async(mine, theirs)=>{ adminModeEnabled = true; switchTab('play'); startConquestMatch('m11', '20-7'); await new Promise(r=> setTimeout(r, 2600)); try{ skipTriggerLesson(); }catch(e){}
  document.querySelectorAll('.coach-bubble, .coach-tip, .npc-bubble, .coach-callout').forEach(e=> e.remove());
  const m = matchState, e = m.engine; m.resolving = true; const uids = {};
  [1, 2].forEach(pid=>{ const pl = m.players[pid]; pl.row.left = []; pl.row.center = []; pl.row.right = []; });
  const put = (pid, list)=> list.forEach(([id, slot, hp, extra])=>{ const c = e.makeBoardCard(id); c.wait = 0; if(hp){ c.hp = c.maxHp = hp; c.baseHp = hp; } c.slot = slot; Object.assign(c, extra || {});
    const pl = m.players[pid]; (slot === 0 ? pl.row.center : slot < 0 ? pl.row.left : pl.row.right).push(c); uids[pid + ':' + slot] = c.uid; });
  put(1, mine); put(2, theirs); [1, 2].forEach(pid=>{ const pl = m.players[pid]; pl.row.left.sort((a, b)=> b.slot - a.slot); pl.row.right.sort((a, b)=> a.slot - b.slot); e.syncSlots(pl); });
  m.replayCards = null; renderMatchUI(); await new Promise(r=> setTimeout(r, 900));
  return uids; })"""
SNAP = """(()=>{ const m = matchState; m.replayCards = {}; [1,2].forEach(pid=> ['left','center','right'].forEach(s=> m.players[pid].row[s].forEach(c=> m.replayCards[c.uid] = Object.assign({uid:c.uid, defId:c.defId, atk:c.atk, hp:c.hp, maxHp:c.maxHp, slot:c.slot, poison:0, bleed:0, gpoison:0, shield:0, en5On:''}, eq2Snap(c))))); return 1; })()"""
MARKS = "(uid=>{ const el = document.querySelector(`.board-card[data-uid=\"${uid}\"]`); if(!el) return null; const u = el.querySelector('.eq-under'), bar = el.querySelector('.eq2-hpbar'), p = el.querySelector('.eq2-para');" \
        " const w = s=> { const x = bar && bar.querySelector(s); return x ? parseFloat(x.style.width) : 0; };" \
        " return {pips: u ? u.querySelectorAll('.eq2-pip').length : 0, lit: u ? u.querySelectorAll('.eq2-pip.on').length : 0, worn: !!(u && u.classList.contains('is-worn')), bar: !!bar, base: w('.eq2-hb-base'), bonus: w('.eq2-hb-bonus'), temp: w('.eq2-hb-temp'), para: p ? p.textContent.trim() : null, hp: (el.querySelector('.stats .hp') || {}).textContent}; })"

async def run(b, url, w):
    print(f'-- width {w}')
    pg = await fresh(b, url, w)
    # ---- durability: a Common Bark Buckler (3) on an otter; one hit takes a pip; the last one breaks it
    u = await pg.evaluate(BOARD + "([['otter-guard', 0, 12, {equipment:'bark-buckler', equipOn:true, equipDur:3}]], [['bee-knight', 0, 20]])")
    await pg.evaluate(SNAP)
    m0 = await pg.evaluate(MARKS + f"({u['1:0']})")
    ok(m0 and m0['pips'] == 3 and m0['lit'] == 3, f'the piece under the unit shows 3 durability pips, all lit ({m0})')
    await pg.evaluate(f"(()=>{{ renderVfxForEvent({{type:'equipWear', side:'A', uid:{u['1:0']}, defId:'otter-guard', equipDefId:'bark-buckler', dur:2, max:3, n:1, why:'hit'}}); renderVfxForEvent({{type:'equipWear', side:'A', uid:{u['1:0']}, defId:'otter-guard', equipDefId:'bark-buckler', dur:1, max:3, n:1, why:'hit'}}); }})()")
    await pg.wait_for_timeout(450)
    m1 = await pg.evaluate(MARKS + f"({u['1:0']})")
    await shot(pg, 'durability-pips', w)
    ok(m1 and m1['pips'] == 3 and m1['lit'] == 1 and m1['worn'], f'two hits: one pip left, the last pip red ({m1})')
    await pg.evaluate(f"(()=>{{ const c = matchState.replayCards[{u['1:0']}]; renderVfxForEvent({{type:'equipBreak', side:'A', uid:{u['1:0']}, defId:'otter-guard', equipDefId:'bark-buckler', why:'hit', atk:c.atk, hp:9, maxHp:9}}); }})()")
    await pg.wait_for_timeout(260)
    sh = await pg.evaluate("(()=> document.querySelectorAll('.eq2-shatter i').length)()")
    await shot(pg, 'durability-break', w)
    await pg.wait_for_timeout(800)
    m2 = await pg.evaluate(MARKS + f"({u['1:0']})")
    log = await pg.evaluate("(()=> (eq2LogText({type:'equipBreak', defId:'otter-guard', equipDefId:'bark-buckler'}, id=> (getCardDefs()[id]||{}).name) || {}).text)()")
    ok(sh >= 5 and m2 and m2['pips'] == 0 and '9' in (m2['hp'] or ''), f'the break: the piece shatters off ({sh} shards), no piece left, Health 9 ({m2})')
    ok('Bark Buckler breaks' in (log or ''), f'the log line ({log})')
    # ---- a real round: Dive (the engine) on the weakest unit, the swoop
    # no card carries Dive yet: give the bat Dive 2 as a live card edit (liveCards, as the editor's cloud edits arrive) before the fight starts
    await pg.evaluate("(()=>{ const d = getCardDefs()['barrow-leech-bat']; liveCards['barrow-leech-bat'] = Object.assign({}, d, {effects: Object.assign({}, d.effects, {dive: 2})}); _cardDefsCache = null; return 1; })()")
    u = await pg.evaluate(BOARD + "([['barrow-leech-bat', 0, 30]], [['bee-knight', 0, 30], ['honey-bee', 1, 4]])")
    dv = await pg.evaluate(f"""(async()=>{{ const m = matchState, e = m.engine;
      const ev = []; m.resolving = true; e.resolveCombat(m.players, m.sideOf || (id=> id===1?'A':'B'), m.stats || {{}}, ev, 1); const dive = ev.find(x=> x.type === 'dive');
      if(dive){{ const el = boardCardEl(dive.attUid); renderVfxForEvent(dive); }}
      return dive ? {{target: dive.targetDefId, bonus: dive.bonus, cls: !!document.querySelector('.board-card.eq2-diving')}} : null; }})()""")
    await pg.wait_for_timeout(260)
    await shot(pg, 'dive', w)
    ok(dv and dv['target'] == 'honey-bee' and dv['bonus'] == 2 and dv['cls'], f'Dive 2 (the real engine): the bat dives past the knight onto the weakest unit, the swoop plays ({dv})')
    await pg.wait_for_timeout(700)
    # ---- the Health bar: printed Health green, bonus gold, Bolster's temporary pale blue
    u = await pg.evaluate(BOARD + "([['otter-guard', 0, 9, {maxHp:13, hp:12, tempHpR:3}], ['otter-paddler', 1, 8]], [['bee-knight', 0, 20]])")
    await pg.evaluate(SNAP)
    hb = await pg.evaluate(MARKS + f"({u['1:0']})")
    plain = await pg.evaluate(MARKS + f"({u['1:1']})")
    await pg.evaluate(f"(()=>{{ renderVfxForEvent({{type:'tempSoak', uid:{u['1:0']}, defId:'otter-guard', soaked:1, left:2}}); }})()")
    await pg.wait_for_timeout(400)
    hb2 = await pg.evaluate(MARKS + f"({u['1:0']})")
    await shot(pg, 'temp-hp-bar', w)
    ok(hb and hb['bar'] and hb['base'] > 40 and hb['bonus'] > 10 and hb['temp'] > 10, f'the bar: green (printed 9), gold (3 bonus), pale blue (3 temporary) ({hb})')
    ok(plain and not plain['bar'], 'a unit with neither has no bar')
    ok(hb2 and hb2['temp'] < hb['temp'], f'a soaked hit shrinks the pale blue end ({hb["temp"]} -> {hb2["temp"]})')
    # ---- Parasite: held, the enemy units in reach light up; tapped on, it hooks on; the badge; a feed
    u = await pg.evaluate(BOARD + "([['otter-guard', 0, 20]], [['bee-knight', 0, 20], ['bee-drone', 1, 12], ['honey-bee', 3, 8]])")
    pu = await pg.evaluate("""(()=>{ const m = matchState, pl = m.players[1]; const uid = 990001; pl.hand.unshift({uid, defId:'clinging-leech'}); pl.lumber = 9; pl.playedThisTurn = false; m.resolving = false;
      renderMatchUI(); m.selectedUid = uid; document.body.click(); return uid; })()""")
    await pg.wait_for_timeout(500)
    lit = await pg.evaluate("(()=> ({holding: document.body.classList.contains('eq2-para-holding'), ok: [...document.querySelectorAll('.eq2-para-drop.is-ok')].map(x=> +x.dataset.parauid)}))()")
    await shot(pg, 'parasite-held', w)
    ok(lit['holding'] and set(lit['ok']) == {u['2:0'], u['2:1']}, f'held: the two enemy units in reach light up, not the one 3 columns off ({lit})')
    await pg.evaluate(f"(()=>{{ const t = document.querySelector('.eq2-para-drop[data-parauid=\"{u['2:0']}\"]'); t.click(); }})()")
    await pg.wait_for_timeout(4500)  # the turn commits and its round plays back (the leech waits its Wait 1 first)
    host = await pg.evaluate(f"(()=>{{ const m = matchState, c = m.players[2].row.center.find(x=> x.uid === {u['2:0']}); return c && c.parasite ? {{defId: c.parasite.defId, hand: m.players[1].hand.some(h=> h.uid === {pu})}} : null; }})()")
    pm = await pg.evaluate(MARKS + f"({u['2:0']})")
    ok(host and host['defId'] == 'clinging-leech' and not host['hand'] and pm and pm['para'], f'tapped on: the leech hooks onto the knight (its badge: {pm and pm["para"]}; {host})')
    await pg.evaluate(SNAP)
    await pg.evaluate(f"(()=>{{ const p = matchState.replayCards[{u['2:0']}].parasite; renderVfxForEvent({{type:'parasiteDrain', side:'A', uid:p.uid, defId:'clinging-leech', targetSide:'B', targetUid:{u['2:0']}, targetDefId:'bee-knight', dmg:p.atk, healed:0, hp:p.hp}}); }})()")
    await pg.wait_for_timeout(300)
    await shot(pg, 'parasite-feed', w)
    await pg.wait_for_timeout(700)
    # ---- the raid: the Beak Strike aims at the unit with the most Attack; the Barnacle Bulwark behind it steps in
    await pg.evaluate("(()=>{ matchState = null; playSubTab='raid'; switchTab('play'); })()")
    await pg.wait_for_timeout(800)
    for js in ["document.querySelector('.raid-hub [data-raid-open]').click()", "document.querySelector('[data-raid-part=left]').click()"]:
        try: await pg.evaluate(js)
        except Exception as e: print('   (raid open:', e, ')')
        await pg.wait_for_timeout(800)
    await pg.evaluate("(()=>{ const v = document.querySelector('.vs-screen'); if(v) v.click(); return 1; })()"); await pg.wait_for_timeout(5000)
    await pg.evaluate("document.querySelectorAll('.coach-bubble, .coach-tip, .npc-bubble, .coach-callout').forEach(e=> e.remove()); 1")
    rs = await pg.evaluate("""(async()=>{ const m = matchState; if(!m || !m.raidFull) return {raid: false}; const e = m.engine, pl = m.players[1]; m.resolving = true;
      pl.row.left = []; pl.row.center = []; pl.row.right = []; (pl.reserve || []).forEach(r=> Object.keys(r).forEach(k=> delete r[k]));
      const big = e.makeBoardCard('otter-centurion'); big.wait = 0; big.slot = 0; big.atk = 9; pl.row.center.push(big); e.syncSlots(pl);
      const g = e.fillReserve(pl, 1, 0, 'barnacle-bulwark'); if(g) g.wait = 0;
      m.replayCards = null; renderMatchUI(); await new Promise(r=> setTimeout(r, 900));
      const hp0 = g ? g.hp : null, ev = []; const keep = m.raidAttacks; m.raidAttacks = [{id:'beak', name:'Beak Strike', pattern:'single', dmg:3, every:1}]; raidSpecials(m, ev); m.raidAttacks = keep;
      const s = ev.find(x=> x.type === 'raidStrike'); ev.forEach(x=>{ try{ pushLog(x); }catch(err){} renderVfxForEvent(x); });
      return {raid: true, guard: s && s.guard, by: s && s.defId, aim: s && s.aimDefId, hp0, hp1: g ? g.hp : null, big: big.hp, bigMax: big.maxHp, guarded: !!g}; })()""")
    await pg.wait_for_timeout(420)
    await shot(pg, 'raid-guardian-intercept', w)
    ok(rs and rs.get('raid') and rs.get('guard') and rs.get('by') == 'barnacle-bulwark' and rs.get('aim') == 'otter-centurion' and rs['hp1'] == rs['hp0'] - 3 and rs['big'] == rs['bigMax'],
       f'the Beak Strike aims at the centurion; the Barnacle Bulwark behind it takes the 3 ({rs})')
    await pg.wait_for_timeout(900)
    await shot(pg, 'raid-guardian-after', w)
    ed = await pg.evaluate("(()=>({keys: ['dive', 'bolster', 'parasite'].filter(k=> PASSIVE_DEFS.some(d=> d.key === k && d.label && d.codexNote)), line: raidBrambleAbilityLines([{name:'Beak Strike', pattern:'single', dmg:3, every:2}])[0]}))()")
    ok(len(ed['keys']) == 3 and 'Guardian' in (ed['line'] or ''), f'the skills are in the editor / Codex list, and the bramble lists the Beak Strike ({ed})')
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
