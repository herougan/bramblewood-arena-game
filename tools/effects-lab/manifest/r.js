// Pages / conquest map / forge / raid batch lab registrations (2026-10-15 evening). Contract: docs/effects-lab-contract.md.
// The effect code lives in arena_app.js (mountCaveDark + mountCaveFires, raidBarsHTML, forgeTemperAnimation) and the game's
// stylesheet; these demos rebuild the same markup with the game's own classes, as manifest/e.js does for the map effects.
(function(){
const R = FXLAB.register;
const theme = (ctx, id)=>{ const l = ctx.map.layout; l.className = l.className.replace(/map-theme-\w+/, 'map-theme-' + id); return l; };
const hold = (ctx, ms)=> ctx.wait(ms || 4200);
const pct = el=> ({x: parseFloat(el.style.left), y: parseFloat(el.style.top)});
// The blot-out mask, as mountCaveDark builds it: the lantern's soft hole plus a tighter pool per light, intersected.
const mask = (lamp, pools)=> [`radial-gradient(circle at ${lamp.x}% ${lamp.y}%, transparent 0, transparent ${lamp.r*.45}px, rgba(0,0,0,.58) ${lamp.r*.9}px, rgba(0,0,0,.96) ${lamp.r*1.6}px, #000 ${lamp.r*2.6}px)`]
  .concat(pools.map(q=> `radial-gradient(circle at ${q.x}% ${q.y}%, transparent 0, transparent ${q.r*.38}px, rgba(0,0,0,.62) ${q.r*.85}px, #000 ${q.r*1.35}px)`)).join(', ');
const darkLayer = (ctx, cleared)=>{ const d = document.createElement('div'); d.className = 'cave-dark is-masked'; if(cleared) d.style.opacity = '.78'; ctx.map.el.appendChild(d);
  d.style.webkitMaskComposite = 'source-in'; d.style.maskComposite = 'intersect'; return d; };
const pools = ctx=>{ const out = []; if(ctx.map.pawn){ const p = pct(ctx.map.pawn); out.push({x:p.x, y:p.y, r:80}); }
  [ctx.map.nodes.available].filter(Boolean).forEach(n=>{ const p = pct(n); out.push({x:p.x, y:p.y, r:52}); });
  ctx.map.el.querySelectorAll('.cave-fire.is-lit').forEach(f=>{ const p = pct(f); out.push({x:p.x, y:p.y, r:66}); }); return out; };
const fire = (ctx, x, y, cls)=>{ const f = document.createElement('span'); f.className = 'cave-fire ' + (cls || ''); f.style.left = x + '%'; f.style.top = y + '%';
  f.innerHTML = '<i class="cf-glow"></i><i class="cf-stones"></i><i class="cf-logs"></i><i class="cf-flame"></i><i class="cf-flame cf-f2"></i><i class="cf-spark"></i>'; ctx.map.el.appendChild(f); return f; };
const lantern = (ctx, d, from, to, ms)=>{ const o = Object.assign({}, from); const paint = ()=>{ d.style.webkitMaskImage = d.style.maskImage = mask({x:o.x, y:o.y, r:150}, pools(ctx)); };
  paint(); ctx.gsap.to(o, Object.assign({duration:(ms || 3000)/1000, ease:'sine.inOut', onUpdate:paint}, to)); return paint; };

R({id:'map-cave-dark', stage:'map', inGameHook:'mountCaveDark (every dark map: caves, Sunken Depths, Mycelium Deep, Volcano Lair)', variants:[
  {key:'B', label:'2026-10-15: blotted out; light only at the lantern, the pawn and the open fight', play:ctx=>{ theme(ctx, 'm4'); const d = darkLayer(ctx); lantern(ctx, d, {x:20, y:60}, {x:80, y:30}, 3400); return hold(ctx, 3600); }}]});
R({id:'map-dark-cleared', stage:'map', inGameHook:'mountCaveDark on a cleared dark map (veil 0.78) + .conquest-layout.dark-cleared', variants:[
  {key:'B', label:'2026-10-15: cleared, the blot-out is partial and the fires burn', play:async ctx=>{ const l = theme(ctx, 'm4'); ctx.map.nodeList.forEach(n=> n.classList.add('done'));
    [[30, 40], [62, 70], [78, 22]].forEach(([x, y])=> fire(ctx, x, y, 'is-lit')); const d = darkLayer(ctx, true); lantern(ctx, d, {x:50, y:50}, {x:40, y:60}, 3000); await ctx.wait(500); l.classList.add('dark-cleared'); await ctx.wait(3000); }}]});
R({id:'map-cave-fires', stage:'map', inGameHook:'mountCaveFires (0–2 seeded fire pits per fight on a dark map; a fight cleared since the last look ignites them)',
  note:'User 2026-10-15: "In caves, fireplaces (0-2) placed around, light up as you defeat skirmishes."', variants:[
  {key:'A', label:'Cold pits in the dark ignite one by one and push the dark back', play:async ctx=>{ theme(ctx, 'm4'); const fs = [[28, 40], [44, 66], [70, 30]].map(([x, y])=> fire(ctx, x, y));
    const d = darkLayer(ctx), paint = lantern(ctx, d, {x:50, y:50}, {x:55, y:48}, 4200);
    for(const f of fs){ await ctx.wait(800); f.classList.add('is-lit', 'is-igniting'); ctx.sound('fireIgnite'); paint(); } await ctx.wait(1600); }},
  {key:'B', label:'Sunken Depths: glowing sea-lanterns instead of fires', play:async ctx=>{ theme(ctx, 'mj'); const fs = [[30, 45], [60, 62]].map(([x, y])=> fire(ctx, x, y, 'is-glow'));
    const d = darkLayer(ctx), paint = lantern(ctx, d, {x:45, y:50}, {x:50, y:52}, 3600);
    for(const f of fs){ await ctx.wait(800); f.classList.add('is-lit', 'is-igniting'); paint(); } await ctx.wait(1800); }}]});
R({id:'map-amb-mj', stage:'map', inGameHook:'art/maps/mj.png (tools/make_map_backgrounds.py mj)', variants:[
  {key:'B', label:'2026-10-15: repainted like the other maps (wreck, kelp, coral, glints), was a squashed AI picture', play:ctx=>{ theme(ctx, 'mj'); return hold(ctx, 3000); }}]});

// Raid: one bar per part with "X / Y HP left", phase marks and a Phase n of N chip (raidBarsHTML).
const part = (name, ic, left, total, bars)=>{ const ticks = Array.from({length: bars - 1}, (_, i)=> `<i class="rp-tick" style="left:${(i + 1)/bars*100}%"></i>`).join(''), phase = Math.min(bars, bars - Math.ceil(left/(total/bars) - 1e-9) + 1);
  return `<div class="r2-part"><div class="r2-part-head"><span class="r2-part-ico">${ic}</span><b>${name}</b><span class="r2-part-num">${Math.ceil(left/total*100)}%</span></div>
    <div class="rp-bars is-single"><span class="rp-bar"><span style="width:${left/total*100}%"></span>${ticks}</span></div>
    <div class="rp-legend"><span class="rp-left">❤️ <b>${left.toLocaleString()}</b> / ${total.toLocaleString()} <small>HP left</small></span><span class="rp-phase">Phase ${phase} of ${bars}</span></div></div>`; };
R({id:'raid-bars', stage:'ui', inGameHook:'raidPanelHTML → raidBarsHTML (2026-10-15)', variants:[
  {key:'C', label:'2026-10-15: one bar per part, X / Y HP left, phase marks', play:ctx=>{ const d = document.createElement('div'); d.style.cssText = 'position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); z-index:30; width:min(560px, 92%);';
    d.innerHTML = `<div class="panel raid2-panel" style="margin:0; padding:10px"><div class="r2-parts" style="grid-template-columns:1fr 1fr">${part('Left Tentacle', '🦑', 223872, 240000, 3)}${part('Core', '👁️', 640000, 640000, 8)}</div></div>`;
    ctx.root.appendChild(d); const fill = d.querySelector('.rp-bar > span'); ctx.gsap.fromTo(fill, {width:'100%'}, {width:(150000/240000*100) + '%', duration:2.4, ease:'power2.inOut'}); return ctx.wait(3000); }}]});

// Forge temper: each forge blow on its hammer impact, then straight to the shine (forgeTemperAnimation).
R({id:'meta-forge-temper', stage:'cards', inGameHook:'forgeTemper → forgeTemperAnimation (ProcFX.forge timeline)', variants:[
  {key:'B', label:'2026-10-15: the forge blows land on the hammer, then straight to the shine', play:ctx=>{ const row = ctx.root.querySelector('.fxl-cardrow'); if(row) row.style.display = 'none';
    const st = document.createElement('div'); st.className = 'anvil-stage'; st.style.cssText = 'position:relative; display:flex; align-items:center; justify-content:center; min-height:260px;';
    st.innerHTML = `<div class="forge-preview-wrap">${ctx.cards[2].outerHTML.replace('class="card-tile', 'class="card-tile forge-preview')}</div>`; ctx.root.appendChild(st);
    const card = st.querySelector('.card-tile'); if(!window.ProcFX || !ProcFX.forge) return ctx.wait(500);
    const f = ProcFX.forge(card, {seed:'lab-temper'}); if(!f || !f.tl) return ctx.wait(500); const tl = f.tl;
    [1.9, 2.45, 3.0].forEach((at, i)=> tl.call(()=> ctx.sound('forgeHit', i, i === 2), null, at + .15));
    tl.call(()=>{ tl.timeScale(2.2); tl.seek('temper', true); }, null, 3.4);
    tl.call(()=> ctx.sound('readyChime'), null, 'temper+=0.15');
    tl.call(()=> tl.timeScale(2), null, 'hammer');
    return new Promise(res=>{ tl.eventCallback('onComplete', ()=>{ try{ f.destroy(); }catch(e){} res(); }); tl.seek('heat').timeScale(3.5).play(); ctx.wait(5000).then(res); }); }}]});
})();
