# Bramblewood Arena — Waiting on you

**Purpose:** every open item that needs **your decision** or **a conversation**, in one place. MASTER.md links here from its top.

**How to answer:** reply in chat with the number and your choice, e.g. "D12 yes, T6 let's talk". If an item says "default", I'll go with that default if you don't object.

**Rules for this doc:** an item leaves this list the moment it's decided; the outcome goes into the "Decided" log at the bottom and into MASTER.md or the relevant design doc.

_Last updated: 2026-10-03 (late evening)_

---

## Decide: a yes/no or a pick

**D15. PixelLab credits.** Waiting for the monthly reset, as you said. Still to do:
- 16 of the 26 Map 8–10 cards;
- the two Home 2.5D sprites.

The prompts are ready in `art_staging/jobs_m8_10.json`. Nothing is needed from you.

**D16. UI/UX (open item).** Screenshots of every major screen, plus a battle at turns 1, 4 and 8 and the result, are in [`ui-review-2026-10-03.md`](ui-review-2026-10-03.md). The same page is published as the artifact "Bramblewood UI Review".

My pushback is in there:
1. stop adding currencies;
2. stop adding modes for now;
3. widen the Play column instead of shrinking Conquest;
4. fundamentals before more effects.

There is also a proposed fix order: battle layout, Play width, Deck builder, Arena hierarchy, Codex toolbar, currencies.
- **Pick:** which items to do, and in what order.
- **Default:** start with the battle layout.

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

**T3. Trust and the server: your design, with one correction.**

What you proposed, and I agree:
- The server is only asked at the moments that matter: opening packs, starting a fight, and handing in a result.
- Battles run on the client from a **server-issued seed**.
- The client bundles its moves (a transcript) and sends them with a hash.
- The server replays every line: can this card be played, can this card attack that one, the lumber, the wait, every RNG roll regenerated from the seed.
- Packs are rolled entirely on the server (one RPC that rolls the cards and writes them), so the client never picks its own cards.

**Nonces: you do need one, but the seed already is it.** There *is* a replay benefit. Anything that pays out could be handed in twice:
- raid damage;
- ranked points;
- first-clear rewards;
- pack-like rewards.

The same goes for a winning transcript submitted from two tabs. The fix costs nothing extra:
- **"Start fight" returns a single-use seed.** The server stores a `fight_sessions` row: user, seed, deck hash, card-data hash, mode/node, expires_at, used=false.
- **"Hand in" checks the row.** It must be the same user, not expired and not used, and the replay must pass. Then it marks the row used and pays out once.
- **The client never chooses the seed.** Otherwise it could shop for lucky seeds.
- **The deck is locked at "start fight".**

That's two calls per fight: start and hand in.

**The known gap:** the client knows the seed, so a cheater could pre-compute the AI's future draws. In PvE that's a small edge; I'd accept it for v1. (Ranked Live already runs on the host.)

**Card data on the client** (your question): built ✅. `bramblewood-integrity.js` makes a SHA-256 fingerprint of every card's gameplay fields: cost, wait, attack, health, effects and so on. Art and flavor are excluded, so new art doesn't change it.
- The fingerprint covers baseline cards plus admin live overrides.
- It's shown in **Admin → Card data fingerprint**.
- It goes into each `fight_sessions` row and each hand-in.
- The server computes the same hash from `canonical/cards.json` plus `card_overrides`, using the same file. A mismatch means edited or stale card data: reject, or tell the client to reload.
- Today `canonical/cards.json` hashes to `716fef18f31c…`. Tests check that the browser and Node agree.

**T4. Materia** (discussion; your list):
- sources: raids, maps, arena, guild, and maybe shop chests;
- what it does: crafting, and upgrades with Maple Leaves.

**My pushback:** we already have 8 currencies on screen (see D16). If Materia comes in, make it **replace Magic Dust + Metal** as the one crafting currency, with typed variants only if they really earn their place (e.g. Tidal / Ember / Grove materia by source). Not a ninth chip.

