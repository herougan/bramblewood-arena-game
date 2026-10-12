# Rarity, the deep-sea raid and co-op dungeons (proposal, 2026-10-12)

Three of your 20:06 ideas, each with what I'd build and the questions that change it.

## 1. Rarity: one ladder, plus flags

**Today:** one `rarity` field mixes two things:
- the power ladder (Starter, Common … Ancient, Divine);
- where a card comes from (Quest, Quest-Unique, Special, Event-Rare, Event-Legendary, Dev-Legendary, Dev-Ancient).

**Proposed:**

| Field | Values |
|---|---|
| `rarity` (the ladder only) | Base (today's Starter), Common, Uncommon, Rare, Very Rare, Super Rare, Epic, Heroic, Unique, Legendary, Mythic, Ancient, Divine |
| `flags` (any mix) | Quest, Special, Token, Event, Raid, Dev |

**Migration:**

| Today's rarity | Becomes |
|---|---|
| Quest | Uncommon + Quest |
| Quest-Unique | Unique + Quest |
| Special | Rare + Special |
| Event-Rare | Rare + Event |
| Event-Legendary | Legendary + Event |
| Dev-Legendary | Legendary + Dev |
| Dev-Ancient | Ancient + Dev |
| Today's `token` field | The Token flag |

**What the flags do:**
- The ring colour and level costs follow the ladder only.
- Flags show as small badges on the card (📜 Quest, ✦ Special, 🎟 Event, 🐙 Raid, 🧪 Dev).
- The Ledger gets a column per flag.

**Raid cards:** each raid gets its own set of 5–6 cards. They're flagged Raid, and most are raid-only (they drop from that raid's wins and appear nowhere else).

**Open:** Void and Daemonic (added today) go above Divine as further ladder steps unless you say they're flags.

## 2. The Goliath: a raid that sinks

**Today:**
- One board, three rows a side.
- The boss's column attacks are telegraphed a round ahead.
- A round cap.

**Proposed: stage 1, the descent**
- **The arms on the field:** the boss fields its parts as cards: Tentacle Arm ×2, Ink Sac and Spawn Pod, plus the cephalids it summons.
- **Depth:** the field changes every few rounds as the fight sinks deeper:

| Rounds | Depth | Effect |
|---|---|---|
| 1–3 | Shallows | Normal |
| 4–6 | Twilight | Fog: units without Flying miss 1 in 3 |
| 7–9 | Midnight | Your units lose 1 Attack; the enemy's glow |
| 10+ | The Abyss | Spawns become alien: Corrode and Confuse on hit |

- **The glow:** every 3 rounds, the boss's own parts glow (not the summoned monsters). A glowing part has +2 Attack but takes double damage until the next upkeep, so it's both a threat and an opening.

**Proposed: stage 2, the core**
- When the arms are destroyed, the Core surfaces as the boss's main unit (the castle stays the score).
- Each round it shows one of three glows, announced a round ahead:

| Glow | Effect |
|---|---|
| 🔵 Blue | Tide: the Core and its spawn take half damage; your front row gets +1 Wait |
| 🔴 Red | Fury: the Core strikes twice and hits the column attack's whole column |
| 🟢 Green | Growth: the Core heals 10 and summons a cephalid; all damage to it is doubled |

- Blue and Red reward waiting; Green rewards burst.

**Open:**
- Should stage 2 reset the round cap?
- Should the arms come back if the Core heals past half?

## 3. Co-op dungeons (2–4 live players)

**The shape:**
- 2–4 friends or guildmates join one live room.
- The dungeon is a short run (3–5 fights, then a boss).
- Players take turns, like the raid allies do today, one player's play a round. Each player brings their own deck and leader.
- Live only (no async), using the live-match code Ranked already uses.

**Energy and rewards:**
- Each player spends the same energy a normal fight of that rating costs.
- Rewards are the normal fight rewards plus a small co-op bonus: +5% for an A, +8% for an S. That stays under your 10%, so solo players never fall behind.

**First clears:**
- A dungeon's first S clear gives its unique craft material (one per dungeon).
- That material crafts a co-op-only card at the Blacksmith.
- After that, farming gives the material at a low rate. The Inventory holds it.

**Matchmaking:**
- A lobby on the Arena tab: "Open a dungeon" or "Join".
- Friends and guild first, then open rooms.

**Open:**
- Should co-op dungeons share the raid's three-row board (one row per player at 3p), or use the normal board with alternating plays?
- Should a disconnect let the AI play that seat?

## Order I'd build in

1. **Rarity flags.** Mostly data and display; low risk.
2. **The Goliath stage 1.** Depth fields and the glow on the existing three-row raid.
3. **The Goliath stage 2.** The Core and its three glows.
4. **Co-op dungeons.** After you've picked the board shape, since it's the biggest piece.
