# Ads in Bramblewood Arena: considerations (2026-10-18)

The owner's note, 17:28: *"Ads in my game - for now, no idea. But maybe in some sections? Just consideration for now."*

This page is for thinking it through. It doesn't add any code. Nothing is decided.

## The short version

- If ads come in, they should be **opt-in rewarded ads**. The player presses "Watch an ad for X", and they always get X.
- **Never in a battle, never forced, never between fights by surprise.** **None at all for premium players**, the same supporters the daily-dungeon Sweep is for (lifetime spend over 10 USD; see `isPremiumPlayer()`).
- **Web only, for now.** Steam doesn't allow ad-based models in Steam games (see below). The Steam build should ship with no ads. The mobile app stores allow rewarded ads.
- Each ad reward should be small and capped per day. It should match what the game already gives for free, so an ad saves time and never decides a fight.

## Where an ad could fit without hurting the game

| Spot | What the ad would give | Why it fits | Cap (suggested) |
|---|---|---|---|
| **Field kit, after the day's 3 win items** | +1 field-kit item (random, same weights as `SKIRMISH_KIT_WEIGHT`) | Items are for being stuck on a floor (owner, 17:28). One more a day is a small push, and the 2-a-fight limit still holds. | 1 a day |
| **Energy panel** | +5 ⚡, next to the existing free +5 once a day | It already has a "free Energy" button, so the ad is a second, clearly marked one. | 1–2 a day |
| **Second chance after a loss** | Fight the same Conquest fight again at no Energy cost | It softens a loss without changing the fight. Not on the Babel Spire, because a lost Spire floor already refunds its Energy. | 1 a day |
| **Daily dungeon key** | +1 🗝️ when you are out | Keys already come back on a win, so this only helps a player who lost today. | 1 a day, never above the 3-key cap |
| **Results screen, doubled Leaves** | ×2 Maple Leaves on a clear-again win | This is common in mobile games. It has a real cost to the economy, so it is the last one to try. | 3 a day |

### Places ads should never go

- During a fight, or on the VS opener, end sign or results animation.
- In PvP, Raids, the Arena or the tutorial.
- Interstitials (full-screen ads that come up on their own between screens).
- Banners over the board or the hand.
- Anything a child could press by mistake. The age rating and COPPA/GDPR-K questions come with that.
- Anything for premium players.

## Ad options in general terms

### Web (the current site)

- **Rewarded video / rewarded interstitial SDKs for HTML5 games.**
  - Google Ad Manager's rewarded ads for web, AdinPlay, and similar.
  - Game portals such as CrazyGames and Poki have their own SDKs, with rewarded ads built in. They only work when the game is hosted on that portal.
- **Display banners** (AdSense and others). These pay little in a game and clash with the art style. Not recommended.
- **Consent:**
  - Players in the EU, UK and some US states need a consent banner (a CMP certified under IAB TCF v2.2) before ads that personalise or set cookies are allowed.
  - Without consent, only non-personalised ads, which pay less.
  - The banner itself is a cost to the first-time experience.
- **Ad blockers** stop many web ads. The reward button needs a "no ad available right now" state that doesn't break anything.
- **Content Security Policy:**
  - An ad SDK means loading third-party scripts. The site's Content-Security-Policy (`vercel.json`) would have to let them in.
  - That code would then run on the same page as the card-data and fight checks. Expect a security review.

### Desktop (Steam / Electron)

- **Steam:**
  - Since February 2025, Valve's rules ban ad-based business models in Steam games. That covers forced ads, and rewards for watching ads.
  - Product placement and cross-promotion (for example, our other games) are allowed.
  - **Plan: no ads in the Steam build.** The paid or premium version is the business model there.
  - Recheck the current Steamworks rules before launch.
- Outside Steam (itch.io, a direct download), ads are allowed. Few desktop players expect them, though, and desktop ad SDKs are rare.

### Mobile (if the game goes to the app stores later)

- **Rewarded video is the norm.** Typical SDKs: Google AdMob, AppLovin MAX, Unity Ads, ironSource/LevelPlay. Mediation picks the best-paying network per view.
- Both stores need privacy labels.
- On iOS, App Tracking Transparency (ATT) asks before tracking. Without it, ads pay less.
- Ads aimed at children have their own rules (Google Families, Apple Kids).

## Trade-offs

- **Money:**
  - Rewarded ads pay for each view watched.
  - A small web game with modest traffic earns little from them. A few ad views a day per active player is pocket money until there are many players.
  - Supporters (premium) are worth far more per player. Ads mainly reach players who would never pay.
- **Feel:**
  - The game's identity is a cosy, hand-made card game.
  - Opt-in rewarded ads keep that, as long as nothing ever pops up by surprise.
  - Forced ads would cut against it, and against the "free to play, fair to play" line the PvP and raids rely on.
- **Fairness:** ad rewards must stay out of PvP and the Arena's rating, or a player could gain by watching ads. All five spots above are PvE only.
- **Cost to build:**
  - An SDK, a consent banner, a "no ad available" path and a server-side daily cap.
  - The cap must be server-side, because a client-side cap can be edited, like the rest of `player_progress`.
  - Then testing on each platform. Roughly a few days of work, plus the security review.
- **Premium interplay:**
  - "No ads" is a classic supporter perk.
  - Premium players could get the ad rewards without the ad (for example, the extra kit item each day). That makes the Premium line clearer, but it is more pay-to-win.

## Decisions for the owner (none needed now)

1. Ads at all, or only on the web build?
2. If yes, which of the five spots first? The suggested order is the field-kit item, then Energy, then the second chance.
3. Should premium players get the ad rewards without the ad, or just no ads?
4. A web portal (CrazyGames / Poki, their SDK and their audience) or our own site with an ad network and a consent banner?
