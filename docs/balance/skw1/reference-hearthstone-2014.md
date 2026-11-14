# Reference: launch Hearthstone (2014) as a trigger x action model

Credit: the owner's note of 2026-11-14 11:25 (from a web search), passed on for package SKW1 Part B. Kept as a model for decoupling triggers from actions; not a Bramblewood rule.

## 15 keywords
- Passive / combat: Taunt, Charge, Divine Shield, Stealth, Windfury, Spell Damage.
- Triggered: Battlecry, Deathrattle, Enrage, Combo, Secret.
- Active / status: Silence, Freeze, Choose One, Overload.

## Event triggers
- Turn: start of turn, end of turn.
- Card play: any card, spell cast, minion played.
- Board: summoned, dies.
- Combat: attacks, takes damage, deals damage.
- Resources: card drawn, mana locked.

## Atomic actions
- Deal damage, restore Health, destroy.
- Modify stats, set stats, grant / remove a keyword.
- Summon, bounce, transform, steal.
- Draw / discard, generate / copy, gain / lock mana.

## The owner's point
About 12 triggers x 12 primitive actions gives 120+ distinct skills from two small tables.

Bramblewood's own tables, counted, are in `docs/balance/skw1/skw1-2026-11-14.md` (section "Bramblewood's trigger and action tables").
