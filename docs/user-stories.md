# Bramblewood Arena — User Stories (v1, 2026-10-03)

Written from what the game does today. Each story has an id, the story, and acceptance criteria (AC) that a test can check. The results of the first full pass (all 54 stories walked in a real browser at 1366×860 and 390×844) are at the bottom.

Personas: **New player** (first visit, guest), **Returning player** (tutorial done, guest or signed in), **Signed-in player** (Google / email account), **Friend** (another signed-in player), **Admin** (zhangjiahaor@gmail.com, Admin Mode on).

## E1 — First run & onboarding
- **US-01 Pick a side.** As a new player I choose Otters, Hummingbirds or Both so my starter deck matches my side.
  - AC: the faction picker appears on first visit; after 15 s a "Both" option is offered; the pick is saved.
- **US-02 One seeded tutorial.** As a new player I play one guided tutorial fight that always plays the same way.
  - AC: the tutorial uses `TUTORIAL_SEED`; guided steps run in order (hand → deck → enemy castle → my castle → play a card → combat); Block steps can't be skipped past without Next; only one bubble at a time.
- **US-03 Quit the tutorial.** As a new player I can quit the tutorial and come back to it.
  - AC: Quit returns to Home; Home shows "Continue tutorial"; re-entering starts the tutorial again.
- **US-04 Tutorial rewards.** As a new player, winning the tutorial gives me a starter deck and opens Conquest.
  - AC: results panel lists cards won, currencies, unlocked activities, new fights; "⚡ N: Next Battle!" starts Outskirts 1-1 or 1-2.

## E2 — Returning & resuming
- **US-05 Skip the splash.** As a signed-in returning player I land on Home without the splash.
- **US-06 Welcome back.** As a returning player Home greets me "Welcome back" (a brand-new player sees "Welcome!").
- **US-07 Resume an abandoned match.** As a player whose tab closed mid-fight (vs AI, Conquest, Gauntlet, Tutorial), I'm offered to resume it on my next visit.
  - AC: the board, hands, HP and round number match the snapshot; declining clears it.

## E3 — Matches (core loop)
- **US-08 Play a card.** I drag or click a card from my hand onto a lane; affordable cards are playable, unaffordable ones say why.
  - AC: a greyed card shows "Needs N🪵 — you have M" or "Already played this turn" on hover.
- **US-09 See combat clearly.** Each attack shows a damage number once (no duplicates); misses say "Miss"; castle damage numbers look like unit numbers.
- **US-10 Leader.** I can summon my Leader into a free lane, and it lands where I chose.
- **US-11 Hand limit.** My hand never exceeds 5; extra draws are auto-pitched with feedback.
- **US-12 Speed & pause.** I can change speed (▶▶ 1×/2×/…), and the game pauses on the Victory/Defeat banner.
- **US-13 Quit any match.** Every mode except Live Ranked's in-progress turn has a Quit (Async has Save & Exit).
- **US-14 Learn as I go.** The first time a mechanic appears (Wait, Lumber, Flying, any skill, any status), one passive tip explains it, once.
- **US-15 Deterministic fights.** Given the same seed and the same plays, a fight resolves identically (no stray `Math.random`).

## E4 — Conquest
- **US-16 Map trail.** I see the current map as a trail of skirmish icons with decor, a painted background and moving critters.
- **US-17 Inspect a skirmish.** Hovering a node shows name, kind, HP, energy cost, flavour and squad; clicking selects it; clicking again fights.
- **US-18 Locked nodes.** A not-yet-reachable node shows its icon darkened with 🔒 and can't be fought.
- **US-19 Replay cleared fights.** A cleared node keeps its icon plus ✓, stays hoverable and can be fought again.
- **US-20 Energy.** Fights cost ⚡ by node kind; I can't start one I can't afford, and I'm told why.
- **US-21 Results & next battle.** After a win I see rank, rewards, unlocks, newly opened fights, and a Next Battle button that starts the next fight.
- **US-22 Map unlocks.** Clearing a map's boss unlocks the next map in the list.

## E5 — Arena modes
- **US-23 vs PC.** I can start a quick match against the computer with a VS screen.
- **US-24 Pass-and-play.** Two people can share one device; the hand is hidden between turns.
- **US-25 Async Arena.** I fight ghosts of other players' decks at my win stage (a run is up to 7 wins, 3 losses ends it), at my own pace, with Save & Exit / Continue.
  - AC: every stage offers ≥ 10 active decks; I never meet the same ghost twice in a run; my winning deck is recorded as a ghost at that stage.
- **US-26 Gauntlet.** I can chain AI fights for a streak; one loss resets it; best streak is kept.
- **US-27 Dungeon.** I can run 3 fights where losses carry over; I can abandon a run.
- **US-28 Live Ranked (signed in).** I can queue for a real-time match against another player matched by rating; guests are asked to sign in.

