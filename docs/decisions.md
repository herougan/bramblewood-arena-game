# Bramblewood Arena — Waiting on you

**Purpose:** every open item that needs **your decision** or **a conversation**, in one place. MASTER.md links here from its top.

**How to answer:** reply in chat with the number and your choice, e.g. "D3 yes, D7 option B". If an item says "default", I'll go with that default if you don't object.

**Rules for this doc:** an item leaves this list the moment it's decided; the outcome goes into MASTER.md or the relevant design doc.

_Last updated: 2026-10-03_

---

## Decide: a yes/no or a pick

### UX (from `ux-critique-2026-10-02.md`)

**D1. Header + Home redesign** (A3 + A4). Size: M.
- One slim top-right header on every screen: avatar/name chip (opens Profile; "Sign in" for guests) + ⚙ cog.
- Ranking, Friends and Guild become menu items. Admin moves inside Settings, shown only to admin accounts.
- Home gets a big Play hero button, with Deck, Codex, Shop and Nest as a 2×2 grid.
- **My recommendation:** yes. It also fixes "Admin is visible to every player".

**D2. Shop for guests** (A6). Size: S.
- One clear "Sign in to open packs — it's free" call to action.
- Packs with no cards yet are hidden or labelled "Coming soon".
- **My recommendation:** yes.

**D3. Readable card names in the Codex** (A7, second half). Size: S.
- Add a dark strip behind card names on busy art.
- **My recommendation:** yes.

**D4. Where the Simulator lives** (A8).
- The critique said: move it out of Deck into the admin-only Test area.
- But you since asked for "decks you've fought recently → simulate vs my deck", which is a player feature.
- **Options:**
  - A: keep it in Deck for everyone, renamed "Practice vs recent opponents".
  - B: move it to Test, admin-only.
- **My recommendation:** A.

**D5. Arena tidy-up** (A9). Size: M.
- Group the modes into Practice / Challenges / Online, with one-line descriptions.
- Rename "Test Battle" to "Quick Battle".
- **My recommendation:** yes.

**D6. Conquest locked maps** (A10). Size: M.
- Collapse locked maps into a compact "Next: Sunken Hollow 🔒" strip.
- Show node names on hover (always on desktop).
- **My recommendation:** yes.

### Raids (from `raid-design.md`)

**D7. Defaults I chose; confirm or change them.**
- a. **Core lock is global.** The Core opens once the community drains all three outer parts. The alternative is "both": the in-fight stumps also guard it, which is already true in the trench.
- b. **Rewards are an equal base reward plus Top 1/10/50% extras** (materials and titles, never power). The alternative is fully equal rewards.
- c. **"Leaves" as the upgrade currency means 🍁 Maple Leaves** (today's soft currency), not 🍂 Gold Leaves or a new currency. This matters for P4.

**D8. Steering a trench fight.** Today you pick your row and the fight plays itself (as you asked: "autobattle CPU playing so it's fast").
- Next step could be one decision per telegraph: "pull a unit back a row" when ⚠️ Tentacle Smack is coming.
- **Options:**
  - A: keep raids fully auto.
  - B: add that one decision per telegraph.
- **My recommendation:** A for now; revisit after people play it.

### Platform and ops (from `roadmap-and-backlog.md`)

**D9. Leaked-password protection** (Supabase → Auth → Passwords) is off.
- It's a one-click toggle. I can flip it through your Chrome if you say so.
- **Default:** I turn it on.

**D10. Engine for native builds:** Electron/Tauri + Capacitor (reuses all the code) vs Unity (full rewrite; the only route to Nintendo Switch).
- **My recommendation:** the web stack now; Unity only if Switch becomes a real goal.

**D11. Map 8+ art.** Shall I queue the next PixelLab batch (maps 8–11 cards and backgrounds)?
- **Default:** yes, after maps 6–7 finish.

---

## Discuss: needs a conversation, not a pick

**T1. Catch-up mechanics** (MASTER item 10). How returning or late players catch up without devaluing grinders. Ideas on the table:
- rested XP;
- a weekly "comeback" quest tier;
- making early Conquest cheaper once you've cleared further;
- the game getting less punishing as it goes on.

**T2. Replays** (you said "let me think about this"). The building blocks exist:
- fights are fully seeded;
- recent opponents are saved, and the Simulator can rerun them.

Open questions:
- watch-only replays, or "re-fight this deck"?
- share a replay link?
- keep how many, and for how long?

**T3. Trust and the server.** Currencies, rating and raid damage are still written by the game client.
- Raid P3 (a server replays each raid fight from its seed) is the first step.
- Question: how soon do rewards get valuable enough that this matters?

**T4. Leaves upgrades and crafting** (Raid P4). What upgrading a card with Leaves does (+1 level? new art?), and which raid materials craft which cards.

**T5. Apple sign-in** needs an Apple Developer account ($99/yr). Is that worth it now, or later with the iOS build?
