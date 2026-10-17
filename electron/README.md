# Desktop wrapper (proof of concept, 2026-10-17)

Runs the built game in an Electron window from local files. Plan and reasons: `docs/platform-roadmap-2026-10-17.md` §4.

```
# 1. build the game in the repo root (as usual)
python3 assemble_arena.py && mv bramblewood-arena.html index.html
# 2. run it on the desktop
cd electron
npm i          # downloads Electron (~100 MB, once)
npm start      # opens ../index.html as app://bramblewood/index.html
```

- `npm run start:staged` copies only what ships (index.html, version.json, assets/, art/, fonts/) into `electron/game/` and runs that copy.
- `npm run dist` makes an unpacked, unsigned app in `electron/dist/` (no installer).
- F11 toggles full screen. Ctrl+Shift+I opens DevTools (unpackaged runs only).

What works offline: everything single-player that works on the site without an account, in every language (the CJK and Tamil fonts ship in `fonts/`, see below). What needs the network: sign-in, cloud sync, ranked, live and co-op matches, raids, the market, feedback, published card edits. Google sign-in stays disabled in the desktop build for now (it needs a browser redirect; see the roadmap).

## Added 2026-10-18 (roadmap P6)

- **Offline script fonts** (`fonts/`): Noto Sans JP/SC/TC/KR and Baloo Thambi 2 (Tamil), OFL, subset to the characters in `lang/*.json` (2.3 MB in all). `stage.js` copies them to `game/fonts/script/`; an unstaged `npm start` serves them from here. `bramblewood-i18n.js` asks for `fonts/script/<code>.css` only under `app://` (or an Electron user agent) and falls back to Google Fonts if that file is missing. The website is unchanged. When translators add characters, `stage.js` warns; rebuild with `fonts/build_fonts.py` (instructions in its header).
- **App icon** (`build/`): `icon.png` (1024), `icon.ico` (16–256), `icons/<n>x<n>.png` (16–1024), drawn by `build/make_icon.py` (`npm run icon`). Wired in `package.json` → `build` and as the window icon.
- **Steam stub** (`steam.js`, `preload.js`): a no-op unless `BRAMBLE_STEAM=1` **and** `steamworks.js` is installed. The page gets `window.bwDesktop.steam` (`status`, `unlock(id)`, `isUnlocked(id)`, `openOverlay(dialog)`, `openStorePage()`, `playerName()`; `clear(id)` in unpackaged runs). Nothing in the game calls it yet.
  ```
  npm i steamworks.js              # optional; bundles Valve's redistributable, no SDK download
  BRAMBLE_STEAM=1 npm start        # with the Steam client running; App ID from STEAM_APP_ID, steam_appid.txt, else 480 (Spacewar)
  ```
- **Google sign-in stays off** here: the OAuth redirect can only return to a registered https:// page, not `app://`. The game hides the button off http(s) (`isHostedOnline()`). Email + password sign-in still works online (confirmation links in sign-up emails still point at the website). Real fix: system browser + PKCE + a `bramblewood://` deep link, or Steam sign-in (roadmap D5).
- Still needed before a real release: see `docs/platform-roadmap-2026-10-17.md`, section "2026-10-18".
