"""ENG37 (2026-11-08) browser check at 1366: the card editor's two new parameter rows (Shield: Armor, a number; Shell: when, a select with
"After it attacks") load from a card's fused skills and a form read keeps them; the card text reads them on the Shield / Shell line; in a real
match a Reach unit (the new Cormorant) with nothing opposite strikes the Flyer in the lane beside it (the log line and the float). Screens in
docs/screens/eng37/.
    python3 tests/e2e/eng37_2026_11_08.py      (build first; writes docs/screens/eng37/*.png; needs Playwright)"""
import asyncio, os, json, functools, threading, http.server, socketserver
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
OUT = os.path.join(ROOT, 'docs', 'screens', 'eng37'); os.makedirs(OUT, exist_ok=True)
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
  switchTab('play'); startConquestMatch('mc', '3-1', {skipEnergyCost:true, noOpener:true}); await new Promise(r=> setTimeout(r, 3500)); return {mode: matchState && matchState.engine && matchState.engine.battleMode};""")

# Cormorant at the centre, nothing opposite; a Flyer (Oystercatcher) in the lane to its right
REACH = E("""const m = matchState, e = m.engine; m.resolving = true;
  [1, 2].forEach(pid=>{ const pl = m.players[pid]; pl.row.left = []; pl.row.center = []; pl.row.right = []; pl.hand = []; });
  e.debugSpawnCard(m.players, m.sideOf, 1, 'cormorant', 'center', m.stats, []); const a = m.players[1].row.center[0]; a.slot = 0; a.wait = 0;
  e.debugSpawnCard(m.players, m.sideOf, 2, 'oystercatcher', 'right', m.stats, []); const t = [...m.players[2].row.left, ...m.players[2].row.center, ...m.players[2].row.right][0]; t.slot = 1; t.wait = 9;
  m.players[2].row.center = []; m.players[2].row.left = []; m.players[2].row.right = [t]; e.syncSlots(m.players[1]); e.syncSlots(m.players[2]);
  renderMatchUI(); await new Promise(r=> setTimeout(r, 400));
  const hp0 = t.hp, hq0 = m.players[2].hq.hp, ev = []; e.debugAttack(m.players, m.sideOf, a.uid, m.stats, ev);
  const aim = ev.find(x=> x.type === 'statusFx' && x.kind === 'reachAim');
  renderMatchUI(); await new Promise(r=> setTimeout(r, 200));
  if(aim) renderVfxForEvent(aim); const hit = ev.find(x=> x.type === 'hit'); if(hit) { try{ renderVfxForEvent(hit); }catch(err){} }
  await new Promise(r=> setTimeout(r, 250));
  const log = aim ? ((logText(aim) || {}).text || '') : '';
  m.resolving = false;
  return {aSlot: a.slot, tSlot: t.slot, hpLost: hp0 - t.hp, brambleLost: hq0 - m.players[2].hq.hp, aim: !!aim, log, types: ev.map(x=> x.type + (x.kind ? ':' + x.kind : '')).slice(0, 8)};""")

async def page(p, url):
    b = await p.chromium.launch(executable_path=CHROME if os.path.exists(CHROME) else None, args=['--no-sandbox'])
    ctx = await b.new_context(viewport={'width': 1366, 'height': 860})
    pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.add_init_script(SKIP); await pg.goto(url); await pg.wait_for_timeout(1500)
    return b, pg, errs

async def main():
    h = serve(); url = f'http://127.0.0.1:{h.server_address[1]}/index.html'
    async with async_playwright() as p:
        b, pg, errs = await page(p, url)
        # --- the editor: Conch Crawler (Shell 2, Shield 4) given Shield {v 4, armor 1} and Shell {v 2, when afterAttack}
        await pg.evaluate(E("""adminModeEnabled = true; openCardEditor('conch-crawler'); await new Promise(r=> setTimeout(r, 900));
          editingCard.effects = Object.assign({}, editingCard.effects, {shield: 4, shieldArmor: 1, shell: 2, shellWhen: 'afterAttack'}); delete editingCard._skillRows;
          renderEditor(); await new Promise(r=> setTimeout(r, 500)); return 1;"""))
        r = await pg.evaluate("""(()=>{ const rows = [...document.querySelectorAll('#skillRows [data-sk="key"], #evergreenRows [data-sk="key"]')];
          const row = k=> { const s = rows.find(x=> x.value === k); if(!s) return null; const r = s.closest('.skill-row'); const v = r && r.querySelector('[data-sk="val"]'); return v ? {tag: v.tagName, val: v.value, opts: v.tagName === 'SELECT' ? [...v.options].map(o=> o.value + '=' + o.textContent) : null} : {tag: null}; };
          const pickable = [...document.querySelectorAll('#editorOverlay select[data-sk="key"] option')].map(o=> o.value);
          return {armor: row('shieldArmor'), when: row('shellWhen'), pickArmor: pickable.includes('shieldArmor'), pickWhen: pickable.includes('shellWhen')}; })()""")
        print('   editor rows:', json.dumps(r, ensure_ascii=False))
        ok(r['pickArmor'] and r['pickWhen'], 'the skill picker offers "Shield: Armor" and "Shell: when"')
        ok(r['armor'] and r['armor']['tag'] == 'INPUT' and r['armor']['val'] == '1', f'the Shield: Armor row is a number field holding 1 ({r["armor"]})')
        ok(r['when'] and r['when']['tag'] == 'SELECT' and r['when']['val'] == 'afterAttack' and any('afterAttack=' in o for o in (r['when']['opts'] or [])), f'the Shell: when row is a select on "After it attacks" ({r["when"]})')
        saved = await pg.evaluate("(()=>{ const c = readEditorFormIntoCard(); const x = (typeof BramblewoodSkillParams !== 'undefined') ? BramblewoodSkillParams.expand(c.effects) : c.effects; return {raw: c.effects, flat: {shield: x.shield, shieldArmor: x.shieldArmor, shell: x.shell, shellWhen: x.shellWhen}}; })()")
        print('   form read:', json.dumps(saved, ensure_ascii=False))
        ok(saved['flat'] == {'shield': 4, 'shieldArmor': 1, 'shell': 2, 'shellWhen': 'afterAttack'}, 'reading the form keeps Shield 4 / armor 1 and Shell 2 / after attacking')
        await pg.evaluate("(()=>{ const rows = [...document.querySelectorAll('#editorOverlay [data-sk=\"key\"]')]; const s = rows.find(x=> x.value === 'shellWhen'); if(s) s.scrollIntoView({block:'center'}); })()"); await pg.wait_for_timeout(300)
        await pg.screenshot(path=os.path.join(OUT, 'editor-shield-armor-shell-when-1366.png'))
        txt = await pg.evaluate("(()=>{ const e = {shield: 4, shieldArmor: 1, shell: 2, shellWhen: 'afterAttack'}; return {shield: SKILL_TEXT.shield(4, undefined, e), shell: SKILL_TEXT.shell(2, undefined, e), plainShell: SKILL_TEXT.shell(2, undefined, {shell: 2}), reach: SKILL_TEXT.reach()}; })()")
        print('   card text:', json.dumps(txt, ensure_ascii=False))
        ok('+1 Armor while any of it remains' in txt['shield'], 'the Shield line reads its Armor')
        ok(txt['shell'].startswith('After it attacks') and 'first hit' in txt['plainShell'], 'the Shell line reads "After it attacks"; a plain Shell keeps its text')
        ok('beside it' in txt['reach'], f'the Reach line: {txt["reach"]}')
        await pg.goto(url); await pg.wait_for_timeout(1500)
        # --- a Reach diagonal strike in a real Gannet Cliffs match
        s = await pg.evaluate(SETUP); print('   match:', s)
        r = await pg.evaluate(REACH)
        print('   reach:', json.dumps(r, ensure_ascii=False))
        ok(r['aim'] and r['hpLost'] == 3 and r['brambleLost'] == 0, f'the Cormorant (slot {r["aSlot"]}) strikes the Oystercatcher in the next lane (slot {r["tSlot"]}) for 3, not the bramble')
        ok('reaches into the next lane' in r['log'], f'the log line: {r["log"]}')
        await pg.screenshot(path=os.path.join(OUT, 'reach-diagonal-strike-1366.png'))
        ok(not errs, f'no page errors ({errs[:3]})')
        await b.close()
    h.shutdown()
    print('eng37 browser: %s' % ('all ok' if not fails else '%d failed' % len(fails)))
    raise SystemExit(1 if fails else 0)

asyncio.run(main())
