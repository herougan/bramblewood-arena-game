/* ============================================================
   Effects Lab, "Ideas 10-21" tab (package LAB2, 2026-10-21): twenty-nine candidate effects for the owner to judge, none used in the game yet
   (every entry says "Lab only (not used yet)"). The effects are in bramblewood-fx-ideas.js (window.IdeasFX); this file only lists them.
   Owner: "I also like a lot of the existing effects. I don't mind spending some time here to add more effects for me to judge."
   ============================================================ */
(function(){
'use strict';
const L = window.LAB2; if(!L) return;
const IF = ()=> window.IdeasFX;
const E = [];
const add = (group, id, name, note, sig, v)=> E.push({id, group, name, note, sig, v});
// one variant per look: [label, fn(ctx)]
const looks = (fn, labels)=> labels.map((lb, i)=> [lb, c=> fn(c, i)]);

// -- Hits: one per element, three looks each (a hit lands on the foe; magic's zap comes from your unit)
const HIT = [
  ['hitFire', 'Fire hit', 'A hot, cartoon flame hit: flames lick up the card, or a shower of embers, or a fireball pops.', ['Flame lick', 'Ember shower', 'Fireball pop']],
  ['hitIce', 'Ice hit', 'A cold hit: sharp ice shards and a spinning snowflake, a frost that covers the card, or icicles dropping on it.', ['Shard burst', 'Frost over', 'Icicles drop']],
  ['hitAcid', 'Acid hit', 'A fizzy green hit: a splat of drops, sizzling bubbles on the card, or slime dripping down it.', ['Splat', 'Sizzle bubbles', 'Drip down']],
  ['hitPoison', 'Poison hit', 'A purple hit: a skull puffs up with smoke, purple bubbles rise, or a toxic cloud blooms.', ['Skull puff', 'Purple bubbles', 'Toxic cloud']],
  ['hitDecay', 'Decay hit', 'A rotting hit: brown leaves fall off it, crumbs fall from its edge, or it wilts and spores puff.', ['Leaf fall', 'Crumble', 'Wilt and spores']],
  ['hitMagic', 'Magic hit', 'A sparkly hit: a burst of stars, a rune circle spinning under the card, or stars that fly in from your wand unit.', ['Sparkle burst', 'Rune circle', 'Wand zap']],
  ['hitWater', 'Water hit', 'A splashy hit: drops fly up and a ground ring spreads, bubbles rise, or a wave washes across the card.', ['Splash', 'Bubbles', 'Wave wash']],
  ['hitStone', 'Stone hit', 'A chunky hit: rock chips and dust, a boulder dropping, or a spray of pebbles.', ['Rock chips', 'Boulder drop', 'Pebble spray']],
  ['hitMetal', 'Metal hit', 'A clanging hit: sparks and a white star, spinning gears, or a bright glint sweeping across the card.', ['Clang sparks', 'Gear spin', 'Glint sweep']],
  ['hitLightning', 'Lightning hit', 'A zappy hit: a bolt from above, arcs that jump to the cards beside it, or crackles round its edge.', ['Bolt from above', 'Chain arcs', 'Crackle round the card']],
];
HIT.forEach(([fn, name, note, labels])=> add('hits', 'i-' + fn, name, note, `IdeasFX.${fn}(target, {v:0 | 1 | 2})`,
  looks((c, i)=> IF()[fn](c.foe[0], {v:i, from:c.mine[1], chain:[c.foe[2], c.castle]}), labels)));

// -- Auras: one effect, ten elements
const AUR = [['heat', 'Fire'], ['cold', 'Ice'], ['acid', 'Acid'], ['poison', 'Poison'], ['decay', 'Decay'], ['magic', 'Magic'], ['water', 'Water'], ['stone', 'Stone'], ['metal', 'Metal'], ['shock', 'Lightning']];
add('auras', 'i-aura', 'Attacks-with-an-element aura', 'A quiet idle look for a unit whose swing deals an element: a few small motes round the card (embers rise, snow glints, bubbles float, leaves fall, runes orbit, drops form, pebbles bob, a glint sweeps, sparks crackle). Seven motes at most, 30 fps, no filter: cheap enough to leave on.',
  'IdeasFX.elementAura(target, {element, ms})', AUR.map(([k, n])=> [n, c=> IF().elementAura(c.mine[1], {element:k, ms:4200})]));

// -- Titles
add('titles', 'i-crowning', 'Crowning', 'The Crown arriving as a moment: it drops and bounces, or lowers slowly in a spotlight, or lands with a shower of coins.',
  'IdeasFX.crowning(target, {v})', looks((c, i)=> IF().crowning(c.mine[1], {v:i}), ['Drop and ting', 'Spotlight lower', 'Coin shower']));
add('titles', 'i-gilding', 'Gilding', 'A card turning gold: a gold wipe runs down it, or gold dust rains and settles, or a coin spins up with a ring.',
  'IdeasFX.gilding(target, {v})', looks((c, i)=> IF().gilding(c.mine[1], {v:i}), ['Gold wipe', 'Gold dust', 'Spinning coin']));
add('titles', 'i-veteran', 'Veteran stripes', 'The Veteran title earned: three gold chevrons stamp onto the corner one by one, or a medal drops in, or three star pips pop along the bottom.',
  'IdeasFX.veteranStripes(target, {v})', looks((c, i)=> IF().veteranStripes(c.mine[1], {v:i}), ['Three chevrons', 'Medal drops in', 'Three star pips']));
add('titles', 'i-laurel', "Champion's laurel", 'The Champion title: a laurel wreath grows round the card, or a trophy rises with confetti, or a gold banner unfurls over it.',
  'IdeasFX.championLaurel(target, {v})', looks((c, i)=> IF().championLaurel(c.mine[1], {v:i}), ['Laurel wreath', 'Trophy and confetti', 'Banner unfurls']));

// -- Evolve
add('evolve', 'i-cocoon', 'Evolve: cocoon burst', 'A silk cocoon wraps the card, wobbles, and bursts into silk bits and stars as the new form appears.',
  'IdeasFX.cocoonBurst(target)', [['Cocoon', c=> IF().cocoonBurst(c.mine[1])]]);
add('evolve', 'i-helix', 'Evolve: helix swirl', 'Two strands of glowing dots (blue and pink, like a DNA ladder) spiral up round the card and close on it with a flash.',
  'IdeasFX.helixSwirl(target)', [['Helix', c=> IF().helixSwirl(c.mine[1])]]);
add('evolve', 'i-molt', 'Evolve: molt shed', 'A pale copy of the old skin slips off the card and crumples away in flakes while the card pops up fresh.',
  'IdeasFX.moltShed(target)', [['Molt', c=> IF().moltShed(c.mine[1])]]);

// -- Sky (the field's own box, never the whole screen)
add('sky', 'i-dawn', 'Dawn break', 'Warm light rises from the bottom of the field, a sun climbs, and soft rays turn slowly.', 'IdeasFX.dawnBreak(fieldBox)', [['Dawn', c=> IF().dawnBreak(c.arena)]]);
add('sky', 'i-dusk', 'Dusk glow', 'The field turns orange and violet, the sun sinks, and stars come out one by one.', 'IdeasFX.duskGlow(fieldBox)', [['Dusk', c=> IF().duskGlow(c.arena)]]);
add('sky', 'i-moon', 'Moonrise', 'A cool blue tint, a moon with a halo climbs in an arc, and the stars twinkle.', 'IdeasFX.moonrise(fieldBox)', [['Moonrise', c=> IF().moonrise(c.arena)]]);
add('sky', 'i-rain', 'Rain starts', 'A grey cloud slides in, the first drops fall and get heavier, and rings spread on the ground.', 'IdeasFX.rainStart(fieldBox)', [['Rain', c=> IF().rainStart(c.arena)]]);
add('sky', 'i-snow', 'Snowfall', 'Flakes drift down on a sway, the cards get little white caps, and it all melts away at the end.', 'IdeasFX.snowfall(fieldBox, {cards})', [['Snow', c=> IF().snowfall(c.arena, {cards:c.all})]]);

// -- Status (Stench and Brittle have no drawing in the game's code; Exposed has SkillFX.targetMark on apply and a chip per hit, but nothing when it expires)
add('status', 'i-stench', 'Stench: apply and expire', 'Applied: green wavy lines rise off the card and two flies circle. Expired: a breeze blows it all away.', 'IdeasFX.stenchStatus(target, {mode})',
  [['Apply', c=> IF().stenchStatus(c.mine[0], {mode:'apply'})], ['Expire', c=> IF().stenchStatus(c.mine[0], {mode:'expire'})]]);
add('status', 'i-brittle', 'Brittle: apply and expire', 'Applied: hairline cracks spread across the card with a few glass chips. Expired: the cracks seal back up with a shimmer.', 'IdeasFX.brittleStatus(target, {mode})',
  [['Apply', c=> IF().brittleStatus(c.foe[0], {mode:'apply'})], ['Expire', c=> IF().brittleStatus(c.foe[0], {mode:'expire'})]]);
add('status', 'i-exposed', 'Exposed: apply and expire', 'A second look to compare with the game\'s lock-on (SkillFX.targetMark). Applied: a red reticle zooms in and locks onto the card. Expired: the reticle spins smaller and fades with a puff (the game shows nothing when Exposed ends).', 'IdeasFX.exposedStatus(target, {mode})',
  [['Apply', c=> IF().exposedStatus(c.foe[0], {mode:'apply'})], ['Expire', c=> IF().exposedStatus(c.foe[0], {mode:'expire'})]]);

// -- Raid
add('raid', 'i-shield', 'Shield 50 cracks', 'A blue shield dome round the Bramble: one crack runs across it, or it breaks into hexagon shards with a flash.', 'IdeasFX.shieldCrack(target, {v})',
  looks((c, i)=> IF().shieldCrack(c.castle, {v:i}), ['First crack', 'Breaks apart']));
add('raid', 'i-slam', 'Tentacle slam warning', 'A red dashed danger spot and a bouncing "!" over the card that is about to be hit; then a purple tentacle slams down on it with a shake and dust.', 'IdeasFX.slamWarning(target, {v})',
  looks((c, i)=> IF().slamWarning(c.mine[1], {v:i}), ['Warning only', 'Warning, then slam']));
add('raid', 'i-falls', 'The raid falls', 'The boss shakes and sinks under rising bubbles while the field darkens; then confetti and a trophy come up.', 'IdeasFX.raidFalls(fieldBox, {boss})',
  [['Boss sinks', c=> IF().raidFalls(c.arena, {boss:'🐙'})]]);

L.mount({
  id:'ideas', title:'Ideas 10-21', pill:['idea', 'Lab only'],
  sub:'Twenty-nine candidate effects to judge, none used in the game yet. Pick any button to play it on the pinned field; tell me which to keep and I will wire them. Each has a few looks; the cartoon style, no gore, and cheap to run (no filters, no blend layers, reduced motion shows one still glyph).',
  chips:[['hits', 'Element hits'], ['auras', 'Auras'], ['titles', 'Titles'], ['evolve', 'Evolve'], ['sky', 'Weather and time'], ['status', 'Status'], ['raid', 'Raid']],
  groups:[
    {key:'hits', title:'Element hits', sub:'one per element, three looks each', tag:'Hit', tone:'elem'},
    {key:'auras', title:'Idle auras', sub:'subtle, "attacks with X"', tag:'Aura', tone:'elem'},
    {key:'titles', title:'Title and transform moments', tag:'Title', tone:'game'},
    {key:'evolve', title:'Evolve looks', tag:'Evolve', tone:'evo'},
    {key:'sky', title:'Weather and time of day', sub:'the field\'s own box only', tag:'Sky', tone:'sky'},
    {key:'status', title:'Status apply and expire', sub:'Stench and Brittle have no look yet; Exposed has none when it ends', tag:'Status', tone:'status'},
    {key:'raid', title:'Raid moments', tag:'Raid', tone:'raid'},
  ],
  entries:E,
});
})();
