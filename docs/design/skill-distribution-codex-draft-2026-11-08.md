# Bramblewood — Maps 0–20: Skill Distribution & Identity (Working Draft)

## 1. Design principles

- **Signature skills:** 1–3 defining mechanics introduced by a map. They should make the map mechanically recognisable.
- **Side skills:** Supporting mechanics, including skills introduced earlier and synergies that reinforce the map's ecology.
- **One-offs:** Unique creature abilities, special attacks, unusual encounters or jokes. These do not define the map.
- Not every map needs three signature skills. One or two strong introductions are better than padding.
- Statuses (e.g. Poison, Bleed, Vulnerable) are not necessarily skills. Distinguish applying, exploiting, spreading and removing a status.
- Field effects are separate from skills. A skill may summon a slot hazard, but the field effect itself is not a creature skill.
- Faction and leader-related skills are excluded from this progression for now. These will be considered separately.

## 2. Proposed skill distribution

Format: Map | Signature skills | Side skills | One-offs / special abilities

```tsv
Map	Signature skills	Side skills	One-offs / special abilities
0 Bramblewood Outskirts	Flying; Diurnal; Swarm	Slow	Unusual flock/swarm creature abilities
1 Thistlewood	Regenerate; Guardian	Forage; Pickpocket	Resource-thieving creature
2 Pebble Beach	Tide; Shell; Molting	Armour; Delivery; Inspiring	Crab Claws
3 Gannet Cliffs	Arrow; Pounce; Reach	Swift; Evasive	Dive
4 Sunken Hollow	Bleed; Dive; Heal	Swimmer; Guardian	Fork
5 Gatorback Swamp	Poison; Bulwark; Ambush	Parasite; Gorge	Venomous predator
6 Sable Swampmire	Harbinger; Leech; Rupture	Cure; Constrict; Strangle	Petrify
7 The Morel Hollow	Sleep; Paralysis; Immunity/Vaccinate	Poison Barbs; Toxic Gas; Cure; Brood; Web	Witchdoctor; Spore Cloud; Toxic Puff
8 Caves & Alcoves	Illuminate; Echolocate; Dark Sight	Keen Sense; Stealth	Invisible
9 The Kelp Mangroves	Pressure; Tangleweed; Suffocate	Swimmer; Volley; Dive	Undertow; Giant Squid Ink; Kelp Snare
10 Coral Current	Chain Lightning; Wet; Wave	Dive; Electricity	Electrical discharge
11 Eyrie Heights	Daunt; Vulnerable; Rend	Reach; Pounce	Avalanche
12 The Briar Maze	Recoil; Stench; Confusion	High Thorns; Amore; Snare	Dynamite (better suited to a mines submap)
13 The Redwood Deep	Predator; Carnage; Cleave	Breach; Gash; Mighty	Banana; Timbered
14 Savanna Reaches	Prey; Stampede; Heat	Snipe; Mighty	Charge
15 The Long Grass	Trap; Bola; Blitz	Swift; Carrion; Lasso	Hunting creature
16 The Pinewood Taiga	Hibernate; Frostbite; Frost Bolt	Lumberjack	Winter-adapted creature
17 Wolfsbane Tundra	Pack; Pack Leader; Momentum	Taunt; Cold	Adrenaline
18 The Glass Dunes	Acid; Brittle; Friction	Burrow; Shield; Fragile	Glass-bodied creature
19 Ashen Spurn	Smoke Screen; Immolation; Force of Nature	Sturdy; Fire resistance	Ash/wildfire creature
20 The Sundered Peak	Fireball; Earthquake; Meteor	Fire Bolt	Volcanic creature
```

## 3. Major map identity changes

Map 5 — Gatorback Swamp
- Establish Poison as a major mechanic.
- Include a healer and a curer to demonstrate the difference between restoring health and removing Poison.
- Poison should have its own ecosystem of interactions: application, proliferation, exploitation and counterplay.

Map 6 — Sable Swampmire
- Establish death-related value and effects that benefit from units dying.
- Harbinger, Leech and Rupture support a darker, more attritional environment.
- Parasite should remain distinct: it benefits from keeping its host alive, rather than from the host dying.
- Cure can reinforce the previous map's Poison introduction.

Map 7 — The Morel Hollow
- Make this a dangerous fungal environment, rather than simply another Poison map.
- Its identity is airborne spores, sleep, paralysis and unusual remedies.
- Witchdoctors/herbalists fit naturally as ecological healers who treat fungal toxins.
- Introduce preventive protection against statuses, rather than relying entirely on curing them after application.
- Poison Barbs, Toxic Gas, Brood and Web can support the environment, but should not all become signature mechanics.

Map 8 — Caves & Alcoves
- Focus on darkness, illumination and sensory adaptations.
- Distinguish Illuminate, Echolocate and Dark Sight: these are different ways of interacting with darkness.
- Keen Sense and Stealth are supporting mechanics.
- Avoid introducing multiple skills that all effectively mean seeing in the dark.

Map 9 — The Kelp Mangroves
- Focus on deep-water pressure, entanglement and suffocation.
- Pressure should represent adaptation to deep-water conditions, not simply another attack.
- Tangleweed should focus on restricting movement or repositioning.
- Distinguish Tangleweed from Strangle: one controls movement, the other harms or constricts.
- Suffocation can represent the danger of remaining underwater.
- Volley can represent schools of fish; Undertow and Giant Squid Ink are possible one-offs.

Map 10 — Coral Current
- Focus on electricity interacting with water.
- Chain Lightning, Wet and Wave form the main mechanical identity.
- Keep elemental interactions relatively simple: Water can remove Fire, while Wet targets interact with electricity.
- Avoid creating an unnecessarily broad elemental interaction matrix.

