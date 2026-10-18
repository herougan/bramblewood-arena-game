# Guild skills (2026-10-19, package G)

Owner, 2026-10-18 20:45: "Guild skills. Starting with +raid HP to your bramble."

## What players see

The Guild tab has a new **🌱 Guild skills** panel under the roster:

- One row per skill: its icon, name, level ("Level 3 of 5"), what a level does, what it does now ("Now: +12% bramble Health in raid fights"), and the next level's cost.
- The guild's **🌱 Guild Seeds** count, next to the title.
- **The owner** gets an "Upgrade for N 🌱" button. It is greyed out, with a toast, when the guild has too few Seeds. **Members** see the cost and "Only the guild's owner can buy levels."
- Six locked skills marked **🔒 Coming soon**. They do nothing and can't be bought.
- **Raid pre-fight panel** (Play → Raid): a chip reading "🌳 Guild: +12% bramble Health" when your guild has Rooted Walls. The classic trench setup (admin only) shows the same line.
- **Until the SQL is applied:** the panel lists the skills as a preview, all at level 0, with no buttons and the note "Preview: guild skills aren't switched on yet. Levels can't be bought, and raid fights get no guild bonus." Raid fights get no bonus.
- **Admin mode:** each live skill has a − / + "Preview N" stepper and there is a "Clear preview" button. The preview is stored in this browser only (`bramblewood_guild_skill_preview_v1`). While Admin mode is on it replaces the guild's own levels in raid fights, and the raid chip says "(admin preview)".

## The design

- **The resource: 🌱 Guild Seeds.** No guild currency or guild XP existed (the only guild data is `guilds` and `guild_members`), so this adds one. Seeds are kept per guild on the server.
  - They are earned from **members' raid fights**: each row a member writes to `raid_week_attempts` (one per fight) gives their current guild **1 Seed per 500 raid damage**. A fight scores at most 10,000, so that is at most 20 Seeds a fight.
  - Each player can earn at most **250 Seeds a week**, whichever guild they are in. The week is the server's, the same 7-day cycle as the raid.
  - Guild quests could feed Seeds later. None exist yet.
- **Who can spend:** only the **owner**. The live role check allows only `'owner'` and `'member'`, so there are no officers. "Owner" means role `'owner'` **and** `guilds.created_by` is the caller. This is the same rule as `rename_guild`, and it is needed because the live join policy lets anyone insert themselves as `'owner'` (see the SQL).
- **Levels** are bought one at a time. Nothing is refunded or reset. A guild keeps its levels and Seeds when members leave. Deleting the guild deletes them (`on delete cascade`).

### Rooted Walls (live)

| Level | Bramble Health in raid fights | Cost (Seeds) | Total |
|---|---|---|---|
| 1 | +4% | 30 | 30 |
| 2 | +8% | 60 | 90 |
| 3 | +12% | 100 | 190 |
| 4 | +16% | 150 | 340 |
| 5 | +20% | 220 | 560 |

- **Where it applies:** the three-row raid (`startRaidFullBattle`, the merged "& Co." bramble), the single-row raid (`startRaidPartMatch`) and the admin-only classic trench (`openTrenchSetup`, its shared wall). All three go through `guildScaledBramble(hp, stagePct)`.
- **It adds to the stage's `castleHpPct`.** Thrashing (−10%) with Rooted Walls 5 (+20%) gives +10%. The rounding and the floor of 1 are those of `BramblewoodRaid.scaleCastle`, so with no guild the Health is exactly what it was.
- **Why +4% a level, up to +20%:**
  - The raid's own Health dial, the Thrashing stage, moves your bramble by −10%. Rooted Walls 5 is twice that: noticeable, but well short of a different fight.
  - A three-row raid bramble starts around 90 to 150 Health (the larger of the merged castles and 2 × the trench wall). +20% is about 18 to 30 Health, one or two boss hits.
  - A raid fight scores on the damage you deal (capped at 5,000; 10,000 for an overwhelm). Extra Health only lets you last longer within the same 20 turns, so the score moves less than the Health does.
