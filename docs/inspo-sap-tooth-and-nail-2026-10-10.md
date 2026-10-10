# Inspiration: Super Auto Pets and Tooth and Nail units (2026-10-10)

From the unit screenshots you shared. Both games show a fighter as a **creature first, card second**: there's no frame doing the talking, the animal's silhouette does. Bramblewood keeps its cards (the deck-builder needs them), but the board can borrow a lot of that readability.

## What makes their units read so well

| What they do | Why it works | Bramblewood version |
|---|---|---|
| **One bold silhouette per unit**, flat colour, thick dark outline, same viewing angle for everyone | You can tell 6 units apart at a glance from across the table, even at phone size | A PixelLab style rule: every board portrait gets a 2 px dark outline and a consistent ¾ view facing the enemy row. Add it to `docs/art-style-prompts.md` for the next art batch |
| **Two big stat numbers under the unit**, attack and health, in their own coloured badges | The only numbers that matter in a fight are the biggest things on screen | Already close (⚔ and ❤ pills). Make them about 15% larger on the board than in the hand, and keep everything else (badges, wait) smaller than them |
| **Abilities as a tiny icon, not text** | The board stays calm; you read the details on hover | Already the direction (ability badges, the new 👢 Quick and stacked shields). Keep pushing: one glyph per skill, details only in the card popup |
| **Level pips / experience under the stats** | Growth is visible without opening anything | Card levels could show as 1–3 small pips under the stat row on the board (ties into the card-level plan) |
| **Held item shown in a corner bubble** | An extra modifier is visible but clearly separate from the unit | Shrines, curses and the new bounty bubble already work this way. Rituals and buffs from leaders could use the same corner bubble |
| **Units bounce and squash when hit or buffed** | Every change has a physical reaction, so you never miss it | Already partly there (hit shake, castle tiers). A small squash on a buff (+N) would be new and cheap |
| **Faint / death is quick and final** | The board is never cluttered with leftovers | Matches today's flat flip; keep it short |

## Not borrowing

- **Shop-phase drafting between rounds.** Bramblewood's economy is Lumber and the hand, not a between-rounds shop.
- **Unit-only boards with no cards at all.** The card is the collection object here: foils, rarity borders and levels live on it.

## Suggested next steps (small to big)

1. Bigger board stat numbers than hand stat numbers: CSS only, about an hour.
2. A squash-and-stretch reaction on buffs: about half a day, in the effects engine so the Effects Lab gets it too.
3. A style rule for outlined, same-angle portraits in the next art batch: a prompt change, no code.
4. Level pips on board cards: after the card-level plan is decided.

_Note: after a context reset the screenshots were no longer viewable, so this sheet sticks to the patterns those games are known for rather than quoting specific units._
