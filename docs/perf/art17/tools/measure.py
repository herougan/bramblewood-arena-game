#!/usr/bin/env python3
"""ART17-T: measure the prototype pages in headless Chromium. python3 tools/measure.py [runs]"""
import asyncio, os, sys, json, statistics, subprocess, time
from playwright.async_api import async_playwright
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXE=os.environ.get('BW_CHROMIUM','/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell')
PORT=8765; RUNS=int(sys.argv[1]) if len(sys.argv)>1 else 3
SECS=6
PROBE="""()=>new Promise(res=>{const d=[];let l=performance.now(),end=l+%d;(function f(t){d.push(t-l);l=t;if(t<end)requestAnimationFrame(f);else res(d)})(l)})"""
async def one(b,page,w,h,slow):
    ctx=await b.new_context(viewport={'width':w,'height':h},device_scale_factor=1)
    p=await ctx.new_page(); c=await ctx.new_cdp_session(p)
    await c.send('Performance.enable'); 
    if slow>1: await c.send('Emulation.setCPUThrottlingRate',{'rate':slow})
    await p.goto(f'http://127.0.0.1:{PORT}/{page}'); await p.wait_for_timeout(1500)
    layers=[]
    c.on('LayerTree.layerTreeDidChange',lambda e:layers.append(e.get('layers') or []))
    await c.send('LayerTree.enable'); await p.wait_for_timeout(400)
    def m(r): return {x['name']:x['value'] for x in r['metrics']}
    a=m(await c.send('Performance.getMetrics'))
    d=await p.evaluate(PROBE%(SECS*1000))
    z=m(await c.send('Performance.getMetrics'))
    cpu=(z['TaskDuration']-a['TaskDuration'])*1000/SECS
    scr=(z['ScriptDuration']-a['ScriptDuration'])*1000/SECS
    sty=((z['RecalcStyleDuration']-a['RecalcStyleDuration'])+(z['LayoutDuration']-a['LayoutDuration']))*1000/SECS
    d=d[2:]; over=sum(1 for x in d if x>16.7+0.5)
    L=layers[-1] if layers else []
    mem=sum(l['width']*l['height']*4 for l in L if l.get('drawsContent'))/1048576
    nl=sum(1 for l in L if l.get('drawsContent'))
    await ctx.close()
    return dict(cpu=cpu,script=scr,style_layout=sty,over=over/len(d)*100,frames=len(d)/SECS,mem=mem,layers=nl,p95=sorted(d)[int(len(d)*.95)])
async def main():
    srv=subprocess.Popen([sys.executable,'-m','http.server',str(PORT),'--bind','127.0.0.1','-d',D],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL); time.sleep(1)
    out={}
    try:
        async with async_playwright() as p:
            b=await p.chromium.launch(executable_path=EXE,args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
            for page in ['c-control.html','a-layered.html','b-flat.html']:
                for (w,h) in [(390,844),(1366,768)]:
                    for slow in (1,4):
                        rs=[await one(b,None,w,h,slow) if False else await one(b,page,w,h,slow) for _ in range(RUNS)]
                        key=f'{page} {w} x{slow}'
                        out[key]={k:round(statistics.median(r[k] for r in rs),2) for k in rs[0]}
                        print(key,out[key],flush=True)
            await b.close()
    finally: srv.terminate()
    json.dump(out,open(os.path.join(D,'measure.json'),'w'),indent=1)
asyncio.run(main())