- **The cost curve:** an active 5-member guild (about 4 fights a day each, about 8 Seeds a fight) earns about 160 Seeds a day, so it maxes Rooted Walls in under a week. A solo owner takes 2 to 3 weeks (the 250-a-week cap).
- **Trench tuning at the top level** (`tests/guild-skills-2026-10-19.js` §6: tests/trench.js's population, 30 fights, +20% wall):
  - Left tentacle: 5,667 → 5,667 average (13% overwhelm either way).
  - Core: 3,830 → 4,068 (0% overwhelm). That is just past the 4,000 top of `tests/trench.js`'s Core band.
  - `tests/trench.js` itself doesn't apply guild skills, so it still passes. Expect a maxed guild's classic-trench Core fights to sit around +6%.
  - The live three-row raid can't be simulated headless yet, so watch its numbers once a guild has levels.

### Coming soon (locked, not functional)

| Skill | Idea |
|---|---|
| 🌵 Sharpened Thorns | More raid damage from every fight (+% to raid scoring) |
| 🍃 Second Wind | Hold one more Raid Point (raid attempt cap 5 → 6) |
| 🍯 Sap Return | Some Energy back after a raid fight |
| 🧰 Guild Chest | A bigger reward when a raid falls (+% kill / compensation reward) |
| 🚩 Ally Banners | Stronger allies in your raid rows |
| 🌰 Seed Satchel | More Guild Seeds from raid fights |

They exist only in `bramblewood-guild.js` (`soon: true`): no cost, no effect, not in the server's catalogue. `GUILD_SKILLS_SHOW_SOON = false` in `arena_app.js` hides them.

## The SQL that needs approval: `supabase/proposed/20261019_guild_skills.sql`

The file is checked against the live schema (read-only queries, 2026-10-19). It adds new objects only: no existing table, policy or function is changed, and it is safe to run twice.

| Object | What | Who can read | Who can write |
|---|---|---|---|
| `guild_skill_defs` | the catalogue (`rooted_walls`: 5 levels, costs 30/60/100/150/220, 4 per level) | everyone | nobody (writes revoked) |
| `guild_skill_levels` | (guild, skill) → level | that guild's members | only `upgrade_guild_skill` |
| `guild_seeds` | a guild's Seeds (+ total earned) | that guild's members | only the trigger and the RPC |
| `guild_seed_earnings` | Seeds per player per week (the cap) | that player | only the trigger |
| `credit_guild_seeds()` + trigger | AFTER INSERT on `raid_week_attempts` | not callable | adds Seeds |
| `upgrade_guild_skill(p_guild, p_skill, p_from_level)` | the owner buys the next level | `authenticated` only (revoked from public, anon) | spends Seeds |

- **`upgrade_guild_skill`** is SECURITY DEFINER with `search_path = ''`. In one transaction it:
  1. checks the caller is the owner (role and creator), else `not_owner`, 42501;
  2. checks the skill is in the catalogue (`unknown_skill`);
  3. **locks the guild's Seeds row** (`for update`);
  4. checks the level is below the top (`max_level`);
  5. checks the level is still the one the client saw, `p_from_level` (`level_changed`, so a double click can't buy twice);
  6. takes the cost off **only if the guild has it** (`seeds >= cost`, else `not_enough_seeds`);
  7. raises the level.

  Any failure rolls the whole thing back.
- **The Seeds trigger** never blocks the raid attempt it rides on (it catches its own errors). It skips rows with an empty deck (the admin's `admin_raid_damage` rows) and uses the server's week, not the row's `cycle`.
- **The trust trade-off:** `raid_week_attempts` is written by the client, so forged rows can farm Seeds. The weekly cap bounds this to 250 a player a week. When raid rewards move server-side (`20261017_c_server_rewards.sql`), credit Seeds there instead.
- **Tested** on a throwaway local Postgres 16 holding a mock of the live tables (not the live DB):
  - It applies cleanly, twice.
  - A member's 4,200-damage fight gives the guild 8 Seeds. An empty-deck row gives none. 30 maximum-damage rows stop at 250.
  - Members can't write to the tables or upgrade, and nor can a self-made "owner" who isn't the creator. Players outside the guild see nothing. anon can't call the RPC.
  - The owner buys levels 1 to 3 (250 → 220 → 160 → 60 Seeds). A repeat with the old level is refused. Level 4 (150) is refused with 60 Seeds. An unknown skill and a maxed skill are refused.

### What "apply it" does

1. Run `supabase/proposed/20261019_guild_skills.sql` on project xjctfwobcsyiztecutrb, then move it to `supabase/migrations/` with an APPLIED header.
2. From then on, every member's raid fight earns their guild Seeds (fights before the apply earn nothing).
3. The Guild tab's next load finds the tables: the preview note goes, Seeds and levels show, and the owner's Upgrade button works.
4. Once a guild has a Rooted Walls level, its members' raid fights get the bonus, and the pre-fight panel says so.

No client change is needed: the client already reads the tables and calls the RPC, and falls back while they are missing.

## Decisions for the owner

- **Apply the SQL?** ("apply it"). Until then everything is a preview, with no bonus.
- **The numbers:** +4% a level over 5 levels (+20%), and 560 Seeds in all. Seeds come at 1 per 500 raid damage, at most 250 a player a week.
- **Officers:** today only the founder can spend. Officers would need the role check widened to `'officer'`, a way to promote members, and the join-as-owner hole closed first (block B of `20261018_guild_rename.sql`).
- **"Coming soon" rows:** the 2026-09-29 rule said the live game shouldn't announce features that aren't in. This package shows six locked skills because the brief asked for them. `GUILD_SKILLS_SHOW_SOON = false` hides them.
- **Seeds from guild quests:** none exist yet. Say if you want them.

## Files

- `bramblewood-guild.js` (new, DOM-free, `BramblewoodGuild`; in the build through `assemble_arena.py`): the skill list, costs, effect math, Seeds per damage, who may upgrade, and "not applied" errors.
- `arena_app.js`, the Guild section:
  - `loadGuildSkills`, `ensureGuildSkillsForRaid`, `guildRaidLevels`, `guildBrambleHpPct`, `guildRaidBonusText`, `upgradeGuildSkill`, `guildSkillsPanelHTML`, `wireGuildSkills` and the admin preview;
  - `loadMyGuild` loads the skills.
- `arena_app.js`, the raid fights: `guildScaledBramble` in `startRaidPartMatch`, `startRaidFullBattle` and `openTrenchSetup`; the chip in `raidPanelHTML`.
- `arena_template.html`: the `.gsk*` styles.
- `bramblewood-texts.js`: 40 `ui.gskill-*` / `net.gskill-*` / `toast.gskill-*` texts. `tools/i18n_2026_10_19_guild_skills.py` adds their 39 new translations to all 12 `lang/*.json` packs ("Coming soon" was already in every pack).
- `supabase/proposed/20261019_guild_skills.sql`.
- `tests/guild-skills-2026-10-19.js` (in `tests/run-all.sh`).
