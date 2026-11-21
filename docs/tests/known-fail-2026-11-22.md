# Old unit failures after release ddb42d7a8 (2026-11-22, TESTFIX4 triage)

GitHub full run 44915077641: 38 failing tests, the same 38 as the run before UIQ2 (44909706565), so nothing new.
Run locally the same day: mapfx1 and ui29 pass here (CI environment). TESTFIX4 fixed four tests whose checks predate later owner calls:
lvl10, easter-eggs, prayer, gi (out-of-play cards reported apart, as LISTFIX1 says; owner edits FOLD8, SKIN3, FOCUS2 respected).

Left, by cause (each needs a tool re-run or an owner call, not a test edit):
- **Out-of-play cards still in decks / lists** (DATAFIX 11-18 moved 21 cards to "basic pack, no list"): pvp1 (PvP test decks hold them;
  `node tools/pvp1/pvp1.js build` then `apply`, a long CPU job), bal7 M3 (they carry no `unattainable` flag), skir1, lead, pro.
- **Stored measures out of date after later refits**: pale-desert (side road 18-A), winrate-panel (Map 23), bal9 / bal12 / bal13 / bal14 /
  bal21 / bal25 (band lists), ref5 (Map 6 collection), deck1, df3, bf5, keywords-w3 (tower floors 44-49).
- **Budget over on in-play cards the owner holds** (DEC1): content2 / content12 (nutria-reedcutter, venomlord-serpent), bx (Otter Kit), budget2.
- **Content lists moved since the test's plan**: content16 (pack plan), rewards-pass, road-rarity (Maps 21+, out of scope), card-pool,
  thematic, unit-themes, side1 (card-power rows for 5 cards), eb (1-5's Badger Lumberjack), bal3 (13-4 / 20-4 boons, 21-3).
