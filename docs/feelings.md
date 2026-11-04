# Skirmish feelings and the forecast principle

**Canonical** (package FEEL1, 2026-11-04). This page is the owner's definition of what a skirmish should make the player feel, and the rules that keep our big effects fair. The hub's 💭 Feelings tab shows it. Status: proposed for adoption, decision **FEEL1-1** (YET).

Owner, 2026-11-04 09:23, verbatim:
> I am deeply ruminating how to make Skirmishes more fun. We should define "feelings" in master hub. a new tab. Things like, you juke the enemy into thinking of placing a weak unit on some slot OR working their way in the wrong direction - then you play a strong siege rhino. Same with stealth. Same with healing a strong unit. Then things that are instantaneous and surprising! But what's unique to us compared to other games is that, for bigger effects, the players have to actually plan it out - as most strong effects e.g. deal 2 damage to all on ready -> takes time to ready! forecasted.

How to read it:
- Rules, keywords and the AI are what `bramblewood-engine.js` does. Card stats are `canonical/cards.json`. Prices are `bramblewood-budget.js` and `canonical/skill-costs.json`. This page names feelings and design direction; it sets no number those files own.
- Card examples use the cards as they are in `canonical/cards.json` on 2026-11-04. Fight codes and win rates come from the road measure `docs/balance/skirmish-pass-summary-2026-11-03b.jsonl` (Map reference, 40 games a fight, no leader). That file is cached: FEEL1 ran no simulation.
- A feeling never overrides the road curve or the owner's tolerance (`docs/evaluation-protocol.md` section 3). A fight that delivers a feeling but sits 20 points off its target is still a balance problem.
- "Gap Gn" points to section 4. Gaps are proposals only; none is built.

## How a round works (the part feelings depend on)

