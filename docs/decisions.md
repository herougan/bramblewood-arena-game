# Bramblewood Arena — Decisions

_Generated from `decisions.json` (2026-10-23). The hub has a searchable, filterable version: YET (waiting on you) and DONE._

## Waiting on you

**BF11-1. 23 cards the new cap would cut down: held at their stats** · Decide · Balance · asked 2026-10-23
- With cap 2 at 2×(N/3)², these cards (over budget before, kept as they were) now have a legal line, but it is lower than their stats, so the re-fit would cut them: alley-cat 1/8 → 1/6; colony 0/11 → 0/9; honey-badger-fury 2/9 → 1/7; chipmunk-hoarder 3/8 → 2/5; pyroclast-wyrm 5/17 → 3/12; otter-guard 4/8 → 3/6; tunnel-ant 2/9 → 2/8; beaver-lumberjack 4/4 → 2/2; sunfeather-scout 1/7 → 1/4; sunspire-choirmother 3/6 → 2/5; old-willow-of-the-ford 2/24 → 2/20; thornwood-palisade 0/16 → 0/12; the-contradiction 2/19 → 1/14; magma-wraith 1/9 → 1/6; lone-grey-wolf 4/15 → 1/3; puffball-bombardier 1/10 → 1/8; sheep 1/7 → 1/4; starfall-owl 5/26 → 2/11; fumarole-ibex 1/13 → 1/11; battlement-heron 1/14 → 1/10; ashmantle-fiend 5/22 → 4/17; truffle-piglet 3/11 → 2/8; krill-swarm 1/7 → 1/5. The biggest: Lone Grey Wolf 4/15 → 1/3 and Starfall Owl 5/26 → 2/11. They were held at their stats; the cure would usually be trimming a skill instead.
  - Hold them, trim skills per card later
  - Apply the formula's lines
  - Trim the biggest (Lone Grey Wolf, Starfall Owl, Pyroclast Wyrm) now
- **Default:** Hold them, trim skills per card later

**EQ-1. How equipment is damaged or removed** · Decide · Battle rules · asked 2026-10-23
- Owner (10-23 11:11): "New: How to deal damage to equipment. (They do not have 'health stats'.) If the opponent has many equipment on the field, they act as perma buffs (albeit activating only 1 turn later). I don't think this rule is fun: 'When an equipped creature dies, the equipment has 50% chance to be destroyed. If defeated by acid damage, the equipment is 100% destroyed'" The rule today (bramblewood-engine.js, eqDrop, package EQ 10-19): the quoted 50% / acid rule is not in the engine or the texts. When the wearer dies, the piece stays in its slot and the next unit played there picks it up (Codex: "it stays when its unit dies"). It goes to the graveyard only if its card has equip.breaks, or if the slot already holds a loose piece. A reviving unit keeps its piece. A loose piece cannot be hit (swings pass it to the bramble). The only answer is Disarm (Glintsnatch Magpie), which steals a piece. So equipment is close to a permanent buff, as you say. Alternatives. (A) Durability: each piece has 2-4 durability pips. It loses 1 each time its wearer takes a hit (or, for weapons, each swing) and breaks at 0. A dropped piece keeps its pips. Pros: no randomness, hitting the wearer is the counterplay, readable. Cons: a new number on every equipment card and in the budget. (B) Corrosion: acid hits and Corrode strip durability (or destroy a loose piece outright), and fire burns wooden pieces. Pros: gives acid its own job and uses existing statuses. Cons: alone it answers equipment only for acid decks. (C) A Sunder family next to Disarm: Sunder N (On Hit: the target's piece loses N durability, or breaks if it has none), Shatter (On Play: break the nearest loose enemy piece), and Demolisher also hits loose pieces. Pros: a deck-building answer. Cons: if few cards carry it, pieces stay permanent buffs. (D) Pieces drop and rust: when the wearer dies, the piece lies loose for 2 rounds, then rusts away unless a unit of its side picks it up; the killer's Disarm or Scavenge can claim it. Pros: keeps the drop-and-pick-up idea, ends permanent buffs. Cons: a timer to show on the board. Recommended: A with B folded in. Durability 3 by default (set per card), -1 each time the wearer is hit, -2 for an acid hit or each Corrode applied; dropped pieces keep their durability. Add C's Sunder to a few cards later.
  - Durability with acid / Corrode wear (A+B)
  - Durability only (A)
  - A Sunder / Shatter skill family (C)
  - Pieces drop and rust after 2 rounds (D)
  - Break on the wearer's death (equip.breaks for all)
- **Default:** Durability with acid / Corrode wear (A+B)

**SX-2. Hero levels now need Materia: how much** · Decide · Hero · asked 2026-10-23
- Each Hero level needs a third of its XP from Materia crafts (your H2 rule, built in SX). A Hero that only fights stalls at about two thirds of a level. Cost: Lv 20 needs 7 crafts (875 Dust), Lv 50 needs 44 (5,500), Lv 100 about 240 (30,000). Recommended: as built for now; add Materia XP from quests / raids if the pace feels slow.
  - As built (equal thirds)
  - A smaller Materia part (e.g. Battle 45%, Materia 20%, Either 35%)
  - More Materia XP sources (quests, raids)
- **Default:** As built (equal thirds)

**LEAD-4. The CPU never saves Lumber for its leader, so costly leaders rarely come out** · Decide · Battle · asked 2026-10-23
- The CPU saves Lumber only for cards in its hand, never for its reserve leader, so costly leaders (Marshal Tuskwell 4, the Magnate Duck 4, Gorge Wyrm 3) never came out in 60 test fights, while cheap ones came out in most. Making the CPU save for its leader makes many fights harder and needs a road retune. Recommended: leave it now; revisit with DF-1's retune.
  - Leave it (as built)
  - The CPU saves Lumber for its leader (then retune)
  - Enemy leaders cost no Lumber
- **Default:** Leave it (as built)

**DF-1. Difficulty doesn't climb: from Map 16 the road gets easier, not harder** · Decide · Balance · asked 2026-10-23
- Measured on all 179 fights of Maps 0-24 (docs/balance/df-2026-10-23.json): the road gets easier from Map 16, not harder. The ant deck wins 64-74% of skirmishes on Maps 0-15 but 88-96% on Maps 16-24; a collected deck 81%. Causes: your level climbs 1 -> 8 between Maps 10 and 16 while the enemy's climbs 2 -> 3.2; the level curve is stepped; and every map's targets restart at 90% -> 40%. A trial 'pace' curve (the enemy 0.5-2.5 levels under your Forge cap) lowers Maps 16-24 skirmishes to 88% (ant) / 73% (collected). Recommended: the pace curve, plus DF-3's boons, plus targets that drift down across maps (first skirmish 90% on Map 1 to about 80% on Map 24), retuned against the ant and collected decks.
  - The pace enemy curve, plus DF-3's selfish effects, plus road targets that drift down across maps (each map's first skirmish 90% on Map 1 to about 80% on Map 24), retuned against the ant and collected decks
  - The pace enemy curve only
  - No level change: get the climb from DF-3 and from retuning each fight against the ant and collected decks
  - Leave it
- **Default:** The pace enemy curve, plus DF-3's selfish effects, plus road targets that drift down across maps (each map's first skirmish 90% on Map 1 to about 80% on Map 24), retuned against the ant and collected decks

**DF-2. Levels gate by map, not by resources; Base decks never need replacing** · Decide · Balance · asked 2026-10-23
- Model in docs/balance/df-2026-10-23.json: every deck reaches the Forge cap on the map that opens it (Lv 3 at Map 11, Lv 8 at Map 16), light or binge player alike, so levels gate by map, not by resources. What holds decks back is duplicates outside Base (about 56 repeat fights for one more copy of a common), so the strongest deck is a cheap Base synergy deck that never needs replacing. Recommended: Base cards stop at Lv 4 and pay full Forge cost; a fight's own first-clear card drops 10% a repeat, so 4-copy decks form by about Maps 10-15.
  - Base cards stop at Lv 4 and pay full Forge cost (x1); a fight's own first-clear card drops 10% a repeat (was 3% x its rarity share), so 4-copy decks form by about Map 10-15
  - Base cards stop at Lv 4 only
  - Slow the Forge instead: the Ember Forge (Map 16) caps at Lv 6, Lv 8 from Map 21
  - Leave levelling as is
- **Default:** Base cards stop at Lv 4 and pay full Forge cost (x1); a fight's own first-clear card drops 10% a repeat (was 3% x its rarity share), so 4-copy decks form by about Map 10-15

**DF-3. Selfish map effects from Map 5: a boon only the enemy's deck can use** · Decide · Map effects · asked 2026-10-23
- A design: from Map 5 each map names a theme, and its boon turns on in a fight when at least half the enemy deck shares it. It counts only the CPU's deck, so copying the deck gains nothing. The Environment card shows the count ('11/16 Cave', red outline, a 'theirs' mark). 15 boons are proposed (e.g. Map 8 Blind Fury: Cave units deal 2x in Darkness; Map 17 Frostborn; Map 24 Royal Treasury); Maps 6, 11, 14, 15 and 21 get none. The full list is in this item's earlier text (git history of docs/decisions.json, 10-23). Recommended: build it on every fight of those maps, then retune the road.
  - Build it: one boon per map from Map 5, on every fight of that map, the 15 above, theme at half the deck
  - Only on elites, mini-bosses and bosses
  - On skirmishes too, but only from Map 10
  - Not now
- **Default:** Build it: one boon per map from Map 5, on every fight of that map, the 15 above, theme at half the deck

**DF-4. Five spots break the curve: Maps 1, 7, 11, 14 and Map 20's elites** · Decide · Balance · asked 2026-10-23
- Spots that break the road's targets (docs/balance/df-2026-10-23.json). Already handled: Map 1 (retuned, EB-2) and Map 20's double fire (Scorched Ground only, FX3-2; volcano damage lowered, FX3-3). Left: Map 7 Morel Hollow (ant deck 48%; 7-3 holds it to 8%), Map 11 Eyrie Heights (38%: flyers and Guardians in a Gale), Map 14 Savanna Reaches (46%). Recommended: retune Maps 7, 11 and 14 to the road targets against the ant and collected decks (tools/skirmish_pass.js).
  - Retune Maps 7, 11 and 14 (deck and Shield moves)
  - Leave them: DF-1 and DF-3 reshape the curve first
- **Default:** Retune Maps 7, 11 and 14 (deck and Shield moves)

**D17. Sound direction and sourcing** · Decide · Sound · asked 2026-10-03
- Overall feel for the cue sheet (sfx-cue-sheet.md), and whether to use CC0 packs or your own recordings. Real samples will beat more synthesis; I can't download them from here. Owner (10-23 00:10): "The musics right now have to be improved. only 2-3 tracks are usable." Not a pick between the options: the music needs better tracks, and only 2-3 are usable now, so it needs CC0 files from him (see the 10-23 backlog).
  - A. Cosy and organic
  - B. Chiptune
  - C. Mixed (organic world, chiptune UI)
  - Drop CC0 files (Kenney Impact/Casino) into audio/
  - Send your own files
- **Default:** C, CC0 when files arrive

**L1. Which beasts the Hummingbirds befriend; proposed card renames** · Decide · Lore · asked 2026-10-06
- Open questions from lore-bible.md. Dogs and cats are settled (see L2).
- **Default:** Keep current names

**H1. Hero levelling pace, stat prices, and Materia socketing (v2)** · Feedback · Hero · asked 2026-10-06
- Play a few fights with a Hero and say how it feels; do you want Materia socketing next?
- **Default:** Play a few fights with a Hero, then answer

**C1. Which cards get the six new finishes** · Decide · Cards · asked 2026-10-08
- Hex, Etched, Ice, Gold leaf, Reverse and Prism are built (Effects Lab → Card treatment centre). Who gets them: rarities, events, pack tiers, prestige? Owner (10-23 00:10): "- later. Pack foil chances - evaluate also. Should be rare." Stays open for later; the pack foil chances are to be evaluated in package RW3 and kept rare. Built (RW3, the pack-foil part): a card comes out foil 1% (Hedgerow Pouch), 1.5% (Tidemire Chest), 2% (Highcrest Case, Mystery Booster), faction packs 1%; was 4 / 8 / 12 / 10 / 4%, and every Highcrest Case had one foil guaranteed (about 1.3 foils a Case; now 0.16). An Advanced pack's first five cards keep 10x (10 / 15 / 20%). Call RW3-4.
- **Default:** Later (pack foils are already rare, RW3-4)

**G2. Siding with Otters or Hummingbirds (proposal)** · Decide · Lore · asked 2026-10-08
- (Rewritten 10-23 at the owner's request, all inside this item; the older siding-proposal-2026-10-08.md is source material, to move into the hub later.) What it is: the player is a traveller both peoples want on their side: the Otters (Rivergate Legion) and the Hummingbirds (Sunfeather Tribes). A hidden Standing number from -100 (Otters) to +100 (Hummingbirds) moves with the player's choices, and the band it sits in decides which rewards, titles, shops and story branches open. Where it lives today: the side picked in the tutorial is stored as `bramblewood_arena_faction` (saveFactionChoice / loadFactionChoice, arena_app.js) and today only sets the starter deck, the voice in warnings and the faction pack; cards carry `faction` (14 Hummingbird cards, 27 base) and `source.side` ('tribes', 'shared'); the faction reward track (noteFactionReceived) counts faction-pack pulls. Dialogue choices already exist (playDialogue with onDone replies, for example the Old Well in visitOldWell). Nothing reads a Standing yet. What siding changes for the player: (1) Reward cards: some skirmishes offer two reward cards, one per side; the player gets the one matching their band, Neutral gets a third (road-folk, dog or cat card). (2) Side shops: a Legion Quartermaster and a Tribe Trader on later maps, different stock. (3) Titles and character looks (Legion Outrider, Friend of the Tribes, Wanderer of Both Banks). (4) Materia leaning: Otter crafting nudges Shield/Formation, Hummingbird crafting Flight/Bond. (5) Story: dialogue warms or cools by band; from Map 6 a key skirmish plays differently by band; a Neutral track keeps the peace through a series of tests, hardest, with unique rewards. (6) It never locks a people's cards away: off-side cards stay in packs and the Market, only the story rewards differ; and nobody is punished for the tutorial pick. What moves Standing: dialogue choices +/-2 to 8 (no number shown on the button), first clears of one people's skirmishes +/-1 (fighting Otters drifts you to the Hummingbirds and the reverse), side quests +/-5 to 15 (a few per map, often exclusive), neutral acts (helping dogs, cats, road-folk, the Traveller) pull toward 0. Drift is slow: 2-3 maps of consistent choices to a friend band, most of the campaign to be Sworn. Five bands: Sworn Otter (<= -60), Otter friend (-59 to -20), Neutral (-19 to 19), Sunfeather friend (20 to 59), Sworn Sunfeather (>= 60); a two-coloured banner on Profile and the Conquest map shows the band. Build in four steps: (1) the Standing store (saved with the account), the banner and hidden weights on dialogue choices, Old Well first; (2) two-sided reward cards on 3-4 skirmishes of Maps 1-3, picked in the skirmish editor; (3) two side quests per map for Maps 1-3; (4) side shops from Map 4, titles, the Map 6 fork. Open questions for you: (a) start at +/-10 from the tutorial pick, or everyone at 0? (b) is the meter shown as a number or only as the band name? (c) is Neutral a full third path with its own ending, or only a resting place? (d) should the two-sided rewards and the side quests wait until the factions are symmetric (RP4), so neither side is the stronger pick? (e) how does siding interact with the Hummingbird gate (the faction pack) and the 0-2 faction pack? (f) can the player reset Standing, or does drift back by effort only? Options stay: Approve as written, Change parts, Not yet. Waiting for your pass over (a)-(f).
  - Approve as written
  - Change parts
  - Not yet

**S3. Turn on leaked-password protection** · Do · Security · asked 2026-10-08
- Supabase dashboard → Auth → Passwords → leaked password protection. Free, one click, needs your login. Owner (10-23 00:10): "Needs you to use my chrome." Needs a Chrome session with the owner. 10-23 06:59 (Chrome session): the dashboard toggle "Prevent use of leaked passwords" is "Only available on Pro plan and above"; the org is on the Free plan, so it was not turned on (nothing is bought). Free alternative on the same panel: password requirements (e.g. letters + digits) and a longer minimum length; not changed without the owner's word.
  - Done
  - Skip
- **Default:** Done

**S4. SonarCloud as well as CodeQL?** · Decide · Security · asked 2026-10-08
- CodeQL now scans every push (free, GitHub → Security). SonarCloud adds code-quality and duplication reports; it needs you to sign in at sonarcloud.io and add a token. Owner (10-23 00:10): "Chrome". Needs a Chrome session with the owner. 10-23 06:59: the repo is public, so SonarCloud is free for it. It needs the owner to log in at sonarcloud.io with GitHub (Claude cannot sign in or create accounts); then the repo can be imported and its token stored as a GitHub secret (asked before doing it).
  - Add SonarCloud
  - CodeQL is enough
- **Default:** CodeQL is enough

**A1. API keys + monthly caps for GPT Image and fal/Kling** · Do · Art · asked 2026-10-08
- Nothing here is bought; every step is yours, in your browser, and no key ever goes into the repo or a chat. 1. OpenAI (GPT Image): sign in at platform.openai.com, open the Billing page and read the plan; add a payment method only if the dashboard asks for one before the key works (that is your call, I never add one). 2. Set the monthly cap there first: Settings > Limits (or Billing > Usage limits), set a monthly budget (the asset plan assumes a few dollars: about 30 splash sprites, 5-10 images per skin, so start with a low cap) and an email alert at 50% and 80%. 3. Create the key: API keys > Create new secret key, name it bramblewood-local, restrict it to the project if the dashboard offers a project; copy it once. 4. fal.ai (FLUX LoRA training and Kling video): sign in at fal.ai, open Billing and Usage; fal is prepaid credits, so the cap is the amount you load (load the smallest top-up, or none until you decide on A2), and use the usage view to watch the spend. 5. Create the fal key: Keys > Add key, scope API, name it bramblewood-local; copy it once. Kling comes through fal (image-to-video), so it needs no separate account; if you ever use Kling's own site instead, set its monthly credit cap in its billing page and keep auto-renew off. 6. Store both keys as local environment variables on your machine, not in any file in the repo: for example OPENAI_API_KEY and FAL_KEY in your shell profile or the OS key store. The art tools read them from the environment only, and `git grep` must never find them. 7. Tell me 'keys are set' (never paste the keys). I will check only that the variables exist (set or not set, never their value), run one test image through the pixel pass (`tools/art/pixelize.py`) and report what it cost on the dashboard. 8. Rotate or delete a key at once in the dashboard if you ever think it leaked. What is still open after A1: the review gate (generated assets land in the hub's Visual Library as 'proposed'), and the commercial-use terms for OpenAI, fal and Kling before any paid marketing (asset-pipeline-action-items.md, items 13-14).
  - Done
  - Not yet
- **Default:** Not yet

**A2. Train a Bramblewood pixel LoRA?** · Decide · Art · asked 2026-10-08
- What a Bramblewood pixel LoRA is: a small add-on trained on our own card art so a general image model (FLUX.2 [dev], trained on fal) draws new cards in the same house style; PixelLab stays the main source and heroes stay PixelLab. Data: 20-40 of the best existing PixelLab cards from art/cards (633 PNGs, 256x256 today), picked for one coherent look: same outline weight, same palette (tools/art/palette.json), a spread of subjects (mammal, bird, insect, structure), no text in the image, no watermarked stock. Each image gets a short caption in the style of docs/art-style-prompts.md with a trigger word (for example 'bwpixel') so the style can be called on and off. About half a day of curation, which I can do from the repo; you pick or veto the 30. Tool options: (a) fal's FLUX.2 trainer (hosted, no GPU, upload a zip of images and captions, about 1,000-2,000 steps, roughly $6.40 per 1,000 steps on fal's list, so about $6-13 per training run plus about a few cents per generated image; check the current price on fal's page before any run); (b) Replicate's FLUX trainer (similar, per-run pricing); (c) a local or rented GPU with ai-toolkit/kohya (cheaper per run, but needs a rented GPU and setup time; not worth it for a 10-card test). Recommendation: (a), because A1 already puts a fal key and cap in place. Cost range: a first test is about $7-15 in total (one 1,000-step training plus 10-40 generations), and a retrain with fixes is the same again; a full set of Maps 9-10 cards afterwards is cents per card. All of it stays under the cap you set in A1; nothing runs without your OK on the amount. Test plan on 10 cards: (1) train once on the 30; (2) generate the 10 test cards, chosen from existing cards whose PixelLab art we already like, so each result can be set beside the original (a mix: 3 small animals, 2 birds, 2 insects, 1 structure, 1 large beast, 1 fantasy creature); (3) run each through `tools/art/pixelize.py` (nearest-neighbour downscale to the 160 px grid, palette snap, outline clean-up); (4) review in the hub's Visual Library as 'proposed', scoring each on outline, palette, readable silhouette at card size and fit beside the PixelLab neighbours; (5) pass if at least 7 of 10 are usable with at most a pixel pass and one retry, fail otherwise; (6) if it passes, spend the same amount on the Maps 9-10 cards and the Home sprites that wait on PixelLab; if it fails, delete the LoRA and keep PixelLab only. Needs from you: A1 done, a yes on the training spend, and a veto pass over the 30 picks.
  - Yes, test on 10 cards
  - Not yet
- **Default:** Yes, test on 10 cards

**A3. 30 s trailer from Kling clips** · Decide · Marketing · asked 2026-10-08
- 5–6 Kling 3.0 image-to-video clips (splash crowd, pack tear, Shiny reveal, Ember Chipmunk fire, castle fall) cut with gameplay capture.
  - Go
  - Later
- **Default:** Later

**TU2-3. The tutorial brambles' Health: 9 and 11, or the 12 you set** · Decide · Tutorial · asked 2026-10-23
- The tutorial fights carry their own Health (9 and 11; shown halved as 5 and 6), so the editor's 12 never applied. EB-6 has since tuned around 9 / 11 (T-1 95%, T-2 78% wins). Changing them is a live fight edit, so it waits for you. Recommended: keep 9 and 11.
  - Keep 9 and 11 (as now)
  - 12 and 14 (your 12; Part 2 two sturdier)
  - Other numbers (set them in the editor)
- **Default:** Keep 9 and 11 (as now)

**RW3-2. Rare notices: rarer tickets, or rarer notices?** · Decide · Raid · asked 2026-10-23
- Your RK4: "SS / SSS raid notices about once a month or two". Built: the notices appear as often as before (S 3.5%, SS 0.8%, SSS 0.2%) and only their Raid Ticket got rarer (40% each: S tickets 0.59 a week, SS + SSS one every 1.4 months). Read literally, your words make the SS / SSS notices themselves rarer (1.0% -> about 0.5% of notices, their big rewards too). Recommended: rarer SS / SSS notices, since that is what your note names.
  - As built (rarer tickets)
  - Rarer SS / SSS notices (about 0.5%)
  - Both
- **Default:** Rarer SS / SSS notices (about 0.5%)

## Decided

**SX-1. The armour konk is folded into the new armour ting** · Decide · Sound · asked 2026-10-23 · decided 2026-10-23
- Your #95: a target-modifier sound after the source's. Built (SX): every damage mark plays its own short cue 75 ms after the hit (armour ting, full-block ring, Shield thud, Shell tok, Sturdy thunk, stone clack, Resist / Rage / Scare muffle, Fragile crack, Weakness sting, Shock zap, Immune whiff). Armor already had the 10-16 konk ("the attacker hit metal"); two metal sounds on one hit blurred, so the ting carries a soft konk body and the separate konk now plays only in replays recorded before the marks existed.
  - As built (ting with a konk body)
  - Keep the separate konk as well
  - Ting only, no konk body
- **Default:** As built (ting with a konk body)
- **Outcome:** Claude's call (10-23, owner asked to settle the easy ones): As built (ting with a konk body), kept as built (the ting with a soft konk body).

**SX-3. Existing Heroes: level kept, XP into it counted as Battle XP** · Decide · Hero · asked 2026-10-23 · decided 2026-10-23
- Saves had one XP pool. Built (SX): the level a Hero has is kept as its base (no lost levels or stat points), and the XP already into that level goes to the Battle pool (almost all Hero XP so far came from battles). Its Materia part starts empty.
  - As built
  - Also credit past Materia crafts (30 XP each) to the Materia part
- **Default:** As built
- **Outcome:** Claude's call (10-23, owner asked to settle the easy ones): As built, kept as built (existing Heroes keep their level and the XP into it counts as Battle XP).

**LEAD-1. Paired bosses with 2 leaders: which fights** · Decide · Maps · asked 2026-10-23 · decided 2026-10-23
- Your 01:03 #12: special bosses (e.g. twin-headed) can have 2 leaders. No fight in the data is a twin- or two-headed boss, and the Two-Headed Calf (Rare) is in no enemy deck. Built (LEAD): two named pairs lead with 2 cards, 24-8 The Magnate Duck (Magnate Duck + Iron Warden) and 23-8 Marshal Tuskwell (Marshal Tuskwell + War Elephant). The VS opener names both and the map panel shows both cards. Every other elite and boss has 1 leader.
  - As built (24-8 and 23-8)
  - Name other paired bosses
  - Make a real two-headed boss (e.g. a boss version of the Two-Headed Calf) for a later map
- **Default:** As built (24-8 and 23-8)
- **Outcome:** Claude's call (10-23, owner asked to settle the easy ones): As built (24-8 and 23-8), kept as built (the two named pairs (24-8 and 23-8) lead with 2 cards).

**LEAD-2. The battle rating counts an enemy leader at the enemy's level; it fights at its printed level** · Decide · Balance · asked 2026-10-23 · decided 2026-10-23
- The BR counts a leader twice, at the fight's enemy level, but the CPU's reserve leader plays at the card's printed level (as SK's skirmish leaders already did). A boss unit of high rarity therefore raises the BR by up to 50% while the fight gets only about 6 points harder for the DF ant deck. Built (LEAD): BR within 5% on 110 of 112 fights. To get there, decks lost a copy or two, 57 fights got a lower enemyLevel and 23 a smaller or bigger enemy bramble, which brought the win rates back (400 games a fight, 95 of 112 within 3 points). Two named exceptions: 20-R (an all-Common deck, BR 20 -> 22) and 20-A-3 (36 against 38).
  - As built
  - Count an enemy leader at the level it fights at (every Map 2+ skirmish's BR drops a little)
  - Make enemy leaders fight at the enemy's level (harder fights everywhere; needs a retune)
- **Default:** As built
- **Outcome:** Claude's call (10-23, owner asked to settle the easy ones): As built, kept as built (the BR counts a leader at the enemy level, held within 5% by the retune).

**LEAD-3. 11 fights where another card leads instead of the boss unit** · Decide · Maps · asked 2026-10-23 · decided 2026-10-23
- Your note: 'they can use any card as leader btw'. On 11 fights the boss unit as leader moved the DF ant deck's win rate by more than 8 points once the BR was held within 5% (e.g. 22-8 Rimeheart Colossus +28, 2-A-7 -28). There another deck card leads and the boss unit stays the highlighted card: 1-5 Compost Grub, 3-6 Mountain Goat Climber, 3-7 Peak Condor, 6-6 Marsh Wisp, 10-6 Great Barracuda, 11-9 Chamois Leaper, 14-8 Dust Hyena, 22-8 Gorge Wyrm, 2-A-7 Mayfly Dancer, 20-A-2 Cinder Stoker, 20-A-6 Ashbone Ghoul. If you want the boss unit to lead on these too, one of BR or the win rate moves.
  - As built
  - The boss unit leads everywhere; let the BR rise on these 11
  - The boss unit leads everywhere; let the win rate move on these 11
- **Default:** As built
- **Outcome:** Claude's call (10-23, owner asked to settle the easy ones): As built, kept as built (another deck card leads on the 11 fights (he said any card can lead)).

**LEAD-5. Skirmish leaders: from Map 2 (SK) or from Map 11 (your 01:03 note)** · Decide · Maps · asked 2026-10-23 · decided 2026-10-23
- Your 01:03 #12 says normal skirmishes past Map 10 should have leaders. Since SK (your 09:52 call) every skirmish from Map 2 already leads with its highlighted card, unshown, so all 81 skirmishes on Maps 11+ have one. Built: SK's Map 2 rule is unchanged. Elites and above now show their leader on the VS opener; skirmishes don't.
  - As built (Map 2 on, unshown)
  - Only from Map 11
  - Show skirmish leaders too
- **Default:** As built (Map 2 on, unshown)
- **Outcome:** Claude's call (10-23, owner asked to settle the easy ones): As built (Map 2 on, unshown), kept as built (skirmish leaders from Map 2, unshown (his 09:52 SK call)).

**UI4-1. Deck slot prices** · Decide · Camp · asked 2026-10-23 · decided 2026-10-23
- Built (UI4, your 01:03 note 5): a new player has 1 deck slot; more are bought in order in the Camp (under My Decks) or the Tavern's Upgrades tab. Slot 2: 150 Magic Dust + 150 Maple Leaves. Slot 3: 300 Dust + 250 Leaves. Slot 4 (Map 15 cleared): 600 Dust + 350 Leaves + 1 River Pearl + 1 Tempering Stone (Map 15's boss pays both on its first clear). Slot 5 (Map 21 cleared): 900 Dust + 450 Leaves + 1 Ember Core (from the Map 20 raid / world bosses). Slot 6 (Map 27): 1200 + 600 + 2 Ember Cores. Slot 7 (Map 33): 1500 + 750 + 1 Strange Materia + 1 Ember Core. Maps 27 and 33 are still Reserved, so slots 6-7 wait for them. Map 21's own fights pay only Iron Shards, so slot 5 asks for the Ember Core the road pays just before it. Existing saves keep every deck they have (their slots start at their deck count); a deck pulled from the cloud raises the slots the same way.
  - As built
  - Cheaper (halve slots 2-3)
  - Map 21's slot pays Iron Shards instead of an Ember Core
  - No cap past slot 7 (keep adding at the slot 7 price)
