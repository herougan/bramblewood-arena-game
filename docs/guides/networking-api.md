# Networking and API cheat sheet (2026-11-11, GUIDE1)

The only backend is Supabase project `xjctfwobcsyiztecutrb` (Postgres + Auth + Realtime). No servers or microservices of ours; the one Edge Function is proposed, not deployed. Hard rule: live writes only after the owner says "apply it" for that change; read-only SQL is fine.

## Client
- `initCloudSync()` makes `sbClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {global: {fetch: ui17CountingFetch}})`. The anon key in the source is the public one; RLS is what protects the data. Never print any other key or token.
- Identity globals: `cloudUserId` (auth uid or null), `cloudIsAnonymous`, `cloudReady`. `isSignedIn()` = a real, non-anonymous account.
- Every browser gets an anonymous session on first load. Email + password: `cloudLinkEmail(email, password)` (upgrades the anonymous user, or signs up). Google sign-in only on http(s) pages (`isHostedOnline()`), so not in Electron.
- Gate an online feature with `requireSignIn(reason, onSuccess)`.
- Admin: the server function `is_app_admin()` (table `app_admins`) decides; the client caches it in `cloudCardAdmin`. `adminModeEnabled` is only the UI switch.

## Save model (offline-first)
- `localStorage` is the source for a guest. Cloud rows are a copy, pushed only when `isSignedIn()`.
- Progress: `progressSnapshot()` = the `PROGRESS_KEYS` localStorage values as one JSON blob in `player_progress.data`. `livePullProgress()` at sign-in, `livePushProgress()` every 20 s.
- Guard (`SAVE_GUARD_UI12` block, `tests/ui12-save-guard-2026-10-31.js`): `progressScore()` counts things that only grow (cleared fights, tutorial flags, XP); a blob with a lower score never replaces a richer one, whatever the timestamps. Admin resets set `bw_progress_shrink_ok` once.
- Other synced state, each with its own push: `cloudPushCurrencies` (`player_currencies`), `cloudPushCardLevels` (`player_card_unlocks`), `cloudPushDecks` (`player_decks`, tombstones via `deleted_at`), `cloudPushRating` (`profiles.rating`). `cloudPullState()` reads them back.
- New saved key: add it to `PROGRESS_KEYS` if it must follow the player across devices; otherwise it stays on this browser.

## Tables the client uses (`grep -n "from('<table>')" arena_app.js`)
| Area | Tables |
|---|---|
| Player | `profiles` (display_name, rating), `player_currencies` (gold, gems, dust, metal, raid_points, raid_shards, blossoms), `player_card_unlocks` (card_id, level, copies), `player_decks`, `player_progress` (data, updated_at), `match_history` |
| Live config | `card_overrides` (id, data jsonb, deleted, deleted_snapshot, updated_at, updated_by): anyone reads; insert / update / delete need `is_app_admin()` |
| Raid | `raid_bosses`, `raid_attempts`, `raid_week_attempts`, `raid_restarts`, `raid_instance_members` |
| Social | `guilds`, `guild_members`, `guild_skill_levels`, `guild_seeds`, `friendships`, `match_invites`, `market_listings`, `world_events`, `feedback` |
| Multiplayer | `live_matches`, `coop_rooms`, `ghost_decks` |

Server-only tables (written by SQL functions): `fight_sessions`, `reward_rules`, `rate_limits`, `gain_budgets`, backups (`card_overrides_backup_<date>`, `player_progress_backup`).

