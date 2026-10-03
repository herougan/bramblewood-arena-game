# Raid design — "The Goliath" (draft for review, 2026-10-03)

This doc covers:
- the raid you described;
- where I'd push back;
- what I'd add;
- the Raid editor we'd need;
- a build order.

## Status (2026-10-03)
- **P0 Skirmish editor:** ✅ built.
- **P1 Raid model + editor:** ✅ built. The Goliath is live on the Raid tab with four parts, global locks, stages, caps, kill/compensation/tier rewards and a 12-turn clock per fight. Defaults I chose for your open questions:
  - Core lock: **global** (the Core opens once all three outer parts are drained). The in-fight half waits for the trench engine.
  - Rewards: **equal base + contribution tiers**.
  - "Leaves" = 🍁 Maple Leaves (P4, not built).
- **Added in P1:** a **turn limit per fight** (default 12). Without it, a part's finite deck runs out and any deck grinds its castle down, so every fight was an overwhelm.
- **P2 trench engine, P3 server replay check, P4 Leaves/crafting:** not built.

## Editors today

| Editor | Status | Where |
|---|---|---|
| **Card editor** | ✅ Ready. Stats, skills, triggers, art, availability. Publishes live for everyone when you're signed in as admin. | Codex → card → ✏️ Edit (Admin Mode) |
| **Test Kit** (test editor) | ✅ Ready. A looping 2-vs-3 field to watch one card's effects, VFX and SFX. | Admin → Open Test Kit, or Play → 🧪 Test |
| **Skirmish rewards** | ✅ Ready. Which cards a node pays out. | Conquest node panel → ✏️ Edit rewards |
| **Map layout** | ✅ Ready. Drag nodes with grid snap; publishes live. | Conquest → 📐 Edit layout |
| **Skirmish editor** (enemy deck, HP, kind, battle mode, surrender behaviour, dialogue) | ✅ Ready | Conquest node panel → 🛠️ Edit skirmish |
| **Raid editor** (P1: parts, bars, locks, decks, turns, stages, scoring, rewards, simulate) | ✅ Ready | Raid tab → ✏️ Edit raid, or Admin → 🐙 Raids |

**Recommendation:** build the **Skirmish editor** before the Raid editor. It's smaller, you'd use it every day, and the Raid editor reuses its deck and enemy pickers.

---

## Your vision, restated

- **Who:** one boss, the whole playerbase. A fight is async: you, plus other players' decks in **trenches**.
- **Board:** your side has **3 rows** (front / middle / back). You pick which row you're in.
- **Enemy attacks:**
  - Normal attacks hit the front row first and roll through to the next row if that column is empty.
  - Some attacks (Tentacle Smack) hit a **whole column**.
- **Boss anatomy:**
  - A **core** with 8 primary HP bars.
  - 3 **outer entities** with 3 HP bars each.
  - The outer entities **buff each other**, so early damage is tiny.
  - You can't hit the core until the outer entities are dealt with.
- **Scoring:**
  - A normal fight contributes **up to 5,000** damage.
  - **Overwhelming** all 3 outer entities in your fight contributes **10,000**.
- **Final boss:**
  - Mathematically near-impossible to overwhelm.
  - Horrible rules: your units enter with **+1 Wait**, and all his units are **illusory** (dodge 2 of 3 attacks). So the usual contribution is up to 5,000 to the core.
  - Below **1%** HP it enters a new stage and loses its abilities.
- **Result:** if the global HP reaches 0, **everyone who took part wins**. If not, everyone gets compensation rewards.
- **Cost:** Raid tickets **and** Energy.
- **Rewards:** Leaves become a card-upgrade currency. Raids also drop crafting materials for raid-specific and general cards.

## Pushback (things to settle before building)

1. **This is a new board, not a new mode.**
   - Today's engine is one row per side (left / centre / right flanks).
   - Trenches with 3 rows, column attacks and multi-part bosses are a different board model.
   - I'd build a separate **raid engine layer** that reuses the existing card, skill and status resolvers, rather than generalising the PvP engine.
   - That keeps PvP, Conquest and the 81k golden test fights untouched and deterministic.

2. **Two different HP scales.**
   - Card stats are 1–60; your bars are ~80,000.
   - So a fight uses **local, in-fight HP** for each boss part. What you deal in the fight converts to **global raid damage** (e.g. 1 in-fight damage = 50 global).
   - The 5,000 / 10,000 caps apply to that converted number.
   - Everyone always "loses" the fight itself; what matters is how much you took off.

3. **"Can't attack the core until the outer entities are dealt with": inside one fight, globally, or both?**
   - **In-fight only:** every fight starts with all three entities up; the core is reachable only after you kill them in that fight. That kill is also the overwhelm condition.
   - **Global:** the core's bars are locked until the community has drained all three entities' bars. That gives the raid real stages.
   - My suggestion is **both**:
     - globally, the entities' bars must fall first (stage 1);
     - in-fight, the core still needs a path cleared each time.

4. **Trust.**
   - With 10,000-point contributions, a modified client could report anything.
   - Short term: the server caps damage per attempt and rate-limits attempts.
   - Real fix: the engine is fully seeded, so a server function can **replay the fight** from seed + both decks + your choices and compute the damage itself.
   - Needs a Supabase Edge Function. Worth it before rewards get valuable.

5. **Equal rewards vs contribution.**
   - Fully equal rewards invite free-riding (one tiny attempt, full reward).
   - Suggestion: the **base reward is equal** for everyone with at least one real attempt.
   - On top: **contribution tiers** (top 1% / 10% / 50%) that pay **cosmetics and materials**, not power. That fits your stats-medals idea.
   - **Compensation** if the boss survives: 40% of the base.