- **Default:** As built
- **Outcome:** Owner (10-23 11:11): "Use some placeholder" and "For all these upgrade costs and forge costs, put them in the master hub and let them be editable." The deck slot prices stay as built as placeholders, and every upgrade and Forge cost (deck slots included) becomes editable in the master hub. To build in package HUB2.

**UI4-2. Swarm in the hand's blue numbers: 4 or 5 for an Ant Scout with 3 ants out** · Decide · Battle · asked 2026-10-23 · decided 2026-10-23
- Built (UI4, your 01:57 note 11): a hand card shows in blue the Attack / Health it would have if played now, worked out by the engine's own rules (engine previewPlayStats). The engine's Swarm counts the OTHER allies that share a type, so an Ant Scout (1 Attack) with 3 ants out shows 1 + 3 = 4; your example said 1 + (3+1) x 1 = 5, which would count the scout itself. Also: a card whose skill depends on where it stands (Formation, Sociable, Lone Wolf) is previewed in the slot a plain play takes (the centre first, then the right end).
  - As built (4: other allies only, as fights work today)
  - Count the card itself too (a rule change for every Swarm card in fights)
- **Default:** As built (4: other allies only, as fights work today)
- **Outcome:** Owner (10-23 11:11): "Okay good catch. you're right." As built: Swarm counts the other allies only, so the Ant Scout with 3 ants out shows 4; no rule change.

**UI4-3. Which faction packs open the several-swap window** · Decide · Deck · asked 2026-10-23 · decided 2026-10-23
- Built (UI4, your 01:03 note 3): a faction pack's cards come as one swap window, a row per card (your deck card on the left, the pack card on the right, a tick each, Swap N). A row only appears where a weak deck card (starter, baby, tutorial card) may go and the pack card scores higher. The first faction pack (the one after 0-2) always shows it; every later faction pack counts as one of the 10 swap offers a player ever gets.
  - As built (every faction pack, first one free)
  - Only the 0-2 pack
  - Every faction pack, never counted
- **Default:** As built (every faction pack, first one free)
- **Outcome:** Owner (10-23 11:11): "No, I think just 1 row, but there's up to 3 cards on the right (like last time). After pressing Swap and 0.8s, you can press "Swap Again". The right card shifts to "selecting" another card. (The left card that was swapped out is also out of the equation)" Not the rows design: the swap window has one row, your deck card on the left and up to 3 pack cards on the right; 0.8 s after Swap a "Swap Again" button appears, the right side moves on to select another card, and the deck card already swapped out leaves the choice. To build in package FX4.

**FX3-1. What Scorched Ground's line of fire touches** · Decide · Balance · asked 2026-10-23 · decided 2026-10-23
- Built (FX3, your 01:57 note 3): from round 2, every round, a line of fire crosses the board from left to right and every unit on both front lines takes 1 fire as it passes (fire-resistant units and Mountain Climbers are spared; a raid's back rows are not crossed). It used to burn one random unit a side for the fight's number (2 / 3 / 5). On a full board that is more damage in total than before (5 a side against 2-5 on one unit), spread thin.
  - As built (every front unit, 1)
  - One random unit a side, 1 (the line is only the look)
  - Every front unit, 1, every other round
- **Default:** As built (every front unit, 1)
- **Outcome:** Owner (10-23 11:11): "Okay, it only hits one unit. It looks like the ground boils beneath the units chosen. Still do the line of fire thing - fx in master hub - in that case, all take 1 fire damage. It doing damage one by one as the line passes them feels very interactive too. (Find a name for this field effect)" Scorched Ground goes back to hitting one unit, drawn as the ground boiling beneath it; the line of fire becomes its own field effect (its fx in the master hub, a new name to find) where every unit takes 1 fire damage one by one as the line passes. To build in package FX4.

**FX3-2. One ground fire a fight: Scorched Ground replaces Scorching where both were on** · Decide · Balance · asked 2026-10-23 · decided 2026-10-23
- The "hitting twice" was two effects, not one counted twice: Map 20's six elite and boss fights (and 22-7) set Scorching III themselves, and every big fight on a volcano map also gets Scorched Ground automatically, so two round-start burns hit the same units in the same upkeep with the same 🔥 number. Built: where both would be on, only Scorched Ground's line of fire stays (fightRules). This also settles DF-4's "cut Scorching III to I" for those fights. Map 20, ant deck at Lv 8, 40 games: 20-5 7.5 -> 62.5%, 20-6 0 -> 12.5%, 20-7 2.5 -> 92.5%, 20-8 0 -> 32.5%, 20-9 2.5 -> 42.5%, 20-10 2.5 -> 35%.
  - As built (Scorched Ground only)
  - Scorching only (no automatic Scorched Ground there)
  - Keep both (two burns a round)
- **Default:** As built (Scorched Ground only)
- **Outcome:** Owner (10-23 11:11): "Okay, if you are sure. But leave a small gap between the field effect damage animations so I can see the two numbers. When the field effect is active, it aligns straight, then shines abit, before moving back when the effect is about to complete." As built (Scorched Ground only where both were on), plus two visual changes: a small gap between consecutive field-effect damage animations so both numbers read, and the active field-effect card straightens, shines a little, and tilts back as the effect completes. To build in package FX4.

**FX3-3. Which volcano hazards count as single-target (2) and rare (3)** · Decide · Balance · asked 2026-10-23 · decided 2026-10-23
- Built by your rule (every round 1, single target 2, rare single target up to 3): Lava Tide (a column, so one unit a side) 1 -> 2; the Eruption (one unit a side) 1 -> 2, and a fight's own number up to 3 (boss and miniboss fights on the volcano maps: 3; the world bosses had 5, now 3). Together, 3 units a side over rounds 2-20: very low 0.11, low 0.45, medium 0.68, rising 0.97, high 1.01 a unit a round; the most one unit took in one round is 5 (a comet, an Eruption and a Lava Tide at once; 6 with a boss's 3).
  - As built
  - Lava Tide 1 (a column counts as an area)
  - Eruption 2 everywhere (no 3)
  - Cap one unit's volcano damage at 3 a round
- **Default:** As built
- **Outcome:** Owner (10-23 11:11): "Still too much damage. Let Lava Tide be 50%. (You're supposed to build a fire resistant deck - but i don't want to force it. Also, let's create a fire resistant boots equipment like lava waders that gives units Fire Resistance)" Volcano damage is still too high: Lava Tide drops to 50% of its as-built strength, and a new equipment, Lava Waders (boots that grant Fire Resistance), gives non-fire decks an answer without forcing one. To build in package FX4.

