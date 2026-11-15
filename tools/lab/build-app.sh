#!/usr/bin/env bash
# 2026-11-16 (package LAB1): packs the Lab with an official Node binary.
#   bash tools/lab/build-app.sh mac-arm64|mac-x64|linux-x64 [out-dir]
# mac-*: "Bramblewood Lab.app" (a launcher script, Node, tools/lab), ad-hoc signed when codesign exists, zipped as BramblewoodLab-mac-<arch>.zip.
# linux-x64: the same folder layout as BramblewoodLab-linux-x64.zip (the CI's smoke test of the bundle). Nothing is bought or signed for real.
set -euo pipefail
TARGET="${1:?mac-arm64 | mac-x64 | linux-x64}"; OUT="${2:-dist}"
NODE_VERSION="${NODE_VERSION:-22.22.0}"
HERE="$(cd "$(dirname "$0")" && pwd)"
case "$TARGET" in
  mac-arm64) NODE_PLAT=darwin-arm64;; mac-x64) NODE_PLAT=darwin-x64;; linux-x64) NODE_PLAT=linux-x64;;
  *) echo "unknown target $TARGET" >&2; exit 2;;
esac
mkdir -p "$OUT"; OUT="$(cd "$OUT" && pwd)"; WORK="$(mktemp -d)"
if [[ -n "${LOCAL_NODE:-}" ]]; then NODE_BIN="$LOCAL_NODE"  # an offline build with a node binary already here (same platform)
else
  TARBALL="node-v$NODE_VERSION-$NODE_PLAT.tar.gz"
  curl -fsSL -o "$WORK/$TARBALL" "https://nodejs.org/dist/v$NODE_VERSION/$TARBALL"
  curl -fsSL -o "$WORK/SHASUMS256.txt" "https://nodejs.org/dist/v$NODE_VERSION/SHASUMS256.txt"
  ( cd "$WORK" && grep " $TARBALL\$" SHASUMS256.txt | (sha256sum -c - 2>/dev/null || shasum -a 256 -c -) )
  tar -xzf "$WORK/$TARBALL" -C "$WORK"
  NODE_BIN="$WORK/node-v$NODE_VERSION-$NODE_PLAT/bin/node"
fi

if [[ "$TARGET" == mac-* ]]; then
  APP="$WORK/Bramblewood Lab.app"; C="$APP/Contents"
  mkdir -p "$C/MacOS" "$C/Resources/node" "$C/Resources/lab"
  cp "$NODE_BIN" "$C/Resources/node/node"
  cp "$HERE"/*.js "$HERE"/*.html "$HERE"/package.json "$HERE"/README.md "$C/Resources/lab/"
  cat > "$C/MacOS/BramblewoodLab" <<'EOF'
#!/bin/bash
# Starts the Lab (or opens the one already running) and its page in the default browser. Log: ~/Library/Logs/BramblewoodLab.log
R="$(cd "$(dirname "$0")/../Resources" && pwd)"
if [ "$#" -gt 0 ]; then exec "$R/node/node" "$R/lab/lab.js" "$@"; fi
mkdir -p "$HOME/Library/Logs"
exec "$R/node/node" "$R/lab/lab.js" serve >>"$HOME/Library/Logs/BramblewoodLab.log" 2>&1
EOF
  chmod +x "$C/MacOS/BramblewoodLab" "$C/Resources/node/node"
  VER="$(node -p "require('$HERE/package.json').version" 2>/dev/null || echo 1.0.0)"
  cat > "$C/Info.plist" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>CFBundleName</key><string>Bramblewood Lab</string>
  <key>CFBundleDisplayName</key><string>Bramblewood Lab</string>
  <key>CFBundleIdentifier</key><string>app.bramblewood.lab</string>
  <key>CFBundleVersion</key><string>$VER</string>
  <key>CFBundleShortVersionString</key><string>$VER</string>
  <key>CFBundleExecutable</key><string>BramblewoodLab</string>
  <key>CFBundlePackageType</key><string>APPL</string>
  <key>LSMinimumSystemVersion</key><string>11.0</string>
  <key>LSUIElement</key><true/>
</dict></plist>
EOF
  if command -v codesign >/dev/null; then codesign --force --deep --sign - "$APP"; fi
  ZIP="$OUT/BramblewoodLab-mac-${TARGET#mac-}.zip"; rm -f "$ZIP"
  if command -v ditto >/dev/null; then ditto -c -k --keepParent "$APP" "$ZIP"; else (cd "$WORK" && zip -qry "$ZIP" "Bramblewood Lab.app"); fi
  echo "$ZIP"
else
  B="$WORK/BramblewoodLab"; mkdir -p "$B/node" "$B/lab"
  cp "$NODE_BIN" "$B/node/node"; cp "$HERE"/*.js "$HERE"/*.html "$HERE"/package.json "$HERE"/README.md "$B/lab/"
  printf '#!/bin/sh\nR="$(cd "$(dirname "$0")" && pwd)"\nexec "$R/node/node" "$R/lab/lab.js" "$@"\n' > "$B/bramblewood-lab"; chmod +x "$B/bramblewood-lab"
  ZIP="$OUT/BramblewoodLab-$TARGET.zip"; rm -f "$ZIP"; (cd "$WORK" && zip -qry "$ZIP" BramblewoodLab); echo "$ZIP"
fi
rm -rf "$WORK"
