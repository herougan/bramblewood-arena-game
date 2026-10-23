#!/usr/bin/env python3
"""Package RW5 (2026-10-23, owner notes 19:27 / 19:36): browser checks and screenshots at 390 and 1366.

    python3 tests/e2e/rw5_2026_10_23.py            # checks + shots in tests/out/shots/rw5-*.png (copies in docs/screens/RW5/ with --keep)
    python3 tests/e2e/rw5_2026_10_23.py --widths 1366

Covers: each pack's contents come from its own tier (Hedgerow Pouch Maps 0-6, Tidemire Chest 7-13, Highcrest Case 14-20; 60 packs each) and the
"Open all" summary names its free level-ups (#13); the tutorial's faction rewards (C, C, C then U, C, C, out of the both-sides pool) and the
deck window that shows them (#10); a set faction reward follows the pattern; the speed banner in the next fight after Map 0 is cleared and the
speed kept from the last fight (#18); the admin's 99,999 / 0 buttons (#10); the Raid Ticket's Gold Leaf price and the guild shop (#16);
Collector packs (#14). Build first. Exits 1 on a failed check.
"""
import argparse, asyncio, http.server, socketserver, threading, functools, os, sys, shutil
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'tests', 'out', 'shots'); os.makedirs(OUT, exist_ok=True)
KEEP = os.path.join(ROOT, 'docs', 'screens', 'RW5')
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
SKIP = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); sessionStorage.setItem('bramblewood_seen_splash','1');"
        "localStorage.setItem('bramblewood_pitch_open_v1','1'); localStorage.setItem('bramblewood_arena_faction','otters'); localStorage.setItem('bramblewood_map_revealed_v1','[\"*\"]');"
        "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying']));")
OWN = ("FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); Object.entries(myDeckCounts).forEach(([id,n])=>{for(let i=0;i<n;i++) unlockCardForPlayer(id,'test');});"
       "saveEnergyState({current:20, lastRegenAt:Date.now()}); try{ refreshEnergyHud(); }catch(e){} window.showCoachTip = ()=>{}; window.maybeShowCoachTip = ()=>{}; window.playDialogue = ()=>{};")
fails = []; shots = []

def ok(cond, msg):
    print(('  ok  ' if cond else '  FAIL ') + msg)
    if not cond: fails.append(msg)

def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    httpd = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT))
    threading.Thread(target=httpd.serve_forever, daemon=True).start(); return httpd

async def fresh(b, url, w, pre=''):
    pg = await b.new_page(viewport={'width': w, 'height': 844 if w < 700 else 860}, has_touch=(w < 700))
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg._errs = errs
    await pg.add_init_script(SKIP + pre)
    await pg.goto(url); await pg.wait_for_timeout(1300)
    await pg.evaluate("(()=>{ " + OWN + " })()")
    return pg

async def shot(pg, name, w):
    f = os.path.join(OUT, f'rw5-{name}-{w}.png'); await pg.screenshot(path=f, animations='allow'); shots.append(f); return f

PACK_TIERS = """(()=>{ const defs = getCardDefs(), out = {};
  ['bronze','silver','gold'].forEach(id=>{ const p = getShopPacks().find(x=> x.id === id), bad = [], seen = new Set();
    for(let i = 0; i < 60; i++) rollPackCards(p).forEach(cid=>{ seen.add(cid); const s = cardSourceOf(defs[cid]); if(!(s.kind === 'pack' && +s.tier === p.pool)) bad.push(cid); });
    out[id] = {pool: p.pool, bad: bad.slice(0, 5), n: seen.size, poolSize: packCardPool(defs, p.pool).length, lava: [...seen].filter(cid=> /(^|-)(cinder|ember|ash|ashen|obsidian|pall|fumarole|magma|lava)(-|$)/.test(cid))}; });
  return out; })()"""

