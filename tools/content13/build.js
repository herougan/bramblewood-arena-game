// 2026-11-18 (package CONTENT13, phase 1): the spec cards of docs/design/content13-2026-11-18.json, stats fitted by the budget.
// Writes the JSON + prints the table. Does NOT touch canonical/cards.json (SKAUD1 phase 2 edits it). Run: node tools/content13/build.js
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..', '..');
const SC = require(path.join(root, 'tools/skill_costs.js')), K = SC.make(require(path.join(root, 'canonical/skill-costs.json')));
const cards = JSON.parse(fs.readFileSync(path.join(root, 'canonical/cards.json')));
const ids = new Set(cards.map(c => c.id)), animals = new Set(cards.map(c => c.animal));
let nid = Math.max(...cards.map(c => c.numericId)) + 1;
const T = (on, doo, o) => ({ on, do: doo, ...o });
// obtain: where it is obtained; map = the budget's Map term (obtainMap); A = Attack to fit, H found by the budget (max Health that passes)
const S = [
  { id: 'fossa-ambusher', name: 'Fossa Ambusher', icon: '🐈', animal: 'fossa', species: ['Mammal'], arche: ['Forest', 'Predator'], rarity: 'rare', cost: 1, wait: 1, A: 3,
    effects: { rend: 1 }, covers: ['rend'], map: 22, obtain: 'Map 22 pack (tier 4)', source: { kind: 'pack', tier: 4, map: 'm22' },
    flavor: 'Madagascar\'s only big hunter wraps its claws around a lemur and does not let go. The second blow always lands harder.',
    art: 'cute fossa, a slender cat-like Madagascan predator with a long tail and rounded ears, crouched on a mossy branch with one paw raised, anatomically correct mammal: four legs, long tail, forest canopy with hanging vines behind, soft green light' },
  { id: 'osprey-plunger', name: 'Osprey Plunger', icon: '🦅', animal: 'osprey', species: ['Bird'], arche: ['Bird', 'Coast'], rarity: 'uncommon', cost: 1, wait: 1, A: 2,
    effects: { flying: true, triggers: [T('onSpawn', 'rend', { who: 'enemy', sub: 'random', amount: 1 })] }, covers: ['rend action'], map: 22, obtain: 'Map 22 pack (tier 3)', source: { kind: 'pack', tier: 3, map: 'm22' },
    flavor: 'It folds its wings and drops into the water feet first. Whatever it grips is easier to grip again.',
    art: 'cute osprey diving feet-first toward a river, wings swept back, talons forward, anatomically correct bird: two wings, two legs with talons, one head, river with misty cliffs behind, warm morning light' },
  { id: 'tsetse-drainer', name: 'Tsetse Drainer', icon: '🪰', animal: 'tsetse fly', species: ['Insect'], arche: ['Insect', 'Swamp'], rarity: 'rare', cost: 1, wait: 1, A: 1,
    effects: { flying: true, enfeeble: 1 }, covers: ['enfeeble'], map: 23, obtain: 'Map 23 pack (tier 4)', source: { kind: 'pack', tier: 4, map: 'm23' },
    flavor: 'One bite and the bitten wants to lie down. The fly has nothing against you; it simply lives off tired animals.',
    art: 'cute tsetse fly on a drooping swamp reed, folded wings over its back, long forward-pointing mouthpart, anatomically correct insect: three body segments, six legs from the middle segment, two wings, humid swamp with lily pads behind' },
  { id: 'drongo-mocker', name: 'Drongo Mocker', icon: '🐦', animal: 'fork-tailed drongo', species: ['Bird'], arche: ['Bird', 'Savanna'], rarity: 'uncommon', cost: 1, wait: 1, A: 2,
    effects: { triggers: [T('onAllyPlayed', 'weaken', { who: 'enemy', sub: 'random', amount: 1 })] }, covers: ['weaken action'], map: 23, obtain: 'Map 23 pack (tier 3)', source: { kind: 'pack', tier: 3, map: 'm23' },
    flavor: 'It screams the meerkats\' alarm call when they are about to eat, then eats what they drop. Every new friend makes the lie louder.',
    art: 'cute fork-tailed drongo, glossy black bird with a deeply forked tail and red eye, beak open mid-call on a thorn branch, anatomically correct bird: two wings, two legs, one head, golden savanna with acacia trees behind' },
  { id: 'cape-buffalo-bulwark', name: 'Cape Buffalo Bulwark', icon: '🐃', animal: 'cape buffalo', species: ['Bovine'], arche: ['Savanna', 'Herd'], rarity: 'rare', cost: 2, wait: 2, A: 3,
    effects: { triggers: [T('onAllyPlayed', 'grant', { who: 'ally', sub: 'subject', skill: 'sturdy', sturdy: true })] }, covers: ['grant (sturdy)'], map: 23, obtain: 'Map 23 pack (tier 4)', source: { kind: 'pack', tier: 4, map: 'm23' },
    flavor: 'When a calf arrives the herd closes around it, and the calf is, for a few moments, harder to move than the ground.',
    art: 'cute cape buffalo with broad curved horns joined at the forehead, standing in front of a small calf, anatomically correct bovine: four legs, tail, two horns, dusty savanna waterhole behind, warm sunset light' },
  { id: 'bar-headed-goose-leader', name: 'Bar-headed Goose Leader', icon: '🪿', animal: 'bar-headed goose', species: ['Bird'], arche: ['Bird', 'Mountain'], rarity: 'uncommon', cost: 1, wait: 1, A: 2,
    effects: { flying: true, triggers: [T('onAllyPlayed', 'grant', { who: 'ally', sub: 'subject', skill: 'quick', quick: true })] }, covers: ['grant (quick)'], map: 21, obtain: 'Map 21 pack (tier 3)', source: { kind: 'pack', tier: 3, map: 'm21' },
    flavor: 'It flies the Himalaya in a long line, and whoever falls in behind rides its draught a little faster.',
    art: 'cute bar-headed goose, grey body with two dark bars on a white head, wings spread, leading a small V of geese, anatomically correct bird: two wings, two legs, one head, snowy mountain ridge and pale blue sky behind' },
  { id: 'caddisfly-casemaker', name: 'Caddisfly Casemaker', icon: '🐛', animal: 'caddisfly larva', species: ['Insect'], arche: ['Insect', 'River'], rarity: 'rare', cost: 1, wait: 1, A: 1,
    effects: { armourer: 1 }, covers: ['armourer'], map: 24, obtain: 'Special: a faction / submap carrier (Armourer is Special, owner 11-17), host map 24', source: null, special: true,
    flavor: 'It glues river grit into a tube around itself, and has been quietly doing the same for its neighbours since before there were otters.',
    art: 'cute caddisfly larva peeking out of a tube case made of tiny river pebbles and twigs, soft pale body, anatomically correct larva: segmented body, three pairs of legs near the head, clear stream bed with waving weed behind' },
  { id: 'opossum-faker', name: 'Opossum Faker', icon: '🐀', animal: 'opossum', species: ['Mammal'], arche: ['Forest', 'Night'], rarity: 'uncommon', cost: 1, wait: 1, A: 2,
    effects: { thanatosis: true }, covers: ['thanatosis'], map: 22, obtain: 'Map 22 pack (tier 3)', source: { kind: 'pack', tier: 3, map: 'm22' },
    flavor: 'When it is beaten it falls over, goes stiff and smells awful. A minute later it gets up and walks away, to everyone\'s confusion.',
    art: 'cute opossum lying stiff on its side with tongue out and eyes closed in a leaf pile, pointed pink snout, long bare tail, anatomically correct marsupial: four legs, prehensile tail, autumn forest floor with fallen leaves behind' },
  { id: 'strangler-fig-sapling', name: 'Strangler Fig Sapling', icon: '🌳', animal: 'strangler fig', species: ['Plant'], arche: ['Plant', 'Jungle'], rarity: 'uncommon', cost: 1, wait: 2, A: 1,
    effects: { tangle: 1 }, covers: ['tangle'], map: 21, obtain: 'Map 21 pack (tier 3)', source: { kind: 'pack', tier: 3, map: 'm21' },
    flavor: 'It starts as a seed in a branch and ends as a cage of roots around a tree that is no longer there.',
    art: 'cute strangler fig, a young tree with a network of woody aerial roots wrapped around an old trunk, two small leaf-eyes, no animal body parts, rainforest clearing with shafts of light behind' },
  { id: 'pearl-mussel-anchorer', name: 'Pearl Mussel Anchorer', icon: '🦪', animal: 'freshwater pearl mussel', species: ['Mollusc'], arche: ['Shellfish', 'River'], rarity: 'uncommon', cost: 1, wait: 2, A: 1,
    effects: { pearl: 1, anchor: true }, covers: ['pearl', 'anchor'], map: 21, obtain: 'Map 21 pack (tier 3); anchor matters on Map 10 Underwater Currents too', source: { kind: 'pack', tier: 3, map: 'm21' },
    flavor: 'It sits in the same patch of gravel for a hundred years, holds on through every flood, and keeps one grain of sand in the dark.',
    art: 'cute freshwater pearl mussel, dark elongated bivalve shell half-open showing a single pearl, rooted in river gravel, anatomically correct bivalve: two hinged shell halves, no legs, clear river bottom with sunlit ripples behind' },
  { id: 'mole-cricket-megaphone', name: 'Mole Cricket Megaphone', icon: '🦗', animal: 'mole cricket', species: ['Insect'], arche: ['Insect', 'Burrow'], rarity: 'rare', cost: 1, wait: 1, A: 1,
    effects: { amplifier: 1 }, covers: ['amplifier'], map: 22, obtain: 'Submap upgrader on Map 22 or 24 (Amplifier is an upgrader candidate)', source: null, special: true,
    flavor: 'It digs its burrow in the shape of a horn and sings into it. The song carries a kilometre; its neighbours sing a little louder for it.',
    art: 'cute mole cricket with broad digging front legs singing at the mouth of a horn-shaped burrow, anatomically correct insect: three body segments, six legs from the middle segment, folded wings, moonlit meadow earth behind' },
  { id: 'praying-mantis-striker', name: 'Praying Mantis Striker', icon: '🦗', animal: 'praying mantis', species: ['Insect'], arche: ['Insect', 'Forest'], rarity: 'rare', cost: 1, wait: 1, A: 2,
    effects: { assault: 2 }, covers: ['assault'], map: 22, obtain: 'Map 22 pack (tier 4)', source: { kind: 'pack', tier: 4, map: 'm22' },
    flavor: 'It waits so still that you doubt it is there. It only moves when it strikes, and then it is quicker than your doubt.',
    art: 'cute praying mantis with folded forelegs and triangular head, perched on a flower stem, anatomically correct insect: three body segments, six legs, two raptorial forelegs held up, wildflower meadow with soft haze behind' },
  { id: 'secretary-bird-stomper', name: 'Secretary Bird Stomper', icon: '🦅', animal: 'secretary bird', species: ['Bird'], arche: ['Bird', 'Savanna'], rarity: 'rare', cost: 2, wait: 1, A: 3,
    effects: { encore: true }, covers: ['encore'], map: 23, obtain: 'Map 23 pack (tier 4)', source: { kind: 'pack', tier: 4, map: 'm23' },
    flavor: 'It stamps a snake flat, and while the snake is still thinking about it, stamps it again.',
    art: 'cute secretary bird with long legs, crest of quill feathers and black thigh plumes, one foot raised to stamp, anatomically correct bird: two wings, two long legs, one head, dry golden grassland with a lone acacia behind' },
  { id: 'spitfire-sawfly-grubs', name: 'Spitfire Sawfly Grubs', icon: '🐛', animal: 'sawfly larva', species: ['Insect'], arche: ['Insect', 'Forest'], rarity: 'uncommon', cost: 1, wait: 1, A: 1,
    effects: { spitfire: 1 }, covers: ['spitfire'], map: 22, obtain: 'Map 22 pack (tier 3) (bolts: Maps 21+ only)', source: { kind: 'pack', tier: 3, map: 'm22' },
    flavor: 'The real name is spitfire grub. A cluster on a gum leaf rears up together and spits oil at whatever disturbs them.',
    art: 'cute cluster of sawfly larvae rearing up together on a eucalyptus leaf, each with a dark head and green striped body, a little fiery orange spit in the air, anatomically correct larvae: segmented bodies, three pairs of true legs, bright bush gum tree with golden light behind' },
  { id: 'rinkhals-spitter', name: 'Rinkhals Spitter', icon: '🐍', animal: 'rinkhals', species: ['Reptile'], arche: ['Snake', 'Savanna'], rarity: 'rare', cost: 1, wait: 1, A: 2,
    effects: { arrow: { v: 1, type: 'poison', form: 'bolt' } }, covers: ['poisonBolt'], map: 23, obtain: 'Map 23 pack (tier 4) (bolts: Maps 21+ only)', source: { kind: 'pack', tier: 4, map: 'm23' },
    flavor: 'It spits venom at the eyes from two metres. If that fails, it falls over and plays dead. Both are on purpose.',
    art: 'cute rinkhals, a stocky snake with a flared hood and keeled scales, rearing with hood spread and mouth open, a small arc of spit, anatomically correct snake: no legs, long body, forked tongue, dry grass scrub with orange dusk behind' },
  { id: 'soft-shell-crab-newmoult', name: 'Newly Moulted Crab', icon: '🦀', animal: 'blue crab', species: ['Crustacean'], arche: ['Crab', 'Coast'], rarity: 'common', cost: 1, wait: 1, A: 5,
    effects: { vulnerable: true }, covers: ['vulnerable (passive)'], map: 21, obtain: 'Map 21 pack (tier 2)', source: { kind: 'pack', tier: 2, map: 'm21' },
    flavor: 'It has just climbed out of its old shell and the new one is still wet paper. It hits as hard as ever and dies faster than it should.',
    art: 'cute blue crab with a pale soft shell and big pincers raised, a cast-off old shell beside it, anatomically correct crab: ten legs including two claws, eyes on stalks, shallow tide pool with sandy bottom behind' },
];
const out = [];
S.forEach(s => {
  if (ids.has(s.id)) throw new Error('dup id ' + s.id);
  const base = { id: s.id, name: s.name, icon: s.icon, cost: s.cost, wait: s.wait, attack: s.A, health: 1, effects: s.effects, rarity: s.rarity, species: s.species, animal: s.animal, archetypes: s.arche, flavor: s.flavor, dmgType: 'physical', resist: [], tags: [], locked: true, test: false };
  if (s.source) base.source = s.source;
  let best = null;
  for (let H = 1; H <= 40; H++) { const d = Object.assign({}, base, { health: H, obtainMap: s.map }); const b = K.budget(d); if (b.ok) best = { H, b }; }
  if (!best) { console.log('NO FIT', s.id); return; }
  const c = Object.assign({}, base, { health: best.H, numericId: nid++, awaitingSource: true });
  out.push({ card: c, covers: s.covers, level: 1, obtainMap: s.map, obtain: s.obtain, special: !!s.special, artPrompt: s.art, budget: { S: best.b.S, N: best.b.N, x1: best.b.x1, x2: best.b.x2, N2: best.b.N2, ok: best.b.ok } });
  const animalDup = animals.has(s.animal);
  console.log(s.id.padEnd(26), s.rarity.padEnd(9), s.A + '/' + best.H, 'S', best.b.S, 'N', best.b.N, 'x1', best.b.x1, 'ok', best.b.ok, animalDup ? 'ANIMAL DUP' : '', best.b.missing && best.b.missing.length ? 'missing ' + best.b.missing : '');
});
fs.writeFileSync(path.join(root, 'docs/design/content13-2026-11-18.json'), JSON.stringify({ package: 'CONTENT13', phase: 1, date: '2026-11-18', status: 'spec (not folded; cards.json untouched, SKAUD1 phase 2 owns it)', rules: 'append with awaitingSource:true; numericIds assigned after max at write time, re-check at fold; Level 1 (reward) budget; obtainMap = the budget Map term', cards: out }, null, 1) + '\n');
