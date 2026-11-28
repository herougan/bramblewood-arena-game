# CARDDESIGN2 (2026-11-28): eleven cards get a decision (design only)

Owner 11-28: cards much more strategic, diverse and fun across Maps 0-20. Proposal only: no data, list or code changed. Card stats are the owner's call. The engine and `docs/decisions.json` win over this page.

How the cards were chosen: the re-rate's far-over and far-under cards (`docs/balance/card-rerate-2026-11-28.md`, `bal25/card-power.json`), crossed with cards that have no skill or one flat skill, two cards doing one job, or a wall that is a wall only because the stats fit. Skipped: everything ARCHETYPES1 and CARDVET1a/b/c already propose (ARCH1-1 glass cannons, ARCH1-2 On Death carriers, ARCH1-4 pack reactives, ARCH1-6 Gilded Roadwarden), starters and babies (vanilla by rule), and row carriers whose row would lose its skill (`docs/map-skill-table.md`).

Budget = `tools/skill_costs.js` `budget()` cap 1 at Level 1 (L10 where it moves). I ran it from a scratch script on the proposed effects. Nothing was simulated. Every skill below is built (`bramblewood-engine.js` action or passive). One form is held by SKILLS3-3.

## The eleven

| # | Card (where; A/H Wait) | Today; why it's dull | Redesign (built pieces) | The decision it gives | Role | Stats | Budget L1 |
|---|---|---|---|---|---|---|---|
| 1 | Elder Willow (Map 0 Special; 0/36 W5) | Forestry 1. Power 35 under. A tree that pays 1 Lumber after 5 rounds | Forestry 1 + ✅ On Ready: 3 Shield to every ally (`grantShield allies`) | Play it 5 rounds before the foe's big turn. The foe sees the canopy coming and can strike early | Protection, forecast (A7 from Map 0) | keep | 88 → 92% |
| 2 | Shellwright Apprentice (pack, Map 5; 2/8 W1) | Fortify +1 bramble Armor. The most over (+59), and passive | ⬆️ On Play: Grant Armor 2 to an ally beside it (`grant`, `skill: armor`) | Sequencing: play the carry first, then the Apprentice beside it | Engine (protection) | keep | 129 → 99% |
| 3 | Chipmunk Hoarder (Maps 11, 12; 2/5 W1) | Forestry 1: the fourth Forestry 1 body (Muskrat and Nutria carry Map 5's row) | 💀 Hoard: gain 2 Lumber and draw 1 (`onDeath` gain + drawCard) | When to trade it: let it die the round the Lumber buys your leader or big card. The mid-game form of ARCH1's Cache | Value over time, death fodder (A5) | keep | 96 → 87% |
| 4 | Wild Yak (Map 11; 5/29 W5) | Daunt 2 (25 under). A wall by stat fit. F2's Wait 5+ row is empty | Daunt 1 + ✅ On Ready: +1 Wait on every enemy unit (`addWait`, `sub: all`) | The Yak player lines up a big swing for the round after. The foe, seeing W1, readies what it can first | Forecast payoff | 5/28 to fit | 93 → 101% |
| 5 | Gila Monster (Map 11 Special; 1/17 W1) | Bleed 2; Poison 1 at L6. The same 1/17 Bleed 2 body as #6 | Poison 2 (the venom is chewed in); L6 💀 Poisonous 2 (ENG33, on no card) | Kill order: the foe chooses which unit eats 2 Poison for killing it | Reactive, attrition (A6) | keep; flavour reword | 97 → 96% (L10 108%: thin a late step) |
| 6 | Ice-Crevasse Wolf (Maps 17, 18; 1/17 W1) | Bleed 2; Momentum at L3. Twin of #5. Map 17's Momentum row has no carrier (🟥) | Bleed 1 + Momentum 1 from Level 1; Momentum 2 at L7 | Lane: face a unit that Bleed plus a 1-point bite can finish. Each kill grows it | Value over time (snowball) | keep | 98 → 96% |
| 7 | Cunning Vixen (Maps 12, 14; 1/12 W1) | Stealth (28 under): 1 bramble chip a swing. Must keep Stealth (Map 12 row) | Stealth + ⚔️ On Attack: gain 1 Lumber (Forager Ant's trigger). The L5 Evasive goes (two skills) | Lane: Stealth never fights the unit facing it, so put the 12-Health body where it soaks. Then spend what she steals | Value over time (Lumber for leaders, LEAD-4) | keep | 92 → 97% |
| 8 | Alpine Marmot (Map 12; 2/8 W1) | Guardian + ⬆️ 2 Shield every ally: the same On Play as Hedgehog Matron. Both far over (+39, +37) | Guardian + whenever an enemy unit becomes Ready, the ally facing it gets 3 Shield (`onEnemyReady` + `shield`, `sub: subjectFacing`: ARCH1's R4, on a card already listed) | Lane: put soft units opposite the foe's Wait-1 units. The foe may hold a unit back | Reactive answer that fires by itself | keep | 99 → 86% |
| 9 | Caldera Snow Leopard (Map 19; 3/13 W1) | Pounce 3: the same as Giant Cave Huntsman (3/14 Pounce 3, Map 8) | Ambush 3 (Map 15 row): strikes whatever enters the slot facing it | Lane: face an empty slot the foe must fill, or a lane a push will move into | Reactive answer | keep | 98 → 92% (L10 104%: thin a late step) |
| 10 | Pinecone Sapper (Maps 16, 17, 19; 0/15 W1) | Sturdy. A wall whose flavour ("a very short fuse") promises a blast | Sturdy + Dynamite 2/4: at the 2nd upkeep, 4 fire to the units beside it (yours too) and the three foes facing it; goes out if it dies first | Placement: empty slots beside it, or units that can take 4. The foe decides whether to break a Sturdy 0/15 before the fuse | Pressure on a clock | 0/14 to fit | 89 → 101% |
| 11 | Quillguard (Maps 12, 18, 19; 2/18 W2) | Thorns 2; L5 Bulldoze (+32 over). A Thorns wall with no choice in it | Thorns 2; L5 💀 Rend 1 on every unit beside or facing it, yours too (`rend`, `when: death`, `who: around`) | Placement and the kill: keep your carries out of its row, and the foe chooses the round it breaks | Reactive, positional | keep | 99 → 99% (L10 99 → 92%) |

Counts: roles are 2 engine / protection, 3 value over time, 1 pressure, 4 reactive, 1 forecast payoff. Nine keep their stats, two lose 1 Health (owner's call). Two far-over cards come down without stat cuts (#2, #8). Map 17's empty Momentum row gets a carrier (#6).

Road: ten of the eleven are on Maps 0-20 lists or Specials (Maps 0, 11, 12, 14, 16-19), so road fights move. Only #2 is pack-only. The balance analyst re-measures before any of this is applied.

CPU (CPU2): #1, #2, #4, #6-#10 fire by themselves, so the Basic CPU plays them as well as it plays anything. #3, #5 and #11 are death-timing cards: the CPU only plays them, or plays around them, well once CPU2-2 is in.

## Duplicates that need a new skill (not proposed above)

| Group | Shared role | Rule it would need |
|---|---|---|
| Pine Marten (Map 13), Fishing Cat (Map 9): 1/14-1/15 Pounce 3 | ARCH1's "removal on a wall" | Pounce only into a Wet or Waiting target (a conditional Pounce) |
| Owl Nightwatch (Map 13 Special), Hush-Wing Spy (pack), Fawn Scout: Stealth flyers | the same bramble chip | Stealth that ends after its first bramble hit |
| Bombardier Beetle, Marine Iguana: 3/10-3/11 Cinder bolts, Map 20's two Cinder carriers | the same shot | 🛡 On Attacked: Cinder at the attacker. I found no attacker target for On Attacked in `resolveGeneralTarget0`, so this probably needs engine work |

## Owner decisions (proposed; `docs/decisions.json` not edited)

```json
[
  {"id": "CARDDESIGN2-1", "status": "YET", "kind": "Decide", "area": "Cards", "group": "game", "asked": "2026-11-28", "source": "CARDDESIGN2 (docs/design/carddesign2-2026-11-28.md)", "title": "Eleven card redesigns that add a decision", "body": "Eleven dull or duplicate Maps 0-20 cards get a timing, lane or kill-order choice from built skills. Nine keep their stats; Wild Yak and Pinecone Sapper lose 1 Health to fit. Ten are on road lists, so road fights move and get re-measured.", "options": ["a) All eleven", "b) The eight that need no CPU change", "c) None"], "default": "a"},
  {"id": "CARDDESIGN2-2", "status": "YET", "kind": "Decide", "area": "Cards", "group": "game", "asked": "2026-11-28", "source": "CARDDESIGN2 (docs/design/carddesign2-2026-11-28.md)", "title": "💀 Rend on Quillguard (Map 12)", "body": "At Level 5, Quillguard dying puts Rend 1 on every unit beside or facing it, yours too. The form is built but held off Maps 0-20 by SKILLS3-3. This lifts the hold for this one form, as ARCH1-3 does for Brace.", "options": ["a) Lift it for Quillguard", "b) Keep the hold (Quillguard keeps Bulldoze)", "c) Lift all 💀 forms (SKILLS3-3 b)"], "default": "a"},
  {"id": "CARDDESIGN2-3", "status": "YET", "kind": "Decide", "area": "Cards", "group": "game", "asked": "2026-11-28", "source": "CARDDESIGN2 (docs/design/carddesign2-2026-11-28.md)", "title": "Bring far-over cards down by redesign", "body": "Shellwright Apprentice (+59) and Alpine Marmot (+39) swap a flat passive for a placed effect: an Armor grant to one neighbour, and a Shield on the ally facing each foe that readies. Both land at 86-99% of budget with their stats kept.", "options": ["a) Redesign both", "b) Keep the skills, trim stats", "c) Leave both"], "default": "a"},
  {"id": "CARDDESIGN2-4", "status": "YET", "kind": "Decide", "area": "Engine", "group": "game", "asked": "2026-11-28", "source": "CARDDESIGN2 (docs/design/carddesign2-2026-11-28.md)", "title": "Three new rules for duplicate cards", "body": "Three duplicate groups need a new rule: Pounce only into a Wet or Waiting target (Pine Marten, Fishing Cat), Stealth that ends after its first bramble hit (the Stealth flyers), and On Attacked aimed at the attacker (Bombardier Beetle). Each is a small engine item.", "options": ["a) All three", "b) Timed Stealth only", "c) Not now, after ARCH1-5"], "default": "c"}
]
```
