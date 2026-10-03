# Bramblewood Arena — Roadmap & Full Backlog (started 2026-09-17)

> Day-to-day status lives in `MASTER.md`; open decisions in `decisions.md`. This doc keeps the long-range roadmap and history.

## Future action items (added 2026-10-02)

### Cross-platform builds (Unity or Electron) — ⏸ "not yet" (D10, 2026-10-03)
Ship the game as native/packaged builds across these targets (user's list, 2026-10-02):

| # | Target | Notes |
|---|---|---|
| 1 | **Web** | Already live (bramblewood-arena.vercel.app). |
| 2 | **Mobile web** | Same site; needs a proper phone-layout pass (touch drag, hand strip, battlefield fit). |
| 3 | **Windows** | Desktop package. |
| 4 | **macOS** | Desktop package; needs Apple code-signing/notarization to avoid Gatekeeper warnings. |
| 5 | **Linux** | Desktop package (AppImage/.deb). |
| 6 | **iOS** | App Store; Apple Developer Program required. |
| 7 | **Android** | Play Store / APK. |
| 8 | **Steam Deck (native)** | Linux build via Steam (Steamworks partner account); controller input + 1280×800 layout. |
| — | **Nintendo handheld ("Nintendo DS")** | The DS itself is discontinued with no current dev path — this almost certainly means Nintendo Switch. Switch needs Nintendo Developer Portal approval and a supported engine (Unity yes, Electron/web no). |

Screen-size classes to design for (independent of platform): **Small PC**, **Mid-size** (Steam
Deck / Switch-class handheld), **PC-XLarge** (ultrawide/4K), plus phone (mobile web/iOS/Android).

**Engine decision to make first — Electron vs Unity:**
- The game today is one HTML/JS app. **Electron (or the lighter Tauri) for Windows/macOS/Linux/Steam
  Deck, plus Capacitor for iOS/Android, reuses essentially all existing code** — the realistic path
  for targets 1–8.
- **Unity** would be a full rewrite of the engine and UI in C#, but is the only one of the two that
  can reach Nintendo Switch. Recommended split: web stack for 1–8 now; revisit Unity only if a
  Nintendo release becomes a real goal.
- Cross-cutting work either way: controller/gamepad input, offline play + cloud-save sync (Supabase
  already handles sync), store accounts/fees per platform, and the 4 screen-size layouts above.

### UX action items
`ux-critique-2026-10-02.md` — **all 13 action items are now closed** (2026-10-03):
- A3/A4 via D1 (header + Home).
- A6 via D2.
- A7 via D3 (parchment name scroll).
- A8 via D4.
- A9 via D5.
- A10 via D6.

Criticism #20 (phone header wrapping to two rows) is fixed. #21 (accessibility) is fixed: an axe WCAG 2 A/AA audit of every main screen, light and dark, at desktop and phone width went from 426 contrast failures to 0, and the unlabelled controls got labels.

### Other open items
- Apple sign-in: ~1 hour setup once an Apple Developer account exists; client secret must be
  regenerated every ≤6 months (decisions.md T5).
- Server-trusted economy: currencies/rating are still written directly by the client (T3).
- Supabase "leaked password protection" is **Pro-plan only**; the project is on Free (D12).
- Events have no live event system yet, so event-sourced cards can't be obtained.
- PixelLab monthly generation limit reached mid-batch (D15). 16 Map 8–10 cards and the Home sprites are still pending.

### Closed 2026-10-03
- **Discoveries cloud sync.** Hidden-card sightings now sync with the progress blob (merged, not overwritten), along with raid part attempts, raid reward claims (no double-claiming across devices) and recent opponents.
- **Live data + social migrations applied** (ghost decks, raid attempts, player progress; friends, invites, market).
- Raid P1 + P2 (The Goliath; the trench, played turn by turn), the Raid editor, and the Skirmish editor.
- Pack 1 + pack opening, card scaling, Home/Arena/Conquest redesigns, and Atmosphere packs. See `game-design-v40-addendum.md`.

### Closed 2026-10-02 (late)
- **Gladiator balance** — the enemy now crowns the card closest to ~1.15× your leader's
  attack+health (10× HP / 2× ATK rule unchanged), instead of always its biggest card.
- **Tutorial Quit** — tutorial skirmishes now have Quit; Home shows "Continue tutorial (Skirmish N
  of 6)" until the series is done.
