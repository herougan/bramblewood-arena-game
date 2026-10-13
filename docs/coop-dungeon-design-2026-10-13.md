# Co-op Dungeon: up to 4 players, simultaneous (D49, draft 2026-10-13)

**Your brief:** a new multiplayer dungeon for up to 4 players who play at the same time, not in turns. Two rows, each split left and right; the two players on a row share the middle cells of that row. The Raid stays as it is (the PC plays it).

## Board

```
            ENEMY (dungeon)                 the dungeon's own two rows face the party
   ┌───────────────────────────────────────┐
   │  e  e  e  e  e  e  e  e  e  e  e  e   │
   ├───────────────────────────────────────┤
   │  A  A  A  A [S1 S1] B  B  B  B        │  Row 1: Player A (left), Player B (right)
   │  C  C  C  C [S2 S2] D  D  D  D        │  Row 2: Player C (left), Player D (right)
   └───────────────────────────────────────┘
```

- Each row has 10 cells: 4 for the left player, 4 for the right player, and 2 shared cells in the middle.
- Row 1 is the front: it fights the enemy directly. Row 2 is the back: Arrow, Snipe, Reach and support skills work from there, and it steps up to fill a front cell when one empties (the existing Dig In / back-row rules).
- **Shared cells:** either player on that row can play into them. The first to commit takes the cell for that round. Buffs that say "allies" count all four players' units, so Kinship and Sociable get stronger in co-op.
- With 2 or 3 players: 2 players take one half of each row (A and C) and the AI fills nothing; the empty halves are blocked ground. 3 players: B's half is a computer ally on Easy.

## Simultaneous turns

1. **Plan (30 seconds):** every player picks their play at once. A shared cell shows a faint hand icon when a partner is hovering it.
2. **Lock:** a player's play locks when they press Ready or the timer runs out (no play = pass).
3. **Resolve:** all four plays land together in a fixed order (A, B, C, D, then the dungeon), then combat runs exactly like a normal round.
4. If two players commit to the same shared cell, the one who locked first gets it; the other card returns to hand with no cost spent.

Each player has their own deck, hand, Lumber and Wait. The party shares one castle health pool (sum of four castles, scaled down).

## The dungeon side

- Built like a raid boss, with HP bars, plus waves of adds across the enemy row.
- Scales with party size: Health ×1, ×1.7, ×2.3, ×2.8 for 1–4 players.
- Each floor has a mechanic that needs coordination, for example "the boss hits the row with the most units" or "the shared cells are cursed this round".

## Netcode (fits what exists)

The Ranked Live match already syncs two players through a host. Co-op extends it:

- One host (the room creator) owns the random seed and runs `resolveRound`; the other three send their locked plays.
- State goes out as the existing full snapshot after each resolve, so a dropped player can rejoin.
- New table needed later: `coop_rooms` (room id, host, seats, deck per seat, state). That is a live Supabase change, so it waits for "apply it".

## Rewards

Every player gets the floor's reward chest. The last floor gives a pick of three from a co-op-only card pool, so the mode has its own reason to play.

## Open questions

1. Plan timer: 30 seconds, or longer for casual rooms?
2. Shared castle, or one castle per player where losing yours makes you a spectator?
3. Matchmaking: friends-only rooms first, public queue later?

## Answers (closed 2026-10-14, D76)

1. Plan timer: 30 seconds, 60 in casual rooms.
2. One shared castle.
3. Friends-only rooms first, a public queue later.

Building starts with a 2-player version once the `coop_rooms` table is applied ("apply it").
