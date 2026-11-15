#!/usr/bin/env bash
# 2026-11-16 (package INFRA1): installs what the unit tests need on a GitHub ubuntu-latest runner, as on the dev machine:
# Playwright 1.56.0 for Node (global, found through NODE_PATH) and Python, Pillow / openpyxl / numpy, and the Chromium headless shell
# at /opt/pw-browsers/chromium_headless_shell-1194 (the path the tests name; BW_CHROMIUM overrides it). Used by .github/workflows/tests.yml.
set -euo pipefail
PW=1.56.0
sudo mkdir -p /opt/pw-browsers && sudo chown "$(id -u)" /opt/pw-browsers
npm install -g --no-fund --no-audit "playwright@$PW"
python3 -m pip install --quiet "playwright==$PW" pillow openpyxl numpy
PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers "$(npm root -g)/playwright/cli.js" install --with-deps chromium-headless-shell
test -x /opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell || { echo "Chromium is not at the path the tests name"; ls /opt/pw-browsers; exit 1; }
{ echo "NODE_PATH=$(npm root -g)"; echo "PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers"; } >> "${GITHUB_ENV:-/dev/null}"
