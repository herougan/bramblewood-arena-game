# Bramblewood Arena — Testing Strategy (2026-10-03)

How to test card-vs-card interactions, two-player interactions, and multi-player offline modes (Async Arena, Raid). The aim is auto setup and auto test. Everything below is built and runs today:

```
tests/run-all.sh          # ~15 s, engine level, no browser
tests/run-all.sh --e2e    # + two real browser pages playing a live match (~1 min)
```

All suites use the real engine (`bramblewood-engine.js`) and real card data (`canonical/cards.json`). Everything is seeded, so the same inputs always give the same fight. That determinism is what makes snapshot (golden) testing work.

## The test pyramid

| Layer | What it proves | Speed | File |
|---|---|---|---|
| Card-vs-card matrix | No card pairing crashes, breaks an invariant, or behaves non-deterministically; any change in how two cards interact shows up as a diff | 4 s sampled, 16 s full | `tests/card-matrix.js` |
| Mechanic scenarios | Every card's effects actually do something; core rules hold exactly | 1 s | `tests/scenarios.js` + `tests/scenarios/*.json` |
| Two-player (engine) | Two independent seats: legality, fairness, replayability | 3 s | `tests/two-player.js` |
| Multi-player offline | Async Arena ghost pools per win stage; Raid party and shared pool | 3 s | `tests/async-raid.js` |
| Two-browser live match | The real host/peer code paths over a relay | ~1 min | `tests/e2e/live_two_player.py` |
| User-story walk | The 54 stories in `user-stories.md`, in a real browser | manual or agent run | Playwright scripts |

## 1. Card-vs-card interactions (auto setup + auto test)

**Auto setup.** There are no hand-written fixtures. Pairings are generated from the card list:
- **Duels:** every fieldable card vs every other (`--full`, 77k fights), or each card vs 40 others (default).
- **Squads:** 3v3 boards across lanes and both battle modes, which covers Guardian, Sweep, Rally and area effects.
- **Matches:** full 20-card matches, with the engine AI on both seats.

Seeds come from the card ids, so a new card gets its fights automatically.

**Auto test, three layers:**
1. **Invariants after every round.** No NaN or negative HP or attack. No dead card left on the board. No duplicate uids. No negative resources. No exceptions.
2. **Determinism.** A sample is replayed with the same seed and must match exactly.
3. **Golden signatures.** Each fight's winner, rounds, final HPs, event histogram and an event-order hash are stored in `tests/golden/card-matrix.json`. After any engine or card change, the run lists every fight that changed. Expected changes are accepted with `--update`; unexpected ones are bugs.

**Mechanic scenarios.**
- **Auto "every effect does something".** Each card with effects is fought as-is and with its effects stripped, in six small contexts (attacker, blocker, 3-wide line, each also with ×5 health). If nothing differs, the effect is dead data. The core keywords (poison, thorns, flying, guardian, sweep and others) fail the run; the rest are listed for review.
- **Hand-written JSON scenarios.** Exact setups with expectations (event counts with field filters, winner, castle HP bounds, cards alive). Writing one is about five lines, and the format is documented at the top of `scenarios.js`. Fifteen exist today: core rules plus Rend, Grit, On Kill, and Swap.

**Results today.**
- 0 failures across 81k fights.
- 155 sampled stalemates (957 in the full run) are listed for design review. They're mostly armor walls (Barnacle Fortress, Termite Mound, Stalactite Golem) that low-attack cards can never get through.
- 4 effects have no scenario yet: King Maker (kingSlayer needs a King on the board), Nest, Pack Rat Looter, and Wandering Traveller.

## 2. Two-player interactions

**Engine level (`two-player.js`).** Each seat is driven by its own scripted policy, not the shared AI: greedy, tempo, random, and a cheater that tries to play twice in one turn. Both seats plan, then one combat resolves, the same order used by Pass & Play, Live Ranked and friend invites.
- **Every policy pairing:** invariants hold, the hand never exceeds 5, and illegal actions are refused.
- **Seat fairness:** mirror decks and mirror policies over 400 matches; seat 1 must win 42–58% of the decided matches. Today it's 48.5%.
- **Replay:** re-running a match from its recorded actions on a fresh engine gives the identical end state. Live Ranked depends on this, because the host replays the peer's intents.

