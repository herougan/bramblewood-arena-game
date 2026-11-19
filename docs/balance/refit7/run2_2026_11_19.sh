#!/bin/bash
# 2026-11-19 (package REFIT7): the second pass over the fights still out of band in the after-pass-1 road read (plan2-2026-11-19.txt, from
# skirmish-pass-refit7-after1-s9100.jsonl), from the decks pass 1 applied. Lane B: the wide search on the fights 20+ off (W), then the
# neighbour search on the other out-of-band fights of those maps (B1), one accepted file (accB2) so a map stays jointly legal; lane A: the
# neighbour search on the rest (A1, accA2). Fresh search seeds 181300 / 182300 (wide: 171300 / 172300). Resumable.
cd "$(dirname "$0")/../../.." || exit 1
P=docs/balance/refit7; L() { grep "^$1:" $P/plan2-2026-11-19.txt | cut -d: -f2; }
SEED1=181300 SEED2=182300 bash $P/lane_2026_11_19.sh $P/accA2.jsonl $P/laneA2.log $(L A1) &
{ bash $P/wide_2026_11_19.sh $P/accB2.jsonl $P/laneW2.log $(L W); SEED1=181300 SEED2=182300 bash $P/lane_2026_11_19.sh $P/accB2.jsonl $P/laneB2.log $(L B1); }
wait
grep -h RESULT $P/laneA2.log $P/laneB2.log | wc -l
