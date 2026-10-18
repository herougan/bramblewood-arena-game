# Changelog

Headline changes only, newest first. The detail lives in git history, `MASTER.md` and the design addenda.

## 2026-10-18 (R3-WP5: accessibility)
- **Every dialog now behaves like a modal for keyboard and screen-reader players.** New `bramblewood-a11y.js` (loaded with the other bramblewood-*.js files by `assemble_arena.py`) watches for role=dialog / `.modal-overlay` / the Settings panel appearing: it adds `aria-modal="true"` (and role + label where missing), moves focus inside, keeps Tab / Shift+Tab inside the top dialog (nested: only the top one traps), lets Escape press the dialog's own close button when no existing handler took the key, and gives focus back to the opener on close. Onboarding, the tutorial's starter steps, VS intros, the results animation and hatching ignore Escape (`NO_ESC_SEL`, or `data-no-esc` on any overlay); Leave in a live trench fight is never pressed. Small anchored popovers (Energy, sweep menu, field kit, graveyard peek, draw offer) are left alone.
- **NPC reply choices give you time** (WCAG 2.2.1): the 30 s window follows the dialogue speed (Slow = 45 s, Fast = 18 s) and pauses while the pointer is over the replies or focus is inside them.
- **18 icon-only buttons have labels** (skill / trigger ✕, admin Energy ±, raid editor ✕ / − / +, test-kit damage / heal, simulator presets). No other unlabelled icon-only buttons were found in the player-facing templates.
- `tests/e2e/a11y.py` (in `tests/run-all.sh --e2e`): Settings, a Codex card detail, Notices and the Tavern: focus in, Tab trapped, Escape closes once, focus back; a confirm over the Tavern; an onboarding screen ignoring Escape; the NPC reply timer.

## 2026-10-18 (I1: translations for texts with placeholders)
- **The 159 game texts with a {placeholder} now translate** in all 12 languages ("📜 Errand: The Old Bramble — 2/5" → "📜 おつかい：古いいばら — 2/5"): toasts, results-screen pills, dialogs, tutorial lines. `TX()` still returns English, so code that compares its result is unaffected.
- **How:** `bramblewood-i18n.js` compiles every pack key with a {placeholder} into a template (once per pack load: ~2 ms). When the exact lookup misses, a text is tried only against the templates whose rarest literal word it contains, and a match fills the translation with the captured values; each value is looked up too, so a map, card or item name inside the sentence translates, as do English tails such as " · published" or ". Journey complete!". Counts only match digits, plural endings a few letters, ranks a capital letter. ~3 µs a string on first sight, cached after.
- **Packs:** `tools/i18n_2026_10_18d.py` and `…e.py` add the 159 templates (plus the pieces that HTML texts reach the page as, the ring colours and other English values the code fills in) to `lang/*.json`. English plural endings ({s}, {plural_*}) are dropped where the language has no use for them. `tools/i18n_refresh.py` now counts them toward coverage (159/159 in every pack) and checks placeholders (none lost, none added, side-by-side ones kept together); it exits 1 on a problem.
- `tests/i18n-templates-2026-10-18.js` (in `tests/run-all.sh`): compile, match, fill and placeholder integrity for every pack, plus a timing run.

## 2026-10-18 (I2: card-name translations)
- **Card names are translated.** 361 player-visible card names (360 that were in no pack, plus Yeti, which half the packs lacked) now have names in all 12 languages, including the new Fathom Leviathan, Grovebearer Dragon-Turtle and Ashmantle Fiend. Every pack covers all 647 visible cards; test and reference cards (`test: true`, hidden by the Codex) are left out, and MissingNo. stays MissingNo. Drafted by Claude in the packs' existing voice and terms (the same word for Otter, Knight, Dragon, Rivergate, Sunfeather… as the 286 names already there); Tagalog, Tamil, Japanese and Korean deserve a native read, as with the other packs.
- They live in `lang/cards/<code>.json` (same `{"English": "translation"}` shape) so they don't collide with edits to `lang/<code>.json`; `assemble_arena.py` merges them into each built pack (`assets/lang/<code>.js`, and the inline copy under `BW_INLINE=1`), the main pack winning on a clash.
- `tools/i18n_cards.py` reports coverage per language and lists the missing names; `tests/i18n-cards-2026-10-18.js` (in `tests/run-all.sh`) checks the files parse, hold only real card names, cover every visible card and reach the built packs.