OPEN_ALL = """(async(id)=>{ myCurrencies.gold = 99999; myCurrencies.gems = 9999; saveCurrencies(); const p = getShopPacks().find(x=> x.id === id); const opened = [];
  for(let i = 0; i < 10; i++){ const o = purchasePackOnce(p, true); if(o) opened.push(o); }
  openPackAnimation(p, opened, {bundle: 10}); await new Promise(r=> setTimeout(r, 900));
  const b = document.querySelector('#poOpenAll'); if(b) b.click(); await new Promise(r=> setTimeout(r, 1600));
  const lv = document.querySelector('.rw5-pack-levels'); return {levels: opened.filter(o=> o.leveledId).length, line: lv ? lv.textContent : null, title: lv ? lv.getAttribute('title') : null}; })"""

async def run(b, url, w):
    print(f'-- width {w}')
    # 15. packs by tier
    pg = await fresh(b, url, w)
    r = await pg.evaluate(PACK_TIERS)
    for id, x in r.items():
        ok(not x['bad'], f"15. 60 {id} packs: every card from pool {x['pool']} ({x['n']} different of {x['poolSize']}) {x['bad']}")
    ok(not r['bronze']['lava'], f"15. no volcanic card out of the Hedgerow Pouch {r['bronze']['lava']}")
    ok(r['bronze']['poolSize'] and r['silver']['poolSize'] and r['gold']['poolSize'] and len({r['bronze']['poolSize'], r['silver']['poolSize'], r['gold']['poolSize']}) == 3, '15. three different pools')
    # 13. the bundle summary names its free level-ups (the Highcrest Case levels a card 80% of the time)
    s = await pg.evaluate(OPEN_ALL + "('gold')")
    ok(s['levels'] == 0 or (s['line'] and ('→' in s['line'])), f"13. Open all: '{(s['line'] or '')[:90]}' ({s['levels']} level-ups)")
    ok(not s['line'] or 'level' in (s['title'] or '').lower(), '13. its tooltip says where they come from')
    await shot(pg, 'pack3-all', w)
    await pg.evaluate("(()=>{ const ov = document.getElementById('packOpenOverlay'); if(ov){ ov.hidden = true; ov.innerHTML = ''; } })()")
    s = await pg.evaluate(OPEN_ALL + "('bronze')")
    await shot(pg, 'pack1-all', w)
    await pg.evaluate("(()=>{ const ov = document.getElementById('packOpenOverlay'); if(ov){ ov.hidden = true; ov.innerHTML = ''; } })()")
    # 14 / 16 / 15: the shop: Collector packs, the shop line, the Raid Ticket's price, no Rename Ticket without a guild
    r = await pg.evaluate("""(()=>{ adminModeEnabled = false; localStorage.removeItem('bramblewood_guild_owner_v1'); const adv = getShopPacks().filter(p=> PACK_SALE_MAP[p.id]).map(advancedPackOf);
      myCurrencies.gold = 500; myCurrencies.gems = 2; saveCurrencies(); switchTab('shop'); renderShop();
      return {adv: adv.map(p=> p.name), ticket: shopTicketOnShelf(), owner: ownsGuild(), cost: RAID_TICKET_ITEM_COST, sub: (document.querySelector('#view-shop .panel-sub') || {}).textContent || '', afford: raidTicketAffordable()}; })()""")
    ok(all(n.startswith('Collector ') for n in r['adv']), f"14. Collector packs: {r['adv']}")
    ok(not r['ticket'] and not r['owner'], '16. no guild: the Rename Ticket is not on the Shop shelf')
    ok(r['cost']['gold'] > 300 and r['cost']['gems'] > 0 and not r['afford'], f"16. the Raid Ticket costs {r['cost']} (2 Gold Leaves are not enough)")
    await pg.wait_for_timeout(500); await shot(pg, 'shop', w)
    ok(not pg._errs, f'shop and packs: no page errors {pg._errs[:2]}')
    await pg.close()

    # 10. the tutorial's faction rewards, the deck window, a set reward
    pg = await fresh(b, url, w, "localStorage.removeItem('bramblewood_arena_tutorial_done'); localStorage.removeItem('bramblewood_tutorial2_done_v1'); localStorage.removeItem('bramblewood_faction_pool_v2'); localStorage.removeItem('bramblewood_tut_faction_rewards_v1');")
    r = await pg.evaluate("""(()=>{ const defs = getCardDefs(), a = tutorialRewardIds(true), b = tutorialRewards2('otters', true), st = loadFactionPool();
      const side = id=> factionSideOf(defs[id]); const rk = id=> factionRarityKey(defs[id].rarity);
      return {a, b, ra: a.map(rk), rb: b.map(rk), sides: a.concat(b).map(side), again: tutorialRewardIds(), poolIds: Object.keys(st.left).length, other: Object.keys(st.left).filter(id=> factionSideOf(defs[id]) === 'other').length,
        base: Object.keys(st.left).filter(id=> factionSideOf(defs[id]) === 'base'), copies: (()=>{ const c = Object.keys(st.left).find(id=> rk(id) === 'common' && factionSideOf(defs[id]) !== 'base'); return c ? [c, st.left[c] + (st.given && st.given[c] || 0)] : null; })(), step: st.patternStep}; })()""")
    ok(len(r['a']) == 3 and r['ra'] == ['common'] * 3, f"10. Part 1 pays 3 faction rewards, Commons: {r['a']}")
    ok(len(r['b']) == 3 and r['rb'][0] == 'uncommon' and r['rb'][1:] == ['common', 'common'], f"10. Part 2 pays 3 more: U, C, C {r['rb']} {r['b']}")
    ok(r['again'] == r['a'], '10. the same cards on a second look (no second draw)')
    ok(r['other'] > 0 and len(r['base']) >= 3, f"10. the pool holds the other side ({r['other']}) and 1 of each Base card ({r['base']})")
    ok(r['copies'] and r['copies'][1] == 5, f"11. a Common's copies in the pool = the deck cap (5) {r['copies']}")
    ok(r['step'] == 6, f"10. the pattern moved 6 steps ({r['step']})")
    await pg.evaluate("(()=>{ openDeckTopUpStep(tutorialRewards2('otters', true), ()=>{}); })()"); await pg.wait_for_timeout(1500)
    await shot(pg, 'tutorial-faction-rewards', w)
    r = await pg.evaluate("""(()=>{ document.querySelectorAll('.tut-reward-overlay, .tr-overlay').forEach(e=> e.remove()); const defs = getCardDefs(), got = [];
      for(let i = 0; i < 4; i++){ const id = factionReward(); got.push(id ? factionRarityKey(defs[id].rarity) : null); } return got; })()""")
    ok(r == ['uncommon', 'common', 'uncommon', 'common'], f"10. the next set rewards follow the pattern (steps 7-10: U, C, U, and the R skipped before Map 14 gives the next C): {r}")
    ok(not pg._errs, f'10. no page errors {pg._errs[:2]}')
    await pg.close()

    # 18. 2x after Map 0, the banner in the next fight, the speed kept
    pg = await fresh(b, url, w, "localStorage.removeItem('bramblewood_speed_announced_v1'); localStorage.setItem('bramblewood_speed_keep_v1', '2');")
    r = await pg.evaluate("""(async()=>{ adminModeEnabled = false; const m = CONQUEST_MAPS.find(x=> x.id === 'm1'), p = loadConquestProgress();
      m.nodes.filter(n=> n.kind !== 'tutorial').forEach(n=>{ const id = conquestNodeId('m1', n.key); if(!p.completed.includes(id)) p.completed.push(id); }); saveConquestProgress(p);
      const steps = speedSteps(); conquestSelectedMap = 'mf'; playSubTab = 'conquest'; switchTab('play'); startConquestMatch('mf', '1-1', {skipEnergyCost:true, noOpener:true});
      await new Promise(r=> setTimeout(r, 1400)); const bn = document.querySelector('.rw5-speed-banner');
      return {steps, banner: bn ? bn.textContent : null, speed: matchState && matchState.speedMult}; })()""")
    ok(2 in r['steps'] and 3 not in r['steps'], f"18. Map 0 cleared: 2x is in the cycle, 3x is not {r['steps']}")
    ok(r['banner'] and '2× unlocked!' in r['banner'], f"18. the fight says it: {r['banner']!r}")
    ok(r['speed'] == 2, f"18. the speed picked last time is kept ({r['speed']}x)")
    await shot(pg, 'speed-banner', w)
    ok(not pg._errs, f'18. no page errors {pg._errs[:2]}')
    await pg.close()

    # 10. the admin's resource buttons; 16. the guild shop
    pg = await fresh(b, url, w)
    r = await pg.evaluate("""(async()=>{ switchTab('admin'); renderAdmin(); await new Promise(r=> setTimeout(r, 300)); document.getElementById('adminResMax').click(); await new Promise(r=> setTimeout(r, 300));
      const hi = Object.keys(CURRENCY_META).map(k=> myCurrencies[k]); const mat = MATERIA_KINDS.map(k=> materiaStore()[k.id]); const tickets = myCurrencies.raidPoints;
      const box = document.getElementById('adminResMax').closest('.admin-subpanel'); box.scrollIntoView({block:'center'}); document.querySelectorAll('.toast-host').forEach(e=> e.innerHTML = '');
      return {hi, mat, tickets, label: document.getElementById('adminResMax').textContent}; })()""")
    ok(all(v == 99999 for v in r['hi']) and all(v == 99999 for v in r['mat']), f"10. 99,999 of every currency and Materia ({r['label']})")
    await shot(pg, 'admin-resources', w)
    r = await pg.evaluate("""(async()=>{ document.getElementById('adminResZero').click(); await new Promise(r=> setTimeout(r, 300)); return {lo: Object.keys(CURRENCY_META).map(k=> myCurrencies[k]), mat: MATERIA_KINDS.map(k=> materiaStore()[k.id])}; })()""")
    ok(all(v == 0 for v in r['lo']) and all(v == 0 for v in r['mat']), '10. and back to 0')
    r = await pg.evaluate("""(async()=>{ myCurrencies.gold = 1000; saveCurrencies(); window.isSignedIn = ()=> true; cloudUserId = 'me-test'; guildDataLoaded = true; guildLoadError = false;
      myGuild = {id:'g1', name:'Bramble Pact', tag:'BRP', icon:'🛡️', created_by:'me-test', created_at:'2026-10-30T00:00:00Z'}; myGuildMembers = [{profile_id:'me-test', role:'owner', profiles:{display_name:'Me', rating:1200}}];
      window.loadGuildSkills = async ()=>{}; switchTab('guild'); renderGuild(); await new Promise(r=> setTimeout(r, 400)); const p = document.getElementById('guildShopPanel'); if(p) p.scrollIntoView({block:'center'});
      document.querySelectorAll('.toast-host').forEach(e=> e.innerHTML = ''); return {panel: !!p}; })()""")
    await pg.wait_for_timeout(300); await shot(pg, 'guild-shop', w)
    r = await pg.evaluate("""(async()=>{ const p = document.getElementById('guildShopPanel');
      const before = renameTickets(); const bt = document.getElementById('guildShopBuyTicket'); if(bt) bt.click(); await new Promise(r=> setTimeout(r, 300));
      return {panel: !!p, buy: !!bt, tickets: renameTickets() - before, onShelf: shopTicketOnShelf(), owner: ownsGuild()}; })()""")
    ok(r['panel'] and r['buy'] and r['tickets'] == 1, f"16. the guild page's shop sells the Rename Ticket to the owner {r}")
    ok(r['owner'] and r['onShelf'], '16. an owner sees it on the Shop shelf too')
    ok(not pg._errs, f'admin and guild: no page errors {pg._errs[:2]}')
    await pg.close()

async def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--widths', default='390,1366'); ap.add_argument('--keep', action='store_true'); a = ap.parse_args()
    httpd = serve(); url = f'http://127.0.0.1:{httpd.server_address[1]}/index.html'
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME if os.path.exists(CHROME) else None)
        for w in [int(x) for x in a.widths.split(',')]: await run(b, url, w)
        await b.close()
    httpd.shutdown()
    if a.keep:
        os.makedirs(KEEP, exist_ok=True)
        for f in shots: shutil.copy(f, os.path.join(KEEP, os.path.basename(f)))
    print(f"rw5 e2e: {len(fails)} failed; shots: {', '.join(os.path.relpath(f, ROOT) for f in shots)}")
    sys.exit(1 if fails else 0)

asyncio.run(main())
