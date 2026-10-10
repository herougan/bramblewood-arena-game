# Changelog

Headline changes only, newest first. The detail lives in git history, `MASTER.md` and the design addenda.

## 2026-10-10 (23:50)
- **Home:**
  - the background is full size straight away when you come back from Conquest (only the menu does the page turn);
  - a soft light from the top, a dark band at the bottom, and a brown spotlight that leaves the menu lit;
  - the Quests and Codex notes sit a little closer to the menu.
- **Achievements:** a 🏆 note on Home (shows how many are ready to claim) and a 🏆 button on the Arena page.
- **Quest board:** it swings up from below, and loose notices flutter off it.
- **Cave maps:**
  - one or two snails creep across in straight lines, very slowly, leaving faint blue trails;
  - the crystals in the map art sparkle now and then;
  - on dark maps (caves, the grotto and the swamp) a predator's eyes glint in the dark, away from your lantern.

## 2026-10-10 (23:30)
- **Map numbers:** the Outskirts is Map 1, so Pebble Beach is Map 3 (3-1, 3-2…) and the tutorial is 1-0. Side maps use a letter: Smugglers' Grotto fights are 3-A-1, 3-A-2… The side skirmishes added earlier are on Maps 11 and 13.
- **Maps 14–20** are on the world map as Reserved; they don't open yet.
- **Map intros:** the map card shows the first time you ever open a map, and for the first map you open each session.
- **Cave maps** (Caves & Alcoves, Smugglers' Grotto):
  - they open in darkness with the map's name, then a light spreads out from the centre and settles into the lantern at your pointer;
  - away from the lantern it's much darker, and the darkness now covers the skirmishes and the trail too.
- **Map page:**
  - the title banner and the admin layout bar fade away while your pointer is over them, and clicks go through to the map (buttons still work);
  - the map arrows are greyed out while you edit the layout.
- **Home from Conquest:** the Home chip in the map list is gone. Use the top-right icon, or the 🌰 chestnut over a compass at the top of the World map.
- **Map castles and leaders:** each of Maps 1–10 has its own castle and a Heroic leader.
  - Castles: Outskirts Watchtower, Hedgerow Burrow, Tidewall Fort, Drowned Bellhouse, Ashen Bastion, Lantern Warren, Acacia Kraal, Wolfsbane Lodge, Coral Spire, Bog Stilt-House. Each unlocks when you beat that map's boss.
  - New castle passives: every unit +N Health, Flying units +N Attack, heal N each round.
  - Leaders (the boss's first-clear reward): Sergeant Bramblefox, The Thistle Baron, The Old Shell, The Drowned Matriarch, Yeti Chieftain, Echo Matriarch, Pride Queen, Wolfsbane Alpha, Reef Admiral, The Heron Hag. If you've already beaten a boss, you get its leader the next time you open the map.
- **Leaders must be Heroic or above.** The Wandering Traveller stays a Base card but has the new 👑 **Leader** passive. A saved leader that doesn't qualify stays in the deck, shows a warning and sits out matches.
- **Special rarities:** Special, Dev-Legendary, Dev-Ancient, Event-Legendary and Event-Rare, listed after every normal rarity together with Quest and Quest-Unique. Each counts as its normal tier for power and copy limits.
- **Castles level to 20:** temper them in the castle picker for +1 starting Health per level.
- **Armoury:**
  - a ‹ Back button in the deck editor;
  - the top row's Wait badges are no longer clipped;
  - hovering a card in the deck-large-preview shows its details after 1 s;
  - a new **Medium** view (deck-medium-preview) shows the castle on the left and the leader's art on the right, without the card list.
- **Card editor:** the art choices read just "Normal" and "Extended".
- **Music:**
  - new loops: *Sand and Banners* (Arena), *The Long Road* (Conquest map), *Drums Under the Hill* (Raids);
  - new stings: *Laurels* (victory) and *Fallen Leaves* (defeat).

## 2026-10-10 (23:15)
- **Music library, the Songbook:** five composed place themes, played by synthesised instruments so they're royalty-free by construction:
  - Shop: *Flour and Copper*, a waltz;
  - Armoury: *Tent Pegs*, a march;
  - Forge: *Bellows*;
  - Nest: *Down Feather*, a lullaby;
  - Codex: *Margins*.

  Each loops with small variations and crossfades as you move between places. Home keeps the calm piano and battles keep the seven people bands. The Effects Lab has a new **Music** tab to preview everything, battle bands at any intensity included.
- **12 new sound effects:** Shield Call drop, Backstab, Boomerang whirr, Shelf pick, Pay at the counter, Map unrolls, Mystery boing, Tape rip, Bow creak, Burn away, Ice shatter, Night swell. They're wired into the game and listed in the Lab.
- **New skill effects in battle (and in the Lab's Skills tab):**
  - the Anti-Air boomerang with feathers;
  - Shield Call's falling shield;
  - Backstab's dagger and slash;
  - ice shards and green drips on cold and poison deaths.
- **Effects Lab:** the page now always gets the newest script; the hub had been serving an older copy without the Beach shader option.

## 2026-10-10 (22:40)
- **Map loading veil:** entering a map shows a parchment card with the map's icon, name and number. It lifts once the map's effects have drawn their first frame (at least 0.35 s, at most 1.8 s), so nothing half-loads. Re-renders of the same map keep the live effect layer instead of rebuilding it, so it no longer blinks.
- **Talon Archer** (2/8 Flying, Arrow 2, Diurnal): an eagle that holds the bow in one talon and draws with the other. It isn't in a pack or on a map yet; that's your call.
- **NEW! in battle** shows only on enemy cards.
- **GSAP 3.13** in the game (it was 3.12.5). Every GSAP plugin is free from this version on.
- **Art queue:** `art_staging/jobs_2026_10_10.json` has PixelLab prompts for the 21 cards from tonight that still have no art.

## 2026-10-10 (22:30)
- **Shop shelves:** the Shop is a bakery and apothecary wall now.
  - Wooden shelves hold the goods: single packs on a straight shelf, sets of 10/25 tied with twine on a crooked one, and crates of 50/100 on a stepped one, with jars and loaves in between.
  - Each item has a handwritten masking-tape label and a price tag.
  - Hovering an item shows a card with its details. Clicking it puts it on the counter below, where the Open button is.
  - The wall scrolls when it fills up.
- **Cream foil:** boosters, on the shelves and when you open them, are a cream metallic foil with grain instead of pastel rainbow.
- **Mystery Booster** (❓, 80 🍁): 3 cards from its own pool of 8 oddities: Two-Headed Calf, Upside-Down Bat, Teatime Toad, Mirror Moth, Snail Mail, Glass Golem, Wrong-Way Salmon and Inside-Out Hedgehog.
- **Flea Market:** player trading moves out of the Shop into its own page, which unlocks on Map 30. Map 30 doesn't exist yet, so for now it opens only through Admin → unlocks.
- **Skirmish codes:** maps count from **Map 0**, and every fight has an X-Y code (0-1, 0-2 … the tutorial is 0-0, a raid boss X-R, Smugglers' Grotto 2-G1). The codes show on the map, in the tooltip, on the fight panel and on the VS screen. Save data is unchanged.
- **More fights:** Basalt Foundry (Map 10) and the Sundered Peak (Map 12) get two side skirmishes each, so both have 10. Side skirmishes branch off the trail without blocking it, and their castles are tuned with the map auto-tuner.
- **One NEW! tag:** the pack-opening stamp's look (coral to gold, cream letters, wine outline, tilted, glowing) is now used everywhere: a first sighting in battle, the pack summary, the reward reveal and the "new cards seen" list.

## 2026-10-10 (22:00)
- **New skills:**
  - **Shield Call** (🛡️) on the new **Shieldbearer Hound**, 2/5 for 2 in Pack 1. The first time an enemy skill targets one of your units, a 0/10 Guardian shield (+1 Health per level) drops into its place and the unit steps to the nearest slot, so the skill hits the shield. Once per hound.
  - **Backstab N** (🗡️, D21) on the new **Stoat Cutthroat** (3/8 for 1, not in a pack yet). It always attacks the nearest enemy unit and never the castle; with no enemy units it holds its swing. It hits for N more when the unit isn't the one directly in front of it.
- **Pack opening:**
  - Opened cards fly down into the list.
  - Opening several packs lays out up to 10 at a time; you open each one by passing over or clicking it, and all of them must be opened.
  - 100 or more packs arrive as a crate.
  - Duplicates stack (with a count once there are over 100), special finishes get their own stack, and **NEW!** shows once per card per opening.
- **Cards:**
  - Skill icons on cards fit 3 to a row. In the hand and on the board they show one slot that cycles through the skills every 2 s.
  - Enemy cards you meet for the first time get a **NEW!** tag.
- **Test lab:** skill rows and number inputs are vertically centred, and the skill list keeps its scroll position when it redraws (the same fix applies to every panel that re-renders).
- **Docs:**
  - the card list for balancing (Maps 1–5 rewards, Pack 1, with a proposal);
  - the GSAP / shader / VFX exploration, with a new **🧪 VFX Playground** tab in the hub (9 live sketches).

## 2026-10-10 (late)
- **Arena themed by day:**
  - every day rolls one day/night effect (the 3-round cycle most days; a 1-round "Restless Sky" about 8%; Dusk Start; Long Night; Midsummer), plus a second field about half the time (Frost, Fog, Spring Rain, Heatwave, Timber Fair);
  - Open rules most days, Collapse about one day in eight.
- **Day and night:**
  - a wolf howls at nightfall and a rooster crows at dawn; the messages just say "Night falls." / "Day breaks.";
  - **Nocturnal / Diurnal take two numbers**, e.g. "Nocturnal +5/+6: at night gain +5/+6". The stats arrive with a swell, a green aura and drifting spores that stay while it lasts, and leave when the phase turns. The old on/off form reads as +1/+0.
- **New cards:**
  - **Weredog** (2/5, Nocturnal +5/+6);
  - **Ironmaw Warwolf** (9/26 Epic: Swipe, Bleed 2, Armour 2; Kip the monkey rides it);
  - **MissingNo.**, card #0 (hidden);
  - village folk: Parish Sergeant, Land Tiller, Village Miller, Night Watchman, Otter Ferryman, Otter Netmender, Nectar Vintner and Dawn Bellringer.
  - The new cards (all but MissingNo.) are in Pack 1.
- **Species:** every card has an animal type or Elemental, grouped into phyla (Beast, Bird, Arthropod, Scaled, Aquatic, Crawler, Elemental), and hybrids show both. The card details show it, and the editor has a Species field. See the Card types sheet.
- **Skills:**
  - effect lines open with their icon;
  - Flying and Earthquake text simplified;
  - **Bleed** hurts only when the unit attacks or uses a skill, and Bleed and Poison lose 1 stack each time they hurt. New **Festering** passive (🦠): while it's on the field, stacks don't wear down.
  - **Sweep N** reworked into a cleave: the swing spills N damage onto the units either side of the target.
  - Overwhelm is renamed **Stampede** (🐘): leftover damage from a kill carries into the castle.
- **CPU:** it still pays costs and saves up by pitching, and now picks the card that fits the board (walls under pressure, damage when your castle is low, Anti-Air and Flying against fliers, cheaper Wait when it's urgent) instead of the most expensive or a random one.
  - Side effect: Otters vs Hummingbirds starters now measure ~66%.
  - The tutorial rival brings one flier at most, keeping every side above 70%.
- **Music:** Battle music and Menu music each have a volume bar (no more on/off); the old Music slider is now Ambience.
- **Play tabs:**
  - Test shows only in admin mode;
  - the Raid tab is named after the first raid until a second opens, then "Raids" with a picker, and it goes full window like the Arena.
- **Arena defeat:** the result pills read on the dusk card, and Try again shows "−1 🎟️" in PvP.
- **Test lab:**
  - changing the Test Card updates it in place (gold flare and swell for an upgrade, a grey wash and a soft tick for a removed skill) instead of resetting the field;
  - click the empty board for a Damage / amount / Heal menu, then click a card. The log credits "Tester".

## 2026-10-10 (night)
- **Cards:**
  - **Normal art is the default:** the art sits in a window inside a rarity-tinted walnut frame, with a solid plate under it for the stats. A card can be set to **Extended art** (to the edges) in the card editor.
  - The card tooltip no longer says "Costs N lumber to play".
- **Anti-Air N** (new skill, 🪃): never misses a Flying unit, and hits Flying units for N more.
  - **Otter Centurion** gets Anti-Air 1 and becomes 2/8 (it was 3/9), so Otters vs Hummingbirds stays ~58%.
  - On Otter Kit it would have broken the tutorial for Hummingbird players.
- **Wandering Traveller:** 6/11, Wait 3, +1 Lumber when it's ready.
- **Ranks:**
  - Sub-bosses and bosses can earn **SS** (no castle damage) and **SSS** (no damage and a win by round 8).
  - Top ranks pay extra: S +25%, SS +50%, SSS +100%.
  - From map 5 on, an S-or-better win has a 12% chance to turn up a card from that map you don't own, once per map.
- **Defeat screen:** the Victory card at dusk (slate and moonlight, drifting ash), plus a quote from Sun Tzoo, Isaac Newt, Abraham Lynxcoln and 21 more.
- **Leaders:**
  - your leader's light stops at the middle of the field;
  - the rival's leader gets a crimson pillar, a banner and a low rumble.
- **Clearer effects:**
  - stat gains pop in gold (and the stat swells), stat losses in violet (and it shrinks);
  - a crackling aura flares behind a card whose effect triggers.
- **Battle:**
  - fast-forward shows 1 to 4 arrows;
  - the victory wave is twice as quick;
  - a forfeit's sign holds 0.1 s less.
- **Energy** refills 1 every 5 minutes. Fight, Fight again, Play again and Next are greyed out without enough Energy, and re-enable as it refills.
- **Skirmish card:**
  - the enemy deck level is coloured by the gap to yours (your own number is gone);
  - the deck list shows after a Rank B clear, with no Show/Hide button.
- **Maps:**
  - Smugglers' Grotto has a sunlit "Way out" linked to the first fight;
  - caves are about 50% darker away from your torch;
  - the previous/next map arrows sit in the bottom corners.
- **Skirmish editor:** the content scrolls above a fixed footer, and Battle type / out-of-moves sit in their own "This skirmish's battle" box.
- **Home:**
  - Deck is now **Armoury**;
  - once the Arena opens, it takes the Codex's tile and the Codex becomes a pinned note;
  - Community opens a Community page with Ranking / Friends / Guild tabs.
- **Arena and Test lab** go full window like Conquest, with the tabs at the bottom centre. A 🏟️ Arena button sits beside 🏠 Home on the map.
- **Notices (quests):**
  - three daily notices at midnight and one more at 6 AM, noon and 6 PM, each counting from when it's posted;
  - ranks D to SSS with the reward on the card; A and up show their letter, and S to SSS are rare and pay a lot;
  - one free swap a day;
  - a claimed note keeps its size.
- **Laurels 🌿:** a new material, earned only in PvP Arena fights (3 a win, 2 a draw, 1 a loss). Arena Leaves are now under 5 and Dust is 0 or 1. The results screen no longer scrolls for nothing.
- **VS screen** shows both deck levels.
- **Scrollbars:** a thin walnut thumb.

## 2026-10-10 (evening)
- **Victory: cards no longer fly right.** The round's last board update ran a slide animation just before the match ended; it's skipped when the round ends the match.
- **Bounty bubble:** an enemy bounty card shows a reward-coloured "+1 🪵 Lumber" bubble above it (instead of the 🏆 badge) while you hold a card, and for 3 seconds as your turn starts.
- **Badges:** ability symbols sit closer; repeated shields overlap more; two-part symbols (Earthquake, King Slayer) tuck together.
- **Shops:**
  - each merchant unlocks the next pack tier: the Traveller's Cart (map 3, Sprout Pouch), the new **Ember Peddler** in Basalt Foundry (map 11, Acorn Chest), and map 19's merchant later (Golden Bramble Case);
  - once a second merchant is found, the page and the nav are called **Shops**.
- **Wandering merchants:** one a day, parked on one of your opened maps. Find their barrow to get a pack of the best tier a quarter off, once that day. The Shops page only says someone is out there; listing where they are (and the timer) is the planned QoL level.
- **Beach:** Pebble Beach has its own effect (warm sun, glints on the shallows, foam lines, drifting spray) and its own surf-and-gulls ambience. It used to borrow Sunken Hollow's water.
- **Calm music:** a slow, sparse generative piano on the map and in menus, in the spirit of C418. It has its own switch (🎹 Calm music) and follows the 🎵 slider.
- **Tutorial:** the rival leaves out Quick cards and brings fewer fliers, so every side is still an easy win after the basic-card changes: Otters 82%, Hummingbirds 73%, Both 92%.
- **Docs:** inspiration from Super Auto Pets and Tooth and Nail units (Design tab).

## 2026-10-10
- **Effects Lab now shares the game's engine:**
  - every build re-copies the lab's effect code from the game, uses all of the game's stylesheets (it used only the first), and inlines the same GSAP build;
  - this fixes Draw flip, Victory toss, the crit stamp, flyer feathers and the new damage-number bursts, which needed GSAP and didn't load in the hub.
- **Deaths:** "Normal" (no more "knocked out") is one smooth topple from upright to flat, with no bounce after.
- **Shock:** soft electric glows (14–26%) flicker over the card in a few places, with a 1px jitter, instead of a clipped RGB glitch. "Token dies" is renamed **Shatter**.
- **Cards:** the bottom band is a faint 7–8% white wash ending sharply above the stats (rarity is on the border). The low-HP fade is unchanged.
- **Water** caustics and glints are about half as bright, in the game and the lab, which now runs the shader at the game's strength.
- **Foundry:** Terraria-style lava dust, tiny bright embers rising with a soft glow.
- **Hub:**
  - Design has subtabs that show one sheet at a time, and Claude's guide shows only the doc you pick;
  - the lab's faint hint lines and the Balance win-rate colours in dark mode are now readable.
- **Ecclesia (D23), your Prayer model:**
  - Prayer = Prayer N on your board + the cards in your Removal Zone. Ecclesia cards need Prayer 🙏N to play (never spent).
  - Once a turn you can offer a hand card for +1 (a picker opens when you're 1 short).
  - New keywords: Worship, Healing, Lightning, Midas Touch, Divine Retribution, Satiety.
  - Nine new cards: Chapel Sparrow (Base) and eight Eyrie Heights rewards up to the Legendary Cathedral Eagle.
  - The old Grace cards now give Prayer. A full Ecclesia deck measures 74%.
- **Starting deck is editable:**
  - Admin → 🎓 Edit the tutorial → Starting deck has the shared, Otter, Hummingbird and Both lists, plus the tutorial rewards.
  - Default: 12 shared + 5 for your side + the 3 tutorial reward cards, which go straight into the deck = 20. Otters vs Hummingbirds measures 56%.
- **Tutorial progress per player:**
  - Each player's tutorial progress is now recorded: level 0–4 (not started, picked a side, in the fight with the guided step reached, lost a try, complete), their side and number of tries. It syncs to their cloud save.
  - Admin → 👥 Players lists everyone with level, tutorial progress, cards and wins. It needs the S1 database function ("apply it").
- **Wandering Traveller** is Wait 2 and a base card.
- **Hub:** the 🎮 Play button sits at the top right, on the title row.
- **Test:** the autobattler ghost check runs 144 fights instead of 36 (36 was too noisy).
- **New basic cards (your list):**
  - shared: Duck Paddler, Pond Trout, Meadow Frog, Forager Ant, Bee Knight and the new **Crossed-Eyes** (2/3 Flying);
  - Otters: Otter Kit, Otter Centurion and the new **Fleetfoot'd** (2/4 Quick);
  - Hummingbirds: Cobalt Fledgling, Crimson Recruit, Mosswing (shortened names);
  - leader: Wandering Traveller.
  - All start at level 0. Starter decks are the shared six ×2 plus your side's three (×3, ×3, ×2).
  - Otter starter vs Hummingbird starter is now 52.9% (was ~1%). The tutorial stays an easy win (87% / 82% / 98% by side).
- **Rarity is on the card border now** (green Uncommon, blue Rare…), not the bottom band. The band is a plain dark scrim for readability.
- **"Per Turn" is now "On Turn Start"**, with a first option for whose turn: both (every round), yours or the opponent's. Your turn is the round where you strike first.
- **Card editor:** the preview and art panel has its own right-hand column and no longer covers the form when you scroll.
- **Test Kit:**
  - **Manual combat:** ⚔ Attack (one real swing with every on-hit effect, arrows, Sweep and Frenzy; no round passes), 🛡 Get attacked, −1 / −5 / +1 / +5 and ☠ Kill on your card or the enemy facing it, and ▶ Fire any trigger moment.
  - **One skill at a time:** ◀ ▶ steps through all 69 skills.
  - **Custom triggers:** the Test Card has the card editor's own trigger rows. Cloning a card brings its triggers along, editable.
- **Skirmish editor, gallery pickers:**
  - "Enemy deck" is now just **Deck**, with an **Open card gallery** button: card tiles, search, an All/In this deck switch, tap to add a copy, − to remove one;
  - **Castle** opens a castle gallery;
  - **Leaders** has a "How many" setting (0–5) with one slot per leader. Tap a slot to pick from the card gallery.
- **One field style everywhere:** text boxes, dropdowns and checkboxes use the game's warm dark surface (no more pale blue browser fields), with a matching focus ring and custom checkboxes. Opt anything else in with the `bw-field` class.
- **Floating tab bar:** the buttons are pills, matching the bar.
- **Caged Fight (new, Arena → Challenges):**
  - your leader starts caged on the enemy board, 4 columns to the right, greyed under a translucent cage;
  - cage level = round((your deck level + enemy deck level) / 100), 0–10; cage HP is 5 at level 0, 6 at 1, then +2 a level, 25 at level 10;
  - break the cage to free your leader beside it. Until then, the leader can't be summoned;
  - vs Computer, or Pass & Play where both leaders are caged.
- **Opponent cards** have a faint red fade along their top edge (green on your own caged leader), so ownership is clear after Mind Control.
- **Victory no longer pushes cards right:** the board grid kept shrinking when the "+" targets vanished. Both rows now share one grid that never shrinks mid-match.
- **Skirmish editor (C2):** the battle type is set only inside Edit skirmish, and a saved choice no longer reverts.
- **Codex:**
  - locked or unseen cards stay hidden until you've seen them (in hand, on a board, or as a reward);
  - one "Your journey" list until you beat the first 20 maps, then themed sections (The Wildwood, The Far Reaches, The Old Powers, The Edge of the Map).
- **Card text scales with the card:** a card shown 2.5× larger has 2.5× larger text, wrapped the same.
- **Card levels codified:**
  - tutorial and starter cards start at level 0, everything else at 1;
  - major stat steps at 1, 3, 6 and 9, a minor one at 10.
- **Darkness** shows only if your deck has a Devilry card, as "★ held · ⛧ left".
- **Balance tab:** "Too weak" lists the weakest first, and the table header is readable.
- **Docs:** the archetypes note was rewritten (Swarm and Tide are keyword families, not archetypes), plus a starter-decks list, card levels, and Hearthstone inspiration.
- **Phone fixes (from your screenshots):**
  - Conquest scrolls on phones, and the fight panel scrolls too, with Fight pinned at the top. The chosen fight scrolls into view above the panel.
  - The tab bar no longer covers the trail.
  - Long-pressing a card no longer selects it or opens Save to Photos.
  - Hand cards' cost and Wait badges no longer collide (one icon plus a number from 3 up).
  - Crowded boards keep both Attack and Health readable, and status chips (🩸8) no longer cover the card.
  - "New fight" tokens stack instead of overlapping.
  - Toasts appear at the top, away from Pass turn.
  - The Nest's tip text isn't cut off on the left.
  - A drop highlight no longer gets stuck on your row.
- **UI:**
  - the victory screen puts Cards won and Rewards in two centred halves;
  - the map's house button is centred;
  - the card detail uses the game's dark theme instead of washed-out grey.
- **Rules:**
  - Heal removes Bleed counters first.
  - Stun is counters, and a stunned unit skips its whole turn, upkeep included.
  - Waiting units don't bleed from their own actions.
  - Cleanse N (curses first) has a proper cleansing animation.
- **Devilry:**
  - Dark Summon ⛧ (1 a turn, on top of your normal play, costs Darkness ★);
  - Darkness from perished units;
  - the keywords Devour, Ritual, Pitchfork, Sacrifice, Offering, Beware, Scare and Desecrate;
  - Imp 😈 and Devil 👹 card types with a dark aura on the frame;
  - Mind Control and Player Stun;
  - **ten new cards:** Cinder Imp (Base) and nine Basalt Foundry rewards, including The Sixfold.
- **Arena rules:** the Arena's rule set rotates daily (Long Night, Midsummer, Dusk Start, Timber Fair, Frost Week, Fog on the Moor, Standard), and whoever plays second opens with an extra card. Conquest fights can set their own rules.
- Reach (ignores Flying's dodge) is in the card editor.

## 2026-10-09 (night)
- **Second card-balance pass:**
  - 29 common and uncommon outliers moved half-way toward their rarity band: e.g. Dune Jackal 3 Attack, Jackrabbit Sprinter 3 Attack, Soldier Ant 2 Attack, Shepherd's Bark 14 Health, Rabbit Kit 3/2, Peak Condor 4 Attack.
  - Cards in band: 155 → 171 of 294.
  - Every map was retuned for it; seven fights needed card swaps, and Hedgerow Scouts kept its rabbits and foxes.
- **Found:** the hummingbird starter deck beats the otter starter deck ~99% of the time in simulation. Fixes are measured; it's your call (B6).
- New skill **Reach** (attacks ignore Flying's dodge), ready for the B6 fix; no card has it yet.
- **The Removal Zone comes alive:**
  - Every card sent there gives its owner 1 Echo 🕯️, shown on the deck badge.
  - **Remember N** cards come back from it once you have N Echoes.
  - Three new cards: **Echo Keeper** (Base), **Marsh Wisp** and **Bog Revenant** (Sable Swampmire rewards). Two swamp fights now use them.
- **Forgotten Ones 🕯️:**
  - A Remembered card now returns +1/+1 for every Echo it spent.
  - A new Swampmire boss reward, **The Unremembered** (Remember 3).
  - Marsh Wisp is now 2/4 and Bog Revenant 4/7: weaker alone, strong with Echo Keepers.
- **The Thistle Baron** (Thistle Fields boss) is beatable: ~23% → ~32%. Its Jackrabbit Sprinters were swapped for a Field Mouse and a Sapper.
- **Fights that were far too hard are fixed:**
  - The tuner wanted castle HP below the minimum, so these had been skipped.
  - Map 1's boss went from ~5% to ~43% for a new player's likely deck; the Grotto stash, the Roost and three cave skirmishes, the Condor Sovereign (10-9) and others were also fixed.
  - The main cause was Raccoon Nightcrew (7 Attack, Nocturnal). It was swapped out where it doesn't belong.
- **Tide, the second archetype:**
  - From round 2 the water alternates 🌊 Flow and 🐚 Ebb every round.
  - Tide units hit +1 on Flow and take 1 less per hit on Ebb.
  - Wash units push the enemy card facing them back 1 Wait on Flow (once per card).
  - 18 reef and beach cards are Tide. Seven were trimmed back into their rarity band: Dolphin Knight 3/4, Tide Spirit 2/5, Riptide Eel 7/5, Coral Current Eel 3/6, Pufferfish Bulwark 2 Attack, Hermit Crab 1/6, Cuttlefish 3/10.
  - Pebble Beach, Sunken Hollow, Coral Current, the Grotto and two Cinder Wastes fights were retuned.
- The balance tool can measure just a few cards (`--only=`); the map retuner respects castle-HP floors and swaps cards when it hits one.

## 2026-10-09 (evening)
- **Day and night:** fights alternate Day and Night every 3 rounds; at dawn both sides draw a card. 23 Nocturnal cards (owls, bats, raccoons…) hit +1 at night; 19 Diurnal cards (hummingbirds, bees, eagles…) hit +1 by day. Not in the tutorial or live ranked.
- **Field cards:** Blizzard, Heatwave, Spring Rain, Thick Fog and Full Moon. They are free, take no play, draw a card, and change the field for 3–4 rounds (one a turn). The Tundra's Frozen Ground comes back when a played field ends.
- **Lumber and draws from cards:** Beaver Lumberjack (+2 Lumber when played), Courier Pigeon (draw a card). The experimental Lumber trickle is gone.
- **Map editor:** drag the Armoury, Nest, Notices, the well and the caves; they publish with the layout.
- Every map retuned for the new rules.
- **Enemies play their big cards:** 31 enemy decks with 3+ cost cards now carry their map's Lumber maker, and were retuned.
- Bosses keep their namesake card again (the Glacial Ape-King, the Orca Vanguard King, Titan's Shadow, the Cave Warlord). The Tundra boss has a proper Tundra deck.
- Each field has its own look on the board: rain, fog, heat shimmer, moonlight.

## 2026-10-09
- Two new maps between the Outskirts and Sunken Hollow: **Thistle Fields** 🌼 (meadow critters) and **Pebble Beach** 🏖️ (crabs, gulls, pelicans). Map 1 and 2 progress stays open.
- First sub-map: a sea cave on Pebble Beach opens **Smugglers' Grotto** after Gull Gang. You zoom into the cave mouth; inside are the first elites and rarer rewards (Uncommon and Rare eels, an octopus).
- The Arena and the Shop now open on maps 2 and 3 (Thistle Fields and Pebble Beach), so they arrive at the same point as before.
- The first Nest egg drops on the 4th map (now Sunken Hollow).
- **Promotion:** in the Forge, a Worker Ant at Lv 3 can become an Ant Warrior (new), a Forager Ant or a Soldier Ant. Your decks get the new card; the ant goes back to Lv 0.
- Your Hero's rarity climbs with its level: Common, then Uncommon at 5 and so on up to Legendary at 90.
- A new opening screen: a slim panel on the left, the scene bright on the right with a fan of real cards, a letter-drop title with a gold sheen, and drifting tips.
- Archetype design sheet: 10 archetypes and the Elder / Outer / Forgotten Ones trio. It's in the hub's new 📐 Design tab, with the skills, balance, card-stage and grab-bag audits.
- No sideways scrollbar flash during page turns.
- Raid ghost decks stay full even when many cards are one-copy (Unique, Legendary).
- **The CPU saves Lumber** for costly cards. Before, enemies almost never played them.
- **Card balance:** every card is measured by simulated matches. See the hub's ⚖️ Balance tab and the report in 📐 Design. Ant Warrior was trimmed to 3/3.
- **Skirmish editor:** simulate against a new player's likely deck; Auto-tune Armour to the fight's target; a whole-map difficulty strip. Thistle Fields, Pebble Beach and the Grotto were retuned with these tools.
- The hub opens on a short 🎯 Action items list; the long Master doc is retired.
- **Every card has a rarity** (from measured strength, capped at Rare for now). 39 outliers moved half-way toward balance: Feral Tomcat 3/3, Honey Badger Fury 3 Attack, Raccoon Nightcrew 7 Attack, and so on.
- **Every map retuned** against a new player's likely deck: 85 of 96 fights changed. Old 0% walls (e.g. Savanna Reaches elites, the late bosses) and 100% pushovers are gone.
- **Big cards act on arrival:** dragons breathe 4 damage on every enemy; big brutes hit the enemy opposite for twice their cost; Elder Willow, Elderhorn Monarch and Riverworks Bastion refund 2 Lumber; Glacier Yak, Elder Tortoise, Voltaic Eel and the Carcass delay the enemy opposite.
- **New archetype: Swarm.** Ants and bees deal +1 damage for every 3 other Swarm allies on their side. Hive Mind (Worker Ant, Honey Bee, Forager Ant): when one dies, your newest Swarm ally gains +1/+1.
- **Experimental Lumber trickle** (Settings, off by default): +1 Lumber every 2 or 3 rounds for both sides. Live ranked matches and the tutorial stay on the standard rules.
- Sunken Hollow and Quill Line retuned with themed cards from later maps (orcas and humpbacks in the Hollow).
- **Fixed:** the game failed to load from 09:10 to 10:12 (a broken line in the main script). A syntax check now runs before every release.

## 2026-10-08 (late)
- Skirmish nodes: green when cleared (no tick), with a sheen.
- The card viewer is "Inspect"; only admins pick foils there.
- 11 critters and a Guppy join the card list.
- A small cave in Sunken Hollow to chat with; the 4th visit gives the Tiny Cave Dweller.
- Critical HP colour stays at 0 HP; attack turns pink when it's below 25% of printed.
- Skirmish Armour (a blue bar) replaces castle HP in skirmishes. Skirmishes can have a castle and optional CPU leaders, which the CPU may summon.
- Armour shows as 🛡 pips.
- Bites crunch, with the back teeth closing a beat later.
- **Packs v3:**
  - packs glow with a hint of their best card; rare jackpot packs;
  - sparks on rare pulls; a rarity banner;
  - auto-advance, a collection tray and a sticky footer;
  - 10 or more packs lay out on a table to slash at once into one pile;
  - packs no longer give Dust;
  - the Golden case gives Krooni 👑.
- Admins can set their own currencies.
- The Nest Nurse (Unique+ or the Wandering Traveller); eggs hatch into a random card.
- Page-turn transitions between screens.
- The Wandering Traveller is everyone's default leader.
- Energy climbs by map: 1 then 2 on map 1, 2 then 3 on map 2, 4 on map 3, then 5, 6, 7… Bosses cost double; "Full" at max.
- Header controls are all the same height; tips drift slowly and fade out with a zoom.
- The skirmish editor can make a new card and drop it straight into the deck.

## 2026-10-08
- A reward reveal after a win: cards shine into view with NEW!, and new fights drop onto the board.
- Flying units keep flying through the fight and no longer jerk back after a hit.
- Skirmish panel: Fight on top, a big enemy deck level, rewards on the right. Starting enemies are Lv 0.
- Faster map-to-map transitions; simpler edge arrows.
- Esprit: +X/+Y whenever any ally is played.
- Admin tools only for admins.
- Winners are tossed into the air at the end of a fight instead of dancing forever.
- Damage numbers burst out with an icon (👊 for crits) and pop higher on enemy cards; gold sounds sparkly.
- Cards emote: 22 emoji moods in battle, including reactions to poison, freezing, stuns and kills.
- Fixed a landed card occasionally jumping into its slot.
- The victory toss finishes before the results appear.
- Foils: no more red line; Starlight sparkles are their own finish; a new Lattice foil to try.
- Effects Lab in tabs, with card sizes, damage numbers and weather.
- Cards lean as you drag them across the board and land at that angle; a card dropped nowhere flies back to your hand.
- Skill text starts with the keyword ("Bleed 2 — …").
- The results window fits on screen; after a fight only the board stays when you look at it.
- Skirmish rewards show what the first clear gives, with your rank beside them.
- The Forge has three benches: Upgrade, Refine (finer foils) and Enchant (Materia).
- Shiny cards fight as Shiny units, and so do the units they spawn.
- Decks save when you press Save.
- Sharper battle motion in Open fights; dragged cards fly back to your hand.
- A livelier front screen: dancing otters and a standoff.
- Pick your ★ main deck; decks can go over 20 while you build, and only a 20-card main deck can be played.
- Shiny is a colour shift of the art; set discounts are 5/6/7/7.5%.
- Pack editor (admin): odds, foil chance and finishes, and what's inside each pack. Foils from packs are real foil copies.
- Claw marks, bites, stings and pecks when units hit, each with its own sound; the first skin, Ember Chipmunk, breathes fire.
- Security headers and a weekly CodeQL scan.
- A glorious win screen; reward cards beside every skirmish's name; Fight again on cleared skirmishes.
- Skirmishes no longer collapse by default; Tundra fights are fought on Frozen Ground.
- Hits recoil, flyers fall with a burst of leaves, and lightning lights the cards from where it strikes.
- The map fills your screen and glides between regions; a well waits by the pond on the Outskirts.
- New Profile, an Achievements page, and Notices (quests) as a cork board.
- Shiny cards (1 in 200), pack set discounts, and Disenchant extras.
- Card names in every language.
- Opening a pack is an event now: tear the foil wrapper, then turn each card one at a time, with a rarity glow and a big NEW! for cards you've never had. Buy a set of 10–100 packs to skip or open them all at once.
- Codex → 🔍 View large: spin any card in the light. Also from the Nest (🔍) and from a pack's summary.
- Effects Lab: a card treatment centre with 10 foil finishes.
- Skirmish chains can be re-linked in the editor (all or any of the earlier skirmishes).
- Battles feel better: knock-outs fall with weight, flyers soar off the ground, and triggered abilities flash a rune.
- Victory! (or Hurrah!) and Defeat!; unlocked cards break their padlock, newly seen cards get a NEW! tag.
- Conquest: the map fills the screen with Home and Settings built in, weather covers it all, and it only rains about one hour in ten.
- A livelier Home with rotating tips; Codex stats on demand; a clearer deck preview with charts.
- Left a fight by accident? ▶ Rejoin from Home.

## 2026-10-07
- Cards flip out of your deck as you draw them; the winners parade with banners.
- The Codex and deck editor are much smoother (up to about 9× less work per frame); the page-change leaves are calmer and smoother.
- Click a deck's name to rename it.
- Fire creatures shimmer with heat haze.
- Your avatar walks the Conquest map; raid bosses visibly wind up over the lane they'll hit.
- Codex pages turn like a book; battles appear through a pixel dissolve. The first effects wish-list is complete.
- Settings → Effects (High / Medium / Low / None); idle battles use about half the work.
- Page-change leaves drift edge to edge on gentle waves.
- Profile shows your email and admin role; optional hobby and birthday, with a birthday gift.
- Skirmish and card editors: safer saves, validation, and typed values kept when adding rows.
- Card editor: a live card preview, art (path, upload or remove) and Revert to original.
- Bosses make an entrance; coins rain into your rewards; raindrops on cards in wet fights; the Conquest map follows the season.
- Skirmish editor: Gold and Dust rewards per skirmish. Card editor: rarely used sections tucked away.
- Every edit to a Conquest map in one list, with Revert all; the card editor keeps a History you can step back through.
- Autobattler: watch any fight round by round from its result screen.
- The tutorial can be won whichever side you pick (Otters lost about 9 in 10), and a loss can skip it. Tapping the slot plays your card; map details show on every screen size.
- Battle music: a quiet tune in your rival's style that builds as the fight heats up (Settings → Battle music). Wait ticks flip an hourglass; caves are lit by your lamp.

## 2026-10-06
- Master hub: the Master doc, changelog, Effects Lab, Visual Library and Claude's guide as tabs on one page.
- Arrow and Fire Arrow get a full bow-shot animation; crits get their own symbol.
- New card face: name at the top, cost and Wait as pips.
- Graveyard is its own pile; loading screen; a performance pass (about 42% less work per frame).
- Board ambience: castle cracks, low-Health tremble, idle breathing.
- Battle atmosphere: a red sky in sudden death, lightning and thunder on storm maps, a sparkle trail on dragged cards.
- Status touches: frost creeps over frozen units, Shock glitches, flyers shed feathers, tokens shatter.
- Match moments: decks riffle at the start, the leader arrives on a throne of light, water ripples under landing cards.
- Fixed the last known card snap (a landed card jumping sideways).

## 2026-10-05
- The world comes alive: per-place ambience, a live day/night clock, fights on the map's own terrain, versus openers.
- Places: the Armoury Tent (deck), the Traveller's Cart (shop), the Old Nest and the Forge.
- Hero card: build your own card up to level 100.
- 12 languages.
- Battle feel: lighting, shadows, hit-stop, shockwaves, a danger heartbeat.

## 2026-10-04
- Maps 1–4 retuned to a difficulty curve, with reward cards for first clears.
- Cards burn away or bleed out when they die; holo foil and gold rims for rare cards.

## 2026-10-03
- Social and competitive: friends, private invites, the Market, PvP tickets, ranked tiers.
- New modes: the Autobattler draft run and Raids (the Goliath trench).
- Guided tutorial, Conquest-first onboarding, dialogue with the lore cast.
- Player levels, deck levels, quests and medals; sudden death from turn 20.
- Painted maps, a world atlas, WebGL on the splash and maps; Shop packs with an opening animation.
- Accessibility: WCAG AA contrast in both themes.

## 2026-10-02
- PixelLab card art for the factions, the dragons and maps 1–4.
- Battle modes (Gravity, Open, Gladiator); hidden cards; a Hall of Fame.
- Sign-in with Google; admin card edits published live.

## 2026-10-01 and earlier
- Deck rarity limits; live in-match tooltips.
- First tracked build (28 Sep): the Bramblewood Arena auto-battler with Conquest, Codex, Nest and Forge, built up over design versions 17–30 since mid-September.
