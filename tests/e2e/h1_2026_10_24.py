#!/usr/bin/env python3
"""Package H1 (2026-10-24, owner decision H1: Materia gem sockets on Unique and rarer cards, one per copy, costs to set and to take out):
browser checks and screenshots at 390 and 1366.

    python3 tests/e2e/h1_2026_10_24.py            # checks + shots in tests/out/shots/h1-*.png (copies in docs/screens/H1/ with --keep)
    python3 tests/e2e/h1_2026_10_24.py --widths 1366

Covers: the Forge's 💎 Socket tab lists only cards with a socket; an empty socket on the anvil (the hollow slot on the card); setting a gem
(one crystal and the apply cost spent, the slot filled, the toast); the filled socket refuses another gem; taking it out (the remove cost,
the crystal back); the second copy keeps its own empty socket (copy picker); the card detail's socket line; a Rare card has no slot; the
socket survives a reload (localStorage). No fights. Build first. Exits 1 on a failed check.
"""
import argparse, asyncio, http.server, socketserver, threading, functools, os, sys, shutil
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'tests', 'out', 'shots'); os.makedirs(OUT, exist_ok=True)
KEEP = os.path.join(ROOT, 'docs', 'screens', 'H1')
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
SKIP = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); sessionStorage.setItem('bramblewood_seen_splash','1');"
        "localStorage.setItem('bramblewood_pitch_open_v1','1'); localStorage.setItem('bramblewood_arena_faction','otters'); localStorage.setItem('bramblewood_map_revealed_v1','[\"*\"]');"
        "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying']));")
OWN = ("FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); try{ setDialogueFlag('seen:forge_cobble_intro', true); }catch(e){}"
       "window.showCoachTip = ()=>{}; window.maybeShowCoachTip = ()=>{}; window.playDialogue = ()=>{};")
fails = []; shots = []

def ok(cond, msg):
    print(('  ok  ' if cond else '  FAIL ') + msg)
    if not cond: fails.append(msg)

def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    httpd = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT))
    threading.Thread(target=httpd.serve_forever, daemon=True).start(); return httpd

async def shot(pg, name, w):
    f = os.path.join(OUT, f'h1-{name}-{w}.png'); await pg.screenshot(path=f, animations='allow'); shots.append(f); return f

# A Unique (or Legendary) creature that a player can own (two copies), a Rare one, crystals and a full wallet.
SETUP = """(()=>{ const defs = getCardDefs();
  const pick = rs=> Object.keys(defs).find(id=> { const d = defs[id]; return rs.includes(d.rarity) && d.attack != null && d.health != null && !d.token && !d.hero && !d.derivedFrom && !d.cardType && !d.field && !d.hidden && cardHasSocket(d) === !rs.includes('rare'); });
  const u = pick(['unique', 'legendary']), r = pick(['rare']); if(!u || !r) return {u, r};
  unlockCardForPlayer(u, 'test'); unlockCardForPlayer(u, 'test'); unlockCardForPlayer(r, 'test');
  const st = materiaStore(); st.ember = 3; st.grove = 2; st.tide = 1; st.stone = 0; saveMateria();
  myCurrencies.dust = 50000; myCurrencies.gold = 50000; saveCurrencies(); invalidateCardDefs();
  return {u, r, copies: (myCardCopies[u]||[]).length, uids: (myCardCopies[u]||[]).map(c=> c.uid)}; })()"""

OPEN_FORGE = """((id)=>{ document.querySelectorAll('.toast-host').forEach(e=> e.innerHTML = ''); codexSubTab = 'forge'; forgeMode = 'enchant'; forgeSelectedId = id; forgeCopyPick = {id:null, uid:null}; forgeFilter = 'all'; forgeSearch = ''; switchTab('codex'); return 1; })"""

