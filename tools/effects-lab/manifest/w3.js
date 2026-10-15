// Content batch lab registrations (2026-10-16): the jumpers' entrances (hidden skirmish Type 2), and night giving way to day on the
// conquest map and on the battlefield. Contract: docs/effects-lab-contract.md. The effects live in bramblewood-fx-e.js
// (FX.E.jumperArrive, FX.E.nightRetreat, FX.E.dayNight); the demos call them on the stage's own map and board.
(function(){
const R = FXLAB.register, X = ()=> window.FX.E;
const pct = el=> ({x: parseFloat(el.style.left), y: parseFloat(el.style.top)});
// A jumper between the last cleared fight and the next one, as applyJumperSkirmishes places it (just off the old link).
function jumperOnStage(ctx, icon){
  const m = ctx.map, list = m.nodeList || [], from = (m.nodes.cleared || []).slice(-1)[0] || list[0], to = m.nodes.available || m.nodes.locked || list[list.length - 1];
  if(!from || !to || from === to) return null;
  const a = pct(from), b = pct(to), dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1;
  const n = to.cloneNode(true); n.classList.remove('done', 'selected', 'map-node-hidden', 'is-locked'); n.classList.add('is-jumper', 'kind-elite');
  n.dataset.lkey = n.dataset.nodekey = 'lab-J'; n.style.left = ((a.x + b.x)/2 - dy/L*7) + '%'; n.style.top = ((a.y + b.y)/2 + dx/L*7) + '%';
  const ico = n.querySelector('.map-node-ico'); if(ico) ico.textContent = icon; m.el.appendChild(n);
  // the re-routed trail: old fight → jumper → next fight
  const svg = m.el.querySelector('.map-trail-svg'), ns = 'http://www.w3.org/2000/svg';
  if(svg){ const p = pct(n); [[a, p, 'data-b'], [p, b, 'data-a']].forEach(([u, v, attr])=>{ const l = document.createElementNS(ns, 'line'); l.setAttribute('x1', u.x); l.setAttribute('y1', u.y); l.setAttribute('x2', v.x); l.setAttribute('y2', v.y); l.setAttribute(attr, 'lab-J'); svg.appendChild(l); }); }
  return {node: n, from: a, to: b};
}
const land = (ctx, kind, icon)=>{ const j = jumperOnStage(ctx, icon); if(!j) return ctx.wait(500); return X().jumperArrive(j.node, kind, {canvas: ctx.map.el, from: j.from, to: j.to, delay: 300}).then(()=> ctx.wait(1200)); };
R({id:'map-jumper-arrive', stage:'map', inGameHook:'jumperArrivals (arena_app.js) → fxHook(\'mapJumperArrive\', node, entrance, {canvas, from, to}) → FX.E.jumperArrive; once per save, the first time the map shows a jumper',
  note:'2026-10-16 (user: "It looks like 23-2 unlocks 23-3 but, boom. It animates onto the field (meteor, splash, psychic fade, ghost fade etc)"). The link starts inking to the next fight, the jumper lands across it, and the trail redraws through it. Each jumper picks its entrance (JUMPER_SKIRMISHES[].entrance).',
  variants:[
    {key:'A', label:'Meteor: Cinder Fall (19-J)', play:ctx=> land(ctx, 'meteor', '☄️')},
    {key:'B', label:'Splash: The Log That Moved (5-J)', play:ctx=> land(ctx, 'splash', '🐊')},
    {key:'C', label:'Psychic fade (not placed yet)', play:ctx=> land(ctx, 'psychic', '🔮')},
    {key:'D', label:'Ghost fade: The Pale Stag (13-J)', play:ctx=> land(ctx, 'ghost', '👻')},
  ]});
R({id:'map-night-retreat', stage:'map', inGameHook:'FX.E.dayNight when the phase changes from night to dawn or day (the clock or the Atmosphere setting; FX.E.watchTod checks every 20 s while the map is open)',
  note:'2026-10-16 (user: "Bars on the left -> no-go. I think the whole map lighting up is sufficient ... Maybe if the bars were softer and longer. And also not consistent, some of them are brighter than the other and very slightly (0.5%) different hue."). Clicking or switching maps no longer restarts the tint.',
  variants:[
    {key:'A', label:'Night → dawn: the map lights up, soft uneven light drifts across', play:async ctx=>{ X().dayNight(ctx.map.layout, ctx.map.el, 'night', {fresh:true, instant:true}); await ctx.wait(1000); X().dayNight(ctx.map.layout, ctx.map.el, 'dawn'); await ctx.wait(4600); }},
    {key:'B', label:'Night → day', play:async ctx=>{ X().dayNight(ctx.map.layout, ctx.map.el, 'night', {fresh:true, instant:true}); await ctx.wait(1000); X().dayNight(ctx.map.layout, ctx.map.el, 'day'); await ctx.wait(4600); }},
    {key:'C', label:'Night held across re-renders (no flash): re-applied 3 times', play:async ctx=>{ X().dayNight(ctx.map.layout, ctx.map.el, 'night', {fresh:true}); for(let i = 0; i < 3; i++){ await ctx.wait(1200); X().dayNight(ctx.map.layout, ctx.map.el, 'night'); } await ctx.wait(800); }},
  ]});
// The battlefield: night lifts as one gentle fade plus the same drifting light (syncNightVeil → fxHook('fieldNightLifts')).
function veilOn(ctx){ const bf = ctx.board.el; let v = bf.querySelector(':scope > .night-veil'); if(!v){ v = document.createElement('div'); v.className = 'night-veil no-anim is-on'; v.setAttribute('aria-hidden', 'true'); bf.insertBefore(v, bf.firstChild); void v.offsetWidth; v.classList.remove('no-anim'); } return v; }
R({id:'dark-night-veil-out', stage:'board', inGameHook:'renderVfxForEvent phase day → syncNightVeil (.night-veil.is-fading) + fxHook(\'fieldNightLifts\') → FX.E.nightRetreat',
  variants:[
    {key:'H', label:'2026-10-16: whole board lights up, soft uneven morning light drifts across (no ragged bars)', play:async ctx=>{ const v = veilOn(ctx); await ctx.wait(900); ctx.sound('dawnChime'); v.classList.add('is-fading'); X().nightRetreat(ctx.board.el, {n:7}); await ctx.wait(4400); }},
  ]});
})();
