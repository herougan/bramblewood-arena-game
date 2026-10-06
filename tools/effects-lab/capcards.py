import asyncio, json
from playwright.async_api import async_playwright
EXE='/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path=EXE); pg=await b.new_page()
        await pg.add_init_script("localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1');")
        await pg.goto('http://127.0.0.1:8765/index.html'); await pg.wait_for_timeout(1500)
        out = await pg.evaluate("""(()=>{ const d=getCardDefs(); const ids=Object.keys(d).filter(i=>d[i].art && !d[i].locked && !d[i].token && !d[i].hero);
          const pick=(pred)=> ids.find(i=>pred(d[i]));
          const byName=n=> ids.find(i=> i.includes(n));
          const sel={common:[byName('otter-centurion')||ids[0],'common'], rare:[byName('cobalt-talon')||ids[1],'rare'], epic:[byName('crimson-wing')||ids[2],'epic'], legendary:[byName('dragon')||byName('dominion')||ids[3],'legendary'], fire:[pick(x=>x.dmgType==='heat')||ids[4],null], bee:[byName('bee-knight')||ids[5],null], ant:[byName('soldier-ant')||ids[6],null]};
          const res={};
          for(const [k,[id,rar]] of Object.entries(sel)){ if(!id) continue; const dd=Object.assign({}, d[id], rar?{rarity:rar}:{}); res[k]={id, name:dd.name, rarity:dd.rarity, plain: cardTileHTML(dd, {inPlay:true}), holo: cardTileHTML(dd, {inPlay:true, extraClass: holoClass(dd)})}; }
          const castle=Object.values(CHARACTER_DEFS)[0]; res.castle={plain: matchCastleTileHTML(castle, 30, 30, 'preview','')};
          return res; })()""")
        json.dump(out, open('/home/claude/bramblewood-arena-game/.fxcat/cards.json','w'))
        print({k:(v.get('id'),v.get('rarity')) for k,v in out.items()})
        await b.close()
asyncio.run(main())
