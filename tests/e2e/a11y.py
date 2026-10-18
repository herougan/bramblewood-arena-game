#!/usr/bin/env python3
"""Accessibility check for modals (2026-10-18, R3-WP5) — real game page in headless Chromium.

    python3 tests/e2e/a11y.py

For Settings, a Codex card detail, the Notices board and the Tavern (a shop dialog with no Escape handler of
its own before bramblewood-a11y.js):
  1. focus moves inside the dialog when it opens, and the dialog is labelled (role, aria-modal for real modals);
  2. Tab and Shift+Tab keep focus inside;
  3. Escape closes it, once;
  4. focus goes back to the button that had it.
Plus: an onboarding screen marked no-Escape stays open on Escape.
Exit code 1 on any failure.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
URL = 'file://' + os.path.join(ROOT, 'index.html')
EXE = os.environ.get('BW_CHROMIUM', '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell')
INIT = ("localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_pitch_open_v1','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); localStorage.setItem('bramblewood_world_open_v1','1'); localStorage.setItem('bramblewood_arena_faction','otters'); localStorage.setItem('bramblewood_map_revealed_v1','[\"*\"]'); localStorage.setItem('bramblewood_dialogue_flags_v1', JSON.stringify({'lesson:lumber':true}));"
        "sessionStorage.setItem('bramblewood_seen_splash','1'); localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek']));")
failures = []

def check(cond, msg):
    if not cond:
        failures.append(msg); print('  FAIL', msg)
    else:
        print('  ok  ', msg)

# The dialog that should hold focus: the top of BWA11y's stack.
TOP = "(()=>{ const s = window.BWA11y && BWA11y.stack(); return s && s.length ? s[s.length-1] : null; })()"

async def exercise(pg, name, opener_sel, open_js, closed_js, modal=True):
    """Focus the opener, open the dialog, then check focus in / Tab trap / Escape / focus back."""
    await pg.focus(opener_sel)
    await pg.evaluate(open_js); await pg.wait_for_timeout(250)
    info = await pg.evaluate(f"(()=>{{ const d = {TOP}; return d ? {{inside: d.contains(document.activeElement), role: d.getAttribute('role'), modal: d.getAttribute('aria-modal'), label: d.getAttribute('aria-label') || d.getAttribute('aria-labelledby') || ''}} : null; }})()")
    check(info is not None, f'{name}: the dialog is tracked')
    if not info: return
    check(info['inside'], f'{name}: focus moved inside on open')
    check(info['role'] in ('dialog', 'alertdialog') and bool(info['label']), f'{name}: role=dialog with a label ({info})')
    if modal: check(info['modal'] == 'true', f'{name}: aria-modal="true"')
    n = await pg.evaluate(f"(()=>{{ const d = {TOP}; return [...d.querySelectorAll('button, input, select, textarea, a[href], [tabindex]')].filter(e=> e.tabIndex >= 0 && e.getClientRects().length).length; }})()")
    stayed = True
    for i in range(n + 3):
        await pg.keyboard.press('Tab')
        stayed = stayed and await pg.evaluate(f"(()=>{{ const d = {TOP}; return !!d && d.contains(document.activeElement); }})()")
    check(stayed, f'{name}: Tab stays inside ({n} stops, pressed {n+3}×)')
    back = True
    for i in range(3):
        await pg.keyboard.press('Shift+Tab')
        back = back and await pg.evaluate(f"(()=>{{ const d = {TOP}; return !!d && d.contains(document.activeElement); }})()")
    check(back, f'{name}: Shift+Tab stays inside')
    await pg.keyboard.press('Escape'); await pg.wait_for_timeout(250)
    check(await pg.evaluate(closed_js), f'{name}: Escape closes it')
    got = await pg.evaluate(f"(()=>{{ const a = document.activeElement; return a ? (a.id || a.className || a.tagName) : null; }})()")
    check(await pg.evaluate(f"document.activeElement === document.querySelector({opener_sel!r})"), f'{name}: focus returns to the opener (now on {got})')

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=EXE)
        pg = await b.new_page(viewport={'width': 1366, 'height': 900})
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('dialog', lambda d: asyncio.ensure_future(d.accept()))
        await pg.add_init_script(INIT)
        await pg.goto(URL); await pg.wait_for_timeout(1500)
        await pg.evaluate("FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); switchTab('codex'); 1"); await pg.wait_for_timeout(300)
        check(await pg.evaluate("!!window.BWA11y"), 'bramblewood-a11y.js is loaded')

        # 1. Settings (a light panel: role=dialog, focus managed, no aria-modal)
        await exercise(pg, 'Settings', '#settingsBtn', "document.getElementById('settingsBtn').click(); 1",
                       "document.getElementById('settingsPanel').hidden", modal=False)
        # 2. Codex card detail (has its own document-level Escape handler: must close once, not twice)
        await exercise(pg, 'Codex card detail', '#settingsBtn', "openCardDetail(Object.keys(getCardDefs()).find(id=> !getCardDefs()[id].token) ); 1",
                       "document.getElementById('cardDetailOverlay').hidden")
        # 3. Notices
        await pg.evaluate("switchTab('home'); 1"); await pg.wait_for_timeout(300)
        await exercise(pg, 'Notices', '#settingsBtn', "openQuestsModal(); 1",
                       "(()=>{ const m = document.querySelector('.quests-modal'); return !m || !m.getClientRects().length; })()")
        # 4. The Tavern (shop dialog; Escape comes from the a11y fallback pressing its ✕)
        await exercise(pg, 'Tavern', '#settingsBtn', "openTavern(); 1",
                       "(()=>{ const o = document.getElementById('tavernOverlay'); return !o || o.hidden; })()")
        # 5. Nested: a confirm over the Tavern traps on its own; Escape closes only the confirm.
        await pg.focus('#settingsBtn')
        await pg.evaluate("openTavern(); 1"); await pg.wait_for_timeout(200)
        await pg.evaluate("window.__cf = bwConfirm({title:'Sure?', body:'Test', okLabel:'Yes'}); 1"); await pg.wait_for_timeout(250)
        check(await pg.evaluate(f"(()=>{{ const d = {TOP}; return !!d && d.closest('.bw-text-dialog') && d.contains(document.activeElement); }})()"), 'Nested: the confirm on top holds focus')
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(250)
        check(await pg.evaluate("!document.querySelector('.bw-text-dialog') && !document.getElementById('tavernOverlay').hidden"), 'Nested: Escape closes the confirm only')
        check(await pg.evaluate("document.getElementById('tavernOverlay').contains(document.activeElement)"), 'Nested: focus goes back into the Tavern')
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(250)
        check(await pg.evaluate("document.getElementById('tavernOverlay').hidden"), 'Nested: a second Escape closes the Tavern')
        # 6. No-Escape opt-out: the faction screen (onboarding) stays put.
        await pg.evaluate("document.getElementById('factionScreen').hidden = false; 1"); await pg.wait_for_timeout(200)
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(250)
        check(await pg.evaluate("!document.getElementById('factionScreen').hidden"), 'Onboarding screen ignores Escape')
        await pg.evaluate("document.getElementById('factionScreen').hidden = true; 1")

        # 7. NPC reply timer (WCAG 2.2.1): Slow speed gives 1.5× the time, and the clock waits while the pointer is on the replies.
        await pg.evaluate("""(()=>{ setDialogueSpeed('slow'); DIALOGUE_LINE_MS = 50; DIALOGUE_GAP_MS = 10;
          const id = Object.keys(DIALOGUES).find(k=> DIALOGUES[k].lines[0] && DIALOGUES[k].lines[0].options);
          window.__dlgId = id; if(id) playDialogue(id, {force:true, expand:true}); return id; })()""")
        await pg.wait_for_timeout(900)
        secs = await pg.evaluate("(()=>{ const b = document.querySelector('.dlg-replies .dlg-timer b'); return b ? +b.textContent : null; })()")
        check(secs is not None and secs > 30, f'NPC replies: Slow speed gives more than 30 s (shows {secs})')
        if secs is not None:
            await pg.hover('.dlg-replies .dlg-reply'); await pg.wait_for_timeout(2300)
            after = await pg.evaluate("(()=>{ const r = document.querySelector('.dlg-replies'); return r ? {n: +r.querySelector('.dlg-timer b').textContent, paused: r.classList.contains('is-paused')} : null; })()")
            check(after and after['paused'] and after['n'] >= secs - 1, f'NPC replies: the clock waits under the pointer ({secs} → {after})')
            await pg.click('.dlg-replies .dlg-reply')
        await pg.evaluate("setDialogueSpeed('medium'); 1")

        check(not errs, f'page errors: {errs[:3]}')
        await b.close()
    print('a11y:', 'FAILED %d' % len(failures) if failures else 'all passed')
    sys.exit(1 if failures else 0)

asyncio.run(main())
