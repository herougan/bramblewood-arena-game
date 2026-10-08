# Security review: anti-cheat, static scans, SSL (2026-10-08)

The owner asked: *"Think about anti-cheat, about sonarqube and fortify scans, and ssl."*

## 1. Anti-cheat

**The basic fact.** The game runs in the browser. Almost all state lives on the player's device in localStorage and is then synced up to Supabase: cards, levels, currencies, XP and Conquest progress.

Anything that stays single-player can be cheated, and that is fine. It only matters where one player's numbers affect another player. That covers:

- rating and the leaderboard
- the market
- raids
- live matches

**What a signed-in player can change today with the browser console** (from the Supabase RLS policies):

| Data | Who can write | Risk | Fix |
|---|---|---|---|
| `profiles.rating` | the player (UPDATE own row, every column) | **High.** Set your own rating; leaderboard is public | Tier 1: column grant so only `display_name`, `last_seen_at` and `updated_at` are writable. Rating only changes through `report_live_match_result` |
| `player_currencies` | the player (UPDATE own) | **High** for the market: unlimited Leaves | Tier 1: trigger caps how much one write can add. Tier 2: server-granted rewards |
| `player_card_unlocks` | the player (ALL own) | Medium: unlock any card, then list it on the market | Tier 2: unlocks granted by server functions (pack open, fight reward) |
| `player_progress` (XP, Conquest) | the player | Low (cosmetic, single-player) | Tier 2 |
| `match_history` | the player (INSERT own) | Low: fake history | Tier 2 |
| Live match result | the host reports the winner; ratings are clamped to ±24 server-side | Medium: host can lie | Tier 3: both players report, or a server replay |
| Raid damage | `decrement_raid_boss_hp`: amount capped at the boss's HP, one hit per 60 s | Low, already bounded | — |

**Tiers.**

1. **Tier 1: lock what others see.**
   - Written as `supabase/proposed/20261008_anticheat_tier1.sql`. **Not applied.**
   - The rating column becomes read-only for players.
   - Any single write that *adds* more than 2,000 Maple Leaves, 200 Gold Leaves, 2,000 Dust or 50 Metal is refused. Admins are exempt.
   - One thing to check first: a device that played offline for a long time and syncs a big gain in one write would be refused. The cap may need raising, or sync changed to send deltas.
2. **Tier 2: the server grants rewards.**
   - This is what the T3 migration (`20261003_fight_sessions.sql`, not applied) starts.
   - The server opens a fight session with a seed. The client reports the result. The server grants the reward once per session.
   - Pack opening becomes a server function that rolls the cards. The pack table is already in the database as `__cfg:shop-packs`, so the server can read the same odds.
3. **Tier 3: verify fights.**
   - Combat is deterministic given the seed, both decks and the players' moves.
   - A Supabase Edge Function can re-run the same engine code (`bramblewood-engine.js`) and check the reported winner before ranked rating moves.
   - `bramblewood-integrity.js` already does client-side tamper checks. These raise the bar but cannot be trusted alone.

**Supabase advisor (security):**

- **Leaked-password protection is off.** Turn it on in the Supabase dashboard: Auth → Passwords. Free, one click, owner's account.
- 16 SECURITY DEFINER functions are callable by signed-in users. They are meant to be: each one checks `auth.uid()` inside. Reviewed `report_live_match_result` and `decrement_raid_boss_hp`; both check the caller and clamp values.
- `raid_hit_log` has RLS on and no policies. This is intended, since only the definer function touches it.

## 2. Static scans (SonarQube / Fortify)

- **Fortify** is a paid product; nothing to run here.
- **SonarQube / SonarCloud** is free for public repos, but needs the owner to sign in at sonarcloud.io and add a token to the GitHub repo. Not set up.
- **Added `.github/workflows/codeql.yml`.** This is GitHub CodeQL with the `security-extended` queries, for JS and Python. It is free for this public repo and runs on every push to main and weekly. Findings show under GitHub → Security → Code scanning.
- **Semgrep's rule registry is blocked** from this workspace.

**Ran locally: ESLint with `eslint-plugin-security` and `eslint-plugin-no-unsanitized`** over `arena_app.js` and the `bramblewood-*.js` modules.

- `eval`, `new Function` and string timers: **0**.
- `innerHTML` with template strings: 176, plus 6 `insertAdjacentHTML`.
  - This is the house rendering style. The rule is that every player- or admin-typed string goes through `escapeHtml` / `escapeAttr`.
  - Spot-checked player-controlled strings (display names, deck names, friend names, market rows). They are escaped or sent through `textContent` (toasts).
  - **Fixed:** card names inside card tiles were not escaped (5 places). Only admins can write card names, but a compromised admin account could have put script into every player's game. Now escaped.
- Possibly slow regex: 1, in the deck-text import parser. It runs one line at a time on text the player pasted themselves, so it is low risk.
- Secrets in the repo: none found. The Supabase anon key is public by design; there is no service-role key.

## 3. SSL / transport

- The site is on Vercel. HTTPS uses automatic certificates, and HTTP redirects to HTTPS. Supabase is reached over `https`/`wss` only.
- **Added `vercel.json` security headers:**
  - HSTS (2 years, preload)
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy`
  - `X-Frame-Options: SAMEORIGIN`
  - `Permissions-Policy` (no camera, microphone, location or payment)
- **Content-Security-Policy is report-only for now.**
  - It is ready to enforce after a week of no violations in the browser console.
  - It allows only this site, Google Fonts and our Supabase project.
  - Inline scripts must stay allowed, because the game ships as one self-contained HTML file.
- HSTS preload is only a promise until the domain is submitted to hstspreload.org. That needs a custom domain; `vercel.app` is already preloaded by Vercel.
