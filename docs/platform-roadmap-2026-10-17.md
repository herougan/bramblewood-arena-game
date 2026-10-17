# Platform roadmap: emoji, effects, security, desktop/mobile, music (2026-10-17)

You asked (21:32): *"we need to start looking at alt emoji, alt effects, upgrading security, preparing for cross-platform w electron or unity, alt music (royalty free)"*.

This page gives a recommendation for each topic, the next steps, effort and cost, and what needs your decision. Licences, versions and prices were checked on the web today; sources are at the end. Nothing was bought, downloaded into the game or applied to the live database.

**Effort:** S = up to a day · M = 2–5 days · L = 1–3 weeks. **💰** = costs you money. **❓** = needs your decision.

## Summary

| Topic | Recommendation | Effort | Cost |
|---|---|---|---|
| 1. Alt emoji | Bundle the emoji sets in the game instead of loading them from jsDelivr. Ship **Twemoji** (CC-BY 4.0) and **Noto** (Apache 2.0) as today, and add **Fluent Flat** (MIT). Long term, build our own **pixel icon set** for the ~120 game keys (skills, resources, UI) behind `iconHTML()`, using CC0 pixel packs as stand-ins | M now, L for the pixel set | Free (art can be PixelLab credits) |
| 2. Alt effects | Add an **Effects style** setting (Classic / Pixel / Minimal) next to the Effects *level*. Wire the Effects Lab's B/C variants to it. Add auto-downgrade on slow frames. No PixiJS yet | M | Free |
| 3. Security | Apply the four SQL drafts in `supabase/proposed/` (they close real gaps found today). Then move rewards and the market to the server. Bundle CDN scripts, then enforce the CSP. Deploy only the game files | S–M per step, L for fight replay | Leaked-password check needs Supabase Pro, **💰 25 USD/month ❓** |
| 4. Desktop/mobile | **Electron** for Steam (Windows, Mac, Linux/Steam Deck). **Capacitor** later for phones. Not Tauri (the Steam overlay can't draw over WebView2) and not Unity (a full rewrite). A working proof of concept is in `electron/` | POC done; Steam-ready build L | Steam 100 USD/game (known). Mac signing **💰 99 USD/year**. Windows signing optional for Steam |
| 5. Alt music | Keep the generative music as the default and add a **Soundtrack** option: a small music player (per-biome tracks, crossfades, lazy loading). Use CC0 or CC-BY tracks with credits. Shortlist of 12 below | M | Free, or **💰 ~25 USD** for one paid pack (optional) |

---

## 1. Alt emoji

### Where we are

- Settings → **Emoji style: System / Twemoji / Noto** (built 10-14/10-15, `EmojiStyle` in `arena_app.js` ~line 366).
- It loads the Twemoji parser (`@twemoji/api@15.1.0`) from jsDelivr when picked, and the pictures from jsDelivr: Twemoji's own, and Noto 2.042 SVGs from the googlefonts GitHub repo. Then a MutationObserver re-parses whatever the game redraws.
- The game uses about **500 different emoji** (counted in `arena_app.js`, `bramblewood-texts.js` and `canonical/cards.json`).
- They show up in three ways:
  1. **`iconHTML(key, fallbackEmoji)`** (110 call sites): skill and resource chips. `ICON_ART` can already swap a key for our own picture (only fireball, durian and smoke bomb are drawn, in CSS).
  2. **`SKILL_ICON`**: the plain-text emoji map for tooltips, card text and logs.
  3. **Emoji typed straight into text**: card names, field names, buttons, dialogue.
- A credit line (`.emoji-credit`) already appears when a set is on.

**Problems with today's setup:**
- It doesn't work offline or in a Steam build.
- The site's CSP (still report-only) would **block** the Twemoji script once enforced, because `script-src` allows only the site itself.
- The script has no integrity hash.
- The parser is 15.1, while Twemoji is at 17.0.

### The sets we could offer

| Set | Licence | What it means for us | Look | Fit |
|---|---|---|---|---|
| **Twemoji** 17.0 (jdecked fork) | Graphics CC-BY 4.0, code MIT | Credit "Twemoji graphics by Twitter, Inc. and contributors, CC-BY 4.0" in Credits. Commercial use fine | Flat, clean, bold outlines | ✅ keep (already the default alt) |
| **Noto Emoji** (Google) | Images Apache 2.0; font OFL 1.1 | Include the Apache licence text in the credits/licences file. Commercial fine | Rounded, friendly | ✅ keep |
| **Fluent Emoji** (Microsoft) | MIT | Include the MIT licence text. Styles: 3D, Color, Flat, High Contrast | Flat is soft and cosy; 3D is big PNGs | ✅ add **Flat** (and High Contrast as an accessibility option) |
| **OpenMoji** 17.0 | CC BY-SA 4.0 | Credit required. **Share-alike:** any icon we *change* (recolour, pixelate, crop) must be released as CC BY-SA too. CC 4.0 also forbids adding DRM that restricts the material, which clashes with Steam's optional DRM wrapper | Hand-drawn, thin black outline | ⚠️ offer as-is at most; never base our own set on it |
| **Nikoichu "Pixel Icons"** | CC0 | Nothing required (credit is appreciated). 1,476 icons at 16×16 | Pixel art | ✅ stand-in for the pixel set |
| **Kenney "Board Game Icons"** | CC0 | Nothing required. 250+ icons, with vectors | Clean board-game style | ✅ stand-ins for resources, dice, cards |
| **Kyrise 16×16 RPG icons** | CC BY 4.0 | Credit "Graphics made by Kyrise". 300+ sprites at 16/32/48 px | Pixel items: potions, gems, weapons | ✅ items and loot |
| **game-icons.net** | CC BY 3.0 | Credit each author (mostly Lorc, Delapouite). 4,000+ one-colour SVGs | Silhouettes | ✅ good for skill glyphs we tint ourselves |

**How the licences work in practice:** CC0 needs nothing. MIT and Apache need their licence text shipped (a `LICENSES.txt` and the in-game Credits screen). CC-BY needs a visible credit (Credits screen; the store page is optional). CC BY-SA spreads to anything we derive from it. Never mix NC (non-commercial) material into a game we sell.

### Bundle, don't load from a CDN

1. **A build step.** `tools/emoji/build_sets.py` (new) does three things:
   - scans the sources for the emoji actually used (about 500);
   - copies only those SVGs from pinned npm packages into `assets/emoji/<set>/<codepoints>.svg`;
   - writes `assets/emoji/<set>/manifest.json`.
2. **Ship the parser with the game.** Twemoji's parser (MIT, about 15 KB) goes into the build, like GSAP is today. `EmojiStyle` points at `assets/emoji/<set>/` instead of jsDelivr. The Noto filename rule stays, and flags come from the Twemoji folder as now.
3. **Size budget: 2 MB per set at most**, loaded only when that set is picked. Never inline the sets into `index.html` (it's already 8.6 MB).
   - Rough sizes for 500 icons, to be measured by the build step: Twemoji under 1 MB, Fluent Flat 1–2 MB, Noto 2–4 MB.
   - Noto may need to be trimmed with an SVG optimiser (svgo).
   - Fluent 3D would only fit as 64 px WebP (about 1.5 MB).
4. **Offline and Steam** then work for free: the Electron build packs `assets/` (see §4).

### How a switch reaches each icon layer

| Layer | Today | After |
|---|---|---|
| Emoji in text | Twemoji parser swaps text → `<img>` | Same, with a local `base` per set. `restore()` already puts text back on switching |
| `iconHTML()` keys | `ICON_ART[key]`, one table | `ICON_ART_SETS[set][key]` first, then `ICON_ART[key]`, then the emoji (which the active set's parser then draws). This is how the pixel set arrives one key at a time |
| `SKILL_ICON` text | Raw emoji in tooltips, `title=`, logs | Stays raw emoji. Tooltips and screen readers need text |
| Emoji drawn in canvas/SVG effects (`bramblewood-fx-f.js` uses an emoji font stack) | System font | Stays system. Not worth swapping in 1.5 s effects |

### The long-term path: our own pixel icon set

- The game's art is painted and PixelLab pixel art, so a matching **32×32 pixel icon** for each *game* key covers most of the screen: about 100 skills, the resources (Lumber, Leaves, Dust, Metal, keys) and about 20 UI glyphs.
- We would not redraw all 500 emoji. Animals in card names and the like stay in the chosen emoji set.
- Steps:
  1. Export the key list from `SKILL_ICON` and the `iconHTML` call sites into `docs/icon-map.csv`, with columns key, current emoji, meaning and priority.
  2. Fill the CSV with CC0 stand-ins (Nikoichu, Kenney) so a "Pixel" icon style works within a week.
  3. Replace the stand-ins with PixelLab-generated or commissioned icons, 10–20 at a time.
- The pixel set pairs with the **Pixel** effects style (§2).

### First steps
1. S: build step for Twemoji and Noto into `assets/emoji/`, and the parser bundled. Delete the jsDelivr URLs. This also unblocks enforcing the CSP.
2. S: add Fluent Flat as a third set, and a `LICENSES.txt` plus a Credits section generated from the manifests.
3. M: `docs/icon-map.csv`, plus `ICON_ART_SETS.pixel` filled with CC0 stand-ins for the top 40 keys.
4. L (rolling): our own 32×32 icons replace the stand-ins.

---

## 2. Alt effects

### What already exists
- **Effects level** (Settings): None / Low / Medium / High.
  - The default comes from the device: High; Medium on a low-power device; Low with reduced motion.
  - Shaders have their own switch.
  - Every batch effect checks `fxAtLeast('med'|'high')`.
- **The Effects Lab:**
  - 933 inventory entries, with variants `name`, `name_B`, `name_C` in `bramblewood-fx-a…g.js`.
  - The Card treatment centre has 9 foil finishes.
  - The VFX Playground holds sketches.
- **In the game, each effect is hard-wired to one variant.** Usually it's A; a few B/C variants were picked by hand, such as `impactWater_C` on castles. **Players can't choose variants today.**
- **GSAP 3.13** is in the game, so every GSAP plugin is free and available. Flip is used at 48 call sites.

### Recommendation: an "Effects style" setting
Keep **level** for *how much* and add **style** for *what it looks like*:

| Style | Look | Built from |
|---|---|---|
| **Classic** | Today's effects | The current picks |
| **Pixel** | Motion in steps (GSAP `steps(4)` eases), square particles, no blur or glow, hard 1-px outlines, `image-rendering: pixelated` on overlays, a pixel font for damage numbers. Pairs with the pixel icon set | The Lab's variants that suit it, plus a "pixel" pass on the shared helpers (`layer`, particles) |
| **Minimal** | Readability first: short flashes, damage numbers, no particles, no screen shake, no hit-stop. Good for streaming, motion-sensitive players and fast play | Mostly *removing* things, so it's cheap. Different from Low, which is about performance |

**How to wire it (M):**
- Add `FX_STYLE_KEY` and `fxStyle()` next to `fxLevel()`, plus one helper: `fxPick(M, 'impactWater')`. It returns `M.impactWater_P` (pixel) or `_M` (minimal) when that style has one, otherwise the Classic pick.
- A table `docs/effects-picks.json` maps effect id → variant per style. The build inlines it.
- The Effects Lab gets a "Use for: Classic / Pixel / Minimal" button on each variant. You pick in the Lab, and the game follows.
- `env` passed to `onEvent` gains `style`, so a batch can skip particles under Minimal without new variants.

**Exposing choice to players:** one *Effects style* dropdown, plus an optional "Advanced" drawer with 4–6 families. Examples: hit marks Ink/Spark/Pixel; deaths Classic/Dissolve/Pop; damage numbers Bold/Pixel/Plain. Per-effect choice for 900+ effects would overwhelm players, so the Lab stays an admin tool.

### Performance tiers (what is left after the 10-17 fix)
- **The 10-17 fix:** the `body:has()` rules were replaced. Over a 3-round fight, style recalculation went from 13.0 s to 3.9 s and the 95th-percentile frame from 67 ms to 17 ms.
- **What's left:**
  - **Flip** (`Flip.getState` reads layout). With 48 call sites, a state read after a write forces a reflow. Batch the reads before any writes in the same frame, and skip Flip under Low.
  - **Tweens on layout properties.** Some GSAP tweens animate `top/left/width/filter/box-shadow`. Move them to `transform`/`opacity` (compositor only). `filter: drop-shadow` on many cards is the costliest.
  - **Particle DOM churn.** Each effect creates and removes up to about 40 elements. A shared particle pool, or a single canvas for particles, would cut both style and layout work.
  - **WebGL contexts.** Each shader layer has its own. Browsers allow about 16, so keep one shared canvas (as `vfx-exploration` rule 3 says).
- **Auto-downgrade (not built yet):**
  - Measure frame times for the first 10 s of each fight.
  - If the 95th-percentile frame is over 25 ms, drop one level (High → Medium → Low).
  - Show a toast ("Effects lowered to keep the fight smooth. Settings to change"), and remember the choice per device.
  - Only when the player hasn't set a level themselves (`fxExplicit()`).

### WebGL / PixiJS: when it would be worth it
- **Not now.** The board and cards are DOM, and our effects are short.
- PixiJS (v8) would need either an overlay canvas for particles only (M), or a canvas battlefield (L+, a rewrite of the board renderer).
- **Worth it when:** profiling shows particle DOM is the main cost after the pool; or we want hundreds of particles at once (raid boss, weather on the board); or the Pixel style needs a true low-resolution render of the whole board.
- **Cheaper middle step first:** one shared raw-WebGL particle canvas under and over the board, reusing `bramblewood-shaders.js`.

### First steps
1. S: auto-downgrade, plus Minimal (mostly flags in `fxEnv`).
2. M: `fxStyle`, `fxPick` and `effects-picks.json`, plus the Lab's "Use for" buttons.
3. M: the Pixel helpers and the first 15 pixel variants (hits, deaths, numbers, arrows).
4. S: a Flip read/write batching pass and a transform-only tween audit, profiled with the same Playwright trace as 10-17.

---

## 3. Upgrading security

### Current state (read from the live project today, read-only)

| Area | State | Risk |
|---|---|---|
| Rating | Column-level grant: players may update only `display_name`, `last_seen_at`, `updated_at`. Rating changes only via `report_live_match_result` (±24 clamp) | ✅ |
| Currencies | Trigger caps one **UPDATE** at +2,000 Maple / +200 Gold Leaves / +2,000 Dust / +50 Metal | ⚠️ **New finding:** there is no check on **INSERT**, so a new account's first row can hold any amount. There's also no limit on the *number* of writes (2,000 every request) |
| Rewards | `fight_sessions` + `start_fight` / `submit_fight` are live (single-use seeds, one hand-in). **Rewards are still added by the browser** | ⚠️ |
| Market | `create_listing` doesn't check you own the card. `buy_listing` marks it sold but **doesn't take payment**; the browser does. `claim_market_proceeds` only flips a flag; the browser adds the Leaves | ❌ **New finding:** anyone with the console open can list cards they don't own and buy listings without paying |
| Card unlocks | `player_card_unlocks`: players may insert, update and delete their own rows | ⚠️ Unlock anything, then list it (made worse by the market gap) |
| Raids | `decrement_raid_boss_hp`: needs a real account, damage capped at the boss's HP, one hit per 60 s. Its `search_path` is `public`, not `''` (small) | ✅ mostly |
| Raid week board | `raid_week_attempts`: players insert their own rows, damage up to 10,000, public read | ⚠️ Fake leaderboard entries |
| Ghost decks | Insert/update own, payload < 20 KB, public read | ⚠️ Other players load them; check every string from a ghost goes through `escapeHtml` (spot-check before the async PvP launch) |
| Co-op rooms | Either member may update every column, so a guest can rewrite `host_id` | Low (not used by the client yet) |
| `card_overrides` | Public read, admin-only write (`is_app_admin()`) | ✅ |
| Feedback | Anyone, including signed-out visitors, may insert. Admins read | ⚠️ No rate limit: floodable |
| Advisors (today) | 20 SECURITY DEFINER functions callable by signed-in users (intended; each checks `auth.uid()`); `raid_hit_log` has no policies (intended); **leaked-password protection is off** | See below |
| Secrets in the client | Only the Supabase anon key, which is public by design. No service-role key anywhere | ✅ |
| Headers | HSTS, nosniff, Referrer-Policy, X-Frame-Options, Permissions-Policy on. **CSP is report-only** | ⚠️ |
| CDN scripts | Twemoji parser from jsDelivr, no integrity hash. Google Fonts CSS for CJK/Tamil | ⚠️ Bundle (see §1) |
| Admin surfaces | `LAUNCH_BUILD = false`. Admin needs an `app_admins` account or a dev host; the server refuses admin writes either way. A `localStorage` dev flag can show (not use) admin buttons until `LAUNCH_BUILD` is on | ✅ for writes; set the switch at launch |
| What the site serves | Vercel deploys the **whole repo**: `docs/`, `tools/`, `tests/`, `supabase/` and the master hub (`hub/`) are public URLs, "hidden, not locked" | ⚠️ No secrets (the repo is public too), but it gives away spoilers, balance numbers and plans. Ship only game files at launch |

**Correction to the 10-08 review:** leaked-password protection is **not** free. On Supabase it needs the **Pro plan (from 25 USD/month)**. 💰 ❓ Your call. It matters only for email/password accounts; Google sign-in and future Steam sign-in don't use passwords.

### SQL drafts written today (in `supabase/proposed/`, not applied)

| File | What it does | Client change needed |
|---|---|---|
| `20261017_a_rate_limits_and_currency_insert.sql` | Rate-limit table and helper. INSERT clamp on new currency rows. Hourly gain budget per currency (my guess: 20,000 Maple, 1,000 Gold Leaves, 20,000 Dust, 300 Metal an hour ❓). Feedback limits (10 per 10 min per player, 30 per 10 min for all guests). A server-grant switch so reward functions can pay above the caps | None for honest play. Check sync frequency against the 120 writes per 10 min limit first |
| `20261017_b_market_server_settlement.sql` | `create_listing_v2` (must own the card, price 1–100,000, 10 listings a minute), `buy_listing_v2` (takes payment and credits the seller in one transaction). The old functions stay until the client switches | Call v2; re-read currencies after buying; don't add proceeds for v2 sales. ❓ Should listing remove a copy? |
| `20261017_c_server_rewards.sql` | `reward_rules` table (admin-written) and `claim_fight_reward(session)`. It pays a verified fight once, or a handed-in one for modes you trust (single-player) | The rewards screen calls it and shows what the server paid. Copy the reward numbers into `reward_rules` (export script) |
| `20261017_d_small_hardening.sql` | Pins the raid function's `search_path` (body re-qualified). Locks `coop_rooms` membership columns. Notes on guild joins and on "to public" policies | None |
| `functions/verify-fight/index.ts` | Edge Function sketch. It runs on hand-in: cheap checks now (seed, card-data hash, round count). A full replay once the match loop is a DOM-free module | Not deployed |

### The tiers from here

1. **Tier 1.5 (S, apply drafts a + d).** Closes the INSERT hole, write floods and feedback spam.
2. **Tier 2: the server pays (M each).**
   - **S2.1** Market v2 (draft b) and the client switch, then revoke the old two functions.
   - **S2.2** Rewards via `claim_fight_reward` (draft c), with `trust_submitted = true` for Conquest, AI, Gauntlet, Dungeon and Trench, and false for PvP and online raids.
   - **S2.3** Pack opening as a server function. The odds are already in `card_overrides` (`__cfg:shop-packs`).
   - **S2.4** Card unlocks only through those functions: revoke the client's insert and update on `player_card_unlocks`.
3. **Tier 3: verify (L).**
   - **S3.1** Split the match loop out of `arena_app.js` into `bramblewood-match.js` (DOM-free; the code-graph communities are the split plan). The game, the tests and `verify-fight` all share it.
   - **S3.2** Replay before ranked rating or raid damage counts.
   - **S3.3** Revoke the client's UPDATE on currency columns entirely: every spend becomes an RPC (shop, forge, nest).
   - **S3.4** Steam sign-in: a Steam auth ticket goes to an Edge Function, which returns a Supabase session.
4. **Web hardening (S each):**
   - Bundle Twemoji and Noto (§1), so no third-party scripts are left.
   - Watch a week of CSP reports, then switch `Content-Security-Policy-Report-Only` to `Content-Security-Policy` in `vercel.json`.
   - Any CDN script that remains gets an `integrity` hash (SRI).
   - At launch: `LAUNCH_BUILD = true`, and deploy only the built files. Either set Vercel's output folder to a staged copy like `electron/stage.js` makes, or add a `.vercelignore` listing `docs tools tests supabase hub art_staging canonical`. ❓ Moving the hub off the public site means it needs another home (a private Vercel project with password protection costs money on Vercel; a local file is free).
5. **Supabase settings (your account):**
   - Leaked-password protection (Pro 💰).
   - Turn on CAPTCHA for sign-ups if bots appear (hCaptcha/Turnstile are free tiers).
   - Keep the advisors clean after each migration.

---

## 4. Cross-platform: Electron vs Unity (and Tauri, Capacitor)

### Comparison for a single-page JS game

| | **Electron 44** | Tauri 2 | NW.js | Unity 6 | **Capacitor 8** (mobile) |
|---|---|---|---|---|---|
| Effort to wrap | **S–M**: done as a proof of concept today | M: plus Rust glue for Steam | M | **Rewrite** (the 43k-line app plus the 6.6k-line engine in C#): many months | M: iOS/Android projects; touch layout already exists |
| Download size | About 100 MB of Electron plus 53 MB of game | A few MB plus 53 MB of game | About 120 MB | 50–150 MB | Small app plus 53 MB |
| Renderer | Bundled Chromium, the same everywhere (what the site and our Playwright tests use) | System web view: WebView2 (Windows), WebKit (Mac), WebKitGTK (Linux, varies by distro) | Chromium | Native | WKWebView (iOS), Android WebView |
| Steam | **steamworks.js**: achievements, overlay (`electronEnableSteamOverlay()`), cloud. Greenworks is unmaintained | **The overlay does not draw over WebView2** (separate GPU process; no fix found) | Works (Greenworks era) | Steamworks.NET, mature | n/a |
| Performance | Same as Chrome | Varies by platform; WebKitGTK lags | Same as Chrome | Best, but only after a rewrite | Phone web view: fine for our DOM game; watch shaders |
| Auto-update | Steam updates builds. Outside Steam, `electron-updater` (needs signing) | Built-in updater (needs signing) | Manual | Steam | App stores |
| Licence / cost | MIT, free | MIT/Apache, free | MIT, free | Personal free under 200,000 USD revenue; Pro 2,200 USD/seat/year above | MIT, free |

**Recommendation: Electron for Steam** (Windows first, then Mac and Linux; the Steam Deck runs the Linux build, or the Windows build under Proton). **Then Capacitor for iOS/Android.** Tauri's small size doesn't outweigh a broken Steam overlay and three different web engines. Unity would throw away the engine, the 900+ effects and every tool we've built.

### What in the code assumes the web (and the fix in a packaged build)

| # | Where | What it assumes | Packaged fix |
|---|---|---|---|
| 1 | `arena_app.js` ~366–367 | Twemoji parser and Noto SVGs from **jsDelivr** | Bundle them (§1). Until then the Emoji style quietly stays on System (it already falls back) |
| 2 | `bramblewood-i18n.js` 42–46, template preconnect | **Google Fonts** for Tamil, Chinese, Japanese and Korean script fonts | Self-host subsets in `fonts/` (OFL), or accept that those languages need the network the first time |
| 3 | `arena_app.js` ~9105 | **Supabase** URL and anon key | Works from the app (Supabase allows any origin); needs the network. Offline shows "☁️ Offline" as on the web |
| 4 | `arena_app.js` ~9126, ~9475 | **Google sign-in** redirects back to `location.href`; `isHostedOnline()` needs http(s) | Disabled in the POC. Real fix: open the system browser (PKCE), come back via a `bramblewood://auth` deep link (`app.setAsDefaultProtocolClient`), and add it to Supabase's redirect list. On Steam, sign in with the Steam ticket instead (S3.4) |
| 5 | Email sign-up / magic links | Email links point at the website | Use the 6-digit email **code** (OTP) in the desktop build instead of links |
| 6 | `arena_app.js` ~2490 | Update check via `version.json` over http(s) only | Skipped automatically under `app://`. Steam updates the app |
| 7 | `isDevHost()` ~10613, `adminEntryVisible()` ~37670 | **`file://` counts as a developer copy**, so admin tools and the debug bar show | That's why the POC serves the game from `app://bramblewood/`, not `file://`. Keep it that way |
| 8 | `vercel.json` | Security headers come from Vercel | The POC sets the same CSP itself, enforced |
| 9 | Shop | Web payments | Steam builds must use Steam's purchase API (existing Steam plan) |
| 10 | Saves | `localStorage` (cloud sync when signed in) | Works under `app://`. For Steam Cloud, write a save JSON through a preload bridge to a file Steam Auto-Cloud syncs. Don't sync Chromium's LevelDB folder |

**Works offline once packaged:** Conquest, Skirmish, Gauntlet, dungeons, the Codex, the Nest, the Forge and settings, i.e. everything single-player that works signed-out. **Online only:** sign-in, sync, ranked, live and co-op, raids, the market, feedback and published card edits.

### Code signing and store costs

| Item | Needed for | Cost |
|---|---|---|
| Steam Direct fee | Each game on Steam | 100 USD, recouped after 1,000 USD revenue (existing plan) |
| Windows code signing | **Not required by Steam.** Matters for downloads outside Steam (SmartScreen warnings) | Azure Artifact Signing 9.99 USD/month, but **individuals only in the USA/Canada** (organisations: USA, Canada, EU, UK). Otherwise a CA-issued OV/EV certificate, typically a few hundred USD a year (check current offers). 💰 ❓ Only if you sell outside Steam |
| Apple Developer Program | Mac notarization (Gatekeeper), and also the iOS App Store | **99 USD/year** 💰 ❓ (one membership covers both) |
| Google Play | Android | **25 USD once** 💰. New personal accounts must run a closed test before publishing |

### Step plan

| Step | Work | Effort |
|---|---|---|
| D1 ✅ | Proof of concept in `electron/` (today) | done |
| D2 | Bundle the CDN pieces (§1 emoji, CJK fonts), so the desktop build is fully offline-capable | S–M |
| D3 | Preload bridge (`window.bwDesktop`): quit, fullscreen, a save file for Steam Cloud, external links | S |
| D4 | steamworks.js: achievements (reuse the in-game ones), overlay, rich presence. Test with app 480 (Spacewar) before we have our own app id | M |
| D5 | Steam sign-in (Edge Function: ticket → Supabase session) | M |
| D6 | Steam purchases in the Shop (Steam build only) | M–L |
| D7 | Builds: Windows x64, macOS (universal, notarized 💰), Linux x64, via `electron-builder`. Steam depots via SteamPipe | M |
| D8 | Capacitor: iOS/Android shells, safe areas, Android back button, store listings 💰 | L |

### The proof of concept (`electron/`)
- `package.json`: Electron ^44.8.0 and electron-builder.
- Scripts: `start` (loads the repo's built `index.html`), `start:staged`, `dist`.
- `main.js` does the following:
  - serves the game from `app://bramblewood/`, so it isn't treated as a dev copy (no admin tools);
  - enforces the CSP;
  - supports range requests (for music);
  - blocks `../` path escapes;
  - keeps navigation inside the app, and opens web links in the system browser;
  - denies camera, microphone and location;
  - runs a single instance, with F11 for full screen;
  - has an optional Steam hook (`STEAM_APP_ID`);
  - sets `contextIsolation: true` and `sandbox: true`. steamworks.js's docs suggest turning these off; we use the main process plus a preload bridge instead.
- `stage.js` copies only what ships (index.html, version.json, assets/, art/, fonts/): **1,362 files, 52.7 MB** today.
- Run it:
  ```
  python3 assemble_arena.py && mv bramblewood-arena.html index.html   # as usual
  cd electron && npm i && npm start
  ```
- Checked here: syntax, the staging script, and the file handler with a stubbed Electron (index.html, `/`, version.json, a range request, path escapes refused). Electron itself wasn't downloaded or launched in this session.

---

## 5. Alt music (royalty-free)

### Where we are
Everything is synthesized live in Web Audio, with no files:
- **Battle music:** a generative loop per rival people (7 bands, 3 intensity levels by round and castle health).
- **Calm music:** a slow generative piano for the map and menus.
- **Ambience:** a scene per map style, for example forest, beach and grotto.
- Each music type has its own volume slider and ducks under big moments.

So "alt music" means **adding a recorded Soundtrack option**, not replacing the synth.

### Licences that are safe for a commercial Steam game

| Source | Licence | Attribution | Redistribution / catches |
|---|---|---|---|
| **Kevin MacLeod (incompetech)** | CC BY 4.0, or a paid no-credit licence (from about 30 USD a track) | "Music by Kevin MacLeod (incompetech.com), licensed under Creative Commons: By Attribution 4.0" | Very widely used, so players may recognise tracks |
| **OpenGameArt** | Per item: CC0, CC-BY, OGA-BY, CC-BY-SA, GPL | Yes for BY and OGA-BY | Prefer CC0 / CC-BY / OGA-BY. Avoid GPL. Use SA only unmodified |
| **Pixabay Music** | Pixabay Content License: free, no credit needed | Not required | You can't redistribute a track on its own (inside a game is fine). Some uploaders register tracks with YouTube Content ID, so trailers and streams can get claims. Check each track |
| **Free Music Archive** | Per-track Creative Commons | Per licence | Use only **CC BY** or **CC0** tracks. **NC** (non-commercial) and **ND** (no derivatives) are out. FMA itself doesn't license music; ask the artist |
| **itch.io packs** | Each pack has its own terms | Varies | Read each pack's licence file; most forbid reselling the files themselves |
| **soundimage.org (Eric Matyas)** | Free with attribution, says the author | Yes, per his attribution page | His terms page couldn't be opened from here, so read it before use |
| **Kenney** | CC0 | Not required | — |

**One catch for all Creative Commons licences:** CC licences forbid adding "technological measures" (DRM) that restrict the licensed material. Don't turn on Steam's optional DRM wrapper, or stick to CC0, OGA-BY and royalty-free licences.

### Shortlist (12; nothing downloaded)

| # | Track / pack | Licence | Use it for |
|---|---|---|---|
| 1 | [JRPG Pack 5 "Action" by Juhani Junkala (SubspaceAudio)](https://opengameart.org/node/73894) | CC0 | Battle loops ("Encounter With The Witches", "Preparing For Battle") |
| 2 | [JRPG Pack 3 "Evil" by Juhani Junkala](https://opengameart.org/node/73646) | CC0 | Bosses, the Deep, dark maps (Catacombs, Witch's Lair) |
| 3 | [Contemplative Fantasy OST by YannZ](https://lpc.opengameart.org/node/174713) | Free with attribution (own licence file) | Menus, map, pause, credits: 15 files incl. ten 1-minute loops |
| 4 | [Fantasy Music Loops Vol. 1 by FarBeyond Studio](https://farbeyond-studio.itch.io/fantasy-music-loops/purchase) | CC-BY (per the download's name; read the licence file) | Per-biome maps: forest, underwater, fire, winter |
| 5 | ["A Lush Forest Full of Magic" by Forest Full of Magic](https://forestfullofmagic.itch.io/magical-fantasy-forest-atmospheric-music) | Free for commercial use; credit appreciated | Forest maps (a seamless loop) |
| 6 | [Colossal Boss Battle Theme by Matthew Pablo](https://opengameart.org/node/20947) | CC-BY 3.0 | Raid bosses |
| 7 | ["The Last Encounter" RPG battle theme by Matthew Pablo](https://opengameart.org/node/22047) | CC-BY-SA 3.0 ⚠️ use unedited | Leader and elite fights (has looped versions) |
| 8 | [8-Bit Fantasy & Adventure Music Pack by xDeviruchi](https://xdeviruchi.itch.io/8-bit-fantasy-adventure-music-pack) | CC BY-SA 4.0 ⚠️ use unedited | A "Chiptune" soundtrack option (D17 direction B): 10 loops with intro/loop/end parts |
| 9 | [Kenney "Music Jingles" (Godot port; original on kenney.nl)](https://godotengine.org/asset-library/asset/1839) | CC0 | Victory, defeat, level-up and reward stingers |
| 10 | [Music of the Forest by Andrew Chambers](https://andrew-chambers.itch.io/music-of-the-forest) | Royalty-free, commercial OK, **24.99 USD** 💰 ❓ | Best fit for the cosy forest feel: 30 tracks, loops plus "reduced instrumentation" loops (good for intensity layers) |
| 11 | [Kevin MacLeod library (incompetech.com)](https://incompetech.com/) | CC BY 4.0 | Pick 2–3 Celtic/medieval tracks for towns (Tavern, Forge) |
| 12 | [Pixabay Music](https://pixabay.com/music/) (search "medieval fantasy", "lute") | Pixabay Content License | Extra town and shop loops. Check each track for Content ID |

### Procedural option (our own SoundKit)
- **Pros:** zero bytes, no licences, already adaptive (intensity follows the fight), and it fits the synthesized SFX.
- **Cons:** it sounds synthetic next to recorded music.
- **Improvements (M):**
  - per-biome modes and instruments, keyed off the same scene ids as `Ambience` (`mf`, `mb`, `mg`, …);
  - a short motif per people, reused in victory stingers;
  - a few CC0 instrument samples (one lute, one flute, one frame drum) played through Web Audio in place of the raw oscillators. That keeps it generative but sounds much more real.

### The music player (Soundtrack option)
- **`MusicDirector`** chooses a *slot* (menu, map:`<scene>`, battle:`<people>`, boss, victory, defeat) and asks the active source for a track: Generative (today's synth), Soundtrack (files) or Mixed (files on the map, synth in battles).
- **`assets/music/manifest.json`** holds one entry per track: `{id, file, slots, loopStart, loopEnd, gain, licence, credit, url}`. The Credits screen and `CREDITS.md` are generated from it.
- **Playback** uses `<audio>` elements through `MediaElementSource`, so long files stream instead of decoding fully into memory. Two gain nodes give **crossfades** (2 s; 0.5 s into a battle).
- **Loop points** come from the manifest (seamless loops); stingers duck the music.
- **Lazy loading:**
  - Nothing loads until music is first wanted.
  - Only the current slot's track loads, and the likely next one is prefetched (the map's battle).
  - Never inlined in `index.html`.
  - The Electron build serves the files with range requests (already in `main.js`).
- **Settings:**
  - Music: Generative / Soundtrack / Mixed.
  - The existing Battle and Menu sliders keep working.
  - Pause when the tab is hidden; respect the existing ducking.
- **Format:** Opus (`.ogg`/`.webm`) at 96–128 kbps with an `.m4a` (AAC) fallback for older Safari, normalised to about −16 LUFS like the SFX plan. Budget: about 2 MB per 2–3 minute loop, **25 MB total** to start.

### First steps
1. S: listen through the shortlist and pick 6–8 tracks ❓ (one per slot: menu, map, forest, water, battle, boss, victory).
2. M: build `MusicDirector`, the manifest, crossfades, lazy loading and the Settings choice, plus generated credits.
3. S: add the chosen files, with loop points set by ear.
4. M (optional): the sampled-instrument upgrade to the generative music.

---

## First week (all five)

| Day | Work |
|---|---|
| 1 | **Security:** apply drafts a + d after your "apply it" ❓; run the advisors. **Emoji:** the build step bundles Twemoji and Noto into `assets/emoji/`, and the jsDelivr URLs go |
| 2 | **Security:** switch the CSP to enforcing once the console shows no violations (the emoji are now local). **Desktop:** run the Electron POC on Windows and Mac, and note anything that looks different from Chrome |
| 3 | **Effects:** auto-downgrade, plus the Minimal style. **Music:** you pick tracks from the shortlist ❓ |
| 4 | **Music:** `MusicDirector` with crossfades, lazy loading, the Settings choice and generated credits. **Emoji:** Fluent Flat set, plus `LICENSES.txt` |
| 5 | **Security:** market v2 functions (draft b) after "apply it" ❓, and the client switch. **Desktop:** preload bridge (D3), plus the 6-digit email code sign-in for the desktop build |

The following week: server rewards (draft c), the Effects style setting with the Lab's "Use for" buttons, `icon-map.csv` with the CC0 pixel stand-ins, and steamworks.js with app 480.

## What needs you

| | Decision or money |
|---|---|
| ❓ | "Apply it" for `supabase/proposed/20261017_a…d` (one at a time is fine; a and d are low-risk) |
| ❓ | The hourly gain budgets in draft a (my guesses: 20,000 Maple / 1,000 Gold Leaves / 20,000 Dust / 300 Metal an hour) |
| ❓ | Market: should listing a card remove a copy from the seller? |
| ❓💰 | Supabase Pro (25 USD/month) for leaked-password protection |
| ❓ | At launch: stop serving `docs/`, `tools/`, `supabase/` and `hub/` from the game site? (Where should the hub live then?) |
| ❓💰 | Apple Developer Program (99 USD/year) when we want a Mac build or iOS. Windows signing only if you sell outside Steam |
| ❓ | Pick 6–8 tracks from the shortlist. Optionally buy *Music of the Forest* (24.99 USD) 💰 |
| ❓ | OK to add Fluent Flat as a third emoji set, and to start the pixel icon set with CC0 stand-ins? |

## Sources

Emoji and icons
- [Twemoji 17.0 README (licences, attribution, CDN pinning)](https://cdn.jsdelivr.net/npm/@twemoji/api@17.0.2/README.md)
- [Noto Emoji repository (OFL fonts, Apache 2.0 images)](https://github.com/googlefonts/noto-emoji)
- [OpenMoji 17.0 README (CC BY-SA 4.0)](https://cdn.jsdelivr.net/npm/openmoji@17.0.0/README.md) · [OpenMoji FAQ](https://openmoji.org/faq)
- [Microsoft Fluent Emoji](https://github.com/microsoft/fluentui-emoji) · [ciffelia/fluent-emoji (styles, MIT)](https://github.com/ciffelia/fluent-emoji)
- [Nikoichu Pixel Icons (CC0, 1,476 icons)](https://nikoichu.itch.io/pixel-icons) · [Kenney Board Game Icons (CC0)](https://kenney-assets.itch.io/board-game-icons) · [Kyrise 16×16 RPG icons (CC BY 4.0)](https://opengameart.org/content/kyrises-free-16x16-rpg-icon-pack) · [game-icons.net (CC BY 3.0)](https://game-icons.net/about.html)

Desktop, mobile and signing
- [Electron releases (44.8.0, 15 Oct 2026)](https://releases.electronjs.org/)
- [steamworks.js](https://www.npmjs.com/package/steamworks.js)
- [Steam overlay over WebView2 (Construct blog)](https://construct.net/fr/blogs/ashleys-blog-2/trying-show-steam-overlay-1861)
- [Electron vs Tauri vs Capacitor (Capgo)](https://capgo.app/blog/electron-vs-tauri-capacitor/) · [Road to Capacitor 9](https://www.plushcap.com/content/ionic/blog/ionic-the-road-to-capacitor-9)
- [Unity cancels the Runtime Fee (Personal limit 200,000 USD; Pro price)](https://unity.com/blog/unity-is-canceling-the-runtime-fee)
- [Azure Artifact Signing price and eligibility (DevClass)](https://devclass.com/2026/01/14/code-signing-windows-apps-may-be-easier-and-more-secure-with-new-azure-artifact-service/) · [Azure pricing page](https://azure.microsoft.com/en-us/pricing/details/trusted-signing/)
- [Apple Developer Program and notarization](https://flaviocopes.com/apple-developer-free-vs-paid/)
- [Google Play registration fee](https://support.google.com/googleplay/android-developer/answer/6112435)
- [Steam Direct](https://partner.steamgames.com/steamdirect)

Security
- [Supabase pricing (Pro 25 USD/month; leaked-password protection on Pro and up)](https://supabase.com/pricing) · [Leaked password protection needs Pro (GuardLayer)](https://www.guardlayer.io/blog/supabase-leaked-password-protection)
- Supabase security advisors and `pg_policies` for project xjctfwobcsyiztecutrb, read 2026-10-17

Music
- [Kevin MacLeod / incompetech licence summary](https://licenseorg.com/guide/music-audio/incompetech) · [Free game audio guide 2026 (Cinevva)](https://app.cinevva.com/guides/free-sound-effects-music)
- [Pixabay Content License summary](https://pixabay.com/en/service/license/)
- [Free Music Archive FAQ](https://freemusicarchive.org/faq/)
- [Eric Matyas on itch.io (terms page soundimage.org/attribution-info/ couldn't be opened from here)](https://itch.io/profile/eric-matyas)
- Track pages: as linked in the shortlist
