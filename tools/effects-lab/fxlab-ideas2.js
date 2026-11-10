/* ============================================================
   Effects Lab, "Ideas 11-11" tab (package LAB3, 2026-11-11): forty-seven more candidate effects for the owner to judge, none used in the
   game yet (every entry says "Lab only (not used yet)"). The effects are in bramblewood-fx-ideas2.js (window.IdeasFX2); this file only lists
   them, on LAB2's tab engine (fxlab-lab2.js: the pinned field, filter chips, play buttons).
   Owner: "add much more vfx we can consider adding to our game in the master hub."
   ============================================================ */
(function(){
'use strict';
const L = window.LAB2; if(!L) return;
const FX2 = ()=> window.IdeasFX2;
const E = [];
// group, id, name, one line "used for", call signature, looks: [label, fn(ctx)]
const add = (group, id, name, note, sig, v)=> E.push({id, group, name, note, sig, v});
const looks = (fn, labels)=> labels.map((lb, i)=> [lb, c=> fn(c, i)]);
// small HUD props on the field for the UI entries (the field is rebuilt before every play, so they never pile up)
function hud(c){
  const h = document.createElement('div');
  h.style.cssText = 'position:absolute; top:6px; right:8px; display:flex; gap:8px; align-items:center; z-index:3';
  h.innerHTML = '<button type="button" class="btn small" tabindex="-1">▶ Play</button><span style="display:inline-flex; align-items:center; gap:4px; padding:2px 10px; border-radius:99px; background:rgba(40,28,14,.75); border:2px solid #e8b46a; color:#fff3c4; font:800 13px \'Baloo 2\',system-ui,sans-serif">🪵 3</span><span style="display:inline-block; width:26px; height:34px; border-radius:5px; border:2px solid #f3d38c; background:linear-gradient(135deg,#5b3a8a,#2e1d4a)"></span>';
  c.arena.appendChild(h); const [btn, pill, deck] = h.children; return {btn, pill, deck};
}
const handPt = c=>{ const r = c.arena.getBoundingClientRect(); return {x:r.left + r.width*.5, y:r.bottom + 30}; };

// -- Skills and keywords with no look of their own yet
add('skills', 'j-sequester', 'Sequestration: steal the statuses', 'Used for Sequestration: its swing takes the hit unit\'s status skills for a turn (today: a log line only).', 'IdeasFX2.sequesterGrab(victim, {from:thief, icons, v})',
  looks((c, i)=> FX2().sequesterGrab(c.foe[0], {from:c.mine[1], v:i}), ['Paw grabs them', 'Jar scoops them', 'They fly home (expire)']));
add('skills', 'j-hoard', 'Hoard and Timber: the stash grows', 'Used for Hoard N and Timber: what it hoards piles up beside it as its stats grow (today: the chip and a bigger number).', 'IdeasFX2.hoardStash(unit, {n, v})',
  looks((c, i)=> FX2().hoardStash(c.mine[1], {n:5, v:i}), ['Acorn heap', 'Sack of coins', 'Log stack']));
add('skills', 'j-mastery', 'Venom Master, Fletcher, Herbalist', 'Used for the "master" passives: the passive\'s own tool circles the card and dives in when it boosts (today: no look).', 'IdeasFX2.masteryOrbit(unit, {v})',
  looks((c, i)=> FX2().masteryOrbit(c.mine[1], {v:i}), ['Venom Master: vials', 'Fletcher: feathers to an arrow', 'Herbalist: leaves']));
add('skills', 'j-lonewolf', 'Lone Wolf', 'Used for Lone Wolf when it is alone in its row and its bonus turns on (today: no look).', 'IdeasFX2.loneWolfHowl(unit, {v})',
  looks((c, i)=> FX2().loneWolfHowl(c.mine[2], {v:i}), ['Moon and howl', 'Lone spotlight', 'Leaf on the breeze']));
add('skills', 'j-ghost', 'Ghost', 'Used for Ghost: shows the unit is see-through, or a swing passing clean through it (today: no look).', 'IdeasFX2.ghostDrift(unit, {from, v})',
  looks((c, i)=> FX2().ghostDrift(c.foe[0], {from:c.mine[0], v:i}), ['Sheet rises', 'Swing passes through', 'Boo!']));
add('skills', 'j-majesty', 'Majesty', 'Used for Majesty N while it is Ready: the enemies facing it bow (they swing at less Attack; today: no look).', 'IdeasFX2.majestyBow(unit, {foes, v})',
  looks((c, i)=> FX2().majestyBow(c.mine[1], {foes:c.foe, v:i}), ['Golden rays', 'Bell and rings', 'Red carpet']));
add('skills', 'j-exalted', 'Consecration: blessed ground', 'Used for Consecration N at round start: its side\'s ground is Exalted and heals (today: the heal float only).', 'IdeasFX2.exaltedGround(sideUnits, {v})',
  looks((c, i)=> FX2().exaltedGround(c.mine, {v:i}), ['Golden glow', 'Halos settle', 'Petals and a bell']));
add('skills', 'j-encore', 'Encore', 'Used for Encore: the unit gets one more swing this round (today: a "🔁 Encore" float).', 'IdeasFX2.encoreCurtain(unit, {v})',
  looks((c, i)=> FX2().encoreCurtain(c.mine[1], {v:i}), ['Curtain call', 'Spotlight and claps', 'Replay arrow']));
add('skills', 'j-meld', 'Meld', 'Used for Meld: every Meld unit of a side shares the granted skill (today: no look).', 'IdeasFX2.meldLink(meldUnits, {v})',
  looks((c, i)=> FX2().meldLink(c.mine, {v:i}), ['Beads run between', 'Puzzle pieces click', 'Rings in turn']));

// -- Crits: one per damage type (the game has one crit look for all of them)
const EL_NAMES = {physical:'Physical', heat:'Fire', cold:'Cold', acid:'Acid', poison:'Venomous', decay:'Decay', magic:'Magic', water:'Water', stone:'Stone', metal:'Metal', shock:'Lightning'};
Object.keys(EL_NAMES).forEach(k=> add('crits', 'j-crit-' + k, EL_NAMES[k] + ' crit', `Used for a critical hit that deals ${EL_NAMES[k]} damage (today every crit shares one burst and the CRIT stamp).`, `IdeasFX2.critElement(target, {element:'${k}', v})`,
  looks((c, i)=> FX2().critElement(c.foe[0], {element:k, v:i}), ['Starburst', 'Cross slash', 'Triple ring'])));

// -- Heal, shield, cleanse
add('heal', 'j-heal', 'Heal: new looks', 'Used for heals (Healing, Heal action, Regeneration) as alternatives to the "+N❤" float.', 'IdeasFX2.healHearts(unit, {v})',
  looks((c, i)=> FX2().healHearts(c.mine[0], {v:i}), ['Heart bubbles', 'Flower blooms', 'Plaster']));
add('heal', 'j-lifelink', 'Heal from a healer', 'Used when one unit heals another (Bloom, Herb Refinery, a heal action): the heal travels from the healer.', 'IdeasFX2.lifeLink(target, {from:healer, v})',
  looks((c, i)=> FX2().lifeLink(c.mine[2], {from:c.mine[0], v:i}), ['Hearts arc over', 'Orb hops over', 'Healing raincloud']));
add('heal', 'j-shield', 'Shield: soap bubble and leaf', 'Used for Shield gained and Shield breaks, beside SkillFX.shieldUp.', 'IdeasFX2.shieldBubble(unit, {v})',
  looks((c, i)=> FX2().shieldBubble(c.mine[1], {v:i}), ['Bubble forms', 'Bubble pops (breaks)', 'Leaf shield']));
add('heal', 'j-cleanse', 'Cleanse: washed clean', 'Used for Cleanse and Cure, beside the rising band of cleanseVfx.', 'IdeasFX2.cleanseWash(unit, {v})',
  looks((c, i)=> FX2().cleanseWash(c.mine[1], {v:i}), ['Foamy rinse', 'Soap scrub', 'Sunburst dries it']));

// -- Summon arrivals by creature type
add('summon', 'j-swoop', 'Arrival: birds and flyers', 'Used when a Flyer or bird is played or summoned (today every unit lands the same way).', 'IdeasFX2.arriveSwoop(unit, {v})',
  looks((c, i)=> FX2().arriveSwoop(c.mine[1], {v:i}), ['Arc swoop', 'Dive from high', 'Spiral glide']));
add('summon', 'j-burrow', 'Arrival: burrowers', 'Used when a mole, ant, worm or other digger is played or summoned.', 'IdeasFX2.arriveBurrow(unit, {v})',
  looks((c, i)=> FX2().arriveBurrow(c.mine[1], {v:i}), ['Mound pops', 'Tunnel runs to it', 'Sand swirl']));
add('summon', 'j-splash', 'Arrival: swimmers', 'Used when a Swimmer, fish or Tide unit is played or summoned.', 'IdeasFX2.arriveSplash(unit, {v})',
  looks((c, i)=> FX2().arriveSplash(c.mine[1], {v:i}), ['Leaps out', 'Bubble rises', 'Wave carries it']));
add('summon', 'j-hatch', 'Arrival: hatchlings', 'Used when a Hatchling or a bird or reptile token arrives as an egg (beside the board egg\'s eggCrackVfx).', 'IdeasFX2.arriveHatch(unit, {v})',
  looks((c, i)=> FX2().arriveHatch(c.mine[1], {v:i}), ['Halves fall apart', 'Hop, hop, top off', 'Popcorn pop']));
add('summon', 'j-skitter', 'Arrival: insects', 'Used when an insect, spider or Swarm unit is played or summoned.', 'IdeasFX2.arriveSkitter(unit, {v})',
  looks((c, i)=> FX2().arriveSkitter(c.mine[1], {v:i}), ['Swarm runs together', 'Silk thread', 'Leaf lifts off']));

// -- Leaving the board
add('leave', 'j-return', 'Return to hand', 'Used when a unit is sent back to its owner\'s hand (bounce; today it just vanishes).', 'IdeasFX2.returnToHand(unit, {to:hand, v})',
  looks((c, i)=> FX2().returnToHand(c.foe[0], {to:handPt(c), v:i}), ['Boing arc', 'Rewind', 'String yank']));
add('leave', 'j-exile', 'Exile: new looks', 'Used for Exile from the board, beside FX.C.deathExile and the exile wisp.', 'IdeasFX2.exileFold(unit, {v})',
  looks((c, i)=> FX2().exileFold(c.foe[0], {v:i}), ['Paper star', 'Vortex and lock', 'Bubble floats off']));
add('leave', 'j-death', 'Death: cute looks', 'Used for an ordinary death, as kinder alternatives to the topple (Tutorial, low Effects, tokens).', 'IdeasFX2.deathPoof(unit, {v})',
  looks((c, i)=> FX2().deathPoof(c.foe[0], {v:i}), ['Poof and halo', 'Pancake and stars', 'Flower grows']));

// -- Stacks
add('stacks', 'j-buffstack', 'Buff stacks', 'Used when a buff stacks again (Inspired, Momentum, Grit, Swarm, Rally): each stack is seen arriving.', 'IdeasFX2.buffStack(unit, {n, v})',
  looks((c, i)=> FX2().buffStack(c.mine[1], {n:3, v:i}), ['Chevron tower', 'Orbiting orbs', 'Badge counts up']));
add('stacks', 'j-debuffstack', 'Debuff stacks', 'Used when a debuff stacks again (Weaken, Vulnerable, Scar, Daunt): each stack adds weight.', 'IdeasFX2.debuffStack(unit, {n, v})',
  looks((c, i)=> FX2().debuffStack(c.foe[0], {n:3, v:i}), ['Chain links', 'Raincloud grows', 'Rocks pile on']));

// -- Lane and field
add('field', 'j-lane', 'Lane surge', 'Used when one column matters: column skills, Rook\'s Row, Arrow Slits, Rampart, a lane-wide hit\'s wind-up.', 'IdeasFX2.laneSurge(columnCards, {v})',
  looks((c, i)=> FX2().laneSurge([c.foe[0], c.mine[0]], {v:i}), ['Runway lights', 'Glowing seam', 'Wind streaks']));
add('field', 'j-rainbow', 'Rain ends: rainbow', 'Used when rain stops or Spring Rain ends (the field\'s own box).', 'IdeasFX2.fieldRainbow(fieldBox, {v})',
  looks((c, i)=> FX2().fieldRainbow(c.arena, {v:i}), ['Rainbow arc', 'Puddles shine', 'Sun peeks out']));
add('field', 'j-aurora', 'Aurora on cold nights', 'Used for night on a cold map (Frigid, the tundra, Hail at night): ribbons of light sway.', 'IdeasFX2.fieldAurora(fieldBox, {v})',
  looks((c, i)=> FX2().fieldAurora(c.arena, {v:i}), ['Green', 'Pink and violet', 'Shimmering curtain']));
add('field', 'j-omen', 'Field omen (the forecast)', 'Used a round before a field event, on the field itself: Earthquake or Landslide, a storm, a flood or High Tide.', 'IdeasFX2.fieldOmen(fieldBox, {v})',
  looks((c, i)=> FX2().fieldOmen(c.arena, {v:i}), ['Rumble', 'Storm gathers', 'Water rises']));

// -- Map and road
add('map', 'j-road', 'Road progress', 'Used for progress along the road (fights won of a map, the level track): the bar fills from one point to the next.', 'IdeasFX2.roadProgress(box, {from, to, v})',
  looks((c, i)=> FX2().roadProgress(c.arena, {from:.25, to:.65, v:i}), ['Hedgehog walks', 'Flags pop', 'Lanterns light']));
add('map', 'j-maptrans', 'Map transition', 'Used between maps, into a sub-map and back (beside the leaf sweep and the slide).', 'IdeasFX2.mapTransition(mapBox, {at, v})',
  looks((c, i)=> FX2().mapTransition(c.arena, {at:c.mine[1], v:i}), ['Circle wipe', 'Clouds roll over', 'Paper fold']));

// -- Packs and rarity
add('pack', 'j-rarity', 'Rarity climb', 'Used before a pack card flips: the glow, stars or gem say how rare it is.', 'IdeasFX2.rarityClimb(card, {rarity, v})',
  looks((c, i)=> FX2().rarityClimb(c.mine[1], {rarity:'legendary', v:i}), ['Colour climb', 'Star count', 'Gem drops in']));
add('pack', 'j-shiny', 'Shiny pull', 'Used for a Shiny pull, beside the hue sweep of FX.D.revealShiny.', 'IdeasFX2.shinyGlint(card, {v})',
  looks((c, i)=> FX2().shinyGlint(c.mine[1], {v:i}), ['Corner glints', 'Rainbow ring', 'Wand tap']));
add('pack', 'j-legend', 'Legendary pull', 'Used for a Legendary pull, beside the coin rain and crown of FX.D.revealLegendary.', 'IdeasFX2.legendaryWings(card, {v})',
  looks((c, i)=> FX2().legendaryWings(c.mine[1], {v:i}), ['Wings unfold', 'Pillar of light', 'Star crown']));

// -- Results
add('results', 'j-victory', 'Victory cheer', 'Used at a win, on your own units, before the Victory card.', 'IdeasFX2.victoryCheer(yourUnits, {v})',
  looks((c, i)=> FX2().victoryCheer(c.mine, {v:i}), ['Wave hop and confetti', 'Balloons', 'Poppers']));
add('results', 'j-defeat', 'Defeat droop', 'Used at a loss, on your own units: gentle and cute, never grim.', 'IdeasFX2.defeatDroop(yourUnits, {v})',
  looks((c, i)=> FX2().defeatDroop(c.mine, {v:i}), ['Little raincloud', 'White flag', 'Wilted flower']));
add('results', 'j-levelup', 'Level up', 'Used when a card levels up (Forge temper, Kibble training, a summon\'s level), beside SkillFX.levelUp.', 'IdeasFX2.levelUpSpring(card, {level, v})',
  looks((c, i)=> FX2().levelUpSpring(c.mine[1], {level:5, v:i}), ['Spring up', 'Steps', 'Balloons lift']));
add('results', 'j-mapclear', 'Map cleared', 'Used when a whole map is cleared, beside FX.E.mapCleared\'s banner.', 'IdeasFX2.mapClearFlag(mapBoxOrNode, {v})',
  looks((c, i)=> FX2().mapClearFlag(c.arena, {v:i}), ['Flag planted', 'Gold seal', 'Sunrise and birds']));

// -- Boss
add('boss', 'j-bossintro', 'Boss intro', 'Used when a boss or raid boss enters, beside the quake and the BOSS title.', 'IdeasFX2.bossIntro(boss, {box:fieldBox, name, v})',
  looks((c, i)=> FX2().bossIntro(c.foe[0], {box:c.arena, name:'🦀 Boss', v:i}), ['Letterbox and name', 'Silhouette and eyes', 'Spotlights lock on']));
add('boss', 'j-bossphase', 'Boss phase change', 'Used when a boss enters its next phase (Enraged at 75%, a raid stage; today a stage-name chip).', 'IdeasFX2.bossPhase(boss, {phase, v})',
  looks((c, i)=> FX2().bossPhase(c.foe[0], {phase:'II', v:i}), ['Seam cracks', 'Rage steam', 'Hourglass flips']));

// -- UI juice
add('ui', 'j-button', 'Button press', 'Used for any button press (the home menu has its own pop; the rest have none).', 'IdeasFX2.buttonSquish(button, {at, v})',
  looks((c, i)=> FX2().buttonSquish(hud(c).btn, {v:i}), ['Jelly squish', 'Ink ring and stars', 'Confetti pop']));
add('ui', 'j-lumber', 'Lumber lands in its pill', 'Used when Lumber (or another resource) is gained: it travels from its source to the pill.', 'IdeasFX2.lumberGain(pill, {from, n, v})',
  looks((c, i)=> FX2().lumberGain(hud(c).pill, {from:c.mine[0], n:3, v:i}), ['Woodpile', 'Axe chop', 'Beaver courier']));
add('ui', 'j-draw', 'Card drawn', 'Used when a card is drawn into the hand, beside drawFlipVfx\'s face-down flip.', 'IdeasFX2.cardDraw(handCard, {from:deck, hand, v})',
  looks((c, i)=> FX2().cardDraw(c.mine[2], {from:hud(c).deck, hand:c.mine, v:i}), ['Sparkle swish', 'Springs out', 'Bird drops it']));
add('ui', 'j-handfull', 'Hand full', 'Used when the hand is full and the next draw will be pitched (a warning before the auto-pitch).', 'IdeasFX2.handFull(handCards, {v})',
  looks((c, i)=> FX2().handFull(c.mine, {v:i}), ['Jostle and sweat', 'Gate shuts', 'Ghost card puffs']));
add('ui', 'j-notify', 'Something new', 'Used on a button or tab with something new behind it (a quest to claim, a new item).', 'IdeasFX2.notifyPing(button, {v})',
  looks((c, i)=> FX2().notifyPing(hud(c).btn, {v:i}), ['Red dot', 'Envelope hops', 'Bell jingles']));
add('ui', 'j-mulligan', 'Mulligan swap', 'Used for the opening-hand swap (Mulligan; today a log line only).', 'IdeasFX2.mulliganSwap(handCard, {v})',
  looks((c, i)=> FX2().mulliganSwap(c.mine[1], {v:i}), ['Slide out and in', 'Shuffle flip', 'Die tumbles']));

// -- Idle touches
add('idle', 'j-visitor', 'Idle visitor', 'Used now and then on a calm board or menu: a small visitor on a card (decor, never on a control).', 'IdeasFX2.idleVisitor(card, {v})',
  looks((c, i)=> FX2().idleVisitor(c.mine[1], {v:i}), ['Butterfly', 'Ladybird', 'Falling leaf']));
add('idle', 'j-yawn', 'Idle yawn', 'Used for a unit that has waited a long time (a long Wait, a Hibernating unit).', 'IdeasFX2.idleYawn(card, {v})',
  looks((c, i)=> FX2().idleYawn(c.mine[0], {v:i}), ['Stretch and yawn', 'Nods off', 'Cat stretch']));

L.mount({
  id:'ideas2', title:'Ideas 11-11', pill:['idea', 'Lab only'],
  sub:'Forty-seven more ideas, none in the game yet, three looks each. Each fills a gap: a skill with no look, one look shared by many moments (one crit, one arrival), or nothing at all. Press ▶ to play it on the pinned field and tell me which to keep.',
  chips:[['skills', 'Skills'], ['crits', 'Crits'], ['heal', 'Heal and shield'], ['summon', 'Arrivals'], ['leave', 'Leaving'], ['stacks', 'Stacks'], ['field', 'Field'], ['map', 'Map'], ['pack', 'Packs'], ['results', 'Results'], ['boss', 'Boss'], ['ui', 'UI'], ['idle', 'Idle']],
  groups:[
    {key:'skills', title:'Skills and keywords with no look yet', tag:'Skill', tone:'status'},
    {key:'crits', title:'Crits by damage type', sub:'one effect, its own colours and bits per type', tag:'Crit', tone:'elem'},
    {key:'heal', title:'Heal, shield and cleanse', tag:'Heal', tone:'game'},
    {key:'summon', title:'Arrivals by creature type', tag:'Arrival', tone:'evo'},
    {key:'leave', title:'Death, exile and return to hand', tag:'Leave', tone:'war'},
    {key:'stacks', title:'Buff and debuff stacks', tag:'Stack', tone:'status'},
    {key:'field', title:'Lane, field and weather', sub:'the field\'s own box only', tag:'Field', tone:'sky'},
    {key:'map', title:'Map transitions and road progress', tag:'Map', tone:'sky'},
    {key:'pack', title:'Pack and rarity reveals', tag:'Pack', tone:'forge'},
    {key:'results', title:'Victory, defeat, level-up, map clear', tag:'Result', tone:'game'},
    {key:'boss', title:'Boss intros and phase changes', tag:'Boss', tone:'raid'},
    {key:'ui', title:'UI juice', tag:'UI', tone:'idea'},
    {key:'idle', title:'Ambient idle touches', tag:'Idle', tone:'smoke'},
  ],
  entries:E,
});
})();
