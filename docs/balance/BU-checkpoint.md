# BU checkpoint (battle UI fixes, 2026-10-19)

Owner feedback 12:23 (iPhone 430 px). Items:
1. centre column always a legal, visible drop target when empty
2. castle/bramble damage floats centred on the HP bar they hit (rect-based)
3. Cleave FX anchored attacker -> target, sized to cards, crisper crescent (fx + effects lab)
4. speed 3x/4x/5x gated by Map 20/40/60 cleared (admins all); locked speeds skipped; TX keys
5. Playwright tests (430x932, 390x844, 1366x768) + node unit test for speed gating
6. (added) raid Goliath tentacle strike FX rebuilt: SVG tentacle, slam/squash/shake/smoke/retract; effects lab; 390x844 raid frames

## Status
- [x] 1 engine legalSlots (slot 0 legal when empty) + mb2SpanWindow holds column 0, centred within MB2_CENTRE_SLACK = 1 column
- [x] 2 hqRibbonFloatAnchor: the track's rect centre; floatText no x jitter on it
- [x] 3 cleaveSlots: side points from the target's row only; SkillFX.crescentSlash (cleaveSwing + cleave); lab p1 variant F
- [x] 4 speedStepsFor / SPEED_GATES / speedLockedHints; TX ui.speed-locked + 12 lang packs
- [x] 5 tests/bu-2026-10-19.js (46 checks, in run-all.sh), tests/e2e/battle_ui_2026_10_19.py (passes); card-matrix golden re-accepted (22 open matches, the centre rule only: verified by running with the rule off = 0 diffs)
- [x] 6 FX.F.tentacleSmack rebuilt (tentacleSVG, smokePuff); raidSmackFx shows at Low and under reduced motion (flash); lab inventory + row smack entry
- [x] CHANGELOG, screenshots docs/screens/bu (before-*, after-*)
- [x] merged main (RB), rebuilt, e2e + unit + affected tests pass; final commit