**T5.** Moved to Decided (cancelled).

**T6.** Moved to Decided.

**T7. Shaders, v1 built.** Real WebGL is live (Settings → 🌊 Shader effects):
- **Splash and faction screens:** the painted scene runs through a shader that reads its own pixels:
  - green sways in gusts;
  - blue in the lower half ripples and glints like water;
  - bright pixels bloom;
  - light shafts, fireflies and a slight pointer parallax.
- **Home backdrop:** the same scene shader, softened.
- **Every Conquest map** has its own overlay:

  | Map | Effect |
  |---|---|
  | Forest | Canopy dapple, light shafts, fireflies |
  | Sunken Hollow | Caustics, glints |
  | Volcanoes | Lava glow, smoke, embers |
  | Caves | Fog, spores, and a lantern that follows your pointer |
  | Savanna | Heat shimmer, dust |
  | Tundra | Aurora, snowfall |
  | Coral | Caustics, bubbles |
  | Swamp | Marsh fog, fireflies |
  | Eyrie | Clouds, wind streaks |
  | Sundered Peak | Embers, lightning |

- **Cost controls:**
  - one shared loop;
  - pauses off-screen and in hidden tabs;
  - half resolution on maps;
  - cleans up its GL context.
- **Default:** on where WebGL works; off with reduced motion, on 2-core devices or with data-saver on.

**Next, if you want more:**
- the battlefield (rain splashes, a lane glow at the start of your turn);
- day/night from your clock;
- the moddable "atmosphere pack" JSON.

**T8. Farms (new).** Your idea: a farm, plus crafting potions to sell to other players on the Market. A sketch to react to:
- **The farm:** a few plots (on the Home scene or a map spot) that grow herbs in real time, 1–8 hours. Planting takes seeds from Conquest or raid drops.
- **The potion bench:** herbs plus Materia make potions.
- **Potions are consumables for PvE only:** +2 HP on your castle, the first card costs 1 less, reveal an enemy deck, one extra trench turn. Never usable in Ranked.
- **The Market:** players list potions for 🍁. The Market takes a cut, which is a gold sink. This needs T3's server trust first: listings and trades must be server-side.

Questions:
- Is the farm a place (a screen with plots) or a panel?
- Does it fit the game's identity, or pull it toward an idle game?
- Could potions ever touch PvP? (I'd say no.)

**T9. Sound effects: sourcing (new).** Today every sound is synthesized live in Web Audio (no files). Proposed sources, licence first:
- **Kenney.nl:** CC0, no attribution. The "Interface Sounds", "Impact Sounds", "RPG Audio" and "UI Audio" packs cover clicks, card flips, hits and coins.
- **OpenGameArt.org,** filtered to CC0 (some packs are CC-BY, which needs credit).
- **Freesound.org,** with the CC0 filter (CC-BY needs credit; avoid NC for a commercial game).
- **Sonniss GDC bundles:** royalty-free, commercial OK, no attribution. Large, high quality.
- **jsfxr / sfxr:** generate retro blips ourselves. These are ours outright.

The list we need, about 25 cues:
- card play;
- card flip;
- hit (light/heavy);
- dodge (whoosh);
- poison tick;
- heal;
- castle hit;
- castle destroyed;
- win and lose stingers;
- pack shake, burst and rare reveal;
- coin;
- UI click, hover and back;
- map pan;
- node select;
- raid boss roar;
- trench telegraph.

**Plan:**
1. I draft a cue sheet with mood and length per cue.
2. You pick a direction: cosy/organic or chiptune.
3. I pull CC0 candidates.

The workspace can't download from those sites, so you'd drop the files in, or I use the browser. I keep a `CREDITS.md` and an `audio/` folder with a licence per file.

## Decided (2026-10-03)

| # | Decision | Outcome |
|---|---|---|
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