## E6 — Raid (offline first)
- **US-29 This week's raid.** I see the featured boss, its shared HP pool, and the raid party: the decks that already fought it this week, with their damage. A "Coming Up" list (max 4) sits below.
- **US-30 Fight the raid.** Fighting costs ⚡ Energy (no sign-in); the damage I deal comes off the shared pool and my deck joins the party.
  - AC: the pool only ever goes down; stand-in raiders can't take more than half of it.
- **US-31 Online Raid (signed in).** The older online raid (🎫 Raid Points + ⚡, shared server pool, recent-attempts feed) is still available, folded under "Online Raid".

## E7 — Deck, Codex, collection
- **US-32 Build a deck.** I can build a 20-card deck within rarity copy limits; a match won't start with ≠20 cards.
- **US-33 Several decks.** I can save, rename and switch between decks; the active one is used in fights.
- **US-34 Browse the Codex.** I can search/filter all cards; on phones filters fold behind "⚙️ Filters".
- **US-35 Card details.** Opening a card shows art, stats, skills in plain language, and where to get it.
- **US-36 Nest.** I can see my collection; when empty it offers Play Conquest / Open the Shop.

## E8 — Economy & shop
- **US-37 Currencies.** My currencies show with names everywhere they appear.
- **US-38 Buy packs (signed in).** I can buy a pack and see what I got; guests are prompted to sign in.
- **US-39 Public market.** I can list a card for sale and buy someone else's listing. *(needs the social migration)*

## E9 — Accounts & social
- **US-40 Sign in.** I can sign in with Google or email ("Create account" / "Login" same size); one email = one account across methods.
- **US-41 Cloud sync.** My decks, currencies and progress follow me to another device after sign-in.
- **US-42 Profile & avatar.** I can pick a character (mouse/hummingbird/otter), colour and title; they show on my profile and VS screens.
- **US-43 Friends.** I can search for a player, send a request, accept, and see my friends. *(needs the social migration)*
- **US-44 Private match invite.** I can invite a friend to a private match with settings (battle mode, e.g. Gravity 🌀); they get a banner and can accept. *(needs the social migration)*
- **US-45 Ranking.** I can see the leaderboard and my rank.

## E10 — Settings & accessibility
- **US-46 Settings.** I can change language, sound and speed from Settings; the tiles are consistently sized.
- **US-47 Keyboard & focus.** Every interactive control shows a focus ring; icon buttons have labels.
- **US-48 Phone layout.** At 390×844 every screen fits without horizontal scroll.

## E11 — Admin & tooling
- **US-49 Admin Mode.** As admin I can toggle Admin Mode; admin-only controls only show when it's on.
- **US-50 Edit a card.** As admin I can edit a card and publish it live for everyone (cloud), or locally when not a cloud admin.
- **US-51 Edit map layout.** As admin I can drag skirmish nodes with grid snap and save/publish, reset or cancel.
- **US-52 Edit node rewards.** As admin I can edit a node's reward cards.
- **US-53 Test Kit.** As admin I can open a looping test field for a card to check its effects, VFX and SFX.
- **US-54 Workshop.** The Card Workshop page explains what's coming (no dead ends).

## 1-pass results (2026-10-03)

| Result | Count |
|---|---|
| Pass (incl. against the mock backend) | 37 |
| Partial | 15 |
| Fail | 1 |
| Blocked | 1 |

**Fixed in this pass** (commit c7c58a8):
- **US-32 (fail).** Conquest and Raid started with a 21-card deck. Every mode now shares one deck-size gate. Tapping a card in your deck list now removes it, so phones can remove cards (it used to need Shift+click).
- **US-07.** An unfinished fight is now offered (Resume / Discard card on Home) instead of being forced.
- **US-14.** Passive tips no longer swallow drops onto your own lane.
- **US-08.** The why-not text now names the right resource ("you have 0🕊️", not "5🪵").
- **US-35.** Card detail shows "Where to get it" for players. Skill text reads "Spawn 1 Bee Swarmling" (no raw ids). Escape closes it.
- **US-23.** vs Computer now has a VS screen. Mode names are clearer ("vs Computer", "Pass & Play").
- **US-47.** Hand cards are keyboard-playable (Enter arms, ↑ or Shift+←/→ plays). Map nodes have accessible names.
- **US-01.** A "Both" button appears after 15 s, instead of auto-picking.
- **US-06.** Signed-in players who skip the splash get "Welcome back, name!" on Home.
- **US-28.** The guest gate now uses the sign-in modal instead of an alert.

**Still open:**
- **US-41.** Conquest progress, avatar, Energy, Gauntlet best and the tutorial flag are local only; no cloud table yet.
- **US-46.** Settings has no speed setting; speed is the in-match ▶▶ only. Language is English only.
- **US-49.** The Admin tile shows for every player. Cloud writes are still admin-only server-side. This ties to UX item A3.
- **US-39, US-43, US-44.** Need the social migration applied before they can be tested live.
- **US-28.** Live Ranked against the real backend is untested. The two-browser test covers the game logic with a relay mock.
- **US-04.** The tutorial grants no currency, so its results show no currency section.
