#!/usr/bin/env python3
"""Package TT (2026-10-24, owner 13:16 #4 "A tutorial for triggers."): plays the Triggers lesson in the built game at 390 and 1366 and keeps
screenshots in docs/screens/TT/. Checks: the lesson appears the first time a card with a trigger is on the field (an enemy one) with its
spotlight on the trigger chip; Next leads to step 2 (the list of moments); Skip ends it and the two passive trigger tips; it never
comes back (same fight, then a reload and a new fight); it is also found for a trigger card in the hand; it holds no map tile back (MAP-3);
the Skill Codex button plays it again.
    python3 tests/e2e/tt_2026_10_24.py [--widths 390 1366]   (build first)"""
import asyncio, os, sys, functools, http.server, socketserver, threading
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'docs', 'screens', 'TT'); os.makedirs(OUT, exist_ok=True)
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
SKIP = ("if(!localStorage.getItem('tt_boot')){ localStorage.setItem('tt_boot','1'); localStorage.setItem('bramblewood_arena_tutorial_done','1');"
        "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying','castle-shield','castle-passive','pl-need','pl-do','pl-after'])); }"
        "sessionStorage.setItem('bramblewood_seen_splash','1');")
fails = []
def ok(c, m):
    print(('  ok  ' if c else '  FAIL ') + m)
    if not c: fails.append(m)
def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    class S(socketserver.ThreadingTCPServer):
        daemon_threads = True
        def handle_error(self, *a): pass
    h = S(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); threading.Thread(target=h.serve_forever, daemon=True).start(); return h
async def page(b, url, w):
    pg = await b.new_page(viewport={'width': w, 'height': 844 if w < 700 else 860}, has_touch=(w < 700)); pg._errs = []
    pg.on('pageerror', lambda e: pg._errs.append(str(e)))
    await pg.add_init_script(SKIP); await pg.goto(url); await pg.wait_for_timeout(1300)
    await pg.evaluate("(()=>{ FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); Object.entries(myDeckCounts).forEach(([id,n])=>{for(let i=0;i<n;i++) unlockCardForPlayer(id,'test');});"
                      "saveEnergyState({current:60, lastRegenAt:Date.now()}); try{ refreshEnergyHud(); }catch(e){} })()")
    return pg
async def shot(pg, name, w):
    await pg.add_style_tag(content='.toast, .toast-host, .xp-float{display:none !important;}'); await pg.wait_for_timeout(200)
    await pg.screenshot(path=os.path.join(OUT, f'tt-{name}-{w}.png'), animations='disabled')
E = lambda js: f"(async()=>{{ {js} }})()"
# a fight whose enemy side holds the given card; the lesson is evaluated by hand (the CPU is held while the board is rebuilt)
FIGHT = """adminModeEnabled = true; switchTab('play'); startConquestMatch('m11', '20-7'); await new Promise(r=> setTimeout(r, 2600));
  const m = matchState, e = m.engine; m.resolving = true;
  [1, 2].forEach(pid=>{ const pl = m.players[pid]; if(pid === 2){ pl.row.left = []; pl.row.center = []; pl.row.right = []; } });
  const c = e.makeBoardCard(ENEMY); c.wait = 0; c.hp = c.maxHp = 9; c.slot = 0; m.players[2].row.center.push(c);
  renderMatchUI(); await new Promise(r=> setTimeout(r, 700)); m.resolving = false;"""
