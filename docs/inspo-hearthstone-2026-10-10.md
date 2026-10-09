# Inspiration: what to borrow from Hearthstone (2026-10-10)

From your screenshot. Hearthstone is the closest well-known cousin: two rows facing each other, units with Attack and Health, and a hero to protect. Here is what would carry over to Bramblewood and what wouldn't.

## Worth borrowing

| Hearthstone | Why it works | Bramblewood version |
|---|---|---|
| **Hero portrait in the middle, with HP on it** | The thing you're protecting is the biggest, most central object. Your eye always knows where the score is | Move each castle to the **centre edge** of its side of the board, larger, with its HP number on the art (today it's a small tile on the far left). Damage to it shakes the portrait |
| **Hero power beside the portrait** | A small, always-there choice each turn, so no turn is ever dead | Your **leader** sits next to the castle as a round button. Before it's summoned it's a power: a 1-Lumber leader ability once per turn (e.g. Wandering Traveller: draw a card, then discard one). Fits Caged Fight too: the button stays chained until the cage breaks |
| **Mana crystals, right side** | Resources sit in one fixed place as a row of gems, readable at a glance | Gather Lumber, Darkness and Echoes in **one resource rail** by your castle, instead of pills scattered across the header |
| **The board as a physical table** | A carved wooden frame and a textured play surface make it feel like a game, not a web page | A **wooden frame** around the arena and a mossy, cloth-like play surface. The art style (PixelLab pixel art) can take a pixel wood frame. The day/night and field effects then play on that surface |
| **Hand fanned at the bottom, overlapping** | Shows 7 or more cards in little width, and a hover lifts one card | A fanned, overlapping hand on phones, where today's hand wraps onto a second line |
| **Opponent's hand shown as card backs** | You can count their cards, which is real information | Show the enemy hand count as small fanned backs above their castle |
| **Turn button on the right edge** | One big, always-same-place "End turn" button that glows when you have nothing left to do | **Pass turn** already exists. Make it larger, pin it at the right edge, and glow it once you've no legal play |
| **Deck and graveyard as stacks** | Hover shows how many are left | Already there (the Deck tile). Keep them |

## Not borrowing

- **Mana that ramps every turn.** Bramblewood's Wait and Lumber already do this job, with more texture.
- **Taunt.** Facing lanes already decide who hits whom.
- **Random-heavy effects.** Bramblewood is calmer and readable by design (style guideline).

## Suggested order (small to big)
1. A resource rail by the castle, and a bigger Pass turn button: about half a day.
2. The castle as a centred portrait: about a day, plus phone layout checks.
3. A wooden board frame and play surface: art plus CSS, about a day.
4. Leader powers before summoning: a design call. Each leader needs one power, and it's an engine change (a new decision, D25 if you want it).
