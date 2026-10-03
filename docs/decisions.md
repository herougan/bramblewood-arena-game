# Bramblewood Arena — Waiting on you

**Purpose:** every open item that needs **your decision** or **a conversation**, in one place. MASTER.md links here from its top.

**How to answer:** reply in chat with the number and your choice, e.g. "D12 yes, T6 let's talk". If an item says "default", I'll go with that default if you don't object.

**Rules for this doc:** an item leaves this list the moment it's decided; the outcome goes into the "Decided" log at the bottom and into MASTER.md or the relevant design doc.

_Last updated: 2026-10-03 (21:00)_

---

## Decide: a yes/no or a pick

**D17. Sound direction (from T9).** The cue sheet is drafted in [`sfx-cue-sheet.md`](sfx-cue-sheet.md): about 25 cues, each with a mood and a length. Pick the overall feel:
- **A. Cosy and organic.** Wood knocks, leaf rustles, soft bells, paper; it matches the painted woodland.
- **B. Chiptune.** Retro blips, which match the pixel art.
- **C. Mixed.** Organic for the world and battle, chiptune only for UI clicks and coins.
- **Default:** C.

## Ongoing tracks (no decision needed)

**Polish (was D16).** More animation and fixing odd graphical glitches as we find them. WebGL is kept out of this track; it lives in the effects catalogue. Progress:
- **Battle (2026-10-03):** hover-to-see-facing, castle HP ribbons, tips moved off the board, log drawer, compact Graveyard, "Pass turn", fits a 1366×860 screen.
- **Glitch fixed:** Nest cards had collapsed to an 18px sliver since the card-scaling change.

**Effects (was T7).** The menu of effects and how to build each is in [`effects-catalogue.md`](effects-catalogue.md). Your picks:
1. **Holo foil:** ✅ shipped, in CSS, on Nest foil copies and Rare+ pack reveals.
2. **Depth-map parallax:** next, chosen for scale.
3. **Battlefield weather:** next.

**T3. Server verification: approved, building.** The design is in the Decided log below:
- a single-use seed, which acts as the nonce;
- a transcript of your moves;
- a server replay;
- a card-data fingerprint;
- packs rolled on the server.

Build order:
1. `fight_sessions` table plus a `start_fight` RPC that issues the seed. 🟡 Client side is built: Conquest fetches a seed when you select a node, uses it, records your moves, and hands in once. The migration is `supabase/migrations/20261003_fight_sessions.sql`. **Not applied yet:** my apply call was cancelled. Say "apply it" and I'll run it. Until then the game silently uses local seeds, as before.
2. Conquest hand-in through an Edge Function that replays the transcript with the same engine.
3. Raid damage the same way.
4. Packs rolled on the server.

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

## Decided (2026-10-03)

| # | Decision | Outcome |
|---|---|---|
| D15 | PixelLab credits | ✅ Wait for the monthly reset, then finish Maps 8–10 and the Home sprites. |
| D16 | UI/UX review | ✅ The pictures are fine and it's starting to look polished. It's now the ongoing **Polish** track (more animation, glitch fixes), without WebGL. |
| T3 | Server trust | ✅ Go. Server-issued **single-use seed** (it doubles as the nonce, which stops reward replays); the client sends a transcript and hash; the server replays every action and roll; card-data fingerprint checked; packs rolled on the server. Only pack opens and fight hand-ins talk to the server. |
| T4 | Currencies and Materia | ✅ Many currencies are fine, including Materia, **as long as each shows only where it matters**. Rule: a currency chip appears only on screens that earn or spend it (Shop: 🍁🍂; Forge: ✨🔩 and Materia; Raid: 🎫 and Raid Points; battle: 🪵). Profile keeps the full wallet. |
| T8 | Farms and potions | ✅ Approved as sketched: real-time plots, potions as PvE-only consumables, and potions sellable on the Market once trades are server-side (T3). |
| T9 | Sound sourcing | ✅ Plan approved: CC0 first (Kenney, OpenGameArt CC0, Freesound CC0), plus our own jsfxr, with `audio/` and `CREDITS.md`. The direction is D17. |
| T7 | Effects | ✅ Picks: holo foil now (done), depth parallax for scale, battlefield weather. See `effects-catalogue.md`. |
| — | Admins | ✅ jayzhang.here@gmail.com added to `app_admins` (Admin entry, live card/skirmish/raid publishing). |
| — | Repeat clears | ✅ The win screen shows the first-clear bonus greyed out under "First clear · already earned ✓". |
| D12 | Passwords | ✅ Minimum length raised to 8 in Supabase (through your Chrome). The leaked-password toggle waits for Pro. |
| D13 | World map | ✅ Built. A 🧭 World view shows every map as a **compass diamond** (not a round skirmish icon) on one winding trail. Each map's card loads only as you scroll to it; click a diamond to zoom into that map. Art stays per-map, so no 4K world painting is needed. |
| D14 | Packs | ✅ Only the Sprout Pouch is on sale; Acorn Chest and Golden Case show "Coming soon". |
| T5 | Apple sign-in | ⛔ Cancelled. |
| T6 | Alt-art | ✅ Opponents see your alt-art; it falls back to the default art if it loads slowly. Market trading is still open. |
| — | Conquest margins | ✅ Same content column as Arena, plus a ⛶ immersive full-screen map (Esc to leave). See the D16 pushback on width. |
| — | Butterflies | ✅ Movers keep their position across re-renders; no more teleporting. |
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
