#!/bin/bash
# 2026-11-21 (package REFIT18): scan round 2 (60 games, seed 171300, nice 10): 20-4 with its pre-existing boon line ignored (no Undead card
# in its pool, so restlessDead is off for every deck, the live one too); two-step swaps for 18-2 and 18-3 from round 1's best decks.
cd "$(dirname "$0")" || exit 1
S=swap_2026_11_21.js
run() { local L=$1; shift; grep -q '^blocked:' "$L" 2>/dev/null && return; [ -f "$L" ] && cp "$L" "$L.part"
  DONE="$L.part" nice -n 10 node $S "$@" >> "$L" 2>&1; rm -f "$L.part"; }
( IGNORE=restlessDead run swap-20-4.log 20-4 60 171300 2 all all ) &
( run swap-18-2-s2.log 18-2 60 171300 2 all all '{"antlion-pit":3,"caustic-scorpion":2,"roadrunner-courier":4,"sunbittern-strider":4,"mouse-sapper":1,"horned-lizard":3}'
  run swap-18-3-s2a.log 18-3 60 171300 1 all all '{"armadillo-guard":4,"caustic-scorpion":4,"horned-lizard":4,"worker-ant":1,"mouse-sapper":1,"antlion-pit":1}'
  run swap-18-3-s2b.log 18-3 60 171300 1 all all '{"armadillo-guard":4,"caustic-scorpion":4,"horned-lizard":4,"mouse-sapper":1,"barrel-cactus":1,"sandstorm-roc":1}' ) &
wait
echo SCAN2 DONE
