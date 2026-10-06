#!/usr/bin/env python3
"""Snap DEBUG variant (2026-10-06): same as snaps.py, but each jump report carries the card's last 25
frames (position, pin, transform, siblings' pin/tween state) and recent row mutations. Run one config:
    python3 tests/e2e/snaps_debug.py 2-4 390 844 1 140

Original: Snap check (2026-10-05, "cards sometimes teleport to the right"): plays real matches and watches
every board card, hand card and castle tile each animation frame. A card that moves more than
12px in one frame while nothing is animating it is a snap. Desktop and phone, normal and 3x speed.
    python3 tests/e2e/snaps.py
"""
import asyncio, json, sys
from playwright.async_api import async_playwright
TURN_JS="""async()=>{ const m=matchState; if(!m) return 'none'; if(m.over) return 'over'; if(m.resolving) return 'busy';
  if(m.active!==1 || (m.turnDone && m.turnDone[1])) return 'wait';
  const me = m.players[1]; const hs = me.hand.filter(x=> m.engine.canPlay(me, x.defId, x.uid));
  if(hs.length && Math.random()<0.85){ const h=hs[Math.floor(Math.random()*hs.length)]; await playCardByUid(h.uid, ['left','right'][Math.floor(Math.random()*2)]); return 'play'; }
  if(me.hand.length && !me.discardUsedThisTurn && Math.random()<0.5){ await discardCardByUid(me.hand[0].uid); return 'discard'; }
  await skipTurn(); return 'skip'; }"""
WATCH="""(()=>{ window.__jumps=[]; window.__lastRender=null;
  const orig=window.renderBoard; window.renderBoard=function(o){ window.__lastRender={t:Math.round(performance.now()), o:JSON.stringify(o||{}).slice(0,60), st:(new Error().stack||'').split('\\n').slice(2,5).map(x=>x.trim().replace(/\\(.*index.html:/,'(')).join(' | ')}; return orig.apply(this, arguments); };
  const origR=window.renderHand; if(origR) window.renderHand=function(){ window.__lastHand=Math.round(performance.now()); return origR.apply(this, arguments); }; const last=new WeakMap(); const hist=new WeakMap(); window.__mut=[]; const mo=new MutationObserver(ms=>ms.forEach(mm=>{ if(mm.type==='childList') window.__mut.push({t:Math.round(performance.now()), tgt:(mm.target.id||mm.target.className||'').toString().slice(0,30), add:mm.addedNodes.length, rem:mm.removedNodes.length}); })); ['rowMine','rowEnemy'].forEach(id=>{ const r=document.getElementById(id); if(r) mo.observe(r,{childList:true}); }); setInterval(()=>{ ['rowMine','rowEnemy'].forEach(id=>{ const r=document.getElementById(id); if(r && !r.__obs){ r.__obs=1; mo.observe(r,{childList:true}); } }); },50); let lastInner=null;
  const busy = el => el.classList.contains('is-entering') || el.style.position==='absolute' || (window.gsap && gsap.isTweening(el)) || (el.getAnimations && el.getAnimations().some(a=>a.playState==='running'));
  function tick(){
    const inner=document.getElementById('battlefieldInner'); const ir=inner?inner.getBoundingClientRect():null;
    const camMoved = lastInner && ir && (Math.abs(ir.left-lastInner.left)>0.5 || Math.abs(ir.top-lastInner.top)>0.5 || Math.abs(ir.width-lastInner.width)>0.5);
    lastInner = ir;
    const groups=[['board','#rowMine .board-card, #rowEnemy .board-card'],['hand','#handStrip .card-tile, #handStrip > *'],['castle','[data-hq]']];
    groups.forEach(([g,sel])=> document.querySelectorAll(sel).forEach(el=>{
      const r=el.getBoundingClientRect(); if(!r.width) return; const p=last.get(el); const b=busy(el); const H=hist.get(el)||[]; H.push({t:Math.round(performance.now()), x:Math.round(r.left), b, pos:el.style.position, tf:el.style.transform.slice(0,40), cls:el.className.slice(11,60), sib:[...el.parentNode.children].indexOf(el)+'/'+el.parentNode.children.length, sp:[...el.parentNode.children].map(c=>(c.style.position[0]||'-')+(c.classList.contains('is-entering')?'E':'')+(window.gsap&&gsap.isTweening(c)?'T':'')).join(' '), fl:(typeof flippingEls!=='undefined')&&flippingEls.has(String(el.dataset.uid)), rowW:Math.round(el.parentNode.getBoundingClientRect().width), rowX:Math.round(el.parentNode.getBoundingClientRect().left)}); if(H.length>40) H.shift(); hist.set(el,H);
      if(p && !b && !p.b && !(g==='board' && camMoved) && Math.abs(r.width-p.w)<2){
        const dx=r.left-p.x, dy=r.top-p.y;
        if(Math.abs(dx)>12 || Math.abs(dy)>12) window.__jumps.push({t:Math.round(performance.now()), hudH: (document.querySelector('#view-play .hud')||{}).offsetHeight, bp:(document.querySelector('.bottom-play-row')||{}).offsetWidth, sw:document.documentElement.clientWidth, sh:document.documentElement.scrollHeight, aw:(document.getElementById('appWrap')||{}).className, g, id:el.dataset.uid||el.dataset.handuid||el.dataset.hq||'', dx:Math.round(dx), dy:Math.round(dy), round:matchState&&matchState.round, cls:(el.className||'').toString().slice(0,60), render:window.__lastRender, flip:(typeof flippingEls!=='undefined')&&flippingEls.has(String(el.dataset.uid)), tf:el.style.transform, hist:(hist.get(el)||[]).slice(-25), mut:window.__mut.slice(-12)});
      }
      last.set(el,{x:r.left,y:r.top,w:r.width,b});
    }));
    requestAnimationFrame(tick);} requestAnimationFrame(tick); })()"""
