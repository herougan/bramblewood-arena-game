#!/usr/bin/env bash
# 2026-11-16 (package INFRA1): installs what the unit tests need on a GitHub ubuntu-latest runner, as on the dev machine:
# Playwright 1.56.0 for Node (global, found through NODE_PATH) and Python, Pillow / openpyxl / numpy, and the Chromium headless shell
# at /opt/pw-browsers/chromium_headless_shell-1194 (the path the tests name; BW_CHROMIUM overrides it). Used by .github/workflows/tests.yml.
set -euo pipefail
PW=1.56.0
sudo mkdir -p /opt/pw-browsers && sudo chown "$(id -u)" /opt/pw-browsers
npm install -g --no-fund --no-audit "playwright@$PW"
# 2026-11-16 (coordinator): versions as on the dev machine (mapfx1 compares painter output); markdown for the hub tests
# 2026-11-27 (package TESTFIX12): scipy too: tools/map_fx_spots_2026_10_31.py's ponds() imports it, and without it every pond map was
# skipped ("error No module named scipy"), so mapfx1's MAP_FX_SPOTS check failed on CI only
python3 -m pip install --quiet "playwright==$PW" "pillow==12.3.0" "numpy==2.5.3" "scipy==1.18.1" "openpyxl==3.1.5" "markdown==3.11"
PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers "$(npm root -g)/playwright/cli.js" install --with-deps chromium-headless-shell
test -x /opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell || { echo "Chromium is not at the path the tests name"; ls /opt/pw-browsers; exit 1; }
{ echo "NODE_PATH=$(npm root -g)"; echo "PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers"; } >> "${GITHUB_ENV:-/dev/null}"
# 2026-11-16 (coordinator): the Effects Lab build reads .fxcat/cards.json, captured from a running game (gitignored); capture it here
( mkdir -p .fxcat; python3 -m http.server 8765 >/dev/null 2>&1 & echo $! > /tmp/srv.pid; sleep 2; python3 tools/effects-lab/capcards.py || echo "capcards failed (lab-errors may fail)"; kill "$(cat /tmp/srv.pid)" ) || true
python3 -c "import PIL,numpy,sys;print(\"py\",sys.version.split()[0],\"pillow\",PIL.__version__,\"numpy\",numpy.__version__)" # 2026-11-16 (coordinator): mapfx1 differs on CI only; versions for the log
