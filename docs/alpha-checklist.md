# Alpha release checklist

Started 2026-11-06, at the owner's request (22:16): "Create it, assume nothing complete. Even foil distribution, pack cards, rewards, balancing, card-level balancing (not done a single time), etc."

**Status rule.** Every item starts at ☐ (not verified), even where earlier work exists. An item turns ☑ only when it has been checked against its "Done when" line, with the check named. ⚠ means checked and failing. Scope: Maps 0-20 (owner 2026-11-06, BAL17-2). The work status of each item lives here; the daily backlog stays in `docs/action-items.md`.

## 1. Cards and content

| # | Item | Done when | How we check | Status |
|---|---|---|---|---|
| C1 | Card list frozen for alpha | Every in-play card is reviewed once: name, species, rarity, skills, flavour | A list of in-play cards with a reviewed flag per card | ☐ |
| C2 | One job per card | No two in-play cards share a whole skill line | CONTENT11-1 check, re-run on the final list | ☐ |
| C3 | Art for every card | Every in-play card has approved art (no placeholders, no rejected art) | Script over cards.json plus the owner's visual pass | ☐ |
| C4 | Art for every field effect, bramble and pack | No icon-only fallbacks (17 field effects had no picture on 11-06, Windfall among them) | `FIELD_ART` against the field-effect list; pack art against pack themes | ☐ |
| C5 | Pack art matches the pack | e.g. the Rivergate pack shows a river creature, not a hummingbird (owner 11-06 #28) | Owner review of every pack face | ☐ |
| C6 | Pack contents | Every pack's card list matches its map and theme; no orphan cards (in no pack, no reward) | Pack and pool report; rw5-style checks (Glacial Ape-King was in no pool) | ☐ |
| C7 | Foil (shiny) distribution | Rates as settled (0.5% per card; pack foils 1 / 1.5 / 2%; Easter eggs 0.05%) and measured in a 100k-pack simulation | A pack simulation with observed rates against the settled rates | ☐ |
| C8 | Rewards per fight | Every Maps 0-20 fight has a reward (card, pack, currency) that fits its place on the curve; first-clear rewards are unique | Reward table export, owner review | ☐ |
| C9 | Map card lists | Each map's list has enough attackers, defenders and answers to build legal skirmish decks under K14 and the 5-6 card shape | Per-map list audit | ☐ |
| C10 | Unused skills | Skills on no card are cleared or parked (owner: "clear all skills unused ... back to the drawing board") | Registry against cards.json | ☐ |
| C11 | Texts | Every card, skill and UI text in English is final, under length limits, with no placeholders or numbers in rule tips | game-texts and tip tests green | ☐ |
| C12 | Translations | All 12 packs complete for alpha texts; a native or second-model spot check per language | i18n tests, plus 20 sampled strings per language | ☐ |
| C13 | Lore and names | Card, map and bramble names follow the lore bible; no real-brand or real-person names | Lore pass | ☐ |

## 2. Balance

| # | Item | Done when | How we check | Status |
|---|---|---|---|---|
| B1 | Card budget band (Level 1) | Every in-play card sits inside the budget band at Level 1, or is an owner-set exception on a list | `bramblewood-budget.js` report over all cards | ☐ |
| B2 | **Card-level balancing (never done)** | Each card's stats and level skills are checked at Levels 1-10: band use per level, no level where a card jumps or stalls | A per-level budget report; the owner signs off on the curve | ☐ |
| B3 | Skill prices | Every skill on an in-play card has a measured or deliberate price; nothing priced at a placeholder | Skill canon runs, flagged list empty | ☐ |
| B4 | Road fights, Maps 0-20 | Every fight within its band, or a named exception (The Canopy is a hard side map) | `skirmish_pass measure 40 --maxmap=20`, then totals | ☐ |
| B5 | Progression decks | The five progression decks clear the road at the intended pace; no fight flagged | Pipeline `tournament` | ☐ |
| B6 | PRO / BPRO fights | None over 85% for the Map reference deck, none walls | `tools/opt/pro_ease.js --maps 0-20` | ☐ |
| B7 | Reference decks | The Map reference and the other sets are sane for every fight. Owner 11-06: 7-A-SK's reference showed Garden Snail and Silver Minnow | Trace which picker feeds each fight; a test that every fight's reference is the map's | ☐ |
| B8 | Leaders | No leader dominates (The Old Shell won 14 of 30 PvP leader searches; the owner is re-tuning it) | PvP round robin and leader search re-run | ☐ |
| B9 | Brambles | Every bramble ability scales sensibly with level (owner 11-06 #24: +3 Attack reads +1 at low levels) | Bramble table per level | ☐ |
| B10 | PvP | 30 test decks plus real decks: no deck over 70% against the field without an owner OK | PvP round robin | ☐ |
| B11 | Raids and dungeons | Each raid boss and dungeon is clearable by an intended deck within its time and turn limits | Raid sim per boss | ☐ |
| B12 | Economy | Currency in and out per day matches the design (Gold Leaves about 1 a day, ECON2-12); no infinite loop | Economy sim of 30 days of play | ☐ |

## 3. Rules and engine

| # | Item | Done when | How we check | Status |
|---|---|---|---|---|
| E1 | Keyword audit | Every keyword does what its text says (owner 11-06: Herb Refinery says damage, deals poison; poison should only add stacks) | One scenario test per keyword | ☐ |
| E2 | Damage types | Physical, poison, fire, frost and the rest follow one settled rule, written in project-state | Damage-type tests | ☐ |
| E3 | Field effects | Darkness, weather and terrain affect what they should (owner 11-06 #3: darkness and ranged) | Field-effect scenario tests | ☐ |
| E4 | CPU | The CPU plays every keyword sensibly: no stalls, no passing with playable cards | AI scenario suite, plus stalemate review in card-matrix (70 on 11-06) | ☐ |
| E5 | Determinism | Same seed, same result, in the browser and the tools | Replay test | ☐ |
| E6 | Card data seal | Card data ships as a sealed file with a hash; a client whose data differs gets an error (owner 11-06 #5) | Seal tool plus a mismatch test | ☐ |

## 4. Interface

| # | Item | Done when | How we check | Status |
|---|---|---|---|---|
| U1 | First session | A fresh account reaches Map 1 without help: tutorial, unlock gates (map list after Map 0), speed unlocks | Fresh-account playthrough by someone new | ☐ |
| U2 | Card display | Hover and inspect show the card's own level, its stats and all its skills, even after a one-use skill fires (owner 11-06 #4) | Inspect tests | ☐ |
| U3 | Admin-only marks | The edited pencil and other admin marks never show to players (owner 11-06 #5) | Non-admin playthrough | ☐ |
| U4 | Phone layout | Every screen works at 390 wide: no sideways scroll, no clipped text | e2e at 390 on every screen | ☐ |
| U5 | Effects setting | Low and None are smooth on a mid-range phone | Frame-time check | ☐ |
| U6 | Post-battle and packs | Rewards, packs and achievements read cleanly; "Open all" is viewable | Owner review | ☐ |
| U7 | Accessibility | Keyboard focus, readable contrast, screen-reader labels on the main controls | Audit | ☐ |
| U8 | Settings | Every setting persists and applies without closing menus | Settings test | ☐ |

## 5. Platform and data

| # | Item | Done when | How we check | Status |
|---|---|---|---|---|
| P1 | Saves | Player data survives updates; old saves migrate | Migration tests from saves of 3 old versions | ☐ |
| P2 | Live overrides | `card_overrides` holds no unfolded rows at release | Read-only SQL | ☐ |
| P3 | Anti-cheat | Tier 1 applied (10-16). Tier 2 (server grants rewards) and Tier 3 (verify fights) decided for alpha | Owner decision, then SQL review | ☐ |
| P4 | Web hardening | CSP enforced; no third-party scripts without integrity hashes; hub off the public site | Headers check | ☐ |
| P5 | AI crawlers | Decide whether to block AI crawlers (robots.txt, noai) | Owner decision | ☐ |
| P6 | Performance | Load under 5 s on a mid-range phone on 4G; no long frames in fights | Lighthouse and a trace | ☐ |
| P7 | Error reporting | Client errors reach a log the team reads | A test error appears in the log | ☐ |
| P8 | Hosting | Production deploy from `main` is the only path; rollback tested | One rollback drill | ☐ |

## 6. Tests and release

| # | Item | Done when | How we check | Status |
|---|---|---|---|---|
| T1 | Unit suite green | 0 failing (45 failed on 11-06; most are stale pins or known data issues) | `node tests/run.js --full` | ⚠ |
| T2 | Browser suite green | Every e2e passes at 390 and 1366 | `node tests/run.js --full --e2e` | ☐ |
| T3 | Release notes | A player-facing list of what alpha contains | Draft from CHANGELOG | ☐ |
| T4 | Feedback channel | Alpha players can send feedback in the game, and it reaches the owner | Submit a test feedback | ☐ |

## 7. Legal and community

| # | Item | Done when | How we check | Status |
|---|---|---|---|---|
| L1 | Privacy note | What is stored about players, and where | Owner review | ☐ |
| L2 | Terms for testers | Alpha terms: data may reset, no purchases | Owner review | ☐ |
| L3 | Asset rights | Every art, sound and font is ours or licensed; no watermarked stock | Asset audit | ☐ |
| L4 | Tester list | Who gets alpha access, and how | Owner decision | ☐ |