async def main(node, vw, vh, speed, n):
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell')
    pg=await b.new_page(viewport={'width':vw,'height':vh}); errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
    await pg.add_init_script("localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1'); localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','skill-flying']));")
    await pg.goto('file://'+__import__('os').path.abspath(__import__('os').path.join(__import__('os').path.dirname(__file__),'..','..','index.html'))+''); await pg.wait_for_timeout(1300)
    mp = 'm'+node.split('-')[0]
    await pg.evaluate(f"(()=>{{ FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); switchTab('play'); startConquestMatch('{mp}','{node}'); matchState.speedMult={speed}; return 1}})()")
    await pg.wait_for_timeout(600)
    await pg.evaluate(WATCH)
    for i in range(n):
      r=await pg.evaluate(TURN_JS)
      if r=='over': break
      await pg.wait_for_timeout(100)
    j=await pg.evaluate("window.__jumps"); 
    from collections import Counter
    print(f'{node} {vw}x{vh} x{speed} round', await pg.evaluate("matchState && matchState.round"), 'jumps', len(j), '', dict(Counter(x['g'] for x in j)))
    import json
    for x in j[:3]: print(json.dumps(x, indent=0)[:6000])
    if errs: print('  ERR', errs[:3])
    await b.close()
RUNS=[('2-3',1366,860,1,140),('2-5',1366,860,3,160),('2-4',390,844,1,140),('1-4',390,844,3,140)]
async def all_runs():
  import io, contextlib
  bad=0
  for r in RUNS:
    buf=io.StringIO()
    with contextlib.redirect_stdout(buf): await main(*r)
    out=buf.getvalue(); print(out.strip().splitlines()[0])
    if 'jumps 0 ' not in out or 'ERR' in out: bad+=1; print(out)
  print(f'snaps: {bad} failure(s)'); sys.exit(1 if bad else 0)
if __name__=='__main__':
  if len(sys.argv)>5: a=sys.argv; asyncio.run(main(a[1], int(a[2]), int(a[3]), float(a[4]), int(a[5])))
  else: asyncio.run(all_runs())
