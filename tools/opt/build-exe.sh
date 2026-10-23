#!/usr/bin/env bash
# 2026-10-23 (package OPT, owner 20:44: "not using tokens but a constructed exe"): builds tools/opt/deckopt.js into ONE executable with
# Node's Single Executable Applications (Node 21.7+ for SEA assets; the worker threads load the embedded copy of deckopt.js).
#   bash tools/opt/build-exe.sh [out-dir]        (default: ${TMPDIR:-/tmp}/deckopt-exe)
# Then, from a checkout of the game (the exe reads arena_app.js, the engine and canonical/*.json from its working folder, so it always
# measures the cards you have):
#   cd <repo> && <out-dir>/deckopt --map 3 --minutes 20 --workers 4
# The exe is built for the machine that builds it (Linux -> Linux, Windows -> deckopt.exe, macOS -> signed ad hoc). No account, nothing
# bought: postject is fetched once by npx from the public npm registry.
# If SEA is not available (Node < 21.7): `npx pkg tools/opt/deckopt.js --targets node18-linux-x64 --output deckopt` makes the same kind of
# file (pkg is no longer maintained; prefer SEA), or simply run `node tools/opt/deckopt.js ...`, which needs nothing but Node.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUT="${1:-${TMPDIR:-/tmp}/deckopt-exe}"
mkdir -p "$OUT"
major=$(node -p 'process.versions.node.split(".").map(Number).reduce((a,v,i)=> i===0 ? v*100 : i===1 ? a+v : a, 0)')
if (( major < 2107 )); then echo "Node $(node --version) has no SEA assets (needs 21.7+); see the pkg line at the top of this script" >&2; exit 2; fi
EXE="$OUT/deckopt"; case "$(uname -s)" in MINGW*|MSYS*|CYGWIN*) EXE="$OUT/deckopt.exe";; esac
cat > "$OUT/sea-config.json" <<EOF
{ "main": "$ROOT/tools/opt/deckopt.js", "output": "$OUT/deckopt.blob", "disableExperimentalSEAWarning": true,
  "assets": { "deckopt.js": "$ROOT/tools/opt/deckopt.js" } }
EOF
node --experimental-sea-config "$OUT/sea-config.json"
cp "$(command -v node)" "$EXE"; chmod u+w "$EXE"
if [[ "$(uname -s)" == Darwin ]]; then
  codesign --remove-signature "$EXE" || true
  npx --yes postject@1.0.0-alpha.6 "$EXE" NODE_SEA_BLOB "$OUT/deckopt.blob" --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 --macho-segment-name NODE_SEA
  codesign --sign - "$EXE" || true
else
  npx --yes postject@1.0.0-alpha.6 "$EXE" NODE_SEA_BLOB "$OUT/deckopt.blob" --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2
fi
"$EXE" --version
echo "built $EXE ($(du -h "$EXE" | cut -f1)); run it from the game checkout: cd $ROOT && $EXE --map 3 --minutes 20"
