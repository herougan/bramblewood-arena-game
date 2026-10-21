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
run node tests/raid-br-2026-10-19.js   # 2026-10-19 (package BR): the raid BR, boss = its 3 rows x a 20-card deck + set-up x2 + boss units + Commons, your side = yours + the allies, leaders 2x; normal BR unchanged
run node tests/raid-rv2-2026-10-19.js   # 2026-10-19 (package RV2): raid strikes in order + the 250 ms column stagger, back rows +15%, elders 100 -> basic Health, the boss's 3 plays a turn, allies' plays without a board redraw, fight ranks x damage, Competent / Leading participants
run node tests/guild-rename-2026-10-18.js   # 2026-10-18 (X4): 🎫 Rename Ticket (shop, inventory, founders' gift), owner-only Rename guild, name rules, the not-applied fallback, the proposed rename_guild SQL
run node tests/winrate-panel-2026-10-19.js   # 2026-10-19 (W2): the map win-rate panel checks every fight inside a budget, "!" on a broken fight, reference decks follow the road, panel = tools/skirmish_pass.js
run node tests/pale-desert-2026-10-19.js   # 2026-10-18 (package PD): the Pale Desert (side map 18-A) locked till Map 18 is cleared, valid fights and rewards, new cards in budget v3 and revealAfter, win rates on the curve (stored measure + live spot check), TX keys in 12 packs, tools and look
run node tests/t-2026-10-19.js   # 2026-10-18 (package T, owner list for 10-19): the tutorial's scripted CPU play and both attack lines, the Outskirts after the deck window, no Quarry Mole toast, brambles won as cards
run node tests/skill-costs-2026-10-19.js   # 2026-10-18 (package H): canonical/skill-costs.json covers every trigger / action / skill in use, S = trigger weight × action value, keyword S and N unchanged, the hub's Skill costs tab (db, Copy JSON)
run node tests/skill-worth-2026-10-19.js   # 2026-10-19 (package SW): tools/skill_worth.js on the live engine, deterministic tiny experiment, the worth maths, measuredS or a reason on every skill-costs entry, the report files, the hub's measured column + Apply
run node tests/skill-combos-2026-10-19.js   # 2026-10-19 (package DC): duo-skill combos: a tiny deterministic pair run, every planned pair measured, the coverage list (9 never-fired triggers, off-scale entries, Gain / Bounty), measured fields only, the hub Combos view
run node tests/codex-book-2026-10-19.js   # 2026-10-18 (package C): Codex card album + skills book pages, reveal gating, seen tracking + migration, collection score (Codex + Profile), TX keys in all 12 packs; 2026-10-19 (package CX): 4 x 4 album pages, short section names, the turn tabs on the book, first / last
run node tests/sand-gusts-2026-10-19.js   # 2026-10-19 (package CX): the Pale Desert's sand as gusts (2-4 s, 8-20 s apart, varied), kept up while on the map or in its fights, stopped on leaving, SFX volume / mute
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
run node tests/fg-2026-10-19.js   # 2026-10-19/21 (package FG): extras = copies beyond the deck limit (5 Commons aren't extras), the Fuse tab's preview, Reinforce's preview = castleCanTemper, the card-level Forge (every copy levels together; the move from per-copy levels adds the copies' credit onto the card; the cloud row), the cost curve (+10%, 0-7 < 8-10, limit break 2x the road), Reset Forge, the one Refine key, TX keys + 12 packs
run node tests/card-pool-2026-10-19.js   # 2026-10-19 (package AN): the candidate card pool (pool: true): 5-8 per map 0-12 + the polar set, budget v3, in band, out of packs / rewards / Codex / CPU decks / card hash, Admin's Pool cards filter, 12 languages, emoji
run node tests/rv-2026-10-19.js   # 2026-10-19 (package RV): Revive is a true death (On Death, On Ally Die, On Kill, Bounty, Darkness, Ritual, graveyard, then it returns; no Relic / crystal / split), loops stop at the layer cap, Rescue (Shield Call) is no death; Quiet Contemplation on 21-6 (no doubling, no extra turns or second goes); texts in 12 packs; the stated rules
run node tests/gi-2026-10-19.js   # 2026-10-19 (package GI): Hunter (picker), Executioner, Detonate, Proliferate, Brittle (Frozen for Shatter), Kin Rally (the played card), Pack Howl, Prayer Ward 🧿, Field Breaker; Spore Cloud, Thunderstorm, Tangled Roots; the CPU, costs, pool cards, texts in 12 packs, the stated rules
run node tests/skills-sk3-2026-10-19.js   # 2026-10-19 (package SK3): skills batch 3 as triggers x actions: Spawner, Duplicate, War Banner / Warcry, Shieldwall, Corpsefeeder, Grave Call, Silence, Stymie, Amplifier, Stench, Executioner 25%, Petrify + Shatter, Cull (Hunter's Weak), Broodkeeper, Exhaust, Herald, Harbinger (On Any Death), Vulnerable, Barrage, Spotter, Smoke Screen, Magnet; costs, cards, texts in 12 packs
run node tests/skills-sk2-2026-10-19.js   # 2026-10-19 (package SK2): Harvest, Scavenge N/M, Repair N, Foraging N, Milling N, Pickpocket N, Sabotage N, Arson N, Fortification; structures as a unit category; opts.sk2 parameters; texts in 12 packs; skill costs
run node tests/skills-sk2b-2026-10-19.js   # 2026-10-19 (package SK2b): the three-tier economy: Milling (Lumber), Quarry (1 Lumber -> Stone), Smelter (2 Lumber + 2 Stone -> Metal); the trigger price t.pay (can't pay, whole or nothing, upkeep order); texts, costs, the note and the decision
run node tests/thematic-2026-10-19.js   # 2026-10-19 (package TH): the thematic pass: placed pool cards live with sources, every reward / deck card live, rarity caps, no off-theme card, the new fields, every main fight on the road curve
run node tests/card-pass-2026-10-19.js   # 2026-10-19 (package CB): the card pass: budget v3 for every live card (Dragons / Caldera Wyrm aside), changed cards in band at their recorded 400-game rates (3 re-measured), every live card sourced or on the allowed sourceless list, rarity caps on rewards and fights, the docs
run node tests/unit-themes-2026-10-19.js   # 2026-10-19 (package UC): canonical/unit-themes.json fresh and whole: every creature card (live + pool) has a biome, family, faction, size and base body; the hand-checked overrides; existing and proposed Dire / Elder variants well-formed and inside budget v3; the hub's Units by theme tab (db unitPicks, Copy JSON, the post-balance queue)
run node tests/animal-tags-2026-10-19.js   # 2026-10-19 (package UT): every creature card has an animal, subtypes from the fixed list, the otters faction is Base (27), the Hummingbirds stay (12), the Codex animal chips and filter, the tutorial copies at Level 0
run node tests/level-curve-2026-10-19.js   # 2026-10-19 (package LV): the level curves (enemy 1.25%/map, your level by the Forge), the endless floors, overrides (<= 2x the rule), every main fight green, the absolute trend, the docs (~10 s)
run node tests/forge-curve-2026-10-19.js   # 2026-10-19 (package BF): budget v4 N(L) = (Base-1+L)(1+L/20), the Forge curve (monotonic, majors 4/7/10 > 0, inside N(L)), the anvil strip (~5 s)
run node tests/side-maps-2026-10-19.js   # 2026-10-19 (package BF): every side map counts at least a map past its parent (enemy level, Shield, lower curve targets), the BF measure (~3 s)
run node tests/server-overrides-fold-2026-10-19.js   # 2026-10-19 (package BF4): the live server card overrides folded into cards.json and balanced (Dragons Mythic / Divine / Ancient), Map 0 node edits, the proposed SQL (~1 s)
run node tests/easter-eggs-2026-10-19.js   # 2026-10-19 (package EE): the Easter-egg category, no source gives one out, "???" until seen, Evomax
run node tests/position-beam-2026-10-19.js   # 2026-10-19 (package EE): the Galactic Condor's Position Beam from the centre, a side and the edge
run node tests/rc-2026-10-19.js   # 2026-10-19 (package RC): raid cards almost never drop (one 1.5% chance; seeded 2,000 claims / fights < 3%), claims pay pack / faction cards at the level's floor + trophy shards by tier, the Forge's Raid tab (recipes, exact deduction, a Level-1 copy, unseen = "?"), shard storage + cloud fallback + the proposed SQL, texts in 12 packs
run node tests/nv-2026-10-19.js   # 2026-10-19 (package NV): the 🌰 Home in the tab bar (no map strip on phones), the pre-battle screen v2 (your BR, your side's parts and total, the boss card, a Start button), the raid rank emblem, a raid's Play again (a fresh raid fight), admin wins not scored, the raid damage breakdown and the running stats tally
run node tests/raid-ally-rows-2026-10-19.js   # 2026-10-19 (package RB): 200+ seeded ally plays in the page's raid fight, none outside the ally's own row (ally units hold their row: holdRow)
run node tests/raid-rb-2026-10-19.js   # 2026-10-19 (package RB): raid damage = bramble damage x rank (no x15), a win 1,000 x rank, 200k x3 + 500k, elders 50, the weakening curve, cap 250, the rescaled tiers, locale numbers, no formula for players, TX keys + 12 packs
run node tests/raid-rb2-2026-10-19.js   # 2026-10-19 (package RB2): the arms' and the tail's bramble 350 a fight (was 420), the Core's 200, the elders' ceiling 55, saved edits at RB's numbers onto them (scale 3), the editor's new part, the boss's 3 plays a turn, the measured fights + doc
run node tests/raid-thorns-rows-2026-10-19.js   # 2026-10-19 (package TS): a raid's middle / back rows swing for real: Thorns, Spiteful, Counterattack, Poison / Bleed / Freeze / Sap on hit, Armor, Evasive, Guardian and Cleave in the struck row, the kill (On Kill, Bounty, On Death), the rows' upkeep
run node tests/raid-row-parity-2026-10-19.js   # 2026-10-19 (package RR): every skill on a middle / back-row raid unit has its front-row shape: swing shapes on the row it aims at, the round start, slot refills into its row, arrival, shots
run node tests/ts-status-chips-2026-10-19.js   # 2026-10-19 (package TS): status chips on the card's top edge at every size (2 / 3 / 4 slots, "+N"), clear of Attack / Health; Playwright at 390x844 (raid + fight) and 1366x768
run node tests/deck-sync-2026-10-19.js   # 2026-10-19 (package SY): cross-device decks: two devices + a fake player_decks; uuid ids (the root cause: deck-xxxx ids refused) and the one-time move, debounced push, pull on load / wake, merge by updatedAt (an older offline edit never overwrites), deletes with a toast (never silent), the proposed columns' fallback, per-copy uids across devices, per-account seen list, the indicator, TX keys + 12 packs
run node tests/bu-2026-10-19.js   # 2026-10-19 (package BU): the speed gates (3x/4x/5x at Maps 20/40/60, admin all, TX lock hint + 12 packs), the centre column always legal when empty and always in the phone's framing, castle numbers on the HP bar (its fill's end since U3), the Cleave crescent on the target row, the drawn tentacle
run node tests/u3-2026-10-19.js   # 2026-10-19 (package U3): the 🌰 Home in the top-right cluster, the compact phone map strip, Kraken's Reef (the raid bramble, its Tentacle Smack, its portrait, the tentacle from its tile), the raid rows closer, the faded turn meter (Turn N, the tick, the last 3 turns), castle numbers at the HP fill's end
run node tests/u4-2026-10-19.js   # 2026-10-19 (package U4): the Codex's switches (✓ box on, empty off), set filters ringed, ✓ on chosen chips, the 🔨 Forge after Home and Arena in the Play cluster, the deck popup's Sort: Advancement
run node tests/ux-2026-10-19.js  # 2026-10-19 (package UX): the tutorial node summed up like a skirmish (its real deck, BR, Health; no Field), the Forge's copies sheet (groups by level + treatment), the ×N copy badges + breakdown, forging on the centre stage, the Codex's base level by default (Base level / My best, per device) and its card-type chips; Playwright at 390x844 (touch) and 1366x768
run node tests/hb-2026-10-19.js   # 2026-10-19 (package HB): the hub's 🎚️ Budget & stats tab (budget constants, card Attack / Health, the special monsters; budgetEdits / cardEdits / monsterEdits in a stub db, live recompute, no page scroll at 390 / 1366) and tools/hub/apply_balance_edits.js on a temp copy of the files
run node tests/raid-reward-card-2026-10-19.js   # 2026-10-19 (package RW3): a raid's card reward shows as the card (tile, full name, rarity, Pack / Faction card, a tap to its details) on the raid fight's results and the claim screen; the owner's "Honeybrew" was Honeyjoe Brewer's name pill; 390 / 1366 screenshots in docs/screens/rw3/
run node tests/skills-sk1-2026-10-19.js   # 2026-10-19 (package SK1): Sentry N, Formation, Isolation, Anchor, Expose (hiding) / Exploit (tokens), Punish (flag), Siege (+ the Demolisher alias), Spoils, Venom Pulse, Cure / Heal / Cleanse; the triggers × actions, registry, costs, texts in 12 packs, decisions
run node tests/equipment-hazards-2026-10-19.js   # 2026-10-19 (package EQ): equipment on the slots (lone pieces, one equipping round, the piece stays when its unit dies), Weapon Master, Pry, the five slot hazards (as triggers and actions where they fit), the On Enter Slot trigger and slotEntries, the CPU, the new cards, Creeper's art, the board hooks and TX keys
run node tests/ed-2026-10-21.js   # 2026-10-21 (package ED): one result per match (auto-win / last blow + Quit + Continue, a stale copy pays nothing, the results' buttons wait), the enemy's level on a skirmish's preview and the editor's Enemy level, ✏️ card editing in the editors, Art rejected (artReview via saveCard) + its filter, the Codex's Create card, the kind chip, count-only deck edits, Tutorial II's showcase; Playwright 1366 / 390, docs/screens/ed/
run node tests/tx-2026-10-21.js   # 2026-10-21 (package TX): the type hierarchy (eagle -> Raptor -> Bird, Aquatic a habitat), the re-tagged species, the engine's type checks through it, Changelings for every type, the skill filter's families and groups, the sorts, the reveal map (Tide from Map 2, Diurnal in the tutorials)
run node tests/mx-2026-10-19.js   # 2026-10-19 (package MX): the raid Shield 50 falling with the raid (fight, editor, lines), the 🗝️ badge at 0, swaps only for clearly better cards (weaker / equal / stronger)
run node tests/bx-2026-10-21.js   # 2026-10-21 (package BX): Swarm at the bramble, Wave into the frontier, Archer N (On Action x Arrow N) and the drop look, the frame layers' host, fire attacks, Greyplume Fledgling, Dive's Sprinter tag
run node tests/game-texts.js   # 2026-10-15: TX keys + the docs/game-texts.xlsx export/import round trip (~45 s)
run node tests/rewards-pass-2026-10-21.js   # 2026-10-21 (package RP): one category a card, no map reward in a pack pool, the faction reward track's rarity gates and pacing, plain Maps 0-1 rewards, the Devilry / Ecclesia / Evomax gates, side maps' one unique card and gates
if [[ "${1:-}" == "--e2e" ]]; then run python3 tests/e2e/live_two_player.py; run python3 tests/e2e/ui_smoke.py; run python3 tests/e2e/flows.py; run python3 tests/e2e/snaps.py; run python3 tests/e2e/i18n.py; run python3 tests/e2e/hero.py; run python3 tests/e2e/rarity_limit_craft.py; run python3 tests/e2e/a11y.py; run python3 tests/e2e/codex_perf.py; run python3 tests/e2e/emoji_perf.py; run python3 tests/e2e/filters_2026_10_19.py; run python3 tests/e2e/codex_cx_2026_10_19.py; run python3 tests/e2e/tentacle_fx_2026_10_19.py; run python3 tests/e2e/tx_2026_10_21.py; fi
if [[ $fail == 0 ]]; then echo "ALL PASSED"; else echo "SOME SUITES FAILED"; fi
exit $fail