The engine, `bramblewood-engine.js`:
- **Each round:** round-start effects first (the tide, Restless steps, the day / night change, Dawn's draw). Then each side plays (and may pitch). Then combat: Poison and the other ticks, then **upkeep**, then the swings in Speed order (Quick first).
- **Upkeep:** every Waiting unit's Wait goes down by 1. A unit that reaches 0 becomes Ready, fires its **On Ready** effects (Fireball, Meteor, On Ready damage, Delivery, an On Ready shield) and swings that same round.
  - Stun, Sleep and Freeze stop the countdown.
  - +Wait effects push it back: Avalanche, Tsunami, the Elder Tortoise's On Spawn +2 Wait, Frigid.
- **The board shows the clock.** The Wait ring on each card counts down, with a tick each upkeep and a flourish at Ready (`waitBadgeHTML`, the `waitTick` and `ready` events). So every Waiting unit is a public forecast of when it will act. What it will do is printed on its card.
- **Swings:** a Ready unit swings at the unit in the column facing it. With nothing there, it hits the bramble.
  - Stealth always hits the bramble.
  - Siege N adds N when the hit lands on the bramble.
  - Guardian and Taunt redirect a swing (`docs/project-state.md`, Blocking).
- **On Play / arrival effects** happen the moment the card lands, Waiting or not: Pounce, Earthquake, Avalanche, Tsunami, Bulwark, On Spawn triggers. **Ambush** strikes the moment an enemy enters the slot facing it.
- **CPU levels:** 0 basic, 1 smart, 2 smartest.
  - On the road, ordinary skirmishes play the basic CPU.
  - Elites, mini-bosses and bosses play smart from Map 5.
  - Map 21+ plays smartest (engine comment at `aiLevel`; the summary jsonl's `cpu` field).

## 1. The feelings

Nine feelings. The first five are the owner's. **Forecast and payoff (5)** is our signature: it is the one to protect when two feelings pull against each other.

### 1. The juke

**In the player's words:** "I made them commit to the wrong place, then dropped the real threat where they weren't."

**The moment (Map 23, The Goldfeather Siege, the owner's example):**
- You have a 1/5 Ant Scout in the centre column and nothing on the far right.
- The CPU holds a 3/11 Mouse Sapper. It plays the Sapper facing your Ant Scout: a kill it can make now scores highest in its slot choice (`aiSlotScorerSmartest`: a kill now is worth 3 or more; the basic and smart CPUs prefer kill-or-survive slots too).
- With its last open blocker spent in the centre, you play the **Siege Rhino** (5/17, Wait 3, Siege 4) on the far right.
- For three rounds its ring counts down in plain view. The CPU keeps answering your small units. When the ring hits 0, the Rhino swings into the open column for 5 + 4 Siege on the bramble, every round, until something blocks it.
- **The earlier version:** the **Cave Bear** (4/13, Wait 2, Rage, Siege 4) on Map 20's fights (20-8, 20-A-2, 20-A-5). The **Mouse Sapper** (Siege 1) teaches open columns on Map 12 (12-1 to 12-7).

**What produces it today:**
- Siege N (Mouse Sapper Map 12; Cave Bear Map 20; Siege Rhino, Beetle Battering-Ram and Trebuchet Crew Map 23). Stealth is a juke that needs no open column.
- The CPU's kill-first slot scoring. It takes bait at every level today.
- The CPU's lean: it weights slots facing or beside your units (`aiLaneWeight`, `aiLaneTie`), so where you build pulls where it builds: "working their way in the wrong direction".
- Restless units step toward the nearest enemy, so a bait drags them.
- **The biggest factor:** the CPU does not count a Waiting unit as a threat. `aiSwingOdds` is 0 while Wait > 0, so its block term, `aiIncomingOnBramble` and the lethal guard all skip it.

**What kills it:**
- **The CPU never takes the bait:** not today.
- **The CPU always takes it, so it is no trick at all:** today it does. It never sees the Rhino coming, so the juke lands even when the player did nothing clever (gap G1, G3).
- **No open column to exploit:** a 5-column board already full on both sides.
- **The payoff card comes too early:** at Wait 0 there is nothing to juke; it is just a strong play.
- **It comes too late:** the fight is over before Wait 3 runs out.

**How we tell:**
- Per fight, count **open-column payoffs**: a unit with Siege, Stealth or Attack 5+ that became Ready in a column the enemy left open, while the enemy's most recent play went into a column facing a cheaper unit of yours.
- **Signal:** the share of won fights with at least one, at the Map reference. **Rough aim:** present but not universal, 20-50% of wins on a juke-tagged fight.
- Logged from the `ready`, `hitHQ` and play events (gap G7).

### 2. The reveal

**In the player's words:** "It was there all along. I just didn't see what it would do until it did it."

**The moment:**
- **Map 17 Wolfsbane Tundra (17-6, 17-7):** the enemy's **Polar Bear** (2/17, Ambush 4, Hibernate) sits in a middle column. Facing a 2-Attack unit, your 4/10 looks like it survives, so you play it there. The Bear strikes it for 4 as it lands, can't be dodged, and no Guardian steps in.
- **Map 6 Sable Swampmire (6-2 to 6-6):** the **Booming Bittern** (1/12, Invisible 2, Daunt 1) can't be found by your arrows or skills for two rounds, then shows up as your swings start to land.
- **Map 7 The Morel Hollow (7-2, 7-6):** the **Owl Nightwatch** (1/3, Flying, Stealth, Nocturnal 3) flies past your wall to the bramble at night for 4.

**What produces it today:**
- **Ambush N:** Polar Bear Map 17, also in Map 11's pool; Tunnel Ant on side maps 0-B, 1-A, 7-A, 8-A.
- **Sentry:** Goose Sentry and Battlement Heron, Map 24.
- **Invisible N:** Booming Bittern Map 6, Sandfish Map 18 (18-1 to 18-A-9).
- **Stealth:** Owl Nightwatch Map 7; Glass Octopus 10-A.
- The darkness and Fog of War (information only; Fog is in the Arena modifiers, not on road fights).
- **Counters:** True Sight finds Invisible (ENG15), Expose strips hiding, a Spotter finds Invisible.

**What kills it:**
- **The reveal is invisible:** Ambush's strike is floating text and sound only (`docs/effects-catalogue.md`: Ambush, no FX), so the player sees a number, not a trap springing (gap G4).
- **The player can't tell afterwards why it happened:** no marker on the slot an Ambush unit watches.
- **The player had no way to know:** a keyword never seen before on a hard fight.
- **It happens every time:** the CPU walks into every Ambush, so the player's own Ambush is a sure thing, not a read (gap G3).
- **No answer exists on the map:** Invisible on Map 6 with no True Sight in its pool. SKILLREC1 proposes True Sight on the Raven Scout for exactly this.

**How we tell:**
- Count of `ambush` events, `hit` events with `ambush: true`, Invisible units that survived their hidden rounds, and Stealth `hitHQ`, per fight.
- **The fairness signal:** in fights the player lost, the share of losses where a reveal dealt 25% or more of the damage. If it is high, the reveal reads as a cheap shot, not a surprise.

### 3. The clutch save

**In the player's words:** "My big unit was one hit from dying and I kept it alive, just in time."

**The moment:**
- **Map 4 Sunken Hollow (elites 4-3 to 4-5):** your 5/17 carry has 4 Health left, facing a Ready 5-Attack unit. You play the **Muskrat Lodgekeeper** (1/7, Bulwark 1). Two 0/4 Bulwark Shields with Guardian land in the free front-row slots next to it. The next swing at your carry goes into a shield, and the carry swings back.
- **Map 6 (6-5, Venomlord's Coil):** the **Newt Doctor** (4/3, Healing 1) heals the most wounded unit at each round start.
- **Later:** the **Phoenix Fledgling** (Map 22, Renewal, Cure 2) cleans off a Poison stack before it ticks the carry down.

**What produces it today:**
- **Healing N:** automatic, most wounded unit, each round start. Newt Doctor Map 6, Nectar Vintner Map 5, the Unicorn.
- **Shields:** Bulwark (Muskrat Lodgekeeper Map 4; Ancient Sloth Titan Map 20). Grant Shield on play: Royal Guard (`otter-royal-guard`, On Play +3 Shield to every ally; obtainable from Map 5, in no map pool). Tide Pool Crab Shield 3 (Map 2).
- **Redirects:** Guardian and Taunt next to the carry.
- **Cleansing:** Cure / Renewal.
- **Timed shields:** the Amber Cicada (On Ready +2 Shield to every ally, Wait 3, in no pool) is a forecast save.
- The rule "a heal with nothing to heal does not happen" keeps a save from being wasted (`docs/project-state.md`).

**What kills it:**
- **The heal is automatic:** Healing picks the most wounded unit by itself, so the save happens to the player rather than being chosen. There is no "heal this one, now" card on the road (gap G8).
- **The threat was not visible:** the player didn't know the hit was coming. A forecast (feature 5) makes the save possible.
- **The save comes too early:** a shield on a full-Health unit.
- **It comes too late:** a heal after the death sweep.
- **The CPU never threatens a kill:** no tension.

**How we tell:**
- Count **saves**: a heal, shield or redirect on a unit that would have died to the damage aimed at it that round (its Health at or below the Attack facing it), where the unit then survives the round.
- **Signal:** saves per fight, and the share of won fights with one (gap G7).

### 4. The instant surprise

**In the player's words:** "Whoa, that happened the moment it landed."

**The moment:**
- **Map 3 Gannet Cliffs (3-4 to 3-7):** you leave your 2/2 in a column with nothing facing it. The CPU plays a **Golden Eagle Diver** (2/2, Flying, Pounce 3, Wait 0) into that column. It pounces for 3 as it lands, your unit dies before combat, and the Eagle then swings this round.
- **Map 5 Gatorback Swamp (5-1 to 5-A-4):** the **Caiman Hatchling** (Quick) swings before your unit.
- **Map 11 Eyrie Heights (11-5 to 11-10):** the **Ibex Rockcaller** (Avalanche 1) buries your whole ground board with +1 Wait as it arrives.

**What produces it today:**
- **On Play / arrival:** Pounce (Map 1+: Anhinga Spearbird; Map 3 Golden Eagle Diver), Quick (Map 5+), Brood, Bulwark, On Spawn triggers (draw, stun, grant shield, add Wait).
- **Arrival area effects:** Avalanche (Map 11), Earthquake (Gorge Wyrm, Map 20 pool), Tsunami (Fathom Leviathan, Map 13).
- **Ambush** (feeling 2) is an instant surprise on the enemy's turn.

**What kills it:**
- **It is too big:** an arrival effect that wipes a planned board leaves nothing to answer (section 2, F4). Earthquake 3 to every other unit and Tsunami's push to the whole board are big instant effects (gap G6).
- **It is too frequent:** five Pounces a fight is noise, not surprise.
- **It is not shown:** a Pounce kill animates; an On Spawn add Wait is easy to miss.

**How we tell:**
- Count arrival kills: units killed by an arrival effect before combat (the `settleArrivalDeaths` pass, the `pounce` and `hit` events).
- **Signal:** 1-3 such moments a fight on an instant-tagged fight. Their share of all damage should stay small: if over about 25%, the fight is decided by arrivals, not plans.

### 5. The forecast and the planned payoff (our signature)

**In the player's words:** "I saw it coming three rounds away. I set up for it (or against it), and when it went off it went exactly the way I planned."

**The moment, both sides:**
- **Theirs (Map 11 Eyrie Heights, 11-1 to 11-10):** the CPU plays an **Eyrie Warden** (3/11, Flying, Wait 3, On Ready 6 damage to a random enemy, Daunt 1). Its ring reads 3.
  - You have two plays before it fires. You can kill it (11 Health), stop its clock (Stun, Freeze, Sleep), push it (+Wait), or make the hit land on something that can take 6.
  - **Your counter-plan:** on the round its ring reads 1, the Rockcaller's Avalanche on your side puts +1 Wait on every enemy ground unit. The Warden is a Flyer and Avalanche misses Flyers, so you need another answer. That reading is the decision.
- **Yours (Map 20 The Sundered Peak):** you play the **Cave Warlord** (6/28, Wait 5, On Ready 8 damage to a random enemy, Daunt 2) behind your Guardians.
  - For five rounds the enemy can see it coming. Your plan is to keep it alive and fill the board so the 8 lands on something that matters.
  - At Ready it hits and swings 6 every round after.
- **The big burst:** the **Salamander Pyromancer** (2/12, Wait 3, Fireball 15 on Ready, 3 columns wide, Map 20 pool) and the **Starfall Owl** (Meteor 20 on Ready, Wait 4) are the board-changing forecasts.

**What produces it today:**
- Wait on every card, shown by the ring.
- **On Ready effects:** On Ready damage (Echo Screecher Map 8, Wait 1, 3 damage; Eyrie Warden Map 11; Cave Warlord Map 20), Fireball, Meteor, Render On Ready, On Ready shield (Amber Cicada), Delivery.
- **Big swingers with long Wait:** Siege Rhino, Reef Shark 6/13 Wait 3 Map 9, Goliath Tentacle Sweep 5 Wait 3 Map 13.
- **Answers:**
  - **Stop or push the clock:** Stun / Freeze / Sleep stop it; Avalanche, Tsunami, Elder Tortoise and Frigid push it.
  - **Kill it** before Ready.
  - **Absorb or redirect the hit:** block the column, Guardian / Taunt, shields, Invisible against single targets, Spellward against skills.
- The **day / night cycle**: every 3 rounds on most outdoor maps (`MAP_DAYNIGHT`), and the tide, are map-wide forecasts.

**Why this is ours.** Other games have pieces of it. What they lack is the full set below.
- **Hearthstone:** big effects are instant on the turn they are paid for (Battlecries, spells). The answer comes after, on your own turn. Hidden Secrets give surprise but no visible clock. Counterplay is reactive cleanup, not getting ready for a known moment.
- **Marvel Snap:** the surprise is the simultaneous reveal. On Reveal effects fire at once. No single card carries its own countdown on the board. The clock is the game's six turns, shared by every card.
- **Inscryption:** shows the opponent's next cards a turn ahead in a queue lane. That is a forecast, but one-sided (only the opponent's), one turn long, and about which card goes where, not when a printed effect fires. Slay the Spire's enemy intents are the same idea for a PvE enemy.
- **Bramblewood, all four at once:**
  - (a) Both sides' units forecast, symmetrically, because Wait is printed on every card.
  - (b) The forecast length is part of the card and grows with its power: a 3-damage On Ready at Wait 1, 6 at Wait 3, 8 at Wait 5, a 15 Fireball at Wait 3 on an epic.
  - (c) The window is answerable with the game's own verbs: stop the clock, push it, kill, block, redirect, brace.
  - (d) The payoff resolves by itself when the clock hits 0, so planning is placement and timing, not holding mana for the right turn.
- The planning is about where and when, and the opponent can see and answer it.

**What kills it:**
- **The CPU ignores forecasts.** It never answers a Waiting unit (`aiSwingOdds` 0 while Waiting), so its plans land unopposed, and the player's plans land even when they were obvious. The player learns nothing by setting up against a forecast that the CPU did not set up (gap G1).
- **The forecast does not say on whom:** On Ready damage and Fireball pick a random enemy at Ready, so the player can't plan the brace (gap G5).
- **The forecast is easy to miss:** the ring is small. Nothing on the board says "this fires 6 damage next upkeep" without opening the card (gap G2).
- **Too short:** Wait 0-1 big effects are instant in all but name.
- **Too long:** Wait 5+ in a fight that ends by round 6.
- **The answer is not in the pool:** a forecast-tagged map with no Stun, +Wait or True Sight for the player.

**How we tell:**
- For every unit with an On Ready effect or a swing worth 5 or more, record whether it **landed** (became Ready and its effect hit) or was **answered** (killed, stunned, frozen or pushed before Ready, or its column blocked in the round it readied).
- **Signals:** the answered share on each side, and the forecast window (Wait when played).
- **Aims:** windows of 2-5 rounds. The player's answered share against the CPU's forecasts should rise with skill: the ladder's rank 10 above rank 1. The CPU's answered share of the player's forecasts should rise with CPU level (G1).

### 6. The comeback

**In the player's words:** "I was nearly finished and turned it around."

**The moment:**
- **Map 13 The Redwood Deep (13-1 to 13-4):** your **Berserker Boar** (3/9, Rage) drops below half Health. Its Attack doubles to 6 and it takes half damage. The column that was losing now wins.
- **Map 20 (20-1, 20-7, 20-8, 20-A):** the enemy's **Cinder Skeletons** (1/7, Undead, Requiem 5) come back and grow as the deaths pile up.
- **Map 17:** the **Wolfsbane Alpha** (Dirge 3) grows when its allies fall.

**What produces it today:**
- **Rage:** Ant Warrior and Berserker Boar Map 7, Cave Bear Map 20, Yeti Chieftain Map 19.
- **The threshold skills:** Requiem, Dirge, Carnage (Dust Hyena Map 14), Muster, Beset, Throng. Last Stand. Undead. Revive (on no card yet).
- **Rules that help the side behind:** the CPU's lethal guard (it blocks when your Ready units would kill its bramble); "never while losing badly" in its saving plan; the second player's +1 Shield; Dawn's draw for both.

**What kills it:**
- **The snowball is too strong** (feeling 8): the side ahead stays ahead.
- **The comeback tools only fire for the CPU:** the player rarely has Rage cards at the right time.
- **The comeback is guaranteed:** it stops being earned.

**How we tell:**
- **Comeback wins:** wins where the winner's bramble was at or below 30% Health at some round, or the winner was behind on board value at round 4.
- **Signal:** the share of wins that are comebacks per map, both seats. **Rough aim:** 10-25%. Under 5% means fights are decided early; over 40% means early play doesn't matter.

### 7. The race

**In the player's words:** "Both brambles were nearly gone. It came down to who hits first."

**The moment:**
- **Map 7 (7-2, 7-6), at night:** the enemy's three **Owl Nightwatch** go straight to your bramble for 4 each. Your wall is useless against them.
- Your answer is to stop defending and race. Your Siege or Stealth units go into open columns. Quick (Caiman Hatchling, Great Barracuda) decides who strikes first in the last round.
- Sudden Death (from round 20, `SUDDEN_DEATH_ROUND`) forces a race in long fights.

**What produces it today:**
- Stealth, Siege, Rocket (Bombardier Beetle Map 7), Quick and Speed order, open columns.
- The CPU's win check: it plays its end slot when its Ready units plus the new one kill your bramble (`aiWinEnds`). Its lethal guard is the defence side.
- Sudden Death.

**What kills it:**
- **The player can't see the race:** nothing shows how much will hit each bramble next round (gap G9).
- **One side's damage is hidden or random:** a random-target On Ready hits the bramble only when no unit is there.
- **Draws:** the stall rule ends a stuck fight.

**How we tell:**
- **Race fights:** both brambles at or below 25% at the end, or the loser's last-round damage at 50% or more of the winner's remaining Health.
- **Signal:** the share of fights that end as races. Rounds-to-win from the summary jsonl's `rounds` field.

### 8. The swarm snowball

**In the player's words:** "One became three, three became a wall, and every one of them got stronger."

**The moment:**
- **Map 7 (7-4, 7-5, 7-6):** a **Wolf Spider Mother** (2/7, Brood 2) lands. Two 1/1 Brood tokens hatch beside it, and each counts for the **Ant Warrior**'s (2/3, Rage, Swarm) Swarm.
- By round 4 the row is full and every swing is bigger. You either break it early (kill the Mother before she lands more, sweep the 1/1s) or lose to it.

**What produces it today:**
- **Makers:** Brood (Wolf Spider Mother: Map 7 decks; on the Map 0 and Map 11 lists), Bloom, Spawner, Ant Hill (On Turn: an Ant Scout every turn, Wait 3).
- **Payoffs:** Swarm (14 cards), Pack, Inspiring, Esprit, Muster, Throng.
- **Answers:** Sweep, Cleave, Earthquake, Nova (Supernova Jelly Map 10).

**What kills it:**
- **No answer in the player's pool:** the snowball is just a loss.
- **The board caps out:** with five columns, a full row stops growing.
- **The snowball ends the fight before the player can act:** it should take 3+ rounds to build, which makes it a forecast too.

**How we tell:**
- **The swarm curve:** a side's unit count by round. **Signal:** the round a side first has 5 units, and the winner's share when one side reaches 5 first.
- If reaching 5 first wins 90%+, the snowball has no counterplay at that map.

### 9. The turn of the clock (day and night, the tide)

**In the player's words:** "I held it for nightfall and it paid off," or "dawn is coming, I have to win before then."

**The moment:**
- **Map 1 Thistlewood** (cycles every 3 rounds; Map 0 is misty and has none):
  - The **Woodcock Lookout** (Crepuscular 1) and, if SKILLREC1 is adopted, the **Dormouse** (Nocturnal 1) make "play it now or hold it for dusk" the decision.
  - At dawn, both sides draw a card.
- **Map 7:** the Owl Nightwatch is a 1/3 by day and a 4/3 Stealth Flyer by night. The night pill tells you when the race (feeling 7) starts.
- **The tide** on the beach and river maps is the same kind of clock: Tide units' bonuses and the evade rule while it is in.

**What produces it today:**
- **The day / night cycle:** 3 rounds each, Dawn draws both sides a card. On every outdoor map from Map 1; Maps 6 and 16 are always night; the caves and the deep have none (`MAP_DAYNIGHT`, `mapDayNight` in `arena_app.js`).
- **Twilight** when a deck carries a Crepuscular card.
- **The time-of-day keywords:** Nocturnal (35 cards), Diurnal (14), Crepuscular, Scorching, Moonborn, Hibernate (cold nights).
- **The tide:** Flood, Ebb, Tide-spout, Perma-tide.
- **The seasons** (6 rounds each).
- The phase pill on the board shows the state.

**What kills it:**
- **The player can't see when the change comes:** the pill shows the state now. A count of rounds to the next change is gap G2's second half (not checked in FEEL1).
- **Too few cards care**, so the change is noise.
- **The fight ends inside one phase:** 3-round phases against 5-round fights.

**How we tell:**
- **Timed plays:** the share of the player's Nocturnal / Diurnal plays made during their phase or the round before it, against chance.
- **Signal:** above chance at the ladder's top ranks means the clock is a real decision.

## 2. The forecast principle

The rules that keep big effects plannable and surprises fair. A new card, skill or fight is checked against them. Numbers here are design guides; prices stay in `bramblewood-budget.js`.

### F1. What a forecast must show

Every effect that will fire later shows four things on the board, without opening the card:
1. **Which unit:** the unit itself, marked as charging (the Wait ring today).
2. **What effect:** its name and number ("6 damage", "Fireball 15", "Siege 4 if the column is open").
3. **When:** rounds left. At 1 it says "this round": the upkeep after the next plays.
4. **On whom or where:**
   - the column it swings or fires into;
   - the area (three columns, every enemy, the whole row);
   - for a random target, the set it can pick from.

A forecast whose target is decided only at the moment it fires breaks rule 4. Either lock the target at Wait 1 and show it, or show the set (gap G5).

### F2. Strength against Wait: bigger means longer and more visible

| Wait (rounds of warning) | What it may do | Cards today that fit |
|---|---|---|
| 0 (instant, On Play) | small: one target up to about 3, or 1 to an area, a +1 Wait, a few Shield | Pounce 2-3 (Golden Eagle Diver), Bulwark 1, Royal Guard's +3 Shield, Avalanche 1 |
| 1-2 | one target, mid-size: up to about 5-6, or an area of 2 | Echo Screecher (Wait 1, 3 to one), Cave Bear's Siege 4 at Wait 2 |
| 3-4 | one big target or a real area: 6-8 to one, 3 to an area, Siege 4 on a 5-Attack body | Eyrie Warden (Wait 3, 6), Siege Rhino (Wait 3), Salamander Pyromancer (Wait 3, Fireball 15: epic), Starfall Owl (Wait 4, Meteor 20: legendary) |
| 5+ | board-changing: 8+ to one, every enemy, the bramble | Cave Warlord (Wait 5, 8) |

How to use the table:
- Higher rarity may sit one row up, as the Pyromancer and the Owl do. Their Wait still gives the other side two or more plays.
- A long-Wait card is a target in the window. It needs the Health, a Guardian beside it, or Invisible to make the window a real contest: the Cave Warlord's 28 Health is part of its design.
- The budget prices Wait already (it counts against a card's tempo). This table only says which way a designer moves Wait when an effect grows.

### F3. Fair surprise, unfair surprise

**Fair:**
- The information was public, even if the player missed it: a keyword on a card in play, a map rule in the pills, a Wait ring, a card seen earlier on the map.
- The surprise is small and recoverable (an Ambush 2-4 on one unit).
- It is big but was forecast (feeling 5).
- The player had an answer in their pool at that map.

**Unfair:**
- Hidden information plus a big swing with no counter: an instant effect that kills a healthy strong unit, or clears the board as it lands.
- Any effect the board did not show happening: a number with no animation, a strike from a unit nobody could see was watching.
- A random target that decides the fight.
- A keyword's first appearance on a hard fight (the "teach before test" rule in section 3).

**Hidden on purpose** (Fog of War, Invisible, darkness):
- The hiding itself must be visible: the fog is drawn, the Invisible unit is on the board with its rounds left.
- What it hides stays small, or the hiding ends before a big effect lands.

### F4. Instant effects stay small

- An On Play / arrival effect sits in the first row of F2's table.
- A bigger instant effect needs a real price paid now: a sacrifice, a high Lumber cost, or the unit itself taking the hit (Earthquake hits your own side). Even then it may not remove the other side's chance to answer a forecast already on the board.
- Instant effects that **move a forecast** are the best kind of instant. +Wait (Avalanche, Tsunami, Elder Tortoise), Stun and Freeze are answers, and answers should be instant. An answer that cancels a forecast outright (kill a 28-Health unit from hand) is too strong. One that delays it, blocks it or makes it cost more is right.
- **Today's exceptions to review (gap G6):**
  - Earthquake N on arrival: Gorge Wyrm 3 to every other unit; Glacial Ape-King 4, cut from Maps 0-20 by CUT3.
  - Tsunami 2 on arrival: Fathom Leviathan, pushing the whole enemy board.
  - Their bodies Wait 4-6, but the effect does not wait. Under F2 they would be On Ready effects.

## 3. The skirmish feelings recipe

### 3a. Checklist (the skirmish designer, the deck builder, the skirmish editor)

For each road fight:
1. **Name 1-3 feelings** from section 1 that this fight offers. A map's fights between them cover the map's own mechanic. The map's last fight tests one of the feelings its earlier fights taught.
2. **Put the setter in the enemy deck often enough to show up:** 3-4 copies in a 20-card deck, or the leader. Check in sims that the setter was played in most fights (the "seen" rate; gap G7).
3. **Give the player the answer:** the map's pool (MAP tier, the rewards so far, the reference decks) holds at least one card that answers the feeling:
   - True Sight or Expose for Invisible;
   - a high-Health blocker for Siege;
   - Stun, +Wait or a burst for a forecast;
   - Sweep for a swarm;
   - Guardian or a shield for a save.
4. **Teach before test:**
   - The first fight with a feeling shows it weakly: one copy, a small N, or the player's side gets it first as a reward.
   - An elite or the boss tests it.
   - Within the rule of two new skills a map (`docs/project-state.md`, section 2).
5. **Make the tell visible:** the keyword is on a card in play, the Wait ring or map pill shows the clock, and the effect animates when it fires (F1, F3). If the effect has no FX yet (Ambush, Siege, Healing, Bulwark: `docs/effects-catalogue.md`), list it under gap G4 before tagging the fight.
6. **Leave a window:** between a forecast appearing and landing, the player has at least one play. Wait 2+ for anything in F2's third row.
7. **Keep the curve:** the fight's win rate stays in the road curve's band (`docs/evaluation-protocol.md`). A feeling is a reason to choose which cards make it hard, never a reason to accept a fight outside the band.
8. **Write it down:** the fight's feelings in its design note, and (when gap G10 is built) in its `feel` field.

### 3b. Enemy deck patterns that set feelings up

| Pattern | Sets up | Deck shape | Example cards |
|---|---|---|---|
| **Protect the clock** | forecast (their side) | 2-4 long-Wait payoffs + Guardians / Taunt beside them + cheap blockers | Eyrie Warden, Cave Warlord, Salamander Pyromancer; Grizzly Vanguard (Guardian, Wait 3), Stalactite Pill Bug |
| **Bait and siege** | juke (their side) | cheap bodies that draw your units + 2-3 Siege / Stealth finishers with Wait | Mouse Sapper, Badger Trench Digger + Cave Bear / Siege Rhino / Beetle Battering-Ram |
| **The trap line** | reveal | 2-3 Ambush / Sentry units with high Health, played early in the middle columns (the CPU likes the middle) | Polar Bear, Tunnel Ant, Goose Sentry, Battlement Heron |
| **The hidden wing** | reveal, race | Invisible or Stealth units + walls, on a night or cycling map | Booming Bittern, Sandfish, Owl Nightwatch, Glass Octopus |
| **One carry** | clutch save (theirs, and a target for yours) | one big unit + Healing / Bulwark / shields / Guardian neighbours | Newt Doctor, Muskrat Lodgekeeper, Royal Guard; Mangrove Manatee (Regen, Guardian) |
| **The brood** | swarm snowball | makers + Swarm payoffs, few big cards | Wolf Spider Mother, Ant Warrior, Ant Hill, Carrion Fly Swarm |
| **Last stand** | comeback (theirs) | Rage carriers and threshold skills | Berserker Boar, Cave Bear, Cinder Skeleton, Wolfsbane Alpha |
| **Night shift** | the clock | Nocturnal-heavy on a cycling map, or Diurnal against a night-first fight | Owl Nightwatch, Echo Screecher, Dormouse (SKILLREC1) |

### 3c. What the CPU must do for each feeling

| Feeling | CPU behaviour it needs | Today |
|---|---|---|
| Juke (player jukes CPU) | Take a bait at low levels; at the top level, weigh the bait against a forecast it can see (a Waiting threat facing an open column) | Takes every bait at every level, and never sees the Waiting threat (gaps G1, G3) |
| Juke (CPU jukes player) | Hold a Siege / Stealth finisher and play it into the column the player left open | Partly: `aiWinEnds` plays into open ends for lethal; no "hold for the open column" plan |
| Reveal (player's) | Walk into a visible Ambush at low levels; avoid it when it would lose the unit at the top level | Walks into every Ambush (the slot score does not read Ambush) |
| Reveal (CPU's) | Play Ambush / Sentry units early in the middle | Middle-lane pull exists (`aiLaneBonus`); no Ambush-specific placement |
| Clutch save | Threaten kills on the player's carry (it does: kill-now scoring), and save its own carry when it can | Threatens; its saving is automatic (Healing) or arrival-only (Bulwark); no "shield the one that's about to die" choice |
| Forecast | Answer the player's visible forecasts: block the column of a unit at Wait 1, stun or kill a charging payoff, hold +Wait for it. Protect its own charging units | Neither: Waiting units count as no threat (`aiSwingOdds`), so no answer and no protection (gap G1) |
| Comeback | Not give up its lethal guard; use Rage units when behind | Lethal guard at every level; the saving plan stops while losing badly |
| Race | Count its own and the player's open-column damage both ways | Counts Ready units only, both ways |
| Swarm | Break a growing swarm early (Sweep at the row, kill the maker) | Kill-now scoring helps by chance; no swarm-aware term |
| Clock | Hold Nocturnal cards for night | No phase-aware holding (the Bloom odds read day / night; card play does not) |

**Difficulty as a feeling knob.** The CPU levels are the place to tune how often the bait works:
- **Basic** (ordinary skirmishes) takes most baits.
- **Smart** (elites and bosses from Map 5) takes some.
- **Smartest** (Map 21+) takes a bait only when the trade is good for it, and answers forecasts.
That keeps early fights generous and late fights a real read. Any change to the CPU needs the road check afterwards (`docs/evaluation-protocol.md` section 4).

### 3d. Example set-ups along the road

Each one uses the map's own cards and fights. "Now" is the cached road measure (Map reference win rate / target). These are proposals: none changes a deck.

1. **Map 1 Thistlewood, 1-2 Cricket Chorus / 1-3 Burrow Line: the turn of the clock.** Now 97.5 / 80 and 92.5 / 70.
   - The map cycles every 3 rounds.
   - **Enemy:** Dormouse (with SKILLREC1's Nocturnal 1) x4 and the Woodcock Lookout (Crepuscular 1) x2, so the enemy's line gets stronger at dusk.
   - **The player learns:** dawn draws you a card, dusk makes the mice hit. Hold your blockers for the night.
   - Both fights are far too easy, so the night bump is also a balance lever.
2. **Map 3 Gannet Cliffs, 3-5 to 3-7: the instant surprise.** Now 70 / 66, 80 / 60, 55 / 40 (The Gannet Queen).
   - **Enemy:** Golden Eagle Diver x3-4 (Pounce 3, Wait 0) and the Gannet Queen (Pounce 2, leader).
   - **The lesson:** a 2-3 Health unit left alone in a column is prey. Put the high-Health unit where the Eagle will dive.
   - **Teach:** 3-4 with one Eagle. **Test:** 3-7.
3. **Map 6 Sable Swampmire, 6-2 to 6-6: the reveal, then the clutch save.** Now 90 / 85 to 62.5 / 65.
   - The map is always night.
   - **Enemy:** Booming Bittern x2-3 (Invisible 2): the reveal. In 6-5, Newt Doctor x2 (Healing 1) keeps the enemy's Venomlord Serpent alive.
   - **The player's answer:** the Raven Scout with SKILLREC1's True Sight, and focus fire before the heal comes round.
4. **Map 11 Eyrie Heights, 11-5 to 11-10: the forecast.** Now 60 / 75 to 30 / 40 (The Avalanche Colossus).
   - **Enemy:** Eyrie Warden x4-5 (Wait 3, On Ready 6) and the Ibex Rockcaller (Avalanche 1, which also delays the player's own forecasts).
   - **The lesson:** read the rings, and kill or stall the Warden before it fires.
   - The Warden's random target breaks F1's rule 4, so this fight wants gap G5 first. It also wants G2's indicator, because five Wardens at once is a lot of rings to read.
5. **Map 12 The Briar Maze, 12-1 to 12-7: the juke, small form.** Now 80 / 90 to 42.5 / 40.
   - **Enemy:** Mouse Sapper x3-5 (Siege 1) and Field Mouse bait.
   - **The lesson:** an open column is bramble damage, and Siege makes it worse. Cover the column the Sapper faces.
   - **The player's tool:** leave the enemy a bait column and keep their Sappers busy.
6. **Map 17 Wolfsbane Tundra, 17-6 / 17-7: the reveal, a trap line.** Now 42.5 / 65 and 7.5 / 60, the second **unacceptable** (−52).
   - **Enemy:** Polar Bear x2 (Ambush 4) in the middle columns.
   - **The lesson:** read what the facing unit does before you play into it.
   - 17-7 still holds the cut Glacial Ape-King x4 (CUT3-1). Rebuild it as a trap line with the Bears as the feature, not as a wall of Ape-Kings.
7. **Map 20 The Sundered Peak, 20-5 to 20-8: protect the clock against bait and siege.** Now 70 / 72.9 to 62.5 / 60.
   - **Enemy:** Cave Warlord x4 (Wait 5, On Ready 8) behind the Ancient Sloth Titan's Bulwark shields; the Cave Bear (Siege 4, Rage) in 20-8.
   - **The player's choice:** race the Warlords' clock, or stall it (Stun, +Wait) and kill them inside their window.
   - Cinder Skeletons (Requiem 5) give the enemy a comeback if the player trades too freely.
8. **Map 23 The Goldfeather Siege, 23-3 to 23-7: the juke, full form (the owner's example).**
   - **Enemy:** Siege Rhino (Wait 3, Siege 4) in five of the map's decks, the Beetle Battering-Ram (Siege 3, Breach 2) and Mouse Sappers as bait.
   - **The player's side:** the Rhino is a Map 23 card, so the player gets to juke back with the same tool.
   - Map 23 is past the summary's Map 20 limit: no cached measure.
   - At Map 21+ the CPU is the smartest. This is where it should start answering forecasts (G1) and stop taking every bait (G3). Otherwise the juke is free here too.

## 4. Gaps: feelings nothing supports yet

Proposals only. Each names the smallest change that would enable it. Owner call: FEEL1-1 ("which gaps to build first").

| Id | Gap | Feeling | Smallest change | Where |
|---|---|---|---|---|
| **G1** | The CPU ignores forecasts: a Waiting unit counts as no threat (`aiSwingOdds` is 0 while Wait > 0), so it never blocks, stalls or kills a charging payoff, and never protects its own | forecast, juke | Count an enemy unit at Wait 1 as swinging this round in `aiIncomingOnBramble`, the lethal guard and the smartest slot score's block term (Wait 2 at half weight). Score Stun / +Wait / a kill on a charging unit by its On Ready worth. Gate by level: smartest all, smart Wait 1 only, basic none. Road check after. | engine (AI) |
| **G2** | Forecasts are hard to read: the Wait ring says when, not what or where. A charging On Ready effect or Siege is only on the card | forecast, race, clock | A charge chip on a Waiting unit ("in 2: 6 dmg"). At Wait 1, glow the column or area it will hit: reuse the raid trench's telegraphed-column look (`raidTelegraph`, the "danger" columns). The phase pill shows rounds to the next change. | UI (`arena_app.js`, template CSS) |
| **G3** | The bait always works: every CPU level kills the cheap unit in front of it and walks into every visible Ambush | juke, reveal | A "bait check" for the smartest CPU: discount a kill-now slot when the kill is worth less than the unit it plays and a visible threat (G1) faces an open column it could block. Read the facing unit's Ambush N in the slot score (a slot that loses the unit to Ambush counts as dying). Basic and smart keep taking the bait. | engine (AI) |
| **G4** | Reveals are invisible: Ambush, Siege, Healing and Bulwark fire with floating text or sound only. Nothing marks the slot an Ambush watches or an Invisible unit's rounds left | reveal, save | An Ambush strike FX (the Lab already has `WarFX.ramSlam` for Siege, unused). A faint watch mark on the slot facing an Ambush unit; Invisible's rounds left as pips. | FX, UI |
| **G5** | Random-target forecasts: On Ready damage, Fireball and Meteor choose their target at Ready, so "on whom" is unknown | forecast, save | Pick the target when the unit reaches Wait 1 and show it (G2). If the target dies or moves, re-pick at Ready. Owner call: lock it, or show the set. | engine + UI |
| **G6** | Big instant effects: Earthquake (Gorge Wyrm 3), Tsunami (Fathom Leviathan 2), the Elder Tortoise's On Spawn +2 Wait | instant, forecast | Review against F2 / F4. Move the board-wide ones to On Ready (Earthquake On Ready keeps its Wait-4 body as the forecast), or cap their N on arrival. Re-price with the budget. Owner call per card. | cards, budget |
| **G7** | No feelings meter: nothing measures these feelings | all | A node tool that plays each road fight N times with events on, and writes per-fight counts: open-column payoffs, reveals, saves, arrival kills, forecasts landed / answered (each side), comeback wins, race ends, the swarm round, timed phase plays. Output beside the balance summary; a column in the hub's 📈 Difficulty tab later. | tools |
| **G8** | No chosen heal: Healing heals the most wounded by itself; no card heals the unit you pick, now | clutch save | An On Play heal on one ally, built from the existing trigger and action (On Spawn x heal, `who: ally`, the most wounded or the one beside it) if the heal action accepts an ally target. Otherwise the smallest engine change to let it. One card a few maps in; priced by the budget. | engine / cards |
| **G9** | The race is invisible: nothing shows how much will hit each bramble next round | race, comeback | A small number on each bramble: next round's incoming from Ready units into open columns (and Wait-1 units, with G1's rule). The CPU already computes it (`aiIncomingOnBramble`). | UI |
| **G10** | Fights don't record their feelings | recipe | A `feel: [...]` list on a road node, editable in the skirmish editor, shown in the hub's 🃏 Decks tab; G7 reports against it. | app data, hub |

Top three to build first (recommendation): **G1** (the CPU reads forecasts), **G2** (forecast indicators), **G3** (the bait check, which makes difficulty a feeling knob).
- G1 without G2 makes the CPU answer things the player cannot see it answering.
- G2 without G1 shows forecasts that only the player acts on.
- G3 keeps the early road generous once G1 makes the CPU sharp.
