# Skill audit (2026-10-16)

**The ask:** "Do skill audit - so the skills are as simply named and described as possible, keywords are highlighted. And they have the right parameters for targeting and amount."

## Summary

- **216 skills** checked (every "+ Add Skill" skill that is not retired), against what `bramblewood-engine.js` really does.
- **3 renamed** (label only, keys unchanged): Divine Retribution → Retribution, Satiety → Well Fed, Revivificated → Revive.
- **60 card texts written or rewritten.** 38 skills had no short card text; 10 of them (Freeze, Sleep, Paralyze, Blind, Make Tipsy, Confuse, Shock, Stagger, Chained, Revive) showed **no line on the card at all**. They are in the Skills Codex now too.
- **3 texts were wrong** against the engine: Pounce and Ice Arrow (they aim at the unit facing it first, not a random or the nearest one) and Counterattack (it strikes the unit facing it, not the attacker). Arrow, Fire Arrow and the Bolts now say who they hit when nothing faces them.
- **3 amounts added**, each defaulting to the old behaviour: Rabid N (Poison, default 2), Durian N (Thorns per durian, default 1), Dynamite Fuse / **Damage** (the blast damage was a hidden field, default 5).
- **Parameter labels fixed:** the 8 status skills (Freeze … Stagger) showed "Timer / Damage" for what is really "Chance % / Rounds". New rows: Stun and Reflect start at 50% (not 1%), Rainmaker at 3 rounds. The Test Kit uses each skill's own labels too.
- **Keywords:** 7 statuses now have a colour and a one-line gloss (Exposed, Bound, Toxin, Smoke, Scar, Irradiation, Shield); 3 damage types highlight (magic, water, psychic damage); "Freezes" counts as Freeze; skill names match in the plural ("Changelings"), with & or ' ("Slash & Burn", "Nature's Force"), and Explode, Chained, Render, Revive, Progeny and Make Tipsy are keywords now.
- **33 icons added** so every skill line opens with a glyph (the card-face chip glyph where there was one).
- **Targeting:** checked every targeted skill; the targets are fixed by design (facing / nearest / random / all / beside) and the text now says which. No new targeting parameter was needed.
- **Kept as is: 151** skills (name, text and parameters already fine).

Shared words (the house style above `SKILL_TEXT`): **upkeep** = the start of each round; **adjacent** = the columns left, centre and right; "facing it" = the enemy in its column.

Card text below is shown with each skill's default amount.

## Passive skills (39 changed)