TIP = "(()=>{ const t = document.querySelector('.coach-tip'); return t ? {id: coachOpen && coachOpen.tip && coachOpen.tip.id, text: t.querySelector('.coach-text').textContent, btns: [...t.querySelectorAll('button')].map(x=> x.textContent.trim()), spot: !!document.querySelector('.coach-spotlight')} : null; })()"
async def run(b, url, w):
    print(f'-- {w}')
    pg = await page(b, url, w)
    ok(await pg.evaluate("(()=> !coachSeen.has('tl-what') && !coachSeen.has('tl-when'))()"), 'a fresh player has not seen the lesson')
    await pg.evaluate(E(FIGHT.replace('ENEMY', "'forager-ant'") + " maybeShowCoachTip(); await new Promise(r=> setTimeout(r, 500));"))
    t = await pg.evaluate(TIP)
    ok(t and t['id'] == 'tl-what' and 'trigger' in t['text'] and t['spot'], f'the first trigger card on the field starts step 1 with a spotlight ({t and t["id"]})')
    ok(t and t['btns'] == ['Skip', 'Next ▶'], f'step 1 offers Skip and Next ({t and t["btns"]})')
    r = await pg.evaluate("""(()=>{ const chip = coachOpen.tip.anchor(), s = document.querySelector('.coach-spotlight').getBoundingClientRect(), c = chip.getBoundingClientRect();
      return {onChip: s.left <= c.left + 1 && s.right >= c.right - 1 && s.top <= c.top + 1 && s.bottom >= c.bottom - 1, chipIsTrig: chip.classList.contains('ab-trig'), small: s.width < 120 && s.height < 120}; })()""")
    ok(r['onChip'] and r['chipIsTrig'] and r['small'], f'the spotlight sits on the trigger chip ({r})')
    r = await pg.evaluate("""(()=>{ const t = document.querySelector('.coach-tip').getBoundingClientRect(); return {inView: t.left >= 0 && t.right <= innerWidth && t.top >= 0 && t.bottom <= innerHeight, lock: !!tutorialLock}; })()""")
    ok(r['inView'] and not r['lock'], f'the bubble is on screen and locks nothing ({r})')
    # MAP-3: the lesson is on screen, so no NPC conversation holds a map tile back
    r = await pg.evaluate("(()=>{ dialoguesPending.add('some_npc_talk'); const held = npcDialogueActive(); dialoguesPending.delete('some_npc_talk'); return {held, on: tutorialLessonOn()}; })()")
    ok(r['on'] and not r['held'], f'MAP-3: while the lesson is up no map tile is held back ({r})')
    await shot(pg, 'step1', w)
    await pg.click('.coach-tip .coach-ok'); await pg.wait_for_timeout(900)
    t = await pg.evaluate(TIP)
    ok(t and t['id'] == 'tl-when' and 'On Death' in t['text'] and 'On Spawn' in t['text'], f'Next leads to step 2, the list of moments ({t and t["id"]})')
    ok(t and t['btns'] == ['Skip', 'Got it'], f'step 2 offers Skip and Got it ({t and t["btns"]})')
    await shot(pg, 'step2', w)
    await pg.click('.coach-tip .coach-skip-lesson'); await pg.wait_for_timeout(900)
    r = await pg.evaluate("(()=>({ tip: !!document.querySelector('.coach-tip'), seen: ['tl-what','tl-when','trig-off','trig-on'].every(i=> coachSeen.has(i)), stored: JSON.parse(localStorage.getItem('bramblewood_coach_seen')).includes('tl-when') }))()")
    ok(not r['tip'] and r['seen'] and r['stored'], f'Skip closes it and ends the lesson and the passive trigger tips ({r})')
    await pg.evaluate("maybeShowCoachTip()"); await pg.wait_for_timeout(500)
    r = await pg.evaluate("(()=>{ const t = document.querySelector('.coach-tip'); return !t || !/trigger/i.test(t.textContent) || !coachOpen || !/^tl-/.test(coachOpen.tip.id); })()")
    ok(r, 'in the same fight it does not come back')
    await pg.close()
    # a reload and a new fight: still gone
    pg = await page(b, url, w)
    ok(await pg.evaluate("(()=> coachSeen.has('tl-what') && coachSeen.has('tl-when'))()") is False, 'a new page (fresh storage) starts unseen; the next fight is played with both steps marked seen')
    pg2 = pg
    await pg2.evaluate("(()=>{ coachSeen.add('tl-what'); coachSeen.add('tl-when'); })()")
    await pg2.evaluate(E(FIGHT.replace('ENEMY', "'forager-ant'") + " maybeShowCoachTip(); await new Promise(r=> setTimeout(r, 500));"))
    r = await pg2.evaluate("(()=> !(coachOpen && /^tl-/.test(coachOpen.tip.id)))()")
    ok(r, 'a seen lesson does not show in a new fight')
    await pg2.close()
    # Got it ends step 2 without Skip; both steps remembered
    pg = await page(b, url, w)
    await pg.evaluate(E(FIGHT.replace('ENEMY', "'worker-ant'") + " maybeShowCoachTip(); await new Promise(r=> setTimeout(r, 500));"))
    await pg.click('.coach-tip .coach-ok'); await pg.wait_for_timeout(900); await pg.click('.coach-tip .coach-ok'); await pg.wait_for_timeout(700)
    r = await pg.evaluate("(()=>({ both: coachSeen.has('tl-what') && coachSeen.has('tl-when'), open: !!(coachOpen && /^tl-/.test(coachOpen.tip.id)) }))()")
    ok(r['both'] and not r['open'], f'Next then Got it finishes the lesson ({r})')
    await pg.close()
    # a trigger card in the hand finds the chip there first
    pg = await page(b, url, w)
    r = await pg.evaluate(E("""switchTab('play'); startConquestMatch('m11', '20-7'); await new Promise(r=> setTimeout(r, 2600));
      const m = matchState, me = m.players[1]; me.hand.length = 0; me.hand.push(m.engine.makeHandCard ? m.engine.makeHandCard('courier-pigeon') : {uid: 99001, defId: 'courier-pigeon'});
      renderMatchUI(); await new Promise(r=> setTimeout(r, 600));
      const chip = triggerLessonChip(m); return {hand: !!chip && !!chip.closest('#handStrip'), n: me.hand.length};"""))
    ok(r['hand'], f'a trigger card in the hand is found first ({r})')
    await pg.close()
    # the Skill Codex button plays it again
    pg = await page(b, url, w)
    r = await pg.evaluate(E("""markCoachSeen('tl-what'); markCoachSeen('tl-when'); markCoachSeen('trig-off'); codexSubTab = 'skills'; switchTab('codex'); await new Promise(r=> setTimeout(r, 800));
      const btn = document.getElementById('tlReplayBtn'); if(!btn) return {btn: false}; btn.click(); await new Promise(r=> setTimeout(r, 200));
      return {btn: true, cleared: !coachSeen.has('tl-what') && !coachSeen.has('tl-when') && !coachSeen.has('trig-off')};"""))
    ok(r.get('btn') and r.get('cleared'), f'the Skill Codex button clears the lesson to play again ({r})')
    await shot(pg, 'codex-replay', w)
    ok(not pg._errs, f'no page errors ({pg._errs[:2]})')
    await pg.close()
async def main():
    widths = [390, 1366]
    if '--widths' in sys.argv: widths = [int(x) for x in sys.argv[sys.argv.index('--widths') + 1:]]
    h = serve(); url = f'http://127.0.0.1:{h.server_address[1]}/index.html'
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME) if os.path.exists(CHROME) else await p.chromium.launch()
        for w in widths: await run(b, url, w)
        await b.close()
    print('FAILED: ' + '; '.join(fails) if fails else 'all ok'); sys.exit(1 if fails else 0)
asyncio.run(main())