**Browser level (`e2e/live_two_player.py`).** Two separate browser contexts, so two players with separate storage, both run the real `index.html`. Supabase is replaced by `e2e/mock-relay.js`, and the test script relays realtime broadcasts page to page, so the real code paths run unmodified (`enterLiveMatch`, intents, state snapshots, abandon). It checks:
- seat and role assignment;
- after every round, the peer's mirror equals the host's state (round, both castles, both boards);
- both pages agree on the winner;
- a peer leaving tells the host.

**Next steps for two-player:**
- Run the same script against a Supabase branch database to test the real RPCs (`find_ranked_match`, the friend-invite RPCs once the social migration is applied).
- Add a "slow network" mode to the relay (delayed or reordered messages) to test races between an intent and a state broadcast.

## 3. Multi-player offline: Async Arena

**Model** (`bramblewood-ghosts.js`, shared by the game and the tests):
- A run is up to **7 wins** and ends at **3 losses**.
- Your **win stage** is your wins so far in the run.
- At each stage you fight a **ghost**: a snapshot of a deck that also won at that stage, played by the AI.
- Each stage needs at least **12 active decks**. Active means recorded in the last 14 days, the newest deck per player, and a legal deck.
- Real recorded decks are topped up with **seeded ghost decks** generated for that stage. Seeded decks are drawn from a power band that rises with the stage and rotate weekly.
- Your own winning deck is recorded at the stage where you won.

**Auto setup (population sim).** 40 synthetic players play 80 full runs headlessly and record their winning decks, exactly as real players would. After the sim, every stage has a real pool:

| Stage | 0 | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|---|
| Real decks | 36 | 31 | 25 | 19 | 15 | 13 | 9 |
| Seeded top-up | 0 | 0 | 0 | 0 | 0 | 0 | 3 |

That shows how pools fill naturally, and that the top-up only kicks in where real decks are thin.

**Auto test.**
- Every stage has ≥ 10 (target 12) legal decks with no duplicate owners.
- Ghost strength rises with the stage. In real fights, top-stage ghosts beat bottom-stage ghosts 92% of the time; the check requires ≥ 65%.
- Stale, illegal, other-stage and duplicate-owner decks never leak into a pool.
- A player never meets the same ghost twice in a run.
- Every run ends correctly.

**Today the pool is local** (this browser's recorded decks plus seeds). To share real decks between players, add a cloud `async_ghosts` table (owner, stage, deck, recorded_at), write to it on each win, and read the newest per owner per stage. The rules and the tests stay the same.

## 4. Multi-player offline: Raid

**Model:**
- One featured boss per week, rotating through the 13 bosses in `canonical/raid-bosses.json`.
- The boss has a shared HP pool (its HP × 8).
- Loading the raid pulls in the decks that already fought it this week, with their real damage. For now these are your recorded attempts; the online `raid_attempts.deck_snapshot` rows can feed in the same way.
- Eight seeded stand-in raiders also fight, simulated with the real engine and together capped at 50% of the pool.
- Stand-ins are fixed for the week, so the pool only ever goes down.
- Your fight is against a boss castle of min(remaining, boss HP); your damage comes off the pool, and your deck joins the party.

**Auto test.**
- Weekly rotation works, and every boss deck uses real cards.
- Raid state is deterministic.
- Pool math: max − total damage = remaining.
- This week's decks for this boss only appear in the party.
- A real attempt lowers the pool by exactly its damage.
- The pool is monotonic across 12 added attempts.
- Stand-ins never take more than half the pool, for every boss.

## 5. User-story walk

`user-stories.md` lists 54 stories with acceptance criteria. Walking them was done with Playwright (scripts in the session scratch). The plan is to turn the most valuable stories into a permanent `tests/e2e/stories.py`, one function per story. Candidates:
- US-02 tutorial
- US-07 resume
- US-13 quit everywhere
- US-17 to 21 Conquest loop
- US-25 Async run
- US-29 and US-30 Raid
- US-32 deck gate
- US-48 no horizontal scroll

## 6. When to run what

| When | Run |
|---|---|
| Every engine or card change | `tests/run-all.sh`. Golden diffs show exactly which interactions changed. |
| Before deploy | `tests/run-all.sh --e2e` |
| After balance work | `node tests/card-matrix.js --full`, then review stalemates and diffs |
| CI (future) | A GitHub Action running `tests/run-all.sh` on every push (needs Node only; `--e2e` needs Playwright and Chromium) |
