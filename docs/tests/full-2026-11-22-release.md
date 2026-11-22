# Full run after the 11-22 release (build 2b676b7e9652)

`node tests/run.js --full`, 4,095 s, machine also running the look-ahead measure: **430 passed, 38 failed** (morning run: 432 / 35).
- Fixed since the morning (TESTFIX8): ed, fix6, fx14, lab-errors, ui2, ux.
- New, load only (pass alone): game-texts, ui51; e5det and fin2 hit the 600 s ceiling under load.
- New, real (next test-fix batch, TESTFIX9):
  - uifin #6: pinned the old design keys; now applies the owner's later table moves (FOCUS2, NOC7, MAPADD1-1). Fixed in TESTFIX9.
  - n221: glowworm-cluster is both awaiting and sourced (NOC7 put it on the Morel Hollow list).
  - lvl10: leopard-slug over N(L) at Levels 4-10 (NOC7 gave it Nocturnal + Corrode).
  - bal24, bal21, bal13, ref5: reference / collection decks hold cards that left the lists (NOC7 moved Moonlit Hare off mf / mb).
  - reward-screens B4: an elite win shows no gold card. Needs a look: may be a real reward bug.
- Older, unchanged: the 29 others (list in tests/.last-failures.txt at this commit).