**EN-1. Cards with no legal line after EN, kept as they are** · Decide · Balance · asked 2026-10-23 · decided 2026-10-23
- The re-fit (tools/refit_pass_2026_10_21.js) found no stats that fit both caps for two cards, so they keep their stats (listed in docs/balance/human-pass-1-flagged-2026-10-21.json): the Magnate Duck 1/22 (the only King: Armor 3, Midas 3, Bounty 3, Swipe 2, Hoard 3, King; S 23.9 against cap 2's (N/3)^2 = 247: S x S alone is 571) and the Muskrat Lodgekeeper 3/13 (Bulwark 1 at 8 + Tide). Your note said not to make the Duck 1/1.
  - Keep them as they are (named exceptions)
  - Floor them (--floor: 1/1)
  - Trim a skill on each (e.g. the Duck's Bounty 3)
- **Default:** Keep them as they are (named exceptions)
- **Outcome:** Owner (10-23 11:11): "Those 2 cards have too many skills or at too high number. Trim. For the muskrat, just bulwark 1 and Tide is sufficient." Not named exceptions: trim both cards until they fit; the Muskrat Lodgekeeper keeps only Bulwark 1 and Tide, the Magnate Duck loses skills or skill numbers. To build in package BF11. Built (BF11): Magnate Duck loses Swipe, Armor 3 → 1, Bounty 3 → 1 (2/34); Muskrat Lodgekeeper (Tide, Bulwark 1) fits at 2/10.

**EN-2. Bulwark N's price (8 a point) and the Ancient Sloth Titan** · Decide · Balance · asked 2026-10-23 · decided 2026-10-23
- Bulwark N now raises two 0/4N shields, priced by what it raises: 2 x 4N Health = 8 a point (it was 1, half-scale, for the old bramble armour). The Ancient Sloth Titan (Bulwark 2, S 16) re-fits 4/39 -> 1/14, because cap 2 (S x S) bites; with Bulwark 1 it would be about 2/30. The Muskrat Lodgekeeper (Bulwark 1) has no legal line (EN-1).
  - As built (8 a point; Titan 1/14 + two 0/8 shields)
  - Titan to Bulwark 1 and re-fit
  - Price the shields' Health at half (4 a point)
- **Default:** As built (8 a point; Titan 1/14 + two 0/8 shields)
- **Outcome:** Owner (10-23 11:11): "Bulwark should be scored only for 6, since its easily exploitable by the opponent." Bulwark N is priced 6 a point (not 8), since the opponent can exploit the shields; the Bulwark cards (the Ancient Sloth Titan) re-fit on that price. To build in package BF11. Built (BF11): Bulwark 6 a point.

**EN-3. Bulwark's shields: "vanguard" read as the front line** · Decide · Battle rules · asked 2026-10-23 · decided 2026-10-23
- Your 01:57 note: "summons 2 bulwark shields somewhere - vanguard and 4*N HP". The Vanguard skill acts only on the opening hand and the first card played, so a token would gain nothing from it. Built: the shields stand in the vanguard, the free front-row slots nearest the Bulwark unit, as 0/4N Structures with no skill.
  - As built (front row, no skill)
  - Give the shields Guardian
  - Give the shields Taunt
- **Default:** As built (front row, no skill)
- **Outcome:** Owner (10-23 11:11): "oh sorry, i meant guardian!" His "vanguard" meant Guardian: the Bulwark shields get Guardian (the second option). To build in package FX4.

**EN-4. The Coffer Mimic: Thorns 4 at 1 Lumber breaks cap 2** · Decide · Cards · asked 2026-10-23 · decided 2026-10-23
- New card (01:57 note 5): Coffer Mimic, a treasure chest in the Map 8 caves (m4 pool, basic pack), Structure, Shapeshifter (a Changeling for Structures only), Thorns 4, Lumber 1, Wait 1. By formula at Level 1: Uncommon N 18.9, S 10.9 (Thorns 4 x 2.7 + 0.1), so Health 8 (Common would be 6). Cap 2 (S x S 118.8 against (N/3)^2 39.8) cannot hold at any rarity with Thorns 4 at this cost (even Legendary is 76). Art: placeholder 🧰, NightCafe prompt in docs/art/new-cards-2026-10-21-briefs.md.
  - Keep: Uncommon 0/8, a named exception
  - Thorns 2 (fits cap 2 better)
  - Lumber 2
- **Default:** Keep: Uncommon 0/8, a named exception
- **Outcome:** Owner (10-23 11:11): "Thorns 2 Wait, why is thorns so expensive, at 1 per 2.7...Thorn 1 is roughly worse than Attack +1. So it must be less than 2. Balance it based on this assumption. Im also starting to think N/3 ^2 is too restrictive. Maybe 2*(N/3)^2 since we have A*H + S*|S|." The Coffer Mimic gets Thorns 2; Thorns is repriced under 2 a point (Thorns 1 is worth less than +1 Attack); cap 2 loosens from (N/3)^2 to 2*(N/3)^2. To build in package BF11. Built (BF11): Thorns 1.25 a point (measured), Coffer Mimic Thorns 2, cap 2 = 2×(N/3)²; 160 cards re-fitted, 23 held (BF11-1).

**EN-5. Backstab's conditions and its price (0.6 a point, an estimate)** · Decide · Balance · asked 2026-10-23 · decided 2026-10-23
- Built (D21): +N when the target is Blind, Stunned, Frozen, Asleep, Confused, Tipsy, Staggered, Paralyzed, Bound, Webbed or stone, or would swing blind in the dark while the attacker sees. Not included: a target still Waiting, a Shocked or Exposed target (they take more damage but fight as well). Price 0.6 a point (was 1.5 half-scale for the side rule), not measured: tools/skill_test_robust.js --skills backstab would measure it.
  - As built
  - Also when the target is still Waiting
  - Measure it before cards change
- **Default:** As built
- **Outcome:** Owner (10-23 11:11): "Target waiting, shocked and exposed would count I think." Backstab also triggers on a target that is still Waiting, Shocked or Exposed. To build in package FX4.

**EN-6. Which cards are baby-like (Fodder at Level 1)** · Decide · Cards · asked 2026-10-23 · decided 2026-10-23
- Built (EV-6): Stem from Level 1 on 23 cards picked by name: Terrier Pup, Snapper Hatchling, Bear Cub, Fox Kit, Fire Drake Hatchling, Kraken Spawnling, Duckling Squadron, Phoenix Fledgling, Otter Kit, Duckling, Cobalt Fledgling, Sparrow Chick, Rabbit Kit, Two-Headed Calf, Caiman Hatchling, Shallows Fry, Baby Bat, Baby Horned Capybara, Truffle Piglet, Harp Seal Pup, Musk Ox Calf, Greyplume Fledgling, Fawn Scout. Left out: Bramble Sprout (a plant), the eggs (they keep Stem / Chrysalis as before). Stats not re-fitted (Stem only matters under an Evomax evolute).
  - Keep this list
  - Name others to add or drop
- **Default:** Keep this list
- **Outcome:** Owner (10-23 11:11): "OKAY." The baby-like list (23 cards with Fodder at Level 1) stays as built.

**EN-7. How fast the volcano climbs back after an eruption** · Decide · Balance · asked 2026-10-23 · decided 2026-10-23
- Built (FX2-1): Very Low the round after an Eruption, then one level a round back to its own (a High volcano: Very Low, Low, Medium, Even, High). The comets still fall for the 3 rounds after the Eruption.
  - As built (one level a round)
  - One level every 2 rounds
  - Very Low until the comets end, then one level a round
- **Default:** As built (one level a round)
- **Outcome:** Owner (10-23 11:11): "OKAY" As built: the volcano climbs back one level a round after an Eruption.

**EN-8. Fog of War: does a fogged unit stop the CPU's targeted skills too?** · Decide · Battle rules · asked 2026-10-23 · decided 2026-10-23
- Built (FOG1): the CPU's choices (where and what to play, its hazards, fields and kill checks) read only what its fog shows. Swings, arrows and other auto-targeted skills still reach fogged units on both sides, so your units hit fogged enemies as before. The other reading: a CPU unit's random-target skills skip your fogged units (and the same for yours).
  - As built (fog limits choices, not rules)
  - Fogged units cannot be targeted by skills of the side that cannot see them
- **Default:** As built (fog limits choices, not rules)
- **Outcome:** Owner (10-23 11:11): "No, Fog doesn't change mechanics. Just information" As built: fog limits what a side knows and chooses, never what skills can reach.

**EB-1. Your real deck after T-2: the sturdier top-up (as built), or a new set of sturdy starter cards** · Decide · Tutorial · asked 2026-10-23 · decided 2026-10-23
- Your 01:57 note 1: the Base trainees stay weak, so the deck after T-2 must be stronger. Built: the baby filler (Honey Bee, Silver Minnow, Sparrow Chick) no longer joins the real deck, and the deck is topped up, one copy each, with the sturdier cards first: River Carp 2/10, Burrow Rabbit 2/10, Duck Paddler 2/10, Farm Dog 2/8, Chipmunk Forager 1/8, Otter Kit, Meadow Frog, then the old trainees (STARTER_CFG_DEFAULT.starterTopUp). Your side's list and the shared list (the 8 cards T-1 shows) stay. The limit: only about 7 vanilla cards of that size exist that no skirmish pays on its first clear, so about half the deck is still trainees (3/3s at Level 0). The live tutorial config also holds T-2's rewards (rewards2): Hummingbirds get the Crimson-Wing Recruit (3/1), Both the Riverwing Envoy (1/6); they would be sturdier cards too, but the live row wins until you republish it. Measured with the live lists (docs/balance/eb-2026-10-23.json): Map 0 78/58/37/20% before, 94/81/64/42% after (with the bramble and level changes in EB-2 and EB-3).
  - As built (sturdier top-up, filler out)
  - Add a set of new sturdy vanilla starter cards (about 2/8, one per role) and build the real deck from them
  - As built, and make T-2's rewards sturdier in the tutorial editor
- **Default:** As built (sturdier top-up, filler out)
- **Outcome:** Owner (10-23 11:11): "OKAY, but 1x each weak one should stay in the deck for variety. Remove Sparrow Chick. That's for Gannet Cliffs onwards." The sturdier top-up stays, but one copy of each weak trainee card stays in the real deck for variety; the Sparrow Chick leaves the starting cards (it belongs to Gannet Cliffs, Map 3, onwards). To build in package FX4.

**EB-2. Map 1 retuned: plain brambles and smaller ones on 1-1 to 1-4, mixed decks** · Decide · Balance · asked 2026-10-23 · decided 2026-10-23
- A fresh player's real deck won 6-9% of Map 1 (ant deck 45-62%, reference deck 0-12%, DF). The deciding factor is 2-Attack trades: the Hedgerow Burrow gave every enemy unit +1 Health, so a 2/8 survived one more hit than yours. Built: 1-1 to 1-4 defend a plain bramble (Health 5 / 6 / 7 / 6, Shield 1), the Baron keeps the Plains Terrace (+1 Attack to the first unit) at 6 Health + 2 Shield; the decks mix Map 1's 2/8 commons with Harvest Mouse, Meadow Rabbit, Cottontail and Ant Scout (Map 1's pool 'special'), 20 cards each, reward cards kept. Real deck, mean of the three sides, before -> after (target): 1-1 5.7 -> 83.7 (90), 1-2 7.3 -> 74.7 (80), 1-3 9.3 -> 74 (70), 1-4 6 -> 55.3 (60), 1-5 6 -> 39.3 (40). The reference deck now wins 88 / 78 / 78 / 57 / 53%, the ant deck 98 / 90 / 75 / 75 / 65% (40 games). The Hedgerow Burrow is on no Map 1 fight now.
  - As built (no Burrow on Map 1)
  - Put the Burrow back on the Baron (1-5) with an easier deck
  - Retune Map 1 against the reference deck instead
- **Default:** As built (no Burrow on Map 1)
- **Outcome:** Owner (10-23 11:11): "OKAY" As built: Map 1 has plain brambles and mixed decks, no Hedgerow Burrow.

**EB-3. The enemy at Level 0 on Map 0, rising to half Level 1 on Map 1; the fight panel still shows printed stats** · Decide · Balance · asked 2026-10-23 · decided 2026-10-23
- Your note: 'at Map 0 the units that are lvl 0 remain 0. Map 1, some of them can be lvl 1'. Your starting copies are Level 0, so the enemy's are now too: every Map 0 enemy card fights at Level 0 even when its own level is 1 (a Chipmunk Skirmisher 2/7, not 2/8), and on Map 1 a share of the copies is Level 1: 0, 25, 25, 50, 50% by the fight's place (EARLY_ENEMY_LEVEL; Map 2 on is Level 1 as before; the skirmish editor's Enemy level still wins). The fight panel's deck tiles still show the printed stats (2/8) while the fight plays the Level 0 ones; your own Camp tiles show your copies' level.
  - As built, and show the level's stats on the panel's tiles (a small UI package)
  - As built, leave the panel
  - Back to printed on Map 0 and Level 1 on Map 1
- **Default:** As built, and show the level's stats on the panel's tiles (a small UI package)
- **Outcome:** Owner (10-23 11:11): "OKAY ill rebalance Map 0-2" As built (Level 0 enemies on Map 0, half Level 1 on Map 1), and the owner rebalances Maps 0-2 himself. The default's small UI part (the fight panel's tiles show the level's stats) is to build in a later package.

**EB-4. Items: 2% per Energy of the fight, 3 a day: which Energy, and which items count** · Decide · Items · asked 2026-10-23 · decided 2026-10-23
- Your 01:57 note 8. Built: a Conquest win you played rolls 2% per Energy the fight cost you (nodeEnergyCost: Map 1's fights 1-2 Energy = 2-4%, Map 4 4 Energy = 8%, Map 10 about 7 = 14%, a boss double), and at most 3 items a day come this way; a free fight (Sweep, admin jump, cleared Spire floor) rolls nothing. Was: the day's first 3 Conquest wins each brought an item, sure. Items from A+ notices, finished weekly tiers and item-granting bosses still come on top and don't count against the 3. RW3's card drops use the fight kind's tier instead (a skirmish is 1 Energy there, whatever the map). The results tooltip still says 'your first 3 Conquest wins'; its wording is package UI4's.
  - As built (the Energy the fight cost; fight drops only)
  - Use the kind's tier like card drops (a skirmish 2%, an elite 4%, a boss 6%)
  - Count every item source against the 3 a day
- **Default:** As built (the Energy the fight cost; fight drops only)
- **Outcome:** Owner (10-23 11:11): "OKAY" As built: items roll 2% per Energy the fight cost, fight drops only, 3 a day.

**EB-5. Energy capsules: 8 Energy, a first-clear reward every three maps** · Decide · Rewards · asked 2026-10-23 · decided 2026-10-23
- Your 01:57 note 9. Built: a capsule gives 8 Energy (was 20) and is a first-clear reward token (the 🔋 placeholder, editable in Edit rewards) on 1-3, 2-1, 4-2, 6-3, 9-3, 12-3, 15-3, 18-3, 21-3 and 24-3: 10 capsules, 80 Energy over the road. 2-1's replaces the old 'first win on Map 2' capsule (a save that had it is not paid twice). The item tokens (capsule, Raid Ticket) now come on top of a fight's card reward and card drop; before, a token stood in for an elite's track card and shut off the skirmish's drop. A capsule already in a save gives 8 when used.
  - As built
  - More often (every other map)
  - Bigger capsules late (8 early, 15 from Map 12)
- **Default:** As built
- **Outcome:** Owner (10-23 11:11): "OKAY" As built: capsules give 8 Energy, a first-clear reward every three maps.

**EB-6. Map 0's brambles: plain on 0-1 to 0-3, 0-3 bigger, 0-4 smaller** · Decide · Balance · asked 2026-10-23 · decided 2026-10-23
- Built (your note: no-effect brambles in T-1, T-2 and Map 0, 'except maybe the last skirmish of Map 0, where it gives +1 attack to the first guy'): 0-2 and 0-3 lost the Outskirts Watchtower and T-2 its rival's, 0-4 keeps the Plains Terrace (+1 Attack to the first unit). Your bramble starts above the enemy's Health + Shield + 3 in T-1, T-2 and on Maps 0-1 (T-1 8 against 5, T-2 9 against 6; on Maps 0-1 your 15 is already higher). With the Level 0 enemy (EB-3), 0-3 was 76% against a 60% target, so its base bramble went from 7 to 12 Health, and 0-4 (20%, target 45%) from 8 to 5. Real deck, before -> after: 0-1 78 -> 94, 0-2 58 -> 81, 0-3 37 -> 64, 0-4 20 -> 42; T-1 89 -> 95, T-2 28 -> 78.
  - As built
  - Keep 0-3 and 0-4 at their old Health (0-3 then about 76%, 0-4 about 25%)
  - Make 0-4 plain too (about 42% at its old 8 Health)
- **Default:** As built
- **Outcome:** Claude's call (10-23, owner asked to settle the easy ones): As built, kept as built (Map 0's plain brambles; he rebalances Maps 0-2 himself (EB-3)).

**BF10-1. Evasive and Shadow cost more than they are worth too** · Decide · Balance · asked 2026-10-23 · decided 2026-10-23
- The robust skill test measured the other half-miss skills against their ×1.5 price: Evasive worth 5.77 vs 7.14 paid (deck wins 23.8%), Shadow 1.94 vs 7.14 (1.8%), Swift 7.03 vs 7.14 (fair). That points to Evasive ×1.37 and Shadow ×1.1. Only Flying (×1.39) was changed.
  - Evasive ×1.37, Shadow ×1.1
  - Evasive only
  - Leave them at ×1.5
- **Default:** Evasive ×1.37, Shadow ×1.1
- **Outcome:** Claude's call (10-23, owner asked to settle the easy ones): Evasive x1.37 and Shadow x1.1, because the robust test measured both as overpriced, the same way Flying was fixed. To build in a later package (balance: canonical/skill-costs.json, then a card re-fit).

**BF10-2. Bulwark 1 is priced 1 but measured at 3.27** · Decide · Balance · asked 2026-10-23 · decided 2026-10-23
- Same test: a Bulwark 1 deck wins 59.2% against the vanilla deck's 41.1% (net +1.34 stat points). You are redesigning Bulwark N (two vanguard shields of 4×N Health); price the new one after it is built.
  - Reprice after the redesign
  - Price the current one at 3.3 now
- **Default:** Reprice after the redesign
- **Outcome:** Claude's call (10-23, owner asked to settle the easy ones): Superseded by EN-2: Bulwark was redesigned and the owner set its price at 6 a point; nothing left to decide.

**PG-1. Copy ladder 5/4/3/2/1 per card, and the per-deck Legendary 3 / Mythic 2 caps on top** · Decide · Decks · asked 2026-10-23 · decided 2026-10-23
- Built (package PG, item 9): at most 5 copies of a Common (Starter too), 4 Uncommon, 3 Rare, 2 Very Rare, 1 of everything above, per card, in the Camp, the Standard deck, swaps, import, the fight gate and ghost / PvP decks. Package DR's per-deck caps (3 Legendary, 2 Mythic, 1 of each rank above, different cards counted together) are a different rule and were kept, so a deck still holds at most 3 different Legendaries. Disenchant / Fuse 'extras' follow the ladder (copies beyond 5 Commons, 4 Uncommons ... are extras now).
  - Keep both (as built)
  - Ladder only: drop the per-deck rank caps
- **Default:** Keep both (as built)
- **Outcome:** Claude's call (10-23, owner asked to settle the easy ones): Keep both (as built), kept as built (the copy ladder and the per-deck Legendary / Mythic caps both apply).

**PG-2. Saves from before the copy rules** · Decide · Decks · asked 2026-10-23 · decided 2026-10-23
- Base cards were free and unlimited until today. Once, for a player past the tutorial, every Base card in any of their decks got real copies up to what that deck holds, so no saved deck shrinks (a Quarry Mole x7 already in a deck stays). A deck over the new ladder (e.g. 7 Pond Trout) shows a pill in the Camp and can't start a fight until it is trimmed; nothing is cut automatically.
  - As built (keep copies, the player trims)
  - Trim saved decks to the ladder automatically
  - Take back the unlimited copies (each Base card to 1)
- **Default:** As built (keep copies, the player trims)
- **Outcome:** Claude's call (10-23, owner asked to settle the easy ones): As built (keep copies, the player trims), kept as built (old decks keep their copies and the player trims).

**PG-3. The starting deck: 20 different cards, one copy each** · Decide · Tutorial · asked 2026-10-23 · decided 2026-10-23
- Built (items 8, 10): the starting deck is one copy of each card of your side's list, the shared list and the filler (their numbers now only say which cards), topped up in order from starterTopUp (Pond Duck, Acorn Chipmunk, Cottontail, Chipmunk Forager, River Carp, Burrow Rabbit, Meadow Rabbit, Duckling, Harvest Mouse, Sheep ...) to 20 with T-1's and T-2's rewards. A fresh Otters account after 0-3 holds 25 copies of 24 cards (Otter Centurion x2 with T-2's reward; everything else x1) and the Camp lists only those, instead of 44 'owned' cards, 38 of them unlimited. The deck builder lists only cards you hold. The top-up list is in STARTER_CFG_DEFAULT (the tutorial editor does not show it yet).
  - As built
  - Pick the top-up cards yourself (tutorial editor)
  - Let the first deck be short of 20
- **Default:** As built
- **Outcome:** Claude's call (10-23, owner asked to settle the easy ones): As built, kept as built (the starting deck of one copy each, with EB-1's change on top (one of each weak card stays, no Sparrow Chick)).

**PG-4. Clearing a map takes you to the next one** · Decide · Map · asked 2026-10-23 · decided 2026-10-23
- Item 13. The gate already opened Map 1 the moment 0-4 was won (checked on a fresh account, and Map 1 -> 2). What landed you on a locked map was Map 0's signpost: its 'Show me the road' pointed at Clovermead, a side map of Map 1 that waits on Map 12. It now points at Thistlewood, a signpost to a locked map says what opens it instead of moving you, and the locked notice offers the way back. Also built: after the fight that clears a map, back on the map you are taken to the next map once.
  - As built (move on to the next map)
  - Stay on the cleared map
- **Default:** As built (move on to the next map)
- **Outcome:** Claude's call (10-23, owner asked to settle the easy ones): As built (move on to the next map), kept as built (clearing a map moves you on to the next one).

**PG-5. A unit at 0 Health before its action ends** · Decide · Battle rules · asked 2026-10-23 · decided 2026-10-23
- Item 4. A 3/7 Armor 1 Beetle Grunt hit 4, 4, 2 shows 3, 3, 1 and dies at exactly 0; in 13 auto-played 0-4 fights the shown Health matched the engine after every hit and round and every death played at 0 (screens in docs/screens/PG; the final hit shows its number and Health 0 together). The engine removes the dead after each attacker's action and each skill action, as you said. One gap with your rule: inside the same action a unit at 0 can't be healed (applyHeal refuses 0 Health), and its On Attacked / Bleed-on-defend don't fire. Should a heal or shield that lands later in the same action save it?
  - As is (0 Health = dead, removed when the action ends)
  - A heal later in the same action saves it
- **Default:** As is
- **Outcome:** Claude's call (10-23, owner asked to settle the easy ones): As is, kept as built (0 Health is dead, removed when the action ends (his rule)).

**PG-6. Enemy decks and the new copy ladder** · Decide · Decks · asked 2026-10-23 · decided 2026-10-23
- The ladder was built for the player's decks (Camp, Standard, swaps, import, fights) and ghost / PvP decks. 122 of 467 skirmish / elite / boss decks hold more than it allows (e.g. 22-5 Cinder Hornet x7 Common, 22-7 Caldera Snow Leopard x2 Super Rare, 1-A-5 Tunnel Ant x4 Rare); they are unchanged. tests/thematic-2026-10-19.js flags the four it watches.
  - Leave enemy decks as they are
  - Fit them to the ladder (tools/map_divvy check + a pass)
- **Default:** Leave enemy decks as they are
- **Outcome:** Claude's call (10-23, owner asked to settle the easy ones): Leave enemy decks as they are, kept as built (enemy decks are left off the copy ladder).

**GD2-1. The skill that shields allies from skills: Spellshield 🪬** · Decide · Battle rules · asked 2026-10-22 · decided 2026-10-23
- Built as Spellshield 🪬 (engine key spellshield): a single-target enemy skill (an arrow or other shot, a Bolt, a damage or status skill) aimed at a unit adjacent to it hits it instead; never itself; several at random. Price 0.8 in canonical/skill-costs.json, an estimate (about 3/4 of Guardian's 1.06: fewer hits come as skills than as swings, but they are the heavier ones). No card has it yet; measure it with tools/skill_test_robust.js before one gets it.
  - Spellshield
  - Spell Ward
  - Mirrorguard
- **Default:** Spellshield
- **Outcome:** Owner (10-23 00:10): "Spellward." Not the default name: the skill is called Spellward (his spelling, one word; the second option), not Spellshield. Rename it everywhere (engine key, texts, language packs); the rule itself is unchanged. To build in package EN: the name is "Spellward" (one word, his spelling). Built (EN): the skill is Spellward everywhere: engine key effects.spellward (an old card's spellshield still reads as it, and saved cards are migrated as they load, enMigrateCard), texts (TX ui.skn-spellward ...), the 12 packs (the Spellshield rows replaced), Codex, editor, skill-costs.json (id spellward, 0.8).

**GD2-2. Cleave's side damage isn't a swing a Guardian takes** · Decide · Battle rules · asked 2026-10-22 · decided 2026-10-23
- Guardian takes plain swings: the main attack and each prong of a Fork, Trident, Pitchfork or Octolash (each prong is a full single-target swing). Cleave's bonus damage to the units beside the target is a spread of one swing, so it reaches those units, as before.
  - As built
  - A Guardian takes Cleave's side hits too
- **Default:** As built
- **Outcome:** Owner (10-23 00:10): "As built." Guardian keeps taking plain swings only; Cleave's side hits still reach the units beside the target (the default).

**GD2-3. Seven maps have no skirmish-exclusive card** · Decide · Rewards · asked 2026-10-22 · decided 2026-10-23
- Maps 4, 6, 11, 12, 18, 20 and 21 have no skirmish whose first clear pays an exclusive card: their own cards sit on their elites and bosses, or are their pack cards. Left as they are ("if it turns out there is not much left, then okay"); their skirmishes pay pack cards. Giving each one would move one of its pack cards (or an elite's card) to a skirmish.
  - As built
  - Move one card to a skirmish on each of those maps
- **Default:** As built
- **Outcome:** Owner (10-23 00:10): "Skirmish exclusives have priority. So move the pack cards." Not the default: on Maps 4, 6, 11, 12, 18, 20 and 21 one pack card moves to a skirmish as its first-clear exclusive card. To build in package RW3. Built (RW3): every main map has a skirmish-exclusive card now. Maps 4, 6, 11, 12, 18, 20, 21 had none: 1 card moved out of the packs on the maps with fewer than 4 skirmishes (Maps 4, 21), 2 on the others (12 cards: snapstick-turtle 4-1; poison-dart-croaker 6-1, booming-bittern 6-2; alpine-marmot 11-1, eagle-owl-quartermaster 11-2; bramble-hoglet 12-1, cunning-vixen 12-2; thorny-devil 18-1, caustic-scorpion 18-2; pack-mule 20-1, ash-cloud-condor 20-2; pika-hoarder 21-1), each from that skirmish's own deck (tools/rw3_first_rewards_2026_10_23.js). Exclusive skirmishes 23 -> 36 (with the Quarry Mole on 8-1, RP3).

**GD2-4. No new free packs or tokens on skirmishes** · Decide · Rewards · asked 2026-10-22 · decided 2026-10-23
- Pack rewards on skirmishes stay as they were (Map 0's 0-2 faction pack; the map free packs are on bosses). Adding packs or Faction Reward tokens to skirmishes would speed up the economy and the faction track, both tuned. 33 of the 101 skirmishes pay no card.
  - As built
  - Add a free pack or a token to some of the 33
- **Default:** As built
- **Outcome:** Owner (10-23 00:10): "A Skirmish must always give either a pack of that 'season', a faction pack or a skirmish exclusive or a card of that season's pack" Not the default: the 33 skirmishes that pay nothing now pay one of those four; no skirmish pays nothing. To build in package RW3. Built (RW3): no skirmish pays nothing on its first clear: 101 main-map skirmishes = 36 exclusive cards, 64 cards of that map's pack, 1 pack (0-2's faction pack); was 23 / 44 / 1 / 33 nothing. Every map still had pack cards to give, so no new season or faction pack was needed; the fallback (that season's pack, then your faction pack, taking turns) is built (SKIRMISH_FIRST_PACKS) and empty.

**GD2-5. What reads "adjacent" and what keeps its shape** · Decide · Battle rules · asked 2026-10-22 · decided 2026-10-23
- On adjacent (in front / behind too, in a raid): Guardian, Spellshield, Formation, Haste, Shieldwall, Amplifier, Immolation, Irradiated, Inspiring, Friction, Proliferate, Electricity, Chain Lightning, Dragon Lightning, Spitfire's splash, the Adjacent Ally target. Kept as they are: shapes across the board (Fireball's 3 columns, Meteor, Rocket, Dynamite's 3x3, Cleave, the prongs, Taunt, Stench, Landslide, Ambush / Sentry facing), where a token appears (Twin, Sprout, Brood, Palisade, Spawner: a free slot nearby), and Pack chains (front row only today).
  - As built
  - Pack chains across rows too
  - The splash shapes too
- **Default:** As built
- **Outcome:** Owner (10-23 00:10): "Okay. Dynamite is adjacent but including diagonals - is there a way to name this?" Keep the shapes as built (the default). Open naming question: Dynamite reaches the 8 cells around its target, diagonals included; EN proposes one word for it (suggested "Surrounding": left, right, in front, behind and the four diagonals) and uses it in the texts, leaving "adjacent" at the four directions. To build in package EN. Built (EN): the word is "Surrounding": the 8 places around a unit (left, right, in front, behind and the 4 diagonals; in a raid its own rows in front and behind too). A Codex term beside Adjacent. Skills of that shape, now worded with it: Dynamite ("to every surrounding unit"; on the raid board it now also reaches its own rows in front and behind, diagonals included), Scavenge and Salvage. Adjacent stays the four directions. Owner (10-23 11:11): "Adjacent - Up/Down/Left/Right; Surrounding - include diagonals -> Okay!" Confirmed as built.

**GD2-6. An Easter egg a player owns shows as a plain card** · Decide · Codex · asked 2026-10-22 · decided 2026-10-23
- Outside Admin Mode nobody sees an Easter egg: no "???" slot, no section, no count, no filter or search hit, no Easter-egg words. A player who owns one anyway (only an admin grant gives one) sees it in their Codex as an ordinary card, its where-to-get line "Not obtainable yet".
  - As built
  - Hide it from its owner too
- **Default:** As built
- **Outcome:** Owner (10-23 00:10): "Yes. The method to own one is in giveaways or supremely low chance in mystery packs" An owner keeps seeing the Easter egg as an ordinary card (the default); what is new is how a player can own one: giveaways, or a supremely low chance in mystery packs. To build in package RW3. Built (RW3): a Mystery Booster card is an Easter egg 0.05% of the time (1 in 2,000 cards; MYSTERY_EGG_CHANCE), one of the nine at random, granted through its own source 'mysteryEgg'. Giveaways are the admin grants that already existed.

**GD-1. Guardian's front / behind is raid-board only** · Decide · Battle rules · asked 2026-10-22 · decided 2026-10-22
- In front / behind needs rows that fight, so it applies on the raid board (3 rows, every row acts). Elsewhere a reserve row is only waiting to step up (not on the battlefield), so a Guardian waiting there doesn't guard the unit in front of it, and nothing guards a waiting unit. Normal fights have one row, so they only have left / right (the card matrix shows 0 changed fights); in 600 random raid-board fights with Guardians, 508 ended differently.
  - As built (raid board only)
  - Waiting reserves guard too
- **Default:** As built (raid board only)
- **Outcome:** Owner 19:27: "GD-1: From now on, things that deal with L/R can just say 'adjacent' e.g. Formation cares about adjacent units. Adjacent is defined as behind, in front, left, right. Only relevant in raids or multi-player dungeons. (I see that Guardian's short desc is already correct)" Built (package GD2): one engine helper, adjacentOf (bramblewood-engine.js): left and right in a unit's own row, plus directly in front / behind only where every row fights (the raid board, RESERVE_ACTS); elsewhere just left / right, so ordinary fights play exactly as before. On it: Guardian, the new Spellshield, Formation (a waiting reserve no longer counts), Haste, Shieldwall, Amplifier, Immolation, Irradiated, Inspiring, Friction, Proliferate, Electricity, Chain Lightning, Dragon Lightning, Spitfire's splash and a trigger's Adjacent Ally target. Their texts and the Codex term say "adjacent" (12 packs). Column shapes keep their columns (call GD2-5). Owner (10-23 11:11): "Adjacent - Up/Down/Left/Right; Surrounding - include diagonals -> Okay!" Confirmed as built.

**GD-2. Which Guardian steps in: left, right, in front, behind** · Decide · Battle rules · asked 2026-10-22 · decided 2026-10-22
- When two or more Guardians are next to the target, the first in this order takes the hit: left, right, the one in front, the one behind (the old rule was left before right). A Guardian never guards itself, but a Guardian next to another Guardian is guarded by it.
  - As built (left, right, in front, behind)
  - In front first (it stands between the enemy and the target)
- **Default:** As built (left, right, in front, behind)
- **Outcome:** Owner 19:27: "GD-2: Random," Built (package GD2): when two or more Guardians are adjacent to the target, one of them takes the hit at random (the fight's seeded RNG, so replays repeat; it only rolls with two or more, so a fight with one Guardian draws the same numbers as before).

**GD-3. Status-only skills still go to the unit they aim at** · Decide · Battle rules · asked 2026-10-22 · decided 2026-10-22
- Guardian takes single-target hits: a swing, an arrow or another shot, and a skill that deals damage to one target. A skill that only puts a status on one enemy (Poison, Expose, Stun, Bleed or Add Wait aimed at one unit) is not redirected, as before. Area hits are never redirected.
  - As built
  - A Guardian also takes single-target statuses
- **Default:** As built
- **Outcome:** Owner 19:27: "GD-3: AOE can't get redirected. Status only skills hmm. I think if it's skills (including arrow), guardianship doesn't help. So no redirection for skills. We have ward for dodging skills right? There can be a similar skill - but for shielding allies from skills." Built (package GD2): Guardian redirects plain swings only: a unit's basic attack and the prongs of that swing (Fork, Trident, Pitchfork, Octolash: each prong is a full single-target swing). Cleave's side damage is a spread of the swing, so not redirected, as before (call GD2-2). Arrows (Arrow, Archer, Snipe), Bolts, shots, damage and status skills reach their target; areas never redirect. New skill Spellshield 🪬 (call GD2-1 for the name): a single-target enemy skill aimed at an adjacent ally hits the Spellshield unit instead. There is no Ward that dodges skills in the game: the closest are Helmet (deflects half the shots aimed at it) and Evasive.

**GD-4. 💥 is the crit mark; the hit burst keeps 💥** · Decide · Battle UI · asked 2026-10-22 · decided 2026-10-22
- On numbers and log lines 💥 now means a crit only: Explode's fuse line and its "Boom!" float use 💣, Stampede's log line and its carry-over preview (+N) use 🐘. The quick burst that flashes on a card when it's hit by a physical attack is still a 💥, with no number on it (elemental hits show their own glyph). The raid smack's log line ("💥 X sweeps your front row"), "💥 Crash!" and "👑💥 King Slayer!" keep theirs (words, not a number).
  - As built
  - Change the hit burst too (e.g. a white spark)
  - Change every other 💥 in the battle
- **Default:** As built
- **Outcome:** Owner 19:27: "GD-4: King Slayer: 🗡️, Fencer: 🤺" Built (package GD2): King Slayer's float is "🗡️ King Slayer! +N" (was 👑💥); a Fencing unit's plain hit bursts as 🤺 instead of 💥 (Fencing had no float or log mark of its own; the hit burst was its 💥).

**GD-5. Skirmishes whose first clear is a pack or a token: 7%** · Decide · Rewards · asked 2026-10-22 · decided 2026-10-22
- Every first-clear reward card a skirmish pays today is skirmish-only (since RP, a map's reward cards are never pack cards), so the tripled drop covers those skirmishes. A skirmish whose first clear gives a pack or a Faction Reward / Growth token has no single card to drop, so it has the plain 7% pack-card drop on every win (it had none). If a skirmish is ever given a pack card as its reward, the same 21% rule picks it up.
  - As built (7%)
  - Triple those too (21% pack cards)
- **Default:** As built (7%)
- **Outcome:** Owner 19:27: "GD-5: No. There should be a mix of 'no first clear card', 'first clear skirmish-exclusive card', 'first clear pack card reward' and of course pack rewards.. Skirmish exclusive makes up 1-2 (max 3). The rest are a mix of the rest. If it turns out there is not much left, then okay." Built (package GD2): a skirmish's first clear can pay a pack card of its own map (SKIRMISH_FIRST_PACK_CARDS, written by tools/gd5_first_cards_2026_10_22.js; the card stays a pack card). The exclusive cards stay where they were (every map had 0-2). The other skirmishes alternate pack card / none: of 101 main-map skirmishes, 23 pay an exclusive card, 44 a pack card (each one from that fight's own deck), 1 a pack (0-2), 33 nothing. A pack-card skirmish drops like an exclusive one: 7% on its first clear, 21% on repeats with that card at its rarity share. Calls GD2-3, GD2-4. docs/balance/gd5-first-cards-2026-10-22.json.

**GD-6. The drop line shows the reward card's chance per win** · Decide · Rewards · asked 2026-10-22 · decided 2026-10-22
- A cleared skirmish's drop line reads, for a Common reward card: (card) 13% · 🃏 8.4%, its chance a win (21% x 60% = 12.6%, rounded as the line rounds above 10%) and the pack card's share. Before the first clear it reads 🃏 7% (the card itself is in the First Clear box).
  - As built (chance per win)
  - Show 🃏 21% and the card's share of it (60%)
- **Default:** As built (chance per win)
- **Outcome:** Owner 19:27: "GD-6: Sounds correct I think? For skirmish first-clear reward card drops - they don't roll twice. They just roll for the skirmish-exclusive, then if they get it, they roll within it to see if they get another card instead." Checked (package GD2): rollCardDrop already does exactly this: one roll at 21% on a repeat win, then within it the reward card's rarity share (Common 60% ...), else a pack card; no second roll (a Common reward: 12.6% the card, 8.4% a pack card; 20,000 seeded rolls in tests/gd2-2026-10-22.js). Nothing changed. The panel line shows the per-win chance, as built.

**DN2-1. An elemental crit shows only its big glyph, no 👊** · Decide · Battle UI · asked 2026-10-22 · decided 2026-10-23
- Read from "can you just make the damage type emoji bigger if it's non physical": an ice crit on a Fragile unit now reads (big ❄️)14🦴 (DN had 👊❄️14🦴). A physical crit keeps 👊7. One switch brings the fist back on elemental crits (DMG_CRIT_FIST_ON_ELEMENT).
  - As built (big glyph only)
  - 👊 and the big glyph
- **Default:** As built (big glyph only)
- **Outcome:** Owner (10-23 00:10): "Yes." As built: an elemental crit shows only its big glyph.

**DN2-2. Damage numbers lead with the damage type, not the source** · Decide · Battle UI · asked 2026-10-22 · decided 2026-10-23
- Following the rule (type glyph, none for physical), numbers that used to show their source now show their type: an Arrow Slits arrow, a trap, Pierce, Stampede, Friction, a Penance / Blood Tithe payment and the tentacle's stamp are plain numbers (was 🏹 🪤 🗡 💥 ⚙️ ⛧ 🦑); a comet or scorched ground is 🔥 (was ☄️ 🌋); Decay is 🍂 (was 🦠). Ticks with no element keep their own glyph: Curse 🜏, Chilli 🌶️, Strangle 🪢. The skill's own effect (the tentacle, the arrow, the spark) still plays.
  - As built
  - Keep a source glyph on physical-only sources (🏹 🦑 🪤)
- **Default:** As built
- **Outcome:** Owner (10-23 00:10): "Yes." As built: damage numbers lead with the damage type.

**DN2-3. The log's "💥 Crit!" becomes the 👊 on the number** · Decide · Battle UI · asked 2026-10-22 · decided 2026-10-22
- A crit's log line now reads "hit X for 👊14🦴 ❄️ cold damage" instead of "... for 14 ❄️ cold damage 💥 Crit!". An Ambush hit (no 👊 on its floating number either) keeps the words.
  - As built
  - Keep "💥 Crit!" too
- **Default:** As built
- **Outcome:** Owner 18:20: "DN2-3: 💥 is a better symbol for Crit to me." Built (package GD): 💥 replaces 👊 as the crit mark on floating numbers, bramble hits, the battle log ("hit X for 💥14🦴 ❄️ cold damage"), the Codex's "reading damage numbers" line and DN2's constants (DN_CRIT_MARK). Other 💥 that sat on a number or a log line moved off it: Explode's fuse line and its "Boom!" float are 💣, Stampede's log line and its carry-over preview (+N) are 🐘.

**DN2-4. "Higher hue" is +12 degrees for every element** · Decide · Battle UI · asked 2026-10-22 · decided 2026-10-23
- Built as asked (lighter by 10%, hue +12 degrees). Fire turns a brighter yellow-orange and magic a pinker violet, but ice turns slightly bluer (its hue is already past cyan), not the lighter cyan I described at 15:39. Poison greens turn a little bluer too.
  - As built (+12 for all)
  - Warmer for every element (fire and magic +12, ice and poison -12)
- **Default:** As built (+12 for all)
- **Outcome:** Owner (10-23 00:10): "Okay. Maybe poison turns a little less bluer than it would do, and abit brighter instead." Keep +12 degrees for every element, but poison's shift is eased so it goes less blue and a little brighter. To build in package SX. Built (SX): DMG_CRIT_BY_CLASS = {poison: {hue: 5, lighten: 0.16}} next to DN2's knobs; poison (and acid and decay, which share its colours) turns +5 degrees and 16% lighter (its crit number is a light yellow-green, hsl 100 65% 70%, not teal); every other element keeps +12 degrees and 10%.

**DN-1. Hit numbers drop the minus sign; the other damage numbers keep theirs** · Decide · Battle UI · asked 2026-10-22 · decided 2026-10-22
- Package DN follows the note's format exactly ("🔥20⛨"), so a unit hit now reads 🔥3⛨, 👊7, 👊❄️14🦴, 5 (was 🔥 -3, -7, 👊❄️ -14). The other damage numbers are separate code and keep their old look with a minus: Bleed and Poison ticks, field damage (comets, lava, hail, the tentacle's 🦑 −2), bramble hits on the HP bar, Reflect and Thorns. Colours are unchanged everywhere.
  - As built (hits only)
  - Bring every damage number to the new format
  - Put the minus back on hits
- **Default:** As built (hits only)
- **Outcome:** Owner 15:39: "DN-1 Yes. DN-3 OKAY. DN-4 Yes. DN-2 Im now thinking, can you just make the damage type emoji bigger if it's non physical. e.g. wand for magic becomes big if its crit! or even colour burn it abit? What would the color of the text be btw? a 10% lighter and higher hue version of the original color?" Built (package DN2): every damage number reads <type glyph><number><mark> with no minus: Poison / Bleed / Decay / Toxin / Strangle / Curse / Chilli ticks, field damage (scorched ground, eruption, comets, lava, hail, ley lines, the depths, arrow slits, landslide), bramble hits on the HP bar (Bulwark is the ⛨), Pierce and Stampede, Reflect / Thorns, Friction, Recoil, Ichor, traps, the meteor's crater, Fire on hit, the firepot, splash, and the raid's Tentacle Smack / Tail Sweep stamps. The engine adds the marks (mods) to those events; no number changed (card matrix: 0 diffs). Heals keep their look.

**DN-2. The marks after a hit number, and which one wins** · Decide · Battle UI · asked 2026-10-22 · decided 2026-10-22
- One mark per hit, the strongest: 🚫 immune (the hit did 0 because of Immune, Invincible or a Cower shell), then ⛨ blocked to 0 by Armor, then 🦴 Fragile, then 💢 Weakness (also Shocked, which takes ×1.5), then ⛨ any reduction (Armor, Resist, Sturdy, Shell / temporary Health, stone, Rage's half, Scare, Ghost / Atheist halving). The engine now tags each hit with why its number moved (`mods` on the hit event, display only). ⛨ is a text symbol (no emoji exists), drawn in steel with a dark edge.
  - As built
  - Separate marks for Armor and Resist
  - Show two marks when an up and a down both apply
- **Default:** As built
- **Outcome:** Owner 15:39: "DN-1 Yes. DN-3 OKAY. DN-4 Yes. DN-2 Im now thinking, can you just make the damage type emoji bigger if it's non physical. e.g. wand for magic becomes big if its crit! or even colour burn it abit? What would the color of the text be btw? a 10% lighter and higher hue version of the original color?" Built (package DN2): the mark rule stays as built. A crit that isn't physical draws its type glyph 1.4x on a soft burn in the element's colour (no 👊), and its number takes the type's colours 10% lighter and 12 degrees up the hue wheel (DMG_CRIT_LIGHTEN 0.10, DMG_CRIT_HUE 12, DMG_CRIT_GLYPH_SCALE 1.4 in arena_app.js). Marks keep their size; a physical crit keeps 👊; normal hits keep their colours.

**DN-3. Crits use the game's 👊, not ❇** · Decide · Battle UI · asked 2026-10-22 · decided 2026-10-22
- The note suggested ❇ for elemental crits unless the game already had a crit mark. It does: 👊 (since 2026-10-08). So a physical crit reads 👊7 and an ice crit on a Fragile unit reads 👊❄️14🦴.
  - Keep 👊
  - Use ❇ for elemental crits only
  - Use ❇ for every crit
- **Default:** Keep 👊
- **Outcome:** Owner 15:39: "DN-1 Yes. DN-3 OKAY. DN-4 Yes. DN-2 Im now thinking, can you just make the damage type emoji bigger if it's non physical. e.g. wand for magic becomes big if its crit! or even colour burn it abit? What would the color of the text be btw? a 10% lighter and higher hue version of the original color?" Kept: 👊 is the crit mark (physical crits).

**DN-4. The battle log keeps its own wording** · Decide · Battle UI · asked 2026-10-22 · decided 2026-10-22
- The log doesn't share the floating number's formatter (it says "hit X for 3 🔥 fire damage — blocked to 0 by Armor! 🛡 … 💥 Crit!"), so DN left it unchanged; no golden or log text moved. The same marks could be added to its lines.
  - As built
  - Add the 🦴 / 💢 / ⛨ / 🚫 mark to log lines
- **Default:** As built
- **Outcome:** Owner 15:39: "DN-1 Yes. DN-3 OKAY. DN-4 Yes. DN-2 Im now thinking, can you just make the damage type emoji bigger if it's non physical. e.g. wand for magic becomes big if its crit! or even colour burn it abit? What would the color of the text be btw? a 10% lighter and higher hue version of the original color?" Built (package DN2): battle-log damage lines carry the same marks after the number (🦴 💢 ⛨ 🚫) and 👊 before a crit's number, and the element glyph where the line names the type ("took 3 ☠️ poison damage", "2 🧪 acid", "1 💭 psychic damage"). Wording otherwise unchanged; the marks sit inside the translated templates' values, so the 12 packs still match.

**FX1. Which field effects count as "similar" to Crushing Depths (now 1 damage)** · Decide · Balance · asked 2026-10-22 · decided 2026-10-22
- Set to 1 damage a round by default, and every map number brought down to 1: Crushing Depths (5; the raid's 2), Hail (3; maps 22-4, 22-7, 22-8 had 2), Glass-storm (random 1–3), Lava Spout (3; 22-5, 22-8 had 2), Leylines III (3 to units and brambles), Thunderstorm (2; 10-7, 10-9), Arrow Slits (2; 23-7 had 3, 24-5 and 24-8 had 2). Left alone: Landslide (1 in 4 rounds, 5 to three columns: a chance event, not every round), the volcano's hazards and Scorched Ground (boss mechanics), Tide-spout (already 1), Ash Rain (1 to brambles only).
  - Keep this split
  - Landslide to 1 too
  - Landslide to 2–3
- **Default:** Keep this split
- **Outcome:** Owner 14:12: "FX-1: Landslide 1/4 chance to deal 3. Volcano hazards - idk how much I wrote, but 5 may be the max dmg. The normal average damage over a turn cannot exceed 1 in this case." Built (package FX2): Landslide 1 in 4 for 3 (was 5; 0.75 a round on a unit in its columns). The volcano: Lava Tide 1 (was 3), Eruption 1 (was 2), comets 1 to every unit (was a random 2–5), Scorched Ground's editor preset 1 (was 2). Each hazard's number times its chance stays at or under 1 at every volcano level, and a map's own number is capped at 5. Measured on the only level the maps use (low, 22-6 and 22-8): 0.41 a unit a round from all three together (about 1.35 before). Call FX2-1 asks about the higher levels combined.

**FX2. How a 1-damage Crushing Depths halves for Swimmers** · Decide · Balance · asked 2026-10-22 · decided 2026-10-22
- Chosen: a halving keeps at least 1, so at 1 damage a Tide unit or Swimmer takes 1 like everyone. Only when both halvings stack (a Swimmer or Tide unit that also resists water) does it round down: 0 at 1 damage. Hail and Lava Spout keep the game's usual Resist rule (half, at least 1), so Resist does nothing against a 1.
  - Keep (at least 1; Swimmer + Water Resist takes 0)
  - Swimmers take 0 at 1 damage
  - Always at least 1
- **Default:** Keep (at least 1; Swimmer + Water Resist takes 0)
- **Outcome:** Owner 14:12: "FX-2: we shall do normal rounding. if x < 0.5, 0; else 1. Is this fair? Only round once, when it comes into fruition on the battlefield. Internal calculations should never round. Even when passing numbers between functions. Idk how you code it internally - the first ApplyDamage(X) before damage calculation and etc. then the final real ApplyDamage(Y) which results in a literal ReduceHealth(Y) 1-1 + firing related triggers." Built (package FX2): damage is worked out exactly (Resist, Weakness, Fragile, Sturdy, Ghost / Supreme / Shade / Atheist halves, Shock x1.5, Rage's half, stone, Armor, a row's half share, Bloodlust, half lines, Stagger, the Psychic Dampener, a Swimmer's half in the Crushing Depths) and rounded once, half up, in applyDamage, the one place a unit's Health goes down for a hit (damageHQ for a bramble). So a Swimmer at 1 takes 0.5 -> 1, a water-resistant Swimmer 0.25 -> 0, as this call's default had it; a 3 into Resist now lands 2 (was 1), a 5 lands 3 (was 2). The "at least 1" after a factor or a half is gone (it was a patch for rounding down).

**FX3. The Tail Sweep: purple tentacle now, but still always your front row for 3** · Decide · Raids · asked 2026-10-22 · decided 2026-10-22
- The green "worm" on PC was the Tail part's Tail Sweep, which always hits your front row (its rule, at every width). It is now drawn as the purple tentacle along the front row. Its damage (3 every 2 turns) is its own data and was not changed. The Tentacle Smack (arms and Core) is 1–2 now in the raid fight; the classic trench mode keeps its 6.
  - Keep the Tail Sweep as is
  - Tail Sweep picks a random row like the Smack
  - Tail Sweep 1–2 damage too
- **Default:** Keep the Tail Sweep as is
- **Outcome:** Owner 14:12: "FX-3: Raids hit too hard. Tail sweep for 2 instead? If its supposed to be the stronger attack among the first 3 fights before the core, okay. Otherwise, 1-2. The weaker attacks should just be 1 (AOE). Non AOE attacks can go up to 3, but in this case, there isn't." Built (package FX2): the Tail Sweep is the strongest AOE attack of the first three fights (your whole front row, every 2 turns), so it deals 2 (was 3). The Tentacles' Tentacle Smack (a column or a row, every 3 turns) is a weaker AOE attack: 1 (FX had 1–2). There are no single-target boss attacks. The Core's smack keeps FX's 1–2 (call FX2-2). The classic trench now uses the same numbers (no trenchDmg 6); its balance test holds with the Core's trench bramble at 300 (was 200). The Tail Sweep stays on your front row.

**FX2-1. The volcano's hazards together, at its higher levels** · Decide · Balance · asked 2026-10-22 · decided 2026-10-23
- Each hazard alone stays at or under 1 a unit a round (Lava Tide, Eruption, comets and Scorched Ground are 1 each). Together, measured with 3 units a side over rounds 2–20: very low 0.10, low 0.41 (the only level the maps use), medium 0.64, rising ("even") 1.19, high 1.34, because after an eruption comets hit every unit for 3 rounds and at the higher levels eruptions come almost every round. The most one unit took in one round was 3 (a comet, an eruption and lava together).
  - As built (each hazard at most 1)
  - Comets 1 in 2 rounds at the higher levels
  - Cap the volcano at 1 a unit a round in total
- **Default:** As built (each hazard at most 1)
- **Outcome:** Owner (10-23 00:10): "After eruptions, it restarts to very low again." Not one of the three options: the volcano's level falls back to very low after each eruption and climbs again, instead of rising to the higher levels and staying there. To build in package EN. Built (EN): after each Eruption the volcano is Very Low the next round and climbs one level a round back to its own (Very Low, Low, Medium, Even, High); an Even volcano rises again from there. The forecast carries the level (volcanoLevel). How fast it climbs is call EN-7.

**FX2-2. The Core's Tentacle Smack keeps 1–2** · Decide · Raids · asked 2026-10-22 · decided 2026-10-22
- Your rule covers the first three fights (the Tentacles and the Tail): the Tail Sweep 2, the Tentacles' smack 1. The Core is the fourth fight, so its smack keeps FX's 1–2 (a seeded 50/50, shown on the tentacle). In the classic trench (admins only) a smack doesn't roll, so the Core's is 2 there.
  - Keep the Core at 1–2
  - The Core's smack 1 too
  - The Core's smack 2
- **Default:** Keep the Core at 1–2
- **Outcome:** Owner 18:20: "FX2-2: OKAY". Kept as built: the Core's Tentacle Smack stays 1–2.

**FX2-3. A half of 1 is 1: Resist, Ghost, Atheist and the Psychic Dampener no longer stop a 1** · Decide · Balance · asked 2026-10-22 · decided 2026-10-22
- Under one rounding half up, a single halving of 1 is 0.5 and lands as 1, so Resist, a Ghost's, Supreme's or Shade's half, Atheist and the Psychic Dampener do nothing against a 1-point hit or tick (a Ghost took 0 from a 1-point poison tick before; a dampened Psychic 1 did nothing; now both are 1). Two halvings (0.25) still come to 0. Across the card matrix's 30,680 fights, 488 changed, 48 of them changed winner, all from this kind of rounding.
  - As built (your rule as written)
  - Round halves down only for a 1 (a resisted 1 is 0)
  - Bring back "at least 1" with rounding down
- **Default:** As built (your rule as written)
- **Outcome:** Owner 18:20: "FX2-3: OKAY as is". Kept as built: one rounding half up, so a halved 1 lands as 1.

**BF8-1. Blinding priced 2.5 (my guess); two more ways to blind are for later** · Decide · Balance · asked 2026-10-22 · decided 2026-10-23
- You said Blinding is a flat skill and asked me to guess. It is 2.5 for 50% a hit, 2 rounds (Horned Lizard): between Paralyze 2 and Stun on Hit 3. Horned Lizard re-fitted 4/5 → 5/7. You named three ways to blind (dazzling lights, a powder or acid spray, poking the eyes); only the one skill exists, shown as Blinding. The other two are not built.
  - Keep 2.5
  - Cheaper (2)
  - Dearer (3)
  - Build the other two ways to blind
- **Default:** Keep 2.5
- **Outcome:** Owner (10-23 00:10): "OKAY" Keep Blinding at 2.5 (the default).

**BF8-2. Stats inside braces: +1 Health counts 1, not 0.5** · Decide · Balance · asked 2026-10-22 · decided 2026-10-23
- Your Tide example priced Ebb {+1 Health} at 0.4 × 0.5. Today a stat inside braces counts 2A + H, so +1 Health counts 1 (0.4 after the context multiplier) and +1 Attack counts 2. Nothing changed.
  - Keep 2A + H
  - Health in braces counts 0.5
  - Both halve in braces
- **Default:** Keep 2A + H
- **Outcome:** Owner (10-23 00:10): "OKAY" Keep 2A + H: +1 Health counts 1 inside braces (the default).

**BF8-3. The Red and Blue Dragons still have no legal line without Bounty** · Decide · Cards · asked 2026-10-22 · decided 2026-10-22
- Bounty is off all five dragons and Overwhelm is off the Green Dragon (1/7 → 3/20, White 1/11 → 2/23, Black 8/8 → 9/9). Red Dragon 4/20 (Flying, Stun on Hit, Fire Arrow 4, Supreme) and Blue Dragon 4/19 (Flying, Paralyze, Lightning 4, Supreme, Supreme Tide) still have no line and keep their stats. docs/balance/hand-pass-2026-10-22.md gives Red: Fire Arrow 4 → 1 (2/12); Blue: Lightning 4 → 1 and drop Supreme (2/9).
  - Red: drop Stun on Hit; Blue: drop Paralyze
  - Shrink the arrows / lightning (hand-pass lines)
  - Leave them off the formula
- **Default:** Red: drop Stun on Hit; Blue: drop Paralyze
- **Outcome:** Owner (18:20): "Trim + lower the skill score of the legendary skills. I don't think theyre worth that much. Maybe 3-5." Built (package BF9): Supreme 7 → 5, Supreme Tide 8 → 4 (True Strike already 1.5). Red Dragon loses Stun on Hit (Flying, Fire Arrow 4, Supreme): 4/20 → 3/17. Blue Dragon loses Paralyze (Flying, Lightning 4, Supreme, Supreme Tide): 4/19 → 3/17. Re-fitted with them: White Dragon 2/23 → 2/24, Green 3/20 → 3/21, Black 9/9 → 10/10. Fathom Leviathan still has no legal line.

**TU-1. When the later tutorial fights open, and what they are called** · Decide · Tutorial · asked 2026-10-22 · decided 2026-10-23
- Note of 10-22 11:58: "In the tutorials, you now see five (5). (The first of which T-3 is locked till you progress further)". After Tutorial II the Tutorial submap shows all five fights; the three after the tutorials stay locked markers that say which fight opens them, as set on 10-16 ("T3 and T5 gradually unlock over Map 1/8/18"): the third opens when Map 0's boss (0-4) is beaten, the fourth with 7-6, the fifth with 17-8 (TUT_SIDE_GATE). On the map the five are labelled T-0, T-1, T-2, T-3, T-4, so the one your note calls T-3 (the third) reads T-2 on screen. Package TU kept both the gates and the labels.
  - As built (T-0 to T-4; Maps 1 / 8 / 18)
  - Label them T-1 to T-5 so the labels match how you count
  - Open the third fight later (say once Map 1 is cleared)
- **Default:** As built (T-0 to T-4; Maps 1 / 8 / 18)
- **Outcome:** Owner (10-23 00:10): "Standardise to how we have been doing things - if indices start at 1, then T-1 to T-5" Second option: the tutorial fights are labelled T-1 to T-5, not T-0 to T-4. To build in package TU2.

**TU-2. Phones: keep the 👤 chip in the top bar as well as the new Profile button** · Decide · UI · asked 2026-10-22 · decided 2026-10-23
- Note of 10-22 11:58: "In mobile mode, the Profile icon should be a button in the main menu." Phones now have a Profile note in the Home menu, with Quests, Achievements and the rest; desktop is unchanged. The top bar's 👤 chip stays on phones too, because for a guest it is the Sign in button (and it shows the sync state).
  - Keep both (now)
  - On phones, hide the chip once signed in
  - On phones, hide the chip always (sign in from the Profile page)
- **Default:** Keep both (now)
- **Outcome:** Owner (10-23 00:10): "OKAY" Keep the chip and the Profile button on phones (the default).

**TU-3. What Profile → Reset all should leave behind** · Decide · Admin · asked 2026-10-22 · decided 2026-10-23
- The T-0 stall came from Reset all keeping Admin Mode: with Admin Mode on the game skipped the start map, so the T-0 win landed on an empty Outskirts. Package TU fixed that (the start map now holds for everyone). Reset all still keeps Admin Mode, your name and the editor content, and it does not touch the cloud: from reading the code, a signed-in device also loses its local sync time, so the next load may take the older cloud progress back (player_progress is not wiped). Nothing was changed here.
  - As is
  - Reset all also turns Admin Mode off
  - Reset all also resets the cloud progress of a signed-in account (tap twice)
- **Default:** As is
- **Outcome:** Owner (10-23 00:10): "OKAY Turn admin mode off is not needed. (unless we can turn it on again)" Reset all stays as is (the default): it keeps Admin Mode, so no change.

**RW2-1. Skirmishes with a first-clear reward: no card drop, repeats included** · Decide · Rewards · asked 2026-10-22 · decided 2026-10-22
- N22-5 gave the pack-card drop to "skirmishes with no pack or card reward", and RW2 keeps that: a skirmish whose first clear pays a card, a reward token or a free pack never drops a card, not even on a repeat win. Before RW2 those skirmishes still had the old 10% enemy-card drop (RW-3 moved every fight to the one pack drop, so they now have none). Elites and bosses drop on every win.
  - As built (no drop)
  - They drop on repeat wins only (7%)
  - They drop on every win (7%)
- **Default:** As built (no drop)
- **Outcome:** Owner 18:20: "RW2-1: Yes. There are two kinds of first-clear drop card reward skirmishes: skirmish-exclusive, or from that map range's pack. ALL skirmishes have a low chance to get a card from the pack. For skirmishes, the chance of getting a card is tripled. But you mostly (50+%) get THAT card. (If it's higher in rarity, then the chance actually decreases - your call. Maybe 60/50/40/25/20/10/5/4/3/2/1..." Built (package GD): every skirmish win, first clear and repeats, rolls the pack-card drop at 7% (a skirmish paying a card, a token or a pack no longer drops nothing). A skirmish with a first-clear reward card rolls 21% on repeat wins; a card that drops there is its reward card with the share for that card's rarity (Common 60%, Uncommon 50%, Rare 40%, Very Rare 25%, Super Rare 20%, Epic 10%, Heroic 5%, Unique 4%, Legendary 3%, Mythic 2%, Ancient and above 1%; special rarities as their tier), else a pack card as usual. So a Common reward card drops 12.6% a repeat win and a Rare one 8.4%. The rank gate stays. A cleared skirmish's drop line shows its reward card (small tile), its chance and its rank emblem, then 🃏 for the pack card's share. The first clear rolls the plain 7% (it pays the card itself). Calls GD-5 and GD-6.

**RW2-2. Challenge cards: one per four maps from Map 4, the highest-rarity elite reward** · Decide · Rewards · asked 2026-10-22 · decided 2026-10-23
- Six challenge cards ask SS: The Heron Hag (Heroic, 6-8 The Alligator King), Echo Matriarch (Heroic, 8-8 The Stalactite Warden), Pride Queen (Heroic, 14-8 The Savanna Warlord), Yeti Chieftain (Heroic, 19-6 The Frost Yeti King), Triumphvirate (Unique, 23-8 Marshal Tuskwell), Iron Warden (Epic, 24-6 The Gilded Guard). The rule: main maps in bands of four from Map 4 (4-7, 8-11 …), over the first-clear cards of elite-kind fights (elite, champion, miniboss, dungeon), the one of the highest rarity (Rare or above), ties to the later fight. Maps 0-3 and side maps have none. Five of the six sit on the map's miniboss. Edit by setting or clearing source.challenge in canonical/cards.json (tools/challenge_cards_2026_10_22.js --list shows them).
  - As built
  - Elite fights only (not minibosses)
  - One per two maps
  - Also on Maps 0-3
- **Default:** As built
- **Outcome:** Owner (10-23 00:10): "OKAY" Challenge cards stay as built.

**RW2-3. Card drops 7% per Energy tier, capped at 25%** · Decide · Rewards · asked 2026-10-22 · decided 2026-10-23
- The drop chance is 7% x the fight kind's Energy tier (ENERGY_COST, not the map-scaled cost a fight charges, which climbs to 10+ on later maps): 1 skirmish 7%, 2 elite 14%, 3 boss 21%, 4 world / raid boss 28% and 5 final boss / megaraid 35% are capped at 25% (DROP_CHANCE_CAP), the raids' own S+ maximum. The rank gate still applies (an elite or boss drop needs an S win).
  - As built (cap 25%)
  - No cap (28% / 35%)
  - Cap at 21% (boss level)
- **Default:** As built (cap 25%)
- **Outcome:** Owner (10-23 00:10): "No, the drop rate is based on energy use. I think about 1% per energy. But of course, difficult-er skirmishes like elites have 1/2/3/4% higher chance of dropping (only) since elites and above have shields. Ticketed dungeons keep their higher drop rates. Skirmishes might have shields, but they are rather low" Not the default: replaces 7% per Energy tier capped at 25%. A drop is about 1% per Energy spent; elites and above get 1/2/3/4% more (they have shields); ticketed dungeons keep their higher rates. To build in package RW3. Built (RW3): 1% per Energy tier (ENERGY_COST) + a shield bonus by kind: elite / champion / miniboss / dungeon +1%, sub-boss +2%, boss +3%, world / raid boss, megaraid and final boss +4%; no cap. Skirmish 1%, elite 3%, sub-boss 5%, boss 6%, world / raid boss 8%, megaraid / final boss 9%. A skirmish with a first-clear card rolls 3x on repeat wins (3%), then that card's rarity share (Common 60% ...). The ticketed dungeons (the daily dungeons' floors) keep 7% per tier capped at 25% (7%, mini-boss floors 14%). 10,000-roll checks in tests/rw3-2026-10-23.js.

**RW2-4. A raid's fall still pays its reward cards** · Decide · Raids · asked 2026-10-22 · decided 2026-10-23
- RW2 lowered the card a raid FIGHT drops (survived 1%, enemy bramble killed 12%, killed at S or better 25%; was a pack card on every won fight). The claim when a raid falls (raidReward) is unchanged: every participant's claim pays the raid's rewards.cards (1, +1 for the top 10%, +1 for a Leading participant) as pack / faction cards at the participation level's rarity floor, plus a 1.5% raid-card roll. A held raid pays a chance at one card (up to 10%).
  - Keep the claim's cards
  - Lower the claim's cards too (e.g. a chance instead of a sure card)
- **Default:** Keep the claim's cards
- **Outcome:** Owner (10-23 00:10): "OKAY anyway the raid will be rebalanced later - seeing where people typically unlock the raid." Keep the claim's cards (the default); the raid is rebalanced later from where players unlock it.

**RW-1. Bosses count as elites for the card-reward rank** · Decide · Rewards · asked 2026-10-22 · decided 2026-10-22
- N22-4 says elite fights need at least SS for any card. Package RW treats every boss kind (boss, sub-boss, final boss, raid boss, world boss) like an elite, so a boss's reward cards need SS on Maps 0–19, SSS from Map 20 (the rank is per card: B, or S for a Rare or above, one step up every 20 maps, capped at SSS; an elite or boss asks SS first). A fight's own cardRank can only raise it. Tutorial fights need nothing. The same gate holds for random card drops.
  - Bosses count as elites (now)
  - Bosses ask the same as a skirmish
  - Bosses ask one step more than elites
- **Default:** Bosses count as elites (now)
- **Outcome:** Owner (Oct 22): "I go back on what I said. The max cap is always S. SS and SSS is only for challenge missions. It's too difficult to achieve. Sporadically, some of the skirmish rewards (non pack) can only be gotten through SS (Elites). These will be called challenge cards, so we should pick the higher rarity cards." Built (package RW2): the card-reward rank is capped at S everywhere (CARD_RANK_CAP): B for a Common / Uncommon and S for Rare+ on Maps 0-19, A / S on Maps 20-39, S from Map 40; elites and bosses ask S (was SS, SSS from Map 20); a fight's own cardRank is capped too; the same gate holds for card drops. Challenge cards ask SS: a first-clear reward whose source carries challenge:true in canonical/cards.json (the owner edits the flag there). Six picked by tools/challenge_cards_2026_10_22.js (one per four-map band from Map 4: the highest-rarity Rare+ reward of an elite-kind fight, ties to the later fight): The Heron Hag (6-8), Echo Matriarch (8-8), Pride Queen (14-8), Yeti Chieftain (19-6), Triumphvirate (23-8), Iron Warden (24-6). The fight panel shows them with a gold frame, a Challenge ribbon and the SS emblem (call RW2-2).

**RW-2. Skirmish card drops: 7% a win, and the rarity shares by map** · Decide · Rewards · asked 2026-10-22 · decided 2026-10-22
- A skirmish with no card reward, no reward token and no free pack drops a pack card 7% of the time (30% below the old 10%). The base rarity: Maps 0–9 Common only; Maps 10–29 Common 75%, Uncommon 25%; Maps 30+ Common 70%, Uncommon 25%, Rare 5%. Then a shift: 5% one rarity down, 5% one up, and an up has a second 5% roll for one more up. The shares are my reading of "Commons from Map 0, Uncommons from Map 10, Rares rarely from Map 30"; they are the table SKIRMISH_DROP_RARITY in arena_app.js. The drop only lands when the win's rank meets the gate for that card's rarity (RW-1), so on Maps 0–19 a win below B gives no drop. 10,000 rolls: Map 5 gives Common 94.8% / Uncommon 4.9% / Rare 0.3% after the shift (only up-shifts exist from Common), Map 15 gives 72.6 / 26.1 / 1.3, Map 35 gives 68.3 / 25.6 / 5.9 / 0.2 Very Rare.
  - As built
  - Raise the Rare share on Maps 30+
  - No drop below a certain rank is fine; show it
  - Drop the rank gate for skirmish drops
- **Default:** As built
- **Outcome:** Owner (Oct 22): "80/20 and 70/25/5 is fine." Built (package RW2): Maps 10-29 Common 80% / Uncommon 20% (was 75 / 25); Maps 30+ 70 / 25 / 5 unchanged; Maps 0-9 Common only; then the 5% down / 5% up shift. 10,000 rolls (tests/rw2-2026-10-22.js): Map 15 80.0 / 20.0, Map 35 69.7 / 25.1 / 5.2.

**RW-3. Other fights keep the old card drop (now rank-gated); skirmish drops use the basic pack pool only** · Decide · Rewards · asked 2026-10-22 · decided 2026-10-22
- Elite, boss and the rest keep rollCardDrop as it was (a chance by fight kind, then one of the enemy deck's cards by the rarity table), only now behind the rank gate. The new skirmish drop draws from the basic pack pool (pool 1) cards the player has reached by map (packCardReached); half the time one of the fight's own pack cards of that rarity, else another card of that rarity from the pool, and from the pool directly when the fight has none. The faction pool (11, the otters and hummingbirds) stays on its own reward track and never drops from a skirmish. A rarity with no card in reach steps down until one has.
  - As built
  - Let faction cards drop too
  - Move elites and bosses to the pack-card drop as well
- **Default:** As built
- **Outcome:** Owner (Oct 22): "No use the same card drop. (The drop rate should be roughly scaled to the energy use.)" Built (package RW2): rollCardDrop's old roll (a chance by kind: elite 20%, miniboss 30%, boss 40%, world / raid boss 70%, megaraid 100%, one of the enemy deck's cards) is gone; every fight but a raid fight and a tutorial rolls the skirmish's pack-card drop (map rarity shares, the shift, half the time the fight's own pack card, the rank gate), at 7% per ⚡ of the kind's Energy tier (ENERGY_COST), capped at 25%: skirmish 7%, elite / champion / miniboss / dungeon 14%, sub-boss / boss 21%, world boss / raid boss / megaraid / final boss 25% (call RW2-3). 10,000 seeded wins each: 6.6 / 14.0 / 20.5 / 24.6%. A skirmish with a first-clear reward still drops nothing (call RW2-1).

**BF7-1. The half-miss ×1.5 counts on the stats only; Fragile is ×0.7 on both caps** · Decide · Balance · asked 2026-10-22 · decided 2026-10-22
- Pass III's formula option: the half-miss ×1.5 was on S too, so a flyer's skills cost half again. Fragile was −8 as a skill and ×0.75 on N, which shrinks N (fewer stats), the opposite of the intent. Mayfly Dancer (Flying, Fragile) re-fits at 2/7; without Fragile it would get 2/4.
  - ×1.5 on the stats only; Fragile ×0.7 on both left sides
  - Keep ×1.5 on both scores and Fragile on N
- **Default:** ×1.5 on the stats only; Fragile ×0.7 on both left sides
- **Outcome:** Owner (pass III answers): "Do your cut. I misread alot of the x1.5 skills and I used a flat number instead actually." On Fragile: "Fragile should be smth like x0.7 (so that you can have more stats!) ... The idea is that things that must be less than N have a x0.7 multiplier!" Built (package BF7) in bramblewood-budget.js capScores: f × ((2A + H) × m + S) ≤ N and f × (A·H × m + S·|S|) ≤ (N/3)², m = 1.5 per half-miss skill on Attack and Health only, f = fragileUse 0.7 for a Fragile card. BF5's fragileMult (N × 0.75) is gone. The game's editor budget panel, the Test Lab, the hub's Budget & stats and Skill costs tabs and every balance tool read it.

**BF7-2. A quality priced by a multiplier costs 0 as a skill** · Decide · Balance · asked 2026-10-22 · decided 2026-10-22
- Two you may want to look at: (1) the light bonus (N × 1.02 for a card whose only abilities are Flying, Tide or day / night ones) sits on cards whose Tide (1.5) or Diurnal / Nocturnal (1) is also priced; it is a small bonus, not the same quality counted twice, so it stays. (2) Blind on a card is an on-hit chance (Horned Lizard 50%), yet it takes the full ×1.5 like Evasive.
  - Zero the multiplier-priced skills
  - Keep the flat prices too
- **Default:** Zero the multiplier-priced skills
- **Outcome:** Owner: "Make sure there's no duplicates." Built (package BF7): Fragile −8 → 0, Blind −3 → 0, Evasive 0.1 → 0, Swift 5 → 0 (Flying and Shadow were 0 already). Checked and left as they are (no double price): context skills (their plain flag already costs 0 beside braces), transforms, King / Stem braces, the plain and light N bonuses.

**BF7-3. Bounty stays 3; four pass III cuts applied** · Decide · Balance · asked 2026-10-22 · decided 2026-10-22
- Pass III proposed five cuts (docs/balance/pass-3-proposal-2026-10-22.md); Bounty's 1.84 came from a test deck with no Lumber-costed units.
  - Four cuts, Bounty kept
  - All five cuts
- **Default:** Four cuts, Bounty kept
- **Outcome:** Owner: "Bounty is unique, because it's actually very strong, but maybe in your testing, you don't use many lumber costed units." Bounty stays 3. Applied at their measured worth: On Attack 3 → 1.35, Add Wait 3.5 → 2.8, Twin Strike 6 → 3.17, Octolash 25 → 6.48. Then every band card was re-fitted (124 moved); no-fit cards 130 → 108. Randomising Lumber and Wait in the test setups is a future balance row in docs/action-items.md.

**BF7-4. Your five live edits of 10-21 evening: two were merged with later file changes** · Decide · Cards · asked 2026-10-22 · decided 2026-10-23
- Folded into canonical/cards.json with your stats as printed. Tide Pool Crab: you added Shield 3 while package TR (after your save) gave it Armor 1 back, so it now has Tide + Armor 1 + Shield 3 at 1/3, and no legal line. Glacial Ape-King: your row still had Bounty 1 (TR swapped Bounty for King after your save): it keeps King + Earthquake 4 at your 6/37, 103% of N (its formula line is 6/35). Conch Crawler 1/1 with Shield 4 has no legal line. Ford Kingfisher 0/1 fits (33% of N). Ember Tetra 3/7 is new: no source and no art, and its Tide braces (S 5.4) leave no legal line at any stats.
  - Keep them as folded
  - Crab: drop Armor 1 (your Shield 3 only)
  - Ape-King: Bounty back instead of King
  - Give Ember Tetra a source (map or pack)
- **Default:** Keep them as folded
- **Outcome:** Owner (10-23 00:10): "OKAY" Keep the five live edits as folded (the default).

**BF7-5. 106 band cards still have no legal line: the hand-pass list** · Decide · Balance · asked 2026-10-22 · decided 2026-10-23
- After BF7's re-fit, 106 band cards (plus Conch Crawler and Tide Pool Crab) have no legal line and keep their stats (docs/balance/human-pass-1-flagged-2026-10-21.json). docs/balance/hand-pass-2026-10-22.md gives each the cheapest single change (shrink or drop one skill, never Flying) and the line it would get; the Blue Dragon needs two. None is applied.
  - Apply the cheapest change on each
  - Pick per card
  - Leave them off the formula
- **Default:** Pick per card
- **Outcome:** Owner (10-23 00:10): "OKAY" Pick per card (the default), no bulk change.

**MP-1. A map's card pool guides the editor; it does not restrict the game** · Decide · Maps · asked 2026-10-22 · decided 2026-10-22
- Package MP: the Map cards editor and the skirmish deck pickers read canonical/map-pools.json (and the admin's live edits). The pool decides what the pickers offer and which deck cards get a ⚠ chip; nothing in the game refuses a deck that strays from it (the deck-validation caps are package DR's).
  - Guide only (editor)
  - Also fail a check when a fight deck has a card outside its map's pool
  - Also keep the CPU's generated decks (dungeons, endless floors) inside the pool
- **Default:** Guide only (editor)
- **Outcome:** Owner 07:41: OK. The pool guides the editor and the deck pickers; nothing in the game refuses a deck that strays from it.

**MP-2. "+ Load any card" saves to Special at once** · Decide · Maps · asked 2026-10-22 · decided 2026-10-22
- A card picked through + Load any card joins the deck and the map's (or submap's) Special tier immediately, as a live edit. Closing the skirmish editor without saving does not take it back out of Special; remove it in Map cards. The alternative holds the Special entry until the skirmish is saved.
  - Write at once (now)
  - Only when the skirmish is saved
- **Default:** Write at once (now)
- **Outcome:** Owner 07:41: OK. A card picked through + Load any card joins the deck and the map's SPECIAL at once (now from its own modal).

**MP-3. A submap fight does not see the parent map's Special cards** · Decide · Maps · asked 2026-10-22 · decided 2026-10-22
- As briefed: a submap fight offers the parent's Cards, the submap's Cards and the submap's Special. The parent's Special (cards for the parent's odd fights) is left out, and the editor shows the parent's Cards read-only only.
  - Left out (now)
  - Show the parent's Special too, read-only
- **Default:** Left out (now)
- **Outcome:** Owner 07:41: OK, replaced by the three tiers (package DV2): one SPECIAL list per main map, shared with its submaps' fights; a main-map fight offers MAP + SPECIAL, a submap fight MAP + that SUBMAP + SPECIAL.

**MP-4. What the three usage counters count** · Decide · Maps · asked 2026-10-22 · decided 2026-10-22
- On each card in Map cards: copies in this map's fight decks, in its submaps' fight decks, and in every other map's. Normal, elite, boss and a dungeon's wave decks count; the tutorial's fixed decks do not. It counts copies (a 4-of in a boss deck is 4), from the live map data, so the owner's edits are in it.
  - Copies (now)
  - Fights that use the card (a 4-of counts once)
- **Default:** Copies (now)
- **Outcome:** Owner 07:41: OK. The three usage counters count copies, from the live map data.

**AR-1. Standard PvP shares the PvP tickets and the rating** · Decide · Arena · asked 2026-10-21 · decided 2026-10-23
- Package AR split the Arena's PvP into two buttons. Standard PvP is the existing Standard format (every card at Level 1, no foils, a Standard deck built from any card) against the same strangers as Collection PvP, their decks also at Level 1. It uses the same 10 PvP tickets, moves the same rating and pays the same rewards. Your Standard deck is not recorded as a stranger, since it can hold cards you don't own.
  - Keep it shared
  - A separate rating for Standard
  - Separate tickets for Standard
- **Default:** Keep it shared
- **Outcome:** Owner (10-23 00:10): "OKAY. But PVP and Collection share different pools. PVP still keeps the foil treatments." Keep the tickets and the rating shared (the default), but Standard PvP and Collection PvP draw opponents from different pools, and PvP keeps its foil treatments. To build in package RW3. Built (RW3): tickets and rating stay shared; Standard PvP meets Standard decks only and Collection PvP Collection decks only (a Standard deck is recorded into the Standard pool: ghost_decks mode 'pvp', stage 100 + tier, so no SQL change; its own key in the browser; different seeded strangers). A Standard match keeps your foils and Shinies (prestige, Materia and levels still go).

**AR-2. The Undercroft: the Arena's Dungeon as a daily dungeon on Map 11** · Decide · Dungeons · asked 2026-10-21 · decided 2026-10-23
- The Arena's Dungeon (3 fights against random decks, losses carried over) is gone from the Arena; an unfinished run in an old save is no longer offered. In its place the Undercroft opens on Map 11 (the Arena's map) as a daily dungeon: each floor takes a Dungeon key, 50 floors, each harder (half a map further on per floor, +3 bramble Health), a mini-boss every 10th floor, a loss sends you back to floor 1. Every 3 floors the land changes: 15 maps' first elite deck and field rules, in order of their battle rating (Savanna 47 up to Wolfsbane Tundra 106); only floors 46-50 go round to the first. Like Murgle Mayhem, each floor's first clear gives 10 Gold Leaves (500 in all).
  - Keep these defaults
  - Different lands or order
  - Fewer floors
  - No Gold Leaves from the Undercroft
- **Default:** Keep these defaults
- **Outcome:** Owner (10-23 00:10): "Hide for now, note in notes. In fact hide both daily dungeons require future balancing anyway. We havent even decided what special thing htey give." Not the defaults: both daily dungeons (the Undercroft and Murgle Mayhem) are hidden until they are balanced and their special reward is decided; the defaults stay in the notes. To build in package TU2.

**AR-3. The group dungeon is a Coming soon slot** · Decide · Dungeons · asked 2026-10-21 · decided 2026-10-23
- You asked for group dungeons with live players, recorded in the Daily Dungeon section. There is no co-op dungeon in the game yet (only the D49 design, docs/coop-dungeon-design-2026-10-13.md), so the Daily Dungeons tab now ends with a Group Dungeon slot marked Coming soon. Building it means the netcode in that doc (the Ranked Live host, extended to 2-4 players).
  - Build the co-op dungeon next
  - Keep the slot for now
  - Remove the slot
- **Default:** Keep the slot for now
- **Outcome:** Owner (10-23 00:10): "AR-3 This is a big pass. I like this. Can you launch a big pass for this." Build the co-op dungeon next (the first option), as one large pass. To build in package AR3.

**AR-4. The match log is this device's last 40 fights** · Decide · Profile · asked 2026-10-21 · decided 2026-10-23
- Recent opponents moved from the Arena to the Profile as a match log with PvP and PvE tabs (opponent, mode, result, date, the deck you faced, and from now on your deck's name). It is what this device records: the last 40 fights (was 20), not Ranked Live, which stays in the signed-in Match History below it. Syncing the log to the account would need a new column or table (SQL for your apply).
  - Keep it on the device
  - Sync it to the account
- **Default:** Keep it on the device
- **Outcome:** Owner (10-23 00:10): "OKAY - it's not sync'd? I think this is okay." Keep the match log on the device (the default).

**TR-1. 24 cards fall to their 1/1 floor with their cut skill back** · Decide · Balance · asked 2026-10-21 · decided 2026-10-23
- HB2-1 gave 69 cards back the skill BF5 cut only because Flying, Tide, Diurnal or Nocturnal counted, and the formula re-fitted them (--only). 45 still fit. 24 have no room under cap 2 and drop to 1/1 (skills kept, flagged like B14): Eagle Diver 1/4, Alpha Howler 1/15, Orca Vanguard 1/21, Snow Owl Sentinel 2/7, Permafrost Mammoth 2/20, Moray Ambusher 2/12, Cave Bat Swarm 2/5, Blind Cave Fish 1/3, Sulfur Vent Crab 2/9, Tide Pool Crab 1/3, Open-Ocean Hermit Crab 1/6, Reef Manta Glider 1/7, Nightshade Moth 1/5, Elder Tortoise 1/15, Vigil Owl 2/9, Willow-o'-Wisp 1/12, Skull Vulture 3/3, Moon Jelly 2/8, Voltwing Bat 1/4, Static Bat 1/6, Sea Cucumber 2/11, Alligator Gar 2/14, Mangrove Manatee 2/17, Giant Clam 1/14 (all now 1/1). 7 more were 1/1 already. The free skills still cost S (Tide 2.79, a time of day about 2.5).
  - Keep: every skill back, 1/1 where the formula says so
  - Take the restored skill off again on these 24 (back to their stats before TR)
  - Price plain Flying / Tide / Diurnal / Nocturnal lower in the budget too
- **Default:** Keep: every skill back, 1/1 where the formula says so
- **Outcome:** Owner (10-23 00:10): "OKAY" Keep: every skill back, 1/1 where the formula says so (the default).

**TR-2. Bounty came back on 7 cards** · Decide · Balance · asked 2026-10-21 · decided 2026-10-23
- BF5 cut Bounty first (your 21:36: "Bounty is way too strong") wherever a card had three skills. On 7 of them the third skill was a free one under HB2-1, so the cut is undone: Monarch Wingblade, Reef Shark, Octopus Tactician, Alpha Howler, Vampire Roost, Bog Behemoth, Tiny Cave Dweller. Bounty is priced at 1 a point (your BF5 value), so the formula took it out of their stats.
  - Keep Bounty on them
  - Keep it cut (Bounty is never restored)
- **Default:** Keep Bounty on them
- **Outcome:** Owner (10-23 00:10): "OKAY" Keep Bounty on the 7 cards (the default).

**TR-3. The Crown's open cases (built as defaults)** · Decide · Rules · asked 2026-10-21 · decided 2026-10-23
- Package TR built your Crown rules. Calls taken: (a) once the Crown fades it is gone for the fight: a later King stays uncrowned; (b) the crowned King killed by an enemy unit while no King is left anywhere: +1 Gold for the killer's side (your kill rule), not the dead King's; (c) friendly fire counts as no source unit (the Crown drops); (d) the King that picks up a dropped Crown, or the liege's pick, is random among that side's Kings (the fight's seeded random); (e) a holder that leaves play without dying (bounced, exiled) drops it as with no source; (f) a crowned unit that an evolute goes over keeps the Crown (it is the same unit).
  - Keep these
  - Let a later King take a fresh Crown after it fades
  - Change (b): +1 Gold for the dead King's side
- **Default:** Keep these
- **Outcome:** Owner (10-23 00:10): "OKAY" Keep the Crown cases as built (the default).

**TR-4. Which cards are Kings** · Decide · Cards · asked 2026-10-21 · decided 2026-10-23
- King given to: Rodent King (Bounty off for the two-skill rule; 4/15 -> 4/14), Glacial Ape-King (Bounty off; 7/36 -> 7/34), Yeti Chieftain (5/22 -> 5/20), The Gannet Queen (3/9 -> 1/10). Not given: the Pride Queen (with King's 2.39 her Quick leaves no room: 2/14 -> 1/1) and the Magnate Duck (King type already; 1/22 -> 1/1); the Quicksand Queen is a trap, not a ruler. Usurper was extended to steal the Crown (the Crown Pretender is the card for it); no new skill was needed.
  - Keep these four
  - Also the Pride Queen and the Magnate Duck at 1/1
  - Name others
- **Default:** Keep these four
- **Outcome:** Owner (10-23 00:10): "No none of our current card are kings. Remove. Only the Magnate Duck. (don't make it 1/1! Maybe King costs too much! - balance on your own.) Also new skill: Liege: {...}. Activates only if the king is on your side. Liege is worth 0.3x {...}. Default Assault N: (Extra N attack only when attacking) where for Liege, N=2." Not the default: King comes off the Rodent King, Glacial Ape-King, Yeti Chieftain and The Gannet Queen; only the Magnate Duck is a King (balance it so it is not 1/1). New skill Liege {...}: the braces apply only while the King is on your side, priced 0.3x the braces; the default braces are Assault N (extra N attack only when attacking), N=2. To build in package EN. Built (EN): King is off the Rodent King, the Glacial Ape-King, the Yeti Chieftain and the Gannet Queen (the Bounty TR took off the first two stays off: BF8 keeps Bounty to the loot carriers); re-fit Rodent King 4/14 -> 3/11, Yeti Chieftain 3/14 -> 4/20, Gannet Queen 1/13 -> 1/15, the Ape-King keeps your 6/37 (it fits); the Magnate Duck is the one King. King re-priced 4 -> 1.4 (0.4 x Kingly at today's prices: Tribute 1 0.5 + Armor 2 x 1.5 = 3.5). The Duck still has no legal line by formula (its other five skills already break cap 2), so it keeps 1/22, not floored (call EN-1). New skills Liege {...} (0.3 x the braces; a plain Liege is Liege {Assault 2} = 1.08) and Assault N (+N on its own swing, never a counter; 1.8 a point), with editor rows, Codex lines and texts in the 12 packs.

**TR-5. Prices for King, Kingly, Tribute and the five transforms (theoretical)** · Decide · Balance · asked 2026-10-21 · decided 2026-10-23
- canonical/skill-costs.json, ownerSet false, B15-style. Tribute 0.5 a point (half of a Lumber income: Gold buys nothing in a fight yet). Kingly 5.98 = Tribute 1 + Armor 2 (2 x 2.74), never printed. King 2.39 = 0.4 x Kingly, as a context skill (the Crown is not certain); with its own braces 0.4 x them. Transforms at CONTEXT_MULT 0.4 x the gain: Gilded {+5/+10} 8, Championed {+3/+3} 3.6, Veteran {+2/+4} 3.2, Matured {+2/+4 Stem stats} 3.2, Enraged 0.4 x its braces. Plain Crepuscular 1.6 (CX2).
  - Keep these prices
  - Raise or lower some (name them)
  - Measure them with tools/skill_worth.js
- **Default:** Keep these prices
- **Outcome:** Owner (10-23 00:10): "See TR-4, otherwise OK." Keep the prices (the default), plus Liege at 0.3x its braces as set in TR-4. To build in package EN. Built (EN): the prices kept, except King 1.4 and Kingly 3.5 (see TR-4), Liege 0.3 x its braces (bramblewood-budget.js CONTEXT_MULT_BY), Assault 1.8 a point, Enraged removed.

**TR-6. Transform conditions, as read by package TR** · Decide · Rules · asked 2026-10-21 · decided 2026-10-23
- Enraged: "It has Rage" is read as its Rage being on (Rage, below half Health); having the skill would trigger it at once. Matured: N rounds, 2 by default (tf.rounds; the editor doesn't set N yet). Veteran and Matured count rounds survived on the field, at each round's start. Championed: a kill by its own swing or its Counterattack against the unit it fights (a Guardian that takes the hit is the one it fights); kills by Arrow, Pounce or other skills don't count. Gilded: Lumber 1, Stone 2, Metal 3, Gold 5 each, more than 25, checked as the board updates. No card has a transform preset yet.
  - Keep these readings
  - Enraged = it has the Rage skill
  - Championed also by skill kills
- **Default:** Keep these readings
- **Outcome:** Owner (10-23 00:10): "OH right. Then instead - remove Enraged. Rage keeps its definition and default. Otherwise, Rage - {...} means the typical effects of Rage, PLUS {...}. Cost it using logic." Not the defaults: the Enraged transform condition is removed; Rage keeps its definition; "Rage {...}" means Rage's usual effects plus the braces, costed by the engine's own logic. To build in package EN. Built (EN): the Enraged preset is gone (engine, editor, skill-costs.json; a saved Enraged card becomes Rage {...} as it loads). Rage {...} (effects.rageGrant beside Rage): Rage as before plus the braces while it rages. Cost: Rage's own price + 0.4 x the braces' S (CONTEXT_MULT_BY.rageGrant: Rage is on for the lower half of its Health, 0.5, and a unit can fall from above half in one blow, x 0.8).

**EV-1. Which cards are the Evomax lines (there was no Evomax unit)** · Decide · Cards · asked 2026-10-21 · decided 2026-10-23
- No Evomax unit existed (Terraumbra, an equipment Easter egg, was the line's only card). Package EV made lines from cards no player can get yet, so the Map 30 gate holds and no reward moved: Slowpoke Sentinel (Stem) -> Canopy Sloth Guardian (Evolute) -> Hanging Loafer (Alpha); Raven Harbinger (Evolute) -> Raven Hexcaller (Alpha) -> Bone Diviner (Omega); Gale Sprite (Evolute) -> Stormcaller (Alpha). They are mechanicLine evolution now. Missing stages are listed as cards to make in docs/evolute-design-2026-10-21.md (a sloth Omega, a storm Omega, an insect Evolute and Alpha for the Cocoon, beetle, frog and dragon lines).
  - Keep these three lines
  - Pick other cards (name them)
  - Make new Evomax cards instead and revert these
- **Default:** Keep these three lines
- **Outcome:** Owner (10-23 00:10): "It's okay. The Terraumbra is an Evomax equipment" Keep the three Evomax lines (the default); the Terraumbra is the Evomax equipment. To build in package EN. Built (EN): nothing to change: the Terraumbra is already an Evomax (mechanicLine evolution) equipment; pinned in tests/en-2026-10-23.js.

**EV-2. When an evolute dies, do the cards under it fire their On Death?** · Decide · Rules · asked 2026-10-21 · decided 2026-10-23
- Built: no. The whole stack goes to the graveyard (or the Removal Zone, wherever the evolute goes) and only the top card's own death effects happen (its On Death, Bounty, Relic ...). The cards under it fire nothing, matching "a unit leaving play this way triggers no On Death, Bounty or grave effects".
  - No: only the top card's death effects
  - Yes: each card in the stack fires its own On Death (top first)
- **Default:** No: only the top card's death effects
- **Outcome:** Owner (10-23 00:10): "No." Only the top card's death effects fire (the default). Built (EN): kept as built (only the top card's death effects fire).

**EV-3. Evolute bases: shared type at every stage, creatures only** · Decide · Rules · asked 2026-10-21 · decided 2026-10-23
- Built: Alpha and Omega also need a shared type with their base (the rule named it for Evolute only). A plain Evolute cannot go over a unit that is already an evolute (no sideways or downward evolving). Structures, cages and a Gladiator leader are never bases, and only front-row units are (a raid's middle and back rows are not). The editor offers Evolute / Alpha / Omega on Evomax cards only.
  - Keep all of these
  - Alpha and Omega need no shared type
  - Allow an Evolute over an evolute
- **Default:** Keep all of these
- **Outcome:** Owner (10-23 00:10): "Yes. But just shared with what it is. Once evolved over, do not reference the card below. OKAY to the rest" Keep all of these (the default), with the type rule narrowed: the type is shared only with the card it sits on at that moment; once evolved over, the card below is no longer referenced. To build in package EN. Built (EN): kept; checked that a stage reads only the type of the card it goes over at that moment (its own derived card) and nothing reads the cards under it (they are only zone entries); the rule is now written in the engine's EV block.

**EV-4. An evolute waits its own Wait again** · Decide · Rules · asked 2026-10-21 · decided 2026-10-23
- Built ("Wait and Lumber costs work as usual"): the stack waits the evolute's printed Wait, even over a Ready base. The CPU counts that against Ready bases. Alternatives: keep the base's remaining Wait, or the higher of the two.
  - Its own Wait (as usual)
  - The base's remaining Wait
  - The higher of the two
- **Default:** Its own Wait (as usual)
- **Outcome:** Owner (10-23 00:10): "Yes. (If it has Wait) It gains remaining Wait as well." Not quite the default: the evolute waits its own Wait and, if it has Wait, also takes on the base's remaining Wait. To build in package EN. Built (EN): an evolute waits its own Wait plus the base's remaining Wait (a Ready base adds nothing); the CPU counts a waiting base's Wait against it.

**EV-5. Evolute prices (theoretical)** · Decide · Balance · asked 2026-10-21 · decided 2026-10-23
- canonical/skill-costs.json, ownerSet false: Evolute 3, Alpha 4, Omega 5 (your suggestion). Stem and Chrysalis 1.6 (0.4 x (2*1 + 2), the +1/+2 they hand over), or 0.4 x their braces' S. The evolutes' printed stats are fitted to their own N; on the board a stack is the sum, so a Stormcaller fitted to 1/23 lands on a base and becomes far bigger. No run can measure this (it rides on the player).
  - Keep these prices
  - Raise them (name the numbers)
  - Price an evolute against its line's summed N instead
- **Default:** Keep these prices
- **Outcome:** Owner (10-23 00:10): "OKAY. (Alpha and Omega should also be 3, since they are difficult to achieve.)" Keep the prices, except Alpha and Omega are 3 as well (Evolute 3, Alpha 3, Omega 3). To build in package EN. Built (EN): Evolute Alpha 4 -> 3 and Omega 5 -> 3 in skill-costs.json; re-fit: Hanging Loafer 2/22 -> 2/23, Stormcaller 1/28 -> 1/29, Raven Hexcaller 1/1 -> 2/2, Bone Diviner 2/2 -> 4/4.

**EV-6. The Nest eggs as fodder, with a species** · Decide · Cards · asked 2026-10-21 · decided 2026-10-23
- The Speckled Egg is a Stem and the Cocoon a Chrysalis. Each got a species (Bird, Insect) so an evolute can share a type with it: eggs had none, so Kin and type skills now count them too. Re-fit by formula: 0/2 -> 0/1. An egg ridden by an evolute never hatches.
  - Keep
  - Keep the skills, no species (then no evolute can use them)
  - Revert the eggs
- **Default:** Keep
- **Outcome:** Owner (10-23 00:10): "OKAY. They will be the only NOT-evomax cards with Fodder. Treat all baby-like cards like this. Oh, and they only gain this at lvl1. (baby-like cards start at 0.)" Keep (the default), widened: every baby-like card gets Fodder, the only non-Evomax cards that do, and only from level 1 (baby-like cards start at level 0). To build in package EN. Built (EN): 23 baby-like cards (by name: kits, cubs, pups, chicks, hatchlings, fledglings, calves, a fawn, a piglet, a spawnling, a fry, the ducklings, the Baby Bat and the Baby Horned Capybara) gain Stem (Fodder) at Level 1 (levelSkills 1), never at Level 0; the eggs keep theirs as before. The list is call EN-6.

**EV-7. The raven evolutes sit at their 1/1 floor** · Decide · Balance · asked 2026-10-21 · decided 2026-10-23
- Following your HB2-1 answer (Flying does not count toward two skills), the ravens keep every skill: Raven Harbinger Flying + Poison 2 + Evolute, Raven Hexcaller Flying + Render + Evolute Alpha, Bone Diviner Flying + On Kill +2 Lumber + Evolute Omega. With Flying's x1.5 the formula puts all three at 1/1 (flagged, skills kept). In a stack they add to the base's stats, so the stack is still big. Without Flying, the Hexcaller and the Bone Diviner were 1/7.
  - Keep: every skill, 1/1
  - Cut Flying on the Hexcaller and the Bone Diviner (back to 1/7)
  - Lower the stage costs for these three
- **Default:** Keep: every skill, 1/1
- **Outcome:** Owner (10-23 00:10): "Okay" Keep: every skill, 1/1 (the default). Built (EN): kept; the Hexcaller and the Bone Diviner moved off 1/1 with Alpha and Omega at 3 (2/2, 4/4).

**RK1. Raid Ticket price in the Shop** · Decide · Raid · asked 2026-10-21 · decided 2026-10-23
- Package RK sells the Raid Ticket (one extra raid fight, past the cap of 10) for 300 Maple Leaves, beside the Rename Ticket (250 Maple Leaves); a fight also pays about 16 Maple Leaves and 12 Dust back. Gold Leaves would make it scarcer.
  - 300 Maple Leaves
  - 250 Maple Leaves (as the Rename Ticket)
  - 500 Maple Leaves
  - 30 Gold Leaves
- **Default:** 300 Maple Leaves
- **Outcome:** Owner (10-23 00:10): "OKAY. But call it like Bonus Raid Ticket and it has a different outline." 300 Maple Leaves (the default), renamed Bonus Raid Ticket, with a different outline from the other tickets. To build in package TU2.

**RK2. A limit on buying Raid Tickets** · Decide · Raid · asked 2026-10-21 · decided 2026-10-23
- Buying stops only while you hold 9; you can buy, use and buy again. Free tickets give at most about 16 fights a raid (10 + 1 a day), so an average player (751 raid damage a fight) tops out near rank A; S needs about 4 bought tickets, U about 24 (7,200 Maple Leaves). Rank is buyable with Maple Leaves unless a weekly limit is added.
  - No limit (hold at most 9)
  - At most 3 bought a week
  - At most 5 bought a week
- **Default:** No limit (hold at most 9)
- **Outcome:** Owner (10-23 00:10): "You can only buy if they have it. It sells out in one (1). It appearing is random." Not an option: the Bonus Raid Ticket is for sale only when the shop randomly has it, and it sells out after one purchase. To build in package RW3. Built (RW3): the Shop has a Raid Ticket only on some days: each local day rolls once (25%, about 1.75 days a week, 7.6 a month; the roll is the day's, so a reload doesn't re-roll). Stock 1: buying it sells it out ("Sold out") until another day rolls one; a day without one shows no ticket. Admin Mode always sees it. Price 300 Maple Leaves as before.

**RK3. The A-rank Raid Ticket only when the raid falls** · Decide · Raid · asked 2026-10-21 · decided 2026-10-23
- Owner: 'completing a raid (with at least A rank) should give you 1x ticket'. Built as: a fall's claim at total raid rank A or better pays 1 Raid Ticket; a raid that ends standing (held) pays none, whatever the rank.
  - Falls only
  - Falls and held raids
- **Default:** Falls only
- **Outcome:** Owner (10-23 00:10): "OKAY" The A-rank Raid Ticket only when the raid falls (the default).

**RK4. Where Raid Tickets drop** · Decide · Raid · asked 2026-10-21 · decided 2026-10-23
- Built: an S notice 30%, SS 60%, SSS 100% (about 0.7 a week at six notices a day), and a raidTicket reward token (a fight's first clear) that is on no fight yet. Chests have no drop table to add it to.
  - Keep (notices only; token unused)
  - Also put the token on a few boss fights
  - Also one per finished weekly tier
- **Default:** Keep (notices only; token unused)
- **Outcome:** Owner (10-23 00:10): "SS, SSS notices should be so rare, maybe once per 1mo/2mo if all notices are always refreshed and completed. S is more common, 0.5-0.7 per week." Not the default: SS and SSS notices become much rarer (about once a month or two if every notice is refreshed and completed); S drops 0.5-0.7 a week. To build in package RW3. Built (RW3): a notice brings a Raid Ticket at S 40%, SS 40%, SSS 40% (was 30 / 60 / 100%). With 6 notices completed a day (42 a week, 182.6 a month) and the rank weights S 3.5%, SS 0.8%, SSS 0.2%: S tickets 42 x 3.5% x 40% = 0.59 a week; SS + SSS tickets 182.6 x 1.0% x 40% = 0.73 a month (one every 1.4 months). Checked over 10,000 simulated weeks.

**RK5. The total rank ladder against the ticket budget** · Decide · Raid · asked 2026-10-21 · decided 2026-10-23
- Kept as given (F 800 .. A 9,000, S 15,000 .. U 30,000). At 751 raid damage a fight (BF5's model) the ranks take 2 / 2 / 4 / 7 / 10 / 12 / 20 / 27 / 34 / 40 fights; free tickets allow about 16 a raid (12 when it falls on day 3), so S and up need bought tickets or wins at high fight ranks (a win at SSS counts 2,000, so U in 15). Fine as an aspiration, or scale the top?
  - Keep the ladder
  - Scale S..U down (e.g. 12k / 14k / 16k / 18k)
- **Default:** Keep the ladder
- **Outcome:** Owner (10-23 00:10): "30,000 is only possible if they hit SSS 15 times. Anyway, in the future, there might be other ways to get more raid tickets." Keep the ladder (the default).

**HB2-1. Swordbill Challenger keeps three skills as a thematic exception** · Decide · Cards · asked 2026-10-21 · decided 2026-10-21
- Package HB2's new Very Rare Hummingbird (3/5, Wait 1, Flying + Taunt + Counterattack, 98% of N) has three skills. The two-skill rule's tests only exempt Epic and up, Supreme, hidden, Easter-egg and token cards, so the card is named in a THEMATIC set in tests/bf5-2026-10-21.js and tools/two_skills_2026_10_21.js. Alternatives: drop Flying (a Hummingbird that walks) or fold Counterattack into Taunt.
  - Keep three skills as a named exception
  - Cut to two (Taunt + Counterattack, no Flying)
  - Cut to two (Flying + Taunt)
- **Default:** Keep three skills as a named exception
- **Outcome:** Owner 18:23: plain Flying, Tide, Diurnal and Nocturnal don't count toward the two-skill limit; several of them count as 1. Built by package TR (bramblewood-budget.js skillCountOf, the two-skill tool, the editor's budget panel). The Swordbill Challenger is within the rule; 69 cards got back the skill BF5 cut only because one of these counted.

**RP1. Faction rewards' map term in the stat budget** · Decide · Rewards · asked 2026-10-21 · decided 2026-10-23
- A faction Rare can't be had before Map 14 and a Very Rare before Map 25 (the faction reward track), but cardObtainMap still counts every faction reward as a pack card (Map 5) for N's Map x 0.2. Changing it moves N for the 42 faction cards (package BF5's stats).
  - Follow the gate (Common 0, Uncommon ~7, Rare 14, Very Rare 25 ...)
  - Keep Map 5 for all faction cards
- **Default:** Keep Map 5 until BF5 lands
- **Outcome:** Owner (10-23 00:10): "Actually OKAY!" Keep Map 5 for faction cards until BF5 lands (the default).

**RP2. The later faction gates** · Decide · Rewards · asked 2026-10-21 · decided 2026-10-23
- Proposed: Very Rare at 50 received and Map 25; Super Rare 60 / Map 30; Epic 70 / 35; Heroic 80 / 40; Unique and up 90 / 50 (FACTION_RARITY_GATES). The sim puts about 76 received by Map 25 and 111 by Map 40.
  - Keep the proposal
  - Other numbers
- **Default:** Keep the proposal
- **Outcome:** Owner (10-23 00:10): "OKAY" Keep the proposal (the default).

**RP3. Quarry Mole out of Base** · Decide · Rewards · asked 2026-10-21 · decided 2026-10-23
- The Quarry Mole (Darksight, Keen Sense, 1 Lumber) is a Base card everyone owns. Proposal: make it a Caves & Alcoves (Map 8, 8-1) reward; the Badger Lumberjack on 1-4 is the Lumber introduction now, and the plain Harvest Mouse is already Base.
  - Move the mole to 8-1
  - Keep it in Base
- **Default:** Move the mole to 8-1
- **Outcome:** Owner (10-23 00:10): "YES! See earlier non-registered complaint" Move the Quarry Mole to 8-1 (the default). Package not named in the 10-23 split; card data, assign when queued. Built (RW3): the Quarry Mole is Caves & Alcoves' 8-1 first-clear card (source map m4 / 8-1; Thistlewood's pool -> Caves & Alcoves'). The "earlier complaint" was N22-8 (its effects too advanced for the start): T-1 no longer pays it, even though the live tutorial config still lists it (the game skips it; supabase/proposed/20261023_rw3_tutorial_reward.sql clears the list, on "apply it"). 8-1 fights with two Quarry Moles; Thistlewood's 1-2 / 1-3 / 1-4 decks lost theirs (Field Vole, Harvest Mouse, Compost Grub; 1-4's showcase is the Field Vole). Call RW3-9.

**RP4. Plain start for Hummingbirds, the 0-2 pack and the tutorial rewards** · Decide · Rewards · asked 2026-10-21 · decided 2026-10-23
- Every Hummingbird faction card flies (no plain one), the 0-2 faction pack's third card is any basic-pack card, and the tutorial's reward cards (Rabbit Kit, River Warden, Sunspire Envoy, Riverwing Envoy) have skills. The pass made skirmish rewards and the faction picks plain on Maps 0-1 only.
  - Add a plain Hummingbird common and plain tutorial rewards
  - Leave as is
- **Default:** Leave as is
- **Outcome:** Owner (10-23 00:10): "I can balance the hummingbirds myself later. The hummingbird and otter factions should be symmetric." Leave as is (the default) for now; the owner balances the Hummingbirds later, and the two factions are to end up symmetric.

**RP5. Held cards: the Canopy's rainforest animals, the Thistle Baron, Eyrie Heights' theme** · Decide · Rewards · asked 2026-10-21 · decided 2026-10-23
- 15 Canopy animals are held for a Map 25 rainforest (the Savanna Reaches has room for 10 now); the Thistle Baron (Map 1's leader, Thorns) is held for Map 21+; Eyrie Heights' chapel birds are Ecclesia (Map 77), so Map 11 still fields cards nobody can collect; the Basalt Foundry's fights are Devilry (Map 66).
  - Keep them held and re-theme Map 11 and the Foundry
  - Put the Canopy animals on Map 14 now
- **Default:** Keep them held
- **Outcome:** Owner (10-23 00:10): "OKAY" Keep them held (the default).

**RP6. The last side-map gates** · Decide · Maps · asked 2026-10-21 · decided 2026-10-23
- Gated now (after Map N cleared, fights count as Map N): Clovermead 5, Lilypad Reach 6, Smugglers' Grotto 7, Sunken Grove 9, Mycelium Deep 11, Glimmer Depths 12, Sunken Depths 14, Aerie Vault 15, Canopy 18, Ice Hollow 21, Basalt Foundry 23. Kept: the Pale Desert (after Map 18), the Eye of the Volcano and the Volcano Lair (after 20-10), the Old Bramble (after the Ice Hollow, still counting as Map 17).
  - Pale Desert after Map 22, the Eye and the Lair after Map 24, the Old Bramble as Map 21
  - Keep these four as they are
- **Default:** Keep these four as they are
- **Outcome:** Owner (10-23 00:10): "OKAY" Keep these four as they are (the default); DV7 replaces the list.

**DV1. The rarity ladder past Map 20** · Decide · Rarity · asked 2026-10-22 · decided 2026-10-22
- Package DV set the ladder (arena_app.js RARITY_INTRO): Common 0, Uncommon 1, Rare 5, Very Rare 10, Super Rare 20, Epic / Heroic by the Eye of the Volcano / the Volcano Lair (the main road fields them from Map 22). Proposed past that: Unique 30, Legendary 40, Mythic 55, Ancient 70, Divine 90. A skirmish caps at Super Rare on 20-29, Epic 30-39, Heroic 40-49 ...; an elite one step more, a boss two.
  - Keep the proposal
  - Other maps
- **Default:** Keep the proposal
- **Outcome:** Owner 07:41: OK, with changes. Heroic moves to Map 25 and Mythic to Map 60 (Epic 22, Unique 30, Legendary 40 as proposed). Ancient, Divine, Void and Daemonic never appear on the road (road skirmishes or road rewards): only special quests and dungeons give them, and Mythic is the highest rarity the road reaches. The Volcano Lair and the Eye of the Volcano still introduce the first Heroic and Epic (side maps may exceed the road). Built by package DV2 (arena_app.js RARITY_INTRO, ROAD_MAIN_FROM, ROAD_NEVER).

**DV2. Map leaders outside the ladder** · Decide · Rarity · asked 2026-10-22 · decided 2026-10-23
- The 11 Heroic map leaders a boss pays on Maps 0-19 (Sergeant Bramblefox to the Yeti Chieftain) and the Triumvirate (Unique, 23-8) come before Heroic and Unique are revealed. DV kept them outside the ladder, as the old road cap did.
  - Keep leaders outside the ladder
  - Re-rank the leaders to their map
- **Default:** Keep leaders outside the ladder
- **Outcome:** Owner (10-23 00:10): "OKAY" Keep the map leaders outside the ladder (the default).

**DV3. 1-2 skirmish rewards per map, not per fight** · Decide · Rewards · asked 2026-10-22 · decided 2026-10-22
- Read as per map: each main map pays 1-2 cards from fights (its last fight carries its top card); its other pool cards are basic-pack cards of that map. Most fights now give no card of their own (the base track still gives one on every elite and boss, the faction track every 8th win and each map end).
  - Per map (as applied)
  - Per fight: 1-2 cards on every fight
- **Default:** Per map (as applied)
- **Outcome:** Owner 07:41: per map, by new cards. 10 new cards from that map = 3 skirmish rewards, 6-9 = 2, under 6 = 1; about 2 is the normal. 'New' = a pool card that first appears on that map (not carried over from an earlier map), and one the map gives out (Base and starter cards are not counted). Built by package DV2: 16 maps pay 3, 8 pay 2, Map 21 pays 1; Map 1 keeps the Badger Lumberjack at 1-5.

**DV4. Packs gated by map and rarity** · Decide · Rewards · asked 2026-10-22 · decided 2026-10-23
- A basic-pack card now comes out of a pack or the base track only once its map is reached (source.map) and its rarity revealed (packCardReached); before, any pack card of any rarity came out from Map 5.
  - Keep the gate
  - Gate by rarity only
  - No gate
- **Default:** Keep the gate
- **Outcome:** Owner (10-23 00:10): "No keep packs completely random. Packs outputs can never be changed by anything" Not the default: no gate by map or rarity; a pack's output is completely random and nothing changes it. To build in package RW3. Built (RW3): packs draw from their whole pool: no map gate, no rarity gate, no Lumber-before-pitching gate (a Lumber card that comes early waits for pitching, as other grants do). Nothing remembers earlier packs: the 10-12 recent-pull weight and the new-card guarantee (Tidemire Chest, Highcrest Case) are off. Prices and where packs are sold are unchanged. The card drop, the base reward track and a raid claim's pack cards keep the gate (they are not packs). Calls RW3-3.

**DV5. Boss cards re-ranked for the ladder** · Decide · Rarity · asked 2026-10-22 · decided 2026-10-22
- The Caldera Wyrm and the Magnate Duck Legendary to Heroic, The Contradiction Unique to Epic, the Fire Drake Hatchling Common to Heroic (the Lair's reward). The Cathedral Eagle (Legendary, Ecclesia, held for Map 77) left 21-6 (the fight keeps its name); the Grovebearer Dragon-Turtle (Legendary) left 23-8 and is held for Map 40. The Caldera Wyrm is priced its own way and was not re-fitted (6/36).
  - Keep
  - Restore the Legendaries as boss exceptions
- **Default:** Keep
- **Outcome:** Owner 07:41: OK, keep. (Package DV2: with Heroic from Map 25 the Magnate Duck left Map 24's boss deck, see DV8.)

**DV6. Faction track gates after Map 20** · Decide · Rewards · asked 2026-10-22 · decided 2026-10-23
- Replaces RP2: Very Rare at 50 received, Map 20 and the Volcano Lair cleared (owner: after Map 20's strongest submap); Super Rare 60 / Map 22 / the Lair; Epic 70 / Map 26 / the Eye; Heroic 80 / Map 30 / the Lair; Unique and up 90 / Map 40.
  - Keep
  - Other numbers
- **Default:** Keep
- **Outcome:** Owner (10-23 00:10): "OKAY" Keep the faction track gates (the default).

**DV7. Side-map gates, out of order** · Decide · Maps · asked 2026-10-22 · decided 2026-10-23
- Replaces RP6's list: Clovermead after Map 12, Lilypad Reach 6, Smugglers' Grotto 7, the Mycelium Deep 8, the Sunken Depths 11, the Sunken Grove 13, the Aerie Vault 15, the Glimmer Depths 16, the Canopy 18, the Pale Desert 19, the Ice Hollow 21, the Basalt Foundry 23; the Old Bramble after the Ice Hollow; the Eye and the Lair after 20-10. Fights count as the gate map.
  - Keep
  - Other gates
- **Default:** Keep
- **Outcome:** Owner (10-23 00:10): "OKAY to be out of order." Keep the side-map gates, out of order (the default).

**DV8. The Magnate Duck cannot be Map 24's boss under the new ladder** · Decide · Rarity · asked 2026-10-22
- Heroic is introduced on the road at Map 25 (DV1), but the Magnate Duck (Heroic, was Legendary) was the named boss card of 24-8, The Magnate Duck. Package DV2 swapped it out for the next card of its theme (a third Gilded Swan Knight; the boss keeps its name, hqHp and rules) and removed it from Map 24's pool; the card stays Heroic with no source. Options: leave it held for Map 25+, re-rank it to Epic (then refit its stats, 1/22 has no legal line) and put it back in 24-8, or move the fight's name to Map 25.
  - Held for Map 25+ (now)
  - Re-rank to Epic and put it back in 24-8
  - Other
- **Default:** Held for Map 25+ (now)

**SK-1. Sergeant Bramblefox: Rare, Map 13, the leader of Fox Run** · Decide · Rarity · asked 2026-10-22 · decided 2026-10-23
- Owner 09:52: lower its rarity and move it to another map, as that map's reward and in its skirmish. Done (package SK): Heroic -> Rare, from Map 0 (0-4) to The Redwood Deep (Map 13), the leader (showcase) of 13-2 Fox Run and paid when 13-2 is cleared (grantClearedBossLeaders reads its source, so clearing 0-4 no longer pays it; a player who already holds it keeps it). Why there: the lore bible's Greenhood Band (foxes, magpies and outcast mice) lives in the Redwood Deep and the Briar Maze, and Fox Run's deck is the foxes (Fox Kit, Swift Fox). Rare is allowed from Map 5 and is below Map 13's Very Rare cap, so it is the deck's top card. Re-fitted by the formula at Rare and Map 13: 4/12 -> 3/10 (89% of N), cost 1, no skills. Map 13's pool holds it under SPECIAL (the MAP list is full at 10). Fox Run now: Berserker Boar 4, Fox Kit 3, Swift Fox 3, Grizzly Vanguard 3, Tasmanian Devil 2, Bramblefox 1 (Lynx and Fawn Scout out, so it leads the deck); battle rating 61 -> 56. Heads-up: a live `__cfg:map-pools:mr` row would win over the file; the admin's Map cards editor shows it.
  - Keep: Rare, 13-2 Fox Run
  - Another map (the Briar Maze's Quill Path 12-2, the Greenhood Band's other home)
  - Another rarity (Uncommon, or Very Rare at Map 13)
- **Default:** Keep: Rare, 13-2 Fox Run
- **Outcome:** Owner (10-23 00:10): "OKAY" Keep Sergeant Bramblefox: Rare, 13-2 Fox Run (the default).

**SK-2. Skirmish leaders picked by hand (the highlighted card changes)** · Decide · Maps · asked 2026-10-22 · decided 2026-10-23
- Owner 09:52: from Map 2 every skirmish's leader is its highlighted (showcase) card. The leader is the chosen showcase, else the Auto pick (top rarity, then Attack + Health/2). Where that Auto pick is a small card beside a much bigger unit (for example a 1/1 Rare beside a 1/25 Common that costs 3) I set `showcase` by hand to the biggest unit by cost and strength, so the highlighted card, and the leader, changes on these 14 fights: 5-3 and 5-4 Venomlord Serpent; 15-1 and 15-4 Cataphract Destrier; 17-1, 17-3 and 17-A-1 Glacial Ape King; 18-2 Komodo Warlord; 20-1 and 20-4 Cave Warlord; 21-3 Glacier Yak; 22-2 Gorge Wyrm; 19-A-4 Pyroclast Wyrm; 14-A-2 Ancient Sloth Titan. Every other fight keeps its Auto pick as the leader (the 2-1 crab is yours). Change a leader in the Showcase picker (Admin): the leader follows.
  - Keep these picks
  - Back to Auto everywhere (the strongest by rarity)
  - Tell me which to change
- **Default:** Keep these picks
- **Outcome:** Owner (10-23 00:10): "OKAY" Keep the hand-picked leaders (the default).

**SK-3. Skirmish sizes: 8 sevens, and three fights that rate higher with their leader** · Decide · Balance · asked 2026-10-22 · decided 2026-10-23
- 149 skirmishes (main maps and side maps) now hold 5-7 different cards: 47 have 5, 94 have 6, 8 have 7 (7 only with a clear leader: 7-2, 22-4, 2-A-3, 19-A-5, 14-A-3, 20-B-1, 18-A-3, 18-A-7; was 28 sevens, and 14 decks of 8 to 12 cards, all on the side maps). 17 fights had 4 cards and got a fifth from the map's pool. The leader counts double in the battle rating, so I traded copies (and, in 15 fights, a heavy card for a lighter one the map already uses) to keep each rating within about 10% of before; the smallest decks (rating 20) rise by 2, which is a leader's minimum. Three fights stay above: 16-4 (39 -> 52), 21-2 (63 -> 74) and 20-B-3 (46 -> 61), where the rest of the deck is already Common so copies cannot offset a Rare or Very Rare leader. Not touched: the Tutorial map's lesson fights (T-2 has 7 cards and T-3 has 8, they teach with a hand-picked lineup), the endless dungeons' generated floors, elites and bosses, and Maps 0-1 (no leaders, sizes only).
  - Keep
  - Give those three a lighter leader (a Common showcase)
  - Allow more sevens
- **Default:** Keep
- **Outcome:** Owner (10-23 00:10): "OKAY (7 cards should be rare - 8 7s is okay i think)" Keep (the default): 8 skirmishes with 7 cards stays; 7 is meant to be rare.

**T3. Apply the server-checked fights migration** · Decide · Server · asked 2026-10-03 · decided 2026-10-23
- The fight_sessions migration (single-use seed, transcript, server replay) is written and the client is ready. Nothing changes until it is applied. Owner answered OKAY on 10-23; this is a live database write, so it waits for him to say 'apply it'.
  - Say "apply it" and I run supabase/migrations/20261003_fight_sessions.sql
  - Wait
- **Default:** Wait (local seeds keep working)
- **Outcome:** Owner (10-23 06:59): "Apply it". Checked live (read-only): the fight_sessions migration was already applied on 2026-10-16 (Supabase migration 20261016012658); nothing to run. This item was out of date.

**D18. Play Maps 1–4 and say how difficulty and rewards feel** · Feedback · Balance · asked 2026-10-03 · decided 2026-10-23
- Map 1 is an on-ramp; Maps 1–2 have reward cards; Map 2 retuned. Note: since 2026-10-08 Conquest fights default to Open mode (no collapsing), which changes how the AI and positions play, so the old difficulty numbers need a re-check.
- **Default:** I re-simulate win rates under Open mode next
- **Outcome:** Owner (10-23 00:10): "played - seems OKAY" Maps 1-4 feel right; no change to difficulty or rewards.

**I1. Native-speaker review for Tagalog, Tamil, Japanese and Korean** · Decide · Languages · asked 2026-10-06 · decided 2026-10-23
- Machine-quality translations ship now (including card names). A native pass would catch tone and idiom.
  - Find reviewers
  - Ship as is
- **Default:** Ship as is
- **Outcome:** Owner (10-23 00:10): "OKAY" Ship as is (the default); no native-speaker review for now.

**I2. Translate text that contains numbers** · Decide · Languages · asked 2026-10-08 · decided 2026-10-23
- Lines like "3 cards", "Pack 2 of 10", "N new cards!" stay English because the translator matches whole strings. Fix: number-aware templates for each language.
  - Approve the template change
  - Leave English
- **Default:** Approve
- **Outcome:** Owner (10-23 00:10): "Template change" Approve the template change (number-aware templates for each language). Package not named in the 10-23 split (translations); queue it as an i18n package. Built (SX): 18 TX templates replace 33 numbered literals in arena_app.js (achievements, daily and weekly quests, the Lumber rules, the battle-rating colours, the raid's Top N%), plus the 3 results.raid-tier-top keys. In the 12 packs 396 numbered rows (33 a language) became 216 template rows (18 a language); every old row still translates to what it said. The page translator now writes a template's number the language's way (4,000 is 4.000 in German, 2.5 is 2,5 in French). tools/text/templatize_numbers.py does and checks it; keyify reuses a number template; tools/i18n_ui.py counts numbered texts a template covers.

**H2. The 3-part Hero XP bar (feedback item 17)** · Decide · Hero · asked 2026-10-08 · decided 2026-10-23
- How the three XP bars should split (battle XP, Materia XP, ...?) — needs your picture of it.
- **Outcome:** Owner (10-23 00:10): "Battle XP, Materia XP, Battle XP OR Materia XP. But if you use Battle XP for the 3rd section, there is a 25% inefficiency." The Hero XP bar has three sections: Battle XP, Materia XP, and a third that takes either; filling the third with Battle XP is 25% less efficient. To build in package SX. Built (SX): each level's need (heroXpToNext) is split in thirds: Battle, Materia, Either. Battle XP fills only the first, Materia XP only the second; the third takes Materia 1:1 and Battle at 75% (HERO_XP_EITHER_BATTLE). A level is gained when all three are full; XP past a full part waits for the next level. The save keeps two pools (xpB, xpM since a base level, lvBase); h.xp stays the plain total. Old saves keep their level and their XP into it becomes Battle XP. The Hero Hall shows the three parts (Either split: Materia violet, Battle striped ember), the rule as the bar's tooltip and as a line under it, each part's numbers on hover. Calls SX-2, SX-3.

**E1. A free pack for guests before sign-in** · Decide · Economy · asked 2026-10-08 · decided 2026-10-23
- Let a guest open one Sprout Pouch before asking them to sign in.
  - Yes
  - No
- **Default:** Yes
- **Outcome:** Owner (10-23 00:10): "No." No free pack for guests before sign-in.

**E2. Disenchant values (Magic Dust per extra copy)** · Confirm · Economy · asked 2026-10-08 · decided 2026-10-23
- Built with: Common 5, Uncommon 8, Rare 15, Very Rare 20, Super Rare 30, Epic 40, Heroic 50, Unique 60, Legendary 100, Mythic 150, Ancient 200. Never Base/Quest/levelled/foil/Shiny; keeps one copy.
  - Keep
  - Change the numbers
- **Default:** Keep
- **Outcome:** Owner (10-23 00:10): "5/10/25/45/65/100/150/250/400/700/1200/2000+ etc." Change the numbers (not the default). Taken in rarity order: Common 5, Uncommon 10, Rare 25, Very Rare 45, Super Rare 65, Epic 100, Heroic 150, Unique 250, Legendary 400, Mythic 700, Ancient 1200, and the next rarity above Ancient 2000+; RW3 checks the rarity list and the "etc.". To build in package RW3. Built (RW3): Magic Dust per plain spare copy, RARITY_DEFS order: Common 5, Uncommon 10, Rare 25, Very Rare 45, Super Rare 65, Epic 100, Heroic 150, Unique 250, Legendary 400, Mythic 700, Ancient 1,200, Divine 2,000, then x1.5 a step for the "etc.": Void 3,000, Daemonic 4,500. Starter as Common (Starter cards can't be melted anyway); special rarities as their tier (Quest = Uncommon, Special and Event-Rare = Rare, Dev- / Event-Legendary = Legendary, Dev-Ancient = Ancient). Foil, Shiny, skin and extended art still multiply it. Was a % of a Materia Unit (Common 2, Rare 8, Legendary 42).

**E3. Shiny look** · Decide · Cards · asked 2026-10-08 · decided 2026-10-08
- **Outcome:** Hue shift, not a foil: the art is recoloured by a fixed per-card hue (90–270°), soft white glow, twinkling ✦. Prism stays a foil treatment.

**G1. Combo counter** · Decide · Battle · asked 2026-10-07 · decided 2026-10-23
- A counter for chains of triggered abilities in one round, with escalating sound/visuals.
  - Build it
  - Skip
- **Outcome:** Owner (10-23 00:10): "No." Skip the combo counter.

**T1. Catch-up mechanics** · Discuss · Design · asked 2026-10-03 · decided 2026-10-23
- Rested XP, a weekly comeback quest tier, cheaper early Conquest once you've cleared further, a gentler curve.
- **Outcome:** Owner (10-23 00:10): "OKAY" Catch-up mechanics: the four ideas listed are approved as a direction.

**T2. Replays** · Discuss · Design · asked 2026-10-03 · decided 2026-10-23
- Watch-only or re-fight this deck? Share links? How many to keep?
- **Outcome:** Owner (10-23 00:10): "OKAY to all, max past 20" Replays: all the options listed are approved, and the keep-count goes past 20.

**N1. The Nest repeats the Codex** · Discuss · Design · asked 2026-10-08 · decided 2026-10-23
- You noted the Nest overlaps the Codex. Kept for now. Ideas when you're ready: the Nest as your trophy shelf (Shinies, foils, prestige), or merge it into Codex as an Owned filter.
- **Default:** Keep for now
- **Outcome:** Owner (10-23 00:10): "Nest only lists baby/eggs or level 0 base cards (in two tabs) - these are like 'recruits'. Faction cards also start at level 0." Not the default (keep for now): the Nest lists only baby/egg cards and level-0 base cards, in two tabs, like recruits; faction cards also start at level 0. To build in package TU2.

**E4. Pack set discounts** · Decide · Economy · asked 2026-10-08 · decided 2026-10-08
- **Outcome:** Revised 2026-10-08: 1/10/25/50/100 packs = 0/5/6/7/7.5% off. Built.

**G3. Skirmish default mode** · Decide · Battle · asked 2026-10-08 · decided 2026-10-08
- **Outcome:** All Conquest skirmishes default to Open (no collapsing). Gravity (collapsing) is special, set per skirmish. Built.

**G4. Frozen field effect** · Decide · Battle · asked 2026-10-08 · decided 2026-10-08
- **Outcome:** Tundra fights: Field card by the enemy deck, snowfall, one card per side +1 Wait each turn with an ice pulse. Built.

**L2. Dogs and cats** · Decide · Lore · asked 2026-10-06 · decided 2026-10-08
- **Outcome:** Neutral creatures, not pets: friends of both peoples. War dogs carry weapons in their mouths and stay four-legged. Recorded in lore-bible.md.

**I3. Translate card names** · Decide · Languages · asked 2026-10-06 · decided 2026-10-08
- **Outcome:** Yes: card names are translated in all 12 languages.

**E5. Disenchanting rules** · Decide · Economy · asked 2026-10-08 · decided 2026-10-08
- **Outcome:** Base and Quest cards can't be disenchanted (Base cards level up through play, 1–10). Levelled cards and cards with a skin are never disenchanted. A quick Disenchant extras button keeps one of each.

**E6. Shiny chance** · Decide · Cards · asked 2026-10-08 · decided 2026-10-08
- **Outcome:** 0.5% for every card received, Base and Quest included.

**U1. Unfinished fights** · Decide · UI · asked 2026-10-08 · decided 2026-10-08
- **Outcome:** No Resume/Discard pop-up; Home's Play tile turns into a green Continue with the fight as its subtitle.

**U2. Tutorial hands over the starter deck** · Decide · UI · asked 2026-10-08 · decided 2026-10-08
- **Outcome:** After the last tutorial win the player presses Add to deck and watches the cards go in.

**D15. PixelLab credits** · Decide · Art · asked 2026-10-03 · decided 2026-10-03
- **Outcome:** Wait for the monthly reset, then finish Maps 8–10 and the Home sprites. No purchases.

**T4. Currencies and Materia** · Decide · Economy · asked 2026-10-03 · decided 2026-10-03
- **Outcome:** Many currencies are fine as long as each shows only where it matters.

**T8. Farms and potions** · Decide · Design · asked 2026-10-03 · decided 2026-10-03
- **Outcome:** Approved as sketched: real-time plots, PvE-only potions, sellable once trades are server-side.

**T9. Sound sourcing plan** · Decide · Sound · asked 2026-10-03 · decided 2026-10-03
- **Outcome:** CC0 first (Kenney, OpenGameArt, Freesound) plus our own jsfxr, with audio/ and CREDITS.md.

**T7. Effects picks** · Decide · Effects · asked 2026-10-03 · decided 2026-10-03
- **Outcome:** Holo foil, depth parallax, battlefield weather.

**T6. Alt-art** · Decide · Cards · asked 2026-10-03 · decided 2026-10-03
- **Outcome:** Opponents see your alt-art, with a fallback to default art.

**T5. Apple sign-in** · Decide · Accounts · asked 2026-10-02 · decided 2026-10-03
- **Outcome:** Cancelled.

**D12. Passwords** · Decide · Accounts · asked 2026-10-03 · decided 2026-10-03
- **Outcome:** Minimum length 8; leaked-password check waits for the Pro plan.

**D13. World map** · Decide · Maps · asked 2026-10-03 · decided 2026-10-03
- **Outcome:** Compass diamonds on one winding trail; click to zoom into a map.

**D14. Packs on sale** · Decide · Economy · asked 2026-10-03 · decided 2026-10-03
- **Outcome:** Only the Sprout Pouch; the others show Coming soon.

**D16. UI/UX review** · Decide · UI · asked 2026-10-03 · decided 2026-10-03
- **Outcome:** Ongoing Polish track.

**D10. Native builds** · Decide · Platform · asked 2026-10-02 · decided 2026-10-03
- **Outcome:** Not yet.

**D1. Header and Home** · Decide · UI · asked 2026-10-02 · decided 2026-10-03
- **Outcome:** Built: Play as hero, 2×2 grid, Quests and Community extras.

**D2. Shop and Pack 1** · Decide · Economy · asked 2026-10-02 · decided 2026-10-03
- **Outcome:** Built: 33-card Pack 1, real cards, pack opening.

**D4. Simulator** · Decide · Tools · asked 2026-10-02 · decided 2026-10-03
- **Outcome:** Admin-only; players see Recent opponents.

**D7. Raid damage** · Decide · Raids · asked 2026-10-02 · decided 2026-10-03
- **Outcome:** Core lock global; equal base + tiers; Maple Leaves; overflow damage counts.

**D8. Trench** · Decide · Raids · asked 2026-10-02 · decided 2026-10-03
- **Outcome:** Built: you play your row; allies CPU; telegraphed columns.

**S1. Apply the admin player list function** · Decide · Server · asked 2026-10-08 · decided 2026-10-23
- The Admin → Players portal reads one admin-only, read-only database function (admin_list_players: profiles, levels, currencies, cards, matches; no emails). Written in supabase/proposed/20261008_admin_list_players.sql. Applying it (and the panel that reads it, already drafted) was held for your OK. Owner answered OKAY on 10-23; this is a live database write, so it waits for him to say 'apply it'.
  - Say "apply it" (admin list)
  - Wait
- **Default:** Apply
- **Outcome:** Owner (10-23 06:59): "Apply it". Checked live: admin_list_players was already applied on 2026-10-16 (migration 20261016012550); nothing to run.

**S2. Anti-cheat tier 1** · Decide · Security · asked 2026-10-08 · decided 2026-10-23
- Players can currently edit their own rating and currencies from the browser console. Tier 1 makes rating read-only and refuses any single write that adds more than 2,000 Maple / 200 Gold Leaves. supabase/proposed/20261008_anticheat_tier1.sql. Owner answered OKAY on 10-23; this is a live database write, so it waits for him to say 'apply it'.
  - Apply tier 1
  - Change the caps
  - Wait
- **Default:** Apply tier 1
- **Outcome:** Owner (10-23 06:59): "Apply it". Checked live: anticheat_tier1 was already applied on 2026-10-16 (migration 20261016012841); nothing to run.

**E7. Pack contents and foil odds** · Decide · Economy · asked 2026-10-08 · decided 2026-10-08
- **Outcome:** Pack editor (Admin): per pack price, size, pool, rarity weights, foil chance per card, guaranteed foil, and finish weights (By rarity 60, Prism 9, Hex 8, Etched 7, Ice 7, Reverse 6, Gold 3). Sprout Pouch 4% foil per card, Acorn Chest 8%, Golden Bramble Case 12% with one guaranteed. A card's From picks its pack pool. Publishes live as __cfg:shop-packs.

**E8. Over-size decks and the main deck** · Decide · Decks · asked 2026-10-08 · decided 2026-10-08
- **Outcome:** Decks can hold any number of cards while building (calm 'N over' note, no red shake). ★ Main deck is chosen explicitly and is what you play with; only a 20-card main deck can be played.

**F1. Upgrade / Refine / Enchant** · Decide · Cards · asked 2026-10-08 · decided 2026-10-08
- **Outcome:** Forge has three tabs. Upgrade = level 1–10 then Prestige. Refine = your best copy up the finish ladder Plain → Foil → Hex → Etched → Cracked ice → Reverse → Prism → Gold leaf (costs rise; Prism/Gold need Gold Leaves); never makes Shiny. Enchant = socket one Materia (Ember +1⚔ and scorching hits, Stone +3❤, Tide +2❤, Grove +1⚔+1❤); crystals are the player's now, crafted from Dust without a Hero.

**F2. Shiny in battle** · Decide · Cards · asked 2026-10-08 · decided 2026-10-08
- **Outcome:** Shiny is rolled in the one grant function, so any card received can be Shiny. A card you own a Shiny copy of is Shiny in your hand and on the board, and units it spawns are Shiny too.

**F3. Enchant and Refine numbers** · Confirm · Cards · asked 2026-10-08 · decided 2026-10-23
- Enchant: Ember +1⚔ (scorch), Stone +3❤, Tide +2❤, Grove +1⚔+1❤. Refine costs from 40✨+100🍁 (Foil) up to 200✨+450🍁+10🍂 (Gold leaf). Tide is currently a weaker Stone; give it something of its own?
  - Keep
  - Retune
- **Default:** Keep
- **Outcome:** Owner (10-23 00:10): "OKAY" Keep the Enchant and Refine numbers (the default).

**B1. Open-mode difficulty tweaks** · Decide · Balance · asked 2026-10-08 · decided 2026-10-09
- Re-simulated under Open fights (difficulty-open-mode-2026-10-08.md): Maps 1–4 got easier; Map 3's first two skirmishes (16 HP) are now easier than Map 2's; the Frost Yeti King (130 HP) is a 0% wall. Proposed: Badger Warband and Quill Line to ~22 HP; Yeti King to ~90 HP or make its fight Gravity (collapsing) as a special. Superseded if B2 retunes all maps.
  - Apply both
  - Only Map 3
  - Only Yeti King
  - Leave as is
- **Default:** Apply both
- **Outcome:** Superseded by B2's full retune.

**B2. Skirmish balance audit proposals** · Decide · Balance · asked 2026-10-09 · decided 2026-10-09
- skirmish-balance-audit-2026-10-08.md proposed HP changes on 72 nodes and 33 deck swaps. It was measured before today's CPU fix (the enemy now plays its Lumber cards), so its numbers are stale. Better route: retune every map with the skirmish editor's new Auto-tune against a new player's likely deck at each fight, as was done for Thistle Fields, Pebble Beach and the Grotto on 2026-10-09.
  - Retune all maps with the new tools
  - Only the walls and trivial fights
  - Leave as is
- **Default:** Retune all maps with the new tools
- **Outcome:** Taken as default on 'continue' (revertible): tools/retune_all.js retuned 85 of 96 fights against a new player's likely deck; 11 kept as they were; HP floors 14/25/30 for skirmish/elite/boss; raid bosses untouched. Before → after table in docs/balance/retune-all.json. Still too easy after the retune: Sunken Hollow (needs stronger cards than its map has) and 3-2.

**B3. Enemy deck level reads 0 on most nodes** · Decide · Balance · asked 2026-10-09 · decided 2026-10-09
- The Enemy deck Lv is rarity × (1 + card level) − 1 per card. Enemy cards are all level 0 and mostly Common or unrated, so nearly every node reads 0, and it ignores castle HP. Tried weighing unrated cards by their power (2026-10-09): most nodes still read 0 and the numbers jumped about (Map 2's boss 0, a Map 4 skirmish 4), so it wasn't shipped. Options: give enemy cards levels that rise map by map (also makes later maps harder); fill in rarities on all cards; or base the badge on simulated win rate instead.
  - Enemy card levels rise by map
  - Rarity pass on all cards
  - Badge from simulated win rate
  - Leave as is
- **Default:** Badge from simulated win rate
- **Outcome:** Mostly resolved by B5: every card now has a rarity, so the enemy deck level is no longer 0 everywhere.

**C2. Lock the battle type in the skirmish editor?** · Clarify · Conquest · asked 2026-10-09
- You said 'You CANNOT change the battle type once it's been set in the skirmish editor'. In a local test the change saved fine. Is that a bug you hit (it reverted?), or a request to lock the field after the first save? 2026-10-10: fixed. The battle type is set only in Edit skirmish (the picker outside the editor is gone), and a local save no longer gets overwritten by an older cloud copy.
  - It's a bug: it reverts
  - Lock it after the first save

**C3. Victory shift and the castle's white gradient** · Clarify · Battle · asked 2026-10-09 · decided 2026-10-23
- Couldn't reproduce either. Which cards move at the end of a fight, and when? Where does the white gradient on the castle show (fight, map, results)? A screenshot would settle both.
- **Outcome:** Owner (10-23 00:10): "Now this is rarer - so mabye OKAY for now." Leave the victory shift and the castle gradient alone for now; it happens rarely.

**E9. What do Krooni 👑 buy?** · Decide · Economy · asked 2026-10-09 · decided 2026-10-23
- The Golden case gives 3 Krooni. Nothing spends them yet, and they're kept on this device only (no database column). Ideas: cosmetic finishes, a Krooni-only pack, or Hero rarity boosts.
  - Cosmetics
  - A Krooni pack
  - Hero boosts
  - Decide later
- **Default:** Decide later
- **Outcome:** Owner (10-23 00:10): "Retire Krooni for now" Nothing will spend Krooni; retire them from the game for now. To build in package TU2.

**E10. Promotion cost and level** · Decide · Economy · asked 2026-10-09 · decided 2026-10-23
- Worker Ant promotes at Lv 3 for 60 Maple Leaves + 20 Dust. The ant goes back to Lv 0, so it can be promoted again into the other choices. Ant Warrior uses the Soldier Ant's art for now.
  - Keep
  - Higher level (5)
  - Free promotion, keep the level
- **Default:** Keep
- **Outcome:** Owner (10-23 00:10): "No. Combining or converting cards to different cards is a concept we havent explored. HOWEVER, please prepare this tab. This is not a subtap - it will be its own feature page!" Keep promotion as is (the default); card combining and converting is not designed yet, but prepare its page: its own feature page, not a subtab. To build in package TU2.

**E11. Nurse master bonus** · Decide · Economy · asked 2026-10-09 · decided 2026-10-23
- The Nest Nurse (a Unique+ card or the Wandering Traveller) is in, but what it does is still open. Ideas: eggs hatch 25% faster; a small chance a hatch comes out Shiny.
  - Faster hatching
  - Shiny chance
  - Both
- **Default:** Faster hatching
- **Outcome:** Owner (10-23 00:10): "YES eggs hatch faster. No, shiny chance cant be increased." Faster hatching only (the first option); the Nurse does not touch the Shiny chance. To build in package RW3. Built (RW3): already in the game since 10-15: the Nurse master speeds every egg, baby and Level-0 training by 2.5% per Nursing mastery point, at most half the time (a Unique Lv 1 nurse: about 22%; the Wandering Traveller with Nursing: more). It never touches the Shiny chance (0.5%, rolled when a copy is granted). No change made; call RW3-11 if a flat 25% is wanted instead.

**D20. Devilry: my readings of your list (all built, all revertible)** · Decide · Design · asked 2026-10-10 · decided 2026-10-23
- Built as I read them: (1) Dark Summon is a second play each turn, just for ⛧ cards, and every Dark Summon card also costs Darkness (a free extra play measured at 100%). (2) Darkness comes from your own units perishing (+1 each); 'dark actions' were left open. (3) Devour uses your play for the turn and works once per devourer. (4) Ritual's 'units perished' counts both sides. (5) Sacrifice N sits on the fodder; the discount comes off Darkness first, then Lumber. (6) Your blank keyword is named Offering N. 2026-10-10 (you: 'darkness is not clear. Is it gained? idk'): yes, it is gained: +1 each time one of YOUR units perishes (Ash Imp adds +1 on arrival). It's shown only if your deck has at least one Devilry card: the pill reads '★ 3 · ⛧ 1' (Darkness held, dark summons left this turn), and each gain floats a ★ +1. You gain 1 dark summon per turn; it doesn't stack.
  - Keep all six
  - Change some (tell me which)
- **Default:** Keep all six
- **Outcome:** Owner (10-23 00:10): "OKAY for now" Keep all six Devilry readings (the default).

**D21. Backstab: what should it do?** · Decide · Design · asked 2026-10-10 · decided 2026-10-23
- You listed Backstab as a neutral skill without a rule. Suggestion: Backstab N, +N damage when it hits a unit that is facing a different target (rewards Pitchfork, Sweep and off-centre angles).
  - Use the suggestion
  - Something else (tell me)
  - Drop it
- **Default:** Use the suggestion
- **Outcome:** Owner (10-23 00:10): "No idea. But if the enemy has a status that makes them less effective at combat or YOU have a skill that makes you MORE effective at combat (blind vs evade e.g.)" Not the suggestion: Backstab gains its bonus when the target has a status that makes it less effective at combat, or the attacker has a skill that makes it more effective (blind against evade, for example). To build in package EN. Built (EN): Backstab N still strikes the nearest enemy unit and never the bramble; its +N now lands when that unit is worse at combat: Blind, Stunned, Frozen, Asleep, Confused, Tipsy, Staggered, Paralyzed, Bound, Webbed or turned to stone, or it would swing blind in the dark while the attacker sees (was: a unit not directly in front). Bonus +N (the card's number), Tall Grass still doubles it. Price 0.6 a point (Assault's 1.8 x about 1 swing in 3; an estimate, call EN-5). Re-fit: Stoat Cutthroat 3/11 -> 3/12, Wrong-Way Salmon 1/8 -> 1/10, Cunning Vixen 1/8 -> 1/10.

**D22. Fast Forward counters: build next?** · Decide · Design · asked 2026-10-10 · decided 2026-10-23
- Your rule: with N counters, a unit runs its turn, upkeep included, N extra times before joining the main action order. It needs a pre-combat pass in the engine, about half a day of work with tests.
  - Build it next
  - After Ecclesia
  - Later
- **Default:** After Ecclesia
- **Outcome:** Owner (10-23 00:10): "Okay. Unused for now" After Ecclesia (the default); not built, no card uses it yet.

**D23. Ecclesia next, with your Prayer value?** · Decide · Design · asked 2026-10-10
- Prayer value = the sum of Prayer N on your board + the cards in your Removal Zone, +1 once a turn by exiling a hand card when summoning an Ecclesia card. Ecclesia cards need a Prayer value (a threshold, not spent). Effect ideas: Worship, Divine Retribution, Lightning, Midas Touch, Healing, Satiety. 2026-10-10 (taken on 'continue'): built. See the archetypes note for every rule, the nine cards and the measurements.
  - Build Ecclesia next
  - Scrapper next
  - Evolution next
- **Default:** Build Ecclesia next

**D24. Arena rules: daily rotation and the second-player card** · Decide · Balance · asked 2026-10-10 · decided 2026-10-23
- Built: the Arena's rule set changes daily (Standard, Long Night, Midsummer, Dusk Start, Timber Fair with +1 Lumber every 3 rounds, Frost Week, Fog on the Moor). In every Arena set, whoever plays second opens with an extra card. Conquest keeps day-first, no extra card and no free Lumber unless a fight sets its own rules; Live Ranked plays Standard. Should Conquest also give the second player the extra card (it would need a retune)?
  - Keep Conquest as is
  - Add the second-player card to Conquest too
  - Change the rotation
- **Default:** Keep Conquest as is
- **Outcome:** Owner (10-23 00:10): "OKAY. 2nd player has no benefit except +1 Shield to Bramble." Keep Conquest as is (the default); in the Arena the second player's extra card is replaced by +1 Shield on its Bramble, and nothing else. To build in package EN. Built (EN): the second player gets +1 Shield on its bramble and nothing else, in every mode that gave a second-player bonus (the Arena rule sets and Double Time fights); no extra card, Health or Lumber. Texts in the 12 packs.

**B6. The hummingbird starter deck beats the otter starter deck ~99% of the time** · Decide · Balance · asked 2026-10-09
- Starter vs starter in simulation (300 matches): otters win 0.9%. All 10 hummingbird Basics fly (dodge half of ground attacks), most are Diurnal (+1 by day), and they run 2 copies each of 10 solid cards against the otters' 20 singles with several 1-Attack fillers. Removing Diurnal alone: 3.7%; a gentler 1-in-3 dodge: 3.3%. Packages that land near even: (C) the 7 hummingbird Basics with 2+ Attack lose 1 Attack, and 5 otter ground Basics (Otter Guard, River Carp, Otter Paddler, Burrow Rabbit, Ant Scout) gain Reach (their attacks ignore the Flying dodge): 47.7%. (F) the same hummingbird nerf, +1 Attack on 6 otter 1-Attack fillers (Honey Bee, Silver Minnow, Duckling, Otter Kit, Worker Ant, Chipmunk Forager), and Reach on Otter Guard and River Carp only: 46.8%. Reach is already in the engine (no card uses it yet). Not applied because it changes the faction players picked, their saved decks and the tutorial. 2026-10-10: superseded by your new basic set (shared six + three per side): the starter mirror now measures 52.9%.
  - F: nerf hummingbirds, lift otter fillers, Reach on 2
  - C: nerf hummingbirds, Reach on 5 otters
  - Something else (tell me)
  - Leave as is
- **Default:** F: nerf hummingbirds, lift otter fillers, Reach on 2

**D19. Archetypes: which to build first** · Decide · Design · asked 2026-10-09 · decided 2026-10-23
- archetypes-design-2026-10-09.md has 10 archetypes plus the Elder / Outer / Forgotten trio. Suggested order: an active Exile zone, Swarm, Tide, Devilry circles, Elder Ones, then Evolution ride. Each archetype lists its open questions. 2026-10-09 (default taken on 'continue'): Swarm built first (Swarm N + Hive Mind on ants and bees). Then Tide (taken on 'continue', revertible): Flow/Ebb each round from round 2; Tide +1 on Flow, -1 damage taken on Ebb; Wash pushes the facing enemy +1 Wait once; 18 water cards tagged, 7 trimmed back into band, 28 water fights retuned. Then the active Exile zone (also on 'continue', revertible): Echoes 🕯️ (+1 per card sent to your Removal Zone) and Remember N (returns from the zone at N Echoes), with Echo Keeper, Marsh Wisp and Bog Revenant. Then the Forgotten Ones (also on 'continue', revertible): Remember returns +1/+1 per Echo spent, the Forgotten tag, and The Unremembered (Swampmire boss reward). 2026-10-10: Devilry built from your new list (see D20). Next suggested: Ecclesia with your Prayer value (D23).
  - Ecclesia next (D23)
  - Scrapper next
  - Evolution next
  - Pause archetypes
- **Default:** Ecclesia next (D23)
- **Outcome:** Owner (10-23 00:10): "OKAY to your suggestion" The suggested archetype order stands (the default).

**T10. New Unique cards can break the raid ghost generator** · Note · Tech · asked 2026-10-09
- Making the Wandering Traveller Unique left stage-5 ghost decks under 20 cards, so it was reverted. The generator needs a fallback before more Unique cards are added.
  - Fix the generator next
  - Later
- **Default:** Fix the generator next
- **Outcome:** Fixed 2026-10-09: ghost decks widen to nearby cards when the band runs out of copies; tests/ghost-unique.js marks every third card Unique and checks all stages.

**B4. Cards that cost 3+ Lumber don't pay off** · Decide · Balance · asked 2026-10-09 · decided 2026-10-09
- Cards costing 3+ Lumber (all five dragons included) score ~38% in simulation. 2026-10-09, taking the default on 'continue': all 30 got an arrival effect (dragons breathe 4 on every enemy; brutes hit the enemy opposite for 2× their cost; Elder Willow, Elderhorn Monarch and Riverworks Bastion refund 2 Lumber; the slow small ones delay the enemy opposite by 2 Wait). It didn't move them: the real cause is that Lumber only comes from discarding cards, so a 4-cost card costs five cards in all. Tested a passive income with the CPU saving properly: +1 Lumber every 2 rounds gives cost-2 cards 75%, cost-3+ 51%, dragons 60% (free cards fall to ~24%, as cheap cards should); every round is too much (dragons 96%); every 3 rounds is too little (45%).
  - +1 Lumber every 2 rounds (core rules change)
  - +1 every 3 rounds
  - Keep discard-only Lumber; make big cards cheaper
  - Leave as is
- **Default:** +1 Lumber every 2 rounds (core rules change)
- **Outcome:** You chose no free Lumber income (it inflates Lumber costs). Instead, cards that give Lumber or draws (Beaver Lumberjack: +2 Lumber; Courier Pigeon: draw 1), plus a day/night cycle and field cards to make rounds vary. The experimental trickle setting was removed. See fields-and-day-night-2026-10-09.md.

**B5. Rarity pass and stat fixes from the balance report** · Decide · Balance · asked 2026-10-09 · decided 2026-10-09
- card-balance-2026-10-09.md: 199 of 288 cards have no rarity; giving each one the rarity its measured strength suggests would also fix the enemy deck Lv badge (B3). 64 rated cards are outside their rarity's band, each with a one-stat fix (e.g. Chipmunk Cavalry 4→3 Attack, Raccoon Nightcrew 5→8 Attack). Many free cards measure as Legendary-strong: make them rarer, or weaker.
  - Rarity pass, then stat fixes
  - Rarity pass only
  - Stat fixes only
  - Leave as is
- **Default:** Rarity pass, then stat fixes
- **Outcome:** Taken as default on 'continue' (revertible): the 199 unrated cards got a rarity from measured strength, capped at Rare for now (114 Common, 11 Uncommon, 74 Rare), and 39 extreme outliers moved half-way toward their suggested stat (e.g. Feral Tomcat 3/5 → 3/3, Honey Badger Fury 5 → 3 Attack, Raccoon Nightcrew 5 → 7 Attack). Cards in band: 124 → 162 of 288. Walls, 3+ cost cards (B4) and the Wandering Traveller were left alone.

**B7. The Forge stays shut until Map 11: no levels before it** · Decide · Balance · asked 2026-10-19 · decided 2026-10-19
- Should the reference player have Forge levels before Map 11, now that the Forge curve follows the budget (package BF: N(L) = (Base - 1 + L) x (1 + L/20), majors 4, 7, 10, minor 2)? Before Map 11 every card plays at the level it starts at (Base cards Lv 0, rewards Lv 1).
  - Keep the Forge at Map 11: Lv 0 before it
  - Open it earlier and give the reference player levels on Maps 1-10
- **Default:** Keep it at Map 11
- **Outcome:** Owner 09:52: "No Forge is fine. The player has to deck build to win." The Forge stays at Map 11 (ROAD_LEVEL_CURVE.playerForgeMap 11); before it referencePlayerLevel is Lv 0, so Maps 0-10 are won by deck building alone. From Map 11 the reference player is Lv 3, then a little more a map from Map 16, as before; the road's enemy keeps pace with the new curve (ROAD_LEVEL_CURVE.enemyKeepsPace). docs/balance/level-curve-2026-10-19b.md; tests/level-curve-2026-10-19.js.

**B8. The stat budget is v5: (Base + L/5)(1 + L/30), Level 0 Base - 1** · Decide · Balance · asked 2026-10-19 · decided 2026-10-19
- Budget v4 ((Base - 1 + L)(1 + L/20), 09:52) made the Forge curve far too strong (the mean card +228% by Lv 10). Which formula replaces it, and does its linear Level term favour weak cards?
  - v5 with L/3, the owner's example (Base 14: 14.8 at Lv 1, 23.1 at Lv 10)
  - v5 with L/4
  - v5 with L/5
- **Default:** v5, L/3 unless it favours weak cards too much
- **Outcome:** Owner 13:52: "Oh shit to the balance. That's too much. ... maybe instead: (Base + L/3) * (1 + L/30) ... Level 0 gives an additional minus 1." 13:54: "if you think it favours weak cards too much (low rarity, wait, or resource count), then change it to L/4 or L/5." Measured (docs/balance/level-curve-2026-10-19c.md): weak cards' Lv 10 stat growth is 1.82x the strong cards' with L/3, 1.74x with L/4, 1.65x with L/5 (Rare+ with 3+ Wait and 3+ Lumber; 1.46 / 1.40 / 1.31 against Rare+ with 3+ Wait or Lumber). None meets the 1.3x rule, so the budget uses L/5, the closest (levelLinDiv in bramblewood-budget.js and canonical/skill-costs.json). Most of the gap comes from the absolute conversion, not the divisor. Budget v5: N = (Base + L/5) x (1 + L/30) for Level 1 and up, Base - 1 at Level 0; Base = 20 + Rarity + 6W + 0.5W^2 + 4 Lumber + 0.4 Lumber^2 + Ritual points. The Forge curve keeps majors 4/7/10, minor 2 and the limit break 11 on v5's gain: the mean card is +6% at Lv 2, +27% at Lv 4 and +96% at Lv 10.

**B9. Limit break comes in waves; older cards get a bigger step** · Decide · Balance · asked 2026-10-19 · decided 2026-10-19
- How should limit breaks (Lv 11 and later caps) treat old cards as the road grows?
  - One rule for every card
  - Waves of balance: older cards (earlier maps / older sets) get a bigger limit-break step than newer ones
- **Default:** Waves
- **Outcome:** Owner 15:25: "There will be waves of balance during limit break. (Older cards get a bigger step than newer cards.)" Limit break comes in waves of balance; older cards (earlier maps / older sets) get a bigger limit-break step than newer ones. Design only, nothing built: docs/balance/limit-break-waves.md proposes a step x (1 + (W - Map) / 20) with W the newest wave's last map and Map the card's obtain map (the budget's map term), and one more cap level per 10-map wave for cards 10+ maps older than the wave.

**B10. Printed card = obtained card; enemy strength comes from levels, decks / synergy and fields, not altered stats** · Decide · Balance · asked 2026-10-19 · decided 2026-10-19
- Can an enemy's copy of a card fight with stats other than the card as printed (plus its level), to make a fight harder? (The Caldera Wyrm is 6/36 at 0 Lumber, over its budget as printed.)
  - Printed = obtained: enemies only get levels, better decks and fields
  - Allow per-fight stat changes on enemy copies
- **Default:** Printed = obtained
- **Outcome:** Owner 16:22: "the cards as seen should be the cards when you get them. no change. The Wyrm is only stronger cause the field effect gives it fiery skills." Printed card = obtained card; enemy strength comes from levels, decks / synergy and fields, not altered stats. The Caldera Wyrm stays as printed. On the road the enemy's levels follow the owner's schedule (Maps 1-4 Lv 1, 5-9 Lv 1-2, 10+ Lv 2 and rising) and rarity above Rare is allowed from Map 10; no new Shield overrides and no field buffs for difficulty ("Let them be strong full stop for now. In the future we will make them challenging by cheating."). Still altering enemy stats outside level and fields, flagged and left as they are: the endless dungeons' floorPct perk (+x% stats a floor, set to 0 since LV, the mechanism remains), the raid's staged decks (cards scaled by the raid's attack / health factors) and its boss units (+1 Attack, Health x1.5-3, the Health bonus): raid boss mechanics, unchanged. Shield overrides above the rule are bramble, not card, changes: counted and measured in docs/balance/level-curve-2026-10-19c.md as an owner call.

**B11. Halve the skills' fixed numbers too (BF5 halved N and the cards, not the skills)** · Decide · Balance · asked 2026-10-21 · decided 2026-10-21
- Package BF5 halved N, every card's stats and the brambles; skill costs (S) and the skills' own numbers stayed (owner: halve the total N). A live card is now a median 2/5, against Meteor 20, Fireball 15, Trap 6, Pounce up to 6, Sweep up to 5 and Armor up to 5 on 47 cards. 16 cards' skills no longer fit the halved N at all (Worker Ant, Ravenous Wolverine, Grass Viper, Bramblewood Macaque, the half-miss flyers ...), and the Tomcat's Quick (S 7.55) leaves it 1/1. In the raid the decks now break the halved bramble about half the time. List: docs/balance/halve-2026-10-19.md (Owner calls; Skill numbers that now look big).
  - Halve the fixed amounts (damage, Poison, Thorns, Trap, Pounce, Sweep, On Ready damage, Meteor 20 -> 10, Fireball 15 -> 8; at least 1), cap or halve Armor, then re-measure the skill worth and re-derive
  - Keep the skills as they are; fix the 16 cards one by one (a skill, its cost, or the card's Wait / Lumber)
- **Default:** Halve the fixed amounts, then re-measure
- **Outcome:** Owner (BF6): "a blanket halve might not balance it appropriately. I assume the N value takes into account the Map value." No blanket halving. Then 15:09: N is the halved coefficients (Base = 10 + Rarity + 3W + 0.25W² + 2L + 0.2L² + 0.5 Ritual + 0.1 Map, N = (Base + L/15)(1 + L/30), Level 0 Base − 1); 15:22: simulate only the skills with no measured worth (165 halved-world runs, 19 values moved), then every card re-fitted by formula. docs/balance/bf6-2026-10-21.md.

**B12. The raid's brambles after the halving: keep 350 (175 in the fight) or raise to 410 (205)** · Decide · Balance · asked 2026-10-21 · decided 2026-10-21
- Completion is unchanged by BF5 (100% for 30-250 participants, day 6.53 with 30; MX 6.57), but every reference deck now breaks the arms' and tail's halved bramble in about half its fights (a normal deck broke it 4% of the time before), and the four decks deal nearly the same. A stored 410 (205 in the fight, under RB2's 'less than 420') brings the breaks to 30-39%; completion stays 100% for 30+. docs/balance/halve-2026-10-19.md (The raid, re-measured).
  - Keep 350 (175 in the fight)
  - Raise the arms' and tail's bramble to 410 (205 in the fight)
  - Decide after B11 (halving the skills' numbers changes it again)
- **Default:** Decide after B11
- **Outcome:** Owner (BF6): "Okay whichever." The arms' and tail's stored bramble is 410 in canonical/raids.json (205 in the fight); BF5's probe: breaks 30-39%, completion 100% for 30+. Not re-run (no raid simulations in BF6).

**B13. Clear the owner's folded live edits on the server (10-19 / 10-20)** · Apply · Balance · asked 2026-10-21
- The 13 card edits, the Map 0 / Hedgerow / Shallows node edits, the tutorial and the Goliath's shards are folded into the files (BF5) and halved there. Until the rows are cleared, the server's full-size values (the Tomcat 4/11, the Ant Hill 0/50 ...) override the halved file in the live game. Prepared, not applied: supabase/proposed/20261021_clear_folded_overrides_2.sql (keeps a backup table).
  - Apply it with the BF5 release
  - Hold
- **Default:** Apply it with the BF5 release

**B14. Cap 2 (A·H + S·|S|) leaves 84 cards at 1/1 with their skills** · Decide · Balance · asked 2026-10-21 · decided 2026-10-21
- Under the owner's cap 2 (15:15) a Common's (N/3)² is about 16, so a skill set worth S 4 or more leaves no A·H at all (Quick alone 7.55 -> 57). BF6's formula pass put 176 cards in the bucket and squeezed 11 more under the band; 100 took one skill off without thematic loss, 84 keep their skills at the floor of their shape (1/1) and are flagged (Jaguar Stalker, Savanna Cheetah, Tomcat, Poison Dart Frog, Barnacle Fortress, Worker Ant, Courier Pigeon ...). Most skills' worths are the 10-19 full-size measures (the owner's method skipped them). List: docs/balance/bf6-2026-10-21.md (Cards that still can't fit).
  - Accept: the flagged cards stay 1/1 until their skills are reworked
  - Soften cap 2 (e.g. S·|S|/2, or S² only above a share of N), then re-fit
  - Re-measure the big skills in the halved world first (Quick, Sweep, Armor, Pounce, Poison, Thorns ...; about 2.5 h of runs, a quarter done in docs/balance/skill-worth-bf6-partial.jsonl), then re-fit
- **Default:** Re-measure the big skills in the halved world first
- **Outcome:** Owner 16:42: "Dont need the skill term being weighted down. Listen, it's because Base and N are reduced. So S and A and H all now, unchanged, play a bigger part by default. Halving S or A or H would change nothing actually, cause now you can have more attack and health for the same N. We want numbers to be smaller." Cap 2 stays A·H + S·|S| ≤ (N/3)²; the flagged cards keep their floor stats on purpose. No other change.

**CX1. Nocturnal "at night ONLY": Twilight too?** · Decide · Rules · asked 2026-10-21 · decided 2026-10-21
- Package CX2 checked the engine: plain Nocturnal is +1 Attack at night and nothing else, as asked. Two things add to it today: Twilight counts as both day and night (your 2026-10-13 rule), so Nocturnal and Diurnal also apply in Twilight; and the Leylines I map rule turns the plain +1 into +3/+3. Both were left as they are.
  - Keep: Twilight counts as night, Leylines I still boosts
  - Nocturnal at night only, not in Twilight (Diurnal likewise by day only)
  - Also drop Leylines I's boost for the plain forms
- **Default:** Keep: Twilight counts as night, Leylines I still boosts
- **Outcome:** Owner 18:23 ("Seems okay"): the default. Twilight still counts as night (and day), and Leylines I still turns the plain +1 into +3/+3. No change.

**CX2. Plain Crepuscular is much stronger now; its S is still 1** · Decide · Balance · asked 2026-10-21 · decided 2026-10-21
- Crepuscular went from +1 Attack in Twilight only to +1 Attack by day and +1 at night (both in Twilight, and a deck with one still adds the Twilight phase). Its cost in canonical/skill-costs.json is still 1 (measured 3.72 when it was Twilight-only). Nightjar Drifter 3/6 and Woodcock Lookout 3/8 were not re-fitted (no braces).
  - Price plain Crepuscular like its braces: 0.4 × (2 + 2) = 1.6 for +1/+0, then re-fit the two cards
  - Re-measure it with tools/skill_worth.js
  - Keep 1
- **Default:** Price plain Crepuscular like its braces (1.6), re-fit the two cards
- **Outcome:** Owner 18:23: the default, built by package TR. Plain Crepuscular costs 1.6 (0.4 x (2 + 2)); Nightjar Drifter 3/6 -> 2/8 and Woodcock Lookout 3/8 -> 2/9 by formula (--only).

**CX3. Half-miss skills inside braces cost 0** · Decide · Balance · asked 2026-10-21 · decided 2026-10-21
- Evasive, Flying, Shadow, Swift and Blind cost 0 in the table because the ×1.5 rule on the whole card prices them. Inside braces (Tide {+2/+2, Evasive}) that rule does not reach them, so 0.4 × their table value is 0. Mudflat Godwit's Flood {+2/+2, Evasive} counts only its +2/+2.
  - Count a half-miss skill in braces as 0.5 × the card's 2A + H, then × 0.4
  - Keep 0
- **Default:** Count it as 0.5 × the card's 2A + H, × 0.4
- **Outcome:** Owner 18:23 (titles-transforms spec): keep as is. Half-miss skills inside braces cost 0. No change.

**CX4. Rarity flags: one at a time?** · Decide · Editor · asked 2026-10-21 · decided 2026-10-21
- The editor's four toggles (Quest, Event, Dev, Special) are exclusive: turning one on turns the others off, so every card is a rank plus at most one flag and keeps a single stored string (quest, devlegendary, or a derived one like questrare). Two flags at once (an Event card that is also Dev) would need a longer string or a separate field.
  - Keep one flag at a time
  - Allow several flags (a separate rarityFlags field on the card)
- **Default:** Keep one flag at a time
- **Outcome:** Owner 18:23: the default. The editor's rarity toggles stay one at a time. No change.

**CX5. The card editor's budget panel uses the old skill costs** · Decide · Editor · asked 2026-10-21 · decided 2026-10-21
- The editor's budget line (and the Test Lab's Stat budget) still sums S with the 2026-10-17 in-page table (SB_DEFAULT_SKILLS: Regen = its number, Evasive 0), not canonical/skill-costs.json, which tools/skill_costs.js, the re-fits and the hub use. Package CX2 gave both the same 0.4 context rule, but their inner costs differ: Kinkajou Lurker's Nocturnal {Evasive, Regen 2} is 0.8 in the editor and 2.48 in the canonical table.
  - Make the editor read canonical/skill-costs.json (built into the page)
  - Keep the in-page table
- **Default:** Make the editor read canonical/skill-costs.json
- **Outcome:** Built (package CX5): the editor's budget panel and the Test Lab price S from canonical/skill-costs.json (built into the page) with tools/skill_costs.js itself; the in-page table only prices a skill the table lacks, and the panel says so.

**B15. Twin: no constant prices a full copy of the card** · Decide · Balance · asked 2026-10-21 · decided 2026-10-21
- Twin puts a full copy of the card beside it. Measured in the halved world it is off the scale (S 20+ a copy on a 2/7, 36 on a 3/11), so its cost (1) means nothing. Its two cards are held at their stats: Puddle Changeling 2/2, Mirrorhide Mutant 3/5.
  - Price Twin as the card's own body (S = 2A + H, so its stats halve), then re-fit the two
  - Make the twin a smaller token (e.g. half stats)
  - Keep both as they are
- **Default:** Price Twin as the card's own body
- **Outcome:** Owner 16:33: "B15: Only a theoretical pricing is possible since this depends on the skill of the player. I would say creating a copy of a random ally card — probably 20+. Becoming a copy of a random ally card probably 5+. I think for mirrorhide mutant, they should copy the skills of the card, but their stats = the highest stat of both cards. E.g. 2/3 copying a 4/2 => 4/3." Built (package MT): Twin is priced 20 (owner-set); Mirrorhide Mutant has the new Mimic (5, owner-set) instead of Twin; both re-fitted by formula: Puddle Changeling 1/1 (Twin overflows a Common's N; floor, skills kept), Mirrorhide Mutant 2/11.

**FOG1. Fog of War is information only: the CPU still sees your whole board** · Decide · Battle UI · asked 2026-10-21 · decided 2026-10-23
- Package FOG hides the far enemy columns from the player's view only. Combat, targeting and the CPU play exactly as before, and the enemy's view of your units is not fogged. Raids, Pass & Play and the Collapse rows are left out.
  - Keep it as a view-only rule
  - Also make the CPU unable to target units it cannot reach (an engine change)
- **Default:** Keep it as a view-only rule
- **Outcome:** Owner (10-23 00:10): "Both sides" Not the view-only default: fog applies to both sides, so the CPU also cannot target what it cannot reach (the engine change). To build in package EN. Built (EN): with Fog of War on, the CPU plays through the fog from its side (its reach, its revealers): where it plays, what it plays and what its hazards and fields are worth read only your units it can see. The rules themselves (swings, arrows, skills) still reach fogged units on both sides, the player's too (call EN-8).

**FOG2. Fog reach is the unit's column and the ones beside it; revealers add only permanence** · Decide · Battle UI · asked 2026-10-21 · decided 2026-10-23
- Reach follows your Parasite note (a live unit in the column or beside it; the centre is always open, as for placement). Illuminate has no radius, so Darksight, Keen Eye and Illuminate cover the same three columns, but what they cover stays revealed for the rest of the fight.
  - Keep: same reach, revealers make it permanent
  - Give revealers a wider reach (2 columns each side)
- **Default:** Keep: same reach, revealers make it permanent
- **Outcome:** Owner (10-23 00:10): "OKAY" Keep the reach; revealers make it permanent (the default).

**FOG3. Fog of War uses the Mist scene as its card art for now** · Decide · Battle UI · asked 2026-10-21 · decided 2026-10-23
- The Environment card borrows art/fields/misty.png. A new scene needs generating under the art workflow.
  - Generate a Fog of War scene
  - Keep the Mist scene
- **Default:** Keep the Mist scene
- **Outcome:** Owner (10-23 00:10): "OKAY" Keep the Mist scene (the default).

**TU2-1. Which daily dungeons are hidden for now** · Decide · Dungeons · asked 2026-10-23 · decided 2026-10-23
- Your answer to AR-2: "hide both daily dungeons require future balancing anyway. We havent even decided what special thing they give." There are three ticketed daily dungeons: Murgle Mayhem (Map 6), the Undercroft (Map 11) and the Long Burrow (Map 22, released 10-18). Package TU2 hid all three from players (one switch, DAILY_DUNGEONS_HIDDEN: no entrance on their map, no World map stop, no Dungeons tab, no 🗝️ key button); Admin Mode still opens them, and saves keep their climbs and keys. The backlog row (decide what they give, rebalance) is in docs/action-items.md.
  - Hide all three (as built)
  - Hide the Undercroft and Murgle Mayhem; keep the Long Burrow open
  - Hide only the Undercroft
- **Default:** Hide all three (as built)
- **Outcome:** Claude's call (10-23, owner asked to settle the easy ones): Hide all three daily dungeons (as built), because his reason (they need balancing and a decided reward) applies to the Long Burrow too.

**TU2-2. How faction cards start at Level 0** · Decide · Economy · asked 2026-10-23 · decided 2026-10-23
- N1: "Faction cards also start at level 0." They started at Level 1 (cardBaseLevel; their printed stats are their Level 1 stats, as the budget prices them). Package TU2 made a new copy of a faction card a Level 0 copy, as the tutorial's copies already are: about 85% of its printed stats until a nest trains it to Level 1 with Kibble, and it shows in the Nest's 🌱 Level 0 tab. A card you already raised keeps its level; copies owned before today are unchanged. The other way would make Level 0 the printed stats for every faction card (and every Level above one step stronger than today), which moves all 41 faction cards' balance.
  - New copies come at Level 0, trained in the Nest (as built)
  - Faction cards' printed stats become Level 0 (rebalance all 41)
  - Back to Level 1
- **Default:** New copies come at Level 0, trained in the Nest (as built)
- **Outcome:** Claude's call (10-23, owner asked to settle the easy ones): New copies come at Level 0, trained in the Nest (as built), kept as built (new faction copies come at Level 0 and train in the Nest).

**TU2-4. The Worker Ant's Promotion in the Forge is hidden** · Decide · Economy · asked 2026-10-23 · decided 2026-10-23
- E10: "Combining or converting cards to different cards is a concept we havent explored. HOWEVER, please prepare this tab ... it will be its own feature page!" The Forge did have a working Promotion: the Worker Ant (promotesTo, at Level 3, for 300 Maple Leaves + 100 Magic Dust) could become an Ant Warrior or one of two other ants. Package TU2 replaced that panel with a pointer to the new Promotion page, which says "Coming soon" and has no controls; the code and the card data stay (PROMOTION_PAGE_LIVE).
  - Keep it hidden until the Promotion page is designed (as built)
  - Bring the Worker Ant's Promotion back on the new page as it was
- **Default:** Keep it hidden until the Promotion page is designed (as built)
- **Outcome:** Claude's call (10-23, owner asked to settle the easy ones): Keep it hidden until the Promotion page is designed (as built), kept as built (the Worker Ant's Promotion stays hidden until the Promotion page is designed).

**TU2-5. The Highcrest Case without its 3 Krooni** · Decide · Economy · asked 2026-10-23 · decided 2026-10-23
- E9: "Retire Krooni for now." Players no longer see or earn Krooni: the Highcrest Case (250 Maple Leaves + 30 Gold Leaves) no longer pays its 3 Krooni and its shop line no longer mentions them; the wallet hides them. Saved balances are untouched and Admin Mode still shows them. Nothing replaces the 3 Krooni in the case.
  - Nothing in their place (as built)
  - Lower the case's price a little
  - Something else in the case
- **Default:** Nothing in their place (as built)
- **Outcome:** Claude's call (10-23, owner asked to settle the easy ones): Nothing in their place (as built), kept as built (nothing replaces the Highcrest Case's 3 Krooni).

**RW3-1. Which fights get which shield bonus on the card drop** · Decide · Rewards · asked 2026-10-23 · decided 2026-10-23
- Built: elite, champion, miniboss and dungeon +1%; sub-boss +2%; boss +3%; world boss, raid boss, megaraid and final boss +4% (the owner's 1/2/3/4% read as the four steps above a skirmish). So skirmish 1%, elite 3%, sub-boss 5%, boss 6%, world / raid boss 8%, megaraid / final boss 9%.
  - As built
  - Bosses +4% too (boss 7%)
  - Only elite +1 / boss +2 / world +3 / final +4, nothing for sub-bosses
- **Default:** As built
- **Outcome:** Claude's call (10-23, owner asked to settle the easy ones): As built, kept as built (the shield bonuses: elite +1, sub-boss +2, boss +3, world / final +4).

**RW3-3. Packs: no new-card guarantee, faction packs keep their track** · Decide · Rewards · asked 2026-10-23 · decided 2026-10-23
- "Packs outputs can never be changed by anything" also turned off the new-card guarantee (the Tidemire Chest and the Highcrest Case promised one card you don't own) and the 10-12 weight that made a recently pulled card less likely. A faction pack's two faction cards still follow the faction reward track (RP: Commons first, then Uncommons...), which reads your collection; its general card is fully random.
  - As built
  - Keep the new-card guarantee
  - Faction packs fully random too
- **Default:** As built
- **Outcome:** Claude's call (10-23, owner asked to settle the easy ones): As built (no new-card guarantee; faction packs keep their track), because he said pack output can never be changed and the track only orders the faction cards.

**RW3-4. Pack foil chances** · Decide · Cards · asked 2026-10-23 · decided 2026-10-23
- Built: 1% a card (Hedgerow Pouch), 1.5% (Tidemire Chest), 2% (Highcrest Case, Mystery Booster), faction packs 1%; the Highcrest Case's guaranteed foil is off; Advanced packs keep 10x on their first five cards (10 / 15 / 20%). Was 4 / 8 / 12 / 10 / 4% plus the guarantee.
  - As built
  - Lower still (0.5 / 1 / 1.5%)
  - Keep the Highcrest guarantee
- **Default:** As built
- **Outcome:** Claude's call (10-23, owner asked to settle the easy ones): As built, kept as built (pack foils at 1 / 1.5 / 2%, as he asked ("should be rare")).

**RW3-5. The Shop's Raid Ticket restock** · Decide · Raid · asked 2026-10-23 · decided 2026-10-23
- Built: each local day the cart has a Raid Ticket at 25% (about 1.75 days a week), one in stock; buying it sells it out until another day rolls one. The day's roll is the same for every player that day.
  - As built (25% a day)
  - 15% a day (about 1 a week)
  - A roll per player
- **Default:** As built (25% a day)
- **Outcome:** Claude's call (10-23, owner asked to settle the easy ones): As built (25% a day), kept as built (the Raid Ticket restock at 25% a day).

**RW3-6. Disenchant past Divine** · Decide · Economy · asked 2026-10-23 · decided 2026-10-23
- The owner's list ends at Divine 2,000 "+ etc.". Built: x1.5 a step, Void 3,000 and Daemonic 4,500.
  - As built
  - x2 a step (4,000 / 8,000)
- **Default:** As built
- **Outcome:** Claude's call (10-23, owner asked to settle the easy ones): As built, kept as built (x1.5 a step past Divine: Void 3,000, Daemonic 4,500).

**RW3-7. Per-copy Forge levels: where the duplicate credit sits** · Decide · Forge · asked 2026-10-23 · decided 2026-10-23
- Levels are per copy again (item 25). The duplicate credit (fed spares) stays on the card, as FG had it, and pays for whichever copy you temper; NF (10-18) had it on one copy. A save keeps every level (each copy keeps the shared level it had; only the best copy counts as paid for, so melting refunds the levels once).
  - As built (credit on the card)
  - Credit on the copy it was fed to
- **Default:** As built (credit on the card)
- **Outcome:** Claude's call (10-23, owner asked to settle the easy ones): As built (credit on the card), kept as built (the duplicate credit sits on the card).

**RW3-8. Skirmish exclusives: the 12 cards that left the packs** · Decide · Rewards · asked 2026-10-23 · decided 2026-10-23
- Built (GD2-3): 2 exclusives on each map that had none and has 4+ skirmishes, 1 on Maps 4 and 21; the cards are the ones those skirmishes already paid as first-clear pack cards or that fight in them, the higher rarity first: caustic-scorpion (Uncommon, also in the Tutorial's T-2 deck), eagle-owl-quartermaster and ash-cloud-condor (Rares) are among them. DV2's count rule (3 / 2 / 1 rewards per map by its new cards) is now exceeded on those maps (tools/map_divvy_2026_10_22.js check allows it, RW3_EXTRA_REWARDS).
  - As built
  - Only 1 per map
  - Swap a card (name it)
- **Default:** As built
- **Outcome:** Claude's call (10-23, owner asked to settle the easy ones): As built, kept as built (the skirmish exclusives as built).

**RW3-9. T-1's first-clear card** · Decide · Tutorial · asked 2026-10-23 · decided 2026-10-23
- The Quarry Mole left T-1 (it is 8-1's now). T-1 pays no card until one is picked in the Tutorial editor (or keep it so). The live tutorial config still lists the mole; the game skips it, and supabase/proposed/20261023_rw3_tutorial_reward.sql clears it (waits for "apply it").
  - No card on T-1
  - A plain Common (name it)
  - The Rabbit Kit (D46)
- **Default:** No card on T-1
- **Outcome:** Owner (10-23 06:59): "Apply it". Applied supabase/proposed/20261023_rw3_tutorial_reward.sql on the live database: __cfg:tutorial cfg.rewards ["quarry-mole"] → [] (row updated 2026-10-22 23:00 UTC). T-1 pays no card until one is picked in the Tutorial editor.

**RW3-10. Easter eggs in Mystery Boosters: how rare** · Decide · Codex · asked 2026-10-23 · decided 2026-10-23
- Built: 0.05% a card (1 in 2,000 cards, about 1 in 670 Mystery Boosters of 3), any of the nine Easter eggs.
  - As built (0.05%)
  - 0.01%
  - 0.1%
- **Default:** As built (0.05%)
- **Outcome:** Claude's call (10-23, owner asked to settle the easy ones): As built (0.05%), kept as built (Easter eggs at 0.05% a card, as he asked ("supremely low")).

**RW3-11. The Nurse: mastery-based speed or a flat 25%** · Decide · Economy · asked 2026-10-23 · decided 2026-10-23
- Already built (10-15): 2.5% faster per Nursing mastery point, at most 50%. A typical Unique nurse is about 20-25%. The owner said "eggs hatch faster" with no number.
  - Keep the mastery scale
  - A flat 25%
- **Default:** Keep the mastery scale
- **Outcome:** Claude's call (10-23, owner asked to settle the easy ones): Keep the mastery scale, kept as built (the Nurse keeps the mastery scale).

## Stated rules · 2026-10-21

The owner's directions (Oct 21) on rewards, sources, the road's eras and its bosses, recorded by package RP (docs/balance/rewards-pass-2026-10-21.md, docs/map-recommendations-2026-10-21.md). Pinned by `tests/rewards-pass-2026-10-21.js`.

- **Skirmish rewards are never pack cards; faction rewards are their own category** ("Be strict on what is a Skirmish reward (these CANNOT be pack rewards) and which are faction rewards"): every card is exactly one of a skirmish reward (source map), a pack card, a faction reward (the Factions pool, tier 11, in no pack), or a raid / smith / nest / base / quest / secret / Easter egg / materia card, or awaitingSource.
- **Most Otters and Hummingbirds are faction rewards, given with skirmish progress and some achievements**: a main map's last fight, every 8th first clear, Map 0's 0-2 faction pack, the 3-2 ambush and the listed achievements hand them out (FACTION_REWARD_TRACK).
- **Faction rewards give the lowest rarity first, until a critical mass of faction cards received (duplicates count)**: Uncommon after 25, Rare after 15 more and not before Map 14, Very Rare after 10 more and much later (Map 25 proposed); the later steps (Super Rare 60 / Map 30, Epic 70 / 35, Heroic 80 / 40, Unique+ 90 / 50) are proposals. The thresholds are constants (FACTION_RARITY_GATES).
- **Only plain cards (no skills) as rewards at the start** (Maps 0-1), with **Lumber introduced on Map 1** by one Lumber card (the Badger Lumberjack on 1-4).
- **Devilry is found on Map 66, Ecclesia on Map 77, Evomax from Map 30**: no card of those lines is obtainable before (they wait as awaitingSource).
- **The eras: 20-40 is stronger, more advanced versions of the 0-20 animals, and maybe some extinct animals that resemble today's; 40+ has legit dinosaurs; 50+ is magic.**
- **Submaps: one unique card each, the rest built from cards the player already has, and unlocked quite late** (Smugglers' Grotto after Map 7; every side map off Maps 0-19 opens at least four maps after its parent, its fights counting as that map).
- **Skill introduction is gentle and strict: two new skills a map at most; Maps 21-40 are about using the skills already learnt** (new skills again past Map 40).
- **5 world bosses and 1 super world boss for Maps 0-100.**
- **Bosses from Map 5 onwards, so at least 95 bosses and 100+ elites, not counting the submaps.**
- **Limit break always balances a card to the next series's standard.**
- **Map x 0.2 in N gives importance to new cards balanced in the late game** (the stat budget's map term; package BF5 builds it, with vanilla cards x1.05).

## Stated rules · 2026-10-18

The owner's notes (23:05) on a far-future map and the Legendary ability tier. Pinned by `tests/legendary-2026-10-19.js`.

- **Shadow of the Valley of Death is a very far future map.** It is not on the road yet and nothing is planned for it now. The Pall Wraith (`pall-wraith`, Cast Darkness + Darksight) lives in the Eye of the Volcano (20-A, the 20-A-2 Wraith Vents deck and card reward) until that map exists.
- **Legendary abilities are a tier of their own.** A skill or passive marked `legendary: true` (PASSIVE_DEFS / SKILL_DEFS in `arena_app.js`, and `canonical/skill-costs.json`) shows a gold Legendary tag on the card's line, in the Skills Codex and in the card's glossary: "A legendary power. Rarely found on cards you can own — dragons are the exception." They are typically not given to cards players can get, except dragons. Legendary now: True Strike ("White Dragon's True Strike is legendary in itself"), Supreme and Supreme Tide.
- **True Strike is affected by Legendary dodges.** It still ignores every plain miss or dodge: Darkness, Blind, Sun-shy, Night-blind, Evasive, Swift, Flying, Prey, Tide-evade, canopy, Smoke, Fog, Sandstorm, Ashy, Slippery, Shadow and Illusory. A Legendary dodge still rolls against it as against anyone. It still can't hit Invisible.
- **Illusory is not Legendary** ("the illusory dodge is a token thing anyway, so it's not particularly legendary"). No dodge is Legendary yet. The engine hook is ready: a dodge source is Legendary when its reason is in `LEGENDARY_DODGES` or the defender's effect value carries `legendary: true` (e.g. `evasive: {legendary: true}`, `illusory: {chance: 0.5, legendary: true}`) (`legendaryDodge` in `bramblewood-engine.js`).

## Stated rules · 2026-10-19

The owner's answers (20:31) to the design review's questions on triggers, now rules of the engine (`bramblewood-engine.js`). Pinned by `tests/trigger-layers-2026-10-19.js`.

- **Trigger chains stop at 5 layers (layers, not count).** The original event's triggers are layer 1. A trigger that goes off while another trigger is resolving is one layer deeper. Layers 1 to 5 resolve; a 6th-layer trigger does not fire (`TRIGGER_LAYER_CAP = 5`). Any number of triggers at the same layer (siblings) all resolve.
- **A death sweep counts in layers too.** The deaths settled in a sweep's first pass fire layer-1 triggers (counted from where the sweep starts: a sweep opened inside a layer-2 trigger starts at layer 3). The deaths those triggers cause settle in the next pass, one layer deeper. The sweep's 6-pass limit is the cap plus one: the 6th pass clears the bodies and fires no triggers.
- **A unit killed during a death sweep dies in the next pass** (Claude's fix, 2026-10-19). A unit killed by a death effect (Nova, Landslide, an On Death or On Ally Die trigger) dies properly, with its own death effects, graveyard and Darkness. It used to vanish with no death at all.
- **Tokens fire death triggers.** A token's own On Death fires, and its allies fire On Ally Die for it, like any unit.
- **Evasive covers both.** It dodges half of single-target attacks and skills.
- **Simultaneous triggers resolve in board order:** the first player's units, then the second player's, lane by lane (left, centre, right).
- **Units dying in the same sweep don't see each other's On Ally Die.** Units that die in the same pass of a sweep are all gone together: only units still alive in that pass fire it.
- **Summoned and token units fire On Ally Spawn, not On Ally Played.** A unit an effect puts on the board (a token, a summon, a split, a hatch) is spawned. On Ally Played is for a card played from hand (leaders included).
- **A unit's own death is not an ally death.** It fires its own On Death, never its own On Ally Die.
- **0 healing fires no heal trigger.** Healing a unit already at full Health fires no On Heal, On Healed or On Ally Healed.

## Stated rules · 2026-10-19

The owner's rules (23:32) on Freeze and Confuse, now rules of the engine (`bramblewood-engine.js`, package FZ). Pinned by `tests/fz-2026-10-19.js`.

- **A unit frozen before its turn arrives fails to take its action.** Frozen earlier in the round (an earlier unit's Freeze or Ice Arrow), it skips its place in that round's order: no swing, no shot, no On Attack, no on-hit skill. That freeze is then spent: it melts at this round's end, so Freeze N costs N actions (Claude's reading, 2026-10-19: it used to swing anyway and then lose the next round).
- **Frozen after it acted** (a later hit that round, from the opponent's units) **it skips its next round**, then thaws, as before. Frozen before the round starts, it skips that round.
- **Confused: 1 in 2 that each of its triggers, skills and actions fails to activate.** Every trigger, every on-hit chance skill, and every action (its swing, its shots, a reserve strike, a Counterattack, a Sentry or Ambush strike) rolls on its own; on a fail nothing happens and the log says "😵 X is confused and fumbles." The rolls use the match's seeded random, so sims and replays repeat.
- **Confuse's swing (Claude's choice, 2026-10-19):** Confuse had no other effect on the attack, so the attack counts as an action: a fumbled swing is no swing at all (no On Attack, no on-hit skills, no Bleed tick). A swing that goes off still rolls each of its on-hit chance skills, as before.

## Stated rules · 2026-10-18

The owner's notes (21:26) on emoji with cultural meaning.

- **Ward uses 🧿 Nazar.** When a Ward skill is made (e.g. Prayer Ward in docs/gameplay-ideas-2026-10-19.md, or a ward against Blind / curses), its icon is the nazar, or a white/yellow East Asian paper talisman (no emoji exists, so that would be a drawn icon).
- **🪬 Hamsa is never a generic effect icon.** It carries real cultural and religious meaning, so it appears only inside one animal society's own identity (its cards, banner or rites), never as an effect any unit can get. Which society is still open.

## Stated rules · 2026-10-19

The owner's note (00:07): "Healing & the like: if there's nothing to heal, it doesn't occur, and no animation plays." Now a rule of the engine (`bramblewood-engine.js`) and the board (`arena_app.js`). Pinned by `tests/hn-2026-10-19.js`.

- **A heal with nothing to heal doesn't happen.** Every heal-like effect (the Heal action, Regeneration, Bloom, Nursing, Healing N, Leech, Carrion, Banana, Cower (Flee), Spring Rain, the Herb Refinery, Herbalist's bonus, Rebuild and the Rebuild bramble action, the bramble's own regeneration, Cure) on a unit already at full Health (a bramble at full Health) heals nothing and shows nothing: no heal event, no battle-log line, no floating "+0", no heal look or sound, and no beat in the replay. (A Cower (Flee) unit still backs off, only without a heal number; a Mend spell is still cast, without the green heal look when no one is hurt.)
- **0 healing fires no heal trigger** (kept from the trigger rules above): no On Heal, On Healed or On Ally Healed.
- **A Heal or Rebuild trigger with nothing to heal doesn't go off.** Its trigger rune isn't shown, and a "once" Heal trigger isn't used up (it waits for a real wound). One that paid a cost first (Burn 1 Lumber) did go off.
- **Bleed counts as something to heal** (Claude's choice, the recommended one). A heal on a full-Health unit that Bleeds happens: it stanches the Bleed (the Bleed-removal look only, 🩹 -N 🩸), with no green heal look, no "+0" and no heal triggers. Regeneration is the exception and keeps the owner's 2026-10-14 rule ("Do not regenerate when the unit is at full health"): at full Health it doesn't stanch either.
- **Old fights and replays too.** The board skips any 0-amount heal event that still turns up (a saved fight or replay from before this rule): no look, no sound, no beat, no log line (`emptyHealEvent` in `arena_app.js`).

## Stated rules · 2026-10-19

The owner's rules (00:19): "Revive is true death, but Rescue no." and "Quiet Contemplation on Map 21's boss: no 2x and re-enablement effects." Now rules of the engine (`bramblewood-engine.js`, package RV), replacing the earlier rule that a Revive death was no death (no death triggers, only the killer's On Kill). Pinned by `tests/rv-2026-10-19.js`.

- **Revive is a true death.** The first death, the one Revive answers, happens in full: the unit's On Death, its allies' On Ally Die (and Berserk, Divine Retribution, Hive Mind), the killer's On Kill and kill stat (Crown of Thorns, Midas Touch), Bounty, Darkness from the loss, the Ritual count, the deaths stat, Amore, Carrion, On Death: Spawn, Landslide, Nova, and the trip to the graveyard (or the Removal Zone). Then the unit returns: out of that zone, into its own slot, at 1 Health with every status cleared. Its second death is final (the Removal Zone), as before.
- **What would replace the body doesn't happen on a Revive death** (Claude's call): no Relic 1/1 (the unit itself comes back; its final death leaves the Relic), no Crystallise crystal, no Meiosis split. An On Death: Spawn token goes beside it, not into its slot. Its equipment stays on; its Prayer tokens are gone with the death.
- **Revive loops stop at the layer cap.** Revive is once per unit. The triggers a Revive death sets off are ordinary trigger layers of the death sweep, so a revive whose death kills another reviving unit, and so on, stops at layer 5 (`TRIGGER_LAYER_CAP`) like any chain. A Nullify kill still gets no Revive.
- **Rescue is not a death.** A unit moved or saved before it would die fires none of the above: no death event, no On Death, On Ally Die, On Kill, Bounty, Darkness, Ritual count or deaths stat, and its Revive stays unspent. Today that is Shield Call (the ally steps aside and a shield takes the skill) and Guardian (an adjacent protector takes the hit); no effect called Rescue exists yet.
- **Quiet Contemplation (the Cathedral Eagle's fight, 21-6): nothing happens twice.** Doubling, off: Headwind (a Flyer's triggers and skills twice), Twin Strike and Frenzy's second swing, Twin Shot's second arrow, Twin (the copy on arrival), Echoing Wood's copy, Crit, an Expose counter's crit (the counter is still used up), Rage's ×2, Mighty's ×2, Tall Grass's double Backstab / Pounce, Supreme Tide (plain Tide bonuses instead) and Double Time (1 play a turn, no second-player bonus for it). Re-enablement, off: every extra turn (Fast Forward N, the Tailwind spell's turn, a strong wind's Tailwind, a Swimmer's Quick Attack on a Flood) and Wildpath's Second Pitch. Both sides.
- **Quiet Contemplation leaves these alone** (Claude's reading; say if any should go): plain Wait cuts (Hasten, Reduce Wait), multi-target skills (Volley, Sweep, Fork, a trigger's N targets), the target's own weakness or Fragile (double damage taken), Boomerang's return (it is that round's attack), Banana / Durian snacks, a Charge's cycle, Rage's half damage taken, and Revive (once, and a true death).

## Stated rules · 2026-10-19

Package GI (owner 00:19: "continue with action items, and considering our gameplay-ideas ... After running through the ideas, create what you want to create"): the skills and field effects built from docs/gameplay-ideas-2026-10-19.md, now rules of the engine (`bramblewood-engine.js`, the Package GI block). Only POOL example cards carry them; no live card or map does yet. Details: docs/gameplay-ideas-built-2026-10-19.md. Pinned by `tests/gi-2026-10-19.js`.

- **A trigger can target the card it is about** (the owner's question 7 in gameplay-ideas-2026-10-19: yes, it targets the played card). A trigger's subject is the ally played (or the unit that died, was healed, got Ready or moved): `sub:'subject'` is that unit, `sub:'subjectFacing'` the unit facing it, and `filterKin` keeps only a subject that is the acting unit's Kin.
- **Kin Rally N** (On Ally Played (Kin): that ally +N/+N) and **Pack Howl N** (On Ally Played (Wolf): Bleed N on the enemy facing it) are ordinary On Ally Played triggers: off while the unit is Waiting, Stunned, Frozen or Asleep; Confused fumbles them; the 5-layer cap holds; a card played from hand only (a token is On Ally Spawn). A Changeling passes both filters. Nobody facing the Wolf: no Bleed.
- **Hunter N is one keyword with a status picker**: Poisoned (the default), Bleeding, Wet or Exposed; Shatter stays the Frozen case. Exposed is read before the hit uses up its counter. Hunter and **Executioner N** (strictly below half Health) add to hits and shots, never to a status tick or a bramble.
- **Detonate** (Claude's reading): its hit or shot deals the target's whole Poison as extra damage, 1 for 1, then that Poison is gone. Poison ticks at the round's start first, so it cashes in what the tick left.
- **Proliferate N**: from round 2, at each round's start, up to N Poisoned enemies (picked at random) each give 1 Poison to a random unit beside them. It spreads (the carrier keeps its own); poison-proof units never catch it. A passive, so it works while its unit is Waiting.
- **Brittle** (a status from Brittle N hits) counts as Frozen for Shatter only: the unit still acts and its Wait still ticks. It wears off like Webbed; Revive clears it, Cure doesn't (as Webbed).
- **Prayer Ward N**: Armor N while the unit holds Prayer tokens (the player's own offering tokens are not on the unit, so they don't count). Its icon is 🧿 Nazar (owner, 2026-10-18 21:26).
- **Field Breaker N** (Claude's scope): when it arrives, the field's round-start effects are skipped for the next N rounds, for both sides: every Field effects 2 and 3 tick (the hazards, the Leylines' gifts and burn, Haunted, Mirage, Wave, Consternation, and the three new fields), Swamp Fever, the Tide-spout and the volcano's eruptions, comets and lava. Day and night, the Tide, Darkness, wind, the always-on field rules (Sandstorm misses, Ashy, Slippery ...) and a played field card go on. Two breaks don't add up: the later end wins.
- **Spore Cloud** (for The Morel Hollow): from round 2, one random unit a side that isn't poison-proof falls Asleep for the round, as Sleep 1, so the Sleep cap (N+1) holds it at 2 at most; a hit wakes it.
- **Thunderstorm N** (2; for Coral Current): from round 2, lightning (shock) strikes one random unit a side for N; each Wet counter adds 1, shock Resist halves it.
- **Tangled Roots** (for the Kelp Mangroves): from round 2, one random unit a side that isn't Flying or a Structure is Webbed for the round.
- **Crab Trap is data, not a rule** (Claude's call): a Crab Claws card with Hunter 1 (Wet) (the pool card Tidepool Trapper Crab). Crab Claws itself is unchanged, so no live crab changed.
- **Skipped, each against a standing rule or the owner's earlier no**: Isolation (fights Lone Wolf), Rescue Chain and Death Spiral (loops), a generic Contagion (folded into Proliferate), and Hallowed Ground and Blood in the Water (left for the placement phase: small-engine but each one fight).

## Stated rules · 2026-10-19

Package SK1 (owner 21:36, new combat skills; 21:56: "if you can and it makes sense, feel free to use triggers and actions. if they dont suffice, add the required trigger or action."): the design notes the owner gave with the skills, and the rules SK1 built. Rules in `bramblewood-engine.js` (the Package SK1 block); pinned by `tests/skills-sk1-2026-10-19.js`.

- **Maps 21–40 are mostly about using the skills already learnt** (owner 21:36): new skills arrive past Map 40 (Punish is the first one held for then); Maps 21–40 lean on the skills a player has met by Map 20.
- **After each map has an appropriate set of canonical animals, arrange skills and stats, relying on what's already there and changing only if required** (owner 21:36): skills and stats follow the map's animals, reusing the existing ones first.
- **Skills are triggers × actions where they fit** (owner 21:56): Sentry N = On Enemy Enters (Facing): Damage N; Expose N / Exploit N / Venom Pulse N = On Hit: Expose / Exploit / Poison Tick N; Spoils N = On Kill (Creature): Buff itself +0/+N. New triggers On Enemy Enters (Facing), On Hit, On Kill (Creature); new actions Exploit and Poison Tick.
- **Expose is about hiding, Exploit about damage** (owner 21:36): Expose N strips the target's hiding for N rounds (Invisible, Evasive, Smoke, Shadow, Stealth; Flying and Swift still dodge); Exploit N puts N tokens on, each later hit +1 and one token used (the old Expose crit counters' role).
- **Cure / Heal / Cleanse** (owner 21:36): Cure removes Poison only; Heal restores Health only (no Bleed stanch); Cleanse (and Renewal, its shorthand) removes the physical debuffs: Bleed, Scar, Corrosion, Brittle, Exposed, Exploit, Shocked (Vulnerable), Staggered and Daunt (Weakness), a Perforate's shredded Armor (Rend), and a future Burn. Not Freeze, Stun, Sleep, Paralyze, Blind, Tipsy, Confused, Decay or Poison (Claude's call on Burn and Freeze). A cell curse still comes off first. Phoenix Fledgling keeps its intent with Renewal + Cure 2.
- **Siege N = the old Demolisher and the old Siege** (owner 21:36): +N on Structures and on swings at the bramble; `demolisher` stays an alias for old saves and overrides (the higher of the two when both).
- **Isolation is a drawback** (owner 21:36: "(4, 3, 2, 1, or 0) - range = 2"): allies within 2 columns, 0/1/2/3/4+ give −4/−3/−2/−1/0 Attack and Health (flat, Claude's call over −50%), a table parameter; its S is negative, like the payments.
- **Punish N is held behind a flag** (owner: an advanced skill for Map 40+, design open): the recommended design (docs/skills-punish-proposal.md) is built behind `rules.punishSkill` / engine `flags.punish` and is on no card.
- **Every SK1 number is a parameter** (owner: the numbers may be halved): the engine's SK1_DEF defaults, a card's own N, and `makeSimEngine(..., {sk1:{...}})` to change the defaults in one place.

## Stated rules · 2026-10-19

Package SK2b (owner 23:43: "I want to make resources really a strategic move. Not a simple - just put."): the three-tier economy and the cost principle. Details: docs/economy-resources-2026-10-19.md. Pinned by `tests/skills-sk2b-2026-10-19.js`.

- **Strong creatures can be low costed - and their power is that they are low costed** (the owner, 23:43). A cheap strong card is a design tool, not a balance error: its strength is tempo. Costly cards are strong because they need an economy, and the economy is what the opponent can attack. The budget is not bent for such cards; they are a deliberate, marked class (recommendation, not applied).
- **Three tiers, each paid with the one below** (all On Turn Start × Gain, while Ready): Milling N gives N Lumber free; Quarry N pays 1 Lumber for N Stone; Smelter N pays 2 Lumber + 2 Stone for 1 Metal, up to N times. The ratios are parameters (SK2_DEFAULTS). The Petrified Tree stays the expensive no-input Stone source.
- **A trigger can have a price** (t.pay, Lumber / Stone / Metal / Uranium): it goes off only if its player holds all of it, and pays after every other gate, so a fizzle costs nothing. A conversion is paid whole or not at all; can't pay, nothing happens. Units pay in the upkeep's order, so a Quarry acting first can feed a Smelter the same turn.
- **Smelter, not Forge-works** (Claude's call): the Forge is already the card-upgrade screen.
