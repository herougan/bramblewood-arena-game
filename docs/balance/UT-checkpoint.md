# Package UT checkpoint (2026-10-19)

Owner directions 09:52: animal tags, Base cards, Dire/Elder balanced by N, raid elder art brief, art reuse map.

## Decisions so far
- cards.json writes: Python `json.dumps(d, indent=2) + '\n'` round-trips the file exactly (ensure_ascii on).
- Base cards: faction 'otters' -> 'base' (keeps `d.faction` truthy, so cardBaseLevel / skill_costs levelOf = Level 1 unchanged; no skill_costs.js edit, BF owns it).
- Tutorial copies: granted at level 0 via copy flag hatch:1 + tut:1.

## Steps
- [ ] 1 animal tags (tools/animal_tags.js -> cards.json animal/subtype, canonical/animal-tags.json)
- [ ] 2 base cards (faction otters -> base; UI labels/filters; tutorial level 0)
- [ ] 3 variants by N (unit_themes.js, units_tab.js)
- [ ] 4 raid elder art brief
- [ ] 5 art reuse map
- [ ] Codex detail + filter, TX keys, test, CHANGELOG, build, merge main, commit
