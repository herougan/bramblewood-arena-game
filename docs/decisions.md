# Bramblewood Arena — Waiting on you

**Purpose:** every open item that needs **your decision** or **a conversation**, in one place. MASTER.md links here from its top.

**How to answer:** reply in chat with the number and your choice, e.g. "D12 yes, T6 let's talk". If an item says "default", I'll go with that default if you don't object.

**Rules for this doc:** an item leaves this list the moment it's decided; the outcome goes into the "Decided" log at the bottom and into MASTER.md or the relevant design doc.

_Last updated: 2026-10-03 (evening)_

---

## Decide: a yes/no or a pick

**D12. Passwords (replaces D9).** Leaked-password protection is a **Supabase Pro-plan** feature; the project is on Free, so the toggle is greyed out.
- **Options:**
  - A: raise the minimum password length from 6 to 8 (free; I can do it through your Chrome).
  - B: leave it until you upgrade to Pro.
  - C: both A now and the toggle when on Pro.
- **Default:** C.

**D13. Map panning: keep the "travel" feel, or go to one giant scrolling world?** What's built (D6):
- unlocked maps plus one "Next: … 🔒";
- neighbour maps peek in at the edges;
- tabs, edges and swipes pan the world to that map.

Only the map you're on is built, so it stays fast. The bigger version is one continuous canvas you can drag across, with maps loading as they scroll into view. It's a larger rebuild of the Conquest screen.
- **Default:** keep what's built; revisit after playtesting.

**D14. Pack economy check.** Packs now hold real cards:
- Sprout Pouch: 3 cards, 50 🍁.
- Acorn Chest: 5 cards with 1 new guaranteed, 120 🍁 + 10 🍂.
- Golden Case: 8 cards with 1 new guaranteed, 250 🍁 + 30 🍂.

Pack 1 has 33 cards, so a committed player completes it in roughly 10–15 packs.
- **Default:** keep it, and watch how fast people fill Pack 1.

**D15. PixelLab credits.** The monthly generation limit ran out partway through the batch: 10 of 26 Map 8–10 cards got done, and the two Home 2.5D sprites didn't. Prompts for the rest are ready.
- **Options:** buy credits or upgrade the plan (your call, on your account), or wait for the monthly reset.
- **Default:** wait for the reset, then I finish the batch.

## Discuss: needs a conversation, not a pick

**T1. Catch-up mechanics** (MASTER item 10). How returning or late players catch up without devaluing grinders. Ideas:
- rested XP;
- a weekly "comeback" quest tier;
- making early Conquest cheaper once you've cleared further;
- the game getting less punishing as it goes on.

**T2. Replays** (you're still thinking). The building blocks exist:
- fights are fully seeded;
- recent opponents are saved, with names, in Arena → Recent opponents.

Open questions:
- watch-only replays, or "re-fight this deck"?
- share a link?
- how many to keep, and for how long?

**T3. Trust and the server.** Currencies, rating and raid damage are still written by the client.
- Raid P3 (a server replays each raid fight from its seed) is the first step.
- The interactive trench makes that harder, because the server would need your moves too.

**T4. Leaves upgrades and crafting** (Raid P4). What upgrading with 🍁 Maple Leaves does, and which raid materials craft which cards.

**T5. Apple sign-in** needs an Apple Developer account ($99/yr). Now, or later with the iOS build?

**T6. Alt-art.** My proposal is in `game-design-v40-addendum.md` § Alt-art:
- cosmetic art variants per owned copy, like foil;
- from packs, raid top tiers, events and achievements;
- you pick which art your deck shows;
- generated in the same PixelLab pipeline.

Questions:
- Can opponents see your alt-art in PvP?
- Can alt-art be traded on the Market?

**T7. Shaders, "the Minecraft longevity" idea.** v0 is live as **Settings → Atmosphere**: golden hour, moonlit fireflies, rain and autumn. Proposal for where to take it is in `game-design-v40-addendum.md` § Atmosphere:
- real WebGL effects on the map and battlefield backgrounds (water ripple, wind sway, light shafts);
- day/night following your local clock;
- moddable "atmosphere packs" (JSON plus small shader snippets) that you, and later players, can author.

---

## Decided (2026-10-03)

| # | Decision | Outcome |
|---|---|---|
| D1 | Header + Home | ✅ Built. Play is the hero, Deck/Codex/Shop/Nest a 2×2 grid. Quests + Community (Ranking/Friends/Guild) are the only extras. Header on Home. Workshop + Admin live in Settings; Admin only for admins. |
| D2 | Shop + Pack 1 | ✅ Built. 33 cards in Pack 1; packs give real cards; pack-opening animation; guest sign-in banner. |
| D3 | Card names | ✅ Built. Original parchment-scroll banner (your reference was a watermarked stock image, so I drew our own) at every card size. |
| D4 | Simulator | ✅ B. Admin-only. Players see "Recent opponents" (name, mode, result, deck) in Arena. |
| D5 | Arena | ✅ Built. Practice / Challenges / Online; one-line copy; "Quick Battle". |
| D6 | Conquest maps | ✅ Built. Unlocked maps plus "Next: … 🔒" with progress; joined world with edge peeks, swipe and tabs panning (see D13). |
| D7 | Raid damage | ✅ Confirmed. Core lock global; equal base + tiers; Maple Leaves. Damage to stumps and guards counts, and "over damage" past a part's 0 still counts. |
| D8 | Trench | ✅ Built. You play your row turn by turn; allies are CPU on other raiders' decks (live) or default raid decks; telegraphed columns glow soft red. |
| D9 | Leaked-password protection | ⛔ Pro-plan only (see D12). |
| D10 | Native builds | ⏸ Not yet. |
| D11 | Art | 🟡 10 Map 8 cards wired; Home 2.5D scene coded (faded backdrop + parallax). The rest of Maps 8–10 and the two foreground sprites wait on PixelLab credits (D15). |
