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
run node tests/raid-rows-2026-10-19.js   # 2026-10-18 (owner 20:40): no playing into the raid allies' middle / back rows
run node tests/raid-rx-2026-10-19.js   # 2026-10-19 (package RX): closest-row raid targeting, the play-anim watchdog, allies' hand plays, play rows, the leader cost cap
run node tests/raid-stages-2026-10-18.js   # 2026-10-18 (R3-WP2): each raid stage's rules land in the fight; the raid editor round-trips them
run node tests/raid-fixes-2026-10-18.js    # 2026-10-18 (package R): every row acts column by column, the raid's clock and end, castles can't be shocked, "& Co."
run node tests/i18n-templates-2026-10-18.js   # 2026-10-18 (I1): placeholder texts translate as templates in all 12 packs
run node tests/i18n-ui-2026-10-18.js   # 2026-10-18 (I3): lang/ui/<code>.json parse, keep placeholders and emoji, hold only source texts, are merged into the built packs and match as templates
run node tests/steam-ach-2026-10-18.js   # 2026-10-18 (package C): Steam achievement ids pass steam.js's check, each is unlocked somewhere and listed in the platform roadmap
run node tests/engine-parity-2026-10-18.js   # 2026-10-18 (R3-WP1): shot and skill kills credited (kills, On Kill, Midas, Crown), one pitchCard for both seats, the CPU's Sacrifice, field-card and slot heuristics
run node tests/polish-2026-10-18.js   # 2026-10-18 (R3-WP6): the Spire's summit card, the Spire / Long Burrow backdrops, dead keys gone, inventory rows live
run node tests/maps-2026-10-18.js   # 2026-10-18 (V3): Lilypad Reach waits on Gatorback Swamp (old saves keep it); dark maps' screen layer leaves the canvas to the canvas layer
run node tests/poison-fx-2026-10-19.js   # 2026-10-18 (package P): no "cured" on natural Poison decay, grey drop, boiling pool, flurries on/off, lab = game hook
run node tests/hn-2026-10-19.js   # 2026-10-19 (package HN): nothing to heal = no event, log, "+0", look, sound or heal trigger for every heal kind; partial heals; Bleed = stanch only; the app skips 0 heals (replays too)
run node tests/visuals-2026-10-18.js   # 2026-10-18 (V1): the standing Tide, no tide chip, chilled flyers' frame and half hover, idle glance, smaller cliff gulls
run node tests/tutorial-2026-10-18.js   # 2026-10-18 (package T): drag hint shows the highlighted card, faction pick goes straight in, green board, centred T-0/T-1, card windows fade out shrinking
run node tests/x2-2026-10-18.js   # 2026-10-18 (package X2): raid stages without the extra volley, lightning at a bramble (no Shocked), the Spire at AI_LEVEL_MAX, the Flood wets land units, the full-board tide look
run node tests/ui-2026-10-18.js   # 2026-10-18 (package U): why-not label on hover-out, card shadows, revealAfter "?" (Quarry Mole, Psychic Dampener), one unlock row, swap gap, Creative N, deck rarity floor, egg rewards, swap after the pack
run node tests/emoji-atlas-2026-10-18.js   # 2026-10-18 (package EMO): each emoji set's sprite sheet is built, current and complete; EmojiStyle draws from it (stub DOM), SVG fallback
run node tests/shields-2026-10-18.js   # 2026-10-18 (package X3): enemy bramble Shield by rule (map x kind), shieldOverride, Map 0's base bramble Health
run node tests/decisions-2026-10-18.js   # 2026-10-18 (X1): Castle -> Bramble, Burdock the mouse, Thicket rank, rare eggs + a sure Map 1 egg, Lilypad Reach on Map 6, centred 5+ cost, golden card dealt, deck offer by Collection level, the Dromedary
run node tests/y-2026-10-18.js   # 2026-10-18 (package Y, audit 4): Codex tile key + revealAfter, heal/Cure texts, gated "?" line, Wave crash credit, skirmish sim Difficulty, a11y observer, tutorial slide seed, Creative/cages, resume CPU level, Sacrifice Bleed
run node tests/z-2026-10-18.js   # 2026-10-18 (package Z): two field-kit items a fight (+1 vs a grantsItem boss, greys and fades out), premium daily-dungeon Sweep, free Spire replays with 0 reward and refunded losses, TX keys + packs, the ads page
run node tests/reward-screens-2026-10-19.js   # 2026-10-18 (package RW): Claim opens the raid claim screen with each reward, skip / Collect, the calm version (reduced motion, Effects Low), crimson boss results, TX keys + 12 packs, the lab entries
run node tests/prayer-2026-10-19.js   # 2026-10-19 (package E): Prayer tokens (N a turn, Prayer = tokens on the field + the player's own offering tokens, gone with the unit), thresholds, Worship / Lightning, Relic, the CPU, texts + 12 packs
run node tests/guild-skills-2026-10-19.js   # 2026-10-19 (G): guild skills: Rooted Walls math, raid bramble Health bonus, no bonus while the table is missing, the proposed SQL (RLS, owner check, atomic spend)
run node tests/raid-ops-2026-10-19.js   # 2026-10-19 (package RO): raid respawn 24 h after a kill, admin restart, the Raid hub, instances, the raid editor (scroll + fields), taking part / strong / held rewards, Auto after completing, raid tickets
run node tests/guild-rename-2026-10-18.js   # 2026-10-18 (X4): 🎫 Rename Ticket (shop, inventory, founders' gift), owner-only Rename guild, name rules, the not-applied fallback, the proposed rename_guild SQL
run node tests/winrate-panel-2026-10-19.js   # 2026-10-19 (W2): the map win-rate panel checks every fight inside a budget, "!" on a broken fight, reference decks follow the road, panel = tools/skirmish_pass.js
run node tests/pale-desert-2026-10-19.js   # 2026-10-18 (package PD): the Pale Desert (side map 18-A) locked till Map 18 is cleared, valid fights and rewards, new cards in budget v3 and revealAfter, win rates on the curve (stored measure + live spot check), TX keys in 12 packs, tools and look
run node tests/t-2026-10-19.js   # 2026-10-18 (package T, owner list for 10-19): the tutorial's scripted CPU play and both attack lines, the Outskirts after the deck window, no Quarry Mole toast, brambles won as cards
run node tests/skill-costs-2026-10-19.js   # 2026-10-18 (package H): canonical/skill-costs.json covers every trigger / action / skill in use, S = trigger weight × action value, keyword S and N unchanged, the hub's Skill costs tab (db, Copy JSON)
run node tests/skill-worth-2026-10-19.js   # 2026-10-19 (package SW): tools/skill_worth.js on the live engine, deterministic tiny experiment, the worth maths, measuredS or a reason on every skill-costs entry, the report files, the hub's measured column + Apply
run node tests/codex-book-2026-10-19.js   # 2026-10-18 (package C): Codex card album + skills book pages, reveal gating, seen tracking + migration, collection score (Codex + Profile), TX keys in all 12 packs
run node tests/trigger-layers-2026-10-19.js   # 2026-10-19 (package L): trigger chains stop at 5 layers (siblings free, a death sweep's passes are layers), tokens fire death triggers, Evasive dodges attacks and skills, the stated trigger rules
run node tests/m-2026-10-19.js   # 2026-10-18 (package M): the Tide's slosh x1.7 on Flood / x0.8 on Ebb (TIDE_FLOOD_MOTION, TIDE_EBB_MOTION), a clearer Flood rise; Pounce at the bramble when no enemy unit can be hit
run node tests/d-2026-10-19.js   # 2026-10-18 (package D): Cast Darkness (Pall Wraith) adds / lifts the field's Darkness, a map's own dark stays, True Strike (White Dragon), Sleep caps at N+1, Blind = eye + 🕶️, no short description of 20+ words
run node tests/legendary-2026-10-19.js   # 2026-10-18 (package LG): True Strike ignores plain dodges (Illusory too) but not a Legendary dodge (the hook); the Legendary ability tier (True Strike, Supreme, Supreme Tide) and its gold tag, glossary, Codex, 12 packs; the 23:05 decisions
run node tests/bp-2026-10-19.js   # 2026-10-18 (package BP): wind-lit wing (+ Tailwind boot, Headwind ×2), leader callout ×0.8 / queue ×0.75, night hover lines retry, Stampede number on the HP bar + its carry-on line, battle log pinned to the newest line
run node tests/filters-2026-10-19.js   # 2026-10-18 (package F): every text filter box has autocomplete=off and empties on load / pageshow and on a page switch; sticky filters keep only non-text choices
run node tests/mobile-nav-2026-10-19.js   # 2026-10-18 (package MB): on phones the map's ⛶ is on the 🧭 row with 🚨 under it (no overlap at 360-480 px, admin on/off), a 🏠 on the full-screen map that goes Home
run node tests/dk-2026-10-19.js   # 2026-10-18 (package DK): a dungeon fight and each Sweep run use a key (no refund on a win), 0 keys blocks Fight / Sweep with the reason, the sweep count stops at the keys held, the Forge's Key ring (cap 3 -> 5, Strange Materia), refill to the cap, the Forge / Nest / Tavern Upgrades tabs + Profile summary, TX keys + 12 packs
run node tests/fz-2026-10-19.js   # 2026-10-19 (package FZ): a unit frozen before its turn skips that action (the freeze spent); Confused = triggers, skills and actions each 1 in 2 (seeded), the fumble line, determinism
run node tests/nf-2026-10-19.js   # 2026-10-18 (package NF): the Nest's chosen nest (taken / unbuilt say why), per-copy levels and credit, the move of an old save, decks fight with their strongest copies (a real engine), the cloud row's copies + the proposed SQL, Fuse all into the highest level then the finest foil then the oldest, the Max Energy effect (full + calm), TX keys + 12 packs
run node tests/card-pool-2026-10-19.js   # 2026-10-19 (package AN): the candidate card pool (pool: true): 5-8 per map 0-12 + the polar set, budget v3, in band, out of packs / rewards / Codex / CPU decks / card hash, Admin's Pool cards filter, 12 languages, emoji
run node tests/rv-2026-10-19.js   # 2026-10-19 (package RV): Revive is a true death (On Death, On Ally Die, On Kill, Bounty, Darkness, Ritual, graveyard, then it returns; no Relic / crystal / split), loops stop at the layer cap, Rescue (Shield Call) is no death; Quiet Contemplation on 21-6 (no doubling, no extra turns or second goes); texts in 12 packs; the stated rules
run node tests/gi-2026-10-19.js   # 2026-10-19 (package GI): Hunter (picker), Executioner, Detonate, Proliferate, Brittle (Frozen for Shatter), Kin Rally (the played card), Pack Howl, Prayer Ward 🧿, Field Breaker; Spore Cloud, Thunderstorm, Tangled Roots; the CPU, costs, pool cards, texts in 12 packs, the stated rules
run node tests/game-texts.js   # 2026-10-15: TX keys + the docs/game-texts.xlsx export/import round trip (~45 s)
if [[ "${1:-}" == "--e2e" ]]; then run python3 tests/e2e/live_two_player.py; run python3 tests/e2e/ui_smoke.py; run python3 tests/e2e/flows.py; run python3 tests/e2e/snaps.py; run python3 tests/e2e/i18n.py; run python3 tests/e2e/hero.py; run python3 tests/e2e/rarity_limit_craft.py; run python3 tests/e2e/a11y.py; run python3 tests/e2e/codex_perf.py; run python3 tests/e2e/emoji_perf.py; run python3 tests/e2e/filters_2026_10_19.py; fi
if [[ $fail == 0 ]]; then echo "ALL PASSED"; else echo "SOME SUITES FAILED"; fi
exit $fail
