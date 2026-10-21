# Ramming: proposal (2026-10-21, package BX)

The owner (Oct 21, item 25): "Something about ramming." Nothing here is built. These are three options to choose from. Each one reuses rules the game already has.

What the game already has:
- **Wave N** pushes the unit it hits N columns. If another unit is in the way, it crashes into it and both take N. Since package BX, a push can also go into the frontier column just past the outermost unit.
- **Charge** (`effects.charge`, with an On Charge trigger) and **Pounce** (it hits the enemy facing it as it arrives) are the "first hit" skills.
- **Sprinter** is a new tag (package BX) on the fast runners: Pronghorn Racer, Savanna Cheetah, Jackrabbit Sprinter, Frost Hare Sprinter, Snowshoe Hare, Mountain Hare and Springbok Pronker. A unit can take Dive if it is Flying, has Tide, or is a Sprinter (`diveEligible` in the engine).
- **Dive** isn't defined anywhere yet: no card, engine rule, text or doc has it (searched on 2026-10-21). Option C below suggests what it could do.

## Option A: Ram N (a charge with knockback and recoil)

**Ram N:** its first swing of the fight knocks the unit it hits back N columns. It uses Wave's push, so a unit in the way is crashed into and both take N. The rammer takes recoil equal to half the damage it dealt, rounded down. After that first swing it attacks normally.

- Built from parts that exist: an On Attack trigger, the Wave N push, and Damage on Self. It needs one new flag, "first swing only", which works like `once` but is reset when the unit is played again.
- It suits rams, goats, rhinos, boars and the Beetle Battering-Ram.
- Cost: about Wave N (once) plus a small recoil discount.
- Risk: very little new code, but a second push skill could read as the same thing as Wave. The recoil is what makes Ram different from Wave.

## Option B: Charger (a first-hit bonus for Sprinters and Divers)

**Charger N:** the first time it swings after it enters a slot (it is played, or it moves there by Restless, a push or a leap), that swing deals N more damage. If it moved two or more columns to get there, the swing also can't be dodged.

- It rewards moving, so it pairs with the Sprinter tag and with Dive. Charger could be limited to units that can take Dive, using the same rule.
- Built from parts that exist: the On Enter Slot trigger (package EQ) puts a "charged" counter on the unit, and the next swing spends it. That is the same pattern as Exploit tokens and fireHit.
- Cost: about Fire on hit N, once per slot entered.
- Risk: it needs a little UI work, a "charged" chip that disappears once the bonus is used.

## Option C: Dive N (the move Sprinters, Flyers and Tide units share)

**Dive N:** once a fight, instead of swinging, it dives onto any enemy unit: the weakest one, or the one you pick if aiming is added later. It deals Attack + N damage to that unit, then lands beside it, in the target's column on your side. A Flyer swoops in, a Tide unit rides the current, and a Sprinter dashes.

- Only units that can take Dive could have it (`diveEligible`: Flying, Tide or Sprinter).
- Built from parts that exist: the archer's turn added by package BX (On Action, which replaces the swing), the Snipe target rule and Bloodlust's leap.
- Ramming then becomes a choice of how to land: "Dive (Ram)" would also push the target back 1 when it lands.
- Cost: about Snipe N plus a free move.
- Risk: it moves units around a lot. The CPU would need a rule for when to dive, the same way it decides when to use other once-a-fight skills.

## Recommendation

Choose **Option B (Charger)** if ramming should be a passive bonus that rewards fast runners for moving. Choose **Option A (Ram)** if it should be its own visible skill. Option C works with either and also gives Dive a definition. Choosing one is the owner's call.