Map 11 — Eyrie Heights
- Introduce Vulnerable as a damage-amplification mechanic.
- Daunt and Rend support an environment of intimidating aerial predators and powerful attacks.
- Natural disasters such as avalanches are environmental events or special effects, not necessarily cardinal skills.

Map 12 — The Briar Maze
- Emphasise the maze itself: forced movement, disorientation and unusual attack paths.
- Confusion is a natural fit.
- Recoil can support displacement and forced movement.
- Stench and high Thorns are possible supporting mechanics, but should not replace the maze identity.
- Chess-like movement and attacks (straight lines, diagonals) are potential future mechanics.
- Dynamite may fit a mines submap or later industrial/war setting better than this map.

Map 13 — The Redwood Deep
- Focus on predators, ambushes from trees and powerful animal attacks.
- Predator, Carnage and Cleave establish the identity.
- Twin Strike is a strong candidate for introduction here: two separate damage instances in succession.
- Banana is a one-off, not a signature mechanic.

Map 14 — Savanna Reaches
- Focus on prey, pursuit, stampedes and powerful animals.
- Heat adds an environmental dimension.
- Mighty and Snipe can support the ecosystem.

Map 15 — The Long Grass
- Focus on hunting, traps, pursuit and concealment.
- Trap, Bola and Blitz define the hunting identity.
- Swift, Carrion and Lasso are supporting mechanics.

Map 16 — The Pinewood Taiga
- Focus on winter survival, hibernation and frost.
- Hibernate, Frostbite and Frost Bolt are the proposed signature skills.
- Lumberjack is a supporting skill, not the map's defining identity.

Map 17 — Wolfsbane Tundra
- Focus on pack hunting, leadership and momentum.
- Pack and Pack Leader define the social hunting structure.
- Cold is a possible new skill, contrasting with Heat.

Map 18 — The Glass Dunes
- Focus on abrasive, brittle and corrosive environments.
- Brittle should have meaningful ways to be applied and exploited.
- Acid and Friction support the harsh environment.
- Burrow may fit desert-adapted creatures.

Map 19 — Ashen Spurn
- Focus on smoke, fire and environmental destruction.
- Smoke Screen and Immolation fit the ash-covered environment.
- Force of Nature can represent large-scale environmental effects.

Map 20 — The Sundered Peak
- Focus on volcanic destruction and large-scale elemental attacks.
- Fireball, Fire Bolt, Earthquake and Meteor provide the main attack vocabulary.
- Keep this as a powerful culmination of the early environmental progression.

## 4. Proposed new skills and effects

These are proposed mechanics, not confirmed existing catalogue entries.

```tsv
Skill	Proposed effect	First introduction	Notes
Vaccinate / Immunise	Grants an ally temporary immunity to a specified status or status family.	Map 7	Preventive counterplay to Poison, Sleep or Paralysis; define duration or number of blocked applications.
Pressure	Gains Armour while in a Deep Water environment.	Map 9	Defensive adaptation to depth. Avoid making it a generic damage-plus-Armour attack.
Tangleweed	Restricts an enemy's ability to move or change position.	Map 9	Movement control, distinct from Strangle's damage/constriction.
Suffocate	Applies a status that harms or restricts a target while underwater.	Map 9	Needs a clear distinction from Strangle and existing Poison-like damage-over-time effects.
Vulnerable	Places counters on an enemy. Each counter increases damage taken by 1; remove one counter after each damage instance.	Map 11	Clarify whether all damage sources consume counters, including multi-hit attacks.
Twin Strike	Performs two attacks in succession, each as a separate damage instance.	Map 13	Useful for interacting with Vulnerable counters and other per-hit effects.
Cold	Reduces an enemy's Attack or Speed.	Map 17	Possible thematic opposite to Heat. Exact effect needs balancing.
```

Potential additional concepts, not yet committed:
- Sleep Powder / Paralysing Spores: fungal-themed ways to apply Sleep and Paralysis. These may simply be existing status-application skills with thematic names rather than separate keywords.
- Confusion: causes an affected unit to behave unpredictably or attack an unintended target. Map 12 candidate.
- Undertow: pulls or displaces an enemy. Map 9 one-off candidate.
- Snare: prevents movement. Map 12 side-skill candidate.

## 5. Important design distinctions

- **Cure vs Heal:** Cure removes a status; Heal restores health.
- **Poison vs Sleep/Paralysis:** Morel Hollow should expand into different kinds of fungal danger, not merely add more Poison.
- **Tangleweed vs Strangle:** Tangleweed is movement restriction; Strangle is constriction/damage.
- **Pressure:** Should be a defensive adaptation to deep water, not automatically an attack that also grants Armour.
- **Vulnerable counters:** Each damage instance consumes one counter, so multi-hit attacks such as Twin Strike can interact with it.
- **Twin Strike:** Two separate damage instances, not one combined damage event.
- **Field effects vs skills:** A map's environmental effect is not automatically a skill.
- **One-offs:** Do not promote every unusual creature ability into a new keyword or map signature.

## 6. Out of scope for this pass

Faction and leader-related skills will be handled separately:
- Loyal, Herald, Espirit, Fletcher, Fortify, Sabotage
- Fencing, Boomerang, Onslaught
- Kingslayer (neutral)

Do not use these to determine the environmental map progression yet.

All assignments above are provisional. Check the existing skill catalogue for exact names, descriptions and existing implementations before proposing genuinely new skills. Avoid creating duplicate mechanics under new names.