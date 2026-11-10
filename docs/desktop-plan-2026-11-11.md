# Desktop (Electron) copy: state and plan (2026-11-11, package DESK2)

**Headline:** today's game runs in the desktop wrapper and works fully offline for single-player. A new GitHub Actions workflow builds Windows, macOS and Linux apps (unsigned). The next step toward a Steam demo is one CI run, then a test on a real Windows PC and a Mac.

## Where it stands
- **Tested here (Linux, headless, with no network at all):** the game (build `7f1ceca4233f`, Electron 44.10.2) loads. The name and side screens work, and a quick AI fight plays. Gold and the chosen language survive a restart. The UI fonts and the Japanese font load from the app. The only console errors are the Supabase calls failing.
- **Packaged Linux app** (electron-builder, the same command CI runs): starts offline from the package. 195 MB download (`.tar.gz`), 381 MB installed. The game is 92 MB of that and Electron is the rest.
- **Windows and macOS:** packaged by CI only. They haven't been run on a real machine yet.
- **Fixed today:** the Chinese, Japanese and Korean fonts were missing 325-690 characters each (new translations), so they were rebuilt. The content security policy (CSP: the rules for what the page may load) is tighter. Electron's "fuses" (built-in security switches) are on in packaged builds. `package-lock.json` is committed so CI installs the same versions every time.

## Offline: works / doesn't
| Works offline | Needs the network (fails quietly offline) |
|---|---|
| Guest play, Conquest, skirmishes, Gauntlet, dungeons, Codex, Nest, Forge, settings, all 12 languages | Sign-in and cloud sync, Friends, **opening Shop packs** ("Sign in to open packs"), ranked / live / co-op, raids, market, world events, feedback, live card overrides |

- **Saves** stay in the player's profile folder: `%APPDATA%\Bramblewood Arena` (Windows), `~/Library/Application Support/Bramblewood Arena` (Mac), `~/.config/Bramblewood Arena` (Linux).
- **At start-up the game calls Supabase about 13 times:** anonymous sign-up, card overrides and raid bosses (4 tries each), raid attempts and world events. Offline each call fails fast. The page shows "Guest · Sign in", and a sign-in attempt returns a "Failed to fetch" error, with no crash.
- **Google sign-in** stays off on desktop (greyed out: "only works on the hosted site"). Email sign-in online wasn't checked: this sandbox can't reach Supabase.

## Security check
| Item | State |
|---|---|
| Page isolation: contextIsolation and sandbox on, nodeIntegration off | ✅ Checked live: the page has no `require`, `process` or `module` |
| CSP, enforced on every file | ✅ Scripts only from the app: no `eval`, and a remote `<script>` is blocked (checked live). Since today nothing remote loads except Supabase: Google Fonts is gone, and images come only from Supabase and Google profile photos. ⚠️ `'unsafe-inline'` stays: the game is one HTML file and still has 8 inline handlers |
| Navigation and new windows | ✅ Opening `file://` is refused, `window.open` is denied, https links open in the system browser, `<webview>` is blocked |
| `app://` file server | ✅ `../` path escapes and other hosts are refused (checked live) |
| Preload | ✅ Exposes only `window.bwDesktop` (platform + Steam). IPC answers only `app://bramblewood` |
| Permissions | ✅ All denied except full screen and clipboard write |
| Fuses (new) | ✅ No run-as-Node, `NODE_OPTIONS` or `--inspect`, and app code loads only from the asar archive (checked on the Linux package). Asar integrity and cookie encryption are left off until signing |
| Admin tools | ✅ Off for players (not a dev host). ⚠️ An admin account still sees them, because `LAUNCH_BUILD` is false |

## The CI workflow (`.github/workflows/desktop-build.yml`)
- **Run it:** Actions tab → **Desktop build** → Run workflow, or push a tag such as `desktop-v0.1.0`. It never runs on an ordinary push.
- **What it does:** it checks that the committed `index.html` and `version.json` match, then stages that build (the same files Vercel serves). It then packages three apps in parallel and uploads them as the run's artifacts:
  - `bramblewood-arena-windows`: zip, x64
  - `bramblewood-arena-macos`: zip, arm64 + x64, ad-hoc signed
  - `bramblewood-arena-linux`: tar.gz, x64

  Build and commit `index.html` first, as in every release.
