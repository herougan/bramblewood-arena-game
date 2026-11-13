// UIFX1 lab registrations (2026-11-13): the places' entrances and ambience (bramblewood-ui-places.js, BramblewoodPlaces), one group
// "Places (UIFX1)". The rows are added here (they are not in the 10-15 inventory). Each play draws a small stand-in of the screen (the game's
// own scene classes) and plays the entrance inside the stage: A the full take (Effects Medium and High), B Effects Low, C the ambience.
(function(){
const L = window.FXLAB, P = ()=> window.BramblewoodPlaces; if(!L) return;
const AREA = 'Places (UIFX1)', HOOK = "switchTab → BramblewoodPlaces.enter(tab, #view-<tab>, {from}) (a tap skips; Effects None: nothing; reduced motion: a fade)";
const ROWS = [
  ['shop', 'shop', 'cart-scene', '🧳 Shops', 'The shop opens as a canvas tent', 'Entering the Shop', 'Indigo-and-canvas flaps part and tie back, lantern light and dust spill out, the valance lifts.', 'Lantern light flickers on the cart, dust in it, the awning stirs.'],
  ['premium', 'shop', 'cart-scene is-premium-shop', '🍂 Premium', 'The Premium shop opens as a gilded pavilion', 'Entering the Premium shop (its place on the strip, UI52, or a link that opens it)', 'Plum velvet drapes sweep up, the Gold Leaf crest unclasps, gold rays and gold leaves fall.', 'A warm gold light, a gold leaf drifting down now and then.'],
  ['nest', 'nest', 'nest-scene', '🪺 The Nest', 'The Nest: an egg hatches open', 'Entering the Nest', 'UI52: an egg in the nest\'s hollow wobbles, cracks, and its top flies off in warm light and down.', 'Down drifts past the edges now and then.'],
  ['codex', 'codex', '', '📖 Codex', 'The Codex: the great book opens', 'Entering the Codex (not the Forge, which keeps its own flare)', 'UI52: the closed book in the middle opens on its spine and slides so the spine sits in the middle, then one page turns on it.', 'A slanting shaft of library light with dust in it.'],
  ['deck', 'deck', 'tent-scene', '⛺ Camp', 'The Camp: the tent door rolls up', 'Entering the Camp (decks)', 'The red tent door rolls up on its roll, its ties shorten as it climbs, the campfire glows and sparks.', 'The campfire glow breathes along the floor, a few embers rise.'],
  ['stomp', 'stomp', 'stomp-scene map-theme-marena', '🐾 Stomping Grounds', 'The Stomping Grounds: the arena gates swing open', 'Entering the Stomping Grounds (the Hero Hall)', 'UI52: the timber gates, hinged at the sides, swing open toward you and out of sight; sunlight and sand dust come through.', ''],
  ['inventory', 'inventory', 'satchel-scene', '🎒 Inventory', 'The Inventory: the satchel opens', 'Entering the Inventory', 'UI52: the satchel pops up, its flap flips open over the top and a few of your things hop out.', ''],
];
// a stand-in of the screen, with the game's scene classes, so the entrance has something to reveal
function screen(ctx, tab, cls, sign){
  const v = document.createElement('div'); v.id = 'view-' + tab; if(cls) v.className = cls; v.dataset.sign = sign;
  v.style.cssText = 'position:absolute; inset:0; margin:0; padding-top:56px; overflow:hidden; transform:translateZ(0);'; // translateZ: a fixed ambience stays in the stage
  v.innerHTML = (tab === 'shop' ? '<div class="cart-doodads" aria-hidden="true"><i class="cd-lantern is-l"></i><i class="cd-lantern is-r"></i><div class="cd-floor"><i class="cd-crate"></i><i class="cd-barrel"></i></div></div>' : '')
    + `<div class="panel" style="margin:8px 16px"><h2 style="margin:0 0 6px">${sign}</h2><p class="panel-sub" style="margin:0">🃏 🥚 📦 🍞 🧪</p></div>`;
  ctx.root.appendChild(v); return v;
}
ROWS.forEach(([kind, tab, cls, sign, name, trigger, look, ambience])=>{
  const id = 'place-' + kind;
  if(!L.byId.has(id)){ const e = {id, area:AREA, name, trigger, current:'', quality:'good', priority:2, themeNotes:look, variantsSuggested:false, future:false, batch:'UIFX1', status:'live', added:'2026-11-13', inGameHook:HOOK};
    L.inventory.push(e); L.byId.set(id, e); }
  const play = level=> ctx=>{
    if(!P()) return;
    P().stop(); // the last play's ambience (the stage it lived in is already gone)
    const v = screen(ctx, tab, cls, sign), had = Object.prototype.hasOwnProperty.call(window, 'fxLevel'), old = window.fxLevel;
    if(level) window.fxLevel = ()=> level;
    const done = P().enter(tab, v, {host:ctx.root, force:true, rate:ctx.speed});
    if(level){ if(had) window.fxLevel = old; else delete window.fxLevel; }
    return done;
  };
  const variants = [{key:'A', label:'Entrance: ' + look, play:play(null)}, {key:'B', label:'Effects Low: the short, plain take (no light, no particles, no ambience)', play:play('low')}];
  if(ambience) variants.push({key:'C', label:'While open: ' + ambience, play:ctx=>{ if(!P()) return; P().stop(); const v = screen(ctx, tab, cls, sign); P().ambient(tab, v);
    const f = document.querySelector('body > .bwp-amb.is-fixed'); if(f) v.appendChild(f); // the Codex's light is fixed to the window in the game; here it stays in the stage
    return new Promise(r=> setTimeout(r, 6000)).then(()=> P().stop()); }}); // a plain 6 s (under the Lab's 12 s cap), then everything off
  L.register({id, stage:'screen', inGameHook:HOOK, note:'A tap on the stage skips it, as in the game. Settings: Effects None plays nothing; reduced motion a plain fade.', variants});
});
})();
