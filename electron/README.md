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

What works offline: everything single-player that works on the site without an account. What needs the network: sign-in, cloud sync, ranked, live and co-op matches, raids, the market, feedback, published card edits. Google sign-in stays disabled in the desktop build for now (it needs a browser redirect; see the roadmap).

Steam (later): `npm i steamworks.js`, then `STEAM_APP_ID=480 npm start` with the Steam client running (480 is Valve's Spacewar test app).
