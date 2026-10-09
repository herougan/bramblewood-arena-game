# Changelog

Headline changes only, newest first. The detail lives in git history, `MASTER.md` and the design addenda.

## 2026-10-10
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
