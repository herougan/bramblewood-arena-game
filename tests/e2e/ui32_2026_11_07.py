#!/usr/bin/env python3
"""UI32 (2026-11-07) browser check at 1366: the battle log's field lines (one line, no raw "en20Dry."), a Venomous hit that does no damage floats the Venom
it added, the Venom tooltip and the hover's counters list, the Power badge's "edited since rated" marker, and the Map cards window redrawing a saved card's tile.
    python3 tests/e2e/ui32_2026_11_07.py      (build first; writes docs/screens/ui32/*.png; needs Playwright)"""
import asyncio, os, sys, json, functools, threading, http.server, socketserver
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
OUT = os.path.join(ROOT, 'docs', 'screens', 'ui32'); os.makedirs(OUT, exist_ok=True)
SKIP = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1');"
        "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying']));")
fails = []
def ok(c, m):
    print(('  ok ' if c else '  x ') + m)
    if not c: fails.append(m)

def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
        def handle(self):
            try: super().handle()
            except (BrokenPipeError, ConnectionResetError): pass
    h = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); threading.Thread(target=h.serve_forever, daemon=True).start(); return h

def E(body): return "(async()=>{ " + body + " })()"

SETUP = E("""FEATURE_SPOTS.forEach(sp=>{ try{ unlockFeature(sp.key); }catch(e){} }); myCurrencies.energy = 60; window.showCoachTip = function(){}; window.deckSizeOkOrWarn = ()=> true;
  switchTab('play'); startConquestMatch('m2', '4-1', {skipEnergyCost:true, noOpener:true}); await new Promise(r=> setTimeout(r, 3500)); return 1;""")