| Skill key | Old name → New name | New card text | Params (before → after) | Notes |
|---|---|---|---|---|
| `counterattack` | Counterattack | Never attacks on its own. Each time an enemy hits it, it strikes the enemy facing it. | none | Text was wrong: it strikes the enemy facing it, not whoever hit it. |
| `defiance` | Defiance | +1 Attack for every enemy unit that is of its chosen type. | types (optional) + N per unit (default 1) | No short text (the card showed the long editor help). Shows its "+N each". |
| `pack` | Pack | Pack units of its type standing side by side each get +1/+1 for every Pack point in the chain (two Pack 2s: +4/+4 each). | N (default 2) | Plain words instead of "N = the chain's Pack values". |
| `swarm` | Swarm | +1 Attack for every ally that shares a type with it. | types (optional) + N per unit (default 1) | No short text (the card showed the long editor help). Shows its "+N each". |
| `crepuscular` | Crepuscular | At Twilight: +1/+1. With it in your deck, every fifth phase is Twilight. | Attack / Health | No short text (the card showed the long editor help). |
| `sunshy` | Sun-shy | Blind by day. | none | No short text (the card showed the long editor help). |
| `nightblind` | Night-blind | Blind at night, unless an Illuminate unit lights your side. | none | No short text (the card showed the long editor help). |
| `nocturnal` | Nocturnal | At night: +1/+1. | Attack / Health | No short text (the card showed the long editor help). |
| `diurnal` | Diurnal | By day: +1/+1. | Attack / Health | No short text (the card showed the long editor help). |
| `tideGrant` | Tide – { }, { } | On Flood it has +5/+5, 🍃 Evasive; on Ebb, 🛡 Armor 2; at High Tide, both. | {Flood skills}, {Ebb skills} | No short text (the card keeps its own "Tide – {…}, {…}" line). |
| `rabid` | Rabid | Its hits add 2 Poison. Swimmers and water damage hit it for double. | none → N (default 2) | New amount. Old Rabid (on/off) reads as Rabid 2, as before. |
| `magic` | Magic | Its attacks deal magic damage. | none | Wording. |
| `loyal` | Loyal | While one of your leaders is on the field: +1/+1. | Attack / Health | No short text (the card showed the long editor help). |
| `usurper` | Usurper | While the enemy leader is on the field: +1/+1. | Attack / Health | No short text (the card showed the long editor help). |
| `dynamite` | Dynamite | A fuse of 3 burns down every upkeep; at 0 it blows up for 5 fire damage on the units beside it and the 3 enemy units facing it. | N (default 3) → Fuse / Damage | New amount: the blast damage was a hidden field (dynamiteDmg, 5). Now the second number; unset still means 5. |
| `helmet` | Helmet | Half the arrows, missiles and bolts aimed at it glance off. | none | No short text (the card showed the long editor help). |
| `shedding` | Shedding | Every 3 rounds: +1/+1 for good, and it sheds its Poison, Bleed, Corrode, Scar and Exposed. | N (default 3) | No short text (the card showed the long editor help). Status names fixed (Corrode, Exposed). |
| `kinship` | Kinship | All your Otter units get +1/+1 (itself too). Stacks. | Type, Attack / Health | No short text (the card showed the long editor help). |
| `loneWolf` | Lone Wolf | +1/+1 for each empty slot within 2 of it, and +1/+1 more when all 4 are empty. | Attack / Health | No short text (the card showed the long editor help). |
| `sociable` | Sociable | +1/+1 for each ally within 2 slots of it, and +1/+1 more when all 4 are filled. | Attack / Health | No short text (the card showed the long editor help). |
| `coffee` | Coffee | When played, Wait −1. 1 round later it naps: Stunned for a round. | N (default 1) | No short text (the card showed the long editor help). |
| `dry` | Dry | Takes half fire damage, and Scorching days can't touch it. | none | No short text (the card showed the long editor help). "Heat" is "fire" everywhere else. |
| `natureForce` | Nature's Force | Your Elementals get +1/+1. | N (default 1) | No short text (the card showed the long editor help). |
| `lightning` | Lightning | When played, deal 1 damage to a random enemy unit (the castle if there are none), +1 for every 4 Prayer. | N (default 1) | Says it hits the castle when there are no units (as the engine does). |
| `retribution` | Divine Retribution → Retribution | When one of your units dies, deal 1 damage to a random enemy unit. | N (default 1) | Simpler name. |
| `satiety` | Satiety → Well Fed | At full Health, gains +1 max Health every upkeep. | N (default 1) | Plain name (the old help already said "Well fed"). |
| `esprit` | Esprit | +1/+1 whenever another ally enters play. | Attack / Health | No short text (the card showed the editor help). |
| `stunOnHit` | Stun | Its hits have a 50% chance to Stun. | N (default 1) → N (default 50) | It is a %: a new row starts at 50, not 1. Saved cards keep their value. |
| `reflect` | Reflect | 50% chance to throw a melee hit's full damage back at the attacker. | N (default 1) → N (default 50) | It is a %: a new row starts at 50, not 1. Saved cards keep their value. |
| `durian` | Durian | Every round, last: 1 in 2 it eats a durian for Thorns +1 (stacks). | none → N (default 1) | New amount. Old Durian (on/off) is Durian 1, as before. |
| `freeze` | Freeze | Its hits have a 50% chance to Freeze the target for 2 rounds. | Timer / Damage → Chance % / Rounds | Had no card line at all. The editor labelled its numbers "Timer / Damage". |
| `sleep` | Sleep | Its hits have a 50% chance to put the target to Sleep for 2 rounds. | Timer / Damage → Chance % / Rounds | Had no card line at all. The editor labelled its numbers "Timer / Damage". |
| `blind` | Blind | Its hits have a 50% chance to Blind the target for 2 rounds. | Timer / Damage → Chance % / Rounds | Had no card line at all. The editor labelled its numbers "Timer / Damage". |
| `tipsy` | Make Tipsy | Its hits have a 50% chance to make the target Tipsy for 2 rounds. | Timer / Damage → Chance % / Rounds | Had no card line at all. The editor labelled its numbers "Timer / Damage". |
| `confuse` | Confuse | Its hits have a 50% chance to Confuse the target for 2 rounds. | Timer / Damage → Chance % / Rounds | Had no card line at all. The editor labelled its numbers "Timer / Damage". |
| `shock` | Shock | Its hits have a 50% chance to Shock the target for 2 rounds. | Timer / Damage → Chance % / Rounds | Had no card line at all. The editor labelled its numbers "Timer / Damage". |
| `stagger` | Stagger | Its hits have a 50% chance to Stagger the target for 2 rounds. | Timer / Damage → Chance % / Rounds | Had no card line at all. The editor labelled its numbers "Timer / Damage". |
| `chained` | Chained | Can't attack until one hit deals it more than 3 damage. | pick a condition + N | Had no card line at all. Editor help had engine jargon. |
| `revive` | Revivificated → Revive | The first time it dies, it comes back with 1 Health and no statuses. | none | Simpler name. Had no card line at all. |

