# Game design v39 addendum — story pass, Async Arena runs, weekly Raid, test suite (2026-10-03)

Commits c7c58a8 and e80c306 on `main`.

## Async Arena is now a run against ghost decks
- **Run:** up to **7 wins**; **3 losses** ends it.
- **Win stage:** your wins so far this run.
- **Opponent:** at each stage you fight a **ghost**, a deck that also won at that stage, played by the AI. You never meet the same ghost twice in a run.
- **Pool:** each stage keeps ≥ 12 active decks (last 14 days, newest per player, legal). Real decks are topped up with seeded ghosts drawn from a power band that rises with the stage; the seeds rotate weekly.
- **Recording:** your winning deck is recorded at that stage, so other players will meet it there once a shared cloud pool exists. For now the pool lives in this browser.
- **Rewards:** per win, 12 + 6×stage Maple Leaves and 2 + stage Dust. A perfect 7-win run adds +150 Maple Leaves and 2 Metal.
- **Arena tile:** shows the run (W–L, stage) and how many decks are at your stage.
- **Save & Exit / Continue** still works and keeps the ghost.

## Raid is offline-first, one boss per week
- **Boss and pool:** the featured boss rotates weekly through the 13 bosses (now also in `canonical/raid-bosses.json`). Its HP is a shared pool of the boss's HP × 8.
- **Raid party:** the decks that fought it this week, with their real damage (your recorded attempts), plus 8 fixed seeded stand-ins. The stand-ins are simulated with the real engine and capped at 50% of the pool, so the pool only goes down.
- **Your fight:** costs 2⚡ and needs no sign-in. The boss castle is min(remaining, boss HP). Your damage comes off the pool and your deck joins the party.
- **Rewards:** scale with the damage you deal, plus a win bonus by boss strength.
- **Online Raid:** still available, folded under "🌐 Online Raid (needs sign-in)".

## Story-pass fixes
- **Deck gate:** one shared deck-size gate for every mode; Conquest and Raid were skipping it. Tapping a card in your deck list removes it.
- **Resume:** an unfinished fight is offered on Home (Resume / Discard), not forced.
- **Tips:** passive tips never block drops on your lane.
- **Card detail:** "Where to get it" for players, readable spawn text, and Escape closes it.
- **Arena modes:** "vs Computer" (with a VS screen) and "Pass & Play" replace "Test Battle" / "vs PC".
- **Keyboard:** hand cards are playable from the keyboard, and map nodes have accessible names.
- **Faction picker:** a "Both" button appears after 15 s instead of auto-picking.
- **Greeting:** "Welcome back, name!" for signed-in players who skip the splash.
- **Ranked:** the guest gate uses the sign-in modal.

## Tests
`tests/` holds a headless suite covering the card matrix with golden snapshots, mechanic scenarios, two-player policies, and Async/Raid, plus a two-browser live match test. See `testing-strategy.md`.

## Decisions (answered 2026-10-03)
- **Async Arena:** splits into two modes, both designed in `MASTER.md`. **PvP** spends 10 daily tickets against AI-piloted stranger decks, which always go first. The **Autobattler** draft run uses 5 HP and aims for 10 wins, then Endless up to round 100, with boons and CPU vs CPU fights. The 7W/3L ghost run built here is a stepping stone; its ghost pool and tests carry over.
- **Raid:** the target is async multiplayer. N rows of async decks fight a fragment of a boss with one global HP bar and stages. Everyone gets rewarded on a kill, and gets compensation if the boss survives. The weekly offline raid built here is the base for it.
- **Online Raid:** hidden (`ONLINE_RAID_VISIBLE = false`); the code is kept.
- **Armor-wall stalemates:** fine as they are.
- **New rule:** sudden death from turn 20, auto-draw when nobody can act and the board isn't changing, and forfeit (see `MASTER.md` item 3).
