# Focused decks: Map 20 Volcano Lair (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mx --pool ancient-sloth-titan,cave-olm,cinder-stoker,deep-cave-troll,eagle-owl-quartermaster,ember-jackal,fire-drake-hatchling,fire-salamander,fumarole-ibex,gorge-wyrm,grave-grin-hyena,ibex-rockcaller,magma-salamander,polar-bear,stalactite-golem,stoat-cutthroat,stonedrop-vulture,upside-down-bat,ur-elk,vampire-roost,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:ranged,big,swarm,open --anchor ancient-sloth-titan,cinder-stoker,deep-cave-troll,ember-jackal,fire-drake-hatchling,gorge-wyrm,magma-salamander,stalactite-golem,vampire-roost --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 8764 games in 129 s.

- The list (21): Ancient Sloth Titan, Cave Olm, Cinder Stoker, Cave Bear, Eagle-Owl Quartermaster, Ember Jackal, Fire Drake Hatchling, Fire Salamander, Fumarole Ibex, Gorge Wyrm, Grave-Grin Hyena, Ibex Rockcaller, Magma Salamander, Polar Bear, Stalactite Pill Bug, Stoat Cutthroat, Stonedrop Vulture, Upside-Down Bat, Ür-Elk, Vampire Roost, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 20-B-1 skirmish's deck; 20-B-2 skirmish's deck; 20-B-3 skirmish's deck; 20-B-4 worldboss's deck; reference starter deck under 20-B-1's field; reference deck (Map 20) under 20-B-2's field; expected player deck (expectedPlayerDeck) under 20-B-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:ranged | flying x10; ranged x8 | 81% (76%-86%) | 0.8 | 0: 8, 1: 8, 2: 4 | 4x Cinder Stoker, 4x Stalactite Pill Bug, 4x Upside-Down Bat, 3x Eagle-Owl Quartermaster, 3x Stonedrop Vulture, 2x Magma Salamander | 14 |
| 2 | swarm | swarm (14 copies at 0 Lumber); rally x6 | 81% (76%-86%) | 0.6 | 0: 14, 1: 3, 3: 3 | 4x Cinder Stoker, 4x Grave-Grin Hyena, 3x Cave Olm, 3x Cave Bear, 3x Ember Jackal, 3x Upside-Down Bat | 10 |
| 3 | open | midrange (average 0.8 Lumber) | 67% (61%-72%) | 0.8 | 0: 8, 1: 8, 2: 4 | 4x Cave Olm, 4x Cinder Stoker, 4x Vampire Roost, 3x Ember Jackal, 3x Fumarole Ibex, 2x Magma Salamander | 0 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.4); guard x8 | 55% (50%-61%) | 1.4 | 0: 4, 1: 8, 2: 4, 3: 4 | 4x Ancient Sloth Titan, 4x Stalactite Pill Bug, 4x Upside-Down Bat, 3x Fire Salamander, 3x Wolf Spider Mother, 2x Magma Salamander | 18 |

## Per opponent

| Deck | fight:20-B-1 | fight:20-B-2 | fight:20-B-3 | fight:20-B-4 | ref:starter | ref:road20 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 family:ranged | 71% | 92% | 92% | 100% | 92% | 71% | 50% |
| 2 swarm | 71% | 96% | 96% | 92% | 92% | 50% | 71% |
| 3 open | 50% | 92% | 96% | 100% | 71% | 33% | 25% |
| 4 big | 17% | 92% | 88% | 96% | 46% | 25% | 25% |
