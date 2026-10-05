#!/usr/bin/env python3
"""Translation layer check (2026-10-05): every pack loads, the Home "Play" button translates in each
language, untranslated text stays English, and switching back to English restores the originals.
    python3 tests/e2e/i18n.py
"""
import asyncio, json, os, sys
from playwright.async_api import async_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
EXE = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
async def main():
    bad = []
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=EXE)
        pg = await b.new_page(viewport={'width':1280, 'height':800}); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.add_init_script("localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1');")
        await pg.goto('file://' + os.path.join(ROOT, 'index.html')); await pg.wait_for_timeout(1300)
        await pg.evaluate("FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); switchTab('home')")
        langs = await pg.evaluate("BramblewoodI18n.LANGS.map(l=>l.code)")
        playSel = "document.querySelector('.home-play span:last-child').textContent.trim()"
        for code in langs:
            if code == 'en': continue
            want = json.load(open(os.path.join(ROOT, 'lang', code + '.json'), encoding='utf-8')).get('Play')
            got_lang = await pg.evaluate(f"setGameLanguage('{code}').then(()=> BramblewoodI18n.current())"); await pg.wait_for_timeout(300)
            txt = await pg.evaluate(playSel)
            if got_lang != code: bad.append(f'{code}: pack did not load')
            elif txt != want: bad.append(f'{code}: Play shows {txt!r}, expected {want!r}')
        await pg.evaluate("setGameLanguage('en')"); await pg.wait_for_timeout(300)
        if await pg.evaluate(playSel) != 'Play': bad.append('switching back to English did not restore "Play"')
        if errs: bad.append('page errors: ' + '; '.join(errs[:3]))
        await b.close()
    for x in bad: print('  FAIL', x)
    print(f'i18n: {len(bad)} failure(s) across {len(langs)-1} languages'); sys.exit(1 if bad else 0)
asyncio.run(main())