- **Cost:** the repo is public, so GitHub's runners are free, Mac and Windows included. A run takes roughly 15-25 minutes.
- **Unsigned:** on Windows, SmartScreen asks: "More info" → "Run anyway". On a Mac: right-click → Open (or System Settings → Privacy & Security → Open Anyway).
- **Checked:** actionlint 1.7.12 found no problems, and the YAML parses. The Linux packaging command ran here and worked. The Windows and Mac jobs will first run on GitHub.

**What you do on GitHub**
1. Actions is already on (CodeQL and the Deck optimizer use it). Once this branch is on `main`, run **Desktop build** by hand and download the three artifacts.
2. Later, signing: Settings → Secrets and variables → Actions → New repository secret.
   - Mac: `MAC_CSC_LINK`, `MAC_CSC_KEY_PASSWORD`, `APPLE_API_KEY_ID`, `APPLE_API_ISSUER`, `APPLE_API_KEY_P8`.
   - Windows (only if you sell outside Steam): `WIN_CSC_LINK`, `WIN_CSC_KEY_PASSWORD`.
   - Then uncomment the signing steps in the workflow. Steam doesn't need signing.
3. Steam partner steps:
   1. Open a Steamworks account and pay the Steam Direct fee (100 USD) to get an App ID.
   2. Create the 13 achievements with the API names in `docs/platform-roadmap-2026-10-17.md`.
   3. Add Windows, macOS and Linux depots and a launch option for each.
   4. Upload a build with SteamPipe (by hand at first).

## Next steps toward a Steam demo (ranked)
| # | Step | Effort |
|---|---|---|
| 1 | First CI run, then try each build on a real Windows PC and a Mac (start, a fight, quit, restart) and fix what shows up | S |
| 2 | Steam hook-up: put the App ID in `steam_appid.txt` and add `steamworks.js` to the CI build. Test achievements (wired since 10-18) with Spacewar (480), then the real ID | M |
| 3 | Demo switch: a build flag that stops at the demo's last map, plus a "Wishlist on Steam" button (`bwDesktop.steam.openStorePage`) | M |
| 4 | Guests and packs: the Shop needs sign-in to open packs, so an offline or guest demo player can't open any. Pick a fix (decision 2 below) | M-L |
| 5 | Desktop wording: the welcome screen says "Free to play · No install · Runs right in your browser". Swap it on desktop (12 language packs) | S |
| 6 | A Quit button (`bwDesktop.quit`) in Settings. The window has no menu bar; F11 toggles full screen | S |
| 7 | `LAUNCH_BUILD` on for desktop builds, so no admin tools ship | S |
| 8 | Steam Cloud: a save file in the profile folder for Steam Auto-Cloud (roadmap D3) | M |
| 9 | Steam overlay on Mac (one more entitlement) and a Steam Deck test (Linux build or Proton) | S-M |
| 10 | SteamPipe upload from CI (a builder-account secret) | M |
| 11 | CSP without `'unsafe-inline'`: hash the inline scripts at staging, once the 8 inline handlers are gone | M |
| 12 | Signing and notarisation (Mac 99 USD a year; Windows only outside Steam) | M |

S = under half a day, M = 1-3 days, L = a week or more.

## Your decisions (one line each)
1. **Demo scope:** Maps 0-5 (the Steam plan), or another cut?
2. **Guests on desktop:** let them open packs offline (local economy), or require Steam sign-in first?
3. **Mac on Steam:** ship the ad-hoc-signed Mac build (no Apple fee), or wait for the 99 USD notarised one?
4. **Uploads to Steam:** from CI (needs a Steam builder account as a secret) or by hand?

Balancing status (DESK2 changes no balance; last read BAL46, 400 games, main maps): 135 of 149 road fights in band, 141 within 10, 4 beyond 20. Open: BAL46-1 (Morel Monarch 7-6, a little easy), BAL43-1/2, BAL42-1.
