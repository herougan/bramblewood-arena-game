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

**D18. Progression after Map 1.** See [`difficulty-curve-2026-10-03.md`](difficulty-curve-2026-10-03.md).
- **Already done:** I retuned Map 1 into an on-ramp. It was close to unwinnable with the post-tutorial deck; now the first fights are wins, and the boss needs a rebuilt deck.
- **The problem:** from Map 2 on, the starter deck wins about 0–10%, and no Conquest node grants a card, so packs are the only progression.
- **Options:**
  - A: assign skirmish reward cards per node;
  - B: retune Maps 2–4 to target win rates;
  - C: both.
- **Default:** C. I'd draft the reward picks and the retunes for you to review in the skirmish editor.
- **Draft applied (00:30):** reward cards on all Map 1–2 nodes, and Map 2 retuned. The table is in the curve doc. Everything is adjustable in the skirmish editor; say "revert D18" to undo.

## Ongoing tracks (no decision needed)

**Polish (was D16).** More animation and fixing odd graphical glitches as we find them. WebGL is kept out of this track; it lives in the effects catalogue. Progress:
- **Battle (2026-10-03):** hover-to-see-facing, castle HP ribbons, tips moved off the board, log drawer, compact Graveyard, "Pass turn", fits a 1366×860 screen.
- **Glitch fixed:** Nest cards had collapsed to an 18px sliver since the card-scaling change.
- **Flow audit (2026-10-03, `tests/e2e/flows.py`):** Quit from every mode (quick battle, Pass & Play, gauntlet, dungeon, Conquest, offline raid, tutorial), mid-round and on phones; win-screen buttons; trench leave; pack cards reaching the Nest, the deck builder and the Forge; Escape on Settings, Quests and pack opening. Fixed:
  - tutorial tip shields blocked the Quit button;
  - Conquest full-screen hid the header inside matches and on other tabs;
  - the trench's leave control was an unlabelled ✕ (now "🚪 Leave");
  - pack opening ignored Escape.
- **UX consultant pass (23:30–00:30):**
  - every Play sub-tab gets the same, wider column;
  - Arena has one hero (Quick Battle) and quieter tiles;
  - the Autobattler start screen is a 4-step loop plus one Start;
  - Deck opens straight into the builder, with a deck switcher;
  - win screen: "Next: <fight> · ⚡", Play again, See the board, Back to the map;
  - the Shop shows only the currencies it spends, always shows prices, says "Need N more 🍁", and centres the packs;
  - Codex filters sit behind one button, with an active count;
  - one header order everywhere, and the Play settings panel matches the others;
  - phone: swipeable Bramble picker, the Forge list shows first, solid Quests/Community buttons, deck-builder copy that doesn't need Shift;
  - contrast fixes on the dark page;
  - a bug where the Codex filter collapse hid the deck builder's filters.
- **Forge rework:**
  - a hearth header showing only the currencies the Forge uses;
  - search, filter and sort, with a 🔨 badge on cards you can afford to temper;
  - an anvil panel with level pips, before→after stats, cost chips and Prestige medallions;
  - a smithing animation: the card heats, three hammer strikes throw sparks, steam on the quench, then it flips to the new stats.

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
| — | Feedback batch (2026-10-04) | ✅ 1) **Card snaps fixed**: a pre-paint guard glides any board card that would jump sideways (released pins, rows re-centring, deaths); 0 jumps across 5 stress matches. 2) **Deaths**: bleed-out by default (red; green for poison/acid, icy blue for cold); the burn-away only for heat kills or fire cards. 3) **Castle bars** flush to the battlefield's top and bottom edges, no label. 4) Wider results screen, bigger reward cards. 5) **Pitch callout**: "+N 🪵 Lumber" banner and a pill pulse. 6) **Loss tip** with a "Rework my deck" button. 7) Map buildings sit a little higher. 8) **Map backgrounds**: procedural pixel art for all 11 maps (PixelLab and OpenRouter are blocked from this workspace; `tools/gen_map_bg_ai.py` is ready for an OpenRouter key). 9) Milestone toasts fire as you earn them. 10) Profile sections share one width and gap, plus a "What rivals see" preview. 11) **Deck showcase**: castle and leader up front, archetypes, average attack/health/cost. 12) **Arrow N / Fire Arrow N** skills, a start-of-round volley with pixel-art arrows; given to Owl Fletcher (Arrow 1) and Magma Salamander (Fire Arrow 1), changeable in the editor. |
| — | Tutorial rules | ✅ (22:51) The tutorial must be finished before anything else (Home shows only the tutorial; Profile and Admin stay reachable). Its first guided steps lock every action except the one asked for, Quit included. Passive tips never block. Admin → 🎓 Tutorial editor: castle HP (now 12 vs 10, was 30 vs 30), starting hand, seed, rival names, both decks, every step's text. Save publishes it; a test run grants nothing. |
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