## Evergreen skills (26 changed)

| Skill key | Old name → New name | New card text | Params (before → after) | Notes |
|---|---|---|---|---|
| `converge` | Converge | When it becomes Ready, the enemy's units close their gaps toward the centre. | pick: Enemy board, Your board, Both boards | No short text (the card showed the long editor help). |
| `sprout` | Sprout | When it arrives, a 1/3 Growth Sprout sprouts beside it. | N (default 1) | Grammar ("a Sprout sprouts"). |
| `charge` | Charge | Once it is Ready, a clock counts down every upkeep; at 0 its effect happens and the clock starts again. | N, action amount who sub | No short text (the card keeps its own "Charge N - …" line). |
| `rainmaker` | Rainmaker | When played, Spring Rain falls for 3 rounds (every unit heals 2 a round). | N (default 1) → N (default 3) | A new row starts at 3, the engine's own default. Says what Spring Rain does. |
| `snipe` | Snipe | While Ready, if nothing faces it, shoot a random enemy unit for 1 every upkeep. | N (default 1) | No short text (the card showed the long editor help). |
| `rocket` | Rocket | Once, when Ready: a rocket hits the enemy unit with the most Attack for 1 fire damage, and 1 to the units beside it (the castle if there are none). | N (default 1) | No short text (the card showed the long editor help). |
| `landslide` | Landslide | When it dies, deal 1 damage to the enemy facing it and the enemies beside that one (not Flying). | N (default 1) | No short text (the card showed the long editor help). |
| `pounce` | Pounce | When played, deal 1 damage to the enemy facing it (or the nearest), or the castle if there are no targets. | N (default 1) | Text was wrong: since 10-15 it hits the unit facing it first, not a random one. Now differs from Skyfall. |
| `arrow` | Arrow | While Ready, shoot the enemy facing it (or the nearest) for 1 damage every upkeep. | N (default 1) | Says the fallback target (the nearest). |
| `fireArrow` | Fire Arrow | While Ready, shoot the enemy facing it (or the nearest) for 1 fire damage every upkeep. | N (default 1) | Says the fallback target (the nearest). |
| `iceArrow` | Ice Arrow | While Ready, shoot the enemy facing it (or the nearest) for 2 cold damage every upkeep; 1 in 2 it Freezes. | N (default 2) | Text was wrong: it aims at the unit facing it first, like Arrow. |
| `twinShot` | Twin Shot | While Ready, shoot two random enemy units for 2 damage each every upkeep. | N (default 2) | "every upkeep", like the other shots. |
| `volley` | Volley | While Ready, every other upkeep, shoot every enemy unit for 1 damage. | N (default 1) | "every other upkeep", like the other shots. |
| `fireBolt` | Fire Bolt | While Ready, spit fire at the enemy facing it (or the nearest) for 2 fire damage every upkeep. | N (default 2) | "facing it" / "every upkeep", like the arrows. |
| `acidBolt` | Acid Bolt | While Ready, spit acid at the enemy facing it (or the nearest) for 2 acid damage and 1 Corrode every upkeep. | N (default 2) | "facing it" / "every upkeep", like the arrows. |
| `poisonBolt` | Poison Bolt | While Ready, spit venom at the enemy facing it (or the nearest): 2 Poison every upkeep. | N (default 2) | "facing it" / "every upkeep", like the arrows. |
| `iceBolt` | Ice Bolt | While Ready, spit ice at the enemy facing it (or the nearest) for 2 cold damage every upkeep; 1 in 2 it Freezes. | N (default 2) | "facing it" / "every upkeep", like the arrows. |
| `shockBolt` | Shock Bolt | While Ready, spit a spark at the enemy facing it (or the nearest) for 2 damage; it is Shocked for a round. Every upkeep. | N (default 2) | "facing it" / "every upkeep", like the arrows. |
| `fireball` | Fireball | When Ready: a fireball hits a random enemy unit and the units beside it for 15 fire damage each. | N (default 15) | "fire damage" so it highlights. |
| `chilli` | Chilli | When first Ready, eats a chilli: +2 Attack and its attacks deal fire damage, but it takes 1 damage every upkeep. | N (default 2) | Wording. |
| `spitfire` | Spitfire | While Ready, spit 2 fire damage at a random enemy unit every upkeep; 1 in 2 it also burns one beside it for 1. | N (default 2) | Adds the 1-in-2 splash the engine does. |
| `trap` | Trap | When played, trap the empty enemy slot facing it: the next card played there takes 5 damage. | N (default 5) | Says "damage". |
| `explode` | Explode | In 2 upkeeps it explodes once: 6 damage to the enemy facing it, or the castle if there is none. | Timer / Damage | Had no card line in this style ("Explode (Timer, Damage)" in the name). Hover labels Timer / Damage. |
| `paralyze` | Paralyze | Its hits have a 50% chance to Paralyze the target for 2 rounds. | Timer / Damage → Chance % / Rounds | Had no card line at all. The editor labelled its numbers "Timer / Damage". |
| `render` | Render | When played, the enemy facing it loses 1 Attack. | N (default 1) | Card line now named like other skills ("Render 2 — …"). |
| `onDeathSpawn` | Progeny | When it dies, 3× Worker Ant take its place. | card + count | Card line now named like other skills ("Progeny — …"). |

