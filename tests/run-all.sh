#!/usr/bin/env bash
# Bramblewood test suite. Fast engine-level suites always run; the two-browser test runs with --e2e.
#   tests/run-all.sh          ~30s: card matrix, mechanic scenarios, two-player, async/raid, autobattler
#   tests/run-all.sh --e2e    + live two-browser match and the UI smoke test (~2 min, needs Playwright + Chromium)
set -u
cd "$(dirname "$0")/.."
fail=0
run(){ echo "▶ $*"; "$@" || fail=1; echo; }
run node tests/syntax.js
run node tests/card-matrix.js
run node tests/scenarios.js
run node tests/two-player.js
run node tests/async-raid.js
run node tests/autobattle.js
run node tests/raid.js
run node tests/trench.js
run node tests/ghost-unique.js
run node tests/swarm.js
run node tests/anti-air.js
run node tests/shield-call.js
run node tests/backstab.js
run node tests/lantern.js
run node tests/equipment.js
run node tests/when-ready.js
run node tests/keen-eye.js
run node tests/statuses-2026-10-11.js
run node tests/keywords-2026-10-11.js
run node tests/keywords-2026-10-12.js
run node tests/keywords-2026-10-14.js
run node tests/keywords-2026-10-14b.js
run node tests/keywords-2026-10-14c.js
run node tests/keywords-2026-10-14d.js
run node tests/keywords-2026-10-14e.js
run node tests/keywords-2026-10-14f.js
run node tests/keywords-2026-10-14g.js
run node tests/keywords-2026-10-15.js
run node tests/keywords-2026-10-15b.js
run node tests/keywords-2026-10-15c.js
run node tests/keywords-2026-10-15d.js
run node tests/keywords-2026-10-15e.js
run node tests/keywords-2026-10-15r.js   # 2026-10-15 evening: rules (Guardian, Illuminate, Bounty, sudden death 20/25, new field effects, Nursing, hidden skirmishes)
run node tests/keywords-2026-10-15p1.js
run node tests/keywords-2026-10-15w3.js   # 2026-10-16 content: the Tower (levels past the top, battle rating), the jumpers, Snapstick Turtle
run node tests/keywords-2026-10-16a.js   # W2 (2026-10-16): the new skills, Bludgeon / Molting / Cleave, Taunt and the Sheep, Cloudy, the deck-out rule
run node tests/keywords-2026-10-16b.js   # 2026-10-16: Worthy -> Bounty (load migration, empty slot), the Tide-evade rule test
run node tests/skills2-2026-10-16.js   # 2026-10-16 (skills 2): random wind, Amore, On Pitch, Stun N, Pounce <Att>/<Hp>, Burn 1 Lumber, Cataphract, new cards, clean names
run node tests/skills-2026-10-16-devilry.js   # 2026-10-16 (skills): Penance / Blood Tithe, Ambush N, Expose crits, Perma-tide text, live status lines
run node tests/road-rarity-2026-10-16.js   # 2026-10-16 (placement and rarity): rarity caps on the road, pack commons by number, field curriculum
run node tests/regen-fullhp-2026-10-14.js
run node tests/heal-poison-2026-10-16.js   # 2026-10-18: heals stanch Bleed only; Bleed and Poison drop 1 a round; Cure is Poison only
run node tests/fork-family-2026-10-17.js   # 2026-10-17: Fork / Trident / Pitchfork as one swing along 2/3/4 lines, crabs' Crab Claws
run node tests/nightblind-illuminate-2026-10-16.js   # 2026-10-16: an enemy Illuminate unit facing a Night-blind one lights it
run node tests/combat-order-2026-10-17.js   # 2026-10-17: one Speed order (Quick 2, shots and Boomerang throws 1), deaths settled after each action and each arrival
run node tests/field-effects-2026-10-16.js   # 2026-10-16 (field effects 2): Landslide, Consternation, Crushing Depths, the lines, Mirage, the canopy, Slippery, Glass-storm, Hail, Lava Spout, Leylines, Atheist, Haunted, the Tide
run node tests/wave-tide-2026-10-17.js   # 2026-10-17 (wave, tide, boomerang): Wave's lean inward / bounce / bob, the Awash field, the ride, one boomerang home, the tide's sway, hover heights
run node tests/skills-2026-10-17.js   # 2026-10-17 (skills): Reflect (shots bounce), Vanguard, Web, Bloodlust leap, Ambush on any entry, Sentry, Crab Claws, Carrion, Leech, Hoard, Venom Master, Fletcher, Herbalist, Shatter
run node tests/lightning-2026-10-17.js   # 2026-10-17 (lightning): the Wet rule (+1 per Wet counter on lightning hits), Chain Lightning, Voltaic Eel, every lightning hit its own bolt, element emoji
run node tests/rebuild-2026-10-17.js   # 2026-10-17 (rebuild): Rebuild N (castle +N every upkeep while Ready) and the Rebuild castle N trigger action, its text, look, log and setups
run node tests/scale-trail-2026-10-18.js   # 2026-10-18 (Scale Trail): the journal tab, the 8/8 finale + Red Dragon Egg once, found-not-held, smith/secret cards obtainable
run node tests/kin-target-2026-10-18.js   # 2026-10-18 (kin target): who:'kin' on every targeted action and Charge, Esprit's Kin / Any target, the picker, text, keyword
run node tests/i18n-cards-2026-10-18.js   # 2026-10-18 (I2): lang/cards/<code>.json parse, hold only real card names, cover every visible card, and are merged into the built packs
run node tests/gates-2026-10-18.js   # 2026-10-18 (WP4): no lock names an uncharted map (mapIsCharted), the Long Burrow switch, dead lookups gone
run node tests/night-2026-10-12.js
run node tests/phase-status.js
run node tests/tide.js
run node tests/exile-zone.js
run node tests/rules-2026-10-10.js
run node tests/arena-rules.js
run node tests/devilry.js
run node tests/caged.js
run node tests/turn-start.js
run node tests/pounce.js
run node tests/earthquake.js
run node tests/terrain.js
run node tests/testkit-manual.js
run node tests/action-targets.js
run node tests/skills-1013.js
run node tests/wildpath-perks.js
run node tests/darkness-1013.js
run node tests/dynamite-helmet.js
run node tests/ecclesia.js
run node tests/integrity.js
run node tests/node-ids-2026-10-14.js
run node tests/fx-a-resist.js
run node tests/raid-arena-2026-10-17.js   # 2026-10-17: Psychic Dampener, the Arena's rules as cards, raid rows / Commons / volley
run node tests/steam-ach-2026-10-18.js   # 2026-10-18 (package C): Steam achievement ids pass steam.js's check, each is unlocked somewhere and listed in the platform roadmap
run node tests/game-texts.js   # 2026-10-15: TX keys + the docs/game-texts.xlsx export/import round trip (~45 s)
if [[ "${1:-}" == "--e2e" ]]; then run python3 tests/e2e/live_two_player.py; run python3 tests/e2e/ui_smoke.py; run python3 tests/e2e/flows.py; run python3 tests/e2e/snaps.py; run python3 tests/e2e/i18n.py; run python3 tests/e2e/hero.py; run python3 tests/e2e/rarity_limit_craft.py; fi
if [[ $fail == 0 ]]; then echo "ALL PASSED"; else echo "SOME SUITES FAILED"; fi
exit $fail