async def run(b, url, w):
    print(f'-- width {w}')
    pg = await b.new_page(viewport={'width': w, 'height': 844 if w < 700 else 860}, has_touch=(w < 700))
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.add_init_script(SKIP)
    await pg.goto(url); await pg.wait_for_timeout(1500)
    await pg.evaluate("(()=>{ " + OWN + " })()")
    s = await pg.evaluate(SETUP)
    ok(bool(s.get('u')) and bool(s.get('r')), f"setup: a Unique or Legendary card ({s.get('u')}) and a Rare card ({s.get('r')})")
    if not s.get('u'): await pg.close(); return
    u, r = s['u'], s['r']
    ok(s['copies'] >= 2, f"setup: two copies of {u} ({s['copies']})")
    await pg.evaluate(OPEN_FORGE + f"('{u}')"); await pg.wait_for_timeout(900)
    await pg.evaluate("document.querySelectorAll('.ux-fcs-ov').forEach(x=> x.remove())")  # the copies sheet may open on its own; close it for the shot
    st = await pg.evaluate(f"""(()=>{{ const pool = [...document.querySelectorAll('#forgePool .card-tile')].map(t=> t.getAttribute('data-defid'));
      const tab = document.querySelector('[data-forgemode="enchant"]'); const stt = document.querySelector('[data-h1-socket]');
      return {{pool, tab: tab ? tab.textContent.trim() : null, state: stt ? stt.dataset.h1Socket : null, slot: !!document.querySelector('#forgeDetail .h1-slot.is-empty'),
        btns: document.querySelectorAll('#forgeDetail [data-enchant]').length, cost: (document.querySelector('.h1-cost-line')||{{}}).textContent || '', picker: !!document.querySelector('#forgeDetail .ux-fcp-open')}}; }})()""")
    ok(st['tab'] and 'Socket' in st['tab'], f"the Forge tab reads 💎 Socket ({st['tab']})")
    ok(u in st['pool'] and r not in st['pool'] and len(st['pool']) > 0, f"the Socket tab lists cards with a socket only ({len(st['pool'])} cards; {r} absent)")
    ok(st['state'] == 'empty' and st['slot'] and st['btns'] == 4, f"empty socket on the anvil, hollow slot on the card, four gem buttons {st}")
    ok('Setting a gem costs' in st['cost'], f"the apply cost line ({st['cost'].strip()[:60]})")
    ok(st['picker'], 'the copy picker is on the anvil (two copies)')
    await pg.evaluate("document.querySelector('#forgeDetail').scrollIntoView({block:'start'})"); await pg.wait_for_timeout(200)
    await shot(pg, 'forge-empty', w)

    before = await pg.evaluate("({dust: myCurrencies.dust, gold: myCurrencies.gold, ember: materiaStore().ember})")
    await pg.click('#forgeDetail [data-enchant="ember"]'); await pg.wait_for_timeout(700)
    await pg.evaluate("document.querySelectorAll('.materia-burst').forEach(e=> e.remove())")
    af = await pg.evaluate(f"""(()=>{{ const c = socketCost(getCardDefs()['{u}'], 'apply'), toast = [...document.querySelectorAll('.toast')].map(t=> t.textContent).join(' | ');
      return {{dust: myCurrencies.dust, gold: myCurrencies.gold, ember: materiaStore().ember, c, state: (document.querySelector('[data-h1-socket]')||{{dataset:{{}}}}).dataset.h1Socket,
        slot: !!document.querySelector('#forgeDetail .h1-slot.is-full.mk-ember'), poolSlot: !!document.querySelector('#forgePool .card-tile[data-defid="{u}"] .h1-slot.is-full'),
        best: socketGemOfBest('{u}'), sockets: JSON.parse(localStorage.getItem('bramblewood_card_sockets_v1')||'{{}}'), toast,
        locked: [...document.querySelectorAll('#forgeDetail [data-enchant]')].every(b=> b.getAttribute('aria-disabled') === 'true'), remove: !!document.getElementById('forgeSocketRemoveBtn')}}; }})()""")
    ok(af['ember'] == before['ember'] - 1 and af['dust'] == before['dust'] - af['c']['dust'] and af['gold'] == before['gold'] - af['c']['gold'], f"setting Ember spends one crystal and the apply cost {af['c']}")
    ok(af['state'] == 'full' and af['slot'] and af['poolSlot'] and af['best'] == 'ember', 'the socket is filled: the anvil card and the pool tile show the Ember slot')
    ok(af['locked'] and af['remove'], 'a filled socket refuses another gem; the remove button is there')
    ok('Ember set in' in af['toast'], f"toast: {af['toast'][:80]}")
    ok(len(af['sockets'].get(u, {})) == 1, f"saved per copy: {af['sockets']}")
    await pg.evaluate("document.querySelectorAll('.toast-host').forEach(e=> e.innerHTML = ''); document.querySelector('#forgeDetail').scrollIntoView({block:'start'})"); await pg.wait_for_timeout(200)
    await shot(pg, 'forge-filled', w)

    # take it out
    b2 = await pg.evaluate("({dust: myCurrencies.dust, gold: myCurrencies.gold, ember: materiaStore().ember})")
    await pg.click('#forgeSocketRemoveBtn'); await pg.wait_for_timeout(600)
    rm = await pg.evaluate(f"""(()=>{{ const c = socketCost(getCardDefs()['{u}'], 'remove'); return {{dust: myCurrencies.dust, gold: myCurrencies.gold, ember: materiaStore().ember, c,
      state: (document.querySelector('[data-h1-socket]')||{{dataset:{{}}}}).dataset.h1Socket, toast: [...document.querySelectorAll('.toast')].map(t=> t.textContent).join(' | ')}}; }})()""")
    ok(rm['ember'] == b2['ember'] + 1 and rm['dust'] == b2['dust'] - rm['c']['dust'] and rm['gold'] == b2['gold'] - rm['c']['gold'], f"taking it out pays the remove cost {rm['c']} and the crystal comes back")
    ok(rm['state'] == 'empty' and 'back with your Materia' in rm['toast'], f"empty again; toast: {rm['toast'][-80:]}")

    # set Grove into the second copy (the weaker one) through the copy model, and Ember back into the best copy
    two = await pg.evaluate(f"""(()=>{{ const a = myCardCopies['{u}'], o = copyOrder('{u}'), best = a[o[0]].uid, other = a[o[1]].uid;
      const r1 = socketApply('{u}', best, 'ember'), r2 = socketApply('{u}', other, 'grove'); renderForge();
      return {{r1: !!r1, r2: !!r2, best: copySocketGem('{u}', best), other: copySocketGem('{u}', other), def: getCardDefs()['{u}'].socketGem}}; }})()""")
    ok(two['r1'] and two['r2'] and two['best'] == 'ember' and two['other'] == 'grove' and two['def'] == 'ember', f"each copy has its own socket; the card wears its best copy's gem {two}")

    # the card detail
    await pg.evaluate("document.querySelectorAll('.toast-host').forEach(e=> e.innerHTML = '')")
    await pg.evaluate(f"openCardDetail('{u}')"); await pg.wait_for_timeout(700)
    cd = await pg.evaluate("""(()=>{ const s = document.querySelector('.cd-socket'); return {txt: s ? s.textContent.replace(/\\s+/g, ' ').trim() : null, slot: !!document.querySelector('.card-detail-card .h1-slot.is-full')}; })()""")
    ok(cd['txt'] and 'Ember' in cd['txt'] and 'Grove' in cd['txt'], f"card detail: the socket line names both gems ({cd['txt']})")
    ok(cd['slot'], 'card detail: the big card shows its filled slot')
    await shot(pg, 'card-detail', w)
    await pg.evaluate("(()=>{ const x = document.getElementById('cdCloseXBtn'); if(x) x.click(); })()"); await pg.wait_for_timeout(300)
    await pg.evaluate(f"openCardDetail('{r}')"); await pg.wait_for_timeout(500)
    rr = await pg.evaluate("({line: !!document.querySelector('.cd-socket'), slot: !!document.querySelector('.card-detail-card .h1-slot')})")
    ok(not rr['line'] and not rr['slot'], 'a Rare card: no socket line, no slot')
    await pg.evaluate("(()=>{ const x = document.getElementById('cdCloseXBtn'); if(x) x.click(); })()"); await pg.wait_for_timeout(300)

    # the copies sheet shows the gems per copy
    await pg.evaluate(f"openForgeCopySheet('{u}')"); await pg.wait_for_timeout(600)
    sh = await pg.evaluate("""(()=>{ const ov = document.querySelector('.ux-fcs-ov'); return ov ? {n: ov.querySelectorAll('.ux-fcs-g').length, full: ov.querySelectorAll('.h1-slot.is-full').length, txt: ov.textContent.replace(/\\s+/g, ' ')} : null; })()""")
    ok(sh and sh['n'] >= 2 and sh['full'] >= 2 and 'Grove' in sh['txt'], f"the copies sheet: each copy with its own gem {sh and {'n': sh['n'], 'full': sh['full']}}")
    await shot(pg, 'copies-sheet', w)
    await pg.evaluate("document.querySelectorAll('.ux-fcs-ov').forEach(x=> x.remove())")

    # reload: the sockets stay
    await pg.reload(); await pg.wait_for_timeout(1500)
    rl = await pg.evaluate(f"(()=>{{ invalidateCardDefs(); return {{def: getCardDefs()['{u}'].socketGem, n: socketedCopies('{u}').length}}; }})()")
    ok(rl['def'] == 'ember' and rl['n'] == 2, f"after a reload the sockets stay {rl}")
    ok(not errs, f'no page errors {errs[:2]}')
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
    print(f"h1 e2e: {len(fails)} failed; shots: {', '.join(os.path.relpath(f, ROOT) for f in shots)}")
    sys.exit(1 if fails else 0)

asyncio.run(main())
