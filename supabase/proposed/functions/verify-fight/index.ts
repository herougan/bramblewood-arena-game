// PROPOSED, NOT DEPLOYED (2026-10-17, docs/platform-roadmap-2026-10-17.md §3, tier 2 step S5).
// Supabase Edge Function: replays a handed-in fight and marks it 'verified' or 'rejected'.
//
// Trigger: a Database Webhook on fight_sessions UPDATE where status = 'submitted' (or a cron that sweeps them).
// Runs with the service role, so it may update fight_sessions; players can't call it to change anything.
//
// The missing piece is MATCH_DRIVER: bramblewood-engine.js resolves combat, but the turn loop that applies the
// player's recorded moves and the enemy AI's turns lives in arena_app.js today. Step S5 moves that loop into a DOM-free
// module (bramblewood-match.js) that the game, the tests and this function all import. Until then this function
// can only check cheap things (seed matches, card-data hash matches, round count is plausible).
import { createClient } from "npm:@supabase/supabase-js@2";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
// Deployed next to this file by the build (copies of the repo files, same commit as the live index.html):
const engine = require("./bramblewood-engine.js");
const cards = JSON.parse(await Deno.readTextFile(new URL("./cards.json", import.meta.url)));
// const match = require("./bramblewood-match.js");  // step S5

const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

type Session = { id: string; seed: number; deck: unknown; cards_hash: string | null; mode: string; node_key: string | null;
  status: string; transcript: { v: number; actions: unknown[] } | null; result: { winner?: number; round?: number; seed?: number; cardsHash?: string } | null };

const REPLAY_READY = false; // flip once bramblewood-match.js exists; until then a pass leaves the fight 'submitted'

async function verify(s: Session): Promise<{ ok: boolean; reason: string }> {
  if (!s.result || !s.transcript) return { ok: false, reason: "nothing handed in" };
  if (s.result.seed != null && (Number(s.result.seed) >>> 0) !== (Number(s.seed) >>> 0)) return { ok: false, reason: "seed mismatch" };
  if (s.cards_hash && s.result.cardsHash && s.cards_hash !== s.result.cardsHash) return { ok: false, reason: "card data changed mid-fight" };
  if ((s.result.round ?? 0) < 1 || (s.result.round ?? 0) > 200) return { ok: false, reason: "implausible round count" };
  if ((s.transcript.actions?.length ?? 0) > 2000) return { ok: false, reason: "transcript too long" };
  // Step S5: const replay = match.replay({ engine, cards, seed: s.seed, deck: s.deck, mode: s.mode, node: s.node_key, actions: s.transcript.actions });
  //          if (replay.winner !== s.result.winner) return { ok: false, reason: `replay winner ${replay.winner}` };
  void engine; void cards;
  return { ok: true, reason: "basic checks only (no replay yet)" };
}

Deno.serve(async (req) => {
  const body = await req.json().catch(() => ({}));
  const id: string | undefined = body?.record?.id ?? body?.id;
  if (!id) return new Response("no session id", { status: 400 });
  const { data: s, error } = await sb.from("fight_sessions").select("*").eq("id", id).single();
  if (error || !s) return new Response("not found", { status: 404 });
  if (s.status !== "submitted") return new Response("skip: " + s.status);
  const v = await verify(s as Session);
  // Without a replay, a pass is not proof: only failures change the status (pvp/raidOnline rewards stay unpaid).
  const status = !v.ok ? "rejected" : REPLAY_READY ? "verified" : "submitted";
  await sb.from("fight_sessions").update({ status, reason: v.reason }).eq("id", id).eq("status", "submitted");
  return Response.json(v);
});
