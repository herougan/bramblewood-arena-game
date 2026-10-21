#!/usr/bin/env bash
# Merge a finished package branch into main with the standing merge rules (2026-10-21, workflow audit).
#   bash tools/merge/merge_pkg.sh <branch>        merge, auto-resolve the known files, rebuild, commit
#   MERGE_TITLE="package XX (what)" COMMIT_TRAILER="<attribution lines>" bash tools/merge/merge_pkg.sh <branch>
# Known files:
#   generated (take ours, the rebuild regenerates them): index.html, version.json, assets/lang/*.js, docs/game-texts.xlsx, docs/dialogues-*.xlsx
#   translation packs (3-way by key): lang/*.json, lang/ui/*.json
#   keep both sides: docs/CHANGELOG.md, tests/run-all.sh, and keys both sides appended to bramblewood-texts.js's TEXT table
# After the rebuild it checks the JSON files parse and that card ids and numericIds are unique (parallel packages have collided).
# Anything else that conflicts (above all .js) is listed and the script stops with the merge still open: resolve it by hand,
# or `git merge --abort` and ask the package's agent to merge main itself. Never union .js files.
set -uo pipefail
cd "$(dirname "$0")/../.."
B="${1:?usage: merge_pkg.sh <branch>}"
if git rev-parse -q --verify MERGE_HEAD >/dev/null; then
  [ "$(git rev-parse MERGE_HEAD)" = "$(git rev-parse "$B")" ] || { echo "another merge is open: finish or abort it first"; exit 1; }
  echo "resuming the open merge of $B"; conflicted=1
else
  git merge --no-edit "$B" >/dev/null 2>&1; conflicted=$?
  if ((conflicted)) && ! git rev-parse -q --verify MERGE_HEAD >/dev/null; then echo "git merge failed before merging (untracked files in the way?):"; git merge --no-edit "$B" 2>&1 | head -5; exit 1; fi
fi
if ((conflicted)); then
  manual=()
  while IFS= read -r f; do
    case "$f" in
      index.html|version.json|assets/lang/*.js|docs/game-texts.xlsx|docs/dialogues-*.xlsx) git checkout --ours -- "$f" ;;
      lang/*.json|lang/ui/*.json) python3 tools/merge/merge_lang.py "$f" >/dev/null ;;
      docs/CHANGELOG.md|tests/run-all.sh) python3 tools/merge/union.py "$f" >/dev/null ;;
      bramblewood-texts.js) python3 tools/merge/union_texts.py >/dev/null && node -e "global.window=global;require('./bramblewood-texts.js')" || { manual+=("$f"); continue; } ;;
      *) manual+=("$f"); continue ;;
    esac
    git add -- "$f"
  done < <(git diff --name-only --diff-filter=U)
  if ((${#manual[@]})); then printf 'NEEDS HAND RESOLUTION:\n'; printf '  %s\n' "${manual[@]}"; exit 2; fi
fi
node tools/merge/prune_ui_lang.js
python3 assemble_arena.py >/dev/null && mv bramblewood-arena.html index.html || { echo "BUILD FAILED"; exit 3; }
for f in lang/*.json lang/ui/*.json canonical/*.json; do python3 -c "import json,sys; json.load(open(sys.argv[1]))" "$f" || { echo "BAD JSON $f"; exit 4; }; done
node -e "const c=require('./canonical/cards.json');const seen={},dup=[];for(const x of c){for(const k of ['id','numericId']){if(x[k]==null)continue;const key=k+':'+x[k];if(seen[key])dup.push(key);seen[key]=1}}if(dup.length){console.log('DUPLICATE card ids: '+dup.join(', '));process.exit(5)}" || exit 5
git add -A
MSG="Merge ${MERGE_TITLE:-$B}${COMMIT_TRAILER:+

$COMMIT_TRAILER}"
if git rev-parse -q --verify MERGE_HEAD >/dev/null; then git commit -q -m "$(printf "$MSG")"; fi
git diff --quiet HEAD || git commit -qm "$(printf "Rebuild after merging $B${COMMIT_TRAILER:+

$COMMIT_TRAILER}")"
echo "merged $B → $(git log -1 --format='%h %s' | cut -c1-90)"
echo "next: node tests/run.js --smoke, then the package's own tests (node tests/run.js --only '<name>')"
