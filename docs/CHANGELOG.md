# Changelog

Headline changes only, newest first. The detail lives in git history, `MASTER.md` and the design addenda.

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
