// W4 lab registrations (2026-10-16): map title cards and map grandeur (FX.G, bramblewood-fx-g.js), and the fun set.
// Entries here are new (ids map-title-*, map-grand-*, fun-*), so they carry their own name/trigger (fxlab-core register()).
// User, 2026-10-16: "I like having more map effects and title effects. Could be cool to give grandeur to a map." and
// "Any other VFX playground items to add in each? Invent more for fun?"
(function(){
const R = FXLAB.register, X = ()=> window.FX.G;
const theme = (ctx, id)=>{ const l = ctx.map.layout; l.className = l.className.replace(/map-theme-\w+/, 'map-theme-' + id); return l; };
const HOOK = "renderConquestSubTab → fxHook('mapTitle', #conquestLayout, map): the first time a map is opened in a session (Medium effects and up)";
// One representative map per theme: [theme, map id (for its art), name, icon, subtitle]
const MAPS = [
  ['forest', 'm1', 'Bramblewood Outskirts', '🌲', 'Map 1'], ['meadow', 'mq', 'Clovermead', '🍀', 'Side map'], ['beach', 'mb', 'Pebble Beach', '🏖️', 'Map 3'],
  ['water', 'mp', 'Lilypad Reach', '🪷', 'Side map'], ['reef', 'm7', 'Coral Current', '🐠', 'Map 11'], ['swamp', 'mw', 'Gatorback Swamp', '🐊', 'Map 6'],
  ['mist', 'ms', 'The Sunken Grove', '🌳', 'Side map'], ['fungal', 'mu', 'The Morel Hollow', '🍄', 'Map 8'], ['cave', 'm4', 'Caves & Alcoves', '🦇', 'Map 9'],
  ['crystal', 'mn', 'The Glimmer Depths', '💎', 'Side map'], ['alpine', 'm10', 'Eyrie Heights', '🏔️', 'Map 12'], ['tundra', 'm6', 'Wolfsbane Tundra', '🐺', 'Map 18'],
  ['desert', 'md', 'The Glass Dunes', '🏜️', 'Map 19'], ['savanna', 'm5', 'Savanna Reaches', '🌾', 'Map 15'], ['volcano', 'm11', 'The Sundered Peak', '🌋', 'Map 21'],
  ['forge', 'm9', 'Basalt Foundry', '🪨', 'Side map'], ['night', 'm21', 'The Quiet Summit', '🏔️', 'Map 22']];
const STYLE_LABEL = {banner:'Ribbon banner with a medallion', ink:'Ink-brush calligraphy with a red seal', cinema:'Cinematic letterbox, the name spreads in'};
MAPS.forEach(([k, id, name, icon, sub])=>{
  const T = (X() && X().THEMES[k]) || {label:k, style:'banner', p:'', grand:[]};
  const used = Object.keys(X() ? X().THEME_OF : {}).filter(m=> X().THEME_OF[m] === k).join(', ');
  R({id:'map-title-' + k, name:`Map title: ${T.label}`, stage:'map', trigger:`Entering a ${T.label.toLowerCase()} map for the first time in a session (${used || id})`, inGameHook:HOOK,
    note:`Particles: ${T.p}. Flourish: ${T.grand.join(' + ')}. The game uses ${({banner:'A', ink:'B', cinema:'C'})[T.style]} (${T.style}) here; tap the map to hurry it.`,
    variants:['banner', 'ink', 'cinema'].map((st, i)=> ({key:'ABC'[i], label:STYLE_LABEL[st] + (st === T.style ? ' (game default)' : ''),
      play:ctx=>{ theme(ctx, id); return X().mapTitle(ctx.map.layout, {theme:k, name, icon, sub, style:st}); }}))});
});
// The Volcano Lair: a dragon's shadow passes under the title.
R({id:'map-title-volcano-lair', name:'Map title: Volcano Lair (with the dragon)', stage:'map', trigger:'Entering the Volcano Lair (mx) for the first time in a session', inGameHook:HOOK,
  note:'The only map with an extra flourish: the dragon shadow sweeps over while the title is up.',
  variants:[{key:'A', label:'Cinematic title + dragon shadow + embers', play:ctx=>{ theme(ctx, 'mx'); return X().mapTitle(ctx.map.layout, {theme:'volcano', name:'Volcano Lair', icon:'🐉', sub:'Side map', extra:['dragonShadow']}); }}]});

// ---- grand flourishes on their own ----
const GR = (id, name, trig, vs)=> R({id:'map-grand-' + id, name, stage:'map', trigger:trig, inGameHook:'Part of the map title sequence (FX.G.mapGrand); FX.G.' + id + '(host, {theme}) on its own',
  variants:vs.map(([key, label, mapId, opts])=> ({key, label, play:ctx=>{ theme(ctx, mapId); return X()[opts.fn || id](ctx.map.layout, Object.assign({ms:4200}, opts)); }}))});
GR('godRays', 'God rays', 'Forest, meadow and savanna titles', [['A', 'Green-gold shafts through the canopy', 'm1', {theme:'forest'}], ['B', 'Warm savanna light', 'm5', {theme:'savanna'}], ['C', 'Pink meadow haze', 'mq', {theme:'meadow'}]]);
GR('birds', 'Birds crossing', 'Forest, meadow, lake titles; gulls on the beach, an eagle on the peaks, bats in caves, a school of fish on the reef', [['A', 'A V of birds', 'm1', {theme:'forest'}], ['B', 'Gulls over the beach', 'mb', {theme:'beach', fn:'gulls'}],
  ['C', 'One eagle gliding', 'm10', {theme:'alpine', fn:'eagle'}], ['D', 'Bats pour out', 'm4', {theme:'cave', fn:'bats'}], ['E', 'A school of fish', 'm7', {theme:'reef', fn:'fish'}]]);
GR('silhouettes', 'Distant silhouettes', 'Swamp, mist, alpine, tundra, desert, savanna, volcano and forge titles', [['A', 'Pines', 'm1', {theme:'forest', sil:'pines'}], ['B', 'Mountain peaks', 'm10', {theme:'alpine'}], ['C', 'Dunes', 'md', {theme:'desert'}],
  ['D', 'Dead trees in mist', 'ms', {theme:'mist'}], ['E', 'Acacias', 'm5', {theme:'savanna'}], ['F', 'The volcano', 'm11', {theme:'volcano'}], ['G', 'Giant mushrooms', 'mu', {theme:'fungal', sil:'shrooms'}], ['H', 'Stalactites (from the top)', 'm4', {theme:'cave', sil:'stalactites'}]]);
GR('haze', 'Parallax haze', 'Swamp, mist and fungal titles', [['A', 'Mist banks drifting at three speeds', 'ms', {theme:'mist'}], ['B', 'Violet spore haze', 'mu', {theme:'fungal'}]]);
GR('cloudShadows', 'Cloud shadows', 'An idea for open maps: soft cloud shadows slide over the ground', [['A', 'Three shadows pass', 'm5', {theme:'savanna'}]]);
GR('aurora', 'Aurora sky', 'Tundra and night titles', [['A', 'Green and violet curtains', 'm6', {theme:'tundra'}], ['B', 'Over the Quiet Summit', 'm21', {theme:'night'}]]);
GR('caustics', 'Water light (caustics)', 'Lake and reef titles', [['A', 'Underwater shafts and rippling rings', 'm7', {theme:'reef'}], ['B', 'Lily pond', 'mp', {theme:'water'}]]);
GR('heatHaze', 'Heat haze', 'Desert and volcano titles', [['A', 'Volcanic glow from below', 'm11', {theme:'volcano'}], ['B', 'Desert shimmer', 'md', {theme:'desert'}]]);
GR('glowPulse', 'Glow pulse', 'Fungal, crystal and forge titles', [['A', 'Spore light', 'mu', {theme:'fungal'}], ['B', 'Forge heat', 'm9', {theme:'forge'}]]);
GR('lanternBeam', 'Lantern beam', 'Cave titles', [['A', 'A swinging lantern cone', 'm4', {theme:'cave'}]]);
GR('prism', 'Prism light', 'Crystal titles', [['A', 'Rainbow streaks through the crystals', 'mn', {theme:'crystal'}]]);
GR('sunGlints', 'Sun on the water', 'Beach titles', [['A', 'A low sun and glints on the sea', 'mb', {theme:'beach'}]]);
GR('shootingStar', 'Shooting stars', 'Night titles', [['A', 'Three meteors', 'm21', {theme:'night'}]]);
GR('dragonShadow', 'Dragon shadow pass', 'The Volcano Lair title; could also warn of a dragon boss on any map', [['A', 'A vast shadow sweeps over and the ground darkens', 'mx', {theme:'volcano'}], ['B', 'Over a peaceful meadow', 'm1', {theme:'forest'}]]);
// the drifting particles, two entries of eight (the lab plays up to eight variants per entry)
const DRIFT = [['leaves', 'Falling leaves', 'm1', 'forest'], ['petals', 'Petals and pollen', 'mq', 'meadow'], ['waves', 'Waves along the shore', 'mb', 'beach'], ['ripples', 'Ripples', 'mp', 'water'],
  ['bubbles', 'Bubbles', 'm7', 'reef'], ['fireflies', 'Fireflies', 'mw', 'swamp'], ['mist', 'Rolling mist', 'ms', 'mist'], ['spores', 'Glowing spores', 'mu', 'fungal'],
  ['dust', 'Dust and drips', 'm4', 'cave'], ['glints', 'Crystal glints', 'mn', 'crystal'], ['clouds', 'Cloud wisps', 'm10', 'alpine'], ['frost', 'Snow and frost corners', 'm6', 'tundra'],
  ['sand', 'Blown sand', 'md', 'desert'], ['grass', 'Grass seeds', 'm5', 'savanna'], ['embers', 'Embers and ash', 'm11', 'volcano'], ['sparks', 'Forge sparks', 'm9', 'forge'], ['stars', 'Twinkling stars', 'm21', 'night']];
[[0, 8, 'map-grand-drift', 'Map particles (I)'], [8, 16, 'map-grand-drift-2', 'Map particles (II)'], [16, 17, 'map-grand-drift-3', 'Map particles (III)']].forEach(([a, b, id, name])=>
  R({id, name, stage:'map', trigger:'The particles that drift through each theme’s title', inGameHook:'Part of the map title sequence; FX.G.particles(host, {kind})',
    variants:DRIFT.slice(a, b).map(([kind, label, mapId, th], i)=> ({key:'ABCDEFGH'[i], label, play:ctx=>{ theme(ctx, mapId); return X().particles(ctx.map.layout, {theme:th, kind, n:30, ms:2600, hold:4400}); }}))}));
// ---- the fun set (2026-10-16): ideas, built for real; "Could be used for" says where each might go in the game ----
const F = (id, name, stage, use, vs)=> R({id:'fun-' + id, name, stage, trigger:'Could be used for: ' + use, inGameHook:'Not hooked in yet (an idea to pick from); FX.G.' + vs[0][2],
  variants:vs.map(([key, label, fn, args])=> ({key, label, play:ctx=> X()[fn](...args(ctx))}))});
const c = ctx=> ctx.cards, bm = ctx=> ctx.board.mine, bf = ctx=> ctx.board.foe;
F('firework-reveal', 'Firework card reveal', 'cards', 'a Legendary or better pulled from a pack; a new card unlocked', [['A', 'One rocket, one burst, the card is revealed', 'fireworkReveal', ctx=> [c(ctx)[2]]], ['B', 'The finale: three bursts', 'fireworkReveal', ctx=> [c(ctx)[2], {finale:true}]]]);
F('card-tornado', 'Card-flip tornado', 'cards', 'shuffling a deck; a Tornado or Whirlwind skill; the Wanderer’s card swap', [['A', 'The cards whirl up a funnel and drop back', 'cardTornado', ctx=> [c(ctx)]]]);
F('ink-brush-reveal', 'Ink-brush reveal', 'cards', 'an Eastern-themed event or set; revealing a hidden card', [['A', 'Brush strokes on rice paper, the paper tears open, a seal', 'inkBrushReveal', ctx=> [c(ctx)[1]]]]);
F('classified', 'Classified stamp', 'cards', 'a spy-themed event; Stealth units; a hidden quest reward', [['A', 'Redaction bars, then CLASSIFIED slams down', 'classifiedStamp', ctx=> [c(ctx)[0]]], ['B', 'A dossier folder: EYES ONLY', 'classifiedStamp', ctx=> [c(ctx)[0], {variant:'B'}]]]);
F('stained-glass', 'Stained-glass shatter', 'cards', 'a Holy or Cathedral card dying; breaking a seal or ward', [['A', 'Leaded panes light up, then shatter and fall', 'stainedGlass', ctx=> [c(ctx)[3]]]]);
F('origami-crane', 'Origami crane', 'cards', 'sending a card away (trade, gift, dismiss); a paper or Wind unit', [['A', 'The card folds into a paper crane and flies off, then unfolds back', 'origamiCrane', ctx=> [c(ctx)[1]]]]);
F('slot-reveal', 'Slot-machine stats', 'cards', 'the Wanderer’s gamble; a Chance node; rolling random stats', [['A', 'Three reels spin and stop on ⭐⭐⭐, coins jump', 'slotReveal', ctx=> [c(ctx)[1]]]]);
F('pixel-beam', 'Pixel beam-out', 'cards', 'teleport or Blink skills; banishing a card; a retro event', [['A', 'The card breaks into pixels, beams up, and reassembles', 'pixelBeam', ctx=> [c(ctx)[2]]]]);
F('hologram', 'Hologram call', 'cards', 'a messenger or scout portrait in dialogue; previewing an enemy', [['A', 'An emitter projects the card as a flickering cyan hologram', 'hologram', ctx=> [c(ctx)[0]]]]);
F('snow-globe', 'Snow globe', 'cards', 'Winter season rewards; Freeze in a cosy way; a gift card', [['A', 'A glass dome drops over the card, shakes, snow settles', 'snowGlobe', ctx=> [c(ctx)[1]]]]);
F('comet-arrival', 'Comet arrival', 'cards', 'a card drawn into the hand; a Leader arriving; a Starfall card', [['A', 'The card streaks in as a comet and lands in a star burst', 'cometArrival', ctx=> [c(ctx)[3]]]]);
F('gilded-frame', 'Gilded frame', 'cards', 'a card reaching max level; Card of the Week; a museum / codex trophy', [['A', 'A gold frame and corner scrolls snap on, a plaque drops', 'gildedFrame', ctx=> [c(ctx)[2]]]]);
F('rainbow-bridge', 'Rainbow bridge', 'board', 'Bloom or heal links between allies; Bifrost-style summons; a gift between cards', [['A', 'An arc between two allies, a star runs along it', 'rainbowBridge', ctx=> [bm(ctx)[0], bm(ctx)[2]]], ['B', 'Across the field to a foe', 'rainbowBridge', ctx=> [bm(ctx)[1], bf(ctx)[2]]]]);
F('magic-circle', 'Magic circle summon', 'board', 'Summon and spawn; a Leader’s arrival; a ritual card', [['A', 'A rune circle draws itself, a pillar of light lifts the card', 'magicCircle', ctx=> [bm(ctx)[1]]], ['B', 'In red, under a foe', 'magicCircle', ctx=> [bf(ctx)[1], {color:'#ff7a5a'}]]]);
F('bio-tide', 'Bioluminescent tide', 'board', 'Tide coming in on reef and river maps; a night swim event', [['A', 'A glowing wave rolls up the board, plankton twinkles behind it', 'bioTide', ctx=> [ctx.board.el]]]);
F('thunder-strike', 'Thunder strike', 'board', 'Storm weather; a Thunder god or Dragon Lightning; a crit on a flier', [['A', 'The sky darkens, a bolt strikes, sparks and a double flash', 'thunderStrike', ctx=> [bf(ctx)[1]]]]);
F('portal-swap', 'Portal swap', 'board', 'swap-position skills; a Trickster or Mirror card', [['A', 'Two cards dive into portals, pop out of each other’s, and back', 'portalSwap', ctx=> [bm(ctx)[0], bm(ctx)[2]]]]);
F('confetti-cannons', 'Confetti cannons', 'ui', 'a level-up; finishing a map; a big win', [['A', 'Two cannons fire confetti from the corners', 'confettiCannons', ctx=> [ctx.ui.el]]]);
F('coin-fountain', 'Coin fountain', 'ui', 'gold rewards; selling cards; a jackpot', [['A', 'Coins spout, bounce, then fly into the gold pill', 'coinFountain', ctx=> [ctx.ui.results, {to:ctx.ui.pills.gold}]], ['B', 'Just the fountain', 'coinFountain', ctx=> [ctx.ui.results]]]);
F('treasure-chest', 'Treasure chest', 'ui', 'a chest reward on the map; daily login; a dungeon’s last room', [['A', 'The chest drops, rattles, the lid bursts open: rays and gems', 'treasureChest', ctx=> [ctx.ui.el]]]);
F('paper-plane', 'Paper-plane mail', 'ui', 'mail, gifts and friend messages; a quest arriving', [['A', 'A paper plane loops to the pill and turns into a letter', 'paperPlane', ctx=> [ctx.ui.results, ctx.ui.pills.energy]]]);
F('firefly-word', 'Fireflies spell a word', 'ui', 'Victory / Level up / a season’s name on a night map', [['A', 'Fireflies gather into “Victory”, glow, then scatter', 'fireflyWord', ctx=> [ctx.ui.el, {text:'Victory'}]], ['B', '“Level up!”', 'fireflyWord', ctx=> [ctx.ui.el, {text:'Level up!'}]]]);
F('gacha-capsule', 'Gacha capsule', 'pack', 'a capsule-style booster; the Mystery Booster', [['A', 'A capsule drops, wobbles, cracks open: ★★★★', 'gachaCapsule', ctx=> [ctx.pack.el]], ['B', 'A gold capsule', 'gachaCapsule', ctx=> [ctx.pack.el, {color:'#ffc23a'}]]]);
F('meteor-shower', 'Meteor shower', 'screen', 'a night map’s ambience; a Meteor or Starfall spell over the board', [['A', 'Streaks across a darkened sky, a big one last', 'meteorShower', ctx=> [ctx.root]], ['B', 'With a wish', 'meteorShower', ctx=> [ctx.root, {wish:'Make a wish…'}]]]);
F('seasonal-drift', 'Seasonal drift', 'screen', 'the season veil on maps and menus (spring, summer, autumn, winter)', [['A', 'Spring: petals and pollen', 'seasonalDrift', ctx=> [ctx.root, {season:'spring'}]], ['B', 'Summer: fireflies and sunbeams', 'seasonalDrift', ctx=> [ctx.root, {season:'summer'}]],
  ['C', 'Autumn: maple leaves tumbling', 'seasonalDrift', ctx=> [ctx.root, {season:'autumn'}]], ['D', 'Winter: snow and frost', 'seasonalDrift', ctx=> [ctx.root, {season:'winter'}]]]);
F('sandstorm-wipe', 'Sandstorm wipe', 'screen', 'a screen transition into a desert map or a desert fight', [['A', 'A wall of sand sweeps across and clears', 'sandstormWipe', ctx=> [ctx.root]]]);
F('bubble-pop', 'Bubble-pop transition', 'screen', 'a transition into water maps; a Bubble or Soap card', [['A', 'Bubbles fill the screen, then pop one by one', 'bubblePop', ctx=> [ctx.root]]]);
F('lantern-festival', 'Lantern festival', 'screen', 'a festival event; New Year; the end of a season', [['A', 'Paper lanterns float up into the dusk', 'lanternFestival', ctx=> [ctx.root]]]);
F('ink-wash', 'Ink-wash transition', 'screen', 'a transition into a story scene or an Eastern-themed map', [['A', 'An ink drop blooms over everything, a paper sweep wipes it clean', 'inkWash', ctx=> [ctx.root]]]);
F('vhs-rewind', 'VHS rewind', 'screen', 'replaying a fight; an Undo / Time skill; a retro event', [['A', '◀◀ REWIND: scanlines, tracking band, colour split', 'vhsRewind', ctx=> [ctx.root]]]);
F('ghost-parade', 'Ghost parade', 'screen', 'a Halloween event; a haunted map; Ghost units', [['A', 'Little ghosts bob across under the moon', 'ghostParade', ctx=> [ctx.root]]]);
})();
