# Screenshots every mock page at 1366x860 and 390x844 (run: python3 -I shoot.py [name ...]); no game code involved.
import sys, pathlib
from playwright.sync_api import sync_playwright
here = pathlib.Path(__file__).resolve().parent
names = sys.argv[1:] or [p.stem for p in sorted(here.glob('*.html'))]
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    for n in names:
        page, _, frag = n.partition('#')           # 'shop#open' -> shop.html#open, shop-open-<w>.png
        out = f'{page}-{frag}' if frag else page
        for w, h in ((1366, 860), (390, 844)):
            pg = b.new_page(viewport={'width': w, 'height': h}, device_scale_factor=1)
            pg.goto(f'file://{here}/{page}.html' + (f'#{frag}' if frag else '')); pg.wait_for_timeout(500)
            pg.screenshot(path=str(here / f"{out}-{w}.png"), full_page=True); pg.close()
    b.close()