async def main():
    h = serve(); url = f'http://127.0.0.1:{h.server_address[1]}/index.html'
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME if os.path.exists(CHROME) else None, args=['--no-sandbox'])
        pg = await b.new_page(viewport={'width': 1366, 'height': 860})
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.add_init_script(SKIP); await pg.goto(url); await pg.wait_for_timeout(1500)

        # --- a real fight on Sunken Hollow (River Rapids: always Flood): a Moon Jelly of ours hits an enemy unit
        await pg.evaluate(SETUP)
        r = await pg.evaluate(E("""const m = matchState, e = m.engine; m.resolving = true;
          [1, 2].forEach(pid=>{ const pl = m.players[pid]; pl.row.left = []; pl.row.center = []; pl.row.right = []; pl.hand = []; });
          e.debugSpawnCard(m.players, m.sideOf, 2, 'garden-snail', 'center', m.stats, []); const foe = m.players[2].row.center[0]; foe.wait = 9; foe.hp = foe.maxHp = 30;
          e.debugSpawnCard(m.players, m.sideOf, 1, 'moon-jelly', 'center', m.stats, []); const me = m.players[1].row.center[0]; me.wait = 0; me.atk = 0; me.baseAtk = 0;
          e.debugSpawnCard(m.players, m.sideOf, 1, 'moon-jelly', 'left', m.stats, []); const me2 = m.players[1].row.left[0]; me2.wait = 9;
          renderMatchUI(); await new Promise(r=> setTimeout(r, 400)); m.resolving = false;
          window.__floats = []; const seen = new MutationObserver(ms=> ms.forEach(mu=> mu.addedNodes.forEach(n=>{ if(n.nodeType === 1 && n.className && String(n.className).includes('float')) window.__floats.push(n.textContent); })));
          seen.observe(document.body, {subtree:true, childList:true}); window.__seen = seen;
          const bl = document.getElementById('battleLog'); if(bl) bl.innerHTML = '';
          m.players[1].playedThisTurn = true; resolveRound(); await new Promise(r=> setTimeout(r, 6000));
          const evs = (m.log || []).filter(x=> x && (x.type === 'hit' || (x.type === 'statusFx')));
          return {floats: window.__floats, hits: evs.filter(x=> x.type === 'hit').map(x=> ({att: x.attDefId, dmg: x.dmg, type: x.dmgType})), kinds: evs.filter(x=> x.type === 'statusFx').map(x=> x.kind), foePoison: foe.poison, foeHp: foe.hp};"""))
        fl = [f.strip() for f in r['floats'] if len(f.strip()) < 12]
        print('   fight:', json.dumps({k: v for k, v in r.items() if k != 'floats'}), 'floats', fl)
        ok(any(h['att'] == 'moon-jelly' and h['dmg'] == 1 for h in r['hits']) and '1' in fl, f'a Moon Jelly hit that does damage keeps its damage number ({fl})')
        # a Venomous hit that lands as Venom with no damage (poison-type damage: elementalConvert poison): the float is the Venom added, never "0"
        r2 = await pg.evaluate(E("""const m = matchState, foe = m.players[2].row.center[0], jel = m.players[1].row.center[0];
          m.replayCards = m.replayCards || {}; m.replayCards[foe.uid] = m.replayCards[foe.uid] || Object.assign({}, foe); foe.hp = foe.maxHp = 30; m.replayCards[foe.uid].hp = 30;
          window.__floats = []; const mk = x=> Object.assign({type:'hit', side:'A', attDefId:'moon-jelly', attUid:jel.uid, targetSide:'B', targetDefId:foe.defId, targetUid:foe.uid, dmg:0, dmgType:'physical'}, x);
          const direct = {venom: ui32VenomOnly(mk({elementalConvert:'poison', elementalAmount:1})), blocked: ui32VenomOnly(mk({armorBlocked:true})), dmg: ui32VenomOnly(mk({dmg:2})), none: ui32VenomOnly(mk({}))};
          renderVfxForEvent(mk({elementalConvert:'poison', elementalAmount:1})); await new Promise(r=> setTimeout(r, 900));
          return {direct, floats: window.__floats.map(f=> f.trim()).filter(f=> f.length < 12)};"""))
        print('   venom-only:', json.dumps(r2, ensure_ascii=False))
        ok(r2['direct']['venom'] == 5, 'ui32VenomOnly: 1 stack from the swing + 4 of Venomous = 5 added')
        ok(r2['direct']['blocked'] == 0 and r2['direct']['dmg'] == 0 and r2['direct']['none'] == 0, 'a blocked hit, a damaging hit, a 0 hit with no Venom landing: not a venom float')
        ok('5' in r2['floats'] and not any(f in ('0', '👊 0', '🛡 0') for f in r2['floats']), f'the float is the Venom added, ☠5, and no "0" ({r2["floats"]})')
        await pg.evaluate("document.getElementById('battleLogToggle') && !battleLogOpen && document.getElementById('battleLogToggle').click()")
        await pg.wait_for_timeout(600)
        rows = await pg.evaluate("[...document.querySelectorAll('#battleLog .log-row')].map(x=> x.textContent)")
        print('   log:', json.dumps(rows, ensure_ascii=False)[:1200])
        ok(not any('en20' in t for t in rows), 'no raw en20* word in the battle log')
        ok(sum(1 for t in rows if 'All creatures in the water are soaked' in t) <= 1, 'the tide soak is one line, not one per unit')
        await pg.screenshot(path=os.path.join(OUT, 'fight-log-1366.png'))

        # --- the field lines, for every kind, straight through logText / renderLogLine
        r = await pg.evaluate(E("""const defs = getCardDefs(), id = 'moon-jelly', out = {};
          const mk = (k, x)=> Object.assign({type:'statusFx', kind:k, attDefId:id, targetDefId:id, amount:1, total:2}, x || {});
          const evs = [mk('en20Soak', {tide:'flow'}), mk('en20Soak', {tide:'flow'}), mk('en20Soak', {tide:'flow'}), mk('en20Dry', {drain:true}), mk('en20Dry', {drain:true}), mk('en20Soak'), mk('en20Dry'), mk('en20Douse'), mk('en20Ignite'), mk('en20Roll'), mk('en20Glean', {amount:3}), mk('en20LumberFeast', {amount:3}), mk('crosswind', {amount:2}), mk('crosswind', {amount:2})];
          const bl = document.getElementById('battleLog'); bl.innerHTML = ''; evs.forEach(renderLogLine);
          return [...bl.querySelectorAll('.log-row')].map(x=> x.textContent);"""))
        print('   synthetic:', json.dumps(r, ensure_ascii=False))
        ok(len(r) == 10 and r[9].startswith('A crosswind blows') and r[0] == 'All creatures in the water are soaked. 💧' and r[1].startswith('All creatures dry a little'), 'three tide events = one line, two drain events = one line, each kind has its own text')
        ok(not any(('en20' in t) for t in r), 'no raw kind in any ENG20 line')

        # --- raw kinds: every statusFx kind the engine can send has a real line, not "<unit> kind."
        import re
        eng = open(os.path.join(ROOT, 'bramblewood-engine.js'), encoding='utf-8').read()
        kinds = sorted(set(re.findall(r"statusFx', kind: ?'([A-Za-z0-9]+)'", eng)) | set(re.findall(r"en20Ev\([a-zA-Z]+, '([A-Za-z0-9]+)'", eng)))
        r = await pg.evaluate(E("const kinds = " + json.dumps(kinds) + """, bad = [];
          kinds.forEach(k=>{ const t = (logText({type:'statusFx', kind:k, attDefId:'moon-jelly', targetDefId:'moon-jelly', attUid:1, targetUid:1, amount:1, total:1}) || {}).text; if(t && t.endsWith(k + '.')) bad.push(k); });
          return bad;"""))
        ok(r == [], f'no statusFx kind prints as its raw name ({r})')
        # --- the Venom pip's tooltip and the hover's counters list
        r = await pg.evaluate(E("""const m = matchState, c = m.players[1].row.center[0] || m.players[1].row.left[0];
          Object.assign(c, {poison: 5, bleed: 2, water: 2, burn: 1, ffCounters: 1, dauntN: 2, shield: 3, frozen: 1, inspTokens: 2, sk2Berries: 1, creativity: 1});
          const tip = (ui7PoisonChip(c).match(/title="([^"]*)"/) || [])[1], pip = ui7PoisonChip(c).replace(/<[^>]+>/g, '').trim();
          const box = document.createElement('div'); box.innerHTML = fullCardHTML(c.defId, c); const txt = box.textContent.replace(/\\s+/g, ' ');
          return {tip, pip, txt};"""))
        print('   pip tip:', r['tip'], '| pip text:', repr(r['pip']))
        ok(r['pip'] == '☠' and '5' in r['tip'] and 'Venom' in r['tip'], 'the Venom pip has no number; its tooltip says how many Venom tokens (5)')
        for word in ['Venom 5', 'Bleed 2', '💧 2', '🔥 1', '⏩ 1', '😨 2', 'Shield', 'Frozen', '📯 2', '🫐 1', '🎨 1']:
            ok(word in r['txt'], f'the hover lists the counter: {word}')

        # --- the admin Map cards window: edit + Save redraws the tile (stats, Power marker) and the skills section follows
        await pg.evaluate(E("adminModeEnabled = true; pk1OpenMapCards('m2'); await new Promise(r=> setTimeout(r, 1200)); return 1;"))
        r = await pg.evaluate("""(()=>{ const t = [...document.querySelectorAll('#pk1MapCardsOverlay .rv1-tile[data-rv-kind="chosen"]')].find(t=> CARD_POWER.fp[t.dataset.rvId] && t.querySelector('.ui28-pow'));
          const id = t.dataset.rvId, hs = [...document.querySelectorAll('#ui19McSkills .ui32-sk-head')].map(x=> x.textContent);
          return {id, text: t.innerText.replace(/\\s+/g, ' '), mark: (t.querySelector('.ui32-edit') || {}).textContent || '', heads: hs, nSk: document.querySelectorAll('#ui19McSkills .ui19-sk').length,
            sugInMain: [...document.querySelectorAll('#ui19McSkills .ui19-sk')].filter(l=> l.querySelector('.ui30-sugg')).length}; })()""")
        print('   before:', json.dumps(r, ensure_ascii=False)[:500])
        cid = r['id']
        ok(r['mark'] == '', f'{cid}: no edited marker before the edit')
        ok(all(h != 'Main skills' for h in r['heads']), f'UI35: no Main heading any more, one list with pills ({r["heads"]})')
        await pg.screenshot(path=os.path.join(OUT, 'mapcards-before-1366.png'))
        await pg.evaluate(f"document.querySelector('#pk1MapCardsOverlay .rv1-tile[data-rv-id=\"{cid}\"] .vis4-mc-card').click()")
        await pg.wait_for_timeout(900)
        await pg.evaluate("(()=>{ const a = document.getElementById('fAtk'); a.value = String((+a.value || 0) + 3); a.dispatchEvent(new Event('input', {bubbles:true})); a.dispatchEvent(new Event('change', {bubbles:true})); })()")
        await pg.screenshot(path=os.path.join(OUT, 'editor-edited-1366.png'))
        await pg.evaluate("document.getElementById('btnSave').click()")
        await pg.wait_for_timeout(1500)
        r2 = await pg.evaluate(f"""(()=>{{ const t = document.querySelector('#pk1MapCardsOverlay .rv1-tile[data-rv-id="{cid}"]'); const m = t && t.querySelector('.ui32-edit');
          return {{text: t ? t.innerText.replace(/\\s+/g, ' ') : null, mark: m ? m.textContent : '', tip: m ? m.title : '', hidden: document.getElementById('pk1MapCardsOverlay').hidden}}; }})()""")
        print('   after:', json.dumps(r2, ensure_ascii=False)[:500])
        ok(r2['text'] != r['text'], 'after Save the tile shows the new stats at once (no close and reopen)')
        ok(r2['mark'] in ('^', '^^') and 'Edited since rated' in r2['tip'], f'the Power badge shows the edited marker ({r2["mark"]}: {r2["tip"]})')
        await pg.screenshot(path=os.path.join(OUT, 'mapcards-after-save-1366.png'))
        # the skills section follows a SPECIAL add right away
        r3 = await pg.evaluate(E("""const ov = document.getElementById('pk1MapCardsOverlay'), have = new Set([...ov.querySelectorAll('#ui19McSkills .ui19-sk')].map(l=> l.dataset.ui19Skill));
          const defs = getCardDefs(), id = Object.keys(defs).find(i=> { const d = defs[i]; return d && !d.token && !d.test && d.attack != null && ui18CardSkillKeys(d).some(k=> !have.has(k.key)) && !rvAddedOf('m2').includes(i); });
          const key = ui18CardSkillKeys(defs[id]).find(k=> !have.has(k.key)).key, n0 = ov.querySelectorAll('#ui19McSkills .ui19-sk').length;
          rvSpecialAdd['m2'] = (rvSpecialAdd['m2'] || []).concat([id]); ff9RefreshAdded(ov, 'm2');
          const inOther = !![...ov.querySelectorAll('#ui19McSkills .ui19-sk')].find(l=> l.dataset.ui19Skill === key);
          const heads = [...ov.querySelectorAll('#ui19McSkills .ui32-sk-head')].map(x=> x.textContent);
          ff9RemoveAdded(ov, 'm2', id); const back = ov.querySelectorAll('#ui19McSkills .ui19-sk').length;
          return {id, key, n0, inOther, heads, back};"""))
        print('   special add:', json.dumps(r3))
        ok(r3['inOther'] and 'Other skills (side maps, specials)' in r3['heads'], 'a card added to SPECIAL puts its new skill under "Other skills" at once')
        ok(r3['back'] == r3['n0'], 'removing it takes the skill away again')
        await pg.screenshot(path=os.path.join(OUT, 'mapcards-skills-1366.png'))
        await pg.close()
        ok(not errs, f'no page errors ({errs[:2]})')
        await b.close()
    h.shutdown()
    print('FAIL' if fails else 'PASS', len(fails), 'failed'); sys.exit(1 if fails else 0)

asyncio.run(main())
