#!/usr/bin/env bash
# Merge a finished package branch into main with the standing merge rules (2026-10-21, workflow audit).
#   bash tools/merge/merge_pkg.sh <branch>        merge, auto-resolve the known files, rebuild, commit
# Known files:
#   generated (take ours, the rebuild regenerates them): index.html, version.json, assets/lang/*.js, docs/game-texts.xlsx, docs/dialogues-*.xlsx
#   translation packs (3-way by key): lang/*.json, lang/ui/*.json
#   keep both sides: docs/CHANGELOG.md, tests/run-all.sh
# After the rebuild it checks the JSON files parse and that card ids and numericIds are unique (parallel packages have collided).
# Anything else that conflicts (above all .js) is listed and the script stops with the merge still open: resolve it by hand,
# or `git merge --abort` and ask the package's agent to merge main itself. Never union .js files.
set -uo pipefail
cd "$(dirname "$0")/../.."
B="${1:?usage: merge_pkg.sh <branch>}"
if ! git merge --no-edit "$B" >/dev/null 2>&1; then
  manual=()
  while IFS= read -r f; do
    case "$f" in
      index.html|version.json|assets/lang/*.js|docs/game-texts.xlsx|docs/dialogues-*.xlsx) git checkout --ours -- "$f" ;;
      lang/*.json|lang/ui/*.json) python3 tools/merge/merge_lang.py "$f" >/dev/null ;;
      docs/CHANGELOG.md|tests/run-all.sh) python3 tools/merge/union.py "$f" >/dev/null ;;
      *) manual+=("$f"); continue ;;
    esac
    git add -- "$f"
  done < <(git diff --name-only --diff-filter=U)
  if ((${#manual[@]})); then printf 'NEEDS HAND RESOLUTION:\n'; printf '  %s\n' "${manual[@]}"; exit 2; fi
fi
python3 assemble_arena.py >/dev/null && mv bramblewood-arena.html index.html || { echo "BUILD FAILED"; exit 3; }
for f in lang/*.json lang/ui/*.json canonical/*.json; do python3 -c "import json,sys; json.load(open(sys.argv[1]))" "$f" || { echo "BAD JSON $f"; exit 4; }; done
node -e "const c=require('./canonical/cards.json');const seen={},dup=[];for(const x of c){for(const k of ['id','numericId']){if(x[k]==null)continue;const key=k+':'+x[k];if(seen[key])dup.push(key);seen[key]=1}}if(dup.length){console.log('DUPLICATE card ids: '+dup.join(', '));process.exit(5)}" || exit 5
git add -A
if git rev-parse -q --verify MERGE_HEAD >/dev/null; then git commit -q --no-edit; fi
git diff --quiet HEAD || git commit -qm "Rebuild after merging $B"
echo "merged $B → $(git log -1 --format='%h %s' | cut -c1-90)"
echo "next: node tests/run.js --smoke, then the package's own tests (node tests/run.js --only '<name>')"
