import asyncio, os, subprocess, sys, time
from playwright.async_api import async_playwright
from PIL import Image
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__))); ROOT=os.path.abspath(os.path.join(D,'..','..','..'))
EXE='/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
async def main():
    srv=subprocess.Popen([sys.executable,'-m','http.server','8768','--bind','127.0.0.1','-d',ROOT],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL); time.sleep(1)
    try:
        async with async_playwright() as p:
            b=await p.chromium.launch(executable_path=EXE)
            for page,tag in [('v1-radial','V1'),('v2-wind','V2'),('v3-smear','V3')]:
                for w,h in [(390,520),(1366,768)]:
                    ctx=await b.new_context(viewport={'width':w,'height':h}); pg=await ctx.new_page()
                    await pg.goto(f'http://127.0.0.1:8768/docs/perf/art18b/{page}.html'); await pg.wait_for_timeout(1200)
                    box=await pg.locator('#stage').bounding_box(); fr=[]
                    for i in range(12):
                        f=f'frames/{tag}-{w}-{i:02d}.png'; await pg.screenshot(path=os.path.join(D,f),clip={'x':box['x']-8,'y':box['y']-8,'width':box['width']+16,'height':box['height']+16}); fr.append(f); await pg.wait_for_timeout(70)
                    ims=[Image.open(os.path.join(D,f)).convert('P',palette=Image.ADAPTIVE) for f in fr]
                    ims[0].save(os.path.join(D,f'frames/{tag}-{w}.gif'),save_all=True,append_images=ims[1:],duration=110,loop=0)
                    await ctx.close()
            await b.close()
    finally: srv.terminate()
asyncio.run(main())
