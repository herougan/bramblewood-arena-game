# Network scale plan (2026-11-12, package NET1)

Owner 00:43: "support infra that supports 10,000 concurrent players".

## Today (measured)
Built page in Chromium against a fake Supabase sized like the live tables; live table stats and 24 h of edge logs (read-only).
- **Load, signed in:** 19 requests, 324 KB; card_overrides alone 287 KB (half unread snapshots). 4 realtime channels, one the global presence channel `bw-online`.
- **Idle:** 4.3 requests/min visible, 1.4 hidden; every 3 minutes the raid bars re-read all 434 attempts (94 KB).
- **One fight end:** 122 KB up: the whole collection (468 card rows) written twice.
- **Live DB:** 416,602 row writes on player_card_unlocks for 936 rows. One background tab a day: 346 raid and 346 world-event reads (+344 CORS preflights), 257 heartbeats.
- **Static:** index.html is 5.1 MB gzip, downloaded again after every release.

## The 10,000 model
All signed in, 30-minute sessions. Published limits (supabase.com/docs/guides/realtime/limits, supabase.com/pricing, vercel.com/docs/limits; re-check before upgrading). We are on Supabase Free, Vercel Hobby.

| Limit | Free / Hobby | Pro | Today's client at 10,000 |
|---|---|---|---|
| Realtime connections | 200 | 500; 10,000 spend cap off | 10,000 |
| Realtime messages/s | 100 | 500; 2,500 | ~111,000 (presence, N²/900) |
| Realtime messages/month | 2 M | 5 M, then $2.50/M | billions |
| Egress | 5 GB | 250 GB, then $0.09/GB | TBs |
| Vercel transfer/month | 100 GB | 1 TB | 5 MB a player a release |

**First limit: Realtime.** Each join and leave on `bw-online` went to everyone online (traffic grows with the square of the players): past 100 messages/s at ~300 signed-in players, past the Free 2 M/month at ~25 on average, and the 200-connection cap at 200. Next: Vercel Hobby's 100 GB, ~20,000 page downloads a month (~650 daily players with daily releases). Writes too: 800-row upserts mean ~44,000 row writes/s at 10,000 (no published figure; load-test before buying compute).

## What NET1 changed (client)
- **No presence channel.** A friend is online if seen in the last 5 minutes (the heartbeat). Requests and invites share one channel: 4 channels → 2.
- **card_overrides:** kept on the device; a load reads ids + times (18 KB, was 287 KB), then only changed rows. Players poll every 5 minutes, admins every 30 s.
- **Raid bars:** one full read, then only new rows.
- **Card rows:** only changed rows, one write at a time.
- **Hidden tab:** no heartbeat; world check every 9 minutes (inside the 10-minute fall reward). Idle: 4.3 → 2.3 requests/min visible, 1.4 → 0.3 hidden.
- Progress blob at most once a minute plus on hide; world-event cut-off to the hour; ranked queue backs off to 4 s.
- vercel.json: hashed assets immutable for a year.

At 10,000: ~380 requests/s, 10,000 realtime connections, no fan-out.

## Needs the owner
1. **"apply it"** for `supabase/proposed/20261112_net1_scale.sql`: 5 indexes, 19 policies with `(select auth.uid())`, an updated_at trigger. No rows change.
2. **Plans (your call, nothing bought):** Supabase Pro ($25/month) before ~200 signed-in players at once; past 500, spend cap off ($10 per 1,000 peak connections) and more compute after a load test. Vercel Pro ($20/month a seat) as transfer nears 100 GB; Hobby is non-commercial only.
3. **Decisions:** (a) realtime only on Friends / Arena / co-op screens, invites checked every 60 s elsewhere (~10x fewer connections); (b) split index.html into hashed files so a release re-downloads only what changed; (c) ghost opponents as a server-picked sample (a sign-in reads up to 3,000 ghost rows); (d) public config as a CDN-cached file.