6. **Number tuning needs a simulator first.**
   - "Mathematically improbable to overwhelm" should be proved, not guessed.
   - The Raid editor's **Test fight** runs 1,000 simulated attempts with typical decks.
   - It reports the overwhelm rate and the average contribution, so you can tune until the final boss sits at ~0% overwhelm and ~2–3k average.

## Add-ons (for the fun)

- **Telegraphs:**
  - The boss shows next round's Tentacle Smack column as a shadow.
  - You can pull a unit back a row in response. That gives the trench a real decision every round.
- **Row roles:**
  - **Front:** takes hits first, +1 Armor.
  - **Middle:** can reach any column.
  - **Back:** ranged and spells, can't be hit by normal attacks while the front holds.
- **Pick your fragment** (head / tail / left tentacle…):
  - Each fragment has its own global bars.
  - Killing one gives **everyone** a lasting weakness to exploit (e.g. "the tail is severed — no more column sweeps").
- **Community stage events:**
  - At 75 / 50 / 25%, a short "rally horn" banner.
  - The next stage brings new boss behaviours, and a new line of dialogue from the cast.
- **Raid feed:** "Moss B. severed the left tentacle (+10,000)", plus a guild contribution board.
- **The < 1% "Exposed" stage:**
  - The boss loses every ability, and the music and screen shift.
  - The last push is a celebration, not a slog.

## Data model (what the Raid editor edits)

```json
{
  "id": "goliath-01", "name": "The Goliath", "icon": "🐙", "week": "2026-W41",
  "cost": {"raidTickets": 1, "energy": 4},
  "global": {
    "parts": [
      {"id": "core", "name": "Core", "bars": 8, "barHp": 80000, "lockedUntil": ["left","right","tail"]},
      {"id": "left", "name": "Left Tentacle", "bars": 3, "barHp": 80000},
      {"id": "right", "name": "Right Tentacle", "bars": 3, "barHp": 80000},
      {"id": "tail", "name": "Tail", "bars": 3, "barHp": 80000}
    ],
    "stages": [
      {"at": 0.75, "name": "Enraged", "rules": [{"bossAttack": "tentacle-smack", "every": 1}]},
      {"at": 0.01, "name": "Exposed", "rules": [{"stripAbilities": true}]}
    ]
  },
  "fight": {
    "rows": 3, "columns": 5,
    "entities": [
      {"part": "left", "card": "kraken-arm", "hp": 400, "slot": {"col": 0}, "auras": [{"buffAllies": {"armor": 3}}]},
      {"part": "core", "card": "goliath-core", "hp": 1200, "slot": {"col": 2}, "untargetableWhile": "anyEntityAlive"}
    ],
    "attacks": [
      {"id": "tentacle-smack", "pattern": "column", "dmg": 6, "every": 2, "telegraph": true},
      {"id": "lash", "pattern": "front-then-rollthrough", "dmg": 3, "every": 1}
    ],
    "rules": [{"playerUnits": {"waitDelta": 1}}, {"bossUnits": {"dodge": 0.667}}],
    "rounds": 20
  },
  "scoring": {"perInFightHp": 50, "cap": 5000, "overwhelmCap": 10000, "overwhelm": "allEntitiesDead"},
  "rewards": {
    "kill": {"gold": 400, "materials": [{"id": "kraken-ink", "n": 3}]},
    "compensation": {"pct": 40},
    "tiers": [{"topPct": 1, "title": "Goliath-Slayer"}, {"topPct": 10, "materials": [{"id": "ancient-scale", "n": 1}]}]
  }
}
```

## Raid editor (Admin)

1. **Raid list:** draft / scheduled / live, with Duplicate and Schedule for week…
2. **Global tab:** parts, bars and HP; lock order; stages with rule pickers; a live preview of the HP bars.
3. **Fight tab:**
   - a **grid editor** (3 rows × N columns): drag entities in, set their HP and auras;
   - an **attack pattern editor** with a visual column/row preview;
   - a "horrible rules" list (wait delta, dodge, etc.).
4. **Scoring & rewards tab:** conversion rate, caps, overwhelm condition, kill / compensation / tier rewards, materials.
5. **Test fight:** play it yourself (Test Kit style), or **simulate 1,000 attempts**. Shows overwhelm %, average contribution, and how many attempts the community needs to kill it.
6. **Publish:** to a `raid_defs` table (admin write, public read), the same pattern as card edits.

## Build order

| Phase | What | Size |
|---|---|---|
| **P0** | Skirmish editor (enemy deck, HP, kind, battle mode, behaviour, dialogue) | M |
| **P1** | Raid data model + Raid editor (global + rewards tabs) + bars preview; replaces today's weekly-boss list | M |
| **P2** | Raid engine layer: trenches (3 rows), row choice, column/roll-through attacks, multi-part boss, auras, telegraphs; headless tests like `tests/async-raid.js` | L |
| **P3** | Global async pools by part, stages, scoring caps, rewards and compensation, materials; server replay check (Edge Function) | L |
| **P4** | Leaves-as-upgrade-currency + crafting with raid materials | M |
| **Later** | Fully online (real-time) raid | XL |

## Questions for you

1. Core lock: **in-fight, global, or both** (my suggestion)?
2. Rewards: **equal base + cosmetic/material tiers** (my suggestion), or fully equal?
3. "Leaves" for upgrades: do you mean 🍁 **Maple Leaves** (today's soft currency) or 🍂 **Gold Leaves**, or a new currency?
4. Should I build the **Skirmish editor (P0)** next?
