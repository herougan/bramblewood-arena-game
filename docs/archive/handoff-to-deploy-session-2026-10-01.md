# Handoff: GitHub push + Vercel deploy (archived 2026-10-12)

Done on 2026-10-01: both patches were applied and pushed to `main`, and Vercel serves the game at https://bramblewood-arena.vercel.app, deploying automatically on every push.

Still open from that note:
- Google OAuth Client ID/Secret in Supabase (Authentication → Providers → Google), which only you can enter.
- Supabase security: 5 `SECURITY DEFINER` RPC functions callable by `anon` (`decrement_raid_boss_hp`, `find_ranked_match`, `cancel_ranked_queue`, `abandon_live_match`, `report_live_match_result`); tighten to `authenticated` or rate-limit.
- No custom Vercel Firewall rate limits.