## Not changed, on purpose

- **"Diurnal – { }", "Nocturnal – { }", "Tide – { }, { }", "Full Moon – { }" and "Bloom (conditions)"** keep their braces / brackets: that is the format you set for the advanced forms (10-14, 10-15), and the card fills them in ("Diurnal – {Evasive}").
- **Crepuscular, Diurnal, Nocturnal, Meiosis, Purblind, Scatterbrained, Esprit, Changeling** are your own names; left alone.
- **Pounce and Skyfall** were the same skill on paper; they differ now that the text is true (Pounce: the unit facing it; Skyfall: random).
- **Fester vs Festering:** Festering is now called **Lingering** (statuses don't wear off while it's on the field). Fester keeps its name, beside Rupture.
- **Haste, Keen Eye, Shield Call, Pack Leader, Timber / Rock-solid / Iron-will** have fixed numbers in their rule; they read fine as one-word skills, so no amount was added.
- **The "Test: Revivificated" card** keeps its name (a test card).

## Kept as is (151)

Absolute Zero, Ambush, Armor, Avalanche, Backstab, Banana, Bananarang, Berserk, Bleed, Bloodlust, Bloom, Bloom (conditions), Bludgeon, Boomerang, Brood, Bulldoze, Bulwark, Changeling, Cleave, Core Evil, Corrode, Cower, Crab Claws, Crit, Crystallise, Cure, Darksight, Daunt, Decay, Demolisher, Desecrate, Dictator, Diurnal – { }, Dragon Lightning, Drunk, Earthquake, Electricity, Evasive, Expose, Fast Forward, Feeble, Fencing, Fester, Festering, Flying, Fork, Fragile, Frenzy, Friction, Frostbite, Full Moon, Full Moon – { }, Gash, Ghost, Growth, Guardian, Haste, Healing, Heavy Metal, Ichor, Illuminate, Immolation, Inherent Darkness, Inspiring, Invincible, Invisible, Iron-will, Irradiated, Keen Eye, Keen Sense, King Slayer, Lumberjack, Meiosis, Meteor, Midas Touch, Mighty, Molting, Momentum, Moonborn, Moonpull, Mountain Climber, Natural Leader, Nocturnal – { }, Nova, Nullify, Nursing, Octolash, Pack Leader, Perforate, Pierce, Pitchfork, Poison, Poison Gas, Prayer, Predator, Prey, Primed, Psychic, Puncture, Purblind, Quick, Rage, Rainrunner, Reach, Recoil, Regeneration, Reload, Remember, Restless, Rock-solid, Rupture, Sacrifice, Scare, Scatterbrained, Shade, Shadow, Shell, Shield, Shield Call, Siege, Skyfall, Slash & Burn, Smoke Bomb, Sonar, Speed, Spiteful, Stampede, Stealth, Strangle, Sturdy, Supreme, Supreme Tide, Swift, Swipe, Tangleweed, Taunt, Thorns, Tide, Timber, Tornado, Toxin, Trident, Tsunami, Twin, Twin Strike, Venomous, Wave, Weaken, Wilting, Wither, Worship