- **Admin card edits publish live** — Supabase `card_overrides` (admin-only write, public read).
- **🧪 Test Kit** — looping 2-vs-3 field for testing a card's effects, VFX and SFX (Admin → Open
  Test Kit, or Play → 🧪 Test).

## Status update (2026-10-02 — live deploy, sign-in, battle modes, Swift, hand limit, art)
Shipped and live: Vercel production deploy with GitHub auto-deploy; Google sign-in with clear
signed-in state (profile avatar/name, top banner reminder after the tutorial only); Supabase RPC
hardening (anon access revoked, raid damage cap + cooldown, ranked rating clamp); battle modes
(Gravity/Open/Gladiator) on miniboss nodes; Swift passive and halves-only dodge rules (Swift,
Flying, Evade); 5-card hand limit with auto-pitch; splash art + PixelLab card art for the
Otter/Hummingbird factions, regenerated knights, and the first two maps' creatures. See
`game-design-v34-addendum.md` and `style-guideline.md` §9 (art direction) for details.

---

## Status update (2026-10-01, third batch — deck rarity limits, Custom/My-Attack/My-Health amount selector, and live in-match tooltips all shipped; GitHub push since resolved on 2026-10-01)

**Shipped and verified this batch:**

- **Deck-build rarity copy limits.** Rarity was purely cosmetic until now — a built deck could run
  20 copies of a single unlocked Legendary. New per-tier caps: Common/Starter 10, Uncommon/Quest 5,
  Rare 4, Very Rare/Super Rare 3, Epic/Heroic 2, Unique/Quest-Unique/Legendary/Mythic/Ancient 1.
  Enforced on the real deck builder's click-to-add and drag-to-add paths only (a card already over
  its cap because it was saved before this shipped isn't retroactively stripped — you just can't
  push it any higher) — the Sandbox/Myriad test-deck tool deliberately stays uncapped. Blocked
  attempts get the same red "deny-shake" feedback already used for "can't afford this card." The
  Reference tab's Rarity section now lists each tier's actual cap.
- **Custom/My-Attack/My-Health amount selector.** Deal Damage's old checkbox-only "=Attack" toggle
  is now a proper 3-way selector (Custom amount / = My Attack / = My Health), and the exact same
  selector is now offered on Heal too. Both read the card's own CURRENT (post-buff) stat at the
  moment the trigger fires.
- **Live in-match tooltips.** A card already on the battlefield now shows its ability text with any
  "=My Attack"/"=My Health" formula resolved to the actual computed number, highlighted in blue.
  The castle got a dedicated popover: live current/max HP, the Bramble's passive in plain English,
  and whether a one-shot passive has already fired this match.

**GitHub push** — was blocked in that session by its git proxy; resolved 2026-10-01 in a different
session that applied both patches (`bc37539`, `9bfe963`), pushed to `main`, and deployed to Vercel.

---

## Status update (2026-09-30, second batch — HUD/editor/Conquest polish shipped; Google SSO confirmed built; SonarQube-equivalent scan run)

Highlights (condensed — see this doc's prior saved versions for full detail): HUD resource pills
moved to sit above your own row and hidden when zero; card editor cleaned up (icon typed into a
large centered field, parenthetical hints stripped from labels, Attack/Health/Wait/Element then
Cost/Reward/Pitch ordering); the real "(1)/1" formatting bug traced to a second, previously-unknown
function (`describeEffects`) separate from the one already fixed; a genuine 🏹 badge regression
caught and fixed, plus three new badges; Conquest's "blank after clearing" bug traced to nodes
replacing their own icon with a bare checkmark, fixed to show both; Conquest nodes now display
their energy cost. Ran a Java-free SonarQube-equivalent scan (ESLint + eslint-plugin-sonarjs +
eslint-plugin-security): 141 errors (mostly cognitive-complexity flags on
`resolveCombat`/`renderVfxForEvent`/`renderMatchUI`), 447 mostly-benign security warnings.

(Earlier status updates trimmed from this working copy for length — full history lives in this
doc's prior saved versions and on the **Bramblewood — Open Items** microsite, which remains the
canonical item-by-item tracker.)