## 2026-10-18 (package C: leftovers clean-up and Steam achievements)
- **Steam achievements are wired.** 13 achievements (`STEAM_ACHIEVEMENTS` in arena_app.js): First Win, first map cleared, Maps 5 / 10 / 20 cleared, first Legendary pulled, the Scale Trail, the Red Dragon Egg hatched, first raid hit, Babel Spire floors 10 / 25 / 50, 100 wins. `steamUnlock(id)` calls `window.bwDesktop.steam.unlock` only on the desktop build (nothing happens on the website), never twice for an id Steam took, and swallows errors; `steamCheckProgress()` also catches up saved progress 5 s after start-up. The ids (Steamworks API names) are in `docs/platform-roadmap-2026-10-17.md`'s 10-18 section; `tests/steam-ach-2026-10-18.js` checks them against `electron/steam.js`.
- **Dead battle code removed:** the Left/Right `.dropzone` button wiring in `wireDropZones` (`showButtonPreview` / `clearButtonPreview` and their listeners) and the `.dropzone` and `.terrain-pill` CSS; neither is drawn any more. Dropping on the row and on the discard zone are unchanged.
- **Effects Lab:** `ui-cloud-sync` and `ui-deck-hero-banner` are tagged retired (their in-game callers went); both stay playable in the lab. The effects inventory is refreshed.
- **tests/e2e/hero.py** now opens the Hero Hall in the Stomping Grounds (the deck screen's 🦸 button is gone) and pays the current Materia price; it passes again.

## 2026-10-18 (texts, dialogue and translations)
- **Avatar hints:** the Hedgehog now says "Clear Ashen Spurn" (it still named The Ashen Peak, renamed on 10-12), and the Dragon says "Clear The Sundered Peak": it unlocks on Map 20, while the campaign now runs on to Goldfeather Keep, so "Win the whole campaign" was no longer true. The Effects Lab's volcano background is labelled Ashen Spurn too.
- **Boss banter plays:** the `boss_banter` exchange ("That one doesn't surrender…" / "Then we make it a short conversation.") now plays a moment into each boss fight, once per boss per save, never before the tutorial is done, at your NPC dialogue speed. It replaces the one-line warning that stood in for it, and it is used up only once the fight has really started (no longer when an energy or deck check refuses it). Hummingbird players hear Aurelia and Vesper instead of the otter pair.
- **Translations refreshed:** all 12 language packs now cover every game text in `bramblewood-texts.js` that has no {placeholder} (308; was 17 in de and the others), plus 27 map names added or renamed since 10-12. 64 dead keys (texts the game no longer shows: old card and map names, retired buttons) are gone. New tool `tools/i18n_refresh.py` reports coverage and drops dead keys; the translations are `tools/i18n_2026_10_18a/b/c.py`. The defeat-screen pun names stay in English on purpose. The 158 texts with a {placeholder} are still English in every language: TX() fills them before the page translator sees them.
- **Dialogue export:** `tools/dialogues/export_dialogues.py` follows dynamic ids (`playDialogue('forge_cobble_' + key)` inside `cobbleSay`), so the forge_cobble_* lines now list where they play instead of "(not found: maybe unused)". Re-exported `docs/dialogues-2026-10-18.xlsx` and `docs/dialogues.json`; `docs/game-texts.xlsx` regenerated.

## 2026-10-18 (WP4: progression gates and dead code)
- **No more locks you can never meet.** A lock that names a map that isn't charted yet (it doesn't exist, or is a Reserved map with no fights) now reads "Unlocks beyond the charted maps" instead of the map number. That covers nests 6 and 7 (Maps 25 and 30), Forge tiers 4 and 5 (Maps 26 and 31), card Levels 9 and 10 (Maps 26 and 31), limit breaks (Map 50), the Strange Materia tooltip (Maps 25 and 30) and dungeon slot 3 (Map 40). The gates themselves are unchanged: when those maps are built, the locks show their numbers again. One helper, `mapIsCharted(n)` (with `mapLockText` and `UNCHARTED_LOCK`).
- **The Long Burrow** (on Map 22, a real map now) is still held back, but its slot in the Dungeons tab says "🚧 Coming soon" instead of a lock. Releasing it is one switch: `const LONG_BURROW_RELEASED = false;` in arena_app.js, just above the Long Burrow's `endlessDungeon(...)`. A released dungeon with no `after` fight says "Reach <map> to open it" (it opens when its map does).
- Removed `grantMap20FactionCrown` (never called; the crown was retired on 2026-10-13).
- Removed handler code for elements that are never drawn: #cloudSyncPill, #homeProfileBtn (and `homeProfileBtnInner`), #leaderSlotWrap (`wireLeaderSlot`, `leaderSlotHTML` and the text key `toast.leaders-must-be-heroic-or-above`), #terrainPill, #startAsyncBtn, #cnpSweepN / #cnpSweepBtn / #cnpIdleSweep, #cnpAdminClearMap, #homeContinueTutorialBtn (`continueTutorialFromHome`), #deckToCodexBtn, #deckHeroBtn, #dropLeft / #dropRight. #adminTideEvadeChk stays: `testRulesPanelHTML` builds that id.
- `tests/gates-2026-10-18.js` (in `tests/run-all.sh`).
## 2026-10-18 (the dragon thread: Scale Trail)
- **The Scale Trail can be finished.** Finding the eighth Dragon Scale now ends it: once the results close, the Wandering Traveller's finale plays (`DIALOGUES.scale_trail_finale`: one hide, still warm, the Crown carried north, the dragons sleep under the mountains), then a reward screen (the eight scales orbit and fuse in a red glow, the Effects Lab's `meta-dragon-egg-craft` look; the card pops out, the quest ribbon and a toast). Reward: the **Red Dragon Egg** (hatches into the Red Dragon), set in `SCALE_TRAIL_FINALE_REWARD = {card:'egg-red-dragon'}` so it can be changed. Given once (saved flag `scaleTrail:rewarded`); a save that is already at 8/8 gets the finale a few seconds after load.
- **Journal:** a third Notices tab, 🐉 Scale Trail (shown once the first scale is found; Admin always): one writ with x/8, each found scale's fight and line, a hint for each one still hidden (the map and a clue, not the fight), the reward (hidden until 8/8), and a Claim at 8/8 if the finale hasn't given it.
- The trail counts scales **found**, not held: spending scales on Dragonscale Mail, a Mythic's level 10 or a castle's level 25 never undoes it. The scale toast now counts finds ("1/8" for your first, whichever site).
- **Fix: Blacksmith crafts gave nothing.** `cardObtainableFrom` knew no `smith` or `secret` source, so the anvil's equipment (Dragonscale Mail and the rest) and the Map 2 cave's Tiny Cave Dweller were "not obtainable" and `unlockCardForPlayer` refused them after the Materia was spent. Both kinds, and the new `quest` kind (the egg's source: `{kind:'quest', id:'scale-trail'}`), are obtainable now, with a "where to get it" line each.
- The Map 19 scale line says Ashen Spurn (was Ashen Peak). `tests/scale-trail-2026-10-18.js` (in `tests/run-all.sh`).

## 2026-10-18 (FX wiring and the Effects Lab, WP2)
- **Dragons, Supreme beasts and Ghosts now have their own deaths and arrivals in fights.** A Dragon (archetype Dragon: the five Dragons, Thunder Lizard; or creatureRank 1) crashes down, scales scatter and a 🐉 drops; on play the sky darkens, a wing shadow sweeps over, a roar, and it lands. Another Supreme unit, or a rank-2 great beast (Fathom Leviathan, Grovebearer Dragon-Turtle), dies in a slow prismatic burst and arrives in a prismatic shockwave. A Ghost (effects.ghost, e.g. Glasswing Butterfly) turns see-through and drifts up. Who the unit is beats what killed it; exile, egg and petrified deaths still come first. The round waits for the great beasts' falls. The field quake only plays at High effects, so Medium, auto-lower and Minimal (no special deaths, as before) stay calm; Pixel squares the particles.
- A Supreme card on its own is no longer treated as a boss (it got the "Boss · Defeated!" banner wherever it fell); a Supreme leading a boss node still is.
- Effects Lab: death-ghost / death-dragon / death-supreme / sum-dragon / sum-supreme are marked live; the dragon-scale demo reads 2/8 → 3/8 (there are 8 scales); res-faction-crown and FX.F.factionCrown are gone with grantMap20FactionCrown. sk-chain-lightning and sk-shock-bolt (x17) were dropped by the lab for want of an inventory row: they have one now.
- **Effects inventory status:** new `tools/effects-lab/refresh_inventory.py` gives every row a status from the lab manifests (live / lab-only / future / missing / retired, plus `lab` and `inGameHook`) and regenerates the counts and entry tables of `docs/effects-inventory-2026-10-15.md`. Now 1035 rows: live 948, lab-only 56, future 22, missing 0, retired 9; the 140 rows rated "missing" on 10-15 are all built.

## 2026-10-18 (desktop build P6: offline fonts, icon, Steam stub)
- **Desktop only:** Chinese, Japanese, Korean and Tamil now work offline in the Electron build. Noto Sans JP/SC/TC/KR and Baloo Thambi 2 (OFL) ship in `electron/fonts/`, subset to the characters in the language packs (2.3 MB). The website still loads them from Google Fonts (no change in size).
- **Desktop app icon:** an acorn on a round wooden shield with a bramble ring, drawn in code (`electron/build/make_icon.py`), as PNG, ICO and the Linux/icns sizes, wired into electron-builder.
- **Steam stub:** `electron/steam.js` + `preload.js` give the page `window.bwDesktop.steam` (achievements, overlay). It's a no-op unless `BRAMBLE_STEAM=1` is set and `steamworks.js` is installed. Nothing calls it yet.
- Google sign-in stays off in the desktop build (the OAuth redirect can't come back to `app://`). Remaining release work (Steam App ID, Mac notarisation, signing) is in `docs/platform-roadmap-2026-10-17.md`, section "2026-10-18".

## 2026-10-18 (WP5: Arena field scenes)
- **Every Arena day-rule Environment card has its own picture.** Before, they borrowed other cards' scenes. Now: Lumber Rush shows a sawmill and log pile, Timber Fair stalls and bunting in a clearing, Midsummer a high sun over a flowering meadow, Dusk a violet sunset over a lake, Restless wind-tossed trees at night, First Blood one red banner on a dawn field, Double Time twin hourglasses under a clock ring, and Collapse a cliff edge breaking away.
- **Leylines I, II and III are drawn apart.** The same plain and standing stone has one, two and three glowing strands, brighter at each level; at III the sky lights up too.
- The scenes are drawn in code (Pillow + numpy, no art credits) by `tools/make_field_art_2026_10_18.py`. Each is 256x256 and 4-6 KB. `art/fields/leylines.png` is no longer used.

## 2026-10-18 (great beasts: Leviathan, Dragon-Turtle, Fiend)
- **Creature rank:** a new card field, `creatureRank`. 1 = the five Dragons, 2 = Leviathans and Dragon-Turtles, 3 = the volcano's fire fiends. It is a design rule (rank 2 sits under the Dragons and above an ordinary Legendary; rank 3 under rank 2); the engine doesn't read it. The Codex card detail shows one line under the chips, e.g. "Rank: Leviathan — second only to Dragons". The new type tags Dragon 🐉, Leviathan 🐋, Dragon-Turtle 🐢 and Fiend 👺 have icons. See `docs/creature-ranks-2026-10-18.md`.
- **New card: Fathom Leviathan** 🌊 (Legendary, rank 2, Leviathan / Ocean, 9/40, Lumber 4, Wait 4): Supreme, Tide, Tsunami 2, Wave (alternate), Bounty 1. Drops from the Goliath raid, like the Goliath Broodmother.
- **New card: Grovebearer Dragon-Turtle** 🐢 (Legendary, rank 2, Dragon-Turtle / Turtle / Forest, 6/48, Lumber 4, Wait 5): Sturdy, Regeneration 3, Guardian, Sprout 2, Tide. In Marshal Tuskwell's deck (23-8, Howdah Archers ×3 → ×2) and that fight's second card reward. No existing tortoise was renamed.
- **New card: Ashmantle Fiend** 👺 (Unique, rank 3, Fiend / Devil / Volcanic, Devilry line, 8/30, Lumber 3, Wait 3, fire damage, resists fire): Immolation 2, Shade, Scare 2. It guards the last door of the Heart of the Mountain (20-A-4, Magma Titan ×2 → ×1) and is the dungeon's second card reward beside the Contradiction. Not called a Balrog: that name is Tolkien's.
- All three pass stat budget v3 at Level 1, while the Dragons stay over it. Art to come; they show their emoji until then.

## 2026-10-18 (kin target)
- **New target: Kin.** Every action with a target picker now offers Self / Ally / Opponent / **Kin** / Any (Shield: Self / Ally / Kin). Kin = your own units that share at least one Type with the acting card (the rule Esprit uses), never the card itself. Every distance works as for Ally: Adjacent, Any distance, Furthest, All of them ("all your Kin", which skips the card itself), and N targets. No Kin on the board: the action does nothing.
- Kin is on: Deal damage, Buff, Debuff, Poison, Bleed, Expose, Stun, Increase Wait, Heal, Cleanse, Shield and Exile, and on a Charge action ("2, buff 3 kin random").
- Card text: "a random Kin unit", "an adjacent Kin unit", "2 furthest Kin units", "all your Kin". **Kin** is a keyword with a gloss.
- **Esprit has a target:** Kin (the default; every existing Esprit card keeps it) or Any (every unit of yours that arrives, played or spawned, whatever its Type). Saved as `espritWho: 'any'`; the editor row has a Kin / Any picker after the two numbers; an Any card reads "Esprit +1/+1 (Any) — …". Esprit's text now says Kin (it said "another ally", out of date since 2026-10-14), and the Codex adds a note on Any.
- Irradiation narrows a Kin action the way it narrows an Ally one.
- `tests/kin-target-2026-10-18.js` (in `tests/run-all.sh`).

## 2026-10-17 (rebuild)
- **New skill: Rebuild N** 🔨🏰 ("While Ready, restore N Health to your castle every upkeep."). "On Ready" works as the On Ready income does: every round the unit is awake, starting with the upkeep its Wait runs out (a unit played on Wait 0 starts at the next upkeep). Never above the castle's max, nothing for a fallen castle, and a full castle makes no event. It mends the castle, not a unit, so Herbalist doesn't add to it. On no card yet; default 2.
- **New trigger action: Rebuild castle N** (⚡ → 🔨, "…, restore N Health to your castle."): restores N to this card's own castle once, whenever its trigger fires. It works with any trigger, On Discard from the hand too, and the editor row has the = My Attack / = My Health picker.
- **The look:** planks and stones (🪵🧱🪨) fly from the builder into its castle, the castle thunks, and a green "🔨 +N" pops on that side's HP bar as the bar fills. During a round's replay the bar's running number goes up by what was restored. Log: "🔨🏰 Beaver rebuilds your castle: +2 Health" (with "(1 of 2: it is back to full)" when the castle tops out).
- Stat budget: Rebuild costs its value, as Heal does. Effects library: a Rebuild setup and a Rebuild castle setup, both on a castle that starts 12 down (new `hqHurt` setup field: the stage keeps your castle's Health between steps instead of refilling it). Effects Lab: `sk-rebuild` (`tools/effects-lab/manifest/rebuild17.js`, plays the game's `rebuildVfx`), inventory id `sk-rebuild`. It shows up when the lab is next rebuilt.
- `tests/rebuild-2026-10-17.js` (in `tests/run-all.sh`).
## 2026-10-17 (card stats)
- **Your record, per card.** The game now keeps lifetime numbers for each of your cards, in the background: matches, times played, times died, damage dealt, damage taken, kills, and, where the card does it, castle damage, Health healed, Lumber / Grace / Devilry generated, Poison applied, tokens summoned, thorns damage, revives, times Ready, shots fired and times hatched. A match is tallied once, after it ends (from the engine's own per-match tally plus the round logs), never during the fight. Every mode counts (Autobattler fights too) except the Effects library, the Test Lab / sandbox and admin test fights.
- **Shown only in the Codex card detail**, as a small "Your record" block that lists the numbers above zero for that card.
- **Stored compactly and synced:** localStorage `bramblewood_card_stats_v1`, `{cardId: [integers]}` with trailing zeros cut and only cards with a record (about 20 to 40 bytes a card). It is part of the cloud progress blob (`player_progress.data`). On pull, the two copies are merged by keeping the larger count for each number.
## 2026-10-17 (inventory and field kit)
- **Inventory buttons:** "Visit the Nest" is now **🪺 Nest** and "Enchant" is **💎 Enchant**, to match ⚒️ Blacksmith.
- **The Inventory is the traveller's camp shelf:** dark pixel planks, a vine of leaves and berries along the top, warm lantern light from above, an "🎒 Inventory" sign like the Nest's, and each section sitting on a plank ledge. The pixel art is drawn by `tools/art/make_inventory_art.py` and inlined as data URIs.
- **The Field kit is a card with a pixel satchel** (a map, a draught and a sprig peeking out). It now lists every source of items and shows how many daily-win items are left today.
- **Field-kit items from the day's first 3 Conquest wins:** each of your first 3 Conquest wins on a local day (fights you play, not Sweeps) gives one item. It is random, weighted to the everyday ones (Draught and Kindling 5, Map and Honey Cake 4, Whetstone and Caltrops 3, Fire Pot 2), skips items already at the cap of 5, and only starts once the traveller's kit is open. The item shows in the results Rewards with a satchel chip. A notices and above, finished weekly tiers and the traveller's starter fill still give items as before.
- **Using a field-kit item gives feedback:** the item flies from the 🎒 pack to its target (your castle, the Lumber pill, your hand, or each card it touches) and lands with a ring in its colour and a floating number. A callout over the board says what it did ("Your castle heals 5."), the battle log gets a "🎒 You use …" line, and the pack's count ticks down with a bounce. Once used, the pack stays on the HUD greyed with a ✓ and its pop-over says the kit opens again next skirmish. An item with no target right now is greyed with its reason; pressing it shakes the item and says why in a toast. The board now updates when the item lands, so the floating numbers are no longer wiped by the redraw.
## 2026-10-17 (balance pass)
- **A rough balance pass over every real card: 173 changed** (only numbers; every skill kept). Full table: `docs/balance-pass-2026-10-17.md` and `.xlsx`; each changed card's creatorNote says what moved and why. Cards in their rarity's win-rate band: 157 → 233 of 627 (`docs/balance/card-balance.json`, regenerated with `node tools/card_balance.js 40`).
- **Stat budget v3:** 9 of the 18 cards over it now fit, at the Test Lab's Fit values: Great Horned Owl 6/21, Eyrie Warden 7/24, Raven Harbinger 5/19, Reef Manta Glider 4/15, Humpback Elder 8/39, Kraken Spawnling 9/31, Grindstone Boar 6/19, Irradiated Couatl 8/24, Cathedral Eagle 4/14. Left over on purpose: the five dragons, the Caldera Wyrm, the Great Gate (the enemy gate of 23-7 / 24-1), MissingNo. and The Sixfold (the budget doesn't count its Ritual; fitting it would take it from 37.5% to about 12%).
- **Win rate:** 151 cards more than 8 points outside their band moved half-way toward it (65 toned down, 86 lifted), each buff within budget v3. Biggest: Monarch Wingblade 5/9 → 3/6, Thornwood Palisade 4/22 → 2/19, Alley Cat 3/4 → 2/2, Carrion Fly Swarm 3/5 → 2/3, Caustic Scorpion 5/13 → 3/13; Glowing Gecko 3/9 → 5/12, Ore-Smelter Mole 1/10 → 3/10, Baby Bat 1/5 → 2/5, Pill Bug 1/4 → 2/4.
- **Today's reworks (13 cards):** Cave Bat Swarm 2/3 → 2/2 and Duckling Squadron 1/3 → 1/4 (Fork); Swordfish Spearman 2 → 1 Lumber (Trident); Sulfur Vent Crab 1/9 → 1/8 and Fiddler Crab Swarm 1/3 → 2/3 (Crab Claws); Voltaic Eel 3 → 2 Lumber and Voltwing Bat 2/4 → 1/4 (lightning); Beetle Battering-Ram 5/20 → 4/14 (Cleave 3 kept); Caldera Snow Leopard 2 → 1 Lumber, Subterraneaner 5/8 → 7/10, Piranha Shoal 3/6 → 4/6 (Ambush / Bloodlust); Mirror Moth 2/6 → 3/6 (Reflect); Snow Owl Sentinel 3/10 → 3/9 (Expose).
- **Left alone:** Starter and Basic cards, the reference filler, deck-plan cards (Ecclesia, Devilry, Remember, Changeling, Lumber makers), walls, bosses, raid cards, materia, equipment and eggs; 77 cards costing 2+ Lumber that stay at 22–37% whatever their stats (B4); 10 cards no small stat change helped (Bramblewood Macaque, Puppeteer Imp, Petal Fletcher, Upside-Down Bat, Chained Binturong …). No card had a stat you set by hand.

## 2026-10-17 (lightning)
- **Voltaic Eel: Chain Lightning 2 instead of Electricity 1.** New skill **Chain Lightning N** 🌩️: when its attack connects, the bolt jumps from the target to an enemy unit beside it, then on to one more (never the same unit twice). Each unit it jumps to takes N lightning damage. Electricity is the short version: one jump, to a unit beside the target. The Eel's stat budget (v3, Level 1): 2×3 + 10 + 5 = 21 < N 40.6, and 3×10 + 5 = 35 < 183.
- **Wet is a general rule:** every lightning hit (Electricity, Chain Lightning, Shock Bolt, Lightning, any shock hit) deals **+1 for each Wet counter** the unit has. A unit gets one counter for each of these: it is a Swimmer or Tide unit; it is raining (the Rain field); the Tide is in (Flood or High Tide). That makes 0 to 3 counters. Electricity's own wet bonus is gone (the +1 on the arc, and the extra 1-damage zap on a wet target), so nothing counts twice. Its card line no longer mentions wet units. The rule is in the **Wet** keyword's gloss, and the Skills Codex adds it under Electricity, Chain Lightning, Shock Bolt and Lightning.
- **Shock Bolt and Lightning deal lightning damage** (they dealt physical), so the Wet rule counts for them.
- **No lightning attack throws a ball any more.** Each lightning hit draws its own bolt, and the number pops the moment the bolt reaches its unit. Electricity runs attacker → struck unit → the arc. Chain Lightning jumps one unit after another. Dragon Lightning's red bolt goes attacker → target, then target → the unit beside it (it used to flash first, and then each strike threw a ✦ star). The Shock Bolt is a bolt of lightning, not a spit. Lightning's sky bolt now comes down on the unit it hits (it used to strike the caster, and then a stone flew). At Medium effects and up, FX.A had also been throwing a missile for every one of these.
- **Electricity's bolt is 10% more cyan** than the chain lightning bolt, so the two can be told apart (core #daf7ff, glow rgb(135,188,255); the plain bolt stays #f2f6ff / rgb(150,180,255)).
- **Element emoji on every elemental number and log line:** ⚡ lightning, 🔥 fire, ❄️ cold, 💧 water, 🧪 acid, ☠️ poison, 🦠 decay, 🪄 magic, 💭 psychic, 🩸 bleed. A crit keeps its element's emoji next to 👊, castle numbers carry it too, and the battle log reads "for 3 ⚡ lightning damage (Wet 1: +1 💧)".
- Effects Lab manifest (`tools/effects-lab/manifest/x17.js`): Chain Lightning, Shock Bolt, and the new looks of Electricity, Dragon Lightning and Lightning. They show up when the lab is next rebuilt. Tests: `tests/lightning-2026-10-17.js`.
## 2026-10-17 (arena and raid)
- **The Arena's day rules are Environment cards.** Lumber Rush (+1 Lumber to both sides every 2 rounds, the first on round 3), Timber Fair (every 3), Midsummer (always day), Dusk Start, Restless Sky, First Blood, Double Time and Collapse each get a card with a scene in the fight's Environment stack, beside Night and the weather (Frigid, Fog, Rain, Scorching) that already had one. The ruleset pill on the board is gone. The scenes are borrowed for now: Lumber Rush / Timber Fair use the Undergrowth's fallen logs, Midsummer the Tall Grass, Dusk Start and Restless Sky the Twilight, First Blood the Boss surge, Double Time the Leylines, Collapse the Landslide.
- **The Arena tab, redrawn:** a tourney-ground banner (the new pixel coliseum, with bunting) showing your rank, rating, Laurels and deck; today's rules as Environment cards with their full text, when they change and tomorrow's icons; the format switch; and every mode as a tile that says what a win pays (Gauntlet's next win and 10-in-a-row prize, the Dungeon's clear prize, PvP's Laurels, Ranked's rating). It works at phone width.
- **Arena fights stand on the tourney ground** (`art/maps/marena.png`, raked sand, a timber barrier, stone tiers full of crowd, pennants), with bunting along the board's top edge.
- **Raids are in the deep sea.** The Goliath fights in the Abyss (`art/maps/mabyss.png`: dark silt, a rift, whale-fall ribs, bioluminescence, light shafts painted in) with 16 drifting specks of marine snow. Other raid bosses fight on a fitting map (the frost kings on the tundra, the troll in the caves, the Phoenix on the Sundered Peak, ...); a raid can name its own `ground`.
- **The Goliath's field:** Crushing Depths (2 water damage a round, Tide units half), the Tide (Flood then Ebb) and the new **Psychic Dampener**: Psychic damage is halved (rounded down) and a Confuse lasts 1 round less, so a 1-round Confuse doesn't land. Both sides. They show as Environment cards in the fight and on the raid tab, with the "?" until each first happens; admins see every line. Psychic Dampener is in Edit skirmish, the raid editor (which can now add and remove a raid's field effects) and the Effects library, with its own scene.
- **Raid allies play only into their own rows.** The middle-row ally plays into the middle row and the back-row ally into the back row (a slot behind a card first, else any free slot of its row); with its row full it keeps the card. They used to spill into the other ally's row and then into your front row.
- **Your back rows strike.** At the start of each raid round, every unit in your two ally rows strikes its own column for half its Attack (rounded up): the boss's front unit there, or its castle when that column is empty (the Core's shield still holds while its stumps stand). A unit still under Wait counts it down there instead.
- **The boss calls in Commons.** Every round from round 2, on top of its normal play, the boss puts up to 1 Common into its middle row and 1 into its back row (2 a round at most), each into an empty slot with a card right in front of it, and none while those rows already hold 6. The Goliath's are Inkcloud Squid, Cuttlefish Illusionist, Moon Jelly, Open-Ocean Hermit Crab, Blind Cave Fish, Pufferfish Bulwark and Minnow Skitter (scaled like its deck); a raid without a list draws Commons of its decks' kinds, cost 2 or less.
- **The boss unit has its own name and saner Health.** The big card the boss sends in on rounds 3, 7 and 11 was the same card as its deck copy at ×(2 + 10·r²) Health (a 24-Health Kraken Spawnling arrived at 150–290). It is now its own card (the Kraken Brute, the Crushing Tentacle, the Leviathan Elder, ...) with +1 Attack and ×(1.5 + 1.5·r) Health: 72 for a fresh part, 36 for one nearly down.
- **The raid tab, redrawn:** the boss as a framed card over its own ground, one big health bar, your damage / standing / attempts / Raid Points / the cost of a fight, each part's telegraphed attacks, then three panels: how the three rows work, the raid's field cards, and what a fall pays. Admins get 💥 Deal 10% and 💥 Deal 50% (of the boss's total Health, off its open parts in order); live through `admin_raid_damage` once `supabase/proposed/20261017_e_admin_raid_damage.sql` is applied, in this browser only until then.
- **The raid's VS screen shows your allies on your side:** each with a portrait, the row it holds, its battle rating, its leader and best cards, and its castle; you hold the front row; the boss's art on the other side.
- **Your BR on every pre-battle screen:** the VS screens (Arena, PvP, Async, Pass & Play, raids, and now the Dungeon) and the Conquest / Tower opener show "Your BR" beside "Their BR". A Standard deck's BR is rated at Level 1.
- **The Tentacle Smack, redrawn:** a thick tapered limb, dark purple-red with a pale underside and suckers, that rises from the boss's edge, coils, slams down the column, writhes there and sinks back: about 3.4 s instead of 1.25 s. One canvas and transform-only shakes instead of a stretched SVG under a drop-shadow and a whole-board shake: in the same headless run, about 21 ms a frame on average instead of 25–29, p95 17–50 ms instead of 83.
## 2026-10-17 (shop, earthquake, sound, tower)
- **The Shop sits in a market street.** Timber shopfronts with arched doors (one ajar with lamplight), lit windows that flicker, striped stalls, crates and barrels, cobbles, a string of swaying lanterns, and two little pixel shopkeepers (a mouse and a hedgehog) idly bobbing. Inside the cart: two lanterns under the awning and a plank floor with a crate, a sack, a barrel and the mouse, so phones get it too. Still for reduced motion.
- **A field-kit item on the shelf, some days.** Once the traveller's kit is open, each day has a 30% chance that the cart stocks one field-kit item (seeded by the day, so it's the same all day): 70–140 🍁, one a day, sold out once bought, not while you carry 5.
- **Earthquake looks like one.** A harder, longer rumble; first a scatter of hairline cracks flickers open at random spots and is gone in a blink, then a jagged, forked fissure (dark gap, pale broken edge) tears open under each card. Everything clears in about half the time. Follows the fight speed. (Effects Lab entry `sk-earthquake` updated.)
- **Sound at 2×.** Cues are rendered into small buffers up front (a cue that reaches the audio thread late still plays whole), the end-of-round cut-off lets the last short cues ring out, a voice cap steals the oldest cue instead of piling up, and attack / hit-mark sounds no longer depend on the effects level (auto-lower used to silence them).
- **Babel Spire: clicking a floor keeps its fight panel open.** The panel was placed at the bottom of the tower's first screenful, so after the click put the scroll back it was thousands of pixels out of view. It's pinned to the bottom of the view now, the floor scrolls above it, the tower no longer jumps to your next floor on every click, and on phones the 50 floors keep their full height instead of piling on top of each other.
- **Back where you were after a fight.** The page's scroll and the map's scroll are noted when a fight starts and put back when it ends (on the tower: the floor you left from stays in view).
- **Forge: filter by deck.** All cards / In my main deck / In any of my decks, with the chips, search, sort and pages; kept between visits.
- **Fuse all extras and Disenchant extras have a sheet.** What goes (each card ×n and what it gives), the totals, then the cards melt into the total with a burst, a summary and a toast. With nothing to do they say why (they used to be disabled buttons that ignored the click).

## 2026-10-17 (shiny and review)
- **A Shiny card stays Shiny on the board.** Playing a Shiny (or skinned) copy used to land it plain: the board unit gets a new id, and the look stayed behind with the card's id in your hand. The look now moves with the card when you play it (and when Auto-play plays it), so the board unit, its flight from your hand, its zoomed details and its death all wear it. The units it spawns are Shiny too again.
- **No Pass after the match.** Once a match is won or lost, Pass (and Auto-play and the field kit) is gone from the results and from the board you stay to look over; the next match brings them back.
## 2026-10-17 (fork family and lights)
- **Fork, Trident and Pitchfork are one attack along 2 / 3 / 4 lines** (were: the 2 / 3 / 4 nearest units, full damage each). **Fork** strikes the units to its left and right when both are there, otherwise only the one in front (drawn as one prong taking it, the other going into the empty side), otherwise the one unit beside it, otherwise the castle; full damage on each line, never C with a side. **Trident** always aims ahead: full in front (the castle when nobody is there), half to the left and right. **Pitchfork** aims left or right at random: LL/L/C/R or L/C/R/RR, half on every prong (the middle one at the castle when nobody is in front). Half = rounded down, at least 1. One swing: Recoil, Inspiring and the onAttack triggers happen once; each line rolls its own miss and dodge and carries the on-hit effects. A Taunt unit that draws a Fork is always one of its lines.
- **One swing on screen:** the attacker lunges once and every tine thrusts together (struck ones knock their card, half ones are thinner, empty ones go into thin air), the lines' damage numbers land together, and the log says "swings once, N prongs". Editor, card and Codex texts updated; the Effects library notes too.
- **Crabs have Crab Claws instead of Fork** (Sulfur Vent Crab, Fiddler Crab Swarm, Open-Ocean Hermit Crab). Crab Claws has no number and costs 0 in the stat budget; its swing goes left or right on a coin flip (the other side if that one is empty, the castle if both are).
- **Illuminate lights the enemy facing it too** (its "minor bad thing"): that unit doesn't miss for Darkness, Pitch Black, Absolute darkness or Night-blindness, on both sides, and gets a soft pool of the lamp's light.
- **The pointer's light follows the pointer** (the Night light and the darkness lantern): eased toward it every frame with a slight lag, put back after every board redraw (a redraw used to drop it until the next move, and the lantern snapped to the middle), no wandering off while a mouse rests on the board, touch still fades from the touch point. The battle's cave lamp (shader) now reads the pointer against the board, not the whole window. The Night light is a little brighter.
- **Castle bars curve with the board:** they were 8 px tall with 15 px corners, which CSS shrinks to about 8 px; they are now masked with the board's own curve (15 px, 11 px on phones).
- **Heat haze is 5% wavy:** the shimmer on fire creatures (heat damage or the Volcanic type) rises in soft waves instead of straight bands.
- **Landslide (field) hits three neighbouring columns only:** a random occupied column and the one either side of it, both sides, not Flying or Mountain Climbers; the rocks fall only on those cards.

## 2026-10-17 (art)
- **Field art for every field effect** (NightCafe, Flux 2 Klein 9B Fast, 16-bit pixel scenes like the rest of `art/fields/`):
  - New: Tide (Flood/Ebb), Landslide, Consternation, Crushing Depths, Rook's Row, Bishop's Path, Mirage, High Canopy, Undergrowth, Tall Grass, Leylines (I–III share it).
  - Their own picture instead of a borrowed one: Slippery (was Freezing), Glass-storm (Sandstorm), Hail (Frost), Lava Spout (Lava Tide), Haunted (Mist), Sulphur Fumes (Mist), Ash Rain and Ashy (Eruption), Arrow Slits (Gale), Volcano Glow (Twilight).
  - Awash has its scene ready (`art/fields/awash.png`, key `awash`) for when its card lands.
- **Tide Pool Crab:** your orange crab (bottom right of the four), its grey cut away and set in a sunny tide pool.
- **Puffball Bombardier** redrawn as a plant: a cracked puffball fungus puffing green spores, with leafy sprout feet.
- **Shrine High Priest** redrawn as a fox: a golden many-tailed kitsune in a priest's collar and hat on the shrine steps.
## 2026-10-17 (balance)
- **Stat budget v3** in the card editor, the Test Lab's ⚖️ Stat budget page (and its Fit buttons) and the card plan's Skill N sheet: a card passes when **2×Attack + Health + Skills < N** and **Attack × Health + Skills < (N/3)²**, with **N = 20 + 2×Level + Rarity + 6×Wait + 0.5×Wait² + 4×Lumber + 0.4×Lumber²**. Rarity counts one a step (Starter 0, Common 1, Uncommon 2, Rare 3 … Legendary 9, Mythic 10); the map term is gone. Green within both, red over either, pink when the first score is at or below 60% of N. Skill costs and the half-miss ×1.5 stay. 599 of 617 cards pass; no stats were changed.
- **Lumber in the Babel Spire:** a floor whose cards cost a lot of Lumber and that has no Lumber source swaps one copy of its least important card for a Nautilus Drifter (floors 3–23) or a Gilded Swan Knight (floors 24–49); 30 floors changed, each still at its rating. Three other fights got a Bounty card: the Steam Wall (22-7) and the Caldera Wyrm (20-B-4) a pair of Cinder Stokers, Marshal Tuskwell (23-8) a pair of Pack Mules.
- **Cleave hits harder:** 17 cards, from 1 to 2 (Commons), 3 (the big 3-Lumber Commons, the Fox Warchief and the Rares), 4 (Marshal of Rivergate) and 5 (the Goliath's Tentacle).
- **New card: Sea Cucumber** 🥒 (Uncommon, Coral Reef, 2/14, Wait 1, 1 Lumber): Tide, Regeneration 2, the first hit on it stuns the enemy facing it, and whatever kills it gets 3 Poison. In the Tide Pool Line fight (10-3, Coral Current) and its reward. Art to come.
## 2026-10-17 (security)
- **Four database updates ready, not applied yet** (`supabase/migrations/20261017_*.sql`, from the drafts in `supabase/proposed/`). Per your 22:48 call: no limits on how often anything is written (currency saves, feedback, market); hourly gain budgets at 10× the drafted numbers (200,000 Maple Leaves, 10,000 Gold Leaves, 200,000 Dust, 3,000 Metal an hour, gains only); a brand-new currency row starts at most at 20,000 / 2,000 / 20,000 / 500 (10× too, so a guest who makes an account keeps their savings).
- **Market settles on the server:** listing checks you own the card; buying takes the price on the server and refuses if your saved balance is short; the seller is credited on the server, after the 5% fee, when they next open the market. Listing still takes a copy out of your collection until it sells or you cancel (unchanged; your call whether it should). The game uses the new functions and falls back to the old ones until the update is applied; its messages for "not your card" / "not enough Leaves" are plain, and it saves and retries once first.
- **Fight rewards can be paid by the server:** a Conquest win with a fight session asks `claim_fight_reward` for its Leaves, Gold Leaves, Dust and Metal. Until reward rules are filled in (or before the update), the game pays its own reward exactly as before; it never pays both.
- **Currency saves go out one at a time:** a burst of rewards is sent as one save with the latest numbers, so saves can't land out of order.
- **Small fixes:** the raid damage function's search path is pinned; co-op room members can change only the room's state and status, not who is in it.
## 2026-10-17 (menus)
- **Tutorial map:** during the two tutorials only T-0 and T-1 are on it, shown as they always will be (their own spots, the trail between them). Once both are won all five are there; T-2…T-4 not reached yet are locked markers that say "Defeat 0-4 / 7-6 / 17-8 to unlock this" (the boss of the map before Maps 1 / 8 / 18). The map's title sequence waits for your second visit, from the Outskirts.
- **Results:** cards won on the left (one seen for the first time also wears NEW!); on the right "New cards seen" comes first and also lists titles, characters, maps and new fights opened; then one Rewards block with every reward: currencies, packs, Kibble, egg, spare castle, Dungeon key, Base growth.
- **Play again keeps the packs:** a pack won, then Play again (or Next fight), goes straight into the fight; the packs open together once you leave the results any other way.
- **Swap window:** left, your deck cards you could let go (recommended first, ★); right, cards you own that aren't in the deck (the new card first). ‹ › or a tap switches each side; a side with one candidate shows just that one. It fades in growing, fades out shrinking, and after a Swap does a happy bounce first.
- **Settings → 💬 NPC dialogue speed:** Slow (1.5×), Medium (as before), Fast (0.6×) for how long lines stay and how soon the next comes.
- **Forge:** 60 cards a page, the Codex's pager above and below; search, filters and sort kept.
- **Tavern recruits:** cards you already own can turn up too, half as likely as ones you've only met (none you hold a full deck's worth of); the week's three stay put when you recruit one. Empty: "No one at the bar today. Cards you meet on the road may turn up here."
- **Stomping Grounds** opens at its front (top of the page, no card close-up left open) when you come in from another page.
- **World map:** daily dungeons (Murgle Mayhem…) sit twice as far from their map's diamond (on phones, twice as far up the edge column).
- **Wildpaths:** hover (or focus, or tap) a mark for a tooltip: what it does, its cost, ranks and what it needs. Points are now 1 per map cleared and +2 for an S rank on that map's boss (was +1 for every boss-kind fight won at S); the subtitle is just "Passive skills for Conquest", the earning rule is the points' tooltip.
## 2026-10-17 (card play and board)
- **Cards fly in from your hand:** every card you play (any hand position, any slot, tapped or dragged) visibly flies from where it was in your hand, or from where you let go, onto its slot, then squashes into place. The flight is a copy of the card drawn over the page, so the battlefield's edge no longer cuts it off and the field's zoom no longer throws it off course. It starts on the first frame, with no stagger behind the enemy's card. Why it only worked for the middle card before: the start offset was measured in screen pixels but applied inside the zoomed battlefield, so only a card straight under its slot started in the right place.
- **The leader launches from its slot:** it winds back, then slams onto the field (a reverse ease), shoves its neighbours, jolts the field, and the ring, crown and fanfare go off as it lands. Dragged, it flies from where you let go.
- **"👑 Leader" ribbon on arrival, not on death:** the ribbon now pops out under a leader as it lands (yours and theirs). A fallen leader dies its normal death, then its rainbow rim bounces outward a little and fades.
- **No more cards jumping to the left after their action:** Wave, Restless and Bloodlust's push, the Ready pulse, the Changeling unmask and the dying fade all used a CSS `transform` on the card, which overrode the glide that holds the card in its slot while the row moves, so the card showed at the row's left edge until the effect ended. They now use the separate scale / translate / rotate properties, which add to the glide.
- **Phone and iPad:** the battlefield's cards are 15% bigger (the hand stays as it was). A crowded row still fits the width.
- **Stacked symbols:** every two-part symbol stacks the same way, the second glyph tucked over the first: the board's Flood / Ebb / High Tide chip (🐚 and 🛡 closer), the High Tide pill's two waves, Moonpull, Supreme Tide, Twin Strike and the existing pairs.
- **Day and night:** the left-to-right light of a change of phase is half as strong again (the creep at 20%, the morning wash and streaks at half); the 10 s timing is unchanged.
- **Your turn played:** once you have played (or passed), your bottom row (castle, deck, hand, graveyard) dims by 5% until your next turn, fading both ways.
## 2026-10-17 (wave, tide, boomerang)
- **One boomerang comes home, retracing its throw.** Two were drawn because the `boomerangReturn` event played FX.A's inbound swing (in from the edge of the field) while the return's hit, a beat later, flew `SkillFX.boomerangReturn` (down from the top of the screen); the catch then slapped a third one into the hand. Now only `SkillFX.boomerangReturn` flies: it comes straight back in along the line the throw left on, hits the same target, follows the throw's curve home and is caught. A castle throw drops back in the way it bounced out; a whiff flies through the empty spot. FX.A skips its catch and whiff looks while that flight is in the air.
- **Wave and Awash pushes (rules):** a push with no fixed way (Wave set to "Either way", which used to go "toward the side with more room", and the new Awash field) goes inward 55 in 100, outward 45 (a coin flip from the middle column). On an open board it never swaps: it rides up to N free columns, stopping at the first unit or the edge; if it can't move a single column that way it goes the other way instead; boxed in on both sides it stays put and bobs, and the units beside it rock. Packed rows have no free columns, so there it still trades places (N places along). Wave Left, Right and Alternate are unchanged (one column, swapping with a unit there).
- **The Wave push rides a crest to its new slot** (`SkillFX.waveRide`) instead of teleporting: the old `.wave-pushed` CSS nudge overrode the board's glide. Blocked, the card bobs on the passing crest (`SkillFX.waveBob`). The water geyser is gone; the replay gives the ride its beat.
- **New field effect: Awash** (`rules.awash`, 〰️): each round from round 2 one random unit (not a pinned or Webbed one) is washed 1–3 columns by the rules above. Field card, Edit skirmish, Environment row, battle log, Effects library and the Effects Lab (`fld2-awash`). No map carries it yet.
- **The tide moves the cards:** on Flood and Ebb every card on the board rocks a little as the water passes it (`SkillFX.tideSway`), Tide units and Swimmers lifting more. Tide units and Swimmers now float at half a flyer's height (5.2px) with a wet shadow, and flyers hover 15% higher (10.4px).
- **Effects Lab:** new looks on `sk-wave`, `atk-boomerang-return`, `wt-tide-flow`, `wt-tide-ebb`; new entries `sk-wave-bob`, `fld2-awash`, `st-hover-height` (`tools/effects-lab/manifest/wave17.js`, batch W17 in the inventory). Tests: `tests/wave-tide-2026-10-17.js`.
## 2026-10-17 (emoji and effects style)
- **Emoji ship with the game, Fluent is the default:** Settings → Emoji style is now **Fluent / Twemoji / Noto Emoji / System**. Microsoft's Fluent Emoji Flat (MIT) is the default. Each set is one file, `assets/emoji/<set>.js`, with only the 539 emoji the game uses: Fluent 615 KB (199 KB gzipped), Twemoji 661 KB (221 KB), Noto 1.6 MB (491 KB). Only the set in use is loaded. Nothing loads from jsDelivr any more, so emoji work offline, in the Steam build and once the CSP is enforced.
- **One path draws every emoji:** text on screen is swapped for the set's picture before the browser paints, and `iconHTML()` writes the picture directly. Inputs, text boxes, menus, `<svg>`/`<canvas>` and tooltips keep plain emoji. Pictures are 1.2em, the size an emoji font shows at.
- **How the sets are built:** `tools/emoji/scan_emoji.js` lists the emoji in the code, texts, cards and language packs. It includes ZWJ sequences, flags, variation selectors and symbols written without FE0F, such as ⚔ ❤ 🛡. `tools/emoji/build_sets.py` fetches the pinned SVGs, runs svgo and writes `tools/emoji/sets/*.json`. The assembler turns them into hashed assets. Fluent has no flags, so its 15 missing pictures come from Twemoji.
- **Credits:** `CREDITS.md`, licence texts in `licenses/`, and a 📜 Credits line in Settings. The emoji style row credits the set in use.
- **Effects style: Classic / Pixel / Minimal** (Settings, next to Effects):
  - **Classic** is today's look.
  - **Pixel** plays the Lab's pixel/arcade variants where one exists: true-damage hit B, Shadow dodge C, irradiated death B and exploding death B. Ordinary knock-outs break up in the token's pixel shatter. Damage numbers get a hard outline and a two-tone fill. Particles are square, with no blur or glow.
  - **Minimal** caps effects at Low (no particles, flourishes or screen shake), turns off hit-stop and makes deaths 40% shorter.
  - `FX_STYLE_PICKS` in `arena_app.js` lists which variant each style plays. Adding an effect is one line.
- **Auto-lower effects:** if a fight averages over 33 ms a frame across 2 seconds, effects drop one level (never below Low). A toast says "Effects lowered for smoother play". This happens at most once per session. You can switch it off in Settings → Auto-lower effects.

## 2026-10-17 (effects lab)
- **The Effects Lab shows 10-16 and 10-17:** 56 entries added, 28 updated and 8 retired (the inventory holds 1,029; with the lab's own map-title, grandeur and fun entries every one is built). New: Sulphur Fumes, Ash Rain, Ashy (and after an Eruption), Arrow Slits, the volcano's Day 4 / Night 2 pill, High Canopy / Undergrowth, Tall Grass, Leylines I / II; Penance, Blood Tithe, Amore (paired and heartbroken), On Pitch, Burn 1 Lumber and Fire on hit, Pounce <Att> / <Hp>, Ambush on a unit moving in, Reflect's bounced shot, Vanguard, Web, the Bloodlust leap, Sentry, Carrion, the passives (Hoard, Venom Master, Fletcher, Herbalist, Shatter, Atheist), the War Elephant's two arrows, Electricity's ⚡ number, Quick on a miss and at the castle, the trigger badge glow, the killing-blow ✖, Strangle's squeeze; the Revive phoenix mark, Angel wings and used state; the opponent's pitch into a slot, the enemy hand counter, castle numbers on the HP bar, the upkeep lock, the Refinery's 🧪, voice barks with their babble, the 10 s sky steps, nightfall and daybreak (whole board, left-to-right creep, faint sun), the night pointer light; the four card front frames, the nine archetype frames, the four card backs, top rarity frames on a zoomed card, the bonus copy and the pile count-down; the Frostfire and Fortress map titles with the battlements, trails inking in one by one, a hidden skirmish's trail. Retired (still playable, marked): the shiny / foil death sheen, the "×2" duplicate, the "−N ✖" stamp, Bloodlust growing, Worthy's loot, the rank lesson box, the "+3 XP" line, the Lumber lesson window.
- **The lab plays the game's own functions:** the field effects, the 10-16/17 skills, the kill mark, the trigger badge, the opponent's pitch, the castle throw, the sky's steps and changes of phase are the functions in `arena_app.js`, fed the events a fight sends (`manifest/_game.js` stands in for the fight; `tools/effects-lab/fx-src-extra.txt` lists what build.py copies). The field effects 2 entries used hand-made copies (their hail and landslide bands fell down the board; the game's run across).
- **Stages re-captured** from today's game (`capstages.py`, a Map 1 fight under Spring Rain): every tile wears its card front frame and the deck piles their card backs (the frame and back pictures are inlined in the page). Fixed on the way: the draw flip, unit speech, emotes, the curiosity bubble and the rival babble had stopped playing in the lab (they call `cardBackClass` and the shared bubble loop since 10-16/17), and `map-cave-fires` was missing from the inventory. The catalogue marks entries new / updated / retired, filters by them, and the coverage line counts them.

## 2026-10-17 (21:45)
- **Best hit** on the results screen is now everything one unit dealt in one round added up (its arrow, bolts, skill hits and swing), not only its biggest single blow.
- **Home:** no "Start the tutorial" button (the game goes straight into it); a paused tutorial resumes from the 🎓 on the Outskirts map.
- **Final check of the evening batches:** the full test suite was run once over everything merged today. Fixes from it: seven Map 22–24 fight decks now meet the Maps 21–40 rule (at least a quarter Rare or better), "Arrows (count)" is named Arrow Count, and the tests follow the Codex losing its one-off tag.

## 2026-10-17 (new skills on cards)
- **Today's skills are on the Map 22–24 cards** (each still on its stat budget at Level 1):
  - **Vanguard 1:** War Elephant (51 ≤ 51.6), Testudo Tortoise (35 ≤ 38.6), Marshal Tuskwell (boss).
  - **Sentry:** Goose Sentry (27 ≤ 29.8), Battlement Heron (25 ≤ 29.8).
  - **Hoard:** Tax-Collector Teal, Hoard 2, now 2/4 (was 2/5; 16.5 ≤ 18.8). The Magnate Duck, Hoard 3 (boss).
  - **Reflect:** Gilded Swan Knight (40 ≤ 42.8).
  - **Ambush 3 and Bloodlust:** Caldera Snow Leopard, now 4/7 (was 4/8; 35 ≤ 37.4).
- **Six new cards, each the first to carry its skill** (no art yet, so they show their emoji). Each one is in one fight's deck and is that fight's card reward:
  - 🕸️ **Gallery Orb-Weaver** (Rare 3/8, 1/1; Web 1, Poison 1): 7-A-3 Silk Gallery, replacing 2 Garden Snails.
  - 🐍 **Cottonmouth Matriarch** (Rare 3/9, 1/2; Poison 1, Venom Master 1): 6-7 Adder Gauntlet, replacing 1 Beaver Builder.
  - 🦔 **Hedgehog Herbalist** (Rare 2/10, 1/1; Bloom 2, Herbalist 1): 5-A-4 The Grove Warden, replacing 2 Echo-Keepers.
  - 🦉 **Eagle-Owl Quartermaster** (Rare 2/8, 1/1; Flying, Arrow 1, Fletcher 1): 11-8 Summit Approach, replacing 2 Chipmunk Hoarders.
  - 🦅 **Ossuary Lammergeier** (Very Rare 3/6, 1/1; Flying, Carrion 2): 20-A-1 The Ash Ossuary, replacing 2 Cinder Imps. It is that fight's second card reward, next to the Ashbone Ghoul.
  - 🦭 **Walrus Icebreaker** (Very Rare 3/11, 2/2; Freeze 25%, Shatter 2, Armor 1; resists cold): 17-6 Glacier Herd, replacing 2 Chipmunk Hoarders.
- **Leech:** no new card, because the Barrow Leech and the Vampire Bat already have it (`sap`).

## 2026-10-17 (effects)
- **Expose with no one to strike it:** when a side has no units left, every Expose counter on the other side's units goes (checked after each death sweep and at the end of the round); the crosshair fades off and the log says so. The Expose crosshair never just blinks off now: it fades.
- **Expose crits:** a counter used by a crit makes the crosshair shine deep dark red at the hit; when the last counter goes, it flashes dark red and magnifies as it fades (the round-end "wears off" doesn't play a second one).
- **Prism death:** shiny and foil units no longer shed a rainbow sheen when they die. That sheen is now the Prism death, for units with a light or rainbow skill: Illuminate (Lantern), Reflect, and the reserved Prism / Rainbow / Radiant / Dazzle / Refract. In the Effects Lab as death-prism (death-shiny-foil marked retired).
- **Quick on a miss:** the Quick dash plays when the swing is dodged or misses in the dark / blind too, instead of the ordinary lunge.
- **Regeneration** plays about 40% faster (the motes, their stagger, the pluses and the glow).
- **Mythic (and every top rarity frame) on zoomed cards:** the card detail and the inspector showed the plain gold rim, because touching a tile's style rewrote its `--rarity-a` and the frame stopped matching. The big card now wears the same frame as the small one.
- **Revive:** the wings and halo are for Angels only (none ship yet), smaller, fainter and centred (the right wing was mirrored beside the card). Every other Revive unit gets a phoenix mark: a faint ember ring and a small flame feather at the card's top centre, plus a "↺ Revive" chip on its skill strip. Once it has come back, the mark burns off, the chip is struck through in red, and its Revive line in the card text reads struck, red, "used".
- **Night pointer light:** at night a soft, faint warm light follows your pointer over the battlefield (fainter than the pitch-dark lantern, inside the board only); on touch it shows at the last touch and fades.
- **Daybreak sun:** barely there: no hard disc, a soft blurred glow at a further 60% fainter, its rays a third fainter; the left-to-right light and the whole-board brightening stay.
## 2026-10-17 (hidden skirmish links)
- **Hidden skirmishes keep their links:** a revealed hidden skirmish (4-H, 8-H, 10-H, 14-H, 17-H) appears with a trail from the fight it sits next to and opens once that fight is cleared, instead of standing unlinked and open from the start (only each map's first fight is like that). Its trail fades in as it pops onto the map. A jumper (5-J, 13-J, 19-J) still lands on the trail between its two fights, and its links no longer depend on where it lands. While a hidden fight isn't on the map, the fights linked from it pass straight through it, so nothing waits behind a fight you can't see. The Ambush on 3-2 hangs off the same trail as 3-2.
- **Link edits on hidden skirmishes stick:** 🔗 Links edits to and from a hidden skirmish or a jumper (including the fight after a jumper, for example linking 19-2 to 19-3 as well as 19-J) now save, publish and draw; they were being rewritten on every render. Skirmish edits on a hidden fight no longer save its on-the-map state (position, secret flag, empty links), and old edits that did are cleaned up when they load.
## 2026-10-17 (play and death hitch)
- **The 0.1 s hitch on a play and on a death** (user: "Playing a card and when a card dies consistently lags the game by 0.1s"): both came from the board redraw. GSAP Flip measured every card before and after it, one card at a time, and each card's measuring made the browser redo the page's style and layout (about 4 passes a card). On fixed-slot boards (Open and Gladiator, the normal fights) the redraw now skips Flip. Cards that moved (the column range widening after a play) glide from where they were: every position is read in one pass, then the glides are written. A death or a play that moves nobody measures nothing. Classic Collapse rows keep Flip.
- The board rows get their emoji as pictures in the HTML itself (`EmojiStyle.htmlBlock`), instead of the emoji observer swapping them node by node after every redraw.
- The castle bars' hit flash replays only when the castle lost Health. It used to restart, with a forced layout, on every HUD redraw.
- Measured on a Conquest board with 3 cards a side, counting the browser's own forced style and layout passes (the machine was heavily loaded, so the milliseconds are relative):
  - The play's synchronous task: forced layouts 84 → 4, style recalcs 135 → 20, 611 → 61 ms. In a trace, forced passes went 242 → 22.
  - The death's board update: forced layouts 33 → 0, style recalcs 45 → 0, 152 → 11 ms. `renderBoard` in a death round went from 76–120 ms a call to 5–40 ms.
  - The emoji swap work in a death round: about 100 → 48 ms.

## 2026-10-17 (combat order and speed)
- **One Speed order for the round** (user: "Arrows etc, and all these kind of skills happen at Speed = 1. Quick happens at Speed = 2."). A round now goes: (1) the start-of-round turns as before: Cower, boomerangs coming home faster than the quickest Fast Forward unit, the Fast Forward / Swimmer (Flood) / Tailwind extra turns, the slower boomerangs; (2) Poison, Decay and Wither ticks, Meteor burns, On Round Start triggers, Rally; (3) the **main order, highest Speed first**: every unit's swing goes at its Speed = a base (**Quick 2**, a **Boomerang throw 1**, anyone else 0) plus its Speed skill and Haste (+2 itself, +1 the units beside it); every Ready shooter's **Arrow, Fire Arrow, Ice Arrow, Twin Shot, Volley, the Bolts, Spitfire and Snipe go together as one action at Speed 1**. Inside one Speed: Swift first, then left to right, then the side with initiative; a unit at Speed 1 that both shoots and swings shoots first. Under Tall Grass, Stealth units still swing before everything. (4) Banana / Durian snacks (Speed -1), then upkeep. Before this, all the shots went off in one volley before anyone swung, and Quick was only a tie-break inside a Speed. So a Quick unit now strikes before the archers (and can drop one before it shoots), and archers shoot before ordinary swings. The Quick and the shooting skills' texts say so. Sim outcomes shift (the card-matrix golden will move). `tests/combat-order-2026-10-17.js`.
- **Deaths settle after each attack or skill** (user: "Settle death effects after a skill or attack finishes. I realise pounce, quick, and arrow happen first, before finally the die animation plays."): the dead are cleared (death effects and all) after every swing and after each shooter's shots, instead of after the whole volley. A unit killed as a card arrives (Pounce, an Ambush, a trap, Skyfall, an Earthquake) dies right then, instead of standing at 0 Health until the next round's first clean-up (after that round's Quick swings and arrows). On the board the toppled unit stays drawn until its death plays after the leap or hit that caused it, and in the fight replay a death plays as soon as its action's last blow lands (a Sweep, Cleave or Volley still plays as one run), so a dead unit is never seen acting or being hit.
- **Fight lag** (user: "General animation lag - during animation. Is it because it requires preloading?"): not preloading (image decoding was under 10 ms a round). Profiled with Playwright (3 rounds, 5 cards a side, Chrome performance metrics and a trace): the main cost was style recalculation, mostly from six `body:has(...)` CSS rules: with a `:has()` on `<body>`, every spark, number and particle the fight adds made the browser re-check the whole page's styles. They are classes on `<body>` now (pg-has-vs, pg-has-overlay, pg-has-spot, pg-shop-back, pg-in-match), kept in step by `syncPageFlags`. Also: speech bubbles follow their cards from one shared loop at the start of GSAP's frame (reads, then writes) instead of one loop each reading after the tweens wrote; the card list is no longer rebuilt on every replayed beat. Measured before → after: style recalculation 13.0 s → 3.9 s; main-thread task time 20.4 s → 11.4 s; long tasks 10.0 s → 1.0 s; average 37 → 55 fps; 95th-percentile frame 67 → 17 ms; frames over 100 ms 29 → 5.
- **Nest pages**: the Nest shows 60 cards a page with the Codex's pager above and below (it drew every card at once). A full collection (602 cards): opening 2.7 s → 0.29 s, long tasks 17.4 s → 0.2 s, 16,470 → 4,844 page elements. **Codex pages hold 80 cards (was 40)**: the first 32 are drawn at once and the rest on the next frame, so a page turn reaches its first frame in about the same time as before (20 → 26 ms). Codex and Nest card art loads lazily and decodes off the main thread.

## 2026-10-16 (gameplay fixes)
- **Daily dungeon keys:** the 🎟️ Dungeon tickets are 🗝️ Dungeon keys now (still 1 a day, up to 3, plus 1 on Mondays). Every floor takes a key when the fight starts; win and you get it back ("+1 🗝️ Dungeon key" in the rewards), lose or forfeit and it's gone, and the climb starts again from floor 1. Your best floor is remembered, so a floor's first-clear payout is still paid only once, and "Play again" after a loss starts at floor 1. A run left open under the old rule gives its ticket back. The Babel Spire takes no keys and never resets.
- **Gold Leaves from daily dungeons:** every daily dungeon floor's first clear (above your best floor) gives 🍂 10 Gold Leaves, and the Long Burrow (22-LB) also gives 🍂 20 + N on every clear of floor N (floor 20: 40). The floor's reward strip and the results show them. (The Long Burrow is still an admin preview.)
- **Name length:** a name on the entrance ("What should we call you?") and in the name prompt needs at least 3 characters after trimming; a shorter one stays on the form with a line saying so (empty names no longer slip in as "Woodland Warrior").
- **Tutorial card windows:** after T-0 and T-1 the map comes up first and the window pops in a moment later (veil, spring, cards dealt in one by one). "Two more cards!" is a proper reward: a gift heading over a slow sunburst, big cards with their names on ribbons, and "➕ Add to deck".
- **No Lumber lesson box:** the big picture window is gone; the spotlighted Pitching lesson teaches Lumber on its own.
- **Swaps:** a swap only offers to trade out a weak card the game gave you (your starter deck's cards, babies with Attack + Health ≤ 3, Starter/Basic cards, tutorial cards), and never one rarer than the card coming in. Cards you won or pulled are never offered.
- **Filters stay:** the Codex (search, filters, sort, view), Skills, Forge, Market and the Camp's card pool keep their search and filters when you leave and come back, and after a reload.
- **Nest on Map 3, nests unlock:** the Nest opens on Map 3 (Gannet Cliffs), and so does the first egg. It starts with one nest; the next ones open on Maps 5, 10, 15, 20, 25 and 30 and are then built with Maple Leaves and Magic Dust (150 + 40, 500 + 120, 1,000 + 250, 1,800 + 400, 2,800 + 600, 4,000 + 900). A save with eggs in several nests keeps enough of them built.
- **Shiny and alt art are per copy:** a Shiny copy (or an alternate-art skin, which dresses one plain copy) no longer changes every copy of the card. The Camp shows each look as its own stack; click it to put that copy in your deck. In a fight only that copy is Shiny or wears the skin, in hand and on the board. Decks from before keep the look on as many copies as you own.
- **Notices → Quests tab:** the "Your quests" list (the daily and weekly quests you're on) moved from the first Notices tab to the second, above the errand writs, and that tab is called **Quests** now. Notices keeps the posted notes; tapping a quest in the list turns to Notices and scrolls to its note. Both tabs show from the start (before the Quest Board, the Quests tab has just the list).
- **CPU slots:** the CPU still plays the moment you commit your turn, but no longer always takes the slot nearest the centre: with a win in reach it goes to the open column furthest out (far left or far right); otherwise it mostly goes across from one of your units it can kill or out-last, and else anywhere legal at random. The silent sims (tools/difficulty_curve.js) keep the old placement unless they pass `aiAim: true`.
## 2026-10-16 (voices and feel)
- **Voice barks:** cards say short lines (6 words at most) in a bubble above the card for about 1.6 s: on play (about 1 in 3), the killer on a kill (1 in 2), on death (1 in 3), on a skill (leaders and bosses only), and idle when you hover a card in the Codex or a deck pool. Leaders and bosses always speak on arrival, on their first kill and on death. One bubble on the board at a time, one bark per card per round. Wild animals, dragons and objects "speak" in sound text (*hiss*), in italics.
- **Lines for 49 cards:** every Heroic, Epic, Unique and Legendary card, the leaders and bosses below that (Wandering Traveller, Wandering Mage, Rodent King, Glacial Ape-King) and the proposal's samples (Otter Centurion, Lantern Bearer, Raccoon Bandit). Otters are dry and soldierly, Hummingbirds quick and boastful. The full list is in `docs/barks-2026-10-16.md`; the card editor has a Voice lines box per moment (under More), saved as `barks` on the card.
- **Babble:** each bark is read out as a short Animal-Crossing-style babble in the species' voice (a mouse high and quick, a bear low and slow, a dragon a deep rumble, a fish bubbly), made in code. It follows the Voice and Sound sliders, is silent when either is 0, lasts under a second, and never plays more than about once a second.
- **Voice lines setting:** On / Leaders only (default) / Off, next to Effects (and next to Voice in the fight's settings). The old generic chatter ("Let's go!") only plays with On, and never over a bark.
- **Normal death:** the earlier topple is back (the card tips over on its bottom edge, greying), as one smooth motion that starts slow and speeds up, fading as it lands, with the leaves and thump on the landing. It was a near-still lean and a snap, then a separate fade.
- **Day and night steps:** within a phase, ☀️ 1/3 → 2/3 → 3/3 and the night's three steps now ease the board's light over 10 s instead of sweeping in. A board redraw mid-way carries on from where it was.
- **Softer day colours:** Day 1 (daybreak) is now close to the normal day colour, Day 2 is exactly the normal day colour, Day 3 is the old dusk amber moved 10% towards it. Night 1 and 3 are the plain night; Night 2 is 5% darker.
- **Nightfall and daybreak:** both are now two effects together: the whole board darkens or lights up over 10 s (tint and night veil), and the new light creeps in from left to right behind the ragged edge at 40% of its old strength, then melts into the rest. The morning light streaks are at 40% too, and slower.
- **Day's sun:** the sun and its rays are 85% more transparent; the sun keeps climbing and drifting while it fades out (it used to stop, then fade). The golden wash creeps in from the left at 40% strength.
- **Birdsong at daybreak:** the birds now sing only about 1 in 3 daybreaks, one to three birds with a different little exchange each time.
- **Day tooltip:** the Day pill's tooltip adds "Draw +1 on Day." (both sides draw when Day comes after Night).
- **Swamp, mist and fungal map titles:** the first-visit title (e.g. The Morel Hollow, Map 7) is now the normal ribbon banner like every other map instead of the ink-brush calligraphy, and keeps the ink look's soft dark shadow along the bottom of the screen. Murgle's dungeon title is unchanged.
- **Rain coming in:** the start-of-rain effect (on the map, and a Spring Rain field arriving) is 90% more transparent. Rain stopping is unchanged.
## 2026-10-16 (placement and rarity)
- **Rarity on the road is a rule now** (`ROAD_RARITY` in arena_app.js, checked by `tests/road-rarity-2026-10-16.js`):
  - Normal skirmishes: Rare up to Map 15, Very Rare from 16, Super Rare from 21, Epic from 36, Heroic from 41, Unique from 51.
  - Elites: one step above a skirmish from Map 10.
  - Bosses: no Heroic on Maps 1–19.
  - The dragon lair's boss (the Caldera Wyrm, 20-B-4) is the only Legendary in Maps 0–20.
  - Maps 21–40: a quarter or more of every skirmish deck is Rare or better.
  - Card rewards follow the same caps (the map leaders a boss pays are outside them).
- **Fewer commons pack by pack:** Pack 1 (Hedgerow Pouch) 50% commons, Pack 2 (Tidemire Chest) 46%, Pack 3 (Highcrest Case) 42%, Packs 4–6 40/38/36%, Pack 7 on 35% down to a 30% floor (they were about 75%). A numbered pack rolls the rarity first, then the card. The Mystery Booster keeps its own odds.
- **No Legendary before Map 21 from packs:** Packs 1–3 have no Legendary and no jackpot. Faction packs, Faction Rewards and Faction Growth hold Legendaries back until Map 21.
- **The Cathedral Eagle** is now the reward of its own boss (21-6), not Map 11's. Map 11's boss pays the new Ibex Rockcaller.
- **The Final Exam (T-4) and 20-B-3** no longer field a Legendary or an Epic.
- **Rarity relabels:**
  - Rare → Uncommon (12 babies and small animals): Fox Kit, Bear Cub, Fawn Scout, Stable Colt, Plains Zebra, Dust Hyena, Mountain Goat Climber, Bog Leech, Cave Flitter, Grass Viper, Rockslide Ram, Warren Scout.
  - Ür-Elk and Lone Grey Wolf are Very Rare; Snow Owl Sentinel is the first Super Rare.
- **71 of the 94 new cards are on the road**, each in one fight and as that fight's card reward (no art yet: they show their emoji). The other 23 wait for maps past 21.
- **63 more cards** that no enemy had played now fight somewhere: the Ent (and the Elder Willow) in the Old Bramble, babies, turtles, shrine acolytes, the Scraper of Skies at the Sky Scraper Sentinel, and pack cards nobody had met yet.
- **Field effects by the curriculum:**
  - The Tutorial is misty.
  - Pebble Beach has the plain Tide, and only 2-4 Pelican Point has the Tide-spout.
  - River Rapids is on Sunken Hollow only; Lilypad Reach has the plain Tide.
  - Smugglers' Grotto is Darkness (it was Pitch Black). Pitch Black moves to the Sunken Depths, which lose their night and First Blood.
  - Swamp Fever on Gatorback Swamp (25% in the Sunken Grove) and on the Sable Swampmire elites.
  - Scorching I on the Savanna elites; Frigid on the Taiga boss.
  - Freezing on the Tundra elites and boss.
  - Sandstorm on the Glass Dunes (Scorching II on its boss); Scorching II on the Foundry's elites and boss.
  - The new effects (field effects 2) are placed too:
    - Tide on every Pebble Beach and Lilypad Reach fight and the Mangrove and Coral Current skirmishes.
    - Landslide on 8-4, 8-6, 8-7; Crushing Depths on every Sunken Depths fight.
    - Rook's Row (12-2), Bishop's Path (12-4) and Mirage (12-6), each once; High Canopy on Map 13; Undergrowth on Map 15, with Tall Grass on 15-3 and 15-4.
    - Consternation on 16-6; Hail on 17-3; Slippery (30%) on 17-A-2; Glass-storm on 18-5 (instead of its Sandstorm).
    - Lava Spout on the Foundry's elites and boss (instead of Scorching II there); Scorching III on Map 20's elites and bosses.
    - Leylines and Haunted are only noted, for Map 40+.
- **Difficulty:**
  - Map 0 retuned: 0-1 is a gentle first fight now (castle 20, no glacier wolves) and the Raccoon Heist lost its 7/12 Nightcrew.
  - Maps 9–20 retuned with `tools/curve_tune.js` toward a curve rising from index 18 to 56 (castle Health, plus a few card trades inside the rarity caps). The strong reference deck now wins most Map 10–16 fights.
- **Tools:** `curve_tune.js` keeps its card trades inside the rarity caps. `difficulty_curve.json` fights also carry the game's own map number and code (`gameMap`, `gameCode`).
- **Proposal:** `docs/card-placement-proposal-2026-10-16.md` (+ `.xlsx`: Placement, Rarity economy, Field curriculum, Map gaps, Changes made).
## 2026-10-17 (board and rewards)
- **Pass** sits to the right of the Graveyard/Discard pile, and the pile keeps a card's shape (the Deck's size) on narrow screens.
- **Opponent's pitch:** their card drops into a card-shaped slot under their pills, settles, fades off, and only then a big "+1 🪵 Lumber" rises while their pill counts it (nothing clips the card any more).
- **Enemy hand size:** a "5 🃏" pill on top of the enemy's Deck; their 💀 Graveyard badge moves to the Deck's bottom edge.
- **Skirmish panel fits the screen:** the Field list is compact, two columns wide, and scrolls inside itself; the deck row always stays in view.
- **Ecclesia box** is deep purple with light text everywhere; the "Discard for" box under it is a lighter slate.
- **Armoury pool filters** (search, type, kind, level, sort) are kept when you leave and come back.
- **Codex:** no "one-off" tag on skills (the editor's skill picker keeps it).
- **First clear:** the unlocks drop onto the bright board; the screen dims only after they have all landed, then the results open.
- **New trails** stay hidden until they ink in, one after another, each fight fading in as its trail reaches it.
- **Admin Clear map** now pays every first-clear reward (Leaves, Dust, cards, packs, elite/boss cards) of each fight it clears, plus every fight's clear-again Leaves and Dust.
- **Pack opener:** the "N cards" count under a big pile counts down; the big view of a pulled card shows that copy's finish and Shiny (the finish picker stays admin-only).
- **Bonus copies:** a pack card may come with an identical second copy, credited for real: Common 5%, Uncommon 4%, Rare 3%, Very Rare 2%, Super Rare 1%, then halving (Epic 0.5%, Heroic 0.25% …). It shows as "Bonus!" with the copy sliding out from behind the card. The old "×2" with two blank cards (fired on any card you already owned) is gone.
- **Equipment** never comes from fight rewards, first clears, drops, finds, reward tracks or packs, and is gone from pack contents and odds; the Blacksmith remains its source.
## 2026-10-17 (new maps)
- **Map 22: The Rimefire Caldera** 🌨️ (`m22`, was the Reserved slot). An ice volcano above the clouds with 8 fights, ending at the boss **the Rimeheart Colossus**. Cold and heat meet in every fight: Sulphur Fumes, Slippery 25, Hail 2, Frigid with Lava Spout, Ash Rain, Scorching with Hail. It is a volcano map, so it has the Day 4 / Night 2 glow, Scorched Ground in the big fights and the volcano's odds on 22-6 and 22-8. Its rewards are 3 Rares and a Super Rare (the Caldera Snow Leopard). **The Long Burrow (22-LB) is still attached.**
- **Map 23: The Goldfeather Siege** ⚔️ (`m23`). The warfield outside the Magnate's walls, with 8 fights: war elephants with archers in their howdahs, trenches, trebuchets and the Barbican. It ends at the boss **Marshal Tuskwell**. Arrow Slits shoot down from 23-5 on. The **War Elephant** is the first creature with Arrow 2 twice.
- **Map 24: Goldfeather Keep** 🏰 (`m24`). **Breach the Gate**, then the Bailey, the Counting House, the Courtyard, the Battlements, the Gilded Guard and the Treasury, and finally **the Magnate Duck** (Legendary, King; Midas, Bounty, Swipe, Shield Call). The map's Super Rare is the Gilded Swan Knight.
- **Volcano Glow:** the volcano maps that have day and night (20, 20-A, 22) run **Day for 4 rounds, then Night for 2**, instead of 3 and 3. It is a per-fight rule (`phaseDay` / `phaseNight`), and Edit skirmish has a Day / Night box for it. The phase pill counts "2/4" by day and "1/2" by night, and the Environment card has a Volcano Glow row.
- **New field effects**, each with an Environment card, a battle-log line, a look, an Edit skirmish entry and an Effects library staging:
  - **💨 Sulphur Fumes** (`sulphurFumes`): from round 2, every unit that doesn't resist fire, isn't Dry and isn't Flying is Choking that round (−1 Attack on everything it deals). It does no damage and adds no poison. It is on **20-A-2 The Wraith Vents**, **20-A-6 The Vent Crabs** and **22-2 Steam Vents**.
  - **🌋 Ash Rain** (`ashRain`): both castles take 1 a round (never below 1), and day bonuses are halved, as under Cloudy.
  - **🌫️ Ashy** (`ashy`, or `ashyAfterEruption`): Flying units are grounded (no Flying dodge, no Tailwind or Headwind), and attacks at units miss 1 in 5. Darksight, Keen Sense and Sonar see through it. On the volcano maps, every **Eruption** leaves the ground Ashy for 4 rounds.
  - **🏹 Arrow Slits** (`arrowSlits`, 2 by default): the defenders' walls shoot a random unit on your side each round. A Helmet can turn the arrow.
- **Arrow ×N:** a card can loose its Arrow more than once a round (`arrowCount`; it is a hidden skill in the editor). The War Elephant has Arrow 2 ×2, and its card shows two Arrow 2 lines.
- **17 new cards, with no art yet:**
  - Map 22: Rimefire Salamander, Fumarole Ibex, Ashwing Ptarmigan, Caldera Snow Leopard, Rimeheart Colossus.
  - Map 23: War Elephant, Howdah Archers, Testudo Tortoise, Trebuchet Crew, Marshal Tuskwell, Great Gate.
  - Map 24: Goose Sentry, Mallard Halberdier, Tax-Collector Teal, Battlement Heron, Gilded Swan Knight, The Magnate Duck.
  - The boss cards and the Great Gate are enemy-only.
- **Map looks:** a procedural background for each new map (`tools/make_map_backgrounds.py` m22–m24), battlefield gradients, a Frostfire title theme (Map 22) and a Fortress theme with a new battlements silhouette (Maps 23–24), map music and ambience, and decor sets.
- **Plan: `docs/synergy-curriculum-2026-10-17.md`** (+ `.xlsx`). For Maps 0–40 it covers:
  - where each skill, synergy pair and field effect is met, felt and combined;
  - a Codex "Works well with" design;
  - showcase decks;
  - the Tinker's Workshop, Armourer, Chrysalis Grove, Caravan Trader and Brewmaster, with the map where each unlocks.
## 2026-10-17 (skills)
- **Reflect (reworked, 🪞):** a shot aimed at it bounces off and hits a random unit on the shooter's side (their castle if they have none), as the Reflect unit's own shot (it can be dodged; it never bounces again). Shots: Arrow, Fire Arrow, Ice Arrow, Twin Shot, Volley, the five Bolts, Spitfire, Snipe, Fireball (the whole burst bounces), Rocket, a thrown Banana, Missile / On Ready damage, a Damage trigger at a random enemy, the castle's bolt. Not shots: melee, Pounce, Skyfall, Meteor, Lightning, Earthquake and the other area hits. The old melee "Reflect N%" is gone; an old number is now that % chance to bounce. Mirror Moth (was 30) and the Reflect test card (was 100) are plain Reflect now.
- **Vanguard N (new, 🎖️):** at the start of the game the next Vanguard card in your deck moves into your opening hand and a random other card from it is discarded (once a game; skipped if one is already in hand). As your first card of the game: +N/+N (default 1).
- **Web N (new, 🕸️):** its hits Web the target for N rounds (default 1). Webbed (a status with its own colour and gloss): it can't dodge (no Evasive, Swift, Flying, Prey or Tide dodge) and can't move or be moved (Wave, Tornado, Restless, a Bloodlust leap).
- **Bloodlust (reworked):** no number now. When it kills the unit facing it, it leaps to face the nearest enemy creature (not a Structure) with a free slot of its own side in front of it (open boards; packed rows close up by themselves). It deals half damage (rounded up) to Structures and castles. The Skills Codex adds: its leap counts as entering, so an enemy Ambush or Sentry facing the new slot strikes it. Was: Bloodlust N, +N Attack for drawing blood, up to +3N. Piranha Shoal (was 1) is plain Bloodlust.
- **Ambush N:** strikes any enemy unit that enters the slot facing it: played, spawned (tokens, hatches, reserves stepping up) or, on open boards, moved in (Wave, Tornado, Restless, Converge, a Bloodlust leap). Was: only a card played there. Engine: `watchScan`, run after every card lands, before melee and after every attacker's turn.
- **Sentry (new, 🗼):** once a round, while Ready, it attacks an enemy unit that enters one of the 3 slots facing it.
- **Crab Claws:** never attacks the unit in front; with nobody to either side its claws reach the castle (was: it attacked straight ahead).
- **Leech:** the engine's old `sap` (heal on hit by the damage dealt) is in "+ Add Skill" as Leech, with a card line and a chip.
- **New skills on no card yet:** Carrion N (heal N whenever another unit dies), Hoard N (+1 Attack per N Lumber you hold), Venom Master N (your units' Poison / Bleed hits add N more), Fletcher N (your units' arrows +N), Herbalist N (every heal on your units +N), Shatter N (+N damage to Frozen units). Fester (damage from its own Poison) and Electricity (+1 on wet units) already existed; fire-on-fire waits for a Burning status.
- Tests: `tests/skills-2026-10-17.js`.

## 2026-10-16 (field effects 2)
- **19 new field effects**, built and selectable in Edit skirmish (Hazards and rules), each with an Environment card, a battle-log line, a look and an Effects library entry. **No map carries them yet**; map placement is a separate pass. Engine: `fieldEffects2Tick` and the helper block near `rules` in bramblewood-engine.js; texts: `FIELD2` in arena_app.js; tests: `tests/field-effects-2026-10-16.js`.
  - **Tide** (`tide`): the Flood/Ebb cycle as a field effect of its own, Flood from round 2.
  - **Landslide** (`landslide`): each round a 1 in 4 chance of rocks: 5 damage to every unit that isn't flying (Mountain Climbers are spared too).
  - **Consternation** (`consternation`): every card in each hand loses 1/1 each upkeep, and keeps the loss when played (0 Attack and 1 Health at the least). Hand cards show what they have left; a 😰 badge on the unit.
  - **Crushing Depths** (`crushingDepths`): 5 water damage to every unit each round; Tide units and Swimmers take half, water Resist halves it again (a resistant Swimmer takes 1). No day or night under it.
  - **Rook's Row** / **Bishop's Path** (`rookRow` / `bishopPath`, Map 12's lines): +2 for a hit on the unit square in front / on the slant (interlocked ranks, Fork prongs, Backstab, Crab Claws).
  - **Mirage** (`mirage`): each round a random unit gets a 1/1 Illusion in a free slot right beside it (none if both are taken), copying only Flying, Tide, Swimmer, Haste and Speed.
  - **High Canopy** (`canopy`, Map 13) and **Undergrowth** (`undergrowth`, Map 15, the same rule without the Flying and Bounty parts): Pounce +2, Swift (and Quick) units Evasive; High Canopy also takes away Flying's dodge and gives Bounty +1.
  - **Tall Grass** (`tallGrass`, Map 15's add-on): Stealth units attack first; Backstab hits and Pounce deal double.
  - **Slippery** (`slippery`, a %; 50 by default): every attack at a unit misses 1 in 2, and every trigger and on-hit skill fails 1 in 2. Very strong, so the number can soften it.
  - **Glass-storm** (`glassStorm`, one-off): a Sandstorm (with its wind) whose glass buffets every unit for a random 1–3 each round.
  - **Hail** (`hail`): 3 ice damage to every unit each upkeep.
  - **Lava Spout** (`lavaSpout`): one random column bursts each round, 3 fire damage to the units there, both sides.
  - **Scorching III**: the existing Scorching at level 3 (4 units a side, 3 fire), next to Scorching II.
  - **Leylines I / II / III** (`leylines1/2/3`, independent): I strengthens the zeitgebers (a plain Diurnal / Nocturnal / Crepuscular is +3/+3, a numbered one +2/+2 more; Tide +3 Attack on Flood, Armor 3 on Ebb; Full Moon and Moonborn +2/+2 more). II: +1 Lumber a round for each side. III: +1 Lumber and +1 Stone a round, but every unit and both castles take 3 magic damage (a castle never drops below 1 from it).
  - **Haunted** (`haunted`): each round one random unit on each side is **Frightened**: it doesn't attack that round (👻 badge). Ghosts and Atheists aren't scared.
- **Atheist (new skill, on no card):** half damage from magic and from Devilry and Ecclesia attackers; the Leylines' burn doesn't touch it; never Frightened.
- **Sandstorm brings Windy's random wind** (unless the fight sets its own wind); its field card stack shows the Windy card.
- **Tide-spout is one-off:** it is on Pebble Beach's 2-4 only (was every Pebble Beach fight), and it no longer brings the Tide in. Flood and Ebb come only from the Tide, High Tide, Perma-tide / River Rapids, or a Moonpull / Tsunami card. The spout's column fades in and out about twice as fast.
- **The tide pill shows whenever a tide runs**, also on maps with no day and night (it was hidden there).
- **Flood and Ebb look clearer:** a light blue (Flood) or wet-sand (Ebb) tint washes over the board, each wave carries a foam line, High Tide's wave is bigger, and the water line at the board's foot keeps a drifting foam edge on Flood and glints on Ebb.
- **Side maps in daylight** (Tutorial, Clovermead …): the map pushes in only a little (×1.3, was ×4.5) and the side map grows from 90% (was 35%).
- **Edit skirmish:** the add list offers every hazard and rule (Swamp Fever, Freezing, Sandstorm and River Rapids were missing), every added effect has its chip, and one-off effects say "(one-off)".
- **Leader light stays a look:** a leader's glow lights nothing in the rules (only Illuminate does); a test holds it.

## 2026-10-16 (results and rewards)
- **No rank lesson box:** the results no longer show "🎉 Rank A! Well fought. Keep 90% of your castle…" (or its E/S/SS/SSS versions); the rank hex already says it.
- **Packs in First Clear:** the skirmish preview shows just the pack, no name. Hovering or focusing it opens a small card with its name and "Faction rewards!" (a free pack says how many cards).
- **Rank-locked card rewards:** a card reward that needs a rank wears that rank's small hex emblem on its corner instead of a separate "B+" pill; a card that only needs the first clear shows nothing extra.
- **Card reward ranks:** none needed on Maps 0–5, B from Map 6, A from Map 21 (was B from 5, A from 15, S from 30). S only when a fight sets it itself (`cardRank` on the node).
- **Enemy deck preview:** open from the start on Maps 0–5 (unless the fight asks for an A or S); from Map 6 it still needs a B clear. A locked deck shows just 🔒, without the rank emblem.

## 2026-10-16 (fight and rewards UI)
- **Graveyard preview:** just the cards (the Removal Zone's under a thin 🌫 rule), no titles, counts or close text, in a speech bubble whose tail points at the pile.
- **Battle log:** plays and attacks are the headline lines; every other line (status damage, effects, draws, readies) sits one step in. Penance and Blood Tithe now have log lines, a castle's own hit reads "Your castle hit …", and an event with no sentence that still hurt something says so.
- **Results rewards:** the main currencies (Maple Leaves, Magic Dust …) are one row of same-size pills; materia, a rescued baby and Base growth sit on a row below. The "✨ N for Base growth" pill is gone: a Base card already at its top level shows greyed, its dust bursts into the Magic Dust pill and the pill counts on up.
- **First Clear box:** centred, with no empty space on the right (it had a spare grid column). A won box whose label is wider than 80% of it shows just the ✓.
- **Pass:** it now sits in the deck's row, centred in the room before the Graveyard (between the Deck and the Graveyard on a phone), says just "Pass", and is squarer.
- **Bounty bubble:** "+🪵" (the number only above 1), no "Lumber" word.
- **Toasts over "Tap to skip":** while the reward reveal or a VS screen is up, toasts sit above its bottom label and over it.
- **Auto-Sweep results:** a sweep opens a results card (the fight, wins out of runs, Maple Leaves and Magic Dust counting up, Collect) instead of a toast.
- **Tutorial map:** T-2, T-3 and T-4 stay hidden while the two tutorials are played, then appear as you reach Map 1, Map 8 and Map 18.
- **Locked skirmishes:** the bramble ring is a true circle (it was lemon-shaped).
- **Win screen:** the "+3 XP" bar with its glow that floated over nothing is gone; the reward coins find their pills as they fall instead of where they were mid-animation; an account level-up waits until the results close, then plays over the page.
## 2026-10-16 (skills 2)
- **Wind is random now:** each round rolls its own wind. Windy: at your back, in your face or calm (1 in 3 each). Gale: always strong, either way (1 in 2). The field cards, pills and the Effects library say so; it used to flip back and forth on a fixed beat.
- **Amore (new skill, 💕):** when an Amore unit arrives and one of your Amore units already on the field shares a Type with it, the two pair up: +0/+3 and Regeneration 3 each. Once in each one's life, only ever those two; enemy units never pair with yours. When one dies, the other's heart turns brown 🤎: it keeps +0/+3 and loses Regeneration 3. Hearts drift between the pair; the unit's details say "In love" / "Heartbroken".
- **On Pitch (new trigger), card text "Scavenge - …":** every unit of yours on the field reacts when you pitch a card, with any trigger action. "Scavenge" is a placeholder name (Kindling and Salvage were the other ideas). On no card.
- **Stun N:** each landed hit has a 1 in 3 chance to Stun the target for N rounds (default 1). The old % values (Red Dragon 50, Cinder Hornet 30, the test card 100) read as Stun 1; cards.json now says Stun 1.
- **Cataphract Destrier:** the old "On Ready: deals 6 damage" is gone from the card (cards.json, and a published edit that still carries it, as it loads). The purple 🗡 counter that climbed to 8 is **Scar**: each hit from an enemy with Scar (Magma Titan, Scar 2) adds it for good, and every later hit on the unit deals that much more. Why it could not be removed: that old field had no row in the card editor, so there was nothing to delete (and a plain Save dropped it silently). The editor now opens it as an On Ready → Missile 6 trigger, which shows and can be removed. The published row: `supabase/oneoff/2026-10-16_cataphract.sql`.
- **Pounce N, <Att> or <Hp>:** Pounce can deal the card's own Attack or Health, worked out as it lands. In hand it reads "Pounce <Att> — When played, deal <Att> damage …"; on the board the number it dealt shows in blue.
- **Burn 1 Lumber (a trigger cost) and Fire on hit (new action):** every trigger has a "Pay" field: nothing, or Burn 1 Lumber (with no Lumber, the trigger doesn't go off). Fire on hit N: this attack's hit also deals N fire damage (meant for Map 20 as On Attack → Burn 1 Lumber → Fire on hit N). "Burn 1 Lumber → Heal an ally N" works the same way. An ember leaves the Lumber pill; the flare shows on what it hit.
- **94 new cards**, one for every skill that was on no card (Swift, Crab Claws and Restless stay off cards, as decided on 10-14 / 10-15), each a new animal (Jay Pilferer, Lovebird, Tardigrade, Sperm Whale Elder, Starfall Owl …). No art yet, not on any map; stats fit the stat budget for a suggested map. List: `docs/new-cards-2026-10-16.md` (+ `.xlsx`).
- **Clean names:** no braces, notes or "one-off" in skill names. "Diurnal – { }", "Nocturnal – { }", "Full Moon – { }" and "Tide – { }, { }" are just Diurnal / Nocturnal / Full Moon / Tide, with a "Gives" field (Stat bonus or Skills); their card lines read "Diurnal — By day (and in Twilight) it has Evasive, Thorns 1." "Bloom (conditions)" is Bloom When. One-off is a small tag beside the row. Dropdown options lost their bracketed notes (Cower: Hide in its shell / Flee and heal 2; Wave: Alternate).
## 2026-10-16 (archetype frames)
- **Archetype card frames:** every archetype has its own front frame. Devilry: dark iron, blood runs and pentagram studs. Ecclesia: white marble, gold and a stained-glass plate. Scrappers: riveted scrap-metal plates and a hazard stripe. Evolution: pearly shell ribs with cells in the plate. Exiled Ones: cracked ash, a dead thorn vine and a wilted rose. Forgotten Ones: dust, cobwebs and candle wax. Ancient Ones: weathered runestone with glowing runes. Outer Ones: a violet starfield. Void: black, an event-horizon rim and black holes on the corners. Each carries its emblem on both sides. A unit of an archetype wears the archetype's frame; a structure keeps its rickety boards, in the archetype's materials with the emblem nailed to its posts. Castles and field cards keep their kind's frame. Only Devilry, Ecclesia and Scrappers have cards today; the other six frames are ready for when they do.
- **No more top-right archetype mark** on cards that wear an archetype frame: the archetype corner mark (the 🙏 for Ecclesia, ⛧ for Devilry…) and the ⛧ Dark Summon corner badge are gone; Dark Summon is still in the card text.

## 2026-10-16 (fight flow)
- **Stuck fights fixed:** a fight could freeze with a card played but no round coming: Pass turn, playing, pitching and Auto-play all did nothing. The card was on the board in the engine, but an error in one of the play's effects or log lines stopped the turn before its round, and every retry hit the same error (and gave the CPU another turn). Now one commit runs at a time, the CPU acts once a round, the play's effects can't stop the round, a round that breaks always hands the turn back, and a watchdog starts a played turn's round if it never began. A card you play or pitch while the turn is already committing just shakes.
- **Map 0 lessons can't trap you:** outside the guided tutorial, a lesson gate (the pitching lesson, "That one looks tough") no longer blocks Pass turn, Auto-play, Forfeit, Quit, the speed button or the log, and a lesson lock whose bubble is gone lets go.
- **Upkeep:** the round-start effects (a castle's own action, the field's ticks) play out before your turn opens. Your hand dims, an "⏳ Upkeep" chip shows on the field, and play, pitch and Pass wait until it ends.
- **Herb Refinery:** its brew is a visible 🧪 thrown on a shallow arc that lands in 0.44 s (was over a second). The same quick throw for every castle shot.
- **Castle damage numbers** pop on that side's HP bar, where its fill ends, not in the middle of the field.
- **Normal hits are audible:** every hit now has a mid-range thwack. Before, only hits of 4+ had any sound laptop and phone speakers could play.
- **Killing blows:** the "−N ✖" stamp is gone. When the killer has an On Kill trigger (or Momentum, Midas Touch, Slash & Burn), a ✖ pops on the target as the blow lands, darts into the killer, and the trigger plays as it arrives.
- **Deaths start at once:** a killing blow no longer waits out the hit's beat; the death plays as the number lands.
- **Triggers:** when a trigger fires, only the card's own ⚡ badge for it glows. No rune ring, card glow, aura or lightning bolt.
- **Quick on the castle:** a Quick unit hitting the castle dashes straight at that side's HP bar, and every Quick hit dashes (it was once a round).
- **Battle log ✕:** the open log has a close button.
- **Fight preload:** as a fight opens, the art of every card either side can field (decks, hands, leader, the tokens and spawns they bring), both castles, the field's cards, the card backs and the arrow sprites are fetched and decoded, the effect glyphs are painted once off screen, and the sound engine is woken.
## 2026-10-16 (effects polish 2)
- **Electricity's arc is lightning, drawn by itself:** the arc's bolt (and a wet target's extra zap) is drawn by the hit it deals, and the number pops as the bolt lands (about 0.07–0.22 s, not a second later). Its damage was already lightning ("shock") in the rules, and it still ignores Armor (only melee hits meet Armor), but it now looks like lightning too: a yellow ⚡ number, a ⚡ burst and a pale-blue flash.
- **Momentum's icon is ⌰**, on the card, in the float and in the battle log.
- **Immolation:** the immolating unit has the fire on it. Its neighbours flash with warm light, glow orange at the edge and show fire-coloured 🔥 damage numbers, with no flames of their own.
- **Armor:** when Armor cuts down a hit, the 🛡 on the card's skill strip lights up and there's a metal "konk". Hits Armor didn't reduce stay silent. Hit events now record how much Armor took off (armorSoaked).
- **Pack:** the 🐺 that pops over the card when the pack grows is half the size.
- **Sap:** its red drain drops are half the size.
- **Lantern / Illuminate on play:** no 🏮 or moths. The light swells slowly out of the unit, settles, and fades as its lasting glow takes over.
- **Night-blind eye:** it blinks once when it first appears, then stays shut. After that it blinks only rarely (about 1% a minute). Every sight miss (darkness, Night-blind, Sun-shy) now just says "Miss!", shown on the unit that was swung at.
- **Illuminate lights the unit facing it:** a Night-blind unit directly facing an enemy Illuminate (or Lantern) unit doesn't miss for night-blindness. Card texts say so. Test: tests/nightblind-illuminate-2026-10-16.js.
- **Dark Sight eyes are centred:** on flyers they were about 3 px left, because they were centred on the card's wrapper rather than its hovering tile.
- **Pounce is more aggressive:** a slower, deeper crouch (0.24 s, was 0.12), a quick spring to the top, then the dive onto the card in 60% of its old time. The hit lands when it always did.

## 2026-10-16 (effects polish)
- **Heals take Poison off first:** every heal (Regeneration, Heal, Bloom, Nursing, Healing...) removes 1 Poison counter per point of healing before anything else, then Bleed as before, and only what's left restores Health. A poisoned unit with Regeneration uses it even at full Health. Each counter removed hops out of the card's Poison badge, and the badge counts down.
- **Dusk:** no setting sun any more. The board gets the static shadow bars across it and a faint warm tint from the west.
- **Bite:** one row of teeth on each jaw, and the jaws close all the way so the teeth mesh. Each tooth is white at the tip and fades toward a faintly red root.
- **Flying attacks:** no more swoop line. A flyer attacks with the normal lunge while its shadow draws in under it, so it looks like it dives.
- **Heal and Regeneration:** the heal's pluses are green (the ➕ emoji showed grey), including the one in the heal number. Regeneration's orbs start along the card's edge, invisible, and sink into the centre with a slight turn. They're brightest halfway in and fade out at the centre, then the heal's pluses rise.
- **Immolation:** the fire stays on the immolating card and moves with it. The units it burns only char. The flicker no longer throws flames across the screen, and that fix also covers heat and lava scorches.
- **Lantern light in the dark:** about half as bright and much wider. It stops at the battlefield's edge and no longer spills over the hand and HUD.
- **Chain lightning:** each bolt starts fading as soon as it appears, and the jumps come 20% closer together. Voltaic Eel's grey ball is gone. It was Electricity's arc: the arc reaches the screen as a ranged hit with damage type "shock", which has no projectile look, so the default grey ➶ flew to the unit beside the target. That hit now throws nothing, because the lightning is its look.
- **Arrows are 30% smaller:** Arrow, Fire Arrow, Ice Arrow, Twin Shot, Volley and Pierce, plus the Volley rain arrows. Boomerangs are the 🪃 emoji, not arrow art, so they're unchanged.
- **Effects Lab:** the entries for all of the above show the new looks. Old looks are kept as B variants where it helps to compare (swoop, Immolation, the Eel's grey ball). There are new heal-vs-Poison variants on Heal and Regeneration.
## 2026-10-16 (skills)
- **Two Devilry payments (new, on no card yet):** **Penance N** — "When played, deal 3 damage to your own castle." **Blood Tithe N** — "When played, deal 2 damage to a random ally (your castle if there is none)." Payments, not hits: Armor, Bulwark and the castle's Shield don't stop them, and a castle never pays below 1 Health. Icons ⛧🏰 / ⛧🩸, a dark ⛧ pulse sinks into the castle or the ally that pays, a battle-log line, editor rows, Effects library stagings. The stat budget counts them as a discount (skill cost `-v`: minus their number).
- **Ambush N (reworked):** "When the enemy plays a card into the slot facing it, deal 3 damage to that card." It strikes as the card arrives, Waiting or not; it can't be dodged and no Guardian steps in. The old "first attack always crits" is gone. Cards with Ambush (Venomlord Serpent, Subterraneaner, Trojan Raider) read as Ambush 3.
- **Expose N (reworked):** its hits put N Expose counters on the target. Each later hit on that unit is a crit (double damage) and removes 1 counter (it was +1 damage). Attacks at an Exposed unit still can't miss, so every counter becomes a crit. A swing that rolled its own Crit isn't doubled twice. The hit chip says "🎯 Crit!".
- **Perma-tide** now says "Always Flooded" (field card, pill and the Effects library).
- **Statuses on a unit's details:** hovering a unit in play lists each status it has right now under its skills, with its count, in the status colour: "Poison 3: takes 3 damage at upkeep, then loses 1 stack."
## 2026-10-16 (frames and titles)
- **Card front frames by card kind:** every card face (board, hand, Codex, deck editor, the big card views) now wears the frame of its kind, the same four kinds as the card backs. Units keep the walnut look, polished: a gold inlay round the art and brass corner pins. Structures get the same frame knocked together from weathered planks: uneven boards, crooked and bent nails, rope lashings on two corners, a split or two, a top board that overhangs the corners, and the whole frame a hair off true. Castles get dressed stone and gold with ruby and sapphire corner caps. Field effects get the Environment card's mossy stone and gold line. Rarity borders, the legendary gold rim and leader rings stay on top; the name scroll, stat pills and skill strip haven't moved. Pixel-art 9-slice images (`tools/make_card_frames.py`, `art/frames/`).
- **Murgle Mayhem's title:** entering the daily dungeon plays the same ribbon-banner title as the other maps (the Ice Hollow kind), in a new **dungeon** variant: a darker veil, a dungeon wall behind, a stone ribbon with moss trim, stalactites and bats, and swamp slime dripping from the top of the screen and down over the ribbon. The subtitle reads "Daily dungeon". Any dungeon can use it (`THEME_OF` → `'dungeon'`, or `variant:'dungeon'`); it's in the Effects Lab map titles.
- **Cataphract Destrier:** new flavour text, a nod to a certain gilded knight on the first road: "Gilded from crest to hoof, it keeps the old road out of the wood. Most who meet it there turn back. The wise ones come back later." Stats unchanged.

## 2026-10-16 (11:00)
- **Dungeons tab name:** with one daily dungeon open the Play tab reads its name (Murgle Mayhem); from the second on it reads Daily Dungeons, like Raids. Hidden until one is open, except in Admin Mode. The Babel Spire doesn't count (it takes no tickets).
- **World map:** every daily dungeon you've opened is a diamond beside its map that takes you straight in. Locked ones aren't drawn; admins see them marked 🛠️.
- **🗝️ key:** a small key with your Dungeon ticket count sits beside Home and Arena at the top right of the Play screens, and beside Home on the other screens. It opens the dungeons.
- **Errands tab on the Notices:** the board has two tabs now, Notices (daily and weekly, as before) and Errands, which lists only the errands folk asked of you on the road, never dailies or weeklies. Each errand is a big, straight parchment writ: title, who asked, their words, the task with a progress bar and count, the reward, and a wax-seal Claim.
- **Errand progress toasts:** when an errand moves on, a toast says so wherever you are ("📜 Errand: Pests in the Reeds — 7/12", "📜 Errand complete: …"), one per errand, with a fight's changes gathered into one.
- **Journeys hidden for now** (`JOURNEYS_HIDDEN` in arena_app.js): no board, no fight-step label, no toasts and no steps taken. Admin Mode still sees them, marked hidden.
- **Worthy is now Bounty everywhere:** every card that had Worthy N has Bounty N (with both, the larger). Published edits and cards saved in a browser that still say Worthy (Trash Panda Trickster, for one) change to Bounty as the game loads them, and so do skill grants and triggers. The engine no longer counts Worthy as Bounty.
- **Worthy is free for later:** it's kept as an empty, hidden slot. It isn't on any card and doesn't appear in card text, the Codex, tooltips or the keyword list.
- **Tide evade (test, off by default):** while the Tide is in (Flood, Ebb or High Tide), Tide units are Evasive against attacks from units without Tide, whatever their own skills, on both sides. To turn it on: Admin → 🧪 Rule tests, or the Test Lab panel (admins only, and only while Admin Mode is on). You can also add it to a skirmish in Edit skirmish ("Tide evade (test)"). Sims and tests use the `tideEvade` battle option or rule. While it's on, the Tide pill and the Tide chip mention it, and dodges play the normal Evasive effect.
- **Live database (your "Apply it"):** the feedback table, world events, server fight seeds (T3), the admin player list (S1), anti-cheat tier 1 (S2) and the new co-op rooms table are applied. Player rating is now server-only, so the game no longer writes it.
- **Card backings by card kind:** four pixel-art card backs. Units get the base design: the acorn mark in a gold medallion on a green weave. Structures get its timber-and-iron sibling: crossed mallets, plank boards, a stone frame. Castles get a regal back: crimson damask, a gold frame with rubies, a crowned keep. Field effects get a mossy back with vines and a day-and-night disc. Each face-down card shows its own kind's back: the pack opener before you flip, the draw flip into your hand, an enemy card flying in, a full-hand pitch, reward reveals, the home-screen card fan and the back of a card you spin in the viewer. The deck piles hold a mix, so they show the unit back (the pile never gives away your next draw). Images are in `art/backings/`, made by `tools/make_card_backings.py`.

## 2026-10-16 (09:15)
- **Skill marks on the card face:** 51 skills that sat on real cards with no mark now show their icon on the card's skill strip, with the number when it's more than 1. Among them: Nocturnal, Diurnal, Bleed, Regen, Guardian, Swarm, Arrow, Stealth, Pierce, Crit, Freeze and Shock.
- **Festering is now Lingering**, so it no longer reads like Fester. Lingering: Bleed and Poison don't wear off while it's on the field. Fester: extra damage equal to its own Poison.

## 2026-10-16 (07:30)
- **Feedback:** every note now carries the player's id (their account, or their guest session), their player name, whether they're signed in, and the time. The table still waits for "apply it".
- **Blacksmith:** a recipe stays hidden until you've held every card it uses (and its result, when the result can be found elsewhere). With none yet, the anvil says how recipes appear.
- **Flora:** the Wild Veggies line (Maps 20+) is now called Flora: the card plan sheet, the map look and the notes.
- **Skill audit:** all 216 skills checked against the engine. The full table is in `docs/skills-audit-2026-10-16.md` (and `.xlsx`).
- **Names:** Divine Retribution is now Retribution, Satiety is Well Fed, Revivificated is Revive (saved cards are unchanged).
- **Card text:** every skill has a short line now. Freeze, Sleep, Paralyze, Blind, Make Tipsy, Confuse, Shock, Stagger, Chained and Revive showed nothing on the card before. Pounce, Ice Arrow and Counterattack now say what they really hit.
- **Amounts:** Rabid N (Poison, default 2), Durian N (Thorns, default 1) and Dynamite's blast damage (default 5) can be set in the editor. Existing cards play the same.
- **Editor:** the status skills label their numbers Chance % / Rounds (they said Timer / Damage). Stun and Reflect start at 50%.
- **Keywords:** Exposed, Bound, Toxin, Smoke, Scar, Irradiation and Shield are coloured with a short meaning; magic, water and psychic damage are highlighted; plural and "&" skill names match.
- **Skills Codex:** lists the status skills, Explode, Render, Revive and Progeny too. Every skill line has an icon.

## 2026-10-16 (06:30)
- **Field art:** every Environment and weather card now has its own pixel-art scene (27 NightCafe images, about 20 credits):
  - Darkness, Pitch Black, Absolute darkness
  - Gale, Windy, Cloudy, Mist, Night, Twilight, Full Moon
  - River Rapids, Perma-tide, High Tide, Tide-spout
  - Swamp Fever, Freezing, Frost, Frostbite, Sandstorm
  - Scorching, Scorched Ground, Lava Tide, Petrification, Eruption
  - Boss surge, Deep mines, Rain
  - An unrevealed "?" card still hides its picture. The art is in `art/fields/`; `FIELD_ART` in arena_app.js says which card uses which.

## 2026-10-16 (05:30)
- **Quick:** the hit now lands with the dash (about 0.15 s), together with the speed lines, instead of after the normal wind-up.
- **Cave fire pits:** at most 3 per map, spread along the trail.
- **Map titles:** peaks, desert, volcano and night maps now use the Ice Hollow ribbon banner instead of the cinematic letterbox. Swamp, mist and fungal maps keep the ink style. The lab still shows all three.

## 2026-10-16 (02:00)
- **Combat animations:**
  - Cards no longer jump left or right between rounds or on victory.
  - Misses play the attack, and Evade dodges right on the blow.
  - Cleave is one arc across three slots, 0.2 s apart. Pounce leaps onto its target and hops back.
  - Day/night sweeps in gently.
  - Victory comes up over the crumbling castle, and castle damage numbers rise from the HP bar.
  - Restored the old shuffle.
  - Full Moon howl, new wind (soft or strong, north or south), wavy heat haze, armour glow, Bounty "+N" to Lumber.
  - Poison is 40% less dark, and poison deaths use bubbles.
  - Normal deaths drop straight down once.
- **Battle board:**
  - Guardian plates sit behind other cards and break on death. Clicking the graveyard shows its cards.
  - Pills are one size. The initiative coin sits on top, tinted by the field.
  - The fight backdrop takes the field's colours.
  - Rarity borders on the field, with a ring on leaders.
  - No empty grey strip. Costs of 5+ show as icon + number.
  - The enemy's resources are mirrored on its side, with a pitch-into-ground animation.
  - A turn # pill after the match.
- **Rules:**
  - Illuminate (Lantern's new name) and a faint leader light in the dark.
  - Swift is off enemies. Pounce goes for the unit opposite first.
  - Bounty and Worthy are merged.
  - Cleave, Fork and Pitchfork side hits can miss.
  - Sudden death: from round 20 every landed hit kills, and from round 25 any castle damage destroys the castle.
  - Simpler Darksight text. Structures are immune to poison.
  - Nursing skill and Nest mastery.
  - Deck-out surrender only when the enemy is truly out.
- **New skills (on no cards yet):**
  - Wilting, Venomous, Toxin, Weaken, Bulldoze, Tangleweed, Strangle
  - Invincible, Invisible, Sonar, Poison Gas, Spitfire
  - Slash & Burn, Predator & Prey, Nova, Absolute Zero
  - Mountain Climber, Crystallise, Cure, Trap, Taunt
  - Molting reworked and Bludgeon fixed.
  - New basic card: Sheep (Taunt).
- **New field effects (on no maps yet):** Swamp Fever, Freezing, Sandstorm, River Rapids, Scorching II, Cloudy.
- **Hidden skirmishes:** five revealed by clues (4-H, 8-H, 10-H, 14-H, 17-H), and three "jumpers" that land on the trail (5-J splash, 13-J ghost, 19-J meteor).
- **Pages:**
  - Dark maps are blotted out until cleared, and fire pits light as you win.
  - Trail lines meet node centres. Map arrows go the right way.
  - Murgle is on the World map, and there's a new **Dungeons** tab (tickets: 1 a day, plus 1 on Mondays). The Long Burrow (Map 22, admin preview) and the **Babel Spire** tower (from 20-10; BR 555 + 25 per floor; levels to 20) are there too.
  - Raid parts show X / Y HP left.
  - Forge sorts like the Codex, the hammer sound hits on the blows, and the Blacksmith text has contrast. Codex corners are no longer cut off.
  - Sunken Depths art is redone.
  - Deck editor: Save sits on the ready row.
  - Community defaults to Friends, with woodland friends and recently played.
  - Medals are on Profile, and quests are on the Notice board.
  - Max Energy now goes Nest 20→30, Forge 30→50, Tavern 50→60, paid in Dust and materials.
  - Tavern recruits with Beer (1–3 a week).
  - A 💬 feedback button (the database table is waiting for "apply it").
  - Noto emoji option. Skills Codex filter.
  - Map titles: a title sequence per biome the first time you open a map each session.
- **Effects Lab:**
  - The stage stays visible while you scroll, and the variant buttons sit in a thin right column.
  - 66 map-title and grandeur entries plus 31 new fun effects (fireworks, ink-brush reveal, CLASSIFIED stamp, stained glass, gacha capsule, lantern festival…).
- **Art:** the armoured boar is now Tusked Vanguard. New card Snapstick Turtle.

## 2026-10-15 (22:30)
- **The big effects sweep:**
  - The inventory lists 933 effect moments: every skill, status, darkness level, death, castle moment, card treatment, foil, pack reveal, map, menu, reward and future feature (`docs/effects-inventory-2026-10-15.md`).
  - All of them are now in the **Effects Lab** with search, filters, a coverage meter and a "Variants to choose" view.
  - About 1,300 variants in all. Where the look was uncertain there are A/B/C takes side by side; the game uses A.
  - **Highlights:**
    - Blind and dark units look blinded, and the lights go out when darkness starts.
    - Each darkness level has its own miss.
    - There is a death for each cause, plus a King's fall and a boss death.
    - Status wear-offs and lost turns now show.
    - Mythic, Ancient, Divine, Void and Daemonic each get their own pack reveal, and a foil pull gets a FOIL reveal.
    - 22 new foil concepts.
    - Every map and side map has its own ambience.
    - A wax-seal stamp on cleared fights, trails that draw themselves, and a map-cleared celebration.
    - The account level-up moment.
    - Damage colours for magic, water and true damage.
  - Per-batch notes are in `docs/fx-batch-a..f-status.md`.
- **Fight rules and field pills:**
  - **Exposed:** +1 damage per hit, and attacks on the unit can't miss.
  - **New skills:** Bloodlust and Full Moon.
  - **Plain and advanced forms:** Diurnal – {…}, Nocturnal – {…}, Full Moon – {…}, and two-facet Tide – {…}, {…}.
  - Flow is now **Flood**. Swimmer is retired, and its 33 cards now have Tide.
  - The field pills show only the current state: Day/Night X/3, Wind ⬆⬇ and Flood/Ebb/🌊🌊. They're no longer clipped, and the forecast pill is gone.
  - Map 0 has a Mist pill showing "?".
  - The empty middle slot comes back when a row is empty.
  - The Pounce "line" was a visual bug and is fixed.
  - The Spawn corner pill is gone.
  - The ambush skips its extra steps. Losing it costs 10 to 15 + 5 per map Maple Leaves (max 100).
- **Pages:**
  - Home buttons go to their own pages.
  - The Forge is out of the Codex tabs; Log, Deleted and Reference are admin-only.
  - The Codex shows 40 cards a page without splitting groups.
  - Wildpaths text is halved.
  - The Sandbox picker shows compressed cards.
  - Skirmish deck previews show tooltips on hover (1 s) or hold (0.5 s).
- **Game text spreadsheet:** `docs/game-texts.xlsx` has 6,523 rows, 466 of them keyed. Edit the New text column and send it back; `tools/text/import_texts.py` applies it. The forfeit text is changed as you asked.
- **Card placement proposal** (nothing moved): `docs/card-placement-proposal-2026-10-15.md` and `.xlsx`.

## 2026-10-15 (fifth list)
- **Exposed:** Expose N makes the target Exposed for its next N hits: +1 damage from each, and attacks at it can't miss. A red 🎯N badge, a log line, the crosshair look on every Exposed hit.
- **New skill Bloodlust N** (on no card yet): when its attack draws blood (hits a Bleeding enemy, or makes it Bleed), +N Attack for the fight, up to +3N. A red heartbeat pulse.
- **Pounce** hits one random enemy, as it always did; it now leaps at that unit instead of drawing a column of ghost cards up the board (that column read as a line of damage; Windy had nothing to do with it).
- **Time-givers, plain and advanced:** Diurnal / Nocturnal / Tide / Full Moon keep their simple bonus; the advanced forms list what they get instead: "Diurnal – {Evasive, Thorns 1}", "Tide – {+5/+5, Evasive}, {Armor 2}" (Flood, Ebb; both at High Tide), "Full Moon – {…}". New plain **Full Moon N** (+N/+N for good once a full moon rises over it). All editable in the card editor.
- **Flow is called Flood** everywhere players read it (pills, tooltips, the log, card text).
- **Swimmer retired:** the 33 Swimmer cards carry plain Tide now; Swimmer is gone from the editor and the lists (the engine still runs it).
- **Board pills say only the state,** inside the board: ☀️/🌙 X/3 (the moon's phase is the Night icon when a card cares), 💨 with its ⬆/⬇, 🌊 Flood / Ebb / 🌊🌊. No "next round" pill. Map 0 has a Mist pill that says "?"; later misty maps add a Mist card: "There is no day/night cycle." (and "The Moon is not visible." where the moon matters).
- **The ambush (surprise challenge):** clicking the skirmish pops a quick "Ambush!" window, then the fight starts at once. Lose it and the raiders run off with 10 to 15 Maple Leaves on Map 0, the cap rising 5 a map to 100.
- **The middle slot** shows again when your row has no units. **No "🔁 Spawn" corner pill** on tokens. **No "a rule of this battlefield"** line on Environment cards.

## 2026-10-15 (skill reveal)
- **Skills you learn later show as "?":** Diurnal, Nocturnal and Crepuscular stay "?" until you enter Map 1; Tide and Swimmer until Map 2. The "?" sits on the card's skill strip and in its text ("Something about this card you'll learn soon."); the Skills codex, coach tips, teaching cards, phase and tide pills and battle-log lines don't name them either. The skill still works in fights, a reveal is remembered, and Admin Mode shows everything. The list is one small table (`SKILL_REVEAL`), so more skills can be added.
- **Map 0 is misty:** no day and night (so no nightfall, howl or night sounds there). Its Mist shows "?" ("Something hangs in the air here. You'll learn more soon.") and Map 0 never marks a field effect as learned; learning by seeing starts on Map 1.
- **Evade → Evasive** (the Swimmer pick's label).
- **Hive Mind retired** from the card editor, the Effects library, the reference and the Test Kit (the engine still runs it).
- **Fish carry Tide:** Blind Cave Fish, Mangrove Mudskipper and Wrong-Way Salmon.
## 2026-10-15 (11:45)
- **Fork, Trident and Pitchfork now work alike:** each hits the 2 / 3 / 4 nearest enemy units no more than 1 / 1 / 2 columns away. With no enemy unit that near, it attacks straight ahead as normal. Fork no longer skips the unit in front or sends an empty side to the castle. 14 cards have Fork, 1 has Pitchfork, none has Trident.
- **Crab Claws is back:** each swing pinches a random enemy unit to its left or right (straight ahead if neither has one). No card has it yet; the crabs still Fork.
- **New skills, on no card yet:** Ice Arrow, Twin Shot and Volley; the Bolts (Fire, Acid, Poison, Ice and Shock Bolt: a spit at the enemy opposite every round); and Chilli N (when first Ready: +N Attack and fire attacks, but 1 damage to itself every round). Each has its own effect in fights, the 🔬 Effects library and the Effects Lab.
- **One-off skills:** skills that belong to one animal (Coffee, Chilli, Banana, Durian, Rabid, Meteor...) carry a small "one-off" tag in the card editor and the Skills codex.

## 2026-10-15 (09:00)
- **Master hub:**
  - It opens on a dashboard: Your calls and Planned first, then the latest changes, stat tiles and links.
  - New **🎴 Cards** tab with every card's art, filters and details: stats, skills, source, win rate and which decks use it.
  - **Search** across the whole hub (press /).
  - The changelog is collapsible, tabs sit in a sidebar, there's a theme toggle, and nothing is cut off on phones.
- **29 new skill effects:** Flying swoop, tide splash, armour block, fork prongs, pierce, stun stars, freeze, sleep, paralyse, acid, ink blind, fear, curse, mark, clock tick, parry, mirror, crown crack, stealth, scar, life drain, pollen, aura, rage, revive, summon portal, Lumber arc and prayer light.
  - Skills with their own effect: 61 → 105 (of 182). Weighted by cards, 437 → 633.
  - They show in fights, in the in-game 🔬 Effects library and in the hub's Effects Lab ("Even more skills"). The full list is in the effects catalogue.
- **Difficulty with the new starter deck:** Map 0 win rates dropped. 0-1 is 52% (was 67%), 0-2 60% (70%), 0-3 5% (12%) and the 0-4 boss 7% (17%).

## 2026-10-15 (05:30)
- **Fight ids match what you see:** Thistlewood's f-1 is now 1-1, the first map's fights are 0-1…0-4, side maps read like 1-A-1, and so on (226 fights, 36 maps, plus the endless dungeon). Old saves, map layouts and published skirmish edits are translated when they load; nothing in the database was rewritten.
- **Tutorial and early maps:**
  - No more Start screen.
  - Part I shows an 8-card deck plus its 1 reward. Part II adds the leader and 2 rewards, for a 20-card deck. 9 baby cards (1/2) fill the 17-card base behind the scenes.
  - **0-1** gives one card, which you're asked to swap in. **0-2** gives your faction pack, shown in its First Clear box. The **Camp (Armoury)** opens once both are cleared, at 0-3, and any pack held until then opens at that point.
  - Instruction tips say "Okay" instead of "Skip".
  - Cards flying into your deck now pass over the label.
  - Only the one highlighted card glows gold.
- **Packs:** the results screen shows "🎁 Pack won!" with the pack art. Leaving it, the pack floats up into the opener. Several packs show as a pile you open one by one, and the pile shrinks as you go. The Nest button stays hidden until the Nest is unlocked.
- **Swaps:** after the first one, you're offered up to 10 swaps in total, only when a new card strictly beats one in your deck. Clicking Swap shows "Nice!" and the window closes faster.
- **Deck editor:** click adds a copy; Shift-click (or right-click, or the small "−") removes one.
- **Skirmish preview:**
  - The First Clear box is shorter and sits at the right, with "First Clear" on its border. Claimed rewards aren't greyed out.
  - The title has room under the Fight again pill.
  - The panel fits its contents.
- **Fight:**
  - The battle waits for a summon (your leader too) to finish before the first attack.
  - **Deaths playing before the attack that caused them:** 0.5× speed was applied twice, so lunges ran 4× slower than the damage numbers. Tokens that spawned and died in the same round were never drawn. Both are fixed.
  - Speed: Shift-click or a long press goes slower, and 0.5× is in the cycle even in Admin Mode.
  - Stone (and Metal/Uranium) costs sit top-left with Lumber.
  - Electricity is 🔌.
- **Tide:**
  - Playing a Tide or Swimmer card no longer brings the tide. Only field effects (Perma-tide, Tide-spout, High Tide), Moonpull and Tsunami do.
  - Swimmer reads "🏊 Swimmer – On Tide, …" again.
- **Darkness:**
  - Night alone no longer makes units miss. Misses come from the field effects **Darkness** (1 in 4) and **Pitch Black** (1 in 2).
  - Smugglers' Grotto is Pitch Black. Caves & Alcoves, Mycelium Deep and Sunken Depths are Darkness.
  - Night-blind units still miss 1 in 2 at night.
- **Field pills and dialogue:**
  - Field pills sit at the left and show just an emoji and count, such as "☀️ 2/3". Details appear on hover.
  - The Night/Day tip reads "Night and Day alternate every 3 days…".
  - NPC lines come 1 s apart and stay up to 8 s; click to move on.
  - The dialogue panel sits further left on the map. Interactibles open it expanded.
- **Map 0** shows its field effects plainly; the "?" starts on Map 1. Misty now says "Mist hides the sun and moon: Diurnal and Nocturnal bonuses never apply."
- **Admin:**
  - New **🃏 Showcase cards** panel: one map at a time, pick each skirmish's showcase with one click.
  - "Check the whole map" runs 30 fights per skirmish without freezing the page, and a re-check takes 67 ms when nothing changed.

## 2026-10-15 (03:15)
- **Starting levels:** faction cards and the Wandering Traveller now start at Level 1, and their printed stats are their Level 1 stats.
- **Card editor budget line:** one score, **Budget: Max(A, B) against N**. A is Attack × Health + Skills and B is 2×Attack + Health + Skills.
  - The colours are green at or under N, red over N, and pink when well under N (60% of N or less).
  - Level is fixed at 1, so the Level picker is gone, and the Map picker is smaller.
  - The Test Lab's ⚖️ Stat budget page and its Fit button use the same rule. The old rule had two checks: the added score under N + 2 and the multiplied score under N.

## 2026-10-15 (02:45)
- **Regeneration:** the green zig-zag at the end is gone; the spiralling motes and the soft glow stay. A unit at full health no longer regenerates at all. Before, a bleeding unit at full health still "regenerated" to stop its Bleed.
- **Castle crumble:** the enemy Bramble now crumbles completely before the Victory sign and results. The hit-stop on the killing blow could slow the crumble so much that a safety timer let the results through halfway. It now always plays at normal speed and pauses a beat afterwards.

## 2026-10-15 (02:00)
- **Missing card pictures fixed:** Bee Drone, Bee Knight and Forager Ant lost their pictures because about 50 published admin edits from 10-12 had saved each card's own image file path. The WebP change renamed three of those files. The game now ignores a saved path that just points at the card's own built image and shows the current art. This also lets later art changes show on those 50 cards.
- **Art:** Bee Drone (your NightCafe image), Bee Knight (bee set, bottom left), Sandstorm Roc (bottom right), Otter Kit (top-left otter), Barrow Leech (bottom-right bat). Kraken Spawnling moved to the dark kraken (top right) so the Colossal Squid can have the top-left one. The sparrow on Shrine Bell-Ringer was already the top-right one.
- **New cards (not placed on maps, budget v2):** Colossal Squid (4 Lumber, Wait 3, 4/10, Fork, Gash 3, Tide), Lantern Spark Fly (2/5, Flying, Lantern), Baby Bat (1/5, Flying, Nocturnal), Baby Horned Capybara (2/6, Thorns 1).
- **Your 21:49 images:** Scraper of Skies has the new hive-tree art. The new **Red Dragon Egg** (Legendary, Wait 12, 0/10, not obtainable yet) cracks open into the Red Dragon when Ready. It's the first egg that hatches into one set card rather than a random one.
- **Deck previews** show the castle's art instead of the 🏰 icon.
- **Rarity lesson** now says cards run from Common up to Epic, without naming each, and calls a Very Rare or Super Rare card Rare.
- **Fight and field:**
  - Tide wording: pills say only what Tide units get, and in a fight the Tide chip turns blue and says the current bonus. Wash is removed (it only ever worked on Flow), so 6 cards lose it.
  - Each field effect is its own ENVIRONMENT card with a mossy frame. The High Tide card reads "Periodic High Tides" and the Tide-spout card "A spout pushes a column back".
  - Home ground is gone.
  - Push-back now has an animation: the card slides back with "⏪ +1 Wait".
  - Volcanic ground damage is renamed "Scorched Ground", and its damage numbers now stay on screen.
  - After an Eruption, comets fall for 3 rounds (2–5 each, halved for fire-resistant units).
  - The heat haze is fixed. New 0.5× speed. Forfeit asks in the centre over a dimmed backdrop.
  - The Lumber lesson only shows when you hold a Lumber card you can't afford yet.
  - Cleared dark maps are brighter. Only the map zooms into a sub-map, and the new map grows in.
- **Pages:**
  - Auto-sweep naming.
  - One loss rank on the Defeat screen, counting Armour damage, with the extra pill removed and the tip box background fixed.
  - Pick a skirmish's showcase card in the editor.
  - Wyrmslayer, To the Caldera and Eye of the Volcano now need a real win.
  - Field kit wording says "skirmish".
  - Inventory hides items you never had, marks new ones New!, and greys used-up ones. Wider tab margins.
  - **Packs open at once:** cards are credited when the pack is given, and old unopened packs open on load.
  - **Cobble, the Forge golem**, explains the Forge and says why something can't be done.

## 2026-10-15 (01:00)
- **Faster loading:** large card art is now shipped as WebP (same look). The game's image files dropped from 32 MB to 11 MB, so a Codex page of 50 cards loads about a third as much. The source art stays PNG.

## 2026-10-15 (00:15)
- **Card plan workbook:**
  - The 23 cards made today are now on the Plan sheet, each with a suggested home and its budget v2 check. Five come out over budget at their suggested map: Vampire Bat, Wandering Mage, Arc Bat, Hammerhead Shark and Ironback Gorilla, mostly on the Attack × Health check. The fitted stats are noted; no card was changed.
  - A new **Wild Veggies** sheet has 12 plant-card proposals for Maps 20+ (rooted ones like Venus Snaptrap and Durian Duke; walking ones like Turnip Brawler, Pumpkin Knight and Mandrake Screamer), built from existing skills. Tick the ones you want.

## 2026-10-14 (23:30)
- **Fights:**
  - Day/Night, Flow/Ebb, wind and the forecast are now pills on the board's middle line, and each one explains itself on hover or tap.
  - The terrain and lasting field rules ("Open Meadow I", Frigid, the volcano…) show as a field card beside the enemy's deck.
  - The opponent's Lumber is top right.
  - Leaders now drop in with a flash, a ring shockwave and a "👑 <Leader> joins the fight!" callout (and a shake for big ones).
- **Side maps** that aren't dark just zoom into the entrance and back out of the new map; caves keep the dark dive.
- **Stat budget v2:** N = 10 + 5 per Wait + 4 per Lumber + 0.2 per map + level (Level 1 to its top level adds up to +10) + rarity (+2 a step, Mythic +20). A half-miss skill (Evasive, Swift, Flying, Shadow, Blind) multiplies the score ×1.5, and Bounty costs 0. It's in the Test Lab, the card editor and the Skill N sheet.
- **New skills:**
  - 🤺 **Fencing:** Evasive and Swift can't dodge it; Frillneck Duelist has it instead of Bludgeon.
  - **Fireball** (on Ready, 15 fire to a random enemy and the units either side) and ☄️ **Meteor** (on Ready, 20 that ignores Armor, splash to the units beside it, and the column burns).
  - 🍌 **Banana** (Bramblewood Macaque) and 🍌🪃 **Bananarang** (Howler Monkey).
  - **Durian** (War Drum Mandrill): may gain Thorns each round.
  - 💠 **Shield:** temporary Health, and a Shield trigger action.
  - 🔌⚡ **Electricity:** arcs to the next unit, stronger on wet ones. On Voltaic Eel and three new cave bats: Voltwing, Static and Arc Bat.
  - 👃 **Keen Sense:** moles ignore darkness and Blind.
  - 💭 **Psychic N:** extra damage that nothing blocks; minds only.
  - **Smoke Bomb:** each round, maybe smoke an ally (attacks miss it half the time) or blind an enemy. It's on the new Smokescreen Raccoon.
  - Banana, Bananarang, Boomerang and Smoke Bomb are Evergreen.
- **Crabs Fork again**, shown with a crab claw 🦞. Crab Claws is retired.
- **On Death → the killer** as a trigger target: the new **Blister Beetle** poisons whoever eats it (5 Poison).
- **New cards** (not placed yet): Hammerhead Shark, Ironback Gorilla (Bludgeon), Voltwing / Static / Arc Bat, Smokescreen Raccoon, Blister Beetle.
- **Limit break** now needs lifetime duplicates by rarity, shown as a pill board with holes:
  - 10 for Common, 9 for Uncommon;
  - 8 for Rare up to Super Rare;
  - 7 for Heroic and Epic, 6 for Unique;
  - 5 for Quest-Unique up to Mythic, 4 for Ancient;
  - 3 for Divine and above.
- **Rarity lesson:** once, in the Codex, after 50 different cards and your first Very Rare.
- **Crafting** needs a card you've held, not just seen.
- **Codex: 🔢 All by ID** toggle shows one unsectioned list of every card by card number, 50 a page; it's remembered.
- **Art:**
  - Your images for Rootworm Colony (purple lichen), Bee Drone, Rivergate Tribune and Bramblewood Macaque.
  - The electric bats.
  - New NightCafe art for the new cards and all seven eggs.
  - The 193 cards from the earlier NightCafe batch now use their raw originals (no extra pixel pass), which keeps faces sharper.
  - Every card now has art.

## 2026-10-14 (21:00)
- **🔬 Effects library** (Admin → Effects library): every skill, trigger event, trigger action and field condition (254 in all) on a live stage. ▶ Play runs it through the real fight engine with its effects and sounds, ↻ Reset sets it up again, 0.5× slows it down, and a log shows each event and the damage it did. Field conditions show their look too (the Tide coming in and floating the swimmers, rain, fog, night, the volcano). A few things that need a bigger setup (leaders, Structures, Dark Summon) say so instead.

## 2026-10-14 (20:00)
- **New skills:**
  - 🦞 **Crab Claws** (hits left or right only; on Sulfur Vent Crab and Open-Ocean Hermit Crab).
  - **Sacrifice - {}** (a trigger when the card is sacrificed; in hand it shows a set of dark teeth across the art).
  - ⏲️ **Charge N - {}** (a yellow clock top-right starts when the unit is Ready; at 0 the effect fires and it starts again).
  - 🧫 **Meiosis N** (splits into two halves on death).
  - 🚫 **Nullify** (its hits get no reaction; what it kills goes to the Removal Zone).
  - 👣 **Restless** (moves every round; on no card).
- **Freeze is a clock now:** freezing adds icy counters shown on the Wait clock with snowflakes; each upkeep melts one instead of ticking Wait, same total delay. Stunned units have circling stars.
- **Evergreens:** 🌪️ **Tornado**, 🏔️ **Avalanche**, 🌊 **Tsunami**, all on arrival with a board-wide sweep. **Dragonic Spire** skills: 🐉⚡ **Dragon Lightning** (red bolts that ignore Armor) and 💀 **Wither** (max Health falls for 3 rounds, no healing). The Dragonic Spire map itself is listed for later.
- **Eggs are cards:** seven egg cards (Woodland Egg, Speckled Egg, River Bundle, Leathery Egg, Cocoon, Roe Pearl, Den Bundle). On the board they hatch into a random card of their kind when Ready. You get one the first time you set that egg in your Nest.
- **Esprit** now counts spawned units too, and only allies that share a type.
- **Screen shake** for big arrivals (over 20 Health, growing to 200) and big hits (over 15, growing to 100).
- **Fights:**
  - The sun and moon are gone; the field shifts colour temperature through the day (warm day, amber dusk, cool blue night).
  - New **Misty** condition: no day or night, and the fog drifts from orange to blue and back.
  - The deck pile is tighter and sits in line with the hand, and the gap to the board is smaller.
  - Phones get an icon-only top row and compact skill chips.
  - The Lumber lesson never asks you to pitch the card that needs the Lumber.
- **Pages:**
  - The Codex pager is now at the top as well.
  - The Nest and Forge put costs inside their buttons.
  - The Nest hides costs until you tap a card, greys out cards you can't afford ("Need 3 more Kibble"), and Kibble rises with each card of that species you train.
  - Deck cards show pictures, rating, total Attack and Health (and the count only when it isn't 20).
  - The Forge text has better contrast, and the swap offer is a proper sheet on phones.
  - The "Claim it on the Achievements board" line is gone.
- **Sheets:** a "Skill N values" sheet for you to set each skill's budget weight (tools/cardplan/import_skill_n.py brings your numbers into the game), and a "Factions & regions" sheet with the key skills per faction and region plus three subfactions: the Ashen Covenant (cultists), the Great Herd (savannah giants) and the Mycelium Choir.
- **Card editor:** shows the card's budget score against N for its map, level and rarity.
- **Art (NightCafe, 23 images):**
  - New: Big Bee, Frog, Fly, Gale Sprite (now a wind swallow), Guardian Shield (a golden pangolin), Growth Sprout, Insect Swarmling, Maggot, Malachite Golem (a blind crystal beetle), Mirrorhide Mutant, Nest Hatchling, Trojan Raider and Rabid Jackal.
  - Redone: Quarry Troll (a stone donkey), Webspire Sentinel, Yeti, Glass Golem (a glass armadillo), the Puddle Changeling at its reflection, and Rootworm Colony (lichen).
  - For the new cards: Rafflesia, Puffball Bombardier, Otter Angler and Honeyjoe Brewer.
- **Cards:**
  - Renamed: Big Bee, Frog, Fly.
  - MissingNo moved past World 1, and can't be obtained for now.
  - New, not placed: Rafflesia, Puffball Bombardier, Otter Angler and Honeyjoe Brewer.

## 2026-10-14 (17:30)
- **Caves and the deep have no day or night** (Caves & Alcoves, Smugglers' Grotto, The Sunken Depths had been left on Night, with a moon showing in a cave). Sable Swampmire and Pinewood Taiga stay always-night.
- **Lantern light in the dark:** in pitch-black and absolute-dark fights the field is shadowed except a warm pool of light that follows your pointer (it drifts by itself on touch). The cards don't move.
- **Difficulty re-measured** after today's rules (Speed, Tide = Swimmers, day/night by map and the rest): a mid-strength deck now wins 90–99% on Maps 1–9. The spikes are the Map 10 boss (35%), Map 14 boss (43%) and Map 16 boss (8%). The numbers are in the ⚖️ Balance tab.

## 2026-10-14 (16:15)
- **Bloom (conditions): +2/+2** while its conditions hold, e.g. "Bloom (Tide & Night)" or "Bloom (Wind or Wet)". For the plant cards to come; the old heal Bloom is unchanged. Units in bloom show 🌸.
- **Irradiation sounds:** a sizzle as stats burn away, Geiger-counter clicks when radiation is handed out.
- **〰️ Wave:** a hit pushes the target one column left or right (swapping if someone's there). On Dolphin Knight, Reef Manta Glider, Moray Ambusher and Tide Pool Crab.
- **Perma-tide** on the river maps (Sunken Hollow and Lilypad Reach): the Tide is always in, and tide effects can't change it. Shown in the Map Codex.
- **Blue Dragon: Supreme Tide** (double Tide bonuses, every round).
- **🥚 Brood N:** swarms hatch 1/1 brood that count for Swarm (Bee Drone, Carrion Fly Swarm, Swarm Matriarch).
- **Pack, reworked:** Pack units of the same type in an unbroken line each get +2/+2 per member (two: +4/+4, three: +6/+6). A **Pack Leader** links every same-type Pack unit on its side, adjacent or not, and adds its own +2/+2 plus +2/+2 for the shared type; a two-type leader leads two packs. Irradiation strips Pack 2 at a time. The AI places Pack cards next to their pack.
- **New art** for Owl Fletcher, Owl Nightwatch and Bee Drone, as real animals, made with NightCafe's Flux 2 Klein model in a 16-bit pixel style (no extra pixel pass, so faces stay sharp).

## 2026-10-14 (14:30)
- **Energy starts at 20 again.** The Camp raises it cheaply to 50 (+5 a step, 40 to 240 Maple Leaves); the Forge takes it from 50 to 60 (+2 a step). Anyone who already had 50 keeps it.
- **Swimmers are Tide units** (they gain Flow and Ebb) and float on the board. **Moonpull** on Moon Jelly brings the Tide in at once. Pebble Beach has a **Tide-spout**: a water geyser in one column each round starts the Tide, pushes those units back and soaks non-swimmers.
- **Day and night come from the map**, not from cards: outdoor maps cycle; caves, the undersea and dark places have none. Daylight is warmer with a sun and rays; night has a clear moon and stars.
- **Irradiation tokens:** each round every ☢️ token takes a point from Health, Attack or a skill (skills weaken, then vanish), then the tokens drop by 1. Card details show the change in colour.
- **Ghost** takes half from elemental attacks (only magic is full); new **Shade** and **Shadow**. **Supreme** beasts (the five dragons, still hidden) hit with magic, ignore Armor and Ward, and halve non-magic damage.
- **Twin** (Puddle Changeling, new Mirrorhide Mutant) and **Growth Sprout** tokens (1/3, count for Swarm) with **Sprout N**.
- **Your art is in:** Sunspire Envoy (the bottom-right bird), Tide Pool Crab, Cave Bat Swarm, Upside-Down Bat and Bat Swarmling. New cards: **Shallows Fry** (the green-water fish), **Vampire Bat** (3/4, drinks what it deals) and **Wandering Mage** (the wizard cat, a free leader for Map 51).
- Late-game plan written up: docs/design-2026-10-14-late-game.md.

## 2026-10-14 (12:45)
- **Volcano hazards with odds:** Lava Tide (lava floods a column), Petrification (a unit turns to stone for a round) and Eruption each roll every round from round 2. A fight's volcano level sets the odds: Very low 1/2/3%, Low 10/12/14%, Medium 20/22/24%, 1 in 2 45/50/55% (rising each round), High 60/65/70%. The fight conditions show the band word, not the number. Old fights with a fixed eruption are unchanged.
- **New skills for the maps after Map 20:** 🐇 Speed (the fastest units swing first; ties keep today's order), 🏃 Haste (+2 Speed, neighbours +1), 🤬 Rabid (hits poison 2; double damage from water), 🫣 Cower (hit last round: it hides in its shell, or flees), 👻 Ghost (normal attacks pass through; magic, fire, poison and acid still hurt), 🪄 Magic attacks (a blue wand on the card instead of the sword), 🧪 Ichor (attackers take acid, lose 1 Armor and bleed, even Ghosts), ☢️ Irradiated (withers itself and the units around it: lost max Health and Attack).
- New card: Rabid Jackal (2/3, Rabid), not placed on a map yet.
- **Name picker** (docs/name-picker-2026-10-14.xlsx): every candidate name for Base (15), Otters (15), Hummingbirds (15) and 6 per biome, with my ★ suggestions and a ✓ column that counts your picks.

## 2026-10-14 (11:30)
- **The new foils can drop from packs:** Aurora, Galaxy swirl, Molten gold, Frost crystal, Oil slick, Sakura, Glitter field, Holo scanlines and Cards of old are now rare prints in every pack's foil roll (each about 2–3% of foils), and each adds to a card's collection bonus. Admins can tune the odds in the pack editor.
- **Frozen units shatter:** a unit that dies to cold breaks into ice-glass shards (the Lab's shatter).
- **Pack hauls ripple:** a wave runs across the cards when the pack summary is laid out.

## 2026-10-14 (10:45)
- **Leader tutorial:** the first time you open the 👑 leader picker, the traveller explains that only Heroic and above can lead. Your first Heroic card brings it back ("this one can be your leader"), and the card itself speaks; if you skipped the first note, its line comes first.
- **D39:** 🍴 Pitchfork hits the 4 nearest enemy units within 2 columns (no Pierce). 🔱 Trident hits the 3 nearest within 1 column, never the castle.
- **Castles crack and crumble procedurally:** random-walk "miners" chisel cracks as Health drops, and a cellular automaton eats the castle along them when it falls, with rubble chips.
- **"Cards of old" finish** (aged paper, foxing, creases) for admins in the inspector and workbench, and a new Effects Lab tab, Procedural FX: shatter, Flip riffle shuffle, lantern light, a scrubbable forge timeline, a ripple wave.
- **💬 Dialogues:** every conversation, its speakers and where it plays, as a hub tab and a spreadsheet with an "Add your own" sheet. Any card's name works as a speaker and shows that card's art.
- The hub's Action items now open with your calls and the planned ideas.

## 2026-10-14 (10:15)
- **Eight new foils are in the game:** Aurora, Galaxy swirl, Molten gold (with drips), Frost crystal, Oil slick, Sakura (falling petals), Glitter field and Holo scanlines. Admins can try them in the card inspector and the Card workbench; none is handed out by packs yet.
- **Level-up burst:** tempering a card in the Forge, or training a hatchling to Level 1 in the Nest, now plays the Lab's level-up rays and "LEVEL N!" ribbon on the card.

## 2026-10-14 (09:30)
- **The Effects Lab's skill effects play in real fights** (Medium effects and up, at most once per unit a round): Regeneration knits a unit back, Poison and Bleed ticks show a cloud and a drip, Thorns bite back at the attacker, Helmet deflects with a ping, Earthquake cracks the field, Frost and heat show on chilled and scorched units, Swarm, Cleave and Quick attacks get their own strikes, Evasive and Swift units sidestep, and Lantern, Darksight and Guardian units glow, scan or raise a shield wall when played.
- Your new ideas (Electricity, Keen Sense, the Hammerhead, a sledgehammer bruiser, stat budget v2) are written up in the action items, not built yet.

## 2026-10-14 (03:30)
- **Card plan workbook** (docs/bramblewood-card-plan-2026-10-14.xlsx): every card sorted into Base, the two factions, the tutorial, Maps 0–21 (4 uniques each), fodder for the Ocean, Swamp, Ice, Volcano and Cave, the Mystery pack (Map 20's side map), Later worlds (the occult and alien cards) and Retired; plus a skill curriculum (Map 0: Flying, Swarm, Regeneration; Map 1: Diurnal, Thorns, Worthy …), animal-type counts (3–6 each, 4 Elementals, no trolls, 1 changeling) and the Card Pack seller at Maps 5, 11 and 17. Extra ordinary animals are listed as Spare, not placed.
- **18 new cards, with art:** Bramble Hoglet, Clover Butterfly, The Gannet Queen, Old Snapjaw, Alpine Marmot, Meerkat Burrower, Moon Jelly, Lion's Mane Jelly, Caiman Hatchling, Mudpuppy, Harbor Seal, Snow Ermine, Ember Centipede, Cinder Gecko, Ash Moth, Cave Olm, Glimmer Spider, Field Crow. They have no source yet, for you to place.
- **New art:** Bee Knight, the Puddle Changeling (looking at its reflection in the river) and the Two-Headed Calf (one body, two heads).
- **Sharper NightCafe art:** the blur came from our own pixel step, not NightCafe. All 185 NightCafe card portraits are redone from their originals on a finer grid (96 px, 48 colours), so eyes and outlines survive; five lost their drawn frames.
- **Effects Lab:** 16 new skill effects (Swarm, Regeneration, Poison cloud, Bleed, Thorns, Earthquake, Quick, Evasive, Cleave, Guardian, Dynamite, Helmet, Darksight, Frostbite, Scorch, Lantern), 8 new foils (Aurora, Galaxy, Molten gold, Frost, Oil slick, Sakura, Sparkle, Scanline) and 5 general effects (shockwave, three castle crumbles, level up, unlock sparkle, sky drop).
- **Action items cleared:** D27, D39, D74 (built), D75, D76, D77, D78 closed; only the live-database items wait for "apply it".

## 2026-10-14 (02:00)
- **Skill Codex (Map 9)** and **Map Codex (Map 11)**: two new Codex pages. Skills lists every skill you've met, what it does and what answers it ("Answered by" moved here from the card view). Maps lists every map you've reached with the field effects you've learned there (? until seen).
- **Card view:** no repeated name or stat tiles (the card shows them); its type is the species with its family's icon; a card that brings another card shows that card and its abilities on the right.
- **Card editor:** Species picks from every species in the game with its icon, and a new one becomes its own family. Each skill row has a ＋ that adds the same skill at a later level (with a Lv picker); those level skills switch on as the card levels up.
- **Saving a card's placement** sticks now: the card editor no longer puts the old source back when you save it afterwards.
- **Cards edited in the cloud before their art existed** show their art again (Shepherd, Owl Nightwatch, Tomcat, Sergeant Bramblefox).
- **Tutorial castle health** is set beside its Castle in the skirmish editor (the castle choice now applies to the tutorials too).
- **Deck editors:** click adds a card, Shift+click takes one out (the skirmish editor's deck and its popup).
- **Classic cards removed** (Otter Centurion and Bee Knight classics).
- **Map 0:** 0-1's castle is plain; the field effect starts at 0-3 (level I) and is level II at 0-4; 0-4 teaches the castle's Shield.
- **Boomerang:** it hits and flies on far past its target; against a castle it bounces off and out the top of the map; next round it drops back in from the top, hits, and spins home.
- **Skirmish card:** a revealed deck is a strip of the real cards with counts, each opening its details.
- **Codex:** the Factions pool comes first; the skill badges under each card are no longer cut off; Full Art view is 5% wider.
- **Armoury renamed Camp.**
- **First visit to a map:** the skirmishes now fall from the sky after the map's name card lifts, each with a landing shadow.
- **Ranked Live plays Standard** (every card at Level 1), closing D74.
- Swarm: I couldn't make it count itself (a lone Swarm unit gets +0 in the engine and on screen); a screenshot of the case would help.

## 2026-10-14 (01:30)
- **Map 21: The Quiet Summit.** Above the clouds after the Sundered Peak's storm: six fights among goats, rams, yaks, owls and eagles, ending at the Cathedral Eagle. Its own snowy map, with the zoom-out on your first visit. The Test Lab sits here as planned.
- **Stomping Grounds (Map 21, after its third fight):** your Hero is trained here now, on its own page; the Armoury no longer has a Hero button.
- **The Tutorial side map.** T-0 and T-1 live in their own side map, Tutorial, entered from the left edge of Map 0; new players start there and Map 0 opens when T-1 is won. Three new fights follow for later: **T-2 The Odd Lot** (a deck of odd cards, pays a Hedgerow Pouch on the first win), **T-3 Ranks and Challenges** (teaches that tougher fights pay more and that the less your Castle loses the higher your rank, with some cards only at S) and **T-4 The Final Exam** (an elite). Their decks are placeholders for you.
- **Page row:** on every page off the map, a row of shortcuts to your other places (Armoury, Stomping Grounds, Codex, Forge, Nest, Inventory, whichever are open) and a round ↩ on the right. The Armoury's Hero and Codex buttons are gone.
- **↑ / ↓** on the map go to the next or previous map.
- **Fight | Sweep** is one pill split down the middle; Sweep asks how many runs (and holds the Idle-Sweep switch).
- **Skirmish card:** the reward box's contents are centred.
- **The Arena opens on Map 11** and **the Quest Board on Map 8** (Caves & Alcoves).
- **The Sunken Depths** (was the Sunken Ferry): its entrance is a wreck with an anchor.
- **The Glimmer Depths** gem shines once the map is cleared, and a campfire burns at its top left, its glow flickering and sparks rising.
- **Field conditions:** an unseen one shows its (?) beside its name. "Used to the cold" is gone; the units that ignore frost are named in the Frost line.
- The Armoury always shows decks at Medium (the Large/Medium switch is gone); the conversation's hide arrow moved a little right.

## 2026-10-14 (00:40)
- **Map critters and your pawn face where they're going:** moving right, they look right; moving left, they look left.
- **Art:** portraits for the seven road folk who talk to you (Brother Ripple, Pip, Old Heron Wade, Bramble, Sister Carapace, Croaker, Thimble), all 13 raid bosses and the Goliath (shown in the raid panels and the VS screen), and a map for The Sunken Ferry.
- **Stat budget:** base N is 8, plus 0.1 per map number (Map 30: +3). Still a report only; no card stats were changed.

## 2026-10-14 (00:15)
- **Your deck has thickness:** the pile grows up and to the left as it fills (one edge per two cards) and thins as you draw. An empty deck says "Deck / Empty".
- **Map interactibles lose their circles:** curiosities, the wanderer and the "?" spots are now bare icons, so they blend into the map.
- **Skirmish card:** the first-clear box is only as wide as what's in it, the New skills strip is off (Admin can switch it back on), the locked deck is a shorter slab with the rank right beside the lock, and the card is tall enough to show it all.
- **Admin on the map:** the skirmish card's admin buttons sit outside it on the right; the map toolbar says Layout, Links, ➕ Skirmishes, ✅ Clear map and ↩ Unclear map. Clearing a map by hand now also hands you its skirmishes' card rewards.
- **Codex shows only cards you've seen**, admins included (tick 👁 Show unseen to see the rest). No more Hidden/Discovered pills. 50 cards a page, or whole sources until 50 is passed, with page buttons, so it's quick again. Admins get 🎁 Get all on every section (a season, a pack, a skirmish).
- **Admin resets in Profile:** Reset all (a fresh player, your edits kept), Reset Codex (forget every card seen) and Reset to Map N (every map before N cleared with its card rewards, their features open, you standing on Map N). Each asks for a second tap.
- **Season names:** 🍂 First season, 🌸 Second, ❄️ Third, ☀️ Fourth.
- **Side-map exits:** an open-air side map's way out is the main map's own icon; a cave's mouth has a flickering lamp hanging over it.
- **⚖️ Stat budget (Test Lab):** your formula, 2×Attack + Health + Skills < N + 2 and Attack × Health + Skills < N, with N from rarity and level (Level 0: −2). Base N, the per-skill costs, a per-Lumber bonus and "both rules" or "either rule" are editable. It lists cards over budget with the stats that would fit, and Fit applies them as card edits.
- The conversation panel's hide arrow sits a little further left.

## 2026-10-13 (23:30)
- **The tutorials are skirmishes T-0 and T-1** on Map 0, joined by a trail, with no "!" on them. Part 2's button says Fight, not Fight again.
- **Tutorial Complete!** Part 1 lists only "Tutorial Part 2" under Unlocked, part 2 only "Conquest Map"; part 2 has one button, Claim Rewards (no Next fight, no Finish).
- **First visit to a map:** it opens zoomed in on where you start, pulls back to the whole map, then its skirmishes drop into place one by one. Map 0 does this once Tutorial II is won; every later map (the bigger ones too) the first time you enter it.
- **"This is the enemy Castle" holds the round** until you press Next, so you don't miss the first fight. Any blocking tip now pauses the round.
- **Leader and Wait (Tutorial II):** when your leader lands, a tip explains its Wait and the round waits for OK; then a pointer stays on its Wait until it drops by 1. Initiative waits a turn after another tip, and on an iPad a tip on the whole field sits over it, not under it.
- **Lumber, shown not told.** The first card you get or draw that needs Lumber opens a small picture: the card, its 🪵 cost, and a spare card going to the Graveyard for +1 🪵. After that, a "🪵 Needs Lumber" tag pops on newly drawn Lumber cards for a few fights. The pitching tip now plays a ghost card being dragged from your hand to the Graveyard.
- **Shorter tutorial words** everywhere, the Traveller and the side guides included.
- **Deck suggestions.** On Maps 0 and 1 the first wins each bring a card that teaches Flying, Swimmer or Diurnal, swapped in for the weakest card in your deck. Later, a clearly better card won anywhere is offered the same way (turn it down three times and it stops asking). The swap shows your deck sliding away, the weak card in focus and the new one taking its place. The Armoury opens on Map 0.
- **"Two more cards"** after Tutorial II is a small card over a darkened screen with one OK button.
- **Castle crumble:** an enemy castle knocked to 0 shakes, cracks and slumps into falling stones and dust before the result.
- **Back buttons:** every page off the map (Nest, Codex and Forge, Armoury, Inventory and the rest) opens with a big ← Back to where you came from.
- **iPad looks like the computer:** cards keep their computer proportions, and in portrait the whole hand row fits on one line.
- **Conversations:** a reminder that just played stays quiet for 3 minutes (it used to repeat), the 💬 chip counts conversations rather than lines, the panel no longer gets stuck see-through with dead buttons after a card drag, and the ▾ and 💬 fade out after 20 seconds untouched.
- **Fixes:** the NEW! tag on a first-seen enemy fades once instead of coming back; the post-fight New! cascade runs 35% faster; a yellow tip outline on a unit now draws above the castle bars.

## 2026-10-13 (22:45)
- **Murgle Mayhem (6-MM), the first endless dungeon.** A side map of Sable Swampmire (Map 6) that opens when its last fight is won. Fifty floors, 6-MM-1 to 6-MM-50, on one long trail you scroll up; the map starts at your next floor. Every floor is the same frog-and-leech fight, 4% stronger than the floor below, and every 10th floor is the Murgle King with an alligator and a crocodile. Each cleared floor stays cleared, so a loss never sends you back.

## 2026-10-13 (22:00)
- **Art for the two new cards:** the Helmeted Otter in its cooking-pot helmet and the Dynamite Packrat with its lit fuse (NightCafe, pixelized like the rest).
- **🎲 Random** on the side screen appears after 15 seconds.

## 2026-10-13 (21:30)
- **Dynamite N.** No Wait: the unit lands with a red 🧨 fuse that burns down one a round. At 0 it explodes for 5 damage to the cards beside it and the three enemy cards facing it (a 3×3 around it). If it dies first, nothing happens. New card: **Dynamite Packrat** (1/18, 1 Stone, Dynamite 3, Caves & Alcoves).
- **Helmet.** Half the time, an arrow, missile or single bolt aimed at it glances off. Its badge is a drawn helmet (the emoji set has none cute enough). New card: **Helmeted Otter** (2/8, Otter pack).
- **Signing out switches accounts.** Sign out (and Log out) now really end the session, and this device starts fresh for the next person; the account's progress stays in the cloud. Sound and effects settings stay.
- **Start the tutorial starts over.** The guides show again from part 1, and you pick your side again.

## 2026-10-13 (20:45)
- **Small cards read cleanly.** On small cards (phone hand, leader, Armoury strip) the skill badges hang just below the card instead of sitting on the Attack and Health numbers.

## 2026-10-13 (20:00)
- **Random instead of Both.** The side screen offers Otters, Hummingbirds or 🎲 Random, and hovering one shows a line of lore and a line of play.
- **The ambush.** Your first Fight on 3-2 is interrupted: a scout of the other side shoves your pawn aside, an Ambush skirmish bounces onto the map and the fight starts. Winning it pays a Faction Growth card.
- **Faction colours:** Otters red, Hummingbirds blue, neutral green.

## 2026-10-13 (19:00)
- **More UI audit fixes.** Skill badges on small cards no longer sit on the Attack and Health numbers. On phones the map's fullscreen button clears the Energy pill and toasts appear above the tab bar instead of over the HUD. The Shop drops its duplicate "Back home" button and title, and the Autobattler's header button reads "← Arena".

## 2026-10-13 (18:00)
- **Wildpaths wait for Map 21.** The Home note and the perks stay hidden until Map 20's last fight is won, and only maps from 21 on earn Path points.
- **UI audit fixes.**
  - Phone fights fit the screen: castle, deck and graveyard share a row, the leader and hand the next, and Pass turn floats bottom-right.
  - Quick Battle, PvP and other off-map fights get a map's ground instead of a flat grey board.
  - One card count everywhere (Home's Codex note, Profile).
  - The floating Play tab bar no longer covers the last Arena and Raid cards.
  - The Tavern note has its own spot on Home instead of sitting on the Play tile.
  - Readable Community title and Codex subtitle; Forge tabs scroll on phones; the Field kit heading no longer squeezes.
  - No more twin daily notices; the Test tab is called Test Lab.

## 2026-10-13 (17:15)
- **Zeitgebers.** In a fight that's day by default, the first Diurnal, Nocturnal or Crepuscular unit played starts the day/night cycle from that round (Day first), like the first Tide unit starts the tide. Maps whose designer set a phase keep it.
- **Next round forecast.** A strip by the field says what next round brings: nightfall or dawn, the tide's turn, the wind (at your back or in your face) and eruptions.

## 2026-10-13 (16:30)
- **Into the first fight.** After you pick a side, your tutorial cards arc from the top right into your deck at the bottom left while the screen zooms in, then the battlefield fades in.
- **Tutorial polish.** In part 1 the highlighted card glows only once the "drag a card onto the field" step comes up. The tutorial's ghost card is the size of the real card. Both parts end on "Tutorial Complete!" with one button, Claim Rewards.
- **The map during the tutorial.** Until part 2 is won, Map 0 shows only the two tutorials (no other fights, trails or features), zoomed in 25% on them, and a gold ring that starts 50% bigger and settles onto the Part 2 marker points the way. Winning part 2 zooms the map out from the tutorial marker and the rest of Map 0 fades in.
- **New doc:** design pushback (is it too much, is it boring, what I'd change).

## 2026-10-13 (15:30)
- **Your name, front and centre.** The entrance asks "What should we call you?" over a bigger, glowing name field, and a first sign-in with an account that never picked a name gets a name prompt in the middle of the screen.
- **Darkness (D67, D73).** No more "night dimness". At night and in caves it's Darkness: units without Darksight (or Nocturnal, at night) miss 1 attack in 4. Pitchblack: 1 in 2. Absolute darkness: every attack misses. A Lantern lights its side (Absolute drops to 1 in 2). Smugglers' Grotto is Pitchblack and Caves & Alcoves is now Darkness. Dark fights get a vignette over the board.
- **Frigid and Scorching (D66).** Frost's level is how many units a side get chilled; each gets +1 Wait, and units weak to cold also take ice damage. Scorching level L burns L+1 random units a side for L fire damage; heat-resistant and Dry units are spared, units weak to heat take double.
- **Molting N (D72):** every N rounds +1 Attack and +2 Health for good. The Tide-pool, Sulfur-vent and Hermit crabs have Molting 4.

## 2026-10-13 (14:20)
- **All 21 Wildpath marks work now.** Second Pitch (once a fight, pitch twice in one turn) and Echoing Wood (your first token each fight comes with a copy) were the last two.

## 2026-10-13 (13:50)
- **19 of 21 Wildpath marks now work in Conquest.** New since 13:15: Bark Skin (first unit Armor 1), Hedge Wall (Guardians +2 Health a rank), Old Growth (Wait 2+ units +1/+2), Sharpened Briars (+1 Attack a rank to 3-Attack-or-less units), Light Feet (first Quick unit has no Wait), Thornbite (+1 Bleed on your Bleed hits), Weak Spots (+1 damage a rank to units under half Health), Fletcher's Eye (Arrow +1), Bramble Storm (Cleave side hits +1) Pollen Drift (Bloom heals +1 a rank) and Crown of Thorns (a kill gives the killer +1 Attack). Only your side gets them. Second Pitch and Echoing Wood are still previews.

## 2026-10-13 (13:15)
- **Wildpaths work in fights.** Deep Foundations (+2 castle Health a rank), Sap Mending, Unmoving, Heart of the Wood, Forager (+1 Lumber a rank), Keen Eye (draw 4), Prospector (+1 Iron Shard on an elite's first clear) and Everbloom now apply in Conquest. The other marks say "Preview" in their panel.
- **World bosses on the road.** Every 20th map ends on a world boss. From Map 50, every 10th map ends on a harder boss, with a normal boss as the fight before it.
- **Field-kit items from quests.** An A notice or better gives items, and each finished weekly tier gives 3, 2 or 1.

## 2026-10-13 (12:30)
- **Standard PvP.** Arena → Format: Collection or Standard. Standard has its own deck, built from every card, all at Level 1, with no foils, shinies or Materia. It covers Quick Battle, Pass & Play, Gauntlet and friend invites. Collection (your own cards and levels) stays the normal format.
- **The road's last fights.** Map 0 ends on a normal fight, Maps 1–4 on an Elite, every 5th map on a boss and the rest on a miniboss.
- **Card rewards by rank.** From Map 5 a fight's card needs rank B, from Map 15 rank A, from Map 30 rank S.
- **The Armoury is on Map 1.** Every Map 0 win gives a card, and until the Armoury opens you can swap it into your deck from the map.
- **Wildpaths cost points:** 5 and 10, then 15, 20 and 25 for the advanced ones.
- **🍺 The Tavern** (Map 14) now holds the max-Energy upgrades.
- **Field conditions are spelled out.** The skirmish panel lists every condition (terrain, eruptions, wind, darkness, night, twilight, high tide, frost, boss surge). In a fight each row shows ? until it first happens, then New!, then plain text.
- **Field kit:** no daily refill (one starter fill; more will come from dailies and weeklies). **🔋 Energy capsule** (+20) for your first win on Map 2.
- **Admin:** edit Forge tier prices, send 📣 world call-outs and GM messages (once the world_events table is applied), and a launch switch that hides every admin surface.
- **Swarm and Tide** are keyword families now, not archetypes, so they lose the archetype mark.
- **New docs:** economy and monetization, co-op dungeon for 4 players, Steam launch plan.

## 2026-10-13 (11:30)
- **Faction Reward 🎁 and Faction Growth 🌱.** Two reward placeholders for any fight (✏️ Edit rewards).
  - A Faction Reward draws a random card from your faction pool. The pool holds 5 copies of each Common, 4 of each Uncommon, 3 of each Rare and fewer above. Your faction tier (10/20/30/40 cards collected) sets the odds, e.g. at 20: 50% Common, 30% Uncommon, 20% Rare.
  - A Faction Growth gives the next card of the lowest rarity you don't have yet.
  - Elites and bosses give one Faction Reward and one base card unless the fight has its own placeholders.
  - The Map 20 "crown" is retired: Growth reaches the Epic and Heroic last.
- **📊 Card check in the Test Lab.** Win-rate test on just the cards a player can meet up to a map you pick, at Level 1, next to each rarity's band.
- **Danger warnings v2.**
  - Only cards you haven't beaten warn; a card counts as beaten once you win a fight it was in. The same big card warns every time until then.
  - The ladder steps up after 2 Uncommons, 3 Rares, 4 Very Rares, 5 Super Rares…
  - A fight can name its own ⚠️ danger cards.
- **Seeing.**
  - Normal units are blind only in complete darkness (caves), unless they have Darksight or a Lantern; night alone dims no one now.
  - New **Sun-shy** (blind by day) and **Night-blind** (blind at night).
- **Twilight.** With a Crepuscular card in a deck (or on a twilight map) the day runs Day, Night, Day, Night, Twilight. In Twilight Diurnal and Nocturnal are both on, and the new **Crepuscular** only then.
- **The tide** starts with the first Tide card played.
- **Frigid** and **Scorching** are the new names for Frost and Heatwave.
- **Cleave** (was Sweep): hits the unit in front, and the enemy units on its left and right each take N bonus damage.
- **Pitchfork** hits the 4 nearest enemy units, none more than 2 columns away.
- **Shedding N:** every N rounds +1/+1, and Poison, Bleed, Corrosion, Scar and Expose come off. Grass Viper and Adder Ambusher have it.
- **Hummingbirds fence:** Quick on Crimson Wing Recruit and Duelist Cadet, Pierce 1 on Cobalt Talon Skirmisher, Pierce 1 and Evasive on Ruby-throat Duelist.
- **Flea Market** moved to Map 31.

## 2026-10-13 (10:45)
- **Danger warnings ⚠️.** A red warning crosses the field when a dangerous enemy card is played. By default the first one is for an Uncommon; each warning raises the bar one rarity (Rare, then Very Rare and up), so big-rarity fights don't keep firing it. Settings → Danger warnings sets where it starts (Uncommon, Rare, Very Rare, Epic, Legendary) or turns it off; changing it restarts the climb.
- **Wind, rebuilt.** Wind belongs to the map now. Windy maps (Gannet Cliffs, The Glass Dunes, Ashen Spurn, The Sundered Peak) get strong wind every other round; gale maps (Eyrie Heights, The Aerie Vault) get it every round. Each gust blows the other way from the last, starting at your back.
  - Flying units on the side it blows from have a Tailwind: they act twice, a quick extra turn and then their normal one.
  - Flying units on the side it blows into have a Headwind: their skills and triggers go off twice.
  - The Tailwind and Headwind card passives are gone.
- **New skill: Bludgeon** 🔨. Each hit knocks out one of the target's defences: Armor, Flying or Swimmer (Burrow when it exists), at equal odds. The Codex → Reference page has the long description.
- **New skill: Snipe N** 🎯. Every round while Ready, if nothing stands opposite it, it shoots a random enemy unit for N.
- **New cards, with art:**
  - Cunning Vixen: Evasive, Backstab 2; Briar Maze.
  - Fox Sharpshot: Snipe 3; Briar Maze.
  - Balloon Archer: a mouse in a patchwork balloon, Flying, Arrow 2; Eyrie Heights.
  - Frillneck Duelist: an upright lizard in spiked knuckles, Quick, Bludgeon, Dry; Glass Dunes.
  - Monitor Rambler: a plated lizard on all fours, Armor 2, Thorns 1; Savanna Reaches.
  - Bombardier Beetle now has its picture.

## 2026-10-13 (09:30)
- **D66, second half:** Swimmer now on the fish, turtles and tortoises, frogs, Voltaic Eel, Orca Vanguard, Narwhal Lancer and Humpback Elder (+1 Attack on Flow). Nocturnal and Diurnal still wait for a day/night playtest.
- **The new skills on cards:** Rivergate Tribune now has Kinship Otter 1/1 (all your Otters +1/+1) instead of Rally. New **Bombardier Beetle** (Uncommon, Insect, 3/10, Rocket 4) is a reward from the Morel Hollow's Web Hollow fight; its art comes next time Chrome is reachable.
- **B6 balance sheet re-run** with every card measured at Level 1, against a fixed yardstick (the filler deck no longer picks up new traits). 228 of 454 cards are in band. Tonight's new cards were tuned toward their bands: Fennec Fox 2/10, Meerkat Sentry 2/7, Thorny Devil 2/14, Buzzed Chipmunk 3/7, Scree Goat 5/14, Lone Grey Wolf 4/18, the two Heroics 8/30 and 7/18. Cost-3+ cards still read weak on this test (the test deck carries fewer copies of them), so the Heroics, Epics and Legendaries need a hand check rather than this number.

## 2026-10-13 (08:30)
- **New passive: Kinship <Type> X/Y.** All your units of that Type get +X/+Y (the card itself too, if it is one). Several stack. In the card editor, pick the Type, then Attack and Health.
- **New evergreen: Rocket N** 🚀. Fires once, when the unit is Ready (on arrival if it has no Wait): the strongest enemy unit (highest Attack) takes N Heat damage and each enemy beside it takes 1. It hits the castle if the enemy has no units.
- **D66 (first half):** Tailwind went on the big soarers (eagles, condors, ravens, gulls, Pelican Diver, Migration Leader, Hawk Arrowkeeper). Headwind went on the heavy ground animals (Marching Elephant, Siege Rhino, Permafrost Mammoth, Tundra Musk Ox, Glacier Yak, the elks and the boars). Nocturnal, Diurnal and Swimmer are still waiting for your OK.

## 2026-10-13 (overnight)
- **Otters and Hummingbirds left the packs.** You earn them through progress now: the first clear of every elite and boss gives one card from your faction's track and one from the base track. Each track hands out every Common first, then every Uncommon, then every Rare; after that it draws duplicates (a Rare can be held 4 times, so 3 more stay in the pool). Very Rare and Super Rare join from Map 10. Map 20's boss gives your faction's Epic and Heroic. Two new Heroic cards: **Rivergate Tribune** (otters) and **Sunspire Sky-Sovereign** (hummingbirds).
- **Journeys (Maps 15–20).** Five subfaction quests take you across six maps, one fight per step, and every step pays two cards: the Toll Road (Road-folk), the Call of the Wild (Wild Beasts) and the Long Harvest (Woodland Folk) finish by Map 20; the Swarm Below and the Drowned Bell go on past it. They're on the Notices board, and the next fight shows its step. Subfaction bundles no longer drop.
- **Auto, Sweep, Auto-Sweep, Idle-Sweep.** Auto needs rank S on the fight and Map 20 passed. Sweep (Map 30 passed, after an Auto win at S) plays a fight for you N times on your Energy, paying the clear-again reward for each win. Auto-Sweep (Map 50) doesn't need the Auto win. Idle-Sweep (Map 70) spends the Energy that would spill past your maximum on a fight you pick.
- **Energy:** 50 max, 1 every 5 minutes.
- **New skills:** Lone Wolf X/Y (stronger with empty slots near it), Sociable X/Y (stronger with allies near it), Coffee N (Wait −N on arrival, then a nap), Dry (half Heat damage, immune to Heatwave), Darksight, Tailwind and Headwind (Windy rounds), and the **Landslide N** evergreen (when it falls: N to the enemy facing it and both its neighbours).
- **Weather:** every round can be Windy (1 in 2) when a Tailwind or Headwind unit is out, and night now dims everyone without Nocturnal or Darksight (1 attack in 4 misses; a Lantern keeps your side lit). Design note: weather-and-time-2026-10-13.
- **New cards:** Thorny Devil, Fennec Fox and Meerkat Sentry (the Glass Dunes is now Swift, Thorns and Dry throughout), Lone Grey Wolf, Buzzed Chipmunk and Scree Goat. The Deep Cave Troll is now the **Cave Bear**.
- **Arrow** shoots the nearest enemy (random when tied). Arrow, Fire Arrow and Boomerang say they never miss Flying units.
- **Esprit** is a passive. Spells are shelved (hidden everywhere) for now.
- **Codex:** locked, unlocked and owned cards sit in one list; cards you don't own are greyed, locked ones carry a 🔒. The phyla filter shows each phylum's emblem.
- **Card editor:** saving no longer jumps the page back to the top.
- **Art:** every NightCafe picture got a chunkier pixel pass (a 64-pixel grid on a 128 card). The Mirror Moth, Elder Willow, Conch Herald and Tidewall Fort (no more "HOME BASE" lettering) were redrawn.
- **Strength analysis** measures every card at Level 1; Base, starter and quest cards start at Level 0, so their first level (+10%) is noted.

## 2026-10-12 (23:55)
- **Every card starts hidden,** Base ones included. A card shows up in the Codex and deck lists once you've seen it or own it. Untick Hidden in the editor to keep a card always visible. Explicitly secret cards still get the "✨ Discovered!" pop; the rest just appear.
- **Targets are a choice now.** Heal Self is just **Heal**, and every action that used to pick its own target (Heal, Cleanse, Damage, Buff, Debuff, Poison, Bleed, Expose, Stun, Increase Wait, Exile) takes Self / Ally / Opponent / Any, then a distance (Adjacent, Any distance, Furthest, All), then how many targets (up to 8, never the same unit twice). Missile, Swap and Mind Control stay fixed presets.
- **New skill: Nature's Force N** 🌪️ — every Elemental on your side gets +N/+N while it lives; several stack. A value of 1 is the default and isn't printed, here and everywhere (Poison, Bleed and the rest show just the icon at 1).
- **Extended art shows far more of the picture:** nearly the full width, top-anchored, fading softly behind the stats. Normal art's bottom edge now fades into the plate instead of stopping hard.
- **Editing a card no longer takes it out of your inventory.** Only a fresh re-lock in the editor revokes your copy.
- **Card editor:** stats by level include Lv 0 for cards that hatch at Lv 1; the card's source can be set right in the editor; maps are grouped into the First world's First to Fourth seasons (Maps 0–5, 6–10, 11–15, 16–20).
- **Off Base:** Chapel Sparrow, Cinder Imp, Spring Rain, Echo Keeper and Voidfeather Scout now drop from maps.
- **Card strip:** Esprit 🤝 and Rally 🚩 show on the bottom strip; the Swarm mark is a 🐜 (🐝 for bee swarms).

## 2026-10-12 (22:55)
- **Every card has art now.** PixelLab is at its monthly limit, so 145 new portraits came from your NightCafe credits, shrunk to the game's 128×128 pixel style with their backgrounds kept. That covers every card that had none (enemy-only cards and items included), plus new Owl Sentinel, Ant Hill and Ant Warrior art as real animals, and War Hound and Bramblewood Macaque redone.
- **Castle art.** All 42 castles have a picture.
- **22 new castles to find.** Two or so per map from Map 0 to Map 10, e.g. Farmstead (10 Health, +1 Lumber every 2 rounds), Village Green (20, +1 Health on every unit), Lighthouse (a bolt every round), Wrecked Ferry. They're never a set reward: a win on their map can drop one (3% skirmish, 6% elite, 10% boss), and a basic pack has a 3% chance. A castle you already own drops as a spare to fuse in the Forge, and a map boss beaten again at rank S gives a spare of its castle.
- **The Goliath's brood.** Six raid-only cephalopods (Inkcloud Squid, Abyss Lantern Squid, Glass Octopus, Vampire Squid, Goliath Tentacle, Goliath Broodmother) now fill the Goliath's parts. When the raid falls, everyone who fought it gets one; the top 10% get two.
- **New side map: The Sunken Ferry,** below Coral Current. It opens after that map's boss. Five fights in an otter ferry wreck: night all through, faster (First Blood +2), with electric eels and the Goliath's brood.
- **New cards:** Cave Centipede (Quick, Poison) and Millipede Hauler (Armor 1; when it falls, three Worker Ants climb off), both on Caves & Alcoves.
- **Shock gets the 🔌,** and the Voltaic Eel and Abyss Lantern Squid now Shock.
- **Battle ratings are real:** worked out from the enemy's actual deck at the levels it fights at. The editor shows it read-only.
- **Enemy levels flattened:** Lv 2 at Map 5, +1 every 5 maps, Lv 5 at Map 20, boss decks one higher.
- **Stamina moved to Wildpaths.** Max Energy no longer grows on its own. Every 20 skirmishes earns a Stamina mark; spend it in Wildpaths → Stamina (with Maple Leaves) for +1 max Energy.
- **Clocks:** the Energy pill reads "4/20⚡ 03:12", and Raid Points and PvP tickets read the same way.
- **The skirmish panel:** the green tick is gone, the best rank sits on the panel's top-right corner, reward cards are as big as the highlighted card, and the battle rating is a ⚔ chip beside Health and Shield.
- **The map:** interactables are bare emblems that give a little shake now and then. Only real caves (Smugglers' Grotto) keep the cave mouth, now smaller and empty. Eye of the Volcano shows the volcano, Basalt Foundry a rock, the Canopy an acacia, the Glimmer Depths a gem in a rock. The note in your pack moved to Gatorback Swamp; open it once for 🦴3 Kibble and ✨40 Dust and it's gone.
- **Edit skirmish:** card details show over the deck editor and the deck preview, and each fight picks what it summons once it's out of cards: nothing (the default), imps, bees, ants, wolves, bats, sprouts, hatchlings or squid.
- **Pack names follow their maps:** Hedgerow Pouch, Tidemire Chest and Highcrest Case.
- **Types:** non-place, non-animal types (Forgotten, Oddity, Changeling, Irradiated, Shrine, Traveller…) are gone; rule-only ones (Structure, King, Leader, Devil, Imp) are kept but hidden.
- **Balance:** Darkness from your own losses stops at 10. Skull Vulture drops on Map 8's Root Snare.

## 2026-10-12 (21:20)
- **Daily portents in PvP.** The big PvP button now shows today's portent on its right: one medallion per field effect, with tomorrow's under them and when it changes. Every day rolls 1 to 3 effects (usually 2) from day and night, weather, Lumber, home ground for any biome, First Blood and the eruption; Double Time and Collapse count as 2. About one day in seven is a **Strange day**, which opens with one of those big rule changes (a purple medallion). Holidays are fixed every year (New Leaf, Bloomtide, The Thaw, Midsummer Fair, Harvest Home, Hallow's Eve, Midwinter, Winterfeast). These are the Arena's rules for the day, in every Arena mode.
- **Edit skirmish shows its field effects.** A new Field effects box lists everything the fight plays under, marked "map default" or "set here": day and night, weather, home ground and its tier, the eruption, boss surge, enemy mining, frost tuning and leader gifts. ✕ switches one off (even a map default, such as the Tundra's frost), ↺ puts the map's default back, and "Add a field effect" adds weather, Lumber, the eruption (2, 3 or 5), High Tide, Double Time, any biome's home ground at tier I–III, or a leader gift (Immolation, Inspiring, Regen or Armor 2).
- **Hatching, Pokémon style.** The egg now cracks with drawn splits that spread on each rock, with the rarity's light leaking through; then it turns to light, beams pour out, a white flash, and the card fades in from a bright silhouette.
- **Hatchlings start at Level 0.** A card you get for the first time from an egg arrives at Level 0, about 15% weaker. Train it to Level 1 in the Nest. Training (for hatchlings and Base cards alike) now costs **🦴 2 Kibble**, 15 Dust and 10 Maple Leaves, for an hour. Kibble is new: first clears give 1 (elites and dungeons 2, bosses 3, the world boss 5), repeat wins sometimes 1, and a grown baby brings 2. Everyone starts with 4.
- **Codex:** maps are grouped 0–5, 6–10, 11–15 and 16–20, and packs go by their names: Sprout Pouch · Acorn Chest · Golden Bramble Case, the Factions pool and the Mystery Booster.
- **One Factions pool.** The Rivergate (Otter), Sunfeather (Hummingbird) and shared Riverbank pools are now a single Factions pool that every basic pack draws from. The Rivergate and Sunfeather packs you earn on the road still give their own side's cards.
- **Dropdowns open in the page** (filters, editors and the rest) instead of the browser's own pop-up, which could open on another monitor.
- **Disenchant extras** moved to the Forge, next to Fuse all extras; it's no longer in the Nest.
- **Art:** War Hound and Bramblewood Macaque were grainy; they're cleaned up for now, and new portraits are queued for when PixelLab's monthly limit resets.

## 2026-10-12 (21:05)
- **Two-stage sudden death, bosses included.** From round 20 any hit kills a unit (sudden death I); from round 30 a hit on a castle ends the game (sudden death II). A banner marks each stage. Raids only ever reach stage I.
- **New card: Triumphvirate** (Unique leader, 6/22, Lumber 3, Wait 1, Felid, Leader and Savanna): a lion wrapped in jewellery on a carpet of gold, beside a lion-mane banner. It has the new **Dictator** skill: it can only be your Leader and never goes in a deck. It has no source yet, so it can't be earned; its portrait is queued in PixelLab.
- **Art:** Pufferfish Bulwark, Komodo Warlord and Wolf Pack Runner have portraits (264 cards in all). PixelLab then hit the account's monthly generation limit, so the other 88 queued portraits are paused and saved, waiting on you.
- **Proposal:** [rarity flags, the sinking Goliath raid and co-op dungeons](design-2026-10-12-rarity-raid-coop.md).

## 2026-10-12 (20:20)
- **Keywords light up everywhere.** Card text, coach tips, field and castle text now mark game words automatically: statuses and resources in their own colour (Poison green, Lumber brown, fire damage orange…), and terms such as Pitch, Upkeep, Wait, Adjacent and every skill name in bold with a dotted underline. Pitch, Upkeep and Adjacent get a one-line meaning under a card's skills. Flavour text is left alone. Nothing is hand-tagged: it all comes from the game's own lists.
- **Simpler skill text.** Every skill now reads short and in the same words, e.g. Immolation 2: "Deal 2 fire damage to all adjacent units every upkeep"; Pounce 5: "Deal 5 damage to a random enemy unit, or the castle if there are no targets"; triggers read "On Death: Deal 5 fire damage to an adjacent enemy". Heat damage is now called fire damage.
- **Resistance, Weakness and the new Immune** are core lines at the top of a card ("Resistance: Fire"). Immune takes no damage at all from what it names (a damage type, an attacker's type or an attacker's skill); it's in the card editor next to Resistance and Weakness.
- **Granted skills are light blue**, marked "given by this fight". The Caldera Wyrm's Immolation now comes from the world-boss fight instead of its card.
- **Compass-point bullets** replace the leaves in card details.
- **Tips above the dimming:** a spotlighted tutorial tip is no longer hidden under the dark layer.
- **Enemy resources** moved to the field's top-right.
- **Terrain.** Every biome now favours its own kind of unit, on both sides: none on a map's first skirmish, tier I (+0/+1) from the second, tier II (+1/+1 and the biome's signature skill) on elites and bosses, tier III (+1/+2) on the bosses of big maps. Signatures: Old Woods Regen, Meadow Bloom, Riverbank Inspiring, Tideline Shell, Coral Shelf Thorns, Mire Poison, Deep Dark Ambush, High Crags Siege, Frozen Waste Frostbite, Hunting Grounds Momentum, Basalt Floor Armor, and the Volcano's eruption. A pill on the field (top-left) says what it does; hover or tap it. A banner explains it when the fight starts, and native cards show a light-blue "Home ground" line.
- **The eruption is visible:** a lava geyser bursts through the struck card, embers fly, the field flashes red, and volcanic fields glow with lava.

## 2026-10-12 (19:20)
- **The last PixelLab batch is in:** portraits for Creeper and the 18 new cards (Pigeon Peon, Marching Elephant, Siege Rhino, Stonedrop Vulture, Newt Doctor, Gatling Hog, Dung Beetle, Ur-Elk, Subterraneaner, Farm Dog, House Cat, Shellwright Apprentice, Otter Royal Guard, Otter Flag Bearer, Otter Lantern Bearer, Riverbed Diver, Hummingbird Needler, Riverwing Envoy). Also new: Boar Rampager, Berserker Boar, Tusked Vanguard, Raccoon Bandit, Land Tiller, Talon Archer, Meerkat Wayfarer and Strange Materia. All 153 queued images are done.
- **The Forge** now uses the PixelLab hearth for its backdrop and the PixelLab anvil on its stump.
- **Card Ledger: Creature count.** A new view counts every unit by species and by creature, as a share of the cards a player can own, and flags anything crowded (a species at 12% or more, a creature at 6% or more; Otters and Hummingbirds are marked as the factions). Click a name to see its cards.
- **Fix:** the six otters added today are now species Mustelid like every other otter (they were tagged Mammal).

## 2026-10-12 (19:10)
- **Resources on the field:** your Lumber (and Stone, Metal, Grace and so on) now sits on the battlefield's bottom-left corner, and the enemy's on the bottom-right with a red "Enemy" tag, so you can see what they have saved up.
- **Full screen centres the field:** in full screen the battlefield sits in the middle of the screen, as far as that keeps your hand in view. On iPhone (no full-screen support) the ⤢ button gives the same layout.
- **Deck editor on phones:** swiping over the cards now scrolls the list. To drag a card, hold it still for a quarter of a second first.
- **Conversations stay out of the way:** at most 2 lines on a computer and 1 on a phone. They turn see-through while your pointer or finger is over them or while you drag a card, and a ▾ button tucks them into a small 💬 chip (with a count of new lines) until you tap it.
- **Pitching lesson:** the first time you hold a card you can't afford, or in any fight from Map 2 on, three spotlighted steps teach it: why you need Lumber, pitch a card onto the Graveyard (only that works until you do), and where your Lumber shows. Your guide says a line too. This replaces the old one-line Lumber tip.
- **Claiming rewards:** stars burst from the button, a ring spreads, and a swarm of reward icons rushes into a tally in the top-right corner. Each currency's total counts up as they land, then the tally fades. Claim all sends a bigger flood. Covers achievements, quests and errands.
- **Caves:** the blackout when you enter a side map now covers the whole screen.
- **Side map icons:** only real caves (Smugglers' Grotto, the Mycelium Deep, the Glimmer Depths, the Volcano Lair) keep the cave mouth. The others show just their emblem; Lilypad Reach is a lotus.
- **Earthquake** now also hits your own grounded units (never the caster, never flyers). The hits land 0.1 s apart, each unit jolting in turn. Gorge Wyrm and Glacial Ape King change with it.
- **Pack plan:** a proposal for your four-pack road structure is in `docs/pack-plan-2026-10-12.md`. It needs two decisions from you.

## 2026-10-12 (18:15)
- **Enemy card marker:** the red tint on top of enemy cards is smaller (a thin 5 px strip, inset from the corners) and much fainter. It now sits inside the card itself, so it moves with every lunge, hit, flip and topple instead of staying behind, and fades out when a card dies, falls or burns.

## 2026-10-12 (17:00)
- **Your map list:** the road is now 0 Outskirts, 1 Thistlewood, 2 Pebble Beach, 3 Gannet Cliffs, 4 Sunken Hollow, 5 Gatorback Swamp, 6 Sable Swampmire, 7 Morel Hollow, 8 Caves & Alcoves, 9 Kelp Mangroves, 10 Coral Current, 11 Eyrie Heights, 12 Briar Maze, 13 Redwood Deep, 14 Savanna Reaches, 15 Long Grass, 16 Pinewood Taiga, 17 Wolfsbane Tundra, 18 Glass Dunes, 19 Ashen Spurn, 20 Sundered Peak.
  - **Fused in as side maps:** Clovermead (Thistlewood, after its first fight), Lilypad Reach (Pebble Beach), Basalt Foundry (Ashen Spurn). Your progress on them stays.
  - **Renamed:** The Ashen Peak is **Ashen Spurn**; the Caldera Heart is the **Volcano Lair**.
  - **Five new side maps,** four fights and a boss each, built from their map's own cards: The Sunken Grove (Gatorback Swamp), The Glimmer Depths (Caves), The Aerie Vault (Eyrie Heights), The Ice Hollow (Wolfsbane Tundra), and The Old Bramble (Outskirts), which opens only once the Ice Hollow is cleared.
  - Feature spots follow the map numbers, so the field kit is now on Map 12 (the Briar Maze). The Sundered Peak's final boss is Map 20 at rating 400.
- **Skirmish panel:** one row: the showcase card, then the name, "30 ❤️ 98 🔷" (only the top armour layer, in its colour) and the battle rating under it, and the first-clear rewards on the right. Cleared is a green tick in the top-right corner. The enemy's card list stays inside the panel.
- **Admin off** now redraws the screen, so no admin buttons stay behind (skirmish panel, card details).
- **Card hover** darkens the card instead of turning its border brown.
- **Card art:** 51 new PixelLab portraits (the volcano undead, Caldera Wyrm, The Contradiction, bears, horses, pond and mangrove creatures, foxes, rabbits and more). 234 cards now have art; about 30 more are still generating.
- **Rarity colours:** Starter/Common grey, Uncommon/Quest green, Rare blue, Very Rare light blue, Super Rare teal, Epic purple, Heroic orange, Unique/Special amber, Legendary yellow, Mythic red, Ancient deep blue, plus Divine white, Void purple-grey and Daemonic black. The other special rarities wear their tier's colour.

## 2026-10-12 (16:30)
- **Balance pass** ([report](balance-pass-2026-10-12.md)): 63 player cards moved into their rarity's band with the smallest Attack/Health change (200 simulated games each; Attack never below 1, no change bigger than 2 Attack or a third of Health). Starter cards (the tutorial is built from them) are untouched; Ecclesia, Devilry, Remember and Changeling cards, leaders, Heroic+ and 3+ cost cards were left alone. The whole set is now 264 of 436 in band (was 186 of 418). Some enemy decks use these cards, so a few fights got easier (Gannet Cliffs) or harder (Map 0's third skirmish).
- **New cards:**
  - **Creeper** (Common, Pack 1): a lime-green bee with a blank face and a wide smile. 1/2, Flying, Swarm, Scare 1.
  - **Enemies:** Pigeon Peon, Farm Dog and House Cat (Clovermead), Dormouse (Thistlewood), Gatling Hog (Thistlewood), Newt Doctor and the kingfisher (Lilypad Reach), Beaver Lumberjack (Lilypad Reach), Dung Beetle (Morel Hollow), Subterraneaner (Caves), Marching Elephant and Siege Rhino (Savanna), Stonedrop Vulture (Gannet Cliffs, Eyrie Heights), Ür-Elk (Tundra, Taiga), Shellwright Apprentice and Otter Royal Guard (Outskirts).
  - **Otter pack:** Otter Royal Guard, Shellwright Apprentice, Otter Flag Bearer, Otter Lantern Bearer, Riverbed Diver. **Hummingbird pack:** Hummingbird Needler (the Ruby-Throat Duelist is already there).
  - **Riverwing Envoy** (an otter with a hummingbird on its shoulder): the Part 2 reward for players who pick both sides, with the Sunspire Envoy.
- **Seven new castles** with new passives: The Logjam (the enemy's first 3 units arrive 1 Wait later), Trojan Horse (a Trojan Raider climbs out on round 3), Ballista Keep (a bolt at a random enemy unit each round), Clam Farm (+1 Lumber every 3 rounds), Thorn Cage (a unit that hits the castle takes 1), Herb Refinery (each round: heal, sting or Lumber at random), Hidden Nest (a Nest Hatchling joins on round 2 and every 4 rounds). Each opens with a map's boss.
- **Frenzy** now means: while any status is on it, it strikes twice and each hit adds 1 Bleed.
- **Ranks:** SS is "not one point of damage on your castle"; SSS adds "not a single unit lost" (it used to be a fast win).
- **Field kit:** opens at Map 12 now (the Inventory still opens at Map 1). One item a fight. Nerfed and widened: Healing Draught 5, Kindling +1 Lumber, Scout's Map draw 2, Fire Pot 3 to every enemy unit, plus Honey Cake, Whetstone and Caltrops. One of each a day, up to 5 of each.
- **Eggs:** first clears drop an egg 8% (skirmish), 16% (elite), 25% (mini-boss), 35% (boss), 50% (world boss); repeats 0.1% per energy, ×1.5 / ×2 / ×3 / ×5 for elites, mini-bosses, bosses and world bosses; raids 1%. The results screen shows the egg.
- **The world boss has its own side map, the Caldera Heart**, opened by the Sundered Peak's final boss (rated 400) alongside the Eye of the Volcano (400–450). Its three fights are 350, 375, 400 and the Caldera Wyrm 500. An earlier world-boss win carries over.
- **Map screen:**
  - Swiping to another map needs a quick sideways finger swipe; a mouse press or a press on a node no longer changes the map.
  - Map icons shrink 5% for every node or destination past six (the Sundered Peak's are about three-quarters size).
  - The map list keeps its scroll when you change map. The tab colours darken further toward Map 20, with a little more red; deep tabs switch to light text.
- **Battle on phones:** press and hold a card for 0.25 s to see its details; lifting doesn't play it.
- **Lumber messages** say what's missing: "Need 2 more Lumber".
- **Replays:** the "First clear · already earned" section is gone; the results show only what you won.
- **Your decisions:**
  - **Enemy levels from Map 5 (D61):** enemy cards fight at Lv 2 at Map 5, +1 every 3 maps (Lv 3 at Map 8, Lv 7 at Map 20); elites +1, bosses +2, side maps +1. A level set in the skirmish editor still wins. Stats only change on Lv 3, 6 and 9, so the jump shows from Map 8.
  - **Tutorial Part 1 reward (D46):** the Rabbit Kit (3/2, Quick) replaces the Quarry Mole.
  - **Free Base copy (D59):** each map's boss, on its first clear, gives a copy of the Base card you own the fewest of.

## 2026-10-12 (13:00)
- **Pounce, a new evergreen keyword.** "On Play: deal damage" now has a name: **Pounce N** (🐾) hits a random enemy unit for N the moment the card lands, Waiting or not (the castle only if no units are left). It has its own log line and a crouch-and-spring on the card.
  - Kept as Pounce (9 cards): Raven Scout 2, Hawk Arrowkeeper 2, Eagle Diver 3, Golden Eagle Diver 3, Ford Kingfisher 2, Quill Volley 2, Mallard Marauder 1, Firetail Trickster 2, Caldera Wyrm 5.
  - Changed to other skills (25 cards): Yeti Scare 2, Gorge Wyrm Earthquake 3, Ember Wisp Immolation 1, Komodo Warlord Gash 3, Eyrie Warden Daunt 1, Cave Warlord Daunt 2, Venomlord Serpent Ambush, Cataphract Destrier Stampede, Bog Behemoth Regeneration 3, Ancient Sloth Titan Bulwark 2, Glacial Ape King Earthquake 4, Orca Vanguard Momentum 2, Permafrost Mammoth Frostbite 2, Eagle Sharpshooter Arrow 2, Deep Cave Troll Siege 4, Humpback Elder Inspiring 2, Kraken Spawnling Gash 3, Magma Titan Immolation 1, Pyroclast Wyrm and Fire-Drake Hatchling Fire Arrow 2, Red Dragon Fire Arrow 4, White Dragon Scare 3, Blue Dragon Lightning 4, Green Dragon Poison 3, Black Dragon Corrode 3. Most are enemy cards, so a few fights play a little differently.
- **Card drops.** Winning a fight can drop a card: 10% skirmish, 20% elite/champion/dungeon, 30% mini-boss, 40% boss, 70% world or raid boss, always for a raid win. Rarity: 1% Heroic from bosses, 1% Epic from world bosses and raids, then 2% Super Rare, 5% Very Rare, 10% Rare, 30% Uncommon, else Common.
- **Nest:**
  - Eggs now go into your pack. Tap an empty hay nest to place one, or to **nurture** a Level 0 base card to Level 1 (1 hour, 15 Dust + 10 Maple Leaves).
  - The Forge no longer takes cards from Level 0 to 1: a Level 0 card shows "Nurture it in the Nest", which opens the Nest with that card picked.
- **Forge:**
  - Upgrades past the Village Forge need 🔮 **Strange Materia** (1, 1, 2, 3), dropped by the bosses of Maps 12, 15, 25 and 30 on their first clear.
  - "Show the N I can temper" works once per visit, then fades with a small gadget sound. Tempering strikes the anvil.
  - **New forge art:** a pixel-art hearth, hood and tool wall behind the forge, and a pixel anvil on a stump. Drawn in code for now; PixelLab versions are queued.
- **Card opening:** light rays in the card's rarity colour behind Rare-and-up and new cards, a spotlight under the deck, a gold-trimmed card back with a moving sheen, a "2 of 3" count, and a tray of empty slots that fill as each card flies down. Fixed: the card that flies to the row below had stopped landing there.
- **Shop:** a lamp-lit back wall with a scalloped valance, bigger pouches with a shadow on the plank that lift and tip when you point at them, a beam of light on the chosen item, hanging price tags, and a counter with a wooden edge and a receipt.
- **Sweep** hits its three targets in quick succession, 0.3 s apart.
- **Map tabs** shade by tier: warm browns that darken from Map 0 to 20, then lime turning purple and darker up to Map 40.
- **Toucan Courier** is out of the Glass Dunes decks (Dust Hyenas instead) and now comes from the Canopy (y-1).
- **Card Ledger:** a "Summary by source" view: Base, each pack and each map in play order (side maps under their parent), with card counts, rarity mix, average stats, score, balance results and, for maps, the enemy cards they field. Map numbers now count from 0 as in the game. Click a row to see its cards.
- **Decisions waiting:** D58 egg rates, D59 free base copies and B2/B3 tiers, D60 the Map 20 boss battle rating (your note was cut off).

## 2026-10-12 (12:30)
- **Raids:**
  - **Leaders take the field.** All three leaders open on the board, one in each of the centre three columns: yours in your front row, each ally's in their own row. An ally's leader is the one saved on their deck, else the rarest card in it that can lead.
  - **Boss units.** On rounds 3, 7 and 11 the part sends in its biggest card as a boss unit with huge Health: ×(2 + 10·r²), where r is the share of the part's Health still standing this week. A fresh boss's unit is a wall; once the raid has pounded it, the unit is ordinary.
  - **Minimum damage.** A raid's full per-attempt reward starts at 120 damage (`minDamage`, editable per raid). Below that you get a pittance (8 Maple Leaves, 6 Dust).
  - **Raid materia.** Every attempt brings home at least one 🦑 Abyssal Ink, the raid's materia (up to 5 for big damage). It shows in the Inventory with the other Materia.
  - **World call-out.** When a raid falls, everyone sees "🌍 The Goliath has fallen! The last blow: …" once. If it was the hardest live raid and you were on when it fell, you get 0.8% of a Materia Unit (5 Dust, 4 Maple Leaves).
- **Leaders in the deck editor:** cards that could lead but sit in your deck now show in the picker, greyed out and marked "In your deck".
- **A leaders lesson:** the first time you get a card that can lead (Heroic, Unique or rarer), the Wandering Traveller explains leaders after the fight and offers to open the Armoury.
- **Shop quantities:**
  - With two or more packs on sale, each pack sits on the shelf once, and its counter asks how many: ×1, ×10, ×25, ×50, ×100 or ×250.
  - A tier shows once you've reached its map (10 at Map 9, 25 at 14, 50 at 19, 100 at 29, 250 at 44) and can afford the tier before it.
  - With a single pack on sale, its bundles stay on the shelves under the same map gates.

## 2026-10-12 (12:00)
- **Tutorial rewards come in two parts:**
  - Part 1 gives the Quarry Mole. "Add to deck" no longer shows the deck size.
  - Part 2 gives your side's two cards (Otters: River Warden and Otter Centurion; Hummingbirds: Sunspire Envoy and Crimson Recruit; both: River Warden and Sunspire Envoy). They fly into the deck, which now counts up to 20/20 with "A deck holds 20 cards".
  - Picking both sides also brings the new **Meerkat Wayfarer** (Uncommon, 3/7, Reach, Inspiring 1: "another traveller on the same road") to your collection.
  - Every list is editable in the tutorial editor (Part 1 reward; Part 2 rewards for each pick).
- **Tutorial flow:**
  - Part 1's win offers 🗺️ Back to the map beside the main button.
  - The guide to Part 2 takes two taps: tap the marker, then ⚔️ Fight, which is lit in the spotlight.
  - While you hold a card during "drag a card onto the field", a ghost card and hand glide from it to your row. Let go and the pointer comes back.
  - Tutorial cards keep their own skills (your edited cards play as they are).
- **Tutorial editor:**
  - Every deck shows as pictures with 🃏 Edit deck; the text box is under "Edit as text".
  - Save closes the editor and refreshes the map editor's preview.
  - The picture builder has ✓ Done.
- **Auto-play:** on a Conquest fight you've cleared at rank S or better, 🤖 Auto-play (top right) lets your side play itself. Press again to take over.
- **Quest rewards:** claiming one bursts at the button and shows a gold "Quest complete!" ribbon. Each reward arcs into a backpack that pops up in the corner, with no OK to press.
- **Used-up skill strips:** when everything left in a card's strip is a trigger that's fading, the strip fades with it and leaves no empty pill (e.g. the Wandering Traveller after his draw).
- **Shell** shows 🐢 on the card's skill strip too.
- **Full screen:** the match sits vertically centred.
- **Big screens (a first large RWD pass):**
  - From 1700×950 the match grows into the space: cards up to 240px tall, with their text scaled to match, and a wider board.
  - Home, Inventory, Profile, Nest and Shop scale up 1.2× (1.45× from 2300×1250).
- **Difficulty after the reorder:** the moved maps were retuned to the road's rising curve (tools/curve_tune.js). For example, the Morel Hollow (now Map 3) was much too hard, and the Sundered Peak (now Map 21) too easy. The world boss and the Eye of the Volcano keep their hand-set numbers.

## 2026-10-12 (11:30)
- **The road follows the 0–20 tiers.** Clovermead stays Map 1, so the road runs Maps 0–21:
  - 0 Outskirts, 1 Clovermead, 2 Thistlewood, 3 Morel Hollow, 4 Lilypad Reach, 5 Pebble Beach;
  - 6 Gannet Cliffs, 7 Sunken Hollow, 8 Gatorback Swamp, 9 Kelp Mangroves, 10 Sable Swampmire;
  - 11 Caves & Alcoves, 12 Eyrie Heights, 13 Briar Maze, 14 Redwood Deep, 15 Long Grass;
  - 16 Pinewood Taiga, 17 Wolfsbane Tundra, 18 Savanna Reaches, 19 Glass Dunes, 20 Basalt Foundry;
  - **21 The Sundered Peak (the Volcano, with the world boss)**.
  - The Ashen Peak (22) and Coral Current (23) come after it, as the tier list had them leaving the road.
  - Features stay on the map numbers from your table: the Forge on Map 11, Raid 1 on Map 13, and so on.
  - Maps you've already fought on stay open.
- **Icons:** the Sundered Peak is now the 🌋, the Ashen Peak a snowy 🗻 (no magma) and the Basalt Foundry ⚒️.
- **World boss: The Caldera Wyrm** (on the Sundered Peak, after its boss; optional like a raid boss).
  - It leads the enemy. It costs 2 Stone + 1 Metal, which the enemy digs each round, and it comes out the moment it can.
  - It deals 5 on landing and gains +2/+4 when cast.
  - Immolation 2: at every round start, 2 fire damage to the units beside it (theirs and yours) and the one facing it.
  - On death, it deals 5 to whatever faces it. It has Armor 2 and is immune to heat.
  - **The mountain erupts:** one random unit a side takes fire damage every round: 2 in elites, 3 in the boss fights, 5 against the world boss. The board rumbles and the struck card flares.
  - The boss fights here (and the world boss) surge +2/+4 when their leader is cast.
  - Its own theme, "The Caldera Heart": slow and very low, with war drums and the mountain rumbling under every bar.
  - A new achievement, Wyrmslayer.
- **Eye of the Volcano** (sub-map at the crater's edge, after the Sundered Peak's boss):
  - Three undead elites lead to Heart of the Mountain, a four-castle Dungeon in which every castle has its own deck. **The Contradiction** waits at the bottom.
  - Three wildlife elites (boars, vent crabs, ash condors) turn up at random after wins once their path is open.
  - New cards: Ashbone Ghoul, Cinder Skeleton, Magma Wraith, Obsidian Lich, Ember Revenant, and The Contradiction, a snow bear with a red-glowing heart (Bleed 2, Rage, Regen 2). It has its own background.
  - Their PixelLab portraits are queued next in the Chrome run.
- **Field kit and the backpack:**
  - Four items: Healing Draught (castle +6), Kindling Bundle (+2 Lumber), Scout's Map (draw 2) and Fire Pot (4 fire damage).
  - The kit refills one of each every day. Unused items pile up, to 20 each.
  - In a fight against the CPU, the 🎒 beside your Lumber uses one item a turn, without spending your play.
  - The Inventory stays hidden until a note from the Wandering Traveller on Map 1 shows you the backpack. Saves past Map 1 have it already.
- **Achievements page:**
  - A progress ring and Claim all.
  - Filters: All, Ready, In progress, Claimed.
  - Groups: Battles, The road, Bosses and raids, Collection, The Forge.
  - Medal tiles in bronze, silver, gold and dragon.
  - Four new achievements: Five Horizons, To the Caldera, Eye of the Volcano, Wyrmslayer.
- **Editors:**
  - Dungeon: each castle can have its own deck (🃏 Give it a deck), and the castle count is set right there.
  - Skirmish deck previews run left to right again.
  - Tutorial editor: every deck shows as pictures with 🃏 Edit deck (the picture builder); the text box is under "Edit as text". Save now closes the editor and refreshes the map editor's deck preview.
  - The picture builder has a ✓ Done button.
- **Tutorial cards keep their skills:** nothing is taken off any more, so your edited cards play as you made them.
- **Results card:**
  - The rank medal shows once, beside First Clear.
  - The Iron Shard and Base-growth pills are readable on the gold card.

## 2026-10-12 (11:00)
- **Winning keeps the board:**
  - A card that died in the part of the round skipped by the win now falls with the others instead of vanishing.
  - A card still flying in from the enemy's hand when you win lands in its slot.
- **Shout-outs:** unit emoji are about half as frequent, and only one shows at a time. When you win, the loser's units that never got to swing that round usually grumble; the ones that did only sometimes.
- **Tide:** the chips on Tide cards are just symbols now: 🌊⚔ on Flow, 🐚🛡 on Ebb, 🌊⚔🛡 on High tide. Flow gives +1 Attack and Ebb +1 Armor. High tide (+2/+2) comes as Ebb, Flow, Ebb, High, in boss and elite fights on water maps.
- **Shell:**
  - The badge is a 🐢, so it no longer reads as wings.
  - When it triggers, a pale-blue shell sweeps up the card over half a second, then "Shell!".
  - The unit can't attack for the rest of that round. Four small shields at the bottom of the card show it is up.
- **Swimmer:** it's now "If Tide →" one of Extra Attack, Quick Attack or Evade, chosen per card.
- **Poison** only lands when the hit gets damage through. A poisoner stopped by Armor poisons nothing.
- **Used-up triggers:**
  - An On Spawn or once-only trigger that has fired shines, turns grey, then fades off the card.
  - A trigger that is only off for now (Waiting, Stunned, Frozen, Asleep) stays grey.
- **Wandering merchants:** visiting one opens a short dialogue with the pack, its price and Buy / Not today.
- **Not obtainable** is worked out from the card's source; the Admin panel shows it as a status line.
- **Falling cards:** the red top edge falls with the card.
- **New card: Skull Vulture** (your PixelLab art). 1 Lumber, Wait 1, 3/4, Flying, Daunt 1, Nocturnal. It has no source yet (D51).
- **Art:** 9 more portraits. New: Eyrie Warden, Rockslide Ram, Peak Condor, Alpine Avalanche, Grizzly Vanguard, Blessed Avatar and Skull Vulture. Redone: Marsh Wisp (no longer a bear) and Soldier Ant. 183 cards have art.
- **Tutorial:** the combined slot uses 🎓 again.

## 2026-10-12 (10:40)
- **Raids:**
  - **Allies:**
    - Two allies fight with you: other raiders' decks when the cloud has them, the raid's ally decks otherwise.
    - The VS screen shows them, with their battle rating and castle.
    - In the fight one of them plays first each turn: into your middle row, your back row, or the front when there's nothing to stand behind. Their cards wear a 🤝.
  - **Castle:** your castle is all three castles at once (their Health added up and every passive merged), drawn a little bigger.
  - **Boss strength:** its cards are back up to 60% Attack and 70% Health (from 35% / 45%), since you have help now.
  - **Opening board:** the boss starts with its guards and just one card waiting, not a full board.
  - **Rows:** the middle and back rows are a bit smaller than the front (70%), no longer half size.
  - **Results:**
    - Every raid ends on the gold results card: "Raid complete!", or "👑 Absolute Victory!" in gold if you beat it.
    - The headline pill reads "1,125 damage dealt to The Goliath — Left Tentacle".
    - "Your damage still counts" is gone.
- **Castles in the Forge:**
  - Tempering moved out of the castle picker into Forge → 🏰 Castles.
  - A castle you get again counts as a duplicate, and fusing it banks credit toward its next levels.
- **Fuse all extras:** Forge → Upgrade has 🧩 Fuse all extras. It feeds every copy beyond what a deck can hold into its card's credit, and keeps foil, shiny and skinned copies.
- **Map music:** each kind of map has its own theme: meadows, water, volcano, caves, savanna and desert, snow, swamp, heights, deep forest. Caves are slow and eerie, with water dripping in the dark.
- **Inventory:**
  - Materia and enchant crystals sit in square slots: the icon, ×N in the corner, and the name when you rest on it.
  - Packs you have none of no longer show.
- **Hatching:**
  - The egg rocks three times, cracking more each time.
  - The light leaking out hints at the rarity: warm white for Common, green sparks for Uncommon, spinning blue rays for Rare.
  - Then it bursts and the card rises up close.
- **NPC speeches:** Admin → 💬 NPC speeches lists every conversation. You can change any line's words, who says it, or the reply buttons, and play it to hear it. A cloud admin's save publishes for everyone.
- **Deck builder:** the 0/2 copy counters sit 2px further right.
- **Fixed:** "Campaign Cleared" (and the maps-cleared count) were awarded for maps that have no fights yet.
- **Art:** 25 more portraits:
  - the redrawn **Duck Paddler** (a mallard paddling across a pond);
  - volcano cards: Pyroclast Wyrm, Magma Titan, Basalt Boar, Magma Salamander, Obsidian Scorpion, Cinder Hornet, Ember Jackal, Phoenix Fledgling, Sulfur Vent Crab;
  - Tide Spirit, Trapdoor Spider, Mountain Goat Climber, Beaver Lumberjack, Beaver Builder, Echo Keeper, Mallard Marauder;
  - War-Drum Mandrill, Golden Eagle Diver, Ravenous Wolverine, Gangrenous Leech, Chipmunk Stockpiler, Chipmunk Hoarder, Quill Volley, Bat Swarmling.

  Marsh Wisp came out as a bear, so it's being redrawn.

## 2026-10-12 (10:00)
- **Boomerang (your rules):**
  - On the way back it goes for the same unit it hit (or the castle again). If that unit is gone, it whiffs; a newcomer in the lane isn't hit.
  - Its speed on the way back is its Attack, so it usually beats Haste. Only a faster Fast Forward unit acts first.
  - At home, the thrower catches it (that's its attack for the round). If the thrower is gone:
    - a Boomerang ally in the lane catches it unharmed;
    - any other ally there takes the hit;
    - with nobody there, it hits your own castle.
  - The description ends "Don't fail to catch it!"
- **New passives:**
  - **Daunt N** (working name for your "____ N"): on hit, the target loses N Attack until the end of the next round. It stacks.
  - **Recoil N:** every attack also deals N damage to itself.
- **Sweep** shows 🧹N, not 🧹+N.
- **Deck shuffle** is a riffle: six full-size card backs split, slide apart and fall back in alternately. Nothing shrinks.
- **Initiative coin:** 10% smaller, and it rolls along the edge to the other side with an ease-in-out.
- **Leader slot tip:** "Your leader goes here. You always start with them…"
- **"That one looks tough"** now waits for the first Uncommon (or rarer) enemy unit you meet, and points at it.
- **Graveyard:** until pitching opens it's just "Graveyard", with no +1 Lumber. "Discard" only shows while you hold a card, once pitching is open.
- **Playback speed opens as you go:**
  - 1.5× after your first skirmish;
  - 2× after your first elite;
  - 3× after Map 2;
  - from Map 5 your chosen speed carries over to the next fight;
  - 4× after Map 15, 5× after Map 30.
- **Map backgrounds:** Clovermead and The Mycelium Deep have their own. Every map with art now uses it on its battlefield too.
- **Card workbench** (Admin → 🧪): any card with any art, rarity colour, foil, Starlight, foil strength, art style (framed, extended, emoji) and size.
- **Art:** Duck Paddler is being redrawn (queued next in your Chrome).

## 2026-10-12 (09:40)
- **Tutorial:**
  - **Decks:** part 1 uses your list exactly (11 cards), and part 2 adds the four cards you named (15).
  - **Skills:**
    - In part 1 no card has a skill, yours or the rival's (no Flying). Part 2 keeps only Swarm.
    - Both are set per part in Admin → Tutorial editor.
  - **Rival decks:** re-tuned for the plainer cards. With the computer playing your side, it wins about 92% as Otters or Both and about 83% / 78% as Hummingbirds.
  - **Tips are spread out:**
    - Part 1 order: your hand, playing a card, then the enemy castle, combat a round later, and your deck after that.
    - Initiative moved to part 2.
    - At most one other tip a round.
  - **Highlights:** your strongest card glows in your hand in part 1, and the leader slot glows in part 2.
  - **Traveller:** he calls "You almost got them!" near the end of part 1. In part 2 he says why he's helping ("You look like you need help…").
  - **After part 1:**
    - The 3 reward cards sit in the "Your first deck" grid and fly into the deck with the rest.
    - No toast; a pointer on the map shows Tutorial II.
  - **Both parts won:** they become one 🗝️ dungeon slot on the map, and a replay plays part 1 straight into part 2.
  - **Rushing in:** clicking quickly through the entry no longer leaves the side picker on top of the tutorial fight.
  - **Editing:**
    - The tutorial editor shows both parts' decks in full, with what every card does.
    - The map editor's Tutorial nodes show their real decks (they said "0 cards") and have a button into the editor.
- **Results screen:**
  - Won cards stay on one row, and the cards' half sits further left.
  - Their details open to the left, so they no longer cover what was unlocked.
  - With more new cards the reveals run faster (two: 15%, three or more: 30%).
  - A leftover tutorial tip no longer sits over the results.
- **Levels:** a new player is level 0 until the tutorial, then level 1. They were level 7 because maps with no fights yet counted as cleared; that XP is taken back from existing saves.
- **Before sign-in:** the front screen fans out 5 cards (3 on a phone).
- **Enemies:**
  - Only bosses, elites and champions keep summoning imps once they run dry. Everyone else surrenders or offers a draw.
  - With nothing playable, the computer now discards its weakest card for Lumber and keeps the card it's saving for. Before, it discarded at random.
  - It already couldn't play a card it can't pay for.
  - Resting on the opponent's deck shows their hand size and Lumber (and Stone or Energy when they have any).
- **Cards:**
  - The top-right corner mark is now the card's archetype only (🙏 Ecclesia, ⛧ Devilry, 🌫️ Scrapper, 🧬 Evolution, 🐝 Swarm, 🌊 Tide). Animal types no longer show there.
  - Stone costs read "🪨1" instead of "🪨1cost".
- **Codex:** phylum sort and filter open on Map 12 (5 maps after the Codex), and the Traveller explains phyla the first time.
- **Forge upgrades:** the Forge has 5 tiers.

  | Tier | Map | Temper limit | Rarest card |
  |---|---|---|---|
  | Village Forge | start | Lv 3 | Quest |
  | Iron Forge | 13 | Lv 4 | Super Rare |
  | Ember Forge | 16 | Lv 8 | Unique |
  | Dragonfire Forge | 26 | Lv 9 | Legendary |
  | Heartfire Forge | 31 | Lv 10 | Ancient |

  Each upgrade costs Maple Leaves and Dust. Limit breaks still wait for Map 50.
- **Battle rating:** the badge keeps a plain background; only its text takes the colour.
- **Hub:** a new 🃏 Decks tab lists the tutorial order and every tutorial, skirmish and raid deck.

## 2026-10-12 (08:30)
- **Art:** Beetle Battering Ram, Field Mouse, Fiddler Crab Swarm and Pelican Diver. 39 of tonight's 120 portraits are in; the rest keep generating in your Chrome.
- **Raids:** the action items now describe the boss's column attacks (a red glow on the column a round ahead).

## 2026-10-12 (07:50)
- **Tutorial rivals are fixed and weak:**
  - Otters face 4 Cobalt Talon Fledglings and 5 Otter Kits.
  - Hummingbirds face 6 Otter Kits, a Crossed-Eyes and 2 Pond Trout.
  - Both tribes face the same deck as Otters.
  - With the computer playing your side, part 1 is won ~86% of the time and part 2 ~75% before your leader joins (it was 11–65%, worst for "both").
- **Raid balance:** alone against a deck built for three, a raid was unwinnable (computer sims dealt ~0 damage). The boss's cards now fight at 35% Attack and 45% Health, and your castle is twice the trench wall (90). The boss's run-only copies also show properly on the board.
- **Raid specials in the full game:** the boss's telegraphed attacks are back. The column it will smash next glows red in your rows a round ahead, then every card of yours in that column, reserves too, takes the hit (your castle does if it's empty).
- **Art:** Crossed-Eyes, Rabbit Kit, Fox Kit, Cricket Drummer, Beetle Grunt, Meadow Frog, Antler Skirmisher, Mouse Sapper, Quarry Mole, Badger Berserker and Hedgehog Scout. Portraits drawn on a flat grey backdrop now have it cut away, so they sit on the card's own colours.

## 2026-10-12 (07:45)
- **Art:** 12 more Base cards have portraits (the rabbits, chipmunks, Harvest Mouse, Garden Snail, Pill Bug, Sparrow Chick, Earthworm, Guppy, Fleetfoot). Every card in the tutorial decks now has art. More are generating in your Chrome.

## 2026-10-12 (03:30)
- **Raids are a full match with three rows a side.**
  - Each side has a front, middle and back row.
  - A card can go behind one of your units. Reserves don't fight and can't be hit, and they step up a row at the start of a round when the column in front of them clears. Arriving at the front counts as arriving: On Spawn effects fire then.
  - The boss's guards hold its front, with more of its deck in the middle and back.
  - The trench minigame is benched; Admin can still open it.
- **Max Energy grows:** +1 for every 20 different skirmishes cleared, up to +10. The Energy pop-up shows how close you are (D40).
- **14A, The Mycelium Deep:** five fights under The Morel Hollow (Map 14). It appears two days after the Morel Monarch is first beaten (D41, built as I recommended).
- **Fix:** matches that run Open rules without saying so (the tutorial among them) now also draw Open rules on screen.
- **Action items:** every open item now has my pushback and my recommendation.

## 2026-10-12 (01:30)
- **Maps**
  - **Map 0 and a new Map 1.** The Outskirts are Map 0 now. A new meadow map, **Clovermead** (five easy fights with Base cards, boss The Old Hare), sits between it and Thistlewood, so every later map keeps its number.
  - Feature spots like the Armoury show as a dark **?** until the fight that opens them is cleared.
  - Curiosities, the well and the chat cave appear only after a fight is cleared (the map's first fight by default). In 🔗 Edit links, click a fight and then the tile to change which fight reveals it. No line is drawn to them.
  - Map tiles can't be spam-clicked, and their speech bubbles sit centred and follow the map when it moves.
  - A conversation already playing or waiting can't be queued again (the endless "Hear that hum?").
  - The **!** on a map feature fades once you've clicked it.
  - NPCs no longer end on a "…" line.
  - The map introduction shows the first time you ever open a map, not just the first map of a session.
- **Tutorial**
  - **Fixed decks.** Part 1: 3 Ducklings, 3 Honey Bees, 3 Silver Minnows, a Pond Duck and a Pond Trout. Part 2 adds a Duck Paddler, a Cottontail, an Acorn Chipmunk and a Chipmunk Forager.
  - **No leader in part 1.** In part 2 your leader introduces itself (only Okay closes it), its slot fades in with a fanfare, and a tip explains it.
  - An older saved tutorial setting can no longer bring back the harder castle Health.
- **Battle**
  - **Boomerang** flies home on its own:
    - out on the enemy side it hits whatever is in its lane now;
    - if the throw went into a unit that has since died, it's a **Whiff~**;
    - a throw into the castle hits the castle there and back;
    - if the thrower has died, an ally in its lane without Boomerang takes the hit, or your castle does if the lane is empty.
    - Its description is now one line.
  - **0 Attack is checked at every step**, not only at the start of combat. A Coral Polyp swings for 1 on Flow, and a mid-combat buff lets a unit attack.
  - **Fork, Trident and Octolash** aim from where the attacker stands. A Fork standing between two enemies hits those two, never one 1.5 slots away.
  - **Swimmer** can list what Flow gives it ("fastForward 1, armor 2"); without a list it keeps the extra turn.
  - **Ranks:** B from half your castle Health, C below half (S 90%, A 70%, B 50%, C 30%, D 15%).
  - **Fight buttons** read "Fight ⚔️ 6⚡" once, with no pill.
  - **Clock icons:** triggers that fire every turn show 🕐 instead of the bolt. Fields that act every round (Frost, Heatwave, Rain) wear a 🕐 on their bottom edge.
  - **Frost and tide:** a cold wave brushes the field before the frost bites, and the frost is thicker on +2 and +3 maps. Flow rolls a wave in across the field and Ebb drains it out.
  - **Spent triggers:** a trigger that can never fire again shines, greys and fades away. One that's only paused just greys.
  - **Sweep** has its own mark, 🧹.
  - **Worthy:** a Worthy unit's Lumber floats on the receiver's Lumber pill, not over the falling card.
  - **Battle log:** it reads top to bottom, follows the newest line and stays open across rounds.
- **Codex:** everything shows together by default. From Map 10 a "🗂️ Separated" toggle splits it into Base & Map 0, Maps 1–20, Maps 21–40, then every ten maps. Search is debounced and off-screen cards skip rendering.
- **Skirmish panel:** narrower, showing just the name with castle Health and Armour. The first-clear rewards are larger and labelled. A hidden deck is a dark slab with a lock and the rank needed, with no words and no show/hide.
- **Ranks after a fight:** the "Rank E ×0.6" pill is gone. The first F, E, A, S, SS and SSS each explain themselves once, and A, S, SS and SSS each get a cheer the first time.
- **One warning voice:** boss warnings are a single line, from Shieldback (Otters), Aurelia (Hummingbirds) or either (both).
- **Packs:** each pack wears a face from its own pool, and every booster in a bundle wears a different one. Packs no longer repeat a card while the pool has others, and recently pulled cards are much less likely.
- **Shop:** a "← Back to the map" button when you came from the map.
- **Art:** your PixelLab title screen is the new splash. 14 more D30 cards and the first 12 Base cards have art; more are generating in your Chrome.

## 2026-10-12 (08:10)
- **Skills**
  - **Trident 🔱** strikes left, centre and right; a side prong with no unit facing it hits the castle.
  - **Pitchfork** is Trident with Pierce: each prong carries on through the units behind.
  - **Sweep** stays a cleave: it never touches the castle, and does nothing when no unit stands in front.
  - **Octolash 🐙** (new): hits the 8 nearest enemy units.
  - **Rainmaker N** (new): brings N rounds of rain when it arrives. **Rainrunner** (new): +A/+H and unblockable while it rains.
  - **Moonborn** (new) and lunar phases: the moon changes every nightfall, shown only when a card cares.
  - **Frostbite** (new): frozen enemies get stronger.
- **Biomes**
  - **Wolfsbane Tundra** steps up: fewer frosty enemies at first, then frost-resistant ones the +1 Wait can't pick, then frostbite, then +2 freeze; the boss freezes +3 on three units of each side.
  - **Savanna:** the first Quick unit to swing each turn gets First Blood +1 (+2 at the boss). Yours can claim it first.
  - **Day and night** only show when a card cares about them. Night creeps across the field from the right and leaves the other way at dawn.
- **Battle**
  - Enemy cards fly in from the top of the board, where their hand is.
  - The leader always finishes landing at full height.
  - Your turn no longer ends after a pitch while your leader can still be played.
  - Castle shields count down hit by hit during combat, and sync at the end.
  - **Deaths:** the card tips backwards, picks up speed, hits the ground and throws up leaves, snow, sand or sparks by biome.
  - Hovering the field card explains it.
  - "Pride Queen joins you" shows once.
- **Tutorial**
  - It plays the open (non-collapse) rules and is much easier (your castle 16, the rival's 6).
  - The map opens zoomed in on the two tutorials, left and right. The rest of Map 1 appears once Tutorial 2 is won; the world map appears once Map 2 is first cleared.
  - Its tips are no longer lost at a match's end, and the completion screen is blue.
- **Start**
  - The title screen has no face warping and no paint duel; the PixelLab key art is generating.
  - Picking a tribe is lighter. "Both" appears after a minute with a fanfare: half Otter, half Hummingbird, plus a bonus Common card on Tutorial 2 and Brother Ripple, the otternarian, on making peace.
- **Shop and packs**
  - Only unlocked items show. At the start: one Acorn pack and a Bread (1 Lumber, does nothing, sells out).
  - A pack can no longer roll the same card again and again.
  - Advanced packs open 25 maps after their pack: 5 cards at 12× the price with 10× the foil and extended-art chance, plus 5 bonus cards.
  - The shop fits one screen, and only the page scrolls. NEW cards in a reveal are never greyed.
  - Bramble the courier mouse holds an unopened free pack beside the boss on the map.
- **Music:** nursery-rhyme songs on celesta, kalimba and marimba at home; separate battle, elite and boss themes.
- **Skirmish details** no longer hide the top panel.
- **Project:** the old code copies and the archived handoff left the claude.ai project (2.03 MB → 200 KB).

## 2026-10-12 (07:00)
- **Bugs from the cave screenshot**
  - **Win while the shield was up:** the castle's bar ignored its armour, so it read 0 while the armour had soaked the hits. The bar now spends the armour first.
  - **The Fight button flew off** when energy was short: the deny-shake now adds to the button's own position.
  - **Cave maps:** Home, the energy pill, the tab bar and the map title stay lit. The lantern keeps following the pointer after you click a skirmish, and the skirmish panel is only lightly darkened (it brightens under the pointer).
  - **Wait-0 enemy cards** no longer hit before they land. Their arrival strike plays after the card is on the board.
  - **Bites** crunch once, not twice.
  - **Fork:**
    - a miss on one prong no longer cancels the other (Blind rolls per prong, and Tipsy never moves a Fork);
    - its label shows 0.1 s before the damage number.
  - **Revive wings:** lower, narrower and silver, with a halo between them. Revive also gets a ↺ mark; Evasive gets 🍃 and Tide 🌊.
- **New skills:**
  - Swimmer (an extra turn on Flow);
  - Inspiring N, Friction N, Worthy N;
  - Lumberjack, Heavy Metal, Timber, Rock-solid, Iron-will;
  - Loyal and Usurper (leader-conditional, with granted skills);
  - Metal and Uranium resources;
  - Stone, Metal and Uranium costs now charged.
- **Changed skills:**
  - **Tailwind** also speeds your Flyers.
  - **Rage** doubles castle hits too, and shows an ember ½ shield.
  - **Shell** is reworked: any hit (arrows too) raises +N Armour and N temporary Health until the end of the next round, with no attacking meanwhile. Green shields glow in.
  - **Pitchfork** picks off the weakest facing unit, and a kill carries on.
- **Card data:**
  - the 17 Lumber-on-arrival cards now use Worthy;
  - 9 sea swimmers got Swimmer;
  - 15 new cards: Conch Crawler, Conch Herald, Shoal Shark, Malachite Golem, the three Irradiated cards, Heartwood Treant, Quarry Troll, Iron Warden, Badger Lumberjack, Ore-Smelter Mole, Sworn Shieldbearer, Crown Pretender, Grindstone Boar. All are unobtainable until ticked.
- **Tide is clearer:** Tide units show 🌊+1 / 🐚−1 and their real Attack on Flow.
- **Progression:**
  - Forge levels 5–8 open at Map 16, 9 at Map 26, 10 at Map 31; limit breaks at Map 50;
  - level 0 → 1 costs a mote of materia;
  - quest cards start at level 0;
  - a cave map you've cleared gets a 30% wider lantern and 10% less darkness.
- **Pitching opens after Map 1:**
  - before then, the Graveyard does nothing and shows no tip;
  - Lumber-cost cards earned meanwhile arrive when it opens;
  - after a pitch with nothing castable, the turn passes by itself.
- **Board:**
  - the camera holds still while the cards fit the middle five columns;
  - rows of 8+ tighten their spacing, and 21+ overlap by 20%;
  - the leader's crown and beam stay on the card;
  - on a win, tokens on both sides shatter at random moments;
  - tiny cards keep Attack at the bottom and drop the ⚔/❤ glyphs.
- **Skirmish editor:**
  - layered bonus health (L1–L4, blue to pink; each layer above 0 opens the next);
  - card levels per card in the deck.
- **Admin:**
  - 👑 Auto-win in a match;
  - ✅ Mark cleared / Clear the whole map on the skirmish panel;
  - 🎁 Get this card in the Codex.
- **Map chats:**
  - 19 new curiosities across Maps 1–11 (two per map at most);
  - replies that offer to take you somewhere now do it (the Nest, Notices, Codex, Forge, Shop, Arena, Test Lab);
  - no answer ends a chat kindly and it plays again next time.
- **Late side maps:** a side map can now appear N days after a clear, or after a quest.
- **New note:** [Progression to Map 60](progression-2026-10-12.md). It covers the level gates, the road after Map 20, card counts (235 different cards on Maps 1–20), and a max-energy and Town proposal.
- **D30:** the 22 card portraits are generating overnight on your PixelLab plan.

## 2026-10-12 (05:00)
- **All cards are unobtainable for now**, so we can build the list together.
  - 343 cards carry `unattainable` and can't come out of packs, rewards, finds, crafts or promotions.
  - Base, starter and tutorial cards, tokens, tests, materia and the hero stay obtainable, so a new player can still play.
  - Untick per card with the editor's new **Obtainable** box. Admin's Codex tags the rest "⛔ Not obtainable".
- **Codex: View by Advancement** (now the default): Base, Map 1, Map 2…, Pack A, B…, the faction pools, Mystery Pack A, Events, then "Not obtainable yet". It's also a sort option.
- **Fork never strikes straight.** It hits only the columns left and right of the one in front, and an empty one sends that swing to the castle.
  - Its mark is one light-red ⇔. Its attack preview shows just the two side lines.
- **Boomerang replaces Anti-Air** (no number). The throw is its attack; next round the boomerang comes back first, before anyone else, as that round's attack. It never misses a flier.
  - Otter Centurion and Net Thrower have it.
- **Initiative coin:** a small gold coin on the battlefield's left edge, on the half of whoever strikes first on an even face-off this round.
- **PvP:**
  - It always plays normal rules, never collapse.
  - PvP tickets come back one an hour, up to 10.
- **In a match:**
  - Pitching your last card no longer ends your turn while your leader can still be summoned.
  - The leader is greyed out until you can afford it.
  - A card can lead or sit in your deck, not both.
  - Cards that arrived in the final round stay visible through the victory.
  - Combat already stops at the castle's fall.
- **Type mark:** each card shows its first type's icon in the top-right corner, sliding beside the Wait badge while there is one.
- **Deck editor** shows only cards you own.
- **Boosters:**
  - Packs on the opening table are crimped foil wrappers with the cover art, a sheen and the pack's own metal, in balanced rows (5+5, 3+3…).
  - The card summary is balanced the same way.
- **Card preview:** the hover preview is never greyed out, and the stray "Caustic Scorpion" browser tooltip on the skirmish panel is gone.
- **Player levels are about twice as slow:** 200 + 50 per level, plus a gentle 1.12^L part that only takes over past level 40. Level 10 takes ~3,700 XP (was ~1,900).
- **Entrance screen:**
  - The panel and the cards sit closer to the middle.
  - The three cards deal face down and flip one by one with a sound.
  - A swapped card spins to its acorn back as it fades, then returns with a card sound.
  - "Enter the Grove" goes straight in, with no Start step.
- **Tutorial, in two parts.**
  - **Part 1** (the basics):
    - It plays normal rules, with no leader and a plain enemy castle.
    - You can't pitch during "play a card", and that tip closes the moment you play.
    - The "your castle" step is gone, and a new step teaches the initiative coin.
    - The Wait tip points at the Wait number, with "Wait" marked as a game word.
    - The enemy never gets Bee Tanks.
    - A loss says so plainly, and the account's achievement news is hidden on tutorial results.
  - **Part 2** waits on the map's 🎓 marker, to start yourself.
    - You play your starter deck with your leader against the Outskirts Watchtower, whose passive gets its own tip.
    - A friend remarks on flying (Hummingbirds) or boomerangs (Otters).
    - Winning gives the Ally Pack and the "training wheels are off" talk. Both parts then share one 🎓 slot that replays part 1 straight into part 2.
- **The Golden Bramble Case is on sale** once the Gilded Caravan is found; a merchant's pack is never stuck at "Coming soon". A dungeon's next castle no longer surrenders the moment it rises.
- **Bosses and elites:** in a boss fight every enemy card shows its extended art; in an elite fight they carry a new subtle lacquer finish. The same goes for the skirmish panel's card.

## 2026-10-12 (03:10)
- **Sweep, reworked to your rule.**
  - With a unit in front, it swings left, then centre, then right. An empty side is a miss you can see: the unit lunges at the empty slot and the air gets slashed. It never redirects.
  - With nothing in front, it hits the castle.
  - Its attack preview shows three lines, the side ones thinner, with a ring on an empty slot.
- **Swipe is now Fork** (the two-flank strike, unchanged); all 11 cards were migrated.
  - **Swipe** is new: a landed swing steals N Lumber from the opponent.
- **New skills:**
  - **Twin Strike** attacks twice on its turn.
  - **Converge** (on ready) pulls the enemy board, your board or both together around the centre, keeping their order.
  - **Defiance** (types, N) adds +N Attack for every enemy unit of those types.
  - **Pack N** adds +N Health on arrival for each ally of its type.
  - **Swarm N** gives N per ally (default 1).
- **Combat stops the moment a castle falls.** Later attackers used to keep swinging, so a card the enemy had just played could die unseen and vanish during the victory.
  - The enemy's card also finishes landing before combat starts.
- **Day and night (D33):** no more switching. Conquest fights are day, except on four night maps. Real time with a doubled twilight is a skirmish-editor option.
- **Conquest map:**
  - A link between two locked fights is dark. A link from an open fight fades out toward the locked one.
  - Cave darkness now covers the whole screen; the map list and tabs stay readable, a little dimmed.
- **Energy:**
  - The pill reads "4/20⚡ · +⚡ in 2:47".
  - With too little Energy, a fight button plays an error sound and shows "You don't have enough energy" in the middle of the screen for 2 seconds.
  - Admins get −5/−1/+1/+5, Empty, Fill, Set and Next refill now in the Energy panel, even with Admin mode off.
- **Card slots** fade in the moment you press a card and fade out properly.
- **Lore:** a sketch of five subfactions and the dragon thread in the [lore bible](lore-bible.md).
- **Action-items lap:**
  - Wildpaths now counts Path points (D32, my suggested default): 1 per map cleared, +1 per boss S rank. They show on the Wildpaths page; spending waits until the trails leave preview.
  - Fast Forward gets a ⏩ blur.
  - Pack gets its +Health pulse.
  - D33 is closed. D36 (tonight's skill readings) is added.

## 2026-10-12 (01:40)
- **Your map table, applied** ([note](map-schedule-2026-10-12.md)). Features open on the maps you listed:
  - Armoury 1, Nest 2, Notices 4, Cart 5, Codex 7, Arena and the Ember Peddler 8, Quest Board 9, Forge 11.
  - Map 13 opens Raid 1, a new Gilded Caravan (Golden Bramble Cases) and the Wanderer's Camp.
  - Then the Gauntlet on 16 and the Test Lab on 21.
  - Seven new unlock conversations. Existing saves keep what they had.
  - Free packs on boss first clears: Maps 3, 7, 10, 11, 13, 15, 16, 18 and 20. The tutorial gives an Ally Pack.
  - Missing dungeon sub-maps (6A, 9A, 12A, 14A–D, 15A, 18A) are listed in the note.
- **Errands: mini-quests from conversations.** From Map 9, someone on the road sometimes asks a favour after a Conquest win.
  - Yes pins it to a new Errands board on the Notices. Not now leaves it there as an offer for the day.
  - Up to 3 at once, paid in Dust, Maple Leaves and sometimes an Iron Shard.
- **Limit break.** A level-10 card that has been fed 5 duplicates can break to Lv 11 for its whole road's cost again (+10%).
  - Castles break 20 → 25 with Ember Cores, and a Dragon Scale for the last step.
- **Base cards grow from bosses.** A boss's first clear levels up to 2 Base cards in your deck, and an elite's gives a spare copy. When nothing can grow, it comes as Dust.
- **The Codex shows only what you've met:** cards you own or have seen, plus a pack's cards once its seller is open. Materia are Inventory items, not Codex cards. Admin still sees everything.
- **Tutorial spotlight.** Guided steps darken the screen around their target and mark it with a pulsing red ring (and a pointing hand when you have to act).
  - New tips teach triggers: greyed ⚡ = off while Waiting, Stunned, Frozen or Asleep; lit = ready.
  - Natural Leader no longer gets a tip.
- **Map ambience.**
  - Every map plays its own arrival sound.
  - The beach gets soft footsteps about once a minute.
  - Ambient extras start at a random point, so you hear them early too.
- **Mystery Boosters** sell only while the wandering trader is around, up to 5 a visit.
- **The master hub** is now also a hidden, unindexed page on the game site (`/hub/`).
- The Forge preview now uses the same per-level stats as matches.
- **Fast Forward N** (D22, action-items lap): before its first combat, a unit takes N extra turns on its own (Wait −1, or a swing), then joins the normal order. Stun, Freeze or Sleep wipe the counters. It's in the editor's skill list and the battle log; no card carries it yet.
- Action items: D22 and D31 closed; D34 (map-table readings) and D35 (Base growth numbers) added.

## 2026-10-12 (00:30)
- **Battle rating replaces deck level.** Each card counts its rarity weight × its level factor, and the leader counts double. The weights follow the Forge ladder: Common 1, Rare 4, Epic 11, Ancient 30; Base 0.5.
  - A new starter deck rates 24–29. Map 20's par is 400. A full level-10 Ancient deck is about 2,500.
  - Enemy fights show the rating you should bring. It's about 12 at Map 1 and climbs ~20% a map; elites are +15%, bosses +30%. The skirmish editor can set a fight's own.
  - Shown on the skirmish panel, both versus screens, deck lists and the deck builder. Translated into all 12 languages.
- **Forge economy v2, in Materia Units** ([note](forge-economy-v2-2026-10-11.md)). 1 MU = a Common from level 1 to 10 (675 Dust + 450 Maple Leaves).
  - **Levelling by rarity:**
    - ×1 / 2 / 4 / 6 / 8 / 11 / 14 / 17 / 21 / 25 / 30, Common to Ancient.
    - Base, Quest and map-reward cards ×0.5, Event cards ×1.5, heroes ×2.
    - Castles cost 4× in all: levels 10–20 at three times the price.
  - **Duplicates:** Forge → 🧩 Feed a duplicate banks 1/N of the card's 1→10 cost on it. N is 18.75 up to Super Rare, 17.5 to Unique, then 15, 13 and 10 for Legendary, Mythic and Ancient.
  - **Disenchanting:**
    - A copy melts for 0.25% (Common) to 10% (beyond Ancient) of an MU.
    - Foil finishes (+1 to +3), extended art, skins and Shiny multiply it.
    - **Melt down** takes a card back to its starting level and refunds 97% of its levels. Base, Quest and Event cards can't be melted.
  - **Income:**
    - Daily notices and weekly quests give ≈6.6 MU a week (≈28 a month).
    - Achievements give 10–50% MU.
    - First clears: 3% (skirmish) to a whole MU (campaign boss).
    - Boosters give a flat 1.5–4.5%.
    - Raid Dust is ×3.
  - Prestige, foil treatments, Blacksmith recipes, Materia crystals and Promotion cost 5× to match.
- **Card Ledger:**
  - Lists every rarity, including Very Rare, Super Rare, Quest, Quest-Unique and the special ones. Each has its colour and proper name.
  - New column: what each card costs to level 10, in MU.

## 2026-10-11 (23:50)
- **Plays left:** in a fight with more than one action a turn, a "▶ 1/2 plays" pill sits beside your Lumber. It counts down as you play and resets each round.
- **Versus screens on phones:** the boss opener's top/bottom split and the Arena versus screen kept the desktop's sideways split on phones. Both now split top and bottom, with the glowing seam across the middle.
- **Tests:** the UI smoke test now casts Tailwind from the hand (Wait −1, the turn ends, it's logged) and straps the Bramble Gauntlet onto a unit.

## 2026-10-11 (23:20)
- **Card editor: Card kind.** Unit, Spell or Equipment.
  - A spell picks Hasten, Mend or Sap and an amount.
  - Equipment picks the skill it grants (and its value).
  - The Spell / Equipment type tag is added for you.
- **The CPU uses the new card kinds.**
  - It casts a spell only when the spell would do something now (units still waiting, units hurt, enemies to sap). Otherwise it holds it.
  - With its play still free, it straps equipment onto its strongest unit (before, enemy equipment sat in hand forever).
- **New cards measured:**
  - **Bramble Gauntlet** wins 48% (in band).
  - **Thornwood Palisade** measured 38% at 2/18, so it's now **4/22, Counterattack, Spiteful 2** (53%, in band for Rare).
  - **Pyroclast Wyrm** with Pierce 5 is unchanged at 49%.
  - Spells aren't measured: a test deck of 8 spells has too few units for the number to mean anything, so the Ledger shows "not measured".
- **Shipping ledger commits:** `tools/card-ledger/ship.js` applies pending Commit-button commits to the card file, oldest first. It skips any field that changed since the commit was made, so a stale commit never overwrites newer work.
- **New decision D33:** day and night being off by default means 65 enemy decks' Nocturnal/Diurnal cards never get their bonus. Turn the cycle on for those fights? (Action items.)

## 2026-10-11 (22:40)
- **Renamed keywords:**
  - **Puncture N** (was Pierce): every landed melee hit also deals N damage to the enemy castle.
  - **Pierce N** (was Rend): every melee hit ignores N of the target's Armor. Pyroclast Wyrm has Pierce 5, which covers every Armor in the game.
- **Perforate N:** Pierce N + Puncture N + N Bleed, and the hit strips N Armor from the target for good.
- **Counterattack:** the unit never attacks on its own. Each time an enemy unit hits it, it strikes the enemy in front of it.
- **Spiteful N:** any enemy unit that damages it (attack, arrow or skill) takes N back.
- **New cards** (all in Pack 1):
  - **Tailwind 🍃**, the first **Spell**: 1 Lumber, all your units lose 1 Wait.
    - A spell never takes a place on the field. Casting it uses your play for the turn.
    - Spells can also Mend (heal your units) or Sap (enemy units lose Attack).
  - **Bramble Gauntlet 🧤** (equipment): +1/+2 and Spiteful 2.
  - **Thornwood Palisade 🪵** (structure): 2/18, Counterattack, Spiteful 1.
- **Actions per turn** (a new fight modifier in the skirmish editor; Arena rulesets can use it too):
  - Each side may play N cards a turn. The turn waits until you've used them, or you end it.
  - The side playing second gets N extra cards, N−1 castle Health and N−2 Lumber.
- **Natural Leader:** the Wandering Traveller's leader skill has its new name.
- **Guardians** wear riveted steel plates braced out from both sides. A card with **Revivification** carries a pair of white wings until its revive is spent.
- **Status keywords in card text:**
  - Poison, Bleed, Decay, Corrode, Frozen, Asleep, Paralyzed, Stunned, Blind, Tipsy, Confused, Shocked and Staggered are named in their own colour (Poison in green, Bleed in red…). Their rules are no longer repeated inside each skill.
  - Under the skills, a hairline and a short glossary explain each status that came up.
- **Fight costs:** the Conquest Fight button shows its Energy as a pill (e.g. "1⚡"). The "tickets left" pill on the result screen was hard to read; it is now dark on light.
- **Versus screens:**
  - The pre-fight screen shows the enemy deck's level, coloured by how it compares with yours.
  - Both versus screens keep their green and red. They now add a glow behind each side, a fine diagonal weave, slow light rays from the centre and a glowing seam down the split.
- **Difficulty curve re-measured with day/night off:**
  - The climb holds, from about 24 at Map 1 to about 63 at Map 23.
  - The Ashen Peak (Map 5) had jumped to 44 and was re-tuned to 37. Its castles got lower Health, and Caves & Alcoves (Map 6) got small Health nudges. Hub → 📈 Difficulty is updated.

## 2026-10-11 (21:30)
- **Day and night are off by default.** A fight turns them on in the skirmish editor (Day & night: cycle day-first or night-first, always day, always night) with **Switch every N rounds**. The daily Arena rulesets keep their own day/night rules. Nocturnal and Diurnal cards only get their bonus while a cycle runs.
- **The "ghost" sound was the nightfall howl.** It's now a reedy wolf's voice: a sawtooth through a moving "oo–ah" formant, a scoop up into a long held note, a light wobble and a falling tail.
- **Rare lava ambience:** on The Ashen Peak, Basalt Foundry and The Sundered Peak, a lava bubble pops and its spatter sizzles about every 15–26 seconds.
- **Deaths:**
  - The bleed-out colour wash now sits inside the card and moves with it, not as a box over the slot.
  - A shattering token takes its whole slot with it; no frame is left behind.
- **Statuses:**
  - **Tipsy** swings left, ahead or right at random and misses an empty column.
  - **Confused** fizzles its triggers and on-hit skills half the time.
  - **Blind** now misses half the time.
  - The new passives **Drunk 🍺**, **Purblind 🕶️** and **Scatterbrained** keep the card Tipsy, Blind or Confused for good.
  - On-hit **Make Tipsy** and **Confuse** skills.
- **Triggers:**
  - Reactive triggers are offline while a card waits, is Stunned, Frozen or Asleep (greyed ⚡).
  - The new **Primed 🔋** passive keeps them online.
  - Wandering Traveller makes Lumber only the first time it readies.
- **Swarm** is now +1 Attack per matching ally, updated live as allies arrive or fall. In the editor it can count any shared type or only the types you pick.
- **Skill wording:** effects last for good unless they say "until end of turn". "Permanently" is gone from descriptions and the log.
- **Your second match teaches the 1-second card hover.** Once the enemy fields its toughest card, a tip points at it and play waits until you rest the pointer on it and its details open. It offers Skip after 12 seconds.
- **Ranks:**
  - E ×0.6, D ×0.8, C ×1 (a win with about half your Health), B ×1.05, A ×1.1, S ×1.11, SS ×1.12, SSS ×1.13.
  - Losses rank F, FF (their castle took 2 or less) or FFF (1 or less, units included).
  - The multiplier only touches repeat rewards, never first clears.
  - Each rank's tooltip says how it was earned.
- **Conquest:**
  - The top-left map note fades away for 10 seconds when you hover it.
  - The map editor bar opens from a 🚨 button that only admins see.
  - The skirmish panel starts at the top with "Cleared" on its top row. It has a faint green border once beaten, and red when the enemy far outlevels you.
  - The nav buttons hide while a skirmish is focused.
  - The between-maps loading veil shows only on the first map load of a session.
- **Energy:**
  - Play buttons, post-fight windows and Conquest show their Energy cost on the button.
  - Clicking Energy opens a panel: "+5 Free energy!" once a day, or "Get more energy!" for admins. Energy can sit above the cap (22/20).
- **Test → 🎨 Card Decorator:**
  - Pick a card from your collection.
  - Change its art frame, rarity frame, biome trim and foil.
  - Tune foil strength, ice crystal lines, hue, saturation, band angle, glare and colour set (Rainbow, Ice, Ember, Verdant, Silver, Dusk).
  - Copy the spec to keep a look.
- **Card object audit** (docs/card-object-audit-2026-10-11.md):
  - Cards are lean (about 20 elements on the board) with no hidden subtrees.
  - Floating tips (card details, delayed tooltips, the deck tooltip) now follow the card they describe through one watcher (`TipWatch`). They fade with it and close as soon as it's removed, hidden or faded out, without per-card fade hooks.
- **Version and card-data check:**
  - Each build stamps its id and its card-data hash, and writes them to version.json.
  - Once a session the game compares: a newer build offers **Update**; a hash mismatch reports damaged card data and offers **Reload**.
- **Card Ledger:**
  - The table shows the stats the game actually uses, with your change in a separate "→" box.
  - **Commit** queues the stat edits as a commit in the ledger, marked "committed" until Claude ships them into the game's card file.
  - The game also accepts patch-style card overrides for that path.

## 2026-10-11 (18:10)
- **The original maps are back as Maps 1–13, in their old order; the new maps follow as 14–23.**
  - 1 Bramblewood Outskirts · 2 Thistlewood · 3 Pebble Beach (+ 3-A Smugglers' Grotto) · 4 Sunken Hollow · **5 The Ashen Peak** (a main map again) · 6 Caves & Alcoves · 7 Savanna Reaches (+ 7-A The Canopy) · 8 Wolfsbane Tundra · 9 Coral Current · 10 Sable Swampmire · 11 Basalt Foundry · 12 Eyrie Heights · 13 The Sundered Peak · 14 The Morel Hollow · 15 Lilypad Reach · 16 Gannet Cliffs · 17 Gatorback Swamp · 18 The Kelp Mangroves · 19 The Briar Maze · 20 The Redwood Deep · 21 The Long Grass · 22 The Pinewood Taiga · 23 The Glass Dunes.
  - Maps count from 1 again, as on the world screen. Fight codes read N-k, side maps N-A-k, and the tutorial is 1-0.
  - The Traveller's Cart is on Map 3, the Ember Peddler on Map 11 (Basalt Foundry), and Whisper's Game on Map 5 after 5-2. The rare S-rank find starts at Map 5. The first egg is a Water egg on Map 4.
  - A map you've already fought on stays open, so nobody loses progress.
- **The road now climbs.** Every fight was tuned against a target difficulty index that rises from about 18 at Map 1 to about 62 at Map 23. Elites sit above their map's skirmishes, bosses higher still. The tuner is the new tools/curve_tune.js.
  - Measured map averages climb from **22 (Map 1) to about 60 (Maps 20–23)**, with small dips at Maps 10–11 and 21–23.
  - The Starter deck's win rate falls from 43% to 2%, the Mid-road deck's from 94% to 43%, and the Strong deck's from 97% to about 65%. Hub → 📈 Difficulty has the chart.
- **Menu:**
  - **Raid** has its own tile beside Arena on Home, and sits beside Arena in the Play tabs.
  - **The Autobattler** (Whisper's Game) moved into the Arena page.
  - Once Raids are open, the Nest becomes a pinned note so the grid stays even.
- **Raids open at Map 12.** The Raid Banner and Wound Reaver's Domain come after Eyrie Heights' boss, and the Deep Troll King's Domain after the Sundered Peak's. Players who already opened Raids keep them.
- **Faction packs, reworked:**
  - The Otter, Hummingbird and shared Riverbank cards are now in the three basic packs (Sprout Pouch, Acorn Chest, Golden Bramble Case).
  - **Your faction's pack** (2 cards of your side, 1 general card) comes from every boss's first clear. It can't be bought, and Food tokens are retired.
  - **Subfactions:** beating an elite of one of the five peoples (Road-folk, Wild beasts, the Hive, the Deep, Woodland folk) collects that subfaction the first time and gives its bundle (2 of their cards, 1 general). The Shop shows which you've collected.
  - Repeat elite and boss wins have a 5% chance of the same pack.
- **Card Ledger and the Difficulty tab** use the game's own fight codes (Map 4 · 4-2, not Map 6 · 2-2).

## 2026-10-11 (17:10)
- **Hub → 📈 Difficulty: the difficulty curve.** Three reference decks play all 175 fights on the road (60 games each, side maps included; raid bosses are left to the Raid editor):
  - **Starter:** the deck a new Otter player actually starts with.
  - **Mid-road:** built from Base cards and every map reward up to Map 10.
  - **Strong:** built from everything you can own.
  - Mid-road and Strong are built by simulation: cards are ranked by their measured win rate, then a hill-climb keeps any swap that wins more across a spread of fights.
  - **Difficulty index** (0–100) for each fight averages four things: how often each deck loses, and how much castle Health the Strong deck loses. Two fights the Strong deck always wins still differ by what they cost it.
  - The tab charts every fight in road order with each map's average, shows each deck's win rate by map, and lists what breaks the climb. Below that are the three decklists and a sortable table of every fight.
  - Re-run with `node tools/difficulty_curve.js`, then rebuild the hub.
- **What the curve shows today** (map averages):
  - **Maps 0–5 are flat, around 18–31,** and Maps 4 and 5 (Pebble Beach, Gannet Cliffs) are the easiest on the road. They're easier than Map 0.
  - **A step at Map 6** (Sunken Hollow, 43), then a climb to about 53 by Map 9.
  - **A plateau around 49–55 from Map 9 to Map 21.** Map 11 (Eyrie Heights, 56) is the peak, and Map 10 dips to 44.
  - **Outlier:** 17-A y-3 Sloth Boughs (a skirmish at 64) is harder than the next map.
  - The Starter deck wins 29–36% of Map 0–3 fights, so the first maps lean on the rewards you pick up.
- **Card Ledger:** a new artifact, an editable sheet of every card's stats, source and balance-run win rate. Say "apply the card ledger" to put its edits into the game.

## 2026-10-11 (16:30)
- **Why the late maps were easy: the computer couldn't afford its own cards.** The Sundered Peak decks held 4-Lumber Cave Warlords and Cataphract Destriers, and the Basalt Foundry 3-Lumber Magma Titans, with nothing in either deck that makes Lumber. Adding a Lumber maker fixed most of them without touching Health:
  - **New card: Cinder Stoker** 🦎 (Common, Volcanic, 0 Lumber, 1/7, +1 Lumber when it arrives). It's in the Basalt Foundry's 9-5, 9-7 and 9-8, and won at 9-9 Slag Runners.
  - **New card: Pack Mule** 🫏 (Common, Horse, 0 Lumber, 1/9, +1 Lumber when it arrives). It's in the Sundered Peak's 11-5, 11-6 and 11-8, and won at 11-9 Panther Ledge.
  - **Beaver Builders** join the Tundra boss (t-7), as on the other Tundra fights.
  - **Results:** 11-5 and 11-6 went from 78% and 72% to about 50% (target 45%). The Tundra boss went from 52% to 38% (target 35%). Basalt Foundry 9-5 is 56%, 9-7 44% and 9-8 44%.
  - Both new cards have art prompts queued with D30 and show their emoji until then.
- **Eel Nest (7-7)** now holds eels: Riptide Eels, Coral-Current Eels and Moray Ambushers, plus a Coral Polyp Colony for Lumber. It went from 72% to 58% (target 45%).
- **Map 3, Lilypad Reach, now teaches two skills** (it introduced none):
  - **Evasive:** Camouflage Frog moves from the Ashen Peak (a frost map) to the Pond's frog fight, p-5, where you meet it and win it.
  - **Reach:** two Riverstone Slingers join p-6, the answer to the Pond's flying ducks.
- **Whole road:** 2 of 175 fights are now more than 12 points off target, both easy by 13 points (3-6 and 7-7). Earlier today it was 32. 8-3 was retuned after the Willow-o'-Wisp went in (now 76% vs 68%).
- tools/retune_all.js gains `--keep=…` (never trade these cards away).

## 2026-10-11 (15:40)
- **New card: Willow-o'-Wisp** 🌑 (Uncommon, 1 Lumber, Wait 1, 2/6, Nocturnal). A beetle made of shadow, of the new **Shadow** type (also Insect and Forgotten).
  - When an ally dies, it gains +1/+1 (once Ready).
  - When it dies, it exiles 2 cards from your graveyard (+2 Echoes for Remember cards).
  - You meet it in 8-3 Toad Chorus in the Sable Swampmire (Map 9, the Exile and Remember map), and win it there.
  - Without art yet, it shows as a dark silhouette with a cold glow. Its art prompt is queued with the faction-pack prompts (D30).
- **Triggers show when they're off:**
  - Every custom trigger now shows as **⚡→ what it does** on the card's bottom strip: ⚡→🐝 spawns, ⚡→💪 buffs, ⚡→🪦 anything to do with the graveyard, ⚡→🏹 arrows, ⚡→🪵 Lumber, and so on. These replace the separate per-action icons. Hover one to read the trigger.
  - **The rule:** reactive triggers (On Attacked, On Ally Die, Per Turn, On Ally Spawn and the like) are off while a card is still Waiting. Their ⚡ is grey, and it sparks on when the card becomes Ready. On Spawn, On Ready, On Death, On Exile, On Attack and On Kill always fire, and their ⚡ stays lit.
  - Card text says "(once Ready)" on reactive triggers. In the card editor, "also while Waiting" lets a trigger opt out (this replaces the earlier "once Ready" tick box).
  - Only one existing card plays differently: Feral Tuskboar's "+1 Attack when attacked" now starts once it's Ready.

## 2026-10-11 (14:50)
- **Late-map balance pass.** Thirty-two fights came out more than 12 points too easy in the simulator (the new-player deck model). Nine still do, and none are too hard.
  - The fights that hit the castle Health cap (240, the campaign boss 300) now trade cards instead.
  - Trades stay on theme. A fight borrows only from maps of the same biome up to two maps ahead (the Tundra takes taiga lynxes and wolverines, not savanna zebras). The volcanic maps take only cards that share their main types: Basalt Foundry stays volcanic, arachnid and elemental; the Sundered Peak stays bears and horses; the Ashen Peak stays frost, rodents and apes.
  - Epic-and-rarer cards are never traded away, and Magma Titan stays in the Basalt Foundry by hand.
  - A trade is kept only if it moves the fight toward its target.
  - **Still too easy (your pass):** t-7 Tundra boss (52% vs 35%), 3-6 (48% vs 35%), 9-5, 9-7 and 9-8 at the Basalt Foundry (about 75%, where the themed cards are expensive and the CPU can't always afford them), 11-5, 11-6 and 11-8 at the Sundered Peak, and 7-7 on the Open Sea.
  - tools/retune_all.js gains `--swaps=N`, `--cap`, `--borrow-next=K`, `--borrow-biome`, `--theme` and `--keep-rare`.
- **Codex → Reference → Skills along the road:** each skill sits under the first map whose enemies carry it. Skills you've met read in full; the rest show as ?, and maps you haven't reached just say how many there are to find.
- **Translations** for the new strings: Skills along the road, the Changeling label, Keen Eye, Tempering Stone and the Forge notes.

## 2026-10-11 (12:45)
- **Scraper of Skies** only releases bees once it's Ready (built). Custom triggers get a new "once Ready" tick box in the card editor, so any trigger can stay silent while its card is still Waiting.
- **Board camera:**
  - A summon now plays first; the camera zooms out to fit afterwards. It waits until no summon or card move is playing (about 2 seconds at most), then drifts to the new framing over about 0.8 seconds. Only a new match frames instantly.
  - When the cards bunch to one side, the camera leans a little toward them (about 40% of the way, never pushing a card out of frame) and turns up to 3° the same way. Reduced motion and the Low effects setting keep the lean and drop the turn.
- **Changeling disguise and Keen Eye 👁️:**
  - An enemy Changeling now looks like an ordinary Common critter, with its real numbers, until it strikes or is struck. Then it's unmasked with a shimmer and a "🎭 Changeling!" label.
  - New skill **Keen Eye**: while one is on your board, enemy Changelings show as themselves, and it hits them for 2 more. On Owl Sentinel, Fawn Scout and Warren Scout.
- **Material gates on the last levels:** levels 7–10 of Epic-and-rarer cards each need a 🪨 **Tempering Stone**, and level 10 of a Mythic or Ancient card also needs a 🐉 Dragon Scale. Stones come from boss first clears (raid and campaign bosses give 2), 5% of repeat Elite and Boss wins, and the Blacksmith, which smelts one from 3 Iron Shards and a River Pearl.

## 2026-10-11 (11:20)
- **Forge pacing** (`docs/forge-economy-2026-10-11.md`):
  - Levelling now costs more for rarer cards. A Common is still 690 Dust to level 10 (about a week of Dust for a regular player); a Rare is ×1.5, an Epic ×2.5, a Legendary ×4.5, a Mythic ×6 and an Ancient ×8.
  - Castles have rarities now (the plain Castle is Common, the early map castles Rare, the later ones Epic, Coral Spire Legendary) and cost more to level as they get rarer: a Rare castle takes about 2,400 Dust to reach 20.
  - The free +8 Dust per win is gone from modes that already pay out (Arena, Gauntlet, Ghost runs, Raids, Dungeon runs); quick battles against the computer give +2.
- **Blacksmith** (Forge):
  - **Materia** cards: Iron Shard, River Pearl, Ember Core and Dragon Scale. They drop from Elite and Boss first clears, the odd repeat win and high ranks.
  - Six equipment recipes, plus **Fuse** (3 spare copies → 1 random card a rarity higher).
  - **Equipment** is dragged onto one of your units in a fight. It gives that unit stats and a skill, never takes a place on the field (so it can't block), and falls with the unit.
  - New skill **Demolisher N:** +N damage to Structures.
- **Nest:**
  - A hatchery of seven hay nests in a hexagon under a windy sky.
  - Eggs and babies show their type and grow into a random card of it.
  - Babies are sometimes rescued after fights, and bosses sometimes leave an egg.
- **Changeling 🎭:** a new type of kind mimics that share a type with every unit. There are three: Puddle (Pack 1), Hedge (the faction packs), Glass (the Mystery Booster).
- **The Scale Trail:** a hidden substory. Eight harder fights each hide a Dragon Scale for an S rank.
- **Inventory:** a new page, pinned on Home.

## 2026-10-11 (10:10)
- **The 0–20 road is built** (D29, with my suggested answers; one revert brings the old order back).
  - Maps now count from 0: the Outskirts and the tutorial are Map 0 (0-0, 0-1 …).
  - New order: 0 Outskirts · 1 Thistlewood (Thistle Fields, renamed) · **2 The Morel Hollow** · **3 Lilypad Reach** · 4 Pebble Beach (+4-A Smugglers' Grotto) · **5 Gannet Cliffs** · 6 Sunken Hollow · **7 Gatorback Swamp** · **8 The Kelp Mangroves** · 9 Sable Swampmire (the Mire) · 10 Caves & Alcoves · 11 Eyrie Heights · **12 The Briar Maze** · **13 The Redwood Deep** · **14 The Long Grass** · **15 The Pinewood Taiga** · 16 Wolfsbane Tundra (+16-A The Ashen Peak) · 17 Savanna Reaches (+**17-A The Canopy**) · **18 The Glass Dunes** · 19 Basalt Foundry · 20 The Sundered Peak · 21 Coral Current (the open sea).
  - **11 new maps, 77 fights,** built from existing cards. Every reward is a card that had no home before (74 cards). Each map has its own pixel background and colours.
  - A map you've already fought on stays open, side maps included, so nobody loses progress.
  - The Traveller's Cart moves to Map 3, the Ember Peddler to Map 11 and Whisper's Game to Map 5 (5-2). Anything you've already unlocked stays unlocked. The rare S-rank find starts at Map 5.
  - Every fight's castle Health was retuned in the new play order (four passes of tools/retune_all.js). Castle Health is capped at 240 (300 for the campaign boss).
  - **Balance flag:** 22 of 175 fights still come out easier than their target, mostly elites and bosses from Map 9 on. A player's likely deck now holds far more reward cards by then, and castle Health alone can't close the gap. Those enemy decks need stronger cards (your balancing pass).

## 2026-10-11 (09:40)
- **Translations:** today's new text (Dungeon castles, faction packs and Food tokens, the pitch reminder, "Answered by", the New skill ribbon, the New achievement banner) is in all 12 languages.
- **Card list v2:** Beaver Lumberjack and Courier Pigeon are marked as deliberate starters (your B4 call), not accidents.
- **Action items:** D29–D32 added (the card-list questions, art for the pack cards, level caps, Wildpaths points).

## 2026-10-11 (09:20)
- **Counters in card details:** a skill's line now says what answers it. For example, Flying is "Answered by: Reach, Anti-Air", and Poison is "Answered by: Regeneration, Bloom, Healing". Only answers that really work in the engine are listed.
- **New achievement on the results screen:** a gold banner names any achievement that became ready to claim, once each.

## 2026-10-11 (07:10)
- **Wandering Traveller:** gives +1 Lumber once, when it first becomes Ready, instead of every round.
- **Play slots:** they're invisible until you pick up a card (drag it or tap it), then fade in. They fade in once the cards have settled, so a new slot no longer appears in the wrong place and jumps.
- **Buffed Attack:** no longer blue. It stays red and gets redder and glowier as it climbs: a little at 1.5× the printed value, more at 2×, 2.5× and 3× (the last two pulse).
  - The card details read "⚔ 5 (2 + 3)": the total and base in red, the bonus in blue.
- **Skill symbols on the south border:** every symbol, Poison and Flying included, sits in a small seal on the card's bottom edge. It no longer collides with two-digit Attack or Health. Board cards show up to 3 before cycling.
- **Revivificated:** "The first time it dies, it comes back with 1 Health and its statuses cleared. This only happens once."
- **Card editor → Stats by level:** set Attack and Health for every level from the card's base level up to its cap. A blank cell follows the default curve (shown in grey). There's a "Fill blanks from the curve" button. Every rarity caps at 10, castles at 20 and the hero at 100. The caps live in one table (`RARITY_MAX_LEVEL`).
- **Wildpaths (preview):** a page for PvE passive skills, with three hand-inked trails (The Root, The Thorn, The Bloom) of 7 marks each and its own logo. It's pinned on Home for admin and dev builds only, and changes nothing in fights yet.
- **New skill ribbon:** a skirmish preview lists the enemy skills you haven't met yet.
- **Doc:** "Introducing stats and mechanics along the road" (`docs/mechanics-onramp-2026-10-11.md`).

## 2026-10-11 (01:30)
- **Faction packs:** a Rivergate Pack (Otters) and a Sunfeather Pack (Hummingbirds).
  - Each pack draws from 15 cards: 10 for its side plus 5 Riverbank cards both share. That makes 25 cards: 19 new, plus 6 moved out of Pack 1 or given a home.
  - 2 cards a pack. Each card comes from your side's 15 (89%), Pack 1 (10%) or the other side's 10 (1%).
  - If neither card is Uncommon or better, you get a bonus Common or Uncommon.
  - Elite-and-up fights drop a pack on the first clear, and 5% of the time after that. You get the Otter pack against the Legion, the Hummingbird pack against the Tribes, and otherwise your own side's.
  - Neither pack is sold for leaves. The Sunfeather Pack can be bought for 5 🍯 **Food tokens**: you get 1 for every first clear and sometimes 1 for a repeat.
  - Unopened packs wait in the Shop under **Your packs**.
- **New skill, Lantern 🏮** (Lantern Bearer): at Night, your Diurnal units keep their day bonus.
- **Otters vs birds:** Riverstone Slinger has Reach (never misses a flyer), and Net Thrower has Anti-Air 2.
- **Pitching:** once you've pitched this turn, the Lumber tooltip turns red and says so. Dropping another card on the graveyard gets a reminder from your side's captain.
- **Dragging:**
  - A card you pick up keeps its full look; it used to lose its sizing and some effects mid-drag.
  - The Leader drags like a hand card: only the card goes with you, and its slot stays put.
  - The Leader's ribbon is just 👑, plus the cost if it has one; "Summon" is gone.
- **Card list v2** (`docs/card-list-2026-10-11.md`): the 21-map road (0–20) with every card placed, the real Base set (51 cards), the faction packs, and open questions.

## 2026-10-11 (00:40)
- **Dungeons, rebuilt:** a Dungeon is several castles in a row (2–8, default 3).
  - Castle 1 is a normal fight. When it falls, the next castle pops up in its place.
  - The enemy's field fills as if it had played 3 turns: it pitches up to 2 cards for Lumber and summons the best cards it can afford, not just the cheapest. Then it draws 4. You only see the result: the new cards drop in from the top.
  - The new wave takes the middle. Survivors aren't killed; they're pushed to the sides.
  - Every castle but the last starts weaker (¼ of full Health, rising to ½); the last has full Health.
  - Each castle has a round limit (default 8). When it runs out, the next castle arrives anyway and the old castle's remaining Health is added to it.
  - A chip at the top shows "Castle 2/3 · N rounds left".
  - Rank: a normal Dungeon tops out at S; Elite and Boss Dungeons reach SSS, with the fast-clear bar scaled by the number of castles.
- **Edit skirmish → Dungeon:** for Dungeon nodes you can set the number of castles, the tier, first and second-to-last Health %, setup turns, pitches, cards drawn, round limit, and the first and last castle shields. A plain-language description and a row of castle Health previews update as you type.
- Text fields in editors no longer break on numbers.

## 2026-10-11 (00:20)
- **Fight kinds:** Champion 🏅, Mini-boss 💢, Sub-boss ☠️, Dungeon 🗝️, World Boss 🌍 and Mega Raid 👑 join Elite, Boss and Raid.
  - Each new kind borrows an older kind's energy cost, payouts and rank caps.
  - Every special fight keeps a kind badge on its map node, and cleared nodes keep a ring in the kind's colour, so you can still tell an Elite from a Boss after beating it.
  - The boss title card names the kind.
- **Enemy castles:** every fight on Maps 1–10 now defends that map's castle, passive included, unless the skirmish picks its own.
  - Bigger fights bring a higher level of it: Elite 3, Boss 8, Raid 12, Campaign Boss 15.
  - Edit skirmish has a Castle level field to set it.
- **Skirmish preview, simpler:** the showcase card leads, and the enemy deck folds into "Their deck · N cards". Edit skirmish has a Showcase card picker; the default is the deck's strongest card.
- **Deck building from what you own:**
  - The pool shows a stack for every card you own, as deep as your copies, with "left/owned".
  - A deck can use as many copies as you own, whatever your other decks use. Base cards are unlimited.
  - **Finishes stacked / apart** switches between one stack per card and one stack per foil finish.
  - The deck itself shows as small card stacks with ×N instead of name pills.
  - Sort by Cost, Attack, Health, Wait, Rarity or Name.
- **Skirmish decks:** Edit skirmish's **Edit deck** opens a deck-builder window named after the skirmish (stacks, search, sorts). The editor keeps its scroll position.

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
