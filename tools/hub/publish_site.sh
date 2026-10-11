#!/usr/bin/env bash
# Copy the built master hub (.hub/, from tools/hub/build_hub.py) to hub/ so it ships with the game site as a hidden page
# (2026-10-11, user: "put the bramblewood master hub as a hidden page on the game site"). Nothing in the game links to it;
# robots.txt and an X-Robots-Tag header (vercel.json) keep it out of search engines. Hidden, not locked.
set -euo pipefail
cd "$(dirname "$0")/../.."
[ -f .hub/index.html ] || { echo "build the hub first: python3 tools/hub/build_hub.py"; exit 1; }
rm -rf hub && mkdir -p hub && cp -r .hub/. hub/
for f in hub/*.html; do
  grep -q 'name="robots"' "$f" || sed -i '0,/<head[^>]*>/s//&<meta name="robots" content="noindex, nofollow">/' "$f"
  grep -q 'name="robots"' "$f" || sed -i '1s/^/<meta name="robots" content="noindex, nofollow">\n/' "$f"
done
echo "hub/ ready: $(du -sh hub | cut -f1), $(find hub -type f | wc -l) files"
