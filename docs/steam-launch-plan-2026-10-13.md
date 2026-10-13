# Putting Bramblewood Arena on Steam (8-month plan, drafted 2026-10-13)

**Target:** launch around June 2027. Fees and waits below are from Steamworks' Steam Direct page; check them again when you sign up, since Valve can change them.

## What Steam needs

| Item | Detail |
|---|---|
| Steamworks partner account | Company or individual, identity check, tax interview, bank details |
| App fee | 100 USD per game, recouped once the game earns 1,000 USD adjusted gross revenue |
| Waiting period | 30 days between paying the fee and being able to release (first titles) |
| Coming Soon page | Must be public at least 2 weeks before release; aim for 4–6 months to collect wishlists |
| Reviews | Store page and the build are each reviewed by Valve, usually 1–5 days |
| A desktop build | Steam ships an app, not a website, so the web game needs a wrapper (below) |
| In-game purchases | On Steam they must go through Steam's own purchase system (Steamworks microtransactions) |

## Wrapping the web game

| Option | Size | Notes |
|---|---|---|
| **Electron** | ~150 MB | Easiest; Chromium inside, so it runs exactly like the site. `steamworks.js` gives achievements, overlay and cloud saves |
| Tauri | ~10 MB | Much smaller, uses the system web view (WebKit on Mac, WebView2 on Windows), so it needs testing per platform |
| NW.js | ~120 MB | Similar to Electron, older |

**Recommendation: Electron**, because the game already relies on Chromium behaviour (WebGL shaders, audio) and Playwright tests run on Chromium.

What changes in the game:
- Saves: localStorage works inside Electron; add Steam Cloud sync of the same keys so saves follow the player.
- Sign-in: Steam players sign in with their Steam ticket, exchanged for a Supabase session by an edge function.
- Purchases: the Shop calls Steam's purchase API in the Steam build, the web processor elsewhere.
- Admin features: switch `LAUNCH_BUILD` on (built 2026-10-13) so no admin surface ships.

## Timeline

| Month | Work |
|---|---|
| 1 (Nov 2026) | Partner signup, pay the fee (the 30-day clock starts). Electron wrapper proof of concept. Capsule art brief |
| 2 (Dec) | Store page draft: capsule images (header, small, main, library), 5+ screenshots, a 30–60 s trailer, description, tags |
| 3 (Jan 2027) | **Coming Soon page live.** Start wishlist building: devlog, Reddit, Discord, short clips |
| 4 (Feb) | Steam features: achievements (reuse the in-game ones), Steam Cloud, overlay, rich presence |
| 5 (Mar) | Steam purchases and Steam sign-in. Closed playtest through Steam Playtest (Standard PvP and Gauntlet are ready for this) |
| 6 (Apr) | Demo build (Maps 0–5) for a Steam Next Fest; check the next Next Fest dates and register early |
| 7 (May) | Balance and polish, ratings questionnaire, pricing (free-to-play with purchases, or a base price), build review |
| 8 (Jun) | Release: launch discount if paid, launch-day patch window, community hub |

## Free-to-play or paid?

- **Free-to-play** matches the web game and the pack economy, but Steam's free-to-play section is crowded and reviews punish aggressive monetization.
- **Paid (~10 USD) with a cosmetic-only shop** sells more simply on Steam and avoids loot-box concerns, but splits the economy between web and Steam players.

Worth deciding by month 2, because the store page and the economy doc both depend on it.

## Tutorials worth watching (D47)

- Steamworks documentation: Steam Direct, store page setup, Coming Soon rules, Next Fest.
- steamworks.js examples for Electron (achievements and overlay).
- Chris Zukowski's "How To Market A Game" blog for wishlist strategy.

Sources:
- [Steam Direct, Steamworks](https://partner.steamgames.com/steamdirect)
- [Steamworks documentation](https://partner.steamgames.com/doc/home)