## card_overrides rows
- A card id row: a live edit of that card (`liveCards`, `liveDeletes`), applied over `cards.json` at load. Fold into `canonical/cards.json` (`tools/fold_server_overrides_2026_10_19.js`, `tools/hub/apply_balance_edits.js`, then `python3 tools/fold_skill_params_2026_11_07.py`), then propose a clearing SQL.
- `__cfg:*` rows are admin config, routed by `applyCloudCfgRow`: `__cfg:map-layout:<map>`, `__cfg:map-nodes:<map>`, `__cfg:map-pools:<map>` (fold: `tools/fold_map_pools.js`), `__cfg:map-picks:<map>`, `__cfg:raid:<id>`, `__cfg:tutorial`, `__cfg:dialogues`, `__cfg:shop-packs`, `__cfg:forge-tiers`.
- Admin writes: `cloudWriteCardOverride(id, row)` (upsert; toast on failure).
- Polling, not realtime: `pollCloudOverrides()` every 30 s while the tab is visible and on return to the tab; rows newer than `cloudOverridesSince` redraw the map or Codex.

## RPCs (`sbClient.rpc(name, args)`)
- Fights and rewards: `start_fight`, `submit_fight`, `claim_fight_reward`.
- Live PvP: `find_ranked_match`, `cancel_ranked_queue`, `report_live_match_result`, `abandon_live_match`, `send_match_invite`, `respond_match_invite`, `cancel_match_invite`.
- Co-op and raid: `join_coop_room` / `join_coop_room_v2`, `leave_coop_room`, `promote_coop_host`, `join_raid_instance`, `decrement_raid_boss_hp`.
- Social: `send_friend_request`, `respond_friend_request`, `block_player`, `search_players`, `rename_guild`, `upgrade_guild_skill`.
- Market: `rpcV2('buy_listing', ...)` and `rpcV2('create_listing', ...)` try `<name>_v2` first; `claim_market_proceeds`, `cancel_listing`.
- Admin: `is_app_admin`, `admin_overview`, `admin_list_players`, `admin_user_list`, `admin_raid_damage`, `admin_restart_raid`.

## Realtime channels
`bw-online` (presence), `bw-friends-<uid>`, `bw-invites-<uid>`, `bw-coop-inv-<uid>`, `live-match-<matchId>` (broadcast; the host's engine is authoritative, see the "Ranked 1v1 Live" block above `startLiveRankedMatch`).

## Error handling (copy these patterns)
- Destructure `{data, error}`; never let a Supabase call throw into a renderer. Wrap in `try{}catch(e){}` and keep the game playable.
- A missing table or column means the migration is not live yet: `liveTableMissing(error)`, `cloudCopiesColumnMissing(error)`, then fall back to local behaviour.
- A missing function: `rpcMissing(err)` (codes `PGRST202`, `42883`); `rpcV2` falls back to the old RPC.
- Player-facing message: `socialErrText(err)` (or a `TX` key), never the raw error. Show "error + Retry", not an empty "nothing here yet".
- Request errors are counted by `ui17CountingFetch` (Admin → Players).
- Offline: single-player works without the network; every cloud call fails closed.

## Changing the database
1. Inspect first: read-only `select` / the Supabase MCP `list_tables`, `list_migrations`, `execute_sql` (select only). Some files in `supabase/migrations/` still say "NOT applied" in their header: check the live state, not the folder.
2. Write the change as `supabase/proposed/<YYYYMMDD>_<what>.sql`: RLS on for new tables, policies named for what they allow, `security definer` functions with a fixed `search_path`, grants revoked from `anon` / `authenticated` where players must not write.
3. Client code must work before and after it is applied (the `rpcMissing` / `liveTableMissing` fallbacks).
4. Ask the owner; apply only after "apply it" for that change. Back up changed rows first into a backup table with RLS on and anon / authenticated revoked.
5. Clearing folded `card_overrides` rows follows the same path (examples: `supabase/proposed/20261022_clear_map_pools.sql`, `supabase/oneoff/20261106_clear_folded_overrides_4.sql`).

## Edge Functions
Only `supabase/proposed/functions/verify-fight/index.ts` (proposed, not deployed): it would replay a submitted fight. It is blocked on a DOM-free match driver (the turn loop lives in `arena_app.js`).

## Network rules for new code
- A new outside origin needs a `connect-src` entry in the CSP of `vercel.json`; the owner decides.
- Poll at 20-30 s or slower, only while `!document.hidden`.
- Never put the owner's email or any personal data in a request, header or URL.
