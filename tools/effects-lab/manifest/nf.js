// Package NF lab registrations (2026-10-18, owner 23:37: "Forging your energy should have an amazing energy and animation.").
// Contract: docs/effects-lab-contract.md.
//   meta-forge-energy  FX.D.energyForge: a Max Energy step bought in the Forge's ⬆️ Upgrades tab (wireStamina → energyForgeCelebrate
//                      in arena_app.js). The stage gets the game's own ⚡ Max Energy panel (staminaPanelHTML's markup) and the ⚡ pill.
(function(){
const R = FXLAB.register, X = ()=> window.FX.D;
// the panel as staminaPanelHTML('forge') writes it, at `to` with `on` of its 4 steps bought
const panelHTML = (to, on)=> `<section class="stamina-panel" aria-label="Max Energy"><h3>⚡ Max Energy <b>${to}</b></h3>
  <p>Temper your stamina at the Forge: +5 max Energy a step, from 30 up to 50.</p>
  <div class="wp-stam-row"><span class="wp-stam-pips">${[0, 1, 2, 3].map(i=> `<i class="${i < on ? 'on' : ''}"></i>`).join('')}</span>
  <button type="button" class="btn small primary">Raise to ${to + 5}</button></div></section>`;
const mount = (ctx, to, on)=>{
  const host = document.createElement('div'); host.style.cssText = 'position:absolute; left:50%; top:58%; transform:translate(-50%, -50%); width:min(520px, 92%);';
  host.innerHTML = panelHTML(to, on); (ctx.root || document.body).appendChild(host); return host.querySelector('.stamina-panel'); };
const pill = ctx=> (ctx.ui && ctx.ui.pills && ctx.ui.pills.energy) || null;
const play = (from, to, on, calm)=> ctx=>{ const el = mount(ctx, to, on);
  return X().energyForge(el, {from, to, max:60, calm, hud: pill(ctx), sound: ctx.sound, label: `⚡ Max Energy ${to}!`}).then(()=> ctx.wait(300)); };
R({id:'meta-forge-energy', stage:'ui', duration:3600,
  inGameHook:'Forge → ⬆️ Upgrades → ⚡ Max Energy → Raise to N: wireStamina → energyForgeCelebrate (arena_app.js) → FX.D.energyForge (calm under reduced motion, Effects Off / Low, no GSAP)',
  note:'The room dims, motes gather into a bar laid over the panel, it charges from the old max to the new one with lightning along it and sparks off its head, overflows (a flash, drops of light spill off the end), a shockwave, the new pip pops, the number counts up and a bolt leaps to the ⚡ pill. Sound: SoundKit.energySurge charge / overflow / boom.',
  variants:[
    {key:'A', label:'Forge step 1: 30 → 35', play:play(30, 35, 1, false)},
    {key:'B', label:'The last Forge step: 45 → 50', play:play(45, 50, 4, false)},
    {key:'C', label:'Calm (reduced motion or Effects Low): a gold glow, the new pip brightens, one chime', play:play(30, 35, 1, true)},
  ]});
})();
